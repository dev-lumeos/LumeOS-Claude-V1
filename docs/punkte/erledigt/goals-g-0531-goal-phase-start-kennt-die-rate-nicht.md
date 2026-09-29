---
nr: G-531
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
beauftragt: 2026-09-29
agent: codex
erledigt: 2026-09-29
commit: 309db7e1

braucht: []
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
    - apps/web/src/lib/goals/phase-write.ts

zahlen:
  gemessen: 2026-09-29
  parameter_der_funktion: 6
  davon_fuer_die_rate: 0
  arten_nicht_anlegbar: 3
  arten_gesamt: 9
---

# G-531 - `goal_phase_start` kann drei der neun Phasenarten nicht anlegen

## Der Befund

`[cmd]` **`goals.goal_phase_start` hat sechs Parameter, und keiner ist
die Rate** (gemessen ueber `pg_get_function_arguments`):

    p_phase_type text
    p_gueltig_ab date DEFAULT CURRENT_DATE
    p_goal_id uuid DEFAULT NULL
    p_projected_end_date date DEFAULT NULL
    p_variant text DEFAULT NULL
    p_parameters jsonb DEFAULT '{}'

`[cmd]` **Ihr Rumpf erwaehnt `zielrate` NULL Mal** und fuegt trotzdem in
`goals.goal_phases` ein (gemessen ueber `pg_proc.prosrc`).

`[cmd]` **Und `goal_phases_zielrate_passt_zur_art` verlangt die Rate
`NOT NULL` fuer `fat_loss`, `lean_bulk` und `mini_cut`.**

`[read]` **Damit sind drei von neun Phasenarten ueber die Funktion nicht
anlegbar.** Eine Funktion, die die Spalte nie setzt, kann keine Zeile
erzeugen, deren CHECK sie verlangt.

`[cmd]` **Claude Code hat es dreimal gemessen** (G-519, mit
angemeldeter Sitzung):

    goal_phase_start('fat_loss','2026-09-29')
      -> ERROR: new row for relation "goal_phases" violates check
         constraint "goal_phases_zielrate_passt_zur_art"

`[read]` **Der Orchestrator konnte es NICHT nachmessen:** derselbe
Aufruf als `postgres` bricht mit `Anmeldung erforderlich` ab, weil
`auth.uid()` NULL ist — lange vor dem CHECK. **Die Bestaetigung ist
deshalb eine Ableitung aus den zwei gemessenen Tatsachen oben, plus
Claude Codes Messung mit Sitzung.**

## Wie es dazu kam

`[read]` **Die Funktion ist aelter als E1.** Sie stammt aus der Zeit, in
der das Kaloriendelta in `p_parameters` steckte und die Phasenart allein
entschied. **E1 hat die gespeicherte Groesse zur Rate gemacht und den
CHECK dazugestellt — die Anlegefunktion wurde nicht mitgezogen.**

`[cmd]` **Der CHECK ist `NOT VALID`**, also greift er nur fuer neue und
geaenderte Zeilen. **Deshalb ist nichts kaputtgegangen; es ist nur
nichts mehr anlegbar.**

## Was die Oberflaeche deshalb tut, und warum das nicht bleiben darf

`[cmd]` **`apps/web/src/lib/goals/phase-write.ts` hat einen
zweigeteilten Schreibweg** (G-519, abgenommen): ohne Rate die Funktion,
mit Rate ein `INSERT` mit vorheriger Sperrpruefung. Die Zeilenschutzregel
`goal_phases_insert` erlaubt es dem Eigentuemer.

`[read]` **Der Bruch ist benannt, nicht versteckt:** die Sperrpruefung
vor dem INSERT ist **kein gleichwertiger Ersatz** fuer die
`23505`-Sperre der Funktion — zwischen Frage und Schreiben liegt ein
Augenblick. **Bei einer Formulareingabe hinnehmbar. Als Dauerzustand
nicht**, denn die Regel ,,eine laufende Phase je Nutzer" liegt dann
zweimal vor: einmal in der Datenbank, einmal im Anwendungscode.

`[read]` **Zwei Orte fuer eine Regel sind die Ursache von Drift** —
dasselbe Muster wie die Ableitungsregeln, die laut
`supabase/README.md` nur in `020` stehen duerfen.

## Nachweiszeilen

**A1** — **Ein Rate-Parameter an `goal_phase_start`**, benannt wie die
Spalte (`p_zielrate_pct_kg_woche numeric DEFAULT NULL`), durchgereicht
in den INSERT. **Die Vorgabe bleibt NULL**, damit die sechs Arten ohne
Pflichtrate unveraendert anlegbar sind.

**A2** — **Die Funktion prueft die Vorzeichenregel NICHT selbst.** Der
CHECK tut das schon, und eine zweite Pruefung im Rumpf waere die
Doppelung, die dieser Punkt beseitigt. **Was die Funktion tut, ist
durchreichen und den Datenbankfehler als Hindernis weitergeben** — den
Weg dafuer hat G-527 gebaut (`hindernisAusFehler`, `23514`).

**A3** — **Gegenprobe in beide Richtungen, mit angemeldeter Sitzung
(nicht als `postgres`):**

    fat_loss ohne Rate        -> faellt am CHECK
    fat_loss mit -0,5         -> INSERT 0 1
    lean_bulk mit -0,5        -> faellt (Vorzeichen)
    peak_week mit 0,5         -> faellt (muss NULL sein)
    maintenance mit 0,0       -> geht
    zweite laufende Phase     -> faellt mit 23505

**A4** — **Wenn A1 steht, faellt der zweigeteilte Schreibweg in
`phase-write.ts` weg.** Das ist Claude Codes Bereich und wird ein eigener
Punkt, sobald die Funktion liegt. **Nicht in diesem Auftrag anfassen.**

**A5** — **Zu entscheiden, nicht anzunehmen:** ob der CHECK bei
dieser Gelegenheit von `NOT VALID` auf `VALID` geht. `[cmd]` Dafuer
muessten alle Bestandszeilen ihn erfuellen, und das ist zu messen,
nicht zu hoffen. **Wenn eine Zeile faellt, bleibt er `NOT VALID` und
der Grund wird ein Punkt.**

**A6** — Wegwerf-Datenbank, danach verworfen, mit genannter Zahl
(A-80). **Kein `supabase db push`** (C-554). Nichts committen.

---

## Vorbereiteter Auftrag - Codex, geschrieben 2026-09-29, 08:40

**Noch nicht raus.** Geht raus, wenn G-514 zurueck ist.

    Bereich: supabase/_pipeline/, supabase/migrations/
    Fremd:   apps/ (Claude Code) · docs/ (Orchestrator)

`[read]` **Dieser Punkt geht VOR G-529 A3**, obwohl A3 aelter ist: A3
ergaenzt die Struktur um Dauer und Pausentakt, dieser Punkt macht drei
von neun Phasenarten ueberhaupt erst wieder anlegbar — und nimmt eine
Regel aus dem Anwendungscode zurueck in die Datenbank.

**Der Auftrag sind A1 bis A6 oben, in dieser Reihenfolge.** A4 ist
ausdruecklich NICHT deiner; A5 ist eine Messung, deren Ergebnis eine
Entscheidung sein kann.

## Abnahme - Orchestrator, 2026-09-29, an der laufenden Datenbank

`[cmd]` **Nach dem Einspielen selbst gemessen:**

    Funktion                    auth.uid()   request.jwt.claim.sub
    goal_phase_start                 t                 f
    goal_phase_end                   t                 f
    phase_transition_respond         t                 f

`[cmd]` **Die Signatur traegt den Parameter**, und es gibt **GENAU EINE**
— die alte sechsparametrige ist entfernt. `[read]` **Das ist der
wichtigere Teil:** blieben beide stehen, wuerde ein Aufruf ohne Rate
stillschweigend die alte Fassung treffen und wieder am CHECK fallen.
**Eine Ueberladung waere der naechste Geist gewesen.**

`[cmd]` **`backup/` bytegenau unveraendert:** 65 Dumps, 11.499 Dateien,
4.159.172.208 Byte. **Kein neuer Dump, und die Begruendung traegt** — es
wurden reproduzierbare Funktionsdefinitionen ersetzt.

`[cmd]` **Der CHECK bleibt `convalidated = f`**, wie verlangt.

`[cmd]` **Die Livesuche findet nur noch `auth.uid` selbst plus sechs
Anwendungsleser** — das ist G-535.

### Was dieser Punkt wirklich geloest hat

`[read]` **Die Phase engine war nicht halb fertig, sie war unbedienbar**
— fuer jeden Nutzer, immer, seit `request.jwt.claim.sub` mit PostgREST 9
verschwand. **Anlegen, Beenden und Wechseln haben nie funktioniert.**

`[read]` **Die Lehre:** ein Fehler, der ,,Anmeldung erforderlich" sagt,
wurde als Sitzungsproblem gelesen. **Er war ein Namensproblem.** Die
Frage, die ihn aufdeckte, war nicht ,,warum schlaegt der Aufruf fehl",
sondern ,,WIE prueft die Funktion die Sitzung" — eine Frage an den
Quelltext, nicht an das Verhalten.
