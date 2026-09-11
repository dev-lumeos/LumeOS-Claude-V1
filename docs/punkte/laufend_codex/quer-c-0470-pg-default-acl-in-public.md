---
nr: C-470
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-468
entscheidung: null
agent: codex
beauftragt: 2026-09-08
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

## Recherchiert 2026-09-08 — der Waechter EXISTIERT

`[cmd]` **`supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`**
? **828 Zeilen, 37 KB.**

`[cmd]` **`docs/ssot/53-kettenluecke.md` beschreibt ihn:**

> *,,Geprueft wird die GENAUE Rechtemenge je Rolle. Eine Liste,
> die nur *mindestens diese Rechte* prueft, sieht den
> gefaehrlicheren Fall nicht ? ein `GRANT ALL` auf einer
> Stammdatentabelle bestuende sie."*

> *,,Zusaetzlich schlaegt eine NICHT VORGESEHENE ROLLE an: traegt
> eine Tabelle Rechte fuer `anon`, meldet die Pruefung das."*

`[read]` **Genau, was C-470 verlangt** ? **es ist gebaut.**

## Aber er prueft NUR nutrition

`[cmd]` **Gemessen: ein einziges Schema.**

`[cmd]` **`koerperflaechen` kommt nicht vor.**

`[cmd]` **LumeOS hat 186 Tabellen in neun Schemata.**

`[read]` **Der Waechter deckt einen Bruchteil.**

## Und `53-kettenluecke.md` kennt die Falle schon

> *,,`ALTER DEFAULT PRIVILEGES IN SCHEMA nutrition GRANT ALL ON
> TABLES TO service_role` ? `ON TABLES` umfasst in Postgres auch
> SICHTEN, der Objekttyp in `pg_default_acl` ist `r` fuer
> beide."*

`[read]` **Dieselbe Mechanik wie in C-468** ? **nur dort fuer
`public` und `authenticated`.**

`[cmd]` **Und die Lehre dort:** *,,Die Datenbank verhaelt sich
richtig; MEINE SOLLLISTE war falsch."*

## Der Auftrag ist also eine ERWEITERUNG

`[read]` **Nicht neu bauen** ? **die acht fehlenden Schemata
aufnehmen.**

    training      supplements   medical
    goals         coach         marketplace
    public        buddy

`[cmd]` **Je Tabelle die erwartete Rechtemenge** ? **wie in
`53-kettenluecke.md` beschrieben.**

`[read]` **Und wo die Erwartung nicht klar ist: MESSEN, was
heute da ist, und die Zeile mit Herkunft belegen** ? **nicht
raten, was richtig waere.**

## Was zuerst zu messen ist

`[cmd]` **`pg_default_acl` je Schema** ? **welche Schemata
vergeben Vollrechte?**

`[cmd]` **C-468 hat es fuer `public` gemessen:** `arwdDxtm` **an
alle drei Rollen.**

`[read]` **Gilt das ueberall, oder ist `public` besonders?**

## Abnahmebedingungen

    A1  pg_default_acl je Schema. TABELLE.
    A2  der Waechter prueft alle neun Schemata.
    A3  je Tabelle die Rechtemenge mit Herkunft
        (welche Datei vergibt sie?).
    A4  Gegenprobe: ein GRANT ALL eingebaut -> rot.
        Wieder entfernt.
    A5  was heute ZU VIEL hat: Liste, nicht behoben.
        (Rechte entziehen ist ein eigener Punkt.)
    A6  laeuft in `pnpm gate`.
    A7  Vollkette, Punktelauf.

## Was NICHT zu tun ist

`[read]` **Keine Rechte entziehen** ? **`profiles` ohne UPDATE
waere ein Ausfall.**

`[read]` **Erst messen, dann entscheidet Tom, was weg soll.**

**`apps/` und `packages/ui` nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
