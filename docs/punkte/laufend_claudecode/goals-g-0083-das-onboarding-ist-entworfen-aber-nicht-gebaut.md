---
nr: G-83
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-08-21
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-83 - Das Onboarding ist entworfen, aber nicht gebaut

## Befund

(berichtigt 2026-08-20). **Der urspruengliche Befund war falsch.**

  `[cmd]` **Der G-80-Agent meldete:** *„Die einzige Datei ist der
  Klienten-Assistent im Coach-Modul."* **Das stimmt fuer den Code.**

  `[cmd]` **Aber `module-onboarding.jsx` existiert** — **361 Zeilen,
  ein vollstaendiger Assistent:**

  | Schritt | |
  |---|---|
  | 1 | **Willkommen** — *„Elf Module, ein Bild … nichts verlaesst dein Konto, bis du es entscheidest."* |
  | 2 | **Grunddaten** — Name, Geschlecht, Geburtsdatum, Groesse, Gewicht, Land |
  | 3 | **Ziele** — ein Hauptziel aus sechs, mehrere Nebenziele, Zielgewicht, Zielfettanteil, Datum |
  | 4 | **Trainingsart** — setzt den Aktivitaetsfaktor |

  `[read]` **Und Schritt 4 traegt die Begruendung mit:** *„Setzt deinen
  Aktivitaetsmultiplikator — **1,725 fuer fuenf harte Einheiten die
  Woche**."*

  `[cmd]` **Genau der Wert, den C-122 als falsch gesetzt gemessen hat**
  — `very_active` bei 0,58 Trainings je Woche, **1.030 kcal Abstand.**
  **Der Entwurf haette es verhindert.**

  `[cmd]` **Schritt 2 und 3 speisen `profiles` und `user_goals`** —
  beide Tabellen stehen. **Der Erfahrungsgrad (C-118) gehoert hier
  hinein.**

## Auftrag — die drei Onboarding-Punkte zusammenfuehren

**Mitbeauftragt: G-141, G-347.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · Drei Punkte, ein Thema

`[cmd]` **Du hast es selbst gemeldet:** **G-83 und G-141 liegen in
`todos/`, und G-222 hat gerade den Entwurf geliefert.**

`[read]` **Miss, was jeder der drei beschreibt** — **und ob dein
Entwurf sie abdeckt.**

`[read]` **Wo ein Punkt etwas verlangt, das dein Entwurf nicht
hat: sag es.** `[read]` **Wo er dasselbe sagt: schliessen.**

`[cmd]` **G-222 bleibt der tragende Punkt** — **er traegt den
Entwurf.**

### 2 · Und der Entwurf ist zu pruefen, nicht zu bauen

`[cmd]` **Du hast gemessen: nichts ist fuer den Betrieb noetig.**
`[cmd]` **Jede `food_preferences`-Spalte hat eine Vorgabe, 137 von
138 Naehrstoffen arbeiten ohne biologisches Geschlecht.**

`[read]` **Das ist das Ergebnis, das den Entwurf traegt:** **ein
Onboarding, das nichts erzwingt.**

`[read]` **Melde, wenn ein Schritt doch etwas voraussetzt** — **der
138. Naehrstoff zum Beispiel.**

### 3 · G-347 — die Anzeige zieht nach

`[cmd]` **Er stand in deinem letzten Buendel und ist nicht
abgenommen.**

`[read]` **Miss, ob er erledigt ist** — `[cmd]` **`NT` bei
Makronaehrstoffen, *Fettbegleitstoffe* nach *Fette*, vier
`strong_avoid`-Stellen.**

### Was nicht zu tun ist

**Kein Onboarding bauen** — **erst zusammenfuehren.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    G-83, G-141   was sie verlangen, was der Entwurf abdeckt
    Luecken       was fehlt, benannt
    138.          welcher Naehrstoff biologisches Geschlecht braucht
    G-347         erledigt / was fehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
