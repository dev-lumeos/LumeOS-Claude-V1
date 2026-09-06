---
nr: G-353
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-141
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-353 — Setup-Karten nach dem Onboarding

## Befund

Aus G-83, Claude Code, 2026-09-07, gemeldet damit es nicht
verlorengeht.

`[read]` **Der Onboarding-Entwurf ist dreistufig und
uebersprungbar** (G-222).

`[read]` **Wer ueberspringt, hat Vorgaben** — **aber keine
Einladung, sie zu ersetzen.**

`[cmd]` **G-141 beschreibt Karten, die nach dem Onboarding
erscheinen** — *,,leg deine Mahlzeiten fest"*, *,,waehle dein
Ziel"*.

`[read]` **Sie gehen verloren, wenn G-141 geschlossen wird** —
**deshalb ein eigener Punkt.**

## Was zu klaeren ist

`[read]` **Wann verschwindet eine Karte?** `[cmd]` **Wenn der
Nutzer die Sache erledigt** — **oder wenn er sie wegwischt?**

`[read]` **Und wie viele auf einmal:** **fuenf Karten sind ein
zweites Onboarding, das man nicht ueberspringen kann.**

`[read]` **Der Unterschied zum Onboarding ist die Freiwilligkeit** —
**eine Karte ist ein Angebot, ein Schritt ist ein Weg.**

## Auftrag — die vier fehlenden Schritte

**Mitbeauftragt: G-141, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-353 — die Setup-Karten

`[read]` **Du hast sie gemeldet, damit sie nicht verlorengehen** —
richtig.

`[read]` **Entwirf sie:** **wann erscheint eine, wann verschwindet
sie, wie viele auf einmal?**

`[read]` **Der Unterschied zum Onboarding ist die Freiwilligkeit** —
**eine Karte ist ein Angebot, ein Schritt ist ein Weg.**

`[cmd]` **Nicht bauen** — entwerfen.

### 2 · G-141 — was davon abgedeckt ist

`[cmd]` **Du hast gemessen: die drei Punkte sind Vorlage,
Entscheidung und Messung** — **keine Dubletten.**

`[read]` **Miss, was von G-141 nach G-353 uebrigbleibt** — **und
schliess ihn, wenn nichts.**

### 3 · Die vier fehlenden Schritte

`[cmd]` **Du hast sie benannt, und zwei blockieren wirklich.**

`[read]` **Schreib je Schritt auf, was ihn blockiert** — **und ob
die Blockade eine Entscheidung ist oder Arbeit.**

`[cmd]` **Bei den Zielen ist es eine Entscheidung** (G-352) — **vier
`goal_type`, fuenf `difficulty_level`, zwoelf im ADR.**

`[read]` **Mein Verdacht: es sind keine drei Skalen, sondern zwei
Ebenen.** `[cmd]` **`subtype` steht optional daneben** — **das
koennte der Ort fuer die zwoelf sein.** `[read]` **Miss es.**

### Was nicht zu tun ist

**Kein Onboarding bauen** — **die Entscheidung zu den Zielen fehlt.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Setup-Karten   entworfen, mit Verschwindregel
    G-141          was uebrigbleibt / geschlossen
    vier Schritte  je Blockade: Entscheidung oder Arbeit
    subtype        traegt es die zwoelf? gemessen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
