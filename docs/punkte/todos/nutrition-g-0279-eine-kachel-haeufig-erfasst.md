---
nr: G-279
typ: feature
modul: nutrition
schwere: niedrig
angelegt: 2026-08-30
braucht: []
kind_von: G-263
entscheidung: E-56
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/tab-insights.tsx]
zahlen:
  gemessen: 2026-08-30
  fruehstueck_haeufigkeit: 27
  von_tagen: 30
---

# G-279 — eine Kachel *haeufig erfasst*

## Befund

Aus G-263, Claude Code, 2026-08-30.

`[cmd]` **Die Attrappe *Smart suggestions* ist entfernt** — keine
ihrer vier Zeilen trug.

`[read]` **Aber eine Zahl darin war zaehlbar:** `[cmd]` **ein
Fruehstueck kam an 27 von 30 Tagen vor.**

`[read]` **Die Attrappe machte daraus *,,Top breakfast, 78 %"*** —
**und *Top* ist ein Urteil, die Quote war erfunden.**

## Die Frage

**Waere eine Kachel *,,haeufig erfasst"* gewollt?**

`[read]` ***Haeufig erfasst* ist eine Angabe. *Top* ist eine
Bewertung.** `[cmd]` **C-108/F-02: nennen ja, bewerten nein.**

`[read]` **Dafuer spricht:** die Zahl ist da und ehrlich, **und wer
oft dasselbe isst, findet es schneller wieder.**

`[read]` **Dagegen:** `[cmd]` **`wieGestern()` gibt es bereits** —
**eine zweite Abkuerzung zum selben Zweck koennte die eine
verwaessern.**

## Entschieden: E-56, 2026-09-02

Tom: *,,ja beide verwenden aber darin auch zeigen was das ist, sprich
same as yesterday und darunter was das war / most used und darunter
was das war."*

    Wie gestern      darunter: die Posten des Vortags
    Am haeufigsten   darunter: was das war, mit Zahl

`[read]` **Der Unterschied zur entfernten Attrappe ist die
Ehrlichkeit:** `[cmd]` **sie machte aus 27 von 30 Tagen ein *,,Top
breakfast, 78 %"***. `[read]` ***Am haeufigsten* ist eine Angabe,
*Top* ein Urteil** — C-108 und F-02.

`[read]` **Und die Zahl steht als das da, was sie ist:** *27 von 30
Tagen*, kein Prozentwert.

`[read]` **Ein Knopf ohne Inhalt zwingt zum Ausprobieren** — **wer
sieht, was er uebernimmt, entscheidet vorher.** `[read]` **Und die
zwei unterscheiden sich dann sichtbar: gestern kann ein Ausreisser
gewesen sein, das Haeufigste ist ein Muster.**

### Vorher: G-328

`[cmd]` **Auf `dev` kommt das haeufigste Fruehstueck einmal in 30
Tagen vor, nicht 27 mal.** `[read]` **Was *am haeufigsten* zaehlt —
Name, Posten oder Zusammensetzung — ist zu klaeren, bevor die Kachel
entsteht.**

## Auftrag

**Mitbeauftragt mit G-343 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: nicht gebaut, zwei Gruende

`[cmd]` **Der Leseweg fehlt:** **388 Posten in den Browser gegen 4
Zeilen aus einer Sicht** (E-52). `[read]` **Das ist Codex' Arbeit.**

`[cmd]` **Und die Zaehlweise steht seit G-328: Tage, nicht
Eintraege.**

**Aber eine Produktentscheidung fehlt:**

    Position          Olivenoel 26 von 30   -- eine Zutat
    Zusammensetzung   nur 2 von 30          -- kein Muster

`[read]` **Beide Faelle gemessen.** `[read]` **Und das Ergebnis
entscheidet fast von selbst:** **eine Kachel *haeufig erfasst*, die
*2 von 30* zeigt, sagt nichts.**
