---
nr: A-100
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-04
agent: claudecode
beauftragt: 2026-10-04
erledigt: 2026-10-04
commit: f31585ba

braucht: [A-98]

quellen:
  - docs/punkte/erledigt/quer-a-0098-zwei-waechter-pruefen-gestalt-statt-verhalten.md

beruehrt:
  tabellen: []
  dateien:
    - turbo.json
    - apps/web/package.json
---

# Der Gate prueft nicht, was er sagt

## A1 — erledigt: der Testcache spielte einen Fehlschlag als Erfolg ab

`[cmd]` **04.10., Commit `a1a825b0`:** Turbo meldete
`cache hit, replaying logs 24756c24c7d986f3`, das abgespielte Protokoll
enthielt `# fail 1` und `ELIFECYCLE Test failed`, Turbo zaehlte
`18 successful`, der Gate sagte gruen.

`[cmd]` **Behoben in `7a3875c7`:** `turbo.json`, `test` mit `"cache": false`.
Derselbe Hash danach: `cache bypass, force executing` →
`Failed: @lumeos/web#test`. Nach A2: `2599 pass, 0 fail`, ungecacht.

## A2 — erledigt: eine Probe war von 00:00 bis 07:00 rot

`[cmd]` `plan-kopfkarte-zeilen.test.ts` baute „heute" mit `toISOString()`
(UTC), das Produkt (`plans-echt.tsx` `heuteIso()`) rechnet ortsbezogen.
**Behoben in `238b49e6`.** Belegt im Fenster: 06:50 rot, 06:51 gruen.

## A3 — offen: zwei Testdateien laufen nie

`[cmd]` `apps/web/package.json`: `"test": "tsx --test \"src/**/__tests__/*.test.ts\""`.
**Nicht erfasst:** `app/v2/nutrition/__tests__/leer-hinweis.test.tsx`,
`app/v2/supplements/__tests__/abschnitte.test.tsx`. Glob um `*.test.tsx`
erweitern, beide Dateien muessen dann laufen (Zahl vorher/nachher).

## Abschluss — 2026-10-04

`[cmd]` **A3 erledigt in G-600 (`f31585ba`):** der Test-Glob erfasst
`*.test.tsx`, 2599 → 2635 Tests.
`[cmd]` **Dazu zwei weitere Stellen derselben Klasse, behoben:**
der Lint-Cache sah die Wurzel-`.eslintrc.json` nicht (`1582b6c1`, belegt:
Regel geaendert → cache miss), und der Datenbankvertrag-Waechter zaehlte
einen Zeitlimit-Abbruch unter Last als Verstoss (`506b3aeb`, belegt:
langsam und werfend gruen, langsam und nicht werfend rot).
