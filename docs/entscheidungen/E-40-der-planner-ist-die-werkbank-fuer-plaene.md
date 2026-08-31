---
nr: E-40
getroffen: 2026-08-31
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-370, C-372, G-299, G-305]
modul: nutrition
---

# E-40 — der Planner ist die Werkbank fuer Plaene

## Entscheidung

Tom, 2026-08-31, auf die Frage *,,fuer was baut man einen planner?"*:

    1  dass ein Nutzer seinen eigenen Mealplan selber erstellen und
       abspeichern kann wie er will und dementsprechend wiederverwenden
    2  ein Coach hat eigene auch erstellte Plaene die er seinen Kunden
       geben kann, sprich er kann sharen
    3  wenn Marketplace da ist kann man Plaene kaufen

## Was daraus folgt

**Der Planner ist der Ort, an dem ein Plan entsteht** — nicht der,
an dem ein aktiver Plan angezeigt wird.

    Meal plans   die Bibliothek: welche Plaene habe ich,
                 welcher ist aktiv, welcher pausiert
    Planner      die Werkbank: hier baue und aendere ich einen Plan

`[read]` **Claude Code hat die Trennung in G-299 gemessen** —
*,,Meal plans ist, was der Plan ist; der Planner, wann was gegessen
wird."* `[read]` **Toms Fassung ist schaerfer:** Bibliothek gegen
Werkbank.

## Drei Folgerungen

### Ein Plan ist wiederverwendbar

`[read]` **Er existiert unabhaengig von einem Startdatum.**
`[cmd]` **Heute traegt `meal_plans` `start_date` und `days_count` —
beim Bestandsplan beide `NULL`** (G-298).

`[read]` **Also: ein Plan ohne Startdatum ist keine Luecke, sondern
der Normalfall** — **das Datum entsteht beim Aktivieren, nicht beim
Bauen** (Flow 3, Schritt 5).

### Ein Plan ist teilbar

`[cmd]` **`plan_origin` traegt `self_created`, `coach_created`,
`marketplace`.** `[cmd]` **Und `SPEC_03` Flow 3 nennt die Beschriftung
je Quelle.**

`[read]` **Teilen heisst: eine Kopie beim Empfaenger, mit
`coach_created` als Herkunft.** `[read]` **Nicht: derselbe Datensatz
fuer zwei Nutzer** — sonst aenderte der Coach den Plan seines Kunden
mit.

`[cmd]` **E-29 gilt fuer den Weg:** ueber eine Funktion, nicht ueber
einen direkten Zugriff. `[cmd]` **Und die Sperre aus G-269 steht
schon.**

### Wochen brauchen einen Schreibweg

`[cmd]` **`meal_plan_weeks` wird heute nirgends eingefuegt** (C-372).

`[read]` **Damit ist C-372 kein Nebenbefund, sondern der Kern:**
**ohne Schreibweg fuer Wochen gibt es keine Werkbank.**

## Was das fuer *New plan* heisst

`[cmd]` **Das Formular fragt Name, Ziele, Lebenszyklus, Startdatum,
Tageszahl.**

`[read]` **Lebenszyklus und Startdatum gehoeren nicht dorthin** —
sie entstehen beim Aktivieren (Flow 3, Schritte 5 und 6).

`[read]` **Was beim Anlegen zaehlt: Name, Beschreibung, Tagesziele,
und wie viele Wochen.** **Dann steht ein leerer Plan in der Werkbank,
und der Nutzer fuellt ihn.**

## Was zurueckgestellt bleibt

`[cmd]` **Coach-Sharing und Marketplace-Kauf werden vorgesehen, nicht
gebaut** (E-37, E-39).

`[read]` **Vorsehen heisst hier: die Herkunft wird angezeigt, und der
Bau eines Plans setzt `self_created`** — **damit ein spaeterer
Coach-Plan sich davon unterscheidet, ohne dass etwas umgebaut werden
muss.**
