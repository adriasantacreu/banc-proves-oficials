# Pla d'implementació: Cercador web del Banc de proves oficials

**Carpeta**: `specs/001-cercador-web-banc-proves` | **Data**: 2026-09-28 | **Especificació**: [spec.md](spec.md)

**Estat**: llest per a implementació

## Resum

Construir una aplicació web estàtica de consulta i extracció de preguntes d'exàmens oficials de Catalunya (PAU 2n Batxillerat i Competències Bàsiques 4t i 2n d'ESO). L'aplicació s'allotja a GitHub Pages (`adriasantacreu.github.io/banc-proves-oficials/`), amb cerca instantània client-side (MiniSearch), captures netes a 200 DPI retallades dels PDFs oficials, visualització de criteris i solucions, còpia al porta-retalls en un clic, carret de preguntes per generar fitxes d'activitats llestes per imprimir en A4 (`@media print`), i integració documentada al portafoli personal (`adriasantacreu.github.io`).

## Context tècnic

**Llenguatge / Framework**: TypeScript + Vite + Tailwind CSS (o Preact/Vanilla per a bundle mínim < 150 KB gzipped)

**Pipeline de dades**: Script Python d'extracció i exportació (`export_catalog.py`) que llegeix `pau_catalog.db` i les dades de `gencat-cb-forms`, genera `proves.json` optimitzat i copia les captures a `public/crops/`

**Cercador**: `minisearch` (indexació en memòria al navegador, < 10 ms de resposta, insensible a accents, majúscules o caràcters especials)

**Emmagatzematge**: Estàtic pur (fitxers WebP/PNG + JSON pre-generat)

**Desplegament**: GitHub Actions (`.github/workflows/deploy.yml`) a GitHub Pages

**Portafoli**: Entrada Markdown a `projects/portafoli-github/adriasantacreu.github.io/src/content/projects/banc-proves-oficials/` (i18n: ca, es, en)

**Rendiment**: Càrrega inicial < 1,5 s, cerca instantània < 50 ms

**Restriccions**: 100% estàtic, zero backend ni càrrega al Capiserver, imatges a 200 DPI fons blanc net

## Comprovació de la constitució

| Principi | Compleix? | Com |
|---|---|---|
| I. 100% estàtic | ✅ | Tot corre al navegador a GitHub Pages; zero crides a servidors privats |
| II. Qualitat 200 DPI | ✅ | Captures d'alta resolució originals procedents de `pau-catalog` i `gencat-cb-forms` |
| III. Eines docents | ✅ | Cerca instantània, desplegament de solucions, còpia al porta-retalls i carret per imprimir en A4 |
| IV. Obertura i portafoli | ✅ | Repositori públic a GitHub i cas d'estudi documentat al portafoli de l'Adrià |
| V. Desplegament CI/CD | ✅ | GitHub Actions automatitzat amb `actions/deploy-pages` |

## Decisions d'arquitectura

| # | Decisió | Motiu |
|---|---|---|
| D1 | **Vite + Tailwind + TypeScript pur (sense frameworks pesants)** | Aplicació súper reactiva, bundle mínim (<150 KB), zero dependències de runtime, construcció en segons. |
| D2 | **MiniSearch del costat del client** | Molt ràpid (<10 ms per consulta de ~1000 ítems), suport nadiu de prefixos i normalització catalana d'accents. |
| D3 | **Imatges WebP/PNG a 200 DPI amb càrrega mandrosa (lazy loading)** | Lectura nítida de fórmules matemàtiques i gràfics, sense penalitzar la transferència inicial. |
| D4 | **Impressió via `@media print` nativa** | No cal compilar LaTeX al navegador ni al servidor: un botó obre el diàleg `Ctrl+P` amb A4 paginat netament (`page-break-inside: avoid`). |
| D5 | **Repositori GitHub independent (`adriasantacreu/banc-proves-oficials`)** | Desacoblat del workspace privat, públic per a la comunitat educativa i desplegable a `adriasantacreu.github.io/banc-proves-oficials/`. |

## Estructura del projecte

```text
projects/banc-proves-oficials/
├── .github/workflows/deploy.yml   # Desplegament automàtic a GitHub Pages
├── .specify/                      # Metodologia Spec Kit
├── specs/001-cercador-web-banc-proves/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── scripts/
│   └── export_catalog.py          # Extracció i optimització de captures i JSON
├── public/
│   ├── crops/                     # Imatges 200 DPI dels enunciats i solucions
│   └── data/                      # proves.json (índex d'exercicis)
├── src/
│   ├── main.ts                       # Punt d'entrada de l'aplicació
│   ├── search.ts                     # Configuració de MiniSearch
│   ├── cart.ts                       # Gestió del carret de preguntes (localStorage)
│   ├── print.ts                      # Vista i formatació de la fitxa A4
│   └── styles/
│       └── app.css                   # Tailwind + estils d'impressió @media print
├── index.html                      # Base de l'app (arrel del projecte, convenció Vite)
├── package.json
├── vite.config.ts
└── README.md
```
