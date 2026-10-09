export type ImpositionMode = 'bookzine16' | 'zine8';

export interface SlotMapping {
  slotIndex: number;
  row: number;
  col: number;
  relativePage: number; // 1 to 16 (or 1 to 8)
  rotation: number; // 0, 90, 180, 270
}

export const DEFAULT_BOOKZINE_GRID: SlotMapping[] = [
  // 1a fila: 3, 2, 1, 16 (Giradas 180° por defecto para plegado Snake)
  { slotIndex: 0, row: 0, col: 0, relativePage: 3, rotation: 180 },
  { slotIndex: 1, row: 0, col: 1, relativePage: 2, rotation: 180 },
  { slotIndex: 2, row: 0, col: 2, relativePage: 1, rotation: 180 },
  { slotIndex: 3, row: 0, col: 3, relativePage: 16, rotation: 180 },

  // 2a fila: 4, 5, 6, 7 (0°)
  { slotIndex: 4, row: 1, col: 0, relativePage: 4, rotation: 0 },
  { slotIndex: 5, row: 1, col: 1, relativePage: 5, rotation: 0 },
  { slotIndex: 6, row: 1, col: 2, relativePage: 6, rotation: 0 },
  { slotIndex: 7, row: 1, col: 3, relativePage: 7, rotation: 0 },

  // 3a fila: 11, 10, 9, 8 (Giradas 180° por defecto para plegado Snake)
  { slotIndex: 8, row: 2, col: 0, relativePage: 11, rotation: 180 },
  { slotIndex: 9, row: 2, col: 1, relativePage: 10, rotation: 180 },
  { slotIndex: 10, row: 2, col: 2, relativePage: 9, rotation: 180 },
  { slotIndex: 11, row: 2, col: 3, relativePage: 8, rotation: 180 },

  // 4a fila: 12, 13, 14, 15 (0°)
  { slotIndex: 12, row: 3, col: 0, relativePage: 12, rotation: 0 },
  { slotIndex: 13, row: 3, col: 1, relativePage: 13, rotation: 0 },
  { slotIndex: 14, row: 3, col: 2, relativePage: 14, rotation: 0 },
  { slotIndex: 15, row: 3, col: 3, relativePage: 15, rotation: 0 },
];

// Plantilla Fanzine 8 páginas (4 columnas x 2 filas)
// Fila 1 (Superior, 180° invertida para plegado): Pág 1 (Portada), Pág 8 (Contraportada), Pág 7, Pág 6
// Fila 2 (Inferior, 0°): Pág 2, Pág 3, Pág 4, Pág 5
export const DEFAULT_ZINE8_GRID: SlotMapping[] = [
  // 1a fila (Superior, 180°): 1, 8, 7, 6
  { slotIndex: 0, row: 0, col: 0, relativePage: 1, rotation: 180 },
  { slotIndex: 1, row: 0, col: 1, relativePage: 8, rotation: 180 },
  { slotIndex: 2, row: 0, col: 2, relativePage: 7, rotation: 180 },
  { slotIndex: 3, row: 0, col: 3, relativePage: 6, rotation: 180 },

  // 2a fila (Inferior, 0°): 2, 3, 4, 5
  { slotIndex: 4, row: 1, col: 0, relativePage: 2, rotation: 0 },
  { slotIndex: 5, row: 1, col: 1, relativePage: 3, rotation: 0 },
  { slotIndex: 6, row: 1, col: 2, relativePage: 4, rotation: 0 },
  { slotIndex: 7, row: 1, col: 3, relativePage: 5, rotation: 0 },
];

export interface PageThumbnail {
  pageNumber: number; // 1-indexed
  dataUrl: string;
  width: number;
  height: number;
}

export type SplitDirection = 'vertical' | 'horizontal';

export interface PageSplitConfig {
  splitPageNumbers: number[]; // 1-indexed original page numbers to split
  direction: SplitDirection; // 'vertical' (Left + Right, spreads) or 'horizontal' (Top + Bottom)
}

export interface ExtractedPage {
  id?: string;
  pageNumber: number; // 1-indexed sequential in the imposition sequence
  originalPageNumber: number; // 1-indexed page in original PDF (0 if blank page)
  splitPart?: 'left' | 'right' | 'top' | 'bottom'; // undefined if not split
  dataUrl: string;
  width: number;
  height: number;
  isLandscape?: boolean;
  isBlank?: boolean; // true if this is an inserted blank page
}

export interface RawPdfPage {
  originalPageNumber: number;
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
  isLandscape: boolean;
}

export interface SheetConfig {
  sheetSize: 'A4' | 'A3' | 'Letter' | 'Tabloid' | 'Custom';
  orientation: 'landscape' | 'portrait';
  marginPercent: number; // 0 to 10%
  gapPercent: number; // 0 to 5%
  fitMode: 'contain' | 'cover';
  showCutGuides: boolean;
  showFoldGuides: boolean;
  showPageLabels: boolean;
  showSheetBorder?: boolean; // Borde punteado alrededor de la hoja
  sheetBorderStyle?: 'dotted' | 'dashed'; // Estilo del borde
  sheetBorderPosition?: 'margin' | 'edge'; // Posición del borde: en el margen o en el borde exterior
  templateSource: 'default' | 'canva_upload';
}

export interface SheetRotationAdjustment {
  sheetAngle: number; // Micro/manual rotation of entire sheet in degrees (-15° to +15°, or 90/180)
  slotOverrides?: Record<number, number>; // slotIndex -> custom rotation angle in degrees
}

export type SheetAdjustmentsMap = Record<number, SheetRotationAdjustment>;

