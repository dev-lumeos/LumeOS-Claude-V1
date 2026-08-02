# Supplements Module Migration Guide

> Consolidation of legacy documentation and migration path for existing implementations

## 📜 Legacy Documentation Summary

This document consolidates information from the old `docs/supplement-module/` directory and provides migration guidance for existing implementations.

### Original Documentation Structure
The previous documentation was scattered across multiple files:
- Basic supplement tracking concepts
- Early API design notes  
- Database schema drafts
- Component wireframes

**Key improvements in this documentation:**
- **Unified Structure:** All information consolidated into focused documents
- **Complete API Reference:** Every endpoint documented with examples
- **Production-Ready Schema:** Optimized database design with indexes and constraints
- **React Implementation:** Modern component patterns with React Query
- **Enhanced Substances:** Full support for performance enhancement protocols

## 🔄 Migration Path

### From Legacy Schema
If migrating from an older supplements implementation:

#### 1. Schema Updates
```sql
-- Add new columns to existing tables
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS evidence_grade VARCHAR DEFAULT 'C';
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS evidence_data JSONB;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS side_effects TEXT[];
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS contraindications TEXT[];
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS nutrients_provided JSONB;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS hepatotoxicity_level VARCHAR;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS cardiovascular_risk VARCHAR;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS priority VARCHAR;

-- Create enhanced substances table
CREATE TABLE IF NOT EXISTS enhanced_substances (
    -- See DATABASE.md for complete schema
);

-- Create interaction table
CREATE TABLE IF NOT EXISTS supplement_interactions (
    -- See DATABASE.md for complete schema
);

-- Update stack_items to support enhanced substances
ALTER TABLE stack_items ADD COLUMN IF NOT EXISTS enhanced_substance_id UUID;
ALTER TABLE stack_items ADD CONSTRAINT fk_enhanced_substance 
    FOREIGN KEY (enhanced_substance_id) REFERENCES enhanced_substances(id);

-- Add constraint for exclusive reference
ALTER TABLE stack_items ADD CONSTRAINT stack_items_supplement_xor CHECK (
    (supplement_id IS NOT NULL AND enhanced_substance_id IS NULL) OR
    (supplement_id IS NULL AND enhanced_substance_id IS NOT NULL)
);
```

#### 2. Data Migration Script
```typescript
// migrate-supplements.ts
import sql from './db';

async function migrateSupplements() {
    // Migrate existing supplement data
    const supplements = await sql`SELECT * FROM supplements WHERE evidence_grade IS NULL`;
    
    for (const supplement of supplements) {
        // Set default evidence grades based on category
        let evidenceGrade = 'C'; // default
        
        if (['Vitamin D', 'Omega-3', 'Creatine'].includes(supplement.name)) {
            evidenceGrade = 'A+';
        } else if (supplement.category === 'Vitamin') {
            evidenceGrade = 'A';
        }
        
        await sql`
            UPDATE supplements 
            SET evidence_grade = ${evidenceGrade},
                priority = 'nice_to_have',
                hepatotoxicity_level = 'none',
                cardiovascular_risk = 'none'
            WHERE id = ${supplement.id}
        `;
    }
    
    // Migrate stack items to new format
    await sql`
        UPDATE stack_items 
        SET cycling = NULL 
        WHERE cycling IS NOT NULL AND cycling = 'null'::jsonb
    `;
    
    console.log('Migration completed successfully');
}
```

#### 3. API Endpoint Updates
```typescript
// Update existing endpoints to match new API specification

// Old: GET /supplements/search
// New: GET /api/supplements/search

// Old response format:
// { supplements: [...] }
// New response format: 
// { ok: true, data: [...] }

// Migration helper
function adaptLegacyResponse(oldResponse: any) {
    return {
        ok: true,
        data: oldResponse.supplements || oldResponse.data || oldResponse
    };
}
```

### From Component Library v1
If updating from older React components:

#### 1. Update Import Paths
```tsx
// Old
import { SupplementCard } from '../components/supplements/SupplementCard';

// New  
import { SupplementCard } from '@lumeos/ui/supplements';
```

#### 2. Props Migration
```tsx
// Old props format
interface OldSupplementCardProps {
    supplement: {
        name: string;
        dose: string;
        timing: string;
    };
    onTake: (id: string) => void;
}

// New props format (see COMPONENTS.md)
interface NewSupplementCardProps {
    supplement: Supplement;
    onAdd?: (supplement: Supplement) => void;
    onView?: (supplement: Supplement) => void;
    showActions?: boolean;
}

// Migration wrapper
function LegacySupplementCard(props: OldSupplementCardProps) {
    return (
        <SupplementCard
            supplement={props.supplement}
            onAdd={() => props.onTake(props.supplement.id)}
            showActions={true}
        />
    );
}
```

#### 3. State Management Migration
```tsx
// Old: Direct state management
const [supplements, setSupplements] = useState([]);

// New: React Query
const { data: supplements } = useQuery({
    queryKey: ['supplements'],
    queryFn: getSupplements
});
```

## 📋 Migration Checklist

### Backend Migration
- [ ] **Database Schema**
  - [ ] Add new columns to existing tables
  - [ ] Create enhanced_substances table
  - [ ] Create supplement_interactions table  
  - [ ] Add proper indexes and constraints
  - [ ] Implement Row Level Security policies

- [ ] **API Updates**
  - [ ] Update response format to include `{ ok: true, data: ... }`
  - [ ] Implement unified search across supplements and enhanced substances
  - [ ] Add intelligence endpoints (gap-analysis, interactions, etc.)
  - [ ] Update authentication middleware
  - [ ] Add proper error handling

- [ ] **Data Migration**
  - [ ] Run migration scripts for existing data
  - [ ] Populate evidence_grade for all supplements
  - [ ] Set default values for new columns
  - [ ] Validate data integrity after migration

### Frontend Migration
- [ ] **Component Updates**
  - [ ] Replace old components with new component library
  - [ ] Update prop interfaces to match new schema
  - [ ] Implement new features (interaction warnings, cycling, etc.)
  - [ ] Add mobile-optimized layouts

- [ ] **State Management**
  - [ ] Replace local state with React Query
  - [ ] Implement optimistic updates for better UX
  - [ ] Add offline support with React Query persistence
  - [ ] Implement proper error boundaries

- [ ] **Feature Parity**
  - [ ] Migrate existing supplement tracking
  - [ ] Add new stack management features  
  - [ ] Implement daily intake logging
  - [ ] Add intelligence and analysis features

### Quality Assurance
- [ ] **Testing**
  - [ ] Unit tests for all new API endpoints
  - [ ] Integration tests for database operations
  - [ ] Component testing for React components
  - [ ] End-to-end testing for critical user flows

- [ ] **Performance**
  - [ ] Database query optimization
  - [ ] API response time benchmarking
  - [ ] Frontend bundle size analysis
  - [ ] Mobile performance testing

- [ ] **Security**
  - [ ] Penetration testing for enhanced substances features
  - [ ] Data privacy compliance review
  - [ ] Authentication and authorization testing
  - [ ] Input validation and sanitization

## 🎯 New Features to Implement

### Intelligence Features
These were not in the original implementation but are core to the new design:

```typescript
// Gap analysis integration with nutrition module
export async function analyzeNutritionalGaps(userId: string, date: string) {
    const nutritionData = await fetch(`${NUTRITION_API}/summary/micros?date=${date}`);
    const activeStack = await getActiveStack(userId);
    
    // Cross-reference nutrients to identify gaps
    return analyzeGapsAgainstRDA(nutritionData, activeStack);
}

// Interaction detection
export async function checkInteractions(userId: string) {
    const activeSupplements = await getActiveStackSupplements(userId);
    return findInteractions(activeSupplements);
}

// Timing optimization  
export async function optimizeTiming(userId: string) {
    const supplements = await getActiveStackSupplements(userId);
    const mealTimes = await getUserMealTimes(userId);
    
    return generateOptimalSchedule(supplements, mealTimes);
}
```

### Enhanced Substances Support
New functionality for performance enhancement:

```typescript
// Cycling protocol management
export interface CyclingProtocol {
    onDays: number;
    offDays: number;
    startDate: string;
    maxCycles?: number;
    pctProtocol?: PCTProtocol;
}

// PCT (Post Cycle Therapy) support
export interface PCTProtocol {
    startOffset: number; // Days after cycle ends
    duration: number;    // PCT duration in days
    substances: Array<{
        substanceId: string;
        dose: number;
        doseUnit: string;
        frequency: string;
    }>;
}

// Safety checks for enhanced substances
export async function validateEnhancedStack(stackItems: StackItem[]) {
    const warnings = [];
    
    // Check for PCT requirements
    const aasItems = stackItems.filter(item => 
        item.enhanced_substance?.category === 'AAS'
    );
    
    if (aasItems.length > 0) {
        const hasPCT = stackItems.some(item => 
            item.enhanced_substance?.category === 'SERM'
        );
        
        if (!hasPCT) {
            warnings.push({
                severity: 'critical',
                message: 'AAS detected without PCT protocol',
                recommendation: 'Add appropriate SERM for post-cycle therapy'
            });
        }
    }
    
    return warnings;
}
```

## 🔧 Configuration Updates

### Environment Variables
```bash
# New environment variables for supplements module
SUPPLEMENTS_API_PORT=5300
SUPPLEMENTS_DB_POOL_SIZE=10
SUPPLEMENTS_CACHE_TTL=300

# Enhanced substances (optional - restrictive access)
ENHANCED_SUBSTANCES_ENABLED=false
ENHANCED_SUBSTANCES_VERIFICATION_REQUIRED=true
ENHANCED_SUBSTANCES_AGE_VERIFICATION=21

# Integrations
NUTRITION_API_URL=http://localhost:5100
TRAINING_API_URL=http://localhost:5200
```

### Feature Flags
```typescript
// Feature flag configuration
export const SUPPLEMENTS_FEATURES = {
    enhancedSubstances: process.env.ENHANCED_SUBSTANCES_ENABLED === 'true',
    interactionWarnings: true,
    gapAnalysis: true,
    costTracking: true,
    cyclingProtocols: process.env.ENHANCED_SUBSTANCES_ENABLED === 'true',
    inventoryManagement: false, // Beta feature
    communityStacks: false,     // Future feature
};

// Use in components
if (SUPPLEMENTS_FEATURES.enhancedSubstances) {
    // Show enhanced substances in search
}
```

## 🚀 Deployment Strategy

### Phased Rollout
1. **Phase 1:** Core supplement tracking with new schema
2. **Phase 2:** Intelligence features (gap analysis, interactions)  
3. **Phase 3:** Enhanced substances (restricted access)
4. **Phase 4:** Advanced features (cycling, inventory, community)

### Backward Compatibility
```typescript
// API versioning for smooth transition
app.get('/api/v1/supplements/search', legacySearchHandler);
app.get('/api/v2/supplements/search', newSearchHandler);

// Default to v2, but support v1 for existing clients
app.get('/api/supplements/search', (c) => {
    const version = c.req.header('API-Version') || 'v2';
    if (version === 'v1') {
        return legacySearchHandler(c);
    }
    return newSearchHandler(c);
});
```

### Data Backup Strategy
```sql
-- Create backup tables before migration
CREATE TABLE supplements_backup AS SELECT * FROM supplements;
CREATE TABLE user_stacks_backup AS SELECT * FROM user_stacks; 
CREATE TABLE stack_items_backup AS SELECT * FROM stack_items;
CREATE TABLE intake_logs_backup AS SELECT * FROM intake_logs;

-- Rollback procedure if needed
CREATE FUNCTION rollback_supplements_migration() RETURNS void AS $$
BEGIN
    DROP TABLE IF EXISTS supplements CASCADE;
    ALTER TABLE supplements_backup RENAME TO supplements;
    -- Restore other tables...
END;
$$ LANGUAGE plpgsql;
```

This migration guide ensures a smooth transition from legacy implementations while maintaining data integrity and system stability throughout the process.