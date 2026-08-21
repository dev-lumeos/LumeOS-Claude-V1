# C-158: Welchen Naehrstoff liefert ein Supplement?

Stand: 2026-08-20

## Was der Bestand hergibt

`[cmd]` Der konsolidierte Substanzbestand hat 567 Eintraege. Die erste Messung nach Namen, Kategorien und bestehenden Katalogfeldern liefert 111 moegliche Naehrstofftraeger. Das ist bewusst breit: Vitamine, Mineralien, Protein/Aminosaeuren und Omega-3 sind darin, aber auch Grenzfaelle, die nur durch Namen oder Kategorien auffallen und nicht automatisch gemappt wurden.

`[cmd]` Maschinenlesbare Mengen standen vorher nur bei 11 von 44 Eintraegen in `supplements.supplement_catalog.nutrients_provided`. Auf `supplements.substance_catalog` waren es ebenfalls 11 von 567. Kimi und F-05 liefern Dosis- und Studienfelder, aber keine stabilen BLS-Gap-Codes wie `FAPUN3` und keine allgemeine `amount_per_serving`-Bruecke fuer die 138 `nutrition.nutrient_defs`.

`[cmd]` Nach C-158 stehen 17 belegte Zuordnungen in `supplements.supplement_nutrient_mappings`. Dieselben 17 Supplements und 17 Substanzen tragen jetzt `nutrients_provided`. Die uebrigen Kandidaten bleiben offen, weil entweder die Menge pro Portion fehlt, die chemische Form nicht ausreicht oder eine Aufteilung fehlen wuerde.

## Wie die Zuordnung aussieht

`[cmd]` Die Datendatei liegt in `supabase/_pipeline/daten/supplement-naehrstoffcodes.json`. Der Kettenschritt `135_supplement_nutrients.ts` spielt daraus die Tabelle `supplements.supplement_nutrient_mappings` ein und aktualisiert die JSON-Felder in `supplement_catalog` und `substance_catalog`.

`[cmd]` Je Zeile stehen Supplement, Substanz, BLS-Naehrstoffcode, Originalmenge, Originaleinheit, normalisierte Menge in der `nutrient_defs`-Einheit, Umrechnungsstatus und Herkunft. Das ist eine Angabe pro Katalogportion, keine Dosierungsempfehlung.

`[cmd]` Der Tageslesepfad `supplements.supplement_nutrient_intake_for_day(user_id, date)` summiert nur tatsaechlich genommene Einnahmen. Auf `dev@lumeos.app` am Seed-Tag 2026-08-19 liefert er: `FAPUN3 = 2 g`, `MG = 400 mg`, `VITD = 125 µg`. Vier Einnahmen wurden genommen, drei davon sind gemappt, eine bleibt als ungemappt gezaehlt.

`[cmd]` Der Vitamin-D-Fall ist damit korrigiert: `Vitamin D3 5000 IU` wird nicht als `5000 µg` weitergereicht, sondern als `125 µg`.

## Welche Einheiten kollidieren

`[cmd]` Eindeutig geloest sind reine SI-Umrechnungen (`mg`, `g`, `mcg`/`µg`) und Vitamin D. Fuer Vitamin D ist die Quelle im Datensatz benannt: NIH Office of Dietary Supplements, Vitamin D Fact Sheet for Health Professionals, `1 µg Vitamin D = 40 IU`.

`[cmd]` Offen bleiben drei Klassen:

- Vitamin A: IU gegen `µg` braucht die Form. Retinol, supplementales Beta-Carotin und Beta-Carotin aus Nahrung haben unterschiedliche Aequivalenzen.
- Vitamin E: IU gegen `mg` braucht natuerliches oder synthetisches Alpha-Tocopherol; die Faktoren unterscheiden sich.
- Folat: `µg` Folat, Folsäure und `µg DFE` sind nicht dasselbe; die Form und Einnahme mit oder ohne Nahrung entscheiden.

`[read]` Diese drei werden nicht geraten. Die offene Kollision steht in `open_unit_collisions`, damit spaeter nicht aus einer Luecke still ein falscher Faktor wird.

## Was an den Rechercheweg geht

`[cmd]` Der Rechercheweg braucht fuer die offenen Kandidaten maschinenlesbar: `substance_id`, `nutrient_code`, `amount_per_serving`, `unit`, chemische Form, Umrechnungsbasis und Quelle. Prosa in `studied_dose_ranges` reicht nicht fuer Gap-Regeln.

`[cmd]` Konkret offen sind vor allem: Vitamin A/E/Folat-Formen, EPA/DHA-Aufteilung innerhalb von Omega-3, BCAA- und Aminosaeure-Aufteilungen, Elektrolyt-Splits und alle Kandidaten ohne belegte Katalogportion. Fuer die uebrigen 94 breit erkannten Naehrstofftraeger gibt es noch keinen belastbaren Eintrag.

`[cmd]` `kimi-rule-input-audit.ts` bleibt nach diesem Schritt bei den Gap-Regeln bei `2 auswertbar, 3 teilweise, 10 blockiert`. Das ist erwartet: C-158 baut den Supplement-Naehrstoff-Leseweg, aendert aber keine Regel. Die blockierten Regeln nennen weiterhin fehlende Eingaben wie `fish_servings_week`, `dairy_servings_day` oder geplante Labor-/Tagespfade.

## Nachweis

`[cmd]` Kettenlauf ueber `kette-ausfuehren.ts`: Exit 0. `schema-vollstaendigkeit-pruefen.ts`: Exit 0, `supplements.supplement_nutrient_mappings` mit 17/17 Mindestzeilen und `supplement_nutrient_intake_for_day` als Fremdfunktion vorhanden. `testdaten-pruefen.ts`: Exit 0.

`[cmd]` Live auf `postgres`: `supplement_nutrient_mappings = 17`, `supplement_catalog` mit `nutrients_provided = 17/44`, `substance_catalog` mit `nutrients_provided = 17/567`.

`[cmd]` `pnpm gate` ist nicht gruen: die Vorpruefungen, Tests und die
anderen Builds laufen, aber `@lumeos/web#build` scheitert in
`packages/shared/src/supabase/session.ts`, weil `next/headers` ueber
`apps/web/src/lib/nutrition/naehrstoff-ordnung.ts` in einen von Next als
`pages/` bewerteten Kontext importiert wird. C-158 hat `apps/web` nicht
angefasst.
