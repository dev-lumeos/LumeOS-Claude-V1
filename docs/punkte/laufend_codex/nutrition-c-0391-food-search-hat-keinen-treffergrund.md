---
nr: C-391
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-24
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-02
---

# C-391 — `food_search` hat keinen Treffergrund

## Befund

Aus C-384 und C-383, Codex, 2026-09-02.

`[cmd]` **Keines der 16 Ergebnisobjekte von
`food_search('kartoffelstock')` traegt `match_reason`.**

`[read]` **Der Orchestrator hatte G-281 als Beleg genannt** —
`[cmd]` **das betrifft den Supplement-Katalog, eine andere Suche.**

## Was es kostet

`[cmd]` **`kartoffelstock` liefert 16 Treffer, Platz 1 ist
`Kartoffelpueree Instantpulver`** mit `sort_weight 450`.

`[read]` **Ohne Treffergrund laesst sich die Rangfolge nicht
erklaeren** — **weder dem Nutzer noch beim Messen.**

`[cmd]` **C-24 besteht seit Monaten fort**, und jede Messung muss die
Rangfolge neu rekonstruieren.

## Was G-281 gezeigt hat

`[cmd]` **Im Supplement-Katalog nennt die Suche den Grund** — Name,
Alias, Marke, Wirkstoff.

`[read]` **Dasselbe fuer Lebensmittel wuerde drei Punkte auf einmal
messbar machen:** C-24 (Rangfehler), C-30 (Artenstruktur),
C-102 (Milch findet Joghurt).

## Auftrag — der Treffergrund und zwei Spalten

**Mitbeauftragt: C-390, C-387.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-391 — der Treffergrund in `food_search`

`[cmd]` **Du hast es zweimal gemessen: kein `match_reason`.**

`[cmd]` **Im Supplement-Katalog gibt es ihn** (G-281) — Name, Alias,
Marke, Wirkstoff.

`[read]` **Dasselbe fuer Lebensmittel macht drei Punkte auf einmal
messbar:** C-24 (Rangfehler), C-30 (Artenstruktur), C-102 (Milch
findet Joghurt).

`[read]` **Und es erklaert die Rangfolge** — **heute muss jede
Messung sie rekonstruieren.**

`[cmd]` **Die Quellen stehen:** `food_aliases` mit 12
`curated_suchbegriff`, 21.420 `editorial`, 11.102 `derived`;
`024_suchsynonyme.sql`; `sort_weight`.

### 2 · C-390 — die Untergruppe in `tag_definitions`

`[cmd]` **Neun Spalten, keine fuer die Untergruppe** — Claude Code
hat es in G-134 gemeldet.

`[cmd]` **E-49 teilt `diet` in drei:** Ernaehrungsform, Naehrwert,
Kueche.

    Ernaehrungsform   vegan, vegetarian, halal, kosher
    Naehrwert         high_protein, high_fiber, low_carb, low_fat
    Verarbeitung      whole_food, ultra_processed
    Allergene         contains_gluten, contains_lactose,
                      contains_nuts

`[cmd]` **`thai_food` bleibt geparkt** — eine Kueche, bis
`preferred_cuisines` kommt.

`[read]` **Die Spalte gehoert an `tag_definitions`, nicht an
`food_tags`** — **sie beschreibt den Tag, nicht die Zuordnung, und
ueberlebt damit deine vier Kettenschreiber.**

### 3 · C-387 — wie eine Kuration alle vier Schreiber ueberlebt

`[cmd]` **Du hast sie gemessen: 020 (nur INSERT), 027 (loescht
zehn), 032 (loescht halal und kosher erneut), 221 (noch nicht
eingespielt).**

`[read]` **E-55 entscheidet: `food_tags_kuriert` als zweite
Tabelle.** `[read]` **Bau sie noch nicht** — **sag, wie sie gegen
alle vier wirkt, und was 221 daran aendert.**

`[cmd]` **Und 221 braechte `high_fat` und `gluten_free`** — **die
Zahl 14 waere dann 16.**

### Was nicht zu tun ist

**Keine Tags aendern.**
**`food_tags_kuriert` noch nicht anlegen** — erst der Entwurf.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    match_reason     je Treffer, mit Gegenprobe
    kartoffelstock   warum steht Instantpulver auf Platz 1
    Untergruppe      Spalte da, vierzehn Tags zugeordnet
    Kuration         Entwurf gegen alle vier Schreiber
    221              was aendert es

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
