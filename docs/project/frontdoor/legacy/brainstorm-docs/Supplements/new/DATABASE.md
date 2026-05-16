# Supplements Module — Database Schema

## Schema & Übersicht

Alle Supplements-Tabellen im Schema `supplements`. Cross-Modul-Zugriff ausschließlich via API (Port 5300). RLS auf allen User-Tabellen.

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `supplements.supplement_catalog` | Kuratierte Standard-Supplements (evidence-graded, read-only) |
| `supplements.enhanced_substances` | PED-Datenbank (~85 Compounds, Enhanced Mode only) |
| `supplements.supplement_interactions` | Evidence-basierte Interactions + Synergien |
| `supplements.stack_templates` | System/Coach Vorlagen |
| `supplements.stack_template_items` | Items in Vorlagen |
| `supplements.user_supplement_settings` | Enhanced Mode, Reminder-Zeiten, Schwellwerte |
| `supplements.user_stacks` | User Supplement-Stacks |
| `supplements.stack_items` | Items in Stack mit Dosis/Timing/Cycling |
| `supplements.intake_logs` | Tägliches Intake-Tracking |
| `supplements.user_inventory` | Bestand-Tracking |

**View:** `daily_intake_summary`

---

## Kern-Tabellen Detail

### `supplements.supplement_catalog`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | Canonical EN Name |
| `name_de` / `name_en` / `name_th` | TEXT | 3-sprachig |
| `slug` | TEXT UNIQUE | URL-freundlich |
| `category` | TEXT NOT NULL | Vitamins / Minerals / Performance / Recovery / Adaptogens / Sleep / Gut Health / Longevity / Amino Acids / Hormones / Other |
| `subcategory` | TEXT | |
| `form` | TEXT | Capsule / Powder / Liquid / Softgel / Gummy |
| `evidence_grade` | TEXT DEFAULT 'C' | S / A / B / C / D / F |
| `evidence_summary` | TEXT | Kurzfassung |
| `evidence_sources` | JSONB | [{doi, year, finding}] |
| `side_effects` | TEXT[] | |
| `contraindications` | TEXT[] | |
| `allergy_flags` | TEXT[] | |
| `typical_dose_min` / `typical_dose_max` | NUMERIC(10,3) | |
| `dose_unit` | TEXT DEFAULT 'mg' | mg / g / mcg / IU / ml / cfu |
| `timing_default` | TEXT DEFAULT 'morning' | morning / midday / evening / pre_workout / post_workout / bedtime |
| `absorption_notes` | TEXT | "Mit Fett einnehmen" |
| `requires_food` | BOOLEAN DEFAULT false | |
| `requires_empty_stomach` | BOOLEAN DEFAULT false | |
| `requires_cycling` | BOOLEAN DEFAULT false | |
| `cycling_protocol` | JSONB | {on_weeks, off_weeks, restart_ok} |
| `half_life_hours` | INTEGER | |
| `nutrients_provided` | JSONB DEFAULT '{}' | BLS-Codes: {"VITD": {"amount": 1000, "unit": "IU"}} |
| `benefits` | TEXT[] | |
| `priority` | TEXT | essential / top_needed / nice_to_have / avoid |
| `cost_per_serving` | NUMERIC(8,3) | |
| `is_active` | BOOLEAN DEFAULT true | |

**Indexes:** GIN auf `name` + `name_de` (pg_trgm); btree auf `category`, `evidence_grade`; GIN auf `nutrients_provided`

**RLS:** SELECT für alle authenticated (read-only)

---

### `supplements.enhanced_substances`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | |
| `aliases` | TEXT[] | Handelsnamen, Slang |
| `category` | TEXT NOT NULL | AAS / SARM / Peptide / GH / AI / SERM / PCT / GLP1 / Support |
| `chemical_name` | TEXT | |
| `half_life_hours` | NUMERIC(8,2) | |
| `route` | TEXT NOT NULL | oral / injection_im / injection_subq / topical / nasal |
| `typical_dose_min` / `max` | NUMERIC(10,3) | |
| `dose_unit` | TEXT DEFAULT 'mg' | |
| `frequency` | TEXT | daily / eod / weekly / e3d |
| `hepatotoxicity_level` | TEXT | none / low / moderate / high / severe |
| `cardiovascular_risk` | TEXT | none / low / moderate / high / severe |
| `androgenic_rating` / `anabolic_rating` | INTEGER | 0–500+ |
| `requires_pct` / `requires_ai` / `requires_serm` | BOOLEAN | |
| `aromatization` | TEXT | none / low / moderate / high |
| `warnings` | TEXT[] | |
| `contraindications` | TEXT[] | |
| `side_effects` | JSONB | {common: [...], rare: [...], serious: [...]} |
| `legal_status` | JSONB | {de: "illegal", us: "schedule III", ...} |
| `detection_time_days` | INTEGER | |
| `is_active` | BOOLEAN DEFAULT true | |

**RLS:** SELECT nur wenn `user_supplement_settings.enhanced_mode = true`

---

### `supplements.supplement_interactions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `supplement1_id` / `supplement1_name` | UUID / TEXT | Flexibles Matching |
| `supplement2_id` / `supplement2_name` | UUID / TEXT | |
| `enhanced1_id` / `enhanced2_id` | UUID | Enhanced ↔ Enhanced / Standard |
| `interaction_type` | TEXT | synergy / absorption / conflict / timing / contraindication |
| `severity` | TEXT NOT NULL | info / caution / warning / critical |
| `description_en` / `description_de` | TEXT | |
| `recommendation_en` / `recommendation_de` | TEXT | |
| `timing_recommendation` | TEXT | separate_2h / separate_4h / separate_8h / take_together / avoid |
| `evidence_level` | TEXT | low / moderate / high |
| `blocks_intake` | BOOLEAN DEFAULT false | Bei critical |
| `requires_confirmation` | BOOLEAN DEFAULT false | |
| `is_active` | BOOLEAN DEFAULT true | |

---

### `supplements.user_stacks`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `name` | TEXT NOT NULL | |
| `goal` | TEXT DEFAULT 'custom' | muscle_building / fat_loss / recovery_sleep / health / longevity / performance / custom |
| `source` | TEXT DEFAULT 'user' | user / coach / marketplace / template |
| `is_active` | BOOLEAN DEFAULT false | |
| `is_enhanced` | BOOLEAN DEFAULT false | Hat Enhanced Items |
| `total_monthly_cost` | NUMERIC(8,2) | computed |
| `item_count` | INTEGER DEFAULT 0 | via Trigger |

**CONSTRAINT:** `EXCLUDE (user_id WITH =) WHERE (is_active = true)` — nur 1 aktiver Stack

---

### `supplements.stack_items`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `stack_id` | UUID FK CASCADE | |
| `supplement_id` | UUID FK → supplement_catalog | XOR mit enhanced_substance_id |
| `enhanced_substance_id` | UUID FK → enhanced_substances | |
| `mode` | TEXT | standard / enhanced |
| `custom_name` | TEXT | Override des Supplement-Namens |
| `dose` | NUMERIC(10,3) NOT NULL | |
| `dose_unit` | TEXT NOT NULL DEFAULT 'mg' | |
| `frequency` | TEXT | daily / weekdays / training_days / cycling |
| `timing` | TEXT | morning / midday / evening / pre_workout / post_workout / bedtime |
| `cycling` | JSONB | {on_weeks, off_weeks, start_date, current_phase} |
| `sort_order` | INTEGER DEFAULT 0 | |

**CONSTRAINT:** `(supplement_id IS NOT NULL AND enhanced_substance_id IS NULL) OR (supplement_id IS NULL AND enhanced_substance_id IS NOT NULL)`

---

### `supplements.intake_logs`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID NOT NULL | |
| `stack_item_id` | UUID FK CASCADE | |
| `date` | DATE NOT NULL | |
| `mode` | TEXT DEFAULT 'standard' | |
| `status` | TEXT | pending / taken / skipped / snoozed |
| `taken_at` | TIMESTAMPTZ | |
| `actual_dose` | NUMERIC(10,3) | Wenn abweichend |
| UNIQUE | (user_id, stack_item_id, date) | |

---

### `supplements.user_inventory`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID NOT NULL | |
| `supplement_id` / `enhanced_substance_id` | UUID FK | |
| `product_name` | TEXT NOT NULL | z.B. "Now Foods D3" |
| `current_stock` | NUMERIC(10,2) | |
| `unit` | TEXT | capsules / g / ml / servings |
| `expiry_date` | DATE | |
| `low_stock_threshold` | NUMERIC(10,2) DEFAULT 10 | |
| `reorder_flag` | BOOLEAN DEFAULT false | |
| `cost_per_unit` | NUMERIC(8,3) | |

---

## Trigger

| Trigger | Tabelle | Wann | Was |
|---|---|---|---|
| `trg_update_stack_count` | `stack_items` | INSERT/UPDATE/DELETE | Aktualisiert `user_stacks.item_count` |

---

## View: `daily_intake_summary`

```sql
SELECT user_id, date, mode,
  COUNT(*) FILTER (WHERE status = 'taken')   AS total_taken,
  COUNT(*) FILTER (WHERE status = 'skipped') AS total_skipped,
  COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
  COUNT(*)                                   AS total_scheduled,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'taken')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE status != 'pending'), 0) * 100, 1
  ) AS compliance_pct
FROM supplements.intake_logs
GROUP BY user_id, date, mode;
```

---

## RLS-Übersicht

| Tabelle | Policy |
|---|---|
| `supplement_catalog` | SELECT für authenticated (read-only) |
| `enhanced_substances` | SELECT nur wenn enhanced_mode = true |
| `supplement_interactions` | SELECT für authenticated |
| `stack_templates` | SELECT für authenticated |
| `user_supplement_settings` | ALL für Owner |
| `user_stacks` | ALL für Owner |
| `stack_items` | ALL für Owner (via user_stacks) |
| `intake_logs` | ALL für Owner |
| `user_inventory` | ALL für Owner |

---

## Schema-Entscheidungen

**Warum kuratierte DB statt NIH DSLD?** Kontrolle über Evidence Grades, kein Datenmüll. NIH DSLD hat 100K+ Produkte ohne Qualitätssicherung.

**Warum EXCLUDE statt Trigger für Single Active Stack?** DB-Level Garantie — kein App-Code kann zwei Stacks gleichzeitig aktiv setzen.

**Warum nutrients_provided mit BLS-Codes?** Erlaubt echte Summierung mit Nutrition-Modul — Supplement-Nährstoffe addieren sich zu Food-Log-Nährstoffen.

**Warum Enhanced separates Schema?** Legal + UX — Enhanced nie in Standard-Queries sichtbar, RLS als Sicherheitslayer.
