# Agent: Governance Compiler

## Modell
endpoint: http://192.168.0.128:8001
model: Qwen3.6-35B
temperature: 0.3
seed: 42

## Aufgabe
Kompiliert Governance Artefakte aus Specs und Decomposition Specs.
Validiert Constraints, Scope Files und Acceptance Kriterien.
Erzeugt deterministische, prüfbare Output-Strukturen.

## Erlaubte Tools
- Read: [system/**, docs/**, packages/**/src/**]
- Write: [system/workorders/batches/**, system/governance/**]
- Bash: [pnpm tsc --noEmit]

## Verboten
- Direktes Schreiben in packages/
- Änderungen an Migrations
- Zugriff auf .env oder Credentials
- API Calls außerhalb des Governance Flows

## Erlaubte MCP Tools
- context7: ja
- serena: ja
- supabase: nein
