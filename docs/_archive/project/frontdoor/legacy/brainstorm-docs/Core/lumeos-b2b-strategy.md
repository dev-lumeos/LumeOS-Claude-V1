# Lumeos B2B Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **12+ Platforms analysiert** across 3 Verticals: Gym Management (Mindbody, Virtuagym, Magicline, Glofox, PushPress, GymMaster, Wodify, ClassPass/USC), Supplement Brands (1st Phorm), Corporate Wellness (Virgin Pulse, Wellhub)
- **Gym Management Software:** ~$7B (2025), 15% CAGR
- **Key Players:** Mindbody (40K Businesses), Virtuagym (9K+ Clubs), Magicline (8K Studios DACH)

### Kritische Gaps
1. **Virtuagym = direktester Competitor** — einzige Platform mit Workout+Nutrition+Management, aber: oberflächlich bei allem, keine Medical/Supplements/Recovery
2. **KEIN Gym-Tool verbindet Member Data** — Gym weiß wann Member checkt ein, aber nicht ob er Fortschritt macht, gut schläft, oder supplements nimmt
3. **Supplement Brands haben keinen Direct-to-Consumer App Channel** — 1st Phorm ($500M+ Revenue) hat gezeigt dass App+Supplements = riesiges Business, aber kein Tool ermöglicht das für andere Brands
4. **Corporate Wellness ist $80B+ Markt** — Firmen zahlen $300-1000/Employee/Year für Wellness-Programme, aber Engagement ist <30%

### Competitive Intelligence
- **Mindbody:** 40K Businesses, größtes Ökosystem, Open API, aber: kein Nutrition/Recovery/Supplements, reines Booking+Payment
- **Virtuagym:** 9K+ Clubs, Workout+Nutrition+Management, aber: Nutrition ist basic, kein Medical/Recovery, UX veraltet
- **Magicline:** 8K Studios DACH, Open API, Developer Portal, Technogym Integration — **Key DACH Integration Partner**
- **1st Phorm:** $500M+ Revenue mit eigener App + Supplement Brand — beweist App+Supplements Modell, aber ist 1 Brand (nicht Platform)
- **Glofox:** Modern, gym-focused, ABC Fitness acquired, aber: nur Booking/Payments/Retention
- **PushPress:** Free tier gym management, growing fast, aber: keine Member Health Data

---

## 🏗️ Lumeos B2B — Architektur

### 3 Business Verticals
```
┌──────────────────────────────────────────────┐
│              LUMEOS B2B                        │
├──────────────┬──────────────┬────────────────┤
│  VERTICAL 1  │  VERTICAL 2  │  VERTICAL 3    │
│  Gyms &      │  Supplement   │  Corporate     │
│  Studios     │  Brands       │  Wellness      │
├──────────────┼──────────────┼────────────────┤
│  White-Label │  In-App       │  Employee       │
│  Member App  │  Placement    │  Health         │
│  Gym Connect │  Co-Branded   │  Platform       │
│  Analytics   │  Bundles      │  Analytics      │
│  Retention   │  Affiliate    │  Challenges     │
│  Tools       │  Dashboard    │  ROI Reports    │
├──────────────┴──────────────┴────────────────┤
│           Lumeos API Layer                     │
│  REST API · Webhooks · SDK · White-Label       │
└──────────────────────────────────────────────┘
```

### Gym Integration Architecture
```
Gym Software (Magicline/Mindbody/Glofox)
  ↕ API Integration
Lumeos B2B Layer
  ↕ 
Member's Lumeos App
  
Flows:
1. Member checks in at gym → Lumeos auto-logs "Gym Visit"
2. Member finishes workout in Lumeos → Gym sees "Member trained today"
3. Gym assigns program → appears in Member's Lumeos App
4. Member hasn't visited in 7 days → Gym gets retention alert
5. Gym's PT creates program → delivered via Lumeos Coach Module
```

### Supplement Brand Architecture
```
Brand Dashboard
  ├── Product Catalog (upload products with nutrition facts)
  ├── Targeting Rules ("Show to users tracking Protein" or "Vitamin D deficient")
  ├── In-App Placement ("Recommended for your stack")
  ├── Co-Branded Bundles ("Brand X Lean Bulk Stack")
  ├── Affiliate Tracking (clicks, conversions, revenue)
  └── Analytics (reach, engagement, ROI)

User Experience:
  → User logs supplements → "Dein Stack fehlt Creatine"
  → "Empfohlen: [Brand] Creatine Monohydrat, $24.99"
  → In-context, nicht Banner. Relevant, nicht nervig.
  → User buys → tracked → Brand pays CPA
```

---

## 👤 Persona Design

### Persona 1: "Gym Owner Gerd" — Independent Gym (Vertical 1)
- **Gym:** 500 Members, 1 Location, DACH
- **Software:** Magicline für Verwaltung
- **Pain Points:** 30% Churn/Year, weiß nicht ob Members Fortschritt machen, kann keine personalisierten Programme bieten
- **Feature-Needs:** Member Progress Dashboard, Retention Alerts, Automated Re-Engagement, PT Program Delivery
- **Zahlungsbereitschaft:** €199-499/mo (spart 5 Kündigungen/mo = €250+ saved)

### Persona 2: "Brand Manager Bella" — Supplement Company (Vertical 2)
- **Company:** Mid-size Supplement Brand, $10M Revenue
- **Pain Points:** Instagram Ads CPA $20-30, kann Gym-Audience nicht direkt erreichen, kein Retargeting in Fitness-Context
- **Feature-Needs:** Product Placement Dashboard, Targeting (by user behavior), Conversion Tracking, ROI Analytics
- **Zahlungsbereitschaft:** CPA $5-15 pro Conversion + Monthly Platform Fee $500-2000

### Persona 3: "HR Hannah" — Corporate Wellness (Vertical 3)
- **Company:** 2000 Employees, Tech Company
- **Pain Points:** Wellness-Programm Engagement <30%, keine Messbarkeit, Generic (nicht personalisiert)
- **Feature-Needs:** Employee App (White-Label), Health Challenges, Aggregated Analytics (GDPR!), Integration mit Krankenversicherung
- **Zahlungsbereitschaft:** $300-500/Employee/Year ($600K-1M/Year Budget)

### Persona 4: "Chain Manager Chris" — Gym Chain (Vertical 1 Enterprise)
- **Chain:** 20 Locations, 15K Members
- **Pain Points:** Inconsistent Member Experience, keine Data across Locations, PTs nutzen verschiedene Tools
- **Feature-Needs:** Multi-Location Dashboard, Standardized Programs, Centralized Analytics, Brand Consistency
- **Zahlungsbereitschaft:** $2K-5K/mo Enterprise Plan

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Vertical 1: Gyms & Studios

| Tier | Preis | Members | Features |
|------|-------|---------|----------|
| **Starter** | €99/mo | Bis 200 | Gym Connect (Check-in Sync), Member Progress View, Basic Retention Alerts |
| **Professional** | €299/mo | Bis 1000 | + Program Delivery, PT Integration, Advanced Analytics, Custom Branding |
| **Enterprise** | €499+/mo | Unlimited | + Multi-Location, API Access, Dedicated Support, White-Label App |

### Vertical 2: Supplement Brands

| Revenue Stream | Pricing | Model |
|---------------|---------|-------|
| Platform Fee | $1K-5K/mo | Monthly SaaS (based on reach) |
| In-App Placement | CPA $5-15 | Per Conversion (tracked) |
| Co-Branded Bundles | Revenue Share 70/30 | Brand 70%, Lumeos 30% |
| Featured Listing | $2K-10K/mo | Monthly Sponsorship |
| Data Insights | $500-2K/mo | Anonymized Trend Data |

### Vertical 3: Corporate Wellness

| Tier | Preis | Features |
|------|-------|----------|
| **Standard** | $15/employee/mo | White-Label App, Health Challenges, Basic Analytics |
| **Premium** | $25/employee/mo | + Coaching, Advanced Analytics, Integration, Gamification |
| **Enterprise** | Custom | + Custom Features, Dedicated CSM, On-Prem Option |

### Revenue Forecast

| Year | Gyms | Brands | Corporate | **Total B2B** |
|------|------|--------|-----------|--------------|
| Y1 | $120K | $240K | $100K | **$460K** |
| Y2 | $500K | $1.8M | $500K | **$2.8M** |
| Y3 | $1.5M | $7.7M | $2M | **$11.2M** |

---

## 🔧 Technical Architecture

### API Layer
```
Lumeos B2B API (REST + Webhooks)
├── /api/b2b/gyms/
│   ├── members          (list, progress, retention)
│   ├── check-ins        (sync with gym software)
│   ├── programs         (assign, track completion)
│   └── analytics        (engagement, retention, churn prediction)
├── /api/b2b/brands/
│   ├── products         (catalog management)
│   ├── placements       (create, target, analytics)
│   ├── conversions      (tracking, attribution)
│   └── reports          (reach, engagement, ROI)
├── /api/b2b/corporate/
│   ├── employees        (onboarding, status)
│   ├── challenges       (create, leaderboard)
│   ├── analytics        (aggregated, anonymized)
│   └── reports          (ROI, engagement)
└── /api/b2b/common/
    ├── auth             (OAuth2, API keys)
    ├── webhooks         (event subscriptions)
    └── white-label      (branding, custom domain)
```

### Gym Software Integrations

| Platform | Type | Coverage | Priority |
|----------|------|----------|----------|
| **Apple Health / Google Health Connect** | Aggregator | 90%+ Wearable Users | P0 (MVP) |
| **Magicline** | Direct API | 8K Studios (DACH) | P1 |
| **Mindbody** | Direct API | 40K Businesses (Global) | P1 |
| **Glofox** | Direct API | Growing, Modern | P2 |
| **PushPress** | Direct API | Free Tier Gyms | P2 |
| **Technogym** | Equipment API | Premium Gyms | P3 |
| **Wodify** | Direct API | CrossFit Boxes | P3 |

### White-Label Architecture
```
Standard Lumeos App
  ↓ Configuration Layer
  ├── Custom Logo + Colors + Name
  ├── Feature Toggles (hide/show modules)
  ├── Default Programs (gym's programs pre-loaded)
  ├── Custom Onboarding (gym's branding)
  └── Custom Domain (gymname.lumeos.app)

Technical: Next.js 14 theme system
  → Brand config JSON per gym
  → Hot-swap without app update
  → Same codebase, different skin
```

### Privacy & GDPR (B2B Critical)
```
Gym sees:
  ✅ Aggregated member progress
  ✅ Check-in frequency
  ✅ Program completion rate
  ❌ Food log details
  ❌ Medical/Bloodwork data
  ❌ Individual health metrics (unless member shares)

Brand sees:
  ✅ Anonymized user segments ("Users tracking protein")
  ✅ Conversion/click data for their products
  ❌ Individual user data
  ❌ Competitor product data

Corporate sees:
  ✅ Aggregated department/company health scores
  ✅ Challenge participation rates
  ❌ Individual employee data (GDPR!)
  ❌ Medical information
```

---

## ⚖️ Key Design Decisions

### 1. Magicline als First Integration Partner (DACH)
**Decision:** Magicline API Integration als erste Gym-Anbindung
**Rationale:** 8K Studios in DACH, Open API mit Developer Portal, Technogym Integration. DACH = Lumeos Heimatmarkt. Magicline ist kooperativ und hat dokumentierte API. Mindbody kommt Phase 2 (global expansion).

### 2. CPA-Modell für Supplement Brands (nicht CPM)
**Decision:** Brands zahlen pro Conversion (nicht pro Impression)
**Rationale:** CPA aligniert Interests: Brand zahlt nur wenn es wirkt. User sieht nur relevante Empfehlungen. Lumeos optimiert für Conversions (nicht Ad-Spam). CPA $5-15 ist 50-75% günstiger als Instagram ($20-30).

### 3. Aggregated-Only Analytics für B2B (Privacy-First)
**Decision:** Gyms/Corporates sehen NUR aggregierte Daten, nie individuelle Health Data
**Rationale:** GDPR Compliance. Member-Trust. Gym braucht "30% der Members trainieren <2x/Woche" nicht "Hans hat gestern nur 1200 kcal gegessen". Individualdaten nur wenn Member explizit teilt.

### 4. White-Label als Enterprise Feature (nicht Standard)
**Decision:** Custom Branding nur im Enterprise Tier
**Rationale:** White-Label ist teuer (Custom Builds, Support, Updates). Enterprise-Gyms (20+ Locations) zahlen €499+/mo und erwarten Custom Branding. Kleine Gyms brauchen es nicht und würden den Preis nicht zahlen.

### 5. Supplement Brand B2B als höchstes Revenue Potential
**Decision:** Vertical 2 (Brands) hat höchste Priorität im Revenue-Plan
**Rationale:** 1st Phorm zeigt: App+Supplements = $500M+ möglich. Kein Kanal bietet In-Context Placement für aktive Fitness-User. Y3 Forecast: $7.7M ARR nur aus Brands. Gyms und Corporate sind slower-burn.

### 6. Employee App = Lumeos mit Einschränkungen (kein separates Product)
**Decision:** Corporate Wellness nutzt die Lumeos App mit Config-Layer (nicht separate App)
**Rationale:** Eine Codebase, weniger Maintenance. Employees bekommen eine voll funktionale Fitness-App (nicht ein Corporate-Tool das niemand nutzt). Toggle-System: Company kann Module an/ausschalten. Engagement wird höher weil die App auch privat nützlich ist.

---

## 🚀 Lumeos B2B USP

### Primary USP: "The Only B2B Fitness Platform That Gives Partners Access to the FULL Health Picture — Training, Nutrition, Recovery, Supplements, and Medical"

Mindbody gibt Gyms: Bookings + Payments.
Virtuagym gibt Gyms: Workouts + Basic Nutrition.
**Lumeos gibt Gyms: Everything — und dem Member eine App die er tatsächlich nutzt.**

### Secondary USPs

1. **Member Retention Engine für Gyms**
   - "Member X hat diese Woche nicht trainiert + Recovery Score unter 40% → Retention Risk"
   - Automated Re-Engagement: Push Notification, Coach Message, Special Offer
   - **ROI:** 5 verhinderte Kündigungen/mo × €50/mo = €250 saved > €199 Abo-Kosten

2. **In-Context Product Placement für Supplement Brands**
   - User trackt Supplement-Stack → "Dir fehlt Creatine" → Brand-Empfehlung
   - CPA $5-15 vs. Instagram $20-30 (50-75% günstiger)
   - **EINZIGER Kanal dieser Art weltweit**

3. **Corporate Wellness mit echtem Engagement**
   - Employee bekommt Lumeos App (nicht ein langweiliges Corporate-Portal)
   - App ist auch privat nützlich → Engagement >50% (vs. <30% bei Standard-Programmen)
   - Aggregated Analytics für HR (GDPR-compliant)

4. **API-First für Integration**
   - REST API + Webhooks für jede Integration
   - Magicline, Mindbody, Glofox ready
   - Custom Integrations für Enterprise

### Warum Lumeos gewinnt
| Kriterium | Mindbody | Virtuagym | Magicline | 1st Phorm | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Gym Management | ✅ | ✅ | ✅ | ❌ | 🟡 (via Integration) |
| Member Training | ❌ | ✅ | ❌ | 🟡 | ✅ (Deep) |
| Member Nutrition | ❌ | 🟡 (Basic) | ❌ | 🟡 | ✅ (138 Micros (BLS)) |
| Member Recovery | ❌ | ❌ | ❌ | ❌ | ✅ |
| Supplements | ❌ | ❌ | ❌ | ✅ (own brand) | ✅ (Platform) |
| Medical/Bloodwork | ❌ | ❌ | ❌ | ❌ | ✅ |
| Brand Partnerships | ❌ | ❌ | ❌ | ❌ | ✅ |
| Corporate Wellness | ❌ | 🟡 | ❌ | ❌ | ✅ |
| Open API | ✅ | 🟡 | ✅ | ❌ | ✅ |
