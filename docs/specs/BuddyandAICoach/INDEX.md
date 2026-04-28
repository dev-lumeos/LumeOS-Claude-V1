# Buddy / AI Coach Module — Spec Index
> LumeOS | Vollständige Spezifikation | Port 5500

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| — | `CONSOLIDATED_KNOWLEDGE.md` | Alle 24 Alt-Dokumente destilliert (702 Zeilen) |
| — | `README.md` | Übersicht, Architektur, Cross-Module |
| — | `STRATEGY.md` | Marktanalyse, Personas, USPs, Architecture Decision |
| — | `FEATURES.md` | Feature-Katalog mit Status und Code-Referenzen |
| — | `DATABASE.md` | DB-Schema Übersicht (16 Tabellen) |
| — | `API.md` | API-Übersicht alle Endpoints |
| — | `COMPONENTS.md` | Frontend-Komponenten Übersicht |
| — | `SCORING.md` | BSS, Policy Gate, Feature Gate (Übersicht) |
| — | `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
| **01** | `spec/SPEC_01_MODULE_CONTRACT.md` | Zweck, Prinzipien, vollständige Konfigurierbarkeits-Matrix |
| **02** | `spec/SPEC_02_ENTITIES.md` | 12 Core Entities mit allen Feldern |
| **03** | `spec/SPEC_03_USER_FLOWS.md` | 11 User Flows (Onboarding bis BSS Review) |
| **04** | `spec/SPEC_04_FEATURES.md` | 10 Feature-Implementierungen mit vollständigem TypeScript |
| **05** | `spec/SPEC_05_ENGINES.md` | 11 deterministischen Engines + Orchestration |
| **06** | `spec/SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL (16 Tabellen, RLS, Indexes, pgvector) |
| **07** | `spec/SPEC_07_API.md` | Alle Endpoints mit Request/Response + Rate Limits |
| **08** | `spec/SPEC_08_IMPORT_PIPELINE.md` | System-Rules Seed, KB Seed, Cron Jobs, Onboarding |
| **09** | `spec/SPEC_09_SCORING.md` | BSS, Feature Gate, Policy Gate, Identity, Unit Tests |
| **10** | `spec/SPEC_10_COMPONENTS.md` | 70+ Components, 18 Hooks, 3 Stores, i18n |

---

## Kernformel (unveränderlich)

```
Buddy = Gehirn · LumeOS = Betriebssystem · UI = Anzeige
Körperdaten → Buddy → Entscheidung → Aktion im Ökosystem
```

---

## Konfigurierbarkeit — 4 Ebenen

| Ebene | Was konfigurierbar ist |
|---|---|
| **User** | Persona (5), Autonomy Level (1–5), Intervention Threshold, Notification Prefs, Journey Checkpoints, Module Access |
| **Abo-Tier** | Feature Gates (Free/Plus/Pro/Elite) — Middleware-basiert, A/B-Testing fähig |
| **Coach (Human)** | Autonomy Override per Client, Custom Rules, Clone-Aktivierung |
| **Gym / B2B** | White-Label Branding, Custom Knowledge Base, Wallet-Anbindung |

---

## Feature Gates

| Feature | Free | Plus | Pro | Elite |
|---|:---:|:---:|:---:|:---:|
| Text-Chat (5/Tag) | ✅ | — | — | — |
| Insights Feed | ✅ | ✅ | ✅ | ✅ |
| Chat unlimitiert | — | ✅ | ✅ | ✅ |
| Alle Personas | — | ✅ | ✅ | ✅ |
| Journey / Heartbeat | — | ✅ | ✅ | ✅ |
| Voice Input | — | — | ✅ | ✅ |
| Action Execution | — | — | ✅ | ✅ |
| Proaktiver Wächter | — | — | ✅ | ✅ |
| Push Notifications | — | — | ✅ | ✅ |
| Gym Finder | — | — | ✅ | ✅ |
| Training Plans | — | — | — | ✅ |
| Cycle Consulting | — | — | — | ✅ |
| Weekly Deep Report | — | — | — | ✅ |
| AI Clone | — | — | — | Coach B2B |

---

## Safety-Regeln (absolut unveränderlich)

| Regel | Inhalt |
|---|---|
| Medical Gate | Keine Diagnosen, Dosierungen, Therapieempfehlungen |
| Supplement-Biomarker Entkopplung | Supplements NIE als Reaktion auf Laborwerte |
| Manipulation Guard | Kein Angst/Schuld/Streak-Shaming |
| Medication Gate | Medikament geloggt → nur "Kläre mit Arzt/Apotheker" |
| max_intervention_intensity | Niemals autonom über 0.8 |
| intervention_load_7d | Max 5/Woche, 2 Confrontations, 3 Identity-Statements |
| Policy Gate | Serverseitig, vor jedem Response: PASS | REDACT | BLOCK |
| Safety Priority | Safety > Recovery > Training > Nutrition > Behavior |
| Evidence-Pflicht | Studien-Claims NIE in speech_text, nur in UI-Cards |

---

## 11 Engines (deterministisch, reihenfolge-unabhängig)

| Engine | Kern-Output |
|---|---|
| Nutrition | nutrition_score, protein_gap, calorie_gap, micronutrient_deficits |
| Training | training_readiness, progression_state, overreach_risk |
| Recovery | recovery_score, deload_recommendation, sleep_priority_flag |
| Biomarker | biomarker_risk_flags, escalation_recommendation |
| Supplement | stack_safety_score, interaction_flags |
| Body Composition | composition_score, phase_state, tdee_estimate |
| Behaviour | compliance_score, adherence_pattern |
| Circadian | circadian_alignment_score, optimal_training_window |
| Energy Availability | energy_availability_score, underfueling_flag |
| Stress Load | stress_load_score, overload_flag |
| Electrolyte | electrolyte_balance_score, imbalance_flags |

---

## Cron Jobs

| Job | Schedule | Beschreibung |
|---|---|---|
| Proaktiver Wächter | Täglich 02:00 | Alle User auf kritische Patterns prüfen |
| BSS Berechnung | Täglich 03:00 | Rolling 90d BSS für alle aktiven User |
| Behavioral Signature | Täglich 04:00 | Update für User mit ≥ 8 Wochen Daten |
| Journey Dispatcher | Jede Minute | Heartbeat-Checkpoints feuern |
| Memory Decay | Täglich 06:00 | Alte/ungenutzte Memories abschwächen |
| Weekly Deep Report | Mo 05:00 | Wochenbericht für Elite-User |

---

## LLM Stack

| Pfad | Modell | Kosten/Request | Wann |
|---|---|---|---|
| Fast Path | — (kein LLM) | $0 | Dashboard Cards, Scores (60%) |
| Knowledge Path | GLM-4.7-Flash / Haiku | ~$0.002 | Wissensfragen (20%) |
| Hybrid Path | GLM-4.7-Flash / Sonnet | ~$0.005–0.02 | Cross-Module Analyse (20%) |

**Kosten/User/Monat:** Free ~$0.01 · Plus ~$0.15–0.30 · Pro ~$3.50 · Elite ~$4.50–5.00

---

## API Summary

```
http://coach:5500
  /api/coach/chat              Text-Chat + SSE Streaming
  /api/coach/buddy/            Dashboard, State, Trends, Health
  /api/coach/actions/          App Butler (logMeal, logWater, ...)
  /api/coach/memory            Memory CRUD + Transparency
  /api/coach/knowledge/        RAG Knowledge Base
  /api/coach/coaching/         Suggestions, Weekly Report
  /api/coach/automations       Konfigurierbare Rules
  /api/coach/profile           Coach-Profil + Feature-Tier
  /api/coach/journey           Heartbeat Konfiguration
  /api/coach/alerts            Proaktiver Wächter
  /api/coach/gym-finder        Google Places Integration
  /api/coach/intervention/     Adaptive Intervention Engine
  /api/coach/bss               Behavior Stability Score
  /api/coach/clone/            AI Clone (Coach B2B)
  /api/coach/for-human-coach   Human Coach Integration
  /api/coach/buddy-data/       Aggregated Data (Floating Widget)
```

---

## Offene Punkte (Top 5)

| # | Feature | Priorität |
|---|---|---|
| 1 | Voice Input vollständig (STT on-device + TTS Streaming) | 🔴 Hoch |
| 2 | Action Execution vollständig (Intent + Smart Confirmation + Undo) | 🔴 Hoch |
| 3 | Proaktiver Wächter Background Worker + Web Push API | 🔴 Hoch |
| 4 | Feature Gate Middleware (Tier-Check, DB-basiert, A/B-fähig) | 🟡 Mittel |
| 5 | Behavioral Signature ab 8 Wochen (Muster-Erkennung) | 🟡 Mittel |

---

## Kompetitiver Vorteil

Kein Competitor hat:
**Human Coach + AI Butler + Cross-Module Tracking + Konfigurierbarkeit auf allen Ebenen**

- Trainerize: Coach-Tools aber keine AI und keine Daten-Tiefe
- ChatGPT: AI aber keine echten User-Daten
- Welltory: AI + Daten aber kein Training/Nutrition/Coach
- **LumeOS Buddy: alles.**
