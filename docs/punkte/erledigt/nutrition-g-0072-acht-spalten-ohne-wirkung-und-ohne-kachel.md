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
erledigt: 2026-09-02
commit: 6cc890c1
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-vorlieben.tsx
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

**Claude Code, 2026-09-02.** Mitbeauftragt G-99 und G-322; alles in
diesem Bericht. **Nicht committet, nichts auf `dev@lumeos.app`
geschrieben** (`updated_at` steht unveraendert auf dem 30.08.).

### Die Auftragsfrage: gibt es schon einen zweiten Ort?

**Ja — `/v2/settings`, 542 Zeilen, mit Kartenaufbau.**

`[cmd]` **Aber er schreibt nach `/api/profile`** (`user_profiles`),
**und die Mahlzeitenstruktur liegt in
`nutrition.food_preferences`.**

`[read]` **Ein zweites Eingabefeld dort waere ein zweiter
Schreibweg** — zwei Formulare, die dieselbe Spalte setzen, laufen bei
jedem Speichern gegeneinander. **Deshalb steht dort eine
Verweiskachel**, kein Feld: der Ort ist erreichbar, **die Einstellung
bleibt an einer Stelle.**

`[cmd]` **Am Schirm gemessen: Link-Ziel `/v2/nutrition?tab=prefs`.**

### 1 · Drei sind ausgesetzt, mit Begruendung

    cooking_skill       `recipes.cooking_skill` steht -- aber nichts
                        filtert danach
    prep_time_max_min   `recipes.prep_time_min` steht -- dasselbe
    budget_level        kein Preisfeld in `recipes`, keine Preisquelle

`[read]` **Ein Regler, der nichts bewirkt, ist schlimmer als
keiner** — er behauptet eine Wirkung.

`[cmd]` **A-59: als Kommentarblock, nicht geloescht.** Der Waechter
prueft beides — **kein Feld im Code, aber der Name UND der Grund im
Kommentar.**

### 2 · Drei wirken, an zwei Orten

`[cmd]` **`food_preferences` traegt acht Spalten, gemessen am
2026-09-02: zwei Zeilen, alle acht gefuellt** — **und keine davon war
im Preferences-Tab erreichbar.**

`[cmd]` **Sie wirkten nur im Planner** (`rasterZeilen`,
`plan-model.ts:73`) **— aber nur mit den Vorgabewerten**, weil
niemand sie aendern konnte.

**Neu: die Kachel *Mahlzeitenstruktur*** in Preferences —
Hauptmahlzeiten, Snacks, Vorkochen. `[cmd]` **Am Schirm: 4 / 1 /
true**, die echten Werte.

**Der Wirkungssatz kommt aus `rasterZeilen`**, nicht aus einem
zweiten Wortlaut: *,,4 Reihen aus deinen Vorlieben — 4
Hauptmahlzeiten und 1 Snack."* `[read]` **Sonst sagten Preferences
und Planner Verschiedenes ueber dieselbe Zahl.**

**Und das Tagebuch hoert jetzt darauf.** `[cmd]` **Dort stand eine
feste Liste aus fuenf Slots** — **wer zwei Mahlzeiten isst, sah
trotzdem fuenf leere Karten.**

    vorher   Breakfast, Snack, Lunch, Dinner, Post-workout   (5)
    nachher  Breakfast, Lunch, Dinner, Snack                 (4)

`[read]` **Die Vorlage bleibt als Rueckfall** — sind die Vorlieben
nicht lesbar, ist eine zu lange Liste besser als eine leere.
`[cmd]` **`post_workout` steht nur dort:** `rasterZeilen` kennt ihn
nicht, **und ihn zu ergaenzen hiesse, zwei Wahrheiten ueber die
Reihen zu fuehren.**

### 3 · Zwei bleiben liegen

`[cmd]` **`planner_notes` hat ein Feld** — mit dem Hinweis *,,Wird
gespeichert, aber noch nicht ausgewertet; Buddy liest es, sobald er
plant."*

`[cmd]` **`preferred_cuisines` steht in der Datenbank**
(`{mediterranean}` auf dev), **hier aber bewusst nicht** — E-47.
`[read]` **Sie wartet auf denselben Punkt wie `thai_food` aus
G-134.**

### 4 · G-322 — die Bauteile sind exportiert

`[cmd]` **Bis heute exportierte `tab-foods.tsx` GENAU EIN Bauteil.**
`[cmd]` **Die Folge, gemessen: G-320 musste die Trefferliste im
Suchmodal neu bauen** — Spalten, Sortierleiste, Zahlenformat.

**Zehn sind jetzt exportiert:** `PILLEN`, `SEITE_GROESSE`,
`FILTERGRUPPEN`, `UNVERTRAEGLICH_LABEL`, `filterLabel`,
`FilterChip`, `facettenZahl`, `SortKopf`, `zahl`, `makro`.
**Elf Exporte insgesamt**, mit dem Reiter selbst.

`[read]` **Ein Export ist kein Umbau** — die Datei bleibt, wie sie
ist; die Teile sind nur nicht mehr eingesperrt.

**Und eine Berichtigung:** `[cmd]` **`DaumenKnoepfe` war nie in
`tab-foods.tsx`** — sie steht seit jeher in `daumen.tsx` und wird
importiert. **Mein G-320-Kommentar zaehlte sie faelschlich mit;** er
ist berichtigt, und ein Waechter haelt es fest.

`[read]` **G-323 bleibt offen** — die vier bestehenden Suchen auf den
Hook umstellen. **Ein eigener Auftrag, nicht dieser.**

### Nachweis

    drei Spalten     auskommentiert, Grund im Code genannt
    drei Spalten     4 / 1 / true in Preferences, Verweis in Settings
    Tagebuch         5 Slots -> 4, aus den Vorlieben
    planner_notes    Feld da, Text geladen, Hinweis dabei
    tab-foods        10 Bauteile exportiert, 11 Exporte gezaehlt
    Bilder           backup/g72-prefs.png, g72-settings.png,
                     g72-diary.png

### Gate und Sabotageprobe

    pnpm gate        15 von 15 Tasks, 1.312 Tests, 0 Fehler
    Sabotageprobe    22 von 22 gefangen
    neuer Waechter   mahlzeitenstruktur.test.ts, 11 Proben

## Abnahme

**2026-09-02, Orchestrator.** `[cmd]` Gate 15/15, 1.312 Tests.

### Die Auftragsfrage: ja, aber nicht als Feld

`[cmd]` **`/v2/settings` existiert, 542 Zeilen** — **aber es
schreibt nach `/api/profile` (`user_profiles`), waehrend die
Mahlzeitenstruktur in `nutrition.food_preferences` liegt.**

`[read]` **Sein Schluss:** *,,Ein zweites Eingabefeld dort waere ein
zweiter Schreibweg — zwei Formulare, die dieselbe Spalte setzen,
laufen bei jedem Speichern gegeneinander."*

`[cmd]` **Deshalb eine Verweiskachel mit Ziel
`/v2/nutrition?tab=prefs`** — **der Ort ist erreichbar, die
Einstellung bleibt an einer Stelle.**

`[read]` **Ich hatte *,,einstellbar an zwei Orten"* beauftragt.**
**Er hat den Unterschied zwischen erreichbar und einstellbar
gemacht.**

### Und ein Fund, den niemand gesucht hat

`[cmd]` **Die acht Spalten waren gefuellt** — zwei Zeilen, alle acht
— **und keine war im Preferences-Tab erreichbar.**

`[cmd]` **Sie wirkten nur im Planner, aber nur mit den
Vorgabewerten** — **weil niemand sie aendern konnte.**

`[cmd]` **Und das Tagebuch zeigte eine feste Liste aus fuenf
Slots:**

    vorher   Breakfast, Snack, Lunch, Dinner, Post-workout   (5)
    nachher  Breakfast, Lunch, Dinner, Snack                 (4)

`[read]` **Wer zwei Mahlzeiten isst, sah trotzdem fuenf leere
Karten.**

`[cmd]` **Der Wirkungssatz kommt aus `rasterZeilen`, nicht aus einem
zweiten Wortlaut** — **sonst sagten Preferences und Planner
Verschiedenes ueber dieselbe Zahl.**

`[cmd]` **Und `post_workout` bleibt nur im Rueckfall:**
`rasterZeilen` kennt ihn nicht, **ihn zu ergaenzen hiesse zwei
Wahrheiten ueber die Reihen.**

### Die drei ausgesetzten, mit Grund im Code

    cooking_skill       recipes.cooking_skill steht -- nichts
                        filtert danach
    prep_time_max_min   recipes.prep_time_min steht -- dasselbe
    budget_level        kein Preisfeld, keine Preisquelle

`[read]` *,,Ein Regler, der nichts bewirkt, ist schlimmer als
keiner — er behauptet eine Wirkung."*

`[cmd]` **Der Waechter prueft beides: kein Feld im Code, aber Name
UND Grund im Kommentar.**

### G-322 — exportiert, nicht umgebaut

`[cmd]` **Zehn Bauteile exportiert, elf Exporte insgesamt.**

`[read]` *,,Ein Export ist kein Umbau — die Teile sind nur nicht
mehr eingesperrt."* `[read]` **Richtig, und damit ist der Umbau von
1.060 Zeilen vermieden.**

`[cmd]` **Und eine Berichtigung: `DaumenKnoepfe` war nie in
`tab-foods.tsx`** — sie steht in `daumen.tsx`. `[cmd]` **Sein
G-320-Kommentar zaehlte sie faelschlich mit, ist berichtigt, ein
Waechter haelt es fest.**

`[read]` **A-62 an sich selbst gefunden.**

**Abgenommen.**

