---
nr: G-562
typ: entscheidung
modul: goals
schwere: hoch
angelegt: 2026-09-30

braucht: [G-544, G-545]
kind_von: G-545

quellen:
  - docs/punkte/erledigt/goals-g-0545-der-katalog-hat-die-form-nicht-den-inhalt.md
  - docs/punkte/erledigt/goals-g-0544-der-phase-reiter-zeigt-keine-zeitachse.md
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - apps/web/src/lib/goals/anker.ts
    - supabase/_pipeline/11_goals/

zahlen:
  gemessen: 2026-09-30
  teilphasen: 3
  davon_mit_wochenangabe: 0
---

# Die Teilphasen haben keine Zeitachse mehr

## Der Befund

`[cmd]` **G-545 hat `sub_phases` umgeschrieben und dabei `weeks` und
`deficit` entfernt.** Vom Orchestrator selbst aus der laufenden
Datenbank gelesen — die drei Stufen tragen heute:

    name · tdee_multiplier · protein_g_per_kg · fat_g_per_kg
    fat_minimum_g_per_kg · cardio (Objekt mit type, minutes,
                                   sessions_per_week)

**Keine Wochenangabe, kein Defizitband.** Vorher stand dort `"24–16"`
je Stufe.

`[cmd]` **Claude Code hat es am Bild gefunden:** der `subphases`-Reiter
des Editors zeigte vier Gedankenstriche je Stufe. Nachgemessen:
**3 Teilphasen, 0 mit Wochenangabe.**

`[read]` **Die Folge trifft G-544:** `anker.ts` rechnet richtig — die
vier Zeilen des Entwurfs sind nachgerechnet und stimmen — **aber die
Rechnung bekommt keine Wochen.** Der Ankerplan fällt auf eine Zeile
zusammen, und der Knopf „Terminplan" der Zeitachse verschwindet damit.

## Was das über die Abnahme sagt

`[cmd]` **Mein Auftrag G-545 verlangte als Nachweis ,,vorher/nachher je
Spalte: wie viele der 17 Zeilen tragen einen Wert".** Eine Zählung.
`[read]` **Eine Zählung kann einen Formwechsel nicht sehen** — vorher 1,
nachher 1, und der Inhalt ist ein anderer. **Die Abnahme hat genau
diese Zahl geprüft und nichts gemerkt.** Beides ist mein Fehler, nicht
der von Codex: er hat die Werte eingetragen, die SSOT 131 belegt, und
131 führt keine Wochen.

## Die Entscheidung

`[read]` **Zwei Wege, und sie unterscheiden sich in der Quelle, nicht
im Aufwand:**

1. **`sub_phases` trägt die Wochen wieder** — neben den neuen Werten.
   `[cmd]` **Die Wochen stehen nur in der überholten Quelle** (Dokument
   A 3.1 und C: 0–4, 4–12, 12–18). v2.0 nennt für Early/Mid/Late keine
   Wochen, sondern nur ein Fenster von 16–20 Wochen für die ganze
   Vorbereitung (131, Abschnitt 4.3).

2. **Der Anker nimmt eine andere Quelle** — die Gesamtdauer
   (`max_duration_weeks`, heute 16) und eine Verteilungsregel. Dann ist
   die Stufendauer eine Rechnung, keine Stammdaten.

`[read]` **Das hängt mit dem offenen Widerspruch aus G-545/A5 zusammen:**
Dokument C gibt eine Rechnung aus Start- und Ziel-KFA, v2.0 ein Fenster.
**Wer die Stufendauer aus der Gesamtdauer ableitet, muss diesen
Widerspruch zuerst auflösen** — sonst rechnet die Verteilung auf einer
Zahl, die selbst nicht steht.

`[read]` **Solange nichts entschieden ist, sagt die Oberfläche es
wörtlich** — Claude Code hat das gebaut, statt „keine Teilphasen" zu
behaupten. Das ist der richtige Zwischenzustand, kein Mangel.

---

## Entschieden — 2026-10-01, E-85

**Tom:** *„ein user erwartet einen vorschlag, der soll aber individuell
von ihm editiert werden koennen"*.

`[cmd]` **Der Vorschlag kommt aus dem Verhaeltnis, nicht aus Wochen:**
0–4 / 4–12 / 12–18 sind 4, 8 und 6 Wochen, als Anteil 22 % / 44 % / 33 %.
Auf 16 Wochen 4 / 7 / 5, auf 20 Wochen 4 / 9 / 7. **Damit behauptet
niemand absolute Wochen**, und der Widerspruch aus G-545/A5 muss nicht
vorher geloest werden.

`[read]` **`sub_phases` bekommt `weeks` NICHT zurueck.** Was fehlte,
war nicht die Zahl, sondern die Regel, aus der sie entsteht. Die
editierten Wochen des Nutzers liegen im Programm (E-85), nicht im
Katalog.
