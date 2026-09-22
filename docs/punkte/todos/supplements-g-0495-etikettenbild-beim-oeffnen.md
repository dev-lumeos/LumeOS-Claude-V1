---
nr: G-495
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-527
entscheidung: null
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
