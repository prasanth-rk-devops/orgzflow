/**
 * Centre-crop any picture to a square JPEG (default 320 px). Done in the browser so uploads stay tiny (~30 KB)
 * and phone photos are rotated correctly before they reach the server.
 */
export async function squareJpeg(file, size = 320, quality = 0.85) {
  let source;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    source = await new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as an image')); };
      img.src = url;
    });
  }
  const w = source.naturalWidth || source.width;
  const h = source.naturalHeight || source.height;
  const side = Math.min(w, h);
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); // PNG transparency becomes white instead of black
  ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Could not process that image');
  return blob;
}
