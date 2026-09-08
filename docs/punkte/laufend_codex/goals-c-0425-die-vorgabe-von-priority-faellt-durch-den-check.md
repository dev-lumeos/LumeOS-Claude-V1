---
nr: C-425
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-353
entscheidung: null
agent: codex
beauftragt: 2026-09-08
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

## Gemessen am 2026-09-08 — der Widerspruch liegt tiefer

`[cmd]` **`docs/specs/Goals/DATABASE.md:57-58`:**

    priority INTEGER DEFAULT 5
      CHECK (priority BETWEEN 1 AND 10)

`[cmd]` **`docs/specs/Goals/FEATURES.md:10`:** *,,Priority 1?10 +
Primary Goal Flag (nur eines gleichzeitig)"*

`[cmd]` **Die Datenbank traegt beides UND eine dritte Regel:**

    user_goals_priority_check   1 bis 10       -- aus der Spec
    user_goals_check1           active: 1 bis 3
    uq_user_goals_active_slot   eindeutig auf (user_id, priority)
                                bei status='active'
    Vorgabe                     5

`[read]` **Der Widerspruch ist nicht die Vorgabe** — **es ist die
Drei gegen die Zehn.**

`[read]` **Die Spec kennt eine Zehnerskala mit einem Hauptziel.**
**Die Datenbank kennt drei Plaetze.**

`[cmd]` **Der Bestand folgt der Datenbank:** **active auf 1 (3x) und
2 (2x), alles ueber 3 ist `achieved`, `missed` oder
`abandoned`.**

`[read]` **Die Drei ist also gelebt, nicht nur geschrieben.**

## Auftrag — die drei Regeln in Einklang bringen

**Mitbeauftragt: C-426.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Lies zuerst

`[cmd]` **`00-QUELLEN.md`, Abschnitt goals.** `[cmd]` **Dann
`docs/specs/Goals/DATABASE.md` und `FEATURES.md`.**

`[read]` **Und `G-352`** — **dort wurden vier Achsen gemessen, und
die Drei war schon Thema.**

### 1 · C-425 — was gilt?

`[read]` **Drei Moeglichkeiten, und du sollst messen, nicht
waehlen:**

**a** — **Die Drei gilt.** `[read]` **Dann ist die Vorgabe 5 falsch
und `user_goals_priority_check` zu weit.**

**b** — **Die Zehn gilt.** `[read]` **Dann sind `check1` und der
eindeutige Index zu eng, und *Primary Goal Flag* fehlt als
Spalte.**

**c** — **Beides.** `[read]` **Zehn Prioritaeten, drei davon
aktiv.** `[cmd]` **Das ist der heutige Stand, nur ohne brauchbare
Vorgabe.**

`[read]` **Miss, was die Oberflaeche annimmt** — `[cmd]` **G-354
hat die Zielliste angebunden, sie kennt die Antwort vielleicht
schon.**

`[read]` **Und schlag vor, welcher Platz ein neues aktives Ziel
bekommt** — **G-354 nennt das als offene Frage.**

### 2 · C-426 — acht Autonomieachsen

`[cmd]` **Sieben von acht Achsen haben keine Erlaubnisliste.**
`[cmd]` **Genau ein fachlicher Leser: `nutrition_level >= 5`.**

`[cmd]` **Und deine eigene Berichtigung: `safety_level` geht 1 bis
3, die anderen 1 bis 5.**

`[read]` **Miss, was `AUTONOMY_ARCHITECTURE.md` je Stufe erlaubt** —
**444 Zeilen im Vorgaengerrepo, eine Achse, fuenf Stufen.**

`[read]` **Und schlag vor, wie daraus acht werden** — **nicht
bauen.**

### Abnahmebedingungen

    A1  C-425: welche der drei Moeglichkeiten, mit Fundstelle.
    A2  was die Oberflaeche heute annimmt, gemessen.
    A3  ein Vorschlag fuer den Platz eines neuen Ziels.
    A4  C-426: die Erlaubnisliste des Altrepos, je Stufe.
    A5  ein Vorschlag fuer acht Achsen, mit Aufwand.

### Was nicht zu tun ist

**Nicht bauen** — **dieser Auftrag misst und schlaegt vor.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
