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

## Auftrag — die Rezeptoberflaeche

**Mitbeauftragt: G-288.** **Mitbeauftragt mit G-300 am 2026-08-31.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag kann man ein Rezept anlegen, ansehen,
bearbeiten und als Mahlzeit eintragen.**

`[cmd]` **`SPEC_10`, Abschnitt *Recipe Components (5)*:** `RecipeList`,
`RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`.
**Gebaut ist keine.**

`[cmd]` **`nutrition.recipes` traegt 6 Zeilen, die Naehrwerte werden
aus den Zutaten gerechnet.**

`[read]` **`RecipeBuilder` ist der Kern** — ohne ihn ist *New recipe*
eine Attrappe. `[read]` **`RecipeLogModal` nutzt den Schreibweg aus
G-272** — kein zweiter.

### Die Vorlagen im Altbestand

`[cmd]` **CLAUDE.md: Struktur ja, Code nie.**

    referenz/.../nutrition/components/RecipeBuilder.tsx  14 kB
    referenz/.../nutrition/components/RecipeList.tsx      8 kB
    referenz/.../nutrition/hooks/useRecipes.ts            4 kB
    referenz/.../stores/nutrition/recipeStore.ts          7 kB
    referenz/.../api/nutrition/routes/recipes.ts         16 kB
    mockup-zwischenwurf/features/nutrition/...            6 kB

`[read]` **Vier der fuenf Spec-Komponenten haben eine Vorlage.**
`[cmd]` **`RecipeBuilder.tsx` mit 14 kB ist die groesste** — und der
Kern dieses Auftrags.

`[read]` **`recipes.ts` ist die alte Schnittstelle** — **lies sie auf
die Struktur, nicht auf den Weg: unsere Naehrwerte werden aus den
Zutaten gerechnet, nicht gespeichert.**

`[read]` **Wenn eine Vorlage etwas zeigt, das `SPEC_10` nicht nennt:
melden, nicht weglassen.**

### 2 · G-288 — die Einkaufsliste

`[cmd]` **`SPEC_10` nennt drei Komponenten, gebaut ist eine leere
Kachel.** `[cmd]` **Eine Liste mit sechs Positionen existiert, sie
gehoert `test-user`.**

`[cmd]` **Und `ADR_RECIPES_SCHEMA_ONLY` sagt: *,,Schema-only V1 —
Full UI Phase 2 wenn Zeit knapp"*.** `[cmd]` **Und fuer die Einkaufsliste gibt es keine Vorlage** — weder
im alten Repo noch im Fundus. `[read]` **Das passt zum ADR: sie war
nie gebaut, in keiner Fassung.**

`[read]` **Miss, ob der ADR noch
gilt** — **wenn ja, gehoert der Satz an die Kachel; wenn nein, sind
es drei Komponenten.**

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**
