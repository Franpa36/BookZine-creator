import React, { useState } from 'react';
import {
  X,
  Scissors,
  FoldHorizontal,
  BookOpen,
  CheckCircle2,
  Grid2X2,
  LayoutGrid,
  ExternalLink,
  Play,
  FileText,
  Sparkles,
} from 'lucide-react';
import { ImpositionMode } from '../types';
import { FoldingAnimationViewer } from './FoldingAnimationViewer';

interface FoldingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  impositionMode?: ImpositionMode;
}

export const FoldingGuideModal: React.FC<FoldingGuideModalProps> = ({
  isOpen,
  onClose,
  impositionMode = 'bookzine16',
}) => {
  const [activeTab, setActiveTab] = useState<ImpositionMode>(impositionMode);
  const [viewMode, setViewMode] = useState<'animation' | 'guide'>('animation');

  // Sync tab with prop when opened
  React.useEffect(() => {
    setActiveTab(impositionMode);
  }, [impositionMode, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Guía de Plegado y Corte
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Animación interactiva
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Aprende paso a paso cómo cortar y doblar tu publicación impresa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Top Controls: Model selector & View mode selector */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 space-y-2.5 bg-slate-50/60 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Bookzine Model Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('bookzine16')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'bookzine16'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
                <span>Bookzine 16 Páginas (Snake Fold)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('zine8')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'zine8'
                    ? 'bg-white text-purple-900 shadow-xs border border-purple-300/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Mini-Zine 8 Páginas (Canva)</span>
              </button>
            </div>

            {/* View Mode Toggle: Animation vs Static Scheme */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('animation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'animation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Animación Paso a Paso</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('guide')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'guide'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3 h-3 text-slate-500" />
                <span>Esquema y Guía</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {viewMode === 'animation' ? (
            /* STEP-BY-STEP ANIMATION VIEW */
            <div className="space-y-3">
              <FoldingAnimationViewer mode={activeTab} />
            </div>
          ) : (
            /* STATIC GUIDE & GRID SCHEME VIEW */
            activeTab === 'zine8' ? (
              /* 8-page Canva Mini-Zine Guide */
              <div className="space-y-4 text-sm text-slate-700">
                {/* Banner prompting to check the animation */}
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>¿Prefieres ver el plegado animado en movimiento?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('animation')}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Ver Animación</span>
                  </button>
                </div>

                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Esquema Plantilla Canva (8 Páginas / 4x2)</span>
                    </h4>
                    <a
                      href="https://canva.link/1ix23ya28nko1k8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      <span>Abrir en Canva</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-medium">
                    {/* Row 1 - 180° */}
                    <div className="p-2 rounded bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold">
                      Pág 1 (Portada) 🔄
                    </div>
                    <div className="p-2 rounded bg-violet-100 border border-violet-300 text-violet-900 font-bold">
                      Pág 8 (Atrás) 🔄
                    </div>
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      Pág 7 🔄
                    </div>
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      Pág 6 🔄
                    </div>

                    {/* Central Cut Slit Indicator */}
                    <div className="col-span-4 py-1 my-0.5 border-y-2 border-dashed border-rose-400 bg-rose-50 text-rose-800 text-[11px] font-bold flex items-center justify-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-rose-600" />
                      <span>Corte central entre columnas centrales para el plegado</span>
                    </div>

                    {/* Row 2 - 0° */}
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 2</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 3</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 4</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 5</div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    La fila superior está girada 180° para que al doblar por la mitad a lo largo quede orientada en el sentido correcto de lectura.
                  </p>
                </div>

                {/* Steps for 8-page zine */}
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Paso 1: Imprimir y marcar pliegues</strong>
                      <span className="text-xs text-slate-600">
                        Imprime la hoja en A4 o A3 apaisado. Dobla la hoja por la mitad horizontalmente y desdobla. Luego dobla por la mitad verticalmente y otra vez por la mitad para marcar los 8 rectángulos.
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-rose-600" />
                        Paso 2: Corte central (Slit Cut)
                      </strong>
                      <span className="text-xs text-slate-600">
                        Dobla la hoja por la mitad a lo ancho. Con unas tijeras, corta a lo largo del pliegue horizontal únicamente en los dos paneles centrales (desde el pliegue central hasta la primera intersección).
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block flex items-center gap-1.5">
                        <FoldHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                        Paso 3: Abrir en forma de cruz (+) y colapsar
                      </strong>
                      <span className="text-xs text-slate-600">
                        Desdobla la hoja y dóblala por la mitad a lo largo. Empuja los dos extremos hacia el centro: la ranura central se abrirá formando una cruz o rombo.
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Paso 4: Doblar las 8 páginas en librito</strong>
                      <span className="text-xs text-slate-600">
                        Colapsa las hojas plegándolas hacia los lados: la Pág 1 quedará en la portada frontal y la Pág 8 en la contraportada trasera. ¡Tu fanzine de 8 páginas está listo sin grapas!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 16-page Snake Fold Guide */
              <div className="space-y-4 text-sm text-slate-700">
                {/* Banner prompting to check the animation */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>¿Quieres ver la animación paso a paso del plegado en serpiente?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('animation')}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Ver Animación</span>
                  </button>
                </div>

                {/* Grid explanation visual */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>Esquema de Imposición (Plantilla 4x4)</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-medium">
                    {/* Row 1 */}
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">Pág 3</div>
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">Pág 2</div>
                    <div className="p-2 rounded bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold">Pág 1 (Portada)</div>
                    <div className="p-2 rounded bg-violet-100 border border-violet-300 text-violet-900 font-bold">Pág 16 (Atrás)</div>

                    {/* Row 2 */}
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 4</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 5</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 6</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 7</div>

                    {/* Row 3 */}
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 11</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 10</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 9</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 8</div>

                    {/* Row 4 */}
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 12</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 13</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 14</div>
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">Pág 15</div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Observa el recorrido en serpiente: 16 y 1 están juntos arriba. Al plegar, la Pág 1 queda como portada frontal y la 16 como contratapa.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Paso 1: Imprimir la hoja</strong>
                      <span className="text-xs text-slate-600">
                        Imprime el PDF generado a tamaño completo (preferiblemente en tamaño A3 o A4 apaisado / horizontal).
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-amber-600" />
                        Paso 2: Cortes en zigzag (Serpiente)
                      </strong>
                      <span className="text-xs text-slate-600">
                        Corta las 3 líneas divisorias horizontales de forma alterna sin llegar al borde final, para formar una tira larga continua de 16 páginas unidas en acordeón.
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block flex items-center gap-1.5">
                        <FoldHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                        Paso 3: Plegado en acordeón
                      </strong>
                      <span className="text-xs text-slate-600">
                        Dobla cada página alternando hacia adelante y hacia atrás (pliegue en zigzag).
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Paso 4: ¡Tu Bookzine listo!</strong>
                      <span className="text-xs text-slate-600">
                        El resultado es un librito de 16 páginas que se lee correlativamente del 1 al 16, con su portada y contraportada en las caras exteriores.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {viewMode === 'animation'
              ? 'Controla los pasos con los botones Anterior / Siguiente o activa la reproducción continua'
              : 'Plantilla de imposición calculada automáticamente para impresión'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

