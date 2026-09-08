---
nr: C-268
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-08-25
braucht: []
kind_von: C-225
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: ["auth.users", "public.profiles"]
  dateien: []
zahlen: null
---

# C-268 - Beim Einladen gibt es keine Namensaufloesung

## Befund

(neu
  2026-08-25). Aus C-225, von Fable gemeldet.

  `[cmd]` Eingeladen wird heute **per UUID**. Die Kachel zeigt Rolle
  und Kurzkennung — kein Name, keine E-Mail.

  `[read]` **Fable hat es gemeldet statt danebengebaut:**
  `auth.users` ist fuer Clients bewusst nicht lesbar. Eine Aufloesung
  braucht eine **SECURITY-DEFINER-Funktion** in der Datenbank.

  `[read]` **Und es haengt an einer aelteren Frage:** `[cmd]`
  `coach_profiles` existiert nicht (`to_regclass` ist `null`), und
  `public.profiles` fuehrt kein Namensfeld. **Solange keine
  Namensquelle existiert, loest auch eine Funktion nichts auf.**

  **Zu tun:** erst entscheiden, woher der Name kommt — dann die
  Funktion. Gehoert zu Codex.

## Auftrag

**Mitbeauftragt mit A-33 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-01

`[cmd]` **Es gibt einen ungenutzten E-Mail-nach-UUID-Helfer, aber
keine Namensquelle.** `[cmd]` **Eingeladene sehen Rolle, Status und
Kurz-UUID.**

`[read]` **Nicht der Weg fehlt, sondern der Name.**

`[read]` **Und die Frage dahinter ist eine Datenschutzfrage:** **darf
ein Eingeladener den Namen des Einladenden sehen, bevor er
zugestimmt hat?** `[cmd]` **Seit heute gibt es
`coach.client_consent_log`** — der Ort, an dem so etwas stuende.

## Auftrag

**Mitbeauftragt mit G-324 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Die Spec beantwortet es — C-268 ist die falsche Frage

**Nachgelesen am 2026-09-08, `docs/specs/HumanCoach/`.**

`[cmd]` **`SPEC_08_IMPORT_PIPELINE.md:203-236`, Phase 4:**

    async function onboardClient(coachId, clientEmail, settings) {
      const invite = await createInviteToken(coachId, clientEmail)
      const cc = await createCoachClient({
        coach_id: coachId,
        client_email: clientEmail,
        status: 'pending',
      })
      ...
      await sendInviteEmail(clientEmail, invite.token,
                            getCoachName(coachId))
    }

`[read]` **Der Coach laedt ueber die E-Mail ein.** **Ein Name des
Klienten kommt nirgends vor.**

`[cmd]` **Der Name flieszt in die ANDERE Richtung:**
`getCoachName(coachId)` **geht in die Einladungsmail** — **damit der
Eingeladene weiss, wer ihn einlaedt.**

`[read]` **Und das ergibt Sinn:** **wer eingeladen wird, ist noch
kein Nutzer.** **Sein Name entsteht, wenn er annimmt.**

`[cmd]` **`display_name` in `SPEC_02_ENTITIES.md:39` und
`SPEC_06:37` gehoert zum Coach-Profil** — **nicht zum Klienten.**

## Was daraus folgt

`[read]` **Es fehlt keine Namensaufloesung** — **es fehlt der
Coach-Name in der Einladung.**

`[cmd]` **`coach.relationships` traegt sechs Zeilen** — **zu
messen, ob der Coach-Name beim Einladen mitgeht.**

`[read]` **Und der Orchestrator hat Tom eine Entscheidung
vorgelegt, die in der Spec steht** — **statt sie nachzulesen.**

## Neu gefasst

`[read]` **Zu bauen: die Einladung traegt den Coach-Namen.**

`[read]` **Nicht zu bauen: eine Suche nach dem Namen des
Eingeladenen** — **den gibt es zum Zeitpunkt der Einladung nicht.**
