import React, { useRef, useState, useEffect } from 'react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Scissors,
  Layers,
  RotateCcw,
  Copy,
  Info,
  FilePlus,
  Trash2,
  Plus,
  FileText,
  Move,
  ArrowLeftRight,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import {
  ExtractedPage,
  SlotMapping,
  SheetConfig,
  SheetAdjustmentsMap,
  ImpositionMode,
} from '../types';

interface SheetViewerProps {
  extractedPages: ExtractedPage[];
  gridSlots: SlotMapping[];
  templateConfig: SheetConfig;
  sheetAdjustments?: SheetAdjustmentsMap;
  impositionMode?: ImpositionMode;
  onUpdateSheetSlotRotation: (
    sheetIndex: number,
    slotIndex: number,
    newRotation: number
  ) => void;
  onRotateAllSheetSlots?: (sheetIndex: number, delta: number) => void;
  onResetSheetAdjustments: (sheetIndex: number) => void;
  onCopySheetAdjustmentsToAll?: (sourceSheetIndex: number) => void;
  onInsertBlankPage?: (insertIndex: number, count?: number) => void;
  onRemovePage?: (pageIndex: number) => void;
  onMovePage?: (fromIndex: number, toIndex: number) => void;
  onSwapPages?: (indexA: number, indexB: number) => void;
  onMoveSheet?: (fromSheetIndex: number, toSheetIndex: number) => void;
}

const ROTATION_OPTIONS = [0, 90, 180, 270] as const;

export const SheetViewer: React.FC<SheetViewerProps> = ({
  extractedPages,
  gridSlots,
  templateConfig,
  sheetAdjustments = {},
  impositionMode = 'bookzine16',
  onUpdateSheetSlotRotation,
  onRotateAllSheetSlots,
  onResetSheetAdjustments,
  onCopySheetAdjustmentsToAll,
  onInsertBlankPage,
  onRemovePage,
  onMovePage,
  onSwapPages,
  onMoveSheet,
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [movingPageTarget, setMovingPageTarget] = useState<{
    pageIndex: number; // 0-indexed
    pageNumber: number; // 1-indexed
  } | null>(null);
  const [moveDestinationNum, setMoveDestinationNum] = useState<number>(1);
  const [blankModalTarget, setBlankModalTarget] = useState<{
    targetPageNumber: number; // 1-indexed
    placement: 'before' | 'after';
    count: number;
    slotIndex?: number;
  } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const pagesPerSheet = impositionMode === 'zine8' ? 8 : 16;
  const totalPages = extractedPages.length;
  const totalSheets = Math.max(1, Math.ceil(totalPages / pagesPerSheet));

  // Sync active sheet if totalSheets decreases
  useEffect(() => {
    if (activeSheetIndex >= totalSheets) {
      setActiveSheetIndex(Math.max(0, totalSheets - 1));
    }
  }, [totalSheets, activeSheetIndex]);

  const baseOffset = activeSheetIndex * pagesPerSheet;
  const isLandscape = templateConfig.orientation === 'landscape';

  const colsCount = Math.max(...gridSlots.map((s) => s.col), 0) + 1;
  const rowsCount = Math.max(...gridSlots.map((s) => s.row), 0) + 1;

  const currentAdjustment = sheetAdjustments[activeSheetIndex] || { slotOverrides: {} };
  const slotOverrides = currentAdjustment.slotOverrides || {};
  const slotOverridesCount = Object.keys(slotOverrides).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Sheet Selector Tabs */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs">
            4
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            {impositionMode === 'zine8'
              ? 'Vista Previa del Pliego Imposicionado (4x2 - 8 Páginas)'
              : 'Vista Previa del Pliego Imposicionado (4x4 - 16 Páginas)'}
          </h2>
          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
            {isLandscape ? 'Horizontal (Apaisado)' : 'Vertical (Retrato)'}
          </span>
        </div>

        {/* Sheet navigation tabs if multiple sheets */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          {Array.from({ length: totalSheets }).map((_, idx) => {
            const adj = sheetAdjustments[idx];
            const overridesCount = adj && adj.slotOverrides ? Object.keys(adj.slotOverrides).length : 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSheetIndex(idx)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeSheetIndex === idx
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Pliego {idx + 1}</span>
                <span className="text-[10px] opacity-80">
                  (Págs {idx * pagesPerSheet + 1}-{Math.min((idx + 1) * pagesPerSheet, totalPages || pagesPerSheet)})
                </span>
                {overridesCount > 0 && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                      activeSheetIndex === idx
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                    title={`${overridesCount} página(s) con giro personalizado en este pliego`}
                  >
                    {overridesCount} rot.
                  </span>
                )}
              </button>
            );
          })}

          {totalSheets > 1 && onMoveSheet && (
            <div className="flex items-center gap-1 pl-1 ml-1 border-l border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold hidden md:inline">
                Mover pliego:
              </span>
              <button
                type="button"
                disabled={activeSheetIndex === 0}
                onClick={() => {
                  onMoveSheet(activeSheetIndex, activeSheetIndex - 1);
                  setActiveSheetIndex(activeSheetIndex - 1);
                }}
                className="px-2 py-0.5 rounded bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                title="Mover este pliego una posición a la izquierda"
              >
                ◀ Pliego antes
              </button>
              <button
                type="button"
                disabled={activeSheetIndex >= totalSheets - 1}
                onClick={() => {
                  onMoveSheet(activeSheetIndex, activeSheetIndex + 1);
                  setActiveSheetIndex(activeSheetIndex + 1);
                }}
                className="px-2 py-0.5 rounded bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                title="Mover este pliego una posición a la derecha"
              >
                Pliego después ▶
              </button>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.1))}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer"
            title="Reducir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-500 font-mono w-10 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomScale(1)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer text-xs font-medium ml-1"
            title="Restablecer zoom"
          >
            100%
          </button>
        </div>
      </div>

      {/* Pliego Rotation Toolbar: Rotate pages up to 270° per sheet */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Rotación por páginas (Pliego {activeSheetIndex + 1}):</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Cada casilla puede rotarse independientemente a <strong>0°, 90°, 180° o 270°</strong>.
          </span>
          {slotOverridesCount > 0 && (
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
              {slotOverridesCount} página(s) modificadas
            </span>
          )}
        </div>

        {/* Batch rotation tools for active pliego */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onRotateAllSheetSlots && (
            <>
              <button
                type="button"
                onClick={() => onRotateAllSheetSlots(activeSheetIndex, 90)}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Avanzar 90° todas las páginas de este pliego (0° -> 90° -> 180° -> 270°)"
              >
                <RotateCw className="w-3 h-3 text-amber-600" />
                <span>Girar páginas +90°</span>
              </button>

              <button
                type="button"
                onClick={() => onRotateAllSheetSlots(activeSheetIndex, 180)}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Invertir todas las páginas de este pliego 180°"
              >
                <span>Invertir (180°)</span>
              </button>
            </>
          )}

          {totalSheets > 1 && onCopySheetAdjustmentsToAll && (
            <button
              type="button"
              onClick={() => onCopySheetAdjustmentsToAll(activeSheetIndex)}
              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 font-medium text-[11px] flex items-center gap-1 cursor-pointer"
              title="Copiar las rotaciones de página de este pliego a todos los demás pliegos"
            >
              <Copy className="w-3 h-3" />
              <span>Copiar a todos</span>
            </button>
          )}

          {slotOverridesCount > 0 && (
            <button
              type="button"
              onClick={() => onResetSheetAdjustments(activeSheetIndex)}
              className="px-2 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded font-medium text-[11px] flex items-center gap-1 cursor-pointer"
              title="Restablecer rotaciones de este pliego a la matriz original"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer pliego</span>
            </button>
          )}

          {/* Blank page insertion controls from sheet viewer */}
          {onInsertBlankPage && (
            <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() =>
                  setBlankModalTarget({
                    targetPageNumber: Math.max(1, baseOffset + 1),
                    placement: 'before',
                    count: 1,
                  })
                }
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Abrir diálogo para insertar una o más páginas en blanco en cualquier posición de este pliego"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>+ Añadir Página en Blanco</span>
              </button>

              {extractedPages.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-indigo-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      const mid = Math.floor(extractedPages.length / 2);
                      onInsertBlankPage(mid, 1);
                    }}
                    className="px-1.5 py-0.5 bg-white hover:bg-indigo-100 text-indigo-900 rounded border border-indigo-200 text-[10px] font-semibold cursor-pointer transition-colors"
                    title={`Insertar 1 página en blanco en el centro (Pág ${Math.floor(extractedPages.length / 2) + 1})`}
                  >
                    En medio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mid = Math.floor(extractedPages.length / 2);
                      onInsertBlankPage(mid, 2);
                    }}
                    className="px-1.5 py-0.5 bg-white hover:bg-indigo-100 text-indigo-900 rounded border border-indigo-200 text-[10px] font-semibold cursor-pointer transition-colors"
                    title="Insertar 2 páginas en blanco en medio"
                  >
                    +2 en medio
                  </button>
                  <button
                    type="button"
                    onClick={() => onInsertBlankPage(extractedPages.length, 1)}
                    className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-indigo-200 text-[10px] font-medium cursor-pointer transition-colors"
                    title="Insertar página en blanco al final del zine"
                  >
                    Al final
                  </button>
                  {(() => {
                    const remainder = totalPages % pagesPerSheet;
                    const needed = remainder === 0 ? 0 : pagesPerSheet - remainder;
                    if (needed > 0) {
                      return (
                        <button
                          type="button"
                          onClick={() => onInsertBlankPage(totalPages, needed)}
                          className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded border border-amber-300 text-[10px] font-bold cursor-pointer transition-colors"
                          title={`Insertar ${needed} página(s) para completar las ${pagesPerSheet} de este pliego`}
                        >
                          +{needed} completar
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Sheet Canvas Area */}
      <div className="p-6 bg-slate-100/70 overflow-auto flex justify-center min-h-[460px] items-center">
        <div
          ref={sheetRef}
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
            padding: `${templateConfig.marginPercent}%`,
          }}
          className={`w-full ${
            isLandscape ? 'max-w-4xl aspect-[1.414/1]' : 'max-w-xl aspect-[1/1.414]'
          } bg-white rounded-xl shadow-lg border border-slate-300 relative overflow-hidden flex flex-col`}
        >
          {/* Central cut slit line for 8-page mini-zine (between middle 2 columns along the horizontal fold) */}
          {rowsCount === 2 && colsCount === 4 && templateConfig.showFoldGuides && (
            <div className="absolute left-[25%] right-[25%] top-1/2 -translate-y-1/2 border-t-2 border-dashed border-rose-500 z-30 pointer-events-none flex items-center justify-center">
              <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm -mt-2.5 flex items-center gap-1">
                <Scissors className="w-2.5 h-2.5" />
                Línea de corte central (Slit)
              </span>
            </div>
          )}

          {/* Dotted / Dashed border around sheet (Perimeter or Margin Cut Guide) */}
          {templateConfig.showSheetBorder !== false && (
            <div
              style={{
                inset:
                  templateConfig.sheetBorderPosition === 'edge'
                    ? '8px'
                    : `${templateConfig.marginPercent}%`,
              }}
              className={`absolute pointer-events-none z-20 border-2 ${
                templateConfig.sheetBorderStyle === 'dashed'
                  ? 'border-dashed'
                  : 'border-dotted'
              } border-slate-500/80 rounded-xs`}
            >
              <div className="absolute top-1 left-1.5 flex items-center gap-1 bg-slate-900/85 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-xs">
                <Scissors className="w-2.5 h-2.5 text-amber-300" />
                <span>Borde punteado de la hoja</span>
              </div>
            </div>
          )}

          {/* Dynamic Grid Container (4x4 or 4x2) */}
          <div
            style={{
              gap: `${templateConfig.gapPercent}%`,
              gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rowsCount}, minmax(0, 1fr))`,
            }}
            className="grid w-full h-full relative z-10"
          >
            {gridSlots.map((slot) => {
              const targetPageNumber = baseOffset + slot.relativePage;
              const hasPage = targetPageNumber <= totalPages;
              const pageData = hasPage ? extractedPages[targetPageNumber - 1] : null;

              const isCover = slot.relativePage === 1;
              const isBackCover = slot.relativePage === pagesPerSheet;

              const slotOverride = slotOverrides[slot.slotIndex];
              const effectiveRotation =
                slotOverride !== undefined ? slotOverride : slot.rotation;
              const isOverridden =
                slotOverride !== undefined && slotOverride !== slot.rotation;

              return (
                <div
                  key={slot.slotIndex}
                  className={`relative rounded-md border flex flex-col justify-between overflow-hidden transition-all group ${
                    isCover
                      ? 'border-indigo-400 bg-indigo-50/20'
                      : isBackCover
                      ? 'border-violet-400 bg-violet-50/20'
                      : 'border-slate-200/90 bg-white/90'
                  }`}
                >
                  {/* Fold and cut guidelines */}
                  {templateConfig.showFoldGuides && (
                    <div className="absolute inset-0 pointer-events-none border border-dashed border-slate-300/40 z-20" />
                  )}

                  {/* Slot Top Header Badge */}
                  <div className="absolute top-1 left-1 z-20 flex items-center gap-1">
                    {templateConfig.showPageLabels && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs ${
                          isCover
                            ? 'bg-indigo-600 text-white'
                            : isBackCover
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-800/85 text-white'
                        }`}
                      >
                        Pág {targetPageNumber}
                        {isCover && ' (Portada)'}
                        {isBackCover && ' (Atrás)'}
                      </span>
                    )}

                    {pageData?.isBlank && (
                      <span
                        className="text-[8px] font-bold px-1 py-0.2 rounded bg-indigo-600 text-white shadow-2xs"
                        title="Página en blanco"
                      >
                        En blanco
                      </span>
                    )}

                    {pageData?.splitPart && (
                      <span
                        className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-400 text-slate-950 shadow-2xs"
                        title={`Mitad ${
                          pageData.splitPart === 'left'
                            ? 'izquierda'
                            : pageData.splitPart === 'right'
                            ? 'derecha'
                            : pageData.splitPart === 'top'
                            ? 'superior'
                            : 'inferior'
                        } de la pág. original ${pageData.originalPageNumber}`}
                      >
                        ✂️ {pageData.originalPageNumber}.
                        {pageData.splitPart === 'left'
                          ? 'Izq'
                          : pageData.splitPart === 'right'
                          ? 'Der'
                          : pageData.splitPart === 'top'
                          ? 'Sup'
                          : 'Inf'}
                      </span>
                    )}

                    {/* Active rotation indicator */}
                    <span
                      className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded shadow-2xs ${
                        isOverridden
                          ? 'bg-amber-500 text-slate-950'
                          : effectiveRotation !== 0
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                      title={
                        isOverridden
                          ? `Giro personalizado para este pliego: ${effectiveRotation}°`
                          : `Giro de matriz: ${effectiveRotation}°`
                      }
                    >
                      {effectiveRotation}°{isOverridden ? '*' : ''}
                    </span>
                  </div>

                  {/* Top Right Quick Cycle Button and Blank Page Removal */}
                  <div className="absolute top-1 right-1 z-20 flex items-center gap-0.5">
                    {pageData?.isBlank && onRemovePage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePage(targetPageNumber - 1);
                        }}
                        className="w-5 h-5 rounded bg-rose-500 hover:bg-rose-600 text-white shadow-xs flex items-center justify-center cursor-pointer transition-colors"
                        title="Eliminar esta página en blanco del fanzine"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                    {/* Add Blank Page at this slot position */}
                    {onInsertBlankPage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlankModalTarget({
                            targetPageNumber: Math.min(targetPageNumber, totalPages + 1),
                            placement: 'before',
                            count: 1,
                            slotIndex: slot.slotIndex,
                          });
                        }}
                        className="w-5 h-5 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 shadow-xs border border-emerald-200 flex items-center justify-center cursor-pointer transition-colors"
                        title={`Insertar página en blanco antes/después de la Pág ${targetPageNumber}`}
                      >
                        <FilePlus className="w-2.5 h-2.5" />
                      </button>
                    )}

                    {/* Move Page Button */}
                    {onMovePage && hasPage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMovingPageTarget({
                            pageIndex: targetPageNumber - 1,
                            pageNumber: targetPageNumber,
                          });
                          setMoveDestinationNum(targetPageNumber);
                        }}
                        className="w-5 h-5 rounded bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 shadow-xs border border-indigo-200 flex items-center justify-center cursor-pointer transition-colors"
                        title={`Mover la página ${targetPageNumber} a otra posición del fanzine`}
                      >
                        <Move className="w-2.5 h-2.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextRot = (effectiveRotation + 90) % 360;
                        onUpdateSheetSlotRotation(
                          activeSheetIndex,
                          slot.slotIndex,
                          nextRot
                        );
                      }}
                      className="w-5 h-5 rounded bg-white/95 hover:bg-amber-100 text-slate-700 hover:text-amber-900 shadow-xs border border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                      title={`Rotar página +90° en este pliego (actual: ${effectiveRotation}°)`}
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    {isOverridden && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateSheetSlotRotation(
                            activeSheetIndex,
                            slot.slotIndex,
                            slot.rotation
                          );
                        }}
                        className="w-5 h-5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 shadow-xs border border-rose-200 flex items-center justify-center cursor-pointer text-[10px] font-bold"
                        title="Restablecer rotación por defecto de esta casilla"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Page Image Content Area */}
                  <div className="w-full h-full flex items-center justify-center p-1.5 relative overflow-hidden">
                    {pageData ? (
                      pageData.isBlank ? (
                        <div
                          style={{
                            transform: `rotate(${effectiveRotation}deg)`,
                            transition: 'transform 0.2s ease',
                          }}
                          className="w-full h-full flex flex-col items-center justify-center p-2 text-center rounded border border-dashed border-indigo-300 bg-indigo-50/20"
                        >
                          <FileText className="w-6 h-6 text-indigo-400 mb-1" />
                          <span className="text-[10px] font-bold text-indigo-700">Página en Blanco</span>
                          <span className="text-[8px] text-slate-400">Pág {targetPageNumber}</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            transform: `rotate(${effectiveRotation}deg)`,
                            transition: 'transform 0.2s ease',
                          }}
                          className="w-full h-full flex items-center justify-center pointer-events-none select-none"
                        >
                          <img
                            src={pageData.dataUrl}
                            alt={`Página ${targetPageNumber}`}
                            className={`w-full h-full ${
                              templateConfig.fitMode === 'cover'
                                ? 'object-cover'
                                : 'object-contain'
                            } rounded-xs shadow-2xs`}
                          />
                        </div>
                      )
                    ) : (
                      <div className="text-center p-2 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-medium text-slate-400 block mb-1">
                          {totalPages === 0
                            ? `Pág. ${slot.relativePage}`
                            : `Pág. ${targetPageNumber} (Sin asignar)`}
                        </span>
                        {onInsertBlankPage && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBlankModalTarget({
                                targetPageNumber: Math.min(targetPageNumber, totalPages + 1),
                                placement: 'before',
                                count: 1,
                                slotIndex: slot.slotIndex,
                              });
                            }}
                            className="px-2 py-1 rounded text-[10px] bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs mt-1"
                            title={`Añadir página en blanco para asignar esta casilla (Pág ${targetPageNumber})`}
                          >
                            <FilePlus className="w-3 h-3" />
                            <span>+ Añadir Blanco</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Discrete rotation buttons (0°, 90°, 180°, 270°) at bottom of cell */}
                  <div className="relative z-20 px-1 py-0.5 bg-slate-50/95 border-t border-slate-200/70 flex items-center justify-between gap-0.5 text-[8.5px]">
                    <span className="text-[8px] text-slate-400 font-semibold px-0.5 hidden sm:inline">
                      Giro:
                    </span>
                    <div className="flex items-center justify-end w-full gap-0.5">
                      {ROTATION_OPTIONS.map((angle) => {
                        const isSelected = effectiveRotation === angle;
                        return (
                          <button
                            key={angle}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateSheetSlotRotation(
                                activeSheetIndex,
                                slot.slotIndex,
                                angle
                              );
                            }}
                            className={`px-1 py-0.2 rounded font-mono font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-white shadow-2xs scale-105'
                                : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200/80'
                            }`}
                            title={`Fijar rotación de esta página a ${angle}°`}
                          >
                            {angle}°
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            Página 1 (Portada)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
            Página {pagesPerSheet} (Contraportada)
          </span>
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Info className="w-3.5 h-3.5 text-amber-500" />
            Rotaciones disponibles por página: 0°, 90°, 180°, 270°
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium text-slate-600">
          <span className="capitalize">
            {isLandscape ? 'Horizontal' : 'Vertical'} ({templateConfig.sheetSize})
          </span>
          <span>•</span>
          <span>
            Pliego {activeSheetIndex + 1} de {totalSheets}
          </span>
        </div>
      </div>

      {/* Interactive Move Page Modal / Popover */}
      {movingPageTarget && onMovePage && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Move className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Mover Página de Sitio
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Página actual: <strong className="text-indigo-600">Pág. {movingPageTarget.pageNumber}</strong> (de {totalPages})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMovingPageTarget(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick adjacent move buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Atajos de desplazamiento rápido:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={movingPageTarget.pageIndex <= 0}
                  onClick={() => {
                    onMovePage(movingPageTarget.pageIndex, movingPageTarget.pageIndex - 1);
                    setMovingPageTarget({
                      pageIndex: movingPageTarget.pageIndex - 1,
                      pageNumber: movingPageTarget.pageNumber - 1,
                    });
                  }}
                  className="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>1 posición antes</span>
                </button>

                <button
                  type="button"
                  disabled={movingPageTarget.pageIndex >= totalPages - 1}
                  onClick={() => {
                    onMovePage(movingPageTarget.pageIndex, movingPageTarget.pageIndex + 1);
                    setMovingPageTarget({
                      pageIndex: movingPageTarget.pageIndex + 1,
                      pageNumber: movingPageTarget.pageNumber + 1,
                    });
                  }}
                  className="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                >
                  <span>1 posición después</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={movingPageTarget.pageIndex === 0}
                  onClick={() => {
                    onMovePage(movingPageTarget.pageIndex, 0);
                    setMovingPageTarget(null);
                  }}
                  className="py-1 px-2 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Ir a Portada (Pág 1)
                </button>
                <button
                  type="button"
                  disabled={movingPageTarget.pageIndex === totalPages - 1}
                  onClick={() => {
                    onMovePage(movingPageTarget.pageIndex, totalPages - 1);
                    setMovingPageTarget(null);
                  }}
                  className="py-1 px-2 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Ir al Final (Pág {totalPages})
                </button>
              </div>
            </div>

            {/* Custom target destination select */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Mover o intercambiar con una posición concreta:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Destino:</span>
                <select
                  value={moveDestinationNum}
                  onChange={(e) => setMoveDestinationNum(Number(e.target.value))}
                  className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-bold text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      Página {n} {n === 1 ? '(Portada)' : n === totalPages ? '(Atrás)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onMovePage(movingPageTarget.pageIndex, moveDestinationNum - 1);
                    setMovingPageTarget(null);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mover a Pág. {moveDestinationNum}</span>
                </button>

                {onSwapPages && (
                  <button
                    type="button"
                    onClick={() => {
                      onSwapPages(movingPageTarget.pageIndex, moveDestinationNum - 1);
                      setMovingPageTarget(null);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    title={`Intercambiar posición de Pág ${movingPageTarget.pageNumber} con Pág ${moveDestinationNum}`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>Intercambiar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Add Blank Page Modal in Imposed Sheet Preview */}
      {blankModalTarget && onInsertBlankPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Añadir Página en Blanco al Pliego
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pliego actual: <strong>Pliego {activeSheetIndex + 1}</strong> • Total en fanzine: <strong>{totalPages} págs</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlankModalTarget(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Position Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                ¿En qué posición del pliego/fanzine deseas insertarla?
              </label>

              {/* Placement radio options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    blankModalTarget.placement === 'before'
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold ring-1 ring-indigo-400'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="blankPlacement"
                    checked={blankModalTarget.placement === 'before'}
                    onChange={() =>
                      setBlankModalTarget({
                        ...blankModalTarget,
                        placement: 'before',
                      })
                    }
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span>Antes de la pág. seleccionada</span>
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Desplaza la actual hacia adelante
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    blankModalTarget.placement === 'after'
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold ring-1 ring-indigo-400'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="blankPlacement"
                    checked={blankModalTarget.placement === 'after'}
                    onChange={() =>
                      setBlankModalTarget({
                        ...blankModalTarget,
                        placement: 'after',
                      })
                    }
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span>Después de la pág.</span>
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Inserta a continuación
                    </span>
                  </div>
                </label>
              </div>

              {/* Page selector dropdown */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-600 font-medium">
                  Página de referencia:
                </span>
                <select
                  value={blankModalTarget.targetPageNumber}
                  onChange={(e) =>
                    setBlankModalTarget({
                      ...blankModalTarget,
                      targetPageNumber: Number(e.target.value),
                    })
                  }
                  className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                >
                  {totalPages === 0 ? (
                    <option value={1}>Página 1 (Inicial)</option>
                  ) : (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                      const isCurrentSheet =
                        n > baseOffset && n <= baseOffset + pagesPerSheet;
                      return (
                        <option key={n} value={n}>
                          Pág. {n}{' '}
                          {n === 1
                            ? '— Portada'
                            : n === totalPages
                            ? '— Contraportada'
                            : ''}{' '}
                          {isCurrentSheet
                            ? `(En este pliego ${activeSheetIndex + 1})`
                            : ''}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Quick Position Presets */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setBlankModalTarget({
                      ...blankModalTarget,
                      targetPageNumber: Math.max(1, baseOffset + 1),
                      placement: 'before',
                    })
                  }
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-medium rounded border border-slate-200 transition-colors"
                >
                  Inicio de este pliego
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBlankModalTarget({
                      ...blankModalTarget,
                      targetPageNumber: Math.max(1, Math.floor(totalPages / 2)),
                      placement: 'after',
                    })
                  }
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-medium rounded border border-slate-200 transition-colors"
                >
                  En medio del fanzine
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBlankModalTarget({
                      ...blankModalTarget,
                      targetPageNumber: Math.max(1, totalPages),
                      placement: 'after',
                    })
                  }
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-medium rounded border border-slate-200 transition-colors"
                >
                  Al final del fanzine
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Cantidad de páginas en blanco a insertar:
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={blankModalTarget.count <= 1}
                    onClick={() =>
                      setBlankModalTarget({
                        ...blankModalTarget,
                        count: Math.max(1, blankModalTarget.count - 1),
                      })
                    }
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={blankModalTarget.count}
                    onChange={(e) =>
                      setBlankModalTarget({
                        ...blankModalTarget,
                        count: Math.max(
                          1,
                          Math.min(32, parseInt(e.target.value) || 1)
                        ),
                      })
                    }
                    className="w-12 text-center text-xs font-bold bg-slate-50 border border-slate-300 rounded px-1 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBlankModalTarget({
                        ...blankModalTarget,
                        count: blankModalTarget.count + 1,
                      })
                    }
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick count chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 4, 8].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() =>
                      setBlankModalTarget({ ...blankModalTarget, count: qty })
                    }
                    className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors ${
                      blankModalTarget.count === qty
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    +{qty} {qty === 1 ? 'página' : 'páginas'}
                  </button>
                ))}
                {(() => {
                  const remainder = totalPages % pagesPerSheet;
                  const neededToComplete =
                    remainder === 0 ? 0 : pagesPerSheet - remainder;
                  if (
                    neededToComplete > 0 &&
                    neededToComplete !== 1 &&
                    neededToComplete !== 2 &&
                    neededToComplete !== 4
                  ) {
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setBlankModalTarget({
                            ...blankModalTarget,
                            count: neededToComplete,
                            placement: 'after',
                            targetPageNumber: totalPages,
                          })
                        }
                        className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors"
                        title={`Insertar ${neededToComplete} páginas al final para completar el pliego de ${pagesPerSheet}`}
                      >
                        +{neededToComplete} para completar pliego
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Dynamic summary */}
            <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>Resumen de imposición:</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Se insertará(n){' '}
                <strong>{blankModalTarget.count} página(s) en blanco</strong>{' '}
                {blankModalTarget.placement === 'before' ? 'antes' : 'después'}{' '}
                de la{' '}
                <strong>Página {blankModalTarget.targetPageNumber}</strong>. El
                fanzine tendrá{' '}
                <strong>{totalPages + blankModalTarget.count} páginas</strong> en
                total (
                {Math.ceil(
                  (totalPages + blankModalTarget.count) / pagesPerSheet
                )}{' '}
                pliego(s)).
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const rawIdx =
                    blankModalTarget.placement === 'before'
                      ? blankModalTarget.targetPageNumber - 1
                      : blankModalTarget.targetPageNumber;
                  const insertIdx = Math.max(0, Math.min(rawIdx, totalPages));
                  onInsertBlankPage(insertIdx, blankModalTarget.count);
                  setBlankModalTarget(null);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <FilePlus className="w-4 h-4" />
                <span>
                  Insertar {blankModalTarget.count} Página(s) en Blanco
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBlankModalTarget(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
