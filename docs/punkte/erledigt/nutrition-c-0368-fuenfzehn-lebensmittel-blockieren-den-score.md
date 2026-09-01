---
nr: C-368
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: C-367
entscheidung: null
agent: codex
beauftragt: 2026-08-31
erledigt: 2026-09-01
commit: OFFEN
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-31
  luecken_carotpaxb: 108
  betroffene_lebensmittel: 14
  spuren_lebensmittel: 1
  scorefaehige_tage: 0
---

# C-368 — fuenfzehn Lebensmittel blockieren den Score

## Befund

Aus C-367, Codex, 2026-08-31.

`[cmd]` **In den 392 Mahlzeitpositionen von `dev` liegen 108 echte
`CAROTPAXB`-Luecken — aus 14 Lebensmitteln.** `[cmd]` **Plus 12
Spuren aus einem weiteren.**

`[read]` **Fuenfzehn Lebensmittel blockieren dreissig Tage.**

`[cmd]` **`RETOL` ist an 30 von 30 Tagen vollstaendig, `CARTB` an
10** — **nur `CAROTPAXB` faellt auf 0.**

## Die Frage

**Was geschieht mit fuenfzehn Lebensmitteln ohne
Carotinoid-Messwert?**

`[read]` **Es sind wenige, und sie sind benannt.** `[read]` **Wenn
sie eine Quelle haetten, waere der Score morgen rechenbar.**

## Drei Wege

`[read]` **Eine zweite Quelle.** `[cmd]` **BLS 4.0 ist die einzige
Lebensmittelquelle (E-03)** — **eine zweite waere eine
Grundsatzentscheidung, nicht ein Nachtrag.**

`[read]` **Oder der Score bleibt `incomplete`, bis die Datenlage
besser ist.** `[read]` **Ehrlich, aber die Kachel bliebe leer.**

`[read]` **Oder Vitamin A wird aus der Formel genommen.** `[cmd]`
**Dann ist es nicht mehr NRF9.3** — **und Codex hat belegt, dass
NRF8.3 keine Vitamin-A-lose Fassung ist.**

## Zuerst messen

`[read]` **Welche fuenfzehn sind es?** **Bevor entschieden wird,
gehoert die Liste auf den Tisch** — **vielleicht sind es Randfaelle,
vielleicht Grundnahrungsmittel.**

## Auftrag — die fuenfzehn benennen

**Beauftragt am 2026-08-31.**

### Was zu tun ist

**Die Liste auf den Tisch legen, bevor Tom entscheidet.**

`[cmd]` **14 Lebensmittel mit `CAROTPAXB`-Luecke, eines mit Spuren.**

`[read]` **Je Lebensmittel: Name, wie oft es in den 392 Positionen
vorkommt, und ob `CARTB` und `RETOL` dort vorhanden sind.**

`[read]` **Und die Frage dahinter:** **sind es Randfaelle oder
Grundnahrungsmittel?** `[cmd]` **Bei `CARTB` waren es zwei
Lebensmittel fuer 17 Luecken** — **wenn dieselben zwei auch bei
`CAROTPAXB` fehlen, ist es ein enger Kreis.**

### Und eine Gegenprobe

`[read]` **Wie viele der 4.970 Lebensmittel im Katalog haben
vollstaendige Vitamin-A-Komponenten?** `[cmd]` **Wenn es die Mehrheit
ist, ist das Problem die Auswahl auf `dev`, nicht die Datenlage.**

### Was nicht zu tun ist

**Keine Werte setzen** — C-368 ist eine Entscheidung.
**Keine zweite Quelle heranziehen** — E-03 gilt.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    die 15                Namen, Haeufigkeit, welche Komponente
    Katalog gesamt        wie viele mit vollstaendigem Vitamin A
    Randfall oder nicht   beurteilt, mit Zahlen

## Bericht

### 2026-09-01 — Codex

`[cmd]` Gemessen gegen `dev`, Konto
`10000000-0000-0000-0000-000000000101`, 2026-08-01 bis 2026-08-30.
Die 392 Mahlzeitpositionen bestehen aus **390 BLS- und zwei
Custom-Positionen**. Nur die 390 BLS-Positionen koennen von
`food_nutrients` blockiert werden.

| CAROTPAXB-Zustand | Lebensmittel (BLS-Code) | Positionen / Tage | CARTB | RETOL |
|---|---|---:|---|---|
| Luecke | Kabeljau (roh) (T204100) | 12 / 12 | zensiert, 0 | gemessen, 2 |
| Luecke | Thunfisch (roh) (T121100) | 12 / 12 | zensiert, 0 | gemessen, 76 |
| Luecke | Weisser Reis (roh) (C352000) | 12 / 10 | **Luecke** | logische Null, 0 |
| Luecke | Ziegenfleisch (roh) (V122100) | 12 / 12 | gemessen, 7 | gemessen, 36 |
| Luecke | Bulgur (gekocht) (C119132) | 8 / 8 | gemessen, 0 | gemessen, 0 |
| Luecke | Haferflocken (C133000) | 7 / 7 | zensiert, 0 | logische Null, 0 |
| Luecke | Koerniger Frischkaese (< 10 % Fett) (M711100) | 6 / 6 | gemessen, 3 | gemessen, 11 |
| Luecke | Lachs (geduenstet) (T410052) | 6 / 6 | gemessen, 0 | gemessen, 0 |
| Luecke | Lachs (roh) (T410100) | 6 / 6 | zensiert, 0 | gemessen, 0 |
| Luecke | Magerquark (< 10 % Fett) (M713100) | 6 / 6 | zensiert, 0 | gemessen, 1 |
| Luecke | Skyr (< 10 %) (M710100) | 6 / 6 | zensiert, 0 | gemessen, 1,5 |
| Luecke | Bulgur (roh) (C119100) | 5 / 5 | gemessen, 0 | logische Null, 0 |
| Luecke | Couscous (roh) (C119200) | 5 / 5 | gemessen, 0 | logische Null, 0 |
| Luecke | Vollkornreis (roh) (C351000) | 5 / 5 | **Luecke** | logische Null, 0 |
| Spuren | Haehnchenbrust (roh) (V416100) | 12 / 12 | **Spuren** | gemessen, 3,3 |

`[cmd]` Die ersten 14 Zeilen erklaeren exakt **108** fehlende
CAROTPAXB-Positionen; die letzte erklaert die **12** Spuren. Unter
E-38 ist `zensiert, 0` vorhanden. `Luecke` und `Spuren` bleiben
unvollstaendig. Der Fehler ist daher nicht auf CAROTPAXB allein
begrenzt: Weisser und Vollkornreis haben zugleich keine CARTB-Menge,
Haehnchenbrust traegt fuer beide Carotin-Komponenten nur Spuren.

**Keine Randfaelle:** Die 15 sind sechs Getreide-/Beilagenartikel
(42 Positionen), vier Fischvarianten (36), drei Frischkaeseprodukte
(18), Ziegenfleisch (12) und Haehnchenbrust (12). Sie sind roh,
gegart oder minimal verarbeitet; 108 der 120 blockierenden
Positionen stammen bereits aus Getreide, Fisch, Milchprodukt und
Fleisch ohne den Spurenfall.

`[cmd]` Die Gegenprobe ergibt im aktuellen Katalog **5.092 von 7.140
Lebensmitteln (71,3 %)** mit allen drei Vitamin-A-Komponenten als
vorhandene Zahlen (gemessen, zensiert oder logische Null). Der im
Auftrag genannte Nenner **4.970** ist auf dem aktuellen `/v2/`-Stand
nicht reproduzierbar: Es gibt 7.140 Foods; nur gemessene drei Werte
waeren 4.712, mit den nach E-38 vorhandenen zensierten/logischen
Nullen 5.092. Die Luecke ist damit zugleich eine Auswahl- und eine
Katalogluecke; sie ist nicht mit einem Wert oder einer zweiten Quelle
aufgeloest worden.

## Abnahme

**2026-09-01, Orchestrator.**

### Es sind Grundnahrungsmittel

    6 Getreide/Beilagen   42 Positionen
    4 Fischvarianten      36
    3 Frischkaese         18
    Ziegenfleisch         12
    Haehnchenbrust        12

`[cmd]` **Weisser Reis, Vollkornreis, Bulgur, Couscous,
Haferflocken, Lachs, Thunfisch, Kabeljau, Magerquark, Skyr,
koerniger Frischkaese, Haehnchenbrust.**

`[read]` **Keine Randfaelle** — **roh, gegart oder minimal
verarbeitet.**

`[cmd]` **Die ersten 14 Zeilen erklaeren exakt die 108 fehlenden
Positionen, die letzte die 12 Spuren.**

### Und der Fehler ist breiter als vermutet

`[cmd]` **Weisser und Vollkornreis haben zugleich keine
CARTB-Menge.** `[cmd]` **Haehnchenbrust traegt fuer beide
Carotin-Komponenten nur Spuren.**

`[read]` **Es ist also nicht *eine exotische dritte Komponente*, wie
E-34 unterstellte** — **es ist die Carotinoidmessung insgesamt, bei
Lebensmitteln, die kaum Carotinoide enthalten.**

### Meine Zahl war wieder falsch

`[cmd]` **5.092 von 7.140 Lebensmitteln (71,3 %) haben alle drei
Komponenten als vorhandene Zahlen.**

`[cmd]` **Der von mir genannte Nenner 4.970 ist nicht
reproduzierbar** — ich hatte ihn aus einer Suchmessung uebernommen,
nicht aus dem Katalog.

`[read]` **Und die Folgerung ist unbequem: 71 Prozent des Katalogs
sind rechenbar, und der Speiseplan von `dev` trifft die uebrigen 29
Prozent.**

`[read]` **Wer Reis, Haferflocken und Fisch isst, bekommt keinen
Score.**

**Abgenommen.** **Die Entscheidung geht als C-378 an Tom.**

