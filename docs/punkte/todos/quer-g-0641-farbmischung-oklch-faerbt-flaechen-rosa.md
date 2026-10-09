---
nr: G-641
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-10-09

braucht: []
kind_von: G-628

quellen:
  - apps/web/src/styles/themes/lume.css

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
    - apps/web/src/styles/themes/lume.css
---

# Farbmischung in oklch färbt Flächen rosa

## Befund

`[read]` Claude Code, G-628 Teil 4: `color-mix(in oklch, …)` mit der neutralen Fläche ergibt Rosa statt eines blassen Farbtons. Im Messziel-Dialog ist das auf srgb umgestellt. Dieselbe Mischung färbt weitere Flächen im Goals-Bereich, z. B. den gewählten Chip "einmalig".

`[cmd]` `rg -c oklch`: `lume.css` 50 Treffer, in goals u. a. `modale.tsx` 9, `phase-editor.tsx` 8, `mockup-referenz.tsx` 5, `fehlende-kacheln.tsx` 4.

## Was zu tun ist (Claude Code)

Ursache am Token klären: Ist es eine neutrale Fläche mit Farbton (Hue) bei Chroma 0, die oklch falsch interpoliert? Dann einmal zentral im Theme beheben statt je Stelle. Belegen mit Bildschirmfotos hell und dunkel, vorher und nachher.