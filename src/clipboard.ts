/** Còpia de captures al porta-retalls (US3) amb fallback de descàrrega */
import { BASE } from './search'

/** Converteix qualsevol imatge (WebP) a PNG, format que ClipboardItem accepta */
async function aPng(blob: Blob): Promise<Blob> {
  if (blob.type === 'image/png') return blob
  const bmp = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bmp.width, bmp.height)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0)
  return canvas.convertToBlob({ type: 'image/png' })
}

function feedback(boto: HTMLButtonElement, text: string): void {
  const original = boto.textContent
  boto.textContent = text
  boto.disabled = true
  setTimeout(() => {
    boto.textContent = original
    boto.disabled = false
  }, 1800)
}

function descarrega(url: string, nom: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  a.click()
}

/** Copia la captura com a PNG al porta-retalls; si el navegador el bloqueja, ofereix la descàrrega */
export async function copiaImatge(ruta: string, boto: HTMLButtonElement): Promise<void> {
  const url = `${BASE}${ruta}`
  try {
    if (!('clipboard' in navigator) || !('ClipboardItem' in window)) throw new Error('Clipboard API no disponible')
    const blob = aPng(await fetch(url).then((r) => {
      if (!r.ok) throw new Error(`imatge no disponible (${r.status})`)
      return r.blob()
    }))
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': await blob })])
    feedback(boto, 'Copiat!')
  } catch {
    descarrega(url, ruta.split('/').pop()!.replace(/\.webp$/, '.png'))
    feedback(boto, 'Descarregada')
  }
}
