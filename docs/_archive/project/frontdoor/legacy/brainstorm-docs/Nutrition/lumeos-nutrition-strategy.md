# Lumeos Nutrition Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **6 Major Players:** MyFitnessPal (200M reg.), YAZIO (100M+), Lifesum (60M+), Lose It! (50M+), FatSecret (12.9M active), Cronometer (10M+)
- **Markt fragmentiert** in 3 Kategorien: Mass Market (MFP, YAZIO, Lifesum), Budget (FatSecret, Lose It!), Precision (Cronometer)
- **Pricing Range:** $6.99/yr (FatSecret) bis $99.99/yr (MFP Premium+)

### Kritische Gaps im Markt
1. **Mikronährstoff-Tracking ist miserabel** — nur Cronometer trackt 138 Nährstoffe (BLS), alle anderen zeigen max. 5-10
2. **Keine echte Training-Integration** — alle Apps tracken Kalorien von Übungen, aber KEINE passt Macros/Micros an Trainingsart an
3. **AI Logging ist neu und schlecht** — MFP Meal Scan, Lifesum Photo → alle ungenau, kein Kontext-Verständnis
4. **Onboarding = Copy-Paste** — alle nutzen denselben Goal→Stats→Paywall Flow, kein Differenzierungsmerkmal
5. **Kein Cross-Module-Wissen** — Supplements, Bloodwork, Recovery haben KEINEN Einfluss auf Nutrition-Empfehlungen

### Competitive Intelligence
- **MFP:** Milchkuh von Under Armour → Francisco Partners → aggressivstes Paywall-Modell, Barcode Scanner nur Premium
- **FatSecret:** Hidden Champion — API-Business (35K+ Devs), beste Datenbank (1.9M verified), günstigstes Abo
- **Cronometer:** Data-Quality Leader, Gold Standard für Mikros, aber schlechte UX und kein modernes Design
- **YAZIO:** DACH-Champion mit 100M+ Downloads, stark in Meal Plans, aber keine Tiefe bei Mikros
- **Lifesum:** Beste UX/Design, aber oberflächlich bei Daten

---

## 🏗️ Lumeos Nutrition — Architektur

### Modul-Übersicht
```
┌─────────────────────────────────────────────┐
│              NUTRITION MODULE                │
├─────────────┬───────────┬───────────────────┤
│  Food Log   │  Recipes  │  Meal Plans       │
│  (Daily)    │  (Library)│  (Generated)      │
├─────────────┴───────────┴───────────────────┤
│           Nutrient Calculator                │
│   Macros (4) + Micros (138 BLS) + Water     │
├─────────────────────────────────────────────┤
│        Food Database (Eigene DB)             │
│   Basis: BLS 4.0 → Enriched mit EU-Quellen  │
├─────────────────────────────────────────────┤
│         Cross-Module Connectors              │
│  Training ↔ Supplements ↔ Medical ↔ Goals   │
└─────────────────────────────────────────────┘
```

### Datenfluss
1. **Input:** User loggt Mahlzeit (Scan, Suche, Voice, Photo AI)
2. **Processing:** Food DB Lookup → Nährstoff-Berechnung → Tages-Totals
3. **Cross-Module:** Training-Daten → Calorie Adjustment, Supplement-Daten → Redundancy Check, Bloodwork → Deficiency Alert
4. **Output:** Dashboard (Macros + Micros), Empfehlungen, Trends

### Integration mit anderen Modulen
| Modul | Datenfluss | Beispiel |
|-------|-----------|---------|
| **Training** | Calories burned → Auto-Adjustment | "Leg Day: +400 kcal, +30g Protein empfohlen" |
| **Supplements** | Micro-Totals → Gap Analysis | "Du nimmst 150% RDA Vitamin C über Food → Supplement überflüssig" |
| **Medical** | Bloodwork → Deficiency Alerts | "Ferritin niedrig → Eisenreiche Lebensmittel vorschlagen" |
| **Recovery** | Sleep/HRV → Nutrition Timing | "Schlechter Schlaf → Magnesium + Tryptophan abends empfehlen" |
| **Goals** | TDEE + Goal → Calorie Budget | "Lean Bulk Phase: 2800 kcal, 180g Protein" |

---

## 👤 Persona Design

### Persona 1: "Lisa" — Casual Dieter (60% der User)
- **Alter:** 28, weiblich
- **Ziel:** 5kg abnehmen, gesünder essen
- **Pain Points:** Calorie Counting ist nervig, will schnelles Logging
- **Feature-Needs:** Barcode Scanner, AI Photo Scan, einfaches Dashboard, Meal Plans
- **Zahlungsbereitschaft:** Free Tier, evtl. $4.99/mo nach 2 Wochen
- **Churn-Risiko:** Hoch — gibt nach 2-4 Wochen auf wenn zu kompliziert

### Persona 2: "Max" — Gym Bro (25% der User)
- **Alter:** 24, männlich
- **Ziel:** Lean Bulk, 180g Protein/Tag treffen
- **Pain Points:** Will Macros tracken ohne Mikro-Details, braucht schnelles Logging zwischen Sets
- **Feature-Needs:** Quick-Add Macros, Meal Prep Templates, Training×Nutrition Sync
- **Zahlungsbereitschaft:** $9.99/mo wenn Training-Integration gut ist
- **Churn-Risiko:** Mittel — bleibt solange Gains kommen

### Persona 3: "Dr. Sarah" — Health Optimizer (10% der User)
- **Alter:** 42, weiblich, Ärztin
- **Ziel:** Optimal Nutrition basierend auf Bloodwork, 138 Mikronährstoffe (BLS)
- **Pain Points:** Cronometer ist hässlich, MFP zeigt keine Mikros
- **Feature-Needs:** Full Micronutrient Dashboard, Bloodwork Import, Custom Biometrics, Export
- **Zahlungsbereitschaft:** $19.99/mo — Preis ist irrelevant wenn Datenqualität stimmt
- **Churn-Risiko:** Niedrig — Power User, bleibt jahrelang

### Persona 4: "Coach Mike" — Fitness Coach (5% der User)
- **Alter:** 35, männlich, Online-Coach
- **Ziel:** Clients' Nutrition monitoren, Meal Plans erstellen
- **Pain Points:** Braucht Multi-Client Dashboard, kann nicht für jeden Client eine App haben
- **Feature-Needs:** Coach Dashboard, Client Nutrition Overview, Template Meal Plans, Bulk Assign
- **Zahlungsbereitschaft:** $29.99/mo Pro Plan
- **Churn-Risiko:** Sehr niedrig — Business-Tool, wechselt nicht leichtfertig

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing Tiers

| Tier | Preis | Features | Ziel-Persona |
|------|-------|----------|-------------|
| **Free** | $0 | Food Logging (unbegrenzt), Barcode Scanner, Macro Dashboard, Water, Basis-Rezepte | Lisa (Onboarding) |
| **Plus** | $9.99/mo / $59.99/yr | AI Photo Scan, Micro Dashboard (Tier 1+2), Meal Plans, Fasting, Ad-free, Training×Nutrition Sync | Lisa + Max |
| **Pro** | $19.99/mo / $119.99/yr | Full 138 Micros (BLS) (Tier 3), Bloodwork Integration, Custom Biometrics, API Export, Priority Support | Dr. Sarah |
| **Coach** | $29.99/mo / $199.99/yr | Multi-Client Dashboard, Template Builder, Client Reports, White-Label Reports | Coach Mike |

### Revenue Streams
1. **Subscriptions** (80%) — Core Revenue
2. **Data Licensing** (5%) — Lumeos Food-DB API für Drittanbieter (basierend auf eigener angereichter DB)
3. **Affiliate Meal Delivery** (5%) — HelloFresh, Factor75 Integration
4. **Supplement Recommendations** (5%) — Cross-sell zu Supplement Module
5. **Coach Marketplace Commission** (5%) — Meal Plan Verkäufe über Marketplace

### Conversion Strategy
- **Free → Plus:** Mikronährstoff-Teaser ("Du trackst nur 4 von 138 Nährstoffen (BLS 4.0)") + AI Photo nach 3 Tagen Trial
- **Plus → Pro:** Bloodwork Import Prompt ("Lade deinen Bluttest hoch → personalisierte Empfehlungen")
- **Retention:** Weekly Nutrition Report, Streak System, Personal Bests ("Erste Woche mit 100% Protein-Ziel!")

---

## 🔧 Technical Architecture

### Tech Stack (aligned mit LUMEOS_OVERVIEW.md)
```
Frontend:  Next.js 14 · TypeScript · Tailwind CSS · Zustand
Backend:   Hono (TypeScript-native, Edge-ready) → :5100
Database:  Supabase (PostgreSQL + Auth + Storage + RLS)
Search:    Meilisearch (Food Search, <50ms)
AI:        Claude Vision API (MealCam Photo Recognition)
State:     Zustand (Client) + TanStack Query (Server)
Testing:   Vitest (Unit) + Playwright (E2E)
```

### Food Database — Eigene DB mit BLS-Basis
```
Lumeos Food Database (eigene Postgres-Tabelle)
  Basis: BLS 4.0 (7.140 Einträge, 138 Nährstoffe, CC BY 4.0)
  → Beste Laboranalysen weltweit (Max Rubner-Institut)
  → Inkl. neue Vitaminformen D2/D3, K1/K2 (NEU in 4.0)
  → DACH-optimiert für Marktstart

  Anreicherung (Merge/Fallback):
  → USDA Foundation Foods (365, Lab-analyzed)
  → USDA SR/FNDDS (8.133, 53 Nährstoffe)
  → Fineli (4.156, FI, vollständig, Open API)
  → CIQUAL (3.185, FR, 61 Nährstoffe, CSV)
  → CoFID/McCance & Widdowson (2.886, UK, OGL v3.0)
  → Swiss NWD (1.190, CH)
  → OpenFoodFacts (Barcode-Matching, NICHT für Nährstoffe)

  User-Generated:
  → foods_custom (pro User, verifizierbar)
  → MealCam Corrections (Feedback Loop)
```

**Merge-Logik:**
```
BLS-Daten = Primärquelle (Confidence 1.0)
  ↓ Feld leer?
USDA Foundation Fill (Confidence 0.95)
  ↓ Feld leer?
Regional DB Fill (Confidence 0.9)
  ↓ Food nicht in BLS?
Import aus anderer DB (Confidence 0.85)
  ↓ Barcode?
OpenFoodFacts Mapping (kein Nährstoff-Override!)
```

### Lookup Flow (Barcode Scan)
```
Barcode → Lumeos eigene DB (mit EAN/UPC aus OFF Mapping)
  ↓ miss
OpenFoodFacts API (größte Barcode DB, 3.3M+)
  ↓ miss
User prompt: "Add manually or take photo"
```

### MealCam (Claude Vision API)
```
User Foto → Claude Vision API → Erkennungsergebnis
  ≥0.85 → Auto-Accept
  0.50-0.84 → User Review (Vorschläge)
  0.30-0.49 → "Meintest du...?"
  <0.15 → Manual Entry
```

### Offline-Fähigkeit
- **Local Cache:** Letzte 500 geloggte Foods + Favoriten
- **Offline Logging:** Queue → Sync bei Reconnect
- **Barcode Cache:** Top 10K Barcodes (nach Region) lokal

### Cost Estimate
| Service | Cost | Volume |
|---------|------|--------|
| BLS 4.0 | €0 | CC BY 4.0 |
| USDA | $0 | Unlimited |
| Open Food Facts | $0 | Unlimited |
| Fineli, CIQUAL, CoFID | €0 | Open Data |
| Claude Vision (MealCam) | ~$0.01/scan | Per Use |
| **Total MVP** | **~$0/mo** | Food DB komplett kostenlos |

**Detaillierte Food-DB Architektur:** siehe `data/food-db-architecture.md`

---

## ⚖️ Key Design Decisions

### 1. Barcode Scanner im Free Tier
**Decision:** Kostenlos, kein Paywall
**Rationale:** MFP hat Barcode hinter Paywall → größter Kritikpunkt in Reviews. Lumeos differenziert sich sofort. Cost: ~$0 (eigene DB + OpenFoodFacts ist gratis).

### 2. 3-Tier Micronutrient System
**Decision:** Tier 1 (15 immer sichtbar) → Tier 2 (20 für Athleten) → Tier 3 (100+ medizinisch)
**Rationale:** Cronometer zeigt ALLES → overwhelming. MFP zeigt NICHTS → nutzlos. Progressives Disclosure ist der Mittelweg. Tier 2+ ist Conversion-Trigger für Plus/Pro. BLS liefert 138 Nährstoffe — mehr als genug für alle 3 Tiers.

### 3. Eigene Food-DB mit BLS 4.0 als Basis (nicht externe API-First)
**Decision:** Eigene Postgres-Tabelle, initial befüllt mit BLS 4.0 (7.140 Foods, 138 Nährstoffe)
**Rationale:** BLS hat die besten Laboranalysen weltweit (Max Rubner-Institut), 138 Nährstoffe pro Eintrag (fast 3× USDA mit 53), seit Dez 2025 kostenlos (CC BY 4.0), und perfekt für DACH-Marktstart. Anreicherung mit USDA, Fineli, CIQUAL, CoFID, Swiss NWD als Fallback.

### 4. BLS als Nutrient Ground Truth (nicht USDA)
**Decision:** Alle Mikronährstoff-Werte kommen primär aus BLS 4.0
**Rationale:** BLS = 138 Nährstoffe inkl. neue Vitaminformen (D2/D3, K1/K2), Laboranalysen vom Max Rubner-Institut. USDA hat nur 53 Nährstoffe. Für die wenigen Foods die BLS nicht hat → USDA Foundation als Fallback.

### 5. MealCam (Claude Vision) als Plus-Feature (nicht Free)
**Decision:** Photo Meal Recognition via Claude Vision API nur im Plus-Tier
**Rationale:** Jeder Scan kostet ~$0.01 (Claude Vision API). Bei 1M Free Usern wäre das $10K/mo. Conversion-Trigger: "3 kostenlose Scans, dann Plus". Confidence Thresholds: AUTO_ACCEPT ≥0.85, SUGGEST 0.50-0.84, LOW 0.30-0.49, REJECT <0.15.

### 6. Cross-Module als Core Architecture (nicht Plugin)
**Decision:** Training, Supplements, Medical sind keine Add-ons sondern native Connectors
**Rationale:** DAS ist der USP. Wenn Cross-Module ein Afterthought ist, wird es nie gut. Datenmodell muss von Tag 1 Cross-Module-ready sein.

### 7. Meilisearch statt Elasticsearch für Food Search
**Decision:** Meilisearch als Food Search Engine
**Rationale:** Typo-tolerant, <50ms, einfaches Setup, perfekt für "did you mean..."-UX. Elasticsearch wäre Overkill für Food Search. Meilisearch ist Open Source.

### 8. Eigene Food-DB von Tag 1
**Decision:** Eigene `foods` Tabelle in Supabase/Postgres, initial mit BLS 4.0 befüllt
**Rationale:** BLS liefert 7.140 Lab-analysierte Foods mit 138 Nährstoffen kostenlos (CC BY 4.0). Angereichert mit 6 weiteren EU/US-Datenbanken. OpenFoodFacts nur für Barcode-Mapping. Eigene DB ermöglicht Lumeos-spezifische Felder (Confidence Score, Allergen-Flags, Portions, i18n).

### 9. Water + Weight Tracking als eigene Tabellen
**Decision:** `water_logs` und `weight_logs` Tabellen, separate von Nutrition
**Rationale:** LUMEOS_OVERVIEW.md definiert beides als Nutrition-Features. Weight Tracking = essentiell für TDEE-Berechnung (Goals Modul). Water Tracking = 35ml/kg + Training-Adjustment.

---

## 🚀 Lumeos Nutrition USP

### Primary USP: "The Only Nutrition App That Knows Your Whole Health Picture"

Keine andere App verbindet:
- **Was du isst** (Food Log, 138 (BLS) Mikros)
- **Wie du trainierst** (Auto Calorie Adjustment, Protein Timing)
- **Was du supplementierst** (Redundancy Detection, Gap Analysis)
- **Was dein Blut sagt** (Deficiency Alerts, Optimal Ranges)
- **Wie du recovert** (Sleep → Nutrition Timing)
- **Was dein Ziel ist** (Adaptive TDEE, Phase-aware Macros)

**Kein Competitor hat mehr als 1 davon.**

### Secondary USPs

1. **Medical-Grade Micros für Normalos**
   - Cronometer-Tiefe mit Lifesum-UX
   - 138 Nährstoffe (BLS), aber progressive Disclosure (nicht overwhelming)

2. **Barcode Scanner ist KOSTENLOS**
   - MFP's größter Fehler: Scanner hinter Paywall
   - Sofortige Differenzierung in App Store Reviews

3. **AI-First Logging**
   - Photo Scan + Voice + Smart Suggestions basierend auf Gewohnheiten
   - "Wie gestern" One-Tap für Routinen

4. **Nutrition-Aware Supplements**
   - "Dir fehlen 4000 IU Vitamin D laut Food Log → Supplement empfohlen"
   - "Du supplementierst Vitamin C aber isst bereits 150% RDA → spare $15/mo"

5. **Training-Aware Nutrition**
   - "Leg Day heute: +400 kcal, +30g Protein, Magnesium abends"
   - Pre/Post/Intra Nutrition Timing basierend auf Workout-Typ

### Warum Lumeos gewinnt
| Kriterium | MFP | YAZIO | Cronometer | **Lumeos** |
|-----------|-----|-------|-----------|-----------|
| Food DB Size | ✅ 14M | ✅ | ❌ klein | ✅ Eigene DB (BLS Basis) |
| Micronutrients | ❌ 5-10 | ❌ 5-10 | ✅ 138 | ✅ 138 (3-Tier, BLS 4.0) |
| Training Sync | ❌ Calories only | ❌ | ❌ | ✅ Deep |
| Supplement Sync | ❌ | ❌ | ❌ | ✅ Native |
| Bloodwork | ❌ | ❌ | ❌ | ✅ Native |
| AI Logging | 🟡 Basic | 🟡 | ❌ | ✅ Multi-Modal |
| UX/Design | 🟡 Legacy | ✅ Modern | ❌ Ugly | ✅ Modern |
| Free Barcode | ❌ Paywall | ✅ | ✅ | ✅ |
| **Price** | $79.99/yr | $44.99/yr | $49.99/yr | **$59.99/yr** |
