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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
