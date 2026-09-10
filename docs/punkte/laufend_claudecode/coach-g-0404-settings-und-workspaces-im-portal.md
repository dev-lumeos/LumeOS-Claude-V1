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

### A1 — drei Wege hinaus, keiner auf sich selbst

`[cmd]` **Am Schirm gemessen, dunkel:**

    LumeOS        http://localhost:3200          target=_blank
    Marketplace   https://marketplace.lumeos.app rel=noopener noreferrer
    Admin         http://localhost:3210          Akzentpunkt, nie aktiv

    auf sich selbst: NEIN (kein 3220, kein coach.lumeos.app)

`[cmd]` **Bildschirmfoto: `backup/g404-workspaces.png`.**

#### Ein Link nach aussen sieht anders aus — gemessen

**Der Auftrag fragt es ausdruecklich.**

`[cmd]` **`sidebar.tsx:214-229`**, die Workspaces-Gruppe von
`apps/web`, benutzt vier Dinge, die ein Innenlink nicht hat:

    <a> statt linkAs      next/link wuerde einen fremden Server
                          vorab laden wollen
    target="_blank"       eigener Reiter
    rel="noopener         ohne noopener kann die Zielseite auf
      noreferrer"         window.opener zugreifen
    v2-accent-dot         statt aria-current -- ein Aussenlink
                          kann nie "die aktuelle Seite" sein

`[read]` **Das ist keine Kosmetik**, und deshalb genuegte die
`gruppen`-Requisite aus G-402 nicht: **sie rendert jeden Eintrag als
`Link`.**

`[cmd]` **Ergaenzt: `SidebarEintrag.extern`** — ein Schalter, mehr
nicht. `[read]` **Ohne ihn bleibt alles wie bisher**, und `apps/web`
uebergibt ihn nicht.

`[cmd]` **`nav.ts` ist unberuehrt** — die Liste des Portals steht in
`portal-nav.ts`, wie der Auftrag es verlangt.

#### Marketplace zeigt auf die ferne Adresse, und warum

`[cmd]` **Gemessen: unter `apps/` gibt es keine
Marketplace-Anwendung** — es laeuft ortlich nichts auf einem dritten
Port. `[read]` **Der Link nimmt deshalb die Adresse, die `nav.ts`
fuehrt** (`https://marketplace.lumeos.app`) — **dieselbe Wahrheit wie
in `apps/web`, kein zweiter Ort.**

### A2 — elf Felder, drei mit Daten, acht als Attrappe

`[cmd]` **Am Schirm gezaehlt: 11 Felder, 8 Attrappen, 8 mit
Spaltennamen.**

**Die drei mit Daten:**

    Anmelde-Adresse   auth.users.email
    Anzeigename       coach_profiles.display_name  "Coach Lumeos"
    Konto aktiv       coach_profiles.is_active     aktiv

**Die acht ohne Spalte, je mit Namen:**

    business_name       Geschaeftsname
    contact_email       Kontakt-Adresse
    website             Website
    bio                 Selbstbeschreibung
    specialties[]       Fachgebiete
    certifications[]    Nachweise
    tier                Stufe (vier Werte)
    max_clients         Hoechstzahl Klienten

`[cmd]` **Die Felder stammen aus `CoachProfile.tsx:8-14`** im
Vorgaengerrepo, `tier` aus `:53-60`. `[cmd]` **`coach.coach_profiles`
fuehrt sieben Spalten** — `id`, `user_id`, `display_name`, `email`,
`is_active`, `created_at`, `updated_at`.

#### Eine Berichtigung, bevor sie am Schirm stand

`[read]` **Mein erster Entwurf setzte `profil = null` fest** und
haette einen Leerhinweis gezeigt: *„coach_profiles fuehrt 0
Zeilen."*

`[cmd]` **Gemessen: es gibt EINE Zeile** — „Coach Lumeos /
coach@lumeos.app". `[read]` **Der Leerhinweis waere eine
Falschaussage gewesen**, und zwar eine, die niemand geprueft haette.

`[cmd]` **Also einen Leseweg ergaenzt** (`coach_profiles`, drei
Spalten, `maybeSingle`). `[read]` **Nur lesen** — kein Schreibweg,
keine Spalte, keine Migration.

`[read]` **Der Leerzweig bleibt trotzdem:** ein zweiter Coach ohne
Profilzeile saehe sonst ein leeres Feld, und das saehe aus wie ein
Name, den niemand gesetzt hat (E-72).

### A3 — Hinzufuegen und Entfernen, am Schirm bedient

**Tom:** *„deklarier Demo, das wird spaeter definiert."*

`[cmd]` **Nicht nur gezaehlt, sondern gedrueckt:**

    Marken vorher                    5
    „Ausdauer" + Enter               6
    erstes Kreuz geklickt            5
    „Ausdauer" nochmal               5   (abgewiesen)

`[cmd]` **Zwei Listen** (Fachgebiete, Nachweise), **fuenf
Demo-Marken, fuenf Entfernen-Knoepfe.**

`[cmd]` **Die Bedienung folgt `CoachProfile.tsx:37-45`:** Eingabe,
Enter oder Knopf, **kein doppelter Eintrag**, Entfernen je Zeile.

`[read]` **Und der Vermerk sagt es woertlich:** *„Demo — nichts wird
gespeichert. wartet auf: Spalte `specialties[]` in
`coach.coach_profiles`."*

`[cmd]` **Bildschirmfoto nach der Bedienung:
`backup/g404-settings-bedient.png`.**

### A4 — die Abrechnung, und die Antwort auf `subscription_plans`

**Tom:** *„irgendwas darstellen, wird spaeter definiert."*

`[cmd]` **Gebaut: eine Kachel mit zwei Feldern** — die vier Stufen
(`starter` hervorgehoben, wie die Vorgabe des Vorgaengers) und die
Hoechstzahl Klienten. **Beide mit Attrappenvermerk und Spaltenname.**

#### Taugen `subscription_plans` als Anzeige? NEIN

`[cmd]` **Gemessen — drei Zeilen:**

    Lumeos Basic    999 ct / Monat    20 KI-Guthaben
    Lumeos Plus    1999 ct / Monat    50
    Lumeos Pro     2999 ct / Monat   100

`[read]` **Das sind die Abonnements des ENDNUTZERS**, mit
KI-Guthaben — **nicht die Stufen eines Coaches** (`starter`,
`professional`, `business`, `enterprise`). **Gleiche Sache im Namen,
andere in der Bedeutung.**

`[read]` **Sie hier zu zeigen hiesse, dem Coach einen Preis zu
nennen, der fuer ihn nicht gilt.** `[cmd]` **Also nicht gelesen** —
`daten.ts` nennt sie an keiner Stelle, und ein Waechter prueft das.

`[cmd]` **Die Messung steht in der Kachel selbst**, nicht nur hier:
*„Keine Rechnung, keine Zahlung … das sind die Abonnements des
Endnutzers."*

### A5 — wo Settings sitzt, und warum

#### Zuerst: den `settings`-Reiter gibt es nicht

`[read]` **Der Auftrag sagt:** *„Das Portal hat einen
`settings`-Reiter, er zeigt heute `TabLeer`."*

`[cmd]` **Gemessen: nein.** Die sechzehn aus
`module-coach.jsx:923-940` sind `overview … team`; `LEERE_TABS`
fuehrt acht, **`settings` ist keiner davon.** `[read]` **Die Frage
„Reiter oder Bereich" stellt sich also gar nicht** — es gab weder
das eine noch das andere.

#### Die Entscheidung: ein eigener Bereich in einer Gruppe SYSTEM

    [ohne Titel]        Dashboard
    [Kunden]            Klienten · Nachrichten · Check-ins · Alerts
    [Programme]         Plaene
    [Regeln & Rechte]   Regeln · Autonomie · Freigaben
    [ohne Titel]        Auswertung · Team & Audit
    [System]            Einstellungen          <- NEU
    [Workspaces]        LumeOS · Marketplace · Admin   <- NEU

**Drei Gruende, jeder pruefbar:**

`[cmd]` **1 — Die sechzehn Reiter sind die ARBEIT am Klienten.** Sie
kommen aus der Vorlage und beschreiben, was ein Coach mit seinen
Athleten tut. **Die eigenen Stammdaten sind keine Arbeit an einem
Klienten.**

`[cmd]` **2 — `apps/web` trennt genauso:** Module oben, `Settings`
unten unter SYSTEM — **nicht als achtes Modul.** `[read]` **Dieselbe
Struktur, wie Tom sie verlangt hat** (G-401).

`[cmd]` **3 — Ein siebzehnter Reiter waere eine Abweichung von der
Vorlage, die sich nicht belegen liesse.** `[read]` **Die Liste ist
abgelesen, nicht erfunden** (G-401/A2) — wer sie erweitert, muss
sagen woher.

`[cmd]` **Ein Waechter haelt beide Enden fest:** er faellt, wenn die
Vorlage doch einen `settings`-Reiter bekommt (dann waere neu zu
urteilen) **und** wenn die Systemgruppe verschwindet.

#### Und warum unter Settings keine Mockup-Linie steht

`[cmd]` **`settings` hat kein Vorlagen-Gegenstueck** — folglich
rendert `TabReferenz` nichts (E-72: eine leere Linie waere ein
Rahmen ohne Inhalt). `[read]` **Das steht jetzt in der Kachel**,
damit die fehlende Linie nicht wie ein Versehen aussieht.

### A6 — E-72: keine nackte Null

`[cmd]` **Am Schirm gemessen: 0 nackte Nullen, 0 Konsolenfehler.**

`[read]` **Und im Kleinen:** jedes Attrappenfeld nennt die Spalte,
die fehlt; die Demo-Listen nennen, dass nichts gespeichert wird; die
Abrechnungskachel nennt, warum `subscription_plans` nicht taugen.

### A7 — Tests

`[cmd]` **`apps/coach`: 33 pass / 0 fail** — sechs neue Waechter
(vorher 27). `[cmd]` **`apps/web`: 1545 pass / 0 fail,
unveraendert**, `git diff` leer. `[cmd]` **tsc sauber in beiden,
`next lint` sauber.**

**Sabotageprobe, je Waechter einzeln:**

    Verweis auf sich selbst (coach.lumeos.app)  -> ROT
    ein Aussenlink wirklich entfernt            -> ROT
    target am Aussenlink entfernt               -> ROT
    noopener entfernt                           -> ROT
    Systemgruppe umbenannt                      -> ROT
    Spaltenname getilgt                         -> ROT
    Schreibweg im Code eingebaut                -> ROT
    Doppeltpruefung entfernt                    -> ROT
    Vermerk zur Abrechnung entfernt             -> ROT

**Alle zurueckgenommen, 33/33 gruen.**

`[cmd]` **Drei erste Versuche liefen ins Leere** — ein umbenanntes
Feld entfernt keinen Eintrag, und `formAction` stand nur im
Kommentar. `[read]` **Das war mein Messfehler, kein blinder
Waechter:** mit der richtigen Sabotage wurden alle drei rot. **Und
der `formAction`-Waechter prueft jetzt ohne Kommentarzeilen** — er
las sonst seine eigene Begruendung.

### Was in `packages/ui` geaendert wurde

    SidebarEintrag.extern     ein Schalter, wahlfrei

`[cmd]` **Der Zweig rendert dann `<a target="_blank"
rel="noopener noreferrer">` statt `Link`** — dieselbe Form wie die
Workspaces-Gruppe von `apps/web`.

`[read]` **`nav.ts` unberuehrt**, wie der Auftrag verlangt.
`[cmd]` **Gegenprobe: `apps/web` unveraendert** — 1545 Tests, `git
diff` leer.

### Was NICHT passiert ist

**1 — Nichts in `supabase/`:** keine Spalte, keine Tabelle, keine
Migration. `[cmd]` **`git diff -- supabase/` ist leer.**

**2 — Kein Schreibweg:** kein `'use server'`, kein `formAction`,
kein `revalidatePath` in den Einstellungen. **Die Felder tragen
`readOnly`**, die Listen leben im Browser. `[cmd]` **Ein Waechter
prueft es.**

**3 — `apps/web` nicht angefasst.**

**4 — Ein Leseweg ist dazugekommen:** `coach_profiles`, drei
Spalten. `[read]` **Lesen ist keine Datenbankarbeit im Sinne des
Auftrags** — die Tabelle steht seit C-119, ich habe sie nur
gefragt. **Ohne sie haette die Kachel eine Falschaussage gezeigt.**

### Neustart

`[cmd]` **`packages/ui` ist geaendert — Neustart noetig**, beide
Anwendungen laden das Paket einmal.

## Abnahme

_(vom Orchestrator)_
