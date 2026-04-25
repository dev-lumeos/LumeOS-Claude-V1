# Branch Policy V1 — LumeOS
# Status: AKTIV
# Erstellt: 24. April 2026

---

## Branches

```
main          → Production-ready. Nur via PR. Nie direkt pushen.
dev           → Integration Branch. Feature Branches mergen hier rein.
feature/*     → Neue Features. Von dev abzweigen.
fix/*         → Bugfixes. Von dev oder main abzweigen.
wo/*          → Work Order Branches. Vom WO Classifier automatisch erstellt.
infra/*       → Infrastruktur-Änderungen (vLLM, Docker, CI).
docs/*        → Nur Dokumentation.
```

---

## Schutzregeln (implementiert via .github/workflows/branch-protection.yml)

```
main:
  - Direkte Pushes verboten → git push --force blockiert via pre-tool.ps1 Hook
  - Mindestens 1 Review nötig (wenn Team > 1 Person)
  - CI muss grün sein (wenn CI aktiviert)

dev:
  - Direkte Pushes erlaubt (solo developer)
  - Kein force-push
```

---

## Work Order Branches

Wenn der Orchestrator (Port 9005, kommt mit Spark C) aktiv ist:

```
WO-ID: WO-20260424-001
→ Branch: wo/WO-20260424-001
→ Erstellt automatisch von dev ab
→ Nach Acceptance: merge → dev
→ Nach Review: merge → main
```

**Aktuell (manuell):**
```bash
git checkout dev
git checkout -b wo/WO-YYYYMMDD-NNN
# ... Work Order ausführen ...
git commit -m "wo(WO-YYYYMMDD-NNN): <title>"
git push origin wo/WO-YYYYMMDD-NNN
```

---

## Commit Message Format

```
<type>(<scope>): <beschreibung>

Types:
  feat     → Neues Feature
  fix      → Bugfix
  wo       → Work Order Execution
  docs     → Dokumentation
  infra    → Infrastruktur (vLLM, Docker, CI)
  refactor → Refactoring ohne Feature/Fix
  test     → Tests
  chore    → Maintenance

Scope (optional):
  classifier, scheduler, sat-check, governance,
  spark-a, spark-b, supabase, grafana, wo-core, ...

Beispiele:
  feat(classifier): add module=cross routing rule
  fix(scheduler): correct spark_a→spark-a mapping
  wo(WO-20260424-001): implement env var support in NODE_PROFILES
  docs(system): add branch policy
  infra(spark-b): update vLLM gpu-memory-utilization to 0.55
```

---

## Merge-Strategie

```
feature/* → dev:   Squash Merge (saubere History)
wo/*      → dev:   Squash Merge (1 Commit pro WO)
dev       → main:  Merge Commit (keine Squash, History erhalten)
fix/*     → main:  Cherry-pick wenn hotfix nötig
```

---

## Tags

```
v0.1.0  → Control Plane operativ (Phase 1-7)
v0.2.0  → Wenn Spark C+D integriert
v1.0.0  → LumeOS App live (Nutrition, Training etc.)

Format: vMAJOR.MINOR.PATCH
Tag beim Release: git tag -a v0.1.0 -m "Control Plane operativ"
```

---

## Was via pre-tool.ps1 Hook blockiert wird

```
git push --force      → HARD STOP
git push -f           → HARD STOP
git reset --hard      → HARD STOP
```

Alle anderen git Operationen sind erlaubt.
