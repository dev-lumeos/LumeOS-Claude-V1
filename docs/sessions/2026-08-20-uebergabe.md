# Übergabe — Stand 2026-08-20, Abend

**Für die nächste Sitzung. Lies das zuerst, dann `CLAUDE.md`.**

---

## Wo alles steht

| | |
|---|---|
| **Was gerade läuft** | `docs/todo/LAUFEND.md` |
| **Was offen ist** | `docs/todo/TODO.md` — **171 Punkte** |
| **Was erledigt ist** | `docs/todo/ERLEDIGT.md` — **259** |
| **Was gemessen wurde** | `docs/ssot/` — **146 Berichte**, Index in `00-INDEX.md` |
| **Was vor einem Auftrag zu lesen ist** | `docs/spezifikation/00-QUELLEN.md` |
| **Wie hier gearbeitet wird** | `CLAUDE.md` |

`[cmd]` **Branch `dev`, 137 Commits vor `origin/dev`, nie gepusht.**

---

## Die vier Agenten

| Agent | wofür | Bereich |
|---|---|---|
| **Codex** | Datenbank, Kette, Prüfwerkzeuge | `supabase/`, `tools/` |
| **Claude Code** | Oberfläche | ein Modul in `apps/web` |
| **Fable** | grössere Blöcke, Entwürfe, Datenarbeit | wechselnd |
| **Kimi** *(extern)* | Recherche | liefert ZIP nach `backup/kimi-research/` |

`[cmd]` **Ein UI-Agent je Modul** — zwei in `apps/web` teilen sich die
Browsersitzung, das hat am 2026-08-20 dreimal Zeit gekostet.

`[cmd]` **Die Nummer vergibt der Orchestrator im Auftrag.** A-18, A-32
und zwei weitere Kollisionen entstanden, weil Agenten selbst die
nächste freie Zahl nahmen.

`[cmd]` **In `LAUFEND.md` eintragen, wenn ein Auftrag rausgeht** — nicht
wenn er geschrieben ist. **Das ist am 2026-08-20 einmal schiefgegangen.**

---

## Was der Tag gebracht hat

### Nutrition ist von 37 auf 138 Nährstoffe gewachsen

`[cmd]` **C-157** hat `daily_nutrient_summary_long` gebaut — **138
Zeilen je Tag statt 37 Spalten.** `[read]` Die alte Tabelle brauchte je
Nährstoff zwei Spalten (Wert und `_missing`); für 138 wären das 276
gewesen.

`[cmd]` **Stärke stand vorher als Strich da** — 188,1 g, der grösste
Posten des Tages.

`[cmd]` **C-161** hat `parent_code` gebaut — **98 Beziehungen, 40
Wurzeln.** `[read]` Vorher leitete die Anzeige die Verschachtelung aus
`display_tier` ab, und Chlorid (2.509 mg) stand unter Natrium (1.084
mg).

`[cmd]` **Dazu 110 Erklärungen** aus `nutrientDetails.ts` des
Vorgängerrepos, **Zeitfenster** (30 Tage in 35 ms), **acht Karten**,
**Volltextsuche**, **98 Aliase**.

### Die Kette Substanz → Blutwert steht

`[cmd]` **C-133** — 64 Regeln mit drei Zuständen, davon `missing_input`
mit benannten Pfaden.

`[cmd]` **C-162** — 66 Lab-Marker, **222 Substanz-Wirkungen**, alle
LOINC-validiert. `[read]` **Kreatin → Kreatinin, eGFR und Cystatin C**
ist der Fall, der den Wert zeigt: der Wert steigt ohne Nierenschaden.

### Das Coach-Portal läuft

`[cmd]` **F-07** — `apps/coach` auf **Port 3220**, 12 Tabellen, **22
`coach_read`-Policies**, drei Athleten in drei Zuständen.

`[cmd]` **Konto:** `coach@lumeos.app` / `LumeosCoach2026`.

---

## Der wichtigste Befund des Tages

**Die meisten Lücken waren keine Lücken — sie waren ungelesen.**

`[cmd]` **SSOT 173** hat es systematisch gemessen:

| offener Punkt sagte | im Entwurf steht |
|---|---|
| C-105: *MEV/MAV/MRV haben keine Tabelle* | **`LANDMARKS`** — zehn Muskelgruppen |
| C-145: *fehlendes Schema für Pläne* | **`PROGRESSION_MODELS`** mit Formeln |
| C-124: *Modalitäten unbelegt* | **`MODALITY_BONUS`** — elf, Deckel 5,0 |
| E8: *ab wann Arzt-Hinweis?* | **`OVERTRAINING_SIGNALS`** — vier Schwellen |
| C-159: *keine Symptomtabelle* | **`SYMPTOM_BIOMARKER_MAP`** |
| G-86: *keine Warteschlange* | **`OUTBOX`, `SYNC_LOG`** |
| G-83: *kein Onboarding* | **`ONBOARDING_ADR`, Status final** |
| G-85: *Health score hat zwei Unbekannte* | **`SPEC_09_SCORING.md`, 408 Zeilen** |

`[read]` **Zwei Dateien tragen die Rechenwerke und wurden nie
gelesen:** `module-training-spec.jsx` und `module-recovery-engine.jsx`.

`[cmd]` **Deshalb gibt es jetzt `docs/spezifikation/00-QUELLEN.md`** —
49 Mockups (1.725 KB), 160 Specs (15,8 MB), je Modul aufgelistet.

---

## Was Kimi geliefert hat

`[cmd]` **`backup/kimi-research/.../data/evidence/`:**

| | |
|---|---|
| `constant_evidence_registry.json` | **181 Konstanten**, eingestuft |
| `recovery_modality_evidence.json` | 32 |
| `formula_evidence_registry.json` | 22 |
| `fatigue_signal_evidence.json` | 17 |
| **`symptom_ontology_seed.json`** | **21 Symptome** |
| `research_hold_registry.json` | 256 |

**Nur 7 von 181 Zahlen dürfen numerisch bleiben** — sechs davon
Anthropometrie (WHR, WHtR, Bauchumfang, BMI).

`[cmd]` **Je Eintrag steht `recommended_product_handling`:**
`KEEP_NUMERIC` · `USE_RANGE` · `USE_DIRECTIONAL_GUIDANCE` ·
`LABEL_HEURISTIC` · **`DO_NOT_IMPLEMENT`** · `REMOVE_NUMERIC_VALUE`.

`[read]` **Damit ist je Kachel entschieden, was gezeigt werden darf.**

**Und drei Entscheidungen sind damit gefallen:** ACWR nicht
implementieren · MAV nicht implementieren · **die Modalitäts-Boni raus**
(die 2,76 / 0,13 / 0,05 / −0,07 sind Seed-Werte, als `not_evidence`
geflaggt).

---

## Sofort zu tun

**Sichtbar falsch:**

`[cmd]` **G-133** — Allergen-Pillen zeigen *„Ohne Laktose 1.021"*.
**Das ist die Zahl der Lebensmittel *mit* Laktose. Richtig: 6.119.**

`[cmd]` **G-140** — die Spalte *„Stufe"* zeigt `display_tier`, **das
Abo-Tier** (Tier 2 = Athlete/Plus, Tier 3 = Medical/Pro), nicht die
Baumtiefe.

**Klein und blockierend:** C-186 fasst fünf zusammen — `shopping_lists`,
`EAA` auf neun, Prolactin und ApoB, zehn Medication-Spalten, drei Reste.

---

## Die Regeln, die heute entstanden sind

`[cmd]` **Alle stehen in `CLAUDE.md`:**

**Vor jedem Auftrag nachsehen** — Code, Daten, `docs/specs/`,
Vorgängerrepo. `[read]` Zwei Aufträge sind daran gescheitert, dass eine
Annahme im Text stand.

**Nach jedem Bericht nachtragen, ungefragt** — prüfen, committen, Punkt
schliessen, neue Befunde anlegen, Indexzeile setzen.

**Keine Konsolenfenster** — `tools/lauf.py` mit `shell=False` und
`CREATE_NO_WINDOW`. `[read]` **Der Orchestrator hat die Regel selbst
gebrochen und Tom stundenlang die Tastatur gekostet.**

**Nie `.next` löschen, nie `next build` direkt** — die Trennung
existiert seit B-18 über `LUMEOS_DIST_DIR`.

**Bildschirmfotos über `tools/schuss.mjs`** — headless, meldet sich
selbst an, zählt Attrappen und Konsolenfehler. **Kein gstack, kein
Bun.**

---

## Werkzeuge

| | |
|---|---|
| `tools/lauf.py` | `lauf()`, `git()`, `psql()` — ohne Fenster |
| `tools/schuss.mjs` | Bildschirmfoto je Tab, headless |
| `tools/svgpfade-pruefen.mjs` | im Gate, in beide Richtungen belegt |
| `tools/schemafreigabe-pruefen.mjs` | `config.toml` gegen Sollstand |
| `tools/serverimport-pruefen.mjs` | Server-Importe im Client-Bündel |

`[cmd]` **Dev-Server: Port 3200. Coach-Portal: 3220.**

`[cmd]` **Konten:** `dev@lumeos.app` / `LumeosDev2026` ·
`test-user@lumeos.local` / `LumeosTestUser2026` · `coach@lumeos.app` /
`LumeosCoach2026`.

`[read]` **Nachweise auf `test-user` führen** — A-34: Läufe auf `dev`
überschreiben Toms gespeicherte Ansicht.

---

## Sieben Entscheidungen warten auf Tom

| | |
|---|---|
| **GO-23** | Deckungsgrenze unter 50 % — Vorschlag: dimmen |
| **G-134** | die vier Filtergruppen gibt es in den Daten nicht |
| **G-136** | Ballaststoffe unter Kohlenhydrate, Wasser unter Sonstige |
| **C-174** | `strong` als dritte Constraint-Stufe (ADR gegen GO-22) |
| **GO-24** | *„Mineralstoffe"* als Gruppenbegriff |
| **A-37** | Coach-Permissions pro Subfunktion (ADR-Abweichung) |
| **T1–T9** | neun Fragen zum Coach-Portal |

---

## Wie Tom arbeitet

`[read]` **Knapp und direktiv.** Er erwartet, dass der Kontext gelesen
ist, bevor gefragt wird.

`[cmd]` **Er will bei irreversiblen Schritten, Produktentscheidungen und
Kosten gefragt werden** — nicht bei Commits, Dateinamen oder
Formulierungen.

`[read]` **Und er merkt sofort, wenn eine Zahl nicht stimmen kann.**
Mehrere der wichtigsten Funde des Tages kamen von ihm: *„Natrium als
Total kleiner als sein Child Chlorid"*, *„das kannst dem Weihnachtsmann
erzählen"*, *„für was haben wir so genaue Daten, wenn sie nicht
gespeichert werden"*.

**Wenn er ungeduldig wird, liegt es meist daran, dass etwas zum zweiten
Mal erklärt werden muss.**
