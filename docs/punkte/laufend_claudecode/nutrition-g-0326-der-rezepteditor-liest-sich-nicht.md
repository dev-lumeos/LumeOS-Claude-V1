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
    Bildschirmfoto   vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
