---
nr: G-519
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-27
agent: claudecode
beauftragt: 2026-09-29

braucht: [G-511]
kind_von: G-513
entscheidung: E-68

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
  dateien:
    - apps/web/src/app/v2/goals/tab-phase.tsx
    - apps/web/src/app/v2/goals/phase-echt.tsx
    - apps/web/src/app/v2/goals/phase-setzen.tsx
    - apps/web/src/app/v2/goals/phase-editor.tsx
    - apps/web/src/app/v2/goals/phase-aktionen.ts
    - apps/web/src/lib/goals/phase-write.ts

zahlen:
  gemessen: 2026-09-27
  phasenarten_db: 9
  phasenarten_mit_kalorienziel: 2
  spec_dateien_goals: 10
  fat_loss_defizit_moderat: "-400 bis -600"
  fat_loss_defizit_aggressiv: "-750 bis -1000"
---

# G-519 - die Phasenansicht ist gegen die falsche Quelle gebaut

## Der Befund

Tom, 2026-09-27: *,,gleiche mit spec/altes repo und neuem design ab,
das hatten wir schon mal sauber gebaut wie das funktionieren soll,
momentan ist das alles sehr unlogisch aufgebaut."*

`[cmd]` **G-513 hat die FUNKTIONEN richtig angebunden** — Start,
Ende und Vorschlagsantwort sind gegen die Datenbank belegt, die
Sperre bei laufender Phase greift am Schirm. Falsch ist die **FORM**:
drei getrennte Kacheln, ein Zustimmen-Knopf ohne Wirkung, zwei
Handgriffe fuer einen Vorgang.

`[cmd]` **Die Ursache liegt eine Ebene tiefer:** der Ablauf steht in
`docs/specs/Goals/PHASE_MODELS.md`, und der gebaute Stand folgt ihm
nicht. `docs/specs/Goals/` fuehrt **zehn** Spec-Dateien, indexiert in
`README.md`.

## Was die Spec sagt

`[cmd]` **`PHASE_MODELS.md`, 223 Zeilen, je Phase ein eigener
Parametersatz:**

| Phase | Vorgabe |
|---|---|
| FAT_LOSS | zwei Varianten: `moderate` -400 bis -600, `aggressive` -750 bis -1000 |
| LEAN_BULK | `calorie_surplus` 200 bis 400 |
| MAINTENANCE | `calorie_target: "TDEE +/- 100"` |
| REVERSE_DIET | `weekly_calorie_increase` 50 bis 150 — eine Rampe je Woche |
| CONTEST_PREP | Unterphasen nach Wochen: early -300, mid -600, late -750, dann Peak Week |

`[cmd]` **Und eine Zustandsmaschine mit allen Uebergaengen:**
FAT_LOSS -> REVERSE_DIET, LEAN_BULK -> MINI_CUT,
CONTEST_PREP -> PEAK_WEEK -> REVERSE_DIET. Je Phase ein Feld
`transitions_to`. **Das ist der Ablauf, den die Oberflaeche fuehren
muss** — er steht in der Spec, nicht im Mockup.

## Drei Widersprueche zum gebauten Stand

`[cmd]` **1. `variant` ist tragend, nicht schmueckend.** `fat_loss`
allein sagt nichts: moderate und aggressive unterscheiden sich um
350 kcal. Die Spalte hat heute keinen CHECK, und G-513 hat bewusst
keine Auswahlliste gebaut, weil keiner vorlag.

`[cmd]` **2. `protein_g_per_kg` ist phasenabhaengig** — 1.4 bis 2.0
bei MAINTENANCE, 2.3 bis 3.1 bei CONTEST_PREP. `berechne_zielwerte`
rechnet fest `Gewicht x 2` fuer alles. Das ist kein
Schoenheitsfehler, das ist ein Specbruch.

`[cmd]` **3. Zwei Phasen brauchen die Zeit INNERHALB der Phase.**
Reverse Diet rechnet je Woche, Contest Prep je Wochenband. Die
Rechnung hat diese Dimension nicht — deshalb greift ein blosses
`calorie_deficit_kcal` analog zum Ueberschuss zu kurz.

## Die Falle

`[read]` **In `docs/spezifikation/` liegen Vorlagen mit fast
gleichem Namen in verschiedenen Ordnern.** G-310 hat einen ganzen
Auftrag gegen die falsche gebaut und zurueckbauen muessen. Erst die
Quelle bestimmen, dann bauen.

`[cmd]` **Und G-515 hat 28 Widersprueche zwischen den drei
Goals-Mockups gemessen, davon 8 Zahlenkollisionen.** Die Mockups
sind Gestaltung, nicht Ablaufquelle.

## Was aus G-513 stehen bleibt

`[cmd]` **Diese vier sind gegen die Datenbank belegt und werden
nicht ueberschrieben, auch wenn eine Vorlage es huebscher zeigt:**

- **neun Phasenarten** — der CHECK erlaubt neun, die Spec-
  Zustandsmaschine nennt sieben. Die Differenz ist ein Befund, keine
  Rundung.
- **die Sperre, solange eine Phase laeuft** (`23505`) — die
  Oberflaeche weist ab, bevor die Datenbank es muss.
- **der ehrliche Satz am Zustimmen-Knopf** —
  `phase_transition_respond` schreibt nur die Antwort, gewechselt
  wird nichts.
- **`phase_am` liefert auch Beendetes**, wenn `actual_end_date >=
  Stichtag`. Laufend heisst `actual_end_date IS NULL`.

`[read]` **Zeigt die Spec einen echten Wechsel statt
Beenden-dann-Beginnen, ist das ein Befund fuer Codex** — keine Sache,
die die Oberflaeche nachbaut.

## Nachweiszeilen

**A1** — **Lies ZUERST `docs/specs/Goals/README.md`**, er listet die
zehn Spec-Dateien des Moduls. Dann `PHASE_MODELS.md` vollstaendig.
Die Zustandsmaschine dort ist der Ablauf. **Erst danach die
Mockups, und zwar als Gestaltung.** Nenne bei jeder Abweichung Datei
und Zeile. Fuehren mehrere Dateien eine Phasenansicht, meldest du
den Widerspruch, statt ihn still aufzuloesen.

**A2** — **Spec gegen Gebautes, Feld fuer Feld.** Eine Tabelle:
Element / in der Quelle / gebaut / Abweichung mit Grund. Zaehle
Felder, nicht Kacheln — G-407 hat gemessen, dass eine Kachelzahl
bei diesen Vorlagen in beide Richtungen falsch ist.

**A3** — **Die Uebergaenge fuehren.** Je Phase zeigt die Ansicht
die Ziele aus `transitions_to` und nichts sonst. Belegt am Schirm
fuer mindestens drei Phasen.

**A4** — **Das Vorgaengerrepo** `referenz/lumeos-2026/`: welche
STRUKTUR hatte die Phasenfuehrung — eine Ansicht oder mehrere? Wie
lief der Ablauf von ,,keine Phase" bis ,,Phase laeuft"? **Struktur
ja, Code nie.** Und nachsehen, warum es ersetzt wurde.

**A5** — **Neu aufbauen nach der Quelle aus A1.** Jede Abweichung
traegt einen **gemessenen** Grund, keinen vermuteten.

**A6** — **Die sieben Phasenarten ohne Kalorienziel sagen es
selbst.** Nach G-511 liefern nur `maintenance` und `lean_bulk` ein
Ziel; die uebrigen sieben geben `hindernis =
'phasenparameter_fehlt'`. Miss das und schreib es auf den Schirm,
statt neun Arten anzubieten, von denen sieben ins Leere fuehren.
Ein Strich mit Grund, keine Null.

**A7** — **Bilder je Zustand:** keine Phase / Phase laeuft /
Vorschlag offen. Auf `test-user@lumeos.local`, nicht auf `dev`.

**A8** — vier andere Module zeichengleich vorher/nachher,
Testlaeufe gruen, Sabotageprobe je Waechter, nichts committet.

## Bericht

**Claude Code, 2026-09-27.**

### Zuerst: der Auftrag ist BLOCKIERT, und zwar messbar

`[read]` **Die Punktdatei nennt die Abhaengigkeit selbst
(N11 bis N15). Ich habe sie nachgemessen, statt sie zu glauben.**

`[cmd]` **Gegen die laufende Datenbank, 2026-09-27:**

    berechne_zielwerte(p_user_id uuid, p_stichtag date)
      -> nimmt WEITERHIN keine Phase
    Funktionen mit 'phasenparameter_fehlt'      0
    CHECK auf goal_phases.variant               0

`[cmd]` **Und G-511 sagt es selbst**
(`laufend_codex/goals-G-0511-…md:36`): *,,G-511 ist nicht
einspielbar. … Kein SQL aus G-511 wurde live eingespielt."*

`[read]` **Damit ist A6 heute nicht erfuellbar** — er verlangt zu
messen, dass sieben Arten `hindernis = 'phasenparameter_fehlt'`
liefern. **Diesen Wert gibt es nicht.** `[read]` **Und A5
*,,neu aufbauen"* baute gegen eine Rechnung, die sich nach Toms
Entscheidung zu N13 noch einmal aendert.**

`[read]` **Ich habe deshalb A1, A2 und A4 vollstaendig gemessen
und A3/A5/A6/A7 NICHT gebaut.** **Das ist der Auftrag, soweit er
heute ausfuehrbar ist** — eine Ansicht, die ich jetzt baue und in
zwei Tagen zurueckbaue, ist teurer als eine Messung.

---

### A1 — welche Datei gilt, und warum

`[cmd]` **`docs/specs/Goals/README.md:101` weist sie aus:**

    PHASE_MODELS.md | Goal Phase State Machine, alle 7 Phasen,
                      Transition Logic

`[cmd]` **`PHASE_MODELS.md`, 223 Zeilen** — Zustandsmaschine
(`:5-19`), sieben Phasenbloecke (`:23-178`), der
Anpassungsalgorithmus (`:184-208`), die Guard-Tabelle (`:213-223`).

**DIE FALLE AUS G-310, GEPRUEFT:**

`[cmd]` **`PHASE_MODELS.md` liegt FUENFMAL im Repo** — und das ist
genau die Konstellation, an der G-310 gescheitert ist:

    docs/specs/Goals/                                  223 Z.
    docs/BrainstormDocs/Goals/new/                     223 Z.
    docs/spezifikation/…/Theme claude design/uploads/  223 Z.
    docs/spezifikation/…/theme-v1/uploads/             223 Z.
    docs/_archive/…/brainstorm-docs/Goals/new/         223 Z.

`[cmd]` **Alle fuenf byteidentisch** — md5 `6723e4a60082…`,
je 223 Zeilen. `[read]` **Kein Widerspruch. Die Falle schnappt
hier nicht zu, aber sie war da** — **ohne den Abgleich haette ich
es nicht gewusst.**

`[read]` **Die Mockups sind damit Gestaltung, nicht Ablaufquelle**
— wie die Punktdatei sagt, und wie G-515 mit 28 Widerspruechen
belegt hat.

### A2 — Spec gegen Gebautes, Feld fuer Feld

`[read]` **Felder gezaehlt, nicht Kacheln** (G-407).

| Element | in `PHASE_MODELS.md` | gebaut | Abweichung |
|---|---|---|---|
| Phasenarten | 7 (`:23-178`) | 9 (`phase-regeln.ts:25-35`) | **+2**: `mini_cut`, `peak_week` stehen im CHECK und in der Zustandsmaschine (`:12`), haben aber KEINEN eigenen Parametersatz |
| `transitions_to` je Phase | 7x vorhanden (`:47,67,81,104,137,157`) | **fehlt ganz** | die Ansicht bietet alle 9 immer an |
| `variant` | tragend: `moderate`/`aggressive` bei FAT_LOSS, 350 kcal Unterschied (`:27,35`) | freies Textfeld (`phase-setzen.tsx:219`) | keine Auswahlliste — G-513 hat bewusst keine gebaut, weil kein CHECK vorlag |
| `calorie_deficit`/`_surplus` | je Phase eine Spanne (`:28,36,57`) | **wird nicht geschrieben** | `parameters` bleibt leer (G-513, bis G-511 den Schluessel entscheidet) |
| `protein_g_per_kg` | je Phase eine Spanne (`:30,38,59,78,121,154`) | `berechne_zielwerte` rechnet fest `Gewicht x 2` | **Specbruch**, gehoert zu G-511/N14 |
| `max_duration_weeks` | 20 / 8 / 52 / 16 (`:32,39,61,94`) | `projected_end_date` frei waehlbar | keine Vorgabe je Phase |
| `guards` | 3 bis 3 je Phase, plus Gesamttabelle (`:42,62,100,132,213-223`) | **fehlt ganz** | kein Lauf wertet sie aus |
| `sub_phases` (CONTEST_PREP) | 4 Baender nach Wochen (`:115-120`) | **fehlt ganz** | die Rechnung hat keine Zeitdimension |
| `diet_break` / `refeeds` | `:33,40,122-126` | **fehlt ganz** | — |
| Anpassungsalgorithmus | `weeklyAdjustment()` (`:184-208`) | **fehlt ganz** | die Kachel `Weekly auto-adjustment` traegt weiter ihre Marke |

`[cmd]` **Gebaut sind 4 Eingabefelder** (`start`, `ende`,
`variante`, `grund`) **gegen mindestens 9 Feldgruppen der Spec.**

### A4 — das Vorgaengerrepo: EINE Ansicht, zwei Stufen

`[cmd]` **`src/modules/goals/components/nutrition/GoalSelector.tsx`,
248 Zeilen** — **eine Ansicht, nicht drei.**

**Die Struktur, Zeile fuer Zeile belegt:**

    :27  advancedMode          ein Schalter, zwei Stufen
    :31  simpleGoals           tier === 'simple' zuerst
    :18-24  TABS               fuenf Kategorien:
                               Fat Loss · Aufbau · Hybrid ·
                               Contest · Expert
    :33-42  getGoalsForTab     je Reiter nur tier==='advanced'
    :135 isGoalAvailable(goal, profile)
                               je Ziel gegen das Profil gepruef
    :51  „Waehle ein Ziel passend zu deiner aktuellen Phase"

`[read]` **Der Ablauf von *keine Phase* bis *Phase laeuft* ging
ueber ZWEI Schritte:** **Auswahl** (`GoalSelector`) **und
Einrichtung** (`GoalSetupDialog`, 162 Zeilen).

`[cmd]` **Und der Einrichtungsdialog beantwortet genau die Frage,
die G-511/N13 offen hat** — *,,welcher Wert innerhalb der
Spanne?"*:

    :76-86   ein SCHIEBER fuer die TDEE-Anpassung,
             min -40 / max +30 / Schritt 5,
             daneben live „Ziel-Kalorien: N kcal/Tag"
    :93-105  die Makros werden daraus GERECHNET und
             bleiben einzeln ueberschreibbar
    :127-131 eine Warnungs-Bestaetigung zum Ankreuzen
    :138-142 „coachApproved" als eigenes Haekchen

`[read]` **Der Nutzer waehlt den Wert selbst, innerhalb einer
Spanne, mit sofort sichtbarer Wirkung.** `[read]` **Das ist
Struktur, kein Code** — **und es ist ein belegter Vorschlag fuer
N13, kein erfundener.**

**WIDERSPRUCH, den ich nicht aufloese:**

`[cmd]` **Das Altrepo rechnet PROZENTUAL** (`tdee_modifier`,
−40 % bis +30 %, `:80`). `[cmd]` **Die Spec nennt ABSOLUTE
Kilokalorien** (−400 bis −600, `:28`). `[read]` **Zwei Modelle
fuer dieselbe Groesse** — **das gehoert zu Toms N13-Entscheidung,
nicht in meine Ansicht.**

`[cmd]` **Warum es ersetzt wurde:** nicht belegbar. **Ich habe
keine Datei gefunden, die den Grund nennt** — weder ein ADR noch
eine Notiz im Altrepo.

### Ein Befund aus den Daten, der zu N12 gehoert

`[cmd]` **Die fuenf lebenden `variant`-Werte passen NICHT zur
Spec:**

    lean_bulk   | moderate                  (2x)
    maintenance | baseline                  (2x)
    maintenance | performance_placeholder   (1x)

`[cmd]` **`PHASE_MODELS.md` kennt `moderate` und `aggressive` nur
fuer FAT_LOSS** (`:27,35`). `[read]` **`lean_bulk/moderate` ist im
Sinne der Spec kein gueltiger Wert** — **und `baseline` sowie
`performance_placeholder` kommen dort ueberhaupt nicht vor.**

`[read]` **Wer den N12-CHECK schreibt, muss diese drei Werte
zuerst einordnen** — sonst faellt das Seed beim Einspielen.

### Was NICHT gebaut wurde, und warum

    A3  Uebergaenge fuehren   braucht transitions_to in der
                              Oberflaeche -- sinnvoll erst, wenn
                              feststeht, welche Phasen ueberhaupt
                              ein Ziel liefern (N11)
    A5  neu aufbauen          baute gegen eine Rechnung, die nach
                              Toms N13-Entscheidung anders aussieht
    A6  sieben Arten ohne
        Kalorienziel          `phasenparameter_fehlt` gibt es
                              nicht -- 0 Funktionen nennen es
    A7  Bilder je Zustand     ein Bild eines Zustands, den es
                              danach nicht mehr gibt, belegt nichts

`[read]` **A3 laesst sich teilweise VORZIEHEN:** `transitions_to`
steht in der Spec und haengt nicht an G-511. `[read]` **Aber es
in eine Ansicht zu bauen, die A5 danach neu aufbaut, waere
doppelte Arbeit.**

### A8 — Abgrenzung

`[cmd]` **Nichts geaendert ausser dieser Punktdatei.** `[cmd]`
**`git status` in `apps/`: nur die drei `next.config.js` aus
G-518.**

`[cmd]` **Nichts committet. Nichts in `supabase/`.**

### Was ich brauche, um weiterzumachen

`[read]` **Drei Entscheidungen, alle bei Tom, alle in G-511
benannt:**

**1** — **N13: Spanne zu Zahl.** `[cmd]` **Das Altrepo schlaegt
einen Schieber vor** (`GoalSetupDialog.tsx:76-86`) — **prozentual.**
**Die Spec nennt Kilokalorien.** **Welches Modell gilt?**

**2** — **N12: der `variant`-CHECK**, und was aus den drei
lebenden Werten wird, die die Spec nicht kennt.

**3** — **N11: die zwei Arten ohne Parametersatz** (`mini_cut`,
`peak_week`) — **im CHECK und in der Zustandsmaschine, aber ohne
eigenen Block in `PHASE_MODELS.md`.**

`[read]` **Danach ist A3 und A5 bis A7 in einem Zug baubar** — die
Messung dafuer liegt jetzt vor.

## Nachtrag 2026-09-28 — A3 gebaut, aber nur als REGEL

`[read]` **Mein eigener Einwand aus dem Bericht oben galt der
ANSICHT, nicht der Regel.** `[cmd]` **`phase-regeln.ts` hat kein
Server-I/O und ueberlebt, waehrend die Ansicht wechselt** — **dort
liegt die Regel jetzt bereit, die A5 spaeter ruft.**

### B1 — `transitions_to` als Daten, gegen die Spec gemessen

`[cmd]` **Nicht aus G-528 abgeschrieben, sondern gegen
`docs/specs/Goals/PHASE_MODELS.md` selbst geprueft** — die sechs
Zeilen stimmen ueberein:

    :53   fat_loss      -> reverse_diet, maintenance, lean_bulk
    :73   lean_bulk     -> mini_cut, maintenance, contest_prep
    :87   maintenance   -> fat_loss, lean_bulk, recomp, contest_prep
    :110  reverse_diet  -> maintenance, lean_bulk, fat_loss
    :143  contest_prep  -> reverse_diet
    :163  recomp        -> lean_bulk, fat_loss

`[cmd]` **Drei Arten haben KEIN `transitions_to`:** `mini_cut`,
`peak_week`, `expert_bb_annual`.

### B2 — die reine Funktion, mit Grenze von beiden Seiten

`[cmd]` **`erlaubteFolgephasen(laufend)` und
`uebergangErlaubt(laufend, ziel)`** — rein, ohne Datenbank.

`[cmd]` **Je Phase ein PAAR geprueft:** ein Ziel, das die Spec
nennt (muss gruen sein) **und eines, das sie nicht nennt** (muss
rot sein).

`[read]` **Ohne die zweite Haelfte bliebe die Probe gruen, wenn
die Funktion einfach alles durchliesse** — genau die Klasse, die
in G-518 der alte Waechter hatte.

`[cmd]` **Und die Erwartung steht im Test AUSGESCHRIEBEN**, nicht
aus `UEBERGAENGE` abgeleitet — **sonst prueft sich die Tabelle
gegen sich selbst.**

### B3 — `mini_cut` ist abgeleitet, und so gekennzeichnet

`[cmd]` **`[annahme]` im Quelltext, nicht `[cmd]`:**

    mini_cut: ['lean_bulk', 'maintenance']

`[read]` **Nach G-528: NICHT `reverse_diet`** — vier Wochen
unterdruecken nichts, was hochgefahren werden muesste. **Ein
eigener Testfall haelt genau das fest.**

`[cmd]` **`peak_week` und `expert_bb_annual` bleiben LEER** — und
stehen in `UEBERGANG_UNBEKANNT`. `[read]` **Damit laesst sich
*,,leer, weil nicht entschieden"* von *,,leer, weil es keine
gibt"* unterscheiden** — ohne das sieht ein Aufrufer nur ein
leeres Array.

`[read]` **`mini_cut` steht NICHT in `UEBERGANG_UNBEKANNT`** — es
hat eine begruendete Ableitung.

### B4 — die Ansicht ist unberuehrt

`[cmd]` **`git diff apps/web/src/app/v2/goals/`: leer.**

`[cmd]` **Am Schirm gemessen** (`schuss.mjs`,
`test-user@lumeos.local`, `/v2/goals?tab=phase`):

    [data-phasenwahl]   9     unveraendert alle neun
    „Phase beginnen"    1
    konsolenfehler      1     (die data-mode-Warnung, nicht meine)

`[read]` **Die Regel liegt bereit, die Ansicht ruft sie spaeter.**

### Die Pruefung

`[cmd]` **`__tests__/g519-uebergaenge.test.ts`, 18 Zusicherungen,
alle gruen.**

`[cmd]` **Sabotageprobe:**

    fat_loss -> contest_prep erfunden  -> 2 und 8  ROT
    mini_cut -> reverse_diet erlaubt   -> 14       ROT
    zurueck                            -> 18/18    GRUEN

`[cmd]` **Zwei weitere Zusicherungen, die keine Sabotage
brauchten:** kein Ziel ausserhalb der neun Arten, und keine Phase
zeigt auf sich selbst.

### Was WEITERHIN blockiert bleibt

`[read]` **A5 bis A8** — das Eingabefeld ist genau das, was sich
mit G-529 aendert (die gespeicherte Groesse ist die RATE in
Prozent KG/Woche, nicht ein Kaloriendelta).

`[cmd]` **N13 ist NICHT mehr der Blocker** — entschieden am
2026-09-28 (kcal und Prozent beide anzeigen). `[cmd]` **Der
Blocker ist G-529/A1**, das Codex misst.

## Abhaengigkeit

`[read]` **Blockiert durch die G-511-Nacharbeit (N11 bis N15).**
Solange nicht entschieden ist, welche Parameter je Phase gelten und
ob der Schreibweg ohne aktive Phase faellt, baut diese Ansicht gegen
eine Rechnung, die sich danach noch einmal aendert.

`[cmd]` **Der Bildnachweis setzt G-518 voraus** — erledigt, der
Dev-Server liefert wieder aus.

## Stand 2026-09-28

`[cmd]` **A1 bis A4 gemessen und abgenommen. A3 zur Haelfte gebaut**
und in `0483f080` committet: `transitions_to` liegt als REGEL in
`apps/web/src/lib/goals/phase-regeln.ts`, mit einer reinen Funktion
und einem Test, der die Grenze von beiden Seiten trifft.
`mini_cut` traegt `[annahme]`, `peak_week` und `expert_bb_annual`
stehen in `UEBERGANG_UNBEKANNT` — damit ist ,,leer weil
unentschieden" von ,,leer weil Ende" unterscheidbar.

`[cmd]` **Die ANSICHT ist unberuehrt** (`git diff` auf
`v2/goals/` leer), am Schirm weiterhin neun Arten.

`[read]` **A5 bis A8 haengen an G-529 A5** — nicht mehr an N13, das
ist entschieden. Das Eingabefeld fuehrt die RATE, die kcal laufen
daneben mit. Sobald die Spalte
`goals.goal_phases.zielrate_pct_kg_woche` steht, ist der Rest in
einem Zug baubar.

## Auftrag A5 bis A8 - Claude Code, raus 2026-09-29, 08:00

**Nachgetragen 08:15.** Dieser Auftrag ging als Text im Gespraech raus,
nicht in dieser Datei — gegen `00-LIESMICH.md:22-41`. Er steht hier
nach, damit Auftrag, Bericht und Befund in EINER Datei liegen (A-81 A2).

    Bereich: apps/web/src/app/v2/goals/, apps/web/src/lib/goals/,
             apps/web/src/lib/profile/
    Fremd:   supabase/ (Codex baut dort G-514) ·
             packages/scoring/ (der Vertrag ist fertig) ·
             docs/ (Orchestrator)

### Die Sperre ist weg - gemessen

`[cmd]` **Gegen die laufende Datenbank, 2026-09-29:**

    goal_phases.zielrate_pct_kg_woche          da
    nutrition_targets.tdee_herkunft            da
    nutrition_targets.tdee_history_id          da
    goals.phase_rate_rules                     da, aber LEER
    goals.tdee_history                         da
    Kalorienspalten auf goal_phases             0   (richtig, E1)

`[cmd]` **Codex hat die vier Migrationen einzeln eingespielt und
registriert** (C-554, `71dfc23d`). Register jetzt 21 Eintraege.

### Welche Regeln vorliegen - und welche nicht

`[cmd]` **Die Aussengrenze als CHECK
`goal_phases_zielrate_aussengrenze`:** `NULL` oder `>= -2.5 AND <= 1.5`.

`[cmd]` **Die Vorzeichenregel als CHECK
`goal_phases_zielrate_passt_zur_art`:**

    fat_loss, mini_cut                        NOT NULL und < 0
    lean_bulk                                 NOT NULL und > 0
    maintenance                               NULL oder |x| <= 0.1
    peak_week, expert_bb_annual,
    contest_prep, reverse_diet, recomp        NULL

`[cmd]` **Dieser CHECK ist `NOT VALID`** — Bestandszeilen sind nicht
geprueft, neue und geaenderte schon.

`[cmd]` **Und `goals.phase_rate_rules` ist LEER, null Zeilen.** Die
Baender je Variante existieren nicht als Daten; sie warten auf G-521 A1,
weil vier tragende Zahlen keinen Seitenbeleg haben. **Das Feld liest die
Tabelle, und wo sie leer ist, sagt es das — ein Strich mit Grund, keine
erfundene Spanne und keine aus der Spec abgetippte Zahl.**

### A5 - das Feld

Die Eingabe ist die Rate in % Koerpergewicht pro Woche; sie ist die
gespeicherte Groesse (E1). Daneben steht kcal/Tag, immer beide (N13):

    kcal/Tag = 11 x Rate(% KG/Woche) x Gewicht(kg)

`[cmd]` **Aus 7700 kcal je kg, nachgerechnet:** 45 kg bei -1,0 %/Woche
gibt -495, 120 kg gibt -1320, 80 kg bei +0,25 % gibt +220.

Das Gewicht kommt aus `nutrition_targets.body_weight_kg` beziehungsweise
`public.profiles` — nicht geraten. Fehlt es, fehlt die kcal-Anzeige, mit
Grund.

### A6 - die sieben Arten sagen es selbst

`[cmd]` **`goals.berechne_zielwerte(p_user_id uuid, p_stichtag date)`
nimmt KEINE Phase als Argument — sie liest sie selbst. Und ihr
Quelltext enthaelt `phasenparameter_fehlt`** (gemessen ueber
`pg_proc.prosrc`). Miss, welche Arten diesen Wert liefern, und schreib
es auf den Schirm.

### A7 - Bilder je Zustand

keine Phase / Phase laeuft / Vorschlag offen. Auf
`test-user@lumeos.local`, NICHT auf `dev`. Mit `tools/schuss.mjs`.
Nie `.next` loeschen, nie `next build` direkt.

### A8 - die Grenze

Vier andere Module zeichengleich vorher/nachher, Testlaeufe gruen,
Sabotageprobe je Waechter in beide Richtungen belegt.

### Nicht anfassen

`phase_rate_rules` fuellen (Codex, haengt an G-521 A1) · den CHECK auf
`VALID` setzen (Codex) · `packages/scoring/src/beitrag.ts` (fertig,
36/36) · die Attrappen im `cross`-Reiter (warten auf G-514; die Marken
in `tab-phase.tsx:585-703` nennen Quelle und Grund und bleiben).

Nichts committen, nichts pushen.

## A5 bis A8 — gebaut, 2026-09-29

### Die Sperre ist weg — selbst nachgemessen

    goal_phases.zielrate_pct_kg_woche   numeric        da
    goals.phase_rate_rules              0 Zeilen       LEER
    zielrate_aussengrenze               validated: t   >= -2.5, <= 1.5
    zielrate_passt_zur_art              validated: f   NOT VALID

### DER BEFUND, DER DEN BAU GEFORMT HAT

`[cmd]` **`goal_phase_start` hat SECHS Parameter und KEINEN fuer
die Rate:**

    p_phase_type, p_gueltig_ab, p_goal_id,
    p_projected_end_date, p_variant, p_parameters

`[cmd]` **Der CHECK verlangt sie fuer `fat_loss`, `lean_bulk` und
`mini_cut` aber NOT NULL.** `[cmd]` **Folge, dreimal gemessen:**

    goal_phase_start('fat_loss','2026-09-29')
      -> ERROR: new row for relation "goal_phases" violates check
         constraint "goal_phases_zielrate_passt_zur_art"

`[read]` **Diese drei Arten sind ueber die Funktion NICHT
anlegbar.** `[cmd]` **Per INSERT mit Rate geht es** (`INSERT 0 1`),
und `goal_phases_insert` erlaubt es dem Eigentuemer.

`[cmd]` **Deshalb ein zweigeteilter Schreibweg:** ohne Rate die
Funktion (sie traegt die 23505-Sperre), mit Rate ein INSERT mit
vorheriger Sperrpruefung. `[read]` **Kein gleichwertiger Ersatz** —
zwischen Frage und Schreiben liegt ein Augenblick. **Bei einer
Formulareingabe hinnehmbar, im Quelltext begruendet.**

`[read]` **Ein Rate-Parameter an `goal_phase_start` ist der saubere
Weg — Befund fuer Codex, nichts, was die Oberflaeche in
`supabase/` behebt.**

### A5 — das Feld

`[cmd]` **Die Rate ist die gespeicherte Groesse** (E1), das
Kaloriendelta die Ableitung. **Beide stehen da** (N13).

`[cmd]` **Die Formel gegen `goals.kcal_delta_aus_zielrate`
nachgerechnet — VIER von vier gleich:**

    -1,0 % / 45 kg     -> -495,0
    -1,0 % / 120 kg    -> -1320,0
    +0,25 % / 80 kg    -> +220,0
    -0,5 % / 81,4 kg   -> -447,7

`[read]` **Die Datenbank hat die Formel schon** — die Anzeige
rechnet sie mit, damit der Nutzer beim Tippen sieht, was es
bedeutet. **Wer sie BELEGEN will, nimmt die Datenbankfunktion.**

`[cmd]` **Das Gewicht kommt aus `public.profiles.body_weight_kg`,
durchgereicht ueber `echt.profil`** — nicht geraten. `[cmd]`
**Fehlt es, faellt die kcal-Anzeige weg, mit Grund.**

**DAS BAND: es gibt KEINS, und das Feld sagt das.**

`[cmd]` **`goals.phase_rate_rules` hat 0 Zeilen.** `[cmd]` **Das
Feld zeigt:**

    Ein empfohlenes Band je Variante gibt es noch nicht —
    goals.phase_rate_rules ist leer. Es haengt an G-521. Bis dahin
    begrenzen nur die Aussengrenze (-2.5 bis 1.5) und das
    Vorzeichen.

`[read]` **Keine erfundene Spanne, keine aus der Spec abgetippte
Zahl.**

### A6 — die Arten sagen es selbst

`[cmd]` **Der Rumpf von `berechne_zielwerte`, gelesen:**

    WHEN m.phase_id IS NULL THEN 'keine_aktive_phase'
    WHEN cardinality(m.fehlende_felder) > 0 THEN 'profil_unvollstaendig'
    WHEN m.zielrate_pct_kg_woche IS NULL THEN 'phasenparameter_fehlt'

`[cmd]` **Je Art gemessen, auf `test-user`:**

    maintenance        rate 0,0    -> (kein Hindernis) kcal 2753,6
    recomp             NULL        -> phasenparameter_fehlt
    contest_prep       NULL        -> phasenparameter_fehlt
    reverse_diet       NULL        -> phasenparameter_fehlt
    expert_bb_annual   NULL        -> phasenparameter_fehlt
    peak_week          NULL        -> phasenparameter_fehlt
    fat_loss/lean_bulk/mini_cut    -> ueber die Funktion NICHT
                                      anlegbar (siehe oben)

`[read]` **FUENF Arten fuehren ins Leere, nicht sieben** — die
anderen vier tragen eine Rate und liefern ein Ziel. `[cmd]` **Das
Feld sagt es je Art**, statt neun anzubieten und zu schweigen.

### A7 — drei Bilder, auf test-user

    x-g519-1-keine-phase.png    Rate -0,5 eingetippt
                                Anzeige: „Das sind -447.7 kcal/Tag
                                bei 81.4 kg."
    x-g519-2-ohne-rate.png      peak_week: „traegt keine Zielrate —
                                der CHECK verlangt hier NULL"
    x-g519-3-phase-laeuft.png   Beenden-Kachel und Wechselvorschlag
                                da, Raster gesperrt

`[cmd]` **Die Phase wurde ueber die OBERFLAECHE geschrieben:**

    fat_loss | 2026-09-29 | -0.500 | (laeuft)
    berechne_zielwerte -> (kein Hindernis), kcal 2305,9

`[read]` **Genau die Art, die vor diesem Auftrag nicht anlegbar
war.** `[cmd]` **Danach geloescht, `test-user` hat wieder 0
Phasen.**

`[cmd]` **1 Konsolenfehler** — die bekannte `data-mode`-Warnung.

### A8 — die Grenze

`[cmd]` **`git status` in `apps/web/src/app/v2/`: nur `goals`.**
`[cmd]` **21 Zusicherungen gruen.**

**Sabotageprobe, vier Eingriffe, je von ihrer eigenen gefangen:**

    Aussengrenze -2.5 -> -3.0      Zusicherung 1 und 16   ROT
    kcal-Formel 11 -> 10           17 bis 20              ROT
    mini_cut 'negativ' -> 'keine'  3                      ROT
    Vorzeichenpruefung weg         12                     ROT
    zurueckgestellt                21 von 21   byteidentisch GRUEN

`[cmd]` **`pnpm gate` 18 von 18 GRUEN.** `[cmd]` **Nichts in
`supabase/`, nichts committet.**
