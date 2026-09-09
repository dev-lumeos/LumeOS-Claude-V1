---
nr: G-386
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-385
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  sichernswert: 9
  bereits_falsch: 5
---

# G-386 — die SSOT in den Abwesenheitswaechter

## Befund

Aus G-385, Claude Code, 2026-09-08.

`[cmd]` **9 Aussagen sind richtig und sichernswert, 5 sind schon
falsch.**

`[cmd]` **Und der Waechter liest bereits Markdown** ?
`abwesenheit-pruefen.mjs:53`: `docs/spezifikation/**/*.md`.

`[cmd]` **`docs/ssot/` fehlt in der Liste** ? **eine Zeile, kein
Umbau.**

`[read]` **Und die Marken duerfen nicht ins Fliesstext-Beispiel** ?
**A4 hat gezeigt, dass der Waechter eine Marke im eigenen
Erklaerungstext findet und selbst faellt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · `docs/ssot/` in die Liste

`[cmd]` **Zeile 53 erweitern.**

`[read]` **Und miss, was danach geschieht** ? `[cmd]`
**`A-62`-Punktdateien tragen selbst Marken, und `docs/ssot/`
koennte ueberholte enthalten.**

`[read]` **Wenn der Lauf rot wird: das ist der Zweck, nicht der
Fehler.**

### 2 · Die neun Marken setzen

`[cmd]` **Deine Liste aus A3:** `hrv_readings`, `sleep_data`,
`user_symptoms`, `user_health_metrics`, `medical_alerts`,
`enhanced_substances`, `recovery_scores` **(die vier weiteren aus
96:27),** `training_load_logs`, `user_protocol_assignments`.

`[read]` **Diesmal darfst du sie schreiben** ? **aber nur die
Marken, nicht den Text drumherum.**

`[cmd]` **Die Form steht in `abwesenheit-pruefen.mjs:22`.**

`[read]` **Und melde je Marke, in welche Datei und Zeile sie
kam.**

### 3 · Die fuenf falschen Aussagen

`[cmd]` **Der Orchestrator hat vier davon am 08.09. berichtigt**
(G-383, G-384).

`[read]` **Miss, ob die fuenfte noch steht** ? **und ob die
Berichtigungen selbst Marken brauchen.**

`[read]` **Eine Berichtigung, die sagt *,,inzwischen existiert
X"*, ist selbst eine Aussage ueber den Bestand** ? **sie wird
falsch, wenn X wieder verschwindet.**

### Abnahmebedingungen

    A1  docs/ssot/ in der Liste. Der Lauf: rot oder gruen,
        mit Zahl.
    A2  neun Marken gesetzt, je Datei und Zeile.
    A3  Gegenprobe: eine Marke fuer eine EXISTIERENDE Tabelle
        -> rot. Zurueckgebaut.
    A4  keine Marke im Erklaerungstext des Waechters. Belegt.
    A5  die fuenfte Falschaussage: steht sie noch? Und
        brauchen die Berichtigungen Marken?

### Was nicht zu tun ist

**Nur Marken schreiben** ? **kein Fliesstext in `docs/ssot/`.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-436.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
