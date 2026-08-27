---
nr: C-258
typ: messung
modul: supplements
schwere: mittel
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

# C-258 - Die Nutzertexte sind Schablonen — und 248 Substanzen fehlen ganz

## Befund

(neu 2026-08-23). Korrektur zu C-257.

  ### Der Befund

  `[cmd]` **867 FAQ-Zeilen, drei verschiedene Antworten** — jede exakt
  289-mal. Es sind keine Substanzfragen, sondern Erklaerungen ueber den
  Katalog: *„Nein. Der Eintrag erklaert den Bestand, die Beleglage und
  Grenzen."*

  `[cmd]` **289 Kurzbeschreibungen, 98 verschiedene Formulierungen** —
  sechs Schablonen mit eingesetztem Namen. 103-mal *„ist eine
  Supplement-Substanz mit eigener Beleglage und eigenen Grenzen"*,
  74-mal *„ist ein leistungs- oder hormonbezogener Wirkstoff"*.

  `[read]` **Der Fehler liegt in meinem Auftragstext.** Dort stand
  *„Nichts erfinden"* — gemeint waren **erfundene Zahlen**, gelesen
  wurde **ein Verbot, ueberhaupt Fachwissen hinzuschreiben.** Unter
  dieser Lesart war die Schablone die einzige zulaessige Antwort.

  `[read]` **Und meine Pruefung war blind.** Ich hatte Laengen- und
  Sperrwortpruefung verlangt — beides bestehen Schablonen muehelos.
  **Was gefehlt hat, ist die Zaehlung verschiedener Formulierungen.**
  Drei Antworten auf 867 Zeilen waeren sofort rot geworden.

  ### 248 verborgene Zeilen, und ein Teil davon sind Dubletten

  `[cmd]` **248 Zeilen ohne Inhalt, alle aus
  `f05_substance_candidate`** — 125 `supplement`, 102 `enhanced`,
  21 `peptide`.

  `[cmd]` **Ein Teil ist derselbe Stoff unter dem Handelsnamen:**
  Anavar → Oxandrolone (Grad D) · Anadrol → Oxymetholone (D) ·
  Dianabol → Methandienone (D) · Bacopa Monnieri → Bacopa monnieri
  standardized (B) · Ashwagandha → Ashwagandha KSM-66 (B).

  `[cmd]` **Die Aliasbruecke findet das nicht:** nur **17 der 248**
  haben einen Alias-Treffer auf einen sichtbaren Eintrag. *Dianabol*
  und *Methandienone* teilen kein Zeichen.

  **Tom, 2026-08-23:** *„genau die handelsnamen wie dianabol muessen in
  die aktiven mit rein."* — **Der recherchierte Eintrag traegt kuenftig
  beide Namen im Titel**, der Handelsname wird Alias, die `f05`-Zeile
  haengt per `parent_id` daran. Keine zweite sichtbare Zeile.

  ### Die 29 Unterformen sind aus dem Katalog gefallen

  `[cmd]` C-257 hat `im_katalog` um `parent_id IS NULL` erweitert —
  **das steht in keinem Bericht.** Folge: Magnesium citrate hat eine
  englische Beschreibung und Grad B und ist unsichtbar.

  `[cmd]` **Damit stehen alle 29 `form_note_de` auf verborgenen
  Zeilen** — der einzige echte Inhalt aus C-257 ist fuer einen Nutzer
  nicht erreichbar. **Und es gibt keinen Lesepfad, der sie unter dem
  Sammelnamen zeigt.**

  `[cmd]` **`form` fehlt bei 205 der 289 sichtbaren** — `enhanced`
  **0 von 177**, `peptide` **1 von 82**.

  ### Was bleibt

  `[cmd]` **Die Struktur aus C-257 traegt:**
  `supplement_user_texts`, `supplement_faq`, `supplement_tags` mit
  Zweck-Graden (425), 79 Portionszeilen, 29 Unterformen aus C-244,
  Alias-Faltung **598 → 0**.

  `[cmd]` **Und `form_note_de` beweist, dass es geht:** *„Citrat;
  haeufig als gut loesliche Magnesiumform genutzt"*, *„Bisglycinat;
  chelatierte Eisenform"*. **Keine Schablone.** Dieselbe Machart gilt
  jetzt fuer alle Felder.

  **Layout bestaetigt:** `docs/spezifikation/substanz-katalog-nutzertexte.md`
  §9 — Tom, 2026-08-23: *„es geht in die richtige richtung."*
