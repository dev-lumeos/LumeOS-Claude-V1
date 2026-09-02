---
nr: E-54
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-379, E-53, E-40]
modul: quer
---

# E-54 — die Zeitachse gehoert zu den Zielen

## Entscheidung

Tom, 2026-09-02, weitergedacht aus C-379:

> ich als user kann plaene kaufen, von buddy erstellen lassen, selber
> manuell erstellen
>
> ich oder buddy planen diese plaene und wollen die in dem kalender
> abbilden wann wielange/wieoft ein plan eingesetzt wird
>
> das kann ein komplettes jahr sein als beispiel mit allen phasen
> parallel zu training/supplement etc
>
> also ja das spricht fuer eigene ausbaubare tables

## Damit faellt `next_plan_id` als Traeger

`[read]` **Eine einfach verkettete Liste bildet eine Reihe ab.**
`[read]` **Ein Jahr mit Phasen, parallel zu Training und
Supplements, ist keine Reihe** — **es ist eine Zeitachse mit
mehreren Spuren.**

`[cmd]` **`meal_plans.next_plan_id` bleibt**, mit seinen zwei CHECKs
— **aber es traegt hoechstens *,,danach kommt B"*, nicht *,,von Maerz
bis Mai, dreimal wiederholt, waehrend im Training Block 2 laeuft"*.**

## Das Muster gibt es schon zweimal

`[cmd]` **`goals.goal_phases`, 5 Zeilen, 14 Spalten:**

    goal_id            an welches Ziel
    phase_type         welche Art Phase
    variant            Auspraegung
    parameters         jsonb
    gueltig_ab         Beginn
    projected_end_date geplantes Ende
    actual_end_date    tatsaechliches Ende
    transitioned_from  woher
    recommended_next   was empfohlen wird
    transition_reason  warum

`[read]` **Das ist bereits eine Zeitachse mit Uebergaengen** —
**geplantes und tatsaechliches Ende getrennt, Herkunft und Empfehlung
festgehalten.**

`[cmd]` **Und `supplements.user_supplement_cycles`** fuehrt
`started_at`, `paused_at`, `stopped_at`, `source`,
`suggestion_source`.

`[read]` **Zwei Module haben es unabhaengig voneinander erfunden.**
**Nutrition waere das dritte.**

## Was daraus folgt

`[read]` **Bevor eine dritte Fassung entsteht, gehoert gemessen, ob
`goal_phases` der Ort ist.**

`[cmd]` **Ein Ziel hat Phasen** — Aufbau, Diaet, Erhaltung. `[cmd]`
**Und ein Plan gehoert in eine Phase**, nicht neben sie.

`[read]` **Dann waere die Frage nicht *,,welcher Plan folgt auf
welchen"*, sondern *,,welcher Plan gilt in dieser Phase"*** — **und
die Kette entsteht aus der Zeitachse, nicht umgekehrt.**

`[read]` **Das erklaert auch Toms *,,parallel zu
training/supplement"*:** **dieselbe Phase traegt einen Essensplan,
einen Trainingsblock und einen Supplement-Zyklus.**

## Zu klaeren, bevor gebaut wird

`[read]` **Traegt `goal_phases` schon Verweise auf Plaene?** `[cmd]`
**`parameters jsonb` koennte alles enthalten** — **das ist zu lesen,
nicht anzunehmen.**

`[read]` **Und wie verhaelt sich `gueltig_ab` zu
`meal_plans.start_date`?** `[cmd]` **Heute setzt das Aktivieren es**
(G-306). `[read]` **In einer Phase waere es abgeleitet.**

`[read]` **`sequence` bleibt bis dahin nicht waehlbar** (E-53).
