---
status:     angenommen
stand:      2026-08-06
ankerhash:  7fc5785
betrifft:   30-module/nutrition, 10-plattform/architektur
---

# ADR-0003: Nährstoffmodell des Diary — EAV anschliessen oder flacher Entwurf

## Kontext

`[read]` Die alte ADR-Liste (`docs/_archive/ist-zustand/04-adr-liste.md`,
Zeile 11) führt ADR-003 als offen und blockierend für „WP-02“ — die
Diary-Verdrahtung, heute C-03. Zur Wahl standen der Anschluss an das
bestehende EAV-Modell (`food_nutrients`, wie SPEC_06) und der flache
Entwurf aus `db/schema/nutrition.sql`, der Nährwerte als Spalten führt.

**Zur Nummerierung, damit sie nicht weiter driftet:** Die TODO führte
ADR-003 zeitweise als „Supabase-Auth“. Das ist nicht die Frage dieser ADR.
Massgeblich ist die Registerzeile oben: ADR-003 ist das
**Diary-Nährstoffmodell**. Die Auth-Frage war ADR-004 („DB-Zugriffspattern“,
Zeile 12) und ist mit ADR-0001 und M3 erledigt. Die TODO wird entsprechend
berichtigt.

Die Entscheidung ist materiell längst gefallen — nur nicht aufgeschrieben.

## Optionen

**A — EAV anschliessen (`food_nutrients` als Quelle)**
Nährwerte je Lebensmittel liegen als Zeilen in `nutrition.food_nutrients`
(Lebensmittel × Nährstoff × Wert). Das Diary rechnet daraus und friert die
Ergebniswerte je Mahlzeitposition ein.
*Dafür:* Nutzt den vorhandenen, geprüften Bestand. Alle 138 Nährstoffe
stehen zur Verfügung, nicht nur vier Makros. Neue Nährstoffe kosten Zeilen,
keine Spalten.
*Dagegen:* Jede Auswertung braucht eine Aggregation über viele Zeilen. Das
Einfrieren je Position muss explizit gebaut werden.

**B — Flacher Entwurf aus `db/schema/nutrition.sql`**
Eigene `foods`-Tabelle mit `calories_per_100g`, `protein_g`, `fat_g`,
`carbs_g`, `fiber_g`, `sugar_g` und `micronutrients JSONB`; dazu
`diary_days`, `meal_logs`, `meal_items`, `daily_nutrition_summaries`.
*Dafür:* Direkt lesbar ohne Join, einfache Summenbildung.
*Dagegen:* Definiert `foods` ein zweites Mal — mit anderer Struktur als der
Bestand. Mikronährstoffe verschwinden in einem JSON-Feld ohne Constraints.
Der BLS-Bestand müsste in diese Form übersetzt werden.

## Entscheidung

Gewählt: **A — EAV anschliessen. Der flache Entwurf wird verworfen.**
Materiell entschieden mit 060/M3; hier nachdokumentiert am 2026-08-06.

`[cmd]` Die Lage in der laufenden Instanz am 2026-08-06:

| Befund | Wert |
|---|---|
| Zeilen in `nutrition.food_nutrients` | 698.092 |
| Flache Makrospalten auf `nutrition.foods` (`calories_per_100g`, `protein_g`, `fat_g`, `carbs_g`, `micronutrients`) | **0 von 5 vorhanden** |
| Tabellen `meal_items`, `meal_logs`, `diary_days` in `nutrition` **oder** `public` | **existieren nicht** |
| Tabellen im Schema `nutrition` gesamt | 11 |
| Davon mit Zeilenschutz | 11 |

Damit ist die Frage nicht mehr symmetrisch: Variante A ist der Bestand mit
knapp 700.000 Datenzeilen, Variante B ist ein nie angewendeter Entwurf.

## Begründung

**Der Bestand entscheidet.** `[cmd]` Der EAV-Kern trägt 698.092 Zeilen und
138 Nährstoffdefinitionen. Der flache Entwurf kennt vier Makros plus ein
JSON-Feld. Ihn anzuschliessen hiesse, den geprüften Bestand in ein ärmeres
Modell zu übersetzen und die Differenz zu verlieren.

**Der Entwurf kollidiert an der Wurzel.** Er definiert `foods` neu, mit
`bls_key VARCHAR(10)` und Makrospalten. `[cmd]` Der Bestand hat keine
dieser fünf Spalten. Zwei Definitionen derselben Tabelle nebeneinander sind
genau die Drift, die dieses Repo an anderer Stelle schon zweimal teuer
bezahlt hat.

**Das Zugriffsmuster ist bereits in Richtung A entschieden.** Schon vor
060 nutzten die einzigen beiden Policies im Schema `auth.uid()` — das
Muster des Diary-Entwurfs, angewandt auf die EAV-Tabellen
(`docs/ssot/30-datenbank.md`). Mit 060 ist daraus der Regelfall geworden:
`[cmd]` 11 von 11 Tabellen mit Zeilenschutz, die Preferences-Tabellen mit
je vier Policies. Der Entwurf brächte kein Muster mit, das dort fehlt.

**Ein konkreter Fehler im Entwurf, der beim Übernehmen mitgekommen wäre:**
`[read]` `db/schema/nutrition.sql` schaltet in Zeile 89 den Zeilenschutz
für `meal_items` ein, vergibt aber **keine Policy** für diese Tabelle
(Policies existieren nur für `diary_days`, `meal_logs` und
`daily_nutrition_summaries`). Zeilenschutz ohne Policy bedeutet: für
`authenticated` ist die Tabelle vollständig gesperrt — das Diary könnte
seine eigenen Positionen nicht lesen. Beim Neuaufbau nach A ist dieser
Fehler nicht zu wiederholen.

## Folgen

- **C-03 ist formal entblockt.** Die verbleibende Arbeit ist Bau, keine
  Entscheidung: Diary-Tabellen im Schema `nutrition` anlegen, an
  `food_nutrients` rechnen, Ergebniswerte je Position einfrieren.
- `db/schema/nutrition.sql` ist damit **verworfen**, nicht offen. Die Datei
  bleibt vorerst als Referenz liegen; sie ist kein Sollwert und darf nicht
  als Current Truth gelesen werden.
- Jede neue Diary-Tabelle bekommt Zeilenschutz **und** die Policies je
  Operation — dem Muster aus 060 folgend, nicht dem Entwurf.
- Das Einfrieren der Nährwerte je Mahlzeitposition ist beim Bau
  ausdrücklich vorzusehen: ändert sich später ein BLS-Wert, dürfen
  vergangene Tage sich nicht rückwirkend ändern.
- Der Aggregationsweg (Tagessummen) ist noch nicht entschieden —
  Sicht, materialisierte Sicht oder Summentabelle. Gehört zu C-04.

## Was diese Entscheidung umstossen würde

- Die Aggregation über `food_nutrients` erweist sich im Betrieb als zu
  langsam und lässt sich weder mit Index noch mit vorberechneter Summe
  auffangen. `[annahme]` Bei Tagesmengen einzelner Nutzerinnen nicht
  absehbar — die 698.092 Zeilen sind Stammdaten, nicht Bewegungsdaten.
- Ein Fremdsystem verlangt die flache Form als Austauschformat. Das wäre
  ein Grund für eine Projektion, nicht für ein zweites Kernmodell.

## Offen

Nichts an dieser Entscheidung. Der Zuschnitt der Diary-Tabellen selbst
(Namen, Schlüssel, Aggregationsweg) wird in C-03/C-04 entschieden und
gehört nicht hierher.
