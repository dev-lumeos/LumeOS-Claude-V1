---
nr: G-352
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-222
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-07
  goal_type: 4
  difficulty_level: 5
  adr: 12
---

# G-352 — drei Zielskalen widersprechen sich

## Befund

Aus G-83, Claude Code, 2026-09-07.

`[cmd]` **Nachgemessen in `goals.user_goals`:**

    goal_type          body_composition, performance, health,
                       lifestyle                          -- 4
    difficulty_level   easy, moderate, challenging,
                       aggressive, unrealistic            -- 5

`[cmd]` **Der ADR nennt zwoelf Zielarten** — **sie passen zu keiner
der beiden Tabellen.**

`[cmd]` **11 Zeilen liegen im Bestand.**

## Warum es blockiert

`[read]` **Der Onboarding-Entwurf hat einen Schritt *Ziel
waehlen*.** `[read]` **Welche Skala er zeigt, ist nicht
entschieden.**

`[read]` **Und `goal_type` ist Pflicht** — **wer ein Ziel anlegt,
muss einen der vier Werte setzen.**

## Zu entscheiden

`[read]` **Welche Skala gilt?**

`[read]` **Die vier `goal_type`-Werte sind Kategorien** —
*Koerperzusammensetzung*, *Leistung*, *Gesundheit*, *Lebensstil*.

`[read]` **Die zwoelf des ADR sind vermutlich konkrete Ziele** —
*abnehmen*, *Muskeln aufbauen*, *Marathon*.

`[cmd]` **`subtype` steht daneben und ist optional** — **das koennte
der Ort fuer die zwoelf sein.**

`[read]` **Dann waeren es keine drei Skalen, sondern zwei Ebenen:**
**vier Kategorien, zwoelf Unterarten.**

`[read]` **Zu pruefen, bevor eine dritte entsteht.**

## Gemessen am 2026-09-06 (G-353)

**Die Pruefung, die dieser Punkt verlangt** — *,,zu pruefen, bevor
eine dritte entsteht"* — **ist gelaufen. Der Verdacht stimmt, und er
greift weiter.**

`[cmd]` **`subtype` ist `text`, nullable, OHNE CHECK** — eine freie
zweite Ebene. **Und schon belegt:** `cut`, `gain_muscle`,
`strength`, `training_capacity`, `cardio_frequency` unter den vier
`goal_type`.

`[cmd]` **Die zwoelf des ADR sind keine Zielarten, sondern PHASEN.**
**`goals.goal_phases.phase_type` steht live mit neun Werten:**
`fat_loss`, `lean_bulk`, `maintenance`, `recomp`, `contest_prep`,
`reverse_diet`, `expert_bb_annual`, `mini_cut`, `peak_week`.

`[cmd]` **Fuenf davon stehen woertlich in der Liste, aus der der ADR
zitiert** (`docs/BrainstormDocs/Core/auth_API.md:224`) — **und die
traegt FUENFZEHN Werte, nicht zwoelf.**

`[read]` **Jene Liste vermischt grob und fein** (`bulk` neben
`lean_bulk`). **Das laufende Schema hat genau das aufgeloest.**

`[cmd]` **Berichtigt: `difficulty_level` ist KEINE Zielskala**,
sondern die Schwierigkeit — eine Achse quer dazu. **Die Zahl 5 im
Kopf dieses Punktes zaehlt etwas anderes als die 4 und die 12.**

`[read]` **Es sind also vier Achsen, drei davon gebaut:**

    goal_type    WAS        4, CHECK, NOT NULL
    subtype      WELCHES    frei, kein CHECK
    phase_type   WIE        9, CHECK, live belegt
    variant      WIE STARK  frei, Vorgabe 'moderate'

**Was noch zu entscheiden bleibt, ist kleiner:**

    1  Bekommt `subtype` einen CHECK, oder bleibt er frei?
    2  Welche Achse setzt das Onboarding?
       (die Zielwerte lesen heute `profiles.nutrition_goal`,
        nicht `user_goals` - gemessen in G-83)

`[read]` **Keine Entscheidung ,,vier gegen zwoelf"** — **die Ebenen
existieren bereits.**

## Auftrag — vier Achsen, zwei Entscheidungen

**Mitbeauftragt: G-229, G-261.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-352 — was du gemessen hast, ausarbeiten

`[cmd]` **Du hast belegt: es sind vier Achsen, keine drei
widersprechenden Skalen.**

    goal_type          4 Werte, CHECK
    subtype            ohne CHECK, zweite Ebene
    phase_type         9 Werte -- die *zwoelf* des ADR
    difficulty_level   5 Werte, eine eigene Achse

`[read]` **Toms Verdacht traegt weiter als er selbst dachte.**

**Zwei kleine Entscheidungen bleiben** — **arbeite sie so aus, dass
Tom sie mit ja oder nein beantworten kann.**

`[read]` **Erstens: bekommt `subtype` einen CHECK?** `[cmd]`
**Miss, welche Werte heute drinstehen** — **eine freie Spalte mit
elf gelebten Werten ist etwas anderes als eine mit drei.**

`[read]` **Zweitens: welche Achse setzt das Onboarding?**
`[cmd]` **Du hast gemessen, dass die Ziele heute
`profiles.nutrition_goal` lesen, nicht `user_goals`.**

`[read]` **Das ist der wichtigere Befund** — **eine fuenfte Stelle,
die niemand als Achse gezaehlt hat.** `[read]` **Miss, wer sie
schreibt und wer sie liest.**

### 2 · G-229 — Admin-Override

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit C-31 gibt es `curate_food_tag` mit Rechteschranke in
der Datenbank** — **Nicht-Admins abgewiesen.**

### 3 · G-261 — Vergleichsfunktionen

`[cmd]` **Der Punkt wartet laut Notizen auf sich selbst
(Gate-Waechter).**

`[read]` **Miss, was er verlangt und was ihn blockiert.**

### Was nicht zu tun ist

**Keine fuenfte Achse.**
**Nichts in `supabase/` aendern** — **ein CHECK ist Codex' Arbeit.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    subtype        welche Werte gelebt, gezaehlt
    nutrition_goal wer schreibt, wer liest
    Vorlage        die zwei Fragen so, dass ja/nein reicht
    G-229, G-261   gilt / ueberholt

## Bericht

**Claude Code, 2026-09-06. Gemessen, nichts gebaut.**

### Frage 1 — bekommt `subtype` einen CHECK?

`[cmd]` **Gemessen am 2026-09-06, alle 11 Zeilen:**

    goal_type          subtype              Zeilen  Nutzer
    body_composition   cut                       2       2
    body_composition   gain_muscle               2       2
    lifestyle          cardio_frequency          2       2
    performance        strength                  4       2
    performance        training_capacity         1       1

    verschiedene Werte:  5
    NULL:                0 von 11

`[read]` **Das ist die Antwort auf die Frage des Auftrags:** **fuenf
gelebte Werte, nicht elf** — **und keine einzige leere Zelle.**

`[read]` **Die Spalte ist `nullable`, aber niemand hat sie je leer
gelassen.** **Sie wird bereits benutzt, als haette sie einen
CHECK** — nur ohne Absicherung.

`[cmd]` **Und jeder Wert steht unter genau einem `goal_type`** —
keine Ueberschneidung. **Die zweite Ebene ist nicht nur da, sie ist
auch sauber.**

**Vorlage zur Entscheidung:**

    JA, CHECK   Die fuenf Werte sind belegt und ueberschneidungsfrei.
                Ein CHECK haelt Tippfehler und fremde Werte fern.
                Kosten: jede neue Unterart braucht eine Migration.

    NEIN, frei  Neue Unterarten ohne Migration. Kosten: `cut` und
                `Cut` und `cutting` koennen nebeneinander stehen,
                und keine Abfrage merkt es.

`[read]` **Meine Empfehlung: ja, aber erst nach Frage 2.** `[read]`
**Solange niemand ein Ziel anlegen kann (siehe unten), waechst die
Liste ohnehin nicht** — **der CHECK haette heute nichts zu
verteidigen.**

### Frage 2 — welche Achse setzt das Onboarding?

`[read]` **Der Auftrag nennt es den wichtigeren Befund. Er ist es,
und er faellt anders aus als erwartet.**

**Wer schreibt, wer liest — gemessen:**

    profiles.nutrition_goal
      schreibt   settings/formular.tsx:246 -> profile-write.ts:37
                 SECHS Werte im Pulldown, am Schirm belegt
      liest      goals/lesen.ts:521 - fuer die Zielwerte
                 profile/zielwerte-read.ts:93
                 nutrition/zielhinweis.tsx:127
                 goals/tab-composition.tsx:268 - "Zielrichtung"

    goals.user_goals.goal_type / subtype
      schreibt   NIEMAND
      liest      goals/lesen.ts:219, dashboard/lesen.ts:237

`[cmd]` **`lib/goals/schreiben.ts` hat genau eine Operation:
`.update()`.** **Kein `insert`, kein `upsert`.**

`[cmd]` **Und `ZielAenderung` (`ziel-regeln.ts:69`) fuehrt acht
Felder** — `title`, `description`, `target_value`, `target_unit`,
`target_date`, `status`, `priority`, `is_primary`. **`goal_type` und
`subtype` stehen NICHT darin.**

`[read]` **Beide Achsen sind aus der Oberflaeche unerreichbar.**
**Die elf Zeilen stammen aus Seeds.**

**Am Schirm gegengeprueft** (`dev@lumeos.app`, 2026-09-06):

    /v2/settings   Pulldown "Zielrichtung" mit sechs Werten:
                   lose_weight, maintain, gain_muscle,
                   recomposition, performance, health
    /v2/goals      NULL Auswahlfelder.
                   goal_type waehlbar:  nein
                   subtype waehlbar:    nein

**Bildschirmfotos:** `backup/g352-settings.png`, `backup/g352-goals.png`.

### Damit beantwortet sich die Frage von selbst

`[read]` **Das Onboarding kann heute nur EINE Achse setzen, weil es
nur eine gibt, die einen Schreibweg hat:**
**`profiles.nutrition_goal`.**

`[read]` **Und das ist kein Notbehelf, sondern passt:** `[cmd]`
**die Zielwerte (`goals.nutrition_targets`) lesen genau diese
Spalte** — `herkunft: formel`, `nutrition_goal: gain_muscle` bei
`test-user`. **Wer sie setzt, aendert die Makros. Wer `goal_type`
setzt, aendert heute nichts.**

**Vorlage zur Entscheidung:**

    JA    Onboarding setzt `profiles.nutrition_goal` (sechs Werte).
          Es ist die einzige Achse mit Schreibweg und die einzige,
          die auf die Zielwerte wirkt. `user_goals` bleibt, was es
          heute ist: eine Leseansicht ueber Seed-Daten.

    NEIN  Dann braucht es zuerst einen Anlegeweg fuer `user_goals` —
          das ist Arbeit, keine Entscheidung, und eine eigene
          Vorbedingung fuer den Onboarding-Schritt.

### Ein Fund, der die Zaehlung nochmal aendert

`[cmd]` **`goals/modale.tsx:116` fuehrt eine SECHSTE Liste** — das
`New goal`-Modal, mit eigenen Typen als Knoepfe (nicht als
Pulldown, deshalb fand meine Schirmprobe null Auswahlfelder):

    body_comp · weight · strength · performance · habit · custom

`[cmd]` **`body_comp` ist nicht `body_composition`** — **die
Datenbank kennt diesen Wert nicht.** `[cmd]` **Der Kommentar nennt
die Herkunft: `module-goals.jsx:694-744`, also das Altrepo.**

`[cmd]` **Der `Create goal`-Knopf ist ein `InEntwicklungKnopf`** —
**und sein Grund benennt die Vorbedingung schon richtig:** *,,Was
fehlt, ist nur das ANLEGEN: es gibt genau drei aktive Plaetze, und
welcher beim Anlegen frei wird, ist eine Produktentscheidung."*

`[read]` **Das ist eine dritte offene Sache, aber eine kleine** —
**und sie gehoert zu Frage 2, nicht daneben.**

### Der Stand der Achsen, berichtigt

    goal_type          4 Werte, CHECK, NOT NULL   kein Schreibweg
    subtype            5 gelebte Werte, kein CHECK kein Schreibweg
    phase_type         9 Werte, CHECK              kein Schreibweg
    variant            frei, Vorgabe 'moderate'    kein Schreibweg
    nutrition_goal     6 Werte, CHECK, nullable    SETTINGS
    difficulty_level   5 Werte (quer dazu)         kein Schreibweg
    Modal-Liste        6 Werte, nur Anzeige        Attrappe

`[read]` **Keine fuenfte Achse angelegt** — **die fuenfte Stelle war
schon da, sie wurde nur nie als Achse gezaehlt.** **Und sie ist die
einzige, die ein Nutzer erreicht.**

### 2 · G-229 — die Haelfte ist erledigt

**Der Auftrag: gilt er noch, seit C-31 `curate_food_tag` gebaut hat?**

`[cmd]` **Die Funktion steht:**
`nutrition.curate_food_tag(p_food_id uuid, p_tag_code text,
p_action text)`.

`[cmd]` **Mit Rechteschranke in der Datenbank:**

    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'curate_food_tag: Adminrolle erforderlich'

`[cmd]` **Und drei weitere Ausnahmen** — ungueltige Aktion,
unbekanntes Lebensmittel, undefiniertes Tag.

**Die drei Beanstandungen der Review, einzeln:**

    "Kein Admin-Endpoint"        ERLEDIGT - die Funktion ist der
                                 Weg, mit Schranke in der DB
    "Trigger ueberschreibt"      GEGENSTANDSLOS - `auto_tag_food`
                                 gibt es nicht mehr (pg_proc, 0
                                 Treffer)
    "User-Tags fuer Custom"      OFFEN - `foods_custom` hat nur
                                 `custom_allergens`, kein
                                 generisches Tag-Feld

`[cmd]` **Und E-55 ist nicht nur entschieden, sondern gebaut:**
**`nutrition.food_tags_kuriert` existiert als Tabelle**, und
`curate_food_tag` schreibt genau dorthin —
`INSERT INTO nutrition.food_tags_kuriert (food_id, tag_code, action)
... ON CONFLICT DO UPDATE`. `[cmd]` **`food_tags_effective`
verbindet beide.**

`[read]` **Damit ist die Adminhaelfte vollstaendig zu** — Beschluss,
Tabelle, Schreibweg und Schranke stehen. **Die Nutzerhaelfte steht
unveraendert.**

`[read]` **Der Punkt gilt also noch, aber nur zur Haelfte.**

`[read]` **Vorschlag: den Befund auf die Nutzerhaelfte
zusammenstreichen, statt ihn ganz zu schliessen oder ganz
offenzulassen.** `[read]` **Und C-31 ist damit geprueft, nicht
angenommen** — der Punkt verlangte genau das.

### 3 · G-261 — entschieden, und der Waechter laeuft

`[cmd]` **Er wartet nicht auf sich selbst — er ist mit E-31
entschieden:** *,,nicht anbinden, aber messbar halten"*.

`[cmd]` **Nachgemessen 2026-09-06:**

    node tools/zwei-wahrheiten-pruefen.mjs
    -> gruen: 6 Naehrstoffspalten, Soll 6.
       G-261 bleibt zurueckgestellt.

`[cmd]` **Und er steht im Gate** (`package.json:10`, neunter
Schritt).

`[read]` **Was ihn blockiert, ist also nichts** — **er ist
absichtlich zurueckgestellt, mit einem Ablaufdatum, das sich selbst
meldet.** `[cmd]` **Kommt eine siebte Naehrstoffspalte, faellt das
Gate und der Punkt wird wieder zur Frage.**

`[read]` **Kein Handlungsbedarf.** **Er koennte nach `todos/`
wandern, damit `laufend_*` ehrlich bleibt** — **er laeuft ja
nicht.**

### Gemessen, nicht gebaut

    geaendert           nichts am Code
    supabase/           nicht angefasst - ein CHECK ist Codex' Arbeit
    dev@lumeos.app      nicht geschrieben, 730 Mahlzeiten
    gestaged            nichts

## Abnahme

_(vom Orchestrator)_
