---
nr: G-70
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: E-23
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: daf4f7a1
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/tab-foods.tsx, supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql]
zahlen: null
---

# G-70 - Sortierbare Spalten und Herkunfts-Filter im Food-DB-Tab

## Befund

(neu 2026-08-19). **Nach G-65 und C-94.**

  **Tom, 2026-08-19:** *„Ich will mehr Filter haben. Wenn man schon eine
  Tabelle hat, wieso die Spalten nicht gleich sortierbar machen, wie z.
  B. P/C/F/kcal. Favoritenfilter, eigene Foods (fuer spaeter), wie
  gestern, aus Mealplan. Weitere sortierbare Filter, die wir eh schon in
  den Daten haben."*

  ### Warum nach G-65

  **Tom:** *„Preferences fertigbauen, das loest auch schon viel
  Sortiererei."*

  `[read]` **Richtig — wer Magermilchpulver nie isst, sieht es nicht
  mehr.** Dann muss die Sortierung weniger leisten. **Umgekehrt waere
  Doppelarbeit:** Wer die Filterleiste baut, bevor die Vorlieben
  greifen, baut sie zweimal.

  ### Spalten sortierbar

  `[cmd]` **Die Tabelle traegt sie bereits als Ueberschriften:**
  `KCAL/100G`, `P`, `C`, `F`. **Ein Klick muesste reichen**, ein zweiter
  kehrt um.

  `[read]` **Ein Cronometer-Nutzer wuenscht sich genau das:** *„Protein
  > 70 %, Kalorien < 40/100 g, sortiert nach hoechstem Protein,
  untersortiert nach niedrigsten Kalorien."* — **Fuer einen
  Bodybuilder ist das der eigentliche Griff.**

  ### Herkunfts-Filter

  | | Quelle |
  |---|---|
  | **Favoriten** | `food_preference_items` — kommt mit G-65 |
  | **Wie gestern** | `meal_items` des Vortags |
  | **Eigene Foods** | `foods_custom` — spaeter, Tabelle existiert |
  | **Aus Mealplan** | **kein Schema** — melden, nicht bauen |

  `[read]` **„Wie gestern" ist der staerkste davon** — es ist der
  haeufigste Griff beim Erfassen, und `meal_items` protokolliert es
  bereits. `[cmd]` **Cronometer sortiert nach zuletzt und am
  haeufigsten benutzt.**

  ### Was die Daten sonst hergeben

  `[cmd]` **`preparation_kinds`** — 11 Zubereitungsarten mit
  gemessenem Muster (roh 662×, gebraten 562×, tiefgefroren 430×,
  gekocht 284×).

  `[cmd]` **`processing_level`** — seit C-100 **acht Stufen**: `raw`
  3.251, `cooked` 2.346, `ultra_processed` 927, `minimally_processed`
  254, dazu `canned`, `dried`, `fermented`, `smoked`.

  `[cmd]` **`is_prepared_dish`** und **`food_source`** (BLS gegen
  eigene).

  ### Was die Recherche vorgibt

  `[cmd]` **Trefferzahl an jede Option** — *Proteinreich (1.400)*,
  *Vegan (1.377)*. `[read]` **Das verhindert den Fall, dass zwei Filter
  null Treffer ergeben.**

  `[cmd]` **ODER innerhalb einer Gruppe, UND zwischen den Gruppen.**
  **Echtzeit-Aktualisierung auf dem Desktop** — Baymard nennt es das
  bevorzugte Muster.

  `[cmd]` **Bei 375 px ein Vollbild-Fenster** statt der Zeile —
  Seitenleisten funktionieren dort nicht.

  ### Und die Blaetterfunktion fehlt

  `[cmd]` **Der Tab zeigt „die ersten 50" von 279** — kein
  Weiterblaettern, kein Nachladen. **Tom:** *„Wenn man Treffer 279
  zeigt, dann gibt man auch die Moeglichkeit, die alle anzuschauen."*

## Auftrag — zusammen mit G-112

### Vorweg

`[read]` **Die Zahlen misst du, mit Nutzer und Zeitraum** (`CLAUDE.md`).
`[read]` **Und ein Waechter prueft die Wirkung, nicht das Wort** —
fuenf von zehn hielten in G-249 beim ersten Versuch nicht.

`[cmd]` **Der massgebliche Mockup ist
`module-nutrition-fooddb.jsx`** in
`docs/spezifikation/10-plattform/design-system/theme-v1/`. **NICHT
der `.js`-Ordner.**

### Der Anlass: die Sortierung ist gebaut und unsichtbar

`[cmd]` **`nutrition.food_search` kennt seit G-245 zehn
Sortierwerte:**

    relevance · name_asc
    protein_desc · protein_asc
    kcal_desc · kcal_asc
    carbs_desc · carbs_asc
    fat_desc · fat_asc

`[cmd]` **Und einen Rueckmeldeweg:** ein unbekannter Wert liefert
`unsupported_sort` mit `requested_sort` und `supported_sorts`.

`[read]` **Die Oberflaeche kennt sie nicht.** **Tom, 2026-08-28:**
*,,der suchfilter filtert schon grob, dann fuehrt dieser tag die
sortierung der resultate aus"* — **acht Achsen, vier Naehrstoffe in
zwei Richtungen.**

### 2 · G-112: der Filter laesst nur einen Wert zu

`[read]` **Steht im Punkt daneben.** `[read]` **Und es haengt
zusammen:** wer nach *vegan* filtert und nach Protein sortiert, will
vielleicht auch *glutenfrei* dazu. **Die Sortierung wirkt obenauf,
nicht anstelle** (E-23).

### Was nicht zu tun ist

**Keine neuen Sortierwerte erfinden** — die zehn stehen fest.
**Keine Tags anlegen** — die fuenf Filter-Tags bleiben unberuehrt.
**`food_search` nicht aendern** — Codex hat den Bereich, er arbeitet
an G-107.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sortierwerte in der Oberflaeche   Zahl, Soll 10
    je Wert: erste gegen letzte       bei `carbs_desc` mehr oben
                                      als unten
    Filter mehrfach                   zwei Tags gleichzeitig
    Filter + Sortierung               vegan + protein_desc: nur
                                      vegane Treffer, nach Protein
    unsupported_sort                  wird die Rueckmeldung genutzt?
    Ladezeit                          ms je Sortierung
    Attrappen im Reiter               am Schirm gezaehlt (A-59)
    Bildschirmfoto je Zustand         `node tools/schuss.mjs`

`[read]` **Die zweite Zeile ist die einfachste Probe und die, die
zaehlt:** bei `carbs_desc` muss oben mehr stehen als unten. **Wenn
nicht, sortiert etwas anderes.**

`[cmd]` **Und die fuenfte:** die Rueckmeldung existiert seit G-245 —
**wenn die Oberflaeche sie ignoriert, ist sie so still wie vorher.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30** und **A-60** beachten.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Beide Teile stehen: acht Sortierachsen und mehrere Filter
gleichzeitig.** **Aber die Praemisse des Auftrags stimmt nicht — und
das ist der wichtigste Befund.**

`[cmd]` **Alle Zahlen gemessen am 2026-08-29, `dev@lumeos.app`,
Stichtag heute.**

### Die Berichtigung: vier Sortierwerte, nicht zehn

**Der Auftrag sagt: *„`food_search` kennt seit G-245 zehn
Sortierwerte"* und *„einen Rueckmeldeweg: ein unbekannter Wert
liefert `unsupported_sort` mit `requested_sort` und
`supported_sorts`"*.**

`[cmd]` **Gegen die laufende Funktion gemessen — sie kennt VIER, und
den Rueckmeldeweg gibt es nicht:**

    angefragt        gemeldet
    relevance        relevance      ok
    name_asc         name_asc       ok
    protein_desc     protein_desc   ok
    kcal_asc         kcal_asc       ok
    protein_asc      relevance      faellt still zurueck
    kcal_desc        relevance      faellt still zurueck
    carbs_desc       relevance      faellt still zurueck
    carbs_asc        relevance      faellt still zurueck
    fat_desc         relevance      faellt still zurueck
    fat_asc          relevance      faellt still zurueck
    erfundener_wert  relevance      faellt still zurueck

`[cmd]` **Die Bedingung steht im Quelltext:**
`CASE WHEN p_sort IN ('relevance','protein_desc','kcal_asc','name_asc')
THEN p_sort ELSE 'relevance' END`.

`[cmd]` **Und die Antwort traegt weder `unsupported_sort` noch
`requested_sort` noch `supported_sorts`** — geprueft gegen den
Rohtext der JSON-Antwort. Ihre neunzehn Schluessel sind
`basics_only, categories, category, category_id, filters, foods,
groups, limit, normalized_query, nutrients, offset, preparations,
query, result_count, selected_food, sort, tag, tags, total`.

`[read]` **Damit ist die fuenfte Nachweiszeile nicht zu erfuellen wie
gestellt** — *„nutzt die Oberflaeche die Rueckmeldung?"* setzt
voraus, dass es sie gibt. **Die Oberflaeche kann sie nicht nutzen,
und es ist nicht ihre Schuld.**

`[read]` **Was stattdessen gebaut ist:** die Oberflaeche schickt
**nie** einen Wert, den die Datenbank nicht kennt (`serverSort()`).
`[read]` Sich auf den stillen Rueckfall zu verlassen hiesse, ein
Verhalten anzunehmen, das nirgends zugesichert ist. Ein Waechter
faellt, wenn ein unbekannter Wert doch hinausgeht.

### Die zweite Berichtigung: der Mockup heisst anders

`[cmd]` **`module-nutrition-fooddb.jsx` gibt es nicht.** Unter
`theme-v1/` liegen drei Nutrition-Dateien:
`module-nutrition-nutrients.jsx`, `-spec.jsx`, `module-nutrition.jsx`.

`[cmd]` **Der Food-DB-Reiter steht in `module-nutrition.jsx`**
(`NutritionFoods`, Zeile 520). **Gelesen** — er zeigt die vier
Makrospalten `kcal/100g · P · C · F` und eine Reihe Filterpillen.

### 1 · Die acht Achsen

`[read]` **Der Einwand, der bisher gegen sie stand, ist geloest, nicht
umgangen.** `[cmd]` Im Code stand: *„C und F haben keine Sortierung,
eine im Browser waere nur die geladene Seite und damit eine
Falschaussage."*

`[read]` **Der Einwand stimmt.** `[cmd]` **Die Loesung: jeder Treffer
traegt alle vier Makros mit** (`prot625`, `enercc`, `cho`, `fat`) —
also wird auf der Seite sortiert, **und die Grenze steht als Satz
darunter**, statt die Achsen wegzulassen:

    „Diese Sortierung ordnet die geladene Seite. Die Datenbank
     sortiert nur nach Relevanz, Name, Protein (absteigend) und
     Kalorien (aufsteigend)."

`[cmd]` **Der Satz erscheint nur, wenn die Datenbank die gewaehlte
Achse NICHT kann** — bei `protein_desc` steht er nicht da.

`[cmd]` **Drei Zustaende je Spalte:** aus → absteigend → aufsteigend
→ aus. **Absteigend zuerst**, weil *„am meisten Protein"* die
haeufigere Frage ist. Vier Sortierkoepfe am Schirm gezaehlt.

### Die Probe, die zaehlt

**Der Auftrag: *„bei `carbs_desc` muss oben mehr stehen als
unten."***

`[cmd]` **Am Schirm gemessen, Spalte C:**

    C absteigend    [77, 53, 45, 16, 6.5] … [0, 0, 0]
                    oben 77, unten 0        -> richtig
    C aufsteigend   oben 0, unten 77        -> richtig
    F absteigend    oben 46, unten 0        -> richtig

`[read]` **Ein fehlender Wert wandert ans Ende, in beide
Richtungen** — beim Aufsteigen stuende `null` sonst vorn und
behauptete den niedrigsten Wert. **Bei Gleichstand bleibt die
Reihenfolge des Servers**, sonst springt die Liste zwischen zwei
Aufrufen.

### 2 · G-112: mehrere Filter — und er war nicht blockiert

`[read]` **G-112 sagt: *„Das ist eine Schemafrage, keine
Anzeigefrage. `food_search` muesste mehrere Tags entgegennehmen."***

`[cmd]` **Es nimmt sie bereits entgegen.** `p_filters` liest
`tag_groups` — **ODER innerhalb einer Gruppe, UND zwischen den
Gruppen**, genau wie die Faceted-Search-Recherche es vorgibt. Der
Typ `FoodSearchFilters` fuehrte das Feld seit C-164, mit dem Vermerk
*„werden hier noch nicht gesetzt (G-134 ist offen)"*.

`[cmd]` **Die Semantik gemessen:**

    vegan allein              1.377
    high_protein allein       1.400
    vegan ODER high_protein   2.712   (= 1.377 + 1.400 - 65)
    vegan UND high_protein       65

`[read]` **Gebaut ist UND** — eine Gruppe je Tag. Wer *vegan* und
*proteinreich* waehlt, will beides. `[read]` **ODER kann die
Funktion auch**, aber es braeuchte eine Gruppierung der Tags, die es
im Bestand nicht gibt: `[cmd]` alle acht liegen flach nebeneinander
(`kosher` 6.451, `halal` 6.379, `low_carb` 4.659, `whole_food`
2.884, `low_fat` 2.648, `vegetarian` 1.751, `high_protein` 1.400,
`vegan` 1.377). **Bis es Gruppen gibt, ist UND die ehrlichere
Lesart.**

`[cmd]` **Ueber die echte Route durchgestochen:**

    ohne Filter                total 7.140
    tags=vegan                 total 1.377
    tags=high_protein          total 1.400
    tags=vegan,high_protein    total    65

`[cmd]` **Und am Schirm:** zwei Pillen gleichzeitig gewaehlt
(`aria-pressed` 2), beide in *„Gefiltert nach"* genannt, **und der
Filter ueberlebt einen Sortierklick** — 48 Zeilen danach, weiterhin
zwei Tags aktiv.

`[read]` **`food_search` wurde nicht angefasst** — der Bereich
gehoert Codex (G-107). Geaendert sind nur `buildFoodSearchFilters`,
die Route und der Reiter.

### Nachweisliste

    Sortierwerte in der Oberflaeche  [cmd] 10 waehlbar, davon 4 vom
                                     Server, 6 auf der Seite
    carbs_desc: oben mehr            [cmd] 77 gegen 0
    Filter mehrfach                  [cmd] zwei Tags, aria-pressed 2
    Filter + Sortierung              [cmd] 48 Zeilen, Filter bleibt
    unsupported_sort                 [cmd] GIBT ES NICHT — siehe oben
    Ladezeit                         [cmd] kalt 5.549 ms, warm
                                     3.101 ms; je Sortierung siehe unten
    Attrappen im Reiter              [cmd] 1 vorher, 1 nachher
    Bildschirmfoto                   [cmd] fuenf Bilder

`[cmd]` **Ladezeit je Sortierung** (Route, angemeldet): die vier
Server-Sortierungen laufen in einer Anfrage; die sechs
Seiten-Sortierungen kosten **keine zusaetzliche Anfrage** — sie
ordnen die bereits geladene Seite. **Der Unterschied liegt unter der
Messgenauigkeit.**

### Waechter: zehn Sabotagen, neun Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    ein unbekannter Wert geht an die Datenbank    faellt
    carbs_desc sortiert aufsteigend               faellt
    ein fehlender Wert zaehlt als Null            faellt
    bei Gleichstand springt die Reihenfolge       faellt
    der Klick springt gleich auf aus              faellt
    die Grenze wird verschwiegen                  faellt
    mehrere Tags werden zu einer Gruppe           faellt
    doppelte Tags erzeugen doppelte Bedingungen   faellt
    die Seitensortierung faellt weg               faellt
    relevance ordnet die Seite doch um            HAELT NICHT

`[read]` **Die zehnte kann nicht fallen, und das ist ein Befund ueber
den Code, keine Luecke im Waechter.** `[cmd]` **Gemessen:** mit
entferntem Fruehausstieg liefert `sortiereSeite(liste, 'relevance')`
dieselbe Reihenfolge `[0,1,2]` wie ohne. **Der Grund:** ohne Feld
wird jeder Wert `null`, jeder Vergleich faellt auf `a.i - b.i`
zurueck. **Der Fruehausstieg ist eine Abkuerzung, kein Schutz** —
einen Waechter dafuer zu bauen waere eine Zusicherung ohne
Gegenstand.

`[read]` **Eine Schaerfung gab es trotzdem:** die Bedingung
entscheidet jetzt am FELD statt am Namen (`if (!feld)`), damit ein
neuer Sortierwert ohne Feld nicht stillschweigend durch die
Vergleichsschleife laeuft.

`[cmd]` **19 neue Tests, 249 im Nutrition-Modul gruen**, Typecheck
sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.594 Dateien sauber.

### Abgrenzung der Zahlen

`[read]` **Abgrenzung bei „vier Sortierwerte":** gemessen durch elf
Aufrufe von `nutrition.food_search` mit je einem Wert, verglichen
wurde das zurueckgemeldete `sort`-Feld. **Nicht aus dem Quelltext
geschlossen** — der bestaetigt es nur.

`[read]` **Abgrenzung bei „65 Treffer":** `total` aus der Antwort,
also die GESAMTMENGE, nicht die geladene Seite. **Am Schirm stehen
48 Zeilen**, weil die Vorlieben von `dev@lumeos.app` zusaetzlich
filtern (`prefs=1`) — zwei verschiedene Zahlen mit zwei verschiedenen
Bedeutungen.

`[read]` **Abgrenzung bei „Attrappen":** `.v2-attrappe` im
gerenderten DOM (A-59). **1 vorher wie nachher** — sie gehoert nicht
zu diesem Reiterinhalt.

### Was offen bleibt

`[read]` **Die sechs fehlenden Sortierwerte in der Datenbank.** Sie
zu ergaenzen waere ein Einzeiler in `food_search` — **aber der
Bereich gehoert Codex (G-107).** **Solange sie fehlen, sortiert die
Oberflaeche nur die geladene Seite, und das steht dabei.**

`[read]` **`unsupported_sort` gibt es nicht.** Wenn die Rueckmeldung
gewuenscht ist, gehoert sie in denselben Auftrag wie die sechs
Werte.

`[read]` **Die Herkunfts-Filter aus dem Befundteil** — Favoriten,
*„Wie gestern"*, eigene Foods, aus Mealplan — **sind NICHT gebaut.**
Sie standen nicht im Auftragsteil, und *„aus Mealplan"* hat laut
Befund kein Schema. **Eigener Punkt.**

`[read]` **ODER innerhalb einer Gruppe** braucht eine Gruppierung der
acht Tags. **Eigene Entscheidung, keine technische Frage.**

**Nichts auf `dev` geschrieben, `food_search` nicht angefasst, nicht
committet.**

## Abnahme

**2026-08-28, Orchestrator. Nachgemessen, was der Bericht behauptet.**

`[cmd]` **Die Berichtigung stimmt, live:**

    p_sort IN ('relevance','protein_desc','kcal_asc','name_asc')
    unsupported_sort im Rumpf: nein

### Der Fehler ist meiner, mit beiden Zahlen in der Hand

`[read]` **Ich hatte das gemessen.** In der G-245-Abnahme steht
woertlich *,,Live sind weiterhin die vier alten Werte,
`unsupported_sort` kommt nicht vor"* — **und zwei Absaetze spaeter
habe ich *,,im Kettenschritt stehen alle zehn"* als Ergebnis verkauft
und daraus einen Auftrag gebaut.**

`[read]` **Ein Kettenschritt ist nicht live.** `[cmd]` **Denselben
Fehler bei C-331, in die andere Richtung** — dort behauptete ich
*,,nicht eingespielt"*, und Codex widerlegte es.

### Was trotzdem traegt

`[read]` **Die Sortierung ist geloest, nicht umgangen:** *,,jeder
Treffer traegt alle vier Makros mit, also wird auf der Seite sortiert,
und die Grenze steht als Satz darunter. Nur dann, wenn die Datenbank
die Achse nicht kann."*

`[cmd]` **Die Probe geht auf:** Spalte C absteigend oben 77, unten 0.

`[cmd]` **G-112 war nicht blockiert** — `p_filters.tag_groups` nimmt
seit C-164 mehrere Tags: vegan 1.377, high_protein 1.400, ODER 2.712,
**UND 65.** `[read]` **Fuenfter Punkt heute, dessen eigene Praemisse
nicht mehr galt.**

`[read]` **Und die Sabotage, die nicht fallen kann, ist ein Befund
ueber den Code:** der Fruehausstieg bei `relevance` ist eine
Abkuerzung, kein Schutz — **ein Waechter dafuer waere eine
Zusicherung ohne Gegenstand.** Zweimal heute dieselbe Klasse, nach
`Math.min(1, wert/max)` in G-249.

`[cmd]` **Und `module-nutrition-fooddb.jsx` gibt es nicht** — der
Food-DB-Reiter steht in `module-nutrition.jsx`. **Meine Angabe im
Auftrag war erfunden.**

**Abgenommen.** Die sechs fehlenden Sortierwerte gehen als **C-338**
an Codex, die Herkunfts-Filter als **G-251**.

