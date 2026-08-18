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

## C-83: Wie viele Uebungen ihre Zeile finden

[cmd] `media/exercises/katalog/1500+ exercise data.xlsx` hat 2.343 Zeilen mit `Exercise`. Gefuellt sind: `Exercise Instructions (step by step)` 1.748, `Exercise Tips` 1.744, `Primary Activating Muscles` 1.743, `Secondary Activating Muscles` 1.743, `Equipment` 1.645 und `Categories` 1.520.

[cmd] Gegen 1.416 `training.exercises` liefert der Match auf den Namen nach Abzug von `_Male`/`_Female`: 1.338 eindeutig eindeutige Zeilen, 77 Namen mit mehreren XLSX-Zeilen und 1 fehlenden Namen. Der fehlende Name ist `MAJOR GROUPS Muscle body`.

[cmd] Die 77 Mehrfachtreffer wurden geprueft: 62 haben in allen relevanten XLSX-Feldern identischen Inhalt, 7 haben genau eine gefuellte Quellzeile und 8 bleiben inhaltlich mehrdeutig. Damit sind 1.407 Uebungen sicher anreicherbar; 8 werden bewusst nicht importiert.

[cmd] Die 8 mehrdeutigen Faelle sind: `Barbell bulgarian split squat`, `Barbell Deadlift High Pull`, `Calf raise leg press machine`, `Calf raise on hack squat machine`, `Resistance Band Calf Press Sitting on Chair`, `Resistance band face pull`, `Resistance Band Kneeling Cross Body Single Straight Arm Supinated Pulldown`, `Resistance Band Lying Hyperextension Abduction`.

[cmd] Die erwarteten Scheitergruende Grossschreibung, doppelte Leerzeichen, Klammern und Bindestriche erklaeren im aktuellen Bestand fast keine DB-Trefferluecke. Nach Normalisierung von Grossschreibung und Leerraum bleibt derselbe eine fehlende DB-Name; der eigentliche Befund sind doppelte Quellzeilen in der XLSX.

## C-83: Was die 462 sind

[cmd] Reproduzierbar mit dieser XLSX und dem aktuellen Bestand: 1.876 normalisierte XLSX-Uebungsnamen nach Suffixabzug, davon 461 nur in der Datei und nicht in `training.exercises`. Diese 461 Schluessel entsprechen 781 XLSX-Zeilen; 217 davon tragen eigene Instructions.

[cmd] Die Differenz zur Ausgangszahl 462 kommt aus der Normalisierung: `training.exercises` hat eine Uebung, die die XLSX nicht findet (`MAJOR GROUPS Muscle body`), waehrend die XLSX nach Leerraum-/Case-Normalisierung 461 zusaetzliche Schluessel hat.

[cmd] Stichproben der XLSX-only-Gruppe sind Varianten und Spezialuebungen wie `180 jump turns`, `4 corners side step`, `abs snails`, zahlreiche `agility ladder ...`-Varianten, `air swing ...`-Varianten und `alternate biceps curl resistance band`.

[annahme] Damit ist nicht entschieden, ob diese 461 absichtlich weggelassen wurden oder beim frueheren Import verloren gingen. Sie werden in C-83 nicht als neue Uebungen angelegt; dafuer braucht es eine eigene Entscheidung, weil sonst der Bestand 1.416 -> 1.877 springen wuerde.

## C-83: Woher `instructions` und `exercise_muscles` heute stammen

[read] `101_training_seed.sql` nennt als Quelle `backup/legacy-v2/training/{exercises,muscle_groups,equipment}.json`, nicht die XLSX. Der Seed befuellt `exercise_muscles` aus den Legacy-Arrays und sagt ausdruecklich: Arrays sind Quelle, Tabelle ist Struktur.

[cmd] Der aktuelle Bestand hat `instructions` bei 1.416/1.416 Uebungen und `tips` bei 1.412/1.416. Fuer `tips` gibt es aus der XLSX keinen fehlenden sicheren Nachtrag.

[cmd] Bei den Instructions gibt es 1 Abweichung: `Band close-grip biceps curl` unterscheidet sich nur in einem Zeichensatzartefakt um die `90`-Grad-Angabe (`90ТА` im Bestand gegen `90А` in der XLSX). Der Schritt ueberschreibt deshalb keine Instructions, sondern speichert `instructions_same_as_exercises=false` fuer diesen Fall.

[cmd] Bei den Tips gibt es 6 Abweichungen: `Band standing rear delt row`, drei `Bench Bulgarian Split Squats`-Varianten, `Doorway biceps curl` und `Dumbbell bicep curl to shoulder press`. Die sichtbaren Unterschiede sind Legacy-/Encoding-Artefakte wie `doesnā€™t` gegen `doesn’t` oder Alttext-Trunkierung. Der Schritt speichert `tips_same_as_exercises=false`, ueberschreibt aber keine Tips.

[annahme] Das spricht dafuer, dass der Legacy-Export aus derselben Exercise-Animatic-Quelle oder einer eng verwandten Fassung stammt. Deshalb wird `instructions`/`tips` nicht ueberschrieben; C-83 speichert nur die zusaetzlichen Quellfelder.

[cmd] `exercise_muscles` bleibt bei 6.588 Zuordnungen. Die XLSX-Muskelspalten werden nicht als neue Zuordnungstabelle eingespielt, sondern als Rohtext in `training.exercise_catalog_enrichment`: 1.403 sichere Matches tragen `Primary Activating Muscles` und 1.403 `Secondary Activating Muscles`.

## C-83: Was fuer deutsche Namen und Filter dasteht

[cmd] Die XLSX liefert keine deutschen Uebungsnamen. Sie liefert aber fuer Muskeln haeufig Alltagsname plus anatomischen Namen in einem Feld, etwa in der Form `Chest (Pectoralis major), Shoulders (Deltoids), Triceps (Triceps brachii)`. Das ist Vorarbeit fuer deutsche Anzeigenamen und Suche, aber noch keine deutsche Kuration.

[cmd] Geraete in der XLSX: 82 Rohwerte, nach konservativer Normalisierung 80. Bereinigt wurden nur belegte Schreibvarianten: `None` und `None (Bodyweight)` -> `None` (zusammen 470 Zeilen), `Ski Ergometer ` -> `Ski Ergometer`, `Ez Bar` -> `EZ Bar`, `chair` -> `Chair`. Kategorien: 4 Rohwerte, nach `bodyweight` -> `Bodyweight` bleiben 3.

[cmd] `training.equipment` hat 58 Eintraege. 25 kanonische XLSX-Geraetewerte stehen nicht in `training.equipment`, darunter `Dumbbells`, `Resistance Band`, `Suspension Trainer`, `Ski Ergometer`, `Cable Machine`, `Box`, `Treadmill` und `Elliptical Machine`. Umgekehrt stehen `Bands`, `Cable` und `Stability Ball` in `training.equipment`, aber nicht als kanonischer XLSX-Wert.

[annahme] Deshalb wird `training.equipment` nicht umgebaut. Die XLSX-Werte werden als `equipment_raw` und `equipment_canonical` in der Anreicherung festgehalten, damit die spaetere Uebungssuche und Filterkurierung eine belegte Quelle haben, ohne bestehende Foreign Keys zu verschieben.

## C-83: Nachweis

[cmd] Der Kettenlauf ueber `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_kette_c83_full_20260818` lief von leer gruen durch. Schritt 109 meldete: `OK: 1407 XLSX-Anreicherungen, 1416 Uebungen, 6588 Muskelzuordnungen, 0 Waisen, 1 Instruction-Abweichung(en), 6 Tip-Abweichung(en)`.

[cmd] Live nach dem Einspielen: `training.exercises` 1.416, `training.exercise_muscles` 6.588, `training.exercise_catalog_enrichment` 1.407, `enrichment_orphans` 0, `instruction_diff` 1, `tip_diff` 6.

[cmd] `schema-vollstaendigkeit-pruefen.ts` meldete live `SCHEMA VOLLSTAENDIG`, inklusive `training.exercise_catalog_enrichment 1407 / 1407 ok` und `Fremde Tab. 21/21 vollstaendig`.

[cmd] `testdaten-pruefen.ts` meldete live `OK: C-82 Testdaten stimmen.` `pnpm gate` lief gruen: 8/8 Turbo-Tasks erfolgreich.

## C-90: Wie die 58 Geraete auf Gruppen fallen

[read] `referenz/lumeos-2026/src/modules/training/components/ExerciseSearch.tsx` fuehrt vier Geraetegruppen: `Freie Gewichte`, `Kabel & Baender`, `Geraete & Baenke`, `Sonstiges`. Die Werte passen nicht 1:1 zum aktuellen Bestand (`Cable Machine` dort, `Cable Pulley Machine` hier; `None (Bodyweight)` dort, `None` hier), deshalb wurde zugeordnet statt kopiert.

[cmd] Vor C-90 standen live 58 flache `training.equipment`-Zeilen, 1.416 `training.exercises` und 6.588 `training.exercise_muscles`. `training.exercises.exercise_type` stand bei 1.416/1.416 auf `strength` und trug damit keine Filterinformation.

[cmd] `supabase/_pipeline/10_training/109a_equipment_groups_disciplines.sql` ergaenzt an `training.equipment` die Felder `name_de`, `equipment_group`, `equipment_group_de`, `equipment_group_en` und an `training.exercises` `discipline`, `discipline_rule`.

[cmd] Live nach dem Schritt:

| Gruppe | Geraete | Uebungen |
|---|---:|---:|
| Freie Gewichte | 8 | 1.056 |
| Kabel & Baender | 11 | 182 |
| Geraete & Baenke | 29 | 98 |
| Sonstiges | 10 | 80 |

[cmd] 58/58 Geraete haben einen deutschen Namen. Stichproben: `None` -> `Körpergewicht`, `Dumbbell` -> `Kurzhantel`, `Cable Pulley Machine` -> `Kabelzugmaschine`, `Bench` -> `Hantelbank`, `Jump rope` -> `Springseil`, `Yoga Mat` -> `Yogamatte`.

[cmd] `None` bleibt als Sonderfall unter `Freie Gewichte`, wie in der Vorgaenger-UI `None (Bodyweight)` unter derselben Gruppe stand. Es haengt an 527 Uebungen, also 37 Prozent des Bestands. Als Filter taugt es nur, wenn die UI es als `Körpergewicht` sichtbar macht und zusaetzlich die Disziplin `Bodyweight` anbietet.

## C-90: Nach welchen Regeln die Disziplin entsteht

[cmd] Die Regelreihenfolge ist bewusst spezifisch vor allgemein:

| Reihenfolge | Regel | Disziplin | Uebungen |
|---:|---|---|---:|
| 1 | Cardio-Geraet oder Cardio-Name (`Jump rope`, `Rowing Machine`, `Stationary Exercise Bike`, `Jumping jack`, `Skipping`) | Cardio | 9 |
| 2 | `stretch`, `mobility`, `foam roller`, `flexibility` im Namen | Stretching | 108 |
| 3 | Yoga-/Pose-Signal im Namen (`yoga`, `pose`, `chatarunga`, `cobra`, `setu bandhasana`, ...) | Yoga | 11 |
| 4 | `category = Bodyweight` oder Geraet `None` | Bodyweight | 511 |
| 5 | `category IN (Free Weights, Resistance)` | Strength | 777 |

[annahme] Wenn eine Uebung `Yoga Mat` nutzt, aber `stretch` im Namen traegt, gewinnt `Stretching`. Das Geraet ist Zubehoer; der Bewegungsname ist die staerkere fachliche Aussage. Deshalb entstehen keine Yoga-Matten-Falschpositiven bei Dehnuebungen.

[cmd] 0/1.416 Uebungen bleiben ohne Disziplin. Das liegt nicht an Raten, sondern daran, dass die Bestandskategorien `Bodyweight`, `Free Weights` und `Resistance` als letzte, breite Auffangregeln vollstaendig tragen.

## C-90: Was ohne Zuordnung bleibt

[cmd] 0/58 Geraete bleiben ohne Gruppe oder deutschen Namen. 0/1.416 Uebungen bleiben ohne Disziplin.

[cmd] `Sonstiges` enthaelt 10 Geraete und 80 Uebungen: `Yoga Mat` 40, `Ab Wheel` 11, `Stability Ball` 10, `Chair` 8, `Jump rope` 5, `Balance Board` 2, `Balloon` 1, `Couch` 1, `Rowing Machine` 1, `Stationary Exercise Bike` 1.

[cmd] Der Byteinhalt wurde nach dem Live-Einspielen geprueft: 0 Fragezeichen in `training.equipment.name_de` und `equipment_group_de`; `Körpergewicht`, `Geräte & Bänke` und `Kabel & Bänder` liegen als UTF-8 in der Datenbank.

## C-90: Ob die Gliederung als Filter taugt

[cmd] Die Gliederung traegt knapp genug fuer den Exercises-Tab: `Sonstiges` liegt bei 10/58 Geraeten und 80/1.416 Uebungen, also klar unter einem Drittel. Die starke Schieflage liegt nicht bei `Sonstiges`, sondern bei `None`/`Körpergewicht` mit 527 Uebungen.

[annahme] Fuer G-64 sollte `None` nicht als kryptischer Geraetename erscheinen, sondern als `Körpergewicht` und parallel ueber die Disziplin `Bodyweight` filterbar sein. Dann ist der grosse Block kein kaputter Geraetefilter, sondern ein erwartbarer Trainingsmodus.

[cmd] `training.exercises` bleibt bei 1.416 und `training.exercise_muscles` bei 6.588. Der Wegwerf-Kettenlauf `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_kette_c90_utf8_20260818` lief gruen; Schritt 109a meldete `OK: 58 Geraete gruppiert, 58 deutsche Namen, 1416 Disziplinen, 6588 Muskelzuordnungen, Sonstiges 10 Geraete/80 Uebungen`.

[cmd] Live danach: `schema-vollstaendigkeit-pruefen.ts` meldete `SCHEMA VOLLSTAENDIG`, `testdaten-pruefen.ts` meldete `OK: C-82 Testdaten stimmen`, `kette-readme-pruefen.ts` meldete `README/Kette: ok (64 Schritte dokumentiert)`, und `pnpm gate` lief gruen mit 8/8 Tasks.
