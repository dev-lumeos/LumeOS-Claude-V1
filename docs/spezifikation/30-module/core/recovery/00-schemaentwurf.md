---
status:     entwurf
version:    0.1
stand:      2026-08-19
ankerhash:  dbf457e
quellen:    theme-v1/module-recovery-v2.jsx, module-recovery-engine.jsx,
            module-crossmodule-rest.jsx (Stress-Tab) ·
            docs/specs/Recovery/SPEC_02, _05, _06, _08, _09 ·
            referenz/lumeos-2026 (migrations/010, api/recovery/*,
            api/training/routes/recovery-intel.ts)
abhaengig:  10-plattform/datenzugriff, 30-module/core/training,
            30-module/core/nutrition
---

# Recovery — Schemaentwurf aus drei Quellen (F-01)

**Auftrag F-01: messen, abgleichen, entwerfen — kein SQL, keine
Oberfläche, nichts committen.** Dieser Entwurf beschreibt, welche
Tabellen die 36 Kacheln des Mockups wirklich brauchen, wo die drei
Quellen sich widersprechen, und welche Entscheidungen Tom treffen
muss, bevor jemand baut.

**Die drei Quellen, kurz eingeordnet:**

- **Mockup** `[cmd]` — der geltende Rahmen ist `module-recovery-v2.jsx`
  (`app.jsx:122` wählt `RecoveryModuleV2`, der alte Rahmen ist ein
  Notnagel, der nie greift; belegt in `docs/ssot/92-recovery-mockup.md`).
  Der Motor `module-recovery-engine.jsx` trägt Daten und Formeln, der
  neunte Tab „Stress" steht in `module-crossmodule-rest.jsx:5-116`.
- **Spec** `[read]` — elf Dateien unter `docs/specs/Recovery/`.
  KI-erzeugt, prüfend gelesen: sie widerspricht sich intern (SPEC_06
  installiert einen Score-Trigger mit anderer Formel als SPEC_09,
  siehe Abschnitt 3.3) und referenziert `packages/scoring`, das es
  nicht gibt.
- **Vorgängerrepo** `[cmd]` — die tatsächlich gelaufene Migration
  `supabase/migrations/010_create_recovery_tables.sql` legt **drei**
  Tabellen an, nicht zehn: `recovery_checkins` (schlank, ohne Stress/
  Koffein/HRV), `recovery_modalities` (8 Typen, ohne Wirkungsbewertung),
  `recovery_scores` (Komponenten + `muscle_recovery` JSONB +
  `overtraining_signals` INT). HRV- und Schlaftabellen existieren dort
  nur in `DATABASE.md`, nie als Migration — geprüft über alle
  Migrationsdateien. Dazu kommt `recovery-intel.ts` (26 KB): Banister
  Fitness-Fatigue (τ 42/7 Tage), Schlaf-Leistungs-Korrelation,
  3-Tage-Bereitschaftsprognose, Wochenbericht — alles gerechnet aus
  `workout_sessions`/`workout_sets` + `recovery_checkins`, **ohne
  eigene Tabellen**.

**Der stabile Kern, in allen drei Quellen identisch** `[cmd]`: die
Manual-Gewichte 30/15/15/10/15/10/5 (Schlafqualität/Schlafdauer/
Gefühl/Soreness/Trainingslast/Nutrition/Stimmung), die HRV-Formel
`70 + z × 15` gegen die eigene 30-Tage-Baseline, die Mood-Werte
(motivated 100 … sick 10), die Basis-Erholungskurve (10 % → 100 %
über 96 h) und der Modality-Bonusdeckel 5. Was darum herumliegt,
widerspricht sich — Abschnitt 3.

---

## 1. Was jede Kachel braucht

`[cmd]` 36 Kacheln, gezählt in G-21 und hier je Tab aus `-v2.jsx`
nachvollzogen (5+4+2+4+4+6+3+3+5). Die Kopfzeile (Score-Pill,
Check-in-Pill, OT-Pill, drei Aktionen) ist keine Kachel, braucht aber
dieselben Daten wie Kacheln 1, 5 und 26.

Kürzel in der Spalte „Quelle": **CK** = `recovery.checkins` (existiert),
**SC** = Score-Tabelle (neu), **HR** = HRV-Messungen (neu),
**MO** = Modalitäten-Log (neu), **OT** = Übertrainings-Alerts (neu),
**PR** = Protokolle/Zuweisungen (neu), **SL** = Schlafdaten (später),
**ST** = Stress-Log (offen), **TR** = `training.workout_*` (existiert,
lesend), **NU** = Nutrition (lesend), **konst.** = Konstanten im
Scoring-Code, keine Tabelle.

| # | Tab | Kachel | Woher die Zahlen kommen | Quelle |
|---|---|---|---|---|
| 1 | Today | Score-Karte (Ring, Readiness, Zusammensetzung) | Heutiger Check-in, ACWR aus Trainingssätzen, Nutrition-Compliance, HRV + Baseline, Modality-Bonus; Ergebnis persistiert | CK·TR·NU·HR·MO → SC |
| 2 | Today | Muscle readiness (Mini-Karte, 18 Gruppen) | Je Muskel: Stunden seit letzter Session + Sätze (7 Tage) aus Training, Soreness aus Check-in, Schlafqualität, Protein-/Kalorien-% | TR·CK·NU |
| 3 | Today | Pending actions | Abgeleitet: Check-in fehlt (Uhrzeit), OT-Zustand, offene Protokollaufgaben, HRV-Messung ≥ 3 Tage alt, unbewertete Modalität von gestern | CK·OT·PR·HR·MO |
| 4 | Today | Today's modalities | Heutige Einträge + Bonusrechnung mit Deckel | MO |
| 5 | Today | Overtraining watch (8 Signale) | 3d/5d/7d-Mittel aus Check-ins, HRV-7d vs. Baseline, Ruhepuls vs. Baseline, Score-3d-Mittel, Trainingstrend | CK·HR·SC·TR |
| 6 | Check-in | Morning check-in (Formular) | Schreibt den Tagesdatensatz (Upsert); „lastSession" je Muskel aus Training | CK·TR |
| 7 | Check-in | Live score preview | Reine Ableitung aus Formularwerten + ACWR + Modalitäten + HRV | CK·TR·MO·HR |
| 8 | Check-in | Readiness levels (Legende) | Feste Stufen + Ratschlagstexte | konst. |
| 9 | Check-in | Why check in daily | Statischer Text | — |
| 10 | Muscle map | Muscle recovery (Karte + Basiskurve) | wie #2, plus Kurvenformel als Text | TR·CK·NU |
| 11 | Muscle map | Per-muscle detail (Tabelle) | wie #2, je Muskel: Stunden, Sätze, Soreness, %, letzte Session | TR·CK·NU |
| 12 | HRV | HRV score (z-Score + Herleitung) | Tagesmessung, Baseline (Ø, σ, Fenster, Stichprobe) | HR |
| 13 | HRV | Measurement log | Messungen: Datum, RMSSD, Methode, Qualität, Notiz | HR |
| 14 | HRV | Phone camera HRV | Statischer Erklärtext; der Messmodal schreibt in HR | HR |
| 15 | HRV | 30-day trend | 30 Tage Messungen + Baseline-Band | HR |
| 16 | Sleep | Last night (Phasen, Effizienz, Score) | Wearable-Nacht: Phasenminuten, Effizienz, Zeiten, Quelle | SL |
| 17 | Sleep | 14 nights | 14 Nächte Dauer + Phasenanteile | SL |
| 18 | Sleep | Score paths (wearable vs. subjektiv) | Beide Pfade; der subjektive braucht nur den Check-in | SL·CK |
| 19 | Sleep | Sleep hygiene inputs | Koffein, Alkohol, Bildschirmzeit, Stress aus Check-in; Bettzeit-Drift aus `sleep_start_time` (14 Tage) | CK |
| 20 | Modalities | Today's bonus (Statistik) | Ableitung aus #4 | MO |
| 21 | Modalities | Logged today / 7d (Statistik) | Zählung | MO |
| 22 | Modalities | Best next-day delta (Statistik) | Maximales `next_day_score_delta` | MO·SC |
| 23 | Modalities | Awaiting rating (Statistik) | Einträge ohne Folgetagsbewertung | MO |
| 24 | Modalities | Modality catalog (11 Typen, Bonuswerte) | Typen + Bonuswerte + 7d-Nutzung | konst.·MO |
| 25 | Modalities | Effectiveness log | Je Eintrag: Sofort-/Folgetagsbewertung, Δ Score | MO·SC |
| 26 | Overtraining | Signal panel | wie #5, mit Detailtext je Signal | CK·HR·SC·TR |
| 27 | Overtraining | Severity (Stufen 3+/5+/7+) | Ableitung aus Signalzahl | konst. |
| 28 | Overtraining | Alert lifecycle (active → acknowledged → resolved) | Alert-Zeilen mit Status; „kein neuer Alert, solange einer aktiv ist" | OT |
| 29 | Protocols | Active protocol + Today's tasks (abhakbar) | Zuweisung (Tag x von y) + Vorlage + **Abhak-Zustand je Aufgabe und Tag** — dafür hat keine Quelle eine Struktur, siehe 2.7 | PR |
| 30 | Protocols | Protocol library | Protokoll-Stammdaten (Mockup: 4, SPEC_08 seedet 5) | PR |
| 31 | Protocols | When to run which (Trigger) | Triggerregeln (nur im Mockup benannt); „Injury logged in Medical" liest Medical | konst.·SC·CK |
| 32 | Stress | Stress score today (Ring + Bänder) | Zusammengesetzter Stresswert — **Formel existiert in keiner Quelle**, siehe 3.10 | ST·CK·TR |
| 33 | Stress | Contributors (6 Beiträge) | Work/Life aus Stress-Log, Schlafschuld + Koffein + Alkohol aus Check-ins, Trainingslast aus ACWR | ST·CK·TR |
| 34 | Stress | 14 days | Stresswert-Verlauf | ST |
| 35 | Stress | Log stress (1–10 + Quelle) | Momentane Stressereignisse mit Quell-Tag — **keine Spec-Tabelle deckt das** | ST |
| 36 | Stress | What helps you | Ø Folgetags-Stressänderung je Modalität | MO·ST |

`[read]` Die Lesart der Tabelle: **Eine einzige neue Tabelle (Score)
plus die vorhandenen Check-ins machen die Kacheln 1, 6, 7, 8, 9 und 19
echt und die Kopfzeile dazu** — sofern die Formelfragen aus Abschnitt 4
entschieden sind. Die Muskelkarte (#2, 10, 11) braucht **keine neue
Recovery-Tabelle**, sondern eine Lesefunktion über
`training.workout_sets` `[cmd]` (existiert seit Kettenschritt 106,
mit `weight_kg`, `reps`, `rpe`, `volume_kg`).

---

## 2. Welche Tabellen daraus folgen

Empfohlener Zuschnitt: **die vorhandene Tabelle + fünf neue + eine
Stammdatengruppe**, dazu zwei bewusst zurückgestellte. Das ist weniger
als die zehn der Spec und mehr als die drei des Vorgängers — begründet
je Tabelle. Alle Nutzertabellen bekommen die Herkunftsspalten
`measurement_source` / `source_detail` `[cmd]` (Konvention aus
Kettenschritt 017, dort bereits auf `recovery.checkins` gelegt) und
RLS nach dem Muster von Schritt 120 (vier Policies, `auth.uid()`).

### 2.1 `recovery.checkins` — existiert, passt

`[cmd]` Kettenschritt 120 (C-67): ein Check-in je Nutzer und lokalem
`entry_date` (UNIQUE, Upsert), lokale `checkin_time` ohne Server-Default
(C-61-Muster), alle Mockup-Felder plus `energy_level`, `motivation`,
`work_stress`, `life_stress`, `pain_areas`, `resting_hr`, `spo2_pct`,
`respiratory_rate`, `notes`. Bestand: 36 Zeilen am 2026-08-17 (C-67);
laut Auftrag F-01 340 Zeilen am 2026-08-19, 27 der ursprünglichen 36
ohne HRV — der `manual`-Modus ist der Normalfall.
`eigenes-konto-fuellen.sql` kopiert die Check-ins bereits auf das
Zielkonto `[cmd]` (Zeilen 262–277).

**Die Tabelle muss sich für den Entwurf nicht ändern.** Drei Punkte
sind Festlegungen, keine Umbauten:

- **`hrv_rmssd` hat eine Doppelrolle** — es gibt daneben künftig
  `hrv_readings`. Festlegung (2.3): Messungen wohnen in `hrv_readings`;
  `checkins.hrv_rmssd` bleibt der manuell eingetippte Morgenwert für
  Nutzer ohne Messgerät. Der Score nimmt die Tagesmessung, sonst den
  Check-in-Wert.
- **`motivation` ist 1–10**, das Übertrainingssignal „Motivation ≤ 3
  (5d)" rechnet im Motor auf einer /5-Skala `[cmd]`
  (`OT_DATA.motivation_5d_avg: 4.0`). Schwelle bei Umsetzung auf die
  10er-Skala umrechnen (≤ 6? ≤ 5?) — Entscheidungspunkt E8.
- **`resting_hr` existiert** — das Ruhepuls-Signal braucht zusätzlich
  eine Baseline; wie die HRV-Baseline aus dem Verlauf gerechnet, keine
  eigene Tabelle.

### 2.2 `recovery.scores` — neu, der größte Hebel

Der berechnete Tages-Score, nach jedem Check-in-Upsert neu geschrieben
(1/Tag, UNIQUE user+Datum). **Berechnet im Anwendungscode, nicht per
DB-Trigger** — Begründung in 3.3.

Spalten (beschreibend, kein SQL):

- Identität: `user_id`, `entry_date`, UNIQUE darauf.
- Ergebnis: `score` 0–100, `readiness_level`,
  `intensity_recommendation`, `mode` (`manual` | `hrv` | `wearable`).
- Komponenten (je 0–100, nullable): Schlafqualität, Schlafdauer,
  subjektives Gefühl, Soreness, HRV, Trainingslast, Nutrition,
  Stimmung; `modality_bonus` 0–5.
- **Eingangs-Schnappschüsse** — der Grund, warum die Tabelle sein muss
  und der Score nicht einfach je Anzeige neu gerechnet wird:
  `acwr_used`, `nutrition_compliance_used`, `hrv_baseline_used`,
  `hrv_stddev_used`. Cross-Modul-Eingänge ändern sich rückwirkend
  (Nutrition-Nachträge, neue Trainingssätze); ohne Schnappschuss ist
  gestern nicht reproduzierbar. `[read]` SPEC_02 sieht das genauso
  („snapshot für Debugging"), der Vorgänger hat die Tabelle ebenfalls
  geführt und im Wochenbericht zurückgelesen `[cmd]`
  (`recovery-intel.ts:648-656`).
- `algorithm_version`, `calculated_at`.

Zweitnutzen: das Übertrainingssignal „Score < 55 (3d)" und die
Protokoll-Trigger („Score 60–70 für 3+ Tage") lesen diese Historie.

### 2.3 `recovery.hrv_readings` — neu

Mehrere Messungen je Tag möglich (kein UNIQUE auf Datum). Spalten:
`measured_at` (lokaler Tag + Zeit nach C-61-Muster), `rmssd`,
`method` (`phone_ppg` | `chest_strap` | `wearable` | `manual`),
`quality` als Zahl 0–1 (das Mockup zeigt 0.79–0.99 und färbt danach;
die Spec-Enum `excellent…poor` verliert Information), `note`.
`[annahme]` `pnn50`/`heart_rate` aus SPEC_02 erst mit einer Quelle, die
sie liefert — die PPG-Messung selbst ist eine eigene Baustelle (G-21).

**Keine Baseline-Tabelle.** Die Baseline (Ø, σ über 30 Tage, min. 7
Messungen laut SPEC_05/09) ist aus `hrv_readings` ableitbar — eine
Leseabfrage, kein Zustand. Der Vorgänger hat auch keine geführt
`[cmd]`. Was der Score verwendet hat, steht als Schnappschuss in
`recovery.scores`. Fällt die Ableitung später zu teuer aus, ist eine
materialisierte Sicht der nächste Schritt — nicht der erste.

### 2.4 `recovery.modality_log` — neu

Je Anwendung: lokaler Tag + Zeit, `modality_type` (die 11 Typen des
Mockups + `other`), `duration_min`, `detail` (Freitext: „12 °C",
„deep tissue" — deckt Temperatur und Druck ab, ohne zwei Spezialspalten),
`immediate_effect` 1–10, `next_day_effect` 1–10 (nachträglich),
`next_day_score_delta` (berechnet aus `recovery.scores`), `notes`.

`[read]` Nicht übernommen aus SPEC_06: `temperature_c`, `intensity`,
`pressure_level`, `location`, `provider`, `cost_eur` und die
ROI-je-Euro-Sicht. Das Mockup zeigt nichts davon, der Vorgänger hatte
nichts davon. Die Kostenrechnung ist ein Feature-Vorschlag der Spec,
keine Anforderung der Kacheln — bei Bedarf später anbaubar.

Die Bonuswerte je Typ (sauna 2.0 … massage 2.5, Deckel 5.0) sind
**Konstanten im Scoring-Code mit Versionsnummer, keine Tabelle** — wie
die Mood-Werte. Sie sind Produktentscheidungen ohne Quelle
(Entscheidungspunkt E5) und ändern sich, wenn überhaupt, mit der
`algorithm_version`.

### 2.5 `recovery.overtraining_alerts` — neu, aber vierter Schritt

Für den Lebenszyklus (Kachel 28): `alert_date`, `severity`
(Taxonomie nach 3.7), `signals` JSONB (`[{id, value, threshold}]`),
`signals_count`, `status` (`active` | `acknowledged` | `resolved`),
`acknowledged_at`, `resolved_at`, `recommended_action`. Die Regel
„kein neuer Alert, solange einer aktiv ist" `[cmd]` (`-v2.jsx:816`)
ist Anwendungslogik über dem `status`-Feld.

`[read]` Der Vorgänger kam mit `overtraining_signals INT` in der
Score-Tabelle aus — ohne Lebenszyklus. Das Mockup zeigt den
Lebenszyklus ausdrücklich; darum die Tabelle. Sie ist trotzdem der
letzte Baustein: die Signale brauchen Wochen an Verlauf (G-21).

### 2.6 `recovery.protocols` + `recovery.protocol_assignments` — neu

Stammdaten wie SPEC_06 §9, gekürzt: `name`, `name_de`, `description`,
`protocol_type`, `target_condition`, `duration_days`,
`daily_activities` JSONB, `modalities_recommended`,
`training_modifications`, `nutrition_guidelines`, `is_active`.
**`evidence_level` (S/A/B/C) nur mit belegter Quelle je Protokoll** —
C-105-Regel: eine Einstufung ohne Quelle ist eine erfundene Schwelle.
Sonst weglassen.

Zuweisung: `protocol_id`, `assigned_date`, `target_end_date`,
`assigned_by` (`self` | `ai_coach` | `human_coach`), `status`
(`active` | `completed` | `discontinued`), `progress_notes`.
`[read]` Mockup-Regel dazu: Buddy schlägt vor, aktiviert nie selbst
(`-v2.jsx:892`).

### 2.7 Abhak-Zustand der Tagesaufgaben — Lücke in allen drei Quellen

`[cmd]` Kachel 29 zeigt abhakbare Tagesaufgaben („Zone-1 cardio 25 min
· done"). SPEC_06 kennt nur `days_completed` und `compliance_rate` auf
der Zuweisung — **kein Ort für den Haken an einer einzelnen Aufgabe an
Tag 3**. Der Vorgänger hatte gar keine Protokolltabellen `[cmd]`.

Empfehlung: kleine Log-Tabelle `recovery.protocol_task_checks`
(`assignment_id`, `day_no`, `task_index` oder Aufgabentext, `done_at`).
`compliance_rate` wird daraus gerechnet, nicht geführt. `[annahme]`
Ein JSONB-Feld auf der Zuweisung ginge auch; die Log-Form ist gewählt,
weil „Pending actions" (#3) einzelne offene Aufgaben aufzählen muss.

### 2.8 Zurückgestellt: `recovery.sleep_data`

Struktur wie SPEC_06 §5 (Phasenminuten, Effizienz, Latenz,
Aufwachmomente, `data_source`, `device_confidence`) — **aber erst
bauen, wenn ein Import sie füllt.** Es gibt keine Wearable-Anbindung
(A-17); der subjektive Schlafpfad (0.6 × Qualität + 0.4 × Dauer) läuft
vollständig über `checkins` und „never blocks a score" `[cmd]`
(Engine, `calcSleepScore`). Die Kacheln 16–17 bleiben bis dahin
Attrappe — eine leere Tabelle würde daran nichts ändern. Auch die
Bettzeit-Drift (#19) geht ohne sie: `checkins.sleep_start_time` liegt
bereits vor.

### 2.9 Offen: Stress (`recovery.stress_logs`)

Das Mockup verlangt ein Ereignis-Log (Wert 1–10 + Quelle aus acht
Tags, Kachel 35) und einen zusammengesetzten Stresswert mit Bändern
und 14-Tage-Verlauf. **Keine Spec-Tabelle deckt das, der Vorgänger hat
nichts dergleichen, und die Mischformel der sechs Beiträge existiert
nirgends** (3.10). Tabellenform wäre trivial (`logged_at`, `level`,
`source_tag`, `note`) — aber ohne entschiedene Score-Formel entsteht
nur eine weitere Attrappe mit Datenbankanschluss. Entscheidungspunkt
E6, Reihenfolgeplatz: zuletzt.

### 2.10 Was ausdrücklich **nicht** gebaut wird

- **`recovery.training_load_logs` (SPEC_06 §7): verwerfen.** Die Spec
  kopiert Trainingsdaten (Volumen, RPE, `muscles_worked`, ACWR) in
  eine zweite Tabelle im Recovery-Schema. `[cmd]` Der Vorgänger hat
  genau das nicht getan: `recovery-intel.ts` rechnet Last, ACWR-Basis
  und sogar das Banister-Modell direkt aus `workout_sessions`/
  `workout_sets`. Im aktuellen Repo existieren
  `training.workout_sessions/_exercises/_sets` seit Schritt 106 mit
  allen nötigen Spalten. Eine Kopie wäre ein zweiter Zustand, der
  auseinanderläuft — ACWR wird gelesen (Sicht oder Funktion im
  Training-Schema), der verwendete Wert steht als `acwr_used` im
  Score-Schnappschuss.
- **`recovery.hrv_baselines` (SPEC_06 §4):** ableitbar, siehe 2.3.
- **`muscle_recovery_params` (SPEC_08 §2), vorerst:** der Motor rechnet
  eine Kurve für alle Muskeln; die Spec-Tabelle mit 21 muskelspezifischen
  Zeiten ist plausibel, aber ohne Quelle (C-105-Regel). Erst
  entscheiden (E7), dann seeden.
- **`wearable_source_config` (SPEC_08 §3):** Konfiguration einer
  Anbindung, die es nicht gibt. Mit dem Import bauen, nicht davor.
- **Die drei Views der Spec** (`weekly_recovery_stats`,
  `muscle_readiness`, `modality_effectiveness`): Leseschicht, gehört
  in die 07-Lesefunktionen-Phase der Kette, wenn die Tabellen stehen —
  `muscle_readiness` zudem umgeschrieben auf `training.workout_sets`
  statt der verworfenen `training_load_logs`.

---

## 3. Wo die Quellen sich widersprechen

Je Punkt: was Mockup (M), Spec (S) und Vorgänger (V) sagen, und welche
Fassung dieser Entwurf für richtig hält.

### 3.1 Tabellenzuschnitt

M braucht ~7 Datenquellen · S definiert 10 Tabellen + 3 Views · V hat
3 Tabellen gebaut `[cmd]`. **Empfehlung: der Zuschnitt aus Abschnitt 2**
(6 neue Strukturen, 2 zurückgestellt, 4 Spec-Tabellen verworfen). Der
Vorgänger beweist, dass 3 Tabellen zum Ausliefern reichen — aber sein
Frontend zeigte auch keine HRV-Logs, keinen Alert-Lebenszyklus und
keine Protokolle als Daten; das Mockup zeigt alle drei.

### 3.2 Trainingslast: Kopie oder Lesezugriff

S: eigene `recovery.training_load_logs` · V: liest Trainingstabellen
direkt · M: neutral (zeigt nur ACWR 1.08). **Empfehlung: V.**
Begründung in 2.10 — ein geteilter Zustand weniger.

### 3.3 Wo der Score gerechnet wird

S widerspricht sich selbst: SPEC_06 installiert einen
AFTER-INSERT-Trigger mit eigener SQL-Formel, SPEC_09 verlangt pure
functions in `packages/scoring`. `[cmd]` Der Trigger ist zudem
fachlich kaputt: sein Trainingsterm
`v_load / GREATEST(v_load + 1, 1) × 15` (SPEC_06:141) ergibt für jede
nennenswerte Last ≈ 15 volle Punkte — ACWR kommt nicht vor; Nutrition
ist fest 70; HRV-Modus und Modality-Bonus fehlen. V rechnet im
API-Code beim Check-in-Upsert `[cmd]` (`checkin.ts:92-129`).
**Empfehlung: V/SPEC_09 — Anwendungscode, versioniert
(`algorithm_version`), kein Trigger.** Der Trigger der Spec ist ein
zweiter Rechenweg, der garantiert vom ersten abweicht.

### 3.4 Modality-Bonus

M/S: typspezifische Werte (massage 2.5, sauna 2.0 … foam_rolling 0.5),
Deckel 5 · V: `min(Anzahl, 5)` — ein Punkt je Eintrag, typunabhängig
`[cmd]` (`computeScore.ts:72`). Katalog: M 11 Typen, S 11 + `other`,
V 8 (ohne contrast_therapy, foam_rolling, yoga). **Empfehlung: M**
(11 Typen + `other`, typspezifisch, Deckel 5) — die Kacheln 20–25
zeigen die Typwerte ausdrücklich an. Die Werte selbst bleiben
Entscheidungspunkt E5.

### 3.5 Soreness-Mittelung — gleiche Daten, drei Scores

`[cmd]` Engine: Mittel über **alle 18** Gruppen, Nullen verwässern
(`avgSoreness`, Engine:269-272) · V: Mittel nur über Muskeln **> 0**
(`computeScore.ts:48-52`) · S: Mittel über die im JSONB gemeldeten
Muskeln, leeres Objekt = 100 (SPEC_05:61-66; das JSONB-Beispiel der
SPEC_02 führt nur betroffene Muskeln). Zahlenbeispiel: ein einziger
Muskel mit Kater 3 → Engine-Term 9,4/10, V-Term 0/10. **Das ist keine
Rundungsfrage, sondern bestimmt, ob der Soreness-Anteil überhaupt
wirkt.** Empfehlung: V/S (nur gemeldete Muskeln > 0) — sonst ist der
Term bei 18 Gruppen praktisch konstant. Entscheidungspunkt E2, weil
der Check-in-Tab die Karte mit allen 18 Gruppen vorbelegt und damit
die Engine-Lesart nahelegt.

### 3.6 ACWR → Trainingsterm: drei Kurven, eine davon fehlerhaft

`[cmd]` Engine (`calcTrainingLoadScore`, Engine:220-225): für ACWR
1.3–1.5 gilt `1.3 − (ACWR − 1.3) × 2` — bei ACWR 1.4 also Faktor
**1.1, mehr als das Maximum 1.0**: erhöhtes Verletzungsrisiko
verbessert den Score, und der Komponentenbalken liefe über 100 %.
Das ist ein Fehler, keine Absicht. · S intern doppelt: SPEC_05 (optimal
0.8–1.2, lerp-Bänder, „kein Training = 90") vs. SPEC_09 (optimal
0.8–1.2, stückweise fallend, „kein ACWR = 70"). · V: fester Term 70,
ACWR nie implementiert `[cmd]`. **Empfehlung: SPEC_09-Kurve** —
monoton fallend oberhalb 1.2, definierter Rückfall 70 ohne
Trainingsdaten. Die Engine-Kurve nicht übernehmen.

### 3.7 Übertraining: Signalsatz und Schweregrade

Signale (je 8, aber verschieden): Engine hat `rhr_high` (Ruhepuls
+5 bpm), SPEC_09 stattdessen `acwr_high` (> 1.5); die übrigen 7
stimmen überein `[cmd]`. Schweregrade: Engine/M
`normal | moderate(3+) | high(5+) | critical(7+)` — die Kachel druckt
diese Schwellen; SPEC_05/09 `none | low(≤2) | moderate(≤4) | high(≤6) |
critical(7+)`; SPEC_06-Tabelle wieder anders
(`low | moderate | high | critical`). **Empfehlung: die
Mockup-Taxonomie** (sie steht sichtbar in der Oberfläche) **und beide
Kandidatensignale aufnehmen** — `resting_hr` liegt im Check-in bereits
vor, ACWR wird ohnehin gerechnet; dann sind es 9 Signale und die
Schwellen skalieren mit (Entscheidungspunkt E4, samt Arzt-Hinweis).

### 3.8 Readiness-Stufen

S: 5 Stufen, alles unter 60 ist `rest` · M/Engine: 6 Stufen — `rest`
ab 40 und `forced rest` unter 40 mit eigenem Text („Mandatory break ·
see a doctor if this persists") `[cmd]`. **Empfehlung: M** — die
Legendenkachel (#8) zeigt sechs Zeilen. Die Texte selbst sind
Urteilssprache → Abschnitt 4.

### 3.9 Schlaf-Score (Wearable-Pfad)

M/Engine: `0.4 × Effizienz + 0.4 × Dauer + 0.2 × Tiefschlaf` — die
Kachel druckt diese Herleitung · S: SPEC_05 mit fünf Termen (Dauer
0.35, Effizienz 0.25, Tief 0.20, REM 0.10, Fragmentierung 0.10);
SPEC_09 wieder anders und zählt die Effizienz doppelt (als
Qualitäts-Ersatz **und** als eigener 0.05-Term) `[cmd]`. V: nie gebaut.
**Empfehlung: M** für V1 — drei Terme, in der Oberfläche erklärbar.
Ohnehin erst mit `sleep_data` (2.8) relevant.

### 3.10 Stress-Tab

M: kompletter Tab mit Score 0–100, vier Bändern, sechs gewichteten
Beiträgen, Ereignis-Log, „What helps you" · S: **kein Wort** — nur
`stress_level/work_stress/life_stress` im Check-in, und die
Score-Tabelle führt ein `stress_score`-Feld, das in keiner der drei
Gewichtstabellen der SPEC_05 vorkommt `[cmd]` · V: nichts (nur
Koffein/Stress-Spalten in Coach-Aggregaten, die die eigene
Checkin-Tabelle gar nicht hatte `[cmd]` — die Spec-Verwechslung gab es
also schon dort). **Empfehlung: Check-in-Felder anzeigen (Kachel 19
läuft heute schon), den zusammengesetzten Stresswert als offene
Produktentscheidung führen (E6) und den Tab bis dahin Attrappe lassen.**
Die Bänder („Cut volume 10–20 %") und die Beitragsgewichte wären
erfundene Schwellen im Sinne von C-105.

### 3.11 HRV-Anker im Mockup stimmen nicht mit der eigenen Formel überein

`[cmd]` Die HRV-Kachel druckt „anchors: z +2 → 100 · z 0 → 70 ·
z −2 → 30 · z ≤ −3 → 0" (`-v2.jsx:474`). Die Formel `70 + z × 15`
ergibt bei z = −2 aber **40** (nicht 30) und bei z = −3 **25** (nicht
0); auf 0 fällt sie erst bei z ≤ −4,67. Kleiner Text-Bug der Vorlage —
bei Übernahme die Anker aus der Formel ableiten, nicht abtippen.

### 3.12 Namen und Spalten

- Score-Spalten: V `score`/`sleep_component`/… · S
  `recovery_score`/`sleep_quality_score`/… + `mode` + Schnappschüsse.
  Empfehlung: S-Zuschnitt (der `mode` und die Schnappschüsse fehlen V),
  Namen nach Repo-Konvention.
- `screen_time_hours NUMERIC` (S) vs. `screen_time_before_bed`
  Minuten (M und gebaute Tabelle) — durch Schritt 120 entschieden,
  Minuten `[cmd]`.
- `checkin_time TIMESTAMPTZ DEFAULT now()` (S) vs. lokale `TIME` ohne
  Default (gebaut, C-61-Begründung) — entschieden `[cmd]`.
- Protokolle: M führt 4 Vorlagen (Injury „7–14 Tage"), SPEC_08 seedet
  **5** (zusätzlich „Overtraining Recovery", Injury fest 10 Tage)
  `[cmd]`. Empfehlung: die 5 Seeds als Startbestand prüfen und mit den
  Trigger-Texten der Kachel 31 abgleichen; die Dauer „7–14" braucht
  ohnehin eine feste Zahl oder eine Spanne aus zwei Spalten.

---

## 4. Was SPEC_09 verlangt — und was davon eine Bewertung wäre

Die Repo-Regel (C-49, GO-14): *„Du hast 60 % des Referenzwerts
erreicht" ist eine Messung. „Deine Erholung ist mangelhaft" ist eine
Aussage über einen Menschen.*

**Messungen** — Zahlen mit benanntem Bezug, unstrittig baubar:

- die Sub-Scores als Prozent eines erklärten Referenzwerts:
  Schlafdauer vs. 8-h-Ziel, Schlafqualität /10, Gefühl /10,
  Soreness-Mittel /3, HRV als z-Score **gegen die eigene Baseline**
  (kein Populationsvergleich), ACWR als Quotient eigener Lasten,
  Modality-Bonus als gedeckelte Summe;
- die Übertrainings-**Signale** einzeln: „7-Tage-HRV liegt unter 90 %
  deiner Baseline" ist eine Messung mit Schwelle, solange Wert und
  Schwelle nebeneinander stehen — genau so druckt es die Kachel;
- die Muskelerholung als Kurvenwert × Modifikatoren, solange die
  Herleitung sichtbar bleibt (das Mockup druckt jede Formel unter das
  Ergebnis — dieses Muster beibehalten).

**Bewertungen** — Urteile über die Person, die Tom vorher abnehmen muss:

- der **Gesamt-Score selbst**: die Gewichte 30/15/… sind eine
  Setzung ohne Quelle. Dieselbe offene Frage wie beim
  Nutrition-Score (C-49) — dort wurde sie nicht nebenbei entschieden,
  hier auch nicht.
- die **Readiness-Etiketten**: „Poor", „Forced rest", „Maximum
  intensity · PR day" — Trainingsanweisungen und Zustandsurteile;
- `intensity_recommendation` als gespeicherte Handlungsempfehlung;
- die **Übertrainings-Schweregrade** samt Texten „Mandatory break —
  see a doctor if this persists": das ist gesundheitsbezogene
  Ansprache, nahe an Medical-Terrain;
- die **Protokoll-Trigger** („Score 60–70 für 3+ Tage → Active
  Recovery Week") und `evidence_level` S/A/B/C ohne Beleg;
- die **Stress-Bänder** („Elevated → Cut volume 10–20 %");
- die Empfehlungs- und Insight-Prosa des Vorgängers
  („Übertraining-Risiko!", „Du bist in Top-Form!") — nicht übernehmen,
  bevor der Ton entschieden ist.

**Entscheidungen für Tom, nummeriert:**

| # | Entscheidung | Vorschlag dieses Entwurfs |
|---|---|---|
| E1 | Score-Gewichte + Modi bestätigen — oder V1 bewusst nur `manual` | V1 nur `manual` (27 von 36 Check-ins ohne HRV); `hrv`-Modus folgt mit `hrv_readings` |
| E2 | Soreness-Mittelung (3.5) | nur gemeldete Muskeln > 0 |
| E3 | Readiness-Stufen und ihre Texte | 6 Stufen des Mockups, Texte einzeln abnehmen |
| E4 | OT-Signalsatz (8 oder 9), Schwellen, Arzt-Hinweis ja/nein | 9 Signale, Mockup-Schwellen, Arzt-Formulierung Tom |
| E5 | Modality-Bonuswerte (Quelle?) | Mockup-Werte als v1-Konstanten, als Setzung gekennzeichnet |
| E6 | Stress-Score überhaupt bauen? | zurückstellen; nur Check-in-Felder zeigen |
| E7 | Eine Erholungskurve oder muskelspezifische Zeiten (SPEC_08) | V1 eine Kurve; Params-Tabelle erst mit Quelle |
| E8 | Motivation-Schwelle des OT-Signals auf 10er-Skala | ≤ 5 von 10 `[annahme]` — umgerechnet, nicht belegt |
| E9 | Nutrition-Term ohne Nutrition-Score: Rückfall 70 wie S/V? | Rückfall 70, im Score-Schnappschuss als Rückfall markiert |

---

## 5. In welcher Reihenfolge, und was blockiert was

**Schlaf (subjektiv) steckt im Check-in, deshalb: Score vor allem
anderen; Bereitschaft vor Übertraining; Wearable-Pfade zuletzt.**
Das deckt sich mit der G-21-Reihenfolge und verschiebt nur eines: die
Modalitäten rücken vor die Muskelkarte, weil sie ohne Fremdmodul
auskommen.

1. **`recovery.scores` + Scoring-Code (manual)** — blockiert von E1/E2
   (Formelabnahme), sonst von nichts: Check-ins liegen vor, ACWR ist
   aus `training.workout_sets` ableitbar, Nutrition fällt auf 70
   zurück (E9). Macht Kopfzeile, Score-Karte (#1), Live-Vorschau (#7)
   und Legende (#8) echt; füllt ab dann die Historie, die Schritt 4
   und die Protokoll-Trigger brauchen.
2. **`recovery.modality_log`** — blockiert von nichts. Macht #4,
   20–25 echt; `next_day_score_delta` rechnet gegen die Scores aus
   Schritt 1.
3. **Muskelkarte als Lesefunktion** (keine neue Tabelle) — blockiert
   von Trainings-**Daten**, nicht -Tabellen: `training.workout_sets`
   existiert, braucht aber laufende Sitzungen im Konto. Die Naht
   liegt fertig (`MUSCLE_SLUG_MAP`, seit G-44/G-55 auf 96 Gruppen →
   17 Flächen). Nutrition-Modifikator zunächst neutral 1.0, bis
   Protein-/Kalorien-% als Lesewert bereitstehen.
4. **`recovery.hrv_readings`** (+ Baseline on read) — schaltet den
   `hrv`-Modus von E1 frei (min. 7 Messungen). Manuelle Eingabe
   zuerst; die Handykamera-Messung (PPG) ist eine eigene Baustelle
   und blockiert nichts.
5. **`recovery.protocols` + `protocol_assignments` +
   `protocol_task_checks`** — Stammdaten-Seed sofort möglich (5
   Vorlagen aus SPEC_08, gegen Kachel 31 abgeglichen); die
   **Trigger-Vorschläge** brauchen Score-Historie aus Schritt 1.
6. **`recovery.overtraining_alerts`** — fachlich blockiert von
   Wochen an Verlauf aus Schritten 1–4 (7d-HRV, 3d-Score, Trends).
   Zuletzt unter den beschlossenen Tabellen.
7. **`recovery.sleep_data`** — blockiert vom Wearable-Import, den es
   nicht gibt. Erst mit ihm.
8. **Stress** — blockiert von E6. Ohne Entscheidung keine Tabelle.

**Querblocker außerhalb des Moduls:** `recovery` fehlt in
`supabase/config.toml` unter den exponierten Schemata `[cmd]` (in
G-26/104-muskelkarte gemessen: „Invalid schema: recovery" beim
Lesen über die API — die Check-in-Anbindung greift erst nach der
Freigabe). Das betrifft jeden der Schritte 1–6 und gehört in den
ersten Bauauftrag.

**Testdatenregel für jeden Bauauftrag** (aus CLAUDE.md): Wegwerf-DB
für den Kettenlauf, danach Seeds auf `dev@lumeos.app`;
`eigenes-konto-fuellen.sql` erweitert der jeweilige Auftrag um die
neue Tabelle. Zahlen tragen ihren Stichtag.
