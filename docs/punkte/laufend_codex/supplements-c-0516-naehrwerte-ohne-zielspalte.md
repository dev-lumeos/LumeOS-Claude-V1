---
nr: C-516
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-510
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.nutrient_defs]
zahlen:
  gemessen: 2026-09-08
  naehrstoffe: 138
---

# C-516 - Naehrwerte ohne Mapping

## Toms Befund

Tom, 2026-09-08:

> ich sehe noch diverse naehrwerte ohne anbindung wie
> cholesterol, trans fat, etc

## Gemessen

    Cholesterol             13.762 Produkte   KEIN Mapping
    Added Sugars             8.271            KEIN Mapping
    Trans Fat                7.581            KEIN Mapping
    Polyunsaturated Fat      3.764            KEIN Mapping
    Monounsaturated Fat      2.485            KEIN Mapping
    Soluble Fiber            1.231            KEIN Mapping
    Insoluble Fiber            545            KEIN Mapping

`[cmd]` **Gemappt sind:** `Dietary Fiber` **14.602 -> FIBT,**
`Saturated Fat` **13.908 -> FASAT,** `Total Sugars` **10.576 ->
SUGAR.**

## Die Ziele EXISTIEREN

`[cmd]` **`nutrition.nutrient_defs`, 138 Naehrstoffe:**

    CHORL     Cholesterin
    FAMS      Fettsaeuren, einfach ungesaettigt, gesamt
    FAPU      Fettsaeuren, mehrfach ungesaettigt, gesamt
    FAPUN3    Omega-3-Fettsaeuren, gesamt
    FAPUN6    Omega-6-Fettsaeuren, gesamt
    FIBINS    Ballaststoffe, wasserunloeslich
    FIBSOL    Ballaststoffe, wasserloeslich

`[read]` **Es fehlt nur das Mapping** ? **derselbe Fall wie
`Thiamin` in C-510.**

`[cmd]` **Und `nutrition.daily_summary` traegt `chorl` und
`chorl_missing`** ? **die Tagesbilanz kennt es schon.**

### Ein Orchestratorfehler

`[read]` **Ich hatte die Spalten von `foods_custom` gemessen
und geschlossen, LumeOS kenne Cholesterin nicht.**

`[cmd]` **Die Naehrstoffe stehen in `nutrient_defs`, nicht als
Spalten.**

## Was zu tun ist

`[read]` **Die Mappings nachtragen, wie C-510 es getan hat.**

`[cmd]` **Die Mappingtabelle traegt `nutrient_code`,
`target_column`, `target_unit`, `conversion_rule`,
`source_id`, `evidence_class`** ? **MISS, welche Kombination
fuer diese Stoffe stimmt.**

### Und der Schreibweisenschwanz

`[cmd]` **44 Schreibungen gemessen:**

    Trans Fat, Trans Fats, Trans fat, Trans Fatty Acids
    Monounsaturated, Monounsaturated Fat,
      Monounsaturated {Fat}, Monounsaturated Fats,
      Monounsaturated Fatty Acids
    Saturated Fatty Acids, Saturated Fats

`[read]` **Und Artefakte, die KEINE Naehrwerte sind:**

    Cholesterol Support Blend        2
    Cholesterol Health(TM)           1
    Cholesterol D-fense Blend        1
    Trans Fats & Saturated Fats      8

`[read]` **Dieselbe Falle wie in C-509** ? **der Name enthaelt
den Stoff, die Zeile meint eine Mischung.**

## Und was WIRKLICH fehlen koennte

`[cmd]` **MISS: gibt es fuer `Trans Fat` und `Added Sugars`
einen Code in `nutrient_defs`?**

`[read]` **Wenn nein, ist DAS der Fall b** ? **melden, nicht
anlegen.**

## Abnahmebedingungen

    A1  je der offenen Namen: gibt es einen Code in
        nutrient_defs? TABELLE.
    A2  wo ja: Mapping nachgetragen, mit Quelle und
        Evidenzklasse.
    A3  wo nein: GEMELDET, nicht angelegt.
    A4  Artefakte aussortiert, je mit Grund.
    A5  Schreibvarianten zusammengefuehrt -- eine
        Variante ist kein Raten.
    A6  wie viele Zeilen sind nachher verknuepft?
        Vorher 790.378.
    A7  Gegenprobe: ein zweiter Lauf aendert nichts.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

