---
nr: G-566
typ: entscheidung
modul: goals
schwere: mittel
angelegt: 2026-09-30

braucht: [G-542]
kind_von: G-542

quellen:
  - docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

beruehrt:
  tabellen:
    - goals.goal_strategies
---

# Ist die Katalograte fuer Fortgeschrittene zu hoch?

`[read]` **Abgespalten von G-542**, weil dort die EINHEIT gefragt war und
sie mit E-83 entschieden ist. **Hier bleibt der WERT.**

## Die Frage

`[cmd]` **`goal_strategies.lean_bulk.weight_change_target_percent` steht
auf 0,25 %/Woche.** Bei 83,74 kg sind das nach E-1 **+230 kcal/Tag**.

`[cmd]` **Die Formelsammlung (Dokument B, 2026-09-29) nennt
erfahrungsabhaengige Zuschlaege:**

    Fortgeschrittene   +200 kcal/Tag
    Profis             +150 kcal/Tag

`[read]` **Unser Wert liegt darueber** — und zwar nicht, weil er falsch
gesetzt waere, sondern weil er als Rate gesetzt ist: **derselbe Prozentwert
ergibt bei einem schwereren Nutzer mehr Kilokalorien.** Bei 72 kg waeren es
198 kcal und damit genau der Buchwert.

## Was zu entscheiden ist

**Ist +0,25 %/Woche fuer einen fortgeschrittenen Natural richtig, oder
gehoert die Rate nach Erfahrungsstufe abgestuft?**

`[read]` **Fuer Tobias.** Es ist eine Erfahrungsfrage: die Literatur nennt
0,25–0,5 %/Woche (Iraki 2019) als Spanne fuer alle, die Formelsammlung
nennt Kilokalorien je Stufe. **Beide koennen nicht gleichzeitig gelten,
solange die Rate nicht nach Stufe differenziert.**

## Die Folge fuer den Bau

`[read]` **Bleibt 0,25 fuer alle:** dieser Punkt wird geschlossen, nichts
zu tun.

`[read]` **Wird abgestuft:** der Katalog braucht die Rate je
Erfahrungsstufe, und `requirements.min_experience` ist dann nicht mehr nur
eine Sperre, sondern ein **Rechenparameter**. `[cmd]` Die vier Stufen
stehen in E-80 (`beginner 0,75 · advanced 0,90 · pro 1,00 · elite 1,10`) —
**aber das sind Score-Faktoren, keine Ratenfaktoren.** Sie hier zu
verwenden waere eine Annahme, keine Ableitung.

`[read]` **Und es beruehrt G-561:** wenn die Rate nach Stufe variiert,
variieren die Waechterschwellen mit — ein relativer Waechter haelt das
aus, ein absoluter in Kilogramm nicht.

## Nachtrag 2026-10-01 — die Waechtergrenzen bewegen sich nicht mit

`[cmd]` **Codex hat es beim Abschluss von G-561 gemeldet:** die
Waechtergrenzen sind **Text im Katalog und Konstanten in G-520**. **Bloss
neue Zielraten je Erfahrungsstufe wuerden die Schwellen nicht
mitbewegen.**

`[read]` **Damit ist diese Entscheidung teurer als sie aussieht.** Wird
abgestuft, muss die Grenze **aus der Rate abgeleitet** oder je Stufe
gefuehrt werden — sonst prueft ein Anfaenger mit 0,25 %/Woche gegen
dieselbe Obergrenze wie ein Elite-Athlet mit 0,5.

`[read]` **Bleibt es bei einer Rate fuer alle, entfaellt das** — und das
ist ein Argument fuer die einfache Antwort, kein Grund, sie zu waehlen.


## Nachtrag 2026-10-01 — der Spielraum ist gemessen

`[cmd]` **Claude Code hat die Frage aus G-569 beantwortet, und die
Antwort ist nein:** der Bau haelt abgestufte Raten nicht aus. Der Abstand
zwischen Katalograte und eigener Waechterschwelle:

    aggressive_bulk   Rate 0,75 %   Schwelle 0,896 %   Spielraum 0,146 pp
    aggressive_cut    Rate 1,00 %   Schwelle 1,194 %   Spielraum 0,194 pp

`[read]` **Wird `aggressive_bulk` je Stufe angehoben, greift der Waechter
beim vorgesehenen Tempo** — der Nutzer tut genau das, was der Katalog ihm
vorgibt, und bekommt eine Warnung dafuer. **Zwei Zehntel Prozentpunkt
sind der ganze Abstand.**

`[cmd]` **Die Schwellen liegen seit G-569 als Konstanten in
`apps/web/src/lib/goals/waechter-schwellen.ts`** (`SCHWELLE_PCT`), die
Raten im Katalog. **Zwei Orte, keine Verbindung.**

`[read]` **Daraus folgt eine zweite Entscheidung, die vor dem Bau
steht:** wird die Grenze aus der Rate abgeleitet — etwa als Faktor
darauf, heute waeren das rund 1,19 — oder je Stufe eigens gefuehrt?
**Ein Faktor haelt den Abstand bei jeder Abstufung konstant; eigene
Zahlen je Stufe erlauben verschiedene Toleranz, kosten aber einen Ort
mehr.**

`[read]` **Beides ist erst zu bauen, wenn die erste Frage beantwortet
ist** — und bleibt es bei einer Rate fuer alle, entfaellt beides.
