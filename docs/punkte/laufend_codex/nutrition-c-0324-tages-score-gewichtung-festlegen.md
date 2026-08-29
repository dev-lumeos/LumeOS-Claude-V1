---
nr: C-324
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: C-49
kinder: []
entscheidung: E-25
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-324 - Tages-Score Gewichtung festlegen

## Befund

Offene Frage aus C-49: welcher Naehrstoff wie stark in einen Tages-Score eingeht.

## Auftrag — den Score nach NRF9.3 bauen

**Entschieden in `docs/entscheidungen/E-25`.** `[read]` **Lies sie
zuerst; sie traegt die Formel und die drei Einschraenkungen.**

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

### Zu tun

**NRF9.3 als Funktion, je Tag und je Zeitraum.**

`[read]` **Die Deckelung bei 100 Prozent je Naehrstoff ist der Kern
der Formel** — ohne sie zieht ein einzelnes Uebermass den Score hoch.
`[read]` **Miss, was das bei einem Sportler bewirkt:** bei hoher
Proteinzufuhr ist Protein dauerhaft gedeckelt und traegt nichts mehr
zur Unterscheidung bei.

**Die Originalreferenzen verwenden, nicht die EFSA-Werte.** `[read]`
**Sonst ist es nicht mehr die validierte Fassung.** `[cmd]` Und die
Abweichung zu unseren sonstigen Referenzen gehoert sichtbar
gemacht — **zwei Bezugsgroessen im selben Modul sind sonst eine
Falle.**

**Gesamtzucker statt *added sugars*** — die Autoren haben die
Variante getestet, **aber der Score muss sagen, dass er so rechnet.**

`[read]` **Und die Leserichtung aus C-48 Regel 2 gilt weiter:** die
drei begrenzten Naehrstoffe zaehlen negativ, **ein hoher Wert dort ist
kein Erfolg.**

### Was zu messen ist, bevor gebaut wird

    Spannweite auf echten Tagen   welche Werte kommen vor?
    Protein gedeckelt             an wie vielen Tagen?
    fehlende Naehrstoffe          was passiert an Tagen mit
                                  `_missing > 0`?

`[read]` **Die letzte Zeile ist die wichtigste.** `[cmd]` **`vitc`
feuert an 180 von 181 Tagen** — ein Score, der unvollstaendige Summen
wie vollstaendige behandelt, **rechnet einen zu niedrigen Wert und
nennt ihn Ergebnis.** **Dieselbe Regel wie C-48 Regel 1: kein
Fehlzaehler wird zur Null.**

### Was nicht zu tun ist

**Keine Sportler-Variante.** `[read]` **Sie waere unsere Formel, nicht
die belegte** — sie kommt danach und traegt einen anderen Namen.
**Keinen Recovery- oder Training-Score** — vorgesehen, nicht gebaut.
**Keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort an C-323.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Score je Tag                 Spannweite ueber echte Tage
    Score je Zeitraum            7 / 30 / 90, mit E-24-Regel:
                                 erst mitteln, dann rechnen
    Deckelung                    greift sie, wo?
    unvollstaendige Tage         wie behandelt, belegt
    Gegenprobe                   ein Tag mit viel Natrium muss
                                 schlechter stehen als derselbe
                                 Tag ohne
    Laufzeit                     ms je Zeitraum

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
