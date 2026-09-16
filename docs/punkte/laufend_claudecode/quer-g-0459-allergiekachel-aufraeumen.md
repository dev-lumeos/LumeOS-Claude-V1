---
nr: G-459
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: [C-503]
kind_von: G-455
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/settings/formular.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-459 - die Allergiekachel aufraeumen

## Toms drei Punkte

Tom, 2026-09-08:

> 1. das kann eine kleinere kachel links neben erfahrungsgrad
>    sein

> 2. smartsearch mit vorschlaegen im pulldown, live bei der
>    eingabe

> 3. kann man tabellarisch schoener machen, dass die eingabe
>    schoen alles in derselben spalte erfolgt

## 1 - der Platz

`[cmd]` **`apps/web/src/app/v2/settings/formular.tsx` traegt
`experience_level`.**

`[read]` **Die Allergiekachel soll kleiner werden und LINKS
daneben.**

## 2 - die Smartsuche

`[read]` **Wartet auf C-503** ? **heute gibt es keine
Stoffliste, gegen die man suchen koennte.**

`[cmd]` **C-503 baut `public.allergens` und eine Suchfunktion
mit `pg_trgm`** ? **wie `search_supplier_products` (C-495).**

`[read]` **Du rufst sie, du baust sie nicht nach.**

`[read]` **Und der Freitext bleibt** ? **wer etwas hat, das
nicht in der Liste steht, traegt es ein, und die Oberflaeche
sagt, dass es dann NICHT gegen Produkte prueft.**

## 3 - tabellarisch

`[read]` **Alle Eingaben in derselben Spalte** ? **Stoff, Art,
Schwere untereinander ausgerichtet, nicht ueber die Breite
verteilt.**

`[cmd]` **Dieselbe Falle wie in G-453** ? **Tom hat sie dort
schon benannt:** *,,nicht so verstreut auf die breite"*.

## Abnahmebedingungen

    A1  kleinere Kachel, links neben Erfahrungsgrad.
        Foto vorher/nachher.
    A2  Smartsuche mit Vorschlaegen, live. Foto beim
        Tippen.
    A3  "laktose" schlaegt das Richtige vor. Foto.
    A4  Freitext moeglich, und die Oberflaeche sagt,
        dass er nicht prueft. Foto.
    A5  tabellarisch, eine Spalte. Foto.
    A6  Kontraste gemessen, nicht geschaetzt.
    A7  die drei bestehenden Allergien bleiben.
    A8  apps/web 1780 oder mehr.

## Berichtigt 2026-09-08 - die Vorschlaege kommen aus den Katalogen

`[read]` **Mein erster C-503 wollte eine neue Stoffliste** ?
**Tom hat widersprochen:**

> user gibt ein, ob es um nahrung/supplement/medikament geht,
> dementsprechend wissen wir, welche produktkataloge SSOT sind

`[cmd]` **Gemessen:**

    NAHRUNG     tag_definitions, 14 Tags
                contains_nuts, contains_gluten,
                contains_lactose
                7.109 von 7.140 getaggt
    SUPPLEMENT  product_contents, supplement_warnings
    MEDIKAMENT  nichts

`[read]` **Die Oberflaeche fragt ZUERST die Art, dann schlaegt
sie aus dem passenden Katalog vor.**

`[read]` **Bei `medikament` sagt sie, dass es noch keinen
Katalog gibt** ? **statt ins Leere zu suchen.**

## Bericht

**Claude Code, 2026-09-16.**

### Der Stand in einem Satz

`[read]` **Die drei Punkte sind gebaut und gemessen** ? **und
unterwegs standen drei Fehler im Weg, die der Auftrag nicht nannte:
ein `<form>` im `<form>`, 27 Sekunden Ladezeit und eine Kachel, die
fuer die halbe Breite nicht gebaut war.**

### A1 ? die kleinere Kachel links neben dem Erfahrungsgrad

**Tom:** *,,das kann eine kleinere kachel links neben erfahrungsgrad
sein."*

`[cmd]` **Gemessen mit `tools/_g459-lage.mjs`** ? nicht die
Reihenfolge im Quelltext, sondern die Geometrie auf dem Schirm:

    Allergien        x  264 ? 744      y  620 ? 1179
    Erfahrungsgrad   x  756 ? 1236     y  594 ? 1027

    linksNeben                 ja
    Hoehenueberschneidung      407 px
    Seitenfehler               0

`[read]` **Beide Bedingungen zaehlen** ? **ganz links davon UND auf
gleicher Hoehe.** `[cmd]` **Eine Kachel darueber erfuellt ,,links
neben" nicht, steht im Quelltext aber genauso.**

**Fotos:** `backup/x-g459-a1-vorher.png` ?
`backup/x-g459-a1-nachher.png`.

#### Der erste Versuch war falsch ? und die Messung hat es gesagt

`[cmd]` **Zuerst als zweites Kind direkt ins Raster gesetzt.** **Bei
`grid-template-columns: 480px 480px` wurde die Kachel zur zweiten
SPALTE**, der rechte Stapel rutschte in Zeile 2, **und der
Erfahrungsgrad stand am Ende unter allem:**

    Kachel bei x=756, Erfahrungsgrad bei x=264
    Hoehenueberschneidung 0

`[read]` **Die rechte Spalte war immer schon ein Stapel** ? **die
linke musste es auch werden.**

`[read]` **Und die Messung selbst war anfangs falsch:** sie hangelte
sich vom Text nach oben, bis ein Kasten groesser als 200x60 kam ?
**und griff den Wrapper statt der Kachel.** `[cmd]` **`Card` rendert
`.v2-card` mit `.v2-card-title`** ? **danach wird gesucht, nicht nach
Groessen.**

### A2/A3 ? die Smartsearch, live bei der Eingabe

**Tom:** *,,smartsearch mit vorschlaegen im pulldown, live bei der
eingabe."*

`[cmd]` **C-503 wird GERUFEN, nichts nachgebaut:**

    nahrung      laktose      Enthaelt Laktose   1.021
                              Treffer ueber ,,laktose"
    supplement   magnesium    8 Vorschlaege, 30.349 / 46 / 31 /
                              17 / 115 / 22 / 1 / 1
    medikament   penicillin   0 Vorschlaege, dafuer die Lucke
    nahrung      qzvwxjplk    keine Liste (A9)

`[read]` **Die Synonymaufloesung ist die Leistung der Funktion** ?
*milchzucker* findet *Enthaelt Laktose*, **ohne dass in der
Oberflaeche ein Wort uebersetzt wird.**

`[cmd]` **Die Art geht ZUERST an die Funktion** ? sie entscheidet,
welcher Katalog gefragt wird. **Beim Wechsel der Art faellt ein
gewaehlter Code mit:** ein `nutrition:`-Code unter `supplement` waere
ein Code der falschen Art, **und der Trigger von C-503 wiese ihn ab.**

**Foto:** `backup/x-g459-a3-vorschlaege.png`.

### A4 ? die Kataloglucke wird gesagt, nicht verschwiegen

`[cmd]` **Bei `medikament` steht auf dem Schirm:**

> Kein Medikamentenkatalog mit Allergie-Verknuepfung vorhanden;
> Freitext wird nicht gegen Medikamente geprueft.

`[read]` **Der Wortlaut kommt aus C-503 (`notice`), nicht aus der
Oberflaeche** ? **ein zweiter Wortlaut hier waere Drift.** `[cmd]`
**Die Zeile hat keinen Code und wird deshalb NICHT als Vorschlag
gelistet** ? **sonst koennte man eine Abwesenheit anklicken.**

**Foto:** `backup/x-g459-a4-katalogluecke.png`.

### A5 ? notiert oder geschuetzt

**Der Auftrag:** *,,Der Unterschied zwischen ,ich habe es notiert' und
,LumeOS schuetzt mich davor'."*

`[cmd]` **Drei Zustaende gemessen, mit Farbe:**

    vorher      Freitext: LumeOS notiert den Stoff, prueft aber
                keine Produkte dagegen.       oklch(0.4 …) grau
    nach Klick  Aus dem Katalog ? wird gegen 1.021 Eintraege
                geprueft.                     oklch(0.52 …) gruen
    dann tippen wieder Freitext, Feld ,,eigenes wort"

`[read]` **Der dritte Zustand ist der wichtige:** **wer nach der
Auswahl weitertippt, faellt zurueck auf Freitext** ? **sonst truege
die Zeile einen Code, der nicht zum Wort passt.**

`[cmd]` **Die Datenbank zieht dieselbe Grenze** (2026-09-16
gemessen): `stoff_code IS NULL` geht durch, ein erfundener Code loest
eine Ausnahme aus.

**Foto:** `backup/x-g459-a5-geprueft.png`.

### A6 ? tabellarisch, alles in derselben Spalte

**Tom:** *,,kann man tabellarisch schoener machen, dass die eingabe
schoen alles in derselben spalte erfolgt."*

`[cmd]` **Gemessen, wo jedes Feld beginnt:**

    Art, Stoff, Schwere, Reichweite, Knopf
    linke Kante:  379 / 379 / 379 / 379 / 379 px

`[read]` **Die Beschriftungsspalte ist FEST (86 px), nicht `auto`** ?
**bei `auto` bestimmte das laengste Wort die Kante, und ein neues Feld
verschoebe alle anderen.**

### A7 ? die Kontraste, gemessen statt geschaetzt

    12 Faelle, 0 durchgefallen, kleinster 5.18:1

    5.18   geprueft-Satz (gruen)      >= 4.5   OK
    8.57   Kataloglucke               >= 4.5   OK
    9.19   Beschriftung, Trefferzahl  >= 4.5   OK
    17.33  Knopf                      >= 4.5   OK
    18.11  Auswahlliste               >= 4.5   OK

#### Der erste Lauf war gruen und hat nichts gemessen

`[cmd]` **4 Faelle, 0 durchgefallen** ? **aber weder der gruene Satz
noch die Kataloglucke standen auf dem Schirm.** **0 von den falschen
4.**

`[cmd]` **Zwei Gruende, beide behoben:**

    el.children.length > 0    beide Saetze tragen ein <Icon>
                              und wurden NIE geprueft
    Schluessel ohne Klasse    ,,Art" verdeckte die Kataloglucke
                              (beide 11,5 px in --fg-muted)

`[read]` **Jetzt zaehlt EIGENER Text, nicht Kinderlosigkeit** ? und
**der Zustand steht im Schluessel**, sonst verdeckt der erste Zustand
den dritten.

### A8 ? die drei bestehenden Allergien, mit ihren Zahlen

`[cmd]` **Auf dem Schirm, `dev@lumeos.app`, 2026-09-16:**

    Soja                 Nahrung      prueft 60 Eintraege
    lactose              Nahrung      prueft 1.021 Eintraege
    Magnesium Stearate   Supplement   prueft 56.948 Eintraege

`[read]` **56.948 ist die Probe auf die Mechanik** ? **ein
PostgREST-Deckel zeigte hier 1.000.**

`[read]` **Eine fehlende Zahl wird NICHT zu 0** ? in Preferences steht
*,,aus dem Katalog"*, **weil diese Seite die Zahlen nicht liest.**
`[cmd]` **Eine 0 saehe aus wie ,,trifft nichts", und das ist eine
andere Aussage als ,,nicht gemessen".**

### Drei Fehler, die der Auftrag nicht nannte

#### 1. Ein `<form>` im `<form>` ? neun Hydrationsfehler

`[cmd]` **Seit A1 steht die Kachel in der Spalte des Profilformulars,
also INNERHALB von dessen `<form>`.**

    vorher   9 x ,,Hydration failed" je Seitenaufruf
    nachher  0

`[read]` **Ein `<form>` im `<form>` ist ungueltiges HTML:** der
Browser zieht das innere beim Einlesen heraus, **der Server hatte es
verschachtelt ausgeliefert.**

`[cmd]` **Die Kachel baut jetzt ein `<div>`.** **Die Eingabetaste kam
vom `<form>`** ? **sie ist eigens wiederhergestellt**, sonst haette
die Kachel eine Bedienung verloren, die sie vorher hatte.

#### 2. A8 kostete 27 Sekunden

`[cmd]` **Der erste Entwurf blaetterte 57 Runden a 1.000 Zeilen
herueber und zaehlte im Javascript. GEMESSEN:**

    mit den Zahlen        27.677 / 27.696 / 27.775 ms
    Gegenprobe ohne sie      774 /    728 /    718 ms
    nach der Behebung      2.076 /  2.166 /  3.340 ms

`[read]` **Die Gegenprobe hat den Grund allein auf diese Funktion
eingegrenzt** ? **ohne sie waere ,,die Seite ist langsam" eine
Vermutung geblieben.**

`[cmd]` **`head: true` schickt keine Zeilen, `count: 'exact'` gibt die
Zahl** ? gezaehlt wird dort, wo die Zeilen liegen. **Die drei Zahlen
sind danach dieselben: 60 / 1.021 / 56.948.**

`[read]` **Schoener waere eine Zaehlfunktion in der Datenbank** ?
**aber `supabase/` ist gesperrt. Gemeldet, nicht gebaut.**

#### 3. Die Kachel war fuer die volle Breite gebaut

`[cmd]` **Das Foto zeigte, was die Zahlen nicht sagten:**

    Titel und Untertitel lagen uebereinander
    ,,Entfernen" brach in eine eigene Zeile
    bei Magnesium Stearate auch die Reichweite

`[read]` **Ein Umbruch ist kein Fehler ? ein UNGEORDNETER ist einer:**
mal zwei Zeilen, mal drei, **und die Knoepfe standen nicht
untereinander.**

`[cmd]` **Die Zeile ist jetzt ein festes Raster aus zwei Zeilen.**
`[cmd]` **Der Kopf bekam eine eigene Klasse** ? **`.v2-card-h` liegt
in `packages/ui` und gehoert allen Apps.** **Eine Aenderung dort
traefe jede Kachel im Produkt, fuer ein Problem, das nur diese hat.**

### A9 ? die Gegenprobe mit einer erfundenen Eingabe

    nahrung / qzvwxjplk    0 Vorschlaege, keine Liste,
                           keine Kataloglucke, keine Fehler

`[read]` **Kein Vorschlag und kein erfundener Code** ? **die Kachel
bietet nichts an, was die Datenbank abweisen wuerde.**

### A10 ? die Waechter

    apps/web     1793 Proben    1793 gruen    0 rot
    apps/coach     65 Proben      65 gruen    0 rot
    tsc web/coach            exit 0
    next lint web/coach      exit 0, keine Fehler

**Neu: 13 Proben in `g459-allergiekachel.test.ts`.**

`[cmd]` **JEDE kann rot werden ? gemessen, nicht behauptet:**

    A1/A2  prueftProdukte immer true        ROT
    A3     eigene Funktion statt C-503      ROT
    A5     Zeile ohne Code als Vorschlag    ROT
    A6     Code wieder aus dem Text         ROT
    A7     Kachel schickt den Code nicht    ROT
    A8     Artwechsel loest nicht           ROT
    A9     Raster wieder flex               ROT
    A10    wieder ein <form>                ROT
    A11    wieder .range()                  ROT
    A12    fehlende Zahl wird 0             ROT

`[cmd]` **Und die KONTROLLE:** ein Kommentar, der `<form>`, `.range(`,
`stoffCode(` und `Medikamentenkatalog` als blosse Woerter enthaelt ?
**bleibt GRUEN.** `[read]` **Ohne sie wuerde die Reihe nur messen,
dass jemand die Datei angefasst hat.**

#### Ein fremder Waechter wurde rot ? zu Recht

`[cmd]` **`g455-allergien` A2 prueft, dass Settings die Kachel zeigt**
? und las dafuer `page.tsx`. **A1 hat sie nach `formular.tsx`
verschoben.**

`[read]` **Die Kachel wurde nicht entfernt, nur verschoben** ? **die
Probe bewachte die DATEI, nicht die SACHE.** `[cmd]` **Jetzt gilt die
ganze Route.** `[cmd]` **Gegengeprobt:** Kachel aus `formular.tsx`
entfernt ? **ROT.**

### Der Baustein steht weiter an ZWEI Orten

`[cmd]` **`/v2/nutrition?tab=prefs` gemessen:** dieselbe Kachel,
dieselben drei Zeilen, **Vorschlaege und Spaltenkanten identisch**
(379 px, `Enthaelt Laktose` 1.021), **0 Seitenfehler.**

### Was gebaut wurde

    NEU        lib/allergien/vorschlaege-read.ts
                 ladeVorschlaege (C-503), ladeTrefferzahlen
               app/api/allergien/vorschlaege/route.ts
               app/v2/settings/__tests__/g459-allergiekachel.test.ts
               tools/_g459-pruef.mjs      Vorschlaege, Spalte
               tools/_g459-klick.mjs      notiert/geschuetzt
               tools/_g459-kontrast.mjs   A7, drei Zustaende
               tools/_g459-lage.mjs       A1, die Geometrie
               tools/_g459-sabotage.mjs   10 + 1 Kontrolle
               tools/_g459-dauer.mjs      die 27 Sekunden

    GEAENDERT  app/v2/settings/allergien-kachel.tsx
                 Raster statt flex, Vorschlaege, kein <form>,
                 Reichweite je Zeile
               app/v2/settings/formular.tsx     Kachel links
               app/v2/settings/page.tsx         reicht durch
               app/v2/settings/allergie-aktionen.ts  stoff_code
               lib/allergien/allergie-read.ts   kein stoffCode()
               lib/allergien/allergie-lage.ts   Vorschlag, …
               app/globals.css                  Raster, Liste, Kopf
               __tests__/g455-allergien.test.ts A2 nachgezogen
               tools/_g455-pruef.mjs            Reichweite je Zeile

`[cmd]` **Nichts in `supabase/`, nichts committet.**

`[cmd]` **`backup/c276/supplement-kern-dubletten.json` hatte ein
Waechterlauf neu geschrieben** ? **zurueckgenommen** (in `backup/`
loescht niemand ausser Tom).

### Was offen bleibt

`[cmd]` **Drei Dateien unter `supabase/` sind veraendert** ?
`kette.json` und zwei Pruefdateien zu C-495/G-454. **Die sind NICHT
von mir** (Zeitstempel 16:06 und 16:19, Inhalt Suchfilter) ? **Codex
arbeitet an G-454.**

`[read]` **Die Trefferzahlen kosten weiter ~1,4 Sekunden** ? eine
Anfrage je Allergie. `[read]` **Eine Zaehlfunktion in der Datenbank
machte daraus eine einzige** ? **das waere ein Auftrag fuer Codex,
kein Nachtrag hier.**

`[read]` **Der Zaehler der Kachel (die `3`) steht jetzt unter dem
Untertitel**, weil der Kopf umbrechen darf. **Gemeldet, nicht
gedreht** ? es ist eine Geschmacksfrage, und Tom sieht das Foto.

`[read]` **Ein Neustart ist NICHT noetig** ? nur `apps/web/src` und
`globals.css` geaendert, beides laedt heiss nach.

## Abnahme

_(vom Orchestrator)_
