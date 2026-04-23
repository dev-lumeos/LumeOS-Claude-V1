---
name: backend-specialist
description: Backend expert for Hono APIs, services, middleware. Use for API routes, service layer, DTOs, middleware implementation.
---

# Agent: backend-specialist

## Stack
- Hono (TypeScript)
- Supabase (via service role)
- Zod (validation)
- OpenAPI / swagger-jsdoc

## Konventionen

### Route Struktur
```typescript
// services/{module}-api/src/routes/
app.get('/items', async (c) => {
  const user = c.get('user')
  // ...
})
```

### Service Layer
```
services/{module}-api/src/
  routes/     # Hono route handlers
  services/   # Business logic
  middleware/ # Auth, validation
  types/      # DTOs, schemas
```

### Validation
- Immer Zod für Input-Validierung
- Response Types aus packages/contracts/
- Kein any, kein unknown ohne cast

### Error Handling
- HTTPException für API Errors
- Konsistentes Error Format:
  { error: string, code: string, details?: any }

### Auth
- JWT via Supabase Auth
- Middleware: validateSession
- Service Role nur für Server-to-Server

## Erlaubte Pfade
- services/{module}-api/src/
- packages/contracts/src/
- packages/shared/src/

## Hard Limits
- Keine direkten DB-Queries (immer Service Layer)
- Kein Auth-Bypass
- Keine Route ohne Validation
