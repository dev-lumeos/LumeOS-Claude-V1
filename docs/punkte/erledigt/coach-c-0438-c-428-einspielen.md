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
erledigt: 2026-09-08
commit: 9afaa804
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

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  pending_invites live, leer, RLS aktiv
        anon: kein SELECT, kein EXECUTE
    A2  Durchlauf mit ROLLBACK: 0->1, 6->7, 4->5, 4->5, 0->1
        danach wieder 0 / 6 / 4 / 4 / 0
    A3  Sicherung 1.293.994 B, SHA-256
    A4  die drei Namen kommen aus dem Seed, Zeile 3268
    A5  coach_profiles entsteht nur durch Seed und Fixtures
    A6  Punktelauf gruen, 561 Punkte, 4,0 s

`[cmd]` **Selbst gemessen: Tabelle da, 0 Zeilen, Policy
`pending_invites_select_own`.** `[cmd]` **Und nach dem Rollback
unveraendert: 6 Beziehungen, 0 Profile, 0 Snapshots.**

### Der pgcrypto-Fund ist die wertvollste Stelle

`[cmd]` **`dev` hat `pgcrypto` in `extensions`, die Aufbaukette in
`public`** ? **selbst nachgemessen: `extensions`.**

`[read]` **Er hat es ueber `pg_extension` aufgeloest, statt einen
Pfad zu raten** ? **und der enge `SECURITY DEFINER`-Suchpfad
bleibt.**

`[read]` **Ein fest verdrahteter Pfad haette auf `dev` funktioniert
und aus der Baseline nicht** ? **oder umgekehrt.**

`[cmd]` **Jetzt baut die Vollkette aus beidem.**

### A2 — der Durchlauf mit Rollback

`[read]` **Er hat auf `dev` gemessen, was nur mit echten Daten
messbar ist** ? **und nichts hinterlassen.**

`[cmd]` **Auch das transaktionale `coach_profiles` 0 -> 1 -> 0.**

`[read]` **Dieselbe Machart wie C-435** ? **sie hat sich zweimal
bewaehrt.**

### C-437 — beantwortet, und die Antwort ist unbequem

`[cmd]` **`testdaten-einspielen.ts:3158` legt *Coach Seed* an,
Zeile 3268 schreibt denselben Wert bei drei Beziehungen.**

`[cmd]` **Die sind auf *vor 120 bzw. 45 Tagen* datiert.**

> *,,Es behauptet rueckwirkend den heutigen Seed-Namen."*

`[read]` **Er hat es NICHT geaendert** ? **richtig, das ist eine
Entscheidung.**

`[cmd]` **Und `dev` bleibt ehrlich: 6 Beziehungen, 0 Snapshots,
kein Default, kein Backfill.**

### Der Befund, der weitergeht

`[cmd]` **`coach_profiles` entsteht nur durch Seed und
Test-Fixtures.** `[cmd]` **Und C-428 verlangt ein aktives
Profil.**

`[read]` **Ein Coach meldet sich an und kann niemanden einladen** ?
**der Weg ist fuer echte Nutzer verschlossen.**

**Als C-439.**

**Abgenommen.**

