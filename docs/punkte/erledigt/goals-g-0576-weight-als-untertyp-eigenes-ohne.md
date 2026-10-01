---
nr: G-576
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-01
commit: 45583c3c
erledigt: 2026-10-01
agent: claudecode
beauftragt: 2026-10-01

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

## Auftrag

    AUFTRAG FUER Claude Code - G-576: weight wird ein Untertyp,
                                     "Eigenes" bleibt ohne
    Bereich: apps/web/src/lib/goals/ziel-arten.ts
             apps/web/src/lib/goals/__tests__/
    Fremd:   supabase/ gehoert Codex, der gerade an A-90 baut (der
             Grunddaten-Dump). docs/ gehoert dem Orchestrator, auch
             diese Punktdatei: der Bericht kommt als Antwort, nicht
             als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/entscheidungen/E-89-der-untertyp-benennt-die-messgroesse.md`.

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

---

## Abnahme — 2026-10-01, Commit `45583c3c`

`[cmd]` **In `apps/web/src/lib/goals/ziel-arten.ts` nachgezaehlt, nicht
im Bericht gelesen:**

| Merkmal | gezaehlt |
| --- | --- |
| `ZIEL_UNTERARTEN.body_composition` | `['cut', 'gain_muscle', 'weight']` — der dritte Wert ist neu |
| `ZIEL_UNTERARTEN.health` | `[]` — leer geblieben, kein erfundener Wert (C-378) |
| `ZIELKNOEPFE` | 6 Knoepfe; `weight` traegt `unterart: 'weight'` fest, `custom` traegt `unterart: null` |
| `unsicher: true` | 0 Treffer — bei beiden Knoepfen weg, je mit Begruendung im Kommentar |
| `unterartFuer` | die feste Unterart gewinnt VOR der Kategorieableitung; `KATEGORIE_ZU_UNTERART` fuehrt nur `fat_loss -> cut` und `muscle_gain -> gain_muscle` |
| A3-Zusicherung | `g554-phasenziel.test.ts:555` — `unterartFuer('weight', kat)` ist `'weight'`, fuer jede Kategorie |
| Tests in der Datei | 50 Testaufrufe in `g554-phasenziel.test.ts`, dazu `ziel-arten-eine-quelle.test.ts` (+30 Zeilen) |
| Commit | `45583c3c`, 13 Dateien, 477 Zeilen dazu, 70 weg |

`[read]` **Der Kern des Punktes war die Ableitung, nicht die Liste.**
Bis E-89 ergab `unterartFuer('weight', 'fat_loss')` den Wert `cut` —
aus einem Waageziel wurde ein Diaetziel. **Das ist jetzt durch eine
Zusicherung gehalten, die in beide Richtungen zaehlt**, und nicht durch
einen Kommentar.

`[read]` **`custom` bleibt unter der Art `lifestyle`**, und das ist im
Punkt wie im Code als Behelf benannt: der CHECK auf `goal_type` erlaubt
keinen freien Wert, `lifestyle` ist die weiteste der vier Arten. **E-89
entscheidet den Untertyp, nicht die Art** — die Art bleibt offen und
gehoert zu G-575.

`[cmd]` **Mitgekommen in diesem Commit, weil es dieselbe Minute war:**
`.gitignore` nimmt den Grunddaten-Dump und sein Manifest auf (Toms
Entscheidung: der Dump ist ein Zwischenstand, kein Quellcode), die
Punktdateien zu A-91 und G-578 entstanden mit der Auftragsvergabe, und
vier Punktdateien haben den auf `lib/fehler/` gewanderten Pfad
nachgezogen. **Kein fremder Arbeitsstand ist mitgegangen** — das war
beim ersten Versuch anders und wurde mit `git reset --soft` korrigiert,
bevor dieser Commit entstand.
