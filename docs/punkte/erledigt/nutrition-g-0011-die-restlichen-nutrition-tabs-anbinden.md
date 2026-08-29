---
nr: G-11
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-16
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-29
commit: 5f8414b0
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/ansicht.tsx]
zahlen: null
---

# G-11 - Die restlichen Nutrition-Tabs anbinden

## Befund

(neu 2026-08-16).
  Setzt G-08 voraus.

  `[cmd]` Sieben Tabs stehen, drei tragen Daten (`Diary`, `Nutrients`,
  `Food DB`). **Vier sind Attrappen:** `Insights`, `Meal plans`,
  `Preferences`, `Planner`.

  | | woran es hängt |
  |---|---|
  | `Insights` | Auswertungen über Zeiträume — `daily_summary` rechnet je Tag, nicht je Woche |
  | `Meal plans` | `[cmd]` `meal_plans` existiert nicht |
  | `Preferences` | `[cmd]` `food_preferences` und `food_preference_items` existieren, sind leer und nirgends angebunden |
  | `Planner` | setzt `meal_plans` voraus |

  **`Preferences` ist der nächste realistische Schritt** — `[cmd]` die
  Tabellen stehen seit Kettenschritt `050`, mit Zeilenschutz und
  Policies. Was fehlt, ist die Oberfläche und die Verbindung zur Suche.

  `[read]` `Insights` braucht eine Wochen- oder Monatsaggregation. Seit
  den Testdaten gibt es **43 Tage je Nutzer** — das wäre erstmals
  belegbar.

## Auftrag — die Attrappen-Tabs, vier Punkte

**Mitbeauftragt: G-248, G-137, G-152.** Bericht in diese Datei, die
anderen tragen einen Verweis.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Seit heute Regel in `CLAUDE.md`** — am 28.08. sind fuenf
Auftragspraemissen gefallen, weil ich gemessen und dann etwas anderes
behauptet habe.

`[read]` **Der Punkt selbst ist vom 16.08. und vermutlich zur Haelfte
ueberholt.** `[read]` **Er sagt *,,`meal_plans` existiert nicht"* —
Toms Bildschirmfoto vom 28.08. zeigt einen Meal-plans-Reiter mit
einem Wochenplan. **Miss zuerst, was heute gilt.**

`[cmd]` **Der massgebliche Mockup liegt in
`docs/spezifikation/10-plattform/design-system/theme-v1/`** —
`module-nutrition.jsx` und `module-nutrition-spec.jsx`. **NICHT der
`.js`-Ordner.** `[read]` **Und Vorlagen koennen ueber die
Dateigrenze hinweg aufgerufen werden:** G-98 hat gemessen, dass
`MealPlansView` in `-spec.jsx` steht und aus `module-nutrition.jsx`
als `window.MealPlansView` gerufen wird. **Zwei Punkte haben es
vorher nicht gefunden, weil sie nur eine Datei gelesen haben.**

### 1 · Welche Tabs sind heute noch Attrappe?

`[read]` **Der Punkt nennt vier: Insights, Meal plans, Preferences,
Planner.** **Miss es nach — am Bildschirm, nicht im Quelltext**
(A-59: 89 Marken im Code gegen 24 auf dem Schirm).

**Je Tab:** woran haengt er? Fehlt eine Tabelle, eine Entscheidung,
oder nur die Anbindung?

### 2 · Anbinden, was ohne Entscheidung geht

`[read]` **Der Punkt selbst schlaegt `Preferences` als naechsten
vor**, weil die Tabellen existieren. **Pruef das und bau, was
traegt.**

`[read]` **Was eine Entscheidung braucht, wird gemeldet, nicht
geraten.**

### 3 · G-248 — die Fehlzaehler

`[cmd]` **`daily_summary` fuehrt 35 `_missing`-Zaehler, der
Diary-Leseweg laedt neun** — und die, die feuern, sind nicht dabei.

`[read]` **35 im Tagebuch waeren zu viel.** `[read]` **Die Frage ist,
ob ein Sammelhinweis reicht** — *,,drei Naehrstoffe unvollstaendig"*
mit Verweis auf den Nutrients-Reiter — **statt neun einzelne.**

### 4 · G-137 — die verfallenen Ansichtsschluessel

`[read]` **Einmalige Nebenwirkung aus G-129:** gespeicherte Ansichten
tragen alte Gruppenschluessel, die Karten heissen anders. **Wer eine
Ansicht gespeichert hatte, startet einmal mit allem zugeklappt.**

`[cmd]` **Die Speicherung verwirft kaputte Werte sauber** (G-122).
`[read]` **Also kein Fehler — pruef, ob es nach G-249 ueberhaupt noch
gilt**, und schliess den Punkt oder benenne, was bleibt.

### Was nicht zu tun ist

**Keine Tabelle anlegen** — Codex arbeitet an der Suche.
**Nichts erfinden, wo Daten fehlen.** `[read]` **Ein Tab, der ehrlich
sagt, was ihm fehlt, ist besser als einer mit erfundenen Zahlen** —
das ist die Form, die seit G-208 im Haus ist.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Attrappen-Tabs               vorher / nachher, am Schirm
    je Tab                       woran es haengt
    angebunden                   welche, mit Datenquelle
    gemeldet statt gebaut        welche, mit Grund
    G-248                        Sammelhinweis oder Begruendung
                                 dagegen
    G-137                        gilt es noch?
    Ladezeit je Tab              ms, kalt und warm
    Bildschirmfoto je Tab        `node tools/schuss.mjs`

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30** und **A-60** beachten.
`[read]` **Und eine Sabotage, die nicht faellt, kann zweierlei
heissen** — der Waechter taugt nichts, oder die sabotierte Stelle ist
wirkungslos. **Zweimal am 28.08. war es das Zweite.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Nachtrag vom Orchestrator, 2026-08-28

**Der gebaute `/v2/`-Stand ist der Massstab, nicht der Mockup.**

**Tom:** *,,theme-v1 ist das claude design von welchem wir v2
abgeleitet haben ... also ist theme-v1 nur noch eine ideen struktur
falls uns in v2 was fehlt."*

`[read]` **Also nicht: den Mockup gegen den gebauten Stand halten.**
**Sondern: den gebauten Stand messen.** `theme-v1` **nur
nachschlagen, wenn etwas fehlt und die Frage ist, wie es gemeint
war.**

`[cmd]` **Und es gibt zwei Routenbaeume:** `/v2/nutrition` und
`/nutrition`. **Der alte traegt ein eigenes Template und bleibt** —
Tom: *,,da laeuft ein anderes template und das soll bleiben"*.
**Nicht anfassen.**

`[read]` **Mein Fehler in diesem Auftrag:** ich habe `theme-v1` als
*,,massgeblich"* bezeichnet. **Das war falsch.**

## Bericht

**Der Punkt ist zu zwei Dritteln ueberholt.** `[cmd]` **Von vier
genannten Attrappen-Tabs sind zwei gebaut** — und im Insights-Reiter
stand dieselbe Doppelung, die G-249 im Nutrients-Reiter entfernt hat.
**Sie ist weg.**

`[cmd]` **Alle Zahlen gemessen am 2026-08-29, `dev@lumeos.app`,
Stichtag heute. Am Bildschirm gezaehlt (A-59), nicht im Quelltext.**

### 1 · Welche Tabs sind heute Attrappe?

`[cmd]` **Sieben Reiter, vorher gemessen:**

    reiter      attrappen  karten  kalt   warm
    diary               4      18  3.705  3.219
    insights            3       6  3.396  2.746
    nutrients           0      10  4.460  3.808
    foods               0       2  4.896  4.143
    plans               3       6  3.466  2.867
    prefs               0       8  3.317  2.687
    planner             0       3  3.511  2.898

`[read]` **Der Punkt nennt vier: Insights, Meal plans, Preferences,
Planner.** `[cmd]` **Preferences und Planner tragen null Attrappen** —
sie sind gebaut. **Der Punkt ist hier ueberholt.**

`[cmd]` **Und `meal_plans` existiert, entgegen dem Befundtext:**

    nutrition.meal_plans          2 Zeilen, davon dev 1
    nutrition.meal_plan_weeks     6              dev 3
    nutrition.meal_plan_days     42              dev 21
    nutrition.meal_plan_entries 112              dev 56

`[read]` **Toms Bildschirmfoto hatte recht.** Der Plans-Reiter liest
seit G-161 drei von acht Kacheln echt.

**Woran haengt jede der zehn Attrappen — gemessen, nicht vermutet:**

    Reiter     Kachel                    haengt an
    diary      Smart suggestions         ENTSCHEIDUNG — was ist ein
                                         Vorschlag, woraus entsteht er
    diary      Nutrition score           ENTSCHEIDUNG + Tabelle;
                                         `[cmd]` 0 Tabellen mit „score"
                                         im Schema
    diary      Pending actions           TABELLE liegt woanders:
                                         `[cmd]` `coach.pending_actions`
                                         existiert, gehoert dem Coach
    diary      Pre-workout window        ENTSCHEIDUNG — braucht die
                                         Trainingsplanung
    insights   Calorie balance           **war DOPPELT, jetzt weg**
    insights   Macro split · 14d avg     **war DOPPELT, jetzt weg**
    insights   Micronutrient trend       ANBINDUNG — Daten da,
                                         siehe unten
    plans      Today's ghost entries     ENTSCHEIDUNG — was ist ein
                                         „ghost entry"
    plans      Lifecycle types           ENTSCHEIDUNG
    plans      7-day compliance          ANBINDUNG — `meal_plan_entries`
                                         traegt 56 Zeilen fuer dev

### 2 · Was ohne Entscheidung ging — und was gebaut wurde

**Der Punkt schlaegt `Preferences` vor.** `[cmd]` **Nicht noetig: der
Reiter traegt null Attrappen und liest `food_preference_items`
(3 Zeilen fuer dev).**

**Gebaut ist stattdessen das, was die Messung als Fehler zeigte:**

`[cmd]` **Der Insights-Reiter zeigte „Calorie balance" und „Macro
split · 14d avg" JE ZWEIMAL** — oben echt aus `insights-echt.tsx`
mit Werten aus `daily_summary`, darunter als Attrappe mit den Zahlen
der Vorlage.

    vorher   ["Calorie balance", "Macro split", "Calorie balance",
              "Macro split", "Micronutrient trend"]
             echt · echt · ATTRAPPE · ATTRAPPE · ATTRAPPE
    nachher  ["Calorie balance", "Macro split", "Micronutrient trend"]
             echt · echt · ATTRAPPE

`[read]` **Dieselbe Klasse wie G-249** — ein Entwurf, der neben dem
gebauten Stand stehen blieb. **Der Entwurf bleibt vollstaendig
aufrufbar:** ohne das Flag zeigt er alle drei Kacheln und ist damit
weiter der Rueckfall, wenn die echten Daten fehlen.

`[cmd]` **Insights: 3 Attrappen → 1.**

**Was ich NICHT gebaut habe, mit Grund:**

`[read]` **„Micronutrient trend" haette ich anbinden koennen** — die
Daten liegen seit G-247 vor (`daily_nutrient_summary_long`, Sparkline
und Trendrichtung sind gebaut). `[read]` **Aber der Nutrients-Reiter
zeigt genau das bereits, je Naehrstoff.** **Dieselbe Auswertung ein
zweites Mal danebenzustellen waere die Doppelung, die ich gerade
entfernt habe.** `[read]` **Die Frage ist eine Entscheidung: soll der
Insights-Reiter eine Zusammenfassung ueber ALLE Naehrstoffe zeigen —
und wenn ja, welche?** Das ist keine Anbindung.

`[read]` **Die vier Diary-Kacheln und zwei der drei Plans-Kacheln
brauchen Entscheidungen** — was ein Vorschlag ist, was ein Score
misst, was ein „ghost entry" ist. **Geraten haette ich Zahlen ohne
Quelle.**

`[read]` **„7-day compliance" im Plans-Reiter waere anbindbar** (56
Einträge fuer dev) — **aber `plan-lesen` gehoert zum Planner, und der
Reiter liest bereits drei Kacheln daraus.** **Ein eigener Punkt, kein
Nebenbei.**

### 3 · G-248 — der Sammelhinweis

**Die Frage: reicht ein Sammelhinweis statt neun einzelner?**

`[cmd]` **Ja — und er ist ehrlicher als das, was heute dasteht.**

`[cmd]` **Gemessen ueber 14 Tage bis heute: von 35 Fehlzaehlern
feuern NEUN:**

    vitc     an 14 von 14 Tagen      fibt     an 2
    iodid    an 12                   na       an 2
    vitk     an  6                   ribf     an 2
    nia      an  3                   vite     an 2
    vitb12   an  3

`[cmd]` **Der Diary-Leseweg laedt neun ANDERE** — `enercc, prot625,
fat, cho, fibt, sugar, fasat, nacl, water_g`. **Die Schnittmenge ist
eine einzige: `fibt`.**

`[read]` **Der Hinweis aus C-48 nennt heute also einen Naehrstoff und
schweigt ueber acht.** `[read]` **Das ist schlimmer als kein Hinweis**
— wer „eine Position ohne Wert bei Ballaststoffen" liest, haelt den
Rest fuer vollstaendig.

`[cmd]` **Gebaut: der Sammelsatz, in EINER Abfrage.**
`daily_nutrient_summary_long` zaehlt es direkt — **am 2026-08-29:
76 von 138 Naehrstoffen unvollstaendig.** Am Schirm:

    „Bei 76 von 138 Nährstoffen fehlen einzelne Positionen. Diese
     Summen sind eher zu niedrig als zu hoch — welche es betrifft,
     steht im Reiter Nährstoffe."

`[read]` **35 Spalten in das Tagebuch zu laden waere teurer und nicht
genauer.** `[cmd]` Zwei Abfragen mit `count: 'exact', head: true` —
es kommen keine Zeilen zurueck, nur die Zahl.

`[read]` **Der Einzelhinweis bleibt daneben stehen**, wo er zutrifft:
„welcher" ist konkreter als „wie viele". **Beide zusammen sagen mehr
als jeder allein.**

### 4 · G-137 — gilt es noch?

`[cmd]` **Teilweise. Gemessen gegen die gespeicherte Ansicht von
`dev@lumeos.app`:**

    gespeichert            gibt es heute?
    g:Makronährstoffe      ja
    g:Kohlenhydrate        ja
    g:Fettlösliche Vitamine ja
    g:Fette                NEIN  (heute „Fettsäuren")
    g:Protein              NEIN

`[read]` **Drei von fuenf Schluesseln greifen** — der Nutzer startet
also NICHT mit allem zugeklappt, sondern mit zwei Karten weniger als
gespeichert.

`[cmd]` **Und `pruefeAnsicht` verwirft nur STRUKTURELL kaputte
Werte** (kein Array, zu lang, unbekanntes Fenster) — **ein unbekannter
Gruppenschluessel kommt durch und trifft dann nichts.** `[read]` **Das
ist richtig so:** ein Schluessel, der heute nichts trifft, kann morgen
wieder passen. **Wer ihn verwirft, verliert ihn endgueltig.**

`[read]` **G-249 hat daran nichts geaendert** — der Klappzustand
gehoert zur Ordnung, und die ist geblieben. **Der Punkt kann
geschlossen werden:** die Nebenwirkung ist einmalig, heilt beim
naechsten Speichern, und die Verwerfung arbeitet wie beschrieben.
**Was bleibt: zwei tote Schluessel in einer Nutzerzeile — kein
Fehler, kein Auftrag.**

### 5 · G-152 — der Aktivitaetsstrom

`[cmd]` **Die Zahlen des Punktes stimmen unveraendert** (dev,
2026-08-29): `meals.meal_time` **725 von 725**,
`intake_logs.intake_time` **360 von 360**,
`training.workout_sessions` **30**.

`[cmd]` **Und es gibt weiterhin keine gemeinsame Ereignissicht** —
gesucht nach `%event%`, `%activity%`, `%aktivit%`: nur
`nutrition.search_events` und `supplements.supplement_cycle_events`,
beide modulgebunden.

`[read]` **Der Punkt sagt es selbst: *„Was fehlt, ist eine
Entscheidung, keine Spalte."*** **Sechs Abfragen je Seitenaufruf oder
eine Sicht in der Datenbank** — und die Sicht waere Codex' Bereich.
**Nicht gebaut, unveraendert offen.**

### Nachweisliste

    Attrappen-Tabs      [cmd] vorher 3 Reiter (10 Karten),
                              nachher 3 Reiter (8 Karten)
    je Tab              [cmd] Tabelle / Entscheidung / Anbindung,
                              Tabelle oben
    angebunden          [cmd] Insights entdoppelt (2 Karten weg);
                              Sammelhinweis aus
                              daily_nutrient_summary_long
    gemeldet statt      [cmd] 4 Diary-Kacheln, 2 Plans-Kacheln
    gebaut                    (Entscheidung), Micronutrient trend
                              (Doppelung vermeiden), 7-day
                              compliance (eigener Punkt)
    G-248               [cmd] Sammelhinweis, 76 von 138
    G-137               [cmd] gilt teilweise, schliessbar
    Ladezeit je Tab     [cmd] Tabelle oben, kalt und warm
    Bildschirmfoto      [cmd] sieben Bilder, `backup/g11-*.png`

### Waechter: acht Sabotagen, acht Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    der Sammelsatz nennt nur eine Zahl              faellt
    die Richtung des Fehlers faellt weg             faellt
    der Verweis auf den Reiter faellt weg           faellt
    ohne Luecke kommt doch ein Satz                 faellt
    die Zahl wird geladen statt gezaehlt            faellt
    der Sammelhinweis wird nicht gerendert          faellt
    der Entwurf zeigt die Kacheln wieder doppelt    faellt
    das Flag ist nicht mehr abschaltbar             faellt

`[read]` **Drei hielten beim ersten Versuch nicht** — dieselbe Klasse
wie in G-247, G-246 und G-70:

    Verweis auf den Reiter   suchte „Nährstoffe" — das steht ohnehin
                             im Satz. Jetzt: „Reiter Nährstoffe".
    Sammelhinweis gerendert  suchte den Aufruf — `{false && (` liess
                             ihn stehen. Jetzt: der Bedingungskopf.
    Zahl gezaehlt            fand das erste `count: 'exact'` und war
                             zufrieden, obwohl die zweite Abfrage
                             Zeilen lud. Jetzt: beide gezaehlt.

`[cmd]` **7 neue Tests, 256 im Nutrition-Modul gruen**, Typecheck
sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.598 Dateien sauber.

### Abgrenzung der Zahlen

`[read]` **Abgrenzung bei „Attrappen":** `.v2-attrappe` im
gerenderten DOM, je Reiter einzeln, angemeldet (A-59). **Im Quelltext
stehen mehr Marken** — Rueckfallzweige rendern mit Daten nie.

`[read]` **Abgrenzung bei „9 von 35":** Fenster
`entry_date BETWEEN current_date - 13 AND current_date`, also 14
Tage. `[cmd]` **Eine erste Messung mit `> current_date - 14` ergab
93 Tage** — die Seed-Daten reichen bis 2026-11-16 in die Zukunft, und
die offene Bedingung fing alles danach mit. **Korrigiert, bevor die
Zahl in den Bericht kam.**

`[read]` **Abgrenzung bei „76 von 138":** an EINEM Tag (2026-08-29),
nicht ueber das Fenster. Der Hinweis steht im Tagebuch und gilt fuer
den gezeigten Tag.

### Was offen bleibt

`[read]` **Sechs Kacheln brauchen eine Entscheidung** — vier im
Diary (Smart suggestions, Nutrition score, Pending actions,
Pre-workout window), zwei in Plans (Today's ghost entries, Lifecycle
types). **Je Kachel: woraus soll die Zahl entstehen?**

`[read]` **„Pending actions" ist der naechstliegende Fall:** `[cmd]`
`coach.pending_actions` existiert. **Aber die Tabelle gehoert dem
Coach-Modul**, und ob das Tagebuch daraus liest, ist eine
Modulgrenze — keine Anbindung.

`[read]` **„7-day compliance" im Plans-Reiter ist anbindbar** und
gehoert in einen eigenen Punkt, zusammen mit den uebrigen fuenf
Plans-Kacheln.

**Nichts erfunden, nichts auf `dev` geschrieben, `/nutrition` nicht
angefasst, nicht committet.**

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen, was der Bericht behauptet.**

`[cmd]` **`nutrition.meal_plans` traegt Zeilen** — der Punkt
behauptete, die Tabelle existiere nicht. `[cmd]`
**`daily_nutrient_summary_long` existiert** und traegt den
Sammelhinweis.

`[read]` **Der Punkt war zu zwei Dritteln ueberholt:** Preferences und
Planner sind gebaut, null Attrappen am Schirm.

### Der Fund ist mein Fehlermuster, zum dritten Mal

`[cmd]` **Der Insights-Reiter zeigte *,,Calorie balance"* und
*,,Macro split"* je zweimal** — oben echt aus `daily_summary`,
darunter als Attrappe mit den Zahlen der Vorlage.

`[read]` **Dieselbe Doppelung, die G-249 im Nutrients-Reiter entfernt
hat, eine Ebene weiter.** `[read]` **Beide Male entstanden, weil ich
den Entwurf fuer den Massstab hielt.** **Jetzt weg: 5 Karten auf 3,
Attrappen 3 auf 1** — und der Entwurf bleibt der Rueckfall, wenn Daten
fehlen.

### G-248 ist besser beantwortet als gefragt

`[cmd]` **Von 35 Zaehlern feuern neun, der Diary-Leseweg laedt neun
andere — Schnittmenge ist `fibt` allein.**

`[read]` **Der bestehende Hinweis nannte einen Naehrstoff und schwieg
ueber acht.** `[read]` **Der Sammelhinweis ist nicht kuerzer, sondern
ehrlicher:** *,,Bei 76 von 138 Naehrstoffen fehlen einzelne
Positionen… welche es betrifft, steht im Reiter Naehrstoffe."*

### Was nicht gebaut wurde, und warum es richtig ist

`[read]` ***,,Micronutrient trend"* haette angebunden werden koennen**
— **aber der Nutrients-Reiter zeigt genau das schon je Naehrstoff,
und eine zweite Fassung daneben waere die Doppelung, die gerade
entfernt wurde.**

`[read]` **Das ist die Nachweiszeile, die ich dreimal uebersehen
habe, angewandt bevor der Fehler entsteht.**

`[cmd]` **Sechs Kacheln brauchen Entscheidungen** — als **G-254**
angelegt. `[cmd]` **G-137 gilt teilweise und heilt beim naechsten
Speichern** — geschlossen. `[cmd]` **G-152 unveraendert offen**,
Codex' Bereich.

### Eine Fehlmessung, vor dem Bericht korrigiert

`[cmd]` **`> current_date - 14` ergab 93 Tage statt 14** — die
Seed-Daten reichen bis November 2026. `[read]` **Eine offene
Datumsgrenze faengt alles Zukuenftige mit.** **Selbst gefunden,
bevor es ein Befund wurde.**

**Abgenommen.**

