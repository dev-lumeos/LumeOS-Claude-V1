---
nr: G-554
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: claudecode
beauftragt: 2026-09-30

braucht: [G-536, G-537, G-553]
kind_von: G-537

quellen:
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals.jsx
  - docs/ssot/130-goals-bauordnung.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.user_goals
    - goals.goal_phases
    - goals.goal_strategies
  dateien:
    - apps/web/src/app/v2/goals/modale.tsx
    - apps/web/src/app/v2/goals/ziel-karten.tsx
    - apps/web/src/lib/goals/schreiben.ts
    - apps/web/src/lib/goals/ziel-regeln.ts

zahlen:
  gemessen: 2026-09-29
  typen_im_entwurf: 6
  typen_im_check: 4
  strategiewahl_im_modal: 0
---

# Phasenziele sind nicht anlegbar, und der Reiter ist nicht nach Vorgabe

**Tom, 2026-09-29, 17:06:** *„konzentriere dich nun zuerst auf die subnav
Goals dass das nach vorgabe ist und ich auch die einzelnen phasenziele
manuell anlegen kann, das kann ich naemlich heute nicht, das modal ist nicht
dafuer gebaut das hat nur rudimentaere funktionen drin."*

## Was ein Phasenziel ist

**Tom, frueher am Tag:** *„da wirst die einzelnen phasen als normale goals
finden, und phase engine ist nur ein builder der diese einzel goals plant."*

`[read]` **Ein Phasenziel ist ein Ziel mit einer Strategie und einem
Zeitfenster.** „Lean Bulk bis September" ist kein Ernaehrungsplan und keine
Phase fuer sich — es ist ein `body_composition`-Ziel, an dem die Strategie
`lean_bulk` haengt, von Startdatum bis Deadline.

`[cmd]` **Alle drei Teile sind gebaut.** `goals.user_goals` traegt das Ziel
(G-537), `goals.goal_strategies` den Katalog mit 17 Eintraegen (G-536),
`goals.goal_phases` die Bindung mit `goal_id` und `strategie_code` (G-538).
**Was fehlt, ist der Weg, sie in einem Zug anzulegen.**

## A1 — die Strategiewahl gehoert ins Anlegen-Modal

`[cmd]` **Das Modal hat sie nicht.** G-537 baute: Typ, Titel, Ist- und
Zielwert, Einheit, Start, Deadline, Prioritaet, Notizen, Modulwahl. **Keine
Strategie** — der Auftrag hatte sie ausdruecklich ausgeschlossen (*„Er legt
kein Ernaehrungsziel an"*), und das war fuer G-537 richtig: der Katalog war
damals nicht live.

**Jetzt ist er live, und damit aendert sich die Grenze.**

    Ziel vom Typ body_composition   -> Strategiewahl erscheint
                                       (aus goal_strategies, G-541 hat die
                                        Auswahl schon gebaut)
    alle anderen Typen              -> keine Strategiewahl
                                       Ein Bankdrueck-Ziel hat keine
                                       Ernaehrungsstrategie.

`[read]` **Die Wahl ist freiwillig.** Ein `body_composition`-Ziel ohne
Strategie bleibt gueltig — es sagt wohin, nicht wie. Wer eine waehlt, legt
damit **ein Phasenziel** an.

## A2 — anlegen heisst dann: Ziel und Phase in einem Schritt

    zielAnlegen           die Zielzeile        (existiert, G-537)
    goal_phase_start      die Phase daran      (existiert, G-538,
                                                verlangt goal_id)

`[read]` **Beides oder keines.** Wenn die Phase faellt, darf kein Ziel ohne
sie stehenbleiben — sonst entsteht genau der Zustand, den G-538 beseitigt
hat. Der Fehler aus G-79 gilt weiter: **Zeilenzahl pruefen**, nicht auf das
Ausbleiben eines Fehlers vertrauen.

`[cmd]` **Und `goal_phase_start` nimmt den `strategie_code` heute nicht
entgegen** — das hat G-541 A5 gemeldet. **Das ist der Teil, der bei Codex
liegt** (G-543 oder ein eigener Punkt); wenn er beim Bau noch fehlt, wird
die Wahl gehalten und mit einer Marke versehen, wie G-537 es mit
`linked_modules` gemacht hat. **Kein Knopf, der etwas verspricht.**

## A3 — sechs Typen, nicht vier

`[cmd]` **Der Entwurf (`module-goals.jsx:695-701`) zeigt sechs:**

    body_comp · weight · strength · performance · habit · custom

`[cmd]` **Der CHECK kennt vier:** `body_composition`, `performance`,
`health`, `lifestyle`. G-537 nahm die vier und meldete die Abweichung — das
war richtig, **loest aber Toms „nach vorgabe" nicht ein.**

`[read]` **Die Bruecke ist `subtype`**, und der Seed nutzt ihn schon:
`gain_muscle`, `cut`, `strength`, `cardio_frequency`, `training_capacity`.
**Die sechs Knoepfe des Entwurfs sind Paare aus Typ und Untertyp.** Die
Zuordnung gehoert vorgeschlagen und **gemeldet, nicht stillschweigend
gewaehlt** — `weight` und `custom` sind die zwei, bei denen sie nicht
offensichtlich ist.

## A4 — die Zielkarten nach Vorgabe

`[cmd]` Der Entwurf zeigt je Ziel: Fortschritt in Prozent, **Pace**
(`ahead` / `on-track` / hinterher, farbig), Deadline mit Resttagen, die
verknuepften Module als Pillen, und im Detailmodal *„Plan vs actual"* als
Verlaufskurve.

    progress_pct       Spalte da
    target_date        Spalte da -> Resttage rechnen
    linked_modules     Spalte da seit G-538, alle Zeilen leer
    pace               KEINE Spalte - eine Ableitung
    history[]          KEINE Spalte - kommt aus den Modulen

`[read]` **`pace` ist der interessante Fall:** er vergleicht den Ist-Verlauf
mit dem, was bis heute erreicht sein muesste — aus Startwert, Zielwert,
Startdatum und Deadline. **Das ist eine reine Rechnung** und gehoert
server-frei nach `lib/goals/`, mit einer von Hand nachrechenbaren Zahl in
der Zusicherung.

**`history[]` nicht erfinden.** Solange `linked_modules` leer ist und kein
Modul Werte liefert, bleibt die Kurve leer — der Entwurf hat dafuer den
Satz *„No data points logged yet."* **Kein Platzhalterverlauf.**

---

## Auftrag

**A1 bis A4 oben, in dieser Ordnung.** A3 zuerst, weil die sechs Typen
entscheiden, wann die Strategiewahl ueberhaupt erscheint.

### Was zuerst zu lesen ist

    docs/spezifikation/.../theme-v1/module-goals.jsx:695-765
      der Anlegen-Dialog und das Detailmodal, vollstaendig
    referenz/lumeos-2026/.../components/nutrition/GoalSetupDialog.tsx
      wie der Vorgaenger ein Ziel MIT Strategie angelegt hat - er lief

`[read]` **Die zweite Datei ist die wichtigere.** Der Vorgaenger hatte genau
diesen Weg schon: ein Ziel anlegen und dabei `goal_type_new` setzen. Lies,
wie er die zwei Schritte verbunden hat, bevor du es neu erfindest.

### Zu belegen

- **Bilder je Fall** auf `test-user@lumeos.local`: Modal offen mit sechs
  Typen · `body_composition` gewaehlt, Strategiewahl sichtbar · `strength`
  gewaehlt, Strategiewahl **nicht** sichtbar · ein Phasenziel angelegt ·
  die Zielkarte danach mit Fortschritt, Pace und Deadline
- **die Zuordnung Typ/Untertyp als Tabelle im Bericht**, mit den zwei
  unklaren Faellen benannt — nicht still gewaehlt
- **`pace` mit einer Zahl, die von Hand nachrechenbar ist**: Startwert,
  Zielwert, Startdatum, Deadline, heutiges Datum, erwarteter Wert, Ist-Wert,
  und daraus das Urteil
- **die Zeilenzahl bei beiden Schreibvorgaengen** — Ziel und Phase. Faellt
  die Phase, darf kein Ziel ohne sie stehenbleiben.
- vier andere Module zeichengleich
- Sabotageprobe je Waechter in beide Richtungen
- `pnpm gate` gruen, nichts committen

### Die Grenze

`[read]` **Nicht die Zeitachse** (G-544) und **nicht den Editor** (G-539).
Dieser Punkt macht den Goals-Reiter nach Vorgabe und Phasenziele anlegbar —
das Planen und Terminieren mehrerer Ziele kommt danach.

**Und keine Substanz, kein Peptid, keine Dosierung** — G-546 ist nicht
entschieden.

## Warum dieser Punkt vor G-544 kommt

**Tom, 17:06:** *„betreffs sehe ich wieder was, das heisst noch lange nicht
das ich sehe was ich sollte."*

`[read]` **G-553 macht die Seite sichtbar, nicht richtig.** Und eine
Zeitachse (G-544) ueber Ziele, die man nicht anlegen kann, zeigt eine leere
Achse. **Erst muessen Phasenziele entstehen koennen, dann lassen sie sich
planen.**

---

## Nachtrag, 2026-09-30 08:50 — was G-553 bereitstellt

**G-553 ist fertig** (2.208 Tests, Gate gruen). Zwei Sachen daraus aendern
diesen Auftrag.

### `apps/web/src/lib/goals/ladefehler.ts` benutzen, nicht neu bauen

`[cmd]` G-553 hat die Unterscheidung Sitzungsfehler / Datenfehler gebaut, und
**sie liest den Text, nicht den Code** — Toms Fehler kam als `READ_FAILED`,
nicht als `NO_SESSION`, weil PostgREST den Tokenfehler als Antwort auf die
Abfrage meldet.

`[read]` **Das gilt beim Anlegen genauso.** Faellt `zielAnlegen` oder
`goal_phase_start` an einem abgelaufenen Token, darf im Modal nicht *„Das
Ziel konnte nicht angelegt werden"* stehen — der Nutzer aendert dann seine
Eingaben, und das Problem ist die Sitzung.

**Dieselbe Funktion, derselbe Vorbehalt:** im Zweifel Datenfehler. Ein falsch
als Sitzungsfehler gemeldeter Datenfehler schickt zu einer Anmeldung, die
nichts aendert.

### Der Ladefehler haengt nicht mehr am Reiterinhalt

`[cmd]` **Meine Vermutung in G-553 war falsch**, und Claude Code hat sie mit
einer Gegenprobe im Code widerlegt: G-541 hatte das Mockup nicht entfernt.
Die Ursache war ein Ternaer ueber sieben Reitern, dessen `else`-Zweig den
ganzen Inhalt trug — belegt dadurch, dass `cross`, `timeline` und `poses`
ausserhalb lagen und ihren Entwurf behielten.

`[read]` **Fuer A4 heisst das: die Zielkarten sind frei.** Sie haengen nicht
mehr an einem Ladefehler, und der Waechter aus G-553 haelt das fest. **Keine
Arbeit an der Kopplung mehr** — nur die Karten selbst.

### Und eine Einschraenkung, die beim Pruefen gilt

`[read]` **Ein verfaelschter Cookie erreicht die Goals-Seite nicht.** Die
Middleware ruft `getUser()` und leitet nach `/login` um. Toms Token kam durch
die Middleware und fiel erst bei PostgREST — **ein kaputter Cookie bildet das
nicht ab, er ist zu kaputt.**

**Wer einen Fehlerweg im Anlegen pruefen will, loest ihn direkt aus** statt
die Sitzung zu verfaelschen. G-553 hat es so gemacht und danach mit md5
gegen das Original geprueft.


---

## Bericht Claude Code, 2026-09-30

### Was gebaut wurde

    apps/web/src/lib/goals/pace.ts               A4 -- reine Rechnung
    apps/web/src/lib/goals/phasenziel-write.ts   A2 -- beides oder keines
    apps/web/src/lib/goals/ziel-arten.ts         A3 -- die sechs Knoepfe
    apps/web/src/lib/goals/strategie-regeln.ts   A2 -- Strategie -> Phasenart
    apps/web/src/app/v2/goals/modale.tsx         A1 -- die Strategiewahl
    apps/web/src/app/v2/goals/ziel-karten.tsx    A4 -- Pace, Frist, Module
    apps/web/src/lib/goals/lesen.ts              gueltig_ab, linked_modules
    apps/web/src/lib/goals/__tests__/g554-phasenziel.test.ts

### A3 — die Zuordnung, wie verlangt gemeldet statt still gewaehlt

`[cmd]` **Der Entwurf zeigt sechs Knoepfe, der CHECK kennt vier Werte.**
`[cmd]` **`user_goals.subtype` hat KEINEN CHECK** (gemessen 2026-09-30)
und traegt fuenf gelebte Werte — **das ist die Bruecke.**

    Knopf         goal_type           subtype              Beleg
    ------------------------------------------------------------------
    body_comp     body_composition    --                   die Art selbst
    weight        body_composition    --                   VORSCHLAG
    strength      performance         strength             4 Zeilen Seed
    performance   performance         training_capacity    1 Zeile Seed
    habit         lifestyle           cardio_frequency     2 Zeilen Seed
    custom        lifestyle           --                   VORSCHLAG

**Die zwei offenen Faelle, ausdruecklich als solche gebaut**
(`unsicher: true`, und ein Waechter haelt das fest):

`[read]` **`weight`** — Gewicht ist eine MESSGROESSE, keine Absicht.
**Sowohl `cut` als auch `gain_muscle` sind Gewichtsziele**, beide unter
`body_composition`. **Vorgeschlagen: `body_composition` ohne vorbelegten
Untertyp** — die Richtung ergibt sich erst aus Ist- und Zielwert.
**Offen: soll `weight` ein eigener `subtype` werden?**

`[read]` **`custom`** — „Custom" ist die Abwesenheit einer Einordnung,
und der CHECK erlaubt keinen freien `goal_type`. **Vorgeschlagen:
`lifestyle` ohne Untertyp**, weil das die weiteste der vier Arten ist.
**Offen: richtige Art, oder braucht `custom` einen eigenen CHECK-Wert?**

### A1 — die Strategiewahl, nur wo sie etwas bedeutet

    body_composition (body_comp, weight)  -> Wahl erscheint
    performance, lifestyle                -> Wahl erscheint NICHT

`[cmd]` **Am Schirm belegt:** bei `Strength PR` ist
`[data-zielstrategie-feld]` **0**, bei `Body composition` **1**.

`[read]` **Freiwillig, mit einem eigenen Knopf „ohne"** — ein
`body_composition`-Ziel ohne Strategie bleibt gueltig. **Wer eine
waehlt, legt ein Phasenziel an.**

### A2 — Ziel und Phase in einem Schritt

`[cmd]` **Der Vorgaenger machte es serverseitig in EINEM Aufruf**
(`GoalSetupDialog.tsx:45` -> `useCreateNutritionGoal` -> ein `POST`).
**Genauso hier:** eine Serveraktion, nicht zwei Aufrufe aus dem Browser.

`[cmd]` **Es gibt keine Transaktion ueber zwei PostgREST-Aufrufe** —
**also wird das Ziel zurueckgenommen, wenn die Phase faellt.** Hartes
`DELETE`, kein `deleted_at`: die Zeile ist Sekunden alt und war nie
gueltig. **Mit `.select('id')` nachgezaehlt (G-79).**

**Die Zeilenzahl beider Schreibvorgaenge, gemessen:**

    user_goals    1 Zeile   body_composition - Lean Bulk bis Maerz 2027
                            prio 2 - active - 80.000 -> 84.000 kg
                            2026-09-30 -> 2027-03-31
    goal_phases   1 Zeile   lean_bulk - Rate +0.300 - goal_id gesetzt
                            2026-09-30 -> 2027-03-31

**Die Bruecke Strategie -> Phasenart**, aus der Katalogzeile gelesen:

    fat_loss -> fat_loss | muscle_gain -> lean_bulk | hybrid ->
    maintenance | contest_prep -> contest_prep | recovery ->
    reverse_diet | expert -> expert_bb_annual

`[read]` **Zwei Ausnahmen:** `mini_cut` und `peak_week` liegen unter
einer anderen Kategorie, **sind aber selbst Phasenarten** — fuer sie
gewinnt der Code.

`[cmd]` **`goal_phase_start` nimmt `strategie_code` weiterhin nicht
entgegen** (gemessen: sieben Parameter, keiner dafuer). **Die Wahl wird
gehalten und zweifach markiert** — am Feld und im Ergebnissatz:
*„Die Phase steht. Der Strategiecode wird noch nicht gespeichert — er
wartet auf G-543/A5."*

### A4 — der Pace, von Hand nachrechenbar

`[cmd]` **Keine Spalte, eine Ableitung aus fuenf vorhandenen Werten.**
**Das durchgerechnete Beispiel steht im Dateikopf und in der
Zusicherung:**

    Abnehmen 80 -> 76 kg, 01.01. bis 01.03.2026, heute 31.01., Ist 79

    dauer       = 59 Tage
    verstrichen = 30 Tage
    zeitanteil  = 30 / 59              = 0,50847
    sollwert    = 80 + (76-80)*0,50847 = 77,966 kg
    streckenant.= (79-80) / (76-80)    = 0,25
    abweichung  = 0,25 - 0,50847       = -0,25847   -> behind

`[read]` **Der Bruch normiert die Richtung mit** — beim Zunehmen werden
beide Differenzen positiv, der Quotient bleibt gleich. **Keine
Fallunterscheidung.**

`[cmd]` **Am angelegten Ziel nachgerechnet:** 182 Tage Dauer, 0
verstrichen, Streckenanteil 0 -> Abweichung 0 -> **`on-track`**, und
genau das stand auf der Karte.

`[read]` **Wo die Grundlage fehlt, steht ein Grund statt eines Urteils**
(E-72): *„ohne Deadline gibt es keinen Zeitplan"*, *„noch kein Ist-Wert
erfasst"*. **Kein `on-track` mangels Daten.**

`[cmd]` **`history[]` nicht erfunden** — ein Waechter verbietet es.

### Ein fremder Waechter musste umgeschrieben werden

`[cmd]` **`v2-attrappen.test.ts` verbot die WOERTER `'ahead'`,
`'on-track'`, `'behind'`** in vier Dateien. **Seine Begruendung:** *„die
Datenbank fuehrt so etwas nicht"* — die Attrappe lieferte das Wort ohne
Rechnung dahinter.

`[read]` **Die Begruendung ist mit A4 hinfaellig**, die REGEL nicht:
C-108/F-02 sagt *nennen ja, bewerten nein*. **Der Waechter misst jetzt
das Bewerten** (Saetze wie *„zu langsam"*, *„du solltest"*) **und dass
die Zahl gerechnet ist** — `berechnePace(` muss dastehen, wenn ein Pace
gezeigt wird. **Sabotageprobe: ohne Rechnung wird er rot.**

`[cmd]` **Zwei weitere eigene Waechter nachgezogen:** `body_comp` ist
keine ungueltige `goal_type`-Konstante mehr, sondern eine Knopfkennung —
**verboten bleibt, sie ALS `goal_type` zu schreiben.** Und „Strategie"
ist im Dialog nicht mehr verboten (G-537 schloss sie aus, weil der
Katalog nicht live war) — **verboten bleibt Schicht 2: Kalorien, Makros,
Tageswerte.**

### Nachweise

    21 Sabotagen, je in beide Richtungen -- alle ROT (zwei waren
       zuerst gruen, siehe unten), 2 Kontrollproben gruen,
       Wiederherstellung byte-gleich (md5 geprueft)
    4 Bilder auf test-user@lumeos.local:
       x-g554-1-typen.png     sechs Typen, Strategiewahl sichtbar
       x-g554-2-strength.png  Kraftziel -- KEINE Strategiewahl
       x-g554-3-anlegen.png   Phasenziel angelegt, Marke im Ergebnis
       x-g554-4-karte.png     Karte: Prio 2 - on-track - noch 182 Tage
    lint + typecheck + test + build: 21/21 Tasks gruen, 2.243 Tests
    serverimport: 63 Client-Chunks, 0 Treffer (A-30 haelt)
    Testdaten wieder entfernt: user_goals 0, goal_phases 0
    SSOT nachgezogen. Nichts committet.

### Zwei Waechter, die zuerst nicht gemessen haben

`[read]` **Beide in der eigenen Sabotage aufgefallen:**

    1  „beides oder keines" suchte die WOERTER `zielZuruecknehmen`,
       `.delete()` und `.select('id')` irgendwo in der Datei. Die
       Sabotage ersetzte den AUFRUF durch `false` -- gruen, weil die
       Funktion weiter dastand, nur ungenutzt. Jetzt wird der
       catch-Block gemessen.
    2  Derselbe Fehler bei der Zeilenzaehlung. Jetzt wird der RUMPF
       der Funktion geprueft und dass ihr Rueckgabewert an
       `data?.length` haengt.

`[read]` **Und ein eigener Waechter hatte einen Falschtreffer:** das
Suchmuster fuer den alten Einzelweg trifft auch den neuen Namen, weil
der eine im anderen steckt — Wortgrenze ergaenzt. **Er hatte trotzdem
recht:** der alte Import stand noch ungenutzt in `modale.tsx` und ist
jetzt weg.

### Beim Bauen gefunden, nicht vom Auftrag genannt

`[cmd]` **Zwei Phasenarten VERLANGEN eine Rate** —
`goal_phases_zielrate_passt_zur_art`: `fat_loss` negativ, `lean_bulk`
positiv. **Ein Phasenziel ohne Rate wurde abgewiesen**
(*„Die Eingabe ist unvollstaendig"*).

`[read]` **Die Rate stand schon im Katalog:**
`weight_change_target_percent` — `lose` -0,5 | `gain` +0,3 | `maintain`
ohne. **Genau die richtigen Vorzeichen.** Sie wird jetzt aus der
Katalogzeile durchgereicht, nicht eingegeben.

### Rot im Gate, nicht von diesem Punkt

`[cmd]` **`pnpm gate` bricht bei `punkte-pruefen` ab:** der taegliche
Kettenlauf vom **2026-09-29, 21:00 Uhr** ist fehlgeschlagen
(`lumeos_tageskette_20260929`, Exit 1, Manifest
`supabase/_pipeline/kette.json`). `[read]` **Das liegt in `supabase/`
und ist aelter als diese Arbeit.**

`[cmd]` **Alles danach separat gelaufen und gruen:** `lint`,
`typecheck`, `test`, `build` — 21 von 21 Tasks, 2.243 Tests, 0 Fehler,
plus `serverimport`.

### Offen

`[read]` **`strategie_code` wird noch nicht gespeichert** — G-543/A5 bei
Codex. **Die Wahl ist bedienbar und markiert**, damit sie am Tag der
Einspielung nur durchgereicht werden muss.

`[read]` **`linked_modules` ist weiterhin in allen Zeilen leer** — die
Karte zeigt die Pillen, sobald etwas drinsteht. **Kein Platzhalter.**

`[read]` **Die zwei Zuordnungen `weight` und `custom` warten auf eine
Entscheidung** — sie stehen als Vorschlag im Code und sind als solcher
gekennzeichnet.
