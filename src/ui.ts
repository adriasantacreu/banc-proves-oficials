/** Renderitzat de targetes, filtres i comptador de resultats */
import type { Exercici, Facet } from './types'
import { ETIQUETA } from './types'
import { BASE } from './search'
import { hiEs } from './cart'

export interface Estat {
  filtres: Record<string, Set<string>>
  query: string
}

export const estat: Estat = { filtres: { etapa: new Set(), materia: new Set(), convocatoria: new Set(), any: new Set() }, query: '' }

export function aplicaFiltres(llista: Exercici[]): Exercici[] {
  return llista.filter((e) =>
    Object.entries(estat.filtres).every(([clau, actius]) => !actius.size || actius.has(String(e[clau as keyof Exercici]))),
  )
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const img = (ruta: string | null | undefined, alt: string, cls: string): string =>
  ruta
    ? `<img src="${BASE}${ruta}" alt="${esc(alt)}" loading="lazy" class="${cls}" onerror="this.replaceWith(Object.assign(document.createElement('p'),{textContent:'Captura no disponible',className:'text-xs text-slate-400'}))">`
    : `<p class="text-xs text-slate-400 p-4 text-center">Captura no disponible per a aquesta prova</p>`

export function targeta(e: Exercici): string {
  const ref = [
    e.etapa === 'pau_bat' && e.serie_o_model != null ? `Sèrie ${e.serie_o_model}` : null,
    `Pregunta ${e.numero_pregunta}`,
    e.tema ?? '',
  ].filter(Boolean).join(' · ')
  return `
  <article class="targeta flex flex-col gap-2" data-id="${e.id}">
    <div class="flex flex-wrap items-center gap-1.5">
      <span class="insignia bg-slate-800 text-white">${ETIQUETA[e.etapa]}</span>
      <span class="insignia bg-sky-100 text-sky-800">${ETIQUETA[e.materia]}</span>
      <span class="insignia bg-slate-100 text-slate-600">${e.any} · ${ETIQUETA[e.convocatoria]}</span>
      ${e.puntuacio_max != null ? `<span class="ml-auto text-xs font-semibold text-slate-500">${e.puntuacio_max.toLocaleString('ca-ES')} punts</span>` : ''}
    </div>
    ${img(e.enunciat_img, `Enunciat de ${ref}`, 'w-full rounded-lg border border-slate-100 bg-white')}
    <p class="text-xs text-slate-500">${esc(ref)}</p>
    <div class="flex flex-wrap gap-2 mt-auto">
      <button data-accio="solucio" class="btn-secondary text-xs">Veure solució i criteris</button>
      ${e.enunciat_img ? `<button data-accio="copiar" data-img="${e.enunciat_img}" class="btn-secondary text-xs">Copia imatge</button>` : ''}
      <button data-accio="carret" class="btn-secondary text-xs ml-auto">${hiEs(e.id) ? '✓ A la fitxa' : '✚ Afegeix a la fitxa'}</button>
    </div>
    <div class="panell-solucio" hidden></div>
  </article>`
}

/** Filtres amb comptador calculat sobre la llista ja filtrada pel text (recompte en viu) */
export function renderFiltres(contenidor: HTMLElement, candidats: Exercici[]): void {
  const anys = [...new Set(candidats.map((e) => e.any))].sort((a, b) => b - a)
  const facets: Facet[] = [
    { key: 'etapa', label: 'Etapa', opcions: ['pau_bat', 'cb_4eso', 'cb_2eso'].map((v) => ({ valor: v, label: ETIQUETA[v], comptador: candidats.filter((e) => e.etapa === v).length })) },
    { key: 'materia', label: 'Matèria', opcions: [...new Set(candidats.map((e) => e.materia))].map((v) => ({ valor: v, label: ETIQUETA[v], comptador: candidats.filter((e) => e.materia === v).length })) },
    { key: 'convocatoria', label: 'Convocatòria', opcions: ['juny', 'setembre', 'diagnostica'].map((v) => ({ valor: v, label: ETIQUETA[v], comptador: candidats.filter((e) => e.convocatoria === v).length })) },
    { key: 'any', label: 'Any', opcions: anys.map((v) => ({ valor: String(v), label: String(v), comptador: candidats.filter((e) => e.any === v).length })) },
  ]
  contenidor.innerHTML = facets
    .map((f) => `
      <fieldset data-facet="${f.key}" class="flex items-center gap-1">
        <legend class="sr-only">${f.label}</legend>
        <span class="text-xs text-slate-400 mr-1">${f.label}:</span>
        ${f.opcions.filter((o) => o.comptador > 0).map((o) => `
          <button type="button" data-facet="${f.key}" data-valor="${o.valor}"
            class="chip ${estat.filtres[f.key].has(o.valor) ? 'chip-actiu' : ''}"
            ${o.comptador === 0 && !estat.filtres[f.key].has(o.valor) ? 'disabled' : ''}>
            ${esc(o.label)} <span class="text-slate-400">${o.comptador}</span>
          </button>`).join('')}
      </fieldset>`)
    .join('')

  // Restricció de facets: desactiva valors que deixarien el conjunt buit (comptador 0 amb filtres actius)
  if (Object.values(estat.filtres).some((s) => s.size)) {
    const altres = (clau: string) =>
      candidats.filter((e) => Object.entries(estat.filtres).every(([k, s]) => !s.size || k === clau || s.has(String(e[k as keyof Exercici]))))
    contenidor.querySelectorAll<HTMLButtonElement>('button[data-facet]').forEach((b) => {
      const v = altres(b.dataset.facet!).some((e) => String(e[b.dataset.facet as keyof Exercici]) === b.dataset.valor)
      b.toggleAttribute('disabled', !v)
    })
  }
}
