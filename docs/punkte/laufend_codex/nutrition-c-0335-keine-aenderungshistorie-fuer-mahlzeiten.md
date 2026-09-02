---
nr: C-335
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: C-334
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.meal_items, nutrition.nutrient_reference_values]
zahlen: null
---

# C-335 — keine Aenderungshistorie fuer Mahlzeiten und Referenzwerte

## Befund

Aus C-334, Codex, 2026-08-28.

`[cmd]` **`nutrition` fuehrt keine Aenderungs-Historie fuer
`meal_items` oder `nutrient_reference_values`** — es gibt
`water_logs`, sonst nichts.

`[read]` **Am 28.08. liess sich eine vermutete Datenverschiebung nur
deshalb ausschliessen, weil `meal_items` ein `updated_at` traegt**
und dieses seit dem 23.08. stillsteht.

`[read]` **Bei einem `UPDATE`, das den Zeitstempel nicht pflegt, oder
bei einer Aenderung an den Referenzwerten waere das nicht moeglich
gewesen.**

## Warum das zaehlt

`[read]` **Die Bewertung eines Tages haengt an zwei Bestaenden:** was
gegessen wurde und woran es gemessen wird. **Aendert sich einer,
aendert sich das Ergebnis rueckwirkend fuer alle Tage.**

`[read]` **Ein Nutzer, der seine Vitamin-A-Bilanz von gestern anders
sieht als heute, kann nicht erfahren warum** — und wir auch nicht.

`[cmd]` **Der Coach-Bereich fuehrt drei Aenderungsprotokolle**
(`autonomy_change_log`, `permission_change_log`,
`relationship_change_log`) mit je sieben bis acht Zeilen. `[read]`
**Dort galt es offenbar als noetig, hier nicht.**

## Offen

`[read]` **Ob eine Historie noetig ist, haengt daran, wer die
Referenzwerte aendern darf.** `[cmd]` Sie kommen heute aus der Kette,
nicht aus der Oberflaeche. **Solange das so bleibt, reicht
moeglicherweise die Kette selbst als Nachweis.**

## Auftrag

**Mitbeauftragt mit C-389 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.
