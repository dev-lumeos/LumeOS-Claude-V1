# LUMEOS — Opus Phase 7: Erster echter WO Durchlauf
# Ziel: Ein echter Work Order durch den kompletten Lifecycle
# Von: Governance-Compiler → SAT-Check → Token → Spark B → triple_hash

---

## Kontext

Die Control Plane läuft:
- SAT-Check: Port 9001
- Scheduler: Port 9002
- Supabase: localhost:54321
- Spark A: http://192.168.0.128:8001 (Qwen3.6-35B-FP8, Governance-Compiler)
- Spark B: http://192.168.0.188:8001 (Qwen3-Coder-30B-FP8, Micro-Executor, Temp 0.0)

Phase 1-6 sind abgeschlossen. E2E Test 5/5 bestanden.

---

## AUFGABE

Führe den ersten echten Work Order durch den kompletten Lifecycle.

### WO-7.1: Governance-Compiler Prompt erstellen

Erstelle `system/prompts/governance/governance_compiler_prompt.md`:

Dieser Prompt wird an Spark A (Qwen3.6-35B) gesendet um aus einem
Macro-WO ein valides GovernanceArtefaktV3 zu kompilieren.

Der Prompt muss:
- Den Macro-WO als Input nehmen
- Die Constraints extrahieren (target_files, forbidden_patterns, required_types)
- Ein valides GovernanceArtefaktV3 YAML ausgeben
- Das Schema aus system/control-plane/governance_artefakt_schema_v3.md einhalten

### WO-7.2: Governance-Compiler Service

Erstelle `services/governance-compiler/` als neuer Hono Service auf Port 9003:

```
POST /compile
  Input:  { macro_wo: MacroWO }
  Output: { artefakt: GovernanceArtefaktV3 }

Intern:
  1. Sende Macro-WO an Spark A (http://192.168.0.128:8001)
     mit governance_compiler_prompt
  2. Parse den Output als GovernanceArtefaktV3
  3. Berechne artefakt_hash (SHA-256)
  4. Return Artefakt
```

### WO-7.3: Erster echter WO

Wähle einen einfachen aber echten Task für den ersten WO:

**Task:** "Fix the NODE_PROFILES endpoint URLs to use environment variables 
instead of hardcoded hostnames in packages/agent-core/src/registry.ts"

Das ist ein echter, kleiner, sicherer Task der:
- Nur 1 File ändert
- Klar definiert ist
- Einfach zu verifizieren ist
- Keine DB-Änderungen braucht

### WO-7.4: End-to-End Ausführung

Schreibe `tools/scripts/test-first-real-wo.ts` der:

```
1. Macro-WO definieren (Task oben)
2. → POST /compile (Port 9003, Spark A)
   → GovernanceArtefaktV3 erhalten
3. → POST /check (Port 9001, SAT-Check)
   → SATCheckOutput: pass/reject
4. → createExecutionToken() (Ed25519 signiert)
5. → WO in Supabase schreiben (workorders Tabelle)
6. → POST zu Spark B (Port 8001)
   mit: artefakt + token + determinism params
   temperature: 0.0, seed: 42, top_p: 1.0
7. → triple_hash Verification (3 sequentielle Calls)
8. → Ergebnis in Supabase speichern
9. → Report ausgeben
```

### WO-7.5: Governance-Compiler Prompts vervollständigen

Erstelle `system/prompts/governance/` mit:

- `governance_compiler_prompt.md` — Haupt-Compiler Prompt
- `constraint_extractor_prompt.md` — Constraint-Extraktion
- `acceptance_generator_prompt.md` — Acceptance Criteria generieren

---

## REIHENFOLGE

```
WO-7.1: Governance Compiler Prompt    ← zuerst (Kern)
WO-7.2: Governance Compiler Service   ← Service der Spark A aufruft
WO-7.3: Task definieren               ← kleiner echter Task
WO-7.4: E2E Script                    ← alles zusammen
WO-7.5: Prompts vervollständigen      ← Dokumentation
```

---

## WICHTIG

- Starte die Services bevor du den E2E Test ausführst:
  ```
  pnpm --filter @lumeos/sat-check dev          (Port 9001)
  pnpm --filter @lumeos/scheduler-api dev      (Port 9002)
  pnpm --filter @lumeos/governance-compiler dev (Port 9003)
  ```

- Spark A und B laufen bereits — kein Setup nötig

- Bei Governance-Compiler Output: Validiere das YAML gegen
  packages/wo-core/src/governance.ts (GovernanceArtefaktV3 Interface)

- triple_hash: 3 Calls an Spark B mit IDENTISCHEN Parametern
  (temperature: 0.0, seed: 42, top_p: 1.0, top_k: 1)
  Vergleiche den generierten Code — muss bitidentisch sein

- Wenn triple_hash fehlschlägt: Logge es, gib Analyse aus,
  aber lass den Test trotzdem weiterlaufen mit "DETERMINISM_WARNING"

- Ziel: Erster grüner E2E Durchlauf mit echtem Code-Output

Frage wenn unklar — aber dann starte mit WO-7.1.
