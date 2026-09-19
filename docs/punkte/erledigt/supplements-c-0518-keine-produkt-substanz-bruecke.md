---
nr: C-518
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-475
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 56a6977a
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-18
---

# C-518 – keine Produkt-Substanz-Brücke

## Bericht (2026-09-18)

**Gemessen, nicht gebaut.** Die Brücke `product_contents.supplement_id` existiert: `81.326 von 121.959` On-Market-Produkten (`66,7 %`) haben mindestens eine aufgelöste Substanz. Sie beantwortet aber nicht, welche Substanz ein Produkt **meint**.

### A1 – Stack heute

`stack_items` hat `supplement_id → supplements.supplements`; eine Produktspalte gibt es nicht. Daneben sind `custom_name`, Dosis, Frequenz und Timing vorhanden. Live: `10` aktive Stack-Einträge, davon `7` mit Substanz-ID und `3` nur als Freitext. Kein Intake-Log trägt zugleich `stack_item_id` und `supplier_product_id` (`0 von 810`).

Die sieben Katalog-Stackeinträge hätten über `product_contents` jeweils Produktkandidaten, aber **kein einziger eindeutig**: zwischen `1.478` und `29.004` Produkte je Stoff. Eine hypothetische Produktspalte wäre folglich für `0 von 10` bestehenden Einträgen automatisch, für `7` mehrdeutig und für `3` Freitext-Einträge nicht rückfüllbar.

### A3 – vier Zweck-Kandidaten an elf Produkten

`größte Menge` vergleicht nur Masseneinheiten (g→mg, mg, µg→mg); Kalorien und IU werden nicht verglichen. `erste Zeile` meint die erste bereits aufgelöste Etikettenzeile. `Kategorie` kann lediglich eine Produktart benennen, nicht eine Katalog-Substanz. `Name/Alias` nutzt vorhandene Substanz-Aliase im Produktnamen.

| Produkt | Größte aufgelöste Menge | Erste aufgelöste Zeile | Mengen-Kategorie | Name/Alias | Befund |
|---|---|---|---|---|---|
| ON Gold Standard Whey | Kalium | Calcium | protein | Whey Protein | Menge/erste Zeile verfehlen Protein; Name trifft. |
| Caffeine 200 mg | Caffeine | Caffeine | non-nutrient | Caffeine | Alle außer Kategorie eindeutig. |
| Collagen Protein Broth | Collagen | Collagen | protein | Collagen | Alle außer Kategorie eindeutig. |
| Creatine HMB | Creatine monohydrate | Vitamin D3 | non-nutrient | Creatine + HMB | Erste Zeile falsch, Name mehrdeutig. |
| Fish Oil 1000 mg | EPA | EPA | fat | Omega-3 (EPA/DHA) | Wirkstoffbestandteil statt Produktzweck; brauchbar, aber nicht identisch. |
| Vegan Liquid Iron Berry | Iron | Iron | mineral | Iron | Menge und erste Zeile treffen. |
| Calcium Magnesium Zinc | Calcium | Calcium | mineral | Calcium + Magnesium + Zinc | Drei gleichrangige Stoffe; kein einzelner Zweck. |
| Multivitamin | Vitamin B3 | Vitamin A | sugar | – | Kein Einzelzweck; Kategorie führt sogar zu Zucker. |
| Pre-Workout | Creatine nitrate | Creatine nitrate | blend | – | Mehrwirkstoffprodukt; kein einzelner Zweck. |
| Probiotic with Pectin | L. acidophilus | L. acidophilus | blend | – | Bakterienmischung; eine Spezies wäre geraten. |
| Calcium plus Vitamin D | Calcium | Vitamin D3 | sugar | Calcium + Vitamin D3 | Zwei gleichrangige Stoffe; Kategorie führt zu Zucker. |

Bei den sechs Produkten mit einem klaren, einzelnen Namenhinweis treffen die größte Menge fünfmal; Whey bleibt der relevante Gegenbeweis. Die erste aufgelöste Zeile trifft viermal. `ingredient_category` liefert in keinem der elf Fälle eine eindeutige Substanz-ID. Der Produktname liefert fünf eindeutige Treffer, drei korrekte Mehrfachtreffer und drei keine Zuordnung; er ist ein guter Vorschlag, aber keine sichere Regel.

## Empfehlung für Toms Entscheidung

`stack_items` braucht **eine optionale Produktspalte zusätzlich zur optionalen Substanz**, nicht eine abgeleitete „Hauptsubstanz“.

Ein konkretes Produkt ist die einzig sichere Antwort auf „dasselbe Supplement“ und bewahrt Marke, Rezeptur und Nährwerte. Die Substanz bleibt für Regeln, Interaktionen und Gruppenauswertungen wichtig, darf bei Mehrstoffprodukten aber leer oder mehrfach sein. Eine automatische Wahl aus Menge, Reihenfolge, Kategorie oder Name würde insbesondere Whey, Multi-, Pre-Workout-, Probiotika- und Kombiprodukte falsch vereinfachen. Produkt und Substanz müssen daher unabhängig auswählbar bleiben; eine spätere vorgeschlagene Substanz darf nur nach Nutzerbestätigung geschrieben werden.

## A5 – keine Umsetzung

Keine Migration, Pipeline oder App-Datei wurde für C-518 geändert. `git status -- supabase` war sauber; der vorhandene C-519-Stand wurde nicht verändert. Der Punkt lag bei Auftragsbeginn bereits unter `laufend_codex/`.

## Abnahme

**2026-09-08, Orchestrator. Gemessen, nicht umgesetzt.**

`[cmd]` **Selbst nachgemessen: 10 aktive Stackeintraege, 7 mit
`supplement_id`.**

    Stack        10 aktiv, 7 Substanz-IDs, 3 Freitext
    Bruecke      81.326 von 121.959 (66,7 %)
    je Stoff     1.478 bis 29.004 Produktkandidaten
                 NIE genau einer

### Der Zweck laesst sich nicht messen

> *,,An Whey plus zehn Kontrastprodukten scheitern Menge,
Reihenfolge und Kategorie bei Mehrstoffprodukten; der Name ist
nur ein Vorschlag, keine sichere Zuordnung."*

`[read]` **Vier Kandidaten gemessen, alle vier untauglich** ?
**das ist ein Ergebnis.**

### Seine Empfehlung

> *,,`stack_items` kuenftig mit OPTIONALEM Produkt ZUSAETZLICH
zur optionalen Substanz. Nicht ableiten, welche
*Hauptsubstanz* ein Produkt meint."*

`[read]` **Dieselbe Haltung wie bei Vitamin E (C-500) und den
Portionen (C-512): lieber eine Luecke als eine geratene
Zahl.**

`[cmd]` **Und `supabase/` ist unveraendert** ? **die Auflage.**

**Abgenommen. Die Entscheidung liegt bei Tom.**

