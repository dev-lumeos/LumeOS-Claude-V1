# Der Preferences-Tab in Nutrition (G-65)

**Stand:** 2026-08-19 · **Auftrag:** G-65 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

Vorgeschichte: `docs/ssot/87-preferences.md` (C-87, die RPC-Schicht),
`docs/ssot/117-ausschluss-presets.md` (C-93, die Presets).

**Tom, 2026-08-18:** *„Die Preferences aus dem alten Repo waren genial,
bis ins Detail runter konnte man sagen, was man sehr gern hat oder
nichts isst — und die Suche hat das dementsprechend umgesetzt."*

---

## Kurzfassung

`[cmd]` **Alle sechs Kacheln verlieren die Marke, eine siebte kommt
dazu.** Der Tab liest und schreibt echte Vorlieben; die Testdaten
erscheinen vollständig.

`[cmd]` **Nichts an der Datenseite war zu bauen.** `food_preferences`,
`food_preference_items` und die zwei Funktionen `food_preferences_read`
/ `_write` gibt es seit C-87. Dieser Auftrag hat sie **benutzt**, nicht
nachgebaut.

`[cmd]` **C-93 ist während dieses Auftrags fertig geworden.** Der
Auftragstext ging noch von einem Leerzustand aus; seit 2026-08-19 führt
`nutrition.exclusion_presets` **elf Presets** — die Kachel bietet sie
an, statt einen Leerzustand zu zeigen.

| | |
|---|---|
| Kacheln mit Marke vorher / nachher `[cmd]` | **6 / 0** |
| Kacheln gesamt `[cmd]` | **7** — die Ausschlüsse kommen dazu |
| Schreibpfad `[cmd]` | `food_preferences_write`, atomar, `SECURITY INVOKER` |
| `pnpm gate` `[cmd]` | typecheck grün · **351 Tests grün** (8 neu) |

---

## 1. Welche Kachel welche Spalte schreibt

`[cmd]` Je Kachel, gegen die laufende Instanz geprüft:

| Kachel | Schreibt nach | Liest aus |
|---|---|---|
| **Diet type** | `food_preferences.diet_type` | dieselbe |
| **Allergies** | `allergies[]` **und** `intolerances[]` | beide, als drei Stufen |
| **Generelle Ausschlüsse** *(neu)* | `general_exclusions[]` | dieselbe + `exclusion_presets` |
| **Categories** | `food_preference_items` (`target_type='category'`, `category_id`) | dieselbe + `food_categories` |
| **Tag preferences** | `food_preference_items` (`target_type='tag'`, `tag_code`) | dieselbe + `tag_definitions` |
| **Individual foods** | `food_preference_items` (`target_type='food'`, `food_id`) | dieselbe, mit `food_name` und `bls_code` |
| **Priority order** | **schreibt nichts** | reine Anzeige |

`[cmd]` **`strength` folgt aus `preference`:** `liked → boost`,
`disliked → soft_dislike`, `hard_exclude → hard_exclude`. Die
Prüfbedingung erlaubt sechs Werte; genommen sind die drei, die der
Bestand benutzt. `source` steht auf `settings` wie in den Testdaten.

### Die Schreibfunktion ersetzt, sie ergänzt nicht

`[cmd]` **`food_preferences_write` ersetzt die Items atomar.** Wer nur
eine Änderung schickt, löscht den Rest. Der Tab hält deshalb den ganzen
Stand und sendet ihn als Ganzes — jede Änderung schreibt sofort, es gibt
keinen Speichern-Knopf.

`[read]` **Ein zweiter Schreibweg wäre ein zweiter Weg zu denselben
Zeilen.** Ein Test prüft, dass die Aktionsdatei keinen direkten
Tabellenzugriff daneben führt.

---

## 2. Was echt wurde — mit Zahl

`[cmd]` Angemeldet als `dev@lumeos.app`, 2026-08-19:

| | vorher | nachher |
|---|---|---|
| Kacheln mit Attrappenmarke | **6** | **0** |
| Kacheln gesamt | 6 | **7** |

### Die Testdaten, im Browser wiedergefunden

`[cmd]` Alle vom Auftrag genannten Werte erscheinen:

| Was | Wo |
|---|---|
| **Baumnüsse** als Allergie | rote Pille mit Zusatz `Allergie` |
| **Laktose** als Unverträglichkeit | gelbe Pille mit Zusatz `Sensibel` |
| **`ultra_processed`** ausgeschlossen | unter „Weitere gesetzte Ausschlüsse" |
| **Kekse & Plätzchen** −50 | Zeile „Gesetzt · Unterkategorien" |
| **Weißer Reis (roh)** +100 | Individual foods, mit BLS-Code `C352000` |
| **Enthält Nüsse** als harter Ausschluss | Tag-Kachel, mit `⊘` |
| **omnivore**, 4 Mahlzeiten, `advanced`, 30 min | Diet type bzw. Abschnitt 4 |

### Der Schreibnachweis

`[cmd]` Drei Schreibvorgänge gemessen, jeweils Klick → Datenbank:

| Aktion | Ergebnis |
|---|---|
| Diet type `omnivore` → `pescatarian` | in der Tabelle, **nach Neuladen noch da** |
| Kategorie `OBST` auf like | neue Zeile, **die drei bestehenden Items überlebten** |
| Preset `Keine Innereien`, dann `Halal-konform` | `general_exclusions = {ultra_processed, no_offal, halal}` |

`[cmd]` **Danach auf den Seed-Stand zurückgesetzt** —
`diet_type = omnivore`, `general_exclusions = {ultra_processed}`, die
Test-Kategorie entfernt.

### Die vier neuen Dateien

| Datei | Zeilen | Inhalt |
|---|---|---|
| `lib/nutrition/vorlieben-lesen.ts` | 261 | Lesepfad über die RPC + drei Kataloge |
| `v2/nutrition/vorlieben-aktionen.ts` | 117 | Die Serveraktion über `food_preferences_write` |
| `v2/nutrition/tab-vorlieben.tsx` | 686 | Die sieben Kacheln |
| `lib/nutrition/__tests__/vorlieben-tab.test.ts` | 143 | Acht Prüfungen der Entscheidungen |

---

## 3. Was der Assistent kann und die Kacheln nicht

`[cmd]` Der Vorgänger führt `FoodPreferences.tsx` mit **927 Zeilen** in
vier Schritten. `[read]` Der Auftrag: *„Der Assistent ist die Vorlage,
das Mockup die Vorgabe. Wo sie sich widersprechen, gilt das Mockup —
aber melde, was der Assistent kann und die Kacheln nicht."*

### Übernommen, gegen das Mockup

**Zwei Abweichungen, beide mit Tom besprochen:**

`[cmd]` **1. Die Allergiekachel führt 20 Einträge in drei Stufen**
(neutral → Sensibel → Allergie), das Mockup zeigt 14 mit an/aus.

**Der Grund ist nicht Geschmack, sondern Bedienbarkeit:** die Datenbank
trennt `allergies[]` und `intolerances[]`, und die Testdaten nutzen
beide. **Mit An/Aus-Pillen wäre die halbe Spalte nicht bedienbar** und
die Laktose-Testdaten unsichtbar.

`[read]` **Milcheiweiß und Laktose stehen getrennt** — das ist
Fachwissen, kein Listenfehler: eine Kuhmilchallergie richtet sich gegen
das Eiweiß, eine Laktoseintoleranz gegen den Zucker.

`[cmd]` **2. Kategorien kommen aus dem Katalog**, nicht als feste
Achterliste: `food_categories` führt **518 Zeilen, davon 13 Wurzeln**.

### Was der Assistent kann und hier fehlt

| Assistent | Hier | Warum |
|---|---|---|
| **Lebensmittelraster nach Gruppen** — „Tippe auf Lebensmittel: 💚 / ❌", je Gruppe „Alle 💚" und „Reset" | fehlt | `[cmd]` Der Assistent führt ein **fest verdrahtetes Raster** mit rund 200 Einträgen (`FOOD_GRID`). Der Bestand hat **7.140 Lebensmittel** — ein Raster wäre eine erfundene Auswahl. Einzelne Lebensmittel werden in der Suche markiert (G-67). |
| **Ernährungsformen mit Erklärsatz** | nur der Name | `[cmd]` Die acht Sätze stehen im Vorgängercode, in keiner Tabelle. |
| **Laufende Zählung `X 💚 · Y ❌ · Z neutral`** | **übernommen** | steht über den Kacheln |
| **Schritt 3: Mahlzeiten, Snacks, Kochlevel, Zeit, Budget, Meal-Prep** | fehlt | Abschnitt 4 — sie sind gespeichert und wirkungslos |
| **Schritt 4: Zusammenfassung** | fehlt | `[read]` Ein Assistent hat einen Abschluss, eine Einstellungsseite nicht. |
| **8 globale Ausschlüsse fest im Code** | **aus dem Katalog** | `[cmd]` C-93 führt **elf** in `exclusion_presets`. `[read]` Tom: *„Wer die acht Presets jetzt fest in den Code schreibt, baut die Liste ein zweites Mal."* |

---

## 4. Was gespeichert wird, aber nichts bewirkt

`[read]` Der Auftrag: *„Kochlevel, Zubereitungszeit und Budget sind
gespeichert, aber wirkungslos — Rezepte und Essenspläne gibt es nicht.
Zeigen ja, aber sag im Bericht, dass sie nichts bewirken."*

`[cmd]` **Sie sind gespeichert und werden nicht gezeigt** — mit Absicht:

| Spalte | Wert bei `dev` | Wirkung |
|---|---|---|
| `cooking_skill` | `advanced` | **keine** — es gibt keine Rezepte |
| `prep_time_max_min` | `30` | **keine** |
| `budget_level` | `medium` | **keine** |
| `meals_per_day` | `4` | **keine** — kein Essensplaner |
| `snacks_per_day` | `1` | **keine** |
| `meal_prep_ok` | `true` | **keine** |
| `preferred_cuisines` | `{mediterranean}` | **keine** — die Küchen-Zielart wird nicht bedient |
| `planner_notes` | Testtext | **keine** |

`[read]` **Das Mockup hat für keine dieser acht Spalten eine Kachel.**
Der Auftrag sagt „Zeigen ja" — aber die Regel darüber sagt *„Das Mockup
ist die Vorgabe"*, und eine Kachel zu erfinden, die nichts bewirkt,
wäre eine doppelte Erfindung. **Gemeldet statt gebaut; Tom entscheidet.**

### Und der grösste wirkungslose Punkt: die Rangfolge

`[cmd]` **`nutrition.food_search` hat keinen Nutzerparameter.** Die
Signatur führt 14 Argumente — `p_query`, `p_tokens`, `p_category_slug`,
`p_tag_code`, `p_sort` … — **aber keine `user_id` und keine
Präferenzliste.**

**Die ganze Rangfolge ist damit hinterlegt und wirkungslos.** Das steht
in der Kachel:

> *„Die Reihenfolge ist hinterlegt, wirkt aber noch nicht in der Suche
> — die Suchfunktion kennt die Vorlieben bisher nicht."*

`[cmd]` `food_preferences_read` liefert die Struktur `search_application`
mit `hard`/`strong`/`soft`/`boost` bereits fertig — **die Datenseite
wartet, die Suche holt sie nicht ab.** Das ist C-94.

---

## 5. Was die Daten hergeben und das Mockup nicht zeigt

| Was | Bestand | Status |
|---|---|---|
| **`exclusion_preset_code`** als Zielart | `[cmd]` Prüfbedingung erlaubt sie; C-93 füllt den Katalog | **melden** — die Kachel schreibt heute nach `general_exclusions[]`, nicht als Item. Beide Wege existieren; welcher gilt, ist eine offene Frage. |
| **`catalog_item_code`** — die **sechste** Zielart | `[cmd]` Der Auftrag nennt fünf; die Prüfbedingung führt sechs | **melden** |
| **`cuisine_code`** als Zielart | `[cmd]` vorhanden, ungenutzt; `preferred_cuisines[]` führt `mediterranean` | **melden** |
| **`is_exclusion_relevant`** an `tag_definitions` | `[cmd]` 5 von 14 Tags | **melden** — könnte die Tag-Kachel in „Vorliebe" und „Ausschluss" teilen |
| **`tag_type`** (`diet`/`processing`/`allergen`) | `[cmd]` alle 14 | **melden** — die Kachel zeigt sie ungruppiert |
| **505 Unterkategorien** | `[cmd]` 518 minus 13 Wurzeln | **teils** — gesetzte werden gezeigt, auswählbar sind nur die Wurzeln |

---

## 6. Zwei Befunde aus dem Bau

### Eine gesetzte Unterkategorie wäre still gelöscht worden

`[cmd]` **Der gefährlichste Fund.** Die Testdaten setzen „Kekse &
Plätzchen" — ein **Enkel** von „SÜSSES & SNACKS". Die Kachel zeigt die
13 Wurzeln; die Vorliebe wäre also unsichtbar gewesen.

**Und weil `food_preferences_write` die Items ersetzt, hätte die nächste
beliebige Änderung sie gelöscht** — ohne Meldung, ohne Spur.

**Gelöst mit einer eigenen Zeile „Gesetzt · Unterkategorien"** über der
Auswahl: was gesetzt ist, steht da und lässt sich entfernen. Ein Test
hält es fest. `[read]` Gefunden wurde es nur, weil die Testdaten im
Browser nachgezählt wurden — „Kekse" fehlte in der Trefferliste.

### C-93 wurde mitten im Auftrag fertig

`[cmd]` Beim Messen gab es **keine** Preset-Tabelle; die Kachel bekam
einen Leerzustand mit dem Hinweis, dass die Voreinstellungen entstehen.
`[read]` **Tom dazu:** *„Der Hinweis nennt die Sache, nicht die
Punktnummer — der Nutzer liest keine TODO-Liste."*

`[cmd]` Vor dem Bericht lag `nutrition.exclusion_presets` mit **elf
Presets** vor. **Die Kachel bietet sie jetzt an**, in zwei Gruppen
(persönlich, religiös), und **der Leerzustand bleibt als Rückfall.**

`[read]` **Der Vorbehalt kommt aus der Spalte, nicht aus dem Code:**
`caveat_de` sagt bei Halal wörtlich *„Echtes Halal haengt an der
Schlachtung — die BLS-Daten kennen sie nicht."* Genau der Satz, den der
Auftrag sichtbar haben will — und er steht damit an **einer** Stelle
statt an zweien.

---

## 7. Nachweis

### Angemeldet, beide Modi

`[cmd]` Als `dev@lumeos.app`, 1440 × 1100, hell und dunkel: alle sieben
Kacheln mit den Testdaten, keine Attrappenmarke.

### Zeilenschutz

`[cmd]` Als `test-user@lumeos.local` im Browser: Zähler
**`0 💚 · 0 ❌ · 0 ausgeschlossen`**, kein Allergen gesetzt, keine
Ausschlüsse, keine Ernährungsform — **aber die Kataloge laden**
(13 Kategorien, 14 Merkmale, 11 Presets).

`[cmd]` **An der Datenbank gegengeprüft:**

| Rolle `authenticated`, `sub` = | Grundzeilen | Items | Kategorien | Tags |
|---|---|---|---|---|
| `dev@lumeos.app` | 1 | 3 | 518 | 14 |
| `test-user@lumeos.local` | **0** | **0** | **518** | **14** |

`[cmd]` **Und der Quergriff:** test-user ruft `food_preferences_read`
mit der Nutzer-Id von dev → **0 Items.** Ein leeres Ergebnis allein
könnte heissen, dass jemand nichts eingestellt hat; diese Zeile zeigt,
dass die Regel fremde Zeilen sperrt.

### Breiten und Konsole

`[cmd]` Seitenüberlauf bei **375 · 768 · 1024 · 1440 px: keiner.**

`[cmd]` **Ein Konsolenfehler, nicht von hier:** `Warning: Extra
attributes from the server: data-mode` — dieselbe Meldung auf
`/v2/medical` und `/v2/nutrition`, Bestand aus dem Themenumschalter in
`RootLayout` (in G-69 als repoweit belegt). Nicht angefasst.

### Gate und Tests

| | |
|---|---|
| `tsc --noEmit` `[cmd]` | **grün** |
| Alle Tests `[cmd]` | **351 von 351** (vorher 337) |
| Neu `[cmd]` | **8** in `vorlieben-tab.test.ts` |

**`pnpm gate` meldet einen Fehler, der nicht von diesem Auftrag
stammt:** `[cmd]` `tab-foods.tsx` verweist auf `Daumen` und
`DaumenKnoepfe` — die Dateien `daumen.tsx` und `daumen-aktion.ts` liegen
neu daneben. **Das ist G-67, mitten im Bau.** Gegenprobe: mit dieser
einen Datei beiseite ist der Typecheck **grün**; in meinen Dateien
meldet er null Fehler.

**Acht neue Prüfungen**, jede hält eine Entscheidung fest:

1. *„20 Einträge in drei Stufen"* — samt Milcheiweiß/Laktose getrennt.
2. *„gesetzte Unterkategorien bleiben sichtbar"* — der Löschfall.
3. *„immer vollständig geschrieben"* — kein zweiter Schreibweg.
4. *„der Lesepfad baut die Funktion nicht nach"*.
5. *„die Rangfolge verspricht keine Wirkung"*.
6. *„der Schlachtungs-Vorbehalt steht in der Anzeige"*.
7. *„die Ausschlusskachel erfindet keinen Katalog"* — Presets gelesen,
   nicht verdrahtet; `ultra_processed` bleibt sichtbar.
8. *„die angebundene Kachel trägt keine Attrappenmarke"*.

### Eine Anmerkung zu fremden Testdaten

`[cmd]` Während des Auftrags kamen **drei Food-Items** dazu (Hafer
Flocken, Reis poliert, Walnuss, alle 02:58) — das ist der
G-67-Agent, der Daumen im Food-DB-Tab prüft. **Nicht entfernt:** das
ist lebender Teststand eines anderen Auftrags. Meine eigenen
Schreibnachweise sind zurückgebaut.

---

## 8. Was als Nächstes ansteht

1. **C-94: die Suche an die Vorlieben hängen** — die Rangfolge ist
   hinterlegt und wirkungslos, `search_application` liegt fertig vor.
2. **Entscheiden, ob Ausschlüsse als Item oder als Spalte gelten** (5) —
   `general_exclusions[]` und `exclusion_preset_code` sind zwei Wege zum
   selben Ziel.
3. **Über die acht wirkungslosen Spalten reden** (4) — Kochlevel, Zeit,
   Budget, Mahlzeiten, Küchen: gespeichert, ohne Kachel, ohne Wirkung.
4. **Unterkategorien auswählbar machen** — heute nur über die Suche.
5. **`tag_type` zum Gruppieren nutzen** — 14 Merkmale in drei Arten.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| 14 + 13 Spalten in den zwei Tabellen | `information_schema.columns` |
| Sechs Zielarten, genau eine je Zeile | `pg_get_constraintdef`, `food_preference_items_exactly_one_target` |
| Testdaten vollständig | `SELECT * FROM nutrition.food_preferences` + Browser |
| 518 Kategorien, 13 Wurzeln | `count(*)` mit `parent_id IS NULL` |
| 14 Tags, Spalte heisst `tag_type` | `information_schema.columns` + `SELECT` |
| 11 Presets in zwei Arten | `SELECT code, kind FROM nutrition.exclusion_presets` |
| `caveat_de` trägt den Schlachtungssatz | `SELECT caveat_de WHERE code='halal'` |
| „Kekse & Plätzchen" ist ein Enkel | `SELECT parent_id`-Kette |
| `food_search` ohne Nutzerparameter | `pg_get_function_arguments` |
| Schreiben funktioniert und hält | drei Klicks, jeweils SQL davor und danach |
| Zeilenschutz | `SET LOCAL ROLE authenticated` mit zwei `sub`-Werten + Quergriff + Browser |
| Kein Seitenüberlauf 375–1440 | `scrollWidth > clientWidth` je Breite |
| Der Gate-Fehler ist G-67 | Typecheck mit und ohne `tab-foods.tsx` |
| Tests | 351/351, davon 8 neu |
