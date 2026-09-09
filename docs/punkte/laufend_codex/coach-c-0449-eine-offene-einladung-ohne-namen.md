---
nr: C-449
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-442
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  invited: 2
  ohne_namen: 1
---

# C-449 — eine offene Einladung ohne Namen

## Befund

`[cmd]` **Nach C-442 auf `dev` gemessen:**

    60000000-...-203  invited  Coach Seed  2026-09-06
    28fe3790-...-c3f  invited  (leer)      2026-08-20

`[cmd]` **Und die Bedingung ist `NOT VALID`:**

    relationships_invited_coach_name_ck
    convalidated = false

`[read]` **Sie greift nur bei neuen Zeilen** ? **die Zeile vom
20.08. ist aelter als C-268 und rutscht durch.**

## Warum das zaehlt

`[read]` **Sie ist OFFEN.** `[read]` **Jemand koennte sie
annehmen** ? **und der Coach haette keinen Namen.**

`[cmd]` **Die zwei historischen `active`-Zeilen sind der andere
Fall** ? **dort ist leer richtig** (C-439): **niemand weiss, wie
der Coach damals hiess.**

`[read]` **Bei einer offenen Einladung ist es etwas anderes:**
**sie wirkt noch, also braucht sie einen Namen.**

## Auftrag

**Mitbeauftragt: die Rollenluecke.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Die eine Zeile

`[read]` **Miss zuerst, wem sie gehoert** ? **welcher Coach, welcher
Klient, und ob der Coach ein Profil hat.**

`[read]` **Dann entscheidet sich der Weg:**

**a** ? **Der Coach hat ein Profil** ? **den Namen nachtragen ist
kein Erfinden, sondern Nachschlagen.**

**b** ? **Er hat keines** ? **dann kann die Einladung nicht
angenommen werden, und sie gehoert auf `withdrawn`.**

`[cmd]` **`withdraw_relationship_invite` gibt es** (C-269).

`[read]` **Nicht loeschen** ? **eine zurueckgenommene Einladung
bleibt sichtbar.**

### 2 · Die Bedingung scharf stellen

`[cmd]` **`NOT VALID` heisst: bestehende Zeilen ungeprueft.**

`[read]` **Wenn die eine Zeile geloest ist, kann sie
`VALIDATE CONSTRAINT` bekommen** ? **dann gilt sie fuer alle.**

`[read]` **Miss, ob noch etwas anderes durchrutscht.**

### 3 · Die Rollenluecke

`[cmd]` **`SPEC_07:10` verlangt Coach-Rolle PLUS aktives
Profil.**

`[cmd]` **Live: 0 Nutzer mit Coach-Rolle, 0 Funktionen mit
Rollenpruefung.**

`[cmd]` **`061_rollen_admin.sql:52`: Rollen werden bewusst nur
AUSSERHALB der Anwendung vergeben.**

`[read]` **Miss, was das praktisch heisst:** **wer setzt sie, mit
welchem Werkzeug?**

`[read]` **Und ob `onboard_coach` sie voraussetzen sollte** ?
**heute tut es das nicht.**

`[read]` **Messen und vorschlagen, nicht bauen** ? **das ist eine
Entscheidung.**

### Abnahmebedingungen

    A1  wem gehoert die Zeile? Coach, Klient, Profil ja/nein.
    A2  geloest: Name nachgetragen oder zurueckgenommen,
        mit Grund.
    A3  VALIDATE CONSTRAINT: geht es? Belegt.
    A4  rutscht sonst noch etwas durch? Zahl.
    A5  die Rollenluecke: wer setzt eine Rolle, womit.
        Fundstelle.
    A6  ein Vorschlag, ob onboard_coach sie voraussetzen soll.
    A7  Punktelauf gruen.

### Was nicht zu tun ist

**Keinen Namen erfinden** ? **nachschlagen oder zuruecknehmen.**
**Keine Rolle vergeben** ? **das ist die Entscheidung.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-392.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
