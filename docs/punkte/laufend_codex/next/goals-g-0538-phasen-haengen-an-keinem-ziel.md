---
nr: G-538
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29

braucht: [G-536, G-537]
kind_von: G-534

quellen:
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.user_goals
  dateien:
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql
    - apps/web/src/app/v2/goals/phase-echt.tsx
    - apps/web/src/app/v2/goals/phase-setzen.tsx

zahlen:
  gemessen: 2026-09-29
  goal_id_nullable: true
  offene_phasen_je_nutzer_erlaubt: 1
  offene_phasen_je_ziel_erlaubt: null
---

# Die Phasen haengen an keinem Ziel — die Wurzel

**Tom, 2026-09-29, 11:56:** *„subnav phase engine: user kann seine goals
planen, terminieren, editieren."*

`[read]` `supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql:88`
traegt als Ueberschrift der Tabelle das Gegenteil:

```
-- 2. Phasen, unabhaengig vom konkreten Ziel waehlbar.
goal_id  UUID REFERENCES goals.user_goals(id) ON DELETE SET NULL,
```

und der Kommentar bestaetigt es: *„Die Phase ist optional an ein Ziel
gebunden, aber fachlich unabhaengig waehlbar."*

**Daraus folgt alles, was auf dem Bildschirm steht.** Der Reiter bietet
Phasentypen zur Auswahl an, weil er keine Ziele kennt. Er kann nicht
terminieren, weil er nicht weiss, *was* er terminieren soll. Tom sieht
eine Typenliste, wo eine Zeitachse seiner Ziele stehen muesste.

## Der zweite Fehler aus derselben Annahme

`[read]` `uq_goal_phases_one_open` erlaubt **genau eine offene Phase je
Nutzer**:

```sql
CREATE UNIQUE INDEX uq_goal_phases_one_open
  ON goals.goal_phases(user_id) WHERE actual_end_date IS NULL;
```

Tom sagt *„einzelne oder mehrere ziele"*. Fettabbau und „Bench Press 1RM
130 kg" laufen parallel — beide sind terminiert, beide haben ein
Zeitfenster. Der Index verbietet es.

**Richtig ist: eine offene Phase je Ziel**, nicht je Nutzer.

## Warum das Altrepo diese Tabelle nicht hatte

`[cmd]` Keine SQL-Datei in `referenz/lumeos-2026/` nennt `goal_phases`
oder `phase_type`. Die Phasen waren dort **normale Ziele**, und
`goal_type_new` trug die Strategie.

**Tom, 2026-09-29:** *„da wirst die einzelnen phasen als normale goals
finden, und phase engine ist nur ein builder der diese einzel goals
plant."*

`goal_phases` ist als **dritte Struktur** entstanden, die weder Schicht 1
noch Schicht 2 ist: neun `phase_type`-Textwerte plus `variant` plus
freies `parameters`, parallel zu `user_goals` — weil der Katalog fehlte
(G-536). Die Tabelle bleibt, aber ihre Rolle aendert sich: sie ist die
**Terminierung eines Ziels**, nicht ein Objekt fuer sich.

## Was zu tun ist — zwei Bereiche, zwei Agenten

### Datenbank (Codex)

1. `goal_id` wird **NOT NULL**. Die Seedzeilen ohne Ziel brauchen davor
   eine Zuordnung oder fallen — das ist eine Datenentscheidung, keine
   stille Wahl: melden, was dort steht, dann entscheidet Tom.
2. `uq_goal_phases_one_open` von `(user_id)` auf `(goal_id)`.
   `ON DELETE SET NULL` wird `ON DELETE CASCADE` — eine Terminierung ohne
   Ziel ist sinnlos.
3. `goal_phase_start` bekommt `goal_id` als Pflichtargument und faellt
   ohne. Heute kann sie eine Phase ohne Ziel anlegen.
4. Die Tabellen- und Spaltenkommentare korrigieren: *„unabhaengig vom
   konkreten Ziel"* ist die Annahme, die diesen Punkt erzeugt hat. Wer
   sie stehen laesst, baut sie nach.

### Oberflaeche (Claude Code), nach dem Datenbankteil

5. Der Phase-Reiter zeigt **die Ziele des Nutzers** mit ihrem
   Zeitfenster, nicht eine Liste von Phasentypen.
6. **Terminieren** heisst Ankerdatum. `module-goals-editor.jsx:280-310`
   zeigt, wie: Showdatum oder Zieldatum setzen, und Prep start, Mid,
   Late, Refeeds, Peak week, Show day rechnen **rueckwaerts** daraus.
   Das ist der Rechenweg, den Tom mit „terminieren" meint.
7. Eine Strategie aus dem Katalog (G-536) an ein Ziel haengen — das ist
   „planen". Mehrere in Folge ergeben das Programm; der Jahresplan ist
   fuenf Eintraege hintereinander.

## Reihenfolge

Nach G-537 (Ziele anlegbar) und G-536 (Katalog). Vorher gibt es weder
Ziele zu terminieren noch Strategien zum Anhaengen.

**G-539 (der Editor) sitzt darauf auf**, nicht daneben: „editieren" ist
der dritte Teil von Toms Satz und braucht die Terminierung, weil der
Editor Zeitfenster verschiebt.

---

## Auftrag — Teil 1, Datenbank, geht an Codex

Punkte 1 bis 4 oben. Dazu die Nachweise:

- vor der Umstellung: **wie viele Zeilen haben `goal_id IS NULL`** und
  wem gehoeren sie. Das ist eine Datenentscheidung — melden, dann
  entscheidet Tom, ob sie eine Zuordnung bekommen oder fallen. Nicht
  still zuordnen.
- `uq_goal_phases_one_open` neu auf `(goal_id)`: zwei offene Phasen an
  **einem** Ziel muessen fallen, zwei offene Phasen an **zwei** Zielen
  muessen durchgehen. Beide Richtungen zeigen, sonst misst der Index
  nichts.
- `goal_phase_start` ohne `goal_id` muss fallen, mit muss durchgehen.
  Auf `test-user@lumeos.local`, nicht auf `dev`.
- die alten Kommentare im Vorher/Nachher-Vergleich, woertlich.
- `pnpm gate` gruen · Wegwerf-DB verworfen mit Zahl · kein `db push` ·
  live einspielen · nichts committen.

**Reihenfolge:** erst wenn G-536 live ist. Vorher gibt es keinen
`strategie_code`, an den die Terminierung haengen koennte.

## Auftrag — Teil 2, Oberflaeche, geht danach an Claude Code

Punkte 5 bis 7 oben. Wird geschrieben, wenn Teil 1 abgenommen ist — die
Zeitachse braucht die Spalten, die Teil 1 setzt.
