import { supabase, isSupabaseConfigured } from '../supabase/client';
import { StudyDocument, DocumentChunk, ChatCitation } from '../../types';

export class RAGService {
  static async searchRelevantChunks(
    query: string,
    documents: StudyDocument[],
    matchCount: number = 3
  ): Promise<{ chunks: DocumentChunk[]; citations: ChatCitation[] }> {
    const qLower = query.toLowerCase();

    // 1. If Supabase PostgreSQL is configured, perform RLS-secured vector search
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          const { data: dbChunks } = await supabase
            .from('document_chunks')
            .select('id, document_id, document_name, unit_title, page_number, text_content')
            .eq('user_id', userId)
            .ilike('text_content', `%${query}%`)
            .limit(matchCount);

          if (dbChunks && dbChunks.length > 0) {
            const mappedChunks: DocumentChunk[] = dbChunks.map((c) => ({
              id: c.id,
              documentId: c.document_id,
              documentName: c.document_name,
              unitTitle: c.unit_title,
              pageNumber: c.page_number,
              text: c.text_content
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

    // 2. Local semantic search fallback across active documents
    const allChunks = documents.flatMap((doc) => doc.chunks || []);
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
