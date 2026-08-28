---
nr: G-247
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: E-24
agent: claudecode
beauftragt: 2026-08-28
beruehrt:
  dateien: [apps/web/public/mockup/features/nutrition/MacroDetail.js]
zahlen: null
---

# G-247 — der Zeitraumwechsel braucht eine eigene Funktion

## Befund

Aus G-239, Claude Code, 2026-08-28.

`[cmd]` **`nutrition.daily_reference_assessment(user_id, date)`
bewertet einen Tag.** `[read]` **Der Mockup fuehrt einen
Zeitraumwechsel Heute / 7d / 14d / 30d** — `MacroDetail.js` nennt ihn
im Kopf.

`[read]` **Ein Mittelwert ueber sieben Tage ist nicht die
Tagesbewertung siebenmal.** Bei einer Obergrenze zaehlt der
Einzeltag, bei einem Zielwert der Durchschnitt — **die Leserichtung
aus C-48 Regel 2 gilt auch hier, nur ueber die Zeit.**

`[read]` **Deshalb eine eigene Funktion und kein Schleifenaufruf.**

## Auftrag — Zeitraum und Filter

**Entschieden in `docs/entscheidungen/E-24`.** `[read]` **Lies sie
zuerst; sie ist die Vorgabe.**

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[cmd]` **Und der massgebliche Mockup fuer diesen Reiter ist
`module-nutrition-nutrients.jsx`** —
`docs/spezifikation/10-plattform/design-system/theme-v1/`, **54 KB,
die groesste Nutrition-Datei.** `[read]` **Ungelesen.** **NICHT der
`.js`-Ordner** — dort steht eine vereinfachte Fassung.

### 1 · Zeitraum 7 / 30 / 90

`[cmd]` **`daily_reference_assessment(user_id, date)` bewertet einen
Tag.** `[read]` **Ein Schnitt ueber sieben Tage ist nicht die
Tagesbewertung siebenmal** — die Mengen werden gemittelt, dann
bewertet, nicht umgekehrt.

`[read]` **Der Standard bleibt der Tag**, weil die Oberflaeche im
Tagesmodus laeuft. **7, 30 und 90 kommen dazu.**

`[cmd]` **Gebaut ist heute ueberall 14 Tage** — `insights-read.ts`,
`naehrstoff-detail-read.ts`. **Pruef, ob das bleibt oder mitwandert.**

### 2 · Ein Verlauf im Detail

**Im aufgeklappten Naehrstoff ein Verlauf ueber den gewaehlten
Zeitraum, mit Mittelwert, Zielwert und Obergrenze als Linien.**

`[read]` **Das ist C-48 Regel 2 als Bild.** Bei Vitamin A liegen beide
Referenzlinien im selben Diagramm — **der Verlauf ueber der einen,
unter der anderen.**

`[cmd]` **Die Form existiert als Attrappe:** *,,Calorie balance,
14 days"*, mit dem Vermerk *,,die Auswertung rechnet noch nicht ueber
`daily_summary`"*. **Hier rechnet sie darueber.**

`[read]` **Kleinster und groesster Wert stehen als Ausschlaege im
Verlauf** — mit dem Zusatz, wann sie waren. **Eine Ueberschreitung an
drei aufeinanderfolgenden Tagen sieht anders aus als drei
verstreute.**

`[read]` **Das ist der Kern der Entscheidung.** Der Schnitt zeigt die
Versorgung, **die Spanne zeigt, ob eine Ueberschreitung darin
verschwunden ist.** `[cmd]` Bei Niacin schwanken die Tageswerte
zwischen 20 und 80 mg — **im Schnitt sieht man davon nichts.**

`[read]` **Nur bei 7/30/90, nicht im Tagesmodus** — dort ist der Tag
die Spanne.

### 3 · Die Pillen werden Filter

`[cmd]` **Sie stehen bereits und zaehlen** (aus G-239): *4x ueber der
Obergrenze · 5x zu wenig · 26x gedeckt · 14x unvollstaendig · 89x kein
Richtwert*.

**Anwaehlbar machen. Erste Pille *alle*, vorausgewaehlt.**

`[read]` **Ein Zaehler, der nicht filtert, laesst den Nutzer die Liste
von Hand durchsuchen, obwohl das System die Antwort kennt.**

`[read]` **Und die Zahlen muessen sich mit dem Zeitraum aendern** —
*4x ueber der Obergrenze* gilt fuer heute; ueber 90 Tage ist es eine
andere Zahl.

### Was nicht zu tun ist

**Keine Referenzwerte aendern, keine Schwellen setzen.**
**Keine Tabelle anlegen** — Codex hat den Bereich.
**Nichts auf `dev@lumeos.app` schreiben.**
`[read]` **Und die Leserichtung aus C-48 Regel 2 gilt auch im
Zeitraum:** 80 Prozent eines `PRI` sind zu wenig, 80 Prozent eines
`UL` sind unbedenklich. **Der Schnitt aendert daran nichts.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Zeitraeume waehlbar          1 · 7 · 30 · 90
    Schnitt gegen Tag            unterscheidbar - Bildschirmfoto
    Verlauf im Detail            je Tag ein Punkt
    drei Linien                  Mittelwert, Zielwert, Obergrenze
    Verlauf nur bei 7/30/90      im Tagesmodus keiner
    Pillen filtern               je Pille, Zahl stimmt mit Liste
    Pille *alle*                 vorausgewaehlt
    Pillenzahlen je Zeitraum     aendern sich mit der Wahl
    Ladezeit                     ms je Zeitraum, kalt und warm
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

`[read]` **Gegenprobe:** einen Naehrstoff finden, dessen Schnitt
unter der Obergrenze liegt und dessen groesster Tag darueber.
`[read]` **Wenn es keinen gibt, sag das** — dann ist die Spanne
richtig gebaut und heute wirkungslos, und das ist ein Ergebnis.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
