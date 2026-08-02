# Lumeos Wallet & Monetization — Konzept

**Date:** 2026-02-17
**Status:** Konzept definiert — Prozentsätze/Preise noch offen

---

## Kernprinzip: Abo = Voucher im Wallet

```
User zahlt €X/mo Abo
    → Abo-Geld ist WEG (Zahlung für Membership)
    → Lumeos gibt als Goodwill einen Voucher über €X ins Wallet
    → Voucher = Geschenk von Lumeos, nicht "sein Geld das wir halten"
    → Voucher valide solange User Member ist
    → Kündigung → Voucher-Guthaben verfällt (war nie sein Geld)
    → User bezahlt ALLES über Wallet (Voucher + ggf. Aufladungen)
    → Lumeos verdient an jeder Transaktion (% TBD)
```

### Wichtig: Der Voucher ist NICHT das Geld des Users

Das Abo wird bezahlt — fertig, Geld gehört Lumeos. Der Voucher im Wallet ist ein **Goodwill-Benefit** — ein Geschenk als Dankeschön für die Membership. Vergleichbar mit:
- Airline Miles: Du zahlst fürs Ticket, die Miles sind ein Bonus
- Cashback-Programme: Du zahlst den vollen Preis, Cashback ist Goodwill
- Gym-Getränke-Flat: Du zahlst Mitgliedschaft, Wasser/Kaffee ist inklusive

Der User hat keinen Anspruch auf Rückzahlung, Auszahlung oder Erstattung des Vouchers. Es ist Lumeos' Goodwill, nicht sein Geld.

### Warum Voucher?
1. **Kein E-Geld:** Goodwill-Voucher ≠ E-Geld. Keine E-Geld-Lizenz nötig. Lumeos verwaltet kein Kundengeld — es verschenkt Kaufkraft.
2. **Kein Auszahlungs-Anspruch:** Es war nie das Geld des Users. Kein Cashout, kein Erstattungsanspruch.
3. **Kein Verfall-Problem:** Goodwill erlischt wenn die Geschäftsbeziehung (Membership) endet. Logisch und fair.
4. **Retention-Booster:** "Ich hab noch €35 Voucher im Wallet" → User bleibt Member um den Goodwill zu nutzen. Nicht manipulativ — er bekommt echten Value dafür.

### Die Killer-Message an den User

```
Ohne Lumeos:
  €9.99/mo  MyFitnessPal (Nutrition)         — weg
  €14.99/mo Fitbod (Training)                — weg  
  €5.99/mo  MyTherapy (Meds/Supplements)     — weg
  €30/mo    WHOOP (Recovery)                 — weg
  = €60+/mo für 4 Apps die sich nicht kennen — ALLES WEG

Mit Lumeos:
  €X/mo     Lumeos (alles in einem)
  = Kaufkraft für Proteinshake, Trainer, Supplements, Programmes
  = NICHT WEG sondern Budget für dein Hobby
```

Jede andere App ist ein Kostenpunkt. Lumeos ist ein Budget.
Der User spart gegenüber 4 Einzelapps UND bekommt Kaufkraft obendrauf.

### Warum überhaupt Abo?
1. **Zugangsschlüssel:** Nur wer Abo zahlt hat Zugang zur Plattform. Kein Abo = kein Lumeos.
2. **Liquiditätspumpe:** Je mehr Voucher im Wallet, desto mehr wird ausgegeben.
3. **Transaktionsvolumen:** Mehr Voucher-Nutzung → mehr Transaktionsgebühren → mehr Revenue.
4. **Kein Paywall-Schmerz:** "Du zahlst nicht für eine App, du bekommst Kaufkraft für dein Hobby."
5. **Network Effect:** Mehr zahlende User → mehr Transaktionen → mehr B2B-Partner → mehr Value → mehr User.

---

## Wallet-Architektur

### Wallet-Flüsse

```
┌─────────────────────────────────────────────────────────┐
│                    LUMEOS WALLET                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  VOUCHER-EINGANG:                                        │
│  · Abo-Zahlung → Lumeos Goodwill-Voucher im Wallet       │
│    (Abo-Geld gehört Lumeos, Voucher = Geschenk)          │
│  · Manuelle Aufladung (€5, €10, €25, €50, €100)         │
│    (Kauf eines Vouchers — gleiches Prinzip)              │
│  · B2B Einnahmen: Coach/Gym/Brand (echtes Guthaben,     │
│    auszahlbar via Stripe Connect)                        │
│                                                           │
│  AUSGABEN (Geld raus):                                   │
│  · AI-Features: MealCam Scan, AI Coach Anfragen          │
│  · Gym: Proteinshake, Tagespass, Kurse                   │
│  · Trainer/Coach: Sessions, Programme, Check-ins         │
│  · Marketplace: Training Programme, Meal Plans, Stacks   │
│  · Supplements: Kauf über Lumeos Marketplace              │
│  · Premium Module: Enhanced Supplements, Medical etc.     │
│                                                           │
│  AUSZAHLUNG (NUR B2B — User können NICHT auszahlen):     │
│  · Gym → Bankkonto (Stripe Connect)                      │
│  · Coach/Trainer → Bankkonto (Stripe Connect)            │
│  · Supplement Brand → Bankkonto (Stripe Connect)         │
│  · Content Creator → Bankkonto (Stripe Connect)          │
│                                                           │
│  ⚠️ User-Wallet = Voucher-System (geschlossen):          │
│  · Voucher fließen rein (Abo, Aufladung)                 │
│  · Voucher werden eingelöst (AI, Gym, Coach, Marketplace)│
│  · Voucher werden NICHT ausgezahlt                       │
│  · Voucher verfallen bei Kündigung der Membership        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Transaktionsgebühr (Revenue für Lumeos)

```
Jede Wallet→Wallet Transaktion:
  Lumeos nimmt X% (TBD)
  
  Beispiele:
  · Member kauft Proteinshake im Gym für €3.00
    → Gym bekommt €3.00 - X%
    → Lumeos bekommt X%
    
  · Member bucht Personal Training für €50
    → Trainer bekommt €50 - X%
    → Lumeos bekommt X%
    
  · Member kauft Supplement Stack für €35
    → Brand bekommt €35 - X%
    → Lumeos bekommt X%

  Prozentsätze nach Kategorie (TBD):
  · Gym Transactions: X% (TBD)
  · Coach/Trainer: X% (TBD)  
  · Marketplace (Digital): X% (TBD)
  · Marketplace (Physical): X% (TBD)
  · Supplement Brands: X% (TBD)
  · AI Features (MealCam, AI Coach): Fixbetrag pro Nutzung (TBD)
```

---

## AI-Feature Micro-Transactions

Sachen die Lumeos Geld kosten (API Calls) werden dem User-Wallet belastet:

| Feature | Kosten für Lumeos | Wallet-Belastung | Logik |
|---------|-------------------|------------------|-------|
| **MealCam Scan** | ~€0.01/Scan (Claude Vision) | TBD/Scan | Nutzt du's → zahlst du. Nutzt du's nicht → kostet nichts |
| **AI Coach Anfrage** | ~€0.005-0.02/Anfrage | TBD/Anfrage | Je nach Komplexität (Haiku vs Sonnet) |
| **AI Workout Generation** | ~€0.01/Generation | TBD/Generation | Personalisierter Plan |
| **PDF Bloodwork OCR** | ~€0.02/Upload | TBD/Upload | Lab Report Import |
| **Knowledge Search** | ~€0.002/Query | Evtl. inklusive | RAG-basierte Fragen |

**Prinzip:** Transparent und nachvollziehbar. User sieht im Wallet: "MealCam Scan -€0.0X". Wer die AI-Features nicht nutzt, zahlt auch nicht dafür. Wer sie intensiv nutzt, zahlt fair.

**Alternative:** Bestimmte Anzahl AI-Calls pro Monat im Abo inklusive (z.B. 50 MealCam Scans), darüber hinaus Wallet. → Noch zu entscheiden.

---

## Modul-Monetisierung

### Nicht alles ist gratis

Basis-Features sind großzügig, aber **Profis zahlen gerne für eine Komplettlösung** statt für 5 separate Apps. Einige Module/Features sind Premium:

| Bereich | Free/Basis | Premium (Wallet/Abo) | Logik |
|---------|-----------|---------------------|-------|
| **Nutrition** | Food Logging, Macros, Barcode | MealCam AI, Mikro-Dashboard (Tier 2+3), Meal Plans | AI kostet, Tiefe hat Wert |
| **Training** | Workout Logging, Exercise Library | AI Workout Generator, Periodisierung, 3D Models | AI kostet, Profi-Features |
| **Supplements** | Stack Management, Reminders | Interaction Checker, Gap Analysis, Timing Optimizer | Intelligence hat Wert |
| **Recovery** | Sleep Logging, Subjective | HRV Analysis, Deload AI, Muscle Recovery Map | Wearable-Integration, AI |
| **Medical** | Basic Biomarker Tracking | PDF OCR Import, Optimal Ranges, Correlation Engine | Analyse hat Wert |
| **Enhanced Supplements** | — | Komplett Premium | Nische, hohe Zahlungsbereitschaft |
| **Goals** | Basic Goal Setting | Adaptive TDEE, Phase Management, Cross-Module Goals | Profi-Algorithmen |
| **AI Coach** | Tägliche Summary (basic) | Volle Konversation, Cross-Module Analyse, Persona | AI kostet |
| **Coach Module** | — | B2B/Profi-Tool | Business-Tool |
| **Gym Module** | — | B2B-Tool | Business-Tool |

**Wichtig:** Genaue Feature-Aufteilung Free vs. Premium noch zu definieren. Prinzip: Genug gratis um den Wert zu erleben, Premium für Power User die gerne zahlen.

---

## B2B Monetisierung

### Zwei getrennte Flüsse

```
B2B-Partner (Gym, Coach, Brand):

  FLUSS 1: Infrastruktur-Abo (normaler Payment-Kanal)
  ─────────────────────────────────────────────────
  · Monatliche Rechnung / Stripe Subscription
  · Zahlt für: Gym Module, Coach Dashboard, Vendor Portal
  · Wird NICHT dem Wallet gutgeschrieben
  · Klassisches SaaS-Abo, nichts Besonderes
  
  FLUSS 2: Revenue-Wallet (Einnahmen aus Transaktionen)
  ─────────────────────────────────────────────────
  · Member kauft Proteinshake → Revenue ins Gym-Wallet
  · Client zahlt PT Session → Revenue ins Coach-Wallet
  · User kauft Supplement → Revenue ins Brand-Wallet
  · Wallet ist AUSZAHLBAR (Stripe Connect)
  · ODER: im Ökosystem nutzbar (Supplements einkaufen,
    Equipment bestellen, Werbung schalten etc.)
```

### B2B Pricing (Infrastruktur-Abo)

#### Gyms
- Monatliche Gebühr für Lumeos Gym Module (Tiered, TBD)
- Plus: Transaktionsgebühr auf alle Member-Transaktionen (% TBD)
- Value: Member Retention Dashboard, Trainer Tools, Equipment Tracking, Program Distribution

#### Coaches / Personal Trainer → KEIN B2B, sondern User mit Profi-Tools

**Coach = User mit erweiterten Tools.** Kein separater B2B-Kanal.

```
Coach zahlt Lumeos Abo (wie jeder User)
  → Voucher ins Wallet (Goodwill)
  → PLUS: Kickback auf sein Abo (z.B. 50%) als Voucher ins Wallet
  → Coach-Tools (Dashboard, Client Management etc.) kosten extra
     (entweder höherer Abo-Tier oder Wallet-Belastung, TBD)

Coach verdient:
  → Client-Abos über Lumeos → Lumeos nimmt Marge (% TBD)
  → Marketplace-Verkäufe (Programme, Pläne) → Lumeos nimmt Marge (% TBD)
  → Einnahmen landen im Revenue-Wallet → auszahlbar

Coach Wallet = Hybrid:
  · Voucher-Anteil (Abo-Goodwill + Kickback) → nicht auszahlbar
  · Revenue-Anteil (Einnahmen von Clients/Marketplace) → auszahlbar
```

Kickback-Verteilschlüssel (Beispiel, TBD):
- Coach zahlt €29.99/mo Abo
- Bekommt €29.99 Voucher (Goodwill, wie jeder User)
- Bekommt zusätzlich ~€15 Kickback-Voucher (50% seines Abos)
- = Coach hat €45 Voucher/mo zum Ausgeben + seine Revenue-Einnahmen

#### Supplement Brands
- Monatliche Gebühr für Vendor Portal (TBD)
- Plus: Transaktionsgebühr auf Verkäufe (% TBD)
- Plus: Placement-Gebühr für In-Context Recommendations
- Value: Direct-to-Consumer Kanal in Kontext aktiver Fitness-User

#### Corporate Wellness
- Enterprise Pricing (TBD)
- Per-Employee Gebühr
- Value: Employee Health Platform, Analytics, ROI Reports

### B2B Revenue-Wallet Nutzung

B2B-Partner können ihr Revenue-Wallet für beides nutzen:

| Aktion | Beispiel |
|--------|---------|
| **Auszahlen** | Gym lässt sich monatlich €5K auf Bankkonto auszahlen |
| **Supplements einkaufen** | Gym kauft Protein-Pulver für Theken-Verkauf über Lumeos Marketplace |
| **Equipment** | Coach kauft Resistance Bands über Marketplace |
| **Werbung** | Brand schaltet In-Context Placement für seine Produkte |
| **Reinvestieren** | Coach kauft Weiterbildungs-Programm eines anderen Coaches |

---

## Revenue-Streams Übersicht

```
┌─────────────────────────────────────────────────────┐
│              LUMEOS REVENUE                           │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1. TRANSACTION FEES (Kern-Revenue)                  │
│     Jede Wallet→Wallet Transaktion: X%               │
│     · Gym ↔ Member                                   │
│     · Coach ↔ Client                                 │
│     · Brand ↔ Consumer                               │
│     · Creator ↔ Buyer (Marketplace)                  │
│                                                       │
│  2. AI MICRO-TRANSACTIONS                            │
│     MealCam, AI Coach, OCR, Workout AI               │
│     → Wallet-Belastung pro Nutzung                   │
│                                                       │
│  3. B2B SUBSCRIPTIONS (normaler Payment, KEIN Wallet) │
│     Gym Module, Coach Module, Vendor Portal           │
│     → Direkte Stripe-Zahlung für Infrastruktur       │
│                                                       │
│  4. PREMIUM MODULES                                  │
│     Enhanced Supplements, Medical Deep, etc.          │
│     → Freischaltung über Wallet/Abo                  │
│                                                       │
│  5. BRAND PLACEMENT                                  │
│     Supplement Brands: In-Context Recommendations     │
│     → Placement-Gebühr                               │
│                                                       │
│  NICHT Revenue:                                      │
│  · Abo-Zahlung (= geht ins User-Wallet)             │
│  · Werbung (keine Ads, nie)                          │
│  · Datenverkauf (nie, Privacy-First)                 │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Datenmodell

```sql
-- Wallet
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,            -- user_id, gym_id, vendor_id, coach_id
  owner_type TEXT NOT NULL,           -- 'user', 'gym', 'vendor', 'coach'
  voucher_balance_cents INTEGER DEFAULT 0,  -- Goodwill (Abo + Kickback), nicht auszahlbar
  revenue_balance_cents INTEGER DEFAULT 0,  -- Einnahmen (Coach/Creator/B2B), auszahlbar
  currency TEXT DEFAULT 'EUR',
  can_payout BOOLEAN DEFAULT false,         -- true wenn revenue_balance > 0 erlaubt
  -- can_payout wird aktiviert sobald User Coach/Creator wird oder B2B Account
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alle Transaktionen
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Wer zahlt, wer bekommt
  from_wallet_id UUID REFERENCES wallets(id),  -- NULL bei Stripe-Einzahlung
  to_wallet_id UUID REFERENCES wallets(id),    -- NULL bei Auszahlung
  
  -- Beträge
  gross_amount_cents INTEGER NOT NULL,          -- Bruttobetrag
  fee_cents INTEGER DEFAULT 0,                  -- Lumeos Transaktionsgebühr
  net_amount_cents INTEGER NOT NULL,            -- Nettobetrag (gross - fee)
  
  -- Kontext
  type TEXT NOT NULL,                           -- deposit, purchase, payout, 
                                                -- ai_usage, subscription_credit,
                                                -- gym_purchase, coach_payment,
                                                -- marketplace_purchase
  reference_type TEXT,                          -- mealcam_scan, ai_coach_query,
                                                -- training_program, meal_plan,
                                                -- supplement_purchase, gym_product,
                                                -- coach_session, etc.
  reference_id UUID,
  
  -- Payment Provider
  stripe_payment_id TEXT,                       -- bei Ein-/Auszahlung
  
  -- Meta
  description TEXT,                             -- "MealCam Scan", "Proteinshake @FitnessFirst"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Abo → Wallet Automatik
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,                           -- "Lumeos Basic", "Lumeos Pro"
  price_cents INTEGER NOT NULL,                 -- Monatspreis
  wallet_credit_cents INTEGER NOT NULL,         -- = price_cents (1:1)
  features JSONB,                               -- Freigeschaltete Module/Features
  ai_credits_included INTEGER DEFAULT 0,        -- z.B. 50 MealCam Scans/mo inklusive
  created_at TIMESTAMPTZ
);

-- B2B Infrastruktur-Abo (normaler Payment, KEIN Wallet)
CREATE TABLE b2b_subscriptions (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL,                       -- gym_id oder vendor_id
  owner_type TEXT NOT NULL,                     -- 'gym', 'vendor', 'coach'
  plan TEXT NOT NULL,                           -- 'free', 'pro', 'enterprise'
  price_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT                   -- direkte Stripe-Zahlung, nicht über Wallet
);

-- Wallet-Regeln:
--
-- JEDER User hat EIN Wallet mit ZWEI Salden:
--   voucher_balance_cents  → Goodwill (Abo + Kickback), nicht auszahlbar
--   revenue_balance_cents  → Einnahmen (Coach/Creator), auszahlbar
--
-- Normaler User:  voucher > 0, revenue = 0
-- Coach/Creator:  voucher > 0, revenue > 0 (verdient an Clients/Marketplace)
-- Gym (B2B):      voucher = 0, revenue > 0 (eigener Account, kein User-Abo)
-- Vendor (B2B):   voucher = 0, revenue > 0 (eigener Account, kein User-Abo)
--
-- Bei Ausgaben: Voucher wird ZUERST belastet, dann Revenue
-- Auszahlung: NUR revenue_balance, nie voucher_balance
```

---

## Noch zu definieren (TBD)

| Thema | Status | Nächster Schritt |
|-------|--------|-----------------|
| Abo-Preise (User) | ❓ | Tiers und Preise festlegen |
| Transaktionsgebühren pro Kategorie | ❓ | Prozentsätze pro Transaktionstyp |
| AI Micro-Transaction Preise | ❓ | Kosten pro MealCam/AI Coach/OCR |
| AI Credits im Abo inklusive? | ❓ | X Scans/Anfragen pro Monat free? |
| B2B Preise (Gym, Coach, Vendor) | ❓ | Tiered Pricing |
| Free vs. Premium Feature Split | ❓ | Exakte Feature-Grenzen pro Modul |
| B2B Auszahlungs-Zyklen | ❓ | Weekly/Monthly/On-Demand (nur B2B!) |
| Währungen | ❓ | EUR only? Multi-Currency? |
| Minimum Wallet Balance | ❓ | Kann Wallet negativ werden? |
| Refund Policy | ✅ Definiert | Voucher = Goodwill, nicht erstattbar. Abo-Geld gehört Lumeos. Kündigung = Voucher verfällt. |
| Voucher bei Kündigung | ✅ Definiert | Verfällt. Valide nur solange aktive Membership. |
| Rechtliche Prüfung | ❓ | Voucher-Modell vs. E-Geld-Richtlinie in DE/EU/TH prüfen |

---

## Vergleich: Alt → Neu

| Aspekt | Altes Konzept | Neues Konzept |
|--------|--------------|---------------|
| Abo | User zahlt für App-Zugang | **Abo = Wallet-Guthaben** |
| Paywalls | Feature-Paywalls (Free/Plus/Pro) | **Limiten auf kostspielige Features, Pro-Features für Profis** |
| Revenue | Abo-Einnahmen | **Transaktionsgebühren auf ALLE Wallet-Flüsse** |
| AI Features | Abo-Tier bestimmt Zugang | **Micro-Transactions aus Wallet** |
| B2B | Eigene Preisliste | **Infrastruktur-Gebühr + Transaktionsgebühr** |
| User-Gefühl | "Ich zahle für eine App" | **"Ich bekomme Kaufkraft als Member-Benefit"** |
| Lumeos Rolle | App-Anbieter | **Goodwill-Voucher-System + Payment-Infrastruktur** |
| Guthaben-Typ | Echtes Geld des Users | **Goodwill-Voucher (User) / Revenue (B2B)** |
| Eigentum | User hat Geld-Anspruch | **Lumeos' Goodwill, kein User-Anspruch** |
| Bei Kündigung | Nichts passiert | **Voucher verfällt (war nie sein Geld)** |

---

*Konzept definiert, Details TBD — Stand: 2026-02-17*
