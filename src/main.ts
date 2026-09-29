/** Punt d'entrada: estat (cerca + filtres a la URL), llista amb paginació, carret i fitxa */
import '@fontsource-variable/bricolage-grotesque/wght.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import './styles/estils.css'
import './styles/app.css'
import { anyMax, anyMin, carrega, llest, fitxaPerId, filtresBuits, resultats, totalFitxes, unitat, type Faceta, type Filtres } from './data'
import { esc, pintaFiltres, pintaFitxa, targeta } from './render'
import { copiaImatge, copiaText } from './clipboard'
import * as carret from './cart'
import type { FitxaCb } from './types'

const $ = <T extends HTMLElement>(s: string): T => document.querySelector<T>(s)!
const PAGINA = 24
const SUGGERIMENTS = ['matriu', 'probabilitat', 'percentatge', 'energia', 'recta tangent', 'funció']
let fl: Filtres
let llista: ReturnType<typeof resultats> = []
let pintades = 0

// ---- URL ⇄ estat --------------------------------------------------------
function llegeixHash(): Filtres {
  const f = filtresBuits()
  const p = new URLSearchParams(location.hash.slice(1))
  f.q = p.get('q') ?? ''
  for (const k of ['coleccio', 'bloc', 'conv'] as Faceta[]) (p.get(k) ?? '').split('|').filter(Boolean).forEach((v) => f[k].add(v))
  f.des = Math.max(anyMin, Number(p.get('des')) || anyMin)
  f.fins = Math.min(anyMax, Number(p.get('fins')) || anyMax)
  return f
}
function escriuHash(): void {
  const p = new URLSearchParams()
  if (fl.q) p.set('q', fl.q)
  for (const k of ['coleccio', 'bloc', 'conv'] as Faceta[]) if (fl[k].size) p.set(k, [...fl[k]].join('|'))
  if (fl.des !== anyMin) p.set('des', String(fl.des))
  if (fl.fins !== anyMax) p.set('fins', String(fl.fins))
  history.replaceState(null, '', p.size ? `#${p}` : location.pathname + location.search)
}

// ---- llista -------------------------------------------------------------
function mesTargetes(): void {
  const tros = llista.slice(pintades, pintades + PAGINA)
  $('#results').insertAdjacentHTML('beforeend', tros.map(targeta).join(''))
  pintades += tros.length
  if (pintades === tros.length) $('#results').querySelectorAll('img').forEach((im, i) => { if (i < 3) { im.loading = 'eager'; im.fetchPriority = i ? 'auto' : 'high' } })
}
function actualitza(refiltres = true): void {
  llista = resultats(fl)
  pintades = 0
  $('#results').innerHTML = ''
  mesTargetes()
  if (refiltres) pintaFiltres($('#filters'), fl)
  $('#count').textContent = `${llista.length.toLocaleString('ca-ES')} de ${totalFitxes().toLocaleString('ca-ES')} fitxes`
  $('#empty').hidden = llista.length > 0
  $('#sugg').innerHTML = SUGGERIMENTS.map((s) => `<button type="button" data-sugg="${s}">${s}</button>`).join('')
  escriuHash()
}
new IntersectionObserver((e) => { if (e[0].isIntersecting && pintades < llista.length) mesTargetes() }, { rootMargin: '600px' }).observe($('#sentinel'))

// ---- carret -------------------------------------------------------------
function nomUnitat(id: string): string {
  const u = unitat(id)
  if (!u) return id
  return 'grup' in u ? `${u.fitxa.any} · ${u.fitxa.coleccio} · ${u.fitxa.titol} · ítem ${u.grup.num}` : `${u.fitxa.any} ${u.fitxa.conv} · ${u.fitxa.coleccio} · P${u.fitxa.num} ${u.fitxa.tema ?? ''}`
}
function pintaCarret(): void {
  const ids = carret.llista().filter((id) => unitat(id))
  $('#cart-badge').textContent = $('#cart-count').textContent = String(ids.length)
  $('#cart-llista').innerHTML = ids.map((id) => `<li data-id="${id}"><span>${esc(nomUnitat(id))}</span><button data-c="amunt" aria-label="Puja">↑</button><button data-c="avall" aria-label="Baixa">↓</button><button data-c="treu" aria-label="Treu">✕</button></li>`).join('')
  document.querySelectorAll<HTMLButtonElement>('[data-accio="carret"]').forEach((b) => {
    const dins = carret.hiEs(b.dataset.id!)
    b.textContent = dins ? '✓ A la fitxa' : '+ Fitxa'
    b.classList.toggle('p', dins)
  })
}

// ---- events -------------------------------------------------------------
let temporitzador = 0
$('#q').addEventListener('input', (ev) => {
  clearTimeout(temporitzador)
  temporitzador = window.setTimeout(() => { fl.q = (ev.target as HTMLInputElement).value; llest.then(() => actualitza()) }, 80)
})
$('#filters').addEventListener('change', (ev) => {
  const t = ev.target as HTMLInputElement | HTMLSelectElement
  if (t.dataset.faceta) {
    const s = fl[t.dataset.faceta as Faceta]
    ;(t as HTMLInputElement).checked ? s.add(t.value) : s.delete(t.value)
  } else if (t.dataset.any) {
    fl[t.dataset.any as 'des' | 'fins'] = Number(t.value)
    if (fl.des > fl.fins) fl[t.dataset.any === 'des' ? 'fins' : 'des'] = Number(t.value)
  }
  actualitza()
})
const neteja = (): void => { const q = fl.q; fl = filtresBuits(); fl.q = q; actualitza() }
$('#filters').addEventListener('click', (ev) => { if ((ev.target as HTMLElement).dataset.accio === 'neteja') neteja() })
$('#empty').addEventListener('click', (ev) => {
  const s = (ev.target as HTMLElement).dataset.sugg
  if (s) { fl = filtresBuits(); fl.q = s; ($('#q') as HTMLInputElement).value = s; actualitza() }
})

$('#results').addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('button')
  if (!el) return
  const carta = el.closest<HTMLElement>('.card')!
  if (el.dataset.tab) {
    carta.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b === el)))
    carta.querySelectorAll<HTMLElement>('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== el.dataset.tab })
    return
  }
  switch (el.dataset.accio) {
    case 'carret': carret.toggle(el.dataset.id!); break
    case 'carret-act': {
      const f = fitxaPerId(el.dataset.id!) as FitxaCb
      carret.afegirTots(f.items.map((g) => g.id))
      break
    }
    case 'copia-img': {
      const solVisible = el.dataset.imgSol && !carta.querySelector<HTMLElement>('[data-pane="sol"]')!.hidden
      const ruta = solVisible ? el.dataset.imgSol! : el.dataset.img!
      if (ruta) copiaImatge(ruta, el)
      break
    }
    case 'copia-ref': {
      const f = fitxaPerId(el.dataset.id!)
      if (f?.tipus === 'pau') copiaText(`${f.id} — ${f.coleccio} ${f.any} ${f.conv}, ${f.prova}, pregunta ${f.num} (${f.bloc} · ${f.tema})\n\n${f.text}`, el)
      break
    }
  }
})

window.addEventListener('carret:canvi', pintaCarret)
$('#cart-button').addEventListener('click', () => { const p = $('#cart-panel'); p.hidden = !p.hidden })
$('#cart-tanca').addEventListener('click', () => { $('#cart-panel').hidden = true })
$('#cart-buida').addEventListener('click', () => carret.buidar())
$('#cart-llista').addEventListener('click', (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>('button[data-c]')
  if (!b) return
  const id = b.closest<HTMLElement>('li')!.dataset.id!
  if (b.dataset.c === 'treu') carret.eliminar(id)
  else carret.moure(id, b.dataset.c === 'amunt' ? -1 : 1)
})
const refaFitxa = (): void => { pintaFitxa($('#fitxa-contingut'), ($('#fitxa-sol') as HTMLInputElement).checked) }
$('#fitxa-genera').addEventListener('click', () => { refaFitxa(); $('#cart-panel').hidden = true; document.body.classList.add('vista-fitxa'); scrollTo(0, 0) })
$('#fitxa-torna').addEventListener('click', () => document.body.classList.remove('vista-fitxa'))
$('#fitxa-sol').addEventListener('change', refaFitxa)
$('#fitxa-imprimeix').addEventListener('click', () => print())

// ---- arrencada ----------------------------------------------------------
carrega().then(() => {
  fl = llegeixHash()
  ;($('#q') as HTMLInputElement).value = fl.q
  actualitza()
  pintaCarret()
  document.body.classList.remove('carregant')
  if (fl.q) { $('#count').textContent = 'Preparant la cerca…'; llest.then(() => actualitza()) }
  addEventListener('hashchange', () => { fl = llegeixHash(); ($('#q') as HTMLInputElement).value = fl.q; actualitza() })
}).catch((e) => { $('#count').textContent = 'No s’ha pogut carregar el catàleg.'; console.error(e) })
