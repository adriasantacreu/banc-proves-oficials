/** Esquema de public/data/index.json (l'escriu scripts/export_dades.py) */
export interface Clau { id: string; sub: string | null; clau: string; tipus: string }
export interface Grup { id: string; num: number; punts: number; text: string; img: string; ctx: string | null; claus: Clau[] }
interface Base {
  id: string; coleccio: string; materia: string; any: number; conv: string; prova: string; num: number
  punts: number | null; bloc: string | null; tema: string | null; text: string
}
export interface FitxaPau extends Base { tipus: 'pau'; sol_text: string; img: string; sol_img: string | null }
export interface FitxaCb extends Base {
  tipus: 'cb'; titol: string; descripcio: string; ctx: string[]; items: Grup[]; items_text: string
}
export type Fitxa = FitxaPau | FitxaCb
/** Unitat que es pot posar al carret: un exercici PAU o un ítem (grup) de CCBB */
export type Unitat = { fitxa: FitxaPau } | { fitxa: FitxaCb; grup: Grup }
