---
nr: C-542
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-426
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 102522ee
beruehrt:
  tabellen: [supplements.intake_logs, nutrition.meal_items]
zahlen:
  gemessen: 2026-09-24
  obergrenze_complete_vorher: 1
  obergrenze_complete_nachher: 10
---

# C-542 - eine Abwesenheit ist keine Luecke

## Befund

Aus G-426, Claude Code, 2026-09-08:

> *,,`meal_supplement_missing_count` zaehlt `item_count -
> value_count`, wodurch ein Praeparat, das einen Naehrstoff
> schlicht NICHT ENTHAELT, als fehlende Messung gilt. Bei sieben
> Whey-Posten heisst das fuer jeden Mikronaehrstoff missing = 7."*

> *,,Eine Abwesenheit ist keine Luecke."*

## Selbst nachgemessen

`[cmd]` **Die Obergrenze am 2026-09-22:**

    complete                    1
    incomplete_supplements     16
    unresolved_fortified_food   1

`[cmd]` **Und `missing 7` bei 126 Naehrstoffen** ? **von VITK
ueber ZN bis F22:6CN3.**

`[read]` **Ein Whey-Pulver enthaelt kein Vitamin K** ? **das
ist keine fehlende Messung, das ist eine Null.**

## Warum es zaehlt

`[cmd]` **1 von 18 Zeilen ist rechenbar** ? **die Obergrenze
ist an den meisten Tagen unbrauchbar.**

`[read]` **Und sie ist der Grund, warum C-466 gebaut wurde:
wer Praeparate nimmt, soll sehen, ob er ueber die Grenze
kommt.**

## Was zu unterscheiden ist

    NICHT ENTHALTEN   das Etikett fuehrt den Stoff nicht
                      -> eine Null, kein Loch
    NICHT GEMESSEN    das Etikett nennt ihn ohne Menge
                      -> ein Loch

`[cmd]` **C-496 hat `amount_qualifier` (not_stated, exact,
less_than, greater_than)** ? **MISS, ob das die Unterscheidung
schon traegt.**

`[cmd]` **Und G-466 hat gemessen: `not_stated` heisst *ohne
Mengenangabe*, nicht *nicht enthalten*.**

## Abnahmebedingungen

    A1  was heute als missing zaehlt: aufgeschluesselt.
    A2  traegt amount_qualifier die Unterscheidung?
        Gemessen.
    A3  nach der Behebung: wie viele Zeilen sind
        rechenbar? Zahl vorher/nachher.
    A4  Gegenprobe: ein Stoff MIT Menge, aber ohne Wert,
        zaehlt weiter als Luecke.
    A5  G-426 zeigt die Obergrenze danach richtig --
        GEMELDET, damit Claude Code nachzieht.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht, 2026-09-24

### A1 - die alte Zaehlung und ihr Rest

Der alte Meal-Weg setzte fuer jeden `nutrition.nutrient_defs`-Code
`meal_supplement_item_count - value_count` an. Mit sieben Whey-Einnahmen
entstanden daher 126-mal `missing = 7` und dreimal `missing = 4`:
Nicht im Etikett gefuehrte Stoffe wurden wie fehlende Messwerte behandelt.

Nach C-542 bleiben am gemessenen Tag nur vier echte, benannte Luecken:

| Code | missing | Produkt-Intakes | Supplementmenge |
|---|---:|---:|---:|
| `CA` | 4 | 7 | 420 |
| `FE` | 4 | 7 | 2,1 |
| `VITA` | 4 | 7 | -- |
| `VITC` | 4 | 7 | -- |

Sie stehen auf sechs eingefrorenen Intakes als `{CA,FE,VITA,VITC}`. Die
sechs anderen Produkt-Intakes tragen bewusst `{}`. Nicht genannte
Naehrstoffe erzeugen damit keinen Missing-Zaehler mehr; ein Produkt ohne
jedwede Naehrwertgrundlage bleibt weiterhin vollstaendig unbekannt.

### A2 - `amount_qualifier` traegt die Unterscheidung

Der Katalog unterscheidet die Sachverhalte schon:

| Qualifier | Zeilen | ohne Menge |
|---|---:|---:|
| `exact` | 1.394.584 | 0 |
| `less_than` | 14.598 | 0 |
| `greater_than` | 737 | 0 |
| `not_stated` | 1.591.063 | 1.591.063 |

Davon sind 85.041 mengenlose Zeilen auf einen Naehrstoffcode abbildbar
(81.804 Produkt/Naehrstoff-Paare). Vor C-542 ging diese Information beim
Erzeugen von `supplier_product_nutrients_snapshot` verloren.

Die Migration legt deshalb
`supplements.intake_logs.supplier_product_unmeasured_nutrient_codes` an.
Der neue Intake-Weg friert nur die pro gewaehlter Portion genannten
`not_stated`-Codes ein. Der Backfill ergaenzte zwoelf vorhandene
Produkt-Intakes einmalig; spaetere Lesewege konsultieren dafuer keine
veraenderliche Produktkatalog-Zeile.

### A3 - Obergrenze rechenbar, vorher/nachher

Fuer den Nutzer und den 2026-09-22:

| `upper_limit_status` | vorher | nachher |
|---|---:|---:|
| `complete` | 1 | 10 |
| `incomplete_supplements` | 16 | 4 |
| `incomplete_foods` | 0 | 3 |
| `unresolved_fortified_food` | 1 | 1 |

Damit sind 10 statt 1 von 18 Obergrenzen rechenbar. Die drei
`incomplete_foods` waren zuvor durch den Supplementfehler verdeckt,
nicht von C-542 erzeugt.

### A4 - Gegenprobe

Der C-542-Integrationstest erzeugt zwei Produkt-Einnahmen: ein Whey mit
Protein, aber ohne Vitamin-K-Zeile, und ein Produkt, dessen Etikett
`Vitamin K` mit `amount_qualifier = not_stated` nennt. Er belegt: Protein
summiert sich zu 48 bei `missing = 0`; das nicht genannte Vitamin K bleibt
Null; das benannte, mengenlose Vitamin K bleibt bei `missing = 1` und wird
im Intake-Snapshot als `VITK` gespeichert.

### A5 - Meldung an Claude Code / G-426

`nutrition.nutrient_upper_limit_assessment_with_supplements` liefert fuer
den gemessenen Tag jetzt zehn `complete`-Zeilen. G-426 soll die Obergrenze
aus diesem aktuellen Status zeigen, insbesondere nicht mehr die alte
Aussage "1 von 18 rechenbar" oder die 126 pauschalen
Supplementluecken. Die vier verbliebenen `incomplete_supplements` sind
echte Hinweise auf eine genannte, aber mengenlose Etikettangabe.

### A6 - Sicherung und Pruefung

- Frische Schema-Sicherung vor dem Vollkettenlauf:
  `backup/schema/20260924065807_c43_vor_kettenlauf.sql`.
- Vollkette: `supabase/_pipeline/kette.json`, 270 Schritte, Exit-Code 0,
  gegen die aufbewahrte Wegwerf-Datenbank `lumeos_c542_chain`.
- C-542-Integrationstest gegen diese Vollkette: gruen. Der Red-Run
  scheiterte vorher erwartbar mit `missing = 2` statt der einen echten
  Luecke.
- `pnpm gate`: gruen, inklusive Waechter, Lint, Typpruefung, Tests und
  Builds.

Schema und Backfill sind auch in der lokalen Live-Datenbank eingespielt.
`apps/` und die Dev-Server wurden nicht angefasst.

## Abnahme

**2026-09-08, Orchestrator. LIVE, nachgemessen.**

    vorher   complete 1 von 18
    nachher  complete 10 von 18

`[cmd]` **Selbst gemessen am 2026-09-22:**

    complete                   10
    incomplete_supplements      4
    incomplete_foods            3
    unresolved_fortified_food   1

`[read]` **Seine Unterscheidung traegt:** *,,Nicht aufgefuehrte
Naehrstoffe zaehlen jetzt als NULL, nicht als Luecke. Explizit
genannte Stoffe ohne Menge (`not_stated`) bleiben korrekt
Luecken."*

`[cmd]` **Die vier Restluecken aus Supplementen: CA, FE, VITA,
VITC** ? **echte Loecher, keine Abwesenheiten.**

`[read]` **Und drei weitere aus der Nahrung** ? **die waren
immer da, sie fielen nur nicht auf, solange alles rot war.**

`[cmd]` **Vollkette 270 Schritte, Red/Green-Test, Gate.**

**Abgenommen.**

