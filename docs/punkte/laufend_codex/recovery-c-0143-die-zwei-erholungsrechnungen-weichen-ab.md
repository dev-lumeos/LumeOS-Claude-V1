---
nr: C-143
typ: messung
modul: recovery
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-82
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/lib/recovery/score.ts", "apps/web/src/app/v2/recovery/tab-checkin.tsx"]
zahlen: null
---

# C-143 - Die zwei Erholungsrechnungen weichen ab

## Befund

(neu
  2026-08-19). **Befund aus G-82, gemessen ueber fuenf Tage.**

  | Tag | Tabelle | `score.ts` | Diff |
  |---|---|---|---|
  | 2026-06-05 | **43,0** | 36 | **−7,0** |
  | 2026-07-15 | 83,8 | 83 | −0,8 |
  | 2026-09-01 / 10-20 / 11-06 | **79,4** | 82 | **+2,6** |

  `[cmd]` **C-125s Referenztag stimmt (43,0), G-76s nicht:** *„Die
  Tabelle sagt 79,4, nicht 82. **Die 82 war nie gespeichert**, sondern
  das, was die Browserrechnung an dem Tag ergab."*

  ### Die Ursache sind nicht die Gewichte

  `[read]` *„Der Kern ist identisch — der Unterschied ist, **wie viele
  Anteile zaehlen**: `score.ts` rechnet fuenf von sieben (Basis 75), die
  Tabelle alle sieben mit Rueckfallwerten (Basis 100)."*

  `[cmd]` **Die Tabelle ist die bessere Zahl:** *„Sie nutzt den
  gemessenen ACWR auf **118 von 170 Tagen**, die `score.ts`
  wegwirft."*

  ### Und die Anzeige liest jetzt die Tabelle

  `[cmd]` **`score.ts` bleibt** — aber der Auftrag ging von einer
  falschen Annahme aus: *„Die Live-Vorschau benutzte sie nie."*

  `[cmd]` **`tab-checkin.tsx` rechnete mit der Entwurfsformel** — eigene
  Gewichte, **HRV aus der Attrappe, `0.88 * 10` als erfundene
  Ernaehrung**, `readinessFor` als Urteilssprache.

  `[read]` **Nach dem Umbau haette `score.ts` null Aufrufer gehabt** —
  derselbe Fall wie `InjektionsKarte` (G-53). **Jetzt an die Vorschau
  gebunden, mit genannter Basis** und dem Hinweis, dass sie bewusst
  nicht die gespeicherte Zahl ist.

  **Offen:** `[read]` Ob die Vorschau ueberhaupt eine zweite Zahl zeigen
  soll, oder ob sie nach dem Speichern die gespeicherte nachreicht.

## Auftrag — die Recovery-Rechenwerke, fuenf Punkte

**Mitbeauftragt: C-166, C-168, C-181, C-127.** Bericht in diese
Datei, die anderen tragen einen Verweis.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Regel seit 2026-08-28** — am selben Tag sind sechs
Auftragspraemissen gefallen, weil ich gemessen und dann etwas anderes
behauptet habe. **Alles unten ist die Frage, nicht die Antwort.**

`[cmd]` **Und der gebaute `/v2/`-Stand ist der Massstab, nicht der
Entwurf.** `theme-v1` nur nachschlagen, wenn etwas fehlt und die
Frage ist, wie es gemeint war. **Der Baum ohne `/v2/` bleibt
unberuehrt.**

`[cmd]` **Die Seed-Daten reichen bis November 2026** — eine offene
Datumsgrenze wie `> current_date - 14` faengt alles Zukuenftige mit.
**Das hat Claude Code heute fast einen Fehlbefund gekostet.**

### Der Kern: C-143

`[read]` **Zwei Erholungsrechnungen weichen voneinander ab.**
`[read]` **Das ist der Punkt, an dem die anderen vier haengen** —
solange zwei Wege verschiedene Zahlen liefern, ist jede Schwelle
darauf gebaut.

**Miss zuerst, welche beiden es sind und wo sie sich trennen.**

### C-166 und C-168 — die Konstanten im Entwurf

`[read]` **`module-recovery-engine.jsx` traegt `MODALITY_BONUS` fuer
elf Modalitaeten, `OVERTRAINING_SIGNALS` mit vier Schwellen,
`ACWR_DATA` und `HRV_BASELINE`.**

`[read]` **Und mehrere Punkte fuehren dieselben Werte als
*unbelegt*.** `[cmd]` **E-06 und E-09 halten fest, dass Tom
*,,Recherchieren statt setzen"* entschieden hat.**

**Die Frage ist, ob die Werte im Entwurf belegt sind oder selbst
gesetzt.** `[read]` **Wenn belegt: die Quelle uebernehmen. Wenn
gesetzt: der Entwurf ist kein Beleg** — dieselbe Regel wie bei den
Umrechnungsfaktoren in C-149 und den Tag-Schwellen in G-221.

### C-181 — ACWR

`[read]` **Der Punkt sagt, es wird gerechnet und muss raus.** `[read]`
**Pruef beides:** wird es heute gerechnet, und stimmt der Grund fuer
das Entfernen noch?

### C-127 — die drei leeren Wearable-Spalten

`[read]` **Leer heisst nicht ueberfluessig.** `[read]` **Miss, ob
etwas hineinschreiben koennte** — und wenn nicht, ob die Spalte auf
eine geplante Quelle wartet oder auf nichts.

### Was nicht zu tun ist

**Keine Schwelle setzen.** `[read]` **Was nicht belegt ist, wird
gemeldet — das ist eine Entscheidung fuer Tom, keine Recherche.**
**Keine Rechnung angleichen, bevor klar ist, welche richtig ist.**
`apps/` nicht anfassen — Claude Code arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil        erledigt / gebaut / offen / ueberholt
    die zwei Rechnungen        wo trennen sie sich, mit Zahlen
    Konstanten im Entwurf      belegt oder gesetzt, je einzeln
    ACWR                       wird es gerechnet? wo?
    leere Spalten              wartet etwas darauf?

`[read]` **Und wenn sich zeigt, dass die Punkte einander
widersprechen: sagen, nicht aufloesen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
`[cmd]` **`.limit()` hebt den PostgREST-Deckel nicht auf.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
