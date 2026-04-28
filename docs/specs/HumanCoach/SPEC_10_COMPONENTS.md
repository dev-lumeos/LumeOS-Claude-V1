# Human Coach Module — Frontend Components (Spec)
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Two Apps

| App | Port | Beschreibung |
|---|---|---|
| `apps/coach/` | 8502 | Coach-Dashboard (separates Next.js App) |
| `apps/app/` (integriert) | — | Client-Ansicht innerhalb Lumeos |

---

## Coach App — Pages

| Page | Route | Beschreibung |
|---|---|---|
| `page.tsx` | `/` | Dashboard (Default) |
| `clients/page.tsx` | `/clients` | Client-Liste |
| `clients/[id]/page.tsx` | `/clients/:id` | Client-Detail (Multi-Tab) |
| `alerts/page.tsx` | `/alerts` | Alert-Management |
| `rules/page.tsx` | `/rules` | Rule Builder |
| `programs/page.tsx` | `/programs` | Program Builder + Library |
| `analytics/page.tsx` | `/analytics` | Performance Analytics |

---

## Dashboard Components (8)

| Component | Beschreibung |
|---|---|
| `CoachDashboard` | Layout: Summary + Client Grid + Activity Feed |
| `SummaryWidget` | 6 Metriken-Kacheln: Clients, Alerts, Adherence, Autonomy |
| `ClientCard` | Kompakt: Status-Farbe, Alert-Badges, Quick Metrics, Action-Buttons |
| `ClientCardGrid` | Sortiertes Grid (critical zuerst) |
| `ClientStatusBadge` | excellent/good/attention/critical mit Farbe |
| `AlertBadgeGroup` | Critical+High+Medium Badges nebeneinander |
| `ActivityFeed` | Scrollbarer Event-Stream aller Clients |
| `ActivityFeedItem` | Event mit Kontext, Zeitstempel, Action-Button |

---

## Client Detail Components (10)

| Component | Beschreibung |
|---|---|
| `ClientDetailLayout` | Header + 7-Tab Navigation |
| `ClientOverviewTab` | Status, Phase, Autonomy, Billing, letzter Kontakt |
| `TrainingTab` | Sessions, Volume, PRs, Strength Chart (Permission-gefiltert) |
| `NutritionTab` | Macros, Adherence, Mikronährstoffe (Permission-gefiltert) |
| `RecoveryTab` | Score Trend, HRV Chart, Sleep, Muscle Map |
| `SupplementsTab` | Stack, Compliance Trend, Interactions |
| `MedicalTab` | System Scores, Bloodwork Trends (nur wenn permission: full) |
| `GoalsTab` | Phase, TDEE, Progress, Bottleneck, Trajectory |
| `ChatTab` | In-App Chat, Note History, Check-in Responses |
| `PermissionLock` | Overlay wenn permission: none (erklärt, fordert nicht auf) |

---

## Alert Components (5)

| Component | Beschreibung |
|---|---|
| `AlertDashboard` | Filter + sortierte Alert-Liste |
| `AlertCard` | Severity-Farbe, Client, Title, Message, Recommended Actions |
| `AlertActionPanel` | Acknowledge / Resolve / Dismiss + Note-Eingabe |
| `AlertBulkActions` | Mehrere Alerts gleichzeitig behandeln |
| `AlertBadge` | Mini-Badge für Header + Client Cards |

---

## Rule Builder Components (6)

| Component | Beschreibung |
|---|---|
| `RuleList` | Alle Regeln mit Status, Trigger Count, Effectiveness |
| `RuleBuilder` | Editor: Name, Conditions, Logic Toggle, Action, Cooldown |
| `ConditionRow` | Einzelne Bedingung: Module-Select, Metric-Select, Operator, Value |
| `AddConditionButton` | + Condition hinzufügen |
| `RuleTestPanel` | "Für welche Clients würde diese Regel heute feuern?" |
| `TemplateGallery` | Featured + All Templates als Cards |

---

## Autonomy Components (4)

| Component | Beschreibung |
|---|---|
| `AutonomyCard` | Aktueller Level, Scores, Nächste Assessment |
| `AutonomyLevelSlider` | 1–5 Auswahl mit Konsequenzen-Preview |
| `AutonomyRecommendation` | "Empfehlung: Level 2→3" mit Begründung |
| `AutonomyHistoryTimeline` | Alle Level-Änderungen als Timeline |

---

## Adherence Components (4)

| Component | Beschreibung |
|---|---|
| `AdherenceHeatmap` | Alle Clients × Tage als Heatmap |
| `AdherenceDimensionBars` | 4 Balken: Nutrition, Training, Recovery, Supplements |
| `AdherenceTrendChart` | 30-Tage Linien-Chart mit Intervention Points |
| `AdherenceBenchmarkCard` | Client vs. Kohorte vs. Ziel |

---

## Program Builder Components (4)

| Component | Beschreibung |
|---|---|
| `ProgramLibrary` | Alle Coach-Programme mit Filter |
| `ProgramBuilder` | Training + Nutrition + Supplement kombinieren |
| `AutoDeliveryConfig` | Wöchentliche Freischaltung konfigurieren |
| `ClientAssigner` | Programm einem oder mehreren Clients zuweisen |

---

## Communication Components (4)

| Component | Beschreibung |
|---|---|
| `CoachChatThread` | Chat mit Client (Text, Typ-Anzeige) |
| `MessageBubble` | Textnachricht, Note, Task, Plan Update |
| `CheckinEditor` | Check-in Template konfigurieren |
| `CheckinResponseCard` | Client-Antwort mit vorausgefüllten Daten |

---

## Client-App Components (4) — in apps/app

| Component | Beschreibung |
|---|---|
| `MyCoachBanner` | Coach-Karte auf Home Screen |
| `CoachChatClient` | Chat mit Coach |
| `AssignedProgramsList` | Vom Coach zugewiesene Programme bestätigen |
| `PermissionManager` | Was darf mein Coach sehen? |

---

## Custom Hooks — Coach App (14)

| Hook | Beschreibung |
|---|---|
| `useCoachDashboard()` | Summary + Client Cards |
| `useActivityFeed(limit?)` | Event-Stream |
| `useClients(filter?)` | Client-Liste mit Pagination |
| `useClientDetail(id)` | Vollständiges Permission-gefiltertes Profil |
| `useAlerts(filter?)` | Alert-Liste |
| `useAlertActions()` | read, acknowledge, resolve, dismiss, bulkAcknowledge |
| `useRules()` | Regel-Liste |
| `useRuleActions()` | create, update, enable, disable, delete, test |
| `useRuleTemplates()` | System-Templates |
| `useAutonomy(clientId)` | Level + Recommendation + History |
| `useAdherence(clientId, days)` | Adherence Summary + Trend |
| `usePrograms()` | Programm-Bibliothek |
| `useMessages(clientId)` | Chat + Pagination |
| `useCoachPerformance(period)` | KPI Metriken |

---

## Stores — Coach App (2)

```typescript
// coachUIStore
interface CoachUIStore {
  selectedClientId:   string | null;
  clientDetailTab:    'overview'|'training'|'nutrition'|'recovery'|
                      'supplements'|'medical'|'goals'|'chat';
  alertFilter:        { severity?: string; type?: string };
  dashboardSort:      'risk'|'name'|'activity';

  selectClient(id: string): void;
  setDetailTab(tab: string): void;
  setAlertFilter(f: Partial<AlertFilter>): void;
}

// ruleBuilderStore
interface RuleBuilderStore {
  draft: Partial<CoachRule>;
  testResult: RuleTestResult | null;

  setDraftField(field: string, value: unknown): void;
  addCondition(): void;
  removeCondition(idx: number): void;
  updateCondition(idx: number, field: string, value: unknown): void;
  setTestResult(result: RuleTestResult): void;
  resetDraft(): void;
}
```

---

## i18n — 280+ Keys (Auszug)

```
coach.dashboard.title              = "Coach Dashboard"
coach.client.status.excellent      = "Ausgezeichnet"
coach.client.status.attention      = "Aufmerksamkeit benötigt"
coach.client.status.critical       = "Kritisch"
coach.alert.severity.critical      = "Kritisch"
coach.alert.action.acknowledge     = "Bestätigen"
coach.alert.action.resolve         = "Lösen"
coach.rule.logic.and               = "UND (alle müssen zutreffen)"
coach.rule.logic.or                = "ODER (mindestens eine muss zutreffen)"
coach.autonomy.level.1             = "Anfänger (täglich)"
coach.autonomy.level.2             = "Entwicklend (wöchentlich)"
coach.autonomy.level.3             = "Fortgeschritten"
coach.autonomy.level.4             = "Erfahren"
coach.autonomy.level.5             = "Experte (monatlich)"
coach.permission.medical.warning   = "Medical-Daten sind sensitiv. Client muss aktiv freigeben."
coach.permission.none              = "Kein Zugriff"
coach.permission.summary           = "Nur Score + Trend"
coach.permission.full              = "Vollständiger Zugriff"
```

---

## Shared Contracts

```
packages/contracts/src/human-coach/
  profile.ts      CoachProfile, CoachRole
  client.ts       CoachClient, ClientStatus, RiskLevel
  permission.ts   CoachPermission, AccessLevel
  alert.ts        CoachAlert, AlertSeverity, AlertType
  rule.ts         CoachRule, RuleCondition, RuleAction, Operator
  autonomy.ts     AutonomyLevel, AutonomyScores, AutonomyRecommendation
  adherence.ts    AdherenceSummary, AdherenceTrend
  message.ts      CoachMessage, MessageType
  program.ts      CoachProgram, ProgramPhase
  dashboard.ts    DashboardSummary, ClientCard, ActivityFeedItem
  performance.ts  CoachPerformanceMetrics
  scoring.ts      ClientStatus, RiskLevel, WeightedAdherence
```
