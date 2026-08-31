---
nr: G-289
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 5bb0e056
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-rezepte.tsx
zahlen: null
---

# G-289 — Fünf Rezeptkomponenten fehlen

## Befund

`[cmd]` **`SPEC_10` nennt fuenf:** `RecipeList`, `RecipeCard`,
`RecipeBuilder` (*,,Rezept erstellen/bearbeiten mit Zutaten-Liste +
Live-Naehrstoffe"*), `RecipeDetail`, `RecipeLogModal`.

`[cmd]` **Gebaut ist keine.** `[cmd]` **Der Planner zeigt eine
Tabelle mit drei Rezepten, *New recipe* oeffnet die
*in Entwicklung*-Meldung.**

`[read]` **Tom, 2026-08-31:** *,,new recipe? kein plan was mir damit
sagen willst."*

## Was da ist

`[cmd]` **`nutrition.recipes` traegt 6 Zeilen, `recipe_ingredients`
die Zutaten.** `[cmd]` **Die Naehrwerte werden bei jedem Aufruf aus
den Zutaten gerechnet** — das steht so unter der Tabelle.

`[read]` **Die Daten sind da, die Oberflaeche fehlt vollstaendig.**

## Reihenfolge

`[read]` **`RecipeBuilder` ist der Kern** — ohne ihn ist *New recipe*
eine Attrappe. `[read]` **`RecipeLogModal` verbindet Rezept und
Tagebuch:** Portionen waehlen, Mahlzeitentyp, als Mahlzeit
eintragen — **und der Schreibweg dafuer steht seit G-272.**

## Auftrag — Flow 7 und Flow 8, vollstaendig

**Mitbeauftragt: G-288, G-300, G-297.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Entschieden: E-39

Tom, 2026-08-31: *,,schliess das sauber ab und lass es richtig bauen.
vorsehen dass coach und marketplace angebunden wird spaeter."*

`[cmd]` **`ADR_RECIPES_SCHEMA_ONLY` ist abgeloest.** `[read]` **Er
sagte: Schema ja, Oberflaeche Phase 2.** `[cmd]` **Und
`SPEC_10_PASS2_PATCH` FIX-7 fuehrt genau diese Komponenten als
*Schema-only V1 → Phase 2*.**

`[read]` **Die Begruendung war *,,wenn Zeit knapp wird"*** — **das
Schema steht seit Monaten, die Tabellen tragen Daten, und die Reiter
sind sichtbar.**

**Gebaut wird jetzt. Lies `docs/entscheidungen/E-39`.**

### Coach und Marketplace: vorsehen, nicht bauen

`[cmd]` **`SPEC_03` Flow 3 nennt die Beschriftung je Quelle:**
*,,Von [Coach-Name]"*, *,,Gekauft: [Produkt-Name]"*, *,,Erstellt von
Buddy"*, eigene ohne Label.

`[cmd]` **Die Herkunft steht im Schema:** `plan_origin` mit
`self_created`, `coach_created`, `marketplace`; `Recipe.source` mit
`user | coach | marketplace | buddy`.

`[read]` **Also: die Anzeige traegt die Unterscheidung, bevor es etwas
zu unterscheiden gibt.** `[cmd]` **Heute sind alle `self_created` —
das Etikett bleibt trotzdem vorgesehen.**

`[read]` **Nicht: einen leeren Coach-Bereich bauen.** `[cmd]` **E-29
gilt** — ein Zugriff auf `coach.*` ginge ueber eine Funktion, und die
Sperre aus G-269 steht bereits.

### Warum dieser Auftrag neu geschrieben wurde

`[read]` **Der Orchestrator hat `SPEC_10` gelesen — die
Komponentenliste — und daraus Punkte gemacht.** `[read]`
**`SPEC_03_USER_FLOWS.md` mit den vierzehn Ablaeufen hat er nicht
gelesen.**

`[read]` **Ergebnis: Bauteile ohne Bauplan.** Tom, 2026-08-31:
*,,willkuerlich irgendwas geseeded und aufgelistet wo keiner
definieren, anlegen oder editieren kann."*

**Lies `SPEC_03` Flow 7 und Flow 8, bevor du anfaengst.**

### Flow 7 — Rezept erstellen und als Mahlzeit loggen

    1  Rezept-Bereich -> "Neues Rezept"
    2  Name, Portionen, optional Beschreibung, Zeiten, Anleitung
    3  Zutaten hinzufuegen via Food Search
         Food suchen -> Menge in g
         mehrere Zutaten sammeln
         Live-Preview: Gesamt + je Portion (Makros + kcal)
    4  Speichern
    5  "Als Mahlzeit loggen"
         Anzahl Portionen waehlen
         Meal Type waehlen
         Bestaetigen -> Meal + MealItems, eine Zeile je Zutat,
         Naehrstoffe eingefroren

`[read]` **Schritt 3 ist G-300** — **die Lebensmittelsuche gehoert ins
Rezept, nicht in den Plan.** `[cmd]` **`food_search` steht: zehn
Sortierwerte, Herkunftsfilter, Treffergrund.**

`[cmd]` **Schritt 5 nutzt den Schreibweg aus G-272** — **keinen
zweiten.** `[read]` **Und *eingefroren* heisst: die Naehrwerte werden
beim Eintragen kopiert, nicht verlinkt** — **wie in G-272 gebaut.**

`[cmd]` **Die Live-Vorschau ist der Kern:** `nutrition.recipes` traegt
6 Zeilen, **die Naehrwerte werden bei jedem Aufruf aus den Zutaten
gerechnet** — **ein Rezept speichert sie nicht.**

### Und das Einzelfoods-Prinzip gilt

`[cmd]` **`ADR_GHOST_ENTRY_RECIPE` ist unberuehrt:** **ein Rezept ist
eine Vorlage.** `[read]` **Beim Loggen entstehen immer Einzelzutaten,
je Zutat ein `MealItem` mit eingefrorenen Naehrwerten.**

`[cmd]` **Und `SPEC_03_FLOW4_RECIPE_PATCH` sagt dasselbe fuer
Plaene:** ein Ghost Entry aus einem Rezept zeigt den Rezeptnamen als
Ueberschrift **und darunter alle Einzelzutaten mit eigenen
Mengenfeldern.**

`[read]` **Ein *,,Rezept als Einheit bestaetigen"* gibt es nicht** —
es braeche die Mengen-Anpassbarkeit je Zutat.

### Flow 8 — Einkaufsliste aus Rezept

    1  Rezept oeffnen -> "Einkaufsliste erstellen"
    2  Portionen waehlen (Standard: Rezept-Portionen)
    3  Generieren -> ShoppingList mit ShoppingListItems
         Food-Name + Menge skaliert
    4  Anzeigen: Titel, Portionen, Liste
    5  Items abhaken via Tap (is_checked)
    6  Teilen / Exportieren

`[read]` **Und damit ist die heutige Kachel widerlegt:** `[cmd]` **sie
sagt *,,Sie entsteht aus einer Planwoche"*** — **Flow 8 sagt: aus
einem Rezept.**

`[cmd]` **`ADR_RECIPES_SCHEMA_ONLY` ist durch E-39 abgeloest** — **die
Liste wird gebaut, nicht beschriftet.**

### G-297 — die Tagesdeckung

`[read]` **Der Orchestrator hat *kleiner* beauftragt.** **Falsch
gestellt.**

Tom: *,,die hoehe ist nun definiert fuer tagesdeckung, wieso verteilt
man dann nicht auf optimale groesse die grafik darin?"*

`[cmd]` **Die Kachel hat eine feste Hoehe — sie richtet sich nach der
Verlaufskachel daneben.** `[read]` **Das Gitter soll sie ausfuellen,
nicht schrumpfen.**

### Was nicht zu tun ist

**Nichts erfinden, was nicht in `SPEC_03` steht.**
**Wenn ein Schritt in der Spec fehlt: melden, nicht ausdenken.**
**Nichts auf `dev@lumeos.app` schreiben** — `test-user` mit Rueckbau.
Nicht committen, nicht stagen, nicht pushen.

### Die Vorlagen

    referenz/.../nutrition/components/RecipeBuilder.tsx  14 kB
    referenz/.../nutrition/components/RecipeList.tsx      8 kB
    referenz/.../nutrition/hooks/useRecipes.ts            4 kB

`[cmd]` **Fuer die Einkaufsliste gibt es keine Vorlage** — sie war nie
gebaut, in keiner Fassung.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Flow 7 Schritt 1-4    Rezept angelegt, mit Zutaten aus der
                          Suche, Live-Vorschau stimmt
    Flow 7 Schritt 5      als Mahlzeit geloggt, Naehrwerte
                          eingefroren, gezaehlter Rueckbau
    Flow 8                Liste aus Rezept, Mengen skaliert,
                          abhaken schreibt
    Tagesdeckung          fuellt die Kachelhoehe, Bildschirmfoto
    Attrappen             am Schirm, vorher / nachher
    fehlende Schritte     benannt, nicht ausgedacht

## Bericht

**Flow 7 und Flow 8 sind gebaut und im Browser gefahren.** Der
Rezept-Bereich ist ein eigener Reiter; die Einkaufsliste entsteht dort
aus einem Rezept. **Flow 3 hat wieder eine Uebersicht statt drei
Unterreitern**, und die Tagesdeckung fuellt ihre Kachel.

Alle Schreibproben auf **`test-user@lumeos.local`** mit gezaehltem
Rueckbau. **`dev` wurde nur gelesen** — 3 Rezepte vorher, 3 nachher.

### Zuerst drei Praemissen, die beim Messen gefallen sind

**1. `Recipe.source` gibt es im Schema nicht.**

`[cmd]` **Gemessen am 2026-08-31: `nutrition.recipes` hat 17 Spalten**
— darunter `measurement_source` (`manual|device|import|admin|seed`)
und `source_detail`. **Eine Spalte `source` ist nicht dabei**, in
keinem Schema ausser bei ganz anderen Tabellen.

`[read]` **Der Auftrag und E-39 sagen beide, `Recipe.source` trage die
Werte `user|coach|marketplace|buddy` schon.** **Das gilt fuer
`plan_origin` bei den Plaenen — fuer Rezepte nicht.**
`ADR_RECIPE_SOURCE_BUDDY` beschreibt ein Feld, das noch nicht
existiert.

`[read]` **Gebaut ist die Anzeige trotzdem, wie beauftragt:**
`quelleVon()` leitet ab und liefert heute fuer alles `user` — also
**kein Etikett**, wie Flow 3 es fuer eigene Rezepte verlangt. **Sobald
die Spalte kommt, wird aus der Ableitung ein Feldzugriff und die
Anzeige bleibt, wie sie ist.** `[read]` **Wichtig dabei:
`measurement_source` ist NICHT die Quelle** — es sagt, wie gemessen
wurde, nicht wer erstellt hat. Ein Waechter haelt die beiden
auseinander.

**2. `recipe_nutrition(id, p_servings)` teilt nicht — es skaliert.**

`[cmd]` **Am Funktionsrumpf gelesen:** `ri.amount_g * servings_used /
recipe.servings`. `[cmd]` **An echten Daten belegt:** ein Rezept mit
`servings = 1` liefert bei `p_servings = 1` **493,2 kcal** und bei
`p_servings = 2` **986,4** — das Doppelte. **Und
`recipe_nutrition(id, 4)` auf einem Vier-Portionen-Rezept ist ein
Nullvorgang.**

`[read]` **Fuer Flow 7 Schritt 3 („Gesamt + pro Portion") heisst das:
je Portion ist Gesamt GETEILT durch `servings`** — nicht ein zweiter
Aufruf mit `p_servings`. **Wer das verwechselt, zeigt zweimal
dieselbe Zahl, und beide sehen plausibel aus.** `[cmd]` **Im Browser
gegengeprueft: 1.310 gesamt, 327 je Portion bei 4 Portionen.**

**3. `foods` traegt keine Naehrwerte.**

`[cmd]` **14 Spalten, nur Namen und Kategorie.** Die Werte kommen aus
`food_nutrient_snapshot()` — derselben Funktion, die `recipe_nutrition`
und `addMealItem` benutzen. `[read]` **Meine erste Probe suchte
`foods.enercc` und lief ins Leere;** die Buehnenzaehlung hat es
gefangen, bevor vier Proben gruen gemeldet haetten, ohne etwas zu
pruefen.

### Flow 7 — Rezept erstellen und loggen

**Alle fuenf Schritte durch die Oberflaeche gefahren**, nicht per
`fetch` gegen die Route:

    1  „Neues Rezept"        Formular oeffnet
    2  Name, Portionen       gesetzt
    3  Zutaten via Suche     „Reis" 12 Treffer, „Aal" 12 Treffer,
                             je Menge in g
       Live-Vorschau         1.310 kcal gesamt / 327 je Portion
    4  Speichern             Rezepte 0 -> 1
    5  Als Mahlzeit loggen   2 Portionen von 4

`[cmd]` **Was Schritt 5 in der Datenbank hinterlassen hat:** eine
Mahlzeit `lunch` mit der Notiz *„Rezept: G-289 Browserrezept"*, **2
Positionen** (eine je Zutat), **655 kcal eingefroren**, 200 g gesamt.
`[read]` **200 g ist die Probe:** 2 von 4 Portionen aus (250 + 150) g
— **die Skalierung stimmt.**

`[cmd]` **Das Einfrieren macht `addMealItem` aus G-272**, nicht dieser
Auftrag. `[read]` **Ein eigener Insert in `meal_items` waere die
zweite Kopie derselben Regel gewesen** — ein Waechter verbietet ihn
ausdruecklich.

**Und das Einzelfoods-Prinzip steht im Dialog, nicht nur im Code:**
*„Es entstehen 2 Einzelzutaten im Tagebuch, nicht ein Sammeleintrag."*
`[read]` **Ohne den Satz waere die Erwartung „eine Zeile"** — es
werden so viele, wie das Rezept Zutaten hat (`ADR_GHOST_ENTRY_RECIPE`).

### Flow 8 — Einkaufsliste aus einem Rezept

    1  „Einkaufsliste" am Rezept    Dialog oeffnet
    2  Portionen waehlen            Vorgabe 4, gesetzt auf 8
    3  Generieren                   Liste mit 2 Posten
       Mengen skaliert              250 g -> 500 g, 150 g -> 300 g
    4  Anzeigen                     Titel, Portionen, Liste
    5  Abhaken                      HTTP 200, `is_checked = true`

`[cmd]` **In der Datenbank:** `source_type = 'recipe'`, `recipe_id`
gesetzt, `meal_plan_week_id` leer — **so verlangt es
`shopping_lists_source_target_check`.**

`[cmd]` **Und die heutige Kachel ist widerlegt und berichtigt:** sie
sagte *„Sie entsteht aus einer Planwoche"*. **Flow 8 sagt: aus einem
Rezept.** `[read]` **Das war die ZWEITE falsche Fassung desselben
Satzes** — die erste behauptete eine fehlende Tabelle (G-271). **Der
Waechter prueft jetzt die Quelle statt der Verfuegbarkeit**, weil das
die Aussage ist, die falsch werden kann.

`[cmd]` **Die Einheit kommt aus dem Posten, nicht aus einer
Annahme:** die Bestandsliste im Repo fuehrt *„250 ml"* Olivenoel, und
das steht so auf dem Schirm. `[read]` **Milliliter aus Gramm zu
rechnen waere eine Dichteannahme.**

### Flow 3 — eine Uebersicht statt drei Unterreitern (G-301)

`[cmd]` **`Active plan` / `Plan library` / `Shopping list` stehen in
keiner Spec.** `[cmd]` **Flow 3, Schritt 2 kennt EINE Uebersicht**, in
der ein Plan `status: active` traegt.

**Die Leiste ist weg**, der aktive Plan steht oben in derselben
Uebersicht. `[cmd]` **Der Shopping-Unterreiter ist ENTFERNT, nicht
abgeschaltet** (A-59) — mit ihm zwei Attrappenkarten (*„from Recomp
5-Meal Plan"*, Print/Export ohne Wirkung). **Die Attrappenzahl in
`tab-plans.tsx` faellt damit von 8 auf 6**, und der zugehoerige
Waechter ist mit Begruendung nachgezogen.

### Coach und Marketplace: vorgesehen, nicht gebaut

`[cmd]` **Die Etiketten je Quelle sind gebaut und geprueft:** eigene
**ohne Label**, *„Von [Coach-Name]"*, *„Gekauft: [Produkt-Name]"*,
*„Erstellt von Buddy"*. `[read]` **Eigene ohne Label ist die
tragende Regel** — wenn alles ein Etikett traegt, unterscheidet
keines mehr.

**Kein leerer Coach-Bereich, keine eigene Route, keine Sperre gegen
fremde Herkunft** — E-29 und G-269 gelten unveraendert.

### G-297 — die Tagesdeckung fuellt die Kachel

`[read]` **Der vorige Auftrag hiess „kleiner" und war falsch
gestellt** — berichtigt.

`[cmd]` **Gemessen: beide Kacheln 386 px hoch** (die Hoehe richtet
sich nach der Verlaufskachel), **unter dem 26-px-Gitter blieben 58 px
leer.** `[cmd]` **Nach der Aenderung: 463 px, 17 px Rest** — und
beide Kacheln bleiben gleich hoch.

`[cmd]` **`repeat(7, minmax(0, 1fr))` statt einer festen Obergrenze.**
`[read]` **Die 0 ist nicht schmueckend:** ohne sie kann eine Spalte
nicht unter ihre Inhaltsbreite schrumpfen, und auf 375 px sprengt das
Gitter die Karte. **Der Waechter aus dem vorigen Auftrag sicherte das
Gegenteil und ist mit Begruendung umgedreht.**

### Was in SPEC_03 fehlt — gemeldet, nicht ausgedacht

**Auftrag: *„Wenn ein Schritt in der Spec fehlt: melden, nicht
ausdenken."***

**1. Flow 8, Schritt 6: *„Teilen / Exportieren moeglich"*** — **ohne
Format, ohne Ziel, ohne Mechanismus.** `[read]` **Nicht gebaut.** Der
Satz steht an der Liste, damit die Luecke sichtbar ist statt
stillschweigend; ein Waechter verbietet einen erfundenen
Export-Knopf.

**2. Flow 7, Schritt 2 nennt `cooking_skill` nicht** — `[cmd]` **die
Spalte ist NOT NULL mit CHECK auf drei Werte.** `[read]` **Ohne
Angabe schlaegt der Insert fehl.** Gesetzt ist `beginner`, **und das
Feld steht im Formular**, damit die Vorgabe eine Wahl ist und keine
stille Setzung.

**3. Kein Flow beschreibt das Loeschen eines Rezepts** — nicht
gebaut. Bearbeiten deckt Flow 7 ab.

`[read]` **Und das Anlegen eines leeren Plans (C-370) ist unberuehrt
geblieben** — es steht weiterhin in keinem Flow, und dieser Auftrag
hat es nicht angefasst.

### Waechter und Sabotageprobe

**19 Waechter** in `apps/web/src/lib/nutrition/__tests__/rezept-lage.test.ts`.

`[cmd]` **24 Sabotagen einzeln gefahren, jede mit SHA-256-Rueckbau:
24 gefangen, 0 Ueberlebende, Nachlauf 0 Fehlschlaege** — **im ersten
Durchgang**, ohne Nachbesserung.

**Drei bestehende Waechter sind gefallen, alle drei zu Recht:**

    v2-attrappen  8 -> 6 Attrappen in tab-plans (Shopping-Reiter weg)
    v2-attrappen  2 -> 3 LeerHinweise (Rezepte-Reiter dazu)
    plan-lage     „Tabelle steht bereit" -> „aus einem Rezept"

`[read]` **Keiner davon war ein Fehlalarm** — sie haben genau die
Zahlen gehalten, die dieser Auftrag veraendert. **Alle drei sind mit
der Begruendung nachgezogen, nicht stillschweigend gesenkt.**

### Ein Fehler in meiner eigenen Probe

`[cmd]` **Die Browserprobe meldete zuerst *„0 von 2 erledigt"*** —
also ein nicht funktionierendes Abhaken. `[cmd]` **Ursache:
`button[aria-pressed]` trifft auch die Segmentschalter — 10 Treffer,
der erste leer.** `[read]` **Die Probe klickte den falschen Knopf**;
mit einem Selektor innerhalb der Listenkarte kommt **HTTP 200**, und
die Datenbank zeigt `is_checked = t` bei genau einem Posten.

`[read]` **Ohne die Netzwerkbeobachtung haette ich einen Defekt
gemeldet, den es nicht gibt.**

### Gate und Messung

`[cmd]` **`pnpm gate`: 11 von 11 Aufgaben gruen.** `[cmd]`
**`[serverimport]` 51 Client-Chunks, 0 Treffer.**

`[cmd]` **Attrappen je Reiter, einzeln ueber die Klasse gezaehlt:**

    rezepte    0 Attrappenkarten
    plans      0
    insights   0
    planner    0, aber 2 „in Entwicklung"-Knoepfe (Copy week,
               New recipe - beide aus G-97, nicht Teil dieses
               Auftrags)

`[read]` **Die „1", die `schuss.mjs` meldet, ist die Buddy-Leiste**
rechts, ausserhalb der Reiter.

`[cmd]` **Ladezeit, kalt / warm:** rezepte 1.697 / 1.519 ms, plans
1.648 / 1.702 ms, insights 2.893 / 2.775 ms. `[cmd]`
**Konsolenfehler: 1 je Reiter** — die bekannte
`data-mode`-Hydrationswarnung, vorbestehend.

### Geaendert

    neu   lib/nutrition/rezept-lage.ts             Flow 7/8, serverfrei
    neu   lib/nutrition/rezept-write.ts            5 Vorgaenge
    neu   lib/nutrition/rezept-lesen.ts            Rezepte + Listen
    neu   api/nutrition/rezept/route.ts            5 Arten
    neu   v2/nutrition/rezepte-echt.tsx            die 5 Komponenten
    neu   __tests__/rezept-lage.test.ts            19 Waechter
    ge.   v2/nutrition/ansicht.tsx                 Reiter + Zweig
    ge.   v2/nutrition/page.tsx                    Leseweg
    ge.   v2/nutrition/tab-plans.tsx               Unterreiter weg
    ge.   lib/nutrition/plan-lage.ts               Satz berichtigt
    ge.   v2/nutrition/insights-kacheln.tsx        G-297 ausfuellen
    ge.   __tests__/insights-lage.test.ts          G-297 umgedreht
    ge.   __tests__/plan-lage.test.ts              Quelle statt Tabelle
    ge.   shell/__tests__/v2-attrappen.test.ts     8->6, 2->3

**Nicht committet, nicht gestaget. Auf `dev` nur gelesen** — alle
Schreibproben auf `test-user`, vollstaendig zurueckgebaut; **die
Bestands-Einkaufsliste vom 2026-08-23 blieb unberuehrt** (1 Liste, 6
Posten vorher und nachher).

### Bilder

    backup/g289-rezepte.png          der Reiter mit dev-Rezepten
    backup/g289-browserprobe.png     Flow 7+8 auf test-user
    backup/g289-final-plans.png      Flow-3-Uebersicht ohne Unterreiter
    backup/g297-nachher.png          Tagesdeckung fuellt die Kachel

### Offen, fuer Tom

1. **`Recipe.source` fehlt im Schema.** Die Anzeige ist vorgesehen und
   geprueft, aber solange die Spalte fehlt, ist jedes Rezept `user`.
   **Ein Punkt fuer Codex waere: `recipes.source` mit demselben CHECK
   wie `plan_origin`** — dann wird aus der Ableitung ein Feldzugriff.
2. **Flow 8, Schritt 6 („Teilen / Exportieren")** braucht eine
   Entscheidung: Format und Ziel stehen nirgends.
3. `[cmd]` **Lebensmittel im Rezept sind auf BLS beschraenkt**
   (`food_source = 'bls'`). `recipe_ingredients` erlaubt auch
   `custom` — **eigene Lebensmittel im Rezept stehen in keinem Flow**
   und sind deshalb nicht gebaut.


## Abnahme

**2026-08-31, Orchestrator.** **Vom Orchestrator am Schirm
nachgesehen.**

`[cmd]` **Der Reiter heisst jetzt *ALLE PLAENE*, ein Bereich statt
drei.** `[cmd]` **Attrappen 8 auf 6, die Shopping-Unterreiter
entfernt statt versteckt.**

### Drei Praemissen meines Auftrags sind gefallen

`[cmd]` **1. `Recipe.source` existiert nicht.** `recipes` hat 17
Spalten, darunter `measurement_source` und `source_detail` — **kein
`source`.**

`[read]` **E-39 und mein Auftrag behaupten beide, die Werte seien
schon da.** **Das stimmt fuer `plan_origin` an den Plaenen, nicht fuer
Rezepte.** `[cmd]` **Und `ADR_RECIPE_SOURCE_BUDDY` beschreibt die
Erweiterung einer Spalte, die es nicht gibt.**

`[read]` **Er hat die Anzeige abgeleitet gebaut und einen Waechter
gesetzt, der `measurement_source` nicht mit Herkunft verwechseln
laesst.** **Als C-371.**

`[cmd]` **2. `recipe_nutrition(id, p_servings)` skaliert, sie teilt
nicht.** Ein Ein-Portionen-Rezept liefert 493,2 kcal bei
`p_servings=1` und 986,4 bei 2.

`[read]` **Flow 7 verlangt *je Portion* — das ist Gesamt geteilt durch
Portionen.** `[read]` **Haette er die Funktion genommen, staende
dieselbe Zahl zweimal da, und beide saehen plausibel aus.**

`[cmd]` **3. `foods` traegt keine Naehrwerte, nur Namen** — die Werte
kommen aus `food_nutrient_snapshot()`. `[cmd]` **Seine erste Probe
fragte `foods.enercc` ab und traf null Zeilen** — **die
Stufenzaehlung fing es, bevor vier Proben Erfolg gegen nichts melden
konnten.**

### Flow 7 und Flow 8 laufen durch

`[cmd]` **Suche → Gramm → Live-Vorschau (1.310 gesamt / 327 je
Portion) → speichern → loggen.** `[cmd]` **Das Loggen erzeugte eine
Mittagsmahlzeit mit 2 Positionen, 655 kcal eingefroren, 200 g** —
**genau (250+150)x2/4.**

`[cmd]` **Das Einfrieren nutzt `addMealItem` aus G-272, ein Waechter
verbietet einen zweiten Weg.**

`[cmd]` **Flow 8: Liste aus Rezept bei 8 Portionen, 250 auf 500 g und
150 auf 300 g, Abhaken schreibt.**

`[read]` **Und der Satz *,,Sie entsteht aus einer Planwoche"* war die
zweite falsche Fassung** — **der Waechter prueft jetzt die Quelle,
nicht die Verfuegbarkeit der Tabelle.**

### Was er gemeldet und nicht erfunden hat

`[cmd]` **Flow 8 Schritt 6 (*Teilen / Exportieren*) nennt kein Format
und kein Ziel.** `[cmd]` **`cooking_skill` ist `NOT NULL`, kommt in
keinem Flow vor.** `[cmd]` **Kein Flow beschreibt das Loeschen eines
Rezepts.**

`[cmd]` 19 Waechter, 24 Sabotagen, 24 gefangen im ersten Lauf. **Drei
bestehende Waechter fielen — alle zu Recht, alle mit Begruendung
angepasst.**

### Zwei Sachen, die ich am Schirm gefunden habe

`[cmd]` **Die Zielzeile bricht um: *Kohlenhydrate 313 g* steht ueber
der Beschriftung.** Bei 1440 px. **Als G-302.**

`[cmd]` **Die eine gemeldete Attrappe ist Buddy im Kontextbereich** —
ausserhalb des Reiters.

**Abgenommen.**

