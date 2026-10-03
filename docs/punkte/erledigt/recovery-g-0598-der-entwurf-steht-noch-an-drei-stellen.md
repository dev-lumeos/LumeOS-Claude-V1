---
nr: G-598
typ: fehler
modul: recovery
schwere: mittel
angelegt: 2026-10-03
agent: claudecode
beauftragt: 2026-10-03
erledigt: 2026-10-04
commit: a1a825b0

braucht: [G-593]
kind_von: G-593

quellen:
  - docs/punkte/erledigt/recovery-g-0593-die-attrappe-nennt-eine-tabelle-die-es-unter-anderem-namen-gibt.md
  - docs/punkte/erledigt/recovery-g-0590-der-checkin-ist-der-einzige-pflichtgriff-und-er-schreibt-nicht.md

beruehrt:
  tabellen:
    - recovery.recovery_protocols
  dateien:
    - apps/web/src/app/v2/recovery/modale.tsx
    - apps/web/src/app/v2/recovery/tab-protokolle.tsx
---

# Der Entwurf steht noch an drei Stellen, obwohl die Tabelle daneben liegt

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-598: der Leseweg gilt auch fuer die
                                     Reiter und das Modal
    Bereich: apps/web/src/app/v2/recovery/
             apps/web/src/lib/recovery/
    Fremd:   supabase/ gehoert Codex. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-03

## Der Befund — dein eigener Bericht und zwei Funde aus der Abnahme

`[read]` **G-593 hat den Leseweg gebaut** (`lib/recovery/protokoll-read.ts`,
`ladeProtokolle()`), und `page.tsx:76` reicht ihn durch. **Drei Stellen
lesen weiter den Entwurf.**

### A1 — die zwei Reiterkacheln

`[read]` **Aus deinem Bericht:** *„Die Reiterkacheln Active · … und
Protocol library lesen weiter den Entwurf, obwohl der Leseweg jetzt
daneben liegt."* **`protokolle` wird nach `tab-protokolle.tsx` schon
durchgereicht** (`ansicht.tsx:346`) — es fehlt die Benutzung.

### A2 — das Modal liest `fehler` nicht

`[cmd]` **`fehlende-kacheln.tsx:459` tut es richtig:**

    {!protokolle || protokolle.fehler ? ... 'Nicht geladen: ' + fehler

`[cmd]` **`modale.tsx` liest `protokolle.fehler` nicht.** Bei einem
Ladefehler sagt die Kachel *„nicht geladen"* und das Modal zeigt den
`Activate`-Knopf, als liefe nichts. **Zwei Aussagen zu einer Tatsache —
genau das, was G-593/A4 beseitigen sollte.**

`[read]` **Die Lehre aus G-553 gilt hier:** ein Ladefehler ist ein eigener
Zustand, nicht „keine Daten".

### A3 — der Entwurfszweig im Modal ist toter Code

`[cmd]` **`modale.tsx:1046`, `:1102`, `:1105`:**

    const isActive = protokolle ? lauf !== null : p.id === ACTIVE_PROTOCOL.id
    : `Day ${ACTIVE_PROTOCOL.day} of ${ACTIVE_PROTOCOL.of}`
    started {lauf ? lauf.started_on : ACTIVE_PROTOCOL.started}

`[cmd]` **Unerreichbar:** `ladeProtokolle()` gibt nie `null` zurueck,
sondern immer einen `ProtokollStand` mit `fehler`, und `page.tsx` reicht
ihn immer durch. **Also kein Schaden heute** — aber ein Zweig, der
erfundene Zahlen zeigen WUERDE, wenn jemand die Weitergabe aendert.
**Weg damit, samt dem Import, wenn keine andere Stelle ihn braucht.**

## Was Tom entscheiden muss, bevor `End protocol` gebaut wird

`[read]` **`End protocol` bleibt Attrappe, an zwei Stellen** — und das ist
richtig, solange die fachliche Regel fehlt:

    Setzt "End protocol" status auf 'discontinued' oder 'completed'?
    Und wer setzt 'completed' - der Nutzer, oder die Tage?

`[cmd]` **Es gibt keinen Trigger, der ein Protokoll beendet** (dein
Befund, und er haelt). **Ohne diese Antwort nicht bauen.** Die Frage
steht in `00-FRAGEN.md`.

## Nachweise

1. **Beide Reiterkacheln** zeigen den Bestand aus der Tabelle, am
   Bildschirm belegt (`tools/schuss.mjs`), Attrappenzahl vorher/nachher
   genannt **und erklaert**.
2. **Ladefehler:** Lesefehler erzwingen (Wegwerf-Weg, nicht live) → Modal
   UND Kachel sagen dasselbe.
3. **A3:** `ACTIVE_PROTOCOL` kommt in `modale.tsx` nur noch in
   Kommentaren vor, oder der Import ist weg. **Zahl nennen.**
4. **Sabotage in beide Richtungen**, je Nachweis.
5. **`End protocol` bleibt Attrappe**, und ein Test haelt genau das fest
   — wie bei HRV in G-593.

## Harte Regeln

- **Nie gegen die laufende Datenbank testen**, ausser durch die
  Oberflaeche auf `test-user@lumeos.local`, und danach aufraeumen — per
  `id`, wie in G-593.
- **Starte den Dev-Server nicht selbst.** Laeuft er nicht: melden. Ein
  `server.py start` aus einer Agentensitzung stirbt mit ihr.
- **Kein Commit, kein Push.**
- **Codex arbeitet parallel in `supabase/`** an G-597: nach dem
  eindeutigen Teilindex kann `ProtokollStand.aktiv` nur noch **ein**
  Element tragen. **Das Feld bleibt eine Liste** — nicht umbauen, nur
  wissen.

**Nicht Teil:** G-596 (Bibliothek gegen Verlauf) · G-597 (der Index) ·
die SSOT-Stellen, die gehoeren mir.

## Abnahme — 2026-10-04, Commit `a1a825b0`

`[cmd]` **Nachgemessen:** `ACTIVE_PROTOCOL` ausserhalb von Kommentaren 0x in
`modale.tsx` und `tab-protokolle.tsx`; `End protocol` je 1x als
`InEntwicklungKnopf`; `g598-leseweg.test.ts` 9 Tests, rendernd
(`renderToStaticMarkup` 3x); die Wegwerf-Spalte `g598_wegwerf` ist aus
`protokoll-read.ts` zurueckgeholt (0 Treffer).

`[read]` **Er hat meine Punktdatei korrigiert, zu Recht:** `ansicht.tsx:347`
reicht `protokolle` an `RecoveryModale`; `<RecProtocols />` stand ohne Stand
und steht jetzt bei 335 mit `stand={protokolle}`.

`[cmd]` **Berichtigung:** der Gate meldete bei diesem Commit gruen, waehrend
`web:test` frisch gefahren rot war (`not ok 1277`, G-317). Ursache war nicht
G-598, sondern ein uhrzeitabhaengiger Test und ein Testcache, der einen
Fehlschlag als Erfolg abspielte. Beides behoben: `238b49e6`, `7a3875c7` (A-100).

**Nebenbefunde:** `.test.tsx` erfasst der Test-Glob nie → A-100/A3.
„Nicht geladen" fuer leere Daten (`ansicht.tsx:428/508`) → G-601.
