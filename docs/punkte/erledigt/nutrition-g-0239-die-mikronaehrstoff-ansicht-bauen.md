---
nr: G-239
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-48
entscheidung: null
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
  dateien:
    - docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf/features/nutrition/MicroDashboard.js
    - docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md
zahlen: null
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 3a87eb62
---

# G-239 — die Mikronaehrstoff-Ansicht bauen

## Befund

`[cmd]` **Die Opus-Review fuehrt *,,Micronutrient Review UI"* als
einen von sieben Bereichen mit Status `Ready`** — Components, Hooks
und Flow vollstaendig, **ohne Abhaengigkeit von den offenen
Entscheidungen.**

`[cmd]` **Die Datenseite traegt:** `nutrition.daily_reference_assessment(user_id, date)`
ist eine **Funktion**, keine Tabelle, und liefert je Naehrstoff eine
Zeile mit unter anderem:

    actual_value · reference_value_min · reference_value_max
    reference_kind · reference_direction · reference_pct
    reference_pct_min · reference_pct_max · reference_status
    value_complete · missing_count
    nutrient_display_tier · source · source_locator
    profile_age_years · profile_biological_sex
    profile_is_pregnant · profile_is_lactating

`[read]` **Die vier Regeln aus C-48 sind darin bereits abgebildet** —
sie muessen nicht erfunden, sondern gelesen werden.

`[cmd]` **`nutrient_reference_values` traegt 165 Zeilen zu 138
Codes**, mit Quelle je Zeile: EFSA, National Academies, WHO/FAO/UNU.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

`[read]` **Und lies zuerst die drei Quellen**, wie Tom es am 28.08.
zum Massstab gemacht hat:

    docs/specs/.../SPEC_10_COMPONENTS.md      MicroDashboard,
                                              MicroNutrientCard
    docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf/.../MicroDashboard.js
    referenz/lumeos-2026/                     Struktur, nie Code

`[read]` **Der Mockup ist aus der Spec entstanden, mit Abgleich zum
alten Repo.** **Wenn du einen Unterschied findest, ist die erste
Frage, ob du richtig hingesehen hast** — nicht, ob jemand etwas
erfunden hat. **Das war mein Fehler heute, dreimal.**

### Die vier Regeln aus C-48

**1 · Fehlzaehler bleiben sichtbar.** `[cmd]` `missing_count` und
`value_complete` sagen, ob die Summe vollstaendig ist.
`reference_status` liefert dann `incomplete` **ohne Prozentwert**.
`[read]` **Die Oberflaeche darf daraus keine Null machen.**

**2 · Die Wertart entscheidet die Leserichtung.** `[cmd]`
`reference_kind` und `reference_direction` stehen im Rueckgabewert.
`[read]` **80 Prozent eines `PRI` ist zu wenig, 80 Prozent eines `UL`
ist zu viel. Beides als *,,80 %"* anzuzeigen waere gefaehrlich.**

**3 · `NO_STANDALONE_REFERENCE` und `NO_REFERENCE` sind kein
*,,0 % gedeckt"*.** `[read]` **Sie sind eine eigene Aussage** —
dieselbe Klasse wie *begruendet leer* gegen *nicht bearbeitet* aus
G-208, wo du die Form schon gebaut hast.

**4 · Die Referenzwerte gelten fuer gesunde Erwachsene.** `[cmd]`
Die Funktion liefert `profile_age_years`, `profile_biological_sex`,
`profile_is_pregnant`, `profile_is_lactating` mit. `[read]` **Pruef,
ob und wie das sichtbar wird.**

### Was aus G-218 uebernommen gehoert

`[read]` **Du hast dort gemessen, dass zwei Achsen sichtbar, aber
nicht unterscheidbar waren.** **Dieselbe Frage stellt sich hier:**
`reference_kind` hat zehn Auspraegungen — **welche davon muss ein
Nutzer unterscheiden koennen, und welche sind eine Sache fuer den
Beleg?**

`[cmd]` **`nutrient_display_tier` ist laut G-140 ein Abo-Tier, keine
Baumebene.** `[read]` **Nicht als Gliederung benutzen, ohne das
geklaert zu haben** — G-235 haelt die Frage offen.

### Was nicht zu tun ist

**Keine Referenzwerte aendern, keine Schwellen setzen.**
**Keine Tabelle anlegen** — Codex arbeitet an G-221.
**Keine Bewertung erfinden, wo die Funktion keine liefert.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Zeilen je Zustand            gedeckt / zu wenig / zu viel /
                                 unvollstaendig / ohne Referenz
    Leserichtung                 PRI und UL unterscheidbar -
                                 Bildschirmfoto
    unvollstaendig               kein Prozentwert, kein Null
    ohne Referenz                eigene Aussage, kein 0 %
    Quelle je Naehrstoff         erreichbar
    Attrappen im Modul           vorher / nachher
    Ladezeit                     ms, kalt und warm getrennt
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

`[read]` **Gegenprobe:** einen Naehrstoff finden, der ueber seinem
`UL` liegt, und einen unter seinem `PRI`. `[read]` **Beide muessen
verschieden aussehen — und wenn es auf `dev` keinen ueber `UL` gibt,
sag das, statt einen zu erfinden.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Die Ansicht steht, und alle vier C-48-Regeln sind aus den Daten
gelesen, nicht erfunden.** **Die Gegenprobe geht auf:** drei
Naehrstoffe ueber ihrem `UL`, vier unter ihrem Zielwert.

### Die drei Quellen, gelesen

`[cmd]` **SPEC_10_COMPONENTS.md:154-155** fuehrt `MicroDashboard`
(*„Mikronaehrstoff-Dashboard mit Tier-System (Traffic-Light)"*) und
`MicroNutrientCard` (*„aktuell/RDA, Severity-Farbe, Details"*).

`[cmd]` **`MicroDashboard.js`** (205 Zeilen): fuenf Gruppen, Vitamine
in fett-/wasserloeslich geteilt, aufklappbare Zeile mit Balken,
Zusammenfassung in vier Kacheln, `ND`-Tabelle mit Detailtexten.

`[cmd]` **Das Vorgaengerrepo** bestaetigt die Herkunft: die
`ND`-Tabelle des Mockups ist ein DE-Auszug aus
`referenz/lumeos-2026/.../nutrientDetails.ts` (Felder `detail_de`,
`deficiency_de`, `excess_de`, `interactions_de`, `ul`,
`top_sources_de`, `tip_de`). **Nichts erfunden.**

`[read]` **Uebernommen:** Gruppen, Vitaminteilung, aufklappbare
Zeile, Balken, Verteilungskacheln.

`[read]` **NICHT uebernommen — und das ist der einzige echte
Unterschied zum Mockup:** dessen Farblogik `pct>=80` gruen,
`>=50` gelb, sonst rot laeuft in **eine** Richtung. `[cmd]` **Bei
einer Obergrenze faerbt sie genau falsch: Vitamin A mit 164 % des
`UL` waere dort gruen.** `[read]` **Das ist Regel 2, und die geht
vor.** Der Mockup ist damit nicht falsch — er kannte nur keine
`upper_limit`-Zeilen, weil seine Daten fest verdrahtet waren.

### Die vier Regeln, gegen die Daten geprueft

`[cmd]` **Gemessen 2026-08-28, `dev@lumeos.app`, 2026-06-01** (der
Tag mit den meisten Eintraegen; 181 Tage tragen Daten):

    reference_status   Zeilen   mit reference_pct   missing_count
    complete               57                  46               0
    incomplete             77                   0             407
    not_applicable         15                   0               0
    energy_share            3                   0               0
    nutrient_density        2                   0               0

**Regel 1 — Fehlzaehler bleiben sichtbar.** `[cmd]` **Alle 77
`incomplete`-Zeilen tragen NULL Prozentwerte**, zusammen 407
fehlende Positionen. `[read]` **Die Funktion macht daraus schon keine
Null** — die Oberflaeche uebernimmt das: `zeigtProzent()` gibt bei
`unvollstaendig` immer `false`, die Zeile zeigt einen Strich, und im
aufgeklappten Zustand steht *„… Positionen ohne Wert — die Summe ist
unvollstaendig. Deshalb steht hier kein Prozentwert — er waere zu
niedrig, nicht bloss ungenau."*

**Regel 2 — die Wertart entscheidet die Leserichtung.** `[cmd]` **Der
Beleg steht in einer Zeile auf dem Bildschirm:**

    Vitamin A   4.905 µg   654 % des Zielwerts (750 µg, PRI)
                           164 % der Obergrenze (3.000 µg)   <- rot
    Calcium       683 mg    72 % des Zielwerts (950 mg, PRI)
                            27 % der Obergrenze (2.500 mg)

`[read]` **Derselbe Naehrstoff, derselbe Tag, zwei Prozentwerte mit
entgegengesetzter Lesart.** Bei jeder Zahl steht, worauf sie sich
bezieht.

**Regel 3 — ohne Referenz ist keine Null.** `[cmd]`
`NO_STANDALONE_REFERENCE` 57 Zeilen, `NO_REFERENCE` 21. Sie tragen
einen Strich statt einer Zahl und den Satz *„Fuer diesen Naehrstoff
gibt es keinen eigenstaendigen Richtwert. Das ist keine Aussage ueber
deine Zufuhr."* `[read]` **Dieselbe Form wie `begruendet_leer` gegen
`nicht_bearbeitet` (G-208).**

**Regel 4 — gesunde Erwachsene.** `[cmd]` Auf dem Schirm:
*„Die Richtwerte gelten fuer gesunde Erwachsene und sind auf dein
Profil bezogen: 31 Jahre, maennlich."* Schwangerschaft und Stillzeit
kommen mit, sobald sie gesetzt sind; ohne Profil sagt der Satz das.

### Der strukturelle Befund: ein Naehrstoff, zwei Zeilen

`[cmd]` **12 Naehrstoffe auf dev tragen ZWEI Zeilen** — einen
Zielwert und eine Obergrenze: Calcium, Eisen, Magnesium, Vitamin A,
Vitamin B6, Kupfer, Jod, Mangan, Molybdaen, Phosphor, Fluorid,
Niacin.

`[read]` **Wer je Zeile eine Kachel zeigt, zeigt Calcium zweimal mit
widerspruechlichem Anschein.** Deshalb fasst `faelleZusammen()` je
Naehrstoff zusammen: der Zielwert fuehrt, die Obergrenze steht als
Nebenaussage darunter — **und eine Ueberschreitung schlaegt den
gedeckten Zielwert**, sonst verschwaende Vitamin A hinter seinen
654 %.

`[cmd]` **Die Rechnung geht auf:** 154 Zeilen → **138 Naehrstoffe**,
und die Kachelzahlen 3 + 4 + 28 + 15 + 88 = **138**. **Keine Zeile
verloren, keine doppelt.**

### Welche `reference_kind` muss ein Nutzer unterscheiden?

**Die Frage aus G-218, hier gestellt.** `[cmd]` **Zehn Auspraegungen
auf dev:** `NO_STANDALONE_REFERENCE` 57, `AI` 21, `NO_REFERENCE` 21,
`UL` 17, `PRI` 17, `FORMULA` 15, `PRI_COMBINED` 2, `RI` 2, `ALAP` 1,
`AI_COMBINED` 1.

`[read]` **Sie fallen auf DREI Leserichtungen zusammen** — `target`,
`upper_limit`, `range` —, und die sind das, was zaehlt. **Ob ein
Zielwert `PRI`, `AI` oder `FORMULA` heisst, aendert nichts am
Handeln**, wohl aber an der Nachvollziehbarkeit. **Deshalb faerbt und
ordnet die Richtung, und die Art steht beim Beleg** — genau die
Trennung aus G-218.

`[cmd]` **`nutrient_display_tier` ist NICHT als Gliederung benutzt**
(G-140: Abo-Tier, keine Baumebene; G-235 offen). Ein Waechter prueft
das.

### Ein Befund beim Bauen: die Codes des Mockups passen nicht

`[cmd]` **Von 48 Gruppencodes aus dem Mockup gibt es 9 in dieser
Datenbank nicht** — `SE`, `CL`, `F`, `CYS`, `FOLDFE`, `F20D5N3`,
`F22D6N3`, `F18D2N6`, `F18D3N3`.

`[read]` **Erste Frage laut Auftrag: habe ich richtig hingesehen?
Ja — es sind zwei verschiedene Codesysteme.** Der Mockup traegt die
Codes des Vorgaengerrepos, diese Datenbank die des BLS: `CLD` statt
`CL`, `FD` statt `F`, `CYSTE` statt `CYS`,
`F20:5CN3` statt `F20D5N3`. **Nicht erfunden, uebersetzt.**

`[cmd]` **Selen gibt es auf dev gar nicht** — kein Code, keine Zeile.
Nicht ergaenzt, nur gemeldet.

`[cmd]` **100 von 154 Zeilen fallen in keine der fuenf
Mockup-Gruppen** — Einzelfettsaeuren (`F16:0`, `F18:1CN9` …), Zucker,
Energie, Carotinoide. `[read]` **Sie verschwinden nicht, sondern
stehen unter „Weitere"** (88 Naehrstoffe). **Eine stumm weggelassene
Zeile waere derselbe Fehler wie eine Null statt eines
Fehlzaehlers**; ein Waechter prueft es.

### Was gebaut wurde

    neu   lib/nutrition/mikro-lage.ts          serverfrei, die vier Regeln
    neu   lib/nutrition/__tests__/…            19 Tests
    neu   app/v2/nutrition/mikro-ansicht.tsx   die Anzeige
    erg.  lib/nutrition/reference-assessment-read.ts   4 Felder ergaenzt
    ger.  app/v2/nutrition/ansicht.tsx         verdrahtet

`[read]` **Der Leseweg existierte schon** (`getReferenceAssessment`,
C-48/G-03) **und trug Regel 1 bereits im Kommentar** (*„`null`,
sobald ein Fehlzaehler > 0 ist — NICHT 0"*). `[cmd]` **Er liess aber
vier Felder fallen, die die Funktion liefert:**
`reference_pct_min/max`, `reference_basis`, `source_locator`,
`profile_is_pregnant/lactating`. **Nachgetragen — die RPC hat sie
immer schon geliefert, der Parser hat sie nur nicht abgebildet.**

`[cmd]` **Die Bewertung lag bereits in der Ansicht** (`bewertung`,
seit C-48) — **es brauchte keine neue Datenladung**, nur die
Weitergabe an den Reiter.

### Nachweisliste

    Zeilen je Zustand     [cmd] 3 zu viel · 4 zu wenig · 28 gedeckt ·
                                15 unvollstaendig · 88 ohne Richtwert
    Leserichtung          [cmd] Vitamin A 654 % Ziel / 164 % Grenze,
                                Bild g239-2
    unvollstaendig        [cmd] kein Prozentwert, Strich, Bild g239-4
    ohne Referenz         [cmd] eigener Satz, kein 0 %, Bild g239-5
    Quelle je Naehrstoff  [cmd] erreichbar, mit Fundstelle
    Attrappen im Modul    [cmd] 0 im neuen Code, Seite 1 (vorher 1)
    Ladezeit              [cmd] kalt 4.431 ms, warm 3.183 ms
    Bildschirmfoto        [cmd] sechs Bilder

### Gegenprobe

**Der Auftrag: *„einen Naehrstoff ueber seinem `UL` und einen unter
seinem `PRI` finden … und wenn es auf dev keinen ueber `UL` gibt, sag
das, statt einen zu erfinden."***

`[cmd]` **Es gibt drei ueber `UL`, nichts zu erfinden:**

    Vitamin A   4.905 µg  gegen 3.000 µg   163,5 %
    Magnesium     561 mg  gegen   350 mg   160,2 %
    Niacin       45,7 mg  gegen  35,0 mg   130,7 %

`[cmd]` **Und unter dem Zielwert:** Calcium 71,9 % (683 gegen 950 mg)
— dazu drei weitere, zusammen die 4 der Kachel.

`[read]` **Beide sehen verschieden aus:** die Ueberschreitung traegt
`--neg` mit Warnzeichen und invertierter Kachelzahl, das
Unterschreiten `--warn`. **Ein Waechter faellt, wenn beide dieselbe
Farbe bekommen.**

### Waechter: acht Sabotagen, acht Ausfaelle

`[cmd]` Jede einzeln, Datei danach byte-identisch (SHA-256):

    Regel 1: unvollstaendig zeigt doch einen Prozentwert   faellt
    Regel 1: unvollstaendig wird zu Null gerechnet         faellt
    Regel 1: unvollstaendig faerbt wie ein Mangel          faellt
    Regel 2: die Richtung wird ignoriert                   faellt (2)
    Regel 2: zu viel sieht aus wie zu wenig                faellt
    Regel 2: die Ueberschreitung wird vom Ziel verdeckt    faellt
    Regel 3: ohne Referenz wird zu 0 Prozent               faellt
    Nichtzugeordnete verschwinden still                    faellt

`[cmd]` **19 neue Tests, 197 im Nutrition-Modul gruen**, Typecheck
sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.563 Dateien sauber.

`[read]` **Ein Waechter verdient eine eigene Zeile:** er verbietet
der Lage-Datei, selbst zu rechnen (`* 100`, `actual / reference`).
`[cmd]` **C-48 haelt fest, dass die Prozentwerte in der Datenbank
entstehen** — eine zweite Rechnung waere eine zweite Wahrheit und
genau die Stelle, an der aus einem Fehlzaehler eine Null wird.

### Ladezeit

`[cmd]` **Kalt 4.431 ms, warm 3.183 ms** (angemeldet, `?tab=nutrients`,
2026-06-01). `[read]` **Der Reiter laedt zwei Dinge:** die Bewertung
(154 Zeilen) und die Naehrstoffordnung (138 Knoten). **Beide lagen
vorher schon an**, die Ansicht rechnet nur um. **Ein Vergleichswert
vor dem Umbau fehlt** — der Reiter zeigte die Bewertung nicht.

### Rueckbau

`[cmd]` **Nichts geschrieben.** `nutrition.meals` 2.895,
`nutrient_reference_values` 165 — vor wie nach dem Auftrag.
**Keine Referenzwerte geaendert, keine Schwelle gesetzt** (die 80 %
stammen aus dem Mockup und damit aus dem Vorgaengerrepo; ein Test
haelt sie fest). **Keine Tabelle angelegt.** Nicht committet.

### Abgrenzung der Zahlen

**Alle Zahlen sind von mir gemessen**, am 2026-08-28 gegen die
laufende Datenbank und den laufenden Dev-Server.

`[cmd]` **Die Zahl des Auftrags stimmt:** `nutrient_reference_values`
traegt 165 Zeilen. **Die „138 Codes" ebenfalls** — die Funktion
liefert genau 138 verschiedene `nutrient_code`.

`[read]` **Abgrenzung bei „Zeilen je Zustand":** gezaehlt werden
**Naehrstoffe nach Zusammenfassung** (138), nicht Funktionszeilen
(154). **Die Differenz sind die 16 zweiten Referenzen** der 12
Naehrstoffe mit Zielwert und Obergrenze — plus vier weitere Codes mit
zwei Zeilen anderer Art.

`[read]` **Abgrenzung bei „Attrappen":** 0 bezieht sich auf die drei
neuen Dateien. Die Seite zeigt weiterhin **1**, unveraendert.

`[read]` **Abgrenzung beim Stichtag:** alle Werte gelten fuer
**2026-06-01**. An einem anderen Tag sind die Zahlen andere — der Tag
wurde gewaehlt, weil er die meisten Eintraege traegt.

### Was offen bleibt

`[read]` **Die Detailtexte des Mockups** (`ND`: Mangelfolgen,
Ueberschuss, Wechselwirkungen, Top-Quellen, Tipps) **sind NICHT
eingebaut.** `[cmd]` Sie liegen im Vorgaengerrepo in
`nutrientDetails.ts`, aber **in dieser Datenbank gibt es keine
Tabelle dafuer** — sie waeren aus einer Datei zu uebernehmen, und das
ist Datenpflege. `[read]` **Der Auftrag verbietet, eine Tabelle
anzulegen** (G-221, Codex). **Das gehoert in einen eigenen Punkt.**

`[read]` **Der Zeitraumwechsel des Mockups** (`Heute · 7d · 14d ·
30d`) fehlt: die Funktion bewertet **einen** Tag. Ein Mehrtageblick
braucht entweder mehrere Aufrufe oder eine eigene Funktion — auch das
ein eigener Punkt.

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Die Struktur stimmt:** 154 Zeilen, 138 verschiedene
Naehrstoffe, Gegenprobe geht auf.

`[cmd]` **Die Doppelzeilen sind alle `<etwas>+UL`:**

    PRI+UL      CA · FE · VITA · VITB6 · VITC · ZN
    AI+UL       CU · FD · ID · MG · MN · MO · P · VITD · VITE
    NO_STANDALONE_REFERENCE+UL   NIA

`[read]` **Es sind 16, nicht 12** — die Rechnung 154 − 138 geht nur so
auf. `[read]` **Vermutlich wurden nur die sechs `PRI+UL`-Paare und
einige `AI+UL` gezaehlt.** Eine Abgrenzungsfrage, keine falsche
Arbeit — **aber die Zahl im Bericht stimmt nicht.**

### Die Prozentwerte haben sich unter uns verschoben

`[cmd]` **Ich messe VITA `PRI 689 % / UL 172 %`, der Bericht nennt
`654 % / 164 %`** — **beide um denselben Faktor 1,05.** `[cmd]`
Ebenso MG 173 gegen 160,2 und NIA 178 gegen 130,7. `[cmd]` **Und `MN`
mit `UL 105 %` fehlt im Bericht ganz.**

`[read]` **Kein Rundungs- oder Zaehlfehler, sondern ein anderer
Datenstand.** `[cmd]` **Zwischen beiden Messungen liefen zwei
vollstaendige Kettenlaeufe** — C-149 mit 128 Schritten und G-221 mit
129.

`[read]` **Meine Werte sind ueber drei Laeufe stabil.** **Als C-334
angelegt** — nicht als Vorwurf, sondern weil eine Bewertung, die sich
zwischen zwei Messungen verschiebt, geklaert gehoert.

### Was unabhaengig davon traegt

`[read]` **Regel 2 ist am schaerfsten belegt:** Vitamin A zeigt
gleichzeitig ueber sechshundert Prozent des Zielwerts und ueber
hundert der Obergrenze — **ein Naehrstoff, zwei entgegengesetzte
Lesarten, bei jeder Zahl die Bezugsgroesse.**

`[read]` **Die bewusste Abweichung vom Mockup ist richtig:** dessen
Farblogik `pct >= 80 gruen` faerbt eine Ueberschreitung gruen.
*,,Der Mockup ist nicht falsch, er kannte nur keine
`upper_limit`-Zeilen, weil seine Daten fest verdrahtet waren."*

`[cmd]` **Die Code-Uebersetzung ist die Vorsicht, um die ich gebeten
hatte:** `CLD` statt `CL`, `F20:5CN3` statt `F20D5N3` — **zwei
Codesysteme, nicht Erfindung.** `[read]` **Und Selen fehlt auf dev —
gemeldet, nicht ergaenzt** (C-333).

`[cmd]` **100 von 154 Zeilen fallen in keine Mockup-Gruppe** und
stehen unter *,,Weitere"* — **mit einem Waechter, der faellt, wenn sie
still wegfallen.**

`[cmd]` **Der Leseweg liess vier Felder fallen, die die RPC immer
geliefert hat.** Nachgetragen.

`[cmd]` 19 neue Tests, 197 gruen, acht Sabotagen fallen, nichts
geschrieben. **Ladezeit kalt 4.431 ms, warm 3.183 ms** — ohne
Vergleichswert, weil der Reiter die Bewertung bisher nicht zeigte.

**Abgenommen.**

