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
