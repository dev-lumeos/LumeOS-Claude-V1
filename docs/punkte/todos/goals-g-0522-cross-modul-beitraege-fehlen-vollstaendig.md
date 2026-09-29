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
## A3 — der Vertrag, 2026-09-28 (Claude Code)

### A3.1 — die Form, pruefend gelesen

`[cmd]` **Gebaut: `packages/scoring/src/beitrag.ts`.** Jede
Festlegung traegt ihre Spec-Stelle.

**WAS ein Modul liefert:**

    BEITRAGSMODULE      DATABASE.md:149-150 (der CHECK, fuenf)
    score 0..100        DATABASE.md:152 (NUMERIC(5,2), „0–100")
    details je Modul    DATABASE.md:155-160

**WANN er gilt — hier musste ich ENTSCHEIDEN, die Spec sagt
nichts:**

`[cmd]` **Gemessen: `recovery.scores` reicht bis 2026-11-06 —
78 von 370 Zeilen liegen in der Zukunft.**

`[cmd]` **Auf `test-user@lumeos.local`: 30 Zeilen, davon 0 in der
Zukunft.** **Auf `dev@lumeos.app` schon.**

`[cmd]` **Der Vertrag waehlt: `tag <= stichtag`.** `[read]`
**Begruendung: ein Beitrag ist eine Aussage ueber einen
VERGANGENEN Tag.** Ein Wert fuer morgen kann nicht erfasst worden
sein — er ist Seed oder Vorhersage, und beides gehoert nicht in
eine Bilanz.

`[read]` **`DATABASE.md` kennt nur `contribution_date DATE NOT
NULL`** — **die Wahl ist als Festlegung dieses Vertrags
gekennzeichnet, nicht als Spec-Zitat.**

**WAS „kein Wert" heisst:**

`[cmd]` **`score: number | null` plus `grund`.** `[read]` **Eine 0
ist ein Ergebnis, ein `null` ist keins** — G-524 belegt es:
`test-user` hat KEINE TDEE-Reihe, nicht eine mit Nullen.

`[cmd]` **`nutrition.ts:129` fuehrt es seit jeher so** — der
Vertrag schreibt es nur fest.

### Die Abweichungen Spec gegen gebauten Zustand

`[cmd]` **Gegen die laufende Datenbank gemessen, 2026-09-28:**

    goals.goal_contributions   Spec DATABASE.md:144   GIBT ES NICHT
    goals.tdee_settings        Spec DATABASE.md:204   GIBT ES NICHT
                               gebaut: goals.nutrition_targets

`[read]` **Die zweite ist die, die G-522 Absatz drei schon
nennt** — bestaetigt, nicht still angepasst.

`[cmd]` **Und eine dritte, die noch nicht im Punkt stand:** die
Spec rechnet ein fehlendes Modul still als 0
(`SCORING.md:66`, `contributions[module] ?? 0`). `[read]` **Der
Vertrag rechnet genauso — aber er SAGT es** (`ohne_wert`), **statt
ein fehlendes Modul wie ein schlechtes aussehen zu lassen.**

`[cmd]` **Eine vierte, gemessen:** `recovery.scores.score` liegt
zwischen 35,3 und 78,7 — **im selben Bereich 0..100 wie
nutrition.** `[read]` **Der Vertrag passt damit auf BEIDE
gebauten Bauarten**, ohne dass eine sich aendern muss.

### A3.2 — CONTRIBUTION_WEIGHTS und der Fortschritt

`[cmd]` **Nach `packages/scoring/`, nicht als Kopie in
`daten.ts`.** `[cmd]` **Vier Reihen aus `SCORING.md:51-56`,
unveraendert.** `[cmd]` **Rechenweg und Schwellen aus `:58-81`.**

`[cmd]` **`__tests__/beitrag.test.ts`, 26 Zusicherungen, gruen.**

`[read]` **Die Erwartung steht im Test AUSGESCHRIEBEN**, nicht aus
`CONTRIBUTION_WEIGHTS` abgeleitet — **sonst prueft sich die
Tabelle gegen sich selbst.**

`[cmd]` **Zusaetzlich nachgerechnet: jede Reihe summiert auf
1,00.** `[read]` **Die Spec sagt es nicht, aber sie rechnet damit**
(`calcGoalProgress` teilt durch `totalWeight`).

`[cmd]` **Die Schwellen von BEIDEN Seiten geprueft** — 80/79,
65/64, 50/49.

**SABOTAGEPROBE, beide Richtungen:**

    nutrition 0.40 -> 0.45      Zusicherung 2 und 3   ROT
    zurueckgestellt             26 von 26             GRUEN
                                byteidentisch (cmp)

`[cmd]` **Drei weitere Eingriffe, je von ihrer eigenen Zusicherung
gefangen:**

    Zukunftsfilter entfernt     -> „Zukunft zaehlt nicht"   ROT
    ohne_wert entfernt          -> 9 und 10                 ROT
    Schwelle 80 -> 81           -> „Score 80 excellent"     ROT

### A3.3 — nutrition hinter den Vertrag

`[cmd]` **`nutritionScore()` UNVERAENDERT.** `[cmd]`
**`alsModulbeitrag()` uebersetzt nur** — die Zahl wird
durchgereicht, nicht neu gebildet.

`[cmd]` **Der bestehende Test: 10 von 10 gruen, unveraendert.**
`[read]` **Das ist der Beleg, dass sich seine Zahlen nicht
geaendert haben.**

`[cmd]` **Drei neue Zusicherungen pruefen die Vertragstreue:** der
Score wird durchgereicht, der Bereich ist 0..100, und „kein Wert"
ergibt `null` MIT Grund statt 0.

### Was ich NICHT angefasst habe

`[cmd]` **Kein `goals.goal_contributions`** (gehoert G-514 und
Codex). `[cmd]` **Kein Schreiben je Tag** (braucht die Tabelle).
`[cmd]` **Kein `findBottleneck` gegen echte Werte** (braucht die
Tabelle). `[cmd]` **Keine Attrappe in `daten.ts` entfernt** — die
Marken in `tab-phase.tsx:585-703` nennen Quelle und Grund und
bleiben.

`[read]` **`findBottleneck` habe ich bewusst NICHT uebernommen** —
die Spec gibt es vollstaendig vor (`SCORING.md:88-118`), aber ohne
echte Beitraege liesse es sich nur gegen erfundene Zahlen pruefen.
**Es gehoert in denselben Zug wie die Tabelle.**

### Belege

    packages/scoring, eigener Lauf   36 von 36 gruen
    nutrition-Test unveraendert      10 von 10
    beitrag-Test                     26 von 26
    tsc --noEmit im Paket            gruen
    turbo typecheck/test/build       18 von 18

`[cmd]` **`pnpm gate` ist rot an EINER Stelle: `punkte-pruefen`,
wegen `C-551`** — der Punkt liegt doppelt (`laufend_codex` UND
`erledigt`) und nennt `training.muscle_role_volume_rules`, die es
nicht gibt. `[read]` **Codex' Stand von heute, in `docs/` und
`supabase/`** — beides nicht mein Bereich. **Die drei anderen
Waechter sind gruen.**

`[cmd]` **Mein Fussabdruck: drei Dateien in `packages/scoring/`.**
**Nichts committet.**

## Abnahme A3 — Orchestrator, 2026-09-29

`[cmd]` **Selbst nachgezaehlt, nicht aus dem Bericht uebernommen:**

    packages/scoring, eigener Lauf        36 von 36 gruen
    beitrag.ts                            9.316 Byte
    __tests__/beitrag.test.ts             8.305 Byte
    nutrition.ts / nutrition.test.ts      unveraendert

`[cmd]` **Die vier Gewichtungsreihen summieren exakt auf 1,00** —
selbst addiert aus `beitrag.ts`, nicht aus `CONTRIBUTION_WEIGHTS`
abgeleitet: `body_composition_loss`, `body_composition_gain`,
`performance_strength`, `health`, je fuenf Werte.

`[cmd]` **Sabotage selbst wiederholt:** `nutrition: 0.40` auf `0.45`
verstellt → **2 Zusicherungen rot**. Zurueckgestellt → sha256
byteidentisch (`9b25cc901266ee5e`), danach wieder 36 gruen. **Der Test
misst etwas, in beide Richtungen.**

`[cmd]` **Die Spec-Stellen stehen im Vertrag:** `DATABASE.md` 6x,
`SCORING.md` 5x, dazu `ohne_wert`, `0..100` und `stichtag`.

`[read]` **Die Festlegung `tag <= stichtag` traegt.** Sie steht nicht in
der Spec, ist als eigene Festlegung gekennzeichnet und begruendet: ein
Beitrag ist eine Aussage ueber einen VERGANGENEN Tag. `recovery.scores`
reicht bis 2026-11-06, 78 von 370 Zeilen liegen in der Zukunft — ein
Wert fuer morgen kann nicht erfasst worden sein.

`[read]` **Die vierte Spec-Abweichung ist neu und gehoert festgehalten:**
`SCORING.md:66` rechnet ein fehlendes Modul still als 0
(`contributions[module] ?? 0`). Der Vertrag rechnet genauso, **sagt es
aber** (`ohne_wert`), statt ein fehlendes Modul wie ein schlechtes
aussehen zu lassen.

### Was an diesem Punkt OFFEN bleibt

`[read]` **A2, A4 und A5 haengen alle an
`goals.goal_contributions`** — die Tabelle gehoert G-514 und Codex.

    A2  die Tabelle in die Kette              -> G-514
    A4  findBottleneck gegen echte Werte      wartet auf A2
    A5  Grenze zu C-108/F-02 pruefen          eigene Frage, unabhaengig

`[read]` **Claude Code hat `findBottleneck` bewusst NICHT uebernommen**,
obwohl `SCORING.md:88-118` es vollstaendig vorgibt: ohne echte Beitraege
liesse es sich nur gegen erfundene Zahlen pruefen. **Das ist die richtige
Entscheidung** — es gehoert in denselben Zug wie die Tabelle.

`[cmd]` **Gebaut in `dc55728a`.**
