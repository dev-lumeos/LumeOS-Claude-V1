---
nr: G-600
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-04
agent: claudecode
beauftragt: 2026-10-04
erledigt: 2026-10-04
commit: f31585ba

braucht: [A-100]
kind_von: A-100

quellen:
  - docs/punkte/erledigt/quer-a-0100-der-gate-prueft-nicht-was-er-sagt.md

beruehrt:
  tabellen: []
  dateien:
    - packages/shared/src
    - apps/web/src
    - apps/coach/src
    - apps/web/package.json
---

# „Heute" ist an 32 Stellen der UTC-Vortag

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-600: ein einziges "heute", ortsbezogen
    Bereich: packages/shared/src/  apps/web/src/  apps/coach/src/
             apps/web/package.json
    Fremd:   supabase/ gehoert Codex. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-04

## Der Befund

`[cmd]` **32 Stellen im Produktcode bilden das Tagesdatum mit
`toISOString().slice(0, 10)`** — das ist UTC. In Bangkok (UTC+7) ist das
von 00:00 bis 07:00 **der Vortag**. Gemessen am 04.10., darunter:

    supplements/produkt-aktion.tsx:155   entry_date: new Date().toISOString()...
    supplements/stack-write.ts:691-692   heute / gestern
    training/sitzung-formular.tsx:42     heuteAls
    medical/tab-tracking.tsx:561         Absetzdatum
    goals/modale.tsx:1109
    nutrition/plan-eintraege.tsx:63      heute
    coach/src/app/page.tsx:99            heute
    profile/profile-model.ts:142         "nicht in der Zukunft"

`[read]` **Folge: wer vor 07:00 eine Einnahme, eine Sitzung oder ein
Absetzdatum eintraegt, bucht sie auf gestern.** Daneben gibt es eigene
ortsbezogene Helfer (`plans-echt.tsx` `heuteIso()`) — **zwei Definitionen
von „heute" im selben Produkt.** Die vollstaendige Liste:
`node`-Suche nach `toISOString\(\)\.slice\(0,\s*10\)` in `apps/` und
`packages/` ausserhalb von `__tests__`.

## A1 — eine Definition, alle Stellen

1. **Ein Helfer in `packages/shared`** (z. B. `tagIso(d = new Date())`),
   ortsbezogen wie `heuteIso()`. **Die bestehenden lokalen Helfer gehen
   darin auf.**
2. **Alle 32 Stellen darauf umstellen.** Wo eine Stelle bewusst UTC braucht
   (Zeitstempel, nicht Kalendertag), bleibt sie — **mit Begruendung im
   Bericht, einzeln.**
3. **ESLint-Regel** (`no-restricted-syntax` auf `.toISOString().slice(0, 10)`)
   im bestehenden Lint — kein neues Werkzeug. Der Gate faehrt `turbo run lint`.

## A2 — A-100/A3: zwei Testdateien laufen nie

`apps/web/package.json` erfasst nur `*.test.ts`. **Glob um `*.test.tsx`
erweitern**; `leer-hinweis.test.tsx` und `abschnitte.test.tsx` muessen dann
laufen. Testzahl vorher/nachher nennen.

## Nachweise

- **Uhrunabhaengig:** jede neue Probe setzt die Zeit fest (z. B. 06:30 und
  08:00 Ortszeit) statt `new Date()` zu nehmen. **Beide Zeitpunkte muessen
  denselben Kalendertag liefern.**
- **Lint rot** mit einer eingebauten `toISOString().slice(0, 10)`-Zeile, gruen
  ohne.
- `pnpm gate` gruen — **seit `7a3875c7` ohne Testcache, also echt.**

## Harte Regeln

- **Kein Commit, kein Push.** Dev-Server nicht selbst starten.
- **Kein Schreiben in die laufende Datenbank.**
- Am Bildschirm nur, wenn eine Stelle eine sichtbare Anzeige aendert.

## Abnahme — 2026-10-04, Commit `f31585ba`

`[cmd]` **Nachgemessen:** `.toISOString().slice(0, 10)` steht in `apps/` und
`packages/` nur noch in `packages/shared/src/datum/tag.ts` (Helfer plus zwei
Kommentarzeilen) und in `g600-tag.test.ts:50` (der alte Weg als Befund).
`tagIso(` 36 Aufrufe, `utcTagIso(` 22.

`[cmd]` **Lint rot in meiner eigenen Probe:** eine Wegwerfdatei mit
`new Date().toISOString().slice(0, 10)` → `no-restricted-syntax`, 1 error.
Datei entfernt.

`[cmd]` **Gate gruen, Tests ungecacht:** `web:test cache bypass` →
`# tests 2635`, `# fail 0`.

**Nachgezogen von mir:** der Lint-Cache sah die Wurzel-`.eslintrc.json`
nicht (`1582b6c1`), und der Datenbankvertrag-Waechter zaehlte einen
Zeitlimit-Abbruch unter Last als Verstoss (`506b3aeb`). Server neu
gestartet (tsconfig und Exports geaendert).
