---
nr: C-336
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-246
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  tabellen: [nutrition.nutrient_details, nutrition.nutrient_defs]
zahlen:
  gemessen: 2026-08-28
  detailzeilen: 110
  ul_ohne_excess: 2
---

# C-336 — FD traegt den Text eines anderen Naehrstoffs

## Befund

Aus G-246, Claude Code, 2026-08-28. **Vom Orchestrator nachgemessen.**

`[cmd]`

    nutrient_defs.name_de           Fluorid, Einheit ug
    nutrient_details.function_de    "Trockenmassegehalt eines
                                     Lebensmittels"

`[read]` **Im Vorgaengerrepo hiess `FD` *dry matter*.** Beim Import
ist die Zeile ueber den gleichlautenden Schluessel am falschen
Naehrstoff gelandet.

`[read]` **Dieselbe Klasse wie `CLD`/`CL` aus G-239 — nur mit
Wirkung:** wer auf Fluorid klickt, liest ueber Trockenmasse.

## Die eigentliche Frage

**Wenn ein Schluessel kollidieren konnte, wie viele andere sind es?**

`[cmd]` **110 Detailzeilen, alle ueber `nutrient_code` verknuepft.**
`[read]` **Kein Eintrag haengt in der Luft** (0 ohne
`nutrient_defs`-Gegenstueck) — **aber ein Text am falschen Code
faellt dabei nicht auf.** Die Verknuepfung ist formal richtig und
inhaltlich falsch.

`[read]` **Zu pruefen ist der Inhalt gegen den Namen**, nicht die
Fremdschluesselbeziehung. `[cmd]` Bei 110 Zeilen ist das lesbar.

## Nebenbefund aus demselben Auftrag

`[cmd]` **Zwei Naehrstoffe mit `UL` haben keinen
Ueberdosierungstext:** `FOLAC` (Folsaeure, UL 1.000 ug) und `FD`
(Fluorid, UL 10.000 ug).

`[read]` **Bei `FD` ist der Grund vermutlich derselbe** — die falsche
Zeile bringt auch kein `excess_de` mit.

## Auftrag — die Zuordnung pruefen, nicht die Texte

**Mitbeauftragt: G-255.**

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[read]` **Und die Datei ist die Wahrheit** — lies die Punkte selbst.

### Zu tun

**Pruefen, ob weitere Detailtexte am falschen Naehrstoff haengen.**

`[cmd]` **`FD` heisst Fluorid und traegt *,,Trockenmassegehalt eines
Lebensmittels"*** — im Vorgaengerrepo hiess `FD` *dry matter*.

`[read]` **Die Verknuepfung ist formal richtig und inhaltlich
falsch** — kein Fremdschluessel faengt das. `[read]` **Die Frage ist:
wie viele andere sind es?**

`[cmd]` **110 Detailzeilen, alle ueber `nutrient_code` verknuepft, kein
Eintrag ohne Gegenstueck.** `[read]` **Bei 110 Zeilen ist ein Abgleich
von Inhalt gegen Namen lesbar.**

`[read]` **Und derselbe Verdacht gilt fuer die Codes selbst:** du
hast in G-239 gemessen, dass Mockup und Datenbank verschiedene
Codesysteme fuehren (`CLD` gegen `CL`). **Wo sonst ist beim Import
ein Schluessel kollidiert?**

### G-255 — die drei Attrappen-Konstanten

`[cmd]` **`USER_STACKS`, `STACK_TEMPLATES`, `FREQUENCY_OPTIONS` haben
keinen Renderer** — nur einen Test, der prueft, dass sie nicht leer
sind.

`[read]` **A-59 sagt loeschen, und in G-253 hast du sie stehen
lassen, weil das Stehenlassen in G-249 Toms ausdrueckliche
Entscheidung war.** `[read]` **Der Unterschied: in G-249 steckte
bestellte Arbeit darin, hier sind es Beispieldaten aus dem Entwurf.**

**Loeschen, wenn die Attrappenzahl am Schirm bei 0 bleibt.**

### Was nicht zu tun ist

**Keine Texte schreiben oder korrigieren** — was falsch zugeordnet
ist, wird gemeldet. `[read]` **Datenpflege gehoert Codex.**
**Keine Tabelle anlegen.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Detailtexte gegen Namen      alle 110 geprueft
    falsch zugeordnet            je einzeln, mit beiden Bedeutungen
    Codekollisionen sonst        gemessen oder ausgeschlossen
    G-255                        geloescht, Attrappen am Schirm
                                 vorher / nachher

### Regeln

`tools/lauf.py`, keine Konsolenfenster. `[cmd]` A-30, A-59, A-60.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
