# 173 — Gesamtabgleich Mockup gegen Ist-Zustand

**Auftrag Tom, 2026-08-20:** *„Alles nochmal gegenprüfen gegen Spec,
altes Repo, Mockup — und allfällige Probleme neu auflisten, dass wir die
durcharbeiten können."*

**Gemessen am 2026-08-20 gegen 49 Mockup-Dateien (1.725 KB), 120
Spec-Dateien (1.046 KB) und den Live-Stand.**

---

## Kurzfassung

`[cmd]` **Von 15 Modulen im Entwurf haben 7 keine Seite in `apps/web`:**
Admin, Buddy, Marketplace, Settings, Cross-Module, Onboarding, Stubs.

`[cmd]` **Von den 8 gebauten fehlen zwischen 1 und 39 Komponenten je
Modul.**

`[read]` **Und der schwerwiegendste Befund ist nicht die Zahl, sondern
die Art:** **Zahlen, die als *„unbelegt"* oder *„fehlt"* in offenen
Punkten stehen, sind im Entwurf vorhanden** — mit Werten, Formeln und
Schwellen.

---

## 1. Module ohne Seite in `apps/web/v2`

| Modul | Komponenten im Entwurf | Anmerkung |
|---|---|---|
| **market** | **52** | 7 Dateien, 203 KB — wartet auf Rechtsfragen |
| **buddy** | **44** | 4 Dateien, 110 KB — 16 Tabellen spezifiziert |
| **stubs** | **31** | 2 Dateien, 60 KB — zu prüfen, was das ist |
| **admin** | **25** | `apps/admin` existiert separat |
| **completeness** | **14** | **das sind die Settings** (G-131) |
| **crossmodule** | **6** | 17 KB |
| **onboarding** | **1** | `WALK`, 4 Schritte (G-83) |

---

## 2. Was in den gebauten Modulen fehlt

| Modul | fehlend / gesamt |
|---|---|
| **coach** | **39 / 89** |
| **medical** | **22 / 51** |
| **recovery** | **17 / 61** |
| **supplements** | **16 / 68** |
| goals | 6 / 40 |
| nutrition | 4 / 26 |
| training | 2 / 33 |
| dashboard | 1 / 3 |

`[read]` **Training und Nutrition sind am weitesten** — das Ergebnis der
letzten zwei Tage.

---

## 3. Der schwerwiegende Teil: belegte Werte gelten als unbelegt

### C-105 — MEV/MAV/MRV *„haben keine Tabelle"*

`[cmd]` **`module-training-spec.jsx` trägt `LANDMARKS`** — je
Muskelgruppe:

```
Chest      mev 10  mav 18  mrv 22  cur 14
Back       mev 12  mav 20  mrv 25  cur 18
Shoulders  mev  8  mav 16  mrv 20  cur 10
Biceps     mev  8  mav 14  mrv 20  cur 14
Quads      mev  8  mav 16  mrv 20  cur 18
Hamstrings mev  6  mav 12  mrv 16  cur  9
```

`[read]` **Zehn Muskelgruppen, dazu `pump`, `sore` und `points`.**
**Der Punkt bleibt offen** — es sind Entwurfswerte ohne Quelle, und die
Recherche (crawl_025) soll klären, ob sie belegbar sind. **Aber die
Struktur steht, und das Format ist damit vorgegeben.**

### C-145 — *„welche Strukturen sind in der Literatur üblich?"*

`[cmd]` **`PROGRESSION_MODELS` trägt sie mit Formel:**

```
linear    Beginner      next_weight = current + 2.5 kg
double    Intermediate  reps < max ? reps+1 : (weight+inc, reps=min)
```

`[read]` **Und `DELOAD_TRIGGERS`, `ROUTINE_TEMPLATES`, `SET_TYPES`
stehen daneben.** **Der Trainingsplan-Tab war *„nicht baubar"*** (C-145)
— **der Entwurf sagt, woraus er besteht.**

### C-124 — Modalitäten-Bonuswerte *„unbelegt"*

`[cmd]` **`module-recovery-engine.jsx` trägt `MODALITY_BONUS`:**

```
sauna 2.0 · massage 2.5 · cold_plunge 1.5 · contrast_therapy 2.0
nap 1.5 · meditation 1.0 · breathwork 1.0 · yoga 0.75
foam_rolling 0.5 · stretching 0.5 · active_recovery 0.5
MAX_DAILY_BONUS = 5.0
```

`[read]` **Elf Modalitäten mit Deckel.** Die Datenbank kennt vier.

### C-124/E8 — die Übertrainings-Schwelle

`[cmd]` **`OVERTRAINING_SIGNALS` trägt vier Prüfungen mit Schwellen:**

| Signal | Schwelle |
|---|---|
| `hrv_low` | 7-Tage-Schnitt **unter 90 % der Grundlinie** |
| `rhr_high` | Ruhepuls **+5 bpm** über Grundlinie |
| `sleep_poor` | Schlafqualität **unter 6** über 3 Tage |
| `fatigue` | subjektives Gefühl **≤ 4** über 3 Tage |

`[read]` **Jede mit `check`-Funktion und `detail`-Text.** **Genau das,
was E8 als offene Frage führt.**

---

## 4. Zwei Dateien, die nie erwähnt wurden

`[cmd]` **`module-training-spec.jsx`** und
**`module-recovery-engine.jsx`** — sie tragen die Rechenwerke, nicht die
Anzeige.

`[read]` **Beide Module wurden mehrfach beauftragt, ohne dass sie
gelesen wurden.**

---

## 5. Datenkonstanten je Modul, die kein Gegenstück haben

### Recovery — 25 Konstanten, Schema hat 3 Tabellen

`[cmd]` **`SLEEP_DATA`, `HRV_LOG`, `HRV_BASELINE`, `ACWR_DATA`,
`OT_DATA`, `PROTOCOL_DEFS`, `RECOVERY_PROTOCOLS`, `RECOMMENDATIONS`,
`READINESS_LEVELS`, `MOOD_MULTIPLIER`.**

`[read]` **`recovery` hat `checkins`, `modality_log`, `scores`.**
**Schlaf, HRV-Verlauf, Protokolle und ACWR fehlen komplett.**

### Supplements — 27 Konstanten, 14 Tabellen

`[cmd]` **Ohne Gegenstück:** `INJ_SITES`, `INJ_SCHEDULE`, `INJ_LOG`,
`STACK_TEMPLATES`, `PRODUCT_DETAILS`, `EXTENDED_LABS`,
`BLOODWORK_PANEL`, `GAP_ROWS`, `SEVERITY_META`.

`[cmd]` **Und 16 Modale fehlen** — `AddSupplementModal`,
`LogDoseModal`, `LogSkipModal`, `AddSideEffectModal`, `ReorderModal`,
`PlanCycleModal`, `PermissionsModal`.

`[read]` **Das Modul liest, aber niemand kann etwas eintragen.**

### Goals — 13 Konstanten, 6 Tabellen

`[cmd]` **Ohne Gegenstück:** `PHOTO_PROGRESSION`, `POSE_SETS`,
`PE_MODES`, `CONTRIB_WEIGHTS`, `CONTRIBUTIONS`.

`[read]` **Fortschrittsfotos mit Posen-Sets** — im Entwurf da, im Schema
nicht.

### Training — 12 Konstanten, 8 Tabellen

`[cmd]` **Ohne Gegenstück:** `LANDMARKS`, `PROGRESSION_MODELS`,
`ROUTINE_TEMPLATES`, `DELOAD_TRIGGERS`, `HR_ZONES`, `HR_MAX`,
`SET_TYPES`, **`IDB_STORES`, `OUTBOX`, `SYNC_LOG`.**

`[read]` **Die letzten drei sind der Offline-Betrieb** — G-86 meldet
*„keine Warteschlangentabelle"*. **Der Entwurf hat sie.**

### Medical — 21 Konstanten, 12 Tabellen

`[cmd]` **Ohne Gegenstück:** `SYMPTOMS`, `SYMPTOM_BIOMARKER_MAP`,
`APPOINTMENTS`, `DOCUMENTS`, `HISTORY_TIMELINE`, `DIAGNOSES`,
`OCR_EXTRACTED`, `CORRELATIONS`, `UNIT_CONVERSIONS`.

`[read]` **C-159 meldet *„keine Symptomtabelle im ganzen Schema"*** —
**der Entwurf hat sie**, mit Zuordnung zu Biomarkern.

---

## 6. Was daraus folgt

`[cmd]` **Die Arbeit ist nicht *„was bauen wir"*, sondern *„was davon
gilt"*.**

`[read]` **Drei Sorten Lücke, und sie brauchen verschiedene
Antworten:**

**1. Struktur fehlt, Werte sind Entwurf** — MEV/MAV/MRV,
Modalitäten-Boni, OTS-Schwellen. **Die Recherche (crawl_025) klärt, ob
sie belegbar sind; das Format steht.**

**2. Struktur fehlt, Werte sind unstrittig** — Schlaf, HRV-Verlauf,
Symptome, Termine, Dokumente, Fortschrittsfotos. **Das sind
Schema-Aufträge.**

**3. Schreibwege fehlen** — 16 Supplement-Modale, 22
Medical-Komponenten. **Das Modul zeigt, aber nimmt nichts auf.**

`[cmd]` **Und eine Regel für den Orchestrator:** **`00-QUELLEN.md` nennt
alle Dateien je Modul.** `[read]` **Zwei davon —
`module-training-spec.jsx` und `module-recovery-engine.jsx` — tragen
Rechenwerke, keine Anzeige.** **Wer nur die Hauptdatei liest, findet
sie nicht.**


---

## 7. Nachtrag: die Spec-Ordner sind tiefer als gezaehlt

`[cmd]` **`docs/specs/Nutrition/` hat sieben Unterordner mit 45
Dateien** — `00_decisions/` (22 KB), `01_current_specs/` (darunter
`SPEC_06_DATABASE_SCHEMA.md` mit **64 KB**), `02_patches/` (13 Dateien),
`03_sql/`, **`04_adrs/` (12 ADRs)**, `05_reviews/` (**122 KB
Opus-Reviews**), `06_workorder_planning/`.

`[cmd]` **Rekursiv sind es 160 Spec-Dateien, 15,8 MB** — nicht 120 mit
1 MB. **`00-QUELLEN.md` ist berichtigt.**

### Zwoelf ADRs mit getroffenen Entscheidungen

`[read]` **Drei bestaetigen den Bau** (BLS-only, Gesamt-Hydration,
Supplements-Grenze), **zwei weichen ab** (Coach-Permissions pro
Subfunktion, `recipe_items` gegen `recipe_ingredients`), **eine fehlt
ganz** (`shopping_lists`).

### Drei Core-ADRs, alle April 2026

`[cmd]` **`ONBOARDING_ADR`** — **7 Schritte, Status final.** Mit
Post-Onboarding-Setup-Cards je Modul. **G-83 hielt fest, es gebe kein
Onboarding.**

`[cmd]` **`SUBSCRIPTION_GATES_ADR`** — kein Gate in V1, **aber
`display_tier` (1/2/3) ist das Abo-Tier**, nicht die Baumtiefe.
**Mikro-Tier 2 = Athlete (Plus), Tier 3 = Medical (Pro).**

`[read]` **G-101 hat es als Hierarchie gelesen** — C-161 hat das mit
`parent_code` behoben, **aber die Spalte heisst in der Anzeige weiter
*„Stufe"*.**

`[cmd]` **`AI_USAGE_WALLET_ADR`** — AI-Features aus dem Wallet, nicht
aus dem Abo.

---

## 8. Nachtrag: das Vorgaengerrepo

`[cmd]` **`biomarkerDetails.ts` — 121 KB, 1.564 Zeilen**, zweisprachig:
`description`, `whatItMeasures`, **`ifHigh`, `ifLow`**, und **`ranges`
mit `lab`, `optimal`, `athlete` je Geschlecht.**

`[read]` **Das Pendant zu `nutrientDetails.ts`, das C-161 heute
importiert hat** — und `athlete` ist der Wert, den es fuer LumeOS
braucht.

`[cmd]` **`free-exercise-db.json` — 873 Uebungen mit `instructions` und
`images`.** `[read]` **Nicht noetig:** `training.exercises` hat **1.416
Zeilen, alle mit Anleitung, 1.412 mit Tipps, 1.416 mit Medien.** **Der
Bestand ist besser als die Quelle.**

`[cmd]` **`bls-foods.json` — 17,5 MB.** Unser Bestand: 7.140 Foods,
869.501 Naehrwerte. **Ebenfalls abgedeckt.**

---

## 9. Was zu tun ist — nach Dringlichkeit

**Sofort, weil sichtbar falsch:**

`[cmd]` **G-133** — Allergen-Pillen: *„Ohne Laktose 1.021"* statt 6.119.
**G-140** — die Spalte *„Stufe"* zeigt das Abo-Tier.

**Klein und blockierend:**

`[cmd]` **C-175** (`shopping_lists`) · **G-126** (drei Reste) ·
**A-31** (Pfadpruefung ins Gate).

**Gross, aber vorbereitet:**

`[cmd]` **C-176** (`biomarkerDetails.ts`, 121 KB) · **G-141**
(Onboarding nach ADR) · **G-131** (Settings, sieben Bereiche) ·
**G-138** (16 Supplement-Schreibwege).

**Schema-Aufträge:**

`[cmd]` **C-166** (Recovery: Schlaf, HRV, Protokolle) · **C-169**
(Trainingsplan) · **C-171** (Medical: Symptome, Termine, Dokumente) ·
**C-170** (Offline-Betrieb) · **C-172** (Stress-Tab).

**Entscheidungen fuer Tom:**

`[cmd]` **GO-23** (Deckungsgrenze) · **G-134** (Filtergruppen) ·
**G-136** (zwei Kartenzuordnungen) · **C-174** (`strong` als dritte
Stufe) · **A-37** (Coach-Permissions pro Subfunktion) · **T1–T9**
(Coach-Portal).
