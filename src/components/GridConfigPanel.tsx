import React from 'react';
import { RotateCw, LayoutGrid, RotateCcw, ExternalLink, Scissors } from 'lucide-react';
import { SlotMapping, ImpositionMode } from '../types';

interface GridConfigPanelProps {
  gridSlots: SlotMapping[];
  impositionMode?: ImpositionMode;
  onUpdateSlotRotation: (slotIndex: number, newRotation: number) => void;
  onApplyRotationPreset: (
    preset: 'rows_1_3_180' | 'all_0' | 'all_180' | 'row1_180' | 'rotate_all_90' | 'canva_8_standard' | 'sequential_8'
  ) => void;
}

export const GridConfigPanel: React.FC<GridConfigPanelProps> = ({
  gridSlots,
  impositionMode = 'bookzine16',
  onUpdateSlotRotation,
  onApplyRotationPreset,
}) => {
  const isZine8 = impositionMode === 'zine8';
  const pagesPerSheet = isZine8 ? 8 : 16;
  const rowsCount = isZine8 ? 2 : 4;

  // Check current preset active state
  const isRows1and3Rotated = !isZine8 && gridSlots.every((slot) => {
    if (slot.row === 0 || slot.row === 2) return slot.rotation === 180;
    return slot.rotation === 0;
  });

  const isRow1RotatedOnly = isZine8 && gridSlots.every((slot) => {
    if (slot.row === 0) return slot.rotation === 180;
    return slot.rotation === 0;
  });

  const isAll0 = gridSlots.every((slot) => slot.rotation === 0);
  const isAll180 = gridSlots.every((slot) => slot.rotation === 180);

  const canvaTemplateUrl = isZine8
    ? 'https://canva.link/1ix23ya28nko1k8'
    : 'https://canva.link/d2a98lgqsfyogye';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs">
            3
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            {isZine8
              ? 'Matriz de Imposición (8 Páginas / 4x2 - Plantilla Canva)'
              : 'Matriz de Imposición (16 Páginas / 4x4 - Snake Fold)'}
          </h2>
        </div>

        {/* Quick rotation presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 hidden sm:inline font-medium">Rotación:</span>

          {isZine8 ? (
            <>
              <button
                type="button"
                onClick={() => onApplyRotationPreset('canva_8_standard')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  isRow1RotatedOnly
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Canva Estándar: Fila 1 girada 180° y Fila 2 a 0°"
              >
                Canva Estándar (Fila 1 a 180°) ✓
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onApplyRotationPreset('rows_1_3_180')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                isRows1and3Rotated
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Filas 1 y 3 giradas 180° (Recomendado para plegado de bookzine 16p)"
            >
              Filas 1 y 3 (180°) ✓
            </button>
          )}

          <button
            type="button"
            onClick={() => onApplyRotationPreset('all_0')}
            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              isAll0
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Todas las páginas con 0° de rotación"
          >
            Todas 0°
          </button>
          <button
            type="button"
            onClick={() => onApplyRotationPreset('all_180')}
            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
              isAll180
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Todas las páginas giradas 180°"
          >
            Todas 180°
          </button>
          <button
            type="button"
            onClick={() => onApplyRotationPreset('rotate_all_90')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
            title="Girar todas las páginas 90° adicionales"
          >
            <RotateCw className="w-3 h-3" />
            <span>Girar todas +90°</span>
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-500">
          {isZine8 ? (
            <span>
              Orden plantilla Canva (8 págs):{' '}
              <strong>1ª fila: 8 (Atrás), 1 (Portada), 2, 7</strong> |{' '}
              <strong>2ª fila: 6, 3, 4, 5</strong>
            </span>
          ) : (
            <span>
              Orden solicitado (16 págs): <strong>1ª fila: 3, 2, 1, 16</strong> |{' '}
              <strong>2ª fila: 4, 5, 6, 7</strong> |{' '}
              <strong>3ª fila: 11, 10, 9, 8</strong> |{' '}
              <strong>4ª fila: 12, 13, 14, 15</strong>
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              {isZine8
                ? 'Fila 1 invertida 180° para plegado mini-zine con corte central'
                : 'Filas 1 y 3 giradas 180° para plegado snake'}
            </span>
            <a
              href={canvaTemplateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <span>Ver en Canva</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Rows Visual Representation */}
        <div className="space-y-3">
          {Array.from({ length: rowsCount }, (_, rowIdx) => {
            const rowSlots = gridSlots.filter((s) => s.row === rowIdx);
            const isRowRotated = isZine8 ? rowIdx === 0 : rowIdx === 0 || rowIdx === 2;

            const row16Labels = [
              '1ª fila: 3, 2, 1, 16',
              '2ª fila: 4, 5, 6, 7',
              '3ª fila: 11, 10, 9, 8',
              '4ª fila: 12, 13, 14, 15',
            ];

            const row8Labels = [
              '1ª fila (Superior): 1 (Portada), 8 (Contraportada), 7, 6',
              '2ª fila (Inferior): 2, 3, 4, 5',
            ];

            const label = isZine8 ? row8Labels[rowIdx] : row16Labels[rowIdx];

            return (
              <div key={rowIdx} className="space-y-1">
                {/* Central cut indicator for 8-page zine between row 0 and row 1 */}
                {isZine8 && rowIdx === 1 && (
                  <div className="my-2 py-1 px-3 rounded-lg bg-rose-50 border border-dashed border-rose-300 text-rose-800 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Scissors className="w-3.5 h-3.5 text-rose-600" />
                      <span>Línea de corte central (Slit entre columnas centrales 2 y 3)</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Corte para plegado</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-1">
                  <div className="flex items-center gap-2">
                    <span>{label}</span>
                    {isRowRotated ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                        180° (Invertida para plegar)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">
                        0° (Normal)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Fila {rowIdx + 1}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {rowSlots.map((slot) => {
                    const isCover = slot.relativePage === 1;
                    const isBackCover = slot.relativePage === pagesPerSheet;
                    const isSlot180 = slot.rotation === 180;

                    return (
                      <div
                        key={slot.slotIndex}
                        className={`p-2.5 rounded-lg border text-center relative transition-all ${
                          isCover
                            ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-2xs'
                            : isBackCover
                            ? 'bg-violet-50/80 border-violet-300 text-violet-950 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isCover
                                ? 'bg-indigo-600 text-white'
                                : isBackCover
                                ? 'bg-violet-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            Pág. {slot.relativePage}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSlotRotation(
                                slot.slotIndex,
                                (slot.rotation + 90) % 360
                              )
                            }
                            title="Rotar 90° individualmente"
                            className="text-slate-400 hover:text-amber-600 p-0.5 rounded hover:bg-white/80 cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs font-bold my-1">
                          {isCover
                            ? 'Portada'
                            : isBackCover
                            ? 'Contraportada'
                            : `Página ${slot.relativePage}`}
                        </div>

                        <div className="flex items-center justify-center gap-0.5 mt-1.5 pt-1 border-t border-slate-200/60">
                          {[0, 90, 180, 270].map((deg) => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => onUpdateSlotRotation(slot.slotIndex, deg)}
                              className={`px-1 py-0.2 rounded text-[8.5px] font-mono font-bold transition-all cursor-pointer ${
                                slot.rotation === deg
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-white/80 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
                              }`}
                              title={`Rotar casilla a ${deg}°`}
                            >
                              {deg}°
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
