---
nr: G-495
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-527
entscheidung: null
erledigt: 2026-09-08
commit: 2ff9be65
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/produkt-tafel.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-495 - das Etikettenbild beim Oeffnen abrufen

## Toms Entscheidung

Tom, 2026-09-08:

> beim aufruf des produktes den link abrufen und
> sicherheitshalber ein not available bild anlegen, das wir
> zeigen koennen, wenn nichts kommt

## Was C-527 gemessen hat

`[cmd]` **Alle 4.170.423 URL-Zeilen folgen
`https://dsld.od.nih.gov/label/<DSLD-ID>`** ? **eine
Webseite, kein Bildpfad.**

## Ein besserer Weg als die Webseite

`[cmd]` **Die NIH betreibt eine offizielle Schnittstelle:
`https://api.ods.od.nih.gov/dsld/v9/`** ? **sie liefert ein
Label je DSLD-ID, mit den Feldern `pdf` und `thumbnail`.**

`[cmd]` **Im Beispiel der Doku (Label 25) sind BEIDE leer:**
`"pdf": "", "thumbnail": ""`.

`[read]` **Nicht jedes Produkt hat ein Bild** ? **genau dafuer
Toms Rueckfallbild.**

`[read]` **Die Webseite zu zerlegen waere zerbrechlich; die
Schnittstelle ist dafuer gebaut.**

## Was zu messen ist, VOR dem Bauen

    A  liefert die Schnittstelle thumbnail/pdf? An
       zwanzig Produkten gemessen -- wie oft leer?
    B  wie sieht der Wert aus? Ein Pfad, eine volle
       Adresse, ein Bild?
    C  wie schnell antwortet sie? Zehn Aufrufe.
    D  darf der Browser das Bild direkt laden, oder
       braucht es den Server dazwischen?

## Was zu bauen ist

`[read]` **Beim Oeffnen der Tafel, im Reiter *,,Etikett"*:**

    1  die Schnittstelle je dsld_id abrufen
    2  Bild vorhanden: zeigen, dazu der Link zur
       NIH-Seite
    3  kein Bild, Fehler oder Zeitueberschreitung:
       das Rueckfallbild, dazu der Link

`[read]` **Der Link zur NIH-Seite steht IMMER** ? **er ist aus
`dsld_id` berechnet und faellt nie aus.**

### Zwei Fragen, die gemessen und gemeldet werden

`[read]` **Zwischenspeichern?** ? **wer dasselbe Produkt zweimal
oeffnet, soll nicht zweimal abrufen. MISS, was ein Speicher
kostet, und MELDE es ? ein Speicher in der Datenbank waere
Codex.**

`[read]` **Der Seitenschutz (CSP)** ? **miss, ob ein fremdes
Bild ueberhaupt laden darf.**

## Das Rueckfallbild

Tom: *,,ein not available bild"*

`[read]` **Ein ruhiges Bild mit einem Satz, KEIN leeres
Feld** ? **die Lehre aus den Ghostentries.**

`[read]` **Etwa: *,,Fuer dieses Produkt liegt kein
Etikettenbild vor."* und der Link.**

## Abnahmebedingungen

    A1  die Schnittstelle gemessen: wie oft leer, wie
        schnell. Zahl an zwanzig Produkten.
    A2  ein Produkt MIT Bild: das Bild steht. Foto.
    A3  ein Produkt OHNE Bild: das Rueckfallbild. Foto.
    A4  Schnittstelle nicht erreichbar: das
        Rueckfallbild, kein Absturz. Belegt.
    A5  der Link zur NIH-Seite steht in allen drei
        Faellen.
    A6  Zwischenspeichern: gemessen und gemeldet.
    A7  die anderen drei Reiter unveraendert.
    A8  apps/web 1934 oder mehr, apps/coach 65.

## Bericht

**Die Schnittstelle liefert mehr als das Doku-Beispiel — und
trotzdem kein Bild. A2 ist mit dieser Quelle nicht erfuellbar.**

    A1  Schnittstelle gemessen              erfuellt
    A2  ein Produkt MIT Bild                NICHT ERFUELLBAR
    A3  ein Produkt OHNE Bild: Rueckfall    erfuellt
    A4  Schnittstelle unerreichbar: kein
        Absturz                             erfuellt
    A5  der Link steht in allen Faellen     erfuellt
    A6  Zwischenspeichern gemessen+gemeldet erfuellt
    A7  die anderen drei Reiter unveraendert erfuellt
    A8  apps/web 1952/1952, coach 65/65     erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortige Aenderung ist
Codex' C-532.

### A1 — zwanzig echte Ids, nicht das Doku-Beispiel

`[cmd]` **`tools/_g495-messen.mjs`, 2026-09-22**, zwanzig zufaellige
`dsld_id` aus dem eigenen Katalog (`On Market`):

    Antworten 200          20/20
    MIT thumbnail          11/20   (55 %)
    MIT pdf                11/20
    Median                 288 ms
    schnellste / langsamste  279 / 1.069 ms

`[cmd]` **Die Punktdatei nannte das Doku-Beispiel mit BEIDEN
Feldern leer** (*„Label 25: `pdf`:"", `thumbnail`:""*"). `[read]`
**Das ist nicht der Regelfall** — **elf von zwanzig tragen einen
Wert.** `[read]` **Ein Beispiel ist kein Beleg; deshalb die
zwanzig.**

`[read]` **Und neun von zwanzig sind leer** — **genau dafuer Toms
Rueckfallbild.**

### B — und hier bricht es

`[cmd]` **`thumbnail` ist ein DATEINAME, keine Adresse:**

    "thumbnail": "296171_thumbnail.jpg"

`[cmd]` **Sieben Grundadressen gemessen, keine liefert ein Bild:**

    api.ods.od.nih.gov/dsld/s3/thumbnails/…     403
    dsld.od.nih.gov/api/label/<id>/thumbnail    403
    dsld.od.nih.gov/images/…                    403
    api…/v9/label/<id>/thumbnail    200, aber text/html
    api…/v9/thumbnail/…             200, aber text/html
    api…/v9/images/…                200, aber text/html
    dsld-assets.od.nih.gov          kein DNS

`[cmd]` **Die 200er sind die Dokuseite der Schnittstelle**, nicht
ein Bild — `content-type: text/html`, 86 KB.

`[cmd]` **Die Schnittstellenbeschreibung nennt sieben Endpunkte**
(`/v9/label/{id}`, `/v9/search-filter`, `/v9/browse-brands`, …) —
**KEINEN fuer Bilder.**

`[read]` **Ohne Grundadresse gibt es kein Bild zu zeigen.**
`[read]` **Eine zusammengebaute Adresse waere eine Behauptung,
die bei jedem Produkt bricht** — **also gemeldet, nicht geraten.**

`[cmd]` **Das ist der Grund, warum A2 offen bleibt** und nicht
etwa, weil das Produkt keines haette: `332025` (das Produkt auf
dem Foto) **hat** laut Schnittstelle `332025_thumbnail.jpg`.

### Die Etikettseite selbst ist ebenfalls geschuetzt

`[cmd]` **`https://dsld.od.nih.gov/label/332025` antwortet
unserem Aufruf mit 403** — auch aus einem echten Browser heraus:
Titel *„Just a moment…"*, **Cloudflare-Botschutz.**

`[read]` **Das heisst NICHT, dass der Link fuer Tom kaputt ist** —
ein angemeldeter Mensch mit normalem Browser kommt durch, ein
Kopf-loser Automat nicht. `[read]` **Ich kann es von hier aus
nicht belegen, deshalb steht es als Messung da, nicht als
Urteil.**

`[cmd]` **Die Seite zu ZERLEGEN scheidet damit ohnehin aus** — die
Punktdatei nannte das schon *„zerbrechlich"*, jetzt ist es
gemessen.

### D — der Seitenschutz

`[cmd]` **Gemessen: `http://127.0.0.1:3200/v2/supplements` setzt
KEINEN `Content-Security-Policy`-Kopf.** `[read]` **Ein fremdes
Bild duerfte also laden** — **die Frage ist nur gegenstandslos,
solange es keine Adresse gibt.**

### A6 — Zwischenspeichern: gemessen und gemeldet

`[cmd]` **Ein Abruf kostet im Median 288 ms.** `[read]` **Bei
einem Speicher waere die Rechnung: 288 ms je erstem Oeffnen gegen
eine Spalte in `supplier_products`.**

`[read]` **Nicht gebaut, und zwar aus zwei Gruenden:**

**1** — `[read]` **Es gibt nichts zu speichern.** Ein Dateiname
ohne Grundadresse ist kein Bild.

**2** — `[cmd]` **Ein Speicher in der Datenbank waere Codex**
(so steht es in der Punktdatei), **und dieser Auftrag sagt:
nichts in `supabase/`.**

`[cmd]` **Deshalb ruft die Tafel die Schnittstelle GAR NICHT
ab** — **288 ms je Tafel fuer ein Ergebnis, das nicht anzeigbar
ist, waeren eine Rundreise fuer nichts.**

### Was gebaut ist

`[cmd]` **Der Reiter *„Etikett"* zeigt jetzt:**

    das Rueckfallfeld    "Fuer dieses Produkt liegt kein
                         Etikettenbild vor."
    den GRUND darunter   "Die NIH-Schnittstelle nennt zwar einen
                         Dateinamen, aber keine Adresse …
                         (gemessen 2026-09-22 · G-495)"
    den Link             "Etikett bei der NIH ansehen"
                         dsld.od.nih.gov/label/332025

`[read]` **Das Rueckfallbild ist GEZEICHNET, nicht geladen** —
eine Bilddatei fuer einen Satz waere ein zweiter Ort fuer
denselben Text, und sie muesste uebersetzt werden.

`[cmd]` **`dsld_id` kam in den Leseweg** (`produkte-read.ts`) —
**aus ihr wird der Link berechnet.** `[read]` **Er faellt nie
aus** (A5): **kein Abruf, keine Zeitueberschreitung, kein
Fehlerfall.**

`[cmd]` **Und wenn ein Produkt keine `dsld_id` hat**, sagt die
Flaeche das auch: *„Dieses Produkt stammt nicht aus dem
DSLD-Katalog"* — **statt eines Links ins Leere.**

### A4 — kein Absturz

`[read]` **Trivial erfuellt, und das ist der Punkt:** **die Tafel
ruft die Schnittstelle nicht auf.** `[cmd]` **Keine
Zeitueberschreitung, kein `catch`, kein Ladezustand** — der
Reiter rechnet nur aus `dsld_id`.

### A7 — die anderen drei Reiter

`[cmd]` **Gemessen:** `["Überblick 25","Anwendung","Hinweise",
"Etikett"]` — **unveraendert.**

### Was als naechstes zu klaeren waere

`[read]` **Drei Wege, alle ausserhalb dieses Auftrags:**

**1** — `[cmd]` **Bei der NIH nachfragen**, unter welcher Adresse
`<id>_thumbnail.jpg` abrufbar ist. **Ohne diese Angabe ist A2
nicht baubar.**

**2** — `[read]` **Die PDFs** (`<id>_document.pdf`, ebenfalls
11/20) **haben dasselbe Problem** — derselbe fehlende Praefix.

**3** — `[read]` **C-527 wollte die Etikettdaten ohnehin
importieren.** `[cmd]` **Wenn dabei ein Bildpfad mitkommt, ist
G-495 in einer Stunde fertig** — der Reiter steht, es fehlt nur
die Quelle.

### Die Fotos

    x-g495-a3-rueckfall.png   A3/A5/A7: Rueckfallfeld mit Grund,
                              Link, vier Reiter

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src` und `supplements.css`.

## Teilabnahme

**2026-09-08, Orchestrator. A2 ist nicht erreichbar.**

### Die Messung

    20 DSLD-Ids      20/20 antworten 200
    thumbnail        11/20 tragen einen
    Median           288 ms

`[read]` **Das Doku-Beispiel mit zwei leeren Feldern war
nicht stellvertretend** ? **er hat es an echten Ids
gemessen.**

### Warum A2 nicht geht

> *,,`thumbnail` ist ein BLANKER DATEINAME, und sieben
Grundadressen fallen alle ? 403 oder die HTML-Dokuseite der
Schnittstelle selbst. Die Dokumentation listet sieben
Endpunkte, keinen fuer Bilder."*

`[read]` **Und er hat KEINE Adresse erfunden** ? **die
Auflage.**

`[cmd]` **Ich habe selbst nachgemessen: die XLSX hat fuenf
Tafeln, und KEINE traegt einen Bildpfad** ? **`URL`,
`DSLD ID`, `Product Name`, `Brand Name`, `Bar Code`,
`Net Contents`, `Serving Size`, ... kein `Thumbnail`.**

`[read]` **C-527 kann ihn also nicht mitbringen** ? **die
Frage aus seinem Bericht ist damit beantwortet.**

### Was steht

`[cmd]` **Das Rueckfallfeld mit Toms Satz plus dem gemessenen
Grund, und der NIH-Link aus `dsld_id`** ? **er faellt nie aus,
weil nichts abgerufen wird.**

### Eine Messung, kein Urteil

> *,,`dsld.od.nih.gov` antwortet auch einem echten
kopflosen Browser mit 403 (*Just a moment...*, Cloudflare).
Ob es DICH blockiert, kann ich von hier nicht beweisen."*

**Teilabnahme. A2 bleibt offen, die Entscheidung liegt bei
Tom.**
