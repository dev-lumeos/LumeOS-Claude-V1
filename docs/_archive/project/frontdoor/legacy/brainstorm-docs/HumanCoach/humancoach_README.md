# Human Coach Module - Übersicht

Das Human Coach Module ist die professionelle Seite von LUMEOS - ein umfassendes Dashboard und Alert-System für menschliche Fitness-Coaches zur effektiven Betreuung ihrer Clients.

## Hauptfunktionen

### 📊 Comprehensive Dashboard (D5)
- **Client Overview**: Aggregierte Statistiken aller betreuten Kunden
- **Performance Metrics**: Coach-spezifische KPIs und Erfolgsmetriken
- **Activity Feed**: Real-time Updates über Client-Aktivitäten
- **Quick Actions**: Häufige Coach-Aktionen direkt zugänglich

### 🚨 Intelligent Alert System (D6)
- **Multi-Level Alerts**: Critical, Warning, Info-Level Benachrichtigungen
- **Smart Filtering**: Prioritäts-basierte Alert-Verwaltung
- **Batch Operations**: Effiziente Alert-Bearbeitung für mehrere Clients
- **Custom Alert Rules**: Konfigurierbare Trigger-Bedingungen

### ⚙️ Advanced Rule Engine (A2.5 + B11)
- **Visual Rule Builder**: Drag-and-drop Interface für Alert-Konfiguration
- **Multi-Condition Logic**: Komplexe AND/OR-Regel-Kombinationen
- **Real-time Validation**: Sofortige Regel-Überprüfung und Preview
- **Template System**: Vordefinierte Regel-Templates für häufige Szenarien

### 🎯 Client Autonomy Management (D8)
- **Autonomy Levels**: 5-stufiges System von Novice bis Expert
- **Dynamic Adjustment**: Automatische Level-Anpassungen basierend auf Performance
- **Intervention Thresholds**: Autonomy-spezifische Coaching-Intensität
- **Progress Tracking**: Langzeit-Entwicklung der Client-Selbständigkeit

### 📈 Adherence Analytics (D9)
- **Multi-Dimensional Tracking**: Nutrition, Training, Recovery, Supplements
- **Trend Analysis**: Langzeit-Adherence-Muster und Vorhersagen
- **Benchmark Comparisons**: Client vs. Kohorte vs. Zielwerte
- **Intervention Points**: Automatische Erkennung kritischer Adherence-Drops

## API Port
**5600** - Human Coach API Service

## Dashboard Components

### Summary Widget
```typescript
interface DashboardSummary {
  totalClients: number;
  activeClients: number;
  criticalAlerts: number;
  weeklyAdherence: number;
  avgAutonomyLevel: number;
  recentAchievements: number;
}
```

### Client Performance Cards
```typescript
interface ClientCard {
  id: string;
  name: string;
  avatar?: string;
  autonomyLevel: 1 | 2 | 3 | 4 | 5;
  overallAdherence: number;
  criticalAlerts: number;
  lastActivity: Date;
  quickStats: {
    nutrition: { current: number; target: number };
    recovery: { score: number; trend: 'up' | 'down' | 'stable' };
    training: { sessionsWeek: number; adherence: number };
  };
}
```

## Alert System Architecture

### Alert Types & Priorities
```typescript
enum AlertType {
  ADHERENCE_DROP = 'adherence_drop',
  MISSED_GOALS = 'missed_goals', 
  RECOVERY_ISSUES = 'recovery_issues',
  NUTRITION_CONCERNS = 'nutrition_concerns',
  TRAINING_PLATEAUS = 'training_plateaus',
  SUPPLEMENT_COMPLIANCE = 'supplement_compliance',
  MILESTONE_ACHIEVED = 'milestone_achieved'
}

enum AlertPriority {
  CRITICAL = 1,  // Immediate attention required
  HIGH = 2,      // Same day response needed
  MEDIUM = 3,    // Within 2-3 days
  LOW = 4,       // Weekly review
  INFO = 5       // FYI only
}
```

### Smart Alert Generation
- **Pattern Recognition**: ML-basierte Erkennung problematischer Trends
- **Client Context**: Autonomy-Level und Coaching-History berücksichtigen
- **Alert Fatigue Prevention**: Intelligentes Throttling und Gruppierung
- **Actionable Insights**: Jeder Alert enthält konkrete Handlungsempfehlungen

## Rule Engine Features

### Visual Rule Builder Schema
```typescript
interface RuleCondition {
  field: string;           // 'recovery_score', 'nutrition_adherence', etc.
  operator: '>' | '<' | '==' | 'between' | 'trend';
  value: number | string | [number, number];
  timeframe?: '1d' | '3d' | '1w' | '2w' | '1m';
}

interface RuleAction {
  type: 'alert' | 'email' | 'sms' | 'auto_adjust' | 'flag_review';
  priority: AlertPriority;
  message: string;
  assignTo?: string;
}

interface CoachRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  logic: 'AND' | 'OR';
  actions: RuleAction[];
  enabled: boolean;
  clientFilter?: string[];  // Apply to specific clients only
}
```

### Rule Templates
```typescript
const RULE_TEMPLATES = {
  RECOVERY_WARNING: {
    name: "Low Recovery Alert",
    conditions: [{
      field: 'recovery_score',
      operator: '<',
      value: 60,
      timeframe: '3d'
    }],
    actions: [{
      type: 'alert',
      priority: AlertPriority.HIGH,
      message: 'Client showing consistently low recovery scores'
    }]
  },
  
  ADHERENCE_DROP: {
    name: "Nutrition Adherence Drop", 
    conditions: [{
      field: 'nutrition_adherence',
      operator: 'trend',
      value: 'declining',
      timeframe: '1w'
    }],
    actions: [{
      type: 'alert',
      priority: AlertPriority.MEDIUM,
      message: 'Nutrition adherence declining over past week'
    }]
  }
};
```

## Autonomy Level System

### Level Definitions
```typescript
enum AutonomyLevel {
  NOVICE = 1,      // Needs daily check-ins and guidance
  BEGINNER = 2,    // Weekly coaching with structured plans  
  INTERMEDIATE = 3, // Bi-weekly check-ins, some flexibility
  ADVANCED = 4,    // Monthly reviews, high self-direction
  EXPERT = 5       // Minimal oversight, peer mentoring capable
}

interface AutonomyAssessment {
  level: AutonomyLevel;
  factors: {
    consistency: number;      // Adherence consistency over time
    knowledge: number;        // Demonstrated understanding
    selfCorrection: number;   // Ability to self-adjust
    communication: number;    // Proactive communication
  };
  recommendedInterventions: string[];
  nextReviewDate: Date;
}
```

### Dynamic Level Adjustment
```typescript
// Automatic autonomy level updates based on performance
function assessAutonomyLevel(clientHistory: ClientHistory): AutonomyAssessment {
  const consistency = calculateConsistencyScore(clientHistory.adherence);
  const knowledge = assessKnowledgeLevel(clientHistory.interactions);
  const selfCorrection = measureSelfCorrectionAbility(clientHistory.adjustments);
  const communication = evaluateProactiveCommunication(clientHistory.messages);
  
  const overallScore = (consistency + knowledge + selfCorrection + communication) / 4;
  
  let newLevel: AutonomyLevel;
  if (overallScore >= 0.9) newLevel = AutonomyLevel.EXPERT;
  else if (overallScore >= 0.75) newLevel = AutonomyLevel.ADVANCED;
  else if (overallScore >= 0.6) newLevel = AutonomyLevel.INTERMEDIATE;
  else if (overallScore >= 0.45) newLevel = AutonomyLevel.BEGINNER;
  else newLevel = AutonomyLevel.NOVICE;
  
  return {
    level: newLevel,
    factors: { consistency, knowledge, selfCorrection, communication },
    recommendedInterventions: generateInterventions(newLevel, clientHistory),
    nextReviewDate: calculateNextReview(newLevel)
  };
}
```

## Adherence Analytics

### Multi-Dimensional Adherence Tracking
```typescript
interface AdherenceMetrics {
  overall: number;          // Weighted average across all dimensions
  dimensions: {
    nutrition: {
      calories: number;     // Calorie target adherence
      macros: number;       // Macro distribution adherence
      timing: number;       // Meal timing consistency
      quality: number;      // Food quality score
    };
    training: {
      frequency: number;    // Session frequency adherence
      intensity: number;    // Prescribed intensity compliance
      volume: number;       // Volume targets met
      progression: number;  // Progressive overload adherence
    };
    recovery: {
      sleep: number;        // Sleep goal adherence
      checkins: number;     // Recovery check-in consistency
      modalities: number;   // Recovery activity compliance
    };
    supplements: {
      timing: number;       // Correct timing adherence
      dosage: number;       // Correct dosage compliance
      consistency: number;  // Daily consistency
    };
  };
  trends: {
    weekly: number[];       // Last 12 weeks
    monthly: number[];      // Last 12 months
    prediction: number;     // Predicted next week adherence
  };
}
```

### Adherence Intervention Points
```typescript
// Automatic intervention recommendations
function analyzeAdherenceInterventions(metrics: AdherenceMetrics): Intervention[] {
  const interventions: Intervention[] = [];
  
  // Critical adherence drops
  if (metrics.overall < 0.6) {
    interventions.push({
      type: 'urgent_review',
      priority: AlertPriority.CRITICAL,
      message: 'Overall adherence below 60% - immediate intervention required',
      recommendedActions: [
        'Schedule 1:1 coaching call within 24h',
        'Review and simplify current plan',
        'Identify primary barriers'
      ]
    });
  }
  
  // Dimension-specific interventions
  if (metrics.dimensions.nutrition.calories < 0.7) {
    interventions.push({
      type: 'nutrition_focus',
      priority: AlertPriority.HIGH,
      message: 'Calorie adherence concerning - nutrition support needed',
      recommendedActions: [
        'Review meal planning strategies',
        'Consider meal prep coaching',
        'Evaluate calorie target appropriateness'
      ]
    });
  }
  
  return interventions.sort((a, b) => a.priority - b.priority);
}
```

## Background Processing

### Coach Alert Watcher
```typescript
// Runs every 30 minutes to generate proactive alerts
async function runCoachAlertWatcher(): Promise<void> {
  const coaches = await getActiveCoaches();
  
  for (const coach of coaches) {
    const clients = await getCoachClients(coach.id);
    
    for (const client of clients) {
      // Run all enabled rules for this client
      const enabledRules = await getEnabledRules(coach.id, client.id);
      
      for (const rule of enabledRules) {
        const alertTriggered = await evaluateRule(rule, client);
        
        if (alertTriggered) {
          await createAlert({
            coach_id: coach.id,
            client_id: client.id,
            rule_id: rule.id,
            type: rule.actions[0].type,
            priority: rule.actions[0].priority,
            message: rule.actions[0].message,
            data: alertTriggered.data
          });
        }
      }
    }
  }
}
```

### Alert Cleanup & Archiving
```typescript
// Daily cleanup of old, resolved alerts
async function cleanupOldAlerts(): Promise<void> {
  // Auto-dismiss low priority alerts after 7 days
  await sql`
    UPDATE coach_alerts 
    SET dismissed_at = NOW()
    WHERE priority >= 4 
    AND created_at < NOW() - INTERVAL '7 days'
    AND dismissed_at IS NULL
  `;
  
  // Archive resolved alerts after 30 days
  await sql`
    DELETE FROM coach_alerts
    WHERE (dismissed_at IS NOT NULL OR acknowledged_at IS NOT NULL)
    AND created_at < NOW() - INTERVAL '30 days'
  `;
}
```

## Integration Points

### Client Data Aggregation
- **Recovery Module**: Sleep scores, overtraining indicators
- **Nutrition Module**: Calorie/macro adherence, meal timing
- **Training Module**: Session frequency, intensity compliance, PRs
- **Supplement Module**: Timing adherence, compliance rates
- **Coach Module**: AI conversation insights, goal progress

### External Notifications
- **Email Alerts**: Critical alerts sent via email
- **SMS Notifications**: Urgent interventions via SMS
- **Slack Integration**: Team notifications for coaching teams
- **Calendar Integration**: Automatic coaching call scheduling

## Security & Permissions

### Role-Based Access Control
```typescript
enum CoachRole {
  HEAD_COACH = 'head_coach',     // Full access to all features
  SENIOR_COACH = 'senior_coach', // Access to advanced analytics
  COACH = 'coach',               // Standard coaching features
  TRAINEE_COACH = 'trainee'      // Limited access, supervised
}

interface CoachPermissions {
  viewAllClients: boolean;
  createRules: boolean;
  modifyAutonomyLevels: boolean;
  accessAdvancedAnalytics: boolean;
  exportClientData: boolean;
  manageOtherCoaches: boolean;
}
```

### Data Protection
- **Client Consent**: Explicit consent for coach access to detailed data
- **Audit Logging**: Complete log of coach actions and data access
- **Data Minimization**: Coaches see only necessary client information
- **Automatic Expiry**: Coach access expires if client relationship ends

## Technology Stack
- **Hono Framework**: High-performance API architecture
- **PostgreSQL**: Complex queries and analytics
- **Background Workers**: 30-min alert generation cycles
- **Real-time Updates**: WebSocket connections for live dashboard
- **Advanced Analytics**: Statistical analysis and trend prediction