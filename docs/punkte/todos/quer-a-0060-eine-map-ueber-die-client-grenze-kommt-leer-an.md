---
nr: A-60
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-246
entscheidung: null
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx]
zahlen: null
---

# A-60 — eine `Map` ueber die Client-Grenze kommt leer an

## Befund

Aus G-246, Claude Code, 2026-08-28.

`[read]` **Die Datei, in der es auftrat, gibt es nicht mehr** —
`mikro-ansicht.tsx` ist in G-249 mit der Zusammenfuehrung entfallen.
**Der Befund bleibt**, weil er nicht an der Datei haengt, sondern am
Muster: **eine `Map` ueberlebt die Server-Client-Grenze nicht.**

`[cmd]` **`getErklaertexte` gab eine `Map` zurueck, die Ansicht ist
`'use client'`.** `[read]` **React serialisiert Props nach JSON — eine
`Map` kommt dort leer an, ohne Fehler.**

`[read]` **Kein Absturz, keine Warnung, keine leere Liste im
Protokoll.** Die Kacheln blieben einfach leer. **Behoben durch ein
Array; die `Map` entsteht jetzt im Client.**

## Warum das ein eigener Punkt ist

`[read]` **Es kann anderswo genauso passieren, und man sieht es
nicht.** `[read]` **Ein Fehler, der schweigt, ist die Klasse, die
uns heute mehrfach beschaeftigt hat** — `unsupported_operator` vor
C-313b, `count_risk_flag_gte` vor C-328, der stille Sortier-Rueckfall
vor G-245.

## Zu tun

**Messen, ob `Map` oder `Set` sonst noch ueber eine
Server-Client-Grenze gereicht werden.**

`[read]` **Und falls ja: ein Waechter dafuer.** `[cmd]` Der
`serverimport`-Waechter prueft bereits Client-Chunks auf
Server-Importe — **die Stelle, an der so eine Pruefung sitzen
wuerde, existiert schon.**
