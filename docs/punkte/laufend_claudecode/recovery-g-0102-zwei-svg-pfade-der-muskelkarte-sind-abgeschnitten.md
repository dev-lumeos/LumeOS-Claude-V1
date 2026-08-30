---
nr: G-102
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-100
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: ["packages/ui/src/koerperkarte-pfade.ts"]
zahlen: null
---

# G-102 - Zwei SVG-Pfade der Muskelkarte sind abgeschnitten

## Befund

(neu 2026-08-20, aus G-100). **`packages/ui`.**

  `[cmd]` **Zwei Konsolenfehler auf jeder Recovery-Seite:**
  `<path> attribute d: Expected number`.

  `[cmd]` **Kein Encoding-Problem**, obwohl die Meldung so aussieht:
  `packages/ui/src/koerperkarte-pfade.ts` enthaelt **0 Ersatzzeichen
  (U+FFFD)** — das `?` in der Konsole ist die Konsole.

  `[cmd]` **Es sind abgeschnittene Pfaddaten.** Ein `C` braucht sechs
  Zahlen:

  ```
  … C 89.50 823.53 109.24 767.88 A 0.37 …   ← vier, dann folgt A
  … C 1039.32 221.19 C 1041.33 230.61 …     ← zwei, dann folgt C
  ```

  `[cmd]` **Unveraendert seit `3dae1a2`** — die Daten kamen so ins
  Repo. Die Karte zeichnet; nur diese zwei Teilstuecke fehlen.

  `[read]` In G-100 nicht behoben, weil `packages/ui` dort gesperrt
  war.

## Auftrag

**Mitbeauftragt mit G-281 am 2026-08-30.** Bericht in die
G-281-Datei. **Dazu: A-50, C-356.**

**Beauftragt am 2026-08-30.**

### G-102 — zwei SVG-Pfade sind abgeschnitten

`[cmd]` **Bei SVG entscheidet der Browser, nicht die Konsole**
(CLAUDE.md). `[cmd]` **`tools/schuss.mjs` liefert Bildschirmfotos** —
**der Nachweis ist ein Bild, kein Pfaddatum.**

`[cmd]` **Und `tools/svgpfade-pruefen.mjs` steht im Gate** — **miss,
warum er die zwei nicht faengt.** `[read]` **Ein Waechter, der einen
bekannten Fall durchlaesst, hat eine Luecke, die andere Faelle auch
durchlaesst.**

### A-50 — ein `DROP COLUMN` prueft die Lesepfade nicht

`[cmd]` **Der Fall ist gemessen: `acwr_used` fiel in C-215, und
`scores-read.ts` trug den falschen Verweis bis heute** (G-173).

`[read]` **Die Frage ist, ob ein Waechter das faengt** — **eine
Spalte faellt in der Kette, und ein Leseweg zeigt weiter auf sie.**

`[cmd]` **`tools/abwesenheit-pruefen.mjs` prueft die Gegenrichtung:
eine Aussage ueber etwas Fehlendes, das wieder da ist.** `[read]`
**Hier ist es umgekehrt: etwas war da und ist weg.**

### C-356 — woraus die 1.620 ms bestehen

`[cmd]` **Du hast die Ursache gefunden: die Sparkline, 90 Punkte je
Pfad statt einem, 164 auf 700 kB.** `[read]` **Offen ist die
Aufteilung zwischen Serverrendering und Uebertragung.**

`[read]` **`schwere: niedrig`** — **nur messen, wenn die zwei anderen
schnell gehen.**

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` schreiben.**
**Kein Schema aendern.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    SVG                   Bildschirmfoto vorher / nachher
    svgpfade-Waechter     warum faengt er sie nicht
    DROP COLUMN           faengt ein Waechter es? gebaut oder
                          begruendet nicht
    1.620 ms              aufgeteilt oder als unklar gemeldet
