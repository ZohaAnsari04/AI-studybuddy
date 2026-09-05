import { AcademicValidationResult, MaterialType } from '../../types';
import { ExtractedDocumentContent } from '../documents/textExtractor';

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'txt', 'md'];

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'application/octet-stream', // often returned by browsers for certain docx/pptx
];

/**
 * Reads max upload size from environment or defaults to 25MB
 */
export function getMaxUploadSizeMB(): number {
  const envVal = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_MAX_UPLOAD_SIZE_MB : undefined;
  const parsed = envVal ? parseInt(envVal, 10) : 25;
  return isNaN(parsed) || parsed <= 0 ? 25 : parsed;
}

/**
 * Level 1: Initial file validation (extension, mime type, file size)
 */
export function validateFileFormat(file: File): { isValid: boolean; error?: string } {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload academic material in PDF, DOCX, PPTX, TXT, or Markdown format.',
    };
  }

  // Basic MIME check if browser provided one
  if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type) && !file.type.startsWith('text/')) {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload academic material in PDF, DOCX, PPTX, TXT, or Markdown format.',
    };
  }

  const maxSizeMB = getMaxUploadSizeMB();
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `This file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). The maximum allowed size is ${maxSizeMB} MB. Please upload a smaller document.`,
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: "This file is empty and doesn't contain readable content to use as study material.",
    };
  }

  return { isValid: true };
}

// Subject detection dictionary with specific patterns and prominent title matching
const SUBJECT_PATTERNS: { name: string; regex: RegExp; titleRegex: RegExp }[] = [
  {
    name: 'Software Engineering',
    regex: /\b(software engineering|software process|process models?|waterfall model|agile process|scrum|extreme programming|sdlc|requirements engineering|system models?|uml diagrams?|design engineering|software architecture|black-box testing|white-box testing|software quality|cmmi|rmmm|risk management|software reliability|iso 9000|software metrics)\b/i,
    titleRegex: /\b(software engineering|software process|software design)\b/i
  },
  {
    name: 'Data Structures & Algorithms',
    regex: /\b(data structures?|linked lists?|binary trees?|binary search tree|avl tree|red-black tree|graph algorithms?|stack and queue|sorting algorithms?|asymptotic notation|big-o|hashing|recursion|dynamic programming|dijkstra|breadth-first search|depth-first search)\b/i,
    titleRegex: /\b(data structures?|algorithms? and data structures?|design and analysis of algorithms?)\b/i
  },
  {
    name: 'Operating Systems',
    regex: /\b(operating systems?|process scheduling|deadlock|semaphore|virtual memory|paging|threading|system calls|file systems|concurrency|ipc)\b/i,
    titleRegex: /\b(operating systems?)\b/i
  },
  {
    name: 'Database Management Systems',
    regex: /\b(database management|dbms|sql|relational model|normalization|er diagram|indexing|b-tree|acid properties|transactions|query processing)\b/i,
    titleRegex: /\b(database|dbms|rdbms)\b/i
  },
  {
    name: 'Computer Networks',
    regex: /\b(computer networks?|tcp\/ip|osi model|packet switching|routing algorithms|ip addressing|dns|transport layer|network security|firewall)\b/i,
    titleRegex: /\b(computer networks?|data communications?)\b/i
  },
  {
    name: 'Machine Learning & AI',
    regex: /\b(machine learning|deep learning|neural networks?|supervised learning|classification|regression|nlp|gradient descent|reinforcement learning|transformers)\b/i,
    titleRegex: /\b(machine learning|artificial intelligence)\b/i
  },
  {
    name: 'Mathematics & Calculus',
    regex: /\b(calculus|linear algebra|eigenvalues?|matrix multiplication|differential equations?|probability and statistics|discrete mathematics|integration|limits|derivatives)\b/i,
    titleRegex: /\b(mathematics|calculus|linear algebra)\b/i
  },
  {
    name: 'Digital Logic & Architecture',
    regex: /\b(computer architecture|digital logic|boolean algebra|karnaugh map|multiplexer|alu|pipeline|cache memory|microprocessor|instruction set|mips)\b/i,
    titleRegex: /\b(computer architecture|digital logic|computer organization)\b/i
  },
  {
    name: 'Physics & Electrical',
    regex: /\b(thermodynamics|fluid mechanics|electromagnetism|quantum mechanics|circuits|kirchhoff|semiconductor|transistors|ohms law)\b/i,
    titleRegex: /\b(physics|electrical engineering|circuit theory)\b/i
  },
  {
    name: 'Economics & Management',
    regex: /\b(microeconomics|macroeconomics|market equilibrium|supply and demand|elasticity|financial accounting|business administration|organizational behavior)\b/i,
    titleRegex: /\b(economics|management|accounting)\b/i
  },
  {
    name: 'Biology & Life Sciences',
    regex: /\b(cellular biology|genetics|dna|rna|protein synthesis|biochemistry|photosynthesis|evolution|ecology|microbiology)\b/i,
    titleRegex: /\b(biology|life sciences|genetics)\b/i
  },
  {
    name: 'Chemistry',
    regex: /\b(organic chemistry|inorganic chemistry|molecular structure|periodic table|stoichiometry|chemical bonding|chemical kinetics|chemical equilibrium)\b/i,
    titleRegex: /\b(chemistry|chemical)\b/i
  },
];

/**
 * Level 2: Academic Content Validation
 * Analyzes extracted text to classify whether it is genuine academic/study material.
 */
export async function classifyAcademicContent(
  filename: string,
  content: ExtractedDocumentContent
): Promise<AcademicValidationResult> {
  const { text, sampleText, isScanned, wordCount } = content;

  // Check minimum readable text
  if (wordCount < 15 || text.trim().length < 60) {
    if (isScanned) {
      return {
        isAcademic: false,
        classification: 'uncertain',
        confidence: 0.92,
        materialType: 'unrelated',
        reason: "This scanned document contains no selectable or readable text. Please upload a clear digital document or OCR-readable study material.",
      };
    }
    return {
      isAcademic: false,
      classification: 'non_academic',
      confidence: 0.98,
      materialType: 'unrelated',
      reason: "This file doesn't contain enough readable content to use as study material.",
    };
  }

  const cleanSample = (sampleText + ' ' + text.slice(0, 4000)).toLowerCase();
  const lowerFilename = filename.toLowerCase();

  // ==========================================
  // 1. HARD REJECTION PATTERN MATCHERS
  // ==========================================

  // (A) Resume / CV Detection
  const resumeKeywords = [
    'curriculum vitae', 'resume', 'work experience', 'employment history',
    'professional summary', 'career objective', 'job experience',
    'references available upon request', 'technical skills:', 'experience:',
    'responsibilities included', 'key achievements', 'education:', 'contact info'
  ];
  let resumeScore = 0;
  for (const kw of resumeKeywords) {
    if (cleanSample.includes(kw)) resumeScore++;
  }
  if (lowerFilename.includes('resume') || lowerFilename.includes('cv')) {
    resumeScore += 3;
  }
  // If strong resume indicators
  if (resumeScore >= 3 || (resumeScore >= 2 && /\b(phone|email|linkedin\.com|github\.com)\b/i.test(cleanSample))) {
    return {
      isAcademic: false,
      classification: 'non_academic',
      confidence: 0.98,
      materialType: 'resume',
      reason: "This file appears to be a personal resume or CV and does not contain academic study material.",
    };
  }

  // (B) Invoices / Receipts / Financial Records
  const invoicePatterns = [
    /\b(invoice number|invoice date|tax invoice|bill to:|ship to:|subtotal:|total due:|amount paid|due date:|payment terms|remittance|bank transfer|swift code|iban|account balance|statement of account)\b/i,
    /\b(receipt no|cash receipt|payment method:|item\s+qty\s+rate\s+amount|gstin|vat no)\b/i,
  ];
  let invoiceScore = 0;
  for (const pat of invoicePatterns) {
    if (pat.test(cleanSample)) invoiceScore += 2;
  }
  if (lowerFilename.includes('invoice') || lowerFilename.includes('receipt') || lowerFilename.includes('bill') || lowerFilename.includes('statement')) {
    invoiceScore += 2;
  }
  if (invoiceScore >= 2) {
    return {
      isAcademic: false,
      classification: 'non_academic',
      confidence: 0.97,
      materialType: 'invoice',
      reason: "This document appears to be an invoice, receipt, or financial statement and cannot be accepted as study material.",
    };
  }

  // (C) Identity & Personal Documents
  const idPatterns = [
    /\b(aadhaar card|passport no|driving licen[sc]e|permanent account number|pan card|social security number|ssn|voter identity card|birth certificate)\b/i,
  ];
  if (idPatterns.some(p => p.test(cleanSample)) || lowerFilename.includes('aadhaar') || lowerFilename.includes('passport')) {
    return {
      isAcademic: false,
      classification: 'non_academic',
      confidence: 0.99,
      materialType: 'personal_doc',
      reason: "This document appears to be a personal or identification record (e.g. ID, passport, card). Personal documents are prohibited for safety and privacy.",
    };
  }

  // (D) Entertainment / Scripts / Fiction
  const entertainmentPatterns = [
    /\b(scene \d+|int\.\s+[a-z]+|ext\.\s+[a-z]+|fade in:|fade out:|screenplay by|directed by|cast of characters|lyrics by|chorus:|verse 1:|verse 2:)\b/i,
  ];
  if (entertainmentPatterns.some(p => p.test(cleanSample)) || lowerFilename.includes('movie') || lowerFilename.includes('screenplay') || lowerFilename.includes('lyrics')) {
    return {
      isAcademic: false,
      classification: 'non_academic',
      confidence: 0.96,
      materialType: 'entertainment',
      reason: "This file appears to be entertainment content (such as a screenplay, lyrics, or fiction) rather than course study material.",
    };
  }

  // (E) Legal contracts / Commercial agreements
  const legalPatterns = [
    /\b(non-disclosure agreement|confidentiality agreement|hereby agree and covenant|tenant and landlord|rental agreement|terms of employment|indemnification clause)\b/i,
  ];
  if (legalPatterns.some(p => p.test(cleanSample))) {
    return {
      isAcademic: false,
      classification: 'non_academic',
      confidence: 0.95,
      materialType: 'unrelated',
      reason: "This document appears to be a legal contract or business agreement and is not educational study material.",
    };
  }

  // ==========================================
  // 2. POSITIVE ACADEMIC PATTERN MATCHERS
  // ==========================================

  // ==========================================
  // 2. POSITIVE ACADEMIC PATTERN MATCHERS
  // ==========================================

  let academicScore = 0;
  const firstPagesText = (content.pages.slice(0, 2).join('\n') || text.slice(0, 3000));
  const lowerFirstPages = firstPagesText.toLowerCase();

  // Detect Material Type with primary weight on cover page & content
  let detectedMaterialType: MaterialType = 'lecture_notes';
  const isExplicitLectureNotes = /\b(lecture notes|lecture-notes|class notes)\b/i.test(lowerFirstPages) ||
    /\b(lecture notes|lecture-notes|class notes)\b/i.test(lowerFilename);

  if (isExplicitLectureNotes) {
    academicScore += 5;
    detectedMaterialType = 'lecture_notes';
  } else if (/\b(question paper|previous year|end semester examination|mid semester|marks:\s*\d+|answer any \d|solve the following|q\.\s*\d+|section [a-c]|question bank|sample paper|model exam)\b/i.test(cleanSample)) {
    academicScore += 4;
    detectedMaterialType = 'question_paper';
  } else if (/\b(assignment \d|homework \d|problem set|tutorial sheet|submission date|dead line|roll no:|student id:|due date:.*assignment)\b/i.test(cleanSample)) {
    academicScore += 3;
    detectedMaterialType = 'assignment';
  } else if (/\b(lab manual|experiment \d|laboratory manual|apparatus required|circuit diagram|procedure:|observations|tabulation|viva-voce|viva questions|precautions|aim of the experiment)\b/i.test(cleanSample)) {
    academicScore += 4;
    detectedMaterialType = 'lab_manual';
  } else if (/\b(revision notes|summary sheet|formula sheet|cheat sheet|key points to remember|recap of unit|quick review)\b/i.test(cleanSample)) {
    academicScore += 3;
    detectedMaterialType = 'revision_material';
  } else if (/\b(table of contents|chapter \d+|section \d+\.\d+|isbn|preface|bibliography|references\s*\[\d+\]|index\s*\d+|theorem \d+|definition \d+|abstract\b.*introduction\b)/i.test(cleanSample)) {
    academicScore += 4;
    detectedMaterialType = 'textbook';
  } else if (/\b(syllabus|course curriculum|course outline|course objectives|prerequisites|grading scheme|credit hours|semester \d|course code|lecture schedule|course structure)\b/i.test(cleanSample)) {
    academicScore += 4;
    detectedMaterialType = 'syllabus';
  }

  // Core Educational & Conceptual signals
  const educationalConceptRegex = /\b(definition:|theorem|lemma|proof:|algorithm|properties of|principles of|introduction to|overview of|classification of|architecture of|types of|advantages and disadvantages|applications of|working principle|block diagram|state diagram|flowchart)\b/gi;
  const conceptMatches = cleanSample.match(educationalConceptRegex);
  if (conceptMatches) {
    academicScore += Math.min(5, conceptMatches.length);
  }

  // ==========================================
  // ACCURATE SUBJECT IDENTIFICATION ENGINE
  // Priority: Cover Page / Title > High-Frequency Keywords > Filename
  // ==========================================
  interface SubjectScore {
    name: string;
    score: number;
  }

  const subjectScores: SubjectScore[] = SUBJECT_PATTERNS.map((sub) => {
    let score = 0;

    // 1. Cover page title match (+45 points)
    if (sub.titleRegex.test(lowerFirstPages)) {
      score += 45;
    }

    // 2. Filename supporting match (+25 points)
    if (sub.titleRegex.test(lowerFilename)) {
      score += 25;
    }

    // 3. First page occurrences (+15 points each)
    const firstPageMatches = lowerFirstPages.match(new RegExp(sub.regex.source, 'gi'));
    if (firstPageMatches) {
      score += firstPageMatches.length * 15;
    }

    // 4. Sample text occurrences (+3 points each)
    const sampleMatches = cleanSample.match(new RegExp(sub.regex.source, 'gi'));
    if (sampleMatches) {
      score += sampleMatches.length * 3;
    }

    return { name: sub.name, score };
  });

  subjectScores.sort((a, b) => b.score - a.score);
  const bestSubject = subjectScores[0];
  const detectedSubject = bestSubject && bestSubject.score >= 5 ? bestSubject.name : undefined;

  if (detectedSubject) {
    academicScore += 4;
  }

  // Filename signals (secondary/weak signal)
  if (/\b(notes|lecture|syllabus|unit|chapter|paper|assignment|quiz|exam|tutorial|module|lab|textbook|guide)\b/i.test(lowerFilename)) {
    academicScore += 1;
  }

  // Academic Presentation check
  if (filename.endsWith('.pptx')) {
    detectedMaterialType = 'academic_presentation';
  }

  // ==========================================
  // 3. DECISION ENGINE
  // ==========================================

  // If score is high -> Approved academic
  if (academicScore >= 3) {
    const confidence = Math.min(0.99, 0.82 + (academicScore * 0.03));
    const subLabel = detectedSubject || extractTitleSubject(firstPagesText) || 'Academic Study';
    const matLabel = detectedMaterialType.replace('_', ' ');

    return {
      isAcademic: true,
      classification: 'academic',
      confidence: Number(confidence.toFixed(2)),
      materialType: detectedMaterialType,
      subject: subLabel,
      topic: extractProbableTopic(firstPagesText || cleanSample),
      reason: `Verified ${matLabel} containing educational principles in ${subLabel}.`,
      extractedSnippet: sampleText.slice(0, 300),
    };
  }

  // Moderate score with some educational words -> If it seems academic
  if (academicScore >= 1) {
    if (wordCount > 100) {
      return {
        isAcademic: true,
        classification: 'academic',
        confidence: 0.85,
        materialType: detectedMaterialType,
        subject: detectedSubject || extractTitleSubject(firstPagesText) || 'Course Materials',
        topic: extractProbableTopic(firstPagesText || cleanSample),
        reason: `Contains academic study text covering theoretical and conceptual topics.`,
        extractedSnippet: sampleText.slice(0, 300),
      };
    }
  }

  // Low confidence / Ambiguous case
  return {
    isAcademic: false,
    classification: 'uncertain',
    confidence: 0.65,
    materialType: 'other_academic',
    reason: "This material couldn't be verified as study-related. Please upload academic material such as notes, syllabus, textbooks, assignments, question papers, or lecture material.",
  };
}

/**
 * Extracts a prominent subject title directly from the cover/first pages
 */
function extractTitleSubject(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 3 && l.length < 50);
  for (const line of lines.slice(0, 8)) {
    // Check if line looks like an academic subject title
    if (!/^(page|unit|chapter|department|b\.tech|r\d+|lecture notes|index|contents|\d+)/i.test(line)) {
      if (/^[A-Z\s]{4,}$/.test(line)) {
        return line.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
  }
  return undefined;
}

/**
 * Extracts a likely main topic title from the first lines of text
 */
function extractProbableTopic(sample: string): string {
  const lines = sample.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    if (line.length > 4 && line.length < 60 && !/^(page|slide|\d+|contents|department|b\.tech|lecture notes)/i.test(line)) {
      return line.charAt(0).toUpperCase() + line.slice(1);
    }
  }
  return 'Key Academic Concepts';
}
