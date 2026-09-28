/** Entitat Exercici (esquema de la spec, proves.json) */
export interface Exercici {
  id: string
  etapa: 'pau_bat' | 'cb_4eso' | 'cb_2eso'
  materia: 'mat2' | 'mat_socials' | 'cb_mat' | 'cb_cientifico_tec'
  any: number
  convocatoria: 'juny' | 'setembre' | 'diagnostica'
  serie_o_model: number | null
  numero_pregunta: number
  enunciat_text: string
  solucio_text: string | null
  puntuacio_max: number | null
  enunciat_img: string | null
  solucio_img: string | null
  bloc?: string
  tema?: string
  context_text?: string
  context_img?: string | null
  origen?: string
}

export interface Facet {
  key: 'etapa' | 'materia' | 'convocatoria' | 'any'
  label: string
  opcions: { valor: string; label: string; comptador: number }[]
}

export const ETIQUETA: Record<string, string> = {
  pau_bat: 'PAU · 2n Batx',
  cb_4eso: 'CCBB · 4t ESO',
  cb_2eso: 'CCBB · 2n ESO',
  mat2: 'Matemàtiques II',
  mat_socials: 'Matemàtiques CCSS',
  cb_mat: 'Matemàtiques',
  cb_cientifico_tec: 'Ciència i tecnologia',
  juny: 'Juny',
  setembre: 'Setembre',
  diagnostica: 'Diagnòstica',
}
