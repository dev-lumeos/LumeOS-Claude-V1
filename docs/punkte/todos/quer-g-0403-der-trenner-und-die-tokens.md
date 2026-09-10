---
nr: G-403
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-402
entscheidung: null
beruehrt:
  dateien:
    - packages/ui/src/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-403 — der Trenner und die Tokens, zweite Haelfte

## Befund

Aus G-402, Claude Code, 2026-09-08.

`[cmd]` **Der Referenz-Trenner liegt jetzt in `packages/ui`, die
Kopie in `apps/coach` ist weg.**

`[cmd]` **`apps/web` behaelt seine eigene** ? **der Auftrag verbot,
sie anzufassen.**

> *,,Die Tokens habe ich bewusst nicht verschoben: ein dritter Ort
> im Paket haette drei Dateien statt zwei ergeben, solange
> `apps/web` nicht mitziehen darf."*

`[read]` **Beide Male dieselbe Ursache** ? **die Regel
*,,`apps/web` nicht anfassen"* verhindert das Aufraeumen.**

## Was zu entscheiden ist

`[read]` **Ein Auftrag, der `apps/web` ausdruecklich erlaubt** ?
**nur fuer diese zwei Sachen:**

    1  referenz-trenner: apps/web nutzt den aus packages/ui
       -> eine Fassung statt zwei

    2  die Tokens: lume.css und apps/coach/tokens.css
       -> eine Fassung im Paket, --acc bleibt lokal

`[cmd]` **Claude Code hat gemessen: nur `--acc` weicht ab,
absichtlich.**

`[read]` **Mit Gegenprobe: `apps/web` sieht danach gleich aus,
1545 Tests bleiben gruen.**

## Settings und Workspaces — eigene, nicht kopierte

Tom, 2026-09-08: *,,ich will nicht settings und workspaces von
apps/web kopiert haben. das soll fuer coach angelegt werden ? mit
den eigenen settings und eigenen links zu lumeos, marketplace,
admin."*

### Workspaces im Portal

`[read]` **Aus dem Portal fuehren drei Links hinaus:**

    LumeOS        localhost:3200  -- die eigene Nutzersicht
    Marketplace                   -- als Anbieter
    Admin         localhost:3210

`[read]` **Nicht *Coach Portal* selbst** ? **das waere ein Verweis
auf sich, und genau deshalb hat Claude Code die Gruppe
weggelassen.**

`[cmd]` **`nav.ts` in `packages/ui` fuehrt heute die Liste von
`apps/web`** ? **das Portal braucht seine eigene, ueber die
`gruppen`-Requisite aus G-402.**

### Settings im Portal — die des COACHES

`[cmd]` **`coach.coach_profiles` hat heute SIEBEN Spalten:**

    id, user_id, display_name, email,
    is_active, created_at, updated_at

`[cmd]` **Und `CoachProfile.tsx:8-12` im Altrepo zeigt, was ein
Coach einstellt:**

    business_name      der Geschaeftsname
    bio                die Selbstbeschreibung
    contact_email      getrennt von der Anmelde-Adresse
    website
    specialties[]      Fachgebiete, mit Hinzufuegen/Entfernen
    certifications[]   Nachweise
    max_clients        wie viele Klienten, Vorgabe 25
    tier               starter | professional |
                       business | enterprise

`[read]` **Sieben Felder fehlen, plus `tier`.**

`[cmd]` **Und Coach-EINSTELLUNGEN gibt es gar nicht** ? **null
Tabellen mit `coach_setting` oder `coach_config`.**

`[read]` **Claude Code hat sie in G-402 fuer den Alarm-Erzeuger
verlangt** (*,,eine Tabelle fuer Coach-Einstellungen"*) ? **hier
ist derselbe Bedarf.**

### Was daraus folgt

**1** ? **Ein Codex-Auftrag:** `coach_profiles` **um die sieben
Felder, und eine Tabelle fuer Einstellungen.**

`[read]` **`tier` ist eine eigene Frage** ? **es beruehrt
Abrechnung, und die ist nicht entschieden** (C-451).

**2** ? **Ein UI-Auftrag:** **der Settings-Bereich im Portal, mit
eigener `gruppen`-Liste fuer Workspaces.**

`[read]` **Die Reihenfolge ist wie ueberall: erst die Spalten,
dann die Oberflaeche.**

## Und zwei Zeilen aus G-402

`[cmd]` **Workspaces:** `nav.ts` **fuehrt *Coach Portal* selbst** ?
**im Portal waere das ein Verweis auf sich.**

`[cmd]` **Settings:** `SETTINGS_ENTRY` **zeigt auf `/v2/settings`,
das es in `apps/coach` nicht gibt.**

`[read]` **Soll das Portal beides tragen?** `[read]` **Dann
braucht es eigene Ziele** ? **Workspaces zurueck nach
`apps/web`, Settings auf den Portal-Reiter.**