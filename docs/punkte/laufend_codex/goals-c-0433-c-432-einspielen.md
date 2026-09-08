---
nr: C-433
typ: feature
modul: goals
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-432
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-08
---

# C-433 — C-432 einspielen

## Befund

`[cmd]` **C-432 ist gebaut und auf `lumeos_c432_final` geprueft** ?
**168 Schritte, 564,0 s, gruen.**

`[cmd]` **Nicht live.**

## Auftrag

**Mitbeauftragt: C-136.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Einspielen

`[read]` **Vorher Sicherung nach `backup/`, wie bei C-421 bis
C-431.**

`[cmd]` **Danach messen:** **`priority` ohne DEFAULT,
`active_goal_create`, `active_goals`, der Advisory-Lock.**

`[read]` **Und: die fuenf bestehenden Ziele auf `dev` haben
Prioritaeten** ? **pruefen, ob der Wegfall des DEFAULT sie
beruehrt.**

### 2 · C-136 — Medikamente und Conditions brauchen die
Coach-Sicht

`[cmd]` **Seit C-431 stehen `health_events`, `health_timeline`,
`appointments` und der Bucket.**

`[cmd]` **Und `coach.client_permissions` traegt 22 Spalten.**

`[read]` **Miss, was ein Coach von den neuen Tabellen sehen darf** ?
**und ob die Rechte dafuer schon Felder haben.**

`[cmd]` **`SPEC_08_IMPORT_PIPELINE.md:226`: `medical: 'none'` ist
die Vorgabe** ? **ein Coach sieht medizinische Daten nur mit
ausdruecklicher Freigabe.**

`[read]` **E-74 gilt auch hier:** **die Herkunft muss mitkommen,
sonst wird aus einem Zitat eine Behauptung.**

`[read]` **Messen und vorschlagen, nicht bauen.**

### Abnahmebedingungen

    A1  live: priority ohne DEFAULT, active_goal_create,
        active_goals. Je gemessen.
    A2  Sicherung: Pfad und Groesse.
    A3  die fuenf bestehenden Ziele: unveraendert? Belegt.
    A4  ein aktives Ziel ueber den neuen Weg angelegt.
        Welcher Platz?
    A5  C-136: welche Felder fehlen, je Tabelle. Vorschlag.
    A6  Punktelauf gruen nach dem Einspielen.

### Was nicht zu tun ist

`apps/` nicht anfassen ? **Claude Code arbeitet an G-376.**
**Den Dev-Server nicht anfassen** ? **Tom haelt ihn selbst.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
