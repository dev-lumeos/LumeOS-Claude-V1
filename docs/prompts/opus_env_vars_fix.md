# LUMEOS — Env Vars Fix: Persistente Konfiguration für alle Services
# Problem: ED25519_PRIVATE_KEY, SUPABASE Keys und Spark Endpoints fehlen immer wieder
# Lösung: Einmalig .env erstellen + alle Services via dotenv laden

---

## Problem Analyse

Folgende Env Vars fehlen bei jedem neuen Start:

```
ED25519_PRIVATE_KEY      = NOT SET  → Execution Token kann nicht signieren
ED25519_PUBLIC_KEY       = NOT SET  → Verification schlägt fehl
SUPABASE_URL             = NOT SET  → Keine DB Verbindung
SUPABASE_SERVICE_ROLE_KEY = NOT SET → Kein Service Client
SPARK_A_ENDPOINT         = NOT SET  → Governance Compiler weiss nicht wohin
SPARK_B_ENDPOINT         = NOT SET  → Scheduler dispatcht blind
```

**Root Cause:**
1. Kein `.env` File im Repo-Root das alle Services laden
2. Ed25519 Keys werden nicht persistiert
3. Services laden keine .env beim Start (kein dotenv Import)

---

## Aufgabe

### Schritt 1: Ed25519 Key-Pair generieren und in .env schreiben

Führe aus:

```typescript
// Einmalig: Key-Pair generieren
import { generateKeyPair } from '@lumeos/execution-token'
// oder direkt via @noble/ed25519

import { utils } from '@noble/ed25519'
const privKey = utils.randomPrivateKey()
const privKeyB64 = Buffer.from(privKey).toString('base64')
// pubKey wird aus privKey abgeleitet
```

**ODER** nutze den bestehenden Helper in `packages/execution-token/`:
```bash
npx tsx tools/scripts/generate-ed25519-keys.ts
```

Falls das Script nicht existiert, erstelle es:
`tools/scripts/generate-ed25519-keys.ts` — gibt Base64 Private + Public Key aus.

### Schritt 2: .env im Repo-Root erstellen

Erstelle `D:\GitHub\LumeOS-Claude-V1\.env` mit DIESEN Werten:

```bash
# Ed25519 Keys (generiert in Schritt 1)
ED25519_PRIVATE_KEY=<base64-private-key>
ED25519_PUBLIC_KEY=<base64-public-key>

# Supabase Local (feste Demo-Keys, öffentlich bekannt)
SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBe0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Spark Endpoints
SPARK_A_ENDPOINT=http://192.168.0.128:8001
SPARK_B_ENDPOINT=http://192.168.0.188:8001
SPARK_A_MODEL=qwen3.6-35b
SPARK_B_MODEL=qwen3-coder-30b

# Service Ports
WO_CLASSIFIER_URL=http://localhost:9000
SAT_CHECK_URL=http://localhost:9001
SCHEDULER_URL=http://localhost:9002
GOVERNANCE_COMPILER_URL=http://localhost:9003

# Workspace
WORKSPACE_ROOT=D:/GitHub/LumeOS-Claude-V1
```

**Wichtig:** Die Supabase Keys sind öffentlich bekannte Demo-Keys für lokale Entwicklung.
Sie stehen bereits in `.env.example`. Sicher in `.env` zu verwenden.

**Wichtig:** `.env` ist bereits in `.gitignore` — wird nie committed. ✅

### Schritt 3: dotenv in alle Services laden

Prüfe und update folgende `src/index.ts` Files um dotenv beim Start zu laden:

```typescript
// Ganz oben in jeder src/index.ts:
import 'dotenv/config'
// ODER
import { config } from 'dotenv'
config({ path: '../../.env' })  // Pfad zum Repo-Root .env
```

Services die dotenv brauchen:
- `services/wo-classifier/src/index.ts`
- `services/sat-check/src/index.ts`
- `services/scheduler-api/src/index.ts`
- `services/governance-compiler/src/index.ts`

**Prüfe zuerst** ob `dotenv` bereits in den package.json der Services steht.
Falls nicht: füge `"dotenv": "^16.0.0"` zu den dependencies hinzu.

### Schritt 4: Test Scripts dotenv laden

Die Test Scripts (`test-control-plane-e2e.ts`, `test-first-real-wo.ts`, `test-classifier.ts`)
sollen ebenfalls die .env laden:

```typescript
// Ganz oben:
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env') })
```

### Schritt 5: packages/execution-token dotenv laden

`packages/execution-token/src/sign.ts` liest `process.env.ED25519_PRIVATE_KEY`.
Stelle sicher dass die .env geladen ist bevor createExecutionToken() aufgerufen wird.

### Schritt 6: Verifizierung

Nach dem Setup:

```bash
# Test: Keys verfügbar?
npx tsx -e "
import { config } from 'dotenv'
config()
console.log('ED25519_PRIVATE_KEY:', process.env.ED25519_PRIVATE_KEY ? 'SET ✅' : 'NOT SET ❌')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET ✅' : 'NOT SET ❌')
console.log('SPARK_A_ENDPOINT:', process.env.SPARK_A_ENDPOINT ? 'SET ✅' : 'NOT SET ❌')
"
```

Alle 3 müssen `SET ✅` zeigen.

### Schritt 7: .env.example aktualisieren

Update `.env.example` mit allen neuen Keys (OHNE echte Werte):

```bash
# Ed25519 Keys — generieren mit: npx tsx tools/scripts/generate-ed25519-keys.ts
ED25519_PRIVATE_KEY=your-base64-private-key
ED25519_PUBLIC_KEY=your-base64-public-key

# Supabase Local Development Keys
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Spark Endpoints
SPARK_A_ENDPOINT=http://192.168.0.128:8001
SPARK_B_ENDPOINT=http://192.168.0.188:8001

# Services
WO_CLASSIFIER_URL=http://localhost:9000
SAT_CHECK_URL=http://localhost:9001
SCHEDULER_URL=http://localhost:9002
GOVERNANCE_COMPILER_URL=http://localhost:9003

WORKSPACE_ROOT=/path/to/LumeOS-Claude-V1
```

---

## Reihenfolge

```
1. generate-ed25519-keys.ts erstellen + ausführen
2. .env im Repo-Root erstellen mit allen Keys
3. dotenv in alle 4 Services laden
4. dotenv in alle Test Scripts laden
5. Verifizierung: alle Keys SET ✅
6. .env.example updaten
```

## Danach

Wenn alles grün: Pipeline-3 E2E Test nochmals ausführen.
Die Env Vars sollten jetzt persistiert sein — kein manuelles Setzen mehr nötig.
