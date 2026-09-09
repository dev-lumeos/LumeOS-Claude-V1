---
nr: C-428
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-268
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: cd006c98
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
---

# C-428 — das Onboarding fuer Unregistrierte

## Befund

Aus C-268, Codex, 2026-09-08:

> *,,Das vollstaendige SPEC-08-Onboarding per E-Mail/Token fuer noch
> nicht registrierte Klienten braucht wegen
> `relationships.client_id NOT NULL` einen eigenen
> Schema-Schreibweg; ich habe ihn nicht vorgetaeuscht."*

`[cmd]` **Auf `dev` ist `client_id` bereits nullable** — **zu
messen, ob die Kette es auch so erzeugt.**

## Was die Spec vorsieht

`[cmd]` **`SPEC_08_IMPORT_PIPELINE.md:203-236`, Phase 4:**

    const invite = await createInviteToken(coachId, clientEmail)
    const cc = await createCoachClient({
      coach_id: coachId, client_email: clientEmail,
      status: 'pending',
    })

`[read]` **Kein `client_id`** — **der Eingeladene ist noch kein
Nutzer.**

`[cmd]` **Und danach: Standardrechte, Autonomiestufe, Einladung
senden** — **alles vor der Annahme.**

## Warum es zaehlt

`[read]` **Der heutige Weg setzt eine UUID voraus** — **der Coach
kann nur einladen, wer schon da ist.**

`[read]` **Das ist kein Onboarding, sondern eine Verknuepfung.**

`[cmd]` **`medical: 'none'` als Vorgabe steht in derselben
Spec-Stelle** (SPEC_08:226) — **die Rechte entstehen mit der
Einladung, nicht mit der Annahme.**

## Gemessen am 2026-09-08, vor der Auftragsvergabe

`[cmd]` **`coach` hat 14 Tabellen** ? **`pending_invites` ist nicht
dabei.**

`[cmd]` **`relationships.client_id`: NOT NULL.**
`[cmd]` **`relationship_change_log.client_id`: ebenfalls NOT
NULL.**

`[read]` **Dein eigener Befund aus C-268:** **nullable machen haette
nicht gereicht** ? **der Ausloeser koennte eine Vorab-Einladung gar
nicht protokollieren.**

`[cmd]` **Und `SPEC_08` nennt den Token zweimal:** Zeile 209
(`createInviteToken`) **und 235** (`sendInviteEmail`).

## Auftrag — `coach.pending_invites`

**Mitbeauftragt: C-171.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Dein eigener Vorschlag

`[cmd]` **Aus C-268:**

> *,,`coach.pending_invites` getrennt von `relationships`: Coach,
> normalisierte E-Mail, Token-Hash, Ablauf, Status, Rechteentwurf.
> Bei Annahme entsteht atomar die echte Beziehung."*

`[read]` **Bau ihn** ? **eine Einladung ist etwas anderes als eine
Beziehung.**

`[cmd]` **`SPEC_08:203-236` beschreibt den Ablauf:** **Token,
`status: 'pending'`, Standardrechte, Autonomiestufe, Mail mit
Coach-Namen.**

`[cmd]` **Und `medical: 'none'` als Vorgabe** (SPEC_08:226) ?
**die Rechte entstehen mit der Einladung, nicht mit der Annahme.**

### 2 · Der Token

`[read]` **Ein Hash, nicht der Token selbst** ? **wer die Datenbank
liest, darf keine Einladung annehmen koennen.**

`[read]` **Und ein Ablauf** ? **eine Einladung, die nie verfaellt,
ist ein offener Zugang.**

`[cmd]` **Miss, ob die Spec eine Frist nennt.**

### 3 · Die Annahme

`[read]` **Atomar:** **aus der Einladung wird die Beziehung, die
Rechte werden uebernommen, der Token verfaellt.**

`[cmd]` **Wie `book_wallet_purchase`** (C-419) **und
`decide_stack_curation_candidate`** (C-423) ? **ein Fehler
hinterlaesst keinen Teilzustand.**

### 4 · C-171 — neun Konstanten ohne Tabelle

`[read]` **Lies den Punkt und miss, was heute davon steht.**

`[cmd]` **Medical hat seit C-429 drei neue Tabellen** ? **vielleicht
tragen sie einen Teil.**

### Abnahmebedingungen

    A1  eine Einladung an eine E-Mail ohne Konto. Zahl:
        pending_invites vorher/nachher.
    A2  der Token liegt als Hash. Belegt.
    A3  Annahme: Beziehung entsteht, Rechte uebernommen,
        Token verfaellt. Je gemessen.
    A4  ein Fehler bei der Annahme hinterlaesst keinen
        Teilzustand. Belegt.
    A5  RLS: ein fremder Coach sieht die Einladung nicht.
    A6  C-171: Stand gemessen, offen oder geschlossen mit Grund.
    A7  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**`relationships.client_id` nicht nullable machen** ? **dein
eigener Befund sagt, es reicht nicht.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-386.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  unregistrierte E-Mail: pending_invites 0 -> 1
    A2  Token nur als SHA-256-Hash, 64 Hexzeichen
    A3  Annahme: je 1 Beziehung, Permissions, Autonomy
        Invite accepted, Token-Hash NULL
    A4  erzwungener Fehler: Beziehung 0, Invite weiter pending
        MIT Hash, keine Autonomy-Zeile
    A5  fremder Coach sieht 0 Einladungen
    A6  C-171 bleibt offen, mit Messung
    A7  Vollkette 169 Schritte, 340,0 s

`[cmd]` **Selbst gemessen: nicht live, und C-171 stimmt genau** ?
`symptoms`, `symptom_biomarker_map`, `appointments`,
`health_timeline` **da,** `ocr_extracted` **und** `correlations`
**fehlen.**

### A4 ist die beste Stelle

`[cmd]` **Erzwungener Fehler NACH dem Beziehungs-Insert:**

    Beziehung        0
    Invite           weiter pending, MIT Hash
    Autonomy-Zeile   keine

`[read]` **Der Hash ist der Punkt.** `[read]` **Waere er beim
Fehlschlag geloescht worden, waere die Einladung unbrauchbar
geblieben** ? **eine Zeile, die *pending* sagt und keinen Token
mehr hat.**

`[read]` **Ein halber Rueckbau ist schlimmer als keiner.**

### A2 — der Hash statt des Tokens

`[cmd]` **SHA-256, 64 Hexzeichen.**

`[read]` **Wer die Datenbank liest, kann keine Einladung
annehmen** ? **das war die Bedingung, und sie ist erfuellt.**

`[cmd]` **Und bei der Annahme wird er NULL** ? **eine angenommene
Einladung laesst sich nicht zweimal annehmen.**

### Und `client_id` blieb NOT NULL

`[read]` **Dein eigener Befund aus C-268 hat sich durchgesetzt:**
**nullable machen haette nicht gereicht.**

`[cmd]` **Stattdessen eine eigene Tabelle** ? **eine Einladung ist
etwas anderes als eine Beziehung.**

### Eine Berichtigung

`[cmd]` **`7b3d7e55` war kein fremder Prozess** ? **das war der
Orchestrator, ein `docs/`-Commit einer Punktdatei.**

`[cmd]` **Deine zwei Dateien liegen unangetastet offen.**

`[read]` **Aber die Beobachtung war richtig und wichtig** ? **wer
waehrend seiner Arbeit einen fremden Commit sieht, soll es
melden.**

**Abgenommen, Einspielen als C-438 beauftragt.**

