# C-78 — Zusammenhängende Seeds über 180 Tage

Datum: 2026-08-18

## Welches Profil und welcher Verlauf zugrunde liegen

`[cmd]` Der Testdaten-Erzeuger `supabase/_pipeline/_testdaten/testdaten-einspielen.ts` nimmt jetzt Startdaten:

```bash
pnpm exec tsx supabase/_pipeline/_testdaten/testdaten-einspielen.ts --start 2026-05-20 --next-start 2026-08-19 --days 90
```

`[cmd]` Der Lauf erzeugt zwei 90-Tage-Fenster: `2026-05-20` bis `2026-08-17` und `2026-08-19` bis `2026-11-16`. Damit liegen Vergangenheit und Zukunft relativ zum Stichtag `2026-08-18`, ohne die Daten neu zu erfinden, wenn die Zukunft aufgebraucht ist.

`[cmd]` Ergebnis für die drei Seed-Nutzer:

| Bereich | Zeilen |
|---|---:|
| Mahlzeiten | 2.157 |
| Positionen | 6.767 |
| Wassereinträge | 897 |
| Trainingssitzungen / Übungen / Sätze | 30 / 60 / 200 |
| Recovery-Check-ins | 170 |
| Körpermessungen / Umfänge | 180 / 27 |
| Supplement-Stacks / Items / Einnahmen | 1 / 4 / 4 |
| Medical-Befunde / Werte | 5 / 140 |

`[cmd]` `eigenes-konto-fuellen.sql` kopiert Tom Seed danach auf `dev@lumeos.app`. Live liegen auf `dev@lumeos.app` und `tom.seed@example.com` jeweils 721 Mahlzeiten, 180 Körpermessungen, 170 Recovery-Check-ins, 30 Trainingssitzungen und 5 Befunde. `test-user@lumeos.local` bleibt Prüfkonto mit 1 Mahlzeit, 2 Positionen und 1 Zielwert.

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
| Body | 180-Tage-Gewichtsverlauf | Tom / Dev | 2026-05-20 bis 2026-11-16 |
| Body | Navy-Körperfett mit Spanne | Tom / Dev | 2026-11-16 |
| Recovery | Schlechte Erholung ohne HRV | Tom / Dev | 2026-06-05 |
| Recovery | Verlauf mit HRV-losen Check-ins | Tom / Dev | 2026-05-21 bis 2026-11-07 |
| Training | Mehrere Wochen Sitzungen | Tom / Dev | 2026-05-21 bis 2026-11-14 |
| Supplements | Geplante und genommene Einnahmen | Tom / Dev | 2026-06-05 |
| Supplements | Low-Stock Vitamin D3 | Tom / Dev | aktueller Stack |
| Medical | 34 Marker mit Verlauf | Tom / Dev | 2025-12-03 bis 2026-06-05 |
| Medical | Eindeutig / mehrdeutig / unbekannt im Import | Tom / Dev | 2026-06-06 |

## Was nicht abgebildet werden konnte

`[read]` Keine neuen Tabellen wurden gebaut. Deshalb bleiben Schlaf-Rohdaten, HRV-Minutenverläufe, Muskelzustände und Trainingspausen als eigene Ereignisse außerhalb des Seeds. Der Seed nutzt, was das aktuelle Schema tragen kann: `recovery.checkins`, `workout_sessions`, `workout_sets`, `body_measurements`, `nutrition.meals`, Supplements und Medical.

`[annahme]` Die Daten sind konsistent genug für Rückrechnungen und UI-Zustände, aber nicht physiologisch vollständig. Laborwerte, Supplements, Training und Gewicht sind plausibel bewegt, aber keine echte Studie. Für Produktprüfungen ist das richtig; für fachliche Auswertungen echter Gewohnheiten bleibt `nutrition.search_events` und später echte Nutzerdaten maßgeblich.

## Nachweis

`[cmd]` Kettenlauf über `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts`: Exit 0 auf Wegwerf-Datenbank `lumeos_kette_20260818100104`, Schema-Backup `backup/schema/20260818100104_c43_vor_kettenlauf.sql`.

`[cmd]` Testdatenlauf: Exit 0, 2.157 Mahlzeiten, 6.767 Positionen, 180 Körpermessungen, 170 Recovery-Check-ins.

`[cmd]` `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts`: Exit 0.
