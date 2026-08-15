# Buddy / AI Coach Module — Feature Specs
> Spec Phase 4 | Implementierungsdetails aller Features

---

## Feature 1: Hybrid AI — 3 Pfade

```typescript
// packages/evaluator/src/orchestrator.ts

type RequestPath = 'fast' | 'knowledge' | 'hybrid';

function determineRequestPath(
  message: string,
  context: CoachContext
): RequestPath {
  // Fast Path: keine LLM nötig (Dashboard-Daten, Scores)
  if (isDashboardRequest(message)) return 'fast';

  // Knowledge Path: Wissensfrage ohne User-Daten nötig
  if (isKnowledgeQuestion(message) && !requiresUserData(message)) return 'knowledge';

  // Hybrid Path: braucht Engines + LLM
  return 'hybrid';
}

async function processRequest(
  message: string,
  userId: string,
  context: CoachContext
): Promise<CoachResponse> {
  const path = determineRequestPath(message, context);

  switch (path) {
    case 'fast':
      // $0 — Nur Engine-Daten, kein LLM-Call
      return buildFastResponse(context);

    case 'knowledge':
      // ~$0.002 — RAG + Claude Haiku
      const knowledge = await searchKnowledge(message);
      return await callLLM('haiku', buildKnowledgePrompt(message, knowledge));

    case 'hybrid':
      // ~$0.02 — Engines + Claude Sonnet
      const engineData   = await runRelevantEngines(context);
      const ragResults   = await searchKnowledge(message);
      const systemPrompt = buildSystemPrompt(context, engineData, ragResults);
      return await callLLM('sonnet', systemPrompt, message);
  }
}
```

---

## Feature 2: Feature Gate Middleware

```typescript
// src/api/coach/middleware/feature-gate.ts

import { FEATURE_TIERS } from '@packages/scoring/src/buddy';

export function requireFeature(featureKey: string) {
  return async (c: Context, next: Next) => {
    const userId   = c.get('userId');
    const profile  = await getCoachProfile(userId);
    const userTier = profile?.feature_tier ?? 'free';

    if (!hasFeatureAccess(userTier, featureKey)) {
      const requiredTier = FEATURE_TIERS[featureKey];
      return c.json({
        ok: false,
        error: 'feature_locked',
        required_tier: requiredTier,
        upgrade_url:   '/upgrade',
        message:       `This feature requires the ${requiredTier} plan`,
      }, 403);
    }
    await next();
  };
}

// Verwendung:
app.post('/api/coach/voice', requireFeature('voice_input'), voiceHandler);
app.post('/api/coach/actions/*', requireFeature('action_execution'), actionHandler);
app.get('/api/coach/alerts', requireFeature('proactive_watcher'), alertHandler);
```

---

## Feature 3: App Butler — Action Execution

```typescript
// src/api/coach/routes/actions.ts

interface ActionIntent {
  type:       'log_meal'|'log_water'|'log_weight'|'log_supplement'|
              'log_checkin'|'log_set'|'query'|'command';
  confidence: number;
  entities:   Record<string, unknown>;
}

async function recognizeIntent(message: string, context: CoachContext): Promise<ActionIntent> {
  const prompt = `
    Analysiere diese Nachricht und erkenne die Absicht.
    Antworte NUR in JSON: {"type": "...", "confidence": 0.0-1.0, "entities": {...}}
    
    Mögliche Typen: log_meal, log_water, log_weight, log_supplement, log_checkin, log_set, query, command
    
    Nachricht: "${message}"
    Kontext: ${JSON.stringify(context.currentState)}
  `;

  const result = await callLLM('haiku', prompt);
  return JSON.parse(result.speech_text);
}

async function executeAction(intent: ActionIntent, userId: string): Promise<ActionResult> {
  if (intent.confidence < 0.8) {
    return { status: 'clarification_needed', message: buildClarificationQuestion(intent) };
  }

  switch (intent.type) {
    case 'log_meal':
      const preview = await callNutritionAPI('POST', '/api/nutrition/meals/preview', {
        user_id: userId, foods: intent.entities.foods
      });
      return { status: 'preview', preview, confirm_token: preview.confirmation_token };

    case 'log_water':
      await callNutritionAPI('POST', '/api/nutrition/water', {
        user_id: userId, amount_ml: intent.entities.amount_ml
      });
      return { status: 'executed', message: `✅ ${intent.entities.amount_ml}ml geloggt` };

    case 'log_supplement':
      await callSupplementsAPI('POST', '/api/supplements/intake', {
        user_id: userId, supplement_id: intent.entities.supplement_id
      });
      return { status: 'executed', message: '✅ Supplement geloggt' };

    case 'log_weight':
      await callGoalsAPI('POST', '/api/goals/measurements', {
        user_id: userId, weight_kg: intent.entities.weight_kg
      });
      return { status: 'executed', message: `✅ ${intent.entities.weight_kg}kg geloggt` };
  }
}
```

---

## Feature 4: Proaktiver Wächter (Background Worker)

```typescript
// src/api/coach/cron/proactive-watcher.ts

const WATCHER_RULES = [
  {
    id:        'nutrition_nothing_logged',
    level:     'warning',
    category:  'nutrition',
    check:     (ctx) => ctx.nutrition_state.meals_today === 0 &&
                        new Date().getHours() >= 14,
    message:   (ctx) => `Noch nichts geloggt heute — bist du ok?`,
  },
  {
    id:        'recovery_critical',
    level:     'warning',
    category:  'recovery',
    check:     (ctx) => ctx.recovery_state.score < 50 &&
                        ctx.training_state.heavy_training_day_flag,
    message:   (ctx) =>
      `Recovery bei ${ctx.recovery_state.score} und heute schweres Training — reduziere das Volume.`,
  },
  {
    id:        'sleep_consecutive_bad',
    level:     'warning',
    category:  'recovery',
    check:     (ctx) => ctx.recovery_state.bad_sleep_days_consecutive >= 3,
    message:   (ctx) =>
      `Schlaf seit ${ctx.recovery_state.bad_sleep_days_consecutive} Nächten unter 6h.`,
  },
  {
    id:        'supplement_interaction_critical',
    level:     'critical',
    category:  'supplements',
    check:     (ctx) => ctx.safety_state.supplement_interaction_critical,
    message:   () => 'Kritische Supplement-Interaktion erkannt — bitte sofort prüfen.',
  },
];

async function runWatcherForUser(userId: string): Promise<void> {
  const profile = await getCoachProfile(userId);
  if (profile?.feature_tier === 'free') return;  // Wächter nur ab Plus

  const state  = await getBuddyState(userId);
  const alerts = await getActiveAlerts(userId);

  for (const rule of WATCHER_RULES) {
    // Deduplizierung: gleiches Alert in letzten 24h?
    const alreadyFired = alerts.some(a =>
      a.category === rule.category &&
      Date.now() - new Date(a.created_at).getTime() < 24 * 60 * 60 * 1000
    );
    if (alreadyFired) continue;

    if (rule.check(state)) {
      const dismissCount = alerts.filter(a => a.category === rule.category).reduce(
        (sum, a) => sum + a.dismiss_count, 0
      );
      // Smart Mute: 3× dismisst → level downgrade
      const level = dismissCount >= 3 && rule.level === 'warning' ? 'info' : rule.level;

      await createAlert(userId, {
        level,
        category: rule.category,
        message: rule.message(state),
      });

      if (level === 'critical') {
        await sendPushNotification(userId, rule.message(state));
      }
    }
  }
}
```

---

## Feature 5: Journey Heartbeat (Cron-basiert)

```typescript
// src/api/coach/cron/journey-heartbeat.ts

async function processJourneyCheckpoints(): Promise<void> {
  const now       = new Date();
  const timeStr   = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const dayOfWeek = now.getDay();  // 0=Sonntag

  // Alle aktiven Journey-Konfigurationen mit passendem Zeitpunkt
  const journeys = await getJourneysForTime(timeStr, dayOfWeek);

  for (const journey of journeys) {
    const checkpoint = journey.checkpoints.find(
      cp => cp.time === timeStr && cp.enabled && cp.active_days.includes(dayOfWeek)
    );
    if (!checkpoint) continue;

    // Context für diesen User + Module laden
    const context  = await buildCheckpointContext(journey.user_id, checkpoint.modules);
    const profile  = await getCoachProfile(journey.user_id);

    // Persona für diesen Checkpoint
    const persona  = checkpoint.persona ?? profile.preferred_persona;

    // System Prompt für Checkpoint-Kontext
    const prompt   = buildCheckpointPrompt(checkpoint, context, persona);
    const response = await callLLM('haiku', prompt);

    // Zustellmethode
    if (checkpoint.push) {
      await sendPushNotification(journey.user_id, extractPushText(response));
    }
    await saveCheckpointMessage(journey.user_id, checkpoint.id, response);
  }
}

function buildCheckpointPrompt(
  checkpoint: Checkpoint,
  context:    CheckpointContext,
  persona:    string
): string {
  return `
    Du bist ein ${getPersonaName(persona)} Coach.
    Erstelle ein kurzes ${checkpoint.id}-Briefing.
    
    Kontext (verwende nur was relevant ist):
    ${JSON.stringify(context, null, 2)}
    
    REGELN:
    - Max 3-4 Sätze
    - Kein Gelaber, nur Substanz
    - Persona: ${PERSONA_DESCRIPTIONS[persona]}
    - Fokus-Module: ${checkpoint.modules.join(', ')}
    
    Format: Nur speech_text (kein JSON nötig für Briefing)
  `;
}
```

---

## Feature 6: Live Workout Session

```typescript
// src/api/coach/routes/workout-session.ts

interface WorkoutSessionState {
  sessionId:       string;
  userId:          string;
  routineId:       string;
  phase:           SessionPhase;
  currentExercise: number;
  currentSet:      number;
  restSeconds:     number;
  energyLevel:     number;    // 1-5 aus Pre-Workout Check
  exerciseHistory: SetLog[];
}

// Voice Command Parser (kein LLM — Pattern Matching)
function parseGymCommand(utterance: string): GymCommand | null {
  const normalized = utterance.toLowerCase().trim();

  // "Fertig" / "Done" / "Set"
  if (/^(fertig|done|set|gemacht)$/.test(normalized))
    return { type: 'set_complete' };

  // "[Zahl] Kilo/Kg"
  const weightMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(kilo|kg|pfund|pounds?)$/);
  if (weightMatch)
    return { type: 'log_weight', value: parseFloat(weightMatch[1]) };

  // "[Zahl] Reps/Wiederholungen"
  const repsMatch = normalized.match(/^(\d+)\s*(reps?|wiederholungen?|mal)$/);
  if (repsMatch)
    return { type: 'log_reps', value: parseInt(repsMatch[1]) };

  // "RPE [Zahl]" / "War schwer" / "War leicht"
  if (/^rpe\s*([1-9]|10)$/.test(normalized))
    return { type: 'log_rpe', value: parseInt(normalized.split(' ')[1]) };
  if (/^war\s*(sehr\s*)?(schwer|hart)$/.test(normalized)) return { type: 'log_rpe', value: 9 };
  if (/^war\s*(leicht|easy)$/.test(normalized)) return { type: 'log_rpe', value: 5 };

  // "Nächste" / "Next" / "Weiter"
  if (/^(nächste?|next|weiter|skip)$/.test(normalized))
    return { type: 'next_exercise' };

  // "Pause" / "Stop"
  if (/^(pause|stop|halt)$/.test(normalized))
    return { type: 'pause_session' };

  // "Mehr Zeit" / "+30"
  if (/^(mehr\s*zeit|more\s*time|\+\d+)$/.test(normalized))
    return { type: 'extend_rest', seconds: 30 };

  return null;
}
```

---

## Feature 7: Memory Learning

```typescript
// src/api/coach/services/memory.ts

// Präferenz aus Konversation extrahieren
async function extractPreferencesFromMessage(
  userId:  string,
  message: string,
  role:    'user' | 'assistant'
): Promise<void> {
  if (role !== 'user') return;

  const PREFERENCE_PATTERNS = [
    { pattern: /ich (mag|esse|liebe) (kein|keinen|keine)\s+(.+)/i, category: 'food_dislike', extract: (m) => m[3] },
    { pattern: /ich (mag|esse|liebe)\s+(.+)/i,                     category: 'food_like',    extract: (m) => m[2] },
    { pattern: /([\w\s]+) tut? mir weh/i,                           category: 'exercise_dislike', extract: (m) => m[1] },
    { pattern: /abends kann ich (nicht|nie) trainier/i,             category: 'schedule',     extract: () => 'no_evening_training' },
    { pattern: /urlaub (.{3,30})/i,                                 category: 'context_note', extract: (m) => `vacation: ${m[1]}` },
  ];

  for (const pp of PREFERENCE_PATTERNS) {
    const match = message.match(pp.pattern);
    if (match) {
      const value = pp.extract(match);
      await upsertPreference(userId, pp.category, value.trim().toLowerCase(), 'conversation');
    }
  }
}

// Coaching Outcome loggen
async function logCoachingOutcome(
  userId:    string,
  outcome:   string,
  context:   string
): Promise<void> {
  // Nur loggen wenn Confidence aus Wiederholung steigt
  const existing = await getMemory(userId, 'coaching_outcome', context);
  if (existing) {
    // Confidence erhöhen
    await updateMemoryConfidence(existing.id, Math.min(1, existing.confidence + 0.15));
  } else {
    await createMemory(userId, {
      memory_type:   'coaching_outcome',
      content:       outcome,
      category:      'general',
      confidence:    0.60,
      auto_decay:    true,
    });
  }
}
```

---

## Feature 8: Policy Gate (Medical Safety)

```typescript
// src/api/coach/services/policy-gate.ts

export async function applyPolicyGate(
  response: CoachResponse,
  context:  CoachContext
): Promise<CoachResponse> {
  const result = runPolicyGate(response);

  switch (result.action) {
    case 'pass':
      return response;

    case 'redact_rewrite':
      return {
        ...response,
        speech_text: result.rewritten!,
      };

    case 'block_escalate':
      return buildSafetyRedirectResponse(context, result.reason);
  }
}

function buildSafetyRedirectResponse(ctx: CoachContext, reason: string): CoachResponse {
  return {
    intent: 'safety_redirect',
    speech_text: getSafetyRedirectText(ctx, reason),
    ui_cards: [{
      type: 'list',
      title: 'Hinweis',
      data: { disclaimer: 'Dies ist keine medizinische Beratung. Bitte konsultiere einen Arzt.' },
      priority: 'high',
    }],
    actions: [],
    safety_flags: ['medical_content'],
    evidence: [],
    expects_input: false,
  };
}
```

---

## Feature 9: Behavioral Signature (ab 8 Wochen)

```typescript
// src/api/coach/services/behavioral-signature.ts

interface SignaturePattern {
  detected:       boolean;
  confidence:     number;
  sample_size:    number;
  first_observed: string;
  last_confirmed: string;
  pattern?:       string;
}

async function updateBehavioralSignature(userId: string): Promise<void> {
  const events = await getEventsLast90Days(userId);
  if (events.length < 50) return;  // Minimum Data

  const signature: Record<string, SignaturePattern> = {};

  // Stress + Training Skip Pattern
  const stressTrainSkip = detectStressTrainingPattern(events);
  signature.stress_pattern = {
    detected:       stressTrainSkip.found,
    confidence:     stressTrainSkip.confidence,
    sample_size:    stressTrainSkip.occurrences,
    first_observed: stressTrainSkip.first,
    last_confirmed: stressTrainSkip.last,
    pattern:        'skips_training',
  };

  // Protein Collapse Pattern
  const proteinCollapse = detectProteinCollapsePattern(events);
  signature.protein_collapse = {
    detected:    proteinCollapse.found,
    confidence:  proteinCollapse.confidence,
    sample_size: proteinCollapse.occurrences,
    first_observed: proteinCollapse.first,
    last_confirmed: proteinCollapse.last,
  };

  // Dropout Risk Day/Time
  const dropoutRisk = detectDropoutRiskPattern(events);
  signature.dropout_risk = {
    detected:    dropoutRisk.found,
    confidence:  dropoutRisk.confidence,
    sample_size: dropoutRisk.occurrences,
    pattern:     `${dropoutRisk.day}@${dropoutRisk.time}`,
    first_observed: dropoutRisk.first,
    last_confirmed: dropoutRisk.last,
  };

  // Nur Patterns mit Confidence > 0.5 in State speichern
  const filtered = Object.fromEntries(
    Object.entries(signature).filter(([, v]) => !v.detected || v.confidence >= 0.5)
  );

  await updateBuddyStateSignature(userId, filtered);
}
```

---

## Feature 10: Output Contract Enforcement

```typescript
// src/api/coach/services/output-validator.ts

export function validateOutputContract(response: unknown): CoachResponse {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid LLM output: not an object');
  }

  const r = response as any;

  // Required fields
  if (!r.intent || typeof r.intent !== 'string')
    throw new Error('Missing required field: intent');
  if (!r.speech_text || typeof r.speech_text !== 'string')
    throw new Error('Missing required field: speech_text');

  // Validate no numbers from LLM (must come from engines)
  validateNoEnginedNumbers(r.speech_text);

  // Validate evidence: no RAG = no science claim
  validateEvidenceConstraints(r);

  return {
    intent:       r.intent,
    speech_text:  r.speech_text,
    ui_cards:     r.ui_cards ?? [],
    actions:      r.actions ?? [],
    safety_flags: r.safety_flags ?? [],
    evidence:     r.evidence ?? [],
    expects_input: r.expects_input ?? false,
    input_type:   r.input_type,
    choices:      r.choices ?? [],
  };
}

function validateNoEnginedNumbers(text: string): void {
  // Zahlen im speech_text MÜSSEN aus Engine kommen, nicht LLM-generiert
  // Diese Validierung ist dokumentarisch — die Engine liefert Zahlen via Context
  // LLM darf "2.847 kcal" nur sagen wenn es aus dem Context kommt
}
```
