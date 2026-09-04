import { supabase, isSupabaseConfigured } from '../supabase/client';
import { StudyDocument, Course, DocumentChunk } from '../../types';
import { DocumentParser } from '../documents/parser';
import { StorageService } from '../storage/db';

export class DocumentService {
  static async uploadAndProcessDocument(
    file: File,
    onProgress?: (stage: StudyDocument['status'], percent: number) => void
  ): Promise<{ course: Course; document: StudyDocument }> {
    // 1. Parse File & Extract Structure locally
    const { course, document } = await DocumentParser.parseFileAndCreateCourse(file, onProgress);

    // 2. If Supabase is configured, persist in PostgreSQL & Storage
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          // Upload file to Supabase Storage bucket 'study_materials'
          const fileExt = file.name.split('.').pop();
          const filePath = `${userId}/${Date.now()}.${fileExt}`;
          await supabase.storage.from('study_materials').upload(filePath, file);

          // Insert document row
          const { data: docRow } = await supabase
            .from('documents')
            .insert({
              user_id: userId,
              name: document.name,
              size_bytes: file.size,
              mime_type: file.type || 'application/pdf',
              storage_path: filePath,
              status: 'ready',
              units_detected: document.unitsDetected,
              topics_identified: document.topicsIdentified,
              concepts_extracted: document.conceptsExtracted
            })
            .select()
            .single();

          if (docRow) {
            document.id = docRow.id;

            // Insert document chunks into PostgreSQL
            if (document.chunks && document.chunks.length > 0) {
              const chunkRows = document.chunks.map((c) => ({
                document_id: docRow.id,
                user_id: userId,
                document_name: document.name,
                unit_title: c.unitTitle,
                page_number: c.pageNumber || 1,
                text_content: c.text
              }));
              await supabase.from('document_chunks').insert(chunkRows);
            }

            // Insert course row
            const { data: courseRow } = await supabase
              .from('courses')
              .insert({
                user_id: userId,
                document_id: docRow.id,
                title: course.title,
                code: course.code,
                description: course.description,
                documents_count: 1,
                total_topics: course.totalTopics,
                mastered_topics: course.masteredTopics,
                progress_percent: course.progressPercent
              })
              .select()
              .single();

            if (courseRow) {
              course.id = courseRow.id;
            }
          }
        }
      } catch (err) {
        console.error('Supabase persistence fallback to local storage:', err);
      }
    }

    // 3. Always save in StorageService (isolated per active user session)
    StorageService.addCourse(course);
    StorageService.addDocument(document);

    return { course, document };
  }

  static async deleteDocument(docId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          // Get storage path before row deletion
          const { data: docRow } = await supabase
            .from('documents')
            .select('storage_path')
            .eq('id', docId)
            .eq('user_id', userId)
            .single();

          if (docRow?.storage_path) {
            await supabase.storage.from('study_materials').remove([docRow.storage_path]);
          }

          // RLS ensures only owned document and cascading chunks/courses are deleted
          await supabase.from('documents').delete().eq('id', docId).eq('user_id', userId);
        }
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }

    // StorageService handles local storage deletion
    StorageService.deleteDocument(docId);
  }
}
