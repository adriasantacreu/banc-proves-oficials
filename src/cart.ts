/** Carret de preguntes per generar la fitxa (US4): persistència a localStorage */
const CLAU = 'banc-proves-carret'

export type Ordenacio = { id: string; moure: (offset: number) => void; eliminar: () => void }

function llegeix(): string[] {
  try {
    const d = JSON.parse(localStorage.getItem(CLAU) ?? '[]')
    return Array.isArray(d) ? d.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

let carret: string[] = llegeix()

function desa(): void {
  localStorage.setItem(CLAU, JSON.stringify(carret))
  window.dispatchEvent(new CustomEvent('carret:canvi'))
}

export function llista(): string[] {
  return [...carret]
}

export function hiEs(id: string): boolean {
  return carret.includes(id)
}

export function afegir(id: string): void {
  if (!hiEs(id)) {
    carret.push(id)
    desa()
  }
}

export function eliminar(id: string): void {
  carret = carret.filter((x) => x !== id)
  desa()
}

export function toggle(id: string): void {
  hiEs(id) ? eliminar(id) : afegir(id)
}

export function moure(id: string, offset: number): void {
  const i = carret.indexOf(id)
  const j = i + offset
  if (i === -1 || j < 0 || j >= carret.length) return
  ;[carret[i], carret[j]] = [carret[j], carret[i]]
  desa()
}

export function buidar(): void {
  carret = []
  desa()
}
