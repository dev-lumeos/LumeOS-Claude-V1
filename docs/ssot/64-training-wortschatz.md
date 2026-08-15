# Training-Wortschatz C-16

Stand: 2026-08-15.

`[cmd]` Dieser Auftrag hat nichts gebaut und keine Datenbank verändert. Es
wurde nur lesend gegen `training.*` gemessen und ein Vorher-Prüfskript
angelegt.

Dateien:

- `supabase/_pipeline/_validierung/training-wortschatz-messen.ts`
- `docs/ssot/64-training-wortschatz.md`

---

## Schritt 1: der Bruch im Bestand

`[cmd]` Live-Bestand in der lokalen Datenbank:

| Objekt | Anzahl |
|---|---:|
| `training.exercises` | 1.416 |
| `training.muscle_groups` | 107 |
| `training.equipment` | 58 |
| `training.exercise_muscles` | 6.624 |

`[cmd]` Hinweis: Der Auftrag nannte 109 Muskelgruppen und 6.625 Zuordnungen.
Die aktuelle laufende Datenbank meldet 107 und 6.624.

`[cmd]` Spalten in `training.exercises`: `id`, `name`, `category`,
`exercise_type`, `tracking_type`, `difficulty`, `equipment_id`,
`instructions`, `tips`, `media_paths`, `sort_weight`, `is_active`, `source`,
`created_at`, `updated_at`.

`[cmd]` Es gibt kein Feld für eine deutsche Bezeichnung, kein
`name_display_de`, kein Aliasfeld und keine deutsche Spalte an
`training.exercises`, `training.muscle_groups` oder `training.equipment`.

`[cmd]` Sprache der Übungsnamen, heuristisch gemessen:

| Klasse | Übungen |
|---|---:|
| klar englisch | 1.154 |
| deutsch oder gemischt | 0 |
| unklar | 262 |

`[cmd]` Die unklaren 262 sind keine deutschen Namen, sondern Namen, die nicht
auf die einfache englische Wortliste fielen, etwa Yoga-/Eigen-/Kurzformen.

`[cmd]` Muskelgruppen mit deutsch wirkendem Namen: 0 von 107. Geräte mit
deutsch wirkendem Namen: 0 von 58.

`[cmd]` Training hat keine Suchfunktion analog zu `nutrition.food_search`.
`information_schema.routines` meldet im Schema `training` nur
`touch_updated_at`; `rg` fand keine Training-/Exercise-Suchfunktion in
`supabase`, `apps`, `packages` oder `services`.

---

## Schritt 2: Massstab mit Sollwerten

`[read]` Vorbild ist `mealcam-zutaten-messen.ts`: Eine Prüfung ohne Erwartung
misst nichts. Deshalb hat jeder prüfbare Begriff eine konkrete erwartete
Exercise-ID.

`[cmd]` Angelegt:
`supabase/_pipeline/_validierung/training-wortschatz-messen.ts`.

`[cmd]` Die Liste enthält 38 Suchbegriffe:

| Klasse | Anzahl |
|---|---:|
| mit festem Sollwert | 34 |
| ohne Sollwert | 4 |

`[cmd]` Die Sollwerte wurden im Bestand nachgeschlagen. Beispiele:

| Begriff | erwarteter Bestandseintrag |
|---|---|
| `bankdruecken` | `Barbell Bench Press` |
| `kniebeuge` | `Barbell full squat` |
| `kreuzheben` | `Barbell deadlift` |
| `latzug` | `Cable close grip front lat pulldown` |
| `beinpresse` | `Leg press machine normal stance` |
| `butterfly` | `Pec deck fly machine` |
| `planke` | `Plank on elbows` |

`[cmd]` Ohne Sollwert blieben:

| Begriff | Grund |
|---|---|
| `beinstrecker` | kein eindeutiger Leg-Extension-Eintrag im gelesenen Bestand |
| `reverse fly` | mehrere Geräte-/Kurzhantelvarianten |
| `face pull` | Band, Kurzhantel und Jump-Rope-Varianten konkurrieren |
| `shrugs` | mehrere Langhantel-/Kurzhantelvarianten |

---

## Schritt 3: heutige Messung

`[cmd]` Weil es keine Training-Suchfunktion gibt, misst das Skript gegen
`ILIKE` auf `training.exercises.name`, sortiert nach `sort_weight desc, name`.

Aufruf:

```powershell
pnpm exec tsx supabase/_pipeline/_validierung/training-wortschatz-messen.ts
```

`[cmd]` Ergebnis: Exit 1. Das ist der erwartete Vorherwert.

| Maß | Wert |
|---|---:|
| Sollwert auf Platz 1 | 3 von 34 |
| in den ersten drei | 3 |
| überhaupt in den Top 10 | 6 |
| gar keine Treffer | 25 |
| ohne Sollwert | 4 |

`[cmd]` Platz 1 trafen nur englische oder identische Begriffe:
`bodyweight squat`, `hyperextension`, `hip thrust`.

`[cmd]` Typische Fehlschläge:

| Anfrage | Ist | Soll |
|---|---|---|
| `bankdruecken` | keine Treffer | `Barbell Bench Press` |
| `kniebeuge` | keine Treffer | `Barbell full squat` |
| `kreuzheben` | keine Treffer | `Barbell deadlift` |
| `klimmzug` | keine Treffer | `Assisted pull up` |
| `bizepscurl` | keine Treffer | `Barbell bicep curl normal grip` |
| `latzug` | keine Treffer | `Cable close grip front lat pulldown` |
| `beinpresse` | keine Treffer | `Leg press machine normal stance` |
| `butterfly` | `Butterfly yoga flaps` | `Pec deck fly machine` |
| `crunches` | `Abdominal crunches` | `Crunch floor` |
| `planke` | keine Treffer | `Plank on elbows` |

---

## Was übertragbar ist

`[cmd]` Bei Nutrition existiert inzwischen eine große Aliasschicht; im letzten
Bericht standen 32.805 Food-Aliase. Training hat heute keine entsprechende
Schicht.

`[annahme]` Anzeigenamen je Eintrag sind übertragbar. Bei Nutrition waren sie
kurze deutsche Alltagsnamen zu fachlichen BLS-Namen. Bei Training wäre der
Bruch noch direkter: englischer Katalogname gegen deutschen Nutzerbegriff.

`[annahme]` Eine Aliasschicht ist übertragbar, aber die Größe ist anders. Der
Mindestumfang wäre nicht 32.805 wie bei Foods, sondern zunächst ungefähr ein
deutscher Anzeigename pro 1.416 Übungen plus echte Varianten wie
`bankdruecken`, `bench press`, `brustpresse`, `schraegbankdruecken`.

`[cmd]` Eine `sort_weight`-artige Rangfolge existiert formal, trägt aber heute
nichts: Alle 1.416 Übungen haben `sort_weight = 500`. Kategorien sind nur
`Free Weights` 546, `Bodyweight` 529, `Resistance` 341; `exercise_type` ist
bei allen `strength`, `tracking_type` bei allen `weight_reps`.

`[annahme]` Eine Rangfolge wäre fachlich schwieriger als bei Lebensmitteln.
Bei Foods gibt es Rohform, Warengruppe, Makros und Grundnahrungsmittel als
Signale. Bei Übungen konkurrieren Ziel, Gerät, Variante und Trainingsstand:
`kniebeuge` kann Langhantel, Körpergewicht, Front Squat oder Hack Squat
meinen.

`[cmd]` Fehlsuchen mitschreiben ist direkt übertragbar. Für Nutrition ist
`nutrition.search_events` seit C-18 vorhanden; Training könnte denselben
Messgedanken ab Tag eins verwenden. Dieser Auftrag hat dafür nur den
Vorher-Massstab gebaut, keine Logging-Tabelle.

---

## Was bei Nutrition vier Tage gekostet hat

`[read]` `docs/todo/TODO.md` beschreibt die Reihenfolge: erst C-28
Artengruppierung über vier Codestellen, dann C-33 mit zusätzlichem
Zubereitungsschlüssel, erst danach die kuratierte Namenarbeit.

`[cmd]` C-28 fiel in `48-artengruppierung-messung.md`: 39 von 100
einheitliche Gruppen, Abnahme 95 nicht erreicht.

`[cmd]` C-33 fiel in `49-zubereitungsschluessel.md`: 47 von 100
einheitliche Gruppen, Abnahme 95 nicht erreicht.

`[read]` `52-anzeigenamen-batch.md` dokumentiert danach die kuratierte
Bestandsseite: Anzeigenamen als endliche, geprüfte Datendatei.

`[annahme]` Genau dieser Umweg ist bei Training vermeidbar. Der Bruch ist
jetzt vor dem Oberflächenbau gemessen: Deutsche Nutzerbegriffe treffen auf
englische Übungsnamen, und ein bloßes `ILIKE` erreicht nur 3 von 34
Sollwerten auf Platz 1.

---

## Was dieser Schritt nicht tut

- Kein `UPDATE`, kein `INSERT`.
- Keine Schemaänderung.
- Keine Übersetzungen, keine Aliasdaten, keine Suchfunktion.
- Keine Empfehlung, welcher Weg gebaut werden soll.
- Keine Änderung an `nutrition.*` oder `training.*`.
