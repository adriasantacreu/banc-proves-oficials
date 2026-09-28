/** Vista de fitxa A4 imprimible a partir del carret (US4) */
import type { Exercici } from './types'
import { ETIQUETA } from './types'
import { BASE, perId } from './search'
import { llista, buidar } from './cart'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function generaFitxa(contenidor: HTMLElement): Exercici[] {
  const exercicis = llista().map(perId).filter((e): e is Exercici => !!e)
  contenidor.innerHTML = `
    <div class="mx-auto max-w-3xl bg-white shadow-sm print:shadow-none">
      <header class="px-8 pt-8 pb-4 border-b-2 border-slate-800">
        <input id="fitxa-titol" class="fitxa-input text-xl font-bold" value="Fitxa d'activitats" aria-label="Títol de la fitxa">
        <div class="mt-2 grid grid-cols-3 gap-3 text-sm">
          <label class="flex gap-2 items-baseline"><span class="text-slate-500">Curs:</span><input class="fitxa-input flex-1" value="" aria-label="Curs"></label>
          <label class="flex gap-2 items-baseline"><span class="text-slate-500">Data:</span><input class="fitxa-input flex-1" value="" aria-label="Data"></label>
          <label class="flex gap-2 items-baseline"><span class="text-slate-500">Nom:</span><input class="fitxa-input flex-1" value="" aria-label="Nom de l'alumne"></label>
        </div>
      </header>
      <ol class="px-8 py-4 space-y-6 list-none">
        ${exercicis.map((e, i) => `
          <li class="fitxa-exercici">
            <p class="text-sm font-semibold">${i + 1}. ${esc(e.context_text || e.tema || ETIQUETA[e.origen ? 'mat2' : e.materia])}</p>
            ${e.context_img ? `<img src="${BASE}${e.context_img}" alt="Context" class="fitxa-img">` : ''}
            ${e.enunciat_img
              ? `<img src="${BASE}${e.enunciat_img}" alt="Enunciat ${i + 1}" class="fitxa-img">`
              : '<p class="text-xs text-slate-400">Captura no disponible</p>'}
            <p class="mt-1 text-[10px] text-slate-400 uppercase tracking-wide">Font: ${esc(e.origen ?? '')} · ${e.any}</p>
          </li>`).join('')}
      </ol>
      ${exercicis.length === 0 ? '<p class="p-10 text-center text-slate-400">El carret és buit: afegeix-hi preguntes des del cercador.</p>' : ''}
    </div>`
  return exercicis
}

export function obreFitxa(contenidor: HTMLElement): void {
  generaFitxa(contenidor)
  document.body.classList.add('vista-fitxa')
}

export function tancaFitxa(): void {
  document.body.classList.remove('vista-fitxa')
}

export function imprimeix(): void {
  window.print()
}

export function buidaFitxa(contenidor: HTMLElement): void {
  buidar()
  generaFitxa(contenidor)
}
