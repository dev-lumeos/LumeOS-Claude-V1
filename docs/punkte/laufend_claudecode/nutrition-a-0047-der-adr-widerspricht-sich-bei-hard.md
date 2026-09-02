---
nr: A-47
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: G-154
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  tabellen: []
  dateien: []
zahlen:
  gemessen: 2026-09-02
  register_offen: 74
  register_gesamt: 84
  stufen_im_adr: 3
  stufen_im_code: 3
---

# A-47 - Der ADR widerspricht sich bei `hard`

## Befund

(neu 2026-08-22).
  Befund aus G-154. **Dokumentenfrage, kein Code.**

  `[cmd]` **`ADR_NUTRITION_PREFERENCES_V1` sagt zweimal
  Verschiedenes.** Die Entscheidungstabelle: Allergie ist `hard`,
  *„absoluter Ausschluss — nie anzeigen, nie vorschlagen"*. Der
  Abschnitt *„Food Search Ranking-Einfluss"* darunter: `-300 fuer
  allergen match (hard constraint)`.

  `[read]` **Punkte schliessen nicht aus.** Ein Eintrag mit -300 steht
  weiter in der Liste, nur weiter unten. **Die Implementierung folgt
  der Tabelle** (`preference_excluded`), nicht dem Rangmodell — und
  das ist die richtige Wahl.

  `[cmd]` **Weitere Abweichungen zwischen ADR und Bestand:** die
  Spalte heisst `strength`, nicht `severity`; es gibt
  `general_exclusions`, nicht `excluded_foods`; `religious_dietary`
  und `religious_is_hard` fehlen ganz.

  **Zu tun:** den ADR nachziehen oder den Widerspruch als bewusst
  vermerken. **Nicht den Code aendern** — er tut das Richtige.

## Auftrag — drei Widersprueche in den Nutrition-Specs

**Mitbeauftragt: C-174, A-13.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Warum diese drei zusammen

`[read]` **Alle drei sagen dasselbe von verschiedenen Seiten:**
**die Spec widerspricht sich bei den Ausschlussstufen.**

`[cmd]` **A-47: der ADR widerspricht sich bei `hard`.**
`[cmd]` **C-174: `ADR_NUTRITION_PREFERENCES_V1` kennt drei
Constraint-Stufen.**
`[cmd]` **A-13: das Konsolidierungsregister ist abzuarbeiten.**

`[read]` **Und seit heute gibt es Entscheidungen, die sie
beruehren:** `[cmd]` **E-49 teilt die Filtergruppen, E-58 und E-59
regeln die Mahlzeitenstruktur.**

### Was zu tun ist

**Lesen, messen, und sagen was gilt.**

`[read]` **Nicht bauen** — **die drei Punkte fragen, was die Spec
meint, nicht was der Code tun soll.**

`[cmd]` **`SPEC_03` und `SPEC_10` sind die Quellen**, dazu
`ADR_NUTRITION_PREFERENCES_V1`.

`[read]` **Und wo eine Entscheidung von heute den Widerspruch
aufloest: sag es** — **statt einen alten ADR nachzuziehen, der
ueberholt ist.**

### Wo der Code widerspricht

`[cmd]` **`tab-vorlieben.tsx` zeigt *hard exclusion · no scoring
override*** — **eine harte Stufe.**

`[cmd]` **Der ADR nennt drei.** `[read]` **Miss, welche der drei im
Code ankommen.**

### Was nicht zu tun ist

**Keine Spec aendern** — `docs/` gehoert dem Orchestrator.
**Melden, was gilt, mit Fundstelle.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    A-47    was widerspricht sich, mit Zeilennummer
    C-174   drei Stufen -- welche wirken im Code
    A-13    was im Register noch offen ist, gezaehlt
    heute   welche Entscheidung loest was auf

## Bericht

**Claude Code, 2026-09-02.** Gemessen auf `dev@lumeos.app`, Stand
2026-09-02. **Nur gelesen** — kein Code geaendert, keine Spec
geaendert, nichts geschrieben.

---

### Das Ergebnis in einem Satz

`[read]` **Der ADR widerspricht sich, aber der Code nicht** — **er
setzt genau die drei Stufen um, die die ADR-Tabelle nennt.** **Was
fehlt, ist der Vermerk, dass das Rangmodell darunter ueberholt ist.**

---

## A-47 — was widerspricht sich, mit Zeilennummer

`[cmd]` **Quelle: `docs/specs/Nutrition/04_adrs/ADR_NUTRITION_PREFERENCES_V1.md`**

    Zeile 29    | Allergie | hard | Absoluter Ausschluss --
                  nie anzeigen, nie vorschlagen |
    Zeile 88    -300  fuer allergen match (hard constraint)

`[read]` **Zeile 29 sagt: entfernen. Zeile 88 sagt: abwerten.**
**Punkte schliessen nicht aus** — ein Eintrag mit -300 steht weiter
in der Liste, nur weiter unten.

`[cmd]` **Dasselbe fuer die zweite Stufe:**

    Zeile 30    | Unvertraeglichkeit | strong | nur auf explizite
                  User-Suche anzeigen |
    Zeile 89    -200  fuer intolerance match (strong constraint)

`[cmd]` **Und ein drittes Mal:**

    Zeile 31    | Religioes/kulturell | hard (wenn User so setzt) |
    Zeile 90    -300  fuer religious_dietary match

### Gemessen: der Code folgt der TABELLE, nicht dem Rangmodell

`[cmd]` **Gegenprobe mit `nutrition.food_search`, `dev@lumeos.app`,
2026-09-02** — dev traegt `allergies = {tree_nuts}`:

    Suche "nuss", MIT Nutzer     0 von 77 Treffern tragen
                                 contains_nuts
    Suche "nuss", OHNE Nutzer   24 von 100 Treffern tragen sie

`[read]` **Der Allergietreffer ist weg, nicht unten.** **Waere Zeile
88 umgesetzt, stuenden die 24 mit -300 am Ende der Liste.**

`[cmd]` **Und die Grundgesamtheit, gemessen ueber `total`:**

    Begriff        ohne Nutzer   mit Nutzer   Differenz
    (blaettern)          7140         4970        2170
    lamm                 7140         7020         120
    nuss                 7140         7020         120
    schokolade           7140         7020         120
    leber                7140         7020         120

`[cmd]` **Die 120 sind deckungsgleich mit
`contains_nuts`** — `select count(*) from nutrition.food_tags where
tag_code='contains_nuts'` ergibt **120**.

`[read]` **Sie fehlen bei JEDER Suche** — die harte Stufe kennt keine
Ausnahme. **Die restlichen 2050 fehlen nur beim Blaettern.**

### Die uebrigen ADR-Abweichungen, nachgemessen

`[cmd]` **Der Befund von A-47 stimmt in allen vier Punkten:**

    ADR Zeile 55   severity        heisst live `strength`
    ADR Zeile 43   excluded_foods  existiert nicht; live
                                   `general_exclusions`
    ADR Zeile 45   religious_dietary   existiert nicht
    ADR Zeile 46   religious_is_hard   existiert nicht

`[cmd]` **Gemessen an `information_schema.columns`,
`nutrition.food_preferences`:** vorhanden sind `diet_type`,
`allergies`, `intolerances`, `general_exclusions`.

`[read]` **Die religioese Stufe hat also keine Datenquelle** — sie
lief ueber Presets: `halal` und `kosher` sind Tags in
`dietary_pattern` (E-49), nicht eigene Spalten.

---

## C-174 — drei Stufen: welche wirken im Code

`[read]` **Alle drei.** `[cmd]` **Und sie wirken genau so, wie die
ADR-Tabelle sie beschreibt** — die Entscheidungsstelle steht in
`supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql`,
**Zeile 1053-1065**:

    bool_or(constraint_level = 'hard' AND source <> ...)
      OR ((bool_or(constraint_level = 'strong') OR ...)
          AND COALESCE(p_normalized_query, '') = '')
        AS preference_excluded

`[read]` **In Worten:** `hard` schliesst immer aus. `strong` schliesst
**nur aus, wenn kein Suchbegriff da ist** — das ist woertlich *„nur
auf explizite User-Suche anzeigen"*.

### Die vier Stufen am Suchergebnis, belegt

`[cmd]` **`preference_level` je Treffer, `dev@lumeos.app`,
Suchbegriff normalisiert ueber `nutrition.search_fold`:**

    Suche       boost   strong   hard   neutral
    milch           2       98      -         -
    joghurt         2       93      2         -
    kaese           3       95      -         2

`[read]` **Alle vier Stufen kommen am Schirm an.**

### Der Befund, der C-174 aufloest

`[cmd]` **C-174 sagte: *„Heute kennt `food_preference_items` nur
`liked`, `disliked`, `hard_exclude`, `soft_dislike`."***

`[cmd]` **Das ist ueberholt.** Der CHECK auf `strength` kennt heute
**sechs** Werte:

    hard_exclude, strong_avoid, soft_dislike, neutral, like, boost

`[read]` **`strong_avoid` existiert also.** `[cmd]` **Belegt ist es
nirgends** — `select strength, count(*)` ueber alle Zeilen ergibt
`boost 5`, `hard_exclude 2`, `soft_dislike 2`.

`[cmd]` **Und kein Schreibweg erzeugt es:**

    preferences-model.ts:29   strengthForPreference -> like |
                              soft_dislike | hard_exclude
    vorlieben-aktionen.ts:53  staerke -> hard_exclude |
                              soft_dislike | boost
    food_preferences_write    prosrc enthaelt 'strong_avoid' 0 mal

`[cmd]` **Der `preference`-CHECK kennt ohnehin nur drei Worte:**
`liked`, `disliked`, `hard_exclude`. **Es gibt keine Eingabe fuer
`strong_avoid`.**

### Aber `strong` hat trotzdem eine Quelle — eine andere

`[cmd]` **Sie heisst `food_preferences.intolerances`**, nicht
`strength`. **Zeile 403-411** derselben Datei:

    SELECT ft.food_id, 'strong'::text, 'intolerance'::text, -25, 90,
           'profile_intolerance'::text
    FROM user_preference up
    JOIN allergy_tag_map m ON m.source_code = ANY(up.intolerances)

`[cmd]` **Auf dev gesetzt:** `allergies {tree_nuts}`,
`intolerances {lactose}`. **Die Abbildung steht als CTE in
Zeile 294-304:** `lactose -> contains_lactose` (**1.021**
Lebensmittel), `tree_nuts -> contains_nuts` (**120**).

`[read]` **Damit ist die Frage von C-174 beantwortet:** *„Bleibt es
bei `0`, oder wird `strong` als eigene Stufe gebaut?"* — **`strong`
IST gebaut, ueber `intolerances`.** **`strong_avoid` in `strength`
ist der zweite, ungenutzte Weg zur selben Stufe.**

### Und die UI kennt die drei Stufen auch schon

`[cmd]` **`tab-vorlieben.tsx`, Zeile 241-246:**

    if (g.allergies.includes(id))    return 'allergie'
    if (g.intolerances.includes(id)) return 'sensibel'
    return 'neutral'

`[cmd]` **Zeile 249:** *„1x tippen = Sensibel · 2x = Allergie · 3x =
Entfernen."*

### Der Untertitel im Auftrag ist ein eigener Befund

`[cmd]` **`tab-vorlieben.tsx:710`** traegt
`sub="hard exclusion · no scoring override"`.

`[read]` **Der Untertitel beschreibt EINE Stufe, waehrend die Karte
darunter DREI anbietet.** `[cmd]` **Er sitzt auf der Kachel
*Allergies*, die auch `sensibel` setzt** — **also auf der Kachel,
die er falsch beschreibt.**

`[read]` **Das ist kein Widerspruch zwischen Code und ADR, sondern
zwischen Beschriftung und Verhalten** — **eine Zeile, die aelter ist
als die dritte Stufe.** **Neuer Punkt.**

---

## A-13 — was im Register noch offen ist, gezaehlt

`[cmd]` **`docs/spezifikation/00-KONSOLIDIERUNG.md`, 84 Registerzeilen,
gezaehlt am 2026-09-02:**

    74   offen
     6   gelesen
     4   aufgeloest

`[read]` **Die Zahl aus A-13 (2026-08-16) ist unveraendert** — *„74
von 84 stehen auf `offen`, 6 gelesen, 4 aufgeloest"*. **In siebzehn
Tagen hat sich nichts bewegt.**

`[cmd]` **Die 74 offenen nach Herkunft:**

    38   brainstorm/
    36   specs/

`[cmd]` **Die in A-13 genannten Kandidaten, mit Stand:**

    aufgeloest   specs/01_current_specs/SPEC_05_FOOD_TAXONOMY.md
    offen        brainstorm/new/spec/SPEC_05_FOOD_TAXONOMY.md
    gelesen      specs/01_current_specs/SPEC_09_SCORING.md
    offen        brainstorm/new/spec/SPEC_09_SCORING.md
    offen        specs/04_adrs/ADR_NUTRITION_PREFERENCES_V1.md
    offen        specs/02_patches/SPEC_02_PATCH_MEALPLANLOG_ADR.md

### Ein Widerspruch im Register selbst

`[cmd]` **`ADR_NUTRITION_PREFERENCES_V1.md` steht im Register auf
`offen`** — **traegt aber seit dem 2026-08-30 einen Statuskopf**
(Zeile 5-15): *„Teilweise abgeloest, Stand 2026-08-30 … Gemessen in
A-37 (Codex), vermerkt in C-357."*

`[read]` **Die Datei ist ausgewertet, das Register weiss es nicht.**
**Mindestens diese eine Zeile ist nachzutragen** — und die Frage ist,
**bei wie vielen der 74 es genauso steht.**

`[read]` **Ich habe das nicht fuer alle 74 geprueft** — das waere ein
eigener Auftrag. **Der Befund lautet: der Registerstand ist nicht
verlaesslich, weil er nicht mitgepflegt wird.**

---

## Heute — welche Entscheidung loest was auf

### E-30 loest A-47 auf

`[cmd]` **`docs/entscheidungen/E-30-ausschluesse-ranken-ab-statt-zu-entfernen.md`,
2026-08-29, Status `gueltig`.**

**Tom:** *„wenn jemand explizit nach einem generellen ausschluss
sucht darf der kommen … kommen alle andere vorher angezeigt."*

`[read]` **Damit ist entschieden, was der ADR offen laesst:**
**Ausschluesse werden abgerankt, NICHT entfernt** — **aber nur die
generellen.** `[cmd]` **E-30 sagt es ausdruecklich** (Zeile 62-68):
*„Allergien sind kein genereller Ausschluss … Wer eine Nussallergie
eingetragen hat, will Nuesse nicht weiter unten sehen, sondern gar
nicht."*

`[read]` **Das ist genau die ADR-Tabelle, und genau der Code.**
**Zeile 88 des ADR (`-300 fuer allergen match`) ist damit ueberholt,
nicht offen.**

### E-16 loest C-174 auf

`[cmd]` **`E-16-generelle-ausschluesse-bewerten.md`, 2026-08-20,
`betrifft: [G-116, C-174]`** — die Entscheidung nennt C-174 im Kopf.

**Tom:** *„Ich wuerde es einfach mit 0 bewerten, dass es am Schluss
noch auftaucht."*

`[cmd]` **Am Schirm belegt:** bei Suche *joghurt* stehen zwei Treffer
mit `preference_level = hard` in der Liste — **Marke `general_tag`,
Score 0**:

    {"type": "general_tag", "level": "hard", "score": 0}

`[read]` **Ein *harter* genereller Ausschluss mit Punktzahl 0, der
sichtbar bleibt** — **das ist E-16, woertlich.** **Die Allergie
dagegen ist weg (0 von 77).**

### E-49 beruehrt die Sache, loest sie aber nicht

`[cmd]` **`E-49-vier-filtergruppen-nach-der-frage.md`, 2026-09-02.**
`[cmd]` **Umgesetzt und live gemessen** —
`nutrition.tag_definitions.filter_group`:

    allergen           3   is_exclusion_relevant: ja
    dietary_pattern    5   is_exclusion_relevant: ja
    nutrient           4   nein
    processing         2   nein

`[read]` **E-49 ordnet, WELCHE Marken ausschliessen koennen** —
**nicht, WIE stark.** **Sie loest den `hard`-Widerspruch nicht, aber
sie erklaert, warum `halal` und `kosher` keine eigenen Spalten
brauchen:** sie sind Tags in `dietary_pattern`, nicht die
ADR-Spalten `religious_dietary` / `religious_is_hard`.

### E-58 und E-59 beruehren die Ausschlussstufen NICHT

`[cmd]` **Beide regeln die Mahlzeitenstruktur** — `meal_slots`,
Benennung, Planherkunft. `[read]` **Mit den Constraint-Stufen haben
sie keine Beruehrung.** **Der Auftrag nennt sie als moeglicherweise
beruehrend; gemessen sind sie es nicht.**

---

## Was gilt — als Vorschlag an den Orchestrator

`[read]` **Ich aendere keine Spec** (`docs/` gehoert dem
Orchestrator). **Was ich vorschlage, mit Fundstelle:**

**1 · Der ADR braucht keinen Nachzug bei `hard` — er braucht einen
Strich.** `[read]` Die Tabelle (Zeile 27-33) gilt. **Der Abschnitt
*Food Search Ranking-Einfluss* (Zeile 79-92) ist ueberholt**, soweit
er `-300` / `-200` fuer harte und starke Stufen nennt. **E-30 und
E-16 haben das entschieden.**

**2 · Der Statuskopf des ADR nennt E-16 und E-30 bereits** (Zeile
5-15). `[read]` **Er nennt aber nur den generellen Ausschluss.**
**Was fehlt: dass die Punktetabelle darunter fuer `hard`/`strong`
nicht mehr gilt.**

**3 · C-174 ist beantwortet und kann geschlossen werden.** `[read]`
**`strong` ist gebaut, ueber `intolerances`.** **Die Frage *„bleibt
es bei 0"* hat E-16 beantwortet.**

**4 · `strong_avoid` in `food_preference_items.strength` ist ein
toter Zweig.** `[read]` **Der Suchweg wertet ihn aus, kein
Schreibweg erzeugt ihn, und es gibt kein Eingabewort dafuer.**
**Entweder wird er angeschlossen oder er faellt** — **eigener
Punkt, keine Specfrage.**

**5 · Die drei ADR-Spalten, die es nicht gibt** — `excluded_foods`,
`religious_dietary`, `religious_is_hard` — **sind ersetzt, nicht
vergessen:** `general_exclusions` und die Presets/Tags
(`dietary_pattern`, E-49). **Auch das gehoert in den Statuskopf.**

**6 · `tab-vorlieben.tsx:710` beschreibt EINE Stufe, wo DREI
sind.** **Neuer Punkt, Codefrage.**

**7 · A-13 bleibt offen, und die Zahl ist unveraendert** — 74 von
84. `[read]` **Mindestens eine Zeile ist nachweislich falsch** (der
ADR selbst). **Ob mehr, ist ungemessen.**

---

## Nicht getan

    kein Code geaendert
    keine Spec geaendert
    nichts geschrieben -- alle Messungen lesend
    nicht committet, nicht gestaged, nicht gepusht
    Dev-Server nicht angefasst

## Abnahme

_(vom Orchestrator)_
