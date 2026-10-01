---
nr: G-568
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-01
beauftragt: 2026-10-01
agent: claudecode

braucht: [G-563, G-564]
kind_von: G-563

quellen:
  - docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md

beruehrt:
  funktionen:
    - goals.berechne_zielwerte
  dateien:
    - apps/web/src/lib/profile/zielwerte-read.ts
---

# Die Zielwerte brauchen ihr Ziel

    AUFTRAG FUER Claude Code - G-568: zielwerte-read reicht das Ziel
                                     durch, bevor G-563 live geht
    Bereich: apps/web/src/lib/profile/
             apps/web/src/lib/goals/
             die aufrufenden Ansichten
    Fremd:   supabase/ gehoert Codex. berechne_zielwerte ist SEINE
             Funktion - aufrufen ja, aendern nein. Codex arbeitet
             gerade an G-561 (die Waechter pruefen Kilogramm statt
             Prozent).
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und Codex' Bericht in
`docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md`
— dort steht der neue Vertrag woertlich.

## Der Befund

`[cmd]` **Codex hat die Signatur woertlich gemeldet:**

    goals.berechne_zielwerte(
      p_user_id uuid,
      p_goal_id uuid,
      p_stichtag date DEFAULT CURRENT_DATE
    )

**Das Ergebnis traegt zusaetzlich `goal_id uuid`.** Die alte
Zweiparameter-Fassung bleibt als strikter Kompatibilitaetsweg und
**wirft bei mehreren aktiven Zielphasen:**
*„nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag;
Zielbezug fehlt"*.

`[cmd]` **Der Aufruf in `apps/web/src/lib/profile/zielwerte-read.ts:212`
kennt kein Ziel** — er uebergibt nur Nutzer und Datum. `[cmd]` **Live
traegt die Funktion noch die alte Signatur** (selbst nachgemessen:
`p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE`).

`[read]` **Damit ist es heute still richtig und nach dem Einspielen
sichtbar falsch:** ein Nutzer mit zwei offenen Phasen bekommt dann einen
Fehler, wo heute eine beliebige Zahl steht. **Beides ist nicht gut, aber
der Fehler ist der ehrlichere** — und er gehoert abgefangen, bevor er
auftritt.

`[read]` **Dieselbe Reihenfolge wie bei G-564:** die Anwendung zuerst,
dann das Einspielen.

## Auftrag

**A1 — messen, wer die Zielwerte liest.** Nicht nur `zielwerte-read.ts`:
jede Ansicht, die daran haengt. **Sag, wie du abgegrenzt hast**, und je
Stelle, ob dort ein Ziel bekannt ist. **Zaehle, statt zu schaetzen** — bei
G-564 waren es fuenf Stellen und genau eine betroffen.

**A2 — das Ziel durchreichen.** Der Aufruf lautet kuenftig
`{ p_user_id, p_goal_id, p_stichtag }`. Wo die Ansicht ein Ziel zeigt, ist
es dessen `goal_id`. **Wo die Ansicht keines zeigt, wird keines geraten** —
dann ist das eine Stelle fuer G-567 und gehoert gemeldet.

**A3 — das Ergebnis traegt sein Ziel.** `goal_id` kommt neu zurueck.
**Die Anzeige nennt es, sobald mehr als eine Phase laeuft** — eine
Kalorienzahl ohne ihr Ziel ist bei zwei Zielen keine Aussage. Dieselbe
Lehre wie der Phasenkopf aus G-564: zwei Zahlen auf einem Schirm brauchen
ihre Herkunft.

**A4 — der Fehler ist ein Zustand, keine Ausnahme.** Faellt die
Mehrdeutigkeitsmeldung doch irgendwo durch, zeigt die Oberflaeche sie als
Zustand — nicht als leeres Feld und nicht als HTTP 500. `ladefehler.ts`
aus G-553 ist der Weg.

**A5 — der Waechter muss den Rueckfall verbieten.** Rot, wenn ein Aufruf
ohne `p_goal_id` zurueckkommt. **An der Wirkung gemessen, nicht am Wort** —
deine letzten drei Berichte haben genau diese Falle je einmal gefunden.

**Nicht Teil:** `micronutrient_snapshot` (G-567, Entscheidung bei Tom) und
das Einspielen (bei Tom).

**Zu belegen:** Nachweise auf `test-user@lumeos.local` mit zwei Zielen und
zwei offenen Phasen · je Ziel die eigene Zahl, von Hand nachrechenbar ·
Bild mit zwei Zielen · Sabotage je Waechter in beide Richtungen ·
`pnpm gate` gruen mit Testzahl UND der Aussage zu den neun Waechtern ·
nichts committen.
