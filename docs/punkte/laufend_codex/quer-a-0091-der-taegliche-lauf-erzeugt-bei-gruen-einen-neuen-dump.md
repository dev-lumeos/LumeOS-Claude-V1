---
nr: A-91
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01
agent: codex
beauftragt: 2026-10-01

braucht: [A-90]
kind_von: A-90

quellen:
  - docs/punkte/erledigt/quer-a-0090-grunddaten-als-dump-statt-als-import.md

beruehrt:
  dateien:
    - tools/kettenlauf-taeglich.mjs
    - supabase/_pipeline/kette-voll.json
    - supabase/_pipeline/daten/grunddaten-dump.manifest.json
---

# Der taegliche Lauf erzeugt bei gruen einen neuen Dump

## Auftrag

    AUFTRAG FUER Codex - A-91: der taegliche Lauf erzeugt bei gruen
                              einen neuen Grunddaten-Dump
    Bereich: tools/kettenlauf-taeglich.mjs
             supabase/_pipeline/ (Dumperzeugung, Manifest)
    Fremd:   apps/ und packages/ gehoeren Claude Code. docs/ gehoert
             dem Orchestrator, auch diese Punktdatei: der Bericht
             kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und deinen eigenen A-90 in
`docs/punkte/erledigt/quer-a-0090-grunddaten-als-dump-statt-als-import.md`.

## Die Entscheidung

**Tom, 2026-10-01, 15:21:** *„der Dump ist ein Zwischenstand, kein
Quellcode"* und *„die einmal taegliche kettenpruefung soll jedesmal bei
gruen einen neuen dump erstellen."*

`[cmd]` **Umgesetzt ist der erste Teil:** der Dump und sein Manifest
stehen in `.gitignore` (Zeilen 311-312), sie werden nicht versioniert.

`[read]` **Daraus folgt der zweite Teil, und er schliesst den Kreis:**
der naechtliche Vollimport aus `kette-voll.json` beweist, dass das
Rezept aus nichts aufbaubar ist — **und sein Ergebnis IST der Dump, mit
dem am naechsten Tag gearbeitet wird.** Der Beweis und das Arbeitsmittel
sind dieselbe Sache.

## Auftrag

**A1 — bei gruen einen neuen Dump, bei rot keinen.** `[read]` **Ein
Dump aus einem roten Lauf waere die schlimmste Form eines
Arbeitsmittels:** jeder Tagesbau liefe auf einem kaputten Stand weiter,
und niemand wuerde es merken. **Der alte Dump bleibt, bis ein gruener
Lauf ihn ersetzt.**

**A2 — das Manifest entsteht mit.** Herkunft, Datum, Pruefsumme des
Dumps, die 19 Quellpruefsummen. `[cmd]` **Dein Waechter
`grunddaten-pruefen.ts` liest es** — er muss nach dem Wechsel genauso
rot werden wie vorher, wenn eine Quelle sich aendert. **In beide
Richtungen zu belegen.**

**A3 — der Wechsel darf keinen laufenden Tagesbau treffen.** Der neue
Dump entsteht nachts, waehrend niemand arbeitet; aber ein Agent, der um
drei Uhr morgens baut, liest gerade den alten. `[read]` **Schreiben,
dann umbenennen — und sagen, was passiert, wenn das Umbenennen an
EPERM scheitert** (A-89, dreimal gemessen).

**A4 — den alten Dump nicht endlos sammeln.** `[cmd]` **414,4 MiB je
Stueck.** Sag, wie viele du behaeltst und warum. `[read]` **Und die
Regel aus A-79 gilt:** `backup/` waechst heute ungebremst, 3.958 MiB
gegen ein Limit von 2.5 GiB. **Nicht denselben Fehler an einem zweiten
Ort.**

**A5 — die Zahl, die es beweist.** Nach einem naechtlichen Lauf: steht
ein neuer Dump mit neuem Datum, und laeuft der Tagesbau darauf in den
gemessenen 78 bis 95 s? **Einmal durchspielen, nicht annehmen.**

**Nicht Teil:** die 46 Zeugen (A-87), die stillen Rueckfaelle (A-88),
und ob der Dump je ins Repo gehoert — er gehoert nicht, das ist
entschieden.

**Zu belegen:** ein gruener Lauf erzeugt einen Dump, ein roter nicht
(beide Richtungen) · das Manifest mit Pruefsummen · der Waechter aus
A-90/A4 weiter in beide Richtungen · die Laufzeit des Tagesbaus auf dem
neuen Dump · Wegwerf-Datenbanken verworfen mit Zaehler · kein `db push` ·
nichts committen. **Kein voller Kettenlauf als Nachweis** ausser dem
einen, der hier der Gegenstand ist.

---

## Zwischenstand — 2026-10-02, Commit `3868434`, A5 offen

`[cmd]` **Der Code ist committet, der Punkt bleibt offen.** Das ist kein
Widerspruch: A1 bis A4 sind gebaut und gemessen, A5 verlangt einen
gruenen Vollauf, und der stirbt seit zwei Tagen an fremden Zeugen.

| Merkmal | gezaehlt |
| --- | --- |
| Tageslauf | `tools/kettenlauf-taeglich.mjs:9` — `DEFAULT_MANIFEST` ist `kette-voll.json` |
| Veroeffentlichung | nur bei Exit 0; bei gruenem Lauf und rotem Dumpwechsel bleibt der alte Dump aktiv, mit eigenem Exitcode |
| Kandidat | am C-537-Zwischenstand, `kette-ausfuehren.ts:379` |
| Proben | 6 in `tools/__tests__/kettenlauf-status-pruefen.test.mjs`, **zwei davon neu fuer A-91**: roter Vollauf → kein Dump · gruener Vollauf → atomare Veroeffentlichung |
| Aufbewahrung | aktueller plus vorheriger Stand, rund 828,8 MiB |
| EPERM | altes Manifest bleibt bytegleich aktiv, Exit 1, kein Kandidat und kein unreferenzierter Dump |
| Commit | `3868434`, 8 Dateien, +1320/−280 (zusammen mit A-90) |

`[cmd]` **Warum A5 offen ist, mit Zahlen:**

    A-91   1.347,9 s   Abbruch bei G-558 (Zielbezug fehlt)        -> A-92
    A-92   1.291,7 s   G-558 gruen, Abbruch bei G-545
                       (Erwartung ohne duration_ratio_pct)        -> A-87

`[read]` **Zweimal hat der Lauf den Kandidaten korrekt erzeugt und
korrekt NICHT veroeffentlicht.** Genau das verlangt A1 — insofern ist das
Verhalten belegt, nur eben nicht mit einem veroeffentlichten Dump.

`[cmd]` **Der alte Dump steht unveraendert:** 434.525.275 Bytes, Manifest
mit 19 Quellen, 2026-10-01T07:48:38.367Z.

`[read]` **A5 wird in A-87 belegt** — dort laeuft der Vollauf einmal am
Ende der Zeugenstaffel. **Dieser Punkt schliesst, wenn ein Dump
veroeffentlicht ist, nicht vorher.**
