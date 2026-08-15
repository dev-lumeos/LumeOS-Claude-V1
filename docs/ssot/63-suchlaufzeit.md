# Suchlaufzeit: Index und Bedingung in Deckung bringen

`[cmd]` Erhoben 2026-08-15. Anlass: C-17. Gemessen gegen die laufende
Instanz (vorher) und eine Wegwerf-Datenbank mit vollem Datenbestand
(nachher), beide 7.140 Lebensmittel.

Sicherung vor der Änderung:
`backup/schema/2026-08-15_nutrition_vor_c17.sql`, 103 KB, `--schema-only`.

**Die Änderung ist nicht angewendet.** Sie liegt in
`073_suchfilter.sql`; die laufende Datenbank trägt weiterhin die alte
Fassung.

---

## Das Ergebnis

| Anfrage | vorher | nachher | |
|---|---|---|---|
| `huehnerbrust` | `[cmd]` 519 ms | `[cmd]` **199 ms** | −62 % |
| `huhn` | `[cmd]` 506 ms | `[cmd]` **228 ms** | −55 % |
| `haehnchen brust roh` | `[cmd]` 496 ms | `[cmd]` **211 ms** | −57 % |
| `spinat` | `[cmd]` 296 ms | `[cmd]` **129 ms** | −56 % |
| `reis` | `[cmd]` 294 ms | `[cmd]` **134 ms** | −54 % |
| **(leer)** | `[cmd]` 217 ms | `[cmd]` 225 ms | **unverändert** |

Median aus je fünf Läufen, gemessen am **vollständigen Aufruf** von
`nutrition.food_search`, nicht an einem Teilausdruck. `[read]` Das ist
die Lehre aus dem verworfenen Slot-Versuch: isoliert schnell heisst
nicht eingebaut schnell.

**Die Trefferzahlen sind in allen sechs Fällen identisch** — 7140 · 41 ·
145 · 136 · 31 · 3. Die Trefferlogik ist unverändert; nur der Plan ist
ein anderer.

`[cmd]` Beide Massstäbe halten: **MealCam 34 von 37**,
**Wortschatz 31/31 soll und 16/16 Schutz**.

---

## Was der Ausführungsplan sagt

### Die Diagnose in C-17 war unvollständig

`[read]` C-17 sagt: *„Die Bedingung faltet `concat_ws(...)`, der
Trigramm-Index liegt auf `search_fold(name_de)`. Zwei verschiedene
Ausdrücke — also sequenzieller Scan."*

`[cmd]` **Einen Index auf `search_fold(name_de)` gibt es gar nicht.**
Die Indexe auf `nutrition.foods` sind:

```
foods_pkey · foods_bls_code_key · foods_bls_code_idx
foods_sort_weight_idx · idx_foods_sort_weight · idx_foods_category
idx_foods_name_display_de   (gin, auf name_display_de — aus C-41)
```

Der Ausdrucksindex, um den es gehen sollte, ist irgendwann verloren
gegangen — vermutlich beim Kettenneuaufbau. **Das ändert aber nichts**,
denn er war nicht der Engpass.

### Wo die Zeit wirklich hinging

`[cmd]` Der Plan der Bedingung für `huehnerbrust`, vorher:

```
Aggregate                                    Buffers: 44.165
  Nested Loop Anti Join
    Seq Scan on foods f      (rows=7140)     Buffers:     818
    SubPlan 2
      Function Scan jsonb_array_elements_text (loops=7282)
        SubPlan 1
          Index Only Scan food_aliases_pkey  (loops=14212)
                                             Buffers:  43.347
```

**`43.347 von 44.165 Buffern — 98 % — entfallen auf die
Alias-Prüfung**, ausgeführt **14.212 mal**. Der Seq Scan über alle 7.140
Lebensmittel kostet 818 Buffer, also 1,9 %.

Die Ursache ist keine fehlende Indexdeckung, sondern eine **korrelierte
Unterabfrage**: `EXISTS (… WHERE fa.food_id = f.id AND …)` läuft je
Lebensmittel **und** je Alternative. Bei zwei Gruppen mit drei
Alternativen sind das 7.140 × 2 Durchläufe.

Postgres benutzt dort `food_aliases_pkey`, nicht den Trigramm-Index:
Die Bedingung filtert zuerst nach `food_id` und wendet die Faltung erst
danach an. Ein Trigramm-Index kann in dieser Form nicht greifen — auch
wenn er existiert, und `idx_food_aliases_fold_trgm` existiert.

### Nachher

```
Aggregate                                    Buffers:  1.025
    Seq Scan on foods f      (rows=7140)     Buffers:    210
    Bitmap Heap Scan on food_aliases         (einmal je Gruppe)
```

`[cmd]` Über den vollständigen Funktionsaufruf gemessen:
**90.647 → 3.066 Buffer, −96,6 %.**

Der Trigramm-Index wird jetzt benutzt (`Bitmap Heap Scan`), und die
Alias-Auflösung läuft **einmal je Gruppe** statt 14.212 mal.

---

## Die Lösung, und vier verworfene Wege dorthin

Die tragende Idee: **die Alias-Treffer einmal je Gruppe ermitteln**,
statt je Zeile. Der Weg dahin war nicht der erste Einfall.

| Anlauf | Fassung | Ergebnis |
|---|---|---|
| 1 | `WITH`-Vorspann, Gruppen als Literale | `[cmd]` 240 → **50 ms**, 44.165 → 1.255 Buffer. **Geht nicht**: die Bedingung steht im `WHERE` zweier CTEs, ein Vorspann ist dort nicht möglich |
| 2 | `f.id IN (…)` mit Bezug auf `grp.gruppe` | `[cmd]` **lief nach 600 s nicht zu Ende** — bleibt korreliert |
| 3 | Zeilenpaar `(nr, f.id) IN (…)` über jsonb | `[cmd]` Buffer 42.799 → **363**, aber Zeit 255 → **506 ms**. *Weniger Buffer heisst nicht schneller* |
| 4 | Alias-IDs von der App vorauflösen | `[cmd]` Bedingung 245 → 45 ms, aber die Auflösung schien 164–343 ms zu kosten — **Messfehler**: `[cmd]` in der Datenbank kostet sie **5 ms**, der Rest war docker/psql-Rundlauf meines Aufbaus |
| 5 | Hilfsfunktion mit dynamischem SQL | **gewählt** — `[cmd]` 260 → 93 ms auf der Bedingung, 519 → 199 ms auf der ganzen Funktion |

### Warum dynamisches SQL, und warum das kein Selbstzweck ist

`[cmd]` Dieselbe Bedingung, einmal mit der Alternative als `a.alt` aus
dem jsonb und einmal als Literal:

| | Buffer |
|---|---|
| `LIKE '%' \|\| a.alt \|\| '%'` (aus jsonb) | **2.120.811** |
| `LIKE '%huehner%'` (Literal) | **248** |

Ein Trigramm-Index braucht das Suchmuster zur Planungszeit. Kommt es
aus einer Funktion oder einem jsonb-Feld, sieht der Planer keine
Konstante und fällt auf einen sequenziellen Durchlauf zurück — je Zeile.

`nutrition.such_alias_treffer(jsonb)` baut die Bedingung deshalb als
Text und führt sie mit `EXECUTE` aus. `quote_literal()` schützt gegen
Einschleusung; die Werte stammen ohnehin aus der Zerlegung der App.

**Beide Kopien der Bedingung sind geändert.** `[read]` Die Datei warnt
seit dem 2026-08-14 davor, nur eine zu ändern — dann weicht `total` von
der Liste ab. `[cmd]` Das Ersetzen hat geprüft, dass genau zwei
Vorkommen existierten.

---

## Was hier nicht schneller wird

`[cmd]` **Die leere Anfrage bleibt bei 217 → 225 ms.** Sie berührt die
Alias-Prüfung nicht und wird von dieser Änderung nicht angefasst.

Damit ist die Grundlast benannt und **nicht behoben**: `[read]` Sie lag
schon vor dem Suchausbau bei 152–295 ms. Von den 199 ms, die
`huehnerbrust` jetzt braucht, sind rund **225 ms Grundkosten** — die
Suche selbst kostet inzwischen weniger als das Drumherum.

`[annahme]` Wo diese Grundkosten entstehen, ist **nicht gemessen**. Der
Verdacht liegt bei den beiden `LEFT JOIN LATERAL` in `matching_foods`
(Nährwerte je Lebensmittel, Tags je Lebensmittel) und bei
`all_matching_food_ids`, das für `total` ein zweites Mal über den
Bestand läuft. Das zu prüfen ist eine eigene Aufgabe — und nach dieser
Änderung **die grössere**.

Ebenfalls nicht angefasst:

- **Der fehlende Ausdrucksindex auf `search_fold(name_de)`.** `[cmd]`
  Er existiert nicht mehr. Ihn anzulegen würde den Seq Scan über
  `foods` ablösen — aber der kostet `[cmd]` nur 210 von 3.066 Buffern.
  `[annahme]` Der Gewinn wäre klein; gemessen ist es nicht.
- **Der Insert in `nutrition.search_events`** (C-18). `[cmd]` Er ist in
  diesen Zahlen **nicht** enthalten: gemessen wurde
  `nutrition.food_search` direkt, und das Protokoll schreibt die
  Anwendung, nicht die Funktion.

---

## Was diese Messung nicht sagt

- **Sie sagt nicht, dass 199 ms schnell sind.** Sie sind besser als 519,
  aber für eine Suche mit Tipp-Reaktion weiterhin zu langsam. Die
  Grundlast ist jetzt der bestimmende Anteil.

- **Sie vergleicht zwei Datenbanken.** Vorher auf `postgres`, nachher
  auf `wegwerf_c17` — derselbe Dump, dieselbe Maschine, aber nicht
  dieselbe Instanz. `[annahme]` Der Unterschied dürfte klein sein; die
  leere Anfrage (217 gegen 225 ms) stützt das, ist aber nur ein Wert.

- **Fünf Läufe je Anfrage sind wenig.** Der Median schützt gegen
  Ausreisser, nicht gegen einen dauerhaft anderen Maschinenzustand.

- **Sie misst nicht die Anwendung.** Was der Nutzer im Browser wartet,
  enthält Netzwerk, PostgREST und Rendern. `[cmd]` Gemessen ist die
  Ausführungszeit in der Datenbank.

- **Die Hilfsfunktion ist `STABLE`, nicht `IMMUTABLE`.** `[annahme]`
  Richtig so, weil sie eine Tabelle liest — aber sie wird damit je
  Anweisung neu ausgewertet, nicht über Anweisungen hinweg
  zwischengespeichert. Ob ein Zwischenspeicher etwas brächte, ist nicht
  geprüft.

---

## Stand

```
[cmd] huehnerbrust  519 -> 199 ms   (Median aus 5)
[cmd] Buffer        90.647 -> 3.066  (ganze Funktion)
[cmd] MealCam       34/37 unveraendert
[cmd] Wortschatz    31/31 soll, 16/16 Schutz — BESTANDEN
```

**Nicht angewendet.** Die Änderung liegt in
`supabase/_pipeline/07_lesefunktionen/073_suchfilter.sql`; gemessen
wurde auf `wegwerf_c17`, das danach verworfen wurde. Zur Anwendung
gehört ein Kettenlauf von `073` — und `[cmd]` Codex misst parallel für
C-18 auf derselben Instanz, weshalb ich die laufende Datenbank nicht
angefasst habe.
