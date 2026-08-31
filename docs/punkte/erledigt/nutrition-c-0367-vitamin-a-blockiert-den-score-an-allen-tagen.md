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
erledigt: 2026-08-31
commit: OFFEN
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

**Gemessen am 2026-08-31 auf dev, Konto
`d15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6`, 2026-08-01 bis 2026-08-30.**

### E-38 ist nicht uebergangen

`nutrition.food_nutrients` hat fuer beide Komponenten genau 7.140
Zeilen. Die Herkunft ist nicht einheitlich:

| Komponente | gemessen | zensiert, jetzt 0 | logische Null | echte Luecke | Spur, ohne Menge |
| --- | ---: | ---: | ---: | ---: | ---: |
| `CARTB` | 6.294 | 119 | 31 | 641 | 55 |
| `CAROTPAXB` | 5.093 | 1 | 0 | 1.983 | 63 |

`censored` sind `<LOD`/`<LOQ`. Sie haben nach E-38 bereits den Wert
0 und zaehlen als vorhanden. Die 119 `CARTB`- und eine
`CAROTPAXB`-Zeile sind also kein offener Importfehler.

`missing` sind dagegen die BLS-Herkunft `-`: echte Luecken. `trace` ist
die eigene BLS-Herkunft *Spuren*, ohne eine numerische Menge; sie ist
weder zensiert noch als Null belegt und bleibt deshalb wie eine
unvollstaendige Position erhalten. E-38 liefert dafuer keine Grenze,
die als Wert eingesetzt werden duerfte.

### Auswirkung auf die geloggten Tage

In den 392 Mahlzeitpositionen des Kontos liegen fuer `CAROTPAXB` 108
echte Luecken (14 Lebensmittel) und 12 Spuren (ein Lebensmittel). Sie
treffen zusammen jeden der 30 Tage: `CAROTPAXB` ist **0/30** Tage
vollstaendig. Fuer `CARTB` sind es 17 echte Luecken (zwei Lebensmittel)
und 12 Spuren; daher **10/30** Tage vollstaendig. `RETOL` ist 30/30
vollstaendig.

Folglich liefert `nutrition.vitamin_a_iu_daily()` an allen 30 Tagen
`incomplete`, und `nutrition.nrf93_daily()` an allen 30 Tagen
`incomplete`, jeweils mit `score = NULL`. Das ist nach C-48 Regel 1
richtig: Die Vitamin-A-Form ist zwar aus den drei Komponenten
ableitbar, der notwendige Eingang ist hier aber nicht vollstaendig.
Ein Rueckfall auf `daily_summary.vita` wuerde diese Herkunftsinformation
ueberschreiben und bleibt ausgeschlossen.

**Ergebnis:** NRF9.3 ist mit der gebauten Formel auf dev derzeit an
**0 von 30 Tagen** rechenbar. Es gibt keinen technischen Restschritt in
C-343/E-38, der diese Luecken ohne eine neue fachliche Entscheidung
schliessen duerfte.

### NRF8.3 ist keine vorgegebene Vitamin-A-lose Ersatzformel

Die Literatur verwendet `NRFn.3` als Familie; die Zahl vor `.3` sagt
nur, wie viele foerderliche Naehrstoffe eingehen. Der validierte
Originalbefund fuer NRF9.3 enthaelt Vitamin A.

Eine belegte NRF8.3-Variante von Drewnowski und Richonnet (2020) gibt
es, aber sie laesst **nicht** Vitamin A weg: Sie verwendet Protein,
Ballaststoffe, Vitamin A, C und D, Calcium, Eisen und Kalium; Vitamin D
ersetzt Vitamin E, Magnesium entfaellt. Eine weitere NRF8.3-Anwendung
laesst wegen eines fehlenden britischen Vitamin-E-Referenzwerts Vitamin
E weg und behaelt Vitamin A ebenfalls bei. Damit belegt der Name
`NRF8.3` allein keine Vitamin-A-lose, zu C-324 passende Formel und
keine Uebertragbarkeit ihrer Validierung auf den Tagesscore.

Quellen: Fulgoni, Keast, Drewnowski (2009), *Development and validation
of the nutrient-rich foods index*, DOI
[10.3945/jn.108.101360](https://doi.org/10.3945/jn.108.101360);
Drewnowski, Richonnet (2020), *Dairy and Fruit Listed as Main
Ingredients Improve NRF8.3 Nutrient Density Scores of Children's
Snacks*, DOI
[10.3389/fnut.2020.00015](https://doi.org/10.3389/fnut.2020.00015).

**Nicht entschieden, nicht gebaut:** ob LumeOS eine gesondert
zusammengestellte und eigenstaendig zu validierende Vitamin-A-lose
NRF8.3-Variante fuehren soll.

## Abnahme

**2026-08-31, Orchestrator.**

### E-38 ist nicht uebergangen — die Luecken sind echt

    Komponente    gemessen  zensiert  log. Null  Luecke  Spur
    CARTB            6.294       119         31     641    55
    CAROTPAXB        5.093         1          0   1.983    63

`[cmd]` **Die zensierten tragen nach E-38 bereits 0.** `[read]` **Kein
offener Importfehler.**

`[cmd]` **`trace` ist die eigene BLS-Herkunft *Spuren*, ohne
numerische Menge** — **weder zensiert noch als Null belegt.**
`[read]` **E-38 liefert dafuer keine Grenze, die eingesetzt werden
duerfte.**

### Und der Blocker ist klein

`[cmd]` **In den 392 Mahlzeitpositionen: 108 echte Luecken bei
`CAROTPAXB` — aus 14 Lebensmitteln.** `[cmd]` **Plus 12 Spuren aus
einem.**

`[read]` **Fuenfzehn Lebensmittel blockieren dreissig Tage.**

`[cmd]` **`CARTB`: 10 von 30 Tagen vollstaendig, aus zwei
Lebensmitteln plus Spuren.** `[cmd]` **`RETOL`: 30 von 30.**

### NRF8.3 ist keine Ersatzformel

`[cmd]` **Die belegte Variante von Drewnowski und Richonnet (2020)
laesst Vitamin A nicht weg** — sie ersetzt Vitamin E durch Vitamin D
und streicht Magnesium.

`[cmd]` **Eine zweite Anwendung streicht Vitamin E wegen eines
fehlenden britischen Referenzwerts und behaelt Vitamin A.**

`[read]` **Damit belegt der Name allein keine Vitamin-A-lose Formel**
— **und keine Uebertragbarkeit ihrer Validierung.**

`[read]` **Er hat mit Quellen und DOI geantwortet, statt zu
schaetzen.**

**Abgenommen.** **Die fuenfzehn Lebensmittel gehen als C-368 an Tom,
mit einer Messung davor.**

