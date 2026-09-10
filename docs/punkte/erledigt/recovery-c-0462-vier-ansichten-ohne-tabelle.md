---
nr: C-462
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: bd8c7873
beruehrt:
  tabellen: [recovery.checkins, recovery.modality_log, recovery.recovery_protocols]
zahlen:
  gemessen: 2026-09-10
  scores: 370
  checkins: 370
  modality_log: 178
  recovery_protocols: 2
---

# C-462 - vier Ansichten ohne Tabelle

## Bericht 2026-09-10 - STOP vor Einspielen

Der Auftrag kann nicht wie beschrieben gebaut werden, ohne bestehende
Modelle unter neuen Namen zu duplizieren:

| behauptet fehlend | gemessener Bestand | Fundstelle |
|---|---|---|
| `muscle_soreness` | `recovery.checkins.soreness JSONB`, 370 Check-ins | `SPEC_02_ENTITIES.md:12-15,61-65`; dort ausdruecklich "MuscleSoreness (via Checkin JSONB)" |
| `hrv_readings` | `recovery.checkins.hrv_rmssd`, 370 Check-ins | `SPEC_06_DATABASE_SCHEMA.md:45`; `SPEC_09_SCORING.md:21,33-45` liest den Wert aus dem Check-in |
| `modality_logs` | `recovery.modality_log`, 17 Spalten, 178 Zeilen | `121_recovery_scores_modalities.sql:149-193`; Modalitaet, Dauer, Effekte, Bonus und Tagesdelta vorhanden |
| `protocols` | `recovery.recovery_protocols`, 12 Spalten, 2 Zeilen | `20260907090000_c421_recovery_read_models.sql:22-71`; Nutzer, Schluessel, Dauer, Tagesaktivitaeten und Status vorhanden |

`module-recovery-modals.jsx` liegt nicht im im Auftrag genannten
`lumeos-draft`, sondern in `docs/spezifikation/10-plattform/design-system/theme-v1/`.
Sein `LogProtocolModal` nennt sieben Protokolltypen; das ist ein UI-
Katalog, keine Erlaubnis fuer eine zweite Log-Tabelle.

Die Modalitaetsliste der Spec ist fachlich geschlossen mit den elf
benannten Arten plus `other` (`SPEC_06_DATABASE_SCHEMA.md:291-317`);
`MODALITY_BONUS` und `MAX_DAILY_BONUS` sind Rechenwerte, nicht neue
Speicherstrukturen (`SPEC_04_FEATURES.md:90-98`, `SPEC_09_SCORING.md:163-170`).
Ebenso sind `calcTrainingLoadScore` und `calcModalityBonus` Rechenwege
ueber ACWR bzw. Tages-Modalitaeten, keine Tabellenforderung.

Es wurden keine Tabellen angelegt, keine Daten geschrieben und keine
Sicherung oder Vollkette gestartet. Das ist absichtlich: Eine
Sicherung vor einer nicht autorisierten Dublette waere kein Fortschritt.

### Entscheidung noetig

Entweder C-462 als ueberholt schliessen oder auf konkret gemessene
Feldluecken der vorhandenen drei Speicherorte verengen. Ohne diese
Entscheidung beginne ich C-463 nicht; die Reihenfolgevorgabe verlangt
Stopp beim fehlgeschlagenen Auftrag.

```yaml
security_review:
  status: warning
  issues:
    - "Neue Tabellen mit abweichenden Namen waeren Daten-Dubletten und teilten sensible Recovery-Daten auf."
```

## Abnahme

**2026-09-08, Orchestrator. Der Stopp war richtig.**

`[read]` **Mein Auftrag verlangte vier Tabellen. Drei gibt es
unter anderem Namen, zwei liegen im Check-in.**

`[cmd]` **Selbst nachgemessen, `recovery` hat sieben:**

    checkins              29 Spalten
    modality_log          17
    overtraining_alerts   11
    recovery_protocols    12
    score_contributions   11
    scores                34
    stress_logs           12

### Die vier aus meinem Auftrag

    modality_logs   -> modality_log        (17 Sp, da)
    protocols       -> recovery_protocols  (12 Sp, da)
    muscle_soreness -> checkins.soreness
                       checkins.pain_areas
    hrv_readings    -> checkins.hrv_rmssd
                       checkins.resting_hr
                       checkins.spo2_pct
                       checkins.respiratory_rate

`[cmd]` **`checkins` traegt 29 Spalten** ? **darunter Schlaf,
Stimmung, Stress, Alkohol, Koffein, Bildschirmzeit vor dem
Schlafen.**

`[read]` **Ein Check-in IST die taegliche Messung** ? **eine
eigene HRV-Tabelle waere eine zweite Wahrheit ueber denselben
Tag.**

### Was ich falsch gemacht habe

`[read]` **Ich habe `pg_stat_user_tables` gelesen und Namen
geraten.**

`[cmd]` **Zum VIERTEN Mal heute:**

    recovery_scores    -> heisst scores
    lab_values         -> heisst lab_result_values
    coach content      -> heisst body
    modality_logs      -> heisst modality_log

`[read]` **Und er hat es zum zweiten Mal aufgefangen** ? **beim
ersten Mal (C-463-Warnung) hatte ich es selbst in den Auftrag
geschrieben.**

**Als ueberholt geschlossen.**

`[read]` **Was offen bleibt, ist eine FELDfrage, keine
Tabellenfrage** ? **das geht in G-415, wenn die Ansichten gebaut
werden.**
