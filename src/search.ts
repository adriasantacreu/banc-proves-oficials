/** Motor de cerca client-side amb MiniSearch: prefixos + normalització catalana d'accents */
import MiniSearch, { type SearchResult } from 'minisearch'
import type { Exercici } from './types'

const BASE: string = import.meta.env.BASE_URL

/** Minuscula + treu diacrítics («càlcul» == «calcul») */
export const normalitza = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

let mini: MiniSearch<Exercici> | null = null
let index: Exercici[] = []

export async function carregaCatalog(): Promise<Exercici[]> {
  const res = await fetch(`${BASE}data/proves.json`)
  if (!res.ok) throw new Error(`proves.json no disponible (${res.status})`)
  const dades = (await res.json()) as { exercicis: Exercici[] }
  index = dades.exercicis

  mini = new MiniSearch<Exercici>({
    fields: ['enunciat_text', 'solucio_text', 'tema', 'bloc', 'context_text', 'origen'],
    storeFields: ['id'],
    processTerm: (t) => (t.length > 1 ? normalitza(t) : null),
  })
  mini.addAll(index)
  return index
}

/** Cerca per text; sense text retorna tot el catàleg (els filtres s'apliquen a part) */
export function cerca(query: string): Exercici[] {
  if (!query.trim()) return index
  const res: SearchResult[] = mini!.search(normalitza(query), { prefix: true, fuzzy: 0.2 })
  const perId = new Map(index.map((e) => [e.id, e]))
  return res.map((r) => perId.get(r.id as string)).filter((e): e is Exercici => !!e)
}

export function perId(id: string): Exercici | undefined {
  return index.find((e) => e.id === id)
}

export { BASE }
