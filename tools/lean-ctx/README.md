# lean-ctx Setup

lean-ctx reduziert Token-Verbrauch um bis zu 99% durch intelligente Kompression.

## Installation

```bash
# Via Cargo
cargo install lean-ctx

# Via npm
npm install -g lean-ctx

# Via Homebrew
brew install lean-ctx
```

## Setup für Claude Code

```bash
# Auto-Setup für alle erkannten AI Tools
lean-ctx setup

# Oder manuell für Claude Code
lean-ctx init --agent claude-code
```

## MCP Integration

Bereits konfiguriert in `.claude/mcp.json`:
```json
"lean-ctx": {
  "command": "lean-ctx",
  "args": ["mcp"],
  "env": {
    "LEAN_CTX_PROJECT": "lumeos"
  }
}
```

## Read Modes

| Mode | Token Reduction | Verwendung |
|------|----------------|------------|
| `map` | ~90% | Dependencies + API Signatures |
| `signatures` | ~85% | Nur Function/Class Signatures |
| `aggressive` | ~60% | Syntax-stripped Content |
| `entropy` | ~70% | Shannon Entropy Filtered |
| `full` | 0% | Vollständiger Inhalt |

## Verwendung

```bash
# File mit spezifischem Mode lesen
lean-ctx read --mode map packages/wo-core/src/schema.ts

# Cache Stats anzeigen
lean-ctx stats

# Session Metrics
lean-ctx metrics
```

## Token Savings

- MCP Cache Hits: ~99% Reduktion (13 Tokens pro Re-Read)
- Intent-aware Compression: Passt sich Task-Typ an
- Cross-Session Memory (CCP): Cached Patterns

## Konfiguration

Siehe `lean-ctx.toml` für Projekt-Settings.

## Referenzen

- [lean-ctx GitHub](https://github.com/yvgude/lean-ctx)
- [lean-ctx Docs](https://leanctx.com/)
