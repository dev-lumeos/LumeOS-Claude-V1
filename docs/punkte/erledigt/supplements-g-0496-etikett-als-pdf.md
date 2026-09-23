---
nr: G-496
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-495
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 213c7cf3
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/produkt-tafel.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-496 - das Etikett als PDF, Toms Fund

## Toms Fund

Tom, 2026-09-08:

> versuch mal die produktid auf diese url mit dieser logik zu
> binden: https://api.ods.od.nih.gov/dsld/s3/pdf/542.pdf
> koennen wir dann bilder daraus nehmen?

`[cmd]` **Selbst abgerufen: `application/pdf`, und OHNE
maschinenlesbaren Text.**

`[read]` **Ein gescanntes Etikett** ? **genau das Bild.**

`[read]` **Das loest A2 aus G-495, wo die Schnittstelle nur
einen blanken Dateinamen lieferte.**

## Was G-495 gemessen hat

    20 DSLD-Ids   20/20 antworten 200
    thumbnail     11/20 tragen einen, blanker Dateiname
    Median        288 ms
    sieben Grundadressen probiert, alle 403 oder HTML

`[cmd]` **Und die XLSX traegt keinen Bildpfad** ? **selbst
gemessen, fuenf Tafeln.**

## Zu messen, VOR dem Bauen

    A  haelt das Muster s3/pdf/<dsld_id>.pdf? An
       zwanzig Ids gemessen -- wie viele antworten,
       wie viele fallen?
    B  wie gross sind die PDFs? Median.
    C  hat "thumbnail" dieselbe Grundadresse?
       s3/thumbnails/<dateiname> probieren -- MESSEN,
       nicht raten. Ein Bild waere billiger als ein PDF.
    D  darf der Seitenschutz (CSP) ein fremdes PDF
       einbetten?

## Zwei Wege

**a** ? **das PDF direkt zeigen**, `<embed>` oder `<iframe>`.

`[read]` **Kein Rechnen, aber der Seitenschutz muss es
erlauben.**

**b** ? **Seite 1 in ein Bild wandeln**, serverseitig, einmal
je Produkt.

`[read]` **Teurer, aber ein echtes Bild.**

`[cmd]` **Wenn C ein Bild liefert, faellt beides weg.**

`[read]` **MISS zuerst, EMPFIEHL, dann bau den einfachsten
Weg, der traegt.**

## Was bleibt

`[cmd]` **Das Rueckfallfeld aus G-495 bleibt** ? **fuer die
Produkte ohne PDF.**

`[cmd]` **Und der NIH-Link bleibt** ? **er faellt nie aus.**

## Abnahmebedingungen

    A1  haelt das Muster? Zahl an zwanzig Ids.
    A2  hat thumbnail eine Grundadresse? Gemessen.
    A3  der gewaehlte Weg, begruendet.
    A4  ein Produkt MIT Etikett: es steht. Foto.
    A5  ein Produkt OHNE: das Rueckfallfeld. Foto.
    A6  Schnittstelle nicht erreichbar: kein Absturz.
    A7  der NIH-Link steht in allen Faellen.
    A8  Zwischenspeichern: gemessen und gemeldet.
    A9  die anderen drei Reiter unveraendert.
    A10 apps/web 1952 oder mehr, apps/coach 65.

## Bericht

**Toms Adresse traegt — und die zweite, aus dem API-Guide, macht
beide Wege aus dem Auftrag ueberfluessig.**

    A1   haelt s3/pdf/<id>.pdf?        20/20
    A2   hat thumbnail eine Adresse?   ja, aber NICHT aus dem
                                       Dateinamen
    A3   der gewaehlte Weg, begruendet  erfuellt
    A4   ein Produkt MIT Etikett        erfuellt
    A5   ein Produkt OHNE               erfuellt
    A6   nicht erreichbar: kein Absturz erfuellt
    A7   der NIH-Link in allen Faellen  erfuellt
    A8   Zwischenspeichern gemessen     erfuellt
    A9   die anderen drei Reiter        erfuellt
    A10  apps/web 1960/1960, coach 65/65 erfuellt
    A11  traegt s3/pdf/thumbnails/…jpg? 20/20
    A12  das Bild, kein PDF gerendert   erfuellt
    A13  die Grenze 1.000/h im Code     erfuellt
    A14  die Quelle genannt             erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortigen Aenderungen sind
Codex' C-531.

### A1/A11 — beide Adressen gemessen, dieselben zwanzig Ids

`[cmd]` **`tools/_g496-messen.mjs`, 2026-09-23** (dieselben Ids wie
in G-495, damit die Zahlen vergleichbar sind):

                 trifft   Median   kleinste/groesste   Dauer
    JPEG          20/20    21 KB      13 / 41 KB       291 ms
    PDF           20/20   274 KB     79 / 1.940 KB     320 ms

`[cmd]` **Beide Muster halten bei allen zwanzig**, und die PDFs
tragen echte `%PDF-`-Bytes, die JPEGs echte `FF D8 FF`.

`[read]` **Das Bild ist DREIZEHNMAL kleiner** — und braucht keinen
Betrachter, kein Rendern, kein fremdes Paket.

### A2 — warum meine sieben Versuche fielen

`[cmd]` **Die Schnittstelle nennt einen blanken Dateinamen**
(`296171_thumbnail.jpg`). `[cmd]` **Ich habe in G-495 sieben
Grundadressen davor gesetzt — alle 403.**

`[cmd]` **Toms Fund aus dem API-Guide:** die Adresse geht aus der
**ID**, nicht aus dem Dateinamen:

    s3/pdf/thumbnails/<id>.jpg

`[cmd]` **Und ich habe es nachgemessen:** `s3/thumbnails/…`,
`s3/thumbnail/…`, `s3/images/…`, `s3/image/…`, `s3/jpg/…`,
`s3/thumb/…`, `s3/<datei>` — **alle sieben 403 mit
`application/xml`** (S3-Zugriffsverweigerung). **Nur unter
`s3/pdf/` ist etwas oeffentlich.**

`[read]` **Der Dateiname war die ganze Zeit eine Sackgasse.**

### Und noch ein Befund: die API untertreibt

`[cmd]` **`GET /v9/label/<id>` nennt bei 11 von 20 einen
`thumbnail`-Namen** — **das Bild gibt es aber bei 20 von 20.**

`[cmd]` **`47440` ist der Beleg:** kein Dateiname in der Antwort,
**und `s3/pdf/thumbnails/47440.jpg` liefert 18 KB JPEG.**

`[read]` **Deshalb wird die API GAR NICHT gefragt** — sie kostete
288 ms fuer eine Auskunft, die falsch waere. **Die Adresse steht
aus der `dsld_id` fest.**

### A3 — der gewaehlte Weg, und warum die anderen ausscheiden

**Weg a — das PDF einbetten:** `[cmd]` **Die NIH schickt
`X-Frame-Options: DENY`** (gemessen am Antwortkopf), **und im
Browser gegengeprueft: ein `<iframe>` auf die fremde Adresse
bleibt leer.**

`[cmd]` **Interessant und gemessen:** ueber die EIGENE Herkunft
ausgeliefert zeigt der Browser dasselbe PDF vollstaendig —
`X-Frame-Options` gilt der Herkunft, nicht der Datei. `[read]`
**Ein Weg waere es also gewesen.**

**Weg b — Seite 1 wandeln:** `[cmd]` **Das Werkzeug fehlt
vollstaendig:** weder ein Paket (`pdf*`, `sharp`, `canvas` — keines
in `package.json`) noch ein Systembefehl (`pdftoppm`, `magick`,
`gs`, `mutool` — alle vier fehlen). `[cmd]` **Und
`code-quality.md` verbietet neue Pakete ohne eigenen Auftrag.**

**Gewaehlt: das JPEG.** `[read]` **Es macht beide Fragen
gegenstandslos** — 21 KB statt 274, ein `<img>` statt eines
Betrachters, und der Seitenschutz spielt keine Rolle mehr.

### A12 — und ein Fehler, den nur die Messung gefunden hat

`[cmd]` **Erste Fassung: das Bild wurde NIE abgerufen.** `[cmd]`
**Gemessen: `netz: []`, `complete: false`, die Flaeche stand auf
*„lädt …"*.**

`[read]` **Der Grund war meine eigene Bedingung:** das `<img>` trug
`loading="lazy"` UND `display: none`, bis es geladen war. **Ein
lazy-Bild, das nicht im Sichtfeld steht, laedt nie** — **also wird
es nie sichtbar.** `[read]` **Die Bedingung verhinderte genau das
Ereignis, auf das sie wartete.**

`[cmd]` **Jetzt `visibility` statt `display`, kein `lazy`** —
gemessen: **400 × 123 px geladen, sichtbar, 0 iframes.**

### A6 — kein Absturz

`[cmd]` **Der Abruf wurde abgebrochen** (`route.abort()`, wie bei
einer Stoerung). `[cmd]` **Gemessen: Rueckfallfeld steht, Link
steht, Quelle steht, Tafel steht, vier Reiter, keine
Seitenfehler.**

`[cmd]` **Und die Route selbst:**

    echte Kennung    200  image/jpeg
    unbekannte       404  application/json
    keine Zahl       400  application/json

`[read]` **`403` der NIH wird zu `404`** — fuer die Oberflaeche ist
*„kein Etikett"* dasselbe, ob die Quelle schweigt oder keines hat.

### A13 — die Grenze, mit eigenem Zweig

`[cmd]` **Aus dem Guide:** *„No API key needed for up to 1.000
requests/hour per IP"*, darueber `429` mit `Retry-After`.

`[cmd]` **Im Code vermerkt, und `429` hat einen eigenen Zweig** —
**wer die Grenze reisst, liest das, nicht *„kein Etikett"*.**
`[cmd]` **`Retry-After` wird weitergereicht.**

### A8 — Zwischenspeichern: gemessen und gemeldet

`[cmd]` **Ein Abruf: 21 KB in 291 ms.** `[cmd]` **Die Grenze:
1.000 je Stunde und IP** — **und die IP ist der SERVER, nicht der
Nutzer.**

`[read]` **Fuer die Tafel reicht das bei weitem:** wer in einer
Stunde 1.000 Produkte aufklappt, tut etwas anderes als suchen.

`[cmd]` **Gebaut ist der Browserspeicher:** `cache-control:
private, max-age=3600`. **Dasselbe Etikett zweimal zu oeffnen
kostet keinen zweiten Abruf.**

`[read]` **Gemeldet, nicht gebaut:** **sobald mehr als die Tafel
das Bild nutzt** — eine Liste mit Vorschaubildern, ein Export, ein
Stapellauf — **reisst die Grenze.** `[cmd]` **Ein Speicher in der
DATENBANK waere Codex** (eine Spalte oder ein Bucket), **und der
Auftrag sagt: melden, nicht bauen.**

`[cmd]` **Die Zahl dafuer:** 214.780 Produkte × 21 KB ≈ **4,3 GB**,
und bei 1.000/h waere ein vollstaendiger Durchlauf **neun Tage**.
`[read]` **Ein Vorrat auf Vorrat lohnt also nicht** — **ein
Speicher beim ersten Oeffnen schon.**

### A14 — die Quelle

`[cmd]` **Die Daten sind gemeinfrei (CC0 1.0)** — **und die Quelle
steht trotzdem am Bild**, nicht nur im Quelltext:

> *Quelle: National Institutes of Health, Office of Dietary
> Supplements · Dietary Supplement Label Database (CC0 1.0)*

`[cmd]` **In `v2-muted`, nicht `v2-dim`** — der G-453-Waechter hat
`v2-dim` mit **2,88:1** gemessen, WCAG AA verlangt 4,5. `[read]`
**Eine Quellenangabe, die man nicht lesen kann, ist keine.**

### Der Waechter

`[cmd]` **`g496-etikettenbild.test.ts`, 8 Faelle.** `[cmd]`
**`_g496-sabotage.mjs`: 14 Schaeden plus Kontrolle — 15/15.**

`[cmd]` **Erster Lauf: 12/15.** `[read]` **Drei gruen, keiner ein
blinder Waechter:**

    2x  mehrzeiliger Suchtext -- trifft in CRLF nie
    1x  die Zahl „1.000" steht VIERMAL in der Datei;
        ein Schaden an einer Stelle liess die anderen
        die Zusicherung erfuellen

`[read]` **Dieselben zwei Ursachen wie in G-489 und G-493** — sie
stehen jetzt im Kopf der Probe.

`[cmd]` **Ein Fall prueft ausdruecklich den Fehler von oben:**
*„das Bild wird wieder lazy und versteckt"* — **rot.**

### Die Fotos

    x-g496-a12-bild.png       A4/A12/A7/A14: das Etikett, der
                              Link, die Quelle
    x-g496-a5-rueckfall.png   A5/A6/A7: das Rueckfallfeld bei
                              abgebrochener Verbindung
    x-g496-probe-eigene-herkunft.png
                              die Messung zu Weg a: dasselbe PDF
                              zeigt der Browser, wenn es von der
                              EIGENEN Herkunft kommt

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src` und `supplements.css`.
`[cmd]` **Die neue Route** (`api/supplements/etikett`) **ist eine
Datei unter `src/`** und wird beim ersten Aufruf uebersetzt.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g496-a12-bild.png` angesehen: das Etikett steht,
darunter *,,Etikett bei der NIH ansehen"* und die Quelle
(CC0 1.0).**

`[cmd]` **Und der Knopf heisst jetzt ueberall `Hinzufuegen`.**

`[cmd]` **Proben: web 1960/1960, coach 65/65.**

### Gemessen, dann entschieden

                 trifft   Median   Dauer
    JPEG         20/20     21 KB   291 ms
    PDF          20/20    274 KB   320 ms

`[read]` **13-mal kleiner und ohne Betrachter** ? **darum das
Bild, und beide Wege aus dem Punkt fielen weg.**

### Warum seine sieben Versuche fielen

> *,,Die API gibt einen BLANKEN Dateinamen, und ich habe ihn
immer vorangestellt. Toms Muster leitet den Pfad aus der ID ab."*

`[cmd]` **Nachgemessen: `s3/thumbnails/`, `s3/images/`,
`s3/thumb/` und fuenf weitere ? alle 403.** **Nur `s3/pdf/`
ist ueberhaupt oeffentlich.**

### Und die API untertreibt

> *,,Sie nennt ein Thumbnail fuer 11 von 20, das Bild gibt es
fuer 20 von 20. 47440 beweist es ? kein Dateiname in der
Antwort, 18 KB JPEG an der abgeleiteten Adresse."*

`[read]` **Darum fragt die Route die API gar nicht** ? **der
Aufruf kostete 288 ms fuer eine falsche Antwort.**

### Ein Fehler, den nur die Messung fand

> *,,Meine erste Fassung holte das Bild NIE ? `netz: []`. Das
`<img>` hatte `loading=lazy` und `display: none` bis geladen:
ein traeges Bild, das nie im Blick ist, laedt nie, also wird es
nie sichtbar. Die Bedingung blockierte genau das Ereignis, auf
das sie wartete."*

### Und A3 ist beantwortet

`[cmd]` **Die NIH sendet `X-Frame-Options: DENY`** ? **ein
Rahmen auf ihre Adresse bleibt leer.**

`[read]` **Aus unserer Herkunft gereicht rendert dasselbe PDF
vollstaendig ? er hat es fotografiert.** **Der Weg waere
gangbar gewesen, nur ueberfluessig.**

**Abgenommen.**


## Der Api-Guide, 2026-09-08

Tom: *,,lies den api guide, vielleicht gibts den label per
api"*

`[cmd]` **`dsld.od.nih.gov/api-guide` selbst abgerufen** ?
**die Seite laedt ihren Inhalt erst im Browser, der Abruf gibt
nur das Geruest.**

`[cmd]` **Ueber die Suche gefunden: ein TypeScript-Client fuer
die DSLD (`github.com/knorby/nih-dsld-client`) dokumentiert:**

> *`GET /v9/label/{id}` ? the full label model. The response
also includes a client-derived `thumbnailUrl`
(`{baseUrl}/s3/pdf/thumbnails/{id}.jpg`) pointing at the
label's thumbnail JPEG*

`[read]` **Das Muster geht aus der ID, NICHT aus dem blanken
Dateinamen** ? **darum fielen die sieben Grundadressen aus
G-495.**

    Bild   api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/<id>.jpg
    PDF    api.ods.od.nih.gov/dsld/s3/pdf/<id>.pdf

`[cmd]` **Ich darf die zusammengebaute Adresse nicht selbst
abrufen** ? **PRUEFE sie.**

`[read]` **Ein JPEG waere billiger als ein PDF und braucht
kein Rendern** ? **wenn es traegt, fallen beide Wege oben
weg.**

### Und eine Grenze

`[cmd]` **Derselbe Client nennt:** *,,No API key needed for up
to 1,000 requests/hour per IP."* **Plus getippte Fehler mit
`Retry-After` bei 429.**

`[read]` **1.000 je Stunde ist viel fuer eine Tafel, wenig fuer
einen Stapellauf** ? **das spricht fuer Zwischenspeichern,
sobald mehr als eine Tafel es nutzt.**

`[cmd]` **Die Daten sind gemeinfrei (CC0 1.0), die Quelle wird
genannt: National Institutes of Health, Office of Dietary
Supplements.**

### Zusaetzliche Abnahmebedingungen

    A11 traegt s3/pdf/thumbnails/<id>.jpg? An zwanzig
        Ids gemessen.
    A12 wenn ja: das Bild wird gezeigt, kein PDF
        gerendert. Foto.
    A13 die Grenze 1.000/Stunde im Code vermerkt.
    A14 die Quelle genannt, wo das Bild steht.

