# Lumeos Supplement Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **8 Apps analysiert** across 4 Archetypen: Scanner+Stack (SuppCo, SuppTrack), AI Timing (Supplements AI), Biomarker+Correlation (Staqc, Bearable), Medical Reminder (MyTherapy, CareClinic, Optimize)
- **Supplement-Markt:** $177B global (2025), 9% CAGR — aber Supplement TRACKING Apps sind ein junger Nischenmarkt
- **Key Players:** MyTherapy (10M+ Downloads, Medication-fokussiert), SuppCo (160K+ Products), Bearable (200K+ Users, Symptom Correlation)

### Kritische Gaps
1. **KEINE App weiß was du ISST** — alle Supplement-Tracker sind Silos. Keiner kennt dein Food Log, also kann keiner sagen ob ein Supplement überhaupt nötig ist
2. **KEINE App kennt dein Training** — "Heute ist Leg Day" → Pre/Post/Intra Stack anpassen? Unmöglich ohne Training-Integration
3. **KEINE App verbindet Supplements mit Bloodwork** — "Wirkt mein Vitamin D?" → nur checkbar wenn du Bluttests trackst. Staqc versucht es aber hat kein Nutrition/Training
4. **Timing-Optimierung existiert, aber isoliert** — Supplements AI kann Timing berechnen, aber kennt deine Mahlzeiten nicht (Fett nötig für Vitamin D Absorption!)
5. **Redundancy Detection existiert NIRGENDWO** — "3 deiner Supplements enthalten Magnesium → du nimmst 200% RDA" = Feature das NULL Apps haben

### Competitive Intelligence
- **SuppCo:** Größte Supplement DB (160K+ Products), Barcode Scanner, Stack Builder. Stärke: Datenbank. Schwäche: keine Nutrition/Training, basic UX
- **Supplements AI:** AI-basierte Timing-Optimierung, Deficiency Detection. Stärke: Smart Timing. Schwäche: keine Food/Training Integration, kann nur schätzen statt messen
- **Staqc:** Biomarker + Supplement Correlation, Community Insights. Stärke: "Wirkt es?"-Tracking. Schwäche: kleine DB, kein Nutrition/Training, Beta-Stadium
- **Bearable:** Symptom + Lifestyle Correlation. Stärke: Beste "What affects what?" UX. Schwäche: kein Supplement-Fokus, keine Nutrition-Tiefe
- **MyTherapy:** 10M+ Downloads, beste Medication Reminder UX. Stärke: Adherence + UX. Schwäche: Medication-fokussiert, keine Supplements Intelligence
- **SuppTrack:** Simple Stack Tracker, Reminder. Stärke: Einfachheit. Schwäche: keine Intelligence, keine Integration
- **CareClinic:** All-in-One Health Tracker, Supplements + Symptoms + Meds. Stärke: Breite. Schwäche: Jack of all trades, master of none
- **Optimize:** Personalized Supplement Plans via Quiz. Stärke: Onboarding. Schwäche: statisch, kein Tracking danach

---

## 🏗️ Lumeos Supplements — Architektur

### Modul-Übersicht
```
┌──────────────────────────────────────────────────┐
│              SUPPLEMENTS MODULE                   │
├──────────────┬───────────────────────────────────┤
│  Stack       │  Timing Optimizer                  │
│  Manager     │  (Interactions + Meal Timing)      │
│  (My Supps,  │                                    │
│   Dosierung, │  Reminder Engine                   │
│   Schedule)  │  (Push, Widget, Watch)             │
├──────────────┼───────────────────────────────────┤
│  Supplement  │  Intelligence Engine               │
│  Database    │  ┌──────────────────────────────┐ │
│  (NIH DSLD,  │  │ Gap Analysis (Nutrition→Supp)│ │
│   DailyMed,  │  │ Redundancy Detection         │ │
│   Community)  │  │ Cost Optimizer               │ │
│              │  │ Effectiveness Tracker         │ │
│              │  │ Training-Aware Stacks         │ │
│              │  └──────────────────────────────┘ │
├──────────────┴───────────────────────────────────┤
│         Cross-Module Connectors                   │
│  Nutrition ↔ Training ↔ Medical ↔ Recovery ↔ Goals│
└──────────────────────────────────────────────────┘
```

### Intelligence Engine (Cross-Module Flows)
```
1. GAP ANALYSIS (Nutrition → Supplements)
   Food Log → Mikronährstoff-Totals → RDA Comparison
   → "Dir fehlen 4000 IU Vitamin D pro Tag (nur 600 IU aus Food)"
   → "Empfehlung: Supplement 4000 IU Vitamin D3"
   
2. REDUNDANCY DETECTION
   Supplement Stack → Ingredient Overlap Analysis
   → "3 deiner Supplements enthalten Magnesium"
   → "Total: 900mg (225% RDA) → 1 reicht, spare $20/mo"
   
3. TRAINING-AWARE STACKS
   Today's Workout → Pre/Post/Intra Stack
   → "Heavy Leg Day → Pre: Creatine 5g + Beta-Alanine 3.2g + Caffeine 200mg"
   → "Post: Whey 30g + Magnesium 400mg"
   → "Rest Day: Skip Pre-Workout, keep Vitamin D + Fish Oil"
   
4. TIMING WITH MEALS
   Meal Schedule → Supplement Timing Optimization
   → "Vitamin D → Mittagessen (Fett nötig für Absorption)"
   → "Iron → Nüchtern morgens (Dairy blocks absorption)"
   → "Calcium + Iron → 2h Abstand!"
   
5. COST OPTIMIZATION
   Monthly Stack → Price Tracking → Savings
   → "Monatliche Supplement-Kosten: $87"
   → "Durch Redundancy Removal: $67 → Spare $20/mo"
   
6. EFFECTIVENESS TRACKING (via Medical Module)
   Supplement Log + Bloodwork Over Time
   → "Du nimmst Vitamin D seit 3 Monaten"
   → "Vitamin D Blutwert: 18 → 52 ng/mL ✅ Wirkt!"
   → "Magnesium: keine messbare Veränderung → Absorption-Problem?"
```

### Interaction Engine
```typescript
interface SupplementInteraction {
  supplement1: SupplementId;
  supplement2: SupplementId | 'food' | 'medication';
  type: 'avoid' | 'separate_2h' | 'separate_4h' | 'take_together' | 'enhance' | 'reduce';
  reason: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;  // PubMed reference
}

// Examples:
// { Iron + Calcium: 'separate_2h', reason: 'Calcium blocks iron absorption' }
// { Vitamin D + Fat: 'take_together', reason: 'Fat-soluble, needs dietary fat' }
// { Vitamin C + Iron: 'enhance', reason: 'Vitamin C increases iron absorption 2-3x' }
// { St. John's Wort + SSRIs: 'avoid', severity: 'critical', reason: 'Serotonin syndrome risk' }
```

---

## 👤 Persona Design

### Persona 1: "Mike" — Gym Bro Stack Builder (35%)
- **Alter:** 25, männlich, nimmt 5-8 Supplements (Creatine, Whey, Pre-Workout, Fish Oil, Vitamin D, ZMA, Multivitamin, Ashwagandha)
- **Ziel:** Optimalen Stack für Gym Performance, kein Geld verschwenden
- **Pain Points:** Unsicher ob alles nötig ist, Timing verwirrend, Reddit widersprüchlich
- **Feature-Needs:** Stack Manager, Training-Aware Timing, Redundancy Check, Cost Overview
- **Zahlungsbereitschaft:** $9.99/mo (gibt bereits $80+/mo für Supps aus)

### Persona 2: "Sandra" — Health-Conscious Woman (25%)
- **Alter:** 35, weiblich, nimmt Vitamin D, Iron, B12, Magnesium, Probiotik
- **Ziel:** Deficiencies ausgleichen, wissen ob Supplements wirken
- **Pain Points:** Arzt sagt "nimm Eisen" aber nicht wann/wie/mit was. Interactions unklar
- **Feature-Needs:** Timing Optimizer, Meal-based Timing, Interaction Warnings, Bloodwork Effectiveness Tracking
- **Zahlungsbereitschaft:** $9.99/mo

### Persona 3: "Dr. Thomas" — Biohacker/Longevity (20%)
- **Alter:** 45, männlich, nimmt 15+ Supplements (NMN, Resveratrol, CoQ10, NAC, Ashwagandha, Lion's Mane, etc.)
- **Ziel:** Longevity Stack optimieren, Evidence-based, Bloodwork-correlated
- **Pain Points:** Komplexe Interactions bei 15+ Supps, will Daten nicht Meinungen
- **Feature-Needs:** Full Interaction Matrix, Evidence Grades, Bloodwork Integration, Cost Analysis, Export für Arzt
- **Zahlungsbereitschaft:** $19.99/mo (investiert $300+/mo in Supplements)

### Persona 4: "Anna" — Casual Vitamin Taker (20%)
- **Alter:** 28, weiblich, nimmt Multivitamin + Vitamin D + manchmal Magnesium
- **Ziel:** Erinnerung zum Einnehmen, verstehen ob sie das Richtige nimmt
- **Pain Points:** Vergisst Supplements, weiß nicht ob Multivitamin reicht
- **Feature-Needs:** Simple Reminders, Nutrition Gap Check ("Brauchst du das überhaupt?"), Basic Stack
- **Zahlungsbereitschaft:** Free Tier, evtl. $4.99/mo wenn Insights gut sind

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing (Teil des Lumeos Gesamt-Abos)

| Tier | Supplement Features |
|------|---------------------|
| **Free** | Stack Manager (bis 5 Supplements), Reminders, Basic Timing, Intake Log (Taken/Skipped) |
| **Plus** ($9.99/mo) | Unlimited Stack, Nutrition Gap Analysis, Training-Aware Stacks, Smart Timing Optimizer, Interaction Checker, Cost Overview |
| **Pro** ($19.99/mo) | Full Interaction Matrix, Bloodwork Effectiveness Tracking, Redundancy Detection, Evidence Grades, AI Supplement Advisor, Export |

### Revenue Streams
1. **Subscriptions** (70%) — Core Revenue (Supplements boosts Plus/Pro Conversion)
2. **Supplement Affiliate** (15%) — "Du brauchst Vitamin D → [Brand] Vitamin D3, $12.99" (8-15% Commission)
3. **Brand Partnerships** (10%) — Featured Products, In-Context Recommendations (CPA $5-15)
4. **Lab Test Partnerships** (5%) — "Check ob dein Vitamin D wirkt → Bluttest bestellen" (Affiliate)

### ARPU Impact
- Supplement-User geben $50-300/mo für Supplements aus
- App die $20/mo spart durch Redundancy Detection hat sofortigen ROI
- "Lumeos hat mir gesagt dass mein Vitamin C Supplement überflüssig ist" = Killer Testimonial
- Supplement Module ist der stärkste Conversion-Trigger von Free → Plus

### Conversion Strategy
- **Free → Plus:** "Du nimmst 5 Supplements → wir haben 2 Redundanzen gefunden (Plus Feature)" 
- **Plus → Pro:** "Du nimmst Vitamin D seit 3 Monaten → lade deinen Bluttest hoch um zu sehen ob es wirkt (Pro Feature)"
- **Affiliate:** "Dein Stack fehlt Creatine → hier sind 3 Top-Produkte" (nach User bestätigt)

---

## 🔧 Technical Architecture

### Supplement Database — Multi-Layer
```
Layer 1: NIH DSLD (Dietary Supplement Label Database)
  → 100K+ Supplement Labels
  → Ingredients, Dosierung, Brand
  → Public Domain, free API
  → dsld.od.nih.gov

Layer 2: NIH DailyMed
  → 150K+ Drug/Supplement Labels
  → Interactions, Warnings, Contraindications
  → Public Domain, free API
  → dailymed.nlm.nih.gov

Layer 3: USDA Dietary Reference Intakes
  → RDAs, Tolerable Upper Intake Levels (UL)
  → By age, sex, pregnancy status
  → Public Domain

Layer 4: Open Food Facts (Supplement Products)
  → Barcode → Product matching
  → Community-contributed
  → Open Database License

Layer 5: Lumeos Community DB
  → User-submitted products
  → Verified by community votes + moderation
  → Fills gaps (regional products, new brands)
```

### Evidence Grading System
```typescript
interface SupplementEvidence {
  supplement: string;           // "Creatine Monohydrate"
  benefit: string;              // "Strength + Power Output"
  evidenceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  // A = Strong evidence (multiple RCTs, meta-analyses)
  // B = Moderate evidence (some RCTs, consistent results)
  // C = Limited evidence (few studies, mixed results)
  // D = Preliminary evidence (animal studies, in-vitro)
  // F = No evidence / debunked
  
  effectSize: 'large' | 'moderate' | 'small' | 'negligible';
  population: string;           // "Trained athletes", "General population"
  dosage: { min: number; max: number; unit: string; optimal?: number };
  timing: string;               // "Any time, daily", "30min pre-workout"
  keyStudies: { doi: string; year: number; finding: string }[];
}

// Examples:
// Creatine Monohydrate → Strength: Grade A, Large Effect, 3-5g/day
// Ashwagandha → Stress: Grade B, Moderate Effect, 300-600mg/day
// BCAAs → Muscle Growth: Grade D, Negligible Effect (if protein adequate)
// Glutamine → Recovery: Grade F, No Effect (in healthy athletes)
```

### Timing Optimization Algorithm
```typescript
interface TimingSlot {
  time: string;                 // "07:00", "12:30", "22:00"
  withMeal: boolean;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealMacros?: { fat: number; protein: number; carbs: number };
  supplements: {
    supplement: SupplementId;
    reason: string;             // "Fat-soluble, needs dietary fat"
  }[];
  warnings?: string[];          // "Take Iron 2h before Calcium"
}

function optimizeTiming(
  stack: Supplement[],
  meals: MealSchedule,
  training: TodayTraining | null,
  interactions: Interaction[]
): TimingSlot[] {
  // 1. Group fat-soluble with fatty meals
  // 2. Separate conflicting supplements (Iron + Calcium)
  // 3. Pre-workout timing (Creatine, Caffeine, Beta-Alanine)
  // 4. Post-workout timing (Protein, Magnesium)
  // 5. Sleep supplements at bedtime (Magnesium, ZMA, Melatonin)
  // 6. Fasted supplements in morning (Iron, certain probiotics)
}
```

### Barcode Scanner Integration
```
Barcode → NIH DSLD lookup (fastest, US products)
  ↓ miss
Open Food Facts (global coverage)
  ↓ miss  
Manual entry prompt → save to Lumeos Community DB
```

### Tech Stack
```
Database:   PostgreSQL (supplement logs, stacks)
Evidenz DB: Static JSON (shipped with app, updated monthly)
Timing:     Custom algorithm (Rust/WASM for speed)
Barcode:    Apple Vision / ML Kit (on-device)
Reminders:  Local Notifications + Apple Watch Complications
Offline:    Full offline capability (cached supplement DB + timing)
```

---

## ⚖️ Key Design Decisions

### 1. Nutrition Gap Analysis als Core Feature (nicht Add-on)
**Decision:** Supplement-Empfehlungen basieren auf dem echten Food Log, nicht auf Schätzungen
**Rationale:** DAS ist der USP. Supplements AI "schätzt" Deficiencies aus einem Quiz. Lumeos BERECHNET sie aus dem täglichen Food Log (138 Mikronährstoffe (BLS)). "Dir fehlen 4000 IU Vitamin D" basierend auf echten Daten ist 10x wertvoller als "Du könntest Vitamin D brauchen" basierend auf Lifestyle-Fragen.

### 2. Training-Aware Stacks
**Decision:** Supplement-Timing passt sich automatisch an das heutige Training an
**Rationale:** KEIN Competitor kann das (keiner kennt dein Training). "Leg Day → Creatine + Beta-Alanine Pre, Magnesium Post" vs. "Rest Day → Skip Pre-Workout" ist offensichtlich wertvoll. Nur möglich mit Cross-Module Architecture.

### 3. Evidence Grades (A-F) für jedes Supplement
**Decision:** Jedes Supplement bekommt einen Evidence Grade basierend auf wissenschaftlicher Literatur
**Rationale:** Supplement-Industrie ist voll von Bullshit-Claims. User verdienen Transparenz. "Creatine: Grade A, Large Effect" vs. "Glutamine: Grade F, No Effect in healthy athletes" → User spart Geld, gewinnt Vertrauen. Examine.com macht das im Web → Lumeos bringt es in die App.

### 4. Free Tier mit 5 Supplements (nicht 0)
**Decision:** Free User können bis zu 5 Supplements tracken mit Basic Timing
**Rationale:** Casual User (Multivitamin + 2-3 Supps) sind happy im Free Tier und werden zu Evangelisten. Power User (8-15+ Supps) brauchen Plus für Interaction Checker + Gap Analysis. 5 ist der Sweet Spot.

### 5. NIH DSLD + DailyMed als Primary Data (nicht eigene DB)
**Decision:** Supplement-Daten kommen primär aus NIH Databases (Public Domain)
**Rationale:** 100K+ Labels (DSLD) + 150K+ Drug/Supplement Labels (DailyMed) + Interactions = kostenlos, regierungsgeprüft, laufend aktualisiert. Eigene DB aufbauen wäre Jahre Arbeit. NIH-Daten sind der Gold Standard.

### 6. Interaction Checker mit Severity Levels
**Decision:** Interactions werden in 3 Stufen angezeigt: Info, Warning, Critical
**Rationale:** "Vitamin C + Iron = take together (enhance)" ist Info. "Calcium + Iron = separate 2h" ist Warning. "St. John's Wort + SSRIs = AVOID" ist Critical. Progressive Disclosure: Info wird subtil gezeigt, Critical blockt und warnt prominent. Sicherheit > UX Convenience.

### 7. Supplement Affiliate NACH User-Consent
**Decision:** Affiliate-Links werden NUR gezeigt wenn User aktiv nach Kaufoptionen fragt
**Rationale:** Trust > Revenue. Lumeos ist KEIN Supplement-Shop. "Du brauchst Vitamin D" → User klickt "Wo kaufen?" → dann kommen Affiliate-Links. Nie ungefragt. Nie als Popup. Nie als Hauptmotivation einer Empfehlung.

### 8. Bloodwork Effectiveness als Pro-Only Killer Feature
**Decision:** "Wirkt mein Supplement?" via Bloodwork Overlay nur im Pro Tier
**Rationale:** Staqc's bestes Feature ist "Supplement Effectiveness". Lumeos macht es besser: echte Bluttests (Medical Module) + echte Supplement-Daten = validierte Effectiveness. "Vitamin D: 18 → 52 ng/mL in 3 Monaten ✅" — das kann kein Competitor.

---

## 🚀 Lumeos Supplements USP

### Primary USP: "The Only Supplement Tracker That Knows What You Eat, How You Train, and What Your Blood Says"

SuppCo weiß was du nimmst.
Supplements AI schätzt was du brauchst.
**Lumeos WEISS:**
- Was du isst (→ Gap Analysis: "Dir fehlt Vitamin D")
- Was du trainierst (→ "Leg Day: Creatine Pre, Magnesium Post")
- Was dein Blut sagt (→ "Vitamin D von 18 auf 52 → es wirkt!")
- Was überflüssig ist (→ "3 Supps mit Magnesium → 1 reicht")
- Was es kostet (→ "Spare $20/mo durch Redundancy Removal")

**Keine andere App hat mehr als 1 dieser Informationen.**

### Secondary USPs

1. **Nutrition-Aware Gap Analysis**
   - "Dein Food Log zeigt 600 IU Vitamin D/Tag → RDA ist 4000 IU → Supplement 3400 IU"
   - NICHT "Du könntest Vitamin D brauchen" (wie Supplements AI) sondern EXAKT wie viel fehlt
   - Basierend auf echtem Food Log, nicht einem Quiz

2. **Redundancy Detection + Cost Saving**
   - "3 deiner 8 Supplements enthalten Magnesium → Total: 900mg (225% RDA)"
   - "Entferne 2 → spare $20/mo und bleibe bei 100% RDA"
   - KEIN Competitor hat das

3. **Training-Aware Stacks**
   - "Heavy Squat Day → Pre: Creatine + Caffeine + Beta-Alanine"
   - "Rest Day → Skip Pre-Workout, halte Vitamin D + Fish Oil"
   - Automatisch basierend auf heute geplantem Training

4. **Evidence Grades**
   - "Creatine: Grade A ✅ Strong Evidence, Large Effect"
   - "Glutamine: Grade F ❌ No Effect in healthy athletes"
   - "BCAAs: Grade D ⚠️ Unnecessary if protein intake adequate"
   - Spart User Hunderte Euro/Jahr an nutzlosen Supplements

5. **Bloodwork Effectiveness Tracking**
   - "Du nimmst Vitamin D seit 3 Monaten → Blutwert: 18 → 52 ng/mL ✅ Wirkt!"
   - "Magnesium seit 6 Wochen → Blutwert: keine Veränderung ❌ → Absorption-Problem? Forme wechseln?"
   - KEIN Competitor kann das (keiner hat Bloodwork Integration)

### Warum Lumeos gewinnt
| Kriterium | SuppCo | Supplements AI | Staqc | MyTherapy | Bearable | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Stack Management | ✅ | 🟡 | 🟡 | ✅ | ❌ | ✅ |
| Timing Optimizer | ❌ | ✅ | ❌ | 🟡 (Reminder) | ❌ | ✅ |
| Interaction Checker | ❌ | ✅ | ❌ | 🟡 | ❌ | ✅ |
| Nutrition Gap Analysis | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Redundancy Detection | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Training-Aware | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bloodwork Correlation | ❌ | ❌ | 🟡 | ❌ | 🟡 | ✅ |
| Evidence Grades | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cost Tracking | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Barcode Scanner | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Price** | $5/mo | Free | $8/mo | Free | $5/mo | **$9.99/mo** |
