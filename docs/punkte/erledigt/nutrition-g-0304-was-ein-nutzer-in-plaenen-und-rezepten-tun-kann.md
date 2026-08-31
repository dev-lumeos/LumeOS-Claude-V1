---
nr: G-304
typ: messung
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-304 — was ein Nutzer in Plaenen und Rezepten tun kann

## Warum

Tom, 2026-08-31: *,,analysiere meal plans/planner/rezepte und erklaer
mir was ich als user da machen kann oder soll."*

`[read]` **Der Orchestrator hat drei Auftraege abgenommen und kann
die Frage nicht beantworten.** `[read]` **Er hat Komponenten
abgehakt, keine Bedienung.**

`[cmd]` **Und die Lehre steht seit heute in `CLAUDE.md`:** `SPEC_03`
der Ablauf, `SPEC_10` die Bauteile. **Die Abnahme hat nur die
Bauteile gezaehlt.**

## Die Frage

**Was kann ein Nutzer in diesen drei Reitern tun — und was verlangt
`SPEC_03`, das er nicht kann?**

`[read]` **Jede Antwort muss aus dem Code kommen:** welcher Knopf,
welche Funktion, welcher Schreibweg, welche Tabelle.

## Auftrag — die Bedienungsliste

**Beauftragt am 2026-08-31.**

### Was zu liefern ist

**Eine Tabelle je Reiter — Meal plans, Planner, Rezepte.**

    Was der Nutzer tut     der Knopf, wie er heisst
    Was dann passiert      welche Funktion, welche Tabelle
    Wo es endet            geschrieben? angezeigt? nichts?
    Welcher Flow-Schritt   SPEC_03, Flow und Schrittnummer
                           oder "in keinem Flow"

`[read]` **Jede Zeile aus dem Code.** **Kein *,,man kann"* ohne
Fundstelle.**

### Und die Gegenrichtung, die wichtiger ist

**Welche Schritte aus `SPEC_03` kann ein Nutzer heute nicht gehen?**

`[cmd]` **Flow 3 (Plan aktivieren), Flow 7 (Rezept erstellen und
loggen), Flow 8 (Einkaufsliste), Flow 11–13 (Lebenszyklus).**

`[read]` **Je Schritt: geht er, geht er halb, geht er nicht.**
**Und wenn halb — woran hoert er auf?**

### Drei Fragen, die dabei zu beantworten sind

`[read]` **1. Wie kommt ein Nutzer zu seinem ersten Plan?** `[cmd]`
**Flow 3 beginnt bei der Uebersicht und nennt vier Quellen — fuer
*Eigene* steht kein Weg** (C-370). `[cmd]` **Der eine vorhandene Plan
stammt aus C-150, einem Seed.**

`[read]` **2. Was ist der Unterschied zwischen Planner und Meal
plans, aus Nutzersicht?** `[cmd]` **Du hast in G-299 geantwortet:
*Meal plans ist, was der Plan ist — der Planner, wann was gegessen
wird*.** `[read]` **Miss, ob die Oberflaeche das traegt** — **oder ob
beide dasselbe zeigen.**

`[read]` **3. Was geschieht mit einem abgelaufenen Plan?** `[cmd]`
**Der aktive endete vor 47 Tagen und heisst weiter *aktiv*.**
`[cmd]` **`lifecycle_type` ist `NULL`** — Flow 11–13 greift nicht.

### Was nicht zu tun ist

**Nichts bauen.** **Dieser Auftrag misst.**
**Keine Luecke ausfuellen** — benennen.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** `[read]` **Und geh die
Wege am Schirm, nicht im Kopf** — **ein gruener Endpunkt beweist
nicht, dass ein Knopf ihn erreicht** (deine eigene Lehre aus G-298).

### Nachweis

    je Reiter eine Tabelle    Knopf, Wirkung, Ende, Flow-Schritt
    Flow 3, 7, 8, 11-13       je Schritt: geht / halb / nicht
    erster Plan               wie kommt ein Nutzer dazu
    Planner gegen Plans       traegt die Oberflaeche den
                              Unterschied
    abgelaufener Plan         was kann der Nutzer tun
    Sackgassen                wo endet ein Weg ohne Ergebnis

`[read]` **Die letzte Zeile ist die wertvollste.** **Ein Knopf, der
etwas oeffnet, das nichts tut, ist schlimmer als kein Knopf.**

## Bericht

**Die kurze Antwort auf Toms Frage:** *Rezepte* kann man vollstaendig
bedienen. *Planner* kann Positionen aendern, aber keinen Plan
anlegen. *Meal plans* kann fast nichts — und **der Weg zum ersten
eigenen Plan endet nach einem Klick in einer Sackgasse.**

Alle Zeilen unten sind am Schirm gefahren, nicht gelesen. Konto
`dev@lumeos.app` (1 Plan, 3 Rezepte, 56 Planeintraege), Gegenprobe auf
`test-user@lumeos.local` (nichts davon).

### Vorweg: ich habe beim Messen auf `dev` geschrieben

`[cmd]` **Mein erster Durchgang hat jeden sichtbaren Knopf
gedrueckt** — darunter *Speichern* an einem Rezept. `[cmd]` **Das
loeste einen `POST /api/nutrition/rezept` aus:**
`Banane-Joghurt-Haferflocken` traegt jetzt `updated_at`
`2026-08-31 10:35`, und seine drei `recipe_ingredients` sind
geloescht und neu geschrieben.

`[cmd]` **Nichts ist verloren:** dieselben drei Zutaten, dieselben
Mengen (80 / 250 / 120 g), derselbe Naehrwert (493,2 kcal, 450 g).

`[cmd]` **UND ES WAR NICHT NUR EINE STELLE.** Beim Abschlusszaehlen
stand bei `dev` **eine Einkaufsliste**, die dort vor G-304 nicht war
(G-289 endete mit 0): *,,Banane-Joghurt-Haferflocken (1 Portionen)"*,
3 Posten, angelegt **10:15** — der Knopf *Generieren* im
Listen-Dialog.

`[cmd]` **Beides ist zurueckgebaut:** die Liste und ihre Posten
geloescht, `dev` steht wieder bei **0 Listen**, 1 Plan, 3 Rezepten,
11 Zutaten, 56 Planeintraegen. `[read]` **Der Rezeptdatensatz traegt
weiterhin das neue `updated_at`** — das laesst sich nicht
zurueckdrehen, und die Werte stimmen.

`[read]` **Aber der Auftrag sagt *nichts auf dev*, und ich habe es
zweimal verletzt.** `[read]` **Und der zweite Fall ist der
lehrreichere:** ich hatte nach dem ersten Fund die Sperrliste
eingebaut und geglaubt, damit sei es erledigt — **gefunden habe ich
den zweiten erst beim Abschlusszaehlen, nicht durch die Sperre.**
**Ein Werkzeug, das schreiben kann, gehoert nicht auf ein Konto, das
niemand anfassen darf** — die Sperrliste ist der zweitbeste Weg, das
Messkonto der beste.

Das Werkzeug hat jetzt eine Sperrliste
(`Speichern|Übernehmen|Bestätigen|Generieren|…`) und nennt solche
Knoepfe, statt sie zu druecken.

---

## Reiter 1 — Meal plans

    Was der Nutzer tut   Was dann passiert            Wo es endet        Flow
    ------------------   --------------------------   ----------------   ----------
    „New plan"           Dialog: Name, Ziele,          SCHREIBT nach      in keinem
                         Lebenszyklus, Start, Tage     meal_plans         Flow (C-370)
    „Plan bearbeiten"    derselbe Dialog, gefuellt     SCHREIBT           in keinem
                         (planAendern)                 meal_plans         Flow
    Karte anklicken      Tages-Akkordeon klappt auf    zeigt an           Flow 3, 3
    „Laufzeit ändern"    Dialog: Startdatum, Laenge,   SCHREIBT           Flow 3, 5+6
                         Lebenszyklus                  meal_plans
    „Wie geplant"        planEintragBestaetigen        SCHREIBT           Flow 4
    „Auslassen"          planEintragUeberspringen      meal_plan_logs     Flow 4

`[cmd]` **Das sind alle.** **Sechs Knoepfe, davon fuenf mit
Schreibweg.**

`[cmd]` **Und das ist weniger, als der Quelltext vermuten laesst:**
`tab-plans.tsx` enthaelt neun weitere Knoepfe — *Confirm as planned*,
*MealCam*, *Log deviation*, *Skip*, *Pause plan*, *Duplicate*,
*Activate*, *Preview*. **Keiner davon erscheint am Schirm**: sie
stehen in `{d ? <Echt/> : (<Attrappe/>)}`-Rueckfallzweigen, und `d`
ist gesetzt. `[read]` **Quelltextmarken ueberschaetzen, was ein
Nutzer sieht** — dieselbe Klasse wie A-59.

**Wichtig zu Flow 4:** `[cmd]` **die zwei Knoepfe erscheinen NUR an
einem Tag, den der Plan fuehrt.** Am 18.06. stehen **4x „Wie
geplant" und 4x „Auslassen"**; **heute null**, weil der Plan am
15.07. endete. `[read]` **Ein Nutzer findet sie nur, wenn er das
Datum zurueckdreht.**

---

## Reiter 2 — Planner

    Was der Nutzer tut   Was dann passiert            Wo es endet        Flow
    ------------------   --------------------------   ----------------   ----------
    Woche blaettern      setWoche, lokal               zeigt an           in keinem
                                                                          Flow
    „Zur laufenden       springt zur Woche mit heute   zeigt an           in keinem
     Woche"              (erscheint nur, wenn es                          Flow
                         eine gibt)
    Zelle: „+"           Formular klappt IN der        —                  in keinem
                         Zelle auf                                        Flow
    darin „Hinzufügen"   planEintragAnlegen            SCHREIBT           in keinem
                                                       meal_plan_entries  Flow
    Eintrag: Stift       Formular mit Werten           —                  in keinem
    darin „Übernehmen"   planEintragAendern            SCHREIBT           in keinem
    Eintrag: Papierkorb  zweistufig, dann              SCHREIBT           in keinem
                         planEintragLoeschen           (loescht)
    „Copy week"          *** oeffnet „in Entwicklung"  NICHTS             Flow-los
                         und tut nichts ***
    „New recipe"         *** dasselbe ***              NICHTS             Flow 7, 1
                                                                          (falscher Ort)

`[cmd]` **Gemessen: 28 Zellen, jede mit funktionierendem
Hinzufuegen-Formular.** `[cmd]` **`Copy week` und `New recipe` oeffnen
einen Dialog, der erklaert, dass es sie nicht gibt.**

`[read]` **Die Positionsbearbeitung steht in KEINEM Flow.** Sie ist
aus G-298 entstanden, weil Tom sie verlangt hat — **`SPEC_03`
beschreibt sie nicht.** Das ist keine Kritik an ihr, sondern eine
Luecke in der Spec.

---

## Reiter 3 — Rezepte

    Was der Nutzer tut   Was dann passiert            Wo es endet        Flow
    ------------------   --------------------------   ----------------   ----------
    „Neues Rezept"       Formular oeffnet              —                  Flow 7, 1
    Name, Portionen …    lokal                         —                  Flow 7, 2
    „Zutat suchen"       GET /api/nutrition/foods      zeigt Treffer      Flow 7, 3
    Treffer + Menge      Zutat im Entwurf,             zeigt an           Flow 7, 3
    „Hinzufügen"         Live-Vorschau rechnet mit
    „Speichern"          rezeptAnlegen/-Aendern        SCHREIBT recipes   Flow 7, 4
                                                       + ingredients
    Karte anklicken      Zutaten, Naehrwerte,          zeigt an           Flow 7 (Detail)
                         Anleitung
    „Bearbeiten"         dasselbe Formular, gefuellt   SCHREIBT           Flow 7
    „Als Mahlzeit        Dialog: Portionen, Typ ->     SCHREIBT meals     Flow 7, 5
     loggen"             rezeptLoggen                  + meal_items
    „Einkaufsliste"      Dialog: Portionen, Vorschau   SCHREIBT           Flow 8, 1-3
                         -> listeAusRezept             shopping_lists
    Posten antippen      postenHaken                   SCHREIBT           Flow 8, 5
                                                       is_checked

`[cmd]` **Zehn Bedienschritte, sieben davon mit Schreibweg, alle
einem Flow zuzuordnen.** `[read]` **Dieser Reiter ist der einzige,
der eine Aufgabe von Anfang bis Ende traegt.**

---

## Die Gegenrichtung: welche Flow-Schritte gehen nicht

### Flow 3 — Plan aktivieren

    1  „Meal Plans" oeffnen                    GEHT
    2  Uebersicht aller Plaene                 GEHT NICHT — `ladePlan`
                                               holt alle, sortiert nach
                                               `is_active` und nimmt
                                               `plaene[0]`. Es gibt keine
                                               Liste, nur EINEN Plan.
       - eigene, ohne Label                    GEHT (die Herkunftsanzeige)
       - vom Coach / Marktplatz / Buddy        GEHT NICHT — es gibt keine
                                               fremden Plaene, und
                                               `recipes` hat gar keine
                                               `source`-Spalte (G-289)
    3  Tap auf Plan -> Vorschau                GEHT
    4  „Plan aktivieren"                       GEHT (Knopf „Laufzeit
                                               ändern" / „Aktivieren")
    5  Startdatum waehlen                      GEHT
       (Vorgabe morgen, max 7 Tage voraus)     GEHT NICHT — `plan-detail.tsx:339`
                                               setzt `start_date ?? heute`,
                                               und keine Grenze begrenzt die
                                               Wahl nach vorn
    6  Lebenszyklus waehlen                    GEHT (drei Knoepfe)
    7  Bestaetigen -> status: active           GEHT
       - bestehender aktiver -> paused         GEHT NICHT — nicht gebaut,
                                               kein Code sucht andere Plaene
       - ab Startdatum Ghost Entries im Diary  GEHT NICHT — siehe unten

`[cmd]` **Zu Schritt 7, letzter Punkt:**
`nutrition.meal_plan_day_to_diary()` existiert, **und kein einziger
Aufruf steht im ganzen `apps/web/src`.** `[cmd]` **`tagesEintraege`
geht nur an den Plans-Reiter, nie ins Tagebuch.** `[read]` **Die
Planeintraege erreichen das Diary nicht.**

### Flow 7 — Rezept erstellen und loggen

    1  „Neues Rezept"                          GEHT
    2  Name, Portionen, Zeiten, Anleitung      GEHT
    3  Zutaten via Food Search, Menge in g     GEHT
       Live-Preview Gesamt + je Portion        GEHT
    4  Speichern                               GEHT
    5  Als Mahlzeit loggen                     GEHT
       (Portionen, Typ, Meal + MealItems)      GEHT

**Flow 7 geht vollstaendig.** `[cmd]` In G-289 Schritt fuer Schritt
im Browser belegt.

### Flow 8 — Einkaufsliste

    1  Rezept oeffnen -> „Einkaufsliste"       GEHT
    2  Portionen waehlen                       GEHT
    3  Generieren, Mengen skaliert             GEHT
    4  Liste anzeigen                          GEHT
    5  Abhaken                                 GEHT
    6  Teilen / Exportieren                    GEHT NICHT — die Spec nennt
                                               weder Format noch Ziel
                                               (in G-289 gemeldet)

### Flow 11–13 — Lebenszyklus

    11  Lebenszyklus waehlen                   GEHT (drei Knoepfe im Dialog)
    11  `once` -> nach days_count `completed`  GEHT NICHT
    12  `rollover` -> Tag 1 neu, Zaehler +1    GEHT NICHT
    13  `sequence` -> Folgeplan aktiv          GEHT NICHT

`[cmd]` **Gemessen: es gibt KEINE Funktion** (`%rollover%`,
`%lifecycle%`, `%sequence%`, `%expire%`, `%advance%` — nichts),
**kein `pg_cron`**, und **`rollover_count` steht bei 0.**

`[read]` **Der Lebenszyklus wird gespeichert und nie ausgefuehrt.**
**Die Wahl in Schritt 6 ist eine Notiz, keine Wirkung.**

---

## Die drei Fragen

### 1. Wie kommt ein Nutzer zu seinem ersten Plan?

**Gar nicht — der Weg endet nach einem Klick.**

`[cmd]` **„New plan" fragt: Name, Beschreibung, Tagesziele,
Lebenszyklus, Startdatum, Tage.** `[cmd]` **Er fragt NICHT nach
Wochen, Tagen oder Eintraegen.**

`[cmd]` **Und danach gibt es keinen Weg weiter.** Gemessen ueber den
ganzen Quelltext: **`meal_plan_weeks` wird NIRGENDS eingefuegt**,
`meal_plan_days` kommt nur in einem `select` vor. **Kein Knopf, keine
Route, keine Funktion legt eine Woche an.**

`[cmd]` **Belegt auf `test-user`:** ein Plan angelegt wie der Knopf
ihn anlegt — **0 Wochen, 0 Tage, 0 Eintraege**, und die Karte sagt
das auch: *„0 Wochen · 0 Tage · 0 Einträge"*, Marke *„ohne Tage"*.

**Und dann kommt der schlimmste Teil.** `[cmd]` **Der Planner zeigt
bei genau diesem Plan:** *„Noch kein Wochenplan — Es liegt kein Plan
vor."* `[read]` **Das ist falsch: der Plan existiert.** Die Bedingung
lautet `!d.plan || d.wochen.length === 0` — **ein Plan ohne Wochen
wird als „kein Plan" gemeldet.**

`[cmd]` **Der einzige Knopf daneben heisst „Neuen Plan anlegen" und
ist die *in Entwicklung*-Attrappe.**

    Nutzer legt Plan an   ->  „0 Wochen, 0 Tage"
    geht in den Planner   ->  „Es liegt kein Plan vor" (falsch)
    klickt den Knopf      ->  „in Entwicklung"

`[read]` **Das ist die Sackgasse, nach der der Auftrag fragt** — und
sie ist schlimmer als ein fehlender Knopf, weil sie dem Nutzer
zweimal etwas Falsches sagt.

### 2. Planner gegen Meal plans — traegt die Oberflaeche den Unterschied?

**Ja, gemessen.**

    Meal plans   5 Karten: Plan-Einträge, Planumfang, Lebenszyklus,
                 Herkunft, Einhaltung
                 nennt den Plannamen: ja
                 zeigt Eintraege je Tag: NEIN
    Planner      2 Karten: <Planname>, Rezepte
                 nennt den Plannamen: ja
                 zeigt Eintraege je Tag: JA (Wochengitter)

`[read]` **Die Antwort aus G-299 haelt:** Meal plans beschreibt den
Plan, der Planner zeigt, wann was gegessen wird. **Es sind nicht
zwei Ansichten derselben Sache.**

`[read]` **Eine Einschraenkung:** die Karte *„Plan-Einträge"* im
Plans-Reiter zeigt die Eintraege EINES Tages (mit den Flow-4-
Knoepfen). **Das ist die einzige Ueberschneidung** — und sie hat
einen anderen Zweck: dort wird ausgefuehrt, im Planner geplant.

### 3. Was geschieht mit einem abgelaufenen Plan?

**Nichts, und der Nutzer kann auch nichts tun.**

`[cmd]` **Der Plan endete am 15.7., heute ist der 31.8. — 47 Tage.**
`[cmd]` **Die Karte sagt seit G-298: *aktiv · abgelaufen*** mit dem
Satz *„Die letzte Planwoche endete am 15.7.2026 — vor 47 Tagen."*

`[read]` **Die Anzeige ist ehrlich. Die Bedienung fehlt.** Angeboten
werden nur:

    „Laufzeit ändern"    Startdatum, Laenge, Lebenszyklus
    „Plan bearbeiten"    Name, Ziele, Lebenszyklus

`[cmd]` **Kein Knopf setzt `status` auf `completed`, `paused` oder
`archived`** — obwohl der CHECK alle vier Werte kennt. `[cmd]`
**`lifecycle_type` ist bei diesem Plan `NULL`**, also greift Flow 11
ohnehin nicht — **und selbst mit `once` waere niemand da, der ihn
beendet** (keine Funktion, kein Zeitplan).

`[read]` **Der Nutzer kann die Laufzeit verschieben und damit den
Plan „wiederbeleben".** **Beenden kann er ihn nicht.**

---

## Sackgassen — die wertvollste Zeile

    1  „Neuen Plan anlegen" (Planner)     oeffnet „in Entwicklung"
    2  „Copy week" (Planner)              oeffnet „in Entwicklung"
    3  „New recipe" (Planner)             oeffnet „in Entwicklung" —
                                          obwohl es den Rezepte-Reiter
                                          seit G-289 gibt
    4  Plan ohne Wochen (Planner)         „Es liegt kein Plan vor" —
                                          FALSCH, er liegt vor
    5  „New plan" (Meal plans)            legt einen Plan an, den
                                          niemand fuellen kann
    6  Lebenszyklus-Wahl                  wird gespeichert und nie
                                          ausgefuehrt
    7  abgelaufener Plan                  kein Weg, ihn zu beenden

`[read]` **Nummer 3 ist die aergerlichste:** der Knopf sagt, das
Rezeptanlegen sei nicht gebaut — **es ist seit G-289 gebaut, einen
Reiter weiter.** **Ein Knopf, der eine ueberholte Auskunft gibt.**

---

## Was das fuer Toms Frage bedeutet

**Was ein Nutzer heute TUN kann:**

- **Rezepte** anlegen, bearbeiten, als Mahlzeit loggen, daraus eine
  Einkaufsliste erzeugen und abhaken. **Vollstaendig.**
- **Positionen eines bestehenden Plans** im Planner aendern.
- **Einen Plantag abhaken** — aber nur, wenn er das Datum auf einen
  Tag innerhalb der Laufzeit stellt.
- **Die Laufzeit** eines Plans verschieben.

**Was er NICHT kann, obwohl die Oberflaeche es nahelegt:**

- **einen eigenen Plan mit Inhalt erstellen** (die Sackgasse oben)
- **einen Plan beenden oder pausieren**
- **eine Woche kopieren**
- **Planeintraege im Tagebuch sehen**
- **sich auf den Lebenszyklus verlassen**

**Was er tun SOLL, laesst sich aus dem Stand nicht beantworten** —
`SPEC_03` beschreibt keinen Weg, wie ein eigener Plan entsteht
(C-370), und genau dort bricht die Kette.

---

## Wie gemessen wurde

`[cmd]` **`backup/g304-wege.mjs`** faehrt jeden sichtbaren Knopf an,
schreibt Netzverkehr, DOM-Aenderung und Adresswechsel mit.
**`g304-plankarte.mjs`** dasselbe fuer die aufgeklappte Karte,
**`g304-fragen.mjs`** die drei Fragen, **`g304-plantag.mjs`** die
Flow-4-Knoepfe an einem Plantag, **`g304-leerplan-planner.mjs`** die
Sackgasse.

`[cmd]` **Der Quelltext-Abgleich** (`g304-knoepfe.py`) hat die neun
Knoepfe gefunden, die es nur im Code gibt — **erst der Schirm hat
gezeigt, dass sie nie rendern.**

**Nichts gebaut, nichts committet.** `[cmd]` **Auf `dev` wurde
ZWEIMAL ungewollt geschrieben** (siehe oben) — **beides
zurueckgebaut, ohne Datenverlust**; **auf `test-user` ein
Wegwerf-Plan angelegt und vollstaendig zurueckgebaut** — 0 Plaene, 0
Wochen, 0 Tage, 0 Eintraege danach.


## Abnahme

**2026-08-31, Orchestrator.**

**Die Frage ist beantwortet, und Toms Sicht ist Punkt fuer Punkt
bestaetigt.**

    Rezepte     laeuft durch
    Planner     kann Positionen aendern, keinen Plan anlegen
    Meal plans  tut sehr wenig, und der Weg zum ersten
                eigenen Plan endet nach einem Klick

### Die vier Sackgassen

`[cmd]` **1. *New plan* legt einen Plan an, den niemand fuellen
kann.** Das Formular fragt Name, Ziele, Lebenszyklus, Start und
Tageszahl — **nie Wochen, Tage oder Eintraege.**

`[cmd]` **Erschoepfend gesucht: `meal_plan_weeks` wird nirgends
eingefuegt, `meal_plan_days` kommt nur in einem `select` vor.**
`[cmd]` **Auf `test-user` belegt: 0 Wochen, 0 Tage, 0 Eintraege.**

`[cmd]` **2. Der Planner meldet dann *,,Es liegt kein Plan vor"*** —
der Zweig ist `!d.plan || d.wochen.length === 0`. `[read]` **Ein Plan
ohne Wochen wird als *kein Plan* gemeldet, und der einzige Knopf ist
die Attrappe.**

`[cmd]` **3. *New recipe* im Planner sagt, die Rezepterstellung sei
nicht gebaut** — **seit G-289 ist sie es, einen Reiter weiter.**
`[read]` **Die Meldung nennt G-97 als Grund, einen heute erledigten
Auftrag.**

`[cmd]` **4. *Copy week* oeffnet einen Dialog, der erklaert, dass es
die Funktion nicht gibt.**

### Und zwei Sachen laufen gar nicht

`[cmd]` **Die Lebenszykluswahl wird gespeichert und nie ausgefuehrt** —
keine Funktion, kein Zeitplaner, `rollover_count` auf 0.

`[cmd]` **Ein abgelaufener Plan kann nicht beendet werden.**

`[read]` **Flow 11–13 laufen nicht.**

### Die Flow-Urteile

`[cmd]` **Flow 7 und Flow 8, Schritte 1 bis 5: vollstaendig.**
`[cmd]` **Flow 8 Schritt 6 hat keine Spec.**

`[cmd]` **Flow 3 scheitert an Schritt 2** — `ladePlan` nimmt
`plaene[0]`, **es gibt keine Liste.** `[cmd]` **An Schritt 5** — die
Vorgabe *morgen, hoechstens sieben Tage voraus* fehlt. `[cmd]` **Und
an Schritt 7** — der bestehende Plan wird nicht pausiert, und
`meal_plan_day_to_diary` existiert **ohne Aufrufer.**

### Frage 2 ist gemessen bestaetigt

`[cmd]` **Meal plans zeigt 5 Metadatenkarten und keine
Tageseintraege, der Planner zeigt das Raster mit Eintraegen.**
`[read]` **Die Reiter unterscheiden sich wirklich** — wie er in G-299
behauptet hatte.

### Und ein eigener Fehler, gemeldet statt verschwiegen

`[cmd]` **Sein erster Durchgang hat auf `dev` zweimal geschrieben:**
eine Rezept-Neuspeicherung (Werte gleich, `updated_at` bewegt) und
eine Einkaufsliste. `[cmd]` **Beides zurueckgebaut, `dev` steht wieder
bei 1 Plan / 3 Rezepten / 11 Zutaten / 56 Eintraegen / 0 Listen.**

`[read]` **Die zweite Schreibung fand er erst beim Schlusszaehlen** —
nach dem Einbau einer Schreibsperre.

`[read]` **Seine eigene Lehre daraus ist die richtige:** *,,eine
Probe, die schreiben kann, gehoert gar nicht erst auf ein
unantastbares Konto."*

**Abgenommen.** **Als C-372, G-305 und C-373.**

