---
nr: C-338
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-70
entscheidung: E-23
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-29
commit: OFFEN
beruehrt:
  dateien: [supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql]
zahlen: null
---

# C-338 — sechs Sortierwerte fehlen live

## Befund

Aus G-70, Claude Code, 2026-08-28. **Vom Orchestrator nachgemessen.**

`[cmd]` **Die laufende `food_search` kennt vier Werte:**

    'relevance', 'protein_desc', 'kcal_asc', 'name_asc'

`[cmd]` **`unsupported_sort` steht nicht im Rumpf.**

`[read]` **Der Kettenschritt aus G-245 traegt zehn Werte und die
Rueckmeldung** — er ist gebaut und nicht eingespielt.

`[read]` **Mein Fehler in der G-245-Abnahme:** ich hatte beide Zahlen
gemessen und die falsche in den G-70-Auftrag geschrieben. **Ein
Kettenschritt ist nicht live.**

## Was zu tun ist

**Den Schritt einspielen** — oder sagen, warum nicht.

`[read]` **Die Oberflaeche sortiert seit G-70 auf der geladenen Seite,
wenn die Datenbank die Achse nicht kann**, und nennt die Grenze als
Satz. **Das ist eine gute Rueckfallebene, kein Ersatz.**

`[read]` **Und `unsupported_sort` ist heute wirkungslos:** die
Oberflaeche schickt bewusst nur Werte, die die Datenbank kennt.
**Sobald sie zehn kennt, wird die Rueckmeldung nuetzlich.**

## Auftrag

**Mitbeauftragt mit C-20 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

Erledigt am 2026-08-29. Nachweis, Vorher-/Nachhermessung und Vollsicherung: C-20, `docs/punkte/laufend_codex/nutrition-c-0020-treffer-am-wortanfang-schlagt-treffer-in-der-wortmitte.md`.

## Abnahme

**2026-08-29, mit C-20 abgenommen.** Messung und Begruendung
stehen dort.
