/** Desplegable de solució oficial i criteris (US2) */
import type { Exercici } from './types'
import { BASE } from './search'
import { perId } from './search'

export function desa(targeta: HTMLElement, id: string): void {
  const panell = targeta.querySelector<HTMLDivElement>('.panell-solucio')!
  const boto = targeta.querySelector<HTMLButtonElement>('[data-accio="solucio"]')!
  const e = perId(id)
  if (!e) return

  if (panell.hidden) {
    const contingut = contingutSolucio(e)
    panell.innerHTML = contingut
    panell.hidden = false
    boto.textContent = 'Amaga solució'
  } else {
    panell.hidden = true
    boto.textContent = 'Veure solució i criteris'
  }
}

function contingutSolucio(e: Exercici): string {
  const teImg = !!e.solucio_img
  const teText = !!e.solucio_text
  if (!teImg && !teText) {
    return '<div class="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">Aquesta prova no té solució digitalitzada al banc.</div>'
  }
  const imatge = teImg
    ? `<img src="${BASE}${e.solucio_img}" alt="Solució oficial" loading="lazy" class="w-full rounded-lg border border-slate-100">`
    : ''
  const text = teText
    ? `<p class="text-sm leading-relaxed whitespace-pre-line"><strong>Criteris i resposta oficial:</strong> ${e.solucio_text}</p>`
    : ''
  return `<div class="mt-1 rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">${imatge}${text}</div>`
}
