import { supabase, isSupabaseConfigured } from '../supabase/client';
import { StudyDocument, Course, AcademicValidationResult } from '../../types';
import { DocumentParser } from '../documents/parser';
import { StorageService } from '../storage/db';
import { extractDocumentContent, ExtractedDocumentContent } from '../documents/textExtractor';
import { validateFileFormat, classifyAcademicContent } from '../ai/academicClassifier';

export class AcademicRejectionError extends Error {
  classification: 'non_academic' | 'uncertain';
  confidence: number;
  materialType?: string;
  reason: string;

  constructor(reason: string, classification: 'non_academic' | 'uncertain', confidence: number, materialType?: string) {
    super(reason);
    this.name = 'AcademicRejectionError';
    this.reason = reason;
    this.classification = classification;
    this.confidence = confidence;
    this.materialType = materialType;
  }
}

export class DocumentService {
  /**
   * Complete, authoritative upload and academic verification pipeline.
   * STRICT RULE: ONLY genuine study/academic materials are persisted.
   * Invalid, non-academic, duplicate, or unverified documents are REJECTED IMMEDIATELY
   * and NEVER saved to Supabase Storage, PostgreSQL, or local storage.
   */
  static async uploadAndProcessDocument(
    file: File,
    onProgress?: (stage: StudyDocument['status'], percent: number) => void
  ): Promise<{ course: Course; document: StudyDocument; validation: AcademicValidationResult }> {
    // ----------------------------------------------------
    // STAGE 1: LEVEL 1 FILE VALIDATION
    // ----------------------------------------------------
    onProgress?.('uploading', 15);
    const formatCheck = validateFileFormat(file);
    if (!formatCheck.isValid) {
      throw new Error(formatCheck.error || 'Invalid file format');
    }

    // ----------------------------------------------------
    // STAGE 2: DOCUMENT CONTENT EXTRACTION
    // ----------------------------------------------------
    onProgress?.('reading', 35);
    let extracted: ExtractedDocumentContent;
    try {
      extracted = await extractDocumentContent(file);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`We couldn't read this file: ${errMsg}. Please check that the document is not corrupted and try again.`);
    }

    // ----------------------------------------------------
    // STAGE 3: DUPLICATE DETECTION CHECK
    // ----------------------------------------------------
    if (StorageService.hasDocumentHash(extracted.hash)) {
      throw new Error('This study material has already been added.');
    }

    // Also check Supabase DB for duplicate hash if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (userId) {
          const { data: existingDoc } = await supabase
            .from('documents')
            .select('id, name')
            .eq('user_id', userId)
            .eq('content_hash', extracted.hash)
            .maybeSingle();

          if (existingDoc) {
            throw new Error('This study material has already been added.');
          }
        }
      } catch (dupErr) {
        if (dupErr instanceof Error && dupErr.message.includes('already been added')) {
          throw dupErr;
        }
        // ignore other transient query checks
      }
    }

    // ----------------------------------------------------
    // STAGE 4: LEVEL 2 ACADEMIC CONTENT CLASSIFICATION
    // ----------------------------------------------------
    onProgress?.('understanding', 65);
    const validation = await classifyAcademicContent(file.name, extracted);

    if (!validation.isAcademic || validation.classification !== 'academic') {
      // STRICT SECURITY REQUIREMENT:
      // Abort immediately without storing ANY files in Supabase Storage or Database.
      throw new AcademicRejectionError(
        validation.reason,
        validation.classification as 'non_academic' | 'uncertain',
        validation.confidence,
        validation.materialType
      );
    }

    // ----------------------------------------------------
    // STAGE 5: STRUCTURE COURSE & STUDY UNITS
    // ----------------------------------------------------
    onProgress?.('organizing', 85);
    const { course, document } = DocumentParser.buildCourseFromValidatedContent(
      file,
      extracted,
      validation,
      onProgress
    );

    // ----------------------------------------------------
    // STAGE 6: PERSIST ONLY APPROVED MATERIAL IN SUPABASE
    // ----------------------------------------------------
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          // 6a. Upload to Supabase Storage only after approval
          const fileExt = file.name.split('.').pop() || 'pdf';
          const filePath = `${userId}/${Date.now()}_${extracted.hash.slice(0, 8)}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage.from('study_materials').upload(filePath, file);
          if (uploadErr) {
            console.warn('Storage bucket upload warning:', uploadErr.message);
          }

          // 6b. Insert document row with full academic metadata
          const { data: docRow, error: docErr } = await supabase
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
              concepts_extracted: document.conceptsExtracted,
              content_hash: extracted.hash,
              material_type: validation.materialType,
              subject: validation.subject,
              academic_confidence: validation.confidence,
              verification_status: 'approved'
            })
            .select()
            .single();

          if (docRow && !docErr) {
            document.id = docRow.id;

            // 6c. Insert document chunks into PostgreSQL for RAG
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

            // 6d. Insert course row
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
        console.error('Supabase persistence error, relying on isolated local storage:', err);
      }
    }

    // ----------------------------------------------------
    // STAGE 7: SAVE IN ACTIVE WORKSPACE STORAGE
    // ----------------------------------------------------
    StorageService.addCourse(course);
    StorageService.addDocument(document);

    onProgress?.('ready', 100);

    return { course, document, validation };
  }

  static async deleteDocument(docId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          const { data: docRow } = await supabase
            .from('documents')
            .select('storage_path')
            .eq('id', docId)
            .eq('user_id', userId)
            .single();

          if (docRow?.storage_path) {
            await supabase.storage.from('study_materials').remove([docRow.storage_path]);
          }

          await supabase.from('documents').delete().eq('id', docId).eq('user_id', userId);
        }
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }

    StorageService.deleteDocument(docId);
  }
}
