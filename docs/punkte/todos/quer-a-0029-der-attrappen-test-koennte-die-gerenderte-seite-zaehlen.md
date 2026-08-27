---
nr: A-29
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: A-28
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/components/shell/__tests__/v2-attrappen.test.ts", "tools/schuss.mjs"]
zahlen:
  gemessen: 2026-08-20
  sichtbare_marken: 6
  v2_attrappe_klassen: 10
---

# A-29 - Der Attrappen-Test koennte die gerenderte Seite zaehlen

## Befund

(neu 2026-08-20, aus A-28).

  `[cmd]` **Der Test liest Quelltext** (`v2-attrappen.test.ts` zaehlt
  `attrappe={ATTRAPPE}` je Datei). **A-24 haelt fest, dass Textmarken
  kein Mass sind** — und `tools/schuss.mjs` misst die gerenderte Seite
  in einem Aufruf.

  `[cmd]` **Die zwei Zaehlweisen gehen auseinander**, gemessen am
  2026-08-20 auf `/v2/nutrition?tab=plans`: **6 sichtbare Marken gegen
  10 `v2-attrappe`-Klassen** im HTML, weil die Klasse auch an
  Unterelementen haengt.

  `[read]` **Beide Zahlen sind richtig, sie messen Verschiedenes.**
  Wer umstellt, entscheidet damit auch, **welche der beiden die
  verbindliche ist** — und muss die Erwartungen aller Module neu setzen.

  `[cmd]` **Der Test braucht dann einen laufenden Dev-Server.** Heute
  laeuft er ohne. Das ist der eigentliche Preis, nicht der Umbau.
