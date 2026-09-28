# Uebergabe 2026-09-28

**Diese Datei ist der Einstieg.** Sie ersetzt
`2026-09-02-uebergabe.md`, auf die die Projektanweisung noch zeigt —
**der Zeiger muss nachgezogen werden, das kann nur Tom.** Daneben
liegt `2026-09-08-uebergabe.md` (31,9 KB, zuletzt 26.09.), die mehr
Tiefe hat als die 09-02 und nirgends verlinkt ist.

---

## Wo wir stehen

Der ganze Tag ging in **Goals**, und zwar nicht in Oberflaeche, sondern
in die Frage, **welche Groesse eine Ernaehrungsphase eigentlich
speichert.** Die Antwort hat sich zweimal gedreht und steht jetzt:

    nicht absolute kcal        (so stand es in unserer Spec)
    nicht Prozent vom TDEE     (so rechnete das Vorgaengerrepo)
    sondern die RATE in Prozent Koerpergewicht je Woche

`[cmd]` **Das ist E1 vom 2026-09-28**, gestuetzt auf zwei unabhaengige
Wege: eine eigene Messung (ein kcal-Band und ein Ratenband erfuellen
sich nur in einem Gewichtsfenster — bei `fat_loss/aggressive` nur
zwischen 45 und 91 kg) und eine Tiefenrecherche (G-521, F2).

**Drei Waechter sind heute dazugekommen**, und das ist die zweite
Haelfte des Tages: Regeln binden nicht, rote Laeufe binden.

---

## Was heute entschieden wurde

    E1  die neun Phasenarten bleiben als Auswahl -- die Parameter
        haengen an der RATE, nicht an der Art              -> G-529
    E2  das Proteinband wird nach Trainingsstatus geteilt   -> G-526
    E3  recomp bleibt eine Phase, die Baender sind UNSERE, nicht
        die der Literatur
    E4  contest_prep und expert_bb_annual bekommen eine eigene
        Struktur                                           -> G-530

**Dazu G-529 A2, die Bauentscheidung:**

`[cmd]` **Die Rate kommt als SPALTE, nicht als JSON-Schluessel.**
`goals.goal_phases.zielrate_pct_kg_woche numeric(5,3)`, nullable, mit
einem CHECK, der Vorzeichen und Anwendbarkeit an die Phasenart bindet,
und einem zweiten als Tippfehlerschutz. Die erlaubten SPANNEN kommen
in eine eigene Regeltabelle `goals.phase_rate_rules`, nach dem Bauplan
von `goals.nutrition_macro_rules`.

`[read]` **Der Grund ist gemessen, nicht Geschmack:** fuer dieselbe
Groesse waren zwei JSON-Schluesselnamen im Umlauf
(`calorie_surplus_kcal` und `calorie_surplus`), und es brauchte einen
Kettenschritt, der bei Widerspruch abbricht. Eine Spalte kann diese
Fehlerklasse nicht haben.

`[read]` **Damit ist N13 dreigeteilt:** Regeltabelle = die Schiene,
Phasenzeile = der gewaehlte Wert, kcal = abgeleitet und angezeigt.

---

## Die Zahlen des Tages

    Punkte im Index                830
    davon erledigt                 568
    todos                          254
    laufend Codex                    6
    laufend Claude Code              2

    Gate-Schritte                   30   (waren 28)
    punkte-pruefen              25 / 25
    specs-pruefen              149 / 159
    sammelfragen                  1 / 1
    test:werkzeuge              33 / 33
    turbo typecheck test build  18 / 18

### Der adaptive TDEE glaettet nicht

`[cmd]` `goals.adaptive_tdee` traegt `alpha = 1.0`, der Methodenname
sagt es selbst: `rolling_14d_intake_weight_delta_alpha_1_formula_baseline`.
Mit alpha = 1 wird der Formelterm mit Null multipliziert — der
ausgewiesene ,,adaptive" Wert ist der rohe Wochenwert, ungedaempft.
Die Spec verlangt alpha = 0.3 gegen den VORGAENGERWERT (G-523).

**Und dafuer gibt es keine Reihe.** `goals.tdee_settings` waere nur ein
Zustand; das Vorgaengerrepo hatte `tdee_history`. Damit steht die
Kette:

    die Reihe (aus G-514)  ->  die Glaettung (G-523)  ->  die Rate (G-529)

### Zwei von fuenf Modulen koennen liefern

`[cmd]` Gemessen fuer den ersten USP (Cross-Modul-Beitraege, G-514 mit
G-522 als Kind):

    recovery      recovery.scores.score            370 Zeilen, gefuellt
    supplements   daily_intake_summary             274 Zeilen, Ansicht
    nutrition     nur im Browser gerechnet         nicht gespeichert
    training      nichts
    medical       nichts

`goals.goal_contributions` hat **null Treffer in 1336 Dateien.** Und es
gibt schon **zwei Bauarten** fuer Modulscores (TypeScript bei
nutrition, SQL bei recovery) ohne Vertrag dazwischen.

### Protein rechnet auf der falschen Bezugsgroesse

`[cmd]` `berechne_zielwerte` rechnet `body_weight_kg * 2`. Helms 2014
nennt Protein je kg **fettfreier Masse**.
`goals.body_measurements.lean_mass_kg` existiert als generierte Spalte,
und **alle 362 Messungen tragen `body_fat_pct`** — es fehlt keine
Daten, nur der Bezug (G-526).

---

## Was heute gebaut wurde

`[cmd]` **A-75 — der Quellenwaechter.** `punkte-pruefen.mjs`
Abschnitt 5b: `quellen:` ist Pflicht ab `angelegt: 2026-09-28`, ein
vorhandener Block wird immer geprueft. Vier Faelle fallen rot.
**Stichtag statt Sollstand** — der Waechter faellt in beide Richtungen,
ein Sollstand von 823 waere beim ersten Nachtrag rot geworden.
Gegenprobe in acht Richtungen. **Sie hat einen echten Fehler gefangen:**
`punkte-lesen.mjs` stuerzte bei der ersten Liste auf oberster Ebene.

`[cmd]` **A-76 — der Geltungswaechter.** `tools/specs-pruefen.mjs`,
neu, im Gate. Zwei Statusbehauptungen gestrichen, Geltungszeile in
allen zehn Goals-Dateien. Anlass: 159 Spec-Dateien, 16 nennen einen
fremden Port, 11 nennen Hono, 10 nennen `apps/app/` — **im Repo gibt
es keines davon.** Zwei Dateien sagten woertlich ,,Status: Vollstaendig
implementiert (2026-04-14)".

`[cmd]` **A-77 — die Werkzeugtests laufen.** 33 Pruefungen in 2,7 s,
als ERSTER Gate-Schritt. Die Ursache war der Aufruf:
`node --test tools/__tests__/` scheitert, mit Muster laeuft es.

`[cmd]` **G-527 und G-519 A3 (Claude Code).** Vier Hindernisse mit
eigenen Texten aus einer gemeinsamen Funktion, `23514` gefangen statt
als HTTP 500 durchgelassen, `peak_week` und `expert_bb_annual` als
Zustand statt als Fehler. `transitions_to` als Regel in
`phase-regeln.ts`, `mini_cut` als `[annahme]`. **Eigene Gegenprobe:
Sabotage -> 1 und 2 Fehlschlaege, byteidentisch wiederhergestellt.**

`[cmd]` **G-526 Struktur (Codex).** `goals.nutrition_macro_rules` mit
der Belegdisziplin als CHECK: eine offene Regel darf **technisch keine
Zahl tragen**, eine belegte braucht Quelle UND Fundstelle.

`[cmd]` **G-512 geschlossen** — war seit 26.09. in `abf33847` behoben
und lag zwei Tage in `todos/`.

---

## Was gerade laeuft

    Codex         G-524 (nur die TDEE-Reihe), G-523 B2-B5,
                  G-526 A11/A12, G-529 A5-A8
                  mitten drin -- g523- und g529-Tests existieren schon

    Claude Code   frei

`[cmd]` **Eine Korrektur wartet auf Codex:** seine
`20260928150000_g524_tdee_history_ewma.sql` enthaelt ein `INSERT`, und
der Datenlogik-Waechter verbietet das in Migrationen. **Das ist mein
Auftragsfehler** — A4 verlangte ein Rueckfuellen, ohne zu sagen, wohin
es gehoert. **Struktur in die Migration, Rueckfuellen in einen
Ableitungsschritt.**

---

## Was auf Tom wartet

    G-511    bleibt gesperrt. Die Migration speichert ein
             Kaloriendelta; nach E1 ist das eine Ableitung. Der
             Parameter-Nachzug calorie_surplus_kcal -> calorie_surplus
             FAELLT vollstaendig -- beide Namen speichern die
             verworfene Groesse.

    Commits  76 offene Aenderungen: 41 docs, 23 supabase (Codex),
             11 apps/tools/package.json. Zwei logische Changes:
             "tools:" (A-75, A-76, A-77) und "punkte:" (docs/).

    Zeiger   die Projektanweisung schickt neue Sitzungen auf
             2026-09-02-uebergabe.md. Sie muss auf DIESE Datei zeigen.

    A-78     der Bestandswaechter: bauen oder nicht.

    C-236    ein Punkt in todos/ mit gruenem Test -- pruefen, ob er
             zu Recht offen ist.

---

## Die fuenf Fehler, die ich heute gemacht habe

**1. Zwei Punkte angelegt, die es schon gab.** `G-524` doppelt `G-514`
vom 26.09. vollstaendig, `G-522` haette von Anfang an dessen Kind sein
muessen. **In derselben Sitzung, in der A-75 darueber entstand, dass
nicht gegen die Quellen geprueft wird.** Die Vier-Quellen-Regel nennt
Code, Daten, Spec, Vorgaengerrepo — **nicht den Bestand von 830
Punkten.** Daraus wurde A-78.

**2. Drei von vier Waechtern ist kein Lauf.** Nach G-529 und G-530
liefen `punkte`, `nummern`, `specs` und der Index — `sammelfragen`
nicht. **Der Agent fand das rote Gate, nicht ich.**

**3. Dreimal eine falsche Messung durch PowerShell-Quoting.** Ein
`\$` im Regex, ein `\\\\b`, ein verschachteltes Anfuehrungszeichen —
jedes Mal kam ein Ergebnis zurueck, das wie eine Antwort aussah. Beim
CHECK von G-526 meldete ich ,,ungueltig", wo die Regel gueltig ist.
**Die Lehre ist dieselbe wie beim Encoding: die Konsole entscheidet
nichts. Regexe gehen in eine Datei, nicht durch die Shell.**

**4. Auftragskoepfe ohne Empfaenger.** Zwei Auftraege nebeneinander,
keiner nannte seinen Agenten. Die Regel steht jetzt in
`docs/punkte/00-LIESMICH.md:276`: **fuer wen, sein Bereich, was ihm
NICHT gehoert und wer dort arbeitet, Stand.**

**5. Ein Rueckfuellen verlangt, ohne den Ort zu nennen** — siehe oben,
Codex' `INSERT`.

---

## Die Lehren des Tages

`[read]` **Dieselbe Krankheit an drei Stellen**, und sie hat heute drei
Punkte bekommen:

    A-75   ein Auftrag wird nicht gegen die Quellen geprueft
    A-76   die Quelle behauptet einen fremden Zustand
    A-78   der Bestand wird nicht gelesen, bevor etwas dazukommt

**Alle drei sind Faelle von ,,niemand sieht nach, und nichts wird
rot."**

`[cmd]` **Ein Stellvertreterbeweis ist besser als kein Beweis.** G-527
A3 verlangte einen Nutzer ohne aktive Phase — den Zustand gibt es
nicht, solange G-511 gesperrt ist. Claude Code hat statt dessen einen
ECHTEN `23514` aus den acht CHECKs von `nutrition_targets` ausgeloest
und die echte Datenbankmeldung durch die Zuordnung geschickt.

`[cmd]` **Das Testdateisignal ist billig und scharf.** Von 263 offenen
Punkten haben 11 einen Test auf ihre Nummer, neun davon sind die
laufenden. **In `todos/` waren es drei** — zwei davon erledigt und
nicht nachgezogen. Der Commit-Betreff taugt dafuer NICHT: G-512 wurde
unter `goals(G-510)` behoben, ohne die eigene Nummer zu nennen.

`[read]` **Eine Attrappenmarke mit falschem Grund ist schlimmer als
keine.** Der Knopf im Messungsmodal sagte *,,Was fehlt, ist der
Schreibweg"* — der Schreibweg stand seit G-122. Die Marke schickte die
Suche in die falsche Richtung.

---

## Wie es weitergeht

**1.** Codex' Bericht abnehmen, die `INSERT`-Korrektur mitgeben.

**2.** Committen: `tools:` und `punkte:` getrennt.

**3.** G-514 zuschneiden — die Beitragstabelle plus recovery und
supplements ist der erste Auftrag, der den USP echt macht, und nach
der A1-Messung ist er klein: **zwei von fuenf Modulen liefern schon.**

**4.** Dann G-519 A5 bis A8, sobald G-529 A5 steht. Das Eingabefeld
fuehrt die Rate, kcal laufen daneben mit (N13).

`[read]` **Was NICHT als naechstes kommt:** die Proteinspannen je
Phase. Sie sind `[wahrscheinlich]`, nicht `[cmd]` — der
Recherchebericht nennt keine Fundstellen. **G-521 A1 bleibt offen, und
vier Zahlen haengen daran:** der Ratendeckel 1,25, die Fettuntergrenze
0,5, das Proteinband je Trainingsstatus und die 8 bis 12 Wochen, ab
denen eine Diaetpause etwas bringt.
