# Laufende Auftraege

**Stand: 2026-09-28, 18:30**

| Agent | Nr | Inhalt | Stand |
|---|---|---|---|
| Codex | C-554 | das Migrationsregister ist unbrauchbar — A1 messen, dann vier Goals-Dateien einspielen | **raus 28.09., 18:03** |
| Claude Code | G-522 | A3 — der Vertrag fuer einen Modulbeitrag | **raus 28.09., 18:03** — Bericht liegt |

`[cmd]` **Alles andere liegt in `todos/` oder `erledigt/`.** Der
Ordner ist der Zustand; `docs/punkte/00-INDEX.md` fuehrt 833 Punkte
(todos 253 · laufend_codex 1 · laufend_claudecode 1 · erledigt 578).

---

## Der Befund des Tages: niemand kann sagen, was live ist

`[cmd]` **Gemessen 2026-09-28 gegen die laufende Datenbank:**

    Registereintraege in supabase_migrations.schema_migrations   17
    Dateien in supabase/migrations/                              91
    nicht registriert                                            74
    neuester Registereintrag                        20260915142200
    Registereintraege ohne Datei (Geister)                        0

`[cmd]` **Und die 74 sind keine Arbeitsliste.** Stichprobe von 12,
objektweise gegen `information_schema`: **3 sind strukturell DA,
obwohl nicht registriert** (`marketplace.wallets`,
`nutrition.animal_species`, `public.profiles.experience_level`).

`[read]` **Damit ist das Register in beide Richtungen unbrauchbar.**
`supabase db push` ist verboten. **Der Zustand wird objektweise
gemessen, nie aus dem Register gelesen.** Das ist C-554.

`[cmd]` **Der Grund steht in `supabase/README.md` selbst:** die
laufende DB entstand aus einzeln ausgefuehrten Kettenskripten, und
der Registerumtrag ist dort seit 2026-08-05 offener Punkt 1.

---

## Bereich je Agent

    supabase/_pipeline/, supabase/migrations/   Codex
    apps/web/src/app/v2/                       Claude Code
    apps/coach/src/                            Claude Code
    packages/ui, packages/scoring              Claude Code (mit Gegenprobe)
    docs/, tools/                              Orchestrator

---

## Warum G-519 A5 bis A8 immer noch nicht laeuft

`[cmd]` **Die Ratenspalte ist gebaut und NICHT eingespielt.** Selbst
gemessen, 2026-09-28, gegen die laufende Datenbank:

    goal_phases.zielrate_pct_kg_woche   fehlt
    goal_phases.tdee_herkunft           fehlt
    goals.phase_rate_rules              fehlt
    goals.nutrition_macro_rules         fehlt
    goals.tdee_history                  fehlt
    goal_phases.*kalorien*              fehlt  (richtig so, E1)

`[cmd]` **Die echten Voraussetzungen der vier Goals-Migrationen
stehen alle in der laufenden DB** — `auth.uid`, `auth.users`,
`goals.goal_phases`, `goals.nutrition_targets`, `goals.phase_am`,
`goals.touch_updated_at`, `goals.body_measurements`,
`nutrition.daily_summary`, `public.profiles`. **Der schmale Weg ist
frei.** Er laeuft als C-554 A2 bei Codex.

`[read]` **Reihenfolge:** C-554 A1 messen → die vier einspielen →
dann G-519 A5-A8.

---

## Was auf Tom wartet

    C-554 A3   der Registerumtrag fuer die uebrigen 70 — welche
               nachgetragen, welche eingespielt, welche bewusst
               nicht. Grundlage liefert Codex mit A1.
    A-79       backup/-Aufbewahrung. Der Ordner steht bei 3.958 MiB
               gegen ein Limit von 2.5 GiB, nach Toms Leerung von
               8,96 GiB. Der Ausloeser haengt am Auftrag, nicht an
               der Aenderung.
    A-78       Waechter auf Bezeichner-Ueberschneidung (Dubletten
               wie G-524 gegen G-514). Bauen oder nicht.

`[cmd]` **Keine neue Sicherung noetig fuer C-554 A2.**
`backup/20260928155121_g511_e1_vor_struktur.dump` von 15:51 ist als
struktureller Vorher-Stand gueltig — seit dann wurde nichts
eingespielt, objektweise belegt.

---

## Erledigt am 2026-09-28

`[cmd]` **Fuenf Punkte geschlossen und gepusht** (`6692face`):
G-368, G-394, G-511, G-523, G-528. G-529 auf A3 verengt.

`[cmd]` **C-546 und C-551 abgenommen** — sie standen seit dem 27.09.
mit vollem Bericht und LEERER Abnahme in `laufend_codex`. Das war
ein Versaeumnis des Orchestrators, kein Zustand der Punkte.
Strukturell nachgezaehlt: 16 Bezeichner, vier Trigger, die
Alias-Sperre als Funktion gelesen, die zusammengesetzten
Fremdschluessel. Gegenprobe eingebaut, erfundene Namen werden nicht
gefunden.

`[cmd]` **Die ZAHLEN der beiden sind NICHT nachgerechnet** — sie
brauchen einen Kettenlauf gegen eine Wegwerf-Datenbank, und der
wurde nicht gestartet, waehrend Codex gegen denselben Server
arbeitet. **Festgehalten als C-555, nicht stillgelegt.**

`[cmd]` **Drei Waechter gebaut und in beide Richtungen belegt:**
A-75 (Quellen, 8-fache Gegenprobe, fand einen echten Lesefehler in
`punkte-lesen.mjs`), A-76 (Geltung, Sollstand 149), A-77
(Werkzeugtests, 33 Pruefungen als erster Gate-Schritt, Sabotage an
echtem Code: 7 von 33 rot, byteidentisch wiederhergestellt).

`[cmd]` **Gate: 30 Schritte, gruen.** Fuenf Waechter einzeln gruen:
punkte 25/25, sammelfragen 1/1, nummern ohne Dublette, specs
149/149, encoding 21.585 Dateien sauber.

`[cmd]` **Draussen:** `3c3c4da9` · `e22a7c03` · `8fc65ed7` ·
`0483f080` · `7399aca3` · `c572fbab` · `6692face`.

---

## Die vier Entscheidungen aus G-521

    E1  die neun Phasenarten bleiben als Auswahl -- die Parameter
        haengen an der RATE, nicht an der Art            -> G-529
    E2  das Proteinband wird nach Trainingsstatus geteilt -> G-526
    E3  recomp bleibt eine Phase, die Baender sind unsere
    E4  contest_prep und expert_bb_annual bekommen eine
        eigene Struktur                                 -> G-530

`[cmd]` **kcal/Tag = 11 x Rate(% KG/Woche) x Gewicht(kg)**, aus
7700 kcal je kg. Beide Groessen werden angezeigt, gespeichert wird
die Rate.

`[read]` **Der Recherchebericht erfuellt seine Beweisanforderung
nicht:** keine Fundstelle nennt Seite oder Abschnitt, und von drei
verlangten Quellenarten fehlt die dritte ganz. **Nichts daraus ist
`[cmd]`.** G-521 A1 bleibt offen — vier tragende Zahlen ohne
Seitenbeleg: Ratendeckel 1,25, Fettboden 0,5, Proteinband nach
Trainingsstatus, die 8-12 Wochen fuer eine Diaetpause.

---

## Was als naechstes ansteht

**Codex, nach C-554:** G-529 A3 (Maximaldauer und Diaetpausen-Takt
als Funktion der Rate). Dann G-514 — die Beitragstabelle plus
recovery und supplements, der Auftrag, der den ersten USP echt
macht.

**Claude Code, nach G-522 A3:** G-519 A5-A8, sobald C-554 A2 durch
ist. Danach G-520.

**Orchestrator:** C-555 A1/A2 nachrechnen, wenn der Server frei ist.
G-530 und G-526 A1-A9 vorbereiten. Geltungszeile je Modul nachziehen,
wenn dort gearbeitet wird.

---

## Zwei Regeln

`[cmd]` **Ein Auftrag, ein Bericht.** Ketten sind erlaubt, aber sie
melden EINMAL am Ende — kein Zwischenstand.

`[cmd]` **Nichts laeuft losgeloest im Hintergrund** — ausser
`tools/server.py start`, das ein Log schreibt.

---

## Lehren vom 28.09.

`[cmd]` **Eine Punktdatei wird nicht verschoben, waehrend ein Agent
hineinschreibt.** Um 18:03 ging G-522 an Claude Code; kurz darauf
verschob der Orchestrator die Datei von `todos/` nach
`laufend_claudecode/`. Der Agent schrieb seinen Bericht in den Pfad,
den er kannte — und weil dort nichts mehr lag, entstand eine zweite
Datei mit nur seinem Abschnitt, ohne Frontmatter. Der Waechter fand
sie. **Nichts ging verloren, aber der Punkt lag in zwei Stuecken.**
Zusammengefuehrt, das Stueck entfernt.

`[cmd]` **`beruehrt.tabellen` ist eine Behauptung ueber die laufende
Datenbank, keine Inhaltsangabe.** Der Orchestrator hat in C-546 sechs
gebaute, aber nicht eingespielte Tabellen eingetragen und damit zehn
neue Befunde erzeugt. Das Original nannte nur `training.muscle_groups`
— und das war richtig. **Neue Tabellen gehoeren in den Fliesstext,
bis sie live sind.**

`[cmd]` **Drei von vier Waechtern ist kein Lauf.** Nach G-529 und
G-530 liefen `punkte`, `nummern`, `specs` und der Index —
`sammelfragen` nicht. Der Agent fand das rote Gate, nicht der
Orchestrator.

`[cmd]` **Muster gehoeren in Dateien, nicht durch die Shell.** Vier
Fehlmessungen aus PowerShell-Quoting, und danach noch eine: ein
Muster, das `alias.spalte` (`bm.user_id`, `gp.id`) fuer fehlende
Objekte hielt. **Es fehlte die Gegenprobe.** Ein Muster ohne
eingebauten Fehler misst nichts.

`[cmd]` **Der Commit-Betreff ist kein Signal dafuer, was erledigt
wurde.** C-546 und C-551 kamen unter `4972b27e` herein, Betreff
`goals(G-523, G-529, G-526)` — zwei Training-Punkte ungenannt
mitgefahren. Dasselbe bei G-512 unter `goals(G-510)`. **Die Nummer
steht im Punkt, nicht nur im Commit.**

`[cmd]` **Ein Stellvertreterbeweis ist besser als kein Beweis.**
G-527 A3 verlangte einen Nutzer ohne aktive Phase — den Zustand gibt
es nicht, solange G-511 gesperrt ist. Statt die Zeile offen zu
lassen, hat der Agent einen ECHTEN `23514` aus den acht CHECKs von
`nutrition_targets` ausgeloest und die echte Datenbankmeldung durch
die Zuordnung geschickt.

---

## Ein Befund zu dieser Datei

`[read]` **Die Tabelle oben ist ableitbar.** `docs/punkte/00-INDEX.md`
kennt aus dem Frontmatter, welche Punkte in `laufend_codex/` und
`laufend_claudecode/` liegen. Von Hand gepflegt wird sie genau so
alt wie beim letzten Mal. **Was NICHT ableitbar ist, sind die
Abschnitte darunter** — was auf Tom wartet, was als naechstes
ansteht, die Regeln und die Lehren.
