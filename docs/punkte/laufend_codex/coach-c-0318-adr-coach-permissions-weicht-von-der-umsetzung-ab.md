---
nr: C-318
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: A-37
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-318 - ADR-Coach-Permissions weicht von der Umsetzung ab

## Befund

ADR_COACH_PERMISSIONS_V1 verlangt Freigabe pro Modul und Subfunktion; gebaut ist nur die Modulstufe. Die offene Produktfrage liegt in A-43.

## Auftrag — zwei Werkzeug- und Schemabefunde

**Mitbeauftragt: B-20.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · C-318 — der ADR weicht von der Umsetzung ab

`[cmd]` **Heute hast du in A-37 gemessen, dass
`ADR_COACH_PERMISSIONS_V1` durch E-11 und E-29 teilweise abgeloest
ist.** `[cmd]` **Der Vermerk steht seit C-357 im Kopf des ADR.**

`[read]` **Dieser Punkt ist aelter und nennt eine Abweichung zwischen
ADR und Umsetzung.** **Miss, ob es dieselbe ist** — **dann ist er
erledigt.**

`[read]` **Wenn nicht: sag, welche Abweichung bleibt.** `[cmd]`
**`client_permissions` und `client_autonomy` sind live, und
`coach.darf_nutrition_plan_aendern()` liest sie.**

### 2 · B-20 — Codex-Pfadschutz wiederherstellen

`[read]` **Miss zuerst, was der Schutz war und ob er fehlt.** `[cmd]`
**Der Punkt ist aelter als die Punktverwaltung** — **`.codex/` steht
in `CLAUDE.md` unter *nicht als Referenz lesen*.**

`[read]` **Wenn der Schutz an einer Stelle liegt, die es nicht mehr
gibt: schliessen.** **Wenn er fehlt und gebraucht wird: sagen,
wofuer.**

### Was nicht zu tun ist

**Keinen ADR aendern** — C-357 hat die Vermerke gesetzt.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    C-318 gegen A-37    dieselbe Abweichung? belegt
    was bleibt          benannt
    B-20                Schutz vorhanden / fehlt / gegenstandslos

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
