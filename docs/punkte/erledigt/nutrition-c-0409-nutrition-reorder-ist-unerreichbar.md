---
nr: C-409
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-408
entscheidung: E-65
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: b268640a
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
  checks: 2
---

# C-409 — `nutrition_reorder` ist unerreichbar

## Befund

Aus C-408, nachgemessen 2026-09-07.

`[cmd]` **Zwei CHECKs auf `shopping_lists.source_type`:**

    shopping_lists_source_target_check
      ... manual | supplement_reorder | nutrition_reorder ...

    shopping_lists_source_type_check
      source_type = ANY (ARRAY['manual', 'recipe', 'meal_plan',
                               'supplement_reorder'])

`[cmd]` **Der zweite kennt `nutrition_reorder` nicht.**

`[read]` **Beide muessen halten** — **also faellt jeder Versuch, eine
solche Liste anzulegen.**

`[cmd]` **Und es liegt keine im Bestand** — **der Weg wurde nie
begangen.**

## Warum es zaehlt

`[read]` **C-408 hat den Ursprung bewusst eingefuehrt:** *,,Neuer
eigener Listenursprung: `nutrition_reorder`."*

`[read]` **Er steht in einem CHECK und fehlt im anderen** — **die
Aenderung hat nur die Haelfte erwischt.**

`[read]` **Dieselbe Klasse wie ein CHECK-Wert ohne Schreibweg
(G-337)** — **nur umgekehrt: hier gibt es den Schreibweg, aber der
Wert wird abgelehnt.**

## Zu tun

`[read]` **Den zweiten CHECK nachziehen** — **und pruefen, ob es
weitere Stellen gibt, die die vier alten Werte aufzaehlen.**

`[cmd]` **Und eine Gegenprobe:** **eine `nutrition_reorder`-Liste
anlegen und wieder entfernen.**

## Auftrag — der halbe CHECK und zwei Lesewege

**Mitbeauftragt: G-279, C-31.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-409 — `nutrition_reorder` ist unerreichbar

`[cmd]` **Zwei CHECKs auf `shopping_lists.source_type`:**

    shopping_lists_source_target_check   kennt nutrition_reorder
    shopping_lists_source_type_check     kennt ihn NICHT

`[read]` **Beide muessen halten** — **jeder Versuch faellt.**

`[cmd]` **Und es liegt keine Liste dieser Art im Bestand** — **der
Weg wurde nie begangen.**

`[read]` **Den zweiten CHECK nachziehen** — **und pruefen, ob weitere
Stellen die vier alten Werte aufzaehlen.**

`[read]` **Gegenprobe:** **eine `nutrition_reorder`-Liste anlegen und
wieder entfernen.**

### 2 · G-279 — der Leseweg fuer *haeufig erfasst*

`[cmd]` **Claude Code hat gemessen: 388 Posten in den Browser gegen
4 Zeilen aus einer Sicht** (E-52).

`[cmd]` **Und G-328 hat die Zaehlweise entschieden: Tage, nicht
Eintraege.** `[cmd]` **Olivenoel: 52 Eintraege an 30 Tagen.**

`[read]` **Bau die Sicht** — **haeufigste Position je Nutzer, in
Tagen gezaehlt.**

`[cmd]` **Und beachte G-348:** **manuelle Posten tragen keine
`food_id`** — **sie duerfen nicht still uebersprungen werden.**

`[read]` **Die Kachel selbst ist ein UI-Auftrag** — **melde, was sie
braucht.**

### 3 · C-31 — der Schreibweg fuer die Kuration

`[cmd]` **Du hast die drei Teile gemessen:** serverseitige
Admin-Mutation, Overlay-Upsert, Lesen ueber `food_tags_effective`.

`[cmd]` **Der dritte steht seit C-366.**

`[read]` **Bau die ersten beiden** — **die Oberflaeche ist ein
UI-Auftrag.**

`[cmd]` **`food_tags_kuriert` traegt `food_id`, `tag_code`,
`action`** — **`removed` ueberdeckt auch einen erneuten Import.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    nutrition_reorder   Liste angelegt und entfernt, belegt
    weitere Stellen     gezaehlt
    Sicht               vier Zeilen statt 388 Posten, gemessen
    manuelle Posten     nicht uebersprungen, belegt
    Kuration            Admin-Mutation und Upsert, RLS in beide
                        Richtungen

## Bericht

**Stand 2026-09-05 — gebaut und lokal eingespielt.** `apps/`,
Migrationen, Dev-Server, Stage, Commit und Push blieben unberuehrt.

### C-409 — beide CHECKs lassen Nutrition-Nachbestellung zu

`[cmd]` **`407_shopping_lists_and_food_inventory.sql` ersetzt jetzt
auch `shopping_lists_source_type_check`.** Seine Werteliste und
`shopping_lists_source_target_check` enthalten beide
`nutrition_reorder`; die Suche nach den alten Wertelisten fand keine
weitere Stelle im Pipelinebestand.

`[cmd]` **Die Gegenprobe wurde wirklich geschrieben und entfernt:**
eine Liste `C409 Gegenprobe 2026-09-05` mit
`source_type = nutrition_reorder` wurde angelegt, erhielt eine UUID,
anschliessend gezielt entfernt. Die getrennte Nachmessung liefert
**0** verbliebene Probereihen.

### G-279 — eine Sicht statt 388 Browser-Posten

`[cmd]` **`nutrition.frequent_food_positions` liefert je Nutzer und
Mahlzeitart genau eine Position der letzten 30 Kalendertage.**
`days_used` zaehlt verschiedene `entry_date`; `entry_count` bleibt nur
als Diagnose sichtbar. Der Nenner `days_with_meal_type` zaehlt die
Tage, an denen diese Mahlzeitart vorkam.

`[cmd]` **Fuer `dev@lumeos.app`, 2026-08-07 bis 2026-09-05, sind es
vier Zeilen:** Fruehstueck *Ei (roh)* 26 von 30, Mittag *Olivenoel*
26 von 30, Abend *Olivenoel* 26 von 30, Snack *Vollkornbrot* 11 von
30. Die zwei Olivenoel-Zeilen ergeben zusammen die 52 Eintraege aus
G-328, ohne sie als 52 Tage auszugeben.

`[cmd]` **Manuelle Posten werden nicht uebergangen:** Die
Wirkungsprobe legte einen Item ohne `food_id` mit
`food_source = manual` an; die Sicht lieferte ihn mit `days_used = 1`
und `days_with_meal_type = 1`. Ihr Positionsschluessel ist der
normalisierte, gespeicherte Name; BLS und Custom-Foods bleiben an
ihren IDs gruppiert.

`[read]` **Die spaetere Kachel braucht nur eine Select-Abfrage auf die
Sicht** (`meal_type`, Quelle/IDs, `food_name`, `days_used`,
`days_with_meal_type`, `entry_count`, `last_logged_on`). Sie bleibt ein
UI-Auftrag.

### C-31 — enger serverseitiger Admin-Schreibkanal

`[cmd]` **`nutrition.curate_food_tag(food_id, tag_code, action)` ist
eine `SECURITY DEFINER`-RPC mit leerem Suchpfad.** Sie verlangt
`public.is_admin()` (ausschliesslich JWT-`app_metadata`), validiert
Lebensmittel, Tag und `set|removed` und schreibt dann den gezielten
Upsert nach `food_tags_kuriert`.

`[cmd]` **Die Rechte bleiben eng:** `authenticated` darf die RPC
ausfuehren, hat aber kein direktes `INSERT` auf das Overlay. Die
Gegenprobe weist Nicht-Admin ab; als Admin ueberdeckt `removed` einen
vorhandenen Import-Tag in `food_tags_effective` (0 effektive Zeilen).
Der Test rollt seine Probe zurueck.

`[cmd]` **Gegen die Auftragsannahme ist C-366 im aktuellen Bestand
nicht mehr vollstaendig angeschlossen:** Seine bestehende Validierung
erwartet drei Leser von `food_tags_effective`, misst aber **1**.
`preference_search_preview` liest die Sicht; `food_search` und
`refresh_food_preference_search_targets` lesen wieder
`food_tags`. Diese beiden spaeteren Leser wurden hier nicht
still geaendert — sie sind ein eigener Rueckfallbefund gegen den
angeblich bereits gebauten dritten Teil.

### Nachweise

`[cmd]` **Rot vor Gruen:** Vor der Umsetzung schlugen alle drei neuen
Wirkungsproben fehl (CHECK, Sicht, RPC fehlten). Danach:

    pnpm exec tsx --test supabase/_pipeline/_validierung/
      nutrition-c409-reorder-frequent-curation.test.ts      3 gruen
    pnpm exec tsx --test supabase/_pipeline/_validierung/
      nutrition-c407-shopping-lists-and-c408-inventory.test.ts
                                                               2 gruen
    node tools/schemafreigabe-pruefen.mjs                      gruen
    node tools/migration-datenlogik-pruefen.mjs                gruen

`[cmd]` **Nicht gruen, vorbestehend und nicht von diesem Schritt
veraendert:** `nutrition-c366-curated-food-tags.test.ts`
erwartet drei effektive Leser, findet einen; `pnpm ladekette` meldet
in `apps/web/src/app/nutrition/page.tsx` 17 serielle Abfragen bei
einer geduldeten Grenze von 10. `apps/` blieb unveraendert.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

### Beide CHECKs kennen ihn jetzt

`[cmd]` **Selbst gemessen:**

    shopping_lists_source_target_check   kennt nutrition_reorder
    shopping_lists_source_type_check     kennt nutrition_reorder

`[cmd]` **Gegenprobe angelegt, gezielt entfernt, danach 0
Probereihen.**

`[read]` **Der Weg ist begehbar und der Bestand sauber** — **genau
so, wie es sein soll.**

### G-279 — die Sicht traegt vier Zaehlungen

`[cmd]` **`nutrition.frequent_food_positions`, zehn Spalten, 16
Zeilen.**

    days_used             Tage mit diesem Posten
    days_with_meal_type   Tage mit dieser Mahlzeitart
    entry_count           Eintraege
    last_logged_on        zuletzt

`[read]` **Er liefert beide Zaehlweisen nebeneinander** — **Tage und
Eintraege.** `[read]` **Damit ist G-328 belegt und die Kachel kann
zeigen, was sie zeigt.**

`[cmd]` **Und je Nutzer UND Mahlzeitart** — **das ist genauer als
mein Auftrag.** `[read]` **Ich schrieb *haeufigste Position je
Nutzer*** — **er hat gesehen, dass *Olivenoel zum Fruehstueck* etwas
anderes ist als *Olivenoel zum Abendessen*.**

`[cmd]` **Manuelle Posten bleiben enthalten** — **G-348
beruecksichtigt.**

### C-31 — der Schreibweg mit Rechteschranke

`[cmd]` **`nutrition.curate_food_tag(p_food_id, p_tag_code,
p_action)`.**

`[cmd]` **Nicht-Admins abgewiesen, keine direkten Schreibrechte fuer
`authenticated`.**

`[read]` **Die Schranke liegt in der Datenbank, nicht in der
Oberflaeche** — **dieselbe Entscheidung wie bei `shopping_lists`
ohne DELETE.**

### Und ein Befund, den er gemeldet statt versteckt hat

`[cmd]` **Der C-366-Test ist fachlich rot:** **nur
`preference_search_preview` liest `food_tags_effective`,
`food_search` und `refresh_food_preference_search_targets` lesen
wieder `food_tags`.**

`[read]` **C-366 hatte alle drei umgestellt** — **zwei sind
zurueckgefallen.**

`[read]` **Und es ist jetzt schlimmer als vorher:** `[cmd]`
**`curate_food_tag` schreibt seit heute in die Overlay-Tabelle** —
**die Kuration entsteht, und zwei von drei Lesern ignorieren sie.**

`[read]` **Dieselbe Suche liefert je nach Weg andere Tags.** **Als
C-410.**

`[cmd]` **Und `pnpm ladekette` bleibt an 17 seriellen Abfragen in
`apps/web` rot** — **ausserhalb dieses Auftrags.**

**Abgenommen.**

