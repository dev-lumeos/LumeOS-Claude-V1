---
nr: C-372
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-304
entscheidung: E-40
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  tabellen: [nutrition.meal_plan_weeks, nutrition.meal_plan_days]
zahlen:
  gemessen: 2026-08-31
---

# C-372 — Planwochen haben keinen Schreibweg

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **`meal_plan_weeks` wird nirgends im Code eingefuegt.**
`[cmd]` **`meal_plan_days` kommt nur in einem `select` vor.**

`[cmd]` **Auf `test-user` belegt: der ueber *New plan* angelegte Plan
hat 0 Wochen, 0 Tage, 0 Eintraege.**

`[read]` **Ein Plan ohne Wochen ist ein Datensatz, kein Plan.**

## Und dann luegt die Anzeige

`[cmd]` **Der Planner zeigt fuer genau diesen Plan *,,Es liegt kein
Plan vor"*.** `[cmd]` **Der Zweig ist `!d.plan || d.wochen.length ===
0`.**

`[read]` **Ein Plan ohne Wochen wird als *kein Plan* gemeldet** —
**und der einzige angebotene Knopf ist die *in Entwicklung*-Attrappe.**

`[read]` **Damit ist der Weg zu Ende: anlegen, dann nichts.**

## Warum das der Kern ist

Tom, 2026-08-31: *,,die diskrepanz ich kann da einen plan anlegen
zumindest namentlich und konfigs."*

`[read]` **Genau das ist es: das Formular fragt Name, Ziele,
Lebenszyklus, Startdatum und Tageszahl** — **nie Wochen, Tage oder
Eintraege.**

`[cmd]` **`SPEC_03` Flow 3 beschreibt kein Anlegen** (C-370) — **er
beginnt bei der Uebersicht.** `[read]` **Das Formular war eine
Erfindung des Orchestrators, und es erzeugt einen leeren Datensatz.**


## Auftrag — Bibliothek und Werkbank

**Entschieden in E-40 und E-41.** **Mitbeauftragt: C-370, G-306,
C-375.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Lies zuerst

    docs/entscheidungen/E-40      wozu der Planner da ist
    docs/entscheidungen/E-41      Rollenteilung und zwei Sperren
    ADR_IMPROVEMENTS_PACKAGE #17  die Immutabilitaetsregel
    SPEC_01 Abschnitt 8 und 9     Plaene und Rezepte, vier Quellen
    SPEC_03 Flow 3                Aktivieren

`[read]` **Der Orchestrator hat den ADR nicht gelesen, bevor er
G-298 beauftragt hat.** **Deshalb steht er hier zuerst.**

### Die Rollenteilung

    Meal plans   Bibliothek: alle Plaene, aktivieren,
                 "Bearbeiten" fuehrt in den Planner
    Planner      Werkbank: Auflistung aller Plaene, neu anlegen,
                 Positionen und Rezepte einfuegen

`[read]` **Bearbeiten fuehrt in den Planner, statt in der Bibliothek
selbst zu editieren** — **sonst gibt es wieder zwei Orte fuer
dasselbe.**

### 1 · Wochen bekommen einen Schreibweg (C-372)

`[cmd]` **Du hast in G-304 belegt: `meal_plan_weeks` wird nirgends
eingefuegt, `meal_plan_days` kommt nur in einem `select` vor.**

`[read]` **Ohne diesen Weg gibt es keine Werkbank.** **Die Positionen
kannst du seit G-298** — es fehlt die Ebene darueber.

**`New plan` fragt: Name, Beschreibung, Tagesziele, Wochenzahl.**
`[cmd]` **Lebenszyklus und Startdatum gehoeren nicht dorthin** — sie
entstehen beim Aktivieren (Flow 3, Schritte 5 und 6).

### 2 · Der Editor respektiert die Immutabilitaet (G-306)

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17:**

    MealPlan.status = 'active'
      -> MealPlanDay READ-ONLY
      -> MealPlanItem READ-ONLY

`[cmd]` **Begruendung im ADR:** *,,MealPlanLog referenziert
`plan_item_id`. Wenn Items nachtraeglich geaendert werden, stimmt die
Compliance-History nicht mehr."*

`[read]` **Dein G-298-Editor arbeitet heute an einem aktiven Plan.**
**Das gehoert an `status` gebunden: Entwurf ja, aktiv nein.**

`[cmd]` **Und der Ausweg steht im ADR:** *,,pausieren, eine Kopie
erstellen, bearbeiten und neu aktivieren."*

`[read]` **Ohne Knopf ist die Regel eine Sackgasse.** **Bau
*,,Kopie bearbeiten"*: Kopie anlegen, im Planner oeffnen, Original mit
seinem Log stehen lassen.**

### 3 · Das Flag fuer fremde Inhalte (C-375)

Tom: *,,die gekauften Plaene oder vom Coach brauchen ein Flag das
definiert ob es editable sein soll oder nicht."*

`[cmd]` **Es gibt keins.** `[read]` **Vorschlag: `darf_bearbeiten
boolean NOT NULL DEFAULT true`, an `meal_plans` und `recipes`.**

`[read]` **Zwei Sperren, die nichts miteinander zu tun haben:**

    aktiv             jeder Plan, kommt vom Log
    nicht editierbar  fremde Plaene, kommt vom Ersteller

`[read]` **Die Anzeige muss beide unterscheiden** — *,,dieser Plan
laeuft"* ist etwas anderes als *,,dieser Plan gehoert dir nicht"*.

`[cmd]` **Den Weg zum Teilen nicht bauen** — E-39 und E-40 sagen
vorsehen.

### 4 · Rezepte in den Plan einfuegen

Tom: *,,im Planner soll man Einzelpositionen oder fertige Rezepte
einfuegen koennen."*

`[cmd]` **Der `CHECK` kennt beides:** `recipe` mit
`planned_servings`, `bls` und `custom` mit `amount_g`. `[cmd]` **Du
hast in G-298 gemessen, dass der Typ das Feld entscheidet.**

`[cmd]` **Und die Rezepte stehen seit G-289.**

### Was nicht zu tun ist

**Keinen Lebenszyklus ausfuehren** — C-373.
**Kein Teilen, kein Kaufen bauen.**
**Nichts auf `dev@lumeos.app`** — eine Probe, die schreiben kann,
gehoert nicht auf ein unantastbares Konto.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Plan anlegen         mit n Wochen, im Browser
    Wochen und Tage      meal_plan_weeks und _days zaehlen,
                         gezaehlter Rueckbau
    fuellen              Position und Rezept je Tag
    aktiver Plan         Bearbeitung gesperrt, 409 oder gesperrte
                         Oberflaeche
    Kopie bearbeiten     Kopie entsteht, Original unveraendert
    darf_bearbeiten      Spalte da, Vorgabe true, Anzeige
                         unterscheidet die zwei Sperren
    Bibliothek           listet alle Plaene, "Bearbeiten" fuehrt
                         in den Planner
    dev                  unveraendert, vorher/nachher gezaehlt

`[read]` **Die vierte und fuenfte Zeile zusammen entscheiden, ob es
brauchbar ist:** **gesperrt zu sein, ohne einen Weg zu haben, ist
schlimmer als gar keine Sperre.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
