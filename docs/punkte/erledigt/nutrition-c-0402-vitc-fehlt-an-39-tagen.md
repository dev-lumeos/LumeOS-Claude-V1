---
nr: C-402
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-398
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 72b77a4c
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-09-02
  vollstaendig: 44
  vitc: 39
  fibt: 22
  fe: 1
  ohne_daten: 15
---

# C-402 — `VITC` fehlt an 39 Tagen

## Befund

Aus C-398, Codex, 2026-09-02, nach E-61.

`[cmd]` **`VITA` blockiert keinen der 120 Tage mehr.**

`[cmd]` **Aber nur 44 von 120 Scores sind vollstaendig:**

    61 unvollstaendig   VITC (39), FIBT (22), FE (1)
    15 ohne Daten
    44 vollstaendig

`[read]` **Der ganze 02.09. ging um `CAROTPAXB`** — **und `VITC`
fehlt an fast dreimal so vielen Tagen.**

Tom, 2026-09-02: *,,wir kuemmern uns um sachen die sehr
wahrscheinlich ueber den schnitt keinen einfluss haben."*

## Zu messen

`[read]` **Warum fehlt `VITC` an 39 Tagen?** `[cmd]` **Fehlt der Wert
im BLS, oder tragen einzelne Posten ihn nicht?**

`[read]` **Und `FIBT` an 22** — **Ballaststoffe sind ein
Standardnaehrwert, das ist ueberraschend.**

`[read]` **Die 15 Tage ohne Daten sind kein Befund** — **an ihnen
wurde nichts erfasst.**

## Und die Frage dahinter

`[read]` **E-61 hat gezeigt, dass eine Luecke die Summe nicht
verhindern muss.**

`[read]` **Gilt dasselbe fuer `VITC` und `FIBT`?** `[cmd]` **Oder
sind es echte Datenluecken, die C-378 unterliegen** — *,,wenn die
daten nicht da sind erfinden wir sie nicht"*?

`[read]` **Der Unterschied entscheidet, ob es ein Rechenfehler ist
oder ein Datenproblem.**

## Auftrag — warum `VITC` an 39 Tagen fehlt

**Mitbeauftragt: C-403.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-402 — die Zahl nach E-61

`[cmd]` **Du hast gemessen:**

    44 vollstaendig
    61 unvollstaendig   VITC (39), FIBT (22), FE (1)
    15 ohne Daten

`[read]` **`VITA` blockiert keinen Tag mehr** — **aber `VITC` fehlt
an 39.**

Tom, 2026-09-02: *,,wir kuemmern uns um sachen die sehr
wahrscheinlich ueber den schnitt keinen einfluss haben."*

### Was zu messen ist

`[read]` **Fehlt `VITC` im BLS, oder tragen einzelne Posten es
nicht?**

`[read]` **Und `FIBT` an 22 Tagen** — **Ballaststoffe sind ein
Standardnaehrwert, das ist ueberraschend.**

`[read]` **Die Frage dahinter ist dieselbe wie bei E-61:**
**verhindert eine Luecke die Summe, wo sie nur nichts beitragen
sollte?**

`[cmd]` **E-61 hat gezeigt, dass die IE-Funktion bei jeder
Komponentenluecke ausstieg.** `[read]` **Miss, ob `VITC` und `FIBT`
denselben Fehler haben** — **oder ob es echte Datenluecken sind, die
C-378 unterliegen.**

`[read]` **Der Unterschied entscheidet, ob es ein Rechenfehler ist
oder ein Datenproblem.**

### 2 · C-403 — die fehlenden Wochen

`[cmd]` **Du hast gemessen: `Cut` (28 Tage) und `Lean bulk` (84) sind
beide `lifecycle_type = 'once'`, mit je einer Woche.**

`[read]` **Bei `once` laeuft der Plan einmal ab** — **also braucht er
alle Tage, die er behauptet.**

`[cmd]` **Dem Seed fehlen 3 beziehungsweise 11 Wochen.**

`[read]` **Bau sie** — **und trag sie in die C-380-Seedwege ein**,
damit sie den naechsten Kettenlauf ueberleben.

`[cmd]` **`meal_plan_slots` bekommen sie schon mit** (C-397) —
**die Wochen fehlen daneben.**

### Was nicht zu tun ist

**`days_count` nicht aendern** — E-62.
**Keine weiteren Zeilen loeschen** — die Freigabe galt fuer eine.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    VITC       woran es liegt: Rechenweg oder Datenluecke
    FIBT       dasselbe, mit Zahl
    Score      wie viele der 120 nach der Klaerung vollstaendig
    Cut/Lean   4 bzw. 12 Wochen, Eintraege gezaehlt
    Seed       traegt sie kuenftig mit

## Bericht

`[cmd]` **C-402, Dev-Datenbank, Konto `dev@lumeos.app`, Fenster
06.05.–02.09.2026:** Die 39 VITC-Lücken stammen ausschließlich von
`V122100`, *Ziegenfleisch (roh)*. `food_nutrients` trägt dafür
`bls_value_status = 'missing'` und keinen Wert; an allen 39 Tagen ist die
Tages-VITC-Summe aus den übrigen Posten trotzdem vorhanden. Es ist damit
keine Wiederholung des E-61-Rechenfehlers, sondern eine echte BLS-Lücke.
C-378 gilt: Die Lücke wird nicht zur Null erfunden und der NRF9.3-Score
bleibt an diesen Tagen unvollständig.

`[cmd]` Die 22 FIBT-Tage waren dagegen ein C-343-Backfill-Fehler:
`T410100`, *Lachs (roh)*, trägt im BLS `FIBT = 0` mit Status `censored`.
Der JSON-Snapshot hatte diese E-38-Lower-Bound-Null bereits erhalten, die
eingefrorene Flachspalte `meal_items.fibt` aber nicht. Da `daily_summary`
aus der Flachspalte liest, waren 22 vorhandene Tagessummen fälschlich als
unvollständig markiert. `343_bls_value_status.ts` ergänzt nun für
zensiertes FIBT ausschließlich fehlende Flachwerte mit 0; der Lauf hat
37 historische Positionen ergänzt, der Wiederholungslauf 0. Echte
`missing`- und `trace`-Werte bleiben unverändert.

`[cmd]` Danach ist FIBT an allen 106 protokollierten Tagen vollständig.
Im 120-Tage-Fenster stehen **65 complete**, **40 incomplete** und
**15 no_data**-Scores. Restblocker sind nur `VITC` an 39 und `FE` an einem
Tag; FIBT blockiert keinen Tag mehr.

`[cmd]` **C-403:** `Cut 4-Meal 2200` hat jetzt bei unverändertem
`days_count = 28` vier Wochen, 28 Tage und 112 Einträge. `Lean bulk 3100`
hat bei unverändertem `days_count = 84` zwölf Wochen, 84 Tage und 336
Einträge. `Buddy auto-plan` bleibt bei einer Woche, sieben Tagen und 28
Einträgen. Der C-380-Seed erzeugt die Wochen und Tage aus der ersten Woche
idempotent und ergänzt nur fehlende Einträge; er löscht keine Einträge
mehr. Beim zweiten Lauf wurden 0 Wochen, 0 Tage und 0 Einträge angelegt.

`[cmd]` Grün: C-343/C-402, C-380, C-397 und C-324 (9 Tests). Der
zielgerichtete ESLint-Lauf ist ohne Fehler durchgelaufen. Keine Datei unter
`apps/` wurde verändert; nichts gestaged, committed oder gepusht.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### Die Frage war richtig gestellt, und beide Antworten kamen

`[read]` **Der Auftrag fragte: Rechenfehler oder Datenluecke?**
**Es ist beides — je Naehrstoff eine andere Antwort.**

`[cmd]` **`VITC`: echte BLS-Luecke bei Ziegenfleisch, `missing`.**
`[read]` **Bleibt unvollstaendig nach C-378** — *,,wenn die daten
nicht da sind erfinden wir sie nicht."*

`[cmd]` **`FIBT`: Backfill-Fehler bei zensiertem rohem Lachs.**
`[cmd]` **37 eingefrorene Flachwerte erhielten die E-38-Null.**

`[read]` **Dieselbe Klasse wie bei Vitamin A:** **eine Zensur wurde
als Unbekanntes behandelt, statt als Null.**

### Der Score, selbst gemessen

    vorher    44 complete, 61 incomplete, 15 no_data
    nachher   65 complete, 40 incomplete, 15 no_data

`[cmd]` **65 von 120** — **exakt seine Zahl.**

`[read]` **Heute morgen waren es 0.** `[read]` **E-61 brachte 44,
der Lachs-Backfill weitere 21.**

### C-403 — die Wochen stehen

    Cut 4-Meal 2200    4 Wochen, 28 Tage, 112 Eintraege
    Lean bulk 3100    12 Wochen, 84 Tage, 336 Eintraege

`[cmd]` **Nachgemessen, beide exakt.**

`[cmd]` **Und der C-380-Seed ist idempotent** — **er loescht keine
Eintraege.**

`[read]` **Damit ueberlebt es den naechsten Kettenlauf**, ohne beim
zweiten Lauf zu verdoppeln.

### Was offen bleibt

`[cmd]` **`Aufbau-Wochenplan` traegt 4 Wochen und 28 Tage bei
`days_count 21`** — **28 beschrieben, 21 behauptet.**

`[read]` **Er hat es nicht angefasst** — **richtig, es stand nicht im
Auftrag.** **Als C-404.**

`[cmd]` **Und der Standalone-`tsc`-Check bleibt blockiert:**
fehlendes `@types/node` im Root-Setup. `[read]` **Ausserhalb dieser
Aenderung.**

**Abgenommen.**

