# Nutrition Preferences

**Stand:** 2026-08-17

## Ausgang

`[cmd]` `nutrition.food_preferences` und
`nutrition.food_preference_items` existieren seit Kettenschritt `050`.
Beide Tabellen tragen Zeilenschutz und vier Owner-Policies; vor diesem
Durchgang waren sie leer und hatten keine angebundene RPC-Schicht.

`[read]` `docs/specs/Nutrition/04_adrs/ADR_NUTRITION_PREFERENCES_V1.md`
ist final und beschreibt vier Wirkstufen: `hard`, `strong`, `soft`,
`boost`. Die Wirkung gehoert laut ADR in Suche, Suggestions und MealCam.

`[cmd]` `nutrition.food_search` liegt in `073_suchfilter.sql`. Die
Funktion nutzt bestandsweite Werte wie `sort_weight`; sie hat heute
keinen Nutzerparameter und liest keine Preference-Tabellen.

`[read]` Im Vorgaengerrepo existiert eine Schnittstelle unter
`referenz/lumeos-2026/src/api/nutrition/routes/food-preferences.ts`.
Das Schema dort heisst `user_food_preferences` und passt nicht direkt:
dieses Repo trennt `food_preferences` und `food_preference_items` und
arbeitet mit RLS im Schema `nutrition`.

## Umsetzung

`[cmd]` Neuer Kettenschritt `074`:
`supabase/_pipeline/07_lesefunktionen/074_preferences_api.sql`.

`[cmd]` Der Schritt erzeugt zwei Funktionen:

- `nutrition.food_preferences_read(user_id)`
- `nutrition.food_preferences_write(user_id, preferences, items)`

`[cmd]` Beide Funktionen sind `SECURITY INVOKER`. Die Zugriffskontrolle
bleibt damit bei Tabellenrechten, Constraints, Fremdschluesseln und
RLS-Policies; es gibt keine Definer-Umgehung.

`[cmd]` `food_preferences_read()` liefert die Basiszeile, alle
Preference-Items mit Labels und eine vorbereitete Struktur
`search_application` mit `hard`, `strong`, `soft`, `boost`. Diese
Struktur ist die Datenseite fuer die spaetere Suche; `food_search`
wurde nicht veraendert.

`[cmd]` `food_preferences_write()` upsertet die Basiszeile und ersetzt
die Items atomar. Die Unique-Indizes aus `054` bleiben der
Duplikatschutz.

`[cmd]` `kette-readme-pruefen.ts` meldet:
`README/Kette: ok (46 Schritte dokumentiert)`.

`[cmd]` Wegwerf-Kettenlauf ueber `kette-ausfuehren.ts`:
`KETTE OK: 37.3s`, Abschlusspruefung `SCHEMA VOLLSTAENDIG`,
Funktionen `20/20 vorhanden`.

`[cmd]` Live eingespielt am 2026-08-17. `information_schema.routines`
meldet `food_preferences_read = 1` und `food_preferences_write = 1`.

## Abgleich Tabelle gegen ADR

| ADR-Feld | Heutiger Stand |
|---|---|
| `diet_type` | `[cmd]` vorhanden in `food_preferences` |
| `allergies[]` | `[cmd]` vorhanden |
| `intolerances[]` | `[cmd]` vorhanden |
| `preferred_cuisines[]` | `[cmd]` vorhanden |
| `excluded_foods[]` | `[cmd]` keine Array-Spalte; modellierbar als `food_preference_items` mit `target_type='food'` und `strength='hard_exclude'` |
| `preferred_foods[]` | `[cmd]` keine Array-Spalte; modellierbar als `food_preference_items` mit `target_type='food'` und `strength='boost'` |
| `religious_dietary` | `[cmd]` keine eigene Spalte; allenfalls als `general_exclusions` oder Item-Preset modellierbar, aber nicht eindeutig |
| `religious_is_hard` | `[cmd]` keine eigene Spalte; Haerte steckt bei Items in `strength` |
| `meal_slots` | `[cmd]` nicht vorhanden; vorhanden sind `meals_per_day` und `snacks_per_day` |
| `cooking_skill` | `[cmd]` vorhanden |
| `prep_time_max_min` | `[cmd]` vorhanden |
| `budget_level` | `[cmd]` vorhanden |
| `preference` | `[cmd]` vorhanden in `food_preference_items`: `liked`, `disliked`, `hard_exclude` |
| `target_type` | `[cmd]` vorhanden: `food`, `category`, `tag`, `cuisine`, `exclusion_preset`, `catalog_item` |
| `severity` | `[cmd]` heisst im Ist-Schema `strength`: `hard_exclude`, `strong_avoid`, `soft_dislike`, `neutral`, `like`, `boost` |
| `source` | `[cmd]` vorhanden |
| `food_id/category_id/tag_code` | `[cmd]` vorhanden, inklusive FKs fuer Food, Kategorie und Tag |

`[annahme]` Die ADR ist fachlich leitend, aber das Ist-Schema hat V1
bereits anders normalisiert: direkte Food-Arrays wurden durch
`food_preference_items` ersetzt, und `severity` heisst `strength`.

## Testdaten

`[cmd]` `testdaten-einspielen.ts` schreibt jetzt fuer Tom Miller eine
Basis-Praeferenz und drei Items ueber `food_preferences_write()`:

| Stufe | Ziel |
|---|---|
| `hard` | Tag `contains_nuts` |
| `soft` | Kategorie `Kekse & Plätzchen` |
| `boost` | Food `C352000` / `Weißer Reis (roh)` |

`[cmd]` Live-Stand nach Seed: `food_preferences = 1`,
`food_preference_items = 3`.

`[cmd]` `testdaten-pruefen.ts` prueft jetzt zusaetzlich, dass
`food_preferences_read()` fuer Tom je einen Eintrag in `hard`, `soft`
und `boost` liefert. Ergebnis: `Preferences/Items: 1/3`,
`OK: C-82 Testdaten stimmen.`

## Zeilenschutz

`[cmd]` Als Rolle `authenticated` mit Toms JWT-Sub liefert
`food_preferences_read(Tom)` einen `hard`-Eintrag.

`[cmd]` Derselbe Aufruf fuer Max mit Toms JWT-Sub liefert keinen
fremden `hard`-Eintrag.

`[cmd]` Eine eigene Schreibtransaktion fuer Tom ist im Rollback
erfolgreich. Eine Schreibtransaktion fuer Max mit Toms JWT-Sub wird
blockiert: `sqlstate=42501`.

## Wo die vier Stufen ansetzen muessten

`[cmd]` `sort_weight` ist bestandsweit. Nutzerpraeferenzen duerfen ihn
nicht veraendern; sie muessen zur Laufzeit auf die Ergebnismenge
addiert werden.

`[annahme]` `hard` gehoert in die WHERE-Logik von `food_search`, und
zwar an beiden Stellen: `matching_foods` und `all_matching_food_ids`.
Sonst waere die Liste gefiltert, aber `total` falsch. Bei `hard` duerfen
Treffer nicht angezeigt und nicht vorgeschlagen werden.

`[annahme]` `strong` braucht eine Unterscheidung zwischen Vorschlag und
ausdruecklicher Suche. In einer leeren Browse-/Suggestion-Suche wird
ausgeschlossen; bei expliziter Nutzeranfrage darf sichtbar bleiben.
Diese Entscheidung passt heute nicht sauber in die Signatur von
`food_search`, weil die Funktion nicht weiss, ob ein Treffer ein
Vorschlag oder eine ausdrueckliche Suche ist.

`[annahme]` `soft` gehoert als negativer Laufzeit-Score in die
Sortierung, nach der fachlichen Relevanz und vor oder neben
`sort_weight`. Der Wert darf die Sichtbarkeit nicht entfernen.

`[annahme]` `boost` gehoert als positiver Laufzeit-Score in dieselbe
Stufe wie `soft`. Direkte Food-Likes sollten staerker wirken als
Kategorie- oder Tag-Likes, wie die ADR es vorgibt.

`[annahme]` Fuer die spaetere Umsetzung braucht `food_search` mindestens
einen Nutzerkontext oder eine vorgeladene Preference-Struktur. Ein
implizites Lesen von `auth.uid()` in der Suchfunktion waere moeglich,
aber fuer Tests, Service-Role-Messungen und reproduzierbare Suchlaeufe
schlechter als ein expliziter Parameter.

## Was `hard` bei unvollstaendiger Allergenmarkierung bedeutet

`[cmd]` Allergen-Tags sind positiv markiert:
`contains_nuts = 120`, `contains_gluten = 622`,
`contains_lactose = 1.021`.

`[read]` C-44 hat diese Umkehrung bewusst entschieden: "enthaelt
Nuesse" ist aus Name/Kuration belegbar; "enthaelt keine Nuesse" ist aus
dem Schweigen des Bestands nicht belegbar.

`[annahme]` Ein harter Ausschluss auf `contains_nuts` blendet sicher
markierte Nuss-Eintraege aus. Er beweist aber nicht, dass die uebrigen
7.020 Lebensmittel nussfrei sind. Ein nicht markierter Eintrag ist
ungeprueft, nicht sicher.

`[annahme]` Fuer Allergien ist das ein Produkt- und Haftungsproblem:
Der Filter kann die Suche vereinfachen, aber er darf nicht als
Sicherheitsaussage formuliert werden. Wenn Tom `hard` fuer Allergien in
der Suche aktiviert, muss die Oberflaeche diesen Unterschied sichtbar
machen oder die Datenbasis weiter kuratieren.

`[annahme]` Die andere Richtung ist ebenfalls moeglich: ein falsch
positiv markierter Eintrag verschwindet vollstaendig. Deshalb muessen
Allergen-Tags kuratiert und pruefbar bleiben; Regex-Ableitung allein
reicht fuer `hard` nicht.

## Was dieser Schritt nicht tut

`[read]` Die Oberflaeche bleibt eine Attrappe; der Auftrag baut keine
Preferences-Seite.

`[cmd]` `food_search` wurde nicht geaendert. Die neue Leseschicht legt
nur offen, wo `hard`, `strong`, `soft` und `boost` spaeter ansetzen
muessten.

`[annahme]` Cuisine-, Exclusion-Preset- und Catalog-Item-Codes haben
weiterhin keine Datenbankkataloge. Die Tabellen erlauben die Zieltypen,
aber ein Tippfehler in freien Codes ist fachlich noch nicht durch eine
FK abgesichert.
