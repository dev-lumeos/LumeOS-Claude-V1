---
nr: G-547
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-29

braucht: [G-545]
kind_von: null

quellen:
  - docs/ssot/130-goals-bauordnung.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.user_goals
    - goals.goal_strategies
  dateien:
    - docs/ssot/130-goals-bauordnung.md

zahlen:
  gemessen: 2026-09-29
  ebenen_heute: 3
  spalten_fuer_nutzergrenzen: 0
---

# Die persoenliche Untergrenze hat keinen Ort

`[read]` **Aus dem Architektur-Dokument vom 2026-09-29** (Ansatzquelle,
keine SSOT — sie kennt LumeOS nicht). Der Abschnitt `constraints` am Ziel:

```
constraints: {
  min_calories,             // nie darunter
  max_cardio_hours_per_week,
  min_protein_g_per_kg,
  max_deficit_percent,
  min_bf_percent            // Gesundheitsgrenze
}
```

`[cmd]` **Unsere drei Ebenen haben dafuer keine Spalte.** Der Katalog
liefert Baender, der Override aendert Werte, die Instanz traegt das
Zeitfenster. **Nichts sagt „diese Grenze nie", und zwar unabhaengig davon,
welche Strategie laeuft.**

## Warum das nicht derselbe Platz wie der Override ist

`[read]` Der Override (`goal_phases.parameters`) gilt **fuer eine Phase**
und aendert einen Wert. Eine Grenze gilt **fuer den Nutzer** und begrenzt
alle Werte, auch die einer Strategie, die er naechstes Jahr waehlt.

Der Unterschied zeigt sich am Fall: wer sagt *„nie unter 2.000 kcal"*,
meint das auch, wenn `aggressive_cut` mit −25 % auf 1.850 rechnet. Ein
Override muesste jede Phase neu gesetzt werden und waere beim naechsten
Mal vergessen. **Eine Grenze wird einmal gesetzt und gilt.**

`[read]` **Und sie gehoert an das Ziel, nicht ans Profil** — dasselbe
Dokument legt sie an `body_composition_goal`, und das ist richtig: die
Grenze fuer ein Wettkampfziel ist eine andere als fuer „gesuender leben".

## Was das mit dem Waechter aus G-520 zu tun hat

`[cmd]` G-520 hat sechs Anpassungsregeln gebaut, und sie kennen **eine**
Sorte Grenze: die aus der Strategie. Eine Regel, die sagt *„Kalorien
reduzieren"*, hat heute keinen Boden — sie wuerde bis zum CHECK der
Tabelle laufen. `min_calories` am Ziel waere der Boden, und die Regel
muesste melden, dass sie ihn erreicht hat, statt stumm dagegen zu
rechnen.

## Nicht jetzt

`[read]` **Reihenfolge:** nach G-545. Ein Constraint auf Werte, die der
Katalog noch nicht vollstaendig traegt, prueft gegen Luecken. Und der
Nutzen zeigt sich erst, wenn die Anpassungsregeln (G-520) tatsaechlich
Kalorien aendern — heute sind sie reine Vorschlagsfunktionen.

## Was aus derselben Quelle noch kommt, und noch weiter weg ist

`[read]` **Der Abhaengigkeitsgraph ist dort bidirektional.** Nicht nur
*„Module liefern Beitraege an Goals"* (das ist G-514), sondern
*„Module beschraenken sich gegenseitig"*: `min_carbs_for_hiit` — wer zu
wenig Kohlenhydrate hat, darf kein HIIT; `cardio_interference_window` —
Stunden Abstand zwischen Cardio und Training; `liver_enzymes_elevated ->
keine orals`.

**Das ist eine eigene Schicht ueber allen Modulen** und gehoert nicht in
Goals, sondern zwischen die Module. Hier nur notiert, damit der Gedanke
nicht verloren geht — **kein Auftrag, keine Nummer, und er wartet, bis
die sechs Ebenen der Bauordnung stehen.**
