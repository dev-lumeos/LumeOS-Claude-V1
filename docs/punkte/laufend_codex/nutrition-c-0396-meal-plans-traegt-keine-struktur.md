---
nr: C-396
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-332
entscheidung: E-59
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-02
---

# C-396 — `meal_plans` traegt keine Struktur

## Befund

Aus E-59, 2026-09-02.

`[cmd]` **`rasterZeilen` rechnet die Zeilen aus
`food_preferences.meals_per_day` und `snacks_per_day`** — **den
Vorlieben des Nutzers.**

`[read]` **Auch bei einem Coach-Plan, einem gekauften und einem von
Buddy.**

`[cmd]` **E-59: ein gelieferter Plan bringt seine Struktur mit.**

## Was zu bauen ist

**Die Struktur am Plan, nicht nur an den Vorlieben.**

`[read]` **Dieselbe Gestalt wie `meal_slots`:** Position, Name,
geplante Zeit. `[cmd]` **Miss, ob eine Tabelle `meal_plan_slots`
richtig ist oder ob `meal_plan_entries.meal_type` reicht.**

`[cmd]` **`meal_plan_entries` traegt bereits `planned_time` und
`slot_order`** — **melde, wenn daraus schon eine Struktur ableitbar
ist.**

## Und die vier Herkuenfte

    self_created     Slots als Vorlage, beim Anlegen aenderbar
    coach_created    bringt seine Struktur mit
    marketplace      bringt seine Struktur mit
    buddy            bringt seine Struktur mit

`[read]` **Ein selbst erstellter Plan kopiert die Slots beim
Anlegen** — **danach gehoert die Kopie dem Plan.**

`[read]` **Sonst aendert eine spaetere Slot-Aenderung rueckwirkend
einen laufenden Plan** — **das waere E-42 in der Gegenrichtung.**

## Auftrag

**Mitbeauftragt: C-395.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-395 zuerst — der Gate ist rot

`[cmd]` **Drei Migrationen aus C-385/C-393 tragen `DELETE` und
`INSERT`:**

    20260902070117_c327a_chelation_mineral_membership.sql
    20260902070205_c385_injection_site_model.sql

`[cmd]` **Der Datenlogik-Waechter faellt.** `[read]` **Der Zustand
entsteht aus der Kette, nicht aus `migrations/`.**

`[read]` **Nach einem Kettenneuaufbau waeren die acht Quellen und
vier Injektionsstellen weg.**

`[read]` **Und der Widerspruch ist in deinem eigenen Lauf:** `[cmd]`
**du hast 327a als Kettenschritt UND als Migration angelegt.**
`[cmd]` **Bei C-392 hast du es richtig gemacht** — der Seed steht in
der Kette.

### 2 · C-396 — die Struktur am Plan

`[cmd]` **`rasterZeilen` rechnet die Zeilen aus
`food_preferences`** — **auch bei einem Coach-Plan.**

`[cmd]` **E-59: ein gelieferter Plan bringt seine Struktur mit.**

`[read]` **Miss zuerst, ob eine neue Tabelle noetig ist.** `[cmd]`
**`meal_plan_entries` traegt `planned_time` und `slot_order`** —
**melde, wenn daraus schon eine Struktur ableitbar ist.**

    self_created     Slots als Vorlage, beim Anlegen aenderbar
    coach_created    bringt seine Struktur mit
    marketplace      bringt seine Struktur mit
    buddy            bringt seine Struktur mit

`[read]` **Ein selbst erstellter Plan kopiert die Slots beim
Anlegen** — **danach gehoert die Kopie dem Plan.** `[read]` **Sonst
aendert eine spaetere Slot-Aenderung rueckwirkend einen laufenden
Plan.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`** — das ist gerade der Befund.
**Nichts auf `dev@lumeos.app` loeschen.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Gate             gruen, Datenlogik-Waechter faellt nicht mehr
    Kettenneuaufbau  acht Quellen und vier Stellen ueberleben
    Struktur         noetig oder ableitbar, mit Zahl
    vier Herkuenfte  je Weg belegt
    self_created     Kopie beim Anlegen, spaetere Slot-Aenderung
                     wirkt nicht zurueck

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
