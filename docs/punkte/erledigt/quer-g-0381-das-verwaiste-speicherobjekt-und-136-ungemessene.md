---
nr: G-381
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-380
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 2f107963
beruehrt:
  dateien:
    - apps/web/src/lib/medical/dokumente-write.ts
zahlen:
  gemessen: 2026-09-08
  objekte: 3
  ssot_geprueft: 21
  ssot_ungemessen: 135
---

# G-381 — das verwaiste Speicherobjekt und 135 ungemessene Dateien

## Befund 1 — ein Objekt ohne Zeile

Aus G-380, Claude Code, 2026-09-08.

`[cmd]` **Der A4-Nachweis liess ein Objekt zurueck** ? **die
Buehne wurde abgeraeumt, `lab_reports` steht wieder bei 2, das
Objekt bei 3.**

`[cmd]` **Direktes DELETE ist durch `storage.protect_delete`
gesperrt.** `[cmd]` **Der Dienstschluessel ist seit 2026-08-03
absichtlich entfernt.** `[cmd]` **Und die Anwendung hat keinen
Loeschweg** ? `rg` **findet kein `.remove(`.**

`[read]` **Er hat aufgehoert, statt einen zu bauen** ? richtig.

> *,,Ein Original zu loeschen ist eine Entscheidung mit Gewicht."*

## Befund 2 — die Zahl 3 ist eine untere Schranke

`[cmd]` **21 von 156 SSOT-Dateien geprueft, 3 ueberholt.**

`[read]` **Seine eigene Einschraenkung:** *,,Die Methode faengt nur
Dokumente mit einem falsifizierbaren Merkmal. Eine Datei kann
inhaltlich ueberholt sein, waehrend jeder Name noch stimmt."*

`[cmd]` **135 Dateien sind ungemessen.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Ein Loeschweg fuer Originale

`[read]` **Nicht das eine Objekt entfernen** ? **den Weg bauen,
den ein Nutzer braucht.**

`[cmd]` **`E-75`: der Bucket ist privat, `owner_id = auth.uid()`.**
`[cmd]` **`storage.protect_delete` sperrt heute jedes DELETE.**

`[read]` **Miss zuerst, was `protect_delete` genau tut** ? **und
ob es einen bewussten Weg vorsieht oder alles sperrt.**

`[read]` **Ein Nutzer muss sein Dokument entfernen koennen** ?
**sonst ist der Bucket eine Falle: hochladen ja, zuruecknehmen
nie.**

`[cmd]` **Und `file_ref` muss mit** ? **ein Verweis auf ein
geloeschtes Objekt ist schlimmer als keiner.**

### 2 · Die restlichen 135 SSOT-Dateien

`[read]` **Deine Methode faengt falsifizierbare Merkmale** ?
**Dateinamen, Funktionsnamen, Spalten.**

`[read]` **Lauf sie ueber alle 156** ? **die 21 waren eine Stichprobe,
keine Auswahl.**

`[cmd]` **Und melde je Datei EIN Merkmal, das nicht mehr stimmt** ?
**nicht den ganzen Inhalt bewerten.**

`[read]` **Was danach bleibt, ist inhaltlich zu pruefen** ? **das
ist Handarbeit und ein eigener Punkt.**

### Abnahmebedingungen

    A1  protect_delete: was sperrt es genau? Fundstelle.
    A2  ein Loeschweg, oder der Nachweis, dass er nicht gebaut
        werden darf.
    A3  ein Original geloescht und file_ref geleert.
        Zahl: objects vorher/nachher.
    A4  156 SSOT-Dateien geprueft. Zahl: geprueft / mit
        falschem Merkmal, je mit einem Satz.
    A5  das verwaiste Objekt: weg oder benannt geblieben.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-434.**
**Kein Dienstschluessel** ? **er ist absichtlich weg.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

`[read]` **Und sag, wenn deine Aenderung einen Neustart braucht.**

## Bericht

### A1 ? Was `protect_delete` genau sperrt

`[cmd]` **Fundstelle: `pg_proc.prosrc`, Funktion
`storage.protect_delete`.** Der ganze Rumpf:

    IF COALESCE(current_setting('storage.allow_delete_query', true),
                'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not
                         allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from
                          orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;

`[cmd]` **Sie haengt an zwei Triggern**, beide
`BEFORE DELETE ... FOR EACH STATEMENT`:

    storage.objects   protect_objects_delete
    storage.buckets   protect_buckets_delete

`[read]` **Sie sperrt NICHT alles.** **Sie prueft eine
Sitzungseinstellung** ? `storage.allow_delete_query`. Die Storage-API
setzt sie, alles andere faellt durch. `[read]` **Der Trigger richtet
sich gegen das direkte `DELETE` per SQL, nicht gegen einen gebauten
Weg** ? der Hinweis sagt es selbst: *„Use the Storage API instead."*

`[read]` **Meine Formulierung in G-380 war zu grob.** Ich schrieb
*„direktes `DELETE` gesperrt"* und liess offen, ob es einen Weg gibt.
**Es gibt einen, und er war vorgesehen.**

### A2 ? Der Loeschweg, und warum er gebaut werden durfte

`[cmd]` **Die Erlaubnis lag die ganze Zeit da.** In `pg_policies`:

    medical_originals_delete_own | DELETE |
      bucket_id = 'medical-originals'
      AND owner_id = (select auth.uid())::text
      AND (storage.foldername(name))[1] = (select auth.uid())::text

`[read]` **Eine Policy fuer DELETE, seit C-429** ? **sie hatte nur
keinen Aufrufer.** **Das ist A-71**, derselbe Befund wie neunmal
zuvor: der Weg liegt da, ungenutzt, und der Vermerk behauptet, es
gebe ihn nicht.

**Gebaut:**

    lib/medical/dokumente-write.ts   entferneOriginal(berichtId)
    app/v2/medical/dokumente-aktionen.ts   originalEntfernen(berichtId)
    app/v2/medical/tab-verlauf.tsx   Knopf "Entfernen"

`[read]` **Kein Dienstschluessel.** Er ist seit 2026-08-03
absichtlich weg. **Die Sitzung des Nutzers traegt das Recht selbst**
? mehr braucht es nicht, und mehr waere falsch.

**Drei Entscheidungen, die tragen:**

`[cmd]` **1 ? Die Reihenfolge ist umgekehrt zum Ablegen.** Beim
Hochladen zuerst die Datei, dann der Verweis. **Beim Entfernen
zuerst der Verweis, dann die Datei.** `[read]` **Der Grund steht im
Auftrag:** *ein Verweis auf ein geloeschtes Objekt ist schlimmer als
keiner.* Bricht es dazwischen ab, bleibt eine verwaiste Datei ? **die
sieht niemand, und sie schadet nichts.** Andersherum bliebe ein
Verweis ins Leere, **und der zeigt dem Nutzer einen Knopf, der jedes
Mal scheitert.**

`[cmd]` **2 ? Der Pfad kommt aus der eigenen Zeile, nicht vom
Aufrufer.** `entferneOriginal` nimmt nur die `berichtId` entgegen.
`[read]` **Ein Pfad als Parameter waere eine Einladung**, einen
fremden zu nennen.

`[cmd]` **3 ? Zwei Klicks, kein `confirm()`.** Der erste stellt
scharf, der zweite fuehrt aus, „Abbrechen" nimmt zurueck. `[read]`
**`confirm()` ist ein Fenster des Browsers, das die Seite anhaelt** ?
der Zustand steht stattdessen in der Komponente, sichtbar und
verlassbar. **Er haelt die `id` des Befunds, kein `boolean`** ? sonst
stuenden bei mehreren Zeilen alle gleichzeitig scharf.

### A3 ? Ein Original geloescht, `file_ref` geleert

`[cmd]` **Am Schirm, `test-user@lumeos.local`:**

    Oeffnen-Knoepfe    2
    Entfernen-Knoepfe  2
    nach 1. Klick      "Wirklich entfernen"=1  "Abbrechen"=1
    nach Abbrechen     "Wirklich entfernen"=0   <- Gegenprobe
    Fehlermeldung      (keine)
    Oeffnen danach     1
    Datei waehlen      1

`[read]` **Die Gegenprobe gehoert dazu:** „Abbrechen" darf nichts
tun, und tut nichts. **Und die Zeile kippt sichtbar** von „Oeffnen"
auf „Datei waehlen" ? der Knopf folgt dem Zustand.

`[cmd]` **In der Datenbank:**

    storage.objects   3 -> 2
    file_ref von "C-431 Originaldatei"   Pfad -> (leer)

`[read]` **Beide Enden bewegen sich zusammen** ? kein Verweis ins
Leere, kein neues verwaistes Objekt.

### A4 ? 156 SSOT-Dateien geprueft, 5 mit falschem Merkmal

`[cmd]` **Geprueft: 156** (alle). **Verdacht im ersten Durchgang:
32.** **Nach der Einordnung: 5.**

`[read]` **Der Verdacht ist nicht der Befund** ? ein fehlender Pfad
hat drei sehr verschiedene Ursachen, und nur eine ist eine
Falschaussage:

| Gruppe | Nennungen | Was es ist |
|---|---|---|
| FREMD | 12 in 3 Dateien | `apps/app/`, `src/modules/` ? **das Vorgaengerrepo.** Die Datei beschreibt absichtlich etwas anderes. |
| NIE_DA | 29 in 19 Dateien | Kam in der Geschichte dieses Repos **nie** vor ? Wegwerf-Messskripte (`tools/g82-vergleich.mjs`), beilaeufig genannte Namen. |
| ENTFERNT | 11 in 8 Dateien | War da, ist weg ? **nur das ist die Falschaussage.** |

`[cmd]` **Die Entscheidung faellt `git log --all -- <pfad>`**, nicht
mein Eindruck.

**Von den 8 ENTFERNT-Dateien bleiben nach Handpruefung 5:**

| Datei | Das eine Merkmal |
|---|---|
| `10-workspace.md` | Nennt `lib/nutrition/nutrition-db.ts:11` als einzigen `createServiceClient`-Import ? **die Datei ist weg**, und `rg` findet den Import in `lib/nutrition/` nirgends mehr. |
| `30-datenbank.md` | Nennt `lib/nutrition/curation.ts:156` mit `buildNutritionCurationPersistenceSql()` ? **Datei und Funktion gibt es beide nicht mehr.** |
| `32-encoding-schaeden.md` | Fuehrt Encoding-Schaeden in `migrations/20240522_002_nutrition_food_core_tables.sql`, Zeilen 396/399 ? **die Migration ist weg.** |
| `83-dashboard.md` | Tabelle nennt `app/v2/dashboard.tsx` („reine Anzeige, kein I/O") und `app/v2/akzent-probe.tsx` ? **beide weg** (`v2/page.tsx` steht noch). |
| `140-supplements-restliche-tabs.md` | Fuehrt `tab-katalog-echt.tsx` und `__tests__/katalog-echt.test.ts` als **neu** ? in `d019b793` aufgeteilt in `substanz-detail.tsx` und `substanz-tafel.tsx`. |

**Drei aus der ENTFERNT-Gruppe sind KEINE Falschaussage:**

`[cmd]` **`50-governance-rest.md`** listet `tools/package.json` in
einer Tabelle dessen, **was in `_archive/` liegt** ? die Datei soll
nicht im Baum sein.

`[cmd]` **`86-erfassung.md`** schreibt *„`erfassen.tsx` ist
verwaist"* ? **sie ist seither entfernt worden.** Die Aussage ist
**erfuellt**, nicht widerlegt.

`[cmd]` **`113-ui-reste.md`** nennt `coach/bausteine.tsx` und
`coach/ai/bausteine.tsx` ? **in einem Abschnitt mit der Ueberschrift
`GELÖSCHT:`.** `[read]` **Mein Sucher hat den Eintrag gefunden, mit
dem die Datei ihre eigene Loeschung protokolliert.** Genau die Falle,
vor der die Methode warnt: **nach dem Namen gesucht statt nach der
Aussage.**

**Und die vier Aufruf-Verdachte sind alle falsch:**

`[cmd]` **`ladeScores()` in `00-INDEX.md` und `149-dashboard.md`**
steht in einem Satz ueber die Vergangenheit ? *„`ladeScores()` haette
einen Novemberwert als heute gezeigt"*, als Begruendung, warum sie
**nicht** benutzt wurde. **Eine richtige Aussage ueber frueher.**

`[cmd]` **`getComputedStyle()`** (109) ist eine **Browser-**
Schnittstelle in einer Messnotiz. `[cmd]` **`getZielwertVorschlag()`**
(94) und **`getLocalFoodSearch()`** (20) stehen als Kurzform fuer den
Namen der Funktion (`getZielwertVorschlag().bmr` benennt ein
Rueckgabefeld) ? **keine Aussage ueber die Signatur.** Beide
Funktionen gibt es, beide nehmen heute Argumente.

`[read]` **Was bleibt, ist inhaltlich zu pruefen** ? **das ist ein
eigener Punkt.** `[read]` **Und die Zahl 5 ist eine untere
Schranke:** die Methode findet nur, was einen falschen **Bezeichner**
traegt. **Eine Datei kann inhaltlich ueberholt sein, ohne einen
einzigen falschen Namen zu fuehren.**

### A5 ? Das verwaiste Objekt ist weg

`[cmd]` **Ueber den gebauten Weg entfernt, nicht ueber einen
Sonderweg.**

`[read]` **Es hing an keiner Befundzeile** ? die Oberflaeche erreichte
es nicht. **Aber sein Pfad traegt die `report_id`** (E-75:
`<user_id>/<report_id>.pdf`). **Also die Zeile mit genau dieser id
wiederhergestellt, den Knopf gedrueckt, die Zeile wieder entfernt.**

`[cmd]` **Gemessen:**

    storage.objects   3 -> 1
    verwaiste Objekte 1 -> 0
    lab_reports (test-user)   2   (unveraendert)

`[read]` **Das war zugleich die zweite, unabhaengige Probe des
Loeschwegs** ? mit einer anderen Zeile als in A3.

### Waechter

`[cmd]` **tsc `--noEmit`** sauber. `[cmd]` **`next lint`:** *No
ESLint warnings or errors*. `[cmd]` **Tests: 1507 → 1510 pass, 0
fail** (drei neue fuer den Loeschweg). `[cmd]`
**`encoding-pruefen.mjs`: 21.008 Dateien, sauber.**

`[read]` **Die drei neuen Waechter pruefen die REIHENFOLGE**, nicht
ob das Loeschen geht ? **das ist am Schirm gemessen** (A3). **Warum
ein Test und kein Kommentar:** ein Umbau, der die zwei Bloecke
tauscht, faellt sonst niemandem auf. **Beide Wege „funktionieren"**,
nur der eine hinterlaesst den schlimmeren Rest.

**Sabotageprobe, je Waechter einzeln:**

    Datei vor Verweis geloescht      -> not ok 1 (Reihenfolge)
    Pfad kommt vom Aufrufer          -> not ok 2 (Herkunft)
    eine user_id-Schranke entfernt   -> not ok 3 (Zeilenschutz)

`[read]` **Jede Sabotage traf genau einen Waechter**, die uebrigen
zwei blieben gruen. **Zurueckgenommen, wieder 3/3.**

`[cmd]` **Und eine Sabotage doppelt gefahren:** `tsc` bemaengelte
`[...r.matchAll(...)]`; nach der Berichtigung auf `r.match(...)`
**wurde die Probe wiederholt** ? sie ist weiter rot geworden.
`[read]` **Ein berichtigter Waechter kann still aufhoeren zu
messen.**

### Neustart

`[read]` **Keiner noetig.** Geaendert sind nur `apps/web/src` ?
heisses Nachladen. **Nichts in `packages/ui`, keine Konfiguration,
keine neuen Abhaengigkeiten.**

`[cmd]` **Belegt:** die Messungen zu A3 und A5 liefen gegen den
laufenden Server und sahen den neuen Knopf.

### Was offen bleibt

**Die inhaltliche Pruefung der 5 Dateien** (A4) ? **ein eigener
Punkt**, wie im Auftrag vorgesehen. **Nichts in `docs/`
geschrieben.**


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  protect_delete ist eine Weiche, keine Sperre
    A2  der Loeschweg war baubar, die Erlaubnis lag seit C-429 da
    A3  objects 3 -> 2, file_ref geleert
    A4  156 geprueft, 32 Verdacht, nach Einordnung 5 echte
    A5  der Verwaiste ist weg: 3 -> 1, verwaist 0

`[cmd]` **Selbst gemessen: 1 Objekt, 1 Bericht mit Datei** ?
**die Zahlen stimmen ueberein.**

### A1 — er hat seine eigene Formulierung berichtigt

`[cmd]` **`pg_proc.prosrc` gelesen:**

    IF COALESCE(current_setting('storage.allow_delete_query',
                true), 'false') != 'true' THEN
      RAISE EXCEPTION 'Direct deletion from storage tables is not
        allowed. Use the Storage API instead.'

`[read]` **Die Fehlermeldung nennt den vorgesehenen Weg** ? **eine
Sperre gegen direktes SQL, kein Verbot.**

> *,,Meine G-380-Formulierung war zu grob; ein Weg existierte und
> war vorgesehen."*

`[read]` **Er hat *gesperrt* als *unmoeglich* gelesen und einen
Schritt zu frueh aufgehoert** ? **und es selbst gefunden.**

### A2 — die Erlaubnis lag seit C-429 da

`[cmd]` **`medical_originals_delete_own` gibt dem Eigentuemer
DELETE** ? **seit C-429, ohne Aufrufer.**

`[read]` **Elfter Fall von A-71.**

**Und drei tragende Entscheidungen:**

`[read]` **Die Reihenfolge ist umgekehrt zum Hochladen** ? **erst
der Verweis, dann die Datei.** `[read]` **Ein Abbruch hinterlaesst
dann ein unsichtbares Waisenkind statt eines Knopfes, der jedes Mal
scheitert.**

`[read]` **Der Pfad kommt aus der Zeile des Nutzers, nicht vom
Aufrufer** ? **wer den Pfad schickt, koennte einen fremden
schicken.**

`[read]` **Zwei Klicks statt `confirm()`, je Bericht** ? **damit
nicht alle Zeilen gleichzeitig scharf sind.**

### A5 — der Verwaiste ging durch den gebauten Weg

`[cmd]` **Kein Sonderweg:** **der Pfad traegt die Berichtskennung,
also hat er die Zeile wiederhergestellt, den Knopf gedrueckt und
die Zeile wieder entfernt.**

`[read]` **Das war zugleich eine zweite unabhaengige Probe des
Loeschwegs.**

### A4 — die Einordnung war die Arbeit

`[cmd]` **32 Verdachtsfaelle, sortiert nach `git log --all`:**

    FREMD      12  Erwaehnungen des Vorgaengerrepos
    NIE_DA     29  nie in der Geschichte dieses Repos
    ENTFERNT   11  in 8 Dateien

`[cmd]` **Handpruefung der 8 liess 5 uebrig.**

`[read]` **Und der schoenste Fehlalarm:** `113-ui-reste.md` **trug
den eigenen `GELOESCHT:`-Vermerk ueber genau die Loeschung, die der
Scanner suchte.**

`[cmd]` **Alle vier Signatur-Treffer waren ebenfalls falsch** ?
**zwei Vergangenheitsform, eine Browser-Schnittstelle, eine
Kurzform.**

`[read]` **Eine Suche findet Woerter, kein Verstaendnis.**

**Abgenommen.**

