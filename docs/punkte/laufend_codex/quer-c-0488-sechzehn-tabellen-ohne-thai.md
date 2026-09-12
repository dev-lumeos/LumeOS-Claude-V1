---
nr: C-488
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-430
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  de: 123
  en: 101
  th: 91
---

# C-488 — sechzehn Tabellen ohne Thai

## Toms Befund

Tom, 2026-09-08:

> und wo sind unsere sprachregeln? db immer de/en/th spalten
> anlegen und nur de und en einfuegen

## Die Regel EXISTIERT

`[cmd]` **`docs/spezifikation/10-plattform/konventionen/
00-konventionen.md`, Abschnitt 1:**

> Nutzeroberflaeche mehrsprachig ? Deutsch, Englisch, Thai; das
> Datenmodell fuehrt Sprachvarianten als Spalten (`name_de`,
> `name_en`, `name_th`).

`[cmd]` **Und C-430, heute abgenommen, traegt Toms
Entscheidung:**

> ist es eine datenbankabfrage? dann in der db loesen. ist es eine
> bezeichnung oder sonst was das im code als variable steht, dann
> i18n.

`[read]` **Der Orchestrator hat sie in vier Auftraegen nicht
genannt** ? **C-468, C-479, C-484, C-485.**

## Was gemessen ist

`[cmd]` **Spaltensuffixe im ganzen Schema:**

    _de   123
    _en   101
    _th    91

`[read]` **32 Spalten ohne Englisch, 32 ohne Thai.**

`[cmd]` **Sechzehn Tabellen mit `_de` und OHNE `_th`:**

    nutrition.daily_nutrient_summary_long
    nutrition.recipes
    nutrition.preparation_kinds
    nutrition.recipe_curation_candidates
    nutrition.tag_definitions
    nutrition.micronutrient_overview_items
    nutrition.exclusion_presets
    nutrition.food_groups
    public.koerperflaechen
    medical.symptom_biomarker_map
    medical.biomarker_explanations
    medical.biomarker_spec_enrichment
    training.equipment
    supplements.rule_catalog
    supplements.supplement_interactions
    supplements.stack_curation_candidates

`[cmd]` **`public.koerperflaechen` ist HEUTE gebaut** (C-468,
C-479, C-484) ? **`name_de`, `name_en`, kein `name_th`.**

## Was zu tun ist

**1** ? **Je Tabelle messen, ob sie eine Sprachspalte BRAUCHT.**

`[read]` **Nicht jede `_de`-Spalte ist Nutzertext.**

`[cmd]` **`daily_nutrient_summary_long` ist eine SICHT** ? **sie
gibt weiter, was darunter steht.**

`[read]` **Eine Sicht braucht keine eigene Spalte, wenn die
Grundtabelle drei hat** ? **aber sie muss sie DURCHLASSEN.**

**2** ? **Wo eine Spalte fehlt: anlegen, LEER.**

Tom: *,,db immer de/en/th spalten anlegen und nur de und en
einfuegen."*

`[read]` **Die Spalte steht, der Wert kommt spaeter** ? **wie bei
`product_content_candidates`: die Luecke ist sichtbar, nicht
gefuellt.**

`[read]` **KEINE Uebersetzung erfinden** ? **auch keine
maschinelle.**

**3** ? **Ein Waechter.**

`[read]` **Jede Tabelle mit `_de` muss `_en` und `_th` haben** ?
**oder im Sollstand stehen, mit Grund.**

`[cmd]` **32 Spalten ohne Englisch sind auch ein Befund** ?
**miss, welche.**

## Was zu entscheiden ist

`[read]` **`equipment` und `food_groups` sind Kataloge** ? **ein
Nutzer sieht sie.**

`[read]` **`biomarker_spec_enrichment` und
`stack_curation_candidates` klingen nach Zwischentabellen** ?
**miss, ob sie je auf einem Schirm landen.**

`[read]` **Wo nicht: in den Sollstand, mit Grund.**

## Abnahmebedingungen

    A1  je der sechzehn Tabellen: braucht sie Thai?
        TABELLE mit Begruendung.
    A2  die 32 Spalten ohne Englisch: Liste.
    A3  wo eine Spalte fehlt und gebraucht wird:
        angelegt, LEER.
    A4  KEINE Uebersetzung eingefuegt.
    A5  ein Waechter: _de ohne _en oder _th -> rot,
        ausser im Sollstand mit Grund.
    A6  der Waechter ist GRUEN.
    A7  Struktur nach migrations/, Daten in _pipeline/.
    A8  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**KEINE Uebersetzung erfinden** ? **auch keine maschinelle.**

**KEINE Spalte anlegen, die niemand braucht** ? **erst messen,
dann bauen.**

**`apps/` nicht anfassen.**

Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
