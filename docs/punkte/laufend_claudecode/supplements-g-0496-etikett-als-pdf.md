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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

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

