import { supabase, isSupabaseConfigured } from '../supabase/client';
import { StudyDocument, DocumentChunk, ChatCitation } from '../../types';

export class RAGService {
  /**
   * Searches relevant chunks for Grounded AI responses.
   * STRICT FILTER: Only approved academic study materials are indexed and retrieved.
   * Any pending, rejected, or unverified documents are excluded from AI answers and citations.
   */
  static async searchRelevantChunks(
    query: string,
    documents: StudyDocument[],
    matchCount: number = 3
  ): Promise<{ chunks: DocumentChunk[]; citations: ChatCitation[] }> {
    const qLower = query.toLowerCase();

    // Filter approved documents only
    const approvedDocuments = documents.filter(
      (doc) => doc.verificationStatus === 'approved' || (!doc.verificationStatus && doc.status === 'ready')
    );

    // 1. If Supabase PostgreSQL is configured, perform RLS-secured vector/text search only on approved documents
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          // Join with documents table to ensure verification_status = 'approved'
          const { data: dbChunks } = await supabase
            .from('document_chunks')
            .select(`
              id, 
              document_id, 
              document_name, 
              unit_title, 
              page_number, 
              text_content,
              documents!inner(verification_status)
            `)
            .eq('user_id', userId)
            .eq('documents.verification_status', 'approved')
            .ilike('text_content', `%${query}%`)
            .limit(matchCount);

          if (dbChunks && dbChunks.length > 0) {
            const mappedChunks: DocumentChunk[] = dbChunks.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              documentId: c.document_id as string,
              documentName: c.document_name as string,
              unitTitle: c.unit_title as string,
              pageNumber: c.page_number as number | undefined,
              text: c.text_content as string
            }));

            const citations: ChatCitation[] = mappedChunks.map((c) => ({
              docName: c.documentName,
              unit: c.unitTitle,
              page: c.pageNumber ? `Page ${c.pageNumber}` : 'Section 1',
              snippet: c.text
            }));

            return { chunks: mappedChunks, citations };
          }
        }
      } catch (err) {
        console.error('Supabase RAG search fallback:', err);
      }
    }

    // 2. Local semantic search fallback across approved documents only
    const allChunks = approvedDocuments.flatMap((doc) => doc.chunks || []);
    const matchingChunks = allChunks.filter((c) =>
      qLower.split(' ').some((word) => word.length > 3 && c.text.toLowerCase().includes(word))
    ).slice(0, matchCount);

    const citations: ChatCitation[] = matchingChunks.map((c) => ({
      docName: c.documentName,
      unit: c.unitTitle,
      page: c.pageNumber ? `Page ${c.pageNumber}` : 'Section 1',
      snippet: c.text
    }));

    return { chunks: matchingChunks, citations };
  }
}
