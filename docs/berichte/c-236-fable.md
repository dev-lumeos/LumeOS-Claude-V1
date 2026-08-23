# C-236 — Fable, 2026-08-23

**Roh, unbearbeitet.** Geprueft vom Orchestrator; die Pruefung steht in
`docs/todo/ERLEDIGT.md`.

---

## Erwartung vorher → gemessen nachher (dev, identisch für tom.seed)

Die Erwartung stand VOR dem Lauf — die neuen Formeln (Basis + zwei
Sinus-Frequenzen + deterministisches mulberry32-Rauschen je Spalte,
Saat = Index; kein `random()`) in Python vorgerechnet:

| Spalte | Erwartung (vorgerechnet) | Live gemessen |
|---|---|---|
| `hrv_rmssd` | n 43 · 39,6–68,7 · Mittel 54,20 · SD 8,13 | 43 · 39,60–68,70 · 54,2 / 8,1 ✓ |
| `resting_hr` | n 43 · 46–60 · ~52,8 | 43 · 46–60 ✓ |
| `spo2_pct` | 95,8–97,8 | 95,8–97,8 ✓ |
| `respiratory_rate` | 12,7–15,7 | 12,7–15,7 ✓ |
| `sleep_hours` / quality / feeling | Mittel ~7,4 · variabel | Läufe global geprüft |

## [2] Die vier leeren Spalten sind gefüllt

`sleep_start/end` 170/170 (Aufwachen 06:30–07:20, Einschlafen =
Aufwachen − Dauer − 15 min, über Mitternacht korrekt), `work/life_stress`
170/170 (um `stress_level` herum). `caffeine_mg` und
`screen_time_before_bed` unangetastet, wie beauftragt. Das C-67-Szenario
(18.8., schlechte Nacht ohne HRV) und die `isAfterLegs`-Tage bleiben. Die
Scores rechnen sich per `refresh_scores_for_user` konsistent aus den
neuen Werten.

Zeilenzahlen: Bestandskonten unverändert 340 (dev 170 + tom 170);
gesamt 370 = 340 + die 30 neuen des test-users.

## [3] test-user@lumeos.local trägt jetzt Nachweisdaten

Im Live-Skript `eigenes-konto-fuellen.sql` (Abschnitt 12, wiederholbar
mit Räumung): 30 Check-ins + 30 Scores, 6 Sitzungen mit 36 Sätzen
(Barbell Bench Press / Row), 1 Stack mit 2 Positionen und 24 Einnahmen —
deterministisch über `md5(name‖tag)`, Anker = `quelle_max − 75 Tage`, was
auf 2026-08-23 („heute") fällt, ohne von der Uhr abzuhängen. Bewusst
weiter leer (die Gate-Prüfungen erwarten es): `meal_plans` 0 ✓,
`user_medications` 0 ✓, keine Coach-Beziehung. Die drei Ausweich-Vermerke
aus G-158/159/160 sind damit Geschichte.

## [4] Training — gemessen, nicht befallen

Mit derselben Prüf-SQL über Gewichte je Übung (je Satzfolge) und e1RM je
Sitzung: kein einziger Lauf ≥6 Werte konstanter Differenz — die
Trainings-Seeds rechnen über e1RM-Ziele mit Modulo-Variation und sind
gesund. Nichts geändert (tom-Sets unverändert 101, Kontrollzahl 19).

## Das Zählreihen-Gate — und seine Rot-Probe in freier Wildbahn

Im Einspielskript steht jetzt ein DO-Block, der über
`hrv`/`resting_hr`/`spo2`/`resp_rate`/`sleep_hours`/`sleep_quality`/
`subjective_feeling` und die Trainingsgewichte je Übung läuft und den
Kettenlauf mit `RAISE EXCEPTION` bricht, sobald eine Reihe >5 Werte mit
konstanter Differenz (auch 0) trägt. Er ist doppelt belegt:

- **Rot:** Der erste Live-Lauf brach echt — *„sleep_quality traegt 7
  Werte in Folge mit konstanter Differenz 0"* — am noch nicht erneuerten
  Altbestand von dev (sauberer Rollback, live blieb unversehrt; danach
  Gate auf die Seed-Nutzer des Laufs begrenzt, weil die dev-Kopie erst im
  Folgeschritt aus der geprüften Quelle erbt). Zuvor hatte die Mess-SQL
  die Ur-Kranken exakt gefunden: hrv 43 Werte × +4, sleep_quality/feeling
  134 × 0.
- **Und es hat meine EIGENEN ersten Formeln geschnitten:** die
  Vorrechnung zeigte einen 7er-Lauf bei `feeling` — nachgeschärft
  (schnelle Sinus-Komponente + mehr Rauschamplitude), bis alle Läufe ≤5.

Endzustand: die globale Zählreihen-Probe über alle Konten und beide
Domänen ist leer.

## Läufe und Nachweise

- Wegwerf-Kette (89 Schritte) mit dem finalen Stand: KETTE OK, Exit 0
  (inkl. Gate und `testdaten-pruefen`; die szenariogebundenen Prüfungen —
  07:18/quality 3/hrv null, checkins ≥160, ohne_hrv >0 — bleiben grün).
- Live: Vollsicherung vorher
  (`backup/c236-vollsicherung-vor-einspielen.dump`, 19 MB, `pg_dump -Fc`)
  → Einspielen → `eigenes-konto-fuellen` → 19/19 Kontrollzahlen wie
  erwartet (Skript `backup/c236-kontrollzahlen.sql`, wiederholbar).
- Register: 2 neue Szenario-Einträge in `testdaten-register.json` (24
  gesamt). Alle Nachweisdateien LF/UTF-8, ohne Doppelkodierung
  (byte-geprüft).

## Meldungen

**1. Ehrlichkeitsvermerk:** Der Live-Einspiellauf startete unbeabsichtigt
— ein `import()`-„Ladetest" führte das Top-Level-Skript aus. Er war der
ohnehin nächste geplante Schritt und lief NACH der Vollsicherung mit dem
finalen Stand; trotzdem: mein Fehler, kein geplanter Ablauf. Zwei weitere
Stolperer, behoben: MSYS-`tar` der Git-Bash kann `D:\`-Pfade nicht (Kette
zweimal rot; Fix: System32-`tar` im PATH — Merkposten fürs Werkzeug), und
Backticks um `[cmd]` innerhalb des SQL-Template-Literals beendeten den
String (ReferenceError).

**2. Aufräumkandidat:** Im Live-Container sammeln sich 7 alte
`lumeos_kette_*`-Wegwerf-Datenbanken aus Fehlläufen (Aug 16–23) —
löschbar, aber nicht mein Auftrag.

**3.** Die G-160-Kacheln zeigen ab sofort die plausiblen Werte (HRV
~40–69 ms statt 230); Screenshots dort sind als Nachweis jetzt
aussagekräftig.
