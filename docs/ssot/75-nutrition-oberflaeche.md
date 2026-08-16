# G-03: Nutrition als erstes echtes Modul

`[cmd]` Erhoben am 2026-08-16, Zweig `dev`, Anker G-02 `324c929`.

Zwei Seiten unter `/v2/nutrition`:

| Seite | Vorlage | Zustand |
|---|---|---|
| `/v2/nutrition` — Tagebuch | `module-nutrition.jsx` | liest Tagessumme und Referenzbewertung |
| `/v2/nutrition/suche` — Lebensmittelsuche | `module-nutrition-nutrients.jsx` | sucht, zeigt Treffer und Naehrwerte |

`[cmd]` `apps/web/src/app/nutrition/foods/page.tsx` ist unberuehrt.

---

## Was die Seite nicht kann

### Sie liest. Sie schreibt nicht.

`[read]` Der Auftrag: „Keine Schreibpfade ins Tagebuch. `meals` und
`meal_items` haben 0 Zeilen; das Erfassen ist C-03."

`[cmd]` Es gibt deshalb keinen Knopf „Mahlzeit hinzufuegen" — auch
keinen deaktivierten. Stattdessen steht im leeren Zustand, **warum**
nichts da ist und dass das Erfassen ein eigener Auftrag ist. Ein
deaktivierter Knopf haette behauptet, die Funktion sei fast fertig.

### Es gibt keine Tagesziele — deshalb keine gefuellten Ringe

Das ist die groesste Abweichung von der Vorlage, und sie faellt sofort
auf.

`[cmd]` `module-nutrition.jsx` beginnt mit:

```js
const target = { kcal: 2700, p: 180, c: 320, f: 90 };
const cur    = { kcal: 1847, p: 142, c: 168, f:  72 };
```

Acht erfundene Zahlen. `[cmd]` In diesem Repo gibt es **keine
Zieltabelle** — die 22 Tabellen in `nutrition` enthalten nichts
dergleichen, und `public.profiles` traegt beim Testkonto weder
`birth_date` noch `biological_sex`.

Ein Ring, der zu 68 % gefuellt ist, weil das Ziel erfunden wurde, ist
eine Falschaussage mit hoher Ueberzeugungskraft. Die Seite zeigt
stattdessen den **Wert ohne Verhaeltnis** und schreibt darunter, warum:

> **Keine Ringe, weil es keine Ziele gibt.** `[cmd]` Dieses Repo hat
> keine Zieltabelle — die Vorlage zeigt an dieser Stelle vier erfundene
> Zahlen (2.700 kcal, 180 g Protein …).

`ProgressRing` nimmt `target` deshalb als **optional** entgegen. Sobald
es eine Quelle fuer Tagesziele gibt, fuellt sich der Ring ohne weitere
Aenderung.

### Ohne Profil kein Deckungsgrad

`[cmd]` `nutrition.daily_reference_assessment` liest Alter und
biologisches Geschlecht aus `public.profiles`. Fehlt beides, liefert die
Funktion `reference_status = 'missing_profile'` fuer **jeden**
Naehrstoff.

Die Seite zeigt dann „Profil fehlt" je Zeile und einen Hinweis darueber
— **nicht 0 %**. `[cmd]` Beim Testkonto ist genau das der Fall.

### Attrappe geblieben

| Aus der Vorlage | Warum nicht gebaut |
|---|---|
| `NutrientHeatmap` (30 Tage × Naehrstoff) | `[cmd]` Es gibt Daten fuer 0 Tage |
| `NutritionPlanner` (Wochenplan) | Keine Tabelle fuer Plaene |
| `NutritionInsights` | Erfundene Saetze; braeuchte einen Modellaufruf |
| `NutritionScoreCard` | Gehoert zu C-49, siehe unten |
| `SmartSuggestionsCard` | Vorschlaege ohne Datengrundlage |
| MealCam, Favoriten, „Same as yesterday" | Setzen das Erfassen voraus (C-03) |
| Filterleiste („All, Favorites, Recent, Meat …") | `[cmd]` Die Suche liefert echte Facetten (Kategorien, Tags); die feste Leiste der Vorlage haette daneben gestanden |

---

## Zwei Zahlen, gemeldet statt aufgeloest

### Vitamin D: 20 µg im Entwurf, 15 µg in der Datenbank

`[cmd]` Nachgesehen:

```
VITD | AI | 15.0000 | ug/day | both | ab 18 | EFSA Dietary Reference Values
VITD | UL | 100.0000| ug/day | both | ab 18 | EFSA Dietary Reference Values topic page
```

`[cmd]` Der Entwurf (`module-nutrition-nutrients.jsx`, Z 210) traegt
`target: 20` — den DGE-Wert.

**Nicht aufgeloest.** Die Oberflaeche zeigt, was die Datenbank sagt:
15 µg als `AI`, dazu 100 µg als `UL`. `[read]` Welche Quelle gilt, ist
eine Entscheidung fuer Tom, keine Anzeigefrage.

### Der Nutrition-Score

`[cmd]` In `module-nutrition.jsx` selbst kommt kein Score vor — die
Karte heisst `NutritionScoreCard` und wird ueber `window` eingehaengt,
liegt also in einer anderen Datei des Entwurfs.

**Nicht gebaut, nicht aufgeloest.** `[read]` Der Auftrag ordnet ihn C-49
zu. Solange die Skalierung (0–1 gegen Schwellen 0–100) offen ist, waere
jede Anzeige eine Festlegung.

---

## Die vier Regeln aus C-48, an echten Zeilen belegt

`[cmd]` Auf einer **Wegwerf-Datenbank** `lumeos_g03` (Kette von leer,
danach verworfen) mit zwei Positionen: eine vollstaendig, eine ohne
Eisen. Profil ausgefuellt, damit die Funktion ueberhaupt bewertet.

```
 nutrient_code | actual_value | missing_count | reference_kind | direction    | reference_pct | status
 VITC          |          120 |             0 | PRI            | target       |         109.1 | complete
 VITC          |          120 |             0 | UL             | upper_limit  |           6.0 | complete
 FE            |         14.0 |             1 | PRI            | target       |               | incomplete
 FE            |         14.0 |             1 | UL             | upper_limit  |               | incomplete
 ENERCC        |     500.0000 |             0 | FORMULA        | target       |               | complete
 LEU           |              |             2 | PRI            | target       |               | incomplete
```

**Regel 1 — Fehlzaehler werden nicht zu Nullen.** `[cmd]` `FE` hat einen
Wert (14,0) und einen Fehlzaehler (1). `reference_pct` ist **leer**, der
Status `incomplete`. Die Oberflaeche schreibt „unvollstaendig" statt
einer Prozentzahl und nennt darunter „1 ohne Wert".

**Regel 2 — Die Wertart entscheidet die Leserichtung.** `[cmd]` `VITC`
steht zweimal in derselben Tabelle: 109,1 % des `PRI` (Ziel — erreicht,
gruen) und 6,0 % des `UL` (Obergrenze — unbedenklich, ebenfalls gruen).
Dieselbe Menge, zwei Bedeutungen. Bei einer Obergrenze markiert ein
Strich die 100 %, sonst laese sich ein voller Balken wie ein Erfolg.

**Regel 3 — `NO_REFERENCE` ist kein „0 %".** `[cmd]` `ENERCC` ist
vollstaendig (`missing_count = 0`, Status `complete`) und hat trotzdem
keinen Prozentwert, weil `FORMULA` keine Referenz im Sinne der Bewertung
ist. Die Zeile bleibt ohne Balken. `[cmd]` Im Bestand betrifft das
57 `NO_STANDALONE_REFERENCE` und 21 `NO_REFERENCE`.

**Regel 4 — 100 % heisst nicht „genug fuer dich".** Steht als fester
Satz unter der Deckungsliste, nicht nur in diesem Bericht:

> Die Referenzwerte gelten fuer gesunde Erwachsene in Ruhe. Wer
> trainiert, krank ist, schwanger ist oder Medikamente nimmt, braucht
> andere Mengen — das kann diese Seite nicht wissen.

`[cmd]` Neun Tests halten die Regeln fest, vier davon gegen die oben
gemessenen Zeilen — abgeschrieben, nicht erfunden.

**Wo die Regeln durchgesetzt werden:** in der **Datenbank**, nicht in
der Oberflaeche. `daily_reference_assessment` liefert `reference_pct`
bereits als `NULL`, sobald ein Fehlzaehler > 0 ist. Die Seite rechnet
nicht nach — eine zweite Rechnung waere genau die Stelle, an der aus
einem Fehlzaehler eine Null wird.

---

## Ein Befund: 60 von 138 Naehrstoffnamen sind doppelt kodiert

<!-- encoding-pruefung:absicht — dieser Abschnitt ZITIERT beschaedigte
     Sequenzen als Beleg. Sie duerfen nicht "repariert" werden, sonst
     steht hier "Einheit µg statt µg". -->

`[cmd]` Im Browser fiel auf: „Kohlenhydrate, verfÃ¼gbar",
„Vitamin A, Retinol-Ã„quivalent", Einheit „Âµg".

Nachgemessen, nicht vermutet:

| | |
|---|---|
| `nutrient_defs` mit `Ã` oder `Â` | **60 von 138** |
| `foods.name_display_de` betroffen | **0 von 7.140** |
| Einheit `Âµg` statt `µg` | **23** |

`[cmd]` Die Bytes in der Datenbank fuer „verfügbar":
`... 76 65 72 66 c383 c2bc 67 62 61 72`. Korrektes UTF-8 waere `c3bc`
fuer „ü"; `c383 c2bc` ist die **UTF-8-Kodierung der bereits kodierten
Bytes** — doppelt kodiert.

`[cmd]` Die Ursache liegt in der Quelle, nicht in der Anzeige:
`supabase/_pipeline/015_kataloge/015_nutrient_defs_seed.sql` enthaelt
**206** doppelt kodierte Sequenzen und **0** einfach kodierte. Jeder
Kettenlauf reproduziert den Fehler.

**Nicht repariert.** Der Auftrag verbietet Aenderungen an `supabase/`
und an der Kette, zu Recht: das ist ein Datenfehler mit eigenem Umfang
(die Namen muessen aus der BLS-Quelle neu gezogen oder einmalig
umkodiert werden), und er betrifft alles, was `nutrient_defs` liest —
auch die bestehende Oberflaeche.

`[annahme]` Ein eigener Auftrag. Die Umkodierung selbst ist mechanisch
(`convert_from(convert_to(name_de,'LATIN1'),'UTF8')`), aber sie gehoert
in die Seed-Datei, nicht in ein einmaliges `UPDATE` — sonst ist sie beim
naechsten Kettenlauf wieder weg.

---

## Welche Bausteine gefehlt haben

Beide neu in `packages/ui`, **nicht** in der Seite.

### `ProgressRing`

`[cmd]` Die Vorlage hat denselben Baustein **zweimal**: `DualRing` und
`MacroRing` (`module-nutrition.jsx`, Z 76 und Z 111). Sie unterscheiden
sich in Schriftgroessen und darin, ob ein Prozentwert unter dem Wert
steht — sonst sind sie gleich. Hier ist es einer mit Requisiten.

`[read]` G-02 hat `Ring` bereits uebernommen; der zeigt **einen** Wert
auf einer Bahn. `ProgressRing` zeigt zwei Dinge zugleich — was erreicht
ist und was fehlt, mit eigenem Bogen fuer den Rest. Das ist ein anderer
Baustein, kein Aufsatz.

Abweichung von der Vorlage: `target` darf **fehlen**. Ohne Ziel zeigt
der Ring den Wert und sagt, dass es kein Ziel gibt. Dazu `incomplete`:
ist die Summe eine Untergrenze, zeichnet der Bogen gestrichelt.

### `CoverageRow`

Neu, **nicht** aus der Vorlage. Der Entwurf zeigt Naehrstoffe als Balken
mit Prozentwert — in einer einzigen Leserichtung. `[read]` Das reicht
fuer C-48 nicht: die Zeile muss vier Faelle unterscheiden koennen
(Ziel, Obergrenze, Bereich, kein Einzelwert) und drei Zustaende ohne
Prozentwert anzeigen (unvollstaendig, nicht erfasst, kein Referenzwert).

Dazu die reine Funktion `bewerte(direction, percent)` — sie ist der
Ort, an dem Regel 2 steht, und getestet.

### Nicht gebaut: `LineChart`, `RadarChart`

`[read]` G-02 hatte sie bewusst ausgelassen, und der Auftrag stellt
frei, sie hier zu bauen. **Sie wurden nicht gebraucht.** Die
Naehrstoffuebersicht ist eine Liste, keine Kurve; ein Verlauf ueber
Tage braeuchte `[cmd]` Daten fuer mehr als 0 Tage. Sie zu bauen, ohne
sie zu benutzen, hiesse ungeprueften Code abzulegen.

### Ergaenzte Klassen

`[cmd]` Vier Bloecke im Stylesheet-Generator, alle aus vorhandenen
Tokens: `.v2-coverage-row` (Deckungszeile), `.v2-hit` (Trefferzeile),
`.v2-feld` (Eingabefeld im Inhaltsbereich — der Entwurf hat nur das
240px-Feld der Seitenleiste), `.v2-empty` / `.v2-hinweis` / `.v2-link`
(leerer Zustand und Hinweiszeile; der Entwurf kennt beides nicht, weil
in einer Vorfuehrung nie etwas leer und nie etwas unsicher ist).

`[cmd]` Die vier `rgba()`-Werte bleiben bei **4** — keine neue feste
Farbe.

---

## Die geteilte Datenschicht

`[cmd]` Die Suche ruft `/api/nutrition/foods` auf — **dieselbe Route,
die die bestehende Seite benutzt**. Dort sitzen `getLocalFoodSearch` und
`recordFoodSearchEvent` in einem Aufruf. Die neue Seite kennt das
Protokoll gar nicht und schreibt trotzdem mit.

`[cmd]` Die Sitzungskennung setzt `middleware.ts` fuer Pfade unter
`/api/nutrition/foods` — also beim ersten Aufruf von hier. **An der
Middleware war nichts zu aendern.**

`[cmd]` Neu in der Datenschicht: `reference-assessment-read.ts`. Sie
ruft die Funktion auf und liest das Ergebnis, mehr nicht — die
Prozentwerte kommen fertig aus der Datenbank.

`[cmd]` Ein Fehler dabei gefunden und behoben: der erste Aufruf ohne
`.schema('nutrition')` meldete *„Could not find the function
public.daily_reference_assessment"*. PostgREST sucht in `public`; das
Muster `nutritionRpc()` in `@lumeos/shared` macht es richtig. **Im
Browser aufgefallen, nicht beim Uebersetzen** — der Typ passte.

---

## Nachweis

### Gate und Tests

`[cmd]` `pnpm gate`: **8 successful, 8 total** — unveraendert.
`[cmd]` Tests: **146 von 146** (vorher 136; zehn neue).

### Eine echte Suche

`[cmd]` Angemeldet mit `test-user@lumeos.local` ueber Playwright,
Suchbegriff **`Huehnerbrust`** (ohne Umlaut):

```
Treffer     : 31
erste drei  : ["Hähnchenbrust (roh)", "Hähnchenbrust ohne Haut (roh)",
               "Marinierte Hähnchenbrust (roh)"]
Detailtitel : Hähnchenbrust (roh)
Naehrwerte  : 118
```

`[cmd]` Der Treffer stimmt: `V416100` = „Hähnchenbrust (roh)", 109 kcal
und 23,25 g Protein je 100 g. Die Suche findet ihn aus einer
umlautfreien Eingabe — die Zerlegung und die Aliase greifen.

### `search_events` bekommt eine Zeile

`[cmd]` Vorher **13** Zeilen, nachher **14**. Die neue:

```
 query        | normalized_query | result_count | selected_bls_code | selected_rank
 Huehnerbrust | huehnerbrust     |           31 | V416100           |             1
```

Genau das, was die Seite getan hat — samt gewaehltem Treffer und Rang.

### Die alte Oberflaeche unveraendert

`[cmd]` Auf `/nutrition`: **0** Elemente mit `v2-`-Klasse, **1**
`.lume-shell`.

`[cmd]` Im Produktionsbau referenzieren nur die drei `/v2`-Seiten das
v2-Stylesheet; die beiden gemeinsamen Bundles enthalten **0** Vorkommen
von `v2-`.

`[cmd]` `git diff` auf `nutrition/foods/page.tsx`, `app-shell.tsx` und
`components/ui/` ist leer.

### Drei Breiten

`[cmd]` Ohne waagrechten Ueberlauf:

```
breit   1600px: body 1600 ok
tablet  1100px: body 1100 ok
schmal   800px: body  800 ok
```

### Konsolenmeldungen

`[cmd]` Fuenf, alle dieselbe: `Warning: Extra attributes from the
server: data-mode`. `[cmd]` Aus `MODE_BOOTSTRAP` in `app/layout.tsx`,
zuletzt in `968bfca` geaendert, von diesem Auftrag nicht beruehrt —
tritt auf der alten Oberflaeche ebenso auf. Bereits in G-02 gemeldet.
