---
nr: C-344
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-323
entscheidung: null
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
zahlen:
  gemessen: 2026-08-29
  ul_codes_im_tagesvergleich: 17
  ul_seed_zeilen: 19
  ul_mit_quellenbeschraenkung: 3
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: OFFEN
---

# C-344 — drei Obergrenzen gelten nicht fuer Nahrung

## Befund

Aus C-323, Claude Code, 2026-08-29. Der folgende Bericht misst den
aufgebauten Stand selbst; die genannten Konten sind Seed-Konten der
Wegwerf-Datenbank `lumeos_c276_probe`, nicht `dev`.

`nutrition.nutrient_reference_values` hat 19 physische `UL`-Zeilen
fuer 17 Naehrstoffcodes. Calcium und Phosphor haben jeweils zwei
Alterszeilen; `daily_reference_assessment()` waehlt davon eine und
liefert daher fuer ein vollstaendiges Erwachsenenprofil 17
Obergrenzen. „17 Obergrenzen“ ist somit als Codes im Tagesvergleich
richtig, nicht als Anzahl gespeicherter Zeilen.

## Gemessene Einschraenkungen

Die 17 UL-Codes wurden gegen ihre eigenen `notes` gelesen. Drei haben
eine Quellenbeschraenkung, die Nahrung ganz oder teilweise ausschliesst:

| Code | Note | strukturierte zulassige Aufnahmequellen |
| --- | --- | --- |
| `MG` | „Applies to pharmacological/supplemental magnesium only, not magnesium naturally present in foods.“ | `supplements`, `pharmacological` |
| `NIA` | „Applies to synthetic niacin from supplements or fortified foods.“ | `fortified_foods`, `supplements` |
| `FOLAC` | „Applies to supplemental folic acid and related synthetic forms, not food folate.“ | `supplements` |

Es gibt eine vierte, andersartige Einschraenkung: `VITA` gilt laut
Note fuer **preformed vitamin A**. Das ist eine Naehrstoffform-, keine
Aufnahmequellenbeschraenkung. Sie wurde nicht als Quellenwert
umgedeutet. Dafuer fehlen in der Tagesmenge eine getrennte Messung und
eine belegte Zuordnung der BLS-Werte zu „preformed“/anderen Formen.

Bei Zielwerten gibt es keinen weiteren Ausschluss der Tagesmenge nach
Aufnahmequelle. Zwei Notes sind dennoch fachlich enger als ein
unqualifiziertes „alle Formen“: `VITK`-AI ist „Based on
phylloquinone only“, `FOL`-PRI rechnet Dietary Folate Equivalents aus
Food folate plus 1,7-mal synthetischer Folsäure. Das sind
Form-/Umrechnungsfragen, keine Belege fuer eine weitere
Quellenbeschraenkung. Sie bleiben deshalb als offener Befund stehen.

## Schema- und Funktionsaenderung

`target_applies_to` bleibt die Abbildung **Referenzwert →
Naehrstoffcode**. Neu ist daneben
`nutrition.nutrient_reference_values.applies_to_intake_sources
text[]`.

Zulaessige, nicht leere Werte sind `foods` (natuerlich vorkommende
Lebensmittelnaehrstoffe), `fortified_foods`, `supplements` und
`pharmacological`. Alle nicht eingeschraenkten Referenzwerte erhalten
die vier Quellen. Die drei Zeilen oben sind explizit befuellt; eine
`CHECK`-Constraint verbietet leere oder unbekannte Quellen.

`nutrition.daily_reference_assessment()` liest die Spalte und gibt sie
als `reference_applies_to_intake_sources` aus. Prozentwerte,
`reference_status` und die Anzeige wurden absichtlich nicht geaendert:
eine Tagesmenge aus `meal_items` speichert nur `food_source` =
`bls`/`manual`, aber keine Aufteilung in natuerlich und angereichert.
Ohne diese Messung waere jede automatische Behandlung von NIA eine
unbelegte Quellenbehauptung. Die Anzeigeentscheidung bleibt bei Tom.

Gegenprobe im aufgebauten Stand nach dem Seed:

```text
FOLAC  {supplements}
MG     {supplements,pharmacological}
NIA    {fortified_foods,supplements}
```

Alle 19 physischen UL-Zeilen tragen eine nichtleere,
abfragbare Quellenmenge; die Tagesfunktion liefert dieselbe Menge fuer
die drei ULs. Die Validierung prueft Spalte, die drei eingeschraenkten
Seeds und die Weitergabe durch die Funktion.

## Wirkung heute — Nachweis fuer Tom

Messung: `lumeos_c276_probe`, offene Datenmenge bis einschliesslich
2026-11-16. Gezählt sind `UL`-Zeilen mit
`reference_status = 'complete'` und `reference_pct > 100`.

| Konto | Zeitraum | Tage | MG: faellt bei Lebensmittel-Tagesmenge sicher weg | NIA: heute ueber 100 %, aber Quellengeltung unaufloesbar | FOLAC | Summe sicher weg | Summe nicht entscheidbar |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `max.seed@example.com` | 2026-05-20 bis 2026-11-16 | 180 | 175 | 100 | 0 | 175 | 100 |
| `tom.seed@example.com` | 2026-05-20 bis 2026-11-16 | 181 | 171 | 101 | 0 | 171 | 101 |
| `sarah.seed@example.com` | 2026-05-20 bis 2026-11-16 | 181 | 0 | 0 | 0 | 0 | 0 |
| **Summe auswertbar** | 2026-05-20 bis 2026-11-16 | **361** | **346** | **201** | **0** | **346** | **201** |

Sarah hat kein vollstaendiges Profil; die Funktion liefert fuer sie
`missing_profile`, also keine bewertbaren UL-Ueberschreitungen.

Die **346 Magnesium-Ueberschreitungen** entfallen sicher, wenn die
bewertete Tagesmenge die heutige Lebensmittel-Tagesmenge ist: `MG`
erlaubt darin keine Quelle. Die **201 Niacin-Ueberschreitungen**
duerfen weder als „entfallen“ noch als valide gezählt werden:
`NIA` erlaubt angereicherte Lebensmittel, doch deren Anteil ist in
`daily_nutrient_summary_long` nicht vorhanden. Alle 547 heutigen
Treffer der drei Codes pauschal zu streichen waere daher ebenso falsch
wie sie pauschal zu warnen.

Die im Punkt genannte `dev`-Zahl (138 von 185) wurde nicht als neue
Messung ausgegeben: Es gab keinen Live-Eingriff und keine Live-Abfrage.
Sie bleibt ein historischer Befund; die Tabelle oben ist der
nachvollziehbare Messstand fuer diese Aenderung.

## Pruefung

1. Test zuerst gegen den vorherigen Aufbau: Spalte und Funktionsfeld
   waren beide nicht vorhanden (`0`).
2. `pnpm exec tsx supabase/_pipeline/015_kataloge/016_nutrient_reference_values.ts`
   gegen `lumeos_c276_probe`: 165 Referenzzeilen fuer 138 Codes,
   erfolgreich aufgebaut.
3. `059_daily_reference_assessment.sql` gegen dieselbe Wegwerf-Datenbank:
   Funktion erfolgreich neu erstellt; die Gegenprobe oben liest die
   drei Quellenmengen aus Tabelle und Funktion.
4. `pnpm exec tsc --noEmit --pretty false` ist am Wurzel-Setup
   fehlgeschlagen: bestehende `packages/ui/*.tsx`-Fehler
   (`TS17004`, kein JSX-Flag). Das betrifft keine der drei geaenderten
   Pipeline-Dateien.

Keine Referenzzahl, keine Prozentrechnung und keine Datei unter
`apps/` wurde von C-344 geaendert. Nicht committed, nicht gestaged,
nicht gepusht.

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen.**

`[cmd]` **Die Quellengeltung steht im Schema** —
`target_applies_to` erweitert, `daily_reference_assessment()` reicht
sie durch, mit Validierungen.

`[cmd]` **346 Magnesium-Ueberschreitungen fallen im gemessenen
Lebensmittelstand sicher weg.**

`[read]` **Und die Zurueckhaltung bei Niacin ist der wertvolle
Teil:** 201 Treffer sind **ohne Kennzeichnung *angereichert* nicht
entscheidbar** und wurden nicht pauschal entfernt. `[read]` **Die
Grenze gilt fuer synthetisches Niacin aus angereicherten
Lebensmitteln — ob ein BLS-Eintrag angereichert ist, sagt der Katalog
nicht.**

### Ein Drittel des Punktes faellt

`[cmd]` **`FOLAC` heisst laut `nutrient_defs` *,,Folsaeure,
synthetisch"*.** `[cmd]` Daneben stehen `FOLFD` (Folat) und `FOL`
(Folat-Aequivalent, immer berechnet).

`[read]` **Die Obergrenze *,,applies to supplemental folic acid, not
food folate"* gilt fuer genau diesen Code** — sie ist richtig
angewandt, kein Fehler. `[cmd]` **Und `FOLAC` ist an 7.059 von 7.086
Lebensmitteln null**, weil synthetische Folsaeure nur in
angereicherten vorkommt.

`[read]` **Das haette eine Abfrage auf `nutrient_defs` gezeigt, bevor
ich den Punkt angelegt habe.**

`[cmd]` **Live noch nicht eingespielt** — `MG 131 %` steht heute noch
als Ueberschreitung. Richtig, war nicht beauftragt.

**Abgenommen.**

