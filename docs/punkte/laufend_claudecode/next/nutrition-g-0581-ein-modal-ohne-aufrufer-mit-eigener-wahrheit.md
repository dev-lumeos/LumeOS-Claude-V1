---
nr: G-581
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-02

braucht: [G-579]
kind_von: G-579

quellen:
  - docs/punkte/erledigt/nutrition-g-0579-der-plansprung-hat-keinen-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/nutrition/plan-detail.tsx
    - apps/web/src/lib/nutrition/plan-detail-lage.ts
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
