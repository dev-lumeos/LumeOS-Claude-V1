# Human Coach API Endpoints

Basis-URL: `http://localhost:5600/api/human-coach`

## Authentication
Alle Endpoints erfordern Coach-Authentifizierung mit entsprechenden Berechtigungen.

## Dashboard Endpoints (D5)

### `GET /api/human-coach/dashboard/summary`
Übersichts-Statistiken für das Coach-Dashboard.

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalClients": 45,
    "activeClients": 42,
    "inactiveClients": 3,
    "criticalAlerts": 3,
    "highPriorityAlerts": 8,
    "weeklyAdherence": 0.78,
    "avgAutonomyLevel": 2.6,
    "recentAchievements": 12,
    "newClients": 4,
    "period": {
      "start": "2026-03-17",
      "end": "2026-03-23"
    }
  }
}
```

### `GET /api/human-coach/dashboard/clients`
Alle Clients mit aggregierten Daten.

**Parameters:**
- `limit` (optional): Max. Anzahl Clients (default: 50)
- `offset` (optional): Pagination offset
- `sort` (optional): `name`, `adherence`, `alerts`, `activity` (default: `name`)
- `filter` (optional): `active`, `inactive`, `critical`, `all` (default: `active`)

**Response:**
```json
{
  "ok": true,
  "data": {
    "clients": [
      {
        "id": "uuid",
        "name": "Max Mustermann",
        "email": "max@example.com",
        "avatar": "https://...",
        "autonomyLevel": 3,
        "overallAdherence": 0.82,
        "criticalAlerts": 0,
        "highPriorityAlerts": 1,
        "lastActivity": "2026-03-24T18:30:00Z",
        "joinedDate": "2026-01-15T00:00:00Z",
        "quickStats": {
          "nutrition": {
            "current": 1850,
            "target": 2200,
            "adherence": 0.84
          },
          "recovery": {
            "score": 78,
            "trend": "stable",
            "lastCheckin": "2026-03-24"
          },
          "training": {
            "sessionsThisWeek": 3,
            "targetSessions": 4,
            "adherence": 0.88
          },
          "supplements": {
            "takenToday": 4,
            "totalDaily": 5,
            "adherence": 0.91
          }
        },
        "tags": ["muscle_gain", "intermediate"],
        "notes": "Responds well to structured plans"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### `GET /api/human-coach/dashboard/activity`
Recent activity feed für Coach-Dashboard.

**Parameters:**
- `hours` (optional): Zeitraum in Stunden (default: 24)
- `types` (optional): Komma-separierte Liste: `alert`, `achievement`, `checkin`, `goal` (default: all)

**Response:**
```json
{
  "ok": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "type": "achievement",
        "clientId": "uuid",
        "clientName": "Sarah Schmidt",
        "title": "New Personal Record",
        "description": "Bench Press: 80kg → 82.5kg (+3%)",
        "timestamp": "2026-03-24T16:45:00Z",
        "data": {
          "exercise": "Bench Press",
          "previousWeight": 80,
          "newWeight": 82.5,
          "improvement": 3.1
        }
      },
      {
        "id": "uuid",
        "type": "alert",
        "clientId": "uuid", 
        "clientName": "Tom Weber",
        "title": "Recovery Score Declining",
        "description": "3-day average below 65/100",
        "timestamp": "2026-03-24T14:20:00Z",
        "priority": "high",
        "data": {
          "averageScore": 62,
          "trend": "declining",
          "days": 3
        }
      },
      {
        "id": "uuid",
        "type": "checkin",
        "clientId": "uuid",
        "clientName": "Lisa Müller", 
        "title": "Recovery Check-in Completed",
        "description": "Sleep: 8h, Quality: 9/10, Score: 89/100",
        "timestamp": "2026-03-24T08:15:00Z",
        "data": {
          "sleepHours": 8,
          "sleepQuality": 9,
          "recoveryScore": 89
        }
      }
    ],
    "summary": {
      "totalActivities": 24,
      "alertsGenerated": 5,
      "achievementsUnlocked": 3,
      "checkinsCompleted": 16
    }
  }
}
```

### `GET /api/human-coach/dashboard/metrics`
Coach-Performance-Metriken.

**Parameters:**
- `period` (optional): `week`, `month`, `quarter` (default: `month`)

**Response:**
```json
{
  "ok": true,
  "data": {
    "period": {
      "start": "2026-02-24",
      "end": "2026-03-24",
      "type": "month"
    },
    "clientRetention": {
      "rate": 0.94,
      "trend": "+2.1%",
      "benchmark": 0.89
    },
    "adherenceImprovement": {
      "avgImprovement": 0.12,
      "clientsImproved": 38,
      "clientsDeclined": 4,
      "trend": "+8.3%"
    },
    "goalsAchieved": {
      "total": 47,
      "onTime": 42,
      "delayed": 5,
      "completionRate": 0.89
    },
    "responseTime": {
      "avgResponseHours": 4.2,
      "target": 6.0,
      "performance": "excellent"
    },
    "clientSatisfaction": {
      "avgRating": 4.7,
      "totalRatings": 38,
      "trend": "+0.3"
    }
  }
}
```

## Alert Endpoints (D6)

### `GET /api/human-coach/alerts`
Alle Coach-Alerts abrufen.

**Parameters:**
- `status` (optional): `unread`, `read`, `acknowledged`, `dismissed`, `all` (default: `unread`)
- `priority` (optional): `critical`, `high`, `medium`, `low`, `info` (default: all)
- `clientId` (optional): Filter nach spezifischem Client
- `type` (optional): Alert-Typ filter
- `limit` (optional): Max. Anzahl Alerts (default: 50)

**Response:**
```json
{
  "ok": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "clientId": "uuid",
        "clientName": "Max Mustermann",
        "type": "adherence_drop",
        "priority": "high",
        "title": "Nutrition Adherence Drop",
        "message": "Nutrition adherence declined from 85% to 62% over past week",
        "data": {
          "metric": "nutrition_adherence",
          "previousValue": 0.85,
          "currentValue": 0.62,
          "change": -0.23,
          "timeframe": "7d"
        },
        "recommendedActions": [
          "Schedule nutrition review call",
          "Review meal planning strategy", 
          "Check for external stressors"
        ],
        "ruleId": "uuid",
        "ruleName": "Nutrition Adherence Monitor",
        "createdAt": "2026-03-24T10:15:00Z",
        "readAt": null,
        "acknowledgedAt": null,
        "dismissedAt": null,
        "expiresAt": "2026-03-31T10:15:00Z"
      }
    ],
    "summary": {
      "total": 15,
      "unread": 8,
      "critical": 2,
      "high": 5,
      "medium": 6,
      "low": 2
    }
  }
}
```

### `GET /api/human-coach/alerts/summary`
Alert-Zusammenfassung für Dashboard-Widget.

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalAlerts": 15,
    "unreadAlerts": 8,
    "priorityBreakdown": {
      "critical": 2,
      "high": 5, 
      "medium": 6,
      "low": 2,
      "info": 0
    },
    "typeBreakdown": {
      "adherence_drop": 6,
      "recovery_issues": 3,
      "missed_goals": 2,
      "training_plateaus": 2,
      "nutrition_concerns": 1,
      "milestone_achieved": 1
    },
    "clientsWithAlerts": 12,
    "avgAlertsPerClient": 1.25,
    "oldestUnread": "2026-03-22T14:30:00Z"
  }
}
```

### `PUT /api/human-coach/alerts/:id/read`
Alert als gelesen markieren.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "readAt": "2026-03-24T15:45:00Z"
  }
}
```

### `PUT /api/human-coach/alerts/:id/acknowledge`
Alert als bearbeitet kennzeichnen.

**Request Body:**
```json
{
  "note": "Called client, adjusted nutrition plan"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid", 
    "acknowledgedAt": "2026-03-24T15:45:00Z",
    "note": "Called client, adjusted nutrition plan"
  }
}
```

### `PUT /api/human-coach/alerts/:id/dismiss`
Alert verwerfen.

**Request Body:**
```json
{
  "reason": "false_positive"
}
```

### `POST /api/human-coach/alerts/generate`
Manuelle Alert-Generierung für alle Clients.

**Response:**
```json
{
  "ok": true,
  "data": {
    "processed": 45,
    "alertsGenerated": 7,
    "duration": "2.3s"
  }
}
```

### `GET /api/human-coach/alerts/settings`
Alert-Einstellungen abrufen.

**Response:**
```json
{
  "ok": true,
  "data": {
    "emailNotifications": true,
    "smsForCritical": true,
    "batchAlerts": false,
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "07:00"
    },
    "priorityThresholds": {
      "adherence_drop": 0.15,
      "recovery_decline": 20,
      "missed_sessions": 2
    }
  }
}
```

### `PUT /api/human-coach/alerts/settings`
Alert-Einstellungen aktualisieren.

**Request Body:**
```json
{
  "emailNotifications": false,
  "smsForCritical": true,
  "quietHours": {
    "enabled": false
  }
}
```

## Rule Engine Endpoints (A2.5 + B11)

### `GET /api/human-coach/rules/schema`
Schema für Rule Builder Interface.

**Response:**
```json
{
  "ok": true,
  "data": {
    "fields": [
      {
        "id": "recovery_score",
        "name": "Recovery Score",
        "type": "number",
        "range": [0, 100],
        "description": "Daily recovery score"
      },
      {
        "id": "nutrition_adherence", 
        "name": "Nutrition Adherence",
        "type": "percentage",
        "range": [0, 1],
        "description": "Weekly nutrition adherence rate"
      }
    ],
    "operators": [
      { "id": ">", "name": "Greater than", "types": ["number", "percentage"] },
      { "id": "<", "name": "Less than", "types": ["number", "percentage"] },
      { "id": "==", "name": "Equals", "types": ["number", "string"] },
      { "id": "between", "name": "Between", "types": ["number"] },
      { "id": "trend", "name": "Trend", "types": ["number"], "values": ["increasing", "decreasing", "stable"] }
    ],
    "actions": [
      {
        "id": "alert",
        "name": "Generate Alert",
        "parameters": ["priority", "message"]
      },
      {
        "id": "email",
        "name": "Send Email",
        "parameters": ["recipient", "subject", "message"]
      }
    ],
    "templates": [
      {
        "id": "recovery_warning",
        "name": "Low Recovery Alert",
        "description": "Alert when recovery score is consistently low"
      }
    ]
  }
}
```

### `GET /api/human-coach/rules`
Alle Coach-Regeln abrufen.

**Parameters:**
- `enabled` (optional): `true`, `false`, `all` (default: `all`)
- `clientId` (optional): Filter nach Client-spezifischen Regeln

**Response:**
```json
{
  "ok": true,
  "data": {
    "rules": [
      {
        "id": "uuid",
        "name": "Low Recovery Alert", 
        "description": "Monitor for consistently low recovery scores",
        "enabled": true,
        "conditions": [
          {
            "field": "recovery_score",
            "operator": "<",
            "value": 60,
            "timeframe": "3d"
          }
        ],
        "logic": "AND",
        "actions": [
          {
            "type": "alert",
            "priority": "high",
            "message": "Client showing consistently low recovery scores for 3+ days"
          }
        ],
        "clientFilter": null,
        "lastTriggered": "2026-03-22T14:30:00Z",
        "triggerCount": 5,
        "createdAt": "2026-02-15T00:00:00Z",
        "updatedAt": "2026-03-20T12:00:00Z"
      }
    ],
    "stats": {
      "total": 12,
      "enabled": 10,
      "disabled": 2,
      "recentTriggers": 15
    }
  }
}
```

### `POST /api/human-coach/rules`
Neue Regel erstellen.

**Request Body:**
```json
{
  "name": "Training Frequency Alert",
  "description": "Alert when client misses 2+ training sessions",
  "conditions": [
    {
      "field": "training_sessions_week",
      "operator": "<", 
      "value": 3,
      "timeframe": "1w"
    }
  ],
  "logic": "AND",
  "actions": [
    {
      "type": "alert",
      "priority": "medium",
      "message": "Client has missed training sessions this week"
    }
  ],
  "clientFilter": ["uuid1", "uuid2"],
  "enabled": true
}
```

### `PUT /api/human-coach/rules/:id`
Bestehende Regel aktualisieren.

### `DELETE /api/human-coach/rules/:id`
Regel löschen.

### `POST /api/human-coach/rules/:id/toggle`
Regel aktivieren/deaktivieren.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "enabled": false,
    "toggledAt": "2026-03-24T15:45:00Z"
  }
}
```

## Autonomy Management Endpoints (D8)

### `GET /api/human-coach/clients/:id/autonomy`
Client-Autonomielevel abrufen.

**Response:**
```json
{
  "ok": true,
  "data": {
    "clientId": "uuid",
    "currentLevel": 3,
    "previousLevel": 2,
    "levelName": "Intermediate",
    "assessment": {
      "consistency": 0.78,
      "knowledge": 0.82,
      "selfCorrection": 0.71,
      "communication": 0.85,
      "overallScore": 0.79
    },
    "levelHistory": [
      {
        "level": 3,
        "assignedAt": "2026-03-15T00:00:00Z",
        "reason": "Improved consistency and self-correction"
      },
      {
        "level": 2,
        "assignedAt": "2026-01-20T00:00:00Z",
        "reason": "Initial assessment"
      }
    ],
    "nextReviewDate": "2026-04-15T00:00:00Z",
    "recommendedInterventions": [
      "Introduce more flexible meal timing",
      "Allow workout modifications within guidelines",
      "Reduce check-in frequency to weekly"
    ],
    "coachingStyle": {
      "frequency": "bi-weekly",
      "autonomy": "guided_flexibility",
      "interventionThreshold": "medium"
    }
  }
}
```

### `PUT /api/human-coach/clients/:id/autonomy`
Autonomielevel aktualisieren.

**Request Body:**
```json
{
  "level": 4,
  "reason": "Demonstrated excellent self-management over 8 weeks",
  "nextReviewDate": "2026-05-24",
  "interventions": [
    "Monthly check-ins only",
    "Self-directed program modifications allowed"
  ]
}
```

## Adherence Analytics Endpoints (D9)

### `GET /api/human-coach/clients/:id/adherence`
Detaillierte Adherence-Analyse für einen Client.

**Parameters:**
- `period` (optional): `week`, `month`, `quarter` (default: `month`)
- `dimensions` (optional): `nutrition,training,recovery,supplements` (default: all)

**Response:**
```json
{
  "ok": true,
  "data": {
    "clientId": "uuid",
    "period": {
      "start": "2026-02-24",
      "end": "2026-03-24",
      "type": "month"
    },
    "overall": 0.78,
    "trend": "stable",
    "dimensions": {
      "nutrition": {
        "overall": 0.82,
        "calories": 0.85,
        "macros": 0.78,
        "timing": 0.74,
        "quality": 0.91
      },
      "training": {
        "overall": 0.88,
        "frequency": 0.92,
        "intensity": 0.85,
        "volume": 0.87,
        "progression": 0.83
      },
      "recovery": {
        "overall": 0.71,
        "sleep": 0.76,
        "checkins": 0.68,
        "modalities": 0.69
      },
      "supplements": {
        "overall": 0.91,
        "timing": 0.89,
        "dosage": 0.95,
        "consistency": 0.89
      }
    },
    "weeklyBreakdown": [
      { "week": "2026-02-24", "overall": 0.75 },
      { "week": "2026-03-03", "overall": 0.82 },
      { "week": "2026-03-10", "overall": 0.79 },
      { "week": "2026-03-17", "overall": 0.76 }
    ],
    "insights": [
      {
        "type": "strength",
        "message": "Excellent supplement compliance - maintaining 91% consistency"
      },
      {
        "type": "concern", 
        "message": "Recovery check-ins declining - only 68% completion rate"
      }
    ],
    "recommendations": [
      "Focus on recovery check-in consistency",
      "Consider simpler recovery tracking method",
      "Maintain current supplement routine"
    ]
  }
}
```

### `GET /api/human-coach/clients/:id/adherence/history`
Langzeit-Adherence-Geschichte.

**Parameters:**
- `months` (optional): Anzahl Monate zurück (default: 6)

**Response:**
```json
{
  "ok": true,
  "data": {
    "months": [
      {
        "month": "2026-03",
        "overall": 0.78,
        "nutrition": 0.82,
        "training": 0.88,
        "recovery": 0.71,
        "supplements": 0.91,
        "events": [
          {
            "date": "2026-03-15",
            "type": "vacation",
            "impact": -0.12,
            "description": "Spring break vacation affecting routine"
          }
        ]
      }
    ],
    "trends": {
      "overall": "stable",
      "nutrition": "improving",
      "training": "stable", 
      "recovery": "declining",
      "supplements": "stable"
    },
    "predictions": {
      "nextMonth": 0.81,
      "confidence": 0.73,
      "factors": [
        "Recovery trend needs attention",
        "Strong supplement compliance continues"
      ]
    }
  }
}
```

### `GET /api/human-coach/adherence/summary`
Adherence-Übersicht für alle Clients.

**Parameters:**
- `period` (optional): `week`, `month` (default: `week`)
- `sortBy` (optional): `overall`, `nutrition`, `training`, `name` (default: `overall`)
- `order` (optional): `asc`, `desc` (default: `asc`)

**Response:**
```json
{
  "ok": true,
  "data": {
    "period": {
      "start": "2026-03-17",
      "end": "2026-03-23",
      "type": "week"
    },
    "summary": {
      "avgAdherence": 0.79,
      "topPerformers": 12,
      "needsAttention": 8,
      "improving": 15,
      "declining": 5
    },
    "clients": [
      {
        "id": "uuid",
        "name": "Sarah Schmidt",
        "overall": 0.94,
        "nutrition": 0.96,
        "training": 0.91,
        "recovery": 0.87,
        "supplements": 0.98,
        "trend": "stable",
        "rank": 1,
        "alerts": 0
      }
    ],
    "benchmarks": {
      "excellent": 0.90,
      "good": 0.75,
      "attention": 0.60,
      "critical": 0.45
    }
  }
}
```

## Error Handling

Konsistente Error-Responses für alle Endpoints:

```json
{
  "ok": false,
  "error": "Detaillierte Fehlerbeschreibung",
  "code": "SPECIFIC_ERROR_CODE",
  "details": {
    "field": "value",
    "context": "additional_info"
  }
}
```

**HTTP Status Codes:**
- `200`: Erfolg
- `400`: Ungültige Anfrage
- `401`: Nicht authentifiziert
- `403`: Keine Berechtigung
- `404`: Nicht gefunden
- `429`: Rate Limit erreicht
- `500`: Server-Fehler