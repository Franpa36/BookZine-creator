import React from 'react';
import {
  ExternalLink,
  Sliders,
  Sparkles,
  RectangleHorizontal,
  RectangleVertical,
  Scissors,
} from 'lucide-react';
import { SheetConfig, ImpositionMode } from '../types';

interface CanvaTemplatePanelProps {
  templateConfig: SheetConfig;
  onChangeTemplateConfig: (updater: (prev: SheetConfig) => SheetConfig) => void;
  impositionMode?: ImpositionMode;
}

export const CanvaTemplatePanel: React.FC<CanvaTemplatePanelProps> = ({
  templateConfig,
  onChangeTemplateConfig,
  impositionMode = 'bookzine16',
}) => {
  const isZine8 = impositionMode === 'zine8';
  const canvaLink = isZine8
    ? 'https://canva.link/1ix23ya28nko1k8'
    : 'https://canva.link/d2a98lgqsfyogye';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs">
            2
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            {isZine8
              ? 'Configuración del Pliego (8 Páginas)'
              : 'Configuración del Pliego (16 Páginas)'}
          </h2>
        </div>
        <a
          href={canvaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <span>Abrir plantilla en Canva {isZine8 ? '(8p)' : '(16p)'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="p-5 space-y-5">
        {/* Canva Template Info Banner (Without file upload) */}
        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Plantilla Canva oficial {isZine8 ? 'Fanzine 8 páginas' : 'Bookzine 16 páginas'}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Diseña las páginas en Canva y expórtalas como PDF. Luego, cárgalas en el <strong>Paso 1</strong> para organizarlas automáticamente en la cuadrícula de pliegos con la orientación de plegado ideal.
              </p>
            </div>
          </div>
          <a
            href={canvaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-center shadow-2xs"
          >
            <span>Ver plantilla</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Sheet Orientation, Size & Fitting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Orientation choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Orientación del Pliego
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeTemplateConfig((prev) => ({ ...prev, orientation: 'landscape' }))}
                className={`py-2 px-2 text-xs rounded-lg border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  templateConfig.orientation === 'landscape'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }`}
              >
                <RectangleHorizontal className="w-4 h-4" />
                <span>Horizontal</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeTemplateConfig((prev) => ({ ...prev, orientation: 'portrait' }))}
                className={`py-2 px-2 text-xs rounded-lg border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  templateConfig.orientation === 'portrait'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }`}
              >
                <RectangleVertical className="w-4 h-4" />
                <span>Vertical</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {templateConfig.orientation === 'landscape' ? 'Apaisado (ancho mayor)' : 'Retrato (alto mayor)'}
            </p>
          </div>

          {/* Sheet size */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tamaño de papel
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['A3', 'A4', 'Tabloid'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChangeTemplateConfig((prev) => ({ ...prev, sheetSize: size }))}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    templateConfig.sheetSize === size
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              A3 estándar recomendado para 16 págs.
            </p>
          </div>

          {/* Image fitting mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ajuste en las casillas
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['contain', 'cover'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeTemplateConfig((prev) => ({ ...prev, fitMode: mode }))}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    templateConfig.fitMode === mode
                      ? 'bg-slate-800 text-white border-slate-900 shadow-2xs font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode === 'contain' ? 'Ajustar' : 'Llenar'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {templateConfig.fitMode === 'contain' ? 'Mantiene proporciones exactas' : 'Cubre toda la casilla'}
            </p>
          </div>
        </div>

        {/* Calibrations & Guides */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Calibración de márgenes y marcos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Margen exterior de hoja:</span>
                <span className="font-semibold">{templateConfig.marginPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={templateConfig.marginPercent}
                onChange={(e) =>
                  onChangeTemplateConfig((prev) => ({
                    ...prev,
                    marginPercent: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Espacio entre marcos (Casillas):</span>
                <span className="font-semibold">{templateConfig.gapPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="0.2"
                value={templateConfig.gapPercent}
                onChange={(e) =>
                  onChangeTemplateConfig((prev) => ({
                    ...prev,
                    gapPercent: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <label className="inline-flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={templateConfig.showSheetBorder !== false}
                  onChange={(e) =>
                    onChangeTemplateConfig((prev) => ({
                      ...prev,
                      showSheetBorder: e.target.checked,
                    }))
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-600" />
                  <span>Borde punteado alrededor de la hoja</span>
                </span>
              </label>

              {templateConfig.showSheetBorder !== false && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center bg-white rounded border border-slate-300 p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeTemplateConfig((prev) => ({
                          ...prev,
                          sheetBorderStyle: 'dotted',
                        }))
                      }
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        (templateConfig.sheetBorderStyle || 'dotted') === 'dotted'
                          ? 'bg-amber-500 text-white font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Punteado (...)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeTemplateConfig((prev) => ({
                          ...prev,
                          sheetBorderStyle: 'dashed',
                        }))
                      }
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        templateConfig.sheetBorderStyle === 'dashed'
                          ? 'bg-amber-500 text-white font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Discontinuo (---)
                    </button>
                  </div>

                  <select
                    value={templateConfig.sheetBorderPosition || 'margin'}
                    onChange={(e) =>
                      onChangeTemplateConfig((prev) => ({
                        ...prev,
                        sheetBorderPosition: e.target.value as 'margin' | 'edge',
                      }))
                    }
                    className="text-[11px] bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 cursor-pointer focus:ring-1 focus:ring-amber-500"
                    title="Posición de la línea punteada"
                  >
                    <option value="margin">En el margen de corte</option>
                    <option value="edge">Alrededor del papel (Perímetro)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 px-1">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={templateConfig.showFoldGuides}
                  onChange={(e) =>
                    onChangeTemplateConfig((prev) => ({
                      ...prev,
                      showFoldGuides: e.target.checked,
                    }))
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Mostrar líneas de pliegue interiores</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={templateConfig.showPageLabels}
                  onChange={(e) =>
                    onChangeTemplateConfig((prev) => ({
                      ...prev,
                      showPageLabels: e.target.checked,
                    }))
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Mostrar números de página identificativos</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
