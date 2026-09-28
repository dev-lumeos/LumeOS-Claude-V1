---
nr: G-522
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-27
kind_von: G-514
quellen:
  - docs/specs/Goals/STRATEGY.md
  - docs/specs/Goals/SCORING.md
  - apps/web/src/app/v2/goals/daten.ts:378

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - docs/specs/Goals/STRATEGY.md
    - docs/specs/Goals/SCORING.md
    - apps/web/src/app/v2/goals/daten.ts

zahlen:
  gemessen: 2026-09-27
  treffer_goal_contributions: 0
  treffer_contribution_weights: 0
  durchsuchte_dateien: 1336
  tabelle_vorhanden: nein
---

# G-522 - der erste USP ist nirgends gebaut

## Der Befund

`[cmd]` **Gemessen am 2026-09-27 ueber 1336 Dateien in `apps/`,
`packages/`, `supabase/` und `tools/` (ohne `node_modules`,
`_archive`, `.next`):**

    goal_contributions        0 Treffer
    contribution_score        0 Treffer
    CONTRIBUTION_WEIGHTS      0 Treffer

`[cmd]` **Und die Tabelle gibt es auch nicht.** `information_schema`
kennt im Schema `goals` acht Tabellen — `goal_contributions` ist
keine davon.

## Warum das schwer wiegt

`[read]` **`docs/specs/Goals/STRATEGY.md` nennt es als Luecke Nummer
eins des gesamten Marktes:** ,,NIEMAND hat Cross-Module Goals — alle
optimieren genau 1 Dimension." Derselbe Text fuehrt ,,Goals That
Adapt to Your Entire Life" als **primaeren USP**.

`[read]` **`docs/specs/Goals/README.md` nennt Goals nicht ein Modul,
sondern den Betriebssystem-Kern** — der Aggregation Point, um den die
anderen rotieren. Ohne Beitraege rotiert nichts. Goals ist dann ein
Modul neben anderen.

## Was es stattdessen gibt

`[cmd]` **`apps/web/src/app/v2/goals/daten.ts:378` hat
`findBottleneck`** — und Zeile 20 derselben Datei sagt, was das ist:

    // `[cmd]` DIE ZAHLEN SIND ERFUNDEN - mit einer Ausnahme, die
    // zaehlt: die Composition-Kachel rechnet Mifflin-St Jeor

`[cmd]` **25 Treffer auf `bottleneck` liegen ausschliesslich in
`daten.ts` und `mockup-referenz.tsx`.** Die Formel ist aus der
Vorlage uebernommen, die Eingangswerte sind erfunden, und es gibt
keine Zeile, die echte Modulwerte einspeist.

`[read]` **Die Formel ist damit nicht das Problem.** `SCORING.md`
Abschnitt 2 und 3 geben `CONTRIBUTION_WEIGHTS` je Zieltyp und
`findBottleneck` vollstaendig vor, inklusive der vier
Gewichtungsreihen und der Schwelle `worstGap < 5`. Was fehlt, ist der
Weg von fuenf Modulen in eine Tabelle.

## Nachweiszeilen

**A1** — je Modul (nutrition, training, recovery, supplements,
medical) messen, ob es ueberhaupt einen Tagesscore gibt, den es
liefern koennte: Tabelle, Spalte, Zeilenzahl, Stichtag. Was nicht
existiert, wird gemeldet, nicht geschaetzt. **Das entscheidet, ob
dieser Punkt ein Bauauftrag ist oder fuenf.**

**A2** — `goals.goal_contributions` nach `DATABASE.md` Abschnitt 3
in die Kette in `supabase/_pipeline/`, mit dem `UNIQUE (goal_id,
module, contribution_date)` und dem Modul-CHECK.

**A3** — `CONTRIBUTION_WEIGHTS` und `calcGoalProgress` aus
`SCORING.md` als geprueftes Bauteil, nicht als Kopie in `daten.ts`.
Ein Test legt die vier Gewichtungsreihen daneben.

**A4** — `findBottleneck` gegen echte Werte, mit der Schwelle aus
der Spec. Sabotageprobe: ein verstelltes Gewicht muss den Befund
kippen.

**A5** — **Grenze zu C-108/F-02 pruefen.** ,,Dein Schlaf limitiert
aktuell am meisten" ist eine Aussage ueber den Nutzer. Vorher
klaeren, in welcher Form sie erlaubt ist.

## Abhaengigkeit

`[read]` **Unabhaengig von G-511, G-519 und G-520.** Die Beitraege
haengen nicht an der Phase. Sie koennen vor oder nach den Phasen
gebaut werden — aber A1 sollte vor jeder Reihenfolgeentscheidung
gemessen sein.

## A1 gemessen — 2026-09-28

`[cmd]` **Je Modul gefragt: gibt es ueberhaupt einen Tagesscore, den
es an Goals liefern koennte?**

| Modul | Tagesscore | Stand |
|---|---|---|
| recovery | `recovery.scores.score` | **liegt vor** — 370 Zeilen, 3 Nutzer, 2026-05-21 bis 2026-11-06, alle 370 gefuellt, dazu sieben Teilscores |
| supplements | `supplements.daily_intake_summary.compliance_pct` | **rechenbar** — Ansicht, 274 Zeilen, 3 Nutzer, 274 mit Wert |
| nutrition | kein gespeicherter Score | **halb** — `packages/scoring/src/nutrition.ts:157` rechnet `nutritionScore()` auf 0 bis 100, und `nutrition.daily_summary` traegt 730 Zeilen / 5 Nutzer als Eingabe. Gerechnet wird er im Browser, gespeichert nirgends |
| training | nichts | **fehlt** — keine Score-Spalte im Schema, keine Tageszusammenfassung. `program_days` und `routine_schedule_days` haben je 0 Zeilen und sind Planungstabellen |
| medical | nichts | **fehlt** — nur `injection_logs.pain_score`, 0 Zeilen |

### Die Antwort auf A1: das sind drei Auftraege, nicht einer

`[read]` **1. Die Tabelle und die zwei, die schon einen Wert haben.**
`goals.goal_contributions` anlegen und recovery und supplements
daran haengen. Das ist der Auftrag, der beweist, dass die
Aggregation ueberhaupt traegt — mit zwei von fuenf Modulen und
echten Zahlen.

`[read]` **2. nutrition liefern lassen.** Der Score existiert als
Funktion, aber nur im Browser. Er braucht einen Weg in eine Zeile
je Tag. **Das ist die kleinere Haelfte** — die Formel ist gebaut und
getestet (`packages/scoring/src/__tests__/nutrition.test.ts`).

`[read]` **3. training und medical von vorn** — und das sind KEINE
Goals-Auftraege. Ein Trainingsscore gehoert ins Trainingsmodul, ein
Gesundheitsscore ins medizinische. Goals kann nur aggregieren, was
ein Modul von sich aus kennt.

### Ein Befund, der dabei aufgefallen ist

`[cmd]` **Es gibt schon zwei verschiedene Bauarten fuer
Modulscores**, und keinen Vertrag zwischen ihnen:

    nutrition   TypeScript, packages/scoring/src/nutrition.ts
    recovery    SQL, recovery.scores mit sieben Teilscores

`[cmd]` **`packages/scoring/` enthaelt ausschliesslich nutrition** —
`index.ts`, `nutrition.ts` und ein Test. Kein `goals.ts` (das die
Spec nennt), kein `training.ts`, kein `recovery.ts`. Das Paket
heisst scoring und ist eines fuer ein Modul.

`[read]` **Bevor der erste Beitrag geschrieben wird, muss die Form
feststehen** — was ein Modul liefert, in welcher Einheit, wann. Sonst
entsteht die dritte Bauart. `DATABASE.md` Abschnitt 3 gibt sie vor
(`contribution_score` 0 bis 100 plus ein `details`-Objekt je Modul);
**diese Form ist zu pruefen, nicht zu erfinden.**

### Eine Datenauffaelligkeit

`[cmd]` **`recovery.scores` reicht bis 2026-11-06** — vierzig Tage
in der Zukunft. Testdaten, kein Blocker, aber wer ueber
`CURRENT_DATE` filtert, sieht sie nicht, und wer ohne Filter
aggregiert, mittelt Zukunft mit ein.

## Verhaeltnis zu G-514 — 2026-09-28

`[cmd]` **G-514 vom 26.09. ist der Elternbefund** und haelt die
Tabellenmessung: zehn Spec-Tabellen, vier fehlen, darunter
`goal_contributions`. **Dieser Punkt haette von Anfang an sein Kind
sein muessen.**

`[read]` **Was hier bleibt, weil G-514 es nicht hat:**

- die A1-Messung je Modul: **zwei von fuenf koennen liefern**
  (recovery gespeichert, supplements als Ansicht), nutrition nur
  im Browser gerechnet, training und medical gar nicht
- der Befund, dass es **zwei Bauarten fuer Modulscores** gibt
  (TypeScript bei nutrition, SQL bei recovery) und keinen Vertrag
  dazwischen
- die Einordnung aus `STRATEGY.md`: Cross-Modul ist die
  Marktluecke Nummer eins und der primaere USP

`[read]` **Die Tabelle selbst gehoert G-514.** Wer sie baut,
schliesst dort ab, nicht hier.
