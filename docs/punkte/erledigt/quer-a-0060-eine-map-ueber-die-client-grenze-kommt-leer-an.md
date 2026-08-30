---
nr: A-60
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-246
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/lib/__tests__/client-grenze.test.ts
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

## Auftrag

**Mitbeauftragt mit A-29 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt mit A-29. **Der
vollstaendige Bericht steht in [A-29](quer-a-0029-der-attrappen-test-koennte-die-gerenderte-seite-zaehlen.md#bericht).**

### Der Fall existiert heute nicht

`[cmd]` **Gemessen ueber 435 Dateien, davon 123 mit `'use client'`:**
**4 Map/Set-liefernde Exporte, keiner in einer Client-Datei; 0
Map/Set als Prop-Typ; 0 unannotierte `return new Map`.**

`[cmd]` **Die Datei aus dem Befund macht es richtig:**
`naehrstoff-ordnung-tab.tsx:94` baut ein `Set` **im Client** aus einem
Array — genau die Behebung aus G-246.

### Der Waechter trotzdem — und nicht dort, wo der Punkt ihn vermutete

`[cmd]` **Der Typecheck faengt es NICHT.** Probe am 2026-08-30:
`'use client'`-Komponente mit `karte: Map<string, string>`, aus einer
Serverkomponente aufgerufen — **`tsc --noEmit` meldete nichts.**

`[cmd]` **Und der `serverimport`-Waechter kann es nicht.** Er liest
das gebaute Buendel und sucht Zeichenketten; **eine Map-Prop
hinterlaesst dort keine.** `[read]` **Die im Punkt vermutete Naht
traegt nicht** — die Stelle ist der Quelltext, nicht das Buendel.

**Gebaut:** `apps/web/src/lib/__tests__/client-grenze.test.ts` prueft
die **Prop-Signatur**, nicht das Vorkommen von `Map`. `[read]` **Eine
Map im Rumpf ist richtig, eine Map in der Prop-Signatur ist der
Fehler.**

`[cmd]` **Mit Gegenprobe (A-62):** Map-Prop wird erkannt,
`Array<[string, number]>` nicht, `new Set(...)` im Rumpf nicht.

## Abnahme

**2026-08-30, mit A-29 abgenommen:** der Fall existiert nicht (0 von 123), der Waechter ist gebaut;
Typecheck und Serverimport-Waechter fangen ihn beide nicht.
