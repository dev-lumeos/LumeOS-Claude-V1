# TypeScript Cleanup Workorder
# Ziel: pnpm --filter @lumeos/scheduler-api exec tsc --noEmit gibt 0 Fehler

## Kontext
`pnpm --filter @lumeos/scheduler-api exec tsc --noEmit` hat 32 Fehler in 9 Dateien.
Die Fehler in `packages/agent-core/src/registry.ts` wurden bereits behoben.
Die restlichen Fehler sind pre-existing und müssen jetzt behoben werden.

## Aufgabe

### 1. `packages/types/src/nutrition/index.ts`
Fehler: Doppelter Identifier `MealType` (Zeile 4 und Zeile 43).
Fix: Die zweite Definition auf Zeile 43 entfernen. Die erste (Zeile 4) bleibt.

### 2. `packages/execution-token` — tsconfig fix
Fehler: `crypto` nicht gefunden, `Buffer` nicht gefunden.
Fix: `packages/execution-token/tsconfig.json` prüfen und `"types": ["node"]` unter compilerOptions ergänzen.
Falls kein tsconfig.json existiert, erstellen mit:
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}

### 3. `packages/shared` — @types/node + tsconfig fix
Fehler: `process` nicht gefunden in client.ts und server.ts.
Fix: `@types/node` zu devDependencies hinzufügen falls nicht vorhanden (`pnpm add -D @types/node` im Package-Verzeichnis), dann tsconfig wie in #2 ergänzen.

### 4. `packages/supabase-clients` — @types/node + tsconfig fix
Fehler: `process` nicht gefunden (6 Stellen).
Fix: Gleich wie #3.

### 5. `packages/vllm-client` — tsconfig fix
Fehler: `crypto` in triple-hash.ts nicht gefunden.
@types/node ist bereits in devDependencies. tsconfig prüfen und `"types": ["node"]` ergänzen.

## Vorgehen
1. Lese jede betroffene tsconfig.json
2. Fix: tsconfig ergänzen oder pnpm add -D @types/node im jeweiligen Package
3. Duplicate MealType entfernen
4. Nach allen Fixes: `pnpm --filter @lumeos/scheduler-api exec tsc --noEmit` ausführen
5. Ziel: 0 Fehler

## Constraints
- NIEMALS Packages löschen oder umstrukturieren
- NIEMALS bestehende Logik ändern — nur tsconfig und package.json anpassen + duplicate entfernen
- NIEMALS node_modules oder pnpm-lock.yaml manuell editieren
- NUR die genannten Dateien anfassen

## Erfolg
`pnpm --filter @lumeos/scheduler-api exec tsc --noEmit` gibt 0 Fehler.
