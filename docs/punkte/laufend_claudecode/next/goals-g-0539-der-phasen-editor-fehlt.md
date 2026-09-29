---
nr: G-539
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-09-29

braucht: [G-536, G-538]
kind_von: G-534

quellen:
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - apps/web/src/app/v2/goals/phase-echt.tsx
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx

zahlen:
  gemessen: 2026-09-29
  reiter_im_entwurf: 12
  reiter_gebaut: 0
  zeilen_entwurf: 569
---

# Der Phasen-Editor fehlt — „editieren" aus Toms Satz

**Tom, 2026-09-29, 11:56:** *„subnav phase engine: user kann seine goals
planen, terminieren, **editieren**."*

`[cmd]` `module-goals-editor.jsx` ist 569 Zeilen und war bis heute
ungelesen. **Claude Code meldet in G-534 „der komplette elfstufige
Editor" als ohne Quelle — die Quelle ist diese Datei.**

## Was der Editor ist

`[read]` Zeile 56: *„Personal override — the shipped defaults stay
intact"*. Der Editor aendert **nicht** den Katalog (G-536), sondern legt
eine persoenliche Abweichung darueber. Der Fuss hat zwei Knoepfe:
*„Save as my template"* und *„Apply to my plan"*.

Das ist die Ebene, die `goal_phases.parameters` traegt.

## Zwoelf Reiter, aber je Strategie nur die passenden

`[read]` `PE_MODES`, Zeile 3-11 — das ist keine Fallunterscheidung im
Browser, das ist eine Eigenschaft der Strategie und gehoert an den
Katalogeintrag (G-536, Nachtrag):

| Strategie | Reiter |
|---|---|
| `fat_loss` | variants · guards · duration |
| `lean_bulk` | params · guards · duration |
| `maintenance` | params |
| `recomp` | params · cycling |
| `contest_prep` | subphases · refeeds · peakweek · guards · anchor |
| `reverse_diet` | params · exits · guards |
| `expert_bb_annual` | annual · anchor · overrides |

Die zwoelf Reiter im Einzelnen, mit ihrer Fundstelle:

| Reiter | Zeile | Was er tut |
|---|---|---|
| variants | 110 | je Variante Defizit, Protein, Hoechstdauer, Rate, Diaetpause |
| params | 138 | flache Werte, Bereich oder Einzelwert |
| cycling | 152 | Trainings-/Ruhetag-Delta, **rechnet den Wochenmittelwert** |
| duration | 172 | Hoechstdauer, Mindestdauer, Auto-Uebergang, Diaetpausen |
| subphases | 200 | Tabelle: Stage, Wochen bis Show, Defizit, Cardio |
| refeeds | 246 | Startwoche, Haeufigkeit, Carb-Faktor, Wochentage |
| peakweek | 272 | Entleerung/Ladung in Tagen und g/kg, fuenf Protokolle |
| anchor | 296 | **Showdatum → alles rueckwaerts** |
| annual | 330 | Monatsbalken, Summe muss 12 ergeben |
| overrides | 400 | je Block im Jahreszyklus eigene Werte |
| guards | 432 | je Waechter Schalter **und Schwellwert-Schieber** |
| exits | 470 | Ausstiegsbedingungen, OR-verknuepft |

## Was das an Fachlogik verlangt

Drei Reiter rechnen, sie zeigen nicht nur:

- **cycling**: `(5 × 200 + 2 × -300) / 7` → Wochenmittel, dazu
  `TDEE + Mittel` als effektives Tagesziel
- **anchor**: Showdatum minus Wochen → sechs Datumsangaben
- **annual**: Monatssumme muss 12 sein, sonst ist der Plan kaputt

Die gehoeren server-frei in `lib/goals/`, nicht in die Komponente — wie
`ziel-regeln.ts`, damit beide Seiten dieselbe Rechnung nutzen.

## Was zu tun ist

1. Der Editor liest seine Ausgangswerte aus `goal_strategies` (G-536) und
   schreibt **nur die Abweichung** nach `goal_phases.parameters` — nicht
   den ganzen Satz. Sonst ist ein spaeter geaenderter Katalogwert bei
   jedem Nutzer eingefroren.
2. Welche Reiter erscheinen, entscheidet `PE_MODES` **aus der Tabelle**,
   nicht eine Liste im Browser.
3. Die drei Rechnungen server-frei nach `lib/goals/`, je eine
   Zusicherung mit einer Zahl, die von Hand nachrechenbar ist.
4. „Save as my template" braucht G-540 und bleibt bis dahin aus — **kein
   Knopf, der nichts tut**. „Apply to my plan" reicht fuer den Anfang.
5. Der `guards`-Reiter zieht die Schwellwerte aus den Waechtern, die
   G-520 gebaut hat. Wenn dort kein Schwellwert konfigurierbar ist, ist
   das ein Befund und kein Grund fuer einen Schieber ohne Wirkung.

## Grenze

Nach G-538. Der Editor verschiebt Zeitfenster; solange eine Phase an
keinem Ziel haengt, verschiebt er nichts Bestimmtes.

---

## Auftrag, vorbereitet 2026-09-29 16:20

Die fuenf Punkte oben. Dazu, was sich seit dem Anlegen geklaert hat:

**`PE_MODES` steht als Spalte im Katalog.** `[cmd]` `editor_modes` ist die
einzige der zehn Spalten, die in **allen 17** Zeilen gefuellt ist. Welche
Reiter erscheinen, kommt aus der Tabelle — keine Fallunterscheidung im
Browser, kein `switch` ueber Strategiecodes.

**Die Ausgangswerte sind duenn, und das entscheidet den Bau.** `[cmd]` Von
zehn Spalten sind sechs in genau einer der 17 Zeilen gefuellt (G-545 holt
das nach). Ein Editor, der ein leeres Feld als `0` anzeigt, schreibt beim
Speichern eine erfundene Null in den Override. **Leer muss leer bleiben,
bis der Nutzer etwas eintraegt** — und ein Feld ohne Katalogwert sagt, dass
es keinen gibt, statt einen zu behaupten.

**Der Override ist eine Differenz, kein Abzug.** `goal_phases.parameters`
traegt **nur die geaenderten** Werte. Wer den ganzen Satz hineinschreibt,
friert den Katalogstand von heute bei jedem Nutzer ein — und eine spaetere
Korrektur am Katalog erreicht keinen mehr.

**Die drei Rechnungen server-frei nach `lib/goals/`:**

    cycling   (5 × 200 + 2 × -300) / 7  ->  Wochenmittel, dann TDEE + Mittel
    anchor    Showdatum minus Wochen    ->  sechs Datumsangaben
    annual    Monatssumme muss 12 sein  ->  sonst ist der Plan kaputt

`[read]` **`anchor` wird von G-544 auch gebraucht** — dieselbe Rechnung,
zwei Aufrufer. Wenn G-544 sie gebaut hat, wird sie hier **benutzt**, nicht
nachgebaut. Zwei Rechnungen fuer dasselbe gehen auseinander.

**Reihenfolge:** nach G-544 (die Zeitachse, in Arbeit) und G-545 (die
Katalogwerte, bei Codex vorbereitet). Vorher editiert der Editor leere
Felder an einer Phase ohne Zeitfenster.

`[read]` **„Save as my template" bleibt aus** — G-540 ist nicht
entschieden, und drei Fragen liegen bei Tom. **Kein Knopf, der nichts
tut**; „Apply to my plan" reicht.
