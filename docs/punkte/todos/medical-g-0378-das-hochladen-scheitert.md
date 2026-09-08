---
nr: G-378
typ: befund
modul: medical
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-376
entscheidung: E-75
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
