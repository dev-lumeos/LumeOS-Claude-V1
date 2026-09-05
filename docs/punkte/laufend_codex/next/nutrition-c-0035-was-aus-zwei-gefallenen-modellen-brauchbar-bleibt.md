---
nr: C-35
typ: entscheidung
modul: nutrition
schwere: niedrig
angelegt: 2026-08-14
braucht: []
kind_von: C-28
kinder: []
entscheidung: E-13
beruehrt:
  tabellen: []
  dateien: ["supabase/_pipeline/07_lesefunktionen/073_suchfilter.sql"]
zahlen: null
---

# C-35 - Was aus zwei gefallenen Modellen brauchbar bleibt

## Befund

(neu
  2026-08-14). Drei Reste aus C-28 und C-33, die unabhängig von jeder
  Gruppierung gelten und nicht verloren gehen dürfen.

  1. **Die Vertreterregel mit drittem Fall.** `[cmd]` Gruppen ohne
     Vertreter: 953 → **0**; eindeutige Vertreter 1.564 → 2.131. Der
     dritte Fall lautet: kein `100`, kein `000` → höchstes `sort_weight`.
     Gilt überall dort, wo aus mehreren Einträgen einer gezeigt werden
     muss. **Preis, noch offen:** `[cmd]` mehrdeutige Gruppen steigen von
     128 auf 583; bei rund 450 ist die Entscheidung verschoben, nicht
     getroffen. `[annahme]` Ein zweites Merkmal (Namenslänge, wie in
     `073_suchfilter.sql`) löst das vermutlich auf — ungemessen.
  2. **Die vier Erzeugnis-Zellen.** Saft und Nektar trennen sich von der
     Frucht (`F201`, `F603`, `F310`). Klein, aber je ein echter
     Suchfehler weniger, und ohne Kuration zu haben.
  3. **Der Zubereitungsschlüssel als Anzeigehilfe.** Auch ohne
     Gruppierung sagt er, welcher Teil eines Namens Zubereitungsangabe
     ist — also was beim Anzeigenamen wegfallen kann. `Banane roh` →
     `Banane`. Das ist genau der maschinelle Anteil, den C-29 braucht.

  **Entscheidung Toms zu den elf strittigen Zellen (2026-08-14):** zehn
  bleiben wie eingeordnet. **Die sieben Käse-Fettstufen** (`M` 200–800,
  `[cmd]` 209 Einträge) sind **keine Zubereitung** — 45 % und 50 % Fett
  i. Tr. sind für einen Kalorienzähler nicht dieselbe Ware, der
  Unterschied ist grösser als der zwischen Hähnchenbrust und Brustfilet.
  Die Einstufung war technisch begründet (sonst zerfällt `M710`) — nach
  dem Fall der Gruppierung ist dieser Grund entfallen.

## Eingeordnet, 2026-09-02

Tom fragte, ob sich dieser Punkt von selbst erledigt.

`[read]` **Nein** — **anders als G-261 gibt es hier keinen
Waechter.** `[cmd]` **Die drei Erkenntnisse stehen als Text, keine
ist gebaut oder gesichert.**

`[read]` **Und zwei sind seither vermutlich gebraucht worden:**
`[cmd]` **der Zubereitungsschluessel klingt nach dem, was
`name_display_de` leistet** (C-29, 5.014 von 7.140 weichen ab),
`[cmd]` **die Vertreterregel nach der Suchsortierung** (G-70, G-281).

`[cmd]` **C-386 misst es** — **eingeflossen oder verloren.**

## Auftrag

**Vorbereitet mit C-379 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
