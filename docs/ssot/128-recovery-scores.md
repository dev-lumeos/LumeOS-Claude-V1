# C-125: Recovery-Scores und Modalitaeten

Stand: 2026-08-20

## Wie der Score rechnet

`[read]` Grundlage ist `docs/spezifikation/30-module/core/recovery/00-schemaentwurf.md`. Der stabile Kern wurde wie empfohlen gebaut: Manual-Modus ohne HRV, Gewichtung 30/15/15/10/15/10/5, ein Score-Schnappschuss je Nutzer und Tag, dazu die Einzelterme.

`[cmd]` Kettenschritt `121_recovery_scores_modalities.sql` legt `recovery.scores` und `recovery.modality_log` an. Die Scores werden aus den vorhandenen Check-ins gerechnet; HRV bleibt im Manual-Modus leer und wird als `not_used_manual_mode` markiert. Nutrition faellt bis zur echten Verknuepfung auf 70 zurueck und traegt `fallback_c123_e9`.

`[cmd]` Beispieltag `dev@lumeos.app`, 2026-06-05:

| Term | Punkte |
|---|---:|
| Schlafqualitaet | 9,00 |
| Schlafdauer | 10,29 |
| subjektives Gefuehl | 4,50 |
| Muskelkater | 2,23 |
| Trainingslast | 7,74 |
| Nutrition | 7,00 |
| Mood | 2,25 |
| Modalitaeten | 0,00 |

`[cmd]` Ergebnis: Score 43,0. Der Tag rechnet ohne HRV. Ein Muskelkaterfall mit drei gemeldeten Muskeln nutzt nur diese drei Werte: `soreness_reported_count = 3`, `soreness_avg_used = 2,33`, `soreness_score = 22,3`.

`[cmd]` Live nachgerechnet: `dev@lumeos.app` und `tom.seed@example.com` tragen je 170 Scores und 89 Modalitaeten. `test-user@lumeos.local` traegt 0/0.

## Wo der Entwurf von den Quellen abweicht

`[read]` Der Entwurf nennt drei Formelfehler, die nicht uebernommen wurden.

`[cmd]` Der SQL-Score-Trigger aus `SPEC_06` wurde nicht gebaut, weil sein Trainingsterm fast immer volle Punkte ergibt.

`[cmd]` Die ACWR-Kurve aus dem Mockup-Motor wurde nicht gebaut, weil ACWR 1,4 dort den Score verbessert. Der gebaute Term senkt den Score bei erhoehter Last.

`[cmd]` Die gedruckten HRV-Anker wurden nicht gebaut. E1 entscheidet fuer V1 nur `manual`; HRV ist strukturell vorbereitet, aber nicht Teil der Rechnung.

`[read]` Die sechs Readiness-Texte werden nicht gespeichert. E3 verlangt Einzelabnahme der Texte; gespeichert wird nur die Zahl mit ihren Einzeltermen.

## Was als Konstante liegt und auf C-124 wartet

`[cmd]` Die festen Werte liegen zentral in `recovery.scoring_constants()`: Manual-Gewichte, Bonusdeckel 5, Nutrition-Rueckfall 70 und Platz fuer die Motivationsschwelle.

`[cmd]` Die Modalitaetswerte liegen zentral in `recovery.modality_bonus_value(text)`. Bis C-124 E5 entschieden ist, liefert sie 0. Seed-Zeilen tragen deshalb `bonus_source = pending_c124_e5`.

`[annahme]` Damit koennen Sauna, Massage, Eisbad und Dehnen jetzt protokolliert werden, ohne eine fachliche Bonuszahl zu erfinden.

## Was noch fehlt

`[read]` C-124 muss E5 Modalitaeten-Bonuswerte und E8 Motivationsschwelle liefern.

`[cmd]` Nicht gebaut wurden `hrv_readings`, `sleep_data`, `overtraining_alerts` und der Stress-Score. Das ist absichtlich: HRV und Schlafdaten haengen am Wearable-Import, Overtraining braucht Wochenverlauf und die offene Recherche, Stress folgt spaeter auf derselben Struktur.


**Berichtigt 2026-09-08 (G-383).** `[cmd]` **Der Satz darueber ist
teilweise ueberholt** ? **diese Tabellen EXISTIEREN inzwischen:**

    `recovery.overtraining_alerts`   seit C-421

`[cmd]` **Gemessen gegen `information_schema`.** `[read]` **Die
uebrigen Namen der Aufzaehlung stimmen weiter** ? **und genau das
war die Tuecke: wer stichprobenartig prueft, trifft einen wahren
Namen und haelt die ganze Zeile fuer belegt.**

`[cmd]` Die Tageswerte sind live eingespielt. RLS ist beidseitig belegt: als `dev@lumeos.app` sind 170 Scores und 89 Modalitaeten sichtbar, als `test-user@lumeos.local` keine.

`[cmd]` Nachweis: Kettenlauf ueber `kette-ausfuehren.ts` ok, `schema-vollstaendigkeit-pruefen.ts` Exit 0, `testdaten-pruefen.ts` Exit 0, `kette-readme-pruefen.ts` ok, `pnpm gate` gruen.
