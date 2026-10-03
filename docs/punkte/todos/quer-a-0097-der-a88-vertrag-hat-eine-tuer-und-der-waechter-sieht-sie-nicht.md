---
nr: A-97
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-03

braucht: [A-88, A-95]
kind_von: A-88

quellen:
  - docs/punkte/erledigt/quer-a-0088-31-proben-fallen-still-auf-postgres-zurueck.md
  - docs/punkte/laufend_claudecode/next/goals-g-0570-der-rueckfall-gehoert-nach-dem-einspielen-weg.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts
    - tools/pipeline-database-vertrag.mjs
---

# Der A-88-Vertrag hat eine Tuer, und der Waechter sieht sie nicht

## Der Befund

`[cmd]` **A-95 hat zwei Pipelineskripte aufgebohrt**, damit der
freigegebene Live-Lauf ueberhaupt gehen konnte:

    030_mikro-uebersicht.ts     --a95-live
    testdaten-einspielen.ts     --a95-goals-only

`[cmd]` **Die Form ist eng gezogen** — die Tuer oeffnet nur nach
`postgres` und sonst nirgends:

    const A95_LIVE = process.argv.includes('--a95-live')
    if (!DB || (DB === 'postgres' && !A95_LIVE)) throw ...
    if (A95_LIVE && DB !== 'postgres') throw ...

`[read]` **Das war fuer den Lauf richtig und ist jetzt falsch.** Toms
Freigabe galt einem Einspielen, nicht einem dauerhaften Schalter. **Die
Tuer ueberlebt ihren Grund** — und sie traegt den Namen eines Punktes, der
heute geschlossen wird. **Dieselbe Klasse wie G-570:** eine Bruecke fuer
eine einmalige Lage, die nach dem Einspielen weg muss, sonst verdeckt sie
genau das, was sie ueberbrueckt hat.

## Die zweite Haelfte, und sie ist die schlimmere

`[cmd]` **Der A-88-Waechter bleibt gruen** — gemessen, Codex hat es im
Bericht ausdruecklich gesagt, und `tools/pipeline-database-vertrag.mjs`
zeigt warum:

    function hatFailClosed(inhalt, variable) {
      const fehlt = new RegExp(`!\\s*${name}\\b`).test(inhalt)
      const basisdatenbank =
        new RegExp(`\\b${name}\\s*===\\s*(['"])postgres\\1`).test(inhalt)
      return fehlt && basisdatenbank
    }

`[read]` **Er prueft, ob zwei Muster irgendwo in der Datei stehen — nicht,
ob der Zweig unbedingt wirft.** Beide Muster stehen weiter da, also ist er
zufrieden. **Das ist die `assert.match`-Klasse aus G-578, G-581 und
G-583, eine Ebene hoeher:** der Waechter zaehlt Gestalt, nicht Verhalten.

`[cmd]` **A-88 hatte drei Sabotagen und alle drei wurden rot** (ok
33/34/35). **Keine davon war „baue einen Schalter ein, der postgres
durchlaesst"** — und genau der kam durch.

## Auftrag, wenn Tom freigibt — und er zerfaellt in zwei Bereiche

**A1 — die zwei Schalter wieder entfernen** (`supabase/_pipeline/`,
Codex). `[read]` **A-95 ist abgenommen, der Grund ist verbraucht.** Wer
kuenftig live einspielen muss, bekommt eine Freigabe und einen eigenen
Punkt, keinen Schalter im Repo.

**A2 — den Waechter auf Verhalten umstellen** (`tools/`, Orchestrator).
`[cmd]` **Zu pruefen ist nicht, ob die Muster da sind, sondern dass kein
Pfad mit `PGDATABASE=postgres` weiterlaeuft.** `[annahme]` Der
belastbarste Weg ist ein Lauf statt eines Musters: das Skript mit
`PGDATABASE=postgres` und ohne weitere Parameter starten und verlangen,
dass es mit Exitcode ungleich 0 abbricht. **Das misst, was die Regel
meint.**

**A3 — die Gegenprobe, die gefehlt hat.** `[read]` **Mit eingebautem
Schalter muss der Waechter rot werden** — genau der Fall, der heute
durchkam. **Sonst misst er wieder nur Gestalt.**

`[cmd]` **Keine Codeaenderung ohne Toms Freigabe** — dieser Punkt liegt
in `todos/`, bis sie da ist.

**Nicht Teil:** der Inhalt von A-95 (abgenommen und belegt) · die
`DROP FUNCTION`-Zeile in `030_mikro-uebersicht.ts`, **die bleibt** — sie
gehoert in die Pipeline, damit die Kette die alte Zweiparameter-Fassung
nicht wieder anlegt.
