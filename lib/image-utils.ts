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

  // ── Background: gradient + soft glow blobs + scattered sparkles ──────
  const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
  bgGradient.addColorStop(0, input.acentoBase);
  bgGradient.addColorStop(1, input.acentoDark);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.filter = 'blur(90px)';
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-60, 120, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W + 40, H - 260, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(W - 100, 200, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  scatterGlyphs(
    ctx,
    ['✨', '⭐️', '✨'],
    [
      [140, 210, 56],
      [W - 150, 1620, 48],
      [110, 1660, 44],
    ],
  );

  // ── Card ───────────────────────────────────────────────────────────
  // cardH must fit: badge + photo + gap + name(up to 2 lines) + price +
  // store name + CTA pill, with room to spare before the card's bottom
  // edge — otherwise the CTA pill spills onto the gradient background and
  // can overlap the Auntokke lockup pinned near H (see the layout math
  // this was tuned against, below).
  const cardX = 80;
  const cardY = 280;
  const cardW = W - cardX * 2;
  const cardH = 1300;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  const innerX = cardX + 40;
  const innerW = cardW - 80;

  // Category badge, top-left of the card.
  let cursorY = cardY + 44;
  if (input.categoriaEmoji && input.categoriaLabel) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const badgeText = `${input.categoriaEmoji}  ${input.categoriaLabel}`;
    ctx.font = `700 32px ${bodyFont}`;
    const badgeTextWidth = ctx.measureText(badgeText).width;
    const badgeH = 64;
    const badgePad = 26;
    roundedRectPath(ctx, innerX, cursorY, badgeTextWidth + badgePad * 2, badgeH, badgeH / 2);
    ctx.fillStyle = `${input.acentoBase}1F`;
    ctx.fill();
    ctx.fillStyle = input.acentoDark;
    ctx.fillText(badgeText, innerX + badgePad, cursorY + badgeH / 2 + 2);
    ctx.textBaseline = 'alphabetic';
    cursorY += badgeH + 28;
  }

  // Product photo, ringed in the accent color — or a placeholder tile if
  // it fails to load (e.g. CORS). Sized well under the card's full width
  // (not innerW) so there's still room below it for name/price/store/CTA
  // without overflowing the card.
  const photoSize = 600;
  const photoX = centerX - photoSize / 2;
  const photoY = cursorY;
  ctx.save();
  roundedRectPath(ctx, photoX - 6, photoY - 6, photoSize + 12, photoSize + 12, 38);
  ctx.strokeStyle = input.acentoBase;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();
  try {
    if (!input.fotoUrl) throw new Error('sin foto');
    const img = await loadImageEl(input.fotoUrl);
    ctx.save();
    roundedRectPath(ctx, photoX, photoY, photoSize, photoSize, 32);
    ctx.clip();
    drawImageCover(ctx, img, photoX, photoY, photoSize, photoSize);
    ctx.restore();
  } catch {
    roundedRectPath(ctx, photoX, photoY, photoSize, photoSize, 32);
    ctx.fillStyle = '#D6EFFB';
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = `140px ${bodyFont}`;
    ctx.fillText('🛍️', photoX + photoSize / 2, photoY + photoSize / 2 + 45);
  }
  cursorY = photoY + photoSize + 84;

  // Product name (up to 2 lines).
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0E2A52';
  ctx.font = `900 56px ${headlineFont}`;
  const nameLines = wrapCenteredText(ctx, input.nombre, centerX, cursorY, innerW - 20, 64);
  cursorY += (nameLines - 1) * 64 + 96;

  // Price.
  ctx.fillStyle = input.acentoDark;
  ctx.font = `900 76px ${headlineFont}`;
  ctx.fillText(input.precioTexto, centerX, cursorY);
  cursorY += 66;

  // Store name — with the store's own logo beside it, if it has one.
  ctx.font = `600 34px ${bodyFont}`;
  const storeNameWidth = ctx.measureText(input.storeName).width;
  const logoSize = 52;
  const logoGap = 16;

  let logoImg: HTMLImageElement | null = null;
  if (input.logoUrl) {
    try {
      logoImg = await loadImageEl(input.logoUrl);
    } catch {
      logoImg = null;
    }
  }

  const rowWidth = logoImg ? logoSize + logoGap + storeNameWidth : storeNameWidth;
  const rowStartX = centerX - rowWidth / 2;

  if (logoImg) {
    const logoCenterY = cursorY - 12;
    ctx.save();
    ctx.beginPath();
    ctx.arc(rowStartX + logoSize / 2, logoCenterY, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    drawImageCover(ctx, logoImg, rowStartX, logoCenterY - logoSize / 2, logoSize, logoSize);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(rowStartX + logoSize / 2, logoCenterY, logoSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = input.acentoBase;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.fillStyle = '#4C6B8F';
  ctx.textAlign = 'left';
  ctx.fillText(input.storeName, rowStartX + (logoImg ? logoSize + logoGap : 0), cursorY);
  ctx.textAlign = 'center';
  cursorY += 60;

  // WhatsApp CTA chip.
  drawPill(ctx, centerX, cursorY, '📲  Pídelo por WhatsApp', `700 32px ${bodyFont}`, '#25D366', '#FFFFFF');

  // ── Auntokke logo lockup, bottom of the frame ─────────────────────
  // Real brand logo (same file as the app header), on a white pill so it
  // stays legible no matter what colors the logo art itself uses.
  try {
    const logoImg = await loadImageEl('/logo.png');
    const targetH = 64;
    const targetW = (logoImg.width / logoImg.height) * targetH;
    const padX = 28;
    const padY = 16;
    const boxW = targetW + padX * 2;
    const boxH = targetH + padY * 2;
    const boxX = centerX - boxW / 2;
    const boxY = H - 240;
    roundedRectPath(ctx, boxX, boxY, boxW, boxH, boxH / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.drawImage(logoImg, boxX + padX, boxY + padY, targetW, targetH);
  } catch {
    // Logo failed to load — fall back to a plain text lockup.
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `900 52px ${headlineFont}`;
    ctx.fillText('Auntokke', centerX, H - 190);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.9;
  ctx.font = `600 30px ${bodyFont}`;
  ctx.fillText('Descúbrelo en Auntokke', centerX, H - 110);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}
