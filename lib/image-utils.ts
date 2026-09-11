/**
 * lib/image-utils.ts
 *
 * Client-only helper to turn a user-selected image file into a resized,
 * compressed data URL — used so product photos can be stored directly in
 * localStorage (no backend/file storage yet) without blowing the quota.
 */

/** Shared upload size cap for owner-uploaded photos (store cover, products). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function fileToResizedDataUrl(
  file: File,
  maxDim = 640,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);

      if (!ctx) {
        reject(new Error('No se pudo procesar la imagen'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen'));
    };

    img.src = objectUrl;
  });
}

// ---------------------------------------------------------------------------
// Story/status share image — renders a vertical (9:16) card with the
// product's photo, name and price, plus the Auntokke wordmark at the
// bottom, for sharing to WhatsApp Status / Instagram Stories.
// ---------------------------------------------------------------------------

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la foto del producto'));
    img.src = src;
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws `img` into the (x, y, w, h) box using object-fit: cover semantics. */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx: number, sy: number, sw: number, sh: number;
  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** Centered word-wrap, capped at 2 lines. Returns the number of lines drawn. */
function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
): number {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  const shown = lines.slice(0, maxLines);
  shown.forEach((l, i) => ctx.fillText(l, centerX, startY + i * lineHeight));
  return shown.length;
}

/** Draws a filled pill (rounded rect) sized to fit its text, returns its height. */
function drawPill(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  text: string,
  font: string,
  fillStyle: string,
  textStyle: string,
  paddingX = 32,
  height = 76,
): void {
  ctx.font = font;
  const textWidth = ctx.measureText(text).width;
  const pillWidth = textWidth + paddingX * 2;
  const x = centerX - pillWidth / 2;
  roundedRectPath(ctx, x, y, pillWidth, height, height / 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.fillStyle = textStyle;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX, y + height / 2 + 2);
  ctx.textBaseline = 'alphabetic';
}

/** Pseudo-random but stable per-call scatter of a decorative glyph across the canvas. */
function scatterGlyphs(
  ctx: CanvasRenderingContext2D,
  glyphs: string[],
  spots: Array<[number, number, number]>, // [x, y, fontSize]
) {
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.55;
  spots.forEach(([x, y, size], i) => {
    ctx.font = `${size}px sans-serif`;
    ctx.fillText(glyphs[i % glyphs.length], x, y);
  });
  ctx.globalAlpha = 1;
}

export interface StoryImageInput {
  fotoUrl?: string;
  nombre: string;
  precioTexto: string;
  storeName: string;
  acentoBase: string;
  acentoDark: string;
  /** Store category — drawn as a badge (emoji + label) at the top of the card. */
  categoriaEmoji?: string;
  categoriaLabel?: string;
  /** Optional store logo — drawn as a small circular badge next to the store name. */
  logoUrl?: string;
}

/**
 * Renders a shareable 1080x1920 PNG (data URL) for a product: a glowing
 * gradient backdrop in the store's accent color, a white card with the
 * category badge, photo, name and price, a WhatsApp CTA chip, and the
 * Auntokke wordmark lockup pinned near the bottom.
 */
export async function generateStoryImage(input: StoryImageInput): Promise<string> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear el lienzo');

  // Wait for the app's own webfonts so the canvas text matches the UI.
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore — falls back to the browser's default sans-serif.
    }
  }
  const rootStyle = getComputedStyle(document.documentElement);
  const headlineFont = rootStyle.getPropertyValue('--font-headline').trim() || 'sans-serif';
  const bodyFont = rootStyle.getPropertyValue('--font-body').trim() || 'sans-serif';
  const centerX = W / 2;

    // ── Background: Elegant cream gradient + soft blobs ──
  const bgGradient = ctx.createLinearGradient(0, 0, W, H);
  bgGradient.addColorStop(0, '#FDFBF7');
  bgGradient.addColorStop(1, '#F4EAE0');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  // Soft blobs for the elegant wave effect
  ctx.save();
  ctx.filter = 'blur(120px)';
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(200, 200, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E8DCC8';
  ctx.beginPath();
  ctx.arc(W - 100, H - 300, 400, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Card ──
  const cardX = 80;
  const cardY = 140;
  const cardW = W - cardX * 2;
  const cardH = 1480;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.06)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Card bottom half slight tint (optional, but gives that two-tone look)
  ctx.save();
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.clip();
  ctx.fillStyle = '#FCFAF6';
  ctx.fillRect(cardX, cardY + 900, cardW, cardH - 900);
  ctx.restore();

  // Top Tag: "Producto Destacado"
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4A4A4A';
  ctx.font = `44px ${headlineFont}`;
  ctx.fillText('🏷️ Producto Destacado', cardX + 60, cardY + 70);
  ctx.textBaseline = 'alphabetic';

  // ── Product Photo ──
  const photoSize = 800;
  const photoX = centerX - photoSize / 2;
  const photoY = cardY + 140;
  
  try {
    if (!input.fotoUrl) throw new Error('sin foto');
    const img = await loadImageEl(input.fotoUrl);
    ctx.save();
    roundedRectPath(ctx, photoX, photoY, photoSize, photoSize, 40);
    ctx.clip();
    drawImageCover(ctx, img, photoX, photoY, photoSize, photoSize);
    ctx.restore();
  } catch {
    roundedRectPath(ctx, photoX, photoY, photoSize, photoSize, 40);
    ctx.fillStyle = '#F0EBE1';
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = `140px ${bodyFont}`;
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('📷', photoX + photoSize / 2, photoY + photoSize / 2 + 45);
  }

  // ── Product Name ──
  let cursorY = photoY + photoSize + 110;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#222222';
  ctx.font = `500 52px ${headlineFont}`;
  const nameLines = wrapCenteredText(ctx, input.nombre, centerX, cursorY, cardW - 80, 60);
  cursorY += (nameLines - 1) * 60 + 90;

  // ── Price ──
  ctx.fillStyle = '#A67C52'; // Elegant gold/brown
  ctx.font = `800 84px ${headlineFont}`;
  ctx.fillText(input.precioTexto, centerX, cursorY);
  cursorY += 90;

  // ── Store Name ──
  ctx.font = `400 38px ${bodyFont}`;
  ctx.fillStyle = '#666666';
  ctx.fillText(`🏪 ${input.storeName}`, centerX, cursorY);
  cursorY += 90;

  // ── WhatsApp CTA chip ──
  // Slightly wider and taller pill to match the elegant look
  drawPill(ctx, centerX, cursorY, 'Pídelo por WhatsApp  💬', `600 36px ${bodyFont}`, '#25D366', '#FFFFFF');

  // ── Auntokke lockup, bottom of the frame ──
  ctx.fillStyle = '#4A433A';
  ctx.textAlign = 'center';
  ctx.font = `400 64px ${headlineFont}`;
  ctx.fillText('Auntokke', centerX, H - 120);

  return canvas.toDataURL('image/png');
}
