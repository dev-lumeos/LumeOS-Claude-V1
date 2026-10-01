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

erledigt: 2026-10-01
commit: 57b88381
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

## Abnahme 2026-10-01 — `57b88381`

`[cmd]` **Die Handrechnung selbst nachgerechnet, alle vier Zeilen** — eine
reine Rechnung darf der Orchestrator pruefen:

    BMR    10 x 81,4 + 6,25 x 182 - 5 x 36 + 5  =  1776,5
    TDEE   x 1,55                                =  2754
    +0,3   2754 + 11 x 0,3 x 81,4                =  3022,6
    -0,5   2754 + 11 x (-0,5) x 81,4             =  2306,3
                                  Unterschied    =   716,3

**716 kcal/Tag ist die Groesse der stillen Entscheidung**, die die alte
Fassung heute trifft. Gemessen nahm sie −0,500 — also das Defizit, bei
einem Nutzer, der auch ein Aufbauziel fuehrt.

`[cmd]` **Der A-30-Fall ist richtig geloest, und ich habe daran
gezweifelt:** `createSessionClient` steht in `zielwerte-hindernis.ts`
**einmal** — mein erster Blick las das als Import. Nachgesehen: es steht
im **Kommentar**, der erklaert, warum die Datei existiert. **Die Datei
traegt keinen einzigen Import.** `serverimport` im Gate bestaetigt 0
Treffer in 63 Client-Chunks.

## Was diese Abnahme mitnimmt

`[read]` **A1 ist wieder die Form, die traegt:** ein RPC-Aufruf, drei
Aufrufer, und je Aufrufer die Frage, ob er ein Ziel kennt. **Zwei kennen
keines, und dort wird keines erfunden** — sie bleiben offen und gehoeren
zu G-567. Das ist die dritte Meldung hintereinander, in der ein Agent an
der Stelle stehenbleibt, wo eine Entscheidung fehlt.

`[cmd]` **Und `getZielwerteAm` ruft `zielwerte_am`** — eine andere
Funktion, die G-563 nicht anfasst. **Nachgemessen, nicht angenommen.**
Genau die Abgrenzung, an der eine Zaehlung sonst kippt.

`[read]` **Zwei Saetze fuer vier Hindernisse war ein stiller Fehler:**
alles ausser `profil_unvollstaendig` bekam den Text ueber den
Kalorienfaktor, auch `keine_aktive_phase`. **Jetzt eine Quelle fuer
Anzeige und Schreibweg** — dieselbe Lehre wie der Phasenkopf aus G-564:
zwei Lesewege auf eine Tatsache laufen auseinander.

`[cmd]` **Der exhaustive `switch` hat den fuenften Satz erzwungen.** Ein
Waechter, der im Compiler sitzt, ist der billigste, den es gibt —
er kann nicht uebersehen werden und kostet keine Sekunde Laufzeit.

## Damit ist das Einspielen frei

`[cmd]` **Die Anwendungsseite steht fuer beide Datenbankaenderungen:**
G-564 (`57b88381` war G-568, G-564 lag auf `6ae14c93`) und G-568. **G-559
und G-563 koennen zusammen eingespielt werden.** Bis dahin zeigt die
Zeitachse ,,1 Phasen", wo zwei gelten, und die Zielwerte nehmen still
eine von zwei Raten — beides falsch, beides leise.
