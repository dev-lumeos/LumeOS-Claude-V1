# Supplements Module Database Schema

> Complete database schema and relationships for the supplements module

## 📊 Schema Overview

The supplements module uses 6 core tables with carefully designed relationships to support both regular supplements and enhanced substances while maintaining data integrity and performance.

### Entity Relationship Diagram
```
supplements ────┐
                │
user_stacks ────┼─── stack_items ────┬─── intake_logs
                │                    │
enhanced_substances ─────────────────┘
                │
supplement_interactions
```

## 🧪 Core Tables

### supplements
Master table containing all regular supplements with evidence-based information.

```sql
CREATE TABLE supplements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    name_de VARCHAR,           -- German translation
    name_en VARCHAR,           -- English name (if different)
    slug VARCHAR UNIQUE,       -- URL-friendly identifier
    category VARCHAR NOT NULL, -- Vitamin, Mineral, Performance, etc.
    subcategory VARCHAR,       -- More specific grouping
    description TEXT,          -- Detailed description
    form VARCHAR,              -- Capsule, Powder, Liquid, etc.
    
    -- Evidence & Safety
    evidence_grade VARCHAR DEFAULT 'C', -- A+, A, B, C, F
    evidence_data JSONB,              -- Research citations and studies
    side_effects TEXT[],              -- Known side effects
    contraindications TEXT[],         -- Medical contraindications
    allergy_flags TEXT[],            -- Common allergens
    
    -- Dosing & Timing
    typical_dose VARCHAR,            -- e.g. "500-1000mg"
    dose_unit VARCHAR DEFAULT 'mg',  -- mg, g, mcg, IU
    serving_size VARCHAR,            -- Standard serving
    serving_unit VARCHAR,            -- Unit for serving
    best_timing VARCHAR,             -- morning, evening, with_food, etc.
    timing_default VARCHAR DEFAULT 'morning',
    timing_notes TEXT,               -- Specific timing instructions
    
    -- Absorption & Interactions
    absorption_notes TEXT,           -- Food interactions, bioavailability
    requires_food BOOLEAN DEFAULT false,
    requires_empty_stomach BOOLEAN DEFAULT false,
    interactions TEXT[],             -- Simple interaction list
    
    -- Nutritional Content
    nutrients_provided JSONB,       -- {"vitamin_d": {"amount": 1000, "unit": "IU"}}
    ingredients JSONB,               -- Complete ingredient breakdown
    
    -- Cycling & Protocols
    requires_cycling BOOLEAN DEFAULT false,
    cycling_protocol JSONB,         -- Structured cycling information
    half_life_hours INTEGER,        -- For timing calculations
    
    -- Quality & Sourcing
    brand VARCHAR,                  -- Preferred/recommended brand
    cost_per_serving DECIMAL(8,3),  -- Cost tracking
    priority VARCHAR CHECK (priority IN ('essential', 'top_needed', 'nice_to_have')),
    
    -- Meta
    benefits TEXT[],                -- Key benefits
    is_enhanced BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_supplements_category ON supplements(category);
CREATE INDEX idx_supplements_evidence_grade ON supplements(evidence_grade);
CREATE INDEX idx_supplements_name_search ON supplements USING gin(to_tsvector('english', name));
CREATE INDEX idx_supplements_nutrients ON supplements USING gin(nutrients_provided);
```

### enhanced_substances  
Specialized table for performance enhancement substances (AAS, SARMs, etc.).

```sql
CREATE TABLE enhanced_substances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    aliases TEXT[],                 -- Alternative names/slang
    category VARCHAR NOT NULL,      -- AAS, SARM, Peptide, GH, AI, SERM
    description TEXT,
    
    -- Chemical Properties
    chemical_name VARCHAR,          -- Scientific name
    molecular_weight INTEGER,      -- For dosing calculations
    half_life_hours INTEGER,       -- Elimination half-life
    
    -- Dosing Information
    route VARCHAR NOT NULL,        -- oral, injection, topical
    typical_dose_min INTEGER,      -- Conservative minimum dose
    typical_dose_max INTEGER,      -- Maximum recommended dose
    dose_unit VARCHAR DEFAULT 'mg', -- mg, mcg, IU
    frequency VARCHAR,             -- daily, weekly, monthly
    
    -- Safety & Legal
    hepatotoxicity_level VARCHAR CHECK (hepatotoxicity_level IN 
        ('none', 'low', 'moderate', 'high', 'severe')),
    cardiovascular_risk VARCHAR CHECK (cardiovascular_risk IN 
        ('none', 'low', 'moderate', 'high', 'severe')),
    androgenic_rating INTEGER,     -- 0-500+ scale
    anabolic_rating INTEGER,       -- 0-500+ scale
    
    -- Protocols & Requirements
    requires_pct BOOLEAN DEFAULT false,        -- Post Cycle Therapy
    requires_ai BOOLEAN DEFAULT false,         -- Aromatase Inhibitor
    requires_serm BOOLEAN DEFAULT false,       -- SERM protocol
    aromatization VARCHAR,                     -- none, low, moderate, high
    
    -- Warnings & Contraindications
    warnings TEXT[],               -- Specific warnings
    contraindications TEXT[],      -- Medical contraindications
    drug_interactions TEXT[],      -- Known drug interactions
    side_effects JSONB,           -- Categorized side effects
    
    -- Legal & Regulatory
    legal_status JSONB,           -- By jurisdiction
    detection_time_days INTEGER, -- For tested athletes
    
    -- Meta
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_enhanced_category ON enhanced_substances(category);
CREATE INDEX idx_enhanced_name_search ON enhanced_substances USING gin(to_tsvector('english', name));
CREATE INDEX idx_enhanced_aliases ON enhanced_substances USING gin(aliases);
CREATE INDEX idx_enhanced_route ON enhanced_substances(route);
```

### user_stacks
User-created supplement combinations organized by goals.

```sql
CREATE TABLE user_stacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    goal VARCHAR DEFAULT 'custom', -- health, performance, cutting, bulking, etc.
    
    -- Status & Lifecycle
    is_active BOOLEAN DEFAULT false,    -- Only one active stack per user
    is_template BOOLEAN DEFAULT false,  -- Can be copied by other users
    is_public BOOLEAN DEFAULT false,    -- Visible to community
    
    -- Analytics
    total_monthly_cost DECIMAL(8,2),   -- Calculated cost
    item_count INTEGER DEFAULT 0,      -- Number of items in stack
    
    -- Meta
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_active_stack_per_user 
        EXCLUDE (user_id WITH =) WHERE (is_active = true)
);

-- Indexes
CREATE INDEX idx_user_stacks_user_id ON user_stacks(user_id);
CREATE INDEX idx_user_stacks_active ON user_stacks(user_id, is_active);
CREATE INDEX idx_user_stacks_goal ON user_stacks(goal);
```

### stack_items
Individual supplements within a user's stack with custom dosing.

```sql
CREATE TABLE stack_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stack_id UUID NOT NULL REFERENCES user_stacks(id) ON DELETE CASCADE,
    
    -- Supplement Reference (one of these will be set)
    supplement_id UUID REFERENCES supplements(id) ON DELETE SET NULL,
    enhanced_substance_id UUID REFERENCES enhanced_substances(id) ON DELETE SET NULL,
    
    -- Customization
    custom_name VARCHAR,           -- Override supplement name
    notes TEXT,                   -- User notes
    
    -- Dosing Protocol
    dose DECIMAL(10,3) NOT NULL,  -- Custom dose amount
    dose_unit VARCHAR DEFAULT 'mg', -- Custom unit
    frequency VARCHAR DEFAULT 'daily', -- daily, 2x_daily, weekly, etc.
    timing VARCHAR,               -- morning, evening, pre_workout, etc.
    
    -- Cycling Support
    cycling JSONB,                -- {"on_days": 14, "off_days": 7, "start_date": "2024-01-01"}
    
    -- Organization
    sort_order INTEGER DEFAULT 0, -- Display order within stack
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    added_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT stack_items_supplement_xor CHECK (
        (supplement_id IS NOT NULL AND enhanced_substance_id IS NULL) OR
        (supplement_id IS NULL AND enhanced_substance_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_stack_items_stack_id ON stack_items(stack_id);
CREATE INDEX idx_stack_items_supplement_id ON stack_items(supplement_id);
CREATE INDEX idx_stack_items_enhanced_id ON stack_items(enhanced_substance_id);
CREATE INDEX idx_stack_items_sort ON stack_items(stack_id, sort_order);
```

### intake_logs
Daily tracking of supplement consumption with compliance metrics.

```sql
CREATE TABLE intake_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stack_item_id UUID NOT NULL REFERENCES stack_items(id) ON DELETE CASCADE,
    
    -- Temporal
    date DATE NOT NULL,           -- Which day this log is for
    taken_at TIMESTAMP,          -- Actual time taken (if taken)
    
    -- Status Tracking
    status VARCHAR NOT NULL CHECK (status IN ('pending', 'taken', 'skipped', 'snoozed')),
    notes TEXT,                  -- User notes about this intake
    
    -- Dosing (can override stack item)
    actual_dose DECIMAL(10,3),   -- If different from planned dose
    actual_dose_unit VARCHAR,    -- If different from planned unit
    
    -- Meta
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, stack_item_id, date) -- One log per item per day per user
);

-- Indexes for analytics
CREATE INDEX idx_intake_logs_user_date ON intake_logs(user_id, date);
CREATE INDEX idx_intake_logs_status ON intake_logs(status);
CREATE INDEX idx_intake_logs_stack_item ON intake_logs(stack_item_id);
CREATE INDEX idx_intake_logs_compliance ON intake_logs(user_id, date, status);
```

### supplement_interactions
Evidence-based interaction warnings between supplements.

```sql
CREATE TABLE supplement_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Interaction Participants (flexible matching)
    supplement1_id UUID REFERENCES supplements(id),
    supplement1_name VARCHAR,         -- For name-based matching
    supplement2_id UUID REFERENCES supplements(id), 
    supplement2_name VARCHAR,
    
    -- Enhanced substance support
    enhanced1_id UUID REFERENCES enhanced_substances(id),
    enhanced2_id UUID REFERENCES enhanced_substances(id),
    
    -- Interaction Details
    interaction_type VARCHAR NOT NULL CHECK (interaction_type IN 
        ('synergy', 'absorption', 'conflict', 'timing', 'contraindication')),
    severity VARCHAR NOT NULL CHECK (severity IN 
        ('info', 'caution', 'warning', 'critical')),
    
    -- Descriptions
    description_en TEXT,
    description_de TEXT,
    recommendation_en TEXT,          -- What to do about it
    recommendation_de TEXT,
    timing_recommendation VARCHAR,   -- separate_2h, take_together, etc.
    
    -- Evidence
    evidence_level VARCHAR DEFAULT 'moderate' CHECK (evidence_level IN 
        ('low', 'moderate', 'high')),
    evidence_sources TEXT[],         -- Research citations
    
    -- Meta
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT interaction_participants CHECK (
        (supplement1_id IS NOT NULL OR supplement1_name IS NOT NULL) AND
        (supplement2_id IS NOT NULL OR supplement2_name IS NOT NULL)
    )
);

-- Indexes for fast interaction lookups
CREATE INDEX idx_interactions_supp1_id ON supplement_interactions(supplement1_id);
CREATE INDEX idx_interactions_supp2_id ON supplement_interactions(supplement2_id);
CREATE INDEX idx_interactions_supp1_name ON supplement_interactions(supplement1_name);
CREATE INDEX idx_interactions_supp2_name ON supplement_interactions(supplement2_name);
CREATE INDEX idx_interactions_enhanced ON supplement_interactions(enhanced1_id, enhanced2_id);
CREATE INDEX idx_interactions_severity ON supplement_interactions(severity);
```

## 🔗 Supporting Tables

### inventory_tracking
Stock management for supplements.

```sql
CREATE TABLE inventory_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplement_id UUID REFERENCES supplements(id) ON DELETE SET NULL,
    enhanced_substance_id UUID REFERENCES enhanced_substances(id) ON DELETE SET NULL,
    
    -- Stock Information
    current_stock DECIMAL(10,2), -- Amount remaining
    unit VARCHAR,                -- capsules, ml, g, etc.
    purchase_date DATE,
    expiry_date DATE,
    
    -- Alerts
    low_stock_threshold DECIMAL(10,2) DEFAULT 10,
    auto_reorder BOOLEAN DEFAULT false,
    
    -- Purchase Info
    supplier VARCHAR,
    cost_per_unit DECIMAL(8,3),
    total_cost DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### cycling_history
Track cycling periods for enhanced substances.

```sql
CREATE TABLE cycling_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stack_item_id UUID NOT NULL REFERENCES stack_items(id) ON DELETE CASCADE,
    
    -- Cycle Information
    cycle_number INTEGER,        -- 1, 2, 3, etc.
    start_date DATE NOT NULL,
    end_date DATE,               -- NULL if ongoing
    planned_duration_days INTEGER,
    actual_duration_days INTEGER,
    
    -- Protocol Details
    starting_dose DECIMAL(10,3),
    max_dose DECIMAL(10,3),
    ending_dose DECIMAL(10,3),
    dose_unit VARCHAR,
    
    -- PCT Information
    pct_started DATE,
    pct_completed DATE,
    pct_protocol JSONB,         -- PCT details
    
    -- Notes & Outcomes
    notes TEXT,
    side_effects TEXT[],
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 10),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 📈 Analytics Views

### user_compliance_summary
Materialized view for compliance analytics.

```sql
CREATE MATERIALIZED VIEW user_compliance_summary AS
SELECT 
    user_id,
    DATE_TRUNC('week', date) as week_start,
    COUNT(*) as total_scheduled,
    COUNT(*) FILTER (WHERE status = 'taken') as taken,
    COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'taken') * 100.0 / COUNT(*), 
        2
    ) as compliance_percentage
FROM intake_logs
WHERE date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY user_id, DATE_TRUNC('week', date);

-- Refresh weekly
CREATE UNIQUE INDEX idx_compliance_summary_user_week 
ON user_compliance_summary(user_id, week_start);
```

### supplement_popularity
Track most popular supplements and stacks.

```sql
CREATE MATERIALIZED VIEW supplement_popularity AS
SELECT 
    s.id,
    s.name,
    s.category,
    COUNT(DISTINCT si.stack_id) as stack_count,
    COUNT(DISTINCT us.user_id) as user_count,
    AVG(si.dose::numeric) as avg_dose,
    mode() WITHIN GROUP (ORDER BY si.frequency) as common_frequency,
    COUNT(il.id) FILTER (WHERE il.status = 'taken') as total_taken,
    COUNT(il.id) FILTER (WHERE il.status = 'skipped') as total_skipped
FROM supplements s
JOIN stack_items si ON si.supplement_id = s.id
JOIN user_stacks us ON us.id = si.stack_id
LEFT JOIN intake_logs il ON il.stack_item_id = si.id
GROUP BY s.id, s.name, s.category;
```

## 🚀 Database Optimization

### Partitioning Strategy
```sql
-- Partition intake_logs by date for better performance
CREATE TABLE intake_logs_2024 PARTITION OF intake_logs
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE intake_logs_2025 PARTITION OF intake_logs  
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Query Optimization
```sql
-- Frequently used queries with optimized indexes

-- Active stack with items (most common query)
EXPLAIN ANALYZE
SELECT s.*, si.*, supp.name as supplement_name
FROM user_stacks s
JOIN stack_items si ON si.stack_id = s.id
LEFT JOIN supplements supp ON supp.id = si.supplement_id  
WHERE s.user_id = $1 AND s.is_active = true
ORDER BY si.sort_order;

-- Daily intake with supplement details
EXPLAIN ANALYZE  
SELECT si.*, supp.name, il.status, il.taken_at
FROM user_stacks us
JOIN stack_items si ON si.stack_id = us.id
LEFT JOIN supplements supp ON supp.id = si.supplement_id
LEFT JOIN intake_logs il ON il.stack_item_id = si.id AND il.date = $2
WHERE us.user_id = $1 AND us.is_active = true
ORDER BY si.sort_order;
```

## 🔒 Security & Constraints

### Row Level Security
```sql
-- Users can only see their own data
ALTER TABLE user_stacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_stacks_isolation ON user_stacks
    FOR ALL TO authenticated
    USING (user_id = current_user_id());

ALTER TABLE stack_items ENABLE ROW LEVEL SECURITY;  
CREATE POLICY stack_items_isolation ON stack_items
    FOR ALL TO authenticated
    USING (stack_id IN (
        SELECT id FROM user_stacks WHERE user_id = current_user_id()
    ));

ALTER TABLE intake_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY intake_logs_isolation ON intake_logs
    FOR ALL TO authenticated  
    USING (user_id = current_user_id());
```

### Data Validation
```sql
-- Triggers for data consistency
CREATE OR REPLACE FUNCTION update_stack_item_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_stacks 
    SET item_count = (
        SELECT COUNT(*) FROM stack_items 
        WHERE stack_id = COALESCE(NEW.stack_id, OLD.stack_id)
    )
    WHERE id = COALESCE(NEW.stack_id, OLD.stack_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stack_item_count_trigger
    AFTER INSERT OR DELETE ON stack_items
    FOR EACH ROW EXECUTE FUNCTION update_stack_item_count();
```

## 📊 Sample Data Patterns

### Common Queries
```sql
-- Get user's active stack with compliance
WITH active_stack AS (
    SELECT s.*, si.*, supp.name as supplement_name
    FROM user_stacks s
    JOIN stack_items si ON si.stack_id = s.id
    LEFT JOIN supplements supp ON supp.id = si.supplement_id
    WHERE s.user_id = $1 AND s.is_active = true
),
recent_compliance AS (
    SELECT 
        si.id as stack_item_id,
        COUNT(*) FILTER (WHERE il.status = 'taken') as taken_count,
        COUNT(*) as total_count
    FROM stack_items si
    LEFT JOIN intake_logs il ON il.stack_item_id = si.id 
        AND il.date >= CURRENT_DATE - INTERVAL '7 days'
    WHERE si.stack_id = (SELECT id FROM user_stacks WHERE user_id = $1 AND is_active = true)
    GROUP BY si.id
)
SELECT 
    ast.*,
    COALESCE(rc.taken_count, 0) as taken_last_7_days,
    COALESCE(rc.total_count, 0) as scheduled_last_7_days,
    CASE WHEN rc.total_count > 0 
         THEN ROUND(rc.taken_count * 100.0 / rc.total_count, 1)
         ELSE 0 
    END as compliance_percentage
FROM active_stack ast
LEFT JOIN recent_compliance rc ON rc.stack_item_id = ast.id
ORDER BY ast.sort_order;
```

This schema provides a robust foundation for the supplements module with excellent performance, data integrity, and scalability.