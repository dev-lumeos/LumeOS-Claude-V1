# C-252 — Claude Code, 2026-08-23

Bericht: `docs/berichte/c-252-claude-code.md`

Schritt 4 des Supplements-Neuaufbaus, **Teil B: der Substanz-Pfad.**
Teil A (Stack-Pfad) laeuft parallel bei Codex und ist nicht Gegenstand.

**Zuerst gelesen:** dein G-157-Bericht war die Vorlage fuer diesen
Auftrag. Der `tab-plans`-Widerspruch war berechtigt — meine Vorgabe war
falsch, deine Begruendung traegt. Genau so.

---

## WAS ICH GEMESSEN HABE

`[cmd]` Zwei Kataloge stehen nebeneinander, beide mit 566 Zeilen:

    supplements.substance_catalog    566 Zeilen, 67 flache Spalten   ALT
    supplements.supplements          566 Zeilen, 15 Spalten          NEU
      + 33 Detailtabellen

`[cmd]` Der neue Bestand, live: `supplement_dosing` 566 ·
`supplement_pharmacology` 566 · `supplement_safety` 290 ·
`supplement_categories` 23 · `supplement_groups` 3 (`supplement`,
`enhanced`, `peptide`).

`[cmd]` **`im_katalog` ist die Sichtbarkeitsregel** — generierte Spalte
seit C-243: **290 true, 276 false.** Die 276 tragen weder Beschreibung
noch Evidenzgrad; sie bleiben in der Tabelle, **gehoeren aber nicht in
den Katalog.** Das war Toms Entscheidung C.

`[cmd]` **`evidence_grade` steht seit C-248 auf 290**, nicht mehr 259 —
Grad `E` wurde vom Import abgewiesen und ist nachgezogen.

`[cmd]` Betroffene Stellen:

    apps/web/src/lib/supplements/substanz-read.ts    Z122, Z156
    apps/web/src/app/v2/supplements/substanz-detail.tsx  Z93, Z441

`[cmd]` **`supplement_groups` heisst `label_de`, nicht `name_de`** —
ich bin selbst darauf hereingefallen. Spaltennamen nachsehen.

`[cmd]` **`name_de` ist bei allen 566 leer.** Das ist laut Spec so
gewollt, bis uebersetzt ist. Anzeige ueber
`COALESCE(NULLIF(name_de,''), name_en)`.

## WAS ZU TUN IST

1. `substanz-read.ts` und `substanz-detail.tsx` von
   `substance_catalog` auf `supplements.supplements` plus die
   Detailtabellen umstellen.

2. **`.eq('im_katalog', true)` in jeden Katalog-Lesepfad.** Ohne ihn
   erscheinen 276 leere Eintraege in der Liste.

3. **Fuer jedes Feld der alten Breittabelle: sagen, wo es jetzt
   herkommt — oder dass es keine Quelle hat.** Die 67 Spalten verteilen
   sich auf die Detailtabellen, aber nicht alle haben ein Gegenstueck.
   `[read]` **Melden, nicht erfinden** — *„eine erfundene 87 sieht aus
   wie eine gemessene 87."*

4. Wo ein Feld keine Quelle hat: Kachel mit Marke und **gemessener**
   Begruendung, wie du es in G-161 gemacht hast. **Kein Strich, keine
   Null.**

`[read]` **Der Auftrag kann falsch sein.** Wenn eine Stelle nach der
Regel aus dem Auftrag gar kein Umstellungsfall ist — so wie
`tab-plans` in G-157 — dann melde das und lass sie stehen.

## WAS NICHT ZU TUN IST

`stack-read.ts`, `stack-write.ts` und `medical/page.tsx` **nicht
anfassen** — das ist C-250 bei Codex, gleichzeitig.

`apps/web/src/app/v2/recovery`, `apps/coach/` **nicht anfassen** —
Fable.

`substance_catalog` und `supplement_catalog` **nicht loeschen.** Das
ist Schritt 5 und kommt erst, wenn 4 gemessen ist.

Keine Entscheidung zur Salzform (C-244), keine zu den 276 verborgenen
Zeilen (entschieden in C-243).

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Die Katalogliste muss 290 Eintraege zeigen, nicht 566.** Schreib die
Erwartung hin, bevor du misst.

**Gegenprobe:** ein Eintrag mit Beschreibung muss erscheinen, einer
ohne darf nicht. Nenn beide namentlich.

**Negativprobe:** `im_katalog`-Filter absichtlich entfernen — die Zahl
muss auf 566 springen und der Test rot werden.

`[read]` **Deine Negativprobe in G-157 war beim ersten Anlauf blind**,
weil du mit der Datei auch ihre Erwartungszeile entfernt hattest.
Dieselbe Falle: eine Pruefung, die mit ihrem Gegenstand verschwindet,
misst nichts.

## ZWEI DINGE AUS DEINEM G-157-BERICHT

`[cmd]` **Der Typecheck ist wieder gruen** — `npx tsc --noEmit` in
`apps/web`, Exit 0. Das `Cannot find name 'Empty'` war eine
Momentaufnahme, waehrend Fable an `recovery/tab-messwerte.tsx`
schrieb.

`[cmd]` **`test-user@lumeos.local` ist wieder anmeldbar.** Fable hat
das Passwort waehrend seiner Messung getauscht und zurueckgesetzt —
daher `updated_at 09:42`. **Wenn es bei dir wieder klemmt: melden, nicht
selbst am Hash drehen.** Zwei Agenten, die gleichzeitig am selben Konto
schrauben, ist der naechste Fehler.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` oder `npx next dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Nachweise auf `test-user@lumeos.local`, nicht auf `dev`.
Repo-Text mit Sonderzeichen **nicht** ueber die Standardeingabe einer
interaktiven Sitzung schreiben — direkt schreiben,
`encoding="utf-8", newline="\n"`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
