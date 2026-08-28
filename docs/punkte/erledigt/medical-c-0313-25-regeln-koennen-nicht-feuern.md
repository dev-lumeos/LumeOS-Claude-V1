---
nr: C-313
typ: entscheidung
modul: medical
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: C-296
kinder: []
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 53560696
entscheidung: E-15
beruehrt:
  tabellen: [supplements.rule_catalog]
  dateien: [supabase/_pipeline/13_supplements/313c_rule_high_operators.sql, tools/regel-operatoren-pruefen.mjs]
zahlen: null
---

# C-313 - 25 Regeln koennen nicht feuern

## Befund

(neu 2026-08-27,
  **erhoben**). Aus C-296.

  `[cmd]` **Codex hat gemessen:** von 27 Operatoren in
  `rule_catalog.conditions` haben **12 echte Pfade** im Evaluator,
  **14 fehlen vollstaendig**, und `dsl` ist fuer **3 von 15** Regeln
  individuell behandelt. **25 Regeln sind damit unbehandelt** — vier
  `high`, **keine `critical`**.

  `[cmd]` **Die vier `high`:** `wr_drug_hyperkalemia_lab` und
  `wr_drug_testosterone_hct` (`lab_above`), `wr_lab_biotin` (`lte`,
  `substance_gte`), `wr_lab_vitc_glucose` (`eq`). `[read]` **Alle vier
  verknuepfen Medikamente oder Supplements mit Laborwerten.**
  `wr_lab_biotin` ist die Regel gegen Biotin-Interferenz bei
  Troponin- und TSH-Messungen.

  `[cmd]` **Die Klonprobe entscheidet:** ein erfundener Operator
  `c313_unknown_operator` endet **lautlos mit `not_fulfilled`, ohne
  Fehler.**

  `[read]` **Die Regeln sind nicht defekt — sie sind unsichtbar, und
  das System meldet Vollzug.** Wer die 64 Zeilen im Katalog zaehlt,
  zaehlt 64 wirksame Regeln.

  `[cmd]` **Ursache: unvollstaendige C-133-Implementierung**, kein
  Verlust durch Schritt 145. `[read]` **Also eine offene Baustelle,
  kein Defekt** — die Regeln wurden eingespielt, bevor der Evaluator
  sie auswerten konnte.

  `[read]` **Meine Ausgangsmessung war zweimal falsch gemessen:** die
  Suche nach dem Operatornamen als Zeichenkette war zu weit (15
  fehlend), die Suche nach `WHEN '<op>'` zu eng (0 Treffer fuer alle
  27, auch die funktionierenden). **Der Evaluator ist nicht als
  `CASE`-Kaskade gebaut.**

  ### Die Entscheidung, die ansteht

  **1 · Alle 14 nachbauen** — vollstaendig, Wochen, und
  `wr_lab_biotin` wirkt erst am Ende.
  **2 · Die vier `high` zuerst** — `lab_above`, `lte`,
  `substance_gte`, `eq`: vier Operatoren fuer vier Regeln.
  **3 · Erst laut scheitern lassen** — ein unbekannter Operator
  wirft, statt still nicht zu erfuellen.

  `[read]` **Vorschlag: 3, dann 2.** Solange ein unbekannter Operator
  schweigt, entsteht derselbe Fehler mit der naechsten Kimi-Welle
  wieder — und niemand merkt es. **Erst den Melder, dann die
  Regeln.**

## Auftrag — Weg 2

**Entscheidung Tom, 2026-08-27: Weg 3, dann Weg 2.** `[cmd]` **Weg 3
ist gebaut** (C-313b: `unsupported_operator` statt stiller
Nichterfuellung, Gate-Waechter). **Dies ist Weg 2.**

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator (`CLAUDE.md`, *,,Der
Orchestrator zaehlt nicht"*). **Nenn die Abgrenzung mit** — bei den
Regelzahlen hat sie mich dreimal aufs Glatteis gefuehrt.

### Zu tun

**Die Operatoren implementieren, die die `high`-Regeln brauchen.**

`[read]` **Welche das sind, misst du** — deine C-313-Erhebung hat sie
benannt, aber der Stand kann sich seither verschoben haben.

`[read]` **Und die Reihenfolge ergibt sich aus dem Nutzen, nicht aus
der Zahl:** ein Operator, der vier Regeln freischaltet, geht vor
einem, der eine freischaltet. **Sag im Bericht, wie du sortiert
hast.**

**Je Operator eine Gegenprobe in beide Richtungen:** eine Lage, in der
die Regel zutreffen muss, und eine, in der sie nicht zutreffen darf.

`[read]` **Das ist wichtiger als die Implementierung selbst.** `[cmd]`
**`wr_lab_biotin` ist die Regel gegen Biotin-Interferenz bei
Troponin- und TSH-Messungen** — eine Warnung, die zu frueh feuert, ist
so schaedlich wie eine, die ausbleibt.

**Den Sollstand im Waechter nachziehen.** `[read]` **Er faellt mit
jedem Operator** — und der Waechter wird rot, wenn er es nicht tut.
**Das ist die Ratsche, sie soll wirken.**

### Was nicht zu tun ist

**Keine Regel aendern.** `[read]` **Die Operatoren werden zum
Regelbestand gebaut, nicht der Bestand zum Operator.** Wenn eine Regel
etwas verlangt, das nicht sinnvoll implementierbar ist: **melden,
nicht die Regel anpassen.**

**Nicht alle vierzehn** — nur die, die `high`-Regeln freischalten.
`[read]` **Der Rest folgt, wenn diese laufen und geprueft sind.**

`apps/` nicht anfassen — Claude Code arbeitet dort an G-215, dem
Durchstich. `[read]` **Sein Ergebnis kann diesen Auftrag noch
verschieben** — wenn die Kette an anderer Stelle abreisst, nuetzt ein
Operator nichts.

Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Operatoren implementiert       welche, und warum diese zuerst
    Regeln je Operator             freigeschaltet
    je Regel: trifft zu            Lage hergestellt, Warnung kommt
    je Regel: trifft nicht zu      Lage hergestellt, Warnung bleibt aus
    unsupported_operator           vorher / nachher
    Sollstand                      nachgezogen, Zahl genannt
    rule_assessment Laufzeit       ms vorher / nachher

`[read]` **Die vierte Zeile ist die, die haeufig fehlt.** Eine Regel,
die immer feuert, besteht jede Probe, die nur das Zutreffen prueft.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
Struktur gehoert in die Kette, nicht in eine Migration.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

Datum: 2026-08-28

### Ergebnis

`lab_above` ist als eigener Kettenschritt
`supabase/_pipeline/13_supplements/313c_rule_high_operators.sql`
implementiert. Er macht genau zwei `high`-Regeln auswertbar:
`wr_drug_hyperkalemia_lab` und `wr_drug_testosterone_hct`. Der
Schritt folgt auf C-313b (`313c` haengt von `313` ab), aendert keine
Regel und liegt nicht in `migrations/`.

Der Vergleich ist absichtlich eng: nur exakt benannte Marker mit
bekannter Einheit koennen treffen. Haematokrit in `%` wird zu einem
Anteil normalisiert; Haematokrit in `L/L`, `fraction` oder `ratio`
wird direkt verglichen. Kalium akzeptiert nur `mmol/L`. Andere Marker,
Einheiten oder nichtnumerische Werte loesen keine Warnung aus.
Der Operatorvertrag ist zusaetzlich auf diese beiden Regel-IDs
begrenzt; eine spaetere `lab_above`-Regel bleibt ohne eigenen
Einheitenvertrag sichtbar als `unsupported_operator`.

### Zahlen und Abgrenzung

Gezahlt wurden rekursiv alle Condition-Objekte mit `op` in
`supplements.rule_catalog.conditions`; eine Regel zaehlt einmal,
unabhaengig von der Zahl ihrer unbekannten Operatoren. Entscheidend
ist `supplements.rule_operator_supported(...)`, also der gemeinsame
Vertrag von Evaluator und Waechter, nicht eine Textsuche im SQL.

| Messpunkt | Ausgangsbefund | Eigene Messung vorher | Nachher |
|---|---:|---:|---:|
| unauswertbare Regeln | 25 | 25 | 23 |
| davon `high` | 4 | 4 | 2 |
| direkt freigeschaltete `high`-Regeln | nicht getrennt | 0 | 2 |
| vollstaendig fehlende Operatornamen | 14 | 14 | 13 |

Die verbleibenden `high` sind `wr_lab_biotin` (`lte`,
`substance_gte`) und `wr_lab_vitc_glucose` (`eq`).

### Priorisierung und Grenze

Die Reihenfolge war Nutzen vor Operatorzahl:

1. `lab_above` schaltet zwei High-Regeln frei und ihre beiden
   Eingaben (`labs`, `medications`) sind auswertbar.
2. `lte` plus `substance_gte` wuerden zusammen nur
   `wr_lab_biotin` freischalten. `medical.lab_draw_scheduled_within_days`
   hat jedoch kein Modell; `platform_input_status` meldet
   `missing_input` mit `scheduled lab draw model is not built`.
   `supplements.daily_total_mg` ist zudem nur `partial`.
3. `eq` wuerde nur `wr_lab_vitc_glucose` freischalten. Es gibt keine
   Tabelle oder Spalte fuer `medical.glucose_meter_user`.

Die letzten drei Operatoren wurden daher nicht scheinbar
unterstuetzt. Ohne die Eingabemodelle wuerde das lediglich aus einer
sichtbaren `unsupported_operator`-Luecke eine nicht auswertbare
`not_fulfilled`-Regel machen.

### Gegenproben

Alle Fachproben liefen in der vollstaendig aus der Kette aufgebauten
Wegwerf-Datenbank `lumeos_c313c_chain`, nie gegen die laufende
Datenbank. Die eingefuegten User-, Medikamenten- und Laborzeilen
lagen jeweils in einer Transaktion und wurden mit `ROLLBACK` entfernt.

| Regel | trifft zu | trifft nicht zu |
|---|---|---|
| `wr_drug_hyperkalemia_lab` | Lisinopril mit `hyperkalemia_risk` und Kalium `5.1 mmol/L`: `fulfilled` | dieselbe Medikamentenlage, Kalium genau `5.0 mmol/L`: `not_fulfilled` |
| `wr_drug_testosterone_hct` | Medikament mit Klasse `androgen` und Haematokrit `51 %`: `fulfilled` | dieselbe Medikamentenlage, Haematokrit genau `50 %`: `not_fulfilled` |

Damit prueft die negative Seite jeweils die strikte `>`-Grenze und
nicht nur das Vorhandensein eines Laborwerts.

### Waechter und Laufzeit

`tools/regel-operatoren-pruefen.mjs` erwartet nun exakt 23
unauswertbare Regeln und genau `wr_lab_biotin` sowie
`wr_lab_vitc_glucose` als `high`. Im Klon war der Waechter bei 23
gruen; eine kuenstlich behandelbare High-Regel ergab 22 und rot,
ein erfundener Operator in einer sonst auswertbaren Regel ergab 24
und rot. Der Waechter ist in `pnpm gate` eingehangen.

Die Vergleichsmessung erfolgte dreimal je Seite im selben Klon mit
identischem synthetischem Nutzer und `EXPLAIN (ANALYZE, TIMING OFF)`
ueber alle 64 Regeln. Vorher (nur C-313b): `26.587 / 13.446 / 13.442`
ms, Median `13.446` ms. Nachher: `24.229 / 14.342 / 15.541` ms,
Median `15.541` ms. Diese Werte sind wegen des kleinen Testbestands
nicht mit den frueheren Dev-User-Messungen vergleichbar; sie belegen
hier nur den Effekt des neuen Vergleichspfads.

### Kette, Sicherung und Live-Kontrolle

Die vollstaendige Kette lief mit dem neuen Schritt in
`lumeos_c313c_chain`: 126 Schritte, erfolgreich. Vor dem
Live-Eingriff liegt die Vollsicherung
`backup/c313c/20260828_c313c_vor_live.dump` mit 25.253.600 Byte;
vor der abschliessenden Vertragsbegrenzung kam die zweite
Vollsicherung `backup/c313c/20260828_c313c_vor_live_scope.dump`
hinzu. Der finale Kettenlauf mit der Begrenzung war ebenfalls gruen
(126 Schritte).
Danach war der Waechter auf der laufenden Datenbank gruen: 23
`unsupported_operator`, 39 `not_fulfilled`, 1 `missing_input` und
1 `fulfilled`. Die zwei implementierten High-Regeln sind bei den
aktuellen Dev-Daten auswertbar und `not_fulfilled`; die zwei ohne
Eingabemodell bleiben `unsupported_operator`.

Der README/Kette-Abgleich ist weiterhin kein nutzbarer Gate-Schritt:
er war vor dieser Arbeit bei 39 fehlenden Dokumentationszeilen und
meldet mit `313c` 40. Die bestehende, umfassende README-Luecke wurde
nicht partiell umgeschrieben.

Keine Katalogregel, keine Datei unter `apps/` und keine Migration
wurde geaendert. Nichts wurde gestaged, committet oder gepusht.

## Abnahme — Weg 2

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Bestaetigt:**

    unsupported_operator    23   (vorher 25)
    davon high               2   (vorher 4)
    not_fulfilled           39
    fulfilled                1

`[cmd]` **Freigeschaltet ueber `lab_above`:**
`wr_drug_hyperkalemia_lab` und `wr_drug_testosterone_hct`. `[cmd]`
**Verblieben:** `wr_lab_biotin` und `wr_lab_vitc_glucose`. `[cmd]`
Waechter bei 23 gruen, bei 22 und 24 rot — **beide Richtungen
belegt.**

### Die Begrenzung ist die richtige Entscheidung

`[read]` **`lab_above` haette breiter gebaut werden koennen.** Codex
hat es nicht getan, **weil die anderen Regeln Eingabemodelle
brauchen, die es nicht gibt.**

`[read]` **Und Biotin und Vitamin C bleiben *sichtbar* blockiert** —
sie fallen nicht mehr still aus, sie stehen als
`unsupported_operator` im Ergebnis. **Wer wissen will, warum die
Biotin-Warnung nicht kommt, findet die Antwort, statt anzunehmen, es
gebe nichts zu warnen.**

`[read]` **Eine Implementierung, die vier Regeln freischalten wollte
und zwei freischaltet, weil die anderen zwei Daten brauchen, die
fehlen, ist kein halbes Ergebnis. Sie ist ein vollstaendiges mit
einem benannten Rest.**

### Zu spaet abgenommen

`[read]` **Der Bericht lag vor, ich hatte nachgemessen — und den
Punkt trotzdem liegen lassen** mit der Begruendung, C-331 koenne das
Ergebnis noch verschieben. `[cmd]` **Von Tom bemerkt.**

`[read]` **Die Begruendung traegt nicht:** C-328 hat einen anderen
Defekt gefunden, nicht diesen. **Der Ordner behauptete, Codex arbeite
an zwei Dingen — er arbeitete an einem.**

**Abgenommen.** Der Rest — 23 Operatoren, davon `wr_lab_biotin` und
`wr_lab_vitc_glucose` mit `high` — bleibt als eigener Punkt offen.

