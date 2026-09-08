---
nr: C-427
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-372
entscheidung: null
beruehrt:
  tabellen: [supplements.user_stacks]
zahlen:
  gemessen: 2026-09-08
  gemeinsam: 3
  ohne_gegenstueck: 5
---

# C-427 — zwei Wortschaetze fuer `goal`

## Befund

Aus G-372, Claude Code, 2026-09-08. **Nachgemessen.**

    stack_templates   body_composition, custom, health,
                      lifestyle, performance      KEIN CHECK
    user_stacks       muscle_building, fat_loss,
                      recovery_sleep, health, longevity,
                      performance, custom         CHECK

`[cmd]` **Gemeinsam: `health`, `performance`, `custom`.**

`[cmd]` **Ohne Gegenstueck: `body_composition`, `lifestyle` auf der
einen Seite** — **`muscle_building`, `fat_loss`, `recovery_sleep`,
`longevity` auf der anderen.**

`[read]` **Zwei Begriffssysteme, kein Tippfehler.**

## Warum es auffiel

`[cmd]` **Beim Uebernehmen einer Vorlage schlug der CHECK zu.**

`[read]` **Vier Wochen lang stand es nebeneinander, ohne dass
jemand es merkte** — **erst der erste Schreibweg zwischen beiden
Tabellen brachte es ans Licht.**

`[read]` **Claude Codes Lehre:** *,,dasselbe Feldname trug zwei
Wortschaetze, und die Kopie scheiterte erst beim Schreiben."*

## Der Zwischenstand

`[cmd]` **Unbekannte Werte landen auf `custom`.**

`[read]` **Das ist richtig, nicht falsch:** `body_composition`
**koennte Aufbau oder Diaet heissen** — **und das entscheidet der
Nutzer, nicht eine Zuordnungstabelle.**

## Zu klaeren

`[read]` **Welche Liste gilt?**

`[cmd]` **`user_stacks` traegt den CHECK und ist aelter.**
`[cmd]` **`stack_templates` traegt keinen** — **die Werte kamen aus
dem C-423-Seed und folgen `goals.user_goals.goal_type**
(`body_composition`, `performance`, `health`, `lifestyle`).

`[read]` **Damit stehen drei Listen im Raum:** **Ziele, Stapel,
Vorlagen.**

`[cmd]` **G-352 hat vier Achsen in `goals` gemessen** — **dieselbe
Frage, ein Modul weiter.**

`[read]` **Vor dem Vereinheitlichen zu lesen:**
`docs/specs/Supplements/SPEC_02_ENTITIES.md` **und
`SPEC_06_DATABASE_SCHEMA.md`.**
