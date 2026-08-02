# Supplements API Documentation

## Base URL
`http://localhost:5300`

## Endpoints Overview

### Supplements Database API

#### `GET /supplements/search`
Search supplements with filtering options.

**Query Parameters:**
- `q` (string, optional): Search query for supplement names
- `category` (string, optional): Supplement category filter
- `limit` (number, optional): Results limit (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Example:**
```bash
GET /supplements/search?q=vitamin D&category=vitamins&limit=10
```

**Response:**
```json
{
  "supplements": [
    {
      "id": "s001",
      "name": "Vitamin D3",
      "name_de": "Vitamin D3",
      "name_en": "Vitamin D3",
      "category": "vitamins",
      "subcategory": "fat_soluble",
      "evidence_grade": "A",
      "dosage_min": 1000,
      "dosage_max": 4000,
      "dosage_unit": "IU",
      "timing": "with_meal",
      "interactions": ["calcium"],
      "contraindications": ["hypercalcemia"],
      "benefits": ["bone health", "immune function"],
      "cost_per_dose": 0.25
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### `GET /supplements/:id`
Get detailed information for specific supplement.

### Stacks Management API

#### `GET /stacks`
Get user's supplement stacks.

**Response:**
```json
{
  "stacks": [
    {
      "id": "st001",
      "name": "Daily Basics",
      "description": "Essential daily supplements",
      "goal": "general_health",
      "items": [
        {
          "supplement_id": "s001",
          "daily_dose": 2000,
          "dose_unit": "IU",
          "timing": "morning",
          "cost_per_day": 0.50
        }
      ],
      "total_cost_per_day": 2.75,
      "created_at": "2026-03-25"
    }
  ]
}
```

#### `POST /stacks`
Create new supplement stack.

**Body:**
```json
{
  "name": "Muscle Building Stack",
  "description": "For muscle growth and recovery",
  "goal": "muscle_building",
  "items": [
    {
      "supplement_id": "s002",
      "daily_dose": 5,
      "dose_unit": "g",
      "timing": "post_workout"
    }
  ]
}
```

#### `PUT /stacks/:id`
Update existing stack.

#### `DELETE /stacks/:id`
Delete a supplement stack.

### Intake Tracking API

#### `GET /intake/logs`
Get intake logging history.

**Query Parameters:**
- `date` (string): Date in YYYY-MM-DD format
- `start_date` (string): Start date range
- `end_date` (string): End date range

**Response:**
```json
{
  "intake_logs": [
    {
      "id": "il001",
      "supplement_id": "s001",
      "stack_item_id": "si001",
      "date": "2026-03-25",
      "time": "08:00:00",
      "dose_taken": 2000,
      "dose_unit": "IU",
      "notes": "taken with breakfast"
    }
  ]
}
```

#### `POST /intake/logs`
Log supplement intake.

**Body:**
```json
{
  "supplement_id": "s001",
  "dose_taken": 2000,
  "dose_unit": "IU",
  "date": "2026-03-25",
  "time": "08:00:00",
  "notes": "taken with breakfast"
}
```

### Supplement Intelligence API

#### `GET /intelligence/recommendations`
Get AI-powered supplement recommendations.

**Query Parameters:**
- `goal` (string): Primary goal (muscle_building, weight_loss, general_health)
- `budget_max` (number): Maximum daily budget
- `deficiencies` (string): Comma-separated list of deficient nutrients

**Response:**
```json
{
  "recommendations": [
    {
      "supplement_id": "s001",
      "recommendation_strength": "high",
      "reasoning": "Low vitamin D levels detected in recent blood work",
      "suggested_dose": 3000,
      "dose_unit": "IU",
      "priority": 1,
      "cost_benefit_score": 8.5
    }
  ],
  "total_cost": 3.25,
  "explanation": "Recommended based on goals and deficiencies"
}
```

#### `GET /intelligence/interactions`
Check for supplement interactions in current stack.

**Response:**
```json
{
  "interactions": [
    {
      "supplement_a": "s001",
      "supplement_b": "s015",
      "interaction_type": "absorption_reduced",
      "severity": "moderate",
      "description": "Calcium may reduce magnesium absorption",
      "recommendation": "Take 2 hours apart"
    }
  ],
  "safe_combinations": ["s001+s003", "s002+s004"]
}
```

### Enhanced Substances API

#### `GET /enhanced/substances`
Get performance enhancement substances (controlled access).

#### `POST /enhanced/cycles`
Plan enhancement cycles (medical supervision required).

### Health Monitoring API

#### `GET /health/bloodwork`
Get supplement-related blood markers.

**Response:**
```json
{
  "markers": [
    {
      "marker": "vitamin_d",
      "current_value": 32,
      "unit": "ng/mL",
      "optimal_range": [30, 80],
      "status": "adequate",
      "related_supplements": ["s001"]
    }
  ]
}
```

#### `POST /health/deficiencies`
Report nutrient deficiencies for recommendations.

### Inventory Management API

#### `GET /inventory`
Get user's supplement inventory.

**Response:**
```json
{
  "inventory": [
    {
      "id": "inv001",
      "supplement_id": "s001",
      "quantity_remaining": 60,
      "unit": "capsules",
      "expiry_date": "2027-03-01",
      "cost": 25.99,
      "days_remaining": 30,
      "reorder_alert": false
    }
  ]
}
```

#### `POST /inventory`
Add supplement to inventory.

#### `PUT /inventory/:id`
Update inventory quantities.

### Cycles & Protocols API

#### `GET /cycles`
Get cycling protocols (for cyclic supplements).

#### `POST /cycles`
Create new supplement cycling protocol.

### Injection Tracking API (Enhanced)

#### `GET /injections/logs`
Get injection logs (for enhanced substances).

#### `POST /injections/logs`
Log injection (medical supervision required).

## Database Tables Used
- `supplements` - Supplement database with evidence ratings
- `supplement_categories` - Category definitions
- `user_stacks` - User supplement stacks
- `stack_items` - Items within stacks
- `intake_logs` - Daily intake tracking
- `user_inventory` - Supplement inventory management
- `supplement_interactions` - Known interactions
- `enhanced_substances` - Performance enhancement substances

## Error Handling
Standard error format:
```json
{
  "error": "Error message",
  "code": "SUPPLEMENT_ERROR_CODE",
  "details": {}
}
```

## Authentication
Requires valid JWT token:
```
Authorization: Bearer <jwt-token>
```

## Special Permissions
- Enhanced substances require medical supervision flag
- Injection logging requires enhanced access level
- Cycle planning requires medical professional account