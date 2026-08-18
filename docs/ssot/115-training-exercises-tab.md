# 115 — Der Exercises-Tab: gemessen, nicht gebaut (G-64)

Stand: 2026-08-18 · Anker: Zweig `dev` · Auftrag G-64
Herkunft: gemessen in dieser Sitzung, gegen die laufende lokale Instanz.
Rangfolge: Code > dieses Dokument > Rest.

> **Der Tab konnte nicht angebunden werden. Zwei Sperren stehen davor,
> beide ausserhalb dieses Auftrags.** Alles andere ist gemessen und
> steht unten — die Anbindung selbst ist danach eine kurze Arbeit.

`[cmd]` **Kein Code geändert.** Der Auftrag verbietet Schemaänderungen,
und beide Sperren sind genau das.

---

## Die zwei Sperren

### 1. `training` ist nicht für PostgREST freigegeben

`[cmd]` Gemessen über HTTP, nicht aus der Konfiguration geschlossen:

```
GET /rest/v1/exercises  (Accept-Profile: training)
→ HTTP 406
{"code":"PGRST106","message":"Invalid schema: training",
 "hint":"Only the following schemas are exposed: public, graphql_public,
         nutrition, goals, supplements, medical, recovery"}
```

`[read]` `supabase/config.toml:19` führt sieben Schemata — **`training`
ist keines davon.** Zum Vergleich, im selben Lauf: `nutrition.foods`
liefert 7.140 Zeilen, `supplements.supplement_catalog` 44.

**Das ist derselbe Befund wie bei `goals`** (dokumentiert in
`v2/nutrition/page.tsx`): eine Zeile in `config.toml`, die einen
Neustart des lokalen Stacks braucht.

### 2. `training.exercises` hat RLS an und **keine einzige Policy**

`[cmd]` Das ist die schwerere Sperre, weil sie auch nach der Freigabe
bliebe:

| Tabelle | RLS | Policies | als `authenticated` lesbar |
|---|---|---|---|
| `equipment` | an | 1 | **58** |
| `muscle_groups` | an | 1 | **95** |
| `exercise_catalog_enrichment` | an | 4 | **1.407** |
| **`exercises`** | **an** | **0** | **0** ← |
| `exercise_muscles` | an | 1 | 6.588 |

`[cmd]` **Direkt gemessen mit `SET ROLE authenticated`:**
`SELECT count(*) FROM training.exercises` ergibt **0**, während
Geräte, Muskelgruppen und Anreicherung normal antworten. RLS ohne
Policy verweigert alles.

`[cmd]` **Es ist Drift, kein Entwurf.** Die Kette definiert die Policy
sehr wohl — `supabase/_pipeline/10_training/100_training_schema.sql:266`:

```sql
CREATE POLICY exercises_select ON training.exercises
  FOR SELECT TO authenticated USING (is_active OR public.is_admin());
```

`[cmd]` **Und sie würde greifen:** alle 1.416 Übungen haben
`is_active = true`, und `public.is_admin()` existiert. Die Policy ist
in der Datenbank verlorengegangen, nicht in der Kette.

`[read]` **Was zu tun ist** (Codex, nicht dieser Auftrag): `training`
in `config.toml` aufnehmen, Stack neu starten, und
`100_training_schema.sql` ab Zeile 251 erneut anwenden. Danach ist der
Tab in einem Durchgang anbindbar.

---

## Was das Mockup zeigt

`[cmd]` `theme-v1/module-training.jsx:439-505`, `TrainingLibrary`.
`[cmd]` Die Umsetzung in `ansicht.tsx:555` ist **deckungsgleich** — 10
fest verdrahtete Übungen, eine Attrappenmarke.

### Die sechs Spalten

| Spalte | Mockup zeigt | Trägt die Datenbank das? |
|---|---|---|
| **Exercise** | „Bench Press · Barbell" | **Ja** — `exercises.name`, 1.416 |
| **Equipment** | „Barbell" | **Ja** — `equipment.name` über `equipment_id`, 58 Geräte |
| **Muscles** | Pillen: Chest, Triceps, Front Delt | **Ja** — `exercise_muscles`, 6.588 Zuordnungen, mit Rolle |
| **Type** | „Compound" / „Isolation" | **NEIN** — siehe unten |
| **e1RM** | „122.5kg" | **Nur für 6 Übungen** — siehe unten |
| **Best set** | „120kg ×3" | **Nur für 6 Übungen** — siehe unten |

### Die drei Bedienelemente

| Element | Mockup | Daten |
|---|---|---|
| Suchfeld | „Search 1,200 exercises · barbell, dumbbell…" | **Ja**, und schnell — Trigramm-Index vorhanden |
| `All equipment` | vier feste Werte (Barbell, Dumbbell, Cable) | **Ja**, aber 58 statt 3 |
| `All muscles` | **leer** — nur „All muscles", keine Optionen | **Ja**, 7 Wurzeln oder 95 Gruppen |

`[cmd]` **Die Zahl im Tab und im Platzhalter ist falsch:** beide sagen
**1.200**, der Katalog führt **1.416**.

---

## Welche Filterachsen die Daten tragen

### Die Muskelgruppe ist die brauchbarste Achse — aber sie hat einen Haken

`[cmd]` **Es gibt 7 Wurzeln und 88 Kinder**, nicht die zwölf Gruppen
aus dem Auftragstext. Die dort genannten (Glutes, Hamstrings, Calves,
Forearms, Upper Back …) sind **Kindgruppen**, keine Wurzeln.

**Und die Zahl hängt daran, welche Rolle zählt:**

| Wurzelgruppe | nur `primary` | `primary` + `secondary` |
|---|---|---|
| Shoulders | 332 | **697** |
| Arms | 285 | **620** |
| Legs | **489** | 613 |
| Back | 235 | **544** |
| Core | 205 | 314 |
| Chest | 178 | 252 |
| Neck Muscles | 3 | 5 |

`[read]` **Das ist eine Produktentscheidung, keine technische.** „Chest
252" heisst *„die Brust ist irgendwie beteiligt"*, „Chest 178" heisst
*„die Übung trainiert die Brust"*. Das Vorgängerrepo hat sich
entschieden: `api/training/routes/exercises.ts` sortiert *„primary role
first"* — **beides zeigen, primär zuerst.**

`[cmd]` **Die Zahlen im Auftrag entsprechen keiner der beiden
Spalten** (dort: Shoulders 684, Legs 592, Back 542). `[annahme]`
Vermutlich eine dritte Zählweise oder ein älterer Stand; **gemessen
sind die beiden Spalten oben.**

### Das Gerät trägt, ist aber schief verteilt

`[cmd]` 58 Geräte, aber die Hälfte des Katalogs hängt an dreien:

| Gerät | Übungen |
|---|---|
| **None** | **527** (37 %) |
| Dumbbell | 317 |
| Barbell | 162 |
| Bands | 88 |
| Cable Pulley Machine | 49 |
| Yoga Mat | 40 |
| Kettlebells | 26 |
| EZ Bar | 17 |

`[read]` **`None` mit 37 % ist kein Fehler, sondern Körpergewicht** —
und damit die grösste einzelne Gruppe. Ein Filter, der „None" wörtlich
anzeigt, wäre schlechter als einer, der „Bodyweight" sagt; die
Umbenennung ist aber eine Datenfrage, keine Anzeigefrage.

### `body_region` passt auf SPEC_05 — bis auf einen

`[cmd]` Der Auftrag fragt, ob unsere Wurzeln zu den 6 Hauptregionen
passen. **Sie tun es:**

| `body_region` | Gruppen | SPEC_05 `MUSCLE_FILTER_GROUPS` |
|---|---|---|
| legs | 40 | ✓ `legs` |
| arms | 21 | ✓ `arms` |
| back | 10 | ✓ `back` |
| shoulders | 8 | ✓ `shoulders` |
| core | 7 | ✓ `core` |
| chest | 5 | ✓ `chest` |
| **(null)** | **4** | — |

`[cmd]` **Die vier ohne Region sind der Nacken:** `Neck Muscles`
(Wurzel), `Scalenes`, `Sternocleidomastoid`, `splenius capitis`.
`[read]` **SPEC_05 kennt keine Nackenregion** — die sechs Gruppen dort
sind chest, back, shoulders, arms, core, legs. Unsere siebte Wurzel ist
also kein Fehler in den Daten, sondern **eine Gruppe mehr als die
Spezifikation vorsieht**, mit nur 5 Übungen.

**Zu entscheiden:** Nacken als siebte Filtergruppe zeigen, ihn einer
bestehenden Region zuschlagen, oder bei 5 Übungen weglassen.
**Gemeldet, nicht entschieden.**

### Die Suche ist schnell — das ist bereits gemessen

`[cmd]` `EXPLAIN ANALYZE` gegen die laufende Datenbank:

| Abfrage | Laufzeit |
|---|---|
| Namenssuche `ILIKE '%press%'` + Gerät, 50 Zeilen | **0,554 ms** |
| Filter auf Wurzelgruppe „Chest", rekursiv über die Kinder | **0,864 ms** |
| Suche + Gerät + Muskelgruppe kombiniert | **0,506 ms** |

`[cmd]` **Der Index dafür existiert schon:**
`idx_exercises_name_trgm` (GIN, `gin_trgm_ops`), dazu
`idx_exercises_equipment` und `idx_exercise_muscles_muscle`.

`[read]` **Zum Vergleich nennt der Auftrag die Biomarker-Suche mit
130–160 ms über 11.676 Zeilen.** Hier sind es **unter 1 ms über 1.416
Zeilen** — die Suchseite ist nicht das Problem. Was fehlt, ist der
Zugang, nicht die Geschwindigkeit.

`[annahme]` Diese Zahlen sind reine Datenbankzeit ohne PostgREST, Netz
und Rendern. Der Wert im Browser wird höher liegen; **er ist erst nach
der Freigabe messbar.**

---

## Was die Daten nicht hergeben

### `Type` (Compound / Isolation) — es gibt sie nirgends

`[cmd]` **Die Spalte hat keine Quelle:**

| Feld | verschiedene Werte |
|---|---|
| `exercise_type` | **1** — `strength`, auf allen 1.416 |
| `difficulty` | **1** — `intermediate`, auf allen 1.416 |
| `category` | 3 — Free Weights 546, Bodyweight 529, Resistance 341 |
| `categories_canonical` (C-83) | dieselben 3 Werte |

**Compound und Isolation kommen in keiner Spalte vor.** `[read]` Die
Spalte bleibt also entweder leer, oder sie wird aus der Zahl der
Primärmuskeln abgeleitet (≥ 2 = Compound) — **das wäre eine Erfindung
und gehört vorher entschieden.**

`[cmd]` **`category` mit drei Werten ist als Filter zu grob**,
`exercise_type` und `difficulty` mit je einem Wert sind faktisch leer.

### `e1RM` und `Best set` — da, aber nur für 6 von 1.416

`[cmd]` Der Auftrag sagt, die beiden Spalten seien jetzt bedienbar. **Sie
sind es, aber sehr dünn:**

| | |
|---|---|
| Sätze insgesamt | 120 |
| davon mit `estimated_1rm` | **108** |
| **verschiedene Übungen darin** | **6** |

| Übung | e1RM | Sätze |
|---|---|---|
| Band Deadlift | 138,0 kg | 18 |
| Barbell squat back POV | **126,0 kg** | 18 |
| Barbell Bench Press | **99,3 kg** | 18 |
| Barbell bent over row pronated grip | 96,5 kg | 18 |
| Barbell bench press incline | 77,2 kg | 18 |
| band kneeling lat pulldown | 48,5 kg | 18 |

`[read]` **1.410 von 1.416 Zeilen zeigen in beiden Spalten einen
Strich.** Das ist richtig so — die Vorlage tut es bei `Lateral Raise`
auch — aber es heisst: **die beiden Spalten sind kein Grund, den Tab
anzubinden, sondern eine Zugabe.** Die Sitzungen selbst sind
ausdrücklich der nächste Schritt.

### `sort_weight` ist als Sortierung wertlos

`[cmd]` **Auf allen 1.416 Übungen exakt 500** — `min = max = 500`, ein
einziger verschiedener Wert. Ein Index darauf existiert
(`idx_exercises_sort_weight`) und sortiert nichts.

`[read]` `SPEC_05` sieht 0–1000 vor, mit Basis-Score je Kategorie und
Modifikatoren. **Nicht gebaut. Nicht gefüllt** — der Auftrag verbietet
es ausdrücklich, und das ist richtig: die Formel ist eine eigene
Entscheidung.

**Bis dahin sortiert der Tab alphabetisch.** `[read]` Das ist bei 1.416
Übungen schlechter, als es klingt: „3 Leg Chatarunga Pose" und „4
Punches Side Squat" stehen oben, „Barbell Bench Press" weit unten.

---

## Was für die Suche noch fehlt

### Aliase — gemessen, und der Befund ist eindeutig

`[cmd]` Die Namenssuche allein trägt weiter, als man denkt:

| Getippt | Treffer mit `ILIKE` |
|---|---|
| `curl` | 164 |
| `press` | 159 |
| `squat` | 120 |
| `row` | 80 |
| `bench` | 78 |
| `lunge` | 54 |
| `fly` | 47 |
| `deadlift` | 27 |
| `dip` | 16 |
| `pulldown` | 13 |
| **`rdl`** | **1** |
| **`ohp`** | **0** |

`[read]` **Die Lücke sind die Abkürzungen, nicht die Wörter.** Wer
„bench" tippt, findet 78 Übungen; wer „OHP" tippt, findet **nichts**.
Genau dafür ist `036_exercise_aliases.sql` gebaut.

`[cmd]` **Die Spalte `aliases` gibt es hier nicht** — geprüft,
`information_schema` kennt sie in `training.exercises` nicht.

`[cmd]` **Und die Regeln des Vorgängers greifen nur teilweise**, weil
unsere Namen anders lauten:

| Regel aus `036` | Treffer hier |
|---|---|
| `Fly/Flye` | 47 |
| `Pull-up/Chin-up` | 20 |
| `OHP → overhead/military press` | 17 |
| `RDL → romanian deadlift` | 5 |
| `Lat Pulldown` | 4 |
| `Bench → barbell bench press` | 1 |
| `Deadlift → barbell deadlift` | 1 |
| **`Squat → barbell (back) squat`** | **0** ← |

`[cmd]` Die Squat-Regel trifft nichts, weil unsere Übung **„Barbell
squat back POV"** heisst. `[read]` **Das ist der eigentliche Befund:
die Aliasliste ist übertragbar, die Trefferbedingungen nicht.** Wer sie
übernimmt, muss sie gegen unsere Namen neu schreiben — sonst legt er
eine Spalte an, die auf acht Zeilen wirkt.

**Empfehlung: ja, aber als eigener Auftrag mit Messung** — nicht
nebenbei. `[read]` Bei den Lebensmitteln hat genau diese Sorte Alias
von 13 % auf 84 % geführt; die Hebelwirkung ist belegt, der Zuschnitt
hier aber ein anderer.

### Deutsche Namen — sie liegen da, in Klammern

`[cmd]` Die Anreicherung aus C-83 ist **auf allen 1.407 Zeilen
vollständig** (`primary_activating_muscles`,
`secondary_activating_muscles`, `equipment_canonical`) und hat die
Form:

```
Chest (Pectoralis major), Shoulders (Deltoids), Triceps (Triceps brachii)
Glutes (gluteus maximus, gluteus mideus), Hamstrings (Biceps Femoris, …)
```

`[read]` **Alltagsname aussen, Fachname in der Klammer.** Das ist
Fliesstext, kein Feld — wer die Klammern herauslöst, baut einen Parser
über 1.407 Zeilen mit uneinheitlicher Schreibung (`gluteus mideus`
steht so da). **Der Auftrag verbietet es zu Recht als Nebenarbeit:
eigener Punkt mit Tom.**

**Für die Muscles-Spalte ist es auch nicht nötig** —
`exercise_muscles` liefert dieselbe Aussage strukturiert, mit Rolle und
über 6.588 Zeilen.

### Was ausserdem fehlt

| Fehlt | Wirkung | Wer |
|---|---|---|
| **`training` in `config.toml`** | Tab nicht anbindbar | Codex |
| **Policy `exercises_select`** | 0 Zeilen trotz Freigabe | Codex |
| `sort_weight` nach SPEC_05 | alphabetische Sortierung | eigener Auftrag |
| `aliases` mit eigenen Bedingungen | „OHP" findet nichts | eigener Auftrag |
| Compound/Isolation | Spalte `Type` ohne Quelle | Entscheidung |
| Nacken in `body_region` | 7. Wurzel ohne Region | Entscheidung |

---

## Nachweise

`[cmd]` Gemessen am 2026-08-18 gegen die lokale Instanz
(`supabase_db_LumeOS-Claude-V1`, Port 54322) und im Browser:

| Prüfung | Ergebnis |
|---|---|
| **Angemeldet als `dev@lumeos.app`** | `[cmd]` ja — Bildschirmfoto, Konto unten links |
| Katalog | `[cmd]` **1.416** Übungen · 58 Geräte · 95 Muskelgruppen (7 Wurzeln, 88 Kinder) · 6.588 Zuordnungen · 1.407 Anreicherungen |
| PostgREST auf `training` | `[cmd]` **HTTP 406, PGRST106** — nicht freigegeben |
| `exercises` als `authenticated` | `[cmd]` **0 Zeilen** (RLS an, 0 Policies) |
| Nachbartabellen als `authenticated` | `[cmd]` 58 / 95 / 1.407 — **lesen normal** |
| Suchlaufzeit | `[cmd]` **0,506–0,864 ms**, Trigramm-Index vorhanden |
| **Kacheln ohne Marke** | `[cmd]` **0** — der Tab ist unverändert Attrappe, **1 Marke steht** |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — 0 Karten mit Überlauf, kein Seitenüberlauf; bei 375 px scrollt die Tabelle in ihrer Hülle |
| Hell und dunkel | `[cmd]` beide geprüft |

### Bildschirmfotos

| Datei | Inhalt |
|---|---|
| `g64-exercises-ist-1440.png` | der Ist-Zustand neben dem Mockup, hell |
| `g64-exercises-dunkel-1440.png` | derselbe Tab, dunkel |
| `g64-exercises-hell-{1440,1024,768,375}.png` | die vier Breiten |

`[read]` **Der Ist-Zustand ist deckungsgleich mit der Vorlage** — zehn
Zeilen, sechs Spalten, zwei leere Auswahlfelder. Das ist der
Vergleichspunkt für den nächsten Durchgang.

### Was dieser Auftrag NICHT getan hat

- **Kein Code geändert.** `[cmd]` `git status` zeigt aus diesem Auftrag
  nur die fünf Messskripte unter `tools/g64-*`.
- **Kein Schema geändert**, keine Policy angelegt, `config.toml` nicht
  angefasst.
- **`packages/ui` nicht angefasst.** `[read]` Für die Anbindung fehlt
  dort nichts Erkennbares — Tabelle, Pille und Suchfeld sind vorhanden;
  ein Mehrfachfilter (Chips) wäre neu, ist aber mit `Pill` und `v2-btn`
  baubar.
- **Kein `sort_weight` gefüllt**, keine deutschen Namen herausgelöst,
  keine Aliase angelegt.

### Aufräumen

`[cmd]` Fünf Messskripte liegen unter `tools/g64-*` (`.mjs`, `.sql`).
Sie sind **nur lesend** — kein `UPDATE`, kein `INSERT` — und
dokumentieren, wie die Zahlen entstanden sind. Sie gehören vor dem
Commit entfernt.

**Nichts ist committet oder gestaged.**

---

# Fortsetzung 2026-08-18 (G-64): der Tab ist gebaut

**Die zwei Sperren sind weg, und der Tab liest echt.** `[cmd]`
`training` steht in `config.toml`, und `exercises_select` ist
wiederhergestellt — **1.416 Zeilen als `authenticated`**, gegen 0
vorher.

`[read]` **Der Beleg für das Drift-Urteil kam beim Setzen:**
`DROP POLICY IF EXISTS` meldete *„does not exist, skipping"*. Die
Policy war nie in der Datenbank, obwohl die Kette sie führt.

---

## Was echt wurde

`[cmd]` **Ein Tab, 2 Kacheln, 0 Attrappenmarken.** Gezählt im Browser
als `dev@lumeos.app`, je Tab:

| Tab | Karten | Marken |
|---|---|---|
| **Exercises** | 2 | **0** ← |
| Today | 6 | 5 |
| Plan | 3 | 2 |
| History | 8 | 4 |
| Progression | 5 | 4 |
| Volume landmarks | 8 | 7 |
| Standards | 3 | 2 |
| Calendar | 5 | 4 |
| HR zones | 8 | 7 |
| Offline sync | 6 | 5 |

**Die Zahl, nach der der Auftrag fragt: 1 Kachel verliert die Marke**
(vorher 0). `[read]` Die 40 übrigen Marken bleiben — Volumen, Streak,
Herzfrequenz und die Verlaufskacheln brauchen Sitzungen, und die
anzubinden ist ausdrücklich der nächste Schritt.

### Was auf dem Bildschirm steht

`[cmd]` Der Tab zeigt **1.416 / 1.416**, die Tab-Leiste **Exercises
1416** statt der festen 1.200 aus dem Entwurf. Die Spalten:

| Spalte | Quelle |
|---|---|
| Exercise | `exercises.name` |
| Equipment | `equipment.name_de` — **Körpergewicht**, *Hyperextensionsbank*, *Langhantel* |
| Muscles | `exercise_muscles`, auf die Wurzelgruppe zusammengefasst |
| **Discipline** | `exercises.discipline` — **an die Stelle von `Type`** |
| e1RM | `workout_sets.estimated_1rm`, bester Satz |
| Best set | Gewicht × Wiederholungen desselben Satzes |

`[read]` **`name_de` ist der grösste sichtbare Gewinn.** Der rohe
Gerätename für Körpergewichtsübungen lautet `None`; im Tab steht
**Körpergewicht**. Das betrifft 527 Übungen, also 37 % des Katalogs.

### Jeder Filter zählt richtig

`[cmd]` Im Browser gesetzt, gegen SQL gegengeprüft:

| Filter | Anzeige | SQL | |
|---|---|---|---|
| Disziplin `Strength` | 777 | 777 | ✓ |
| Disziplin `Yoga` | 11 | 11 | ✓ |
| Gerätegruppe `free_weights` | 1.056 | 1.056 | ✓ |
| Suche `press` | 159 | 159 | ✓ |
| Muskel `Chest`, primär | 178 | 178 | ✓ |
| Muskel `Chest`, mit sekundär | 252 | 252 | ✓ |
| Muskel `Legs`, mit sekundär | 613 | 613 | ✓ |
| ohne Filter | 1.416 | 1.416 | ✓ |

`[cmd]` **Die Auswahlfelder tragen die Zahlen mit:**

```
All equipment · Freie Gewichte (1056) · Kabel & Bänder (182)
               · Geräte & Bänke (98) · Sonstiges (80)
All disciplines · Strength (777) · Bodyweight (511) · Stretching (108)
                · Yoga (11) · Cardio (9)
All muscles · Shoulders (332) ▸ Deltoids (16), Rotator Cuff (7) · …
```

### Die Suche, im Browser gemessen

`[cmd]` Nicht nur in SQL, wie der Auftrag verlangt:

| Vorgang | Dauer |
|---|---|
| Suche `press` (159 Treffer) | **157 ms** |
| Muskelfilter `Chest` (178) | **142 ms** |
| Erstanzeige ohne Filter | **172 ms** |

`[read]` Das ist die Gesamtzeit inklusive Serveraktion, Netz und
Rendern — die reine Datenbankzeit lag bei **0,5–0,9 ms**. Der
Vergleichswert aus dem Auftrag (Biomarker-Suche, 130–160 ms) ist
damit getroffen.

---

## Primär oder beides — die Rollenentscheidung

**Entschieden: `primary` ist der Vorgabewert, mit einem Schalter für
beides.**

`[cmd]` **Warum es überhaupt eine Frage ist** — der Unterschied ist
kein Rundungsfehler:

| Wurzelgruppe | nur primär | mit sekundär | Faktor |
|---|---|---|---|
| Shoulders | 332 | 697 | 2,1× |
| Arms | 285 | 620 | 2,2× |
| Back | 235 | 544 | 2,3× |
| **Hamstrings** (Ebene 1) | **100** | **384** | **3,8×** |
| Forearms (Ebene 1) | 26 | 219 | 8,4× |
| Legs | 489 | 613 | 1,3× |

**Die Begründung, in dieser Reihenfolge:**

1. `[read]` **Die Frage, die jemand stellt, ist „was trainiert die
   Beinbeuger".** Nicht „wobei sind sie irgendwie beteiligt". Bei
   Hamstrings stehen 100 gegen 384 — die 284 zusätzlichen sind
   Kniebeugen, Ausfallschritte und Kreuzheben-Varianten, bei denen die
   Beinbeuger mitarbeiten. Wer gezielt Beinbeuger trainieren will,
   findet sie in einer Liste von 384 nicht.

2. `[cmd]` **Das Vorgängerrepo hat sich genauso entschieden:**
   `api/training/routes/exercises.ts` sortiert *„primary role first"*.
   Es zeigt beides, aber primär zuerst — dieselbe Rangfolge.

3. `[read]` **Der Schalter kostet nichts und macht die Entscheidung
   sichtbar.** „primary muscle only" steht angehakt neben der
   Trefferzahl; wer ihn löst, sieht sofort 178 → 252 und versteht,
   was er verändert hat. Eine stille Vorgabe hätte dieselbe Wirkung
   ohne die Erklärung.

4. `[cmd]` **Die Zahlen in den Auswahlfeldern wechseln mit.** Mit
   Schalter zeigt die Liste `Shoulders (332)`, ohne ihn
   `Shoulders (697)` — die Auswahl lügt in keinem der beiden Zustände.

`[cmd]` **Sekundärmuskeln bleiben sichtbar**, sobald der Schalter
gelöst ist: sie stehen als blassere Pillen hinter den primären. So
ist die Rolle in der Tabelle ablesbar und nicht nur im Filter.

---

## Was die Daten nicht hergeben

### `Type` ist weg — und das ist die einzige Abweichung vom Entwurf

`[cmd]` **Toms Entscheidung vom 2026-08-18.** Compound/Isolation steht
in keiner Spalte: `exercise_type` hat genau einen Wert (`strength`),
`difficulty` ebenso (`intermediate`), `category` und
`categories_canonical` je drei (Free Weights, Bodyweight,
Resistance).

**An ihrer Stelle steht `Discipline`** — fünf Werte, auf allen 1.416
belegt, null ohne Zuordnung. `[read]` Das Vorgängerrepo filtert
ebenso nach Disziplin.

### `e1RM` und `Best set` decken 6 von 1.416

`[cmd]` Unverändert gegenüber der ersten Messung: 108 Sätze auf sechs
Übungen. **1.410 Zeilen zeigen in beiden Spalten einen Strich.**

`[read]` **Der Auftrag fragt, ob die Spalte so Sinn ergibt. Sie tut
es — aber nicht als Spalte für 1.416 Zeilen.** Die Vorlage zeigt zehn
handverlesene Übungen, von denen sieben ein e1RM haben; im echten
Katalog ist es eine von 236. Die Spalte bleibt, weil sie beim
Filtern auf die trainierten Übungen sofort trägt (`Barbell Bench
Press` → 99,3 kg), aber **die ehrlichere Bauform wäre ein eigener
Bereich „meine Übungen"** — das gehört zum Sitzungs-Schritt, nicht
hierher. **Gemeldet, nicht gebaut.**

### Ein Datenfehler in C-90: die Gerätegruppe ohne Umlaute

`[cmd]` **„Chest Press Machine" trägt `Geraete & Baenke`**, die
übrigen 28 Geräte derselben Gruppe `Geräte & Bänke`. Nach der
deutschen Beschriftung gruppiert ergäbe das **zwei Einträge für
dieselbe Gruppe** — genau das zeigte die erste Fassung.

**Umgangen, nicht repariert:** gruppiert wird über
`equipment_group` (den stabilen Schlüssel), und als Beschriftung
gewinnt die Variante mit Umlauten. `[read]` **Die Daten gehören
trotzdem korrigiert** — es ist die fünfte Fundstelle derselben
Encoding-Klasse (`32-encoding-schaeden.md`). **Gemeldet an Codex.**

### Vier Muskelgruppen ohne `body_region`

`[cmd]` Unverändert: `Neck Muscles` (Wurzel), `Scalenes`,
`Sternocleidomastoid`, `splenius capitis`. `[read]` SPEC_05 kennt
keine Nackenregion. **Der Filter zeigt die Gruppe trotzdem** — mit 3
primären Übungen steht sie als letzte in der Liste und stört nicht.

---

## Was für die Suche noch fehlt

`[read]` Unverändert gegenüber der ersten Messung, hier nur die
Kurzfassung:

| Fehlt | Wirkung |
|---|---|
| **Aliase** | `[cmd]` `ohp` findet **0**, `rdl` findet **1** — `bench` dagegen 78, `squat` 120. Die Lücke sind Abkürzungen, nicht Wörter. Die Regeln aus `036` sind übertragbar, **ihre Bedingungen nicht** (`Squat → barbell back squat` trifft hier 0). |
| **`sort_weight`** | `[cmd]` Auf allen 1.416 gleich 500. Sortiert wird alphabetisch — „3 Leg Chatarunga Pose" steht oben, „Barbell Bench Press" weit unten. |
| **Deutsche Muskelnamen** | `[cmd]` Stecken als Fliesstext in den Klammern der Anreicherung (1.407 Zeilen). Die Gerätenamen sind seit C-90 deutsch, **die Muskelnamen nicht** — der Tab zeigt „Shoulders", nicht „Schultern". |

`[cmd]` **Keines davon angefasst**, wie der Auftrag verlangt.

---

## Zwei Fehler, die beim Bauen auffielen

`[read]` **Beide waren still** — sie zeigten eine falsche Zahl statt
zu brechen. Sie stehen deshalb als Prüfung im Code.

### 1. PostgREST liefert höchstens 1.000 Zeilen

`[cmd]` Die erste Fassung zählte die Gerätegruppen im Speicher und
zeigte **„Freie Gewichte (822)"** statt 1.056 — sie hatte nur die
ersten 1.000 der 1.416 Übungen gesehen. Dasselbe traf die
Disziplinen (551 statt 777) und den Muskelbaum (6.588 Zuordnungen).

**Behoben:** Zählungen laufen als `count`-Abfrage in der Datenbank,
der Muskelbaum wird seitenweise geholt.

### 2. `.in()` kippt über rund 200 IDs — und schweigt dabei

`[cmd]` **Gemessen:** 200 IDs gehen durch, **252 nicht** — PostgREST
antwortet `URI too long`. **Die Bibliothek reicht das als leere Liste
weiter, nicht als Fehler.**

`[read]` Aufgefallen ist es, weil „Chest, mit sekundär" (252 Treffer)
**null Zeilen** zeigte, während die Auswahlliste korrekt 252 anzeigte.
Ohne diesen Widerspruch wäre es durchgegangen.

**Behoben:** Der Muskelfilter geht als Verbund (`exercise_muscles!inner`)
statt als ID-Liste, und **ein Abfragefehler wirft jetzt**, statt als
leeres Ergebnis durchzugehen.

---

## Nachweise der Fortsetzung

`[cmd]` Am Bildschirm geprüft, 2026-08-18:

| Prüfung | Ergebnis |
|---|---|
| **Angemeldet als `dev@lumeos.app`** | `[cmd]` ja — Bildschirmfoto, Konto unten links |
| Katalog im Tab | `[cmd]` **1.416 / 1.416**, Tab-Leiste „Exercises 1416" |
| **Kacheln ohne Marke** | `[cmd]` **1** (vorher 0) — der Exercises-Tab, 2 Karten, 0 Marken |
| Filter gegen SQL | `[cmd]` **8 von 8 richtig** (Tabelle oben) |
| Suche im Browser | `[cmd]` **142–172 ms** |
| **Zeilenschutz** | `[cmd]` als `test-user@lumeos.local`: Katalog **1.416 sichtbar** (öffentlich für Angemeldete), aber **„Barbell Bench Press · e1RM — · best —"**, während `dev@lumeos.app` **99,3 kg · 80 kg × 8** sieht. **Dieselbe Zeile, zwei Konten.** |
| Konsolenfehler | `[cmd]` **0** |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — 0 Karten mit Überlauf, kein Seitenüberlauf; bei 375 px scrollt die Tabelle in ihrer Hülle |
| Hell und dunkel | `[cmd]` beide geprüft |

### Die Tests

`[cmd]` **Sechs neue Prüfungen** in
`src/lib/training/__tests__/uebungen-read.test.ts` — die beiden
Fehler oben als Regel. **Alle drei Richtungen gegengeprobt:**

- `Math.ceil` statt `Math.floor(n/1000)+1` → **rot** (der 1.000er-Grenzfall)
- `SEITE_GROESSE = 500` → **rot** (3 von 6)
- `GRENZE_IN_IDS = 300` → **rot** (die gemessene Grenze liegt darunter)
- vorher und nachher je **6 grün, 0 rot**

### Bildschirmfotos

| Datei | Inhalt |
|---|---|
| `g64b-exercises-hell-1440.png` | der gebaute Tab, hell |
| `g64b-exercises-dunkel-{1440,1024,768,375}.png` | dunkel, vier Breiten |
| `g64b-zeilenschutz-testuser.png` | derselbe Tab als `test-user`, e1RM leer |
| `g64-exercises-ist-1440.png` | **der Zustand davor** — zehn erfundene Zeilen |

### Was diese Fortsetzung NICHT getan hat

- **`packages/ui` nicht angefasst.** `[read]` Es fehlte nichts:
  Tabelle, Pille, Suchfeld und `v2-btn` tragen den Tab. Die
  `optgroup`-Struktur der Muskelauswahl ist einfaches HTML.
- **Kein Schema geändert**, keine Sitzungen oder Sätze angebunden,
  keine Aliase, keine deutschen Muskelnamen, kein `sort_weight`.
- **Der Entwurf bleibt als Rückfall stehen:** ohne Katalog rendert
  weiterhin `TrainingLibrary` mit seiner Marke.

### Geänderte Dateien

| Datei | Was |
|---|---|
| `lib/training/uebungen-read.ts` | **neu** — Katalog, Filterachsen, Muskelbaum, e1RM |
| `v2/training/tab-uebungen.tsx` | **neu** — der Tab |
| `v2/training/uebungen-aktion.ts` | **neu** — Serveraktion für Suche und Filter |
| `lib/training/__tests__/uebungen-read.test.ts` | **neu** — sechs Prüfungen |
| `v2/training/page.tsx` | liest jetzt, vier getrennte `try` |
| `v2/training/ansicht.tsx` | Weiche auf den neuen Tab, Zähler aus dem Katalog |

`[cmd]` Messskripte unter `tools/g64-*` und `tools/g64b-*` — **nur
lesend**, gehören vor dem Commit entfernt.

**Nichts ist committet oder gestaged.**
