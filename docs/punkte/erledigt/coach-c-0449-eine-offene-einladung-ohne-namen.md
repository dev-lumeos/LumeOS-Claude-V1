---
nr: C-449
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-442
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: fcfecf19
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  invited: 2
  ohne_namen: 1
---

# C-449 — eine offene Einladung ohne Namen

## Befund

`[cmd]` **Nach C-442 auf `dev` gemessen:**

    60000000-...-203  invited  Coach Seed  2026-09-06
    28fe3790-...-c3f  invited  (leer)      2026-08-20

`[cmd]` **Und die Bedingung ist `NOT VALID`:**

    relationships_invited_coach_name_ck
    convalidated = false

`[read]` **Sie greift nur bei neuen Zeilen** ? **die Zeile vom
20.08. ist aelter als C-268 und rutscht durch.**

## Warum das zaehlt

`[read]` **Sie ist OFFEN.** `[read]` **Jemand koennte sie
annehmen** ? **und der Coach haette keinen Namen.**

`[cmd]` **Die zwei historischen `active`-Zeilen sind der andere
Fall** ? **dort ist leer richtig** (C-439): **niemand weiss, wie
der Coach damals hiess.**

`[read]` **Bei einer offenen Einladung ist es etwas anderes:**
**sie wirkt noch, also braucht sie einen Namen.**

## Auftrag

**Mitbeauftragt: die Rollenluecke.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Die eine Zeile

`[read]` **Miss zuerst, wem sie gehoert** ? **welcher Coach, welcher
Klient, und ob der Coach ein Profil hat.**

`[read]` **Dann entscheidet sich der Weg:**

**a** ? **Der Coach hat ein Profil** ? **den Namen nachtragen ist
kein Erfinden, sondern Nachschlagen.**

**b** ? **Er hat keines** ? **dann kann die Einladung nicht
angenommen werden, und sie gehoert auf `withdrawn`.**

`[cmd]` **`withdraw_relationship_invite` gibt es** (C-269).

`[read]` **Nicht loeschen** ? **eine zurueckgenommene Einladung
bleibt sichtbar.**

### 2 · Die Bedingung scharf stellen

`[cmd]` **`NOT VALID` heisst: bestehende Zeilen ungeprueft.**

`[read]` **Wenn die eine Zeile geloest ist, kann sie
`VALIDATE CONSTRAINT` bekommen** ? **dann gilt sie fuer alle.**

`[read]` **Miss, ob noch etwas anderes durchrutscht.**

### 3 · Die Rollenluecke

`[cmd]` **`SPEC_07:10` verlangt Coach-Rolle PLUS aktives
Profil.**

`[cmd]` **Live: 0 Nutzer mit Coach-Rolle, 0 Funktionen mit
Rollenpruefung.**

`[cmd]` **`061_rollen_admin.sql:52`: Rollen werden bewusst nur
AUSSERHALB der Anwendung vergeben.**

`[read]` **Miss, was das praktisch heisst:** **wer setzt sie, mit
welchem Werkzeug?**

`[read]` **Und ob `onboard_coach` sie voraussetzen sollte** ?
**heute tut es das nicht.**

`[read]` **Messen und vorschlagen, nicht bauen** ? **das ist eine
Entscheidung.**

### Abnahmebedingungen

    A1  wem gehoert die Zeile? Coach, Klient, Profil ja/nein.
    A2  geloest: Name nachgetragen oder zurueckgenommen,
        mit Grund.
    A3  VALIDATE CONSTRAINT: geht es? Belegt.
    A4  rutscht sonst noch etwas durch? Zahl.
    A5  die Rollenluecke: wer setzt eine Rolle, womit.
        Fundstelle.
    A6  ein Vorschlag, ob onboard_coach sie voraussetzen soll.
    A7  Punktelauf gruen.

### Was nicht zu tun ist

**Keinen Namen erfinden** ? **nachschlagen oder zuruecknehmen.**
**Keine Rolle vergeben** ? **das ist die Entscheidung.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-392.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  coach@lumeos.app, sarah.seed@example.com, kein Profil
    A2  zurueckgenommen, kein Name erfunden
    A3  Constraint validiert
    A4  0 offene ohne Namen, 5 leere Snapshots erklaert
    A5  Rollen in raw_app_meta_data, nur ausserhalb setzbar
    A6  ein Vorschlag mit Bedingung
    A7  Punktelauf gruen, 578 Punkte

`[cmd]` **Selbst gemessen: 0 offene ohne Namen, `convalidated =
true`, Status `active 4 / invited 1 / withdrawn 1`.**

### A2 ist die richtige Wahl

`[cmd]` **Der Coach hat KEIN Profil** ? **also konnte die
Einladung gar nicht angenommen werden.**

`[read]` **Sie zurueckzunehmen ist nicht die zweitbeste Loesung** ?
**es ist die einzige richtige.** `[read]` **Ein nachgetragener Name
haette eine Einladung wiederbelebt, die seit dem 20.08. tot war.**

`[cmd]` **Und ueber `withdraw_relationship_invite`** ? **Grund und
`withdrawn_by` protokolliert, nicht geloescht.**

### A3/A4 — die Bedingung ist jetzt scharf

`[cmd]` **`relationships_invited_coach_name_ck` validiert** ?
**sie gilt fuer alle Zeilen, nicht nur fuer neue.**

`[cmd]` **Und die fuenf verbleibenden leeren Snapshots sind
erklaert:** **vier historische `active`, plus die eben
zurueckgenommene.**

`[read]` **Kein Verstoss** ? **die Bedingung greift nur bei
`invited`.**

### A6 ist die beste Zeile

> *,,`onboard_coach` sollte die Coach-Rolle kuenftig voraussetzen ?
> aber erst zusammen mit einem bewusst entschiedenen, auditierbaren
> Rollenvergabepfad. Sofort waere es ein Totalschloss bei 0
> Coach-Rollen."*

`[read]` **Er sagt WAS richtig waere UND warum es jetzt nicht
geht** ? **beides in einem Satz.**

`[read]` **Eine Sicherung, die niemanden durchlaesst, ist keine
Sicherung, sondern ein Ausfall.**

### A5 — die Rollenvergabe ist gemessen

`[cmd]` **`auth.users.raw_app_meta_data.role`,
`061_rollen_admin.sql:52`.**

`[cmd]` **Setzbar nur ueber die Supabase-Admin-API mit
Dienstschluessel** ? **oder von Hand als `postgres`.**

`[cmd]` **Live: 1 admin, 0 coach.** `[cmd]` **Und nur
`public.is_admin()` liest `app_metadata`** ? **keine
Coach-Funktion prueft Rollen.**

`[read]` **Damit ist die Luecke vollstaendig beschrieben** ? **als
Entscheidung fuer Tom, nicht als Auftrag.**

**Abgenommen.**

