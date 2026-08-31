---
nr: G-292
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-292 — MicroFlagsList — die Warnungen werden nicht gezeigt

## Befund

`[cmd]` **`SPEC_10` nennt `MicroFlagsList`:** *,,Aktuelle
Mikronaehrstoff-Warnungen, sortiert nach Severity"*.

`[cmd]` **Gebaut ist sie nicht** — **obwohl die Funktion dahinter
seit dem 30.08. live ist.**

`[cmd]` **G-273 hat die zaehlende Funktion angebunden: 9 / 11 / 10
Flags bei 7 / 30 / 90 Tagen.** `[read]` **Die Zahlen stehen im
Nutrients-Reiter, aber der Insights-Reiter zeigt sie nicht.**

## Was fehlt

`[read]` **Eine Liste der aktuellen Warnungen, nach Schwere
sortiert** — **nicht die Zahl, sondern welche Naehrstoffe es sind.**

`[cmd]` **Die Dauerregel steht** (C-323): eine Warnung entsteht, wenn
ein Naehrstoff ueber einen Zeitraum unter der Referenz liegt.

`[read]` **Das ist die Kachel, die einem Nutzer sagt, was er tun
sollte** — **ohne ihm zu sagen, was er tun soll** (C-108/F-02).

## Auftrag

**Vorbereitet mit G-291 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
