---
nr: G-241
typ: entscheidung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: E-26
agent: codex
beauftragt: 2026-09-08
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-241 — zwei Reiterschnitte im Medical-Mockup

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **`module-medical.jsx` (810 Zeilen) fuehrt sechs Reiter:**
Overview · Labs · Medications · History · Documents · Appointments.

`[cmd]` **`module-medical-v2.jsx` (819 Zeilen) fuehrt fuenf:**
Dashboard · Biomarkers · Import · Tracking · Insights — **mit dem
Vermerk *,,5 spec tabs"*.**

`[read]` **Beide liegen nebeneinander im selben Ordner.** `[cmd]` Der
gebaute Stand hat `tab-biomarker`, `tab-tracking`, `tab-wirkstoffe`.

**Welcher Schnitt gilt?** `[read]` `History`, `Documents` und
`Appointments` gibt es im v2-Schnitt nicht — **sind sie entfallen oder
verschoben?**

## Berichtigung, 2026-08-28

**Der gebaute `/v2/`-Stand ist der Massstab, nicht der Mockup.**

**Tom:** *,,theme-v1 ist das claude design von welchem wir v2
abgeleitet haben ... also ist theme-v1 nur noch eine ideen struktur
falls uns in v2 was fehlt."*

`[read]` **Dieser Punkt entstand aus der Modulstand-Erhebung, die den
Mockup fuer den Sollzustand hielt.** `[read]` **Ein Unterschied
zwischen Mockup und `/v2/` ist damit kein Befund mehr** — er ist
hoechstens eine Frage, ob in v2 etwas fehlt.

`[cmd]` **In G-249 hat die falsche Richtung 1.009 Zeilen gekostet:**
eine zweite Ansicht wurde neben eine bestehende gebaut, weil ich den
Entwurf fuer den Massstab hielt.

`[read]` **Vor einem Auftrag zu klaeren:** ist hier wirklich etwas
offen, oder war nur die Blickrichtung falsch?

## Entschieden

**E-26, 2026-08-29.** Die Begruendung steht dort.

## Gemessen am 2026-09-08, vor der Auftragsvergabe

`[cmd]` **`medical.lab_reports` traegt `file_ref text`, 10 Zeilen.**

`[cmd]` **`storage.buckets`: keine.**

`[read]` **Die Spalte weist auf eine Datei, die nirgends liegen
kann.**

`[cmd]` **Keine Tabelle fuer Termine, keine fuer Dokumente.**

`[cmd]` **27 Tabellen in `medical`** — **Biomarker, Injektionen,
Medikamente, Symptome, Bedingungen.**

## Auftrag — Dokumente und Termine

**Mitbeauftragt: C-426, C-428.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt Medical**
— **15 Dateien genannt.**

`[cmd]` **Dann `docs/specs/Medical/SPEC_06_DATABASE_SCHEMA.md` und
`SPEC_08_IMPORT_PIPELINE.md`.**

`[read]` **Und `E-26` selbst** — **Tom hat beide Reiter begruendet,
nicht nur genannt.**

### 1 · Documents — das Original bleibt

Tom, E-26: *,,seine original pdf/fotos/etc von labresults verfuegbar
hat und nicht nur eingelesen."*

`[cmd]` **`file_ref` steht da, ein Bucket nicht.**

`[read]` **Miss, was die Spec zum Ablegen sagt** — **und was
Supabase Storage hier braucht.**

`[read]` **Drei Sorten nennt Tom:** **Laborberichte im Original,
aerztliche Rezepte und Berichte, alles Uebrige.**

`[cmd]` **`user_medications` darf erst gebaut werden, wenn
Verschluesselung und Schluesselverwaltung stehen** — **fuer
Dokumente gilt dasselbe zu pruefen.**

### 2 · Appointments — neu

Tom, E-26: *,,seine arzttermine, lab termine, etc in der plattform
verwalten."*

`[cmd]` **Kein Gegenstueck im Schema** — **das ist Neubau, kein
Anschluss.**

`[read]` **Miss, ob die Spec eine Form vorgibt.**

### 3 · History — wo ist er geblieben?

`[cmd]` **E-26:** *,,`History` ist vermutlich in `tracking`
aufgegangen. Das gehoert gemessen."*

`[read]` **Also messen, nicht vermuten.**

### 4 · C-426 — acht Autonomieachsen

`[cmd]` **`coach.client_autonomy` traegt acht Achsen, das Altrepo
kennt eine.**

`[read]` **Miss, was `SPEC_04_FEATURES.md` und
`SPEC_05_COACH_WORKFLOWS.md` zu den Stufen sagen** — **und ob die
Fuenferskala des Altrepos noch gilt.**

`[read]` **Nicht bauen, nur messen und melden.**

### Abnahmebedingungen

    A1  Documents: was die Spec vorgibt, mit Fundstelle.
        Und: was `file_ref` heute traegt, je Zeile.
    A2  Appointments: was die Spec vorgibt, mit Fundstelle.
        Oder: nichts gefunden, dann Vorschlag mit Begruendung.
    A3  History: in welchem Reiter er aufgegangen ist, gemessen.
    A4  C-426: die Erlaubnisliste je Achse und Stufe, oder der
        Nachweis, dass sie fehlt.
    A5  was du bauen wuerdest, in Reihenfolge, mit Aufwand.

### Was nicht zu tun ist

**Nicht bauen** — **dieser Auftrag misst und schlaegt vor.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Vorab — C-268 einspielen

`[cmd]` **Nachgemessen auf `dev`: `create_relationship_invite`,
`coach.coach_profiles` und die Snapshot-Spalte fehlen.**

`[read]` **Vorher Sicherung nach `backup/`, wie bei C-421 bis
C-424.**

`[cmd]` **Und `lehne_aktion_ab` fehlt weiter** — **aus G-324.**

## Und C-428 — das Onboarding fuer Unregistrierte

`[cmd]` **Dein eigener Befund:** `relationships.client_id NOT NULL`
**verhindert das SPEC-08-Onboarding per E-Mail.**

`[cmd]` **Auf `dev` ist die Spalte bereits nullable** — **zu messen,
ob die Kette es auch so erzeugt.**

`[read]` **Und was `SPEC_08` fuer den Weg vorsieht:**
`createInviteToken(coachId, clientEmail)` **erzeugt ein Token,
`status: 'pending'`.**

`[read]` **Miss, was fehlt, und schlag vor** — **nicht bauen.**
