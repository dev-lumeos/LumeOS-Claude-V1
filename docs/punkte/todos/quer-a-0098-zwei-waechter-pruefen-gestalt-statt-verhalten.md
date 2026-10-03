---
nr: A-98
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-03

braucht: [A-97, G-570, A-77]
kind_von: A-97

quellen:
  - docs/punkte/erledigt/quer-a-0097-der-a88-vertrag-hat-eine-tuer-und-der-waechter-sieht-sie-nicht.md
  - docs/punkte/erledigt/goals-g-0570-der-rueckfall-gehoert-nach-dem-einspielen-weg.md
  - docs/punkte/erledigt/goals-g-0595-der-zweiparameter-mantel-war-kein-ueberrest.md

beruehrt:
  tabellen: []
  dateien:
    - tools/pipeline-database-vertrag.mjs
---

# Zwei Waechter pruefen Gestalt statt Verhalten — und beide haben heute versagt

## Der Befund — zwei Ausfaelle an einem Tag, dieselbe Wurzel

`[read]` **Am 2026-10-03 ist LumeOS zweimal ausgefallen, und beide Male
hat das Gate vorher gruen gemeldet.**

`[cmd]` **Erstens, 10:15 bis 11:58 — die Goals-Seite.** A-95 entfernte
`goals.berechne_zielwerte(uuid, date)`; `zielwerte-read.ts` rief sie
weiter. **Niemand hat es gesehen**, bis Tom es sah. `pnpm gate` war gruen
(2.575 Tests), weil es **gegen keine Datenbank laeuft** (A-77).

`[cmd]` **Zweitens, 10:15 bis 12:30 — der A-88-Vertrag.** A-95 baute zwei
Schalter ein, die `PGDATABASE=postgres` zuliessen.
`tools/pipeline-database-vertrag.mjs` blieb **gruen**:

    function hatFailClosed(inhalt, variable) {
      const fehlt = new RegExp(`!\\s*${name}\\b`).test(inhalt)
      const basisdatenbank =
        new RegExp(`\\b${name}\\s*===\\s*(['"])postgres\\1`).test(inhalt)
      return fehlt && basisdatenbank
    }

**Er sucht zwei Muster irgendwo in der Datei und nicht den unbedingten
Wurf.** Beide Muster standen weiter da.

`[read]` **Das ist eine Klasse, nicht zwei Vorfaelle:** ein Waechter, der
Text zaehlt statt einen Lauf zu machen, bestaetigt die Absicht und nicht
die Wirkung. **Dieselbe Klasse wie `assert.match`** in G-578, G-581 und
G-583 — dort eine Ebene tiefer.

## A1 — der Datenbankvertrag wird am Lauf geprueft

`[cmd]` **Der Beleg, dass es geht, liegt schon vor.** Der Orchestrator hat
A-97 so abgenommen, von Hand, vier Laeufe:

    030_mikro-uebersicht.ts   PGDATABASE=postgres   Exit 1
    030_mikro-uebersicht.ts   ohne PGDATABASE       Exit 1
    testdaten-einspielen.ts   PGDATABASE=postgres   Exit 1
    testdaten-einspielen.ts   ohne PGDATABASE       Exit 1

`[read]` **Genau das gehoert in den Waechter**, je Skript, statt der zwei
Textmuster. **Die Gegenprobe ist Pflicht:** mit einem eingebauten
Schalter muss er rot werden — das ist der Fall, der heute durchkam, und
A-88s drei Sabotagen haben ihn nicht abgedeckt.

`[annahme]` **Die Kosten sind der Haken.** Ein Lauf je Skript ueber
~120 Proben waere teuer. **Moeglich ist ein Mittelweg:** nur die Dateien
laufen lassen, die `PGDATABASE` lesen, und nur bis zum ersten Wurf —
die Skripte werfen in der zweiten Zeile. **Zu messen, bevor gebaut wird.**

## A2 — der Abgleich `.rpc()` gegen `pg_proc`

`[cmd]` **Claude Code hat den Befund in G-570/A3 gesucht und nichts
gefunden:** kein Werkzeug haelt die `.rpc('name', {args})`-Aufrufe in
`apps/` gegen die Funktionen der laufenden Datenbank.
`tools/schemafreigabe-pruefen.mjs` kommt am naechsten und prueft
**Schemata, keine Funktionen.**

`[read]` **Daran ist die Goals-Seite heute zweimal gestorben**, und zwar
in beide Richtungen: am 01.10. rief die Anwendung dreiparametrig, als nur
zweiparametrig live stand (G-570s Anlass); am 03.10. umgekehrt (G-595).
**Beide Male war der Aufruf im Code richtig und die Datenbank anders.**

`[cmd]` **Was ein solches Werkzeug braucht:** die Argumentnamen, nicht nur
den Funktionsnamen — PostgREST loest ueber die Argumentliste auf, und
genau daran scheiterte es. **Und es muss nach jedem Einspielen laufen**,
nicht im Gate: das Gate hat keine Datenbank.

`[annahme]` **Der kleinste Nutzen zuerst:** ein Skript, das die Aufrufe
sammelt und gegen `pg_proc` haelt, von Hand aufrufbar. **Erst wenn es
etwas findet, lohnt die Frage, wo es automatisch laufen soll.**

## Was Tom entscheiden muss

`[read]` **Beide Teile sind neue oder geaenderte Werkzeuge in `tools/`,
und das ist der Bereich, in dem Tom am 02.10. deutlich geworden ist:**
*„du baust tausende waechter und workflows und es wird immer wie
schlimmer."*

`[read]` **Deshalb liegt dieser Punkt in `todos/` und nicht in `next/`.**
Die Frage ist nicht, ob der Befund stimmt — er ist zweimal belegt. Die
Frage ist, **ob ein Werkzeug die richtige Antwort ist** oder ob die zwei
Handgriffe aus `LAUFEND.md` genuegen:

    nach jedem Live-DDL:  NOTIFY pgrst, 'reload schema'
    danach:               node tools/schuss.mjs <pfad> <bild.png>

`[cmd]` **Der zweite Handgriff haette beide Ausfaelle gefunden** — er
kostet 1,3 Sekunden und braucht kein neues Werkzeug. **A1 dagegen ist
kein neuer Waechter, sondern die Berichtigung eines bestehenden, der
heute falsch gruen gemeldet hat.**

`[annahme]` **Empfehlung des Orchestrators:** A1 ja (ein Waechter, der
nicht misst, ist schlimmer als keiner), A2 nein — solange die zwei
Handgriffe gelten und eingehalten werden. **Aber das ist Toms
Entscheidung, nicht meine.**

**Nicht Teil:** A-77 (das Gate hat keine Datenbank, das bleibt so) ·
A-96 (Logdatei des Nachtlaufs) · die zwei Handgriffe selbst, die stehen
schon in `LAUFEND.md`.
