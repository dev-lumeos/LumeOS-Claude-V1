---
nr: G-348
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-343
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: dd20f24c
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/vorschlags-lage.ts
zahlen:
  gemessen: 2026-09-07
---

# G-348 — `wieGestern` ueberspringt manuelle Posten

## Befund

Aus G-343, Claude Code, 2026-09-07.

`[cmd]` **`wieGestern` ueberspringt Posten ohne `food_id`.**

`[cmd]` **Seit G-340 ist der Fall erreichbar:** `food_source =
'manual'` **traegt weder `food_id` noch `custom_food_id`.**

`[read]` **Quick-Add hat einen Fall geschaffen, den eine aeltere
Funktion nicht kennt.**

## Warum es zaehlt

`[read]` **Wer gestern *450 kcal Restaurant* eingetragen hat, findet
es in *Wie gestern* nicht wieder** — **und merkt nicht, warum.**

`[cmd]` **Die Funktion ueberspringt still** — **sie meldet nichts.**

`[read]` **Dasselbe Muster wie bei den Waechtern in G-343:** **eine
Funktion, die einen neuen Fall nicht kennt, wird nicht rot** — **sie
laesst ihn aus.**

## Zu tun

`[read]` **Manuelle Posten mitnehmen.** `[cmd]` **Sie tragen
`food_name`, `amount_g` und `nutrients`** — **alles, was ein
Vorschlag braucht.**

`[read]` **Und pruefen, ob weitere Funktionen `food_id` als Pflicht
annehmen.** `[cmd]` **`custom_food_id` ist der dritte Fall** —
**`foods_custom` traegt 0 Zeilen, aber der Weg steht.**

## Auftrag — drei zweite Schreibwege

**Mitbeauftragt: G-350, G-152.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-348 — `wieGestern` ueberspringt manuelle Posten

`[cmd]` **Posten ohne `food_id` werden still uebersprungen.**
`[cmd]` **Seit G-340 ist der Fall erreichbar.**

`[read]` **Wer gestern *450 kcal Restaurant* eingetragen hat, findet
es in *Wie gestern* nicht wieder** — **und merkt nicht, warum.**

`[cmd]` **Manuelle Posten tragen `food_name`, `amount_g` und
`nutrients`** — **alles, was ein Vorschlag braucht.**

`[read]` **Und pruef, ob weitere Funktionen `food_id` als Pflicht
annehmen.** `[cmd]` **`custom_food_id` ist der dritte Fall** —
`foods_custom` traegt 0 Zeilen, **aber der Weg steht.**

### 2 · G-350 — der zweite Schreibweg fuer `is_checked`

`[cmd]` **Du hast ihn selbst gemeldet:** `rezepte-echt.tsx` **traegt
seit G-289 einen eigenen Weg.**

`[read]` **Er soll auf die neue Serveraktion umziehen** — **damit es
wieder einen gibt.**

`[read]` **Dasselbe Muster wie bei den Namenslisten (G-335):**
**zwei Wege auf dieselbe Spalte laufen frueher oder spaeter
auseinander.**

### 3 · G-152 — der Aktivitaetsstrom des Dashboards

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit C-353 ist die TTFB-Messung da, seit E-52 gilt:
gemeinsame Sichten statt sechs Abfragen.**

`[read]` **Wenn er eine Sicht braucht: melden, nicht bauen** —
`supabase/` **gehoert Codex.**

### Was nicht zu tun ist

**Kein zweiter Schreibweg** — das ist gerade der Befund.
**Nichts in `supabase/` aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    wieGestern      manueller Posten erscheint, belegt
    weitere         welche Funktionen food_id voraussetzen, gezaehlt
    is_checked      ein Schreibweg, gezaehlt
    G-152           gilt noch / was fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

**Claude Code, 2026-09-07.** Dev-Server auf 3200 **nicht neu
gestartet**. **Nichts in `supabase/` geaendert, nichts auf `dev`
geschrieben** — der Nachweis lief auf `test-user` (vorher 0/0) und
wurde gezaehlt zurueckgebaut.

---

## 1 · G-348 — der neue Fall, und ein zweiter dahinter

### Warum `food_id` allein nicht genuegt

`[cmd]` **Der CHECK erlaubt DREI Faelle, und ZWEI davon haben
`food_id IS NULL`:**

    bls      food_id NOT NULL, custom_food_id NULL
    custom   food_id NULL,     custom_food_id NOT NULL
    manual   food_id NULL,     custom_food_id NULL

`[read]` **`if (!it.food_id) continue` traf damit beide** — und
meldete keinen. **Wer nur `food_id` liest, kann `manual` und
`custom` nicht unterscheiden und behandelt beide gleich falsch.**

`[cmd]` **Der Leseweg lieferte `food_source` gar nicht** — er holte
`id, meal_id, food_id, food_name, amount_g, …`. **Ohne sie war der
Fall im Browser nicht erkennbar.**

**Gebaut:** `food_source` und `custom_food_id` durch die ganze Kette
— Abfrage, Parser, Typ. **Ein Waechter prueft alle drei Glieder**,
denn fehlt eines, steht dort still ein Vorgabewert.

### Was `wieGestern` jetzt tut

`[cmd]` **Manuelle Posten gehen ueber `art: 'manuell'`** (G-340),
nicht ueber `position`. `[read]` **Ihre Zahlen sind bereits absolut
und duerfen nicht neu eingefroren werden** — `computeFrozenNutrients`
rechnet je 100 g hoch, und ein Restaurantteller hat keine Naehrwerte
je 100 g.

`[cmd]` **Fehlende Makros bleiben `undefined`, nicht `0`** — ein
fehlendes Makro heisst *unbekannt*, nicht *null Gramm* (C-48
Regel 1).

`[cmd]` **`custom` bleibt aussen vor** — `foods_custom` hat 0
Zeilen, Flow 6 fehlt. `[read]` **Aber nicht mehr still:** die Zahl
der uebersprungenen Posten wird gezaehlt und gesagt. **Das war der
Befund** — nicht das Ueberspringen, sondern das stille.

### Der zweite Fall, den die Suche gefunden hat

`[cmd]` **`rezept-write.ts` trug denselben Skip** (Zeile 235 vor dem
Bau, heute 252):
`if (!z.food_id) continue` beim Rezept-Loggen.

`[cmd]` **`recipe_ingredients.food_id` ist NULL-bar** — heute 0 von
22 Zeilen, **aber der Weg steht.**

`[read]` **Mitnehmen geht dort NICHT:** eine Zutat ohne `food_id`
traegt nur `food_name_snapshot`, keine Naehrwerte. **Sie zu
uebernehmen hiesse, Zahlen zu erfinden** (C-378). **Also bleibt es
beim Ueberspringen — aber gezaehlt**, und der Aufrufer bekommt die
Zahl.

### Am Schirm nachgewiesen — und dabei ein groesserer Befund

`[cmd]` **Buehne auf `test-user`** (vorher 0/0): gestern eine
Mahlzeit plus Quick-Add *Pasta im Ristorante, 450 kcal*, heute
*Same as yesterday*.

`[cmd]` **Beim ersten Versuch kam nichts an** — und der Grund ist
nicht meine Aenderung:

`[cmd]` **Quick-Add legt den Posten auf `other` (Sonstiges).**
`[cmd]` **`wieGestern` sucht die Mahlzeit MIT DEMSELBEN `meal_type`**
(`mahlzeiten.tsx:757`). `[cmd]` **Und die leeren Karten kommen aus
`rasterZeilen`, das nur die VIER Rasterreihen kennt** —
`breakfast`, `lunch`, `dinner`, `snack`.

`[cmd]` **Gemessen: die Karten des Tages sind Fruehstueck,
Mittagessen, Abendessen, Snack** — **es gibt keine Karte
*Sonstiges*, also auch keinen Knopf dafuer.**

`[read]` **Ein Quick-Add-Posten auf `other` ist ueber *Wie gestern*
gar nicht erreichbar** — unabhaengig von diesem Auftrag. **Das ist
ein eigener Befund.**

`[cmd]` **Auf einer sichtbaren Reihe belegt:** Posten auf `snack`
gelegt, *Same as yesterday* der Snack-Karte geklickt —
**`posten_uebernommen: true`, 450 kcal da.**

`[cmd]` **Die uebernommene Zeile, direkt gelesen:**

    manual | Pasta im Ristorante | 1.00 | 450.0000 | prot625 NULL

`[cmd]` **Danach gezaehlt zurueckgebaut** — 10 Posten, 6 Mahlzeiten
(mehrere Probelaeufe), `test-user` wieder 0 | 0.

---

## 2 · G-350 — ein Schreibweg, gezaehlt

`[cmd]` **Zwei Wege schrieben `is_checked`:**

    rezept-write.ts        postenHaken, ueber /api/nutrition/rezept
    einkaufsliste-aktionen postenAbhaken, Serveraktion (G-345)

`[cmd]` **Beide taten dasselbe** — `update({ is_checked }).eq('id')`;
meiner filtert zusaetzlich auf `user_id`.

`[read]` **Der neue gewinnt nicht wegen seines Alters, sondern wegen
seines Ortes:** **eine Einkaufslisten-Aktion unter `/rezept` waere am
falschen Platz**, seit die Liste laut E-64 drei Orte hat.

**Umgezogen und entfernt** (A-59):

    rezepte-echt.tsx    ruft jetzt postenAbhaken
    route.ts            der Zweig `posten_haken` ist weg
    rezept-write.ts     postenHaken, postenHakenSchema, PostenHaken weg
    rezept-lage.test    FUENF Vorgaenge -> VIER, plus Abwesenheitszusage

`[cmd]` **Gezaehlt, ueber den ganzen Baum:** `is_checked` wird an
**genau einer** Stelle geschrieben.

`[read]` **Der bestehende Waechter hielt den alten Weg am Leben** —
er verlangte fuenf Vorgaenge in der Route. **Dieselbe Regel, andere
Richtung:** *,,ein Schreibweg ohne Aufrufer ist tot"* stand in seinem
eigenen Kommentar.

---

## 3 · G-152 — gilt unveraendert, und die Sicht fehlt weiter

`[cmd]` **Gemessen am 2026-09-07: es gibt KEINE gemeinsame
Ereignissicht.** Die Suche nach `event`, `activity`, `ereignis`,
`strom` findet nur `search_events` und `supplement_cycle_events` —
beides Fachtabellen, keine Sicht ueber Module.

`[cmd]` **Die Zeitpunkte sind vollstaendig, und sie sind GEWACHSEN:**

    meals.meal_time              2899/2899   (im Punkt: 725/725)
    intake_logs.intake_time        744/744   (im Punkt: 360/360)
    workout_sessions.started_time    66/66   (im Punkt:  30/30)

`[read]` **Der Punkt sagt: *,,Es fehlt eine Entscheidung, keine
Spalte."*** `[cmd]` **Die Entscheidung ist seit E-52 gefallen** —
*,,zusammenfassen als eine sicht in der db"*. **Was fehlt, ist die
Sicht.**

`[read]` **`supabase/` gehoert Codex.** **Deshalb melde ich, statt
zu bauen** — wie der Auftrag es sagt.

### Ein Nebenbefund zum Zeitraum

`[cmd]` **Ein Strom der letzten 7 Tage haette auf `dev` gezeigt:**
31 Mahlzeiten, 1 Trainingseinheit, **0 Supplement-Einnahmen.**

`[cmd]` **Nicht weil das Modul schweigt** — `intake_logs` reicht von
2026-05-22 bis 2026-08-19, **also 17 Tage zurueck.**

`[read]` **Ein Strom wuerde ein Modul als still zeigen, das nur
aeltere Daten hat.** **Wer ihn baut, sollte den Zeitraum so waehlen,
dass das nicht wie ein Ausfall aussieht** — oder es sagen.

---

## Waechter

`[cmd]` **Neu: `__tests__/manuelle-posten-mitnehmen.test.ts`,
9 Waechter:**

    die Dateiproben finden ihre Dateien
    food_source kommt durch den ganzen Leseweg (Kette dreifach)
    wieGestern nimmt manuelle Posten mit
    was nicht mitkommt, wird gesagt
    auch das Rezept-Loggen zaehlt, was es auslaesst
    ein uebernommener manueller Posten haelt den CHECK
    is_checked wird an GENAU EINER Stelle geschrieben (gezaehlt)
    die Rezeptkarte benutzt die Serveraktion
    der alte Weg ist entfernt, nicht nur unbenutzt

`[cmd]` **Einer nachgezogen:** `rezept-lage.test.ts` — fuenf
Vorgaenge auf vier, plus die Zusage, dass `posten_haken` nicht
zurueckkehrt.

`[read]` **Der siebte ist der tragende:** **er zaehlt ueber den
ganzen Baum**, statt eine Stelle zu pruefen. **Ein `assert.match`
faende den ersten Weg und uebersaehe den zweiten** — genau der
Fehler, der G-350 verursacht hat.

## Sabotageprobe: 10 Eingriffe, 10 Faelle

    faellt   der alte Skip kommt zurueck
    faellt   der manuelle Posten geht ueber `position`
    faellt   ein fehlendes Makro wird 0
    faellt   das Ueberspringen wird wieder still
    faellt   die Abfrage holt food_source nicht mehr
    faellt   der Parser verwirft food_source
    faellt   das Rezept-Loggen ueberspringt wieder still
    faellt   die Rezeptkarte schreibt wieder selbst
    faellt   ein zweiter Schreibweg entsteht
    faellt   der Routenzweig kommt zurueck

`[cmd]` **Nach dem Rueckbau keiner rot.**

`[read]` **Der neunte ist der wichtigste** — er legt eine zweite
Schreibfunktion an, und der Zaehler faellt. **Ohne ihn waere die
Zusage *,,ein Weg"* nur eine Behauptung.**

## Bildschirmfotos

    backup/g348-gestern.png   der manuelle Posten von gestern
    backup/g348-heute.png     uebernommen, mit 450 kcal

## Laeufe

    pnpm --filter @lumeos/web test      1412 gruen, 0 rot  (+9)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.

## Datenstand nach dem Lauf

    dev                     730 Mahlzeiten, 2.300 Posten
    davon nicht 'bls'       0        <- nichts von mir auf dev
    test-user               0 | 0    <- Buehne geraeumt

## Neue Befunde

    1  Ein Quick-Add-Posten auf `other` ist ueber *Wie gestern*
       gar nicht erreichbar: `rasterZeilen` kennt nur die vier
       Rasterreihen, also gibt es keine Karte *Sonstiges* und
       keinen Knopf. Eigener Punkt.

    2  `intake_logs` endet am 2026-08-19 (17 Tage zurueck). Ein
       Aktivitaetsstrom ueber 7 Tage zeigte Supplements als still,
       obwohl nur die Seeds aelter sind.

    3  G-152 braucht weiterhin eine Sicht (Codex, E-52) — die
       Entscheidung ist gefallen, die Sicht fehlt.

## Nicht getan

    kein zweiter Schreibweg — das war der Befund
    nichts in supabase/ geaendert
    G-152 nicht gebaut — gemessen und gemeldet, wie beauftragt
    nichts auf dev geschrieben
    nicht committet, nicht gestaged, nicht gepusht

## Abnahme

**2026-09-07, Orchestrator.** `[cmd]` Neun Waechter, 10 von 10
Sabotagen.

### Das Ueberspringen wird gezaehlt und gesagt

`[cmd]` **Manuelle Posten kommen in *Wie gestern* mit,
`food_source` geht durch die ganze Lesekette.**

`[read]` **Und der zweite Teil ist der wichtigere:** **das
Ueberspringen wird gezaehlt und benannt.**

`[read]` **Vorher sprang die Funktion still** — **wer nichts fand,
erfuhr nicht, dass etwas ausgelassen wurde.** `[read]` **Dieselbe
Klasse wie ein Waechter, der still gruen wird.**

`[cmd]` **Und ein zweiter Skip im Rezept-Loggen gefunden** — **im
Auftrag stand *pruef, ob weitere Funktionen `food_id` als Pflicht
annehmen*.** **Er hat einen gefunden.**

### G-350 — ein Schreibweg, und der alte ganz weg

`[cmd]` **Route, Funktion und Schema entfernt** — **nicht nur der
Aufruf.**

`[read]` **Das ist mehr als beauftragt:** **ich schrieb *,,der alte
zieht um"*** — **er hat ihn abgebaut.**

`[read]` **Richtig: ein Weg, der nur nicht mehr gerufen wird, ist
weiter da** — **und der naechste findet ihn.**

### Drei Befunde, alle ausserhalb des Auftrags

`[cmd]` **1. `other` ist ueber *Wie gestern* nicht erreichbar** —
`rasterZeilen` kennt nur die vier Rasterreihen. **Als G-351.**

`[cmd]` **2. G-152 braucht die Sicht von Codex** — **die
Entscheidung ist mit E-52 laengst gefallen.**

`[cmd]` **3. `intake_logs` endet am 19.08.** — **ein
7-Tage-Strom wuerde Supplements faelschlich als still zeigen.**

`[read]` **Der dritte ist der interessante:** **eine richtige
Funktion auf altem Bestand erzeugt eine falsche Aussage.**

`[read]` **Und er haette es gebaut und niemand haette es
gemerkt** — **die Kachel waere leer gewesen, und leer sieht aus wie
*nichts eingenommen*.** **Als C-412.**

**Abgenommen.**

