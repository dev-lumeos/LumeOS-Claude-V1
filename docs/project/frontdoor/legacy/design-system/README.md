# Design System Legacy Discussion Copy

UNTRUSTED DISCUSSION MATERIAL.

This folder is NOT SSOT, NOT CURRENT PRODUCT TRUTH IN THIS CONTEXT, NOT EXECUTABLE, and NOT QUEUE-RELEASED.

This folder is used as research and context material for future OpenClaw discussions.

Even if copied material contains current truths, within the Frontdoor legacy area it remains discussion material only.

Any promotion into product truth requires the Frontdoor flow:

```text
analysis -> summary -> source refs -> drift check -> documentation_impact -> approval -> product intent/spec/workorder draft
```

---

## Copied Source README
# LUMEOS Design System

> Extrahiert via AST-Analyse (Claude Code Sonnet) aus dem alten LUMEOS-Repo · 2026-04-27 Status: **DRAFT** — Grundlage für V2 Design System

---

## Struktur

```
docs/design-system/
  ├── README.md              ← Diese Datei
  ├── DESIGN_CONCEPT.md      ← Vollständiges Konzept-Dokument (DRAFT)
  ├── tokens/
  │   ├── colors.json        ← Farb-Tokens (Brand, Semantic, Module-Accents, Gradients)
  │   ├── typography.json    ← Typo-Scale, Weights, Patterns, Animations
  │   └── spacing.json       ← Spacing, Border-Radius, Layout, Effects
  └── components/
      └── inventory.md       ← Vollständiges Komponenten-Inventar (534 TSX-Dateien)
```

---

## Wichtigste Erkenntnisse

#BefundAuswirkung1**Dual Theme Problem** — `@lumeos/ui` (dark zinc) vs Module-UI (light gray)Kein Runtime Dark Mode möglich2**534 TSX-Dateien**, 13 Module, 6 UI-PrimitivesGroße Codebasis, viele Duplikate3**Kein shadcn/ui** — eigenes `@lumeos/ui` PackageEigene Maintenance-Last4**Emoji + lucide-react** gemischtKeine einheitliche Icon-Strategie5**Keine CSS Custom Properties** — hardcoded TailwindTheme-Switching schwer nachrüstbar6**CardSection-Pattern** 66+ mal dupliziertSofort extrahierbar als Komponente

---

## Nächste Schritte V2 (priorisiert)

- \[ \] **P1** CSS Custom Properties (HSL-Vars) einführen → `packages/tokens`
- \[ \] **P1** `@lumeos/ui` theme-aware machen (light + dark)
- \[ \] **P1** `GRADIENTS`-Konstante zentralisieren
- \[ \] **P2** `CardSection`-Komponente extrahieren (66+ Duplikate)
- \[ \] **P2** Icon-Strategie festlegen: Emoji für Nav/Header, lucide für UI-Actions
- \[ \] **P3** `text-[10px]` als Token `micro` in tailwind.config promoten
- \[ \] **P3** `space-y-*` vs `gap-*` Konvention vereinheitlichen
