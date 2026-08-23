# C-255 — Codex, 2026-08-23

Bericht: `docs/berichte/c-255-codex.md`

**VORBEREITET, NOCH NICHT FREIGEGEBEN.** Er setzt voraus, dass C-253
durch ist. Widerspricht dein C-253-Bericht einer Zahl hier, kommt ein
**Korrekturblock oben drauf** — der Auftrag wird nicht neu geschrieben.

---

## Schritt 5 des Supplements-Neuaufbaus: die alten Kataloge weg

`[cmd]` **Kein Lesepfad braucht sie mehr.** `git grep
supplement_catalog` in `lib/supplements/`, `v2/medical/` und
`v2/supplements/` findet nach C-250 und C-252 **nur noch zwei
Kommentare.**

## WAS ICH GEMESSEN HABE — live, 2026-08-23

`[cmd]` **Vier Fremdschluessel zeigen auf die alten Tabellen:**

    substance_catalog_sources_substance_id_fkey      -> substance_catalog
    substance_lab_effects_substance_id_fkey          -> substance_catalog
    supplement_nutrient_mappings_substance_id_fkey   -> substance_catalog
    supplement_nutrient_mappings_supplement_id_fkey  -> supplement_catalog

`[cmd]` Dazu **2 Policies**, **2 Trigger** (ohne interne) und **eine
Sicht**: `supplements.stack_item_substance_matches`.

`[cmd]` **Die drei Anhaengsel haben Gegenstuecke im neuen Schema:**

| alt | Zeilen | neu | Zeilen |
|---|---:|---|---:|
| `substance_lab_effects` | 222 | `supplement_lab_effects` | **222** |
| `supplement_nutrient_mappings` | 17 | `supplement_nutrients` | **17** |
| `substance_catalog_sources` | 668 | `supplement_field_sources` | **2147** |

`[read]` **Die ersten beiden stimmen ueberein, die dritte nicht.** 668
gegen 2147 ist kein Rundungsunterschied. **Ob `supplement_field_sources`
die 668 vollstaendig enthaelt, ist ungeprueft — das ist dein erster
Schritt, nicht meine Annahme.**

## WAS ZU TUN IST

1. **Belegen, dass nichts verlorengeht.** Fuer jede der drei alten
   Anhaengsel-Tabellen: enthaelt das neue Gegenstueck dieselben
   Aussagen? **Bei `substance_catalog_sources` ausdruecklich zeigen,
   welche der 668 wo landen.** Wenn eine Aussage kein Gegenstueck hat:
   **melden und stehen lassen**, nicht loeschen.

2. **`stack_item_substance_matches` prueft sich selbst hinfaellig** —
   die Sicht war die Bruecke zwischen altem Katalog und Kimi. `[cmd]`
   Nach C-243 haengen 0 von 11 `stack_items` an einem Anker. **Prueft,
   ob sie noch gebraucht wird; wenn nein, faellt sie mit.**

3. **Erst dann entfernen:** die vier Fremdschluessel, die Policies, die
   Trigger, die drei Anhaengsel-Tabellen, zuletzt
   `supplement_catalog` (44) und `substance_catalog` (566).

4. **Kettenschritt, nicht Einmalbefehl.** Sonst sind die Tabellen nach
   dem naechsten Neuaufbau wieder da.

## WAS NICHT ZU TUN IST

**Nicht loeschen, bevor Punkt 1 belegt ist.** `[read]` Eine Tabelle mit
566 Zeilen ist in einer Sekunde weg und in einer Woche nicht
rekonstruierbar.

`apps/` **nicht anfassen** — die zwei Kommentare dort raeumt der
UI-Agent mit G-172 weg.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Vollsicherung vor dem Live-Eingriff. Zwingend.**

Nachher: `supplement_catalog` und `substance_catalog` existieren nicht
mehr · Fremdschluessel auf sie **0** · die 19 Kontrollzahlen
unveraendert, **ausser** den drei Anhaengseln.

**Gegenprobe:** die Zahlen der neuen Gegenstuecke muessen **vor und
nach** dem Loeschen identisch sein — 222, 17, und die geklaerte Zahl
fuer die Quellen.

**Negativprobe:** eine Erwartungszahl um eins verstellen, der Lauf muss
rot werden.

**Und der Beleg, der ueber die Datenbank hinausgeht:** `pnpm gate`
gruen, und `node tools/schuss.mjs` auf `/v2/supplements` und
`/v2/medical` ohne Konsolenfehler. `[read]` **Das ist A-50** — eine
geloeschte Tabelle prueft die Lesepfade nicht.

## REGELN

Wegwerf-Datenbank, Sicherung vorher, Kettenlauf, **und live einspielen**
mit Vollsicherung davor.
`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
