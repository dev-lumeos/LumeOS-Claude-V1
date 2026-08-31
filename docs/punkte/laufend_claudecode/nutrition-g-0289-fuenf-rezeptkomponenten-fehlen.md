---
nr: G-289
typ: feature
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

# G-289 — Fünf Rezeptkomponenten fehlen

## Befund

`[cmd]` **`SPEC_10` nennt fuenf:** `RecipeList`, `RecipeCard`,
`RecipeBuilder` (*,,Rezept erstellen/bearbeiten mit Zutaten-Liste +
Live-Naehrstoffe"*), `RecipeDetail`, `RecipeLogModal`.

`[cmd]` **Gebaut ist keine.** `[cmd]` **Der Planner zeigt eine
Tabelle mit drei Rezepten, *New recipe* oeffnet die
*in Entwicklung*-Meldung.**

`[read]` **Tom, 2026-08-31:** *,,new recipe? kein plan was mir damit
sagen willst."*

## Was da ist

`[cmd]` **`nutrition.recipes` traegt 6 Zeilen, `recipe_ingredients`
die Zutaten.** `[cmd]` **Die Naehrwerte werden bei jedem Aufruf aus
den Zutaten gerechnet** — das steht so unter der Tabelle.

`[read]` **Die Daten sind da, die Oberflaeche fehlt vollstaendig.**

## Reihenfolge

`[read]` **`RecipeBuilder` ist der Kern** — ohne ihn ist *New recipe*
eine Attrappe. `[read]` **`RecipeLogModal` verbindet Rezept und
Tagebuch:** Portionen waehlen, Mahlzeitentyp, als Mahlzeit
eintragen — **und der Schreibweg dafuer steht seit G-272.**

## Auftrag — Flow 7 und Flow 8, vollstaendig

**Mitbeauftragt: G-288, G-300, G-297.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Warum dieser Auftrag neu geschrieben wurde

`[read]` **Der Orchestrator hat `SPEC_10` gelesen — die
Komponentenliste — und daraus Punkte gemacht.** `[read]`
**`SPEC_03_USER_FLOWS.md` mit den vierzehn Ablaeufen hat er nicht
gelesen.**

`[read]` **Ergebnis: Bauteile ohne Bauplan.** Tom, 2026-08-31:
*,,willkuerlich irgendwas geseeded und aufgelistet wo keiner
definieren, anlegen oder editieren kann."*

**Lies `SPEC_03` Flow 7 und Flow 8, bevor du anfaengst.**

### Flow 7 — Rezept erstellen und als Mahlzeit loggen

    1  Rezept-Bereich -> "Neues Rezept"
    2  Name, Portionen, optional Beschreibung, Zeiten, Anleitung
    3  Zutaten hinzufuegen via Food Search
         Food suchen -> Menge in g
         mehrere Zutaten sammeln
         Live-Preview: Gesamt + je Portion (Makros + kcal)
    4  Speichern
    5  "Als Mahlzeit loggen"
         Anzahl Portionen waehlen
         Meal Type waehlen
         Bestaetigen -> Meal + MealItems, eine Zeile je Zutat,
         Naehrstoffe eingefroren

`[read]` **Schritt 3 ist G-300** — **die Lebensmittelsuche gehoert ins
Rezept, nicht in den Plan.** `[cmd]` **`food_search` steht: zehn
Sortierwerte, Herkunftsfilter, Treffergrund.**

`[cmd]` **Schritt 5 nutzt den Schreibweg aus G-272** — **keinen
zweiten.** `[read]` **Und *eingefroren* heisst: die Naehrwerte werden
beim Eintragen kopiert, nicht verlinkt** — **wie in G-272 gebaut.**

`[cmd]` **Die Live-Vorschau ist der Kern:** `nutrition.recipes` traegt
6 Zeilen, **die Naehrwerte werden bei jedem Aufruf aus den Zutaten
gerechnet** — **ein Rezept speichert sie nicht.**

### Flow 8 — Einkaufsliste aus Rezept

    1  Rezept oeffnen -> "Einkaufsliste erstellen"
    2  Portionen waehlen (Standard: Rezept-Portionen)
    3  Generieren -> ShoppingList mit ShoppingListItems
         Food-Name + Menge skaliert
    4  Anzeigen: Titel, Portionen, Liste
    5  Items abhaken via Tap (is_checked)
    6  Teilen / Exportieren

`[read]` **Und damit ist die heutige Kachel widerlegt:** `[cmd]` **sie
sagt *,,Sie entsteht aus einer Planwoche"*** — **Flow 8 sagt: aus
einem Rezept.**

`[cmd]` **`ADR_RECIPES_SCHEMA_ONLY` sagt *Schema-only V1*.**
`[read]` **Miss, ob er noch gilt** — **wenn ja, gehoert der richtige
Satz an die Kachel, nicht der falsche.**

### G-297 — die Tagesdeckung

`[read]` **Der Orchestrator hat *kleiner* beauftragt.** **Falsch
gestellt.**

Tom: *,,die hoehe ist nun definiert fuer tagesdeckung, wieso verteilt
man dann nicht auf optimale groesse die grafik darin?"*

`[cmd]` **Die Kachel hat eine feste Hoehe — sie richtet sich nach der
Verlaufskachel daneben.** `[read]` **Das Gitter soll sie ausfuellen,
nicht schrumpfen.**

### Was nicht zu tun ist

**Nichts erfinden, was nicht in `SPEC_03` steht.**
**Wenn ein Schritt in der Spec fehlt: melden, nicht ausdenken.**
**Nichts auf `dev@lumeos.app` schreiben** — `test-user` mit Rueckbau.
Nicht committen, nicht stagen, nicht pushen.

### Die Vorlagen

    referenz/.../nutrition/components/RecipeBuilder.tsx  14 kB
    referenz/.../nutrition/components/RecipeList.tsx      8 kB
    referenz/.../nutrition/hooks/useRecipes.ts            4 kB

`[cmd]` **Fuer die Einkaufsliste gibt es keine Vorlage** — sie war nie
gebaut, in keiner Fassung.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Flow 7 Schritt 1-4    Rezept angelegt, mit Zutaten aus der
                          Suche, Live-Vorschau stimmt
    Flow 7 Schritt 5      als Mahlzeit geloggt, Naehrwerte
                          eingefroren, gezaehlter Rueckbau
    Flow 8                Liste aus Rezept, Mengen skaliert,
                          abhaken schreibt
    Tagesdeckung          fuellt die Kachelhoehe, Bildschirmfoto
    Attrappen             am Schirm, vorher / nachher
    fehlende Schritte     benannt, nicht ausgedacht

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
