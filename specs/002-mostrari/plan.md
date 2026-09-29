# Pla 002: Mostrari

**Stack**: Vite + TypeScript + MiniSearch (com la 001); **sense Tailwind**: l'estil és `estils.css` (B) + `app.css` propi. Motiu: la maqueta ja és CSS pla, el bundle és més petit i el Lighthouse més fàcil.

## Dades (`scripts/export_dades.py`)

| Sortida | Contingut |
|---|---|
| `public/data/index.json` | `{ fitxes: [...] }`: una fitxa per exercici PAU i una per activitat CB (amb `items[]`), amb tots els camps de cerca |
| `public/crops/pau/{id}_e.webp`, `_s.webp` | enunciat i solució PAU (WebP) |
| `public/crops/cb/{prova}/…webp` | captures d'ítem i de context CB |

- Fitxa PAU: `{tipus:'pau', id, coleccio:'PAU Mat II'|'PAU Mat CCSS', any, conv, serie, numero, punts, bloc, tema, text, sol_text, img, sol_img}`.
- Fitxa CB: `{tipus:'cb', id (activitat), coleccio:'CCBB 4t ESO'|'CCBB 2n ESO', materia, any, prova, titol, bloc, tema, ctx_text, ctx_imgs[], items:[{id, num, sub?, punts, clau, text, img}]}`; sub-preguntes agrupades per `pare`.
- El `context_img` de l'activitat i els altres contexts (cas de moltes intros) es porten tal com són a la BD.
- Comprovacions: `--check` reobre el JSON i comprova imatges, ids únics i recomptes contra les BD; a més crida `scripts/pau check` i `scripts/cb check`.

## Interfície (`src/`)

`main.ts` (estat + URL hash), `data.ts` (càrrega + MiniSearch + filtres), `render.ts` (fitxes PAU/CB, pestanyes), `cart.ts` + `print.ts` + `clipboard.ts` (es reaprofiten, adaptats als nous ids), `styles/estils.css` + `app.css`.

## Riscos

- **Pes**: PAU ~300 MB en PNG. Cal mesurar-ho en WebP; si passa de ~400 MB en total, WebP amb pèrdua mínima (q≥92) o eliminar del desplegament les solucions dels anys sense pauta.
- **Push públic**: la web actual (001) és en línia. No es fa push sense el vistiplau explícit de l'Adrià.
