# LUMEOS — Modul: Human Coach
> Konsolidiert | 2026-04-14
> API Port: 5600 | Status: ✅ 95% MVP komplett

---

## 1. Zweck

Das Human-Coach-Modul ist die B2B/B2C-Seite von Lumeos — ein professionelles Dashboard und Coaching-Werkzeug für Personal Trainer und Coaches. Der User bleibt immer Eigentümer seiner Daten. Der Coach arbeitet ausschließlich mit explizit freigegebenen Permissions.

---

## 2. Architektur

```
Frontend (apps/coach/ — Port 8502)
  Coach App (Next.js) — separates Frontend für Coaches
  apps/app/modules/human-coach/  — Client-seitige Ansicht

API Layer (Hono, Port 5600)
  src/api/human-coach/
    ├── routes/
    │   ├── dashboard.ts        (Coach Dashboard Data)
    │   ├── clients.ts          (Client Management)
    │   ├── alerts.ts           (Alert System)
    │   ├── rules.ts            (Rule Builder)
    │   ├── autonomy.ts         (Autonomy Management)
    │   ├── adherence.ts        (Adherence Analytics)
    │   └── messages.ts         (Coach-Client Chat)
    └── services/
        └── dashboard.ts        (Data Aggregation)
```

---

## 3. Features

### 3.1 Coach Dashboard (D5)

**Summary Widget:**
```typescript
interface DashboardSummary {
  totalClients: number;
  activeClients: number;
  criticalAlerts: number;
  weeklyAdherence: number;       // % Durchschnitt aller Clients
  avgAutonomyLevel: number;      // 1-5
  recentAchievements: number;
}
```

**Dynamic Client Cards:**
- Name, Avatar, Beitrittsdatum, Autonomy Level
- Status: excellent | good | attention | critical
- Alert-Badges: critical / high / medium Count
- Last Activity Timestamp
- Quick Metrics: Adherence (+ Trend), Recovery Score, Goal Progress
- Quick Action Buttons: message, call, adjust_plan, view_details
- Smart Prioritization: automatische Sortierung nach Aufmerksamkeitsbedarf

**Interactive Activity Feed:**
- Event-Typen: achievements, check-ins, alerts, goal updates
- Smart Filtering (Event-Typ, Client, Priorität, Zeitraum)
- Contextual Action Buttons pro Event
- Pattern-Highlighting: Anomalien und Trends

**Coach Performance Analytics:**
```typescript
interface CoachPerformanceMetrics {
  clientRetention: number;           // Retention Rate
  avgClientSatisfaction: number;     // Rating
  goalCompletionRate: number;
  avgResponseTime: number;           // Stunden
  alertResolutionRate: number;
  proactiveInterventionSuccessRate: number;
  revenuePerClient: number;
  clientLifetimeValue: number;
}
```

### 3.2 Alert System (D6)

**Alert Severities:**
| Level | Bedeutung | Response Time |
|---|---|---|
| CRITICAL (1) | Client Safety / Health Concern | Sofort |
| HIGH (2) | Signifikanter Performance-Drop | Gleicher Tag |
| MEDIUM (3) | Trends mit Aufmerksamkeitsbedarf | 2-3 Tage |
| LOW (4) | Kleine Abweichungen | Weekly Review |
| INFO (5) | Positive Updates + Achievements | FYI |

**Alert-Typen:**
- `adherence_drop` — Compliance stark gefallen
- `missed_goals` — Goals nicht erreicht
- `recovery_issues` — Recovery Score kritisch
- `nutrition_concerns` — Ernährungs-Probleme
- `supplement_interactions` — Kritische Interaktion entdeckt
- `medical_concern` — Medizinischer Alert

**Smart Alert Intelligence:**
```typescript
interface SmartAlert {
  confidence: number;              // AI-Konfidenz 0-1
  falsePositiveRisk: number;       // Wahrscheinlichkeit False Positive
  predictedOutcome: string;        // Was passiert wenn nicht addressed
  similarCases: number;            // Historisch ähnliche Fälle
  autoEscalateAfter: number;       // Stunden bis Auto-Eskalation
}
```

### 3.3 Rule Builder (A2.5 + B11)
- **Visual Rule Builder:** Drag-and-Drop Interface
- **Multi-Condition Logic:** AND/OR Kombinationen
- **Real-time Validation:** Sofortige Vorschau
- **Template System:** Vordefinierte Regel-Templates

**Regel-Format:**
```typescript
interface CoachRule {
  id: UUID;
  name: string;
  conditions: {
    module: 'nutrition' | 'training' | 'recovery' | 'supplements' | 'medical';
    metric: string;          // z.B. 'daily_score', 'recovery_score'
    operator: '<' | '>' | '<=' | '>=' | '==' | 'trend_down' | 'trend_up';
    value: number;
    timeframe?: number;      // Tage für Trend-Berechnung
  }[];
  logic: 'AND' | 'OR';
  action: {
    type: 'alert' | 'message' | 'plan_adjustment';
    severity?: AlertSeverity;
    template?: string;
  };
  cooldown_hours: number;    // Nicht zu oft feuern
}
```

**Beispiel-Regeln:**
```
Regel "Protein Alert":
  IF nutrition.protein_pct < 70 AND training.session_today = true
  → Alert MEDIUM "Client unter Protein-Ziel an Trainingstag"

Regel "Übertraining-Warning":
  IF recovery.score_trend_down = true (7d) AND training.volume_trend_up = true (7d)
  → Alert HIGH "Mögliches Übertraining"

Regel "Streak Achievement":
  IF training.consecutive_days >= 7
  → Message "Glückwunsch zu 7 Tagen in Folge! 🔥"
```

### 3.4 Client Autonomy Management (D8)

**5-Level Autonomy System:**
| Level | Name | Coaching-Intensität | Intervention-Threshold |
|---|---|---|---|
| 1 | Novice | Hoch — tägliche Checks | Jede kleine Abweichung |
| 2 | Developing | Regelmäßig — 3×/Woche | Moderate Abweichungen |
| 3 | Intermediate | Wöchentlich | Signifikante Trends |
| 4 | Advanced | Bi-wöchentlich | Kritische Alerts nur |
| 5 | Expert | Monatlich | Nur auf Anfrage |

**Dynamic Level Adjustment:**
- Automatische Anpassung basierend auf Performance-Daten
- Coach kann manuell überschreiben (mit Begründung)
- Audit Log aller Level-Änderungen

### 3.5 Adherence Analytics (D9)

**Multi-Dimensional Tracking:**
```typescript
interface ClientAdherence {
  nutrition: { compliance: number; trend: string; bottleneck: string };
  training: { sessionsCompleted: number; sessionsPlanned: number; trend: string };
  recovery: { checkinRate: number; avgScore: number };
  supplements: { complianceRate: number };
  overall: number;                  // Gewichteter Average
  vsCohorte: number;               // Vergleich mit ähnlichen Clients
  vsTarget: number;                // Vs. Client-eigenes Ziel
}
```

**Trend Analysis:**
- Langzeit-Adherence-Patterns
- Vorhersage kritischer Adherence-Drops
- Benchmark: Client vs. Kohorte vs. Zielwert
- Intervention Points: automatische Erkennung

### 3.6 Client-Coach Kommunikation
- In-App Chat mit History
- Notizen + Tasks
- Check-in Templates
- Plan Assignment (Training + Nutrition Plans)
- Voice Notes (geplant)

### 3.7 Permission System
- User kontrolliert granular welche Daten der Coach sieht
- Permission-Kategorien: nutrition, training, recovery, supplements, medical
- Read-only für Coach (kein direktes Schreiben in User-Daten)
- Consent-Log: wann was freigegeben wurde

---

## 4. Datenbank-Schema

### `coach_clients`
```sql
id              UUID PK
coach_id        UUID FK           -- Coach User
client_id       UUID FK           -- Client User
status          VARCHAR           -- active, paused, ended
autonomy_level  INTEGER           -- 1-5
start_date      DATE
end_date        DATE
notes           TEXT
created_at      TIMESTAMPTZ
```

### `coach_client_permissions`
```sql
coach_client_id UUID FK
module          VARCHAR           -- nutrition, training, recovery, ...
can_read        BOOLEAN DEFAULT false
can_write       BOOLEAN DEFAULT false  -- i.d.R. false (Client-Ownership)
granted_at      TIMESTAMPTZ
granted_by      UUID              -- Client-User-ID
```

### `coach_alerts`
```sql
id              UUID PK
coach_id        UUID FK
client_id       UUID FK
alert_type      VARCHAR
severity        INTEGER           -- 1-5
title           TEXT
description     TEXT
context_data    JSONB
triggered_at    TIMESTAMPTZ
acknowledged_at TIMESTAMPTZ
resolved_at     TIMESTAMPTZ
status          VARCHAR           -- open, acknowledged, resolved, dismissed
```

### `coach_rules`
```sql
id              UUID PK
coach_id        UUID FK
name            VARCHAR
conditions      JSONB
logic           VARCHAR           -- AND, OR
action          JSONB
is_active       BOOLEAN DEFAULT true
cooldown_hours  INTEGER DEFAULT 24
last_fired      TIMESTAMPTZ
fire_count      INTEGER DEFAULT 0
```

### `coach_client_autonomy_log`
```sql
id              UUID PK
coach_client_id UUID FK
old_level       INTEGER
new_level       INTEGER
reason          TEXT
changed_at      TIMESTAMPTZ
changed_by      UUID              -- coach oder system
```

### `coach_messages`
```sql
id              UUID PK
coach_client_id UUID FK
sender_id       UUID FK
content         TEXT
message_type    VARCHAR           -- text, note, task, plan_update
read_at         TIMESTAMPTZ
created_at      TIMESTAMPTZ
```

---

## 5. API-Endpunkte

| Route | Hauptendpunkte |
|---|---|
| `dashboard.ts` | `GET /dashboard/summary`, `/dashboard/clients`, `/dashboard/activity`, `/dashboard/metrics` |
| `clients.ts` | CRUD Coach-Client-Relations, `GET /clients/:id/full-profile` |
| `alerts.ts` | `GET /alerts` (gefiltert), `POST /alerts/:id/acknowledge`, `POST /alerts/:id/resolve` |
| `rules.ts` | CRUD Rules, `POST /rules/:id/test` (Preview) |
| `autonomy.ts` | `PUT /clients/:id/autonomy`, `GET /clients/:id/autonomy-history` |
| `adherence.ts` | `GET /clients/:id/adherence`, `GET /clients/:id/adherence/trend` |
| `messages.ts` | `GET /messages/:client_id`, `POST /messages` |

---

## 6. Business Model für Coaches

```
Coach subscribed zu Lumeos B2B Plan
  ├── Stripe Payment (monatlich)
  ├── + 50% des Abo-Betrags als Lumeos Voucher gutgeschrieben
  └── Revenue Wallet: Anteil an Client-Transaktionen auf Plattform

Client zahlt für Coach-Sessions via Wallet
  ├── Lumeos nimmt Platform-Fee (%)
  └── Coach erhält Rest in Revenue Wallet
```

---

## 7. Verbindungen zu anderen Modulen

| Modul | Verbindung |
|---|---|
| **Alle Module** | Coach liest (mit Permission) alle Client-Daten |
| **Goals** | Coach sieht + kommentiert Goal-Progress |
| **Coach (AI)** | AI Coach unterstützt den menschlichen Coach mit Insights |
| **Marketplace** | Coach kann Clients direkt auf Produkte verweisen |
| **Auth** | Permission-System über Auth-Modul |

---

## 8. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🟡 | Voice Notes im Chat | 🟡 MITTEL |
| TODO | 🟡 | Video Call Integration | 🟡 MITTEL |
| TODO | 🟡 | Auto-Reminders für Check-ins | 🟡 MITTEL |
| TODO | 🟡 | Multi-Coach / Team Support | 🟡 MITTEL |
| TODO | 🟡 | Coach Branding (Logo, Farben) | 🟡 MITTEL |
| TODO | 🟡 | Client Onboarding Wizard | 🟡 MITTEL |
| TODO | 🟢 | Compliance Leaderboard (echte Daten) | 🟢 NIEDRIG |
| TODO | 🟢 | Coach Directory (öffentliches Profil) | 🟢 NIEDRIG |
