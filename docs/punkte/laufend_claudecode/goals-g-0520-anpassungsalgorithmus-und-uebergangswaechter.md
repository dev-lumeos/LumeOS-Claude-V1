---
nr: G-520
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-27
beauftragt: 2026-09-29
agent: claudecode
quellen:
  - docs/specs/Goals/PHASE_MODELS.md:175

braucht: [G-519]
kind_von: G-519
entscheidung: E-68

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
    - recovery.checkins
  dateien:
    - docs/specs/Goals/PHASE_MODELS.md

zahlen:
  gemessen: 2026-09-27
  waechter_in_der_spec: 7
  anpassungsregeln_in_der_spec: 6
  gebaut: 0
---

# G-520 - der Anpassungsalgorithmus und die sieben Uebergangswaechter fehlen

## Der Befund

`[cmd]` **`docs/specs/Goals/PHASE_MODELS.md` Zeile 175 bis 223 fuehrt
zwei Bauteile, die es im Repo nicht gibt:**

**1. `weeklyAdjustment(data, phase)`** — die woechentliche Korrektur,
mit Bedingungen UND Betraegen:

| Phase | Bedingung | Aktion |
|---|---|---|
| fat_loss | `weightTrend > -0.1` und `calorieAdherence > 85` | `-100 kcal` (Plateau) |
| fat_loss | `weightTrend < -1.0` | `+150 kcal` (zu schnell) |
| fat_loss | `strengthTrend < -10` | `+20 g Protein` |
| lean_bulk | `weightTrend > 0.75` | `-100 kcal` |
| lean_bulk | `weightTrend < 0.1` und `calorieAdherence > 85` | `+100 kcal` |
| alle | `hrv7d < hrv_baseline * 0.85` | `recovery_alert` |

**2. Die Waechtertabelle**, sieben Zeilen, ebenfalls mit Betraegen —
darunter zwei, die es nur dort gibt: **BF% unter 5 % (M) / 10 % (F)
loest eine Gesundheitswarnung aus**, und **max_duration_weeks
erreicht empfiehlt einen Uebergang.**

`[read]` **Das ist keine Entscheidung, das ist Bauarbeit.** Die
Betraege stehen da, die Bedingungen stehen da. Was fehlt, ist der
Aufrufer.

## Was die Rechnung braucht

`[read]` **Vier Eingangsgroessen, je eine Frage an den Bestand:**

- `weightTrend` — kg/Woche aus `goals.body_measurements`
- `calorieAdherence` — Prozent aus `nutrition.daily_summary` gegen
  `goals.nutrition_targets`
- `strengthTrend` — Prozent auf den Grunduebungen, aus
  `training.workout_sets` (e1RM liegt als Trigger vor, G-25)
- `hrv7d` gegen `hrv_baseline` — aus `recovery.checkins`

**Vor dem Bauen messen, ob jede der vier ueberhaupt rechenbar ist.**
G-25 hat gezeigt, dass eine Groesse vorhanden sein kann und trotzdem
keine Reihe traegt.

## Nachweiszeilen

**A1** — je Eingangsgroesse gemessen: rechenbar oder nicht, mit
Zeilenzahl und Stichtag. Was nicht traegt, wird gemeldet, nicht
geschaetzt.

**A2** — alle sechs Anpassungsregeln und alle sieben Waechter
gebaut, je mit einem Test, der die Grenze von beiden Seiten trifft.

**A3** — **Grenze zu C-108/F-02 pruefen:** eine Empfehlung ist
keine Bewertung, aber sie ist nah dran. Vorher klaeren, ob der
Waechter vorschlaegt oder handelt.

**A4** — die Gesundheitswarnung bei BF% unter 5 % (M) / 10 % (F)
ist eine Aussage ueber den Koerper des Nutzers. Sie faellt unter
E-74 und braucht die dort festgelegte Form.

**A5** — vier andere Module zeichengleich, Testlaeufe gruen,
Sabotageprobe je Waechter, nichts committet.

## Abhaengigkeit

`[read]` **Blockiert durch G-519.** Solange die Phasen nicht stehen,
gibt es nichts, was angepasst werden koennte.

## Vorbereiteter Auftrag - Claude Code, geschrieben 2026-09-29, 08:20

**Noch nicht raus.** Geht raus, wenn G-519 A5-A8 zurueck ist — dieser
Punkt ist durch G-519 blockiert, und ein Bericht aendert oft die
Praemisse des naechsten Auftrags (`00-LIESMICH.md:405`).

    Bereich: apps/web/src/lib/goals/, apps/web/src/app/v2/goals/,
             packages/scoring/
    Fremd:   supabase/ (Codex) · docs/ (Orchestrator)

### DER WIDERSPRUCH, DER VOR DEM BAUEN ZU KLAEREN IST

`[cmd]` **`PHASE_MODELS.md:175-223` gibt alle Betraege in KALORIEN:**
`-100 kcal` bei Plateau, `+150 kcal` bei zu schnellem Verlust,
`-100 kcal` bei zu schnellem Aufbau, `+100 kcal` bei Stillstand.

`[cmd]` **Nach E1 ist die gespeicherte Groesse die RATE**, nicht das
Kaloriendelta — `goal_phases.zielrate_pct_kg_woche`, und auf
`goal_phases` gibt es null Kalorienspalten (selbst gemessen).

`[read]` **Damit kann `weeklyAdjustment` keine Kalorien verstellen.**
Es verstellt die Rate, und die Spec-Betraege werden umgerechnet:

    kcal/Tag = 11 x Rate(% KG/Woche) x Gewicht(kg)

    -100 kcal bei 80 kg  ->  -0,114 %/Woche
    +150 kcal bei 80 kg  ->  +0,170 %/Woche

**Die Umrechnung haengt am Gewicht.** Derselbe kcal-Betrag ist bei
45 kg eine andere Rate als bei 120 kg — das ist genau der Befund, der
zu E1 gefuehrt hat. **Rechne jede Anpassung als Rate und belege die
Umrechnung mit einem Test an beiden Raendern.**

`[read]` **Die Aussengrenze bleibt:** eine Anpassung darf die Rate
nicht ueber `-2,5 … 1,5` hinaustragen, und das Vorzeichen je Phasenart
bleibt gewahrt (`goal_phases_zielrate_passt_zur_art`). Eine Anpassung,
die gegen einen CHECK laeuft, wird zu einem Hindernissatz, nicht zu
einem HTTP 500 — G-527 hat den Weg dafuer gebaut.

### A1 - zuerst messen, ob die vier Eingangsgroessen tragen

    weightTrend        kg/Woche aus goals.body_measurements
    calorieAdherence   Prozent aus nutrition.daily_summary gegen
                       goals.nutrition_targets
    strengthTrend      Prozent auf den Grunduebungen aus
                       training.workout_sets (e1RM liegt als Trigger
                       vor, G-25)
    hrv7d / hrv_baseline   aus recovery.checkins

Je Groesse: rechenbar oder nicht, mit Zeilenzahl und Stichtag. **Was
nicht traegt, wird gemeldet, nicht geschaetzt.** G-25 hat gezeigt, dass
eine Groesse vorhanden sein kann und trotzdem keine Reihe traegt.

`[read]` **A1 entscheidet, ob A2 ein Auftrag ist oder vier.** Genau wie
bei G-522 A1, wo von fuenf Modulen nur zwei einen Tagesscore liefern
konnten.

### A2 - sechs Regeln, sieben Waechter

Alle mit einem Test, der die Grenze von BEIDEN Seiten trifft. Die
Bedingungen und Betraege stehen in der Spec; **was fehlt, ist der
Aufrufer.**

`[cmd]` **Zwei Waechter gibt es nur dort:** BF% unter 5 % (M) / 10 % (F)
loest eine Gesundheitswarnung aus, und `max_duration_weeks` erreicht
empfiehlt einen Uebergang.

`[read]` **`max_duration_weeks` existiert nirgends als Daten** — das ist
G-529 A3 und liegt bei Codex. Bis dahin ist dieser Waechter nicht
rechenbar und wird als solcher gemeldet, nicht mit einer geratenen Dauer
gebaut.

### A3 - die Grenze zu C-108/F-02

Eine Empfehlung ist keine Bewertung, aber sie ist nah dran. **Vorher
klaeren, ob der Waechter vorschlaegt oder handelt.** Ein Waechter, der
die Rate selbst verstellt, trifft eine Entscheidung ueber den Nutzer.

### A4 - die Gesundheitswarnung faellt unter E-74

BF% unter 5 % (M) / 10 % (F) ist eine Aussage ueber den Koerper des
Nutzers. **Sie braucht die in E-74 festgelegte Form** — nachlesen, nicht
erfinden.

### A5 - die Grenze

Vier andere Module zeichengleich vorher/nachher, Testlaeufe gruen,
Sabotageprobe je Waechter in beide Richtungen. Nachweise auf
`test-user@lumeos.local`. Nichts committen, nichts pushen.

### Nachzug aus G-519, 2026-09-29 - VOR dem Bauen lesen

`[cmd]` **A6 von G-519 hat FUENF Arten gemessen, die ins Leere fuehren,
nicht sieben:** `recomp`, `contest_prep`, `reverse_diet`,
`expert_bb_annual`, `peak_week`. **`maintenance` liefert mit Rate 0,0 ein
Ziel** (der CHECK erlaubt `|x| <= 0,1`), und `fat_loss`, `lean_bulk`,
`mini_cut` liefern ebenfalls, sobald sie anlegbar sind.

`[cmd]` **Und drei davon sind ueber `goals.goal_phase_start` heute NICHT
anlegbar** — die Funktion hat keinen Rate-Parameter, der CHECK verlangt
die Rate aber `NOT NULL`. **Das ist G-531 und liegt bei Codex.**

`[cmd]` **Bis G-531 steht, hat `apps/web/src/lib/goals/phase-write.ts`
einen zweigeteilten Schreibweg:** ohne Rate die Funktion, mit Rate ein
`INSERT` mit vorheriger Sperrpruefung. `[read]` **Wenn dein
Anpassungsalgorithmus eine Rate schreibt, laeuft er ueber denselben
zweiten Weg** — und die Sperrpruefung ist kein gleichwertiger Ersatz fuer
die `23505`-Sperre. **Ein Waechter, der selbsttaetig schreibt, macht aus
einem hinnehmbaren Augenblick einen Dauerzustand.** Das ist ein Grund
mehr, A3 (vorschlagen oder handeln?) vor A2 zu klaeren.

`[cmd]` **`max_duration_weeks` existiert weiterhin nirgends als Daten.**
Der Waechter dazu ist nicht rechenbar und wird als solcher gemeldet,
nicht mit einer geratenen Dauer gebaut. Das ist G-529 A3, und es liegt
hinter G-531.

## Bericht

**Claude Code, 2026-09-29.**

### A1 — die vier Eingangsgroessen, gemessen

`[cmd]` **Gegen die laufende Datenbank, 2026-09-29. Alle vier
tragen — eine fuenfte fehlt.**

    weightTrend        goals.body_measurements
                       181 Zeilen (dev/tom), 62 in 14 Tagen
                       TRAEGT
    calorieAdherence   nutrition.daily_summary.enercc
                       gegen goals.nutrition_targets.kcal
                       181 Zeilen (dev), 7 (test-user)   TRAEGT
    strengthTrend      training.workout_sets.estimated_1rm
                       222 von 233 Saetzen, 23 Uebungen  TRAEGT
    hrv7d              recovery.checkins.hrv_rmssd
                       43 Werte (dev), 8 (test-user)     TRAEGT
    ----------------------------------------------------------
    hrv_baseline       GIBT ES NICHT

`[cmd]` **Keine `%baseline%`-Spalte im ganzen Schema** — nur
`hrv_rmssd`, `hrv_score`, `hrv_source`, `hrv_impact_points`.
`[read]` **Sie liesse sich aus derselben Reihe ABLEITEN, aber das
ist eine Festlegung, keine gespeicherte Groesse.** **Die Funktion
nimmt sie deshalb als Argument und sagt, wenn sie fehlt.**

`[read]` **Eine Berichtigung zu meinem ersten Blick:** ich habe
nach `%e1rm%` gesucht und nichts gefunden — **die Spalte heisst
`estimated_1rm`.** `[read]` **Die Praemisse des Punktes stimmt;
mein Suchmuster war zu eng.**

`[cmd]` **Und eine Auffaelligkeit:** beide Reihen laufen bis
**2026-11-16**, also in die Zukunft. `[read]` **Ein Trend muss das
Fenster beidseitig begrenzen** — sonst mittelt er Seed ein.

`[read]` **Damit ist A2 EIN Auftrag, nicht vier** — anders als bei
G-522/A1, wo drei von fuenf Modulen ausfielen.

### A3 — vorschlagen, nicht handeln. VOR A2 geklaert

`[cmd]` **C-108 und F-02, zitiert in `E-56:51` und `E-57:224`:**
*,,nennen ja, bewerten nein"*.

`[cmd]` **Keine Funktion in `anpassung.ts` oder
`uebergangswaechter.ts` schreibt** — ein eigener Test prueft es
(kein `createSessionClient`, kein `.rpc(`, kein `.insert(`,
`.update(`, `.upsert(`, `fetch(`).

`[read]` **Der zweite Grund ist technisch:** seit G-519 hat
`phase-write.ts` einen zweigeteilten Weg, und die Sperrpruefung
darin **ist kein gleichwertiger Ersatz fuer die `23505`-Sperre**.
**Ein Waechter, der selbsttaetig schreibt, macht aus einem
hinnehmbaren Augenblick einen Dauerzustand.**

### Der Widerspruch, umgerechnet

`[cmd]` **Die Spec gibt alles in Kalorien, E1 speichert die Rate.**
`[cmd]` **`rateAusKcal(kcal, gewicht)` = `kcal / (11 x gewicht)`.**

**An BEIDEN Raendern belegt:**

    -100 kcal bei  45 kg  ->  -0,202 %/Woche
    -100 kcal bei  80 kg  ->  -0,114 %/Woche
    -100 kcal bei 120 kg  ->  -0,076 %/Woche
    +150 kcal bei  80 kg  ->  +0,170 %/Woche

`[read]` **Der leichte Rand ergibt die 2,7-fache Rate des
schweren** — **genau der Befund, der zu E1 gefuehrt hat.** **Ohne
Gewicht: `null`, keine erfundene Rate.**

`[cmd]` **`haltInGrenzen()` haelt beide CHECKs:** die Aussengrenze
kappt (`-2,5 … 1,5`), **ein Vorzeichenwechsel wird ABGEWIESEN, nicht
gekappt** — sonst liefe der Vorschlag gegen
`goal_phases_zielrate_passt_zur_art`.

### A2 — sechs Regeln, sieben Waechter

`[cmd]` **Alle gebaut, je mit Test an BEIDEN Seiten der Grenze:**

    Regel                     greift bei      greift nicht bei
    ------------------------------------------------------------
    fat_loss Plateau          -0,05 / 90 %    -0,10 / 90 %  und
                                              -0,05 / 85 %
    fat_loss zu schnell       -1,1            -1,0
    fat_loss Kraftverlust     -11             -10
    lean_bulk zu schnell      +0,8            +0,75
    lean_bulk Stillstand      +0,05 / 90 %    +0,10 / 90 %
    HRV                       50 von 60       51 von 60

`[read]` **Die Spec verlangt echte Ungleichheit** (`> -0.1`,
`< -1.0`) — **der Grenzwert selbst loest NICHT aus.** Das prueft je
Regel ein eigener Fall.

**Zwei Regeln koennen nicht wirken, und sie sagen es:**

`[cmd]` **`+20 g Protein`** — `goal_phases` hat keine Proteinspalte,
und `nutrition_targets.protein_g` rechnet `berechne_zielwerte` aus
dem Gewicht. **Der Vorschlag steht, der Schreibweg fehlt.**

`[cmd]` **Die HRV-Regel ohne Vergleichsgroesse** — sie meldet
*,,liesse sich nicht pruefen"*, statt still zu schweigen.

**Die sieben Waechter, je ein Befund — auch die nicht
greifenden:**

`[read]` **Sonst liesse sich *geprueft und in Ordnung* nicht von
*gar nicht geprueft* unterscheiden.** `[cmd]` **Deshalb tragen sie
`greift` UND `hindernis` getrennt.**

`[cmd]` **`max_duration_weeks` ist NICHT rechenbar und wird als
solches gemeldet** — nicht mit einer geratenen Dauer gebaut
(G-529/A3). `[cmd]` **Der Test prueft beides:** ohne Hoechstdauer
kommt das Hindernis, mit Hoechstdauer greift er von beiden Seiten
(19 von 20 nicht, 20 von 20 schon).

`[cmd]` **Uebertraining verlangt FUENF Tage**, nicht einen — die
Spec sagt *,,5+ Tage"*, und ein eigener Fall haelt es fest.

### A4 — die Gesundheitswarnung unter E-74

`[cmd]` **E-74:54-56 verbietet dreierlei:** eine Diagnose ableiten,
eine Therapie empfehlen, einen Wert als krankhaft bewerten.

`[cmd]` **Der gebaute Satz:**

    Gemessen 4.2 % Koerperfett. Die Phasenspec setzt fuer maennlich
    eine Aufmerksamkeitsgrenze bei 5 % (PHASE_MODELS.md:133). Was
    das fuer dich bedeutet, gehoert in aerztliche Haende — LumeOS
    bewertet es nicht.

`[read]` **Er nennt den Wert, ZITIERT die Quelle und gibt die
Einordnung ab** — E-74: *,,damit ist die Wiedergabe ein Zitat,
keine Aussage"*.

`[cmd]` **Ein Test prueft sieben verbotene Wendungen** —
`gefaehrlich`, `ungesund`, `krankhaft`, `zu niedrig`, `du
solltest`, `nimm `, `behandl`. **Und dass der Verweis auf
aerztliche Haende dasteht.**

`[cmd]` **Die Schwelle je Geschlecht aus der Spec: 5 % (M), 10 %
(W).** `[cmd]` **Ohne Geschlecht im Profil wird NICHT geraten** —
der Waechter meldet das Hindernis.

### A5 — die Grenze

`[cmd]` **`git status`: drei neue Dateien in
`apps/web/src/lib/goals/`, sonst nichts.** `[cmd]` **28
Zusicherungen gruen.**

**Sabotageprobe, sechs Eingriffe, je von ihren eigenen
Zusicherungen gefangen:**

    Umrechnung 11 -> 10           2, 3, 4    ROT
    Plateau-Grenze auf >=         1          ROT
    Vorzeichenschutz weg          3          ROT
    Uebertraining ab 1 Tag        5          ROT
    Phasendauer ohne Hindernis    1, 3       ROT
    Warnung bewertet              2, 3       ROT
    alles zurueck                 28 von 28  GRUEN, byteidentisch

`[read]` **Und eine eigene Falle, in die ich fast gelaufen
waere:** nach der ersten Sabotage habe ich `git checkout`
gerufen — **die Datei ist neu und ungetrackt, der Befehl tat
nichts.** `[cmd]` **Gemerkt am `grep`, behoben per `cp`.**

`[cmd]` **`turbo run typecheck test build`: 18 von 18.**

`[cmd]` **`pnpm gate` ist rot an EINER Stelle: `sammelfragen`,
wegen `G-532` und `G-377`** — beide in `docs/`, `G-532` heute
angelegt und ungetrackt. `[read]` **Nicht meine.** **Die drei
anderen Waechter sind gruen.**

### Was NICHT gebaut wurde

`[read]` **Keine Oberflaeche.** Der Auftrag nennt sie nicht, und
ohne `goal_contributions` (G-514) gaebe es keinen Ort, an dem ein
Vorschlag stuende. **Die Bauteile sind rein und bereit.**

`[cmd]` **Nichts in `supabase/`, nichts committet.**

## Abnahme A1 bis A5 - Orchestrator, 2026-09-29

_(Nach der am selben Tag geschaerften Regel: gezaehlt werden MERKMALE des
Ergebnisses, die Messung des Agenten wird nicht nachgebaut.
`00-LIESMICH.md`, ,,Und dasselbe gilt fuer die Abnahme".)_

### Merkmale, die ich gezaehlt habe

`[cmd]` **Die drei Dateien liegen:**

    lib/goals/anpassung.ts                    277 Zeilen, 10.527 Byte
    lib/goals/uebergangswaechter.ts           267 Zeilen, 10.986 Byte
    lib/goals/__tests__/g520-anpassung.test.ts

`[cmd]` **A3 ist strukturell belegt: KEINE der beiden Dateien schreibt.**
Null Treffer auf `.rpc(`, `.insert(`, `.update(`, `.upsert(`, `.delete(`.
`[read]` **Damit ist ,,nennen ja, bewerten nein" nicht nur behauptet,
sondern am Code ablesbar** — ein Waechter, der nicht schreiben KANN, kann
auch nicht selbsttaetig handeln.

`[cmd]` **Die Testzahl stimmt: 2084 vor dem Auftrag, 2112 danach.**
Differenz 28, genau seine Zusicherungen. 2112 von 2112 gruen.

`[cmd]` **`hrv_baseline` existiert nirgends** — eine Ja/Nein-Frage, selbst
gestellt. Was das Schema zu HRV fuehrt: `recovery.checkins.hrv_rmssd`,
`recovery.scores.hrv_score`, `recovery.scores.hrv_source`,
`recovery.stress_logs.hrv_impact_points`. **Kein Vergleichswert.** Die
Regel meldet sich zu Recht als nicht pruefbar.

`[cmd]` **`estimated_1rm` liegt auf `training.workout_sets`** — sein
erster Griff suchte `%e1rm%` und fand nichts, er hat es selbst
berichtigt. Daneben `training.workout_exercises.best_estimated_1rm` und
`training.routine_exercises.target_percent_1rm`.

`[cmd]` **Die Umrechnung selbst nachgerechnet, an beiden Raendern:**
-100 kcal ergeben -0,202 %/Woche bei 45 kg und -0,076 bei 120 kg,
Verhaeltnis **2,67-fach**. `[read]` **Das ist der Befund hinter E1 in
einer Zahl:** derselbe Kalorienbetrag ist am leichten Rand fast die
dreifache Rate. **Ein Vorschlag, der Kalorien verstellt, verstellt bei
zwei Nutzern zwei verschiedene Dinge.**

### Was ich NICHT nachgemessen habe

`[read]` **Die sechs Regeln und sieben Waechter einzeln gegen ihre
Grenzen** — das sind seine 28 Zusicherungen, und sie laufen im Gate.
Sein `[cmd]`, nicht meins.

### Ein Fehlalarm von mir, und was daraus folgt

`[cmd]` **Mein erster Testlauf meldete `# fail 1`.** `[cmd]` **Der zweite,
zwoelf Minuten spaeter: 2112 von 2112 gruen.**

`[read]` **Ursache: ich lief gegen einen halbfertigen Baum** — Claude Code
schrieb zu diesem Zeitpunkt schon an G-534 in denselben Dateien
(`phase-setzen.tsx` 09:55, `phase-echt.tsx` 09:56).

`[read]` **Regel daraus: waehrend ein Agent in einem Bereich schreibt,
misst dort niemand.** Ein Testlauf gegen mitten im Schreiben ist keine
Messung, sondern ein Zufall — und er haette als achte Fehlmessung des
Tages gezaehlt.

### Was offen bleibt, und wo es liegt

`[cmd]` **Drei Luecken, alle gemeldet statt geraten:**

    hrv_baseline           keine Spalte - die HRV-Regel meldet sich
                           selbst als nicht pruefbar
    +20 g Protein          goal_phases hat keine Proteinspalte
    max_duration_weeks     existiert nicht - G-529 A3, hinter G-531

`[read]` **Alle drei sind Meldungen, keine Platzhalter.** Das ist die
richtige Form: ein Waechter, der eine geratene Dauer prueft, prueft
nichts.

`[cmd]` **Und die Oberflaeche dazu ist G-534**, seit 09:52 bei Claude
Code. **Bis dahin ist von diesem Auftrag nichts zu sehen** — das ist
gewollt, aber es ist der Grund, warum G-534 nicht warten durfte.
