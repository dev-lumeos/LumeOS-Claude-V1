---
nr: G-218
typ: messung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-331
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/regeln-read.ts
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen: null
---

# G-218 — kommt die `critical`-Warnung auf den Bildschirm?

## Befund

`[cmd]` **Aus C-331, 2026-08-28:** `wr_drug_serotonergic_combo`
liefert live `fulfilled`, `critical`, `physician_referral` — **zum
ersten Mal, seit es die Regel gibt.**

`[cmd]` **Geprueft sind drei Stationen** — Erfassung ueber
`user_medications`, `rule_assessment`, Rueckgabe. `[read]`
**Leseweg und Anzeige nicht** — `apps/` gehoerte nicht zu C-331, und
Codex hat die Grenze benannt statt sie zu ueberschreiten.

`[read]` **Der Durchstich aus G-215 lief ueber `wr_anticoag_stack`**
— eine Regel mit `severity: high`, die `drug_class` liest.
**`critical` ist noch nie auf einem Bildschirm erschienen.**

## Was zu pruefen ist

**Dieselbe Lage wie in C-331 herstellen, ueber die Oberflaeche**, und
die zwei fehlenden Stationen nachmessen.

`[read]` **Und die Frage, die dabei zum ersten Mal auftaucht:
unterscheidet die Anzeige `critical` von `high`?** `[cmd]` Bis heute
gab es keine `critical`-Meldung — **die Unterscheidung ist nie
sichtbar geworden, also auch nie geprueft.**

`[read]` **`physician_referral` ist der andere Teil.** Eine Regel, die
zum Arzt schickt, muss anders aussehen als eine, die ein
Einnahmefenster verschiebt. **Wenn beide gleich aussehen, ist die
Schwere im Datenbestand und nicht auf dem Bildschirm.**

## Gegenprobe

**Die ausloesende Erfassung entfernen — die Warnung muss
verschwinden.** `[cmd]` In G-215 hat das getragen (4 → 0 aktive
Medikamente, `fulfilled` → `not_fulfilled`). **Fuer `critical` ist es
nicht geprueft.**
