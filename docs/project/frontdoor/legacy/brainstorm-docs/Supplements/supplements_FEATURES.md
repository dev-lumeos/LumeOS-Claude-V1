# Supplements Module Features

> Detailed breakdown of features with implementation examples

## 🔍 Smart Search & Discovery

### Multi-Source Search
Searches across both regular supplements and enhanced substances with unified API.

**Implementation:**
```typescript
// server.ts - Unified search endpoint
app.get('/api/supplements/search', async (c) => {
  const q = c.req.query('q') || '';
  const category = c.req.query('category');
  
  // Search regular supplements
  let suppResults = await sql`
    SELECT *, 'supplement' as source FROM supplements
    WHERE name ILIKE ${'%' + q + '%'} OR name_de ILIKE ${'%' + q + '%'}
    ORDER BY evidence_grade ASC, name ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  // Enhanced categories get enhanced_substances instead
  const ENHANCED_CATEGORIES = ['AAS', 'SARM', 'Peptide', 'GH', 'AI', 'SERM'];
  let enhancedResults = [];
  
  if (ENHANCED_CATEGORIES.includes(category) || !category) {
    enhancedResults = await sql`
      SELECT id, name, category, 'enhanced' as source, 
             typical_dose_min as serving_size, dose_unit as serving_unit
      FROM enhanced_substances
      WHERE (name ILIKE ${'%' + q + '%'} OR array_to_string(aliases, ' ') ILIKE ${'%' + q + '%'})
      ORDER BY name ASC LIMIT ${limit}
    `;
  }
  
  const results = [...suppResults, ...enhancedResults];
  return c.json({ ok: true, data: results });
});
```

### Evidence-Based Ranking
Results prioritized by scientific evidence quality (A+ to F grading).

**Features:**
- **A+ Grade:** Meta-analyses, systematic reviews
- **A Grade:** Multiple high-quality RCTs
- **B Grade:** Some quality studies
- **C Grade:** Limited evidence
- **F Grade:** No evidence or disproven

## 📚 Intelligent Stack Management

### Active Stack System
Only one stack can be active at a time for daily tracking simplicity.

**Implementation:**
```typescript
// routes/stacks.ts - Activate stack endpoint  
stackRoutes.post('/:id/activate', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  
  // Deactivate all first
  await sql`UPDATE user_stacks SET is_active = false WHERE user_id = ${userId}`;
  
  // Activate target stack
  const [stack] = await sql`
    UPDATE user_stacks SET is_active = true, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  
  return c.json({ ok: true, data: stack });
});
```

### Smart Item Management
Stack items support custom names, flexible dosing, and cycling protocols.

**Key Features:**
- **Custom Names:** Override supplement name (e.g., "Morning Magnesium")
- **Flexible Dosing:** Any dose/unit combination
- **Cycling Support:** On/off periods for enhanced substances
- **Sort Ordering:** Custom arrangement for optimal workflow

**Implementation:**
```typescript
// Adding item with cycling protocol
const [item] = await sql`
  INSERT INTO stack_items (
    stack_id, supplement_id, custom_name, dose, dose_unit, 
    frequency, timing, cycling, sort_order
  )
  VALUES (
    ${stackId}, ${body.supplement_id}, ${body.custom_name}, 
    ${body.dose}, ${body.dose_unit}, ${body.frequency}, 
    ${body.timing}, ${body.cycling ? JSON.stringify(body.cycling) : null},
    ${body.sort_order || 0}
  )
  RETURNING *
`;
```

## 📊 Daily Intake Tracking

### Intelligent Status Management
Tracks taken, skipped, snoozed, and pending states with timestamps.

**Implementation:**
```typescript
// routes/intake.ts - Log intake
intakeRoutes.post('/log/:itemId', async (c) => {
  const userId = c.get('userId');
  const itemId = c.req.param('itemId');
  const body = await c.req.json();
  const status = body.status || 'taken';
  
  const [log] = await sql`
    INSERT INTO intake_logs (user_id, stack_item_id, date, status, taken_at, notes)
    VALUES (${userId}, ${itemId}, ${date}, ${status}, 
            ${status === 'taken' ? sql`NOW()` : null}, ${body.notes})
    ON CONFLICT (user_id, stack_item_id, date) 
    DO UPDATE SET 
      status = ${status}, 
      taken_at = ${status === 'taken' ? sql`NOW()` : null},
      notes = ${body.notes}
    RETURNING *
  `;
  
  return c.json({ ok: true, data: log });
});
```

### Auto-Generation System
Automatically creates daily intake entries from active stack.

**Features:**
- **Daily Batch Creation:** One-click generation for entire day
- **Conflict Resolution:** Won't overwrite existing logs  
- **Frequency Handling:** Respects daily/weekly/cycling schedules

### Compliance Analytics
Comprehensive tracking with multiple metrics and timeframes.

**Implementation:**
```typescript
// Compliance calculation with granular breakdown
intakeRoutes.get('/compliance', async (c) => {
  const logs = await sql`
    SELECT status FROM intake_logs 
    WHERE user_id = ${userId} AND date >= ${startDate}
  `;
  
  const total = logs.length;
  const taken = logs.filter(log => log.status === 'taken').length;
  const skipped = logs.filter(log => log.status === 'skipped').length;
  const pending = total - taken - skipped;
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
  
  return c.json({ 
    ok: true, 
    data: { total, taken, skipped, pending, percentage, days } 
  });
});
```

## 🧠 Intelligence & Analysis

### Nutritional Gap Analysis
Integrates with Nutrition API to identify supplement needs.

**Implementation:**
```typescript
// routes/intelligence.ts - Gap analysis
intelligenceRoutes.get('/gap-analysis', async (c) => {
  // Fetch current nutrition data
  const res = await fetch(`${NUTRITION_API}/api/nutrition/summary/micros-full?date=${today}`);
  let micros = {};
  if (res.ok) {
    const json = await res.json();
    micros = json.data || {};
  }
  
  // Get active stack supplements
  const stackSupps = await sql`
    SELECT COALESCE(si.custom_name, s.name) as name
    FROM user_stacks us
    JOIN stack_items si ON si.stack_id = us.id
    LEFT JOIN supplements s ON si.supplement_id = s.id
    WHERE us.user_id = ${userId} AND us.is_active = true
  `;
  
  // Analyze gaps against RDA
  const gaps = Object.entries(RDA).map(([nutrient, { rda, unit }]) => {
    const current = micros[nutrient] || 0;
    const percent = Math.round((current / rda) * 100);
    const isGap = percent < 80;
    
    // Check if stack already covers this
    let covered_by_stack = false;
    let supplement_suggestion = '';
    
    for (const [suppName, nutrients] of Object.entries(SUPPLEMENT_NUTRIENT_MAP)) {
      if (nutrients.includes(nutrient)) {
        if (stackNames.includes(suppName)) {
          covered_by_stack = true;
        } else if (isGap) {
          supplement_suggestion = suppName;
        }
      }
    }
    
    return { 
      nutrient, current, rda, unit, percent, 
      is_gap: isGap, covered_by_stack, supplement_suggestion 
    };
  });
  
  return c.json({ ok: true, data: gaps });
});
```

**RDA Reference Values:**
```typescript
const RDA = {
  'vitamin_d': { rda: 800, unit: 'IU' },
  'vitamin_c': { rda: 90, unit: 'mg' },
  'vitamin_a': { rda: 900, unit: 'mcg' },
  'magnesium': { rda: 420, unit: 'mg' },
  'omega3': { rda: 1600, unit: 'mg' },
  // ... more nutrients
};
```

### Interaction Detection
Scans active stack for potentially dangerous supplement combinations.

**Implementation:**
```typescript
intelligenceRoutes.get('/interactions', async (c) => {
  // Get active stack supplements
  const stackSupps = await sql`
    SELECT COALESCE(si.custom_name, s.name) as name, s.id as supplement_id
    FROM user_stacks us
    JOIN stack_items si ON si.stack_id = us.id
    LEFT JOIN supplements s ON si.supplement_id = s.id
    WHERE us.user_id = ${userId} AND us.is_active = true
  `;
  
  // Find matching interactions
  const interactions = await sql`
    SELECT * FROM supplement_interactions
    WHERE (supplement1_name = ANY(${names}) OR supplement1_id = ANY(${ids}))
       OR (supplement2_name = ANY(${names}) OR supplement2_id = ANY(${ids}))
    ORDER BY 
      CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END
  `;
  
  // Filter to only interactions where BOTH sides are in stack
  const relevant = interactions.filter(interaction => {
    const s1Match = names.includes(interaction.supplement1_name) || 
                    ids.includes(interaction.supplement1_id);
    const s2Match = names.includes(interaction.supplement2_name) || 
                    ids.includes(interaction.supplement2_id);
    return s1Match && s2Match;
  });
  
  return c.json({ ok: true, data: relevant });
});
```

**Interaction Severity Levels:**
- **Critical:** Dangerous combinations that should never be taken together
- **Warning:** Significant issues requiring timing separation or monitoring
- **Caution:** Minor concerns with recommended adjustments
- **Info:** Neutral interactions or synergies

### Redundancy Detection
Identifies overlapping supplements to prevent waste and over-supplementation.

**Implementation:**
```typescript
intelligenceRoutes.get('/redundancies', async (c) => {
  const items = await sql`
    SELECT si.*, s.name, s.ingredients, s.category
    FROM user_stacks us
    JOIN stack_items si ON si.stack_id = us.id
    LEFT JOIN supplements s ON si.supplement_id = s.id
    WHERE us.user_id = ${userId} AND us.is_active = true
  `;
  
  // Group by category to find overlaps
  const categoryMap = {};
  for (const item of items) {
    const cat = item.category || 'other';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(item);
  }
  
  const redundancies = Object.entries(categoryMap)
    .filter(([_, items]) => items.length > 1)
    .map(([category, items]) => ({
      category,
      supplements: items.map(i => i.name),
      message: `${items.length} supplements in "${category}" — check for overlap`
    }));
  
  return c.json({ ok: true, data: redundancies });
});
```

### Optimized Timing
AI-powered scheduling that considers absorption and interactions.

**Implementation:**
```typescript
intelligenceRoutes.get('/timing', async (c) => {
  const items = await sql`
    SELECT si.*, COALESCE(si.custom_name, s.name) as name, 
           s.absorption_notes, s.timing_default
    FROM user_stacks us
    JOIN stack_items si ON si.stack_id = us.id  
    LEFT JOIN supplements s ON si.supplement_id = s.id
    WHERE us.user_id = ${userId} AND us.is_active = true
    ORDER BY si.sort_order
  `;
  
  // Smart timing slot assignment
  const slots = { morning: [], pre_workout: [], with_lunch: [], evening: [], bedtime: [] };
  
  for (const item of items) {
    const timing = item.timing || item.timing_default || 'morning';
    
    if (timing.includes('morning') || timing.includes('breakfast')) {
      slots.morning.push(item);
    } else if (timing.includes('pre_workout')) {
      slots.pre_workout.push(item);
    } else if (timing.includes('lunch')) {
      slots.with_lunch.push(item);
    } else if (timing.includes('evening')) {
      slots.evening.push(item);
    } else if (timing.includes('bedtime')) {
      slots.bedtime.push(item);
    } else {
      slots.morning.push(item); // fallback
    }
  }
  
  const schedule = [
    { slot: 'morning', time: '07:00', label: '☀️ Morning (with breakfast)', items: slots.morning },
    { slot: 'pre_workout', time: '16:00', label: '🏋️ Pre-Workout', items: slots.pre_workout },
    { slot: 'with_lunch', time: '12:30', label: '🍽️ With Lunch', items: slots.with_lunch },
    { slot: 'evening', time: '20:00', label: '🌆 Evening', items: slots.evening },
    { slot: 'bedtime', time: '22:00', label: '🌙 Bedtime', items: slots.bedtime }
  ].filter(s => s.items.length > 0);
  
  return c.json({ ok: true, data: schedule });
});
```

## 🧪 Enhanced Substances Management

### Performance Enhancement Support
Specialized handling for AAS, SARMs, peptides, and related compounds.

**Categories Supported:**
- **AAS:** Anabolic Androgenic Steroids
- **SARM:** Selective Androgen Receptor Modulators  
- **Peptide:** Growth hormone peptides and research compounds
- **GH:** Growth hormone and analogs
- **AI:** Aromatase Inhibitors
- **SERM:** Selective Estrogen Receptor Modulators

**Implementation:**
```typescript
// Enhanced substance search with safety warnings
enhancedRoutes.get('/substances', async (c) => {
  const substances = await sql`
    SELECT id, name, category, route, typical_dose_min, dose_unit,
           half_life_hours, frequency, warnings, contraindications,
           requires_pct, aromatization, hepatotoxicity_level
    FROM enhanced_substances
    WHERE category = ${category}
    ORDER BY name ASC
  `;
  
  return c.json({ ok: true, data: substances });
});
```

### Safety-First Approach
Comprehensive warnings, contraindications, and conservative dosing.

**Safety Features:**
- **PCT Requirements:** Flags substances needing post-cycle therapy
- **Liver Toxicity Levels:** None/Low/Moderate/High/Severe
- **Cardiovascular Risk:** Integrated risk assessment
- **Drug Interactions:** Enhanced substance-specific interactions
- **Legal Status:** Jurisdiction-aware warnings

### Cycling Protocol Management
Structured on/off periods with automatic calculations.

**Implementation:**
```typescript
// Cycling support in stack items
const cycling = {
  on_days: 14,
  off_days: 7, 
  start_date: "2024-01-01",
  current_cycle: 1,
  max_cycles: 4
};

// Automatic cycle status calculation
function getCycleStatus(cycling, currentDate) {
  const startDate = new Date(cycling.start_date);
  const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
  const cycleDays = cycling.on_days + cycling.off_days;
  const currentCycleDay = daysDiff % cycleDays;
  
  const isOnCycle = currentCycleDay < cycling.on_days;
  const currentCycle = Math.floor(daysDiff / cycleDays) + 1;
  
  return { isOnCycle, currentCycle, dayInCycle: currentCycleDay };
}
```

## 💰 Cost Tracking & Optimization

### Monthly Budget Analysis
Automatic cost calculations based on dosing and frequency.

**Implementation:**
```typescript
intelligenceRoutes.get('/cost-summary', async (c) => {
  const items = await sql`
    SELECT si.*, s.cost_per_serving, 
           COALESCE(si.custom_name, s.name) as supplement_name
    FROM user_stacks us
    JOIN stack_items si ON si.stack_id = us.id
    LEFT JOIN supplements s ON si.supplement_id = s.id
    WHERE us.user_id = ${userId} AND us.is_active = true
  `;
  
  let totalMonthly = 0;
  const itemCosts = items.map(item => {
    const costPerServing = parseFloat(item.cost_per_serving || '0');
    
    // Calculate servings per day based on frequency
    let servingsPerDay = 1;
    switch (item.frequency) {
      case 'daily': servingsPerDay = 1; break;
      case '2x_daily': servingsPerDay = 2; break;
      case 'weekly': servingsPerDay = 1/7; break;
      case 'every_other_day': servingsPerDay = 0.5; break;
    }
    
    const monthlyCost = costPerServing * servingsPerDay * 30;
    totalMonthly += monthlyCost;
    
    return {
      id: item.id,
      name: item.supplement_name,
      cost_per_serving: costPerServing,
      monthly_cost: Math.round(monthlyCost * 100) / 100
    };
  });
  
  return c.json({ 
    ok: true, 
    data: { 
      total_monthly: Math.round(totalMonthly * 100) / 100,
      items: itemCosts 
    } 
  });
});
```

## 📱 Mobile-Optimized Features

### Quick Logging Interface
Batch operations and gesture-based interactions for mobile efficiency.

**Features:**
- **Swipe to Mark Taken:** iOS/Android native gestures
- **Batch Selection:** Mark multiple supplements at once
- **Voice Integration:** "Mark all morning supplements as taken"
- **Offline Sync:** Queue actions when offline, sync when online

### Smart Notifications
Context-aware reminders based on timing preferences and historical patterns.

**Notification Types:**
- **Timing Reminders:** "Time for your morning supplements"
- **Interaction Warnings:** "Iron and Calcium taken too close together"
- **Low Stock Alerts:** "Vitamin D3 running low (3 days remaining)"
- **Cycling Alerts:** "PCT cycle starts tomorrow"

### Progressive Web App Features
Native app experience through web technologies.

**Capabilities:**
- **Offline Mode:** Full functionality without internet
- **Push Notifications:** System-level reminders
- **Home Screen Install:** Add to device home screen
- **Background Sync:** Automatic data synchronization

This comprehensive feature set makes supplement management both intelligent and effortless, prioritizing safety while optimizing health outcomes.