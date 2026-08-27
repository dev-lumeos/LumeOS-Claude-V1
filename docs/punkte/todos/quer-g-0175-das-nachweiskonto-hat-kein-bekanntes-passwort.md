---
nr: G-175
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-157
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["tools/schuss.mjs"]
zahlen: null
---

# G-175 - Das Nachweiskonto hat kein bekanntes Passwort

## Befund

(neu
  2026-08-23). Aus G-157 und G-163.

  `[cmd]` **Zwei Agenten haben am 2026-08-23 am selben
  Passwort-Hash gedreht.** Fable brauchte fuer `tools/schuss.mjs` einen
  Kopierschritt (gesichert, gesetzt, zurueckgesetzt, Sicherung
  geloescht); Claude Code konnte sich in derselben Zeitspanne nicht
  anmelden — `updated_at` **2026-08-23 09:42**.

  `[cmd]` **Das dokumentierte Passwort `LumeosTestUser2026` passt
  nicht mehr.** Betroffen sind die Nachweisskripte `_g154`, `_g166`,
  `_g167` — **die laufen so nicht.**

  `[read]` **Der Fehler ist nicht der Kopierschritt, sondern dass es
  ihn braucht.** Solange jeder Agent sich sein Konto selbst
  zurechtbiegt, ist der naechste Zusammenstoss eine Frage der Zeit —
  und er faellt erst auf, wenn ein Nachweis daran scheitert.

  **Zu tun:** ein bekanntes, festes Passwort fuer
  `test-user@lumeos.local` in `LUMEOS_WORT`, und die drei Skripte
  darauf umstellen. Danach faellt der Kopierschritt weg.
