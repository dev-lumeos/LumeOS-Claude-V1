---
nr: G-555
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-30

braucht: [G-553]
kind_von: G-553

quellen:
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/medical/tab-biomarker.tsx
    - apps/web/src/app/v2/nutrition/tab-vorlieben.tsx
    - apps/web/src/lib/goals/ladefehler.ts

zahlen:
  gemessen: 2026-09-30
  module_betroffen: 2
  module_behoben: 1
---

# Derselbe Ladefehler verschluckt zwei weitere Module

`[cmd]` **Claude Code hat es ausserhalb seines Auftrags gefunden und
gemeldet, statt es mitzunehmen:**

    apps/web/src/app/v2/medical/tab-biomarker.tsx:56
      MedImportReferenz steht in Zeile 399 - also HINTER dem Ternaer
    apps/web/src/app/v2/nutrition/tab-vorlieben.tsx:447

`[read]` **Dieselbe Bauart wie der Fehler, den G-553 in Goals behoben hat:**
ein Ternaer, dessen `else`-Zweig den ganzen Reiterinhalt traegt — Trennstrich
und Mockup inbegriffen. Faellt die Abfrage, ist die Seite leer, auch der Teil,
der keine Daten braucht.

`[cmd]` **Bei `medical` selbst nachgesehen, und es ist strenger als
gemeldet — kein Ternaer, sondern ein frueher `return`:**

```tsx
// tab-biomarker.tsx:55
if (echt.ladefehler) {
  return (
    <Card title="Biomarkers" sub="konnten nicht geladen werden">
```

`[read]` **Ein frueher `return` verlaesst die Komponente komplett.** Alles
danach wird nicht nur uebersprungen, es wird nie erreicht —
`MedImportReferenz` in Zeile 399 hat keine Chance. Beim Ternaer in Goals
stand der Entwurf wenigstens im anderen Zweig; hier gibt es keinen anderen
Zweig.

**Der Befund von Claude Code stimmt, die Bauart ist eine andere.** Wer nach
einem Ternaer sucht, findet in `medical` nichts.

## Warum das ein eigener Punkt ist und nicht Teil von G-553

`[read]` **Der Auftrag nannte `goals/`.** Claude Code hat die Grenze gehalten
und den Fund gemeldet — genau richtig. `medical/` und `nutrition/` sind
dieselbe Bereichszuteilung (Claude Code, `apps/web/src/app/v2/`), aber ein
anderer Modulstand: beide haben eigene Punkte, eigene Attrappenzahlen und
eigene Waechter.

**Tom sieht denselben Fehler dort genauso**, sobald eine Abfrage faellt — und
der Tokenfehler von gestern trifft jede Seite, nicht nur Goals.

## Auftrag

1. **Die Kopplung loesen**, wie in G-553: ein Schalter sperrt nur die
   datentragenden Bauteile, kein Mockup-Bauteil haengt daran.
2. **`lib/goals/ladefehler.ts` verwenden** — die Unterscheidung
   Sitzungsfehler / Datenfehler ist gebaut und liest den Text.
   `[read]` **Und damit gehoert die Datei verschoben:** sie liegt in
   `lib/goals/`, wird aber von drei Modulen gebraucht.
   `lib/fehler/ladefehler.ts` oder `packages/ui` — **melden, wohin, und
   die Importe aller drei Module nachziehen.**
3. **Je Modul ein Waechter**, der beide Richtungen prueft: mit Ladefehler
   steht der Trennstrich, ohne Mockup-Bauteil wird er rot.
4. **Die drei Reiter, die G-553 als nie betroffen belegt hat** (`cross`,
   `timeline`, `poses`), sind die Gegenprobe fuer die richtige Bauart —
   ansehen, bevor umgebaut wird.

## Zu belegen

- je Modul ein Bild mit Ladefehler: Fehlerkachel **und** Mockup sichtbar
- die Attrappenzahl je Reiter vorher/nachher — sie darf **nicht** sinken
- `ladefehler.ts` am neuen Ort, alle drei Importe umgestellt, kein
  verwaister Pfad
- Sabotageprobe je Waechter in beide Richtungen
- `pnpm gate` gruen, nichts committen

**Reihenfolge:** nach G-554. Die Goals-Grundlagen gehen vor, und dieser Punkt
betrifft zwei Module, die Tom heute nicht bearbeitet.
