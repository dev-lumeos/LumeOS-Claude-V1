# Spec-Audit II — Feldabgleich gegen den Bestand (D-05)

**Stand:** 2026-08-07 (Block 18) · **Vorgänger:** `00-INDEX.md` (2026-08-02)
**Verhältnis zum Vorgänger:** Die erste Fassung hat die **Struktur** geprüft
(Ordnerlisten, Indizes, Zählprüfungen, Gerüst-Abgleich) und den Feldabgleich
Entities↔DB↔API ausdrücklich **nicht geleistet** — er steht dort als
Folgearbeit. Genau das ist Gegenstand dieser Datei. Die Strukturbefunde werden
**nicht wiederholt**, sondern nur dort angefasst, wo sie sich geändert haben.

**Methode:** `[cmd]` Spec-Tabellen und -Felder gegen die **laufende Datenbank**
(`information_schema`, `pg_tables`), gegen `docs/ssot/`, `docs/spezifikation/`
und gegen `apps/web/src`. Gezählt wurde mit `grep -c`/`psql`, nicht geschätzt.

**Reichweite — bewusst begrenzt.** `[cmd]` `docs/specs/` trägt **161 Dateien,
48.633 Zeilen** in 13 Modulen. Ein ehrlicher Feldabgleich über alle 13 passt
nicht in einen Durchgang. Deshalb sind **4 Module vollständig** ausgewertet
(Training, Nutrition, Goals, WebPlatform) und **9 nur eingestuft**, wo die
Einstufung ohne Feldabgleich belegbar ist. Was nicht geprüft wurde, steht als
solches markiert. *Eine halbe Auswertung mit klarer Grenze ist brauchbar, eine
vollständige mit geratenen Einstufungen nicht.*

---

## 1. Der wichtigste Befund: ein Fehlermuster, kein Modulproblem

`[cmd]` **14 `FOR ALL`-Policies in vier Modulen, alle mit `USING` und ohne
`WITH CHECK`:**

| Datei | Anzahl |
|---|---|
| `BuddyandAICoach/SPEC_06_DATABASE_SCHEMA.md` | 8 |
| `Marketplace/SPEC_06_DATABASE_SCHEMA.md` | 3 |
| `HumanCoach/SPEC_06_DATABASE_SCHEMA.md` | 2 |
| `Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql` | 1 |

Muster durchgehend:

```sql
CREATE POLICY "ucp_owner" ON buddy.user_coach_profile FOR ALL
  USING (auth.uid()::text = user_id::text);
```

**Warum das zählt:** `FOR ALL` umfasst INSERT, aber `USING` wird beim INSERT
**nicht** ausgewertet — dafür ist `WITH CHECK` da. Eine solche Policy liest sich
wie „nur der Eigentümer", erlaubt aber **jedem Authentifizierten, Zeilen mit
fremder `user_id` einzufügen**. Dazu der `::text`-Cast, der den Index auf einer
UUID-Spalte umgeht.

Das ist dasselbe Muster, das in den Blöcken 11–14 live korrigiert wurde
(Trennung nach Operation, `WITH CHECK` an den Schreibpfaden) — und es steht in
den Specs **als Hausstil**. Wer ein weiteres Modul „nach Spec" baut, baut das
Leck erneut ein.

> **Korrektur einer Annahme aus dem Auftrag:** Training/SPEC_06 wurde als Träger
> dieses Musters genannt. `[cmd]` Das trifft **nicht** zu — Training hat 16
> Policies, alle **operationsgetrennt** (`FOR SELECT …`), **0×** `FOR ALL`. Die
> `::text`-Casts stimmen dort (10 Fundstellen), das Policy-Leck liegt in den vier
> Modulen oben.

**Empfehlung:** Vor jeder weiteren Modul-Umsetzung eine Regel in
`docs/spezifikation/10-plattform/konventionen/` — `FOR ALL` nur mit `WITH CHECK`,
besser gar nicht. Das ist billiger als 14 Einzelkorrekturen und verhindert die
Wiederholung.

---

## 2. Training — TEILWEISE (Referenzdaten erledigt, Trainingsbetrieb offen)

**Was es beschreibt, und was es davon gibt** `[cmd]`:

| | Spec SPEC_06 | live `training.` |
|---|---|---|
| Tabellen | **16** | **4** |

Die 4 gebauten (`muscle_groups`, `equipment`, `exercises`, `exercise_muscles`)
sind genau die **Stammdaten**. Die 12 übrigen sind der **Trainingsbetrieb** und
existieren nirgends sonst:

`exercise_aliases` · `strength_standards` · `routines` · `routine_exercises` ·
`routine_schedule_days` · `workout_sessions` · `workout_exercises` ·
`workout_sets` · `personal_records` · `exercise_progression_configs` ·
`post_workout_feedback` · `volume_landmarks`

**Das ist der eigentliche Wert des Ordners für Training.** Die Stammdaten kamen
aus dem Legacy-Export; der Trainingsbetrieb (Sätze, Sessions, PRs,
Progressionslogik) steht **nur hier**. Ginge der Ordner verloren, wäre dieser
Entwurf weg — die Daten wären es nicht.

**Was dem heutigen Stand widerspricht** `[cmd]`:

1. **Medienspalten.** SPEC_06 Z. 177–181 schreibt fünf Spalten
   (`image_male_start/end`, `image_female_start/end`, `video_url`). Live steht
   **ein** `media_paths JSONB` mit **relativen** Pfaden. Das ist keine
   Geschmacksfrage, sondern das Ergebnis von E-06: fünf Spalten × 1.448 Zeilen
   mit absoluten URLs machten jeden Ortswechsel zur Migration.
   → **Die Spec beschreibt hier den Zustand, der bewusst abgeschafft wurde.**
2. **Overload-Felder.** Spec: `evaluation_score`, `sfr_rating`,
   `mechanical_tension` (Z. 193–196). Bestand: `score_hypertrophy`,
   `score_strength`, `score_sfr` — und `[cmd]` **0 von 1.448** befüllt. Andere
   Namen, andere Anzahl, keine Daten. Wer die Spec-Namen übernimmt, erzeugt eine
   dritte Variante.
3. **Bestandszahlen** (Vorbefund `00-INDEX.md`, bestätigt): „1.200 Übungen",
   „R2 ~15 GB" — `[cmd]` real 1.416 nach Dublettenbereinigung, Medien in Supabase
   Storage. Ist-Behauptungen aus dem Vorgängerrepo, unmarkiert neben dem Zielbild.

**Einstufung: TEILWEISE.**
→ **ÜBERNEHMEN:** die 12 Tabellen des Trainingsbetriebs (als Entwurf, nicht als
Vorlage — Policies und Medienfelder nach heutigem Muster), `SPEC_05` (Taxonomie),
`SPEC_09` (Scoring-Formeln).
→ **VERALTET:** Medienspalten, Overload-Feldnamen, alle Bestandszahlen.

---

## 3. Nutrition — TEILWEISE (reifstes Modul, trägt die offene Lücke)

`[cmd]` **14 Tabellen live** in `nutrition.`, SPEC_06 beschreibt mehr.

**Was NUR hier steht — und produktiv gebraucht wird:**

- **`nutrition.nutrition_targets`** (SPEC_06 §14). `[cmd]` **Nicht live.** Genau
  daran hängt C-05: `hydrationPercent()` in
  `apps/web/src/lib/nutrition/water-model.ts:178` liefert bewusst `null`, weil das
  Tagesziel fehlt. Die Tabelle ist **nirgends sonst definiert**.
  > **Präzisierung gegenüber `TODO.md`:** Dort steht, „Goals trägt
  > `nutrition_targets`". `[cmd]` Das ist ungenau — in den **Goals**-Specs kommt
  > der Name **null Mal** vor; die 10 Goals-Tabellen enthalten ihn nicht. Die
  > Tabelle gehört laut SPEC_06 §37/§14 zu **`nutrition`** und wird „von Goals"
  > nur **befüllt**. Für C-05 heisst das: es wartet auf **eine Nutrition-Tabelle**,
  > nicht auf das Goals-Schema. Das ist der kleinere Schritt.
- **`SPEC_06 §13 water_logs`** — hat die Water-Entscheidungen in Block 14
  getragen.
- **Quick-Add-Werte** (`SPEC_04` Z. 194 ff., Z. 279: 250/500/750/1.000 ml) —
  Produktentscheidungen, aus keinem Code ableitbar.
- **BLS-Rohdaten** (`00_raw/bls/`, XLSX + PDF) — Nährwertquelle, nicht
  rekonstruierbar.

**Was widerspricht:** die `FOR ALL`-Policy in `03_sql/SPEC_06_V1_MIGRATION.sql`
(§1) und `117 vs. 138 Nährstoffe` (Vorbefund, unverändert: `[cmd]` live 138).

**Was die Daten schon korrigiert haben:** Die **100-g-Bezugsgrösse** stand in
keiner Spec und musste aus den Daten erschlossen werden
(`docs/ssot/35-naehrwert-bezugsgroesse.md`, ADR-0003). *Das ist die Gegenprobe
zum Wert des Ordners: er ist unvollständig, nicht nur veraltet.*

**Einstufung: TEILWEISE** (der grösste Übernahmeanteil aller Module).

---

## 4. Goals — ÜBERNEHMEN (nichts davon gebaut, nichts widerlegt)

`[cmd]` **Kein Schema `goals` in der laufenden Datenbank** (0 Treffer). Die 10
spezifizierten Tabellen (`user_goals`, `goal_phases`, `goal_contributions`,
`goal_milestones`, `tdee_settings`, `body_measurements`, `body_circumferences`,
`progress_photos`, `goal_adjustments`, `weekly_reports`) existieren **nur hier**.

Goals ist ausserdem `[cmd]` das **einzige Modul mit echtem
`CONSOLIDATED_KNOWLEDGE.md`** (Vorbefund bestätigt: genau 1 Datei im ganzen Baum,
7 weitere Module verweisen ins Leere).

**Widerspruch:** Vorgängerrepo-Pfade (`apps/app`, `src/api`) statt `apps/web`.
Betrifft die Verortung, nicht den fachlichen Inhalt.

**Einstufung: ÜBERNEHMEN** — mit Pfadkorrektur und Policy-Prüfung vor der
Umsetzung. Da C-06 (Goals) der nächste Modulkandidat ist, ist dies das Modul,
dessen Überführung am ehesten lohnt.

---

## 5. WebPlatform — TEILWEISE

Trägt das UI-Schema und `[cmd]` als einzige Quelle neben Admin „Next.js 14+",
während 10 andere Quellen 15 sagen und `apps/web` real auf 14 läuft
(Vorbefund, unverändert offen). Ebenso Ursprung der `117`-Nährstoff-Literale.

**Wert:** das UI-/Shell-Konzept, das `apps/web` teilweise schon umsetzt.
**Einstufung: TEILWEISE** — Konzept übernehmen, alle Versions- und Zahlangaben
verwerfen.

---

## 6. Nicht feldabgeglichen (9 Module) — nur Einstufungshinweis

Diese Module wurden in diesem Durchgang **nicht** Feld für Feld geprüft. Die
Angabe stützt sich auf `00-INDEX.md` und `[cmd]` den Live-Abgleich der Schemata
(keines davon existiert in der Datenbank).

| Modul | vorläufig | Grund |
|---|---|---|
| Medical | TEILWEISE *(zuerst prüfen)* | `00-INDEX.md`: 10 Entities vs. 8 Tabellen — Bruch bereits nachgewiesen; medizinische Daten brauchen ohnehin Review |
| BuddyandAICoach | TEILWEISE | 8 undichte `FOR ALL`-Policies (§1); Fachinhalt unbewertet |
| HumanCoach | TEILWEISE | 2 undichte Policies; sonst sauberster Standardordner |
| Marketplace | TEILWEISE | 3 undichte Policies; `apps/marketplace` als Bestand deklariert, `[cmd]` existiert nicht |
| Recovery | offen | Score-Formeln auf 3 Orte verteilt, einer existiert nicht |
| Supplements | offen | vom Nutrition-WO-Plan unter falschem Port gerufen |
| Admin | VERALTET *(Verdacht)* | 3 konkurrierende Alt-Specs, „Komplett"-Claims aus dem Vorgängerrepo, Port 4100 ausserhalb des Schemas |
| Core | ÜBERNEHMEN *(klein)* | 3 ADRs, `[cmd]` 280 Zeilen; heimatlos, nirgends eingebunden |
| Dashboard | VERALTET *(Verdacht)* | `[cmd]` 24 Zeilen Checkliste; Doppelquelle zu WebPlatform/SPEC_03 |

---

## 7. Was verloren ginge, wenn der Ordner verschwände

Nicht der Ist-Zustand — der steht in `docs/ssot/` und im Code. Verloren ginge
**das noch nicht Gebaute**:

1. **Der Trainingsbetrieb** — 12 Tabellen, nur hier.
2. **`nutrition_targets`** — blockiert heute sichtbar C-05.
3. **Das gesamte Goals-Modell** — 10 Tabellen, nirgends sonst.
4. **Produktentscheidungen** ohne Code-Entsprechung: Quick-Add-Werte,
   Taxonomien, Scoring-Formeln.
5. **BLS-Rohdaten** — externe Quelle, nicht rekonstruierbar.

Dagegen ist **wertlos bis schädlich**: jede Ist-Behauptung (Bestandszahlen,
„Komplett"-Claims, Gerüst-Annahmen wie `packages/scoring` — `[cmd]` existiert
nicht) und die 14 undichten Policies.

---

## 8. Empfehlung zum Ordner

**Nicht löschen, nicht als Ganzes überführen, sondern modulweise ausschlachten —
und den Rest sichtbar entwerten.**

1. **`docs/specs/` bleibt vorerst**, aber bekommt einen Kopfhinweis: *Altbestand,
   kein Sollwert, Rangfolge Code > ssot > specs.* Ohne diesen Hinweis liest der
   nächste Durchgang die Bestandszahlen wieder als Ist.
2. **Zuerst die Policy-Regel** (§1) in die Konventionen — sie verhindert, dass
   die Überführung das Leck mitnimmt.
3. **Überführungsreihenfolge nach Bedarf**, nicht nach Ordnerreihenfolge:
   **Goals** (nächstes Modul, nichts widerlegt) → **`nutrition_targets`**
   (kleinster Schritt mit sichtbarer Wirkung: C-05) → **Trainingsbetrieb**
   (wenn Training eine Oberfläche bekommt) → **Medical** (dort ist der Bruch
   nachgewiesen).
4. **Erst archivieren, wenn ein Modul überführt ist** — je Modul, nicht pauschal.
   Ein Modul, dessen Inhalt in `docs/spezifikation/` steht, kann nach
   `_archive/` wandern; vorher nicht.
5. **Offen für Tom** (unverändert aus `00-INDEX.md`): Modulkanon 10/11/13 und
   Next.js 14 vs. 15. Beide blockieren die Überführung nicht, sollten aber vor
   einer Spec-*Freigabe* entschieden sein.

**In diesem Block wurde nichts verschoben, gelöscht oder überführt** — der
Auftrag war Feststellung. Die Überführung ist ein eigener Auftrag.
