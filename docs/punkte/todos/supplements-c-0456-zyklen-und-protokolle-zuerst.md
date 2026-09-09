---
nr: C-456
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [supplements.stack_items]
zahlen:
  gemessen: 2026-09-08
  huellen: 6
  zeilen: 0
---

# C-456 — Zyklen und Protokolle zuerst

## Warum

Tom, 2026-09-08:

> ich denke da muss zuerst supplement/extended stehen, bevor wir
> uns an eine rotation machen koennen ? sprich cycleplanner
> (erfassen was wielange) / active protocols (add compound non
> cycle) / etc.

`[read]` **Eine Rotation setzt voraus, dass jemand weiss, WAS er
wann spritzt.** `[read]` **Das steht heute nicht.**

## Was gemessen ist

`[cmd]` **Sechs Huellen, alle leer:**

    user_supplement_cycles             0
    supplement_cycle_events            0
    supplement_protocols               0
    supplement_protocol_items          0
    supplement_protocol_requirements   0
    supplement_reminders               0

`[cmd]` **Und der Stack:**

    stack_items              12
    stack_template_items      6
    user_inventory            0
    intake_schedule           0
    user_supplement_settings  0

`[cmd]` **`stacks` gibt es NICHT** ? **`stack_items.stack_id`
zeigt auf etwas anderes; messen, worauf.**

## Die Spalten tragen mehr, als ich dachte

`[cmd]` **`user_supplement_cycles`:**

    status, source, suggestion_source
    started_at, paused_at, stopped_at
    note_de/en/th

`[read]` **Der Zustandsverlauf ist vorgesehen** ? **angefangen,
pausiert, beendet.**

`[cmd]` **`supplement_cycle_events`:** `event_type`, `metadata`
JSONB ? **ein Protokoll je Zyklus.**

`[cmd]` **`supplement_protocols`:** `schedule` JSONB, `status`,
`source`.

`[cmd]` **`supplement_protocol_items`:** `dose_amount`,
`dose_unit`, `timing`, `with_meal`, `sort_order`.

`[read]` **Das ist Toms *,,active protocols (add compound non
cycle)"*** ? **ein Protokoll ohne Zyklus.**

## Der Widerspruch, der zuerst geloest werden muss

`[cmd]` **`stack_items.cycling` traegt HEUTE Zyklusdaten:**

    {"on_weeks": 8, "off_weeks": 4, "started_on": "2026-09-08"}

`[cmd]` **Mit CHECK, aus G-374.**

`[cmd]` **Und `user_supplement_cycles` traegt dasselbe** ?
`started_at`, `paused_at`, `stopped_at`.

`[read]` **Zwei Orte fuer denselben Zustand.**

`[cmd]` **Die Spec (`SPEC_02:72`) nennt `cycling_protocol` an der
SUBSTANZ:** `{on_weeks: 8, off_weeks: 4, restart_ok: true}` ?
**das ist die Empfehlung, nicht der Lauf.**

`[read]` **Drei Ebenen, und nur zwei gehoeren getrennt:**

    Substanz       cycling_protocol   die Empfehlung
    Stack-Eintrag  cycling            was der Nutzer eingestellt hat
    Zyklus         user_supplement_cycles   der LAUF

`[read]` **`stack_items.cycling.started_on` ist die Vermischung** ?
**ein Startdatum ist ein Lauf, keine Einstellung.**

## Was zu entscheiden ist

**a** ? **`user_supplement_cycles` wird der Lauf**, `stack_items`
**behaelt nur `on_weeks`/`off_weeks` als Einstellung.**

`[read]` **Sauber, aber `started_on` muss umziehen (G-374).**

**b** ? **`stack_items.cycling` bleibt alles**,
`user_supplement_cycles` **wird geloescht.**

`[cmd]` **Dann faellt der Ereignisverlauf weg** ? **`paused_at`,
`stopped_at`, `cycle_events`.**

**c** ? **Beide bleiben, mit klarer Grenze.**

`[read]` **Verlangt eine Regel, die niemand vergisst** ? **die
Erfahrung sagt, dass das nicht haelt** (A-71, vierzehn Faelle).

## Was gebaut werden muss

    1  die Entscheidung a/b/c
    2  ein Schreibweg fuer Zyklen
       -- starten, pausieren, beenden, mit Ereignis
    3  ein Schreibweg fuer Protokolle
       -- Toms "add compound non cycle"
    4  intake_schedule fuellen
       -- was wann genommen wird
    5  DANN die Injektionsrotation (C-455)

`[read]` **Punkt 5 wartet** ? **eine Rotation ueber Substanzen, die
niemand erfasst hat, rechnet nichts.**

## Was schon steht

`[cmd]` **Die Oberflaeche hat einen Zyklusreiter**
(`tab-zyklen.tsx`) ? **messen, was er zeigt.**

`[cmd]` **Und das Altrepo hat `CyclePlanner.tsx`** ? **zwei
Fundstellen, `src/modules/supplements/` und
`apps/app/modules/supplements/`.**
