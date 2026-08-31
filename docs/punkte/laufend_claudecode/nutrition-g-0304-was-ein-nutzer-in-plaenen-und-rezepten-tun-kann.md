---
nr: G-304
typ: messung
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-304 — was ein Nutzer in Plaenen und Rezepten tun kann

## Warum

Tom, 2026-08-31: *,,analysiere meal plans/planner/rezepte und erklaer
mir was ich als user da machen kann oder soll."*

`[read]` **Der Orchestrator hat drei Auftraege abgenommen und kann
die Frage nicht beantworten.** `[read]` **Er hat Komponenten
abgehakt, keine Bedienung.**

`[cmd]` **Und die Lehre steht seit heute in `CLAUDE.md`:** `SPEC_03`
der Ablauf, `SPEC_10` die Bauteile. **Die Abnahme hat nur die
Bauteile gezaehlt.**

## Die Frage

**Was kann ein Nutzer in diesen drei Reitern tun — und was verlangt
`SPEC_03`, das er nicht kann?**

`[read]` **Jede Antwort muss aus dem Code kommen:** welcher Knopf,
welche Funktion, welcher Schreibweg, welche Tabelle.

## Auftrag — die Bedienungsliste

**Beauftragt am 2026-08-31.**

### Was zu liefern ist

**Eine Tabelle je Reiter — Meal plans, Planner, Rezepte.**

    Was der Nutzer tut     der Knopf, wie er heisst
    Was dann passiert      welche Funktion, welche Tabelle
    Wo es endet            geschrieben? angezeigt? nichts?
    Welcher Flow-Schritt   SPEC_03, Flow und Schrittnummer
                           oder "in keinem Flow"

`[read]` **Jede Zeile aus dem Code.** **Kein *,,man kann"* ohne
Fundstelle.**

### Und die Gegenrichtung, die wichtiger ist

**Welche Schritte aus `SPEC_03` kann ein Nutzer heute nicht gehen?**

`[cmd]` **Flow 3 (Plan aktivieren), Flow 7 (Rezept erstellen und
loggen), Flow 8 (Einkaufsliste), Flow 11–13 (Lebenszyklus).**

`[read]` **Je Schritt: geht er, geht er halb, geht er nicht.**
**Und wenn halb — woran hoert er auf?**

### Drei Fragen, die dabei zu beantworten sind

`[read]` **1. Wie kommt ein Nutzer zu seinem ersten Plan?** `[cmd]`
**Flow 3 beginnt bei der Uebersicht und nennt vier Quellen — fuer
*Eigene* steht kein Weg** (C-370). `[cmd]` **Der eine vorhandene Plan
stammt aus C-150, einem Seed.**

`[read]` **2. Was ist der Unterschied zwischen Planner und Meal
plans, aus Nutzersicht?** `[cmd]` **Du hast in G-299 geantwortet:
*Meal plans ist, was der Plan ist — der Planner, wann was gegessen
wird*.** `[read]` **Miss, ob die Oberflaeche das traegt** — **oder ob
beide dasselbe zeigen.**

`[read]` **3. Was geschieht mit einem abgelaufenen Plan?** `[cmd]`
**Der aktive endete vor 47 Tagen und heisst weiter *aktiv*.**
`[cmd]` **`lifecycle_type` ist `NULL`** — Flow 11–13 greift nicht.

### Was nicht zu tun ist

**Nichts bauen.** **Dieser Auftrag misst.**
**Keine Luecke ausfuellen** — benennen.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** `[read]` **Und geh die
Wege am Schirm, nicht im Kopf** — **ein gruener Endpunkt beweist
nicht, dass ein Knopf ihn erreicht** (deine eigene Lehre aus G-298).

### Nachweis

    je Reiter eine Tabelle    Knopf, Wirkung, Ende, Flow-Schritt
    Flow 3, 7, 8, 11-13       je Schritt: geht / halb / nicht
    erster Plan               wie kommt ein Nutzer dazu
    Planner gegen Plans       traegt die Oberflaeche den
                              Unterschied
    abgelaufener Plan         was kann der Nutzer tun
    Sackgassen                wo endet ein Weg ohne Ergebnis

`[read]` **Die letzte Zeile ist die wertvollste.** **Ein Knopf, der
etwas oeffnet, das nichts tut, ist schlimmer als kein Knopf.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
