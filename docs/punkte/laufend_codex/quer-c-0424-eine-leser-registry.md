---
nr: C-424
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: A-71
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.meals]
zahlen:
  gemessen: 2026-09-08
  faelle: 6
---

# C-424 — eine Leser-Registry

## Befund

Aus A-71, Codex, 2026-09-08:

> *,,Dafuer braeuchte es zuerst eine gepflegte, testbare
> Leser-Registry."*

`[cmd]` **Sechsmal am 07.09. lag ein Leseweg ungenutzt daneben** —
**und jedes Mal hat Tom es gefunden.**

`[cmd]` **Ein Waechter *Tabelle ohne Leser* ist nicht baubar:**
**Leser laufen ueber Sichten, RPCs und generische Funktionen, ohne
den Tabellennamen im Code zu tragen.**

## Auftrag — C-423 einspielen, dann die Registry pruefen

**Beauftragt am 2026-09-08.**

### 1 · C-423 einspielen

`[cmd]` **Nur auf Wegwerf-Datenbanken geprueft.** `[cmd]` **163
Schritte, 483,1 s, 3/3 Tests.**

`[read]` **Vorher Sicherung nach `backup/`, wie bei C-421 und
C-422.**

`[read]` **Ohne den Bestand zeigt die Vorlagenkachel eine Null** —
**und Null sieht aus wie ein Ergebnis** (E-72).

### 2 · Die Registry messen, nicht bauen

`[read]` **Miss zuerst, was sie kosten wuerde:**

`[cmd]` **Wie viele Tabellen gibt es, wie viele Sichten, wie viele
Funktionen?**

`[read]` **Eine Registry, die von Hand gepflegt wird, ist am Tag
ihrer Erstellung richtig und danach nie wieder** — **es sei denn,
ein Waechter prueft sie.**

`[read]` **Also die eigentliche Frage: laesst sie sich aus dem
Bestand ableiten?** `[cmd]` **`pg_depend` kennt Abhaengigkeiten
zwischen Sichten und Tabellen** — **aber nicht zwischen App-Code und
Datenbank.**

`[read]` **Sag, ob es geht und was es kostet.** `[read]` **Nicht
bauen.**

### Abnahmebedingungen

    A1  C-423 live: Zeilen je Tabelle auf test-user.
    A2  Sicherung: Pfad und Groesse.
    A3  Vollkette nach dem Einspielen: Schritte und Sekunden.
    A4  Registry: Tabellen / Sichten / Funktionen, gezaehlt.
    A5  Registry ableitbar? Ja mit Weg, nein mit Grund.

### Was nicht zu tun ist

**Die Registry nicht bauen** — **erst messen.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
