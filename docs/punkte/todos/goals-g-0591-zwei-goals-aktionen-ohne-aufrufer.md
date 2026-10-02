---
nr: G-591
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-02

braucht: [G-588]
kind_von: G-588

quellen:
  - docs/punkte/todos/quer-g-0588-sechs-serveraktionen-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md

beruehrt:
  tabellen:
    - goals.user_goals
    - goals.body_measurements
  dateien:
    - apps/web/src/app/v2/goals/koerpermass-aktionen.ts
    - apps/web/src/app/v2/goals/ziel-aktionen.ts
---

# Zwei Goals-Aktionen ohne Aufrufer — eine Messung aendern, die Reihenfolge speichern

## Der Befund

`[cmd]` **Aus G-585, von Tom unter G-588 entschieden** (*„ja auch die
kriegen eine oberflaeche"*). **Zwei der sechs liegen in Goals**,
gemessen 2026-10-02:

    apps/web/src/app/v2/goals/koerpermass-aktionen.ts:41
        messungAendernAktion(id, e) -> messungAendern(id, e)
    apps/web/src/app/v2/goals/ziel-aktionen.ts:58
        prioritaetenSpeichern(paare) -> reihenfolgeSetzen(paare)
        danach revalidatePath('/v2/goals')

`[read]` **Berichtigung zu G-588:** der Punkt ordnete
`messungAendernAktion` Recovery zu. **Sie liegt in Goals.** Damit traegt
Recovery drei Aktionen (G-590), Goals zwei, Nutrition eine (G-592).

## Was die zwei unterscheidet

`[read]` **`prioritaetenSpeichern` ist der kleinere Fall und der
klarere:** die Reihenfolge der Ziele ist eine Nutzerhandlung, der
Schreibweg steht, und `revalidatePath` ist schon drin — es fehlt der
Griff, der die neue Reihenfolge abschickt. `[cmd]` **Zu messen, bevor
gebaut wird:** die drei aktiven Plaetze aus `uq_user_goals_active_slot`
und die Regel, dass ein aktives Ziel Prioritaet 1 bis 3 traegt. **Eine
Oberflaeche, die vier Plaetze anbietet, faellt am CHECK.**

`[read]` **`messungAendernAktion` haengt an einer offenen Frage:**
`goals.body_measurements` traegt `height_cm_snapshot` — eine Messung zu
AENDERN heisst zu entscheiden, ob der Snapshot mitwandert oder stehen
bleibt. **Das ist keine Bauentscheidung.** `[cmd]` Erst messen, was
`messungAendern` heute mit der Spalte tut, dann fragen.

`[annahme]` **G-575 koennte diesen Punkt vergroessern** — wenn ein Ziel
mehr als eine Messgroesse traegt, ist „die Reihenfolge speichern" eine
andere Handlung. **Nicht beauftragen, solange G-575 offen ist**, oder
nur den Prioritaetenteil.

**Nicht Teil:** die drei Recovery-Aktionen (G-590),
`getHydrationSummary` (G-592), `createServiceClient` (G-587).
