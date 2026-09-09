---
nr: C-445
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-441
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [medical.injection_sites]
zahlen:
  gemessen: 2026-09-08
  orte: 16
  log_spalten: 6
---

# C-445 — C-441 einspielen und die Protokollspalten

## Befund

`[cmd]` **C-441 ist gebaut und gruen** ? **16 Orte, Vollkette
414,3 s.** `[cmd]` **Nicht live.**

`[cmd]` **Und Claude Code hat den Blocker gemessen:**

    medical.injection_logs, 6 Spalten
      id, user_id, injection_site_id, injected_at,
      created_at, updated_at

    Die Spec braucht zusaetzlich
      volume_ml, pain_score, complication[],
      substance_name, route, override_reason

`[read]` **Alle vier Regeln aus Abschnitt 6 lesen eine Spalte, die
es nicht gibt** ? `volume_limit`, `overuse_30d`, `pain_trend`,
`complication_repeat`.

`[read]` **Ein Schreibweg koennte heute nur festhalten, DASS
injiziert wurde.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Einspielen

`[read]` **Vorher Sicherung nach `backup/`.**

`[cmd]` **Und dein eigener Schutz greift:** **die vier alten IDs
werden nur entfernt, wenn nichts sie referenziert** ? **gemessen 0
Logs, 0 Zustaende.**

`[read]` **Miss es auf `dev` erneut, bevor du loeschst** ? **dort
koennte inzwischen etwas liegen.**

### 2 · Die sechs fehlenden Protokollspalten

`[cmd]` **`Injection Planner - Spec Change Request.md`, Abschnitt
3 (`injection_logs`) und Abschnitt 6 (die Regeln).**

`[read]` **Miss zuerst, welche Spalte welche Regel braucht** ?
**und ob alle sechs noetig sind oder nur die, die eine Regel
liest.**

`[cmd]` **`complication[]` ist ein Feld mit mehreren Werten** ?
**miss, ob die Spec eine Werteliste nennt.**

`[read]` **`override_reason` ist der interessanteste:** **eine
Sperre, die man mit Begruendung uebergehen kann, ist etwas anderes
als eine Sperre.**

`[read]` **Miss, was die Spec dazu sagt** ? **und bau es nur, wenn
sie es traegt.**

### 3 · Die acht Nadel-Empfehlungen

`[cmd]` **Dein eigener Befund: sie zeigen auf `deltoid`,
`ventrogluteal`, `vastus_lateralis`, `subcutaneous`** ? **die
alten, seitenlosen Schluessel.**

`[read]` **Nach dem Einspielen zeigen sie ins Leere.**

`[read]` **Miss, ob eine Empfehlung ueberhaupt seitig sein muss** ?
**eine Nadel fuer *Deltoid links* und *Deltoid rechts* ist
dieselbe.**

`[read]` **Wenn nein: der Schluessel muss auf die Ortsart zeigen,
nicht auf den Ort** ? **das ist eine Schemafrage, kein
Datenproblem.**

### 4 · Der Nebenbefund

`[cmd]` **`medical.injection_body_measurement_context`: `measurement_date`
ist mehrdeutig, gefunden von der C-385-Probe.**

`[read]` **Miss und melde** ? **nicht in diesem Auftrag beheben.**

### Abnahmebedingungen

    A1  live: 16 Orte, je mit Kennung. Zahl vorher/nachher.
    A2  die vier alten: entfernt oder gehalten, mit Grund.
    A3  welche Protokollspalte welche Regel braucht. Tabelle.
    A4  die Spalten gebaut, je gemessen.
    A5  die acht Nadel-Empfehlungen: zeigen sie noch irgendwohin?
        Zahl, und ein Vorschlag.
    A6  Sicherung: Pfad, Groesse, Pruefsumme.
    A7  Vollkette und Punktelauf gruen.

### Was nicht zu tun ist

`apps/` nicht anfassen ? **Claude Code arbeitet an G-390.**
**`measurement_date` nicht beheben** ? **melden.**
**Keine seitige Nadelaufloesung erfinden** ? **dein eigener Satz.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
