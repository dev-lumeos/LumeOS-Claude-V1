---
nr: A-72
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-424
entscheidung: null
beruehrt:
  tabellen: [nutrition.meals]
zahlen:
  gemessen: 2026-09-08
  tabellen: 176
  sichten: 12
  funktionen: 164
  from_dateien: 108
  rpc_dateien: 22
---

# A-72 — eine Leser-Deklaration im Code

## Befund

Aus C-424, Codex, 2026-09-08.

`[cmd]` **Eine Leser-Registry ist aus dem Bestand nicht dauerhaft
ableitbar:**

    pg_depend    127 Kanten fuer 12 Sichten
                 NULL fuer drei Funktionen, die lesen
    App-Code     108 Dateien mit .from(), 22 mit .rpc()
                 dem Katalog unbekannt

`[cmd]` **176 Tabellen, 12 Sichten, 164 Funktionen** — **eine
minimale Registry haette 352 Eintraege, ohne Leser-Kanten.**

## Die Frage

`[read]` **Codex' Ausweg:** *,,eine explizite, code-nahe
Leser-Deklaration oder eine verpflichtende statische Pruefung."*

`[read]` **Das ist eine Arbeitsregel, keine Aufgabe** — **jeder, der
eine Tabelle liest, muesste es hinschreiben.**

## Was es loesen wuerde

`[cmd]` **A-71: sechsmal am 07.09. lag ein Leseweg ungenutzt
daneben** — **und jedes Mal hat Tom es gefunden.**

`[read]` **Mit einer Deklaration waere messbar, wer liest und wer
nicht** — **und eine Kachel mit falschem Attrappen-Vermerk fiele
auf.**

## Was es kostet

`[read]` **Eine Zeile je Leseweg, gepflegt von jedem Agenten.**

`[read]` **Und ein Waechter, der sie prueft** — **sonst verfaellt
sie wie jede Handpflege.**

`[cmd]` **Zum Vergleich: `beruehrt:` in den Punktdateien ist
dieselbe Klasse** — **und `punkte-pruefen.mjs` haelt es gruen.**
