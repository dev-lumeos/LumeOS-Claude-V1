# G-138 — Claude Code, 2026-08-27

Bericht: `docs/berichte/g-138-claude-code.md`

**Das Supplements-Modul liest 744 Einnahmen und rechnet Compliance —
aber niemand kann eine Einnahme eintragen. Du hast dasselbe gestern
fuer Medikamente gebaut.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **In G-211 wichen drei ab, und eine aenderte
die Bauweise:** ich hatte behauptet, ohne `active_substance_id` feuere
keine Regel. **Du hast gemessen, dass keine Regel das Feld liest.**
Denselben Blick brauche ich hier.

`[read]` **Der Punkt ist vom 2026-08-20** — die Zahlen darin sind
alt. `[cmd]` **Heute gemessen:**

    im_katalog sichtbar     412   (im Punkt steht 290)
    intake_logs             744   (im Punkt 360 — das ist dev allein)
    user_stacks               3
    stack_items              11

## 1 · Der Befund

`[cmd]` **16 von 68 Komponenten fehlen, fast alle sind
Schreibwege** — `AddSupplementModal`, `AddCompoundModal`,
**`LogDoseModal`**, **`LogSkipModal`**, `AddSideEffectModal`,
`AddLabResultModal`, `ReorderModal`, `PlanCycleModal`.

`[cmd]` **Und es gibt schon Schreibpfade:**
`apps/web/src/lib/supplements/stack-write.ts` (4 Fundstellen),
`apps/web/src/app/api/supplements/intake/route.ts`. `[read]` **Miss
zuerst, was davon traegt** — der Punkt ist eine Woche alt, und
zwischendurch wurde am Modul gearbeitet.

`[read]` **Die absurde Lage in einem Satz:** das Modul rechnet
93,1 % Compliance aus Daten, die nur ein Seed-Skript erzeugen kann.

## 2 · Der Zuschnitt

**Zwei Schreibwege, mehr nicht: eine Einnahme eintragen, und eine
ausgelassene Einnahme eintragen.** `LogDoseModal` und `LogSkipModal`.

`[read]` **Nicht `AddSupplementModal`, nicht `PlanCycleModal`, nicht
`ReorderModal`.** Sie stehen in derselben Liste und sehen aus wie
dieselbe Arbeit. **Sie sind es nicht** — ein Stack anzulegen ist ein
anderer Vorgang als eine Einnahme zu quittieren.

`[cmd]` **Die Zielspalten stehen fest:**

    intake_logs   stack_item_id, intake_date, intake_time, status,
                  supplement_name_snapshot, dose_snapshot,
                  dose_unit_snapshot, actual_dose, actual_dose_unit,
                  notes, measurement_source, source_detail

`[read]` **Die vier `_snapshot`-Spalten sind der interessante Teil.**
Sie halten fest, was zum Zeitpunkt der Einnahme galt — **eine
Einnahme von gestern bleibt richtig, auch wenn die Dosis im Stack
morgen geaendert wird.** `[read]` **Sie duerfen nicht beim Lesen aus
dem Stack nachgeschlagen werden, sondern muessen beim Schreiben
eingefroren werden.**

`[cmd]` **`measurement_source` und `source_detail` gibt es auch bei
`user_medications`** — dieselbe Herkunftsspur wie in G-211.

## 3 · Was aus G-211 uebernommen gehoert

`[read]` **Die Naht.** In G-211 hast du eine einzige Schreibstelle
gebaut und mit einer Sabotageprobe bewacht — **eine zweite
Schreibdatei macht den Test rot.** `[cmd]` Hier gibt es bereits
`stack-write.ts` **und** eine API-Route, die beide schreiben. **Pruef,
ob das zwei Naehte sind oder eine mit zwei Enden**, und sag es.

`[read]` **Der dritte Zustand.** Bei Medikamenten war es *,,wird von
keiner Regel geprueft"*. **Hier ist die Frage: was passiert, wenn
jemand eine Einnahme fuer ein Stack-Item eintraegt, das inzwischen
`is_active = false` ist?** `[cmd]` `stack_items` hat die Spalte.
**Nicht verhindern, sondern benennen — falls es ueberhaupt
vorkommen kann.**

## 4 · WAS NICHT ZU TUN IST

**Keine Tabelle anlegen** — `supabase/_pipeline/` gehoert Codex, er
arbeitet an C-313b.
**Die 50er-Grenze im Katalog nicht anfassen** — das ist **G-176**
und braucht eine Messung, was 412 Zeilen im DOM kosten.
**Keine Reiter ergaenzen** — G-186.
**Nichts auf `dev@lumeos.app` speichern.** `[cmd]` Dort liegen Toms
360 Einnahmen. **Schreibende Nachweise auf
`test-user@lumeos.local`**, mit gezaehltem Rueckbau wie in G-211.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Einnahme eintragen          Zeile da, alle vier Snapshots gesetzt
    Auslassen eintragen         status korrekt, unterscheidbar
    Snapshot eingefroren        Dosis im Stack aendern, alte Einnahme
                                unveraendert
    Compliance vorher/nachher   Zahl, aus echten Eingaben
    Schreibstellen im Code      Zahl, und ob eine oder zwei Naehte
    Attrappen im neuen Code     Soll 0
    Rueckbau                    gezaehlt, `dev` unberuehrt
    Bildschirmfoto je Zustand   `node tools/schuss.mjs`

`[read]` **Die dritte Zeile ist der eigentliche Nachweis.** Wenn die
Snapshots beim Lesen nachgeschlagen werden statt beim Schreiben
eingefroren, faellt es **nur** in dieser Probe auf — und erst Monate
spaeter im Echtbetrieb.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205, nicht dein
Fehler). `python tools/server.py start`, nie `pnpm dev`.
`[cmd]` **A-30 im Kopf behalten:** kein Wert-Import aus dem Leseweg
in eine Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
