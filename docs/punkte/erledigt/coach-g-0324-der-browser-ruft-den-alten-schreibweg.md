---
nr: G-324
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-381
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 0e8cdc8f
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-09-02
---

# G-324 — der Browser ruft den alten Schreibweg

## Befund

Aus C-381, Codex, 2026-09-02.

`[cmd]` **`coach.bestaetige_aktion` ist live, und die UPDATE-Regel
an `pending_actions` ist entfernt** — nur noch `SELECT`, `INSERT`,
`DELETE`.

`[cmd]` **`entscheideAktion` im Browser schreibt weiterhin direkt.**

`[read]` **Damit ruft die Oberflaeche einen Weg, den es nicht mehr
gibt.**

## Was zu tun ist

**Den Aufruf auf die RPC umstellen.**

`[cmd]` **Die Funktion nimmt den Akteur aus `auth.uid()`** — **der
Aufruf braucht `confirmed_by` nicht mehr mitzugeben.**

`[read]` **Und die Fehlerfaelle sind jetzt echt:** fremd, abgelaufen,
unbekannter Aktionstyp. `[read]` **Die Oberflaeche muss sie
unterscheiden koennen** — **eine Meldung *,,fehlgeschlagen"* ohne
Grund war der Befund aus G-298.**

## Wie es zu belegen ist

`[cmd]` **Zwei Aktionen stehen auf `pending` und abgelaufen**,
20.08. und 01.09.

`[read]` **Sie sind der Testfall:** **der Browser muss sie anzeigen
und beim Bestaetigen die Ablaufmeldung bekommen.**

## Auftrag — coach vorbereiten

**Mitbeauftragt: C-268, C-269.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Warum jetzt

`[cmd]` **Fuenf HOCH-Punkte liegen offen, drei davon in `coach`.**

`[cmd]` **Das Schema steht:** **13 Tabellen, 161 Spalten, 56
Zeilen** — **darunter vier Protokolltabellen fuer Rechte, Autonomie
und Beziehung.**

`[cmd]` **Und die Spec ist vollstaendig:**
`docs/specs/HumanCoach/`, **12 Dateien, 3.291 Zeilen.**

`[read]` **Bevor Claude Code die Oberflaeche baut, muss der
Schreibweg stimmen** — **sonst wiederholt sich A-71 in `coach`.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt Coach.**
`[cmd]` **Dann `docs/specs/HumanCoach/SPEC_06_DATABASE_SCHEMA.md`
und `SPEC_07_API.md`.**

`[cmd]` **Und `ADR_COACH_PERMISSIONS_V1.md`.**

### 1 · G-324 — der Browser ruft den alten Schreibweg

`[read]` **Miss, welcher Weg gemeint ist und ob es den neuen
gibt.**

`[read]` **Wenn ja: umstellen.** `[read]` **Wenn nein: melden, was
fehlt.**

### 2 · C-268 — beim Einladen fehlt die Namensaufloesung

`[cmd]` **`coach.relationships` traegt 16 Spalten, sechs Zeilen.**

`[read]` **Miss, was beim Einladen geschieht** — **und was der
Coach sieht, wenn er einen Namen eingibt.**

### 3 · C-269 — eine Einladung laesst sich nicht zuruecknehmen

`[read]` **Dieselbe Klasse wie `withdraw_stack_template`, das du
gerade gebaut hast** (C-423).

`[cmd]` **Und `relationship_change_log` traegt sieben Zeilen** —
**die Spur ist vorgesehen.**

`[read]` **Zuruecknehmen heisst nicht loeschen** — **wie bei den
Einkaufslisten** (E-64).

### Abnahmebedingungen

    A1  G-324: welcher Weg, alt und neu benannt. Umgestellt
        oder gemeldet, mit Grund.
    A2  C-268: eine Einladung mit Namen, belegt.
        Zahl: Treffer bei der Aufloesung.
    A3  C-269: eine Einladung zurueckgenommen. Zeile in
        relationship_change_log, vorher/nachher.
    A4  RLS je beruehrter Tabelle in beide Richtungen.
    A5  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**Keine Oberflaeche** — **`apps/coach` gehoert Claude Code.**
**Nie gegen die laufende Datenbank testen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

## G-324 - Der Browser-Schreibweg ist umgestellt

Der alte Weg war `entscheideAktion()` in
`apps/web/src/lib/coach/rechte-schreiben.ts`: direkter
`coach.pending_actions`-UPDATE mit Browserwerten fuer Status und beim
Bestaetigen auch Akteur und Zeitpunkt. C-381 hatte dieses UPDATE-Recht
bereits entfernt und `coach.bestaetige_aktion(uuid)` als atomaren
Ausfuehrer bereitgestellt.

Der neue Weg liefert nur noch `p_action_id` an die Datenbank. Bestaetigen
geht ueber `coach.bestaetige_aktion(uuid)`, Ablehnen ueber den fuer den
zweiten vorhandenen UI-Zustand ergaenzten, gleich gesicherten RPC
`coach.lehne_aktion_ab(uuid)`. Beide bestimmen Akteur, Eigentum, Status
und Ablauf in der Datenbank. Die Server-Action reicht die spezifischen
RPC-Meldungen weiter (fremd, nicht offen, abgelaufen, beim Bestaetigen
auch unbekannter Aktionstyp); sie behauptet nicht mehr einen eigenen,
vorab gelesenen Zustand. `confirmed_by` kommt nicht mehr aus dem Browser.

## C-268 - Namensaufloesung bleibt bewusst blockiert

Die Messung ergibt **0 Treffer bei einer Namensaufloesung**: Es gibt keine
solche Funktion und keinen Aufrufer. `coach.resolve_invite_user_id(text)`
loest ausschliesslich E-Mail nach UUID auf und wird vom Einladeweg nicht
aufgerufen. `public.profiles` hat kein Namensfeld, `coach.coach_profiles`
existiert nicht. Der vorhandene Coach-Leser `coach.klienten()` formt einen
Anzeigenamen erst fuer bereits eigene Beziehungen aus
`auth.users.raw_app_meta_data`; das ist keine entschiedene, allgemein
suchbare Namensquelle fuer Einladungen.

Damit kann die geforderte Einladung "mit Namen" nicht ehrlich belegt
werden. Vor dem Bau braucht es Toms Entscheidung, ob ein Name aus einem
eigenen Profilfeld oder aus Auth-Metadaten stammt und ob der Name schon
vor Zustimmung der anderen Person gesucht und angezeigt werden darf.
Ohne diese Entscheidung waere ein Name-zu-UUID-Helfer eine neue
Existenz-/Personensuche.

## C-269 - Ruecknahme mit Spur erreichbar

`nehmeEinladungZurueck()` ist als Server-Action vorbereitet und ruft
`coach.withdraw_relationship_invite(uuid, text)`, nie ein DELETE oder
einen direkten Tabellen-UPDATE. Die Funktion laeuft `SECURITY DEFINER`
mit leerem Suchpfad; ihre WHERE-Klausel bindet weiterhin an
`invited_by = auth.uid()`. Das ist noetig, damit der Weg auch in der
Ketten-Minimal-Auth-Umgebung `auth.uid()` sicher auswerten kann.

Rollback-Gegenprobe: vorher `status='invited'`, nachher
`status='withdrawn'`, `withdrawn_at` und `withdrawn_by` gesetzt,
`relationship_change_log` **+1 Zeile**. Ein fremder Klient erhielt
`false`; die Funktion legt keine Beziehung offen.

## RLS und Kette

- `coach.pending_actions`: Eigentumer kann lesen und per RPC ablehnen;
  ein Aussenstehender sieht die Aktion nicht. Direkter UPDATE bleibt
  entzogen.
- `coach.relationships`: Einladender kann lesen und zuruecknehmen;
  Aussenstehender sieht die Beziehung nicht, ein eingeladener aber nicht
  einladender Beteiligter kann sie nicht zuruecknehmen.
- `coach.relationship_change_log`: Einladender liest die neue Auditzeile;
  Aussenstehender sieht keine.

Die Proben liefen ausschliesslich transaktional auf
`lumeos_g324_final` und rollten vollstaendig zurueck. Danach lief die
Vollkette mit **163 Schritten plus Abschlusspruefung in 299,6 Sekunden**:
`SCHEMA VOLLSTAENDIG`.

## Abnahme

**2026-09-08, Orchestrator.**

    A1  alt: direkter pending_actions.update aus dem Browser
        neu: coach.bestaetige_aktion / lehne_aktion_ab per RPC
    A2  C-268 -- die Frage war falsch gestellt, siehe dort
    A3  invited -> withdrawn, withdrawn_at/by, Protokoll +1
    A4  RLS: Aussenstehender sieht weder Aktion noch Beziehung
        noch Protokoll. Direkter Update entzogen.
    A5  Vollkette 163 Schritte, 299,6 s, Schema vollstaendig

### A1 ist ein Sicherheitsfund

`[cmd]` **Vorher schrieb der Browser direkt in `pending_actions`
und setzte `confirmed_by` selbst.**

`[read]` **Wer bestaetigt hat, kam aus dem Browser** — **das kann
sich jeder ausdenken.**

`[cmd]` **Jetzt zwei RPCs, und der direkte Update ist entzogen.**

`[cmd]` **`00_MASTER_VISION.md`, Kernprinzip 5:** *,,No direct DB
writes from UI."* `[read]` **Bei einer Coach-Freigabe ist das keine
Empfehlung.**

### C-269 — zuruecknehmen heisst nicht loeschen

`[cmd]` **`invited -> withdrawn`, `withdrawn_at` und `withdrawn_by`
gesetzt, `relationship_change_log` +1.**

`[read]` **Dieselbe Machart wie `withdraw_stack_template`** (C-423)
**und wie das Archivieren der Einkaufslisten** (E-64).

`[read]` **Die Spur bleibt** — **man sieht, dass jemand eingeladen
und zurueckgezogen hat.**

### Nachgemessen

`[cmd]` **Live auf `dev`: `bestaetige_aktion`,
`withdraw_relationship_invite`, `withdrawn_at`, `withdrawn_by`.**

`[cmd]` **`lehne_aktion_ab` fehlt noch** — **im Kettenschritt
vorhanden, nicht eingespielt.**

**Abgenommen, Einspielen beauftragt.**

