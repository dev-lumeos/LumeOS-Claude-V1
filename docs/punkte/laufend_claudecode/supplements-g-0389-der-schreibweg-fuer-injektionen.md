---
nr: G-389
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-388
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
  blockiert: 6
  baubar: 4
---

# G-389 — der Schreibweg fuer Injektionen

## Befund

Aus G-388, Claude Code, 2026-09-08.

`[cmd]` **Nachgemessen: alle vier Policies stehen.**

    injection_logs_select    injection_logs_insert
    injection_logs_update    injection_logs_delete

`[cmd]` **Und die Zeilen:**

    injection_sites                        4
    injection_needle_recommendations       8
    injection_tissue_condition_guidance    1
    injection_logs                         0
    injection_site_conditions              0

`[read]` **Die Erlaubnis liegt seit C-429 da, der Weg dazwischen
fehlt** ? **vierzehnter A-71-Fall.**

`[cmd]` **Und er gehoert nach `apps/`** ? **die zwei
`medical.injection_*`-Funktionen sind Leser
(`_body_measurement_context`, `_needle_suggestions`), keine
Schreiber.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Der Schreibweg

`[read]` **Eine Injektion erfassen: Ort, Zeitpunkt** ? **das sind
die sechs Spalten von `injection_logs`.**

`[cmd]` **`E-74` gilt auch hier** ? **miss, ob die Tabelle eine
Herkunft traegt oder braucht.**

`[read]` **Und die Rotation ist der Zweck:** `rotation_distance_mm`,
`rotation_quadrant_interval_days`, `minimum_rest_days` **werden erst
sinnvoll, wenn Zeilen da sind.**

### 2 · Die sechs blockierten Kacheln

`[read]` **Du hast sie gemessen** ? **bau sie, sobald der Weg
steht.**

`[read]` **Und melde je Kachel, was sie zeigt, wenn null Zeilen da
sind** ? **E-72: keine nackte Null.**

### 3 · Die vier sofort baubaren

`[read]` **Waren nicht beauftragt** ? **jetzt schon.**

`[cmd]` **`injection_needle_recommendations` hat 8 Zeilen,
`injection_tissue_condition_guidance` eine** ? **die tragen
Kacheln ohne neuen Schreibweg.**

### 4 · Was du NICHT bauen sollst

`[cmd]` **`injection_site_conditions` hat 0 Zeilen und keine
Kachel.**

`[read]` **Miss, was die Tabelle traegt, und melde, ob sie eine
Kachel braucht** ? **bau keine fuer eine leere Tabelle.**

`[read]` **Und die Ring-Option fuer SubQ in `packages/ui`:
nicht anfassen** ? **melden, wenn sie noetig wird.**

### Abnahmebedingungen

    A1  eine Injektion erfasst. Zahl: injection_logs
        vorher/nachher.
    A2  die Rotation rechnet. Zahl: Orte / davon ruhend,
        mit Begruendung je Ort.
    A3  die sechs Kacheln: gebaut, je mit Zahl.
    A4  die vier baubaren: gebaut, je mit Zahl.
    A5  E-72: Zahl: Kacheln / mit Daten / mit Leerhinweis /
        nackte Nullen.
    A6  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A7  injection_site_conditions: braucht sie eine Kachel?
        Mit Grund.

### Was nicht zu tun ist

**Nichts in `supabase/`** ? **die Policies stehen schon, Codex
arbeitet an C-440.**
**Nichts in `packages/ui`.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
