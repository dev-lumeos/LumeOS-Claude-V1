---
nr: C-285
typ: entscheidung
modul: medical
schwere: hoch
angelegt: 2026-08-26
braucht: []
kind_von: null
kinder: []
entscheidung: E-12
erledigt: 2026-08-28
commit: OFFEN
durch: E-12
beruehrt:
  tabellen: ["medical.user_conditions"]
  dateien: ["docs/todo/SICHERHEIT.md"]
zahlen: null
---

# C-285 - `user_medications` speichert Medikamente im Klartext

## Befund

(neu 2026-08-26, **entschieden 2026-08-27**).

  `[read]` **Entscheidung: in der Entwicklungsphase bleibt es
  Klartext.** Die Begruendung und die Bedingungen, unter denen sie
  faellt, stehen in **`docs/todo/SICHERHEIT.md`**. **Dieser Punkt
  blockiert nichts mehr.**

  `[cmd]` **Die Lage:** alles laeuft lokal auf einem Rechner, 7 Konten,
  davon 2 mit Seed-Daten. Kein Netz, kein Kunde. `[read]` **Ein
  Schemawechsel kostet bei zwei Zeilen nichts und bei tausend Nutzern
  eine Migration mit Ausfallzeit** — verschieben ist hier billiger als
  bauen.

  `[cmd]` **Was bleibt, wenn es soweit ist:** von 21 Spalten sind genau
  drei Freitext — `name`, `indication`, `notes`. Der Rest ist
  strukturiert und **muss lesbar bleiben**, damit `rule_assessment`
  weiter funktioniert. `[cmd]` `pgcrypto` und `supabase_vault` sind
  installiert.

  `[read]` **Der Zuschnitt steht damit fest, die Schluesselverwaltung
  nicht.** Die offene Frage ist nicht *,,wie verschluesseln"*, sondern
  *,,vor wem"* — Schluessel im Vault schuetzt gegen einen gestohlenen
  Abzug, nicht gegen einen geleakten Service-Role-Key.

  **Zu tun jetzt:** nichts. **Zu tun bei einer der vier
  Kippbedingungen in `SICHERHEIT.md`:** dort steht es.

  `[cmd]` **Drei weitere Tabellen sind betroffen** —
  `medical.user_conditions`, `lab_result_values`, `lab_reports`.
  `[read]` **Eine Loesung fuer eine Tabelle ist keine.**

## Abnahme

**2026-08-28, Orchestrator.**

`[read]` **Der Punkt sagt es selbst:** *,,Dieser Punkt blockiert
nichts mehr"* und *,,Zu tun jetzt: nichts."*

`[cmd]` **Entschieden am 27.08. als E-12** — Medical-Daten bleiben in
der Entwicklungsphase Klartext. **Die vier Kippbedingungen stehen in
`docs/todo/SICHERHEIT.md`.**

`[read]` **Er stand als `schwere: hoch` in der Liste, obwohl nichts zu
tun war** — genau die Sorte Eintrag, die eine Liste unlesbar macht.

`[cmd]` **Was bleibt, steht dort und nicht hier:** drei Freitextspalten
(`name`, `indication`, `notes`), drei weitere betroffene Tabellen
(`user_conditions`, `lab_result_values`, `lab_reports`), und die
offene Frage ist nicht *,,wie verschluesseln"*, sondern *,,vor wem"*.

**Abgenommen.**
