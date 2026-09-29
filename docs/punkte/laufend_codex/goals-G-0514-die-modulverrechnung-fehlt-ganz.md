---
nr: G-514
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-26
agent: codex
beauftragt: 2026-09-29

braucht: []
kind_von: G-510
entscheidung: E-91

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - apps/web/src/app/v2/goals/tab-phase.tsx
    - docs/specs/Goals/DATABASE.md

zahlen:
  gemessen: 2026-09-26
  spec_tabellen: 10
  davon_gebaut: 6
  davon_ohne_treffer: 4
  spec_views: 2
  views_gebaut: 0
---

# G-514 - die Modulverrechnung, der Zweck des Moduls, fehlt ganz

## Der Befund

`[cmd]` **`docs/specs/Goals/DATABASE.md:9-27` nennt zehn Tabellen
und zwei Sichten.** `[cmd]` **Gemessen 2026-09-26 gegen die
Datenbank und das Repo:**

    user_goals                      gebaut      11 Zeilen
    goal_phases                     gebaut       5
    goal_milestones                 gebaut      13
    body_measurements               gebaut     362
    body_circumferences             gebaut      54
    progress_photos                 gebaut       0
    ---------------------------------------------------
    goal_contributions              FEHLT    0 Treffer
    goal_adjustments                FEHLT    0 Treffer
    tdee_settings                   FEHLT    0 Treffer
    weekly_reports                  FEHLT    0 Treffer
    VIEW user_goal_dashboard        FEHLT    0 Treffer
    VIEW weekly_contributions_summ. FEHLT    0 Treffer

`[read]` **Die vier fehlenden sind nicht irgendwelche vier.**

## Warum genau diese vier zaehlen

`[cmd]` **`docs/specs/Goals/README.md:3` und
`CONSOLIDATED_KNOWLEDGE.md:14`:** *,,Goals ist KEIN weiteres
Feature-Modul — es ist der Betriebssystem-Kern."*

`[cmd]` **`goal_contributions` ist die Tabelle, die das einloest** —
sie haelt, **was jedes Modul zu einem Ziel beitraegt.**

`[read]` **Toms Rahmen E-91 sagt dasselbe in seinen Worten:** Goals
ist das, **WOFUER** die vier anderen erfassen. `[read]` **Die
Tabelle, in der dieses *wofuer* zusammenlaeuft, gibt es nicht.**

## Was deshalb Attrappe bleiben MUSS

`[cmd]` **Der ganze `cross`-Reiter** — fuenf Kacheln, alle mit
Marke (`tab-phase.tsx:585-703`):

    Ring-Kopf
    Module contributions       braucht goal_contributions
    Bottleneck identified      braucht goal_contributions
    Achievement probability    braucht goal_contributions
    Weekly report              braucht weekly_reports

`[cmd]` **Und `Cross-module health` im `goals`-Reiter**
(`fehlende-kacheln.tsx:282`).

`[read]` **Die Marken sind richtig gesetzt** — sie nennen Quelle und
Grund. `[read]` **Dieser Punkt sagt nur, dass der Grund EINE Ursache
hat und nicht sechs.**

## Die weiteren Bezeichner ohne Treffer

`[cmd]` **Aus der Spec, null Vorkommen im Repo:**

    phase_calorie_modifier   DATABASE.md:221   -> siehe G-511
    achievement_probability  DATABASE.md:63
    realism_score            DATABASE.md:69
    contribution_score       DATABASE.md:146
    tdee_adaptive/_active    DATABASE.md:215-216
    macro_cycling            DATABASE.md:224

`[cmd]` **`calorie_target` kommt viermal vor** — **ausschliesslich
als `calorie_target_hit_rate` in Coach-Attrappen.** **Im
Goals-Modul: null.**

## Was die Spec anders baut, als wir gebaut haben

`[read]` **Kein Widerspruch, aber es muss jemand wissen:**

`[cmd]` **Die Spec legt die Zielwerte in `goals.tdee_settings`.**
`[cmd]` **Gebaut ist `goals.nutrition_targets`** — **ein Name, den
keine der zehn Specdateien nennt.**

`[cmd]` **Die Spec beschreibt einen Hono-Dienst mit 16 Routen auf
Port 5900** (`API.md:4-25`). `[cmd]` **Gebaut ist Next.js mit
direktem Supabase-Zugriff.**

`[read]` **Beides sind getroffene Entscheidungen, keine Luecken** —
**aber `docs/ssot/00-SPEC-ABGLEICH.md` sollte sie tragen**, sonst
meldet der naechste Abgleich sie wieder als Fehlmenge.

## Nicht in diesem Punkt zu loesen

`[read]` **Ob `goal_contributions` gebaut wird, ist eine
Entscheidung ueber den Umfang** — **sie beruehrt alle fuenf
Module** und gehoert zu Codex, nicht in `apps/`.

`[read]` **Dieser Punkt stellt nur fest, dass sechs Kacheln auf
EINE fehlende Tabelle warten** — und dass das nirgends an einer
Stelle stand.

## Nachtrag 2026-09-28 — aus G-524 zusammengefuehrt

`[cmd]` **G-524 (27.09.) hat dieselbe Messung noch einmal gemacht**
und ist eine Dublette dieses Punktes. Drei Zeilen daraus sind neu
und stehen deshalb hier:

**1. Zwei Teile von `tdee_settings` haben KEINEN Ersatz.**
`[cmd]` `macro_cycling` und `cycling_config` haben null Treffer im
ganzen Repo. **Das ist der Kern von RECOMP** —
`PHASE_MODELS.md` gibt Trainingstag `TDEE+200` und Ruhetag
`TDEE-300`. Ohne diesen Block hat RECOMP keinen Ort, an dem die
zwei Werte stehen koennten. Die Zielwerte selbst sind ersetzt
(`goals.nutrition_targets` plus `goals.adaptive_tdee`).

**2. Der Gueltigkeitszeitraum wird NICHT zur Flagge zurueckgebaut.**
`[cmd]` `DATABASE.md` Abschnitt 2 schreibt `is_active BOOLEAN` und
`UNIQUE (user_id) WHERE (is_active = true)` in die
Tabellendefinition. **Das ist kein gueltiges PostgreSQL** — eine
teilweise Eindeutigkeit geht nur als Index. Live steht sie als
`uq_goal_phases_one_open` auf `(user_id) WHERE actual_end_date IS
NULL`, und `goal_phases` hat `gueltig_ab`/`actual_end_date` statt
einer Flagge. **Damit ist die Phasenhistorie befragbar.** Wer die
Spec woertlich einspielt, baut das zurueck.

**3. `DATABASE.md` ist eine Beschreibung, kein Skript.** Abschnitt 9
schreibt `UUID FK -> goals.user_goals` als Prosa in einen
SQL-Block.

`[read]` **Die TDEE-Reihe ist aus diesem Punkt herausgeloest** und
geht als eigener Auftrag raus: sie blockiert G-523 und damit G-529.
`tdee_settings` waere nur ein Zustand — gebraucht wird eine Reihe.

## Die TDEE-Reihe ist gebaut — 2026-09-28

`[read]` **Ein Buchhaltungsfehler des Orchestrators gehoert hier
zuerst hin:** der Auftrag an Codex hiess ,,G-524, nur die
TDEE-Reihe" — und G-524 wurde am selben Nachmittag als Dublette
dieses Punktes geschlossen, **waehrend der Auftrag lief.** Die
Reihe hatte danach keinen offenen Punkt mehr. Sie wird deshalb hier
gefuehrt, wo die Tabellenmenge steht, aus der sie stammt.

**Die Lehre:** eine Nummer, die in einem laufenden Auftrag steht,
wird nicht geschlossen, solange der Auftrag laeuft. Der
Punkteordner ist der Zustand — auch fuer die Agenten.

### Was gebaut ist

`[cmd]` **Eine datierte Reihe**
(`supabase/migrations/20260928150000_g524_tdee_history_ewma.sql`)
mit Rohwert, Vorgaengerwert, geglaettetem Wert, alpha, Methode,
`confidence` und `reliable`.

`[cmd]` **Struktur, Schreibweg und Rueckfuellung sind getrennt** —
`524_tdee_history_writer.sql` und `524_tdee_history_backfill.sql`
liegen in der Kette, nicht in der Migration. **Das war mein
Auftragsfehler:** A4 verlangte ein Rueckfuellen, ohne den Ort zu
nennen, und der Datenlogik-Waechter fiel zu Recht. Codex hat es
selbst getrennt, bevor die Korrektur ihn erreichte.

`[cmd]` **Die Rueckfuellung rechnet, sie uebernimmt nicht.** Aus 362
Koerpermessungen und 730 Tageszusammenfassungen entstanden 218
Werte (109 je Nutzer mit Messungen). Der erste dev-Wert: Rohwert
2129,4 gegen Formelstart 3202,1 ergibt geglaettet **2880,3** —
nachgerechnet: 0,3 * 2129,4 + 0,7 * 3202,1 = 2880,29.

`[cmd]` **`test-user@lumeos.local` hat 0 Koerpermessungen und 7
Tageszeilen** (selbst gemessen) — also keine rueckwirkend geratene
Reihe, und der Schreibweg meldet `insufficient_intake_days`.
**Eine fehlende Reihe ist kein Nullwert.**

### Ein Befund aus dem Vorgaengerrepo

`[cmd]` **`tdee_history` gab es dort, und es war tot:** hoechstens
taeglich eindeutig (nicht woechentlich), weder Leser noch Schreiber,
null Datenzeilen. Eine dokumentierte Abloesung ist nicht auffindbar.

`[read]` **Das aendert die Lesart der Struktur:** sie ist ein
Entwurf, der nie lief, keine erprobte Loesung. Uebernommen wurde
die Idee der Reihe, nicht ihre Ausfuehrung.

## Auftrag - Codex, raus 2026-09-29, 08:00

**Nachgetragen 08:15.** Dieser Auftrag ging als Text im Gespraech raus,
nicht in dieser Datei — gegen `00-LIESMICH.md:22-41`. Er steht hier
nach (A-81 A2).

    Bereich: supabase/_pipeline/, supabase/migrations/
    Fremd:   apps/ (Claude Code baut dort G-519 A5-A8) ·
             packages/scoring/ (fertig) · docs/ (Orchestrator)

### Der Vertrag ist gebaut - lies ihn, erfinde ihn nicht

`[cmd]` **`packages/scoring/src/beitrag.ts`, `dc55728a`, abgenommen:**
36 von 36 gruen, die vier Gewichtungsreihen summieren exakt auf 1,00
(selbst nachgerechnet), Sabotage in beide Richtungen belegt.

Er beantwortet drei Fragen, und die Tabelle muss zu ihnen passen:

    WAS        score 0..100 plus ein details-Objekt je Modul
               (DATABASE.md:149-160)
    WANN       tag <= stichtag. Eine FESTLEGUNG des Vertrags, kein
               Spec-Zitat - die Spec sagt dazu nichts.
    KEIN WERT  score: number | null PLUS ein Grund. Eine 0 ist ein
               Ergebnis, ein null ist keins.

### A1 - die Tabelle

`goals.goal_contributions` nach `DATABASE.md` Abschnitt 3, mit
`UNIQUE (goal_id, module, contribution_date)` und dem Modul-CHECK ueber
die fuenf Module. **Struktur in `migrations/`, Daten und Ableitungen in
`_pipeline/`** — die Grenze prueft `migration-datenlogik-pruefen.mjs`,
und sie ist bei G-524 zu Recht gefallen.

### A2 - recovery und supplements daran haengen

`[cmd]` **Gemessen (G-522 A1), je Modul gefragt, ob es ueberhaupt einen
Tagesscore liefern KANN:**

    recovery      recovery.scores.score               liegt vor
                  370 Zeilen, 3 Nutzer, alle gefuellt
    supplements   daily_intake_summary.compliance_pct rechenbar
                  Ansicht, 274 Zeilen, 3 Nutzer
    nutrition     kein gespeicherter Score - nur im Browser gerechnet
    training      nichts
    medical       nichts

**Nur die ersten zwei in diesem Auftrag.**

### Die Falle

`[cmd]` **`recovery.scores` reicht bis 2026-11-06 — 78 von 370 Zeilen
liegen in der ZUKUNFT.** Testdaten. Der Vertrag hat entschieden:
`tag <= stichtag`. Die Schreibseite haelt sich daran, und du belegst es
mit einer Zeile, die zeigt, dass ein Zukunftswert NICHT eingeht.

### A3 - ein fehlendes Modul ist kein schlechtes

`[cmd]` **`SCORING.md:66` rechnet ein fehlendes Modul still als 0**
(`contributions[module] ?? 0`). Der Vertrag rechnet genauso, **sagt es
aber**. Die Tabelle muss den Unterschied tragen: **kein Eintrag ist
nicht dasselbe wie ein Eintrag mit 0.** G-524 belegt, warum das zaehlt.

### Zu belegen

die Tabelle mit ihren Regeln, Vorher-Nachher objektweise · Zeilenzahlen
je Modul mit Stichtag · der Zukunftsbeleg · kein Eintrag gegen
Eintrag-mit-0 unterscheidbar · Nachweise auf `test-user@lumeos.local` ·
`pnpm gate` gruen · **die Wegwerf-Datenbank VERWORFEN und die Zahl
genannt** (A-80: 150 Datenbanken mit 207 GB stehen herum, 49 heissen
`_final`) · **kein `supabase db push`** (C-554).

### Nicht in diesem Auftrag

`phase_rate_rules` fuellen (haengt an G-521 A1) · den CHECK
`goal_phases_zielrate_passt_zur_art` auf `VALID` setzen ·
`findBottleneck` (gehoert nach `apps/`, und erst wenn Beitraege stehen)
· nutrition in eine Zeile je Tag schreiben (naechster Auftrag).

Nichts committen, nichts pushen.

## Abnahme - Orchestrator, 2026-09-29

_(Zwei Stunden zu spaet. Codex hat um 09:00 berichtet; der Orchestrator
hat dazwischen zwei andere Punkte bearbeitet. **Dasselbe Versaeumnis wie
bei C-546 und C-551**, die er am selben Morgen dafuer kritisiert hat.)_

`[cmd]` **Merkmale gezaehlt, nicht nachgebaut:**

    supabase/migrations/20260929081000_g514_goal_contributions.sql   da
    _pipeline/11_goals/514_goal_contribution_writers.sql             da
    _pipeline/11_goals/514_goal_contribution_backfill.sql            da
    _pipeline/_validierung/514_goal_contributions_pruefen.sql        da
    kette.json und schema-sollstand.json nachgezogen                 da

`[cmd]` **Die Grenze ist gewahrt:** Struktur in `migrations/`, Daten und
Rueckfuellung in `_pipeline/`. **Das ist der Punkt, an dem G-524 gefallen
ist** — der Datenlogik-Waechter hat dort zu Recht gegriffen, und hier ist
es von Anfang an getrennt.

`[cmd]` **Die Zukunftsgegenprobe ist die tragende:** `recovery.scores`
enthaelt zwei echte Werte vom 2026-11-06 mit Score 74,9. Der Schreibweg
lief mit Stichtag 2026-09-29, und der 2026-11-06 ging NICHT ein.
`[read]` **Damit ist die Festlegung des Vertrags — `tag <= stichtag` —
nicht nur uebernommen, sondern am echten Datensatz belegt.**

`[cmd]` **Und der Unterschied, auf den es ankommt, ist belegt:** ein
Score 0 blieb als vorhandene Zeile stehen, ein Tag ohne Quelle erzeugte
keine Zeile. `[read]` **Kein Eintrag ist nicht dasselbe wie ein Eintrag
mit 0** — genau das, was `SCORING.md:66` stillschweigend gleichsetzt und
der Vertrag benennt (`ohne_wert`).

`[cmd]` **Gemessen zum Stichtag:** recovery 294 von 370 Zeilen bis zum
Stichtag (76 danach), supplements 274 von 274. Erwartete Beitraege fuer
aktive Ziele: 514 und 362. Auf `test-user@lumeos.local` 30 Recovery- und
90 Supplement-Tage, **darunter neun echte Supplement-Scores 0.**

`[cmd]` **Voller Kettenlauf 290 Schritte gruen, `pnpm gate` gruen, drei
Wegwerf-Datenbanken verworfen, 0 verblieben.**

### Was offen bleibt

`[read]` **Nicht live eingespielt.** `goals.goal_contributions` existiert
als Migration, nicht in der laufenden Datenbank. **Solange das so ist,
bleibt der Cross-module-Reiter Attrappe** — und er ist laut
`116-goals-anbindung.md` der Reiter, dessen Blocker damit faellt.

`[read]` **nutrition, training und medical liefern weiterhin nichts.**
nutrition rechnet im Browser, die anderen zwei haben keinen Tagesscore.
**Das sind drei weitere Auftraege, und zwei davon gehoeren nicht zu
Goals.**

---

## Warum dieser Punkt offen bleibt, Orchestrator 2026-09-29 15:15

`[cmd]` **Der Bau ist abgenommen (Abnahme oben, Code in `309db7e1`) — aber
die Tabelle ist nicht live:**

    SELECT count(*) FROM goals.goal_contributions
    ERROR: relation "goals.goal_contributions" does not exist

`[read]` **Damit ist es ein fertiges Bauteil ohne Aufrufer** — dieselbe
Art Befund, die heute dreimal gefunden wurde, nur eine Ebene tiefer: die
Migration existiert, die Datenbank kennt sie nicht. Und solange das so
ist, bleibt der Cross-module-Reiter Attrappe, obwohl sein Blocker
gebaut daliegt.

**Der offene Teil ist eine Einspielung, kein Bau.** Er gehoert in Codex'
naechste Runde nach G-538 und G-543 — beide fassen dieselbe Kette an, und
drei Einspielungen gleichzeitig trennen keinen Nachweis mehr.

`[read]` **Nicht vergessen dabei:** nutrition, training und medical
liefern weiterhin nichts. nutrition rechnet im Browser, die anderen zwei
haben keinen Tagesscore. Das sind drei eigene Auftraege, und zwei davon
gehoeren nicht zu Goals.
