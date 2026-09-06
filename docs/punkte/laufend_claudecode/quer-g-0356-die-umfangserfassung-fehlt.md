---
nr: G-356
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-355
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.body_circumferences]
zahlen:
  gemessen: 2026-09-07
  messpunkte: 13
  zeilen: 54
---

# G-356 — die Umfangserfassung fehlt

## Befund

Aus G-355, Claude Code, 2026-09-07.

`[cmd]` **`goals.body_circumferences` traegt 13 Messpunkte, links und
rechts getrennt** — Hals, Schultern, Brust, Ober- und Unterarm,
Taille, Huefte, Oberschenkel, Wade.

`[cmd]` **54 Zeilen im Bestand.** `[cmd]` **Die Ansicht ist
fertig.** `[cmd]` **Der Schreibweg fehlt.**

`[read]` **13 tote Punkte** — **man sieht sie, man kann sie nicht
eintragen.**

## Warum es der erste Schritt ist

`[read]` **Von zwei moeglichen Schreibwegen ist dieser der
kleinere:**

`[read]` **Die Umfaenge sind ein Formular** — **13 Zahlen und ein
Datum.** `[cmd]` **Die Ansicht steht, die Tabelle steht, die Daten
stehen.**

`[read]` **Der Phasenwechsel dagegen braucht eine Zustandsmaschine**
(G-357) — **neun Arten, Uebergaenge, Begruendungen.**

`[read]` **Und ein Bodybuilder misst woechentlich Umfaenge** —
**Phasen wechselt er viermal im Jahr.**

## Was zu bauen ist

`[cmd]` **Ein Erfassungsweg wie bei `body_measurements`** — **dort
ist er gebaut, `ffmi` ist vollstaendig angeschlossen.**

`[cmd]` **`measurement_source` und `source_detail` stehen in der
Tabelle** — **dieselbe Spalten wie ueberall.**

`[read]` **Links und rechts getrennt** — **das ist der Sinn der
Sache, nicht ein Detail.**

## Auftrag — der kleinere Schreibweg zuerst

**Mitbeauftragt: G-358.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-356 — die Umfangserfassung

`[read]` **Von den zwei Schreibwegen ist das der kleinere** —
**13 Zahlen und ein Datum.**

`[cmd]` **Die Ansicht steht, die Tabelle steht, 54 Zeilen liegen
drin.**

`[cmd]` **`body_measurements` hat den Weg schon** — **`ffmi` ist
vollstaendig angeschlossen.** `[read]` **Nimm ihn als Vorlage.**

`[read]` **Links und rechts getrennt** — **das ist der Sinn, nicht
ein Detail.**

`[cmd]` **`measurement_source` und `source_detail` wie ueberall.**

### 2 · G-358 — die 62 Vermerke bekommen einen Grund

`[cmd]` **Du hast gezaehlt: 69 Attrappen-Vermerke, 62 ohne Ursache.**

`[read]` **Ein Vermerk sagt *,,noch nicht"*.** `[read]` **Er sagt
nicht, worauf er wartet** — **und nach drei Wochen weiss es
niemand mehr.**

**Die Form:**

    // Attrappe -- SPEC_08 Flow 3
    //   wartet auf: goal_phases-Schreibweg (G-357)

`[read]` **Quelle und Grund, eine Zeile je Vermerk.**

`[read]` **Wo du den Grund nicht kennst, schreib das hin** —
**`wartet auf: unbekannt, nie untersucht`** ist ehrlicher als
nichts.

`[cmd]` **Und melde, wie viele davon auf denselben Punkt zeigen** —
**wenn 40 auf G-357 warten, ist das eine Zahl, die Tom sehen
sollte.**

### Was nicht zu tun ist

**Keine Phase bauen** — **G-357 braucht erst eine Entscheidung.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Umfaenge        eingetragen und gelesen, 13 Punkte
    links/rechts    getrennt, am Schirm
    62 Vermerke     je ein Grund, mit Quelle
    Haeufungen      wie viele auf denselben Punkt zeigen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
