---
nr: C-324
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: C-49
kinder: []
entscheidung: E-25
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-324 - Tages-Score Gewichtung festlegen

## Befund

E-25 entscheidet den Nutrition-Tagesscore: **NRF9.3 in der Originalfassung**, neun gefoerderte minus drei begrenzte Naehrstoffe, mit Deckel bei 100 Prozent je gefoerdertem Naehrstoff. Die Formel und ihre US-Referenzwerte sind damit entschieden; EFSA-Referenzen duerfen sie nicht ersetzen.

**Der Bau ist trotzdem blockiert.** Die Eingangsmenge fuer Vitamin A ist nicht dieselbe Bezugsgroesse wie die Originalformel:

| NRF9.3-Originalwert | `daily_summary` | Lage |
|---|---|---|
| Vitamin A: **5.000 IU** | `vita`: **µg Retinol-Aequivalent (RE)** | Nicht gleichartig. Der BLS-Wert enthaelt Retinol und Carotinoid-Aequivalente; eine IU-Umrechnung haengt von der Vitamin-A-Form ab. Im Repo existiert keine freigegebene Umrechnung. |
| Vitamin E: **30 IU**, in der Originaltabelle auch als etwa **20 mg Alpha-Tocopherol** gefuehrt | `vite`: mg Alpha-Tocopherol | Der Wert ist in der vorhandenen Einheit ausdrueckbar. |
| die uebrigen zehn Werte | g bzw. mg in passender Einheit | direkt verwendbar |

`[read]` Eine still gesetzte Umrechnung von `vita` nach IU wuerde weder die Originalformel bewahren noch eine EFSA-Abweichung vermeiden; sie waere eine neue, unbelegte Formelentscheidung. Deshalb keine Funktion und keine Referenzwert-Aenderung.

### Originalformel und sichtbare Abweichung

NRF9.3 bleibt nach E-25:

    (Protein/50 g + Ballaststoffe/25 g + VitA/5.000 IU
     + VitC/60 mg + VitE/30 IU + Calcium/1.000 mg + Eisen/18 mg
     + Magnesium/400 mg + Kalium/3.500 mg
     - gesaettigte Fette/20 g - Zucker/50 g - Natrium/2.400 mg) x 100

`[read]` Zwei Abweichungen muessen bei einer spaeteren Ausgabe sichtbar bleiben:

1. **NRF9.3-Originalreferenzen, nicht EFSA.** Der Score hat US-Daily-Values; die uebrigen Nutrition-Ansichten rechnen gegen individuelle EFSA/PRI/AI/UL-Referenzen. Beide Prozentwerte duerfen nicht gleich bezeichnet oder gegeneinander ausgetauscht werden.
2. **Gesamtzucker statt added sugar.** `daily_summary.sugar` ist Gesamtzucker. E-25 erlaubt diese von den Autoren untersuchte Variante, aber der Score muss sie als `total_sugar` ausweisen; sie ist nicht die strengere Originaleingabe `added_sugar`.

## Vormessung -- Wegwerf-Datenbank

Gemessen in `lumeos_c276_probe`, nicht gegen die laufende Datenbank. Zeitraum je Seed-Konto: **2026-05-20 bis 2026-11-16**. Die offenen Datumsgrenzen der Sicht schliessen damit die Zukunftszeilen bewusst ein.

| Konto | Tage | Protein >= 50 g und vollstaendig | Protein-Min/Max/Schnitt | `vitc_missing > 0` | mindestens ein NRF-Eingang unvollstaendig |
|---|---:|---:|---|---:|---:|
| `max.seed@example.com` | 180 | 177 | 0,8 / 224,6 / 173,0 g | 179 | 180 |
| `sarah.seed@example.com` | 181 | 181 | 69,3 / 154,1 / 106,5 g | 181 | 181 |
| `tom.seed@example.com` | 181 | 177 | 9,8 / 242,6 / 162,9 g | 180 | 180 |

### Deckelung

`[cmd]` Die Deckelung greift genau wie E-25 verlangt: an den genannten Tagen ist der Proteinterm `least(prot625 / 50, 1)` gleich **1,0**. Mehr Protein erhoeht den NRF9.3-Score dort nicht. Bei Sarah ist Protein an allen 181 Tagen gedeckelt; bei Max und Tom an 177 von jeweils 180 bzw. 181 Tagen. Das ist die belegte Konsequenz der Allgemeinbevoelkerungsformel fuer die Seed-Sportler, **kein Anlass fuer eine Sportler-Variante**.

### Fehlende Nährstoffe

`[cmd]` `vitc_missing` ist nicht die einzige Luecke, aber die dominante:

| Konto | Faser | VitA | VitC | VitE | Ca | Fe | Mg | K | ges. Fett | Zucker | Na |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Max | 36 | 0 | 179 | 31 | 1 | 2 | 4 | 1 | 1 | 0 | 39 |
| Sarah | 0 | 0 | 181 | 32 | 0 | 0 | 0 | 0 | 0 | 0 | 38 |
| Tom | 37 | 0 | 180 | 31 | 0 | 1 | 3 | 0 | 0 | 0 | 38 |

Die Zahlen sind Tage mit einem positiven `_missing`-Zaehler. Ein Sonderfall hatte zwar alle Zähler 0, aber keine Nährwertwerte und keinen Item-Inhalt; er ist ebenfalls kein scorefaehiger Tag.

**Erforderliches Verhalten fuer die noch zu bauende Funktion:**

- Ein Tag liefert nur dann einen `score`, wenn **alle zwoelf** NRF-Eingaenge einen Wert und `*_missing = 0` haben sowie `item_count > 0` ist.
- Sonst liefert er `score = NULL` und den Status `incomplete` bzw. `no_data`, mit den fehlenden NRF-Codes. Fehlende Werte duerfen niemals als 0 in die Formel eingehen.
- Ein Zeitraum nach E-24 mittelt erst die Tagesmengen und rechnet danach. Enthält er unvollständige oder leere Tage, darf er keinen vollständigen Zeitraumscore vortäuschen; der Status und die Zahl unvollständiger Tage gehören zur Antwort.

`[read]` Das ist C-48 Regel 1 in Score-Form. Mit dem gegenwärtigen Seedbestand wäre ein ehrlicher NRF9.3-Score für alle drei Konten fast immer `incomplete`; eine numerische Spannweite oder Laufzeit wäre daher keine Messung des Scores, sondern der Fehler, den C-48 verbietet.

## Entscheidung

**C-324 ist teilweise entschieden, technisch offen.**

- **entschieden:** NRF9.3, Originalreferenzen, 100-Prozent-Deckelung, Gesamtzucker mit Herkunftsmarkierung, keine Sportler-Variante.
- **offen und blockierend:** eine belegte, explizit freigegebene Zuordnung von BLS-`vita` (µg RE) zur NRF9.3-Referenz in IU.
- **nicht gebaut:** keine Funktion, kein Schema, kein UI. Das vermeidet eine nicht belegte Umrechnung und einen Score, der unvollständige Tagessummen als Ergebnisse ausgibt.

## Quellen

- E-25: Drewnowski, *Defining Nutrient Density: Development and Validation of the Nutrient Rich Foods Index*, J Am Coll Nutr. DOI: 10.1080/07315724.2009.10718106.
- Fulgoni, Keast, Drewnowski, *Development and Validation of the Nutrient-Rich Foods Index*, J Nutr 2009. DOI: 10.3945/jn.108.101360.

## Abnahme

_(vom Orchestrator)_
