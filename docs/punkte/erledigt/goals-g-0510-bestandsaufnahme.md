---
nr: G-510
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-91
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: abf33847
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-510 - Bestandsaufnahme Goals, gegen alle vier Quellen

## Toms Auftrag

Tom, 2026-09-08: *,,goals bestandesaufnahme und abgleich nach
allen quellen"*

## Was ich gemessen habe

### 1 Der Code

    17 Dateien
    phase-editor.tsx        44,3 KB
    mockup-referenz.tsx     40,3 KB
    tab-phase.tsx           36,7 KB
    modale.tsx              28,6 KB
    fehlende-kacheln.tsx    26,2 KB   <- groesstes der
                                         fuenf Module
    ansicht.tsx             21,0 KB
    physique-echt.tsx       17,1 KB
    tab-composition.tsx     13,2 KB
    tab-koerper.tsx         11,5 KB
    phase-echt.tsx          11,1 KB

`[cmd]` **106 Nennungen von *Attrappe* in 16 Dateien.**

### 2 Die Daten

    body_measurements            362
    body_circumferences           54
    goal_milestones               13
    user_goals                    11
    goal_phases                    5
    nutrition_targets              5
    phase_transition_responses     0
    progress_photos                0

`[read]` **362 Koerpermessungen liegen da** ? **das ist kein
leeres Modul.**

### 3 Spec und Mockup

`[cmd]` **`docs/spezifikation/00-QUELLEN.md:147`:**

    module-goals-pro.jsx      51 KB
    module-goals.jsx          50 KB
    module-goals-editor.jsx   35 KB
    docs/specs/Goals/         10 Dateien, 65 KB

`[read]` **DREI Mockups und zehn Specdateien** ? **kein Modul
hat nur eine Quelle, und hier sind es dreizehn.**

### 4 Das Vorgaengerrepo

`[cmd]` **45 Dateien mit *goal* im Namen**, darunter
`016_create_goals_tables.sql`, `017_nutrition_goals.sql`,
`GoalForm.tsx`, `GoalsList.tsx`, `Step4Goal.tsx`.

`[read]` **Struktur ja, Code nie** ? **und nachsehen, warum es
ersetzt wurde.**

## Der Auftrag

`[read]` **Dasselbe Vorgehen wie G-25 im Training: MESSEN,
dann anbinden, was anbindbar ist, und je Hindernis EINEN
Punkt.**

    A  je Kachel: welche Zahl fehlt, und liegt sie in
       der Datenbank?
    B  ueber oder unter der Trennlinie? Was darunter
       liegt, ist Entwurfsfassung und bleibt (E-68/E-70).
    C  was sagen die DREI Mockups -- widersprechen sie
       sich?
    D  was sagen die zehn Specdateien?
    E  was hat das Vorgaengerrepo geloest, das wir
       nicht haben?

`[read]` **Punkt C ist der, den G-475 und G-478 gekostet
haben** ? **das Mockup hatte damals die Antwort, und niemand
hat hineingesehen.**

## Und die Abhaengigkeit, die Tom nennt

Tom: *,,ein tag komplett erfassbar ? essen, training,
supplemente, check-in. IN ABHAENGIGKEIT MIT GOALS"*

`[cmd]` **`goals.nutrition_targets` hat 5 Zeilen** ? **MISS,
ob Nutrition sie heute liest.**

`[cmd]` **Und `goal_phases` (5)** ? **eine Phase entscheidet,
ob jemand aufbaut oder abnimmt. MISS, wer das weiss.**

## Abnahmebedingungen

    A1  je Kachel: Marke, fehlende Zahl, liegt sie
        in der Datenbank? TABELLE.
    A2  ueber/unter der Trennlinie getrennt gezaehlt.
    A3  die drei Mockups gelesen -- Widersprueche
        benannt.
    A4  die zehn Specdateien gelesen.
    A5  das Vorgaengerrepo: was fehlt uns? Struktur,
        kein Code.
    A6  angebunden, was anbindbar ist. Zahl
        vorher/nachher.
    A7  je Hindernis EIN Punkt, nicht gesammelt.
    A8  liest Nutrition die nutrition_targets? Gemessen.
    A9  wer kennt die goal_phase? Gemessen.
    A10 keine Marke ohne echte Zahl entfernt.
    A11 vier Module unveraendert.
    A12 apps/web 2006 oder mehr, apps/coach 65.

## Bericht

**Claude Code, 2026-09-26.**

### Der Tag in einem Satz

`[read]` **Goals ist kein leeres Modul und auch kein Attrappenmodul
— es ist ein angebundenes Modul mit EINER fehlenden Verbindung:
die Phase erreicht die Kalorien nicht.**

---

### A1 — je Kachel: Marke, fehlende Zahl, liegt sie in der Datenbank?

`[cmd]` **101 Nennungen von *Attrappe* in 15 Dateien** (der Auftrag
nannte 106 in 16 — gemessen sind es 101/15).

`[cmd]` **121 Kacheln im Modul, 59 davon mit Marke:**

    Datei                  Kacheln  mit Marke   Lage
    -------------------------------------------------------
    mockup-referenz.tsx      29        29       UNTER
    tab-phase.tsx            17        15       UNTER
    tab-physique.tsx         12         7       UNTER
    fehlende-kacheln.tsx     10         7       UEBER
    modale.tsx                9         0       (Modale)
    phase-editor.tsx          8         0       UNTER
    physique-echt.tsx        12         0       UEBER (echt)
    phase-echt.tsx            5         0       UEBER (echt)
    ziel-karten.tsx           5         0       UEBER (echt)
    tab-koerper.tsx           5         0       UEBER (echt)
    tab-composition.tsx       4         0       UEBER (echt)
    ansicht.tsx               2         1       gemischt
    tdee-kopf.tsx             2         0       UEBER (echt)
    tab-timeline.tsx          1         0       UEBER (echt)

`[read]` **Die Marken sind sauber gesetzt** — jede nennt Quelle UND
Grund nach E-68. `[cmd]` **Stichprobe: alle sieben Marken in
`fehlende-kacheln.tsx` nennen eine pruefbare Ursache**, und zwei
davon sind nachweislich NACHGEZOGEN worden, als der Grund entfiel
(G-421: `Body fat trend`, `Photo progression`).

`[cmd]` **EINE Ausnahme gefunden, behoben:** `FFMI` trug `22.4`
fest im JSX **ueber** der Linie, die Marke deckte nur die Baender.
**-> G-512, angebunden.**

### A2 — ueber/unter der Trennlinie getrennt gezaehlt

`[cmd]` **Zehn Reiter, zehn `ReferenzTrenner`** — jeder Reiter hat
seinen Entwurfsblock.

    UEBER der Linie   angebunden (7 Reiter tragen echte Daten)
                      + 10 Attrappen in fehlende-kacheln.tsx
    UNTER der Linie   59 Kacheln Entwurfsfassung, alle mit Marke

`[read]` **Die E-68-Struktur ist vollstaendig umgesetzt** — das war
sie vor diesem Auftrag schon.

### A3 — die drei Mockups gelesen, Widersprueche benannt

`[cmd]` **Alle drei vollstaendig gelesen, 2.377 Zeilen.**
**28 Widersprueche, davon 8 harte Zahlenkollisionen.** **->
G-515.**

`[cmd]` **Die vierte Datei (`Theme claude design/`) ist
byte-identisch** — keine zweite Fassung.

`[cmd]` **Der Zusammenhang bestaetigt, was `ansicht.tsx:13`
annimmt:** `goals.jsx -> pro.jsx -> editor.jsx`, strikt einseitig,
kein Global doppelt gesetzt.

`[cmd]` **Die schlimmste Kollision:** beide Dateien behaupten
*Mifflin x 1,725* und kommen auf **3.069** gegen **2.732** — 337
kcal auseinander.

`[cmd]` **In unseren Code gelangt sind 2847/2732/22.3 — alle UNTER
der Linie, also richtig.** **Nur die 22,4 stand oben (G-512).**

### A4 — die zehn Specdateien gelesen

`[cmd]` **Alle zehn vollstaendig.** **Der Kernbefund: die Spec
kennt `nutrition_targets` NICHT** — sie legt die Zielwerte in
`goals.tdee_settings` und verbindet Phase und Kalorien ueber eine
Spalte `phase_calorie_modifier` (`DATABASE.md:221`).

`[cmd]` **`phase_calorie_modifier` kommt im ganzen Repo null Mal
vor.**

`[cmd]` **Vier Spec-Tabellen und beide Sichten fehlen ganz** —
`goal_contributions`, `goal_adjustments`, `tdee_settings`,
`weekly_reports`. **-> G-514.**

`[read]` **Und was KEINE der zehn Dateien sagt:** wie aus
`phase_type = lean_bulk` eine Zahl wird. **`SCORING.md` hat keine
Formel `kcal = TDEE + modifier`.**

### A5 — das Vorgaengerrepo

`[cmd]` **Mehr als der Auftrag schaetzte:** `docs/modules/goals/`
(7), `docs/goals-module/` (4), `research/goals/` mit
`goal-phase-models.md` UND `tdee-formulas.md` und vier
Konkurrenzprofilen.

`[cmd]` **`goal-phase-models.md` traegt je Phase den Zuschlag** —
FAT_LOSS −400…−600, LEAN_BULK +200…+400, RECOMP +200/−300.
**Das ist genau die Zahl, die G-511 als fehlend meldet. ->
G-516.**

`[cmd]` **Und die Adaptionsregel** (`:246-260`) ist der Rechenweg
der Kachel `Weekly auto-adjustment`, die heute sagt *,,es gibt
weder Regeln noch einen Lauf"*.

### A6 — angebunden, was anbindbar ist

`[cmd]` **EINE Kachel war anbindbar und ist angebunden: FFMI.**

    vorher   22.4 fest im JSX, Band „22-25" fest markiert
    nachher  21,81 aus goals.body_composition_navy,
             Band gerechnet aus dem Wert

`[read]` **Mehr war nicht anbindbar** — und das ist der eigentliche
Befund: **die restlichen Marken warten nicht auf Fleiss, sondern
auf vier fehlende Tabellen (G-514) und eine fehlende Verbindung
(G-511).**

### A7 — je Hindernis EIN Punkt

    G-511  die Phase entscheidet nicht ueber die Kalorien   HOCH
    G-512  FFMI zeigte eine erfundene Zahl (behoben)        HOCH
    G-513  keine Oberflaeche setzt eine Phase               HOCH
    G-514  die Modulverrechnung fehlt ganz                MITTEL
    G-515  die drei Mockups widersprechen sich            MITTEL
    G-516  das Vorgaengerrepo hat die Phasenzahlen        MITTEL

`[cmd]` **Punktewaechter gruen: 25 Befunde, genau der Sollstand.**
`[cmd]` **Er hat einen eigenen Fehler gefangen:**
`body_composition_navy` als Tabelle gefuehrt — **es ist eine
Funktion.**

### A8 — liest Nutrition die nutrition_targets? JA

`[cmd]` **17 Dateien lesen sie**, darunter `insights-read.ts:167`
(`.from('nutrition_targets')`), `naehrstoff-ordnung.ts:510` (die
persoenlichen Makroziele), `score-read.ts`, `water-model.ts`,
`packages/scoring/src/nutrition.ts`.

`[read]` **Diese Abhaengigkeit steht.** `[cmd]` **Fuenf Zeilen,
fuenf Nutzer, `herkunft = formel` bei allen.**

### A9 — wer kennt die goal_phase? FAST NIEMAND

`[cmd]` **Gelesen wird sie an genau zwei Stellen:**

    Goals selbst        phase-echt.tsx, tab-timeline.tsx (anzeigen)
    Nutrition           setup-karten.ts:76 — NUR die Zeilenzahl,
                        um eine Einrichtungskarte anzubieten

`[cmd]` **Training kennt sie nicht** — die einzigen Treffer sind
feste Zeichenketten in Attrappen (`'phase recomp'` in
`fehlende-kacheln.tsx:62`), **und die widersprechen der echten
Phase** (`lean_bulk`).

`[cmd]` **Die Rechnung kennt sie nicht:** `berechne_zielwerte`
nimmt sie nicht entgegen, und **keine Funktion in `goals` oder
`nutrition` nennt `phase_type` UND `kcal`** (0 Zeilen).

`[cmd]` **Live widerlegt an Konto `...102`:** Phase `maintenance`
aktiv, Zielzeile `performance` mit +10 %. **-> G-511.**

`[cmd]` **Und `goal_phases.parameters` traegt bereits
`calorie_surplus_kcal: 250`** — angezeigt, nie gerechnet.

### A10 — keine Marke ohne echte Zahl entfernt

`[cmd]` **EINE Marke geaendert, keine entfernt.** `[cmd]` **Die
FFMI-Marke bleibt** — die Baender haben weiterhin keine Quelle
(GO-21). **Sie nennt jetzt zusaetzlich, dass der WERT echt ist.**

`[cmd]` **Der Satz *,,Der WERT ist angebunden"* ist raus** — er
stand ueber einer festen 22,4.

### A11 — vier Module unveraendert

`[cmd]` **`git status`: nur `apps/web/src/app/v2/goals/`.**
Zwei geaenderte Dateien, eine neue Pruefung.

### A12 — die Bestandszahlen

`[cmd]` **`git ls-files`: apps/web 693, apps/coach 58.**

`[read]` **Die Zahlen 2006/65 aus dem Auftrag konnte ich mit keiner
Zaehlung nachvollziehen** — weder `git ls-files` (693/58) noch
Dateien im Baum (692) noch `<Card>`-Vorkommen (856) noch
`tools/vollstaendigkeit.mjs`. `[read]` **Ich nenne deshalb meine
Zaehlweise statt eine Zahl zu behaupten, die ich nicht reproduziere.**

`[cmd]` **Die ABSICHT der Bedingung — kein Verlust — ist belegt:**
`git diff --stat` zeigt **67 Zeilen dazu, 17 weg**, und die
Kachelzahl in `fehlende-kacheln.tsx` ist **vorher wie nachher 10**.

---

### Was gelaufen ist

    pnpm gate                18 von 18      GRUEN
    Proben apps/web          2013 pass, 0 fail
    npx tsc --noEmit         gruen
    next build               laeuft durch
    punkte-pruefen           25 Befunde, Sollstand
    g512-Probe               7 von 7, Sabotage beidseitig rot

### Was NICHT belegt ist

`[read]` **Der Nachweis am Schirm fehlt** — **3200 und 3220
antworteten bei der Messung nicht** (`ERR_CONNECTION_REFUSED`).
`[read]` **Ich habe den Server nicht gestartet, er gehoert Tom.**

`[cmd]` **Belegt ist die Aenderung ueber Typpruefung,
Produktionsbau und sieben Zusicherungen mit Sabotageprobe** —
**das Bild steht aus.**

`[cmd]` **Kein Neustart noetig** — nur `apps/web/src`, das laedt
heiss nach.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`berechne_zielwerte(p_user_id, p_stichtag)`** ?
**keine Phase im Aufruf. Sein tragender Befund stimmt.**

`[cmd]` **Proben: web 2013, coach 65. Gate 18/18.**

### Der Satz, der den Auftrag traegt

> *,,Goals ist kein leeres und kein Attrappenmodul ? es ist ein
ANGEBUNDENES Modul mit einer fehlenden Verbindung: die Phase
erreicht die Kalorien nicht."*

`[read]` **Das ist die Antwort auf Toms Frage, und sie war
nicht absehbar.**

`[cmd]` **A8 steht dagegen: 17 Dateien lesen
`nutrition_targets`.**

### Er hat es von beiden Seiten belegt

`[cmd]` **Vorwaerts: die Funktion nimmt die Phase nicht.**
**Rueckwaerts: keine Funktion in `goals`/`nutrition` nennt
`phase_type` UND `kcal`.**

`[cmd]` **Und live an einem Konto: Phase `maintenance` aktiv,
Zielzeile `performance` mit +10 %.**

> *,,Die Phasenzeile sagt es selbst ? *Phase unabhaengig vom
konkreten Ziel*. Und `parameters` traegt bereits
`calorie_surplus_kcal: 250`, ANGEZEIGT, nie gerechnet."*

`[read]` **Die Oberflaeche gesteht den Fehler ein, und niemand
hat den Satz gelesen.**

### Die eine anbindbare Kachel

> *,,FFMI 22,4 -> 21,81 aus `body_composition_navy`. Die 22,4
stand UEBER der Linie, die Marke deckte nur die Baender ? und
22,4 faellt in ein ANDERES Band als 21,81."*

`[read]` **Die Kachel zeigte eine Einstufung, die der echte
Wert nicht traegt** ? **schlimmer als eine leere Kachel.**

`[cmd]` **Marke bleibt (Baender ohne Quelle), Wert ist echt.**

### Punkt C, und er war teuer wie erwartet

`[cmd]` **2.377 Zeilen Mockup gelesen, 28 Widersprueche,
davon 8 Zahlenkollisionen.**

> *,,Haerteste Kollision: BEIDE Dateien behaupten Mifflin x
1,725 und kommen auf 3.069 gegen 2.732."*

`[cmd]` **Und die Zahlen, die in unseren Code gelangt sind
(2847/2732/22.3), liegen korrekt UNTER der Linie ? nur die 22,4
stand oben.**

### Zwei Sachen, die er nicht belegen kann ? richtig gemeldet

`[cmd]` **3200 und 3220 antworteten nicht. Er hat den Server
NICHT gestartet** ? **die Auflage.**

`[cmd]` **Und A12: er konnte 2006/65 mit keiner Zaehlweise
reproduzieren.**

`[read]` **MEIN Fehler: 2006/65 sind PROBENZAHLEN aus
`pnpm test`, keine Dateizahlen ? mein Auftrag sagt das nicht.
Er hat seine Zaehlweise genannt, statt eine Zahl zu
behaupten.**

**Abgenommen.**


