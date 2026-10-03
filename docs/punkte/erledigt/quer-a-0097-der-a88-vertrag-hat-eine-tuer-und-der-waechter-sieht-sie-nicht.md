---
nr: A-97
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-03
agent: codex
beauftragt: 2026-10-03
erledigt: 2026-10-03
commit: 01039c80

braucht: [A-88, A-95]
kind_von: A-88

quellen:
  - docs/punkte/erledigt/quer-a-0088-31-proben-fallen-still-auf-postgres-zurueck.md
  - docs/punkte/erledigt/goals-g-0570-der-rueckfall-gehoert-nach-dem-einspielen-weg.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts
    - tools/pipeline-database-vertrag.mjs
---

# Der A-88-Vertrag hat eine Tuer, und der Waechter sieht sie nicht

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-97/A1: die zwei a95-Schalter wieder entfernen
    Bereich: supabase/_pipeline/_ableitung/030_mikro-uebersicht.ts
             supabase/_pipeline/_testdaten/testdaten-einspielen.ts
    Fremd:   tools/pipeline-database-vertrag.mjs gehoert dem
             Orchestrator - A2 und A3 macht er, nicht du.
             apps/ und packages/ gehoeren Claude Code (G-570).
             docs/ gehoert dem Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-03

## Stand 2026-10-03 — dein Teil ist A1, und er ist klein

`[cmd]` **A-95 ist abgenommen** (`df9cd8aa`) — die Schalter haben ihren
Grund verbraucht. **Du entfernst sie, nichts weiter.**

`[cmd]` **Deine letzten drei Auftraege sind committet. Nicht wiederholen:**

    C-556  16fd9c9c   148 Zeilen in die C-230-Filter
    A-95   df9cd8aa   Live-Stand nachgezogen
    C-557  022f6f61   die 14 veralteten substance_id

`[cmd]` **Was NICHT mitgeht:** die `DROP FUNCTION`-Zeile in
`030_mikro-uebersicht.ts`, die A-95 eingefuegt hat. **Die bleibt** — sie
haelt die alte Zweiparameter-Fassung von `berechne_zielwerte` aus der
Kette heraus.

`[read]` **Und dein eigener Kettenbeitrag bleibt auch:** die Probe aus
C-557 in `kette.json:776` und die Verbundprobe. **Nur die zwei
Argument-Schalter und ihre Sonderzweige gehen raus**, sodass beide
Dateien wieder unbedingt werfen, wenn `PGDATABASE` fehlt oder `postgres`
ist.

`[cmd]` **Zu belegen:** beide Dateien mit `PGDATABASE=postgres` gestartet
und mit Exitcode ungleich 0 abgebrochen, je Datei einmal · dasselbe ohne
`PGDATABASE` · ein Lauf auf einer Wegwerf-Datenbank weiter gruen · kein
`db push` · nichts committen.

`[read]` **A2 und A3 liegen beim Orchestrator** — der Waechter prueft
heute Gestalt statt Verhalten und muss umgestellt werden. **Du wartest
nicht darauf.**

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

---

## Abnahme A1 — 2026-10-03, Commit `01039c80`

`[cmd]` **Null Treffer auf `a95` in beiden Dateien** — `--a95-live`,
`--a95-goals-only`, `A95_LIVE`, `A95_GOALS_ONLY`, je 0.

`[cmd]` **Und am VERHALTEN geprueft, nicht an der Gestalt** — das war der
Befund dieses Punktes. Vom Orchestrator gefahren, vier Laeufe:

    030_mikro-uebersicht.ts   PGDATABASE=postgres   Exit 1
    030_mikro-uebersicht.ts   ohne PGDATABASE       Exit 1
    testdaten-einspielen.ts   PGDATABASE=postgres   Exit 1
    testdaten-einspielen.ts   ohne PGDATABASE       Exit 1

**Beide werfen in `A-88`-Form, mit Dateiname und Zeile.**

`[cmd]` **Codex' eigene Nachweise:** beide vollen Laeufe auf
`lumeos_a97_probe` gruen, Probe-Datenbank geloescht, Restbestand 0.

`[read]` **Und er hat dem Auftrag widersprochen, zu Recht.** Der Auftrag
nannte die `DROP FUNCTION`-Zeile noch als zu pruefen; **G-595**
(`c73a95c1`) hatte sie zwei Stunden vorher bewusst entfernt. **Er hat den
neueren Stand gelesen und gelassen, statt dem Auftragstext zu folgen.**
Das ist die Haltung, die der Punkt braucht.

## A2 und A3 sind NICHT erledigt — sie wandern nach A-98

`[cmd]` **`tools/pipeline-database-vertrag.mjs` prueft weiter Gestalt:**
`hatFailClosed` sucht `!DB` und `DB === 'postgres'` irgendwo in der Datei
und nicht den unbedingten Wurf. **Der Waechter haette die Schalter auch
heute durchgelassen.**

`[read]` **Das liegt in `tools/` und damit beim Orchestrator**, und es
braucht Toms Freigabe. **Weitergefuehrt als A-98**, zusammen mit dem
Befund aus G-570/A3.
