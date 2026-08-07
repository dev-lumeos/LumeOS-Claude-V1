# Legacy-Cloud-Instanz LumeOS-V2 — Ist-Zustand

**Stand:** 2026-08-07 (erste Fassung, aus E-01/E-02/E-03)
**Rang:** Ist-Zustand, `[cmd]` gemessen. Rangfolge gilt: Code > ssot > Rest.
**Erhebungsweg:** nur lesende Rolle, `default_transaction_read_only = on`.
Alle Zahlen unten stammen aus **echten `count(*)`**, nicht aus
`pg_class.reltuples` — die frühere Schätzung zeigte bei rund 25 Tabellen
`-1` („nie analysiert"), was als „leer" missverstanden werden konnte.

**Diese Datei ersetzt alle früheren Schätzungen zur Legacy-Instanz.**

---

## 1. Instanz

| Posten | Wert | Marker |
|---|---|---|
| PostgreSQL | 17.6 (aarch64-linux, gcc 15.2.0) | `[cmd]` 2026-08-07 |
| Extensions | `pg_stat_statements` 1.11, `pg_trgm` 1.6, `pgcrypto` 1.3, `plpgsql` 1.0, `supabase_vault` 0.3.1, `uuid-ossp` 1.1, `vector` 0.8.0 | `[cmd]` 2026-08-07 |
| Schemas mit Tabellen | `public` 166, `auth` 23, `storage` 8, `realtime` 3, `supabase_migrations` 1, `vault` 1 | `[cmd]` 2026-08-07 |
| Policies in `public` | **101**, verteilt auf 67 Tabellen | `[cmd]` 2026-08-07 |
| Nutzer in `auth.users` | **7** | `[cmd]` 2026-08-07 |

`[cmd]` Die sieben Konten: `dev@lumeos.app` (angelegt 2026-03-17) sowie
sechs Demokonten vom 2026-03-19 (`lisa@`, `mike@`, `sarah@demo.com`,
`sarah@example.com`, `max@`, `tom@example.com`).

---

## 2. Der wichtigste Befund: 132 von 166 Tabellen sind leer

`[cmd]` 2026-08-07, echtes `count(*)` über alle 166 Tabellen in `public`:
**34 Tabellen tragen Daten, 132 sind leer.**

Die Instanz ist damit kein gefülltes Produktivsystem, sondern ein
Schemagerüst mit wenigen befüllten Inseln. Das ändert die Bewertung von
Sektion E: „166 Tabellen" klang nach viel Bestand — der Bestand steckt in
weniger als einem Viertel davon.

**Die befüllten Tabellen, absteigend:**

| Tabelle | Zeilen |
|---|---|
| `foods` | 7.140 |
| `exercise_muscles` | 6.398 |
| `exercises` | 1.448 |
| `workout_sets` | 822 |
| `meal_items` | 794 |
| `meals` | 286 |
| `workout_exercises` | 245 |
| `muscle_groups` | 157 |
| `water_logs` | 154 |
| `tier_permissions` | 126 |
| `body_measurements` | 88 |
| `workout_sessions` | 64 |
| `equipment` | 61 |
| `supplement_categories` | 11 |
| `body_circumferences` | 10 |
| übrige 19 befüllte | je < 10 |

`[cmd]` Die Nutzerdaten (`workout_*`, `meals`, `meal_items`, `water_logs`,
`body_*`) stammen aus den sechs Demokonten und sind für eine Übernahme
ohne Wert. Der Wert liegt in `exercises`, `exercise_muscles`,
`muscle_groups`, `equipment` — und in `foods`, das jedoch `[cmd]` lokal
bereits vollständig vorliegt (7.140 Zeilen, identische Zahl).

---

## 3. Storage

| Posten | Wert | Marker |
|---|---|---|
| Buckets | genau einer: `exercises`, `public = true` | `[cmd]` 2026-08-07 |
| Objekte | **10.776** | `[cmd]` 2026-08-07 |
| davon Präfix `videos/` | 2.350 | `[cmd]` 2026-08-07 |
| davon Präfix `images/` | 4.629 | `[cmd]` 2026-08-07 |
| **ohne diese Präfixe** | **3.797** | `[cmd]` 2026-08-07 |

`[cmd]` Die 3.797 Objekte ohne Präfix liegen direkt unter dem
Muskelgruppen-Ordner (Beispiel: `Biceps/Dumbbell Lying Supine Curl1.jpeg`).
Sie werden von keiner Zeile referenziert — siehe Abschnitt 5.

---

## 4. Die vier Übernahmekandidaten und ihre Abhängigkeiten (E-03)

`exercises` (1.448) · `exercise_muscles` (6.398) · `muscle_groups` (157) ·
`equipment` (61)

**`[cmd]` Ergebnis der Abhängigkeitsprüfung: keine.**

| Geprüft | Ergebnis |
|---|---|
| Fremdschlüssel **von** den Kandidaten weg | **keine** |
| Fremdschlüssel **auf** die Kandidaten | **keine** |
| Trigger auf den Kandidaten | **keine** |
| Sichten, die sie lesen | **keine** |
| Funktionen, die sie nennen | **keine** |
| Policies auf den Kandidaten | **keine** |

**Das ist ein doppelter Befund.** Erstens: Ein Verschieben (E-04) oder
Export bricht nichts — es gibt nichts, was daran hängt. Zweitens, und
wichtiger: Die Verknüpfungen existieren **nur als Konvention, nicht als
Constraint**. `exercises.equipment_id` ist gefüllt (1.448 von 1.448), aber
**ohne Fremdschlüssel**; `exercise_muscles` verweist auf `exercises` und
`muscle_groups`, ebenfalls ohne.

`[cmd]` Gegenprobe am Export, lokal nachgerechnet: **0 Waisen** in allen
drei Beziehungen. Die Daten sind also stimmig — aber nichts in der
Datenbank hätte verhindert, dass sie es nicht sind.

---

## 5. Medienverweise (E-02) — die alte Messung war ein Messfehler

`exercises` trägt fünf Medienspalten. `[cmd]` Befüllung 2026-08-07:

| Spalte | befüllt | von 1.448 |
|---|---|---|
| `image_male_start` | 1.370 | 95 % |
| `image_male_end` | 737 | 51 % |
| `image_female_start` | 186 | 13 % |
| `image_female_end` | 186 | 13 % |
| `video_url` | 1.274 | 88 % |
| ganz ohne Medien | 39 | 2,7 % |

**E-07 bestätigt:** `[cmd]` genau **186** Übungen haben eine weibliche
Darstellung — die Zahl im TODO stimmt.

### Die toten Verweise sind fast alle keine

`[read]` Frühere Messung: 27/27/9/9/28 tote Verweise, mit dem Verdacht
`[annahme]` eines Kodierungsproblems. **Der Verdacht war richtig** — und
die Ursache liegt genauer, als bisher angenommen.

`[cmd]` 2026-08-07: In den URLs kommen **genau drei** Prozentsequenzen vor —
`%20` (13.514×), `%28` (99×), `%29` (99×). Also Leerzeichen **und
Klammern**.

| Normalisierung | tote Verweise |
|---|---|
| ohne | 27 / 27 / 9 / 9 / 28 |
| nur `%20` dekodiert | 27 / 27 / 9 / 9 / 28 (**unverändert**) |
| `%20` + `%28` + `%29` dekodiert | **0 / 0 / 0 / 0 / 1** |

Wer nur Leerzeichen dekodiert, misst denselben Wert wie ohne
Normalisierung — deshalb hielt sich die Zahl. **Es bleibt genau ein
wirklich toter Verweis:**
`videos/Biceps/Alternate hammer curl seated dumbbells.mp4`.

**Kein Datenverlust.** Die 27/27/9/9/28 gehören nicht als Befund in die
Übernahmeplanung.

### Absolute URLs — der Grund für E-06

`[cmd]` **Alle** Medienwerte sind vollständige URLs, kein einziger ein
relativer Pfad (Videos 1.274 absolut / 0 relativ; Bilder 1.370 / 0).
Muster:
`https://<ref>.supabase.co/storage/v1/object/public/exercises/videos/<Kategorie>/<datei>.mp4`

Die Projekt-Referenz steckt damit in jeder Zeile. Ein Wechsel des
Speicherorts (ADR-0004) müsste 1.448 Zeilen × bis zu 5 Spalten
umschreiben. **Das ist der gemessene Preis, auf den sich E-06 bezieht** —
und der Grund, E-06 **vor** die Ortsentscheidung zu ziehen.

### Gegenrichtung: zwei Drittel des Bestands sind unreferenziert

`[cmd]` 2026-08-07, nach vollständiger Normalisierung:

| Posten | Wert |
|---|---|
| Objekte im Bucket | 10.776 |
| davon von einer Zeile referenziert | **3.553** |
| **verwaist** | **7.223 (67 %)** |

Die 15 GB sind also nicht durchweg gebrauchter Bestand. `[annahme]` Die
3.797 präfixlosen Objekte (Abschnitt 3) dürften den Kern der Verwaisung
ausmachen — vermutlich ein früherer Uploadstand mit anderer Pfadstruktur.
**Vor einem Transfer lohnt zu prüfen, ob 7.223 Objekte überhaupt
mitgenommen werden müssen.** Bei 15 GB Gesamtbestand ist das die Frage,
die den Transferaufwand halbiert oder drittelt.

---

## 6. Schemakonflikt: dieselbe Tatsache in zwei Formen

`exercises.primary_muscles` ist ein `text[]` **und** `exercise_muscles` ist
eine Zuordnungstabelle. `[cmd]` 2026-08-07 vermessen, in der Cloud und am
Export lokal nachgerechnet — beide Wege liefern dieselben Zahlen:

| Posten | Wert |
|---|---|
| Paare (Übung, Muskel) im Array | 3.139 |
| Paare in der Zuordnungstabelle (`role='primary'`) | 2.972 |
| **in beiden gleich** | **2.972** |
| **nur im Array** | **166** |
| **nur in der Zuordnung** | **0** |

**Der Konflikt ist einseitig, nicht widersprüchlich.** Das Array ist eine
**echte Obermenge**: alles, was die Zuordnungstabelle kennt, steht auch im
Array — aber 166 Paare stehen nur im Array. Es gibt **keinen** Fall, in
dem beide Quellen einander widersprechen.

Für den Neuentwurf heisst das: Die Zuordnungstabelle ist die ärmere, aber
mit dem Array verträgliche Quelle. Wer nur sie übernimmt, verliert 166
Zuordnungen; wer das Array übernimmt, verliert nichts — muss aber die
Muskelnamen gegen `muscle_groups` auflösen.

`[cmd]` `exercise_muscles.role`: 2.972 `primary`, 3.426 `secondary`.

---

## 7. Datenqualität der Kandidaten

`[cmd]` Am Export gemessen, 2026-08-07:

- **`name_de` und `name_th` sind in ALLEN vier Tabellen durchgehend
  `NULL`** (0 von 1.448 / 157 / 61). Die Lokalisierungsspalten existieren,
  wurden aber nie befüllt. Die Sorge um Umlaute und thailändische Schrift
  beim Export war damit gegenstandslos — es gibt keine.
- **63 von 157 Muskelgruppennamen tragen eine überzählige schliessende
  Klammer** (`Extensor Carpi Radialis Longus)`, `Triceps)`). Ein
  Importartefakt, das beim Neuentwurf zu bereinigen ist.
- `muscle_groups.body_region`: 65 von 157 stehen auf `other` — die
  Regionszuordnung ist zu 41 % unbrauchbar.
- `equipment.category`: **alle 61** stehen auf `general` — die Spalte
  trägt keine Information.
- In `exercises` sind **leer**: `description`, `score_hypertrophy`,
  `score_strength`, `score_sfr`, `common_mistakes`, `aliases` (je 0 von
  1.448).
- **Vollständig befüllt und damit der eigentliche Wert:** `instructions`
  (1.448), `tips` (1.444), `category`, `equipment`, `exercise_type`,
  `tracking_type`, `difficulty` (je 1.448).

---

## 8. Was daraus folgt

1. **E-04 ist ungefährlich, aber auch weniger nötig als gedacht.** Es
   hängt `[cmd]` nichts an den vier Tabellen — ein Verschieben nach
   `legacy` bricht nichts. Da 132 von 166 Tabellen ohnehin leer sind, ist
   der Aufräumgewinn aber kleiner als die Zahl 166 vermuten liess.
2. **E-06 vor ADR-0004.** `[cmd]` Alle Medienpfade sind absolut. Solange
   das so ist, ist jeder Ortswechsel eine Migration über 1.448 Zeilen;
   danach ist er eine Konfigurationszeile.
3. **Vor einem Medientransfer die Verwaisung klären.** `[cmd]` 7.223 von
   10.776 Objekten sind unreferenziert.
4. **Die alten 27/27/9/9/28 sind erledigt.** `[cmd]` Nach korrekter
   Dekodierung bleibt **ein** toter Verweis.
5. **Beim Neuentwurf des Trainingsschemas:** Array als Quelle nehmen
   (Obermenge), Klammern in `muscle_groups.name` bereinigen,
   `equipment.category` und die Lokalisierungsspalten neu denken statt
   übernehmen.

---

## 9. Was hier NICHT steht

- **Kein Zugangsdatum, kein Passwort, keine Verbindungszeichenfolge.** Der
  Zugang läuft über eine nur lesende Rolle; die Daten stehen in einer
  Umgebungsvariablen der Nutzerkonfiguration, nicht im Repo.
- `[cmd]` Schreibschutz belegt: `default_transaction_read_only = on`.
- **E-04 wurde nicht ausgeführt** und ist mit diesem Zugang technisch
  unmöglich.
