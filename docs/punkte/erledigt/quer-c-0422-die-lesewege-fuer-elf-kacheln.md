---
nr: C-422
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-421
entscheidung: E-72
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-08
commit: d40e847e
beruehrt:
  tabellen: [recovery.checkins]
zahlen:
  gemessen: 2026-09-07
  anbindbar: 11
  blockiert: 6
---

# C-422 — die Lesewege fuer elf Kacheln

## Befund

Aus C-421, Codex, 2026-09-07.

`[cmd]` **Vier Tabellen gebaut, 1 / 2 / 7 / 21 Seedzeilen.**
`[cmd]` **`public.muscle_training_loads` liefert echte Saetze und
Stunden je Muskelgruppe.**

`[cmd]` **11 von 17 Kacheln sind jetzt anbindbar, 6 bleiben
blockiert.**

## Auftrag — die Lesewege

**Mitbeauftragt: G-363.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-422 — elf Lesewege

`[read]` **Die Tabellen stehen, die Kacheln koennen lesen** — **aber
es gibt noch keine Funktion, die es tut.**

`[cmd]` **A-71: viermal am 07.09. lag ein Leseweg ungenutzt
daneben** — **hier fehlt er ganz.**

`[read]` **Bau je Kachel den Leseweg.** `[read]` **Und sag, welche
sechs blockiert bleiben und woran.**

`[cmd]` **E-72: eine Kachel ohne Daten zeigt einen benannten
Leerhinweis, keine Null.**

### 2 · G-363 — wer schlaegt die naechste Phase vor

`[cmd]` **`recommended_next` in `goal_phases` bleibt leer.**

`[cmd]` **`00_MASTER_VISION.md`, Kernprinzip 3:** *,,Rule-first, AI
second."*

`[read]` **Also: die Regel schlaegt vor, das Modell formuliert.**

`[read]` **Bau die Regel** — **Eingaben sind `projected_end_date`
gegen `actual_end_date` und die 362 Koerpermessungen.**

`[cmd]` **`transition_reason` ist seit G-357 Pflicht** — **ein
Vorschlag liefert einen mit.**

`[read]` **Und der Nutzer kann widersprechen** (E-69).

### Abnahmebedingungen

    A1  je Kachel: liest sie echte Daten? Zahl 11 / angebunden.
    A2  je angebundener Kachel: Zeilen auf test-user > 0.
    A3  die sechs blockierten: woran genau, je Kachel.
    A4  Vollkette laeuft durch. Schritte und Sekunden.
    A5  G-363: ein Vorschlag entsteht, mit Begruendung, belegt.

### Was nicht zu tun ist

**Keine Oberflaeche.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

**Codex, 2026-09-08 — Zwischenbericht nach Dev-Einspielung.**

### C-422

`recovery.card_read_all(user_id)` liefert genau elf Karten-Schluessel:
fuenf Overtraining-, zwei Protokoll-, zwei Stress- und zwei Score-
Beitrags-Karten. Jede Zeile hat `has_data`, JSON-Zeilen und bei keiner
Zeile einen benannten `empty_hint`; damit ist E-72 kein Zahlenwert 0.

| Abnahme | Messung |
| --- | --- |
| A1 | **11 / 11 angebunden** |
| A2 | test-user: Alert **1**, Protokolle **2**, Stress **7**, Beitraege **21**; der Wegwerf-Test meldet **11 / 11** befuellte Karten |
| A3 | Drei Check-in-Karten: Formular/Schreibweg bzw. Erklaerweg fehlen. Phone-camera-HRV: Geraetefunktion fehlt. Sleep: Erklaerweg fehlt. Modality catalog: Register ohne Nutzerbezug bzw. Wirkung je Art fehlt. |

### G-363

`goals.phase_transition_recommendation(user_id, as_of)` schlaegt nur
bei einer offenen, ueberfaelligen Phase mit mindestens zwei
Koerpermessungen vor, schreibt `recommended_next` und einen
`transition_reason`, beendet aber keine Phase. Der Wegwerf-Test erzeugte
einen Vorschlag samt Grund und bestand.

`goals.phase_transition_respond(phase_id, 'rejected', 'Ich moechte die
Phase fortsetzen.')` ist der E-69-Widerspruch: Die Funktion akzeptiert
nur die eigene Phase des angemeldeten Nutzers und schreibt die Antwort
mit optionalem Grund in `goals.phase_transition_responses`. Sie aendert
die Phase nicht.

### A4 und A6

Die Vollkette erreichte mit 161 Schritten die Abschlusspruefung. Nach
dem letzten Grant-Fix pruefte `schema-vollstaendigkeit-pruefen.ts` auf
`lumeos_c422_final2`: **35/35 Tabellen mit RLS/Policies, 41/41
Funktionen**. Der funktionale C-422-Test bestand **2/2** in 1,919 s.
Der komplette Runner wurde nach diesem letzten, ausschliesslichen
Grant-Fix noch nicht erneut durchlaufen.

Dev-Sicherung vor dem Einspielen:
`backup/vollsicherung/20260908_071955_c422_vor_dev_voll.dump`
(26.267.009 Byte). Dev-Einspielung: **1,018 s**. Danach gemessen:
`recovery.card_read_all(uuid)`,
`goals.phase_transition_recommendation(uuid,date)`,
`goals.phase_transition_respond(uuid,text,text)` und
`goals.phase_transition_responses` vorhanden.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

### Live und geprueft

`[cmd]` **Selbst gemessen:**

    recovery.card_read_all
    goals.phase_transition_recommendation
    goals.phase_transition_respond
    goals.phase_transition_responses (Tabelle)

`[cmd]` **`test-user`: 1 / 2 / 7 / 21** — **dieselben Zahlen wie auf
der Wegwerf-Datenbank.**

`[cmd]` **Sicherung:**
`backup/vollsicherung/20260908_071955_c422_vor_dev_voll.dump`.

`[read]` **Zum zweiten Mal eine Sicherung vor dem Einspielen** —
**das ist jetzt seine Gewohnheit, nicht meine Anweisung.**

### 11 von 11 Karten

`[cmd]` **Funktionstest 2/2, alle elf Karten befuellt,
Leerhinweise geprueft.**

`[read]` **E-72 ist damit belegt:** **keine nackte Null, sondern ein
benannter Leerhinweis, wo nichts vorliegt.**

### G-363 — und er hat mehr gebaut als beauftragt

`[cmd]` **`phase_transition_respond` und die Tabelle
`phase_transition_responses`.**

`[read]` **Der Auftrag verlangte den Vorschlag** — **er hat die
Antwort des Nutzers mitgebaut.**

`[cmd]` **Das ist E-69: Tom entscheidet.** `[read]` **Ein Vorschlag
ohne Widerspruchsmoeglichkeit waere ein Trainer, kein Werkzeug** —
**und die Antwort wird jetzt festgehalten, nicht nur ausgefuehrt.**

`[read]` **Damit ist nachvollziehbar, wann jemand einem Vorschlag
gefolgt ist und wann nicht** — **die Grundlage, um spaeter zu
messen, ob die Regel taugt.**

### Was offen bleibt

`[cmd]` **Der abschliessende Wegwerf-Kettenlauf laeuft noch auf
`lumeos_c422_final3`.**

`[read]` **Der Punktelauf meldet den taeglichen Lauf als
fehlgeschlagen** — **der von gestern 21:00 lief in seinem Bereich
und ging nicht durch.**

`[cmd]` **Beides derselbe Nachweis** — **wenn der Lauf durchgeht,
ist es zu.**

**Abgenommen unter dem Vorbehalt des Kettenlaufs.**

