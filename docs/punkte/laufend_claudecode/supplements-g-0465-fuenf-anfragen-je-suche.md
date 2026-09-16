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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

