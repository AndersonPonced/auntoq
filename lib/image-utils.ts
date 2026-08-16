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
