---
nr: G-488
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a6bdeecf
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-488 - drei Zahlen zum Plan, keine zwei passen

## Befund

`[cmd]` **Auf einem Schirm gemessen, 2026-09-08:**

    Flaeche oben:    "Tag 3 von 35"
    Flaeche unten:   "Dauer 28 Tage"
    meal_plans:      days_count 28
    meal_plan_days:  63 Tage, 2026-06-18 bis 2026-10-23

`[cmd]` **Und *,,Laeuft bis 23.10."*** ? **19.09. + 28 Tage =
17.10.**

## Abnahmebedingungen

    A1  "Tag 3 von 35" gegen "28 Tage": welche stimmt?
        Berichtigt.
    A2  63 Tage in meal_plan_days gegen 28 im Plan:
        GEMELDET, wenn es ein Datenfehler ist.
    A3  "Laeuft bis": gerechnet oder gelesen?
    A4  vier Module unveraendert.

## Bericht

**Zwei der drei Zahlen stimmten. Falsch war die dritte — und der
Auftrag nennt eine vierte, die ich berichtigen muss.**

    A1  "Tag x von 35" gegen "28 Tage"     erfuellt
    A2  die Abweichung GEMELDET            erfuellt
    A3  "Laeuft bis": gerechnet oder       gelesen
        gelesen?
    A4  vier Module unveraendert           erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortigen Aenderungen sind
Codex' C-531.

### Zuerst: die 63 Tage gibt es nicht

`[cmd]` **Der Auftrag nennt:** *„meal_plan_days: 63 Tage,
2026-06-18 bis 2026-10-23"*.

`[cmd]` **Gemessen 2026-09-23 am AKTIVEN Plan** (`Aufbau-Wochenplan`,
`0aef80dd`):

    Woche       von         bis         Tage  kopiert
    2026-09-19  19.09.      25.09.        7   nein
    2026-09-26  26.09.      02.10.        7   ja
    2026-10-03  03.10.      09.10.        7   nein
    2026-10-10  10.10.      16.10.        7   ja
    2026-10-17  17.10.      23.10.        7   ja
                                        ----
                                         35

`[read]` **Fuenf Wochen, 35 Tage, vom 19.09. bis 23.10.** — **nicht
63, und nicht ab Juni.**

`[cmd]` **Ueber ALLE fuenf Plaene gezaehlt:**

    Plan                status      days_count   gezaehlt
    Aufbau-Wochenplan   active          28          35
    Lean bulk 3100      assigned        84          84
    test                assigned        28          28
    Cut 4-Meal 2200     paused          28          28
    Buddy auto-plan     paused           7           7

`[read]` **Nur EIN Plan weicht ab** — die anderen vier stimmen genau.
`[read]` **Die 63 aus dem Auftrag stammt vermutlich aus einer
Zaehlung ueber mehrere Plaene**; als Befund ueber diesen Plan haelt
sie nicht.

### A1 — welche Zahl stimmt: die 35

`[cmd]` **Gemessen auf Toms Schirm, vor der Aenderung:**

    "Tag 5 von 35"        aus den Tageszeilen
    "Dauer 28 Tage"       aus meal_plans.days_count
    "Laeuft bis 23.10."   aus dem letzten plan_date

`[read]` **Zwei von dreien kommen aus denselben Tageszeilen und
stimmen ueberein** — 35 Tage, letzter Tag der 23.10.

`[cmd]` **19.09. + 35 Tage = 23.10.** `[read]` **Die Rechnung geht
auf.** `[cmd]` **Mit 28 Tagen waere es der 17.10.** — **genau Toms
Befund.**

`[read]` **Also war „Dauer" die falsche Zahl**, nicht die beiden
anderen.

`[cmd]` **Berichtigt:** die Zeile zeigt jetzt die GEZAEHLTEN Tage.
`[read]` **Dieselbe Regel, die zwei Zeilen weiter oben schon galt** —
„Days count" nutzt `p?.days_count ?? z.tage`, „Laeuft bis" die
`plan_date`.

`[cmd]` **Gemessen nach der Aenderung:**

    "Tag 5 von 35"  ·  "Dauer 35 Tage"  ·  "Laeuft bis 23.10.2026"

### A2 — der Datenfehler, gemeldet und nicht geglaettet

`[cmd]` **Die Ursache steht in `plan-write.ts`, `ablaufKlaeren`,
Weg `neu_starten`:**

    status        -> active
    start_date    -> das neue Startdatum
    rollover_count -> +1
    danach: wochenAufStartdatumSchieben(...)

`[cmd]` **`days_count` wird NICHT angefasst.**

`[read]` **Ein Plan, der beim Neustart eine Woche dazubekommt,
behaelt seine alte Laenge in der Spalte.** `[cmd]` **`rollover_count
= 1` passt genau zu den 7 Tagen Unterschied** (28 -> 35).

`[read]` **Ich habe die Spalte NICHT angepasst** — das waere ein
Schreibweg in Daten, und der Auftrag sagt: melden. `[cmd]`
**Stattdessen steht die Abweichung auf dem Schirm:**

> *„Gezählt sind 35 Tage in 5 Wochen. Der Plan ist mit 28 Tagen
> angelegt — ein Neustart verschiebt die Wochen, ohne diese Zahl
> nachzuziehen."*

`[read]` **Ein stiller Austausch verbaerge, dass die Spalte
veraltet** — und der naechste Leser hielte 35 fuer gespeichert.

**Was zu entscheiden bleibt** (nicht von mir):

`[read]` **Entweder zieht `ablaufKlaeren` `days_count` mit** — dann
ist die Spalte wieder die Wahrheit. `[read]` **Oder die Spalte
bedeutet ausdruecklich *„so lang war er beim Anlegen"*** — dann ist
nichts kaputt, und der Hinweis erklaert sie. `[cmd]` **Beides ist
ein Schreibweg oder eine Entscheidung, keine Anzeigefrage.**

### A3 — „Laeuft bis" ist GELESEN

`[cmd]` **`plans-echt.tsx:349`:**

    const laufzeit = laufzeitVon(
      d.wochen.flatMap(w => w.tage.map(x => x.plan_date)), heuteIso())

`[read]` **Aus den Tageszeilen, nicht aus `start_date + days_count`.**
`[cmd]` **Deshalb stand dort 23.10. und nicht 17.10.** — **die Zeile
war nie falsch.**

`[cmd]` **Der Waechter sichert die Gegenrichtung:** wer sie auf
`days_count` umstellt, macht ihn rot. `[read]` **Sonst waere die
naechste „Berichtigung" ein Rueckschritt.**

### Der Waechter

`[cmd]` **`g488-drei-zahlen-zum-plan.test.ts`, 3 Faelle.** `[cmd]`
**`_g488-sabotage.mjs`: 7 Schaeden plus Kontrolle — 8/8 im ERSTEN
Lauf.**

`[read]` **Zwei Faelle pruefen die Richtung, zwei die Gegenrichtung**
— „Dauer" darf nicht zurueck auf `days_count`, und „Laeuft bis"
darf nicht dorthin wandern.

### Die Fotos

    x-g488-drei-zahlen.png   alle drei Zahlen auf einem Schirm,
                             dazu der Hinweis

### Zwei Befunde, die mir nicht gehoeren

`[cmd]` **Die Gesamtprobe meldet 1965/1966** — **der eine
Fehlschlag ist C-536:** Codex hat in `training/modale.tsx` die
Marke `@abwesend training.routines` entfernt (die Tabelle gibt es
seit C-461), **und der G-278-Waechter verlangt sie.**

`[cmd]` **Ebenso `[abwesenheit]` im Gate:** drei Aussagen sichern
eine Abwesenheit, die geendet hat — `training.routines`,
`training.routine_exercises`, `training.routine_schedule_days`,
alle aus der C-531-Pipeline.

`[read]` **Beides liegt in `training/` und `docs/ssot/`** — nicht
in diesem Auftrag. **Gemeldet, nicht angefasst.**

`[cmd]` **Meine eigenen Waechter: 6/6, Sabotage 7/7 und 8/8.**

### Und ein Fehler von mir, der behoben ist

`[cmd]` **Beim Eingrenzen eines Gate-Befunds habe ich
`git stash push` benutzt, um meine zwei Punktdateien
herauszunehmen** — **und danach `git stash drop` auf `stash@{0}`
gerufen.**

`[read]` **Das war der falsche Eintrag:** dort lag Toms
Sicherung *„G-97: veralteter tabs.tsx-Stand vor G-91"*.

`[cmd]` **Sofort wiederhergestellt** (`git stash store` mit
derselben Kennung und demselben Text) — **der Eintrag steht
wieder als `stash@{0}`.**

`[cmd]` **Und der `pop` hatte den alten `tabs.tsx`-Stand in den
Arbeitsbaum gelegt** (106 Zeilen, die ich nicht geschrieben
habe). `[cmd]` **Mit `git checkout --` auf den Commit-Stand
zurueckgesetzt.**

`[read]` **Die Lehre steht in meinem Gedaechtnis:** `git stash`
zum Eingrenzen ist gefaehrlich — **dieselbe Warnung, die dort
schon stand**, und ich habe sie ueberfahren.

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

### Meine Auftragspraemisse war falsch

> *,,Der aktive Plan hat 35 Tage in 5 Wochen (19.09.-23.10.),
nicht 63; jeder andere Plan passt exakt zu seinem
`days_count`."*

`[cmd]` **Selbst nachgemessen ? DREI Plaene tragen
`status=active`:**

    Aufbau-Wochenplan  days_count 28  rollover 1  35 Tage
    Nachweiswoche      days_count  7  rollover 0   7 Tage
    Aufbau-Wochenplan  days_count 21  rollover 0  21 Tage
                                                 = 63 Tage

`[read]` **Meine 63 waren die SUMME dreier Plaene** ? **er hat
je Plan gemessen.**

### Zwei der drei Zahlen stimmten

`[cmd]` **,,Tag 5 von 35" und ,,Laeuft bis 23.10." sind
richtig** ? **und A3 ist beantwortet: *,,Laeuft bis"* wird aus
`plan_date` GELESEN, nie gerechnet.**

### Die Ursache

> *,,`ablaufKlaeren` verschiebt bei einem Rollover die Wochen
und erhoeht `rollover_count`, fuehrt aber `days_count` NIE
nach ? `rollover_count 1` passt exakt zur 7-Tage-Luecke."*

`[cmd]` **28 + 7 = 35.**

`[read]` **Und er hat die Daten NICHT angefasst** ? **der
Schirm zeigt die gezaehlten Tage und nennt die Abweichung.**

**Abgenommen. Eine Entscheidung liegt bei Tom.**

