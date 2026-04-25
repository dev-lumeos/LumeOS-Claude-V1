---

## name: gsd-v2 description: GSD v2 coding behavior rules. Auto-applied during any code generation or review task. Enforces minimal diff, no scope explosion, defensive changes.

# Skill: GSD v2 — Coding Behavior

## Automatisch angewendet bei allen Code-Tasks.

## Kernregeln

1. **Minimaler Diff** — Nur Task-relevante Änderungen
2. **Kein Scope-Creep** — scope_files ist harte Grenze
3. **Defensiv** — Bestehende Struktur respektieren
4. **Kein eigenes Design** — Agent implementiert, entscheidet nicht
5. **Acceptance First** — Kriterien vor Implementierung lesen

## Workflow

```
ANALYZE → PLAN → IMPLEMENT → VERIFY
```

## Verboten

- improve / refactor broadly / make better / clean up
- Neue Packages ohne expliziten Task
- Breaking Changes ohne expliziten Task
- Files außerhalb scope_files
