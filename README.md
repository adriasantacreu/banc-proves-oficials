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
npm install        # dependències (Vite 8, TypeScript, Tailwind 4, MiniSearch)
npm run dev        # servidor de desenvolupament a /banc-proves-oficials/
npm run build      # compila a dist/ (valida tipus abans)
npm run preview    # serveix dist/ en local
```

### Arquitectura

- **Front-end**: Vite + TypeScript pur (sense frameworks), Tailwind CSS v4, MiniSearch per a la cerca client-side amb normalització d'accents. Bundle < 15 kB gzip.
- **Dades**: `public/data/proves.json` (índex pre-generat) + `public/crops/` (captures WebP *lossless* a 200 DPI).
- **Pipeline** (`scripts/export_catalog.py`, Python + PyMuPDF/OpenCV): llegeix la base `pau_catalog.db` i el registre de `gencat-cb-forms`, retalla els enunciats i solucions dels PDF oficials (amb *fallback* OCR per als PDF amb mapes de caràcters trencats) i converteix tot a WebP.

```bash
/mnt/data/workspace/.venv/bin/python scripts/export_catalog.py           # regenera dades + captures
/mnt/data/workspace/.venv/bin/python scripts/export_catalog.py --check   # valida JSON i imatges
```

### Desplegament

GitHub Actions (`.github/workflows/deploy.yml`) compila i publica automàticament a GitHub Pages cada *push* a `main`. Cal tenir Pages actiu amb origen *GitHub Actions* (Settings → Pages).

## Crèdits

Fet per [Adrià Santacreu](https://adriasantacreu.github.io) · professor de matemàtiques i programació a l'Institut Escola Sant Pol de Mar. Proves oficials del [Departament d'Educació i Formació Professional](https://educacio.gencat.cat) i de la [Generalitat de Catalunya](https://gencat.cat).
