---
nr: E-78
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-450, C-449, C-440]
modul: coach
---

# E-78 — die Coach-Rolle wird vorerst von Hand gesetzt

## Entscheidung

Tom, 2026-09-08:

> ich denke im moment entwickeln wir und setzen es manuell in der
> db. spaeter wird das durch registrierung/anmeldung eines coaches
> geregelt und womoeglich nach rulings oder im adminbereich durch
> uns geprueft. da wird es verschiedenste sachen wie dieses thema
> geben, zb welche module kriegt ein coach, ist er teil von
> marketplace etc

**Variante b.**

## Was jetzt gilt

`[cmd]` **Die Rolle liegt in `auth.users.raw_app_meta_data.role`.**

`[cmd]` **Gesetzt wird sie von Hand** ? **Supabase-Admin-API oder
als `postgres`, nach `061_rollen_admin.sql:52`.**

`[read]` **Kein Vergabepfad in der Anwendung** ? **die bestehende
Entscheidung bleibt.**

`[read]` **Und `onboard_coach` verlangt die Rolle NICHT** ?
**sonst waere es ein Totalschloss bei null Coach-Rollen** (C-449,
A6).

`[cmd]` **`SPEC_07:10` bleibt, wie sie ist** ? **sie beschreibt
den Zielzustand, nicht den heutigen.**

## Was spaeter kommt, und warum es ein eigenes Thema ist

Tom: *,,da wird es verschiedenste sachen wie dieses thema geben."*

`[read]` **Die Rollenfrage ist der kleinste Teil davon.**

**Was zusammengehoert:**

    Registrierung   wie wird jemand Coach?
    Pruefung        wer prueft, nach welchen Regeln?
    Module          welche bekommt ein Coach?
    Marketplace     ist er Anbieter, und ab wann?
    Entzug          was, wenn die Pruefung faellt?

`[read]` **Das ist kein Nebenprodukt der Rollenvergabe** ?
**es ist ein eigener Bereich, und er beruehrt Coach, Market und
Admin.**

`[cmd]` **Das Altrepo hat dazu `apps/admin` mit 319 Dateien und
`docs/modules/auth/` mit 169 KB** ? **die groesste
Moduldokumentation ueberhaupt.**

`[read]` **Bevor daran gebaut wird: lesen.**

## Warum es jetzt nicht gebaut wird

`[cmd]` **Coach ist zu 69 Prozent Attrappe, 5 von 15 Tabellen
leer, 0 Profile** (Lagebericht 2026-09-08).

`[read]` **Ein Aufnahmeverfahren fuer ein Modul zu bauen, das noch
nichts kann, waere die falsche Reihenfolge.**

`[read]` **Erst muss ein Coach etwas TUN koennen** ? **dann lohnt
die Frage, wer einer werden darf.**
