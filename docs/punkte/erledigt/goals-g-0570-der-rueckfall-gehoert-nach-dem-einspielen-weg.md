---
nr: G-570
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-01
agent: claudecode
beauftragt: 2026-10-03
erledigt: 2026-10-03
commit: 96518958

braucht: [G-563]
kind_von: G-568

quellen:
  - docs/punkte/erledigt/goals-g-0568-die-zielwerte-brauchen-ihr-ziel.md
  - docs/punkte/erledigt/goals-g-0565-die-einheit-ist-eine-nutzerwahl.md

beruehrt:
  dateien:
    - apps/web/src/lib/profile/zielwerte-read.ts
    - apps/web/src/lib/profile/__tests__/g568-zielwerte-ziel.test.ts
---

# Der Rueckfall auf die Zweiparameter-Fassung gehoert nach dem Einspielen weg

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-570: der Rueckfall gehoert weg, und
                                     PGRST202 bekommt seinen Text
    Bereich: apps/web/src/lib/profile/
             apps/web/src/lib/fehler/ladefehler.ts  (A4)
    Fremd:   supabase/ gehoert Codex - er arbeitet an A-97 und entfernt
             dort zwei Schalter. docs/ gehoert dem Orchestrator, auch
             diese Punktdatei.
    Stand:   2026-10-03

## Stand 2026-10-03 — die Voraussetzung ist da

`[cmd]` **A-95 ist eingespielt und abgenommen** (`df9cd8aa`). **A1 dieses
Auftrags ist damit schon gemessen**, vom Orchestrator, live:

    goals.berechne_zielwerte(p_user_id uuid, p_goal_id uuid,
                             p_stichtag date)     6674 Bytes
    die Zweiparameter-Fassung ist ENTFERNT - einmal in pg_proc

`[cmd]` **BERICHTIGUNG 12:10 — der Satz, der hier stand, war falsch.**
Ich hatte geschrieben: *„faellt sie kuenftig weg, gibt es die alte Fassung
nicht mehr, auf die er zurueckfallen koennte."* **Die alte Fassung gibt es
wieder** — G-595 (`c73a95c1`) hat sie zurueckgespielt, weil die Anwendung
sie braucht, wo sie kein Ziel kennt.

`[cmd]` **Der LIVE-Stand, gemessen 12:05:**

    goals.berechne_zielwerte(p_user_id, p_goal_id, p_stichtag)   rechnet
    goals.berechne_zielwerte(p_user_id, p_stichtag)              Mantel

`[read]` **Beide gehoeren zusammen** (`563_target_scoped_calculation.sql`),
und `zielwerte-read.ts:267` ruft je nach Lage die eine oder die andere.
**Der Rueckfall ist damit weiter ueberfluessig** — die Dreiparameter-Fassung
steht, `PGRST202` entsteht nur bei veraltetem Schema-Cache — **aber er ist
nicht harmlos:** er wechselt still von „Ziel genannt" auf „Ziel
unbekannt", und das ist eine andere Rechnung, kein Wiederholungsversuch.

`[read]` **Zaehl A1 trotzdem selbst nach, bevor du entfernst.** Eine
Messung aus einem anderen Lauf ist eine Angabe, kein Nachweis.

`[cmd]` **Der Pfad im Punkt stimmt:**
`apps/web/src/lib/profile/zielwerte-read.ts`. **`LAUFEND.md` nannte
`lib/goals/zielwerte-read.ts` — das war falsch**, die Datei gibt es nur
einmal, unter `lib/profile/`.

`[read]` **Dein laufender Auftrag G-590 geht vor.** Dieser hier ist
vorbereitet, nicht zugeteilt.

## Nachtrag 2026-10-03, 11:45 — der Rueckfall ist NICHT harmlos, er luegt

`[read]` **Dieser Nachtrag hebt eine Aussage des Orchestrators auf**, die
in der A-95-Abnahme stand: *„der Rueckfall ist bereits toter Code, weil
`PGRST202` nicht mehr entstehen kann."* **Das war falsch, und zwar
heute um 11:43 belegt.**

`[cmd]` **Tom sah an der Goals-Seite:**

    Die Daten konnten nicht geladen werden.
    Could not find the function
    goals.berechne_zielwerte(p_stichtag, p_user_id) in the schema cache

`[cmd]` **Die Ursache ist der Schema-Cache von PostgREST, nicht die
Datenbank.** Gemessen:

    pg_proc                     genau EINE Fassung, dreiparametrig
    PostgREST-Cache geladen     03.10. 09:04 Ortszeit
    A-95 hat getauscht          03.10. ab 10:15 Ortszeit

**PostgREST kannte die neue Signatur nicht** — es antwortete auf den
Dreiparameter-Aufruf mit `PGRST202`, **der Rueckfall griff**, rief die
Zweiparameter-Fassung, und die ist seit A-95 weg. `[read]` **Die
Fehlermeldung nennt deshalb die ALTE Signatur** — der Nutzer liest einen
Namen, den niemand mehr aufruft.

`[cmd]` **Behoben durch `NOTIFY pgrst, 'reload schema'`** (11:44, 151
Funktionen neu geladen); `tools/schuss.mjs /v2/goals` danach gruen, Titel
steht, kein `PGRST202`, nur die bekannte `data-mode`-Warnung.

### Was das fuer diesen Auftrag aendert

`[read]` **A2 bleibt richtig und wird dringender:** der Rueckfall gehoert
weg. **Aber er ist nicht nur ueberfluessig — er hat den Fehler
verschleiert.** Ohne ihn haette die Seite sofort gesagt, dass die
Dreiparameter-Fassung nicht erreichbar ist.

**A4 — NEU, und der eigentliche Gewinn dieses Punkts.** `[cmd]`
**`PGRST202` muss sagen, was es heisst.** Heute landet es als
Datenfehler-Text mit einer Signatur, die der Nutzer nicht einordnen kann.
`[read]` **Nach dem Entfernen des Rueckfalls ist `PGRST202` ein eigener
Zustand:** *die Datenbank kennt diese Funktion nicht — entweder ist sie
nicht eingespielt, oder der Schema-Cache ist veraltet.* **Das gehoert in
`apps/web/src/lib/fehler/ladefehler.ts`**, wo die `FACHMELDUNGEN` liegen
und wo G-553 den Sitzungsfehler schon so behandelt hat.

`[cmd]` **Zu belegen fuer A4:** die Meldung einmal ausgeloest (eine
Wegwerf-Signatur reicht, kein Eingriff in die Datenbank) · der Text nennt
den Cache als moegliche Ursache · Sabotage in beide Richtungen.

`[read]` **Nicht Teil:** das Neuladen des Caches selbst. **Das ist eine
Betriebsregel und gehoert dem Orchestrator** — er hat sie heute verletzt,
nicht du.

## Der Befund

`[cmd]` **Die Goals-Seite fiel am 2026-10-01 aus.** Am Schirm stand

    Could not find the function
    goals.berechne_zielwerte(p_goal_id, p_stichtag, p_user_id)
    in the schema cache

`[cmd]` **Ursache:** G-568 reicht bei genau einer offenen Phase ein
`p_goal_id` durch, **live steht aber nur die Zweiparameter-Fassung** —
G-563 ist gebaut und nicht eingespielt.

`[cmd]` **Behoben in `f3088a98`** mit einem Rueckfall, der
ausschliesslich bei `PGRST202` greift: fehlt die Signatur, wird ohne
Zielbezug gefragt, die Datenbank waehlt wie bisher, und bei mehreren
Phasen wirft sie weiter (G-568/A4).

`[read]` **Der Rueckfall ist eine Bruecke, kein Zustand.** Bleibt er
nach dem Einspielen stehen, **verdeckt er genau den Fehler, den er
heute ueberbrueckt**: faellt die Dreiparameter-Fassung kuenftig aus
einem anderen Grund weg, waehlt die Seite still eine von zwei Raten —
die Klasse von Fehler, die G-559 bis G-568 gerade beseitigt haben. Ein
dauerhafter Umweg wird nicht repariert, er wird benutzt.

## Was zu tun ist

**A1 — nach dem Einspielen von G-563 messen**, dass die
Dreiparameter-Fassung live steht: Signatur aus `pg_proc`, mit
`prokind = 'f'`.

**A2 — den Rueckfall entfernen**, `istSignaturFehlt` mit ihm, und die
Zusicherungen in `g568-zielwerte-ziel.test.ts` auf den Zustand ohne
Rueckfall ziehen. **Der Fehlerpfad bleibt:** ein `PGRST202` ist danach
ein Fehler und wird als solcher gezeigt, ueber `ladefehler.ts`.

**A3 — die Reihenfolge festschreiben.** Eine Anwendung, die eine neue
Signatur ruft, muss **vor** dem Einspielen laufen und danach. `pnpm
gate` kann das nicht sehen — es laeuft gegen keine Datenbank (A-77).
**Belegen, wie der naechste Fall auffaellt, bevor er am Schirm
auffaellt.**

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · die Seite vor
und nach dem Entfernen · `pnpm gate` gruen mit Testzahl · Sabotage je
Zusicherung in beide Richtungen.

---

## Abnahme — 2026-10-03, Commit `96518958`

`[cmd]` **Vom Orchestrator nachgezaehlt in `zielwerte-read.ts`:**

    rpc('berechne_zielwerte'   1   (vorher 2)
    istSignaturFehlt           0
    der Rueckfall ist weg

`[cmd]` **Und in `ladefehler.ts`:** `'schema'` 3x, `schema cache` 3x,
`could not find the function` 2x, `Schema-Cache` 2x. **Die Erkennung
verlangt BEIDE Textteile** und steht vor den Sitzungsmerkmalen — sonst
wuerde ein Funktionsname mit `refresh_token` zur Sitzungsmeldung.

`[cmd]` **An der Seite**, `tools/schuss.mjs /v2/goals`, 1247 ms:
Titel steht, 19 Attrappen, 1 Konsolenfehler (die fremde `data-mode`-
Warnung), **0 Treffer auf `PGRST202`, `berechne_zielwerte`, „konnten nicht
geladen" und „schema cache"**. Bild `backup/g570-abnahme-goals.png`.

### Die Datei ausserhalb des Bereichs — bestaetigt

`[cmd]` **`lib/goals/phasenziel-write.ts`, +3/−3**, reine Typaenderung von
`'sitzung' | 'daten'` auf `Fehlerart`, vom Compiler erzwungen.
`[cmd]` **Der einzige Verbraucher ist `goals/modale.tsx:415`:**
`setSitzungsfehler(r.art === 'sitzung')` — ein `schema` laeuft dort wie
ein Datenfehler, und die Kachel zeigt den Satz fuer jede Art ausser
`sitzung` schon. **Bestaetigt, drei Zeilen, kein Folgebedarf.**

### Was er selbst gefunden und richtig behandelt hat

`[cmd]` **Den echten Meldungstext hat er geholt, nicht erfunden:**
PostgREST im Docker-Netz mit einem Wegwerf-Parameter gerufen, `404`,
`PGRST202`, Wortlaut im Test. **Keine Aenderung an der Datenbank.**

`[cmd]` **Den Vermerk aus G-568 hat er als ueberholt gekennzeichnet**,
statt ihn stehen zu lassen: beide Fassungen geben `goal_id` zurueck.

`[cmd]` **7 von 7 Sabotagen rot**, je zurueckgesetzt, Kontrollen gruen —
darunter die zwei, die zaehlen: Erkennung nur am Code, und die Pruefung
hinter die Sitzungsmerkmale verschoben.

`[cmd]` **`pnpm gate` gruen, 18/18, web 2579 Tests** (vorher 2575: zwei in
g568 umgedreht, vier neu). Commit `96518958`, 5 Dateien, +136/−75.

### A3 — ein Befund, und er wird A-98

`[read]` **Vor dem Schirm faellt dieser Fall heute nicht auf.** Er hat
gesucht und nichts gefunden: kein Werkzeug haelt die `.rpc('name', {args})`
-Aufrufe in `apps/` gegen `pg_proc` der laufenden Datenbank, und
`pnpm gate` laeuft ohne Datenbank (A-77). `schemafreigabe-pruefen.mjs`
kommt am naechsten und prueft Schemata, keine Funktionen.

`[cmd]` **Er hat nichts gebaut und den Vorschlag dem Orchestrator
ueberlassen.** `[read]` **Richtig** — `tools/` ist nicht sein Bereich, und
ein neues Werkzeug braucht Toms Wort. **Weitergefuehrt als A-98.**
