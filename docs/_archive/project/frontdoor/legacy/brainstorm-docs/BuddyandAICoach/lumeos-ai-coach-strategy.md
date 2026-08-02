# Lumeos AI Coach Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **13 Apps analysiert** across 5 Archetypen: Workout Generator (Fitbod, GymStreak), Nutrition Planner (Eat This Much, PlateJoy), Form Coach/CV (Zing Coach, Kemtai, Tempo), Chat Coach/LLM (FitnessAI, Aaptiv Coach), Holistic Coach (DOES NOT EXIST YET)
- **AI Fitness Apps:** $2.5B (2025), 32% CAGR — schnellstwachsendes Segment
- **Key Players:** Freeletics (50M Users, $100M+ Revenue), Zing Coach (1M Users, 4.8★), Welltory (16M+ Users)

### Kritische Gaps
1. **Kein Holistic AI Coach existiert** — Archetype #5 ist ein leerer Markt. Alle AI Coaches können nur 1 Ding (Workout ODER Nutrition ODER Form). KEINER verbindet alles
2. **ChatGPT = größter "Competitor" aber hat keine Daten** — Millionen fragen ChatGPT Fitness-Fragen, aber: kein Tracking, kein Memory, keine Accountability, halluziniert bei Berechnungen
3. **CV Form Checking ist gelöst** — Zing Coach + Kemtai haben es bewiesen. Kemtai bietet White-Label API → kein eigenes CV-Model nötig
4. **Coaches wollen AI Clones** — Coachvox beweist: Coaches zahlen $99/mo für einen AI-Clone der ihre Methode skaliert
5. **Cost per User ist niedrig** — $0.50-1.30/User/mo bei LLM-basiertem Coach, 87-95% Margin bei $9.99/mo Subscription

### Competitive Intelligence
- **Freeletics:** 50M Users, AI-basierte Bodyweight Workouts, $100M+ Revenue — beweist dass AI Coach = Milliarden-Markt
- **Zing Coach:** CV Form Check via Phone Camera, 1M Users, 4.8★ — beweist dass Form Checking ohne Hardware funktioniert
- **Kemtai:** White-Label CV API, medical-validated, B2B — strategischer Partner statt Competitor
- **Coachvox:** AI Clone Platform, Coaches zahlen $99/mo — Revenue Stream für Lumeos Coach Module
- **Welltory:** 16M+ Users, HRV + Lifestyle AI — zeigt Nachfrage nach AI Health Insights

---

## 🏗️ Lumeos AI Coach — Architektur

### System-Übersicht
```
┌─────────────────────────────────────────────────┐
│               AI COACH MODULE                    │
├─────────────────────────────────────────────────┤
│  Conversation Layer (LLM)                        │
│  Natural Language Interface, Persona System       │
├──────────────┬──────────────────────────────────┤
│  Context     │  Deterministic Engine             │
│  Builder     │  (TDEE, Macros, Volume,           │
│  (User State │   Progressive Overload,           │
│   Aggregator)│   Recovery Score, Interactions)    │
├──────────────┴──────────────────────────────────┤
│  Module Connectors (reads ALL Lumeos data)        │
│  Nutrition · Training · Supplements · Medical     │
│  Recovery · Goals · Enhanced Supplements          │
├─────────────────────────────────────────────────┤
│  Safety Layer                                    │
│  Medical Disclaimers, Hallucination Guards,       │
│  Calculation Verification                         │
└─────────────────────────────────────────────────┘
```

### Hybrid AI Design
```
User Question
  ↓
Intent Classification (LLM)
  ↓
┌─────────────────┬──────────────────────┐
│  Conversational  │  Calculation-Based   │
│  (LLM handles)   │  (Deterministic)     │
│                   │                      │
│  "Motivier mich" │  "Wie viel Protein?" │
│  "Erkläre RPE"   │  "Berechne TDEE"     │
│  "Was meinst du  │  "Ist das zu viel    │
│   zu meinem Plan" │   Volumen?"          │
└─────────────────┴──────────────────────┘
  ↓                    ↓
LLM Response      Algorithm Result
  ↓                    ↓
  └──── Merged Response ────┘
         ↓
    Safety Check
    (Medical disclaimer if health-related)
         ↓
    User receives answer
```

### Context Builder
```typescript
interface CoachContext {
  // User Profile
  user: { age, sex, weight, height, experience, goals };
  
  // Live Module Data
  nutrition: { todayCalories, todayProtein, weeklyAverage, deficiencies };
  training: { lastWorkout, weeklyVolume, PRs, muscleGroupBalance };
  recovery: { recoveryScore, sleepQuality, hrvTrend, muscleReadiness };
  supplements: { currentStack, timing, interactions };
  medical: { latestBiomarkers, medications, flaggedValues };
  goals: { currentPhase, targetWeight, tdee, adherenceRate };
  
  // Conversation Memory
  recentMessages: Message[];  // Last 20 messages
  preferences: string[];      // "Prefers scientific explanations"
  coachPersona: Persona;      // Selected AI personality
}
```

---

## 👤 Persona Design

### User Personas

#### Persona 1: "Jan" — Overwhelmed Beginner (35%)
- **Alter:** 22, männlich, will anfangen zu trainieren
- **Ziel:** "Sag mir einfach was ich tun soll"
- **Pain Points:** Informationsflut, widersprüchliche Infos auf YouTube, keine Struktur
- **Feature-Needs:** Simple Q&A, Workout Generator, Meal Suggestions, Step-by-Step Guidance
- **AI Persona Preference:** Best Friend oder Motivator
- **Zahlungsbereitschaft:** $9.99/mo (spart Personal Trainer Kosten)

#### Persona 2: "Marie" — Intermediate Plateau (30%)
- **Alter:** 29, weiblich, trainiert seit 2 Jahren, Fortschritt stagniert
- **Ziel:** Durchbreche Plateau, optimiere Nutrition + Training
- **Pain Points:** "Mache ich alles richtig?" — braucht Feedback auf bestehende Routine
- **Feature-Needs:** Training Analysis, Nutrition Audit, Volume Recommendations, Periodisierung
- **AI Persona Preference:** Scientist oder Sensei
- **Zahlungsbereitschaft:** $9.99/mo

#### Persona 3: "Marcus" — Advanced Lifter (20%)
- **Alter:** 35, männlich, 8+ Jahre Training, kennt die Basics
- **Ziel:** Fine-Tuning, Contest Prep, Data-Driven Optimization
- **Pain Points:** Braucht keinen Coach der Basics erklärt, will Daten-Analyse und Periodisierung
- **Feature-Needs:** Advanced Analytics, Periodization Planning, Bloodwork-based Recommendations, Deload Timing
- **AI Persona Preference:** Scientist
- **Zahlungsbereitschaft:** $19.99/mo

#### Persona 4: "Coach Tina" — Fitness Coach (15%)
- **Alter:** 40, weiblich, Online-Coach mit 50 Clients
- **Ziel:** AI Clone der ihre Methode skaliert, Client-Support automatisiert
- **Pain Points:** Kann nicht 50 Clients gleichzeitig betreuen, repetitive Fragen
- **Feature-Needs:** AI Clone Builder, Client Data Access, Custom Protocols, White-Label
- **Zahlungsbereitschaft:** $99/mo (Business Tool)

### AI Personas (User wählt)

| Persona | Vibe | Sprachstil | Ideal für |
|---------|------|------------|-----------|
| 🔬 **Scientist** | Evidenz-basiert, nüchtern | "Studien zeigen..." | Advanced, Health Optimizer |
| 💪 **Motivator** | Energetisch, positiv | "Du schaffst das! 🔥" | Beginner, Plateau |
| 🎖️ **Drill Sergeant** | Hart, direkt | "Keine Ausreden." | Disziplin-Suchende |
| 😊 **Best Friend** | Locker, supportive | "Hey, lass uns mal schauen..." | Beginner, Casual |
| 🧘 **Sensei** | Weise, geduldig | "Der Weg ist das Ziel." | Long-Term, Mindset |

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing Tiers

| Tier | Preis | Features |
|------|-------|----------|
| **Free** | $0 | 5 AI Coach Messages/Tag, Basic Q&A, No Module Access |
| **Plus** | $9.99/mo | Unlimited Messages, Full Module Access, Persona Selection, Workout/Meal Generator |
| **Pro** | $19.99/mo | Advanced Analytics, Periodization Planning, Bloodwork Analysis, Custom Protocols |
| **Coach** | $99/mo | AI Clone Builder, Multi-Client, White-Label, Custom Training Methodology |

### Revenue Streams
1. **Subscriptions** (65%) — Core Revenue
2. **Coach AI Clones** (20%) — $99/mo per Coach (hochmargig)
3. **Form Check (CV)** (10%) — Kemtai API Pass-through, per Check oder Unlimited im Pro Tier
4. **Sponsored Recommendations** (5%) — "Der AI Coach empfiehlt Kreatin → Affiliate Link"

### Unit Economics
| Metric | Value |
|--------|-------|
| LLM Cost/User/Month | $0.50-1.30 (Claude Haiku für Standard, Claude Sonnet für Complex) |
| Subscription Revenue | $9.99/mo |
| **Gross Margin** | **87-95%** |
| Kemtai CV API Cost | ~$0.05/form check |
| Coach Clone Revenue | $99/mo (near-zero marginal cost) |

---

## 🔧 Technical Architecture

### LLM Stack
```
Primary:    Claude Haiku (80% of queries — fast, cheap)
Fallback:   Claude Sonnet (complex analysis, periodization planning)
Embedding:  text-embedding-3-small (user profile → vector)
Context:    Up to 8K tokens user context per request
Cache:      Common Q&A cached → $0 cost for repeat questions

Future:     Fine-tuned model on fitness Q&A (reduce cost 10x)
```

### Context Window Management
```
System Prompt (~2K tokens)
  + User Profile Summary (~500 tokens)
  + Active Module Data (~1K tokens)
  + Recent Conversation (~2K tokens, last 10 messages)
  + Current Query
  ──────────────────
  Total: ~6K input tokens per request
  Cost: ~$0.001 per request (Claude Haiku)
  Avg requests/user/day: 5-10
  Monthly cost/user: $0.15-0.30 (mini) or $1.50-3.00 (4o)
```

### Safety Layer
```typescript
interface SafetyCheck {
  // Medical claims
  hasMedicalAdvice: boolean;     // → Add disclaimer
  recommendsDrugs: boolean;      // → Block + redirect to doctor
  contradictsDoctor: boolean;    // → Block + escalate
  
  // Calculation integrity
  hasCalorieCalc: boolean;       // → Verify with deterministic TDEE
  hasVolumeCalc: boolean;        // → Verify with Training Module
  hasDosageCalc: boolean;        // → Verify with Supplement DB
  
  // Hallucination detection
  citesStudy: boolean;           // → Verify DOI exists
  claimsExactNumber: boolean;    // → Cross-check with DB
}
```

### Form Check Integration (Kemtai)
```
User records exercise (Phone Camera)
  → Video sent to Kemtai API
  → Pose estimation + biomechanical analysis
  → Form score (0-100) + specific corrections
  → AI Coach narrates: "Deine Kniebeuge: 72/100. Knie gehen zu weit nach innen."
```

---

## ⚖️ Key Design Decisions

### 1. Hybrid AI: LLM + Deterministic Algorithms
**Decision:** LLM für Konversation, deterministische Algorithmen für alle Berechnungen
**Rationale:** LLMs halluzinieren bei Mathe. TDEE, Macros, Volume → IMMER aus dem Algorithmus, NIE aus dem LLM generiert. LLM formatiert nur die Antwort. Zero tolerance für falsche Zahlen.

### 2. Claude Haiku Default, 4o für Complex
**Decision:** 80% Queries auf Claude Haiku, 20% auf Claude Sonnet (automatic routing)
**Rationale:** Mini ist 10x günstiger und für Q&A ausreichend. Complex = Periodisierung, Multi-Module Analysis, Long-form Planning. Router klassifiziert Complexity automatisch.

### 3. Persona System statt One-Size-Fits-All
**Decision:** 5 AI Personas die User wählen können
**Rationale:** "Motivier mich" vs. "Gib mir die Evidenz" = fundamental verschiedene User. Ein Ton für alle nervt 80% der User. Persona-Switch in Chat möglich.

### 4. Kemtai API für CV Form Check (kein eigenes Model)
**Decision:** White-Label API von Kemtai statt eigenes Computer Vision Model
**Rationale:** CV Form Checking ist ein gelöstes Problem. Kemtai hat medical-grade Validation, 1M+ Users tested. Eigenes Model wäre 2+ Jahre Entwicklung. API-Kosten ~$0.05/check — marginal.

### 5. 5 Free Messages/Tag (nicht 0)
**Decision:** Free Tier bekommt 5 AI Coach Nachrichten/Tag
**Rationale:** User muss den Wert erleben bevor er zahlt. 5 Messages reichen für 1-2 sinnvolle Interaktionen. Conversion Trigger: "Du hast 5/5 Messages genutzt → Upgrade für Unlimited".

### 6. Coach Clones als Premium B2B Feature
**Decision:** Coaches können einen AI Clone ihrer Methode bauen ($99/mo)
**Rationale:** Coachvox hat bewiesen: Coaches zahlen. Ein Coach mit 50 Clients der $100/Client/mo verdient kann $99/mo für einen Clone leicht rechtfertigen. Scalable Revenue mit near-zero marginal cost.

---

## 🚀 Lumeos AI Coach USP

### Primary USP: "The First AI Coach That Knows Everything About You — Across Every Health Module"

ChatGPT weiß was das Internet sagt.
Lumeos AI Coach weiß:
- **Was du gegessen hast** (heute, diese Woche, Mikronährstoff-Status)
- **Wie du trainiert hast** (Volumen, Intensität, PRs, Imbalances)
- **Wie erholt du bist** (Recovery Score, HRV, Muscle Readiness)
- **Was du supplementierst** (Stack, Timing, Interaktionen)
- **Was dein Blut sagt** (Biomarker-Trends, Deficiencies)
- **Was dein Ziel ist** (Phase, TDEE, Adherence Rate)
- **Wie es dir geht** (Symptoms, Stress, Sleep)

**ChatGPT kann raten. Lumeos Coach WEISS.**

### Secondary USPs

1. **Deterministic Accuracy**
   - "Dein TDEE ist 2847 kcal (berechnet aus 14 Tagen Tracking, nicht geschätzt)"
   - Keine LLM-Halluzination bei Zahlen — ALLE Berechnungen aus validierten Algorithmen

2. **Persona System**
   - Scientist für den Evidence-Nerd, Drill Sergeant für den Disziplin-Suchenden
   - Gleiche Daten, andere Verpackung — User fühlt sich verstanden

3. **Form Check via Camera**
   - "Film deine Kniebeuge → 72/100, Knie gehen innen rein, hier ist ein Korrektur-Video"
   - Kemtai API, medical-validated, kein teures Equipment

4. **Coach Clones**
   - Coaches bauen AI Versionen von sich → skaliert ihre Methode
   - Client bekommt 24/7 "Zugang" zum Coach
   - $99/mo Revenue per Coach

5. **Proactive statt Reactive**
   - "Du hast gestern Leg Day gemacht aber nur 90g Protein getrackt → heute sollten es 160g sein"
   - "Dein Recovery Score ist 45% → ich empfehle Active Recovery statt Heavy Squats"
   - Der Coach kommt zu DIR, du musst nicht fragen

### Warum Lumeos gewinnt
| Kriterium | ChatGPT | Freeletics | Zing Coach | Fitbod | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Personalized Data | ❌ | 🟡 (Workout only) | 🟡 (Form only) | 🟡 (Workout only) | ✅ (ALL modules) |
| Nutrition-Aware | ❌ | ❌ | ❌ | ❌ | ✅ |
| Recovery-Aware | ❌ | ❌ | ❌ | 🟡 | ✅ |
| Bloodwork-Aware | ❌ | ❌ | ❌ | ❌ | ✅ |
| Form Check (CV) | ❌ | ❌ | ✅ | ❌ | ✅ (Kemtai) |
| Conversation | ✅ (Best) | ❌ | ❌ | ❌ | ✅ |
| Accuracy (Calc) | ❌ (Hallucinates) | ✅ | ✅ | ✅ | ✅ (Hybrid) |
| Memory | ❌ (Session-based) | 🟡 | ❌ | 🟡 | ✅ (Persistent) |
| **Price** | $20/mo | $12/mo | Free+IAP | $13/mo | **$9.99/mo** |
