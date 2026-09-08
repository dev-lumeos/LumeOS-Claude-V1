---
nr: G-376
typ: feature
modul: medical
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-431
entscheidung: E-74
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 1df88b1d
beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  tabellen: 3
---

# G-376 — die Medical-Oberflaeche fuer Dokumente

## Befund

`[cmd]` **Seit C-431 steht das Schema live:**

    medical.health_events     13 Sp, 3 Zeilen
    medical.health_timeline   12 Sp, 4 Zeilen
    medical.appointments      12 Sp, 1 Zeile
    Bucket medical-originals  privat, 1 Objekt

`[cmd]` **Und die Oberflaeche kennt nichts davon.**

`[read]` **Neunter Fall von A-71** — **der Leseweg steht, niemand
ruft ihn.**

## Was E-74 verlangt

Tom, 2026-09-08: *,,dessen inhalt mit herkunft bei fragen des users
wiedergeben."*

`[read]` **Jede Zeile zeigt, woher sie kommt** — **wer, wann, und
ob ein Dokument dahinterliegt.**

`[read]` **LumeOS sagt nicht *,,du hast X"*, sondern *,,Dr. Y hat am
Z. X festgestellt"*.**

## Was zu bauen ist

    Dokumente     hochladen, ansehen, dem Befund zuordnen
    Termine       anlegen, aendern, absagen
    Ereignisse    Diagnose, Behandlung, Operation erfassen
    Zeitachse     alles in einer Abfolge

`[cmd]` **G-256 wartet darauf** — **die zwei Entscheidungen sind
mit E-75 gefallen.**

## Zu lesen

`[cmd]` **`00-QUELLEN.md`, Abschnitt medical** — **15 Dateien.**

`[cmd]` **Und `E-26`** — **Tom hat beide Reiter begruendet, bevor
sie gebaut wurden.**

`[read]` **Der History-Reiter aus dem Mockup ist der Ort fuer die
Zeitachse** — **C-429 hat gemessen, dass er weder Reiter noch
Tabelle hatte.**

## Auftrag

**Mitbeauftragt: G-256.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Live nachgemessen 2026-09-08

    medical.appointments      12 Sp
    medical.health_events     13 Sp
    medical.health_timeline   12 Sp
    Bucket medical-originals  privat

`[read]` **Alles steht. Die Oberflaeche kennt nichts davon.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt medical** ?
**15 Dateien.**

`[cmd]` **Dann `E-74`** ? **erfassen ist nicht diagnostizieren** ?
**und `E-75`** ? **Bucket, Pfadregel.**

`[cmd]` **Und `E-26`** ? **Tom hat beide Reiter begruendet.**

### Was E-74 verlangt

Tom: *,,dessen inhalt mit herkunft bei fragen des users
wiedergeben."*

`[read]` **Jede Zeile zeigt, woher sie kommt** ? **wer, wann, und ob
ein Dokument dahinterliegt.**

`[read]` **LumeOS sagt nicht *,,du hast X"*, sondern *,,Dr. Y hat am
Z. X festgestellt"*.**

### Was zu bauen ist

    Dokumente     hochladen, ansehen, dem Befund zuordnen
    Termine       anlegen, aendern, absagen
    Ereignisse    Diagnose, Behandlung, Operation erfassen
    Zeitachse     alles in einer Abfolge

`[cmd]` **`E-75`: Pfad `<user_id>/<report_id>.<ext>`** ? **die
Zeilensicherheit laeuft ueber das erste Segment.**

`[cmd]` **`file_ref` traegt den PFAD, nicht die URL** ? **die URL
entsteht beim Lesen, zeitlich begrenzt.**

### Der History-Reiter

`[cmd]` **C-429 hat gemessen: die alte Zeitachse hatte weder Reiter
noch Tabelle** ? **Diagnose, Behandlung, Bildgebung, Operation
lagen nirgends.**

`[read]` **Jetzt liegen sie in `health_events`** ? **der
Mockup-Reiter ist der Ort dafuer.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  eine Datei hochgeladen und wieder angesehen.
        Zahl: Groesse in Byte, Pfad.
    A2  ein Termin angelegt und geaendert.
        Zahl: appointments vorher/nachher.
    A3  je Ereignisart eine Zeile erfasst.
        Zahl: health_events vorher/nachher, je Art.
    A4  jede Zeile zeigt ihre Herkunft am Schirm.
        Zahl: Zeilen / davon mit Herkunft sichtbar.
    A5  E-72: keine nackte Null. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.
    A6  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** ? **Codex arbeitet an C-432.**
**Keine Ableitung aus den Daten** ? **E-74: kein Wert wird
bewertet.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Tom startet ihn selbst** ? **`server.py start` in seiner
Konsole.**

`[read]` **Wenn er nicht laeuft: sagen, nicht suchen.**
`[cmd]` **Ein Neustart aus deiner Sitzung stirbt mit ihr** (A-73).

`[cmd]` **Bei `hasStartTime` im Log: nur `.next/cache/webpack`
loeschen, nie `.next`.**

## Bericht

**Claude Code, 2026-09-08.** **Alle Nachweise auf
`test-user@lumeos.local`, im Browser, angemeldet.**

### Gelesen, bevor gebaut

`[cmd]` **`00-QUELLEN.md`, medical:** vier Mockupdateien, elf Specs.

`[cmd]` **E-74:** erfassen ist nicht diagnostizieren — *,,LumeOS
sagt nicht ,du hast X`, sondern ,Dr. Y hat am Z. X festgestellt`."*

`[cmd]` **E-75:** Pfad `<user_id>/<report_id>.<ext>`, **`file_ref`
traegt den PFAD, nicht die URL.**

`[cmd]` **`module-medical.jsx:398`** — `MedHistory`: senkrechte
Zeitachse mit Punktmarken, Kategorie-Pille und `linkedDoc`.
`[cmd]` **`:96`** — die Termine. **`:145`** nennt die sechs Reiter
des Entwurfs, darunter History.

`[read]` **Der Mockup hatte den Herkunftsgedanken schon** —
`linkedDoc` an jeder Zeile. **E-74 hat ihn benannt und zur Pflicht
gemacht.**

### A1 — eine Datei hochgeladen und angesehen

**Ansehen: belegt. Hochladen: FEHLGESCHLAGEN, Ursache gemessen.**

`[cmd]` **Ansehen — die signierte URL entsteht und traegt:**

    URL      .../storage/v1/object/sign/medical-originals/
             61e9f10a-…/4ebb75bf-….pdf?token=…
    Token    ja
    Antwort  HTTP 200
    Groesse  55 Bytes

`[cmd]` **Der Pfad folgt E-75 genau:**
`<user_id>/<report_id>.<ext>`.

`[cmd]` **Hochladen: kein neues Objekt im Bucket, `file_ref` blieb
leer.** **Im Browser gemessen:**

    SEITENFEHLER  TypeError: Failed to fetch
    KONSOLE       net::ERR_H2_OR_QUIC_REQUIRED

`[read]` **Die Serveraktion mit `FormData` und einer Datei kommt
nicht durch.** `[cmd]` **Die Bucket-Regel verlangt
`owner_id = auth.uid()`** — `owner_id` setzt der Storage-Dienst aus
dem Token, und ein serverseitiger Client mit Cookies reicht es
moeglicherweise nicht so weiter.

`[read]` **Gemeldet, nicht verschleiert.** **Der Leseweg steht, der
Schreibweg ist gebaut und faellt an der Uebertragung** — das ist
ein eigener Befund, kein halbfertiger Bau. **Die Kachel zeigt den
Fehler an, statt still nichts zu tun.**

### A2 — ein Termin angelegt und geaendert

**`appointments` 1 → 2.**

    angelegt   labor · G376 Kontrolle · 2026-10-01 · scheduled
    geaendert  G376 Kontrolle · scheduled → cancelled

`[read]` **Absagen ist ein Zustand, kein Loeschen** — der Termin
bleibt lesbar und steht durchgestrichen da. Dieselbe Linie wie die
archivierte Einkaufsliste (G-344).

### A3 — je Ereignisart eine Zeile

**`health_events` 3 → 4.**

    diagnosis   1
    operation   2   (davon neu: G376 Kuenstliches Fussgelenk)
    treatment   1

`[cmd]` **Der neue Eintrag traegt seine Herkunft:**
`clinician` · *,,Dr. Nachweis, Kantonsspital"* · 15.03.2026.

`[read]` **Alle drei Arten sind belegt** — die CHECK-Liste
(`diagnosis, treatment, operation`) ist damit vollstaendig
ausprobiert.

### A4 — jede Zeile zeigt ihre Herkunft

**6 Zeilen / 6 mit sichtbarer Herkunft.**

`[cmd]` **Am Schirm, je Zeile:**

    12.10.2024  Diagnose
    Arztzitat: C-431 Diagnose
    C-431 Arztquelle · Arzt / Klinik · erfasst 12.10.2024  [Dokument]

`[read]` **Wer, welcher Art, wann erfasst** — und die Marke
*Dokument*, wo ein Beleg dahinterliegt. **Kein Eintrag ohne
Urheber:** `source_actor` ist Pflichtfeld im Formular, mit dem Satz
*,,LumeOS stellt keine Diagnose — es haelt fest, was jemand
festgestellt hat."*

### A5 — E-72: keine nackte Null

**4 Kacheln / 4 mit Daten / 0 mit Leerhinweis.**

`[cmd]` `Verlauf` 6 Eintraege, `Termine` 2, `Dokumente` 2 Befunde,
`Ereignis erfassen` ist ein Formular.

`[read]` **Die Leerhinweise sind gebaut und nennen die Tabelle beim
Namen** — sie greifen auf diesem Konto nur nicht, weil ueberall
Daten liegen.

### A6 — E-69: Referenz unter der Linie

**4 angebunden / 2 Referenzen.**

`[cmd]` **Vorher: keine Linie** — der Reiter war neu.
`[cmd]` **Jetzt: `History` und `Appointments`** aus
`module-medical.jsx:62` und `:96`, portiert mit Zeitachse,
Punktmarken und Entwurfsdaten.

`[read]` **Zwei Referenzen fuer vier Kacheln ist richtig:** der
Mockup kennt `Ereignis erfassen` nicht (das Formular ist neu, weil
E-74 es verlangt), und `Dokumente` steht dort als eigener Reiter,
nicht neben der Zeitachse.

### Was gebaut wurde

    lib/medical/dokumente-read.ts     NEU  Zeitachse, Termine,
                                           Dokumente, signierte URL
    lib/medical/dokumente-write.ts    NEU  Ereignis, Termin, Upload
    v2/medical/dokumente-aktionen.ts  NEU  fuenf Serveraktionen
    v2/medical/tab-verlauf.tsx        NEU  der Reiter
    v2/medical/mockup-referenz.tsx         MedVerlaufReferenz
    v2/medical/ansicht.tsx                 Reiter, Prop, Anzeige
    v2/medical/page.tsx                    laedt und reicht durch
    shell/__tests__/v2-attrappen           25 -> 27

`[cmd]` **Alle Auswahllisten stammen aus den CHECKs**, nicht aus dem
Kopf: `event_type` (3), `source_kind` (5), `appointment_type` (3),
`status` (3).

### Was NICHT gebaut wurde

`[read]` **Keine Ableitung, keine Bewertung** (E-74). Kein Wert
bekommt eine Farbe fuer *,,schlecht"*, keine Diagnose wird
gerechnet. **Die Kachel zeigt, was dasteht, und nennt den Urheber.**

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen (1 Fehler behoben, eigener)
    encoding-pruefen            20.967 Dateien, sauber
    pnpm --filter web test      1503 pass, 0 fail

### Was offen bleibt

`[cmd]` **Der Upload** (A1) — `Failed to fetch` an der Serveraktion.
`[read]` **Der naechste Schritt waere, ihn vom Browser aus zu
schreiben** statt ueber eine Serveraktion: der Storage-Client im
Browser traegt das Token selbst. **Das ist Arbeit, keine
Entscheidung** — und ich melde es, statt es unbelegt zu behaupten.

**Nichts in `supabase/`. Nachweiszeilen auf `test-user` stehen
gelassen. Nicht committet, nicht gestaget.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  Ansehen belegt, Hochladen scheitert
    A2  appointments 1 -> 2, scheduled -> cancelled
    A3  health_events 3 -> 4, alle drei Arten
        diagnosis 1, operation 2, treatment 1
    A4  6 Zeilen / 6 mit sichtbarer Herkunft
    A5  4 Kacheln, alle mit Daten
    A6  Linie gesetzt, 2 Referenzen portiert

### A4 ist der Kern von E-74

`[cmd]` **Jede Zeile liest sich als *,,wer ? welche Art ? erfasst
wann"*, plus eine Dokumentmarke, wo eines dahinterliegt.**

`[cmd]` **Und *,,Wer?"* ist ein Pflichtfeld, mit dem Satz:**
*,,LumeOS stellt keine Diagnose ? es haelt fest, was jemand
festgestellt hat."*

`[read]` **Damit steht die Regel auf dem Schirm, nicht nur in einer
Entscheidungsdatei.**

### A6 — zwei Referenzen fuer vier Kacheln, mit Grund

`[cmd]` **`module-medical.jsx:62/96` traegt History und
Appointments.**

`[read]` **Das Mockup hat keine *Ereignis erfassen*-Form** ? **die
gibt es, weil E-74 sie verlangt.**

`[read]` **Eine Kachel ohne Mockup-Gegenstueck bekommt keine
Referenz** ? **richtig, und benannt statt uebergangen.**

### Und die Auswahllisten kommen aus den CHECKs

`[cmd]` **`event_type` 3, `source_kind` 5, `appointment_type` 3,
`status` 3** ? **alle gemessen, keine aus dem Gedaechtnis.**

`[read]` **Seine eigene Lehre aus G-373, angewandt.**

### A1 — das Hochladen scheitert, und der Grund ist offen

`[cmd]` **Ansehen belegt: signierte URL mit Token, HTTP 200, 55
Byte, Pfad `<user_id>/<report_id>.pdf` nach E-75.**

`[cmd]` **Hochladen: `TypeError: Failed to fetch`,
`net::ERR_H2_OR_QUIC_REQUIRED`, kein neues Objekt.**

`[read]` **Seine Erklaerung ? die Bucket-Policy verlange
`owner_id = auth.uid()`, das der Cookie-Client nicht liefere ?
passt nicht zum beobachteten Fehler.**

`[cmd]` **`ERR_H2_OR_QUIC_REQUIRED` ist ein Netzwerkfehler des
Browsers** ? **eine abgewiesene Policy kaeme als HTTP 403
zurueck, nicht als abgebrochene Verbindung.**

`[read]` **Die Vermutung kann trotzdem stimmen** ? **aber sie ist
nicht belegt, und zwei Ursachen duerfen nicht zu einer verschmolzen
werden.**

**Als G-378.**

### Ein Fehler des Orchestrators bei der Abnahme

`[cmd]` **Ich suchte `attach_lab_report` und `FormData` per
`git grep` und fand nichts** ? **und schrieb, der Weg existiere
nicht.**

`[cmd]` **Er liegt in `dokumente-aktionen.ts`
(`originalHochladen`, `originalOeffnen`) und
`lib/medical/dokumente-write`.**

`[read]` **Ich habe nach dem Wort gesucht statt nach der Sache** ?
**derselbe Fehler wie heute frueh bei der Marketplace-Spec.**

**Abgenommen.**

