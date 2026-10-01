---
nr: G-574
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-01

braucht: []
kind_von: G-520

quellen:
  - docs/punkte/erledigt/goals-g-0569-g520-prueft-kilogramm-in-der-anwendung.md
  - docs/punkte/todos/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md

beruehrt:
  dateien:
    - apps/web/src/lib/goals/uebergangswaechter.ts
    - apps/web/src/lib/goals/anpassung.ts
    - apps/web/src/app/v2/goals/phasen-editor-echt.tsx
---

# Die Waechter rechnen, und niemand sieht sie

## Der Befund

`[cmd]` **`pruefeWaechter` und `wochenAnpassung` haben keinen Aufrufer in
der Oberflaeche.** Gezaehlt in `apps/` und `packages/`, ohne Tests:

    phasen-editor-echt.tsx:534   Kommentar
    editor-rechnungen.ts:227     Kommentar
    uebergangswaechter.ts:312/313  der interne Aufruf

`[read]` **Das ist Ebene 6 der Bauordnung — die Automatik.** G-520 hat
sie gebaut, G-561 hat die Katalogseite richtig gestellt, G-569 die
Anwendungsseite. **Drei Auftraege auf eine Rechnung, die kein Nutzer zu
sehen bekommt.**

`[cmd]` **Der Agent konnte seinen eigenen Bildnachweis nicht fuehren** —
es gibt keinen Schirm, auf dem die Schwellen erscheinen. Er hat die
Funktionen direkt durchlaufen lassen und das gemeldet, statt ein Bild zu
behaupten.

`[read]` **Dieselbe Klasse wie G-571**, am selben Tag gefunden: dort
sechs Datenbankfunktionen ohne Aufrufer, hier zwei Rechenwerke ohne
Anzeige. **Jede Messung hatte gefragt, ob die Rechnung stimmt, keine, ob
sie ankommt.**

## Was zu entscheiden ist, vor dem Bau

`[read]` **Ein Waechter kann auf drei Weisen erscheinen**, und das ist
keine Bauentscheidung, sondern eine Produktentscheidung:

1. **Als Hinweis an der Phase** — „dein Tempo liegt ueber der Grenze",
   passiv, der Nutzer entscheidet.
2. **Als Vorschlag mit Knopf** — die Wochenanpassung rechnet
   `rate_delta`, und der Nutzer uebernimmt sie oder nicht.
3. **Automatisch** — die Phase passt sich an, der Nutzer sieht es im
   Verlauf.

`[cmd]` **Die Zahlen fuer alle drei liegen vor:**
`wochenAnpassung` gibt `rate_delta` und eine Begruendung,
`pruefeWaechter` gibt je Waechter, ob er greift, und seit G-569 den Text
in beiden Einheiten mit der Grenze **zum Gewicht des Nutzers**
(0,972 kg/Woche bei 81,4 kg, nicht pauschal 1,0).

`[annahme]` **Die zweite Form ist die wahrscheinlichste** — sie passt zu
E-83 (der Nutzer waehlt) und zum Editor als Override (G-539). Aber das
ist eine Vermutung, und sie gehoert Tom.

**Nicht Teil:** die Rechnung selbst (G-520, G-561, G-569 — alle
erledigt) und die Frage, ob die Schwellen bei abgestuften Raten noch
passen (G-566, bei Tobias).

**Zu belegen, sobald entschieden:** Bild je Einheit auf
`test-user@lumeos.local` · ein Nutzer, bei dem ein Waechter wirklich
greift (die Randprobe sagt, welche Werte das sind) · Sabotage je
Zusicherung in beide Richtungen.

---

## Entschieden — 2026-10-01, E-84

**Tom:** *„mischung aus 2 und 3: automatische anpassung aber passiven
hinweis dazu"* und *„Einmal fragen, dann merken"*.

Also: die Rate passt sich selbst an, ein passiver Hinweis sagt was und
warum, und beim ERSTEN Eingriff wird gefragt, ob die Automatik das
kuenftig selbst tun soll — die Antwort gilt je Nutzer.

`[read]` **Damit ist dieser Punkt beauftragbar, aber nicht allein:**
E-84 verlangt ein Herkunftsmerkmal an der Rate und einen Verlauf der
Aenderungen (Datenbank, Codex), bevor die Oberflaeche den Hinweis
schreiben kann. `[cmd]` **Die Merk-Antwort braucht keinen
Schemawechsel** — `user_display_preferences`, dasselbe Muster wie
`goals.zielrate_einheit` aus G-565.
