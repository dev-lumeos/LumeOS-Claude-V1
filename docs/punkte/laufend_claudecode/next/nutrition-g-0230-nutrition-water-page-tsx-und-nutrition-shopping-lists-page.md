---
nr: G-230
typ: entscheidung
modul: nutrition
schwere: niedrig
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-230 — `nutrition.water/page.tsx` und `nutrition.shopping-lists/page.tsx` als separate Pages

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-1.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_10_COMPONENTS.md §Verzeichnisstruktur` listet zwei separate Pages neben der 5-Tab-Hauptseite. Wenn Shopping Lists schema-only V1 sind, ist eine eigene Page-Datei doppelte Struktur. Konsistenz mit V1-Status (siehe IMP-4) nicht klar.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Gemessen 2026-08-30: `v2/nutrition` hat zwei
Unterordner — `__tests__` und `suche`.** `[cmd]` **`hydration.tsx`
existiert als Datei, nicht als Seite.**
`[read]` **Die im Punkt genannten Pfade `nutrition/water/page.tsx`
und `nutrition/shopping-lists/` gibt es nicht** — **die Review
beschreibt eine Struktur, die nie gebaut wurde.**

## Auftrag

**Vorbereitet mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
