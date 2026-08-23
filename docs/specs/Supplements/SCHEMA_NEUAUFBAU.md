# Supplements — Schema, gegen vier Quellen geprüft

**Stand 2026-08-23.** Entwurf des Orchestrators, noch nicht gebaut.

`[read]` **Anlass, Tom am 2026-08-22:** *„wieso haben wir
supplement_catalog und substance_catalog? … jetzt wird zuerst
aufgeräumt und definiert bevor wir nur eine zeile mehr code machen"*

`[read]` **Und die Vorgabe, an der sich alles ausrichtet:** *„alle
tables müssen sich auf die id's von der haupttable supplements
stützen, sauber getrennt nach informationsart. wir entscheiden dann
wann wir welche daten brauchen und wie wir sie auswerten."*

---

## Warum es zwei Kataloge gibt

`[cmd]` `a02e838` *„add the catalog, stacks and intake logs"* legt
`supplement_catalog` an — 44 Zeilen, 35 Spalten. Der Stack hängt daran.

`[cmd]` `022f2ce` *„one catalogue from three sources"* legt
`substance_catalog` daneben. **Der Commit-Titel sagt „ein Katalog",
gebaut wurde ein zweiter.**

`[cmd]` Danach vier Commits, die nur noch den zweiten ausbauen:
31 → 60 → 63 → 68 Spalten. Der erste blieb stehen. **Beide werden bis
heute gelesen** — `stack-read`, `stack-write`, `substanz-read`,
`medical/page.tsx`.

`[read]` **Der Orchestrator hat die Doppelung zementiert:** in C-224
stand *„`supplement_catalog` nicht anfassen — die Ablösung ist ein
eigener Punkt"*. Diesen Punkt hat er nie angelegt.

## Die Trennlinie: Karte oder Buddy

`[read]` **Tom, 2026-08-22:** *„das sind addon daten und gehören
strukturiert in eigene tables, die meisten davon interessieren den
user nicht — sind daten die buddy im hintergrund auswerten wird."*

**Was auf der Karte steht:** Name, Gruppe, Kategorie, Beschreibung,
Dosis, Zeitpunkt, Form, Evidenzgrad, Tags.

**Was Buddy auswertet:** Wechselwirkungen, Pharmakokinetik, Sicherheit
je Organ, Rechtslage je Land, Qualität, Monitoring, Herkunft je Feld.

`[read]` **Und Konflikte erscheinen nicht im Katalog** (Tom): dafür
gibt es Intelligence, Interactions und Buddy. **Der Katalog ist eine
Nachschlagesicht ohne Nutzerkontext** — er braucht keinen Stack, keine
Preferences, keine `p_user_id`. `[cmd]` Genau deshalb war C-192 so
teuer: die Suche trug Nutzerkontext, den sie hier nicht braucht.

`[read]` **Buddy wird ein deterministischer Layer** (Tom): die Regel
steht in den Daten, nicht im Modell. Deshalb keine `jsonb`-Blöcke —
eine Regel-Engine kann `mechanismus = 'CYP3A4-Hemmung'` abfragen, nicht
*„may increase plasma levels; caution advised"*.

**Und `unbekannt` ist ein Zustand, keine Abwesenheit.** `[cmd]`
`interactions` ist bei 78 von 290 gefüllt — bei 212 wissen wir es
nicht. Buddy darf daraus nicht „keine Wechselwirkung" machen. Jede
Tabelle nach Informationsart trägt `status`:
`bekannt | unbekannt | nicht_zutreffend`.

---

## Die vier Quellen, je Tabelle

`[read]` Der Entwurf ist in drei Runden von 14 auf 26 Tabellen
gewachsen — **jede Ergänzung kam aus einer Quelle, die der
Orchestrator übersprungen hatte.** Deshalb steht hier je Tabelle, woher
sie stammt.

| Herkunft | bedeutet |
|---|---|
| **DB** | existiert heute, wird umgehängt |
| **SPEC** | `SPEC_06_DATABASE_SCHEMA.md` |
| **ALT** | `referenz/lumeos-2026/supabase/migrations/` |
| **KIMI** | liegt in `substance_catalog.raw`, braucht ein Zuhause |
| **NEU** | vom Orchestrator vorgeschlagen |

---

## 0 · Die 33 Tabellen auf einen Blick

`[read]` **Diese Liste steht hier, weil die Zahl beim ersten Auftrag
aus dem Kopf kam.** C-232 sagte „26 Tabellen" — das Dokument nennt 33.
Codex hat 26 gebaut, weil 26 dastand, und sieben fehlten. **Wer einen
Auftrag daraus schreibt, zaehlt hier ab, nicht aus der Erinnerung.**

**Anker und Struktur (7)**
`supplements` · `supplement_groups` · `supplement_categories` ·
`supplement_aliases` · `supplement_tags` ·
`supplement_tag_definitions` · `supplement_portions`

**Substanzwissen, eine Zeile je Substanz (9)**
`supplement_dosing` · `supplement_pharmacology` · `supplement_safety` ·
`supplement_quality` · `supplement_warnings` · `supplement_evidence` ·
`supplement_wada` · `supplement_protocol_requirements` ·
`supplement_aas_ratings`

**Substanzwissen, mit Zweitschluessel (7)**
`supplement_organ_risks` · `supplement_regulatory` ·
`supplement_identifiers` · `supplement_lab_effects` ·
`supplement_monitoring` · `supplement_field_sources` ·
`supplement_nutrients`

**Wechselwirkungen (1)**
`supplement_interactions`

**Nutzerdaten (6)**
`user_stacks` · `stack_items` · `intake_logs` · `intake_schedule` ·
`user_inventory` · `user_supplement_settings`

**Vorlagen (2)**
`stack_templates` · `stack_template_items`

**Zyklen und Protokolle (5)**
`user_supplement_cycles` · `supplement_cycle_events` ·
`supplement_protocols` · `supplement_protocol_items` ·
`supplement_reminders`

`[cmd]` **Stand 2026-08-23 nach C-232: 26 live, 7 fehlen** — die
fuenf aus Zyklen und Protokolle plus die zwei Vorlagen.

`[read]` **Und drei Spalten sind zu viel:** `enhanced_mode`,
`enhanced_accepted_at`, `enhanced_age_verified` in
`user_supplement_settings`. Der Auftrag hat die Tabelle in der Liste
gefuehrt und im Nachtrag verboten — widerspruechlich geschrieben.
**Eine Spalte in der Datenbank ist das Vorbauen, das die Regel
verbietet.** `reminder_times` und `low_stock_days` bleiben.

---

## 1 · Anker

### `supplements` — 566 Zeilen
**ALT** (`008_supplements.sql` nannte sie genauso) · **Tom**

```
id · slug · group_id → supplement_groups · category_id → supplement_categories
name_de · name_en · name_th
description_de · description_en · description_th
form · evidence_grade · sort_order · is_active
source · created_at · updated_at
```

`[cmd]` `evidence.overall_grade` 290 in der Kimi-Quelle; vor C-248
importiert 259, weil Grad `E` abgewiesen wurde · `description` 290
(englisch, aus Kimi) · `gruppe`/`kategorie` 566.

`[read]` **Sprachregel, Tom:** *„datenbanken werden ausschliesslich so
aufgebaut"* — wie `nutrition.nutrient_defs`, `[cmd]` dort `name_de`,
`name_en`, `name_th` je 138 von 138. Kimis Text ist die `_en`-Seite;
`_de` bleibt leer, bis übersetzt, und die Anzeige fällt zurück wie
`COALESCE(NULLIF(name_display,''), name_de)` in `food_search`.
`_th` wird angelegt und bleibt leer — später.

---

## 2 · Struktur

### `supplement_groups` — 3
**Tom** · Vorbild `nutrition.food_groups` (19 Zeilen)

```
code · label_de · label_en · label_th
min_experience_level · sort_order
```

`[cmd]` `supplement` 307 · `enhanced` 177 · `peptide` 82.
`[read]` **Das Gate gehört hierhin, nicht in den Code** — `[cmd]` heute
liegt `GRAD_FUER_EXTENDED` als Konstante in `extended-regel.ts` (G-167).

### `supplement_categories`
**ALT** (`047_coach_planning_system.sql`) · Vorbild
`nutrition.food_categories` (518 Zeilen, 11 Spalten)

```
id · slug · name_de · name_en · name_th
group_id · color_token · icon · sort_order
```

`[read]` **Die Tabelle existierte im Vorgänger und ging beim Neuaufbau
verloren.** Der Orchestrator hat sie als neu vorgeschlagen.
`[cmd]` **Die Farbe gehört hierhin**, nicht in zehn CSS-Variablen wie
in C-227.
`[cmd]` Zuschnitt aus C-230: 9 Filter für supplement, 7 für peptide,
7 für enhanced — statt 16, 24 und 22 aus Kimis Forschungstaxonomie.

### `supplement_aliases` — 1.541
**DB** · Struktur bleibt, `entity_id` wird `supplement_id`

### `supplement_tags` + `supplement_tag_definitions`
**NEU** · exakt `nutrition.food_tags` (30.797) und `tag_definitions`

```
supplement_id · tag_code · confidence
code · name_de · name_en · tag_type · is_exclusion_relevant · icon · sort_order
```

### `supplement_portions`
**SPEC** (`serving_size` der 44er) · Vorbild `nutrition.foods_portions`

---

## 3 · Substanzwissen, getrennt nach Informationsart

`[read]` Alle über `supplement_id`. Jede trägt `status`
(`bekannt | unbekannt | nicht_zutreffend`) — **was leer ist, muss als
leer abfragbar sein.**

### Eine Zeile je Substanz

| Tabelle | Herkunft | Felder | gefüllt von 290 |
|---|---|---|---|
| `supplement_dosing` | KIMI | Label-, Leitlinien-, untersuchte, anekdotische Dosis, Obergrenze, Einheit | 83 / 55 / 38 / 1 |
| `supplement_pharmacology` | KIMI | Route, Halbwertszeit, Metabolismus, Bioverfügbarkeit, Zeit bis Spitze, Wirkdauer | **237** / 53 / 22 / 7 / 3 / 1 |
| `supplement_safety` | KIMI | Schwangerschaft, Stillzeit, Nebenwirkungen, schwere Nebenwirkungen, Kontraindikationen | **290** / 178 / 92 / 8 |
| `supplement_quality` | KIMI | Fälschung, Verunreinigung, Reinheit, Lagerung, Licht, Temperatur, Stabilität | 237 / 77 / 71 / 54 |
| `supplement_warnings` | KIMI | Obergrenze, Arzt-Hinweis, Begründung wenn keine Obergrenze | 258 / 128 / 32 |
| `supplement_evidence` | KIMI | Grad, Zusammenfassung, Studienzahlen, nur Tier, nur in vitro | 290 / 288 |
| `supplement_wada` | KIMI + SPEC | Status, Kategorie, Nachweisdauer (`detection_time_days`) | **290** / 122 |
| `supplement_protocol_requirements` | SPEC | `requires_pct` · `requires_ai` · `requires_serm` · `aromatization` | aus `enhanced_substances` |
| `supplement_aas_ratings` | SPEC | androgen, anabol | nur für AAS |

### Eine Zeile je Substanz **und** Zweitschlüssel

| Tabelle | Zweitschlüssel | Herkunft | |
|---|---|---|---|
| `supplement_organ_risks` | Organ | KIMI + SPEC | Niere, Leber, Herz, Endokrin, Neuro — `[cmd]` 2 / 1 / 1. SPEC hat `hepatotoxicity_level` und `cardiovascular_risk` als Stufen |
| `supplement_regulatory` | Rechtsraum | KIMI | `[cmd]` USA / EU / Thailand je **237**, Australien 81, UK 62 |
| `supplement_identifiers` | Art | KIMI | UNII, CAS, PubChem, ChEMBL, InChIKey, Summenformel — `[cmd]` 283 |
| `supplement_lab_effects` | Marker | **DB** | `[cmd]` **222 vorhanden** als `substance_lab_effects` |
| `supplement_monitoring` | Marker | KIMI | `[cmd]` 46 / 41 / 35 |
| `supplement_field_sources` | Feldname | KIMI | `[cmd]` **2.147 über 18 Felder** |
| `supplement_nutrients` | Nährstoff | **DB** | `[cmd]` 17 als `supplement_nutrient_mappings` |

`[cmd]` **Warum `regulatory` und `wada` getrennt sind:** der Block hat
zehn Unterfelder, aber nur fünf sind Rechtsräume. `approved_drug`,
`wada_status`, `wada_category`, `prescription_required` sind keine
Länder und gehören nicht in eine Tabelle mit einer Zeile je Land.

`[cmd]` **Warum `safety` und `organ_risks` getrennt sind:**
`pregnancy` (290) gilt je Substanz, die Organprofile (2/1/1) je
Substanz **und** Organ. In einer Tabelle wären 288 Zeilen leer.

---

## 4 · Wechselwirkungen

### `supplement_interactions` — 0 Zeilen, Hülle existiert
**SPEC** · `[cmd]` 20 Spalten bereits angelegt

**Was schon dasteht und bleibt:** `interaction_type` · `severity` ·
`description_de`/`_en` · `recommendation_de`/`_en` ·
`timing_recommendation` · `evidence_level` · `evidence_sources` ·
`blocks_intake` · `requires_confirmation`

`[read]` **Deutsch und Englisch getrennt, Schwere, Empfehlung,
Blockade — genau was ein deterministischer Layer braucht.** Die Hülle
ist besser als das, was der Orchestrator entworfen hatte.

**Was dazukommt:**

- `partner_type` — vorerst nur `supplement`. `[read]` **Kostet jetzt
  nichts und spart die zweite Runde:** die globale Tabelle ist dann ein
  Kopieren statt einer Umschreibung. Das ist die Lehre aus
  `supplement_catalog` gegen `substance_catalog`.
- `mechanism` — `[cmd]` `substance_lab_effects` hat es und funktioniert
  damit. **Ohne Mechanismus ist die Regel nicht abfragbar.**
- `direction` — Coffein gegen Kreatin wirkt nicht symmetrisch wie
  umgekehrt.

**Was rausfliegt:** `supplement1_name`, `supplement2_name` — der Name
gehört in `supplements`, nicht dupliziert daneben. `[cmd]`
`substance_lab_effects` trägt denselben Fehler mit `substance_name`.

`[read]` **Tom, 2026-08-22:** *„jedes modul kriegt als erstes seine
interactionstabelle für seine welt, die globale bauen wir später."*
Imatinib gegen Grapefruit ist Medikament gegen Lebensmittel — `[cmd]`
`medical.medication_active_substances` (498) gegen `nutrition.foods`
(7.140). Das kann keine Tabelle im `supplements`-Schema halten.

`[cmd]` **Datenlage:** `drug_interactions` bei 78 von 290, als
Freitext. Imatinib↔Grapefruit steht nirgends — das ist CYP3A4, und
`cyp` ist bei 43 von 566 gefüllt, bei den Medikamenten bei 22 von 498.
**Die Tabelle wird lange dünn bleiben.**

---

## 5 · Nutzerdaten

| Tabelle | Herkunft | Zeilen heute | |
|---|---|---:|---|
| `user_stacks` | DB | 2 | **fehlt:** Startdatum, Enddatum, Planer — `[cmd]` kennt nur `is_active`. Toms Vorgabe: *„aktivierbar sofort / per Datum / Planer"* |
| `stack_items` | DB | 8 | `supplement_id` zeigt auf die 44er-Tabelle — **das ist die Umhängung** |
| `intake_logs` | DB | 720 | `status`: `taken · skipped · pending` |
| `intake_schedule` | **ALT** | — | **fehlt ganz.** `[cmd]` `intake_logs` sagt, was genommen wurde; nichts sagt, was geplant *war* |
| `user_inventory` | **SPEC** | — | **fehlt ganz.** Bestand, Kauf, Ablauf, Lieferant, `cost_per_unit`, `total_cost`, `reorder_flag` |
| `user_supplement_settings` | **SPEC** | — | **fehlt ganz.** `enhanced_mode`, `enhanced_accepted_at`, `enhanced_age_verified`, Erinnerungszeiten, `low_stock_days` |
| `supplement_reminders` | **ALT** | — | Erinnerungen je Zyklus |
| `stack_templates` + `_items` | SPEC | — | `source`: `system · coach · community` |

`[cmd]` **`cost_per_unit` ist die Antwort auf die offene Frage nach
`cost_per_serving`.** Kosten gehören zum **Bestand des Nutzers**, nicht
zum Katalog — deshalb war die Spalte in der 44er-Tabelle falsch, und
deshalb entfällt sie dort ersatzlos (C-229).

`[cmd]` **`user_supplement_settings` trägt den Enhanced-Mode mit
Altersprüfung** (Flow 9) — und steht neben `experience_level`, das
G-167 als Provisorium gesetzt hat. **Zwei Wege zum selben Gate, zu
klären.**

---

## 6 · Zyklen und Protokolle

`[read]` **Tom, 2026-08-23:** *„ja klar wir haben einen cycleplanner
usw. steht alles in der spec und altem repo."*

| Tabelle | Herkunft | |
|---|---|---|
| `user_supplement_cycles` | **ALT** | `status`: `active · paused · stopped` · `source`: `coach_suggested · confirmed_by_user` · `suggestion_source`: `ai_suggested · marketplace_product · coach_recommendation · user_manual` · `marketplace_product_id` |
| `supplement_cycle_events` | **ALT** | Ereignisse im Zyklus |
| `supplement_protocols` + `_items` | **ALT** | PCT-Protokolle |

`[cmd]` `CyclePlanner.tsx` im Vorgänger hat **36 KB** — die grösste
Komponente des alten Moduls.

`[cmd]` **`C-186` heisst *„Nebenwirkungen und Zyklen haben keine
Tabelle"* — hier ist sie**, seit dem Vorgängerrepo.

`[read]` **`supplement_protocols` ist die Antwort auf
`requires_pct`/`requires_ai`/`requires_serm`:** nicht drei
Boolean-Felder, sondern ein Protokoll mit Positionen. Die Boolean
sagen *ob*, das Protokoll sagt *was*.

`[cmd]` `user_supplement_cycles` verweist auf `marketplace_product_id`
— **der Vorgänger hatte eine Marketplace-Anbindung**, hier gibt es
keine (G-164).

---

## 7 · Was NICHT gebaut wird

### `enhanced_substances` — SPEC, abgelehnt

`[read]` **Das ist eine zweite Substanztabelle** — genau der Fehler,
den dieses Dokument behebt: 44 gegen 566, `supplement_catalog` gegen
`substance_catalog`. **Die Spec baut ihn ein drittes Mal ein.**

**Eine Gruppe ist keine eigene Tabelle.** `enhanced` ist ein Wert in
`supplement_groups`. `[cmd]` 177 Zeilen.

`[cmd]` **Und `user_inventory` verweist in der Spec auf beide** —
`supplement_id` **und** `enhanced_substance_id`. Dieselbe
Doppelspurigkeit eine Ebene tiefer. In der neuen Fassung zeigt sie nur
auf `supplements`.

**Wohin der Inhalt geht:**

| aus `enhanced_substances` | nach |
|---|---|
| `hepatotoxicity_level`, `cardiovascular_risk` | `supplement_organ_risks` |
| `requires_pct`, `requires_ai`, `requires_serm`, `aromatization` | `supplement_protocol_requirements` |
| `detection_time_days` | `supplement_wada` |
| `legal_status` | `supplement_regulatory` |
| `androgenic_rating`, `anabolic_rating` | `supplement_aas_ratings` |
| `route`, `half_life_hours` | `supplement_pharmacology` |
| `warnings`, `contraindications`, `side_effects` | `supplement_safety` |
| `drug_interactions` | `supplement_interactions` |

### `supplement_knowledge` — ALT, aufgelöst

`[cmd]` Der Vorgänger hatte `description`, `usage_hint`, `safety_note`,
`goal_tags` je Kategorie. **`description` geht nach `supplements`,
`safety_note` nach `supplement_safety`, `goal_tags` nach
`supplement_tags`, `usage_hint` nach `supplement_dosing`.**
Eine Tabelle, die vier Informationsarten mischt, ist genau das, was
hier getrennt wird.

---

## 8 · Die Reihenfolge

`[read]` **Tom, 2026-08-23:** *„namentlich sollten die neuen tables ja
reinpassen ohne die alten zu stören. also alle zuerst anlegen und
danach befüllen und verknüpfen. wenn alles durch ist können die alten
tables weg."*

1. **Anlegen** — alle 26, leer, neben den bestehenden
2. **Befüllen** — aus `substance_catalog.raw` und den bestehenden Tabellen
3. **Umhängen** — `stack_items.supplement_id`, `[cmd]` 8 Positionen und
   8 Zuordnungen in `stack_item_substance_matches`
4. **Lesepfade umstellen** — `stack-read`, `stack-write`,
   `substanz-read`, `medical/page.tsx`
5. **Alte weg** — `supplement_catalog` (44), `substance_catalog` (566),
   `substance_aliases`, `substance_lab_effects`,
   `supplement_nutrient_mappings`, `substance_catalog_sources`

`[read]` **Schritt 5 erst, wenn 1–4 gemessen sind.** Und jeder Schritt
wird live eingespielt, nicht nur auf der Wegwerf-Instanz — das ist die
Regel aus C-226.

---

## 9 · Was offen ist

**Enhanced-Gate — entschieden am 2026-08-23:** `experience_level`
bleibt, `enhanced_mode` und Altersprüfung werden **nicht gebaut**.

`[read]` **Tom:** *„wir sind am entwickeln und das werden wir noch ein
jahr sein. wenn dann irgendwann mal das subscription modell und die
tiers definiert sind … dann diskutieren wir ueber sachen wie
alterspruefung oder sonstige sachen die mich heute nicht im geringsten
interessieren."*

**Die Regel daraus, sie gilt fuer das ganze Schema: was heute nicht
entschieden ist, wird nicht vorgebaut.** Kein Gate, kein
Consent-Screen, keine Tarifstufe. `[read]` Ein Feld, das auf eine
Entscheidung wartet, die es nicht gibt, wird in vier Wochen als
Entscheidung gelesen — dasselbe Muster wie die neun falschen Banner.

**Aber es wird sichtbar ausgelassen, nicht verschwiegen** (Tom,
2026-08-23): *„sehe es vor und mach texteintraege da im code und
verweise im todo darauf, zb spec sagt das wuerde hier kommen haben wir
aber noch nicht."*

Deshalb traegt jeder ausgelassene Teil im Kettenschritt einen Block:

```
-- NICHT GEBAUT: user_supplement_settings (SPEC_06, Abschnitt 4)
-- Die Spec sieht enhanced_mode, enhanced_accepted_at,
-- enhanced_age_verified, Erinnerungszeiten und low_stock_days vor.
-- Tom, 2026-08-23: erst wenn Subscription und Tiers definiert sind.
-- Punkt: C-233. Bis dahin entscheidet experience_level (G-167).
```

**Was aus derselben Regel ebenfalls nicht gebaut wird:**

| ausgelassen | Quelle | Punkt |
|---|---|---|
| `user_supplement_settings` samt Alterspruefung | SPEC_06 | C-233 |
| `user_supplement_cycles.marketplace_product_id` | ALT | C-234 |
| Consent-Fuehrung, Speicherweg, Vision-Modell | 035-Handoff | C-207 |

**Was bleibt, und warum:**

`min_experience_level` in `supplement_groups` — **kein Tarif**, sondern
Toms Vorgabe vom 2026-08-22 (Peptide und Enhanced ab Pro und Elite).
`[cmd]` Heute steht sie als Konstante in `extended-regel.ts`; in der
Tabelle ist eine Verschiebung eine Zeile statt eines Deploys.

`partner_type` in `supplement_interactions` — vorerst ein einziger
Wert. `[read]` Kostet nichts und spart die zweite Runde: **genau der
Fehler, der `supplement_catalog` gegen `substance_catalog` erzeugt
hat.**

**Regel-Engine:** `[cmd]` `rule_catalog` (64) und `rule_assessment`
liegen als SQL in `supabase`. Wenn Buddy sein eigenes Regelwerk
mitbringt, sind das zwei Auswertungen auf denselben Daten — dasselbe
Problem wie mit den zwei Katalogen.

**`C-223`:** `dose_ceiling` ist bei allen 32 Einträgen Freitext mit
Rechtsraum, bei Vitamin B6 US 100 mg/d **und** EFSA 12 mg/d in einem
Feld. Mit `supplement_regulatory` je Rechtsraum wird es lösbar — die
Obergrenze gehört dorthin, nicht in `supplement_dosing`.

**Marketplace:** `[cmd]` `user_supplement_cycles.marketplace_product_id`
zeigt auf ein Modul, das hier nicht existiert (G-164).
