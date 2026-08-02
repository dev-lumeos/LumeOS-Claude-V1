# Lumeos — Platform Vision & Architecture

**Date:** 2026-02-17
**Status:** Research Complete — Ready for Implementation Spec

---

## 🎯 One-Liner

> **Lumeos is the Personal Health Operating System — one app that connects Training, Nutrition, Supplements, Recovery, Medical, and AI Coaching through Cross-Module Intelligence.**

---

## 🏗️ Platform Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        LUMEOS PLATFORM                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────── USER-FACING MODULES ──────────────────────┐    │
│  │                                                           │    │
│  │  🏋️ Training    🥗 Nutrition    💊 Supplements            │    │
│  │  📊 Recovery     🩺 Medical     🎯 Goals                  │    │
│  │                                                           │    │
│  └───────────────────────┬───────────────────────────────────┘    │
│                          │                                         │
│  ┌───────────────────────▼───────────────────────────────────┐    │
│  │              🧠 INTELLIGENCE LAYER                        │    │
│  │                                                           │    │
│  │  AI Coach (LLM + Structured Engines)                      │    │
│  │  Cross-Module Correlation Engine                          │    │
│  │  Adaptive Goal Engine (TDEE, Macros, Periodization)       │    │
│  │  Proactive Notification System                            │    │
│  │  Computer Vision (Form Check, Food Photo, Body Scan)      │    │
│  │                                                           │    │
│  └───────────────────────┬───────────────────────────────────┘    │
│                          │                                         │
│  ┌───────────────────────▼───────────────────────────────────┐    │
│  │              💰 BUSINESS MODULES                          │    │
│  │                                                           │    │
│  │  👥 Coach Module (B2B2C)                                  │    │
│  │  🛒 Marketplace (Programs, Meals, Stacks, Bundles)        │    │
│  │  💊 Brand Placements (Supplement B2B)                     │    │
│  │  🏢 Gym Connect (B2B)                                    │    │
│  │  🏢 Corporate Wellness (B2B)                              │    │
│  │                                                           │    │
│  └───────────────────────┬───────────────────────────────────┘    │
│                          │                                         │
│  ┌───────────────────────▼───────────────────────────────────┐    │
│  │              🔌 DATA & INTEGRATION LAYER                  │    │
│  │                                                           │    │
│  │  Food DB (Eigene Lumeos DB, BLS 4.0 Basis)                 │    │
│  │  Exercise DB (free-exercise-db + wger + Own)              │    │
│  │  Supplement DB (NIH DSLD + DailyMed + Own)                │    │
│  │  Biomarker DB (LOINC + Optimal Ranges)                    │    │
│  │  Wearables (HealthKit + Health Connect + WHOOP + Oura)    │    │
│  │  Gym APIs (Mindbody + Magicline)                          │    │
│  │  Equipment (Technogym + EGYM)                             │    │
│  │  Payments (Stripe Connect)                                │    │
│  │  CV APIs (Kemtai + LogMeal)                               │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Module Overview

### 1. 🏋️ Training Module
**Competitor Benchmark:** Fitbod (AI), Strong (UX), RP (Periodization)
**USP:** AI Coach + Muscle Recovery Map + Cross-Module Integration
- 500+ Exercises (free-exercise-db + wger)
- Progressive Overload Algorithm
- Volume Landmark Tracking (MV→MAV→MRV)
- Workout Templates (PPL, UL, 5/3/1, GZCLP, etc.)
- Set Logging (Weight × Reps, RPE, Rest Timer)
- 3D Muscle Map Visualization
- CV Form Check (via Kemtai API)
- Personal Records + Streaks
- Exercise Substitution AI

### 2. 🥗 Nutrition Module
**Competitor Benchmark:** MFP (DB), Cronometer (Micronutrients), MacroFactor (Adaptive)
**USP:** 138 Nährstoffe (BLS 4.0) + Adaptive TDEE + AI Meal Planning
- Food DB: Eigene Lumeos DB (BLS 4.0 Basis, 7.140 Foods × 138 Nährstoffe)
- Barcode Scanner
- AI Food Photo Logging
- 138 Nährstoffe Tracking (Cronometer-Level, BLS 4.0)
- Adaptive TDEE (MacroFactor-Level)
- Macro + Calorie Tracking
- Recipe Engine + Meal Planner
- Grocery List Generation
- Meal Timing Notifications (RP-Style)

### 3. 💊 Supplements Module
**Competitor Benchmark:** SuppCo (Scanner), Staqc (Correlations), RP (Timing)
**USP:** Stack Builder + Interaction Checker + Goal-Aligned + Adherence
- Supplement DB: NIH DSLD + DailyMed + Own
- Barcode Scanner (Open Food Facts)
- Stack Builder (Goal-basiert)
- Timing Optimizer ("Morgens: Vitamin D+K2, Abends: Magnesium+Zinc")
- Interaction Checker (🔴🟡✅)
- Adherence Tracking + Reminders
- Evidence Tier Display (S/A/B/C/D)
- Affiliate Links (Supplement Brand B2B)
- Coach-Endorsed Stacks

### 4. ⚡ Enhanced Supplements Module
**Competitor Benchmark:** CycleVitals (best existing), Anabolyx, web plotters
**USP:** Compound Tracking + Safety Monitoring + Bloodwork Integration
- Compound Taxonomy (85+ compounds, 10 categories)
- Cycle Builder + Calendar
- Bloodwork Integration (liver, lipids, hormones)
- Interaction Matrix + Ancillary Requirements
- Harm Reduction Alerts
- Privacy-First (local storage default)

### 5. 📊 Recovery Module
**Competitor Benchmark:** WHOOP (Score), Oura (HRV), HRV4Training (Phone)
**USP:** Cross-Module Recovery + Muscle Map + Training-Aware
- Recovery Score (0-100%, HRV + Sleep + Subjective)
- Muscle Recovery Map (48-72h per group, training-informed)
- Sleep Tracking (via Wearable)
- HRV Analysis (Wearable or Phone Camera)
- Overtraining Detection
- Recovery Modality Tracking (Sauna, Cold, Massage)
- Readiness Indicator (Train hard / Train light / Rest)

### 6. 🩺 Medical Module
**Competitor Benchmark:** Function Health ($499/yr), InsideTracker, Healthmatters
**USP:** Bloodwork OCR + Optimal Ranges + Cross-Module Correlation
- Bloodwork Upload (PDF OCR → auto-parse)
- 100+ Biomarkers (LOINC coded)
- Optimal Ranges > Lab-Normal Ranges
- Trend Visualization (over months/years)
- Medication Tracking
- Symptom Logging
- Condition Protocols
- Privacy-First (E2E encryption option)

### 7. 🎯 Goals Module
**Competitor Benchmark:** MacroFactor (Adaptive), Carbon (Phases), RP (Periodization)
**USP:** Cross-Module Goals + Expert BB Jahresplan
- 10 Goal Types (Cut, Bulk, Recomp, Contest Prep, Reverse Diet, Hybrid, etc.)
- Adaptive TDEE + Weekly Adjustments
- Phase Transitions (automatic + Coach-override)
- Safety Guards (minimum calories, rate limits)
- Cross-Module: Goal drives Training + Nutrition + Supplements + Recovery
- Expert BB Annual Plan (Off→Prep→Peak→Off)

### 8. 🤖 AI Coach Module
**Competitor Benchmark:** Freeletics (50M Users), Zing (CV), ChatGPT (LLM)
**USP:** LLM + ALL User Data + Cross-Module Intelligence
- LLM Chat (GPT-4o + domain-specific)
- Proactive Notifications (Meals, Workouts, Supplements, Recovery)
- Weekly Synthesis Reports
- 5 Personality Modes (Scientist, Motivator, Drill Sergeant, Best Friend, Sensei)
- Computer Vision (Form, Food, Body)
- Voice Interaction (Phase 2)
- Coach AI Clone (for Coach Module)

### 9. 👥 Coach Module (B2B2C)
**Competitor Benchmark:** Trainerize (400K), Everfit (210K), PT Distinction (4.9★)
**USP:** Cross-Module Client Dashboard + Supplement Stacks + Bloodwork
- Coach Dashboard (ALL client data: Training + Nutrition + Supplements + Recovery + Medical)
- Client Management
- Program Builder (Training + Nutrition + Supplements)
- Check-in System (Weekly, with data)
- Messaging
- Revenue Tools (Payments, Packages)
- AI Clone (Premium)

### 10. 🛒 Marketplace
**Competitor Benchmark:** Boostcamp (15M DL), TrainHeroic, Gumroad
**USP:** Cross-Module Bundles (Training + Meal Plan + Stack)
- Training Programs
- Meal Plans
- Supplement Stacks
- Complete Bundles (unique!)
- Coaching Services
- Educational Content
- Revenue Split: 80/20 (Coach/Lumeos)
- All-Access Subscription ($29.99/mo)

### 11. 🏢 B2B (Gym + Brands + Corporate)
**Competitor Benchmark:** Mindbody (40K), Magicline (8K, DE)
**USP:** Connects Gym × User × Brand
- Supplement Brand Portal (Placements, Analytics)
- Gym Connect (Check-in, Member Insights)
- Corporate Wellness (Per-Seat)
- API Integrations (Mindbody, Magicline, Technogym)

---

## 💰 Revenue Model

| Stream | Model | Target |
|--------|-------|--------|
| **B2C Subscription** | Free / $9.99 / $19.99 / $29.99 per month | Primary |
| **Coach Subscription** | $29.99-79.99/mo | B2B2C |
| **Marketplace Commission** | 20% of sales | Revenue Share |
| **Supplement Brand B2B** | CPC + Placements + Commission | B2B |
| **Gym Connect SaaS** | $50-500/mo per Gym | B2B |
| **Corporate Wellness** | $5-15/employee/mo | B2B |
| **All-Access Pass** | $29.99/mo (all Marketplace content) | B2C |

---

## 🚀 Build Phases

### Phase 1: MVP (Month 1-4)
- Training Module (Logging, Templates, PRs)
- Nutrition Module (Food DB, Macros, Barcode Scanner)
- Goals Module (TDEE, basic adaptive)
- AI Coach (Chat, basic recommendations)
- iOS App

### Phase 2: Intelligence (Month 5-8)
- Supplements Module
- Recovery Module (HRV via HealthKit)
- Cross-Module Insights (Training × Nutrition)
- Adaptive TDEE (MacroFactor-level)
- AI Food Photo
- Android App

### Phase 3: Ecosystem (Month 9-12)
- Coach Module
- Marketplace
- Medical Module (Bloodwork OCR)
- Enhanced Supplements
- Wearable Integrations (WHOOP, Oura, Garmin)

### Phase 4: Scale (Month 13+)
- B2B (Gym Connect, Brand Placements, Corporate)
- CV Form Check
- Voice AI
- International Expansion
- Coach AI Clone

---

## 📊 Research Foundation

| Module | Files | Key Insight |
|--------|-------|-------------|
| Nutrition | 11 | 138 Nährstoffe (BLS 4.0) + Eigene Food DB = $0 MVP |
| Training | 14 | No app combines Nutrition + Training at depth |
| Supplements | 13 | Stack Management = nobody does it, $0 data |
| Enhanced | 10 | CycleVitals only real competitor, massive gap |
| Medical | 15 | PDF OCR + Optimal Ranges + Cross-Module = killer |
| Recovery | 12 | Muscle-specific recovery = completely unserved |
| Coach | 8 | No platform has Supps/Bloodwork/Recovery for coaches |
| Marketplace | 8 | Cross-module bundles = blue ocean |
| B2B | 12 | No channel for brands → active fitness users |
| Goals | 8 | No cross-module goal engine exists |
| AI Coach | 8 | LLM + All User Data = holy grail, nobody has it |
| **TOTAL** | **~150** | **Lumeos = first Personal Health OS** |

---

## 🎯 Competitive Moat

1. **Cross-Module Intelligence** — Nobody connects all health data
2. **Data Network Effects** — More users → better AI → better recommendations
3. **Coach Ecosystem** — Coaches bring clients, clients bring data
4. **Brand Relationships** — Supplement brands locked into platform
5. **Gym Partnerships** — Gym integrations create switching costs
6. **$0 Data Foundation** — BLS 4.0, USDA, OFF, NIH, LOINC = free base layer
