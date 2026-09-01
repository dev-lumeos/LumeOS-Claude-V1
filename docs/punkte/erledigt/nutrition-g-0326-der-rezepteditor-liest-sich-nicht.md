---
nr: G-326
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-325
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 0dfa6788
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/rezepte-echt.tsx
zahlen: null
---

# G-326 — der Rezepteditor liest sich nicht

## Befund

Tom, 2026-09-02, am Schirm. **Vier Punkte.**

### 1 · Der Name nimmt die ganze Breite

`[cmd]` **Heute: Beschriftung *NAME* darueber, darunter ein Feld
ueber die volle Seitenbreite.**

Tom: *,,name (beschriftungsfeld oben und darunter die ganze breite
als namefeld, unnoetig)."*

**Soll werden:** das Namensfeld so breit wie die vier Felder
darunter zusammen.

### 2 · Die zweite Zeile

**Portionen · Vorbereitung (min) · Garzeit (min) · Koennen** —
nebeneinander, **und das Namensfeld darueber deckt sich mit ihrer
Gesamtbreite.**

### 3 · Das Grammfeld ist zu klein

`[cmd]` **Es zeigt `44(` statt `440`.** `[cmd]` **56 px, gesetzt in
G-325.**

`[read]` **Der Orchestrator hat *schmal* beauftragt, ohne eine Zahl
zu nennen** — **und vierstellige Mengen passen nicht.**

### 4 · Die Live-Vorschau ist nicht abgesetzt

Tom: *,,trennen livevorschau gegenueber dem darueber und dann
erkennbare zwei spalten machen mit trennungen dazwischen das man
versteht was das ist."*

`[cmd]` **Heute stehen *GESAMT* und *JE PORTION (2)* nebeneinander,
ohne Trennung.**

`[read]` **Und Tom hat gefragt, was das bedeutet** — *,,das ist ein
rezept wieso zwei totale?"*

`[cmd]` **`Gesamt` sind alle Zutaten: 1.665 kcal.** `[cmd]` **`Je
Portion` ist das geteilt durch `portionen`: 833.**

`[read]` **Die Beschriftung sagt es nicht.** **Klarer waere:**

    Ganzes Rezept (4 Zutaten)      1.665 kcal
    Eine Portion (von 2)             833 kcal

`[read]` **Und die Zahl in Klammern haengt am Portionenfeld oben** —
wird es auf 4 gesetzt, steht dort *(von 4)* mit 416 kcal.

`[cmd]` **Beide Werte stehen in Flow 7:** *,,Live-Preview: Gesamt +
je Portion (Makros + kcal)"*. `[read]` **Beim Kochen zaehlt Gesamt,
beim Essen die Portion** — und das Loggen nimmt Portionen
(`planned_servings`).

## Auftrag — vier Punkte am Rezepteditor

**Beauftragt am 2026-09-02.**

### 1 und 2 · Der Kopf

    NAME
    [Huhn-Reis-Bowl                                        ]

    PORTIONEN   VORBEREITUNG (MIN)   GARZEIT (MIN)   KOENNEN
    [2      ]   [25             ]    [20        ]    [mittel v]

`[read]` **Das Namensfeld genau so breit wie die vier darunter
zusammen** — **nicht ueber die volle Seitenbreite.**

`[cmd]` **Heute laeuft es bis an den rechten Rand**, waehrend die
vier Felder darunter bei rund einem Drittel enden.

### 3 · Das Grammfeld

`[cmd]` **56 px zeigen `44(` statt `440`.**

`[read]` **Miss, was vierstellige Mengen brauchen** — **und lass
`flex: 'none'` stehen**, sonst ist es wieder 262 px breit (dein
Befund aus G-325).

### 4 · Die Live-Vorschau

`[read]` **Zwei Sachen: absetzen und beschriften.**

`[cmd]` **Absetzen:** eine sichtbare Trennung gegen die Zutatenliste
darueber.

`[cmd]` **Beschriften:** Tom hat gefragt, *,,wieso zwei totale?"* —
**die Ueberschriften *GESAMT* und *JE PORTION (2)* sagen nicht, dass
das eine das andere geteilt durch zwei ist.**

**Vorschlag, deine Wahl im Wortlaut:**

    Ganzes Rezept (4 Zutaten)      1.665 kcal
    Eine Portion (von 2)             833 kcal

`[read]` **Und zwei erkennbare Spalten mit Trennung dazwischen** —
heute stehen sie nebeneinander ohne Grenze.

`[cmd]` **Die Zahl in Klammern haengt am Portionenfeld:** wird es auf
4 gesetzt, steht dort *(von 4)*.

### 5 · Dieselben zwei Sachen in der Detailansicht

Tom, 2026-09-02: *,,detailansicht dasselbe, da muessen die
einzelmakros rein und auch die saubere trennung unten."*

`[cmd]` **Die aufgeklappte Rezeptkarte zeigt je Zutat nur Name und
Menge:**

    Hafer Flocken                                    80 g
    Joghurt aus entrahmter Milch, max. 0,5 % Fett   250 g
    Banane roh                                      120 g

`[read]` **Dieselbe Luecke wie im Editor vor G-325** — **man sieht
nicht, was die einzelne Zutat beitraegt.**

`[cmd]` **Und unten stehen *GESAMT* und *JE PORTION* wieder
nebeneinander ohne Trennung** — **bei einer Portion sogar mit
identischen Zahlen (493 und 493), was die Frage *,,wieso zwei
totale?"* noch naeher legt.**

`[read]` **Beide Aenderungen aus Punkt 3 und 4 gelten hier
genauso** — **Makros je Zeile, und die Vorschau abgesetzt mit zwei
erkennbaren Spalten.**

`[cmd]` **Die Werte kommen aus derselben Stelle:** `rezept-lesen.ts`
beschafft sie seit G-325 ueber `food_nutrient_snapshot(…, 100)`.
`[read]` **Es ist wieder nur die Anzeige.**

`[cmd]` **Und die Karte zeigt nur kcal und Protein** — **im Editor
stehen vier Werte.** `[read]` **Fett und Kohlenhydrate fehlen ohne
Grund.**

### Was nicht zu tun ist

**Keine Werte aendern** — die Rechnung stimmt, gegen
`food_nutrient_snapshot` geprueft.
**Nichts auf `dev@lumeos.app` schreiben** — 3 Rezepte stehen dort.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Namensfeld       Breite gleich der vier Felder darunter,
                     in Pixeln
    Grammfeld        440 vollstaendig sichtbar
    Vorschau         abgesetzt, zwei Spalten mit Trennung
    Beschriftung     sagt, dass eine Portion das Rezept
                     geteilt durch n ist
    Portionen 2 -> 4 die Klammer und die Werte folgen
    Detailansicht    Makros je Zutat, vier Werte statt zwei,
                     Vorschau abgesetzt
    Bildschirmfoto   vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-02, Orchestrator. Beide Bildschirmfotos angesehen.**

`[cmd]` Gate 15/15 gruen.

### Alle fuenf Punkte sitzen

    Namensfeld     laeuft nicht mehr bis zum Rand, deckt sich mit
                   der Zeile darunter
    Kopfzeile      Portionen · Vorbereitung · Garzeit · Koennen
    Grammfeld      440 vollstaendig sichtbar, mit Zaehlpfeilen
    Vorschau       abgesetzt, zwei Spalten mit Trennung
    Beschriftung   GANZES REZEPT (3 ZUTATEN) / EINE PORTION (VON 1)

`[read]` **Die Beschriftung beantwortet Toms Frage** — *,,wieso zwei
totale?"* `[read]` **Jetzt steht da, dass das eine das ganze Rezept
ist und das andere ein Teil davon.**

### Und die Detailansicht folgt

`[cmd]` **Makros je Zutat:** *80 g · 278 kcal · 10,6 P · 5,3 F ·
42,6 C*.

`[cmd]` **Vier Werte statt zwei** — Fett und Kohlenhydrate sind
dazugekommen.

`[cmd]` **Und die Vorschau traegt dieselbe Beschriftung wie im
Editor**, unter der Ueberschrift *NAEHRWERTE*.

**Abgenommen.**

