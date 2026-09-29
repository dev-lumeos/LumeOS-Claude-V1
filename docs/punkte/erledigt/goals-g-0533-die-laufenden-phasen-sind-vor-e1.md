---
nr: G-533
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
beauftragt: 2026-09-29
agent: codex
erledigt: 2026-09-29
commit: 46b73f6f

braucht: [G-531]
kind_von: G-529
entscheidung: E-68

quellen:
  - docs/punkte/00-INDEX.md
  - docs/specs/Goals/PHASE_MODELS.md

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql

zahlen:
  gemessen: 2026-09-29
  laufende_phasen: 3
  davon_ohne_zielrate: 3
  davon_mit_calorie_surplus_kcal: 2
  ueber_das_geplante_ende: 2
  max_tage_ueberzogen: 73
  funktionen_mit_anmeldefehler: 3
---

# G-533 - die laufenden Phasen sind vor E1, und drei Funktionen sind aus der Oberflaeche nicht erreichbar

## Der Anlass

`[read]` **Tom hat am 2026-09-29 den gerenderten Phase-engine-Reiter
geschickt** und dazu: *,,irgend ein stand der weder fisch noch vogel ist
und nach einem login fragt wenn man was anklickt einfach nur bloedsinn."*

`[read]` **Er hat recht, und der Orchestrator hatte kurz davor
geschrieben, sieben von zehn Reitern seien echt.** `[read]` **,,Echte
Daten" war der falsche Massstab** — der Reiter liest die laufende
Datenbank und zeigt trotzdem die verworfene Groesse.

## Befund 1 - die Daten sind vor E1

`[cmd]` **Gemessen gegen `goals.goal_phases`, alle laufenden Zeilen
(`actual_end_date IS NULL`):**

    phase_type    variant                  zielrate    parameters
    lean_bulk     moderate                 NULL        {"source":"GO-07 testdata",
                                                        "calorie_surplus_kcal":250}
    lean_bulk     moderate                 NULL        dieselbe
    maintenance   performance_placeholder  NULL        {"note":"Phase unabhaengig
                                                        vom konkreten Ziel", ...}

`[cmd]` **Alle drei tragen `zielrate_pct_kg_woche = NULL`** — auch die
zwei `lean_bulk`, fuer die `goal_phases_zielrate_passt_zur_art` die Rate
`NOT NULL` verlangt.

`[cmd]` **Es geht nur durch, weil der CHECK `NOT VALID` ist.** Er greift
fuer neue und geaenderte Zeilen; die Bestandszeilen hat er nie gesehen.

`[cmd]` **Und `parameters` traegt ueber alle Zeilen diese Schluessel:**

    source                 5 Zeilen
    calorie_surplus_kcal   2 Zeilen
    reason                 2 Zeilen
    note                   1 Zeile

`[read]` **`calorie_surplus_kcal` ist genau die Groesse, die E1 verworfen
hat.** Die Struktur ist seit heute live (G-511/G-529, C-554 A2), **die
Daten sind nicht mitgezogen.** Deshalb zeigt der Reiter ,,Calorie surplus
kcal 250" — er zeigt, was drinsteht.

## Befund 2 - zwei Phasen sind 73 Tage ueber ihr Ende

`[cmd]` **Von drei laufenden Phasen sind zwei ueber
`projected_end_date`, die aelteste um 73 Tage.**

`[read]` **Der Reiter sagt es als Tatsache** (*,,73 Tage ueber das
geplante Ende"*), **nicht als etwas, worauf jemand handeln muesste.** Eine
Phase, die seit zweieinhalb Monaten ueberzogen ist, ist kein Zustand,
sondern ein offener Posten.

`[read]` **Ob das ein Datenfehler der Testdaten ist oder ein fehlender
Waechter, entscheidet A3** — `PHASE_MODELS.md` fuehrt
`max_duration_weeks` als Uebergangsgrund, und G-520 baut die
Waechtertabelle gerade.

## Befund 3 - drei Funktionen sind aus der Oberflaeche nicht erreichbar

`[cmd]` **Gemessen ueber `pg_proc`:**

    Funktion                          Modus              wirft "Anmeldung erforderlich"
    goal_phase_start                  SECURITY INVOKER   ja
    goal_phase_end                    SECURITY INVOKER   ja
    phase_transition_respond          SECURITY INVOKER   ja
    phase_transition_recommendation   SECURITY INVOKER   nein

`[cmd]` **Keine der vier liest `auth.uid()` direkt** — die drei pruefen
die Sitzung auf einem anderen Weg.

`[read]` **Der ,,Annehmen"-Knopf im Wechselvorschlag ist damit nicht halb
fertig, sondern kaputt:** Tom klickt, und die Antwort ist
`phase_transition_respond: Anmeldung erforderlich`.

`[read]` **G-531 loest denselben Bau an EINER Funktion**
(`goal_phase_start` fehlt der Rate-Parameter). **Dieser Punkt fragt, ob
der Anmeldefehler dieselbe Ursache hat oder eine zweite** — und er fragt
es, weil Claude Code in G-519 fuer `goal_phase_start` schon einen
Umweg gebaut hat, den niemand fuer drei Funktionen wiederholen soll.

## Nachweiszeilen

**A1** — **Die Ursache des Anmeldefehlers benennen, an allen drei
Funktionen.** Wie pruefen sie die Sitzung, und warum scheitert der Aufruf
aus `apps/` daran? `[read]` **Erst messen, dann bauen** — wenn es
derselbe Grund wie bei G-531 ist, ist es eine Aenderung und nicht drei.

**A2** — **Die Bestandszeilen nach E1 ziehen.** Je laufende Phase eine
Zielrate, abgeleitet aus dem, was dasteht: `calorie_surplus_kcal = 250`
ergibt bei bekanntem Gewicht eine Rate ueber
`kcal/Tag = 11 x Rate x Gewicht(kg)`. **Wo das Gewicht am `gueltig_ab`
fehlt, wird die Zeile GEMELDET, nicht geraten** — und `calorie_surplus_kcal`
verlaesst `parameters`, damit nicht zwei Wahrheiten nebeneinander stehen.

`[read]` **Das ist ein Kettenschritt, keine Migration** — die
Datenlogikgrenze aus `supabase/README.md` gilt.

**A3** — **Danach den CHECK auf `VALID` heben und es belegen.** Erst wenn
A2 durch ist, kann `goal_phases_zielrate_passt_zur_art` validiert werden.
**Faellt eine Zeile, bleibt er `NOT VALID` und die Zeile wird ein Punkt.**
`[read]` **Solange er `NOT VALID` ist, ist jede Aussage ueber die Daten
eine Hoffnung.**

**A4** — **Die zwei ueberzogenen Phasen einordnen, nicht stillschweigend
beenden.** Sind es Testdaten, die falsch liegen, oder fehlt der
Waechter? `[cmd]` Die Antwort gehoert zu G-520 (Waechtertabelle) und
G-529 A3 (Hoechstdauer als Funktion der Rate). **Hier nur messen und
melden.**

**A5** — Wegwerf-Datenbank, danach verworfen, Zahl genannt (A-80). **Kein
`supabase db push`** (C-554). Nichts committen.

---

## Vorbereiteter Auftrag - Codex, geschrieben 2026-09-29, 09:35

**Noch nicht raus.** Geht raus, wenn G-531 zurueck ist — A1 haengt
direkt daran.

    Bereich: supabase/_pipeline/, supabase/migrations/
    Fremd:   apps/ (Claude Code) · docs/ (Orchestrator)

**Der Auftrag sind A1 bis A5 oben, in dieser Reihenfolge.** A1 zuerst,
weil sein Ergebnis entscheidet, ob A2 eine Aenderung ist oder drei.

## Der Auftrag, raus 2026-09-29, 11:10 - A2 ist DRINGEND

`[cmd]` **Der Grund, warum A2 nicht entfallen kann** — der Orchestrator
hatte es am Morgen gestrichen, weil Tom sagte, er fange bei null an.
**Das war falsch, und der Beweis liegt vor:**

    begin;
      update goals.goal_phases set actual_end_date = current_date
       where actual_end_date is null and phase_type='lean_bulk'
         and zielrate_pct_kg_woche is null;
    rollback;
    -> ERROR: violates check constraint
       "goal_phases_zielrate_passt_zur_art"
       Failing row: 31000000-0000-0000-0000-000000000102

    dasselbe UPDATE mit zielrate_pct_kg_woche = 0.271  ->  UPDATE 2

`[read]` **`NOT VALID` schuetzt nur vor der Pruefung BESTEHENDER Zeilen
beim Validieren — nicht vor der Pruefung bei jeder Aenderung.** Also
faellt jedes UPDATE auf eine `lean_bulk`-Zeile ohne Rate. **Die zwei
Altzeilen sind nicht veraltet, sie sind unbeweglich:** nicht beendbar,
nicht verschiebbar, nicht anfassbar.

`[cmd]` **Tom hat es am Schirm getroffen (11:07):** ,,Phase beenden" gab
`new row for relation "goal_phases" violates check constraint
"goal_phases_zielrate_passt_zur_art"`.

### Die Rate ist ableitbar, nicht zu raten

`[cmd]` **Gemessen:** beide Zeilen `lean_bulk`, `gueltig_ab 2026-06-04`,
`parameters.calorie_surplus_kcal = 250`. Gewicht am `gueltig_ab` aus
`goals.body_measurements` (Spalte `measurement_date`): **83,74 kg** fuer
`dev@lumeos.app` und `tom.seed@example.com`.

    Rate = kcal / (11 x kg) = 250 / (11 x 83,74) = +0,271 %/Woche

`[read]` **Der Kettenschritt rechnet das SELBST aus den vorhandenen
Werten** — `0.271` wird nicht hineingeschrieben. **Fehlt das Gewicht,
faellt der Schritt mit Meldung, nicht mit einem Vorgabewert.**

`[cmd]` **Und `calorie_surplus_kcal` verlaesst `parameters` im selben
Schritt.** Zwei Wahrheiten nebeneinander sind die Ursache, nicht das
Symptom.

`[cmd]` **Die `maintenance`-Zeile von `max.seed@example.com` bleibt
NULL** — der CHECK erlaubt bei `maintenance` NULL oder `|x| <= 0,1`. Sie
ist nicht blockiert.

### A3 danach

`ALTER TABLE goals.goal_phases VALIDATE CONSTRAINT
goal_phases_zielrate_passt_zur_art;` **Faellt eine Zeile, BLEIBT er
`NOT VALID` und die Zeile wird gemeldet.**

**Nachweis:** vorher faellt das UPDATE, nachher geht `goal_phase_end` auf
`dev@lumeos.app` durch (in einer Transaktion mit ROLLBACK, wie bei
G-531), `convalidated` von `f` auf `t`, und
`parameters.calorie_surplus_kcal` kommt nirgends mehr vor.

---

## Abnahme, Orchestrator, 2026-09-29 15:15

**Angenommen.** Selbst gemessen gegen die laufende Datenbank:

    goal_phases_zielrate_passt_zur_art   convalidated = t
    goal_phases_zielrate_aussengrenze    convalidated = t

    dev@lumeos.app        lean_bulk     0.271   kein calorie_surplus_kcal
    tom.seed@example.com  lean_bulk     0.271   kein calorie_surplus_kcal
    max.seed@example.com  maintenance   NULL    kein calorie_surplus_kcal

`[cmd]` **Alle drei Aussagen des Berichts halten:** der CHECK ist von
`convalidated = f` auf `t` gegangen, beide `lean_bulk`-Zeilen tragen
0,271 %/Woche, und `calorie_surplus_kcal` steht in **keiner** Zeile mehr
(vorher zwei). `maintenance` bleibt ohne Rate, wie es sein soll.

`[read]` **Die Rate ist abgeleitet, nicht gesetzt:** `250 / (11 × 83,74)
= 0,271`, mit dem Gewicht aus
`goals.body_measurements.measurement_date <= gueltig_ab`. Der Schritt
bricht ab, wenn das Gewicht fehlt oder mehrfach da ist — **er raet
nicht**, und das war die Bedingung.

### Was dieser Punkt praktisch geloest hat

`[read]` **Tom konnte die Phase vorher nicht beenden.** `NOT VALID`
ueberspringt die Pruefung der Bestandszeilen, **erzwingt sie aber bei
jedem UPDATE** — und `goal_phase_end` auf einer `lean_bulk`-Zeile ohne
Rate fiel genau daran. Die Zeile war unberuehrbar.

`[cmd]` **Und er hat sie inzwischen beendet:** `dev@lumeos.app`,
`lean_bulk`, `actual_end_date = 2026-09-29`. Der Weg funktioniert nicht
nur im Nachweis, sondern im Gebrauch.

### Ein Nebenbefund, der zu G-538 gehoert

`[cmd]` **`max.seed@example.com` ist die einzige offene Phase ohne
`actual_end_date` — und ohne `goal_id`.** Das ist genau die Zeile, an der
G-538 A1 haengt, und der Grund, warum `goal_id NOT NULL` dort auf einen
CHECK fuer laufende Phasen geaendert wurde.
