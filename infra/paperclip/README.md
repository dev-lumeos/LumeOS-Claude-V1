# Paperclip Setup

Paperclip ist die Orchestrierungsplattform für LumeOS AI Agents.

## Installation

```bash
# Clone Paperclip
git clone https://github.com/paperclipai/paperclip.git ~/paperclip
cd ~/paperclip
pnpm install

# Start Paperclip
pnpm dev
```

UI: http://127.0.0.1:3100

## MCP Integration

Bereits konfiguriert in `.claude/mcp.json`:
```json
"paperclip": {
  "command": "npx",
  "args": ["paperclip-mcp"],
  "env": {
    "PAPERCLIP_BASE_URL": "http://localhost:3100",
    "PAPERCLIP_API_KEY": "${PAPERCLIP_API_KEY}"
  }
}
```

## Agent Konfiguration

Agents werden in `agents/` definiert:

| Agent | Rolle | Heartbeat |
|-------|-------|-----------|
| governance-compiler | Governance Artefakte erstellen | 60s |
| micro-executor | WO Execution | 30s |
| review-agent | Acceptance Checks | 120s |

## Troubleshooting

- "nested sessions" Error: `unset CLAUDECODE` vor Start
- Agent antwortet nicht: Check `instructionsFilePath` und `heartbeat enabled: true`

## Referenzen

- [Paperclip GitHub](https://github.com/paperclipai/paperclip)
- [Paperclip Docs](https://paperclip.ing/)
