---
nr: C-120
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-120 - Drei Sperren in `food_search`

## Befund

(neu 2026-08-19). Befund
  aus G-73.

  `[cmd]` **Alle drei in der Suchfunktion, die C-94 gesperrt hat:**

  | | |
  |---|---|
  | **`p_tag_code` ist Singular** | kein ODER/UND, nur Einfachauswahl |
  | **kein Ausschluss-Parameter** | die Allergen-Schalter wirken **nur auf der angezeigten Seite** — und sagen das an |
  | **kein `processing_level`** | die acht Stufen aus C-100 sind **nicht filterbar** |

  `[read]` **Der G-73-Agent hat sie gemeldet statt umgangen** — richtig,
  denn ein zweiter Suchweg neben `food_search` waere die schlechtere
  Loesung.

  `[cmd]` **Und ein Befund, der die Bauform bestimmt hat:** *„jeder
  vegane Eintrag traegt auch `vegetarian` (Schnittmenge 0) — „vegan ODER
  vegetarisch" waere also eine Scheinwahl."*

## Auftrag — die Suche messbar machen

**Mitbeauftragt: C-191, C-27, C-177.** Bericht in diese Datei.

### Das Ergebnis

`[read]` **Nach diesem Auftrag ist belegt, was die Suche kostet und
was sie nicht findet** — **und beides steht als Zahl, nicht als
Vermutung.**

### 1 · C-120 — die drei Sperren

`[read]` **Miss zuerst, ob sie noch da sind.** `[cmd]` **Der Punkt ist
aelter als C-347**, wo du die generellen Ausschluesse auf die
Rangfolge umgestellt hast — **eine der drei koennte dabei gefallen
sein.**

### 2 · C-191 — `p_user_id` kostet das Dreifache

`[cmd]` **Du hast in C-20 gemessen: die neuen Sortierungen liegen bei
115,4 bis 116,9 ms Median.** `[read]` **Miss den Aufschlag durch
`p_user_id` gegen denselben Aufruf ohne.**

`[read]` **Und wenn er noch besteht: sag, woher er kommt.** `[cmd]`
**Die Vorlieben werden je Treffer ausgewertet** — **das ist der
naheliegende Ort, aber naheliegend ist nicht gemessen.**

### 3 · C-27 — Alltagswoerter ohne Treffer

`[read]` **Der Punkt nennt zwei.** `[cmd]` **Er ist aelter als der
Dekompositor und die Synonymerweiterung** — **miss nach, welche heute
noch leer ausgehen.**

`[read]` **Und wenn beide gehen: schliess ihn.** **Ein Punkt, der
sich selbst erledigt hat, gehoert nicht in die Liste.**

### 4 · C-177 — Thai-Aliase

`[read]` **Der Punkt sagt *bewusst*.** `[cmd]` **E-16 hat Thai in der
Oberflaeche abgeschaltet.** `[read]` **Pruef, ob der Punkt damit
gegenstandslos ist** — dann schliess ihn.

### Was nicht zu tun ist

**Keine Rangregel setzen** — C-102/C-117 sind ueberholt, und eine
neue Rangfrage waere eine Entscheidung fuer Tom.
**Keine Tags anlegen.**
`apps/` nicht anfassen — Claude Code arbeitet an G-273 und G-275.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil      erledigt / gebaut / offen / ueberholt
    die drei Sperren         welche stehen noch
    p_user_id                ms mit und ohne, derselbe Aufruf
    Ursache des Aufschlags   gemessen oder als unklar gemeldet
    Alltagswoerter           welche gehen heute leer aus
    Thai-Aliase              gegenstandslos?

`[read]` **Wenn sich zwei der vier als ueberholt erweisen, ist das
das Ergebnis** — **nicht ein halber Auftrag.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**
`[cmd]` **`food_search` ist gemessen empfindlich** — miss die
Laufzeit vor und nach jeder Aenderung.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
