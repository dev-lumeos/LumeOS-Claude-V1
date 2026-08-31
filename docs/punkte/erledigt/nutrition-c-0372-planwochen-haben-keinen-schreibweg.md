---
nr: C-372
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-304
entscheidung: E-40
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 18a4e31b
beruehrt:
  tabellen: [nutrition.meal_plan_weeks]
zahlen:
  gemessen: 2026-08-31
---

# C-372 — Planwochen haben keinen Schreibweg

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **`meal_plan_weeks` wird nirgends im Code eingefuegt.**
`[cmd]` **`meal_plan_days` kommt nur in einem `select` vor.**

`[cmd]` **Auf `test-user` belegt: der ueber *New plan* angelegte Plan
hat 0 Wochen, 0 Tage, 0 Eintraege.**

`[read]` **Ein Plan ohne Wochen ist ein Datensatz, kein Plan.**

## Und dann luegt die Anzeige

`[cmd]` **Der Planner zeigt fuer genau diesen Plan *,,Es liegt kein
Plan vor"*.** `[cmd]` **Der Zweig ist `!d.plan || d.wochen.length ===
0`.**

`[read]` **Ein Plan ohne Wochen wird als *kein Plan* gemeldet** —
**und der einzige angebotene Knopf ist die *in Entwicklung*-Attrappe.**

`[read]` **Damit ist der Weg zu Ende: anlegen, dann nichts.**

## Warum das der Kern ist

Tom, 2026-08-31: *,,die diskrepanz ich kann da einen plan anlegen
zumindest namentlich und konfigs."*

`[read]` **Genau das ist es: das Formular fragt Name, Ziele,
Lebenszyklus, Startdatum und Tageszahl** — **nie Wochen, Tage oder
Eintraege.**

`[cmd]` **`SPEC_03` Flow 3 beschreibt kein Anlegen** (C-370) — **er
beginnt bei der Uebersicht.** `[read]` **Das Formular war eine
Erfindung des Orchestrators, und es erzeugt einen leeren Datensatz.**


## Auftrag — Bibliothek und Werkbank

**Entschieden in E-40 und E-41.** **Mitbeauftragt: C-370, G-306,
C-375.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Lies zuerst

    docs/entscheidungen/E-40      wozu der Planner da ist
    docs/entscheidungen/E-41      Rollenteilung und zwei Sperren
    ADR_IMPROVEMENTS_PACKAGE #17  die Immutabilitaetsregel
    SPEC_01 Abschnitt 8 und 9     Plaene und Rezepte, vier Quellen
    SPEC_03 Flow 3                Aktivieren

`[read]` **Der Orchestrator hat den ADR nicht gelesen, bevor er
G-298 beauftragt hat.** **Deshalb steht er hier zuerst.**

### Die Rollenteilung

    Meal plans   Bibliothek: alle Plaene, aktivieren,
                 "Bearbeiten" fuehrt in den Planner
    Planner      Werkbank: Auflistung aller Plaene, neu anlegen,
                 Positionen und Rezepte einfuegen

`[read]` **Bearbeiten fuehrt in den Planner, statt in der Bibliothek
selbst zu editieren** — **sonst gibt es wieder zwei Orte fuer
dasselbe.**

### 1 · Wochen bekommen einen Schreibweg (C-372)

`[cmd]` **Du hast in G-304 belegt: `meal_plan_weeks` wird nirgends
eingefuegt, `meal_plan_days` kommt nur in einem `select` vor.**

`[read]` **Ohne diesen Weg gibt es keine Werkbank.** **Die Positionen
kannst du seit G-298** — es fehlt die Ebene darueber.

**`New plan` fragt: Name, Beschreibung, Tagesziele, Wochenzahl.**
`[cmd]` **Lebenszyklus und Startdatum gehoeren nicht dorthin** — sie
entstehen beim Aktivieren (Flow 3, Schritte 5 und 6).

### 2 · Der Editor respektiert die Immutabilitaet (G-306)

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17:**

    MealPlan.status = 'active'
      -> MealPlanDay READ-ONLY
      -> MealPlanItem READ-ONLY

`[cmd]` **Begruendung im ADR:** *,,MealPlanLog referenziert
`plan_item_id`. Wenn Items nachtraeglich geaendert werden, stimmt die
Compliance-History nicht mehr."*

`[read]` **Dein G-298-Editor arbeitet heute an einem aktiven Plan.**
**Das gehoert an `status` gebunden: Entwurf ja, aktiv nein.**

`[cmd]` **Und der Ausweg steht im ADR:** *,,pausieren, eine Kopie
erstellen, bearbeiten und neu aktivieren."*

`[read]` **Ohne Knopf ist die Regel eine Sackgasse.** **Bau
*,,Kopie bearbeiten"*: Kopie anlegen, im Planner oeffnen, Original mit
seinem Log stehen lassen.**

### 3 · Das Flag fuer fremde Inhalte (C-375)

Tom: *,,die gekauften Plaene oder vom Coach brauchen ein Flag das
definiert ob es editable sein soll oder nicht."*

`[cmd]` **Es gibt keins.** `[read]` **Vorschlag: `darf_bearbeiten
boolean NOT NULL DEFAULT true`, an `meal_plans` und `recipes`.**

`[read]` **Zwei Sperren, die nichts miteinander zu tun haben:**

    aktiv             jeder Plan, kommt vom Log
    nicht editierbar  fremde Plaene, kommt vom Ersteller

`[read]` **Die Anzeige muss beide unterscheiden** — *,,dieser Plan
laeuft"* ist etwas anderes als *,,dieser Plan gehoert dir nicht"*.

`[cmd]` **Den Weg zum Teilen nicht bauen** — E-39 und E-40 sagen
vorsehen.

### 4 · Rezepte in den Plan einfuegen

Tom: *,,im Planner soll man Einzelpositionen oder fertige Rezepte
einfuegen koennen."*

`[cmd]` **Der `CHECK` kennt beides:** `recipe` mit
`planned_servings`, `bls` und `custom` mit `amount_g`. `[cmd]` **Du
hast in G-298 gemessen, dass der Typ das Feld entscheidet.**

`[cmd]` **Und die Rezepte stehen seit G-289.**

### Was nicht zu tun ist

**Keinen Lebenszyklus ausfuehren** — C-373.
**Kein Teilen, kein Kaufen bauen.**
**Nichts auf `dev@lumeos.app`** — eine Probe, die schreiben kann,
gehoert nicht auf ein unantastbares Konto.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Plan anlegen         mit n Wochen, im Browser
    Wochen und Tage      meal_plan_weeks und _days zaehlen,
                         gezaehlter Rueckbau
    fuellen              Position und Rezept je Tag
    aktiver Plan         Bearbeitung gesperrt, 409 oder gesperrte
                         Oberflaeche
    Kopie bearbeiten     Kopie entsteht, Original unveraendert
    darf_bearbeiten      Spalte da, Vorgabe true, Anzeige
                         unterscheidet die zwei Sperren
    Bibliothek           listet alle Plaene, "Bearbeiten" fuehrt
                         in den Planner
    dev                  unveraendert, vorher/nachher gezaehlt

`[read]` **Die vierte und fuenfte Zeile zusammen entscheiden, ob es
brauchbar ist:** **gesperrt zu sein, ohne einen Weg zu haben, ist
schlimmer als gar keine Sperre.**

## Bericht

**Die Werkbank steht, und die Sperre hat einen Ausweg.** Ein Plan
entsteht jetzt mit Wochen und Tagen, ein aktiver Plan ist gegen
Positionsaenderungen gesperrt (409), und *,,Kopie bearbeiten"* fuehrt
aus der Sperre heraus.

Alle Schreibproben auf **`test-user@lumeos.local`** mit gezaehltem
Rueckbau. **Auf `dev` nur gelesen** — 1 Plan vorher, 1 nachher.

**Gelesen, in der Reihenfolge des Auftrags:** E-40, E-41,
`ADR_IMPROVEMENTS_PACKAGE` #17, `SPEC_01` Abschnitt 8 und 9,
`SPEC_03` Flow 3.

### Der ADR zuerst — und was er wirklich sagt

`[cmd]` **#17 woertlich:** `MealPlan.status = 'active'` -> `MealPlanDay`
READ-ONLY, `MealPlanItem` READ-ONLY, **API gibt 409 Conflict bei
PUT/PATCH/DELETE.** Begruendung: *,,MealPlanLog referenziert
`plan_item_id`."*

`[cmd]` **Gemessen am 2026-08-31: `meal_plan_logs.plan_entry_id`
existiert und traegt `ON DELETE RESTRICT`.**

`[read]` **Und hier liegt der Punkt, der die Regel noetig macht:**
`[cmd]` **die Datenbank verhindert nur das LOESCHEN einer
protokollierten Position, nicht ihr AENDERN.** `[cmd]` **In der Probe
ging ein `UPDATE amount_g = 999` auf eine Position eines aktiven
Plans glatt durch.**

`[read]` **Genau diese Luecke hat G-298 aufgemacht** — und weder der
Agent noch der Orchestrator hatten den ADR gelesen.

### 1 · C-372 — Wochen haben einen Schreibweg

`[cmd]` **Gemessen: `meal_plan_weeks` wurde nirgends eingefuegt**
(in G-304 belegt, hier bestaetigt). **Ohne das keine Werkbank.**

**Gebaut: `planMitWochenAnlegen`.** `[cmd]` **Im Browser gefahren:
ein Plan mit 2 Wochen -> 2 Wochen, 14 Tage in der Datenbank.**

**Das Formular fragt, was E-40 nennt:** Name, Beschreibung,
Tagesziele, **Wochenzahl**. `[cmd]` **Und es fragt NICHT nach
Startdatum oder Lebenszyklus** — im Browser gemessen: **0
Datumsfelder, 0 Zyklusknoepfe, 1 Wochenfeld.**

#### Der Widerspruch, den ich loesen musste

`[cmd]` **`meal_plan_weeks.week_start` ist NOT NULL** — **und ein
Plan im Entwurf hat kein Startdatum** (E-40: das entsteht beim
Aktivieren).

`[read]` **Ihn mit `NULL` zu umgehen ginge nicht, ihn zu erfinden
waere eine Behauptung.** **Geloest ueber einen Anker:** die Wochen
liegen relativ zueinander, verankert am Montag der Anlegewoche.
`verschiebung()` und `tageVerschieben()` stehen bereit, um sie beim
Aktivieren auf das echte Datum zu schieben — **die Abstaende bleiben,
das Datum wird richtig.**

`[read]` **Der Anker ist keine Aussage ueber den Start** — das steht
als Satz an der Funktion, damit ihn niemand dafuer haelt.

#### Und beim Aktivieren wandern die Wochen mit

`[read]` **Nach dem ersten Bauen standen `verschiebung()` und
`tageVerschieben()` mit Waechtern da — und hatten keinen Aufrufer.**
`[cmd]` **A-59: nicht aufgerufen heisst entfernt.** `[read]` **Statt
sie zu loeschen habe ich sie dort verdrahtet, wo sie hingehoeren:**
`planAendern` schiebt jetzt alle Wochen UND ihre Tage, sobald ein
`start_date` gesetzt wird (Flow 3, Schritt 5).

`[cmd]` **An der Datenbank gegengeprueft:** zwei Wochen ab
2026-08-31, aktiviert auf den 2026-09-14 — **danach 2026-09-14 und
2026-09-21, alle 14 Tage um +14 verschoben**, die Abstaende
unveraendert.

`[read]` **Ohne diesen Schritt stuende ein Plan aus der Werkbank an
seinem Anker statt am gewaehlten Startdatum** — der Nutzer saehe
seine Tage in der falschen Woche.

`[cmd]` **`day_index` gegengeprueft:** der CHECK verlangt 1..7, und
**0 wie 8 werden abgewiesen, 1 nicht** (am 2026-08-31 an der
laufenden Datenbank gemessen).

### 2 · G-306 — die Sperre, und ihr Ausweg

**Gebaut: `pruefePositionsRecht`** an allen drei Positionsvorgaengen
(anlegen, aendern, entfernen).

`[cmd]` **Im Browser gefahren, an einem echten aktiven Plan:**

    Aenderung an einer Position -> HTTP 409
    „Dieser Plan läuft. Seine Positionen sind eingefroren, weil das
     Protokoll auf sie zeigt … Über „Kopie bearbeiten“ entsteht ein
     Entwurf …"

`[cmd]` **409, wie der ADR es vorschreibt** — nicht 403. `[read]`
**Der Unterschied traegt:** bei 403 fehlt das Recht dauerhaft, bei
409 ist der Zustand im Weg, **und der laesst sich aendern.** Dafuer
gibt es jetzt den Fehlercode `PLAN_AKTIV`.

#### Der Knopf, ohne den die Regel eine Sackgasse waere

**Der Auftrag: *,,gesperrt zu sein, ohne einen Weg zu haben, ist
schlimmer als gar keine Sperre."***

`[cmd]` **Am gesperrten Plan steht: die Marke *Positionen
eingefroren*, der Grund, der Ausweg — und *Kopie bearbeiten*.**
`[cmd]` **Im Browser gefahren: die Kopie entsteht**, mit Wochen,
Tagen und Positionen.

`[cmd]` **Das Original bleibt `active`, die Kopie ist `assigned`** —
also bearbeitbar. `[read]` **Waere die Kopie sofort aktiv, fuehrte
der Ausweg im Kreis;** ein Waechter haelt das fest.

`[read]` **Das Protokoll wird NICHT mitkopiert.** Es gehoert zum
Original — genau darum geht der ADR diesen Weg.

`[cmd]` **Das Pausieren des Originals ist eine WAHL, kein Automatismus**
(Kaestchen im Dialog). `[read]` **Der ADR nennt es als ersten
Schritt, aber wer eine Variante baut, laesst das Original laufen** —
und eine stille Zustandsaenderung waere schlimmer als eine Frage.

### 3 · C-375 — das Flag gibt es nicht

`[cmd]` **Gemessen am 2026-08-31: keine Spalte `darf_bearbeiten`,
`editable`, `readonly`, `locked` oder `is_template` in `nutrition`
oder `coach`.** Der einzige Treffer war `checkins.template_id`, und
der gehoert zu Recovery.

**Die Auswertung ist gebaut, die Spalte gehoert Codex.**
`darfBearbeiten(undefined)` ist `true` — **gemessen, nicht
behauptet:** heute sind alle Plaene `self_created` oder `NULL`.

`[read]` **Und die zwei Sperren werden unterschieden, wie E-41 es
verlangt:**

    aktiv             vom Log      Ausweg: Kopie
    nicht editierbar  vom Ersteller Ausweg: KEINER
    beides            —             Ausweg: keiner

`[read]` **Die fremde Sperre gewinnt.** Bei ihr hilft eine Kopie
nicht — sie fuehrte um die Entscheidung des Erstellers herum, und
genau das soll das Flag verhindern. **Deshalb erscheint der
Kopierknopf dort nicht;** `kopieHilft()` ist die eine Stelle, die es
entscheidet.

### 4 · Rezepte in den Plan einfuegen

`[cmd]` **Das steht seit G-298:** `meal_plan_entries_target_check`
kennt `recipe` mit `planned_servings` und `bls`/`custom` mit
`amount_g`, **und `feldFuer(typ)` entscheidet, welches Feld
erscheint.** `[cmd]` **Der Editor bietet alle drei Arten an**, und
die Rezeptauswahl fuellt sich aus `recipes`.

`[read]` **Dieser Auftrag hat daran nichts geaendert** — er hat die
Bearbeitung nur an den Status gebunden.

### Die Rollenteilung am Schirm

`[cmd]` **Der Planner traegt jetzt *ALLE PLÄNE*** mit Zahl, darunter
je Plan: Status, Sperrmarke, Herkunft, **Wochen · Tage · Positionen**.
`[cmd]` **Im Bild: 3 Plaene** — der aktive mit *Positionen
eingefroren* und nur *Kopie bearbeiten*, die Kopie mit *In der
Werkbank*, der neue mit *Bearbeiten*.

`[read]` **Was NICHT gebaut ist: *,,Bearbeiten" in Meal plans fuehrt
in den Planner.*** E-41 nennt es; **der Sprung zwischen den Reitern
mit Planvorwahl ist offen** und unten als Punkt benannt.

### Waechter und Sabotageprobe

**19 Waechter** in `apps/web/src/lib/nutrition/__tests__/plan-werkbank.test.ts`.

`[cmd]` **27 Sabotagen einzeln gefahren, jede mit SHA-256-Rueckbau:
27 gefangen, 0 Ueberlebende, Nachlauf 0 Fehlschlaege.**

**Vier sind im ersten Durchgang durchgefallen** — **drei davon meine
eigenen Waechter, alle dieselbe alte Klasse (G-216):**

`[cmd]` **S18:** die Probe suchte `from('meal_plan_entries')`; **der
Name steht achtmal in der Datei**, und die Sabotage bog nur einen
Insert um. **Jetzt wird der Insert selbst geprueft.**

`[cmd]` **S22:** `kopieHilft(sperre)` steht **zweimal** — am Knopf
und am Ersatztext. **Die Sabotage ersetzte eines, `assert.match` fand
das andere. Jetzt gezaehlt.**

`[cmd]` **S23:** `start_date: null` steht **zweimal** (Anlegen und
Kopie). **Die Probe traf die falsche Stelle. Jetzt wird der Block
abgeschnitten.**

`[cmd]` **Und S3 war meine Sabotage, nicht mein Waechter:** der
Ankertext ist im Quelltext umbrochen, also griff die Ersetzung nie —
**„Anker fehlt" statt „ueberlebt", und das ist ein Unterschied.**

`[cmd]` **Und ein fuenftes Mal beim Verschieben (S25):** die Probe
suchte `.from('meal_plan_days').update` — **die Sabotage tauschte
`plan_date` gegen `notes`, die Tabelle blieb dieselbe.** **Jetzt
wird das FELD geprueft, nicht die Tabelle.**

`[read]` **Fuenfmal dieselbe Klasse in einem Auftrag.** Das ist keine
Unaufmerksamkeit mehr, sondern eine Bauvorschrift, die ich beim
Schreiben eines Waechters nicht anwende: **erst fragen, was die
Sabotage aendern wuerde — dann darauf pruefen.**

### Ein bestehender Waechter ist gefallen — zu Recht

`[cmd]` **`G-298: der Schreibweg prueft die Coach-Sperre"` zaehlte
`pruefeFreigabe`-Aufrufe.** `[read]` **Die Funktion prueft nur die
Herkunft** — der ADR verlangt zusaetzlich die Statussperre.

**`pruefePositionsRecht` prueft beides in EINER Abfrage**, und
`pruefeFreigabe` samt `herkunftDesTages` ist entfernt (A-59).
**Der Waechter ist mit Begruendung nachgezogen** und prueft jetzt
zusaetzlich, dass die schwaechere Fassung nicht zurueckkommt.

### Gate und Messung

`[cmd]` **`pnpm gate`: 11 von 11 gruen.** `[cmd]` **`[serverimport]`
51 Client-Chunks, 0 Treffer.**

`[cmd]` **Ladezeit kalt/warm:** planner 1.725 / 1.533 ms, plans
1.542 / 1.612 ms. `[cmd]` **Attrappen 1 je Reiter** (die
Buddy-Leiste, ausserhalb), **Konsolenfehler 1** (die bekannte
`data-mode`-Hydrationswarnung).

### Geaendert

    neu   lib/nutrition/plan-werkbank.ts          Sperren, Wochen, Anker
    neu   v2/nutrition/plan-werkbank-ui.tsx       Liste, Formular, Kopie
    neu   __tests__/plan-werkbank.test.ts         18 Waechter
    ge.   lib/nutrition/plan-write.ts             3 Vorgaenge gesperrt,
                                                  2 neue Vorgaenge
    ge.   lib/nutrition/plan-lesen.ts             ladeAllePlaene
    ge.   lib/nutrition/diary-model.ts            Fehlercode PLAN_AKTIV
    ge.   api/nutrition/plan/route.ts             2 neue Arten
    ge.   v2/nutrition/ansicht.tsx                Werkbank im Planner
    ge.   v2/nutrition/page.tsx                   Planliste laden
    ge.   __tests__/plan-eintrag-lage.test.ts     Waechter nachgezogen

**Nicht committet, nicht gestaget. Auf `dev` nur gelesen.**
**Kein Lebenszyklus ausgefuehrt** (C-373), **kein Teilen, kein
Kaufen** — als Liste `NICHT_GEBAUT` festgehalten, mit einem Waechter
gegen einen heimlichen Rollover.

### Offen, fuer Tom

1. `[cmd]` **`completed` und `archived` sperren NICHT.** Der ADR
   nennt nur `active`. `[read]` **Ein abgeschlossener Plan traegt aber
   sein Log** — wer ihn umbaut, aendert Vergangenes. **Ich habe das
   nicht heimlich entschieden;** die Frage gehoert beantwortet.
2. **E-41 sagt: *,,Bearbeiten" in Meal plans fuehrt in den
   Planner.*** **Der Sprung mit Planvorwahl ist nicht gebaut** — die
   Bibliothek zeigt weiter ihr eigenes Detail.
3. `[cmd]` **`darf_bearbeiten` fehlt im Schema** (C-375 bei Codex).
   Solange gilt `true`, und die zweite Sperre ist vorgesehen, aber
   nie ausgeloest.
4. **Nichts mehr offen zu diesem Punkt** — siehe unten: das
   Verschieben ist verdrahtet.


## Abnahme

**2026-08-31, Orchestrator.**

**Die Werkbank steht.** `[cmd]` **Zwei Wochen angelegt: 2 Wochen, 14
Tage, im Browser gemessen.** `[cmd]` **Und das Formular fragt Name,
Beschreibung, Ziele, Wochenzahl** — **0 Datumsfelder, 0
Lebenszyklusknoepfe, 1 Wochenfeld.**

### Der Widerspruch, den er loesen musste

`[cmd]` **`week_start` ist `NOT NULL`, ein Entwurf hat kein
Startdatum.**

`[read]` **Geloest mit Ankerdaten:** die Wochen liegen relativ
zueinander, ab dem Montag der Anlegewoche. `[cmd]` **Beim Aktivieren
verschiebt sich alles: zwei Wochen ab 31.08., aktiviert auf 14.09.,
werden 14.09. und 21.09. — alle 14 Tage um +14 verschoben.**

`[read]` **Damit ist E-40 erfuellt:** ein Plan ohne Startdatum steht
in der Bibliothek, **das Datum entsteht beim Aktivieren.**

### G-306 — und der Befund, der den ADR rechtfertigt

`[cmd]` **`ON DELETE RESTRICT` blockiert nur das Loeschen einer
protokollierten Position, nicht das Aendern.** `[cmd]` **Ein
`UPDATE amount_g = 999` an einem aktiven Plan ging glatt durch.**

`[read]` **Das ist genau die Luecke, die G-298 geoeffnet hat** — **und
der Grund, warum die Regel in der Anwendung liegen muss, nicht in der
Datenbank.**

`[cmd]` **Der Browser liefert jetzt HTTP 409 mit Grund und
Ausweg.**

`[cmd]` **Und der Ausweg ist echt:** *Kopie bearbeiten* erzeugt eine
`assigned`-Kopie mit Wochen, Tagen und Positionen, **das Original
bleibt aktiv mit seinem Log.** `[read]` **Das Pausieren ist eine Wahl,
kein Automatismus** — richtig, der ADR sagt *muss pausieren*, aber wer
entscheidet, ist der Nutzer.

### C-375 — vorbereitet, wartet auf die Spalte

`[cmd]` **Das Flag gibt es nicht** — der einzige Treffer war
`checkins.template_id` aus Recovery.

`[cmd]` **Die Auswertung ist gebaut und wartet auf Codex.**

`[read]` **Und die zwei Sperren bleiben getrennt, wie E-41
verlangt** — `[cmd]` **der Kopierknopf erscheint nur bei der
Aktiv-Sperre**, **weil eine Kopie die Entscheidung des Erstellers
umgehen wuerde.**

`[read]` **Das ist die schaerfere Fassung meiner eigenen
Unterscheidung.** **Ich hatte die zwei Sperren getrennt; er hat
gemerkt, dass der Ausweg nur zu einer davon gehoert.**

### Fuenf eigene Waechter fielen zuerst

`[read]` Er nennt es beim Namen: *,,alle dieselbe Klasse — nach einem
Wort gesucht, wo die Sabotage etwas Benachbartes geaendert hat. Das
ist keine Unaufmerksamkeit mehr, sondern eine Bauregel, die ich
wiederholt nicht anwende."*

`[cmd]` 19 Waechter, 27 Sabotagen, 27 gefangen.

**Abgenommen.** **Zwei offene Sachen als C-376 und G-307.**

