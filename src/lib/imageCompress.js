// Compresses a photo in the browser so it can be stored inside a Firestore document
// (no Firebase Storage needed). Max 600 px, WebP/JPEG, target < 200 KB.
export async function compressImage(file, { maxSize = 600, maxBytes = 200_000 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')

  const bitmap = await loadImage(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)

  // Lower the quality step by step until the image is small enough.
  const type = canvas.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg'
  let quality = 0.82
  let dataUrl = canvas.toDataURL(type, quality)
  while (dataUrl.length * 0.75 > maxBytes && quality > 0.3) {
    quality -= 0.1
    dataUrl = canvas.toDataURL(type, quality)
  }
  if (dataUrl.length * 0.75 > maxBytes) throw new Error('This photo is too large. Try another one.')
  return dataUrl
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('We couldn’t read this image. Try a JPG or PNG.'))
    }
    img.src = url
  })
}
