# Human Coach Module — Import Pipeline
> Spec Phase 8 | Seed-Daten, Onboarding, Setup

---

## Übersicht

Human Coach hat keine externe Import-Quelle.
Pipeline bedeutet hier:
1. Seed: Rule Templates (System-Vorlagen)
2. Seed: Autonomy Level Definitionen
3. Coach Onboarding Setup
4. Client Onboarding Setup
5. Verifikation

---

## Phase 1: Rule Template Seed

```sql
INSERT INTO coach.coach_rule_templates
  (name, description, category, conditions_template, actions_template, tags, is_featured)
VALUES

-- FEATURED TEMPLATES
('Protein Alert Trainingstag',
 'Warnt wenn Client Protein-Ziel an Trainingstag unterschreitet',
 'nutrition',
 '[{"module":"nutrition","metric":"protein_adherence_pct","operator":"<","value":70},
   {"module":"training","metric":"session_today","operator":"==","value":true}]',
 '{"type":"alert","severity":"medium","title":"Client unter Protein-Ziel an Trainingstag"}',
 ARRAY['nutrition','training','protein'], true),

('Recovery Score Kritisch',
 'Warnt wenn Recovery Score mehrere Tage unter Schwellwert fällt',
 'recovery',
 '[{"module":"recovery","metric":"score_7d_avg","operator":"<","value":55}]',
 '{"type":"alert","severity":"high","title":"Recovery Score kritisch niedrig"}',
 ARRAY['recovery','overtraining'], true),

('Mögliches Übertraining',
 'Recovery fällt während Trainingsvolumen steigt — Übertraining-Risiko',
 'recovery',
 '[{"module":"recovery","metric":"score","operator":"trend_down","timeframe_days":7},
   {"module":"training","metric":"volume_kg","operator":"trend_up","timeframe_days":7}]',
 '{"type":"alert","severity":"high","title":"Mögliches Übertraining detektiert"}',
 ARRAY['recovery','training','overtraining'], true),

('Supplement Compliance Abfall',
 'Warnt wenn Supplement-Einnahme stark nachlässt',
 'supplements',
 '[{"module":"supplements","metric":"compliance_rate","operator":"<","value":50}]',
 '{"type":"alert","severity":"medium","title":"Supplement-Compliance unter 50%"}',
 ARRAY['supplements'], true),

('Streak Achievement 7 Tage',
 'Feiert wenn Client 7 Tage in Folge trainiert hat',
 'training',
 '[{"module":"training","metric":"consecutive_days","operator":">=","value":7}]',
 '{"type":"message","template":"streak_7day"}',
 ARRAY['training','motivation','achievement'], true),

-- WEITERE TEMPLATES
('Schlechter Schlaf Alarm',
 'Warnt bei anhaltend schlechtem Schlaf',
 'recovery',
 '[{"module":"recovery","metric":"sleep_hours","operator":"<","value":6,"timeframe_days":3}]',
 '{"type":"alert","severity":"medium","title":"Schlaf unter 6h seit 3+ Tagen"}',
 ARRAY['recovery','sleep'], false),

('Adherence Drop',
 'Warnt wenn Ernährungs-Compliance stark fällt',
 'nutrition',
 '[{"module":"nutrition","metric":"daily_score","operator":"trend_down","timeframe_days":5}]',
 '{"type":"alert","severity":"medium","title":"Nutrition Adherence im Abwärtstrend"}',
 ARRAY['nutrition'], false),

('Trainings-Inaktivität',
 'Warnt wenn Client länger nicht trainiert hat',
 'training',
 '[{"module":"training","metric":"days_since_last_session","operator":">=","value":7}]',
 '{"type":"alert","severity":"medium","title":"Kein Training seit 7+ Tagen"}',
 ARRAY['training'], false),

('Medizinischer Alert Weiterleitung',
 'Leitet kritische Medical Alerts sofort an Coach weiter',
 'medical',
 '[{"module":"medical","metric":"critical_flag","operator":"==","value":true}]',
 '{"type":"alert","severity":"critical","title":"Kritischer medizinischer Alert"}',
 ARRAY['medical','critical'], false),

('Check-In Überfällig',
 'Warnt wenn wöchentlicher Check-In fehlt',
 'general',
 '[{"module":"checkin","metric":"days_since_last","operator">":"value":3}]',
 '{"type":"alert","severity":"low","title":"Check-In seit 3+ Tagen ausstehend"}',
 ARRAY['checkin'], false);
```

---

## Phase 2: Autonomy Level Definitionen

```typescript
// src/api/human-coach/constants/autonomy.ts

export const AUTONOMY_LEVELS = {
  1: {
    name_de: 'Anfänger',
    name_en: 'Novice',
    description_de: 'Tägliche Unterstützung, jede Abweichung wird adressiert',
    check_in_frequency: 'daily',
    intervention_threshold: 'any_deviation',
    plan_flexibility: 'strict',
    rule_sensitivity: 'high',
    response_time_target_hours: 4,
  },
  2: {
    name_de: 'Entwicklend',
    name_en: 'Developing',
    description_de: 'Regelmäßige Checks, moderate Abweichungen werden adressiert',
    check_in_frequency: 'weekly',
    intervention_threshold: 'significant_trends',
    plan_flexibility: 'guided',
    rule_sensitivity: 'medium',
    response_time_target_hours: 12,
  },
  3: {
    name_de: 'Fortgeschritten',
    name_en: 'Intermediate',
    description_de: 'Wöchentliche Reviews, eigenständige kleine Entscheidungen',
    check_in_frequency: 'weekly',
    intervention_threshold: 'significant_trends',
    plan_flexibility: 'flexible',
    rule_sensitivity: 'medium',
    response_time_target_hours: 24,
  },
  4: {
    name_de: 'Erfahren',
    name_en: 'Advanced',
    description_de: 'Bi-wöchentliche Reviews, nur kritische Alerts',
    check_in_frequency: 'bi_weekly',
    intervention_threshold: 'safety_only',
    plan_flexibility: 'autonomous',
    rule_sensitivity: 'low',
    response_time_target_hours: 48,
  },
  5: {
    name_de: 'Experte',
    name_en: 'Expert',
    description_de: 'Monatliche Reviews, vollständige Autonomie',
    check_in_frequency: 'monthly',
    intervention_threshold: 'safety_only',
    plan_flexibility: 'autonomous',
    rule_sensitivity: 'low',
    response_time_target_hours: 72,
  },
};
```

---

## Phase 3: Coach Onboarding

```typescript
async function onboardCoach(userId: string, profileData: CoachProfileSetup) {
  // 1. Coach-Profil anlegen
  const profile = await createCoachProfile({
    user_id:         userId,
    display_name:    profileData.name,
    email:           profileData.email,
    specializations: profileData.specializations,
    certifications:  profileData.certifications,
    role:            'coach',
    max_clients:     50,
  });

  // 2. Standard Alert-Settings anlegen
  await createAlertSettings(profile.id, {
    email_enabled:         true,
    push_enabled:          true,
    min_priority:          3,
    quiet_hours_enabled:   true,
    quiet_start:           '22:00',
    quiet_end:             '07:00',
  });

  // 3. Featured Rule Templates aktivieren
  const featuredTemplates = await getFeaturedRuleTemplates();
  for (const template of featuredTemplates.slice(0, 3)) {
    await createRuleFromTemplate(profile.id, template.id);
  }

  return profile;
}
```

---

## Phase 4: Client Onboarding

```typescript
async function onboardClient(
  coachId: string,
  clientEmail: string,
  settings: ClientOnboardingSettings
) {
  // 1. Invite Link generieren
  const invite = await createInviteToken(coachId, clientEmail);

  // 2. Coach-Client Relation anlegen (pending bis Client akzeptiert)
  const cc = await createCoachClient({
    coach_id:       coachId,
    client_email:   clientEmail,
    autonomy_level: settings.initial_autonomy ?? 2,
    start_date:     settings.start_date ?? today(),
    status:         'pending',
  });

  // 3. Default Permissions (konservativ — Client kann erweitern)
  await createDefaultPermissions(cc.id, {
    training:    'full',
    nutrition:   'full',
    recovery:    'summary',
    supplements: 'full',
    medical:     'none',    // Default IMMER none
    goals:       'full',
    body_metrics: 'summary',
  });

  // 4. Initial Autonomy Level setzen
  await upsertAutonomyLevel(cc.client_id, coachId, settings.initial_autonomy ?? 2, 'Coach', 'initial');

  // 5. Invite senden
  await sendInviteEmail(clientEmail, invite.token, getCoachName(coachId));
}
```

---

## Phase 5: Check-in Template Seed

```sql
INSERT INTO coach.coach_checkin_templates
  (name, type, questions, is_system, frequency)
VALUES
('Weekly Standard',
 'weekly',
 '[
   {"id":"energy","label":"Energie diese Woche (1-10)","type":"scale"},
   {"id":"notes","label":"Besondere Vorkommnisse oder Fragen?","type":"text"}
 ]',
 true, 'weekly'),

('Prep Intensive',
 'weekly',
 '[
   {"id":"energy","label":"Energie (1-10)","type":"scale"},
   {"id":"hunger","label":"Hunger-Level (1-10)","type":"scale"},
   {"id":"cravings","label":"Heißhunger (1-10)","type":"scale"},
   {"id":"posing","label":"Posing Einheiten diese Woche?","type":"number"},
   {"id":"notes","label":"Feedback für Coach","type":"text"}
 ]',
 true, 'weekly'),

('Monthly Deep Dive',
 'monthly',
 '[
   {"id":"satisfaction","label":"Zufriedenheit mit Coaching (1-10)","type":"scale"},
   {"id":"progress_feeling","label":"Wie fühlst du dich mit deinem Fortschritt?","type":"text"},
   {"id":"goals_change","label":"Hat sich dein Ziel verändert?","type":"text"},
   {"id":"coach_feedback","label":"Was könnte dein Coach besser machen?","type":"text"}
 ]',
 true, 'monthly');
```

---

## Phase 6: Verifikation

```sql
-- Rule Templates vorhanden?
SELECT COUNT(*) FROM coach.coach_rule_templates WHERE is_active = true;
-- Erwartet: ≥ 10

-- Featured Templates?
SELECT COUNT(*) FROM coach.coach_rule_templates WHERE is_featured = true;
-- Erwartet: ≥ 5

-- Check-in Templates?
SELECT COUNT(*) FROM coach.coach_checkin_templates WHERE is_system = true;
-- Erwartet: 3

-- Coach-Profile korrekt?
SELECT id, display_name, role, max_clients
FROM coach.coach_profiles
LIMIT 5;

-- Permissions korrekt gesetzt?
SELECT module, access_level, COUNT(*) as count
FROM coach.coach_client_permissions
GROUP BY module, access_level
ORDER BY module, access_level;
-- medical sollte überwiegend 'none' haben
```

---

## Dateistruktur

```
src/api/human-coach/
  cron/
    daily-rule-processing.ts      Täglich: Rules für alle Coach-Client-Paare prüfen
    daily-adherence-calc.ts       Täglich 23:30: Adherence Summary berechnen
    weekly-checkin-dispatch.ts    Montag 08:00: Check-ins an Clients senden
    daily-alert-cleanup.ts        Täglich: Abgelaufene Alerts archivieren
  routes/
    dashboard.ts
    clients.ts
    alerts.ts
    rules.ts
    autonomy.ts
    adherence.ts
    programs.ts
    messages.ts
    checkins.ts
    permissions.ts
    for-client.ts
  services/
    permission.service.ts        Permission-Checks
    rule-engine.service.ts       Rule Evaluation
    alert.service.ts             Alert Creation + Deduplication
    adherence.service.ts         Adherence Calculation
    autonomy.service.ts          Level Recommendations
  constants/
    autonomy.ts                  Level Definitionen
    alert-types.ts               Alert Type Registry
```
