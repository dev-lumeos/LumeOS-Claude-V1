---
nr: C-395
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-385
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: ae0fb34b
beruehrt:
  tabellen: [medical.injection_sites]
zahlen:
  gemessen: 2026-09-02
---

# C-395 — drei Migrationen tragen Datenlogik

## Befund

`[cmd]` **Der Gate faellt:** *,,Migrationen duerfen keine Datenlogik
enthalten."*

    20260902070117_c327a_chelation_mineral_membership.sql  DELETE
    20260902070117_c327a_chelation_mineral_membership.sql  INSERT
    20260902070205_c385_injection_site_model.sql           INSERT (3x)

`[cmd]` **Beide stammen aus C-385/C-393, committet als `f9db161b`.**

`[read]` **Der Orchestrator hat sie committet, ohne den Gate zu
pruefen** — **die Abnahme mass die Daten, nicht den Bau.**

## Warum die Regel gilt

`[read]` **Der Zustand entsteht aus der Kette in
`supabase/_pipeline/`, nicht aus `supabase/migrations/`** —
`supabase/README.md`.

`[read]` **Eine Migration, die Daten einfuegt, laeuft einmal.**
`[read]` **Ein Kettenschritt laeuft bei jedem Neuaufbau.**

`[cmd]` **Deshalb waeren die acht Quellen und die vier
Injektionsstellen nach einem Kettenneuaufbau weg** — **die Tabellen
staenden leer.**

## Was zu tun ist

`[read]` **Die Daten gehoeren in einen Kettenschritt**, die Migration
traegt nur die Struktur.

`[cmd]` **Codex hat es bei C-392 richtig gemacht** — dort steht der
Seed in der Kette.

`[read]` **Und der Widerspruch ist sichtbar:** `[cmd]` **derselbe
Agent hat im selben Lauf 327a als Kettenschritt UND als Migration
angelegt.**

## Auftrag

**Mitbeauftragt mit C-396 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit C-396 abgenommen: Gate gruen.**

`[cmd]` **Der Waechter meldet: *,,Migrationen enthalten keine
Datenlogik."***

`[cmd]` **327a bleibt Kettenschritt, C-385 hat Struktur-Migration
plus Seed-Schritt.**

`[cmd]` **Nachgemessen: 4 Stellen, 8 Quellen, 1 Gewebe-Regel, 8
Chelat-Mitgliedschaften** — **unveraendert.**

`[read]` **Die Trennung ist vollzogen, nichts ist verloren
gegangen.**
