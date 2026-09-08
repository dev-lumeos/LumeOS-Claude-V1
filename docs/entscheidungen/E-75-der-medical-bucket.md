---
nr: E-75
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-256, C-429, E-74]
modul: medical
---

# E-75 — der Medical-Bucket

## Entscheidung

Tom, 2026-09-08:

> nimm einen logischen namen gehoerend zu medical und ja
> natuerlich privat, das sind ernste daten. pfadregel ok

## Was gilt

    Name          medical-documents
    Sichtbarkeit  privat, kein oeffentlicher Zugriff
    Pfadregel     <user_id>/<report_id>.<ext>

`[read]` **Die Zeilensicherheit laeuft ueber das erste Segment** —
**wer nicht der Eigentuemer ist, kommt an keinen Pfad.**

`[cmd]` **Das ist der uebliche Weg bei Supabase Storage** — **und
er braucht keine zusaetzliche Tabelle.**

## Warum privat keine Frage war

Tom: *,,das sind ernste daten."*

`[cmd]` **Es sind Arztbefunde, Rezepte, Bildgebung** (E-74).

`[read]` **Ein oeffentlicher Bucket haette geheissen: wer die URL
kennt, sieht den Befund** — **auch ohne Anmeldung.**

## Was daraus folgt

`[cmd]` **`lab_reports.file_ref` traegt kuenftig den Pfad, nicht
die URL** — **eine URL waere ein Zugriff, ein Pfad ist ein
Verweis.**

`[read]` **Die URL entsteht beim Lesen, zeitlich begrenzt** —
**Supabase nennt das eine signierte URL.**

`[cmd]` **Und `user_medications` wartet weiter auf
Verschluesselung** — **zu messen, ob dasselbe fuer die Originale
gilt** (C-429, A2).

`[read]` **Ein privater Bucket schuetzt den Zugriff, nicht den
Inhalt** — **wer die Datenbank hat, hat die Dateien.**
