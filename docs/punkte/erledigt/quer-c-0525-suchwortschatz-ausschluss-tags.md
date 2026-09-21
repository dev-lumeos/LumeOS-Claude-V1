---
nr: C-525
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: [C-523]
kind_von: C-523
entscheidung: Tom: kuratierter, getrennter Suchwortschatz
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-21
commit: nicht-committet
beruehrt:
  tabellen: [public.allergy_search_terms, nutrition.tag_definitions, nutrition.food_tags]
  dateien:
    - supabase/migrations/20260921092000_c525_allergy_search_terms.sql
    - supabase/_pipeline/05_user_tabellen/525_allergy_search_terms_data.sql
    - supabase/_pipeline/_validierung/quer-c525-allergy-search-terms.test.ts
zahlen:
  gemessen: 2026-09-21
  search_terms: 23
---

# C-525 — Suchwortschatz für Ausschluss-Tags

## Ergebnis

**2026-09-21 live eingespielt.** `public.allergy_search_terms` trennt
kuratierte menschliche Suchbegriffe von `public.allergen_aliases`.
Suchbegriffe beeinflussen damit keine Produkt-Allergiematches; sie erweitern
nur `allergy_catalog_suggestions('nahrung', query)`.

| Eingabe | Ergebnis | getaggte Foods |
|---|---|---:|
| Brot, Weizen, Roggen, Gerste, Dinkel, Nudel, Mehl | `nutrition:contains_gluten` | 622 |
| Milch, Käse, Joghurt, Sahne, Milchzucker | `nutrition:contains_lactose` | 1.021 |
| Nuss/Nüsse, Mandel, Walnuss, Haselnuss, Cashew, Pistazie | `nutrition:contains_nuts` | 120 |
| Soja, Tofu, Edamame, Sojasauce | `nutrition:contains_soy` | 60 |

`brot` trifft live `nutrition:contains_gluten`. `glutenfrei` und
`qzvwxjplk` liefern bewusst nichts; vegan/vegetarian sind Ernährungsformen,
keine Allergene. Erdnuss bleibt getrennt von Baumnüssen, weil der vorhandene
Katalog keinen eigenen Erdnuss-Tag trägt.

## Rechte und Nachweise

- 23 idempotente Pipelinezeilen; zweiter Lauf: `INSERT 0 0`.
- `authenticated` darf den Wortschatz lesen; `anon` hat weder Tabellen-SELECT
  noch RPC-Execute.
- Vertragsprobe: 2/2 grün.
- Frische Vollkette: C-525 grün; nur der bekannte C-327-Grantbefund beendet
  die Abschlussprüfung rot.

Sicherung: `backup/schema/20260921090000_c525_c524_vorher.sql`.

## Nachtrag: LIVE eingespielt, 2026-09-08

`[cmd]` **Selbst gemessen:**
`allergy_catalog_suggestions(nahrung, brot)` **->
`nutrition:contains_gluten`, 622 Treffer.**

`[read]` **Toms Fall trifft** ? **vorher 0.**
