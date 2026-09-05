import { Course, StudyDocument, QuizAttempt, RevisionTask, UserProfile, ChatMessage } from '../../types';

const STORAGE_KEYS = {
  ACTIVE_USER_ID: 'studysphere_active_user_id',
  USER_PREFIX: 'studysphere_user_',
  COURSES_PREFIX: 'studysphere_courses_',
  DOCUMENTS_PREFIX: 'studysphere_documents_',
  QUIZZES_PREFIX: 'studysphere_quizzes_',
  REVISION_PREFIX: 'studysphere_revision_',
  CHAT_PREFIX: 'studysphere_chat_'
};

const memoryStore: Record<string, string> = {};

const appStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // fallback to memory
      }
    }
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // fallback to memory
      }
    }
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        // fallback to memory
      }
    }
    delete memoryStore[key];
  }
};

export class StorageService {
  static getActiveUserId(): string | null {
    return appStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  }

  static setActiveUserId(userId: string | null): void {
    if (userId) {
      appStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    } else {
      appStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
  }

  static createNewUserAccount(name: string = 'Student', email: string = 'student@university.edu'): UserProfile {
    const userId = `user_${Date.now()}`;
    const newProfile: UserProfile = {
      id: userId,
      name: name,
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`
    };

    this.setActiveUserId(userId);
    appStorage.setItem(`${STORAGE_KEYS.USER_PREFIX}${userId}`, JSON.stringify(newProfile));
    appStorage.setItem(`${STORAGE_KEYS.COURSES_PREFIX}${userId}`, JSON.stringify([]));
    appStorage.setItem(`${STORAGE_KEYS.DOCUMENTS_PREFIX}${userId}`, JSON.stringify([]));
    appStorage.setItem(`${STORAGE_KEYS.QUIZZES_PREFIX}${userId}`, JSON.stringify([]));
    appStorage.setItem(`${STORAGE_KEYS.REVISION_PREFIX}${userId}`, JSON.stringify([]));
    appStorage.setItem(`${STORAGE_KEYS.CHAT_PREFIX}${userId}`, JSON.stringify([]));

    return newProfile;
  }

  static getUser(): UserProfile | null {
    const userId = this.getActiveUserId();
    if (!userId) return null;

    const data = appStorage.getItem(`${STORAGE_KEYS.USER_PREFIX}${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  }

  static saveUser(user: UserProfile): void {
    this.setActiveUserId(user.id);
    appStorage.setItem(`${STORAGE_KEYS.USER_PREFIX}${user.id}`, JSON.stringify(user));
  }

  static clearUserSession(): void {
    this.setActiveUserId(null);
  }

  static getCourses(targetUserId?: string): Course[] {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return [];

    const data = appStorage.getItem(`${STORAGE_KEYS.COURSES_PREFIX}${userId}`);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveCourses(courses: Course[], targetUserId?: string): void {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return;
    appStorage.setItem(`${STORAGE_KEYS.COURSES_PREFIX}${userId}`, JSON.stringify(courses));
  }

  static addCourse(course: Course, targetUserId?: string): void {
    const courses = this.getCourses(targetUserId);
    courses.unshift(course);
    this.saveCourses(courses, targetUserId);
  }

  static getDocuments(targetUserId?: string): StudyDocument[] {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return [];

    const data = appStorage.getItem(`${STORAGE_KEYS.DOCUMENTS_PREFIX}${userId}`);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static getApprovedDocuments(targetUserId?: string): StudyDocument[] {
    return this.getDocuments(targetUserId).filter(
      (d) => d.verificationStatus === 'approved' || (!d.verificationStatus && d.status === 'ready')
    );
  }

  static hasDocumentHash(hash: string, targetUserId?: string): boolean {
    if (!hash) return false;
    return this.getDocuments(targetUserId).some((d) => d.contentHash === hash);
  }

  static saveDocuments(docs: StudyDocument[], targetUserId?: string): void {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return;
    appStorage.setItem(`${STORAGE_KEYS.DOCUMENTS_PREFIX}${userId}`, JSON.stringify(docs));
  }

  static addDocument(doc: StudyDocument, targetUserId?: string): void {
    const docs = this.getDocuments(targetUserId);
    docs.unshift(doc);
    this.saveDocuments(docs, targetUserId);
  }

  static deleteDocument(docId: string, targetUserId?: string): void {
    const docs = this.getDocuments(targetUserId);
    const docToDelete = docs.find((d) => d.id === docId);

    const updatedDocs = docs.filter((d) => d.id !== docId);
    this.saveDocuments(updatedDocs, targetUserId);

    if (docToDelete) {
      const courses = this.getCourses(targetUserId);
      const cleanDocName = docToDelete.name.toLowerCase().replace(/\.[^/.]+$/, '');
      const updatedCourses = courses.filter(
        (c) => c.id !== `course-${docId}` && !c.title.toLowerCase().includes(cleanDocName)
      );
      this.saveCourses(updatedCourses, targetUserId);
    }
  }

  static deleteCourse(courseId: string, targetUserId?: string): void {
    const courses = this.getCourses(targetUserId).filter((c) => c.id !== courseId);
    this.saveCourses(courses, targetUserId);
  }

  static getQuizAttempts(targetUserId?: string): QuizAttempt[] {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return [];

    const data = appStorage.getItem(`${STORAGE_KEYS.QUIZZES_PREFIX}${userId}`);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveQuizAttempt(attempt: QuizAttempt, targetUserId?: string): void {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return;

    const attempts = this.getQuizAttempts(userId);
    attempts.unshift(attempt);
    appStorage.setItem(`${STORAGE_KEYS.QUIZZES_PREFIX}${userId}`, JSON.stringify(attempts));
  }

  static getRevisionTasks(targetUserId?: string): RevisionTask[] {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return [];

    const data = appStorage.getItem(`${STORAGE_KEYS.REVISION_PREFIX}${userId}`);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveRevisionTasks(tasks: RevisionTask[], targetUserId?: string): void {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return;
    appStorage.setItem(`${STORAGE_KEYS.REVISION_PREFIX}${userId}`, JSON.stringify(tasks));
  }

  static getChatMessages(targetUserId?: string, documentId?: string): ChatMessage[] {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return [];

    const data = appStorage.getItem(`${STORAGE_KEYS.CHAT_PREFIX}${userId}`);
    if (!data) return [];
    try {
      const msgs: ChatMessage[] = JSON.parse(data);
      if (documentId && documentId !== 'all') {
        // filter messages relevant to document if tagged or return all
        return msgs;
      }
      return msgs;
    } catch {
      return [];
    }
  }

  static saveChatMessage(msg: ChatMessage, targetUserId?: string): void {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return;

    const msgs = this.getChatMessages(userId);
    msgs.push(msg);
    appStorage.setItem(`${STORAGE_KEYS.CHAT_PREFIX}${userId}`, JSON.stringify(msgs));
  }

  static clearChatMessages(targetUserId?: string): void {
    const userId = targetUserId || this.getActiveUserId();
    if (!userId) return;
    appStorage.setItem(`${STORAGE_KEYS.CHAT_PREFIX}${userId}`, JSON.stringify([]));
  }
}
