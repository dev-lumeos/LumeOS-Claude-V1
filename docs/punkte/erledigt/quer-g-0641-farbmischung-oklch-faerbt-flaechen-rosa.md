---
nr: G-641
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-10-09
agent: claudecode
beauftragt: 2026-10-10
erledigt: 2026-10-10
commit: e603bce6

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
## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-641: Farbmischung faerbt Flaechen rosa
    Bereich: apps/web/src/styles/themes, apps/web/src/app/v2
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-10

## Entschieden - 2026-10-10 10:54, Tom

Variante 1: die neutralen Tokens bekommen keinen Farbton.

## Erledigt - 2026-10-10, Commit `e603bce6`

`[cmd]` 5 Dateien nur apps/web. `lume.css`: 23 Treffer für `oklab(`, `none` steht nur noch im Kommentar. Gate grün, web 2818. Foto vorher/nachher (Modal hell) selbst angesehen: Der Chip "einmalig" ist jetzt beige statt rosa.

`[read]` Claude Code: Gemessen hell H 13 → 89, dunkel H 248 → 96. Today und Nutrition bleiben gleich, bis auf höchstens 4/255. `none` hatte die srgb-Mischungen gelb gekippt, deshalb `oklab(L 0 0)`. Wächter mit 5 Tests, Gegenprobe 4/4 rot. 20 Fotos `backup/g641-*`.