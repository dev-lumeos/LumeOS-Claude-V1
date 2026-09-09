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
erledigt: 2026-09-08
commit: 9ecba75e
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

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  live: 16 Orte, alte IDs 0
    A2  vor und nach dem Loeschen: 0 Referenzen
    A3  die Regelzuordnung, je Spalte
    A4  sechs Spalten gebaut, RLS unveraendert
    A5  Nadelempfehlungen 8 -> 0 direkte Ziele
    A6  Sicherung 27 MB Dump + 199 MB SQL, beide mit SHA-256
    A7  Vollkette 172 Schritte, 634,2 s, Punktelauf 25/25

`[cmd]` **Selbst gemessen: 16 Orte, alte IDs weg, alle sechs
Spalten da.**

### A3 ist die Antwort auf meine Frage

`[read]` **Ich fragte: welche Spalte braucht welche Regel, und
sind alle sechs noetig?**

    volume_ml        volume_limit + Lastmetrik overuse_30d
    pain_score       pain_trend
    complication     complication_repeat + Lastmetrik
    route            route_mismatch
    substance_name   gefrorener Snapshot und Regelmeldung
    override_reason  Begruendung fuer die drei Sperren

`[read]` **Keine ist ueberfluessig, und zwei tragen doppelt.**

`[cmd]` **`substance_name` ist ein Snapshot** ? **dieselbe Machart
wie der Coach-Name in C-268.**

### Und eine Abweichung, die er begruendet

`[cmd]` **Die Spec schreibt `subq`, der C-385-Datenvertrag nutzt
`sc`** ? **die neue Spalte nimmt `im|sc`.**

`[read]` **Er hat den bestehenden Vertrag ueber die Spec
gestellt** ? **richtig, zwei Schreibweisen fuer dieselbe Sache
waeren schlimmer als eine Abweichung von der Spec.**

`[cmd]` **Und die Werteliste fuer `complication` ist geschlossen:**
`none, bleeding, lump, swelling, redness, leakage,
nerve_sensation`.

### A5 — der Vorschlag ist der richtige

`[cmd]` **Nach C-441 zeigen alle acht Nadelempfehlungen ins
Leere.**

> *,,Seitliche Orte ueber einen separaten anatomischen Typ an die
> generischen Empfehlungen anbinden, nicht L/R-Nadeln
> duplizieren."*

`[read]` **Eine Nadel fuer Deltoid links und rechts ist dieselbe**
? **acht Empfehlungen zu sechzehn zu machen waere die falsche
Antwort.**

### A6 — zwei Sicherungen statt einer

`[cmd]` **Dump 27 MB und SQL 199 MB, beide mit SHA-256.**

`[read]` **Das SQL ist lesbar, der Dump ist schnell** ? **wer
etwas nachsehen will, braucht das erste.**

### Der Nebenbefund geht als C-446 weiter

`[cmd]` **`20260902070454_c385_qualify_body_measurement_context.sql`
existiert, ist live, steht NICHT in `kette.json`** ? **selbst
nachgemessen, 0 Treffer.**

`[read]` **`dev` und die Kette laufen auseinander.** `[read]` **Und
die Vollkette meldet trotzdem `SCHEMA VOLLSTAENDIG`.**

`[read]` **Er hat es gemeldet, nicht behoben** ? wie beauftragt.

**Abgenommen.**

