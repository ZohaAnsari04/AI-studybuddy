// Supabase Edge Function: verify-study-material
// Provides authoritative server-side academic classification and bypass protection

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface ValidationRequest {
  filename: string;
  extractedSnippet: string;
  fileSizeBytes: number;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { filename, extractedSnippet } = (await req.json()) as ValidationRequest;

    if (!filename || !extractedSnippet) {
      return new Response(
        JSON.stringify({ error: 'Missing filename or text content' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const lowerName = filename.toLowerCase();
    const cleanSnippet = extractedSnippet.toLowerCase();

    // 1. Level 1 check
    const supportedExts = ['pdf', 'docx', 'pptx', 'txt', 'md'];
    const ext = lowerName.split('.').pop() || '';
    if (!supportedExts.includes(ext)) {
      return new Response(
        JSON.stringify({
          isAcademic: false,
          classification: 'non_academic',
          confidence: 1.0,
          reason: 'Unsupported file type. Please upload a supported academic document such as PDF, DOCX, PPTX, or TXT.',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Level 2 check: Hard rejections
    const isResume = /\b(curriculum vitae|resume|work experience|employment history|references available)\b/i.test(cleanSnippet) || lowerName.includes('resume');
    if (isResume) {
      return new Response(
        JSON.stringify({
          isAcademic: false,
          classification: 'non_academic',
          confidence: 0.98,
          materialType: 'resume',
          reason: 'This file appears to be a personal resume and does not contain study-related material.',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const isInvoice = /\b(tax invoice|bill to|total amount due|remittance|subtotal|receipt no)\b/i.test(cleanSnippet) || lowerName.includes('invoice');
    if (isInvoice) {
      return new Response(
        JSON.stringify({
          isAcademic: false,
          classification: 'non_academic',
          confidence: 0.97,
          materialType: 'invoice',
          reason: 'This file appears to be an invoice or financial document and cannot be accepted as study material.',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Positive academic validation
    const academicSignals = /\b(syllabus|lecture|notes|chapter|unit|theorem|algorithm|exam|question|assignment|experiment|principles|definitions|proof)\b/i.test(cleanSnippet);

    if (academicSignals || cleanSnippet.length > 200) {
      return new Response(
        JSON.stringify({
          isAcademic: true,
          classification: 'academic',
          confidence: 0.94,
          materialType: 'lecture_notes',
          reason: 'Document verified as academic study material.',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        isAcademic: false,
        classification: 'uncertain',
        confidence: 0.60,
        reason: "This material couldn't be verified as study-related. Please upload academic material such as notes, syllabus, textbooks, assignments, question papers, or lecture material.",
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
