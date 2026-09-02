---
nr: C-389
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-386
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-02
---

# C-389 — Saft und Nektar liegen bei der Frucht

## Befund

Aus C-386, Codex, 2026-09-02.

`[cmd]` **Fuer `F201`, `F603` und `F310` liegen Frucht, Saft und
Nektar alle in Kategorie `obst`.** `[cmd]` **Es gibt keine Zellen-
oder Artenspalte.**

`[cmd]` **Und `processing_level` ist bei Saft und Nektar `raw`.**

`[read]` **Ein Saft ist kein rohes Obst.**

## Was es kostet

`[cmd]` **Die Rangfolge stellt *Aprikose* (F201100) vor
*Aprikosensaft* (F201600)** — **aber der Saft steht als sechster von
24 flachen Treffern.**

`[read]` **Wer *Aprikose* sucht, bekommt Saft und Nektar in der
Liste** — **und muss selbst erkennen, dass das etwas anderes ist.**

`[cmd]` **C-35 nannte es *,,je ein echter Suchfehler weniger, und
ohne Kuration zu haben"*** — **die Trennung waere ableitbar.**


## Gemessen am 2026-09-02: belegt, mit Rang.

`[cmd]` **Saft und Nektar bleiben in `obst` und `raw`.** `[cmd]`
**`Aprikosensaft` trifft bei *Aprikose* per `name_prefix`, Rang 6.**

`[read]` **Der Treffergrund zeigt: kein Synonym- oder Aliasfehler,
sondern der Name selbst.** **Der Punkt bleibt offen.**

## Auftrag

**Mitbeauftragt mit C-388 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: trennbar, aber nicht global

`[cmd]` **Die drei Saftfamilien sind ueber BLS-Codes trennbar:**
**100 roh, 600 Saft, bei Orange 700 Nektar.**

`[cmd]` **Aber global ist 600 nicht eindeutig Saft:** **3 von 53
Obst-600-Zeilen sind Smoothies.**

`[read]` **Die Regel laesst sich nicht allgemein ausrollen** —
**C-35 nannte drei Familien, nicht alle.**

`[read]` **Der Umfang steht damit: `F201`, `F603`, `F310` — drei
Familien, keine Regel.**

## Auftrag — drei Familien, kein Regelversuch

**Mitbeauftragt: C-31, C-335.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-389 — die drei Saftfamilien

`[cmd]` **Du hast gemessen: `100` roh, `600` Saft, bei Orange `700`
Nektar** — **trennbar fuer `F201`, `F603`, `F310`.**

`[cmd]` **Aber global ist `600` nicht eindeutig:** **3 von 53
Obst-600-Zeilen sind Smoothies.**

`[read]` **Also keine Regel, sondern drei Familien** — **C-35 nannte
auch nur diese drei.**

`[cmd]` **`processing_level` steht bei Saft auf `raw`.** `[read]`
**Ein Saft ist kein rohes Obst** — **das ist die Zeile, die sich
berichtigen laesst.**

`[read]` **Und mit `match_reason` aus C-391 laesst sich zeigen, ob
es wirkt:** `[cmd]` **`Aprikosensaft` stand bei *Aprikose* auf Rang
6.**

### 2 · C-31 — die Kurationsoberflaeche

`[cmd]` **`apps/admin` hat eine Kurationsseite, 314 Zeilen,
vollstaendig lesend.**

`[cmd]` **Und seit C-366 gibt es `food_tags_kuriert` mit
`food_tags_effective`.**

`[read]` **Der Schreibweg fehlt.** `[read]` **Miss, was die Seite
heute zeigt und was ein Schreibweg braeuchte** — **die Oberflaeche
selbst ist ein UI-Auftrag, nicht deiner.**

### 3 · C-335 — keine Aenderungshistorie

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit E-42 sind geloggte Positionen eingefroren** —
`[cmd]` **und `coach.action_log` fuehrt seit C-381 ein Protokoll.**

`[read]` **Vielleicht ist die Frage inzwischen eine andere.**

### Was nicht zu tun ist

**Keine Regel fuer alle 53** — drei Familien.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    drei Familien    Saft und Nektar getrennt, mit match_reason
    Aprikose         wo steht der Saft jetzt
    Smoothies        die drei bleiben unberuehrt, gezaehlt
    C-31             was fehlt fuer den Schreibweg
    C-335            gilt / ueberholt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
