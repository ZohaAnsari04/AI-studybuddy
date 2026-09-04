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

export interface StudyDocument {
  id: string;
  name: string;
  sizeFormatted: string;
  uploadedAt: string;
  status: 'uploading' | 'reading' | 'understanding' | 'organizing' | 'ready';
  progressPercent: number;
  unitsDetected: number;
  topicsIdentified: number;
  conceptsExtracted: number;
  chunks: DocumentChunk[];
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
