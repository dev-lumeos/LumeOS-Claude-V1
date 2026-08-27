---
nr: A-19
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["supabase/_pipeline/_validierung/kette-readme-pruefen.ts", "supabase/README.md"]
zahlen: null
---

# A-19 - Zwei README-Abweichungen in der Kette

## Befund

(neu 2026-08-19).
  Meldung aus C-99.

  `[cmd]` **`kette-readme-pruefen.ts` meldet Abweichungen bei `018` und
  `032`** — den Kettenschritten aus C-93 (Ausschluss-Presets und
  Halal/Koscher-Tags).

  `[read]` **Der C-99-Agent hat sie gemeldet und nicht nebenbei
  repariert** — richtig so: *„023a ist dort nicht das Problem."*

  `[cmd]` **Vermutlich hat der C-93-Agent `supabase/README.md` nicht
  vollstaendig nachgezogen.** Kleine Sache, aber der Pruefer bleibt gelb,
  bis sie behoben ist.
