---
nr: G-380
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-378
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 7b8602e5
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  zeilen_neu: 499
  zeilen_echt: 502
---

# G-380 — eine tote Zweitfassung und ein fehlender Hinweis

## Befund 1 — `ansicht.tsx.neu` ist committet

Aus G-378, Claude Code, 2026-09-08, selbst gemeldet.

`[cmd]` **Nachgemessen: `apps/web/src/app/v2/recovery/
ansicht.tsx.neu` ist getrackt, seit `84bb575f`.**

`[cmd]` **499 Zeilen gegen 502 im Original, nicht gleich.**

`[cmd]` **Es ist die einzige `.neu`-Datei im Repo.**

`[read]` **Eine zweite Fassung einer lebenden Datei, ohne
Aufrufer** ? **sie wird irgendwann gelesen und fuer den Stand
gehalten.**

`[read]` **Sein Schreibhelfer haette sie mit `os.replace`
verbrauchen sollen** ? **er hat sie nicht geloescht, sondern
gemeldet.** `[cmd]` **Richtig: kein untracktes Verzeichnis wird
dem Namen nach geloescht** ? **und ein getracktes erst recht
nicht.**

## Befund 2 — der Bucket lehnt `text/plain` ohne Vorwarnung ab

`[cmd]` **`allowed_mime_types`: pdf, jpeg, png, heic.**

`[read]` **Wer eine `.txt` waehlt, bekommt einen Fehler, wo ein
`accept`-Merkmal und ein benannter Hinweis hingehoeren.**

`[read]` **Dieselbe Klasse wie E-72:** **ein Fehler, wo eine
Erklaerung stehen sollte.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Zweitfassung

`[read]` **Miss zuerst, was sie enthaelt** ? `git diff` **gegen
das Original.**

`[read]` **Wenn nichts Eigenes drinsteht: entfernen.**
`[read]` **Wenn doch: melden, was, bevor du sie entfernst.**

`[read]` **Und sieh nach, ob dein Schreibhelfer sie erzeugen
kann** ? **einmal ist ein Versehen, zweimal ist ein Fehler im
Werkzeug.**

### 2 · Der Dateihinweis

`[cmd]` **`accept` am Eingabefeld, aus den erlaubten Arten
abgeleitet** ? **nicht aus dem Gedaechtnis geschrieben.**

`[read]` **Und ein Satz daneben, der sagt, was geht** ? **statt
eines Fehlers hinterher.**

### 3 · Die Modul-Dateien in `docs/ssot/`

`[cmd]` **A-74: die SSOT lag zwoelf Tage zurueck.**
`[cmd]` **`00-ABGENOMMEN.md` traegt jetzt 326 Punkte, erzeugt.**

`[read]` **Aber die Beschreibung des Ist-Zustands je Modul ist
Handarbeit** ? **und `recovery`, `medical` und `supplements` haben
sich in zwei Tagen stark veraendert.**

`[read]` **Miss, welche Modul-Datei in `docs/ssot/` ueberholt ist**
? **und melde es, ohne sie zu schreiben.**

`[cmd]` **`docs/` gehoert dem Orchestrator** ? **du misst, ich
schreibe.**

### Abnahmebedingungen

    A1  ansicht.tsx.neu: was steht drin, was nicht im Original?
        Entfernt oder gemeldet, mit Grund.
    A2  der Schreibhelfer: kann er sie wieder erzeugen? Belegt.
    A3  accept am Feld, aus den erlaubten Arten. Eine .txt
        waehlen: was geschieht jetzt?
    A4  eine erlaubte Datei hochladen: geht weiter. Belegt.
    A5  docs/ssot/: welche Modul-Dateien sind ueberholt?
        Zahl: geprueft / ueberholt, je mit einem Satz.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-434.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`** ? **Tom haelt
ihn.**

`[read]` **Und sag mir, wenn deine Aenderung einen Neustart
braucht** ? `packages/ui`, `.env`, `next.config`, neue
Abhaengigkeiten.

## Bericht

### A1 ? Was in `ansicht.tsx.neu` stand

`[cmd]` **Nichts Eigenes.** `git diff` gegen das Original: **1
Einfuegung, 4 Loeschungen** ? und die Einfuegung ist eine
*gekuerzte* Fassung desselben Kommentars.

    -            (`ladeCheckins`, `ladeScores`, `ladeModalitaeten`) nehmen
    -            ein `bis` entgegen. In G-375 war das der Grund, warum es
    -            keinen Wechsler bekam (C-426). */}
    +            nehmen ein `bis` entgegen. */}
    -
             <div className="v2-kopf-mitte" data-tageswechsler />

`[read]` **Es ist ein aelterer, aermerer Stand derselben Datei** ?
der Kommentar ohne die C-426-Begruendung und ohne eine Leerzeile.
**Das Original ist in jedem Punkt die reichere Fassung.**

`[cmd]` **Entfernt.** `find . -name "*.neu"` meldet jetzt **0**.
`[read]` **Die Loeschung steht im Arbeitsbaum, nicht in der
Bereitstellung** ? nichts gestaged, nichts committet.

### A2 ? Ja, der Schreibhelfer kann sie wieder erzeugen

`[cmd]` **Nachgebaut und belegt.** Der Helfer legte `pfad + ".neu"`
**innerhalb** der Wiederholschleife an und raeumte sie nicht weg:

    Fall 1 (geht durch)   : ok=True   .neu-Reste=[]
    Fall 2 (replace faellt): ok=False  .neu-Reste=['ansicht.tsx.neu']

`[read]` **Der zweite Fall ist genau der, fuer den die Schleife da
ist.** Scheitert `os.replace` mit `PermissionError`, schreibt jeder
Durchgang die Nebendatei neu ? **und der letzte laesst sie
liegen.** Der Helfer meldet `False`, die Datei bleibt.

`[read]` **Das erklaert die Herkunft genau:** in G-375 meldete das
Skript Fehlschlag, ich berichtigte das Ziel von Hand ? **und
niemand sah nach der Nebendatei.** `[read]` **Einmal ist ein
Versehen, zweimal ein Fehler im Werkzeug** ? es war das Werkzeug.

**Behoben, und zwar an einer Stelle statt in jedem Skript neu:**
`tools/lauf.py` fuehrt jetzt `schreib(pfad, text)`. `[cmd]` **Zwei
Aenderungen:** die Nebendatei bekommt einen eindeutigen Namen ueber
`tempfile.mkstemp` (**nie `.neu`** ? ein Rest soll nicht wie eine
Zweitfassung aussehen), und `finally` raeumt sie in **jedem**
Ausgang weg.

`[cmd]` **Gegenprobe, drei Faelle:**

    1 Normalfall : ok=True   Inhalt='neu'  Reste=[]
    2 Sabotage   : ok=False  Inhalt='neu'  Reste=[]
    3 Absturz    :                          Reste=[]

`[read]` **Auch beim Absturz mitten im Schreiben bleibt nichts
liegen** ? und das Ziel bleibt unversehrt.

`[read]` **Warum in `lauf.py`:** weil die Regel es so sagt ? *wer
einen Befehl braucht, der nicht darueber geht, erweitert die Datei,
statt danebenzuschreiben.* **Der Fehler entstand gerade dadurch,
dass jedes Skript seinen eigenen Helfer abschrieb.**

### A3 ? Was jetzt bei einer `.txt` geschieht

`[cmd]` **Am Feld gemessen:**

    accept = application/pdf,image/jpeg,image/png,image/heic

`[cmd]` **Und der Hinweis steht sichtbar ueber der Liste, VOR der
Wahl:**

    Originale als PDF, JPEG, PNG, HEIC, bis 20 MB.

`[cmd]` **Eine `.txt` trotzdem hineingezwungen** (per
`DataTransfer` ? `accept` filtert nur den Waehler, es haelt nichts
auf):

    Diese Dateiart nimmt der Speicher nicht an (text/plain).
    Erlaubt sind: PDF, JPEG, PNG, HEIC.

`[cmd]` **Nichts geschrieben:** Objekte im Bucket unveraendert
**2**, `file_ref` der Buehne **(leer)**.

`[read]` **Vorher kam** *„mime type text/plain is not supported"* ?
eine Meldung aus dem Speicher, die nicht sagt, was stattdessen geht.
**Dieselbe Klasse wie E-72:** nicht der nackte Fehler, sondern ein
benannter Hinweis.

**Abgeleitet, nicht erinnert.** `[cmd]` **Die Quelle ist
`20260908113000_c429_medical_documents_timeline.sql` Zeile 18**, in
der laufenden Datenbank gegen `storage.buckets.allowed_mime_types`
nachgemessen. `[read]` **Der Klartext und `accept` kommen aus
DERSELBEN Liste** ? `ORIGINAL_ACCEPT` ist gerechnet
(`ORIGINAL_ARTEN.join(',')`), nicht danebengeschrieben. **Auch die
20 MB**: `ORIGINAL_GROESSE_KLARTEXT` rechnet aus `20971520`.

`[read]` **Eine eigene Datei `lib/medical/original-arten.ts`, weil
die Liste ueber die Client-Grenze muss.** Sie kann nicht in
`dokumente-write.ts` stehen ? die Datei importiert
`@lumeos/shared/session`, und ein **Wert**-Import daraus zoege das
Servermodul in das Browserbuendel. `[cmd]` **In einem frueheren
Auftrag gemessen: HTTP 500, waehrend `tsc` gruen bleibt.**

**Die Pruefung steht im Schreibweg, nicht nur am Feld** ? `accept`
ist der Hinweis, `legeOriginalAb` die Schranke. **Die
Groessengrenze prueft sie gleich mit.**

### A4 ? Eine erlaubte Datei geht weiter durch

`[cmd]` **Objekte im Bucket 2 ? 3.** **Keine Fehlermeldung.**
**„Oeffnen"-Knoepfe 2 ? 3.**

    61e9f10a-.../cac5f1ec-....pdf   193 B   application/pdf

`[cmd]` **`file_ref` traegt den Pfad**, Form `<user_id>/<report_id>`
wie E-75 verlangt.

`[read]` **Die Buehne dafuer war noetig:** `test-user` fuehrt genau
**2** Befunde, und beide trugen seit G-378 schon eine Datei ? **es
gab keinen Knopf „Datei waehlen" mehr.** (Meine erste Messung zaehlte
**0** Knoepfe und sah aus wie ein Rueckschritt; die 12 Befunde, die
ich zunaechst zaehlte, verteilen sich auf **drei** Konten.)

**Rueckbau, gezaehlt:** die Befundzeile ist geloescht,
`lab_reports` steht wieder bei **2**.

`[cmd]` **Ein Objekt blieb liegen** ? und das ist ein eigener
Befund, kein Versehen:

    ERROR: Direct deletion from storage tables is not allowed.
           Use the Storage API instead.

`[read]` **`storage.protect_delete` sperrt das direkte `DELETE`, zu
Recht.** Der Weg darueber waere die Storage-API ? **aber der
Service-Schluessel ist seit 2026-08-03 absichtlich nicht mehr in
`.env.local`**, und die Sitzung liegt in httpOnly-Keksen, also nicht
im Seitenkontext erreichbar. `[read]` **Und die Anwendung hat
keinen Loeschweg** ? `rg` findet in `lib/medical/` und
`app/v2/medical/` **kein** `.remove(`.

`[cmd]` **Gemessen: 1 verwaistes Objekt** (Objekt ohne zugehoerigen
Befund). `[read]` **Ich habe aufgehoert, statt einen Loeschweg zu
bauen** ? das waere ein Schreibpfad ausserhalb des Auftrags.
**Es braucht eine Entscheidung, kein stilles Weiterbauen.**

### A5 ? `docs/ssot/`: 21 geprueft, 3 ueberholt

`[read]` **Nicht das Alter entscheidet** ? eine alte Datei kann
richtig sein. **Es entscheidet, ob eine nachpruefbare Aussage falsch
geworden ist.** Also: genannte Dateipfade und Funktionsaufrufe **mit
Argumenten** aus jeder Datei ziehen und gegen den Code halten.

`[cmd]` **21 Dateien zu recovery, medical und supplements geprueft.**
`[cmd]` **Der Verdacht traf zunaechst 6** ? **fuenf davon waren mein
eigener Fehler:** das Muster `\.(?:ts|tsx)` schnitt bei jeder
`.tsx`-Datei das `x` ab, weil die erste Alternative gewinnt.
**Berichtigt (`tsx` vor `ts`) und am bekannten Fall geeicht**, dann
blieben **3**:

| Datei | Was nicht mehr gilt |
|---|---|
| `132-recovery-anzeige.md` | Nennt `ladeScores(180)`, `ladeModalitaeten(120)` und `ladeCheckins()` ? **alle drei haben seit G-378 einen `bis`-Parameter**, und recovery hat den Tageswechsler, dessen Fehlen die Datei begruendet. |
| `140-supplements-restliche-tabs.md` | Fuehrt `tab-katalog-echt.tsx` und `__tests__/katalog-echt.test.ts` als **neu** ? beide sind in `d019b793` in `substanz-detail.tsx` und `substanz-tafel.tsx` aufgeteilt worden. |
| `116-goals-anbindung.md` | *„Der Stichtag kommt aus `lib/datum.ts:heute()` ? dieselbe Loesung, keine zweite."* **Seit G-17 gewinnt der Suchparameter**, `heute()` ist nur noch der Rueckfall. |

**Nicht ueberholt, obwohl der Verdacht sie traf:**
`109-medical-anbindung.md` nennt `getComputedStyle()` ? **eine
Browser-Schnittstelle in einer Messnotiz, keine Aussage ueber
unseren Code.**

`[cmd]` **Gegengeprueft und sauber:** `149-dashboard.md`,
`83-dashboard.md`, `118-training-sitzungen.md`,
`111-meilensteine-und-tdee.md` ? **keine nennt `heute()` als einzige
Quelle**, die Aussage steht dort also nicht falsch da.

`[read]` **Zwei der drei gehen auf meine eigene Arbeit von gestern
zurueck** (G-378 und G-17). **Nichts in `docs/` geschrieben** ? das
gehoert dem Orchestrator.

`[read]` **Eine Einschraenkung, die zur Zahl gehoert:** geprueft ist,
was sich **maschinell falsifizieren** laesst ? Pfade und Signaturen.
**Eine Datei kann inhaltlich ueberholt sein, ohne einen einzigen
falschen Bezeichner zu tragen.** Die 3 sind eine **untere
Schranke**, nicht die vollstaendige Menge.

### Waechter

`[cmd]` **tsc `--noEmit`** sauber. `[cmd]` **`next lint`:** *No
ESLint warnings or errors*. `[cmd]` **Tests: 1503 ? 1507 pass, 0
fail** (vier neue fuer `original-arten.ts`). `[cmd]`
**`encoding-pruefen.mjs`: 21.000 Dateien, sauber.**

**Sabotageprobe, je Waechter einzeln** ? weil eine Gesamtfrage gruen
bleibt, wenn nur ein Zweig kaputt ist:

    Art ergaenzt, Klartext vergessen  -> not ok 2 (Anzahl)
    Endung statt MIME-Typ            -> not ok 3 (Form)
    accept abgeschrieben statt gerechnet -> not ok 1 (Ableitung)

`[read]` **Jede Sabotage traf genau einen Waechter**, die uebrigen
drei blieben gruen. **Zurueckgenommen, wieder 4/4 gruen.**

### Neustart

`[read]` **Keiner noetig.** Geaendert sind nur `apps/web/src` (heisses
Nachladen) und `tools/lauf.py` (kein Teil der Anwendung). **Nichts in
`packages/ui`, keine Konfiguration, keine neuen Abhaengigkeiten.**

`[cmd]` **Belegt:** die Messungen zu A3 und A4 liefen gegen den
laufenden Server und sahen den neuen Stand ? `accept` und der
Hinweis waren da, ohne dass jemand neu gestartet hat.

### Was offen bleibt

**1 ? das verwaiste Objekt** (siehe A4). **Es braucht entweder einen
Loeschweg in der Anwendung** ? den es aus gutem Grund noch nicht
gibt, denn ein Original zu loeschen ist eine Entscheidung mit
Gewicht ? **oder einen Aufraeumschritt in der Kette.** `[read]`
**Beides ist ein eigener Punkt.**

**2 ? `docs/ssot/` jenseits der drei Module.** Geprueft sind
recovery, medical und supplements, wie beauftragt. `[read]` **Die
uebrigen 135 Dateien sind nicht gemessen** ? und die Methode findet
ohnehin nur, was einen falschen Bezeichner traegt.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  nichts Eigenes drin: 1 Einfuegung, 4 Loeschungen,
        die Einfuegung eine kuerzere Fassung desselben Kommentars
    A2  ja, der Helfer konnte sie wieder erzeugen -- reproduziert
    A3  .txt bekommt einen benannten Hinweis, nichts geschrieben
    A4  objects 2 -> 3, 193 B, Pfad nach E-75
    A5  21 geprueft, 3 ueberholt

`[cmd]` **Selbst gemessen: `schreib()` mit `mkstemp` und `finally`,
3 Objekte, 2 mit Verweis.**

`[cmd]` **Die `.neu` ist geloescht, die Loeschung liegt
ungestaged** ? **wie er sagt.**

### A2 ist die Antwort auf meine Frage

`[read]` **Ich fragte: einmal ein Versehen, zweimal ein Fehler im
Werkzeug?**

`[cmd]` **Es war das Werkzeug** ? **reproduziert.**

> *,,Der Helfer schrieb `pfad + '.neu'` INNERHALB der
> Wiederholschleife ohne Aufraeumen, also ueberlebt die Nebendatei
> genau dann, wenn `os.replace` scheitert ? der Fall, fuer den die
> Schleife da ist."*

`[cmd]` **Und die Geschichte passt: G-375 meldete Fehlschlag, das
Ziel wurde von Hand berichtigt, niemand sah nach der
Nebendatei.**

### Und er hat es an einer Stelle behoben

`[cmd]` **`tools/lauf.py`, `schreib()`** ? **eindeutiger Name statt
`.neu`, `finally` raeumt in jedem Ausgang.**

> *,,Eine Stelle statt jedes Skript, das ihn neu abschreibt ? das
> war der Weg, auf dem sich der Fehler verbreitet hat."*

`[cmd]` **Gegenprobe in drei Faellen, darunter ein harter
Absturz** ? **kein Rest, Ziel unversehrt.**

`[read]` **Und dann hat er diesen Bericht damit geschrieben, ohne
Rest.**

### A3 — gerechnet, nicht danebengeschrieben

`[cmd]` **`original-arten.ts` leitet `accept` UND die *20 MB* aus
derselben Liste ab** ? **`Math.round(ORIGINAL_GROESSE_MAX / 1024 /
1024)`.**

`[read]` **Kein Wert steht zweimal da** ? **also kann keiner
auseinanderlaufen.**

`[read]` **Und der Satz im Code trifft es:** *,,`accept` haelt
nichts auf, es filtert den Waehler."* `[cmd]` **Deshalb die
Zweitpruefung mit `DataTransfer`.**

### A4 — die Fehlmessung, die er selbst berichtigt

`[cmd]` **Erst zaehlte er 0 Knoepfe und hielt es fuer einen
Rueckschritt.**

`[cmd]` **Dann gemessen: `test-user` hat genau 2 Berichte, beide
schon mit Datei aus G-378** ? **die 12 spannten drei Konten.**

`[read]` **Derselbe Fehler wie meiner mit den 5426 Zeilen des
Aktivitaetsstroms** ? **eine Gesamtzahl als Kontozahl gelesen.**

### A5 — und die Einschraenkung zaehlt

`[cmd]` **Drei ueberholt: `132-recovery-anzeige.md`,
`140-supplements-restliche-tabs.md`, `116-goals-anbindung.md`.**

`[cmd]` **Zwei davon sind Folgen seiner eigenen Arbeit von
gestern.**

`[read]` **Und seine Einschraenkung ist die richtige:**

> *,,Die Methode faengt nur Dokumente mit einem falsifizierbaren
> Merkmal. Eine Datei kann inhaltlich ueberholt sein, waehrend jeder
> Name noch stimmt."*

`[cmd]` **135 Dateien sind ungemessen** ? **als G-381.**

**Abgenommen.**

