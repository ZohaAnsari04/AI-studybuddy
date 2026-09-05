import React, { useState, useRef } from 'react';
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
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  FileQuestion,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { StudyDocument, Course, AcademicValidationResult } from '../../types';
import { DocumentService, AcademicRejectionError } from '../../lib/services/documentService';
import { validateFileFormat, getMaxUploadSizeMB } from '../../lib/ai/academicClassifier';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface DocumentUploaderProps {
  documents: StudyDocument[];
  onCourseCreated: (course: Course, doc: StudyDocument) => void;
  onDocumentDeleted?: (docId: string) => void;
  onNavigate: (tab: string) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onCourseCreated,
  onDocumentDeleted,
  onNavigate
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Deleted IDs for instant optimistic UI deletion
  const [deletedDocIds, setDeletedDocIds] = useState<string[]>([]);

  // Filter approved documents only
  const docsList = documents
    .filter((d) => d.verificationStatus !== 'rejected')
    .filter((d) => !deletedDocIds.includes(d.id));

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<StudyDocument['status']>('ready');
  const [progress, setProgress] = useState(0);
  const [latestResult, setLatestResult] = useState<{ course: Course; document: StudyDocument; validation: AcademicValidationResult } | null>(null);

  // Modal Delete State
  const [docToDelete, setDocToDelete] = useState<StudyDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const maxFileSizeMB = getMaxUploadSizeMB();

  // Helper format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate File (Level 1 fast check)
  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    setLatestResult(null);

    const check = validateFileFormat(file);
    if (!check.isValid) {
      setErrorMsg(check.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
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

  // Analyze & Validate Material Action via DocumentService
  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setLatestResult(null);
    setErrorMsg(null);

    try {
      const { course, document, validation } = await DocumentService.uploadAndProcessDocument(selectedFile, (stage, percent) => {
        setCurrentStage(stage);
        setProgress(percent);
      });

      setLatestResult({ course, document, validation });
      setSelectedFile(null);
      onCourseCreated(course, document);
    } catch (err: unknown) {
      console.error('Upload validation error:', err);
      if (err instanceof AcademicRejectionError) {
        if (err.classification === 'uncertain') {
          setErrorMsg("We couldn't verify that this file is academic material. Please upload a clearer syllabus, notes, textbook, assignment, lecture document, or question paper.");
        } else {
          setErrorMsg(
            err.reason ||
            "This file doesn't appear to be study-related. AI Study Buddy only accepts academic material such as notes, syllabus, textbooks, assignments, lecture slides, and question papers."
          );
        }
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("We couldn't process this document. Please check that it is a valid academic file and try again.");
      }
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
      await DocumentService.deleteDocument(targetId);

      if (latestResult?.document.id === targetId) {
        setLatestResult(null);
      }

      setDeletedDocIds((prev) => [...prev, targetId]);

      setToastMsg(`"${deletedDocName}" was deleted.`);
      setTimeout(() => setToastMsg(null), 3500);

      setDocToDelete(null);

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
        accept=".pdf,.docx,.pptx,.txt,.md"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload study material"
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1 text-cyan-400">
          <GraduationCap className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Study Buddy Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Upload your study material
        </h1>
        <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
          Upload syllabus, notes, textbooks, assignments, question papers, lecture slides, and other academic material.
        </p>
      </div>

      {/* SUPPORTED ACADEMIC CONTENT BADGES & RESTRICTION NOTICE */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Accepted Academic Content:
          </span>
          <span className="text-[11px] font-medium text-amber-400/90 flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            Non-academic or unrelated files will be rejected.
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Syllabus',
            'Lecture Notes',
            'Textbooks',
            'Assignments',
            'Question Papers',
            'Revision Material',
            'Academic Presentations',
            'Lab Manuals'
          ].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 font-medium"
            >
              <span className="text-emerald-400 font-bold">✓</span> {item}
            </span>
          ))}
        </div>
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

      {/* REJECTION / ERROR ALERT BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-sm flex items-start justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-100 block">File Not Accepted</span>
              <p className="text-xs text-rose-200/90 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white p-1">
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
                Drop your study material here
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, PPTX, TXT, MD (Max {maxFileSizeMB} MB)
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
                  Ready to verify & process
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
              Clicking <strong className="text-slate-200">Verify & Analyze Material</strong> will check academic relevance, extract topics, and prepare your study workspace.
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              icon={<Sparkles className="w-5 h-5" />}
              onClick={handleStartAnalysis}
            >
              Verify & Analyze Material
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
                {currentStage === 'uploading'
                  ? 'Uploading...'
                  : currentStage === 'reading'
                  ? 'Reading document...'
                  : currentStage === 'understanding'
                  ? 'Checking study relevance...'
                  : currentStage === 'organizing'
                  ? 'Preparing your study material...'
                  : 'Finalizing...'}
              </h4>
              <p className="text-xs text-cyan-300">
                {currentStage === 'understanding'
                  ? 'Verifying that this file is genuine study material and not unrelated content...'
                  : 'Extracting content, building concept units, and grounding NOVA AI tutor...'}
              </p>
            </div>
            <span className="ml-auto text-xl font-extrabold text-white">{progress}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${progress >= 15 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              1. Uploading...
            </div>
            <div className={`p-2.5 rounded-xl border ${progress >= 35 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              2. Reading document...
            </div>
            <div className={`p-2.5 rounded-xl border ${progress >= 65 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              3. Checking study relevance...
            </div>
            <div className={`p-2.5 rounded-xl border ${progress >= 85 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              4. Preparing study material...
            </div>
          </div>
        </GlassCard>
      )}

      {/* UPLOADED MATERIAL SUMMARY / CENTRAL LEARNING PAGE */}
      {latestResult && !isProcessing && (
        <GlassCard className="border-emerald-500/50 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-8 space-y-6 shadow-2xl animate-fadeIn">
          {/* Document Header Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-1">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Academic Approved ({((latestResult.validation.confidence || 1) * 100).toFixed(0)}%)
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Status: Ready for AI
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">{latestResult.document.name}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap pt-0.5">
                  <span>Subject: <strong className="text-cyan-300">{latestResult.validation.subject || 'Course Syllabus'}</strong></span>
                  <span>•</span>
                  <span>Material: <strong className="text-indigo-300 capitalize">{(latestResult.validation.materialType || 'lecture_notes').replace('_', ' ')}</strong></span>
                  <span>•</span>
                  <span>Pages: <strong className="text-white">{latestResult.document.overview?.pagesCount || 1}</strong></span>
                  <span>•</span>
                  <span>Topics: <strong className="text-white">{latestResult.document.topicsIdentified}</strong></span>
                </div>
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

          {/* Quick Summary Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Summary
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {latestResult.document.overview?.summary || latestResult.validation.reason}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Key Takeaways
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300">
              {(latestResult.document.overview?.keyTakeaways || [
                `Structured syllabus models and core primitives in ${latestResult.validation.subject || 'this course'}.`,
                `Essential definitions, invariant constraints, and procedural formulations.`,
                `High-yield concepts targeted in midterm examinations and revision quizzes.`
              ]).map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Topics */}
          {latestResult.document.overview?.importantTopics && latestResult.document.overview.importantTopics.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Important Extracted Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {latestResult.document.overview.importantTopics.map((top, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-medium"
                  >
                    {idx + 1}. {top}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* WHAT DO YOU WANT TO DO? ACTION TILES */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              What do you want to do with this material?
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                icon={<MessageSquare className="w-4 h-4" />}
                onClick={() => onNavigate('chat')}
              >
                Ask AI
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full justify-center"
                icon={<HelpCircle className="w-4 h-4 text-cyan-400" />}
                onClick={() => onNavigate('explain')}
              >
                Explain Topic
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full justify-center"
                icon={<FileQuestion className="w-4 h-4 text-emerald-400" />}
                onClick={() => onNavigate('quizzes')}
              >
                Generate Quiz
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full justify-center"
                icon={<Calendar className="w-4 h-4 text-amber-400" />}
                onClick={() => onNavigate('revision')}
              >
                Revision Plan
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* MY STUDY MATERIAL / UPLOADED DOCUMENTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            My Study Material ({docsList.length})
          </h3>
          <span className="text-xs text-slate-400">
            Only approved academic documents are indexed for AI
          </span>
        </div>

        {docsList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {docsList.map((doc) => (
              <GlassCard key={doc.id} className="border-slate-800 p-5 hover:border-slate-700 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 overflow-hidden">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0 mt-0.5">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white truncate">{doc.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Status: Ready
                        </span>
                        {doc.academicConfidence && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            Confidence: {(doc.academicConfidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300">
                        <span className="text-slate-400 font-medium">Subject:</span>{' '}
                        <strong className="text-white">{doc.subject || 'Course Syllabus'}</strong>
                        {' • '}
                        <span className="text-slate-400 font-medium">Type:</span>{' '}
                        <span className="text-cyan-300 capitalize">{doc.materialType ? doc.materialType.replace('_', ' ') : 'Lecture Notes'}</span>
                        {' • '}
                        <span className="text-slate-400">{doc.sizeFormatted}</span>
                      </p>

                      {doc.academicReason && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                          {doc.academicReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDocToDelete(doc)}
                    aria-label={`Delete ${doc.name}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
                    title="Delete document"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* STUDY ACTIONS FOR APPROVED MATERIAL */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onNavigate('chat')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700/50 hover:border-cyan-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      Ask AI
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('course')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-700/50 hover:border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      Explain
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('quiz')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700/50 hover:border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <FileQuestion className="w-3.5 h-3.5 text-emerald-400" />
                      Generate Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('course')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 border border-slate-700/50 hover:border-purple-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Summarize
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('revision')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-slate-700/50 hover:border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Create Revision Plan
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {doc.unitsDetected} Units • {doc.topicsIdentified} Topics
                  </span>
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
              Upload your syllabus or study notes to start learning with NOVA.
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
