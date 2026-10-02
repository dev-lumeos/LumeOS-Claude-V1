---
nr: G-581
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-02
commit: 7b37e6a2
erledigt: 2026-10-02
beauftragt: 2026-10-02
agent: claudecode

braucht: [G-579]
kind_von: G-579

quellen:
  - docs/punkte/erledigt/nutrition-g-0579-der-plansprung-hat-keinen-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
    - apps/web/src/lib/nutrition/plan-werkbank.ts
---

# Ein Modal ohne Aufrufer, mit eigener Wahrheit ueber den Lebenszyklus

## Der Befund

`[cmd]` **`MealPlanActivationModal` ist seit G-319 toter Code ohne
Aufrufer** — gemessen von Claude Code im G-579-Lauf,
`tab-plans.tsx:413` erklaert den Ausbau. **Es sieht wie der richtige Ort
fuer den Plansprung aus**, und genau deshalb ist es gefaehrlich: wer
nach „technisch passend" sucht, legt seinen Aufruf dorthin und er wird
nie ausgefuehrt.

`[cmd]` **Und es traegt eine zweite Wahrheit:** `ZYKLUS_WAEHLBAR` steht
zweimal im Produkt, mit verschiedenen Werten.

    lib/nutrition/plan-detail-lage.ts:23   ['once','rollover','sequence']
                                           - das toter-Code-Modul
    lib/nutrition/plan-werkbank.ts:450     ['once','rollover']
                                           - der lebende Weg; 'sequence'
                                             kommt seit G-579 bedingt
                                             dazu, sobald ein zweiter
                                             Plan existiert

`[read]` **Die dreiwertige Liste ist die Zusage, die G-579 bewusst NICHT
gegeben hat:** eine feste Dreierliste bricht bei einem einzigen Plan,
weil es dann keinen Folgeplan geben kann. **Der tote Pfad verspricht
etwas, das der lebende aus gutem Grund nur bedingt anbietet.**

`[cmd]` **Zwei Waechter haengen daran:**
`__tests__/plan-detail-lage.test.ts:207` haelt die Dreierliste fest,
`__tests__/ghost-eintraege.test.ts:214` die Zweierliste. **Beide sind
gruen — sie messen zwei verschiedene Wahrheiten.**

## Was zu tun ist

**A1 — den toten Pfad messen, bevor er angefasst wird.** `[read]`
**Nicht loeschen, weil es tot aussieht:** zaehlen, wer `plan-detail.tsx`
und `plan-detail-lage.ts` noch importiert, und melden, was davon lebt.
`[cmd]` G-319 hat den Ausbau begruendet — **lies die Begruendung, bevor
du den Rest entfernst.**

**A2 — entscheiden und melden, nicht beides behalten:** entweder der
Pfad kommt zurueck (dann uebernimmt er die bedingte Logik aus
`plan-werkbank.ts` und seine Liste verschwindet) oder er geht (dann gehen
Modul, Modal und der Waechter mit, und `plan-detail-lage.ts` behaelt nur,
was andere brauchen). **Zwei Orte fuer denselben Lebenszyklus bleiben
nicht.**

**A3 — der Waechter danach misst eine Wahrheit**, nicht zwei. `[read]`
**Mit einer wieder eingefuehrten zweiten Liste muss er rot werden** —
sonst haelt er nur den Zustand von heute fest.

**Nicht Teil:** der Plansprung selbst (G-579, erledigt), der Ringschluss
(G-580) und `lifecycle_type` im Schema.

**Zu belegen:** die Aufrufzahl je Datei vorher und nachher · die Zahl der
`ZYKLUS_WAEHLBAR`-Definitionen vorher und nachher · die Attrappenzahl des
Reiters, sie darf nicht sinken · Sabotage in beide Richtungen · `pnpm
gate` gruen mit Testzahl · nichts committen.

`[read]` **Keine Datenbank, kein Kettenlauf** — dieser Punkt liest Code
und zaehlt Aufrufer.

---

## Auftrag — Kopf, 2026-10-02

    AUFTRAG FUER Claude Code - G-581: eine Wahrheit ueber den
                                     Lebenszyklus, nicht zwei
    Bereich: apps/web/src/app/v2/nutrition/plan-detail.tsx
             apps/web/src/lib/nutrition/plan-detail-lage.ts
             apps/web/src/lib/nutrition/__tests__/
    Fremd:   supabase/ gehoert Codex (A-87, die Zeugenstaffel - und
             seine Meal-Plan-Proben beruehren diesen Bereich: lies
             seinen Bericht, wenn er vor dir fertig ist, aendere
             nichts in supabase/). docs/ gehoert dem Orchestrator,
             auch diese Punktdatei: der Bericht kommt als Antwort,
             nicht als Anhang hier.
    Stand:   2026-10-02

**Zuerst lesen, vollstaendig:** diese Datei und deinen eigenen
G-579-Bericht — der Fund stammt daraus.

`[read]` **Reihenfolge:** erst G-572 (laeuft bei dir), dann dieser Punkt.
Beide lesen Code und zaehlen; keiner braucht die Datenbank.

`[cmd]` **Was du selbst gemessen hast und was dieser Punkt daraus macht:**
`MealPlanActivationModal` ist seit G-319 ohne Aufrufer, und
`ZYKLUS_WAEHLBAR` steht zweimal mit verschiedenen Werten —
`plan-detail-lage.ts:23` dreiwertig, `plan-werkbank.ts:450` zweiwertig.
**Zwei gruene Waechter halten zwei verschiedene Wahrheiten fest**
(`plan-detail-lage.test.ts:207` und `ghost-eintraege.test.ts:214`).

`[read]` **Die Entscheidung in A2 ist deine und soll begruendet sein, nicht
gewaehlt** — zurueck oder weg. **Was nicht bleibt: beides.**

---

## Abnahme — 2026-10-02, Commit `7b37e6a2`

`[cmd]` **Diff gelesen:** 6 Dateien, +202/−831. Die 822 gelöschten Zeilen
stimmen (498 + 81 + 243), entfernt und nicht auskommentiert (A-59).
`export const ZYKLUS_WAEHLBAR` steht jetzt **einmal** im Produkt
(`plan-werkbank.ts:450`, zweiwertig) — die übrigen Treffer sind die
Eichzeichenketten des neuen Wächters. Lebende Verweise auf den toten
Pfad: 0, die restlichen sind Kommentare. Gate grün.

`[cmd]` **Der Punkt sagte „totes Modal", gemessen war mehr:** die Datei
lebte nur durch einen **leeren Import** — `import { } from
'./plan-detail'` in `tab-plans.tsx:46`, übrig geblieben beim
G-319-Ausbau. Er band nichts und hielt drei Bauteile am Leben.

`[read]` **A2 war keine Wahl, und so hat er es begründet:** G-319 hat den
Pfad ausgetragen, weil er falsch war — `MealPlanDetail` zeigte den
aktiven Plan ein drittes Mal, `MealPlanActivationModal` bekam immer den
aktiven Plan, ein Klick bei einem anderen öffnete den falschen Dialog.
Drei bestehende Wächter verbieten die Rückkehr. Zurückholen hieße, beides
zurückzuholen.

`[cmd]` **Der Wächter zählt, statt zu suchen** (`=== 1`) — ein
`assert.match` ist zufrieden, solange eine Definition existiert, und
genau so konnten zwei nebeneinander leben. Sabotage: eine zweite Liste
kehrt als **neue Datei** zurück → rot.

`[read]` **Drei eigene Fehler hat er selbst gefunden, einer davon
gefährlich:** `SRC` zeigte zwei Ebenen hoch auf `lib/` statt auf `src/`
— damit sahen drei Zusicherungen `app/v2/` nie und waren grün, **ohne
etwas gemessen zu haben.** Heuhaufen-Untergrenze von 100 auf 300
angehoben. Das ist die Klasse „der Wächter kann nicht fallen", zweites
Vorkommen nach G-578.

`[cmd]` **Ein Rest, der liegen bleibt:** `plans-echt.tsx:404, 959, 963`
nennen `plan-detail.tsx` in Kommentaren, einer im Präsens („zeigt ihn
bereits"). **Drei Kommentarzeilen, kein Code** — sie gehen beim nächsten
Punkt in dieser Datei mit.
