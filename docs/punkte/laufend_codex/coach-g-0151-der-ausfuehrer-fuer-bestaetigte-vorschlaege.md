---
nr: G-151
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: F-07
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-151 - Der Ausfuehrer fuer bestaetigte Vorschlaege

## Befund

(neu
  2026-08-20). Aus F-07, bewusst nicht gebaut.

  `[cmd]` **`pending_actions` traegt Vorschau, Verfall und
  `confirmed_at`** — **aber niemand wendet den `payload` an.**

  `[read]` **Das war schon G-94s Befund:** *„`payload` beschreibt, was
  geschehen soll, niemand wendet es an."*

  `[cmd]` **Er braucht die Autonomy-Wirkungsregeln** — und die haengen
  an T-Entscheidungen. **Eigener Auftrag, nach Toms Antworten.**

## Auftrag — der Ausfuehrer und zwei Coach-Altbestaende

**Mitbeauftragt: G-169, C-173.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-151 — der Ausfuehrer fuer bestaetigte Vorschlaege

`[cmd]` **Seit dem 30.08. steht `coach.offene_aktionen(p_modul)`** —
deine eigene Funktion aus C-354, `SECURITY DEFINER`, ohne
`client_id`-Parameter.

`[cmd]` **Und `coach.pending_actions` traegt 3 Zeilen, alle
abgelaufen und weiter `pending`** (C-358).

`[read]` **Damit ist die Lesenaht da und die Schreibnaht nicht.**
**Miss, was ein bestaetigter Vorschlag ausloesen soll** — und ob es
dafuer einen Weg gibt.

`[cmd]` **`confirmed_by` steht in der Tabelle.** `[read]` **Die
Gegenrichtung war in C-354 ausdruecklich nicht Teil des Auftrags** —
jetzt ist sie es.

### 2 · G-169 — `checkins` und `checkin_templates` liegen unbenutzt

`[read]` **Miss, ob es noch gilt.** `[cmd]` **`checkins.template_id`
war der einzige Treffer bei der Flag-Suche in C-375** — die Tabellen
existieren also.

`[read]` **A-59: was keinen Aufrufer hat, wird beim naechsten Auftrag
fuer gebaut gehalten.**

### 3 · C-173 — `MARKETPLACE_PRODUCTS` mit `inStack` und `evidence`

`[cmd]` **E-37 hat den Marktplatz zurueckgestellt** — vorsehen, nicht
bauen.

`[read]` **Miss, was der Punkt behauptet und ob die Felder heute
irgendwo stehen.** `[read]` **Wenn es eine reine Entwurfsdatei ist:
schliessen.**

### Was nicht zu tun ist

**Kein Coach-UI bauen** — Schema und Lesewege.
**Keinen Marktplatz bauen** — E-37.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    je Punkt ein Urteil   erledigt / gebaut / offen / ueberholt
    Ausfuehrer            was soll geschehen, was fehlt
    confirmed_by          wer setzt es heute
    checkins              Aufrufer? gemessen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
