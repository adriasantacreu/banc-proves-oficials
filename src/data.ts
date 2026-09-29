/** Càrrega de l'índex, cerca amb MiniSearch (prefixos, sense accents) i filtres amb recompte en viu */
import MiniSearch from 'minisearch'
import type { Fitxa, FitxaCb, FitxaPau, Unitat } from './types'

export const BASE: string = import.meta.env.BASE_URL
export const normalitza = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export interface Filtres { q: string; coleccio: Set<string>; bloc: Set<string>; conv: Set<string>; des: number; fins: number }
export const FACETES = ['coleccio', 'bloc', 'conv'] as const
export type Faceta = (typeof FACETES)[number]

let fitxes: Fitxa[] = []
let indexat = false
export const cercaLlesta = (): boolean => indexat
let mini: MiniSearch<Fitxa>
export let dim: Record<string, [number, number]> = {}
export let llest: Promise<void> = Promise.resolve()
const unitats = new Map<string, Unitat>()
export let anyMin = 0
export let anyMax = 0

export async function carrega(): Promise<Fitxa[]> {
  const res = await fetch(`${BASE}data/index.json`)
  if (!res.ok) throw new Error(`index.json no disponible (${res.status})`)
  const dades = (await res.json()) as { fitxes: Fitxa[]; dim: typeof dim }
  fitxes = dades.fitxes
  dim = dades.dim
  anyMin = Math.min(...fitxes.map((f) => f.any))
  anyMax = Math.max(...fitxes.map((f) => f.any))
  for (const f of fitxes) {
    if (f.tipus === 'pau') unitats.set(f.id, { fitxa: f })
    else for (const grup of f.items) unitats.set(grup.id, { fitxa: f, grup })
  }
  mini = new MiniSearch<Fitxa>({
    fields: ['text', 'sol_text', 'items_text', 'titol', 'descripcio', 'tema', 'bloc', 'id'],
    storeFields: [],
    extractField: (d, camp) => String((d as unknown as Record<string, unknown>)[camp] ?? ''),
    processTerm: (t) => (t.length > 1 ? normalitza(t) : null),
  })
  // El text de cerca es baixa després del primer pintat i s'indexa a trossos, sense bloquejar la interfície
  llest = fetch(`${BASE}data/text.json`).then((r) => r.json() as Promise<Record<string, [string, string, string]>>).then((tx) => {
    for (const f of fitxes) [f.text, (f as FitxaPau).sol_text, (f as FitxaCb).items_text] = tx[f.id] ?? ['', '', '']
    return mini.addAllAsync(fitxes, { chunkSize: 40 })
  }).then(() => { indexat = true })
  return fitxes
}

export const unitat = (id: string): Unitat | undefined => unitats.get(id)
export const fitxaPerId = (id: string): Fitxa | undefined => fitxes.find((f) => f.id === id)
export const totalFitxes = (): number => fitxes.length

export function cercaText(q: string): Fitxa[] {
  if (!q.trim() || !indexat) return fitxes
  const ids = new Map(fitxes.map((f) => [f.id, f]))
  return mini.search(normalitza(q), { prefix: true, fuzzy: 0.15, combineWith: 'AND' })
    .map((r) => ids.get(String(r.id))!)
}

const passa = (f: Fitxa, fl: Filtres, salta?: Faceta | 'any'): boolean =>
  (salta === 'coleccio' || !fl.coleccio.size || fl.coleccio.has(f.coleccio)) &&
  (salta === 'bloc' || !fl.bloc.size || fl.bloc.has(f.bloc ?? '')) &&
  (salta === 'conv' || !fl.conv.size || fl.conv.has(f.conv)) &&
  (salta === 'any' || (f.any >= fl.des && f.any <= fl.fins))

export function resultats(fl: Filtres): Fitxa[] {
  return cercaText(fl.q).filter((f) => passa(f, fl))
}

/** Recompte de cada valor d'una faceta aplicant la cerca i tots els altres filtres */
export function recomptes(fl: Filtres, faceta: Faceta): [string, number][] {
  const m = new Map<string, number>()
  for (const f of cercaText(fl.q)) {
    if (!passa(f, fl, faceta)) continue
    const v = faceta === 'coleccio' ? f.coleccio : faceta === 'bloc' ? f.bloc ?? '' : f.conv
    if (v) m.set(v, (m.get(v) ?? 0) + 1)
  }
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ca'))
}

export const filtresBuits = (): Filtres => ({ q: '', coleccio: new Set(), bloc: new Set(), conv: new Set(), des: anyMin, fins: anyMax })
