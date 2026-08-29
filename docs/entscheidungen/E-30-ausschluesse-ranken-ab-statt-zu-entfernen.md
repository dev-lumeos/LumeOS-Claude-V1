---
nr: E-30
getroffen: 2026-08-29
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-347, G-116]
modul: nutrition
---

# E-30 — Ausschluesse ranken ab, wenn ausdruecklich gesucht wird

## Frage

`[cmd]` **`schokolade` liefert 162 Treffer ohne Vorlieben und 0 mit.**
`[cmd]` **Ursache ist der generelle Ausschluss, nicht die Allergie:**
162 der Treffer tragen `ultra_processed`, 10 tragen
`contains_nuts`.

## Entscheidung

Tom, 2026-08-29: *,,wenn jemand explizit nach einem generellen
ausschluss sucht darf der kommen. beachte in deinem beispiel
schokolade… wenn einer zb schwarze schokolade disliked oder
ausgeschlossen hat und dann nach schokolade sucht kommen alle andere
vorher angezeigt."*

**Wer ausdruecklich sucht, bekommt Treffer — die ausgeschlossenen
zuletzt, nicht gar nicht.**

## Was der Satz praeziser sagt als die Frage

`[read]` ***,,Alle anderen vorher"* ist keine Filterregel, sondern
eine Reihenfolge.** **Die Ausgeschlossenen kommen trotzdem, nur
hinten.**

`[read]` **Und er trennt zwei Faelle, die heute gleich behandelt
werden:**

    schwarze Schokolade ausgeschlossen, Suche "schokolade"
      -> Vollmilch, weisse, Nuss zuerst - schwarze zuletzt

    ultra_processed ausgeschlossen, Suche "schokolade"
      -> alle 162 tragen es; "alle anderen" ist leer

`[cmd]` **Deshalb ist das Ergebnis heute 0 und nicht *,,ein paar
weniger"*.** `[read]` **Ein spezifischer Ausschluss traefe vielleicht
zwanzig Treffer, ein genereller trifft alle.**

## Was daraus folgt

`[cmd]` **Die Stufe existiert bereits:** starke Filter wirken nur ohne
Suchbegriff und ranken sonst ab. **Generelle Ausschluesse sind heute
hart zugewiesen.**

`[read]` **Sie bekommen dieselbe Stufe** — und die Rangfolge muss die
Ausschlusstiefe abbilden, **nicht nur *ausgeschlossen ja/nein*.**

## Was unberuehrt bleibt

`[read]` **Allergien sind kein genereller Ausschluss.** `[cmd]`
`is_exclusion_relevant` traegt heute `contains_gluten`,
`contains_lactose`, `contains_nuts`, `vegan`, `vegetarian`.

`[read]` **Wer eine Nussallergie eingetragen hat, will Nuesse nicht
weiter unten sehen, sondern gar nicht** — das ist eine andere Klasse
und aendert sich hier nicht.
