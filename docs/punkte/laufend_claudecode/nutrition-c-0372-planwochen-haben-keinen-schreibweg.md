---
nr: C-372
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-304
entscheidung: E-40
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  tabellen: [nutrition.meal_plan_weeks, nutrition.meal_plan_days]
zahlen:
  gemessen: 2026-08-31
---

# C-372 — Planwochen haben keinen Schreibweg

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **`meal_plan_weeks` wird nirgends im Code eingefuegt.**
`[cmd]` **`meal_plan_days` kommt nur in einem `select` vor.**

`[cmd]` **Auf `test-user` belegt: der ueber *New plan* angelegte Plan
hat 0 Wochen, 0 Tage, 0 Eintraege.**

`[read]` **Ein Plan ohne Wochen ist ein Datensatz, kein Plan.**

## Und dann luegt die Anzeige

`[cmd]` **Der Planner zeigt fuer genau diesen Plan *,,Es liegt kein
Plan vor"*.** `[cmd]` **Der Zweig ist `!d.plan || d.wochen.length ===
0`.**

`[read]` **Ein Plan ohne Wochen wird als *kein Plan* gemeldet** —
**und der einzige angebotene Knopf ist die *in Entwicklung*-Attrappe.**

`[read]` **Damit ist der Weg zu Ende: anlegen, dann nichts.**

## Warum das der Kern ist

Tom, 2026-08-31: *,,die diskrepanz ich kann da einen plan anlegen
zumindest namentlich und konfigs."*

`[read]` **Genau das ist es: das Formular fragt Name, Ziele,
Lebenszyklus, Startdatum und Tageszahl** — **nie Wochen, Tage oder
Eintraege.**

`[cmd]` **`SPEC_03` Flow 3 beschreibt kein Anlegen** (C-370) — **er
beginnt bei der Uebersicht.** `[read]` **Das Formular war eine
Erfindung des Orchestrators, und es erzeugt einen leeren Datensatz.**

## Auftrag — die Werkbank bauen

**Entschieden in `docs/entscheidungen/E-40`.** **Mitbeauftragt:
C-370.**

**Beauftragt am 2026-08-31.**

### Wozu der Planner da ist

Tom, 2026-08-31:

    1  dass ein Nutzer seinen eigenen Mealplan selber erstellen und
       abspeichern kann wie er will und dementsprechend
       wiederverwenden
    2  ein Coach hat eigene auch erstellte Plaene die er seinen
       Kunden geben kann, sprich er kann sharen
    3  wenn Marketplace da ist kann man Plaene kaufen

`[read]` **Der Planner ist der Ort, an dem ein Plan entsteht** —
nicht der, an dem ein aktiver angezeigt wird.

    Meal plans   die Bibliothek
    Planner      die Werkbank

`[read]` **Du hast die Trennung in G-299 gemessen. Toms Fassung ist
schaerfer.**

### Was zu bauen ist

**Ein Schreibweg fuer `meal_plan_weeks` und `meal_plan_days`.**

`[cmd]` **Du hast in G-304 belegt: `meal_plan_weeks` wird nirgends
eingefuegt, `meal_plan_days` kommt nur in einem `select` vor.**
`[read]` **Ohne diesen Weg gibt es keine Werkbank.**

`[cmd]` **Die Positionen kannst du schon** — G-298 hat hinzufuegen,
aendern und entfernen gebaut, mit gezaehltem Rueckbau. `[read]` **Es
fehlt die Ebene darueber.**

### Was *New plan* fragen soll

`[read]` **Name, Beschreibung, Tagesziele — und wie viele Wochen.**

`[read]` **Lebenszyklus und Startdatum gehoeren nicht dorthin:**
`[cmd]` **sie entstehen beim Aktivieren** (Flow 3, Schritte 5 und 6).

`[read]` **Danach steht ein leerer Plan in der Werkbank, und der
Nutzer fuellt ihn Tag fuer Tag.**

### Und ein Plan ist wiederverwendbar

`[cmd]` **`start_date` und `days_count` sind beim Bestandsplan
`NULL`** — **das ist kein Fehler, sondern der Normalfall.**

`[read]` **Ein Plan ohne Startdatum ist ein Plan in der Bibliothek.**
**Das Datum entsteht beim Aktivieren.**

`[read]` **Damit klaert sich auch *Copy week*:** `[read]` **eine Woche
in einen anderen Plan oder innerhalb desselben kopieren** — **das ist
das Wiederverwenden aus Toms Punkt 1.**

### Coach und Marketplace: vorsehen

`[cmd]` **`plan_origin` wird beim Bauen auf `self_created` gesetzt.**

`[read]` **Teilen heisst spaeter: eine Kopie beim Empfaenger mit
`coach_created`** — **nicht derselbe Datensatz fuer zwei Nutzer.**
**Nichts davon wird jetzt gebaut.**

### Was nicht zu tun ist

**Keinen Lebenszyklus ausfuehren** — das ist C-373.
**Kein Teilen bauen.**
**Nichts auf `dev@lumeos.app`** — eine Probe, die schreiben kann,
gehoert nicht auf ein unantastbares Konto.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Plan anlegen        mit n Wochen, im Browser
    Wochen entstehen    meal_plan_weeks zaehlt, gezaehlter Rueckbau
    Tage entstehen      meal_plan_days zaehlt
    fuellen             eine Position je Tag, sichtbar
    wiederverwenden     der Plan steht ohne Startdatum in der
                        Bibliothek
    Copy week           kopiert eine Woche, belegt
    plan_origin         self_created, belegt
    dev                 unveraendert, vorher/nachher gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
