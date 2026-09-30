# Uebergabe 2026-09-30

**Diese Datei ist der Einstieg.** Sie ersetzt
`2026-09-28-uebergabe.md`.

`[cmd]` **Der Zeiger muss nachgezogen werden, das kann nur Tom:** die
Projektanweisung schickt neue Sitzungen auf `2026-09-28-uebergabe.md`,
und davor zeigte sie zwei Tage lang auf `2026-09-02`. **Ein Einstieg,
der zwei Tage alt ist, laesst die Sitzung in der Luft haengen** — genau
das ist am 30.09. passiert.

`[read]` Daneben liegt `2026-09-08-uebergabe.md` (31,9 KB, zuletzt
26.09.), die mehr Tiefe hat als die 09-02 und nirgends verlinkt ist.

---

## Was Goals ist — Toms Wortlaut

**Tom, 2026-09-29, 11:56:**

> subnav goals: user kann einzelne oder mehrere ziele setzen
> subnav phase engine: user kann seine goals planen, terminieren,
> editieren

`[read]` **Das ist die kuerzeste maßgebliche Aussage, und sie schneidet
anders als jede Spec:** planen, terminieren, editieren sind
**Operationen auf Zielen**, nicht ein eigenes Objekt. Die Bauordnung
daraus steht in `docs/ssot/130-goals-bauordnung.md`, sechs Ebenen:

    1  Ziele                mehrere, messbar, verknuepfte Module   G-537 ✓
    2  Strategiekatalog     17 ausgelieferte Definitionen          G-536 ✓
    3  Terminierung         Ziel + Strategie + Zeitfenster  G-538 ✓, G-544
    4  Editor               persoenlicher Override, 12 Reiter      G-539
    5  Vorlagen             eigene und geteilte                    G-540
    6  Automatik            Waechter, Wochenanpassung  G-520 ✓, G-543 ✓

**Tom, 2026-09-30, 09:40, die Prioritaet:** *„konzentriere dich nun
zuerst auf die subnav Goals dass das nach vorgabe ist und ich auch die
einzelnen phasenziele manuell anlegen kann."* **Das geht seit G-554 und
G-557.**

---

## Die Rangfolge der Quellen — unveraendert

`docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md` nennt sie
seit dem 16.08.:

    Vorgaengerrepo (Rechenwege) -> Designvorlage (Umfang) -> Spec (Absicht)

`[read]` **Und zwei Quellen stehen NEU darunter, nicht daneben:**
`docs/ssot/131-fachwissen-phasen-und-rechenwege.md` ist Fachwissen aus
einer Sekundaerquelle (Encyclopedia v2.0) und gilt nicht, weil es dort
steht — **Tom, 16:15: „das sind keine ssot daten, die quelle kennt
lumeos nicht und sagt nur wie es das bauen wuerde."**

`[cmd]` **`docs/specs/` gehoert NICHT zu den nicht zu lesenden
Verzeichnissen** — es enthaelt getroffene Entscheidungen und wird
pruefend gelesen.

---

## Was am 29. und 30.09. entschieden wurde

    G-542   die Zielrate ist Prozent Koerpergewicht pro WOCHE, nicht
            pro Monat. Vier unabhaengige Fundstellen in drei
            Dokumenten, dazu Iraki 2019, Helms 2014, Garthe 2011.
            `PHASE_MODELS.md:68` (0.25-0.5% BW/month) ist der
            Einzelfall und damit der Fehler.

    Tom     die Bezugsgroesse bleibt KOERPERGEWICHT, nicht fettfreie
            Masse. 16:19: „niemand kennt seine magermasse."
            **Das hebt den LBM-Teil von E2/G-526 auf.** Die
            Gewichtsmethode gibt bei hoehrem KFA MEHR Protein - die
            sichere Richtung. G-543 A6/A7 zurueckgezogen.

    E-1     umgesetzt: kcal/Tag = 11 x Rate(%KG/Woche) x Gewicht,
            aus 7700 kcal/kg. Vorrang Phasenrate -> Katalograte ->
            `phasenparameter_fehlt`. Live nachgerechnet:
            2.552,4 + 11 x 0,271 x 83,74 = 2.802,0.

    G-538   eine offene Phase JE ZIEL, nicht je Nutzer. Der alte
            Eindeutigkeitsindex lief pro Nutzer, und `goal_id` war
            nullable mit dem Kommentar „Phasen, unabhaengig vom
            konkreten Ziel waehlbar" - **das genaue Gegenteil von
            Toms Definition.** Das war die Wurzel des ganzen Problems.

    G-557   die sechs Zielarten des Entwurfs treffen vier CHECK-Werte.
            Bruecke ist `subtype` (kein CHECK, fuenf gelebte Werte).
            `weight` und `custom` sind als Vorschlag markiert
            (`unsicher: true`) und warten auf Tom.

    G-551   ein Cardio-Modul kommt. Tom hat es entschieden, der
            Zeitpunkt ist offen.

---

## Die Zahlen, gemessen am 2026-09-30 um 13:20

    Punkte im Index                864
    davon erledigt                 594
    todos                          266
    laufend Codex                    2   G-545, G-514
    laufend Claude Code              2   G-544 + G-539 in next/

    punkte-pruefen              25 / 25   gruen
    specs-pruefen             149 / 149   gruen, 0 Statusbehauptungen
    zyklus-pruefen                 gruen
    sammelfragen                  1 / 1
    Kettenlauf                    gruen   passed, Exit 0, 1401 s
    pnpm gate                  18 / 18    2.253 Webtests

`[cmd]` **,,pnpm gate gruen" heisst NICHT, dass das Gate gruen ist.** Die
18 Turborepo-Aufgaben und die neun Waechter im Vorcommit-Haken sind zwei
verschiedene Pruefungen. **Ein Bericht nennt beide Zahlen.** Am 29./30.
war `pnpm gate` gruen, waehrend `punkte-pruefen` wegen eines
gescheiterten Kettenlaufs zwei Tage jeden Commit im Repo blockierte.

### Der Zustand von Goals in der laufenden Datenbank

    goals.user_goals            11 Zeilen
    goals.goal_phases            5 Zeilen, 4 mit goal_id, 1 offen,
                                 5 mit strategie_code
    goals.goal_strategies       17 Zeilen

    subtype-Verteilung          body_composition/cut               2
                                body_composition/gain_muscle       2
                                lifestyle/cardio_frequency         2
                                performance/strength               4
                                performance/training_capacity      1

`[cmd]` **Keine Zeile traegt `subtype IS NULL`.** Die eine Phase ohne
`goal_id` ist Max' beendete Seedphase — vom CHECK erlaubt, weil beendet.

---

## Was heute gebaut wurde

    G-543  20992639  kcal/Tag = 11 x Rate x Gewicht ist die Quelle.
                     Faktor und Rate liegen bei den heutigen
                     Katalogwerten nur 5-7 kcal auseinander; auf einem
                     persoenlichen Override sind es 78 kcal. Dort war
                     der alte Weg falsch, nicht im Bestand.

    G-553  20992639  der Ladefehler ist ein eigener Zustand
                     (`lib/goals/ladefehler.ts`), das Mockup bleibt
                     sichtbar. Ursache war ein Ternaer ueber sieben
                     Reiter, dessen else-Zweig den ganzen Inhalt trug.

    G-554  8553e5b2  Phasenziele sind anlegbar. Ziel und Phase in einer
                     Serveraktion, beides oder keines; faellt die
                     Phase, wird das Ziel zurueckgenommen.

    G-556  89e71386  der Kettenlauf faellt nicht mehr am eigenen CHECK.
                     Der Seed erzeugte Max' Phase offen und ohne Ziel,
                     waehrend 538 den nachgezogenen Zustand auch im
                     leeren Neuaufbau verlangte.

    G-557  db2a7a21  `subtype` erreicht die Datenbank. Sechs Ziele
                     ueber den Dialog angelegt und zurueckgelesen.

    G-558  a0be641d  `goal_phase_start` nimmt `p_strategie_code`.
                     **In der Kette, nicht live** - live traegt die
                     Funktion weiter sieben Parameter.

`[cmd]` **Nicht live eingespielt und damit offen:** G-558 (die Funktion)
und G-514 (die Modulverrechnung). Solange G-558 nicht live ist, zeigt
die Oberflaeche `strategieOffen`, und das ist richtig so.

---

## Was gerade laeuft

    Codex         G-545  der Katalog bekommt Werte, nicht nur Spalten
                         Raus 30.09. Vorbedingung erfuellt: G-543 liest
                         die Rate, G-558 nimmt den Code.
                  G-514  Bau abgenommen, nicht live eingespielt

    Claude Code   G-544  der Phase-Reiter bekommt Zeitachse und
                         Ankerdatum. Raus 30.09.
                  G-539  Editor, vorbereitet in next/

`[cmd]` **Codex' `next/` ist leer.** Der naechste Kandidat ist G-535 —
sechs Funktionen lesen den alten Sitzungsnamen
`request.jwt.claim.sub` (Singular) in coach, medical und nutrition.
**Dieselbe Ursache, die die Phase engine unbedienbar machte.**

---

## Was auf Tom wartet

    Tobias     G-542  ist die Rate pro Woche oder pro Monat
                      (vorlaeufig %/Woche, vierfach belegt)
               G-548  moderate_cut 12 oder 20 Wochen (vorlaeufig 20)
               G-549  Protein und Fett in der Ladewoche
               Alle drei in docs/todo/00-FRAGEN.md.

    G-546      erfassen oder empfehlen: v2.0 fuehrt elf Peptide mit
               Dosierung als Phasenparameter. LumeOS ERFASST heute
               Medikamente verschluesselt (C-285). Eine Dosierung
               AUSZULIEFERN, weil eine Phase sie vorsieht, ist eine
               andere Kategorie mit rechtlicher Seite.
               **Solange offen: kein Katalogeintrag traegt eine
               Substanz, und in Goals erscheint keine.**

    G-557 A2   `weight` und `custom` - eigener CHECK-Wert oder nicht
    G-540      drei Entscheidungen zu Vorlagen
    A-77       zwei Verzeichnisse mit Proben laufen in keinem Lauf.
               **Der Loesungsweg ist seit G-558 vorgemacht:** nicht
               ins Gate, das keine Wegwerf-Datenbank hat, sondern in
               die Kette, die eine baut.
    A-82       der Kettenwaechter prueft den Arbeitsbaum statt des
               Staging - waehrend ein Agent baut, kann niemand
               committen. Eine Zeile: `git diff --cached`.
    A-80       116 Wegwerf-Datenbanken
    A-79       backup/-Aufbewahrung, 3.958 MiB gegen 2.5 GiB
    A-78       Waechter auf Bezeichner-Ueberschneidung
    C-554 A3   der Registerumtrag fuer 70 unregistrierte Dateien
    Zeiger     die Projektanweisung auf DIESE Datei umstellen

## Was ausdruecklich wartet

**Tom, 2026-09-29:** *„physique oder pose interessiert mich noch nicht,
wenn wir nicht mal in der lage sind grundlagen in der ui darzustellen."*

Damit warten: Physique-Verhaeltnisse, Pose-Sessions, C-494, G-139.

---

## Die Fehler, die der Orchestrator am 30.09. gemacht hat

**1. Auftragstexte als Kurzfassung in die Antwort geschrieben.**
**Tom, 12:59:** *„in dem was ich kopiere sind die facts nicht drin was
er lesen soll."* Tom kopiert den Block in den Agenten — der Agent bekam
die Kurzfassung ohne Zahlen, Tabellen und Nachweispflichten. **Die Regel
stand schon in `00-LIESMICH.md`:** der Kopf steht im Auftrag, nicht in
der Begleitnachricht, *„der Auftrag wird kopiert; was danebensteht, geht
verloren."*

**2. Der Auftragskopf fehlte in allen vier Auftragsdateien.**
`00-LIESMICH.md:355` verlangt vier Zeilen — **fuer wen, Bereich, Fremd,
Stand** — und nur `agent:` im Frontmatter zu setzen erfuellt das nicht.
Nachgetragen bei G-544 und G-545.

**3. Zwei Punktdateien auf 0 Bytes geschrieben.**
`io.open(p,"w").write(re.sub(..., io.open(p).read()))` — der Schreibgriff
wird zuerst erzeugt und leert die Datei, bevor der Lesezugriff laeuft.
Ueber `git checkout` zurueckgeholt, die uncommittete Abnahme war weg und
musste neu geschrieben werden. **Lesen, Ergebnis in eine Variable, DANN
schreiben.**

**4. Ein Muster ohne Gegenprobe, zum vierten Mal.** `rg` nach
`initiation|progression|intensification` in SSOT 131 ergab null Treffer,
und ich hielt das fuer eine Luecke. **Beim Lesen der Datei stand die
Tabelle da — unter den v2.0-Namen Early/Mid/Late.** Mit dem Vokabular des
falschen Dokuments gesucht.

**5. G-538/A1 verlangte den Bestandsnachzug, nicht die Quelle.** Der
Schritt, der Max' Phase ERZEUGT, stand nicht im Auftrag. Der
naechtliche Kettenlauf fiel zwei Tage am eigenen CHECK und blockierte
jeden Commit. **Fehlerklasse: live repariert, Quelle nicht.**

---

## Die Lehren

`[cmd]` **Eine `[cmd]`-Zahl ohne ihren Befehl ist eine Behauptung.**
Claude Code hat es selbst gefunden: sein Bericht nannte 4 Zeilen, sein
Kommentar 2 — dieselbe Datei, dieselbe Stunde. Der Zaehlbefehl steht
jetzt jeweils daneben.

`[cmd]` **Eine Tabelle, die niemand schreibt, ist keine Zuordnung.**
G-554 hat die sechs Arten richtig abgebildet; `git grep` fand 13 Treffer
in der Zuordnungsdatei und **null** im Schreibweg. **Aus der Existenz
einer Sache folgt nicht ihre Funktion** — auch nicht bei einer richtig
gebauten Tabelle.

`[cmd]` **Der Weg aus A-77 ist die Kette, nicht das Gate.** Eine
Datenbankprobe braucht eine Wegwerf-Datenbank; das Gate hat keine, der
Kettenlauf baut eine. Codex hat die G-558-Gegenprobe als Kettenschritt
eingetragen, 301 statt 299 Schritte.

`[read]` **Beide Agenten haben eigene Messfehler den PROBEN
zugeschrieben, nicht dem Bau.** Claude Code: zwei Sabotagen bissen
nicht, weil `TABELLE[null] ?? null` dasselbe zurueckgab und eine
Ersetzung von zwei Vorkommen nur das erste traf. **Eine Probe, die
nichts findet, hat nicht bewiesen, dass nichts da ist.**

`[read]` **Und Codex hat eine Frage beantwortet, die nicht beauftragt
war** — ob die Probe irgendwo laeuft. Das ist der Unterschied zwischen
einem Bericht und einer Erfolgsmeldung.

`[cmd]` **`set PYTHONIOENCODING=utf-8` vor jedem Aufruf, der
Werkzeugausgabe weitergibt.** Ein Commit lief durch, und erst das
`print` des Haken-Zeichens warf `UnicodeEncodeError` — die Meldung sah
aus wie ein fehlgeschlagener Commit.

`[cmd]` **`git status --short` lesen, nicht `--name-only`.** Der Index
trug G-554 noch in `next/`, der Arbeitsbaum in `laufend_` — `AD` im
vollen Status, unsichtbar in der Dateiliste.

---

## Wie es weitergeht

**1.** G-544 und G-545 abnehmen, wenn die Berichte kommen. Bei G-545 ist
die Gegenprobe je Wert die Pflicht: **ein Wert ohne Fundstelle wird
nicht eingespielt.**

**2.** Codex' `next/` mit G-535 fuellen.

**3.** G-539 (Editor) nach G-544 — die Ankerrechnung aus G-544/A2 liegt
server-frei in `lib/goals/` und wird dort erneut gebraucht.

**4.** Tobias' drei Antworten in G-542, G-548, G-549 nachziehen, sobald
sie da sind. Danach ist G-545 A7 (drei Proteinfaktoren) entscheidbar.

`[read]` **Was NICHT als naechstes kommt:** das Cardio-Modul (G-551).
Tom hat entschieden, dass es kommt, und ausdruecklich gesagt, dass
darueber spaeter gesprochen wird.
