---
nr: C-383
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-379
entscheidung: E-54
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [goals.goal_phases]
zahlen:
  gemessen: 2026-09-02
  goal_phases: 5
---

# C-383 — gehoeren Plaene in `goal_phases`?

## Befund

Aus E-54, 2026-09-02.

Tom: *,,das kann ein komplettes jahr sein als beispiel mit allen
phasen parallel zu training/supplement etc."*

`[cmd]` **Das Muster gibt es schon zweimal:**

    goals.goal_phases                  5 Zeilen, 14 Spalten
    supplements.user_supplement_cycles 0 Zeilen

`[cmd]` **`goal_phases` fuehrt:** `goal_id`, `phase_type`, `variant`,
`parameters jsonb`, `gueltig_ab`, `projected_end_date`,
`actual_end_date`, `transitioned_from`, `recommended_next`,
`transition_reason`.

`[read]` **Das ist bereits eine Zeitachse mit Uebergaengen** —
geplantes und tatsaechliches Ende getrennt, Herkunft und Empfehlung
festgehalten.

`[read]` **Zwei Module haben es unabhaengig erfunden. Nutrition waere
das dritte.**

## Zu messen

`[read]` **Traegt `parameters jsonb` schon Verweise auf Plaene?**
`[cmd]` **Das ist zu lesen, nicht anzunehmen** — fuenf Zeilen stehen
drin.

`[read]` **Und wie verhaelt sich `gueltig_ab` zu
`meal_plans.start_date`?** `[cmd]` **Heute setzt das Aktivieren es**
(G-306). `[read]` **In einer Phase waere es abgeleitet** — **sonst
gibt es zwei Wahrheiten ueber denselben Tag.**

`[read]` **Und `phase_type`: welche Werte gibt es, wer setzt sie?**

## Warum es zuerst gemessen wird

`[read]` **Eine dritte Fassung derselben Sache waere der Fehler, den
wir bei den fuenf Suchen gefunden haben** (G-323) — **acht Lehren in
einer, sieben Kopien ohne.**

`[cmd]` **Und `next_plan_id` bleibt** — **es traegt *danach kommt B*,
nicht *von Maerz bis Mai, dreimal wiederholt*.**

## Auftrag — die Zeitachse messen

**Mitbeauftragt: C-36, C-24.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-383 — gehoeren Plaene in `goal_phases`?

`[cmd]` **`goals.goal_phases` traegt 5 Zeilen und 14 Spalten**,
darunter `parameters jsonb`, `gueltig_ab`, `projected_end_date`,
`actual_end_date`, `transitioned_from`, `recommended_next`.

`[read]` **Lies die fuenf Zeilen.** **Traegt `parameters` schon
Verweise auf Plaene?** `[read]` **Das ist zu lesen, nicht
anzunehmen.**

`[read]` **Und `phase_type`: welche Werte gibt es, wer setzt sie?**

`[cmd]` **`supplements.user_supplement_cycles` fuehrt dasselbe
Muster** — `started_at`, `paused_at`, `stopped_at`, `source`.
**0 Zeilen.**

`[read]` **Zwei Module haben es unabhaengig erfunden. Nutrition waere
das dritte** — **das ist der Fehler aus G-323, acht Lehren in einer
Suche und sieben Kopien ohne.**

### Und die Frage, die daran haengt

`[cmd]` **`meal_plans.start_date` setzt heute das Aktivieren**
(G-306). `[cmd]` **`goal_phases.gueltig_ab` traegt den Beginn einer
Phase.**

`[read]` **In einer Phase waere das Startdatum abgeleitet** —
**sonst gibt es zwei Wahrheiten ueber denselben Tag.**

### 2 · C-36 — kuratierte Zuordnung statt Ableitung

`[read]` **Lies den Punkt und miss, ob er noch gilt.** `[cmd]`
**E-55 hat seither entschieden, dass Kuration in einer zweiten
Tabelle steht** — **derselbe Gedanke, andere Ebene.**

### 3 · C-24 — Halbfertigprodukte ranken als Grundzutat

`[cmd]` **Miss, ob es noch gilt.** `[cmd]` **Seit G-281 traegt die
Suche einen Treffergrund** — **er koennte zeigen, warum ein
Halbfertigprodukt oben steht.**

### Was nicht zu tun ist

**Keine Tabelle anlegen** — dieser Auftrag misst.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    goal_phases        die fuenf Zeilen, was steht in parameters
    phase_type         welche Werte, wer setzt sie
    gueltig_ab         wie verhaelt es sich zu start_date
    dritte Fassung     noetig oder vermeidbar? begruendet
    C-36, C-24         gilt / ueberholt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
