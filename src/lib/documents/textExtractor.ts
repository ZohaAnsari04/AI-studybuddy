import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedDocumentContent {
  text: string;
  pages: string[];
  sampleText: string;
  isScanned: boolean;
  wordCount: number;
  hash: string;
  pageCount: number;
}

/**
 * Computes SHA-256 checksum for duplicate detection
 */
export async function computeFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extracts text from PDF document using pdfjs-dist
 */
async function extractTextFromPdf(file: File): Promise<{ text: string; pages: string[]; isScanned: boolean; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: string[] = [];

  let totalChars = 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Preserve vertical layout by detecting Y coordinate shifts and EOL markers
    const pageLines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const textItem = item as { str: string; transform?: number[]; hasEOL?: boolean };
      const str = textItem.str;
      if (!str && !textItem.hasEOL) continue;

      const currentY = textItem.transform && textItem.transform.length >= 6 ? textItem.transform[5] : null;

      // When vertical Y position changes significantly (> 3 points) or hasEOL is true, flush line
      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 3) {
        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }
        currentLine = str;
      } else if (textItem.hasEOL) {
        currentLine += (currentLine && !currentLine.endsWith(' ') && !str.startsWith(' ') ? ' ' : '') + str;
        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }
        currentLine = '';
      } else {
        if (currentLine && !currentLine.endsWith(' ') && !str.startsWith(' ')) {
          currentLine += ' ' + str;
        } else {
          currentLine += str;
        }
      }

      if (currentY !== null) {
        lastY = currentY;
      }
    }

    if (currentLine.trim()) {
      pageLines.push(currentLine.trim());
    }

    const pageText = pageLines.join('\n');
    pages.push(pageText);
    totalChars += pageText.length;
  }

  const fullText = pages.join('\n\n');
  // If multiple pages exist but practically zero text was extracted, it's likely a scanned PDF
  const isScanned = numPages > 0 && totalChars < (numPages * 15);

  return {
    text: fullText,
    pages,
    isScanned,
    pageCount: numPages,
  };
}

/**
 * Extracts text from DOCX document using mammoth
 */
async function extractTextFromDocx(file: File): Promise<{ text: string; pages: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value.trim();
  // Split into rough sections / pages
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return {
    text,
    pages: paragraphs.length > 0 ? paragraphs : [text],
  };
}

/**
 * Extracts text from PPTX presentation using JSZip
 */
async function extractTextFromPptx(file: File): Promise<{ text: string; pages: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFiles: { name: string; index: number }[] = [];

  zip.forEach((relativePath) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
    if (match) {
      slideFiles.push({ name: relativePath, index: parseInt(match[1], 10) });
    }
  });

  // Sort slides in natural order
  slideFiles.sort((a, b) => a.index - b.index);

  const pages: string[] = [];
  for (const slide of slideFiles) {
    const slideXml = await zip.file(slide.name)?.async('text');
    if (slideXml) {
      // Extract text content inside <a:t>...</a:t>
      const textMatches = slideXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi) || [];
      const slideText = textMatches
        .map(t => t.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean)
        .join(' ');
      pages.push(`Slide ${slide.index}:\n${slideText}`);
    }
  }

  const fullText = pages.join('\n\n');
  return {
    text: fullText,
    pages: pages.length > 0 ? pages : [fullText],
  };
}

/**
 * Extracts text from TXT or Markdown file
 */
async function extractTextFromPlainText(file: File): Promise<{ text: string; pages: string[] }> {
  const text = await file.text();
  const cleanText = text.trim();
  // Chunk into sections by markdown headers or page breaks
  const sections = cleanText.split(/\n(?=#{1,3}\s)/).filter(s => s.trim().length > 0);
  return {
    text: cleanText,
    pages: sections.length > 0 ? sections : [cleanText],
  };
}

/**
 * Primary extractor function.
 * Validates readability and extracts structured text.
 */
export async function extractDocumentContent(file: File): Promise<ExtractedDocumentContent> {
  const hash = await computeFileHash(file);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  let text = '';
  let pages: string[] = [];
  let isScanned = false;
  let pageCount = 1;

  switch (ext) {
    case 'pdf': {
      const res = await extractTextFromPdf(file);
      text = res.text;
      pages = res.pages;
      isScanned = res.isScanned;
      pageCount = res.pageCount;
      break;
    }
    case 'docx': {
      const res = await extractTextFromDocx(file);
      text = res.text;
      pages = res.pages;
      pageCount = Math.max(1, Math.ceil(text.length / 2500));
      break;
    }
    case 'pptx': {
      const res = await extractTextFromPptx(file);
      text = res.text;
      pages = res.pages;
      pageCount = Math.max(1, pages.length);
      break;
    }
    case 'txt':
    case 'md': {
      const res = await extractTextFromPlainText(file);
      text = res.text;
      pages = res.pages;
      pageCount = Math.max(1, Math.ceil(text.length / 2500));
      break;
    }
    default:
      throw new Error(`Unsupported file extension: .${ext}`);
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Build a representative sample for AI classification (first 2500 chars, middle 1500 chars, last 1000 chars)
  let sampleText = '';
  if (text.length <= 5000) {
    sampleText = text;
  } else {
    const head = text.slice(0, 2500);
    const midStart = Math.floor((text.length - 1500) / 2);
    const middle = text.slice(midStart, midStart + 1500);
    const tail = text.slice(-1000);
    sampleText = `${head}\n\n[...]\n\n${middle}\n\n[...]\n\n${tail}`;
  }

  return {
    text,
    pages,
    sampleText,
    isScanned,
    wordCount,
    hash,
    pageCount,
  };
}
