# Buddy / AI Coach Module — Module Contract
> Spec Phase 1 | Final

---

## 1. Zweck

Buddy ist das zentrale AI-Interface von LumeOS — der persistente, personalisierte AI-Trainingspartner. Buddy verbindet alle Module zu einem kohärenten Coaching-Erlebnis.

**Kernformel:** `Körperdaten → Buddy → Entscheidung → Aktion im Ökosystem`

---

## 2. Prinzipien (unveränderlich)

| Prinzip | Bedeutung |
|---|---|
| **Hybrid AI** | Deterministisch für Zahlen/Safety, LLM für Konversation |
| **Evidence-First** | Keine Studien-Claims in speech_text, nur in UI Cards |
| **No Manipulation** | Keine Angst/Schuld/Streak-Shaming Narrative |
| **Medical Gate** | Keine Diagnosen, Dosierungen, Therapieempfehlungen |
| **Entkopplung** | Supplements nie als Reaktion auf Laborwerte empfehlen |
| **Privacy** | Medical = opt-in. Behavioral Signature = transparent |
| **Konfigurierbarkeit** | Alles einstellbar: User / Tier / Coach / Gym |
| **Local-First** | Workout ohne Internet möglich. Whitper.cpp on-device. |

---

## 3. Konfigurierbarkeit — Alle Ebenen

### User-Ebene
- Persona (5 Stile)
- Autonomy Level (1–5)
- Intervention Threshold (low/medium/high/urgent_only)
- Notification Preferences (Quiet Hours, Kanäle)
- Journey Checkpoints (Uhrzeiten, Inhalte, Persona pro Slot)
- Module Access (was darf Buddy sehen?)
- Feature Tier (free/plus/pro/elite)

### Tier-Ebene (Feature Gate als Middleware)
```
free:  Text-Chat 5/Tag, Insights Feed
plus:  Unbegrenzt Chat, alle Personas, Journey/Heartbeat
pro:   + Voice, Action Execution, Proaktiver Wächter, Push Alerts
elite: + Training Plans, Cycle Consulting, Weekly Deep Report
```

### Coach-Ebene (Human Coach pro Client)
- Autonomy Level Override
- Max Intervention Intensity
- Allowed/Blocked Rules
- Custom Rules pro Client
- Clone Aktivierung

### Gym/B2B-Ebene
- White-Label Branding
- Custom Knowledge Base
- Wallet-Anbindung
- Escalation Contact

---

## 4. Modul-Grenzen

### Buddy BESITZT
- Chat-Interface (Text + Voice + Cards)
- Rule Engine (konfigurierbar per User/Coach/System)
- Memory System (4-Layer)
- Behavioral Signature
- Intervention Engine
- Floating Widget
- Journey / Heartbeat
- Proaktiver Wächter
- App Butler (Action Execution)
- BSS (Behavior Stability Score)
- Knowledge Base (RAG)
- AI Clone (Coach B2B)

### Buddy BESITZT NICHT
- User-Daten anderer Module (liest via for-coach APIs)
- Human Coach Dashboard (das ist Port 5600)
- Wallet-Transaktionen (das ist Marketplace 5700)
- Direkte DB-Writes in andere Module

---

## 5. Inputs (von anderen Modulen)

Buddy liest alles — mit Permission:
```
GET http://nutrition:5100/api/nutrition/for-ai
GET http://training:5200/api/training/for-ai
GET http://recovery:5400/api/recovery/for-ai
GET http://supplements:5300/api/supplements/for-ai
GET http://medical:5800/api/medical/for-ai
GET http://goals:5900/api/goals/for-ai
GET http://marketplace:5700/api/marketplace/for-buddy
```

---

## 6. Outputs (an andere Module)

```
→ Nutrition API:    Log Meal, Log Water
→ Training API:     Log Set, Log Session
→ Supplements API:  Log Intake
→ Recovery API:     Log Check-in, Log Sleep
→ Goals API:        — (liest nur)
→ Marketplace API:  Checkout (nach Bestätigung)
→ Human Coach API:  Eskalation, Alerts
```

---

## 7. Safety Priority

```
Safety (Medical/Supplement) > Recovery > Training > Nutrition > Behavior
```

Alle Aktionen durchlaufen Policy Gate (serverseitig, vor Response).

---

## 8. API-Übersicht

```
http://coach:5500
  /api/coach/chat              Text-Chat + SSE Streaming
  /api/coach/buddy/            Dashboard, State, Trends, Health
  /api/coach/actions/          App Butler Action Executor
  /api/coach/memory            Memory CRUD
  /api/coach/knowledge/        RAG Knowledge Base
  /api/coach/coaching/         Suggestions, Weekly Report
  /api/coach/automations       Konfigurierbare Rules
  /api/coach/profile           Coach-Profil + Präferenzen
  /api/coach/journey           Heartbeat Konfiguration
  /api/coach/alerts            Proaktiver Wächter
  /api/coach/gym-finder        Google Places Integration
  /api/coach/intervention/     Adaptive Intervention Engine
  /api/coach/bss               Behavior Stability Score
  /api/coach/clone/            AI Clone (Coach B2B)
  /api/coach/for-human-coach   Human Coach Integration
  /api/coach/buddy-data/       Aggregated Data (Floating Widget)
```
