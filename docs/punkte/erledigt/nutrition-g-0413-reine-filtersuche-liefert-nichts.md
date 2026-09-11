---
nr: G-413
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 93509aac
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-foods.tsx
zahlen:
  gemessen: 2026-09-08
  treffer_db: 7140
---

# G-413 — reine Filtersuche liefert nichts

## Befund

Tom, 2026-09-08:

> food db zeigt nichts mehr an, wenn nichts in der suche ist:
> *,,Kein Lebensmittel passt zu dieser Auswahl."* sprich: reine
> filtersuche geht nicht.

## Die Datenbank ist gesund

`[cmd]` **Direkt gerufen, leeres `q`, keine Filter:**

    nutrition.food_search('', '', ARRAY[]::text[], NULL, NULL,
      NULL, NULL, 'relevance', 3, 0)

    -> total: 7140, result_count: 3
       erster Treffer: Tofu (H861000)

`[read]` **Die Funktion liefert bei leerer Suche den ganzen
Katalog** ? **wie sie soll.**

## Der Fehler liegt in der Oberflaeche

`[cmd]` **`tab-foods.tsx:503`:**

    const ersterLauf = React.useRef(suche.trim().length === 0)

`[cmd]` **Und Zeile 507:**

    if (ersterLauf.current) { ersterLauf.current = false; return }

`[read]` **Beim ERSTEN Lauf ohne Suchbegriff wird der Effekt
uebersprungen** ? **G-266 hat das eingebaut, weil `start` die
Anfangstreffer mitbringt.**

`[cmd]` **Der Kommentar Zeile 498-502 sagt es:**

> *,,Der erste Lauf wird uebersprungen, weil `start` die
> Anfangstreffer schon mitbringt. Kam der Begriff aber aus der
> Adresse, passt `start` nicht dazu."*

`[read]` **Die Annahme: ohne Suchbegriff sind die Anfangstreffer
richtig.**

`[read]` **Sie ist falsch, sobald ein FILTER gesetzt wird** ?
**dann muessten die Treffer neu geholt werden, aber der Effekt
haengt an `suche`, `kategorie`, `tags`, `ohne`, `herkunft`.**

`[read]` **Also: entweder feuert er und `start` wird
ueberschrieben, oder er feuert nicht und der Filter greift
nicht.**

## Was zu messen ist

**1** ? **Feuert der Effekt bei einer Filteraenderung ohne
Suchbegriff?**

`[cmd]` **Die Abhaengigkeiten stehen ab Zeile 560** ? **lesen,
ob `kategorie` und `tags` darin sind.**

`[read]` **Wenn ja: `ersterLauf` blockiert nur den ersten Lauf,
und der Fehler liegt woanders.**

**2** ? **Was bringt `start` mit?**

`[cmd]` **`page.tsx` ruft `getLocalFoodSearch`** ? **messen, mit
welchen Filtern.**

`[read]` **Vermutlich ohne** ? **dann sind die Anfangstreffer
ungefiltert, und der erste Filterklick zeigt entweder alles oder
nichts.**

**3** ? **Und die Meldung selbst.**

`[cmd]` **Zeile 1052-1056:** **sie erscheint, wenn `zeilen.length
=== 0` und nicht `laeuft` und kein `fehler`.**

`[read]` **Das ist richtig** ? **die Frage ist, warum `zeilen`
leer ist.**

## Die Gegenprobe

`[read]` **Am Schirm, nicht im Quelltext:**

    1  Food DB oeffnen, Suchfeld leer
       -> zeigt es Treffer?
    2  eine Kategorie waehlen, Suchfeld leer
       -> zeigt es Treffer?
    3  einen Tag waehlen, Suchfeld leer
       -> zeigt es Treffer?
    4  ein Wort tippen, dann loeschen
       -> zeigt es wieder Treffer?

`[cmd]` **Die Datenbank hat 7.140 Treffer bei leerem `q`** ?
**jeder dieser vier Faelle muss etwas zeigen.**

## Auftrag

**Beauftragt am 2026-09-08.**

`[read]` **Die Datenbank ist gesund** ? **7.140 Treffer bei
leerem `q`.**

`[read]` **Der Fehler liegt in der Oberflaeche.**

### Die Gegenprobe zuerst

`[read]` **Am SCHIRM, nicht im Quelltext** ? **vier Faelle:**

    1  Food DB oeffnen, Suchfeld leer
    2  eine Kategorie waehlen, Feld leer
    3  einen Tag waehlen, Feld leer
    4  ein Wort tippen, dann loeschen

`[read]` **Jeder muss Treffer zeigen.**

`[read]` **Miss ZUERST, welche der vier heute scheitern** ?
**vielleicht ist es nur einer.**

### Der Verdacht

`[cmd]` **`tab-foods.tsx:503`:**

    const ersterLauf = React.useRef(suche.trim().length === 0)

`[cmd]` **Und der Kommentar Zeile 498-502:**

> *,,Der erste Lauf wird uebersprungen, weil `start` die
> Anfangstreffer schon mitbringt. Kam der Begriff aber aus der
> Adresse, passt `start` nicht dazu."*

`[read]` **Die Annahme: ohne Suchbegriff sind die Anfangstreffer
richtig.**

`[read]` **Sie haelt nicht, sobald ein FILTER gesetzt ist.**

`[read]` **Aber der Effekt haengt auch an `kategorie` und `tags`**
? **lies die Abhaengigkeitsliste, bevor du das fuer die Ursache
haeltst.**

### Und was `start` mitbringt

`[cmd]` **`page.tsx` ruft `getLocalFoodSearch`** ? **messen, mit
welchen Filtern.**

`[read]` **Vermutlich ohne** ? **dann sind die Anfangstreffer
ungefiltert.**

### Die Meldung selbst ist richtig

`[cmd]` **`tab-foods.tsx:1052-1056`:** *,,Kein Lebensmittel passt
zu dieser Auswahl."*

`[read]` **Sie erscheint, wenn `zeilen.length === 0`** ? **das ist
korrekt.**

`[read]` **Die Frage ist, warum `zeilen` leer ist.**

## Abnahmebedingungen

    A1  die vier Faelle am Schirm, VORHER. Welche
        scheitern? Bildschirmfotos.
    A2  die Ursache gemessen, nicht vermutet.
    A3  die vier Faelle NACHHER, alle mit Treffern.
    A4  eine Gegenprobe, die rot wird: der alte Zustand
        wiederhergestellt -> faellt sie?
    A5  apps/web 1570 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-465.**
**Die sechs Referenzbloecke bleiben** ? **Tom nimmt sie einzeln
ab.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072), **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — die vier Faelle VORHER: DREI von vier gehen

`[cmd]` **Am Schirm gemessen, `dev@lumeos.app`, vor jeder
Aenderung** (`tools/_g413-vier-faelle.mjs`, Bilder
`docs/bilder/g413/vorher-*.png`):

    1  leer geoeffnet          50 Zeilen   total 1.294   TREFFER
    2  Kategorie „Produce"     50 Zeilen   total   694   TREFFER
    2b Kategorie „Meat"         0 Zeilen   total     0   STUMM
    3  Tag „Vegan"             50 Zeilen   total 1.294   TREFFER
    4  Wort tippen + loeschen  50 -> 9 -> 50             TREFFER

`[read]` **Die reine Filtersuche GEHT.** `[cmd]` **Und die Abfrage
laeuft** — jeder Fall schickt sie, mit Filter:

    q=&limit=50&offset=0&sort=relevance&prefs=1&category=fleisch-gefluegel
    q=&limit=50&offset=0&sort=relevance&prefs=1&tags=vegan

`[read]` **Ein Fall scheitert** — und zwar anders, als der Auftrag
vermutete.

### A2 — die Ursache, gemessen: die Null ist RICHTIG, der SATZ war falsch

**Der Verdacht des Auftrags traegt nicht.** `[cmd]` **`kategorie`
und `tags` STEHEN in der Abhaengigkeitsliste** (`tab-foods.tsx:560`):

    }, [suche, kategorie, tags, seite, sortierung, ohne, herkunft])

`[cmd]` **Und `ersterLauf` blockiert nur den ersten Lauf** — am
Schirm feuert jeder Filterklick eine Abfrage. `[read]` **Der
Auftrag hat selbst davor gewarnt, und die Warnung war
berechtigt.**

**Auch `start` ist nicht ungefiltert.** `[cmd]` **Gemessen: die
Anfangstreffer tragen `total = 1.294`** — dieselbe Zahl wie eine
Abfrage mit `prefs=1`. `[read]` **Die Vorlieben sind also schon
darin.**

**DIE URSACHE LIEGT IM KONTO.** `[cmd]` **`dev@lumeos.app` steht
auf `diet_type = 'vegan'`** (`nutrition.food_preferences`):

    Kategorie              ohne Vorlieben   mit Vorlieben
    fleisch-gefluegel            1.449             0
    fisch-meeresfruechte           520             0
    milch-kaese                    279             0
    gemuese                        717           694
    obst                           275           272
    getreide-brot-pasta            883           213

`[read]` **Fleisch, Fisch und Milch fallen auf null** — auf einem
veganen Konto ist das die Antwort, kein Fehler. `[cmd]` **Die
Datenbank ist gesund, die Route ist gesund, der Effekt ist
gesund.**

**Der Fehler ist der SATZ.**

    „Kein Lebensmittel passt zu dieser Auswahl."

`[read]` **Er zeigt auf die AUSWAHL** — also aendert man die
Auswahl, und es aendert sich nichts. **Der Grund liegt woanders,
und er stand nirgends.**

**UND DIE ZAHL LAG BEREIT.** `[cmd]` **`preferences_hidden` wird
seit C-94 berechnet** (`food-search.ts:814`, ein zweiter Aufruf
ohne `p_user_id`) — **und kam im Browser an:**

    total=0   angewandt=true   VERBORGEN=1449

`[cmd]` **Gemessen: kein einziger Verbraucher im Haus.**

    grep preferences_hidden  ->  3 Treffer, alle in food-search.ts
                                 (Typ, Vorgabewert, Berechnung)

`[read]` **Eine berechnete Zahl ohne Leser ist wie eine fehlende**
— nur teurer, weil sie einen zweiten Datenbankaufruf kostet.

### Die Lehre stand schon da — G-251

`[cmd]` **Der Kommentar ueber genau dieser Zeile** (`tab-foods.tsx:1046`):

> *„leer ist nicht gleich leer. `foods_custom` hat 0 Zeilen — wer
> ,Eigene' waehlt, bekommt garantiert nichts, und das liegt nicht
> an seinem Suchbegriff. Ein allgemeines ,passt nichts' liesse ihn
> die Suche aendern, was nichts aendern wuerde."*

`[read]` **Derselbe Fall, dieselbe Loesung** — G-251 kannte den
dritten Leerfall nur noch nicht.

### A3 — die vier Faelle NACHHER

`[cmd]` **Dieselbe Probe, dieselbe Wartezeit, nur der Code ist
anders** (Bilder `docs/bilder/g413/nachher-*.png`):

    1  leer geoeffnet          50 Zeilen   TREFFER
    2  Kategorie „Produce"     50 Zeilen   TREFFER
    2b Kategorie „Meat"         0 Zeilen   ERKLAERT   <- neu
    3  Tag „Vegan"             50 Zeilen   TREFFER
    4  Wort tippen + loeschen  50 -> 9 -> 50  TREFFER

**Der Satz am Schirm:**

> *„Deine Ernährungsvorlieben blenden hier 1.449 Lebensmittel aus.
> Ohne sie gäbe es Treffer — die Vorlieben werden unter Preferences
> gepflegt."*

    VORHER   1 von 5 scheitern (STUMM)
    NACHHER  0 von 5

`[read]` **Die Null bleibt** — sie ist richtig. **Was sich aendert,
ist, dass der Nutzer erfaehrt, warum**, und wo er es aendern kann.

### A4 — die Gegenprobe: FUENF von fuenf ROT

`[cmd]` **`tools/_g413-sabotage.mjs`** — jede Probe prueft ZUERST,
ob die Sabotage ueberhaupt ankommt:

    DER ALTE ZUSTAND: Kachel liest preferences_hidden nicht  -> ROT
    der Satz nennt die Zahl nicht mehr                       -> ROT
    der Satz kommt auch ohne verborgene Treffer              -> ROT
    kategorie faellt aus den Abhaengigkeiten                 -> ROT
    der Kategoriefilter geht nicht an die Anfrage            -> ROT

`[cmd]` **Die erste IST die vom Auftrag verlangte** — der alte
Zustand wiederhergestellt, und die Probe faellt.
`[cmd]` **Nach dem Zuruecksetzen wieder gruen.**

**Und die Gegenprobe zur Gegenprobe, am SCHIRM:** `[cmd]` **die
Vorher-Bilder entstanden mit zurueckgesetztem Code** — dieselbe
Probe meldete dort `STUMM`, mit dem Code `ERKLAERT`.

### A5 — die Proben

    apps/web   1575 / 1575 gruen   (1570 gefordert)
    tsc        EXIT 0

`[cmd]` **Fuenf neue Waechter**, und der wichtigste ist der
zweite: **ohne verborgene Treffer darf KEIN Vorliebensatz
kommen.** `[read]` **Sonst stuende er auch dort, wo die Auswahl
wirklich leer ist** — und schickte den Nutzer an die falsche
Stelle.

### Ein Fund bei der Messung selbst

`[cmd]` **Meine erste Fassung der Probe meldete fuer Fall 2b
„50 Zeilen"** — wo 0 standen. **Zwei Fehler auf einmal:**

`[cmd]` **1 — sie wartete 1.400 ms statt auf die Antwort.** Bei
`Meat` kam die Antwort spaeter, und die Probe las die alte Liste.
**Ein falsches GRUEN.**

`[cmd]` **2 — sie nahm „die groesste Tabelle am Schirm".** Sobald
die Trefferliste leer war, gewann eine Nachbartabelle mit acht
Zeilen. `[read]` **Jetzt sucht sie die Spalte „ACTION"** — die
Trefferliste hat sie als einzige.

`[read]` **Beide haetten den Befund verdeckt.**

## Was NICHT geaendert wurde

**1 — `supabase/`.** `[cmd]` **Nichts angefasst.** `[read]`
**Hinweis:** `_pipeline/kette.json`, `schema-sollstand.json` und
eine neue Validierungsdatei tragen Aenderungen im Arbeitsbaum
(C-465/C-467) — **die sind nicht von mir.**

**2 — Die sechs Referenzbloecke.** `[cmd]` **Unberuehrt**, wie
beauftragt.

**3 — `food_search` und die Vorlieben selbst.** `[read]` **Beide
arbeiten richtig** — wer vegan eingestellt ist, bekommt kein
Fleisch. **Das zu aendern waere ein anderer Auftrag und Toms
Entscheidung.**

**4 — Nicht committet, nicht gestaged.**

## Zwei Hinweise

**1 — Die Probendateien wurden waehrend des Auftrags geloescht.**
`[cmd]` **Gemessen: `git status` zeigt rund 40 geloeschte
`tools/_g4*.mjs`** aus frueheren Auftraegen (G-405 bis G-412),
**und meine ungetrackten G-416/G-417/G-413-Dateien waren
verschwunden.** `[read]` **Die getrackten lassen sich
zurueckholen** (`git checkout -- tools/`); **meine habe ich neu
geschrieben.** `[read]` **Das kam nicht aus dieser Sitzung.**

**2 — Toms Konto ist vegan.** `[cmd]` **`dev@lumeos.app`:
`diet_type = vegan`, `allergies = {lactose}`.** `[read]` **Wer die
Food DB auf diesem Konto prueft, sieht bei Fleisch, Fisch und
Milch immer null** — das ist die Einstellung, nicht der Katalog.
`[cmd]` **`test-user@lumeos.local` und `tom.seed@example.com`
stehen auf `omnivore`.**

## Neustart

`[cmd]` **NICHT noetig** — nur `apps/web/src`, heisses Nachladen.
`[cmd]` **Die Messungen dieses Berichts liefen auf dem laufenden
3200er.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  drei von vier Faellen gingen schon
    A2  die Ursache liegt im Konto, nicht im Code
    A3  alle vier zeigen Treffer
    A4  fuenf Gegenproben, alle rot
    A5  1575/1575

`[read]` **Mein Auftrag hat die falsche Ursache vermutet.**

`[cmd]` **Er hat sie widerlegt und die richtige gemessen.**

### Der Verdacht trug nicht

`[cmd]` **`tab-foods.tsx:560`: `kategorie` und `tags` STEHEN in
der Abhaengigkeitsliste.**

`[cmd]` **Und `start` ist nicht ungefiltert** ? **`total = 1.294`,
dieselbe Zahl wie mit `prefs=1`.**

`[read]` **Beide Annahmen meines Auftrags waren falsch** ? **und
er hat sie einzeln gemessen, statt die erstbeste zu nehmen.**

### Die Ursache

`[cmd]` **`dev@lumeos.app` stand auf `diet_type = 'vegan'`** ?
**Fleisch, Fisch und Milch fallen auf null.**

`[read]` **Die Null war richtig, der SATZ war falsch:**

> *,,Kein Lebensmittel passt zu dieser Auswahl."*

`[read]` **Er zeigt auf die AUSWAHL** ? **also aendert man die
Auswahl, und nichts passiert.**

### Und die Zahl lag bereit

`[cmd]` **`preferences_hidden` wird seit C-94 berechnet, kam im
Browser an (1.449)** ? **und hatte KEINEN LESER.**

> *,,Eine berechnete Zahl ohne Verbraucher ist wie eine fehlende ?
> nur teurer, weil sie einen zweiten Datenbankaufruf kostet."*

`[cmd]` **Drei Treffer im Haus, alle in `food-search.ts`: Typ,
Vorgabewert, Berechnung.**

### Die Lehre stand schon darueber

`[cmd]` **G-251: *,,leer ist nicht gleich leer."***

> *,,Der dritte Leerfall war dort nur noch nicht bekannt."*

### Und seine erste Probe log

> *,,Meine erste Probe meldete fuer den entscheidenden Fall *50
> Zeilen*, wo 0 standen ? feste Wartezeit statt auf die Antwort
> zu warten, plus *die groesste Tabelle* als Trefferliste. Beide
> Fehler melden zu viel, also GRUEN."*

`[read]` **Er hat sie nachgeprueft** ? **sonst waere der Befund
verdeckt geblieben.**

### Was ich heute anders messe

`[cmd]` **`dev` steht JETZT auf `omnivore`, seit 07:27.**

`[cmd]` **Die Kettenlaeufe von heute (C-464 um 08:24, C-465 um
13:07) haben die Testdaten neu gesetzt.**

`[cmd]` **Fleisch heute: 1.449 ohne, 1.073 mit Vorlieben** ?
**nicht null.**

`[read]` **Seine Zahlen stimmten, als er sie mass** ? **und der
Befund gilt weiter: der Satz nennt den Grund nicht.**

`[read]` **Der neue Satz ist auch bei `omnivore` richtig** ?
**376 werden ausgeblendet, und das steht jetzt da.**

**Abgenommen.**

