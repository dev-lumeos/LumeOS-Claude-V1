---
nr: C-364
typ: entscheidung
modul: supplements
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-202
entscheidung: null
agent: codex
beauftragt: 2026-08-31
beruehrt:
  tabellen: [supplements.intake_logs]
zahlen:
  gemessen: 2026-08-30
  produkte: 50
  marken: 120
  hersteller: 63
---

# C-364 — die Produktebene ist Wissen, kein Bestand

## Befund

Aus C-202, Codex, 2026-08-30.

`[cmd]` **`wissen.product_entities` traegt 50 Produkte, 120 Marken, 63
Hersteller.**

`[cmd]` **Nutzerbestand und Einnahmen verweisen weiter nur auf
Stoffe.**

`[read]` **Ein Nutzer nimmt heute *Magnesium*, nicht *Produkt X von
Hersteller Y*.**

## Die Frage

**Soll eine Einnahme auf ein Produkt zeigen koennen?**

`[read]` **Dafuer spricht:** `[cmd]` **C-250 hat gemessen, dass
`cost_per_serving` und `serving_size` fehlen** — **beides sind
Produkteigenschaften, keine Stoffeigenschaften.** `[read]` **Und der
Cam-Weg aus C-207 liest Packungen, also Produkte.**

`[read]` **Dagegen:** die Bilanz aus C-351 rechnet Stoffe. **Ein
Produkt haette eine Dosierung, die auf einen Stoff zeigt** — **eine
Zwischenschicht, die heute niemand braucht.**

`[read]` **Und die Modulgrenze:** `wissen` ist der Katalog,
`supplements` der Bestand. **Eine Verbindung waere ein Fremdschluessel
ueber Schemagrenzen** — **dieselbe Klasse wie E-29 bei `coach`.**

## Auftrag — die Grenze zwischen Katalog und Bestand

**Mitbeauftragt: C-365.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Was zu messen ist, bevor entschieden wird

`[cmd]` **`wissen.product_entities`: 50 Produkte, 120 Marken, 63
Hersteller.** `[cmd]` **`supplements.intake_logs`: 744 Einnahmen, alle
auf Stoffe.**

`[read]` **Miss, was eine Verbindung kosten wuerde** — **und ob sie
heute jemand braucht.**

`[cmd]` **C-250: `cost_per_serving` und `serving_size` fehlen** — beides
Produkteigenschaften. `[cmd]` **C-351: die Tagesbilanz rechnet
Stoffe.** `[cmd]` **C-207: der Cam-Weg liest Packungen, also
Produkte.**

`[read]` **Und die Modulgrenze zaehlt:** ein Fremdschluessel von
`supplements` nach `wissen` ist dieselbe Klasse wie E-29 bei `coach`.
**Melden, nicht setzen.**

### 2 · C-365 — die 33 CAS-Nummern

`[read]` **Die 27 Peptidsequenzen haben kein Ziel** — **das bleibt so,
bis jemand einen Leser nennt.**

`[cmd]` **Fuer CAS gibt es eine Spalte.** `[read]` **Miss, ob die 33
belegbar sind, und trag sie ein** — **kein Katalogausbau, nur
Kennungen.**

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Verbindung Produkt-Einnahme   was wuerde sie kosten
    braucht sie heute jemand      belegt
    Modulgrenze                   benannt, nicht ueberschritten
    CAS-Nummern                   wie viele belegbar, eingetragen
    Peptidsequenzen               unveraendert, mit Grund

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
