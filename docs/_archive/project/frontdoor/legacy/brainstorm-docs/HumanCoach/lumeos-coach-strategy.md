# Lumeos Coach Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **7 Platforms analysiert:** Trainerize, TrueCoach, PT Distinction, Everfit, TrainHeroic, ABC Trainerize, Coachvox
- **Markt:** Online Coaching $9B+ (2025), wächst durch Post-COVID Shift zu Remote Coaching
- **Key Players:** Trainerize (400K+ Coaches), TrueCoach (50K+ Coaches), TrainHeroic (100K+ Athletes)

### Kritische Gaps
1. **KEIN Coach-Tool hat echte Nutrition-Tiefe** — alle haben "Meal Plan PDF" oder basic Macro-Tracking, keine 138 Mikronährstoffe (BLS)
2. **KEIN Coach-Tool hat Bloodwork/Medical Integration** — Coach sieht Klientens Bluttest nicht
3. **KEIN Coach-Tool hat Recovery/HRV Insights** — Coach weiß nicht ob der Klient erholt ist
4. **Supplement Management fehlt überall** — Coach kann keine Supplement-Stacks für Klienten verwalten
5. **AI Clone Demand bewiesen** — Coachvox zeigt: Coaches zahlen $99/mo um ihre Methode als AI zu skalieren

### Competitive Intelligence
- **Trainerize:** Größte Platform, Mindbody-owned, aber: veraltet, langsam, schlechte UX, Nutrition = afterthought
- **TrueCoach:** Beste Coach-UX, fokussiert auf Training-Programmierung, aber: keine Nutrition/Medical
- **PT Distinction:** Feature-reichste Platform, aber: overwhelming UI, keine Cross-Module Intelligence
- **Everfit:** Modernste UX, schnell wachsend, aber: fehlt Medical/Supplements/Recovery
- **TrainHeroic:** Stark bei Team/Gym, schwach bei 1:1 Online Coaching
- **Coachvox:** AI Clone Platform — Coaches zahlen $99/mo, beweist Demand für AI-powered Coaching

---

## 🏗️ Lumeos Coach — Architektur

### System-Übersicht
```
┌──────────────────────────────────────────────┐
│              COACH MODULE                     │
├──────────────┬───────────────────────────────┤
│  Coach       │  Client App                   │
│  Dashboard   │  (= normale Lumeos App)        │
├──────────────┴───────────────────────────────┤
│  Shared Data Layer (Permission-Based)         │
│  Coach sieht: Training · Nutrition · Recovery │
│              Supplements · Medical · Goals     │
├──────────────────────────────────────────────┤
│  Communication Layer                          │
│  In-App Chat · Check-ins · Video · Voice Notes│
├──────────────────────────────────────────────┤
│  Content Pipeline                             │
│  Programs · Meal Plans · Protocols · Templates │
├──────────────────────────────────────────────┤
│  AI Clone Engine (Optional)                   │
│  Coach-trained AI · Client Self-Service        │
└──────────────────────────────────────────────┘
```

### Kern-Innovation: Client App = Lumeos App
```
Trainerize-Modell:    Coach App ←→ Client App (separate, limited)
Lumeos-Modell:        Coach Dashboard ←→ Client's FULL Lumeos App

→ Coach sieht ALLES was der Klient trackt
→ Klient braucht keine separate App
→ Cross-Module Insights automatisch verfügbar
```

### Coach Data Access (Permission-Based)
```typescript
interface CoachPermissions {
  client: UserId;
  coach: CoachId;
  access: {
    training: 'full' | 'summary' | 'none';     // Workout logs, PRs, volume
    nutrition: 'full' | 'summary' | 'none';     // Food log, macros, micros
    recovery: 'full' | 'summary' | 'none';      // Recovery score, HRV, sleep
    supplements: 'full' | 'summary' | 'none';   // Stack, adherence
    medical: 'full' | 'summary' | 'none';       // Bloodwork, meds (SENSITIVE!)
    goals: 'full' | 'summary' | 'none';         // Phases, progress
    bodyMetrics: 'full' | 'summary' | 'none';   // Weight, photos, measurements
  };
  expiresAt?: Date;  // Time-limited access
}
```

---

## 👤 Persona Design

### Coach Personas

#### Persona 1: "Coach Alex" — Solo Online Coach (40%)
- **Alter:** 30, 20-50 Clients, arbeitet allein
- **Pain Points:** 3+ Apps für Training/Nutrition/Chat, keine einheitliche Client-Übersicht
- **Feature-Needs:** All-in-One Dashboard, Template-basierte Programmierung, Automated Check-ins
- **Zahlungsbereitschaft:** $49/mo (spart 2-3 andere Tool-Abos)

#### Persona 2: "Coach Studio" — Gym/Studio mit Coaches (25%)
- **Team:** 5 Coaches, 200+ Clients
- **Pain Points:** Jeder Coach nutzt andere Tools, keine Standardisierung
- **Feature-Needs:** Multi-Coach Management, Shared Templates, Client Handoff, Branding
- **Zahlungsbereitschaft:** $199/mo (Business Plan)

#### Persona 3: "Influencer Coach" — Content Creator mit Coaching (20%)
- **Alter:** 27, 10K+ Followers, will Coaching monetarisieren
- **Pain Points:** Will schnell Programme verkaufen, braucht keine tiefe Coach-Beziehung
- **Feature-Needs:** Template Programs, Marketplace Listing, AI Clone, Scalability
- **Zahlungsbereitschaft:** $99/mo (für AI Clone + Marketplace Access)

### Client Personas

#### Persona 4: "Klient Maria" — Coached Athlete (60% der Clients)
- **Alter:** 35, zahlt Coach $150-300/mo
- **Ziel:** Personalized Training + Nutrition, Accountability
- **Pain Points:** Muss Daten in Coach-App UND eigene Tracking-App eingeben (Doppelarbeit)
- **Feature-Needs:** Single App (Lumeos) für alles, Coach sieht automatisch was sie trackt
- **Zahlungsbereitschaft:** Lumeos Plus ($9.99/mo) wird vom Coach empfohlen

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing Tiers (Coach Plans)

| Tier | Preis | Clients | Features |
|------|-------|---------|----------|
| **Starter** | $29/mo | Bis 10 Clients | Dashboard, Chat, Program Builder, Basic Templates |
| **Professional** | $49/mo | Bis 50 Clients | + Nutrition Management, Check-in Automation, Branding |
| **Business** | $99/mo | Bis 150 Clients | + AI Clone, Marketplace Listing, Advanced Analytics |
| **Enterprise** | $199/mo | Unlimited + Multi-Coach | + Team Management, White-Label, API Access |

### Revenue Streams
1. **Coach Subscriptions** (50%) — Monthly SaaS
2. **AI Clone Premium** (20%) — $99/mo extra für AI Clone Feature
3. **Marketplace Commission** (15%) — Coach verkauft Programme über Lumeos Marketplace (80/20 Split)
4. **Client Upgrades** (10%) — Coach empfiehlt Lumeos Plus/Pro → Affiliate Commission
5. **White-Label** (5%) — Enterprise Coaches/Gyms mit eigenem Branding

### Revenue Model
```
Coach Traffic (Client kommt über Coach):     90/10 Split (Coach 90%, Lumeos 10%)
Discovery Traffic (Client findet über Lumeos): 80/20 Split (Coach 80%, Lumeos 20%)
AI Clone Revenue:                             100% Lumeos (Coach zahlt Subscription)
```

---

## 🔧 Technical Architecture

### Coach Dashboard
```
┌──────────────────────────────────────────────┐
│  COACH DASHBOARD                              │
├──────────────┬───────────────────────────────┤
│  Client List  │  Client Detail View           │
│  - Name       │  ┌─────────────────────────┐ │
│  - Status     │  │ Overview (Score Cards)   │ │
│  - Alerts     │  │ Training Log            │ │
│  - Last Active│  │ Nutrition Summary       │ │
│  - Recovery ● │  │ Recovery Score          │ │
│               │  │ Supplement Stack        │ │
│  [+ Add]      │  │ Bloodwork (if shared)   │ │
│               │  │ Goals Progress          │ │
│               │  │ Chat                    │ │
│               │  │ Check-in History        │ │
│               │  └─────────────────────────┘ │
├──────────────┴───────────────────────────────┤
│  Programs · Templates · Analytics · Settings  │
└──────────────────────────────────────────────┘
```

### Program Builder
```typescript
interface CoachProgram {
  id: string;
  coach: CoachId;
  name: string;                    // "12-Week Hypertrophy"
  type: 'training' | 'nutrition' | 'combined' | 'full';
  duration: number;                // weeks
  phases: ProgramPhase[];          // Periodization
  templates: {
    training?: WorkoutTemplate[];
    nutrition?: MealPlanTemplate[];
    supplements?: SupplementProtocol[];
  };
  assignedClients: ClientId[];
  marketplace: {
    listed: boolean;
    price?: number;                // one-time or subscription
    description: string;
  };
}
```

### AI Clone Engine
```
Coach creates clone:
  1. Upload methodology docs (PDFs, protocols)
  2. Record Q&A sessions (voice → transcript)
  3. Define response style + boundaries
  4. Review + edit generated responses (training loop)
  
Client interacts with clone:
  → Natural language questions
  → Clone answers in Coach's style
  → Uses Coach's methodology + Client's Lumeos data
  → Escalates to real Coach for complex/medical questions
  
Tech: Fine-tuned LLM layer on top of base model
  → System prompt = Coach methodology
  → Context = Client's Lumeos data
  → Guardrails = Coach-defined boundaries
```

### Communication Layer
```
In-App Chat (async, primary)
  → Text, Voice Notes, Photos, Videos
  → Coach can attach: Programs, Meal Plans, Exercise Demos
  
Automated Check-ins (weekly)
  → Pre-built questionnaire (Coach configures)
  → Auto-pulls: Weight, Recovery Score, Adherence Rate
  → Coach gets summary, not raw data dump
  
Video Calls (optional integration)
  → Zoom/Google Meet link embedding
  → Session notes attached to client timeline
```

---

## ⚖️ Key Design Decisions

### 1. Client App = Lumeos App (keine separate Coach-Client App)
**Decision:** Clients nutzen die normale Lumeos App, Coach bekommt ein Dashboard-Overlay
**Rationale:** Trainerize zwingt Clients in eine limitierte App. Lumeos-Clients tracken ohnehin in Lumeos → Coach sieht automatisch alles. Kein Doppel-Tracking, keine zweite App. Game Changer für Coaches UND Clients.

### 2. Permission-Based Data Access
**Decision:** Client gibt Coach explizit Zugriff pro Modul (Training/Nutrition/Medical etc.)
**Rationale:** Medical Data ist sensitiv. Client muss kontrollieren was der Coach sieht. Time-limited Access Tokens möglich. GDPR-compliant by design.

### 3. AI Clone als Premium Add-on ($99/mo)
**Decision:** AI Clone ist separates Premium Feature, nicht im Basis-Plan
**Rationale:** Coachvox validiert den Preis ($99/mo). Hohe Wertwahrnehmung bei Coaches ("Meine Methode skaliert auf 1000 Clients"). Near-zero marginal cost nach Setup. Starkes Revenue-Potential.

### 4. Marketplace Integration (Coach verkauft Programme)
**Decision:** Coaches können Programme direkt über Lumeos Marketplace verkaufen
**Rationale:** TrainHeroic/Boostcamp zeigen: Coaches wollen Programme verkaufen. Lumeos hat den Vorteil: Programme sind LIVE im User's App (nicht PDF). 80/20 Revenue Split für Discovery Traffic.

### 5. Automated Check-ins statt Manual Reports
**Decision:** Weekly Check-ins auto-generiert aus User-Daten
**Rationale:** Coaches verbringen 30% ihrer Zeit mit "Wie war deine Woche?"-Datensammlung. Auto-Check-in zieht Weight, Recovery, Adherence automatisch. Coach reagiert auf Insights statt Daten zu sammeln.

---

## 🚀 Lumeos Coach USP

### Primary USP: "The Only Coaching Platform Where You See Everything — Training, Nutrition, Recovery, Bloodwork, Supplements — in One Dashboard"

Trainerize zeigt dem Coach: Workouts + basic Macros.
Lumeos zeigt dem Coach:
- **Training:** Volumen, PRs, Muscle Balance, Progressive Overload
- **Nutrition:** Macros + 138 Mikronährstoffe (BLS) + Mahlzeiten-Log
- **Recovery:** Recovery Score, HRV, Sleep, Muscle Readiness
- **Supplements:** Aktueller Stack, Adherence, Interaktionen
- **Medical:** Bloodwork Trends, Medications (wenn Client teilt)
- **Goals:** Phase, TDEE, Adherence Rate, Trajectory

**Kein anderes Coach-Tool bietet mehr als Training + basic Nutrition.**

### Secondary USPs

1. **Kein Doppel-Tracking**
   - Client nutzt Lumeos für sich → Coach sieht automatisch alles
   - Keine separate Coach-App, keine Daten-Eingabe doppelt

2. **AI Clone = Coach skaliert sich selbst**
   - 24/7 Client-Support durch AI mit Coach's Methode
   - Clone kennt Client-Daten (Lumeos Modules)
   - Escalation an echten Coach bei komplexen Fragen

3. **Automated Insights statt Manual Reports**
   - "Client Maria: Recovery Score unter 50% seit 3 Tagen, Protein unter Ziel"
   - Coach reagiert auf Flags statt selbst nach Daten zu suchen

4. **Marketplace = Passive Income**
   - Coach erstellt Programm einmal → verkauft es 1000x
   - Programme sind LIVE in der App (nicht PDF)
   - 80/20 Revenue Split

### Warum Lumeos gewinnt
| Kriterium | Trainerize | TrueCoach | Everfit | PT Distinction | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Training Management | ✅ | ✅ (Best) | ✅ | ✅ | ✅ |
| Nutrition (Deep) | ❌ (Basic) | ❌ | 🟡 | 🟡 | ✅ (138 Micros (BLS)) |
| Recovery/HRV | ❌ | ❌ | ❌ | ❌ | ✅ |
| Supplements | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bloodwork | ❌ | ❌ | ❌ | ❌ | ✅ |
| AI Clone | ❌ | ❌ | ❌ | ❌ | ✅ |
| Marketplace | ❌ | ❌ | ❌ | ❌ | ✅ |
| No Dual-Tracking | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Price (Coach)** | $5-25/mo | $19-99/mo | $15-50/mo | $25-75/mo | **$29-99/mo** |
