# C-73 — Muskelgruppen-Kuration

Stand: 2026-08-18

## Ergebnis

[cmd] Vor dem Schritt standen live 107 `training.muscle_groups` und 6.624 `training.exercise_muscles`-Zeilen.

[cmd] Nach `supabase/_pipeline/10_training/107_muscle_groups_hierarchy.sql` stehen live 96 Muskelgruppen, 6.624 Zuordnungen, 0 Waisen und 89 gesetzte `parent_id`-Beziehungen.

[cmd] `schema-vollstaendigkeit-pruefen.ts` meldet live `training.muscle_groups 96 / 96 ok`, `training.exercise_muscles 6624 / 6624 ok` und insgesamt `SCHEMA VOLLSTAENDIG`.

[cmd] `testdaten-pruefen.ts` meldet live `OK: C-82 Testdaten stimmen`, inklusive 9 Trainingssitzungen, 18 Trainingsuebungen und 60 Saetzen.

[cmd] `pnpm gate` ist gruen: 8/8 Turbo-Tasks erfolgreich.

## Woher die 107 stammen

[read] `101_training_seed.sql` beschreibt als Quelle `backup/legacy-v2/training/{exercises,muscle_groups,equipment}.json`. Die Muskelgruppen sind also Legacy-Importdaten, keine von LumeOS fachlich kuratierte Taxonomie.

[read] `100_training_schema.sql` legte `training.muscle_groups` bisher nur mit `name`, `body_region` und `display_order` an. Es gab kein Elternfeld und keine Anzeigeebene.

[read] `docs/specs/Training/SPEC_02_ENTITIES.md` und `SPEC_06_DATABASE_SCHEMA.md` fuehren `parent_id UUID FK -> self`. Die Hierarchie war also in der Spec vorgesehen, aber im gebauten Schema nicht vorhanden.

[annahme] Deshalb ist die Kuration eine Schicht neben dem Importnamen: `name` bleibt Quelle, `name_display_en` ist die Anzeige, `parent_id` bildet die Taxonomie.

## Was die vier bestehenden Schritte schon geleistet haben

[read] `102_plural_merge.sql` fuehrte drei Singular/Plural-Dubletten zusammen und hielt die Zuordnungen bei 6.625.

[read] `103_calvicular_merge.sql` korrigierte `Calvicular Head` zu `Clavicular Head` und hielt 108 Gruppen.

[read] `104_body_region.sql` fuellte fehlende `body_region`-Werte und benannte bereits vier falsche Regionen als offen: `Biceps Femoris`, `Rectus Femoris`, `Tensor Fasciae Latae`, `Hip Rotators`.

[read] `105_mideus_merge.sql` fuehrte `Gluteus Mideus` zu `Gluteus Medius`; danach standen 107 Gruppen und 6.624 Zuordnungen.

[read] Die Vorgänger-Skripte `cleanup-muscle-groups.sql` und `cleanup-muscle-groups-v2.sql` loesen teilweise Einzelmuskeln in Sammelgruppen auf, etwa Rotatorenmanschetten-Muskeln in `Rotator Cuff`. Das wurde hier nicht uebernommen, weil Tom die einzelnen Muskeln weiterhin fuehren und nur fuer Grafik/Listen aggregieren will.

## Was zusammengefuehrt wurde und warum

[cmd] Vor dem Merge gab es fuer alle elf Paare 0 Kollisionen gleicher Uebung und gleicher Rolle. Deshalb konnte `exercise_muscles` umgehangen werden, ohne Zuordnungen zu verlieren.

[cmd] Zusammengefuehrt wurden:

| von | nach | Grund |
|---|---|---|
| `Rotator Cuff Muscles` | `Rotator Cuff` | Dublette |
| `Back Muscles` | `Back` | Dublette |
| `Core Muscles` | `Core` | Dublette |
| `Upper Back Muscles` | `Upper Back` | Dublette |
| `Middle Back` | `Mid Back` | Schreibvariante |
| `Traps` | `Trapezius` | Kurzform |
| `Lats` | `latissimus dorsi` | Kurzform |
| `triceps brachii` | `Triceps` | fachlicher Name gegen gebraeuchliche Gruppe |
| `Side abdominals` | `Obliques` | Alias |
| `Rear Shoulders` | `Rear Deltoids` | Alias/ueberschneidende Anzeige |
| `Forearm Muscles` | `Forearms` | Dublette |

[cmd] Nach dem Schritt sind 0 der elf alten Namen noch in `training.muscle_groups`.

[cmd] Regionskorrekturen: `Biceps Femoris`, `Rectus Femoris`, `Tensor Fasciae Latae` und `Hip Rotators` stehen jetzt in `legs`; `Rear Deltoids` steht in `shoulders`.

[cmd] Unter einer strengen Definition bleiben 6 der 107 Ursprungsgruppen unveraendert: `Arms`, `Back`, `Chest`, `Core`, `Legs`, `Shoulders`. Alle anderen wurden zusammengefuehrt, bekamen einen Parent, eine Anzeigeform oder eine Regionskorrektur.

## Ob die Struktur die drei Ebenen traegt

[cmd] Drei belegte Hierarchie-Beispiele:

| Parent | Kinder |
|---|---|
| `Rotator Cuff` | `Infraspinatus`, `Subscapularis`, `Teres Minor` |
| `Deltoids` | `Front Shoulders`, `Rear Deltoids` |
| `Quadriceps` | `Rectus Femoris` |

[cmd] Die Struktur hat 89 Parent-Beziehungen. Damit traegt sie die geplanten drei Ebenen Flaeche -> Gruppe -> Muskel grundsaetzlich: Sammelgruppen koennen Eltern sein, Einzelmuskeln bleiben eigene Zeilen.

[annahme] Die Zuordnung auf die 15 Kartenflaechen ist damit noch nicht erledigt. G-49 muss weiterhin entscheiden, welche kuratierten Gruppen auf welche Grafikflaechen gemappt werden.

## Was dieser Schritt nicht tut

[read] Keine Uebung und keine `exercise_muscles`-Zeile wurde geloescht; der Nachweis ist die stabile Zuordnungszahl 6.624.

[read] Es wurden keine neuen Muskeln erfunden. Fehlende Muskeln wie `tibialis`-Feinaufteilungen bleiben offen, wenn sie nicht in der Quelle stehen.

[read] Keine Oberflaeche wurde gebaut oder geaendert.

## E-14 bis E-19: Was je Punkt gemessen wurde

[cmd] Vor dem Restschritt standen live 1.416 `training.exercises`, 96 `training.muscle_groups`, 6.624 `training.exercise_muscles`, 0 Waisen auf Gruppen und 0 Waisen auf Uebungen.

[cmd] E-17: `Achilles Tendon` war genau 1 Muskelgruppe mit genau 1 Zuordnung: `Standing gastrocnemius stretch` -> `Achilles Tendon` als `secondary`. Dieselbe Uebung hatte `Calves` bereits als `primary`.

[cmd] E-18: `lower(name) = 'none'` lieferte 0 Muskelgruppen. Der Fehler ist im aktuellen Bestand nach C-73 nicht mehr vorhanden.

[cmd] E-15: Die fuenf in C-73/104 benannten Regionsfaelle sind nach dem Schritt korrekt: `Biceps Femoris`, `Rectus Femoris`, `Tensor Fasciae Latae` und `Hip Rotators` stehen in `legs`; `Rear Deltoids` steht in `shoulders`.

[cmd] E-19: 35 Paare hatten dieselbe Uebung und dieselbe Muskelgruppe gleichzeitig als `primary` und `secondary`. Die betroffenen Uebungen waren unter anderem `Band Deadlift`, `Dumbbell Reverse Fly`, `Cable twist`, `Lying leg raise`, mehrere Band-Hip-Abduction-Varianten und `Straight bar cable pull down`.

[cmd] E-14: 26 `image_male_start`-Eintraege in `training.exercises.media_paths` zeigen auf Pfade mit `_Female.` im Dateinamen. `image_male_end` lieferte im aktuellen JSONB-Pfadmuster 0 solche Treffer.

[cmd] Nach `supabase/_pipeline/10_training/108_exercise_curation_rest.sql` stehen live 1.416 Uebungen, 95 Muskelgruppen, 6.588 Zuordnungen, 0 Waisen, 0 `Achilles Tendon`, 0 `none`/`None` und 0 Primary/Secondary-Doppelrollen.

[cmd] Der Kettenlauf ueber `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts` lief gegen die Wegwerf-Datenbank `lumeos_kette_20260818045508` gruen durch. Schritt 108 meldete dort: `OK: 1416 Uebungen, 95 Gruppen, 6588 Zuordnungen, 0 Waisen, 0 Doppelrollen`.

[cmd] Live danach: `schema-vollstaendigkeit-pruefen.ts` meldete `SCHEMA VOLLSTAENDIG`, `training.muscle_groups 95 / 95 ok` und `training.exercise_muscles 6588 / 6588 ok`. `testdaten-pruefen.ts` meldete `OK: C-82 Testdaten stimmen`. `pnpm gate` lief mit 8/8 Tasks gruen.

## Was `fix_muscles.sql` schon geloest hat

[read] `referenz/lumeos-2026/fix_muscles.sql` ist ein automatisch erzeugter Zuordnungsseed: Kopfzeile `Auto-generated muscle group assignments for 349 exercises`, danach wiederholte `INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES`-Bloecke je Ordner.

[read] Das Skript loest die heutige Restkuration nicht direkt: es arbeitet gegen das alte Schema und alte IDs, nicht gegen `training.exercises`/`training.muscle_groups` in dieser Pipeline. In der gezielten Suche fanden sich keine direkten Regeln fuer `Achilles`, `none`, `body_region` oder `image_male_*`.

[annahme] Fachlich bestaetigt es aber den Zuschnitt: Muskelzuordnungen wurden im Vorgaengerrepo bereits als eigene Zuordnungsschicht behandelt, nicht als freie Anzeige aus dem Uebungsnamen.

## Umbenannt oder übersetzt

[read] Die Herkunft bleibt wie in C-73: `101_training_seed.sql` importiert Legacy-Daten; deshalb wird nicht der Quellname als angebliche Originalwahrheit umgeschrieben, sondern die Kuration liegt in nachgelagerten Schritten.

[cmd] In Schritt 108 wurde kein Name uebersetzt und keine Uebung umbenannt. `Achilles Tendon` wurde entfernt, weil es eine Sehne ist und keine Muskelgruppe. Die einzige betroffene Uebung bleibt ueber `Calves`, `Hamstrings`, `Semimembranosus`, `Semitendinosus` und `Soleus` weiterhin zugeordnet.

[cmd] Die 35 E-19-Zeilen wurden nicht zusammengefuehrt, sondern die jeweils niedrigere Rolle `secondary` wurde entfernt, wenn fuer dasselbe `(exercise_id, muscle_group_id)` bereits `primary` existierte. Das verhindert doppelte Belastungszaehlung in der Muskelkarte.

## Was offen bleibt

[cmd] E-14 bleibt offen: 26 maennliche Startbild-Pfade zeigen auf `_Female`-Dateien. Es wurden keine Bilder erzeugt, umbenannt oder ersetzt.

[annahme] E-14 beruehrt die Produktfrage aus E-07: Fehlen maennliche Darstellungen, oder sind die Pfadfelder falsch befuellt? Diese Entscheidung gehoert nicht in die Datenbank-Kuration.

[annahme] Die Struktur traegt die drei Ebenen Flaeche -> Gruppe -> Muskel weiterhin. Belegt sind Rotatorenmanschette, Deltoids und Quadrizeps; die eigentliche Zuordnung auf die Kartenflaechen bleibt G-49.
