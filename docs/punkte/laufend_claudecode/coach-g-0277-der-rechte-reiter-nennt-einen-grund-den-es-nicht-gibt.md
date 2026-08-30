---
nr: G-277
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: A-62
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  dateien:
    - apps/web/src/app/v2/coach/tab-rechte.tsx
zahlen:
  gemessen: 2026-08-30
  coach_tabellen: 12
  gelesene_tabellen: 10
---

# G-277 — der Rechte-Reiter nennt einen Grund, den es nicht gibt

## Befund

Aus A-62, Claude Code, 2026-08-30.

`[cmd]` **`tab-rechte.tsx:66` sagt: *,,sechs Tabellen"* und *,,coach
ist nicht fuer PostgREST freigegeben"*.**

`[cmd]` **Es sind zwoelf Tabellen, und alle sieben Schemata stehen in
`config.toml` unter `schemas`.**

`[cmd]` **Und `rechte-read.ts:234` liest zehn `coach`-Tabellen, in
denen Zeilen stehen.**

`[read]` **Der Reiter zeigt einen Leerzustand und nennt dafuer einen
Grund, den es nicht gibt.**

## Warum es `hoch` ist

`[read]` **Das ist nicht nur ein falscher Kommentar.** **Die
Behauptung ist die genannte Begruendung fuer das, was der Nutzer
sieht** — **wer sie liest, haelt den Leerzustand fuer richtig.**

`[cmd]` **A-62 hat den Kommentar berichtigt.** `[read]` **Ob der
Reiter jetzt Daten zeigt, ist damit nicht gesagt** — **der Leseweg
existiert, die Anzeige ist ungeprueft.**

## Zu messen

**Was zeigt der Reiter heute, und was koennte er zeigen?**

`[cmd]` **`coach.relationships` traegt 6 Zeilen, `client_permissions`
und `client_autonomy` je 5.** `[cmd]` **`dev` hat einen Coach und
steht auf Autonomiestufe 3.**

`[read]` **Und E-29 gilt:** Modulzugriffe auf `coach` gehen ueber eine
Funktion. `[cmd]` **`coach.offene_aktionen()` und
`darf_nutrition_plan_aendern()` sind der gebaute Weg** — **ob der
Rechte-Reiter selbst unter diese Regel faellt, ist zu klaeren:** er
ist Teil des Coach-Moduls, nicht eines fremden.

## Auftrag — was der Rechte-Reiter zeigen kann

**Mitbeauftragt: G-278.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · G-277 — der Leerzustand mit falschem Grund

`[cmd]` **Du hast den Kommentar in A-62 berichtigt.** `[read]` **Ob
der Reiter jetzt Daten zeigt, ist damit nicht gesagt** — der Leseweg
existiert, **die Anzeige ist ungeprueft.**

`[cmd]` **`coach.relationships` traegt 6 Zeilen,
`client_permissions` und `client_autonomy` je 5.** `[cmd]` **`dev`
hat einen Coach und steht auf Stufe 3.**

`[read]` **Und eine Grenzfrage gehoert geklaert, bevor du baust:**
`[cmd]` **E-29 verlangt eine Funktion fuer Modulzugriffe auf
`coach`** — **aber der Rechte-Reiter ist Teil des Coach-Moduls, nicht
eines fremden.** `[read]` **Miss, ob die Regel hier ueberhaupt
greift.** **Wenn ja: melden, nicht umgehen.**

### 2 · G-278 — die restlichen 222

`[cmd]` **Drei Aussagen sind markiert, neun waren gekippt, 222 leben.**

`[read]` **Ein Durchgang durch alle 222 ist Fleissarbeit.** **Der
Mittelweg steht im Punkt:** nur die markieren, **die eine Anzeige
begruenden.**

`[read]` **Miss, wie viele das sind** — **und markiere die.** `[cmd]`
**Die tragende Stelle in G-277 war genau so eine:** eine Behauptung,
die erklaerte, warum ein Nutzer nichts sieht.

### Was nicht zu tun ist

**Kein Schema aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Rechte-Reiter heute      was zeigt er, Bildschirmfoto
    was er zeigen koennte    gemessen
    E-29                     greift die Regel hier? belegt
    begruendende Aussagen    Zahl, davon markiert
    Attrappen                vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
