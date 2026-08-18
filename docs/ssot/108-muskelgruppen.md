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

