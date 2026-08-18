# 116 — Food-DB: das Mockup an die Daten gebunden (G-66)

Stand: 2026-08-18 · Anker: Zweig `dev` · Auftrag G-66
Herkunft: gebaut und am Bildschirm geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

`[cmd]` **Der Tab hatte keine Form:** ein Satz („Die Suche steht als
eigene Seite") und ein Link. **Jetzt hat er die Form des Entwurfs mit
7.140 echten Lebensmitteln** — Suchfeld, Kategorie-Pillen, Tabelle mit
kcal, P, C, F.

**Die Suchseite `/v2/nutrition/suche` bleibt.** Begründung unten.

---

## Welche Pille woher kommt

`[cmd]` Der Entwurf (`module-nutrition.jsx:556`) zeigt **zehn**:
*All · Favorites · Recent · Meat · Fish · Grains · Dairy · Produce ·
Beverages · Supplements*.

**Sieben davon tragen, drei nicht:**

| Pille des Entwurfs | Quelle | Trägt? |
|---|---|---|
| **All** | keine Einschränkung | ✓ 7.140 |
| **Meat** | `fleisch-gefluegel` | ✓ 1.449 |
| **Fish** | `fisch-meeresfruechte` | ✓ 520 |
| **Grains** | `getreide-brot-pasta` | ✓ 883 |
| **Dairy** | `milch-kaese` | ✓ 279 |
| **Produce** | `gemuese` | ✓ 717 |
| **Beverages** | `getraenke` | ✓ 119 |
| **Favorites** | `food_preference_items` | ✗ **C-94**, ausdrücklich nicht dieser Auftrag |
| **Recent** | `meal_items` (Protokoll) | ✗ keine Kategorie, sondern Verlauf |
| **Supplements** | — | ✗ **hat keine Entsprechung** |

`[read]` **`Favorites` und `Recent` sind gar keine Kategorien.** Sie
filtern nach Person und Verlauf, nicht nach Warengruppe. `[cmd]`
`food_preference_items` führt derzeit **6 Einträge** (2 `liked`, 2
`disliked`, 2 `hard_exclude`) — und das Anwenden der Preferences ist
C-94. `[cmd]` `meal_items` führt 2.099 Positionen über **20
verschiedene Lebensmittel**; daraus liesse sich „Recent" bauen, sobald
jemand es will.

`[read]` **`Supplements` gehört nicht hierher.** Der BLS ist ein
Lebensmittelschlüssel und führt keine Nahrungsergänzung — das ist das
Supplements-Modul mit eigenem Katalog (44 Einträge, C-68). Eine Pille,
die immer 0 zeigt, wäre schlechter als keine.

### Was stattdessen dasteht

`[read]` **Sechs weitere Wurzeln, statt drei Pillen ohne Inhalt.** Die
Kategorien liegen vor und der Entwurf zeigt nur einen Ausschnitt:

| zusätzlich | Lebensmittel |
|---|---|
| Fruit (`obst`) | 275 |
| Eggs (`eier`) | 104 |
| Fats & oils (`fette-oele`) | 65 |
| Sweets (`suesses-snacks`) | 253 |
| Legumes & nuts (`huelsenfruechte-nuesse-samen`) | 142 |
| Spices (`wuerzmittel-gewuerze`) | 97 |

`[read]` **`Produce` deckt im Entwurf zwei Wurzeln** — Gemüse und Obst
liegen getrennt vor. Sie zusammenzuwerfen hiesse, eine vorhandene
Trennung aufzugeben; deshalb steht `Fruit` daneben.

`[cmd]` **Eine Wurzel bleibt aussen vor:**
`fertiggerichte-zubereitungen` hat **0 Lebensmittel** — sie ist für
`is_prepared_dish` gedacht und noch leer.

---

## Was echt wurde

`[cmd]` **Ein Tab, 2 Kacheln, 0 Attrappenmarken.** Je Tab gezählt als
`dev@lumeos.app`:

| Tab | Karten | Marken |
|---|---|---|
| **Food DB** | 2 | **0** ← |
| Nutrients | 13 | 0 |
| Diary | 18 | 6 |
| Insights | 4 | 3 |
| Meal plans | 6 | 5 |
| Preferences | 7 | 6 |
| Planner | 2 | 1 |

`[read]` **Die ehrliche Zahl ist nicht „eine Kachel verliert die
Marke".** Der Tab trug vorher **keine** Marke — er war kein Mockup,
sondern ein Verweis. **Was er gewinnt, ist die Form:** aus einem Satz
werden 13 Pillen und eine Tabelle mit 50 Zeilen aus 7.140.

### Jede Pille zählt richtig

`[cmd]` Im Browser geklickt, gegen SQL geprüft — **9 von 9**:

| Pille | Anzeige | SQL | |
|---|---|---|---|
| All | 7.140 | 7.140 | ✓ |
| Meat | 1.449 | 1.449 | ✓ |
| Fish | 520 | 520 | ✓ |
| Grains | 883 | 883 | ✓ |
| Dairy | 279 | 279 | ✓ |
| Produce | 717 | 717 | ✓ |
| Fruit | 275 | 275 | ✓ |
| Beverages | 119 | 119 | ✓ |
| Eggs | 104 | 104 | ✓ |

### Die Suche, im Browser gemessen

`[cmd]` Nicht nur in SQL:

| Suche | Treffer | Dauer |
|---|---|---|
| (leer, alle) | 7.140 | **289 ms** |
| `hafer` | 40 | **199 ms** |
| `milch` | 261 | **208 ms** |
| `huhn` | 136 | **304 ms** |

`[read]` **Der Vergleich aus dem Auftrag:** Übungen 142–172 ms über
1.416, Biomarker 130–160 ms über 11.676. **Die Lebensmittelsuche liegt
darüber** — sie liefert aber auch mehr: Makros je Zeile, Facetten und
die Synonymauflösung.

`[cmd]` **In SQL gemessen, zur Einordnung:** die RPC allein braucht
**118 ms** für `hafer`, **255 ms** ohne Filter und **495 ms** für einen
Kategoriefilter. **Der Kategoriefilter ist der langsamste Pfad**, nicht
die Textsuche. `[annahme]` Das liegt vermutlich am rekursiven
Kategorienbaum; **gemessen ist der Wert, nicht die Ursache.**

### Ein Zahlenunterschied, der keiner ist

`[cmd]` `huhn` zeigt **136** im Browser, aber **31** in einer naiven
SQL-Abfrage. **Die 136 sind richtig.**

`[cmd]` Der Grund steht in `nutrition.search_synonyms`:
`huhn → {haehnchen}`. Die Oberfläche baut daraus eine Suchgruppe, und
mit `p_token_groups := '[["huhn","haehnchen"]]'` liefert dieselbe RPC
**exakt 136**.

`[read]` **Das ist kein Fehler, sondern die eingebaute
Synonymauflösung** — dieselbe, die laut Kommentar in `food-search.ts`
aus „huehnerbrust" 31 Treffer statt 0 macht. **Meine erste SQL-Probe
war die naive Vergleichszahl, nicht die Anwendung.**

`[cmd]` **Gegenprobe im Protokoll:** `nutrition.search_events` hat die
Suchen des Tabs mitgeschrieben — `huhn 136`, `milch 261`. Der Tab teilt
sich also wirklich die Datenschicht, statt eine eigene zu haben.

---

## Was die Daten nicht hergeben

### `processing_level` ist konstant

`[cmd]` **Auf allen 7.140 Zeilen `raw`** — ein einziger Wert. **Als
Filter wertlos**, genau wie `sort_weight` bei den Übungen (G-64).

`[read]` **Nicht abgeleitet, wie der Auftrag verlangt.** Die Tags
`whole_food` (2.884) und `ultra_processed` (927) decken einen Teil
davon ab — zusammen 3.811 von 7.140, also gut die Hälfte. **Sie sind
aber eine andere Aussage** und ersetzen die Verarbeitungsstufe nicht.

### Die Tag-Zahlen weichen vom Auftrag ab

`[cmd]` Der Auftrag nennt **14 Tags**. **Zugeordnet sind 11:**

| Tag | Zuordnungen |
|---|---|
| `low_carb` | 4.659 |
| `whole_food` | 2.884 |
| `low_fat` | 2.648 |
| `vegetarian` | 1.751 |
| `high_protein` | 1.400 |
| `vegan` | 1.377 |
| `contains_lactose` | 1.021 |
| `ultra_processed` | 927 |
| `contains_gluten` | 622 |
| `high_fiber` | 558 |
| `contains_nuts` | 120 |

**Summe: 17.967** — das trifft die Zahl des Auftrags genau.
`[cmd]` **`thai_food` kommt in `food_tags` nicht vor**, ebenso wenig
zwei weitere der 14 Definitionen. **Die Definition existiert, die
Zuordnung nicht.**

`[read]` **Die Tags sind im Tab nicht als Filter gebaut.** Der Entwurf
zeigt an dieser Stelle Kategorien, keine Tags; die Tag-Facetten sind
auf `/v2/nutrition/suche` vorhanden. **Nicht ergänzt — der Entwurf ist
die Vorgabe.**

### Die Stern-Spalte bleibt leer

`[cmd]` Der Entwurf führt eine erste Spalte mit einem Lesezeichen für
`fav`. **Sie steht, ist aber leer:** der Daumen ist G-67, die
Preferences sind C-94. `[read]` Die Spalte bleibt in der Tabelle,
damit die Form stimmt, wenn sie gefüllt wird.

### `Filters` und `Custom food` führen ins Leere

`[cmd]` Beide sind `InEntwicklungKnopf`. `[read]` **`Filters` bewusst:**
die Facetten (Zubereitung, Gruppen, Tags) sind auf der Suchseite
gebaut. Ein zweiter Satz Filter im Tab wäre eine zweite Wahrheit über
dieselben Daten. **`Custom food` schreibt** — `foods_custom` existiert
(G-71), aber der Schreibpfad ist ein eigener Auftrag.

---

## Was mit den 2.237 ohne Kategorie geschieht

`[cmd]` **2.237 von 7.140 haben kein `category_id`** — 31,3 %. Die
übrigen 4.903 verteilen sich auf 13 Wurzeln.

**Sie verschwinden nicht.** `[cmd]` Nachgeprüft: die Pille **All**
zeigt **7.140**, nicht 4.903. Ohne Kategoriefilter liefert die Suche
alle Zeilen; die 2.237 sind über Suche und `All` erreichbar, **nur
nicht über eine Pille.**

`[read]` **Keine Kategorie erfunden**, wie der Auftrag verlangt. Drei
Wege wären denkbar, alle drei sind Produktentscheidungen:

1. **Aus dem BLS-Code ableiten.** `[read]` Der erste Buchstabe
   bezeichnet die Warengruppe (`44-bls-codestruktur.md`), und
   `food_groups` führt genau diese 19 Codes mit deutschen
   Bezeichnungen. **Das wäre die naheliegendste Zuordnung** — aber
   `48-artengruppierung-messung.md` und `49-zubereitungsschluessel.md`
   haben zweimal gemessen, dass Ableitungen aus dem Code **fallen**
   (39 von 100, dann 47 von 100). **Ohne Messung nicht anfassen.**
2. **Eine Pille „Ohne Kategorie" zeigen.** Ehrlich, aber sie zeigt
   2.237 Zeilen ohne gemeinsames Merkmal — als Einstieg wertlos.
3. **So lassen.** Sie sind über Suche und `All` erreichbar; wer
   „Kartoffel" tippt, findet sie unabhängig von der Kategorie.

**Gebaut ist Weg 3** — der einzige, der nichts behauptet.

`[cmd]` **Der Zusammenhang zu `food_groups` fehlt strukturell:** die 19
Gruppen tragen `code`, `label_de`, `ist_gericht`, aber **keinen
Fremdschlüssel zu `food_categories`.** Die Verbindung steht nur als
Prosa im Feld `bls_hint` (*„BLS prefixes U,V,W"*). `[read]` **Wer die
2.237 zuordnen will, muss diese Brücke zuerst bauen** — sonst gibt es
zwei Kategoriesysteme nebeneinander.

---

## Warum die Suchseite bleibt

**Der Tab bettet sie nicht ein und ersetzt sie nicht — er verlinkt
sie.** Drei Gründe, in dieser Reihenfolge:

1. `[cmd]` **Sie trägt mehr als eine Tabelle.** `/v2/nutrition/suche`
   hat die Detailansicht mit Nährwertreitern (138 Nährstoffe),
   Portionen und der Zerlegungsanzeige. Das ist eine Arbeitsfläche,
   kein Tab-Inhalt.
2. `[read]` **Der Entwurf zeigt eine Übersicht, keine Detailseite.**
   Zwölf Zeilen mit sechs Spalten — genau das ist jetzt gebaut. Die
   Detailansicht in einen Tab zu quetschen hiesse, den Entwurf zu
   überschreiben.
3. `[cmd]` **Die Datenschicht ist geteilt, nicht kopiert.** Beide rufen
   `/api/nutrition/foods` auf; dort sitzen `getLocalFoodSearch` und
   `recordFoodSearchEvent` in einem Aufruf. **Belegt:** die Suchen aus
   dem Tab stehen in `nutrition.search_events`.

`[read]` **Deshalb steht im Tab ein Verweis** („Detailsuche mit
Nährwerten →"), und `Add` führt auf `/v2/nutrition/suche?food=<id>` —
dorthin, wo das Erfassen gebaut ist.

---

## Was aus G-64 mitgenommen wurde

`[cmd]` **Die 1.000-Zeilen-Grenze trifft hier nicht**, weil nicht im
Speicher gezählt wird: die RPC liefert `total` aus der Datenbank.
Gegenprobe: `All` zeigt 7.140, also mehr als 1.000.

`[cmd]` **`.in()` mit vielen IDs kommt nicht vor** — gefiltert wird
über `p_category_slug` in der RPC, nicht über eine ID-Liste.

`[cmd]` **Abfragefehler werfen.** `getLocalFoodSearch` wirft
`LocalFoodSearchError` statt eine leere Liste zurückzugeben; der Tab
zeigt den Fehler in einer eigenen Kachel. **Das war schon so gebaut** —
nichts daran geändert.

---

## Nachweise

`[cmd]` Am Bildschirm geprüft, 2026-08-18:

| Prüfung | Ergebnis |
|---|---|
| **Angemeldet als `dev@lumeos.app`** | `[cmd]` ja — Bildschirmfoto, Konto unten links |
| Treffer ohne Filter | `[cmd]` **7.140**, 50 Zeilen gezeigt |
| **Jede Pille** | `[cmd]` **9 von 9** gegen SQL richtig |
| Suche im Browser | `[cmd]` **199–304 ms** |
| Suchprotokoll | `[cmd]` `search_events` schreibt mit (`huhn 136`, `milch 261`) |
| **Kacheln ohne Marke** | `[cmd]` **2 von 2** im Tab — er trug vorher keine, gewinnt aber die Form |
| Konsolenfehler | `[cmd]` **0** |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — 0 Karten mit Überlauf, kein Seitenüberlauf; bei 375 px scrollt die Tabelle in ihrer Hülle |
| Hell und dunkel | `[cmd]` beide geprüft |

### Bildschirmfotos

| Datei | Inhalt |
|---|---|
| `g66-foods-hell-1440.png` | der gebaute Tab, hell |
| `g66-foods-dunkel-{1440,1024,768,375}.png` | dunkel, vier Breiten |

### Was dieser Auftrag NICHT getan hat

- **Kein Daumen, keine Bewertung** (G-67), **die Preferences nicht
  angewendet** (C-94).
- **Keine Kategorie erfunden** für die 2.237 ohne.
- **`processing_level` nicht abgeleitet.**
- **`packages/ui` nicht angefasst.** `[read]` Es fehlte nichts —
  `Pill`, `Card` und `InEntwicklungKnopf` tragen den Tab.
- **Kein Schema geändert**, keine Tags ergänzt, `/v2/nutrition/suche`
  unverändert.

### Geänderte Dateien

| Datei | Was |
|---|---|
| `v2/nutrition/tab-foods.tsx` | **neu** — der Tab |
| `v2/nutrition/ansicht.tsx` | Weiche auf den neuen Tab statt Satz und Link |
| `v2/nutrition/page.tsx` | lädt die erste Trefferseite, nur wenn der Tab gezeigt wird |

`[cmd]` Messskripte unter `tools/g66-*` (`.sql`) — **nur lesend**,
gehören vor dem Commit entfernt.

**Nichts ist committet oder gestaged.**
