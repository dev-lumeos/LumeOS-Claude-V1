---
nr: G-306
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-298
entscheidung: E-42
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-09-01
commit: OFFEN
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-08-31
---

# G-306 — der Planeditor verletzt die Immutabilitaet

## Befund

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17, bestaetigt in `SPEC_01`
Abschnitt 8, `SPEC_04` und `SPEC_02_PATCH_NOTES`:**

    MealPlan.status = 'active'
      -> MealPlanDay READ-ONLY
      -> MealPlanItem READ-ONLY
      -> API gibt 409 bei PUT/PATCH/DELETE

`[cmd]` **G-298 hat am 31.08. genau das gebaut, was der ADR
verbietet** — hinzufuegen, aendern und entfernen an einem Plan mit
`status = active`.

`[read]` **Weder Claude Code noch der Orchestrator hatten den ADR
gelesen.** `[read]` **Der Auftrag nannte `SPEC_03` und `SPEC_10`,
nicht die ADRs.**

## Warum die Regel gut ist

`[cmd]` **Die Begruendung steht im ADR:** *,,MealPlanLog referenziert
`plan_item_id`. Wenn Items nachtraeglich geaendert werden, stimmt die
Compliance-History nicht mehr und Deviation-Berechnungen werden
falsch."*

`[read]` **Aus einem aktiven Plan entstehen Ghost Entries im
Tagebuch.** **Wer ihn nachtraeglich aendert, aendert rueckwirkend,
was geplant war.**

## Was zu tun ist

`[read]` **Die Bearbeitung an `status` binden:** Entwurf ja, aktiv
nein.

`[cmd]` **Und der Ausweg steht im ADR:** *,,pausieren, eine Kopie
erstellen, bearbeiten und neu aktivieren."*

`[read]` **Ohne einen Knopf dafuer ist die Regel eine Sackgasse** —
der Nutzer sieht, dass er nicht darf, und findet keinen Weg. **E-41
schlaegt *Kopie bearbeiten* vor.**

## Auftrag

**Mitbeauftragt mit C-372 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in C-372)

`[cmd]` **Zurueckgebaut und abgesichert.** `ADR_IMPROVEMENTS_PACKAGE`
#17 verlangt: `status = 'active'` -> Positionen READ-ONLY, **API gibt
409**.

`[cmd]` **Im Browser an einem echten aktiven Plan gefahren:**

    Aenderung an einer Position -> HTTP 409
    „Dieser Plan läuft. Seine Positionen sind eingefroren, weil das
     Protokoll auf sie zeigt … Über „Kopie bearbeiten“ entsteht ein
     Entwurf …"

`[cmd]` **409, nicht 403** — dafuer gibt es den neuen Fehlercode
`PLAN_AKTIV`. `[read]` **Der Unterschied traegt:** bei 403 fehlt das
Recht dauerhaft, bei 409 ist der Zustand im Weg, **und der laesst
sich aendern.**

### Warum die Regel in der Anwendung stehen MUSS

`[cmd]` **Gemessen: `meal_plan_logs.plan_entry_id` traegt
`ON DELETE RESTRICT`** — **die Datenbank verhindert nur das LOESCHEN
einer protokollierten Position, nicht ihr AENDERN.** `[cmd]` **In der
Probe ging `UPDATE amount_g = 999` auf eine Position eines aktiven
Plans glatt durch.**

`[read]` **Genau diese Luecke hat G-298 aufgemacht.**

### Der Ausweg — sonst waere die Regel eine Sackgasse

`[cmd]` **Am gesperrten Plan steht *Kopie bearbeiten*.** Die Kopie
traegt Wochen, Tage und Positionen, ist **`assigned`** (also
bearbeitbar), **und das Original bleibt `active` mit seinem
Protokoll.** `[read]` **Waere die Kopie sofort aktiv, fuehrte der
Ausweg im Kreis** — ein Waechter haelt das fest.

`[cmd]` **Das Pausieren des Originals ist eine Wahl, kein
Automatismus.**

### Ein bestehender Waechter ist gefallen — zu Recht

`[cmd]` **`G-298: der Schreibweg prueft die Coach-Sperre"` zaehlte
`pruefeFreigabe`-Aufrufe**, und die Funktion prueft nur die Herkunft.
**`pruefePositionsRecht` prueft beide Sperren in einer Abfrage**;
`pruefeFreigabe` und `herkunftDesTages` sind entfernt (A-59).

## Abnahme

**2026-08-31, mit C-372 abgenommen:** gebaut: HTTP 409 mit Grund und Ausweg. Der Befund dazu: `ON DELETE
RESTRICT` blockiert nur das Loeschen, nicht das Aendern.

## Auftrag — die Sperre feiner fassen

**Entschieden in `docs/entscheidungen/E-42`.** **Mitbeauftragt:
C-375, C-377, C-373.**

**Beauftragt am 2026-08-31.**

### Was zurueckzubauen ist

`[cmd]` **Du hast in C-372 die Sperre auf Planebene gebaut: HTTP 409
fuer jeden aktiven Plan.** `[read]` **Das war meine Vorgabe, und sie
war falsch.**

Tom, 2026-08-31: *,,wenn wir den einschraenken dass er nicht editieren
kann dann bescheisst er sich ja selber im sinne: ach ich kann nicht
editieren dann melde ich einfach etwas anderes das ich gegessen
habe."*

`[read]` **Eine Sperre, die sich umgehen laesst, macht die Daten
schlechter.**

### Die richtige Regel

    geloggt           eingefroren -- das ist Vergangenheit
    nicht geloggt     frei, auch zukuenftige Plantage

`[read]` **409 nur, wenn diese Position ein Log mit
`status <> 'pending'` traegt** — nicht fuer den ganzen Plan.

`[cmd]` **Der `resolution_check` erzwingt es bereits:** ein
`pending`-Log hat kein `actual_meal_id` und kein `confirmed_at`.
**Es gibt nichts zu verfaelschen.**

`[read]` **Und damit faellt *Kopie bearbeiten* weg** — er war die
Antwort auf eine Sperre, die es so nicht geben soll. `[read]` **Falls
du ihn behalten willst: sag warum, aber nicht als Ausweg aus einer
Sperre.**

### C-375 — das Flag heisst anders

`[read]` **Mein `darf_bearbeiten` war das falsche Flag.**

Tom: *,,wenn ich einen plan kaufe dann ist das mein plan, aber ein
Coach der einen mealplan auf marketplace verkauft, dass der nicht
wiederverkaufbar wird."*

`[cmd]` **Gemeint ist ein Weiterverkaufsschutz, kein Editierschutz.**

`[read]` **Vorschlag: `darf_weiterverkaufen boolean NOT NULL DEFAULT
true`** — **und die Anzeige sagt es, statt zu sperren.**

`[read]` **Der Kaeufer darf seinen Plan aendern. Er darf ihn nur
nicht weiterverkaufen.**

### C-377 — der abgelaufene Plan braucht eine Frage

Tom: *,,ist ein kompletter plan abgelaufen muss eine meldung kommen
und geklaert werden wie es weiter geht, renew/anderen
wochenplan/manuelle erfassung."*

`[cmd]` **Heute steht dort *,,aktiv · abgelaufen"* und sonst nichts.**

`[read]` **Drei Wege, und der Nutzer waehlt:** denselben Plan neu
starten, einen anderen aktivieren, oder ohne Plan weitermachen.

`[cmd]` **`meal_plans.status` kennt die Zustaende** — es fehlt der
Weg dorthin.

### C-373 — und der Lebenszyklus

`[cmd]` **Die Zykluswahl wird gespeichert und nie ausgefuehrt.**

`[read]` **Mit C-377 klaert sich das:** **die Meldung beim Ablauf ist
die Ausfuehrung.** `[read]` **`rollover` heisst dann: der Vorschlag
lautet *,,denselben Plan neu starten"*.** **Kein Zeitplaner noetig.**

### Was nicht zu tun ist

**Keine Editiersperre fuer nicht geloggte Positionen.**
**Kein Weiterverkauf bauen** — nur das Flag.
**Nichts auf `dev@lumeos.app`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    nicht geloggte Position   aenderbar am aktiven Plan, belegt
    geloggte Position         409, belegt
    Zukunftstag               aenderbar, belegt
    darf_weiterverkaufen      Spalte da, Anzeige sagt es
    abgelaufener Plan         Meldung mit drei Wegen, jeder gegangen
    rollover                  der Vorschlag heisst "neu starten"
    dev                       unveraendert

## Bericht

**Alle Nachweiszeilen belegt. Gate gruen (1.175 Tests), 22 von 22
Sabotagen gefangen, `dev@lumeos.app` unveraendert.**

### 1. Die Sperre haengt jetzt an der Position, nicht am Plan

`[cmd]` **Vor dem Umbau gemessen, an einem AKTIVEN Plan:** ein
`UPDATE amount_g = 999` ging durch. **Die Datenbank sperrt nichts** --
der `ON DELETE RESTRICT` an `meal_plan_logs.plan_entry_id` blockiert
das *Loeschen* einer geloggten Position, nicht ihr *Aendern*.

`[read]` **Die Sperre lag also allein im Schreibweg, und sie lag
falsch:** `pruefePositionsRecht` wies jede Position eines aktiven
Plans ab.

**Neu, nach E-42:** `pruefeProtokoll` fragt genau eine Frage --
*traegt DIESE Position ein Log mit `status <> 'pending'`?*

    positionEingefroren(null)         false   kein Log
    positionEingefroren('pending')    false   nichts zu verfaelschen
    positionEingefroren('confirmed')  true
    positionEingefroren('deviated')   true
    positionEingefroren('skipped')    true

`[cmd]` **Der `resolution_check` traegt es:** ein `pending`-Log hat
`actual_meal_id IS NULL` und `confirmed_at IS NULL`. **Es gibt nichts
zu verfaelschen, also gibt es nichts zu sperren.**

### 2. Im Browser gemessen -- ein aktiver Plan, drei Positionen

`[cmd]` **Konto `test-user@lumeos.local`, 2026-09-01, Plan
*G-306 Browserprobe* auf `status = 'active'`.** Jede Position
einzeln ueber die Oberflaeche geaendert:

    Position                       Log         HTTP   danach in der DB
    breakfast / 2026-08-31         confirmed   409    200 g (unveraendert)
    lunch     / 2026-09-01         kein Log    200    250 g
    dinner    / 2026-09-04         kein Log    200    250 g

`[read]` **Zeile 1 ist die Zusage *,,geloggte Position 409"*, Zeile 2
*,,nicht geloggte Position aenderbar am aktiven Plan"*, Zeile 3
*,,Zukunftstag aenderbar"*** -- 2026-09-04 liegt drei Tage vor dem
Messtag.

### 3. Warum ,,Kopie bearbeiten" entfernt und nicht behalten wurde

**Der Auftrag liess die Wahl:** *,,Falls du ihn behalten willst: sag
warum, aber nicht als Ausweg aus einer Sperre."*

`[read]` **Ich habe ihn entfernt, und den Grund gibt der Halbsatz
selbst.** Der Knopf war 165 Zeilen, die genau eine Aufgabe hatten:
den Nutzer um die Plansperre herumfuehren. **Ohne die Sperre fuehrt
er um nichts mehr herum.**

`[read]` **Einen Plan zu duplizieren mag fuer sich sinnvoll sein** --
als Bibliotheksfunktion, mit eigener Begruendung, beantragt. **Was
ich nicht tun wollte, ist ihn stehen lassen und ihm nachtraeglich
einen Zweck suchen** -- das ist die Sorte Code, die A-59 meint.

`[cmd]` **Entfernt: `planKopieren`, `planKopierenSchema`, `KopieKnopf`,
`plan_kopieren` in der Route.** Ein Waechter prueft die Abwesenheit in
allen drei Dateien.

### 4. C-375: das Flag heisst `darf_weiterverkaufen`

`[cmd]` **Waehrend dieses Auftrags hat Codex die Spalte eingespielt**
(Schritt `371_recipe_source_plan_origin_buddy_resale.sql`). **Live
gemessen, 2026-09-01:**

    nutrition.meal_plans.darf_weiterverkaufen   boolean  NOT NULL  DEFAULT true
    nutrition.recipes.darf_weiterverkaufen      boolean  NOT NULL  DEFAULT true

`[read]` **Die Anzeige las bis dahin hart `undefined`.** Jetzt liest
sie die Spalte, und sie **sagt** statt zu sperren:

> ,,Dieser Plan darf nicht weiterverkauft werden. Aendern und
> verwenden kannst du ihn frei -- er gehoert dir."

`[cmd]` **Der Bearbeiten-Knopf haengt an keiner Bedingung mehr** --
kein `sperreVon`, kein Zustandsvergleich. **Ein Waechter prueft das.**

### 5. C-377/C-373: drei Wege, und jeder gegangen

`[cmd]` **Alle drei ueber die Oberflaeche geklickt, HTTP und
Datenbankstand je Weg:**

    Weg                            HTTP   Plan danach          Frage danach
    Denselben Plan neu starten     200    active, rollover 0->1   weg
    Einen anderen Plan aktivieren  200    completed               weg
    Ohne Plan weitermachen         200    completed               weg

`[cmd]` **Bei ,,neu starten" wanderten die Wochen mit:** die Tage lagen
vorher im Juli, danach auf 01.--07.09.

`[read]` **`completed`, nicht `archived`** -- der Plan ist
abgeschlossen, nicht weggeraeumt; er bleibt in der Bibliothek
waehlbar.

**Der Vorschlag kommt aus dem Lebenszyklus, die Handlung vom Nutzer:**

    rollover   -> "Denselben Plan neu starten"
    sequence   -> "Einen anderen Plan aktivieren"  (der Folgeplan)
    once       -> "Einen anderen Plan aktivieren"  (die Bibliothek)
    NULL       -> kein Vorschlag, alle drei gleichwertig

`[cmd]` **Kein Zeitplaner gebaut, und keiner noetig:** in G-304
gemessen, es gibt kein `pg_cron` und keine Lebenszyklus-Funktion.
**Die Meldung IST die Ausfuehrung** -- dieselbe Antwort wie bei C-358.

### 6. Ein Fehler, den erst der Browser gezeigt hat

`[cmd]` **Nach dem Weg *,,anderen Plan aktivieren"* stand der Plan auf
`completed` -- und die Ablauffrage stand weiter da.**

`[read]` **Die Anzeige rechnete nur die Laufzeit, nicht den Zustand.**
Ein Plan, der die Frage beantwortet hat, stellte sie erneut.

**Behoben** mit einer zweiten Bedingung; Wege 2 und 3 danach
nachgemessen: *Frage noch da: false*. **Ein Waechter deckt es.**

### 7. Die Waechter, und was die Sabotageprobe gefunden hat

`[cmd]` **20 Waechter in `plan-werkbank.test.ts`, 22 Sabotagen, 22
gefangen** -- Rueckbau je Sabotage per SHA-256 als byteidentisch
belegt.

`[cmd]` **Im ersten Durchgang kamen drei durch, und zwei davon waren
ernst:**

    S6   der Schreibweg prueft das Protokoll gar nicht mehr
    S8   die Abfrage schliesst 'confirmed' aus statt 'pending'
    S15  der Zaehler wird im UPDATE entfernt

`[read]` **S6 und S8 sind genau die Klasse aus G-216/G-247/G-246:**
mein Waechter suchte den Aufruf im Quelltext, statt zu messen, ob ein
Fehler kommt. **Der Text stand da, die Wirkung fehlte** -- und der
Waechter blieb gruen.

**Behoben durch einen Verhaltenswaechter:** `pruefeProtokoll` wird mit
einer Attrappen-Datenbank aufgerufen und geprueft wird, *dass*
abgewiesen wird, *womit* (`POSITION_GELOGGT`, der Satz) und *wonach*
die Abfrage sucht (`neq('status','pending')`).

`[read]` **S15 war der Zaehlfehler aus derselben Familie:**
`rollover_count: neuZaehler` steht zweimal im Block -- im `UPDATE`
und im Rueckgabewert. **`assert.match` fand den zweiten.** Jetzt wird
gezaehlt, nicht gesucht.

### 8. Ein fremder Waechter fiel mit

`[cmd]` **G-298 in `plan-eintrag-lage.test.ts` zaehlte
`pruefePositionsRecht` -- die Funktion, die E-42 aufloest.**

`[read]` **Der Kern des Waechters gilt weiter:** G-269 sperrt nach
**Herkunft**, und das hat E-42 nicht angetastet. **Nur die
Statushaelfte ist weg.** Umgestellt auf die zwei getrennten
Pruefungen, mit dem Grund im Kommentar.

    pruefeHerkunft    4x   (anlegen, aendern, loeschen, ablauf_klaeren)
    pruefeProtokoll   2x   (aendern, loeschen)

`[read]` **Das Anlegen prueft kein Protokoll** -- eine Position, die es
noch nicht gibt, kann nicht geloggt sein.

### 9. Stand

    pnpm gate                gruen, 11 von 11 Aufgaben
    Tests apps/web           1.175, davon 0 rot
    Sabotagen                22 von 22 gefangen, Rueckbau byteidentisch
    test-user@lumeos.local   0 Plaene, 0 Logs -- Buehne zurueckgebaut
    dev@lumeos.app           1 Plan, updated_at 2026-08-30 (vor diesem Auftrag)
    committet                nein

### Was ich NICHT gebaut habe

`[read]` **Kein Weiterverkauf** -- nur das Flag und der Satz, wie
vorgegeben.
`[read]` **Kein Zeitplaner** -- C-373 braucht keinen.
`[read]` **Keine Editiersperre fuer nicht geloggte Positionen** --
das war der Auftrag.

### Eine Frage, die offen bleibt

`[read]` **`once` und `sequence` bekommen denselben Vorschlag**
(*,,einen anderen Plan aktivieren"*), aber aus verschiedenen Gruenden:
bei `sequence` ist der Folgeplan benannt, bei `once` ist es die
Bibliothek. `[cmd]` **Der Vorschlagssatz unterscheidet die beiden,
der Knopf nicht.**

**Das reicht, solange kein Feld den Folgeplan traegt** -- `meal_plans`
hat keine Spalte dafuer, gemessen am 2026-09-01. **Wenn C-373 spaeter
eine Kette bauen soll, gehoert der Folgeplan benannt und der Knopf
getrennt.**


## Abnahme

**2026-09-01, Orchestrator.**

**Alle sechs Nachweiszeilen belegt, je Position ueber die
Oberflaeche.**

    breakfast / 31.08.   confirmed   409   200 g unveraendert
    lunch / 01.09.       kein Log    200   250 g
    dinner / 04.09.      kein Log    200   250 g

`[read]` **Die dritte Zeile ist der Zukunftstag** — **genau der Fall,
den meine alte Vorgabe gesperrt haette.**

`[cmd]` **`darf_weiterverkaufen` liegt live auf `meal_plans` und
`recipes`, die Anzeige liest sie** — Codex hat sie waehrend des
Auftrags eingespielt.

`[cmd]` **Die drei Ablaufwege sind jeder einmal geklickt:** rollover
auf *neu starten*, `rollover_count` 0 auf 1, Wochen vom Juli auf
01.–07.09.

### Warum *Kopie bearbeiten* weg ist

`[cmd]` **165 Zeilen mit genau einer Aufgabe: um die Plansperre
herumfuehren.**

`[read]` Sein Satz: *,,Ohne die Sperre fuehrt er um nichts mehr
herum. Einen Plan zu duplizieren mag fuer sich sinnvoll sein — dann
als Bibliotheksfunktion mit eigener Begruendung, beantragt statt
uebriggelassen."*

`[read]` **Richtig.** **A-59 in seiner sauberen Form: nicht
liegenlassen, weil es mal gebraucht wurde.**

### Zwei Funde, die er nicht gesucht hat

`[cmd]` **Die Sabotageprobe liess im ersten Durchgang S6 und S8
durch:** der Schreibweg konnte aufhoeren zu pruefen, **und jeder
Waechter blieb gruen.**

`[read]` **Er ordnet es selbst ein:** *,,die Klasse aus
G-216/G-247/G-246 — ich suchte den Aufruf im Quelltext, statt zu
messen, ob ein Fehler kommt."*

`[cmd]` **Behoben mit einem Verhaltenswaechter gegen eine
Attrappen-Datenbank**, der prueft **dass**, **womit**
(`POSITION_GELOGGT`) und **wonach** (`neq('status','pending')`).
`[cmd]` **Zweiter Durchgang: 22 von 22 gefangen.**

`[cmd]` **Der zweite Fund kam erst im Browser:** nach Weg 2 stand der
Plan auf `completed` **und die Ablauffrage blieb stehen** — **die
Anzeige rechnete nur die Laufzeit, nicht den Zustand.**

### Eine offene Frage, sauber benannt

`[cmd]` **`once` und `sequence` teilen sich einen Knopf, weil
`meal_plans` keine Spalte fuer den Folgeplan hat.** `[cmd]` **Der
Vorschlagssatz unterscheidet sie, der Knopf nicht.**

`[read]` Sein Urteil: *,,Reicht, solange keine Kette gebaut wird."*
**Als C-379.**

### Und eine saubere Behandlung des ueberholten Abschnitts

`[cmd]` **Bei C-375 hat er den alten C-372-Abschnitt nicht
ueberschrieben, sondern als *UEBERHOLT durch E-42* gekennzeichnet.**

`[read]` **Richtig — er war als Stand vom 31.08. korrekt.**

`[cmd]` Gate gruen, 1.175 Tests, 11/11, `dev` unberuehrt.

**Abgenommen.**

