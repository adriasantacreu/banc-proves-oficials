---
description: "Llista de tasques del cercador web del Banc de proves oficials"
---

# Tasques: Cercador web del Banc de proves oficials

**Entrada**: [plan.md](plan.md) · [spec.md](spec.md)

**Format**: `[ID] [P?] [Història] Descripció` · `[P]` = es pot fer en paral·lel (fitxers independents).

---

## Fase 1: Esquelet i infraestructura del projecte (F1)

**Objectiu**: Configurar l'entorn de desenvolupament Vite + TypeScript + Tailwind CSS i validar el build estàtic.

- [x] T001 Inicialitzar `package.json` amb Vite, TypeScript i Tailwind CSS a `projects/banc-proves-oficials/`
- [x] T002 [P] Configurar `vite.config.ts` amb base `/banc-proves-oficials/` per a GitHub Pages
- [x] T003 [P] Configurar Tailwind i `src/styles/app.css` amb suport per a components i `@media print` (v4: config CSS-first a `app.css` + `tailwind.config.js` mínim)
- [x] T004 [P] Instal·lar `minisearch` per al cercador del client
- [x] T005 Crear `index.html` base amb capçalera, cerca, filtres i contenidor de resultats (a l'arrel del projecte, convenció Vite)

**Punt de control**: `npm run build` genera la carpeta `dist/` sense errors. ✅ (2026-09-28)

---

## Fase 2: Pipeline d'exportació de dades i captures (F2)

**Objectiu**: Extreure els enunciats, solucions i imatges 200 DPI de `pau-catalog` i `gencat-cb-forms` en un catàleg unificat `public/data/proves.json` i `public/crops/`.

- [x] T006 Crear script `scripts/export_catalog.py` que llegeix la base de dades SQLite `pau_catalog.db` (163 exercicis PAU; el README de pau-catalog parla de 189, però la DB en té 163)
- [x] T007 Incorporar al script l'extracció de les proves de Competències Bàsiques (4t ESO i 2n ESO) des de `gencat-cb-forms` / `docencia/materials/competencies_basiques/` (627 ítems; fallback OCR tesseract pels PDF amb CMap trencat)
- [x] T008 [P] Optimització de captures: copiar/convertir les imatges a `public/crops/` amb noms unificats i mida comprimida sense pèrdua de nitidesa (200 DPI, WebP lossless)
- [x] T009 Generar el fitxer d'índex estàtic `public/data/proves.json` amb l'esquema d'entitat definit a la spec (790 exercicis: 163 PAU + 413 CB 4t + 214 CB 2n)
- [x] T010 Validar que el JSON generat conté tots els camps requerits i que totes les rutes d'imatge existeixen (`--check`; 0 errors; 13 PAU d'anys vells sense captura, cas previst a la spec)

**Punt de control**: `public/data/proves.json` llest i imatges presents a `public/crops/`. ✅ (2026-09-28, 46,7 MB de WebP)

---

## Fase 3: Motor de cerca i interfície de targetes (F3 · US1 & US2)

**Objectiu**: Carregar el catàleg, configurar la cerca instantània amb MiniSearch i mostrar les preguntes i solucions oficials.

- [ ] T011 [US1] `src/search.ts`: Carregar `proves.json`, inicialitzar MiniSearch amb cerca de prefixos i normalització catalana d'accents
- [ ] T012 [US1] `src/ui.ts`: Renderitzar les targetes d'exercici amb insígnies d'etapa (PAU / CCBB), matèria, any, convocatòria i punts
- [ ] T013 [US1] Implementar els filtres visuals per etapa, matèria i any amb recompte de resultats en viu
- [ ] T014 [US2] `src/solution.ts`: Afegir botó desplegable per veure la solució oficial i criteris de correcció a cada targeta
- [ ] T015 [US1] Implementar estat buit quan no hi ha resultats amb suggeriments de termes

**Punt de control**: Es pot cercar "matriu" o "probabilitat" i veure instantàniament les captures i desplegar solucions.

---

## Fase 4: Eines docents d'un clic (F4 · US3 & US4)

**Objectiu**: Facilitar la còpia d'imatges al porta-retalls i la gestió del carret de preguntes.

- [ ] T016 [US3] `src/clipboard.ts`: Implementar botó "Copia imatge" usant `navigator.clipboard.write` amb Blob PNG i feedback visual temporal ("Copiat!")
- [ ] T017 [US3] Afegir alternativa ("Descarrega imatge") si el navegador bloqueja el permís del porta-retalls
- [ ] T018 [US4] `src/cart.ts`: Implementar lògica de carret (afegir/eliminar exercici, persistència a `localStorage`, comptador flotant)
- [ ] T019 [US4] Crear el panell lateral o modal del carret per revisar les preguntes seleccionades i reordenar-les

**Punt de control**: Clicar "Copia imatge" permet enganxar directament a un document extern (`Ctrl+V`), i el carret guarda les seleccions.

---

## Fase 5: Generació de fitxa i maquetació d'impressió (F5 · US4)

**Objectiu**: Mode fitxa imprimible neta en A4 (`@media print`) llesta per generar PDF o imprimir directament.

- [ ] T020 [US4] `src/print.ts`: Generar la vista de fitxa A4 a partir del contingut del carret
- [ ] T021 [US4] Dissenyar estils `@media print` a `src/styles/app.css`: ocultar barres de navegació, capçalera editable (Títol, Curs, Data, Nom de l'alumne), i numeració consecutiva dels exercicis
- [ ] T022 [US4] Afegir regles anti-tall de pàgina (`page-break-inside: avoid`) perquè cap enunciat quedi partit entre dues pàgines
- [ ] T023 [US4] Botó per llançar el diàleg d'impressió del navegador (`window.print()`) i botó per buidar la fitxa

**Punt de control**: La fitxa generada s'imprimeix de manera impecable des de `Ctrl+P`.

---

## Fase 6: Desplegament CI/CD a GitHub Pages (F6)

**Objectiu**: Automatitzar la compilació i publicació a GitHub Pages.

- [ ] T024 Crear `.github/workflows/deploy.yml` per compilar el projecte Vite i desplegar a GitHub Pages amb `actions/deploy-pages`
- [ ] T025 Crear `README.md` complet del repositori amb instruccions d'ús per a docents i desenvolupadors
- [ ] T026 Comprovar que la ruta base i els enllaços funcionen tant en local com en la subruta `/banc-proves-oficials/`

**Punt de control**: Workflow de GitHub Actions vàlid i llest per activar a GitHub.

---

## Fase 7: Integració i documentació al portafoli (F7 · US5)

**Objectiu**: Publicar l'article del projecte i enllaçar-lo des dels recursos docents al portafoli personal.

- [ ] T027 Crear article a `projects/portafoli-github/adriasantacreu.github.io/src/content/projects/banc-proves-oficials/` (català, castellà, anglès)
- [ ] T028 Documentar l'enginyeria documental del projecte (captures a 200 DPI amb OpenCV, indexació FTS client-side)
- [ ] T029 Afegir targeta destacada a la secció de "Recursos docents" del portafoli amb accés directe a la demo i al codi font

**Punt de control**: Portafoli compilat amb èxit (`npm run build`) amb el nou projecte visible.
