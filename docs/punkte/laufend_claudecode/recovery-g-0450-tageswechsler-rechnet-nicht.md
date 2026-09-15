---
nr: G-450
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-493
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-450 — der Tageswechsler aendert das Datum, nicht die Rechnung

## Befund

Aus C-493, Codex, 2026-09-08:

> *,,Der Tageswechsler aendert das Datum, aber nicht die
Kartenberechnung; die Bizepsfarbe bleibt gleich. Das ist ein
Lesepfadproblem in `apps/`."*

`[cmd]` **Sieben Bildschirmfotos liegen vor:** `x-c493-tag-1`,
`-3`, `-7`, `-13`, `x-c493-dev-tag-8`, `-12`, `-13`.

`[read]` **Die Kopfzeile aendert sich, die Muskelwerte nicht.**

## Warum das zaehlt

Tom, 2026-09-08: *,,wir koennen ja dayswitcher oben nutzen und
schauen, was sich aendert."*

`[read]` **Das war die PRUEFUNG** ? **ob die Erholung ueber die
Zeit stimmt.**

`[read]` **Solange der Wechsler nicht rechnet, ist sie nicht
pruefbar.**

## Was zu messen ist

`[cmd]` **`base(hours)` = Stunden seit der letzten Belastung** ?
**gegen WELCHEN Zeitpunkt?**

`[read]` **Heute vermutlich gegen `Date.now()`** ? **statt gegen
den gewaehlten Tag.**

`[cmd]` **Miss, wo der gewaehlte Tag steht und wo er in die
Rechnung muesste.**

## Die Gegenprobe ist eingebaut

`[read]` **Ein Muskel, der an Tag 1 rot ist, muss an Tag 7
gelb und an Tag 13 gruen sein** ? **oder er hat zwischendurch
einen neuen Reiz bekommen.**

`[cmd]` **C-493 hat Sitzungen mit Abstaenden von 1, 2, 3 und
7 Tagen gebaut** ? **die Daten liegen vor.**

## Bericht

**Claude Code, 2026-09-15.**

### Der Stand in einem Satz

`[read]` **Alle acht Abnahmebedingungen erfuellt** ? **der Fehler war
ein nicht uebergebenes Argument, und ein Vorgabewert hat ihn
zugedeckt.**

### A1 ? wo gegen `Date.now()` gerechnet wurde

`[cmd]` **Gemessen 2026-09-15, die ganze Kette:**

    recovery/page.tsx:60   stichtag  aus ?datum=
    recovery/page.tsx:68   ladeCheckins(30, stichtag)       nutzt ihn
    recovery/page.tsx:69   ladeScores(180, stichtag)        nutzt ihn
    recovery/page.tsx:70   ladeModalitaeten(120, stichtag)  nutzt ihn
    recovery/page.tsx:77   ladeMuskelzustand(105)           NICHT

    muskelzustand-read.ts:93
      export async function ladeMuskelzustand(
        muskelnGesamt: number, jetzt: Date = new Date(),
      )

`[read]` **Der Stichtag stand sieben Zeilen darueber und wurde von
drei der sechs Lesewege benutzt** ? **deshalb wechselte die Kopfzeile,
waehrend die Muskelwerte standen.**

`[cmd]` **Die Rechnung selbst war NIE falsch.** `muskelzustaende(...,
jetzt)` nimmt den Zeitpunkt seit G-440 als Parameter, und der
Dateikopf sagt warum: *,,`jetzt` wird hereingereicht, nicht aus
`Date.now()` genommen ? sonst waere die Funktion nicht pruefbar."*

`[read]` **Der Fehler war das fehlende zweite Argument** ? **kein
Typfehler, keine Meldung, nur eine Zahl, die sich nie ruehrte.** **Ein
Vorgabewert hat ihn unsichtbar gemacht.**

`[cmd]` **Kein `Date.now()` in `apps/web/src/app/v2/recovery/` und
`lib/recovery/`** ? die beiden Treffer dort sind `updated_at` in
`checkin-write.ts`, also Schreibzeitstempel. **Der wirksame
`new Date()` stand als VORGABEWERT in `lib/training/`**, nicht im
Recovery-Modul ? **deshalb findet ihn ein `grep` im Modul nicht.**

### A2 ? der gewaehlte Tag geht in die Rechnung

    - ladeMuskelzustand(105)
    + ladeMuskelzustand(105, bezugszeitpunkt(stichtag))

`[read]` **`bezugszeitpunkt` steht in `muskelzustand.ts`**, der
serverfreien Datei ? **nicht in `-read.ts`.** `[cmd]` **Die Ansicht
darunter ist `'use client'`, und ein Wert-Import aus dem Leseweg zoege
`next/headers` ins Browserbuendel** (A-30, in G-453 zweimal
passiert).

**WELCHE UHRZEIT EIN DATUM MEINT** ? `[read]` **der Tagesbeginn,
nicht die Mitte.** `[cmd]` **`session_date` traegt ebenfalls keine
Uhrzeit** und wird in `muskelzustaende` auf `T00:00:00Z` gesetzt ?
**dieselbe Bezugsgroesse auf beiden Seiten.** **Ein Mittagswert
ergaebe fuer *,,heute trainiert, heute angesehen"* 12 Stunden statt 0,
und `base(12)` ist 30 statt 10.** `[cmd]` **Eine Sabotageprobe haelt
das fest.**

### A3 ? drei Fotos, dieselbe Karte, verschiedene Farben

`[cmd]` **`Trapezius`, letzte Sitzung 2026-09-04, 3 Saetze, danach
kein Reiz mehr** (gemessen im C-493-Seed):

    Tag          Stunden   Erholung   Ermuedung   Stufe
    2026-09-04       0 h       10 %       90 %    Rest
    2026-09-05      24 h       48 %       52 %    Caution
    2026-09-11     168 h       97 %        3 %    Ready

    backup/x-g450-tag-2026-09-04.png
    backup/x-g450-tag-2026-09-05.png
    backup/x-g450-tag-2026-09-11.png

`[read]` **Am Bild sieht man es ohne Zahlen:** am 04. ist der Koerper
fast durchgehend rot, am 11. sind Schultern, Arme und Nacken gruen,
die Waden gelb. **Die Kopfzeile sagt *,,Fr., 4. Sept."* bzw. *,,Fr.,
11. Sept."*, und das Etikett sagt *,,gerechnet gegen den
2026-09-04"* bzw. *,,...-09-11"*.

`[cmd]` **Die Karte zeigt ERMUEDUNG, nicht Erholung** ? `Ready
(<=25%)`, `Caution (26-60%)`, `Rest (>60%)`
(`packages/ui/koerperkarte.tsx:581`). **Beim Lesen der Zahlen ist das
der Unterschied zwischen ,,rot" und ,,gut".**

### A4 ? ein Muskel wandert, gerechnet

`[read]` **Die Wanderung oben ist die Antwort** ? **Rest ->
Caution -> Ready in einem Muskel**, und sie ist nachgerechnet:

    base(0)   = 10   * volumeMod(3)=1.10  ->  11 %  (angezeigt 10 %)
    base(24)  = 50   * 1.10               ->  55 %  (angezeigt 48 %)
    base(168) = 100  * 1.10  -> gedeckelt -> 100 %  (angezeigt 97 %)

`[cmd]` **Die Abweichung ist erklaert, nicht weggelassen:** die
uebrigen Modifikatoren (`sleepMod`, `nutritionMod`, `sorenessMod`)
lesen den Check-in des jeweiligen Tages und liegen bei rund 0,88.
**Die Stundenachse ist der bewegliche Teil, und genau der stand
still.**

**ZWEI MUSKELN, DIE NICHT DEN GANZEN WEG GEHEN ? und warum:**

`[cmd]` **`Biceps` (Codex' Beispiel) kommt nie ueber Caution
hinaus** ? **20 Saetze ergeben `volumeMod = 0.70`**, und der
gedeckelte Wert bleibt bei 70 % Erholung = 30 % Ermuedung.
**`Upper Back` startet bei Caution**, weil 3 Saetze mit `1.10`
multipliziert schon am ersten Tag 55 % erreichen.

`[read]` **Das ist kein Fehler, sondern die Formel** ? wer viel
Volumen faehrt, erholt sich langsamer. **Ein Muskel, der ALLE DREI
Stufen durchlaeuft, braucht wenig Volumen und keinen zweiten Reiz;
`Trapezius` erfuellt beides.**

### A5 ? die Gegenprobe

`[cmd]` **`Date.now()` zurueckgebaut** (`ladeMuskelzustand(105)`),
dieselben drei Tage gemessen:

    Tag           Stunden   Erholung
    2026-09-03      55 h      49 %
    2026-09-09      55 h      56 %
    2026-09-15      55 h      42 %

`[read]` **55 Stunden an allen drei Tagen** ? **die Stundenachse
friert ein.** `[cmd]` **Die Prozentwerte schwanken trotzdem**, weil
Schlaf, Ernaehrung und Muskelkater aus dem Check-in des gewaehlten
Tages kommen. **Genau das machte den Fehler so schwer zu sehen: die
Karte wirkte lebendig, waehrend ihr beweglichster Teil stand.**

`[cmd]` **Danach wiederhergestellt und nachgemessen:** 0 h / 48 h an
denselben Tagen.

### A6 ? ein Tag in der Zukunft

`[cmd]` **Gemessen am 2026-12-01** (Foto
`backup/x-g450-tag-2026-12-01.png`):

    Marke        angenommener Tag
    Satz         „Der 2026-12-01 liegt in der Zukunft. Die Werte
                  zeigen, wie die Erholung an diesem Tag stuende,
                  wenn bis dahin nichts mehr trainiert wird —
                  gemessen ist daran nichts."
    Bezugstag    gerechnet gegen den 2026-12-01
    Biceps       71 % / 1.896 h

`[read]` **Die Zahlen werden NICHT unterdrueckt** ? sie sind die
richtige Antwort der Formel auf *,,angenommen, es waere so weit"*.
**Aber eine Erholungsfarbe fuer ein Training, das noch nicht
stattgefunden hat, darf nicht aussehen wie eine Messung.**

`[cmd]` **Verglichen wird auf TAGESEBENE:** *heute* ist nie Zukunft,
auch wenn der Bezugszeitpunkt auf den Tagesbeginn gesetzt wurde und
`jetzt` mittags ist. **Eine Sabotageprobe (`>` zu `>=`) haelt das
fest.**

`[cmd]` **Nebenbefund:** `dev@lumeos.app` traegt Sitzungen bis
**2026-11-11** ? **Sitzungen in der Zukunft, alle mit 0 Saetzen.**
`[read]` **Nicht von G-450 angefasst**, aber gemeldet: wer den
Wechsler ueber den 30.09. schiebt, sieht Sitzungsnamen ohne Saetze.

### A7 ? die vier Module unveraendert

`[cmd]` **VORHER und NACHHER gemessen** (`git checkout HEAD --` auf
die vier Dateien, dann zurueckgespielt):

    /v2/nutrition     194.292 Zeichen   identisch
    /v2/training      104.993 Zeichen   identisch
    /v2/medical       509.701 Zeichen   identisch
    /v2/goals          49.925 Zeichen   identisch
    /v2/supplements   468.611 Zeichen   identisch

`[cmd]` **Gegenueber dem G-453-Stand weichen nutrition (194.952 ->
194.292) und goals (49.769 -> 49.925) ab** ? **das ist NICHT von
G-450.** **Gemessen, woher es kommt:** Codex hat um 14:09 Uhr
`075_preference_search_application.sql` geaendert ?
`COALESCE(fp.allergies, ...)` wurde zu
`public.user_allergy_codes(fp.user_id)`. **Das aendert die
Trefferliste der Lebensmittelsuche, und damit die Zeichenzahl.**

`[read]` **Die Vorher/Nachher-Messung trennt beides sauber** ? **die
Zahlen sind mit und ohne meine Aenderung gleich.**

### A8 ? die Zahlen

    apps/web     1766 (Grundstand 1759, +7)
    apps/coach     65 (unveraendert)
    tsc --noEmit   ohne Meldung

### Sabotage ? sieben Proben, und eine hat den Waechter berichtigt

    C-493-Fehler zurueck: ladeMuskelzustand(105)     ROT
    ein anderer Leseweg verliert den Stichtag        ROT
    Bezugszeitpunkt auf Tagesmitte                   ROT
    bezugszeitpunkt gibt immer jetzt zurueck         ROT
    heute gilt als Zukunft                           ROT
    kuenftiger Tag sieht aus wie gemessen            ROT
    Bezugstag fehlt im Etikett                     GRUEN  <-
    ----------------------------------------------------------
    nach dem Nachziehen, dieselbe Sabotage           ROT

`[cmd]` **Die siebte blieb gruen** ? der Waechter suchte die
Zeichenkette `'gerechnet gegen den'`, **und die steht in
`if (false) teile.push(...)` weiterhin da.**

`[read]` **Derselbe blinde Fleck wie in G-453, eine Woche spaeter.**
**Ein Waechter, der die Zeilenform sucht, misst die Zeilenform** ?
jetzt wird die ganze Bedingung geprueft.

### Was gebaut wurde

    GEAENDERT
      apps/web/src/app/v2/recovery/page.tsx
        das zweite Argument + stichtag/zukunft an die Ansicht
      apps/web/src/app/v2/recovery/ansicht.tsx
        zwei Props durchgereicht
      apps/web/src/app/v2/recovery/tab-messwerte.tsx
        Bezugstag und Zukunftsmarke im Etikett
      apps/web/src/lib/training/muskelzustand.ts
        bezugszeitpunkt() und istZukunft(), serverfrei

    NEU
      .../recovery/__tests__/g450-tageswechsler.test.ts   7 Proben
      tools/_g450-tage.mjs   die Messung je Tag, wiederholbar
      tools/_g450-a7.mjs     die vier Module

`[cmd]` **Nichts in `supabase/`. Nichts committet, nichts gestaged.**
`[cmd]` **Der Dev-Server wurde nicht angefasst.**

### Ein Fehler beim Aufraeumen

`[cmd]` **Ein versehentlich wiederholter Skriptaufruf hat 102 Zeilen
in `supplements/produkt-etikett.ts` dupliziert** ? `KATEGORIEN` stand
danach dreimal in der Datei.

`[read]` **Aus `git` zurueckgeholt** (G-453 war committet), danach
`tsc` und die volle Reihe nachgemessen: **1766 / 0.** **Die Datei
gehoert nicht zu G-450 und ist jetzt wieder unveraendert.**

### Was offen bleibt

**1** ? `[cmd]` **Der Daumen wartet auf C-497**, wie beauftragt.
**Die FK-Messung aus G-453 gilt unveraendert** und ist dort
festgehalten.

**2** ? `[cmd]` **`dev@lumeos.app` traegt zehn Sitzungen mit
Sitzungsdatum in der Zukunft** (2026-09-18 bis 2026-11-11), **alle
mit 0 Saetzen.** `[read]` **Sie stoeren die Rechnung nicht** ? ohne
Saetze entsteht kein Muskeleintrag. **Aber wer den Wechsler dorthin
schiebt, sieht Namen ohne Inhalt.**

**3** ? `[read]` **Die Erholung rechnet weiter mit Entwurfswerten
fuer Schlaf und Ernaehrung** ? das Etikett sagt es, und es ist nicht
Gegenstand dieses Auftrags.

## Abnahme

_(vom Orchestrator)_
