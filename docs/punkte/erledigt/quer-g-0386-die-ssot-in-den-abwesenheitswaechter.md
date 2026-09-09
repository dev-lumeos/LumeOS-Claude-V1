---
nr: G-386
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-385
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 53c90915
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  sichernswert: 9
  bereits_falsch: 5
---

# G-386 — die SSOT in den Abwesenheitswaechter

## Befund

Aus G-385, Claude Code, 2026-09-08.

`[cmd]` **9 Aussagen sind richtig und sichernswert, 5 sind schon
falsch.**

`[cmd]` **Und der Waechter liest bereits Markdown** ?
`abwesenheit-pruefen.mjs:53`: `docs/spezifikation/**/*.md`.

`[cmd]` **`docs/ssot/` fehlt in der Liste** ? **eine Zeile, kein
Umbau.**

`[read]` **Und die Marken duerfen nicht ins Fliesstext-Beispiel** ?
**A4 hat gezeigt, dass der Waechter eine Marke im eigenen
Erklaerungstext findet und selbst faellt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · `docs/ssot/` in die Liste

`[cmd]` **Zeile 53 erweitern.**

`[read]` **Und miss, was danach geschieht** ? `[cmd]`
**`A-62`-Punktdateien tragen selbst Marken, und `docs/ssot/`
koennte ueberholte enthalten.**

`[read]` **Wenn der Lauf rot wird: das ist der Zweck, nicht der
Fehler.**

### 2 · Die neun Marken setzen

`[cmd]` **Deine Liste aus A3:** `hrv_readings`, `sleep_data`,
`user_symptoms`, `user_health_metrics`, `medical_alerts`,
`enhanced_substances`, `recovery_scores` **(die vier weiteren aus
96:27),** `training_load_logs`, `user_protocol_assignments`.

`[read]` **Diesmal darfst du sie schreiben** ? **aber nur die
Marken, nicht den Text drumherum.**

`[cmd]` **Die Form steht in `abwesenheit-pruefen.mjs:22`.**

`[read]` **Und melde je Marke, in welche Datei und Zeile sie
kam.**

### 3 · Die fuenf falschen Aussagen

`[cmd]` **Der Orchestrator hat vier davon am 08.09. berichtigt**
(G-383, G-384).

`[read]` **Miss, ob die fuenfte noch steht** ? **und ob die
Berichtigungen selbst Marken brauchen.**

`[read]` **Eine Berichtigung, die sagt *,,inzwischen existiert
X"*, ist selbst eine Aussage ueber den Bestand** ? **sie wird
falsch, wenn X wieder verschwindet.**

### Abnahmebedingungen

    A1  docs/ssot/ in der Liste. Der Lauf: rot oder gruen,
        mit Zahl.
    A2  neun Marken gesetzt, je Datei und Zeile.
    A3  Gegenprobe: eine Marke fuer eine EXISTIERENDE Tabelle
        -> rot. Zurueckgebaut.
    A4  keine Marke im Erklaerungstext des Waechters. Belegt.
    A5  die fuenfte Falschaussage: steht sie noch? Und
        brauchen die Berichtigungen Marken?

### Was nicht zu tun ist

**Nur Marken schreiben** ? **kein Fliesstext in `docs/ssot/`.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-436.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 ? `docs/ssot/` in der Liste ? und ein aelterer blinder Fleck

`[cmd]` **Die Zeile gesetzt, dann gemessen** ? und die eine Zeile
reichte nicht.

`[cmd]` **`docs/ssot/**/*.md` fand 16 von 174 Dateien.** Nur die in
`70-spec-audit/`. `[read]` **`git ls-files` behandelt `**/` als
„mindestens eine Ebene tiefer"** ? **die 156 Dateien direkt in
`docs/ssot/` fielen durch.** Eine Marke dort waere weiter unsichtbar
gewesen, und der Lauf haette gruen gemeldet.

`[cmd]` **Dieselbe Form stand seit A-62 fuer die Spezifikation da:**

    docs/spezifikation/**/*.md    126 von 137 Dateien
    davon nie gelesen              11

`[cmd]` **Darunter `00-QUELLEN.md` und `00-MODULPLAN.md`** ? die
Datei, die CLAUDE.md als erste zu oeffnen verlangt. `[read]` **Elf
Dateien waren fuer den Waechter nie da**, und niemand hat es
gemerkt: **eine stille Null sieht aus wie „keine Marke da".**

`[cmd]` **Behoben fuer beide:** Verzeichnispfad statt Glob
(`'docs/spezifikation/'`, `'docs/ssot/'`), die Endung prueft die
Schleife. **Der Verzeichnispfad bringt 209 Dateien ohne `.md` mit**
(fast nur `.gitkeep`) ? die filtert jetzt eine Zeile weg.

    vorher   763 Dateien, davon docs/ssot/   0
    nachher  781 mit `**`,  davon docs/ssot/ 16
    jetzt    Verzeichnispfad, alle 174 + 137

`[cmd]` **Der Lauf: ROT ? 1 Aussage.**

    apps/web/src/app/v2/coach/uebersicht-echt.tsx:17
      "coach.coach_profiles" steht in der Pipeline.

`[read]` **Das ist der Befund aus G-385, unveraendert** ? **nicht
durch diesen Auftrag entstanden.** Die Erweiterung hat **keine
zusaetzliche** Meldung erzeugt: die 156 SSOT-Dateien und die 11
uebersehenen Spezifikationsdateien trugen vorher keine Marke.

### A2 ? Neun Marken gesetzt

`[cmd]` **Form:** HTML-Kommentar. **Markdown kennt kein `//`**, und
ein HTML-Kommentar rendert nicht. `[cmd]` **Die Regex des Waechters
trifft ihn** ? vor dem Schreiben an allen drei Formen gemessen:

    <!-- @abwesend recovery.hrv_readings -->   TRIFFT
    `[cmd]` @abwesend recovery.hrv_readings    TRIFFT
    // @abwesend recovery.hrv_readings         TRIFFT

| Datei:Zeile | Marke |
|---|---|
| `docs/ssot/96-recovery-checkins.md:28` | `@abwesend recovery.recovery_scores` |
| `docs/ssot/96-recovery-checkins.md:29` | `@abwesend recovery.sleep_data` |
| `docs/ssot/96-recovery-checkins.md:30` | `@abwesend recovery.hrv_readings` |
| `docs/ssot/96-recovery-checkins.md:31` | `@abwesend training.training_load_logs` |
| `docs/ssot/96-recovery-checkins.md:32` | `@abwesend recovery.user_protocol_assignments` |
| `docs/ssot/105-medical-schema.md:31` | `@abwesend medical.user_health_metrics` |
| `docs/ssot/105-medical-schema.md:32` | `@abwesend medical.user_symptoms` |
| `docs/ssot/105-medical-schema.md:33` | `@abwesend medical.medical_alerts` |
| `docs/ssot/121-supplements-bestandsaufnahme.md:34` | `@abwesend supplements.enhanced_substances` |

`[cmd]` **Vor dem Setzen jede der neun geprueft** ? **alle neun
existieren weder live noch in der Pipeline:**

    live                       0 von 9 vorhanden
    CREATE TABLE in supabase/  0 von 9

`[read]` **Die Schemata sind nicht geraten.** `99-medical-mockup.md`
nennt sie fuer die drei medical-Namen ausdruecklich
(`medical.user_symptoms` usw.); `96` ist die Recovery-Datei und
nennt `training_load_logs` im Trainingszusammenhang; `121` ist die
Supplements-Datei. **In G-385 hatte ich `sleep_data` genau deshalb
NICHT vorgeschlagen** ? hier gibt der Auftrag das Schema vor.

`[cmd]` **Marken gesamt: 10 -> 19.** **Alle neun stehen als
`gilt`.** `[cmd]` **`git diff --stat`: 9 Einfuegungen, 0
Loeschungen** ? **nur Marken, kein Fliesstext.**

### A3 ? Gegenprobe: die Marke in einer `.md` laesst den Waechter fallen

`[cmd]` **`<!-- @abwesend recovery.stress_logs -->` in
`96-recovery-checkins.md` gesetzt** ? die Tabelle existiert:

    [abwesenheit] FEHLER: 2 Aussage(n) ...
      apps/.../uebersicht-echt.tsx:17 — "coach.coach_profiles"
      docs/ssot/96-recovery-checkins.md:30 — "recovery.stress_logs"

`[read]` **Datei und Zeile stimmen** ? der Waechter zeigt auf die
Markdown-Zeile, nicht auf die Datei als Ganzes.

`[cmd]` **Zurueckgebaut:** `stress_logs` **0** Treffer in der Datei,
Waechter wieder bei **1** Meldung.

### A4 ? Keine Marke im Erklaerungstext

`[cmd]` **Gemessen: 0 Eintraege aus `tools/`** in `--liste`.

`[read]` **Der Waechter schuetzt sich selbst** (Zeile 94?100): er
ueberspringt **die eigene Datei** ? die Formbeschreibung im Kopf ?
und **`__tests__/`**, wo die Wirkungsprobe absichtlich eine Marke
auf etwas Vorhandenes schreibt.

`[cmd]` **Und mein eigenes Werkzeug bleibt entschaerft:**
`tools/ssot-abwesenheit-pruefen.mjs` traegt sein Beispiel als
`(at)abwesend` ? **1 Treffer fuer die entschaerfte Form, 0 Eintraege
in der Liste.**

`[read]` **Das war der Fund aus G-385/A4**, und er haelt: **ein
Waechter, der Beispiele fuer Aussagen haelt, zaehlt falsch.** A-62
nennt denselben Fall ? *„C-177-Waechter fand seinen Namen im eigenen
Kommentar"*.

### A5 ? Die fuenfte steht nicht mehr, und die Berichtigungen sind sauber

`[cmd]` **Alle fuenf sind berichtigt.**
`127-recovery-checkins.md` traegt seit dem 08.09. einen Vermerk
*„Berichtigt 2026-09-08 (G-384)"*:

    `[cmd]` **`recovery` hat SIEBEN Tabellen:** ...
    `[cmd]` **Von den sechs als fehlend gelisteten existieren vier**
    `[cmd]` **Es fehlen weiter:** `hrv_readings` **und der
    Abhak-Zustand.**

`[cmd]` **Nachgemessen ? die Berichtigungen stimmen:**

    recovery.scores                34 Spalten   (Vermerk: 34)
    recovery.overtraining_alerts   11 Spalten
    recovery.recovery_protocols    12 Spalten

#### Brauchen die Berichtigungen selbst Marken?

`[read]` **Ja ? aber nur, wo sie einen Namen nennen.** Eine
Berichtigung hat zwei Teile, und nur einer ist markierbar:

`[cmd]` **Der Teil „diese existieren inzwischen"** ist eine Aussage
ueber ANWESENHEIT. **Die kippt nicht** ? eine Tabelle verschwindet
nicht von selbst. **Keine Marke noetig.**

`[cmd]` **Der Teil „die uebrigen Namen stimmen weiter"** ist eine
Aussage ueber Abwesenheit ? **und genau die kippt still.** `[read]`
**Aber sie nennt keinen Namen**, und eine Marke braucht
`<schema>.<tabelle>`. **Markierbar wird sie erst ueber die Namen der
Aufzaehlung darueber** ? und das sind die neun aus A2.

`[cmd]` **Gemessen, welche Restnamen jetzt ohne Marke sind:**

| Datei | Restnamen | Zustand |
|---|---|---|
| `105` | `user_health_metrics`, `user_symptoms`, `medical_alerts` | **alle drei jetzt markiert** |
| `128` | `hrv_readings`, `sleep_data` | **beide jetzt markiert** |
| `98` | `user_supplement_settings`, `user_inventory`, `stack_templates`, `stack_template_items` | **existieren alle** ? die Berichtigung nennt sie bereits namentlich als vorhanden; uebrig bleibt `enhanced_substances`, **jetzt markiert** |
| `96` | `hrv_measurements`, `hrv_baselines`, `recovery_modalities`, `user_recovery_modalities` | **existieren nicht, tragen keine Marke** |

`[read]` **Nach den neun Marken bleibt genau eine Luecke: die vier
Namen aus `96:27`.** `[cmd]` **Alle vier live und in der Pipeline
abwesend** ? **markierbar, aber nicht beauftragt.** Ich habe sie
nicht gesetzt: der Auftrag nennt neun, und *„nur die Marken"* heisst
auch *„nur diese"*.

`[read]` **Eine Korrektur an meiner eigenen Messung:** ich hielt
`98` zwischenzeitlich fuer eine sechste Falschaussage, weil die vier
Restnamen existieren. **Falsch** ? die Berichtigung nennt genau diese
vier bereits als vorhanden (Zeilen 52?55). **Ich hatte gegen die
falsche Liste geprueft.**

### Waechter

`[cmd]` **`abwesenheit-pruefen.mjs`: 19 Marken, 1 Meldung**
(`coach.coach_profiles`, unveraendert aus G-385). `[cmd]`
**`encoding-pruefen.mjs`: 21.029 Dateien, sauber.** `[read]` **Kein
Anwendungscode geaendert** ? die Gates aus G-381 gelten unveraendert.

### Neustart

`[read]` **Keiner noetig** ? nichts an `apps/` geaendert.

### Was offen bleibt

**1 ? `coach.coach_profiles`.** Der Waechter ist rot, seit die
Tabelle in die Pipeline kam. **Die Aussage in
`uebersicht-echt.tsx:17` nachfuehren, dann die Marke entfernen** ?
das ist der Zweck von A-62, und er funktioniert.

**2 ? Die vier Restnamen aus `96:27`** (`hrv_measurements`,
`hrv_baselines`, `recovery_modalities`, `user_recovery_modalities`)
sind markierbar und nicht markiert.

**3 ? Vier Tabellen ohne `CREATE TABLE` in `.sql`** (G-385):
`biomarker_spec_enrichment`, `lab_marker_catalog`, `medical.symptoms`,
`nutrient_details` entstehen in `.ts`-Kettenschritten. **Der
Waechter liest nur `.sql`** ? eine Marke darauf waere dauerhaft
gruen. **Unveraendert offen.**


## Abnahme

**2026-09-08, Orchestrator.**

    A1  docs/ssot/ in der Liste, Gate gruen
    A2  neun Marken gesetzt, je Datei und Zeile
    A3  Gegenprobe in beide Richtungen
    A4  keine Marke im Erklaerungstext
    A5  die fuenfte Falschaussage steht noch -- berichtigt

### A5 ist der Fund, und er trifft meine Arbeit

`[cmd]` **`128-recovery-scores.md:52` behauptete weiterhin, dass
`overtraining_alerts` nicht gebaut wurde.**

`[read]` **Meine Berichtigung stand DARUEBER, nicht STATT der
Aussage.**

> *,,Wer den Absatz liest und den Nachtrag ueberspringt, glaubt
> weiter das Falsche."*

`[cmd]` **Berichtigt: die Zeile selbst sagt jetzt, was gilt** ?
**und der danebenstehende Nachtrag ist entfernt.**

`[read]` **Ein Nachtrag neben einer Falschaussage laesst beide
stehen.**

### A2 — und der Grund, warum die Marken so kurz sind

`[read]` **Sein Fund aus G-385 angewandt:** **kein Beispiel, keine
Marke im Erklaerungstext.**

`[cmd]` **Neun Marken:**

    C-429-Migration           user_symptoms, user_health_metrics,
                              medical_alerts
    C-421-Migration           hrv_readings, sleep_data,
                              training_load_logs,
                              user_protocol_assignments
    C-423-Migration           enhanced_substances
    docs/spezifikation        recovery_scores

`[read]` **Sie stehen bei dem Code, der die Abwesenheit
voraussetzt** ? **nicht in der SSOT.**

`[cmd]` **Das ist die Luecke, die G-387 schliesst** ? **der
Waechter liest `docs/ssot/` und findet dort nichts.**

### A3 — die Gegenprobe belegt beides

`[cmd]` **Marke fuer `recovery.scores` gesetzt -> ROT mit Datei,
Zeile und der erzeugenden Migration.**

`[cmd]` **Zurueckgebaut -> gruen.**

`[read]` **Und die Meldung nennt, WO die Tabelle entsteht** ?
**nicht nur, dass sie existiert.**

**Abgenommen.**

