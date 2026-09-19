---
nr: G-483
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-519]
kind_von: E-83
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-483 - Planner und Rezepte kennen keine Supplemente

## Toms Beanstandung

Tom, 2026-09-08:

> meal plans sollte das ebenfalls moeglich sein, supplements
> mit einzubinden

> planner muss es ebenfalls funktionieren, falls der plan
> editierbar ist

> rezept ebenfalls

## Gemessen

    plan-eintrag-editor.tsx    kennt supplement NEIN
    plan-werkbank-ui.tsx       kennt supplement NEIN
    rezepte-echt.tsx           kennt supplement NEIN

    meal_plan_entries          KEINE Supplementspalte
    recipe_ingredients         CHECK: nur bls | custom

`[cmd]` **Der Planner IST editierbar** ? **E-83 hat zehn
Schreibarten gemessen, inkl. `eintrag_aendern`,
`eintrag_loeschen`, `woche_kopieren`.**

## Was C-519 liefert

`[cmd]` **`recipe_ingredients` bekommt die Supplementquelle,
`intake_logs.meal_id` die Verbindung.**

`[read]` **Warte darauf** ? **C-519 ist gebaut, aber noch
nicht live.**

`[cmd]` **`meal_plan_entries` braucht sie noch** ? **MISS, ob
C-519 sie mitbringt, und MELDE es, wenn nicht.**

## Und die Regel gilt

`[read]` **Nur untermischbare Formen** ? **Powder, Liquid,
Bar, Gummy (E-83).**

`[cmd]` **G-480 hat den Filter gebaut** ? **er wird hier
wiederverwendet, nicht nachgebaut.**

## Abnahmebedingungen

    A1  ein Supplement in einen Planeintrag. Foto.
    A2  ein Supplement in ein Rezept. Foto.
    A3  Toms Shake-Rezept: Milch, Blaubeeren, Whey.
        Foto mit den Werten.
    A4  der Planner zeigt es beim Bearbeiten. Foto.
    A5  nur untermischbare Formen. Zahl.
    A6  vier Module unveraendert.

## Bericht

**Rezepte: gebaut. Planeintraege: GEMELDET, nicht gebaut** — die
Spalte fehlt.

    A1  ein Supplement in ein Rezept              erfuellt
    A2  Toms Shake: 505,45 kcal / 40,88 g         erfuellt
    A3  meal_plan_entries hat KEINE Spalte        gemeldet
    A4  der Planner zeigt es NICHT -- begruendet  gemeldet
    A5  127 Treffer, 0 verbotene Formen           erfuellt
    A6  vier Module unveraendert                  erfuellt
    A7  apps/web 1887/1887, apps/coach 65/65      erfuellt

`[cmd]` **`supabase/` unberuehrt.**

### A3 — die Messung zuerst, wie beauftragt

`[cmd]` **`nutrition.meal_plan_entries`, gemessen am 2026-09-19:**

    Spalten mit „supplement" oder „intake"   KEINE

`[cmd]` **Zum Vergleich `recipe_ingredients`:**

    food_source CHECK   bls | custom | supplement      (C-519)
    amount_g CHECK      bei supplement MUSS NULL sein
    portion_* CHECK     bei supplement alle NULL

`[read]` **C-519 hat den Rezeptweg mitgebracht, den Planweg nicht.**

`[cmd]` **Und mehr als die Spalte:**
`supplements.add_supplier_product_to_recipe(p_recipe_id,
p_supplier_product_id, p_serving_quantity, p_serving_size)` **plus die
Tabelle `supplements.recipe_product_references`** — **und
`nutrition.recipe_nutrition` hat bereits einen Zweig
`supplement_scaled`.**

`[read]` **Die Datenbank konnte es also schon vollstaendig** — es
fehlte nur die Oberflaeche.

### A1 und A2 — Toms Shake

`[cmd]` **Vor dem Bauen in einer Transaktion belegt** (mit ROLLBACK):

    Banane-Joghurt-Haferflocken   vorher   493,20 kcal, 3 Zutaten
    + Whey 1 x 31 Gram(s)         nachher  613,20 kcal, 4 Zutaten

`[read]` **+120 kcal — `recipe_nutrition` rechnet Supplemente mit.**

`[cmd]` **Dann Toms Rezept, ueber die Wege der Anwendung angelegt:**

    H-Vollmilch 3,5 % Fett      515 g      325 kcal  16,4 P
    Heidelbeere roh             100 g       61 kcal   0,5 P
    Gold Standard Whey        1 x 31 g     120 kcal  24,0 P
    -----------------------------------------------------------
                                          505,45 kcal  40,88 g

`[cmd]` **In der Datenbank gegengeprueft:** `amount_g` der
Whey-Zeile ist **NULL** (CHECK), Portion und Anzahl stehen in
`recipe_product_references`.

`[cmd]` **Am Schirm:** *Toms Shake · 3 Zutaten · 1 Portionen · 506
kcal/Portion*, und die Zeile

    Gold Standard 100% Whey Vanilla Ice Cream
      [Supplement · 31 Gram(s)]   1 ×   120 kcal  24,0 P  1,0 F  4,0 C

### A4 — warum der Planner es NICHT zeigt

`[cmd]` **Gemessen, welcher Aufrufer den Schreibweg durchreicht:**

    mahlzeiten.tsx           onSupplement   JA
    rezepte-echt.tsx         onSupplement   JA   (neu, C-519)
    plan-eintrag-editor.tsx  onSupplement   NEIN
    ghost-eintrag.tsx        onSupplement   NEIN

`[read]` **Das ist kein Versehen, sondern die Regel aus G-480:**
**die Quelle wird FREIGESCHALTET, nicht vorausgesetzt.** `[read]`
**Eine Filterpille im Planeintrag fuehrte in eine Liste, aus der man
nichts waehlen kann** — schlimmer als keine.

`[cmd]` **Und ein zweiter Befund beim Messen:** der Planeintrag-
Editor zeigt bei einem VORHANDENEN Eintrag ueberhaupt keine
Lebensmittelsuche — dort steht *,,Quelle … bleibt, nur Menge und
Mahlzeit sind hier aenderbar"* (`plan-eintrag-editor.tsx:240`).
`[read]` **Die Quelle aendert man durch Loeschen und Neuanlegen.**

`[read]` **Was fuer den Plan fehlt, ist eine Spalte** — entweder
`supplement_product_id` wie vor C-519, oder ein Verweis wie bei
`meal_items`. **Das ist `supabase/` und damit Codex.**

### A5 — die Formregel, wiederverwendet

`[cmd]` **Gemessen mit ,,creatine":**

    127 Supplement-Treffer
    davon Powder [E0162]   127
    VERBOTENE Formen         0

`[read]` **Nicht nachgebaut:** das Rezept ruft dieselbe
`sucheSupplemente`, und die filtert ueber `darfInMahlzeit`. `[cmd]`
**Der Waechter prueft beides** — dass die Suche filtert, und dass das
Rezept die Formenliste NICHT noch einmal enthaelt.

### Wo der Zugriff liegt — und warum

`[cmd]` **`recipe_product_references` liegt in `supplements`.**
`[cmd]` **G-138 verlangt: genau EINE Datei fasst diese Tabellen an**,
und der Waechter prueft die DATEI, nicht die Zeile.

`[read]` **Also steht `produktverweise()` in `stack-write.ts`**, neben
`einnahmenZuPosten` aus G-485. **Verschoben, nicht den Waechter
gelockert** — dieselbe Loesung wie in G-475 und G-485.

### Eine Kleinigkeit, die ohne Messung falsch ausgesehen haette

`[cmd]` **Die Zeile zeigte zuerst `0 g` und vier Striche.**

`[read]` **`amount_g` MUSS bei Supplementen NULL sein** (CHECK) — die
Anzeige rechnete daraus eine 0, und die Naehrwerte je 100 g gibt es
fuer ein Supplement nicht. `[read]` **Eine Null sieht aus wie eine
Messung.**

`[cmd]` **Behoben:** die Zeile zeigt `1 ×` statt Gramm, und die
Makros kommen aus der Portionsoption (mal Anzahl) statt aus einer
100-g-Rechnung.

### Drei Waechter nachgezogen, keiner gelockert

`[cmd]` **G-480** sicherte zu: *nur der Mahlzeitweg schaltet
Supplemente frei*. `[read]` **Die Regel bleibt — anbieten nur, wo
geschrieben werden kann.** `[cmd]` **Nur die Liste hat sich
geaendert:** das Rezept kann es seit C-519.

`[cmd]` **G-325** verbot `enercc_100: null, prot625_100: null`.
`[read]` **Ein Supplement hat keine Werte je 100 g** — die
Zusicherung prueft jetzt den Zweig, der aus der SUCHE kommt.

`[cmd]` **G-326** las 1.400 Zeichen ab `detail-zutat`. `[cmd]` **Die
Supplementmarke schob die Makrospalten darueber hinaus**, und die
Zusicherung fiel, **obwohl alle vier Werte weiter dastehen.**
`[read]` **Ein Zeichenfenster ist keine Blockgrenze** — jetzt wird
bis zum Ende der Zeile gelesen.

### Der Waechter

`[cmd]` **`g483-rezept-supplement.test.ts`, 6 Faelle.** `[cmd]`
**`_g483-sabotage.mjs`: 10 Schaeden plus Kontrolle — 11/11.**

`[read]` **Darunter der Fall, der am meisten kostet:** *,,der
Planeintrag bietet Supplemente an"* — **wird rot.**

### Die Fotos

    backup/x-g483-a2-shake.png    A1 und A2: das Rezept mit den Werten
    backup/x-g483-a5-formen.png   A5: nur untermischbare Formen
    backup/x-g483-a4-planner.png  A4: der Planner ohne Supplementpille

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.
