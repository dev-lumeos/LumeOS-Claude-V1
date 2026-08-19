# Training: Sitzungen, Saetze und die Kraftwerte (G-69)

**Stand:** 2026-08-18 · **Auftrag:** G-69 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

Vorgeschichte: `docs/ssot/115-training-exercises-tab.md` (G-64, der
Exercises-Tab und die zwei Sperren).

---

## Kurzfassung

`[cmd]` **Die zwei Sperren aus G-64 sind weg.** `training` steht in
`config.toml`, und `training.exercises` hat wieder eine Policy — beides
gemessen, bevor irgendetwas gebaut wurde.

`[cmd]` **Fuenf Tabs zeigen echte Sitzungen.** Von 40 Marken rendern
noch **24**; fuenf Tabs zeigen keine einzige mehr.

`[cmd]` **Die Datenlage hat sich waehrend des Auftrags geaendert** —
C-78 lief mit. Die Zahlen des Auftragstexts (9 Sitzungen · 18 Uebungen ·
60 Saetze) galten beim Start; **gemessen sind jetzt 30 · 60 · 200.**
Der Auftrag hat davor gewarnt, und die Warnung war berechtigt.

| | |
|---|---|
| Marken vorher / nachher `[cmd]` | 40 / **24** (im Browser je Tab gezaehlt) |
| Tabs ohne jede Marke `[cmd]` | **5** — History · Exercises · Progression · Standards · Calendar |
| Sitzungen / Uebungen / Saetze `[cmd]` | **30 / 60 / 200** — davon 15 / 30 / 100 absolviert |
| Konsolenfehler `[cmd]` | **0** |
| `pnpm gate` `[cmd]` | 8 von 8 gruen · `v2-attrappen.test.ts` 75/75 · `auswertung.test.ts` 9/9 |

---

## 1. Welche Kachel welche Tabelle bekommt

`[cmd]` Je Kachel, gegen die laufende Instanz geprueft.

### Angebunden

| Tab | Kachel | Tabelle / Quelle |
|---|---|---|
| **History** | Volumen je Sitzung (Kurve) | `workout_sessions.total_volume_kg` |
| **History** | Kennzahlen darunter | `workout_sessions` + `workout_sets` |
| **History** | Sitzungsliste | `workout_sessions` |
| **History** | Volumen je Muskelgruppe | `workout_exercises` × `exercise_muscles` × `muscle_groups` |
| **Progression** | e1RM-Kurve je Uebung | `workout_exercises.best_estimated_1rm` |
| **Progression** | Uebungsauswahl mit Verlauf | dieselbe, gruppiert nach `exercise_id` |
| **Standards** | Kraft je Koerpergewicht | `best_estimated_1rm` ÷ `goals.body_measurements.weight_kg` |
| **Standards** | Kennzahlen | `workout_sessions`, `workout_sets` |
| **Calendar** | Monatsraster | `workout_sessions.session_date` |
| **Calendar** | Sitzungen im Monat | dieselbe |
| **Today** | Saetze je Muskelgruppe | wie History, ohne Zielband |
| **Today** | Serie | `workout_sessions`, nach Kalenderwochen |

`[cmd]` **Sieben Tabellenzugriffe, alle ueber Verbund statt ID-Liste**
(Abschnitt 5).

### Nicht angebunden, mit Grund

| Tab / Kachel | Warum sie Attrappe bleibt |
|---|---|
| **Volume landmarks** | `[read]` Der Auftrag: *„MEV, MAV, MRV sind Schwellen aus der Literatur — wenn keine Quelle im Repo liegt, bleibt die Kachel Attrappe."* `[cmd]` Es liegt keine: die drei Begriffe kommen nur in den Vorlagendateien vor (`module-training-spec.jsx`, `module-buddy-knowledge.jsx`), in keiner Tabelle und keiner Kettendatei. |
| **HR zones** (7 Marken) | `[cmd]` Es gibt keine Herzfrequenzdaten — weder Spalte noch Tabelle. |
| **Offline sync** (5 Marken) | `[cmd]` Beschreibt einen Synchronisationszustand, den es nicht gibt. |
| **Plan** (2 Marken) | `[cmd]` Wochenplan mit Coach-Vorgaben; `workout_sessions` fuehrt keine Planvorlagen, nur Termine. |
| **Today**: Training readiness | `[cmd]` Wiegt Recovery, Schlaf, Muskelkater, Ernaehrung, Stimmung. Keine dieser Zahlen liegt verknuepft vor. |
| **Today**: This week / laufende Sitzung | `[cmd]` Am 2026-08-18 gibt es keine Sitzung. `[read]` Tom zu G-69: *„Ein Tab, der dauerhaft leer ist, sagt weniger als eine Attrappenmarke — die wenigstens erklaert, warum."* |
| **Today**: Zielband der Volumenkachel | `[cmd]` Die Vorlage zeigt „14 / 16 Saetze" gegen einen Sollwert je Muskel. **Dieselbe Klasse wie MEV/MAV/MRV** — die Saetze sind echt, das Soll waere erfunden. Die Kachel zeigt deshalb Saetze **ohne** Zielband und sagt das. |

---

## 2. Was echt wurde — mit Zahl

`[cmd]` Im Browser je Tab gezaehlt, angemeldet als `dev@lumeos.app`:

| Tab | Marken vorher | nachher |
|---|---|---|
| Today | 5 | **3** |
| Plan | 2 | 2 |
| History | 4 | **0** |
| Exercises | 0 (G-64) | 0 |
| Progression | 4 | **0** |
| Volume landmarks | 7 | 7 |
| Standards | 3 | **0** |
| Calendar | 3 | **0** |
| HR zones | 7 | 7 |
| Offline sync | 5 | 5 |
| **Summe** | **40** | **24** |

### Was im Browser steht

`[cmd]` Gemessen am 2026-08-18:

| Kachel | Wert |
|---|---|
| History-Kopf | **15 absolviert · 100 Saetze · 54,7 t gesamt** |
| Je Sitzung | 3,6 t · 750 Wiederholungen · 75 min im Schnitt |
| Volumen je Muskel | Back 45 Saetze / 27,4 t · Legs 30 / 22,7 t · Chest 30 / 16,5 t |
| Progression | **6 Uebungen mit Verlauf**, je 5 absolvierte Sitzungen |
| Bestwerte | Band Deadlift **138,0** · Squat **126,0** · Bench **99,3** kg |
| Standards | Bench 1,18× KG · Row 1,14× · Incline 0,92× · Pulldown 0,58× |
| Serie | **0 Wochen laufend, laengste 13** |

`[cmd]` **Squat 126,0 und Bench 99,3 bestaetigen die Zahlen des
Auftrags.** Der hoechste Wert ist allerdings **Band Deadlift mit
138,0 kg** — im Auftragstext nicht genannt.

### Die vier neuen Dateien

| Datei | Zeilen | Inhalt |
|---|---|---|
| `lib/training/sitzungen-read.ts` | 327 | Lesepfad: Sitzungen, Uebungen, Saetze, Muskeln, Gewicht |
| `lib/training/auswertung.ts` | 295 | Die Rechnungen — ohne Datenbank, ohne React |
| `v2/training/tab-verlauf.tsx` | 629 | History, Progression, Standards, Serie, Kalender |
| `lib/training/__tests__/auswertung.test.ts` | 198 | Neun Pruefungen der Rechnungen |

---

## 3. Was die Daten nicht hergeben

### 3.1 `status` trennt geplant und absolviert NICHT — der wichtigste Befund

`[read]` Tom zu G-69: *„Prüf, ob die Datenbank das traegt:
`workout_sessions` hat Spalten, die ich nicht gelesen habe — wenn es
einen Status gibt, nimm ihn; wenn nicht, melde es."*

`[cmd]` **Es gibt einen, und er traegt es nicht.** Die Pruefbedingung
erlaubt vier Werte:

```sql
CHECK (status = ANY (ARRAY['planned','active','completed','cancelled']))
```

`[cmd]` **Aber alle 30 Sitzungen stehen auf `completed`** — auch die
**15, die nach dem 2026-08-18 liegen**, bis 2026-11-12. Eine Sitzung am
12. November kann nicht abgeschlossen sein.

**Genommen ist deshalb das Datum**, das einzige belastbare Merkmal.
`[read]` Der `status` kommt trotzdem im Lesepfad mit: wer beide
vergleicht, sieht die Abweichung. Sie zu verschweigen waere die
schlechtere Loesung.

`[annahme]` Vermutlich setzt der Seedlauf (C-78) alle Zeilen pauschal
auf `completed`, statt kuenftige Termine als `planned` anzulegen. Das
ist eine Datenfrage, keine Anzeigefrage — **gemeldet, nicht repariert**,
weil dieser Auftrag kein Schema und keine Seeds aendert.

### 3.2 Volume landmarks: keine Quelle im Repo

`[cmd]` `MEV`, `MAV` und `MRV` kommen ausschliesslich in
Vorlagendateien vor — `module-training-spec.jsx:173-188`,
`module-buddy-knowledge.jsx:23` („population defaults are a starting
point, not a prescription"), `module-coach-portal-workflows.jsx:47`.
**Keine Tabelle, keine Kettendatei, keine Referenzliste.**

Die Kachel bleibt Attrappe, wie der Auftrag verlangt. **Und dieselbe
Regel greift zweimal weiter:**

- **Das Zielband der Volumenkachel** im Today-Tab (Abschnitt 1).
- **Die Einstufung in den Standards.** `[cmd]` Die Vorlage vergibt
  `Beginner`, `Novice`, `Intermediate`, `Elite` gegen Schwellen, die
  sie selbst mitbringt (`tabs-spec.tsx:440`). `[read]` Das waere eine
  Bewertung eines Menschen ohne belegte Grundlage — **gezeigt wird das
  Verhaeltnis, nicht die Klasse.** Ein Test haelt die vier Woerter aus
  der angebundenen Datei heraus.

### 3.3 Weitere Luecken

| Was fehlt | Folge |
|---|---|
| `rir` | `[cmd]` **0 von 200 Saetzen** gefuellt. Abschnitt 4. |
| `rest_seconds` | `[cmd]` **0 von 200.** |
| `duration_seconds`, `distance_meters` | `[cmd]` **0 von 200** — Ausdauer- und Zeituebungen kommen im Bestand nicht vor. |
| `is_pr` | `[cmd]` **0 von 200 wahr.** Die Kachel „PR" der Vorlage haette nichts zu zeigen; die Kennzahl steht bei 0 statt zu fehlen. |
| Herzfrequenz | `[cmd]` Keine Spalte, keine Tabelle. |
| Plandaten | `[cmd]` `planned_sets`, `planned_reps`, `planned_weight_kg` existieren in `workout_exercises` — sind aber leer. |

### 3.4 `estimated_1rm` fehlt bei 20 Saetzen — und das ist richtig so

`[cmd]` 180 von 200 Saetzen tragen ein `estimated_1rm`. **Die fehlenden
20 sind genau die Aufwaermsaetze** (`set_type = 'warmup'`). Ein
Aufwaermsatz sagt ueber die Maximalkraft nichts. **Keine Luecke,
sondern eine korrekte Auslassung** — im Bericht, damit die Zahl nicht
beim naechsten Mal als Fehler gilt.

---

## 4. Was die Daten hergeben und das Mockup nicht zeigt

`[read]` Der Auftrag nennt vier Felder ausdruecklich. **Alle vier sind
gefuellt und werden nirgends angezeigt.**

| Feld | Bestand | Was es zeigen wuerde | Status |
|---|---|---|---|
| **`rpe`** | `[cmd]` **200 von 200** gefuellt, Werte 6,5–8,0 | Die Anstrengung je Satz — das gaebe der Kurve „Volumen je Sitzung" eine zweite Achse: gleiches Volumen bei sinkendem RPE ist Fortschritt, bei steigendem nicht. **Der aussagekraeftigste ungenutzte Wert.** | **melden** |
| **`logged_via`** | `[cmd]` **200 von 200**, alle `manual` | Woher ein Satz kam (`manual`/`voice`/`auto`). Heute einwertig — sobald Sprach- oder Geraeteeingabe existiert, ist es die Herkunftsangabe. | **melden** |
| **`set_type`** | `[cmd]` **200 von 200**: 180 `working`, 20 `warmup` | **Wird bereits benutzt, aber unsichtbar:** die Aufwaermsaetze erklaeren die 20 fehlenden e1RM-Werte. Eine Spalte in der Satzliste waere die naheliegende Stelle — **das Mockup hat keine Satzliste.** | **melden** |
| **`rir`** | `[cmd]` **0 von 200** | Nichts zu zeigen. | **leer** |

**Weiteres, das ungenutzt dasteht:**

| Feld | Bestand |
|---|---|
| `workout_sessions.location` | `[cmd]` 30 von 30 (`Gym`) — wird in der Sitzungsliste gezeigt, im Mockup nicht vorgesehen |
| `workout_sessions.started_time` / `ended_time` | `[cmd]` 30 von 30 (17:30–18:45) |
| `workout_sets.completed_at` | `[cmd]` 200 von 200 — der genaue Zeitpunkt je Satz |
| `workout_exercises.superset_group` | `[cmd]` leer, aber vorhanden |
| `measurement_source` / `source_detail` | `[cmd]` `seed` · „Kopie aus tom.seed@example.com" |

`[read]` **Nichts davon eingebaut** — der Auftrag: *„Was nicht aus den
Daten kommt, wird gemeldet, nicht ersetzt"*, und umgekehrt gilt
dasselbe: eine Spalte, fuer die das Mockup keine Stelle hat, bekommt
keine erfundene.

---

## 5. Die zwei Fallen aus G-64

`[cmd]` **Falle 1: PostgREST deckelt bei 1.000 Zeilen.** Bei 200
Saetzen trifft das noch nicht — **nach dem naechsten Seedlauf schon.**
Jede Abfrage traegt deshalb ein ausdrueckliches `limit`, und gezaehlt
wird ueber `count: 'exact', head: true`, nicht ueber die Laenge einer
geholten Liste.

`[cmd]` **Falle 2: `.in()` kippt ueber rund 200 IDs und schweigt** —
leere Liste statt Fehler. **Deshalb Verbund statt ID-Liste:**

```
workout_exercises → workout_sessions!inner(user_id)
workout_sets      → workout_exercises!inner(workout_sessions!inner(user_id))
```

`[cmd]` Bei 30 Sitzungen mit 60 Uebungen waere die ID-Liste heute noch
klein; nach dem naechsten Seedlauf nicht mehr. **Einmal bleibt `.in()`
stehen** — die Muskelzuordnung ueber sechs Uebungs-IDs, begrenzt durch
die trainierten Uebungen, nicht durch den Katalog. Die Stelle ist
kommentiert und auf 150 IDs gedeckelt.

`[cmd]` **Und jeder Abfragefehler wirft.** Genau das hat den Fall in
G-64 so lange verdeckt: ein Fehler kam als leere Liste zurueck und sah
aus wie „nichts gefunden". Ein Test zaehlt die `throw`-Stellen.

---

## 6. Der offene Punkt aus G-64 — erledigt

`[cmd]` G-64 meldete: **`e1RM` deckt 6 von 1.416 Uebungen**, 1.410
zeigen einen Strich. Der Vorschlag war ein eigener Bereich „meine
Uebungen".

`[read]` **Tom zu G-69:** *„Der Progression-Tab ist genau die Stelle.
Er zeigt den e1RM-Verlauf je Uebung — das sind zwangslaeufig die
trainierten, alles andere hat keinen Verlauf. Ein eigener Bereich waere
eine zweite Ansicht derselben sechs Uebungen."*

`[cmd]` **So gebaut.** Der Progression-Tab listet die sechs trainierten
Uebungen mit ihrem Verlauf; darunter steht der Satz:

> *„Gezeigt sind die Uebungen mit absolvierten Saetzen. Der Katalog
> fuehrt 1.416 — die uebrigen haben keinen Verlauf, weil sie nie
> trainiert wurden."*

`[read]` **Der Vorschlag aus G-64 war richtig gedacht** — er wollte die
1.410 Striche loswerden. Die Loesung ist nicht ein neuer Bereich,
sondern dass Progression ohnehin nur zeigt, was Verlauf hat.
**Ob G-68 damit geschlossen ist, entscheidet Tom.**

---

## 7. Zwei Beobachtungen aus dem Bau

### Die Kurve ist flach, und das ist ehrlich

`[cmd]` Der e1RM-Verlauf zeigt fuer jede Uebung **denselben Wert ueber
alle fuenf Sitzungen** — Aenderung 0 %. Der Grund liegt in den Daten:
C-78 legt je Uebung identische Gewichte und Wiederholungen an. **Kein
Anzeigefehler**, sondern ein Seedmuster ohne Progression. Wer echte
Kurven sehen will, braucht Seeds mit Steigerung.

### Ein Darstellungsfehler, im Browser gefunden

`[cmd]` Die Uebungsnamen in der Progression-Auswahl standen im DOM und
waren **unsichtbar**. Ursache: `Sparkline` gibt ein `<svg>` mit
`preserveAspectRatio="none"` und ohne eigene Breite aus; in einem
Flexkasten zieht es sich ueber die ganze Zeile und schiebt den Namen
heraus. **Behoben mit einer festen Breite von 60 px** — `packages/ui`
ist nicht angefasst, wie der Auftrag verlangt.

`[read]` Gefunden wurde er nur, weil das Bildschirmfoto angesehen
wurde. Ein Test auf „Name steht im DOM" waere gruen gewesen.

---

## 8. Nachweis

### Angemeldet, beide Modi

`[cmd]` Als `dev@lumeos.app`, 1440 × 1100:

| | |
|---|---|
| History (dunkel + hell) | Volumenkurve ueber 15 Sitzungen, Sitzungsliste mit `geplant`-Pillen, Muskelvolumen |
| Progression | Auswahl mit 6 Uebungen, e1RM-Kurve, Kennzahlen |
| Standards | Verhaeltnisbalken ohne Einstufung, Kennzahlen |
| Calendar | Monatsraster: **durchgezogen = absolviert, gestrichelt = geplant**, heute umrandet |
| Today | Saetze je Muskelgruppe (ohne Zielband), Serie |

### Geplant gegen absolviert

`[read]` Tom: *„Die Auszeichnung muss eindeutig sein — nicht nur eine
blassere Farbe."*

`[cmd]` Umgesetzt als **Pille** (`absolviert` / `geplant`) in jeder
Liste und als **Form** im Kalender (gefuellter Balken gegen
gestrichelten Rahmen). Keine Unterscheidung allein ueber Helligkeit.

| Rechnung | zaehlt |
|---|---|
| Volumen, Kennzahlen, Muskelvolumen | nur absolvierte |
| Serie | nur absolvierte |
| Kraftverlauf, Standards | nur absolvierte |
| Kalender, Sitzungsliste | **alle 30** |

### Zeilenschutz

`[cmd]` Als `test-user@lumeos.local` im Browser: Sitzungstabs fallen auf
den Entwurf zurueck (mit Marke), **der Exercises-Tab zeigt weiter
1.416** — genau wie in G-64 belegt.

`[cmd]` **An der Datenbank gegengeprueft:**

| Rolle `authenticated`, `sub` = | Sitzungen | Uebungen | Saetze | Katalog | Muskeln |
|---|---|---|---|---|---|
| `dev@lumeos.app` | 30 | 60 | 200 | 1.416 | 95 |
| `test-user@lumeos.local` | **0** | **0** | **0** | **1.416** | **95** |

`[cmd]` **Und der Quergriff:** test-user fragt ausdruecklich nach
`user_id = dev` → **0 Zeilen.** Ein leeres Ergebnis allein koennte
heissen, dass jemand keine eigenen Sitzungen hat; diese Zeile zeigt,
dass die Regel fremde sperrt.

### Breiten und Konsole

`[cmd]` Seitenueberlauf bei **375 · 768 · 1024 · 1440 px: keiner.**
`[cmd]` **Konsolenfehler: 0.**

### Gate und Tests

| | |
|---|---|
| `pnpm gate` `[cmd]` | **8 von 8 gruen** |
| `v2-attrappen.test.ts` `[cmd]` | **75 von 75** (vorher 70) |
| `lib/training/__tests__/auswertung.test.ts` `[cmd]` | **9 von 9** — neu |

**Fuenf neue Pruefungen in `v2-attrappen.test.ts`:**

1. *„fuenf Training-Tabs zeigen echte Sitzungen"* — je mit Rueckfall.
2. *„trennt absolviert von geplant — und nicht ueber status"* — haelt
   fest, dass die Trennung am Datum haengt und `status` trotzdem
   mitkommt.
3. *„erfindet keine Schwellen"* — Volume landmarks bleibt Attrappe,
   keine Einstufung in den Standards, kein MEV/MAV/MRV in der Rechnung.
4. *„umgeht die zwei PostgREST-Fallen aus G-64"* — Begrenzungen,
   Verbund statt `.in()`, Fehler werfen.
5. *„rechnet das Koerpergewicht mit Stichtag"* — aus
   `body_measurements`, nicht aus `profiles`.

**Neun Pruefungen der Rechnungen**, darunter der Fall, um den es geht:
*„geplante Sitzungen zaehlen nicht als Leistung — trotz status
completed"*.

### Eine Anmerkung zur Markenzaehlung

`[cmd]` **Die statische Zaehlung in `v2-attrappen.test.ts` aendert sich
nicht**, obwohl fuenf Tabs echt sind: die Entwurfskacheln bleiben als
**Rueckfall** stehen (`verlauf ? <Echt/> : <Entwurf/>`), dasselbe
Muster wie G-64. Ohne Sitzungen zeigt die Seite den Entwurf samt Marke,
statt einer leeren echten Kachel, die wie ein Befund aussaehe und doch
nur ein fehlendes Cookie waere.

**Was tatsaechlich rendert, ist im Browser gezaehlt** (Abschnitt 2) —
die statische Zahl allein wuerde die Anbindung nicht bemerken. Der Test
sagt das jetzt in seinem Kopf.

---

## 9. Was als Naechstes ansteht

1. **`status` in den Seeds richtigstellen** (3.1) — kuenftige Termine
   gehoeren auf `planned`, nicht auf `completed`. Danach kann die
   Anzeige den Status nehmen statt das Datum.
2. **Ueber `rpe` reden** (Abschnitt 4) — 200 von 200 gefuellt, das
   aussagekraeftigste ungenutzte Feld. Das Mockup hat keine Stelle
   dafuer.
3. **Seeds mit Progression** (7) — heute ist jede e1RM-Kurve flach.
4. **Volume landmarks entscheiden** — ohne belegte Quelle bleibt die
   Kachel Attrappe; mit einer Quelle ist sie eine kurze Arbeit.
5. **G-68 schliessen?** (6) — der eigene Bereich „meine Uebungen"
   koennte erledigt sein.
6. **HR zones, Offline sync, Plan** — 14 der 24 verbliebenen Marken.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| Beide G-64-Sperren weg | `config.toml:21` fuehrt `training`; `pg_policies` zeigt 1 Policy auf `exercises` |
| 30 / 60 / 200 Zeilen | `SELECT count(*)` je Tabelle fuer `dev` |
| 15 in der Zukunft, alle `completed` | `count(*) FILTER (WHERE session_date > CURRENT_DATE) GROUP BY status` |
| `status`-Werte | `pg_get_constraintdef` auf `workout_sessions` |
| `rpe` 200/200, `rir` 0/200 | `count(rpe)`, `count(rir)` ueber den Verbund |
| e1RM fehlt nur bei `warmup` | `GROUP BY set_type` mit `count(estimated_1rm)` |
| Squat 126,0 · Bench 99,3 · Deadlift 138,0 | `max(best_estimated_1rm) GROUP BY exercise_name` |
| Keine MEV/MAV/MRV-Quelle | `grep -rn` ueber `supabase/_pipeline/` und `docs/spezifikation/` |
| Koerpergewicht je Sitzungsdatum | `LATERAL`-Abfrage auf `goals.body_measurements` |
| Marken 40 → 24 | Browser je Tab gezaehlt |
| Zeilenschutz | `SET LOCAL ROLE authenticated` mit zwei `sub`-Werten + Quergriff + Browser |
| Kein Seitenueberlauf 375–1440 | `scrollWidth > clientWidth` je Breite → nein |
| Gate, Tests | `pnpm gate` 8/8 · 75/75 · 9/9 · 0 Konsolenfehler |
