# Wer arbeitet gerade woran

**Diese Datei ist die Wahrheit ueber laufende Auftraege.**
Der Orchestrator traegt sie ein, wenn ein Auftrag rausgeht, und
streicht sie, wenn der Bericht eintrifft.

**Anlass (Tom, 2026-08-20):** *,Du hast es nicht mal mehr im Griff zu
wissen, welcher Agent noch laeuft."*

---

## Laufend

| Agent | Auftrag | Bereich | seit |
|---|---|---|---|
| **Fable** | *frei* | | |
| **Codex** | **C-164** `food_search` mit mehreren Tags | `supabase/` | 2026-08-20 |
| **Claude Code** | *frei* | | |

## Wartet auf einen freien Agenten

| Auftrag | Bereich | blockiert von |
|---|---|---|
| **G-133** Allergen-Pillen falsch beschriftet (1.021 statt 6.119) | `apps/web` | — |
| **G-112** Filter-Anzeige nach C-164 | `apps/web` | **C-164** |
| **G-134** Die vier Filtergruppen gibt es nicht | `supabase/` + Anzeige | Entscheidung |
| **G-131** Settings hat sieben Bereiche (837 Zeilen Entwurf) | `apps/web` | — |
| **G-83** Onboarding — der Entwurf existiert (361 Zeilen) | `apps/web` | — |
| **A-31** `svgpfade-pruefen.mjs` ins Gate | `tools/` | — |
| **G-102** Ausfuehrer fuer bestaetigte Coach-Vorschlaege | `apps/coach` | Toms T1–T9 |
| **C-159** sieben Regelpfade ohne Schema — **Symptomtabelle ist im Mockup** | `supabase/` | Produktentscheidung |
| **C-163** 94 Substanzen ohne Naehrstoffmenge | Recherche | Kimi |
| **C-160** Bewertungshorizont je Naehrstoff | Recherche | Kimi |
| **C-105 / C-124** Volumen, Modalitaeten, OTS-Schwellen | Recherche | Kimi crawl_025 |

## Bereiche, damit nichts kollidiert

| Bereich | wer darf |
|---|---|
| `supabase/_pipeline/` | **nur Codex** |
| `apps/web/src/app/v2/nutrition` | ein Agent zur Zeit |
| `apps/web/src/app/v2/supplements` | ein Agent zur Zeit |
| `apps/coach/` | ein Agent zur Zeit |
| `docs/` | Orchestrator |

`[read]` **Zwei Agenten in `apps/web` teilen sich die Browsersitzung** \u2014
das hat am 2026-08-20 dreimal Zeit gekostet. **Ein UI-Agent je Modul.**

---

## Regel

`[cmd]` **Vor jedem neuen Auftrag: hier nachsehen.**
`[cmd]` **Nach jedem Bericht: Zeile streichen.**

`[read]` **Und die Nummer wird hier vergeben** \u2014 A-18 haelt fest, dass
116 bis 119 doppelt belegt waren, weil fuenf Agenten gleichzeitig die
naechste freie Zahl nahmen.
