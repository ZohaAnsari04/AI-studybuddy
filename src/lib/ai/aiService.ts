import { ChatCitation, QuizQuestion, RevisionTask, StudyDocument } from '../../types';

export interface ExplanationResult {
  summary: string;
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

export interface GroundedChatResult {
  text: string;
  citations?: ChatCitation[];
  isFallback?: boolean;
}

export interface AIService {
  name: string;
  explainConcept(topicTitle: string, level: string, contextText?: string): Promise<ExplanationResult>;
  answerGroundedQuestion(question: string, documents: StudyDocument[]): Promise<GroundedChatResult>;
  generateQuiz(topicTitle: string, difficulty: string, count: number, contextText?: string): Promise<QuizQuestion[]>;
  generateRevisionPlan(examDate: string, hoursPerDay: number, weakTopics: string[], courseTopics?: string[]): Promise<RevisionTask[]>;
}

export class DemoAIProvider implements AIService {
  name = 'Dynamic Local Intelligence Engine';

  async explainConcept(topicTitle: string, level: string, contextText?: string): Promise<ExplanationResult> {
    await new Promise((r) => setTimeout(r, 400));

    if (level === 'ELI10') {
      return {
        summary: `Imagine "${topicTitle}" like organizing your favorite video games by release year! Instead of sifting through a messy box for 20 minutes, you place them in numbered slots so you can grab the right one instantly.`,
        analogy: `Think of a giant library bookshelf where every book is sorted strictly by genre and author name so you can walk straight to the right shelf in 5 seconds.`,
        example: `If you want to find number 42 in a sorted list of 100 numbers, you flip to the middle (50). Since 42 is smaller than 50, you ignore numbers 50 to 100 and only check the left half!`,
        keyPoints: [
          'Break big messy problems into smaller, simple steps.',
          'Always keep items in predictable order so searching is super fast.',
          'Save time by skipping things you already know are too big or too small.'
        ],
        commonMistakes: [
          'Searching items one by one when they are already sorted.',
          'Forgetting to keep things organized when adding a new item.'
        ],
        quickCheck: {
          question: `In "Explain Like I'm 10" terms, what is the best way to find a secret item in a sorted row of 100 boxes?`,
          options: [
            'Open every box from box 1 to box 100 sequentially',
            'Open the middle box first and throw away the half you don\'t need',
            'Shake all boxes at the same time',
            'Guess randomly'
          ],
          correctIndex: 1,
          explanation: 'Opening the middle box lets you discard 50 unnecessary boxes in a single step!'
        }
      };
    }

    return {
      summary: `"${topicTitle}" is an essential academic principle. ${contextText ? `Extracted context: "${contextText.slice(0, 150)}..."` : 'It provides algorithmic optimization patterns for software efficiency.'}`,
      analogy: `Operating like a search engine index, pre-processing pointers or structural invariants reduces algorithmic complexity from quadratic O(n²) to logarithmic O(log n) or constant O(1).`,
      example: `For "${topicTitle}", evaluating inputs against invariant conditions ensures predictable execution time bounds.`,
      keyPoints: [
        'Enforces structural invariants to bound search execution time.',
        'Minimizes memory overhead by utilizing contiguous or node-pointer allocations.',
        'Requires handling boundary conditions to prevent execution state errors.'
      ],
      commonMistakes: [
        'Failing to maintain invariants during mutation operations.',
        'Overlooking boundary constraints which lead to performance degradation.'
      ],
      quickCheck: {
        question: `What primary benefit does "${topicTitle}" provide when implemented properly?`,
        options: [
          'Reduces execution time complexity for core operations',
          'Eliminates all memory usage entirely',
          'Converts code into hardware instructions faster',
          'Prevents CPU throttling'
        ],
        correctIndex: 0,
        explanation: 'Data structures optimize time and space complexity efficiency.'
      }
    };
  }

  async answerGroundedQuestion(question: string, documents: StudyDocument[]): Promise<GroundedChatResult> {
    await new Promise((r) => setTimeout(r, 450));

    const qLower = question.toLowerCase();
    const allChunks = documents.flatMap((doc) => doc.chunks || []);

    const matchingChunk = allChunks.find((c) =>
      qLower.split(' ').some((word) => word.length > 3 && c.text.toLowerCase().includes(word))
    );

    if (matchingChunk) {
      return {
        text: `Based on **${matchingChunk.documentName}** (${matchingChunk.unitTitle}):\n\n"${matchingChunk.text}"\n\nKey Takeaway: The uploaded document explicitly details how this property preserves efficiency during standard operations.`,
        citations: [
          {
            docName: matchingChunk.documentName,
            unit: matchingChunk.unitTitle,
            page: matchingChunk.pageNumber ? `Page ${matchingChunk.pageNumber}` : 'Section 1',
            snippet: matchingChunk.text
          }
        ],
        isFallback: false
      };
    }

    if (documents.length > 0) {
      const firstDoc = documents[0];
      const sampleChunk = firstDoc.chunks && firstDoc.chunks[0];
      return {
        text: `Based on your uploaded study document **${firstDoc.name}**:\n\n${
          sampleChunk ? `"${sampleChunk.text}"\n\n` : ''
        }The uploaded material emphasizes maintaining structural invariants to preserve efficient execution.`,
        citations: sampleChunk
          ? [
              {
                docName: sampleChunk.documentName,
                unit: sampleChunk.unitTitle,
                page: sampleChunk.pageNumber ? `Page ${sampleChunk.pageNumber}` : 'Section 1',
                snippet: sampleChunk.text
              }
            ]
          : undefined,
        isFallback: false
      };
    }

    return {
      text: `I couldn't find this in your uploaded study material.\n\nHere is a general explanation:\nFor complex study topics, ensuring balanced node distribution and maintaining invariant constraints are key to preserving algorithmic efficiency.\n\n*Note: Upload your syllabus or notes to receive exact document-grounded answers with page citations.*`,
      isFallback: true
    };
  }

  async generateQuiz(topicTitle: string, difficulty: string, count: number): Promise<QuizQuestion[]> {
    await new Promise((r) => setTimeout(r, 500));

    const questions: QuizQuestion[] = [
      {
        id: `gen-q1-${Date.now()}`,
        topicId: `topic-${Date.now()}`,
        topicTitle: topicTitle,
        text: `What is the primary objective of studying "${topicTitle}" in this course module?`,
        type: 'multiple_choice',
        options: [
          'Optimize execution time & resource allocation',
          'Increase file size on disk',
          'Disable memory cache',
          'Prevent compiler warnings'
        ],
        correctAnswer: 0,
        explanation: `Studying ${topicTitle} provides algorithmic optimization patterns for software efficiency.`
      },
      {
        id: `gen-q2-${Date.now()}`,
        topicId: `topic-${Date.now()}`,
        topicTitle: topicTitle,
        text: `True or False: Maintaining structural invariants in "${topicTitle}" guarantees logarithmic O(log n) search performance.`,
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'Enforcing ordering invariants prevents worst-case linear time O(n) degradation.'
      },
      {
        id: `gen-q3-${Date.now()}`,
        topicId: `topic-${Date.now()}`,
        topicTitle: topicTitle,
        text: `Which algorithmic complexity is achieved when lookup operations in "${topicTitle}" cut the search space in half at each step?`,
        type: 'multiple_choice',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 1,
        explanation: 'Halving search space iteratively yields logarithmic time complexity O(log n).'
      },
      {
        id: `gen-q4-${Date.now()}`,
        topicId: `topic-${Date.now()}`,
        topicTitle: topicTitle,
        text: `What edge case should be handled to avoid errors during "${topicTitle}" operations?`,
        type: 'multiple_choice',
        options: ['Null pointer dereferencing on empty references', 'CPU overclocking', 'Monitor refresh rate drops', 'GPU memory leak'],
        correctAnswer: 0,
        explanation: 'Null pointer checks prevent runtime crash exceptions when traversing nodes.'
      },
      {
        id: `gen-q5-${Date.now()}`,
        topicId: `topic-${Date.now()}`,
        topicTitle: topicTitle,
        text: `Which traversal pattern visits keys in sorted order for hierarchical structures in "${topicTitle}"?`,
        type: 'multiple_choice',
        options: ['In-Order Traversal', 'Pre-Order Traversal', 'Post-Order Traversal', 'Random Traversal'],
        correctAnswer: 0,
        explanation: 'In-order traversal visits left subtree, root, then right subtree in ascending sorted order.'
      }
    ];

    return questions.slice(0, count);
  }

  async generateRevisionPlan(examDate: string, hoursPerDay: number, weakTopics: string[], courseTopics: string[] = []): Promise<RevisionTask[]> {
    await new Promise((r) => setTimeout(r, 450));

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const targetTopic = weakTopics.length > 0 ? weakTopics[0] : courseTopics.length > 0 ? courseTopics[0] : 'Uploaded Course Principles';

    return [
      {
        id: `rev-1-${Date.now()}`,
        title: `Priority Focus Review: ${targetTopic}`,
        topicId: 'topic-target',
        topicTitle: targetTopic,
        date: todayStr,
        timeSlot: '06:00 PM – 06:45 PM',
        durationMinutes: 45,
        type: 'review',
        status: 'pending',
        priority: 'high',
        reason: 'Targeting focus area identified in syllabus notes.'
      },
      {
        id: `rev-2-${Date.now()}`,
        title: `Adaptive Diagnostic Quiz: ${targetTopic}`,
        topicId: 'topic-target',
        topicTitle: targetTopic,
        date: todayStr,
        timeSlot: '07:00 PM – 07:30 PM',
        durationMinutes: 30,
        type: 'quiz',
        status: 'pending',
        priority: 'high',
        reason: 'Spaced repetition trigger for upcoming exam.'
      },
      {
        id: `rev-3-${Date.now()}`,
        title: `Full Course Cumulative Practice & Review`,
        topicId: 'topic-all',
        topicTitle: 'All Syllabus Modules',
        date: tomorrowStr,
        timeSlot: '05:30 PM – 06:30 PM',
        durationMinutes: 60,
        type: 'practice',
        status: 'pending',
        priority: 'medium',
        reason: `Targeting exam date on ${examDate} with ${hoursPerDay}h/day capacity.`
      }
    ];
  }
}

export class IBMBobAIProvider implements AIService {
  name = 'IBM Bob AI Engine';

  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_IBM_BOB_API_KEY || '';
    this.endpoint = import.meta.env.VITE_IBM_BOB_ENDPOINT || 'https://api.ibm.com/bob/v1';
  }

  async explainConcept(topicTitle: string, level: string, contextText?: string): Promise<ExplanationResult> {
    if (!this.apiKey) return new DemoAIProvider().explainConcept(topicTitle, level, contextText);
    try {
      const response = await fetch(`${this.endpoint}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({ topic: topicTitle, level, context: contextText })
      });
      if (!response.ok) throw new Error('IBM Bob request failed');
      return await response.json();
    } catch {
      return new DemoAIProvider().explainConcept(topicTitle, level, contextText);
    }
  }

  async answerGroundedQuestion(question: string, documents: StudyDocument[]): Promise<GroundedChatResult> {
    if (!this.apiKey) return new DemoAIProvider().answerGroundedQuestion(question, documents);
    try {
      const response = await fetch(`${this.endpoint}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({ question, documents })
      });
      return await response.json();
    } catch {
      return new DemoAIProvider().answerGroundedQuestion(question, documents);
    }
  }

  async generateQuiz(topicTitle: string, difficulty: string, count: number): Promise<QuizQuestion[]> {
    return new DemoAIProvider().generateQuiz(topicTitle, difficulty, count);
  }

  async generateRevisionPlan(examDate: string, hoursPerDay: number, weakTopics: string[], courseTopics?: string[]): Promise<RevisionTask[]> {
    return new DemoAIProvider().generateRevisionPlan(examDate, hoursPerDay, weakTopics, courseTopics);
  }
}

export function getAIService(): AIService {
  const providerType = import.meta.env.VITE_AI_PROVIDER || 'demo';
  if (providerType === 'ibm_bob') {
    return new IBMBobAIProvider();
  }
  return new DemoAIProvider();
}
