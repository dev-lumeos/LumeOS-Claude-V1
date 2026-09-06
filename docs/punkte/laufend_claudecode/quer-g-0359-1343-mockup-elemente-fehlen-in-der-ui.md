---
nr: G-359
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-355
entscheidung: E-68
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/tab-phase.tsx
zahlen:
  gemessen: 2026-09-07
  mockup: 2488
  in_ui: 1145
  fehlt: 1343
---

# G-359 — 1.343 Mockup-Elemente fehlen in der UI

## Befund

Tom, 2026-09-07:

> nun sehe ich dass tonnenweise zeugs einfach weg ist aus der ui und
> ohne jeden scheiss nun ueberall ueber stunden und tage zu messen
> wir nicht mehr wissen was fehlt

> das ist strikt nicht die idee dass man meine rulings nicht
> beachtet und irgendeinen scheiss coded

`[cmd]` **Gemessen 2026-09-07, Beschriftungen aus
`theme-v1/module-*.jsx` gegen `apps/web/src/app/v2/*`:**

    Modul          Mockup   in UI   FEHLT
    coach             521     100     421
    supplements       423     160     263
    medical           352     153     199
    recovery          250      80     170
    nutrition         259     107     152
    goals             341     236     105
    training          300     270      30
    dashboard          42      39       3
    GESAMT           2488    1145    1343

`[read]` **Mehr als die Haelfte fehlt.**

`[cmd]` **Fuenf Module haben gar keinen v2-Ordner:** admin (155),
buddy (265), market (314), completeness (182), stubs (230).

## Und es geht auch anders

`[cmd]` **`training` 90 %, `dashboard` 93 %** — **angebunden oder
als Attrappe sichtbar.**

`[read]` **Der Massstab existiert also im selben Repo.**

## Was in `goals` fehlt — als Beispiel

    Contest Prep, Fat Loss, Lean Bulk, Maintenance,
    Recomposition, Reverse Diet, Expert BB - Annual
      -- die neun Phasenarten aus dem CHECK

    Arm - left (flexed), Bicep L/R, Calf L/R, Forearm L/R,
    Hips, Save measurements
      -- die Umfangspunkte mit Speichern-Knopf

    Open annual cycle editor, Reset to IFBB default,
    Add sub-phase, Add exit condition, Add custom guard,
    Apply to my plan, Accept & schedule
      -- der Jahreszyklus-Editor

    DEXA, Photo progression, Compare sessions, Export PDF,
    Cross-module health, Nutrition adherence, Recovery avg

`[read]` **Das ist der *advanced stuff*** — **nicht als Attrappe
markiert, sondern weg.**

## Die Regel, die verletzt wurde

Tom: *,,wir binden mockups an; was nicht anbindbar ist bleibt in der
ui als mockup deklariert, genau aus dem grund dass nichts
verschwindet und keiner mehr weiss um was es geht."*

`[cmd]` **E-68, 2026-09-07.**

`[read]` **Nicht anbindbar ist kein Grund zum Weglassen** — **es ist
ein Grund zum Kennzeichnen.**

## Der Messfehler des Orchestrators

`[read]` **G-355 mass die 110 Datenbankspalten gegen den Schirm** —
**91 von 110 angezeigt, das sah gut aus.**

`[read]` **Die richtige Frage ist Mockup gegen Schirm** — **und dort
fehlen 105 von 341 allein in `goals`.**

`[cmd]` **Die Messung dauerte vier Minuten, nicht Tage.**

## Auftrag — die fehlenden Elemente zurueckbringen

**Beauftragt am 2026-09-07.**

### Reihenfolge

`[read]` **Modul fuer Modul, das schlimmste zuerst** — **aber
`goals` zuerst, weil es gerade offen liegt und Tom es sehen will.**

    goals         105   zuerst
    coach         421
    supplements   263
    medical       199
    recovery      170
    nutrition     152
    training       30

`[read]` **Melde nach `goals`, bevor du weitermachst** — **damit die
Machart einmal abgenommen ist, bevor sie 1.238 Mal wiederholt
wird.**

### Die Form (E-68)

    // Attrappe -- theme-v1/module-goals-pro.jsx
    //   wartet auf: goal_phases-Schreibweg (G-357)

`[read]` **Quelle und Grund.** `[read]` **Wo der Grund unbekannt
ist:** **`wartet auf: unbekannt, nie untersucht`.**

`[read]` **Und sichtbar in der UI** — **nicht als Kommentar in einer
Datei, die niemand oeffnet.**

`[cmd]` **Der `InEntwicklungKnopf` existiert** — **aber pruef, ob er
den Grund traegt oder nur *,,noch nicht"* sagt.**

### Was nicht zu tun ist

**Keine Anbindung bauen** — **dieser Auftrag bringt zurueck, was
verschwunden ist.**

`[read]` **Wo etwas anbindbar waere, melde es** — **es wird ein
eigener Punkt.**

**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    goals           105 Elemente zurueck, gezaehlt
    je Element      Quelle und Grund, sichtbar
    Bildschirmfoto  vorher / nachher
    anbindbar       welche, gemeldet als eigene Punkte

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
