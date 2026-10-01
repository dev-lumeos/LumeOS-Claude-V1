---
nr: A-84
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01

braucht: [A-82]
kind_von: A-82

quellen:
  - package.json
  - .githooks/pre-commit
  - tools/encoding-pruefen.mjs

erledigt: 2026-10-01
commit: 724cfd29
beruehrt:
  dateien:
    - .githooks/pre-commit
    - package.json
    - tools/encoding-pruefen.mjs
    - tools/migration-kette-pruefen.mjs

zahlen:
  gemessen: 2026-10-01
  waechter_sekunden: 43.0
  encoding_sekunden: 15.6
  encoding_dateien: 21692
  gate_docs_sekunden: 15.7
---

# Der Pruefumfang haengt am Staging, nicht am Repo

## Der Anlass

**Tom, 2026-10-01, 08:18:** *„bei allem respekt an deine waechter aber
das ist nicht tragbar dass ich hier rumsitze niemand was arbeitet und ein
simpler commit solange braucht."*

`[cmd]` **Gemessen, je Skript einzeln:**

    15,6s  encoding-pruefen           21.692 Dateien
     5,0s  supplement-kennungen
     4,5s  supplement-kern-dubletten
     3,7s  svgpfade-pruefen
     2,5s  zwei-wahrheiten / regel-operatoren
     1,9s  punkte-pruefen
     ...   21 weitere, zusammen 9,8s
    43,0s  27 Waechter

**Vier Skripte sind 29 der 43 Sekunden** — und keines davon hat mit einem
Dokument-Commit zu tun. Dazu die 33 Werkzeugtests und Turbo; Turbo war in
den Laeufen des 30.09. fast immer gecacht (`150ms >>> FULL TURBO`) und
damit nicht der Posten.

## Was gebaut wurde

`[cmd]` **`.githooks/pre-commit` waehlt den Umfang am Staging.** Traegt
der Commit nur Dateien unter `docs/`, laeuft `pnpm gate:docs`; sobald eine
Datei ausserhalb dabei ist, laeuft `pnpm gate` unveraendert.

`[cmd]` **`gate:docs` fuehrt 13 Waechter und braucht 15,7 s.** Gemessen,
nicht geschaetzt — und **nicht die unter 10 s, die der Orchestrator
angekuendigt hatte.** Die Differenz ist die Node-Startzeit ueber 13
Aufrufe: die Skripte selbst summieren auf etwa 7 s.

`[cmd]` **`encoding-pruefen --staged`** liest die Dateien im Staging statt
das Repo: **0,2 s statt 15,6 s.**

`[cmd]` **A-82 ist mitbehoben:** `migration-kette-pruefen --staging` liest
den Zustand nach dem Commit — was in HEAD steht, plus das Staging, minus
die geloeschten. **Vorher las es `fs.readdirSync` ueber den Arbeitsbaum**,
und eine Migration, die ein Agent gerade schrieb, machte den Commit eines
anderen rot.

## Die Gegenproben, in beide Richtungen

`[cmd]` **`encoding-pruefen --staged`:**

    kaputte Datei im Staging          exit 1   0,2s
    dieselbe nur im Arbeitsbaum       exit 0
      und der volle Lauf dazu         exit 1   20,8s
    aufgeraeumt                       exit 0   21.692 Dateien

`[cmd]` **`migration-kette-pruefen --staging`:**

    Migration nur im Arbeitsbaum      Baum rot, Staging GRUEN
    dieselbe im Staging               BEIDE rot
    aufgeraeumt                       beide gruen

`[read]` **Die zweite Zeile ist die, auf die es ankommt:** die Entlastung
verschluckt keine echte Luecke. Eine Migration ohne Kettenschritt faellt
weiter auf, sobald sie Teil des Commits ist.

## Was bewusst schwaecher ist

`[read]` **`--staged` sieht einen Schaden nicht, der schon im Repo
liegt.** Deshalb faehrt `pnpm gate` weiter den vollen Lauf ueber alle
21.692 Dateien, und nur `gate:docs` nimmt die schmale Fassung. **Ein
Schaden kann nur ueber einen Commit hereinkommen — und den sieht sie.**

`[read]` **Und der Datenbankgegencheck in `encoding-pruefen` entfaellt
mit `--staged`.** Er fragt die laufende Datenbank nach Muskelkartennamen;
das hat mit den Dateien eines Dokument-Commits nichts zu tun. Im vollen
Lauf bleibt er.

## Was offen bleibt

`[read]` **Die 15,7 s sind noch nicht gut.** Etwa 8 s davon sind
Node-Startzeit, weil 13 Prozesse hintereinander hochfahren. **Ein Laeufer,
der die Waechter in einem Prozess auffuehrt, waere der naechste Schritt**
— das ist ein eigener Punkt, kein Nachtrag hier.

`[cmd]` **Und `encoding-pruefen` im vollen Lauf bleibt bei 15,6 s.** Fuer
einen Code-Commit ist das der Preis; wer ihn senken will, muss die
Dateiliste eingrenzen, nicht die Pruefung.

## Abnahme 2026-10-01 — `724cfd29`

`[cmd]` **Der Haken waehlt den Umfang, und beides ist belegt:**

    nur docs/ im Commit     "[gate] nur docs/ im Commit (2 Dateien)
                             — pnpm gate:docs ..."
    tools/ im Commit        "[gate] pnpm gate (typecheck + test +
                             build) ..."   184 s, gruen

`[cmd]` **Und ein Dokument-Commit wird trotzdem rot, wenn eine
Punktdatei kaputt ist.** Mit einem toten Quellenverweis in dieser Datei:
`[punkte] 26 Befund(e), Soll 25 ... 1 quellen` — abgebrochen nach 36 s,
ueber `gate:docs`. **Die Entlastung verschluckt keinen Befund.**

`[cmd]` **Die 184 s des vollen Laufs sind der ehrliche Preis eines
Code-Commits**, wenn die Agenten gerade `apps/web` angefasst haben und
Turbo neu baut. Gecacht sind es rund 60 s.

## Was der Orchestrator sich dabei abgewoehnt

`[read]` **Ich habe die Waechter doppelt gefahren** — vier- bis fuenfmal
pro Runde einzeln vor dem Commit, und dann noch einmal im Haken. **Das
hoert auf:** schreiben, committen, Logende lesen. Wird er rot, korrigiere
ich. Derselbe Aufwand, ohne den Vorlauf.
