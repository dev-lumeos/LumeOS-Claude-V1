# Coach Module — Product Requirements Document

**Date:** 2026-02-24
**Status:** PRD Complete — Build Pending
**Module:** Human Coach + AI Butler 🏋️🧠
**Scope:** Menschlicher Coach mit AI-Assistenz + Coach Butler (AI als App-Interface)

---

## Vision

> **"Der Coach ist nicht nur ein Mensch der dir sagt was du tun sollst — er ist ein ganzes System. Der menschliche Coach für die Beziehung, der AI Butler für die Execution."**

Lumeos verbindet zwei Welten:
1. **Menschlicher Coach** — Beziehung, Expertise, Accountability, Contest Prep, Enhanced Protocol Management
2. **AI Coach Butler** — 24/7 App-Interface, Voice/Text Meal Logging, Proaktiver Wächter, Automatisierung

Der Client redet mit dem AI Butler wie mit einem Personal Assistant. Der menschliche Coach bekommt ein Dashboard das ihm 80% der Routine abnimmt.

---

## Markt-Analyse

### Zahlen
- **Online Coaching:** $9B+ (2025), Post-COVID Shift zu Remote
- **AI Fitness Apps:** $2.5B (2025), 32% CAGR
- **Virtual Fitness Coaching:** $14B (2025)
- **Key Players:** Trainerize (400K+ Coaches), TrueCoach (16K+ Coaches, 250K+ Clients), Freeletics (50M Users)

### 13 Competitors analysiert

| App | Typ | Users | Stärke | Schwäche |
|-----|-----|-------|--------|----------|
| **Trainerize** | Coach Platform | 400K Coaches | Größte, Mindbody-owned | Veraltet, keine Nutrition-Tiefe |
| **TrueCoach** | Coach Platform | 16K Coaches | Beste Coach-UX, Oura | Kein AI, kein Supplement |
| **PT Distinction** | Coach Platform | — | Feature-reich | Overwhelming UI |
| **Everfit** | Coach Platform | — | Modernste UX | Keine Medical/Supps/Recovery |
| **TrainHeroic** | Team/Gym | 100K Athletes | Stark bei Teams | Schwach bei 1:1 |
| **Coachvox** | AI Clone | — | Coaches zahlen $99/mo | Nur Chat, keine Daten |
| **Freeletics** | AI Training | 50M | "The Coach" Algorithm | Kein LLM, keine Supps |
| **Zing Coach** | CV Form Check | 1M | Camera Form Tracking | Keine tiefe Nutrition |
| **Kemtai** | CV API (B2B) | — | Medical-validated CV | Nur B2B API |
| **Fitbod** | AI Workout | 5M | Muscle Recovery Model | Kein Nutrition/Coach |
| **MacroFactor** | AI Nutrition | — | Adaptive TDEE | Kein Training/Coach |
| **Welltory** | AI Wellness | 16M | HRV + GPT Insights | Kein Training/Nutrition |
| **Trainwell** | Human + AI | — | $149/mo beweist Premium | Nur Training |

### Kritische Gaps (Keiner hat das)
1. ❌ **Cross-Module Intelligence** — Nutrition + Training + Recovery + Supplements + Bloodwork in einem Dashboard
2. ❌ **AI Butler als App-Interface** — Alles per Sprache/Text steuern
3. ❌ **138 Mikronährstoffe** für Coach sichtbar (alle haben max Macros)
4. ❌ **Enhanced Protocol Management** — TRT/PED Cycle Monitoring für Coach
5. ❌ **AI Clone mit echten Daten** — Coachvox hat Clone aber keine Tracking-Daten

---

## Architektur

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT SEITE                        │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │           AI COACH BUTLER 🧠                    │   │
│  │                                                  │   │
│  │  "Ich bin dein App-Assistent"                   │   │
│  │                                                  │   │
│  │  🎤 Voice Input                                 │   │
│  │  ⌨️ Text Input                                  │   │
│  │  📸 Camera (MealCam, Form Check)               │   │
│  │                                                  │   │
│  │  Intent → Action → Confirm → Done               │   │
│  │  "200g Hähnchen" → Meal geloggt ✅               │   │
│  │  "Supps genommen" → Intake geloggt ✅            │   │
│  │  "Wie war meine Woche?" → Summary ✅             │   │
│  │                                                  │   │
│  │  🚨 Proaktiver Wächter (meldet sich von selbst) │   │
│  │  💓 Journey Heartbeat (konfigurierbares Briefing)│   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │          LUMEOS APP (normal)                     │   │
│  │  Nutrition · Training · Supplements · Recovery   │   │
│  │  (Client trackt hier — Coach sieht alles)       │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
├────────────────────────────────────────────────────────┤
│                 VERBINDUNG                              │
│  Permission-Based Data Access (Client kontrolliert)    │
│  In-App Chat · Check-ins · Programs · AI Clone         │
├────────────────────────────────────────────────────────┤
│                                                        │
│                    COACH SEITE                          │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │          COACH DASHBOARD 📊                     │   │
│  │                                                  │   │
│  │  Client-Liste mit Ampel-Status                  │   │
│  │  Cross-Module Übersicht pro Client              │   │
│  │  Alerts & Flags (AI-generiert)                  │   │
│  │  Program Builder (Training + Nutrition)          │   │
│  │  Check-in History + Auto-Summary                │   │
│  │  Chat (direkt + via AI Clone)                   │   │
│  │  Analytics & Trends                             │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │     COACH AI ASSISTANT 🤖                       │   │
│  │                                                  │   │
│  │  "Ich bin der persönliche Assistent des Coaches" │   │
│  │                                                  │   │
│  │  📊 Client-Monitoring (Auto-Alerts)             │   │
│  │  📝 Auto-Reports (Weekly Summary pro Client)    │   │
│  │  💬 Standard-Fragen beantworten (im Coach-Stil) │   │
│  │  📋 Meal Plans generieren (Coach gibt Macros)   │   │
│  │  🔔 Eskalation bei CRITICAL                     │   │
│  │  🧬 AI Clone Management                         │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### Kern-Innovation: Drei AI-Schichten

| Schicht | Für wen | Was | Kosten |
|---------|---------|-----|--------|
| **AI Butler** | Client | App-Interface, Voice/Text Actions, Wächter | Free–Pro |
| **AI Clone** | Client | 24/7 Coach-Ersatz im Stil des echten Coaches | Premium |
| **AI Assistant** | Coach | Client-Monitoring, Auto-Reports, Routine-Automatisierung | Coach-Abo |

---

## Real Coach Feedback (Feb 2026)

> Direktes Feedback eines aktiven Coaches zu seiner aktuell genutzten Software. Diese Pain Points sind der Beweis dass der Markt Lumeos braucht.

### Coach-Sicht (Pain Points)
1. **❌ Keine Business Analytics** — Wer zahlt wieviel, Laufzeiten, Neukunden, Ablauf-Warnungen
2. **❌ Keine Kundeneinteilung** — Nach Plänen, Zielsetzung (Diät/Aufbau), Laufzeit
3. **❌ Kein AI Support** — Keine Check-in Analyse, keine Optimierungs-Vorschläge
4. **❌ Training nur am Desktop** — Keine Anpassungen in der App möglich
5. **❌ Keine Warnsignale** — Wenn Gewicht steigt, wenn Kunden nicht tracken
6. **❌ Keine Kurzvideo-Funktion** — Coach kann keine Erklärvideos an Client senden
7. **❌ Übungsdatenbank veraltet** — Falsche Bilder/Videos zu Übungen

### Kunden-Sicht (Pain Points)
1. **❌ Dashboard unübersichtlich** — Keine wichtigen Tasks erkennbar
2. **❌ Kein Kontext auf Dashboard** — Kalorien, heutiges Training fehlen
3. **❌ Zu viele Klicks** — Supplements braucht eigenen Reiter
4. **❌ Ernährungs-Erstansicht unübersichtlich**
5. **❌ Keine Extra-Funktion für Medis/PEDs** — alles in Supplements reingeschrieben
6. **❌ Keine Fortschritts-Insights** — "Du bist 10% stärker" fehlt (für Client UND Coach)
7. **❌ Nur Englisch**
8. **❌ App stürzt manchmal ab**

### Lumeos löst bereits
- ✅ Enhanced Mode (PEDs) mit eigenem Tab, Cycle Planner, Injection Rotation
- ✅ Multi-Language DE/EN/TH
- ✅ Supplements als eigener Bottom Tab (1 Tap)
- ✅ Dashboard mit Kontext (Kalorien, Remaining Bar, Training)
- ✅ Mobile-first (alles in App bearbeitbar)
- ✅ 138 Mikronährstoffe Tracking
- ✅ Cross-Module Intelligence
- ✅ Error Boundary (PWA, kein Crash)

### Muss in Lumeos rein (aus Feedback)
- 📊 **Business Analytics für Coach** → F1.7
- 👥 **Kundeneinteilung** (Plan, Ziel, Laufzeit) → F1.1
- 🤖 **AI Check-in Analyse** mit Vorschlägen → F3.1, F3.2
- ⚠️ **Warnsignale an Coach** (Gewicht, Inaktivität) → F3.1
- 🎬 **Kurzvideo Coach→Client** → F1.5
- 📈 **Fortschritts-Insights** für Coach UND Client → F2.4, F3.2

---

## Feature-Katalog

### Teil 1: Menschlicher Coach

#### F1.1 — Coach Dashboard
**Client-Übersicht auf einen Blick:**
```
👤 Max Mustermann | Program: PPL Hypertrophy W6/12
📊 Training: ████████░░ 85%  | 🍽️ Nutrition: ██████░░░░ 65%
💊 Supplements: ████░░░░░░ 40% ⚠️ | 💤 Recovery: ██████░░░░ 58% ⚠️
📈 Weight: 82.3kg (-0.5kg/wk ✅) | 🏋️ Bench PR: 100kg (+2.5kg 🎉)
🩸 Last Bloodwork: 14.02 | Hematocrit: 48% ✅ | Vitamin D: 28 ⚠️
💬 Last msg: Gestern 18:32 | 📋 Next Check-in: Montag
```

**Features:**
- Client-Liste mit Ampel-Status (🟢🟡🔴)
- Sortierung: letzte Aktivität, Alerts, Compliance
- Klick → volle Client-Detailansicht
- Multi-Coach Support (Team-Gyms)
- Branding (Coach-Logo, Farben)

#### F1.2 — Permission-Based Data Access
```typescript
interface CoachPermissions {
  client: UserId;
  coach: CoachId;
  access: {
    training: 'full' | 'summary' | 'none';
    nutrition: 'full' | 'summary' | 'none';
    recovery: 'full' | 'summary' | 'none';
    supplements: 'full' | 'summary' | 'none';
    medical: 'full' | 'summary' | 'none';     // SENSITIVE
    goals: 'full' | 'summary' | 'none';
    bodyMetrics: 'full' | 'summary' | 'none';  // Fotos, Maße
  };
  expiresAt?: Date;
}
```
- Client kontrolliert was der Coach sieht
- Medical = explizites Opt-In (GDPR)
- Time-limited Tokens möglich
- Revoke jederzeit

#### F1.3 — Program Builder
- Drag & Drop Workout-Erstellung
- Periodisierung (Accumulation → Overreach → Deload)
- Template-System (Programme wiederverwenden)
- Auto-Delivery (Woche für Woche freigeschaltet)
- Meal Plan Integration (Macros → passende Rezepte)
- Supplement Protocol Templates

#### F1.4 — Automated Check-Ins
```
Weekly Check-In (Auto-generiert):
├── Pulled from App: Weight, Recovery Score, Compliance %
├── Client ergänzt: Subjective Feedback (1-10 Energy/Mood/Soreness)
├── Optional: Fotos, Maße
└── Coach sieht: Dashboard-Summary statt Daten-Dump
```
- Spart 30% Coach-Zeit (keine manuelle Datensammlung)
- Konfigurierbar pro Client (wöchentlich/bi-weekly)
- Auto-Reminder an Client

#### F1.5 — Communication
- In-App Chat (Text, Voice Notes, Fotos, Videos)
- Coach kann anhängen: Programme, Meal Plans, Exercise Demos
- **🎬 Kurzvideo-Funktion** (aus Coach Feedback): Coach nimmt kurzes Video auf um Planänderungen zu erklären → Client sieht es in der Timeline
- Video Call Integration (Zoom/Meet Link)
- Session Notes an Client-Timeline

#### F1.6 — Enhanced Protocol Management
Für Bodybuilding Prep / TRT Coaches:
- Cycle-Übersicht pro Client
- Bloodwork-Tracking (Hematocrit, Leberwerte, Lipide, Hormone)
- Auto-Alerts: "Client Hematocrit steigend" → Coach wird benachrichtigt
- Supplement-Support anpassen (Leberschutz, Cardiovascular)
- PCT-Planung

#### F1.7 — Analytics & Reporting
- Client-Fortschritt über Wochen/Monate
- Compliance-Trends
- Kraft-Kurven (PRs über Zeit)
- Body Composition (wenn Daten vorhanden)
- **📊 Business Analytics** (aus Coach Feedback): Revenue pro Client, Laufzeiten, Neukunden-Rate, Ablauf-Warnungen ("Client Max läuft in 7 Tagen aus"), Retention-Rate
- **👥 Kundeneinteilung** (aus Coach Feedback): Filter/Tags nach Plan (Diät/Aufbau/Recomp), Zielsetzung, Laufzeit, Status
- **📈 Fortschritts-Insights für Coach** (aus Coach Feedback): "Client ist 10% stärker als letzte Woche", "Kraft hat sich verschlechtert seit 2 Wochen" — automatisch generiert

---

### Teil 2: AI Coach Butler (Client-Side)

> Alles aus `COACH-IDEAS.md` — integriert

#### F2.1 — App Butler (Kern-Feature)
**Alles was der User manuell macht, geht über den Butler:**

| Modul | Voice/Text Beispiele |
|-------|---------------------|
| Nutrition | "Log 200g Hähnchen mit Reis" · "Kopiere gestern" · "Wie viel Protein fehlt?" |
| Supplements | "Supps genommen" · "Kreatin gecheckt" · "Wann Pin Day?" |
| Recovery | "Check-in: Schlaf 7h, gut gefühlt" · "Recovery Score?" |
| Training | "Leg Day: Squats 5x5 100kg" |
| Wasser | "500ml Wasser" · "Wie viel fehlt?" |
| Gewicht | "86kg heute" |
| Settings | "Protein-Ziel auf 160g" |
| Überblick | "Wie war meine Woche?" · "Briefing bitte" |

**Architektur:**
```
User Input (Text/Voice)
  → Speech-to-Text (Web Speech API / Whisper)
  → Intent Recognition (LLM)
  → Action Router (→ richtige API)
  → Confirm → Execute
  → "✅ Geloggt: 487 kcal, 52g Protein"
```

#### F2.2 — Voice Input
- 🎤 Mikrofon-Button im Chat (immer sichtbar)
- Web Speech API (gratis, Browser-nativ) als Default
- Whisper API als Premium-Option
- Auto-Spracherkennung DE/EN/TH
- Push-to-talk oder Auto-Detect

#### F2.3 — Smart Confirmation
- Einfache Actions (Wasser, Check-in): direkt ausführen
- Komplexe Actions (Meal mit mehreren Foods): Vorschau → Confirm
- "Meintest du Hähnchenbrust oder Hähnchenschenkel?"
- Undo: "Das war falsch, waren nur 150g"

#### F2.4 — Proaktiver Wächter
**Coach meldet sich VON SICH AUS — User muss nie Dashboards checken:**

| Level | Trigger | Beispiel |
|-------|---------|----------|
| 🔴 CRITICAL | Sofort-Push | Gefährliche Supplement-Interaktion, Übertraining + Pin Day |
| 🟠 WARNING | Nächster Check-in | Protein 3 Tage unter 50%, Dehydration-Trend |
| 🟡 INFO | Passiv im Feed | Streak-Rekord, Ziel fast erreicht |

**Überwachung über alle Module:**
- Ernährung: Nichts geloggt seit 24h, Crash-Diät-Alarm (<800 kcal)
- Supplements: Pin Day vergessen, neue Interaktion erkannt, Compliance <50%
- Recovery: Score <30 + Training geplant, Schlaf 3+ Nächte <5h
- Übergreifend: Widersprüche (Defizit + Masse-Cycle), Plateau (14+ Tage Stagnation)

**Smart Mute:**
- Nachtmodus (23:00–07:00): nur CRITICAL
- Lernfähig: 3x dismisst → heruntergestuft

#### F2.5 — Journey Heartbeat (Konfigurierbares Briefing)
User definiert seine tägliche Journey:

| Zeitpunkt | Content (konfigurierbar) |
|-----------|------------------------|
| 🌅 Morgen (7:00) | Recovery Score, Schlaf, Plan für heute |
| 🍽️ Pre-Meal (12:00, 18:00) | Makros-Stand, Essensvorschlag |
| 💊 Supplement-Reminder | Welche Supps jetzt fällig |
| 💉 Pin Day Alert | Injektionstag, Site Rotation |
| 🏋️ Pre-Workout (16:00) | Recovery Check, Muskelgruppen-Empfehlung |
| 🌙 Abend (21:00) | Tages-Review, was fehlt noch, Streak |
| 📊 Wochen-Report (So 20:00) | Woche vs. Ziele, Trends |

**Konfigurierbar:**
- ⏰ Uhrzeiten
- 📋 Welche Module/Infos pro Checkpoint
- 🔕 Welche Tage
- 🎭 Persona pro Checkpoint (Morgens = Drill Sergeant, Abends = Best Friend)
- 📱 Push vs. in-App Badge

**Kontextbewusst:** Nach schlechtem Schlaf anderer Ton als nach 8h.

#### F2.6 — 5 Personas
| Persona | Icon | Stil |
|---------|------|------|
| Scientist | 🔬 | "Studien zeigen...", Fakten, Referenzen |
| Motivator | 💪 | "LET'S GO! 🔥", Celebrations |
| Drill Sergeant | 🎖️ | "Keine Ausreden.", knapp |
| Best Friend | 😊 | "Hey, lass uns schauen...", empathisch |
| Sensei | 🧘 | "Der Weg ist das Ziel.", weise |

#### F2.7 — Inline Rich Cards
- Mini Macro-Ring im Chat
- Supplement-Checklist als Checkboxen
- Recovery Score Gauge
- Nicht nur Text — echte UI-Elemente im Chat

#### F2.8 — Gym Finder
- 📍 Geolocation → Gyms in der Nähe (Google Places API)
- ⭐ Rating + Review-Zusammenfassung per AI
- 💰 Preise (falls auffindbar)
- 🕐 Öffnungszeiten, 📸 Fotos
- Filter: 24h, Pool, Sauna, PT, CrossFit
- Reise-Use-Case: neue Stadt → sofort Optionen
- Monetarisierung: Premium-Listing, Tageskarten über Wallet

---

### Teil 3: Coach AI Assistant (Coach-Side)

#### F3.1 — Auto-Monitoring
- Überwacht alle Clients parallel
- Ampel-System: 🟢 on track, 🟡 attention, 🔴 action needed
- Push an Coach: "Client Max: Recovery unter 50% seit 3 Tagen"
- Coach spart 30%+ der Zeit

#### F3.2 — Auto-Reports
- Weekly Summary pro Client auto-generiert
- Coach reviewed nur — muss nicht selbst Daten sammeln
- Includes: Compliance %, Trends, Flags, Empfehlungen
- Coach kann editieren und an Client senden

#### F3.3 — Standard-Fragen beantworten
- Client fragt 23:00 "Soll ich morgen trainieren?"
- AI antwortet im Stil des Coaches (Clone-Logik)
- Basiert auf Coach-Regeln + Client-Daten
- Escalation bei komplexen/medizinischen Fragen → Coach

#### F3.4 — Meal Plan Generator
- Coach gibt Macros vor (z.B. 2500 kcal, 160P/300C/80F)
- AI generiert Meal Plan aus BLS Food DB
- Berücksichtigt: Allergien, Präferenzen, Budget
- Coach reviewed + sendet an Client

#### F3.5 — AI Clone
- Coach trainiert AI mit eigener Methodik
- Upload: Protocols, Q&A Sessions, Methodologie-Docs
- Clone antwortet wie der Coach — mit Client's echten Daten
- Escalation-Regeln definierbar
- **Revenue:** Coach zahlt für Clone-Feature, Clients bekommen Premium-Support "inklusive"

---

### Teil 4: Future Innovations

#### F4.1 — Visual Check-In
Spiegel-Selfie → AI Fortschritts-Vergleich + Body Composition Schätzung

#### F4.2 — Pattern Detective
Korrelations-Engine: "Dein Schlaf ist 40min länger ohne Koffein nach 18:00"

#### F4.3 — Adaptive Ziele
Ziele passen sich dem User an, nicht umgekehrt: Schlechter Schlaf → weniger Volumen heute

#### F4.4 — Biomarker-Integration
Bluttest-Upload → Coach interpretiert → Stack automatisch anpassen

#### F4.5 — Reise-Modus
Timezone-Shift → Supplement-Timing anpassen, lokale Food-DB, Gym Finder

#### F4.6 — Predictive Coach
"Bei deinem Trend erreichst du 83kg in 6 Wochen"

#### F4.7 — Kontext-Gedächtnis
"Letzte Woche hast du gesagt dein Knie macht Probleme — wie ist es heute?"

#### F4.8 — Challenges & Social
Personalisierte Challenges mit Wallet-Rewards

---

## Monetarisierung

### Modulares Pricing (Feature-Gating)

| Tier | Name | AI Butler Features | Preis |
|------|------|-------------------|-------|
| 🆓 Free | Basic | Text-Chat, 5 Fragen/Tag, Insights Feed | 0 |
| ⭐ Plus | Smart Coach | Unbegrenzt Chat, Journey/Heartbeat, Briefings, alle Personas | +X/Mo |
| 🔥 Pro | 24/7 Butler | Voice Input, Action Execution, Proaktiver Wächter, Push Alerts, Gym Finder | +Y/Mo |
| 👑 Elite | AI Personal Trainer | Personalisierte Pläne, Cycle-Beratung, Deep Analysis, Priority | +Z/Mo |

### Coach Pricing

| Tier | Clients | Features | Preis |
|------|---------|----------|-------|
| Starter | ≤10 | Dashboard, Chat, Programs | $29/Mo |
| Professional | ≤50 | + Nutrition, Auto-Check-ins, Branding | $49/Mo |
| Business | ≤150 | + AI Clone, Marketplace, Analytics | $99/Mo |
| Enterprise | Unlimited | + Multi-Coach, White-Label, API | $199/Mo |

### Revenue Streams
1. **Client Wallet Transactions** — X% auf jede Transaktion
2. **Coach Subscriptions** — Monthly SaaS
3. **AI Clone Premium** — im Business-Tier
4. **Marketplace Commission** — Coach verkauft Programme (80/20)
5. **Client → Coach Kickback** — Coach empfiehlt Lumeos → Voucher-Bonus
6. **Supplement Marketplace** — 85% Margin-Raum in der Kette

### Wallet-Integration
- Coach-Tiers = Wallet-Voucher
- Upgrade/Downgrade jederzeit
- AI-Features verbrauchsbasiert möglich (z.B. Voice = 1 Token/Min)
- **Der Coach verkauft sich selbst** — zeigt Mehrwert im Moment des Bedarfs

### Technische Tier-Implementierung
```typescript
const FEATURE_TIERS = {
  'chat_basic':        'free',
  'insights_feed':     'free',
  'daily_limit_5':     'free',
  'chat_unlimited':    'plus',
  'journey_heartbeat': 'plus',
  'briefings':         'plus',
  'all_personas':      'plus',
  'voice_input':       'pro',
  'action_execution':  'pro',
  'proactive_watcher': 'pro',
  'push_alerts':       'pro',
  'gym_finder':        'pro',
  'training_plans':    'elite',
  'cycle_consulting':  'elite',
  'weekly_deep_report':'elite',
} as const;
```
- Feature-Gate als Middleware (nicht hardcoded)
- Tiers + Preise in DB/Config (A/B-Testing fähig)

---

## Coach Workflows

### W1: Neuen Client onboarden
```
1. Client meldet sich an → Onboarding (Goals, History, Injuries)
2. Coach reviewed → Notizen
3. Optional: Bloodwork teilen
4. Coach erstellt: Training Program + Nutrition Plan + Supplement Stack
5. Client bekommt alles in Lumeos App → startet
6. AI Butler übernimmt Daily Tracking + Reminders
```

### W2: Wöchentlicher Check-In
```
1. Auto-Reminder → Client
2. Auto-Pull: Weight, Recovery, Compliance %
3. Client ergänzt: Subjective (Energy, Mood, Soreness)
4. Coach sieht: Dashboard-Summary (nicht Daten-Dump)
5. Coach adjustiert Plan → sendet Feedback
```

### W3: Bodybuilding Prep (Enhanced)
```
1. Contest in 16 Wochen
2. Wöchentlich: Body Comp, Macro Compliance, Training Volume
3. 4-6 wöchentlich: Bloodwork (Hormone, Leber, Hematocrit, Lipide)
4. Coach monitored via Dashboard-Alerts
5. AI Assistant: Auto-Alert bei Hematocrit-Anstieg, Recovery-Abfall
6. Coach adjustiert Protocol
```

### W4: AI Clone 24/7 Support
```
1. Client fragt 23:00: "Soll ich morgen trainieren?"
2. AI Clone checkt: Recovery Score, letzte Workouts, Plan
3. Clone antwortet im Coach-Stil: "Recovery bei 72, du bist fit. Morgen Pull Day wie geplant."
4. Wenn komplex/medical → Eskalation an echten Coach
```

---

## USP — Warum Lumeos gewinnt

### vs. Coaching Platforms (Trainerize, TrueCoach, Everfit)

| Feature | Trainerize | TrueCoach | Everfit | **Lumeos** |
|---------|:---:|:---:|:---:|:---:|
| Training Management | ✅ | ✅ | ✅ | ✅ |
| Nutrition (Deep, 138 Micros) | ❌ | ❌ | 🟡 | ✅ |
| Recovery/HRV Dashboard | ❌ | ❌ | ❌ | ✅ |
| Supplement Tracking | ❌ | ❌ | ❌ | ✅ |
| Bloodwork Integration | ❌ | ❌ | ❌ | ✅ |
| Enhanced Protocol Monitoring | ❌ | ❌ | ❌ | ✅ |
| AI Clone | ❌ | ❌ | ❌ | ✅ |
| AI Butler (Voice/Text Actions) | ❌ | ❌ | ❌ | ✅ |
| Proaktiver Wächter | ❌ | ❌ | ❌ | ✅ |
| Marketplace | ❌ | ❌ | ❌ | ✅ |
| Kein Dual-Tracking | ❌ | ❌ | ❌ | ✅ |

### vs. AI Fitness Apps (ChatGPT, Freeletics, Welltory)

| Feature | ChatGPT | Freeletics | Welltory | **Lumeos** |
|---------|:---:|:---:|:---:|:---:|
| Echte User-Daten | ❌ | 🟡 | 🟡 | ✅ (ALL modules) |
| Cross-Module Intelligence | ❌ | ❌ | ❌ | ✅ |
| Action Execution (Log Meals etc.) | ❌ | ❌ | ❌ | ✅ |
| Memory/Tracking | ❌ | ✅ | ✅ | ✅ |
| Human Coach Integration | ❌ | ❌ | ❌ | ✅ |
| Voice Input | ✅ | ❌ | ❌ | ✅ |
| Proactive Alerts | ❌ | 🟡 | ❌ | ✅ |

### Die Killer-Kombination
**Kein Competitor hat Human Coach + AI Butler + Tracking + Cross-Module in einem.**

- Trainerize hat Coach-Tools aber keine AI und keine Daten-Tiefe
- ChatGPT hat AI aber keine Daten und keinen Coach
- Welltory hat AI + Daten aber kein Training/Nutrition/Coach
- **Lumeos hat alles.**

---

## Scope-Begrenzung des AI Butlers

Der AI Butler ist **kein ChatGPT-Ersatz**:
- ✅ Fitness, Ernährung, Supplements, Recovery, Training, Gesundheit
- ❌ Programmierung, Politik, Finanzen, Gedichte, allgemeine Wissensfragen
- Grauzone erlaubt: Stressmanagement, Schlafoptimierung, Motivation (im Fitness-Kontext)

**Zwei Schutzebenen:**
1. Regex Scope Guard (serverseitig, 0 API-Calls für Off-Topic)
2. System Prompt SCOPE-BEGRENZUNG (fängt subtilere Off-Topic ab)

---

## Technische Architektur

### Hybrid AI (Variante C — gewählt)

| Domäne | Engine | Warum |
|--------|--------|-------|
| TDEE/Macro Berechnung | Deterministisch | Keine Halluzination |
| Supplement Interactions | Deterministisch | Sicherheitskritisch |
| Scoring (0-100) | Deterministisch | Konsistenz |
| Recovery Score | Deterministisch | Formel-basiert |
| Erklärungen | LLM | Menschliche Sprache |
| Cross-Module Analyse | LLM | Pattern Recognition |
| Wissensfragen | LLM + RAG | Flexibilität |
| Voice → Action | LLM Intent | Intent Erkennung |

### 3 Pfade
- **Fast Path** (60%): Dashboard Cards, Scores → kein LLM, $0
- **Knowledge Path** (20%): Wissensfragen → RAG + LLM, günstig
- **Hybrid Path** (20%): Cross-Module Analyse → Engines + LLM

### LLM Stack
- **Primary:** Z.AI GLM-4.7-Flash (OpenAI-compatible, $0 via Flatabo)
- **Secondary:** Claude Haiku (wenn Credits vorhanden)
- **Premium:** Claude Sonnet (Deep Analysis, Elite Tier)
- **Local Fallback:** Deterministic Coach (immer verfügbar, $0)

### Safety Layer
- Medical > Supplements > Recovery > Protocols > Optimization
- Zahlen IMMER aus Engines (nie LLM-generiert)
- Interaction-Check IMMER deterministisch
- Medical Disclaimer automatisch
- Enhanced Mode: Harm Reduction, kein Cheerleading

---

## Database Schema (Erweiterung)

### Neue Tabellen (zusätzlich zu Migration 011)

```sql
-- Coach profiles
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,           -- Coach ist auch ein Lumeos User
  business_name TEXT,
  bio TEXT,
  specialties TEXT[],              -- ['bodybuilding', 'nutrition', 'trt']
  tier TEXT DEFAULT 'starter',
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach-Client relationships
CREATE TABLE coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  client_id UUID NOT NULL,         -- Client's user_id
  permissions JSONB NOT NULL,      -- F1.2 Permission object
  status TEXT DEFAULT 'active',    -- active | paused | ended
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Coach programs
CREATE TABLE coach_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- training | nutrition | combined | full
  duration_weeks INT,
  phases JSONB DEFAULT '[]',
  templates JSONB DEFAULT '{}',
  marketplace_listed BOOLEAN DEFAULT false,
  marketplace_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach-Client assignments
CREATE TABLE program_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES coach_programs(id),
  client_id UUID NOT NULL,
  current_week INT DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-in responses
CREATE TABLE coach_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  client_id UUID NOT NULL,
  week_number INT,
  auto_data JSONB DEFAULT '{}',   -- Auto-pulled: weight, recovery, compliance
  client_data JSONB DEFAULT '{}', -- Client subjective: energy, mood, soreness
  coach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Clone config
CREATE TABLE coach_clones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  methodology TEXT,                -- Coach's training methodology
  style_prompt TEXT,               -- Communication style
  boundaries JSONB DEFAULT '{}',   -- What the clone can/can't do
  escalation_rules JSONB DEFAULT '[]',
  training_data JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach Journey checkpoints (F2.5)
CREATE TABLE coach_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  checkpoints JSONB NOT NULL,     -- [{time, modules, persona, push}]
  active_days INT[] DEFAULT '{1,2,3,4,5,6,0}', -- 0=Sun
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proactive alerts log (F2.4)
CREATE TABLE coach_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  level TEXT NOT NULL,            -- critical | warning | info
  category TEXT NOT NULL,         -- nutrition | supplements | recovery | cross
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  dismissed BOOLEAN DEFAULT false,
  dismiss_count INT DEFAULT 0,    -- Smart mute: 3x dismissed → downgrade
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Milestones

### M1: Coach Butler MVP (Sprint 1)
- [x] Chat Interface mit Streaming (SSE)
- [x] 5 Personas
- [x] Context Builder (Cross-Module)
- [x] Proactive Insights (8 Rules)
- [x] Daily Briefing
- [x] Z.AI GLM Integration ($0)
- [x] Scope Guard (Off-Topic Blocker)
- [ ] Intent Recognition + Action Execution (Text-first)
- [ ] Smart Confirmation

### M2: Voice + Wächter (Sprint 2)
- [ ] Voice Input (Web Speech API)
- [ ] Proaktiver Wächter (Background Worker)
- [ ] Push Notifications (Web Push API)
- [ ] Journey Heartbeat (konfigurierbar)
- [ ] Undo/Korrektur

### M3: Human Coach Platform (Sprint 3)
- [ ] Coach Registration + Dashboard
- [ ] Permission-Based Data Access
- [ ] Client-Übersicht
- [ ] In-App Chat (Coach↔Client)
- [ ] Program Builder (Basic)

### M4: Coach AI Assistant (Sprint 4)
- [ ] Auto-Monitoring (Alerts an Coach)
- [ ] Auto-Reports (Weekly Summary)
- [ ] Standard-Fragen beantworten
- [ ] Check-In Automation

### M5: AI Clone + Marketplace (Sprint 5)
- [ ] AI Clone Builder
- [ ] Clone Training Interface
- [ ] Marketplace Listing (Programme)
- [ ] Wallet Integration

### M6: Premium Features (Sprint 6)
- [ ] Gym Finder (Google Places API)
- [ ] Visual Check-In
- [ ] Pattern Detective
- [ ] Biomarker-Integration
- [ ] Inline Rich Cards

---

## Acceptance Criteria (M1 — Butler MVP)

- [ ] AC1: User kann per Text eine Mahlzeit loggen ("200g Hähnchen") und sie wird in der Nutrition API gebucht
- [ ] AC2: User kann per Text Supplement-Intake loggen ("Kreatin genommen")
- [ ] AC3: User kann per Text Wasser loggen ("500ml Wasser")
- [ ] AC4: User kann per Text Gewicht loggen ("86kg heute")
- [ ] AC5: User kann per Text Recovery Check-in machen ("Schlaf 7h, gut gefühlt")
- [ ] AC6: Intent Recognition unterscheidet: Log-Action vs. Frage vs. Small Talk
- [ ] AC7: Bei unsicherer Erkennung: Rückfrage statt falsch buchen
- [ ] AC8: Bestätigung nach erfolgreicher Action ("✅ Geloggt: 487 kcal, 52g Protein")
- [ ] AC9: Off-Topic wird geblockt (Scope Guard)
- [ ] AC10: Alle bestehenden Features (Chat, Personas, Insights, Briefing) bleiben funktional
- [ ] AC11: Coach-Modul-Tiers technisch vorbereitet (Feature-Gate Middleware)
- [ ] AC12: Modulares Pricing konfigurierbar (nicht hardcoded)

---

## Quellen

- Competitive Research: `/research/ai-coach/competitive-analysis.md` (13 Apps)
- Coach Platform Research: `/research/coach/lumeos-coach-strategy.md` (7 Platforms)
- Coach Workflows: `/research/coach/data/coach-workflows.md`
- Architecture Variants: `/research/ai-coach/ai-coach-architecture-variants.md` (3 Varianten)
- AI Coach Strategy: `/research/ai-coach/lumeos-ai-coach-strategy.md`
- Butler Ideas: `/docs/ai-coach-module/COACH-IDEAS.md` (Tom Brainstorming 2026-02-24)
- Monetarisierung: `/research/system/wallet-and-monetization.md`
- Competitor Profiles: Coachvox, Freeletics, Kemtai, Welltory, Zing Coach, TrueCoach
