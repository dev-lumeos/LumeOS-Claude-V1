---
nr: G-342
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-02
braucht: []
kind_von: G-339
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/modale.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-342 — `nutsettings` hat keinen Aufrufer

## Befund

Aus G-339, Claude Code, 2026-09-02.

`[cmd]` **`nutsettings` hat keinen Aufrufer.** `[cmd]` **Der
`meal_schedule`-Block darin ist toter Code.**

`[read]` **Und er ist seit E-58 ueberholt:** **die Mahlzeitenstruktur
liegt in `meal_slots`, nicht in einem Einstellungsblock.**

## Zu entscheiden

`[read]` **Loeschen oder anschliessen?**

`[cmd]` **G-332 hat die Slotliste in Preferences gebaut, G-335 hat
sie in Settings angeschlossen** — **der Ort existiert.**

`[read]` **Ein zweiter Block waere ein zweiter Schreibweg** — **genau
das, was G-72 vermieden hat.**

`[read]` **A-59: geloescht, nicht auskommentiert.**

## Auftrag — toter Code und zwei Reste

**Mitbeauftragt: G-333, G-337.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-342 — `nutsettings` loeschen

`[cmd]` **Kein Aufrufer.** `[cmd]` **Der `meal_schedule`-Block ist
seit E-58 ueberholt** — **die Mahlzeitenstruktur liegt in
`meal_slots`.**

`[cmd]` **G-332 hat die Slotliste in Preferences gebaut, G-335 hat
sie in Settings angeschlossen** — **der Ort existiert.**

`[read]` **A-59: geloescht, nicht auskommentiert.**

### 2 · G-333 — `erfassen.tsx` loeschen

`[read]` **Deine Empfehlung, mit Begruendung:** *,,enthaelt nichts,
was anderswo fehlt, und ihr einziges Alleinstellungsmerkmal beruft
sich auf ein UNIQUE, das es nicht mehr gibt."*

`[cmd]` **477 Zeilen, kein Aufrufer, zuletzt 16.08.**

`[read]` **Toms Freigabe fuer `backup/` gilt nicht fuer Code** —
**aber A-59 ist eindeutig, und die Messung liegt vor.**

`[read]` **Loeschen.** `[cmd]` **Und ein Waechter, der es meldet,
falls die Datei je wiederkehrt.**

### 3 · G-337 — `strong_avoid` ohne Schreibweg

`[cmd]` **Der CHECK kennt sechs Werte, drei sind belegt.**
`[cmd]` **`strong_avoid` erzeugt niemand.**

`[cmd]` **Die mittlere Stufe wirkt in der Suche** —
`075_preference_search_application.sql:1053-1065` — **aber sie kommt
aus `intolerances`, nicht aus `strong_avoid`.**

`[read]` **Miss, ob ein Nutzer die Stufe je Lebensmittel braucht.**
`[read]` **Und wenn nicht: melde, dass der Wert aus dem CHECK
faellt** — **das ist Codex' Arbeit, nicht deine.**

`[read]` **Ein CHECK-Wert ohne Schreibweg ist dieselbe Klasse wie
eine Funktion ohne Aufrufer** — **beim naechsten Auftrag wird er fuer
gebaut gehalten.**

### Was nicht zu tun ist

**Kein Schreibweg fuer Quick-Add** — das ist G-340, Toms
Entscheidung.
**Nichts in `supabase/` aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    nutsettings     weg, Waechter meldet Wiederkehr
    erfassen.tsx    weg, 477 Zeilen, Gate gruen
    strong_avoid    braucht ein Nutzer die Stufe, begruendet
    Gate            15/15 nach dem Loeschen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
