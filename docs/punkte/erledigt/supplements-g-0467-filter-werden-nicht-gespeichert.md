---
nr: G-467
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-504
entscheidung: null
erledigt: 2026-09-08
commit: caac75f3
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-467 - die Filter werden nicht gespeichert

## Toms Befund, zum zweiten Mal

Tom, 2026-09-08:

> meine filtereinstellungen werden nicht gespeichert

> und die zusatzfilter sollen bei start eingeblendet sein.
> das wuerde schon massiv an daten weniger geben zum anzeigen

`[read]` **Er hat es vor zwei Stunden schon gesagt** ? **und
C-504 hat den Speicher gebaut, aber niemand liest ihn.**

## Gemessen

`[cmd]` **`public.user_display_preferences` existiert:**

    user_id, preference_key, value,
    created_at, updated_at
    2 Zeilen

`[cmd]` **Und in `apps/web/src/app/v2/supplements` und
`lib/supplements`: NULL Treffer fuer `display_pref`.**

`[read]` **Die Oberflaeche kennt die Tabelle nicht.**

`[read]` **Das ist mein Auftragsschnitt** ? **ich habe Codex
den Speicher bauen lassen und Claude Code nie gesagt, dass er
ihn benutzen soll.**

## Was zu bauen ist

**1** ? **Die Filter lesen und schreiben.**

`[read]` **Was zu speichern ist: Marktstatus, Kategorie, Form,
Marken, ob Allergien ausgeblendet sind.**

`[read]` **NICHT die Sucheingabe** ? **die ist
augenblicklich.**

**2** ? **Die Filterleiste startet OFFEN.**

Tom: *,,die zusatzfilter sollen bei start eingeblendet sein.
das wuerde schon massiv an daten weniger geben zum anzeigen"*

`[read]` **Wer die Leiste sieht, filtert** ? **wer sie nicht
sieht, bekommt 214.780 Produkte.**

## Und die Marken

`[cmd]` **C-511 baut die Lieblingsmarken** ? **warte darauf.**

`[read]` **Der Pulldown zeigt dann: meine Marken zuoberst, dann
die 25 haeufigsten, Eingabefeld fuer alle 4.907.**

## Abnahmebedingungen

    A1  ein gesetzter Filter ueberlebt Strg-F5. Foto
        vorher/nachher.
    A2  die Leiste startet offen. Foto.
    A3  die Sucheingabe wird NICHT gespeichert.
    A4  Gegenprobe: ein Nutzer ohne gespeicherte
        Filter -> Vorgabe.
    A5  vier Module unveraendert.
    A6  apps/web 1803 oder mehr, apps/coach 65.

## Bericht

**Claude Code, 2026-09-17.**

### Der Stand in einem Satz

`[read]` **Der Speicher war seit C-504 da und wurde nie gelesen** ?
**jetzt ueberleben die Filter den Neuaufbau, die Leiste startet
offen, und mit gesetztem Filter kommen 0,7 kB statt 101,1 kB.**

### Was gemessen wurde, bevor gebaut wurde

`[cmd]` **`public.user_display_preferences` (C-504), gemessen
2026-09-17:**

    user_id, preference_key, value jsonb, created_at, updated_at
    PRIMARY KEY (user_id, preference_key)
    CHECK preference_key ~ '^[a-z0-9_.:-]{3,120}$'
    CHECK jsonb_typeof(value) = 'object'
    vier RLS-Policies
    Trigger user_display_preferences_touch_updated_at

`[cmd]` **Und ein Vorbild in derselben Tabelle:**
`nutrition.nutrient_tree` (G-122) ? **dieser Weg folgt ihm, statt
einen zweiten zu bauen.**

`[read]` **Der Trigger setzt `updated_at` selbst** ? **ein eigener
Wert daneben waere ein zweiter Schreibweg fuer dieselbe Spalte.**
`[cmd]` **Erst geschrieben, dann gemessen und wieder entfernt.**

### A1 ? ein gesetzter Filter ueberlebt den Neuaufbau

`[cmd]` **Gemessen ueber die Oberflaeche** (geklickt, nicht
geschrieben):

    zuruecksetzen -> gespeichert = false, 426 Zeilen
    „vitamin" geklickt
    NEU GELADEN   -> kategorie = 'vitamin', 418 Zeilen
                     Filterknopf zeigt 1

**Fotos:** `backup/x-g467-a1-vorher.png` ?
`backup/x-g467-a1-nachher.png`.

`[read]` **Auf dem zweiten Foto steht die Leiste offen, `vitamin`
ist angewaehlt, `On Market` aktiv** ? **nach einem echten
Neuaufbau der Seite.**

### A2 ? die Leiste startet offen

**Tom:** *,,die zusatzfilter sollen bei start eingeblendet sein."*

`[cmd]` **Hier stand `React.useState(false)`** ? **jetzt
`useState(VORGABE.leisteOffen)`, und die Vorgabe ist `true`.**

`[read]` **Beides zusammen:** wer sie zuklappt, findet sie morgen
zu ? **die Vorgabe gilt nur fuer den, der noch nichts entschieden
hat.**

### A3 ? die Sucheingabe wird NICHT gespeichert

`[cmd]` **Gemessen:** *whey* getippt, neu geladen ?

    Suchfeld nach dem Neuladen   ""
    frageGespeichert             false

`[read]` **Die Zusage haengt an ZWEI Stellen**, nicht am
Wohlverhalten des Browsers:

    der Typ        `ProduktFilter` hat kein `frage`-Feld
    die Pruefung   `ausJson` wirft unbekannte Felder weg,
                   auch beim PUT

`[cmd]` **Geprueft mit einem Objekt, das `frage`, `suche` und
`text` mitschickt** ? **keines ueberlebt.**

### A4 ? die Trefferzahl ist erklaert

**Aus meinem eigenen G-465-Bericht:** *,,Die Leiste zeigt weiterhin
214.780, die Trefferliste sind 445 ? das ist richtig, aber ohne
Erklaerung verwirrend."*

`[cmd]` **Hier standen DREI Zahlen nebeneinander:**

    445 von 214.780 Treffern · 214.780 Produkte

`[read]` **Drei verschiedene Fragen, keine Antwort darauf, welche
Zahl welche ist.**

`[cmd]` **Jetzt, gemessen auf dem Schirm:**

    426 geladen · der Filter trifft mindestens 121.959 Produkte
    Katalog: 214.780 Produkte · supplements.supplier_products

**und nach dem Kategorienfilter:**

    418 geladen · der Filter trifft mindestens 39.523 Produkte

`[read]` **Die Zahl bewegt sich mit dem Filter** ? **das ist der
Beleg, dass sie den Filter beschreibt und nicht den Katalog.**

`[read]` **Drei Faelle, drei Saetze:** alles geladen (*,,Alle 2
Treffer geladen"*), nichts gefunden (*,,Kein Produkt passt zu
diesen Filtern"*), und die unscharfe Zahl (*,,mindestens"*) ?
**letztere, weil der Allergiefilter ueber 150 Ausschluessen nach
dem Lesen abzieht (G-455) und `gesamt` dann eine Untergrenze ist.**

### A5 ? die Gegenprobe: ein Nutzer ohne gespeicherte Filter

`[cmd]` **Nach dem Zuruecksetzen:**

    GET /api/supplements/filter -> gespeichert: false
    filter: die Vorgabe
    Schirm: On Market, 426 Zeilen, Leiste offen

`[read]` **Die Vorgabe wird GELOESCHT, nicht geschrieben** ?
`[cmd]` **sonst stuende nach dem ersten Zuruecksetzen eine Zeile
da, die nichts aussagt, und diese Gegenprobe waere nicht mehr
herstellbar.**

`[read]` **Auch Unsinn ergibt die Vorgabe** ? `null`, `'kaputt'`,
`[1,2,3]` **fallen alle auf sie zurueck, statt die Oberflaeche
umzuwerfen.**

### A6 ? Toms These, gemessen

**Tom:** *,,dann wuerden auch kalt viel weniger daten kommen."*

`[cmd]` **Dreimal je Fall, dasselbe Konto, derselbe Lauf:**

    ohne Filter   9.545 ms   418 Zeilen   101,1 kB
    mit Filter    7.730 ms     2 Zeilen     0,7 kB

    gespart       1.815 ms (-19 %)      100,4 kB (-99 %)

`[read]` **Die These stimmt ? aber die Datenmenge faellt viel
staerker als die Zeit.** `[cmd]` **Der Grund steht in G-465:** die
Zeit haengt am Weg durch Next.js und Auth, **nicht an der Menge**.
**Wer 0,7 kB statt 101 kB holt, spart die Uebertragung, nicht den
Aufruf.**

`[read]` **Fuer Tom heisst das:** **die Leiste offen zu zeigen
wirkt** ? **aber die restlichen 7,7 Sekunden liegen woanders.**

### Was gebaut wurde

    NEU        lib/supplements/produkt-filter-lage.ts
                 serverfrei: Typ, Vorgabe, Pruefung,
                 aktiveFilter, trefferSatz
               lib/supplements/produkt-filter-read.ts
                 Lesen, Speichern, Loeschen der Vorgabe
               app/api/supplements/filter/route.ts
                 GET und PUT, Kennung aus der SITZUNG
               __tests__/g467-filter-speicher.test.ts  10 Proben
               tools/_g467-filter.mjs     A1?A5 am Schirm
               tools/_g467-tempo.mjs      A6, vorher/nachher
               tools/_g467-sabotage.mjs   10 + 1 Kontrolle

    GEAENDERT  app/v2/supplements/tab-produkte.tsx
                 laedt und speichert die Filter, Leiste offen,
                 Trefferzahl erklaert, wartet auf die Filter
               __tests__/g452-produkte-reiter.test.ts
                 A2 nachgezogen (der Wert ist umgezogen)

`[cmd]` **Nichts in `supabase/`, nichts committet.**

### Zwei Fallen, beide beim Messen aufgefallen

**1 ? die Suche lief zweimal.**

`[cmd]` **Der Reiter sucht beim Aufbau mit der VORGABE, dann noch
einmal mit dem geladenen Stand.** `[read]` **Der erste Lauf ist
der teure** ? er sucht ungefiltert ueber 214.780 Produkte, **also
genau das, was Tom vermeiden will.** `[cmd]` **Die 180 ms
Entprellung fangen das nicht ab** ? der Ladeweg ist langsamer.
**Deshalb wartet die Suche jetzt auf die Filter (`geladen`).**

**2 ? die Probe schrieb gegen die Anwendung.**

`[cmd]` **Ein PUT auf die Route wurde vom entprellten
Selbstschreiber des Reiters (400 ms) sofort ueberschrieben.**
`[read]` **Das Foto zeigte weiter `vitamin` und `NOW Foods`,
obwohl die Probe zurueckgesetzt hatte** ? **und beide Fotos waren
gleich, A1 haette nichts belegt.**

`[read]` **Die Probe klickt jetzt** ? **so ist die Anwendung der
einzige Schreiber, und gemessen wird, was ein Nutzer bekaeme.**

`[read]` **Beide Male war nicht der Code falsch, sondern die
Messung** ? **derselbe Fehler wie in G-464 mit den zwei
gleichnamigen Produkten.**

### Ein fremder Waechter wurde rot ? zu Recht

`[cmd]` **`g452-produkte-reiter` A2 verlangte die ZEILE
`const STANDARD_STATUS = 'On Market'` im Reiter.** **G-467 hat den
Wert nach `produkt-filter-lage.ts` gezogen** ? **weil der
gespeicherte Filter und der Reiter sich ueber DENSELBEN Wert einig
sein muessen.**

`[read]` **Die Sache ist unveraendert** ? der Reiter oeffnet auf
*On Market*. **Die Probe hat die Zeile bewacht, nicht den Wert.**
`[cmd]` **Nachgezogen und gegengeprobt:** Wert auf *Off Market*
gesetzt ? **ROT.**

### A7 ? die vier Module unveraendert

    /v2/nutrition     194.366 Zeichen / 13 Kacheln   gleich
    /v2/training      104.993 / 11                   gleich
    /v2/medical       511.300 / 11                   gleich
    /v2/goals          50.401 / 18                   gleich
    /v2/supplements   472.711 / 18                   gleich

### A8 ? die Waechter

    apps/web     1821 Proben   1821 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0
    next lint web  keine Fehler

`[cmd]` **JEDE der 10 neuen Proben kann rot werden ? gemessen:**

    A1   Schluessel mit Grossbuchstaben       ROT
    A2   Suchwort rutscht durch               ROT
    A3   Form faellt weg                      ROT
    A4   `null` als „fehlt" gelesen           ROT
    A5   Unsinn ergibt keine Vorgabe          ROT
    A6   Vorgabe geschrieben statt geloescht  ROT
    A7a  Leiste startet zu                    ROT
    A7b  Reiter setzt eigenen Startwert       ROT
    A8   Trefferzahl ohne Erklaerung          ROT
    A9   Vorgabe zaehlt als Filter            ROT

`[cmd]` **Und die KONTROLLE:** ein Kommentar mit `frage`,
`istVorgabe`, `leisteOffen` und `FILTER_SCHLUESSEL` als blossen
Woertern ? **bleibt GRUEN.**

### Was offen bleibt

`[cmd]` **C-511 ist noch nicht da** ? **der Markenpulldown zeigt
weiterhin die 25 haeufigsten plus Eingabefeld.** `[read]` **Die
gewaehlten Marken werden aber schon gespeichert** ? **wenn C-511
kommt, ist nur noch die Reihenfolge im Pulldown nachzuziehen, der
Speicher steht.**

`[read]` **Der Kategorienklick in der Tempomessung hat nicht
gegriffen** ? gespeichert wurde nur die Marke. `[cmd]` **Die
Zahlen (0,7 kB, 2 Zeilen) gelten also fuer den Markenfilter
allein** ? **mit Kategorie waere der Unterschied nicht kleiner.**

`[read]` **Die 7,7 Sekunden mit Filter sind weiter zu viel** ?
**aber sie liegen nicht an der Datenmenge** (G-465: der Weg durch
Next.js und Auth). **Das ist ein eigener Punkt.**

`[read]` **Ein Neustart ist NICHT noetig** ? nur `apps/web/src`
geaendert.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **In `public.user_display_preferences`:**

    dev@lumeos.app | supplements.produkt_filter
      {"form": null, "marken": ["NOW Foods"],
       "status": "On Market", "kategorie": ...}

`[cmd]` **`tab-produkte.tsx` liest sie.** **Proben: web
1821/1821, coach 65/65.**

### Toms These, gemessen

> *,,wenn endlich die filters speicherbar waeren, wuerden die
daten automatisch schrumpfen"*

`[cmd]` **101,1 kB -> 0,7 kB (-99 %), 9.545 -> 7.730 ms
(-19 %).**

> *,,Deine These stimmt ? aber die DATEN fallen viel staerker
als die ZEIT. Das passt zu G-465: die Zeit haengt am Weg durch
Next.js und Auth, nicht an der Menge."*

`[read]` **Er hat bestaetigt UND eingeschraenkt** ? **99 %
weniger Daten, 19 % weniger Zeit.**

`[cmd]` **Die restlichen 7,7 s liegen woanders** ? **das
bleibt offen.**

### Zwei Fallen beim Messen

**1** ? **Die Suche lief ZWEIMAL.**

> *,,Einmal ungefiltert ueber 214.780 Produkte, BEVOR die
gespeicherten Filter da waren; sie wartet jetzt."*

`[read]` **Der Speicher haette nichts gebracht, wenn die Suche
vor ihm startet.**

**2** ? **Seine eigene Probe war falsch.**

> *,,Meine Probe schrieb per PUT gegen den entprellten
Selbstschreiber des Reiters, sodass beide Fotos IDENTISCH
waren ? sie klickt jetzt, wie ein Nutzer."*

`[read]` **Zwei gleiche Fotos haetten *,,kein Unterschied"*
bewiesen** ? **er hat gemerkt, dass die Probe schuld war.**

### Und ein fremder Waechter, zu Recht rot

> *,,`g452` A2 verlangte die Zeile `const STANDARD_STATUS =
'On Market'`, der Wert ist umgezogen, damit Speicher und
Reiter sich EINIG sind."*

`[read]` **Eine Probe, die an einer Zeile haengt statt an der
Wirkung** ? **dieselbe Klasse wie in G-453, G-455, G-460,
G-465.**

### Was offen bleibt

`[cmd]` **C-511 fehlt** ? **die Marken werden schon
gespeichert, nachzuziehen ist die Reihenfolge im Pulldown.**

`[cmd]` **Und die A6-Zahlen gelten fuer den Markenfilter
ALLEIN** ? **der Kategorienklick griff in dem Lauf nicht.**

**Abgenommen.**

