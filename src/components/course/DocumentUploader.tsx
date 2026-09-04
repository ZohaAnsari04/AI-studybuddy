import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
  BookOpen,
  X,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { StudyDocument, Course } from '../../types';
import { DocumentService } from '../../lib/services/documentService';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface DocumentUploaderProps {
  documents: StudyDocument[];
  onCourseCreated: (course: Course, doc: StudyDocument) => void;
  onDocumentDeleted?: (docId: string) => void;
  onNavigate: (tab: string) => void;
}

const MAX_FILE_SIZE_MB = 20;

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onCourseCreated,
  onDocumentDeleted,
  onNavigate
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synced local documents list state for instant UI re-rendering
  const [docsList, setDocsList] = useState<StudyDocument[]>(documents);

  useEffect(() => {
    setDocsList(documents);
  }, [documents]);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<StudyDocument['status']>('ready');
  const [progress, setProgress] = useState(0);
  const [latestResult, setLatestResult] = useState<{ course: Course; document: StudyDocument } | null>(null);

  // Modal Delete State
  const [docToDelete, setDocToDelete] = useState<StudyDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate File
  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);

    // Check size limit
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`This file is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    // Check type/extension
    const nameLower = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || nameLower.endsWith('.pdf');
    const isDocx = file.type.includes('word') || nameLower.endsWith('.docx') || nameLower.endsWith('.doc');
    const isTxt = file.type.includes('text') || nameLower.endsWith('.txt');

    if (!isPdf && !isDocx && !isTxt) {
      setErrorMsg("This file type isn't supported. Please upload a PDF, DOCX, or TXT document.");
      return;
    }

    setSelectedFile(file);
    setLatestResult(null);
  };

  // Native file input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Drag & drop handlers
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleOpenNativePicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleRemoveSelectedFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Analyze Material Action via DocumentService
  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setLatestResult(null);
    setErrorMsg(null);

    try {
      const { course, document } = await DocumentService.uploadAndProcessDocument(selectedFile, (stage, percent) => {
        setCurrentStage(stage);
        setProgress(percent);
      });

      setLatestResult({ course, document });
      setSelectedFile(null);

      // Instantly update local list state
      setDocsList((prev) => [document, ...prev.filter((d) => d.id !== document.id)]);
      onCourseCreated(course, document);
    } catch (err) {
      console.error(err);
      setErrorMsg("We couldn't process this document. Please try selecting another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Delete Handler via DocumentService
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);

    const targetId = docToDelete.id;
    const deletedDocName = docToDelete.name;

    try {
      // 1. Delete document record, chunks, and linked courses from DB/Storage
      await DocumentService.deleteDocument(targetId);

      // 2. Clear latestResult if it belonged to deleted document
      if (latestResult?.document.id === targetId) {
        setLatestResult(null);
      }

      // 3. IMMEDIATELY update local documents list state for instant UI re-render
      setDocsList((prev) => prev.filter((d) => d.id !== targetId));

      // 4. Show success toast notification
      setToastMsg(`${deletedDocName} was deleted.`);
      setTimeout(() => setToastMsg(null), 3500);

      // 5. Close modal
      setDocToDelete(null);

      // 6. Notify parent component to update global application state
      if (onDocumentDeleted) {
        onDocumentDeleted(targetId);
      } else {
        onCourseCreated({} as Course, {} as StudyDocument);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to delete this document. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto relative">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf,.docx,.doc,.txt"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload study material"
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Upload Your Study Material
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your syllabus, notes, or course documents and let AI turn them into a personalized study space.
        </p>
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ERROR ALERT BADGE */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DROP ZONE OR SELECTED FILE PREVIEW */}
      {!selectedFile && !isProcessing ? (
        <GlassCard
          glowOnHover={false}
          className={`border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 shadow-2xl scale-[1.01]'
              : 'border-slate-800 hover:border-cyan-500/40'
          }`}
          onClick={handleOpenNativePicker}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30">
              <UploadCloud className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Drop your syllabus here
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX or TXT (Max {MAX_FILE_SIZE_MB} MB)
              </p>
            </div>

            <div className="text-xs text-slate-500 font-semibold">or</div>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<UploadCloud className="w-4 h-4" />}
              onClick={handleOpenNativePicker}
            >
              Browse Files
            </Button>
          </div>
        </GlassCard>
      ) : selectedFile && !isProcessing ? (
        /* SELECTED LOCAL FILE PREVIEW CARD */
        <GlassCard className="border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Ready to analyze
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedFile.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatBytes(selectedFile.size)} • {selectedFile.name.split('.').pop()?.toUpperCase()} Document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleOpenNativePicker}
              >
                Choose Another File
              </Button>
              <button
                type="button"
                onClick={handleRemoveSelectedFile}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Clicking <strong className="text-slate-200">Analyze Material</strong> will extract topics, create units, and ground NOVA doubt solving.
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              icon={<Sparkles className="w-5 h-5" />}
              onClick={handleStartAnalysis}
            >
              Analyze Material
            </Button>
          </div>
        </GlassCard>
      ) : null}

      {/* MULTI-STAGE PROCESSING ANIMATION STATE */}
      {isProcessing && (
        <GlassCard className="border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
            <div>
              <h4 className="text-lg font-bold text-white tracking-wide">
                Stage: {currentStage === 'uploading' ? 'Uploading...' : currentStage === 'reading' ? 'Reading your material...' : currentStage === 'understanding' ? 'Understanding the content...' : currentStage === 'organizing' ? 'Preparing your study space...' : 'Ready!'}
              </h4>
              <p className="text-xs text-cyan-300">
                NOVA is reading document text, extracting topics, and structuring your units...
              </p>
            </div>
            <span className="ml-auto text-xl font-extrabold text-white">{progress}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${progress >= 20 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              1. Uploading
            </div>
            <div className={`p-2.5 rounded-xl border ${progress >= 45 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              2. Reading
            </div>
            <div className={`p-2.5 rounded-xl border ${progress >= 70 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              3. Understanding
            </div>
            <div className={`p-2.5 rounded-xl border ${progress >= 90 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              4. Organizing
            </div>
          </div>
        </GlassCard>
      )}

      {/* SUCCESS RESULT SUMMARY CARD */}
      {latestResult && !isProcessing && (
        <GlassCard className="border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Course Created: {latestResult.course.title}</h3>
                <p className="text-xs text-slate-300">{latestResult.document.name} processed and indexed successfully.</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('course')}
            >
              Explore Course Space
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block">Detected Units</span>
              <span className="text-xl font-extrabold text-emerald-400">✓ {latestResult.document.unitsDetected} Units</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block">Topics Identified</span>
              <span className="text-xl font-extrabold text-cyan-400">✓ {latestResult.document.topicsIdentified} Topics</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block">Concepts Extracted</span>
              <span className="text-xl font-extrabold text-blue-400">✓ {latestResult.document.conceptsExtracted} Concepts</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block">Study Space</span>
              <span className="text-xl font-extrabold text-amber-400">✓ Ready</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* UPLOADED DOCUMENTS LIST */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Uploaded Study Documents ({docsList.length})
        </h3>

        {docsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docsList.map((doc) => (
              <GlassCard key={doc.id} className="border-slate-800 flex items-center justify-between p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{doc.name}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      {doc.sizeFormatted} • {doc.unitsDetected} Units • {doc.topicsIdentified} Topics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                    Grounded
                  </span>
                  <button
                    type="button"
                    onClick={() => setDocToDelete(doc)}
                    aria-label={`Delete ${doc.name}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    title="Delete document"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="border-slate-800 p-8 text-center bg-slate-950/60">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Your study space is empty</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Upload your syllabus or notes to start learning with NOVA.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<UploadCloud className="w-4 h-4" />}
              onClick={handleOpenNativePicker}
            >
              Upload Study Material
            </Button>
          </GlassCard>
        )}
      </div>

      {/* CONFIRMATION DELETE MODAL */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <GlassCard className="max-w-md w-full border-rose-500/40 p-6 space-y-5 bg-slate-950 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete document?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Are you sure you want to delete <strong className="text-white">{docToDelete.name}</strong>?
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  This will remove the document, its processed study units, and document chunk context from NOVA AI chat.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isDeleting}
                onClick={() => setDocToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                disabled={isDeleting}
                icon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
