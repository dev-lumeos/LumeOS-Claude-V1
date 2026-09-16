---
nr: G-461
typ: fehler
modul: coach
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-458
entscheidung: null
beruehrt:
  dateien:
    - apps/coach/src/components/draft/modale.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-461 - ein nicht maskiertes Anfuehrungszeichen

## Befund

Aus G-458, Codex, 2026-09-08:

> *,,Lint: nicht maskiertes Anfuehrungszeichen in
`apps/coach/src/components/draft/modale.tsx:529`."*

`[read]` **Klein, aber es haelt `pnpm gate` auf.**

## Was zu tun ist

`[read]` **Maskieren** ? **und messen, ob es sonst noch
welche gibt.**

`[cmd]` **`apps/coach` hat 65 Proben** ? **sie laufen gruen,
der Lint nicht.**
