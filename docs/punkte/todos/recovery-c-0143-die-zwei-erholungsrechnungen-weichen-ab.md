---
nr: C-143
typ: messung
modul: recovery
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-82
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/lib/recovery/score.ts", "apps/web/src/app/v2/recovery/tab-checkin.tsx"]
zahlen: null
---

# C-143 - Die zwei Erholungsrechnungen weichen ab

## Befund

(neu
  2026-08-19). **Befund aus G-82, gemessen ueber fuenf Tage.**

  | Tag | Tabelle | `score.ts` | Diff |
  |---|---|---|---|
  | 2026-06-05 | **43,0** | 36 | **−7,0** |
  | 2026-07-15 | 83,8 | 83 | −0,8 |
  | 2026-09-01 / 10-20 / 11-06 | **79,4** | 82 | **+2,6** |

  `[cmd]` **C-125s Referenztag stimmt (43,0), G-76s nicht:** *„Die
  Tabelle sagt 79,4, nicht 82. **Die 82 war nie gespeichert**, sondern
  das, was die Browserrechnung an dem Tag ergab."*

  ### Die Ursache sind nicht die Gewichte

  `[read]` *„Der Kern ist identisch — der Unterschied ist, **wie viele
  Anteile zaehlen**: `score.ts` rechnet fuenf von sieben (Basis 75), die
  Tabelle alle sieben mit Rueckfallwerten (Basis 100)."*

  `[cmd]` **Die Tabelle ist die bessere Zahl:** *„Sie nutzt den
  gemessenen ACWR auf **118 von 170 Tagen**, die `score.ts`
  wegwirft."*

  ### Und die Anzeige liest jetzt die Tabelle

  `[cmd]` **`score.ts` bleibt** — aber der Auftrag ging von einer
  falschen Annahme aus: *„Die Live-Vorschau benutzte sie nie."*

  `[cmd]` **`tab-checkin.tsx` rechnete mit der Entwurfsformel** — eigene
  Gewichte, **HRV aus der Attrappe, `0.88 * 10` als erfundene
  Ernaehrung**, `readinessFor` als Urteilssprache.

  `[read]` **Nach dem Umbau haette `score.ts` null Aufrufer gehabt** —
  derselbe Fall wie `InjektionsKarte` (G-53). **Jetzt an die Vorschau
  gebunden, mit genannter Basis** und dem Hinweis, dass sie bewusst
  nicht die gespeicherte Zahl ist.

  **Offen:** `[read]` Ob die Vorschau ueberhaupt eine zweite Zahl zeigen
  soll, oder ob sie nach dem Speichern die gespeicherte nachreicht.
