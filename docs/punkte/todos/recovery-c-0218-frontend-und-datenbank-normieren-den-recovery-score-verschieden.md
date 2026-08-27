---
nr: C-218
typ: entscheidung
modul: recovery
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: C-181
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/lib/recovery/score.ts", "tools/_modul-bestand.py", "tools/_g155-bestand.mjs", "backup/modul-bestand.json", "backup/bestand/aufnahme.json"]
zahlen: null
---

# C-218 - Frontend und Datenbank normieren den Recovery-Score verschieden

## Befund

(neu 2026-08-22). Aus C-181 und C-215.

  `[cmd]` **Fable rechnet `subtotal/85 × 100`** (C-181), damit die
  Readiness-Schwellen 90/80/70/60/40 ihre Skala behalten.
  `[cmd]` **Codex laesst den Term ersatzlos wegfallen** (C-215):
  `manual_v2_c215`, `training_load_points` 0,00.

  `[cmd]` **Live vorher 79,4 mit `training_load_points` 10,50. Nach der
  Kette 68,9.** Ein Szenariotag faellt auf 35,3.

  `[cmd]` **`GEWICHTE.trainingslast: 15` steht weiter in `score.ts`** —
  mit `roh: 'entfaellt — C-181, ACWR ohne Beleg'`, aber das Gewicht ist
  da.

  `[read]` **Beide Wege sind fuer sich begruendet, zusammen ergeben sie
  zwei Skalen.** Zu entscheiden: normiert wird auf 100, oder die Skala
  faellt auf 85 und die Schwellen wandern mit. **Nicht beides.**

  `[read]` Und der Nutzer sieht eine Verschlechterung um zehn Punkte.
  Das ist die richtige Zahl — aber sie gehoert erklaert, nicht
  kommentarlos angezeigt.

---

## M — Die Module sagen die Unwahrheit ueber sich selbst

`[cmd]` **Aufgenommen am 2026-08-22** (C-217 Code, G-155 Bild).
Werkzeuge: `tools/_modul-bestand.py`, `tools/_g155-bestand.mjs`.
Maschinenlesbar: `backup/modul-bestand.json`, `backup/bestand/aufnahme.json`
(128 Eintraege), 128 Bildschirmfotos.

`[cmd]` **Gegengeprueft: 25 von 25 Zeilenzahlen exakt.** Der Bestand
stimmt, die Oberflaeche nicht.

`[read]` **Der Befund in einem Satz:** Sieben Module tragen einen
Pauschalbanner *„das Schema gibt es noch nicht"*. **Bei sechs ist er
falsch.** Und der groesste Posten ist nicht fehlendes Schema, sondern
**Daten liegen und werden nicht gelesen**.

`[cmd]` **Gesamtlage, Marken gegen Kacheln:**

| Modul | Marken | Kacheln | Schema | Zeilen | Lage |
|---|---:|---:|---|---:|---|
| supplements | 59 | 79 | da | 3.852 | 16 markierte Rueckfaelle neben echten Fassungen |
| coach/ai | 46 | 36 | **fehlt** | 0 | der einzige Banner, der stimmt |
| training | 38 | 56 | da | 9.946 | Banner nennt Tabellennamen, die nie existierten |
| recovery | 36 | 40 | da | 858 | Banner behauptet das Gegenteil der Datenbank |
| coach | 33 | 36 | da | 63 | Daten vollstaendig, Oberflaeche liest an einer Stelle |
| nutrition | 25 | 55 | da | 990.000+ | am weitesten echt; Plans-Tab Attrappe trotz Daten |
| goals | 23 | 71 | da | 450 | echt und Attrappen-Doppel je Tab |
| medical | 18 | 44 | da | 14.340 | Banner falsch, Detail-Banner praezise |
| dashboard | 12 | 8 | quer | — | haengt an den Quellmodulen |
| settings | 0 | 3 | — | 7 | echt |

### Die falschen Banner — eine Zeile je Modul

### Daten liegen, werden nicht gelesen — der groesste Posten

`[read]` Diese Punkte brauchen **kein Schema und keine Entscheidung**.
Die Tabellen sind da, gefuellt, und in denselben Modulen liest schon
etwas anderes daraus. **Das ist die billigste echte Arbeit im Repo.**
