---
nr: C-460
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: umgesetzt
agent: codex
zahlen:
  gemessen: 2026-09-11
---

# C-460 — welcher Coach für welches Modul

## Ergebnis

`coach.relationship_specialties` ist die Verbindungstabelle zwischen einer
Coach-Klient-Beziehung und einem oder mehreren der vier Coach-Fächer:
`training`, `nutrition`, `supplement`, `medical`.

## Messung und Begründung

- SPEC_11 nennt vier Coach-Typen; `client_permissions` enthält sieben
  Datenmodule. Sie sind nicht identisch: Training kann z. B. Training,
  Recovery und Goals fachlich betreuen; Buddy hat keinen Human-Coach-Typ.
- Ein Coach kann mehrere Fächer abdecken. Eine Spalte wäre damit falsch;
  die Verbindungstabelle hält mehrere Fächer pro Beziehung ohne die Beziehung
  zu duplizieren.
- Das Altrepo hatte kein Fachmodell: `coach_clients.assignment_type` war
  `primary | secondary | temporary`, also Vertragsrolle, nicht Fach.
- Die aktuelle Klientensicht rechnet nicht aus Daten: in
  `apps/web/src/app/v2/coach/mockup-referenz.tsx:98` steht statisch
  `${COACHES.length} of 4 categories`.

## Abnahme

- Die sechs bestehenden Beziehungen bleiben unverändert: 6 vor/nachher.
- Der Test weist zwei Fächer für eine aktive Beziehung zu; Client sieht 2,
  fremder Nutzer 0, anon kein EXECUTE.
- Sicherung: `backup/schema/20260911143220_c460_relationship_specialties_vor_einspielen.dump`,
  50.582.694 Bytes, SHA-256 `2EC79AE5DAA8FAF5000A655012B8DEB28FD0F5F9CAB0F14D35EBECB6687B1A63`.

Keine Oberfläche geändert.
