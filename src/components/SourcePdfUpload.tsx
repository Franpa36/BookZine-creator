import React, { useRef, useState, useEffect } from 'react';
import {
  FileUp,
  FileText,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Scissors,
  Columns,
  Rows,
  Trash2,
  HelpCircle,
  ArrowRight,
  Plus,
  FilePlus,
  X,
  Move,
  ArrowLeft,
  ArrowLeftRight,
  GripVertical,
  Check,
} from 'lucide-react';
import { ExtractedPage, RawPdfPage, PageSplitConfig, parsePageRangeString, formatPageRangeString } from '../lib/pdfService';
import { createSamplePdf } from '../lib/samplePdf';
import { ImpositionMode } from '../types';

interface SourcePdfUploadProps {
  sourceFile: File | null;
  rawPages: RawPdfPage[];
  extractedPages: ExtractedPage[];
  splitConfig: PageSplitConfig;
  onUpdateSplitConfig: (config: PageSplitConfig) => void;
  isExtracting: boolean;
  extractionProgress: { current: number; total: number };
  onFileSelected: (file: File) => void;
  onClear: () => void;
  impositionMode?: ImpositionMode;
  onInsertBlankPage: (insertIndex: number, count?: number) => void;
  onInsertBlankPagesAtPositions?: (targetPositions: number[]) => void;
  onRemovePage: (pageIndex: number) => void;
  onRemoveAllBlankPages: () => void;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
  onSwapPages?: (indexA: number, indexB: number) => void;
}

export const SourcePdfUpload: React.FC<SourcePdfUploadProps> = ({
  sourceFile,
  rawPages,
  extractedPages,
  splitConfig,
  onUpdateSplitConfig,
  isExtracting,
  extractionProgress,
  onFileSelected,
  onClear,
  impositionMode = 'bookzine16',
  onInsertBlankPage,
  onInsertBlankPagesAtPositions,
  onRemovePage,
  onRemoveAllBlankPages,
  onMovePage,
  onSwapPages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  // Drag and drop page reordering state
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);

  // Dedicated Move Pages Toolbar state
  const [moveSourcePageNum, setMoveSourcePageNum] = useState<number>(1);
  const [moveTargetPageNum, setMoveTargetPageNum] = useState<number>(2);
  const [showMoveToolbar, setShowMoveToolbar] = useState<boolean>(false);

  // Local state for the text input so the user can freely type page numbers/ranges
  const [pageInputText, setPageInputText] = useState('');
  // Target position for custom blank page insertion (1-indexed)
  const [customInsertPos, setCustomInsertPos] = useState(1);
  // Quantity of blank pages to insert at chosen position
  const [blankCountToInsert, setBlankCountToInsert] = useState(1);
  // Text input for multiple specific positions (e.g., "2, 5, 8")
  const [multiPositionsText, setMultiPositionsText] = useState('');
  // Toggle advanced multi-position input
  const [showMultiInput, setShowMultiInput] = useState(false);

  // Keep input text in sync when splitConfig changes from button clicks
  useEffect(() => {
    setPageInputText(formatPageRangeString(splitConfig.splitPageNumbers));
  }, [splitConfig.splitPageNumbers]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelected(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handleLoadSample = async (pageCount: 16 | 32, includeSpread = false) => {
    try {
      setIsGeneratingSample(true);
      const sample = await createSamplePdf(pageCount, includeSpread);
      onFileSelected(sample);
    } catch (err) {
      console.error('Error generando PDF de prueba', err);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  // Toggle splitting for a specific original page number
  const handleTogglePageSplit = (pageNum: number) => {
    const isCurrentlySplit = splitConfig.splitPageNumbers.includes(pageNum);
    let nextNumbers: number[];
    if (isCurrentlySplit) {
      nextNumbers = splitConfig.splitPageNumbers.filter((n) => n !== pageNum);
    } else {
      nextNumbers = [...splitConfig.splitPageNumbers, pageNum].sort((a, b) => a - b);
    }
    onUpdateSplitConfig({
      ...splitConfig,
      splitPageNumbers: nextNumbers,
    });
  };

  // Commit text input to splitConfig
  const handleApplyTextInput = () => {
    const parsed = parsePageRangeString(pageInputText, rawPages.length);
    onUpdateSplitConfig({
      ...splitConfig,
      splitPageNumbers: parsed,
    });
  };

  // Auto-detect and split landscape/spread pages
  const landscapePages = rawPages.filter((p) => p.isLandscape).map((p) => p.originalPageNumber);
  const handleSplitAllLandscape = () => {
    const combined = Array.from(new Set([...splitConfig.splitPageNumbers, ...landscapePages])).sort(
      (a, b) => a - b
    );
    onUpdateSplitConfig({
      ...splitConfig,
      splitPageNumbers: combined,
    });
  };

  const handleClearAllSplits = () => {
    onUpdateSplitConfig({
      ...splitConfig,
      splitPageNumbers: [],
    });
  };

  const pagesPerSheet = impositionMode === 'zine8' ? 8 : 16;
  const totalSheetsRequired = Math.max(1, Math.ceil(extractedPages.length / pagesPerSheet));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs">
            1
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            PDF de Origen & División de Páginas
          </h2>
        </div>
        {sourceFile && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
          >
            Cambiar PDF
          </button>
        )}
      </div>

      <div className="p-5">
        {!sourceFile ? (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleInputChange}
              />
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Arrastra tu PDF aquí o haz clic para seleccionarlo
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Soporta PDFs estándar, dobles páginas (spreads) y división manual por la mitad.
              </p>
            </div>

            {/* Quick sample PDF buttons for testing immediately */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                ¿No tienes un PDF a mano para probar?
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isGeneratingSample}
                  onClick={() => handleLoadSample(16, true)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  title="PDF de prueba con una doble página para cortar por la mitad"
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-700" />
                  {isGeneratingSample ? 'Cargando...' : 'Demo con doble página (Spread)'}
                </button>
                <button
                  type="button"
                  disabled={isGeneratingSample}
                  onClick={() => handleLoadSample(16, false)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Demo 16 páginas
                </button>
                <button
                  type="button"
                  disabled={isGeneratingSample}
                  onClick={() => handleLoadSample(32, false)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Demo 32 páginas
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info Card */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate" title={sourceFile.name}>
                    {sourceFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(sourceFile.size / 1024 / 1024).toFixed(2)} MB •{' '}
                    {isExtracting
                      ? `Extrayendo páginas (${extractionProgress.current}/${extractionProgress.total})...`
                      : `${rawPages.length} páginas originales detectadas`}
                  </p>
                </div>
              </div>

              {!isExtracting && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold shrink-0">
                  <CheckCircle className="w-4 h-4" />
                  <span>Listo</span>
                </div>
              )}
            </div>

            {/* Extraction Progress Bar */}
            {isExtracting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                    Renderizando páginas del PDF a imágenes...
                  </span>
                  <span>
                    {Math.round(
                      (extractionProgress.current / (extractionProgress.total || 1)) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-200"
                    style={{
                      width: `${(extractionProgress.current / (extractionProgress.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* PAGE SPLITTING TOOLBAR & INPUT */}
            {!isExtracting && rawPages.length > 0 && (
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                      <Scissors className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Dividir Páginas en 2 (Corte por la mitad)
                      </h3>
                      <p className="text-[11px] text-amber-800">
                        Corta páginas dobles (spreads) en dos páginas consecutivas para el zine.
                      </p>
                    </div>
                  </div>

                  {/* Direction toggle */}
                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-amber-200 text-xs shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onUpdateSplitConfig({ ...splitConfig, direction: 'vertical' })}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                        splitConfig.direction === 'vertical'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Corte Vertical: Divide la página en mitad izquierda y mitad derecha (dobles páginas habituales)"
                    >
                      <Columns className="w-3 h-3" />
                      Vertical (Izq | Der)
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSplitConfig({ ...splitConfig, direction: 'horizontal' })}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                        splitConfig.direction === 'horizontal'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Corte Horizontal: Divide la página en mitad superior y mitad inferior"
                    >
                      <Rows className="w-3 h-3" />
                      Horizontal (Sup | Inf)
                    </button>
                  </div>
                </div>

                {/* Page number input field & quick action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-white rounded-lg border border-amber-300/80 px-2.5 py-1.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200/50">
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      Páginas a dividir:
                    </span>
                    <input
                      type="text"
                      value={pageInputText}
                      onChange={(e) => setPageInputText(e.target.value)}
                      onBlur={handleApplyTextInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="Ej: 2, 4, 7-9 (o haz clic abajo)"
                      className="w-full text-xs font-mono text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyTextInput}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded cursor-pointer transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>

                  {/* Quick helper button: Auto-detect landscape/spreads */}
                  {landscapePages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSplitAllLandscape}
                      className="px-2.5 py-1.5 text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Detectadas ${landscapePages.length} páginas apaisadas (${landscapePages.join(', ')})`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Dividir apaisadas ({landscapePages.length})
                    </button>
                  )}

                  {splitConfig.splitPageNumbers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSplits}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Quitar todas las divisiones"
                    >
                      <Trash2 className="w-3 h-3" />
                      Restablecer
                    </button>
                  )}
                </div>

                {/* Status computation banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 text-slate-700 border-t border-amber-200/60">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span>
                      Originales: <strong>{rawPages.length}</strong> págs
                    </span>
                    <span>•</span>
                    <span className={splitConfig.splitPageNumbers.length > 0 ? 'text-amber-800 font-bold' : ''}>
                      Divididas: <strong>{splitConfig.splitPageNumbers.length}</strong>
                    </span>
                    {extractedPages.filter((p) => p.isBlank).length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          En blanco: {extractedPages.filter((p) => p.isBlank).length}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      Total fanzine: <strong className="text-emerald-700 text-xs">{extractedPages.length}</strong> págs
                    </span>
                  </div>
                  <div className="text-slate-600">
                    {impositionMode === 'zine8' ? 'Modo 8 Pliegues' : 'Modo 16 Pliegues'}:{' '}
                    <strong className="text-slate-900">{totalSheetsRequired} pliego(s)</strong>
                  </div>
                </div>
              </div>
            )}

            {/* BLANK PAGE INSERTION TOOLBAR */}
            {extractedPages.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/90 rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <FilePlus className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Añadir Páginas en Blanco
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      (Portada interior, en medio del zine o en posiciones personalizadas)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMultiInput(!showMultiInput)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2 transition-colors"
                    >
                      {showMultiInput ? 'Ocultar entrada múltiple' : 'Insertar en varias posiciones a la vez...'}
                    </button>

                    {extractedPages.filter((p) => p.isBlank).length > 0 && (
                      <button
                        type="button"
                        onClick={onRemoveAllBlankPages}
                        className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold cursor-pointer transition-colors ml-1"
                        title="Eliminar todas las páginas en blanco insertadas"
                      >
                        <Trash2 className="w-3 h-3" />
                        Quitar {extractedPages.filter((p) => p.isBlank).length} en blanco
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary quick insert controls */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {/* Quick Add In Middle */}
                  <button
                    type="button"
                    onClick={() => {
                      const middleIdx = Math.floor(extractedPages.length / 2);
                      onInsertBlankPage(middleIdx, 1);
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                    title={`Insertar 1 página en blanco en la mitad exacta (en la posición ${Math.floor(extractedPages.length / 2) + 1})`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>En medio del zine (Pág {Math.floor(extractedPages.length / 2) + 1})</span>
                  </button>

                  {/* Quick Add 2 Pages In Middle (e.g. for spread) */}
                  <button
                    type="button"
                    onClick={() => {
                      const middleIdx = Math.floor(extractedPages.length / 2);
                      onInsertBlankPage(middleIdx, 2);
                    }}
                    className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Insertar 2 páginas en blanco consecutivas en el centro (ideal para pliego o doble página vacía)"
                  >
                    <Plus className="w-3 h-3 text-indigo-500" />
                    <span>+2 en el centro</span>
                  </button>

                  {/* Quick Add At Beginning */}
                  <button
                    type="button"
                    onClick={() => onInsertBlankPage(0, 1)}
                    className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Insertar 1 página en blanco al inicio (como nueva Pág 1)"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>Al inicio</span>
                  </button>

                  {/* Quick Add At End */}
                  <button
                    type="button"
                    onClick={() => onInsertBlankPage(extractedPages.length, 1)}
                    className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Insertar 1 página en blanco al final del fanzine"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>Al final</span>
                  </button>

                  {/* Custom Position & Multiple Count Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 ml-auto text-xs bg-white/90 p-1 rounded-lg border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-500 text-[11px] font-medium">Cantidad:</span>
                    <select
                      value={blankCountToInsert}
                      onChange={(e) => setBlankCountToInsert(Number(e.target.value))}
                      className="text-xs bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 font-bold text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                      title="Número de páginas en blanco consecutivas a insertar"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                        <option key={c} value={c}>
                          {c} {c === 1 ? 'pág' : 'págs'}
                        </option>
                      ))}
                    </select>

                    <span className="text-slate-500 text-[11px] font-medium ml-1">Antes de pág:</span>
                    <select
                      value={customInsertPos}
                      onChange={(e) => setCustomInsertPos(Number(e.target.value))}
                      className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-semibold text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      {Array.from({ length: extractedPages.length + 1 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          Pág {num} {num === extractedPages.length + 1 ? '(Final)' : ''}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onInsertBlankPage(customInsertPos - 1, blankCountToInsert)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded text-xs font-semibold cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                      title={`Insertar ${blankCountToInsert} página(s) en blanco antes de la Pág ${customInsertPos}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insertar</span>
                    </button>
                  </div>
                </div>

                {/* Multiple specific positions custom input panel */}
                {showMultiInput && (
                  <div className="p-2.5 bg-white border border-indigo-200 rounded-lg shadow-inner space-y-1.5 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <span>Insertar páginas en blanco en posiciones exactas:</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Total actual: <strong>{extractedPages.length}</strong> páginas
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={multiPositionsText}
                        onChange={(e) => setMultiPositionsText(e.target.value)}
                        placeholder="Ejemplo: 2, 5, 8 (números de página separados por coma)"
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const positions = multiPositionsText
                              .split(/[,;\s]+/)
                              .map((s) => parseInt(s.trim(), 10))
                              .filter((n) => !isNaN(n) && n >= 1);
                            if (positions.length > 0 && onInsertBlankPagesAtPositions) {
                              onInsertBlankPagesAtPositions(positions);
                              setMultiPositionsText('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const positions = multiPositionsText
                            .split(/[,;\s]+/)
                            .map((s) => parseInt(s.trim(), 10))
                            .filter((n) => !isNaN(n) && n >= 1);
                          if (positions.length > 0 && onInsertBlankPagesAtPositions) {
                            onInsertBlankPagesAtPositions(positions);
                            setMultiPositionsText('');
                          }
                        }}
                        disabled={!multiPositionsText.trim()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        Insertar en posiciones
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>
                        Escribe las posiciones exactas donde quieres que aparezca cada página en blanco.
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Atajos rápidos:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onInsertBlankPagesAtPositions) {
                              // Insert inside cover (pág 2) and inside back cover (pág total)
                              onInsertBlankPagesAtPositions([2, extractedPages.length + 1]);
                            }
                          }}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium cursor-pointer"
                        >
                          + Portadas interiores (P.2 y última)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INTERACTIVE THUMBNAILS OF ORIGINAL PAGES */}
            {rawPages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Páginas del PDF Original:</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      (Haz clic en ✂️ para cortar cualquiera por la mitad)
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {splitConfig.splitPageNumbers.length > 0
                      ? `${splitConfig.splitPageNumbers.length} dividida(s)`
                      : 'Ninguna dividida'}
                  </span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {rawPages.map((page) => {
                    const isSplit = splitConfig.splitPageNumbers.includes(page.originalPageNumber);
                    return (
                      <div
                        key={page.originalPageNumber}
                        onClick={() => handleTogglePageSplit(page.originalPageNumber)}
                        className={`shrink-0 w-24 rounded-xl border p-1.5 text-center cursor-pointer transition-all select-none group relative ${
                          isSplit
                            ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-400/40'
                            : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-2xs'
                        }`}
                        title={
                          isSplit
                            ? `Página ${page.originalPageNumber} dividida en 2 (haz clic para revertir)`
                            : `Haz clic para dividir la página ${page.originalPageNumber} en 2`
                        }
                      >
                        {/* Thumbnail container with visual cut guide if split */}
                        <div className="relative aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden mb-1 flex items-center justify-center">
                          <img
                            src={page.dataUrl}
                            alt={`Pág original ${page.originalPageNumber}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />

                          {/* Overlay cut guide when split */}
                          {isSplit && (
                            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                              {splitConfig.direction === 'vertical' ? (
                                <>
                                  <div className="absolute inset-y-0 left-1/2 w-0.5 border-l-2 border-dashed border-amber-600 z-10" />
                                  <div className="absolute top-1 left-1 bg-amber-600/90 text-white font-bold text-[8px] px-1 py-0.2 rounded shadow-2xs">
                                    Izq
                                  </div>
                                  <div className="absolute top-1 right-1 bg-amber-600/90 text-white font-bold text-[8px] px-1 py-0.2 rounded shadow-2xs">
                                    Der
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="absolute inset-x-0 top-1/2 h-0.5 border-t-2 border-dashed border-amber-600 z-10" />
                                  <div className="absolute top-1 left-1 bg-amber-600/90 text-white font-bold text-[8px] px-1 py-0.2 rounded shadow-2xs">
                                    Sup
                                  </div>
                                  <div className="absolute bottom-1 left-1 bg-amber-600/90 text-white font-bold text-[8px] px-1 py-0.2 rounded shadow-2xs">
                                    Inf
                                  </div>
                                </>
                              )}
                              <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm">
                                <Scissors className="w-3 h-3" />
                              </div>
                            </div>
                          )}

                          {/* Landscape badge if spread */}
                          {page.isLandscape && (
                            <div className="absolute bottom-1 left-1 z-10">
                              <span className="text-[7.5px] font-bold px-1 py-0.2 rounded bg-indigo-600 text-white shadow-2xs">
                                Apaisada
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Page label & Scissor toggle button */}
                        <div className="flex items-center justify-between px-0.5">
                          <span className="text-[11px] font-bold text-slate-700">
                            Pág {page.originalPageNumber}
                          </span>
                          <span
                            className={`p-1 rounded-md text-[10px] font-semibold flex items-center gap-0.5 transition-colors ${
                              isSplit
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                            }`}
                          >
                            <Scissors className="w-2.5 h-2.5" />
                            <span>{isSplit ? '2x' : '1x'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RESULTING IMPOSED PAGES PREVIEW STRIP */}
            {extractedPages.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        Secuencia del fanzine ({extractedPages.length} páginas)
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      — Arrastra cualquier página o usa ◀ ▶ para moverla de sitio
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onMovePage && extractedPages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowMoveToolbar(!showMoveToolbar)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border ${
                          showMoveToolbar
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                        }`}
                        title="Abrir panel para mover páginas a posiciones concretas"
                      >
                        <Move className="w-3 h-3" />
                        <span>Mover hojas de sitio</span>
                      </button>
                    )}
                    <span className="text-[10px] text-slate-500">
                      Pliegos de {impositionMode === 'zine8' ? 8 : 16} págs
                    </span>
                  </div>
                </div>

                {/* Move Pages Toolbar */}
                {showMoveToolbar && onMovePage && extractedPages.length > 1 && (
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                      <Move className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mover hoja de sitio:</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 text-[11px] font-medium">Mover página:</span>
                      <select
                        value={moveSourcePageNum}
                        onChange={(e) => setMoveSourcePageNum(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500 text-xs"
                      >
                        {extractedPages.map((p) => (
                          <option key={p.pageNumber} value={p.pageNumber}>
                            Pág. {p.pageNumber} {p.isBlank ? '(En blanco)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 text-[11px] font-medium">A la posición:</span>
                      <select
                        value={moveTargetPageNum}
                        onChange={(e) => setMoveTargetPageNum(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500 text-xs"
                      >
                        {extractedPages.map((p) => (
                          <option key={p.pageNumber} value={p.pageNumber}>
                            Pág. {p.pageNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (moveSourcePageNum !== moveTargetPageNum) {
                            onMovePage(moveSourcePageNum - 1, moveTargetPageNum - 1);
                          }
                        }}
                        disabled={moveSourcePageNum === moveTargetPageNum}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mover</span>
                      </button>

                      {onSwapPages && (
                        <button
                          type="button"
                          onClick={() => {
                            if (moveSourcePageNum !== moveTargetPageNum) {
                              onSwapPages(moveSourcePageNum - 1, moveTargetPageNum - 1);
                            }
                          }}
                          disabled={moveSourcePageNum === moveTargetPageNum}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 border border-slate-300 rounded-lg font-semibold cursor-pointer transition-colors flex items-center gap-1"
                          title="Intercambiar las dos páginas"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-slate-500" />
                          <span>Intercambiar</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {/* Plus button at very beginning */}
                  <button
                    type="button"
                    onClick={() => onInsertBlankPage(0)}
                    className="shrink-0 w-5 h-20 rounded border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-400 hover:text-indigo-600 flex items-center justify-center cursor-pointer transition-all group"
                    title="Insertar página en blanco al inicio (Pág 1)"
                  >
                    <Plus className="w-3 h-3 group-hover:scale-125 transition-transform" />
                  </button>

                  {extractedPages.map((page, idx) => {
                    const isBeingDragged = draggedPageIndex === idx;
                    const isDragOver = dragOverPageIndex === idx;

                    return (
                      <React.Fragment key={page.id || `seq-${page.pageNumber}-${idx}`}>
                        <div
                          draggable={!!onMovePage}
                          onDragStart={() => setDraggedPageIndex(idx)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverPageIndex(idx);
                          }}
                          onDragLeave={() => {
                            if (dragOverPageIndex === idx) setDragOverPageIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedPageIndex !== null && draggedPageIndex !== idx && onMovePage) {
                              onMovePage(draggedPageIndex, idx);
                            }
                            setDraggedPageIndex(null);
                            setDragOverPageIndex(null);
                          }}
                          onDragEnd={() => {
                            setDraggedPageIndex(null);
                            setDragOverPageIndex(null);
                          }}
                          className={`shrink-0 w-20 rounded-lg border p-1 text-center text-[10px] relative group select-none transition-all cursor-grab active:cursor-grabbing ${
                            isBeingDragged
                              ? 'opacity-40 border-indigo-400 scale-95'
                              : isDragOver
                              ? 'border-indigo-600 bg-indigo-100/60 ring-2 ring-indigo-500 shadow-md scale-105'
                              : page.isBlank
                              ? 'border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-300'
                              : page.splitPart
                              ? 'border-amber-300 bg-amber-50/50'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                          }`}
                          title="Arrastra para mover de sitio o usa los botones ◀ ▶"
                        >
                          {/* Delete button if blank page */}
                          {page.isBlank && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemovePage(idx);
                              }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-xs transition-transform hover:scale-110 z-10"
                              title="Eliminar esta página en blanco"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}

                          <div className="aspect-[3/4] bg-slate-100 rounded overflow-hidden mb-1 flex items-center justify-center relative">
                            {page.isBlank ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-white border border-dashed border-indigo-200 rounded p-0.5">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                <span className="text-[7.5px] font-bold text-indigo-600 uppercase mt-0.5">
                                  Blanco
                                </span>
                              </div>
                            ) : (
                              <img
                                src={page.dataUrl}
                                alt={`Pág ${page.pageNumber}`}
                                className="w-full h-full object-contain pointer-events-none"
                                loading="lazy"
                              />
                            )}

                            {/* Drag handle overlay hint */}
                            <div className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-80 transition-opacity bg-slate-900/60 rounded text-white p-0.5 pointer-events-none">
                              <GripVertical className="w-2.5 h-2.5" />
                            </div>
                          </div>

                          <div className="truncate font-bold text-slate-800 flex items-center justify-center gap-0.5">
                            <span>P.{page.pageNumber}</span>
                          </div>

                          {page.isBlank ? (
                            <div className="text-[7.5px] font-semibold text-indigo-600 truncate">
                              Vacía
                            </div>
                          ) : page.splitPart ? (
                            <div className="text-[8px] font-medium text-amber-700 truncate">
                              {page.originalPageNumber}.{page.splitPart === 'left' ? 'Izq' : page.splitPart === 'right' ? 'Der' : page.splitPart === 'top' ? 'Sup' : 'Inf'}
                            </div>
                          ) : (
                            <div className="text-[8px] text-slate-400 truncate">
                              Orig {page.originalPageNumber}
                            </div>
                          )}

                          {/* Quick move buttons ◀ ▶ at bottom of card */}
                          {onMovePage && extractedPages.length > 1 && (
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMovePage(idx, idx - 1);
                                }}
                                className="w-4 h-4 rounded hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                                title="Mover una posición hacia la izquierda"
                              >
                                <ArrowLeft className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-[8px] text-slate-400 font-mono">
                                ↔
                              </span>
                              <button
                                type="button"
                                disabled={idx === extractedPages.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMovePage(idx, idx + 1);
                                }}
                                className="w-4 h-4 rounded hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                                title="Mover una posición hacia la derecha"
                              >
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Insertion point '+' button between every page */}
                        <button
                          type="button"
                          onClick={() => onInsertBlankPage(idx + 1)}
                          className="shrink-0 w-4 h-20 rounded border border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 flex items-center justify-center cursor-pointer transition-all group"
                          title={`Insertar página en blanco entre la pág ${page.pageNumber} y la pág ${page.pageNumber + 1}`}
                        >
                          <Plus className="w-2.5 h-2.5 group-hover:scale-125 transition-transform" />
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
