---
nr: G-404
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-403
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/coach/src/components/portal-schale.tsx
zahlen:
  gemessen: 2026-09-08
  felder: 8
---

# G-404 — Settings und Workspaces im Portal

## Auftrag

Tom, 2026-09-08:

> ich will nicht settings und workspaces von apps/web kopiert
> haben. das soll fuer coach angelegt werden ? mit den eigenen
> settings und eigenen links zu lumeos, marketplace, admin.

> abrechnung: irgendwas darstellen, wird spaeter definiert.
> specialties/certifications: deklarier Demo, das wird spaeter
> definiert.

> noch gar nichts mit db ? wir machen nur ein mockup.

**Beauftragt am 2026-09-08.**

`[read]` **NUR DIE FORM.** `[read]` **Keine Tabelle, keine Spalte,
kein Schreibweg.**

## 1 · Workspaces — eigene Liste

`[read]` **Aus dem Portal fuehren drei Links HINAUS:**

    LumeOS        http://localhost:3200
    Marketplace
    Admin         http://localhost:3210

`[read]` **NICHT *Coach Portal*** ? **das waere ein Verweis auf
sich, und genau deshalb hast du die Gruppe in G-402
weggelassen.**

`[cmd]` **Die `gruppen`-Requisite aus G-402 ist der Weg** ?
**`nav.ts` bleibt unberuehrt.**

`[read]` **Miss, ob ein Link nach aussen anders aussehen muss als
einer innerhalb** ? **`apps/web` hat dafuer eine Form, sieh sie
dir an.**

## 2 · Settings — die des Coaches

`[cmd]` **Die Felder aus `CoachProfile.tsx:8-12` im Altrepo:**

    business_name      Geschaeftsname
    bio                Selbstbeschreibung
    contact_email      getrennt von der Anmelde-Adresse
    website
    specialties[]      Fachgebiete, Hinzufuegen/Entfernen
    certifications[]   Nachweise
    max_clients        Vorgabe 25
    tier               starter | professional |
                       business | enterprise

`[cmd]` **`coach_profiles` traegt heute NUR** `display_name`,
`email`, `is_active`.

`[read]` **Also: drei Felder mit Daten, acht als Attrappe** ?
**mit Vermerk und dem Namen der fehlenden Spalte, wie ueberall.**

### Was Tom zu zweien gesagt hat

`[read]` **Abrechnung:** *,,irgendwas darstellen, wird spaeter
definiert."*

`[cmd]` **`marketplace.subscription_plans` hat drei Zeilen** ?
**miss, ob sie als Anzeige taugen.**

`[read]` **Wenn nicht: eine Kachel mit `tier` und einem
Attrappenvermerk** ? **keine Rechnung, keine Zahlung.**

`[read]` **`specialties` und `certifications`:**
*,,deklarier Demo, das wird spaeter definiert."*

`[read]` **Also: die Liste mit Hinzufuegen und Entfernen bauen,
mit Demo-Eintraegen** ? **und der Vermerk sagt, dass die Werte
nicht gespeichert werden.**

## 3 · Wo Settings hingehoert

`[cmd]` **Das Portal hat einen `settings`-Reiter** ? **er zeigt
heute `TabLeer`.**

`[read]` **Und `apps/web` fuehrt Settings in der Gruppe SYSTEM,
unten in der Seitenleiste.**

`[read]` **Entscheide, was passt** ? **und begruende es.**

`[read]` **Ein Reiter unter sechzehn ist etwas anderes als ein
eigener Bereich.**

## Abnahmebedingungen

    A1  Workspaces: drei Links hinaus, keiner auf sich
        selbst. Bildschirmfoto.
    A2  Settings: 11 Felder, davon 3 mit Daten,
        8 als Attrappe mit Spaltennamen.
    A3  specialties und certifications: Liste mit
        Hinzufuegen und Entfernen, Demo-Eintraege,
        Vermerk dass nichts gespeichert wird.
    A4  Abrechnung: eine Kachel, mit Attrappenvermerk.
        Und: taugen subscription_plans als Anzeige?
    A5  wo Settings sitzt, und warum. Begruendet.
    A6  E-72: keine nackte Null.
    A7  apps/coach 25/25 oder mehr, apps/web 1545
        unveraendert.

## Was nicht zu tun ist

**NICHTS in `supabase/`** ? **Tom: *,,noch gar nichts mit db"*.**
**Keine Spalte, keine Tabelle, kein Schreibweg.**
**`apps/web` NICHT anfassen.**
**`nav.ts` in `packages/ui` NICHT aendern** ? **die
`gruppen`-Requisite reicht.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **Port 3220 laeuft** (PID 1260648, losgeloest gestartet).
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
