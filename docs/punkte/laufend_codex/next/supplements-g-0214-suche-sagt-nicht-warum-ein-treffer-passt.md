---
nr: G-214
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-186
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/substanz-read.ts
    - apps/web/src/lib/medical/wirkstoff-marke.ts
zahlen: null
---

# G-214 — die Katalogsuche sagt nicht, warum ein Treffer passt

## Befund

Aus G-186, Claude Code, 2026-08-28.

`[cmd]` **Die Suche nach *,,Resveratrol"* findet auch
*Pterostilbene* — ohne zu sagen warum.** Der Treffer entsteht ueber
einen Erklaertext, in dem der andere Stoff vorkommt.

`[read]` **Fuer den Nutzer sieht das aus wie ein Fehler.** Er sucht
einen Stoff und bekommt einen anderen, ohne Verbindung dazwischen.

`[read]` **Die Loesung ist gebaut und liegt daneben:** in G-210 wurde
fuer Handelsnamen genau das gemacht — *,,Scemblix ist ein Handelsname
von Asciminib - Novartis"*. **Der Treffer zeigt, warum er ein Treffer
ist.**

`[read]` **Hier fehlt dieselbe Zeile.** Und der Fall ist unangenehmer
als bei Handelsnamen: **eine Marke ist derselbe Stoff, ein
Erklaertext-Treffer ist ein anderer.** Wer das nicht sagt, laesst den
Nutzer glauben, Pterostilbene sei Resveratrol.

---

`[read]` **Vor dem Bau zu messen:** wie viele Treffer entstehen
ueberhaupt ueber Erklaertexte statt ueber Namen und Synonyme, und
wie oft fuehrt das zu einem fremden Stoff? **Wenn es Einzelfaelle
sind, reicht eine Begruendungszeile. Wenn es die Mehrheit ist, ist
die Suche falsch gewichtet.**

## Verwandt

**G-150** — *die Volltextsuche findet ueber Erklaertexte*. `[read]`
**Vermutlich derselbe Befund aus anderer Richtung; beide vor dem Bau
zusammenlegen oder abgrenzen.**

## Auftrag

**Mitbeauftragt mit C-205 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Neu gemessen, 2026-08-30

**Aus C-205, Codex.**

`[cmd]` **Pterostilbene trifft bei der Suche nach *Resveratrol* ueber
die Beschreibung, ohne sichtbaren Treffergrund.**

`[read]` **Der Treffer ist richtig — die beiden Stoffe gehoeren
zusammen.** **Fehlend ist die Auskunft, nicht die Trefferqualitaet.**

`[cmd]` **`unsupported_sort` meldet einen unbekannten Sortierwert,
nicht einen Treffergrund** — **meine Vermutung, die Auskunft sei
schon da, war falsch.**

## Was zu klaeren ist

`[read]` **Woher kaeme der Grund?** `[cmd]` **Die Suche kennt
Namensfeld, Beschreibung, Alias und Tag** — **welches getroffen hat,
weiss die Funktion, die Anzeige nicht.**

`[read]` **Und ob es eine eigene Ausgabespalte braucht oder ein
Zusatzfeld im JSON, ist eine Bauentscheidung** — **keine
Produktfrage.**

## Auftrag — der Treffergrund

`[read]` **Vorbereitet am 2026-08-30.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag weiss die Anzeige, warum ein Treffer
kam** — **und kann es sagen.**

`[cmd]` **Der Fall aus deiner eigenen Messung:** Pterostilbene trifft
bei *Resveratrol* ueber die Beschreibung. **Der Treffer ist richtig,
die Auskunft fehlt.**

### Was zu bauen ist

`[cmd]` **Die Funktion weiss, welches Feld getroffen hat** — Name,
Beschreibung, Alias oder Tag. **Die Anzeige weiss es nicht.**

`[read]` **Ob das eine eigene Ausgabespalte wird oder ein Feld im
JSON, ist deine Entscheidung.**

`[read]` **Und eine Vorgabe aus dem Bestand:** `[cmd]` **`food_search`
liefert ein JSON-Dokument, keine Tabelle** — **`count(*)` darauf ist
immer 1.** `[read]` **Claude Code hat das am 30.08. gemeldet, nachdem
sein erster Lauf dreimal eine 1 ergab und wie eine Bestaetigung
aussah.** **Miss die Trefferzahl aus dem Dokument, nicht mit
`count(*)`.**

### Was nicht zu tun ist

**Keine Rangregel aendern** — nur die Auskunft.
**Keine Beschreibungen aendern.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Treffergrund je Treffer   vorhanden, belegt an Pterostilbene
    Reihenfolge               unveraendert - Gegenprobe
    Laufzeit                  ms vorher / nachher
    Trefferzahl               aus dem Dokument gezaehlt, nicht
                              mit count(*)

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
