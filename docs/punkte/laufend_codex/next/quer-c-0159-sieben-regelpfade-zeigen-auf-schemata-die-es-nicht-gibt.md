---
nr: C-159
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-110
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-159 - Sieben Regelpfade zeigen auf Schemata, die es nicht gibt

## Befund

(neu 2026-08-20). **Die Landkarte dessen, was fehlt.** Befund
  aus G-110.

  `[cmd]` **Von zwoelf `missing_input`-Pfaden haengen sieben an Quellen
  ohne Tabelle:**

  | | |
  |---|---|
  | **kein Schema `sleep`** | Recovery-Entwurf: `sleep_data` zurueckgestellt bis Wearable-Import |
  | **kein `location`** | nirgends im Repo |
  | **keine Symptomtabelle** | G-84: *„fuer Symptome gibt es keine Tabelle im ganzen Schema"* |
  | **kein `training.high_impact`** | im Feldvertrag genannt, nicht gebaut |

  `[read]` **Das ist wertvoller als eine Liste fehlender Felder** — es
  sagt, **welche Module die Regel-Engine noch nicht erreicht.**

  `[cmd]` **Und es deckt sich mit F-06:** *„Die Arbeitsobjekte haben keine
  Tabelle."* **Dieselbe Luecke aus anderer Richtung gemessen.**

## Auftrag — drei Befunde an der Regelmaschine

**Mitbeauftragt: C-271, C-279.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-09-02.**

### Warum diese drei zusammen

`[read]` **Alle drei betreffen `rule_catalog` und
`rule_assessment`** — **die Maschine, die aus Daten Aussagen macht.**

`[cmd]` **C-159: sieben Regelpfade zeigen auf Schemata, die es nicht
gibt.**
`[cmd]` **C-271: `rule_catalog` laedt immer, jeder Rueckfallzweig
daran haengt.**
`[cmd]` **C-279: das Kreuzprodukt in `rule_assessment` skaliert mit
den Zeilen.**

`[read]` **Der erste sagt, dass Regeln ins Leere zeigen** — **der
dritte, dass sie teuer werden, wenn sie es nicht taeten.**

### Was zu messen ist

`[read]` **C-159 zuerst:** **welche sieben, und zeigen sie heute noch
ins Leere?** `[cmd]` **Seit den Punkten sind Tabellen dazugekommen** —
`meal_slots`, `meal_plan_slots`, `injection_sites`,
`food_tags_kuriert`.

`[read]` **Dann C-279:** **wie gross ist das Kreuzprodukt heute?**
`[cmd]` **Miss mit den echten Zeilenzahlen, nicht mit einer
Schaetzung.**

`[read]` **Und C-271:** **was laedt immer, und was kostet es?**

### Was nicht zu tun ist

**Keine Regel loeschen** — messen, dann melden.
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    sieben Pfade   welche, und ob sie noch ins Leere zeigen
    Kreuzprodukt   Zeilen mal Zeilen, mit echten Zahlen
    rule_catalog   was laedt immer, in ms gemessen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
