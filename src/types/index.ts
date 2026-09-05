export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Topic {
  id: string;
  unitId: string;
  unitTitle: string;
  title: string;
  description: string;
  status: 'mastered' | 'learning' | 'needs_review' | 'not_started';
  difficulty: 'easy' | 'medium' | 'hard';
  confidenceScore: number;
  estimatedMinutes: number;
  technicalExplanation: string;
  eli10Explanation: string;
  analogy: string;
  example: string;
  keyPoints: string[];
  commonMistakes: string[];
  quickCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  uploadedAt: string;
  documentsCount: number;
  totalTopics: number;
  masteredTopics: number;
  progressPercent: number;
  units: Unit[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  unitTitle: string;
  pageNumber?: number;
  text: string;
}

export type MaterialClassification = 'academic' | 'non_academic' | 'uncertain';

export type MaterialType =
  | 'syllabus'
  | 'lecture_notes'
  | 'textbook'
  | 'assignment'
  | 'question_paper'
  | 'lab_manual'
  | 'revision_material'
  | 'academic_paper'
  | 'academic_presentation'
  | 'other_academic'
  | 'resume'
  | 'invoice'
  | 'financial_doc'
  | 'personal_doc'
  | 'entertainment'
  | 'unrelated';

export interface AcademicValidationResult {
  isAcademic: boolean;
  classification: MaterialClassification;
  confidence: number; // 0.0 -> 1.0
  materialType: MaterialType | string;
  subject?: string;
  topic?: string;
  reason: string;
  extractedSnippet?: string;
}

export interface DocumentOverview {
  summary: string;
  keyTakeaways: string[];
  importantTopics: string[];
  pagesCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  definitions?: Array<{ term: string; definition: string }>;
  formulas?: string[];
}

export interface StudyDocument {
  id: string;
  name: string;
  sizeFormatted: string;
  uploadedAt: string;
  status: 'uploading' | 'reading' | 'understanding' | 'organizing' | 'ready' | 'rejected';
  progressPercent: number;
  unitsDetected: number;
  topicsIdentified: number;
  conceptsExtracted: number;
  chunks: DocumentChunk[];
  // Academic validation metadata
  materialType?: string;
  subject?: string;
  academicConfidence?: number;
  academicReason?: string;
  contentHash?: string;
  verificationStatus?: 'approved' | 'rejected' | 'pending';
  overview?: DocumentOverview;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  uploadedAt: string;
  documentsCount: number;
  totalTopics: number;
  masteredTopics: number;
  progressPercent: number;
  units: Unit[];
  overview?: DocumentOverview;
}

export interface ChatCitation {
  docName: string;
  unit: string;
  page?: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nova';
  text: string;
  timestamp: string;
  citations?: ChatCitation[];
  isFallback?: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: number | string | boolean;
  explanation: string;
  userAnswer?: number | string | boolean;
  isCorrect?: boolean;
  topicId: string;
  topicTitle: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  sourceReference?: string;
}

export interface QuizConfig {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionType: 'multiple_choice' | 'short_answer' | 'mixed';
  topicScope: string; // 'entire_material' or topicId
}

export interface TopicPerformance {
  topicId: string;
  topicTitle: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  status: 'strong' | 'needs_practice' | 'weak';
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  courseTitle: string;
  topicId?: string;
  topicTitle?: string;
  date: string;
  scorePercent: number;
  totalQuestions: number;
  correctCount: number;
  questions: QuizQuestion[];
  weakTopicsDetected: string[];
  strongTopicsDetected: string[];
  topicPerformances?: TopicPerformance[];
}

export interface RevisionTask {
  id: string;
  title: string;
  topicId: string;
  topicTitle: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  type: 'review' | 'quiz' | 'practice' | 'reading';
  status: 'pending' | 'completed' | 'skipped';
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

export type NovaState = 'IDLE' | 'THINKING' | 'READING' | 'ANALYZING' | 'RESPONDING' | 'SUCCESS';
