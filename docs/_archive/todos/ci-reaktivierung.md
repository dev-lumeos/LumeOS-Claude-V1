# TODO: CI Pipeline Reaktivierung
# Status: OFFEN
# Erstellt: 23. April 2026
# Deaktiviert wegen: aktive Entwicklungsphase, Services nicht in GitHub Actions verfügbar

---

## Wann reaktivieren?

CI reaktivieren wenn:
- [ ] Alle Packages haben `typecheck` Script in package.json
- [ ] Alle Packages haben `lint` Script in package.json  
- [ ] Alle Packages haben `test` Script mit echten Tests
- [ ] pnpm-lock.yaml ist stabil (kein --frozen-lockfile Fehler)
- [ ] Supabase Migrations laufen ohne lokale Services

---

## Checklist vor Reaktivierung

### 1. TypeScript Check vorbereiten
```bash
# In jedem Package prüfen ob tsconfig.json existiert
# und typecheck script in package.json vorhanden ist:
pnpm typecheck  # muss lokal durchlaufen ohne Fehler
```

### 2. Lint vorbereiten
```bash
# ESLint Config prüfen (.eslintrc oder eslint.config.js)
pnpm lint  # muss lokal durchlaufen ohne Fehler
```

### 3. Tests vorbereiten
```bash
# Unit Tests für:
# - packages/wo-core (Schema Validierung)
# - packages/execution-token (Sign/Verify)
# - services/sat-check (Check Logic)
# Mock für: Supabase, Spark A/B Endpoints
pnpm test  # muss lokal durchlaufen ohne Fehler
```

### 4. GitHub Secrets setzen
```
SUPABASE_URL          → Supabase Cloud URL (wenn verfügbar)
SUPABASE_SERVICE_KEY  → Supabase Service Role Key
ED25519_PRIVATE_KEY   → Base64 Private Key für Tests
```

### 5. CI wieder aktivieren
In `.github/workflows/ci.yml`:
```yaml
# Ersetze:
on:
  workflow_dispatch:

# Mit:
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```

---

## Prompt für Opus wenn bereit

```
Lies docs/todos/ci-reaktivierung.md und führe die Checklist durch.

Ziel: GitHub Actions CI Pipeline reaktivieren mit:
- TypeScript Check (alle Packages)
- ESLint (alle Packages)  
- Unit Tests (wo-core, execution-token, sat-check)

Mock-Strategy für externe Services:
- Supabase: mock via jest/vitest
- Spark A/B: mock HTTP responses
- Ed25519: echte Keys aus GitHub Secrets

Nach Abschluss: on: workflow_dispatch → on: push/pull_request
```
