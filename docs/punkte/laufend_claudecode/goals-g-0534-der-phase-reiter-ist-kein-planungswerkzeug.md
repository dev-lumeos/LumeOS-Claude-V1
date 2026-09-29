---
nr: G-534
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: claudecode
beauftragt: 2026-09-29

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
