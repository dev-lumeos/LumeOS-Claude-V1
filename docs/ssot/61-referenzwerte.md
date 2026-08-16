# Nährstoff-Referenzwerte: Quellenprüfung — angehalten

`[cmd]` Erhoben 2026-08-15. Anlass: C-45, Entscheidung Tom für eine
eigene Tabelle statt Spalten in `nutrient_defs`.

**Ergebnis: Schritt 1 endet negativ. Es wurde kein Schema gebaut.**

Der Auftrag sagt: *„Findest du keine belegbare Quelle: melden und
anhalten. Dann ist es eine Beschaffungsfrage für Tom, keine Bauaufgabe.
Ein Schema ohne Daten ist ein leeres Versprechen."* Genau dieser Fall
liegt vor.

---

## Das Ergebnis in vier Sätzen

1. `[cmd]` Es liegt **keine Referenzwert-Quelle im Repo** — weder in
   `docs/ssot/daten/` noch in der BLS-Dokumentation noch in
   `docs/specs/Nutrition/`.
2. `[read]` Die Spec **hat diese Aufgabe bereits vorweggenommen**:
   `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md` enthält Tabellenstruktur,
   Prioritätenliste und Pflichtregeln — und trägt im Kopf
   `⚠️ SEED-WERTE AUSSTEHEND`.
3. `[cmd]` Die einzigen konkreten Zahlen im Repo — 12 UL-Werte in
   `SPEC_09_PATCH_UL_SUPPLEMENTS.md` — tragen **keine Quellenangabe**
   und dürfen nach den Regeln derselben Spec nicht eingetragen werden.
4. `[cmd]` Der Umfang ist klein: **32 von 138 Nährstoffen** brauchen
   Referenzwerte, bei vier Alters-/Geschlechtsgruppen **128 Zeilen**.

---

## Welche Quelle und warum

**Dies ist der Abschnitt, den man in einem Jahr nachliest, wenn jemand
fragt, warum LumeOS 10 mg Eisen für Männer ansetzt und nicht 8.**
Heute lautet die Antwort: **LumeOS setzt noch gar nichts an**, und das
ist der belegte Stand.

### Was gesucht wurde

| Ort | Ergebnis |
|---|---|
| `docs/ssot/daten/` | `[cmd]` BLS-Arbeitsmappe, BLS-Dokumentation, Wörterbuch, Thesaurus — **keine Referenzwerte** |
| `BLS_4_0_Dokumentation_DE.pdf` | `[cmd]` 3 Treffer auf „Referenzwert", **alle drei** betreffen die Umrechnung von Nährstoffgehalten bei unterschiedlichem Wassergehalt — nicht Zufuhrempfehlungen |
| `docs/specs/Nutrition/` | `[cmd]` 21 Dateien nennen DGE/EFSA/D-A-CH, **keine enthält eine Wertetabelle** |
| `ADR_IMPROVEMENTS_PACKAGE.md` | `[cmd]` gelesen — **0 Treffer** zu RDA, Referenzwerten, DGE oder EFSA. Behandelt Offline-Logging, Quick-Add, Allergen-Selektor, Barcode und Top-Foods |
| `NUTRIENT_REFERENCE_VALUES_SEED_DATA.sql` | `[cmd]` **existiert nicht** — weder im Repo noch im Archiv |

**Der BLS liefert keine Referenzwerte.** Das ist keine Lücke, sondern
seine Bauart: er beschreibt, was *in* einem Lebensmittel steckt, nicht
was ein Mensch *braucht*. Die 138 Nährstoffcodes sind Gehaltsangaben.

### Was die Spec dazu schon festgelegt hat

`[read]` `docs/specs/Nutrition/03_sql/NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md`
(April 2026) hat die Aufgabe vorweggenommen und beantwortet die
Quellenfrage bereits — als **offene** Frage:

> `⚠️ SEED-WERTE AUSSTEHEND`
> „Konkrete RDA/AI/UL-Werte sind in dieser Datei NICHT hinterlegt.
> Grund: **Referenzwerte müssen aus geprüften Quelltabellen stammen.**"

Empfohlen werden dort drei Kandidaten, in dieser Reihenfolge:

1. **D-A-CH-Referenzwerte** (Deutsche Gesellschaft für Ernährung, 2020+)
2. **EFSA Dietary Reference Values**
3. **IOM/NAM Dietary Reference Intakes** (US)

`[annahme]` Für den deutschsprachigen Raum spricht alles für D-A-CH als
Leitquelle mit EFSA für die UL-Werte, die D-A-CH nicht durchgängig
führt — die Spec selbst weist in ihrer Prioritätenliste mehrfach
„DACH / EFSA" aus und nennt bei Kalium ausdrücklich „ja (EFSA)".
**Entschieden ist das nicht**, und es ist auch nicht meine Entscheidung:
es ist eine Beschaffungs- und Lizenzfrage.

### Warum die 12 vorhandenen Werte nicht genügen

`[cmd]` `SPEC_09_PATCH_UL_SUPPLEMENTS.md` enthält als einzige Datei im
Repo konkrete Zahlen — zwölf UL-Werte:

```
VITA 3000 µg · VITD 100 µg · VITE 300 mg · FE 45 mg · ZN 25 mg
SE 300 µg · ID 600 µg · CU 5 mg · VITB6 25 mg · VITC 2000 mg
FOLAC 1000 µg · NIA 35 mg
```

`[cmd]` **Keiner dieser Werte trägt eine Quellenangabe.** Kein „DACH
2020", kein „EFSA 2006", keine Tabellennummer, kein `source_version`.
Die Suche nach genau diesen Begriffen in beiden SPEC_09-Dateien liefert
null Treffer.

Sie einzutragen verstiesse gegen die Pflichtregeln der Spec, die sie
selbst aufstellt:

> `[read]` „**Quelle muss angegeben werden** — kein Wert ohne `source`
> und `source_version`."
> `[read]` „**Kein Wert erfinden** — nur belegte Werte eintragen."

`[annahme]` Die Zahlen wirken plausibel und dürften aus EFSA oder IOM
stammen — aber „wirkt plausibel" ist genau der Massstab, den diese
Regeln ausschliessen. Ein UL ist eine Sicherheitsobergrenze; ein
falscher Wert warnt entweder nie oder ständig.

Dieselbe Prüfbarkeit, die für den BLS gilt, muss hier gelten: `[cmd]`
der BLS-Bestand ist gegen die amtliche Arbeitsmappe verifiziert —
698.092 Werte, 353 Abweichungen, alle als Rundungen erklärt. Für
Referenzwerte gibt es heute nichts, wogegen man prüfen könnte.

---

## Der Umfang, falls die Quelle kommt

`[cmd]` Gemessen gegen `nutrition.nutrient_defs`:

| | |
|---|---|
| Nährstoffe gesamt | **138** |
| Spec-Priorität 1 (immer sichtbar) | **25**, alle 25 im Bestand vorhanden |
| Spec-Priorität 2 (Athlet-Ansicht) | **7**, alle 7 vorhanden |
| **Referenzbedarf gesamt** | **32 von 138** |
| bei 4 Gruppen (18–50 m/w, 51+ m/w) | **128 Zeilen** |

**Kein einziger Code der Spec-Listen fehlt im Bestand** — die Listen
wurden gegen dieselbe Nährstofftabelle geschrieben, die heute läuft.

`[cmd]` Nebenbefund: `display_tier = 1` umfasst **31** Nährstoffe, die
Spec-Priorität 1 aber **25**. Die sechs zusätzlichen sind `ALC`,
`ENERCJ`, `FASAT`, `NACL`, `SUGAR`, `WATER`. `[annahme]` Für die meisten
gibt es keinen sinnvollen RDA — `ENERCJ` ist die kJ-Dopplung zu
`ENERCC`, die SPEC_09 ausdrücklich ausnimmt. `NACL` und `SUGAR` hätten
eher Obergrenzen als Empfehlungen. Das ist ungeprüft und gehört zur
Quellenentscheidung.

---

## Was die Spec bereits fertig vorgibt

Wenn die Quelle da ist, ist der Bau klein — **die Struktur steht
bereits**, wörtlich in `SPEC_06_V1_MIGRATION.sql` und der Seed-Struktur:

```sql
CREATE TABLE nutrition.nutrient_reference_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_code TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code),
  unit TEXT NOT NULL,
  age_min INTEGER, age_max INTEGER,
  sex TEXT CHECK (sex IN ('male','female','both')),
  is_pregnant BOOLEAN DEFAULT false,
  is_lactating BOOLEAN DEFAULT false,
  rda NUMERIC(12,4), ai NUMERIC(12,4), ul NUMERIC(12,4),
  target_min NUMERIC(12,4), target_max NUMERIC(12,4),
  source TEXT NOT NULL,           -- Pflicht
  source_version TEXT,
  notes TEXT,
  effective_from DATE NOT NULL DEFAULT '2020-01-01'
);
```

**Die Frage aus dem Auftrag nach Schwangerschaft und Stillzeit ist damit
beantwortet:** `[read]` Die Spec führt `is_pregnant` und `is_lactating`
als Spalten, aber als *„Optional für V1 (schema-vorbereitet, nicht aktiv
ausgewertet)"*. Aufnehmen ja, befüllen nur, wenn die Quelle es hergibt.

Ebenfalls schon entschieden:
- `[read]` `ul = NULL` bei fehlendem UL — **niemals `0`, niemals `9999`**
- `[read]` `notes` sind Pflicht bei Vitamin A, D, K, Eisen und Magnesium
  (Teratogenität, Akkumulation, Antikoagulantien, Supplement-Abgrenzung)
- `[read]` *„Review durch medizinisch geprüfte Quelle bevor
  Produktionseinsatz"*

`[annahme]` Der letzte Punkt ist der eigentliche Grund, warum ich hier
anhalte und nicht „vorläufige" Werte eintrage: Referenzwerte sind
Gesundheitsaussagen.

---

## Die leeren Spalten in `nutrient_defs`

`[cmd]` `nutrient_defs` trägt drei Spalten für Referenzwerte:
`rda_male`, `rda_female`, `rda_unit`. **Alle drei sind bei allen 138
Nährstoffen leer.**

Der Auftrag verlangt: entfernen oder als überholt kennzeichnen —
*„Stehen lassen und ignorieren ist die schlechteste Wahl."* Dem stimme
ich zu, **habe aber nichts geändert**, aus zwei Gründen:

1. `[read]` `SPEC_09_SCORING` liest heute ausdrücklich aus genau diesen
   Spalten (*„RDA-Werte kommen direkt aus
   `nutrition.nutrient_defs.rda_male` / `rda_female`"*). Sie zu
   entfernen, bevor SPEC_09 auf die neue Tabelle umgestellt ist, hiesse
   eine Spec zu brechen, die noch gilt.
2. Eine Schemaänderung war für Schritt 2 vorgesehen — und Schritt 2 ist
   nicht eingetreten.

**Vorschlag:** die drei Spalten mit einem `COMMENT ON COLUMN` als
überholt kennzeichnen, sobald die neue Tabelle existiert, und im selben
Zug entfernen, wenn SPEC_09 umgestellt ist. Das ist eine
Schemaänderung und braucht Freigabe.

---

## Was zu beschaffen ist

Damit dies zur Bauaufgabe wird, fehlt genau eines: **eine geprüfte
Wertetabelle mit Quellenangabe.**

Konkret:

1. **Quelle festlegen** — D-A-CH als Leitquelle, EFSA für UL, ist der
   naheliegende Weg für den deutschsprachigen Raum. `[annahme]`
   Entschieden ist das nicht.
2. **Lizenz klären.** `[annahme]` Die D-A-CH-Referenzwerte sind ein
   kostenpflichtiges Werk der DGE; EFSA-Werte sind frei zugänglich.
   Ungeprüft — das ist Teil der Beschaffung.
3. **Werte für 32 Nährstoffe × 4 Gruppen** extrahieren, je Zeile mit
   `source` und `source_version`.
4. **Medizinische Prüfung** vor Produktionseinsatz, wie die Spec
   verlangt.

Erst danach entstehen Kettenschritt, Sollliste und README-Eintrag —
`[annahme]` das ist dann ein kleiner Auftrag, weil Struktur und
Prüfregeln schon geschrieben sind.

---

## Was ich nicht getan habe

- **Kein Schema angelegt.** Ein leeres `nutrient_reference_values`
  würde die Schemaprüfung bestehen und suggerieren, die Frage sei
  erledigt. `[read]` Genau diese Fehlerklasse steht mehrfach im Repo:
  Werkzeuge, die Sicherheit behaupten, ohne sie zu erzeugen.
- **Keine Werte eingetragen**, auch nicht die zwölf UL-Werte aus dem
  Patch — sie tragen keine Quelle.
- **Keine Änderung an `nutrient_defs`**, `food_search`,
  `food_nutrients`, `foods`.
- **`daten/schema-sollstand.json` nicht angefasst.** `[cmd]` Codex
  arbeitet parallel an C-44 in derselben Datei; ohne neue Tabelle gibt
  es dort ohnehin nichts einzutragen.
- **`supabase/README.md` nicht geändert** — es gibt keinen neuen
  Kettenschritt.
- **`packages/scoring/` nicht angelegt**, wie vorgegeben.

---

## Was dieser Bericht nicht sagt

- **Er sagt nicht, dass es keine brauchbare Quelle gibt.** Er sagt, dass
  im Repo keine liegt. D-A-CH und EFSA existieren; sie sind nur nicht
  hier.
- **Er sagt nicht, dass die zwölf UL-Werte falsch sind.** `[annahme]`
  Sie wirken plausibel. Belegt sind sie nicht, und für eine
  Sicherheitsobergrenze ist das der Unterschied.
- **Er prüft die Spec-Struktur nicht auf Vollständigkeit.** `[read]` Die
  Tabelle stammt aus `SPEC_06_V1_MIGRATION.sql`; ob sie für den
  Tages-Score aus SPEC_09 und für C-37 ausreicht, ist nicht gemessen —
  nur, dass sie die vier Achsen der Spec trägt.
- **Der Nebenbefund zu `display_tier` ist nicht zu Ende geprüft.**
  `[cmd]` 31 gegen 25 ist gemessen; welche der sechs zusätzlichen
  Nährstoffe einen Referenzwert brauchen, ist es nicht.
---

# Nährstoff-Referenzwerte: gebaut

`[cmd]` Fortsetzung 2026-08-15, C-45. Der frühere Abbruch ist aufgehoben:
EFSA, National Academies/NCBI und WHO/FAO liefern freie, belegbare
Quellen. Der Kettenschritt steht jetzt als
`supabase/_pipeline/015_kataloge/016_nutrient_reference_values.ts`.

**Ergebnis:** `[cmd]` Der Wegwerf-Kettenlauf
`pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --keep-database`
lief auf `lumeos_kette_20260815072650` durch. Schritt `016` erzeugte
**165 Zeilen für 138 Nährstoffcodes**. Die Abschlussprüfung meldete
`SCHEMA VOLLSTAENDIG`.

## Was gebaut wurde

`[cmd]` Neue Tabelle `nutrition.nutrient_reference_values`, öffentliche
Stammdaten. Sie trägt `nutrient_code`, `reference_kind`, Alters- und
Geschlechtsachsen, Schwangerschaft/Stillzeit, `value_min/value_max`,
Einheit, Wertbasis sowie Quelle und Fundstelle je Zeile.

`[cmd]` RLS ist aktiv, Policy `SELECT USING (true)`, `authenticated`
hat nur `SELECT`, `service_role` hat `ALL`. Die drei leeren Spalten in
`nutrient_defs` (`rda_male`, `rda_female`, `rda_unit`) wurden per
`COMMENT ON COLUMN` als überholt markiert, nicht entfernt.

`[cmd]` `schema-sollstand.json` prüft die Tabelle, RLS, Policy, Grants,
FK und mindestens 138 Zeilen. Der Kettenlauf meldete:

| Aussage | Wert |
|---|---:|
| Tabellen | 20/20 |
| Funktionen | 14/14 |
| RLS | 20/20 |
| Policies | 20/20 |
| GRANTs | 22/22 |
| Fremdschlüssel | 16/16 |
| `nutrient_reference_values` | 165 / 138 |

## Welche Quelle je Nährstoff

`[read]` Primärquelle ist EFSA. Der EFSA-DRV-Summary-PDF liefert die
Wertarten selbst: `PRI`, `AR`, `AI`, `RI`; ein `AI` ist also bewusst
nicht dasselbe wie ein `PRI`.

`[cmd]` Verteilung nach Wertart:

| Wertart | Zeilen |
|---|---:|
| `AI` | 25 |
| `AI_COMBINED` | 1 |
| `ALAP` | 1 |
| `FORMULA` | 15 |
| `PRI` | 22 |
| `PRI_COMBINED` | 2 |
| `RI` | 2 |
| `UL` | 19 |
| `NO_REFERENCE` | 21 |
| `NO_STANDALONE_REFERENCE` | 57 |

**EFSA DRV Summary Tables 2017** `[read]`:
Energie, Protein, Fett, gesättigte Fettsäuren, Kohlenhydrate,
Ballaststoffe, Wasser, Linolsäure, Alpha-Linolensäure, EPA+DHA,
Vitamine A/D/E/K/C/B1/B2/B6/B12, Folat, Niacin-Äquivalent,
Pantothensäure, Biotin, Calcium, Jod, Eisen, Mangan, Molybdän,
Phosphor, Kalium, Fluorid, Zink sowie die explizite Chromium-Aussage
„AI oder PRI nicht angemessen".

**EFSA Einzelgutachten nach 2017** `[read]`:
Natrium, Chlorid, Vitamin-D-UL, Vitamin-A-UL, Vitamin-B6-UL,
Vitamin-E-UL, Folsäure-UL und Kupfer-Safe-Level. Diese späteren
Gutachten ersetzen bei ULs die älteren US-Werte, wenn sie abweichen.

**National Academies / NCBI DRI Reference Tables** `[read]`:
US-DRI-ULs dort, wo im gebauten Schritt kein neuerer EFSA-Wert
eingetragen wurde: Vitamin C, Calcium, Jod, Eisen, Magnesium
Supplement-UL, Mangan, Molybdän, Phosphor, Fluorid, Zink.

**WHO/FAO/UNU 2007** `[read]`:
essenzielle Aminosäuren. Methionin+Cystein und Phenylalanin+Tyrosin
sind kombinierte Anforderungen; Cystein und Tyrosin bekommen deshalb
`NO_STANDALONE_REFERENCE`.

### EFSA gegen US DRI

`[cmd]` Der Seed dokumentiert Abweichungen in `notes`, statt zu mitteln:

| Nährstoff | EFSA | US DRI | Entscheidung |
|---|---:|---:|---|
| Vitamin D AI | 15 ug | andere Stellen oft 20 ug | EFSA 15 ug |
| Vitamin B6 UL | 12 mg | 100 mg | EFSA 12 mg |
| Vitamin E UL | 300 mg | 1000 mg | EFSA 300 mg |
| Kupfer UL/Safe Level | 5000 ug | 10000 ug | EFSA 5000 ug |

`[annahme]` Für LumeOS ist das richtig, weil Tom EFSA als Primärquelle
gesetzt hat. Die US-Werte bleiben nur dort Sekundärquelle, wo kein
neuerer EFSA-UL im Schritt hinterlegt ist.

## Welche Nährstoffe keinen Wert bekommen und warum

`[cmd]` 78 Zeilen sind ausdrücklich ohne eigenständigen Referenzwert:
21 `NO_REFERENCE` und 57 `NO_STANDALONE_REFERENCE`. Das sind keine
Lücken; jede Zeile trägt Quelle und Fundstelle.

| Codes | Grund |
|---|---|
| `ALC`, `ASH`, `CHORL`, `NT` | Alkohol, Rohasche, Cholesterin und Stickstoff sind keine Bedarfsziele im Sinne der Zufuhrempfehlungen |
| `RETOL`, `CARTB`, `CAROTPAXB` | kein Standalone-Wert; Vitamin-A-Äquivalent `VITA` nutzen |
| `CHOCAL`, `ERGCAL` | kein Standalone-Wert; Vitamin-D-Äquivalent `VITD` nutzen |
| `TOCPHA`, `TOCPHB`, `TOCPHG`, `TOCPHD`, `TOCTRA` | kein Standalone-Wert; Vitamin E `VITE` nutzen |
| `VITK1`, `VITK2` | kein Standalone-Wert; Vitamin K `VITK` nutzen |
| `NIA`, `FOLFD` | Zielwert liegt auf `NIAEQ` bzw. `FOL`; `NIA` hat nur einen UL |
| `S`, `CR` | Schwefel ohne quantifizierten DRV; Chrom laut EFSA ohne angemessenen AI/PRI |
| `ACEAC`, `CITAC`, `LACAC`, `MALAC`, `TARAC` | organische Säuren, kein Bedarf |
| `MANTL`, `SORTL`, `XYLTL` | Zuckeralkohole, kein Bedarf |
| `GLUS`, `FRUS`, `GALS`, `SUCS`, `MALS`, `LACS`, `OLSAC`, `STARCH` | kein Standalone-Wert; Gesamt-Kohlenhydrate `CHO` nutzen |
| `FIBLMW`, `FIBINS`, `FIBSOL`, `FIBHMWS`, `FIBHMWI` | kein Standalone-Wert; Gesamt-Ballaststoffe `FIBT` nutzen |
| `F4:0`, `F6:0`, `F8:0`, `F10:0`, `F12:0`, `F14:0`, `F15:0`, `F16:0`, `F17:0`, `F18:0`, `F20:0`, `F22:0`, `F24:0` | kein Standalone-Wert für einzelne gesättigte Fettsäuren |
| `F14:1CN5`, `F16:1CN7`, `F18:1CN7`, `F18:1CN9`, `F20:1CN9`, `F22:1CN9` | kein Standalone-Wert für einzelne einfach ungesättigte Fettsäuren |
| `F18:4CN3`, `F22:5CN3`, `F18:2C9T11`, `F18:3CN6`, `F20:2CN6`, `F20:3CN6`, `F20:4CN6`, `FAX` | kein Standalone-Wert für diese mehrfach ungesättigten Fettsäuren oder Sammelreste |
| `F22:6CN3` | DHA ist über den kombinierten EPA+DHA-Wert abgedeckt |
| `ALA`, `ARG`, `ASP`, `GLU`, `GLY`, `PRO`, `SER` | nicht-essenzielle Aminosäuren, kein Standalone-Bedarf |
| `CYSTE`, `TYR` | über Methionin+Cystein bzw. Phenylalanin+Tyrosin abgedeckt |

## Was diese Werte nicht leisten

- `[read]` Es sind Zufuhrempfehlungen für gesunde Menschen, keine
  Laborreferenzbereiche. Ferritin, Natrium im Serum oder Blutwerte
  gehören zum Biomarker-Modul.
- `[annahme]` Sie gelten für gesunde Erwachsene in Ruhe. Ein
  Kraftsportler im Aufbau, eine Diätphase oder Krankheit ändern den
  Bedarf; EFSA beantwortet diese Sportziel-Frage nicht.
- `[cmd]` Energie ist als `FORMULA` modelliert, nicht als fixe
  Kalorienzahl. Tagesziele müssen weiter aus Profil, Körperdaten und
  Aktivität kommen.
- `[cmd]` Einheiten sind Quellen-Einheiten. `VITB6` steht im BLS in
  Mikrogramm, EFSA/UL in Milligramm; die spätere Bewertung muss
  konvertieren, statt Einheiten still gleichzusetzen.
- `[annahme]` Schwangerschaft und Stillzeit sind strukturell abbildbar,
  aber V1 wertet sie nicht aus. Einige EFSA-Quellen führen Werte; die
  Tabelle kann sie aufnehmen, der Seed beschränkt sich auf den
  erwachsenen Kern plus dort nötige Hinweise.

## Was offen bleibt

- `[annahme]` Die Tabelle ist ein Stammdatenfundament. Sie baut noch
  keine Prozentanzeige, kein Ampelsystem und keine `micro_flags`.
- `[annahme]` Vor einer medizinisch formulierten Nutzerwarnung sollten
  die UL-Zeilen fachlich gegengeprüft werden. Besonders relevant sind
  die Nährstoffe, bei denen EFSA und US DRI auseinandergehen.
- `[cmd]` Die Kette baut die Tabelle, aber kein UI liest sie heute.

---

# GO-00: Referenzwert-Einheiten repariert

`[cmd]` Erhoben und repariert am 2026-08-16. Anlass: Die
Referenzwert-Tabelle war in C-45 vollständig nach Quelle und Codeabdeckung,
aber blind für Einheiten. Dadurch konnte `daily_reference_assessment` einen
Tageswert in `mg` gegen einen Referenzwert in `g/day` teilen.

`[cmd]` Gegenprobe vor der Reparatur:
`schema-vollstaendigkeit-pruefen.ts` meldete auf dem damaligen Live-Stand
`reference_units 47 unpassend` und Exit 1. Das war die Prüfung, die C-45
gebraucht hätte.

## Vollständige Paarliste vor der Reparatur

`[cmd]` 72 Referenzzeilen trugen einen Zahlenwert. Die Paarung
`nutrient_reference_values.unit` gegen `nutrient_defs.unit` war:

| Referenz | Bestand | Bezug | Zeilen | Codes |
|---|---|---|---:|---|
| `mg/day` | `mg` | `per_day` | 23 | `CA`, `CLD`, `FE`, `K`, `MG`, `NA`, `NIA`, `P`, `PANTAC`, `RIBF`, `VITC`, `VITE`, `ZN` |
| `ug/day` | `µg` | `per_day` | 11 | `BIOT`, `CU`, `FOLAC`, `ID`, `MO`, `VITB12`, `VITD`, `VITK` |
| `mg/day` | `µg` | `per_day` | 9 | `CU`, `FD`, `MN`, `VITB6` |
| `mg/kg bw/day` | `g` | `per_kg_bw_per_day` | 9 | `HIS`, `ILE`, `LEU`, `LYS`, `MET`, `PHE`, `THR`, `TRP`, `VAL` |
| `E%` | `g` | `energy_percent` | 4 | `CHO`, `F18:2CN6`, `F18:3CN3`, `FAT` |
| `g/day` | `mg` | `per_day` | 4 | `CA`, `P` |
| `ug RE/day` | `µg` | `per_day` | 3 | `VITA` |
| `g/day` | `g` | `per_day` | 2 | `FIBT`, `NACL` |
| `L/day` | `g` | `per_day` | 2 | `WATER` |
| `g/kg bw/day` | `g` | `per_kg_bw_per_day` | 1 | `PROT625` |
| `mg NE/MJ` | `mg` | `per_mj` | 1 | `NIAEQ` |
| `mg/day` | `g` | `per_day` | 1 | `F20:5CN3` |
| `mg/MJ` | `mg` | `per_mj` | 1 | `THIA` |
| `ug DFE/day` | `µg` | `per_day` | 1 | `FOL` |

`[cmd]` In drei Fallgruppen:

| Fall | Zeilen | Codes |
|---|---:|---|
| direkt kompatibel | 25 | `CA`, `CLD`, `FE`, `FIBT`, `K`, `MG`, `NA`, `NACL`, `NIA`, `P`, `PANTAC`, `RIBF`, `VITC`, `VITE`, `ZN` |
| reine Umrechnung | 31 | `BIOT`, `CA`, `CU`, `F20:5CN3`, `FD`, `FOL`, `FOLAC`, `ID`, `MN`, `MO`, `P`, `VITA`, `VITB12`, `VITB6`, `VITD`, `VITK`, `WATER` |
| Körpergewicht | 10 | `HIS`, `ILE`, `LEU`, `LYS`, `MET`, `PHE`, `PROT625`, `THR`, `TRP`, `VAL` |
| Energiebezug | 6 | `CHO`, `F18:2CN6`, `F18:3CN3`, `FAT`, `NIAEQ`, `THIA` |

## Reparatur

`[cmd]` Fall 1 wurde im Seed von
`supabase/_pipeline/015_kataloge/016_nutrient_reference_values.ts`
konvertiert. Die Quelle bleibt dieselbe; Wert und Einheit werden nur in
die Bestandseinheit übersetzt:

| Vorher | Nachher |
|---|---|
| `mg/day` bei Bestand `µg` | Wert mal 1000, Einheit `µg` |
| `g/day` bei Bestand `mg` | Wert mal 1000, Einheit `mg` |
| `mg/day` bei Bestand `g` | Wert mal 0,001, Einheit `g` |
| `L/day` für Wasser | Wert mal 1000, Einheit `g` |
| `ug/day`, `ug RE/day`, `ug DFE/day` | Einheit `µg`, Wert bleibt gleich |

`[cmd]` Fall 2 und 3 wurden nicht still in Tageswerte umgerechnet. Diese
16 Zeilen behalten ihren Sonderbezug und tragen in `notes` eine
GO-00-Markierung. Damit ist maschinell sichtbar: ein Prozentwert braucht
hier erst Körpergewicht oder Tagesenergie.

`[annahme]` Meine fachliche Empfehlung für Tom: Für Fall 2 und 3 sollte
die Oberfläche vorerst keinen Ring-Prozentwert anzeigen, sondern die
Wertart mit Grund zeigen. Laufzeit-Umrechnung ist möglich, aber erst dann
sauber, wenn Gewicht und vollständige Tagesenergie vorliegen.

## Ergebnis nach der Reparatur

`[cmd]` Wegwerf-Kettenlauf:
`pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --keep-database`
auf `lumeos_kette_20260816030837`, 40 Schritte, `KETTE OK: 33.9s`.

`[cmd]` Abschlussprüfung:

| Aussage | Ergebnis |
|---|---:|
| `nutrient_reference_values` | 165 Zeilen |
| verschiedene Codes | 138 |
| Zeilen ohne Quelle | 0 |
| `reference_units` | 0 unpassend |
| Schema | `SCHEMA VOLLSTAENDIG` |

`[cmd]` Paarliste nach der Reparatur:

| Referenz | Bestand | Bezug | Zeilen |
|---|---|---|---:|
| `mg` | `mg` | `per_day` | 27 |
| `µg` | `µg` | `per_day` | 24 |
| `mg/kg bw/day` | `g` | `per_kg_bw_per_day` | 9 |
| `g` | `g` | `per_day` | 5 |
| `E%` | `g` | `energy_percent` | 4 |
| `g/kg bw/day` | `g` | `per_kg_bw_per_day` | 1 |
| `mg NE/MJ` | `mg` | `per_mj` | 1 |
| `mg/MJ` | `mg` | `per_mj` | 1 |

`[cmd]` Calcium-Gegentest in der Wegwerf-DB: Eine manuelle Mahlzeit mit
`CA = 800 mg` liefert in `daily_reference_assessment` für einen
30-jährigen Mann:

| Wertart | Referenz | Prozent |
|---|---:|---:|
| `PRI` | 950 mg | 84,2 % |
| `UL` | 2500 mg | 32,0 % |

Damit ist der konkrete Fehler `2,5 g` als `2,5 mg` nicht mehr möglich.

## Was die Abnahme übersehen hat

`[cmd]` C-45 prüfte: 165 Zeilen, 138 Codes, Quelle und Fundstelle je Zeile.
Das war in dieser Dimension vollständig.

`[cmd]` Nicht geprüft wurde, ob `value_min/value_max` in derselben Einheit
stehen wie Tageswerte aus `daily_summary`. Genau diese fehlende Dimension
erzeugte falsche Prozentwerte um Faktor 1.000.

`[read]` Das ist dasselbe Muster wie bei den Mindestzeilenzahlen aus
`docs/ssot/53-kettenluecke.md`: Eine Prüfung kann grün sein, wenn sie die
falsche Eigenschaft vollständig misst. Beim Fettsäurenverlust war die
Zeilenzahl blind für Codes und Quellen; hier war Codeabdeckung blind für
Einheiten.


---

# GO-00, Teil 2: Die Einheiten zur Laufzeit umrechnen

`[cmd]` Erhoben am 2026-08-16, Zweig `dev`. Teil 1 (`7ddd307`,
`d7cb600`) hatte die eindeutigen mg/µg/g-Fälle im Seed korrigiert.
**Offen blieben 16 Zeilen mit fremder Bezugsgrösse** — im Seed als
abweichend markiert, was die Prüfmeldung verhinderte, nicht den falschen
Prozentwert.

## Der Befund, gemessen

`[cmd]` Protein zeigte **1.593 %**. Sein Referenzwert ist `0,83 g/kg
bw/day`; die Funktion teilte 13,22 g durch 0,83, ohne mit den 78,4 kg zu
multiplizieren.

`[cmd]` Die 16 Zeilen, nach Bezugsgrösse:

| `basis` | Zeilen | Nährstoffe |
|---|---:|---|
| `per_kg_bw_per_day` | **10** | `PROT625` (g/kg) und neun Aminosäuren (mg/kg): `HIS`, `ILE`, `LEU`, `LYS`, `MET`, `PHE`, `THR`, `TRP`, `VAL` |
| `energy_percent` / `as_low_as_possible` | **4** | `CHO`, `FAT`, `F18:2CN6`, `F18:3CN3`, dazu `FASAT` ohne Werte |
| `per_mj` | **2** | `NIAEQ`, `THIA` |

## Wo umgerechnet wird — und warum dort

**Zur Laufzeit in `daily_reference_assessment`, nicht im Seed.**

`[read]` `0,83 g/kg` bleibt `0,83 g/kg` — so schreibt es die EFSA, und
der Seed bildet die Quelle ab. Ein Wert je Kilogramm lässt sich
ausserdem gar nicht vorab ausrechnen: er hängt am Gewicht der Nutzerin,
und das ändert sich.

`[cmd]` Die Funktion liest `public.profiles` bereits für Alter und
Geschlecht; `body_weight_kg` steht seit GO-01 in derselben Zeile. Die
Erweiterung war eine Spalte im vorhandenen CTE.

### Der Rechenweg

`[cmd]` Eine neue Zwischenstufe (`aufgeloeste_referenzen`) macht aus dem
Rohwert einen absoluten Tageswert:

```
per_kg_bw_per_day:  value * body_weight_kg / (unit LIKE 'mg/kg%' ? 1000 : 1)
per_day:            value
sonst:              NULL + Grund
```

`[cmd]` **Die Division durch 1000 war nicht offensichtlich:** neun der
zehn Zeilen stehen in `mg/kg bw/day`, während der Nährstoff selbst in
**g** geführt wird. Ohne sie zeigte Leucin das Tausendfache. Protein
steht in `g/kg` und braucht nur die Multiplikation.

`[cmd]` Nachgerechnet: `0,83 × 78,4 = 65,072 g/Tag`. Bei 20,66 g
gegessen sind das **31,7 %**.

`[cmd]` Für Leucin: `39 mg/kg × 78,4 = 3.057,6 mg = 3,058 g/Tag`; bei
1,70 g sind das **55,5 %**.

### Auch der angezeigte Referenzwert ist der aufgelöste

`[cmd]` `reference_value_min` liefert jetzt `65.072` mit Einheit `g` —
nicht mehr `0,83` mit `g/kg bw/day`. `[read]` Sonst könnte niemand die
31,7 % nachrechnen: die Zahl im Nenner wäre eine andere als die
angezeigte.

Ist die Bezugsgrösse nicht auflösbar, steht dort NULL statt des
Rohwerts.

## Warum absolut angezeigt wird

`[read]` Entscheidung Tom, 2026-08-15, nach einer Erhebung, wie
etablierte Ernährungs-Apps es halten: **keine zeigt eine Einheit je
Kilogramm.** MyFitnessPal nennt 1,2 g/kg als Zielsetzung in den
Einstellungen; im Tagebuch stehen 120 g.

## Ohne Gewicht kein Prozentwert

`[cmd]` Nachgemessen — Gewicht auf NULL gesetzt:

```
 PROT625 | 20,66 |        | | missing_weight
 LEU     |  1,70 |        | | missing_weight
 CA      | 75,20 | 950,00 | 7,9 % | complete
```

**Kein Standardgewicht, kein Rückfallwert.** `[read]` Dieselbe Regel wie
bei fehlendem Alter oder Geschlecht — und dieselbe, die GO-04 für die
Rückfälle `|| 1.55` und `targetCalories: 0` angewandt hat: ein
erfundener Nenner ist schlimmer als keine Zahl, weil er aussieht wie
eine Messung.

`[cmd]` Auch `reference_value_min` bleibt dann leer. `0,83` dort
stehenzulassen wäre irreführend: es ist kein Tageswert.

## Die vier `E%`-Zeilen

`[read]` `E%` ist keine Nährstoffempfehlung, sondern eine Aussage über
die Energieverteilung — „Fett soll 20 bis 35 % der Tagesenergie
ausmachen". Genau das rechnet GO-02 beim Zielwert; hier ein zweites Mal
zu rechnen hiesse zwei Wahrheiten zu führen.

`[cmd]` Sie erscheinen jetzt mit Status `energy_share` und ohne
Prozentwert. In der Oberfläche steht „Anteil an der Energie".

### Deckt GO-02 sie wirklich ab? Teilweise — ein Befund

Der Auftrag verlangt diese Prüfung. `[cmd]` `goals.berechne_zielwerte`
liefert für das Testprofil:

```
 kcal 2977,8 | protein_g 156,8 | carbs_g 401,6 | fat_g 82,7
```

| Nährstoff | von GO-02 abgedeckt? |
|---|---|
| `CHO` (Kohlenhydrate) | **ja** — `carbs_g` |
| `FAT` (Fett) | **ja** — `fat_g` |
| `FASAT` (gesättigte Fettsäuren) | **nein** |
| `F18:2CN6` (Linolsäure) | **nein** |
| `F18:3CN3` (Alpha-Linolensäure) | **nein** |

`[cmd]` Die Suche nach `F18:2CN6`, `F18:3CN3` und `Linol` in
`110_goals_zielwerte.sql` und `zielrichtung-kalorienzuschlag.json`
liefert **0 Treffer**. GO-02 kennt nur die drei Makros, keine einzelnen
Fettsäuren.

**Das ist ein Befund, keine Erledigung.** `[annahme]` Für die beiden
essenziellen Fettsäuren gibt es damit heute weder in der Bewertung noch
im Zielwert eine Aussage. `FASAT` ist der harmlosere Fall — die Spec
führt ihn als „so wenig wie möglich", eine Obergrenze ohne Zahl.

## Die zwei `per_mj`-Zeilen

`[read]` Je Megajoule ist ein Fachmass für Nährstoffdichte: „1,6 mg
Niacin-Äquivalent je MJ zugeführter Energie". Es sagt nichts darüber,
ob heute genug gegessen wurde — bei halber Energiezufuhr wäre die halbe
Menge „richtig".

`[cmd]` Status `nutrient_density`, kein Prozentwert. In der Oberfläche
steht „je Megajoule".

## Wie viele der 16 heute überhaupt sichtbar sind

`[cmd]` Nur **5 von 16** erreichen die Bewertung:

| `basis` | erreichen die Bewertung |
|---|---|
| `per_kg_bw_per_day` | 2 von 10 (`PROT625`, `LEU`) |
| `energy_percent` | 2 von 4 (`CHO`, `FAT`) |
| `per_mj` | 1 von 2 (`THIA`) |

`[cmd]` Der Grund: `daily_reference_assessment` bewertet die 33
Nährstoffe, die `daily_summary` führt. Acht Aminosäuren, `NIAEQ` und die
beiden Fettsäuren sind dort nicht dabei.

**Die Reparatur deckt trotzdem alle 16 ab** — sie greift, sobald ein
Nährstoff in die Tagessumme aufgenommen wird. `[read]` Das ist der
Unterschied zwischen „heute kein Problem" und „behoben".

## Nachweis

`[cmd]` **Protein: 1.593 % → 31,7 %** mit dem echten Profil (78,4 kg,
20,66 g gegessen, Referenz 65,072 g).
`[cmd]` **Leucin: 55,5 %** gegen 3,058 g — die mg→g-Umrechnung greift.

`[cmd]` Die C-48-Zahlen aus C-03, vorher und nachher:

| | vorher | nachher |
|---|---:|---:|
| `complete` | 41 | **37** |
| `incomplete` | 2 | 2 |
| `not_applicable` | 2 | 2 |
| `energy_share` | — | **3** |
| `nutrient_density` | — | **1** |
| **Summe** | 45 | **45** |

`[cmd]` Genau vier Zeilen haben `complete` verlassen: `CHO`, `FAT`,
`FASAT` (Energieanteil) und `THIA` (je MJ). **Nichts anderes hat sich
bewegt** — die Gesamtzahl ist unverändert.

`[cmd]` Kettenlauf von leer: `KETTE OK: 37.3s`, `SCHEMA VOLLSTAENDIG`.
Auf der frisch gebauten Datenbank dieselben Werte (31,7 % / 55,6 %) —
der Kettenschritt trägt die Reparatur, nicht nur die laufende Instanz.

`[cmd]` `pnpm gate`: 8 von 8. Tests: **182 von 182** (vorher 177; fünf
neue für die drei Zustände).

`[cmd]` Im Browser: „Protein (Nx6,25) PRI | 32 %", „Leucin PRI | 56 %",
„Kohlenhydrate RI | Anteil an der Energie", „Vitamin B1 AI | je
Megajoule". Drei Breiten ohne waagrechten Überlauf.

## Was live gelesen wird und was eingefroren ist

`[read]` Diese Trennung stand bisher nirgends. Sie steht jetzt als
Kommentar an der Funktion und hier.

| | eingefroren | live gelesen |
|---|---|---|
| **Nährwerte einer Mahlzeit** | ja (ADR-0003) | — |
| **Menge, Portion** | ja (C-03, C-51) | — |
| **Referenzwerte** | — | **ja** |
| **Profil** (Alter, Geschlecht, Gewicht) | — | **ja** |
| **Zielwerte** | — | mit `gueltig_ab` |

**Warum die Nährwerte eingefroren sind:** Eine Mahlzeit ist ein
Ereignis der Vergangenheit. Was am Dienstag gegessen wurde, bleibt am
Freitag dieselbe Menge Eisen, auch wenn der BLS-Wert inzwischen
korrigiert wurde. `[cmd]` In C-03 belegt: Lebensmittel auf 999 kcal
geändert, die Position blieb bei 348.

**Warum die Referenzwerte es nicht sind:** Ein Referenzwert ist das
Gegenteil — eine Aussage darüber, was *dieser Mensch* braucht. Er hängt
an Alter, Geschlecht, Gewicht, Schwangerschaft; alles Dinge, die sich
ändern, und deren **aktueller** Stand die richtige Grundlage ist. Wer
10 kg zunimmt, braucht mehr Protein, auch rückblickend betrachtet.

**Die Folge, die niemanden überraschen soll:** Ein Tagebucheintrag von
letzter Woche kann heute einen anderen Deckungsgrad zeigen als gestern,
**ohne dass etwas kaputt ist**. Die gegessene Menge steht fest; der
Massstab hat sich bewegt.

`[cmd]` Seit heute gilt das verstärkt: das **Körpergewicht** geht in
zehn Referenzwerte direkt ein. Wer sein Gewicht im Profil korrigiert,
ändert damit den Protein-Deckungsgrad jedes vergangenen Tages.

`[read]` Die Gegenprobe zeigt, warum die Alternative schlechter wäre:
Würde man Referenzwerte je Tag einfrieren, wäre ein alter Eintrag gegen
ein veraltetes Profil bewertet — gegen ein Gewicht, das die Person nicht
mehr hat. Das ist die schlechtere Aussage.

**Die Zielwerte sind der Mittelweg:** `goals.nutrition_targets` trägt
`gueltig_ab` und wirkt nur vorwärts. Ein Zielwechsel ändert vergangene
Tage nicht, ein Gewichtswechsel schon. `[annahme]` Das ist stimmig —
ein Ziel ist eine Absicht mit Datum, ein Referenzwert eine Eigenschaft
des Körpers.

## Was offen bleibt

- **`F18:2CN6` und `F18:3CN3`** haben weder Bewertung noch Zielwert
  (siehe oben).
- **11 der 16 Zeilen sind latent** — sie erreichen die Bewertung erst,
  wenn die Nährstoffe in `daily_summary` aufgenommen werden.
- **Kein Wert im Seed wurde geändert.** `[cmd]` `0,83 g/kg` steht
  unverändert dort; `nutrient_reference_values` und `nutrient_defs`
  sind unberührt.
