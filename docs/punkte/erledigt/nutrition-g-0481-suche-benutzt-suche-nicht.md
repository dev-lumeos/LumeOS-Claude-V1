---
nr: G-481
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-480
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 56a6977a
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/supplement-posten-read.ts
zahlen:
  gemessen: 2026-09-08
  treffer: 1450
---

# G-481 - die Suche benutzt die Suche nicht

## Toms Befund

Tom, 2026-09-08:

> also die suche ist laecherlich, das man nur schon sowas
> liefert ist unterste schublade. whey bringt wohl tausende und
> es werden vielleicht 20 angezeigt, nicht scrollbar und
> vielzuwenig infos dazu. dann keine smartsuche wie whey isolate
> optimum nutrition moeglich, also kurz gesagt irgend ein
> kindergarten modal aber fernab von dem, was ein
> professionelles lumeos haben muss

> wir haben schon gute suchen, bau das vernuenftig und
> anstaendige filter mit gruppentitel und nicht nur irgendwelche
> buttons verteilt

## Gemessen

    1.458 On-Market-Produkte mit "whey"
    1.450 davon untermischbar
       20 gezeigt

`[cmd]` **`supplement-posten-read.ts:77`: `grenze = 20`,
Zeile 102: `.limit(grenze)`.**

`[cmd]` **Und die Begruendung im Code:** *,,`.in()` kippt um
200 Ids (G-64) ? 20 Treffer sind ..."*

`[read]` **Das ist ein Grund fuer die NACHFRAGE, nicht fuer die
Trefferzahl.**

## Was schon da ist und nicht benutzt wird

`[cmd]` **`supplements.search_supplier_products`** ? **C-495
bis C-504:**

    pg_trgm-Smartsuche, "gold standart wey" trifft
    p_query, p_market_status, p_marke, p_limit,
    p_kategorie, p_form, p_allergien_ausblenden,
    p_meidestoffe, p_marken, p_nur_bewertet
    Deckel 500 (G-463), 33,6 ms

`[cmd]` **`supplements.supplier_product_search_meta`** ?
**Gesamtzahl und mitgefilterte Kategorienzahlen (G-463).**

`[cmd]` **`nutrition.food_search`** ? **die Lebensmittelseite.**

`[read]` **Der neue Leseweg ruft keine davon** ? **er macht
`.limit(20)` auf die Tabelle.**

## Und die Filterleiste existiert auch schon

`[cmd]` **`tab-produkte.tsx` traegt `KATEGORIEN`, `FORMEN`,
`MARKEN_PULLDOWN` mit Gruppentiteln (G-453):**

    MARKT               On Market | Off Market | Alle
    KATEGORIE           14 Werte mit Zahlen
    DARREICHUNGSFORM    ohne E-Codes
    MARKE               Eingabefeld + Pulldown

Tom: *,,anstaendige filter mit gruppentitel und nicht nur
irgendwelche buttons verteilt"*

`[read]` **Die Leiste im Produkte-Reiter hat Gruppentitel.
Das Modal hat lose Pillen.**

## Mein Auftragsfehler

`[cmd]` **G-480 sagte *,,food-such-modal.tsx bekommt
Supplemente"*** ? **ohne zu sagen, dass die bestehende
Suchfunktion zu benutzen ist.**

`[read]` **Er hat einen zweiten Leseweg gebaut, und ich habe
ihn abgenommen, weil die Filterpillen stimmten.**

## Abnahmebedingungen

    A1  die Suche ruft search_supplier_products.
        Belegt.
    A2  "whey isolate optimum nutrition" trifft. Foto.
    A3  die Trefferzahl steht: "20 von 1.450" oder
        aehnlich. Foto.
    A4  mehr als 20 erreichbar -- scrollen oder
        nachladen. Foto.
    A5  Filter mit GRUPPENTITELN, wie im
        Produkte-Reiter. Foto.
    A6  je Zeile mehr Infos: Marke, Portion, Form.
        Foto.
    A7  die Lebensmittelseite ruft food_search.
        Belegt.
    A8  Laufzeit gemessen, vorher/nachher.
    A9  vier Module unveraendert.
    A10 apps/web 1876 oder mehr, apps/coach 65.

## Was NICHT zu bauen ist

**Keine neue Suchfunktion** ? **sie existieren.**

**Nichts in `supabase/`** ? **wenn ein Parameter fehlt:
MELDEN.**

## Bericht

**Alle zwoelf Bedingungen erfuellt** (A1-A10 plus die nachgereichten
A11/A12). **Gemessen am 2026-09-18, Dev-Server 3200.**

`[cmd]` **`supabase/` unberuehrt.**

    A1  ruft search_supplier_products             erfuellt
    A2  „whey isolate optimum nutrition" trifft   erfuellt
    A3  „146 von 4.177 Supplementen"              erfuellt
    A4  148 -> 296 Zeilen auf einen Klick         erfuellt
    A5  QUELLE / SORTIERUNG als Gruppentitel      erfuellt
    A6  Marke, Form, Portion je Zeile             erfuellt
    A7  food_search unveraendert gerufen          erfuellt
    A8  Laufzeit vorher/nachher gemessen          gemessen
    A9  vier Module 200, Kachelzahlen gleich      erfuellt
    A10 apps/web 1878/1878, apps/coach 65/65      erfuellt
    A11 Schreibweg ruft die C-519-RPC             erfuellt
    A12 Leseweg nimmt den Verweis                 erfuellt

### A2 — die eine Zahl, die den Auftrag beweist

`[cmd]` **Dieselbe Frage, vorher und nachher:**

    „whey isolate optimum nutrition"
      VORHER      0 Treffer
      NACHHER   146 Treffer, oben die drei richtigen:

        Gold Standard 100% Whey Chocolate
          Optimum Nutrition · Powder · 32 Gram(s) [1 Scoop]
        Gold Standard 100% Whey Chocolate Coconut
          Optimum Nutrition · Powder · 32 Gram(s) [1 Scoop]
        Gold Standard 100% Whey Chocolate Hazelnut
          ON Optimum Nutrition · Powder · 33 Gram(s) [1 Scoop]

`[read]` **Eine `ilike`-Suche kann eine Wortfolge nicht treffen** —
kein Produkt heisst woertlich *,,whey isolate optimum nutrition"*.
`[cmd]` **`pg_trgm` schon**, und die Funktion dafuer lag seit C-495
bereit.

### A1 und A7 — die Suchen, die es schon gab

`[cmd]` **`supplements.search_supplier_products`** — gerufen in
`supplement-posten-read.ts`, mit `p_query`, `p_market_status`,
`p_limit`.

`[cmd]` **`supplements.supplier_product_search_meta`** — liefert
`total_count` (A3).

`[cmd]` **`nutrition.food_search`** — unveraendert ueber
`useFoodSuche`; **die Lebensmittelseite wurde nicht angefasst.**

### A3 und A4 — die zweite Zahl, und der Weg dahinter

`[cmd]` **Gemessen am Schirm:**

    vorher   148 Zeilen   „148 von 2.142 Supplementen"
             Knopf: „Weitere 150 Supplemente laden"
    nachher  296 Zeilen   „296 von 2.142 Supplementen"

`[read]` **Der Knopf nennt die Zahl** — *,,mehr laden"* ohne Angabe
ist eine Zumutung.

`[cmd]` **Die Ladung ist 150, nicht 500.** `[read]` **Das ist keine
Geschmacksfrage:** Form und Portionen werden je Treffer-Id
nachgelesen, und **eine `.in()`-Adresse mit 500 UUIDs waere 18.560
Zeichen lang** — sie kippt um rund 200 Ids (G-64).

`[cmd]` **Der 500er-Deckel der Funktion wird BENANNT** — wer dort
anlangt, sieht einen Satz statt eines verschwundenen Knopfes.

### A5 und A6 — die Leiste und die Zeile

`[cmd]` **Zwei Gruppen mit Titeln, wie im Produkte-Reiter**
(`supplements.css:1950`, G-453): **QUELLE** und **SORTIERUNG**.

`[read]` **G-480 hatte lose Knoepfe nebeneinander** — man sah nicht,
was wozu gehoert. **Genau Toms Beanstandung.**

`[cmd]` **Nachgebaut, nicht importiert:** `supplements.css` wird nur
von `v2/supplements/page.tsx` geladen. `[read]` **Gemeinsame Klassen
gehoerten nach `packages/ui`, und das waere eine Aenderung an allen
Apps** (A9).

`[cmd]` **Je Zeile jetzt:** `Optimum Nutrition · Powder · 32 Gram(s)
[1 Scoop]`. `[read]` **Alle drei Angaben kamen schon aus der
Funktion** — `portionsgroesse` und `portionseinheit` standen in der
Rueckgabe und wurden weggeworfen.

### A8 — die Laufzeit, ehrlich

`[cmd]` **Zweiter Aufruf je Frage** (der erste traegt die
Kompilierung, G-469):

    Frage                              vorher    nachher
    whey                              1.037 ms   1.542 ms
    creatine                            971 ms   1.519 ms
    whey isolate optimum nutrition      108 ms   1.573 ms

`[read]` **Es ist LANGSAMER geworden, und das gehoert gesagt.**

`[cmd]` **Der Grund ist gemessen:** statt einer Abfrage laufen jetzt
vier — Suche, Gesamtzahl, Formen, Portionen.

    search_supplier_products (150)    45 ms
    supplier_product_search_meta     145 ms
    Formen je Id                      37 ms

`[cmd]` **Zwei Paare laufen bereits gleichzeitig** (Suche+Meta,
Formen+Portionen) — **das hat 290 ms gespart** (1.830 -> 1.542).

`[read]` **Was bleibt, ist der Vergleich der Sache:**

    vorher    20 Treffer, keine Gesamtzahl, Wortfolge unmoeglich
    nachher  148 Treffer, Gesamtzahl, Wortfolge trifft

`[read]` **Die 108 ms der dritten Zeile waren kein Tempo, sondern
eine leere Antwort.**

### Was FEHLT — gemeldet, nicht umgangen

**1 — `search_supplier_products` gibt `produktform` nicht zurueck.**

`[cmd]` **Gemessen:** die Funktion liefert `id, marke, name_en,
portionsgroesse, portionseinheit, packungsgroesse, packungseinheit,
market_status, gtin, similarity, meidestoff_treffer`.

`[read]` **Damit laesst sich Toms Formregel nicht auf der Antwort
anwenden.** `[cmd]` **Ersatzweise wird die Form je Treffer-Id
nachgelesen** — eine zusaetzliche Abfrage, 37 ms.

**2 — `p_form` nimmt nur EINEN Wert.**

`[cmd]` **Am Rumpf gemessen:** `AND (v_form IS NULL OR p.produktform
= v_form)`. `[cmd]` **Toms Regel nennt vier Formen.**

`[read]` **Beides zusammen waere in der Datenbank billiger** — ein
`p_formen text[]` und `produktform` in der Rueckgabe wuerden die
Nachlese sparen. `[cmd]` **Das ist ein Datenbankpunkt, nicht
meiner.**

### A11 und A12 — die Verklemmung mit C-519

`[cmd]` **Codex hatte das Einspielen gestoppt**, mit dieser Datei als
Grund. `[cmd]` **Zu Recht:** `supplement-posten-read.ts` schrieb die
vier Spalten, die C-519 entfernt.

**Der Schreibweg** ruft jetzt
`supplements.record_supplier_product_intake(...)` — **sie schreibt
die Einnahme UND den Verweis, und rechnet den Schnappschuss selbst.**

**Der Leseweg** nimmt `supplement_intake_log_id` und die eingebettete
Einnahme.

#### Und der Fehler, den ich dabei selbst gebaut habe

`[cmd]` **Der erste Anlauf hat das Tagebuch abgeschaltet.**
`[cmd]` **Gemessen:** `GET /api/nutrition/diary` antwortete **500**,
*„Could not find a relationship between 'meal_items' and
'intake_logs' in the schema cache"* — **null Mahlzeiten am Schirm.**

`[read]` **Der Grund: C-519 ist NICHT eingespielt.** `[cmd]`
**Gemessen:** die vier alten Spalten stehen noch,
`supplement_intake_log_id` gibt es nicht, und
`record_supplier_product_intake` auch nicht.

`[read]` **Ich habe gegen ein Schema gebaut, das es noch nicht
gibt** — und damit genau den Zustand erzeugt, vor dem Codex gewarnt
hat, nur andersherum.

`[cmd]` **Behoben: BEIDE Wege stehen offen.** **Erst der neue, bei
fehlender Beziehung der alte** — Lesen wie Schreiben. `[read]`
**Damit kann Codex einspielen, ohne dass es ein Fenster gibt, in dem
die Anwendung steht.** `[read]` **Und danach faellt der Rueckfall
weg** — er ist als solcher benannt.

### Ein Fehler aus G-475, der erst jetzt auffiel

`[cmd]` **Beim Pruefen des Rueckfalls wies die Datenbank JEDE
Erfassung des Whey zurueck** — *„C513: supplement nutrient snapshot
differs from its evidenced product serving"*.

`[cmd]` **Am Triggerrumpf gemessen:** das Sollobjekt ist

    jsonb_strip_nulls(jsonb_build_object( ... 'FOL', v_option.fol_ug
      * ... , 'MN', v_option.mn_ug * ... )) || v_generic_nutrients

`[cmd]` **Zwei Dinge fehlten in `supplement-posten-read.ts`:**

    fol_ug -> FOL        stand nie in MIKRO
    nutrients            die freie Spalte wurde nie gelesen

`[cmd]` **Am Whey gemessen:** die Option traegt
`nutrients = {"CHORL": 35}`.

`[read]` **Der Fehler lag seit G-475 da.** **Er faellt nur bei
Produkten auf, die eine der beiden Angaben tragen** — Toms Whey ist
eines davon. `[read]` **G-478 hat ihn nicht bemerkt, weil dort
dieselbe Zeile vorher schon einmal durchgegangen war.**

`[cmd]` **Nach der Berichtigung: Status 200**, die Probezeile wieder
entfernt.

### Zwei Befunde am eigenen Werkzeug

`[cmd]` **Die Probe hielt eine Antwort fuer fertig, waehrend noch
*,,sucht Supplemente…"* dastand** — sie wartet jetzt darauf, dass
KEINE Quelle mehr laeuft.

`[cmd]` **Und dabei fiel ein echter Anzeigefehler auf:** es stand
*,,Keine Treffer. · sucht Supplemente…"* — **eine Aussage, die sich
selbst widerspricht.** `[cmd]` **Behoben: ,,Keine Treffer" erst, wenn
beide Quellen geantwortet haben.**

### Die Fotos

    backup/x-g481-a2-smartsuche.png   A2/A3/A5/A6 in einem Bild
    backup/x-g481-a4-nachladen.png    A4, nach dem Nachladen

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src` und `globals.css`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`search_supplier_products` und
`supplier_product_search_meta` werden gerufen** ?
`food-such-modal.tsx`, `such-quellen-lage.ts`,
`supplement-posten-read.ts`.

`[cmd]` **`record_supplier_product_intake` auch** ? **A11
erfuellt.**

`[cmd]` **Proben: web 1878/1878, coach 65/65.**

### Die eine Zahl

    "whey isolate optimum nutrition"
      VORHER      0 Treffer
      NACHHER   146

`[cmd]` **Selbst geprueft: `Optimum Nutrition | 100% Gold
Standard Whey Chocolate Malt` steht in der Ergebnismenge.**

### Und er hat die Langsamkeit EHRLICH gemeldet

> *,,A8 ehrlich: es ist LANGSAMER geworden ? 1.037 -> 1.542 ms,
weil statt einer Abfrage vier laufen."*

> *,,Die 108 ms der alten Smartsuche waren kein Tempo, sondern
eine LEERE ANTWORT."*

`[read]` **Er haette die Zahl verschweigen koennen** ? **sie
steht im Bericht, mit der Begruendung daneben.**

### Ein latenter Fehler aus G-475 kam ans Licht

> *,,Der Schnappschuss liess `FOL` und die freie Spalte
`nutrients` weg. Toms Whey traegt `{"CHORL": 35}` ? JEDE
Erfassung dieses Produkts scheiterte an C-513."*

`[read]` **Ein Fehler, den G-478 nicht gefunden hat, weil das
Produkt damals noch kein CHORL hatte** ? **C-516 hat es
eingetragen.**

### Und er hat seinen eigenen Fehlversuch gemeldet

> *,,Mein erster Anlauf hat dabei das Tagebuch abgeschaltet
(500, *Could not find a relationship*) ? ich hatte gegen ein
Schema gebaut, das noch nicht eingespielt ist."*

`[cmd]` **Jetzt stehen BEIDE Wege offen** ? **Codex kann ohne
Ausfallfenster einspielen.**

### Zwei Luecken, gemeldet statt umgangen

> *,,`search_supplier_products` gibt `produktform` nicht
zurueck (deshalb eine Nachlese, 37 ms), und `p_form` nimmt nur
EINEN Wert, waehrend Toms Regel VIER Formen nennt."*

`[cmd]` **Und ich habe einen dritten gefunden:**
`p_form = Powder` **findet NULL Treffer** ? **weil der Wert
`Powder [E0162]` lautet.**

`[read]` **Derselbe Fallstrick, den er in G-480 in der
Oberflaeche gefunden hat ? diesmal in der
Datenbankfunktion.**

`[cmd]` **Als C-520.**

**Abgenommen.**


