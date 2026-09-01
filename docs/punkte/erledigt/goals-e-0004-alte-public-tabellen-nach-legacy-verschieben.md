---
nr: E-04
typ: blocker
modul: goals
schwere: hoch
angelegt: 2026-08-01
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-01
erledigt: 2026-09-01
commit: a598cb88
beruehrt:
  tabellen: [public.nutrition_goals]
  dateien: []
zahlen: null
---

# E-04 - Alte `public`-Tabellen nach `legacy` verschieben

## Befund

— nicht löschen.
  Kostet nichts, macht `public` frei für unsere Schemas, und die Daten bleiben
  greifbar. Bucket und `auth` bleiben unangetastet.
  **ABGEWERTET 2026-08-07 (Block 16) — bleibt offen, ist aber kein Blocker
  und keine Dringlichkeit mehr.** Zwei Messungen nehmen dem Punkt sein
  Gewicht:
  1. `[cmd]` (E-03) An den vier Übernahmekandidaten hängt **nichts** —
     keine Fremdschlüssel, Trigger, Sichten, Funktionen oder Policies. Die
     Warnung „`ALTER TABLE … SET SCHEMA` kann genau diese brechen" hat
     hier kein Ziel: es gibt nichts zu brechen.
  2. `[cmd]` (E-01) **132 von 166 Tabellen in `public` sind leer**, nur 34
     tragen Daten. Der Aufräumgewinn ist damit kleiner, als die Zahl 166
     vermuten liess — verschoben würden überwiegend leere Hüllen.
  **Wer diesen Punkt künftig liest: er blockiert nichts.** Er ist Kosmetik
  an einer Instanz, die ohnehin umgebaut wird, und gehört hinter E-05
  (Mapping) und E-08 (Deployment) eingereiht, nicht davor.

## Auftrag

**Mitbeauftragt mit C-362 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-01, mit C-362 abgenommen: gegenstandslos.**

`[cmd]` **Vier historische Cloud-Tabellen, lokal nicht vorhanden** —
nachgemessen, keine davon im `public`-Schema.

`[read]` **Nichts verschoben, nichts geloescht.**
