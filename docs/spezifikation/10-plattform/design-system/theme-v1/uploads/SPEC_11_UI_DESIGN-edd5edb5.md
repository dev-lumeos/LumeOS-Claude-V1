# SPEC_11 — Coach Portal UI Design
> HumanCoach | apps/coach | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/HumanCoach/SPEC_01–SPEC_10 (Backend-Spec)

---

## 1. Übersicht

Der Coach Portal ist eine **separate Next.js-App** (`apps/coach`, Domain: `coach.lumeos.app`).
Zwei Zielgruppen auf einer App: Athletes (sehen ihre Coaches) und Coaches (managen ihre Athleten).

Accent: `--acc-coach` (slate-cyan, oklch(0.78 0.08 200)).

Das Coach Portal hat **zwei Sichten**, umschaltbar über einen Role-Toggle im Modul-Header.

---

## 2. App-Shell (coach.lumeos.app)

Gleiche Shell-Struktur wie `apps/web` (Sidebar / Topbar / Context Panel).
Imports aus `packages/ui`.

Sidebar-Gruppen:
- **Athlete-Sicht:** My Coaches / Permissions / Messages / Notes / Invites
- **Coach-Portal-Sicht:** Overview / Athletes / Analytics / Smart Alerts / Rules / Autonomy / Patterns / Interventions / Consent / Plans / Messages / Team & Audit

---

## 3. Role Toggle

```tsx
<RoleToggle>
  <RoleOption value="athlete" label="My coaches" />
  <RoleOption value="coach" label="Coach portal" />
</RoleToggle>
```

Sichtbar nur wenn User sowohl Athlete als auch Coach ist (User hat `coach`-Rolle in DB).

---

## 4. Athlete-Sicht (6 Tabs)

### Tab: My Coaches (Overview)

```tsx
<CoachOverview>
  <CoachCards>
    <CoachCard
      type="Training"
      name="Anders Petersen"
      status="active"
      lastNote="May 24"
      fee={120}
      rating={4.8}
      accent="var(--acc-train)"
      onMessage={openMessageThread}
      onViewDetails={openCoachDetail}
    />
    <CoachCard type="Nutrition" name="Jana Havel" ... />
    <CoachCard type="Supplement" name="David Lenz" ... />
    <CoachCard type="Medical" name="Dr. Kessler" ... />
  </CoachCards>

  <CoachingBalance totalMonthly={417} />
  <TrustCircleSidebar coaches={activeCoaches} />
  <ActivitySparkline data={last30DayActivity} />
</CoachOverview>
```

### Tab: Coaches (Detail Cards)

Erweiterte Cards mit Cadence, Plan, Fee, Rating, Shared-Modules-Pills.

### Tab: Permissions (Matrix)

```tsx
<PermissionMatrix
  rows={modules}          // Nutrition, Training, Recovery, Supplements, Goals, Medical
  cols={coachTypes}       // Training Coach, Nutrition Coach, Medical Coach, Buddy
  values={permissions}    // full | shared | summary | off
  onChange={updatePermission}
/>
```

### Tab: Messages

Threads-Liste + Chat-Modal mit echtem Message-Thread pro Coach.

### Tab: Notes

Alle Coach-Notizen, filterbar nach Modul.

### Tab: Invites

Pending Invites + History (Resend / Cancel).

### Invite Coach Modal

```tsx
<InviteCoachModal>
  <CoachTypeSelect />
  <InviteMethod>
    <QRCodeDisplay code={inviteCode} />
    <EmailInviteInput />
    <PersonalNoteInput />
  </InviteMethod>
  <SendButton />
</InviteCoachModal>
```

---

## 5. Coach-Portal-Sicht (12 Tabs)

### Tab: Overview (Dashboard)

```tsx
<CoachDashboard>
  <KpiGrid>
    <KpiCard label="Athletes" value={14} />
    <KpiCard label="Avg Compliance" value="87%" />
    <KpiCard label="Open Alerts" value={3} variant="warn" />
    <KpiCard label="MRR" value="€4,820" />
  </KpiGrid>

  <AthletesNeedingAttention athletes={attentionList} />

  <TodaySessions sessions={todaySessions} />

  <RecentAchievements achievements={recent} />
</CoachDashboard>
```

### Tab: Athletes

Filterbare, sortierbare Tabelle (14+ Athleten).

```
Name            Plan     Compliance  Alerts  Last Session  Autonomy Level
Alex Fischer    Pro      94%         0       May 25        Intermediate
Maria Schmidt   Elite    78%         2 ⚠     May 23        Beginner
...
```

Smart Prioritization: Auto-Sort nach kombiniertem Attention-Score
(alerts × 30 + low_compliance_penalty + days_since_last_session).

Inline Quick-Actions: [Message] [Call] [Adjust Plan] [View Details].

Click auf Zeile → AthleteDetailModal (Enhanced, 4 Tabs: Overview / Adherence / Autonomy / Notes).

### Tab: Analytics

```tsx
<CoachAnalytics>
  <RetentionCard value={92} />
  <SatisfactionCard value={4.8} />
  <GoalCompletionCard value={87} />
  <AutonomyProgressionCard value={68} />

  <CoachEfficiency>
    <EfficiencyMetric label="Avg Response Time" value="2.1h" />
    <EfficiencyMetric label="Alert Resolution" value="94%" />
    <EfficiencyMetric label="Proactive Interventions" value="12/mo" />
  </CoachEfficiency>

  <BusinessImpact>
    <ImpactMetric label="Avg LTV" value="€4,280" />
    <ImpactMetric label="Referral Rate" value="38%" />
  </BusinessImpact>

  <AdherenceDimensions dimensions={aggregatedAdherence} />
</CoachAnalytics>
```

### Tab: Smart Alerts (5-Level)

```tsx
<SmartAlertList>
  <Alert
    severity="critical"
    athlete="Maria Schmidt"
    type="compliance_drop"
    confidence={94}
    fpRisk="low"
    prediction="Training plateau in 10 days if not addressed"
    actions={['Message', 'Call', 'Adjust Plan', 'Snooze']}
    onAction={handleAlertAction}
  />
</SmartAlertList>
```

Severity-Levels: CRITICAL | HIGH | MEDIUM | LOW | INFO.
Smart Batching: gruppiert nach Athlet wenn mehrere Alerts gleichzeitig.
Alert-Detail-Modal: Confidence, False-Positive-Risk, Similar Cases, "Was worked" Log.

### Tab: Rules (Visual Rule Builder)

Sub-Views: Active Rules | Marketplace | Visual Builder | Fire History.

```tsx
<VisualRuleBuilder>
  <BuildingBlocksPanel categories={['Thresholds', 'Trends', 'Time', 'Events']} />

  <RuleCanvas>
    <WhenBlock trigger={trigger} onEdit={editTrigger} />
    <OnlyIfBlock conditions={conditions} onEdit={editConditions} />
    <ThenBlock actions={actions} onEdit={editActions} />
  </RuleCanvas>

  <RuleSettingsPanel
    segmentation={segmentation}
    schedule={schedule}
    escalation={escalation}
  />
</VisualRuleBuilder>
```

Rule-Edit-Modal: Form + Test-Replay (would fire N× / FP-Rate / Confidence).

### Tab: Autonomy (5-Level Framework)

```
Level     Cadence     Decision-Making     Intervention-Threshold
Novice    Daily       Coach decides       Very low (intervene often)
Beginner  3×/week     Coach suggests      Low
Intermediate 2×/week  Shared              Medium
Advanced  Weekly      Athlete proposes    High
Expert    Monthly     Athlete decides     Very high (rare)
```

Athletes-by-Level Tabelle: Level-Badge, Trend (↑↓stable), Time-at-Level, Coach-Action (Promote / Review).

### Tab: Patterns

```tsx
<PatternAnalysisView athlete={selectedAthlete}>
  <AdherenceForecast
    nextWeek={{ likely: 84, best: 92, worst: 68 }}
    confidence={72}
  />
  <RiskIndicators risks={identifiedRisks} />
  <DayOfWeekPattern data={weeklyPattern} />
  <EventImpactTable impacts={eventImpacts} />
</PatternAnalysisView>
```

### Tab: Interventions

```tsx
<InterventionEngineView athlete={selectedAthlete}>
  <StrategyCards>
    <StrategyCard type="educational" effectiveness={78} />
    <StrategyCard type="motivational" effectiveness={85} />
    <StrategyCard type="practical" effectiveness={91} />
  </StrategyCards>

  <ActiveInterventionsTable
    interventions={activeInterventions}
    onTrackOutcome={trackOutcome}
  />
</InterventionEngineView>
```

### Tab: Consent

```tsx
<ConsentFlowView>
  <ConsentTable
    athletes={athletes}
    columns={modules}
    consent={consentMatrix}
    onViewHistory={openConsentHistory}
  />
</ConsentFlowView>
```

### Tab: Plans (Library)

6+ Pläne: Assigned-Count, Sold-Count, Rating.
New Plan Modal: Template / Clone / Marketplace-Import.

### Tab: Messages

Eingehende Athleten-Messages mit Unread-Markers.

### Tab: Revenue

12-Monats MRR-Chart. Split: Retainers / Plan-Sales / One-offs.

### Tab: Team & Audit

Permission-Matrix (HEAD_COACH / SENIOR_COACH / COACH × 13 Capabilities).
Audit-Log: Kategorie-Filter, Search, Export.

---

## 6. Key Modals / Drawers

| Modal/Drawer | Trigger |
|---|---|
| AthleteDetailModal | Click Athleten-Zeile |
| AlertDetailModal | Click Alert-Card |
| CoachSettingsModal | "Settings" Button in Alerts |
| RuleEditModal | Click Active Rule |
| InviteTeamMemberModal | "Invite member" Button |
| TeamMemberDetailModal | Click Team-Mitglied |

---

## 7. Acceptance Criteria

```
[ ] Role-Toggle wechselt korrekt zwischen Athlete- und Coach-Sicht
[ ] Athlete-Tabelle: Smart Prioritization sortiert korrekt
[ ] 5-Level Alert System: Severity korrekt farbcodiert
[ ] Visual Rule Builder: Canvas rendert Blöcke (auch wenn Drag-Drop V1 nur visuell)
[ ] Autonomy Framework: Level-Badges korrekt angezeigt
[ ] Pattern-Forecast: Confidence-Band korrekt dargestellt
[ ] Consent-Matrix: alle Athleten × Module
[ ] AthleteDetailModal: 4 Tabs (Overview / Adherence / Autonomy / Notes)
[ ] Permission-Matrix (Team): 3 Rollen × 13 Capabilities
[ ] Audit-Log filtierbar nach Kategorie
[ ] Cross-domain Auth: coach.lumeos.app mit app.lumeos.app geteilt
```
