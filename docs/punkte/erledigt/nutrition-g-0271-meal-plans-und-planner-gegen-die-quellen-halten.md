---
nr: G-271
typ: messung
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 1a2032b0
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---
# G-271 — Meal plans und Planner gegen die Quellen halten

## Befund

**Tom, 2026-08-29:** *,,meal plans (gegenchecken mit specs und altem
repo, da fehlt einiges)"* und *,,planner ebenfalls alles
gegenchecken, das ist nur irgendeine uebersicht oder darstellung"*.

`[read]` **Zwei Reiter, dieselbe Frage: was verlangt die Spec, und
was steht da?**

`[cmd]` **`SPEC_03_USER_FLOWS` fuehrt fuenf Ablaeufe zu Plaenen** —
Plan-Aktivierung, Ghost Entry bestaetigen in vier Faellen, und den
Plan-Lebenszyklus in drei Varianten.

`[cmd]` **`SPEC_10_COMPONENTS` nennt neun Komponenten:**
`MealPlanList`, `MealPlanCard`, `MealPlanDetail`,
`MealPlanActivationModal`, `MealPlanDayView`,
`MealPlanComplianceBar`, `GhostEntryList`, `LifecyclePicker`, dazu
`ShoppingListView`.

`[read]` **Der Planner steht in keiner dieser Listen** — **was er
sein soll, ist die erste Frage.**

## Auftrag — Meal plans und Planner, gegen die Quellen

**Mitbeauftragt: G-267, G-268, G-269, G-270, G-265, G-266.**
Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[read]` **Und die Befunde kommen von Tom, nicht von mir** — er ist
das Modul am 29.08. durchgegangen. **Seine Worte stehen je Punkt
woertlich drin.**

`[cmd]` **Der gebaute `/v2/`-Stand ist der Massstab.** `theme-v1`
nachschlagen, wenn etwas fehlt und die Frage ist, wie es gemeint war.
**Der Baum ohne `/v2/` bleibt unberuehrt.**

### 1 · Messen, bevor gebaut wird

**Tom:** *,,meal plans (gegenchecken mit specs und altem repo, da
fehlt einiges)"* und *,,planner ebenfalls alles gegenchecken, das ist
nur irgendeine uebersicht oder darstellung"*.

`[cmd]` **`SPEC_10_COMPONENTS` nennt neun Plan-Komponenten**,
`SPEC_03_USER_FLOWS` fuenf Ablaeufe. `[read]` **Je Komponente ein
Urteil: gebaut, fehlt, oder ueberholt.**

`[read]` **Der Planner steht in keiner dieser Listen** — **was er
sein soll, ist die erste Frage, nicht die letzte.** `[cmd]` **G-099
und G-072 fuehren dazu Befunde.**

### 2 · Was ohne Entscheidung gebaut werden kann

**G-265 — `+ Add` im Food DB oeffnet das falsche Modal.** `[read]`
**Miss, welches es oeffnet und welches es sein muesste.**

**G-267 — *New plan* tut nichts.** `[read]` **Ob der Knopf gebaut
werden kann, haengt an G-268 und den beiden Datenpunkten darunter.**

### 3 · Was gemeldet statt gebaut wird

**G-270 — die drei Attrappen im Meal-plans-Reiter.** `[cmd]` **Die
rechte Kachel sagt den Grund selbst:** *,,Lebenszyklus, Startdatum
und Bestaetigungsmodus fehlen im Schema."* `[cmd]` **C-238 und C-239
fuehren dieselbe Luecke.**

`[read]` **Keine drei Anzeigefehler, sondern eine Datenluecke mit
drei Symptomen** — **und das Schema gehoert Codex.**

**G-269 — Plaene von Coach und Marketplace.** `[read]` **Die Herkunft
ist mehr als ein Etikett:** ein Coach-Plan darf vermutlich nicht frei
bearbeitet werden. `[cmd]` **Das beruehrt `coach.client_autonomy` und
E-29** — Modulzugriffe auf `coach` gehen ueber eine Funktion.

### 4 · G-266 ist eine Entscheidung

`[read]` **Miss die drei Wege und leg sie mit Zahlen vor, entscheide
nicht.** Tom hat ausdruecklich um Vorschlaege gebeten.

### Was nicht zu tun ist

**Keine Tabelle anlegen, kein Schema aendern** — Codex hat den
Bereich.
**Keine zweite Ansicht neben eine bestehende.** `[cmd]` **Dreimal
passiert**, in G-253 hast du es selbst verhindert.
**Nichts erfinden, wo Daten fehlen** — eine Kachel, die sagt was ihr
fehlt, ist besser als eine mit erfundenen Zahlen.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Spec-Komponente ein Urteil   gebaut / fehlt / ueberholt
    Planner                        was ist er heute, was soll er
                                   sein
    G-265                          welches Modal, welches waere
                                   richtig
    G-267                          gebaut oder begruendet nicht
    G-270                          woran genau haengt jede der drei
    G-266                          drei Wege mit Zahlen, nicht
                                   entschieden
    Attrappen                      am Schirm gezaehlt, vorher /
                                   nachher (A-59)
    Ladezeit                       ms je Reiter, kalt und warm
    Bildschirmfoto je Zustand      `node tools/schuss.mjs`

`[read]` **Die letzten Zeilen sind Pflicht, weil dieser Auftrag breit
ist** — **ein Bericht ohne Zahlen waere hier nicht pruefbar.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30, A-59, A-60**, und **`.limit()` hebt den
PostgREST-Deckel nicht auf.**
`[cmd]` **Und ein `await` in einer Schleife kostet je Durchlauf voll**
— dein eigener Befund aus G-252.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-29.** Alle Zahlen mit Nutzer und Zeitraum,
`dev@lumeos.app`, Stichtag 2026-08-29.

### Die Kurzfassung

**Tom hat recht, und der Befund ist groesser als benannt.** `[cmd]`
**Fuenf Attrappen, nicht drei** — Tom sah drei im Unterreiter *Active
plan*, zwei weitere stehen unter *Shopping list*.

`[cmd]` **`+ Add` oeffnete kein falsches Modal — es oeffnete gar
keins.** Der Knopf ist ein Link, und die Zielseite las seinen
Parameter nie: **leeres Feld, null Treffer, das Lebensmittel nirgends
genannt.** **Behoben und gemessen: jetzt 3 Treffer, Lebensmittel
gewaehlt, 101 Naehrwerte.**

`[cmd]` **Zwei Praemissen sind gefallen, beide zugunsten des Bestands:**
`nutrition.shopping_lists` **existiert** (der Quelltext sagt, sie
fehle), und `coach.client_autonomy.nutrition_level` **existiert und
ist gefuellt** — die Achse, die G-269 braucht.

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| je Spec-Komponente ein Urteil | **9 von 9**, Tabelle unten |
| Planner | **`MealPlanDayView` x 7, echt gerechnet — reine Anzeige, kein Schreibweg** |
| G-265 | **kein Modal, sondern ein Link auf eine leere Seite — behoben** |
| G-267 | **nicht gebaut, begruendet** — Startdatum und Lebenszyklus fehlen im Schema |
| G-270 | **eine Datenluecke, drei Symptome** — je Kachel benannt |
| G-266 | **drei Wege mit Zahlen, nicht entschieden** |
| Attrappen | **plans 3, planner 0, foods 0** — vorher wie nachher; **+2 unter Shopping list** |
| Ladezeit | plans **3.492 / 2.745 ms**, planner **3.141 / 2.687**, foods **5.237 / 4.112** |

### 1 · Je Spec-Komponente ein Urteil

`[cmd]` **Kein Bauteil traegt seinen Spec-Namen** — `MealPlanList` und
die acht anderen kommen im Quelltext nirgends vor. **Geurteilt wird
nach Funktion am Schirm, nicht nach Bezeichner.**

| Komponente | Urteil | Beleg |
|---|---|---|
| `MealPlanList` | **gebaut** | *Plan library*: 1 aktiver Plan + 3 Wochen mit Datum, Tagen, Eintraegen. 0 Attrappen |
| `MealPlanCard` | **teilweise** | Name, Status, Tage, Eintraege — **ohne Quelle (G-269) und ohne kcal/Tag** |
| `MealPlanDetail` | **teilweise** | *Active plan* zeigt Umfang und Ziele; **das Tages-Accordion steht im Planner, nicht hier** |
| `MealPlanActivationModal` | **fehlt** | braucht Startdatum + Lifecycle — **beide Spalten gibt es nicht** |
| `MealPlanDayView` | **gebaut** | der Planner ist genau das, siebenmal nebeneinander |
| `MealPlanComplianceBar` | **Attrappe** | *7-day compliance*, erfundene Zahlen |
| `GhostEntryList` | **Attrappe** | *Today's ghost entries*, 5 Eintraege mit Zustaenden ohne Schema |
| `LifecyclePicker` | **Attrappe** | *Lifecycle types*, keine der drei Spalten existiert |
| `ShoppingListView` | **Attrappe — aber die Tabelle ist da** | siehe Teil 5 |

`[read]` **Drei gebaut, zwei teilweise, eine fehlt, drei Attrappen.**

### 2 · Der Planner — was er ist

**Tom:** *,,das ist nur irgendeine uebersicht oder darstellung"*.

`[cmd]` **Gemessen: er ist mehr als eine Darstellung, aber Tom hat
trotzdem recht.** Der Planner zeigt echte Daten — 7 Tage x 4 Reihen,
28 Eintraege, **kcal je Zelle aus `recipe_nutrition` und
`food_nutrient_snapshot` gerechnet**, nicht gewuerfelt. Die Reihen
kommen aus `meals_per_day`/`snacks_per_day` (G-72). **0 Attrappen.**

`[read]` **Was fehlt, ist jeder Schreibweg:** keine Zelle ist
anklickbar, `Copy week` und `New recipe` sind die einzigen Aktionen.
**Er zeigt einen Plan, er bearbeitet keinen.**

`[read]` **Damit ist die erste Frage beantwortet:** der Planner ist
`MealPlanDayView` ueber eine Woche gelegt. **In der Spec fehlt er
nicht, weil er ueberfluessig waere, sondern weil die Spec ihn unter
einem anderen Namen fuehrt.**

### 3 · G-265 — kein falsches Modal, sondern gar keins

**Tom:** *,,food db +add falsches modal"*.

`[cmd]` **Gemessen, vorher:**

    +Add ist ein <Link> auf /v2/nutrition/suche?food=<id>
    Modale offen nach dem Klick             0
    Suchfeld auf der Zielseite              ""      (leer)
    Trefferzeilen                            0
    Lebensmittel auf der Seite genannt      nein

`[cmd]` **Die Ursache:** `suche/page.tsx` liest `searchParams` nicht,
und `foodId` floss in `ansicht.tsx` nur in ABGEHENDE Anfragen.
**Der Parameter wurde nie ausgewertet.**

`[read]` **Tom hat es „falsches Modal" genannt, weil ein Klick auf
`+ Add` etwas oeffnen soll.** **Gemessen ist es schlimmer:** der
Knopf verlaesst den Reiter **und tut nichts.**

**Behoben, zwei Zeilen:** die Zielseite liest `?food=` und `?q=` beim
Start, der Link nimmt den Namen mit.

`[cmd]` **Gemessen, nachher:** Suchfeld *,,Reis poliert, roh"*,
**3 Treffer**, Lebensmittel gewaehlt, Detailtafel mit **101
Naehrwerten**.

`[cmd]` **Ein Zwischenschritt war falsch und ist berichtigt:** erst
ging `name_display_de` mit — *,,Weisser Reis (roh)"* — und die
Volltextsuche fand **0 Treffer**, weil die Klammer nicht normalisiert
wird. **`name_de` („Reis poliert, roh") trifft.** Ein Test haelt es
fest.

`[read]` **Was `+ Add` eigentlich sein muesste, ist NICHT gebaut:**
ein Erfassungsmodal, das Menge und Mahlzeit abfragt und ins Tagebuch
schreibt. `[cmd]` **`NutritionModale` fuehrt vier Modale** —
`mealcam`, `customfood`, `quickadd`, `nutsettings` — **keines
schreibt ein Lebensmittel in `diary_entries`.** **Gemeldet, nicht
erfunden.**

### 4 · G-267 und G-268 — nicht gebaut, und warum

`[cmd]` **Gemessen: *New plan* tut nichts** — keine Adressaenderung,
kein Modal, keine sichtbare Wirkung.

`[read]` **Und er kann heute nichts tun.** `[cmd]`
`nutrition.meal_plans` fuehrt 13 Spalten — **`lifecycle`,
`start_date` und ein Bestaetigungsmodus sind nicht darunter.**
`[cmd]` `meal_plan_entries` fuehrt **keinen Status** (C-238).

`[read]` **Ein Knopf, der ein Formular oeffnet und die Haelfte der
Felder nicht speichern kann, ist schlimmer als einer, der wartet.**
**Also nicht gebaut** — und ein Test verbietet, dass der Reiter
Spalten benutzt, die es nicht gibt.

**G-268 (Bearbeiten) haengt an derselben Vorbedingung.** `[cmd]`
Lesen geht (2 Plaene, 6 Wochen, 112 Eintraege), **Schreiben gibt es
nirgends.**

### 5 · G-270 — eine Datenluecke, und eine Praemisse faellt

`[cmd]` **Die drei Attrappen haengen an genau zwei fehlenden
Spaltengruppen:**

    Today's ghost entries   braucht meal_plan_entries.status   (C-238)
    Lifecycle types         braucht meal_plans.lifecycle        (C-239)
    7-day compliance        braucht beides plus eine Zeitreihe

`[read]` **Die rechte Kachel sagt es selbst, und sie sagt die
Wahrheit** — ich habe es gegen `information_schema` geprueft.

`[cmd]` **ABER: die vierte und fuenfte Attrappe stehen unter
*Shopping list*, und dort ist die Lage anders.**
**`nutrition.shopping_lists` EXISTIERT** — mit `source_type`,
`status`, `meal_plan_week_id`, **1 Zeile und 6 Positionen.**
`[cmd]` **Fuer `dev` sind es 0.**

`[read]` **Die Kachel ist also Attrappe, weil dev keine Liste hat —
nicht, weil die Tabelle fehlt.** `[cmd]` **Der Quelltext behauptet
das Gegenteil** (*,,eine Tabelle (`shopping_lists`, C-175)"* als Grund
fuer die Attrappe). **Das ist heute falsch und gehoert berichtigt** —
ich habe es nicht angefasst, weil es Codex' Bereich streift.

### 6 · G-269 — die Achse existiert bereits

`[cmd]` **`nutrition.meal_plans` hat KEINE Herkunftsspalte** im Sinne
von selbst/Coach/Marktplatz. `measurement_source` traegt bei beiden
Plaenen `seed` — **das ist die Messherkunft (017), nicht die
Planherkunft.**

`[cmd]` **Aber `coach.client_autonomy` existiert und ist gefuellt:**
5 Zeilen, `nutrition_level` mit `CHECK (1..5)`. **`dev` steht auf
Stufe 3 und hat einen Coach.**

`[read]` **Damit ist G-269 kleiner als gedacht:** die Frage *,,darf
dieser Plan bearbeitet werden?"* hat bereits eine Datenquelle. **Was
fehlt, ist die Herkunft am Plan** — und die Regel, welche Stufe was
erlaubt. `[cmd]` **Zwei Protokollfunktionen gibt es
(`log_autonomy_change`, `log_permission_change`), eine Lesefunktion
fuer E-29 habe ich nicht gefunden.**

**Nicht gebaut** — Herkunft ist eine Schemafrage (Codex), die
Stufenregel eine Entscheidung.

### 7 · G-266 — die drei Wege, mit Zahlen

**Tom:** *,,koennte man direkt da als pulldown einbinden unter filters
oder mach andere vorschlaege"*.

`[cmd]` **Gemessen:** die Detailsuche ist eine schlanke Seite —
**13 Bedienelemente**, Meister-Detail mit Naehrwerttafel (101 Werte
je Lebensmittel), **3.004 ms kalt**. Der Food-DB-Reiter zeigt
**50 Trefferzeilen**, der Filter-Knopf sitzt bei **y=231**.

| Weg | dafuer | dagegen |
|---|---|---|
| **A · eigene Seite behalten** (heute) | volle Naehrwerttafel, eigener Rahmen; **kostet nichts, ist gebaut** | der Nutzer verliert die Trefferliste — **Toms Befund** |
| **B · Ausklappbereich unter Filters** | Trefferliste bleibt stehen; die Stelle ist da (y=231) | **101 Naehrwerte in einer Ausklappzeile** — das ist eine Seite mit schlechterem Rahmen |
| **C · eigene Seite, Zustand mitnehmen** | ein Handgriff — **die Haelfte ist mit G-265 schon gebaut**; wer mit *reis* wechselt, findet es dort | der Wechsel bleibt ein Seitenwechsel |

`[read]` **Weg C ist nach G-265 fast fertig:** die Zielseite liest
jetzt `?q=` und `?food=`. **Was fehlt, ist der Rueckweg** — und die
Uebergabe des Suchfelds statt nur einer Zeile.

`[read]` **Meine Messung stuetzt C, entscheiden soll es Tom.**

### 8 · Die Sabotagen — 6 von 6 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | der Link nimmt keinen Suchbegriff mit | ja |
| 2 | Anzeigename statt Katalogname (0 Treffer) | ja |
| 3 | die Adresse wird nicht gelesen | ja |
| 4 | die Kennung laeuft nicht in die Suche | ja |
| 5 | der Starteffekt laeuft mehrfach | ja |
| 6 | ohne Parameter wird trotzdem gesucht | ja |

### 9 · Gate und Testlage

`[cmd]` **Typecheck sauber, Build gruen.** `[cmd]` **311 von 311
Nutrition-Tests gruen**, davon 7 neue. `[cmd]` **Encoding sauber,
Exit 0.** `[cmd]` **Attrappen am Schirm vorher wie nachher:** plans 3,
planner 0, foods 0 — **keine Doppelung**, keine zweite Ansicht.

**`pnpm gate` faellt an derselben Stelle wie in G-259 und nicht durch
mich:** `[index] docs/punkte/00-INDEX.md ist nicht auf dem Stand des
Frontmatters` — **die Abweichung kommt aus `laufend_codex/`** (C-239
wurde dort geloescht). **Alle uebrigen Schritte sind gruen.**

**Bildschirmfotos:** `g271-vorher-plans.png`, `-planner.png`,
`g271-plans-Plan-library.png`, `-Shopping-list.png`,
`g271-nachher-add.png`.

**Nichts auf `dev@lumeos.app` geschrieben — nur gelesen. Nicht
committet, nicht gestaget.**

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen.**

### `+ Add` war kein falsches Modal, sondern gar keins

`[cmd]` **Ein `Link`, dessen Ziel den `?food=`-Parameter nie gelesen
hat.** **Klick verlaesst den Reiter und landet auf einer leeren
Suchseite** — leeres Feld, 0 Treffer, das Lebensmittel nirgends.

`[cmd]` **Behoben und nachgemessen: Feld gefuellt, 3 Treffer,
Lebensmittel ausgewaehlt, 101 Naehrstoffe.**

`[read]` **Und der Zwischenschritt, der falsch war, steht im Bericht
statt verschwiegen:** `name_display_de` gibt 0 Treffer, weil die
Klammer nicht normalisiert wird — `name_de` traegt.

`[read]` **Was `+ Add` sein muesste, ist nicht gebaut:** `[cmd]`
**keins der vier vorhandenen Modale schreibt ein Lebensmittel in
`diary_entries`.** **Als G-272 angelegt.**

### Zwei Praemissen fielen zugunsten des Bestands

`[cmd]` **`nutrition.shopping_lists` existiert** — `source_type`,
`status`, eine Zeile mit sechs Positionen. `[read]` **Der Kommentar
im Code, der das Gegenteil behauptet, ist veraltet.**

`[read]` **Ein Kommentar altert zu einer falschen Behauptung, und
niemand prueft ihn** — dieselbe Klasse wie der G-64-Kommentar in
G-249, der vor genau der Falle warnte, in die der Code darunter lief.
**C-175 ist dadurch ueberholt.**

`[cmd]` **`coach.client_autonomy.nutrition_level` existiert und ist
gefuellt** — fuenf Zeilen, `CHECK 1..5`, `dev` auf Stufe 3 mit einem
Coach.

`[read]` **Damit ist die Autonomieachse aus G-269 bereits da.**
**Was fehlt, ist die Herkunftsspalte am Plan und die Regel, die eine
Stufe auf ein Bearbeitungsrecht abbildet.**

### Fuenf Attrappen, nicht drei

`[cmd]` **Zwei weitere unter dem Unterreiter *Shopping list*** — die
Tom nicht gesehen hat. `[read]` **Die Kachel ist Attrappe, weil `dev`
keine Liste hat, nicht weil die Tabelle fehlt.**

### Neun Spec-Komponenten, nach Funktion beurteilt

`[cmd]` **Drei gebaut, zwei teilweise, eine fehlt, drei Attrappen** —
**keine traegt ihren Spec-Namen.** `[read]` **Dieselbe Lehre wie in
G-138 und G-240: nach der Sache pruefen, nicht nach dem Namen.**

`[cmd]` **Der Planner ist `MealPlanDayView` mal sieben** — echte
Daten, gerechnete Kalorien, 0 Attrappen. `[read]` **Aber ohne
Schreibweg, und genau deshalb liest er sich als *,,nur eine
Darstellung"*.** **Toms Eindruck war richtig, die Ursache eine
andere.**

### G-267 nicht gebaut, und die Begruendung traegt

`[read]` ***,,Ein Knopf, der ein Formular oeffnet, das die Haelfte
seiner Felder nicht speichern kann, ist schlimmer als einer, der
wartet."***

`[cmd]` **Ein Test verbietet dem Reiter jetzt, Spalten zu nutzen, die
es nicht gibt.**

**Abgenommen.**

