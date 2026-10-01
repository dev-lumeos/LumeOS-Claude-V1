---
nr: E-84
titel: Die Automatik passt an, der Hinweis ist passiv, gefragt wird einmal
entschieden: 2026-10-01
entscheider: Tom
betrifft: [G-574, G-520, G-539]
---

# E-84 — Die Automatik passt an, der Hinweis ist passiv, gefragt wird einmal

## Die Entscheidung

**Tom, 2026-10-01, 13:05:** *„mischung aus 2 und 3: automatische
anpassung aber passiven hinweis dazu"* — und zur Frage, was mit einer
selbst gesetzten Rate passiert: *„Einmal fragen, dann merken"*.

Daraus:

1. **Greift ein Waechter, passt die Rate sich selbst an.** Der Nutzer
   muss nichts druecken.
2. **Dazu erscheint ein passiver Hinweis** — was angepasst wurde und
   warum, ohne Knopf und ohne Dialog.
3. **Beim ERSTEN Eingriff wird gefragt:** soll die Automatik das
   kuenftig selbst tun? **Die Antwort gilt je Nutzer und wird
   gemerkt.**

## Warum das einen Schemawechsel braucht

`[cmd]` **Die Rate steht in `goals.goal_phases.parameters` als JSON**
(`weight_change_target_percent`). **Keine Spalte sagt, woher ein Wert
kommt** — „der Nutzer hat 0,5 gesetzt" und „das System hat auf 0,45
korrigiert" sind in der Tabelle nicht unterscheidbar. **Und es gibt
keinen Verlauf:** die alte Zahl ist nach dem Schreiben weg.

`[read]` **Ohne Herkunft kann der Hinweis nicht passiv sein.** „Ich habe
von 0,8 auf 0,65 angepasst" setzt voraus, dass die 0,8 noch irgendwo
steht. **Ohne Herkunft ist auch der Editor als Override (G-539)
wirkungslos** — eine bewusst gesetzte Rate wuerde am naechsten
Pruefstichtag lautlos ueberschrieben.

**Also gehoeren dazu:**

- **ein Herkunftsmerkmal an der Rate** — gesetzt vom Nutzer oder von der
  Automatik
- **ein Verlauf der Ratenaenderungen** — alter Wert, neuer Wert, Grund,
  Datum. `goals.tdee_history` ist das Muster, das es dafuer schon gibt.

`[cmd]` **Die Merk-Antwort braucht KEINEN Schemawechsel:**
`public.user_display_preferences` traegt seit C-161 Nutzereinstellungen
als Schluessel-Wert-Paare, und G-565 hat dort `goals.zielrate_einheit`
abgelegt. **Dasselbe Muster, ein zweiter Schluessel.**

## Was damit nicht entschieden ist

`[read]` **Die Frage bleibt offen, was die Automatik tut, solange der
Nutzer nicht geantwortet hat.** Vor der ersten Antwort gibt es keine
gemerkte Wahl. **Naheliegend: anpassen und fragen im selben Zug** — die
Anpassung ist reversibel, weil der Verlauf sie traegt. Das ist eine
Ableitung, keine Festlegung.

`[read]` **Und die Schwellen selbst bleiben, wie G-569 sie gebaut hat** —
relativ, mit dem Gewicht am Pruefstichtag. **Ob die Grenzen bei
abgestuften Raten noch passen, ist G-566 und liegt bei Tobias.**
