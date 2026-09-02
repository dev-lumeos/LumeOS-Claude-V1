---
nr: G-314
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-311
entscheidung: E-41
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-314 — die Vorschau fuer nicht-aktive Plaene

## Befund

Aus G-311, Claude Code, 2026-09-02.

`[cmd]` **Die Attrappe zeigt an jeder Plankarte einen
*Preview*-Knopf, Zeile 365.**

`[cmd]` **Er ist nicht gebaut** — **und die Begruendung ist die
richtige:**

`[cmd]` **Das Tages-Akkordeon braucht `PlanDaten`, die Bibliothek
haelt `PlanKurz`.**

`[read]` Claude Code: *,,ein Knopf ohne Ziel waere die naechste
Sackgasse."*

`[read]` **Genau die Klasse, die am 01. und 02.09. viermal entfernt
wurde** — *New recipe*, *Copy week*, *In der Werkbank*, *Es liegt
kein Plan vor*.

## Was fehlt

**Ein Leseweg, der zu einem beliebigen Plan die Tage liefert.**

`[cmd]` **`MealPlanDetail` ist gebaut** (G-286) — **sie zeigt die
Tage des aktiven Plans.** `[cmd]` **`ladePlan()` nimmt heute den
aktiven.**

`[read]` **Und seit G-311 gibt es `?plan=`** — **der Planner kann
schon einen beliebigen Plan oeffnen.** `[read]` **Die Vorschau
braucht dasselbe, nur lesend.**

## Und die Frage dahinter

`[read]` **Braucht es die Vorschau, wenn *In der Werkbank* schon in
den Planner fuehrt?**

`[cmd]` **`SPEC_03` Flow 3 Schritt 3 sagt: *Tap auf Plan → Plan-
Vorschau*, und erst danach kommt *Plan aktivieren*.**

`[read]` **Also ja — die Vorschau steht vor dem Aktivieren, die
Werkbank vor dem Bearbeiten.** **Zwei Wege, zwei Zwecke.**


## Auftrag

**Vorbereitet mit G-331 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.
