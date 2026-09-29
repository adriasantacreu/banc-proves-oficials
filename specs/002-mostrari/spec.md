# Especificació 002: Mostrari de proves oficials

**Estat**: escrita 2026-09-29 (fase 5 del pla `docs/plans/2026-09-29_proves-oficials-refet.md`). **Pendent de validació de l'Adrià** (ha dit que validarà al final). Substitueix la 001, que queda com a històric.
**Font de dades**: només llegeix `pau_catalog.db` (Mat II + Mat CCSS, 1.005 exercicis) i `cb_catalog.db` (CCBB, 77 activitats / 627 ítems). No retalla res: si una captura és dolenta, es corregeix a la BD d'origen.
**Estil**: B · quadern (D5), via `_shared/estils/estils.css` (còpia dins `src/styles/`).

## Què és

Una base de dades consultable en HTML, 100 % estàtica (GitHub Pages), per cercar i reutilitzar preguntes oficials de PAU i Competències Bàsiques. No és una maqueta: cada botó fa el que diu.

## Històries d'usuari

### US1 — Cercar (P1)
Escric paraules clau i veig a l'instant les fitxes que les contenen (text de l'enunciat, solució, context, tema i bloc). Ignora accents i majúscules; admet prefixos.
- Cerca en < 100 ms sobre les ~1.100 fitxes.
- Sense resultats: missatge amb suggeriments.
- La cerca i els filtres es reflecteixen a la URL (`#q=matriu&etapa=PAU`) per poder compartir-ne el resultat.

### US2 — Filtrar (P1)
Filtres: **col·lecció** (PAU Mat II · PAU Mat CCSS · CCBB 4t ESO · CCBB 2n ESO), **matèria/bloc**, **convocatòria** i **rang d'anys** (des de / fins a). Cada opció mostra el recompte en viu.

### US3 — Veure la fitxa (P1)
- **PAU**: una fitxa per exercici, amb pestanyes *Enunciat* / *Solució i criteris* (captura oficial). Sense espais en blanc per a respostes.
- **CCBB**: una fitxa per **activitat**: el context (text/imatges de l'activitat) es veu, i sota cada ítem amb la seva captura i la clau oficial. Les sub-preguntes (6.1, 6.2…) comparteixen la captura del pare i es mostren un cop.
- Dades de referència a la capçalera: etapa, any, convocatòria, sèrie/prova, número, punts, bloc, tema, id.

### US4 — Reutilitzar (P1)
- **Copia imatge** (enunciat, solució o context) al porta-retalls; si el navegador ho bloqueja, la descarrega.
- **Carret / fitxa**: afegir exercicis PAU, ítems o activitats CB senceres; reordenar; imprimir en A4 sense partir cap captura (`Ctrl+P` / desar PDF), amb capçalera editable (títol, curs, data, nom). Opció de fitxa amb o sense solucions.
- **Copia la referència** (id + text) per a la IA o per a un dossier.

### US5 — Estat i accessibilitat (P2)
Mode clar/fosc segons el sistema; teclat i `focus` visibles; responsive des de 360 px; Lighthouse ≥ 90 (rendiment, accessibilitat, bones pràctiques, SEO).

## Requisits

- **FR-1** El build (`npm run build`) no necessita res de fora del repo: les dades exportades (`public/data/*.json`, `public/crops/**.webp`) es versionen.
- **FR-2** `scripts/export_dades.py` és l'únic pont amb les BD: valida que cada id existeix, que cada imatge referida existeix, i que els recomptes coincideixen amb els de les BD (1.005 / 627 / 77). Si no, falla.
- **FR-3** Cap fitxa mostra una captura amb la solució com a enunciat ni al revés (garantit per `pau check` / `cb check` a l'origen; l'export refusa exportar si els checks no són verds).
- **FR-4** Es carrega primer un índex lleuger (`index.json`: text i metadades) i les imatges van amb `loading="lazy"`; la pàgina inicial pesa < 1 MB sense imatges.
- **FR-5** Res de tercers a l'execució (sense analítica, sense CDN); tipografies autohostatjades (fitxers `woff2` al repo) o pila del sistema.
- **FR-6** Peu de pàgina amb l'origen (documents oficials de la Generalitat, ús docent) i enllaç al codi.

## Fora d'abast

Cap edició de dades des del web; cap compte d'usuari; cap descàrrega en bloc de les imatges; cap nova prova (només les 18 CCBB i les sèries PAU ja indexades).

## Criteris d'èxit (porta de la fase 5)

1. `npm run build` + `scripts/export_dades.py --check` verds.
2. Captures a escriptori (1280) i mòbil (390) de cinc cerques fixes: «matriu», «probabilitat», «percentatge», «energia», «recta tangent».
3. Lighthouse ≥ 90 a les quatre categories (escriptori).
4. Revisió visual de l'Adrià.
