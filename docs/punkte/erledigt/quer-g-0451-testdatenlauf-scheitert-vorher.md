---
nr: G-451
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-493
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: e6577da4
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-08
---

# G-451 — der Testdatenlauf scheitert vor C-493

## Befund

Aus C-493, Codex, 2026-09-08:

> *,,Der allgemeine Testdatenlauf scheitert schon VOR C-493
transaktional an bestehenden Fremdbefunden:
`shopping_lists_source_target_check`, danach ein
`recovery.score_contributions`-Duplikat."*

`[read]` **Er hat sie nicht angefasst** ? **ausserhalb seines
Auftrags.**

## Was das bedeutet

`[cmd]` **`testdaten-einspielen.ts` laeuft transaktional** ?
**ein Fehler in Eintrag 3 verhindert Eintrag 24.**

`[read]` **C-493 wurde deshalb einzeln geprueft** ? **der
vollstaendige Lauf kommt nie dort an.**

## Zwei Fehler, einzeln

**1** ? `shopping_lists_source_target_check`

`[cmd]` **Ein CHECK auf `nutrition.shopping_lists`** ? **miss,
welche Zeile ihn verletzt.**

**2** ? **`recovery.score_contributions`-Duplikat**

`[cmd]` **Ein eindeutiger Schluessel wird zweimal
geschrieben** ? **miss, von welchen zwei Eintraegen.**

## Warum es zaehlt

`[read]` **Der Testdatenpfad ist der einzige Weg, ein frisches
Konto zu fuellen.**

`[cmd]` **Solange er faellt, kann niemand pruefen, ob ein
Frischaufbau die Karte fuellt.**

## Bericht — 2026-09-15

Sicherung vorher: `backup/schema/20260915190638_g444_g451_vorher.sql`.

Der erste Fehler war eine Aufraeumreihenfolge: eine bestehende
`meal_plan`-Einkaufsliste des `test-user@lumeos.local` blieb stehen,
waehrend ihre Planwoche geloescht wurde. Das `ON DELETE SET NULL` machte
daraus die unzulaessige Kombination `source = 'meal_plan'` und
`meal_plan_week_id IS NULL`. Der Seed loescht dessen Einkaufslisten jetzt
vor den Planwochen.

Der zweite Fehler kam aus dem C-421-Nachweisbestand: derselbe feste
`test-user` bekam beim zweiten Lauf erneut dieselben
`recovery.score_contributions` mit gleichem eindeutigen Schluessel. Vor dem
Neuaufbau werden dessen Contributions sowie Stress-, Protokoll- und
Alert-Zeilen entfernt.

Beim ersten echten Durchlauf danach wurden zwei verdeckte Altfehler sichtbar
und gemessen behoben: Die gezielte Storage-Bereinigung braucht die lokale
Testfreigabe; C-429 darf nach `SET LOCAL ROLE authenticated` nicht mehr
`auth.users` lesen. Die Pruefkonto-ID wird deshalb davor einmal aufgeloest
und danach nur noch per `current_setting('app.test_user_id')` verwendet.

Das C-236-Gate behandelte identische Arbeitssatzlasten zusaetzlich als
unplausible Messwert-Zaehlreihe. Es prueft weiter die longitudinalen
Recovery-Messwerte, aber keine Wiederholungen innerhalb eines Trainingssatzes.

Nachweis: `testdaten-einspielen.ts` lief zweimal vollstaendig bis `COMMIT`;
der zweite Lauf stellte wieder 3 Nutzer, 2.169 Mahlzeiten, 6.751 Positionen,
170 Check-ins und 170 Scores her. Die Regressionstests
`quer-g451-testdatenlauf.test.ts` (6/6) und
`quer-c236-zaehlreihen-gate.test.ts` (1/1) sind gruen.

Die frische Vollkette `g451_c501_final` schloss anschliessend in 981,6 s
mit `SCHEMA VOLLSTAENDIG` ab. Die Punktpruefung ist gruen.

## Abnahme

**2026-09-08, Orchestrator.**

> *,,`testdaten-einspielen.ts` laeuft nun ZWEIMAL vollstaendig
bis COMMIT."*

`[cmd]` **Fuenf Ursachen behoben:** **Einkaufslisten-Reihenfolge,
C-421-Duplikate, Storage-Freigabe, C-429-Rollenwechsel, das zu
breite C-236-Gate.**

`[cmd]` **8/8 Regressionstests gruen.**

`[read]` **Mein Auftrag nannte ZWEI Fehler** ? **er hat fuenf
gefunden.**

### Und er hat die Grenze gezogen

> *,,`testdaten-pruefen.ts` bleibt mit 15 AELTEREN
Soll/Ist-Abweichungen rot. Diese Abweichungen sind nicht mehr
die zwei G-451-Abbrueche und wurden nicht stillschweigend in
diesen Auftrag gezogen."*

`[read]` **Der Lauf geht durch, der Waechter ist noch rot** ?
**zwei verschiedene Sachen, sauber getrennt.**

**Abgenommen.**
