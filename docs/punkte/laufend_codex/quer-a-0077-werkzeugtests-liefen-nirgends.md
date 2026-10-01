---
nr: A-77
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-28
beauftragt: 2026-10-01
agent: codex

quellen:
  - tools/__tests__/g518-dist-dir-sperre.test.mjs
  - tools/__tests__/kettenlauf-status-pruefen.test.mjs
  - package.json:10
  - docs/punkte/erledigt/quer-g-0535-sechs-funktionen-lesen-den-alten-sitzungsnamen.md

beruehrt:
  dateien:
    - package.json
    - supabase/_pipeline/kette.json
    - tools/__tests__/backup-manifest.test.mjs
    - tools/__tests__/g517-schuss-meldet-die-ursache.test.mjs
    - tools/__tests__/g518-dist-dir-sperre.test.mjs
    - tools/__tests__/kettenlauf-status-pruefen.test.mjs

zahlen:
  gemessen: 2026-10-01
  werkzeugtests_dateien: 5
  werkzeugtests_pruefungen: 37
  werkzeugtests_dauer_sekunden: 12.9
  validierung_dateien: 164
  validierung_testdateien: 120
  validierung_in_der_kette: 6
  validierung_in_keinem_lauf: 114
---

# A-77 - vier Werkzeugtests liefen nirgends

    AUFTRAG FUER Codex - A-77: 114 von 120 Proben in _validierung/
                              laufen in keinem Lauf
    Bereich: supabase/_pipeline/kette.json
             supabase/_pipeline/_validierung/
             package.json (nur der Testaufruf, nichts darunter)
    Fremd:   apps/ gehoert Claude Code, der gerade an G-569 baut (die
             Waechter pruefen Kilogramm statt Prozent). Wird eine Probe
             rot, die eine Oberflaeche betrifft, MELDE sie - raeume sie
             nicht weg.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei. Der untere Teil
(„Der Loesungsweg ist vorgemacht") entscheidet die Richtung, der
Abschnitt „Was heute gemessen ist" nennt die Zahlen.

## Der Befund

`[cmd]` **`tools/__tests__/` enthaelt vier Dateien mit 33 Pruefungen,
und kein Lauf rief sie auf.** `package.json` kannte sie nicht,
`turbo run test` greift nur in die Arbeitsbereiche unter `apps/` und
`packages/` — `tools/` ist keiner.

`[read]` **Der Hinweis stand in fuenf Berichten hintereinander** und
wurde jedes Mal als Nachsatz geschrieben, nie als Punkt. Deshalb ist
er hier ein Punkt.

`[cmd]` **Was dort ungeprueft lag:**

    backup-manifest.test.mjs              C-216
    g517-schuss-meldet-die-ursache.test.mjs   G-517
    g518-dist-dir-sperre.test.mjs         G-518
    kettenlauf-status-pruefen.test.mjs    C-416

`[read]` **Zwei davon sichern Waechter, auf die das Gate sich
stuetzt.** `kettenlauf-status-pruefen` wird von `punkte-pruefen`
aufgerufen — sein Ergebnis entscheidet mit ueber gruen oder rot. Die
dist-dir-Sperre aus G-518 ist das, was den 404-Fehler kuenftig
verhindert. **Beide waren unbewacht.**

## Die Ursache war der Aufruf

`[cmd]` **`node --test tools/__tests__/` scheitert** mit
`MODULE_NOT_FOUND` — ein Verzeichnispfad wird als Modul gelesen. Mit
Muster laeuft es:

    node --test "tools/__tests__/*.test.mjs"
    # tests 33   # pass 33   # fail 0   2.7 s

`[read]` **Das ist der Grund, warum es nie nachgezogen wurde.** Wer
es einmal mit dem Verzeichnis versuchte, sah einen Fehlschlag und
hielt die Tests fuer kaputt.

## Abnahme

`[cmd]` **Gebaut am 2026-09-28.** Der Schritt steht als **erster** im
Gate, vor `quellen-pruefen`, und einzeln als
`pnpm test:werkzeuge`. 30 Gate-Schritte.

`[read]` **Die Stelle ist nicht beliebig.** Diese Tests pruefen die
Werkzeuge, auf die der restliche Lauf sich stuetzt. **Ein kaputtes
Messgeraet faellt auf, bevor damit gemessen wird.** Und 2.7 Sekunden
vor einem Lauf, der baut, sind keine Kosten.

### Die Gegenprobe an echtem Code

`[cmd]` **Nicht mit einer erfundenen Testdatei, sondern mit einem
eingebauten Fehler in `tools/dist-dir-sperre.js`** — die
Vorbedingung wurde auf `if (true) return` gesetzt, die Sperre also
ausgebaut:

    unveraendert              GRUEN  pass=33 fail=0
    Sperre ausgebaut          ROT    pass=26 fail=7
    nach Wiederherstellung    GRUEN  pass=33 fail=0

`[cmd]` **Byteidentisch wiederhergestellt**, sha256 vor und nach dem
Lauf `ffb05f818c784a4a…`.

`[read]` **Sieben von 33 Pruefungen fielen.** Ein Waechter, der bei
ausgebauter Sperre gruen bleibt, misst nichts — dieser faellt.

## Was offen bleibt

`[read]` **Die vier Dateien sind alles, was es gibt.** 25 Waechter
laufen im Gate, vier haben einen Test. **Das ist kein Befund fuer
diesen Punkt** — ein Test je Waechter waere eine eigene Aufgabe und
vermutlich nicht ueberall sinnvoll. Festgehalten ist nur, dass die
Zahl 4 von 25 ist und niemand sie fuer vollstaendig halten soll.

## Nachtrag 2026-09-30 — derselbe Befund am zweiten Ort

`[cmd]` **`supabase/_pipeline/_validierung/` laeuft in keinem Gate.**
Dieselbe Ursache wie oben: `turbo run test` greift nur in die
Arbeitsbereiche unter `apps/` und `packages/`, und `supabase/` ist
keiner. Gemessen am 2026-09-30:

- Keine `package.json` im Repo nennt `_validierung` oder
  `LUMEOS_G536_DATABASE`. Die einzigen zwei Treffer liegen in einem
  alten Backup-Manifest.
- Die Kette ruft genau **ein** Skript daraus auf:
  `kette-ausfuehren.ts:30` -> `schema-vollstaendigkeit-pruefen.ts`.
- `goals-g536-goal-strategies.test.ts:7` wirft ohne
  `LUMEOS_G536_DATABASE` eine Ausnahme. Eine Datei, die ohne
  Umgebungsvariable scheitert, **kann** nicht im Gate liegen.

`[cmd]` **Der Beleg, dass das schon geschadet hat:** Codex hat am
2026-09-30 zu G-556 gemeldet, dass zwei G-536-Rechnungstests noch die
Semantik vor G-543 erwarten — **und dass das Gate trotzdem gruen ist.**
Genau das ist der Schaden: eine Semantikaenderung hat zwei Proben
ungueltig gemacht, und nichts wurde rot. Im selben Bericht heissen die
dortigen Gegenproben ,,dauerhaft". Sie sind es nicht.

`[read]` **Damit ist A-77 nicht mehr ,,mittel".** Es geht nicht um vier
Werkzeugtests, sondern um zwei Verzeichnisse mit Proben, auf die sich
Berichte berufen, waehrend sie nur laufen, wenn jemand sie von Hand
aufruft. **Schwere auf hoch.**

## Der Loesungsweg ist vorgemacht — 2026-09-30, G-558

`[cmd]` **Codex hat die Frage aus dem Nachtrag beantwortet, ohne dass sie
beauftragt war:** die Gegenprobe zu G-558 liegt nicht als Datei in
`_validierung/`, die niemand aufruft, sondern als **eigener
Kettenschritt**. `kette.json` fuehrt seither mehr Schritte, darunter
`558_goal_phase_start_strategy_probe`.

`[read]` **Damit ist die offene Entscheidung entschieden, und zwar zur
zweiten Antwort:** die Datenbankproben gehoeren in den Kettenlauf, nicht
ins Gate. Das Gate hat keine Wegwerf-Datenbank, der Kettenlauf baut eine
ohnehin und laeuft naechtlich; `punkte-pruefen` liest dessen Status und
wird rot, wenn er faellt. **Die Kette ist der Lauf, der eine
Datenbankprobe tragen kann.**

`[cmd]` **Und seit G-535 ist das Muster vollstaendig vorgemacht:** der
SQL-Schritt und die Probe stehen beide in `kette.json`, die Probe mit
`dependsOn` auf den SQL-Schritt. **Das ist die Form, die hier 114 Mal
zu pruefen ist.**

---

## Was heute gemessen ist — 2026-10-01, Orchestrator

`[cmd]` **Die erste Haelfte dieses Punkts ist erledigt und darf nicht
noch einmal gebaut werden:**

    node --test "tools/__tests__/*.test.mjs"
    # tests 37   # pass 37   # fail 0   12,9 s

Der Aufruf steht als **erster** Schritt in `package.json:10` (`gate`)
und einzeln als `test:werkzeuge`. **5 Dateien, 37 Pruefungen, gruen.**

`[cmd]` **Die zweite Haelfte ist der Auftrag, und sie ist groesser als
der Nachtrag vom 30.09. vermutet:**

    Dateien in _validierung/            164
    davon *.test.ts                     120
    davon in kette.json                   6
    in KEINEM Lauf                      114

`[cmd]` **Die sechs, die laufen, sind alle aus den letzten vier
Tagen:** `goals-g545-strategy-content`, `goals-g558-phase-start-strategy`,
`goals-g559-phase-at`, `goals-g561-relative-weight-guards`,
`goals-g563-target-calculation`, `quer-g535-auth-uid-readers`.
**Alles, was aelter ist als der 27.09., laeuft nicht.**

`[read]` **Das aendert die Erwartung an diesen Auftrag.** 114 Proben
beschreiben einen Bestand aus Monaten, in denen sich die Semantik
mehrfach geaendert hat. **Es ist wahrscheinlich, dass ein erheblicher
Teil rot wird — und das ist das Ergebnis, nicht der Fehlschlag.**

## Auftrag

**A1 — alle 120 einordnen, nicht nur zaehlen.** Je Datei drei Angaben:
braucht sie eine Datenbank, laeuft sie ohne Umgebungsvariable, und
beschreibt sie noch den heutigen Zustand? `[read]` **Eine Datei, die
eine Semantik von vor G-543 prueft, ist kein Waechter, sondern ein
Zeuge** — melde sie als solche.

**A2 — einen ERSTEN Stapel verdrahten, nicht alle 114.** Nimm die, die
keine Umgebungsvariable brauchen und zu einem bestehenden
Kettenabschnitt gehoeren, nach dem Muster aus G-535: Schritt plus
`dependsOn`. **Sag, wie du den Stapel abgegrenzt hast**, und melde die
Schrittzahl vorher und nachher.

**A3 — was rot wird, wird gemeldet, nicht angepasst.** `[read]` **Eine
Probe, die unerwartet rot wird, ist eine Messung** — sie sagt, dass eine
Aussage ueber das Produkt nicht mehr stimmt. **Nicht die Probe aendern,
bis sie schweigt.** Je roter Probe: welche Aussage faellt, und seit
welcher Aenderung. Daraus werden Punkte, einer je Aussage.

**A4 — die Laufzeit ist ein Ergebnis.** Der letzte volle Lauf stand bei
1.459,7 s. **Miss, was dein Stapel kostet**, und sag, ob 114 Proben in
diesem Lauf tragbar sind oder ob der Lauf dafuer geteilt werden muss.
`[read]` Ein naechtlicher Lauf, der nicht mehr durchkommt, ist dasselbe
Problem eine Stufe spaeter.

**A5 — die Umgebungsvariablen benennen.** `goals-g536-goal-strategies`
wirft ohne `LUMEOS_G536_DATABASE`. **Zaehle, wie viele Dateien so
gebaut sind**, und sag, ob die Kette die Variable setzen kann oder ob
die Datei sie nicht brauchen sollte.

**Nicht Teil:** `tools/__tests__/` (laeuft, siehe oben), ein Test je
Waechter (eigene Aufgabe, hier nur festgehalten), und die Frage, ob eine
rote Probe recht hat — das entscheidet der Punkt, der aus ihr entsteht.

**Zu belegen:** die Einordnung aller 120 als Tabelle · Schrittzahl der
Kette vorher und nachher · voller Kettenlauf gruen ODER die rote Liste
mit je einer Zeile Begruendung · Laufzeit vorher und nachher ·
Wegwerf-Datenbank verworfen mit Zaehler · kein `db push` · nichts
committen.
