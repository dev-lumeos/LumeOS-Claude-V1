---
nr: G-294
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-294 — CrossModuleInsights — Goals bekommt nichts

## Befund

`[cmd]` **`SPEC_10` nennt `CrossModuleInsights`:** *,,Nutrition Score
zu Dashboard-Karte fuer Goals"*.

`[cmd]` **Im `goals`-Schema gibt es keine Funktion, die Nutrition
liest.**

`[read]` **Der Nutrition-Score existiert noch nicht** (C-324 laeuft)
— **aber die Naht auch nicht.**

## Die Modulgrenze

`[cmd]` **E-29 verlangt fuer Coach-Zugriffe eine Funktion.** `[read]`
**Ob das hier gilt, ist zu messen** — `goals` und `nutrition` sind
beide Nutzermodule, kein Dritter liest.

`[cmd]` **Und `lib/dashboard/lesen.ts` liest bereits aus fremden
Modulen** — **die Naht koennte dort liegen.**

`[read]` **Erst C-324, dann dieser Punkt** — **ohne Score gibt es
nichts zu uebergeben.**

## Auftrag — Erkenntnisse ueber Module hinweg

**Mitbeauftragt: G-232, G-234.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-294 — `CrossModuleInsights`

`[cmd]` **`C-324` ist erledigt** — die NRF9.3-Funktion steht.

`[read]` **Lies den Punkt und miss, was er verlangt** — **und was
davon heute Daten hat.**

`[cmd]` **E-52 gilt:** **wo dieselben Daten immer zusammen gebraucht
werden, entsteht eine Sicht in der Datenbank** — **keine Schleife im
Browser.**

`[read]` **Wenn eine Sicht noetig ist: melden, nicht bauen** —
`supabase/` gehoert Codex.

### 2 · G-232 — Quick-Add ohne Makros

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit G-320 gibt es `FoodSuchModal` mit Live-Vorschau**,
seit G-330 die fuenf Werte im Kopf.

### 3 · G-234 — zwei Selektoren nur in der Spec

`[cmd]` **Miss, welche zwei** — **und ob sie heute gebraucht
wuerden.**

`[read]` **Was in der Spec steht und nirgends gebraucht wird, gehoert
gestrichen** — **nicht gebaut.**

### Was nicht zu tun ist

**Keine Sicht in `supabase/` anlegen** — melden.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    G-294   was verlangt der Punkt, was hat Daten
    G-232   gilt noch / ueberholt
    G-234   welche zwei, gebraucht oder streichen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
