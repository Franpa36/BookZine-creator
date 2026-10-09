import React, { useState } from 'react';
import {
  FileCode,
  Download,
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Scissors,
  Play,
  Copy,
  Check,
} from 'lucide-react';

interface StandaloneHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneHtmlModal: React.FC<StandaloneHtmlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/fanzine_creator.html');
      if (!res.ok) throw new Error('Error al obtener fanzine_creator.html');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fanzine_creator.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando archivo:', err);
      // Fallback direct link
      window.open('/fanzine_creator.html', '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    window.open('/fanzine_creator.html', '_blank');
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.origin + '/fanzine_creator.html';
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Aplicación Autónoma en HTML</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  100% Offline
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Todo el creador de fanzines concentrado en un único archivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm text-slate-700">
          <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 space-y-1">
              <p className="font-bold">¿Qué es este archivo HTML?</p>
              <p className="text-indigo-800 leading-relaxed">
                Es una versión portátil independiente de la aplicación (<strong>fanzine_creator.html</strong>).
                No necesita servidores, ni Node.js, ni instalar programas. Puedes guardarla en tu disco duro o memoria USB y abrirla con cualquier navegador (Chrome, Edge, Firefox, Safari).
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Funcionalidades incluidas en el archivo HTML:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>2 Modos:</strong> Mini-Zine 8p (Canva) y Bookzine 16p (Snake Fold)
                </span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Páginas en blanco:</strong> Añade páginas en blanco en cualquier lugar y en el pliego
                </span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Animaciones de plegado:</strong> Guía 3D interactiva paso a paso
                </span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Exportación a PDF:</strong> Generación en alta resolución con marcas de corte
                </span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Demos con 1 clic:</strong> Genera fanzines de muestra si no tienes un PDF a mano
                </span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Reorganización:</strong> Arrastra o mueve páginas y rota cuadrantes a 90°/180°
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
            <span className="text-base">💡</span>
            <span>
              <strong>Consejo de uso:</strong> Solo haz doble clic en <code>fanzine_creator.html</code> tras descargarlo para usarlo siempre que quieras, incluso sin conexión a internet.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Abrir la versión HTML en una pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Abrir en pestaña nueva</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Copiar enlace directo al archivo HTML"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? '¡Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Descargando...' : 'Descargar fanzine_creator.html'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
