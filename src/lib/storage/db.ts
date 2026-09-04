import { Course, StudyDocument, QuizAttempt, RevisionTask, UserProfile, ChatMessage } from '../../types';

export const DEMO_USER: UserProfile = {
  id: 'user-demo-alex',
  name: 'Alex Mercer (Demo)',
  email: 'alex.demo@university.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const DEMO_COURSE: Course = {
  id: 'dsa-201',
  title: 'Data Structures & Algorithms',
  code: 'CS 201',
  description: 'Sample demo course covering linear and non-linear data structures, space/time complexity analysis, and graph algorithms.',
  uploadedAt: '2026-08-20',
  documentsCount: 1,
  totalTopics: 5,
  masteredTopics: 3,
  progressPercent: 60,
  units: [
    {
      id: 'unit-1',
      unitNumber: 1,
      title: 'Arrays & Dynamic Allocation',
      description: 'Contiguous memory allocation and dynamic resizing.',
      topics: [
        {
          id: 'topic-arrays-101',
          unitId: 'unit-1',
          unitTitle: 'Arrays & Matrices',
          title: 'Arrays & Dynamic Resizing',
          description: 'Understanding contiguous memory allocation and O(1) random index access.',
          status: 'mastered',
          difficulty: 'easy',
          confidenceScore: 95,
          estimatedMinutes: 15,
          technicalExplanation: 'An array stores elements in contiguous memory locations, allowing O(1) random access via index offset arithmetic.',
          eli10Explanation: 'Imagine a row of numbered lockers next to each other. You can walk straight to locker #5 instantly!',
          analogy: 'A row of egg cartons where each egg has a specific slot.',
          example: 'Accessing arr[4] takes constant time O(1) because memory location is offset directly.',
          keyPoints: ['Contiguous memory allocation', 'O(1) random read access', 'Dynamic arrays double capacity when full'],
          commonMistakes: ['Off-by-one index errors'],
          quickCheck: {
            question: 'What is the time complexity to access element at index 500 in an array?',
            options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
            correctIndex: 2,
            explanation: 'Index arithmetic enables constant time O(1) lookup.'
          }
        }
      ]
    },
    {
      id: 'unit-4',
      unitNumber: 4,
      title: 'Trees & Binary Search Trees',
      description: 'Hierarchical tree structure maintaining ordering invariant.',
      topics: [
        {
          id: 'topic-bst',
          unitId: 'unit-4',
          unitTitle: 'Trees & BST',
          title: 'Binary Search Trees (BST)',
          description: 'Tree maintaining Left < Root < Right ordering invariant.',
          status: 'needs_review',
          difficulty: 'medium',
          confidenceScore: 60,
          estimatedMinutes: 25,
          technicalExplanation: 'A Binary Search Tree maintains keys where left subtree < root < right subtree. Average operations run in O(log n) time.',
          eli10Explanation: 'Imagine guessing a secret number between 1 and 100. Guessing 50 eliminates half the numbers!',
          analogy: 'Organizing books on a shelf by size.',
          example: 'Searching 14: Start 10 -> Right 15 -> Left 14. Found in 2 comparisons!',
          keyPoints: ['Left < Root < Right invariant', 'In-order traversal yields sorted order', 'Pre-sorted inputs skew tree into O(n) list'],
          commonMistakes: ['Forgetting balancing leads to linear lookup'],
          quickCheck: {
            question: 'What happens to a BST search time if keys are inserted in pre-sorted order?',
            options: ['Stays O(log n)', 'Degenerates to linear search O(n)', 'Becomes O(1)', 'Becomes O(n²)'],
            correctIndex: 1,
            explanation: 'Pre-sorted inputs form a skewed chain resembling a linked list.'
          }
        }
      ]
    }
  ]
};

export const DEMO_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-dsa-demo',
    name: 'Data Structures Syllabus.pdf',
    sizeFormatted: '4.2 MB',
    uploadedAt: '2026-08-20 10:30 AM',
    status: 'ready',
    progressPercent: 100,
    unitsDetected: 2,
    topicsIdentified: 5,
    conceptsExtracted: 42,
    chunks: [
      {
        id: 'chunk-1',
        documentId: 'doc-dsa-demo',
        documentName: 'Data Structures Syllabus.pdf',
        unitTitle: 'Unit 4 — Trees & Binary Search Trees',
        pageNumber: 18,
        text: 'A Binary Search Tree (BST) maintains the property that left keys < root < right keys. Pre-sorted input insertion skews the tree, causing O(log n) lookup to degenerate into linear O(n) search.'
      }
    ]
  }
];

export const DEMO_REVISION: RevisionTask[] = [
  {
    id: 'task-demo-1',
    title: 'Review Binary Search Tree Deletion & Skewness',
    topicId: 'topic-bst',
    topicTitle: 'Binary Search Trees (BST)',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '06:00 PM – 06:30 PM',
    durationMinutes: 30,
    type: 'review',
    status: 'pending',
    priority: 'high',
    reason: 'Targeting weak topic detected in diagnostic quiz.'
  }
];

export const DEMO_CHAT: ChatMessage[] = [
  {
    id: 'msg-demo-1',
    sender: 'nova',
    text: 'Welcome to the StudySphere AI **Demo Workspace**! I am NOVA, grounded in the sample Data Structures & Algorithms syllabus. Ask any question to test grounded doubt solving.',
    timestamp: '10:00 AM',
    citations: [
      {
        docName: 'Data Structures Syllabus.pdf',
        unit: 'Unit 4 — Trees & Binary Search Trees',
        page: 'Page 18',
        snippet: 'A Binary Search Tree (BST) maintains the property that left keys < root < right keys.'
      }
    ]
  }
];

const STORAGE_KEYS = {
  ACTIVE_USER_ID: 'studysphere_active_user_id',
  IS_DEMO_MODE: 'studysphere_is_demo_mode',
  USER_PREFIX: 'studysphere_user_',
  COURSES_PREFIX: 'studysphere_courses_',
  DOCUMENTS_PREFIX: 'studysphere_documents_',
  QUIZZES_PREFIX: 'studysphere_quizzes_',
  REVISION_PREFIX: 'studysphere_revision_',
  CHAT_PREFIX: 'studysphere_chat_',
  DEMO_DOCUMENTS: 'studysphere_demo_documents',
  DEMO_COURSES: 'studysphere_demo_courses'
};

export class StorageService {
  static isDemoMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_DEMO_MODE) === 'true';
  }

  static getActiveUserId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!id) {
      id = `user_real_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
    }
    return id;
  }

  static createNewUserAccount(name: string = 'Student', email: string = 'student@university.edu'): UserProfile {
    const userId = `user_real_${Date.now()}`;
    const newProfile: UserProfile = {
      id: userId,
      name: name,
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`
    };

    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, 'false');
    localStorage.setItem(`${STORAGE_KEYS.USER_PREFIX}${userId}`, JSON.stringify(newProfile));
    localStorage.setItem(`${STORAGE_KEYS.COURSES_PREFIX}${userId}`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEYS.DOCUMENTS_PREFIX}${userId}`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEYS.QUIZZES_PREFIX}${userId}`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEYS.REVISION_PREFIX}${userId}`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEYS.CHAT_PREFIX}${userId}`, JSON.stringify([]));

    return newProfile;
  }

  static getUser(): UserProfile {
    if (this.isDemoMode()) return DEMO_USER;

    const userId = this.getActiveUserId();
    const data = localStorage.getItem(`${STORAGE_KEYS.USER_PREFIX}${userId}`);
    if (data) return JSON.parse(data);

    return this.createNewUserAccount();
  }

  static saveUser(user: UserProfile) {
    if (this.isDemoMode()) return;
    localStorage.setItem(`${STORAGE_KEYS.USER_PREFIX}${user.id}`, JSON.stringify(user));
  }

  static getCourses(): Course[] {
    if (this.isDemoMode()) {
      const demoData = localStorage.getItem(STORAGE_KEYS.DEMO_COURSES);
      return demoData ? JSON.parse(demoData) : [DEMO_COURSE];
    }

    const userId = this.getActiveUserId();
    const data = localStorage.getItem(`${STORAGE_KEYS.COURSES_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  }

  static saveCourses(courses: Course[]) {
    if (this.isDemoMode()) {
      localStorage.setItem(STORAGE_KEYS.DEMO_COURSES, JSON.stringify(courses));
      return;
    }

    const userId = this.getActiveUserId();
    localStorage.setItem(`${STORAGE_KEYS.COURSES_PREFIX}${userId}`, JSON.stringify(courses));
  }

  static addCourse(course: Course) {
    const courses = this.getCourses();
    courses.unshift(course);
    this.saveCourses(courses);
  }

  static getDocuments(): StudyDocument[] {
    if (this.isDemoMode()) {
      const demoData = localStorage.getItem(STORAGE_KEYS.DEMO_DOCUMENTS);
      return demoData ? JSON.parse(demoData) : DEMO_DOCUMENTS;
    }

    const userId = this.getActiveUserId();
    const data = localStorage.getItem(`${STORAGE_KEYS.DOCUMENTS_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  }

  static saveDocuments(docs: StudyDocument[]) {
    if (this.isDemoMode()) {
      localStorage.setItem(STORAGE_KEYS.DEMO_DOCUMENTS, JSON.stringify(docs));
      return;
    }

    const userId = this.getActiveUserId();
    localStorage.setItem(`${STORAGE_KEYS.DOCUMENTS_PREFIX}${userId}`, JSON.stringify(docs));
  }

  static addDocument(doc: StudyDocument) {
    const docs = this.getDocuments();
    docs.unshift(doc);
    this.saveDocuments(docs);
  }

  static deleteDocument(docId: string) {
    const docToDelete = this.getDocuments().find((d) => d.id === docId);

    // Filter documents
    const updatedDocs = this.getDocuments().filter((d) => d.id !== docId);
    this.saveDocuments(updatedDocs);

    // Also remove any linked courses created from this document
    if (docToDelete) {
      const updatedCourses = this.getCourses().filter(
        (c) => c.id !== `course-${docId}` && !c.title.toLowerCase().includes(docToDelete.name.toLowerCase().replace('.pdf', '').replace('.docx', '').replace('.txt', ''))
      );
      this.saveCourses(updatedCourses);
    }
  }

  static deleteCourse(courseId: string) {
    const courses = this.getCourses().filter((c) => c.id !== courseId);
    this.saveCourses(courses);
  }

  static getQuizAttempts(): QuizAttempt[] {
    if (this.isDemoMode()) return [];

    const userId = this.getActiveUserId();
    const data = localStorage.getItem(`${STORAGE_KEYS.QUIZZES_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  }

  static saveQuizAttempt(attempt: QuizAttempt) {
    if (this.isDemoMode()) return;
    const attempts = this.getQuizAttempts();
    attempts.unshift(attempt);

    const userId = this.getActiveUserId();
    localStorage.setItem(`${STORAGE_KEYS.QUIZZES_PREFIX}${userId}`, JSON.stringify(attempts));
  }

  static getRevisionTasks(): RevisionTask[] {
    if (this.isDemoMode()) return DEMO_REVISION;

    const userId = this.getActiveUserId();
    const data = localStorage.getItem(`${STORAGE_KEYS.REVISION_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  }

  static saveRevisionTasks(tasks: RevisionTask[]) {
    if (this.isDemoMode()) return;
    const userId = this.getActiveUserId();
    localStorage.setItem(`${STORAGE_KEYS.REVISION_PREFIX}${userId}`, JSON.stringify(tasks));
  }

  static getChatMessages(): ChatMessage[] {
    if (this.isDemoMode()) return DEMO_CHAT;

    const userId = this.getActiveUserId();
    const data = localStorage.getItem(`${STORAGE_KEYS.CHAT_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  }

  static saveChatMessage(msg: ChatMessage) {
    if (this.isDemoMode()) return;
    const msgs = this.getChatMessages();
    msgs.push(msg);

    const userId = this.getActiveUserId();
    localStorage.setItem(`${STORAGE_KEYS.CHAT_PREFIX}${userId}`, JSON.stringify(msgs));
  }

  static activateDemoMode() {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, 'true');
  }

  static activateRealMode() {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, 'false');
  }
}
