# C-283 — Codex, 2026-08-26

Bericht: `docs/berichte/c-283-codex.md`

**Der Medikamentenkatalog: was importiert ist, aber nicht ankommt —
und der Erfassungsweg.**

---

## Vorweg: meine Zahlen sind Ausgangsvermutungen

**Neue Regel, `docs/auftraege/00-LIESMICH.md`:** `[read]` **jede Zahl
unten stammt aus einer Messung von mir. Pruef sie zuerst. Weicht deine
ab, gilt deine — und du nennst beide.**

`[cmd]` **Der Grund:** in vier Tagen lagen sechs meiner Auftragszahlen
falsch, jedes Mal weil die Abfrage den falschen Ausschnitt traf. **In
fuenf von sechs Faellen hat der Agent es gefunden, nicht ich.**

## 1 · Sechs Spalten sind leer, obwohl die Daten da sind

`[cmd]` **Gemessen an `medical.medication_active_substances`, 498
Zeilen:**

    atc_code           0 von 498      raw->'ATC'          498
    cas_number         0 von 498      raw->'CAS'          498
    rxnorm_code        0 von 498      raw->'external_ids' 498
    unii_code          0 von 498      raw->'external_ids' 498
    routes             0 von 498      raw->'routes_of_administration'
    raw_drug_class     0 von 498

`[read]` **Der Import hat sie nicht gefunden, weil er kleingeschriebene
Namen erwartete** — in `raw` heissen sie `ATC` und `CAS`, in
Grossbuchstaben. **Kein Datenverlust, ein Abbildungsfehler.**

`[cmd]` **Und weitere Bloecke liegen ungenutzt in `raw`:**
`pharmacology`, `pregnancy`, `lactation`, `fertility`,
`dosage_models`, `food_interactions`, `off_label_contexts`,
`salt_or_ester`, `transporters`, `evidence_provenance`.

`[read]` **`pregnancy`, `lactation` und `fertility` sind die
wichtigsten davon** — sie sind bei allen 498 gefuellt und
sicherheitsrelevant. **Sie brauchen eigene Spalten oder eine eigene
Tabelle, nicht einen Griff ins JSON bei jeder Abfrage.**

**Zu tun:** die Abbildung nachziehen. `[read]` **Miss je Feld, ob es
eine Spalte oder eine Tabelle braucht** — `pregnancy` ist vermutlich
ein Objekt mit mehreren Ebenen, `ATC` ist eine Zeichenkette.

## 2 · Der Erfassungsweg fehlt

`[cmd]` **`medical.user_medications` traegt 2 Zeilen.**

`[read]` **Damit ist alles andere Vorrat.** 498 Wirkstoffe, 4.482
Transporterzeilen, 1.890 CYP-Zeilen, 31 Medikamentenregeln — **und
niemand kann sagen, was er nimmt.** Keine Regel feuert, keine Warnung
entsteht.

`[cmd]` **Zum Vergleich:** bei den Supplements traegt `stack_items` 11
Zeilen und die Regel-Engine liefert Treffer.

**Zu tun:** den Schreibweg fuer `user_medications` bauen — Anlegen,
Aendern, Absetzen.

`[read]` **Miss zuerst, was die Tabelle heute traegt und was ihr
fehlt.** `[cmd]` Sie existiert seit langem; **ob sie auf
`medication_active_substances` zeigt oder auf Freitext, ist die erste
Frage.** Wenn sie es nicht tut, ist das der eigentliche Auftrag.

`[read]` **Und die Sicherheitsfrage gehoert dazu:** `[cmd]` Medizinische
Daten sind laut Projektvorgabe verschluesselt abzulegen und brauchen
Coach-Berechtigung fuer Zugriff. **Miss, wie `user_medications` das
heute handhabt** — und ob der neue Schreibweg dieselbe Regel einhaelt.

## 3 · Was NICHT in diesen Auftrag gehoert

**Keine Nutzertexte.** `[cmd]` `description` und
`mechanism_of_action` fehlen bei allen 498 — **Kimi hat fuer
Medikamente nie welche geschrieben.** Das ist ein eigener Auftrag an
ihn (C-284).

**Keine Regel-Engine anschliessen.** `[read]` Ohne erfasste
Medikamente feuert keine Medikamentenregel. **Erst der Weg, dann die
Engine.**

**Keine Oberflaeche.** `apps/` nicht anfassen — Claude Code arbeitet
an G-195.

Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — deine Zahlen neben meinen

    atc_code            0 -> Zahl nennen
    cas_number          0 -> Zahl nennen
    routes              0 -> Zahl nennen
    pregnancy/lactation/fertility   heute nur in raw
    user_medications    2 -> Zahl nach dem Nachweis

**Gegenprobe an drei namentlich genannten Wirkstoffen** — einer mit
vollstaendigem `external_ids`, einer ohne, und **Metformin**, weil er
in den Regeln vorkommt.

**Schreibweg-Nachweis auf `test-user@lumeos.local`:** anlegen,
aendern, absetzen, **gezaehlt zurueckbauen.** `[read]` **In der
RLS-Sicht messen, nicht die Gesamtzahl** — das war die Falle in C-241,
und Fable ist ihr in C-225 richtig ausgewichen.

**Negativprobe:** eine Erwartungszahl verstellen, der Lauf muss rot
werden.

`[cmd]` **Und wie zuletzt: `im_katalog` fuer Kette und Live.** Beide
stehen bei **412**, sichtbare Unterformen **0**.

## PIPELINE

Kettenschritte hinter `282`, **eine Sache je Schritt.** Wegwerf-
Datenbank, Sicherung vorher, live einspielen mit Vollsicherung in
`backup/vollsicherung/`.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
