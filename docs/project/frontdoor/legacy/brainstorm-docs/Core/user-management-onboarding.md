# Spec: User Management & Onboarding

## Übersicht

Lumeos braucht ein Auth-System, Benutzerverwaltung und einen Onboarding-Flow der neue User von der Registrierung bis zum ersten aktiven Tag begleitet. Der DEV_USER_ID-Hardcode (`00000000-...0001`) wird durch echte User-IDs ersetzt.

---

## 1. User-Rollen

| Rolle | Beschreibung | Zugang |
|-------|-------------|--------|
| **User** | Normaler Athlet/Fitness-User | App-Zugang, eigenes Dashboard, Module, Marketplace (kaufen) |
| **Coach** | Personal Trainer / Online Coach | Alles von User + Coach Dashboard, Kunden verwalten, Templates erstellen, Marketplace (verkaufen), Revenue-Wallet |
| **Admin** | Plattform-Betreiber (Tom) | Alles + Admin Dashboard, User-Management, System-Monitoring |

**Wichtig:** Ein Coach IST ein User mit erweiterten Rechten. Kein separates System — gleiche `users`-Tabelle, `role`-Feld bestimmt Zugang.

---

## 2. Auth-Strategie

### Option A: Supabase Auth (Empfohlen)
- GoTrue-basiert, JWT Tokens
- Email/Password + Magic Link
- Optional: Google/Apple OAuth (Phase 2)
- Supabase Client SDK im Frontend
- RLS (Row Level Security) auf DB-Ebene

### Option B: Custom Auth (Fallback)
- bcrypt Password Hashing
- JWT Token Generation (jose library)
- Eigener Login/Register API Endpoint
- Session Management via HttpOnly Cookies

**Empfehlung:** Option B für jetzt — wir haben nur Postgres ohne GoTrue. Supabase Auth nachrüsten wenn wir auf hosted Supabase gehen.

### Auth-Flow
```
Register → Email/Password → JWT Token → Stored in HttpOnly Cookie + Memory
Login → Email/Password → JWT Token → Stored in HttpOnly Cookie + Memory
API Request → Cookie/Bearer Token → Middleware validiert → user_id aus Token
```

---

## 3. Datenmodell

### `users` Tabelle (NEU)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'coach', 'admin')),
  
  -- Profil
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  locale TEXT DEFAULT 'de' CHECK (locale IN ('de', 'en', 'th')),
  timezone TEXT DEFAULT 'Europe/Berlin',
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);
```

### `user_profiles` Tabelle (NEU)
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Körperdaten (aus Onboarding)
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  body_fat_pct NUMERIC(4,1),
  
  -- Fitness-Profil
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  training_frequency INTEGER, -- Tage pro Woche
  training_duration INTEGER, -- Minuten pro Session
  primary_goal TEXT, -- Links zu user_goals
  
  -- Ernährung
  dietary_preference TEXT, -- omnivore, vegetarian, vegan, etc.
  allergies TEXT[],
  
  -- Metriken (Unit-Preferences)
  unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `coach_profiles` Tabelle (NEU)
```sql
CREATE TABLE coach_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Coach-Infos
  specializations TEXT[], -- z.B. ['bodybuilding', 'powerlifting', 'nutrition']
  bio TEXT,
  certification TEXT,
  years_experience INTEGER,
  hourly_rate NUMERIC(8,2),
  
  -- Marketplace
  is_public BOOLEAN DEFAULT false, -- Im Coach-Verzeichnis sichtbar
  rating NUMERIC(3,2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  
  -- Revenue
  revenue_wallet_id UUID, -- Für spätere Wallet-Integration
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Onboarding-Flow (7 Schritte)

Der Onboarding-Flow sammelt die Daten die Lumeos braucht um sofort personalisierte Empfehlungen zu geben. Jeder Schritt ist ein Fullscreen-View.

### Step 1: Willkommen & Account
```
"Willkommen bei Lumeos"
- Display Name eingeben
- Sprache wählen (DE/EN/TH) → setzt locale
- Einheit wählen (Metrisch/Imperial)
→ User-Record wird angelegt
```

### Step 2: Körperdaten
```
"Erzähl uns von dir"
- Geschlecht (Männlich/Weiblich/Andere)
- Geburtsdatum (Date Picker)
- Größe (cm oder ft/in)
- Aktuelles Gewicht (kg oder lbs)
- Körperfett % (optional, Slider 5-50%)
→ user_profiles wird angelegt
```

### Step 3: Erfahrungslevel
```
"Wie erfahren bist du?"
- 4 Karten zum Auswählen:
  🌱 Anfänger (< 1 Jahr Training)
  💪 Fortgeschritten (1-3 Jahre)
  🏋️ Erfahren (3-7 Jahre)
  🏆 Elite (7+ Jahre, Wettkampf)
→ Bestimmt Trainingsvorschläge, Volume, Progression
```

### Step 4: Ziel wählen
```
"Was ist dein Ziel?"
- Nutzt den existierenden GoalSelector
- Clean Bulk, Cut, Recomp, Maintain, Performance
- Macro-Targets werden automatisch berechnet (TDEE → Ziel)
→ Erstellt user_goals Record
→ Setzt Nutrition Targets
```

### Step 5: Trainingsplan
```
"Wie trainierst du?"
- Trainingsfrequenz (2-7 Tage/Woche, Slider)
- Bevorzugte Dauer (30/45/60/90 min)
- Equipment-Zugang:
  🏠 Home Gym (Basics)
  🏋️ Volles Gym
  💪 Nur Bodyweight
- Optional: Routine vorschlagen (PPL, Upper/Lower, Full Body)
→ Speichert in user_profiles
→ Optional: Erstellt erste Routine
```

### Step 6: Ernährungspräferenzen
```
"Ernährung einrichten"
- Ernährungsform: Omnivor, Vegetarisch, Vegan, Pescetarisch
- Allergien/Unverträglichkeiten (Multi-Select: Gluten, Laktose, Nüsse, etc.)
- Mahlzeiten pro Tag (3-6, Slider)
- Mahlzeiten-Zeitplan anpassen
→ Erstellt user_food_preferences + meal_schedule in user_settings
```

### Step 7: Zusammenfassung & Los geht's
```
"Dein personalisierter Plan"
- Zusammenfassung aller Eingaben in einer Card
- Berechnete Macro-Targets prominent anzeigen
- "Dein erster Tag" Preview:
  - Trainingsvorschlag
  - Kalorien-/Protein-Ziel
  - Empfohlene Supplements (falls relevant)
- Button: "Los geht's! 🚀"
→ onboarding_completed = true
→ Redirect zu Dashboard
```

---

## 5. Auth-Middleware

### API-Seite
```typescript
// Middleware die vor jeder Route läuft
async function authMiddleware(c, next) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '') 
    || getCookie(c, 'lumeos_token');
  
  if (!token) return c.json({ ok: false, error: 'Unauthorized' }, 401);
  
  const payload = verifyJWT(token);
  if (!payload) return c.json({ ok: false, error: 'Invalid token' }, 401);
  
  c.set('userId', payload.userId);
  c.set('userRole', payload.role);
  await next();
}

// Role-Check Middleware
function requireRole(...roles: string[]) {
  return async (c, next) => {
    if (!roles.includes(c.get('userRole'))) {
      return c.json({ ok: false, error: 'Forbidden' }, 403);
    }
    await next();
  };
}
```

### Frontend-Seite
```typescript
// Auth Store (Zustand)
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password) => Promise<void>;
  register: (email, password, name) => Promise<void>;
  logout: () => void;
}
```

---

## 6. Migration: DEV_USER_ID → Echte User-IDs

### Problem
429 Stellen im Code nutzen `DEV_USER_ID`. Diese müssen auf `c.get('userId')` (API) bzw. `authStore.user.id` (Frontend) umgestellt werden.

### Strategie
1. **Phase 1: Auth einbauen, DEV_USER_ID als Fallback**
   - Auth-Middleware gibt `userId` her
   - Wenn kein Token: Fallback auf DEV_USER_ID (für Dev-Modus)
   - Kein bestehender Code bricht
   
2. **Phase 2: Schrittweise Migration**
   - Modul für Modul: DEV_USER_ID → `c.get('userId')`
   - Jede API-Route einzeln umstellen
   - Tests nach jeder Route

3. **Phase 3: DEV_USER_ID entfernen**
   - Fallback deaktivieren
   - Nur noch authentifizierte Requests
   - Dev-Seed-Script für Test-User

### Dev-Modus
```
ENV: LUMEOS_DEV_MODE=true → Auto-Login als DEV_USER_ID
ENV: LUMEOS_DEV_MODE=false → Echte Auth required
```

---

## 7. Screens / UI-Komponenten

### Neue Seiten
| Seite | Route | Beschreibung |
|-------|-------|-------------|
| Login | `/#login` | Email + Password, Link zu Register |
| Register | `/#register` | Email + Password + Name, Link zu Login |
| Onboarding | `/#onboarding` | 7-Step Wizard (Fullscreen) |
| Profil | `/#profile` | User-Profil bearbeiten |
| Account Settings | `/#settings/account` | Email, Password, Sprache, Einheiten |

### Komponenten
| Komponente | Datei | Beschreibung |
|-----------|-------|-------------|
| `LoginForm` | `src/pages/LoginPage.tsx` | Email/Password Form |
| `RegisterForm` | `src/pages/RegisterPage.tsx` | Registration Form |
| `OnboardingWizard` | `src/pages/OnboardingPage.tsx` | 7-Step Container |
| `OnboardingStep1..7` | `src/modules/onboarding/components/` | Einzelne Steps |
| `AuthGuard` | `src/components/AuthGuard.tsx` | Wrapper: Redirect zu Login wenn nicht auth'd |
| `UserMenu` | `src/components/UserMenu.tsx` | Avatar + Dropdown (Profil, Settings, Logout) |

---

## 8. API-Endpoints

### Auth API (Port 4200 oder in bestehende APIs integriert)
```
POST /api/auth/register     → { email, password, displayName }
POST /api/auth/login        → { email, password } → { token, user }
POST /api/auth/logout       → Invalidate Token
GET  /api/auth/me           → Current User Info
PUT  /api/auth/me           → Update Profile
POST /api/auth/refresh      → Refresh Token

POST /api/auth/forgot-password  → (Phase 2)
POST /api/auth/reset-password   → (Phase 2)
POST /api/auth/verify-email     → (Phase 2)
```

### Onboarding API
```
GET  /api/onboarding/status     → { step, completed }
PUT  /api/onboarding/step/:n    → Save step data
POST /api/onboarding/complete   → Mark as completed, trigger initial setup
```

### User API (Admin)
```
GET    /api/admin/users          → Paginated user list
GET    /api/admin/users/:id      → User detail
PUT    /api/admin/users/:id/role → Change role
DELETE /api/admin/users/:id      → Deactivate user
```

---

## 9. Sicherheit

- Passwords: **bcrypt** (cost factor 12)
- JWT: **HS256** mit Server-Secret, 7 Tage Expiry
- Refresh Token: 30 Tage, HttpOnly Cookie
- CORS: Nur erlaubte Origins
- Rate Limiting: 5 Login-Versuche/Minute
- Input Validation: Zod auf allen Endpoints
- RLS: Jeder User sieht nur seine Daten (`WHERE user_id = auth.uid()`)

---

## 10. Implementierungs-Reihenfolge

### Sprint 1: Auth Basics (2-3 Agents, ~2h)
1. `users` + `user_profiles` Tabellen erstellen
2. Auth API (register, login, me, logout)
3. Auth Middleware (mit DEV_USER_ID Fallback)
4. Auth Store (Zustand)
5. Login + Register Pages
6. AuthGuard Komponente

### Sprint 2: Onboarding Flow (2-3 Agents, ~3h)
1. Onboarding API Endpoints
2. OnboardingWizard Container
3. Steps 1-3 (Account, Körper, Erfahrung)
4. Steps 4-5 (Ziel, Training) — nutzt bestehende Komponenten
5. Steps 6-7 (Ernährung, Zusammenfassung)
6. Auto-Setup: Goals, Targets, Meal Schedule

### Sprint 3: Migration (schrittweise, ~4h)
1. Nutrition API → userId aus Token
2. Training API → userId aus Token
3. Supplements API → userId aus Token
4. Alle weiteren APIs
5. Frontend: authStore.user.id statt hardcoded

### Sprint 4: Coach Upgrade (1-2 Agents, ~2h)
1. `coach_profiles` Tabelle
2. Coach-Registration Flow (Extra-Step nach Onboarding)
3. Role-Check Middleware für Coach-Endpoints
4. Coach-Verzeichnis im Marketplace

---

## 11. Acceptance Criteria

- [ ] AC1: User kann sich registrieren mit Email/Password → erhält JWT
- [ ] AC2: User kann sich einloggen → JWT in Cookie → alle API Calls authentifiziert
- [ ] AC3: Nicht-eingeloggter User sieht nur Login/Register
- [ ] AC4: Neuer User durchläuft 7-Step Onboarding → alle Daten gespeichert
- [ ] AC5: Nach Onboarding: Dashboard zeigt personalisierte Daten (Macros, Ziel, Plan)
- [ ] AC6: DEV_USER_ID funktioniert weiter im Dev-Modus (kein Breaking Change)
- [ ] AC7: Coach kann sich als Coach registrieren → sieht Coach Dashboard
- [ ] AC8: Admin sieht User-Liste im Admin Dashboard
- [ ] AC9: Jeder User sieht nur seine eigenen Daten (RLS)
- [ ] AC10: TypeScript Build clean, keine `any` Types
