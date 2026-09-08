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
erledigt: 2026-09-08
commit: cf1eae2a
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

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  priority ohne DEFAULT, active_goal_create live
    A2  Sicherung 51.655.890 Byte, mit SHA-256
    A3  die fuenf dev-Ziele unveraendert: 1, 2, 4, 5, 6, 0 NULL
    A4  Platz 1, dann 2 und 3, der vierte: ACTIVE_SLOTS_FULL
    A6  Punktelauf gruen, 546 Punkte, 25/25, 1,3 s

`[cmd]` **Selbst gemessen: kein DEFAULT, `active_goal_create` da,
die fuenf Ziele mit 1, 2, 4, 5, 6.**

### A3 war die Frage, die zaehlte

`[read]` **Der Wegfall des DEFAULT haette bestehende Zeilen
beruehren koennen.**

`[cmd]` **Er hat es gemessen: 0 NULL** ? **die fuenf tragen ihre
Prioritaeten weiter.**

`[read]` **Und die Nachweiszeilen hat er danach entfernt** ?
**`dev` bleibt, wie es war.**

### A2 mit Pruefsumme

`[cmd]` **51.655.890 Byte, SHA-256 genannt.**

`[read]` **Das ist mehr als der Pfad** ? **eine Sicherung ohne
Pruefsumme ist eine Datei, von der man hofft.**

## C-136 — gemessen, ohne medizinische Inhalte zu lesen

`[read]` **Dieser Halbsatz zaehlt.** `[read]` **Er hat die Struktur
gemessen und die Daten nicht angesehen.**

`[cmd]` **`medical_visibility`: `none | summary | full`, DEFAULT
`none`, mit Ablaufzeit und Aenderungsprotokoll.**

`[cmd]` **Live: 4 von 4 auf `none`** ? selbst nachgemessen.

`[cmd]` **`summary_medical` zeigt nur Befundanzahl und letztes
Datum** ? **keine Medikamente, keine Conditions.**

`[read]` **Die grobe Sperre steht also, und sie steht auf zu.**

### Die Luecke

`[cmd]` **`appointments` und `health_events` haben keine
Coach-Policy** ? **auch mit `full` unsichtbar.**

`[cmd]` **`health_timeline` ist `security_invoker`** ? **bei `full`
zeigt sie Laborbefunde, Ereignisse bleiben weg.**

`[read]` **Das ist kein Fehler, sondern der Stand nach C-431** ?
**die Tabellen sind zwei Tage alt.**

### Vorschlag 3 ist der wichtigste

> *,,Originaldateien nicht implizit mit `medical_visibility='full'`
> teilen."*

`[read]` **Wer eine Zusammenfassung freigibt, hat nicht den Scan
freigegeben.**

`[cmd]` **`medical-originals` bleibt Owner-only** ? **auch ein Coach
mit `full` kommt nicht an die Bytes.**

`[read]` **Er hat es nicht gebaut und als Entscheidung vorgelegt**
? **richtig.**

**Abgenommen, C-434 beauftragt.**

