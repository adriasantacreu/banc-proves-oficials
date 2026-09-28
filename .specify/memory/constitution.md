# Constitució del Banc de proves oficials

Regles del workspace (`/mnt/data/workspace/AGENTS.md`) per sobre de tot: estil directe en català, títols en Sentence case, sense secrets ni dades sensibles. Aquest document defineix els principis específics del projecte `banc-proves-oficials`.

## Principis

### I. 100% estàtic i sense càrrega de servidor
L'aplicació és una web estàtica allotjada a GitHub Pages (`https://adriasantacreu.github.io/banc-proves-oficials/`). No depèn de cap backend ni servei intern (Capiserver) per funcionar. Tot el cercador i les accions s'executen al navegador del client de manera gratuïta, ràpida i resilient per a qualsevol docent.

### II. Qualitat visual docent i respecte als originals
Les preguntes i solucions es mostren mitjançant captures d'alta resolució (200 DPI retallades directament dels PDFs oficials del Departament d'Educació i de la Generalitat de Catalunya: PAU i Competències Bàsiques / Avaluacions Diagnòstiques). Els enunciats mantenen la tipografia i maquetació originals exactes.

### III. Eines àgils per al professorat
L'eina està pensada per estalviar temps a la preparació de classes i exàmens:
1. Cerca instantània de text complet (enunciats i criteris de correcció).
2. Filtres clars per etapa (Batxillerat PAU, ESO CCBB), matèria, any i convocatòria.
3. Còpia directa de la captura al porta-retalls amb un sol clic per enganxar a exàmens o apunts propis.
4. Carret de preguntes per compondre fitxes i imprimir-les de forma neta (`@media print` / Deseu com a PDF) sense dependre de LaTeX al navegador.

### IV. Documentació i obertura al portafoli
El repositori és públic (`adriasantacreu/banc-proves-oficials`). El projecte es documenta al portafoli de l'Adrià (`adriasantacreu.github.io`) amb un article d'enginyeria documental i un enllaç destacat a la secció de "Recursos docents".

### V. Desplegament automatitzat
Tot canvi a la branca `main` es desplega automàticament a GitHub Pages mitjançant una acció de GitHub Actions estàndard i optimitzada.

## Flux de treball

- Especificació i tasques amb Spec Kit: `specs/001-cercador-web-banc-proves/` (`spec.md` → `plan.md` → `tasks.md`).
- `tasks.md` és l'estat viu del desenvolupament.
- En acabar cada fita: commit al repo propi i fila a `logs/ACTIVITY.md` del workspace.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
