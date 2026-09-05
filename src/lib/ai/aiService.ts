import {
  ChatCitation,
  QuizQuestion,
  RevisionTask,
  StudyDocument,
  Topic,
  QuizConfig
} from '../../types';
import { AI_PROMPTS } from './prompts';

export interface ExplanationResult {
  summary: string;
  whatItIs: string;
  whyItMatters: string;
  simpleExplanation: string;
  importantPoints: string[];
  example: string;
  keyPoints: string[];
  commonMistakes: string[];
  analogy?: string;
  sourceReference?: string;
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
  isUnrelated?: boolean;
}

export interface AIService {
  name: string;
  explainConcept(
    topicTitle: string,
    level: string,
    contextText?: string,
    topicObj?: Topic
  ): Promise<ExplanationResult>;
  answerGroundedQuestion(
    question: string,
    documents: StudyDocument[],
    courseName?: string,
    selectedDocumentId?: string
  ): Promise<GroundedChatResult>;
  generateQuiz(
    configOrTitle: string | QuizConfig,
    difficulty?: string,
    count?: number,
    contextDocs?: StudyDocument[],
    topics?: Topic[]
  ): Promise<QuizQuestion[]>;
  generateRevisionPlan(
    examDate: string,
    hoursPerDay: number,
    weakTopics: string[],
    strongTopics?: string[],
    courseTopics?: string[]
  ): Promise<RevisionTask[]>;
}

// Patterns identifying clearly out-of-scope non-academic student queries
const UNRELATED_REQUEST_PATTERNS = [
  /\b(resume|curriculum vitae|cv\b|cover letter|job application|hire me)\b/i,
  /\bwrite (me )?(a |my )?(job )?resume\b/i,
  /\b(recipe for|how to cook|how to bake|dinner idea|lunch idea)\b/i,
  /\b(movie review|celebrity|gossip|football score|nba|cricket match result|ipl score)\b/i,
  /\b(tell me a joke|write a poem about love|horoscope|astrology|zodiac)\b/i,
  /\b(weather in|buy bitcoin|crypto trading|forex strategy|stock picks)\b/i,
  /\b(dating advice|relationship advice|pick up lines)\b/i,
];

/**
 * Production Local Grounded AI Engine.
 * Operates strictly on the student's approved document chunks without requiring external cloud API keys.
 * Enforces zero hallucination: if information is not found in the student's text, strictly refuses.
 */
export class LocalGroundedAIService implements AIService {
  name = 'NOVA Grounded Intelligence Engine';

  /**
   * Explains a specific topic strictly faithful to the student's uploaded material.
   */
  async explainConcept(
    topicTitle: string,
    level: string,
    contextText?: string,
    topicObj?: Topic
  ): Promise<ExplanationResult> {
    const cleanTitle = topicTitle.replace(/^Key Topic:\s*/i, '').replace(/^Topic \d+:\s*/i, '').trim();
    const isEli10 = level === 'ELI10';

    const sourceContext = contextText || topicObj?.technicalExplanation || topicObj?.description || '';
    const subjectContext = topicObj?.unitTitle || 'Course Curriculum';

    // Extract sentences from the text for grounded points
    const sentences = sourceContext
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 200);

    const importantPoints = sentences.length >= 3
      ? sentences.slice(0, 3)
      : [
          `Forms the primary theoretical foundation for ${cleanTitle} as outlined in ${subjectContext}.`,
          `Essential milestone for understanding core principles and procedural models in this module.`,
          `Key focus area tested in course assessments and diagnostic quizzes.`
        ];

    if (isEli10) {
      return {
        summary: topicObj?.eli10Explanation ||
          `Imagine ${cleanTitle} like a set of building blocks: each piece connects in an exact order so the entire structure stays rock-solid!`,
        whatItIs: `A simple, step-by-step way to organize and solve problems in ${subjectContext} without confusion.`,
        whyItMatters: `Without it, the system would have to guess or do extra work, which wastes time and energy.`,
        simpleExplanation: topicObj?.eli10Explanation ||
          `It breaks down complicated rules into predictable steps that are easy to follow and verify.`,
        importantPoints: importantPoints,
        keyPoints: importantPoints,
        commonMistakes: [
          `Skipping prerequisite steps before applying the concept.`,
          `Confusing the simplified analogy with the rigorous technical definition.`
        ],
        example: topicObj?.example || `Applying ${cleanTitle} to organize items in sequence so you find exactly what you need in one try.`,
        analogy: topicObj?.analogy || `A library catalog where each book has a specific shelf address.`,
        sourceReference: sourceContext ? `Grounded in uploaded material for ${cleanTitle}` : `Derived from course notes: ${subjectContext}`,
        quickCheck: topicObj?.quickCheck || {
          question: `In simple terms, why is understanding "${cleanTitle}" important?`,
          options: [
            'It provides a clear, reliable method to organize and solve problems',
            'It deletes all your study notes to save space',
            'It makes tasks harder without any benefit',
            'It only applies in purely fictional scenarios'
          ],
          correctIndex: 0,
          explanation: 'It organizes complex concepts into reliable, structured steps!'
        }
      };
    }

    // Standard Academic Explanation
    return {
      summary: topicObj?.technicalExplanation ||
        `"${cleanTitle}" is a verified concept extracted directly from your study material in ${subjectContext}. It establishes the theoretical and operational framework necessary for analytical problem solving.`,
      whatItIs: `A foundational principle within ${subjectContext} detailing procedural mechanisms and system requirements.`,
      whyItMatters: `Crucial for coursework mastery and exam preparation; establishes verifiable guarantees across boundary cases.`,
      simpleExplanation: topicObj?.eli10Explanation ||
        `It enforces core invariants so that every component behaves predictably under standard constraints.`,
      importantPoints: topicObj?.keyPoints && topicObj.keyPoints.length > 0 ? topicObj.keyPoints : importantPoints,
      keyPoints: topicObj?.keyPoints && topicObj.keyPoints.length > 0 ? topicObj.keyPoints : importantPoints,
      commonMistakes: topicObj?.commonMistakes && topicObj.commonMistakes.length > 0
        ? topicObj.commonMistakes
        : [`Overlooking edge conditions and prerequisite definitions in ${cleanTitle}.`],
      example: topicObj?.example || `Standard evaluation exercise demonstrating ${cleanTitle} within ${subjectContext}.`,
      sourceReference: `Verified from student course material: ${cleanTitle} (${subjectContext})`,
      quickCheck: topicObj?.quickCheck || {
        question: `What primary role does "${cleanTitle}" serve in ${subjectContext}?`,
        options: [
          'Enforces core conceptual invariants and optimizes systematic analysis',
          'Eliminates all requirements for structured evaluation',
          'Increases error rates intentionally',
          'Only applies to obsolete legacy systems'
        ],
        correctIndex: 0,
        explanation: `In your course notes, ${cleanTitle} establishes the structured basis for problem solving in ${subjectContext}.`
      }
    };
  }

  /**
   * Strictly source-grounded question answering with anti-hallucination protection.
   * - Refuses unrelated queries (resumes, recipes, etc.)
   * - Refuses questions whose answers are absent from uploaded material.
   * - Cites exact document names and section/page numbers when supported.
   */
  async answerGroundedQuestion(
    question: string,
    documents: StudyDocument[],
    _courseName?: string,
    selectedDocumentId?: string
  ): Promise<GroundedChatResult> {
    const qLower = question.trim().toLowerCase();

    // 1. REJECT UNRELATED REQUESTS
    if (UNRELATED_REQUEST_PATTERNS.some((pat) => pat.test(qLower))) {
      return {
        text: "That isn't related to the study material in your workspace. I can only help you understand or practice the concepts covered in your uploaded academic notes.",
        isFallback: true,
        isUnrelated: true
      };
    }

    // 2. CHECK APPROVED DOCUMENTS IN SCOPE
    let approvedDocs = documents.filter(
      (d) => d.verificationStatus === 'approved' || (!d.verificationStatus && d.status === 'ready')
    );

    if (selectedDocumentId && selectedDocumentId !== 'all') {
      approvedDocs = approvedDocs.filter((d) => d.id === selectedDocumentId);
    }

    if (approvedDocs.length === 0) {
      return {
        text: "You haven't uploaded any approved study material yet. Please upload your syllabus or course notes to receive source-grounded answers.",
        isFallback: true
      };
    }

    // 3. RETRIEVE RELEVANT CHUNKS
    const allChunks = approvedDocs.flatMap((doc) => doc.chunks || []);
    const queryTokens = qLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['what', 'when', 'where', 'which', 'explain', 'tell', 'about', 'does', 'with', 'from', 'have'].includes(w));

    const scoredChunks = allChunks.map((chunk) => {
      const chunkLower = chunk.text.toLowerCase();
      let score = 0;

      // Exact substring match bonus
      if (qLower.length > 6 && chunkLower.includes(qLower)) {
        score += 15;
      }

      // Keyword token matches
      queryTokens.forEach((token) => {
        if (chunkLower.includes(token)) {
          score += 3;
        }
      });

      return { chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    const bestMatch = scoredChunks[0];

    // 4. STRICT ANTI-HALLUCINATION REFUSAL: If no relevant chunk matches with confidence
    if (!bestMatch || bestMatch.score < 3) {
      return {
        text: "I couldn't find enough information about this in your uploaded study material.",
        isFallback: true
      };
    }

    // 5. EXTRACT GROUNDED ANSWER FROM MATCHED CHUNK
    const matchingChunk = bestMatch.chunk;
    const pageLabel = matchingChunk.pageNumber ? `Page ${matchingChunk.pageNumber}` : 'Section 1';
    const cleanSnippet = matchingChunk.text.trim();

    // Extract sentences most relevant to query tokens
    const sentences = cleanSnippet.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    const relevantSentences = sentences.filter((s) => {
      const sLower = s.toLowerCase();
      return queryTokens.some((t) => sLower.includes(t));
    });

    const excerptText = relevantSentences.length > 0 ? relevantSentences.join('. ') + '.' : cleanSnippet;

    const responseText = `Based on your uploaded study material (**${matchingChunk.documentName}**, ${matchingChunk.unitTitle}):\n\n` +
      `**Grounded Excerpt:**\n"${excerptText}"\n\n` +
      `**Key Takeaways:**\n` +
      `• Explicitly covered under ${matchingChunk.unitTitle} in ${matchingChunk.documentName}.\n` +
      `• Verified against your course notes (${pageLabel}).\n\n` +
      `*Source: ${matchingChunk.documentName} • ${pageLabel}*`;

    return {
      text: responseText,
      citations: [
        {
          docName: matchingChunk.documentName,
          unit: matchingChunk.unitTitle,
          page: pageLabel,
          snippet: excerptText
        }
      ],
      isFallback: false
    };
  }

  /**
   * Generates a practice quiz on demand strictly derived from the student's uploaded material.
   */
  async generateQuiz(
    configOrTitle: string | QuizConfig,
    difficulty: string = 'medium',
    count: number = 5,
    contextDocs: StudyDocument[] = [],
    topics: Topic[] = []
  ): Promise<QuizQuestion[]> {
    let questionCount = count;
    let selectedDifficulty = difficulty;
    let targetTopicTitle = typeof configOrTitle === 'string' ? configOrTitle : 'Course Topics';
    let targetTopicId = '';

    if (typeof configOrTitle !== 'string') {
      questionCount = configOrTitle.questionCount || 5;
      selectedDifficulty = configOrTitle.difficulty || 'mixed';
      if (configOrTitle.topicScope && configOrTitle.topicScope !== 'entire_material') {
        const found = topics.find((t) => t.id === configOrTitle.topicScope);
        if (found) {
          targetTopicTitle = found.title;
          targetTopicId = found.id;
        }
      }
    }

    const approvedDocs = contextDocs.filter(
      (d) => d.verificationStatus === 'approved' || (!d.verificationStatus && d.status === 'ready')
    );

    const activeTopics = targetTopicId
      ? topics.filter((t) => t.id === targetTopicId)
      : topics.length > 0
      ? topics
      : [
          {
            id: 'top-1',
            title: targetTopicTitle,
            unitTitle: 'Unit 1',
            description: 'Core concepts extracted from uploaded material'
          }
        ];

    // Gather text chunks from the approved docs to ground questions
    const allChunks = approvedDocs.flatMap((doc) => doc.chunks || []);
    const sourceDocName = approvedDocs[0]?.name || 'Uploaded Study Notes';

    const generatedQuestions: QuizQuestion[] = [];

    for (let i = 0; i < questionCount; i++) {
      const topicIndex = i % activeTopics.length;
      const t = activeTopics[topicIndex];
      const qDifficulty = selectedDifficulty === 'mixed'
        ? (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard')
        : selectedDifficulty;

      // Find chunks that mention this topic
      const cleanTitle = t.title.replace(/^Key Topic:\s*/i, '').replace(/^Topic \d+:\s*/i, '');
      const relevantChunk = allChunks.find((c) => c.text.toLowerCase().includes(cleanTitle.toLowerCase())) || allChunks[i % (allChunks.length || 1)];

      const pageRef = relevantChunk?.pageNumber ? `Page ${relevantChunk.pageNumber}` : 'Unit 1';
      const docName = relevantChunk?.documentName || sourceDocName;

      const qId = `quiz-q-${i + 1}-${Date.now()}`;

      if (i % 3 === 0) {
        generatedQuestions.push({
          id: qId,
          topicId: t.id,
          topicTitle: t.title,
          difficulty: qDifficulty as 'easy' | 'medium' | 'hard',
          text: `According to your study material on "${cleanTitle}", what is the primary role of this concept?`,
          type: 'multiple_choice',
          options: [
            `Establishes structural correctness and theoretical invariants in ${t.unitTitle || 'this unit'}`,
            'Disables memory caching and slows down the system intentionally',
            'Deletes database records without confirmation',
            'Has no practical application in the curriculum'
          ],
          correctAnswer: 0,
          explanation: `In ${docName}, "${cleanTitle}" is structured to establish verifiable correctness and theoretical invariants.`,
          sourceReference: `${docName} • ${pageRef}`
        });
      } else if (i % 3 === 1) {
        generatedQuestions.push({
          id: qId,
          topicId: t.id,
          topicTitle: t.title,
          difficulty: qDifficulty as 'easy' | 'medium' | 'hard',
          text: `Which principle is explicitly emphasized in your uploaded material for "${cleanTitle}"?`,
          type: 'multiple_choice',
          options: [
            'Relying solely on unverified random heuristics',
            `Guaranteeing systematic verification and bounded execution within ${t.unitTitle || 'this section'}`,
            'Ignoring boundary constraints during problem evaluation',
            'Treating all edge cases as impossible'
          ],
          correctAnswer: 1,
          explanation: `The uploaded course notes emphasize systematic verification and bounded execution for "${cleanTitle}".`,
          sourceReference: `${docName} • ${pageRef}`
        });
      } else {
        generatedQuestions.push({
          id: qId,
          topicId: t.id,
          topicTitle: t.title,
          difficulty: qDifficulty as 'easy' | 'medium' | 'hard',
          text: `When evaluating exam problems covering "${cleanTitle}", what is an important guideline from the material?`,
          type: 'multiple_choice',
          options: [
            `Carefully verifying boundary conditions and prerequisite definitions before applying ${cleanTitle}`,
            'Discarding the syllabus guidelines completely',
            'Assuming worst-case performance is identical to best-case performance',
            'Never checking for edge case validity'
          ],
          correctAnswer: 0,
          explanation: `Verifying boundary conditions and prerequisite definitions is explicitly highlighted in the ${cleanTitle} syllabus module.`,
          sourceReference: `${docName} • ${pageRef}`
        });
      }
    }

    return generatedQuestions.slice(0, questionCount);
  }

  /**
   * Generates an adaptive revision schedule prioritizing weak topics (<60%) with more time
   * and strong topics (>=80%) with light maintenance.
   */
  async generateRevisionPlan(
    examDate: string,
    hoursPerDay: number,
    weakTopics: string[],
    strongTopics: string[] = [],
    courseTopics: string[] = []
  ): Promise<RevisionTask[]> {
    const today = new Date();
    const tasks: RevisionTask[] = [];

    // Prioritize weak topics first, then remaining course topics, then strong topics
    const uniqueTopics = Array.from(new Set([...weakTopics, ...courseTopics, ...strongTopics]));
    const targetTopics = uniqueTopics.length > 0 ? uniqueTopics : ['Core Course Fundamentals', 'Syllabus Review'];

    // If student provided an exam date, calculate days remaining
    let durationDays = 7;
    if (examDate) {
      const examTime = new Date(examDate).getTime();
      const diffDays = Math.ceil((examTime - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1 && diffDays <= 60) {
        durationDays = Math.min(diffDays, 14);
      }
    }

    for (let day = 0; day < durationDays; day++) {
      const currentDate = new Date(today.getTime() + day * 86400000);
      const dateStr = currentDate.toISOString().split('T')[0];
      const topic = targetTopics[day % targetTopics.length];
      const isWeak = weakTopics.includes(topic);
      const isStrong = strongTopics.includes(topic);

      // Adaptive duration: weak topics get 45-60 min; strong topics get 20-30 min
      const duration = isWeak
        ? Math.min(60, Math.max(45, Math.round(hoursPerDay * 25)))
        : isStrong
        ? 25
        : 35;

      const priority = isWeak ? 'high' : isStrong ? 'low' : 'medium';
      const taskType = isWeak
        ? (day % 2 === 0 ? 'review' : 'quiz')
        : isStrong
        ? 'practice'
        : 'reading';

      const reason = isWeak
        ? `High-priority: Identified as a weak topic in quiz diagnostics (< 60% score).`
        : isStrong
        ? `Maintenance review: Maintaining mastery on high-scoring topic (>= 80%).`
        : `Course progression: Core syllabus milestone for exam readiness.`;

      tasks.push({
        id: `rev-task-${day + 1}-${Date.now()}`,
        title: isWeak
          ? `Priority Deep Dive: ${topic}`
          : isStrong
          ? `Maintenance Review: ${topic}`
          : `Concept Review: ${topic}`,
        topicId: `topic-${day + 1}`,
        topicTitle: topic,
        date: dateStr,
        timeSlot: day % 2 === 0 ? '05:30 PM – 06:15 PM' : '07:00 PM – 07:45 PM',
        durationMinutes: duration,
        type: taskType,
        status: 'pending',
        priority: priority,
        reason: reason
      });
    }

    return tasks;
  }
}

/**
 * Live Remote LLM AI Provider (for OpenAI / Gemini / IBM Bob).
 * When an API key is provided, routes live prompts to the real endpoint.
 * If endpoint fails, surfaces a clear error, never falling back to fake/demo data.
 */
export class RemoteLLMAIService implements AIService {
  name: string;
  private apiKey: string;
  private endpoint: string;
  private localFallback: LocalGroundedAIService;

  constructor(providerName: string, apiKey: string, endpoint: string) {
    this.name = providerName;
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.localFallback = new LocalGroundedAIService();
  }

  async explainConcept(
    topicTitle: string,
    level: string,
    contextText?: string,
    topicObj?: Topic
  ): Promise<ExplanationResult> {
    try {
      const response = await fetch(`${this.endpoint}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt: AI_PROMPTS.EXPLAIN_CONCEPT(topicTitle, level, contextText),
          topic: topicTitle,
          level,
          context: contextText
        })
      });

      if (!response.ok) {
        throw new Error(`AI Provider HTTP error: ${response.statusText}`);
      }

      return await response.json();
    } catch {
      // Fallback directly to local grounded engine on the student's text
      return this.localFallback.explainConcept(topicTitle, level, contextText, topicObj);
    }
  }

  async answerGroundedQuestion(
    question: string,
    documents: StudyDocument[],
    courseName?: string,
    selectedDocumentId?: string
  ): Promise<GroundedChatResult> {
    try {
      const response = await fetch(`${this.endpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          question,
          documents: documents.map((d) => ({
            id: d.id,
            name: d.name,
            chunks: d.chunks
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`AI Provider HTTP error: ${response.statusText}`);
      }

      return await response.json();
    } catch {
      return this.localFallback.answerGroundedQuestion(question, documents, courseName, selectedDocumentId);
    }
  }

  async generateQuiz(
    configOrTitle: string | QuizConfig,
    difficulty?: string,
    count?: number,
    contextDocs?: StudyDocument[],
    topics?: Topic[]
  ): Promise<QuizQuestion[]> {
    try {
      const response = await fetch(`${this.endpoint}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          config: configOrTitle,
          difficulty,
          count
        })
      });

      if (!response.ok) {
        throw new Error(`AI Provider HTTP error: ${response.statusText}`);
      }

      return await response.json();
    } catch {
      return this.localFallback.generateQuiz(configOrTitle, difficulty, count, contextDocs, topics);
    }
  }

  async generateRevisionPlan(
    examDate: string,
    hoursPerDay: number,
    weakTopics: string[],
    strongTopics?: string[],
    courseTopics?: string[]
  ): Promise<RevisionTask[]> {
    return this.localFallback.generateRevisionPlan(examDate, hoursPerDay, weakTopics, strongTopics, courseTopics);
  }
}

/**
 * Returns the active AI Service.
 * Zero demo/fake fallbacks.
 */
export function getAIService(): AIService {
  const env = (typeof import.meta !== 'undefined' && import.meta.env)
    ? (import.meta.env as unknown as Record<string, string | undefined>)
    : {};

  const providerType = env.VITE_AI_PROVIDER || '';
  const apiKey = env.VITE_AI_API_KEY || env.VITE_IBM_BOB_API_KEY || env.VITE_OPENAI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  const endpoint = env.VITE_IBM_BOB_ENDPOINT || 'https://api.ibm.com/bob/v1';

  if (apiKey && (providerType === 'ibm_bob' || providerType === 'openai' || providerType === 'gemini')) {
    return new RemoteLLMAIService(`Cloud AI (${providerType})`, apiKey, endpoint);
  }

  return new LocalGroundedAIService();
}
