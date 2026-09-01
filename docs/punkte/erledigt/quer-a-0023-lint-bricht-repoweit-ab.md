---
nr: A-23
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-84
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-01
erledigt: 2026-09-01
commit: OFFEN
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-23 - `lint` bricht repoweit ab

## Befund

(neu 2026-08-19). Befund aus
  G-84.

  `[cmd]` **Fehlende ESLint-Konfiguration**, mit interaktiver
  Rueckfrage — in `@lumeos/web` wie in `@lumeos/admin`.

  `[read]` **Bestand vorher schon** — *„ging nur ueber den Turbo-Cache
  durch."* **Das ist dieselbe Klasse wie G-81:** Der Cache verdeckte
  einen Fehler, statt ihn zu zeigen.

  `[cmd]` **Der G-84-Agent hat Typecheck und Tests ohne Cache
  erzwungen** — 3 von 3, 393 gruen. **Das gehoert zur Nachweisregel.**

## Auftrag

**Mitbeauftragt mit A-22 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-01, mit B-20 abgenommen: eingerichtet.**

`[cmd]` **`.eslintrc.json` mit `next/core-web-vitals`, ESLint 8.57.1
und `eslint-config-next` 14.2.35 fest installiert.** `[cmd]` **Keine
Rueckfrage mehr, Lint laeuft im Gate.**

`[cmd]` **Admin Exit 0, Web 18 Fehler und 3 Warnungen, Coach 1
Fehler.** `[cmd]` **Der Gate fuehrt 22 Teilschritte statt 15 und ist
deshalb rot.**

`[read]` **Das ist der richtige Zustand** — **ein Gate, das gruen
war, weil ein Schritt nicht lief, war das halbe Gruen aus G-303.**

`[cmd]` **Und die Builds linten nicht doppelt** — Coach-Build sagt
*,,Skipping linting"*.

**Die 19 Fehler gehen als G-312.**
