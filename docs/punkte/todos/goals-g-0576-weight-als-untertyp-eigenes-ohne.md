---
nr: G-576
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-01

braucht: []
kind_von: G-557
entscheidung: E-89

quellen:
  - docs/entscheidungen/E-89-der-untertyp-benennt-die-messgroesse.md
  - docs/punkte/erledigt/goals-g-0557-die-zuordnung-erreicht-die-datenbank-nicht.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - apps/web/src/lib/goals/ziel-arten.ts
---

# weight wird ein Untertyp, Eigenes bleibt ohne

## Der Befund

`[cmd]` **G-557/A2 liess zwei Knoepfe offen:** `weight` und `custom`
trugen `unsicher: true` in `ziel-arten.ts` und warteten auf Tom. **Die
anderen vier Paare sind durch den Bestand belegt** —
`body_composition/cut`, `body_composition/gain_muscle`,
`lifestyle/cardio_frequency`, `performance/strength`,
`performance/training_capacity`, keine Zeile mit leerem Untertyp.

**Entschieden am 2026-10-01 (E-89):** der Untertyp benennt die
**Messgroesse**, nicht die Absicht.

    weight      die Waage ist die Messgroesse - eigener Wert, kein cut
    (leer)      "Eigenes": der Nutzer benennt die Groesse selbst

## Was zu tun ist

**A1 — `weight` als Untertyp zulassen.** `[cmd]` **`goals.user_goals`
hat keinen CHECK auf `subtype`** (gemessen in
`111_goals_ziele_phasen.sql:26`: `subtype TEXT`, ohne Einschraenkung) —
**also ist kein Schemawechsel noetig**, und der Wert ist in
`ziel-arten.ts` zu setzen, nicht in der Datenbank. **Zu pruefen, ob ein
Waechter die erlaubten Paare irgendwo haelt**, und wenn ja, dort
nachziehen.

**A2 — `unsicher: true` bei beiden entfernen** und je Knopf den Grund
als Kommentar: `weight` traegt die Waage, `custom` traegt nichts, weil
die Groesse vom Nutzer kommt.

**A3 — die Ableitung bei `body_composition` belegen.** G-557/A2 sagt:
eine abbauende Strategie ergibt `cut`, eine aufbauende `gain_muscle`,
und ohne gewaehlte Strategie bleibt der Untertyp leer und die Karte sagt
das. **Zu pruefen, ob das gebaut ist** — und wenn ja, dass es `weight`
nicht mitnimmt.

**Nicht Teil:** dass ein Ziel nur eine Messgroesse fuehrt (G-575, wartet
auf eine Entscheidung) und die Zielarten-Durchreichung selbst (G-557,
erledigt).

**Zu belegen:** je Knopf ein Ziel auf `test-user@lumeos.local` angelegt
und das Paar `(goal_type, subtype)` zurueckgelesen · Gegenprobe mit
entfernter Zuordnung · die Testzeilen danach entfernt · `pnpm gate`
gruen mit Testzahl · nichts committen.
