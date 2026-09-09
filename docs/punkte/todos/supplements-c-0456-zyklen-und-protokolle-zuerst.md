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

## Spec und Altrepo gelesen, 2026-09-08

Tom: *,,und lies die specs und altes repo noch dazu."*

### Der Widerspruch ist keiner — beide Ebenen sind vorgesehen

`[cmd]` **`SPEC_02_ENTITIES.md:245-247`, am STACK-EINTRAG:**

    cycling  JSONB
      {on_weeks: 8, off_weeks: 4,
       start_date: "2026-01-01", current_phase: "on"}

`[cmd]` **Und `SCHEMA_NEUAUFBAU.md:322`:**

    user_supplement_cycles  ALT
      status: active | paused | stopped
      source: ...

`[read]` **Die Spec will `start_date` UND `current_phase` im
Stack-Eintrag** ? **also ist die Vermischung Absicht, nicht ein
Fehler von G-374.**

`[read]` **Der Unterschied:**

    stack_items.cycling     der laufende Zustand,
                            aus dem die Oberflaeche rechnet
    user_supplement_cycles  der VERLAUF, mit Ereignissen

`[cmd]` **`SPEC_09_SCORING.md:168-175` rechnet aus `cycling`:**

    cycleLength = (on_weeks + off_weeks) * 7
    posInCycle  = ((daysDiff % cycleLength) + cycleLength) % cycleLength
    return posInCycle < onDays

`[read]` **Eine Formel, kein Tabellenzugriff** ? **deshalb steht
sie am Eintrag.**

**Damit faellt Variante b und c** ? **es ist a, aber anders als
gedacht: BEIDE bleiben, mit klarer Aufgabe.**

### Was `SCHEMA_NEUAUFBAU:332` klaerstellt

> *,,`supplement_protocols` ist die Antwort auf `requires_pct` /
> `requires_ai` / `requires_serm`: nicht drei Boolean-Felder,
> sondern ein Protokoll mit Positionen. Die Boolean sagen OB, das
> Protokoll sagt WAS."*

`[read]` **Genau Toms *,,add compound non cycle"*.**

`[cmd]` **Und Zeile 337: der Vorgaenger verwies auf
`marketplace_product_id`** ? **hier nicht (G-164).**

### Das Altrepo: `CyclePlanner.tsx`, 718 Zeilen, 36 KB

`[cmd]` **Die groesste Komponente des alten Moduls** (Zeile 326).

**Drei Konstanten darin:**

`[cmd]` **`FRONT_SITES` / `BACK_SITES`** ? **die Injektionsorte
liegen IM Zyklusplaner:**

    front  delt_l/r, pec_l/r, bicep_l/r, quad_l/r
    back   vg_l/r, glute_l/r, lat_l/r, tricep_l/r

`[read]` **Genau die 16 Punkte, die heute in
`koerperkarte-pfade.ts` stehen** ? **sie stammen von dort.**

`[read]` **Und der Vorgaenger hat die Rotation NICHT getrennt:**
**wer einen Zyklus plant, waehlt dort die Stellen.**

`[cmd]` **Das stuetzt Toms Reihenfolge:** **Zyklusplaner zuerst,
Rotation daraus.**

`[cmd]` **`PCT_TEMPLATES`** ? **drei fertige Protokolle:**

    Standard Nolva/Clomid   Nolvadex 40/20, Clomid 50/25
                            je zwei Wochen
    Nolvadex Only (6 Wo)    40 mg Wo 1-2, 20 mg Wo 3-6
    HCG + Nolva             HCG 1500 IU Wo 1-2,
                            Nolvadex 40/20 Wo 3-6

`[read]` **Mit `weeks_start` und `weeks_end` je Position** ?
**genau die Form von `supplement_protocol_items`.**

`[cmd]` **`supplement_protocols.schedule` ist JSONB** ? **miss, ob
es diese Form aufnimmt oder ob die Wochen an die Position
gehoeren.**

### Was daraus folgt

`[read]` **Die Vorlagen sind da, die Formel ist da, die Tabellen
sind da.**

`[read]` **Was fehlt, ist der Schreibweg** ? **und das ist der
Auftrag.**

    1  ein Zyklus starten, pausieren, beenden
       -- mit Ereignis in supplement_cycle_events
    2  ein Protokoll anlegen
       -- aus PCT_TEMPLATES oder frei
    3  die Wochen je Position
       -- weeks_start/weeks_end fehlen in
          supplement_protocol_items, MESSEN
    4  intake_schedule aus beidem
