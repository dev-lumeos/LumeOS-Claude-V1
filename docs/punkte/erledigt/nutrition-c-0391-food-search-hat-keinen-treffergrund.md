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
erledigt: 2026-09-02
commit: 77cb7fb6
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

### C-391/C-390 gebaut und gemessen am 2026-09-02

`nutrition.food_search` führt jetzt an jedem Eintrag unter
`foods[].match_reason` ein JSON-Objekt. Die möglichen Wege sind
`browse`, `name_exact`, `name_prefix`, `name_word_start`,
`alias_exact`, `alias_prefix`, `alias`, `synonym`, `name` und
`token_group`; Aliasgründe nennen zusätzlich ihre Herkunft. Die Funktion
ändert weder Filter noch `ORDER BY`.

Die Gegenprobe liegt als
`supabase/_pipeline/_validierung/nutrition-c391-food-search-match-reason.test.ts`
vor und war zuerst rot (fehlender Wert), danach grün. Sie sichert die
vollständige bisherige 16er-Reihenfolge für `kartoffelstock`, einen exakten
Namenstreffer und einen kuratierten Alias.

`kartoffelstock` erklärt sich jetzt pro Treffer: Alle 16 kommen aus dem
`openthesaurus`-Synonym, beim ersten über `kartoffelpueree`.
`K213000 Kartoffelpüree Instantpulver` bleibt unverändert Platz 1, weil es
nach der gleichen Textstufe `sort_weight 450` trägt. Der Treffergrund macht
den Rangfehler sichtbar, er korrigiert ihn nicht.

`nutrition.tag_definitions.filter_group` ist live und hat einen CHECK auf
`dietary_pattern`, `nutrient`, `processing` und `allergen`. Alle 14
vorhandenen Tags sind zugeordnet:

    dietary_pattern  vegan, vegetarian, halal, kosher, thai_food (geparkt)
    nutrient         high_protein, high_fiber, low_carb, low_fat
    processing       whole_food, ultra_processed
    allergen         contains_gluten, contains_lactose, contains_nuts

Die Metadaten liegen damit am Tag und nicht an den 30.797 Zuordnungen.
`food_tags` wurde nicht verändert. Der Nachtrag steht in der Kette als 391;
die beiden späteren Schreiber 027 und 221 setzen die Gruppe beim jeweiligen
Definitionseintrag ebenfalls.

### C-387 — Entwurf, nicht gebaut

`food_tags_kuriert` muss eine von `food_tags` getrennte Überlagerung sein:
`food_id`, `tag_code` und eine entschiedene Aktion *gesetzt/entfernt*, ohne
`confidence`; die effektive Suche/Anzeige liest Import und Kuration, wobei
die Kuration gewinnt. Eine Entfernt-Zeile überdeckt daher auch einen Tag,
den ein Import später erneut setzt.

Damit wirken die vier bekannten Schreiber ausschließlich auf ihre
Importtabelle: 020 fügt ein, 027 ersetzt seine zehn Codes, 032 ersetzt
`halal`/`kosher`, 221 würde `high_fat`/`gluten_free` ersetzen. Keine dieser
Operationen berührt die zweite Tabelle. G-221 ist auf dev weiterhin nicht
eingespielt; beim künftigen Lauf erweitert er den Definitionsbestand von 14
auf 16. Sein Kettenschritt setzt dann `high_fat` auf `nutrient` und
`gluten_free` auf `dietary_pattern`; die Überlagerung braucht keine eigene
Sonderbehandlung dafür.

### Prüfung

- C-391/C-390-Test: grün; zuvor erwartungsgemäß rot.
- `v070_lesefunktionen.sql`: alle Food-Search-Prüfungen grün; die bestehende
  Umlaut-Prüfung scheitert in der Windows-Pipe mit `k rbis l s` statt
  `kuerbis oel suess`, außerhalb dieser Änderung.
- Schema-Vollständigkeit: neuer Nachtrag vorhanden; der Gesamtlauf bleibt an
  dem bestehenden fehlenden `supplements.substance_group_memberships`
  (0 statt 8) rot.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### Der Treffergrund steht

`[cmd]` **Selbst gemessen: `Banane roh` liefert
`{"kind": "name_prefix"}`.** `[cmd]` **Acht Vorkommen von
`match_reason` im Funktionsrumpf.**

`[cmd]` **Zehn Wege:** `browse`, `name_exact`, `name_prefix`,
`name_word_start`, `alias_exact`, `alias_prefix`, `alias`, `synonym`,
`name`, `token_group` — **Aliasgruende nennen ihre Herkunft.**

`[cmd]` **Und die Funktion aendert weder Filter noch `ORDER BY`.**

`[read]` **Das ist der Punkt: der Treffergrund erklaert, er
korrigiert nicht.**

### Und er sagt es selbst

`[read]` *,,`K213000 Kartoffelpueree Instantpulver` bleibt
unveraendert Platz 1, weil es nach der gleichen Textstufe
`sort_weight 450` traegt. Der Treffergrund macht den Rangfehler
sichtbar, er korrigiert ihn nicht."*

`[cmd]` **Alle 16 kommen aus dem `openthesaurus`-Synonym, der erste
ueber `kartoffelpueree`.**

`[read]` **C-24 ist damit erklaerbar, nicht behoben** — **und das war
der Auftrag.**

### C-390 — die Gruppe liegt am Tag

`[cmd]` **Nachgemessen: `filter_group` ist live, CHECK auf vier
Werte, alle 14 Tags zugeordnet.**

    dietary_pattern  halal, kosher, thai_food, vegan, vegetarian
    nutrient         high_fiber, high_protein, low_carb, low_fat
    processing       ultra_processed, whole_food
    allergen         contains_gluten, contains_lactose, contains_nuts

`[cmd]` **`food_tags` unveraendert bei 30.797 Zeilen.**

`[read]` **Die Metadaten liegen am Tag, nicht an den 30.797
Zuordnungen** — **genau die Trennung, die E-49 verlangt.**

`[cmd]` **Und der Nachtrag steht in der Kette als 391:** **die
spaeteren Schreiber 027 und 221 setzen die Gruppe beim
Definitionseintrag mit.**

### C-387 — der Entwurf haelt

`[read]` **`food_tags_kuriert` als Ueberlagerung:** `food_id`,
`tag_code`, **eine entschiedene Aktion gesetzt/entfernt, ohne
`confidence`.**

`[read]` **Und der Satz, der es traegt:** *,,Eine Entfernt-Zeile
ueberdeckt daher auch einen Tag, den ein Import spaeter erneut
setzt."*

`[cmd]` **Damit wirken alle vier Schreiber nur auf ihre eigene
Tabelle** — 020 fuegt ein, 027 ersetzt zehn, 032 ersetzt zwei, 221
wuerde zwei ersetzen.

`[cmd]` **Und G-221 braucht keine Sonderbehandlung:** sein
Kettenschritt setzt `high_fat` auf `nutrient` und `gluten_free` auf
`dietary_pattern`.

### Zwei fremde Fehler, richtig gemeldet

`[cmd]` **Die Umlautpruefung in `v070_lesefunktionen.sql` scheitert
in der Windows-Pipe** — `k rbis l s` statt `kuerbis oel suess`.
`[read]` **Ausserhalb dieser Aenderung.**

`[cmd]` **Und die Schema-Vollstaendigkeit bleibt an
`supplements.substance_group_memberships` rot** (0 statt 8).
**Als C-393.**

**Abgenommen.**

