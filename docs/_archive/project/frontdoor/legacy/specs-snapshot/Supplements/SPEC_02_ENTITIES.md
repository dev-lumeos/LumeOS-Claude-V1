# Supplements Module — Core Entities
> Spec Phase 2 | Datenmodell

---

## Entity-Übersicht

```
STAMMDATEN (kuratiert / System)     USER DATA
──────────────────────────────      ─────────────────────────────────────
Supplement                          UserStack (source: user|coach|marketplace)
  └── SupplementInteraction           └── StackItem ──→ Supplement | EnhancedSubstance
EnhancedSubstance                       └── IntakeLog
  └── EnhancedInteraction
StackTemplate                       UserInventory
  └── StackTemplateItem
                                    DailyIntakeSummary (VIEW)
```

---

## Allgemeine Regeln

**Sprachen:** name_de, name_en, name_th — TH initial NULL.
**Keine Vermischung:** Standard und Enhanced in getrennten Tabellen.
**Schema-Isolation:** Alle Tabellen im Schema `supplements`.
**Deterministische Checks:** Interaction-Checker ist regelbasiert.

---

## 1. Supplement

Kuratierte Standard-Supplement-Datenbank. Read-only nach Import.

```
id                  UUID PK
name                TEXT NOT NULL              Canonical EN Name
name_de             TEXT                       Deutsch
name_en             TEXT                       English (wenn abweichend)
name_th             TEXT
slug                TEXT UNIQUE                URL-freundlich

-- Klassifikation
category            TEXT NOT NULL
  Vitamins | Minerals | Performance | Recovery | Adaptogens |
  Sleep | Gut Health | Longevity | Amino Acids | Hormones | Other
subcategory         TEXT
form                TEXT                       Capsule | Powder | Liquid | Softgel | Gummy

-- Evidence
evidence_grade      TEXT NOT NULL DEFAULT 'C'
  S | A | B | C | D | F
evidence_summary    TEXT                       Kurzfassung der Evidenz
evidence_sources    JSONB                      [{doi, year, finding}]
side_effects        TEXT[]
contraindications   TEXT[]
allergy_flags       TEXT[]

-- Dosierung
typical_dose_min    NUMERIC(10,3)
typical_dose_max    NUMERIC(10,3)
dose_unit           TEXT DEFAULT 'mg'          mg | g | mcg | IU | ml | cfu
serving_size        TEXT
best_timing         TEXT
timing_default      TEXT DEFAULT 'morning'     morning | midday | evening | pre_workout | post_workout | bedtime
absorption_notes    TEXT                       "Mit Fett einnehmen" | "Nüchtern"
requires_food       BOOLEAN DEFAULT false
requires_empty_stomach BOOLEAN DEFAULT false

-- Cycling
requires_cycling    BOOLEAN DEFAULT false
cycling_protocol    JSONB                      {on_weeks: 8, off_weeks: 4, restart_ok: true}
half_life_hours     INTEGER

-- Nährstoffe (Cross-Modul: Nutrition)
nutrients_provided  JSONB                      {"VITD": {"amount": 1000, "unit": "IU"}}
  -- Keys = BLS-Nährstoff-Codes aus nutrient_defs

-- Meta
benefits            TEXT[]
priority            TEXT CHECK (priority IN ('essential','top_needed','nice_to_have','avoid'))
cost_per_serving    NUMERIC(8,3)
is_active           BOOLEAN DEFAULT true
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

---

## 2. EnhancedSubstance

PED-Datenbank — strikt getrennt von Supplement-Tabelle.
Nur sichtbar wenn Enhanced Mode aktiv.

```
id                   UUID PK
name                 TEXT NOT NULL
aliases              TEXT[]                     Handelsnamen, Slang
category             TEXT NOT NULL
  AAS | SARM | Peptide | GH | AI | SERM | PCT | GLP1 | Support | Other
description          TEXT
chemical_name        TEXT                       Wissenschaftlicher Name

-- Chemische Eigenschaften
molecular_weight     INTEGER
half_life_hours      NUMERIC(8,2)

-- Dosierung
route                TEXT NOT NULL              oral | injection_im | injection_subq | topical | nasal
typical_dose_min     NUMERIC(10,3)
typical_dose_max     NUMERIC(10,3)
dose_unit            TEXT DEFAULT 'mg'          mg | mcg | IU | ml
frequency            TEXT                       daily | eod | weekly | e3d

-- Sicherheit
hepatotoxicity_level TEXT
  CHECK (IN ('none','low','moderate','high','severe'))
cardiovascular_risk  TEXT
  CHECK (IN ('none','low','moderate','high','severe'))
androgenic_rating    INTEGER                    0–500+ Skala
anabolic_rating      INTEGER                    0–500+ Skala

-- PCT & AI Anforderungen
requires_pct         BOOLEAN DEFAULT false
requires_ai          BOOLEAN DEFAULT false
requires_serm        BOOLEAN DEFAULT false
aromatization        TEXT CHECK (IN ('none','low','moderate','high'))

-- Warnings
warnings             TEXT[]
contraindications    TEXT[]
drug_interactions    TEXT[]
side_effects         JSONB                      {common: [...], rare: [...], serious: [...]}

-- Rechtliches
legal_status         JSONB                      {de: "illegal", us: "schedule III", ...}
detection_time_days  INTEGER                    Für getestete Athleten

is_active            BOOLEAN DEFAULT true
created_at           TIMESTAMPTZ
```

---

## 3. SupplementInteraction

Evidence-basierte Interaction-Datenbank.

```
id                    UUID PK

-- Beteiligte (flexibles Matching)
supplement1_id        UUID FK → Supplement         (oder enhanced)
supplement1_name      TEXT                         Für Name-basiertes Matching
supplement2_id        UUID FK → Supplement
supplement2_name      TEXT
enhanced1_id          UUID FK → EnhancedSubstance
enhanced2_id          UUID FK → EnhancedSubstance

-- Interaction Details
interaction_type      TEXT NOT NULL
  CHECK (IN ('synergy','absorption','conflict','timing','contraindication'))
severity              TEXT NOT NULL
  CHECK (IN ('info','caution','warning','critical'))

-- Beschreibungen (3-sprachig)
description_de        TEXT
description_en        TEXT NOT NULL
recommendation_de     TEXT
recommendation_en     TEXT
timing_recommendation TEXT              separate_2h | separate_4h | take_together | avoid

-- Evidenz
evidence_level        TEXT DEFAULT 'moderate'
  CHECK (IN ('low','moderate','high'))
evidence_sources      TEXT[]

-- Protokoll bei critical
blocks_intake         BOOLEAN DEFAULT false       Einnahme sperren
requires_confirmation BOOLEAN DEFAULT false       User muss explizit bestätigen

is_active             BOOLEAN DEFAULT true
```

---

## 4. UserStack

Supplement-Vorlage des Users.

```
id                   UUID PK
user_id              UUID NOT NULL
name                 TEXT NOT NULL
description          TEXT
goal                 TEXT DEFAULT 'custom'
  muscle_building | fat_loss | recovery | health | longevity | performance | custom
source               TEXT DEFAULT 'user'
  user | coach | marketplace | template

-- Status
is_active            BOOLEAN DEFAULT false        Nur einer aktiv per User
is_enhanced          BOOLEAN DEFAULT false        Hat Enhanced Items?

-- Analytics (computed)
total_monthly_cost   NUMERIC(8,2)
item_count           INTEGER DEFAULT 0

-- Meta
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ

CONSTRAINT unique_active_stack_per_user
  EXCLUDE (user_id WITH =) WHERE (is_active = true)
```

---

## 5. StackItem

Ein Supplement in einem Stack mit User-spezifischen Einstellungen.

```
id                      UUID PK
stack_id                UUID FK → UserStack CASCADE

-- Supplement-Referenz (genau eines gesetzt)
supplement_id           UUID FK → Supplement
enhanced_substance_id   UUID FK → EnhancedSubstance
mode                    TEXT NOT NULL DEFAULT 'standard'
  CHECK (IN ('standard', 'enhanced'))

-- Customization
custom_name             TEXT                    Override des Supplement-Namens
notes                   TEXT

-- Dosierung
dose                    NUMERIC(10,3) NOT NULL
dose_unit               TEXT NOT NULL DEFAULT 'mg'
frequency               TEXT DEFAULT 'daily'
  daily | weekdays | training_days | custom | cycling
timing                  TEXT DEFAULT 'morning'
  morning | midday | evening | pre_workout | post_workout | bedtime

-- Cycling
cycling                 JSONB
  {on_weeks: 8, off_weeks: 4, start_date: "2026-01-01", current_phase: "on"}

sort_order              INTEGER DEFAULT 0
is_active               BOOLEAN DEFAULT true
added_at                TIMESTAMPTZ

CONSTRAINT supplement_xor CHECK (
  (supplement_id IS NOT NULL AND enhanced_substance_id IS NULL) OR
  (supplement_id IS NULL AND enhanced_substance_id IS NOT NULL)
)
```

---

## 6. IntakeLog

Tägliches Intake-Tracking pro Stack-Item.

```
id               UUID PK
user_id          UUID NOT NULL
stack_item_id    UUID FK → StackItem CASCADE
date             DATE NOT NULL
mode             TEXT DEFAULT 'standard'  standard | enhanced

-- Status
status           TEXT NOT NULL
  pending | taken | skipped | snoozed
taken_at         TIMESTAMPTZ              Zeitpunkt der Einnahme
notes            TEXT

-- Abweichung von geplanter Dosis
actual_dose      NUMERIC(10,3)
actual_dose_unit TEXT

UNIQUE (user_id, stack_item_id, date)
```

---

## 7. UserInventory

Bestand-Tracking per Supplement/Produkt.

```
id                      UUID PK
user_id                 UUID NOT NULL
supplement_id           UUID FK → Supplement
enhanced_substance_id   UUID FK → EnhancedSubstance
product_name            TEXT                    Eigener Produktname (z.B. "Now Foods D3")

-- Bestand
current_stock           NUMERIC(10,2)           Restmenge
unit                    TEXT                    capsules | g | ml | servings
purchase_date           DATE
expiry_date             DATE

-- Alerts
low_stock_threshold     NUMERIC(10,2) DEFAULT 10
reorder_flag            BOOLEAN DEFAULT false

-- Einkauf
supplier                TEXT
cost_per_unit           NUMERIC(8,3)
total_cost              NUMERIC(10,2)

created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

---

## 8. StackTemplate

Vorgefertigte Stacks (System-Templates oder Coach-Templates).

```
id           UUID PK
name         TEXT NOT NULL
name_de      TEXT
description  TEXT
goal         TEXT
source       TEXT DEFAULT 'system'   system | coach | community
is_public    BOOLEAN DEFAULT false
created_at   TIMESTAMPTZ

-- Template-Items
-- → StackTemplateItem Tabelle
```

---

## 9. DailyIntakeSummary (VIEW)

```
user_id, date, mode,
total_scheduled, total_taken, total_skipped, total_pending,
compliance_pct,
total_monthly_cost
```

---

## Schema-Übersicht

```sql
-- Stammdaten (read-only nach Import)
supplements.supplement_catalog          (als supplements)
supplements.enhanced_substances
supplements.supplement_interactions
supplements.stack_templates
supplements.stack_template_items

-- User-Daten
supplements.user_stacks
supplements.stack_items
supplements.intake_logs
supplements.user_inventory

-- View
supplements.daily_intake_summary
```
