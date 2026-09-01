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
