---
nr: G-534
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: claudecode
beauftragt: 2026-09-29
erledigt: 2026-09-29
commit: 6dd3932b

braucht: [G-520, G-533]
kind_von: G-519
entscheidung: E-68

quellen:
  - docs/ssot/116-goals-anbindung.md
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - apps/web/src/app/v2/goals/phase-echt.tsx
    - apps/web/src/app/v2/goals/phase-setzen.tsx
    - apps/web/src/app/v2/goals/ansicht.tsx

zahlen:
  gemessen: 2026-09-29
  kacheln_im_reiter: 6
  davon_mit_erklaerabsatz: 5
  planungsgroessen_sichtbar: 0
---

# G-534 - der Phase-Reiter zeigt Daten und plant nichts

## Der Anlass, in Toms Worten

`[read]` **Tom, 2026-09-29**, nach dem gerenderten Reiter: *,,phase
engine ist so nicht brauchbar, fernab von allen definitionen wie sowas
aussehen soll und wie man damit planen soll"* und *,,nicht mal
annaehernd wie das mockup als vorlage ohne funktionen aussieht. also
erzaehl mir nicht das sei umgesetzt."*

`[read]` **Der Orchestrator hatte kurz davor gemeldet, sieben von zehn
Reitern seien echt** — gezaehlt wurde, ob eine Kachel eine echte Quelle
liest. **Das ist der falsche Massstab.** Ein Reiter, der die richtige
Zeile laedt und nichts damit tun laesst, ist nicht umgesetzt.

## Was der Reiter heute zeigt

`[read]` **Sechs Kacheln, und fuenf von ihnen enden mit einem Absatz
darueber, was die Tabelle NICHT kann:**

    Phasenkopf         ,,Woche und Tage sind ... gerechnet, nicht
                       gespeichert - goal_phases fuehrt weder Woche
                       noch Fortschritt."
    Phasenwechsel      ,,recommended_next ist ein gespeicherter Text,
                       keine Ableitung aus dem Verlauf."
    Phase parameters   ,,Aus parameters, einem freien JSON-Feld -
                       gezeigt wird, was drinsteht."
    Zeile              ,,phase_am() waehlt die Zeile, deren gueltig_ab
                       am Stichtag erreicht ..."
    Phase beginnen     ,,parameters bleibt leer. Der Kalorienzuschlag
                       je Phase gehoert hinein (G-511) ..."

`[read]` **Diese Saetze sind richtig und gehoeren nicht auf den
Schirm.** Sie erklaeren dem Nutzer unser Schema.

## Die Unterscheidung, die dabei verlorenging

`[cmd]` **E-68 und G-365 verlangen, dass Unangebundenes SICHTBAR
bleibt** — nach Toms Satz vom 2026-09-07: *,,nun sehe ich dass
tonnenweise zeugs einfach weg ist aus der ui."* `[cmd]` **Die Form
dafuer steht in `ansicht.tsx:106`:**

    attrappeAus(quelle, wartet) -> "Attrappe - {quelle} · wartet auf: {wartet}"

`[read]` **Eine Marke ist EINE Zeile: Quelle und Grund.** Ein Absatz
ueber fehlende Spalten ist keine Marke, sondern eine Entwicklernotiz.
**Der Unterschied ist an keiner Stelle festgehalten, und deshalb ist er
verschwommen.**

`[read]` **Die Regel aus GO-16 gilt weiter:** *,,Das Mockup ist die
Vorgabe. Es bekommt echte Daten. Was nicht aus den Daten kommt, wird
gemeldet, nicht ersetzt."* **,,Gemeldet" heisst an uns, in den Punkt —
nicht als Fliesstext an den Nutzer.**

## Was zum Planen fehlt

`[cmd]` **`PHASE_MODELS.md` fuehrt je Phasenart feste Felder** —
Defizit beziehungsweise Rate, Protein, Hoechstdauer. `[cmd]` **Der
Reiter zeigt stattdessen den JSON-Inhalt:** ,,Source GO-07 testdata ·
Calorie surplus kcal 250".

`[cmd]` **Und `calorie_surplus_kcal` ist die von E1 verworfene
Groesse.** Die laufenden Zeilen tragen `zielrate_pct_kg_woche = NULL`
(G-533). **Solange die Daten vor E1 sind, kann kein Feld die Rate
zeigen** — deshalb haengt dieser Punkt an G-533.

`[cmd]` **Der Entwurf fuehrt beim Wechselvorschlag einen Zeitpunkt
(,,in 4 Wochen") und eine Konfidenz** (`116-goals-anbindung.md`).
Beides hat heute keine Spalte. `[read]` **Der Zeitpunkt ist rechenbar,
sobald die Hoechstdauer als Funktion der Rate existiert** (G-529 A3);
**die Konfidenz ist eine Entscheidung, keine Rechnung.**

`[cmd]` **Zwei von drei laufenden Phasen sind ueber ihr geplantes
Ende, die aelteste um 73 Tage** (G-533). `[read]` **Der Reiter nennt
das als Tatsache.** Ein Planungswerkzeug macht daraus einen offenen
Posten mit einer Handlung daneben.

## Nachweiszeilen

**A1** — **Die Erklaerabsaetze verlassen den Schirm.** Was ueber unser
Schema gesagt werden muss, steht im Punkt. **Was am Reiter bleibt, ist
die Marke nach `attrappeAus()`: eine Zeile, Quelle und Grund.**
`[read]` **Nichts wird geloescht, was E-68 sichtbar haben will** — die
markierten Kacheln bleiben, ihre Fussnoten gehen.

**A2** — **Je Phasenart die festen Felder aus `PHASE_MODELS.md`
anzeigen**, nicht den JSON-Inhalt: Rate, Hoechstdauer, Protein. **Wo ein
Wert fehlt, steht ein Strich mit Grund** — nicht die Rohform und nicht
eine erfundene Zahl. `[cmd]` Die Bänder je Variante gibt es noch nicht
(`goals.phase_rate_rules` 0 Zeilen, haengt an G-521 A1); **das ist der
Grund, der am Strich steht.**

**A3** — **Die ueberzogene Phase wird ein Posten, nicht ein Satz.**
,,73 Tage ueber dem geplanten Ende" gehoert nach oben, mit dem Weg zum
Beenden oder Verlaengern daneben. `[read]` **Keine Bewertung des
Nutzers** — C-108/F-02 und E-74 gelten; es ist eine Aussage ueber die
PHASE, nicht ueber ihn.

**A4** — **Der Wechselvorschlag muss annehmbar sein.** `[cmd]` Heute
antwortet ,,Annehmen" mit `phase_transition_respond: Anmeldung
erforderlich`. **Die Ursache liegt in `supabase/` und ist G-533 A1** —
dieser Punkt baut die Oberflaeche dazu, sobald die Funktion erreichbar
ist, und baut KEINEN zweiten Umweg wie den aus G-519.

**A5** — **Gegen das Mockup halten, Kachel fuer Kachel.** `[cmd]` Die
Vorlage liegt in drei Dateien mit 136 KB
(`module-goals-pro.jsx`, `module-goals.jsx`, `module-goals-editor.jsx`,
laut `docs/spezifikation/00-QUELLEN.md`), die Referenzansicht daneben in
`tab-phase.tsx`. **Was der Entwurf zeigt und wir nicht, wird gelistet —
im Bericht, mit Zeilennummer.** `[read]` **Das ist die Liste, aus der
die naechsten Auftraege kommen.**

**A6** — Vier andere Module zeichengleich, Testlaeufe gruen,
Sabotageprobe je Waechter in beide Richtungen. Nachweise auf
`test-user@lumeos.local`. `pnpm gate` gruen. Nichts committen.

## Was dieser Punkt NICHT tut

`[read]` **Er baut die Regeln nicht** — `weeklyAdjustment` und die
sieben Waechter sind G-520 und laufen gerade. **Dieser Punkt ist die
Oberflaeche dazu.**

`[read]` **Er aendert kein Schema und keine Funktion.** Rate-Parameter
(G-531), Datennachzug (G-533) und Hoechstdauer (G-529 A3) liegen bei
Codex.

---

## Vorbereiteter Auftrag - Claude Code, geschrieben 2026-09-29, 09:40

**Noch nicht raus.** Geht raus, wenn G-520 zurueck ist — dieselbe
Dateien, und A2 braucht ausserdem G-533 bei Codex.

    Bereich: apps/web/src/app/v2/goals/, apps/web/src/lib/goals/
    Fremd:   supabase/ (Codex: G-531, dann G-533) · docs/ (Orchestrator)

**Der Auftrag sind A1 bis A6 oben.** A1 und A5 sind ohne Codex
machbar und gehen zuerst: die Fussnoten runter, und die Liste
,,was zeigt der Entwurf, was wir nicht" — **die ist das, was der
Orchestrator bisher nicht geliefert hat.**

## Umfang, nach Toms Anweisung vom 2026-09-29, 09:33

`[read]` **Tom:** *,,lass das endlich mal richtig umsetzen dass ich sehe
was ich fordere und physique oder pose interessiert mich noch nicht wenn
wir nicht mal in der lage sind grundlagen in der ui darzustellen sprich
bedienbar zu machen."*

`[read]` **Damit ist dieser Punkt der wichtigste offene im Modul**, und
er wartet nicht auf alles:

    A1  Fussnoten runter, Marken bleiben        braucht NICHTS
    A5  gegen das Mockup halten, Liste          braucht NICHTS
    A3  ueberzogene Phase als Posten            braucht NICHTS
    A2  feste Felder je Phasenart               braucht G-533 (Daten nach E1)
    A4  Wechselvorschlag annehmbar              braucht G-533 A1 (Anmeldung)

`[read]` **A1, A5 und A3 sind drei Viertel des sichtbaren Ergebnisses und
haengen an keinem Agenten.** Sie gehen zuerst, und zwar vollstaendig —
nicht als Vorarbeit, sondern als das, was Tom auf dem Schirm sieht.

`[cmd]` **Was NICHT in diesem Auftrag steckt und auch nicht danach
kommt, bis Tom es sagt:** Physique ratios, Pose sessions, C-494. **Sie
sind geparkt** (G-532).

`[read]` **Und der Massstab fuer ,,fertig" ist nicht ,,liest eine echte
Quelle", sondern: kann Tom damit eine Phase planen, laufen lassen,
wechseln und beenden, ohne dass ein Satz ueber unser Schema dabei
steht.**

## Bericht

**Claude Code, 2026-09-29.**

### Was gebaut ist, was blockiert bleibt

    A1  Fussnoten runter              GEBAUT
    A3  ueberzogene Phase als Posten  GEBAUT
    A5  gegen das Mockup halten       GEMESSEN, Liste unten
    A2  feste Felder je Phasenart     BLOCKIERT (G-533)
    A4  Wechselvorschlag annehmbar    BLOCKIERT (G-533 A1)

`[cmd]` **Beide Sperren selbst nachgemessen, 2026-09-29:** alle drei
laufenden Phasen tragen `zielrate_pct_kg_woche = NULL`, und
`goal_phase_start`, `goal_phase_end`, `phase_transition_respond` sind
weiterhin `SECURITY INVOKER` (`prosecdef = f`).

### A1 - die Fussnoten sind runter

`[cmd]` **Fuenf Erklaerabsaetze entfernt. Was darin stand und stimmt,
steht jetzt hier:**

**1** - *,,Woche und Tage sind gerechnet, nicht gespeichert -
`goal_phases` fuehrt weder Woche noch Fortschritt."* `[read]`
**Richtig.** Beide Zahlen kommen aus `gueltig_ab` und
`projected_end_date` gegen den Stichtag.

**2** - *,,`recommended_next` ist ein gespeicherter Text, keine
Ableitung aus dem Verlauf. Der Entwurf zeigt daneben einen Zeitpunkt
und eine Konfidenz - beides hat keine Spalte."* `[read]` **Richtig,
und es bleibt der Stand** (siehe A5).

**3** - *,,Aus `parameters`, einem freien JSON-Feld - gezeigt wird,
was drinsteht. Der Entwurf fuehrt hier feste Felder je Phasenart."*
`[read]` **Richtig - das ist A2 und haengt an G-533.**

**4** - *,,`phase_am()` waehlt die Zeile, deren `gueltig_ab` am
Stichtag erreicht und deren Ende noch nicht ueberschritten ist."*
`[read]` **Richtig, aber reine Innensicht.**

**5** - *,,`parameters` bleibt leer. Der Kalorienzuschlag je Phase
gehoert hinein (G-511)."* `[read]` **Ueberholt seit G-519:** die Rate
wird geschrieben, `parameters` ist nicht mehr der Ort.

`[cmd]` **Dazu vier weitere Stellen, die unser Schema nannten:**

    der Reitertitel     "aus dem CHECK von goal_phases"   -> "9 Arten"
    der Bandhinweis     nannte Tabelle und Punktnummer    -> nur die Grenze
    der Ohne-Rate-Satz  nannte CHECK, Funktion, Hindernis -> nur die Wirkung
    zwei Marken unten   nannten Tabelle/Spalte/Typ        -> was fehlt

`[cmd]` **Und eine Kachel ganz entfernt: ,,Zeile".** `[read]` **Sie
zeigte die ersten acht Zeichen der Datenbankkennung, ein
,,Ziel verknuepft ja/nein" und drei Daten** - **Start und geplantes
Ende stehen schon im Kopf.** `[read]` **Keine Attrappe, also faellt
sie nicht unter E-68: sie war eine Entwicklersicht auf dem
Nutzerschirm.**

**AM SCHIRM BELEGT** (`test-user`, `/v2/goals?tab=phase`):

    vorher    goal_phases 4x · phase_am 1x
    nachher   0 ueber der Linie
              was bleibt: "Phase parameters" (Kacheltitel des
              Entwurfs) und zwei Marken UNTER der Linie

`[cmd]` **Gemessen mit einem Baumlauf ueber alle Textknoten**, je
Treffer mit der Lage zur Trennlinie - nicht mit einer blossen
Wortzaehlung.

`[cmd]` **Was blieb, weil E-68 es verlangt:** alle Attrappenmarken,
der `ReferenzTrenner`, `GoalsPhaseView` darunter. **Ein Waechter
haelt das fest.**

### A3 - die ueberzogene Phase ist ein Posten

`[cmd]` **Gemessen: zwei von drei laufenden Phasen sind ueber ihr
geplantes Ende, die aelteste um 73 Tage.**

`[cmd]` **Gebaut als eigener Kasten, nicht als Kennzahl:**

    Diese Phase laeuft 73 Tage laenger als geplant.
    Geplantes Ende war 2026-07-18. Beende sie oder verschieb das
    geplante Ende.

`[read]` **Eine Aussage ueber die PHASE, nicht ueber den Nutzer**
(C-108/F-02, E-74). `[cmd]` **Ein Test prueft, dass der Kasten keine
Wendung wie ,,zu lange", ,,versaeumt" oder ,,du solltest"
enthaelt.**

`[cmd]` **Er erscheint NUR bei einer laufenden, ueberzogenen Phase** -
ein eigener Testfall.

`[cmd]` **Am Schirm belegt** auf `test-user` mit einer eigens
angelegten 73-Tage-Phase: `[data-phase-ueberzogen]` = 1. **Danach
geloescht.**

### A5 - der Entwurf gegen das Gebaute, Kachel fuer Kachel

`[cmd]` **`GoalsPhaseView` (`module-goals-pro.jsx:198-489`) traegt
FUENF Karten und ZWEI Modale** - nicht zehn Kacheln, wie ein
Kommentar in `fehlende-kacheln.tsx:20` behauptete. **Der Kommentar ist
berichtigt.**

| Kachel | Entwurf | bei uns |
|---|---|---|
| Phasenkopf | :208-225 | oben-echt, unvollstaendig |
| Kennzahlenreihe (4) | :226-231 | oben-attrappe |
| Weekly auto-adjustment | :235-258 | oben-attrappe |
| Phase state machine | :261-447 | oben-attrappe (Raster), Vorschau nur-unten |
| Phase parameters | :451-469 | oben-echt, ohne Actions/Success metrics |
| Expert BB annual | :470-482 | oben-attrappe |
| PhaseEditorModal | :485 | nur-unten |
| PhaseTemplateLibrary | :486 | nur-unten |

**DIE FELDER, DIE OBEN FEHLEN - die Liste fuer die naechsten
Auftraege:**

**Phasenkopf** (`:210-223`): Phasen-Icon in Phasenfarbe, Pille
`week 9 of 20`, Pille `on track`, `adherence 94%`,
Fortschrittsbalken (`Meter value=week max=maxWeeks`).

**Kennzahlenreihe** (`:227-230`): Weight trend, Strength, Body fat,
Adherence - vier Felder.

**Weekly auto-adjustment** (`:243-256`): Statuszeile,
`confidence 88%`, Begruendungstext, `Active guards` mit
Guard-Zeilen. `[read]` **Die Regeln dahinter sind G-520, fertig
gebaut** - es fehlt die Anzeige.

**Phasenraster** (`:266-288`): Klick setzt `preview`, Pille
`current`, Marke `recommended next`, Marke `switchable`, Marke
`needs advanced` samt Ausgrauen. `[cmd]` **Der gated-Zweig fehlt in
`fehlende-kacheln.tsx` ganz.**

**Vorschaupanel** (`:295-429`) - **kein einziges Feld oben:** Kopf mit
Pille `recommended transition` / `manual switch`, Variantenkarten mit
je fuenf Zeilen (Deficit, Rate, Protein, Max duration, Diet break),
`Parameters`, `Sub-phases`-Tabelle (Stage/Weeks out/Deficit/Cardio),
`Refeeds`, `Peak week`, `12-month cycle` mit Auto-transitions und
Coach override, `Exit conditions`, `Success metrics`, `Best for`,
`Purpose`, `Guards that would apply`.

**Suggested transition** (`:439-444`): die Zahl `inWeeks`
(,,in 4 Wochen"), die modellierte Begruendung, `Accept and schedule`
statt blossem Annehmen.

**Phase parameters** (`:452-468`): Knopf `Templates`, Knopf `Edit`,
Block `Success metrics`.

**Expert BB annual** (`:470-481`): Knopf `Customize`, Knopf
`Open annual cycle editor`.

**ZWOELF BEDIENELEMENTE, die oben gar nicht vorkommen**
(`:269, 311, 421, 422, 423, 424, 443, 444, 452, 453, 470, 481`) -
darunter `Switch to {name}` (der Direktwechsel) und
`Schedule for later`.

**DER EDITOR** (`module-goals-editor.jsx`) liegt bei uns **nur unter
der Linie.** Er traegt elf Reiter mit zusammen ueber sechzig
Bedienelementen - Varianten, Parameter, Kalorienzyklus, Dauer mit
Dreiwegschalter, Unterphasen-Tabelle, Refeeds mit Wochentagsleiste,
Peak week mit fuenf Kippschaltern (darunter *,,Diuretics · requires
medical sign-off"*), Datumsanker mit Rueckwaertsplan, Jahreszyklus mit
Monatsbalken, Per-phase overrides (zehn Felder), Guards als
Schieberegler, Exit conditions. **Dazu die Vorlagenbibliothek.**

`[read]` **Das ist die Liste, aus der die naechsten Auftraege
kommen.**

**ZWEI SACHEN, DIE DER ENTWURF ZEIGT UND DIE KEINE SPALTE HABEN** -
gemeldet, nicht gebaut:

`[cmd]` **Der Zeitpunkt beim Wechselvorschlag** (,,in 4 Wochen",
`:439`). `[read]` **Rechenbar, sobald die Hoechstdauer als Funktion
der Rate existiert** (G-529 A3).

`[cmd]` **Die Konfidenz** (`0.88`, `:85`). `[read]` **Eine
Entscheidung, keine Rechnung.**

**UND ZWEI, DIE WIR HABEN UND DER ENTWURF NICHT:** `PhaseBeginnen` und
`PhaseBeenden` mit Pflichtgrund - **beide aus G-513, beide ohne
Vorbild in der Vorlage.**

### Ein ueberholter Grund, nebenbei gefunden

`[cmd]` **Die Marke an ,,Phase state machine" sagte:** *,,die
Oberflaeche ruft sie nur noch nicht"*. `[cmd]` **G-513 hat genau
diesen Aufrufer gebaut.** `[read]` **Berichtigt: was dort fehlt, ist
der Wechsel in EINEM Zug** - bei uns sind es zwei Handgriffe.

### A6 - die Grenze

`[cmd]` **`git status` in `apps/web/src/app/v2/`: nur `goals`.**
`[cmd]` **14 Zusicherungen gruen.**

**Sabotageprobe, drei Eingriffe, je von ihrer eigenen gefangen:**

    eine Fussnote kehrt zurueck   -> 2 und 4   ROT
    der Posten faellt weg         -> 1         ROT
    Posten auch bei beendeter     -> 3         ROT
    alles zurueck                 -> 14/14     GRUEN, byteidentisch

`[cmd]` **Ein vierter Versuch kam nicht an** - der Suchtext traf
nicht. `[read]` **Die `assert`-Zeile hat die Nulloperation
abgewiesen, statt sie als gruen zu verbuchen.**

`[cmd]` **Ein bestehender Waechter fiel dabei:**
`entwurf-wird-nicht-verdraengt.test.ts` zaehlt Marken ueber ein
Muster, das meine Kommentarzeile zwischen `attrappeAus(` und dem Grund
zerschnitt. `[read]` **Nicht die Zahl der Gruende war falsch, sondern
meine Formatierung** - Kommentar raus, Punktnummer in den Grund,
**15 von 15 wieder gruen.**

`[cmd]` **`pnpm gate` 18 von 18 GRUEN.** `[cmd]` **Nichts in
`supabase/`, nichts committet.**

## Der Auftrag geht weiter - raus 2026-09-29, 11:10

`[cmd]` **A2 und A4 sind frei: G-531 ist live**, selbst geprueft — alle
drei Funktionen auf `auth.uid()`, `goal_phase_start` mit
`p_zielrate_pct_kg_woche`, genau eine Signatur.

**A4** — der Wechselvorschlag ist annehmbar. Und `phase-write.ts` fuehrt
seinen zweigeteilten Schreibweg auf den atomaren RPC zurueck; Codex hat
es selbst gemeldet. `[read]` **Ein Umweg im Anwendungscode war einmal
vertretbar, jetzt ist er unnoetig** — und zwei Orte fuer die
,,eine laufende Phase"-Regel sind die Ursache von Drift.

**A2** — feste Felder je Phasenart statt des JSON-Inhalts: Rate,
Hoechstdauer, Protein. Wo ein Wert fehlt, Strich MIT GRUND;
`goals.phase_rate_rules` hat 0 Zeilen, das ist der Grund.

### A7 (neu) - das Vorschaupanel, und es ist der Kern

`[read]` **Toms Urteil nach A1 (11:07):** *,,sieht immer noch scheisse
aus und in keinster art und weise was die vorgabe ist."* `[read]` **Er
hat recht: A1 hat Fussnoten entfernt und nichts gebaut.**

`[cmd]` **Deine eigene A5-Liste ist jetzt die Vorgabe:**

    das Vorschaupanel (module-goals-pro.jsx:295-429)
      -> heute fehlt JEDES Feld davon
    zwoelf Bedienelemente, darunter Switch to X als Direktwechsel
    der Editor: elf Reiter, ueber sechzig Bedienelemente
      -> liegt nur unter der Linie
    oben stehen heute: fuenf Karten und zwei Modale

`[read]` **Reihenfolge: was eine echte Quelle HAT, wird angebunden.** Was
keine hat, bleibt Attrappe mit einer Marke nach `attrappeAus()` — eine
Zeile, Quelle und Grund. **Keine Fussnoten, das war A1.**

`[read]` **Der Massstab:** fertig ist, wenn der Reiter neben dem Entwurf
steht und man den Unterschied benennen muss, statt ihn zu sehen.

## Bericht, zweiter Teil - A2, A4, A7

**Claude Code, 2026-09-29.**

### G-531 selbst nachgemessen

`[cmd]` **Gegen die laufende Datenbank, 2026-09-29:**

    goal_phase_start   7 Parameter, letzter
                       p_zielrate_pct_kg_woche numeric
                       GENAU EINE Signatur
    alle drei          v_user_id uuid := auth.uid()

`[cmd]` **Und durchgespielt, je Art:** `fat_loss` (-0,5),
`lean_bulk` (+0,25), `peak_week` (ohne Rate) legen **alle drei ueber
die Funktion** an. `[cmd]` **Der Doppelstart wirft weiterhin**
*,,zuerst die laufende Phase beenden"*.

### A4 - der Umweg ist weg

`[cmd]` **`startMitRate()` geloescht** — der `INSERT` mit
vorheriger Sperrpruefung aus G-519.

`[read]` **Die Pruefung war kein gleichwertiger Ersatz fuer die
`23505`-Sperre:** zwischen Frage und Schreiben lag ein Augenblick.
**Jetzt traegt die Datenbank wieder beides.**

`[cmd]` **Ein Aufruf, kein Ternaer** — ein Waechter zaehlt, dass
`goal_phase_start` genau einmal vorkommt.

### A2 - feste Felder statt JSON-Inhalt

`[cmd]` **Die Kachel zeigte den Rohinhalt:** *,,Source GO-07
testdata · Calorie surplus kcal 250"* — **und
`calorie_surplus_kcal` ist die von E1 verworfene Groesse.**

`[cmd]` **Jetzt die drei Felder aus `PHASE_MODELS.md`:**

    Zielrate        -0.5 % KG/Woche     aus der eigenen Spalte
    Hoechstdauer    —                   Grund darunter
    Protein         —                   Grund darunter

`[cmd]` **Der Grund am Strich:** *,,Empfohlene Werte je Variante
sind noch nicht hinterlegt."* `[read]` **`goals.phase_rate_rules`
hat 0 Zeilen** — gemessen, nicht vermutet.

`[cmd]` **Der Leseweg nachgezogen:** `phase_am()` fuehrt die Rate
nicht, sie wird mit den drei Uebergangsspalten zusammen
nachgelesen — **dasselbe Muster, das dort schon stand.**

### A7 - das Vorschaupanel

`[cmd]` **Je Element die Quellenfrage gestellt, 2026-09-29:**

    Uebergaenge          UEBERGAENGE (Spec, G-519)      QUELLE JA
    Aussengrenze         CHECK zielrate_aussengrenze    QUELLE JA
    Vorzeichen je Art    CHECK zielrate_passt_zur_art   QUELLE JA
    Baender je Variante  phase_rate_rules: 0 Zeilen     QUELLE NEIN
    Sub-phases           keine Tabelle                  QUELLE NEIN
    Guards               keine Tabelle                  QUELLE NEIN

`[read]` **Was eine Quelle hat, ist angebunden. Was keine hat,
traegt eine Marke nach `attrappeAus()` — eine Zeile.** **Ein
Waechter prueft, dass keine Marke laenger als 120 Zeichen ist.**

**GEBAUT, mit echter Quelle:**

    das Raster mit neun Arten, je Kachel „empfohlen" oder
      „waehlbar" — GERECHNET aus UEBERGAENGE, nicht abgetippt
    die laufende Art ist ausgegraut und nicht waehlbar
    die Vorschau klappt DARUNTER auf (nicht als Modal)
    Pille „empfohlener Uebergang" / „kein empfohlener Uebergang"
    Zielrate-Regel je Art aus den zwei CHECKs
    „Danach moeglich" aus der Spec-Zustandsmaschine
    Schliessen- und Wechselknopf

**ATTRAPPE, mit einer Zeile Marke:** die Variantenkachel
(conservative/moderate/aggressive) — **ohne jede Zahl**, weil
`phase_rate_rules` leer ist. `[cmd]` **Ein Waechter prueft, dass
keine Spanne aus der Spec im Panel steht.**

`[read]` **Der Wechsel fuehrt zum BEENDEN**, nicht zu einem
erfundenen Direktwechsel — `goal_phase_start` weist ab, solange
eine Phase laeuft. **Der Entwurf zeigt `Switch to X`; bei uns sind
es zwei Handgriffe, und die Oberflaeche sagt das nicht, sie TUT
es.**

### Zwei Befunde am eigenen Bau, am Bild gefunden

`[cmd]` **1 - zwei Raster uebereinander.** Bei laufender Phase
stand ein ausgegrautes ,,Phase beginnen" UND darunter ,,Phase
wechseln" mit derselben Auswahl. `[read]` **Der Entwurf hat
EINES.** `[cmd]` **Behoben: ,,Phase beginnen" erscheint nur ohne
laufende Phase.** **Belegt: Zustand 1 zeigt 9/0, Zustand 2 zeigt
0/9.**

`[cmd]` **2 - die Kachel ,,Phasenwechsel" stand mit zwei Strichen
da** (,,Kam aus —", ,,Empfohlen als Naechstes —"). `[read]` **Eine
Kachel, die dreimal nichts sagt, ist kein Posten.** `[cmd]`
**Behoben: sie erscheint nur mit Inhalt.** **Am Bild: ,,Kam aus"
kommt 0x vor.**

### Die Bilder

    x-g534b-1-keine.png       keine Phase
                              [data-phasenwahl] 9, [data-wechselwahl] 0
    x-g534b-2-laeuft.png      Phase laeuft
                              [data-wechselwahl] 9, Zielrate sichtbar
    x-g534-a7-vorschau.png    Vorschau offen
                              Pille, Ratenregel, „Danach moeglich",
                              Variantenkachel mit Marke, zwei Knoepfe

`[cmd]` **Alle auf `test-user@lumeos.local`, 1 Konsolenfehler** (die
bekannte `data-mode`-Warnung). **Testdaten danach geloescht.**

### Die Grenze

`[cmd]` **18 Zusicherungen gruen** (dazu die 14 aus dem ersten
Teil).

**Sabotageprobe, fuenf Eingriffe, je von ihrer eigenen gefangen:**

    der Umweg kehrt zurueck        -> 2   ROT
    Rate nicht mehr mitgeschickt   -> 3   ROT
    Spec-Spanne im Panel           -> 4   ROT
    Uebergaenge abgetippt          -> 2   ROT
    JSON-Rohform zurueck           -> 2   ROT
    alles zurueck                  -> 18/18 GRUEN, byteidentisch

`[cmd]` **`pnpm gate` 18 von 18 GRUEN.**

`[read]` **Ein Gatelauf fiel zwischendurch am Bau** — der
Dev-Server uebersetzte gerade meine Aenderungen. `[cmd]` **Der
Bau allein lief durch, der naechste Gatelauf ebenfalls.**

### Was WEITERHIN offen ist

`[read]` **Das Vorschaupanel des Entwurfs traegt mehr, als eine
Quelle hat:** Sub-phases-Tabelle, Guards, Exit conditions, Success
metrics, `12-month cycle`, `Best for`, `Purpose`. `[read]` **Alle
sieben brauchen eine Tabelle, die es nicht gibt** — sie stehen
weiter unter der Linie.

`[cmd]` **Und der Editor** (elf Reiter, ueber sechzig
Bedienelemente) **bleibt vollstaendig unter der Linie.** `[read]`
**Nichts davon hat heute eine Quelle.**

---

## Warum die Abnahme wartet, Orchestrator 2026-09-29 15:15

`[read]` **Der zweite Teil ist gemeldet und vollstaendig** — A4
(`startMitRate` entfernt, die Sperre liegt wieder in der Datenbank), A2
(Zielrate aus der eigenen Spalte, Hoechstdauer und Protein als Strich mit
gemessenem Grund) und A7 (je Element die Quellenfrage gestellt, drei
gebunden, drei nicht).

**Die Abnahme wird zusammen mit G-541 geschrieben, aus einem Grund:**
Claude Code arbeitet seit 14:42 in genau den Dateien, deren Merkmale hier
zu zaehlen waeren — `phase-echt.tsx`, `ansicht.tsx`, `page.tsx`. Eine
Messung mitten in einem Schreibvorgang hat heute schon ein
Phantom-`# fail 1` erzeugt.

`[read]` **Und inhaltlich gehoeren sie zusammen:** die sieben Elemente,
die G-534 A7 als „ohne Quelle" gemeldet hat, bekommen ihre Quelle in
G-541. Zwei Abnahmen ueber dieselben Kacheln, eine Stunde auseinander,
wuerden sich widersprechen — die erste sagt „kein Beleg", die zweite
„Katalogspalte".

**Der Commit-Hash fehlt ebenfalls:** der Code liegt uncommittet in
`apps/`, weil dort G-541 gebaut wird. Code und Abnahme gehen in einen
Commit, wenn Claude Code meldet.

---

## Abnahme, Orchestrator, 2026-09-29 16:10

**Angenommen, beide Teile.** Die tragende Pruefung steht in der Abnahme zu
**G-541**, weil dieselben Dateien betroffen sind und G-541 die Frage
beantwortet, die dieser Punkt offen gelassen hat.

`[read]` **Was dieser Punkt geleistet hat, und es war nicht das Gebaute:**
er hat je Element die **Quellenfrage** gestellt und die Antwort
ausgehalten. Sieben Elemente hatten keine Quelle, und sie haben einen
Strich mit Grund bekommen statt einer plausiblen Zahl. Drei Monate lang
hat niemand gefragt, woher die Werte im Vorschaupanel kommen sollen — die
Frage war der Fortschritt, nicht die Kachel.

`[cmd]` **A4 hat die Sperre aus dem Anwendungscode entfernt**
(`startMitRate` geloescht), und ein Waechter zaehlt, dass
`goal_phase_start` genau einmal vorkommt. **Die Datenbank traegt die Regel
wieder allein** — das war die Lehre aus der Ueberladung in G-531.

`[cmd]` **A2 nennt den Grund fuer jeden Strich mit einer Zahl:**
`phase_rate_rules` hat 0 Zeilen. Nicht *„Daten fehlen"*, sondern *„diese
Tabelle ist leer"*. Nachpruefbar in einer Abfrage.

`[read]` **Und die zwei Befunde am eigenen Bau kamen vom Bild, nicht vom
Test:** zwei Raster uebereinander mit derselben Auswahl, und eine Kachel
mit drei Strichen. *„Eine Kachel, die dreimal nichts sagt, ist kein
Posten"* — der Satz steht jetzt in den Lehren.

**Offen geblieben und weitergetragen:** die sieben Vorschaupanel-Elemente
→ G-541 (gebaut), der Editor → G-539, die Zeitachse → G-544.
