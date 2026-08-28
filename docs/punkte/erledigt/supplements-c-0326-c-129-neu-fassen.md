---
nr: C-326
typ: messung
modul: supplements
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-208
entscheidung: null
beruehrt:
  dateien:
    - docs/punkte/todos/supplements-c-0129-der-kimi-bestand-brauchbar-aber-nicht-importierbar.md
    - docs/punkte/erledigt/supplements-c-0208-c-129-neu-fassen-der-import-ist-laengst-passiert.md
zahlen: null
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
---

# C-326 — C-129 auf die verbleibende Luecke neu fassen

## Befund

`[read]` **C-129 beschreibt einen Import, der stattgefunden hat.**
Der Punkt traegt Ueberschrift und Zahlen vom 19.08. — als der
Kimi-Bestand noch nicht importiert war.

`[read]` **C-208 verlangte genau das: den Punkt auf die verbleibende
Luecke richten.** `[cmd]` A-57 hat gemessen, dass diese Neufassung nie
erfolgt ist — **und dass ich C-208 am 27.08. per Textheuristik als
erledigt geschlossen hatte.**

`[cmd]` **C-325 hat die Restluecken bereits benannt:** Regeln ohne
volle Eingabedeckung, CAS aus `crawl_027`, fehlende Report-Aliase,
leere PK- und Renal-Hepatic-Tabellen, Produktverpackung, DE bei den
Produkten.

`[read]` **Was fehlt, ist nicht eine weitere Messung, sondern die
Trennung:** was von C-129 ist erledigt, was ist offen, und was gehoert
in eigene Punkte, weil es fachlich nichts miteinander zu tun hat.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` **Seit 2026-08-27 traegt ein
Auftrag keine Zahlen mehr vom Orchestrator** (`CLAUDE.md`, *,,Der
Orchestrator zaehlt nicht"*). **Miss selbst und nenn die Abgrenzung
mit** — bei den Regelzahlen hat mich genau die dreimal aufs Glatteis
gefuehrt.

### Zu tun

**C-129 neu fassen: Titel, Befund und Zahlen auf den heutigen
Stand.** `[read]` **Der Import gehoert nicht mehr als offene Arbeit
beschrieben.**

**Was uebrig bleibt, in eigene Punkte trennen** — je Luecke einer,
mit eigener Messung und `zahlen.gemessen`. `[read]` **Eine
Deckungsluecke bei Regeln und eine fehlende Produktverpackung sind
zwei verschiedene Arbeiten; sie in einem Punkt zu fuehren heisst,
keine von beiden anfangen zu koennen.**

**Und die Regelzahlen aus C-129 gegen heute halten.** `[cmd]` Der
Punkt behauptet, alle 20 Medikamentenregeln seien durch ein fehlendes
`medical.medications` blockiert. `[cmd]` **Diese Tabelle gibt es
nicht, und es gab sie nie** — der Bestand heisst
`medical.medication_active_substances`. `[read]` **Miss, was heute
tatsaechlich blockiert** — C-313 hat gezeigt, dass Regeln aus einem
ganz anderen Grund nicht feuern.

**Danach C-208 schliessen**, wenn die Neufassung steht — **oder
sagen, warum nicht.**

### Was nicht zu tun ist

**Nichts importieren, nichts reparieren.**
**Keinen Punkt streichen** — auch C-129 nicht; er wird neu gefasst,
nicht geloescht.
**`docs/spezifikation/pruefung-kimi-bestand.md` nicht aendern** — es
ist die Quelle des urspruenglichen Befunds und bleibt als Spur.
`apps/` nicht anfassen — Claude Code arbeitet dort an A-58.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    C-129 neu gefasst           Titel und Zahlen, mit `zahlen.gemessen`
    neue Punkte                 Zahl, je mit eigener Messung
    was blockiert heute         gemessen, nicht aus C-129 uebernommen
    `medical.medications`       existiert nicht - belegt
    C-208                       geschlossen oder begruendet offen
    Waechter                    gruen, Sollstand genannt

`[read]` **Die dritte Zeile ist die wichtige.** `[read]` **Ein Punkt,
der seit dem 19.08. eine Blockade behauptet, hat sie seither nie
nachgemessen** — und C-313 hat gezeigt, dass 25 Regeln aus einem
Grund nicht feuern, den niemand vermutet hatte.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung.**
**Nach jeder Aenderung `node tools/punkte-index.mjs --schreiben`.**
`[cmd]` **Der Waechter ist derzeit rot bei neuen Kindpunkten** —
A-58 laeuft dazu. **Wenn er dich blockiert: melden, nicht umgehen.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Stand: 2026-08-28.** C-129 wurde von einem historischen Importblocker
zu einem nachgemessenen Herkunftsbefund umgeschrieben. Titel,
Frontmatter, beruehrte Tabellen und `zahlen.gemessen` sind aktualisiert.
Die historische Importarbeit ist nicht mehr als offen beschrieben.

### Eigene Messung und Abgrenzung

`[cmd]` **Bestand:** 596 Supplements, 412 sichtbar, 498
`medical.medication_active_substances`, 453 Formulierungen und 448
Produkte. `medical.medications` hat in `information_schema` **0**
Treffer; `medical.user_medications` und `medical.user_conditions`
haben je 2 Zeilen.

`[cmd]` **Statisch:** Alle 64 Katalogregeln, gruppiert nach
`input_coverage_status`, ergeben 44 `auswertbar`, 14 `blockiert` und 6
`teilweise`. Das misst die Katalogdeklaration, nicht einen Nutzerlauf.

`[cmd]` **Zur Laufzeit:** `rule_assessment` fuer `dev@lumeos.app` am
2026-08-28 liefert bei den 20 Medikamentenregeln 1 `missing_input`, 7
`unsupported_operator` und 12 `not_fulfilled`. Somit sind **8/20**
nicht auswertbar, nicht 20 wegen einer nie existierenden Tabelle; die
anderen **12/20** wurden ausgewertet und treffen nicht zu.

`[cmd]` Der einzelne fehlende Input ist
`wr_drug_chelation_timing` mit
`supplements.substance_group_membership`. Die sieben unbekannten
Operatoren sind bereits der Gegenstand von C-313.

### Getrennte Restarbeit

`[cmd]` **1 neuer Punkt:**
`medical-c-0327-chelation-rule-fehlt-gruppenmitgliedschaft.md` fuer
die eine fehlende Gruppenmitgliedschaft. Er hat eigene Messzahlen und
`zahlen.gemessen: 2026-08-28`.

`[read]` Die anderen Restluecken wurden nicht dupliziert: C-313
(Operatoren), C-260 (Arbeitsberichtswerte und Aliase), C-262 (PK,
Renal-Hepatic und Wellen), C-202 (Verpackung/Kennungen), C-308 (DE-Markt)
und C-285 (geschuetzte Medikamentenerfassung) sind jeweils bereits
eigene Punkte. C-129 verweist nur noch auf sie.

### C-208

Die verlangte Neufassung steht. C-208 kann fachlich abgenommen werden,
wird aber **nicht durch mich geschlossen oder verschoben**: Nach
`docs/punkte/00-LIESMICH.md` verschiebt und schliesst nur der
Orchestrator nach der Abnahme. Das ist kein Umgehungsversuch; die
Punktdatei bleibt bis dahin unveraendert in `todos/`.

`[cmd]` Nach jeder Aenderung lief
`node tools/punkte-index.mjs --schreiben`. Der Punkte-Waechter ist aktuell gruen: 25 `kind_von`-Befunde bei
Sollstand 25. Die Auftragsannahme eines roten Laufes trifft daher nicht
mehr zu; es wurde nichts am Waechter umgangen oder angepasst.


## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Alle drei Zahlen bestaetigt:**

    medication-Regeln im Katalog        20
    davon not_fulfilled                 12
    davon unsupported_operator           7
    davon missing_input                  1
    medical.medications                  existiert nicht (0 Treffer)

`[read]` **Damit ist die Blockade aus C-129 vom 19.08. widerlegt.**
Der Punkt behauptete neun Tage lang, alle 20 Regeln seien durch eine
fehlende Tabelle blockiert. **Sie fehlt nicht — sie hat nie
existiert**, der Bestand liegt in
`medical.medication_active_substances`. **Blockiert sind heute 8, aus
zwei verschiedenen Gruenden.**

### Die Trennung ist die wichtigere Haelfte

`[read]` **,,Statische Regeldeckung gegen Laufzeit-Ergebnis"** —
C-129 sagte *,,0 von 20 laufen"*. `[cmd]` Heute laufen **12 durch und
treffen nicht zu.** **Das ist ein Ergebnis, keine Blockade.**

`[read]` **Wer beides in einer Zahl fuehrt, kann nicht sagen, ob eine
Regel schweigt oder nichts zu sagen hat.**

`[cmd]` **Im Gesamtbild, 64 Regeln:** 37 `not_fulfilled`, **25
`unsupported_operator`** (das ist C-313, Weg 2 steht aus), 1
`missing_input`, **1 `fulfilled`**.

`[read]` **Dass genau eine Regel zutrifft**, ist auf `dev` mit 360
Einnahmen und 2 Medikamenten plausibel — **aber es ist eine Zahl, die
im Blick bleiben sollte.**

`[cmd]` **C-327 angelegt** fuer `wr_drug_chelation_timing`, den einen
`missing_input`.

`[read]` **Und C-208 wurde nicht selbst geschlossen, obwohl fachlich
erfuellt** — richtig nach dem Modell. **Das Verschieben gehoert dem
Orchestrator.**

**Abgenommen.**

