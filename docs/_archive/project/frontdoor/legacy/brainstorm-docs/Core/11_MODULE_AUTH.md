# LUMEOS — Modul: Auth + Onboarding
> Konsolidiert + Major Update | 2026-04-14
> API Port: 4200 | Status: ⚠️ Auth-Migration pending (DEV_USER_ID noch aktiv)

---

## 1. Zweck

Auth ist das Fundament für alle anderen Module. Es verwaltet User-Authentication,
erweiterte Profile, das Permission-System (RBAC) und den 7-Step Onboarding-Flow.
Aktuell läuft das System noch mit hardcoded DEV_USER_ID — die Migration zu echter
Auth ist der wichtigste offene Infrastruktur-Punkt.

---

## 2. Rollen (3 Rollen, 1 System)

**Wichtig:** Ein Coach IST ein User mit erweiterten Rechten.
Keine separaten Systeme — gleiche `users`-Tabelle, `role`-Feld bestimmt Zugang.

| Rolle | Beschreibung | Zugang |
|---|---|---|
| **user** | Normaler Athlet | App, Dashboard, alle eigenen Module, Marketplace (kaufen) |
| **coach** | Personal Trainer | Alles von User + Coach Dashboard, Kunden, Templates, Marketplace (verkaufen), Revenue-Wallet |
| **admin** | Tom (Plattform-Betreiber) | Alles + Admin Dashboard, User-Management, System-Monitoring |

---

## 3. Auth-Strategie

### Aktuell: Custom Auth (Option B — in Betrieb)
- bcrypt Password Hashing (cost factor 12)
- JWT Token Generation (jose library)
- HS256, 7 Tage Expiry
- Refresh Token: 30 Tage, HttpOnly Cookie
- DEV_USER_ID Fallback für Dev-Modus

### Geplant: Supabase Auth (Option A — Migration)
- GoTrue-basiert, JWT Tokens
- Email/Password + Magic Link
- Optional: Google/Apple OAuth (Phase 2)
- RLS auf DB-Ebene

**Empfehlung:** Custom Auth für jetzt. Supabase Auth nachrüsten beim Cloud-Migration-Step.

### Auth-Flow
```
Register → Email/Password → JWT Token → HttpOnly Cookie + Memory
Login    → Email/Password → JWT Token → HttpOnly Cookie + Memory
API Req  → Cookie/Bearer  → Middleware validates → user_id aus Token
```

---

## 4. Datenmodell

### `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'coach', 'admin')),
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  locale        TEXT DEFAULT 'de' CHECK (locale IN ('de', 'en', 'th')),
  timezone      TEXT DEFAULT 'Europe/Berlin',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step      INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);
```

### `user_profiles`
```sql
CREATE TABLE user_profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date      DATE,
  height_cm       NUMERIC(5,1),
  weight_kg       NUMERIC(5,1),
  body_fat_pct    NUMERIC(4,1),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  training_frequency INTEGER,          -- Tage pro Woche
  training_duration  INTEGER,          -- Minuten pro Session
  primary_goal    TEXT,
  dietary_preference TEXT,
  allergies       TEXT[],
  unit_system     TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `coach_profiles`
```sql
CREATE TABLE coach_profiles (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specializations   TEXT[],            -- bodybuilding, powerlifting, nutrition
  bio               TEXT,
  certification     TEXT,
  years_experience  INTEGER,
  hourly_rate       NUMERIC(8,2),
  is_public         BOOLEAN DEFAULT false,
  rating            NUMERIC(3,2) DEFAULT 0,
  total_clients     INTEGER DEFAULT 0,
  revenue_wallet_id UUID,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Onboarding-Flow (7 Schritte)

Jeder Schritt ist ein Fullscreen-View. Sammelt alle Daten für sofort
personalisierte Empfehlungen nach Abschluss.

### Step 1: Willkommen & Account
- Display Name, Sprache (DE/EN/TH), Einheiten (Metrisch/Imperial)
- → User-Record wird angelegt

### Step 2: Körperdaten
- Geschlecht, Geburtsdatum, Größe, Gewicht, Körperfett % (optional)
- → user_profiles wird angelegt

### Step 3: Erfahrungslevel
- 4 Karten: 🌱 Anfänger (<1J) / 💪 Fortgeschritten (1-3J) / 🏋️ Erfahren (3-7J) / 🏆 Elite (7+J)
- → Bestimmt Trainingsvorschläge, Volume, Progression

### Step 4: Ziel wählen
- Nutzt existierenden GoalSelector: Clean Bulk / Cut / Recomp / Maintain / Performance
- → Erstellt user_goals Record
- → Berechnet + setzt Nutrition Targets (TDEE → Ziel)

### Step 5: Trainingsplan
- Frequenz (2-7 Tage/Woche), Dauer (30/45/60/90min)
- Equipment: 🏠 Home Gym / 🏋️ Volles Gym / 💪 Bodyweight Only
- Optional: erste Routine vorschlagen (PPL, Upper/Lower, Full Body)
- → Speichert in user_profiles, optional erste Routine

### Step 6: Ernährungspräferenzen
- Ernährungsform: Omnivor / Vegetarisch / Vegan / Pescetarisch
- Allergien (Multi-Select: Gluten, Laktose, Nüsse, Soja, etc.)
- Mahlzeiten pro Tag (3-6)
- → Erstellt user_food_preferences + meal_schedule in user_settings

### Step 7: Zusammenfassung & Los geht's
- Alle Eingaben als Summary Card
- Berechnete Macro-Targets prominent
- "Dein erster Tag" Preview (Training, Kalorien-Ziel, Supplements falls relevant)
- Button: "Los geht's! 🚀"
- → onboarding_completed = true → Redirect zu Dashboard

---

## 6. Auth-Middleware

### API-Seite
```typescript
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

function requireRole(...roles: string[]) {
  return async (c, next) => {
    if (!roles.includes(c.get('userRole')))
      return c.json({ ok: false, error: 'Forbidden' }, 403);
    await next();
  };
}
```

### Frontend (Zustand Auth Store)
```typescript
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

## 7. Migration: DEV_USER_ID → Echte User-IDs

**Problem:** 429+ Stellen nutzen hardcoded `00000000-0000-0000-0000-000000000001`.

### Strategie (3 Phasen)

**Phase 1: Auth einbauen, DEV_USER_ID als Fallback**
- Middleware gibt `userId` her
- Fallback auf DEV_USER_ID wenn kein Token (Dev-Modus)
- Kein bestehender Code bricht

**Phase 2: Schrittweise Migration**
- Modul für Modul: DEV_USER_ID → `c.get('userId')` (API) / `authStore.user.id` (Frontend)
- Tests nach jeder Route

**Phase 3: DEV_USER_ID entfernen**
- Fallback deaktivieren
- Nur noch authentifizierte Requests
- Dev-Seed-Script für Test-User

**Dev-Modus:**
```
ENV: LUMEOS_DEV_MODE=true  → Auto-Login als DEV_USER_ID
ENV: LUMEOS_DEV_MODE=false → Echte Auth required
```

---

## 8. RBAC Permission System

### Scopes
```typescript
type Scope =
  | 'read:own_nutrition'     | 'write:own_nutrition'
  | 'read:own_training'      | 'write:own_training'
  | 'read:own_supplements'   | 'write:own_supplements'
  | 'read:own_recovery'      | 'write:own_recovery'
  | 'read:own_medical'       | 'write:own_medical'
  | 'read:own_goals'         | 'write:own_goals'
  | 'read:coach_clients'     | 'write:coach_plans'
  | 'read:marketplace'       | 'write:marketplace_products'
  | 'admin:users'            | 'admin:system';
```

### Coach-Client-Permissions (granular, Client-gesteuert)
```typescript
interface ClientCoachPermissions {
  coach_id: UUID;
  can_see_nutrition: boolean;
  can_see_training: boolean;
  can_see_recovery: boolean;
  can_see_supplements: boolean;
  can_see_medical: boolean;    // Sensitiv — oft abgelehnt
  can_assign_plans: boolean;
  granted_at: Date;
}
```

---

## 9. Sicherheit

| Maßnahme | Detail |
|---|---|
| Passwords | bcrypt, cost factor 12 |
| JWT | HS256, 7 Tage Expiry |
| Refresh Token | 30 Tage, HttpOnly Cookie |
| Rate Limiting | 5 Login-Versuche/Minute |
| Input Validation | Zod auf allen Endpoints |
| CORS | Nur erlaubte Origins |
| RLS | Jeder User sieht nur seine Daten |
| GDPR | Export, Löschung, Consent Management |

---

## 10. API-Endpunkte

```
POST /api/auth/register     → { email, password, displayName } → { token, user }
POST /api/auth/login        → { email, password } → { token, user }
POST /api/auth/logout       → Invalidate Token
GET  /api/auth/me           → Current User Info
PUT  /api/auth/me           → Update Profile
POST /api/auth/refresh      → Refresh Token

GET  /api/onboarding/status     → { step, completed }
PUT  /api/onboarding/step/:n    → Save step data
POST /api/onboarding/complete   → Mark completed, trigger initial setup

GET    /api/admin/users          → Paginated user list
GET    /api/admin/users/:id      → User detail
PUT    /api/admin/users/:id/role → Change role
DELETE /api/admin/users/:id      → Deactivate user
```

---

## 11. Neue UI-Screens

| Screen | Route | Beschreibung |
|---|---|---|
| Login | /#login | Email + Password |
| Register | /#register | Email + Password + Name |
| Onboarding | /#onboarding | 7-Step Wizard |
| Profil | /#profile | Profil bearbeiten |
| Account Settings | /#settings/account | Email, PW, Sprache |

### Neue Komponenten
- `LoginForm`, `RegisterForm` — Auth Pages
- `OnboardingWizard` — 7-Step Container
- `OnboardingStep1..7` — Einzelne Steps
- `AuthGuard` — Redirect zu Login wenn nicht auth'd
- `UserMenu` — Avatar + Dropdown (Profil, Settings, Logout)

---

## 12. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| BUG | 🔴 | Hardcoded DEV_USER_ID in 429+ Stellen | 🔴 KRITISCH |
| BUG | 🔴 | localStorage Auth (kein HttpOnly Cookie) | 🔴 HOCH |
| TODO | 🔴 | Auth Sprint 1: users Tabellen + API + Middleware | 🔴 HOCH |
| TODO | 🔴 | Auth Sprint 2: Onboarding Flow 7 Steps | 🔴 HOCH |
| TODO | 🔴 | Auth Sprint 3: Module-Migration DEV_USER_ID → echt | 🔴 HOCH |
| TODO | 🔴 | Auth Sprint 4: Coach-Upgrade Flow | 🔴 HOCH |
| TODO | 🟡 | Social Auth (Google, Apple) | 🟡 MITTEL |
| TODO | 🟡 | 2FA (TOTP) | 🟡 MITTEL |
| TODO | 🟢 | Biometric Auth (TouchID, FaceID) | 🟢 NIEDRIG |
