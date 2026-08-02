# Buddy / AI Coach Module — Übersicht

Das Buddy / AI Coach Modul ist das zentrale Interface von LumeOS — der persistente, personalisierte AI-Trainingspartner der den User KENNT und 24/7 verfügbar ist.

**Kernformel:** `Körperdaten → Buddy → Entscheidung → Aktion im Ökosystem`

**Port:** 5500

---

## Zwei Anwendungen

| App | Port | Beschreibung |
|---|---|---|
| `apps/app/modules/coach/` | Integriert | Client-seitige Buddy-Oberfläche (Chat, Voice, Cards, Widget) |
| `apps/coach/` | 8502 | Human Coach Dashboard (separates Frontend) |

---

## Architektur

```
apps/app/modules/coach/       # Client Buddy Interface
  components/
    BuddyChat.tsx             # Haupt-Chat
    BuddyFloatingWidget.tsx   # Always-On Floating Bubble (B13)
    ActionCards.tsx           # Smart Recommendation Cards
    VoiceInput.tsx            # STT Integration
    JourneySettings.tsx       # Heartbeat Konfiguration

src/api/coach/ (Port 5500)
  routes/
    chat.ts                   # POST /chat, POST /chat/stream (SSE)
    buddy.ts                  # Dashboard, Decisions, Trends
    buddy-memory.ts           # Memory CRUD
    buddy-state.ts            # State System
    buddy-events.ts           # Event Pipeline
    buddy-rules.ts            # Rule Engine
    buddy-watcher.ts          # Watcher System
    buddy-intervention.ts     # Adaptive Intervention Engine
    knowledge.ts              # RAG Knowledge Base
    actions.ts                # Action Executor (Meal/Supp/Weight loggen)
    coaching.ts               # Suggestions, Weekly Reports
    automations.ts            # Konfigurierbare Automatisierungen
    journey.ts                # Heartbeat / Daily Briefing
    alerts.ts                 # Proaktiver Wächter
    profile.ts                # Coach Profile + Preferences
    voice.ts                  # STT/TTS Endpoints
    gym-finder.ts             # Google Places Integration
    for-coach.ts              # Human Coach → Buddy Integration
    clone.ts                  # AI Clone (Coach B2B)

packages/
  scoring/src/buddy.ts        # BSS, Engines (pure functions)
  rules-engine/               # Rule Evaluation
  evaluator/                  # Orchestrator (Fast/Knowledge/Hybrid Path)

Database Schema: buddy.*
```

---

## Drei AI-Schichten

| Schicht | Für wen | Was | Tier |
|---|---|---|---|
| **AI Butler** | Client | App-Interface, Voice/Text Actions, Wächter, Briefing | Free–Elite |
| **AI Clone** | Client | 24/7 Coach-Ersatz im Stil des echten Coaches | Business (Coach) |
| **AI Assistant** | Coach | Client-Monitoring, Auto-Reports, Routine-Automatisierung | Coach-Abo |

---

## Konfigurierbarkeit — Das Schlüsselprinzip

Buddy-Funktionen sind auf mehreren Ebenen konfigurierbar:

1. **Pro User:** Persona, Autonomy Level, Intervention Threshold, Notification Preferences, Feature-Tier
2. **Pro Abo-Tier:** Feature Gates (Free/Plus/Pro/Elite) — Middleware-basiert, A/B-Testing fähig
3. **Pro Coach (Human):** Autonomy Override per Client, Custom Rules, Clone-Aktivierung
4. **Pro Gym/B2B:** White-Label Branding, Custom Knowledge Base, Wallet-Anbindung

---

## Cross-Module Verbindungen

| Modul | Was Buddy liest | Was Buddy gibt |
|---|---|---|
| Nutrition | Daily Score, Macro Compliance, Meal Logs | Meal Suggestions, Macro-Adjustments |
| Training | Sessions, Volume, PRs, Fatigue | Training Readiness, Deload Recs |
| Recovery | Recovery Score, Sleep, HRV | Rest Day Recs, Intensity Adjustments |
| Supplements | Stack, Compliance, Interactions | Supplement Timing Reminders |
| Medical | Biomarker Alerts, Lab Values | Arzt-Verweis (immer) |
| Goals | Phase, TDEE, Bottleneck | Goal-aligned Recommendations |
| Marketplace | Produkt-Recommendations | Kaufaktion (nach Bestätigung) |
| Human Coach | Coach-Regeln, Overrides | Eskalation an echten Coach |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status und Code-Referenzen |
| `DATABASE.md` | Vollständiges DB-Schema |
| `API.md` | Alle API-Endpoints |
| `COMPONENTS.md` | Frontend: Components, Hooks, Stores |
| `SCORING.md` | BSS, Engines, Rule Evaluation, Output Contract |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Architecture Decision |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
