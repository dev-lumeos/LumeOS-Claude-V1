# Human Coach Module — Features

## Implementierte Features

### 1. Coach Dashboard

**Summary Widget:**
- Total Clients / Active Clients
- Critical + High Alerts Count
- Weekly Adherence Ø aller Clients
- Average Autonomy Level

**Dynamic Client Cards:**
- Status: excellent / good / attention / critical (auto-berechnet)
- Alert-Badges: Critical / High / Medium Anzahl
- Quick Metrics: Adherence (+ Trend), Recovery Score, Goal Progress
- Last Activity Timestamp
- Quick Action Buttons: Message, Call, Adjust Plan, View Details
- Smart Prioritization: automatische Sortierung nach Aufmerksamkeitsbedarf

Code: `routes/dashboard.ts` · `CoachDashboard.tsx` · `ClientCard.tsx`

---

### 2. Client Detail View

Vollständiges Client-Profil mit Daten aus allen Modulen (je nach Permission):

- **Overview:** Status, Phase, Autonomy Level, letzter Kontakt
- **Training Log:** Sessions, Volume, PRs, Muscle Balance, Adherence
- **Nutrition Summary:** Kalorienziel vs. Ist, Protein, 138 Mikronährstoffe, Adherence
- **Recovery:** Recovery Score Trend, HRV, Schlaf, Muscle Readiness Map
- **Supplements:** Aktueller Stack, Compliance, Interaktionen
- **Medical:** Bloodwork Trends, letztes Bluttest-Datum (sensitiv — wenn geteilt)
- **Goals:** Phase, TDEE, Progress, Trajectory, Milestones
- **Body Composition:** Gewicht, KF%, FFMI, Umfänge
- **Chat:** Nachrichtenverlauf

Code: `routes/clients.ts` · `ClientDetailView.tsx`

---

### 3. Alert System

**Alert-Generierung:**
- Automatisch via Rule Engine (Coach-Regeln)
- Automatisch via System-Checks (kritische Grenzwerte)
- Manuell vom System bei Safety-Concerns (Enhanced Mode Bloodwork)

**Alert-Lifecycle:**
open → read → acknowledged → resolved (oder dismissed)

**Alert-Management:**
- Filter nach Severity / Typ / Client
- Bulk Actions (alle bestätigen, filtern)
- Coach Notes beim Bestätigen
- Auto-Expiry nach 7 Tagen

Code: `routes/alerts.ts` · `AlertList.tsx` · `AlertCard.tsx`

---

### 4. Rule Builder

Visual Rule Builder mit Drag-and-Drop.

- **Conditions:** Module, Metric, Operator (<, >, trend_up/down), Value, Timeframe
- **Logic:** AND / OR Kombinationen
- **Actions:** Alert, Message, Plan Adjustment
- **Test Mode:** "Feuert diese Regel heute für welche Clients?"
- **Templates:** 10+ System-Templates (Protein Alert, Übertraining, Streak etc.)
- **Cooldown:** Verhindert Alert-Spam (min. X Stunden zwischen Feuern)

Code: `routes/rules.ts` · `RuleBuilder.tsx` · `RuleConditionEditor.tsx`

---

### 5. Client Autonomy Management

**5-Level System:**
- Level anpassen (Coach-manuell oder Auto-Empfehlung)
- Autonomy History mit Begründung
- Automatische Empfehlung basierend auf Adherence + Performance
- Audit Log aller Änderungen

Code: `routes/autonomy.ts` · `AutonomyManager.tsx`

---

### 6. Adherence Analytics

Multi-dimensionales Tracking: Nutrition + Training + Recovery + Supplements.

- Tägliche + wöchentliche Adherence per Dimension
- Trend Analysis (improving / declining / stable)
- Benchmark: Client vs. Kohorte vs. Zielwert
- Intervention Points: automatische Flagging
- Volatility Score (wie konsistent ist der Client?)

Code: `routes/adherence.ts` · `AdherenceView.tsx`

---

### 7. Program Builder + Assignment

**Training Programs:**
- Routine-Bibliothek aus Training-Modul
- Periodisierung (Phasen + Wochen)
- Auto-Delivery (Woche 1 sofort, Woche 2 in 7 Tagen etc.)
- Assign zu einem oder mehreren Clients

**Nutrition Plans:**
- Macro-Targets setzen (verbinden mit Goals/TDEE)
- Meal Plan Templates
- Assign zu Clients

**Supplement Protocols:**
- Stack aus Supplements-Katalog zusammenstellen
- Timing + Dosierung
- Assign zu Clients (Client muss bestätigen)

Code: `routes/programs.ts` · `ProgramBuilder.tsx`

---

### 8. Client-Coach Communication

- In-App Chat (Text, Photos)
- Coach Notes (privat, nicht sichtbar für Client)
- Tasks / To-Dos
- Check-in Templates (Coach konfiguriert, Client füllt aus)
- Auto-Weekly Check-in (zieht automatisch Daten)
- Message Types: text / note / task / plan_update

Code: `routes/messages.ts` · `routes/checkins.ts` · `CoachChat.tsx`

---

### 9. Permission Management

**Client-seitige Ansicht:**
- Übersicht welche Daten der Coach sehen kann
- Granulare Einstellung pro Modul (full / summary / none)
- Time-limited Access möglich
- Consent-Log: wann was freigegeben
- Widerruf jederzeit möglich

**Coach-seitige Sicht:**
- Welche Permissions hat der Client freigegeben?
- Anfrage für erweiterte Permissions möglich

Code: `routes/permissions.ts` · `PermissionSettings.tsx`

---

### 10. Coach Performance Analytics

- Client Retention Rate
- Avg Client Satisfaction Rating
- Goal Completion Rate
- Avg Response Time (Stunden)
- Alert Resolution Rate
- Revenue per Client / Lifetime Value
- Clients mit Autonomy-Progression

Code: `routes/dashboard.ts` (metrics) · `CoachPerformanceView.tsx`

---

## Geplante Features

### Mittlere Priorität

| Feature | Beschreibung |
|---|---|
| Voice Notes | Audio-Nachrichten im Chat |
| Video Call Integration | Zoom/Google Meet Embed + Session Notes |
| Auto-Reminders für Check-ins | Push Notification wenn Check-in überfällig |
| AI Clone (Coach) | Coach's Methode als 24/7 AI-Assistent |
| Multi-Coach / Team Support | Mehrere Coaches pro Studio |
| Client Onboarding Wizard | Geführter Onboarding-Flow |

### Niedrige Priorität

| Feature | Beschreibung |
|---|---|
| Coach Branding | Logo, Farben, Custom Domain |
| Coach Directory | Öffentliches Profil für Neukunden |
| Compliance Leaderboard | Anonymisierter Vergleich unter Clients |
| White-Label | Enterprise: eigenes Branding der gesamten App |
