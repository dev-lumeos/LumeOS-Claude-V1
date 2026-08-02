# Lumeos Enhanced Supplements Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **6 Competitors analysiert:** CycleVitals, Anabolyx, TRT Tracker iOS, PeptIQ, Regimen, Web Plotters (steroidplotter.com, steroidsplotter.com)
- **Markt:** Kein offizieller Markt — "grey market" von 5-10M Users weltweit die PEDs, TRT, SARMs, Peptide nutzen
- **TRT allein:** $7B+ globaler Markt (2025), schnell wachsend durch Telemedizin-Kliniken

### Kritische Gaps
1. **Alle existierenden Tools sind primitiv** — CycleVitals ist das "beste" und ist trotzdem nur ein Cycle Planner ohne echte Integration
2. **KEIN Tool verbindet PED-Tracking mit Bloodwork** — User tracken Cycles in einer App und Bluttests in Excel. Die offensichtliche Connection fehlt
3. **Harm Reduction hat kein Tool** — Hepatotoxizität, Lipid-Profil, Blutdruck-Monitoring während Cycles ist lebensnotwendig und existiert NIRGENDWO integriert
4. **Privacy = #1 Concern** — User wollen NICHT dass ihre PED-Daten in einer Cloud landen. Strafbarkeit in vielen Ländern
5. **Peptide-Tracking ist komplett unbesetzt** — BPC-157, TB-500, GH Secretagogues etc. haben KEIN dediziertes Tracking-Tool

### Competitive Intelligence
- **CycleVitals:** Bestes Cycle Planning Tool, Compound-Library, Half-Life Berechnung, aber: kein Bloodwork, keine Recovery-Integration
- **Anabolyx:** iOS-only, basisches Compound-Tracking, schlechte Reviews, abandoned
- **TRT Tracker iOS:** Simpel, nur Injection Reminder + Dose Log, nützlich aber limitiert
- **PeptIQ:** Peptide-fokussiert, Dosierungsrechner, aber: Beta-Stadium, wenig User
- **Web Plotters:** steroidplotter.com = Standard-Tool für Blood Level Visualization, aber: keine App, keine Integration, nur Grafiken
- **Regimen:** Generischer Supplement/Medication Tracker, nicht PED-spezifisch

---

## 🏗️ Lumeos Enhanced Supplements — Architektur

### System-Übersicht
```
┌──────────────────────────────────────────────────┐
│         ENHANCED SUPPLEMENTS MODULE               │
│         (Premium, Privacy-First)                  │
├──────────────┬───────────────────────────────────┤
│  Compound    │  Cycle Planner                     │
│  Database    │  (Stacks, Doses, Duration)         │
│  (AAS, SARMs,│                                    │
│   Peptides,  │  Blood Level Calculator            │
│   TRT, GH)   │  (Half-Life Visualization)         │
├──────────────┼───────────────────────────────────┤
│  Injection   │  Health Monitoring                 │
│  Tracker     │  (Bloodwork Integration)           │
│  (Sites,     │                                    │
│   Rotation,  │  ┌──────────────────────────────┐ │
│   Schedule)  │  │ Liver: AST, ALT, GGT         │ │
│              │  │ Lipids: HDL, LDL, Trig       │ │
│              │  │ Hormones: Test, E2, SHBG     │ │
│              │  │ Blood: Hematocrit, RBC       │ │
│              │  │ Kidney: Creatinine, BUN      │ │
│              │  │ Cardiac: BP, CRP             │ │
│              │  └──────────────────────────────┘ │
├──────────────┴───────────────────────────────────┤
│  Privacy Layer (Local-Only Default, E2E Optional) │
├──────────────────────────────────────────────────┤
│  Cross-Module: Medical ↔ Training ↔ Recovery      │
└──────────────────────────────────────────────────┘
```

### Compound Database
```typescript
interface Compound {
  id: string;
  name: string;                    // "Testosterone Enanthate"
  aliases: string[];               // ["Test E", "Testo E"]
  category: 'AAS' | 'SARM' | 'Peptide' | 'GH' | 'AI' | 'SERM' | 'Other';
  
  pharmacokinetics: {
    halfLife: number;              // hours
    activeLife: number;            // hours
    detectionTime?: number;        // days (for tested athletes)
  };
  
  administration: {
    route: 'intramuscular' | 'subcutaneous' | 'oral' | 'transdermal' | 'nasal';
    frequency: string;             // "2x/week", "daily"
    typicalDose: { min: number; max: number; unit: string };
  };
  
  monitoring: {
    bloodworkFrequency: string;    // "Every 6-8 weeks"
    keyMarkers: string[];          // ["AST", "ALT", "Hematocrit", "E2"]
    warnings: string[];            // ["Monitor hematocrit >54%"]
    interactions: CompoundInteraction[];
  };
  
  legalStatus: {
    classification: string;        // "Schedule III (US)"
    note: string;                  // Disclaimer
  };
}
```

### Blood Level Calculator
```
User inputs:
  Compound: Testosterone Enanthate
  Dose: 250mg
  Frequency: Every 3.5 days
  Start Date: 2026-01-01

System calculates:
  → Absorption curve (based on ester half-life)
  → Steady-state concentration
  → Peak and trough levels
  → Visual graph (like steroidplotter.com but in-app)
  
Cross-Module:
  → Overlay actual bloodwork Testosterone values
  → "Your measured Test was 1200 ng/dL — model predicted 1150 → good correlation"
  → "Your measured Test was 600 ng/dL — model predicted 1150 → possible underdosed product"
```

---

## 👤 Persona Design

### Persona 1: "TRT Patient Tom" — Prescribed TRT (40%)
- **Alter:** 42, männlich, TRT verschrieben von Arzt (100-200mg/week)
- **Ziel:** Injection Schedule, Bloodwork Monitoring, Dose Optimization
- **Pain Points:** Arzt checkt Blut nur alle 6 Monate, will selber Trends sehen
- **Feature-Needs:** Injection Reminder, Dose Log, Bloodwork Trends (Test, E2, Hematocrit), Doctor Export
- **Zahlungsbereitschaft:** $9.99/mo (medizinische Notwendigkeit)
- **Privacy Concern:** Mittel (verschrieben, legal)

### Persona 2: "Bodybuilder Boris" — Erfahrener User (25%)
- **Alter:** 30, männlich, nutzt AAS seit 5+ Jahren
- **Ziel:** Cycle Planning, Harm Reduction, Bloodwork Monitoring
- **Pain Points:** Plant Cycles in Notes-App, Bloodwork in Excel, keine Integration
- **Feature-Needs:** Cycle Planner, Compound Library, Blood Level Calculator, Health Monitoring Dashboard
- **Zahlungsbereitschaft:** $19.99/mo (investiert bereits $500+/mo in Compounds)
- **Privacy Concern:** SEHR HOCH (illegal in den meisten Ländern)

### Persona 3: "Biohacker Björn" — Peptide/GH User (20%)
- **Alter:** 35, männlich, nutzt BPC-157, Ipamorelin, MK-677
- **Ziel:** Dosierung tracken, Wirkung messen, Stacks optimieren
- **Pain Points:** Kein Tool für Peptide-Tracking, dosiert nach Reddit-Posts
- **Feature-Needs:** Peptide Library, Dosing Calculator, Reconstitution Calculator, Injection Site Rotation
- **Zahlungsbereitschaft:** $9.99/mo
- **Privacy Concern:** Hoch (Grauzone)

### Persona 4: "First Timer Felix" — Erster Cycle (15%)
- **Alter:** 24, männlich, plant ersten Testosterone-Cycle
- **Ziel:** Sichere erste Experience, PCT planen, Bloodwork verstehen
- **Pain Points:** Überfordert von Reddit/Forum-Infos, widersprüchliche Empfehlungen
- **Feature-Needs:** Beginner Guides, Pre-Cycle Bloodwork Checklist, PCT Planner, Harm Reduction Warnings
- **Zahlungsbereitschaft:** $9.99/mo (für Sicherheit)
- **Privacy Concern:** SEHR HOCH

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing (Premium Module, Opt-in)

| Tier | Preis | Features |
|------|-------|----------|
| **Basic** | $9.99/mo | Compound Database, Injection Tracker, Dose Log, Basic Reminders |
| **Pro** | $19.99/mo | + Blood Level Calculator, Full Health Monitoring, Cycle Planner, PCT Planner, Cross-Module Integration |

Enhanced Supplements ist ein **Premium Add-on** zum Lumeos Abo — nicht im Standard Plus/Pro enthalten.

### Revenue Streams
1. **Premium Subscriptions** (90%) — Core Revenue
2. **Bloodwork Lab Partnerships** (10%) — "Time for mid-cycle bloodwork → Order at [Lab Partner]" (Affiliate)

### Kein Brand Partnership / Kein Advertising
**Decision:** KEINE Supplement-Brand-Werbung im Enhanced Module
**Rationale:** Ethisch und legal problematisch. Keine PED-Werbung. Harm Reduction > Monetization. Trust ist alles in diesem Segment.

---

## 🔧 Technical Architecture

### Privacy Architecture (CRITICAL)
```
DEFAULT: 100% Local Storage
  → SQLite on device
  → No cloud sync
  → No analytics
  → No telemetry
  → Lumeos kann Daten NICHT sehen

OPTIONAL: E2E Encrypted Backup
  → User-held encryption key
  → Backup to iCloud/Google Drive (encrypted blob)
  → Lumeos kann Daten NICHT sehen
  → Restoreable on new device

OPTIONAL: Share with Doctor
  → Selective export (per compound, per time range)
  → PDF or FHIR format
  → Time-limited access token
  → Audit log

NEVER:
  → Aggregated analytics on compounds
  → User behavior tracking in this module
  → Cloud-stored compound data (even encrypted by us)
  → Law enforcement data sharing (we have nothing to share)
```

### Compound Database (Offline-First)
```
Database ships WITH the app (bundled)
  → ~500 compounds (AAS, SARMs, Peptides, GH, AI, SERM, PCT)
  → Updated via app updates (not API calls)
  → Zero network requests for compound lookups
  → No server logs of what user searches

Sources:
  → PubMed/PubChem (pharmacokinetics)
  → Clinical dosing guidelines (TRT)
  → Community-validated data (reddit.com/r/steroids wiki, carefully verified)
  → Half-life data from peer-reviewed papers
```

### Injection Site Tracker
```typescript
interface InjectionLog {
  compound: CompoundId;
  dose: number;
  unit: 'mg' | 'ml' | 'IU' | 'mcg';
  site: InjectionSite;           // 'left_glute' | 'right_delt' | 'left_quad' | etc.
  date: Date;
  notes?: string;                // "Slight pip"
  photo?: LocalMediaRef;         // Stored LOCAL only
}

// Rotation Tracker
interface SiteRotation {
  sites: InjectionSite[];
  lastUsed: Map<InjectionSite, Date>;
  recommended: InjectionSite;     // Next recommended site
  history: InjectionLog[];
  warnings: string[];             // "Left glute used 3x in a row — rotate!"
}
```

### Health Monitoring Dashboard
```
┌─────────────────────────────────────────┐
│  HEALTH MONITORING (Enhanced)            │
├──────────┬──────────┬───────────────────┤
│ 🟢 Liver  │ 🟡 Lipids │ 🟢 Hormones      │
│ AST: 35   │ HDL: 38   │ Test: 1200       │
│ ALT: 40   │ LDL: 145  │ E2: 45           │
│ GGT: 30   │ Trig: 120 │ SHBG: 22         │
├──────────┼──────────┼───────────────────┤
│ 🟢 Blood  │ 🟢 Kidney │ 🟡 Cardiac        │
│ HCT: 48%  │ Creat: 1.0│ BP: 135/82       │
│ RBC: 5.2  │ BUN: 18   │ CRP: 2.1         │
└──────────┴──────────┴───────────────────┘
│ ⚠️ Warning: HDL low (optimal >45)        │
│ ⚠️ Warning: BP elevated (optimal <130/80) │
│ 📋 Recommendation: Cardio 3x/week,       │
│    Fish Oil 3g/day, recheck in 4 weeks   │
└──────────────────────────────────────────┘
```

---

## ⚖️ Key Design Decisions

### 1. Privacy = Non-Negotiable Default
**Decision:** 100% Local Storage by Default, KEIN Cloud, KEIN Analytics
**Rationale:** PED-Nutzung ist in den meisten Ländern illegal. User vertrauen uns ihre sensibelsten Daten an. Ein einziger Data Breach würde das Modul (und Lumeos Reputation) zerstören. Zero-Knowledge by Design.

### 2. Harm Reduction, nicht Promotion
**Decision:** Modul fokussiert auf Sicherheit, Monitoring, und Harm Reduction — nicht auf Optimierung von Cycles
**Rationale:** "How to get the most gains" ist NICHT unser Ansatz. "How to use as safely as possible if you're going to use anyway" IST unser Ansatz. Medizinische Disclaimers überall. "Consult your doctor" prominent.

### 3. Keine PED-Werbung / Keine Source Links
**Decision:** KEINE Links zu Quellen, KEINE Werbung für Compounds, KEINE Brand Partnerships
**Rationale:** Legal und ethisch notwendig. Wir sind ein Tracking-Tool, kein Dealer. Selbst wenn Revenue-Potenzial da wäre — die rechtlichen und reputatorischen Risiken sind zu hoch.

### 4. Compound DB shipped offline (nicht API)
**Decision:** Gesamte Compound-Datenbank wird mit der App ausgeliefert
**Rationale:** Zero Network Requests = Zero Server Logs = Zero Datenspur. User's Compound-Suchanfragen verlassen nie das Gerät. Updates kommen mit App-Updates.

### 5. Bloodwork Integration als Kern-Feature
**Decision:** Enhanced Supplements integriert TIEF mit Medical Module (Bloodwork)
**Rationale:** DAS ist der Mehrwert vs. steroidplotter.com. "Dein Leberwert steigt seit du Oral XYZ nimmst" = lebensrettendes Feature. Overlay: modellierte Blood Levels vs. tatsächliche Blutwerte.

### 6. Opt-in Premium Module (nicht Standard)
**Decision:** Enhanced Supplements ist ein separates Premium Add-on, NICHT im Standard Plus/Pro
**Rationale:** Nicht jeder Lumeos User nutzt PEDs. Wer es nutzt, zahlt Premium ($9.99-19.99/mo extra). Separates Modul = separates Marketing = separates Legal Review. Schützt auch die Lumeos Haupt-Brand.

---

## 🚀 Lumeos Enhanced Supplements USP

### Primary USP: "The Only Tool That Connects Your Cycle to Your Bloodwork — Safely and Privately"

steroidplotter.com zeigt dir eine Kurve.
Lumeos zeigt dir:
- Die Kurve **UND** deine echten Blutwerte darüber gelegt
- **Leberwerte-Trend** seit Cycle-Start
- **Lipid-Profil** Verschlechterung mit konkreter Empfehlung
- **Hematocrit-Warning** bevor es gefährlich wird
- **E2-Management** basierend auf tatsächlichen Werten (nicht Reddit-Raten)

**Alles lokal. Alles privat. Kein Cloud. Kein Risiko.**

### Secondary USPs

1. **Bloodwork × Cycle Overlay**
   - "Dein modelliertes Test-Level: 1150 ng/dL. Gemessen: 1200 ng/dL. ✅ Good correlation."
   - "Dein AST stieg von 25 auf 65 seit Woche 4 → Oral Compound ist hepatotoxisch → Consider switching"
   - KEIN anderes Tool kann das

2. **Injection Site Rotation**
   - Visueller Body Map: wo hast du zuletzt injiziert
   - Rotation Reminder: "Links Glute wurde 3x hintereinander genutzt"
   - Lokale Reaktions-Tracker (PIP, Rötung)

3. **PCT Planner**
   - Basierend auf Cycle-Compounds + Half-Lives
   - Automatischer PCT-Start-Zeitpunkt
   - Bloodwork-Milestones: "Pre-PCT Blut, 4-Week Blut, 8-Week Blut"

4. **Peptide Library (First-of-its-kind)**
   - BPC-157, TB-500, Ipamorelin, CJC-1295, MK-677 etc.
   - Reconstitution Calculator (BAC Water + Peptide → Dose per IU)
   - Dosing Protocols
   - KEIN Tool bietet das

5. **Zero-Knowledge Privacy**
   - Daten verlassen NIEMALS dein Gerät (Default)
   - Kein Server Log, kein Analytics, kein Telemetry
   - Optional: E2E Encrypted Backup (DU hältst den Schlüssel)
   - Audit-proof: Lumeos hat buchstäblich NICHTS herauszugeben

### Warum Lumeos gewinnt
| Kriterium | steroidplotter | CycleVitals | TRT Tracker | PeptIQ | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Blood Level Visualization | ✅ | ✅ | ❌ | ❌ | ✅ |
| Compound Database | 🟡 | ✅ | ❌ | 🟡 (Peptides) | ✅ (ALL) |
| Injection Tracker | ❌ | 🟡 | ✅ | ❌ | ✅ |
| Bloodwork Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Health Monitoring | ❌ | ❌ | ❌ | ❌ | ✅ |
| PCT Planner | ❌ | 🟡 | ❌ | ❌ | ✅ |
| Peptide Support | ❌ | ❌ | ❌ | ✅ | ✅ |
| Privacy (Local-Only) | 🟡 (Web) | ❌ | 🟡 | ❌ | ✅ |
| Training Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Price** | Free | $5/mo | $3/mo | Free | **$9.99-19.99/mo** |
