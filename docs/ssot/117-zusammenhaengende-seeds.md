# C-78 — Zusammenhängende Seeds über 180 Tage

Datum: 2026-08-18

## Welches Profil und welcher Verlauf zugrunde liegen

`[cmd]` Der Testdaten-Erzeuger `supabase/_pipeline/_testdaten/testdaten-einspielen.ts` nimmt Startdaten:

```bash
pnpm exec tsx supabase/_pipeline/_testdaten/testdaten-einspielen.ts --start 2026-05-20 --next-start 2026-08-19 --days 90
```

`[cmd]` Der Lauf erzeugt seit C-97 ein erstes Fenster `2026-05-20` bis `2026-08-18` und ein zweites Fenster `2026-08-19` bis `2026-11-16`. Der Stichtag `2026-08-18` liegt damit im Seed; die Zukunft bleibt bis `2026-11-16` erhalten.

`[cmd]` Ergebnis für die drei Seed-Nutzer:

| Bereich | Zeilen |
|---|---:|
| Mahlzeiten | 2.169 |
| Positionen | 6.805 |
| Wassereinträge | 902 |
| Trainingssitzungen / Übungen / Sätze | 30 / 60 / 200 |
| Recovery-Check-ins | 170 |
| Körpermessungen / Umfänge | 181 / 27 |
| Supplement-Stacks / Items / Einnahmen | 1 / 4 / 4 |
| Medical-Befunde / Werte | 5 / 140 |

`[cmd]` `eigenes-konto-fuellen.sql` kopiert Tom Seed danach auf `dev@lumeos.app`. Live liegen auf `dev@lumeos.app` und `tom.seed@example.com` jeweils 725 Mahlzeiten, 181 Körpermessungen, 170 Recovery-Check-ins, 30 Trainingssitzungen und 5 Befunde. `test-user@lumeos.local` bleibt Prüfkonto mit 1 Mahlzeit, 2 Positionen und 1 Zielwert.

## Wie die Bilanz aufgeht

`[cmd]` Für `dev@lumeos.app` liefert `goals.adaptive_tdee(..., DATE '2026-11-16', 14)` Status `complete`: 14 Zufuhrtage, 14 Gewichtsmessungen, 84,83 kg bis 85,00 kg, `weight_delta_kg = 0,170`.

`[cmd]` Rückrechnung:

| Wert | Zahl |
|---|---:|
| Ø Zufuhr | 2.372,0 kcal |
| Formel-TDEE | 3.527,0 kcal |
| Raw TDEE aus Verlauf | 2.271,3 kcal |
| Adaptive TDEE | 3.150,3 kcal |
| Abstand adaptive zu Formel | -376,7 kcal |

`[cmd]` Bilanz: `0,170 kg × 7.700 / 13 Tage = 100,7 kcal/Tag`. `2.372,0 - 2.271,3 = 100,7 kcal/Tag`. Die Rückrechnung geht auf; der adaptive Wert liegt darüber, weil GO-15 `alpha = 0,3` nutzt und damit 70 % am Formelwert hält.

## Wo welcher Fall liegt

| Modul | Fall | Nutzer | Datum |
|---|---|---|---|
| Nutrition | Tag ohne Ziel | Tom | 2026-05-20 |
| Nutrition | Kalorien deutlich unter Ziel | Tom | 2026-05-25 |
| Nutrition | Kalorien deutlich über Ziel | Max | 2026-05-28 |
| Nutrition | Vitamin A über UL | Tom | 2026-05-23 |
| Nutrition | Natrium/Salz hoch | Max | 2026-05-22 |
| Nutrition | Lückenhafte Nährwerte | Max | 2026-05-24 |
| Nutrition | Mikronährstoffmangel | Max | 2026-05-27 |
| Nutrition | Leere Mahlzeiten | Tom | 2026-05-29 |
| Nutrition | Viele Positionen und gemischte Mengen | Tom | 2026-05-31 |
| Nutrition | Zwei Snacks am selben Tag | Tom | 2026-06-01 |
| Hydration | Deutlich unter Ziel und 14-Tage-Schnitt | Tom | 2026-06-03 |
| Goals | Phasenwechsel Maintenance → Lean Bulk | Tom | 2026-06-04 |
| Goals | Adaptive TDEE complete | Tom / Dev | 2026-11-16 |
| Goals | Meilenstein erreicht | Tom / Dev | 2026-11-16 |
| Goals | Meilenstein offen | Tom / Dev | 2026-11-16 |
| Goals | Meilenstein verfehlt | Tom / Dev | 2026-11-16 |
| Body | 181-Tage-Gewichtsverlauf | Tom / Dev | 2026-05-20 bis 2026-11-16 |
| Body | Navy-Körperfett mit Spanne | Tom / Dev | 2026-11-16 |
| Recovery | Schlechte Erholung ohne HRV | Tom / Dev | 2026-06-05 |
| Recovery | Verlauf mit HRV-losen Check-ins | Tom / Dev | 2026-05-21 bis 2026-11-06 |
| Training | Mehrere Wochen Sitzungen | Tom / Dev | 2026-05-21 bis 2026-11-11 |
| Supplements | Geplante und genommene Einnahmen | Tom / Dev | 2026-06-05 |
| Supplements | Low-Stock Vitamin D3 | Tom / Dev | aktueller Stack |
| Medical | 34 Marker mit Verlauf | Tom / Dev | 2025-12-03 bis 2026-06-05 |
| Medical | Eindeutig / mehrdeutig / unbekannt im Import | Tom / Dev | 2026-06-06 |

## Was der heutige Tag jetzt enthält

`[cmd]` Am `2026-08-18` liegen für `tom.seed@example.com` und `dev@lumeos.app` jeweils Tagesdaten:

| Tabelle | Gesamt je Nutzer | Zeilen am 2026-08-18 |
|---|---:|---:|
| `nutrition.meals` | 725 | 4 |
| `nutrition.water_logs` | 361 | 2 |
| `recovery.checkins` | 170 | 1 |
| `goals.body_measurements` | 181 | 1 |
| `training.workout_sessions` | 30 | 0 |

`[cmd]` `nutrition.daily_summary` liefert für Tom am `2026-08-18`: 4 Mahlzeiten, 13 Positionen, 2.372,0 kcal.

`[cmd]` `goals.adaptive_tdee(tom, current_date, 14)` liefert jetzt `complete`: 14 Zufuhrtage, 14 Gewichtsmessungen, Formel-TDEE 3.527,0 kcal, adaptiver TDEE 3.192,9 kcal, Abstand -334,1 kcal.

`[cmd]` Training wurde nicht künstlich auf täglich gezogen. Am `2026-08-18` gibt es 0 Sitzungen; der Erzeuger nutzt weiter sein Sitzungsmuster.

`[cmd]` `test-user@lumeos.local` bleibt klein: 1 Mahlzeit, 2 Positionen, 1 Zielwert, keine Wasser-, Recovery-, Trainings-, Körpermessungs- oder Medical-Zeilen.

## Ob die Lücke morgen wiederkommt

`[cmd]` Nein. Die Ursache war die rechte Grenze des ersten Fensters: `start + days - 1` endete bei `2026-08-17`. Der Erzeuger nutzt jetzt für das erste Fenster `start + days`; damit ist `2026-08-18` enthalten.

`[cmd]` Das zweite Fenster bleibt `2026-08-19` bis `2026-11-16`. Für `tom.seed@example.com` liegen am `2026-08-19` bereits 4 Mahlzeiten. Morgen entsteht daher keine neue Lücke.

`[annahme]` Der globale Maximalwert je Tagestabelle bleibt wegen des Zukunftsfensters bewusst in der Zukunft, nicht auf `current_date`: Mahlzeiten, Wasser und Körpermessungen reichen bis `2026-11-16`. Der relevante C-97-Nachweis ist, dass `current_date` nicht mehr fehlt.

## Was nicht abgebildet werden konnte

`[read]` Keine neuen Tabellen wurden gebaut. Deshalb bleiben Schlaf-Rohdaten, HRV-Minutenverläufe, Muskelzustände und Trainingspausen als eigene Ereignisse außerhalb des Seeds. Der Seed nutzt, was das aktuelle Schema tragen kann: `recovery.checkins`, `workout_sessions`, `workout_sets`, `body_measurements`, `nutrition.meals`, Supplements und Medical.

`[annahme]` Die Daten sind konsistent genug für Rückrechnungen und UI-Zustände, aber nicht physiologisch vollständig. Laborwerte, Supplements, Training und Gewicht sind plausibel bewegt, aber keine echte Studie. Für Produktprüfungen ist das richtig; für fachliche Auswertungen echter Gewohnheiten bleibt `nutrition.search_events` und später echte Nutzerdaten maßgeblich.

## Nachweis

`[cmd]` Kettenlauf über `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts`: Exit 0 auf Wegwerf-Datenbank `lumeos_kette_20260818102543`, Schema-Backup `backup/schema/20260818102543_c43_vor_kettenlauf.sql`.

`[cmd]` Testdatenlauf: Exit 0, 2.169 Mahlzeiten, 6.805 Positionen, 902 Wassereinträge, 181 Körpermessungen, 170 Recovery-Check-ins.

`[cmd]` `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts`: Exit 0.

`[cmd]` `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`: Exit 0.

## C-101 — Wie die Streuung entsteht

`[cmd]` Vor C-101 trug jeder normale Tag dieselben 13 Positionen, 1.786 g und dieselben zwölf Lebensmittel; über den gesamten Seed-Bestand kamen nur 17 verschiedene Lebensmittel vor. Die Anzeige wechselte korrekt, aber die Daten boten nichts zum Wechseln.

`[cmd]` Der Erzeuger variiert jetzt deterministisch, nicht zufällig:

| Mechanik | Wirkung |
|---|---|
| Lebensmittelrotation | Austausch innerhalb belegter BLS-Codes, z. B. Obst, Getreide, Proteinquelle, Gemüse, Milchprodukt |
| Tagesfaktor | kleine Schwankung um den Mittelwert |
| Mahlzeitenfaktor | Frühstück, Mittag, Snack und Abendessen schwanken unabhängig |
| Positionsfaktor | verhindert gleiche Tagesgramm-Summen trotz ähnlicher Struktur |
| Szenariotage | explizite Tage für Makros unter/über Ziel |

`[read]` Die Kopplung aus C-78 bleibt erhalten: Gewicht und Zufuhr werden nicht unabhängig neu erfunden. Die Streuung liegt um den Verlauf, nicht statt des Verlaufs.

`[cmd]` Live auf `dev@lumeos.app` nach dem Lauf:

| Kennzahl | Minimum | Mittel | Maximum | verschiedene Werte |
|---|---:|---:|---:|---:|
| Tagesgramm | 95,0 g | 1.789,2 g | 2.279,0 g | 155 |
| Tageskalorien | 291,5 kcal | 2.397,8 kcal | 4.016,6 kcal | 179 |

`[cmd]` Unterschiedliche Lebensmittel: 49 auf `dev@lumeos.app`; 50 über die drei Seed-Nutzer. Die Zahl ist bewusst weit unter 7.140, aber hoch genug, dass Tage im Diary sichtbar verschieden sind.

## Wo welcher Fall liegt

`[cmd]` Die Makrofälle liegen jetzt auf `dev@lumeos.app`, nicht nur auf einem nicht anmeldbaren Seed-Nutzer:

| Fall | Datum | Ist | Ziel | Anteil |
|---|---|---:|---:|---:|
| Protein niedrig | 2026-06-08 | 36,1 g | 170,0 g | 21,3 % |
| Protein hoch | 2026-06-09 | 242,6 g | 170,0 g | 142,7 % |
| Fett niedrig | 2026-06-10 | 16,5 g | 75,0 g | 22,0 % |
| Fett hoch | 2026-06-11 | 202,3 g | 75,0 g | 269,7 % |
| Kohlenhydrate niedrig | 2026-06-12 | 27,0 g | 313,0 g | 8,6 % |
| Kohlenhydrate hoch | 2026-06-13 | 517,3 g | 313,0 g | 165,3 % |

`[cmd]` Die älteren Szenariotage aus C-78/C-97 bleiben bestehen: Mikronährstoffmangel, Vitamin A über UL, Salz/Natrium hoch, lückenhafte Nährwerte, leere Mahlzeiten, Tag ohne Mahlzeit, viele Positionen, zwei Snacks und Hydration unter Ziel laufen weiter durch `testdaten-pruefen.ts`.

## Dass die Bilanz weiter aufgeht

`[cmd]` `goals.adaptive_tdee(dev@lumeos.app, current_date, 14)` bleibt `complete`: 14 von 14 Zufuhrtagen und 14 Gewichtsmessungen.

| Wert | Zahl |
|---|---:|
| Ø Zufuhr im Fenster | 2.470,9 kcal |
| Formel-TDEE | 3.527,0 kcal |
| Raw TDEE aus Verlauf | 2.512,4 kcal |
| Adaptive TDEE | 3.222,6 kcal |
| Abstand adaptive zu Formel | -304,4 kcal |
| Gewicht | 84,40 kg → 84,33 kg |
| Gewichtsdelta | -0,070 kg |

`[cmd]` Rückrechnung: `-0,070 kg × 7.700 / 13 Tage = -41,5 kcal/Tag`. `2.470,9 - 2.512,4 = -41,5 kcal/Tag`. Die Bilanz geht weiter auf, jetzt mit bewegter Zufuhr.

## Wie es in den übrigen Modulen aussieht

`[cmd]` Training war ebenfalls zu flach bei den Satzwerten. C-101 variiert jetzt Gewicht, Wiederholungen und RPE entlang der 30 Sitzungen: 200 Sätze, 194 unterschiedliche Satzsignaturen.

`[cmd]` Recovery hatte bereits Streuung: 170 Check-ins, 48 unterschiedliche Kombinationen aus Schlafdauer, Schlafqualität, Energie und HRV. Der schlechte manuelle Check-in ohne HRV bleibt erhalten.

`[cmd]` Supplements sind kein Tagesverlauf, sondern ein punktueller Szenario-Seed: 4 Einnahmezeilen, 4 unterschiedliche Logs. Das reicht für `planned`/`taken` und Low-Stock, aber nicht für Compliance-Verläufe über Wochen.

`[cmd]` Nachweis C-101: Kettenlauf auf Wegwerf-DB `c101_seedcheck` mit `--keep-database`, Testdatenlauf und `testdaten-pruefen.ts` Exit 0; danach Wegwerf-DB verworfen. Live-Lauf auf `postgres`, Kopie nach `dev@lumeos.app`, `testdaten-pruefen.ts` Exit 0, `schema-vollstaendigkeit-pruefen.ts` Exit 0.
