import React, { useState } from 'react';
import { Header } from './components/Header';
import { SourcePdfUpload } from './components/SourcePdfUpload';
import { CanvaTemplatePanel } from './components/CanvaTemplatePanel';
import { GridConfigPanel } from './components/GridConfigPanel';
import { SheetViewer } from './components/SheetViewer';
import { ExportPanel } from './components/ExportPanel';
import { FoldingGuideModal } from './components/FoldingGuideModal';
import {
  ExtractedPage,
  RawPdfPage,
  PageSplitConfig,
  extractPdfRawPages,
  processRawPagesWithSplits,
  createBlankPage,
} from './lib/pdfService';
import {
  DEFAULT_BOOKZINE_GRID,
  DEFAULT_ZINE8_GRID,
  ImpositionMode,
  SheetConfig,
  SlotMapping,
  SheetAdjustmentsMap,
} from './types';

export default function App() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [rawPages, setRawPages] = useState<RawPdfPage[]>([]);
  const [splitConfig, setSplitConfig] = useState<PageSplitConfig>({
    splitPageNumbers: [],
    direction: 'vertical',
  });
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });

  // Imposition mode: 16-page bookzine (4x4) or 8-page mini-zine (4x2 Canva template)
  const [impositionMode, setImpositionMode] = useState<ImpositionMode>('bookzine16');

  // Configuration for Sheet & Paper
  const [templateConfig, setTemplateConfig] = useState<SheetConfig>({
    sheetSize: 'A3',
    orientation: 'landscape',
    marginPercent: 2,
    gapPercent: 0.6,
    fitMode: 'contain',
    showCutGuides: true,
    showFoldGuides: true,
    showPageLabels: true,
    showSheetBorder: true,
    sheetBorderStyle: 'dotted',
    sheetBorderPosition: 'margin',
    templateSource: 'default',
  });

  // Grid mapping initialized to 16-page default or 8-page default
  const [gridSlots, setGridSlots] = useState<SlotMapping[]>(DEFAULT_BOOKZINE_GRID);

  // Per-sheet page rotation adjustments (slotOverrides: slotIndex -> 0, 90, 180, 270 degrees)
  const [sheetAdjustments, setSheetAdjustments] = useState<SheetAdjustmentsMap>({});

  // Folding Guide Modal
  const [isFoldingGuideOpen, setIsFoldingGuideOpen] = useState(false);

  // Switch between 16-page bookzine and 8-page mini-zine modes
  const handleChangeImpositionMode = (mode: ImpositionMode) => {
    setImpositionMode(mode);
    if (mode === 'zine8') {
      setGridSlots(DEFAULT_ZINE8_GRID);
    } else {
      setGridSlots(DEFAULT_BOOKZINE_GRID);
    }
    // Reset manual sheet adjustments to avoid out-of-sync rotations
    setSheetAdjustments({});
  };

  // Process Source PDF
  const handleFileSelected = async (file: File) => {
    setSourceFile(file);
    setIsExtracting(true);
    setExtractionProgress({ current: 0, total: 0 });

    try {
      const { rawPages: extractedRaw } = await extractPdfRawPages(file, (current, total) => {
        setExtractionProgress({ current, total });
      });
      setRawPages(extractedRaw);
      const processed = processRawPagesWithSplits(extractedRaw, splitConfig);
      setExtractedPages(processed);
    } catch (err) {
      console.error('Error procesando PDF de origen:', err);
      alert('No se pudo procesar el PDF. Asegúrate de que no esté protegido por contraseña.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateSplitConfig = (newConfig: PageSplitConfig) => {
    setSplitConfig(newConfig);
    if (rawPages.length > 0) {
      const processed = processRawPagesWithSplits(rawPages, newConfig);
      // Preserve any blank pages previously inserted by user in their relative positions
      const blankPages = extractedPages
        .map((p, idx) => ({ index: idx, page: p }))
        .filter((item) => item.page.isBlank);

      if (blankPages.length > 0) {
        const merged = [...processed];
        for (const item of blankPages) {
          const insertIdx = Math.min(item.index, merged.length);
          merged.splice(insertIdx, 0, item.page);
        }
        setExtractedPages(merged.map((p, idx) => ({ ...p, pageNumber: idx + 1 })));
      } else {
        setExtractedPages(processed);
      }
    }
  };

  // Insert one or more blank pages at any position in the sequence (0-indexed)
  const handleInsertBlankPage = (insertIndex: number, count = 1) => {
    setExtractedPages((prev) => {
      const defaultW = prev[0]?.width || 800;
      const defaultH = prev[0]?.height || 1131;
      const targetIdx = Math.max(0, Math.min(insertIndex, prev.length));
      const newBlanks = Array.from({ length: Math.max(1, count) }, (_, i) =>
        createBlankPage(targetIdx + 1 + i, defaultW, defaultH)
      );
      const updated = [...prev];
      updated.splice(targetIdx, 0, ...newBlanks);
      return updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  // Insert blank pages at multiple specified 1-indexed target page numbers simultaneously
  // e.g., targets = [2, 5, 8] will insert blanks at those resulting positions
  const handleInsertBlankPagesAtPositions = (targetPositions: number[]) => {
    if (!targetPositions || targetPositions.length === 0) return;
    setExtractedPages((prev) => {
      const defaultW = prev[0]?.width || 800;
      const defaultH = prev[0]?.height || 1131;
      // Sort ascending
      const sorted = [...targetPositions].sort((a, b) => a - b);
      let updated = [...prev];
      let offset = 0;
      for (const pos of sorted) {
        // pos is 1-indexed in the final sequence; adjust by offset
        const insertIdx = Math.max(0, Math.min(pos - 1, updated.length));
        const newBlank = createBlankPage(insertIdx + 1, defaultW, defaultH);
        updated.splice(insertIdx, 0, newBlank);
        offset++;
      }
      return updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  // Remove a page (blank page or any specific page) from the sequence
  const handleRemovePage = (pageIndex: number) => {
    setExtractedPages((prev) => {
      const updated = prev.filter((_, idx) => idx !== pageIndex);
      return updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  // Remove all inserted blank pages
  const handleRemoveAllBlankPages = () => {
    setExtractedPages((prev) => {
      const updated = prev.filter((p) => !p.isBlank);
      return updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  // Move a page from fromIndex to toIndex (0-indexed)
  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setExtractedPages((prev) => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [movedPage] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedPage);
      return updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  // Swap two pages by their 0-indexed positions
  const handleSwapPages = (indexA: number, indexB: number) => {
    if (indexA === indexB || indexA < 0 || indexB < 0) return;
    setExtractedPages((prev) => {
      if (indexA >= prev.length || indexB >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[indexA];
      updated[indexA] = updated[indexB];
      updated[indexB] = temp;
      return updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
  };

  // Move an entire sheet (and its pages) from fromSheetIndex to toSheetIndex (0-indexed)
  const handleMoveSheet = (fromSheetIndex: number, toSheetIndex: number) => {
    if (fromSheetIndex === toSheetIndex || fromSheetIndex < 0 || toSheetIndex < 0) return;
    const pps = impositionMode === 'zine8' ? 8 : 16;
    setExtractedPages((prev) => {
      const sheetsCount = Math.ceil(prev.length / pps);
      if (fromSheetIndex >= sheetsCount || toSheetIndex >= sheetsCount) return prev;

      const sheets: ExtractedPage[][] = [];
      for (let s = 0; s < sheetsCount; s++) {
        sheets.push(prev.slice(s * pps, (s + 1) * pps));
      }
      const [movedSheet] = sheets.splice(fromSheetIndex, 1);
      sheets.splice(toSheetIndex, 0, movedSheet);
      const flat = sheets.flat();
      return flat.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });

    // Also migrate sheetAdjustments so overrides follow their sheet
    setSheetAdjustments((prev) => {
      const totalS = Math.ceil(extractedPages.length / pps);
      const sheetKeys = Array.from({ length: totalS }, (_, i) => i);
      const [movedKey] = sheetKeys.splice(fromSheetIndex, 1);
      sheetKeys.splice(toSheetIndex, 0, movedKey);

      const next: SheetAdjustmentsMap = {};
      sheetKeys.forEach((oldIdx, newIdx) => {
        if (prev[oldIdx]) {
          next[newIdx] = prev[oldIdx];
        }
      });
      return next;
    });
  };

  const handleClearSource = () => {
    setSourceFile(null);
    setRawPages([]);
    setExtractedPages([]);
    setSplitConfig({
      splitPageNumbers: [],
      direction: 'vertical',
    });
  };

  // Base slot rotation handlers for Step 3 (Matrix default)
  const handleUpdateSlotRotation = (slotIndex: number, newRotation: number) => {
    const normalized = ((newRotation % 360) + 360) % 360;
    setGridSlots((prev) =>
      prev.map((slot) =>
        slot.slotIndex === slotIndex ? { ...slot, rotation: normalized } : slot
      )
    );
  };

  const handleApplyRotationPreset = (
    preset:
      | 'rows_1_3_180'
      | 'all_0'
      | 'all_180'
      | 'row1_180'
      | 'rotate_all_90'
      | 'canva_8_standard'
      | 'sequential_8'
  ) => {
    setGridSlots((prev) =>
      prev.map((slot) => {
        if (preset === 'rotate_all_90') {
          return { ...slot, rotation: (slot.rotation + 90) % 360 };
        }
        let rot = 0;
        if (preset === 'rows_1_3_180') {
          // Rows 1 and 3 (0-indexed row 0 and row 2) rotated 180 degrees
          rot = slot.row === 0 || slot.row === 2 ? 180 : 0;
        } else if (preset === 'canva_8_standard' || preset === 'row1_180') {
          // Row 1 (top row) rotated 180 degrees for 8-page mini-zine
          rot = slot.row === 0 ? 180 : 0;
        } else if (preset === 'all_0') {
          rot = 0;
        } else if (preset === 'all_180') {
          rot = 180;
        }
        return { ...slot, rotation: rot };
      })
    );
  };

  const pagesPerSheet = impositionMode === 'zine8' ? 8 : 16;
  const totalSheets = Math.max(1, Math.ceil(extractedPages.length / pagesPerSheet));

  // Individual page rotation per sheet (0°, 90°, 180°, 270°)
  const handleUpdateSheetSlotRotation = (
    sheetIndex: number,
    slotIndex: number,
    newRotation: number
  ) => {
    const normalized = ((newRotation % 360) + 360) % 360;
    setSheetAdjustments((prev) => {
      const current = prev[sheetIndex] || { sheetAngle: 0, slotOverrides: {} };
      const slotOverrides = { ...(current.slotOverrides || {}) };
      slotOverrides[slotIndex] = normalized;
      return {
        ...prev,
        [sheetIndex]: {
          ...current,
          slotOverrides,
        },
      };
    });
  };

  // Batch rotate all pages of a specific sheet by delta degrees (e.g. +90° or +180°)
  const handleRotateAllSheetSlots = (sheetIndex: number, delta: number) => {
    setSheetAdjustments((prev) => {
      const current = prev[sheetIndex] || { sheetAngle: 0, slotOverrides: {} };
      const newSlotOverrides: Record<number, number> = {};
      gridSlots.forEach((slot) => {
        const currentRot =
          current.slotOverrides?.[slot.slotIndex] !== undefined
            ? current.slotOverrides[slot.slotIndex]
            : slot.rotation;
        newSlotOverrides[slot.slotIndex] = ((currentRot + delta) % 360 + 360) % 360;
      });
      return {
        ...prev,
        [sheetIndex]: {
          ...current,
          slotOverrides: newSlotOverrides,
        },
      };
    });
  };

  // Reset all page rotations for a specific sheet back to matrix defaults
  const handleResetSheetAdjustments = (sheetIndex: number) => {
    setSheetAdjustments((prev) => {
      const next = { ...prev };
      delete next[sheetIndex];
      return next;
    });
  };

  // Copy page rotations of a source sheet to all sheets
  const handleCopySheetAdjustmentsToAll = (sourceSheetIndex: number) => {
    setSheetAdjustments((prev) => {
      const sourceOverrides = prev[sourceSheetIndex]?.slotOverrides;
      if (!sourceOverrides) return prev;
      const updated: SheetAdjustmentsMap = {};
      for (let i = 0; i < totalSheets; i++) {
        updated[i] = {
          sheetAngle: 0,
          slotOverrides: { ...sourceOverrides },
        };
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col antialiased">
      {/* Top Header with Mode Switcher */}
      <Header
        onOpenFoldingGuide={() => setIsFoldingGuideOpen(true)}
        totalPages={extractedPages.length}
        totalSheets={totalSheets}
        impositionMode={impositionMode}
        onChangeImpositionMode={handleChangeImpositionMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 1 & Step 2 (Source PDF & Canva Configuration) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <SourcePdfUpload
            sourceFile={sourceFile}
            rawPages={rawPages}
            extractedPages={extractedPages}
            splitConfig={splitConfig}
            onUpdateSplitConfig={handleUpdateSplitConfig}
            isExtracting={isExtracting}
            extractionProgress={extractionProgress}
            onFileSelected={handleFileSelected}
            onClear={handleClearSource}
            impositionMode={impositionMode}
            onInsertBlankPage={handleInsertBlankPage}
            onInsertBlankPagesAtPositions={handleInsertBlankPagesAtPositions}
            onRemovePage={handleRemovePage}
            onRemoveAllBlankPages={handleRemoveAllBlankPages}
            onMovePage={handleMovePage}
            onSwapPages={handleSwapPages}
          />

          <CanvaTemplatePanel
            templateConfig={templateConfig}
            onChangeTemplateConfig={setTemplateConfig}
            impositionMode={impositionMode}
          />
        </div>

        {/* Step 3: Imposition Matrix Ordering & Base Rotations */}
        <GridConfigPanel
          gridSlots={gridSlots}
          impositionMode={impositionMode}
          onUpdateSlotRotation={handleUpdateSlotRotation}
          onApplyRotationPreset={handleApplyRotationPreset}
        />

        {/* Step 4: Interactive Live Sheet Viewer with individual 0°-270° rotation per page */}
        <SheetViewer
          extractedPages={extractedPages}
          gridSlots={gridSlots}
          templateConfig={templateConfig}
          sheetAdjustments={sheetAdjustments}
          impositionMode={impositionMode}
          onUpdateSheetSlotRotation={handleUpdateSheetSlotRotation}
          onRotateAllSheetSlots={handleRotateAllSheetSlots}
          onResetSheetAdjustments={handleResetSheetAdjustments}
          onCopySheetAdjustmentsToAll={handleCopySheetAdjustmentsToAll}
          onInsertBlankPage={handleInsertBlankPage}
          onRemovePage={handleRemovePage}
          onMovePage={handleMovePage}
          onSwapPages={handleSwapPages}
          onMoveSheet={handleMoveSheet}
        />

        {/* Step 5: Export Panel */}
        <ExportPanel
          sourceFile={sourceFile}
          extractedPages={extractedPages}
          templateConfig={templateConfig}
          gridSlots={gridSlots}
          sheetAdjustments={sheetAdjustments}
          impositionMode={impositionMode}
        />
      </main>

      {/* Folding Guide Modal */}
      <FoldingGuideModal
        isOpen={isFoldingGuideOpen}
        onClose={() => setIsFoldingGuideOpen(false)}
        impositionMode={impositionMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span>
              {impositionMode === 'zine8'
                ? 'Mini-Zine Creator • Cuadrícula 4x2 de 8 páginas con corte central para plegado'
                : 'Bookzine Creator • Cuadrícula 4x4 de 16 páginas con imposición snake-fold'}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <a
              href="/fanzine_creator.html"
              download="fanzine_creator.html"
              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
              title="Descargar la aplicación completa en un único archivo HTML"
            >
              💾 Descargar versión HTML independiente (.html)
            </a>
          </div>
          <span className="text-slate-400">
            Exportación vectorial y rasterizada de alta fidelidad para imprenta
          </span>
        </div>
      </footer>
    </div>
  );
}
