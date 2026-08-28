---
nr: E-24
getroffen: 2026-08-28
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-247, G-239]
modul: nutrition
---

# E-24 — Mikronaehrstoffe im Zeitraum, mit Spanne im Detail

## Frage

`[cmd]` `nutrition.daily_reference_assessment` bewertet **einen Tag.**
`[cmd]` Niacin schwankt in den Daten taeglich zwischen 20 und 80 mg.

**Ich hatte gefragt, ob eine Obergrenze im Zeitraum den hoechsten
Einzeltag zeigen soll statt den Schnitt** — weil eine Spitze im
Mittelwert verschwindet.

## Entscheidung

Tom, 2026-08-28: *,,einzeltageswerte sagen nichts aus, aber sinnvoll
waere bei 7/30/90 zusatzangaben kleinster wert/groesster wert in dem
gewaehlten zeitraum (in die details des mikros reinbauen) und sonst
den schnitt"*.

**Der Schnitt ist die Anzeige. Kleinster und groesster Wert stehen im
Detail.**

`[read]` **Das loest meine Frage besser, als ich sie gestellt habe.**
Ich hatte *Schnitt oder Spitze* gefragt — **die Antwort ist beides,
an verschiedenen Orten.** Die Zeile bleibt lesbar, die Spitze geht
nicht verloren.

`[read]` **Und die Begruendung traegt fuer beide Richtungen:** eine
Unterversorgung entsteht ueber Wochen, eine Ueberschreitung an
einzelnen Tagen. **Der Schnitt zeigt die eine, die Spanne die
andere.**

## Praezisierung: ein Verlauf statt zweier Zahlen

Tom, 2026-08-28: *,,oder noch einfacher, bau sowas in die details wo
die periode anzeigt inkl mittelwert, zielwert, obergrenze das sagt am
meisten aus"*.

**Im aufgeklappten Naehrstoff steht ein Verlauf ueber den gewaehlten
Zeitraum, mit drei Linien:**

    Verlauf        der Tageswert je Tag
    Mittelwert     die Linie, gegen die die Prozentzahl rechnet
    Zielwert       PRI, AI oder was der Naehrstoff hat
    Obergrenze     UL, wo es eine gibt

`[read]` **Das ist C-48 Regel 2 als Bild.** Bei Vitamin A liegen beide
Referenzlinien im selben Diagramm — **man sieht auf einen Blick, dass
der Verlauf ueber der einen und unter der anderen liegt.** Die zwei
Prozentzahlen darueber sagen dasselbe, das Bild sagt es schneller.

`[read]` **Und es loest die Spannenfrage besser als zwei Zahlen:**
kleinster und groesster Wert stehen als Ausschlaege im Verlauf, **mit
dem Zusatz, wann sie waren.** Eine Ueberschreitung an drei
aufeinanderfolgenden Tagen sieht anders aus als drei verstreute.

`[cmd]` **Die Form existiert bereits als Attrappe:** *,,Calorie
balance, 14 days"* mit Verlauf und Ziellinie. `[cmd]` **Ihre
Attrappenmarke sagt den Grund:** *,,Die Zahlen stammen aus der
Vorlage — die Auswertung rechnet noch nicht ueber
`daily_summary`."* **Hier rechnet sie darueber.**

## Zeitraeume

    7 · 30 · 90 Tage

`[cmd]` **`module-nutrition-nutrients.jsx` nennt genau diese drei** —
7d, 30d, 90d. **Es ist die einzige Quelle, die 90 Tage fuehrt**, und
mit 54 KB die groesste Nutrition-Mockup-Datei.

`[cmd]` **Gebaut ist heute ueberall 14 Tage** —
`insights-read.ts`, `naehrstoff-detail-read.ts`, `insights-echt.tsx`.
`[cmd]` **45 Tage kommen nirgends vor.**

`[cmd]` **Der Bestand traegt 181 Tage** — ein 90-Tage-Schnitt ist
gedeckt.

## Filter ueber die Pillen

Tom, 2026-08-28: *,,die filterwahl 7/30/90 in den bereich
mikronaehrstoffe reinbauen, bei der gelegenheit die pills zb 5x zu
wenig auch gleich anwaehlbar als filter bauen, da als erstes
standardwahle pill 'alle'"*.

`[cmd]` **Die Pillen stehen bereits** (G-239): *4x ueber der
Obergrenze · 5x zu wenig · 26x gedeckt · 14x unvollstaendig · 89x kein
Richtwert*.

**Sie werden anwaehlbar. Erste Pille: *alle*, vorausgewaehlt.**

`[read]` **Sie zaehlen ohnehin schon** — was fehlt, ist nur der Klick.
**Ein Zaehler, der nicht filtert, laesst den Nutzer die Liste von Hand
durchsuchen, obwohl das System die Antwort kennt.**
