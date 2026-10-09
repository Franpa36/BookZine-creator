import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import {
  DEFAULT_BOOKZINE_GRID,
  SheetConfig,
  SlotMapping,
  SheetAdjustmentsMap,
  ExtractedPage,
  RawPdfPage,
  PageSplitConfig,
} from '../types';

export type { ExtractedPage, RawPdfPage, PageSplitConfig };

// Configure PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Calculates bottom-left origin for drawing a rectangle centered at (cx, cy)
 * with width W and height H, rotated by pdfAngleDeg (counter-clockwise degrees).
 */
function getOriginForCenter(cx: number, cy: number, W: number, H: number, pdfAngleDeg: number) {
  const rad = (pdfAngleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const x = cx - (W / 2) * cos + (H / 2) * sin;
  const y = cy - (W / 2) * sin - (H / 2) * cos;
  return { x, y };
}

/**
 * Rotates a 2D point around an origin (cx, cy) by an angle in radians.
 */
function rotatePoint(px: number, py: number, cx: number, cy: number, rad: number) {
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

/**
 * Parse user input string like "2, 4-6, 8" into a sorted array of unique 1-indexed numbers.
 */
export function parsePageRangeString(input: string, maxPages: number): number[] {
  if (!input || !input.trim()) return [];
  const parts = input.split(/[,\s]+/);
  const numbers = new Set<number>();

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let p = from; p <= to; p++) {
          numbers.add(p);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        numbers.add(num);
      }
    }
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Format a list of numbers into a readable range string (e.g. [2, 4, 5, 6, 8] => "2, 4-6, 8")
 */
export function formatPageRangeString(numbers: number[]): string {
  if (!numbers || numbers.length === 0) return '';
  const sorted = Array.from(new Set(numbers)).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    if (current === prev + 1) {
      prev = current;
    } else {
      if (start === prev) {
        ranges.push(`${start}`);
      } else if (prev === start + 1) {
        ranges.push(`${start}, ${prev}`);
      } else {
        ranges.push(`${start}-${prev}`);
      }
      start = current;
      prev = current;
    }
  }

  return ranges.join(', ');
}

/**
 * Create a clean blank ExtractedPage with a white canvas data URL
 */
export function createBlankPage(
  pageNumber = 1,
  width = 800,
  height = 1131
): ExtractedPage {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  return {
    id: `blank-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    pageNumber,
    originalPageNumber: 0,
    isBlank: true,
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width,
    height,
    isLandscape: width > height,
  };
}

/**
 * Reconcile a freshly re-split source page list with previously inserted blank pages
 * keeping blank pages in their intended positions in the sequence.
 */
export function reconcileWithBlankPages(
  newSourcePages: ExtractedPage[],
  previousPagesWithBlanks: ExtractedPage[]
): ExtractedPage[] {
  const blankIndices: number[] = [];
  previousPagesWithBlanks.forEach((p, idx) => {
    if (p.isBlank) {
      blankIndices.push(idx);
    }
  });

  if (blankIndices.length === 0) {
    return newSourcePages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
  }

  const result = [...newSourcePages];
  const defaultW = newSourcePages[0]?.width || 800;
  const defaultH = newSourcePages[0]?.height || 1131;

  for (const pos of blankIndices) {
    const insertIdx = Math.min(pos, result.length);
    result.splice(insertIdx, 0, createBlankPage(insertIdx + 1, defaultW, defaultH));
  }

  return result.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
}

/**
 * Slices raw PDF pages according to PageSplitConfig (cuts indicated pages in half).
 * Executes in memory via 2D Canvas in milliseconds without reloading the PDF.
 */
export function processRawPagesWithSplits(
  rawPages: RawPdfPage[],
  splitConfig: PageSplitConfig
): ExtractedPage[] {
  const result: ExtractedPage[] = [];
  const splitSet = new Set(splitConfig.splitPageNumbers);
  const direction = splitConfig.direction || 'vertical';
  let nextSequentialPage = 1;

  for (const raw of rawPages) {
    if (splitSet.has(raw.originalPageNumber)) {
      if (direction === 'vertical') {
        // Vertical split: Left half and Right half (standard for 2-page spreads)
        const halfW = Math.floor(raw.width / 2);
        const secondW = raw.width - halfW;
        const H = raw.height;

        // Part 1: Left half (e.g. Left page of spread)
        const canvasLeft = document.createElement('canvas');
        canvasLeft.width = halfW;
        canvasLeft.height = H;
        const ctxLeft = canvasLeft.getContext('2d');
        if (ctxLeft) {
          ctxLeft.drawImage(raw.canvas, 0, 0, halfW, H, 0, 0, halfW, H);
          result.push({
            id: `page-${raw.originalPageNumber}-left`,
            pageNumber: nextSequentialPage++,
            originalPageNumber: raw.originalPageNumber,
            splitPart: 'left',
            dataUrl: canvasLeft.toDataURL('image/jpeg', 0.95),
            width: halfW,
            height: H,
            isLandscape: halfW > H,
            isBlank: false,
          });
        }

        // Part 2: Right half (e.g. Right page of spread)
        const canvasRight = document.createElement('canvas');
        canvasRight.width = secondW;
        canvasRight.height = H;
        const ctxRight = canvasRight.getContext('2d');
        if (ctxRight) {
          ctxRight.drawImage(raw.canvas, halfW, 0, secondW, H, 0, 0, secondW, H);
          result.push({
            id: `page-${raw.originalPageNumber}-right`,
            pageNumber: nextSequentialPage++,
            originalPageNumber: raw.originalPageNumber,
            splitPart: 'right',
            dataUrl: canvasRight.toDataURL('image/jpeg', 0.95),
            width: secondW,
            height: H,
            isLandscape: secondW > H,
            isBlank: false,
          });
        }
      } else {
        // Horizontal split: Top half and Bottom half
        const halfH = Math.floor(raw.height / 2);
        const secondH = raw.height - halfH;
        const W = raw.width;

        // Part 1: Top half
        const canvasTop = document.createElement('canvas');
        canvasTop.width = W;
        canvasTop.height = halfH;
        const ctxTop = canvasTop.getContext('2d');
        if (ctxTop) {
          ctxTop.drawImage(raw.canvas, 0, 0, W, halfH, 0, 0, W, halfH);
          result.push({
            id: `page-${raw.originalPageNumber}-top`,
            pageNumber: nextSequentialPage++,
            originalPageNumber: raw.originalPageNumber,
            splitPart: 'top',
            dataUrl: canvasTop.toDataURL('image/jpeg', 0.95),
            width: W,
            height: halfH,
            isLandscape: W > halfH,
            isBlank: false,
          });
        }

        // Part 2: Bottom half
        const canvasBottom = document.createElement('canvas');
        canvasBottom.width = W;
        canvasBottom.height = secondH;
        const ctxBottom = canvasBottom.getContext('2d');
        if (ctxBottom) {
          ctxBottom.drawImage(raw.canvas, 0, halfH, W, secondH, 0, 0, W, secondH);
          result.push({
            id: `page-${raw.originalPageNumber}-bottom`,
            pageNumber: nextSequentialPage++,
            originalPageNumber: raw.originalPageNumber,
            splitPart: 'bottom',
            dataUrl: canvasBottom.toDataURL('image/jpeg', 0.95),
            width: W,
            height: secondH,
            isLandscape: W > secondH,
            isBlank: false,
          });
        }
      }
    } else {
      // Unsplit page
      result.push({
        id: `page-${raw.originalPageNumber}`,
        pageNumber: nextSequentialPage++,
        originalPageNumber: raw.originalPageNumber,
        splitPart: undefined,
        dataUrl: raw.dataUrl,
        width: raw.width,
        height: raw.height,
        isLandscape: raw.isLandscape,
        isBlank: false,
      });
    }
  }

  return result;
}

/**
 * Render all pages of an uploaded PDF file into raw canvases and data URLs
 */
export async function extractPdfRawPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<{ rawPages: RawPdfPage[]; pdfDocument: any }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const rawPages: RawPdfPage[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    // Render at scale 2.0 for crisp preview and print-quality PDF embedding
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    } as any).promise;

    rawPages.push({
      originalPageNumber: i,
      canvas,
      dataUrl: canvas.toDataURL('image/jpeg', 0.95),
      width: viewport.width,
      height: viewport.height,
      isLandscape: viewport.width > viewport.height,
    });

    if (onProgress) {
      onProgress(i, totalPages);
    }
  }

  return { rawPages, pdfDocument: pdf };
}

/**
 * Render all pages of an uploaded PDF file into ExtractedPage array,
 * with optional page splitting support.
 */
export async function extractPdfPages(
  file: File,
  onProgress?: (current: number, total: number) => void,
  splitConfig: PageSplitConfig = { splitPageNumbers: [], direction: 'vertical' }
): Promise<{ pages: ExtractedPage[]; rawPages: RawPdfPage[]; pdfDocument: any }> {
  const { rawPages, pdfDocument } = await extractPdfRawPages(file, onProgress);
  const pages = processRawPagesWithSplits(rawPages, splitConfig);
  return { pages, rawPages, pdfDocument };
}

/**
 * Sheet standard dimensions in PDF points (72 points = 1 inch)
 */
export const SHEET_DIMENSIONS: Record<string, { width: number; height: number }> = {
  A4: { width: 841.89, height: 595.28 }, // Landscape A4
  A3: { width: 1190.55, height: 841.89 }, // Landscape A3
  Letter: { width: 792.0, height: 612.0 }, // Landscape Letter
  Tabloid: { width: 1224.0, height: 792.0 }, // Landscape Tabloid (11 x 17 in)
};

/**
 * Generate the final imposed Bookzine PDF
 * Imposes extracted pages with per-sheet page slot rotations (0°, 90°, 180°, 270°)
 */
export async function generateBookzinePdf(
  sourcePdfBytes: Uint8Array,
  pageImages: ExtractedPage[],
  sheetConfig: SheetConfig,
  customGrid: SlotMapping[] = DEFAULT_BOOKZINE_GRID,
  onProgress?: (currentSheet: number, totalSheets: number) => void,
  sheetAdjustments?: SheetAdjustmentsMap
): Promise<Uint8Array> {
  const totalPages = pageImages.length;
  const pagesPerSheet = customGrid.length > 0 ? customGrid.length : 16;
  const totalSheets = Math.max(1, Math.ceil(totalPages / pagesPerSheet));

  const outDoc = await PDFDocument.create();

  // Determine sheet size taking orientation into account
  const baseDim = SHEET_DIMENSIONS[sheetConfig.sheetSize] || { width: 1190.55, height: 841.89 };
  const isLandscape = sheetConfig.orientation === 'landscape';
  const sheetWidth = isLandscape ? Math.max(baseDim.width, baseDim.height) : Math.min(baseDim.width, baseDim.height);
  const sheetHeight = isLandscape ? Math.min(baseDim.width, baseDim.height) : Math.max(baseDim.width, baseDim.height);

  // Dynamic grid coordinates math based on customGrid layout
  const colsCount = Math.max(...customGrid.map((s) => s.col), 0) + 1;
  const rowsCount = Math.max(...customGrid.map((s) => s.row), 0) + 1;

  const marginX = sheetWidth * (sheetConfig.marginPercent / 100);
  const marginY = sheetHeight * (sheetConfig.marginPercent / 100);
  const availableW = sheetWidth - 2 * marginX;
  const availableH = sheetHeight - 2 * marginY;

  const gapX = availableW * (sheetConfig.gapPercent / 100);
  const gapY = availableH * (sheetConfig.gapPercent / 100);

  const cellW = (availableW - (colsCount - 1) * gapX) / colsCount;
  const cellH = (availableH - (rowsCount - 1) * gapY) / rowsCount;

  // Pre-embed all extracted page images into outDoc for fast, 100% WYSIWYG parity with the preview
  const embeddedPagesMap = new Map<number, { img: any; width: number; height: number }>();
  for (let i = 0; i < pageImages.length; i++) {
    const pageImg = pageImages[i];
    if (pageImg.isBlank) {
      continue;
    }
    try {
      const res = await fetch(pageImg.dataUrl);
      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();
      const embeddedImg = await outDoc.embedJpg(buffer);
      embeddedPagesMap.set(pageImg.pageNumber, {
        img: embeddedImg,
        width: pageImg.width,
        height: pageImg.height,
      });
    } catch (e) {
      console.error(`Error incrustando página ${pageImg.pageNumber}`, e);
    }
  }

  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    const basePageOffset = sheetIdx * pagesPerSheet;
    const adj = sheetAdjustments?.[sheetIdx];

    const outPage = outDoc.addPage([sheetWidth, sheetHeight]);
    outPage.setRotation(degrees(0));

    // Dotted or dashed border around the sheet (perimeter/cut guide)
    if (sheetConfig.showSheetBorder !== false) {
      const isDashed = sheetConfig.sheetBorderStyle === 'dashed';
      const borderDashArray = isDashed ? [5, 4] : [2, 3];
      const isEdge = sheetConfig.sheetBorderPosition === 'edge';
      
      const edgeInset = 12; // ~4.2mm inside paper edge for safe printing
      const bX0 = isEdge ? edgeInset : Math.max(edgeInset, marginX);
      const bY0 = isEdge ? edgeInset : Math.max(edgeInset, marginY);
      const bX1 = isEdge ? sheetWidth - edgeInset : Math.min(sheetWidth - edgeInset, sheetWidth - marginX);
      const bY1 = isEdge ? sheetHeight - edgeInset : Math.min(sheetHeight - edgeInset, sheetHeight - marginY);

      const borderColor = rgb(0.55, 0.55, 0.55);
      const borderThickness = 0.75;

      // Bottom
      outPage.drawLine({
        start: { x: bX0, y: bY0 },
        end: { x: bX1, y: bY0 },
        thickness: borderThickness,
        color: borderColor,
        dashArray: borderDashArray,
      });
      // Top
      outPage.drawLine({
        start: { x: bX0, y: bY1 },
        end: { x: bX1, y: bY1 },
        thickness: borderThickness,
        color: borderColor,
        dashArray: borderDashArray,
      });
      // Left
      outPage.drawLine({
        start: { x: bX0, y: bY0 },
        end: { x: bX0, y: bY1 },
        thickness: borderThickness,
        color: borderColor,
        dashArray: borderDashArray,
      });
      // Right
      outPage.drawLine({
        start: { x: bX1, y: bY0 },
        end: { x: bX1, y: bY1 },
        thickness: borderThickness,
        color: borderColor,
        dashArray: borderDashArray,
      });
    }

    // Optional: Draw subtle cut or fold guidelines
    if (sheetConfig.showFoldGuides) {
      // Draw vertical fold lines
      for (let c = 1; c < colsCount; c++) {
        const x = marginX + c * (cellW + gapX) - gapX / 2;
        outPage.drawLine({
          start: { x, y: marginY },
          end: { x, y: sheetHeight - marginY },
          thickness: 0.5,
          color: rgb(0.75, 0.75, 0.75),
          dashArray: [4, 4],
        });
      }
      // Draw horizontal fold lines
      for (let r = 1; r < rowsCount; r++) {
        const y = sheetHeight - (marginY + r * (cellH + gapY) - gapY / 2);
        outPage.drawLine({
          start: { x: marginX, y },
          end: { x: sheetWidth - marginX, y },
          thickness: 0.5,
          color: rgb(0.75, 0.75, 0.75),
          dashArray: [4, 4],
        });
      }

      // For 8-page mini-zine (2 rows x 4 cols): Draw the central slit cut guide across middle columns
      if (rowsCount === 2 && colsCount === 4) {
        const midY = sheetHeight - (marginY + 1 * (cellH + gapY) - gapY / 2);
        const cutStartX = marginX + 1 * (cellW + gapX);
        const cutEndX = marginX + 3 * (cellW + gapX) - gapX;
        outPage.drawLine({
          start: { x: cutStartX, y: midY },
          end: { x: cutEndX, y: midY },
          thickness: 1.2,
          color: rgb(0.8, 0.25, 0.25),
          dashArray: [5, 3],
        });
      }
    }

    // Impose each slot according to grid ordering
    for (const slot of customGrid) {
      const targetPageNum = basePageOffset + slot.relativePage;
      if (targetPageNum > totalPages) {
        continue;
      }

      const embedded = embeddedPagesMap.get(targetPageNum);
      if (!embedded) continue;

      // Slot rotation: check for per-sheet slot override (0°, 90°, 180°, 270°) or matrix default
      const slotOverride = adj?.slotOverrides?.[slot.slotIndex];
      const slotBaseRot = slotOverride !== undefined ? slotOverride : (slot.rotation || 0);

      const normalizedSlotRot = ((slotBaseRot % 360) + 360) % 360;
      const isTransposed = normalizedSlotRot === 90 || normalizedSlotRot === 270;

      const imgW = embedded.width;
      const imgH = embedded.height;

      const isContain = sheetConfig.fitMode === 'contain';
      let scale: number;
      if (isTransposed) {
        scale = isContain
          ? Math.min(cellW / imgH, cellH / imgW)
          : Math.max(cellW / imgH, cellH / imgW);
      } else {
        scale = isContain
          ? Math.min(cellW / imgW, cellH / imgH)
          : Math.max(cellW / imgW, cellH / imgH);
      }

      const drawW = imgW * scale;
      const drawH = imgH * scale;

      // Slot nominal center in PDF coordinates (row 0 near top, row max near bottom)
      const nominalCx = marginX + slot.col * (cellW + gapX) + cellW / 2;
      const nominalCy = sheetHeight - marginY - (slot.row + 1) * cellH - slot.row * gapY + cellH / 2;

      // Convert clockwise CSS angle to counter-clockwise PDF angle
      const pdfAngle = (360 - normalizedSlotRot) % 360;

      const { x, y } = getOriginForCenter(nominalCx, nominalCy, drawW, drawH, pdfAngle);

      outPage.drawImage(embedded.img, {
        x,
        y,
        width: drawW,
        height: drawH,
        rotate: degrees(pdfAngle),
      });
    }

    if (onProgress) {
      onProgress(sheetIdx + 1, totalSheets);
    }
  }

  return await outDoc.save();
}
