# 86 — Erfassung im Tagebuch (G-12)

Stand: 2026-08-17 · Anker: Zweig `dev` · Auftrag G-12
Herkunft: gebaut und geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

Zwei Teile: erst sieht die Mahlzeitenkarte aus wie die Vorlage, dann
funktioniert die Erfassung darin.

| Datei | Rolle |
|---|---|
| `apps/web/src/app/v2/nutrition/mahlzeiten.tsx` | Karten, Suchmodal, Ändern-Modal |
| `apps/web/src/lib/nutrition/diary-write.ts` | Portionsspalten ergänzt (nur `SELECT`) |
| `apps/web/src/lib/nutrition/diary-model.ts` | `StoredMealItem` um die drei Portionsfelder erweitert |

`apps/web/src/app/v2/nutrition/erfassen.tsx` ist verwaist — das
Formular aus C-03, das die Karte ersetzt hatte. Es ist **nicht
gelöscht**, weil dieser Auftrag nichts committen soll; die Datei wird
von niemandem mehr eingebunden.

---

## Was aus dem Vorgängerrepo übernommen wurde

`[read]` Gelesen, nie geschrieben. `[cmd]`
`referenz/lumeos-2026/apps/app/modules/nutrition/components/` führt 41
Komponenten; vier davon waren für diesen Auftrag einschlägig.

### `AddFoodModal.tsx` (230 Zeilen) → das Suchmodal

Übernommen ist der **Ablauf**, nicht der Code:

| Vorgänger | hier |
|---|---|
| Suchfeld mit `autoFocus`, Suche bei jeder Eingabe | dasselbe, aber mit 250 ms Verzögerung — sonst eine Abfrage je Tastendruck |
| Trefferliste, je Treffer **vier Nährwerte** (kcal, P, C, F) | dasselbe, Werte je 100 g beschriftet |
| Nach der Auswahl: Karte mit dem gewählten Lebensmittel | dasselbe als `v2-insight` |
| Portionsliste, **erster Eintrag „Custom amount (g)"** | „Menge in Gramm" an erster Stelle, danach die Portionen mit Grammgewicht |
| Auswahl einer Portion setzt das Mengenfeld | dasselbe, zusätzlich ein Feld **Anzahl** (`2 × Scheibe`) |
| Fußzeile: `Per 100g: … kcal, …g protein` | dieselbe Zeile, in der Auswahlkarte |
| `Add Food` deaktiviert ohne Auswahl oder ohne Menge | dasselbe |

**Angepasst, weil das Schema ein anderes ist:** `public.foods` mit UUID
und `food.kcal`/`food.protein_g` gegen `nutrition.foods` mit `bls_code`
und `enercc`/`prot625`/`cho`/`fat` — `[cmd]` letztere kommen als
Zeichenkette aus PostgREST, nicht als Zahl. Die Portionen kommen aus
`foods_portions` über `/api/nutrition/diary?portionen_fuer=`, nicht aus
einem eigenen `useFoodPortions`-Hook.

### `SmartSuggestions.tsx` → `Same as yesterday`

`[read]` Der Vorgänger holt sich in `handleCopySameAsYesterday` je
Position **das Lebensmittel neu** (`getFoodById`) und ruft
`addMealItem(meal.id, food, item.amount_g)`. Er kopiert also **nicht**
die gespeicherten Nährwerte, sondern erfasst neu.

**Genau so hier:** übertragen werden nur `food_id` und `amount_g`; die
Nährwerte friert `addMealItem` neu ein. Das ist auch die Vorgabe des
Auftrags — es ist eine Erfassung von heute, kein Abbild von gestern.

Nicht übernommen: der Vorgänger legt die Mahlzeit mit einem
englischen Namen an (`mealNames`-Tabelle). Hier trägt `meals` den Typ,
der Name kommt aus der Oberfläche.

### `AdjustMealModal.tsx` → das Ändern-Modal

Übernommen: ein Mengenfeld, Speichern und Entfernen nebeneinander.
`[read]` Die Vorlage führt dafür das `···` in der Zeile — dort sitzt
der Einstieg.

### `FoodLogEntry.tsx` → die Positionszeile

Der Vorgänger zeigt Name, Menge und Kalorien. **Die Vorlage zeigt
vier Werte** (Menge, kcal, P, C, F) — hier gilt die Vorlage, weil sie
die neuere Vorgabe ist.

---

## Welche Abweichung von der Vorlage welchen Grund hat

### Was zurückgenommen wurde

`[cmd]` Der vorige Stand war ein Formular, keine Anzeige:

| vorher | jetzt |
|---|---|
| je Position ein Eingabefeld, Haken, Mülleimer | Menge als **Text**, Bearbeitung über `···` |
| ein Wert je Zeile (kcal) | **vier Werte**: Menge, kcal, P, C, F |
| sieben Knöpfe „Mahlzeit anlegen" über den Karten | entfallen — die Karten stehen von selbst da |
| keine leeren Karten | **fünf Karten**, auch die leeren |
| Kopf: `3 Positionen · 530 kcal`, kein `+` | Kopf: `· 3 items` … `530 kcal · 27g P`, dann `+` und Pfeil |

### Abweichungen, die bleiben — mit Grund

| Stelle | Vorlage | hier | Grund |
|---|---|---|---|
| **Uhrzeit im Kopf** | `07:42 Breakfast` | `— Breakfast` | **`[cmd]` `meals` führt nur `entry_date`, keine Uhrzeit.** Die Spalte bleibt an ihrer Stelle und zeigt `—` statt einer erfundenen Zeit. **Gemeldet, nicht ersetzt.** |
| **Vorschlag in der leeren Karte** | `· Pre-workout · 60g carbs + 25g protein` | `· Empty` | **`[cmd]` Setzt eine Planung voraus, die es nicht gibt** — kein Schema für Essenspläne, keine Zielverteilung je Mahlzeit. Der Platz bleibt frei. |
| **Portion in der Zeile** | nur Gramm | zusätzlich `2 × 1 Scheibe` | C-51 speichert den Portionsschnappschuss. Ohne die Angabe wäre nicht erkennbar, ob „2 Scheiben" gemeint waren oder 60 g. **Zusatz, keine Ersetzung** — die Grammzahl steht weiter daneben. |
| **Slot-Reihenfolge** | Breakfast · Snack · Lunch · Snack · Dinner | Breakfast · Snack · Lunch · Dinner · Post-workout | Die Vorlage zeigt **zweimal „Snack"**. `meals` hat einen UNIQUE-Index auf (user, datum, typ) — zwei Snacks am selben Tag sind nicht speicherbar. Statt den zweiten wegzulassen, steht dort `Post-workout` aus `MEAL_TYPES`. |
| **Anzahl-Feld** | gibt es nicht | neben der Portionsliste | Der Vorgänger setzt beim Portionswechsel nur die Gramm. Ohne Anzahl ließe sich „2 Scheiben" nur als „60 g" erfassen, und `portion_quantity` bliebe immer 1. |

`[annahme]` Die Slot-Reihenfolge ist die einzige Stelle, an der ich von
der Vorlage abgewichen bin, ohne dass die Technik es erzwingt — der
zweite „Snack" ließe sich als eigener Typ führen. **Das gehört Tom.**

---

## Nachweise

| Prüfung | Ergebnis |
|---|---|
| Angemeldet als `dev@lumeos.app` | `[cmd]` ja |
| Position über die Suche | `[cmd]` „Banane roh" → `amount_g 100`, `portion_name '100 g'` |
| Position über gewählte Portion | `[cmd]` „Vollkornbrot" → `portion_name '100 g'`, `portion_quantity 1`, `portion_amount_g 100` |
| Position über direkte Gramm | `[cmd]` „Haferflocken" → `amount_g 75`, **`portion_name` leer** |
| `search_events` | `[cmd]` `selected_bls_code` und `selected_rank` gesetzt: `lachs` → `T410072`/7, `Banane` → `F503100`/1, `Vollkornbrot` → `B101000`/1 |
| Ringe ohne Neuladen | `[cmd]` vorher `—/2.500 kcal`, nachher `550/2.500 kcal · 22 %` — `router.refresh()` zieht die Serverkomponente nach |
| `Same as yesterday` | `[cmd]` am 14.09. für „Dinner": 4 Positionen vom 13.09., **Nährwerte neu eingefroren** (nur `food_id` + `amount_g` übertragen) |
| MealCam | `[cmd]` öffnet das Modal „in Entwicklung" |
| Drei Breiten | `[cmd]` 1600 / 1100 / 800 px, kein Überlauf — auch die Positionstabelle nicht |
| `/nutrition` unverändert | `[cmd]` 0 `v2-`-Elemente, `lume-shell` vorhanden |
| Seitenfehler | `[cmd]` 0 |
| `pnpm gate` | `[cmd]` 8 von 8, ungecacht |
| `pnpm test` | `[cmd]` 189 Tests, 0 fehlgeschlagen |

`[cmd]` Die Testpositionen am 14.09. sind nach der Prüfung wieder
entfernt worden (7 Positionen, 4 Mahlzeiten) — der Tag ist wieder leer.

### Ein Fund am Rande

`[cmd]` Die Vorgabeportion heißt in den Daten oft schlicht **„100 g"**:
bei allen sechs Vollkornbrot-Sorten ist `is_default` auf einer Portion
mit `name_de = '100 g'` und `amount_g = 100`. Die Portionsauswahl zeigt
dann „100 g (100 g) · Vorgabe", was doppelt gemoppelt aussieht. Das ist
eine **Eigenschaft der Daten**, kein Anzeigefehler — gemeldet, nicht
umgangen.
