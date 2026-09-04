import { Course, StudyDocument, QuizAttempt, RevisionTask, UserProfile, ChatMessage } from '../../types';

export const DEMO_USER: UserProfile = {
  id: 'user-demo-alex',
  name: 'Alex Mercer (Demo)',
  email: 'alex.demo@university.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const DEMO_COURSE: Course = {
  id: 'course-neuropath',
  title: 'Neuropath',
  code: 'COURSE-290',
  description: 'Course dynamically created from uploaded study material: neuropath.docx.',
  uploadedAt: '2026-09-04',
  documentsCount: 1,
  totalTopics: 3,
  masteredTopics: 1,
  progressPercent: 33,
  units: [
    {
      id: 'unit-1',
      unitNumber: 1,
      title: 'Unit 1 — Fundamentals & Core Principles',
      description: 'Overview of basic concepts, system architectures, and core primitives in neuropathology.',
      topics: [
        {
          id: 'topic-neuro-1',
          unitId: 'unit-1',
          unitTitle: 'Unit 1 — Fundamentals & Core Principles',
          title: 'Key Topic: Neural Pathways & Cellular Pathology',
          description: 'Fundamental cellular mechanisms, glial responses, and primary structural pathology.',
          status: 'mastered',
          difficulty: 'medium',
          confidenceScore: 92,
          estimatedMinutes: 20,
          technicalExplanation: 'Neuropathology focuses on structural and functional alterations in the central and peripheral nervous systems, detailing astrocytic reactions, microglial activation, and axonal degeneration.',
          eli10Explanation: 'Think of your brain like a giant city power grid. Neuropathology investigates what happens when specific wires or power stations get damaged!',
          analogy: 'A master electrician inspecting broken underground communication cables.',
          example: 'Demyelination in nerve fibers causing delayed action potential transmission.',
          keyPoints: ['Cellular pathology of central nervous system', 'Glial response to injury', 'Axonal degeneration and myelin loss'],
          commonMistakes: ['Confusing demyelinating conditions with primary axonal loss'],
          quickCheck: {
            question: 'What is the primary supportive glial cell involved in scar formation (gliosis) after CNS injury?',
            options: ['Astrocyte', 'Microglia', 'Oligodendrocyte', 'Ependymal cell'],
            correctIndex: 0,
            explanation: 'Astrocytes undergo reactive astrogliosis to form glial scars following brain injury.'
          }
        }
      ]
    },
    {
      id: 'unit-2',
      unitNumber: 2,
      title: 'Unit 2 — System Components & Clinical Patterns',
      description: 'Detailed analysis of cerebrovascular disorders, trauma, and infectious neuro-pathologies.',
      topics: [
        {
          id: 'topic-neuro-2',
          unitId: 'unit-2',
          unitTitle: 'Unit 2 — System Components & Clinical Patterns',
          title: 'Key Topic: Ischemic Stroke & Vascular Pathophysiology',
          description: 'Mechanisms of focal ischemic injury, penumbra rescue, and excitotoxicity.',
          status: 'needs_review',
          difficulty: 'hard',
          confidenceScore: 58,
          estimatedMinutes: 30,
          technicalExplanation: 'Focal cerebral ischemia initiates an ischemic cascade: failure of Na+/K+ ATPase, cellular depolarization, excessive glutamate release, intracellular calcium overload, and necrosis in the ischemic core.',
          eli10Explanation: 'When a water pipe to a garden gets blocked, flowers at the center wither fast, but outer flowers can be saved if water is turned back on quickly!',
          analogy: 'A bottleneck in a factory assembly line starving subsequent stations of parts.',
          example: 'Thrombolytic therapy administered within therapeutic window to salvage ischemic penumbra.',
          keyPoints: ['Ischemic penumbra vs ischemic core', 'Glutamate-mediated excitotoxicity', 'Therapeutic time window for reperfusion'],
          commonMistakes: ['Assuming all ischemic damage happens instantaneously without a salvagable penumbra'],
          quickCheck: {
            question: 'What is the salvageable hypoperfused tissue surrounding an ischemic infarct called?',
            options: ['Ischemic Penumbra', 'Necrotic Core', 'Liquefactive Zone', 'Gliosis Margin'],
            correctIndex: 0,
            explanation: 'The ischemic penumbra represents functionally compromised but structurally viable tissue that can be rescued by timely reperfusion.'
          }
        }
      ]
    },
    {
      id: 'unit-3',
      unitNumber: 3,
      title: 'Unit 3 — Advanced Diagnostic Evaluation & Degenerative Disorders',
      description: 'Neurodegenerative markers, tauopathies, amyloid deposition, and histopathological diagnosis.',
      topics: [
        {
          id: 'topic-neuro-3',
          unitId: 'unit-3',
          unitTitle: 'Unit 3 — Advanced Diagnostic Evaluation',
          title: 'Key Topic: Protein Aggregation & Neurodegeneration',
          description: 'Misfolded protein cascades in Alzheimer disease, Parkinson disease, and ALS.',
          status: 'not_started',
          difficulty: 'hard',
          confidenceScore: 0,
          estimatedMinutes: 35,
          technicalExplanation: 'Neurodegenerative diseases are characterized by progressive dysfunction and death of specific neuronal populations, often caused by toxic gain-of-function protein aggregates like amyloid-beta, hyperphosphorylated tau, and alpha-synuclein.',
          eli10Explanation: 'Imagine sticky trash building up in recycling machines until the whole recycling plant stops working!',
          analogy: 'Sticky gum clogging gears inside a delicate watch.',
          example: 'Extracellular amyloid plaques and intracellular neurofibrillary tangles in cortical neurons.',
          keyPoints: ['Toxic protein oligomers and fibrils', 'Selective neuronal vulnerability', 'Histochemical staining biomarkers'],
          commonMistakes: ['Assuming plaques and tangles are identical in protein composition'],
          quickCheck: {
            question: 'Which intracellular aggregate is primarily composed of hyperphosphorylated tau protein?',
            options: ['Neurofibrillary tangle', 'Amyloid plaque', 'Lewy body', 'Hirano body'],
            correctIndex: 0,
            explanation: 'Neurofibrillary tangles are composed of hyperphosphorylated tau protein inside neurons.'
          }
        }
      ]
    }
  ]
};

export const DEMO_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-neuropath-demo',
    name: 'neuropath.docx',
    sizeFormatted: '2.4 MB',
    uploadedAt: '2026-09-04 07:15 PM',
    status: 'ready',
    progressPercent: 100,
    unitsDetected: 3,
    topicsIdentified: 3,
    conceptsExtracted: 18,
    chunks: [
      {
        id: 'chunk-np-1',
        documentId: 'doc-neuropath-demo',
        documentName: 'neuropath.docx',
        unitTitle: 'Unit 1 — Fundamentals & Core Principles',
        pageNumber: 1,
        text: 'Neuropathology: Core cellular responses to injury. Astrocytes undergo reactive gliosis. Demyelinating lesions impair saltatory conduction along axon nodes.'
      },
      {
        id: 'chunk-np-2',
        documentId: 'doc-neuropath-demo',
        documentName: 'neuropath.docx',
        unitTitle: 'Unit 2 — System Components & Clinical Patterns',
        pageNumber: 4,
        text: 'Ischemic cerebrovascular disease: Focal ischemia produces a necrotic core surrounded by the ischemic penumbra, susceptible to excitotoxic injury and calcium influx.'
      },
      {
        id: 'chunk-np-3',
        documentId: 'doc-neuropath-demo',
        documentName: 'neuropath.docx',
        unitTitle: 'Unit 3 — Advanced Diagnostic Evaluation',
        pageNumber: 7,
        text: 'Neurodegenerative conditions exhibit characteristic protein aggregates: extracellular amyloid-beta plaques and intracellular tau neurofibrillary tangles.'
      }
    ]
  }
];

export const DEMO_REVISION: RevisionTask[] = [
  {
    id: 'task-demo-1',
    title: 'Review Ischemic Stroke & Vascular Pathophysiology',
    topicId: 'topic-neuro-2',
    topicTitle: 'Ischemic Stroke & Vascular Pathophysiology',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 PM – 08:45 PM',
    durationMinutes: 45,
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
    text: 'Welcome to the StudySphere AI **Demo Workspace**! I am NOVA, grounded in your uploaded study material **neuropath.docx**. Ask any question to test grounded doubt solving.',
    timestamp: '08:00 PM',
    citations: [
      {
        docName: 'neuropath.docx',
        unit: 'Unit 2 — System Components & Clinical Patterns',
        page: 'Page 4',
        snippet: 'Ischemic cerebrovascular disease: Focal ischemia produces a necrotic core surrounded by the ischemic penumbra.'
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
    const val = localStorage.getItem(STORAGE_KEYS.IS_DEMO_MODE);
    if (val === null) {
      return true;
    }
    return val === 'true';
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
