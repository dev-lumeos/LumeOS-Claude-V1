---
nr: C-369
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-298
entscheidung: E-42
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-08-31
---

# C-369 — was mit einem abgelaufenen Plan geschieht

## Befund

Aus G-298, Claude Code, 2026-08-31.

`[cmd]` **Der aktive Plan endete am 15.07., heute ist der 31.08.**
`[cmd]` **Die Karte liest jetzt *aktiv · abgelaufen*** — der Zustand
wird gezeigt und eingeordnet, nicht ueberschrieben.

`[cmd]` **`start_date`, `days_count` und `lifecycle_type` sind alle
`NULL`** — **die Laufzeit steht ausschliesslich in den Tageszeilen.**

## Die Frage

**Was soll geschehen, wenn ein Plan auslaeuft?**

`[cmd]` **E-31 hat drei Zyklen festgelegt:** `once` endet, `rollover`
wiederholt, `sequence` uebergibt an den naechsten.

`[read]` **Bei diesem Plan ist keiner gesetzt** — **er stammt aus der
Zeit vor der Unterscheidung.**

`[read]` **Also zwei Fragen:** **was geschieht mit Altplaenen ohne
Zyklus** — **und wer setzt den Uebergang, wenn ein Zyklus gesetzt
ist?**

`[cmd]` **Einen Hintergrundlauf gibt es nicht** — dieselbe Frage wie
bei C-358, dort mit *beim Anzeigevermerk bleiben* beantwortet.

## Abnahme

**2026-08-31, durch C-377 ersetzt.**

`[read]` **Die Frage ist beantwortet, und zwar von Tom:**

*,,ist ein kompletter plan abgelaufen muss eine meldung kommen und
geklaert werden wie es weiter geht, renew/anderen wochenplan/manuelle
erfassung."*

`[cmd]` **C-377 baut das und laeuft.** `[read]` **Und die zweite
Frage dieses Punktes — wer den Uebergang setzt — ist damit auch
beantwortet: der Nutzer, bei der Meldung.** **Kein Zeitplaner.**

**Geschlossen, fortgefuehrt in C-377.**
