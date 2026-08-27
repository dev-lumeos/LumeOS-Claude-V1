---
nr: C-295
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-295 - die Kette liest aus zwei Kimi-Pfaden

## Befund

(neu
  2026-08-27).

  `[cmd]` **Elf Kettenschritte lesen aus
  `backup/kimi-research/Kimi_Agent/...`, sieben aus
  `docs/kimi_research/...`.** Beide Verzeichnisse existieren, beide
  stehen in `.gitignore`.

  `[cmd]` **Gemessen:** 2.892 gemeinsame Dateien, davon drei
  verschieden — die Substanzdateien, im neuen Pfad groesser (das ist
  C-275). **1.831 Dateien gibt es nur im alten Pfad, alle unter
  `metadata/`**, also Crawl-Protokolle, keine Nutzdaten.

  `[read]` **Die Uebergabe nennt den alten Pfad „ueberholt".** Fuer
  die Nutzdaten stimmt das. **Fuer die Kette nicht** — wer das
  Verzeichnis loescht, bricht elf Schritte. **Kein untracked
  Verzeichnis wird dem Namen nach geloescht.**

  **Zu tun:** die elf Schritte auf den neuen Pfad umstellen, je Schritt
  mit gemessenem Vorher/Nachher der Zeilenzahl. **Nicht in einem
  Zug mit einem Import** — ein logischer Change.
