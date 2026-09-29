/** Còpia de captures al porta-retalls (PNG) amb descàrrega de reserva */
import { BASE } from './data'

const aPng = async (blob: Blob): Promise<Blob> => {
  const bmp = await createImageBitmap(blob)
  const c = new OffscreenCanvas(bmp.width, bmp.height)
  c.getContext('2d')!.drawImage(bmp, 0, 0)
  return c.convertToBlob({ type: 'image/png' })
}

export function avis(boto: HTMLElement, text: string): void {
  const orig = boto.dataset.orig ?? boto.textContent ?? ''
  boto.dataset.orig = orig
  boto.textContent = text
  setTimeout(() => { boto.textContent = orig }, 1600)
}

export async function copiaImatge(ruta: string, boto: HTMLElement): Promise<void> {
  const url = `${BASE}${ruta}`
  try {
    if (!navigator.clipboard || !('ClipboardItem' in window)) throw new Error('sense porta-retalls')
    const png = fetch(url).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status))))).then(aPng)
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
    avis(boto, 'Copiada ✓')
  } catch {
    const blob = await fetch(url).then((r) => r.blob()).then(aPng)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = ruta.split('/').pop()!.replace(/\.webp$/, '.png')
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    avis(boto, 'Descarregada ↓')
  }
}

export async function copiaText(text: string, boto: HTMLElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    avis(boto, 'Copiat ✓')
  } catch {
    const t = Object.assign(document.createElement('textarea'), { value: text })
    document.body.append(t); t.select(); document.execCommand('copy'); t.remove()
    avis(boto, 'Copiat ✓')
  }
}
