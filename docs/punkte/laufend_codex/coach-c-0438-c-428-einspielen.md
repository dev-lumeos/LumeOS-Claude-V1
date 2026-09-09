---
nr: C-438
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-428
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
---

# C-438 — C-428 einspielen

## Befund

`[cmd]` **C-428 ist gebaut und gruen** ? **169 Schritte, 340,0 s,
18 Zusicherungen.**

`[cmd]` **Nicht live: `coach.pending_invites` gibt es auf `dev`
nicht.**

## Auftrag

**Mitbeauftragt: C-437.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Einspielen

`[read]` **Vorher Sicherung nach `backup/`, wie bei C-421 bis
C-435.**

`[cmd]` **Danach messen:** **die Tabelle, die RLS-Regel, dass
`anon` kein EXECUTE hat, und ein Durchlauf Einladung ->
Annahme.**

### 2 · C-437 — der Snapshot wird nicht gefuellt

`[cmd]` **Auf `dev` gemessen:**

    coach.relationships          6 Zeilen
    davon coach_display_name     0 gefuellt
    coach.coach_profiles         0 Zeilen

`[cmd]` **In deiner Wegwerf-Kette tragen drei von sechs einen
Namen** ? **und alle drei sind AELTER als die Spalte.**

`[read]` **Claude Codes Satz dazu:** *,,Ein Snapshot, der
nachtraeglich gefuellt wurde, ist keiner ? er traegt den heutigen
Namen mit dem Datum von damals."*

`[read]` **Eine Einladung vom 20.08. behauptet, der Coach habe
damals so geheissen.**

`[read]` **Miss, woher die drei Namen kamen** ? **setzt der Seed
sie?** `[read]` **Und wenn ja: soll er das?**

`[cmd]` **Die sechs dev-Zeilen sind alle vor C-268 entstanden** ?
**sie koennen keinen Snapshot bekommen, niemand weiss den Namen von
damals.**

`[read]` **Leer ist ehrlich** ? **wie die sieben Zeilen ohne
Herkunft in C-435.**

`[cmd]` **Und `coach_profiles` ist leer:** **miss, wann ein Eintrag
entsteht.** `[cmd]` **`SPEC_02:39` nennt `display_name`, aber nicht,
wer die Zeile anlegt.**

### Abnahmebedingungen

    A1  live: pending_invites, RLS, anon ohne EXECUTE.
    A2  ein Durchlauf Einladung -> Annahme auf dev.
        Zahlen vorher/nachher, je Tabelle.
    A3  Sicherung: Pfad, Groesse, Pruefsumme.
    A4  woher die drei Namen kamen. Fundstelle.
    A5  wann entsteht ein coach_profiles-Eintrag?
        Gemessen oder als Vorschlag.
    A6  Punktelauf gruen nach dem Einspielen.

### Was nicht zu tun ist

**Keinen Snapshot nachtraeglich fuellen.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-224.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
