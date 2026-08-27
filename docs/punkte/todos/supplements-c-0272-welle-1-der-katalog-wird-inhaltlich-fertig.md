---
nr: C-272
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-25
braucht: ["C-275", "C-276"]
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/ssot/96-kimi-inhalt.md"]
zahlen: null
---

# C-272 - Welle 1 — der Katalog wird inhaltlich fertig

## Befund

(neu
  2026-08-25). Aus `docs/ssot/96-kimi-inhalt.md`.

  braucht: C-275, C-276

  `[read]` **Die Abhaengigkeit ist der Grund, warum es diese Zeile
  gibt.** C-272 ging am 2026-08-25 raus, waehrend dem Katalog 128
  Substanzen fehlten — **Anreicherung fuer einen Bestand, der ein
  Drittel seiner Eintraege nicht hatte.** Codex wurde nach zwei Stunden
  gestoppt.

  `[read]` **Warum jetzt und nicht spaeter:** `docs/kimi_research/`
  steht in `.gitignore` — der Bestand ist **nicht versioniert, nicht
  gesichert, nicht gemessen.** `[cmd]` In vier Tagen dreimal bewiesen,
  dass Dateien dort vergessen werden: `RESEARCH_STATUS.md` dreimal
  zitiert und nie geoeffnet, die Dosis-Anreicherung in C-262
  durchgerutscht, `data/admin` im ersten Bestandsbericht nicht
  erwaehnt. **In der Datenbank ist Wissen auffindbar und gesichert.**

  | Was | Zeilen | heute |
  |---|---:|---|
  | WADA-Geltungsbereich | 446 + 318 | `note_de` **0/290** |
  | Laborwirkung mit `effect_class` | 47 | Feld fehlt |
  | Human-Evidenz-Flaggen | 293 | — |
  | Thailand | 1.061 | — |
  | CYP und Transporter, Rest | ~1.000 | `entity_transporters` **135** |
  | Studien | 43 | — |
  | PubChem-Konflikte | 20 | Waechter kennt **3 von 6** |

  `[read]` **Der wertvollste Einzelfund ist `effect_class`:** es
  trennt *„der Wert aendert sich"* von *„der Wert wird falsch
  gemessen"*. `[cmd]` Daptomycin hebt INR um bis zu **43 %** ohne
  Blutungsrisiko — **wer das verwechselt, behandelt einen
  Messfehler.**
