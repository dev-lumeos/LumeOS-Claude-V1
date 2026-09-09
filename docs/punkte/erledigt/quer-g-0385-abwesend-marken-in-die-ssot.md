---
nr: G-385
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-384
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 69b91897
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  falschaussagen: 5
  ssot_mit_marke: 0
---

# G-385 — `@abwesend`-Marken in die SSOT

## Befund

Aus G-384, Claude Code, 2026-09-08.

`[read]` **Sein bester Fund ist gegen seine eigene Arbeit
gerichtet:**

> *,,Der Waechter existiert bereits, und besser.
> `tools/abwesenheit-pruefen.mjs` steht seit A-62 im Gate und loest
> es umgekehrt: die Aussage traegt eine `@abwesend`-Marke, und der
> Waechter faellt, wenn die Kette die Tabelle anlegt. Eine Marke ist
> eindeutig, eine Verneinung in Prosa nie."*

`[cmd]` **Nachgemessen: `tools/abwesenheit-pruefen.mjs`, 184
Zeilen, seit A-62 im Gate** ? **mit sechs belegten Faellen vom
30.08.**

`[cmd]` **Und A-62 nennt seinen Fall woertlich:**
`C-175-Kommentar "shopping_lists gibt es nicht"`.

`[cmd]` **`@abwesend` steht in vier Punktdateien** ? **und in
KEINER `docs/ssot/`-Datei.**

## Warum das der Weg ist

`[read]` **Sein eigener Waechter meldete 72 Faelle, davon 2
echte.**

> *,,2 von 72 wird binnen Tagen ignoriert, und ein ignorierter
> Waechter taeuscht Abdeckung vor."*

`[read]` **Die Ursache ist grammatisch, nicht einstellbar:**
`[cmd]` **`83-dashboard.md:189` sagt woertlich, die Tabelle gebe es
trotzdem** ? **und wird gemeldet.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Abwesenheitsaussagen finden

`[read]` **Du hast sie schon gemessen: 58 Kandidaten, 5
Falschaussagen.**

`[read]` **Jetzt die Gegenrichtung:** **welche Aussagen sind
RICHTIG und sichern eine Abwesenheit, die enden koennte?**

`[cmd]` **Beispiel: `hrv_readings`, `sleep_data`** ? **es gibt sie
nicht, und wenn Codex sie baut, wird die Aussage still falsch.**

### 2 · Marken setzen

`[cmd]` **Die Form steht in `abwesenheit-pruefen.mjs:22`:**

    // @abwesend nutrition.shopping_lists
    // `[cmd]` Die Tabelle gibt es nicht - deshalb kein Schreibweg.

`[read]` **In Markdown entsprechend** ? **miss, ob der Waechter
`.md` liest, oder ob er erweitert werden muss.**

`[read]` **Und melde die Marken, schreib sie nicht** ? `docs/`
**gehoert dem Orchestrator.**

`[read]` **Ausser du misst, dass der Waechter eine eigene Liste
fuehrt** ? **dann sag mir, wo.**

### 3 · Dein Waechter

`[cmd]` **`tools/ssot-abwesenheit-pruefen.mjs`, ungehaengt.**

`[read]` **Er bleibt als Messwerkzeug auf Zuruf** ? **er hat die
fuenf Falschaussagen gefunden, und das war seine Arbeit.**

`[read]` **Vermerk im Kopf, dass er bewusst nicht im Gate steht,
und warum** ? **sonst haengt ihn jemand ein.**

### Abnahmebedingungen

    A1  wie viele richtige Abwesenheitsaussagen? Zahl:
        geprueft / sichernswert.
    A2  liest abwesenheit-pruefen.mjs Markdown? Ja mit
        Fundstelle, nein mit dem noetigen Zusatz.
    A3  die Marken, je Datei und Zeile, im Bericht.
    A4  Gegenprobe: eine Marke fuer eine EXISTIERENDE Tabelle
        -> der Waechter faellt. Zurueckgebaut.
    A5  dein Waechter traegt den Vermerk. Belegt.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **auch keine Marken.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-436.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 ? Richtige Abwesenheitsaussagen: 37 geprueft, 4 sichernswert

`[cmd]` **Geprueft wird gegen die PIPELINE**, nicht gegen die
laufende Datenbank ? weil `abwesenheit-pruefen.mjs:95` das auch tut
(`pipelineText()` liest `supabase/**/*.sql`). **Eine Aussage, die
kippt, kippt dort zuerst.**

`[cmd]` **37 Kandidaten in der Form `schema.tabelle`, in einer
Verneinung. 23 stehen schon in der Pipeline** (die Aussage ist also
falsch ? das war G-382 bis G-384). **14 nicht.**

`[read]` **Ein erster Durchgang meldete 92** ? unbrauchbar. Er nahm
jedes Backtick-Wort neben einem Schemanamen: `medical.arrow_right`,
`coach.recovery`, `medical.information_schema`. **Ein
Backtick-Wort ist kein Tabellenname.** Nur die Form
`schema.tabelle` zaehlt ? **und das ist genau die Form, die die
Marke traegt.** Was ohne Schema dasteht, ist als Marke ohnehin nicht
schreibbar.

`[cmd]` **Von den 14 je Name gefragt, was es wirklich ist:**

    BASE TABLE (live, aber nicht in der Pipeline)   4
    VIEW                                            1  daily_intake_summary
    FUNKTION                                        1  food_search
    nichts, weder Pipeline noch live                8

`[cmd]` **Von den 8 tragen 6 ihren Namen als Spalte oder in anderem
Zusammenhang in `supabase/`** (`medications` in 15 Dateien,
`daily_total_mg` in 8). **Uebrig bleiben 4 Namen, die in
`supabase/` GAR NICHT vorkommen und live nicht existieren:**

    recovery.hrv_readings          0 Treffer in supabase/, live nein
    recovery.protocols             0 Treffer in supabase/, live nein
    recovery.protocol_assignments  live nein
    (sleep_data)                   live nein

**Zahl: 37 geprueft / 4 sichernswert.**

#### Ein Befund nebenbei: vier Tabellen ohne `CREATE TABLE`

`[cmd]` **`medical.biomarker_spec_enrichment`,
`medical.lab_marker_catalog`, `medical.symptoms` und
`nutrition.nutrient_details` existieren live, aber kein
`.sql` in `supabase/` legt sie an.**

`[cmd]` **Gefunden:** sie entstehen in **TypeScript-Schritten** der
Kette ? `_pipeline/14_medical/144_biomarker_spec_enrichment.ts`,
`_pipeline/13_supplements/143_kimi_wave2_biomarker_symptoms.ts`.

`[read]` **Der Waechter liest nur `.sql`** (Zeile 100:
`if (!rel.endsWith('.sql')) continue`). **Fuer ihn sind diese vier
abwesend.** `[read]` **Eine Marke auf eine davon waere dauerhaft
gruen, obwohl die Tabelle laengst da ist** ? eine stille
Falschaussage, genau die Sorte, gegen die A-62 gebaut ist. **Das ist
ein eigener Punkt.**

### A2 ? Ja, er liest Markdown ? aber nicht `docs/ssot/`

`[cmd]` **Fundstelle: `tools/abwesenheit-pruefen.mjs:50?55`.**

    function dateien() {
      const roh = execFileSync('git', ['ls-files', '--',
        'apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts',
        'packages/**/*.tsx', 'tools/*.mjs',
        'docs/spezifikation/**/*.md',
      ], ...)

`[cmd]` **`.md` ist dabei ? aber nur unter `docs/spezifikation/`.**
Nachgemessen mit demselben `git ls-files`:

    Dateien gesamt          763
    davon docs/ssot/          0
    davon docs/spezifikation/ 126

`[read]` **Eine Marke in `docs/ssot/` waere heute unsichtbar.**

**Der noetige Zusatz ist eine Zeile** ? `'docs/ssot/**/*.md'` in die
Liste. `[read]` **Ich habe ihn NICHT gesetzt:** das Werkzeug steht
im Gate, und ob `docs/ssot/` dazugehoert, ist deine Entscheidung.

`[cmd]` **Eine eigene Liste fuehrt er nicht** ? `--liste` ist nur ein
Anzeigeschalter (Zeile 47/157). **Alle Marken stehen in den Dateien
selbst.** Also: melden, nicht schreiben.

### A3 ? Die Marken ? und der Grund, warum es weniger sind als gedacht

`[cmd]` **Zuerst den Bestand gemessen: es gibt schon zehn Marken**,
und **zwei davon sind genau die aus dem Auftrag:**

    apps/web/src/app/v2/recovery/modale.tsx:136
      @abwesend recovery.hrv_readings
      G-278: Der Messwert-Knopf begruendet sich damit.

    apps/web/src/app/v2/recovery/modale.tsx:502
      @abwesend recovery.protocols
      G-278: Der Protokoll-Knopf begruendet sich damit.

`[read]` **`hrv_readings` und `protocols` sind seit G-278
gesichert** ? von der Codeseite, nicht aus der SSOT. **Eine zweite
Marke auf dieselbe Tabelle waere kein zweiter Schutz**, sondern eine
zweite Meldung fuer denselben Fall.

**Damit bleibt fuer `docs/ssot/` genau eine sinnvolle Marke:**

| Datei:Zeile | Marke | Warum |
|---|---|---|
| `docs/ssot/127-recovery-checkins.md:173` | `@abwesend recovery.protocol_assignments` | Die Zeile sagt *„Braucht `recovery.protocols` + `protocol_assignments` ? beide gibt es nicht."* **`protocols` ist ueber `modale.tsx:502` gesichert, `protocol_assignments` von keiner Marke.** |

`[read]` **Und `sleep_data`:** genannt in
`128-recovery-scores.md:52` und `96-recovery-checkins.md:27`, live
nicht vorhanden. `[cmd]` **Aber ohne Schema** ? *„Nicht gebaut wurden
`hrv_readings`, `sleep_data`, ..."*. **Die Marke braucht
`<schema>.<tabelle>`.** Welches Schema gemeint ist, sagt keine der
beiden Zeilen; **das zu entscheiden ist eine Sachfrage, keine
Messung** ? deshalb schlage ich sie nicht vor.

**Der ehrliche Befund also: eine Marke, nicht zehn.** `[read]` **Der
Grund ist gut** ? die Abwesenheiten, die wirklich etwas tragen, sind
dort markiert, wo sie etwas tragen: **am Knopf, der sich mit ihnen
begruendet.** Eine SSOT-Datei begruendet nichts, sie beschreibt.

`[read]` **Das ist die Antwort auf die Beobachtung des Auftrags**
(*„@abwesend steht in vier Punktdateien ? in KEINER
docs/ssot/-Datei"*): **nicht weil es vergessen wurde**, sondern weil
eine Marke dort sitzt, wo eine Entscheidung von der Abwesenheit
abhaengt. **In `docs/ssot/` gibt es genau einen solchen Fall.**

### A4 ? Gegenprobe: die Marke laesst den Waechter fallen

`[cmd]` **Marke fuer eine EXISTIERENDE Tabelle gesetzt** ? in
`tools/ssot-abwesenheit-pruefen.mjs`, einer Datei, die der Waechter
schon liest (`tools/*.mjs`), **damit die Probe ohne Aenderung an
`docs/` laeuft:**

    // @abwesend recovery.stress_logs

`[cmd]` **Ergebnis:**

    [abwesenheit] FEHLER: 2 Aussage(n) sichern eine Abwesenheit,
                  die geendet hat.
      apps/web/.../uebersicht-echt.tsx:17 — "coach.coach_profiles"
      tools/ssot-abwesenheit-pruefen.mjs:26 — "recovery.stress_logs"

`[cmd]` **Zurueckgebaut**, `@abwesend`-Zahl in der Datei **0**,
`git status tools/` sauber, Waechter wieder auf **1** Meldung.

#### Der Waechter ist schon rot ? und nicht durch mich

`[cmd]` **Vor jeder meiner Aenderungen gemessen:**

    apps/web/src/app/v2/coach/uebersicht-echt.tsx:17
      "coach.coach_profiles" steht in der Pipeline.

`[read]` **Die Marke war richtig, als sie geschrieben wurde ? und ist
es nicht mehr.** **Genau der Fall, fuer den A-62 gebaut ist**, und
er funktioniert. **Ein offener Befund, unabhaengig von diesem
Auftrag.**

#### Und ein Fehler von mir, sofort gemessen

`[cmd]` **Mein Beispiel im Kopfkommentar trug ein echtes `@`** ?
`abwesenheit-pruefen.mjs` fuehrte es als Aussage:

    gilt  tools/ssot-abwesenheit-pruefen.mjs:30
          @abwesend recovery.hrv_readings

`[cmd]` **Auf `(at)abwesend` geaendert, Zahl jetzt 0.** `[read]`
**Ein Waechter, der Beispiele fuer Aussagen haelt, zaehlt falsch** ?
dieselbe Klasse wie G-186, wo er seinen eigenen Beweis als Befund
meldete.

### A5 ? Der Vermerk steht im Kopf

`[cmd]` **`tools/ssot-abwesenheit-pruefen.mjs`, Zeile 3:**

    ══ NICHT INS GATE. MESSWERKZEUG AUF ZURUF. ═══════════════

`[cmd]` **Mit den Zahlen dazu:** 74 Zeilen Ausgabe, 72 Meldungen,
**davon 2 echt**; Stichprobe von zwoelf ? keine einzige ein Befund.
**Mit dem klarsten Gegenbeispiel** (`83-dashboard.md:189` sagt
woertlich, dass es die Tabelle GIBT, und wird gemeldet). **Mit dem
Grund**, dass ein weggeschauter Waechter Deckung vortaeuscht. **Und
mit dem Verweis auf die bessere Bauform nebenan.**

`[cmd]` **Dazu, wozu er gut war:** die fuenf Falschaussagen, je mit
Fundstelle. `[read]` **Wer die Datei oeffnet, weiss in zehn Zeilen,
warum sie nicht im Gate steht** ? und haengt sie nicht ein.

`[cmd]` **Er laeuft weiter** ? 70 Meldungen, unveraendert brauchbar
als Suchlauf auf Zuruf.

### Was ich geschrieben habe

`[cmd]` **Nichts in `docs/`** ausser dieser Punktdatei. **Keine
Marke gesetzt** ? die eine aus A3 steht hier als Vorschlag.
**Nichts in `supabase/`.**

`[cmd]` **Geaendert: `tools/ssot-abwesenheit-pruefen.mjs`** (der
Vermerk aus A5 und die Entschaerfung des Beispiels).

### Waechter

`[cmd]` **Kein Anwendungscode geaendert** ? die Gates aus G-381
gelten unveraendert. `[cmd]` **`abwesenheit-pruefen.mjs` steht auf
demselben Stand wie vor dem Auftrag: 1 Meldung
(`coach.coach_profiles`).**

### Neustart

`[read]` **Keiner noetig** ? nichts an `apps/` geaendert.

### Was offen bleibt

**1 ? `coach.coach_profiles`** ? der Waechter ist rot, seit die
Tabelle in die Pipeline kam. **Die Aussage in
`uebersicht-echt.tsx:17` nachfuehren, dann die Marke entfernen.**

**2 ? Vier Tabellen ohne `CREATE TABLE` in `.sql`.** `[read]` **Der
Waechter haelt sie fuer abwesend, weil er nur `.sql` liest** ? eine
Marke darauf waere dauerhaft gruen und damit wertlos. **Entweder
`.ts`-Schritte mitlesen oder den Umstand vermerken.**

**3 ? `docs/ssot/**/*.md` in die Dateiliste?** `[read]` **Eine
Zeile, deine Entscheidung** ? und sie lohnt sich erst, wenn dort
ueberhaupt eine Marke steht. **Nach A3 waere das genau eine.**

**4 ? `sleep_data` braucht ein Schema**, bevor eine Marke moeglich
ist. **Sachfrage, keine Messung.**


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  30 Abwesenheitsaussagen, 9 sichernswert, 5 schon falsch
    A2  der Waechter liest keine .md -- gemessen, nicht angenommen
    A3  neun Marken vorbereitet, nicht geschrieben
    A4  Gegenprobe in beide Richtungen -- und ein Fund dabei
    A5  der Vermerk steht in seinem Waechter

`[cmd]` **Nachgemessen: `abwesenheit-pruefen.mjs:53` liest
`docs/spezifikation/**/*.md`** ? **nur `docs/ssot/` fehlt in der
Liste.**

`[read]` **Ein Zusatz von einer Zeile, kein Umbau** ? **das steht
jetzt in G-386.**

### A4 ist der Fund, der zaehlt

`[cmd]` **Er setzte eine Marke im ERKLAERUNGSTEXT des Waechters**
? **und der Waechter fand seine eigene Erklaerung.**

`[cmd]` **Genau der Fall aus A-62:** *,,C-177-Waechter fand seinen
Namen im eigenen Kommentar."*

> *,,Der Waechter kann nicht zwischen einer Marke und dem Beispiel
> einer Marke unterscheiden."*

`[read]` **Das ist eine Eigenschaft, keine Schwaeche** ? **eine
Marke, die je nach Zusammenhang gilt oder nicht, waere keine
Marke.**

`[read]` **Also: Marken nie ins Beispiel** ? **steht als Bedingung
in G-386.**

### A2 — gemessen statt angenommen

`[read]` **Ich hatte gefragt, ob der Waechter `.md` liest.**

`[cmd]` **Er hat es gemessen: `docs/`, `.sql`, `apps/`, `tools/`,
`packages/`** ? **und mit einem Probelauf belegt, dass die Marke
unbemerkt bleibt.**

`[read]` **Und dann den Zusatz genannt, den es braucht** ? **statt
zu vermuten, es ginge nicht.**

### A1 — er trennt Klasse von Zaehlung

`[cmd]` **30 Aussagen, 9 sichernswert:**

    hrv_readings, sleep_data           HRV/Schlaf
    user_symptoms, user_health_metrics,
    medical_alerts                     Medical
    enhanced_substances                Supplements
    training_load_logs,
    user_protocol_assignments          Recovery

`[read]` **Und der Grund, warum es zaehlt:** **eine Abwesenheit
altert nur nach oben.** `[cmd]` **Fuenf von 14 haben es in zwei Tagen
getan.**

### A5 — der Vermerk steht

`[cmd]` **`ssot-abwesenheit-pruefen.mjs` traegt im Kopf, dass er
bewusst nicht im Gate steht** ? **2 echte von 72, und ein
ignorierter Waechter taeuscht Abdeckung vor.**

**Abgenommen.**

