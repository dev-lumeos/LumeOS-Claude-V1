---
nr: C-425
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-353
entscheidung: null
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-08
  vorgabe: 5
  erlaubt_aktiv: 3
---

# C-425 — die Vorgabe von `priority` faellt durch den CHECK

## Befund

Aus G-353, Claude Code, 2026-09-08, beim Aufbau der Nachweisbuehne.

`[cmd]` **Nachgemessen:**

    user_goals_priority_check   priority 1 bis 10
    user_goals_check1           status <> 'active' ODER 1 bis 3
    Vorgabe                     5

`[read]` **Ein aktives Ziel laesst sich ueber die Vorgabe nicht
anlegen** — **5 faellt durch `user_goals_check1`.**

`[read]` **Jeder Schreibweg muss `priority` selbst setzen, sonst
scheitert das Anlegen.**

## Warum es zaehlt

`[cmd]` **G-354 hat gemessen: die Drei ist doppelt gesichert** —
**CHECK und ein eindeutiger Index auf `(user_id, priority)` bei
`status = 'active'`.**

`[read]` **Die Regel ist also gewollt:** **drei aktive Ziele,
Plaetze 1 bis 3.**

`[read]` **Nur die Vorgabe passt nicht dazu.**

## Zu klaeren

`[read]` **Vorgabe auf 1 senken?** `[read]` **Dann kollidiert das
zweite aktive Ziel mit dem eindeutigen Index.**

`[read]` **Oder die Vorgabe entfernen und `priority` zur Pflicht
machen?** `[read]` **Dann muss jeder Schreibweg den naechsten freien
Platz suchen** — **und das ist die eigentliche Arbeit.**

`[cmd]` **G-354: *,,offen ist nur, welchen freien Platz ein neues
Ziel bekommt."*** — **dieselbe Frage, jetzt mit Fundstelle.**
