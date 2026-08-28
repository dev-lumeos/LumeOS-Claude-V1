---
nr: C-328
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-215
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
entscheidung: null
beruehrt:
  tabellen: [medical.medication_active_substances, supplements.rule_catalog]
zahlen:
  gemessen: 2026-08-28
  wirkstoffe: 498
  mit_neun_schluesseln: 498
  bleeding_risk_true: 196
  bleeding_risk_false: 302
  betroffene_regeln: 5
---

# C-328 — `count_risk_flag_gte` zaehlt Schluessel statt Werte

## Befund

Aus G-215, Claude Code, 2026-08-28. **Vom Orchestrator nachgemessen.**

`[cmd]` **Alle 498 Wirkstoffe tragen alle neun `risk_flags`-Schluessel
— ausnahmslos.** `[cmd]` **196 haben `bleeding_risk: true`, 302 haben
`false`, keiner hat den Schluessel nicht.**

`[cmd]` **Der Evaluator baut die Liste ueber
`array_agg(DISTINCT key)` auf `jsonb_object_keys(risk_flags)`** —
**zwei unabhaengige Fehler in einer Zeile:**

**Kein Filter auf `true`.** `[read]` Furosemid mit
`bleeding_risk: false` erzeugt denselben Satz wie Warfarin. **Der
Schluessel ist da, also zaehlt er.**

**`DISTINCT` kollabiert ueber alle Medikamente.** `[cmd]` **Vier
Blutungswirkstoffe ergeben `count = 1`.**

## Was das bedeutet

`[cmd]` **Fuenf Regeln lesen `count_risk_flag_gte`:**

    wr_drug_bleeding_stack        high
    wr_drug_hyperkalemia_stack    high
    wr_drug_qt_stack              high
    wr_drug_serotonergic_combo    critical
    wr_drug_hyperkalemia_lab      high

`[read]` **Vier feuern nie** — sie verlangen `>= 2` oder mehr, und die
Zahl kann nie ueber 1 steigen. **Darunter die einzige
`critical`-Regel im Bestand: das Serotonin-Syndrom.**

`[read]` **Und die fuenfte ist die gefaehrlichere Haelfte.**
`wr_drug_hyperkalemia_lab` verlangt `>= 1` — **das ist ab dem ersten
beliebigen Medikament wahr.** Kein stiller Ausfall, sondern ein
**Falschalarm**, der heute nur ausbleibt, weil `test-user` keine
Laborwerte hat.

`[cmd]` **Und genau diese Regel hat Codex in C-313 Weg 2 gerade
freigeschaltet** — ueber `lab_above`. `[read]` **Sie haengt jetzt nur
noch am Laborwert; die zweite Bedingung ist immer wahr.** **Der Fund
kam eine Stunde zu spaet, um es zu verhindern, und rechtzeitig, um es
zu bemerken.**

## Warum es niemandem auffiel

`[read]` **Die Regeln liefen als `not_fulfilled`** — dasselbe
Ergebnis wie *,,trifft nicht zu"*. `[cmd]` **C-313b hat
`unsupported_operator` sichtbar gemacht; dieser Fall bleibt
unsichtbar, weil der Operator existiert und falsch rechnet.**

`[read]` **Ein Operator, der nicht da ist, meldet sich seit C-313b.
Einer, der falsch rechnet, nicht.**

## Auftrag

**Vor allem anderen.** `[read]` Vier stumme Warnungen und ein
Falschalarm sind kein Feature-Rueckstand, sondern ein Defekt in dem,
was das Produkt verspricht.

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

`[read]` **Und der Zusammenhang zu deiner letzten Arbeit steht im
Befund:** `wr_drug_hyperkalemia_lab` hast du in C-313 Weg 2
freigeschaltet. **Sie haengt jetzt nur noch am Laborwert, weil die
zweite Bedingung immer wahr ist.** Deine Grenzwertproben waren
richtig — **sie konnten den Defekt nicht sehen, weil er die Bedingung
immer erfuellt.**

### Zu tun

**Den Operator so bauen, dass er zaehlt, was gemeint ist.**

`[read]` **Zwei Fehler, und beide muessen weg:** der fehlende Filter
auf `true`, und das `DISTINCT`, das ueber alle Medikamente
kollabiert. **Einer allein reicht nicht** — mit Filter, aber ohne
Behebung des `DISTINCT`, ergeben vier Blutungswirkstoffe weiter 1.

`[read]` **Was gezaehlt werden soll, ist eine fachliche Frage:**
zaehlt `>= 2` zwei Wirkstoffe mit demselben Risiko, oder zwei
verschiedene Risiken? `[read]` **Lies die fuenf Regeln und ihre
Meldungstexte** — `wr_drug_bleeding_stack` meint offensichtlich zwei
blutungsfoerdernde Medikamente, nicht zwei Risikoarten. **Wenn eine
Regel etwas anderes meint, sag es.**

### Der Nachweis ist wichtiger als die Behebung

**Je Regel eine Lage, in der sie zutreffen muss, und eine, in der sie
nicht zutreffen darf.**

`[read]` **`wr_drug_serotonergic_combo` ist `critical`** — die einzige
im Bestand. **Sie hat nie gefeuert. Nach der Behebung muss belegt
sein, dass sie feuert, wenn sie soll, und schweigt, wenn nicht.**

`[read]` **Und `wr_drug_hyperkalemia_lab` braucht die
Gegenprobe, die bisher fehlte:** ein Medikament **ohne**
Hyperkaliaemie-Risiko plus ein hoher Kaliumwert — **die Regel darf
nicht feuern.** `[cmd]` Heute wuerde sie.

### Was nicht zu tun ist

**Keine Regel aendern, keine `risk_flags` aendern.** `[read]` **Der
Operator wird zum Bestand gebaut, nicht der Bestand zum Operator.**
**Keine weiteren Operatoren** — C-313 hat noch 23 offene, sie warten.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Regeln mit count_risk_flag_gte   5, je einzeln
    je Regel: trifft zu              Lage hergestellt, feuert
    je Regel: trifft nicht zu        Lage hergestellt, feuert nicht
    wr_drug_serotonergic_combo       feuert erstmals - belegt
    wr_drug_hyperkalemia_lab         Falschalarm weg - belegt
    evaluation_state                 vorher / nachher, alle 64

`[read]` **Die vorletzte Zeile ist die, die heute niemand geprueft
hat** — und die einzige, bei der ein Fehler einen Nutzer erreicht
haette.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

Datum: 2026-08-28

### Ergebnis

Der neue Kettenschritt
`supabase/_pipeline/13_supplements/328_count_risk_flag_values.sql`
zaehlt fuer `count_risk_flag_gte` nur `true`-Flags und zwar je
unterschiedlichem `active_substance_id`. Zwei Erfassungen desselben
Wirkstoffs zaehlen damit als ein Wirkstoff; zwei unterschiedliche
Wirkstoffe mit demselben Risiko zaehlen als zwei. Das entspricht allen
fuenf Regeltexten: vier sprechen von mehreren Medikamenten, die
critical-Regel ausdruecklich von zwei oder mehr serotonergen
Medikamenten.

Keine Regel und kein `risk_flags`-Wert wurde geaendert. Schritt `328`
folgt in `kette.json` auf `313c`; eine Migration wurde nicht angelegt.

### Zahlen und Abgrenzung

Gezahlt wurden unterschiedliche Zeilen von
`medical.medication_active_substances` und die top-level Conditions
der `rule_catalog`; verschachtelte JSONPath-Treffer wurden nicht als
weitere Regel gezaehlt.

| Messpunkt | Ausgangswert | Eigene Messung | Geltend |
|---|---:|---:|---:|
| Wirkstoffe | 498 | 498 | 498 |
| mit genau neun `risk_flags`-Schluesseln | 498 | 498 | 498 |
| `bleeding_risk: true` | 196 | 196 | 196 |
| `bleeding_risk: false` | 302 | 302 | 302 |
| Regeln mit `count_risk_flag_gte` | 5 | 5 | 5 |
| davon `critical` | 1 | 1 | 1 |

Eine Ausgangsannahme ist falsch: Der Filter auf `true` fehlte nicht.
Er steht bereits in C-133 und C-313c als
`COALESCE((mas.risk_flags->>key)::boolean, false)`. Die Vorherprobe
mit Warfarin (`hyperkalemia_risk: false`) und Kalium `5.1 mmol/L`
ergab schon vor C-328 fuer `wr_drug_hyperkalemia_lab`
`not_fulfilled`. Der behauptete Falschalarm war daher im aktuellen
Stand nicht reproduzierbar.

Der echte Defekt war `array_agg(DISTINCT key)`: Selbst zwei
verschiedene Wirkstoffe mit demselben `true`-Flag wurden zu einem
Arrayelement kollabiert. Im C-313c-Vorherstand blieben deshalb die
positiven Lagen fuer Blutung, Hyperkaliaemie-Stack, QT und Serotonin
alle `not_fulfilled`.

### Gegenproben

Alle Proben liefen nur in der vollstaendig aufgebauten
Wegwerf-Datenbank `lumeos_c328_chain`. Testkonten, Medikamente und
Laborwerte wurden innerhalb einer Transaktion angelegt und mit
`ROLLBACK` entfernt.

| Regel | trifft zu | trifft nicht zu |
|---|---|---|
| `wr_drug_bleeding_stack` | zwei verschiedene Wirkstoffe mit `bleeding_risk: true`: `fulfilled` | ein Wirkstoff: `not_fulfilled` |
| `wr_drug_hyperkalemia_stack` | zwei verschiedene Wirkstoffe mit `hyperkalemia_risk: true`: `fulfilled` | zweimal derselbe Wirkstoff: `not_fulfilled` |
| `wr_drug_qt_stack` | zwei verschiedene Wirkstoffe mit `QT_risk: true`: `fulfilled` | ein Wirkstoff: `not_fulfilled` |
| `wr_drug_serotonergic_combo` | Amitriptylin plus Benzoate/Codeine mit `serotonergic_risk: true`: `fulfilled` | Amitriptylin allein: `not_fulfilled` |
| `wr_drug_hyperkalemia_lab` | ein Wirkstoff mit `hyperkalemia_risk: true` plus Kalium `5.1 mmol/L`: `fulfilled` | Warfarin ohne Hyperkaliaemie-Risiko plus Kalium `5.1 mmol/L`: `not_fulfilled` |

Damit feuert die einzige `critical`-Regel erstmals nachweislich und
schweigt bei nur einem serotonergen Wirkstoff. Die fehlende
C-313-Gegenprobe fuer einen hohen Kaliumwert ohne Risiko ist ebenfalls
belegt; sie war bereits vor C-328 korrekt, bleibt aber gegen
Regression abgesichert.

### Zustandsvergleich und Pruefung

Bei `dev@lumeos.app` blieben die 64 Regeln vor und nach C-328 bei
1 `fulfilled`, 1 `missing_input`, 39 `not_fulfilled` und 23
`unsupported_operator`; dort ist nur Warfarin aktiv und keine der
Kombinationsbedingungen liegt vor. Die fuenf betroffenen Regeln sind
fuer dieses Konto jeweils `not_fulfilled`.

Die gesamte Kette lief mit C-328 in 127 Schritten gruen. Der
Operator-Waechter bleibt bei 23 unauswertbaren Regeln und zwei
`high`-Regeln gruen; C-328 implementiert keinen weiteren Operator.
Vor dem Live-Eingriff liegt die Vollsicherung
`backup/c328/20260828_c328_vor_live.dump` (25.256.138 Byte).

Der README/Kette-Abgleich ist weiterhin als Gate ungeeignet: die
vorherigen 40 fehlenden Dokumentationszeilen wurden mit Schritt 328
zu 41. Die bestehende umfassende README-Luecke wurde nicht partiell
umgeschrieben.

Keine Datei unter `apps/`, keine Regel, keine `risk_flags`-Daten und
keine Migration wurden geaendert. Nichts wurde gestaged, committet
oder gepusht.

## Abnahme

**2026-08-28, Orchestrator.**

`[cmd]` **Der Umbau ist in der Wegwerf-Kette belegt** — fuenf
positive und fuenf negative Proben gruen, **einschliesslich der nie
zuvor feuernden `critical`-Regel `wr_drug_serotonergic_combo`.**
`[cmd]` 127-Schritte-Kette, Operator-, Punkte- und Migrationswaechter
gruen, Vollsicherung unter `backup/c328/`.

`[cmd]` **Live noch unveraendert** — 39 / 23 / 1 / 1. Richtig: der
Schritt ist gebaut, nicht eingespielt.

### Die Haelfte meines Auftrags war falsch

`[read]` **Der `true`-Filter war bereits vorhanden.** `[cmd]` **Ich
hatte gemessen, dass alle 498 Wirkstoffe alle neun Schluessel tragen
— und daraus geschlossen, der Filter fehle.** `[read]` **Das ist kein
Messergebnis, sondern ein Schluss aus einer Messung ueber etwas
anderes.** Der Evaluator-Code lag zwei Befehle entfernt; ich habe ihn
nicht gelesen und Claude Codes Aussage uebernommen.

`[read]` **Und daraus habe ich einen Falschalarm konstruiert**, der
nie existierte: `wr_drug_hyperkalemia_lab` mit einem nicht-riskanten
Wirkstoff. **Der Auftrag verlangte eine Gegenprobe fuer ein Problem,
das es nicht gab** — Codex hat sie gemacht und festgestellt, dass sie
nichts zeigt.

`[read]` **Der echte Defekt bleibt und ist behoben:** `DISTINCT`
kollabierte ueber alle Medikamente, vier Blutungswirkstoffe ergaben
1.

**Abgenommen.**

