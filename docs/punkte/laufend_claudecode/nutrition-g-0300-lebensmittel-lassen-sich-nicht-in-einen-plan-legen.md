---
nr: G-300
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-298
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-300 — Lebensmittel lassen sich nicht in einen Plan legen

## Befund

Aus G-298, Claude Code, 2026-08-31.

`[cmd]` **Neue Positionen lassen sich nur als Rezept anlegen.**
`[cmd]` **Bestehende BLS-Eintraege sind bearbeitbar** — gemessen:
100 g/dinner auf 275 g/lunch, `food_id` unveraendert.

`[read]` **Der Grund: die Lebensmittelsuche ist ein eigener Weg.**
`[cmd]` **`food_search` liefert ein JSON-Dokument mit 4.970
Lebensmitteln** — **eine Auswahlliste reicht nicht.**

## Was zu bauen ist

**Die Suche im Planformular.**

`[cmd]` **Der `CHECK` unterscheidet drei Typen:** `recipe` mit
`planned_servings`, `bls` und `custom` mit `amount_g`. `[cmd]` **Zwei
davon sind heute nicht anlegbar.**

`[cmd]` **Und die Suche steht:** zehn Sortierwerte, Herkunftsfilter
seit C-355, Treffergrund seit G-281. `[read]` **Es fehlt der
Aufrufer.**

`[read]` **`custom` hat 0 Zeilen** (C-355) — **also zuerst `bls`.**

## Auftrag — Lebensmittel in den Plan legen

**Mitbeauftragt: G-289, G-288.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### 1 · G-300 — die Suche im Planformular

`[cmd]` **Du hast es selbst gemeldet: neue Positionen gehen nur als
Rezept.** `[cmd]` **Bestehende BLS-Eintraege sind bearbeitbar** —
gemessen, 100 g/dinner auf 275 g/lunch.

`[cmd]` **Der `CHECK` kennt drei Typen, zwei sind nicht anlegbar.**

`[cmd]` **Und die Suche steht:** zehn Sortierwerte, Herkunftsfilter
seit C-355, Treffergrund seit G-281. `[read]` **Es fehlt der
Aufrufer.**

`[cmd]` **`custom` hat 0 Zeilen** — **also zuerst `bls`.**

### 2 · G-289 — die fuenf Rezeptkomponenten

`[cmd]` **`SPEC_10`, *Recipe Components (5)*: `RecipeList`,
`RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`.
Gebaut ist keine.**

`[cmd]` **`nutrition.recipes` traegt 6 Zeilen, die Naehrwerte werden
aus den Zutaten gerechnet.**

`[read]` **`RecipeBuilder` ist der Kern** — ohne ihn ist *New recipe*
eine Attrappe, und Tom hat sie so gesehen. `[read]` **`RecipeLogModal`
nutzt den Schreibweg aus G-272, keinen zweiten.**

**Vorlagen im Altbestand, Struktur ja Code nie:**

    referenz/.../nutrition/components/RecipeBuilder.tsx  14 kB
    referenz/.../nutrition/components/RecipeList.tsx      8 kB
    referenz/.../nutrition/hooks/useRecipes.ts            4 kB
    referenz/.../api/nutrition/routes/recipes.ts         16 kB

### 3 · G-288 — die Einkaufsliste

`[cmd]` **`SPEC_10` nennt drei Komponenten, gebaut ist eine leere
Kachel.** `[cmd]` **Eine Liste mit sechs Positionen existiert, sie
gehoert `test-user`.**

`[cmd]` **Und `ADR_RECIPES_SCHEMA_ONLY` sagt *Schema-only V1*.**
`[cmd]` **Es gibt keine Vorlage — weder im alten Repo noch im
Fundus.** `[read]` **Sie war nie gebaut, in keiner Fassung.**

`[read]` **Miss, ob der ADR noch gilt:** **wenn ja, gehoert der Satz
an die Kachel; wenn nein, sind es drei Komponenten.**

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` schreiben** — `test-user` mit
Rueckbau.
**Keine zweite Suche** — `food_search` ist gebaut.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Lebensmittel anlegen   im Browser, mit gezaehltem Rueckbau
    CHECK                  bls schreibt amount_g, kein
                           planned_servings
    Rezept anlegen         RecipeBuilder, mit Zutaten
    Rezept eintragen       RecipeLogModal in den Tag
    Einkaufsliste          gebaut oder ADR bestaetigt
    Attrappen              am Schirm, vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
