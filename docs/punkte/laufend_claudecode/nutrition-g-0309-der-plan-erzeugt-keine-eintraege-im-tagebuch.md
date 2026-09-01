---
nr: G-309
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: G-304
entscheidung: E-42
beruehrt:
  tabellen: [nutrition.meal_plan_logs]
zahlen:
  gemessen: 2026-09-01
  logs: 0
---

# G-309 — der Plan erzeugt keine Eintraege im Tagebuch

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **`meal_plan_day_to_diary` existiert ohne Aufrufer.**
`[cmd]` **`meal_plan_logs` traegt 0 Zeilen.**

`[cmd]` **Und beim Aktivieren wird der bestehende aktive Plan nicht
auf `paused` gesetzt** — `SPEC_03` Flow 3, Schritt 7.

## Warum das der letzte Schritt ist

Tom, 2026-08-31: *,,ist der plan aktiv werden in diary die
tagesmahlzeiten eingetragen welche dann durch den user entweder zu
bestaetigen oder per mealcam einzulesen und dann zu bestaetigen."*

Und: *,,die protokolle der benutzen plaene muessen entsprechend
angelegt sein dass wir auswerten koennen welcher plan wie und wie
exakt umgesetzt wurde."*

`[read]` **Ohne diesen Weg ist der Plan ein Dokument.** **Mit ihm ist
er ein Ablauf.**

## Was da ist

`[cmd]` **`meal_plan_logs` traegt vier Zustaende** — `pending`,
`confirmed`, `deviated`, `skipped` — **mit `deviation_kcal`,
`deviation_pct`, `plan_entry_id`, `actual_meal_id`.**

`[cmd]` **`meals` traegt `entry_source` und `source_detail`.**

`[cmd]` **Der Bestaetigungsweg steht seit G-274:** bestaetigen und
auslassen schreiben.

`[read]` **Es fehlt der Anfang: aus einem aktiven Plantag entstehen
Tagebuchzeilen.**

## Was `SPEC_03` dazu sagt

`[cmd]` **Flow 3, Schritt 7:** *,,ab Startdatum: Ghost Entries im
Diary."*

`[cmd]` **Flow 4 beschreibt das Bestaetigen** — und `SPEC_03_FLOW4_RECIPE_PATCH`
sagt: **ein Ghost Entry aus einem Rezept zeigt den Rezeptnamen als
Ueberschrift und darunter alle Einzelzutaten mit eigenen
Mengenfeldern.**

`[cmd]` **`ADR_GHOST_ENTRY_RECIPE`: beim Loggen entstehen immer
Einzelzutaten, je Zutat ein `MealItem` mit eingefrorenen
Naehrwerten.**

## Auftrag — den Kreis schliessen

`[read]` **Vorbereitet am 2026-09-01.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag laeuft der Weg vollstaendig:**

    Plan bauen -> aktivieren -> Tagebuch zeigt die Plantage
    -> bestaetigen, abweichen oder auslassen
    -> das Protokoll traegt es
    -> die Auswertung sagt, welche Mahlzeit immer gewechselt wurde

`[cmd]` **Alles davon ist einzeln gebaut. Es fehlt die Naht.**

### 1 · Ghost Entries entstehen

`[cmd]` **`meal_plan_day_to_diary` existiert ohne Aufrufer.**
`[cmd]` **Flow 3 Schritt 7: *ab Startdatum: Ghost Entries im
Diary*.**

`[read]` **Miss zuerst, was die Funktion tut** — **sie ist da, aber
niemand hat sie je gerufen.** `[cmd]` **Dieselbe Klasse wie
`reference_assessment_window_flags` vor G-273.**

`[cmd]` **Und `ADR_GHOST_ENTRY_RECIPE` gilt:** ein Rezept-Eintrag
zeigt den Rezeptnamen als Ueberschrift **und darunter alle
Einzelzutaten mit eigenen Mengenfeldern.** `[read]` **Kein *Rezept
als Einheit bestaetigen*.**

### 2 · Der bestehende Plan wird pausiert

`[cmd]` **Flow 3 Schritt 7: *bestehender aktiver Plan -> status:
paused*.** `[cmd]` **Das geschieht heute nicht.**

`[read]` **Sonst haetten zwei Plaene gleichzeitig Anspruch auf
denselben Tag.**

### 3 · Das Protokoll fuellt sich

`[cmd]` **`meal_plan_logs` traegt 0 Zeilen.** `[cmd]` **Der
Bestaetigungsweg aus G-274 steht** — bestaetigen und auslassen
schreiben.

`[read]` **Miss, ob er in `meal_plan_logs` schreibt oder nur ins
Tagebuch.** `[read]` **Wenn nur ins Tagebuch: das ist die Luecke.**

`[cmd]` **Der `resolution_check` erzwingt die Form:** `confirmed`
braucht `actual_meal_id` und `confirmed_at`, `deviated` zusaetzlich
`deviation_kcal` und `deviation_pct`, `skipped` nur `skipped_at`.

### 4 · Und dann die Auswertung, die Tom will

Tom, 2026-08-31: *,,dass er seinen plan dementsprechend vielleicht
anpassen sollte wenn er eh zb die eine mahlzeit immer gewechselt hat
weil er es vielleicht nicht mag."*

`[read]` **Das ist eine Abfrage ueber `status = 'deviated'` je
`plan_entry_id`.** `[read]` **Bau sie erst, wenn Zeilen da sind** —
**und wenn nicht: sag, was fehlt, statt eine leere Kachel zu
stellen.**

### Was nicht zu tun ist

**Keine zweite Schreibnaht** — `addMealItem` aus G-272 ist der Weg.
**Nichts erfinden, was nicht in `SPEC_03` oder den ADRs steht.**
**Nichts auf `dev@lumeos.app`** — eine Probe, die schreiben kann,
gehoert nicht auf ein unantastbares Konto.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Plan aktivieren       Ghost Entries im Tagebuch, gezaehlt
    alter Plan            steht auf paused, belegt
    bestaetigen           meal_plan_logs zaehlt, status confirmed
    abweichen             deviated mit deviation_kcal
    auslassen             skipped mit skipped_at
    Rezept-Eintrag        Einzelzutaten, nicht als Einheit
    Auswertung            gebaut, oder benannt was fehlt
    Rueckbau              gezaehlt, dev unveraendert

`[read]` **Die vorletzte Zeile ist die, an der Tom es messen wird.**

## Bericht

**Der Weg laeuft vollstaendig. Gate gruen (1.190 Tests, +15), 36 von
36 Sabotagen gefangen, `dev@lumeos.app` unveraendert.**

`[read]` **Zwei Auftragspunkte sind bei der Messung gefallen** --
Punkt 1 in der Sache (von Tom entschieden), Punkt 3 in der Diagnose.
**Beide stehen unten mit dem, was stattdessen gemessen wurde.**

### 1 · Ghost Entries -- der Auftragspunkt war falsch

`[cmd]` **`meal_plan_day_to_diary` gemessen, bevor etwas gebaut
wurde:** 4.043 Zeichen Rumpf, und sie schreibt **echte `meals` mit
`entry_source = 'seed'`** plus `meal_items`. **Ihr eigener Kommentar
sagt es:** *,,uebernimmt einen geplanten Tag als **normale**
meals/meal_items"*.

`[cmd]` **`SPEC_03` Flow 4 sagt etwas anderes:** *,,Ghost Entries
**erscheinen** im Diary (gestrichelte Umrandung, andere Farbe). Ghost
Entries haben **kein automatisches Expiry**. User entscheidet
jederzeit -- auch retroaktiv."*

`[cmd]` **Und `ADR_GHOST_ENTRY_RECIPE`:** *,,**Beim Bestaetigen** eines
Recipe-basierten Ghost Entry: FOR EACH RecipeItem ... MealItem
erstellen."*

`[read]` **Das ist ein Widerspruch, kein Detail:** ein geschriebener
`meals`-Satz kann nicht *offen* bleiben -- er ist gegessen oder
geloescht. **Vorgelegt statt entschieden.**

**Tom, 2026-09-01:** *,,Ein Ghost Entry ist eine Absicht, keine
Erfassung. Wer ihn als `meals` schreibt, hat gegessen, ohne gegessen
zu haben -- und die Tagesbilanz zaehlt es mit. ... Das ist ein
Seed-Werkzeug, kein Produktweg -- der Name taeuscht."*

**Gebaut ist deshalb eine Anzeige:** `ladeGhostEintraege` liest die
Positionen des Tages, loest Rezepte auf und rechnet die kcal ueber
`food_nutrient_snapshot`. **Geschrieben wird erst beim Klick.**

`[cmd]` **Ein Waechter haelt es fest**, wie beauftragt: er durchsucht
**alle 4 Dateitypen unter `apps/`** nach `meal_plan_day_to_diary` und
faellt bei jedem Treffer. **Heute: 0.**

### 2 · Was zusaetzlich fehlte: der Aktivieren-Knopf

`[cmd]` **Beim ersten Browserlauf gemessen: `Aktivieren-Knoepfe: 0`.**
**Die Bibliothek hatte nur *Bearbeiten*.**

`[read]` **Damit war Flow 3 an Schritt 4 zu Ende** -- und ohne aktiven
Plan gibt es keine Ghost Entries, also nichts zu bestaetigen. **Das
war die Wurzel des leeren `meal_plan_logs`, nicht die fehlende
Funktion.**

**Gebaut: Flow 3, Schritte 5-7.**

    Schritt 5   Startdatum, Vorgabe MORGEN, hoechstens 7 Tage voraus
    Schritt 6   Lebenszyklus
    Schritt 7   bestaetigen -> active, bestehender Plan -> paused

`[cmd]` **Im Browser gemessen:** Vorgabe `2026-09-02` bei Messtag
01.09. -- **morgen, wie Flow 3 es verlangt.**

`[read]` **`sequence` steht NICHT zur Wahl**, und die Kachel sagt
warum: `[cmd]` **`meal_plans_sequence_target_check` verlangt
`next_plan_id NOT NULL`**, und den Planpicker aus Schritt 6 gibt es
nicht. **Eine Wahl, die beim Speichern scheitert, ist schlimmer als
eine, die fehlt.**

### 3 · Der bestehende Plan wird pausiert -- belegt

`[cmd]` **Zwei Plaene auf `test-user@lumeos.local`, den zweiten ueber
die Oberflaeche aktiviert. Vorher/nachher:**

    G-309 Altplan   active, is_active=t   ->  paused, is_active=f
    G-309 Neuplan   assigned, f           ->  active, t, start_date=01.09.

`[read]` **`paused`, nicht `completed`** -- der Plan ruht, er ist
nicht durch; er bleibt in der Bibliothek.

`[cmd]` **ZWEI Wege setzen `active`** -- `planAendern` und
`ablaufKlaeren` (C-373). **Deshalb steht das Pausieren in einer
Funktion und wird zweimal gerufen**, gezaehlt statt gesucht.

### 4 · Das Protokoll -- der Auftragspunkt war zu vorsichtig

**Der Auftrag:** *,,Miss, ob er in `meal_plan_logs` schreibt oder nur
ins Tagebuch. Wenn nur ins Tagebuch: das ist die Luecke."*

`[cmd]` **Gemessen: er schreibt vollstaendig.**
`plan-log-write.ts:239` setzt `upsert` auf `meal_plan_logs` mit allen
Pflichtfeldern; `planEintragUeberspringen` ebenso. **Die Luecke lag
davor** -- es gab nichts zu bestaetigen.

`[cmd]` **Alle drei Zustaende im Browser gegangen, danach die
Datenbank gelesen:**

    Slot        Typ      status      modus   meal  conf_at  dev_kcal  dev_pct  skip_at
    breakfast   bls      confirmed   manual  ja    ja       --        --       nein
    lunch       recipe   deviated    manual  ja    ja       1028      76,3     nein
    dinner      bls      skipped     --      nein  nein     --        --       ja

`[read]` **Jede Zeile erfuellt den `resolution_check`** -- er haette
sonst abgewiesen.

`[cmd]` **Nachgerechnet:** geplant 1.348 kcal, tatsaechlich 2.376 --
Differenz 1.028, das sind 76,3 %. **Die Zahlen stimmen mit der
Anzeige ueberein.**

### 5 · Ein Fehler in G-274, den erst die Abweichung zeigte

`[cmd]` **Der erste Abweichungslauf ergab `confirmed` statt
`deviated`** -- obwohl 200 g auf 600 g gesetzt waren und die Mahlzeit
2.376 statt 1.348 kcal trug.

`[cmd]` **Ursache in `plan-log-write.ts`:**

    const faktor = planned_servings          <- so stand es
    const faktor = planned_servings / servings   <- so ist es richtig

`[cmd]` **Bei `servings = 2`, `planned_servings = 1`: 400 g Zutat
ergaben 400 g statt 200 g** -- die geplante Menge war doppelt so
gross, und die Verdreifachung sah wie eine Unterschreitung aus.

`[read]` **Sichtbar wurde es am ZUSTAND, nicht an der Menge.** **Die
Mengen waren korrekt angekommen** -- nur der Vergleichswert war
falsch.

`[cmd]` **Der Massstab waren zwei Stellen, die es richtig rechnen:**
`nutrition.meal_plan_day_to_diary` (`ri.amount_g * e.planned_servings
/ r.servings`) und der neue Leseweg. **Zwei von drei stimmten
ueberein, eine wich ab.**

`[cmd]` **Und ein zweiter Fallstrick an derselben Stelle:** `servings`
ist `numeric`, **PostgREST liefert es als Zeichenkette**. Ein `typeof
x === 'number'` waere immer falsch gewesen, und der Nenner still 1
geblieben.

### 6 · Das Rezept als Einzelzutaten -- die Nachweiszeile

`[cmd]` **Am 2026-09-02 im Browser gemessen, Rezept mit `servings = 2`,
`planned_servings = 1`:**

    Mittagessen · aus deinem Plan          [gestrichelt]
    📖 G-309 Huhn-Reis-Bowl
      Grillhaehnchen                       [200] g   514 kcal
      Weisse Schokolade mit Puffreis       [150] g   783 kcal
      Broccolisalat mit Joghurtmarinade    [100] g    51 kcal
      [Bestaetigen]  [Auslassen]

`[cmd]` **Rezeptname als Ueberschrift: ja. Drei Zutaten einzeln
sichtbar. Fuenf editierbare Mengenfelder** (drei fuer das Rezept, zwei
fuer die BLS-Slots), **je eines pro Zutat** --
`aria-label="Menge Grillhaehnchen"` usw.

`[cmd]` **Die Skalierung stimmt:** 400/300/200 g im Rezept ergeben
200/150/100 g bei einer von zwei Portionen.

`[read]` **Kein *Rezept als Einheit bestaetigen*** -- die Karte sendet
kein `recipe_id`, ein Waechter prueft es.

### 7 · Die Auswertung, die Tom will

**Tom, 2026-08-31:** *,,dass er seinen plan dementsprechend vielleicht
anpassen sollte wenn er eh zb die eine mahlzeit immer gewechselt
hat."*

`[cmd]` **Am Schirm, nach drei Abweichungen an derselben Position:**

    Was du regelmaessig wechselst        aus meal_plan_logs
    G-309 Huhn-Reis-Bowl   Mittag                        100 %
    3x anders gegessen -- von 3 Malen
    Vielleicht magst du das nicht -- du kannst die Position im
    Plan austauschen.

`[read]` **Zwei Schwellen, nicht eine:** ab zwei Wechseln UND mehr als
der Haelfte. **2 von 2 ist ein Muster, 2 von 20 nicht.**

`[read]` **`skipped` zaehlt mit:** wer eine Position dreimal auslaesst,
mag sie so wenig wie einer, der sie dreimal austauscht.

**Und der Auftrag verlangte, zu sagen was fehlt statt eine leere
Kachel zu stellen.** `[cmd]` **Drei Lagen, alle drei gemessen:**

    0 Zeilen            "Noch nichts protokolliert -- bestaetige oder
                         lass Planpositionen aus, dann steht hier ..."
    3 Zeilen, 0 Befunde "3 Positionen entschieden, keine faellt auf.
                         Auffaellig wird eine ab zwei Wechseln und
                         mehr als der Haelfte ihrer Vorkommen."
    1 Befund            die Zeile oben

### 8 · Zwei Fehler, die erst der Browser gezeigt hat

`[cmd]` **Erstens: die Kachel sagte *,,Noch nichts protokolliert"*,
waehrend `lunch` dreimal abgewichen war.**

`[read]` **Ursache: zwei Quellen fuer eine Aussage.** Die Befunde
kamen aus 28 Tagen, die Zahl der entschiedenen Zeilen aus
`ladePlanLogs(datum, 7)`. **Ein Wechsel vor mehr als sieben Tagen
erzeugte einen Befund, den die Kachel als *,,nichts da"* auswies.**
**Behoben: beides aus derselben Messung** (`WechselStand`).

`[cmd]` **Zweitens: `/login` antwortete HTTP 500** --
*,,You're importing a component that needs next/headers."*

`[read]` **Ein WERT-Import (`LEERER_WECHSELSTAND`) aus `plan-lesen.ts`
in eine Client-Komponente zog `next/headers` mit** -- A-30. **Der
ganze Server stand, nicht nur die Kachel.**

`[read]` **Und der Typecheck war dabei gruen** -- ein `import type`
waere durchgegangen, der Wert nicht. **Behoben: Typ und Konstanten
liegen in `plan-lage.ts` (serverfrei); ein Waechter prueft, dass keine
der drei Client-Dateien einen Wert aus dem Leseweg holt.**

`[cmd]` **Drittens, kleiner:** die Uebergabe `wechsel={wechsel}` von
`page.tsx` an die Ansicht fehlte. **Der Vorgabewert kaschierte es** --
die Kachel bekam stumm den Leerstand. **Gefunden durch Nachzaehlen der
Kette, nicht durch den Typecheck.**

### 9 · Die Waechter und die Sabotageprobe

`[cmd]` **15 Waechter, 36 Sabotagen, 36 gefangen** -- Rueckbau je
Sabotage per SHA-256 als byteidentisch belegt.

`[cmd]` **Im ersten Durchgang kamen zwei durch, und beide waren
lehrreich:**

    S1    der Anker traf `ladeWechselbefunde` statt `ladeGhostEintraege`
          -- Fehler der Probe, nicht des Waechters. Praezisiert, und
          der Waechter zusaetzlich auf die GET-Route erweitert.
    S20   `posten.slice(0, 0).map(...)` -- das Wort blieb stehen, die
          Liste war leer. **Mein Waechter suchte `posten.map`, also
          das Wort statt der Wirkung** (G-216/G-247/G-246).
          Behoben: er prueft jetzt den direkten Aufruf ohne
          Zwischenschnitt und verbietet `slice`/`filter` davor.

### 10 · Stand

    pnpm gate                gruen, 15 von 15 Aufgaben
    Tests apps/web           1.190 (vorher 1.175), davon 0 rot
    Sabotagen                36 von 36, Rueckbau byteidentisch
    test-user@lumeos.local   zurueckgebaut, gezaehlt:
                               meal_plans 2 -> 0, logs 3 -> 0,
                               meals 2 -> 0, meal_items 4 -> 0,
                               recipes 1 -> 0
    dev@lumeos.app           unveraendert -- `updated_at` 01:20 Uhr
                               (aus G-306, `rollover_count` 1),
                               die Buehne lief ab ~02:00 Uhr;
                               0 Logzeilen, 0 neue Mahlzeiten
    alle sieben Konten       0 Logzeilen
    committet                nein

`[read]` **Warum dev nicht betroffen sein KONNTE:** `[cmd]` das
Pausieren lief in der `test-user`-Sitzung, und
`nutrition.meal_plans` traegt eine `UPDATE`-Policy
(`meal_plans_update`). **Der Zeilenschutz trennt die Konten, nicht
die Sorgfalt.**

### Was ich NICHT gebaut habe

`[read]` **Keine zweite Schreibnaht** -- `bestaetigen` und
`ueberspringen` aus G-274 werden gerufen, `addMealItem` aus G-272
schreibt.
`[read]` **`meal_plan_day_to_diary` nicht angefasst** -- sie bleibt,
wo sie ist, ohne Aufrufer.
`[read]` **Kein Planpicker** -- `sequence` braucht ihn, Flow 3
Schritt 6 beschreibt ihn, er ist nicht beauftragt.
`[read]` **Kein MealCam-Weg** -- Flow 4 Case 1 ist nicht gebaut;
`confirmation_mode` ist deshalb immer `manual`.

### Was offen bleibt

`[cmd]` **`ladeTagesEintraege` (G-274) filtert den Planstatus nicht**
-- sie liefert die Positionen jedes Plans mit einem Tag an diesem
Datum, auch eines pausierten. **Der neue Leseweg tut es**, aber die
alte Funktion wird an anderer Stelle weiter benutzt. `[read]` **Ob
das dort stoert, habe ich nicht gemessen** -- es gehoert geprueft.

`[read]` **Und die Vorschau-kcal skalieren linear mit der Menge**,
waehrend der Schreibweg sie neu ueber `food_nutrient_snapshot`
rechnet. **Bei BLS-Werten ist das dasselbe** (die Funktion rechnet
`wert * amount_g / 100`); **ich habe es aber nicht fuer alle
Naehrstoffe nachgemessen**, nur fuer `enercc`.


## Abnahme

_(vom Orchestrator)_
