import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generates a colorful 16-page or 32-page sample PDF for testing the Bookzine maker.
 * If includeSpread is true, creates a 15-page document where page 2 is a double-width spread
 * (300x2 = 600px wide) ready to be split into 2 pages to make 16 pages!
 */
export async function createSamplePdf(
  pageCount: 16 | 32 = 16,
  includeSpread: boolean = false
): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors for pages to make visual verification easy and pleasant
  const colors = [
    { r: 0.94, g: 0.27, b: 0.24, name: 'Coral Red' },
    { r: 0.98, g: 0.55, b: 0.22, name: 'Amber Orange' },
    { r: 0.96, g: 0.74, b: 0.19, name: 'Sunflower Yellow' },
    { r: 0.2, g: 0.72, b: 0.5, name: 'Mint Emerald' },
    { r: 0.18, g: 0.65, b: 0.85, name: 'Sky Cyan' },
    { r: 0.35, g: 0.45, b: 0.92, name: 'Indigo Blue' },
    { r: 0.62, g: 0.38, b: 0.88, name: 'Purple Lavender' },
    { r: 0.88, g: 0.35, b: 0.65, name: 'Magenta Rose' },
    { r: 0.2, g: 0.6, b: 0.4, name: 'Forest Green' },
    { r: 0.8, g: 0.4, b: 0.2, name: 'Terracotta' },
    { r: 0.3, g: 0.5, b: 0.7, name: 'Slate Blue' },
    { r: 0.7, g: 0.3, b: 0.5, name: 'Berry Violet' },
    { r: 0.4, g: 0.6, b: 0.3, name: 'Olive Green' },
    { r: 0.85, g: 0.55, b: 0.45, name: 'Peach Warm' },
    { r: 0.25, g: 0.4, b: 0.55, name: 'Ocean Navy' },
    { r: 0.45, g: 0.35, b: 0.5, name: 'Plum Dusk' },
  ];

  // Standard A6 pocket page dimension (roughly 297.6 x 419.5 points)
  const defaultPageWidth = 300;
  const pageHeight = 420;

  const totalPagesToGenerate = includeSpread ? pageCount - 1 : pageCount;

  for (let i = 1; i <= totalPagesToGenerate; i++) {
    const isSpreadPage = includeSpread && i === 2;
    const pageWidth = isSpreadPage ? defaultPageWidth * 2 : defaultPageWidth;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const color = colors[(i - 1) % colors.length];

    if (isSpreadPage) {
      // Special 2-page wide spread (600 x 420 pt)
      // Background header bar
      page.drawRectangle({
        x: 0,
        y: pageHeight - 110,
        width: pageWidth,
        height: 110,
        color: rgb(0.15, 0.45, 0.75),
      });

      // Dividing center guide line
      page.drawRectangle({
        x: defaultPageWidth - 1,
        y: 20,
        width: 2,
        height: pageHeight - 40,
        color: rgb(0.85, 0.85, 0.85),
      });

      // Left half label
      page.drawText('PÁG. 2 (MITAD IZQUIERDA)', {
        x: 40,
        y: pageHeight - 60,
        size: 14,
        font: font,
        color: rgb(1, 1, 1),
      });
      page.drawText('DOBLE PÁGINA (SPREAD)', {
        x: 40,
        y: pageHeight - 150,
        size: 18,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText('Esta es la mitad izquierda de una doble página que puedes dividir en 2 con la tijera.', {
        x: 40,
        y: pageHeight - 180,
        size: 11,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Right half label
      page.drawText('PÁG. 3 (MITAD DERECHA)', {
        x: defaultPageWidth + 40,
        y: pageHeight - 60,
        size: 14,
        font: font,
        color: rgb(1, 1, 1),
      });
      page.drawText('CONTINUACIÓN DERECHA', {
        x: defaultPageWidth + 40,
        y: pageHeight - 150,
        size: 18,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText('Al dividir la página por la mitad, esta parte se convierte en la página consecutiva.', {
        x: defaultPageWidth + 40,
        y: pageHeight - 180,
        size: 11,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
      continue;
    }

    // Background header bar
    page.drawRectangle({
      x: 0,
      y: pageHeight - 110,
      width: pageWidth,
      height: 110,
      color: rgb(color.r, color.g, color.b),
    });

    // Outer border
    page.drawRectangle({
      x: 10,
      y: 10,
      width: pageWidth - 20,
      height: pageHeight - 20,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1.5,
    });

    // Page number circle badge
    page.drawCircle({
      x: 45,
      y: pageHeight - 55,
      size: 26,
      color: rgb(1, 1, 1),
    });

    const numStr = String(i);
    const numWidth = font.widthOfTextAtSize(numStr, 20);
    page.drawText(numStr, {
      x: 45 - numWidth / 2,
      y: pageHeight - 62,
      size: 20,
      font: font,
      color: rgb(color.r, color.g, color.b),
    });

    // Header title
    const isCover = (i % 16 === 1);
    const isBackCover = (i % 16 === 0);
    let title = `PÁGINA ${i}`;
    if (isCover) title = `PORTADA (Pág. ${i})`;
    if (isBackCover) title = `CONTRAPORTADA (Pág. ${i})`;

    page.drawText(title, {
      x: 85,
      y: pageHeight - 60,
      size: 14,
      font: font,
      color: rgb(1, 1, 1),
    });

    // Decorative content inside page
    page.drawText('BOOKZINE DEMO', {
      x: 30,
      y: pageHeight - 150,
      size: 18,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });

    const desc = isCover
      ? '¡Esta es la portada exterior de tu bookzine!'
      : isBackCover
      ? '¡Esta es la contraportada final del bookzine!'
      : `Contenido editorial para la página ${i} del fanzine.`;

    page.drawText(desc, {
      x: 30,
      y: pageHeight - 180,
      size: 11,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Graphic placeholder box
    page.drawRectangle({
      x: 30,
      y: 70,
      width: pageWidth - 60,
      height: 140,
      color: rgb(0.96, 0.96, 0.97),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
    });

    page.drawText('Ilustración / Gráfico', {
      x: pageWidth / 2 - 50,
      y: 135,
      size: 12,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.65),
    });

    // Footer note
    page.drawText(`Bookzine Maker • Imposición 16 págs • Pág. ${i}`, {
      x: 30,
      y: 30,
      size: 9,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes], `bookzine-demo-${pageCount}pags.pdf`, {
    type: 'application/pdf',
  });
}
