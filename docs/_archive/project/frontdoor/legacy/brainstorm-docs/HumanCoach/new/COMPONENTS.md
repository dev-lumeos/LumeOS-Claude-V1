# Human Coach Module — Frontend Components

## Two Apps

| App | URL | Beschreibung |
|---|---|---|
| `apps/coach/` | Port 8502 | Coach-Anwendung (separates Next.js App) |
| `apps/app/modules/human-coach/` | Integriert | Client-Ansicht (Coach-Chat, Permissions, Programme) |

---

## Coach App — Navigation

| Tab | Beschreibung |
|---|---|
| Dashboard | Summary + Client Cards + Activity Feed |
| Clients | Client-Liste + Einzelansichten |
| Alerts | Alert-Verwaltung |
| Rules | Rule Builder |
| Programs | Program Builder + Library |
| Analytics | Adherence + Performance |
| Settings | Profil, Notifications, Billing |

---

## Dashboard Components (8)

| Component | Beschreibung |
|---|---|
| `CoachDashboard` | Haupt-Layout mit Summary + Client Grid |
| `SummaryWidget` | 6 Kacheln: Clients, Alerts, Adherence, Autonomy Level |
| `ClientCard` | Kompakte Karte: Status-Farbe, Alert-Badges, Quick Metrics |
| `ClientStatusBadge` | excellent / good / attention / critical |
| `AlertBadgeGroup` | Rote/Orange/Gelbe Badges pro Severity |
| `ActivityFeed` | Live-Feed aller Client-Events |
| `ActivityFeedItem` | Einzelnes Event mit Kontext + Action Button |
| `CoachPerformancePanel` | KPI-Kacheln für Coach-Analytics |

---

## Client Detail Components (9)

| Component | Beschreibung |
|---|---|
| `ClientDetailView` | Master-Layout mit allen Tabs |
| `ClientOverviewTab` | Status, Phase, Autonomy, letzter Kontakt |
| `TrainingTab` | Volume, PRs, Adherence, Muscle Balance (mit Permission) |
| `NutritionTab` | Macros, Mikronährstoffe, Adherence (mit Permission) |
| `RecoveryTab` | Score Trend, HRV, Sleep, Muscle Map (mit Permission) |
| `SupplementsTab` | Stack, Compliance, Interaktionen (mit Permission) |
| `MedicalTab` | Bloodwork Trends (sensitiv — mit spez. Permission) |
| `GoalsTab` | Phase, TDEE, Progress, Bottleneck (mit Permission) |
| `PermissionLock` | Grau-Overlay wenn keine Permission |

---

## Alert Components (5)

| Component | Beschreibung |
|---|---|
| `AlertList` | Filter (Severity, Type, Client) + sortierte Liste |
| `AlertCard` | Title, Client, Severity-Farbe, Message, Actions |
| `AlertActionBar` | Acknowledge / Resolve / Dismiss mit Note |
| `AlertBulkActions` | Mehrere Alerts gleichzeitig behandeln |
| `AlertBadge` | Mini-Badge für Header-Notifications |

---

## Rule Builder Components (6)

| Component | Beschreibung |
|---|---|
| `RuleBuilder` | Haupt-Editor: Name, Conditions, Logic, Action |
| `ConditionEditor` | Einzelne Bedingung: Module, Metric, Operator, Value |
| `LogicToggle` | AND / OR Umschalter zwischen Conditions |
| `ActionEditor` | Alert / Message / Plan Adjustment konfigurieren |
| `RuleTestResult` | "Würde heute für X Clients feuern" |
| `RuleTemplateGallery` | System-Templates zum Importieren |

---

## Autonomy Components (3)

| Component | Beschreibung |
|---|---|
| `AutonomyLevelCard` | Aktueller Level + Beschreibung + Scores |
| `AutonomyLevelSelector` | 1–5 Auswahl mit Konsequenzen-Preview |
| `AutonomyHistoryList` | Timeline aller Level-Änderungen |

---

## Adherence Components (4)

| Component | Beschreibung |
|---|---|
| `AdherenceOverview` | Alle Clients als Heatmap |
| `AdherenceDimensionChart` | Nutrition / Training / Recovery / Supplements |
| `AdherenceTrendChart` | 30-Tage Verlauf mit Intervention Points |
| `AdherenceBenchmark` | Client vs. Kohorte vs. Zielwert |

---

## Program Builder Components (5)

| Component | Beschreibung |
|---|---|
| `ProgramLibrary` | Alle Programme des Coaches |
| `ProgramBuilder` | Training + Nutrition + Supplement kombinieren |
| `ProgramPhaseEditor` | Wochenpläne + Periodisierung |
| `ClientAssigner` | Programm einem oder mehreren Clients zuweisen |
| `AutoDeliveryConfig` | Zeitgesteuerte Freischaltung von Wochen |

---

## Communication Components (4)

| Component | Beschreibung |
|---|---|
| `CoachChat` | Chat-Interface mit Client |
| `MessageBubble` | Text / Note / Task / Plan Update |
| `CheckinTemplateEditor` | Wöchentliches Check-in konfigurieren |
| `CheckinResponseView` | Client-Antworten strukturiert |

---

## Client-App Components (4) — in apps/app

| Component | Beschreibung |
|---|---|
| `MyCoachCard` | Coach-Info + letzter Kontakt |
| `CoachChatClient` | Chat mit Coach vom Client |
| `AssignedProgramsView` | Vom Coach zugewiesene Programme |
| `PermissionSettings` | Was darf mein Coach sehen? |

---

## Custom Hooks (Coach App) — 14

| Hook | Beschreibung |
|---|---|
| `useCoachDashboard()` | Summary + Client Cards |
| `useActivityFeed()` | Live Activity Feed |
| `useClients(filter?)` | Client-Liste |
| `useClientDetail(id)` | Vollständiges Client-Profil |
| `useAlerts(filter?)` | Alert-Liste |
| `useAlertActions()` | acknowledge, resolve, dismiss |
| `useRules()` | Regel-Liste |
| `useRuleActions()` | create, update, delete, test |
| `useRuleTemplates()` | System-Templates |
| `useAutonomy(clientId)` | Level + History |
| `useAdherence(clientId, days)` | Adherence History |
| `usePrograms()` | Programm-Bibliothek |
| `useMessages(clientId)` | Chat-Verlauf |
| `useCoachPerformance()` | KPI-Metriken |

---

## Shared Contracts

```
packages/contracts/src/human-coach/
  profile.ts          CoachProfile, CoachRole
  client.ts           CoachClient, CoachClientStatus
  permission.ts       CoachPermission, AccessLevel
  alert.ts            CoachAlert, AlertSeverity
  rule.ts             CoachRule, RuleCondition, RuleAction
  autonomy.ts         AutonomyLevel, AutonomyHistory
  adherence.ts        AdherenceSummary, AdherenceTrend
  message.ts          CoachMessage
  program.ts          CoachProgram, ProgramPhase
  dashboard.ts        DashboardSummary, ClientCard, ActivityFeedItem
```
