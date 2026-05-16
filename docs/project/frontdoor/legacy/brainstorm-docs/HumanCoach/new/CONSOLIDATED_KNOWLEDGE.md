# Human Coach Module — Konsolidiertes Wissen
> Konsolidiert aus 10 Alt-Dokumenten | 2026-04-17
> Quellen: 09_MODULE_HUMAN_COACH.md, lumeos-coach-strategy.md, coach-workflows.md,
> humancoach_DATABASE.md, humancoach_FEATURES.md, humancoach_API.md,
> humancoach_COMPONENTS.md, humancoach_README.md, humancoach_RESEARCH.md,
> humancoach_MIGRATION.md

---

## 1. Zweck & Status

**Port 5600. B2B/B2C Coaching-Plattform innerhalb LumeOS.**

Professionelles Dashboard und Werkzeug für Personal Trainer und Coaches.
User bleibt immer Eigentümer seiner Daten.
Coach arbeitet ausschließlich mit explizit freigegebenen Permissions.

**Status (2026-04-14):** ✅ 95% MVP komplett

**Kern-Innovation:** Client App = Lumeos App (kein Doppel-Tracking)

---

## 2. Kern-Innovation: Client App = Lumeos App

```
Trainerize-Modell:  Coach App ←→ Client App (separate, limited)
Lumeos-Modell:      Coach Dashboard ←→ Client's FULL Lumeos App

→ Coach sieht ALLES was der Klient trackt (mit Permission)
→ Klient braucht keine separate App
→ Cross-Module Insights automatisch verfügbar
→ Kein Doppel-Tracking
```

---

## 3. Features (Kern)

### Coach Dashboard
- Summary Widget: Total/Active Clients, Critical Alerts, Weekly Adherence
- Dynamic Client Cards: Status (excellent/good/attention/critical), Alert-Badges, Quick Metrics
- Interactive Activity Feed: Achievements, Check-ins, Alerts, Goal Updates
- Coach Performance Analytics: Retention, Satisfaction, Goal Completion Rate

### Alert System (5 Severity-Level)
| Level | Bedeutung | Response Time |
|---|---|---|
| CRITICAL (1) | Safety / Health Concern | Sofort |
| HIGH (2) | Signifikanter Performance-Drop | Gleicher Tag |
| MEDIUM (3) | Trends mit Aufmerksamkeitsbedarf | 2-3 Tage |
| LOW (4) | Kleine Abweichungen | Weekly Review |
| INFO (5) | Positive Updates + Achievements | FYI |

Alert-Typen: adherence_drop, missed_goals, recovery_issues, nutrition_concerns, supplement_interactions, medical_concern

### Rule Builder (Visual, Drag-and-Drop)
Coaches erstellen Regeln wie:
- "IF nutrition.protein_pct < 70 AND training.session_today = true → Alert MEDIUM"
- "IF recovery.score_trend_down (7d) AND training.volume_trend_up (7d) → Alert HIGH"
Cooldown, AND/OR Logic, Template System.

### 5-Level Autonomy System
| Level | Name | Check-Frequenz |
|---|---|---|
| 1 | Novice | Täglich |
| 2 | Developing | 3×/Woche |
| 3 | Intermediate | Wöchentlich |
| 4 | Advanced | Bi-wöchentlich |
| 5 | Expert | Monatlich |

### Permission System
- User kontrolliert granular welche Daten Coach sieht
- Kategorien: nutrition, training, recovery, supplements, medical, goals, bodyMetrics
- Granularität: full / summary / none
- Time-limited Access Tokens möglich
- Read-only für Coach (kein direktes Schreiben in User-Daten)
- GDPR-konform by design

### Communication
- In-App Chat (Text, Voice Notes geplant)
- Notizen + Tasks
- Check-in Templates (wöchentlich, auto)
- Plan Assignment (Training + Nutrition Plans)
- Video Call Integration (geplant: Zoom/Meet Embed)

---

## 4. Datenbank-Kern

| Tabelle | Beschreibung |
|---|---|
| `coach_profiles` | Coach-Profil (Zertifikate, Specializations, Role) |
| `coach_clients` | Coach-Client-Mapping (Autonomy Level, Status) |
| `coach_client_permissions` | Granulare Permissions per Modul |
| `coach_alerts` | Alert-Lifecycle (open/acknowledged/resolved) |
| `coach_alert_settings` | Coach Notification Preferences |
| `coach_rules` | Automatische Alert-Regeln (Rule Engine) |
| `coach_rule_templates` | Vordefinierte Regel-Templates |
| `client_autonomy_levels` | Aktuelle Autonomy Level |
| `client_autonomy_history` | Level-Änderungen |
| `client_adherence_summary` | Tägliche Adherence per Dimension |
| `coach_messages` | In-App Chat |
| `coach_performance_metrics` | Coach KPIs |

VIEWs: `coach_dashboard_summary` · `client_risk_assessment` · `coach_dashboard_cache` (Materialized)

---

## 5. Coach-Typen

| Typ | Clients | Preis/Client | Bedarf |
|---|---|---|---|
| Bodybuilding Prep | 5–15 | $200–500/mo | Enhanced Monitoring, Bloodwork, Nutrition präzise |
| Online Fitness Coach | 20–100 | $50–150/mo | Workout Programming, Scalability |
| PT (In-Person + Online) | 10–30 | $150–300/mo | Scheduling, Progress Tracking |
| Nutrition Coach | 20–50 | $100–200/mo | Meal Plans, Compliance |
| Strength Coach | 10–30 | $100–200/mo | Periodization, PR Tracking |

---

## 6. Cross-Module Verbindungen

| Modul | Coach sieht (mit Permission) | Was Coach gibt |
|---|---|---|
| Nutrition | Food Log, Macros, 138 BLS Mikronährstoffe, Adherence | Nutrition Plans, Macro Targets |
| Training | Volume, PRs, Sessions, Muscle Balance | Training Programs, Routines |
| Recovery | Recovery Score, HRV, Sleep, Muscle Map | Recovery Guidelines |
| Supplements | Stack, Compliance, Interactions | Supplement Protocols |
| Medical | Bloodwork Trends, Medications (sensitiv!) | Bloodwork-Empfehlungen |
| Goals | Phase, TDEE, Progress, Trajectory | Goal-Adjustments, Phase-Wechsel |

---

## 7. Business Model

```
Coach Plan (B2B SaaS):
  Starter: $29/mo (bis 10 Clients)
  Professional: $49/mo (bis 50 Clients)
  Business: $99/mo (bis 150, AI Clone, Marketplace)
  Enterprise: $199/mo (Unlimited, Team, White-Label)

Revenue Streams:
  1. Coach Subscriptions (50%)
  2. AI Clone Premium ($99/mo add-on) (20%)
  3. Marketplace Commission (80/20 Split) (15%)
  4. Client Upgrade Affiliate (10%)
  5. White-Label (5%)
```

---

## 8. Schlüssel-Workflows

### Weekly Check-In (automatisiert)
1. Auto-Reminder → Client füllt Check-In
2. System zieht automatisch: Gewicht, Recovery Score, Adherence Rate
3. Coach sieht Dashboard-Summary, nicht rohe Datenmenge
4. Coach reagiert auf Flags, justiert Plan

### Bodybuilding Prep Coach (Enhanced Mode)
- Wöchentliche Monitoring: Body Comp, Macro Adherence, Training, Recovery, HRV
- Bloodwork alle 4–6 Wochen (Hormone, Leber/Niere, Hematocrit)
- Enhanced Protocol: Compounds, Dosierungen, Side Effects, PCT Planning
- Supplement Stack: Liver Support, Cardiovascular, Performance
