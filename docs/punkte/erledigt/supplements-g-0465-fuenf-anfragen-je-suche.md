---
nr: G-465
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-453
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: f8815993
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
  anfragen: 5
---

# G-465 - fuenf Anfragen je Suche

## Toms Befund

Tom, 2026-09-08:

> miss die suche in supplement produkte, das ist nicht
> bedienbar mit diesen wartezeiten. da muss eine loesung her,
> kann nicht sein, heutzutage solche ladezeiten

## Die Datenbank ist NICHT das Problem

`[cmd]` **Gemessen mit `\timing` direkt in psql:**

    leer                  2,3 ms
    'whey'               40,1 ms
    'whey' + protein     36,5 ms
    'whey' + Allergien   33,1 ms
    Markenliste          36,6 ms

`[read]` **Alles unter 41 ms.**

`[cmd]` **Zum Vergleich: ueber `docker exec` gemessen waren es
1.100 ms** ? **der Aufwand des Aufrufs, nicht der Abfrage.**

`[read]` **Dieselbe Falle wie ueberall heute: die Zahl
gemessen, die man leicht bekommt, statt der, die zaehlt.**

## Wo die Zeit hingeht

`[cmd]` **`tab-produkte.tsx` macht FUENF `fetch` beim
Oeffnen:**

    Z342   /api/supplements/produkte
    Z398   /api/supplements/...
    Z419   /api/supplements/...
    Z479   /api/supplements/...
    Z510   /api/supplements/...

`[cmd]` **Und sieben API-Routen:** `daumen`, `intake`,
`marken`, `meidestoffe`, `produkt`, `produkte`, `substanz`.

`[read]` **Jede Anfrage geht durch Next.js, Auth und
PostgREST** ? **die Datenbank braucht 40 ms, der Nutzer
wartet Sekunden.**

## Was zu messen ist

`[read]` **ZUERST messen, wo die Zeit wirklich liegt** ?
**nicht raten.**

    A  je fetch: wie lange? Im Browser gemessen,
       nicht geschaetzt.
    B  laufen sie NACHEINANDER oder parallel?
    C  wie viele davon braucht die ERSTE Anzeige?
    D  wie oft laeuft jede beim Tippen?

`[cmd]` **G-455 hat schon einen solchen Fall gefunden:** **ein
HTTP 431 riss die Nachbaranfrage mit, weil beide dieselbe
Verbindung nutzten.**

`[cmd]` **Und G-459: 27 Sekunden fuer eine Zaehlung, 57 Runden
a 1.000 Zeilen.**

`[read]` **Beide Male lag es NICHT an der Datenbank.**

## Moegliche Wege, nach dem Messen

**a** ? **Parallel statt nacheinander.**

`[read]` **Wenn fuenf Anfragen 200 ms je brauchen, sind das
nacheinander 1 s, parallel 200 ms.**

**b** ? **Weniger Anfragen.**

`[read]` **Marken, Allergien und Meidestoffe aendern sich
nicht beim Tippen** ? **einmal holen, behalten.**

**c** ? **Eine Anfrage fuer alles.**

`[cmd]` **C-504 hat schon zehn Parameter** ? **eine Funktion,
die Produkte UND die Kategorienzahlen liefert, waere eine
Anfrage statt zwei.**

**d** ? **Beim Tippen entprellen.**

`[cmd]` **MISS, ob jede Taste eine Anfrage ausloest.**

## Abnahmebedingungen

    A1  je fetch die Laufzeit, im Browser gemessen.
        TABELLE.
    A2  nacheinander oder parallel? Belegt.
    A3  wie viele Anfragen loest ein Tastendruck aus?
    A4  nachher: die Zeit bis zur ersten Anzeige.
        Vorher/nachher, gemessen.
    A5  Gegenprobe: eine kuenstlich langsame Antwort
        -> faellt die Messung auf?
    A6  vier Module unveraendert.
    A7  apps/web 1793 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**NICHT raten, wo die Zeit liegt** ? **die Datenbank ist es
nachweislich nicht.**

**Keine Funktion in `supabase/` aendern** ? **wenn dort etwas
fehlt: MELDEN.**

## Bericht

**Claude Code, 2026-09-17.**

### Der Stand in einem Satz

`[read]` **Es waren nicht fuenf Anfragen, es war EINE** ?
`produkte` **brauchte 15,8 Sekunden, weil sie bei jedem
Tastendruck 56.934 Produkt-Ids in 57 Anfragen NACHEINANDER
holte.** `[cmd]` **Jetzt: 3,9 bis 4,3 Sekunden bis zur ersten
Anzeige, vorher 20,5 bis 32,5.**

### A1 ? je Anfrage die Laufzeit, im Browser gemessen

`[cmd]` **Beim Oeffnen, VORHER** (`whey`, warmer Server):

    Route          ab ms      ms   Groesse
    meidestoffe        0   9.406    0,1 kB
    marken             0   9.641   85,8 kB
    meidestoffe        0   5.465    0,1 kB
    marken             1   5.731   85,8 kB
    produkte         181  22.095  111,8 kB
    daumen        22.795       ?        ?

    erste Anzeige          24.412 ms

`[cmd]` **Drei Laeufe: 24.412 / 20.464 / 32.497 ms.**

`[cmd]` **NACHHER**, dieselbe Messung:

    Route          ab ms      ms   Groesse
    meidestoffe        0     699    0,1 kB
    marken             1     991   85,8 kB
    meidestoffe        1     680    0,1 kB
    marken             1   1.071   85,8 kB
    produkte         184   1.553  111,8 kB
    daumen         1.720     493    0,1 kB

    erste Anzeige           3.878 ? 4.335 ms

`[read]` **Ein Lauf mass 10.147 ms** ? **das war ein Neuuebersetzen
nach dem `git stash` der Gegenprobe, nicht der Normalfall.**
**Gemeldet, nicht weggelassen.**

#### Die Route ALLEIN, ohne Nachbarlast

`[cmd]` **Je dreimal, eine nach der anderen:**

    meidestoffe      371 / 360 / 371 ms
    marken           617 / 569 / 611 ms
    produkte      15.794 / 15.727 / 15.690 ms

`[read]` **`meidestoffe` liefert 0,1 kB und brauchte trotzdem
370 ms** ? **die Groesse der Antwort war nie das Problem.**

### Wo die Zeit lag ? mit Gegenprobe eingegrenzt

`[cmd]` **Die Route kennt einen Schalter (`allergien=0`). Damit
laesst sich der Zweig abschalten:**

    mit Allergiefilter    15.804 / 15.013 / 15.845 ms
    OHNE Allergiefilter      353 /    392 /    332 ms

`[read]` **45 mal so lang** ? **und beide liefern dieselbe Seite.**

`[cmd]` **Der Grund steht in `ladeAllergieTreffer`:** `[read]`
**57 Runden a 1.000 Zeilen, jede mit `await` im Schleifenrumpf** ?
**also nacheinander.** `[cmd]` **Gemessen: die Funktion liefert
56.948 Zeilen ueber 56.934 Produkte.**

`[read]` **Die Datenbank war nie das Problem** ? **Toms Messung
mit `\timing` (40 ms) stimmt.** **Die Zeit lag im Weg dorthin, 57
mal.**

### A2 ? nacheinander oder parallel? BELEGT

`[cmd]` **Fuenf der sechs Anfragen starten bei ab-ms 0 oder 1** ?
**sie laufen gleichzeitig.**

    Summe der Laufzeiten   6.824 ms
    Spanne vom ersten
      Start bis zum letzten
      Ende                 2.213 ms
    Gleichzeitigkeit        3,08

`[read]` **Eine Zahl ueber 1 heisst parallel** ? bei
*nacheinander* waere sie 1,0.

`[read]` **Nur `daumen` wartet** ? **zu Recht: er braucht die
Produkt-Ids aus der Trefferliste.**

`[read]` **Der naheliegende Verdacht aus dem Auftrag ? *,,parallel
statt nacheinander"* ? war also schon erfuellt.** **Die Anfragen
waren nie das Problem, EINE von ihnen war es.**

### A3 ? wie viele Anfragen loest ein Tastendruck aus?

    4 Zeichen getippt  ->  1 bis 2 Anfragen
                           = 0,25 bis 0,5 je Taste

`[read]` **Das Entprellen wirkt** ? `tab-produkte.tsx` **wartet
180 ms und bricht die vorige Anfrage ab** (`AbortController`).
**Der vierte Weg aus dem Auftrag war ebenfalls schon gebaut.**

`[read]` **Aber jede dieser Anfragen holte die 56.934 Ids neu** ?
**und DAS war es, was das Tippen unbenutzbar machte.**

### A4 ? die Zeit bis zur ersten Anzeige

    VORHER    24.412 / 20.464 / 32.497 ms
    NACHHER    4.176 /  4.335 /  3.878 ms

`[cmd]` **Und die Route allein, dreimal hintereinander:**

    erster Aufruf (kalt)   3.328 ms
    zweiter                  514 ms
    dritter                  433 ms

`[read]` **Der zweite und dritte sind so schnell wie die Suche
OHNE Allergiefilter** (353 ms) ? **der Filter kostet nach dem
ersten Mal praktisch nichts mehr.**

### Was gebaut wurde ? zwei Aenderungen, beide gemessen

**1 ? die Runden laufen gleichzeitig.**

`[cmd]` **`for (…) { await c.rpc(…) }` wurde zu Buendeln von zehn
ueber `Promise.all`.** `[read]` **Die Runden haengen nicht
voneinander ab** ? jede kennt ihren Bereich aus ihrem Index.

    allein dadurch   15.804 ms  ->  3.200 ms

`[read]` **In Buendeln, nicht alle 60 auf einmal** ? **sonst
stehen 60 gleichzeitige Anfragen gegen PostgREST, und der Engpass
wandert nur woanders hin.**

**2 ? die Liste wird je Nutzer gemerkt.**

`[read]` **Sie aendert sich nur, wenn der Nutzer seine Allergien
aendert** ? **nicht beim Tippen.**

    mit Kurzspeicher   3.200 ms  ->  433 bis 514 ms

`[cmd]` **Frist 60 Sekunden, und der Schreibweg raeumt sofort**
(`vergissAllergieTreffer` in `frischen()`, das alle drei
Schreibwege rufen).

`[read]` **Ein unvollstaendiger Stand wird NICHT gemerkt** ?
`[cmd]` **sonst haelt eine Stoerung eine Minute lang an, und der
Filter saehe aus, als griffe er nicht** (genau die Wirkung aus
G-455).

#### Warum KEIN `unstable_cache`

`[read]` **Allergien sind Gesundheitsdaten.** `unstable_cache`
**haelt einen Eintrag je Schluessel fuer den ganzen Server** ?
**ein Fehler im Schluessel gaebe die Liste eines Nutzers an einen
anderen.**

`[cmd]` **Der Speicher liegt deshalb je `userId`, und das ist
gemessen ? mit ZWEI Sitzungen:**

    dev@lumeos.app          56.934 ausgeschlossene Produkte
    test-user@lumeos.local       0
    dev@lumeos.app erneut   56.934

`[read]` **Der zweite Nutzer bekommt NICHT die Liste des
ersten** ? **und der erste behaelt seine.**

### A5 ? die Gegenprobe: eine kuenstlich langsame Antwort

`[cmd]` **Die Route `produkte` wurde im Browser um 4.000 ms
gebremst** (`page.route`, die Antwort unveraendert):

    ohne Bremse   produkte 2.025 ms   erste Anzeige 4.325 ms
    mit Bremse    produkte 5.143 ms   erste Anzeige 7.781 ms

`[read]` **Die Messung schlaegt an** (`bremseErkannt: true`) ?
**und die Kontrolle mit 0 ms Bremse bleibt unauffaellig.**
**Beide Richtungen belegt.**

### A6 ? die vier Module unveraendert

`[cmd]` **Mit und ohne die Aenderung gemessen** (`git stash`):

    /v2/nutrition     194.366 Zeichen / 13 Kacheln   gleich
    /v2/training      104.993 / 11                   gleich
    /v2/medical       511.300 / 11                   gleich
    /v2/goals          50.401 / 18                   gleich
    /v2/supplements   472.711 / 18                   gleich

### A7 ? die Waechter

    apps/web     1811 Proben   1811 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0

**Neu: 8 Proben in `g465-suchtempo.test.ts`.**

`[cmd]` **JEDE kann rot werden ? gemessen:**

    A1  wieder nacheinander              ROT
    A2  Buendel auf 99                   ROT
    A3  unvolle Seite beendet nicht      ROT
    A4  Speicher nicht je Nutzer         ROT
    A5  Fehlschlag wird gemerkt          ROT
    A6  Schreibweg raeumt nicht          ROT
    A7  Frist auf eine Stunde            ROT

`[cmd]` **Und die KONTROLLE:** ein Kommentar mit `Promise.all`,
`TREFFER_SPEICHER.set(userId`, `BUENDEL` und `SPEICHER_MS` als
blossen Woertern ? **bleibt GRUEN.**

### Was NICHT gebaut wurde ? und warum

`[read]` **Die drei anderen Wege aus dem Auftrag waren schon
gebaut oder taugen nicht:**

`[cmd]` **,,parallel statt nacheinander"** ? **die Anfragen liefen
schon parallel** (Gleichzeitigkeit 3,08). **Nur INNERHALB einer
Anfrage lief es nacheinander.**

`[cmd]` **,,beim Tippen entprellen"** ? **war schon da**, 180 ms
und `AbortController` (0,25 bis 0,5 Anfragen je Taste).

`[cmd]` **,,weniger Anfragen ? Marken einmal holen"** ? **steht
schon so im Code** (`useEffect` mit `[]`). `[read]` **Dass sie
trotzdem ZWEIMAL laufen, ist der Doppelaufruf von React im
Entwicklungsmodus** (`reactStrictMode`, Vorgabe in Next 14) ?
**im Betrieb laeuft jede einmal.** **Gemeldet, nicht
abgeschaltet:** der Doppelaufruf ist eine Pruefung, keine
Stoerung.

### Was offen bleibt

`[cmd]` **`marken` liefert 85,8 kB bei jedem Oeffnen** ? 6.012
Marken. `[read]` **Das ist die groesste verbliebene Einzelmenge**;
**eine Suche im Feld statt einer vollen Liste waere ein eigener
Auftrag** (dieselbe Bauform wie die Produktsuche).

`[read]` **Der Kurzspeicher liegt im Prozess** ? **bei mehreren
Serverinstanzen hat jede ihren eigenen.** **Das ist hier richtig
(kein gemeinsamer Speicher fuer Gesundheitsdaten), kostet aber je
Instanz einmal die 3,2 Sekunden.**

`[read]` **In `supabase/` fehlt nichts** ? **die Funktion
`supplier_product_allergy_matches` ist schnell (40 ms).**
`[read]` **Was fehlt, ist ein Weg, den Ausschluss IN der Abfrage
zu machen, statt 56.934 Ids zu holen** ? **eine Suchfunktion mit
`p_user_id`, die selbst ausschliesst, waere eine Anfrage statt
57.** `[cmd]` **Das waere ein Auftrag fuer Codex; gemeldet, nicht
gebaut** (der Auftrag verbietet Aenderungen dort).

`[read]` **Ein Neustart ist NICHT noetig** ? nur `apps/web/src`
geaendert.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Typecheck exit 0** ? **er war bei meiner Messung
noch rot (TS1003 in `allergie-aktionen.ts:18`).**

`[cmd]` **Proben: web 1811/1811, coach 65/65.**

`[cmd]` **Seine fuenf Werkzeuge selbst gelaufen, alle exit 0:**
`_g465-messen`, `_g465-zweig`, `_g465-server`,
`_g465-trennung`, `_g465-gegenprobe`, `_g465-sabotage`.

`[cmd]` **Aus `_g465-zweig`:**

    mit Allergiefilter   554 ms, 445 Zeilen, 56.934 Produkte
    OHNE Allergiefilter  368 ms, 500 Zeilen, 0

### Zwei echte Fehler, keiner davon der vermutete

`[read]` **Mein Auftrag sagte: fuenf `fetch`, nacheinander.**

> *,,Die fuenf laufen bereits parallel; ihr laengster Zweig
liegt bei 200 ms. Meine Vermutungen ? Sammelanfrage,
Entprellen, weniger Anfragen ? waeren alle falsch gewesen."*

`[cmd]` **Der wirkliche Zweig: 1.339 ms, davon 1.130 ms
Datenbank.**

**1** ? **Ein Index fehlte.**

> *,,`product_contents(product_id)` fehlte ? 447 ms auf 3 Mio
Zeilen. Der Index existiert seit der Grundmigration als
zusammengesetzter (`product_id, reihenfolge`), aber die
Fremdschluessel-Pruefung beim `EXISTS` nutzt ihn nicht."*

`[read]` **Ein Index, der DA ist und trotzdem nicht
greift** ? **derselbe Fall wie `p_limit`, das keine Wirkung
hat.**

`[cmd]` **`ANALYZE` ist dazugekommen** ? **Statistiken
veraltet, weil C-499 92.821 Zeilen stillgelegt hat.**

**2** ? **Die Vorgabe war nicht die Vorgabe.**

> *,,Der Standardpfad rief `search_supplier_products` MIT
`p_allergien_ausblenden = true` auf, weil der
Oberflaechen-Standardwert `true` war ? die Datenbank hat den
gleichen Standard, aber der Aufruf setzte ihn EXPLIZIT."*

`[read]` **Zwei Vorgaben, die dasselbe sagen** ? **aber die
explizite erzwingt den teuren Zweig.**

### Und der Streit ums Ergebnis

> *,,Die Leiste zeigt weiterhin 214.780, die Trefferliste sind
445 ? weil 55 der 500 Produkte ein Allergen enthalten. Das ist
RICHTIG, aber ohne Erklaerung verwirrend."*

`[cmd]` **Er hat es benannt und nicht gebaut** ? **G-467 traegt
es.**

### Die Kontrollprobe

> *,,`Alle Proben koennen rot werden, die Kontrolle bleibt
gruen."*

`[read]` **Dieselbe Bauform wie in G-455** ? **sonst misst man
nur, dass jemand die Datei angefasst hat.**

### Und Toms Fehlermeldungen sind erklaert

`[cmd]` **Ich hatte `TS1003` in `allergie-aktionen.ts:18`
gemessen** ? **sein Zwischenstand.**

`[read]` **Kein Filterfehler, ein Agent im Schreiben.**

**Abgenommen.**


