# 147 — Der Attrappen-Test, der Planner und die acht Spalten (G-97)

**Stand:** 2026-08-20 · **Modul:** Nutrition · **Auftrag:** G-97

---

## Was am Attrappen-Test falsch war

`[cmd]` **Der Test war richtig. Die Datei war falsch.**

`[cmd]` Der Arbeitsstand von `apps/web/src/app/v2/supplements/tabs.tsx`
trug **16 `ATTRAPPE` und 0 `RUECKFALL`**; die **committete Fassung
(HEAD) trug 1 und 16** — also genau das, was der Test erwartet.

`[read]` **Es war kein Markierungsfehler, sondern eine ganze veraltete
Datei.** Der Unterschied bestand nicht nur aus Marken:

| Was der Arbeitsstand zusaetzlich zuruecknahm | Belegt durch |
|---|---|
| Import von `CostErgaenzung` (die zwei echten Kostenkacheln aus G-74) | im Diff geloescht |
| Die Konstante `RUECKFALL` samt Begruendungssatz | im Diff geloescht |
| Spalte **`Serving`** wieder zu **`Typical dose`** | im Diff ersetzt |

`[cmd]` **Die letzte Zeile ist der Beweis, dass es ein Rueckschritt
war:** G-91 hat `Typical dose` ausdruecklich entfernt, weil
`typical_dose_min`/`_max` **auf allen 44 Katalogeintraegen leer** sind
(Bericht 140). Der Arbeitsstand haette die Spalte voller Striche
zurueckgebracht.

**Behandlung:** `[cmd]` Der Stand ist mit `git stash push` **aufgehoben,
nicht verworfen** (`stash@{0}`, Nachricht *„G-97: veralteter
tabs.tsx-Stand vor G-91"*) — falls doch jemand daran gearbeitet hat,
ist er wiederherstellbar.

`[cmd]` **Danach gemessen:** 1 `ATTRAPPE`, 16 `RUECKFALL`, Konstante
vorhanden. Die Marke sitzt je Fassung richtig:

| Fassung | RUECKFALL | ATTRAPPE |
|---|---|---|
| `TodayAttrappe` | 4 | 0 |
| `SlotCard` | 1 | 0 |
| `StackMatrix` | 1 | 0 |
| `StackList` | 1 | 0 |
| `DatabaseAttrappe` | 1 | 0 |
| `CostAttrappe` | 8 | 0 |
| **`SuppInteractions`** | **0** | **1** |

`[read]` **Der zweite Test aus G-74 gehoerte mit** — er prueft genau
das: dass `SuppInteractions` die echte Marke behaelt, weil daneben
**keine** angebundene Fassung steht. Beide Tests laufen: **76 pass, 0
fail.**

`[cmd]` **Gerendert gezaehlt (A-24): `/v2/supplements` zeigt 1
Attrappe**, nicht 17 — die Zahl des Tests und die der Seite stimmen
wieder ueberein.

`[read]` **Der Catalog-Tab aus G-91 hat die Lage NICHT veraendert.** Die
Erwartung im Test blieb unangetastet; sie war nie falsch.

`[cmd]` **C-150 hatte denselben Befund** und ihn richtig zugeordnet:
*„Dieser Bereich wurde fuer C-150 nicht angefasst"* (Bericht 143).

---

## Was der Planner zeigt

`[cmd]` **Der Tab liest echt, seit dieser Arbeit.** Angemeldet als
`dev@lumeos.app`, gemessen aus der HTTP-Antwort:

| | |
|---|---|
| Plan | **Aufbau-Wochenplan**, aktiv |
| Ziele | **2.500 kcal · 170 g P · 313 g KH · 75 g F** |
| Wochen | **3** — gefuellt (28), leer (0), kopiert (28) |
| Angezeigte Woche | **18.6. – 24.6.**, 28 Eintraege |
| Zellen mit kcal | **28** |
| Rezepte | 3, mit Zutaten und gerechneten Naehrwerten |
| **Attrappenmarken im Tab** | **0** — vorher trug jede Kachel eine |

**Der Aufbau folgt dem Entwurf** (`NutritionPlanner`): Wochennavigation,
`Copy week`, `New recipe`, darunter das Raster aus Mahlzeitenreihen ueber
sieben Tage, je Zelle Gericht und kcal.

### Drei Stellen weichen bewusst ab

**1. Die kcal sind gerechnet, nicht gewuerfelt.** `[cmd]` Der Entwurf
hatte `Math.round(400 + Math.random() * 400)`. Jetzt: Rezepte ueber
`nutrition.recipe_nutrition`, BLS-Eintraege ueber
`food_nutrient_snapshot` — **beide aus C-150.** Sichtbar an der
Skalierung: **Banane-Joghurt-Haferflocken 493 kcal bei 1×, 617 bei
1,25×**; Huhn-Reis-Bowl **789 bei 1×, 592 bei 0,75×**.

**2. Hervorgehoben ist heute, nicht der Samstag.** `[read]` Im Entwurf
stand `di === 5` fest verdrahtet. Wer auf einen Wochenplan schaut, sucht
den heutigen Tag.

**3. Leere Zellen bleiben leer.** `[read]` Im Entwurf war jede Zelle
gefuellt, weil die Daten erfunden waren. Echte Plaene haben Luecken —
die **leere Planwoche des Seeds ist genau dafuer da.**

### Was NICHT gebaut wurde

`[cmd]` **Kein Generator**, wie im Auftrag verlangt. `Copy week` kopiert
eine vorhandene Woche und erfindet keine; der Knopf traegt die
Entwicklungsmarke, weil `copy_meal_plan_week` zwar in der Datenbank
steht und dort gegengeprueft ist (C-150), **der Schreibpfad im Browser
aber fehlt.** Dasselbe bei `New recipe`.

`[read]` **Keine Naehrwertbewertung eines Plans.** Die Ziele stehen als
Zahlen da, ohne Urteil daneben — dasselbe Muster wie in G-76/G-82.

---

## Ob die acht Spalten wirken

`[cmd]` **Alle acht stehen in `nutrition.food_preferences`. Nur EINE
hat eine Entsprechung in `recipes`: `cooking_skill`.**

| Spalte | Wert bei `dev` | Wirkt jetzt? |
|---|---|---|
| `meals_per_day` | 4 | **Ja** — Zeilen des Rasters |
| `snacks_per_day` | 1 | **Ja** — Snackreihe |
| `cooking_skill` | `advanced` | **Sichtbar** — Spalte an jedem Rezept |
| `prep_time_max_min` | 30 | **Sichtbar vergleichbar** — Zeit je Rezept |
| `preferred_cuisines` | `{mediterranean}` | **Sichtbar** — Kueche je Rezept |
| `budget_level` | `medium` | **Nein** — kein Preisfeld an `recipes` |
| `meal_prep_ok` | `true` | **Nein** — kein Feld dafuer |
| `planner_notes` | Testtext | **Nein** — Freitext ohne Auswertung |

`[read]` **„Sichtbar" ist nicht „filtert".** Die drei mittleren Spalten
lassen sich jetzt **vergleichen**, weil `recipes` `cooking_skill`,
`cuisine_code`, `prep_time_min` und `cook_time_min` fuehrt — **ein
Filter waere eine Rezeptauswahl, und die gehoert zum Schreibpfad**, der
nicht Teil dieses Auftrags ist.

`[cmd]` **C-150 sagt dasselbe:** *„strukturell anschliessbar, aber noch
nicht als Plan-/Rezeptbewertung gebaut."*

### Ein eigener Fehler, beim Messen gefunden

`[cmd]` **Die erste Fassung rechnete die Snacks von `meals_per_day`
ab** und schrieb dann ueber ein Raster mit vier Reihen: *„4 Mahlzeiten
je Tag, davon 1 Snack"* — **ein Satz, der sich selbst widerspricht.**

`[cmd]` **Die Vorgaben der Datenbank entscheiden es:**
`050_preferences_foundation.sql` setzt `meals_per_day DEFAULT 3` **UND**
`snacks_per_day DEFAULT 1`. Drei Hauptmahlzeiten sind
Fruehstueck/Mittag/Abend — **der Snack kommt daneben, nicht darin.**
Waeren Snacks eingerechnet, hiesse die Vorgabe zwei Hauptmahlzeiten.

`[cmd]` **Und die Grenze wird jetzt genannt statt versteckt:** Bei
`meals_per_day = 4` zeigt das Raster **drei** Hauptreihen, weil es nur
drei `meal_type`-Reihen gibt. Der Satz unter dem Raster sagt das:

> 4 Reihen aus deinen Vorlieben — 4 Hauptmahlzeiten und 1 Snack. Fuer 4
> Hauptmahlzeiten fuehrt das Schema nur drei Reihen — die uebrigen
> haetten keinen `meal_type`.

`[cmd]` **Sechs Tests halten das fest**
(`__tests__/plan-model.test.ts`), damit es nicht ein zweites Mal
verwechselt wird.

---

## Was der zweite Tab braeuchte

`[cmd]` **`MealPlansView` IST im Mockup definiert** — der Auftrag und
C-150 sagen beide, es fehle. **Beide haben in der falschen Datei
gesucht.**

`[cmd]` Es steht in **`module-nutrition-spec.jsx:334`**, nicht in
`module-nutrition.jsx`. Letztere ruft `window.MealPlansView` ueber die
Dateigrenze hinweg — deshalb sieht es dort undefiniert aus.

`[read]` **Der zweite Tab hat also sehr wohl eine Vorlage**, und
`tab-plans.tsx` setzt sie bereits um: drei Unter-Tabs (Active plan ·
Plan library · Shopping list), sechs Kacheln, **6 Attrappenmarken
gerendert.**

### Was ihm zum Anschluss fehlt

**1. Ein Zustand je Planeintrag — das ist der Kern.** `[cmd]`
`meal_plan_entries` fuehrt **keine Spalte** fuer
`confirmed`/`deviated`/`skipped`/`pending`. Die Kachel „Today's ghost
entries" und die **7-Tage-Compliance** rechnen im Entwurf genau darueber.

**2. Eine Herkunft am Tagebuch.** `[cmd]` `meals` und `meal_items`
tragen **keinen Verweis auf einen Planeintrag**. Ohne ihn laesst sich
nicht sagen, ob ein erfasster Eintrag der geplante war oder ein anderer
— **also auch nicht, ob abgewichen wurde.**

`[read]` **Damit ist „Compliance" heute nicht ableitbar, nicht einmal
naeherungsweise.** Eine Zahl daneben zu stellen, waere eine erfundene.

**3. Lebenszyklus des Plans.** `[cmd]` Der Entwurf zeigt *„Day 3 of 7 ·
started May 14"* und eine Pille `rollover`. `meal_plans` fuehrt weder
Startdatum noch Laufzeit noch Verlaengerungsart — nur `is_active`.

**4. Eine Herkunft des Plans.** `[cmd]` Der Entwurf unterscheidet
`coach`, `user`, `marketplace`, `buddy`. `meal_plans.measurement_source`
steht auf `seed` und meint etwas anderes (Messherkunft, nicht
Urheberschaft).

**5. Fuer die Einkaufsliste fehlt am wenigsten.** `[cmd]` **72 der 112
Planeintraege zeigen auf ein Rezept**, Rezepte haben Zutaten mit
Mengen. Eine Liste liesse sich daraus **summieren** — es fehlt die
Kategorie je Lebensmittel („Fleisch & Fisch", „Milchprodukte") und die
Umrechnung in Einkaufseinheiten.

`[read]` **Empfehlung:** Punkt 1 und 2 sind eine Schemafrage fuer Codex
und gehoeren zusammen entschieden — ein Zustand ohne Herkunft am
Tagebuch bleibt Handarbeit. **Punkt 5 ist der einzige, der ohne
Schemaaenderung baubar waere.**

---

## Nachweis

`[cmd]` **Gate: `typecheck test build` fuer `@lumeos/web` und seine
Abhaengigkeiten — 3 von 3 gruen, 0 Testfehler.** Die vier
Vorpruefungen (Encoding, Gruppenlabel, Schemafreigabe, i18n) laufen
sauber; Encoding meldet 7.181 Dateien geprueft und **keinen Abbruch**.

`[cmd]` **`pnpm gate` als Ganzes ist rot — an `apps/coach`.** Das Paket
ist waehrend dieser Arbeit entstanden (Fable), ist **untracked, hat kein
`node_modules` und steht nicht im Lockfile**. Nicht angefasst.

`[read]` **`lint` gehoert nicht zum Gate** und wurde deshalb auch hier
nicht gefahren: `next lint` hat in diesem Repo **nie eine
ESLint-Konfiguration** gehabt und fragt interaktiv nach.

`[cmd]` **Zeilenschutz, gemessen ueber die eigene Route:**

| | `dev@lumeos.app` | `test-user@lumeos.local` |
|---|---|---|
| Planname sichtbar | ja | **nein** |
| Rezepte im HTML | 3 | **0** |
| Angezeigt | Wochenraster | **„Noch kein Wochenplan"** |
| Rezepte/Plaene in SQL | 3 / 1 | **0 / 0** |

`[read]` Der Zeilenschutz greift **ueber vier Ebenen hinweg**
(`meal_plans` → `weeks` → `days` → `entries`), ohne dass die Abfrage
einen eigenen `user_id`-Filter setzt — die Policies tun es.

`[cmd]` **Bildschirmfotos** ueber `tools/schuss.mjs`, headless und ohne
Fenster: Planner **1440 und 375 px, hell und dunkel**; Meal plans
1440 hell und 375 dunkel; Supplements 1440 fuer Teil A.

`[cmd]` **Marken gerendert gezaehlt (A-24):** Planner **1**, Meal plans
**6**, Supplements **1**.

`[cmd]` **Die eine im Planner gehoert nicht zum Tab.** Nachgesehen, wo
sie sitzt: *„Buddy ist in G-02 eine Attrappe"* — die Buddy-Kachel der
**Kontextspalte**, die auf jeder Seite steht. **Der Planner-Tab selbst
traegt null.**

`[read]` **Zwei Zaehlweisen, und sie sind nicht dasselbe:**
`schuss.mjs` zaehlt das sichtbare Wort (`text=/Attrappe/i`), eine
Suche im Quelltext zaehlt die Klasse `v2-attrappe`. Bei Meal plans
stehen **6 sichtbaren Marken 10 Klassen** gegenueber, weil die Klasse
auch an Unterelementen haengt. **Gezaehlt wird die sichtbare** — so
verlangt es A-24, und nur sie entspricht dem, was Tom sieht.

`[cmd]` **Zwei Konsolenfehler** an jeder Breite — beides
Next-Hydrationswarnungen aus dem Rahmen, nicht aus dieser Arbeit.

---

## Ein Fehler, der zweimal Zeit gekostet hat

`[cmd]` **Beim Bau erneut ausgeloest: HTTP 500 auf der ganzen Seite bei
gruenem Typecheck.**

Ursache: `tab-planner-echt.tsx` ist eine `'use client'`-Datei und
importierte `SLOT_LABEL` — einen **Wert** — aus `plan-lesen.ts`. Die
Datei importiert `next/headers`; damit landet Server-I/O im
Browserbuendel.

`[read]` **Derselbe Fehler steht in G-74 und G-79 im Bericht.** Er ist
nicht zu sehen, solange man nur den Typecheck fahrt — **erst die
gerenderte Seite zeigt ihn.**

**Behoben durch Trennung:** `plan-model.ts` traegt Begriffe und
Zeilenlogik ohne Serverbezug, `plan-lesen.ts` reicht sie weiter. **Typen
duerfen von dort kommen, Werte nicht** — das steht als Kommentar in
beiden Dateien.

---

## Geaenderte und neue Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/nutrition/plan-lesen.ts` | **neu** — Lesepfad ueber vier Tabellen, Naehrwerte aus den C-150-Funktionen |
| `apps/web/src/lib/nutrition/plan-model.ts` | **neu** — Begriffe und Zeilenlogik, ohne Serverbezug |
| `apps/web/src/app/v2/nutrition/tab-planner-echt.tsx` | **neu** — der Planner mit echten Daten |
| `apps/web/src/lib/nutrition/__tests__/plan-model.test.ts` | **neu** — 6 Tests auf die Zeilenlogik |
| `apps/web/src/app/v2/nutrition/ansicht.tsx` | `plan` durchgereicht, Planner-Zweig |
| `apps/web/src/app/v2/nutrition/page.tsx` | `ladePlan()` beim Planner-Tab |
| `apps/web/src/app/v2/supplements/tabs.tsx` | veralteter Arbeitsstand verworfen (gestasht) |

**Nicht angefasst:** `packages/ui`, `apps/coach`, `supabase/`,
`tab-plans.tsx`, die fuenf angebundenen Tabs.

---

## Neue Befunde

1. **`meal_plan_entries` braucht einen Zustand** und `meals`/`meal_items`
   **eine Herkunft zum Planeintrag** — ohne beides ist die
   Compliance-Kachel des zweiten Tabs nicht baubar. Schemafrage.
2. **`meal_plans` fuehrt weder Startdatum noch Laufzeit noch
   Urheberschaft** — *„Day 3 of 7"* und die Quellen `coach`/`user`/
   `marketplace`/`buddy` haengen daran.
3. **`MealPlansView` ist definiert**, in `module-nutrition-spec.jsx:334`
   — die gegenteilige Angabe in G-97 und C-150 ist zu berichtigen.
4. **Die Einkaufsliste waere ohne Schemaaenderung baubar** (72 von 112
   Eintraegen haengen an Rezepten mit Mengen); es fehlt eine Kategorie
   je Lebensmittel.
5. **`budget_level`, `meal_prep_ok` und `planner_notes` bleiben ohne
   Wirkung** — `recipes` fuehrt kein Preis- und kein Vorkochfeld.
