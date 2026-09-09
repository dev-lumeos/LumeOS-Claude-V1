---
nr: G-382
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-381
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: c7d1085b
beruehrt:
  dateien:
    - tools/ssot-nachtragen.mjs
zahlen:
  gemessen: 2026-09-08
  geprueft: 156
  falsche_bezeichner: 5
---

# G-382 — fuenf SSOT-Dateien inhaltlich pruefen

## Befund

Aus G-381, Claude Code, 2026-09-08.

`[cmd]` **156 Dateien geprueft, 32 Verdachtsfaelle, nach Einordnung
5 echte:**

    10-workspace.md
    30-datenbank.md
    32-encoding-schaeden.md
    83-dashboard.md
    140-supplements-restliche-tabs.md

`[read]` **Und seine Einschraenkung ist die richtige:**

> *,,Die Zahl 5 ist eine untere Schranke ? die Methode findet nur
> falsche Bezeichner, nicht inhaltlich veraltete Aussagen."*

`[cmd]` **A-74 hat gemessen: 112 Commits seit dem letzten
Nachtrag** ? **`00-ABGENOMMEN.md` traegt jetzt 326 Punkte,
erzeugt.**

`[read]` **Aber die Beschreibung des Ist-Zustands je Modul ist
Handarbeit.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die fuenf Dateien

`[read]` **Je Datei: was steht drin, was heute nicht mehr
stimmt?**

`[read]` **Nicht umschreiben** ? **melden, mit Satz und Messung.**

`[cmd]` **`docs/` gehoert dem Orchestrator.**

### 2 · Und die Module, die sich stark veraendert haben

`[cmd]` **`recovery`, `medical`, `supplements`, `goals` und
`nutrition` haben in zwei Tagen neue Tabellen und Schreibwege
bekommen** (C-421, C-423, C-429, C-431, C-432).

`[read]` **Miss je Modul: nennt die SSOT die neuen Tabellen?**

`[cmd]` **`00-ABGENOMMEN.md` sagt, was abgenommen wurde** ? **die
Moduldateien sagen, was gebaut IST.**

`[read]` **Melde die Luecke je Modul, in einem Satz.**

### 3 · Und ein Vorschlag

`[read]` **Du hast zweimal gemessen, was 156 Dateien tragen.**

`[read]` **Laesst sich ein Teil davon erzeugen?** `[cmd]`
**`00-ABGENOMMEN.md` wird erzeugt** ? **eine Modultabelle mit
Spalten und Zeilen liesse sich genauso ableiten.**

`[read]` **Miss, was erzeugbar waere und was Handarbeit bleibt** ?
**nicht bauen.**

### Abnahmebedingungen

    A1  je der fuenf Dateien: was stimmt nicht, ein Satz mit
        Messung. Zahl: 5 / davon belegt.
    A2  je Modul: nennt die SSOT die neuen Tabellen?
        Zahl: 5 Module / davon vollstaendig.
    A3  was ist erzeugbar, was bleibt Handarbeit. Mit Aufwand.
    A4  keine Datei in `docs/` geaendert. Belegt.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-434.**
**In `backup/` loescht niemand ausser Tom** ?
`backup/g381-w2.sicherung` **bleibt liegen.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 ? Die fuenf Dateien: 5 geprueft, 5 belegt

**Je Datei ein Merkmal, gemessen ? nicht umgeschrieben.**

#### `10-workspace.md` ? die Kernzahl ist um Faktor 205 daneben

`[cmd]` **Die Datei sagt** (Zeile 36?39): *„seit M1 Teil C
ueberholt: 2026-08-04 genau **ein** Import ?
`apps/web/src/lib/nutrition/nutrition-db.ts:11`
`import { createServiceClient } from '@lumeos/shared'`."*

`[cmd]` **Heute gemessen:**

    @lumeos/*-Importe in apps/web/src   205 Dateien
    createServiceClient in apps/web     0 Treffer
    nutrition-db.ts                     weg

`[read]` **Die Aussage ist in beide Richtungen falsch:** aus *einem*
Import sind **205** geworden, und ausgerechnet **der eine genannte
gibt es nicht mehr** ? weder die Datei noch der Service-Client in
`apps/web`.

`[cmd]` **Zusaetzlich die Tabelle oben:** `apps/web` mit **51**
Dateien ? **gemessen 507** `.ts`/`.tsx`.

#### `30-datenbank.md` ? die Tabellen stimmen, der Code dazu ist weg

`[cmd]` **Die Datei sagt:** *„`food_curation_candidates` (12 Spalten)
und `food_curation_decisions` (6 Spalten) existieren im Container,
beide leer"* ? und nennt
`apps/web/src/lib/nutrition/curation.ts:156` mit
`buildNutritionCurationPersistenceSql()`.

`[cmd]` **Gemessen ? der erste Teil stimmt genau:**

    food_curation_candidates   12 Spalten
    food_curation_decisions     6 Spalten

`[cmd]` **Der zweite Teil nicht:** `curation.ts` gibt es nicht mehr,
und `buildNutritionCurationPersistenceSql` hat **0 Treffer** in
`apps/web/src` und `packages`.

`[read]` **Das ist die interessantere Haelfte der Datei:** die
Aussage ueber die Datenbank hat ein Jahr ueberlebt, die Aussage
ueber den Code nicht. **Wer die Datei liest, findet zwei richtige
Spaltenzahlen neben einer toten Fundstelle** ? und hat keinen Grund,
der einen mehr zu glauben als der anderen.

#### `32-encoding-schaeden.md` ? meldet einen Schaden, den es nicht mehr gibt

`[cmd]` **Die Datei sagt** unter der Ueberschrift *„Bestaetigter
Schaden"*: zwei Stellen in
`supabase/migrations/20240522_002_nutrition_food_core_tables.sql`,
Zeilen 396 und 399 ? `k?se` und `n?sse`, literales ASCII `?` (0x3F),
in Regex-Alternationen der Funktion `nutrition.auto_tag_food()`.

`[cmd]` **Gemessen:**

    die Migration                weg
    pg_proc: auto_tag_food       existiert NICHT
    'k?se' / 'n?sse' im Rumpf    kein Rumpf vorhanden

`[read]` **Der Schaden ist behoben, indem Datei und Funktion
verschwunden sind** ? aber die SSOT meldet ihn weiter als
*bestaetigt*. `[read]` **Das ist die schaedlichste Form:** ein
Vermerk, der zu einer Suche auffordert, die ins Leere laeuft.

#### `83-dashboard.md` ? die Architektur ist eine andere

`[cmd]` **Die Datei sagt:** `app/v2/page.tsx` sei die
*„Server-Komponente, liest fuenf Quellen, jede in eigenem `try`"*,
und `app/v2/dashboard.tsx` die *„reine Anzeige, kein I/O"*.

`[cmd]` **Gemessen:**

    v2/page.tsx        10 Zeilen, nur `redirect('/v2/dashboard')`
                       Lesequellen: 0
    v2/dashboard.tsx   weg
    v2/dashboard/      5 Dateien (page, dashboard-echt,
                       aktivitaetsstrom, entwurf, entwurf-rest)

`[read]` **Beide Zeilen der Tabelle sind falsch**, und zwar nicht im
Detail, sondern in der Sache: **das Dashboard ist von einer Datei in
ein Verzeichnis gewandert.**

`[cmd]` **Nicht falsch ist der Satz darunter:** *„Entfallen ist
`akzent-probe.tsx`"* ? **die Datei ist tatsaechlich weg, die Aussage
ist erfuellt.** `[read]` **Mein Sucher in G-381 hatte sie als
fehlenden Pfad gemeldet** ? derselbe Fehler wie bei
`113-ui-reste.md`: **nach dem Namen gesucht statt nach der Aussage.**

#### `140-supplements-restliche-tabs.md` ? nennt zwei Dateien als „neu", die es nicht gibt

`[cmd]` **Die Datei fuehrt unter „Geaendert":**
`supplements/tab-katalog-echt.tsx` (*„neu ? der angebundene
Catalog-Tab"*) und `supplements/__tests__/katalog-echt.test.ts`
(*„neu ? 7 Pruefungen"*).

`[cmd]` **Gemessen:**

    tab-katalog-echt.tsx      WEG
    katalog-echt.test.ts      WEG
    substanz-detail.tsx       DA   <- in d019b793 daraus geteilt
    substanz-tafel.tsx        DA

`[cmd]` **Im `__tests__`-Ordner liegen heute vier Dateien**, keine
davon heisst `katalog-echt`.

`[read]` **„Neu" ist die Zeitform, die am schnellsten altert.** Der
Commit `d019b793` hat den Tab bewusst geteilt ? **die SSOT
beschreibt den Zustand davor.**

**Zahl: 5 geprueft / 5 belegt.**

### A2 ? Die neuen Tabellen: 0 von 3 Modulen vollstaendig

`[cmd]` **Zuerst gemessen, welche Tabellen ueberhaupt neu sind** ?
aus den Migrationen, nicht aus den Auftragsnummern (C-423 und C-431
haben gar keine eigene Migration):

    C-421  recovery.overtraining_alerts, recovery_protocols,
           stress_logs, score_contributions
    C-429  medical.appointments, medical.health_events
    (C-366/C-396)  nutrition.food_tags_kuriert, meal_plan_slots

`[cmd]` **Alle sechs der ersten beiden existieren**, mit Spalten:

    medical.appointments          12
    medical.health_events         13
    recovery.overtraining_alerts  11
    recovery.recovery_protocols   12
    recovery.score_contributions  11
    recovery.stress_logs          12

`[cmd]` **Gesucht in allen 156 Dateien ausser `00-ABGENOMMEN.md`**
(das sagt, was abgenommen wurde ? die Moduldateien sagen, was gebaut
ist):

| Modul | neue Tabellen | genannt | fehlt |
|---|---|---|---|
| recovery | 4 | 2 | `stress_logs`, `score_contributions` |
| medical | 2 | **0** | `appointments`, `health_events` |
| nutrition | 2 | **0** | `food_tags_kuriert`, `meal_plan_slots` |
| supplements | 0 | ? | ? (keine neue Tabelle in diesen Auftraegen) |
| goals | 0 | ? | ? (dito ? C-432 aendert eine Funktion) |

**Zahl: 5 Module geprueft / 3 mit neuen Tabellen / davon 0
vollstaendig.**

`[cmd]` **Und die zwei recovery-Treffer sind KEINE Deckung, sondern
Falschaussagen:**

    128-recovery-scores.md:52
      „Nicht gebaut wurden `hrv_readings`, `sleep_data`,
       `overtraining_alerts` und ..."
    96-recovery-checkins.md:27
      „Nicht uebernommen wurden `recovery_scores`,
       `hrv_measurements`, ... `recovery_protocols`"

`[read]` **Beide Dateien nennen die Tabelle, um ihre ABWESENHEIT zu
behaupten** ? und beide gibt es heute, mit 11 bzw. 12 Spalten.
`[read]` **Das ist schlimmer als eine Luecke:** eine fehlende
Erwaehnung laesst jemanden nachsehen, **eine behauptete Abwesenheit
haelt ihn davon ab** (die Lehre aus dem Vermerk mit falschem Grund).

`[cmd]` **Eichung der Suche:** eine alte, sicher genannte Tabelle
(`lab_reports`) wird gefunden ? **die Suche kommt an.** **Die sechs
neuen liefern ueber alle 156 Dateien null Treffer**, ausser den zwei
Abwesenheitsbehauptungen.

### A3 ? Was erzeugbar waere, was Handarbeit bleibt

`[cmd]` **Der Umfang:** 156 Dateien, **39.224 Zeilen**. `[cmd]`
**Davon tragen 39 eine Tabellen- oder Spaltenaufzaehlung**, und
**58 sind Auftragsschnappschuesse** (Kopf mit `**Stand:**` oder
`**Auftrag:**`).

`[read]` **Das Vorbild steht schon da:** `tools/ssot-nachtragen.mjs`,
**85 Zeilen**, erzeugt `00-ABGENOMMEN.md` mit 326 Punkten aus
`docs/punkte/erledigt/`.

#### Erzeugbar ? eine Abfrage genuegt

| Was | Woher | Aufwand |
|---|---|---|
| Tabellen je Modulschema, mit Spaltenzahl | `information_schema` ? **eine** Abfrage liefert alle 7 Schemata: 167 Tabellen, 2.340 Spalten | **~1 h** ? Abfrage steht, Ausgabe wie `ssot-nachtragen.mjs` |
| Spaltenliste je Tabelle, mit Typ und `NOT NULL` | `information_schema.columns` | im selben Lauf |
| Zeilenzahlen je Tabelle und Konto | `count(*)`, gruppiert | im selben Lauf, **Stichtag und Nutzer mitschreiben** |
| CHECK-Werte (Auswahllisten) | `pg_constraint` | +1 h ? loest zugleich die wiederkehrende Frage nach erlaubten Werten |
| Neue Tabellen seit Datum X | Migrationen nach Dateinamen + `information_schema` | +1 h ? **haette genau diesen Auftrag beantwortet** |

`[read]` **Zusammen etwa ein halber Tag** ? und danach ist die Frage
„nennt die SSOT die neuen Tabellen?" **keine Messung mehr, sondern
ein Lauf.**

#### Handarbeit ? und warum

| Was | Warum es nicht erzeugbar ist |
|---|---|
| **Warum** etwas so gebaut ist | Steht nirgends in der Datenbank. Genau das ist der Wert der Lehren. |
| Was **nicht** gebaut wurde, und weshalb | Eine Abwesenheit hat keine Zeile. **Und gerade hier entstehen die Falschaussagen** (A2). |
| Attrappe / angebunden / verworfen | E-70, drei Zustaende ? eine Entscheidung, kein Messwert. |
| Auftragsschnappschuesse (58 Dateien) | Sie beschreiben einen **Zeitpunkt**. Sie altern nicht, sie sind Protokoll ? **sie duerfen nicht nachgezogen werden.** |
| Der Ist-Zustand je Modul in Prosa | Das ist die eigentliche SSOT. Sie kann eine **Grundlage** bekommen, keinen Ersatz. |

#### Eine gemessene Warnung zum Bauen

`[cmd]` **Ein Erzeuger, der Lese- und Schreibwege ueber Dateinamen
zaehlt, meldet fuer `goals` null Lesewege** ? weil `goals` seine
Dateien `lesen.ts` und `schreiben.ts` nennt, nicht `*-read.ts`:

    recovery     2 Lesewege, 1 Schreibweg
    medical      2 Lesewege, 2 Schreibwege
    supplements  3 Lesewege, 1 Schreibweg
    goals        0 Lesewege, 1 Schreibweg   <- falsch
    nutrition    6 Lesewege, 6 Schreibwege

`[read]` **Eine erzeugte Zahl sieht genauso aus wie eine gemessene**
? nur dass niemand sie mehr nachprueft. **Was ueber Dateinamen geht,
erbt jede Namensabweichung als stille Null.** `[read]` **Deshalb:
nur erzeugen, was aus der DATENBANK kommt** ? dort ist der Name der
Tabelle die Sache selbst, nicht eine Konvention.

**Nicht gebaut** ? der Auftrag sagt messen.

### A4 ? Keine Datei in `docs/` geaendert

`[cmd]` **`git status --short docs/` vor dem Bericht: leer.**
`[cmd]` **`docs/ssot/`: 0 Aenderungen.**

`[read]` **Die einzige Datei unter `docs/`, die dieser Auftrag
anfasst, ist diese Punktdatei** ? und auch nur ihr Abschnitt
`## Bericht`, wie vorgesehen. **Keine der fuenf SSOT-Dateien ist
umgeschrieben**, keine Zahl darin berichtigt.

### Waechter

`[read]` **Dieser Auftrag hat nichts gebaut** ? kein Code, keine
Migration, kein Test. **Die Gates von G-381 gelten unveraendert:**
1510 Tests, tsc und lint sauber.

`[cmd]` **`encoding-pruefen.mjs`** nach dem Schreiben des Berichts:
siehe unten.

### Neustart

`[read]` **Keiner noetig** ? nichts an der Anwendung geaendert.

### Was das zusammen bedeutet

`[read]` **Die fuenf Dateien aus A1 sind nicht das Problem, sie sind
das Symptom.** **A2 zeigt den Umfang:** von sechs Tabellen, die in
zwei Tagen entstanden sind, **nennt die SSOT keine einzige** ? und
zwei davon behauptet sie ausdruecklich als *nicht gebaut*.

`[read]` **A-74 ist nicht behoben, sondern verschoben:**
`00-ABGENOMMEN.md` traegt jetzt 326 Punkte, **aber die Frage „was
ist gebaut" beantwortet es nicht.** `[read]` **A3 sagt, wo die
Grenze liegt:** die Struktur ist erzeugbar, **die Begruendung nie**
? und die Begruendung ist der Teil, der die SSOT wertvoll macht.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  5 geprueft, 5 belegt -- je eine gemessene Falschaussage
    A2  5 Module, 3 mit neuen Tabellen, 0 vollstaendig
    A3  erzeugbar getrennt von Handarbeit, mit Aufwand
    A4  docs/ssot/ unveraendert

### A2 ist die wichtigste Messung

`[cmd]` **Von sechs Tabellen aus zwei Tagen nennt die SSOT keine.**

`[cmd]` **Und zwei behauptet sie als nicht gebaut:**

    128-recovery-scores.md:52   `[cmd]` Nicht gebaut wurden ...
                                `overtraining_alerts`
    96-recovery-checkins.md:27  [read] Nicht uebernommen wurden ...
                                `recovery_protocols`

`[cmd]` **Selbst nachgemessen: beide existieren.**

`[read]` **Die erste Zeile ist die schlimmere** ? **sie traegt
einen `[cmd]`-Marker.** `[read]` **Ein gemessener Beleg, der heute
falsch ist, und die Marke sagt, man duerfe sich darauf
verlassen.**

### Und sein Satz ist die Lehre

> *,,Eine fehlende Erwaehnung laedt zum Nachsehen ein; eine
> behauptete Abwesenheit haelt davon ab."*

`[read]` **Der Suchlauf findet den Namen und haelt die Datei fuer
abgedeckt** ? **die Falschaussage verhindert ihre eigene
Entdeckung.**

`[cmd]` **Und sein Suchlauf ist geeicht:** `lab_reports` **kommt
durch, die sechs neuen liefern nichts.**

### A1 — je eine Messung, nicht je ein Eindruck

`[cmd]` **`10-workspace.md`:** *,,genau ein `@lumeos/*`-Import"* ?
**205 Dateien, und die genannte ist weg.**

`[cmd]` **`30-datenbank.md`:** **zwei richtige Spaltenzahlen neben
einer toten Fundstelle** ? **und nichts sagt dem Leser, welcher
Haelfte er trauen soll.**

`[cmd]` **`32-encoding-schaeden.md`:** **ein *bestaetigter Schaden*,
dessen Funktion es nicht mehr gibt** ? **eine Notiz, die jemanden
nach nichts suchen schickt.**

`[cmd]` **`83-dashboard.md`:** **`v2/page.tsx` ist eine
10-Zeilen-Weiterleitung mit 0 Lesequellen, dokumentiert sind
fuenf.**

`[read]` **Und er nennt seinen eigenen Fehlalarm aus G-381 mit** ?
**der `akzent-probe.tsx`-Satz war richtig.**

### A3 — die Warnung ist die Bauvorschrift

> *,,Ein Erzeuger, der nach Dateinamen zaehlt, meldet fuer `goals`
> null Lesewege, weil `goals` `lesen.ts` heisst statt
> `*-read.ts`."*

`[read]` **Eine erzeugte Zahl sieht aus wie eine gemessene ? minus
jemand, der sie nachprueft.**

`[cmd]` **Selbst gemessen: 7 Schemas, 178 Tabellen, 2.513
Spalten** ? **mehr als seine 167/2.340, die Zahl waechst
taeglich.**

`[read]` **Genau deshalb erzeugen statt schreiben.**

### Und was Handarbeit bleibt, ist richtig getrennt

`[read]` **Eine Abwesenheit hat keine Zeile** ? **und genau da
kamen die zwei Falschaussagen her.**

`[cmd]` **Die 58 datierten Auftragsschnappschuesse sind Protokoll**
? **sie duerfen nicht nachgezogen werden.**

`[read]` **Sein Schlusssatz trifft:** *,,A-74 ist nicht behoben,
sondern verschoben ? `00-ABGENOMMEN.md` traegt 326 Punkte und
beantwortet weiter nicht, was gebaut ist."*

**Abgenommen.**

