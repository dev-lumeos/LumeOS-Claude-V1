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
| **Claude Code** | *frei* | | |
| **Codex** | **C-164** `food_search` kombinierbare Tags + Ausschluss | `supabase/` | 2026-08-21 |

## Wartet auf einen freien Agenten

| Auftrag | Bereich | blockiert von |
|---|---|---|
| **C-162** Lab-Marker-Bruecke (66 Marker, 46 LOINC geprueft) | `supabase/` | — |
| **G-112** Food-DB-Filter kombinierbar — **Anzeigeteil** | `apps/web` | **C-164 laeuft** (Datenbankteil) |
| **G-126** „Ohne Laktose 1.021" ist die Zahl MIT Laktose | `apps/web` | — |
| **G-102** Ausfuehrer fuer bestaetigte Coach-Vorschlaege | `apps/coach` | Toms T1–T9 |
| **C-159** sieben Regelpfade ohne Schema | `supabase/` | Produktentscheidung |
| **C-163** 94 Substanzen ohne Naehrstoffmenge | Recherche | Kimi |
| **C-160** Bewertungshorizont je Naehrstoff | Recherche | Kimi |

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
