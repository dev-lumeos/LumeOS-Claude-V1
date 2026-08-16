# C-03: Der Schreibpfad ins Tagebuch

`[cmd]` Erhoben am 2026-08-16, Zweig `dev`. Setzt GO-04 voraus.

**Das Tagebuch kann jetzt schreiben.** `[cmd]` `meals` und `meal_items`
tragen ihre ersten Zeilen — vorher waren beide seit dem Anlegen leer.

---

## Zwei Vorbedingungen, geprüft

`[cmd]` **PostgREST kennt `goals`:**
`PGRST_DB_SCHEMAS=public,graphql_public,nutrition,goals`. Der Neustart
hat gegriffen; nicht selbst neu gestartet.

`[cmd]` **Die Schemarechte stimmen:** `USAGE` auf `goals` haben
`authenticated` und `service_role`, `anon` nicht. Ein Aufruf mit dem
`anon`-Schlüssel bekommt `42501 permission denied for schema goals` —
richtig so.

`[cmd]` **C-51 kam während der Arbeit dazu:** zuerst hatte
`meal_items` 21 Spalten, dann 24 — `portion_name`, `portion_quantity`,
`portion_amount_g` (Commit `ff191b8`). Die Portionsauswahl ist deshalb
doch angeschlossen, wie vorgesehen als Letztes. **`meal_items` selbst
habe ich nicht angefasst**; C-51 hat die Spalten angelegt, ich habe die
TypeScript-Seite dazu gebaut.

---

## Was gebaut wurde

| Datei | Rolle |
|---|---|
| `app/api/nutrition/diary/route.ts` | GET, POST, PATCH, DELETE |
| `app/v2/nutrition/erfassen.tsx` | Mahlzeiten und Positionen |
| `lib/profile/zielwerte-write.ts` | Vorschlag → Ziel |
| `app/api/profile/ziele/route.ts` | die eine bewusste Handlung |

**Die Datenschicht war bereits vollständig.** `[cmd]`
`lib/nutrition/diary-write.ts` mit `createMeal`, `addMealItem`,
`updateMealItemAmount`, `removeMealItem` und dem Einfrieren stand seit
C-02/C-04 — samt Tests. C-03 war damit vor allem Route und Oberfläche.
`[read]` Das ist die Ausbeute daraus, dass die reine Logik früh von der
I/O getrennt wurde.

---

## Was beim Einfrieren entschieden wurde

`[read]` Beim Erfassen werden die Nährwerte in `meal_items` kopiert —
`enercc`, `prot625`, die sieben weiteren Makros, der vollständige
JSONB-Schnappschuss und `frozen_at`. **Das ist der Zweck dieser
Spalten**, nicht eine Vorsichtsmassnahme.

### Der Beleg

`[cmd]` Mahlzeit erfasst (Haferflocken, 100 g, 348 kcal), dann das
Lebensmittel geändert:

| | Lebensmittel | Position im Tagebuch |
|---|---|---|
| vorher | `Haferflocken` · 348 kcal | `Haferflocken` · 348 kcal |
| nach der Änderung | **`Haferflocken (KORRIGIERT)`** · **999 kcal** | `Haferflocken` · **348 kcal** |

**Das Frühstück von heute bleibt, wie es war.** `[cmd]` Danach wieder
zurückgesetzt.

`[cmd]` `daily_summary` zeigt weiterhin 348 kcal — die Sicht summiert
`meal_items`, nicht `foods`.

### Was das im Einzelnen heisst

**Wird ein Lebensmittel korrigiert**, ändert sich kein erfasster Tag.
Wer wissen will, mit welchem Stand gerechnet wurde, liest `frozen_at`.

**Wird ein Lebensmittel gelöscht**, bleibt die Position bestehen.
`[cmd]` `meal_items.food_id` trägt `ON DELETE RESTRICT` — das Löschen
schlägt fehl, statt Tagebucheinträge zu vernichten. Der Name steht
ausserdem als `food_name` in der Zeile, unabhängig von `foods`.

**Wird die Menge geändert**, werden die Werte **neu** eingefroren.
`[read]` Wer nur `amount_g` schriebe, hinterliesse Werte, die zur Menge
nicht passen — der Fehler wäre unsichtbar, weil beide Zahlen für sich
plausibel aussehen.

**Ändert sich eine Portionsdefinition**, gilt dasselbe — und C-51 hat
es genauso gelöst: `[cmd]` `portion_amount_g` speichert die Gramm je
Portion **zum Zeitpunkt des Erfassens**, nicht einen Verweis auf
`foods_portions`. Der Spaltenkommentar sagt es wörtlich: *„Bleibt
stehen, auch wenn die Portionsdefinition spaeter korrigiert wird."*
Ein erfasster Tag hängt damit an keiner Tabelle, die sich ändern kann.

### Was NICHT eingefroren wird

`[cmd]` Die **Referenzwerte** nicht: `daily_reference_assessment` liest
`nutrient_reference_values` live. Ändert sich ein Referenzwert, ändern
sich rückwirkend die Deckungsgrade. `[read]` Das ist vertretbar — der
Referenzwert ist eine Aussage über den Menschen, nicht über die
Mahlzeit. Aber es ist ein Unterschied zu den Nährwerten, und er ist
nirgends festgehalten.

`[cmd]` Die **Zielwerte** auch nicht — aber sie tragen `gueltig_ab`
und wirken damit nur vorwärts. Das ist der Ersatz fürs Einfrieren.

---

## Die vier C-48-Regeln

`[cmd]` Sie werden weiterhin in der Datenbank durchgesetzt; die Seite
rechnet nicht nach. Nachgemessen am erfassten Tag:

```
 complete        41
 not_applicable   2
 incomplete       2
```

`[cmd]` **Regel 1** greift: zwei Nährstoffe stehen auf `incomplete`,
weil der Schnappschuss sie nicht führt — kein Prozentwert, kein 0 %.

`[cmd]` **Regel 2** wurde sichtbar gemacht: `VITA` und `VITD` stehen je
**zweimal** in der Liste, einmal als `PRI` (Ziel) und einmal als `UL`
(Obergrenze). Im ersten Bildschirmfoto sah das nach einem Fehler aus.
Jetzt trägt jede Zeile ihre Wertart als Marke.

---

## Die Ringe füllen sich

`[cmd]` Nach dem Setzen des Ziels und dem Erfassen:

```
Energie        348   / 2.977,8 kcal   12 %
Protein         13,22 /   156,8 g      8 %
Kohlenhydrate   53,3  /   401,6 g     13 %
Fett             6,65 /    82,7 g      8 %
```

Der Nenner kommt aus `goals.zielwerte_am`, nicht aus einer erfundenen
Zahl.

### Rechnen und Speichern bleiben getrennt

`[read]` GO-04 hat entschieden, dass die Formel nicht bei jedem Abruf
schreibt. C-03 baut die fehlende Hälfte: **einen Knopf**, der aus dem
Vorschlag ein Ziel macht.

`[cmd]` `upsert` auf `(user_id, gueltig_ab)` — wer zweimal am selben Tag
setzt, überschreibt den Tageseintrag, statt einen zweiten anzulegen. Pro
Tag gilt ein Ziel, nicht das zuletzt geklickte von dreien.

`[cmd]` Ein Tag **vor** dem ersten Ziel bekommt keine Ringe — die
Funktion liefert keine Zeile, und `ProgressRing` nimmt `target` seit
G-03 als optional. Die Anzeige hält das aus.

---

## Nachweis

`[cmd]` `pnpm gate`: **8 successful, 8 total**. Tests: **177 von 177**.

### Die ersten Zeilen überhaupt

`[cmd]` Vorher und nachher:

| Tabelle | vorher | nachher |
|---|---:|---:|
| `nutrition.meals` | 0 | **1** |
| `nutrition.meal_items` | 0 | **1** |
| `goals.nutrition_targets` | 0 | **1** |

`[cmd]` Die Position: `Haferflocken`, 100 g, 348 kcal, 13,22 g Protein,
`frozen_at 2026-08-16 09:46:11`.

### Im Browser, angemeldet

`[cmd]` Ziel gesetzt, Mahlzeit angelegt, „Haferflocken" gesucht,
gewählt, hinzugefügt — alles über die Oberfläche, nicht über psql.
`[cmd]` Die Suche läuft über dieselbe Route wie `/v2/nutrition/suche`
und schreibt damit auch hier eine Zeile nach `search_events`.

### Zeilenschutz

`[cmd]` Zwei Sitzungen:

| Sitzung | `meals` | `meal_items` |
|---|---:|---:|
| Eigentümerin | 1 | 1 |
| fremd | **0** | **0** |

### Drei Breiten, alte Oberfläche

`[cmd]` 1600 / 1100 / 800 px ohne waagrechten Überlauf.
`[cmd]` `/nutrition`: **0** `v2-`-Elemente, **1** `.lume-shell`.
`[cmd]` Konsolenmeldungen: die bekannte `data-mode`-Warnung aus
`app/layout.tsx`, sonst nichts.

---

## Ein Befund: Protein zeigt 1.593 %

`[cmd]` In der Deckungsliste steht:

```
Protein (Nx6,25)   13,2 g   1.593 %
```

`[cmd]` Der Grund: Der Referenzwert für `PROT625` ist **0,83 g je kg
Körpergewicht** (`basis: per_kg_bw_per_day`). Die Funktion teilt 13,22
durch 0,83, ohne mit den 78,4 kg zu multiplizieren. Richtig wären
rund 20 %.

`[read]` Das ist der Fall, den Codex in GO-00 als Sonderbezug markiert
hat — die Markierung verhindert die Fehlermeldung in der Schemaprüfung,
die Umrechnung selbst fehlt aber noch. `[cmd]` Betroffen sind alle
Zeilen mit `mg/kg bw/day` oder `g/kg bw/day` als Einheit.

**Nicht behoben:** `daily_reference_assessment` ist in diesem Auftrag
gesperrt. `[cmd]` Nach GO-01 liegt das Körpergewicht im Profil vor —
die Funktion könnte es lesen.

---

## Was das Tagebuch noch nicht kann

`[read]` Eine Liste, die sagt, was fehlt, ist mehr wert als eine
Oberfläche, die so tut, als sei sie vollständig.

| Was | Warum nicht |
|---|---|
| ~~Portionen~~ | **Angeschlossen.** `[cmd]` Siehe unten. |
| **Rezepte** | `[cmd]` `recipes` existiert nicht. |
| **Essenspläne** | `[cmd]` `meal_plans` existiert nicht. |
| **MealCam** | Braucht Dateiablage und ein Bildmodell. Der `food_source`-CHECK kennt `mealcam` bewusst nicht. |
| **Von gestern kopieren** | Wäre heute baubar, ist aber nicht beauftragt. `[annahme]` Der kleinste nützliche Zusatz nach den Portionen. |
| **Favoriten, zuletzt benutzt** | `food_preferences` gibt es; die Suche nutzt sie noch nicht zum Sortieren. |
| **Mahlzeit löschen** | Nur Positionen lassen sich entfernen. `[cmd]` Eine leere Mahlzeit bleibt stehen — sichtbar als „0 Positionen". |
| **Uhrzeit je Mahlzeit** | `[cmd]` `meals` hat `entry_date`, keine Zeit. Der Typ (`breakfast`, `lunch` …) ersetzt sie grob. |
| **Notizen** | Die Spalte gibt es, die Oberfläche zeigt sie nicht. |
| **Mehrere Tage** | Die Seite zeigt heute; `?datum=` wird gelesen, aber es gibt keine Datumsauswahl. |

### Zwei Dinge, die anders sind als sie aussehen

`[cmd]` **Die Seite lädt nach jedem Schreiben neu.** Tagessumme, Ringe
und Deckungsgrade kommen aus der Serverkomponente; ein Teilupdate wäre
eine zweite Rechnung im Browser — genau das, was C-48 verbietet.
`[annahme]` Bei mehr als ein paar Positionen je Tag wird das spürbar
und gehört dann geändert.

`[cmd]` **Eine Mahlzeit je Typ und Tag.** `052` trägt ein `UNIQUE` auf
`(user_id, entry_date, meal_type)`; zwei Frühstücke wären ein Konflikt.
Die Oberfläche bietet einen bereits angelegten Typ deshalb gar nicht
erst an, statt einen 409 zu zeigen.


---

## Die Portionsauswahl (C-51 angeschlossen)

`[cmd]` C-51 lieferte während dieses Auftrags die drei Spalten. Die
TypeScript-Seite ist hier entstanden: Schema, Insert-Payload, eine
Leseroutine für `foods_portions` und die Auswahl in der Oberfläche.

`[cmd]` Nachgemessen — für einen Apfelkuchen liefert `foods_portions`:

```
100 g, 1 Stück (mittel) — 120 g, 1 Stück (klein) — 80 g,
1 Stück (groß) — 180 g, 1 Handvoll — 50 g, 1 Portion — 150 g
```

`[cmd]` Erfasst über die Route, 2 × 120 g:

```
 Apfelkuchen (Sandmasse) | 240.00 | 1 Stueck (mittel) | 2.000 | 120.00
```

### Zwei Wächter, beide geprüft

`[cmd]` Der CHECK in `058a` verlangt, dass entweder alle drei Felder
gesetzt sind oder keines, und dass `amount_g = Anzahl × Gramm`. Dieselben
Regeln stehen im Zod-Schema — **damit die Meldung aus der Anwendung
kommt und nicht aus Postgres**:

| Versuch | Antwort |
|---|---|
| `amount_g: 999` bei 2 × 120 g | **400** — „amount_g muss Anzahl × Gramm je Portion sein." |
| nur `portion_name`, ohne Anzahl | **400** — „Portion braucht Name, Anzahl und Gramm je Portion — oder nichts davon." |
| 2 × 120 g, `amount_g: 240` | **200** |

`[read]` Die doppelte Prüfung ist Absicht: die Datenbank bleibt die
letzte Instanz, aber eine Postgres-Fehlermeldung ist für die Nutzerin
unlesbar.

### Ein Artefakt, kein Fehler

`[cmd]` Beim Prüfen antwortete `?portionen_fuer=…` mit `400 datum muss
YYYY-MM-DD sein` — die Antwort des falschen Zweigs. Ursache: der
laufende Entwicklungsserver hielt eine ältere Fassung der Route.
`[cmd]` Im frisch gebauten Produktionsstand enthält
`server/app/api/nutrition/diary/route.js` den Zweig, und über die
Oberfläche wurden die Portionen korrekt geladen. Kein Codefehler,
sondern ein zwischengespeicherter Build.
