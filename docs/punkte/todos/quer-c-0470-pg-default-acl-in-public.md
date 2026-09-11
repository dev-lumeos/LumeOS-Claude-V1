---
nr: C-470
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-468
entscheidung: null
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
---

# C-470 — pg_default_acl vergibt in public alles

## Befund

Aus C-468, Claude Code, 2026-09-08:

> *,,Nach dem ersten Lauf hatte `authenticated` UPDATE und
> TRUNCATE ? obwohl die Datei nur `GRANT SELECT` vergibt.
> Ursache: `pg_default_acl` vergibt in `public` bei jeder neuen
> Tabelle `arwdDxtm` an alle drei Rollen."*

`[cmd]` **Nachgemessen:**

    user_display_preferences   INSERT, SELECT, UPDATE, DELETE
    profiles                   INSERT, SELECT, UPDATE
    koerperflaechen            SELECT     <- mit REVOKE ALL

`[read]` **Wer in `public` eine Tabelle anlegt und nur
`GRANT SELECT` schreibt, bekommt trotzdem Vollzugriff.**

## Warum es zaehlt

> *,,RLS fing es ab, aber aus dem falschen Grund."*

`[read]` **Zwei Schutzschichten** ? **Rechte und RLS.**

`[read]` **Wenn die Rechte offen sind und nur RLS haelt, reicht
eine vergessene Policy.**

`[cmd]` **Und Tom hat heute entschieden, dass die
Muskelhierarchie nach `public` gehoert** ? **weitere Tabellen
werden folgen.**

## Was zu messen ist

**1** ? **Welche Tabellen in `public` haben mehr Rechte als
noetig?**

`[cmd]` **Drei Tabellen gemessen, zwei mit Schreibrechten.**

`[read]` **Sind sie gewollt?** `profiles` **braucht UPDATE, damit
ein Nutzer sein Profil aendert** ? `user_display_preferences`
**vermutlich auch.**

`[read]` **Aber das gehoert geprueft, nicht angenommen.**

**2** ? **Gilt dasselbe in den Fachschemata?**

`[cmd]` **`pg_default_acl` je Schema messen.**

**3** ? **Ein Waechter.**

`[read]` **Eine Pruefung, die jede Tabelle gegen ihre erwarteten
Rechte haelt** ? **wie `punkte-pruefen.mjs` einen Sollstand
fuehrt.**

`[cmd]` **`ssot-schema.mjs` zaehlt schon Policies** ? **dieselbe
Bauform.**

## Was NICHT zu tun ist

`[read]` **Keine Rechte entziehen, ohne zu messen, wer sie
braucht.**

`[cmd]` **`profiles` ohne UPDATE waere ein Ausfall.**
