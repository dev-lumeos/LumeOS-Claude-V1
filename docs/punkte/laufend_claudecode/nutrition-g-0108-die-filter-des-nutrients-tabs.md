---
nr: G-108
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-101
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-108 - Die Filter des Nutrients-Tabs

## Befund

(neu 2026-08-20, aus
  G-101).

  `[cmd]` Der Entwurf zeigt `Today · 7d avg · 30d avg · 90d avg` und
  `All · Out of range · Deficient only`. **Die Ordnung steht seit
  G-101, die Filter fehlen.**

  `[read]` Die Zeitraeume haengen an derselben Frage wie G-107; „Out of
  range" braucht je Naehrstoff die persoenliche Referenz.

## Auftrag — die Filter im Nutrients-Reiter, drei Punkte

**Mitbeauftragt: G-116, G-250.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

`[read]` **G-116 und G-250 sind als `entscheidung` markiert.**
**Du entscheidest sie nicht — du misst und legst vor.** `[read]`
**Was gebaut werden kann, ohne dass eine Entscheidung fehlt, baust
du. Der Rest wird mit Zahlen vorgelegt.**

### 1 · G-108 — die Filter des Nutrients-Tabs

`[cmd]` **Der Reiter fuehrt seit G-249 die Ordnung mit Baum, Suche,
sieben Zeitfenstern und den Filtern `Alle` / `Auffaellig` /
`Unter Ziel`.** `[cmd]` **Dazu seit C-323 die Dauerregel.**

`[read]` **Miss zuerst, was der Punkt vom 20.08. noch behauptet, was
heute gilt** — er ist aelter als alles, was seither gebaut wurde.

`[cmd]` **Und ein gemessener Befund aus C-323 liegt vor:** der
`Auffaellig`-Filter liest `avg_per_logged_day`, einen Mittelwert.
**Konstant 79 Prozent und 45 Tage bei 40 neben 45 bei 118 sind heute
nicht unterscheidbar.**

### 2 · G-116 — generelle Ausschluesse

`[read]` **Der Punkt sagt, sie bewerten mit 0, statt zu filtern.**
`[read]` **Miss, was das heute bewirkt** — und ob *bewerten mit 0*
und *filtern* verschiedene Ergebnisse liefern.

`[read]` **Und die Frage dahinter ist dieselbe wie ueberall heute:**
ist eine Null ein gemessener Wert oder eine fehlende Aussage?

### 3 · G-250 — die vier Zustaende in der Ordnung

`[cmd]` **Die Ordnung bildet ihren Status aus `goals.nutrition_targets`,
die vier Zustaende stammen aus `daily_reference_assessment`.**

`[read]` **Beides zu mischen ergaebe zwei Wahrheiten in einer
Zeile** — *,,unter Ziel"* nach dem Goal und *,,gedeckt"* nach EFSA
koennen gleichzeitig gelten.

**Miss, wie oft sie auseinandergehen.** `[cmd]` **60 Naehrstoffe
haben ein persoenliches Ziel, 78 nur die Referenz — bei diesen 78
gibt es keinen Widerspruch.**

`[read]` **Dieselbe Frage wie in G-218:** dort ergab die Messung,
dass zwei Achsen innerhalb einer Stufe redundant sind, ueber den
Katalog aber nicht. **Wenn sie selten auseinandergehen, reicht eine
Achse mit Vermerk. Wenn oft, muessen beide sichtbar sein und die
Zeile muss sagen, welche sie meint.**

### Was nicht zu tun ist

**Keine zweite Ansicht neben eine bestehende.** `[cmd]` **Dreimal
passiert** — G-249, G-11, und in G-253 hast du es selbst verhindert.
**Keine Referenzwerte aendern, keine Tabelle anlegen** — Codex hat
den Datenbereich.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil          erledigt / gebaut / offen / ueberholt
    Filter heute                 was zeigt jeder, gemessen
    Auffaellig gegen Dauerregel  wie viele je Zeitraum, beide
    generelle Ausschluesse       0 gegen gefiltert, Ergebnis
                                 vorher / nachher
    zwei Wahrheiten              wie oft gehen sie auseinander
    Doppelung                    zeigt der Reiter etwas zweimal?
    Attrappen                    am Schirm gezaehlt (A-59)
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30, A-59, A-60.** `[cmd]` **Und `.limit()` hebt den
PostgREST-Deckel nicht auf.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
