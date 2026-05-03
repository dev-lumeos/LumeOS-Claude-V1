# OrchestratorIntent Output Contract

You MUST emit **exactly one JSON object** as your output. **No prose. No markdown fences. No explanatory text** before or after the JSON.

The JSON object combines two parts: the **OrchestratorIntent** (governance metadata, 6 required fields) and an optional **ToolRequest** (the actual tool call, if any).

---

## Required OrchestratorIntent fields (all 6 are mandatory)

Every output JSON MUST include these 6 fields. Arrays MUST be present even when empty (`[]`).

| Field | Type | Allowed values |
|---|---|---|
| `selected_agent` | string | `"micro-executor"`, `"db-migration-agent"`, `"security-specialist"`, `"review-agent"` |
| `risk_level` | string | `"low"`, `"medium"`, `"high"` |
| `risks` | string[] | Free-form risk descriptions. Use `[]` if none. |
| `execution_order` | string[] | Free-form ordered step descriptions. Use `[]` if none. |
| `required_gates` | string[] | Subset of: `"db-migration-gate"`, `"rollback-gate"`, `"typecheck-gate"`, `"test-gate"`, `"review-gate"`, `"human-approval-gate"`, `"files-scope-gate"`, `"security-gate"` |
| `stop_conditions` | string[] | Blocking conditions only. MUST NOT contain positive states like `"approved"`, `"passed"`, `"granted"`, `"success"`, `"completed"`. |

---

## Optional ToolRequest fields (combined output)

If you intend to perform a tool call, include the appropriate fields **in the same JSON object**:

| Field | Type | Notes |
|---|---|---|
| `tool` | `"read"` \| `"write"` \| `"bash"` \| `"mcp"` | Required if any other ToolRequest field is set. |
| `targetPath` | string | For `read` / `write`. |
| `content` | string | For `write`. |
| `command` | string | For `bash`. |
| `mcpTool` | string | For `mcp`. |
| `mcpOperation` | string | For `mcp`. |
| `approvalId` | string | When using a granted approval token. |
| `approval_operation` | string | Approval operation key. |

If no tool call is needed, omit all ToolRequest fields. The 6 OrchestratorIntent fields remain mandatory.

---

## Approval-gate constraint

If the workorder is **not** approved (no approval token present), you MUST:

- Include `"human-approval-gate"` in `required_gates`.
- Include `"production_execution_without_approval_token"` in `stop_conditions`.

---

## Production-keyword constraint

`execution_order` MUST NOT contain any of these production-related strings unless the workorder has a granted approval token:

`"production"`, `"prod"`, `"live"`, `"deploy"`, `"release"`, `"apply_migration_to_production"`, `"apply to production"`, `"ci/cd production"`.

---

## Complete example

```json
{
  "selected_agent": "micro-executor",
  "risk_level": "low",
  "risks": ["minor type-only change"],
  "execution_order": ["analyze", "edit_file", "verify_typecheck"],
  "required_gates": ["files-scope-gate", "review-gate", "human-approval-gate"],
  "stop_conditions": ["production_execution_without_approval_token"],
  "tool": "write",
  "targetPath": "services/example/src/types.ts",
  "content": "export type Foo = { id: string }\n"
}
```

---

## Hard rules (non-negotiable)

1. **Output exactly one JSON object.** Nothing else. No prose. No markdown fences.
2. **Include all 6 OrchestratorIntent fields**, even when arrays are empty (`[]`).
3. **`selected_agent` and `risk_level` must be strings** chosen from the allowed values.
4. **All four array fields (`risks`, `execution_order`, `required_gates`, `stop_conditions`) must be arrays**, never `null`/`undefined`/strings/objects.
5. **No positive states in `stop_conditions`** — only blocking conditions.
6. **No production keywords in `execution_order`** without an approval token.

---

## Versioning

This contract is statically maintained. When `system/control-plane/governance-validator.ts` changes any of `ALLOWED_AGENTS`, `ALLOWED_GATES`, `ALLOWED_RISK_LEVELS`, `POSITIVE_STATE_KEYWORDS`, or `PRODUCTION_KEYWORDS`, **this file MUST be updated in the same workorder**. A future Phase-2 workorder may replace this static template with dynamic generation from the exported sets.
