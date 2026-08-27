---
nr: C-312
typ: befund
modul: medical
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

# C-312 - Barcode einlesen — was jetzt schon ins Schema gehoert

## Befund

(neu 2026-08-27). Aus Toms Hinweis.

  `[read]` **Noch kein Auftrag, aber zwei Regeln, die spaeter teuer
  werden**, wenn sie fehlen:

  **Fuehrende Nullen gehoeren zur PZN — sie muss als Text gespeichert
  werden, nie als Zahl.**

  **Eine geloeschte PZN wird nie neu vergeben, veraltet in Systemen
  aber ohne harten Fehler.** `[read]` **Das ist der gefaehrliche
  Teil:** ein gescannter alter Karton liefert einen Treffer, der nicht
  mehr gilt. **Ohne Gueltigkeitsdatum je PZN zeigt die Anwendung
  stillschweigend Veraltetes** — dieselbe Klasse wie `b?.abbr ?? m`.

  `[cmd]` **Die PZN vergibt die IFA GmbH, nicht eine
  Zulassungsbehoerde** — eine PZN belegt keine Zulassung. **Die
  Zuordnung PZN zu Produkt ist kommerziell**, der ABDA-Artikelstamm
  wird 14-taegig gepflegt.

  `[read]` **Erst wenn C-308 eine Quelle hat, wird das ein Auftrag.**
