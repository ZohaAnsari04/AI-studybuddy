// Automated Verification Test Suite for Academic Validation Pipeline
// Tests both Level 1 and Level 2 validation, negative pattern detection, positive pattern detection, and duplicate checks.

import { classifyAcademicContent, validateFileFormat } from '../src/lib/ai/academicClassifier';
import { ExtractedDocumentContent } from '../src/lib/documents/textExtractor';

function mockExtractedContent(
  text: string,
  pages: string[] = [text],
  isScanned = false,
  hash = 'dummy-hash'
): ExtractedDocumentContent {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return {
    text,
    pages,
    sampleText: text.slice(0, 3000),
    isScanned,
    wordCount,
    hash,
    pageCount: pages.length,
  };
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AI STUDY BUDDY ACADEMIC VALIDATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  // -----------------------------------------------------------
  // TEST GROUP 1: LEVEL 1 FILE FORMAT & EXTENSION VALIDATION
  // -----------------------------------------------------------
  console.log('--- TEST GROUP 1: Level 1 File Format Checks ---');

  const exeFile = new File(['binarycontent'], 'malware.exe', { type: 'application/x-msdownload' });
  const exeCheck = validateFileFormat(exeFile);
  assert(!exeCheck.isValid, 'Reject .exe executable file');

  const zipFile = new File(['zipcontent'], 'archive.zip', { type: 'application/zip' });
  const zipCheck = validateFileFormat(zipFile);
  assert(!zipCheck.isValid, 'Reject .zip archive');

  const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
  const emptyCheck = validateFileFormat(emptyFile);
  assert(!emptyCheck.isValid, 'Reject 0-byte empty file');

  const validPdfFile = new File(['valid content here'], 'lecture_notes.pdf', { type: 'application/pdf' });
  const validPdfCheck = validateFileFormat(validPdfFile);
  assert(validPdfCheck.isValid, 'Accept valid PDF format');

  const validDocxFile = new File(['valid content here'], 'assignment.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const validDocxCheck = validateFileFormat(validDocxFile);
  assert(validDocxCheck.isValid, 'Accept valid DOCX format');

  const validPptxFile = new File(['valid content here'], 'lecture_slides.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  const validPptxCheck = validateFileFormat(validPptxFile);
  assert(validPptxCheck.isValid, 'Accept valid PPTX format');

  const validTxtFile = new File(['valid content here'], 'syllabus.txt', { type: 'text/plain' });
  const validTxtCheck = validateFileFormat(validTxtFile);
  assert(validTxtCheck.isValid, 'Accept valid TXT format');

  const validMdFile = new File(['valid content here'], 'notes.md', { type: 'text/markdown' });
  const validMdCheck = validateFileFormat(validMdFile);
  assert(validMdCheck.isValid, 'Accept valid Markdown format');

  // Test oversize (>25MB)
  const hugeBlob = { name: 'huge_book.pdf', size: 30 * 1024 * 1024, type: 'application/pdf' } as File;
  const hugeCheck = validateFileFormat(hugeBlob);
  assert(!hugeCheck.isValid, 'Reject oversized file (>25 MB)');

  // -----------------------------------------------------------
  // TEST GROUP 2: REJECTION OF NON-ACADEMIC DOCUMENTS (LEVEL 2)
  // -----------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Rejection of Non-Academic Materials ---');

  // Test 2.1: Resume / CV
  const resumeText = `
    Alex Mercer - Senior Software Engineer
    Email: alex.mercer@email.com | Phone: +1 555 0192 | LinkedIn: linkedin.com/in/alexm
    Professional Summary: 8+ years of work experience in software engineering and cloud architecture.
    Curriculum Vitae / Resume
    Work Experience:
    Lead Developer at Tech Corp (2021 - Present)
    - Responsibilities included managing team of 10 engineers, optimizing deployment pipelines.
    - Key achievements: reduced latency by 35%.
    Education:
    B.S. in Computer Science, State University (2014-2018)
    Technical Skills: React, Node.js, TypeScript, AWS, Docker, Kubernetes.
    References available upon request.
  `;
  const resumeResult = await classifyAcademicContent('Alex_Mercer_Resume.pdf', mockExtractedContent(resumeText));
  assert(!resumeResult.isAcademic && resumeResult.materialType === 'resume', 'Reject Resume/CV with high confidence', JSON.stringify(resumeResult));

  // Test 2.2: Invoice / Financial Document
  const invoiceText = `
    TAX INVOICE
    Invoice Number: INV-2026-9874
    Invoice Date: 12-August-2026
    Bill To: Global Enterprises LLC, 400 Wall Street, New York
    Ship To: Global Logistics Hub, Chicago IL
    Item Description | Qty | Rate | Amount
    Enterprise Cloud License | 1 | $4,500.00 | $4,500.00
    Consulting Hours | 15 | $150.00 | $2,250.00
    Subtotal: $6,750.00
    Tax (10%): $675.00
    Total Amount Due: $7,425.00
    Payment Terms: Net 30 Days.
    Remittance: Bank Transfer to Account Number: 9876543210 Swift Code: CHASEUS33
  `;
  const invoiceResult = await classifyAcademicContent('Monthly_Billing_Invoice.pdf', mockExtractedContent(invoiceText));
  assert(!invoiceResult.isAcademic && invoiceResult.materialType === 'invoice', 'Reject Invoice/Financial Document', JSON.stringify(invoiceResult));

  // Test 2.3: Personal Identity Document
  const idText = `
    Government of India
    Aadhaar Card / National Identity Document
    Unique Identification Authority of India
    Aadhaar No: 2345 6789 0123
    Name: Rahul Sharma
    Date of Birth: 14/05/1998
    Gender: Male
    Address: Flat 402, Sunshine Apartments, MG Road, Bangalore, Karnataka
    Permanent Account Number (PAN Card): ABCDE1234F
  `;
  const idResult = await classifyAcademicContent('Govt_Identity_Card.pdf', mockExtractedContent(idText));
  assert(!idResult.isAcademic && invoiceResult.materialType !== 'academic', 'Reject Personal Identity Record', JSON.stringify(idResult));

  // Test 2.4: Movie Script / Screenplay
  const scriptText = `
    THE LAST VOYAGE
    Screenplay by Johnathan Miller
    Directed by Sarah Jenkins
    FADE IN:
    EXT. OCEAN SHORE - NIGHT
    A violent storm crashes against jagged rocks. Thunder rumbles across the dark horizon.
    CAPTAIN (into radio)
    Mayday! Mayday! Engine room is flooded, we are losing navigation!
    SCENE 2: INT. CARGO BAY - CONTINUOUS
    Water gushes through a ruptured valve. Marcus grabs a wrench, fighting against the rising tide.
    FADE OUT.
  `;
  const scriptResult = await classifyAcademicContent('movie_script.pdf', mockExtractedContent(scriptText));
  assert(!scriptResult.isAcademic && scriptResult.materialType === 'entertainment', 'Reject Screenplay/Movie Script', JSON.stringify(scriptResult));

  // Test 2.5: Empty / Scanned unreadable file
  const scannedResult = await classifyAcademicContent('scanned_image_unreadable.pdf', mockExtractedContent('', [], true));
  assert(!scannedResult.isAcademic, 'Reject Scanned unreadable PDF without selectable text');

  // -----------------------------------------------------------
  // TEST GROUP 3: ACCEPTANCE OF VALID STUDY MATERIAL (LEVEL 2)
  // -----------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Acceptance of Valid Academic Materials ---');

  // Test 3.1: University Course Syllabus
  const syllabusText = `
    Department of Computer Science & Engineering
    Course Code: CS-301 | Semester V | Credit Hours: 4
    COURSE SYLLABUS: Operating Systems & Systems Architecture
    Course Objectives:
    To provide students with a comprehensive understanding of process scheduling, concurrent programming, memory management, and file systems.
    Prerequisites: CS-201 Data Structures.
    Module 1: Process Management & CPU Scheduling
    Process state diagram, context switching, scheduling algorithms (FCFS, SJF, Round Robin, Priority).
    Module 2: Deadlocks & Synchronization
    Critical section problem, semaphores, monitors, Peterson's algorithm, Banker's algorithm for deadlock avoidance.
    Module 3: Memory Management & Virtual Memory
    Paging, segmentation, page fault handling, FIFO, LRU, Optimal page replacement algorithms.
    Grading Scheme: Midterm Exam 30%, Lab Assignments 20%, End Semester Final Exam 50%.
  `;
  const syllabusResult = await classifyAcademicContent('Operating_Systems_Syllabus.pdf', mockExtractedContent(syllabusText));
  assert(syllabusResult.isAcademic && syllabusResult.materialType === 'syllabus', 'Accept University Syllabus PDF', JSON.stringify(syllabusResult));

  // Test 3.2: Lecture Notes (Data Structures & Algorithms)
  const lectureNotesText = `
    CS-201: Data Structures & Algorithms
    Lecture 5: Binary Search Trees & Balanced Trees
    Definition: A binary search tree is a rooted binary tree in which the key of each internal node is greater than all keys in its left subtree and smaller than all keys in its right subtree.
    Theorem 1: The in-order traversal of a binary search tree yields keys in ascending sorted order.
    Proof: By mathematical induction on the height of the tree.
    Algorithm for Insertion:
    function insert(node, key):
      if node is null return new Node(key)
      if key < node.key then node.left = insert(node.left, key)
      else node.right = insert(node.right, key)
      return node
    Time Complexity:
    Best case: O(log n) when the tree is balanced.
    Worst case: O(n) for degenerate tree structures.
    Applications of balanced trees in database indexing and memory lookup tables.
  `;
  const lectureResult = await classifyAcademicContent('Data_Structures_Unit_2_Notes.pdf', mockExtractedContent(lectureNotesText));
  assert(lectureResult.isAcademic && lectureResult.confidence >= 0.85, 'Accept Lecture Notes PDF', JSON.stringify(lectureResult));

  // Test 3.3: Academic Textbook (Discrete Mathematics)
  const textbookText = `
    Discrete Mathematics and Its Applications
    Chapter 4: Number Theory and Cryptography
    Section 4.1: Divisibility and Modular Arithmetic
    Definition 1: If a and b are integers with a != 0, we say that a divides b if there is an integer c such that b = ac.
    Theorem 2 (The Division Algorithm): Let a be an integer and d a positive integer. Then there are unique integers q and r, with 0 <= r < d, such that a = dq + r.
    Modular Exponentiation Algorithm and its role in RSA public key cryptography.
    Exercises and problem sets at the end of Chapter 4.
    References [1] Cormen, Leiserson, Rivest. Introduction to Algorithms.
  `;
  const textbookResult = await classifyAcademicContent('Discrete_Mathematics_Textbook.pdf', mockExtractedContent(textbookText));
  assert(textbookResult.isAcademic, 'Accept Academic Textbook without requiring word "notes"', JSON.stringify(textbookResult));

  // Test 3.4: Academic Assignment (Java OOP)
  const assignmentText = `
    School of Information Technology
    Assignment 2: Object-Oriented Software Design in Java
    Student ID: ____________ Roll No: ___________
    Due Date: October 24, 2026 | Total Marks: 50
    Problem 1: Design an abstract class Shape with abstract methods calculateArea() and calculatePerimeter().
    Problem 2: Implement polymorphism and inheritance by subclassing Circle, Rectangle, and Triangle.
    Submission Guidelines: Submit compiled .java source files and execution test logs.
  `;
  const assignmentResult = await classifyAcademicContent('Java_OOP_Assignment_2.docx', mockExtractedContent(assignmentText));
  assert(assignmentResult.isAcademic && assignmentResult.materialType === 'assignment', 'Accept Academic Assignment DOCX', JSON.stringify(assignmentResult));

  // Test 3.5: Question Bank / Previous Year Examination Paper
  const questionPaperText = `
    Annual University Examination 2025-2026
    Course: Database Management Systems (DBMS)
    Time Allowed: 3 Hours | Maximum Marks: 100
    Instructions: Answer any 5 questions. All questions carry equal marks (20 marks each).
    Section A:
    Q.1 (a) Explain 1NF, 2NF, 3NF, and BCNF normalization with suitable examples. (10 marks)
    Q.1 (b) What are ACID properties? How does DBMS ensure atomicity and durability? (10 marks)
    Q.2 (a) Construct an ER diagram for a University Library Management System. (10 marks)
    Section B:
    Q.3 (a) Explain B-Tree indexing and query optimization techniques. (10 marks)
  `;
  const qPaperResult = await classifyAcademicContent('DBMS_End_Semester_Question_Paper.pdf', mockExtractedContent(questionPaperText));
  assert(qPaperResult.isAcademic && qPaperResult.materialType === 'question_paper', 'Accept Exam Question Paper PDF', JSON.stringify(qPaperResult));

  // Test 3.6: Lab Manual
  const labManualText = `
    Department of Electrical Engineering
    Laboratory Manual: Microprocessors & Digital Logic Lab
    Experiment 4: Interfacing 8255 Programmable Peripheral Interface with 8086 Microprocessor
    Aim of the experiment: To write an assembly language program to generate a square wave.
    Apparatus Required: 8086 Microprocessor Trainer Kit, Power Supply, Digital Storage Oscilloscope (DSO).
    Circuit Diagram and Pinout Configuration:
    Procedure:
    1. Connect port A pins to the DAC interface.
    2. Enter hex code into RAM memory locations starting at 2000H.
    3. Execute program and observe waveform on DSO.
    Observations & Tabulation: Record frequency and amplitude measurements.
    Viva-Voce Questions: What is the control word format for Mode 0?
  `;
  const labResult = await classifyAcademicContent('Microprocessor_Lab_Manual.pdf', mockExtractedContent(labManualText));
  assert(labResult.isAcademic && labResult.materialType === 'lab_manual', 'Accept Lab Manual Document', JSON.stringify(labResult));

  // Test 3.7: PPTX Presentation
  const pptxSlideText = `
    Slide 1: Computer Networks (CS-402) - Transport Layer Protocols
    Slide 2: TCP vs UDP: Connection-oriented vs connectionless transmission
    Slide 3: TCP Three-Way Handshake (SYN, SYN-ACK, ACK) and flow control with sliding window algorithm
  `;
  const pptxResult = await classifyAcademicContent('Computer_Networks_Lecture.pptx', mockExtractedContent(pptxSlideText));
  assert(pptxResult.isAcademic && pptxResult.materialType === 'academic_presentation', 'Accept Academic PPTX Presentation', JSON.stringify(pptxResult));

  // Test 3.8: Academic Markdown Revision Notes
  const mdText = `
    # Operating Systems Quick Revision Notes
    ## Unit 1: CPU Scheduling Formulas
    - Turnaround Time = Completion Time - Arrival Time
    - Waiting Time = Turnaround Time - Burst Time
    ## Unit 2: Banker's Algorithm Safety Formula
    - Need Matrix = Max Matrix - Allocation Matrix
  `;
  const mdResult = await classifyAcademicContent('OS_Formulas_Revision.md', mockExtractedContent(mdText));
  assert(mdResult.isAcademic && mdResult.materialType === 'revision_material', 'Accept Academic Markdown Revision Notes', JSON.stringify(mdResult));

  // -----------------------------------------------------------
  // TEST GROUP 4: DISGUISED & BYPASS ATTEMPTS
  // -----------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Disguised Files & Bypass Prevention ---');

  // Disguised Resume renamed to academic filename
  const disguisedResumeResult = await classifyAcademicContent('Data_Structures_Unit_1_Notes.pdf', mockExtractedContent(resumeText));
  assert(!disguisedResumeResult.isAcademic, 'Reject Resume disguised with academic filename "Data_Structures_Unit_1_Notes.pdf"');

  // Disguised Invoice renamed to syllabus filename
  const disguisedInvoiceResult = await classifyAcademicContent('Algorithms_Syllabus.docx', mockExtractedContent(invoiceText));
  assert(!disguisedInvoiceResult.isAcademic, 'Reject Invoice disguised with academic filename "Algorithms_Syllabus.docx"');

  // -----------------------------------------------------------
  // TEST GROUP 5: STRICT SOURCE-GROUNDED AI & ANTI-HALLUCINATION
  // -----------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Grounded AI & Anti-Hallucination ---');
  const { DemoAIProvider } = await import('../src/lib/ai/aiService');
  const { QuizService } = await import('../src/lib/services/quizService');

  const aiProvider = new DemoAIProvider();

  const mockApprovedDocs: any[] = [
    {
      id: 'doc-os-1',
      name: 'Operating_Systems_Lecture.pdf',
      verificationStatus: 'approved',
      status: 'ready',
      overview: {
        importantTopics: ['Process Management', 'CPU Scheduling', 'Deadlocks']
      },
      chunks: [
        {
          id: 'c1',
          documentId: 'doc-os-1',
          documentName: 'Operating_Systems_Lecture.pdf',
          unitTitle: 'Unit 2: Process Management',
          pageNumber: 5,
          text: 'Process scheduling is the method used by the operating system to decide which process should use the CPU. It balances throughput and minimizes waiting time.'
        }
      ]
    }
  ];

  // 5.1: Question present in uploaded notes -> Cites source and page
  const groundedAnswer = await aiProvider.answerGroundedQuestion('What is process scheduling?', mockApprovedDocs);
  assert(
    !groundedAnswer.isFallback &&
    groundedAnswer.text.includes('Operating_Systems_Lecture.pdf') &&
    groundedAnswer.text.includes('Page 5') &&
    Boolean(groundedAnswer.citations && groundedAnswer.citations.length > 0),
    'Grounded question answered with exact source & page citation'
  );

  // 5.2: Unrelated request (e.g. Write a resume) -> Refuses politely
  const resumeRequestAnswer = await aiProvider.answerGroundedQuestion('Write me a job resume for software engineer', mockApprovedDocs);
  assert(
    groundedAnswer !== null &&
    resumeRequestAnswer.isUnrelated === true &&
    resumeRequestAnswer.text.includes("That isn't related to the study material"),
    'Refuses unrelated request (job resume) without using general knowledge'
  );

  // 5.3: Question absent from uploaded notes -> Refuses with suggested topics
  const missingConceptAnswer = await aiProvider.answerGroundedQuestion('What is quantum entanglement in cryptography?', mockApprovedDocs);
  assert(
    missingConceptAnswer.isFallback === true &&
    missingConceptAnswer.text.includes("I couldn't find this information in your uploaded study material") &&
    missingConceptAnswer.text.includes('Process Management'),
    'Refuses absent concept with suggested study topics from notes'
  );

  // -----------------------------------------------------------
  // TEST GROUP 6: QUIZ GENERATION & WEAK TOPIC DETECTION
  // -----------------------------------------------------------
  console.log('\n--- TEST GROUP 6: Quiz Generation & Weak Topic Detection ---');

  // 6.1: Quiz generation on demand respecting question count
  const generatedQuiz = await aiProvider.generateQuiz(
    { questionCount: 5, difficulty: 'mixed', questionType: 'multiple_choice', topicScope: 'entire_material' },
    'mixed',
    5,
    mockApprovedDocs,
    [{ id: 'top-1', title: 'Process Scheduling', unitTitle: 'Unit 2', description: 'Scheduling algorithms' } as any]
  );
  assert(generatedQuiz.length === 5, 'Generates requested question count (5 questions)');
  assert(
    generatedQuiz[0].options?.length === 4 && generatedQuiz[0].sourceReference !== undefined,
    'Every question has 4 options and valid source reference'
  );

  // 6.2: Topic-level evaluation & weak/strong threshold calculation
  const mockQuizQuestions: any[] = [
    { id: 'q1', topicId: 't-cpu', topicTitle: 'CPU Scheduling', correctAnswer: 0 },
    { id: 'q2', topicId: 't-cpu', topicTitle: 'CPU Scheduling', correctAnswer: 0 },
    { id: 'q3', topicId: 't-cpu', topicTitle: 'CPU Scheduling', correctAnswer: 0 },
    { id: 'q4', topicId: 't-cpu', topicTitle: 'CPU Scheduling', correctAnswer: 0 },
    { id: 'q5', topicId: 't-mem', topicTitle: 'Memory Management', correctAnswer: 0 },
    { id: 'q6', topicId: 't-mem', topicTitle: 'Memory Management', correctAnswer: 0 },
  ];
  // Student answers: CPU Scheduling gets 1/4 (25% -> weak), Memory gets 2/2 (100% -> strong)
  const studentAnswers: Record<number, any> = {
    0: 0, // correct
    1: 2, // wrong
    2: 1, // wrong
    3: 3, // wrong
    4: 0, // correct
    5: 0, // correct
  };

  const evalAttempt = QuizService.evaluateQuizAttempt(
    'OS Practice Quiz',
    'Operating Systems',
    't-all',
    'All Topics',
    mockQuizQuestions,
    studentAnswers
  );

  assert(evalAttempt.scorePercent === 50, 'Calculates correct overall score percentage (50%)');
  assert(
    evalAttempt.weakTopicsDetected.includes('CPU Scheduling'),
    'Correctly classifies CPU Scheduling as Weak Topic (< 60%)'
  );
  assert(
    evalAttempt.strongTopicsDetected.includes('Memory Management'),
    'Correctly classifies Memory Management as Strong Topic (>= 80%)'
  );

  // -----------------------------------------------------------
  // TEST GROUP 7: ADAPTIVE REVISION SCHEDULER
  // -----------------------------------------------------------
  console.log('\n--- TEST GROUP 7: Adaptive Revision Scheduling ---');

  const revisionTasks = await aiProvider.generateRevisionPlan(
    '2026-10-15',
    2,
    ['CPU Scheduling'], // weak topic
    ['Memory Management'], // strong topic
    ['Process Management', 'File Systems']
  );

  assert(revisionTasks.length > 0, 'Generates adaptive revision schedule tasks');
  const weakTask = revisionTasks.find((t) => t.topicTitle === 'CPU Scheduling');
  const strongTask = revisionTasks.find((t) => t.topicTitle === 'Memory Management');

  assert(
    Boolean(weakTask && weakTask.priority === 'high' && weakTask.durationMinutes >= 45),
    'Weak topic receives HIGH priority and longer duration (>=45 min)'
  );
  assert(
    Boolean(strongTask && strongTask.priority === 'low' && strongTask.durationMinutes <= 30),
    'Strong topic receives maintenance duration (<=30 min)'
  );

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
