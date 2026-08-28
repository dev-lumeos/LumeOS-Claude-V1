---
nr: G-242
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-242 — die Goals-Rechenwerke liegen in der Pro-Datei

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **`module-goals-pro.jsx` (906 Zeilen)** traegt Phase State
Machine, Adaptive TDEE, Cross-Module Contributions, Bottleneck,
Achievement Probability, Ratios, IFBB Poses und Weekly Report —
**nach `PHASE_MODELS.md`.**

`[read]` **Wer nur `module-goals.jsx` liest, findet sie nicht.**
Dasselbe Muster wie bei `module-training-spec.jsx` und
`module-recovery-engine.jsx`, das `00-QUELLEN.md` bereits benennt.

`[cmd]` **Gebaut:** `phase-editor.tsx` 45 KB, `tab-phase.tsx` 36 KB.
`[read]` **Der Phasenteil ist offenbar weit** — der Abgleich steht
aus.
