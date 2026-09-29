/** Fitxes (PAU i CCBB), filtres i fitxa imprimible */
import { BASE, FACETES, dim, anyMax, anyMin, recomptes, unitat, type Faceta, type Filtres } from './data'
import type { Fitxa, FitxaCb, FitxaPau, Grup } from './types'
import { hiEs, llista } from './cart'

export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const punts = (p: number | null): string => (p ? `${p.toLocaleString('ca-ES')} ${p === 1 ? 'punt' : 'punts'}` : '')
const etapa = (f: Fitxa): string => (f.coleccio.startsWith('PAU') ? 'PAU' : f.coleccio.includes('4t') ? '4t ESO' : '2n ESO')

const img = (src: string | null, alt: string): string =>
  src ? `<img src="${BASE}${src}" alt="${esc(alt)}" loading="lazy" decoding="async"${dim[src] ? ` width="${dim[src][0]}" height="${dim[src][1]}"` : ''}>` : '<p class="buit-img">Sense captura</p>'
const boto = (accio: string, text: string, extra = '', cls = ''): string =>
  `<button type="button" class="${cls}" data-accio="${accio}" ${extra}>${text}</button>`
const btnCarret = (id: string): string =>
  boto('carret', hiEs(id) ? '✓ A la fitxa' : '+ Fitxa', `data-id="${id}"`, hiEs(id) ? 'p' : '')

function capcalera(f: Fitxa, titol: string): string {
  return `<header>
    <div class="tags"><span class="tag et">${esc(f.coleccio)}</span><span class="tag">${f.any} · ${esc(f.conv)}</span>
    <span class="tag">${esc(f.prova.replace('CB4ESO_', '').replace('CB2ESO_', '').replace(/_/g, ' '))}${f.tipus === 'pau' ? ` · P${f.num}` : ` · Act. ${f.num}`}</span>
    ${f.punts ? `<span class="tag">${punts(f.punts)}</span>` : ''}</div>
    <h2>${esc(titol)}</h2>
    <div class="id">${f.bloc ? esc(f.bloc) + ' · ' : ''}${esc(f.materia)} · ${f.id}</div></header>`
}

function fitxaPau(f: FitxaPau): string {
  const sol = f.sol_img
    ? `<div class="shot" hidden data-pane="sol">${img(f.sol_img, 'Solució oficial')}</div>`
    : `<div class="shot" hidden data-pane="sol"><p class="buit-img">Aquest exercici no té solució digitalitzada.</p></div>`
  return `<article class="card" data-etapa="PAU" data-id="${f.id}">${capcalera(f, f.tema ?? `Pregunta ${f.num}`)}
    <div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-tab="enu">Enunciat</button><button role="tab" aria-selected="false" data-tab="sol">Solució i criteris</button></div>
    <div class="shot" data-pane="enu">${img(f.img, `Enunciat ${f.id}`)}</div>${sol}
    <div class="foot">${btnCarret(f.id)}${boto('copia-img', 'Copia imatge', `data-img="${f.img}" data-img-sol="${f.sol_img ?? ''}"`)}${boto('copia-ref', 'Referència', `data-id="${f.id}"`)}</div></article>`
}

function itemCb(g: Grup, f: FitxaCb): string {
  const claus = g.claus.map((c) => `<span class="ans"><span>${c.sub ? `${g.num}.${c.sub}` : `Ítem ${g.num}`}</span> <b>${esc(c.clau) || '—'}</b></span>`).join('')
  return `<div class="item" data-id="${g.id}"><div class="item-cap"><span class="id">Ítem ${g.num}${g.punts ? ` · ${punts(g.punts)}` : ''}</span>${btnCarret(g.id)}${boto('copia-img', 'Copia', `data-img="${g.img}"`)}</div>
    <div class="shot">${img(g.img, `Ítem ${g.num} de ${f.titol}`)}</div><div class="claus">${claus}</div></div>`
}

function fitxaCb(f: FitxaCb): string {
  return `<article class="card cb" data-etapa="${etapa(f)}" data-id="${f.id}">${capcalera(f, `${f.num}. ${f.titol}`)}
    <p class="desc">${esc(f.descripcio ?? '')}</p>
    <div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-tab="ctx">Context</button><button role="tab" aria-selected="false" data-tab="items">Ítems (${f.items.length})</button></div>
    <div class="shot ctx" data-pane="ctx">${f.ctx.map((c, i) => img(c, `Context ${i + 1} de ${f.titol}`)).join('')}</div>
    <div class="items" hidden data-pane="items">${f.items.map((g) => itemCb(g, f)).join('')}</div>
    <div class="foot">${boto('carret-act', '+ Activitat sencera', `data-id="${f.id}"`, 'p')}${boto('copia-img', 'Copia el context', `data-img="${f.ctx[0] ?? ''}"`)}</div></article>`
}

export const targeta = (f: Fitxa): string => (f.tipus === 'pau' ? fitxaPau(f) : fitxaCb(f))

/** Filtres de l'esquerra: caselles amb recompte en viu + rang d'anys */
export function pintaFiltres(el: HTMLElement, fl: Filtres): void {
  const noms: Record<Faceta, string> = { coleccio: 'Col·lecció', bloc: 'Bloc', conv: 'Convocatòria' }
  const anys = Array.from({ length: anyMax - anyMin + 1 }, (_, i) => anyMax - i)
  const opts = (sel: number) => anys.map((a) => `<option value="${a}" ${a === sel ? 'selected' : ''}>${a}</option>`).join('')
  el.innerHTML = FACETES.map((k) => `<div><h3>${noms[k]}</h3>${recomptes(fl, k).map(([v, n]) =>
    `<label class="chk"><input type="checkbox" data-faceta="${k}" value="${esc(v)}" ${fl[k].has(v) ? 'checked' : ''}> ${esc(v)}<span class="n">${n}</span></label>`).join('')}</div>`).join('') +
    `<div><h3>Anys</h3><div class="range"><select data-any="des" aria-label="Des de">${opts(fl.des)}</select><span>–</span><select data-any="fins" aria-label="Fins a">${opts(fl.fins)}</select></div></div>
     <button type="button" class="neteja" data-accio="neteja">Neteja els filtres</button>`
}

/** Fitxa A4: cada entrada del carret amb el seu context (només si canvia) */
export function pintaFitxa(el: HTMLElement, ambSolucions: boolean): number {
  let ctxAnterior = ''
  const trossos = llista().flatMap((id, i) => {
    const u = unitat(id)
    if (!u) return []
    if ('grup' in u) {
      const c = u.grup.ctx && u.grup.ctx !== ctxAnterior ? `<img class="fi" src="${BASE}${u.grup.ctx}" alt="Context">` : ''
      ctxAnterior = u.grup.ctx ?? ctxAnterior
      const cl = ambSolucions ? `<p class="fclau">Clau: ${u.grup.claus.map((k) => `${k.sub ? u.grup.num + '.' + k.sub + ' ' : ''}<b>${esc(k.clau)}</b>`).join(' · ')}</p>` : ''
      const primer = c || `<img class="fi" src="${BASE}${u.grup.img}" alt="Ítem ${u.grup.num}">`
      const resta = c ? `<img class="fi" src="${BASE}${u.grup.img}" alt="Ítem ${u.grup.num}">` : ''
      return [`<li class="fex"><div class="blk"><p class="fn">${i + 1}. ${esc(u.fitxa.titol)}</p>${primer}</div>${resta}${cl}<p class="ffont">${u.fitxa.coleccio} ${u.fitxa.any} · ${u.fitxa.prova}</p></li>`]
    }
    ctxAnterior = ''
    const s = ambSolucions && u.fitxa.sol_img ? `<img class="fi sol" src="${BASE}${u.fitxa.sol_img}" alt="Solució">` : ''
    return [`<li class="fex"><div class="blk"><p class="fn">${i + 1}. ${esc(u.fitxa.tema ?? '')}</p><img class="fi" src="${BASE}${u.fitxa.img}" alt="Enunciat ${i + 1}"></div>${s}<p class="ffont">${u.fitxa.coleccio} ${u.fitxa.any} ${u.fitxa.conv} · ${u.fitxa.prova} · P${u.fitxa.num}</p></li>`]
  })
  el.innerHTML = trossos.length ? `<ol>${trossos.join('')}</ol>` : '<p class="empty">La fitxa és buida: afegeix-hi preguntes des del cercador.</p>'
  return trossos.length
}
