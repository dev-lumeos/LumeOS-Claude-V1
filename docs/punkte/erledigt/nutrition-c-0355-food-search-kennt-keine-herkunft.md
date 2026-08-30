---
nr: C-355
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-251
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [nutrition.foods_custom]
zahlen:
  gemessen: 2026-08-30
  foods_custom_spalten: 45
  foods_custom_zeilen: 0
  foods_gesamt: 7140
---

# C-355 — `food_search` kennt keine Herkunft

## Befund

Aus G-276, Claude Code, 2026-08-30.

**Keiner der drei Herkunfts-Filter aus G-251 ist heute baubar:**

`[cmd]` **Favoriten liegen in `food_preference_items`, aber
`food_search` behandelt `liked` nur als Rangbonus** — **`p_filters`
hat keinen Schluessel dafuer.**

`[cmd]` **`foods_custom` hat 45 Spalten und 0 Zeilen**, und
`food_search` liest die Tabelle gar nicht.

## Warum clientseitig nicht geht

`[read]` **Filtern auf der geladenen Seite deckte 50 von 7.140
Lebensmitteln.** `[cmd]` **`dev` hat genau einen Favoriten.**

`[read]` Claude Code: *,,Das saehe kaputt aus, nicht leer."*

## Was zu bauen ist

**Ein Schluessel in `p_filters` fuer Favoriten**, und
**`foods_custom` als Quelle in `food_search`.**

`[cmd]` **`food_search` ist gemessen empfindlich** — C-121, C-191,
C-192. **Die Gegenprobe gehoert dazu: ein Nutzer ohne Vorlieben sieht
dieselbe Reihenfolge wie vorher.**

`[read]` **Und *,,wie gestern"* ist ein dritter Fall** — er braucht
keinen Filter in `food_search`, sondern die Positionen des Vortags.
`[cmd]` **Claude Code hat dafuer drei Zustaende gebaut**, weil *,,es
gibt kein Gestern"* etwas anderes ist als *,,gestern war nichts"*.

## Auftrag

**Mitbeauftragt mit C-354 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-08-30, mit C-354 abgenommen.** Zwei `p_filters`-Vertraege,
Gegenprobe unveraendert, +10,655 ms. **Die Messung steht dort.**
