# C-291 — Codex, 2026-08-27

Bericht: `docs/berichte/c-291-codex.md`

**Der Waechter aus C-290 findet einen von fuenf Faellen — und er
laeuft in keinem Gate.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

## 1 · Was gemessen wurde

`[cmd]` **Ich habe fuenf echte Probemigrationen nach
`supabase/migrations/` gelegt, den Waechter laufen lassen und sie
wieder entfernt:**

    INSERT INTO ...                          rot    richtig
    DO $$ BEGIN INSERT ... END $$;           gruen  FALSCH
    DELETE FROM ...                          gruen  FALSCH
    TRUNCATE ...                             gruen  FALSCH
    MERGE INTO ... WHEN NOT MATCHED INSERT   gruen  FALSCH
    ALTER TABLE ... ADD COLUMN               gruen  richtig

`[read]` **Der `DO`-Block ist der schwerste Fall**, weil er der
natuerlichste Weg ist, einen bedingten Backfill zu schreiben.
`[cmd]` Ursache: `ohneKommentareUndStrings()` verwirft
Dollar-Quoting vollstaendig — **richtig gedacht** (der `INSERT` im
Triggerkoerper der Baseline soll kein Fehlalarm sein), **aber es
verwirft mit dem Fehlalarm auch den echten Fall.**

## 2 · Der Waechter laeuft nirgends

`[cmd]` **`package.json` → `scripts.gate` enthaelt
`migration-datenlogik-pruefen.mjs` nicht.** Die zehn anderen
Pruefungen stehen dort, diese nicht.

`[read]` **Ein Waechter, der nicht ausgefuehrt wird, ist ein
Kommentar.** Das ist dieselbe Lehre wie bei der Ladekette: *„der
Merksatz stand schon einmal in `CLAUDE.md` und hat nicht getragen."*

## 3 · Die Negativprobe prueft den falschen Gegenstand

`[cmd]` **`--negative` haengt eine Zeichenkette an und laesst
`datenbefehle()` darauf los.** Das belegt, dass die Funktion ein
`INSERT` erkennt. **Es belegt nicht, dass der Waechter eine echte
Migration mit Datenlogik findet** — genau die Luecke, die meine fuenf
Dateiproben oben aufgedeckt haben.

`[read]` **Eine Pruefung, die ihren Gegenstand umgeht, misst nichts.**

---

## Zu tun

**a) Die vier Loecher schliessen.** `DELETE`, `TRUNCATE` und `MERGE`
gehoeren in dieselbe Liste wie `INSERT`, `UPDATE`, `COPY`.

**b) Dollar-Bloecke getrennt beurteilen statt blind verwerfen.**
`[read]` Die Baseline braucht eine **benannte** Ausnahme — nach dem
Muster des Kennungswaechters aus C-267, nicht durch pauschales
Wegwerfen der ganzen Konstruktion.

`[read]` **Wenn du keinen Weg siehst, Triggerkoerper von Backfills zu
trennen: sag es und begruende es.** Eine benannte Ausnahmeliste ist
besser als eine stille Blindstelle. **Passend machen ist die falsche
Antwort.**

**c) Negativprobe auf echte Dateien.** Eine temporaere Migration
schreiben, Waechter laufen lassen, Datei entfernen — je Befehlsart
eine. `[read]` **Jede eingebaute Sabotage muss genau eine Meldung
ausloesen**, sonst misst die Selbstprobe nicht, was sie behauptet.

**d) In `pnpm gate` aufnehmen.**

---

## WAS NICHT ZU TUN IST

**Keine Migration loeschen oder aendern** — die Struktur steht live.
**Keinen Schreibweg fuer `user_medications`** — `[cmd]` **C-285** ist
offen, die Tabelle speichert im Klartext.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    INSERT / UPDATE / COPY          rot, je einzeln
    DELETE / TRUNCATE / MERGE       rot, je einzeln
    DO-Block mit INSERT             rot
    Baseline-Triggerkoerper         gruen, benannt begruendet
    reines ALTER TABLE              gruen
    pnpm gate                       enthaelt den Waechter, laeuft gruen

`[read]` **Jede Zeile einzeln belegt, nicht als Sammelaussage.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
