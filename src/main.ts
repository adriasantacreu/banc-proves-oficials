// Punt d'entrada: de moment només valida que l'esquelet compili (la F3 en farà servir tot).
import './styles/app.css'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('#app no trobat a index.html')

console.info('Banc de proves oficials: esquelet carregat')
