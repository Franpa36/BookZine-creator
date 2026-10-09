import React, { useState, useEffect } from 'react';
import { Download, Sparkles, FileCheck, Loader2, AlertCircle, RotateCw } from 'lucide-react';
import { generateBookzinePdf, ExtractedPage } from '../lib/pdfService';
import { SheetConfig, SlotMapping, SheetAdjustmentsMap, SheetRotationAdjustment, ImpositionMode } from '../types';

interface ExportPanelProps {
  sourceFile: File | null;
  extractedPages: ExtractedPage[];
  templateConfig: SheetConfig;
  gridSlots: SlotMapping[];
  sheetAdjustments?: SheetAdjustmentsMap;
  impositionMode?: ImpositionMode;
}

const getPdfDefaultName = (file: File | null) => {
  if (!file?.name) return 'Bookzine';
  const baseName = file.name.replace(/\.pdf$/i, '');
  return `${baseName}_Bookzine`;
};

export const ExportPanel: React.FC<ExportPanelProps> = ({
  sourceFile,
  extractedPages,
  templateConfig,
  gridSlots,
  sheetAdjustments = {},
  impositionMode = 'bookzine16',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState(() => getPdfDefaultName(sourceFile));

  // Update default file name when a new source PDF is uploaded
  useEffect(() => {
    if (sourceFile?.name) {
      setCustomFileName(getPdfDefaultName(sourceFile));
    }
  }, [sourceFile]);

  const totalPages = extractedPages.length;
  const blankPagesCount = extractedPages.filter((p) => p.isBlank).length;
  const pagesPerSheet = gridSlots.length > 0 ? gridSlots.length : 16;
  const totalSheets = Math.max(1, Math.ceil(totalPages / pagesPerSheet));

  // Count how many sheets have custom page slot rotations
  const sheetsWithAdjustments = (Object.values(sheetAdjustments) as SheetRotationAdjustment[]).filter((adj) => {
    if (!adj) return false;
    return adj.slotOverrides && Object.keys(adj.slotOverrides).length > 0;
  });

  const handleExport = async () => {
    if (!sourceFile || extractedPages.length === 0) {
      setErrorMessage('Por favor, primero sube un archivo PDF con páginas para imponer.');
      return;
    }

    try {
      setIsExporting(true);
      setErrorMessage(null);
      setDownloadSuccess(false);

      const sourceBuffer = await sourceFile.arrayBuffer();
      const sourceBytes = new Uint8Array(sourceBuffer);

      const generatedPdfBytes = await generateBookzinePdf(
        sourceBytes,
        extractedPages,
        templateConfig,
        gridSlots,
        (currentSheet, totalSheets) => {
          setExportProgress({ current: currentSheet, total: totalSheets });
        },
        sheetAdjustments
      );

      // Create download blob
      const blob = new Blob([generatedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fallbackName = getPdfDefaultName(sourceFile);
      const safeName = customFileName.trim() || fallbackName;
      link.download = `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err: any) {
      console.error('Error durante la exportación del PDF:', err);
      setErrorMessage(
        err?.message || 'Ocurrió un error al generar el archivo PDF de imposición.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl shadow-lg border border-slate-700/60 p-6 overflow-hidden relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Information Summary */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              {impositionMode === 'zine8'
                ? 'Exportar Mini-Zine (8 Págs) en PDF'
                : 'Exportar Bookzine (16 Págs) en PDF'}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {totalPages > 0 ? (
              <>
                Se generarán <strong>{totalSheets} pliego(s)</strong> de {templateConfig.sheetSize} (
                {templateConfig.orientation === 'landscape' ? 'Horizontal' : 'Vertical'}) imponiendo
                las <strong>{totalPages} páginas</strong> del PDF original en la cuadrícula de{' '}
                <strong>{pagesPerSheet} páginas</strong> ({impositionMode === 'zine8' ? '4x2 con corte central' : '4x4 snake fold'}) con las rotaciones de página configuradas (0° a 270°).
              </>
            ) : (
              'Carga un archivo PDF para comenzar la imposición y descarga del pliego.'
            )}
          </p>

          {/* Quick specs pill row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="bg-indigo-950/80 border border-indigo-400/50 text-indigo-300 px-2 py-0.5 rounded font-medium">
              Modo: <strong>{impositionMode === 'zine8' ? '8 Páginas (Canva)' : '16 Páginas (Bookzine)'}</strong>
            </span>
            <span className="bg-slate-800/90 border border-slate-700 text-slate-200 px-2 py-0.5 rounded">
              Orientación: <strong>{templateConfig.orientation === 'landscape' ? 'Horizontal' : 'Vertical'}</strong>
            </span>
            <span className="bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded">
              {impositionMode === 'zine8' ? 'Fila 1: 180° / Fila 2: 0°' : 'Filas 1 y 3: 180°'}
            </span>
            <span className="bg-slate-800/90 border border-slate-700 text-slate-200 px-2 py-0.5 rounded">
              Tamaño: <strong>{templateConfig.sheetSize}</strong>
            </span>
            {blankPagesCount > 0 && (
              <span className="bg-indigo-950/80 border border-indigo-400/50 text-indigo-300 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                <span>{blankPagesCount} pág(s) en blanco</span>
              </span>
            )}
            {sheetsWithAdjustments.length > 0 && (
              <span className="bg-amber-950/80 border border-amber-400/50 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                <RotateCw className="w-3 h-3 text-amber-400" />
                <span>
                  {sheetsWithAdjustments.length} pliego(s) con rotación de páginas individual
                </span>
              </span>
            )}
          </div>

          {/* Filename customization */}
          {totalPages > 0 && (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Nombre del archivo:</span>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-800/90 border border-slate-600 rounded text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                placeholder={getPdfDefaultName(sourceFile)}
              />
              <span className="text-xs text-slate-400">.pdf</span>
            </div>
          )}
        </div>

        {/* Action Button & Feedback */}
        <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            disabled={!sourceFile || isExporting || totalPages === 0}
            onClick={handleExport}
            className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              !sourceFile || totalPages === 0
                ? 'bg-slate-700/60 text-slate-400 border border-slate-600/40 cursor-not-allowed'
                : isExporting
                ? 'bg-amber-600 text-slate-950 cursor-wait'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:shadow-amber-400/20 active:scale-[0.98]'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  Generando pliegos {exportProgress.current} de {exportProgress.total}...
                </span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Descargar PDF Imposicionado ({totalSheets} Pliego{totalSheets > 1 ? 's' : ''})</span>
              </>
            )}
          </button>

          {/* Feedback messages */}
          {downloadSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <FileCheck className="w-4 h-4" />
              <span>¡PDF generado y descargado correctamente!</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-1 flex items-center justify-end">
            <a
              href="/fanzine_creator.html"
              download="fanzine_creator.html"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors"
              title="Descargar copia del archivo HTML autónomo para abrir en cualquier ordenador sin internet"
            >
              <span>💾 Descargar archivo HTML portátil de la app</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
