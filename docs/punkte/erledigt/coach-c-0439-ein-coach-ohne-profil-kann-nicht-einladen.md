---
nr: C-439
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-438
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  profile: 0
---

# C-439 — ein Coach ohne Profil kann nicht einladen

## Befund

Aus C-438, Codex, 2026-09-08:

> *,,`coach_profiles` wird derzeit nicht automatisch beim Konto oder
> bei einer Einladung erzeugt. Erzeuger sind Seed und Test-Fixtures.
> C-428 verlangt deshalb ein vorhandenes aktives Profil."*

`[cmd]` **Auf `dev`: 0 Profile.**

`[read]` **Ein Coach meldet sich an und kann niemanden einladen** ?
**der Weg, den C-428 gebaut hat, ist fuer echte Nutzer
verschlossen.**

## Der zweite Fund: der Seed luegt rueckwirkend

`[cmd]` **`testdaten-einspielen.ts:3158` legt *Coach Seed* an,
Zeile 3268 schreibt denselben Wert als `coach_display_name` bei
drei F-07-Beziehungen.**

`[cmd]` **Die Beziehungen sind auf *vor 120 bzw. 45 Tagen*
datiert.**

`[read]` **Codex sagt es selbst:** *,,Es behauptet rueckwirkend den
heutigen Seed-Namen."*

`[read]` **Und er hat es NICHT geaendert** ? richtig, **das ist
eine Entscheidung.**

## Auftrag

**Mitbeauftragt: C-437 (Rest).** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Wann entsteht ein Profil?

`[read]` **Drei Moeglichkeiten, miss und schlag vor:**

**a** ? **Beim Anlegen des Kontos.** `[read]` **Dann traegt jeder
Nutzer ein Coach-Profil, auch wer nie coacht.**

**b** ? **Bei der ersten Einladung.** `[cmd]` **`create_relationship_invite`
koennte es anlegen** ? **aber dann braucht es einen Namen von
irgendwoher.**

**c** ? **Der Coach legt es selbst an.** `[read]` **Ein Schritt vor
der ersten Einladung: *,,wie sollen Klienten dich sehen?"***

`[cmd]` **`SPEC_02:39` und `SPEC_06:37` nennen `display_name`, aber
nicht den Erzeuger** ? **miss, ob eine andere Spec-Stelle es
sagt.**

`[read]` **Und miss, was geschieht, wenn ein Coach ohne Profil
`create_relationship_invite` ruft** ? **Fehler oder leerer Name?**

### 2 · Der Seed

`[read]` **Zwei Wege, und du sollst vorschlagen:**

`[read]` **Entweder der Seed setzt den Snapshot NICHT** ? **dann
sind die drei historischen Beziehungen ehrlich leer, wie die
sechs auf `dev`.**

`[read]` **Oder er setzt einen Namen, der zum Datum passt** ?
**etwa *Coach Seed (2026-05)*.**

`[cmd]` **Die Seed-Pruefung erwartet ausdruecklich drei** ? **die
muesste mit.**

### Abnahmebedingungen

    A1  was geschieht ohne Profil? Gemessen: Fehler oder
        leerer Name.
    A2  welche Spec-Stelle nennt den Erzeuger? Fundstelle
        oder: keine.
    A3  ein Vorschlag fuer a, b oder c, mit Begruendung.
    A4  der Seed: Vorschlag, mit Wirkung auf die Pruefung.
    A5  Vollkette laeuft durch.

### Was nicht zu tun ist

**Nicht bauen** ? **dieser Auftrag misst und schlaegt vor.**
**Keinen Snapshot nachtraeglich fuellen.**
`apps/` nicht anfassen.
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  beide Wege scheitern sauber, kein leerer Name
    A2  die Spec-Stelle existiert doch -- SPEC_08:163
    A3  Variante c, mit Begruendung
    A4  der Seed: die drei Zeilen sind NICHT gleich
    A5  Vollkette 169 Schritte, 321,9 s

`[cmd]` **Selbst gemessen: `dev` unveraendert bei 0 Profilen, 6
Beziehungen, 0 Invites.**

### A2 berichtigt mich

`[read]` **Ich schrieb in den Auftrag: *,,SPEC_02:39 nennt
`display_name`, aber nicht den Erzeuger ? miss, ob eine andere
Spec-Stelle es sagt."***

`[cmd]` **Sie sagt es. `SPEC_08_IMPORT_PIPELINE.md:163`:**

    ## Phase 3: Coach Onboarding
    async function onboardCoach(userId, profileData) {

`[cmd]` **Und `SPEC_07_API.md:10`:** *,,Require `role = coach` in
JWT + aktive Coach-Profil"*.

`[read]` **Zwei Stellen, beide klar** ? **ich habe an der falschen
gesucht.**

### A1 — sauber gescheitert ist besser als leer gefuellt

`[cmd]` **`create_relationship_invite`: `P0002: Aktives
Coach-Profil nicht gefunden`.** `[cmd]`
**`create_pending_invite`: `active_coach_profile_not_found`.**

`[read]` **Kein leerer Name, kein Platzhalter** ? **der Weg sagt,
was fehlt.**

`[cmd]` **Transaktional gemessen, vorher wie nachher 0 / 6 / 0.**

### A4 ist der scharfsinnigste Fund

`[read]` **Ich hatte den Seed als EINEN Fall behandelt.**
`[read]` **Er hat ihn geteilt:**

`[cmd]` **Zwei `active`-Zeilen, auf vor 120 bzw. 45 Tagen
datiert** ? **ihr Snapshot soll NULL bleiben.**

`[cmd]` **Eine offene `invited`-Einladung ohne `started_at`** ?
**sie BRAUCHT einen Snapshot.**

`[cmd]` **Selbst nachgemessen, die C-268-Bedingung:**

    relationships_invited_coach_name_ck
    CHECK (status <> 'invited' OR coach_display_name IS NOT NULL)

`[read]` **Die eine darf den heutigen Namen tragen, weil sie HEUTE
offen ist.** `[read]` **Die beiden anderen nicht, weil sie von
damals sind.**

`[read]` **Haette ich meinen Auftrag befolgt** ? *,,der Seed setzt
den Snapshot NICHT"* ? **waere die Kette an dieser Bedingung
gescheitert.**

### A3 — Variante c, und der Nachsatz zaehlt

> *,,Die beiden Invite-RPCs bleiben danach korrekt als
> Schutzschicht."*

`[read]` **Ein Onboarding-Schritt ersetzt die Pruefung nicht** ?
**er macht sie nur seltener noetig.**

**Abgenommen, C-440 beauftragt.**

