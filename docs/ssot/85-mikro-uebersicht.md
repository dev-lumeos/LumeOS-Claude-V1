# Micronutrient-Overview

**Stand:** 2026-08-16

## Ausgang

`[cmd]` Die Vorlage zeigt zwei Kacheln ohne echte Datenquelle:
`Micronutrient snapshot` mit acht Werten und `Below threshold` mit einer
Zaehlliste unter einem Grenzwert.

`[cmd]` `nutrition.daily_reference_assessment` liefert je Naehrstoff
bereits `actual_value`, `reference_value_min`, `reference_pct`,
`reference_kind`, `reference_direction`, `reference_status` und
`nutrient_display_tier`. Es fehlten Auswahl und Schwelle, nicht die
Berechnung selbst.

`[cmd]` `display_tier = 1` hat 31 Naehrstoffe. Das traegt als
Anzeigeordnung, ist aber zu breit fuer ein Netzdiagramm mit acht Achsen.

## Umsetzung

`[cmd]` Neuer Kettenschritt `059a`:
`supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts`.

`[cmd]` Der Schritt erzeugt `nutrition.micronutrient_overview_items` mit
acht kuratierten Eintraegen aus
`supabase/_pipeline/daten/mikro-uebersicht.json` sowie zwei
Lesefunktionen:

- `nutrition.micronutrient_snapshot(user_id, entry_date)`
- `nutrition.micronutrient_below_threshold(user_id, entry_date, threshold_pct default 75)`

`[cmd]` `kette-readme-pruefen.ts` meldet
`README/Kette: ok (45 Schritte dokumentiert)`.

`[cmd]` Wegwerf-Kettenlauf ueber `kette-ausfuehren.ts`:
`KETTE OK: 39.2s`, Abschlusspruefung `SCHEMA VOLLSTAENDIG`.

`[cmd]` Live eingespielt am 2026-08-16. Die Schemapruefung gegen
`postgres` meldet Tabellen 22/22, Funktionen 18/18,
`micronutrient_overview_items 8 / 8 ok` und `SCHEMA VOLLSTAENDIG`.

## Auswahl fuer das Netzdiagramm

`[cmd]` Die acht Achsen sind kuratiert und versioniert:

| Reihenfolge | Code | Anzeige |
|---:|---|---|
| 1 | `VITC` | Vitamin C |
| 2 | `VITD` | Vitamin D |
| 3 | `FE` | Eisen |
| 4 | `CA` | Calcium |
| 5 | `MG` | Magnesium |
| 6 | `ZN` | Zink |
| 7 | `VITB12` | Vitamin B12 |
| 8 | `F18:3CN3` | Omega-3 (ALA) |

`[read]` Die Vorlage nennt acht konkrete Werte. `[cmd]` Eine Ableitung
aus `display_tier` waere nicht eindeutig, weil Stufe 1 allein 31 Codes
enthaelt. Deshalb liegt die Auswahl in einer Datendatei statt fest im
SQL-Code.

`[cmd]` Omega-3 ist im Bestand mehrdeutig: `FAPUN3` ist
Omega-3 gesamt, `F18:3CN3` ist Alpha-Linolensaeure, EPA und DHA stehen
als Einzelfettsaeuren. `[cmd]` Einen Prozentwert gibt es seit C-52 fuer
`F18:3CN3` ueber Goals. Deshalb wird im Snapshot **Omega-3 (ALA)** gegen
den Goals-Zielwert gerechnet. Gesamt-Omega-3, EPA und DHA werden nicht
zusammengerechnet.

## Wo die Schwelle liegt und warum

`[cmd]` `micronutrient_below_threshold` nutzt standardmaessig 75 %.

`[annahme]` Die Vorlage zeigt Beispiele im Bereich etwa 40 bis 70 % des
Ziels. 75 % trennt deutlich niedrige Werte von knapp verfehlten Werten,
ohne daraus eine medizinische Warnung zu machen.

`[read]` C-49 haelt fest, dass Warnungen bei Unterversorgung eine eigene
medizinisch heikle Produktentscheidung sind. Diese Funktion bewertet
deshalb nicht in Worten; sie sortiert nur vollstaendig bewertbare
Target-Zeilen unterhalb der Schwelle.

`[cmd]` Ausgeschlossen sind `reference_direction <> 'target'`,
`reference_status <> 'complete'`, fehlende Prozentwerte,
`NO_REFERENCE`, `NO_STANDALONE_REFERENCE`, `energy_share` und
`nutrient_density`. Eine Obergrenze unter 75 % waere gut, nicht schlecht.
Ein unvollstaendiger Naehrstoff ist nicht zu niedrig, sondern
unvollstaendig erfasst.

## Nachweis

`[cmd]` Fuer `dev@lumeos.app` am 2026-09-13 liefert
`micronutrient_snapshot` exakt acht Zeilen. Beispiele:

| Code | Ist | Ziel | Prozent | Status |
|---|---:|---:|---:|---|
| `VITD` | 8.718 ug | 15.000 ug | 58.1 | `complete` |
| `CA` | 735.79488 mg | 950.000 mg | 77.5 | `complete` |
| `MG` | 595.71150 mg | 350.000 mg | 170.2 | `complete` |
| `F18:3CN3` | 1.38572 g | 2.2 g | 63.0 | `complete` |

`[cmd]` Am selben Tag liefert `micronutrient_below_threshold`:
`total_assessed = 20`, `below_count = 4`. Die vier Eintraege sind
Natrium, Salz, Wasser und Vitamin D. Die Vorlagenzahl 117 ist damit
nicht real; real ist die Zahl der vollstaendig bewerteten Target-Zeilen
des Tages.

`[cmd]` Der Szenariotag fuer Mikronaehrstoffmangel greift:

| Tag | Bewertet | Unter 75 % |
|---|---:|---:|
| Tom Miller, 2026-08-16 | 20 | 4 |
| Max Schmidt, 2026-08-09 | 17 | 16 |

`[cmd]` `testdaten-pruefen.ts` prueft jetzt zusaetzlich: acht
Snapshot-Zeilen, ALA mit `reference_kind = 'GOAL'` und eine laengere
Below-threshold-Liste am Mangel-Szenariotag. Ergebnis: 3 Nutzer,
512 Mahlzeiten, 1.560 Positionen, 212 Wassereintraege,
`OK: C-82 Testdaten stimmen.`

## Was diese Funktionen nicht tun

`[read]` Die Oberflaeche gehoert nicht zu diesem Schritt. Die Funktionen
liefern Daten fuer die Kacheln, aber keine Darstellung.

`[read]` `daily_reference_assessment` bleibt unveraendert. Die
Snapshot-Funktion liest sie; nur ALA bekommt den Nenner aus Goals, weil
GO-00 `E%` bewusst aus der Naehrstoffbewertung herausgenommen hat.

`[annahme]` Die Schwelle 75 % ist ein Sortierkriterium fuer die Kachel,
kein Diagnose- oder Warnwert. Ob daraus spaeter eine Warnung wird,
gehoert zu C-49.
