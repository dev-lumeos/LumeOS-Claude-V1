---
nr: G-538
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: codex
beauftragt: 2026-09-29
erledigt: 2026-09-29
commit: 6dd3932b

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

---

## Nachtrag, Orchestrator, 2026-09-29 14:55 — A1 korrigiert, A6 und A7 neu

Codex hat A1 gemeldet statt still zuzuordnen, und das war richtig:
**1 von 5 Phasen traegt `goal_id IS NULL`** —
`31000000-0000-0000-0000-000000000201`, `maintenance/maintain`, seit
2026-05-23 offen, `max.seed@example.com`. Max besitzt genau ein Ziel:
`performance`, „Mehr Trainingsleistung", ohne Zieldatum.

### A1 korrigiert — `goal_id` wird nicht pauschal NOT NULL

```sql
CHECK (actual_end_date IS NOT NULL OR goal_id IS NOT NULL)
```

Eine **laufende** Phase braucht ein Ziel. Eine abgeschlossene darf ohne
auskommen — sie ist Historie.

`[read]` **Der Grund ist `ON DELETE SET NULL`.** Damit bleibt es
sinnvoll: wer sein Ziel loescht, verliert nicht die Phasenhistorie. Mit
pauschalem NOT NULL muesste es CASCADE werden, und dann nimmt jedes
geloeschte Ziel seine Historie mit.

**Max' Phase wird beendet**, nicht geloescht und nicht zugeordnet:

    actual_end_date    2026-09-29
    transition_reason  Seed ohne Zielbindung, beendet bei der
                       Strukturumstellung G-538

`[annahme]` Eine Maintenance-Phase an „Mehr Trainingsleistung" zu haengen
waere erfundene Fachlichkeit — ein Performance-Ziel ist kein
Koerperzusammensetzungs-Ziel, und Max hat kein anderes. **Tom hat diese
Entscheidung ausdruecklich uebertragen:** *„ich hab diesen seed nicht
erstellt, dann loese das."* Loeschen faellt weg, Beenden reicht — die
Regel „der Orchestrator legt vor, Tom entsorgt" bleibt unberuehrt.

**A2 wird dadurch praeziser:** `uq_goal_phases_one_open` auf `(goal_id)`
greift nur fuer offene Phasen, und die tragen durch den CHECK garantiert
ein Ziel.

### A6 neu — `user_goals.linked_modules`

Aus der Abnahme von G-537. Claude Code hat die Modulwahl bedienbar
gebaut, aber **es gibt keine Spalte** — die Wahl wird gehalten und
verworfen.

    linked_modules  text[] NOT NULL DEFAULT '{}'
    CHECK           jeder Eintrag aus nutrition, training, recovery,
                    supplements, medical

`[read]` **Warum in diese Migration:** beide Spalten binden ein Ziel an
etwas — `goal_id` an seine Phase, `linked_modules` an seine
Datenquellen. Und `module-goals.jsx` sagt, warum es keine Zierde ist:
das Ziel traegt `history[]` und `pace`, `user_goals` traegt
`auto_update`. **Der Ist-Wert wird gezogen, nicht getippt.**

Kein Fuellen der Bestandszeilen. Default leer — wer die fuenf Seed-Ziele
fuellt, erfindet Verknuepfungen.

### A7 neu — `moderate_cut` auf 20 Wochen

Eine Zeile im Kettenschritt: `max_duration_weeks` von 12 auf 20.

Begruendung in **G-542**: Helms et al. 2014 nennt 12 bis 24 Wochen;
`max_duration_weeks` ist ein harter Deckel mit `force_transition`, und 12
bricht eine normale Diaet mitten im Verlauf ab. Die Sicherheit kommt von
der Diaetpause alle 8 Wochen und den Waechtern, nicht vom kurzen Deckel.

`[read]` **Das weicht bewusst von „der Vorgaenger gewinnt" ab**, weil
`max_duration_weeks` dort luekenhaft ist — von 17 Strategien tragen nur 8
einen Wert. Eine loeckrige Quelle traegt keine Entscheidung allein.
Vorlaeufig bis 2026-09-30, dann klaert Tobias es.

### Was nicht in diesen Auftrag gehoert

Die Umstellung von `berechne_zielwerte` auf die **Rate** statt
`tdee_modifier`. Codex' Zusatzbefund stimmt — E1 ist damit nicht
umgesetzt. Das wird **G-543** und kommt danach, weil es einen eigenen
Nachweis braucht: dieselbe Zahl, wo Faktor und Rate uebereinstimmen, und
eine andere, wo sie auseinandergehen.

Die Einheit ist dafuer gesetzt: **Prozent pro Woche** (G-542).

---

## Abnahme, Orchestrator, 2026-09-29 16:10

**Angenommen.** Selbst gemessen:

    phasen               5
    davon mit goal_id    4
    davon offen          1

`[read]` **Die 4 von 5 sind der Beleg, dass der CHECK richtig gebaut
ist**, nicht dass etwas fehlt: Max' beendete Phase traegt weiterhin kein
`goal_id` und darf das — `CHECK (actual_end_date IS NOT NULL OR goal_id
IS NOT NULL)`. Die eine offene Phase traegt eines, sonst haette der CHECK
gegriffen. **Historie ohne Ziel bleibt erlaubt, Laufendes nicht.**

    moderate_cut.max_duration_weeks   20   (war 12)
    contest_prep.max_duration_weeks   16   unveraendert, richtig
    user_goals                        11 Ziele, 11 mit leerem Array

`[cmd]` **`linked_modules` ist live und alle Bestandszeilen sind leer** —
wie beauftragt. Wer die fuenf Seed-Ziele gefuellt haette, haette
Verknuepfungen erfunden.

`[read]` **Max' Phase wurde beendet, nicht geloescht und nicht erfunden
zugeordnet.** Das war die Entscheidung des Orchestrators auf Toms
Uebertragung (*„ich hab diesen seed nicht erstellt, dann loese das"*), und
Codex hat sie ausgefuehrt, ohne eine Fachlichkeit zu erfinden.

### Der Zahlenbefund A5 ist vollstaendig geliefert

`[read]` Drei Konflikte, je mit der Folge in Kilokalorien bei 83,74 kg —
und einer davon ist keiner:

- **`moderate_cut`**: 20 Wochen. Die Dauer aendert das Tagesziel nicht;
  die Rate −0,75 %/Woche bleibt −690,86 kcal/Tag.
- **`lean_bulk`**: +0,25 %/Woche → +230,29 kcal/Tag. Durch G-542 geklaert.
- **`contest_prep`**: **kein Konflikt, sondern eine falsche Form.** Die
  Kalorien haengen an den Unterphasen (−300/−600/−750), nicht an einer
  durchgehenden Rate. Codex hat es richtig unangetastet gelassen.

Der letzte Punkt ist jetzt belegbar geworden — siehe **G-545**.
