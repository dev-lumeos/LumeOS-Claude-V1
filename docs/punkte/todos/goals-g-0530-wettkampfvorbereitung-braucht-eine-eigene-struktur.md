---
nr: G-530
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-28

quellen:
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/punkte/todos/goals-g-0521-phasenmodellierung-tiefenrecherche.md
  - docs/specs/Goals/DATABASE.md

braucht: [G-529]
kind_von: G-521

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.user_goals
  dateien:
    - docs/specs/Goals/PHASE_MODELS.md

zahlen:
  gemessen: 2026-09-28
  unterphasen_contest_prep: 4
  monatsabschnitte_annual: 5
  peak_week_tage: 7
  davon_belegt: 5
  tabellen_dafuer_vorhanden: 0
---

# G-530 - contest_prep und expert_bb_annual brauchen eine eigene Struktur

## Die Entscheidung

`[cmd]` **Tom, 2026-09-28, E4:** contest_prep und expert_bb_annual
bekommen eine eigene Struktur. Sie sind keine Phasen im selben Sinn
wie `fat_loss` oder `lean_bulk`.

## Warum sie nicht in das Ratenmodell passen

`[cmd]` **contest_prep hat vier Unterphasen, und ihr Defizit haengt
nicht an einer Rate, sondern am Abstand zum Termin**
(`PHASE_MODELS.md`):

    early      Woche 24-16   -300 kcal   Cardio niedrig
    mid        Woche 16-8    -600 kcal   Cardio mittel
    late       Woche  8-2    -750 kcal   Cardio hoch
    peak_week  Woche  1      Sonderprotokoll

`[read]` **,,Woche 24-16" ist keine Dauer, sondern eine Position.** Wer
in Woche 12 steht, ist in `mid` — unabhaengig davon, wie schnell er
abnimmt. **Das ist die Umkehrung des Ratenmodells:** dort bestimmt die
Rate die Dauer, hier bestimmt der Termin den Parameter.

`[cmd]` **expert_bb_annual ist gar keine Phase, sondern eine Folge
von fuenf:**

    Monat  1-4    lean_bulk
    Monat  5-6    maintenance
    Monat  7-10   contest_prep
    Monat 11      peak_week und Wettkampf
    Monat 12      reverse_diet

`[read]` **Als Phasenart gespeichert kann sie nichts tun.** Eine
Zeile in `goal_phases` mit `phase_type = 'expert_bb_annual'` hat einen
Beginn und ein Ende und keinen Platz fuer fuenf Abschnitte mit
eigenen Parametern. Die Spec nennt dazu `auto_transitions: true` — es
ist eine Vorlage, die Phasen ERZEUGT.

`[cmd]` **peak_week ist tagbasiert, nicht wochenbasiert.** Entladung
Tag 1 bis 3, Aufladung Tag 4 bis 5, Natrium halten. **Zwei der sieben
Tage sind in keiner Quelle belegt** — Vortag und Wettkampftag. Die
Recherche (G-521, F6) sagt dazu: protokollgetrieben, ein Kalorienziel
verliert dort seinen Wert.

## Was gebaut werden soll

`[read]` **Drei Dinge, und nur das erste ist eine Tabelle.**

**1. Ein Plan mit Abschnitten.** Eine Wettkampfvorbereitung ist ein
Plan mit einem Termin und Abschnitten, die sich aus dem Abstand zum
Termin ergeben. Der Zwoelfmonatsplan ist derselbe Gedanke mit
groesserem Raster.

**2. Der Termin als Anker.** Ohne Wettkampfdatum gibt es kein
,,Woche 12 vor der Buehne". **A1 messt, ob es dafuer schon ein Feld
gibt** — `user_goals.target_date` koennte es sein, `goal_phases`
kennt nur `projected_end_date`.

**3. Die Peak Week als Tagesprotokoll**, sieben Zeilen statt einer,
ohne Kalorienpruefung (G-527).

## Nachweiszeilen

**A1** — **zuerst messen, bevor eine Tabelle entsteht:** gibt es
irgendwo eine Struktur fuer Plaene oder Vorlagen? Traegt
`user_goals.target_date` den Wettkampftermin oder etwas anderes?
Wieviele Zeilen haben ihn gesetzt? **Eine neue Tabelle ist die
letzte Antwort, nicht die erste.**

**A2** — die Abschnitte von contest_prep als Daten, mit dem Abstand
zum Termin als Schluessel. **Ein Test, der in Woche 9 und in Woche 7
verschiedene Defizite liefert** und an der Grenze von beiden Seiten
trifft.

**A3** — expert_bb_annual als Vorlage, die Phasen erzeugt, nicht als
Phasenart, die eine ist. `requires: experience_level >= advanced`
gehoert dazu — **und das ist eine Zugangspruefung, kein Hinweis.**

**A4** — die Peak Week mit sieben Tagen. **Tag 6 und 7 bleiben
ausdruecklich leer**, mit Vermerk, dass keine Quelle sie nennt.
Lieber eine sichtbare Luecke als eine erfundene Zahl.

**A5** — **Grenze zu E-74 pruefen:** die Gesundheitswarnung bei
Koerperfett unter 5 % (M) / 10 % (F) faellt in dieser Struktur an.
Fagerberg 2018 stuetzt 4 bis 5 % als Risikozone. **Diese Schwelle
wird NICHT konfigurierbar** — der Recherchebericht empfiehlt das
(F9), und fuer eine Gesundheitswarnung ist es falsch.

**A6** — die neun Phasenarten bleiben unberuehrt (G-529). Diese
Struktur liegt daneben, sie ersetzt nichts.

**A7** — nichts live, bis G-529 steht. Wegwerf-Datenbank, Sicherung
nach `backup/`.
