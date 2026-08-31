---
nr: C-362
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-112
entscheidung: null
beruehrt:
  tabellen: [coach.client_permissions]
zahlen:
  gemessen: 2026-08-30
---

# C-362 — das Consent-Log ist beschrieben und nicht gebaut

## Befund

Aus C-112, gegen die Spec geprueft 2026-08-30.

`[cmd]` **Ein Einwilligungsprotokoll steht in `INDEX.md`,
`SPEC_01_MODULE_CONTRACT.md` und `SPEC_03_USER_FLOWS.md` der
HumanCoach-Spec.**

`[cmd]` **Keine Tabelle** — `auth.oauth_consents` ist die
Anmeldung, nicht die Datenfreigabe.

`[read]` **C-112 nannte es *,,zweimal zugesichert und nie
modelliert"*.** **Das stimmt.**

## Was schon da ist und was fehlt

`[cmd]` **Die Aenderungshistorie ist gebaut:**
`permission_change_log`, `autonomy_change_log`,
`relationship_change_log` — **je 7 bis 8 Zeilen.**

`[read]` **Der Unterschied zum Consent-Log:** `[read]` **die
Protokolle halten fest, WAS geaendert wurde.** **Ein Consent-Log
haelt fest, WEM der Nutzer WOZU zugestimmt hat** — **mit Zeitpunkt,
Fassung und Widerruf.**

`[cmd]` **Und C-112 nennt einen zweiten Befund dazu:** *,,der
Einwilligungs-Trigger ist ein Placebo"*. **Zu messen: was loest heute
eine Einwilligung aus, und was passiert dabei?**

## Beruehrt

`[cmd]` **E-20 verlangt zwei getrennte Zwecke mit je eigener
Einwilligung** (MealCam). `[read]` **Wenn ein Consent-Log entsteht,
ist das sein erster Nutzer** — **und C-207 wartet auf dieselbe
Frage.**
