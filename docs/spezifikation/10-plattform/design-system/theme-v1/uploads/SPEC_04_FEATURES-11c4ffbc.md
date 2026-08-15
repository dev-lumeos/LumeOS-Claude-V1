# Human Coach Module — Feature Specs
> Spec Phase 4 | Implementierungsdetails

---

## Feature 1: Permission-First Data Access

### Permission Check Middleware
```typescript
async function requirePermission(
  coachId: string,
  clientId: string,
  module: string,
  minLevel: 'summary' | 'full'
): Promise<boolean> {
  const cc = await getCoachClient(coachId, clientId);
  if (!cc?.is_active) return false;

  const perm = await getPermission(cc.id, module);
  if (!perm || perm.access_level === 'none') return false;
  if (perm.expires_at && new Date() > perm.expires_at) return false;
  if (minLevel === 'full' && perm.access_level === 'summary') return false;

  return true;
}
```

### Data Aggregation für Coach Dashboard
Alle Client-Daten werden via dedizierte "for-coach" Endpoints der Module geladen — nie via direkten DB-Cross-Schema-Join.

---

## Feature 2: Alert System

### System-Alert Regeln (immer aktiv)
```typescript
// Werden täglich via Cron geprüft + sofort bei neuen Daten
const SYSTEM_ALERT_TRIGGERS = [
  {
    type: 'medical_concern',
    priority: 1,
    check: (data) => data.medical?.critical_flag === true,
  },
  {
    type: 'supplement_interactions',
    priority: 1,
    check: (data) => data.supplements?.critical_interaction === true,
  },
  {
    type: 'recovery_issues',
    priority: 2,
    check: (data) => data.recovery?.score_7d_avg < 50 && data.recovery?.days_below_50 >= 3,
  },
];
```

### Alert Deduplication
```typescript
async function shouldCreateAlert(
  rule: CoachRule,
  coachId: string,
  clientId: string
): Promise<boolean> {
  const cooldownMs = rule.cooldown_minutes * 60 * 1000;
  const lastFired  = await getLastFiredTime(rule.id, clientId);
  if (lastFired && Date.now() - lastFired.getTime() < cooldownMs) return false;

  const todayCount = await getAlertCountToday(rule.id, clientId);
  if (todayCount >= rule.max_triggers_per_day) return false;

  return true;
}
```

---

## Feature 3: Rule Engine Processing

### Täglicher Cron (alle Clients aller aktiven Rules)
```typescript
async function processRulesForCoach(coachId: string) {
  const rules   = await getEnabledRules(coachId);
  const clients = await getActiveClients(coachId);

  for (const rule of rules) {
    const targetClients = rule.applies_to_all_clients
      ? clients
      : clients.filter(c => matchesClientFilter(c, rule.client_filter));

    for (const client of targetClients) {
      if (!await shouldCreateAlert(rule, coachId, client.id)) continue;

      const data    = await loadClientDataForRule(client.id, coachId, rule.conditions);
      const fires   = await evaluateRule(rule, data);

      if (fires) {
        await createAlert(coachId, client.id, rule);
        await updateRuleLastFired(rule.id);
      }
    }
  }
}
```

---

## Feature 4: Client Status Calculation

```typescript
// Täglich via Cron nach Client-Data-Update
async function recalcClientStatus(coachId: string, clientId: string) {
  const adherence7d = await get7dAdherence(clientId);
  const recovScore  = await getLatestRecoveryScore(clientId, coachId);
  const openAlerts  = await getOpenAlerts(coachId, clientId);

  const status = calcClientStatus(
    adherence7d?.weighted_adherence ?? 0,
    recovScore ?? 70,
    openAlerts
  );

  const riskLevel = calcRiskLevel(
    adherence7d?.overall_adherence ?? 0,
    adherence7d?.volatility ?? 0,
    openAlerts.filter(a => a.priority <= 2).length
  );

  await updateCoachClient(coachId, clientId, { status, risk_level: riskLevel });
}
```

---

## Feature 5: Smart Client Card Sortierung

```typescript
// Dashboard Client Cards — nach Aufmerksamkeitsbedarf sortieren
function sortClientsByPriority(clients: CoachClientCard[]): CoachClientCard[] {
  const statusOrder = { critical: 0, attention: 1, good: 2, excellent: 3 };

  return [...clients].sort((a, b) => {
    // 1. Status
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // 2. Unresolved Critical Alerts
    const alertDiff = b.alerts.critical - a.alerts.critical;
    if (alertDiff !== 0) return alertDiff;

    // 3. Adherence (niedrigste zuerst)
    return a.metrics.adherence_7d - b.metrics.adherence_7d;
  });
}
```

---

## Feature 6: Autonomy Auto-Recommendation

```typescript
async function calcAutonomyRecommendation(
  clientId: string,
  coachId: string
): Promise<AutonomyRecommendation> {
  const days = 30;
  const adherence = await getAdherenceHistory(clientId, days);
  const checkins  = await getCheckinRate(clientId, days);
  const messages  = await getCommunicationQuality(clientId, coachId, days);

  // Consistency: Wie viele Tage hat Client Daten geloggt?
  const consistency = Math.min(adherence.days_with_data / days, 1);

  // Self-correction: Hat Client eigenständig reagiert ohne Coach-Input?
  const selfCorrection = await getSelfCorrectionScore(clientId, days);

  const scores = {
    consistency,
    knowledge:      adherence.avg_overall,
    selfCorrection,
    communication:  messages.quality_score,
  };

  const recommended = recommendAutonomyLevel(scores);
  const current = await getCurrentAutonomyLevel(clientId, coachId);

  return {
    current_level:     current,
    recommended_level: recommended,
    scores,
    should_promote:    recommended > current,
    should_demote:     recommended < current,
    evidence:          buildEvidence(scores, adherence),
  };
}
```

---

## Feature 7: Program Assignment (Client bestätigt)

```typescript
// Coach weist Programm zu → Client-Confirmation Required
async function assignProgram(
  coachId: string,
  clientId: string,
  program: CoachProgram
): Promise<void> {
  // Für Training: Routine in training.routines mit source='coach' eintragen
  if (program.type === 'training' || program.type === 'combined') {
    await callTrainingAPI('POST', '/api/training/routines', {
      ...program.training_template,
      source: 'coach',
      coach_id: coachId,
      user_id: clientId,
      requires_confirmation: true,  // Client muss bestätigen
    });
  }

  // Für Nutrition: Targets als Proposal
  if (program.type === 'nutrition' || program.type === 'combined') {
    await callNutritionAPI('POST', '/api/nutrition/targets/proposal', {
      ...program.nutrition_template,
      coach_id: coachId,
      requires_confirmation: true,
    });
  }

  // Notification an Client
  await sendClientNotification(clientId, {
    type: 'coach_program_assigned',
    message: `${getCoachName(coachId)} hat dir einen neuen Plan zugewiesen`,
  });
}
```

---

## Feature 8: Weekly Check-in Auto-Generation

```typescript
// Jeden Montag (Cron) für alle Clients mit Autonomy 1–3
async function generateWeeklyCheckins(coachId: string) {
  const clients = await getClientsForCheckin(coachId);  // Autonomy 1-3

  for (const client of clients) {
    // Daten automatisch vorausfüllen
    const prefilled = await loadCheckinData(client.id, coachId);

    await createCheckin(client.id, coachId, {
      template_id:        'weekly_standard',
      prefilled_data: {
        weight_kg:          prefilled.weight_7d_avg,
        training_adherence: prefilled.training_adherence_7d_pct,
        nutrition_adherence: prefilled.nutrition_adherence_7d_pct,
        recovery_avg:       prefilled.recovery_score_7d_avg,
      },
      questions: [
        'Wie war deine Energie diese Woche? (1–10)',
        'Besondere Vorkommnisse oder Fragen?',
      ],
      due_in_hours: 48,
    });
  }
}
```

---

## Feature 9: Medical Data Access (Sensitiv)

### Permission-Anforderungen für Medical
```typescript
// Medical braucht:
// 1. access_level = 'full' (nicht 'summary')
// 2. Nicht abgelaufen
// 3. Explizite User-Bestätigung (granted_by = client_id)

async function getMedicalDataForCoach(coachId: string, clientId: string) {
  const hasPerm = await requirePermission(coachId, clientId, 'medical', 'full');
  if (!hasPerm) throw new ForbiddenError('Keine Medical-Permission');

  // Lese Medical-Daten via Medical API
  return await callMedicalAPI(`GET /api/medical/for-coach?client=${clientId}&coach=${coachId}`);
}
```

### Medical for-coach Response (gefiltert)
```json
{
  "system_scores": { "liver": 85, "cardiovascular": 72, "metabolic": 75 },
  "active_alerts": [
    { "severity": "warning", "biomarker": "ALT", "value": 38, "message": "Leicht erhöht" }
  ],
  "last_test_date": "2026-02-14",
  "next_recommended": "Quarterly (fällig in 6 Wochen)",
  "supplement_effectiveness": [
    { "supplement": "Vitamin D3", "result": "18→52 ng/mL ✅" }
  ]
}
```

---

## Feature 10: Adherence Summary Berechnung

```typescript
// Täglich nach Modul-Updates (event-driven oder Cron 23:30)
async function calcDailyAdherence(clientId: string, coachId: string, date: string) {
  // Daten von allen Modulen mit Permission holen
  const [nutrition, training, recovery, supplements] = await Promise.all([
    getModuleAdherence(clientId, coachId, 'nutrition', date),
    getModuleAdherence(clientId, coachId, 'training', date),
    getModuleAdherence(clientId, coachId, 'recovery', date),
    getModuleAdherence(clientId, coachId, 'supplements', date),
  ]);

  const weighted = calcWeightedAdherence(
    nutrition?.score ?? 0,
    training?.score ?? 0,
    recovery?.score ?? 0,
    supplements?.score ?? 0
  );

  // Trend aus letzten 7 Tagen
  const history   = await getAdherenceHistory(clientId, 7);
  const direction = calcTrendDirection(history.map(h => h.overall_adherence));

  await upsertAdherenceSummary(clientId, coachId, date, {
    overall_adherence:    (nutrition?.score ?? 0 + training?.score ?? 0 + recovery?.score ?? 0 + supplements?.score ?? 0) / 4 / 100,
    weighted_adherence:   weighted / 100,
    nutrition_adherence:  (nutrition?.score ?? 0) / 100,
    training_adherence:   (training?.score ?? 0) / 100,
    recovery_adherence:   (recovery?.score ?? 0) / 100,
    supplement_adherence: (supplements?.score ?? 0) / 100,
    trend_direction:      direction,
  });
}
```
