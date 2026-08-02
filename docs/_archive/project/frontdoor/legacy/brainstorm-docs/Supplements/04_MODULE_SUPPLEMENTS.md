# LUMEOS — Modul: Supplements
> Konsolidiert | 2026-04-14
> API Port: 5300 | Status: ✅ 90% komplett

---

## 1. Zweck

Das Supplements-Modul verwaltet Supplement-Stacks, Intake-Tracking, Interaction-Checking und zielbasierte Empfehlungen. Es unterstützt sowohl normale Supplements als auch ein optionales Enhanced Mode (PEDs) mit strikt separierter Datenhaltung.

---

## 2. Architektur

```
Frontend (Next.js/Vite)
  apps/app/modules/supplements/
    ├── components/  (15+ Components)
    ├── hooks/       
    └── stores/

API Layer (Hono, Port 5300)
  src/api/supplements/
    ├── server.ts
    └── routes/
        ├── supplements.ts    (Suche, Catalog)
        ├── stacks.ts         (CRUD Stacks, Activate)
        ├── stack-items.ts    (Items in Stacks)
        ├── intake.ts         (Daily Logging)
        ├── interactions.ts   (Interaction Check)
        └── inventory.ts      (Bestand)

Database
  6 Core-Tabellen
```

---

## 3. Features

### 3.1 Supplement-Datenbank
- Umfangreiche kuratierte Bibliothek
- Evidence-Grading: A+ (Meta-Analysen) bis F (widerlegt)
- Deutsche + englische Namen
- Kategorien: Vitamin, Mineral, Performance, Recovery, Hormones, etc.
- Dosierungs- + Timing-Empfehlungen
- Cycling-Protokolle für zyklische Supplements
- Interactions-Daten (Supplement ↔ Supplement, Supplement ↔ Medikament)

### 3.2 Enhanced Mode (PEDs — Optional)
- Separater Datensatz: `enhanced_substances` Tabelle
- Kategorien: AAS, SARM, Peptide, GH, AI, SERM
- Nur für User die explizit aktivieren
- Aliase-Support für verschiedene Handelsnamen
- Cycling-Pflicht für alle Enhanced Substances

### 3.3 Stack Management
- Mehrere Stacks pro User
- **Nur ein Stack gleichzeitig aktiv** (vereinfacht Daily Tracking)
- Stack-Aktivierung deaktiviert automatisch alle anderen
- Import von Stack-Templates (vordefiniert)

### 3.4 Smart Item Management
- Custom-Namen per Item (z.B. "Morning Magnesium")
- Flexible Dosierung (beliebige Kombination Dosis/Einheit)
- Timing: morning, midday, evening, pre_workout, post_workout
- Cycling-Support: On/Off-Wochen konfigurierbar
- Sort-Order: benutzerdefinierte Reihenfolge
- Frequency: daily, weekdays, custom, training_days

### 3.5 Interaction Checker
- Automatische Prüfung bei Stack-Änderungen
- Supplement ↔ Supplement Konflikte
- Supplement ↔ Medikament Konflikte
- Severity: critical, high, moderate, low
- Synergien (+): positive Kombinationen markieren

### 3.6 Daily Intake Logging
- Check-off Interface für täglich fällige Supplements
- Pro Timing-Slot (morning, pre_workout, etc.)
- Cycle-Check: Ist heute ein "On"-Tag?
- Compliance-Score input für Scoring

### 3.7 Inventory Management
- Bestand pro Supplement/Produkt
- Low-Stock-Alerts (konfigurierbar)
- Verbrauchsrate-Tracking
- Nachbestellungs-Reminder

### 3.8 Cost Tracking
- Kosten pro Serving
- Monatliche Stack-Kosten-Berechnung
- Cost-Optimization-Suggestions (geplant)

### 3.9 Smart Search
- Unified Search: normale + enhanced Substances
- Evidence-Based Ranking (A+ zuerst)
- Kategorie-Filter
- Alias-Suche für Enhanced

---

## 4. Datenbank-Schema

### `supplements` (Master-Tabelle)
```sql
id              UUID PK
name            VARCHAR NOT NULL
name_de         VARCHAR
name_en         VARCHAR
slug            VARCHAR UNIQUE
category        VARCHAR NOT NULL       -- Vitamin, Mineral, Performance...
subcategory     VARCHAR
evidence_grade  VARCHAR DEFAULT 'C'    -- A+, A, B, C, F
evidence_data   JSONB                  -- Research citations
side_effects    TEXT[]
contraindications TEXT[]
allergy_flags   TEXT[]
typical_dose    VARCHAR                -- "500-1000mg"
dose_unit       VARCHAR DEFAULT 'mg'
serving_size    VARCHAR
best_timing     VARCHAR
timing_default  VARCHAR DEFAULT 'morning'
absorption_notes TEXT
requires_food   BOOLEAN DEFAULT false
requires_empty_stomach BOOLEAN DEFAULT false
interactions    TEXT[]
nutrients_provided JSONB               -- {"vitamin_d": {"amount": 1000, "unit": "IU"}}
requires_cycling BOOLEAN DEFAULT false
cycling_protocol JSONB
half_life_hours INTEGER
brand           VARCHAR
cost_per_serving DECIMAL(8,3)
priority        VARCHAR                -- essential, top_needed, nice_to_have
benefits        TEXT[]
is_enhanced     BOOLEAN DEFAULT false
is_active       BOOLEAN DEFAULT true
```

### `enhanced_substances`
```sql
id              UUID PK
name            VARCHAR NOT NULL
category        VARCHAR                -- AAS, SARM, Peptide, GH, AI, SERM
aliases         TEXT[]                 -- Handelsnamen
typical_dose_min NUMERIC
typical_dose_max NUMERIC
dose_unit       VARCHAR
half_life_hours INTEGER
requires_cycling BOOLEAN DEFAULT true
cycling_protocol JSONB
```

### `user_stacks`
```sql
id          UUID PK
user_id     UUID FK
name        VARCHAR NOT NULL
is_active   BOOLEAN DEFAULT false     -- nur einer aktiv
description TEXT
created_at  TIMESTAMPTZ
```

### `stack_items`
```sql
id              UUID PK
stack_id        UUID FK
supplement_id   UUID FK (→ supplements oder enhanced_substances)
custom_name     VARCHAR
dose            NUMERIC NOT NULL
dose_unit       VARCHAR NOT NULL
frequency       VARCHAR               -- daily, weekdays, training_days
timing          VARCHAR               -- morning, pre_workout, etc.
cycling         JSONB                 -- {on_weeks: 8, off_weeks: 4}
sort_order      INTEGER
notes           TEXT
```

### `intake_logs`
```sql
id              UUID PK
user_id         UUID FK
stack_item_id   UUID FK
logged_at       TIMESTAMPTZ
dose_taken      NUMERIC
dose_unit       VARCHAR
timing          VARCHAR
skipped         BOOLEAN DEFAULT false
skip_reason     TEXT
```

### `supplement_interactions`
```sql
supplement_a_id UUID FK
supplement_b_id UUID FK
interaction_type VARCHAR    -- conflict, synergy, caution
severity        VARCHAR     -- critical, high, moderate, low, beneficial
description     TEXT
mechanism       TEXT
```

---

## 5. API-Endpunkte

| Route | Hauptendpunkte |
|---|---|
| `supplements.ts` | `GET /supplements/search`, `GET /supplements/:id` |
| `stacks.ts` | CRUD Stacks, `POST /stacks/:id/activate` |
| `stack-items.ts` | CRUD Items in Stack |
| `intake.ts` | `POST /intake/log`, `GET /intake/today`, Compliance-Score |
| `interactions.ts` | `GET /interactions/check?stack_id=X` |
| `inventory.ts` | `GET/PUT /inventory/:item_id` |

### Unified Search Query
```typescript
GET /api/supplements/search?q=vitamin+d&category=Vitamin&enhanced=false
// Sucht in supplements + optional enhanced_substances
// Sortiert nach evidence_grade
```

### Stack Activation
```typescript
POST /api/supplements/stacks/:id/activate
// Deaktiviert alle anderen Stacks des Users
// Aktiviert Ziel-Stack
```

---

## 6. Compliance Score

```typescript
supplementScore = (
  items_taken / items_scheduled * 100
) * evidence_weight_factor * level_multiplier
```

Fließt als Input in das Goals-Modul.

---

## 7. Verbindungen zu anderen Modulen

| Modul | Verbindung |
|---|---|
| **Goals** | Compliance Score → Goal Progress |
| **Nutrition** | `nutrients_provided` ergänzt Mikronährstoff-Tracking (Vitamin D, Magnesium etc.) |
| **Medical** | Supplement-Einnahmen für Biomarker-Korrelationen (z.B. D3 → 25-OH-D Verlauf) |
| **Marketplace** | Supplement-Produkte für Kauf verfügbar |
| **Coach (AI)** | Stack-Analyse, Defizit-Empfehlungen, Timing-Reminders |

---

## 8. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🟡 | Supplement-Food Interactions (z.B. Eisen + Kaffee) | 🟡 MITTEL |
| TODO | 🟡 | Marketplace-Integration (direkt bestellen) | 🟡 MITTEL |
| TODO | 🟡 | Ablaufdatum-Tracking | 🟡 MITTEL |
| TODO | 🟡 | Cost Optimization Suggestions | 🟡 MITTEL |
| TODO | 🟢 | Supplement-Protokoll-Bibliothek (z.B. "Beginner Stack") | 🟢 NIEDRIG |

---

## 9. Cross-Module Intelligence (Differenzierung)

Das Supplements-Modul ist das einzige das alle anderen Module für Empfehlungen nutzt.

**Nutrition Gap Analysis:**
"Dir fehlen 4.000 IU Vitamin D basierend auf deinem Food Log" — Mikronährstoff-Lücken aus BLS-Daten erkennen und mit dem Supplement-Stack abgleichen.

**Redundancy Detection:**
"3 Supplements enthalten Magnesium → 1 reicht" — Stack-Überschneidungen automatisch erkennen.

**Training-Aware Stacks:**
"Leg Day → Kreatin Pre, Magnesium Post" — Training-Typ beeinflusst Timing-Empfehlungen.

**Bloodwork Effectiveness Tracking:**
"Vitamin D: 18 → 52 ng/mL in 3 Monaten ✅" — Medical-Daten zeigen ob Supplements wirken.

**Evidence Grades (A★ bis F):**
- A★★★★★ — Meta-Analysen, RCTs: Kreatin, Koffein
- A — Mehrere RCTs: Omega-3, Vitamin D
- B — Limitierte Studien: Ashwagandha, Magnesium
- C — Wenig Evidenz: Viele "Performance" Supps
- F — Widerlegt oder kein Effekt: BCAAs (bei ausreichend Protein), Glutamin

---

## 10. User Stories (Auszug aus PRD)

- **US-01:** User kann Supplement zum Stack hinzufügen (Name, Marke, Dosis, Form)
- **US-02:** User kann mehrere Stacks erstellen ("Bulk Stack", "Cut Stack", "Daily")
- **US-03:** User kann Stack als aktiv setzen (nur einer aktiv)
- **US-10:** User sieht tägliche Einnahme-Liste (wie Diary Ghost Entries)
- **US-11:** 1-Tap "Genommen" markieren
- **US-20:** Optimale Einnahme-Zeiten basierend auf Mahlzeiten
- **US-21:** Warnungen bei Supplement-Supplement Interaktionen
- **US-22:** Absorption-Hinweise ("Mit Fett einnehmen", "Nüchtern")
- **US-23:** Timing-Konflikte ("Calcium + Iron: 2h Abstand!")
- **US-30:** Mikronährstoff-Lücken aus Food Log (Gap Analysis)
- **US-31:** Redundanzen im Stack erkennen
- **US-32:** Evidence Grades pro Supplement anzeigen
