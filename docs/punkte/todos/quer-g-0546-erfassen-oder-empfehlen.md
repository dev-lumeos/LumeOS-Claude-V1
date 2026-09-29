---
nr: G-546
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: null

quellen:
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - medical.user_medications
  dateien:
    - docs/punkte/00-INDEX.md

zahlen:
  gemessen: 2026-09-29
  substanzklassen_im_dokument: 6
---

# Erfassen oder empfehlen — die Grenze bei Substanzprotokollen

`[cmd]` **Die Lektuere vom 2026-09-29 (Dokument A, Abschnitt 2) enthaelt
Dosierungsprotokolle fuer sechs Substanzklassen:** anabole Steroide,
Wachstumshormon und Peptide, Thyroidhormone, Fettabbaumittel
einschliesslich DNP, Insulin und Diuretika. Mit Wochendosierungen,
Halbwertszeiten, Zyklusplaenen und Nebenwirkungsmanagement.

**Das ist nicht in einen Katalogeintrag eingebaut worden** (G-545 A6), und
zwar nicht, weil es fachlich falsch waere, sondern weil die Entscheidung
Tom gehoert.

## Die Frage ist nicht, ob LumeOS Substanzen kennt

`[cmd]` **Es tut es schon:** `medical.user_medications` speichert
Medikamente verschluesselt (C-285), der Medikamentenkatalog steht (C-506),
und der Injektionsplaner hat ein Datenmodell fuer Injektionsstellen
(C-385). Ein Nutzer kann heute erfassen, was er nimmt.

**Die Frage ist die Richtung:**

| | |
|---|---|
| **Erfassen** | Der Nutzer traegt ein, was er nimmt. LumeOS rechnet damit — Wechselwirkungen, Laborwerte, Injektionsstellen. **Gebaut, unstrittig.** |
| **Empfehlen** | LumeOS liefert eine Dosierung aus, weil eine Strategie sie vorsieht. Der Katalog wuerde sagen: *„contest_prep, Woche 9–16: Trenbolon 400 mg/Woche."* **Nicht gebaut, und eine andere Kategorie.** |

`[read]` **Der Unterschied ist nicht graduell.** Im ersten Fall ist LumeOS
ein Tagebuch mit Rechenwerk. Im zweiten gibt es eine Anweisung zu
Substanzen, die in den meisten Laendern verschreibungspflichtig oder
verboten sind — an einen Nutzer, dessen Erfahrung und Gesundheitszustand
es nur als Selbstauskunft kennt.

## Was zu entscheiden ist

1. **Bleibt es beim Erfassen?** Dann ist dieser Punkt geschlossen, und
   Substanzen erscheinen in Goals nirgends.
2. **Oder werden Protokolle abgebildet** — dann: fuer wen sichtbar
   (Coach-Freigabe? Tier?), mit welchem Hinweis, und wer traegt die
   fachliche Verantwortung fuer den ausgelieferten Wert.
3. **Ein Mittelweg, der ohne Empfehlung auskommt:** der Nutzer erfasst
   sein eigenes Protokoll, und LumeOS **rechnet damit** statt es
   vorzugeben — Zeitachse, Laborwert-Kopplung, Warnung bei Konflikt. Das
   nutzt dieselben Daten, ohne eine Dosierung auszuliefern.

`[annahme]` **Weg 3 traegt den Nutzen ohne die Anweisung** und passt zu
dem, was schon gebaut ist (Medical, Injektionsplaner). Das ist eine
Einschaetzung, keine Messung — Tom entscheidet.

## Wer das beantworten kann

`[read]` Tobias ist IFBB-Profi und am 2026-09-30 da. Er kann die fachliche
Seite klaeren. **Die produkt- und haftungsseitige Frage kann er nicht
klaeren** — die bleibt bei Tom.

**Bis dahin:** in Goals erscheint keine Substanz, kein Katalogeintrag
traegt eine Dosierung, und die Lektuere wird fuer Ernaehrung, Training,
Cardio und Peak-Week-Wassermanagement genutzt — alles, was Abschnitt 2
nicht betrifft.
