---
nr: C-451
typ: entscheidung
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-450
entscheidung: null
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
---

# C-451 — die Aufnahme eines Coaches

## Befund

Tom, 2026-09-08, zu E-78:

> spaeter wird das durch registrierung/anmeldung eines coaches
> geregelt und womoeglich nach rulings oder im adminbereich durch
> uns geprueft. da wird es verschiedenste sachen wie dieses thema
> geben, zb welche module kriegt ein coach, ist er teil von
> marketplace etc

`[read]` **Die Rollenfrage aus C-450 war der kleinste Teil
davon.**

## Was zusammengehoert

    Registrierung   wie wird jemand Coach?
    Pruefung        wer prueft, nach welchen Regeln?
    Module          welche bekommt ein Coach?
    Marketplace     ist er Anbieter, und ab wann?
    Entzug          was, wenn die Pruefung faellt?

`[read]` **Es beruehrt drei Bereiche:** **`coach`, `market`,
`admin`** ? **und keiner davon ist fertig.**

## Was schon da ist

`[cmd]` **Das Altrepo:**

    apps/admin/                 319 Dateien
    docs/modules/auth/          169 KB, sieben Dateien
                                (API, COMPONENTS, DATABASE,
                                 FEATURES, MIGRATION, README,
                                 RESEARCH)

`[cmd]` **`docs/modules/auth/` ist die GROESSTE
Moduldokumentation** ? **groesser als `human-coach` mit 151 KB.**

`[read]` **Bevor daran gebaut wird: lesen** ?
`docs/lehren/altrepo-karte.md` **sagt, wo.**

`[cmd]` **Und `docs/specs/HumanCoach/SPEC_08_IMPORT_PIPELINE.md`
beschreibt das Onboarding** ? **aber die Aufnahme des COACHES, nicht
des Klienten, steht dort nur als `onboardCoach()`.**

## Warum es wartet

`[cmd]` **Coach ist zu 69 Prozent Attrappe, 0 Profile, 5 von 15
Tabellen leer.**

`[read]` **Ein Aufnahmeverfahren fuer ein Modul, das noch nichts
kann, waere die falsche Reihenfolge.**

`[read]` **Erst muss ein Coach etwas TUN koennen** ? **G-391 baut
das Geruest, das zeigt, was er koennen soll.**
