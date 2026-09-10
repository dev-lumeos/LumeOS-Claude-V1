---
nr: C-458
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-403
entscheidung: null
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  spalten_heute: 7
  spalten_noetig: 15
---

# C-458 — was ein Coach einstellt

## Befund

Tom, 2026-09-08: *,,eigene settings fuer coach."*

`[cmd]` **`coach.coach_profiles`, sieben Spalten:**

    id, user_id, display_name, email,
    is_active, created_at, updated_at

`[cmd]` **`CoachProfile.tsx:8-12` im Altrepo:**

    business_name      Geschaeftsname
    bio                Selbstbeschreibung
    contact_email      getrennt von der Anmelde-Adresse
    website
    specialties[]      Fachgebiete
    certifications[]   Nachweise
    max_clients        Vorgabe 25
    tier               starter | professional |
                       business | enterprise

`[read]` **Sieben Felder fehlen.**

## Und Einstellungen gibt es gar nicht

`[cmd]` **Null Tabellen mit `coach_setting` oder `coach_config`.**

`[cmd]` **Claude Code hat sie in G-402 fuer den Alarm-Erzeuger
verlangt:** *,,severity, kind, eine Doppelsperre ueber 24 h, eine
Tabelle fuer Coach-Einstellungen, und Adherence als Zahl."*

`[read]` **Zweimal derselbe Bedarf** ? **einmal fuer das Profil,
einmal fuer die Alarmschwellen.**

## Was zu klaeren ist, bevor gebaut wird

`[read]` **`tier` beruehrt die Abrechnung** ? **und die ist nicht
entschieden** (C-451: Registrierung, Pruefung, Module,
Marketplace).

`[read]` **Miss, ob `tier` heute etwas bewirkt** ? **oder ob es
eine Anzeige ohne Wirkung waere** (C-426: ein Regler ohne
Wirkung).

`[cmd]` **`marketplace.subscription_plans` hat drei Zeilen** ?
**pruefen, ob `tier` dorthin gehoert statt ins Profil.**

## Was `specialties` und `certifications` sind

`[read]` **Zwei Listen mit Hinzufuegen und Entfernen** ?
`text[]` **oder eine eigene Tabelle?**

`[cmd]` **`SPEC_02_ENTITIES.md` in `docs/specs/HumanCoach/`
nachsehen** ? **sie nennt `display_name`, vielleicht auch diese.**

`[read]` **Und ob sie kuratiert sind** ? **frei eingetippte
Fachgebiete lassen sich nicht durchsuchen.**

## Zurueckgestellt 2026-09-08

Tom: *,,noch gar nichts mit db, wir machen nur ein mockup."*

`[read]` **Kein Codex-Auftrag.** `[read]` **Die Spalten kommen,
wenn die Form steht und Tom sie gesehen hat.**

`[cmd]` **Was hier gemessen ist, bleibt als Vorlage:** **sieben
fehlende Felder aus `CoachProfile.tsx:8-12`.**

**Der Bau geht als G-404 an die Oberflaeche.**
