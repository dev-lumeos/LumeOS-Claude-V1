---
nr: G-378
typ: befund
modul: medical
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-376
entscheidung: E-75
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: c6cd778a
beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/dokumente-aktionen.ts
zahlen:
  gemessen: 2026-09-08
  objekte: 1
---

# G-378 — das Hochladen scheitert

## Befund

Aus G-376, Claude Code, 2026-09-08.

`[cmd]` **Ansehen geht:** **signierte URL mit Token, HTTP 200, 55
Byte, Pfad `<user_id>/<report_id>.pdf`.**

`[cmd]` **Hochladen scheitert:** `TypeError: Failed to fetch`,
`net::ERR_H2_OR_QUIC_REQUIRED` ? **kein neues Objekt,
`file_ref` bleibt leer.**

`[cmd]` **Der Weg ist gebaut:** `originalHochladen(form: FormData)`
**in `dokumente-aktionen.ts`, ruft `legeOriginalAb` in
`lib/medical/dokumente-write`.**

## Zwei Ursachen, die nicht vermischt werden duerfen

**1 ? der Netzwerkfehler.** `[cmd]`
**`ERR_H2_OR_QUIC_REQUIRED` ist ein Browser-Fehler** ? **die
Verbindung bricht ab, bevor eine Antwort kommt.**

`[read]` **Eine abgewiesene Policy kaeme als HTTP 403 zurueck.**

**2 ? die Bucket-Policy.** `[cmd]` **Nachgemessen,
`medical_originals_insert_own`:**

    WITH CHECK bucket_id = 'medical-originals'
           AND owner_id = auth.uid()
           AND foldername(name)[1] = auth.uid()

`[read]` **Der Storage-Dienst setzt `owner_id` aus dem Token.**
`[read]` **Ob ein Cookie-basierter Serverclient das mitgibt, ist zu
messen** ? **nicht anzunehmen.**

## Zu messen

`[read]` **Zuerst: kommt die Anfrage ueberhaupt am Server an?**
`[cmd]` **Das Serverprotokoll sagt es.**

`[read]` **Wenn nein, ist es der Transportweg** ? **eine
Server-Aktion mit einer Datei in `FormData` ueber localhost ist ein
bekannter Stolperstein.**

`[read]` **Wenn ja und die Policy weist ab, steht es als 403 im
Protokoll** ? **dann ist Claude Codes Vermutung belegt.**

## Sein Vorschlag

> *,,es muss vermutlich vom Browser-Client aus laufen statt vom
> Server."*

`[read]` **Das loest beide moeglichen Ursachen** ? **kein
Transport ueber die Server-Aktion, und das Token kommt direkt aus
der Sitzung.**

`[cmd]` **Aber es widerspricht Kernprinzip 5** ? *,,No direct DB
writes from UI."*

`[read]` **Storage ist keine Datenbank** ? **zu klaeren, ob das
Prinzip hier gilt.**

## Auftrag

**Mitbeauftragt: G-371b (die vier mit festem `heute()`).** Bericht
in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · G-378 — zuerst messen, welche der zwei Ursachen es ist

`[read]` **Deine Erklaerung und der beobachtete Fehler passen nicht
zusammen.**

`[cmd]` **`ERR_H2_OR_QUIC_REQUIRED` ist ein Browser-Fehler** ?
**die Verbindung bricht ab, bevor eine Antwort kommt.**

`[read]` **Eine abgewiesene Policy kaeme als HTTP 403 zurueck.**

**Also zuerst die eine Frage:** **kommt die Anfrage am Server an?**

`[cmd]` **`backup/dev-server.log` sagt es** ? **eine Serveraktion
erscheint dort als `POST`.**

    kommt sie an, mit 403     -> die Policy, deine Vermutung stimmt
    kommt sie an, mit 500     -> der Code dahinter
    kommt sie GAR NICHT an    -> der Transportweg

`[read]` **Erst danach bauen.**

### Wenn es der Transportweg ist

`[read]` **Dein Vorschlag: vom Browser-Client statt vom Server.**

`[cmd]` **Aber Kernprinzip 5 sagt:** *,,No direct DB writes from
UI."*

`[read]` **Storage ist keine Datenbank** ? **miss, ob das Prinzip
hier gilt, und begruende es.**

`[cmd]` **`E-75`: der Bucket ist privat, die Policy prueft
`owner_id = auth.uid()`** ? **die Sperre bleibt, egal von wo
hochgeladen wird.**

### 2 · Die vier Module mit festem `heute()`

`[cmd]` **Aus G-375: `recovery` ist nicht anschliessbar** ? **seine
drei Lesewege (`ladeCheckins`, `ladeScores`, `ladeModalitaeten`)
nehmen kein Datum und laden die neuesten Zeilen.**

`[cmd]` **Und `supplements` hat den Wechsler bewusst nicht** ?
**`bilanzTag` faellt auf den neuesten Einnahmetag zurueck
(G-275, Zeile 119).**

`[read]` **Bau beide an** ? **die drei Lesewege nehmen ein Datum,
`bilanzTag` folgt dem gewaehlten Tag.**

`[read]` **Dann bekommen sie den Wechsler** (`data-tageswechsler`),
**und `heute()` verschwindet aus beiden.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  kommt die Hochladeanfrage am Server an? Protokollzeile
        zitieren, mit Statuscode.
    A2  welche der drei Ursachen. Belegt, nicht vermutet.
    A3  eine Datei hochgeladen. Zahl: storage.objects
        vorher/nachher, Groesse, Pfad.
    A4  recovery: die drei Lesewege nehmen ein Datum.
        Zahl: Zeilen bei zwei verschiedenen Tagen.
    A5  supplements: bilanzTag folgt dem gewaehlten Tag.
        Zahl: Anzeige bei zwei verschiedenen Tagen.
    A6  9 Module / davon mit Wechsler. Vorher 4, jetzt?

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** ? **Codex arbeitet an C-433.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, NIE `neustart`, NIE `aufraeumen`.**

`[read]` **Tom haelt ihn in seiner eigenen Konsole.** `[read]`
**Antwortet 3200 nicht: `status` lesen und melden** ? **nicht
beheben.**

## Bericht

### A1 ? Die Anfrage kommt an

`[cmd]` **Die Protokollzeile:**

    POST /v2/medical?tab=verlauf 200 in 197ms

`[cmd]` **604 POST-Zeilen im Protokoll insgesamt.** **Die Anfrage
erreicht den Server, mit Status 200.**

`[cmd]` **Und die Aktion lief** ? mit einer Instrumentierung
gemessen, die danach wieder entfernt wurde (`console.log`-Zahl in
`dokumente-aktionen.ts` jetzt **0**):

    [G-378] Upload beginnt: 2f3838a1-... g376-nachweis.txt 65
    [G-378] Upload FEHLER: mime type text/plain is not supported

### A2 ? Welche der drei Ursachen

**Keine der drei allein.** `[cmd]` **Es waren zwei Sachen
uebereinander, und die erste hat die zweite verdeckt.**

`[cmd]` **Der Ausschluss des Transportwegs, gemessen:** rohe
POST-Anfragen aus der Seite heraus, mit wachsender Nutzlast ?

     Nutzlast      Ergebnis
        100 B      status 500
     10.000 B      status 500
    100.000 B      status 500
  1.000.000 B      status 500

`[read]` **Eine Megabyte geht durch, ohne Abbruch.** **Der 500 ist
nur die fehlende Aktionskennung** ? er belegt, dass die Anfrage
ankommt. `[cmd]` **Und die Gegenprobe ohne Datei schreibt:**
`terminAnlegen` legte "G378 Gegenprobe" in `medical.appointments` an.

`[read]` **Damit faellt der Transportweg als Ursache aus.** **Und
damit auch die Frage nach Kernprinzip 5** ? es braucht keinen
Browser-Client, die Server-Aktion traegt die Datei.

**Die zwei echten Ursachen:**

    1  der Dateityp    text/plain steht nicht in allowed_mime_types
    2  die Halterung   das <label> um das Feld wurde mitten in der
                       Anfrage abgeraeumt

`[cmd]` **Zu 1, am Bucket gemessen:**

    allowed_mime_types  {application/pdf,image/jpeg,image/png,image/heic}
    file_size_limit     20971520
    public              f

`[read]` **Zu 2:** das Dateifeld lag in einem `<label>` je Zeile.
Beim Absenden rendert die Liste neu, das Feld verschwindet **waehrend**
die Anfrage laeuft ? `net::ERR_ABORTED`. `[read]` **Deshalb sah es
wie ein Transportfehler aus, obwohl der Transport nie das Problem
war.**

**Behoben:** ein einziges verstecktes Feld ausserhalb der Liste, je
Zeile ein Knopf, der es ueber eine `ref` anklickt. Das Ziel steht in
`zielBericht.current`, nicht in der Liste.

### A3 ? Eine Datei liegt oben

`[cmd]` **`storage.objects` im Bucket `medical-originals`: 1 ? 2.**

    61e9f10a-.../4ebb75bf-....pdf    55 B   application/pdf
    61e9f10a-.../2f3838a1-....pdf   193 B   application/pdf

`[cmd]` **Und `file_ref` traegt den PFAD, nicht die Adresse** (E-75):

    C-431 Originaldatei   61e9f10a-.../4ebb75bf-....pdf
    G376 Nachweisbefund   61e9f10a-.../2f3838a1-....pdf

`[read]` **Die zweite Zeile ist die dieses Auftrags.** Form
`<user_id>/<report_id>.<ext>`, wie in E-75 festgelegt.

### A4 ? Recovery nimmt einen Tag entgegen

`[cmd]` **Die drei Lesewege haben jetzt einen Stichtag** ?
`ladeCheckins(grenze, bis?)`, `ladeScores(grenze, bis?)`,
`ladeModalitaeten(grenze, bis?)`, je ein
`.lte('entry_date', bis ?? '9999-12-31')`.

`[read]` **Ohne Angabe bleibt alles wie bisher** ? die Obergrenze
liegt jenseits jeder Zeile. **Damit bleibt jeder Aufrufer gueltig,
der keinen Tag kennt.**

`[cmd]` **Am Schirm gemessen, `test-user@lumeos.local`:**

    2026-08-23  ->  30 erfasst , NEUSTER EINTRAG - 2026-08-23 - 07:05
    2026-08-20  ->  27 erfasst , NEUSTER EINTRAG - 2026-08-20 - 07:05

**Zwei verschiedene Tage, zwei verschiedene Staende.**

### A5 ? Supplements folgt dem gewaehlten Tag

`[cmd]` **Zwei Stellen, nicht eine** ? und die zweite war der
eigentliche Befund.

**Erstens `page.tsx`:** dort stand
`daten?.einnahmen[0]?.intake_date ?? stichtag` ? der juengste
Protokolltag ZUERST. `[read]` **Umgekehrt:** wer einen Tag waehlt,
meint ihn; wer keinen waehlt, bekommt weiter den juengsten. **G-275
bleibt gueltig, es ist jetzt der zweite Fall statt des ersten.**

**Zweitens `tabs.tsx:138`** ? und das war die Stelle, die die
Messung erst verriet. `[cmd]` **Nach der Aenderung in `page.tsx`
folgte der Wechsler, die Kachel aber nicht:**

    2026-09-06  ->  Wechsler "So., 6. Sept. 2026" , Kachel 2026-09-06
    2026-09-03  ->  Wechsler "Do., 3. Sept. 2026" , Kachel 2026-09-06

`[read]` **`TodayEcht` rechnete sich seinen eigenen "heute" aus**
(`d.einnahmen[0]?.intake_date`), obwohl `stichtag` im Kontext direkt
danebenstand. `[cmd]` **Behoben, nachgemessen:**

    2026-09-06  ->  2026-09-06
    2026-09-03  ->  2026-09-03

`[read]` **Die Lehre:** ein durchgereichter Stichtag ist nicht
angekommen, solange nicht die ANZEIGE gemessen wurde. **Der Wechsler
war schon richtig, als die Kachel noch log.**

### A6 ? Sechs von neun tragen den Wechsler

`[cmd]` **Vorher vier, jetzt sechs:**

    mit Wechsler    dashboard, nutrition, goals, supplements,
                    training, recovery
    ohne            medical, coach, settings

`[read]` **Die drei ohne sind richtig ohne** ? sie haben keinen
Tagesbezug, ein Wechsler waere dort ein Regler ohne Wirkung (C-426).

`[cmd]` **`heute()` als fester Wert ist damit aus den Modulen
verschwunden**, die einen Tagesbezug haben ? es steht nur noch als
Rueckfall da, wenn kein Tag gewaehlt ist.

### Waechter

`[cmd]` **tsc `--noEmit`** sauber. `[cmd]` **`next lint`**: *No
ESLint warnings or errors*. `[cmd]` **Tests: 1503 pass, 0 fail.**
`[cmd]` **`encoding-pruefen.mjs`: 20.988 Dateien geprueft, sauber.**

### Zwei Befunde nebenbei

**1 ? eine tote Zweitfassung im Baum.** `[cmd]`
`apps/web/src/app/v2/recovery/ansicht.tsx.neu` ist **committet**
(84bb575f, G-375) und weicht vom Original ab. `[read]` **Es ist die
Nebendatei meines eigenen Schreibhelfers**, die `os.replace` haette
wegraeumen sollen ? sie ist stattdessen mitgegangen. **Eine zweite
Wahrheit ohne Aufrufer.** `[read]` **Nicht geloescht** ? das ist
Toms Entscheidung.

**2 ? ein Dateityp ohne Rueckmeldung.** `[cmd]` **Der Bucket lehnt
`text/plain` ab**, und die Oberflaeche sagt es nicht vorher. `[read]`
**Wer eine `.txt` waehlt, bekommt einen Fehler statt eines Hinweises.**
`accept` am Feld und ein benannter Hinweis waeren die Loesung ? **ein
eigener Punkt, nicht in diesem Auftrag gebaut.**

### Was ich falsch hatte

`[read]` **Meine G-376-Diagnose war falsch, und Toms Einwand traf
genau.** Ich hatte die Bucket-Policy beschuldigt. **Eine abgewiesene
Policy kaeme als 403 zurueck** ? `ERR_H2_OR_QUIC_REQUIRED` ist ein
Abbruch im Browser. `[cmd]` **Gemessen war es der abgeraeumte
`<label>` plus der falsche Dateityp.** **Die Policy war nie
beteiligt.**

`[read]` **Und derselbe Fehler ein zweites Mal in diesem Auftrag:**
ich habe A5 fuer erledigt gehalten, nachdem `page.tsx` stimmte ?
**gemessen habe ich erst danach, und da log die Kachel noch.**


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  POST /v2/medical?tab=verlauf 200 in 197ms -- kam an
    A2  zwei echte Ursachen, beide Vermutungen widerlegt
    A3  storage.objects 1 -> 2, 193 B, application/pdf
    A4  recovery: 2026-08-23 -> 30, 2026-08-20 -> 27
    A5  supplements: 2026-09-06 -> 06, 2026-09-03 -> 03
    A6  4 -> 6 von 9 Modulen

`[cmd]` **Selbst gemessen: zwei Objekte, `file_ref` bei 2 von 12
gefuellt, `allowed_mime_types` = pdf, jpeg, png, heic.**

### A2 ist die beste Arbeit heute

`[read]` **Er hat BEIDE Vermutungen ausgeschlossen, bevor er
gesucht hat:**

`[cmd]` **Die Policy waere 403 gewesen** ? **kam nicht.**

`[cmd]` **Den Transport hat er mit 1 MB Rohdaten ueber denselben
Ursprung widerlegt** ? **sauberer Status, kein Abbruch.** `[cmd]`
**Und `terminAnlegen` schreibt ohne Datei erfolgreich.**

`[read]` **Erst danach hat er die wirklichen Ursachen gefunden** ?
**und es waren zwei, uebereinander:**

    1  der Bucket lehnt text/plain ab
    2  das <label> je Zeile wurde beim Neuzeichnen abgeraeumt
       -> ERR_ABORTED

`[read]` **Der zweite Fehler sah aus wie ein Transportfehler** ?
**deshalb war meine Berichtigung nur halb richtig.**

`[cmd]` **Und die Folge: Kernprinzip 5 kommt nicht ins Spiel** ?
**kein Browser-Client noetig, weil der Transport nie das Problem
war.**

### A5 — der zweite Ort war der Befund

`[cmd]` **`page.tsx` reparieren liess den Wechsler folgen, die
Kachel zeigte weiter 2026-09-06.**

`[cmd]` **`TodayEcht` in `tabs.tsx:138` rechnete sein eigenes
*heute* aus der neuesten Einnahme** ? **waehrend `stichtag`
ungenutzt daneben im Kontext lag.**

`[read]` **Zehnter Fall von A-71** ? **und diesmal an einer
Stelle, die schon repariert schien.**

### A4 — der Vorgabewert ist die richtige Wahl

`[cmd]` **`.lte('entry_date', bis ?? '9999-12-31')`**

`[read]` **Ohne Datum bleibt jeder bestehende Aufrufer gueltig** ?
**kein Umbau an drei Lesewegen, nur eine Erweiterung.**

### Und seine eigene Berichtigung

> *,,Ich habe A5 als erledigt behandelt, als `page.tsx` richtig
> aussah, und erst danach gemessen ? derselbe
> Reihenfolgefehler, den du mir bei A1 vorgehalten hast."*

`[read]` **Zweimal dieselbe Klasse an einem Tag, von ihm selbst
benannt.**

**Abgenommen.**

