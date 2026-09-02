---
nr: C-400
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-397
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-02
  wochen: 2
  eintraege: 57
---

# C-400 — eine Woche zuviel im Buddy-Plan

## Befund

Aus C-397, Codex, 2026-09-02: *,,Buddy auto-plan hat 29 statt 28
Eintraege (am 02.09. fuenf)."*

`[cmd]` **Nachgemessen: zwei Wochen, 14 Tage, 57 Eintraege.**

    18.-24.06.     je 4                     = 28
    31.08.-06.09.  je 4, am 02.09. fuenf    = 29

`[read]` **Die zweite Woche hat der Orchestrator am 02.09.
angelegt**, als er die drei Plaene fuellte — `[cmd]` **und der fuenfte
Eintrag entstand beim Ausprobieren.**

`[cmd]` **C-380 fuellte die Plaene danach mit passenden Naehrwerten**
— **die alte Woche blieb stehen.**

`[read]` **Codex hat nichts geloescht und den Test nicht
abgeschwaecht** — richtig.

## Zu klaeren

`[read]` **Welche Woche gehoert zum Plan?** `[cmd]` **`days_count`
steht auf 7** — **also eine, nicht zwei.**

`[read]` **Und der Test erwartet 28.** `[read]` **Entweder die
ueberzaehlige Woche faellt weg, oder der Plan traegt 14 Tage und der
Test ist falsch.**

`[cmd]` **`Cut 4-Meal 2200` und `Lean bulk 3100` sind zu pruefen** —
**sie entstanden im selben Lauf.**

## Auftrag — die ueberzaehlige Woche und zwei Reste

**Mitbeauftragt: C-187, C-216.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-400 — eine Woche zuviel

`[cmd]` **`Buddy auto-plan`: zwei Wochen, 14 Tage, 57 Eintraege.**

    18.-24.06.     je 4                   = 28
    31.08.-06.09.  je 4, am 02.09. fuenf  = 29

`[cmd]` **`days_count` steht auf 7** — **also eine Woche.**

`[read]` **Die zweite hat der Orchestrator am 02.09. angelegt**, der
fuenfte Eintrag entstand beim Ausprobieren.

`[cmd]` **`Cut 4-Meal 2200` und `Lean bulk 3100` entstanden im
selben Lauf** — **pruef sie mit.**

`[read]` **Und sag, was richtig ist:** **die Woche entfernen, oder
`days_count` auf 14 und den Test anpassen?** `[read]` **Beides ist
vertretbar, aber der Test erwartet 28.**

### 2 · C-187 — die drei offenen Datenluecken

`[cmd]` **Du hast gemessen: offen bleiben EAA, die zehn
Medication-Monitoring-Spalten, der CHOL-Livebestand.**

`[read]` **Miss, was zum Schliessen noetig waere** — **und ob es
Daten gibt oder eine Entscheidung.**

### 3 · C-216 — dein Manifestvorschlag

`[cmd]` **`backup/` misst 11.606 Dateien, 5,959 GiB.**

`[read]` **Du hast einen Manifest- und Archivierungslauf
vorgeschlagen.** `[read]` **Bau ihn** — **aber ohne Loeschung, A-39
haelt.**

`[read]` **Ein Manifest, das sagt was drinliegt und wozu es
gehoert**, ist der erste Schritt. `[cmd]` **Heute liegen dort
Bildschirmfotos, Proben-Skripte und Sicherungen ohne
Unterscheidung.**

### Was nicht zu tun ist

**Nichts in `backup/` loeschen** — A-39.
**Nichts auf `dev@lumeos.app` loeschen** ohne den Befund zu melden.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    drei Plaene    Wochen und Eintraege je Plan
    Vorschlag      Woche weg oder days_count 14, begruendet
    C-187          was fehlt zum Schliessen
    Manifest       was liegt in backup/, nach Zweck getrennt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
