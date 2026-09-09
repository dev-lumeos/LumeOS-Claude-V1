# C-67 Recovery-Check-ins

Stand: 2026-08-17

## Ausgangslage

[cmd] Vor diesem Schritt kam `recovery` in `supabase/_pipeline/` in keiner SQL-Datei vor. `/v2/recovery` konnte deshalb keine echte Kachel aus der Datenbank speisen.

[read] Die Designvorlage `docs/spezifikation/10-plattform/design-system/theme-v1/module-recovery-engine.jsx` enthält im Objekt `CHECKIN` die Felder, die die Attrappe heute verwendet: Datum, Logzeit, Schlafdauer, Schlafqualität, subjektives Gefühl, Stimmung, Soreness, Stress, Alkohol, Koffein, Bildschirmzeit und optional `hrv_rmssd`.

[read] `docs/specs/Recovery/SPEC_06_DATABASE_SCHEMA.md` beschreibt zehn Tabellen. Dieser Schritt übernimmt bewusst nur den Check-in-Zuschnitt. Die Tabelle heisst im Bau `recovery.checkins`, weil der Auftrag diese API-Fläche ausdrücklich so benennt; die Spec nennt `recovery.recovery_checkins`.

## Gebaut

[cmd] Neuer Kettenschritt `120`: `supabase/_pipeline/12_recovery/120_recovery_checkins.sql`.

[cmd] `recovery.checkins` trägt `user_id`, `entry_date`, `checkin_time`, Schlaf-, Stimmungs-, Energie-, Soreness-, Stress- und Lifestyle-Felder sowie optionale Wearable-Werte. `hrv_rmssd` ist nullable; ein Check-in ohne HRV bleibt vollständig speicherbar.

[cmd] Zeilenschutz ist aktiv. `authenticated` hat `SELECT`, `INSERT`, `UPDATE`, `DELETE` auf eigene Zeilen; `service_role` hat `ALL`. Die Policies prüfen `auth.uid()` gegen `user_id`.

[cmd] `kette.json`, `supabase/README.md` und `daten/schema-sollstand.json` enthalten Schritt 120. `kette-readme-pruefen.ts` meldet: `README/Kette: ok (49 Schritte dokumentiert)`.

[cmd] Testdaten wurden ergänzt: 36 Recovery-Check-ins für Tom Miller vom 2026-08-03 bis 2026-09-07, darunter der Szenariotag 2026-08-18 ohne HRV.

## Was aus SPEC_06 nicht übernommen wurde

[read] Nicht übernommen wurden `recovery_scores`, `hrv_measurements`, `hrv_baselines`, `sleep_data`, `recovery_modalities`, `user_recovery_modalities`, `training_load_logs`, `overtraining_alerts`, `recovery_protocols`, `user_protocol_assignments` und die Recovery-Auswertungssichten.
<!-- @abwesend recovery.recovery_scores -->
<!-- @abwesend recovery.sleep_data -->
<!-- @abwesend recovery.hrv_readings -->
<!-- @abwesend training.training_load_logs -->
<!-- @abwesend recovery.user_protocol_assignments -->


**Berichtigt 2026-09-08 (G-383).** `[cmd]` **Der Satz darueber ist
teilweise ueberholt** ? **diese Tabellen EXISTIEREN inzwischen:**

    `recovery.scores`                34 Spalten, live
    `recovery.overtraining_alerts`   seit C-421
    `recovery.recovery_protocols`    seit C-421

`[cmd]` **Gemessen gegen `information_schema`.** `[read]` **Die
uebrigen Namen der Aufzaehlung stimmen weiter** ? **und genau das
war die Tuecke: wer stichprobenartig prueft, trifft einen wahren
Namen und haelt die ganze Zeile fuer belegt.**

[annahme] Der Grund ist jeweils derselbe: Diese Tabellen bauen auf Geräten, Trainingslast, Score-Formeln, Protokollen oder späterer Nutzerführung auf. Der Auftrag sollte nur den manuellen Check-in schaffen, nicht die zehn Tabellen aus der Spec materialisieren.

[read] `SPEC_05_METRICS_ALGORITHMS.md` und `SPEC_09_SCORING.md` beschreiben Formeln. Sie wurden nicht umgesetzt, weil der Auftrag ausdrücklich keine Formeln bauen wollte und der Erholungswert dieselbe offene Gewichtungsfrage wie C-49 hat.

## Ein Check-in je Tag oder mehrere

[read] `SPEC_02_ENTITIES.md` beschreibt den Recovery-Check-in als `1/Tag` mit UPSERT-Semantik.

[cmd] Die Tabelle hat deshalb `UNIQUE(user_id, entry_date)`. Das unterscheidet sie bewusst von `nutrition.meals`, wo der eindeutige Typ-Index fallen musste, weil zwei Snacks echte getrennte Ereignisse sind.

[annahme] Ein Morgen- und Abend-Check-in wären fachlich möglich, bräuchten aber ein zusätzliches Feld wie `checkin_kind` und eine Entscheidung, welcher Check-in den Tageszustand oder später den Score speist. Das wurde nicht geraten.

## Zeit und Zeitzone

[read] C-61 hat für Mahlzeiten entschieden: Ortsdatum plus editierbare Ortszeit; keine serverseitige UTC-Zeit als fachlicher Essenszeitpunkt.

[cmd] `recovery.checkins` nutzt dieselbe Form: `entry_date date` und `checkin_time time`. Es gibt keinen `DEFAULT now()` für `checkin_time`, damit der Server in UTC nicht unbemerkt eine falsche Ortszeit setzt. Die Oberfläche muss die aktuelle lokale Zeit vorbelegen und editierbar machen.

## Welche der sieben Kacheln jetzt echt werden können

[annahme] Die folgenden Kacheln können jetzt datenbasiert werden, ohne HRV oder weitere Recovery-Tabellen vorauszusetzen:

- Check-in-Tab mit Tagesdatensatz.
- Kopfzeile mit heutigem Check-in-Status und Logzeit.
- Manual-Recovery-Datenbasis aus Schlaf, subjektivem Gefühl, Stimmung, Energie, Stress und Soreness.
- Subjektiver Schlafpfad aus `sleep_hours` und `sleep_quality`.
- Mood/Energy/Motivation-Darstellung.
- Stress- und Lifestyle-Darstellung aus Stress, Alkohol, Koffein und Bildschirmzeit.
- Soreness-Darstellung aus dem JSONB-Feld `soreness`.

[annahme] Der eigentliche Recovery-Score wird dadurch noch nicht echt. Dafür fehlt weiterhin die bestätigte Formel.

## Nachweis

[cmd] Kettenlauf in Wegwerf-Datenbank `lumeos_kette_c67`: `KETTE OK: 42.3s`, `SCHEMA VOLLSTAENDIG`.

[cmd] Testdaten in der Wegwerf-Datenbank: `3 Nutzer, 513 Mahlzeiten, 1561 Positionen, 212 Wassereintraege, 9 Trainingssitzungen, 18 Trainingsuebungen, 60 Saetze, 36 Recovery-Check-ins`.

[cmd] `testdaten-pruefen.ts` in der Wegwerf-Datenbank: `OK: C-82 Testdaten stimmen.`

[cmd] RLS SELECT: Tom sieht 36 Recovery-Check-ins, Max sieht 0. RLS INSERT: Max kann keinen Check-in für Tom einfügen; PostgreSQL meldet `new row violates row-level security policy for table "checkins"`.

[cmd] Cleanup in der Wegwerf-Datenbank: `Recovery Check-ins: 0`, `foods/food_nutrients: 7140/869501`, `OK: C-82 Testdaten stimmen.`

[cmd] Live nach Schritt 120: `schema-vollstaendigkeit-pruefen.ts` meldet `SCHEMA VOLLSTAENDIG`.

[cmd] Live-Testdaten: `Recovery Check-ins: 36`; `testdaten-pruefen.ts` meldet `OK: C-82 Testdaten stimmen.`

[cmd] Live-Szenariotag 2026-08-18: `sleep_hours 4.8`, `sleep_quality 3`, `subjective_feeling 3`, `mood tired`, `hrv_rmssd NULL`, `soreness {"chest": 3, "lower_back": 2, "quadriceps": 2}`.

[cmd] `pnpm gate` läuft durch Encoding, i18n, Tests und mehrere Builds, bricht aber im Web-Build an paralleler UI-Arbeit ab: `apps/web/src/app/v2/supplements/daten.ts:90:5` setzt `refillUrgent`, das im Typ `StackItem` nicht existiert. Recovery- und Supabase-Dateien sind nicht die Ursache.
