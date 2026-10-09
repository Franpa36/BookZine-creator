import React, { useState } from 'react';
import { BookOpen, ExternalLink, HelpCircle, Layers, Grid2X2, LayoutGrid, Download, FileCode, Play, Sparkles } from 'lucide-react';
import { ImpositionMode } from '../types';
import { StandaloneHtmlModal } from './StandaloneHtmlModal';

interface HeaderProps {
  onOpenFoldingGuide: () => void;
  totalPages: number;
  totalSheets: number;
  impositionMode: ImpositionMode;
  onChangeImpositionMode: (mode: ImpositionMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFoldingGuide,
  totalPages,
  totalSheets,
  impositionMode,
  onChangeImpositionMode,
}) => {
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const isZine8 = impositionMode === 'zine8';
  const canvaTemplateUrl = isZine8
    ? 'https://canva.link/1ix23ya28nko1k8'
    : 'https://canva.link/d2a98lgqsfyogye';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Bookzine & Mini-Zine Creator
              </h1>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isZine8
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isZine8 ? 'Modo 8 Págs (4x2)' : 'Modo 16 Págs (4x4)'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isZine8
                ? 'Imposición de 8 pliegues para plantilla Canva con corte central'
                : 'Imposición de 16 pliegues para plegado Snake en plantilla Canva'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => onChangeImpositionMode('bookzine16')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              !isZine8
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
            <span>16 Pliegues (4x4)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeImpositionMode('zine8')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              isZine8
                ? 'bg-white text-purple-900 shadow-xs border border-purple-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5 text-purple-600" />
            <span>8 Pliegues (4x2 Canva)</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded-full">
              Nuevo
            </span>
          </button>
        </div>

        {/* Action Buttons & Canva Template Link */}
        <div className="flex items-center flex-wrap gap-2.5">
          {totalPages > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>{totalPages} págs extraídas</span>
              <span className="text-emerald-400">•</span>
              <span>{totalSheets} {totalSheets === 1 ? 'pliego' : 'pliegos'}</span>
            </div>
          )}

          <a
            href={canvaTemplateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-teal-50 to-indigo-50 hover:from-teal-100 hover:to-indigo-100 text-slate-800 border border-indigo-200/60 shadow-xs transition-colors"
            title={`Abrir plantilla de ${isZine8 ? '8' : '16'} páginas en Canva`}
          >
            <span className="font-semibold text-indigo-700">Canva</span>
            <span>Plantilla {isZine8 ? '8p' : '16p'}</span>
            <ExternalLink className="w-3 h-3 text-indigo-600" />
          </a>

          <button
            type="button"
            onClick={() => setIsHtmlModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 shadow-2xs transition-colors cursor-pointer"
            title="Ver información y opciones del archivo HTML autónomo portátil"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Versión HTML</span>
            <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-1.5 py-0.2 rounded-full hidden sm:inline">
              Offline
            </span>
          </button>

          <a
            href="/fanzine_creator.html"
            download="fanzine_creator.html"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
            title="Descargar la aplicación completa en un único archivo HTML independiente para usar sin conexión"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar App (.html)</span>
          </a>

          <button
            type="button"
            onClick={onOpenFoldingGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-300/80 shadow-2xs transition-all cursor-pointer"
            title="Ver animación interactiva paso a paso de cómo plegar el bookzine seleccionado"
          >
            <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>¿Cómo se pliega?</span>
            <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-1.5 py-0.2 rounded-full hidden sm:inline">
              Animación
            </span>
          </button>
        </div>
      </div>

      <StandaloneHtmlModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
      />
    </header>
  );
};
