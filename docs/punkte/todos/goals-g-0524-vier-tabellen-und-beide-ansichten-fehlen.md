---
nr: G-524
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-27
quellen:
  - docs/specs/Goals/DATABASE.md
  - docs/specs/Goals/CONSOLIDATED_KNOWLEDGE.md

braucht: [G-514]
kind_von: G-514

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
  dateien:
    - docs/specs/Goals/DATABASE.md

zahlen:
  gemessen: 2026-09-27
  tabellen_in_der_spec: 10
  tabellen_live: 8
  davon_aus_der_spec: 6
  fehlend: 4
  ansichten_in_der_spec: 2
  ansichten_live: 0
---

# G-524 - vier der zehn Spec-Tabellen und beide Ansichten fehlen

## Der Befund

`[cmd]` **Schema `goals` am 2026-09-27, `pg_class` gegen
`DATABASE.md`:**

| Tabelle der Spec | live | Zeilen |
|---|---|---|
| user_goals | ja | 11 |
| goal_phases | ja | 5 |
| goal_milestones | ja | 13 |
| body_measurements | ja | 362 |
| body_circumferences | ja | 54 |
| progress_photos | ja | 0 |
| **goal_contributions** | **nein** | — |
| **tdee_settings** | **nein** | — |
| **goal_adjustments** | **nein** | — |
| **weekly_reports** | **nein** | — |

`[cmd]` **Beide VIEWs fehlen ebenfalls** — `user_goal_dashboard`
(materialisiert) und `weekly_contributions_summary`. Das Schema hat
`relkind in ('v','m')` null Treffer.

`[cmd]` **Zwei Tabellen sind zusaetzlich da, die die Spec nicht
kennt:** `nutrition_targets` (5 Zeilen) und
`phase_transition_responses` (0 Zeilen).

`[cmd]` **Alle vier fehlenden Namen haben null Treffer in 1336
Dateien** — sie sind auch nicht vorbereitet.

## Was davon ersetzt ist und was nicht

`[read]` **`tdee_settings` ist zur Haelfte ersetzt.** Die Zielwerte
liegen in `goals.nutrition_targets`, der TDEE kommt aus
`goals.adaptive_tdee`. **Zwei Teile haben aber keinen Ersatz:**

- `macro_cycling` / `cycling_config` — 0 Treffer im ganzen Repo.
  **Das ist der Kern von RECOMP:** `PHASE_MODELS.md` und
  `CONSOLIDATED_KNOWLEDGE.md` Abschnitt 4 geben Trainingstag
  `TDEE+200` und Ruhetag `TDEE-300`. Ohne diesen Block hat RECOMP
  keinen Platz, an dem die zwei Werte stehen koennten.
- die Reihe vergangener TDEE-Werte — siehe G-523 A1.

`[read]` **`goal_adjustments` ist die Ablage fuer G-520.** Der
Anpassungsalgorithmus erzeugt Aenderungen; ohne diese Tabelle
verschwinden sie. `DATABASE.md` Abschnitt 9 fuehrt den Typenkatalog,
inklusive `plateau_response` und `phase_transition`.

`[read]` **`weekly_reports` und die beiden Ansichten haengen an
G-522.** Sie fassen Beitraege zusammen, die es noch nicht gibt.

## Was NICHT zurueckgebaut wird

`[cmd]` **Die Spec ist an zwei Stellen nicht lauffaehig, live ist es
besser geloest:**

- `DATABASE.md` Abschnitt 2 schreibt `UNIQUE (user_id) WHERE
  (is_active = true)` in die Tabellendefinition. **Das ist kein
  gueltiges PostgreSQL** — eine teilweise Eindeutigkeit geht nur als
  Index. Live steht sie als `uq_goal_phases_one_open` auf
  `(user_id) WHERE actual_end_date IS NULL`, und die Probe zeigt
  genau eine offene Phase je Nutzer.
- `goal_phases` hat live **kein `is_active`**, sondern
  `gueltig_ab` und `actual_end_date` — einen Gueltigkeitszeitraum
  statt einer Flagge. Damit ist die Phasenhistorie befragbar.
  `berechne_zielwerte` und `phase_am` bauen darauf.
- `DATABASE.md` Abschnitt 9 schreibt `UUID FK -> goals.user_goals`
  als Prosa in einen SQL-Block.

`[read]` **`DATABASE.md` ist eine Beschreibung, kein Skript.** Wer
sie woertlich einspielt, baut den Zeitraum zur Flagge zurueck. Das
gehoert in den Auftrag, der die vier Tabellen nachzieht.

## Nachweiszeilen

**A1** — die vier Tabellen einzeln bewerten: was haengt an G-522,
was steht fuer sich. Ergebnis ist eine Reihenfolge, kein
Sammeleinspielen.

**A2** — `macro_cycling` / `cycling_config` mit RECOMP zusammen
entscheiden, nicht allein. Die Tabelle ohne den Rechenweg ist eine
leere Spalte.

**A3** — je Tabelle die Abweichung zur Spec begruenden, wo eine
entsteht. Der Zeitraum statt der Flagge ist eine solche Abweichung,
und sie bleibt.

**A4** — Wegwerf-Datenbank, Sicherung nach `backup/`, nie gegen die
laufende.

## DUBLETTE von G-514 — 2026-09-28

`[cmd]` **Dieser Punkt doppelt G-514 vom 26.09.** Dieselbe Messung:
zehn Spec-Tabellen, sechs gebaut, vier fehlen, beide Sichten fehlen,
`goal_contributions` als die entscheidende.

`[read]` **Der Orchestrator hat ihn am 27.09. angelegt, ohne die
offenen Punkte des Moduls anzusehen** — in derselben Sitzung, in der
A-75 darueber entstand, dass nicht gegen die Quellen geprueft wird.
Die Vier-Quellen-Regel nennt Code, Daten, Spec und Vorgaengerrepo;
**sie nennt nicht die 829 bestehenden Punkte.** Daraus wurde A-78.

`[cmd]` **Die drei einzigartigen Zeilen stehen jetzt in G-514**
(`macro_cycling` ohne Ersatz, der Gueltigkeitszeitraum bleibt,
`DATABASE.md` ist kein Skript). **Hier steht nichts, was dort
fehlt.**

`[read]` **Er wird geschlossen, nicht geloescht.** Die Nummer bleibt
belegt und die Spur lesbar — `erledigt:` und `commit:` tragen den
Commit, der diese Zusammenfuehrung macht. **Bis dahin liegt er hier
mit diesem Vermerk oben.**
