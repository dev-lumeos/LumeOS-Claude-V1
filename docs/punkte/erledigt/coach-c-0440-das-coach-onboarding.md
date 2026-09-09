---
nr: C-440
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-439
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: ed84ca6f
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  profile: 0
---

# C-440 — das Coach-Onboarding

## Befund

Aus C-439, Codex, 2026-09-08.

`[cmd]` **Die Spec-Stelle existiert doch:**
**`SPEC_08_IMPORT_PIPELINE.md:163` definiert *Coach Onboarding* und
legt in `onboardCoach()` per `createCoachProfile` das Profil mit
eingegebenem Namen an.**

`[cmd]` **Und `SPEC_07_API.md:10` verlangt Coach-Rolle plus aktives
Profil.**

`[read]` **Der Orchestrator hatte behauptet, keine Spec nenne den
Erzeuger** ? **falsch, sie stand da.**

`[cmd]` **Sein Vorschlag: Variante c** ? **ein eigener Schritt vor
der ersten Einladung.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Das Profil anlegen

`[cmd]` **`SPEC_08:163` beschreibt `onboardCoach()`** ? **lies es
und bau den Schreibweg.**

`[read]` **Kein Automatismus beim Konto** ? **wer nie coacht,
bekommt kein Profil.**

`[cmd]` **Und `SPEC_07:10`: Coach-Rolle plus aktives Profil** ?
**miss, wo die Rolle heute liegt.**

`[read]` **Die beiden Invite-RPCs bleiben als Schutzschicht** ?
**dein eigener Satz, und er ist richtig.**

### 2 · Der Seed

`[cmd]` **Deine Unterscheidung ist der Kern:**

    zwei active-Zeilen, auf vor 120/45 Tagen datiert
      -> Snapshot NULL, sie sind historisch

    eine offene invited-Einladung ohne started_at
      -> braucht einen Snapshot, C-268-Bedingung
         (156_coach_invite_identity.sql:51)

`[read]` **Die eine darf den heutigen Namen tragen, weil sie HEUTE
offen ist.** `[read]` **Die beiden anderen nicht, weil sie von
damals sind.**

`[cmd]` **Und die Seed-Pruefung
(`testdaten-einspielen.ts:4919`): 1 benannte statt 3, plus zwei
historische mit leerem Snapshot.**

`[read]` **Bau es so** ? **kein erfundener Rueckwirkungsname.**

### Abnahmebedingungen

    A1  ein Coach ohne Profil legt eines an. Zahl:
        coach_profiles vorher/nachher.
    A2  danach gelingt die Einladung. Belegt.
    A3  wo liegt die Coach-Rolle? Gemessen, mit Fundstelle.
    A4  der Seed: 1 benannte, 2 mit leerem Snapshot.
        Zahlen je Zeile.
    A5  die Pruefung faellt, wenn eine historische einen
        Namen bekommt. Gegenprobe.
    A6  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**Kein Profil beim Anlegen des Kontos** ? **Variante a wurde
verworfen.**
`apps/` nicht anfassen ? **das Formular ist ein UI-Auftrag.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  onboard_coach: Profil 0 -> 1
    A2  danach gelingt die Einladung
    A3  Rolle liegt in auth.users.raw_app_meta_data
        live: 7 Nutzer, 6 ohne, 1 admin, 0 coach
    A4  Seed: 1 benannte, 2 mit leerem Snapshot
    A5  Gegenprobe mit historischem Namen wird erkannt
    A6  Vollkette 422,3 s, SCHEMA VOLLSTAENDIG

`[cmd]` **Selbst gemessen: `onboard_coach` nicht live, 6 Nutzer
ohne Rolle, 1 admin, 0 coach.** `[cmd]` **Nach dem Rollback: 0
Profile, 0 Invites, 0 Snapshots.**

### A3 ist die wichtigste Zeile

`[cmd]` **`061_rollen_admin.sql:52`: Rollen werden bewusst nur
AUSSERHALB der Anwendung vergeben.**

> *,,C-440 erfindet daher keine Rollenvergabe."*

`[read]` **Es gibt heute null Coach-Rollen und null Funktionen, die
sie pruefen** ? **er haette eine erfinden koennen, um `SPEC_07:10`
zu erfuellen.**

`[read]` **Stattdessen hat er gemessen, wo sie liegt, und die
Stelle genannt, die es verbietet.**

`[cmd]` **Damit ist `SPEC_07:10` halb umgesetzt** ? **das aktive
Profil ja, die Rolle nicht** ? **und das ist benannt, nicht
uebergangen.**

### Die Rotprobe zaehlt

`[cmd]` **Aufbaukette gruen in 460,8 s, der Test scheiterte
erwartungsgemaess NUR an `coach.onboard_coach(text)`.**

`[read]` **Also faellt er an der Sache, nicht am Aufbau** ? **eine
Rotprobe, die aus dem falschen Grund rot wird, misst nichts.**

`[cmd]` **Danach gruen in 0,84 s, und C-428 bleibt gruen.**

### A4/A5 — die Dreiteilung ist gebaut

`[cmd]` **Zwei historische ohne Snapshot, eine aktuelle mit
Namen** ? **die Endpruefung verlangt 1 / 2 / 0.**

`[cmd]` **Und die Gegenprobe: ein historischer Name wird
erkannt.**

`[read]` **Sein eigener Fund aus C-439, jetzt als Waechter** ?
**niemand kann den Seed spaeter zurueckdrehen, ohne dass es
auffaellt.**

**Abgenommen. Einspielen als C-442 erfasst, nicht sofort
beauftragt.**

