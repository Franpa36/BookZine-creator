import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Scissors,
  FoldHorizontal,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ImpositionMode } from '../types';

interface FoldingAnimationViewerProps {
  mode: ImpositionMode;
}

interface StepData {
  number: number;
  title: string;
  shortDesc: string;
  tip: string;
  icon: React.ReactNode;
}

const ZINE8_STEPS: StepData[] = [
  {
    number: 1,
    title: 'Hoja extendida y marcaje de pliegues',
    shortDesc: 'Imprime en A4/A3 apaisado y marca los 8 cuadrantes con pliegues horizontales y verticales.',
    tip: 'Marca bien las líneas pasando la uña o una plegadera para que el papel doble limpiamente.',
    icon: <Layers className="w-4 h-4 text-purple-600" />,
  },
  {
    number: 2,
    title: 'Doblar por la mitad a lo ancho',
    shortDesc: 'Dobla la hoja por la mitad a lo ancho para juntar las dos mitades y exponer el pliegue central.',
    tip: 'Los 4 paneles frontales coincidirán exactamente con los 4 posteriores.',
    icon: <FoldHorizontal className="w-4 h-4 text-indigo-600" />,
  },
  {
    number: 3,
    title: 'Corte central en ranura (Slit Cut)',
    shortDesc: 'Con tijeras, corta únicamente por el pliegue horizontal a lo largo de las dos columnas centrales.',
    tip: '¡CUIDADO! No cortes hasta los bordes exteriores, solo entre las columnas 2 y 3.',
    icon: <Scissors className="w-4 h-4 text-rose-600" />,
  },
  {
    number: 4,
    title: 'Abrir y colapsar en cruz / diamante (+)',
    shortDesc: 'Abre la hoja por la mitad a lo largo y empuja los dos extremos hacia el centro para abrir la ranura en cruz.',
    tip: 'Al empujar los lados, la ranura central se abre automáticamente formando 4 alas en cruz.',
    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
  },
  {
    number: 5,
    title: 'Plegar las 8 páginas en librito',
    shortDesc: 'Colapsa las 4 alas hacia un lado. La Pág 1 queda en la portada y la Pág 8 en la contratapa.',
    tip: 'Tu fanzine de 8 páginas queda encuadernado sin grapas ni adhesivos.',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
];

const BOOKZINE16_STEPS: StepData[] = [
  {
    number: 1,
    title: 'Hoja extendida 4x4 (16 paneles)',
    shortDesc: 'Imprime el pliego de 16 páginas en A3 apaisado. Observa la numeración en recorrido serpiente.',
    tip: 'Las páginas 1 (portada) y 16 (contraportada) están situadas juntas en la fila superior.',
    icon: <Layers className="w-4 h-4 text-amber-600" />,
  },
  {
    number: 2,
    title: 'Realizar los 3 cortes en serpiente (Zigzag)',
    shortDesc: 'Corta las 3 líneas divisorias de forma alterna sin llegar al borde final para mantener la unión.',
    tip: 'Corte 1 desde la izquierda, Corte 2 desde la derecha, Corte 3 desde la izquierda.',
    icon: <Scissors className="w-4 h-4 text-rose-600" />,
  },
  {
    number: 3,
    title: 'Desplegar en tira continua (1 al 16)',
    shortDesc: 'La hoja se convierte en una sola tira serpentina continua de 16 páginas enlazadas.',
    tip: 'Comprueba que el orden numérico fluye continuo desde la página 1 hasta la 16.',
    icon: <ArrowRight className="w-4 h-4 text-indigo-600" />,
  },
  {
    number: 4,
    title: 'Plegado en acordeón (Leporello / Zigzag)',
    shortDesc: 'Dobla alternando cada pliegue en valle y montaña (adelante y atrás) a lo largo de toda la tira.',
    tip: 'Alinea los bordes cuidadosamente en cada doblez para que el lomo quede recto.',
    icon: <FoldHorizontal className="w-4 h-4 text-purple-600" />,
  },
  {
    number: 5,
    title: 'Bookzine de 16 páginas finalizado',
    shortDesc: 'El lomo queda compacto: Pág 1 al frente como portada, Pág 16 en el reverso y páginas 2-15 legibles por orden.',
    tip: '¡Listo! Si lo deseas puedes asegurar el lomo interior con una tira de cinta washi o dejarlo libre.',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
];

export const FoldingAnimationViewer: React.FC<FoldingAnimationViewerProps> = ({ mode }) => {
  const isZine8 = mode === 'zine8';
  const steps = isZine8 ? ZINE8_STEPS : BOOKZINE16_STEPS;
  const totalSteps = steps.length;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [stepProgress, setStepProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Reset to first step when mode changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setStepProgress(0);
    setIsPlaying(false);
  }, [mode]);

  // Handle animation timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 50;
    const stepDurationMs = 3500 / speed;
    const progressIncrement = (intervalMs / stepDurationMs) * 100;

    timerRef.current = window.setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          setCurrentStepIndex((curr) => {
            if (curr >= totalSteps - 1) {
              // End reached: loop or stop
              return 0;
            }
            return curr + 1;
          });
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  const handlePrev = () => {
    setIsPlaying(false);
    setStepProgress(0);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setStepProgress(0);
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleSelectStep = (idx: number) => {
    setIsPlaying(false);
    setStepProgress(0);
    setCurrentStepIndex(idx);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepProgress(0);
    setCurrentStepIndex(0);
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-800 space-y-4">
      {/* Top Bar with Step Indicators */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wide uppercase text-slate-300">
            {isZine8 ? 'Animación Mini-Zine 8 Páginas' : 'Animación Bookzine 16 Páginas'}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            Paso {currentStepIndex + 1} de {totalSteps}
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] hidden sm:inline">Velocidad:</span>
          {[0.5, 1, 1.5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                speed === s
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Step Pills Navigation */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {steps.map((st, idx) => {
          const isActive = idx === currentStepIndex;
          const isDone = idx < currentStepIndex;
          return (
            <button
              key={st.number}
              type="button"
              onClick={() => handleSelectStep(idx)}
              className={`group flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer border ${
                isActive
                  ? isZine8
                    ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                    : 'bg-amber-950/80 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                  : isDone
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-850 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${
                    isActive
                      ? isZine8
                        ? 'bg-purple-500 text-white'
                        : 'bg-amber-400 text-slate-950 font-extrabold'
                      : isDone
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {st.number}
                </span>
              </div>
              <span className="text-[10px] font-medium truncate max-w-full leading-tight hidden sm:block">
                {st.title.split(' ')[0]} {st.title.split(' ')[1] || ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Visual Stage (Canvas / SVG Animated Stage) */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[340px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden flex items-center justify-center p-3 sm:p-6 shadow-inner select-none">
        {/* Animated Background Mesh & Lights */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />

        {/* Step-specific Animated Visuals */}
        {isZine8 ? (
          <Zine8AnimationStep stepIndex={currentStepIndex} progress={stepProgress} />
        ) : (
          <Bookzine16AnimationStep stepIndex={currentStepIndex} progress={stepProgress} />
        )}

        {/* Floating Step Badge in Canvas */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-200 shadow-md">
          {currentStep.icon}
          <span className="font-bold text-[11px]">
            Paso {currentStepIndex + 1}: {currentStep.title}
          </span>
        </div>

        {/* Progress bar along bottom of canvas */}
        {isPlaying && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
            <div
              className={`h-full transition-all duration-75 ${
                isZine8 ? 'bg-purple-500' : 'bg-amber-400'
              }`}
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Step Description & Guide Tip Card */}
      <div className="bg-slate-850/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                  isZine8 ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {currentStep.number}
              </span>
              <span>{currentStep.title}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{currentStep.shortDesc}</p>
          </div>
        </div>

        {/* Helpful Tip */}
        <div className="flex items-start gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 bg-amber-950/20 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-200">Consejo de taller:</strong> {currentStep.tip}
          </span>
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60 shadow-xs"
            title="Reiniciar animación al Paso 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                : isZine8
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Reproducir animación</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentStepIndex === 0}
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-medium text-slate-200 transition-colors cursor-pointer border border-slate-700/60 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            type="button"
            disabled={currentStepIndex === totalSteps - 1}
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl disabled:opacity-40 disabled:pointer-events-none text-xs font-bold transition-colors cursor-pointer shadow-xs ${
              isZine8
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   VISUAL STEP COMPONENT: MINI-ZINE 8 PÁGINAS (Canva 4x2)
   ------------------------------------------------------------- */
const Zine8AnimationStep: React.FC<{ stepIndex: number; progress: number }> = ({ stepIndex }) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* STEP 1: Flat sheet 4x2 with crease lines */}
      {stepIndex === 0 && (
        <div className="w-full max-w-md bg-white rounded-lg p-2.5 shadow-2xl border-2 border-slate-300 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-between">
            <span>Hoja A3/A4 Horizontal (Plantilla 4x2)</span>
            <span className="text-purple-600 font-semibold">8 Páginas</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
            {/* Top row - rotated 180 */}
            <div className="p-2 rounded bg-indigo-100 border border-indigo-400 text-indigo-900 shadow-2xs relative">
              <span className="inline-block transform rotate-180">Pág 1 (Portada)</span>
              <span className="absolute top-0.5 right-1 text-[8px] text-indigo-600 font-extrabold">🔄</span>
            </div>
            <div className="p-2 rounded bg-violet-100 border border-violet-400 text-violet-900 shadow-2xs relative">
              <span className="inline-block transform rotate-180">Pág 8 (Atrás)</span>
              <span className="absolute top-0.5 right-1 text-[8px] text-violet-600 font-extrabold">🔄</span>
            </div>
            <div className="p-2 rounded bg-amber-50 border border-amber-300 text-amber-900 relative">
              <span className="inline-block transform rotate-180">Pág 7</span>
              <span className="absolute top-0.5 right-1 text-[8px] text-amber-600 font-extrabold">🔄</span>
            </div>
            <div className="p-2 rounded bg-amber-50 border border-amber-300 text-amber-900 relative">
              <span className="inline-block transform rotate-180">Pág 6</span>
              <span className="absolute top-0.5 right-1 text-[8px] text-amber-600 font-extrabold">🔄</span>
            </div>

            {/* Central folding dashed line */}
            <div className="col-span-4 py-0.5 my-0.5 border-y-2 border-dashed border-indigo-400/80 bg-indigo-50/50 text-indigo-700 text-[9px] font-bold flex items-center justify-center gap-1.5">
              <span>— — — Línea de Pliegue Horizontal Central — — —</span>
            </div>

            {/* Bottom row - 0° */}
            <div className="p-2 rounded bg-slate-100 border border-slate-300 text-slate-800">Pág 2</div>
            <div className="p-2 rounded bg-slate-100 border border-slate-300 text-slate-800">Pág 3</div>
            <div className="p-2 rounded bg-slate-100 border border-slate-300 text-slate-800">Pág 4</div>
            <div className="p-2 rounded bg-slate-100 border border-slate-300 text-slate-800">Pág 5</div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 text-center font-medium">
            Dobla primero por la mitad a lo largo y luego en 4 partes a lo ancho para marcar los 8 cuadrantes.
          </div>
        </div>
      )}

      {/* STEP 2: Folded in half (hamburger/book fold) */}
      {stepIndex === 1 && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative bg-white rounded-lg p-3 shadow-2xl border-2 border-purple-300 w-full">
            {/* Visual fold line on edge */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-400 rounded-t-lg" />
            <div className="text-[10px] text-center font-bold text-purple-900 mb-2">
              Hoja doblada por la mitad a lo ancho (4 paneles visibles)
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-bold">
              <div className="p-3 rounded bg-indigo-100 border border-indigo-300 text-indigo-900">
                Pág 1 / 2
              </div>
              <div className="p-3 rounded bg-purple-100 border-2 border-dashed border-rose-400 text-purple-900 bg-rose-50/50">
                Pág 8 / 3
              </div>
              <div className="p-3 rounded bg-purple-100 border-2 border-dashed border-rose-400 text-purple-900 bg-rose-50/50">
                Pág 7 / 4
              </div>
              <div className="p-3 rounded bg-amber-50 border border-amber-300 text-amber-900">
                Pág 6 / 5
              </div>
            </div>
            <div className="mt-2.5 p-2 bg-purple-50 rounded-lg border border-purple-200 text-[10px] text-purple-900 font-medium text-center flex items-center justify-center gap-1.5">
              <FoldHorizontal className="w-3.5 h-3.5 text-purple-600" />
              <span>El pliegue horizontal queda situado en el borde superior cerrado</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Central Slit Cut */}
      {stepIndex === 2 && (
        <div className="w-full max-w-md bg-white rounded-lg p-3 shadow-2xl border-2 border-rose-300 animate-in fade-in zoom-in-95 duration-300 relative">
          <div className="text-[10px] font-bold text-rose-700 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-rose-600" />
              <span>Corte central de ranura (Slit Cut)</span>
            </span>
            <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
              Solo paneles centrales
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-semibold relative">
            <div className="p-2.5 rounded bg-slate-100 text-slate-500 opacity-60">Columna 1 (No cortar)</div>
            
            {/* Cut zone */}
            <div className="col-span-2 p-2.5 rounded bg-rose-50/80 border-2 border-rose-400 text-rose-950 font-bold relative flex flex-col items-center justify-center">
              <div className="w-full border-t-2 border-dashed border-rose-600 my-1 animate-pulse" />
              <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-[11px]">
                <Scissors className="w-4 h-4 text-rose-600 animate-bounce" />
                <span>✂️ Corte central aquí</span>
              </div>
              <span className="text-[9px] text-rose-600 font-medium">Desde el pliegue hasta la primera unión</span>
            </div>

            <div className="p-2.5 rounded bg-slate-100 text-slate-500 opacity-60">Columna 4 (No cortar)</div>
          </div>

          <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>
              <strong>Atención:</strong> Las columnas 1 y 4 deben permanecer unidas. Solo se cortan las 2 columnas del centro.
            </span>
          </div>
        </div>
      )}

      {/* STEP 4: Pop Open Diamond / 3D Cross (+) */}
      {stepIndex === 3 && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-64 h-48 flex items-center justify-center">
            {/* 3D Cross SVG representation */}
            <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-2xl">
              {/* Outer Arrows pushing in */}
              <path d="M 20 80 L 45 80" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <polygon points="45,75 55,80 45,85" fill="#f59e0b" />

              <path d="M 180 80 L 155 80" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <polygon points="155,75 145,80 155,85" fill="#f59e0b" />

              {/* 4 Diamond Wings */}
              {/* Left wing */}
              <polygon points="55,80 90,60 90,100" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
              <text x="70" y="83" fontSize="8" fontWeight="bold" fill="#3730a3">Pág 1-2</text>

              {/* Right wing */}
              <polygon points="145,80 110,60 110,100" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
              <text x="120" y="83" fontSize="8" fontWeight="bold" fill="#5b21b6">Pág 5-6</text>

              {/* Top wing */}
              <polygon points="100,25 80,60 120,60" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
              <text x="94" y="50" fontSize="8" fontWeight="bold" fill="#92400e">Pág 8</text>

              {/* Bottom wing */}
              <polygon points="100,135 80,100 120,100" fill="#dcfce7" stroke="#10b981" strokeWidth="2" />
              <text x="94" y="115" fontSize="8" fontWeight="bold" fill="#065f46">Pág 3-4</text>

              {/* Center hole / diamond */}
              <polygon points="90,60 110,60 110,100 90,100" fill="#1e293b" opacity="0.85" />
              <text x="86" y="83" fontSize="7" fill="#f8fafc" fontWeight="bold">HUECO</text>
            </svg>
          </div>
          <span className="text-[11px] font-bold text-amber-300 text-center mt-1">
            Empuja los dos extremos hacia el centro → la ranura se abrirá en cruz (+)
          </span>
        </div>
      )}

      {/* STEP 5: Finished 8-page booklet */}
      {stepIndex === 4 && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-48 h-56 bg-white rounded-r-xl rounded-l-xs shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-slate-300 transform -rotate-3 hover:rotate-0 transition-transform duration-300 p-3 flex flex-col justify-between">
            {/* Spine styling on left */}
            <div className="absolute left-0 inset-y-0 w-2.5 bg-gradient-to-r from-purple-800 to-indigo-600 rounded-l-xs" />

            <div className="pl-3">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-600 block">
                FANZINE FINALIZADO
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                Pág 1: Portada
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                8 Páginas encuadernadas correlativas (1 al 8) sin grapas.
              </p>
            </div>

            <div className="pl-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-bold">
              <span>Lomo izquierdo</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Listo
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ¡Tu Mini-Zine de 8 páginas está completamente plegado!
          </span>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
   VISUAL STEP COMPONENT: BOOKZINE 16 PÁGINAS (Snake Fold 4x4)
   ------------------------------------------------------------- */
const Bookzine16AnimationStep: React.FC<{ stepIndex: number; progress: number }> = ({ stepIndex }) => {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* STEP 1: Flat sheet 4x4 with Snake Imposition scheme */}
      {stepIndex === 0 && (
        <div className="w-full max-w-md bg-white rounded-lg p-2.5 shadow-2xl border-2 border-amber-300 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-between">
            <span>Pliego A3 Horizontal (Plantilla 4x4)</span>
            <span className="text-amber-600 font-semibold">16 Páginas (Snake Fold)</span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
            {/* Row 1 */}
            <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900">Pág 3</div>
            <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900">Pág 2</div>
            <div className="p-1.5 rounded bg-indigo-100 border-2 border-indigo-500 text-indigo-900 font-black shadow-xs">
              Pág 1 (Portada)
            </div>
            <div className="p-1.5 rounded bg-violet-100 border-2 border-violet-500 text-violet-900 font-black shadow-xs">
              Pág 16 (Atrás)
            </div>

            {/* Row 2 */}
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 4</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 5</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 6</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 7</div>

            {/* Row 3 */}
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 11</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 10</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 9</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 8</div>

            {/* Row 4 */}
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 12</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 13</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 14</div>
            <div className="p-1.5 rounded bg-slate-100 border border-slate-200">Pág 15</div>
          </div>
          <div className="mt-2 text-[9px] text-slate-500 text-center">
            Pág 1 y Pág 16 coinciden en la esquina superior para formar portada y contracubierta.
          </div>
        </div>
      )}

      {/* STEP 2: 3 Alternating Snake Cuts */}
      {stepIndex === 1 && (
        <div className="w-full max-w-md bg-white rounded-lg p-2.5 shadow-2xl border-2 border-rose-300 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-[10px] font-bold text-rose-700 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-rose-600" />
              <span>3 Cortes alternos en serpiente (Zigzag)</span>
            </span>
            <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
              ¡No cortar hasta el borde!
            </span>
          </div>

          <div className="space-y-1 text-[10px] font-bold">
            {/* Row 1 */}
            <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 p-1 rounded">
              <span>Pág 3</span>
              <span>Pág 2</span>
              <span className="text-indigo-700">Pág 1</span>
              <span className="text-violet-700">Pág 16</span>
            </div>

            {/* Cut 1 (Left to Right, stops before right edge) */}
            <div className="flex items-center gap-1 px-1 py-0.5 bg-rose-50 border-y border-dashed border-rose-500 text-rose-700 text-[9px]">
              <Scissors className="w-3 h-3 text-rose-600 animate-bounce" />
              <span className="font-extrabold">Corte 1:</span>
              <span className="flex-1 border-b border-rose-400 border-dashed" />
              <span className="text-slate-500 bg-slate-200 px-1 rounded text-[8px]">UNIÓN DERECHA</span>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 p-1 rounded">
              <span>Pág 4</span>
              <span>Pág 5</span>
              <span>Pág 6</span>
              <span>Pág 7</span>
            </div>

            {/* Cut 2 (Right to Left, stops before left edge) */}
            <div className="flex items-center gap-1 px-1 py-0.5 bg-rose-50 border-y border-dashed border-rose-500 text-rose-700 text-[9px]">
              <span className="text-slate-500 bg-slate-200 px-1 rounded text-[8px]">UNIÓN IZQUIERDA</span>
              <span className="flex-1 border-b border-rose-400 border-dashed" />
              <Scissors className="w-3 h-3 text-rose-600 animate-bounce" />
              <span className="font-extrabold">Corte 2</span>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 p-1 rounded">
              <span>Pág 11</span>
              <span>Pág 10</span>
              <span>Pág 9</span>
              <span>Pág 8</span>
            </div>

            {/* Cut 3 (Left to Right, stops before right edge) */}
            <div className="flex items-center gap-1 px-1 py-0.5 bg-rose-50 border-y border-dashed border-rose-500 text-rose-700 text-[9px]">
              <Scissors className="w-3 h-3 text-rose-600 animate-bounce" />
              <span className="font-extrabold">Corte 3:</span>
              <span className="flex-1 border-b border-rose-400 border-dashed" />
              <span className="text-slate-500 bg-slate-200 px-1 rounded text-[8px]">UNIÓN DERECHA</span>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 p-1 rounded">
              <span>Pág 12</span>
              <span>Pág 13</span>
              <span>Pág 14</span>
              <span>Pág 15</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Unfolded Continuous Snake Ribbon */}
      {stepIndex === 2 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-xl p-3 shadow-2xl border-2 border-indigo-300 w-full">
            <div className="text-[11px] font-bold text-indigo-900 mb-2 flex items-center justify-between">
              <span>Tira serpentina desplegada</span>
              <span className="text-xs text-indigo-600 font-extrabold">1 → 16 correlativo</span>
            </div>

            {/* Snake path visualization */}
            <div className="relative py-2 px-1 bg-indigo-50/50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-800">
                <span className="px-1.5 py-0.5 bg-indigo-200 rounded font-black text-indigo-950">1 (Portada)</span>
                <span>→ 2 → 3 → 4 → 5 → 6 → 7 →</span>
              </div>
              <div className="my-1.5 text-center text-xs text-amber-600 font-bold">
                ↓ (unión continua sin cortes) ↓
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-violet-800">
                <span>→ 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 →</span>
                <span className="px-1.5 py-0.5 bg-violet-200 rounded font-black text-violet-950">16 (Atrás)</span>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-slate-600 text-center font-medium">
              Los 3 cortes convierten la hoja en una sola tira larga unida en orden natural de lectura.
            </p>
          </div>
        </div>
      )}

      {/* STEP 4: Accordion Folding */}
      {stepIndex === 3 && (
        <div className="w-full max-w-md flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-72 h-36 flex items-center justify-center">
            {/* 3D Accordion Zigzag SVG */}
            <svg viewBox="0 0 280 120" className="w-full h-full drop-shadow-xl">
              {/* Accordion Z-folds */}
              <polyline
                points="20,80 45,30 70,80 95,30 120,80 145,30 170,80 195,30 220,80 245,30 260,60"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Highlight cover */}
              <circle cx="20" cy="80" r="7" fill="#4f46e5" />
              <text x="14" y="102" fontSize="9" fontWeight="bold" fill="#ffffff">Pág 1</text>

              {/* Highlight back cover */}
              <circle cx="260" cy="60" r="7" fill="#7c3aed" />
              <text x="248" y="82" fontSize="9" fontWeight="bold" fill="#ffffff">Pág 16</text>

              {/* Valley & Mountain labels */}
              <text x="40" y="20" fontSize="8" fill="#fbbf24" fontWeight="bold">Montaña ▲</text>
              <text x="65" y="98" fontSize="8" fill="#fbbf24" fontWeight="bold">Valle ▼</text>
              <text x="140" y="20" fontSize="8" fill="#fbbf24" fontWeight="bold">Pliegue en Acordeón</text>
            </svg>
          </div>
          <span className="text-[11px] font-bold text-amber-300 text-center mt-1">
            Pliega alternativamente cada página hacia adelante y hacia atrás hasta comprimir el librito
          </span>
        </div>
      )}

      {/* STEP 5: Final Assembled 16-page Bookzine */}
      {stepIndex === 4 && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-52 h-60 bg-white rounded-r-xl rounded-l-xs shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-2 border-slate-300 transform -rotate-2 hover:rotate-0 transition-transform duration-300 p-4 flex flex-col justify-between">
            {/* Thick accordion spine on left */}
            <div className="absolute left-0 inset-y-0 w-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 rounded-l-xs shadow-inner flex flex-col justify-center items-center">
              <div className="w-0.5 h-16 bg-amber-900/30 rounded-full" />
            </div>

            <div className="pl-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 block">
                BOOKZINE 16 PÁGINAS
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Pág 1: Portada
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Lectura continua del 1 al 16. La Pág 16 protege la contraportada trasera.
              </p>
            </div>

            <div className="pl-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-700 font-bold">
              <span>16 páginas unidas</span>
              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completado
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ¡Tu Bookzine de 16 páginas está encuadernado y listo para leer!
          </span>
        </div>
      )}
    </div>
  );
};
