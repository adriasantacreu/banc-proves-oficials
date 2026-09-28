# Feature Specification: Cercador web del Banc de proves oficials

**Feature Branch**: `001-cercador-web-banc-proves`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Cercador web de captures de proves oficials de Catalunya (PAU i CCBB) amb cerca per paraules clau, solucions oficials, còpia al porta-retalls i generador de fitxes per imprimir, 100% estàtic a GitHub Pages i integrat al portafoli."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cerca ràpida de preguntes per paraules clau i filtres (Priority: P1)

Com a docent (de matemàtiques o d'altres matèries), vull cercar conceptes clau (ex: "matriu invertible", "pitagores", "probabilitat condicionada", "recta tangent") i veure a l'instant les captures oficials de les preguntes d'exàmens reals de Catalunya que contenen aquest text, per tal de preparar ràpidament exercicis per a la classe.

**Why this priority**: És el valor central del projecte. Sense un cercador instantani i visualització de les captures oficials retallades, l'eina no té sentit.

**Independent Test**: Es pot provar obrint la web estàtica, teclejant "matriu" al camp de cerca i comprovant que en menys de 100 ms apareixen les targetes amb les captures de les preguntes oficials de la PAU i CCBB corresponents.

**Acceptance Scenarios**:

1. **Given** l'usuari entra a la pàgina principal, **When** tecleja un terme de cerca (ex: "extrem relatiu"), **Then** la llista es filtra automàticament mostrant només els exercicis que contenen aquest text o conceptes afins.
2. **Given** l'usuari vol acotar la cerca, **When** selecciona un filtre d'etapa (ex: "PAU - 2n Batxillerat") o d'any (ex: "2024"), **Then** els resultats es restringeixen a la combinació de criteris seleccionada.
3. **Given** una cerca sense coincidències, **When** l'usuari tecleja un text inexistent, **Then** es mostra un missatge amable ("No s'han trobat preguntes") amb suggeriments de cerca.

---

### User Story 2 - Consulta de la solució i criteris oficials de correcció (Priority: P1)

Com a docent, vull poder desplegar la solució oficial i les pautes de correcció de qualsevol exercici trobat, per verificar ràpidament el procediment esperat i la puntuació assignada sense haver de descarregar el PDF complet de solucions.

**Why this priority**: Les proves oficials van acompanyades de criteris específics que els docents necessiten consultar per avaluar correctament o guiar l'alumnat.

**Independent Test**: Clicar a "Veure solució i criteris" a qualsevol targeta d'exercici i verificar que es desplega la captura o text oficial dels criteris de correcció.

**Acceptance Scenarios**:

1. **Given** un exercici visible a la llista de resultats, **When** l'usuari fa clic a "Veure solució", **Then** es desplega un panell amb la captura de la solució oficial i el desglossament de punts.
2. **Given** la solució desplegada, **When** l'usuari torna a fer clic, **Then** el panell es plega netament.

---

### User Story 3 - Còpia d'un clic de la captura al porta-retalls (Priority: P2)

Com a docent que prepara un document al seu ordinador (Word, LibreOffice, Google Docs, Canva o LaTeX), vull fer clic a "Copia imatge" i tenir la captura de la pregunta immediatament al porta-retalls per enganxar-la directament (`Ctrl+V`) al meu fitxer de treball.

**Why this priority**: Estalvia la fricció manual de fer captures de pantalla o desar fitxers PNG al disc per després arrossegar-los.

**Independent Test**: Clicar al botó "Copia imatge", anar a un document extern i prémer `Ctrl+V`; la imatge d'alta resolució s'hi enganxa directament.

**Acceptance Scenarios**:

1. **Given** una targeta d'exercici, **When** l'usuari clica "Copia imatge", **Then** la imatge de l'enunciat es carrega al porta-retalls del sistema (`navigator.clipboard.write`) i el botó mostra feedback visual ("Copiat!").
2. **Given** un navegador que restringeixi el permís de porta-retalls, **When** falla la còpia directa, **Then** el sistema ofereix com a alternativa descarregar la imatge directament ("Descarrega imatge").

---

### User Story 4 - Carret de preguntes i generació de fitxa per imprimir (Priority: P2)

Com a docent, vull anar seleccionant diversos exercicis de diferents anys/convocatòries afegint-los a un "carret de preguntes", per després generar una fitxa neta d'activitats llesta per imprimir o desar com a PDF (`Ctrl+P`).

**Why this priority**: Permet compondre un recull d'exercicis personalitzat per a una sessió de repàs o prova sense necessitat de tenir programari addicional.

**Independent Test**: Afegir 3 preguntes al carret, prémer "Genera fitxa imprimible" i comprovar la vista d'impressió (`@media print`): capçalera amb títol configurable, exercicis numerats de l'1 al 3 amb la seva captura i referència d'origen, i sense cap element de navegació web.

**Acceptance Scenarios**:

1. **Given** la llista de resultats, **When** l'usuari clica "Afegeix a la fitxa", **Then** el comptador del carret s'incrementa i l'exercici queda marcat com a seleccionat.
2. **Given** el carret amb preguntes, **When** l'usuari obre el carret, **Then** pot reordenar o eliminar preguntes de la llista.
3. **Given** la vista de fitxa, **When** l'usuari obre el diàleg d'impressió del navegador (`Ctrl+P`), **Then** la pàgina es maqueta en format A4 net, amb marges adequats i talls de pàgina correctes (`page-break-inside: avoid`).

---

### User Story 5 - Integració i documentació al portafoli personal (Priority: P3)

Com a visitant o col·lega que consulta el portafoli docent de l'Adrià (`adriasantacreu.github.io`), vull trobar un article explicatiu del projecte que n'expliqui la motivació i els reptes tècnics d'enginyeria documental (processament de PDF, retall d'imatges amb OpenCV, cerca FTS estàtica), així com un enllaç directe a l'eina sota la secció de recursos docents.

**Why this priority**: Compleix el requisit d'obertura del projecte, marca personal i transferència de coneixement educatiu.

**Independent Test**: Navegar a `adriasantacreu.github.io/recursos` (o secció corresponent) i a l'article del projecte, comprovant que els enllaços a la demo de GitHub Pages i al repo públic funcionen.

**Acceptance Scenarios**:

1. **Given** el portafoli web, **When** es visita la secció de projectes, **Then** apareix la fitxa del projecte `Banc de proves oficials` amb descripció, tags i enllaços (`demoUrl` i `repoUrl`).
2. **Given** la pàgina de l'eina a GitHub Pages, **When** es mira el peu de pàgina o capçalera, **Then** hi ha un enllaç de retorn al portafoli de l'autor.

---

### Edge Cases

- **Navegació sense connexió persistent**: El catàleg JSON i el motor de cerca han de funcionar localment un cop carregada la pàgina gràcies a l'arquitectura 100% estàtica.
- **Consultes amb caràcters especials o accents**: La cerca ha de ser insensible a accents, majúscules/minúscules i signes de puntuació (ex: "calcul" ha de trobar "càlcul").
- **Mòbils i tauletes**: La interfície ha de ser responsive, permetent cercar i consultar preguntes en dispositius mòbils amb previsualització adaptada de les captures.
- **Imatges d'enunciat molt altes o amples**: La maquetació ha d'assegurar que les captures mantenen la seva relació d'aspecte i llegibilitat sense desbordar la pantalla.
- **Falta de solució oficial en alguna prova antiga**: Si un exercici no té solució digitalitzada, la targeta ho indicarà clarament en comptes de donar error.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: L'aplicació MUST ser 100% estàtica, allotjada a GitHub Pages sota la ruta `/banc-proves-oficials/`.
- **FR-002**: L'aplicació MUST incloure un cercador de text complet del costat del client (sense peticions a cap API backend).
- **FR-003**: El cercador MUST permetre filtrar per etapa educativa (ex: `PAU`, `CCBB 4t ESO`, `CCBB 2n ESO`), matèria (ex: `Matemàtiques`, `Matemàtiques aplicades a les ciències socials`), any (des del 2015 fins a l'actualitat) i convocatòria (juny / setembre / incidències).
- **FR-004**: Cada pregunta MUST mostrar la seva captura oficial d'alta qualitat (200 DPI), la referència exacta (curs, any, convocatòria, sèrie/model, número de pregunta) i la puntuació assignada.
- **FR-005**: L'usuari MUST poder desplegar la solució oficial i criteris de correcció associats si estan disponibles.
- **FR-006**: L'usuari MUST poder copiar la captura de l'exercici al porta-retalls amb un sol clic (`navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])`).
- **FR-007**: L'usuari MUST poder afegir i treure preguntes d'un carret de fitxa.
- **FR-008**: La vista de fitxa MUST oferir un botó d'impressió que activi estils `@media print` específics per a paper A4, ocultant la UI interactiva i mostrant els exercicis numerats de forma impecable.
- **FR-009**: Les dades dels exercicis MUST generar-se prèviament en un fitxer JSON estàtic comprimit/optimitzat que contingui el text extret, metadades i rutes relatives de les imatges.
- **FR-010**: El projecte MUST disposar d'un GitHub Actions workflow que compili i desplegui automàticament el lloc web a GitHub Pages a cada commit a `main`.
- **FR-011**: El portafoli de l'Adrià (`projects/portafoli-github/adriasantacreu.github.io`) MUST incorporar l'article del projecte en els 3 idiomes (ca, es, en) i l'accés directe des dels recursos docents.

### Key Entities

- **Exercici**: Unitat fonamental d'avaluació.
  - `id`: Identificador únic (ex: `pau_mat2_2024_j_s1_p1`, `cb_4eso_2025_m_p3`).
  - `etapa`: `pau_bat` | `cb_4eso` | `cb_2eso`.
  - `materia`: `mat2` | `mat_socials` | `cb_mat` | `cb_cientifico_tec`.
  - `any`: Any acadèmic o de la prova (ex: 2024).
  - `convocatoria`: `juny`, `setembre`, `diagnostica`.
  - `serie_o_model`: Sèrie (1, 2, 4...) o model d'examen.
  - `numero_pregunta`: Número o lletra de la pregunta/problema.
  - `enunciat_text`: Text complet per a indexació de cerca.
  - `solucio_text`: Text de la pauta de correcció.
  - `puntuacio_max`: Puntuació màxima (ex: 2.5 punts).
  - `enunciat_img`: Ruta relativa de la captura de l'enunciat (WebP / PNG optimitzat).
  - `solucio_img`: Ruta relativa de la captura de la solució oficial.
- **CarretFitxa**: Col·lecció temporal d'exercicis seleccionats per l'usuari durant la sessió (guardat a `localStorage`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La càrrega inicial de la pàgina principal a GitHub Pages és inferior a 1,5 segons en connexions estàndard.
- **SC-002**: El temps de resposta de qualsevol cerca de text o canvi de filtre és inferior a 50 ms un cop descarregat l'índex.
- **SC-003**: El 100% de les captures d'enunciats i solucions tenen una resolució òptima de lectura (200 DPI) i fons blanc net sense marges sobrants.
- **SC-004**: La còpia al porta-retalls funciona amb un sol clic als navegadors moderns principals (Chrome, Firefox, Safari, Edge).
- **SC-005**: La impressió des del navegador genera un document A4 sense talls visuals d'enunciats a meitat de pàgina ni elements web sobrants.
- **SC-006**: Zero euros de cost d'infraestructura i zero càrrega al Capiserver (allotjament estàtic gratuït a GitHub Pages).

---

## Assumptions

- Les captures dels exercicis de la PAU i de CCBB ja han estat extretes o es generen fàcilment amb les eines del workspace (`pau-catalog`, `gencat-cb-forms`).
- Els usuaris disposen d'un navegador modern compatible amb JavaScript ES6, flexbox/grid i Clipboard API.
- Les proves oficials són documents públics de la Generalitat de Catalunya i del Departament d'Educació, de lliure consulta per a finalitats docents i formatives.
