# Lumeos Gym Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **8 Platforms analysiert:** Mindbody (40K), Magicline (8K DACH), Virtuagym (9K), Glofox/ABC (30K), PushPress (5K), Wodify (5K), GymMaster (10K), ClassPass
- **Gym Management Software:** ~$7B (2025), 15% CAGR
- **Key Insight:** Gym Management ist commoditized (Booking, Billing, Check-in). Der Wert liegt in Member Health Engagement.

### Kritische Gaps
1. **KEIN Gym-Tool kennt Member Health Data** — Gyms wissen wann jemand da ist, nicht wie es ihm geht
2. **Equipment Tracking existiert NIRGENDWO** — kein Tool trackt Studio-Geräte, Auslastung, Wartung
3. **Program Distribution ist primitiv** — kein Tool personalisiert Pläne basierend auf Member-Daten
4. **Trainer haben keine echten Tools** — kein Gym-Tool zeigt Trainern Nutrition/Recovery/Supplements ihrer Members
5. **Virtuagym = direktester Competitor** — einzige Platform mit Workout+Nutrition+Management, aber alles oberflächlich

### Competitive Intelligence
- **Mindbody:** Größtes Ökosystem (40K), ClassPass, Branded App, aber: KEIN Workout/Nutrition/Health
- **Magicline:** DACH-Leader (8K Studios), Open API, Developer Portal, Technogym — Key Integration Partner
- **Virtuagym:** Workout+Nutrition+Management, aber: Nutrition ist basic, UX veraltet, keine Tiefe
- **Glofox/ABC:** Modern, schnell wachsend, 30K Businesses, aber: reines Booking/CRM
- **PushPress:** Free Tier disruptiv, gym-owner-built, aber: kein Workout/Health
- **Wodify:** Performance Tracking (PRs, Streaks), AI At-Risk Detection, aber: nur CrossFit/Functional

---

## 🏗️ Lumeos Gym — Architektur

### Modul-Übersicht
```
┌──────────────────────────────────────────────────┐
│                  GYM MODULE                       │
│              (B2B, Mandantenfähig)                │
├──────────────┬───────────────────────────────────┤
│  Gym Admin   │  Trainer Dashboard                 │
│  Dashboard   │  (Member 360° View)                │
│  (Analytics, │                                    │
│   Revenue,   │  Sieht pro Member (mit Permission):│
│   Retention) │  · Training Score + History         │
│              │  · Nutrition Compliance             │
│              │  · Recovery Status                  │
│              │  · Supplement Stack                 │
│              │  · Medical Alerts (wenn freigegeben)│
├──────────────┼───────────────────────────────────┤
│  Member      │  Program Distribution              │
│  Management  │  · Trainer erstellt Pläne          │
│  (Import,    │  · AI passt an Member-Daten an     │
│   Groups,    │  · Live-Tracking Adherence         │
│   Roles)     │  · Automatische Progressionen      │
├──────────────┼───────────────────────────────────┤
│  Equipment   │  Integration Layer                 │
│  Registry    │  · Magicline API (DACH)            │
│  (Geräte,    │  · Mindbody API (International)    │
│   Wartung,   │  · Technogym (Geräte-Daten)       │
│   Auslastung)│  · Stripe (Payments)               │
└──────────────┴───────────────────────────────────┘
```

### Rollenhierarchie
```
Gym Owner (admin)
  ├── Studio Manager (admin-lite)
  │   ├── Head Trainer (trainer + management)
  │   │   ├── Trainer (trainer)
  │   │   └── Trainer (trainer)
  │   └── Front Desk (check-in only)
  └── Member (user)
      └── = normale Lumeos App + Gym-Zugehörigkeit
```

### Datenmodell
```sql
-- Gym Tenant
CREATE TABLE gyms (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address JSONB,
  settings JSONB,        -- Branding, Features On/Off
  subscription_tier TEXT, -- free, pro, enterprise
  created_at TIMESTAMPTZ
);

-- Gym Membership
CREATE TABLE gym_members (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'member', -- owner, manager, trainer, member
  status TEXT DEFAULT 'active',        -- active, paused, cancelled
  joined_at TIMESTAMPTZ,
  permissions JSONB        -- was der Trainer sehen darf
);

-- Equipment Registry
CREATE TABLE gym_equipment (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  name TEXT NOT NULL,           -- "Leg Press #1"
  category TEXT,                -- cardio, strength, cable, free_weight
  brand TEXT,                   -- "Technogym", "Life Fitness"
  model TEXT,
  exercises TEXT[],             -- exercise_ids die auf diesem Gerät möglich sind
  location TEXT,                -- "EG links", "Raum 2"
  status TEXT DEFAULT 'active', -- active, maintenance, broken
  last_maintenance TIMESTAMPTZ,
  next_maintenance TIMESTAMPTZ,
  notes TEXT
);

-- Program Distribution
CREATE TABLE gym_programs (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  trainer_id UUID,              -- erstellt von
  name TEXT NOT NULL,
  description TEXT,
  target_group TEXT,            -- all, beginners, advanced
  program_id UUID,              -- Referenz zum Training Module Program
  assigned_members UUID[],      -- oder Group-basiert
  active BOOLEAN DEFAULT true
);

-- Trainer-Member Zuordnung
CREATE TABLE gym_trainer_assignments (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  trainer_id UUID,
  member_id UUID,
  assigned_at TIMESTAMPTZ,
  notes TEXT
);
```

---

## 👥 Persona Design

### Gym Owner / Manager
**"Ich will wissen ob meine Trainer gute Arbeit machen und ob Members Fortschritt machen"**
- Dashboard: Retention Rate, Member Scores Trend, Trainer Performance
- Alerts: At-Risk Members (Score sinkt), Equipment Wartung fällig
- Revenue: Upsell-Opportunities (Member mit hohem Engagement → Premium)

### Trainer
**"Ich will beim Floor Walk sofort sehen wo jedes Mitglied steht"**
- Member 360° View auf dem Handy/Tablet
- Schnell-Check: "Thomas hat seit 5 Tagen nicht geschlafen, Recovery 42/100"
- Program anpassen: "Anna braucht mehr Volumen für Quads"
- AI-Assistent: "Was soll ich Sarah heute empfehlen?"

### Member
**"Ich will dass mein Gym mich kennt und mein Trainer weiß was ich brauche"**
- = Normale Lumeos App, plus Gym-Connection
- Permission-Control: Was sieht der Trainer?
- Gym-spezifische Workouts (Equipment-basiert)
- Community: Gym Challenges, Leaderboards

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Gym Pricing (B2B)

| Tier | Preis/Monat | Members | Features |
|------|-------------|---------|----------|
| **Free** | €0 | bis 25 | Member Management, Basic Analytics |
| **Pro** | €99 | bis 200 | + Trainer Dashboard, Program Distribution, Equipment |
| **Enterprise** | €299 | Unlimited | + AI Coach für Members, API Access, White-Label, Priority Support |
| **Custom** | Auf Anfrage | Multi-Location | + Custom Integrations, Dedicated Support |

### Member Upsell
- Gym kann Lumeos Premium als Perk anbieten (€4.99/mo statt €9.99)
- Gym zahlt Differenz oder subventioniert → Member Retention Boost
- Revenue Share: 70% Gym, 30% Lumeos

### Integration Fees
- Magicline/Mindbody Sync: Inklusive ab Pro Tier
- Custom API Integration: €499 Setup + €49/mo

---

## 🔧 Technical Architecture

### Mandantenfähigkeit
```
RLS Policy: gym_id + user_id

-- Trainer sieht nur Members seines Gyms
CREATE POLICY trainer_sees_gym_members ON gym_members
  FOR SELECT USING (
    gym_id IN (SELECT gym_id FROM gym_members WHERE user_id = auth.uid() AND role IN ('trainer', 'manager', 'owner'))
  );

-- Member kontrolliert was Trainer sieht
CREATE POLICY member_controls_permissions ON nutrition_daily_aggregates
  FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM gym_members gm
      WHERE gm.user_id = auth.uid() AND gm.role IN ('trainer', 'manager', 'owner')
      AND gm.gym_id IN (SELECT gym_id FROM gym_members WHERE user_id = nutrition_daily_aggregates.user_id)
      AND (gm.permissions->>'nutrition')::boolean = true
    )
  );
```

### Integration Strategy
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Magicline   │     │  Mindbody    │     │  Technogym   │
│  Open API    │     │  API         │     │  API         │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────┬───────┘────────────────────┘
                    │
       ┌────────────▼────────────┐
       │   Lumeos Integration    │
       │   Adapter Layer         │
       │                         │
       │   · Member Sync         │
       │   · Booking Import      │
       │   · Check-in Events     │
       │   · Equipment Data      │
       └────────────┬────────────┘
                    │
       ┌────────────▼────────────┐
       │   Lumeos Gym Module     │
       │   (eigene Logik)        │
       └─────────────────────────┘
```

### Equipment-Aware Workout Generation
```
Member startet Workout im Gym
  → Lumeos kennt Gym Equipment (gym_equipment Tabelle)
  → AI Workout Engine filtert Exercises nach verfügbaren Geräten
  → "Leg Press #1 ist besetzt" (Auslastungsdaten, Phase 3)
  → Automatisch Alternative: "Hack Squat stattdessen"
```

---

## 🎯 Key Design Decisions

### 1. Build vs. Integrate
**Entscheidung:** Lumeos baut was KEIN Gym-Tool hat. Alles andere per Integration.

| Build (Lumeos) | Integrate (Partner) |
|----------------|-------------------|
| Member Health Dashboard | Booking/Scheduling |
| Trainer 360° View | Billing/Payments |
| Equipment Registry | Check-in Hardware |
| Program Distribution (deep) | Member Import |
| AI Coach für Members | Accounting |
| Cross-Module Analytics | Access Control |

### 2. Gym ≠ Coach
Gym Module = physischer Ort, 1:viele, Mandantenfähig
Coach Module = Beziehung, 1:1-20, nicht ortsgebunden
Beide nutzen Permission-basierte Freigaben, aber verschiedene Rollen/Flows.

### 3. Equipment als Differentiator
Kein Competitor hat Equipment Tracking + Equipment-aware Workout Generation. Das ist ein echter Moat für Gym-Kunden.

### 4. Privacy by Default
Member gibt nichts frei bis er aktiv Permissions setzt:
- ✅ Training Scores → Trainer
- ✅ Nutrition Compliance → Trainer
- ❌ Medical Data → nur explizit
- ❌ Enhanced Supplements → nie automatisch

---

## 🏆 USP

> **"Das erste Gym-Tool das weiß wie es deinen Mitgliedern wirklich geht."**

Jedes Gym-Tool sagt dir wann ein Mitglied da war.
Lumeos sagt dir **ob es Fortschritt macht, gut schläft, richtig isst und gesund ist.**

Kein Competitor verbindet Member Management mit echten Health & Performance Daten.
Lumeos Gym macht aus einem Check-in-Counter ein Health Performance Dashboard.

---

*Aligned mit LUMEOS_OVERVIEW.md, Stand: 2026-02-17*
