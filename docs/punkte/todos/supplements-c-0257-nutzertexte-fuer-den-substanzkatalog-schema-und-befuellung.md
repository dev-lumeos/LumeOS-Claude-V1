---
nr: C-257
typ: befund
modul: supplements
schwere: niedrig
angelegt: 2026-08-23
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/spezifikation/substanz-katalog-nutzertexte.md"]
zahlen: null
---

# C-257 - Nutzertexte fuer den Substanzkatalog — Schema und Befuellung

## Befund

(neu 2026-08-23). Aus der Anforderung
  `docs/spezifikation/substanz-katalog-nutzertexte.md`.

  **Tom, 2026-08-23:** *„der will eine saubere beschreibung / fuer was
  ist es, erklaerend nicht wissenschaftlich / was wenn zuviel, zuwenig /
  all die normalen sachen wie man supplements normalen leuten
  praesentiert."*

  `[cmd]` **Kimi ist nicht verfuegbar — Codex uebernimmt die
  Recherche.**

  ### Der Befund

  `[cmd]` Von 290 sichtbaren Substanzen: Beschreibung 290, aber **alle
  sind Fachnotizen**; bei **125** ist `description_en` wortgleich mit
  `evidence.summary_en`. `guideline_dose` **0**, `usage_hint_en` **19**,
  Dosisbereich 83, Obergrenze 38. **Wofuer ist es** und **was bei zu
  wenig** haben **kein Feld**.

  ### Toms Entscheidungen, 2026-08-23

  | | |
  |---|---|
  | **A** Grad je Zweck | **ja** |
  | **B** Reihenfolge | **Supplements (154), dann Peptide (61), dann Enhanced (75)** |
  | **C** Umfang | **alle auf einmal** — *„hat die ganze nacht zeit"* |
  | **D** Dosisbereiche bei AAS/SARM | **ja, in der Entwicklungsphase** |
  | **E** die 276 verborgenen | **werden angereichert und eingeblendet** |
  | **F** Substanz oder Produkt | **Substanz** — Produktdaten kommen im Endausbau von den Anbietern |

  ### Zu A: es ist NICHT schon drin

  `[read]` Tom vermutete, die Zweck-Ebene sei vorhanden, nur anders
  benannt. `[cmd]` **Sie ist es nicht.**

  `[cmd]` `supplement_categories` (23) traegt **Stoffklassen, keine
  Zwecke**: `vitamine`, `botanicals`, `sarm`, `orale_aas`,
  `injizierbare_aas`, `nootropika`. Das ist *was es ist*, nicht *wofuer
  es gut ist*.

  `[cmd]` `supplement_tags` und `supplement_tag_definitions` sind
  **beide leer (0 Zeilen)**. Die Definitionstabelle traegt `tag_type`
  und `is_exclusion_relevant` — **Kennzeichnung wie „laktosefrei", kein
  Zweck**, und **keinen Grad**.

  `[read]` **Die Struktur ist aber nah genug**, dass keine neue Tabelle
  noetig ist: `supplement_tags` hat bereits `supplement_id`, `tag_code`
  und `confidence`. **Ein `evidence_grade` je Zeile plus ein
  `tag_type = 'zweck'` reicht** — damit traegt Kreatin `muskelaufbau: A`
  und `kognition: B` statt eines einzelnen Buchstabens.

  ### Nebenbefund

  `[cmd]` **`supplement_portions` existiert und ist leer** —
  `amount`, `unit`, `is_default`, an der Substanz. `[read]` **Damit ist
  meine Aussage in der Anforderung zu eng:** eine *Standardportion* je
  Substanz (5 g Kreatin) ist eine Substanzangabe und kollidiert nicht
  mit den Anbietern. Was diesen gehoert, ist die **Packungsgroesse und
  der Preis**, nicht die uebliche Portion. `[read]` **Die Anforderung ist
  an dieser Stelle zu korrigieren.**
