# 📐 Banc de proves oficials

Cercador web de **preguntes oficials de Catalunya** — PAU (2n de Batxillerat, Matemàtiques II) i Competències Bàsiques (4t i 2n d'ESO, Matemàtiques i Ciència i tecnologia) — amb les captures originals a 200 DPI, solucions oficials, còpia al porta-retalls amb un clic i generador de **fitxes d'activitats imprimibles en A4**.

> 🔗 Demo: `https://adriasantacreu.github.io/banc-proves-oficials/`
> 100% estàtic: tot corre al navegador, sense backend ni costos.

## Per a docents

| Acció | Com |
|---|---|
| **Cercar preguntes** | Escriu al cercador («matriu», «probabilitat», «recta tangent»…). La cerca és instantània i **ignora accents i majúscules**. |
| **Filtrar** | Per etapa (PAU / CCBB 4t / CCBB 2n), matèria, convocatòria i any, amb recompte en viu. |
| **Veure la solució** | Botó «Veure solució i criteris» a cada targeta: mostra la captura oficial de la resolució o la resposta correcta. |
| **Copiar la pregunta** | Botó «Copia imatge»: enganxa-la directament (`Ctrl+V`) a Word, Google Docs, Canva o LaTeX. Si el navegador bloqueja el porta-retalls, ofereix descarregar-la. |
| **Fer una fitxa** | «✚ Afegeix a la fitxa» a les preguntes que vulguis → clica 🧺 Fitxa → «Genera fitxa imprimible» → omple títol/curs/data/nom → «Imprimeix / Desa com a PDF» (`Ctrl+P`). Cap enunciat no queda partit entre pàgines. |

Les captures provenen dels PDF oficials de la Generalitat de Catalunya (PAU, compendi *Pautec*; i proves d'Avaluació de Diagnòstic / Competències Bàsiques) i es publiquen amb finalitats docents.

## Per a desenvolupadors

```bash
npm install        # dependències (Vite 8, TypeScript, MiniSearch, fonts fontsource)
npm run dev        # servidor de desenvolupament a /banc-proves-oficials/
npm run build      # compila a dist/ (valida tipus abans)
npm run preview    # serveix dist/ en local
```

### Arquitectura

- **Front-end**: Vite + TypeScript pur (sense frameworks ni Tailwind), estil B «quadern» (`src/styles/estils.css`, còpia de `_shared/estils/`) + `app.css`. Cerca amb MiniSearch (prefix, difusa, sense accents).
- **Dades** (només lectura de les dues BD, l'export no retalla res): `public/data/index.json` (fitxes sense text, ~580 KB) + `public/data/text.json` (corpus de cerca, ~1,9 MB, es carrega després del primer pintat) + `public/crops/{pau,cb}` (WebP *lossless*, ~99 MB).
- **Contingut**: 1005 exercicis PAU (Mat II 528, Mat CCSS 477), 77 activitats CCBB amb 627 ítems, 2526 imatges.
- **Export** (`scripts/export_dades.py`): llegeix `pau_catalog.db` i `cb_catalog.db`, converteix a WebP i s'atura si els recomptes, els ids o les imatges no quadren.

```bash
/mnt/data/workspace/.venv/bin/python scripts/export_dades.py   # regenera dades i valida (0 errors = OK)
```

### Qualitat

Lighthouse (servidor amb gzip): escriptori 98 / 100 / 100 / 100, mòbil 87 / 100 / 100 / 100 (rendiment, accessibilitat, bones pràctiques, SEO); CLS 0. El límit del mòbil és el temps de bloqueig (~490 ms) de construir l'índex de cerca.

### Desplegament

GitHub Actions (`.github/workflows/deploy.yml`) compila i publica automàticament a GitHub Pages cada *push* a `main`. Cal tenir Pages actiu amb origen *GitHub Actions* (Settings → Pages).

## Crèdits

Fet per [Adrià Santacreu](https://adriasantacreu.github.io) · projecte personal. Formularis autocorregibles de Competències Bàsiques: [carpeta de Drive](https://drive.google.com/drive/folders/1J-LcDfdiySsMW4sWm-beSx4uvzT3odDm). Proves oficials del [Departament d'Educació i Formació Professional](https://educacio.gencat.cat) i de la [Generalitat de Catalunya](https://gencat.cat).
