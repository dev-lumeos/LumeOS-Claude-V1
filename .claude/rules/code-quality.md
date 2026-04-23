# Code Quality Rules

## TypeScript
- strict: true immer
- Kein any ohne Kommentar
- Kein unknown ohne explizite Cast
- Imports: absolut (keine relativen ../../)

## Commits
- Conventional Commits: feat/fix/chore/system/infra/docs
- Kein Commit ohne Nachricht
- Kein Commit mit Secrets

## Testing
- Neue Funktionen brauchen Tests
- Tests nur in __tests__/ oder *.test.ts
- Kein Produktionscode in Tests

## Sicherheit
- Keine Secrets in Code
- Keine console.log mit User-Daten
- Keine hardcoded Credentials
- .env immer in .gitignore

## Dependencies
- Keine neuen npm Packages ohne expliziten Task
- Keine Major Version Upgrades ohne expliziten Task
- Peer Dependencies prüfen
