---
nr: C-421
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: null
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: c3067369
beruehrt:
  tabellen: [recovery.checkins, recovery.overtraining_alerts, recovery.recovery_protocols, recovery.stress_logs, recovery.score_contributions, public.muscle_training_loads]
zahlen:
  gemessen: 2026-09-07
  attrappen: 17
  vorhandene_tabellen: 3
---

# C-421 - vier Tabellen fuer die 17 Attrappen

## Auftrag

Recovery hatte checkins, modality_log und scores. C-421 baut die vier fehlenden nutzereigenen Lesegrundlagen; G-367 liefert HOURS und SETS per Muskel aus Training. Keine Oberflaeche und keine laufende Datenbank beruehrt.

## Bericht

### Gebaut

- Migration 20260907090000_c421_recovery_read_models.sql erstellt recovery.overtraining_alerts, recovery.recovery_protocols, recovery.stress_logs und recovery.score_contributions.
- Alle vier Tabellen haben RLS, explizite authenticated-CRUD-Policies und service_role-Zugriff.
- public.muscle_training_loads ist die security_invoker-Sicht ueber abgeschlossene workout_sessions, workout_exercises und exercise_muscles. Sie liefert die letzte Session je Nutzer und Muskelgruppe, echte Working-Sets und Volumen. Zukunfts-Endzeiten werden fuer hours_since_trained auf 0 begrenzt.
- Der Seed legt das Nachweiskonto auch mit Minimal-Auth an und fuellt die vier neuen Tabellen bis current_date.

### A1 - Seedzeilen auf test-user@lumeos.local

| Tabelle | Zeilen |
|---|---:|
| recovery.overtraining_alerts | 1 |
| recovery.recovery_protocols | 2 |
| recovery.stress_logs | 7 |
| recovery.score_contributions | 21 |

### A2 - RLS in beide Richtungen

Als authenticated mit test-user: 1 / 2 / 7 / 21 Zeilen (Alert / Protokoll / Stress / Beitrag). Als fremder Nutzer gegen genau diese Zeilen: 0 / 0 / 0 / 0. Der Strukturtest prueft zusaetzlich RLS an allen vier Tabellen und security_invoker=true an der Sicht.

### A3 - Vollkette

pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_c421_chain --keep-database lief auf der ausschliesslich dafuer erzeugten Wegwerf-Datenbank mit 138 Schritten in 333,4 Sekunden durch: KETTE OK, SCHEMA VOLLSTAENDIG. Danach liefen testdaten-einspielen.ts und der C-421-Strukturtest gruen durch. Nie gegen die laufende Datenbank getestet.

### A4 - 17 Attrappen

17 / 11 anbindbar / 6 weiter blockiert. Anbindbar: fuenf Uebertrainings-, zwei Protokoll-, zwei Stress- und zwei Beitrags-Kacheln. Weiter blockiert: drei Check-in-Kacheln (Schreibweg/Erklaerung), zwei HRV/Sleep-Kacheln (Geraetefunktion bzw. Erklaerweg) und der Modality-Katalog (Register, kein Nutzerbezug). Keine Oberflaeche wurde verdrahtet oder veraendert.

### A5 - G-367, HOURS und SETS gegen den Entwurf

Gemessen in public.muscle_training_loads auf kettengetragenen Trainingsdaten von tom.seed@example.com. Das Nachweiskonto hat bewusst keine Trainingssitzung. Zahlen sind Entwurf -> echt als HOURS / SETS; -- bedeutet keine direkte Muskelgruppenentsprechung in den Seeddaten.

| Entwurf-Muskel | Entwurf | Echt aus Sicht |
|---|---:|---:|
| chest | 38 / 14 | Chest: 0 / 6 |
| front_deltoids | 38 / 10 | Shoulders: 0 / 6 (breitere Gruppe) |
| triceps | 38 / 12 | Triceps: 0 / 6 |
| upper_back | 14 / 18 | Upper Back: 283.8 / 6 |
| back_deltoids | 14 / 8 | -- |
| biceps | 14 / 10 | Biceps: 283.8 / 6 |
| forearm | 14 / 6 | Forearms: 283.8 / 3 |
| trapezius | 14 / 8 | -- |
| quadriceps | 62 / 20 | Quadriceps: 139.8 / 6 |
| hamstring | 62 / 12 | Hamstrings: 139.8 / 6 |
| gluteal | 62 / 14 | Glutes: 139.8 / 3 |
| calves | 62 / 8 | -- |
| adductor | 62 / 4 | -- |
| abductors | 62 / 4 | Gluteus Medius: 139.8 / 3 (Teilgruppe) |
| lower_back | 62 / 10 | Lower Back: 139.8 / 6 |
| abs | 110 / 9 | -- |
| obliques | 110 / 6 | -- |
| neck | 200 / 0 | -- |

Weitere echte Sichtzeilen ohne direkte Entwurfsentsprechung: Clavicular Head 0 / 3, Mid Back 283.8 / 6, Rhomboids 283.8 / 3, Semimembranosus 139.8 / 6, Semitendinosus 139.8 / 6 und Teres Major 283.8 / 6. SETS sind die aus training.workout_sets aggregierten Working-Sets der letzten abgeschlossenen Sitzung.

## Abnahme

**2026-09-07, Orchestrator.**

### Alle fuenf Bedingungen erfuellt, mit Zahlen

    A1  Seedzeilen        1 / 2 / 7 / 21
    A2  RLS               eigener 1/2/7/21, fremder 0/0/0/0
    A3  Vollkette         138 Schritte, 333,4 s, gruen
    A4  17 Kacheln        11 anbindbar, 6 blockiert
    A5  Muskelvergleich   vollstaendig im Bericht

`[read]` **Das ist der erste Auftrag heute, der seine
Abnahmebedingungen einzeln mit Zahlen beantwortet** — **so soll es
sein.**

`[cmd]` **A2 ist der wichtigste:** **eigener Nutzer sieht 1/2/7/21,
fremder sieht 0/0/0/0.** `[read]` **RLS in beide Richtungen, je
Tabelle.**

### `public.muscle_training_loads`

`[cmd]` **Echte Working-Sets und Stunden je Muskelgruppe** —
**damit ist G-367 geloest.**

`[read]` **Und der Ort ist richtig gewaehlt:** `public`, **nicht
`recovery` oder `training`** — **wie `activity_stream`** (C-414,
E-65).

### Nicht live, richtig so

`[cmd]` **Nachgemessen: `recovery` traegt weiter drei Tabellen,
`muscle_training_loads` fehlt auf `dev`.**

`[cmd]` **Die Wegwerf-Datenbanken wurden entfernt** — **wie
beauftragt.**

`[read]` **Der Kettenlauf ist der Nachweis, nicht der Bestand auf
`dev`.**

### Was offen bleibt

`[cmd]` **Elf Kacheln sind anbindbar, aber noch nicht angebunden** —
**die Tabelle steht, der Leseweg fehlt.**

`[read]` **Genau die Klasse aus A-71** — **deshalb sofort als C-422
beauftragt.**

`[cmd]` **Sechs bleiben blockiert** — **woran, steht im Bericht.**

**Abgenommen.**

