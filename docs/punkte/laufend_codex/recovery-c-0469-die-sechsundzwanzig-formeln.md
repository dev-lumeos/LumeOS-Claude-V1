---
nr: C-469
typ: messung
modul: recovery
schwere: hoch
angelegt: 2026-09-11
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-11
beruehrt:
  tabellen: [recovery.checkins, recovery.scores, recovery.modality_log, recovery.recovery_protocols]
zahlen:
  gemessen: 2026-09-11
  formeln_und_daten_namen: 26
  direkt_vorhanden: 21
  bewusst_nicht_bauen: 5
---

# C-469 — die sechsundzwanzig Recovery-Formeln

## Auftrag

`tools/vollstaendigkeit.mjs recovery` zaehlt 26 Konstanten und
`calc*`-Namen aus dem lebenden Recovery-Entwurf. Die Messung trennt
Namen, vorhandene Speicherorte, Rechenwege und bewusst verworfene
Entwurfswerte, bevor etwas gebaut wird.

## Bericht

### Der Ausgangsbefund war falsch gelesen

Der Waechter meldet bei `(Daten/Formeln) 26 Stueck` die **Gesamtzahl
der Namen**, nicht 26 fehlende Implementierungen. Sein Detail sagt
konkret nur fünf Namen als `FEHLEN`; die weiteren 21 findet er im
Recovery-Modul. Ergebnis der Einzelpruefung: 21 vorhanden, fünf
bewusst nicht bauen, null neue Tabellen oder Formeln.

| Name | Befund / echter Ort | Einordnung |
|---|---|---|
| `ACTIVE_PROTOCOL` | `recovery.recovery_protocols`, 2 Zeilen, davon 1 `active` | Daten vorhanden |
| `ACWR_DATA` | nicht als Nutzerdaten vorhanden; `121_recovery_scores_modalities.sql:84-85` entfernt ACWR-Routines | **nicht bauen**, C-181: `implement:no` |
| `CHECKIN` | `recovery.checkins`, 29 Spalten, 370 Zeilen | Umbenennung / Daten vorhanden |
| `HRV_BASELINE` | Entwurfsobjekt; 94 Check-ins haben `hrv_rmssd`, aber keine persistierte Baseline | Datenbedarf fuer einen spaeteren HRV-Modus; V1 bewertet HRV nicht |
| `HRV_LOG` | `recovery.checkins.hrv_rmssd`, 94 Werte | Umbenennung / Daten vorhanden |
| `MAX_DAILY_BONUS` | aus dem Scoring entfernt | **nicht bauen**, C-124 / SSOT 179:44 |
| `MODALITY_BONUS` | aus dem Scoring entfernt; `modality_bonus_value()` liefert ehrlich 0 | **nicht bauen**, C-124 / SSOT 179:43 |
| `MODALITY_LOG` | `recovery.modality_log`, 17 Spalten, 178 Zeilen | Umbenennung / Daten vorhanden |
| `MODALITY_META` | `motor.ts`, Darstellungsmetadaten zu Modalitaeten | Rechenweg/Code, keine Tabelle |
| `MOOD_META` | `motor.ts`; Werte selbst in `checkins.mood` | Rechenweg/Code, keine Tabelle |
| `MOOD_MULTIPLIER` | `recalculate_score()` bewertet `checkins.mood` per `CASE` | Rechenweg vorhanden; Zahlen weichen von der alten Spec ab, nicht nachbauen |
| `MUSCLE_GROUPS_BODYMAP` | Recovery-Motor plus Koerperkarte | UI-Metadaten, keine Tabelle |
| `MUSCLE_LABEL` | Recovery-Motor | UI-Metadaten, keine Tabelle |
| `MUSCLE_PATHS` | `packages/ui`-Koerperkarte | Umbenennung / UI-Metadaten, nicht beruehrt |
| `MUSCLE_STATE` | Entwurfszustand; reale Eingaben liegen in Training-Lasten und `checkins.soreness` | Datenleser fehlt noch, keine neue Tabelle |
| `READINESS_LEVELS` | `scores.score` und `readinessFor()` | Rechenweg vorhanden |
| `RECOVERY_PROTOCOLS` | `recovery.recovery_protocols`, 12 Spalten, 2 Zeilen | Umbenennung / Daten vorhanden |
| `SILHOUETTE_PATH` | `UMRISS_VORNE`/`UMRISS_HINTEN` in `packages/ui` | Umbenennung, keine Tabelle |
| `SLEEP_DATA` | Schlaf-Basiswerte in `checkins` (370 Werte); Wearable-Stufen fehlen | Daten teilweise vorhanden; kein erfundener Wearable-Pfad |
| `TODAY_MODALITIES` | `recovery.modality_log` gefiltert nach `entry_date` | Rechenweg / Daten vorhanden |
| `calcHRVScore` | `motor.ts`; DB-Score markiert HRV derzeit `not_used_manual_mode` | Rechenweg vorhanden, aber nicht aktiver DB-Modus |
| `calcModalityBonus` | alte Punkteformel entfernt, DB bleibt bei 0 | **nicht bauen**, C-124 |
| `calcMuscleRecovery` | `motor.ts`; echte Eingaben sind noch nicht als Recovery-Leser verbunden | Rechenweg vorhanden, Datenleser getrennte Aufgabe |
| `calcRecoveryScore` | `recovery.recalculate_score(uuid,date)`, 370 Scores | Umbenennung / Rechenweg vorhanden |
| `calcSleepScore` | `motor.ts`; DB berechnet den manuellen Schlafanteil in `recalculate_score()` | Rechenweg vorhanden |
| `calcTrainingLoadScore` | ACWR-Rechenweg bewusst entfernt | **nicht bauen**, C-181 |

### Wo Rechenwege hingehoeren

`SPEC_09_SCORING.md:6` nennt fuer reine, seiteneffektfreie Recovery-
Formeln `packages/scoring/src/recovery.ts`; das bestehende Paket folgt
diesem Muster bereits mit `src/nutrition.ts`. Ein persistierter
Score-Schnappschuss gehoert dagegen in die Datenbankfunktion
`recovery.recalculate_score()`, weil sie eine Zeile in `scores`
schreibt und ihre Eingaben/Rueckfallquellen mit speichert.

Die Voraussetzung fuer eine neue Pure Function ist hier nicht
erfuellt: ACWR ist entschieden entfernt; die elf Bonuswerte und der
Deckel sind als unbelegte Zahlen entfernt; HRV-Baseline und Wearable-
Schlafdaten haben noch keinen freigegebenen Datenpfad. Es wurde daher
weder `packages/scoring` noch eine Datenbanktabelle geaendert.

### Bestehende Daten und Zugriff

- `checkins` und `scores` stehen live weiter bei je 370 Zeilen (drei
  Nutzer); alle 370 Scores haben einen `training_load_score` und einen
  `modality_bonus`, beide bleiben durch die Entscheidungen als
  nachvollziehbare Schnappschussfelder erhalten.
- RLS-Transaktion als ein Recovery-Nutzer: 170 eigene Check-ins,
  170 eigene Scores und 89 eigene Modalitaetslogs; 0 fremde Check-ins.
  Die Transaktion endete mit `ROLLBACK`.
- `anon` hat auf dem Leser `recovery.card_read_all(uuid)` kein
  `EXECUTE`. Die schreibenden Score-Routines sind nur
  `authenticated`/`service_role` erteilt.

### Quellen

- `SPEC_09_SCORING.md:6,30-170,195-239`: Pure-Function-Ort und die
  Entwurfsinputs.
- `SPEC_04_FEATURES.md:42-98,117-245`: Mood, ACWR, Modalitaetsbonus,
  Muskel- und Schlafformeln.
- `121_recovery_scores_modalities.sql:26-82,231-388`: bestehende
  DB-Routines und der persistierte Manual-Score.
- `docs/ssot/179-evidenz-konstanten.md:39-46`: C-124 entfernt alle
  numerischen Modalitaetsboni und den Deckel.
- `recovery-c-0181-acwr-wird-gerechnet-und-muss-raus.md:27-55`:
  ACWR ist `implement:no`.

### Pruefung

Die Sicherung, der frische Kettenlauf und der Punktelauf stehen im
Abschluss unter diesem Bericht. Es gab keinen Schema- oder
Anwendungscode-Change; insbesondere keine neue Tabelle, keine
Oberflaeche und keine erfundene Formel.
