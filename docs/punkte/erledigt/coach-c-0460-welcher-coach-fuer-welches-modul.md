---
nr: C-460
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
erledigt: 2026-09-08
commit: 68b626d9
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.relationships]
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

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    coach.relationship_specialties
      id, relationship_id, specialty, created_at
    CHECK: training | nutrition | supplement | medical
    RLS an, 1 Policy, 0 Zeilen
    6 Beziehungen unveraendert
    Vollkette 192 Schritte, 615,3 s

`[cmd]` **Selbst gemessen: alle fuenf.**

### A1 — die vier sind NICHT die sieben

`[read]` **Meine Frage war, ob die vier Coach-Typen auf die sieben
Berechtigungsmodule abbildbar sind.**

> *,,Vier eigene Coach-Faecher, getrennt von den sieben
> Berechtigungsmodulen. Training/Recovery/Goals bleiben fachlich
> abbildbar, ohne Recovery als falschen Coach-Typ zu
> speichern."*

`[read]` **Ein Trainingscoach sieht Recovery und Goals mit** ?
**aber er IST kein *Recovery-Coach*.**

`[cmd]` **Die Berechtigung sagt, WAS er sieht. Das Fach sagt,
WOFUER er da ist.**

`[read]` **Zwei Achsen, nicht eine** ? **und er hat sie
getrennt.**

### A2 — eine Verbindungstabelle, keine Spalte

`[read]` **Ein Coach kann mehrere Faecher haben.**

`[cmd]` **`relationship_id` + `specialty`** ? **eine Zeile je
Fach.**

`[read]` **Eine Spalte an `relationships` haette einen Coach auf
ein Fach festgelegt.**

### A3 — das Altrepo fuehrte keinen Fachtyp

`[cmd]` **Nur `assignment_type`:** `primary | secondary |
temporary`.

`[read]` **Das ist die RANGFOLGE, nicht das Fach** ? **wer der
Hauptcoach ist, nicht wofuer.**

`[read]` **Die Vorlage zeigt das Fach** ? **also war es nie
gebaut.**

### A4 — *,,4 of 4 categories"* ist eine Attrappe

`[cmd]` **`COACHES.length`** ? **eine feste Zahl aus dem
Entwurf.**

`[read]` **Die Klientensicht hat nie gerechnet** ? **sie hat
gezaehlt, wie viele Eintraege im Mockup stehen.**

`[read]` **Jetzt gibt es die Grundlage** ? **die Kachel folgt,
wenn jemand sie anbindet.**

**Abgenommen.**
