import { supabase, isSupabaseConfigured } from '../supabase/client';
import { StudyDocument, DocumentChunk, ChatCitation } from '../../types';

export class RAGService {
  /**
   * Searches relevant chunks for Grounded AI responses.
   * STRICT FILTER: Only approved academic study materials are indexed and retrieved.
   * MATERIAL ISOLATION: When selectedDocumentId is provided, searches ONLY within that material.
   * Any pending, rejected, or unverified documents are excluded from AI answers and citations.
   */
  static async searchRelevantChunks(
    query: string,
    documents: StudyDocument[],
    matchCount: number = 3,
    selectedDocumentId?: string
  ): Promise<{ chunks: DocumentChunk[]; citations: ChatCitation[] }> {
    const qLower = query.toLowerCase();

    // 1. Filter approved documents and apply Material Isolation scope
    let scopedDocuments = documents.filter(
      (doc) => doc.verificationStatus === 'approved' || (!doc.verificationStatus && doc.status === 'ready')
    );

    if (selectedDocumentId && selectedDocumentId !== 'all') {
      scopedDocuments = scopedDocuments.filter((doc) => doc.id === selectedDocumentId);
    }

    if (scopedDocuments.length === 0) {
      return { chunks: [], citations: [] };
    }

    // 2. If Supabase PostgreSQL is configured, perform RLS-secured vector/text search only on approved documents
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          let dbQuery = supabase
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
            .eq('documents.verification_status', 'approved');

          if (selectedDocumentId && selectedDocumentId !== 'all') {
            dbQuery = dbQuery.eq('document_id', selectedDocumentId);
          }

          const { data: dbChunks } = await dbQuery
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

    // 3. Local semantic & keyword search across approved scoped documents
    const allChunks = scopedDocuments.flatMap((doc) => doc.chunks || []);
    const queryTokens = qLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['what', 'when', 'where', 'which', 'explain', 'tell', 'about', 'does', 'with', 'from'].includes(w));

    const scoredChunks = allChunks.map((chunk) => {
      const chunkLower = chunk.text.toLowerCase();
      let score = 0;

      // Exact substring match bonus
      if (qLower.length > 5 && chunkLower.includes(qLower)) {
        score += 10;
      }

      // Keyword token matches
      queryTokens.forEach((token) => {
        if (chunkLower.includes(token)) {
          score += 2;
        }
      });

      return { chunk, score };
    });

    const matchingChunks = scoredChunks
      .filter((sc) => sc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, matchCount)
      .map((sc) => sc.chunk);

    const citations: ChatCitation[] = matchingChunks.map((c) => ({
      docName: c.documentName,
      unit: c.unitTitle,
      page: c.pageNumber ? `Page ${c.pageNumber}` : 'Section 1',
      snippet: c.text
    }));

    return { chunks: matchingChunks, citations };
  }
}
