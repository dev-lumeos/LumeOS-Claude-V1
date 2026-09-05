---
nr: C-412
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-348
entscheidung: null
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [supplements.intake_logs]
zahlen:
  gemessen: 2026-09-07
  letzter_eintrag: 2026-08-19
---

# C-412 — `intake_logs` endet am 19. August

## Befund

Aus G-348, Claude Code, 2026-09-07.

`[cmd]` **`intake_logs` endet am 19.08.**

`[read]` **Ein 7-Tage-Strom wuerde Supplements faelschlich als still
zeigen.**

`[read]` **Das ist der gefaehrliche Fall:** **eine richtige Funktion
auf altem Bestand erzeugt eine falsche Aussage.**

`[read]` **Und niemand haette es gemerkt** — **die Kachel waere leer
gewesen, und leer sieht aus wie *nichts eingenommen*.**

## Zu messen

`[read]` **Warum endet der Bestand?** `[cmd]` **Ein Seed, der nur bis
dahin reicht** — **oder ein Schreibweg, der aufgehoert hat?**

`[cmd]` **Nutrition traegt Mahlzeiten bis heute** — **die Konten
werden also benutzt.**

`[read]` **Und ob weitere Module denselben Stand haben:** `[cmd]`
**Training, Recovery, Medical** — **wenn drei von fuenf im August
enden, ist es der Seed.**

## Warum es fuer G-152 zaehlt

`[read]` **Der Aktivitaetsstrom des Dashboards zeigt, was zuletzt
geschah.**

`[read]` **Auf einem Bestand, der vor drei Wochen endet, zeigt er
Stille** — **und der Nutzer glaubt, das Modul sei tot.**

## Auftrag — alter Bestand und eine fehlende Sicht

**Mitbeauftragt: G-152, C-394.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-412 — `intake_logs` endet am 19.08.

`[cmd]` **Claude Code hat es gemessen** — **ein 7-Tage-Strom wuerde
Supplements faelschlich als still zeigen.**

`[read]` **Der gefaehrliche Fall: eine richtige Funktion auf altem
Bestand erzeugt eine falsche Aussage.** `[read]` **Und leer sieht aus
wie *nichts eingenommen*.**

`[read]` **Miss, warum der Bestand endet:** **ein Seed, der nur bis
dahin reicht — oder ein Schreibweg, der aufgehoert hat?**

`[cmd]` **Nutrition traegt Mahlzeiten bis heute** — **die Konten
werden benutzt.**

`[read]` **Und ob weitere Module denselben Stand haben:** `[cmd]`
**Training, Recovery, Medical** — **wenn drei von fuenf im August
enden, ist es der Seed.**

### 2 · G-152 — die Sicht fuer den Aktivitaetsstrom

`[cmd]` **E-52 gilt:** **gemeinsame Sichten statt sechs Abfragen.**

`[cmd]` **Claude Code wartet seit zwei Auftraegen darauf.**

`[read]` **Bau sie** — **und beachte C-412: auf einem Bestand, der
vor drei Wochen endet, zeigt sie Stille.**

`[read]` **Die Sicht ist trotzdem richtig** — **aber melde, was der
Bestand daraus macht.**

### 3 · C-394 — `test-user` hat nichts

`[cmd]` **Du hast gemessen: keine Preferences, keine Meals, nicht im
Zwei-Konten-Seed.**

`[cmd]` **Und dein Seed-Vorschlag steht in C-241, mit
Groessenordnung.**

`[read]` **Bau ihn jetzt** — **G-222 entwirft gerade das Onboarding,
und dafuer braucht es ein Konto, das den Leerzustand zeigt UND eines,
das den vollen Fall traegt.**

`[cmd]` **Die Regel bleibt: Nachweise auf `test-user`, weil Laeufe
auf `dev` Toms Einstellungen ueberschreiben.**

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` loeschen.**
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    intake_logs   warum der Bestand endet, mit Datum
    andere Module gleicher Stand? gezaehlt
    Sicht         gebaut, TTFB gemessen
    test-user     traegt den vollen Fall, je Tabelle gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
