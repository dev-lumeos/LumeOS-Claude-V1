# API Design Rules

## Hono Routes
- Alle Routes haben Auth Middleware
- Input immer via Zod validieren
- Response Types aus packages/contracts/
- Konsistentes Error Format:
  { error: string, code: string, details?: any }

## Versioning
- API Versioning: /v1/ prefix
- Breaking Changes = neuer Version Prefix
- Alte Version mind. 1 Sprint verfügbar halten

## HTTP Standards
- GET: nur lesen, kein State ändern
- POST: erstellen
- PUT/PATCH: updaten
- DELETE: soft delete (deleted_at setzen)
- Kein hard delete ohne expliziten Task

## Auth
- JWT via Supabase Auth
- Session validieren in Middleware
- Service Role nur Server-to-Server
- Kein Auth Bypass unter keinen Umständen

## Rate Limiting
- Public Endpoints: Rate Limit Pflicht
- Auth Endpoints: strikteres Limit
- AI Endpoints: Token Budget Limit
