---
nr: C-533
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-22
braucht: []
kind_von: C-327
entscheidung: null
agent: codex
erledigt: 2026-09-22
commit: "kein Commit (Tom-Vorgabe)"
beruehrt:
  tabellen: [supplements.substance_group_memberships]
zahlen:
  gemessen: 2026-09-22
  abweichungen_vorher: 1
  abweichungen_nachher: 0
  vollkette_sekunden: 1373.7
---

# C-533 - der Sollstand unterschlaegt service_role-Rechte

## Befund

Die Ketten-Abschlusspruefung endete wiederholt an
`supplements.substance_group_memberships`: `service_role` hatte laut
Istzustand `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER,
TRUNCATE`, der Sollstand erwartete nur `SELECT`.

## Messung und Entscheidung

Das ist keine ungewollte Rechteausweitung:

- C-327 vergibt in
  `20260829003109_c327_substance_group_membership.sql` explizit
  `GRANT ALL ... TO service_role`.
- Der Kettenschritt `327_substance_group_membership.sql` enthält
  dieselbe explizite Vergabe.
- Vergleichbare Supplement-Katalogtabellen (`supplements`,
  `supplement_aliases`, `supplement_groups`, `supplier_products`) haben
  ebenfalls `service_role ALL`; `authenticated` hat weiterhin nur
  `SELECT`, `anon` nichts.

Die korrekte Behebung ist daher der Sollstand, nicht ein REVOKE und keine
neue Migration. Der Sollstand erwartet jetzt die sieben explizit
vergebenen `service_role`-Rechte.

## Gegenprobe

Die Vollkette auf `lumeos_c533_kette` lief komplett durch:

- C-327 und C-327a: 8 Gruppenmitgliedschaften.
- C-532: 1.467.176 Statements zu 214.759 Produkten und 11 Arten.
- Abschlusswaechter: `GRANTs 39/39`, `Fremde Tab. 185/185`,
  `Fremde Sicht 7/7`, `Fremde Fkt. 61/61`.
- Ergebnis: `SCHEMA VOLLSTAENDIG`, `KETTE OK: 1373.7s`.

Die 27 genannten Hinweise betreffen veraltete oder bewusst nicht erwartete
Objekte; sie sind keine Abweichungen. Daten und RLS von C-327 wurden nicht
veraendert.

## Abnahme

Geschlossen am 2026-09-22: Der Dauerfehler der Kette war eine falsche
Erwartung, nicht ein Sicherheitsmangel. Nicht committet auf Toms Vorgabe.
