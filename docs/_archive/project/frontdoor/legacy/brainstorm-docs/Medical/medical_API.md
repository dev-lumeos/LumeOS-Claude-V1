# Medical API Documentation

## Base URL
`http://localhost:5800`

## Architecture Overview

The Medical API provides comprehensive health data management and analysis, featuring:
- **Biomarker Tracking** - Complete blood panel and health metric analysis
- **Health Insights** - AI-powered interpretation of medical data
- **Trend Analysis** - Long-term health pattern recognition
- **Report Generation** - Professional medical report creation
- **Medication Management** - Prescription and supplement interaction tracking
- **Symptom Monitoring** - Health issue tracking and correlation analysis

## Core Biomarker API

### Biomarker Catalog

#### `GET /biomarkers`
Get comprehensive biomarker reference catalog with ranges and interpretations.

**Query Parameters:**
- `category` (string): Filter by biomarker category (blood, hormone, lipid, metabolic)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "bio_001",
      "name": "Total Cholesterol",
      "category": "lipid",
      "unit": "mg/dL",
      "description": "Total cholesterol measures all cholesterol in blood",
      "lab_range_min": 100.0,
      "lab_range_max": 200.0,
      "optimal_range_min": 150.0,
      "optimal_range_max": 180.0,
      "sort_order": 10,
      "common_name": "Cholesterol",
      "abbreviations": ["CHOL", "TC"],
      "interpretation_notes": "Values above 240 mg/dL indicate high risk",
      "affected_by": ["diet", "exercise", "genetics", "medications"],
      "related_biomarkers": ["bio_002", "bio_003"]
    }
  ]
}
```

#### `GET /biomarkers/:id`
Get detailed information about a specific biomarker.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "bio_001",
    "name": "Total Cholesterol", 
    "category": "lipid",
    "unit": "mg/dL",
    "description": "Comprehensive cholesterol measurement...",
    "lab_range_min": 100.0,
    "lab_range_max": 200.0,
    "optimal_range_min": 150.0,
    "optimal_range_max": 180.0,
    "interpretation_guidelines": {
      "low": "Below 150 mg/dL - May indicate nutritional deficiency",
      "optimal": "150-180 mg/dL - Ideal range for cardiovascular health",
      "elevated": "180-240 mg/dL - Monitor diet and exercise",
      "high": "Above 240 mg/dL - Medical intervention recommended"
    },
    "lifestyle_factors": {
      "diet": "Saturated fat, trans fat intake significantly impact levels",
      "exercise": "Regular cardio can reduce levels by 5-15%",
      "sleep": "Poor sleep quality associated with higher levels"
    }
  }
}
```

### User Biomarker Data

#### `POST /biomarkers/log`
Log biomarker test results for the authenticated user.

**Body:**
```json
{
  "biomarker_id": "bio_001",
  "value": 185.5,
  "test_date": "2026-03-20T00:00:00Z",
  "lab_name": "LabCorp",
  "reference_range": {
    "min": 100.0,
    "max": 200.0
  },
  "notes": "Fasting blood test",
  "doctor_notes": "Follow up in 3 months"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "result_123",
    "biomarker_id": "bio_001",
    "value": 185.5,
    "interpretation": "optimal",
    "trend_direction": "improving",
    "test_date": "2026-03-20T00:00:00Z",
    "ai_insights": [
      "Your cholesterol levels have improved by 8% since last test",
      "Continue current diet and exercise routine",
      "Consider adding omega-3 supplements"
    ]
  }
}
```

#### `GET /biomarkers/my-results`
Get user's biomarker test history with trend analysis.

**Query Parameters:**
- `biomarker_id` (string): Filter by specific biomarker
- `category` (string): Filter by biomarker category
- `from_date` (string): Start date for results (ISO 8601)
- `to_date` (string): End date for results (ISO 8601)
- `limit` (number): Maximum results to return (default: 50)

**Response:**
```json
{
  "ok": true,
  "data": {
    "results": [
      {
        "id": "result_123",
        "biomarker": {
          "id": "bio_001",
          "name": "Total Cholesterol",
          "unit": "mg/dL"
        },
        "value": 185.5,
        "test_date": "2026-03-20T00:00:00Z",
        "interpretation": "optimal",
        "trend_vs_previous": {
          "direction": "improving",
          "change_percentage": -8.2,
          "change_absolute": -15.0
        }
      }
    ],
    "summary": {
      "total_results": 15,
      "categories_covered": ["lipid", "metabolic", "hormone"],
      "latest_test_date": "2026-03-20T00:00:00Z",
      "overall_health_score": 85.2
    }
  }
}
```

## Health Insights & Analysis API

### AI-Powered Health Insights

#### `GET /insights`
Get personalized health insights based on biomarker data and health patterns.

**Query Parameters:**
- `time_period` (string): Analysis period (3_months, 6_months, 1_year, all_time)
- `focus_area` (string): Specific health area (cardiovascular, metabolic, hormonal, inflammatory)

**Response:**
```json
{
  "ok": true,
  "data": {
    "overall_health_score": 85.2,
    "health_age_vs_chronological": {
      "chronological_age": 35,
      "biological_age": 32,
      "difference": -3,
      "interpretation": "Your biological age is 3 years younger than chronological age"
    },
    "key_insights": [
      {
        "category": "cardiovascular",
        "priority": "high",
        "title": "Excellent Cardiovascular Health",
        "description": "Your lipid panel shows optimal ratios and trending improvements",
        "supporting_data": ["Total Cholesterol: 185 mg/dL", "HDL: 65 mg/dL", "LDL: 105 mg/dL"],
        "recommendations": [
          "Continue current exercise routine",
          "Maintain Mediterranean-style diet"
        ]
      }
    ],
    "risk_factors": [
      {
        "factor": "vitamin_d_deficiency",
        "risk_level": "moderate",
        "current_value": 22.5,
        "optimal_range": "30-50 ng/mL",
        "intervention_suggestions": [
          "Increase sun exposure to 15-20 minutes daily",
          "Consider Vitamin D3 supplement (2000 IU)",
          "Include fatty fish in diet 2-3 times per week"
        ]
      }
    ],
    "trends": [
      {
        "biomarker": "HbA1c",
        "trend_direction": "stable",
        "trend_strength": "moderate",
        "interpretation": "Glucose control remains excellent"
      }
    ]
  }
}
```

#### `GET /insights/correlations`
Discover correlations between biomarkers, lifestyle factors, and health outcomes.

**Response:**
```json
{
  "ok": true,
  "data": {
    "strong_correlations": [
      {
        "factor_1": "sleep_quality",
        "factor_2": "cortisol_levels",
        "correlation_strength": 0.78,
        "correlation_type": "negative",
        "interpretation": "Better sleep quality strongly correlates with lower cortisol levels",
        "actionable_insight": "Prioritize 7-9 hours of quality sleep to optimize stress hormones"
      }
    ],
    "lifestyle_biomarker_connections": [
      {
        "lifestyle_factor": "strength_training_frequency",
        "affected_biomarkers": ["testosterone", "growth_hormone", "creatinine"],
        "impact_strength": "high",
        "optimal_frequency": "3-4 sessions per week"
      }
    ],
    "supplement_effectiveness": [
      {
        "supplement": "omega_3_fish_oil",
        "target_biomarkers": ["triglycerides", "inflammatory_markers"],
        "effectiveness_score": 0.85,
        "recommended_dosage": "2000mg EPA/DHA daily"
      }
    ]
  }
}
```

### Trend Analysis

#### `GET /trends`
Comprehensive trend analysis across all health metrics.

**Query Parameters:**
- `timeframe` (string): Analysis period (1_month, 3_months, 6_months, 1_year)
- `biomarker_ids` (string): Comma-separated biomarker IDs to analyze
- `include_predictions` (boolean): Include future trend predictions

**Response:**
```json
{
  "ok": true,
  "data": {
    "analysis_period": {
      "start_date": "2025-09-25T00:00:00Z",
      "end_date": "2026-03-25T00:00:00Z",
      "total_days": 182
    },
    "biomarker_trends": [
      {
        "biomarker_id": "bio_001",
        "biomarker_name": "Total Cholesterol",
        "trend_analysis": {
          "direction": "improving",
          "rate_of_change": -2.5,
          "rate_unit": "mg/dL per month",
          "statistical_significance": 0.92,
          "r_squared": 0.84
        },
        "key_milestones": [
          {
            "date": "2026-01-15T00:00:00Z",
            "event": "entered_optimal_range",
            "value": 180.0
          }
        ],
        "predictions": {
          "next_3_months": {
            "predicted_value": 175.0,
            "confidence_interval": [170.0, 180.0],
            "confidence_level": 0.85
          }
        }
      }
    ],
    "overall_health_trajectory": {
      "direction": "improving",
      "improvement_rate": 3.2,
      "key_drivers": ["improved_diet", "consistent_exercise", "better_sleep"]
    }
  }
}
```

## Medical Reports & Documentation

### Report Generation

#### `POST /reports/generate`
Generate comprehensive health reports for medical professionals.

**Body:**
```json
{
  "report_type": "comprehensive_panel",
  "time_period": "6_months",
  "include_sections": [
    "biomarker_summary",
    "trend_analysis", 
    "risk_assessment",
    "lifestyle_correlations",
    "recommendations"
  ],
  "format": "pdf",
  "recipient_type": "healthcare_provider"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "report_id": "report_456",
    "status": "generated",
    "download_url": "https://secure.lumeos.app/reports/report_456.pdf",
    "expires_at": "2026-04-25T00:00:00Z",
    "report_summary": {
      "total_pages": 12,
      "biomarkers_analyzed": 25,
      "time_period_covered": "6 months",
      "key_findings": [
        "Significant improvement in cardiovascular markers",
        "Vitamin D deficiency requiring attention",
        "Excellent metabolic health trajectory"
      ]
    }
  }
}
```

#### `GET /reports`
Get list of generated health reports.

**Query Parameters:**
- `report_type` (string): Filter by report type
- `status` (string): Filter by status (generated, expired, processing)
- `limit` (number): Maximum reports to return

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "report_456",
      "report_type": "comprehensive_panel",
      "generated_at": "2026-03-25T08:00:00Z",
      "status": "generated",
      "download_url": "https://secure.lumeos.app/reports/report_456.pdf",
      "expires_at": "2026-04-25T00:00:00Z"
    }
  ]
}
```

#### `GET /reports/:id`
Get specific report details and download information.

## Medication & Supplement Tracking

### Medication Management

#### `GET /medications`
Get user's current medications and supplements with interaction analysis.

**Response:**
```json
{
  "ok": true,
  "data": {
    "current_medications": [
      {
        "id": "med_123",
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice_daily",
        "start_date": "2026-01-01T00:00:00Z",
        "indication": "Type 2 Diabetes",
        "prescribing_doctor": "Dr. Smith",
        "pharmacy": "CVS Pharmacy",
        "biomarker_targets": ["glucose", "hba1c"],
        "monitoring_required": true
      }
    ],
    "supplements": [
      {
        "id": "supp_456", 
        "name": "Vitamin D3",
        "dosage": "2000 IU",
        "frequency": "daily",
        "target_biomarker": "vitamin_d",
        "effectiveness_tracking": {
          "baseline_value": 22.5,
          "current_value": 35.0,
          "target_value": 40.0,
          "progress_percentage": 71.4
        }
      }
    ],
    "interaction_alerts": [
      {
        "severity": "moderate",
        "type": "supplement_medication",
        "description": "High-dose Vitamin D may affect calcium absorption",
        "recommendation": "Monitor calcium levels quarterly"
      }
    ]
  }
}
```

#### `POST /medications/log`
Add or update medication/supplement information.

**Body:**
```json
{
  "type": "medication",
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "twice_daily",
  "start_date": "2026-01-01T00:00:00Z",
  "indication": "Type 2 Diabetes",
  "prescribing_doctor": "Dr. Smith",
  "target_biomarkers": ["glucose", "hba1c"]
}
```

### Drug Interaction Checking

#### `POST /medications/check-interactions`
Check for potential interactions between medications and supplements.

**Body:**
```json
{
  "medications": ["metformin", "lisinopril"],
  "supplements": ["vitamin_d", "magnesium", "omega_3"],
  "include_food_interactions": true
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "interactions": [
      {
        "severity": "minor",
        "type": "supplement_supplement",
        "substances": ["magnesium", "calcium"],
        "interaction": "Magnesium can reduce calcium absorption",
        "recommendation": "Take magnesium and calcium supplements 2 hours apart"
      }
    ],
    "monitoring_recommendations": [
      {
        "biomarker": "kidney_function",
        "frequency": "quarterly",
        "reason": "Metformin requires kidney function monitoring"
      }
    ],
    "food_interactions": [
      {
        "medication": "metformin",
        "food": "alcohol", 
        "interaction": "Increased risk of lactic acidosis",
        "recommendation": "Limit alcohol consumption"
      }
    ]
  }
}
```

## Symptom Tracking & Analysis

### Symptom Management

#### `GET /symptoms`
Get comprehensive symptom tracking and correlation analysis.

**Query Parameters:**
- `category` (string): Filter by symptom category (physical, mental, digestive, sleep)
- `severity_min` (number): Minimum severity level (1-10)
- `from_date` (string): Start date for symptom history
- `include_correlations` (boolean): Include biomarker correlations

**Response:**
```json
{
  "ok": true,
  "data": {
    "current_symptoms": [
      {
        "id": "symptom_123",
        "name": "Fatigue",
        "category": "physical",
        "severity": 6,
        "frequency": "daily",
        "duration": "ongoing_2_weeks",
        "triggers": ["poor_sleep", "high_stress"],
        "potential_biomarker_connections": [
          {
            "biomarker": "vitamin_b12",
            "correlation_strength": 0.78,
            "current_value": 250,
            "optimal_range": "400-900 pg/mL"
          }
        ]
      }
    ],
    "symptom_patterns": [
      {
        "pattern": "morning_fatigue",
        "frequency": "5 days per week",
        "likely_causes": ["cortisol_dysfunction", "blood_sugar_instability"],
        "suggested_investigations": [
          "Cortisol awakening response test",
          "Continuous glucose monitoring"
        ]
      }
    ],
    "improvement_recommendations": [
      {
        "symptom": "fatigue",
        "evidence_based_interventions": [
          "B-complex supplementation",
          "Iron status evaluation", 
          "Sleep hygiene optimization"
        ]
      }
    ]
  }
}
```

#### `POST /symptoms/log`
Log new symptom occurrence with detailed tracking.

**Body:**
```json
{
  "symptom_name": "Headache",
  "category": "physical",
  "severity": 7,
  "onset_time": "2026-03-25T14:30:00Z",
  "duration_minutes": 120,
  "triggers": ["dehydration", "screen_time"],
  "location": "temporal",
  "quality": "throbbing",
  "relief_methods": ["hydration", "rest"],
  "associated_symptoms": ["light_sensitivity"]
}
```

## Integration with AI Coach API

#### `GET /for-ai`
Provide medical data summary for AI coach integration and recommendations.

**Response:**
```json
{
  "ok": true,
  "data": {
    "health_summary": {
      "overall_score": 85.2,
      "risk_factors": ["vitamin_d_deficiency"],
      "key_strengths": ["excellent_cardiovascular_health", "stable_glucose"],
      "areas_needing_attention": ["sleep_quality", "stress_management"]
    },
    "coaching_relevant_data": {
      "energy_levels": {
        "current_trend": "improving",
        "primary_limiters": ["vitamin_deficiencies", "sleep_debt"]
      },
      "recovery_indicators": {
        "inflammatory_status": "low",
        "stress_hormones": "elevated",
        "sleep_metrics": "suboptimal"
      },
      "performance_biomarkers": {
        "muscle_building": ["testosterone", "growth_hormone", "protein_synthesis_markers"],
        "endurance": ["vo2_max_indicators", "lactate_threshold", "iron_status"],
        "recovery": ["creatine_kinase", "ldh", "cortisol"]
      }
    },
    "supplement_recommendations": [
      {
        "supplement": "vitamin_d3",
        "dosage": "2000 IU daily",
        "target_biomarker": "25_hydroxy_vitamin_d", 
        "expected_timeline": "3-4 months to optimal levels"
      }
    ]
  }
}
```

## Error Handling

### Standard Error Format
```json
{
  "ok": false,
  "error": "Biomarker not found",
  "code": "BIOMARKER_NOT_FOUND", 
  "details": {
    "biomarker_id": "bio_999",
    "available_categories": ["blood", "hormone", "lipid", "metabolic"]
  }
}
```

### Error Codes
- `BIOMARKER_NOT_FOUND`: Requested biomarker does not exist
- `INSUFFICIENT_DATA`: Not enough historical data for trend analysis
- `INVALID_VALUE_RANGE`: Biomarker value outside plausible range
- `MEDICATION_INTERACTION`: Dangerous drug interaction detected
- `REPORT_GENERATION_FAILED`: Unable to generate requested report
- `SYMPTOM_CATEGORY_INVALID`: Invalid symptom category specified

## Authentication & Security
All endpoints require JWT authentication:
```
Authorization: Bearer <jwt-token>
```

### Medical Data Security
- **HIPAA Compliance**: Full healthcare data protection
- **Encryption**: AES-256 encryption for all medical data
- **Access Logging**: Comprehensive audit trail for medical record access
- **Data Retention**: Configurable retention policies for different data types
- **Backup & Recovery**: Encrypted backups with disaster recovery procedures

## Rate Limiting
- **Biomarker queries**: 100 requests per minute
- **Data logging**: 50 requests per minute  
- **Report generation**: 5 requests per minute
- **Trend analysis**: 20 requests per minute

## Integration Points
- **Coach Module**: Provides health data for personalized coaching
- **Nutrition Module**: Correlates biomarkers with dietary patterns
- **Supplements Module**: Tracks supplement effectiveness on biomarkers
- **Training Module**: Analyzes performance biomarkers and recovery metrics
- **Goals Module**: Aligns health improvements with fitness objectives