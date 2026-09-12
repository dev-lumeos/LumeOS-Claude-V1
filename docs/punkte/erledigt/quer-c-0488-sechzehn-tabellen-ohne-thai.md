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
erledigt: 2026-09-08
commit: adf6face
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

Stand: 2026-09-12, Codex. Kein `apps/`- oder `packages/`-Pfad angefasst,
nichts gestaged, committed oder gepusht.

### Messung und Entscheidung

Die Rohzaehlung `_de 123`, `_en 101`, `_th 91` ist keine paarweise
Spaltenmessung. Sie ergibt zwar die Differenz 32, aber nicht 32 fehlende
Englischspalten. Die exakte Ausgangsmessung hatte 24 `_de`-Felder ohne
gleichnamiges `_en` und acht weitere nur ohne `_th`. Das sind zusammen die
32 unvollstaendigen Sprachpaare.

| Tabelle | Thai gebraucht? | Fundstelle / Entscheidung | Umsetzung |
| --- | --- | --- | --- |
| `nutrition.daily_nutrient_summary_long` | ja, durchreichen | Sicht; `nutrient_defs` ist schon dreisprachig. | `nutrient_name_en/th`, `group_en/th` an die Sicht angehaengt. |
| `nutrition.recipes` | ja | Rezeptname ist Nutzertext. | `name_th`. |
| `nutrition.preparation_kinds` | ja | Zubereitungsfilter im Nutrition-Leseweg. | `label_en`, `label_th`. |
| `nutrition.recipe_curation_candidates` | nein | Admin-only MealCam-Snapshot, kein App-Leseweg. | `name_de` begruendet im Sollstand. |
| `nutrition.tag_definitions` | ja | Nutzerfilter. | `name_th`. |
| `nutrition.micronutrient_overview_items` | ja | Nutzeruebersicht. | `label_th`. |
| `nutrition.exclusion_presets` | ja | Nutzerpraeferenz und Hinweistext. | `name_th`, `caveat_en/th`. |
| `nutrition.food_groups` | ja | sichtbarer Such-/Filterkatalog. | `label_en`, `label_th`. |
| `public.koerperflaechen` | ja | Recovery liest die Flaechennamen. | `name_th`. |
| `medical.symptom_biomarker_map` | ja | Medical-Leseweg nutzt `reason_de`. | `reason_en/th`, `boundary_note_en/th`. |
| `medical.biomarker_explanations` | ja | erklaerender Nutzertext, kein interner Steuerwert. | zwanzig feldgleiche EN/TH-Spalten, mit passenden `text`-/`jsonb`-Typen. |
| `medical.biomarker_spec_enrichment` | ja | Katalogbezeichnung, keine technische Kennung. | `name_en`, `name_th`. |
| `training.equipment` | ja | sichtbarer Trainingskatalog. | `name_en/th`, `equipment_group_th`. |
| `supplements.rule_catalog` | ja | Regelmeldung fuer den Nutzer. | `message_en`, `message_th`. |
| `supplements.supplement_interactions` | ja | sichtbare Beschreibungs- und Empfehlungstexte. | `description_th`, `recommendation_th`. |
| `supplements.stack_curation_candidates` | nein | User-zu-Admin-Snapshot; der produktive Leseweg waehlt nur `origin_stack_id,status`. | `name_de` und `description_de` begruendet im Sollstand. |

Der feldgenaue Waechter fand zusaetzlich drei relevante Stellen: Die
Nutzersicht `supplements.supplement_forms_read` gibt nun die drei schon
vorhandenen Thai-Quellen durch; `supplements.supplement_protocol_templates`
erhielt `description_en/th`; und `nutrition.recipe_curation_catalog` bekommt
`name_en/th`, falls die Tabelle im jeweiligen Bestand existiert. Der
Live-Bestand besitzt diese aeltere Katalogtabelle nicht, die frische Vollkette
schon; das bedingte `ALTER` erfindet sie nicht.

### Die fehlenden Englischfelder

Exakt ohne gleichnamiges `_en` waren: die zehn `*_de`-Felder in
`medical.biomarker_explanations`; `medical.biomarker_spec_enrichment.name_de`;
`medical.symptom_biomarker_map.reason_de` und `.boundary_note_de`;
`nutrition.daily_nutrient_summary_long.nutrient_name_de` und `.group_de`;
`nutrition.exclusion_presets.caveat_de`; `nutrition.food_groups.label_de`;
`nutrition.preparation_kinds.label_de`;
`nutrition.recipe_curation_candidates.name_de`;
`supplements.rule_catalog.message_de`;
`supplements.supplement_protocol_templates.description_de`;
`training.equipment.name_de`; sowie
`supplements.stack_curation_candidates.name_de` und `.description_de`.

Davon bleiben nur die drei Snapshot-Felder in den zwei begruendeten
Sollstand-Ausnahmen. Die acht nur Thai-fehlenden Felder waren
`exclusion_presets.name_de`, `micronutrient_overview_items.label_de`,
`recipes.name_de`, `tag_definitions.name_de`, `koerperflaechen.name_de`,
`supplement_interactions.description_de`,
`supplement_interactions.recommendation_de` und
`equipment.equipment_group_de`.

### Bau und Nachweise

- Struktur: `supabase/migrations/20260912001900_c488_sprachspalten.sql`, als
  Kettenschritt `488_sprachspalten`. Kein `_pipeline`-Datenschritt: Es gibt
  bewusst keine DML und keine Uebersetzung. Die Live-Abfrage ueber alle neuen
  Felder ergab `neue_uebersetzungswerte = 0`.
- Sollstand: `supabase/_pipeline/daten/sprachspalten-sollstand.json` enthaelt
  genau die drei internen Ausnahmefelder, jeweils mit Grund.
- Waechter: `tools/sprachspalten-pruefen.mjs`, in `pnpm gate` nach dem
  i18n-Waechter. Frische Kette: `127 _de`-Spalten, 3 begruendete Ausnahmen,
  gruen. Live nach Apply: `126 _de`-Spalten, dieselben drei Ausnahmen, gruen;
  die Differenz ist ausschliesslich die im Live-Bestand nicht vorhandene
  `recipe_curation_catalog`.
- Test: `c488_sprachspalten.test.ts` lief auf
  `lumeos_c488_vollkette_gruen` gruen. Er verweigert absichtlich `postgres`,
  damit kein Test versehentlich gegen Live laeuft.
- Gegenprobe: Auf der Wegwerf-Datenbank fuegte
  `public.koerperflaechen.c488_probe_de` gezielt eine neue Luecke ein. Der
  Waechter wurde rot mit genau einer Meldung (`_en` und `_th` fehlen); die
  Testspalte wurde danach wieder entfernt und der Waechter erneut gruen.
- Keine Rechte- oder RLS-Anweisung in C-488. Die Vollkette mass
  35/35 vollstaendige Policies und 39/39 erwartete GRANTs.

### Sicherung und Kette

- Schema-Sicherung vor dem ersten Kettenlauf:
  `backup/schema/20260912145612_c43_vor_kettenlauf.sql`.
- Live-Sicherung vor dem Apply:
  `backup/data/20260912170000_c488_vor_live.dump` (365.261.414 Byte).
- Frische Vollkette `lumeos_c488_vollkette_gruen`: **KETTE OK**, 846,0 s;
  darin C-485-Import 418,18 s und anschliessend C-488. Die
  Schema-Abschlusspruefung endete mit `SCHEMA VOLLSTAENDIG`.
- `migration-datenlogik-pruefen.mjs` und `migration-kette-pruefen.mjs` sind
  gruen. `punkte-pruefen.mjs` ist ebenfalls gruen (25 Befunde, exakt Soll 25).
- `pnpm gate` stoppt vor dem neuen Sprachwaechter an der bereits bekannten,
  fachfremden G-261-Abweichung: sieben statt sechs Naehrstoffspalten in
  `goals.nutrition_targets` (C-464, als G-439 zu klaeren). Bis dahin waren
  Quellen-, Ketten-, Punkte- und alle weiteren davorliegenden Waechter gruen;
  der C-488-Waechter und der C-488-Test liefen separat gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    vorher   _de 123, _en 101, _th  91
    jetzt    _de 126, _en 125, _th 123

    koerperflaechen   name_de, name_en, name_th
    name_th gefuellt  0 von 51

    Waechter  exit 0, "gruen: 126 _de-Spalten,
              3 begruendete interne Ausnahme(n)"

`[cmd]` **Selbst gemessen: alle vier.**

`[read]` **24 Englisch- und 32 Thai-Spalten nachgezogen, keine
einzige Uebersetzung erfunden.**

### Die drei Ausnahmen tragen

`[cmd]` **`supabase/_pipeline/daten/sprachspalten-sollstand.json`:**

    nutrition.recipe_curation_candidates.name_de
      "Admin-only MealCam-Kurationssnapshot; kein
       App-Leseweg zeigt den Namen"

    supplements.stack_curation_candidates.name_de
    supplements.stack_curation_candidates.description_de
      "Nutzer-zu-Admin-Kurationssnapshot; der produktive
       Leseweg fragt nur origin..."

`[read]` **Beide sind KANDIDATENTABELLEN** ? **Zwischenstaende
zwischen Nutzer und Admin, kein Schirm.**

`[read]` **Ich hatte genau danach gefragt:** *,,miss, ob sie je
auf einem Schirm landen."*

`[read]` **Er hat gemessen und begruendet, statt sie
mitzuschleppen.**

### Und die Bauform stimmt

`[cmd]` **Der Waechter fragt die LAUFENDE Datenbank ab, der
Sollstand liegt in einer eigenen Datei.**

`[read]` **Dieselbe Bauform wie `punkte-pruefen.mjs`** ? **ein
bekannter Bestand als Liste, jede neue Abweichung faellt auf.**

`[cmd]` **Und die Gegenprobe:** *,,erzeugte genau EINE rote neue
Luecke und wurde sauber zurueckgebaut."*

### Was rot bleibt

`[cmd]` **`pnpm gate` stoppt an G-261/G-439** ? `fiber_g` **aus
C-464.**

`[read]` **Fremd, richtig erkannt, nicht angefasst** ? **zum
zweiten Mal.**

**Abgenommen.**

