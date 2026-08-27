---
nr: G-122
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-123
kinder: []
entscheidung: E-17
agent: claudecode
beauftragt: 2026-08-27
beruehrt:
  tabellen: ["training.exercises", "goals.body_measurements", "recovery.checkins", "medical.lab_result_values", "recovery.modality_log"]
  dateien: []
zahlen: null
---

# G-122 - Fuenf Tabellen mit Daten haben keinen Schreibweg

## Befund

(neu 2026-08-20, aus G-123).

  `[cmd]` **Gemessen: gelesen ja, geschrieben nie.**

  | Tabelle | Zeilen | gesperrter Knopf |
  |---|---|---|
  | `training.exercises` | **1.416** | „Eigene Uebung" |
  | `goals.body_measurements` | **362** | Gewicht, Umfaenge |
  | `recovery.checkins` | **340** | „Check-in" |
  | `medical.lab_result_values` | **280** | „Eigener Messwert" |
  | `recovery.modality_log` | **178** | „Log modality" |

  `[read]` **Zwei brauchen vorher eine Entscheidung:** Bei der eigenen
  Uebung die Abgrenzung (der Katalog ist geteilt, eine eigene waere es
  nicht), beim eigenen Messwert die Unterscheidung von einem
  Laborbefund.

## Auftrag

**Drei Schreibwege bauen. Die zwei mit Entscheidungsbedarf sind
entschieden — siehe `docs/entscheidungen/E-17`.**

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine.** `[cmd]`
**In G-138 war meine ganze Praemisse falsch** — der Schreibweg
existierte seit G-148, und der Punkt hatte Vorlagennamen gegen
Codenamen verglichen. **Pruef zuerst, was es schon gibt.**

### Diese drei

    recovery.checkins            340 Zeilen   ,,Check-in"
    goals.body_measurements      362 Zeilen   Gewicht, Umfaenge
    recovery.modality_log        178 Zeilen   ,,Log modality"

`[read]` **Alle drei tragen bereits `user_id`** und brauchen keine
Entscheidung — nur ihren Schreibweg. **Es ist derselbe Bau wie G-138
und G-211.**

### Nicht in diesem Auftrag

`[cmd]` **Eigene Uebung und eigener Messwert bekommen eigene
Tabellen** (E-17). **Die Tabellen gibt es noch nicht** —
`supabase/_pipeline/` gehoert Codex. **Beschreib im Bericht, was du
braeuchtest; leg nichts an.**

### Was aus G-138 und G-211 uebernommen gehoert

**Eine Naht je Ziel.** `[cmd]` In G-211 war es eine Schreibstelle mit
Sabotageprobe, in G-138 *,,eine Naht mit zwei Enden"* — die Route
uebersetzt HTTP und ruft die Schreibdatei. **Pruef, welche Form hier
passt, und sag es.**

**Snapshots einfrieren, wo es welche gibt.** `[cmd]` In G-138 war das
der eigentliche Nachweis: Stack-Dosis 5 → 10 geaendert, alte
Einnahmen behielten `dose_snapshot` 5. `[read]` **Pruef, ob eine der
drei Tabellen so etwas braucht** — ein Check-in von gestern darf sich
nicht aendern, wenn heute eine Skala angepasst wird.

**Der dritte Zustand, falls es einen gibt.** `[read]` In G-211 war es
*,,wird von keiner Regel geprueft"*, in G-138 gab es ihn nicht, **weil
der Fall strukturell nicht entstehen kann.** Beides ist ein gueltiges
Ergebnis.

### Was nicht zu tun ist

**Keine Tabelle anlegen** — Codex arbeitet an A-55.
**Nichts auf `dev@lumeos.app` speichern.** Schreibende Nachweise auf
`test-user@lumeos.local`, mit gezaehltem Rueckbau.
**Die uebrigen zwei aus G-122 nicht anfangen.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Tabelle: Eintrag anlegen    Zeile da, Pflichtfelder gesetzt
    je Tabelle: aendern            alte Werte nicht verloren
    Snapshots, falls noetig        eingefroren, mit Gegenprobe
    Schreibstellen je Ziel         Zahl, und welche Form
    Attrappen im neuen Code        Soll 0
    Rueckbau                       gezaehlt, `dev` unberuehrt
    Bildschirmfoto je Zustand      `node tools/schuss.mjs`

`[read]` **Negativprobe:** einen Eintrag mit einer `user_id`
schreiben, die es nicht gibt. `[cmd]` **Pruef, ob ein Fremdschluessel
das schon erzwingt** — bei `medication_products.formulation_id` und
`user_medications` war es so, **und dann ist *,,strukturell
ausgeschlossen"* das Ergebnis. Kein Constraint loesen, um es doch zu
zeigen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205, nicht dein
Fehler). `python tools/server.py start`, nie `pnpm dev`.
`[cmd]` **A-30 im Kopf behalten:** kein Wert-Import aus dem Leseweg
in eine Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
