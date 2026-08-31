---
nr: C-367
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: C-324
entscheidung: null
agent: codex
beauftragt: 2026-08-31
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-31
  scorefaehige_tage: 0
  von_tagen: 30
---

# C-367 — Vitamin A blockiert den Score an allen Tagen

## Befund

Aus C-324, Codex, 2026-08-31.

`[cmd]` **`nrf93_daily()` ist gebaut und rechnet die gedeckelte
Originalformel.** `[cmd]` **Auf `dev` sind 0 von 30 Tagen
scorefaehig** — **nicht 12, wie ich im Auftrag geschrieben habe.**

`[cmd]` **`vitamin_a_iu_daily()` ist an allen 30 Tagen unvollstaendig,
wegen fehlender Komponenten.**

`[read]` **Und Codex hat den naheliegenden Ausweg abgelehnt:** ein
Rueckfall auf `daily_summary.vita` waere gegen E-34. **Richtig.**

## Wo meine Zahl herkam

`[read]` **Ich habe *,,alle NRF9.3-Eingaenge an 12 von 30 Tagen
vollstaendig"* aus dem C-343-Bericht uebernommen** — **das galt fuer
die uebrigen elf Naehrstoffe, nicht fuer Vitamin A.**

`[cmd]` **Alle 7.140 Lebensmittel tragen `CARTB` und `CAROTPAXB` als
Zeile** — **die Werte selbst fehlen.**

## Was zu messen ist

`[read]` **Sind die Vitamin-A-Komponenten zensiert oder echte
Luecken?** `[cmd]` **E-38 hat zensierte Werte auf 0 gesetzt** — **wenn
CARTB dazugehoert haette, waere der Tag jetzt vollstaendig.**

`[read]` **Also entweder tragen sie einen anderen Herkunftswert, oder
E-38 hat sie nicht erfasst.** **Das entscheidet, ob der Score in
Reichweite ist oder nicht.**

## Auftrag — der letzte Score-Blocker

**Beauftragt am 2026-08-31.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag rechnet NRF9.3 an so vielen Tagen wie
moeglich** — **oder es ist belegt, warum nicht.**

`[cmd]` **Die Funktion steht seit deinem C-324.** `[cmd]` **Sie
wartet auf Vitamin A.**

### Zu messen

**Sind `CARTB` und `CAROTPAXB` zensiert oder echte Luecken?**

`[cmd]` **E-38 hat zensierte Werte auf 0 gesetzt** — **wenn sie
dazugehoert haetten, waere der Tag jetzt vollstaendig.**

`[cmd]` **Alle 7.140 Lebensmittel tragen beide als Zeile** — die
Werte fehlen.

`[read]` **Also entweder tragen sie einen Herkunftswert, den E-38
nicht erfasst, oder sie sind echte Luecken.** **Das entscheidet
alles Weitere.**

### Wenn es echte Luecken sind

`[read]` **Dann ist der Score mit dieser Formel auf `dev` nicht
rechenbar, und das gehoert gesagt** — **nicht umgangen.**

`[cmd]` **E-34 gilt: die Vitamin-A-Form ist aus den Komponenten
ableitbar.** `[cmd]` **Kein Rueckfall auf `daily_summary.vita`** —
das hast du in C-324 richtig abgelehnt.

`[read]` **Und dann ist die Frage, ob die Formel eine
Vitamin-A-lose Fassung kennt** — **NRF8.3 gibt es in der Literatur.**
**Melden, nicht entscheiden.**

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    CARTB / CAROTPAXB   Herkunft je Wert, gezaehlt
    zensiert?           wie viele, und warum nicht von E-38 erfasst
    echte Luecken?      wie viele
    scorefaehige Tage   vorher 0, nachher
    NRF8.3              gibt es sie? gemeldet, nicht entschieden

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
