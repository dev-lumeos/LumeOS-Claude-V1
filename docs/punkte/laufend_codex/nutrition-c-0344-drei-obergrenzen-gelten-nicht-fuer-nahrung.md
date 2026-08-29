---
nr: C-344
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-323
entscheidung: null
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
zahlen:
  gemessen: 2026-08-29
  ul_gesamt: 17
  ul_nur_supplemente: 3
agent: codex
beauftragt: 2026-08-29
---

# C-344 — drei Obergrenzen gelten nicht fuer Nahrung

## Befund

Aus C-323, Claude Code, 2026-08-29. **Vom Orchestrator nachgemessen.**

`[cmd]` **Drei von 17 Obergrenzen sagen in ihren `notes` selbst, dass
sie nicht fuer Lebensmittel gelten:**

    MG      "Applies to pharmacological/supplemental magnesium only,
             not magnesium naturally present in foods."
    NIA     "Applies to synthetic niacin from supplements or
             fortified foods."
    FOLAC   "Applies to supplemental folic acid and related synthetic
             forms, not food folate."

`[cmd]` **Und zwei davon sind die lautesten Warnungen auf `dev`:**
Magnesium an 87 von 88 Tagen, Niacin an 51 von 73 — **zusammen 138
von 185 Ueberschreitungen.**

`[cmd]` **Die Mikronaehrstoff-Ansicht zeigt heute `MG 131 %` als
Ueberschreitung** — fuer Magnesium aus Nahrung, wo diese Grenze nicht
gilt. **Das ist seit G-239 live.**

## Warum es strukturell ist

`[cmd]` **`target_applies_to` haelt Naehrstoffcodes, keine
Quellenunterscheidung.** `[read]` **Die Einschraenkung existiert nur
als Freitext.**

`[read]` **Claude Code hat sie deshalb als Liste im Code gefuehrt,
mit dem Zitat daneben, und als Befund gemeldet statt als Loesung** —
richtig, aber sie gehoert ins Schema.

## Auftrag

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

`[read]` **Und die Datei ist die Wahrheit** — lies diesen Punkt und
die `notes` selbst, statt dich auf die Zusammenfassung oben zu
verlassen.

### Zu tun

**Die Quellenbeschraenkung strukturell verfuegbar machen.**

`[read]` **Miss zuerst, wie viele der 17 Obergrenzen eine
Einschraenkung in `notes` tragen** — drei sind gefunden, das heisst
nicht, dass es nur drei sind. **Und ob dieselbe Frage bei den
Zielwerten auftritt.**

`[read]` **Wie die Beschraenkung abgebildet wird, ist deine
Entscheidung** — eine Spalte, eine Aufzaehlung, eine eigene Zeile je
Quelle. **Aber sie muss abfragbar sein, nicht nur lesbar.**

### Was daran haengt

`[cmd]` **`daily_reference_assessment` bewertet heute gegen alle
Obergrenzen gleich.** `[read]` **Wenn die Beschraenkung im Schema
steht, muss die Funktion sie lesen** — sonst aendert sich nichts an
der Anzeige.

`[read]` **Und die Frage, wie eine so beschraenkte Grenze angezeigt
wird, ist nicht deine:** ob sie verschwindet, grau steht oder mit
Hinweis erscheint, entscheidet Tom. **Miss, was sie heute bewirkt,
und melde es.**

### Was nicht zu tun ist

**Keine Referenzwerte aendern** — nur ihre Lesbarkeit.
**Keine Anzeige aendern** — `apps/` gehoert Claude Code.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    UL mit Einschraenkung        Zahl, je einzeln mit Zitat
    Zielwerte betroffen?         gemessen
    strukturell abfragbar        belegt durch eine Abfrage
    Wirkung heute                wie viele Ueberschreitungen
                                 entfallen, je Konto und Zeitraum
    Gegenprobe                   eine Grenze, die fuer Nahrung gilt,
                                 bleibt unveraendert

`[read]` **Die vorletzte Zeile ist die, die Tom braucht**, um ueber
die Anzeige zu entscheiden.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
