---
nr: C-401
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-400
entscheidung: E-62
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 0d63a69f
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-02
---

# C-401 — der Probe-Eintrag und die Laufzeit

## Befund

Aus C-400, Codex, 2026-09-02.

`[cmd]` **`Buddy auto-plan`: eine Woche, 29 statt 28 Eintraege** —
**der Probe-Eintrag vom 02.09.**

`[cmd]` **Er stammt vom Orchestrator.** `[cmd]` **Codex hat ihn
stehen lassen, weil keine Loeschfreigabe vorlag.**

**Tom hat sie am 02.09. erteilt** (E-62).

## Und die Laufzeit

    Aufbau-Wochenplan   days_count 21, 3 Wochen   -- stimmt
    Cut 4-Meal 2200     days_count 28, 1 Woche
    Lean bulk 3100      days_count 84, 1 Woche
    Buddy auto-plan     days_count  7, 1 Woche    -- stimmt

`[cmd]` **E-62: `days_count` ist die Laufzeit, nicht die Zahl der
beschriebenen Tage.**

`[cmd]` **Und E-44 hat den Fall:** **`rollover` — eine Woche,
mehrfach durchlaufen.**

`[read]` **Zu messen: tragen Cut und Lean `lifecycle_type =
'rollover'`?**

`[read]` **Wenn ja, ist nichts falsch** — **die Anzeige muss nur
sagen, dass eine Woche wiederholt wird.** `[read]` **Wenn nein,
fehlen die Wochen im Seed.**

## Auftrag

**Mitbeauftragt: C-187.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · Der Probe-Eintrag — Freigabe liegt vor

`[cmd]` **Tom, 2026-09-02: Loeschfreigabe erteilt** (E-62).

`[cmd]` **`Buddy auto-plan`, 29 statt 28 Eintraege, der einzelne am
02.09.**

`[read]` **Damit wird der C-380-Test gruen.**

### 2 · Die Laufzeit

`[cmd]` **E-62: `days_count` ist die Laufzeit.**

    Cut 4-Meal 2200   28, 1 Woche
    Lean bulk 3100    84, 1 Woche

`[read]` **Miss, ob sie `lifecycle_type = 'rollover'` tragen.**

`[read]` **Wenn ja: nichts falsch, aber die Anzeige muss sagen, dass
eine Woche wiederholt wird.** `[read]` **Wenn nein: fehlen die Wochen
im Seed** — **und dann sag, ob der Seed sie anlegen soll oder
`days_count` zu berichtigen ist.**

### 3 · C-187 — der liegengebliebene Kettenschritt

`[cmd]` **Fuer CHOL existiert die C-346-Korrektur, nicht live
eingespielt.**

`[read]` **Spiel sie ein** — **das ist kein offener Befund, sondern
ein Schritt, der nie gelaufen ist.**

`[read]` **EAA und Medication-Monitoring bleiben liegen** — sie
brauchen Entscheidungen, keine Arbeit.

### Was nicht zu tun ist

**Keine weiteren Zeilen loeschen** — die Freigabe gilt fuer den einen
Eintrag.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Buddy        28 Eintraege, C-380-Test gruen
    lifecycle    Cut und Lean, gemessen
    Laufzeit     stimmig oder berichtigt, begruendet
    CHOL         C-346 eingespielt, Livebestand gezaehlt

## Bericht

`[cmd]` **Dev-Datenbank, Konto `dev@lumeos.app`, gemessen am 2026-09-02:**
**die eine freigegebene Probezeile** `232c1079-28a3-4d7f-a525-924ba8e06d93`
aus `Buddy auto-plan` wurde gelöscht. Sie war die alleinige zusätzliche
`lunch`-Zeile ohne `planned_time` und ohne Notiz. Keine andere Zeile wurde
gelöscht.

`[cmd]` Danach hat
`supabase/_pipeline/_validierung/nutrition-c380-seed-plan-variety.test.ts`
bestanden: alle drei Seed-Pläne haben jeweils **28 Einträge**, sieben Tage,
vier Mahlzeiten je Tag, keinen Hammelfilet-Eintrag und sieben unterschiedliche
Tagesmenüs.

`[cmd]` **Cut 4-Meal 2200** trägt `days_count = 28`,
`lifecycle_type = 'once'`, eine Woche, sieben Tage und 28 Einträge.
**Lean bulk 3100** trägt `days_count = 84`, `lifecycle_type = 'once'`,
ebenfalls eine Woche, sieben Tage und 28 Einträge. Beide sind damit nicht
`rollover`-Pläne. Nach E-62 bleiben die `days_count`-Werte Laufzeiten;
sie dürfen nicht auf sieben berichtigt werden. Der Seed muss deshalb für
`once` die fehlenden drei beziehungsweise elf Wochen anlegen (28 bzw. 84
Plantage), oder eine spätere Entscheidung muss ihren Lifecycle ausdrücklich
auf `rollover` ändern. Die jetzige Kombination aus `once` und einer Woche
ist nicht vollständig.

`[cmd]` Der bestehende Kettenschritt
`supabase/_pipeline/015_kataloge/015a_nutrient_tree_details.ts` wurde auf
der Dev-Datenbank ausgeführt. Der Livebestand enthält nun 110 Detailzeilen;
`CHORL` hat `source_key = 'CHOL'` und `function_de = 'Hormone,
Zellmembranen'`. Der mitverarbeitete zweite C-346-Fall ist ebenfalls korrekt:
`FD` hat `source_key = 'F'` und `function_de = 'Zahnschutz'`.
`supabase/_pipeline/_validierung/nutrient-details-legacy-map.test.ts` ist
danach grün. EAA und Medication-Monitoring wurden nicht verändert.

Keine Datei unter `apps/` wurde verändert. Nicht gestaged, nicht committed,
nicht gepusht.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### Der Probe-Eintrag ist weg

`[cmd]` **`Buddy auto-plan`: 1 Woche, 7 Tage, 28 Eintraege.**
`[cmd]` **C-380 ist gruen.**

`[read]` **Meine erste Zaehlung ergab 56** — **sie zaehlte ueber alle
Nutzer, nicht nur `dev`.** `[read]` **Derselbe Fehler wie dreimal
zuvor: `count(*)` ohne `user_id`.**

### Und die Laufzeit ist geklaert

`[cmd]` **`Cut` und `Lean bulk` sind beide `lifecycle_type =
'once'`** — **nicht `rollover`.**

`[read]` **Damit ist die Frage aus E-62 beantwortet:** **bei `once`
laeuft der Plan einmal ab, also braucht er alle Tage, die er
behauptet.**

    Cut 4-Meal 2200    28 Tage behauptet, 7 beschrieben
    Lean bulk 3100     84 Tage behauptet, 7 beschrieben

`[cmd]` **Es fehlen 3 beziehungsweise 11 Wochen** — **als C-403.**

`[read]` **`days_count` bleibt unveraendert** — **es ist die
Laufzeit, und die stimmt.**

### Ein Fund, den er nicht nennt

`[cmd]` **Nachgemessen: `Aufbau-Wochenplan` traegt 4 Wochen, 28 Tage,
84 Eintraege** — **bei `days_count 21`.**

`[read]` **28 Tage beschrieben, 21 behauptet.** `[read]` **Das ist
der umgekehrte Fall zu Cut und Lean: zu viele Tage, nicht zu
wenige.**

`[cmd]` **Und `test` traegt 4 Wochen, 28 Tage, 0 Eintraege** — **die
Werkbank, richtig leer.**

**Als C-403 mitgemessen.**

### C-346 ist eingespielt

`[cmd]` **`CHORL` auf `CHOL` mit *Hormone, Zellmembranen*.**
`[cmd]` **`FD` auf `F` ist korrekt.** `[cmd]` **Der Legacy-Map-Test
ist gruen.**

`[read]` **Ein Kettenschritt, der nie lief** — **jetzt gelaufen.**

**Abgenommen.**

