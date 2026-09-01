---
nr: C-362
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-112
entscheidung: null
agent: codex
beauftragt: 2026-09-01
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

## Auftrag — das Einwilligungsprotokoll

**Mitbeauftragt: G-282, E-04.** Bericht in diese Datei.

**Beauftragt am 2026-09-01.**

### 1 · C-362 — das Consent-Log

`[cmd]` **Beschrieben in `INDEX.md`, `SPEC_01_MODULE_CONTRACT.md` und
`SPEC_03_USER_FLOWS.md` der HumanCoach-Spec.** `[cmd]` **Keine
Tabelle** — `auth.oauth_consents` ist die Anmeldung, nicht die
Datenfreigabe.

`[read]` **Der Unterschied zu dem, was schon steht:** `[cmd]` **die
drei Aenderungsprotokolle halten fest, WAS geaendert wurde.**
`[read]` **Ein Consent-Log haelt fest, WEM der Nutzer WOZU zugestimmt
hat** — mit Zeitpunkt, Fassung und Widerruf.

`[cmd]` **E-20 verlangt zwei getrennte Zwecke mit je eigener
Einwilligung** (MealCam). `[read]` **Wenn ein Consent-Log entsteht,
ist das sein erster Nutzer.**

`[cmd]` **Und C-207 wartet auf dieselbe Frage** — der Cam-Weg.

### 2 · G-282 — CoachMemory

`[cmd]` **In `SPEC_02_ENTITIES` und `SPEC_10` als Entitaet
definiert, keine Tabelle.**

`[read]` **Vorher zu klaeren:** `[cmd]`
**`coach-buddy-killer-feature.md` Kapitel 17 heisst *Coach Memory
(Structured, nicht freie Magie)*** mit **17.1 Memory Types** und
**17.2 Memory Fields**. `[cmd]` **Und C-112 nannte vier parallele
Gedaechtnismodelle.**

`[read]` **Miss, welches gilt, bevor du baust.** **Und das Vergessen
gehoert dazu** — C-112 nannte *,,append-only-Log gegen DSGVO"*.

### 3 · E-04 — alte `public`-Tabellen nach `legacy`

`[read]` **Aufraeumarbeit, aber sie steht als Entscheidung fest.**
`[cmd]` **Miss zuerst, welche Tabellen gemeint sind und ob etwas sie
noch liest.**

### Was nicht zu tun ist

**Kein Coach-UI bauen** — nur Schema.
**Keine Tabelle loeschen, die noch gelesen wird.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Consent-Log       Tabelle, Felder, was E-20 braucht
    Widerruf          wie wird er festgehalten
    CoachMemory       welches der vier Modelle, belegt
    Vergessen         wie, oder als offen gemeldet
    legacy            welche Tabellen, wer liest sie noch

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
