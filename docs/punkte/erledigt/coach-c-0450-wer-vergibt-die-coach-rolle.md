---
nr: C-450
typ: entscheidung
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-449
entscheidung: E-78
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  coach_rollen: 0
---

# C-450 — wer vergibt die Coach-Rolle?

## Befund

Aus C-449, Codex, 2026-09-08. **Vollstaendig gemessen.**

`[cmd]` **`SPEC_07_API.md:10`:** *,,Coach-Endpoints: Require
`role = coach` in JWT + aktive Coach-Profil."*

`[cmd]` **Live: 1 admin, 0 coach.**

`[cmd]` **Rollen liegen in `auth.users.raw_app_meta_data.role`.**
`[cmd]` **Setzbar nur ueber die Supabase-Admin-API mit
Dienstschluessel, oder von Hand als `postgres`** ?
`061_rollen_admin.sql:52`.

`[cmd]` **Und nur `public.is_admin()` liest `app_metadata`** ?
**keine einzige Coach-Funktion prueft eine Rolle.**

## Die Lage

`[read]` **Die halbe Bedingung aus SPEC_07 ist heute
unerfuellbar** ? **`onboard_coach` verlangt ein Profil, nicht die
Rolle, und das ist der einzige Weg, der ueberhaupt funktioniert.**

`[cmd]` **Codex' Satz:** *,,Sofort waere es ein Totalschloss bei 0
Coach-Rollen."*

`[read]` **Eine Sicherung, die niemanden durchlaesst, ist keine
Sicherung, sondern ein Ausfall.**

## Die Entscheidung

**a** ? **Ein Vergabepfad in der Anwendung.**
`[read]` **Ein Admin kann eine Rolle setzen, mit Protokoll.**
`[cmd]` **Aber `061_rollen_admin.sql:52` sagt ausdruecklich:
ausserhalb der Anwendung** ? **das waere eine Aenderung an einer
bewussten Entscheidung.**

**b** ? **Von Hand, dokumentiert.** `[read]` **Ein Ablauf in
`docs/`, den Tom ausfuehrt** ? **Supabase-Admin-API, ein Nutzer,
ein Protokolleintrag.**

`[read]` **Passt zur bestehenden Entscheidung, kostet aber Toms
Zeit je Coach.**

**c** ? **Die Rolle fallen lassen.**
`[read]` **Das aktive Profil IST der Nachweis** ? **wer eines hat,
ist ein Coach.**

`[cmd]` **Dann waere `SPEC_07:10` zu berichtigen** ? **eine Spec
zu aendern ist erlaubt, sie stillschweigend zu brechen nicht.**

## Was dafuer spricht, es jetzt zu entscheiden

`[cmd]` **Coach ist zu 69 Prozent Attrappe, 5 von 15 Tabellen
leer, 0 Profile** (Lagebericht).

`[read]` **Solange niemand Coach sein kann, laesst sich nichts
davon pruefen.**

## Entschieden am 2026-09-08 — E-78, Variante b

Tom: *,,im moment entwickeln wir und setzen es manuell in der db."*

`[cmd]` **Kein Vergabepfad in der Anwendung.** `[cmd]`
**`onboard_coach` verlangt die Rolle nicht.** `[cmd]` **`SPEC_07:10`
bleibt als Zielzustand.**

`[read]` **Und der Nachsatz ist der wichtigere Teil** ? **die
Aufnahme eines Coaches ist ein eigener Bereich, nicht ein
Nebenprodukt der Rollenfrage.**

**Als C-451.**
