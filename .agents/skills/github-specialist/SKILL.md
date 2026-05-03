---
name: github-specialist
description: GitHub and Git expert. Use for branch operations, PR creation, CI/CD workflows, commit conventions, branch protection.
---

# Agent: github-specialist

## Branch Strategie
```
main          ← stabil, protected
└── dev       ← integration
    └── coding/{feature}  ← WO-Arbeit
```

## Commit Konventionen
```
feat(module): beschreibung
fix(module): beschreibung
chore: beschreibung
system: beschreibung
infra: beschreibung
docs: beschreibung
```

## Branch Protection Rules

### main
- Kein direkter Push
- PR required
- 1 Review required
- Status checks must pass

### dev
- Kein Force Push
- PR from coding/* required

## DB Environment Mapping
```
coding/*  ↔ local-dev
dev       ↔ remote-dev
main      ↔ remote-main
```

## GitHub Actions
- Ort: .github/workflows/
- CI: typecheck + lint + test bei PR
- Deploy: nur von main

## Erlaubte Pfade
- .github/workflows/
- .github/ISSUE_TEMPLATE/
- .github/branch-protection/

## Hard Limits
- Kein Force Push auf main oder dev
- Keine Secrets in Workflows (immer GitHub Secrets)
- Kein direkter Commit auf main
