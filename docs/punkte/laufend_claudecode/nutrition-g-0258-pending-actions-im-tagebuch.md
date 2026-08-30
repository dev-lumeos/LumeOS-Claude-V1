---
nr: G-258
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-254
entscheidung: E-29
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  tabellen: [coach.pending_actions]
zahlen: null
---

# G-258 — Pending actions im Tagebuch

## Befund

`[cmd]` **`coach.pending_actions` traegt Zeilen und eine Spalte
`module`** — die Tabelle ist modulueebergreifend gedacht.

`[read]` **Eine der sechs Kacheln aus G-254**, herausgeloest, weil
Tom sie am 2026-08-29 entschieden hat. **Die anderen fuenf bleiben
dort offen.**

## Entschieden: E-29

**Ueber eine Funktion, nicht direkt.**

`[cmd]` **Das Coach-Schema fuehrt drei Aenderungsprotokolle**, und
`client_permissions` / `client_autonomy` sagen, was ein Coach darf.
`[read]` **Ein direkter Lesezugriff umgeht beides und muesste die
Rechtelogik nachbauen** — ab dem zweiten Modul doppelt.

## Offen

`[read]` **Die Gegenrichtung:** wenn ein Modul eine offene
Coach-Aktion zeigt, kann der Nutzer sie vermutlich bestaetigen.
**Ein Schreibweg zurueck ist eine eigene Entscheidung** — er beruehrt
`confirmed_by` und die Protokolle.

## Auftrag

**Mitbeauftragt mit G-276 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Blockiert, 2026-08-30

**Aus G-276 gemessen:** keine der 16 coach-Funktionen liest `pending_actions`; RLS liesse
direkt lesen, E-29 verbietet es.

`[read]` **Wartet auf C-354.**

## Auftrag — entblockt am 2026-08-30

`[cmd]` **`coach.offene_aktionen(p_modul text)` ist live** — als
`SECURITY DEFINER`, **ohne `client_id`-Parameter: ausschliesslich
`auth.uid()` bestimmt den Klienten.** `[cmd]` **Fuer `dev` liefert sie
2 Zeilen, fuer einen anderen Klienten 0.** `[cmd]` **`authenticated`
darf, `anon` nicht.**

`[read]` **Das ist die Naht aus E-29.** **Du hast am 30.08. gemeldet,
dass keine der 16 Funktionen `pending_actions` liest — jetzt tut es
eine.**

`[cmd]` **Ein Befund aus dem Bau:** die beiden `dev`-Zeilen tragen
einen vergangenen `expires_at` und trotzdem `status = 'pending'`.
**Die Funktion gibt beides unveraendert aus.** `[read]` **Ein
Verfall-Schreibweg wurde nicht gebaut** — **also muss die Anzeige
entscheiden, was sie mit abgelaufenen Aktionen tut.**

### Regeln

`[cmd]` **A-30, A-59, A-62.** **Nichts auf `dev@lumeos.app`
schreiben.** Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    echte Zeilen        am Schirm, mit Bildschirmfoto
    Leerzustand         wo er auftritt, benannt
    Attrappen           vorher / nachher
    Ladezeit            ms, kalt und warm

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
