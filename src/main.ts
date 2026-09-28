/** Punt d'entrada: cerca instantània + filtres + targetes + carret + fitxa */
import './styles/app.css'
import { carregaCatalog, cerca, perId } from './search'
import { aplicaFiltres, estat, renderFiltres, targeta, type Estat } from './ui'
import { desa } from './solution'
import { copiaImatge } from './clipboard'
import * as carret from './cart'
import { obreFitxa, tancaFitxa, imprimeix, buidaFitxa } from './print'

const input = document.querySelector<HTMLInputElement>('#search-input')!
const contenidorFiltres = document.querySelector<HTMLDivElement>('#filters')!
const resultats = document.querySelector<HTMLElement>('#results')!
const buit = document.querySelector<HTMLElement>('#empty-state')!
const recompte = document.querySelector<HTMLElement>('#results-count')!
const panellCarret = document.querySelector<HTMLElement>('#cart-panel')!
const llistaCarret = document.querySelector<HTMLUListElement>('#cart-llista')!
const fitxaContingut = document.querySelector<HTMLElement>('#fitxa-contingut')!

const SUGGERIMENTS = ['matriu', 'derivada', 'probabilitat', 'recta tangent', 'pitàgores', 'binomial']

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function pinta(total: number): void {
  const candidats = aplicaFiltres(cerca(estat.query))
  renderFiltres(contenidorFiltres, aplicaFiltres(cerca('')))
  resultats.innerHTML = candidats.map(targeta).join('')
  recompte.textContent = `${candidats.length.toLocaleString('ca-ES')} de ${total} preguntes`
  buit.hidden = candidats.length > 0
  if (candidats.length === 0) {
    const sug = buit.querySelector<HTMLParagraphElement>('#suggeriments')!
    sug.innerHTML = SUGGERIMENTS
      .filter((s) => !estat.query.toLowerCase().includes(s))
      .slice(0, 4)
      .map((s) => `<button type="button" data-suggeriment="${s}" class="chip">${s}</button>`)
      .join(' ')
  }
}

function pintaCarret(): void {
  const ids = carret.llista()
  document.querySelector<HTMLElement>('#cart-badge')!.textContent = String(ids.length)
  document.querySelector<HTMLElement>('#cart-count')!.textContent = String(ids.length)
  llistaCarret.innerHTML = ids
    .map((id) => {
      const e = perId(id)
      const ref = e ? `${e.any} · ${e.etapa.toUpperCase()} · preg. ${e.numero_pregunta}` : id
      return `<li class="flex items-center gap-2 px-4 py-3 text-sm" data-id="${id}">
        <span class="flex-1">${esc(ref)}</span>
        <button data-carret="amunt" class="btn-secondary px-2 py-0.5" aria-label="Puja">↑</button>
        <button data-carret="avall" class="btn-secondary px-2 py-0.5" aria-label="Baixa">↓</button>
        <button data-carret="treu" class="btn-secondary px-2 py-0.5 text-red-600" aria-label="Elimina">✕</button>
      </li>`
    })
    .join('')
  // Refresca l'estat dels botons de les targetes visibles
  resultats.querySelectorAll<HTMLElement>('article[data-id]').forEach((art) => {
    const b = art.querySelector<HTMLButtonElement>('[data-accio="carret"]')
    if (b) b.textContent = carret.hiEs(art.dataset.id!) ? '✓ A la fitxa' : '✚ Afegeix a la fitxa'
  })
}

async function init(): Promise<void> {
  let total = 0
  try {
    total = (await carregaCatalog()).length
  } catch (err) {
    recompte.textContent = 'No s’ha pogut carregar el catàleg.'
    console.error(err)
    return
  }
  pinta(total)
  pintaCarret()

  input.addEventListener('input', () => {
    estat.query = input.value
    pinta(total)
  })
  contenidorFiltres.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-facet]')
    if (!b || b.disabled) return
    const actius = (estat as Estat).filtres[b.dataset.facet!]
    const valor = b.dataset.valor!
    actius.has(valor) ? actius.delete(valor) : actius.add(valor)
    pinta(total)
  })

  // Accions de les targetes: solució / copiar / carret
  resultats.addEventListener('click', (ev) => {
    const el = ev.target as HTMLElement
    const article = el.closest<HTMLElement>('article[data-id]')!
    const accio = el.closest<HTMLElement>('[data-accio]')?.getAttribute('data-accio')
    const id = article.dataset.id!
    if (accio === 'solucio') desa(article, id)
    else if (accio === 'copiar') copiaImatge(el.closest<HTMLButtonElement>('[data-accio="copiar"]')!.dataset.img!, el.closest<HTMLButtonElement>('[data-accio="copiar"]')!)
    else if (accio === 'carret') carret.toggle(id)
  })

  buit.addEventListener('click', (ev) => {
    const s = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-suggeriment]')
    if (!s) return
    input.value = estat.query = s.dataset.suggeriment!
    pinta(total)
  })
  document.querySelector('#reset-filtres')?.addEventListener('click', () => {
    estat.query = ''
    input.value = ''
    Object.values(estat.filtres).forEach((s) => s.clear())
    pinta(total)
  })

  // Carret
  window.addEventListener('carret:canvi', pintaCarret)
  document.querySelector('#cart-button')!.addEventListener('click', () => (panellCarret.hidden = !panellCarret.hidden))
  document.querySelector('#cart-tanca')!.addEventListener('click', () => (panellCarret.hidden = true))
  document.querySelector('#cart-buida')!.addEventListener('click', () => carret.buidar())
  llistaCarret.addEventListener('click', (ev) => {
    const fila = (ev.target as HTMLElement).closest<HTMLElement>('li[data-id]')!
    const accio = (ev.target as HTMLElement).closest<HTMLElement>('[data-carret]')!.getAttribute('data-carret')
    if (accio === 'amunt') carret.moure(fila.dataset.id!, -1)
    else if (accio === 'avall') carret.moure(fila.dataset.id!, 1)
    else if (accio === 'treu') carret.eliminar(fila.dataset.id!)
  })

  // Fitxa
  document.querySelector('#fitxa-genera')!.addEventListener('click', () => {
    obreFitxa(fitxaContingut)
    panellCarret.hidden = true
    window.scrollTo(0, 0)
  })
  document.querySelector('#fitxa-torna')!.addEventListener('click', tancaFitxa)
  document.querySelector('#fitxa-imprimeix')!.addEventListener('click', imprimeix)
  document.querySelector('#fitxa-buida')!.addEventListener('click', () => buidaFitxa(fitxaContingut))
}

init()
