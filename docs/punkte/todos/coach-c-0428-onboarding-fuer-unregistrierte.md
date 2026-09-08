---
nr: C-428
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-268
entscheidung: null
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
