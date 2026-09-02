---
nr: G-72
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-65
kinder: []
entscheidung: E-47
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-72 - Acht Spalten ohne Wirkung und ohne Kachel

## Befund

(neu
  2026-08-19). **Entscheidung fuer Tom.** Rest aus G-65.

  `[cmd]` **`cooking_skill`, `prep_time_max_min`, `budget_level`,
  `meals_per_day`, `snacks_per_day`, `meal_prep_ok`,
  `preferred_cuisines`, `planner_notes`** — gespeichert, ohne Wirkung,
  **und das Mockup hat fuer keine eine Stelle.**

  `[read]` **Der Agent hat richtig gemeldet statt gebaut:** *„Der
  Auftrag sagte „Zeigen ja" — aber das Mockup hat fuer keine eine
  Stelle, und eine zu erfinden waere eine doppelte Erfindung."*

  `[cmd]` **Sie stammen aus Schritt 3 des Vorgaenger-Assistenten** —
  Kochen & Alltag. **Und sie wirken erst mit Rezepten und
  Essensplaenen**, die es nicht gibt.

  **Zu entscheiden:** Kachel dazu, oder liegenlassen bis Meal plans?

## Neu bewertet, 2026-08-31

`[read]` **Der Punkt fragte: Kachel dazu, oder liegenlassen bis Meal
plans?**

`[cmd]` **Meal plans, Planner und Rezepte sind seit dem 31.08.
gebaut** (E-39, E-40, G-289, C-372).

`[read]` **Damit ist die Bedingung eingetreten** — **die acht Spalten
koennen jetzt wirken oder es zeigt sich, dass sie es nicht koennen.**

`[cmd]` **G-99 hat drei davon als wirkungslos gemessen:**
`budget_level`, `meal_prep_ok`, `planner_notes` — **weil `recipes`
kein Preis- und kein Vorkochfeld fuehrt.**

`[read]` **Das ist heute noch so** — nachgemessen: `recipes` traegt
`cooking_skill` und `prep_time_min`, sonst nichts davon.

`[read]` **Also bleibt die Frage, aber schaerfer:** **drei Spalten
brauchen Gegenstuecke an `recipes`, oder sie gehoeren weg.**

## Entschieden: E-47, 2026-09-02

Tom hat die acht Spalten einzeln zugeordnet:

    cooking_skill        vorsehen, auskommentiert -- spaeteres
    prep_time_max_min    Ausbaumodul mit Rezepten und Kochen
    budget_level

    meals_per_day        in Nutrition Diary: wie viele Mahlzeiten
    snacks_per_day       dargestellt werden. Gehoeren in Preferences
    meal_prep_ok         UND in die Nutzereinstellungen

    preferred_cuisines   weggelassen, allfaellig spaetere Ausbaustufe

    planner_notes        Freitext, den der Nutzer frei schreibt --
                         wird Buddy-Material

`[read]` **Damit ist der Punkt kein Entscheid mehr, sondern drei
Bauauftraege verschiedener Reife.**

## Auftrag — die acht Spalten, je nach Reife

**Mitbeauftragt: G-99, G-322.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Die vier Quellen

`[cmd]` **Spec: E-47** ordnet die acht einzeln zu.
`[cmd]` **Daten: `nutrition.food_preferences`, 2 Zeilen**, alle acht
Spalten vorhanden.
`[cmd]` **Code: der Planner nennt sie bereits** — *,,4 Reihen aus
deinen Vorlieben — 4 Hauptmahlzeiten und 1 Snack."*
`[read]` **Altrepo: Struktur ja, Code nie.**

### 1 · Drei auskommentieren, mit Begruendung

    cooking_skill        spaeteres Ausbaumodul mit Rezepten
    prep_time_max_min    und Kochen
    budget_level

`[cmd]` **G-99 hat gemessen, warum sie heute nichts tun koennen:**
`recipes` traegt `cooking_skill` und `prep_time_min`, **kein Preis-
und kein Vorkochfeld.**

`[read]` **Auskommentieren heisst: Kommentarblock, der sagt warum** —
**nicht loeschen, nicht still lassen** (A-59).

### 2 · Drei bekommen eine Wirkung

    meals_per_day    wie viele Mahlzeiten das Tagebuch zeigt
    snacks_per_day
    meal_prep_ok

`[cmd]` **Sie wirken bereits im Planner** — **und sollen es im
Tagebuch auch tun.**

`[read]` **Einstellbar an zwei Orten:** Preferences **und**
Nutzereinstellungen. `[cmd]` **Miss, ob es dort schon einen Ort
gibt.**

### 3 · Zwei bleiben liegen

`[cmd]` **`preferred_cuisines`** — in Preferences bewusst
weggelassen. `[cmd]` **`planner_notes`** — Freitext, wird
Buddy-Material.

`[read]` **`planner_notes` bekommt ein Eingabefeld in Preferences**,
mit dem Hinweis, wofuer es da ist. `[cmd]` **Nicht ausgewertet, nur
gespeichert.**

### 4 · G-322 — die Bauteile herausloesen

`[cmd]` **`tab-foods.tsx` exportiert genau ein Bauteil, die neun
inneren sind privat.** `[cmd]` **14 von 15 `useState` sind reine
Suchlogik, einer ist reiterspezifisch.**

`[read]` **Solange sie privat sind, baut jeder Aufrufer sie nach** —
**G-320 musste die Darstellung neu bauen.**

`[read]` **Und danach steht G-323 offen:** die vier bestehenden
Suchen auf den Hook umstellen. **Das ist ein eigener Auftrag.**

### Was nicht zu tun ist

**Kein Kochmodul.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    drei Spalten     auskommentiert, mit Begruendung im Code
    drei Spalten     wirken im Tagebuch, einstellbar an zwei Orten
    planner_notes    Eingabefeld in Preferences
    tab-foods        neun Bauteile exportiert, Aufrufer gezaehlt
    Bildschirmfoto   vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
