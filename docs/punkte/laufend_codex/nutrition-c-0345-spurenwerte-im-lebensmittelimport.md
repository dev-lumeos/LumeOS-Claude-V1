---
nr: C-345
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-08-29
braucht: []
kind_von: C-343
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-29
  quelle_zahlen: 871311
  db_zeilen: 869501
  quelle_spuren: 1800
---

# C-345 — Spurenwerte im Lebensmittelimport

## Befund

`[cmd]` **`BLS_4_0_Daten_2025_DE.xlsx` traegt 871.311 numerische
Werte, `nutrition.food_nutrients` 869.501 Zeilen.**

`[cmd]` **Und die Quelle fuehrt genau 1.800 Werte mit der
Datenherkunft *Spuren*.**

`[read]` **Ob die Spurenwerte bewusst weggelassen wurden, ist offen.**
**Die Antwort steht im Kettenschritt, der `food_nutrients`
befuellt** — nicht in der Quelldatei.

## Kein Auftrag

`[read]` **1.800 von 871.311 sind zwei Promille**, und *Spuren* heisst
laut BLS-Dokumentation ausdruecklich, dass kein gemessener Wert
vorliegt. **Wer den Punkt aufgreift, sieht zuerst im Kettenschritt
nach, ob es eine Entscheidung war.**

## Auftrag — die Datenherkunft wiederherstellen

**Mitbeauftragt: C-361.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### Warum dieser Punkt ploetzlich traegt

`[cmd]` **C-49 hat gemessen: `VITC` ist an 0 von 30 Tagen
vollstaendig, Vitamin A ebenso.** `[cmd]` **NRF9.3 ist damit nicht
rechenbar.**

`[cmd]` **Die Ursache: der BLS verzeichnet ein Nichtvorkommen als
FEHLEND, nicht als 0** — **und `value_complete` verlangt jeden
Posten.**

`[read]` **Am 2026-08-29 fehlte `VITC` bei Ei, Kabeljau, weissem Reis
und Ziegenfleisch.** **Alle enthalten tatsaechlich keins.**

### Und die Antwort liegt in der Quelle

`[cmd]` **Der BLS fuehrt *Logische Null* als eigene Datenherkunft:
18.566 Werte.** `[cmd]` **Er unterscheidet selbst zwischen *nicht
gemessen* und *enthaelt keins*.**

`[cmd]` **Dieser Punkt hat gemessen, dass der Import die
Unterscheidung verworfen hat** — **871.311 Zahlen in der Quelle,
869.501 Zeilen in `food_nutrients`, und `data_source` traegt einen
einzigen Wert.**

`[read]` **Damit ist C-360 vielleicht keine Entscheidung, sondern eine
Wiederherstellung.**

### Was zu messen ist

**Wie viele der fehlenden Posten tragen in der Quelle eine *Logische
Null*, und wie viele sind wirklich leer?**

`[cmd]` **Die Quelle liegt in
`docs/BrainstormDocs/Nutrition/BLS_4_0_Daten_2025_DE.xlsx`** — **je
Naehrstoff drei Spalten: Wert, Datenherkunft, Referenz.**

`[cmd]` **Und die vier Anzeigearten aus Kapitel 4.4:** numerischer
Wert, Spuren, `-` fuer fehlend, `<LOQ`/`<LOD`.

`[read]` **Miss zuerst, dann sag, ob eine Wiederherstellung C-360
beantwortet** — **oder ob eine Entscheidung uebrig bleibt.**

### 2 · C-361 — die Pipeline-Historie

`[cmd]` **Es gibt keine Stelle, die sagt, welche Kettenschritte live
sind.** `[cmd]` **`kette.json` fuehrt die Reihenfolge, nicht den
Zustand.**

`[read]` **Das hat am 30.08. G-273 blockiert** — 78 Zeilen lagen in
der Kette und waren nie eingespielt.

`[read]` **Eine Tabelle je Schritt mit Zeitpunkt und Pruefsumme ist
das uebliche Muster.** **Die Vorfrage: wer schreibt hinein — der
Schritt selbst oder der Lauf?**

### Was nicht zu tun ist

**Keine Nullen setzen, bevor die Herkunft belegt ist.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    fehlende Posten        wie viele mit "Logische Null"
    wirklich leer          wie viele
    Spuren                 die 1.800 aus diesem Punkt
    beantwortet es C-360   ja / nein, mit Begruendung
    Pipeline-Historie      Vorschlag, nicht gebaut

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

`[cmd]` **Gemessen in G-280: 18 Starts, sechs an einem Tag, vor keinem
ein Fehler** — **`neustart` fuehrt `taskkill /T /F` auf Port 3200
aus, und Tom arbeitet dort mit.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
