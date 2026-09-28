---
nr: A-77
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-28

quellen:
  - tools/__tests__/g518-dist-dir-sperre.test.mjs
  - tools/__tests__/kettenlauf-status-pruefen.test.mjs
  - package.json:10

beruehrt:
  dateien:
    - package.json
    - tools/__tests__/backup-manifest.test.mjs
    - tools/__tests__/g517-schuss-meldet-die-ursache.test.mjs
    - tools/__tests__/g518-dist-dir-sperre.test.mjs
    - tools/__tests__/kettenlauf-status-pruefen.test.mjs

zahlen:
  gemessen: 2026-09-28
  testdateien: 4
  pruefungen: 33
  dauer_sekunden: 2.7
  berichte_mit_dem_hinweis: 5
---

# A-77 - vier Werkzeugtests liefen nirgends

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
