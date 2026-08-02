# Medical Database Schema

## Core Biomarker Reference Tables

### biomarkers
Comprehensive reference catalog of all trackable biomarkers.

```sql
CREATE TABLE biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Biomarker identification
  name VARCHAR(200) NOT NULL,
  common_name VARCHAR(150),
  abbreviations TEXT[], -- Common abbreviations (e.g., ['CHOL', 'TC'])
  alternative_names TEXT[], -- Alternative names in different contexts
  
  -- Classification and organization
  category VARCHAR(50) NOT NULL, -- blood, hormone, lipid, metabolic, inflammatory
  subcategory VARCHAR(50), -- ldl_cholesterol, thyroid_hormone, liver_enzyme
  biomarker_group VARCHAR(100), -- lipid_panel, basic_metabolic_panel, thyroid_panel
  
  -- Measurement specifications
  unit VARCHAR(50) NOT NULL, -- mg/dL, nmol/L, IU/mL, etc.
  alternative_units JSONB, -- Unit conversions and alternatives
  precision_decimal_places INTEGER DEFAULT 1,
  
  -- Reference ranges (population-based)
  lab_range_min NUMERIC(12,3),
  lab_range_max NUMERIC(12,3),
  lab_range_notes TEXT, -- Context about lab ranges
  
  -- Optimal ranges (performance-based)
  optimal_range_min NUMERIC(12,3),
  optimal_range_max NUMERIC(12,3),
  optimal_range_notes TEXT, -- Evidence for optimal ranges
  
  -- Demographic variations
  gender_specific_ranges JSONB, -- Different ranges by gender
  age_specific_ranges JSONB, -- Age-adjusted reference ranges
  ethnicity_considerations TEXT, -- Population-specific notes
  
  -- Clinical information
  description TEXT, -- Detailed biomarker description
  clinical_significance TEXT, -- What this biomarker indicates
  interpretation_guidelines JSONB, -- How to interpret values
  
  -- Factors affecting biomarker
  affected_by_factors TEXT[], -- diet, exercise, stress, medications, supplements
  testing_requirements TEXT[], -- fasting, time_of_day, special_prep
  sample_type VARCHAR(50), -- serum, plasma, whole_blood, urine, saliva
  
  -- Relationships and correlations
  related_biomarkers UUID[], -- Related biomarker IDs
  inverse_correlations UUID[], -- Biomarkers that move opposite
  strong_correlations UUID[], -- Biomarkers that move together
  
  -- Medical relevance
  disease_associations TEXT[], -- Diseases linked to this biomarker
  medication_effects JSONB, -- How medications affect this biomarker
  supplement_effects JSONB, -- Supplement impacts
  
  -- Display and sorting
  sort_order INTEGER DEFAULT 0,
  display_priority INTEGER DEFAULT 0, -- For dashboard ordering
  
  -- Data quality and validation
  normal_variation_percentage NUMERIC(5,2), -- Expected day-to-day variation
  critical_low_value NUMERIC(12,3), -- Values requiring immediate attention
  critical_high_value NUMERIC(12,3),
  measurement_frequency_recommended VARCHAR(50), -- annually, quarterly, monthly
  
  -- Metadata
  evidence_level VARCHAR(10), -- A+, A, B, C based on research quality
  last_updated DATE,
  source_references TEXT[], -- Scientific literature references
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_ranges CHECK (
    (lab_range_min IS NULL OR lab_range_max IS NULL OR lab_range_min <= lab_range_max) AND
    (optimal_range_min IS NULL OR optimal_range_max IS NULL OR optimal_range_min <= optimal_range_max)
  ),
  CONSTRAINT valid_precision CHECK (precision_decimal_places >= 0 AND precision_decimal_places <= 6)
);
```

**Indexes:**
- `idx_biomarkers_category` on `category`
- `idx_biomarkers_group` on `biomarker_group`
- `idx_biomarkers_name_search` on `(name, common_name)` using GIN(to_tsvector('english', name || ' ' || COALESCE(common_name, '')))
- `idx_biomarkers_abbreviations` on `abbreviations` (GIN index)
- `idx_biomarkers_display_priority` on `display_priority DESC`

### biomarker_reference_ranges
Age, gender, and population-specific reference ranges.

```sql
CREATE TABLE biomarker_reference_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biomarker_id UUID NOT NULL REFERENCES biomarkers(id) ON DELETE CASCADE,
  
  -- Range specification
  range_type VARCHAR(30) NOT NULL, -- lab_standard, optimal, athlete, disease_specific
  range_name VARCHAR(100), -- "Adult Male 18-65", "Post-menopausal Female"
  
  -- Demographic criteria
  gender VARCHAR(20), -- male, female, all
  age_min INTEGER, -- Minimum age for this range
  age_max INTEGER, -- Maximum age for this range
  population VARCHAR(50), -- general, athlete, disease_specific, pregnant
  
  -- Range values
  min_value NUMERIC(12,3),
  max_value NUMERIC(12,3),
  unit VARCHAR(50),
  
  -- Context and notes
  interpretation_context TEXT,
  clinical_notes TEXT,
  evidence_level VARCHAR(10), -- Quality of evidence for this range
  
  -- Source information
  source_study TEXT,
  publication_date DATE,
  sample_size INTEGER, -- Size of study population
  
  -- Validation
  is_active BOOLEAN DEFAULT true,
  superseded_by UUID REFERENCES biomarker_reference_ranges(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_age_range CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max),
  CONSTRAINT valid_value_range CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
);
```

## User Health Data Tables

### user_biomarker_results
Individual biomarker test results for users.

```sql
CREATE TABLE user_biomarker_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  biomarker_id UUID NOT NULL REFERENCES biomarkers(id) ON DELETE RESTRICT,
  
  -- Test result information
  value NUMERIC(12,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  
  -- Test context
  test_date DATE NOT NULL,
  test_time TIME, -- Time of day if relevant
  sample_collection_time TIMESTAMPTZ, -- Exact collection timestamp
  
  -- Laboratory information
  lab_name VARCHAR(200),
  lab_location VARCHAR(200),
  lab_reference_id VARCHAR(100), -- Lab's internal reference number
  
  -- Reference ranges used by lab
  lab_range_min NUMERIC(12,3),
  lab_range_max NUMERIC(12,3),
  lab_range_unit VARCHAR(50),
  lab_interpretation VARCHAR(50), -- normal, high, low, critical
  
  -- Test conditions and quality
  fasting_status VARCHAR(20), -- fasting, non_fasting, unknown
  test_conditions TEXT, -- Special conditions during testing
  sample_quality VARCHAR(20), -- good, hemolyzed, lipemic, insufficient
  
  -- Clinical context
  ordering_physician VARCHAR(200),
  test_reason TEXT, -- Why this test was ordered
  clinical_context TEXT, -- Relevant symptoms or conditions
  
  -- Data entry and validation
  data_source VARCHAR(30) DEFAULT 'manual', -- manual, lab_integration, ocr_upload
  entry_confidence NUMERIC(3,2) DEFAULT 1.0, -- Confidence in data accuracy (0-1)
  needs_verification BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  
  -- Analysis flags
  outlier_flag BOOLEAN DEFAULT false, -- Statistical outlier
  critical_flag BOOLEAN DEFAULT false, -- Medically critical value
  trend_significance VARCHAR(20), -- significant_improvement, significant_decline, stable
  
  -- User notes and context
  user_notes TEXT,
  symptoms_at_time TEXT[],
  medications_at_time TEXT[],
  supplements_at_time TEXT[],
  
  -- File attachments
  lab_report_url TEXT, -- Link to original lab report
  attachment_urls TEXT[], -- Additional attachments
  
  -- Privacy and sharing
  share_with_providers BOOLEAN DEFAULT true,
  share_for_research BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_value CHECK (value >= 0),
  CONSTRAINT valid_confidence CHECK (entry_confidence >= 0 AND entry_confidence <= 1),
  CONSTRAINT valid_test_date CHECK (test_date <= CURRENT_DATE)
);
```

**Indexes:**
- `idx_user_biomarker_results_user_biomarker` on `(user_id, biomarker_id)`
- `idx_user_biomarker_results_test_date` on `test_date DESC`
- `idx_user_biomarker_results_user_date` on `(user_id, test_date DESC)`
- `idx_user_biomarker_results_critical` on `critical_flag` WHERE `critical_flag = true`
- `idx_user_biomarker_results_verification` on `needs_verification` WHERE `needs_verification = true`

### user_health_metrics
Calculated health scores and derived metrics.

```sql
CREATE TABLE user_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Calculation metadata
  calculation_date DATE NOT NULL,
  calculation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  calculation_algorithm_version VARCHAR(20),
  
  -- Overall health scores
  overall_health_score NUMERIC(5,2), -- 0-100 composite health score
  biological_age NUMERIC(4,1), -- Calculated biological age
  chronological_age INTEGER, -- Actual age at time of calculation
  
  -- Category-specific scores
  cardiovascular_score NUMERIC(5,2), -- 0-100
  metabolic_score NUMERIC(5,2), -- 0-100
  inflammatory_score NUMERIC(5,2), -- 0-100
  hormonal_score NUMERIC(5,2), -- 0-100
  nutritional_score NUMERIC(5,2), -- 0-100
  liver_function_score NUMERIC(5,2), -- 0-100
  kidney_function_score NUMERIC(5,2), -- 0-100
  thyroid_score NUMERIC(5,2), -- 0-100
  immune_function_score NUMERIC(5,2), -- 0-100
  
  -- Risk assessments
  cardiovascular_risk_score NUMERIC(5,2), -- Framingham or similar
  diabetes_risk_score NUMERIC(5,2), -- Diabetes risk assessment
  metabolic_syndrome_risk NUMERIC(5,2), -- MetSyn risk
  chronic_inflammation_risk NUMERIC(5,2), -- Inflammatory disease risk
  
  -- Trend indicators
  health_trajectory VARCHAR(20), -- improving, stable, declining
  trajectory_confidence NUMERIC(3,2), -- Statistical confidence 0-1
  key_improvement_areas TEXT[], -- Areas needing attention
  key_strength_areas TEXT[], -- Areas performing well
  
  -- Data quality indicators
  data_completeness_score NUMERIC(3,2), -- 0-1 how much data available
  data_freshness_days INTEGER, -- Days since most recent biomarker
  calculation_confidence NUMERIC(3,2), -- 0-1 confidence in scores
  
  -- Supporting data
  biomarkers_included UUID[], -- Which biomarkers contributed to scores
  missing_key_biomarkers UUID[], -- Important missing biomarkers
  calculation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, calculation_date),
  CONSTRAINT valid_scores CHECK (
    overall_health_score >= 0 AND overall_health_score <= 100 AND
    cardiovascular_score >= 0 AND cardiovascular_score <= 100 AND
    metabolic_score >= 0 AND metabolic_score <= 100
  )
);
```

**Indexes:**
- `idx_user_health_metrics_user_date` on `(user_id, calculation_date DESC)`
- `idx_user_health_metrics_overall_score` on `overall_health_score DESC`

## Medical History and Symptoms

### user_symptoms
Comprehensive symptom tracking with correlation analysis.

```sql
CREATE TABLE user_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Symptom identification
  symptom_name VARCHAR(200) NOT NULL,
  symptom_category VARCHAR(50), -- physical, mental, digestive, sleep, skin, respiratory
  symptom_subcategory VARCHAR(50), -- headache, joint_pain, anxiety, nausea
  
  -- Symptom characteristics
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  frequency VARCHAR(30), -- daily, weekly, occasionally, constant, intermittent
  duration_description TEXT, -- How long symptom has been present
  
  -- Timing information
  onset_datetime TIMESTAMPTZ NOT NULL,
  resolution_datetime TIMESTAMPTZ, -- When symptom resolved (if applicable)
  peak_intensity_time TIMESTAMPTZ, -- When symptom was worst
  
  -- Detailed description
  description TEXT, -- User's description of symptom
  location VARCHAR(200), -- Anatomical location
  quality VARCHAR(200), -- Sharp, dull, throbbing, burning, etc.
  radiation VARCHAR(200), -- Does pain/symptom radiate elsewhere
  
  -- Triggers and relievers
  potential_triggers TEXT[], -- What might have caused it
  relieving_factors TEXT[], -- What makes it better
  aggravating_factors TEXT[], -- What makes it worse
  
  -- Associated information
  associated_symptoms TEXT[], -- Other symptoms at same time
  preceding_events TEXT[], -- What happened before symptom
  current_medications TEXT[], -- Medications at time of symptom
  recent_supplements TEXT[], -- Supplements taken recently
  
  -- Functional impact
  impact_on_daily_life INTEGER CHECK (impact_on_daily_life >= 1 AND impact_on_daily_life <= 10),
  work_impact VARCHAR(50), -- none, mild, moderate, severe, unable_to_work
  sleep_impact VARCHAR(50), -- none, mild_disruption, frequent_waking, insomnia
  mood_impact VARCHAR(50), -- none, mild_irritability, moderate_anxiety, depression
  
  -- Treatment and response
  treatments_tried TEXT[], -- What user tried to treat symptom
  treatment_effectiveness JSONB, -- How effective each treatment was
  medical_attention_sought BOOLEAN DEFAULT false,
  healthcare_provider_seen VARCHAR(200),
  
  -- Pattern recognition
  pattern_type VARCHAR(30), -- first_time, recurring, chronic, cyclical
  related_to_menstrual_cycle BOOLEAN, -- For female users
  related_to_stress BOOLEAN,
  related_to_diet BOOLEAN,
  related_to_exercise BOOLEAN,
  weather_sensitivity BOOLEAN,
  
  -- Media documentation
  photo_urls TEXT[], -- Photos of visible symptoms
  audio_description_url TEXT, -- Voice recording of symptom description
  
  -- Correlation tracking
  biomarkers_around_time UUID[], -- Biomarkers tested near this time
  correlation_confidence JSONB, -- Confidence in biomarker correlations
  
  -- Resolution and outcome
  resolution_type VARCHAR(30), -- spontaneous, treated, chronic, unknown
  lessons_learned TEXT, -- User insights about symptom
  prevention_strategies TEXT[], -- What user will try to prevent recurrence
  
  -- Data quality and validation
  accuracy_confidence INTEGER CHECK (accuracy_confidence >= 1 AND accuracy_confidence <= 5),
  needs_medical_review BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_user_symptoms_user_onset` on `(user_id, onset_datetime DESC)`
- `idx_user_symptoms_category` on `symptom_category`
- `idx_user_symptoms_severity` on `severity DESC`
- `idx_user_symptoms_active` on `user_id` WHERE `resolution_datetime IS NULL`

### user_medications
Comprehensive medication and supplement tracking.

```sql
CREATE TABLE user_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Medication identification
  medication_name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200),
  brand_names TEXT[], -- Various brand names
  medication_type VARCHAR(50), -- prescription, otc, supplement, herb
  drug_class VARCHAR(100), -- Pharmaceutical classification
  
  -- Dosage and administration
  dosage VARCHAR(100), -- 500mg, 2 tablets, 1 tsp
  dosage_numeric NUMERIC(10,3), -- Numeric portion for calculations
  dosage_unit VARCHAR(50), -- mg, ml, tablets, IU
  strength VARCHAR(50), -- Concentration per unit
  
  -- Timing and frequency
  frequency VARCHAR(50), -- daily, twice_daily, as_needed, weekly
  frequency_numeric NUMERIC(4,2), -- Times per day for calculations
  time_of_day TIME[], -- Specific times taken
  with_food VARCHAR(20), -- with_food, without_food, no_preference
  
  -- Duration and dates
  start_date DATE NOT NULL,
  end_date DATE, -- NULL if currently taking
  prescribed_duration VARCHAR(50), -- 30_days, ongoing, as_needed
  
  -- Medical context
  indication TEXT, -- Why medication was prescribed/taken
  prescribing_doctor VARCHAR(200),
  prescribing_institution VARCHAR(200),
  prescription_number VARCHAR(100),
  
  -- Source and acquisition
  pharmacy_name VARCHAR(200),
  pharmacy_location VARCHAR(200),
  prescription_refills_remaining INTEGER,
  next_refill_date DATE,
  
  -- Effectiveness and monitoring
  target_biomarkers UUID[], -- Which biomarkers this should affect
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  effectiveness_notes TEXT,
  
  -- Adherence tracking
  adherence_percentage NUMERIC(5,2), -- 0-100% adherence
  missed_doses_per_week NUMERIC(3,1),
  common_reasons_for_missing TEXT[],
  
  -- Side effects and reactions
  side_effects TEXT[],
  adverse_reactions TEXT[],
  allergic_reactions TEXT[],
  side_effect_severity INTEGER CHECK (side_effect_severity >= 1 AND side_effect_severity <= 5),
  
  -- Interactions and warnings
  known_drug_interactions TEXT[],
  food_interactions TEXT[],
  supplement_interactions TEXT[],
  contraindications TEXT[],
  
  -- Cost and insurance
  cost_per_month NUMERIC(8,2),
  insurance_coverage_percentage NUMERIC(5,2),
  generic_available BOOLEAN,
  
  -- Status and changes
  status VARCHAR(20) DEFAULT 'active', -- active, discontinued, paused, completed
  discontinuation_reason TEXT,
  discontinuation_date DATE,
  
  -- Monitoring requirements
  requires_blood_monitoring BOOLEAN DEFAULT false,
  monitoring_frequency VARCHAR(50), -- weekly, monthly, quarterly
  last_monitoring_date DATE,
  next_monitoring_due DATE,
  
  -- User notes and experience
  user_notes TEXT,
  quality_of_life_impact TEXT,
  would_recommend BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_adherence CHECK (adherence_percentage >= 0 AND adherence_percentage <= 100),
  CONSTRAINT valid_dates CHECK (start_date <= COALESCE(end_date, CURRENT_DATE))
);
```

**Indexes:**
- `idx_user_medications_user_active` on `user_id` WHERE `status = 'active'`
- `idx_user_medications_type` on `medication_type`
- `idx_user_medications_monitoring` on `next_monitoring_due` WHERE `requires_blood_monitoring = true`
- `idx_user_medications_refill` on `next_refill_date` WHERE `next_refill_date IS NOT NULL`

## Medical Insights and Analysis

### user_medical_insights
AI-generated medical insights and recommendations.

```sql
CREATE TABLE user_medical_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Insight metadata
  insight_type VARCHAR(50) NOT NULL, -- biomarker_analysis, trend_detection, risk_assessment
  insight_category VARCHAR(50), -- cardiovascular, metabolic, hormonal, inflammatory
  insight_priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  
  -- Timing and relevance
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  relevant_from_date DATE,
  relevant_until_date DATE,
  is_current BOOLEAN DEFAULT true,
  
  -- Insight content
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  key_findings TEXT[],
  supporting_evidence TEXT[],
  
  -- Data foundation
  biomarkers_analyzed UUID[], -- Which biomarkers contributed
  data_time_range_start DATE,
  data_time_range_end DATE,
  data_quality_score NUMERIC(3,2), -- 0-1 confidence in underlying data
  
  -- Analysis details
  statistical_significance NUMERIC(4,3), -- P-value if applicable
  correlation_strength NUMERIC(4,3), -- Correlation coefficient
  trend_direction VARCHAR(20), -- improving, stable, declining
  trend_strength VARCHAR(20), -- weak, moderate, strong
  
  -- Risk assessment
  risk_level VARCHAR(20), -- low, moderate, high, critical
  risk_factors TEXT[],
  protective_factors TEXT[],
  time_horizon VARCHAR(30), -- immediate, short_term, long_term
  
  -- Recommendations
  recommended_actions TEXT[],
  lifestyle_modifications TEXT[],
  supplement_suggestions TEXT[],
  medical_follow_up_recommended BOOLEAN DEFAULT false,
  urgency_level VARCHAR(20), -- routine, prompt, urgent, emergency
  
  -- Intervention tracking
  interventions_suggested UUID[], -- Links to intervention recommendations
  interventions_implemented TEXT[],
  effectiveness_measurement TEXT[],
  
  -- AI model information
  ai_model_version VARCHAR(50),
  ai_confidence_score NUMERIC(3,2), -- 0-1 AI confidence
  human_review_status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, approved, rejected
  human_reviewer_id UUID REFERENCES users(id),
  
  -- User interaction
  user_acknowledged BOOLEAN DEFAULT false,
  user_dismissed BOOLEAN DEFAULT false,
  user_feedback TEXT,
  user_action_taken TEXT,
  
  -- Validation and updates
  validated_by_outcomes BOOLEAN DEFAULT false,
  superseded_by UUID REFERENCES user_medical_insights(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_confidence_scores CHECK (
    data_quality_score >= 0 AND data_quality_score <= 1 AND
    ai_confidence_score >= 0 AND ai_confidence_score <= 1
  )
);
```

**Indexes:**
- `idx_user_medical_insights_user_current` on `user_id` WHERE `is_current = true`
- `idx_user_medical_insights_priority` on `insight_priority`
- `idx_user_medical_insights_category` on `insight_category`
- `idx_user_medical_insights_review` on `human_review_status`

### user_health_reports
Generated health reports for users and healthcare providers.

```sql
CREATE TABLE user_health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Report identification
  report_type VARCHAR(50) NOT NULL, -- comprehensive, focused, progress, provider_summary
  report_name VARCHAR(200),
  report_purpose TEXT, -- Why this report was generated
  
  -- Report scope
  time_period_start DATE,
  time_period_end DATE,
  biomarker_categories TEXT[], -- Which categories included
  specific_biomarkers UUID[], -- Specific biomarkers included
  
  -- Report content structure
  sections_included TEXT[], -- summary, trends, recommendations, comparisons
  detail_level VARCHAR(20), -- summary, standard, detailed, comprehensive
  target_audience VARCHAR(30), -- patient, provider, specialist, family
  
  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generation_method VARCHAR(30), -- manual, scheduled, ai_generated, provider_requested
  template_used VARCHAR(50),
  ai_model_version VARCHAR(20),
  
  -- Report content
  executive_summary TEXT,
  key_findings TEXT[],
  recommendations TEXT[],
  risk_assessments JSONB, -- Structured risk data
  trend_analysis JSONB, -- Trend analysis data
  
  -- File and delivery
  report_file_url TEXT, -- Link to generated PDF
  report_format VARCHAR(20), -- pdf, html, json
  file_size_bytes BIGINT,
  
  -- Sharing and access
  sharing_permissions JSONB, -- Who can access this report
  shared_with_providers UUID[], -- Provider user IDs
  provider_access_code VARCHAR(50), -- Temporary access code
  access_expires_at TIMESTAMPTZ,
  
  -- Report quality and validation
  completeness_score NUMERIC(3,2), -- 0-1 how complete the report is
  data_freshness_score NUMERIC(3,2), -- 0-1 how recent the data is
  validation_status VARCHAR(20) DEFAULT 'generated', -- generated, reviewed, approved
  
  -- User interaction
  user_downloaded BOOLEAN DEFAULT false,
  downloaded_at TIMESTAMPTZ,
  user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
  user_feedback_comments TEXT,
  
  -- Provider interaction
  provider_viewed BOOLEAN DEFAULT false,
  provider_feedback TEXT,
  clinical_actions_taken TEXT[],
  
  -- Report lifecycle
  status VARCHAR(20) DEFAULT 'active', -- active, archived, expired, superseded
  superseded_by UUID REFERENCES user_health_reports(id),
  expiration_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_time_period CHECK (
    time_period_start IS NULL OR 
    time_period_end IS NULL OR 
    time_period_start <= time_period_end
  )
);
```

## Analytics and Aggregation Tables

### biomarker_population_statistics
Population-level biomarker statistics for comparison and benchmarking.

```sql
CREATE TABLE biomarker_population_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biomarker_id UUID NOT NULL REFERENCES biomarkers(id) ON DELETE CASCADE,
  
  -- Population segmentation
  age_group VARCHAR(20), -- 18-25, 26-35, 36-45, etc.
  gender VARCHAR(20), -- male, female, all
  population_type VARCHAR(30), -- general, athlete, medical_condition
  geographic_region VARCHAR(50), -- US, EU, global, etc.
  
  -- Sample information
  sample_size INTEGER NOT NULL,
  data_collection_period_start DATE,
  data_collection_period_end DATE,
  
  -- Statistical measures
  mean_value NUMERIC(12,3),
  median_value NUMERIC(12,3),
  std_deviation NUMERIC(12,3),
  percentile_5 NUMERIC(12,3),
  percentile_10 NUMERIC(12,3),
  percentile_25 NUMERIC(12,3),
  percentile_75 NUMERIC(12,3),
  percentile_90 NUMERIC(12,3),
  percentile_95 NUMERIC(12,3),
  
  -- Distribution characteristics
  distribution_type VARCHAR(30), -- normal, log_normal, bimodal, skewed
  skewness NUMERIC(6,3),
  kurtosis NUMERIC(6,3),
  
  -- Quality and validation
  data_quality_score NUMERIC(3,2), -- 0-1
  statistical_power NUMERIC(4,3), -- Statistical power of analysis
  confidence_interval_95_lower NUMERIC(12,3),
  confidence_interval_95_upper NUMERIC(12,3),
  
  -- Metadata
  study_source VARCHAR(200), -- Source of data
  analysis_methodology TEXT,
  exclusion_criteria TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_sample_size CHECK (sample_size > 0),
  CONSTRAINT valid_quality_score CHECK (data_quality_score >= 0 AND data_quality_score <= 1)
);
```

## Performance Optimization Views

### user_latest_biomarkers
Materialized view for quick access to users' most recent biomarker results.

```sql
CREATE MATERIALIZED VIEW user_latest_biomarkers AS
SELECT DISTINCT ON (user_id, biomarker_id)
  user_id,
  biomarker_id,
  value,
  unit,
  test_date,
  interpretation,
  critical_flag,
  trend_significance
FROM user_biomarker_results
WHERE needs_verification = false
ORDER BY user_id, biomarker_id, test_date DESC, created_at DESC;

-- Indexes on materialized view
CREATE UNIQUE INDEX idx_user_latest_biomarkers_user_bio 
ON user_latest_biomarkers(user_id, biomarker_id);

CREATE INDEX idx_user_latest_biomarkers_critical 
ON user_latest_biomarkers(critical_flag) 
WHERE critical_flag = true;
```

### user_health_dashboard_summary
Materialized view for dashboard performance.

```sql
CREATE MATERIALIZED VIEW user_health_dashboard_summary AS
SELECT 
  u.id as user_id,
  
  -- Latest health score
  hm.overall_health_score,
  hm.cardiovascular_score,
  hm.metabolic_score,
  hm.calculation_date as score_date,
  
  -- Recent biomarker counts
  COUNT(DISTINCT ubr.biomarker_id) as biomarkers_tracked,
  COUNT(DISTINCT CASE WHEN ubr.test_date > CURRENT_DATE - INTERVAL '90 days' THEN ubr.biomarker_id END) as recent_biomarkers,
  
  -- Critical alerts
  COUNT(CASE WHEN ulb.critical_flag THEN 1 END) as critical_biomarkers,
  
  -- Latest test date
  MAX(ubr.test_date) as latest_test_date,
  
  -- Active medications/supplements
  COUNT(DISTINCT um.id) FILTER (WHERE um.status = 'active') as active_medications,
  
  -- Recent symptoms
  COUNT(DISTINCT us.id) FILTER (WHERE us.onset_datetime > NOW() - INTERVAL '30 days') as recent_symptoms,
  
  -- Pending insights
  COUNT(DISTINCT umi.id) FILTER (WHERE umi.is_current = true AND umi.user_acknowledged = false) as pending_insights

FROM users u
LEFT JOIN user_health_metrics hm ON u.id = hm.user_id 
  AND hm.calculation_date = (
    SELECT MAX(calculation_date) 
    FROM user_health_metrics 
    WHERE user_id = u.id
  )
LEFT JOIN user_biomarker_results ubr ON u.id = ubr.user_id
LEFT JOIN user_latest_biomarkers ulb ON u.id = ulb.user_id
LEFT JOIN user_medications um ON u.id = um.user_id
LEFT JOIN user_symptoms us ON u.id = us.user_id
LEFT JOIN user_medical_insights umi ON u.id = umi.user_id
GROUP BY u.id, hm.overall_health_score, hm.cardiovascular_score, hm.metabolic_score, hm.calculation_date;

-- Unique index on user_id
CREATE UNIQUE INDEX idx_user_health_dashboard_summary_user 
ON user_health_dashboard_summary(user_id);
```

## Automated Maintenance and Analysis

### Health Score Calculation Function
```sql
CREATE OR REPLACE FUNCTION calculate_user_health_scores()
RETURNS TABLE(user_id UUID, scores JSONB) AS $$
BEGIN
  RETURN QUERY
  WITH latest_biomarkers AS (
    SELECT 
      ulb.user_id,
      b.category,
      COUNT(*) as biomarker_count,
      AVG(CASE 
        WHEN ulb.value BETWEEN b.optimal_range_min AND b.optimal_range_max THEN 100
        WHEN ulb.value BETWEEN b.lab_range_min AND b.lab_range_max THEN 75
        WHEN ulb.critical_flag = false THEN 50
        ELSE 25
      END) as category_score
    FROM user_latest_biomarkers ulb
    JOIN biomarkers b ON ulb.biomarker_id = b.id
    GROUP BY ulb.user_id, b.category
  ),
  user_scores AS (
    SELECT 
      lb.user_id,
      jsonb_object_agg(
        lb.category || '_score', 
        ROUND(lb.category_score, 2)
      ) as category_scores,
      ROUND(AVG(lb.category_score), 2) as overall_score
    FROM latest_biomarkers lb
    GROUP BY lb.user_id
  )
  SELECT 
    us.user_id,
    us.category_scores || jsonb_build_object('overall_health_score', us.overall_score)
  FROM user_scores us;
END;
$$ LANGUAGE plpgsql;
```

### Biomarker Trend Analysis Function
```sql
CREATE OR REPLACE FUNCTION analyze_biomarker_trends(
  p_user_id UUID,
  p_biomarker_id UUID,
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE(
  trend_direction TEXT,
  trend_strength NUMERIC,
  statistical_significance NUMERIC,
  projected_next_value NUMERIC
) AS $$
DECLARE
  biomarker_data RECORD;
  trend_analysis RECORD;
BEGIN
  -- Get biomarker data for trend analysis
  SELECT 
    ARRAY_AGG(value ORDER BY test_date) as values,
    ARRAY_AGG(EXTRACT(EPOCH FROM test_date)::BIGINT ORDER BY test_date) as dates,
    COUNT(*) as data_points
  INTO biomarker_data
  FROM user_biomarker_results
  WHERE user_id = p_user_id 
    AND biomarker_id = p_biomarker_id
    AND test_date > CURRENT_DATE - (p_months || ' months')::INTERVAL
    AND needs_verification = false;
  
  -- Perform linear regression analysis
  -- (Simplified version - in production would use more sophisticated statistical analysis)
  IF biomarker_data.data_points >= 3 THEN
    WITH regression AS (
      SELECT 
        CASE 
          WHEN slope > 0.1 THEN 'improving'
          WHEN slope < -0.1 THEN 'declining' 
          ELSE 'stable'
        END as direction,
        ABS(slope) as strength,
        r_squared as significance,
        intercept + slope * EXTRACT(EPOCH FROM CURRENT_DATE + INTERVAL '3 months') as projection
      FROM (
        SELECT 
          -- Linear regression calculations would go here
          -- This is a simplified placeholder
          (biomarker_data.values[array_upper(biomarker_data.values, 1)] - 
           biomarker_data.values[1]) / 
           NULLIF(biomarker_data.data_points - 1, 0) as slope,
          0.7 as r_squared, -- Placeholder
          biomarker_data.values[1] as intercept
      ) calc
    )
    SELECT 
      regression.direction,
      regression.strength,
      regression.significance,
      regression.projection
    INTO trend_direction, trend_strength, statistical_significance, projected_next_value
    FROM regression;
  ELSE
    trend_direction := 'insufficient_data';
    trend_strength := 0;
    statistical_significance := 0;
    projected_next_value := NULL;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
```

### Automated Alert System
```sql
-- Function to generate medical alerts
CREATE OR REPLACE FUNCTION generate_medical_alerts()
RETURNS TABLE(user_id UUID, alert_type TEXT, alert_message TEXT, priority TEXT) AS $$
BEGIN
  RETURN QUERY
  
  -- Critical biomarker values
  SELECT 
    ubr.user_id,
    'critical_biomarker'::TEXT,
    'Critical ' || b.name || ' value: ' || ubr.value || ' ' || ubr.unit,
    'critical'::TEXT
  FROM user_biomarker_results ubr
  JOIN biomarkers b ON ubr.biomarker_id = b.id
  WHERE ubr.critical_flag = true
    AND ubr.test_date > CURRENT_DATE - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM medical_alerts ma 
      WHERE ma.user_id = ubr.user_id 
        AND ma.alert_type = 'critical_biomarker'
        AND ma.biomarker_result_id = ubr.id
    )
  
  UNION ALL
  
  -- Overdue monitoring
  SELECT 
    um.user_id,
    'monitoring_overdue'::TEXT,
    'Overdue monitoring for ' || um.medication_name || ' (due: ' || um.next_monitoring_due || ')',
    'high'::TEXT
  FROM user_medications um
  WHERE um.requires_blood_monitoring = true
    AND um.next_monitoring_due < CURRENT_DATE
    AND um.status = 'active'
  
  UNION ALL
  
  -- Concerning trends
  SELECT DISTINCT
    ubr.user_id,
    'concerning_trend'::TEXT,
    'Concerning trend detected in ' || b.name,
    'medium'::TEXT
  FROM user_biomarker_results ubr
  JOIN biomarkers b ON ubr.biomarker_id = b.id
  WHERE ubr.trend_significance IN ('significant_decline', 'significant_worsening')
    AND ubr.test_date > CURRENT_DATE - INTERVAL '30 days';
    
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security

```sql
-- Users can only access their own medical data
ALTER TABLE user_biomarker_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_biomarker_results_policy ON user_biomarker_results
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE user_symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_symptoms_policy ON user_symptoms
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE user_medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_medications_policy ON user_medications
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE user_medical_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_medical_insights_policy ON user_medical_insights
FOR ALL TO authenticated
USING (user_id = auth.uid());

-- Healthcare providers can access data for their patients (with permission)
CREATE POLICY provider_access_policy ON user_biomarker_results
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM healthcare_provider_access hpa
    WHERE hpa.provider_id = auth.uid()
      AND hpa.patient_id = user_biomarker_results.user_id
      AND hpa.access_type = 'medical_data'
      AND hpa.active = true
      AND hpa.expires_at > NOW()
  )
);
```

## Performance Monitoring

```sql
-- Monitor query performance
CREATE OR REPLACE FUNCTION medical_db_performance_report()
RETURNS TABLE(
  table_name TEXT,
  total_rows BIGINT,
  avg_query_time NUMERIC,
  slow_queries_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    n_tup_ins + n_tup_upd + n_tup_del as total_rows,
    0::NUMERIC as avg_query_time, -- Would integrate with pg_stat_statements
    0::BIGINT as slow_queries_count
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND tablename LIKE 'user_%'
  ORDER BY total_rows DESC;
END;
$$ LANGUAGE plpgsql;
```