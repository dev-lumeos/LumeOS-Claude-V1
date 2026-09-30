---
nr: G-561
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30

braucht: [G-542, G-545]
kind_von: G-545

quellen:
  - docs/punkte/erledigt/goals-g-0545-der-katalog-hat-die-form-nicht-den-inhalt.md
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - supabase/_pipeline/11_goals/
---

# Sechs Waechter pruefen Kilogramm statt Prozent

## Der Befund

`[cmd]` **Codex hat es gemeldet statt still zu ueberschreiben:** sechs
aeltere Katalogzeilen tragen absolute kg-Waechter — vier Cut-Strategien,
`lean_bulk` und `reverse_diet`. **Und G-520 prueft ebenfalls absolut.**

`[read]` **Das ist fachlich nicht gleichwertig, und die Zahl zeigt es:**

    0,7 kg bei 60 kg  =  rund 1,2 %
    1,2 kg bei 100 kg =  rund 1,2 %

**Derselbe Vorgang, derselbe Anteil — der absolute Waechter behandelt
sie verschieden.** Bei einem leichten Nutzer greift er zu spaet, bei
einem schweren zu frueh.

`[read]` **G-542 hat die Einheit entschieden:** die Zielrate ist Prozent
Koerpergewicht pro Woche, vierfach belegt. **Ein Waechter, der in
Kilogramm prueft, misst gegen eine andere Groesse als die, die das Ziel
fuehrt.**

## Warum es hier nicht nebenbei mitgemacht wurde

`[read]` **Richtig so.** Die sechs Zeilen sind bestehende, hoeher
priorisierte Werte; ein Auftrag, der Leerstellen fuellt, darf gefuellte
Werte nicht umschreiben. **Das ist ein eigener Vorgang, weil er
bestehendes Verhalten aendert** — und weil G-520 mitbetroffen ist, also
nicht nur der Katalog, sondern ein laufender Waechter.

`[annahme]` **Die Umstellung braucht das Gewicht am Stichtag**, nicht
das aktuelle — sonst verschiebt sich die Schwelle mit jedem Wiegen.
Welches Gewicht gilt, ist die Frage, die der Auftrag stellen muss.
