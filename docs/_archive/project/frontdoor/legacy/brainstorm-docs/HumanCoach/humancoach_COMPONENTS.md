# Human Coach Module - Components

## 🏗️ Architektur-Übersicht

```
Human Coach Module (Port 5600)
├── API Layer (Hono Framework)
├── Dashboard Service Layer
├── Alert Management Engine
├── Rule Builder & Execution Engine
├── Autonomy Assessment System
├── Adherence Analytics Engine
├── Background Workers
└── Integration Services
```

## 📁 Datei-Struktur

```
src/api/human-coach/
├── index.ts                    # Entry Point & Background Workers
├── server.ts                   # Main Hono App Configuration
├── routes/
│   ├── dashboard.ts           # Dashboard Data Aggregation (D5)
│   ├── alerts.ts              # Alert Management System (D6)
│   ├── rules.ts               # Rule Builder & Execution (A2.5 + B11)
│   ├── autonomy.ts            # Client Autonomy Management (D8)
│   └── adherence.ts           # Adherence Analytics (D9)
├── services/
│   ├── alertWatcher.ts        # Background Alert Generation
│   ├── dashboardAggregator.ts # Real-time Dashboard Data
│   ├── ruleEngine.ts          # Rule Evaluation Engine
│   ├── autonomyAssessor.ts    # Autonomy Level Assessment
│   └── adherenceAnalyzer.ts   # Multi-dimensional Adherence Analysis
├── utils/
│   ├── clientDataAggregator.ts # Cross-Module Client Data Collection
│   ├── alertOptimizer.ts       # Smart Alert Batching & Deduplication
│   ├── ruleValidator.ts        # Rule Logic Validation
│   ├── trendAnalyzer.ts        # Statistical Trend Analysis
│   └── notificationSender.ts   # Multi-channel Notifications
└── types/
    ├── dashboard.ts            # Dashboard Type Definitions
    ├── alerts.ts              # Alert System Types
    ├── rules.ts               # Rule Engine Types
    ├── autonomy.ts            # Autonomy System Types
    └── adherence.ts           # Adherence Analytics Types
```

## 🔧 Core Components

### Entry Point (`index.ts`)
```typescript
// Background Workers Orchestration
const WATCHER_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`🏋️ Human Coach API running on http://localhost:${info.port}`);
  
  // Endpoint documentation
  console.log('\n📊 Dashboard Endpoints (D5):');
  console.log('  GET  /api/human-coach/dashboard/summary');
  console.log('  GET  /api/human-coach/dashboard/clients');
  console.log('  GET  /api/human-coach/dashboard/activity');
  console.log('  GET  /api/human-coach/dashboard/metrics');
  
  console.log('\n🚨 Alert Endpoints (D6):');
  console.log('  GET  /api/human-coach/alerts');
  console.log('  PUT  /api/human-coach/alerts/:id/acknowledge');
  // ... weitere Endpoint-Dokumentation
});

// Periodic Background Jobs
setInterval(async () => {
  try {
    await runCoachAlertWatcher();
  } catch (error) {
    console.error('[CoachAlertWatcher] Interval error:', error);
  }
}, WATCHER_INTERVAL);

setInterval(async () => {
  try {
    await cleanupOldAlerts();
  } catch (error) {
    console.error('[CoachAlertWatcher] Cleanup error:', error);
  }
}, CLEANUP_INTERVAL);
```

**Key Responsibilities:**
- Server-Initialisierung auf Port 5600
- Background Worker Management
- Alert Watcher Orchestration
- Automatic Cleanup Scheduling

### Main Server (`server.ts`)
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import autonomyRouter from './routes/autonomy';
import alertsRouter from './routes/alerts';
import adherenceRouter from './routes/adherence';
import dashboardRouter from './routes/dashboard';
import rulesRouter from './routes/rules';

const app = new Hono<{ Variables: { userId: string; userRole: string } }>();

// CORS Configuration für Dashboard-Integration
app.use('/*', cors({
  origin: (origin) => origin || '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Route Mounting mit klarer Struktur
app.route('/api/human-coach/dashboard', dashboardRouter);
app.route('/api/human-coach/clients', autonomyRouter);
app.route('/api/human-coach/alerts', alertsRouter);
app.route('/api/human-coach/adherence', adherenceRouter);
app.route('/api/human-coach/rules', rulesRouter);

// Health Check für Monitoring
app.get('/health', async (c) => {
  try {
    // TODO: Database health check
    return c.json({ ok: true, status: 'healthy' });
  } catch (error) {
    return c.json({ ok: false, status: 'unhealthy' }, 503);
  }
});
```

## 📊 Dashboard Components (`routes/dashboard.ts`)

### Summary Aggregator
```typescript
class DashboardSummaryAggregator {
  async generateSummary(coachId: string): Promise<DashboardSummary> {
    const [
      clientStats,
      alertStats, 
      adherenceStats,
      autonomyStats,
      achievementStats
    ] = await Promise.all([
      this.getClientStatistics(coachId),
      this.getAlertStatistics(coachId),
      this.getAdherenceStatistics(coachId),
      this.getAutonomyStatistics(coachId),
      this.getAchievementStatistics(coachId)
    ]);
    
    return {
      totalClients: clientStats.total,
      activeClients: clientStats.active,
      inactiveClients: clientStats.inactive,
      criticalAlerts: alertStats.critical,
      highPriorityAlerts: alertStats.high,
      weeklyAdherence: adherenceStats.weeklyAverage,
      avgAutonomyLevel: autonomyStats.average,
      recentAchievements: achievementStats.count,
      newClients: clientStats.newThisWeek,
      period: this.getCurrentWeekPeriod()
    };
  }
  
  private async getClientStatistics(coachId: string): Promise<ClientStats> {
    const clients = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_this_week
      FROM coach_clients 
      WHERE coach_id = ${coachId}
    `;
    
    return clients[0];
  }
}
```

### Client Cards Generator
```typescript
class ClientCardGenerator {
  async generateClientCards(
    coachId: string,
    options: ClientCardOptions
  ): Promise<ClientCard[]> {
    const baseQuery = sql`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.avatar,
        c.autonomy_level,
        c.created_at as join_date,
        c.last_activity
      FROM coach_clients c
      WHERE c.coach_id = ${coachId}
      AND c.is_active = ${options.filter !== 'inactive'}
    `;
    
    const clients = await baseQuery;
    
    // Parallel data enrichment für bessere Performance
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const [alerts, adherence, recovery, training] = await Promise.all([
          this.getClientAlerts(client.id),
          this.getClientAdherence(client.id),
          this.getRecoveryData(client.id),
          this.getTrainingData(client.id)
        ]);
        
        return {
          ...client,
          criticalAlerts: alerts.filter(a => a.priority === 'critical').length,
          highPriorityAlerts: alerts.filter(a => a.priority === 'high').length,
          overallAdherence: adherence.overall,
          quickStats: {
            nutrition: {
              current: adherence.nutrition.calories.current,
              target: adherence.nutrition.calories.target,
              adherence: adherence.nutrition.overall
            },
            recovery: {
              score: recovery.score,
              trend: recovery.trend,
              lastCheckin: recovery.lastCheckin
            },
            training: {
              sessionsThisWeek: training.sessionsThisWeek,
              targetSessions: training.targetSessions,
              adherence: training.adherence
            }
          }
        };
      })
    );
    
    return this.sortAndFilterCards(enrichedClients, options);
  }
}
```

### Activity Feed Generator
```typescript
interface ActivityFeedGenerator {
  async generateActivityFeed(
    coachId: string,
    options: ActivityFeedOptions
  ): Promise<ActivityFeed> {
    const activities = await this.aggregateActivities(coachId, options);
    const processedActivities = await this.enrichActivities(activities);
    
    return {
      activities: processedActivities,
      summary: this.generateFeedSummary(processedActivities),
      hasMore: activities.length >= options.limit
    };
  }
  
  private async aggregateActivities(
    coachId: string,
    options: ActivityFeedOptions
  ): Promise<RawActivity[]> {
    // Union query combining different activity types
    const query = sql`
      (SELECT 
        'achievement' as type,
        client_id,
        title,
        description,
        created_at,
        data
      FROM client_achievements
      WHERE coach_id = ${coachId}
      AND created_at >= NOW() - INTERVAL '${options.hours} hours')
      
      UNION ALL
      
      (SELECT
        'alert' as type,
        client_id,
        title,
        message as description,
        created_at,
        data
      FROM coach_alerts
      WHERE coach_id = ${coachId}
      AND created_at >= NOW() - INTERVAL '${options.hours} hours')
      
      UNION ALL
      
      (SELECT
        'checkin' as type,
        user_id as client_id,
        'Recovery Check-in Completed' as title,
        CONCAT('Sleep: ', sleep_hours, 'h, Quality: ', sleep_quality, '/10') as description,
        created_at,
        jsonb_build_object('sleep_hours', sleep_hours, 'sleep_quality', sleep_quality) as data
      FROM recovery_checkins rc
      JOIN coach_clients cc ON rc.user_id = cc.client_id
      WHERE cc.coach_id = ${coachId}
      AND rc.created_at >= NOW() - INTERVAL '${options.hours} hours')
      
      ORDER BY created_at DESC
      LIMIT ${options.limit || 50}
    `;
    
    return await query;
  }
}
```

## 🚨 Alert System Components (`routes/alerts.ts`)

### Alert Query Builder
```typescript
class AlertQueryBuilder {
  buildAlertQuery(coachId: string, filters: AlertFilters): PostgresSQL {
    let baseQuery = sql`
      SELECT 
        a.*,
        c.name as client_name,
        c.avatar as client_avatar,
        r.name as rule_name
      FROM coach_alerts a
      JOIN coach_clients c ON a.client_id = c.id
      LEFT JOIN coach_rules r ON a.rule_id = r.id
      WHERE a.coach_id = ${coachId}
    `;
    
    // Dynamic filter application
    if (filters.status && filters.status !== 'all') {
      baseQuery = this.applyStatusFilter(baseQuery, filters.status);
    }
    
    if (filters.priority) {
      baseQuery = this.applyPriorityFilter(baseQuery, filters.priority);
    }
    
    if (filters.clientId) {
      baseQuery = sql`${baseQuery} AND a.client_id = ${filters.clientId}`;
    }
    
    if (filters.type) {
      baseQuery = sql`${baseQuery} AND a.type = ${filters.type}`;
    }
    
    // Sorting and pagination
    baseQuery = sql`
      ${baseQuery}
      ORDER BY 
        CASE 
          WHEN a.priority = 'critical' THEN 1
          WHEN a.priority = 'high' THEN 2
          WHEN a.priority = 'medium' THEN 3
          WHEN a.priority = 'low' THEN 4
          ELSE 5
        END,
        a.created_at DESC
      LIMIT ${filters.limit || 50}
      OFFSET ${filters.offset || 0}
    `;
    
    return baseQuery;
  }
  
  private applyStatusFilter(query: PostgresSQL, status: AlertStatus): PostgresSQL {
    const statusConditions = {
      'unread': sql`${query} AND a.read_at IS NULL`,
      'read': sql`${query} AND a.read_at IS NOT NULL AND a.acknowledged_at IS NULL`,
      'acknowledged': sql`${query} AND a.acknowledged_at IS NOT NULL AND a.dismissed_at IS NULL`,
      'dismissed': sql`${query} AND a.dismissed_at IS NOT NULL`
    };
    
    return statusConditions[status] || query;
  }
}
```

### Alert Action Handler
```typescript
class AlertActionHandler {
  async acknowledgeAlert(
    alertId: string,
    coachId: string,
    note?: string
  ): Promise<AlertActionResult> {
    const [alert] = await sql`
      UPDATE coach_alerts 
      SET 
        acknowledged_at = NOW(),
        acknowledged_by = ${coachId},
        coach_note = ${note || null}
      WHERE id = ${alertId} 
      AND coach_id = ${coachId}
      AND acknowledged_at IS NULL
      RETURNING *
    `;
    
    if (!alert) {
      throw new Error('Alert not found or already acknowledged');
    }
    
    // Log action for audit trail
    await this.logAlertAction({
      alertId,
      coachId,
      action: 'acknowledge',
      note,
      timestamp: new Date()
    });
    
    // Trigger any follow-up actions
    await this.triggerFollowUpActions(alert);
    
    return {
      success: true,
      alert,
      message: 'Alert acknowledged successfully'
    };
  }
  
  private async triggerFollowUpActions(alert: Alert): Promise<void> {
    // Check if this alert has automatic follow-up rules
    const followUpRules = await sql`
      SELECT * FROM coach_followup_rules
      WHERE alert_type = ${alert.type}
      AND priority = ${alert.priority}
      AND is_active = true
    `;
    
    for (const rule of followUpRules) {
      await this.executeFollowUpRule(rule, alert);
    }
  }
}
```

## ⚙️ Rule Engine Components (`routes/rules.ts`)

### Rule Builder Schema Generator
```typescript
class RuleBuilderSchemaGenerator {
  async generateSchema(): Promise<RuleBuilderSchema> {
    return {
      fields: await this.getAvailableFields(),
      operators: this.getOperatorDefinitions(),
      actions: this.getActionTypes(),
      templates: await this.getRuleTemplates(),
      validation: this.getValidationRules()
    };
  }
  
  private async getAvailableFields(): Promise<RuleField[]> {
    // Dynamic field discovery from actual data schema
    const metricFields = await sql`
      SELECT DISTINCT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name IN (
        'recovery_scores',
        'nutrition_daily_summary', 
        'training_sessions',
        'supplement_logs'
      )
    `;
    
    return metricFields.map(field => ({
      id: field.column_name,
      name: this.humanizeFieldName(field.column_name),
      type: this.mapDataType(field.data_type),
      nullable: field.is_nullable === 'YES',
      description: this.getFieldDescription(field.column_name),
      range: this.getFieldRange(field.column_name),
      unit: this.getFieldUnit(field.column_name)
    }));
  }
  
  private getOperatorDefinitions(): RuleOperator[] {
    return [
      {
        id: '>',
        name: 'Greater than',
        symbol: '>',
        types: ['number', 'percentage', 'duration'],
        description: 'Triggers when value exceeds threshold',
        example: 'recovery_score > 85'
      },
      {
        id: 'trend',
        name: 'Trend Analysis',
        symbol: '↗↘',
        types: ['number', 'percentage'],
        description: 'Analyzes direction of change over time',
        example: 'adherence trend decreasing over 7 days',
        parameters: ['direction', 'timeframe', 'sensitivity']
      },
      {
        id: 'streak',
        name: 'Streak Detection',
        symbol: '🔥',
        types: ['boolean', 'number'],
        description: 'Counts consecutive occurrences',
        example: 'missed_workouts streak >= 3',
        parameters: ['count', 'timeframe']
      }
    ];
  }
}
```

### Rule Execution Engine
```typescript
class RuleExecutionEngine {
  async executeRule(
    rule: CoachRule,
    clientData: ClientMetrics,
    clientHistory: ClientHistory
  ): Promise<RuleExecutionResult> {
    const startTime = Date.now();
    
    try {
      // 1. Validate rule structure
      const validation = await this.validateRule(rule);
      if (!validation.valid) {
        throw new Error(`Rule validation failed: ${validation.errors.join(', ')}`);
      }
      
      // 2. Evaluate conditions
      const conditionResults = await Promise.all(
        rule.conditions.map(condition => 
          this.evaluateCondition(condition, clientData, clientHistory)
        )
      );
      
      // 3. Apply logic (AND/OR)
      const triggered = rule.logic === 'AND' 
        ? conditionResults.every(result => result.triggered)
        : conditionResults.some(result => result.triggered);
      
      // 4. Generate detailed result
      const result: RuleExecutionResult = {
        ruleId: rule.id,
        triggered,
        confidence: this.calculateConfidence(conditionResults),
        conditions: conditionResults,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
      
      if (triggered) {
        result.generatedAlert = await this.generateAlert(rule, clientData, conditionResults);
      }
      
      return result;
      
    } catch (error) {
      return {
        ruleId: rule.id,
        triggered: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }
  
  private async evaluateCondition(
    condition: RuleCondition,
    clientData: ClientMetrics,
    clientHistory: ClientHistory
  ): Promise<ConditionResult> {
    
    const fieldValue = this.extractFieldValue(condition.field, clientData);
    const historicalValues = condition.timeframe 
      ? this.getHistoricalValues(condition.field, clientHistory, condition.timeframe)
      : null;
    
    switch (condition.operator) {
      case '>':
        return {
          triggered: fieldValue > condition.value,
          actualValue: fieldValue,
          expectedValue: condition.value,
          confidence: 1.0 // Simple comparison has high confidence
        };
        
      case 'trend':
        const trendAnalysis = this.analyzeTrend(historicalValues, condition.value);
        return {
          triggered: trendAnalysis.direction === condition.value,
          actualValue: trendAnalysis.slope,
          expectedValue: condition.value,
          confidence: trendAnalysis.confidence,
          metadata: {
            trendDirection: trendAnalysis.direction,
            trendStrength: trendAnalysis.strength,
            dataPoints: historicalValues.length
          }
        };
        
      case 'between':
        const [min, max] = condition.value as [number, number];
        return {
          triggered: fieldValue >= min && fieldValue <= max,
          actualValue: fieldValue,
          expectedValue: condition.value,
          confidence: 1.0
        };
        
      default:
        throw new Error(`Unsupported operator: ${condition.operator}`);
    }
  }
}
```

## 🎯 Autonomy System Components (`routes/autonomy.ts`)

### Autonomy Assessor Service
```typescript
class AutonomyAssessmentService {
  async assessClientAutonomy(
    clientId: string,
    timeframe: string = '90d'
  ): Promise<AutonomyAssessment> {
    
    const [consistencyScore, knowledgeScore, selfCorrectionScore, communicationScore] = 
      await Promise.all([
        this.assessConsistency(clientId, timeframe),
        this.assessKnowledge(clientId, timeframe),
        this.assessSelfCorrection(clientId, timeframe),
        this.assessCommunication(clientId, timeframe)
      ]);
    
    const overallScore = this.calculateOverallScore({
      consistency: consistencyScore,
      knowledge: knowledgeScore,
      selfCorrection: selfCorrectionScore,
      communication: communicationScore
    });
    
    const recommendedLevel = this.mapScoreToLevel(overallScore);
    const currentLevel = await this.getCurrentAutonomyLevel(clientId);
    
    return {
      clientId,
      currentLevel,
      recommendedLevel,
      assessmentDate: new Date(),
      scores: {
        consistency: consistencyScore,
        knowledge: knowledgeScore,
        selfCorrection: selfCorrectionScore,
        communication: communicationScore,
        overall: overallScore
      },
      levelChangeRecommended: currentLevel !== recommendedLevel,
      reasoning: this.generateReasoningExplanation(overallScore, {
        consistency: consistencyScore,
        knowledge: knowledgeScore,
        selfCorrection: selfCorrectionScore,
        communication: communicationScore
      }),
      interventions: this.suggestInterventions(recommendedLevel, {
        consistency: consistencyScore,
        knowledge: knowledgeScore,
        selfCorrection: selfCorrectionScore,
        communication: communicationScore
      }),
      nextAssessmentDate: this.calculateNextAssessmentDate(recommendedLevel)
    };
  }
  
  private async assessConsistency(clientId: string, timeframe: string): Promise<number> {
    const adherenceData = await sql`
      SELECT 
        AVG(overall_adherence) as avg_adherence,
        STDDEV(overall_adherence) as adherence_stddev,
        COUNT(*) as data_points
      FROM daily_adherence_summary
      WHERE client_id = ${clientId}
      AND date >= CURRENT_DATE - INTERVAL '${timeframe}'
    `;
    
    const checkInConsistency = await sql`
      SELECT 
        COUNT(DISTINCT date) * 1.0 / 
        (CURRENT_DATE - (CURRENT_DATE - INTERVAL '${timeframe}')) as checkin_rate
      FROM recovery_checkins
      WHERE user_id = ${clientId}
      AND date >= CURRENT_DATE - INTERVAL '${timeframe}'
    `;
    
    const adherenceScore = Math.max(0, Math.min(1, 
      adherenceData[0].avg_adherence - (adherenceData[0].adherence_stddev * 0.5)
    ));
    
    const checkInScore = Math.min(1, checkInConsistency[0].checkin_rate);
    
    // Weighted combination
    return (adherenceScore * 0.7) + (checkInScore * 0.3);
  }
  
  private async assessKnowledge(clientId: string, timeframe: string): Promise<number> {
    // Analyze client's demonstrated knowledge through:
    // 1. Quality of questions asked
    // 2. Appropriate self-adjustments made
    // 3. Understanding of feedback provided
    // 4. Proactive application of coaching principles
    
    const questionQuality = await this.analyzeQuestionQuality(clientId, timeframe);
    const selfAdjustments = await this.analyzeSelfAdjustments(clientId, timeframe);
    const feedbackComprehension = await this.analyzeFeedbackComprehension(clientId, timeframe);
    const proactiveApplication = await this.analyzeProactiveApplication(clientId, timeframe);
    
    return (
      questionQuality * 0.25 +
      selfAdjustments * 0.30 +
      feedbackComprehension * 0.25 +
      proactiveApplication * 0.20
    );
  }
}
```

## 📈 Adherence Analytics Components (`routes/adherence.ts`)

### Multi-Dimensional Adherence Analyzer
```typescript
class AdherenceAnalysisEngine {
  async analyzeClientAdherence(
    clientId: string,
    period: AnalysisPeriod
  ): Promise<ComprehensiveAdherence> {
    
    const [nutritionAdherence, trainingAdherence, recoveryAdherence, supplementAdherence] = 
      await Promise.all([
        this.analyzeNutritionAdherence(clientId, period),
        this.analyzeTrainingAdherence(clientId, period),
        this.analyzeRecoveryAdherence(clientId, period),
        this.analyzeSupplementAdherence(clientId, period)
      ]);
    
    const overallAdherence = this.calculateOverallAdherence({
      nutrition: nutritionAdherence,
      training: trainingAdherence,
      recovery: recoveryAdherence,
      supplements: supplementAdherence
    });
    
    const trends = await this.analyzeTrends(clientId, period);
    const insights = this.generateInsights(overallAdherence, trends);
    const predictions = await this.generatePredictions(clientId, trends);
    
    return {
      clientId,
      period,
      overall: overallAdherence,
      dimensions: {
        nutrition: nutritionAdherence,
        training: trainingAdherence,
        recovery: recoveryAdherence,
        supplements: supplementAdherence
      },
      trends,
      insights,
      predictions,
      generatedAt: new Date()
    };
  }
  
  private async analyzeNutritionAdherence(
    clientId: string,
    period: AnalysisPeriod
  ): Promise<NutritionAdherence> {
    
    const nutritionData = await sql`
      SELECT 
        date,
        target_calories,
        actual_calories,
        target_protein,
        actual_protein,
        target_carbs,
        actual_carbs,
        target_fat,
        actual_fat,
        meals_logged,
        target_meals,
        meal_timing_variance,
        food_quality_score
      FROM nutrition_daily_summary
      WHERE client_id = ${clientId}
      AND date BETWEEN ${period.start} AND ${period.end}
      ORDER BY date
    `;
    
    const adherenceMetrics = {
      calories: this.calculateCalorieAdherence(nutritionData),
      macros: {
        protein: this.calculateMacroAdherence(nutritionData, 'protein'),
        carbs: this.calculateMacroAdherence(nutritionData, 'carbs'),
        fat: this.calculateMacroAdherence(nutritionData, 'fat')
      },
      timing: this.calculateTimingAdherence(nutritionData),
      quality: this.calculateQualityAdherence(nutritionData),
      logging: this.calculateLoggingAdherence(nutritionData)
    };
    
    const overallNutrition = this.weightedAverage(adherenceMetrics, {
      calories: 0.25,
      protein: 0.20,
      carbs: 0.15,
      fat: 0.15,
      timing: 0.10,
      quality: 0.10,
      logging: 0.05
    });
    
    return {
      overall: overallNutrition,
      ...adherenceMetrics,
      trend: this.calculateTrend(nutritionData.map(d => d.overall_adherence)),
      dailyBreakdown: nutritionData.map(d => ({
        date: d.date,
        adherence: d.overall_adherence,
        calories: d.actual_calories / d.target_calories,
        protein: d.actual_protein / d.target_protein
      }))
    };
  }
}
```

### Predictive Analytics Engine
```typescript
class AdherencePredictionEngine {
  async generateAdherencePredictions(
    clientId: string,
    historicalData: AdherenceHistory
  ): Promise<AdherencePredictions> {
    
    // 1. Identify patterns in historical data
    const patterns = await this.identifyPatterns(historicalData);
    
    // 2. Assess current risk factors
    const riskFactors = await this.assessRiskFactors(clientId);
    
    // 3. Generate short-term predictions (next 7-30 days)
    const shortTermPrediction = this.generateShortTermPrediction(
      patterns, 
      riskFactors, 
      historicalData
    );
    
    // 4. Generate medium-term predictions (1-3 months)
    const mediumTermPrediction = this.generateMediumTermPrediction(
      patterns,
      riskFactors,
      historicalData
    );
    
    // 5. Identify intervention opportunities
    const interventionWindows = this.identifyInterventionWindows(
      shortTermPrediction,
      mediumTermPrediction
    );
    
    return {
      clientId,
      generatedAt: new Date(),
      predictions: {
        nextWeek: shortTermPrediction.nextWeek,
        nextMonth: shortTermPrediction.nextMonth,
        nextQuarter: mediumTermPrediction.nextQuarter
      },
      riskFactors,
      interventionWindows,
      confidence: this.calculatePredictionConfidence(patterns, historicalData),
      recommendedActions: this.generateRecommendedActions(
        shortTermPrediction,
        mediumTermPrediction,
        riskFactors
      )
    };
  }
  
  private generateShortTermPrediction(
    patterns: AdherencePatterns,
    riskFactors: RiskFactor[],
    history: AdherenceHistory
  ): ShortTermPrediction {
    
    const baselineAdherence = history.recent30Days.average;
    const seasonalEffect = patterns.seasonal.getCurrentEffect();
    const weekdayEffect = patterns.weekday.getAverageEffect();
    const stressEffect = riskFactors.reduce((acc, factor) => acc + factor.impact, 0);
    
    const predictedAdherence = Math.max(0, Math.min(1,
      baselineAdherence + seasonalEffect + weekdayEffect + stressEffect
    ));
    
    return {
      nextWeek: {
        adherence: predictedAdherence,
        confidence: this.calculateConfidence(patterns.consistency),
        keyFactors: [
          `Baseline: ${(baselineAdherence * 100).toFixed(0)}%`,
          `Seasonal adjustment: ${(seasonalEffect * 100).toFixed(1)}%`,
          `Risk factors: ${riskFactors.map(f => f.name).join(', ')}`
        ]
      },
      risks: riskFactors.filter(f => f.severity === 'high'),
      opportunities: this.identifyOpportunities(patterns, history)
    };
  }
}
```

## 🔄 Background Services

### Alert Watcher Service (`services/alertWatcher.ts`)
```typescript
export class CoachAlertWatcher {
  private readonly maxBatchSize = 10;
  private readonly batchDelayMs = 1000;
  
  async runAlertGeneration(): Promise<AlertWatcherResult> {
    const startTime = Date.now();
    let totalAlerts = 0;
    let processedCoaches = 0;
    
    try {
      const activeCoaches = await this.getActiveCoaches();
      console.log(`[CoachAlertWatcher] Processing ${activeCoaches.length} active coaches`);
      
      for (const coach of activeCoaches) {
        try {
          const coachAlerts = await this.processCoach(coach);
          totalAlerts += coachAlerts;
          processedCoaches++;
          
          // Rate limiting between coaches
          if (processedCoaches < activeCoaches.length) {
            await this.delay(this.batchDelayMs);
          }
          
        } catch (coachError) {
          console.error(`[CoachAlertWatcher] Failed for coach ${coach.id}:`, coachError);
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`[CoachAlertWatcher] Completed: ${totalAlerts} alerts for ${processedCoaches} coaches in ${duration}ms`);
      
      return {
        success: true,
        processedCoaches,
        totalAlerts,
        duration
      };
      
    } catch (error) {
      console.error('[CoachAlertWatcher] Fatal error:', error);
      return {
        success: false,
        error: error.message,
        processedCoaches,
        totalAlerts,
        duration: Date.now() - startTime
      };
    }
  }
  
  private async processCoach(coach: Coach): Promise<number> {
    const clients = await this.getCoachClients(coach.id);
    const enabledRules = await this.getEnabledRules(coach.id);
    
    if (enabledRules.length === 0) {
      return 0; // No rules to process
    }
    
    let generatedAlerts = 0;
    
    // Process clients in batches
    for (let i = 0; i < clients.length; i += this.maxBatchSize) {
      const clientBatch = clients.slice(i, i + this.maxBatchSize);
      
      const batchPromises = clientBatch.map(async (client) => {
        const clientAlerts = await this.processClientRules(client, enabledRules);
        
        if (clientAlerts.length > 0) {
          await this.saveAlerts(clientAlerts);
          await this.sendNotifications(coach, client, clientAlerts);
        }
        
        return clientAlerts.length;
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      const batchTotal = batchResults
        .filter(result => result.status === 'fulfilled')
        .reduce((sum, result) => sum + (result as PromiseFulfilledResult<number>).value, 0);
      
      generatedAlerts += batchTotal;
    }
    
    return generatedAlerts;
  }
  
  private async processClientRules(
    client: Client,
    rules: CoachRule[]
  ): Promise<GeneratedAlert[]> {
    const clientData = await this.getClientMetrics(client.id);
    const clientHistory = await this.getClientHistory(client.id, '30d');
    
    const alerts: GeneratedAlert[] = [];
    
    for (const rule of rules) {
      try {
        // Skip if rule was recently triggered for this client
        const recentTrigger = await this.checkRecentTrigger(rule.id, client.id);
        if (recentTrigger && !this.shouldRetrigger(rule, recentTrigger)) {
          continue;
        }
        
        const execution = await this.ruleEngine.executeRule(rule, clientData, clientHistory);
        
        if (execution.triggered) {
          alerts.push({
            coachId: rule.coachId,
            clientId: client.id,
            ruleId: rule.id,
            type: rule.alertType,
            priority: rule.priority,
            title: this.generateAlertTitle(rule, execution),
            message: this.generateAlertMessage(rule, execution, clientData),
            data: {
              triggerData: execution.conditions,
              clientSnapshot: this.createClientSnapshot(clientData),
              ruleSnapshot: rule
            },
            recommendedActions: this.generateRecommendedActions(rule, execution),
            expiresAt: this.calculateExpiryDate(rule.priority)
          });
        }
        
      } catch (ruleError) {
        console.error(`[CoachAlertWatcher] Rule execution failed: ${rule.id}`, ruleError);
      }
    }
    
    return this.optimizeAlerts(alerts);
  }
}
```

### Dashboard Aggregator Service (`services/dashboardAggregator.ts`)
```typescript
export class DashboardAggregatorService {
  private cache = new Map<string, CachedDashboardData>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  async getAggregatedDashboardData(coachId: string): Promise<DashboardData> {
    const cacheKey = `dashboard:${coachId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    
    const startTime = Date.now();
    
    // Parallel data fetching for optimal performance
    const [
      summary,
      clientCards,
      activityFeed,
      performanceMetrics,
      alertsSummary
    ] = await Promise.all([
      this.generateSummary(coachId),
      this.generateClientCards(coachId),
      this.generateActivityFeed(coachId),
      this.generatePerformanceMetrics(coachId),
      this.generateAlertsSummary(coachId)
    ]);
    
    const dashboardData: DashboardData = {
      summary,
      clientCards,
      activityFeed,
      performanceMetrics,
      alertsSummary,
      generatedAt: new Date(),
      generationTime: Date.now() - startTime
    };
    
    // Cache the result
    this.cache.set(cacheKey, {
      data: dashboardData,
      timestamp: Date.now()
    });
    
    return dashboardData;
  }
  
  // Invalidate cache when relevant data changes
  invalidateCoachCache(coachId: string): void {
    const cacheKey = `dashboard:${coachId}`;
    this.cache.delete(cacheKey);
  }
  
  // Background cache warming
  async warmCache(): Promise<void> {
    const activeCoaches = await sql`
      SELECT DISTINCT coach_id FROM coach_clients WHERE is_active = true
    `;
    
    console.log(`[DashboardAggregator] Warming cache for ${activeCoaches.length} coaches`);
    
    const warmingPromises = activeCoaches.map(async (coach) => {
      try {
        await this.getAggregatedDashboardData(coach.coach_id);
      } catch (error) {
        console.error(`[DashboardAggregator] Cache warming failed for coach ${coach.coach_id}:`, error);
      }
    });
    
    await Promise.allSettled(warmingPromises);
  }
}

// Start cache warming on module load
const dashboardAggregator = new DashboardAggregatorService();
setInterval(() => {
  dashboardAggregator.warmCache().catch(console.error);
}, 10 * 60 * 1000); // Every 10 minutes
```

## 🚀 Performance Optimizations

### Database Connection Management
```typescript
// Optimized connection pooling for background workers
const createOptimizedConnection = () => {
  return postgres(getDatabaseUrl(), {
    max: 20,                    // Higher pool size for parallel processing
    idle_timeout: 30,           // Longer idle timeout for background jobs
    connect_timeout: 10,
    transform: postgres.camel,  // Automatic camelCase transformation
    connection: {
      application_name: 'lumeos-human-coach',
      search_path: 'public',
    },
    onnotice: () => {}, // Suppress notices for cleaner logs
  });
};
```

### Intelligent Caching Strategy
```typescript
class IntelligentCache {
  private cache = new Map();
  private accessPatterns = new Map();
  
  async get<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300000): Promise<T> {
    // Track access patterns for intelligent prefetching
    this.trackAccess(key);
    
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Proactive prefetching of related data
    this.schedulePrefetch(key);
    
    return data;
  }
  
  private schedulePrefetch(accessedKey: string): void {
    const relatedKeys = this.getRelatedKeys(accessedKey);
    
    setTimeout(() => {
      relatedKeys.forEach(key => {
        if (!this.cache.has(key)) {
          // Prefetch related data in background
          this.prefetchKey(key);
        }
      });
    }, 1000);
  }
}
```