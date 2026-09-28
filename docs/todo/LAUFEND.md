# Laufende Auftraege

**Stand: 2026-09-28, 22:55**

| Agent | Nr | Inhalt | Stand |
|---|---|---|---|
| Codex | G-511 | die Rechnung dreht sich: Rate statt Delta | **raus 28.09., 15:48** |
| Codex | G-528 | A1 — die drei variant-Testwerte aufraeumen | **raus 28.09., 15:48** |
| Codex | G-529 | A9 — drei Arten erzwingen NULL | **raus 28.09., 15:48** |
| Codex | G-523 | der adaptive TDEE glaettet nicht | gebaut, gruen, wartet auf Einspielung |
| Codex | G-526 | Protein und Fett kennen die Phase nicht | Struktur ab (A11/A12); Baender warten auf G-521 A1 |
| Codex | C-546 | Sehnen und Nerven je Muskel | geliefert, Abnahme offen |
| Codex | C-551 | Rollenregel und Messfaktor trennen | geliefert, Abnahme offen |
| Claude Code | G-368 | Attrappenvermerke mit falschem Grund | **raus 28.09., 15:48** — acht falsche Marken |
| Claude Code | G-394 | sechs Module ohne Ladezustand | **raus 28.09., 15:48** |
| Claude Code | G-519 | Phasen nach der massgeblichen Quelle | A1-A4 ab, A3-Regel in `0483f080`; A5-A8 blockiert |

`[cmd]` **Nichts davon ist live eingespielt.** Codex haelt die drei
Migrationen zurueck.

---

## Bereich je Agent

    supabase/_pipeline/          Codex
    apps/web/src/app/v2/         Claude Code
    apps/coach/src/              Claude Code
    packages/ui, packages/scoring  Claude Code (mit Gegenprobe)
    docs/, tools/                Orchestrator

---

## Warum G-519 A5 bis A8 NICHT laeuft

`[cmd]` **Die Ratenspalte ist gebaut und NICHT eingespielt.** Der
Dev-Server liest die laufende Datenbank; dort gibt es
`goals.goal_phases.zielrate_pct_kg_woche` nicht — null Treffer,
selbst gemessen. **Ein Eingabefeld dagegen ist nicht baubar.**

`[cmd]` **Und G-511 speichert weiter das Delta:** Zeile 148 liest
`parameters -> 'calorie_surplus'`, Zeile 195 rechnet
`bmr_wert * akt_faktor + kalorien_delta`. Nach E1 ist das die
verworfene Groesse. **Die Reihenfolge: G-511 neu, dann einspielen,
dann G-519 A5-A8.**

`[read]` **Der Orchestrator hat am 28.09. behauptet, A5-A8 sei
freigeschaltet.** Das war falsch — eine Spalte in einer Migration
ist keine Spalte in der Datenbank.

---

## Was auf Tom wartet

    -- nichts offen --

`[cmd]` **N11 und N12 sind entschieden** (G-521, E1 bis E4).


`[read]` **N13 ist entschieden:** kcal ist die gespeicherte Groesse,
der Schieber aus dem Altrepo ist die Bedienung, die Spec-Spannen sind
die Schiene — und kcal UND Prozent werden beide angezeigt. Codex hat
es gleich gelesen: keine Wahl heisst `phasenparameter_fehlt`, nicht
heimlich die Mitte.

---

## Gebaut am 2026-09-28

`[cmd]` **A-75 — der Quellenwaechter.** `punkte-pruefen.mjs`
Abschnitt 5b: `quellen:` ist Pflicht ab `angelegt: 2026-09-28`, ein
vorhandener Block wird immer geprueft. Vier Faelle fallen rot,
Gegenprobe in acht Richtungen. **Ein Stichtag statt des in A2
vorgeschlagenen Sollstands** — der Waechter faellt in beide
Richtungen, ein Sollstand von 823 waere beim ersten Nachtrag rot
geworden.

`[cmd]` **A-77 — die Werkzeugtests laufen.** 33 Pruefungen in 2.7 s,
als ERSTER Gate-Schritt (30 Schritte) und als `pnpm test:werkzeuge`.
Die Ursache war der Aufruf: `node --test tools/__tests__/` scheitert,
mit Muster laeuft es. Gegenprobe an echtem Code: Sperre ausgebaut, 7
von 33 rot, byteidentisch wiederhergestellt.

`[cmd]` **A-76 — der Geltungswaechter.** `tools/specs-pruefen.mjs`,
neu, im Gate (29 Schritte). Zwei Statusbehauptungen gestrichen,
Geltungszeile in allen zehn Goals-Dateien, Sollstand 149 von 159.

`[cmd]` **Die Gegenprobe zu A-75 hat einen echten Fehler gefangen:**
`punkte-lesen.mjs` stuerzte bei der ersten Liste auf oberster Ebene.
Behoben, bevor der Waechter lief.

---

## Aus der Quellensichtung Goals und dem Codex-Bericht

    G-522  Cross-Modul-Beitraege fehlen vollstaendig -- der erste USP
    G-523  der adaptive TDEE glaettet nicht (alpha=1.0 statt 0.3)
    G-524  vier der zehn Spec-Tabellen und beide Ansichten fehlen
    G-525  Meilensteine gibt es nur als Seed, keine prozentualen
    G-526  Protein (fest 2 g/kg), Fett (fest 25 %) und Faser kennen
           die Phase nicht -- aus N14, in der lebenden Funktion
           nachgemessen
    G-527  der Schreibweg kennt die zwei neuen Hindernisse nicht --
           aus N15, ein SQLSTATE 23514 waere ein HTTP 500
    G-528  die Variantenachse und mini_cut sind nicht definiert --
           traegt die vollstaendige Auflistung aller Parameter je
           Phase, damit die Ableitung nicht jedes Mal neu entsteht
    A-76   die Specs beschreiben das Vorgaengerrepo als fertig
    A-77   vier Werkzeugtests liefen nirgends
    G-529  die gespeicherte Groesse ist die Rate (blockiert G-511)
    G-530  contest_prep und expert_bb_annual brauchen eine eigene
           Struktur -- Unterphasen am Termin, Zwoelfmonatsplan als
           Vorlage, Peak Week tagbasiert

`[cmd]` **`peak_week` ist keine offene Frage.** Vier Stellen fuehren
es als eigene Phasenart: `PHASE_MODELS.md:13` (Diagramm),
`PHASE_MODELS.md:139` (eigener Parameterblock mit drei Werten),
`PHASE_MODELS.md:167` (Monat 11), dazu `DATABASE.md` und `SCORING.md`.
Nur eine Kalorienvorgabe fehlt.

---

## Der volle Gate-Lauf ist gruen

`[cmd]` **28.09., 15:29: `[gate] gruen`, 30 Schritte** — mit den drei
neuen Waechtern darin und mit Codex' ungetrackten Dateien im Baum.
`turbo` 18/18 (voll gecacht), `serverimport` 55 Client-Chunks, 0
Treffer.

`[read]` **Der erste volle gruene Lauf mit A-75, A-76 und A-77 im
Gate.** Ab jetzt ist ein roter Schritt ein Befund und keine
Baustelle.

`[cmd]` **Draussen:** `3c3c4da9` (Waechter), `e22a7c03` (Punkte),
`8fc65ed7` (Serena), `0483f080` (G-527/G-422).

---

## Die vier Entscheidungen aus G-521, 2026-09-28

    E1  die neun Phasenarten bleiben als Auswahl -- die Parameter
        haengen an der RATE, nicht an der Art            -> G-529
    E2  das Proteinband wird nach Trainingsstatus geteilt -> G-526
    E3  recomp bleibt eine Phase, die Baender sind unsere
    E4  contest_prep und expert_bb_annual bekommen eine
        eigene Struktur                                 -> G-530

`[cmd]` **G-511 geht nicht live.** Die gesperrte Migration speichert
ein Kaloriendelta; nach E1 ist das eine Ableitung und gehoert nicht
in die Parameter. **Dass sie gesperrt war, war Glueck** — sonst
waere die Aenderung zweimal durch die Kette gewandert.

`[cmd]` **G-523 ist keine Kosmetik mehr, sondern Voraussetzung.**
Eine Rate braucht einen geschaetzten TDEE. Der lebende glaettet
nicht (alpha = 1.0) — eine Rate gegen einen springenden TDEE ergibt
ein springendes Ziel.

`[read]` **Der Recherchebericht erfuellt seine Beweisanforderung
nicht:** keine Fundstelle nennt Seite oder Abschnitt, und von drei
verlangten Quellenarten fehlt die dritte ganz. **Nichts daraus ist
`[cmd]`.** G-521 A1 bleibt offen.

---

## Was als naechstes ansteht

**Codex:** G-529 A1 zuerst — messen, was die gesperrte Migration
aendern muesste, Zeile fuer Zeile. Ergebnis ist eine Liste, kein
Umbau. Danach G-523 (die Glaettung), dann G-529 A2.

**Claude Code:** G-519 A5-A8, sobald N14 steht. Danach G-520.
G-527 A1 und A2 lassen sich vorher bauen — sie kosten nichts,
solange die Werte nie auftreten.

**Orchestrator:** Geltungszeile je Modul nachziehen, wenn dort
gearbeitet wird. Naechste Quellensichtung nach Toms Wahl.

---

## Zwei Regeln

`[cmd]` **Ein Auftrag, ein Bericht.** Ketten sind erlaubt, aber sie
melden EINMAL am Ende — kein Zwischenstand.

`[cmd]` **Nichts laeuft losgeloest im Hintergrund** — ausser
`tools/server.py start`, das ein Log schreibt.

---

## Zwei Lehren vom 28.09.

`[cmd]` **Drei von vier Waechtern ist kein Lauf.** Nach G-529 und
G-530 liefen `punkte`, `nummern`, `specs` und der Index —
`sammelfragen` nicht. Der Agent fand das rote Gate, nicht der
Orchestrator. **Die vier gehoeren zusammen aufgerufen**, nicht nach
Gefuehl ausgewaehlt.

`[cmd]` **Ein Stellvertreterbeweis ist besser als kein Beweis.**
G-527 A3 verlangte einen Nutzer ohne aktive Phase — den Zustand gibt
es nicht, solange G-511 gesperrt ist. Statt die Zeile offen zu
lassen, hat der Agent einen ECHTEN `23514` aus den acht CHECKs von
`nutrition_targets` ausgeloest und die echte Datenbankmeldung durch
die Zuordnung geschickt. **Das belegt beide Zweige an einer Meldung
aus der laufenden Datenbank** — mehr als ein erfundener Aufruf
gekonnt haette.

---

## Ein Befund zu dieser Datei

`[cmd]` **Am 28.09. hat der Eintrag zu G-519 den Orchestrator in die
Irre gefuehrt.** Er sagte ,,blockiert durch N13", obwohl N13 am
selben Morgen entschieden war — und daraufhin hiess es Tom
gegenueber, Claude Code arbeite noch daran. **Der Agent war seit
Stunden fertig.** Eine Zeile, die einen Zustand behauptet, den
niemand nachzieht, ist schlechter als keine Zeile.


`[read]` **Die Tabelle oben ist ableitbar.** `docs/punkte/00-INDEX.md`
kennt aus dem Frontmatter, welche Punkte in `laufend_codex/` und
`laufend_claudecode/` liegen. Von Hand gepflegt wird sie genau so
alt wie beim letzten Mal. **Was NICHT ableitbar ist, sind die drei
unteren Abschnitte** — was auf Tom wartet, was als naechstes ansteht,
und die Regeln.
