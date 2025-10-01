// modules/image.js
export async function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export async function compressImageFile(file, { maxW = 1000, maxH = 1000, quality = 0.82 } = {}) {
  const src = await fileToDataURL(file);
  return compressDataURL(src, { maxW, maxH, quality });
}

export async function compressDataURL(dataURL, { maxW = 1000, maxH = 1000, quality = 0.82 } = {}) {
  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = dataURL;
  });

  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);

  const tryWebP = canvas.toDataURL('image/webp', quality);
  const out = tryWebP.startsWith('data:image/webp') ? tryWebP : canvas.toDataURL('image/jpeg', quality);
  return out;
}
