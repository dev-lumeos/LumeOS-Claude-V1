# SPEC_01 — Admin UI Design
> Admin | apps/admin | Stand: Mai 2026 | Status: draft

---

## 1. Übersicht

Internes Admin-Panel für LUMEOS-Administratoren und Staff.
Separte App (`apps/admin`, Domain: `admin.lumeos.app`).
Accent: `--acc-admin` (neutral, oklch(0.75 0.01 270)).

**Zugang:** Nur `role = admin` oder `role = staff`. Middleware-Block für alle anderen.

**Abgrenzung von der Governance Console:**
- Admin = Business-Operations (User, Content, Analytics)
- Governance Console = Workorder-Execution-System (in AI-Governance-Core, separates Repo)

---

## 2. App-Shell

3-Spalten-Shell wie `apps/web`, aber mit leichteren Context-Panel-Inhalten.

Sidebar-Gruppen:
- **Operator:** Dashboard, Users, Moderation
- **Analytics:** Usage, Revenue, System Health
- **Data:** Food DB, Audit Log
- **System:** Settings

---

## 3. Navigation (7 Bereiche)

| Bereich | Inhalt |
|---|---|
| Dashboard | KPI-Übersicht, DAU/MAU Trend |
| Users | User-Management, Suche, Rollen |
| Moderation | Content-Queue, Coach-Verifikation |
| Analytics | Feature-Adoption, Tier-Verteilung |
| System Health | API-Status, Spark-Status, Error-Logs |
| Food DB | BLS-Curation, Pending Review, Duplicates |
| Audit Log | Vollständiges Audit-Trail |

---

## 4. Dashboard

### KPI-Cards

```tsx
<AdminDashboard>
  <KpiGrid>
    <KpiCard label="DAU"        value={1842}  trend="+12%" sparkline={dau7d} />
    <KpiCard label="MAU"        value={12402} trend="+8%"  sparkline={mau3m} />
    <KpiCard label="Mod Queue"  value={4}     variant={modQueue > 3 ? 'warn' : 'ok'} />
    <KpiCard label="Uptime"     value="99.8%" variant="pos" />
  </KpiGrid>

  <DAUTrendChart data={last90Days} />
  <ModuleAdoptionBars modules={moduleAdoption} />
</AdminDashboard>
```

---

## 5. Users

### User-Tabelle

```
Name            Email                    Tier   Role   Status   Joined
Alex Fischer    alex@example.com         Pro    user   active   Mar 2026
Maria Schmidt   maria@example.com        Free   user   active   Apr 2026
Dr. Kessler     kessler@clinic.example   —      coach  verified Feb 2026
```

Filter: Tier / Role / Status.
Suche: Name + Email.

### User-Actions

```tsx
<UserRowActions user={user}>
  <ViewProfileButton />
  <ChangeRoleButton />
  <SuspendButton variant="warn" />
  <BanButton variant="destructive" />
</UserRowActions>
```

### User Detail Drawer

Click auf User → Drawer mit:
- Profile-Info
- Subscription-Status
- Module-Aktivierung
- Login-History (letzte 5)
- Audit-Events dieses Users
- Danger Zone: Suspend / Ban / Delete

---

## 6. Moderation

### Content-Queue

```tsx
<ModerationQueue>
  <ModerationCard
    item={marketplaceListing}
    severity="critical"
    reason="Potentially illegal substance (DMAA detected in ingredients)"
    submittedBy={seller}
    onApprove={approveListing}
    onRemove={removeListing}
    onInvestigate={openDetailView}
  />
</ModerationQueue>
```

Severity: CRITICAL | HIGH | MEDIUM | LOW.
Geflagged Kategorie: Marketplace Listing / Coach-Verifikation / User-Report.

### Coach-Verifikation

```tsx
<CoachVerificationQueue>
  <CoachVerificationCard coach={pending}>
    <CoachCredentials credentials={coach.submittedDocs} />
    <CoachSpecialties specialties={coach.specialties} />
    <VerifyButton />
    <RejectButton />
    <RequestMoreDocsButton />
  </CoachVerificationCard>
</CoachVerificationQueue>
```

---

## 7. Analytics

### Feature-Adoption Chart

```tsx
<FeatureAdoptionChart>
  {modules.map(m => (
    <AdoptionBar
      key={m.name}
      module={m.name}
      dau={m.dau}
      pct={m.adoptionPct}
      accent={m.accent}
    />
  ))}
</FeatureAdoptionChart>
```

### Tier-Verteilung

```tsx
<TierDistribution>
  <TierPie
    data={[
      { tier: 'Free',  count: 8240, pct: 66 },
      { tier: 'Pro',   count: 3120, pct: 25 },
      { tier: 'Elite', count: 1042, pct: 9 },
    ]}
  />
  <ConversionFunnelTable />
  <ChurnRateCard value={2.8} unit="% / mo" />
</TierDistribution>
```

---

## 8. System Health

### API-Status Grid

```tsx
<SystemHealthGrid>
  <ServiceCard name="Nutrition API"   status="healthy" latency="42ms" />
  <ServiceCard name="Training API"    status="healthy" latency="38ms" />
  <ServiceCard name="Recovery API"    status="healthy" latency="55ms" />
  <ServiceCard name="Supabase DB"     status="healthy" latency="8ms" />
  <ServiceCard name="Auth Service"    status="healthy" latency="12ms" />
</SystemHealthGrid>
```

### Spark Cluster Cards

```tsx
<SparkClusterStatus>
  <SparkCard
    id="Spark A (Qwen3.6)"
    ip="192.168.0.128"
    gpuUtil={72}
    gpuTemp={68}
    gpuPower={245}
    vramUsed={38}
    vramTotal={64}
    status="running"
  />
  {/* Spark B, C, D */}
</SparkClusterStatus>
```

Zeigt denselben Spark-Status wie die Governance Console Runtime-Route — read-only Mirror.

### Error Logs

```tsx
<ErrorLogTable>
  <ErrorRow
    timestamp={ts}
    service="nutrition-api"
    level="error"
    message="BLS lookup failed: nutrient_id not found"
    count={3}
    onViewTrace={openTrace}
  />
</ErrorLogTable>
```

---

## 9. Food DB (BLS Curation)

### Stats

```tsx
<FoodDBStats>
  <Stat label="Total entries" value="10,840" />
  <Stat label="Pending review" value={24} variant="warn" />
  <Stat label="Duplicate flags" value={7} variant="warn" />
  <Stat label="Last import" value="May 01" />
</FoodDBStats>
```

### Pending Review Queue

```tsx
<FoodPendingQueue>
  <FoodReviewCard food={pendingFood}>
    <FoodName>{food.name}</FoodName>
    <FoodSource>{food.source}</FoodSource>
    <FoodNutrients nutrients={food.nutrients} />
    <ApproveButton />
    <RejectButton />
    <EditButton />
    <FlagDuplicateButton />
  </FoodReviewCard>
</FoodPendingQueue>
```

### Duplicate Merge Tool

```tsx
<DuplicateMerger>
  <DuplicatePair
    original={food1}
    duplicate={food2}
    similarity={0.94}
    onMerge={mergeDuplicate}
    onKeepBoth={keepBoth}
  />
</DuplicateMerger>
```

---

## 10. Audit Log

Vollständiger Audit-Trail aller Admin-Aktionen.

```tsx
<AuditLogTable>
  <AuditRow
    timestamp={ts}
    actor="tom@lumeos.app"
    action="user.suspend"
    target="user:abc-123"
    category="user_management"
    ip="192.168.x.x"
  />
</AuditLogTable>
```

Filter: Kategorie (user_management / content / data / system / auth).
Suche: Actor / Target / Action.
Export: CSV.

Kategorien: `user_management` | `content` | `data_access` | `system` | `auth` | `moderation`.

---

## 11. Settings

```tsx
<AdminSettings>
  <SettingsSection title="Platform">
    <MaintenanceModeToggle />
    <RegistrationToggle />
    <ReferralProgramToggle />
  </SettingsSection>

  <SettingsSection title="Moderation">
    <AutoModerationThresholds />
    <FlaggedKeywords />
  </SettingsSection>

  <SettingsSection title="Notifications">
    <AdminAlertEmails />
    <SystemAlertThresholds />
  </SettingsSection>
</AdminSettings>
```

---

## 12. Acceptance Criteria

```
[ ] Middleware blockiert alle Non-Admin/Non-Staff User
[ ] User-Tabelle suchbar + filterbar
[ ] User-Actions: Suspend + Ban mit Bestätigungs-Dialog
[ ] Moderation Queue: Critical-Items rot markiert
[ ] Coach-Verifikation: Approve / Reject Workflow
[ ] Spark-Cards zeigen GPU-Metriken (read-only)
[ ] Food DB: Pending-Review-Workflow vollständig
[ ] Duplicate-Merger: Merge-Aktion korrekt
[ ] Audit-Log filtierbar + exportierbar
[ ] System Health: Grün / Amber / Rot für alle Services
[ ] admin.lumeos.app SSO mit app.lumeos.app
```
