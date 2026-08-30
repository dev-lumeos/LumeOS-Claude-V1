---
nr: G-272
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-265
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  tabellen: [nutrition.meals, nutrition.meal_items]
  dateien: [apps/web/src/app/v2/nutrition/tab-foods.tsx]
zahlen: null
---

# G-272 — `+ Add` braucht ein Erfassungsmodal

## Befund

Aus G-271, Claude Code, 2026-08-29.

`[cmd]` **`+ Add` fuehrt seit G-265 auf die Detailsuche mit gefuelltem
Feld** — drei Treffer, Lebensmittel ausgewaehlt, 101 Naehrstoffe.

`[read]` **Aber das ist nicht, was der Knopf verspricht.** `[read]`
*,,Add"* heisst hinzufuegen, nicht suchen.

`[cmd]` **Keins der vier vorhandenen Modale schreibt ein Lebensmittel
in `meals` / `meal_items`.**

## Was zu klaeren ist

`[read]` **Ein Erfassungsmodal braucht mehr als das Lebensmittel:**
Menge, Einheit, Mahlzeit, Tag. `[cmd]` **`PortionSelector` und
`FoodAmountInput` stehen in `SPEC_10`.**

`[read]` **Und der Schreibweg selbst ist zu messen** — ob er
existiert oder ob dies der erste ist.

## Berichtigung, 2026-08-29

`[cmd]` **`nutrition.diary_entries` gibt es nicht.** Das Tagebuch
schreibt in **`meals`** und **`meal_items`** — der Waechter hat es
gefangen.

`[read]` **Der Begriff stammt aus dem Bericht und ich habe ihn
uebernommen, ohne ihn zu pruefen** — dieselbe Klasse wie
`nutrition.nutrition_targets` am 28.08., das in `goals` liegt.

## Auftrag — drei Punkte ohne Schemabezug

**Mitbeauftragt: G-273, G-266.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Codex arbeitet parallel am Plan-Schema und an den
Umrechnungsfaktoren** — **`supabase/` nicht anfassen.**

### 1 · G-272 — das Erfassungsmodal

`[cmd]` **`+ Add` fuehrt seit G-265 auf die Detailsuche mit
gefuelltem Feld.** `[read]` **Aber *,,Add"* heisst hinzufuegen, nicht
suchen.**

`[cmd]` **Du hast gemessen: keins der vier Modale schreibt ein
Lebensmittel ins Tagebuch.** `[cmd]` **Die Tabellen heissen `meals`
und `meal_items`** — nicht `diary_entries`, das war mein Fehler im
Punkt.

`[read]` **Miss zuerst, ob es einen Schreibweg gibt** — bei
Supplements gab es ihn seit G-148, und G-138 hat drei Tage daran
vorbeigesucht.

`[cmd]` **`PortionSelector` und `FoodAmountInput` stehen in
`SPEC_10`.** `[read]` **Ein Erfassungsmodal braucht mehr als das
Lebensmittel: Menge, Einheit, Mahlzeit, Tag.**

### 2 · G-273 — die zaehlende Funktion anbinden

`[cmd]` **Codex hat sie in C-348 gebaut: dieselben zehn Flags mit
1.814 statt 8.298.086 Byte.** `[cmd]` **Der Reiter nutzt sie nicht.**

`[read]` **Der Nachweis ist Ergebnisgleichheit** — dieselben Flags,
dieselben Tageszaehlungen. **Eine schnellere Anzeige mit anderen
Zahlen waere keine Verbesserung.**

`[cmd]` **Der Reiter steht bei 6.393 ms, davon rund 895 ms
Uebertragung.** `[read]` **Miss vorher und nachher.**

### 3 · G-266 — Weg C

**Entschieden in `docs/entscheidungen/E-33`.** Tom: **Weg C.**

`[read]` **Die eigene Seite bleibt, der Zustand wandert mit.**
`[cmd]` **Die Haelfte ist gebaut** — seit G-265 liest die Zielseite
`?food=` und `?q=`.

`[read]` **Was fehlt: der Weg zurueck**, und dass der Verweis mehr
mitnimmt als nichts. **Wer mit *,,reis"* im Feld hinueberwechselt,
findet es dort wieder.**

### Was nicht zu tun ist

**Kein Plan-Reiter** — G-267 bis G-270 warten auf Codex' Schema.
**`supabase/` nicht anfassen.**
**Keine zweite Ansicht neben eine bestehende.**
**Nichts auf `dev@lumeos.app` schreiben** — auch nicht zum Pruefen
des Schreibwegs. `[cmd]` **Dafuer `test-user@lumeos.local`, mit
Rueckbau.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Schreibweg ins Tagebuch     existiert er? gemessen
    Erfassungsmodal             gebaut oder begruendet nicht
    zaehlende Funktion          Ladezeit vorher / nachher
    Ergebnisgleichheit          dieselben Flags, belegt
    Detailsuche hin und zurueck Zustand kommt an, beide Richtungen
    Attrappen                   am Schirm gezaehlt (A-59)
    Bildschirmfoto je Zustand   `node tools/schuss.mjs`

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30, A-59, A-60**, **`.limit()` hebt den PostgREST-Deckel
nicht auf**, **und ein `await` in einer Schleife kostet je Durchlauf
voll** — dein Befund aus G-252.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
