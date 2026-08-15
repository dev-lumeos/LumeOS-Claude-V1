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
