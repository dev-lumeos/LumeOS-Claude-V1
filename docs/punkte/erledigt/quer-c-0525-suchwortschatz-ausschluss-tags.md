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

# C-525 - ein Suchwortschatz fuer die Ausschluss-Tags

## Entscheidung und Bauform

`public.allergy_search_terms` ist ein eigener, RLS-geschützter Katalog für
kuratierte Eingabebegriffe. Er ist von `public.allergen_aliases` getrennt:
Suchbegriffe werden nie für Produkt-Allergiematches verwendet. Jede Zeile hat
Tag, Quelle und Evidenzklasse; Katalogdaten liegen idempotent im Pipelinepfad.

`allergy_catalog_suggestions('nahrung', ...)` berücksichtigt nur noch
ausschlussrelevante Tags mit `tag_type = 'allergen'`. Die Diet-Tags `vegan`
und `vegetarian` bleiben deshalb aus der Allergiesuche heraus.

## Gemessene Wortabdeckung

| Tag | kuratierte Begriffe | Foods / Food-Aliase mit den Begriffen |
|---|---|---:|
| Gluten | Brot, Weizen, Roggen, Gerste, Dinkel, Nudel, Mehl | 144/438 bis 136/442 für Brot/Weizen |
| Laktose | Milch, Käse, Joghurt, Sahne, Milchzucker | 261/932 bis 1/3 für Milch/Milchzucker |
| Baumnüsse | Nuss, Nüsse, Mandel, Walnuss, Haselnuss, Cashew, Pistazie | 124/375 für Nuss, weitere Begriffe vorhanden |
| Soja | Soja, Tofu, Edamame, Sojasauce | 46/158 für Soja, alle vier Begriffe vorhanden |

Die fünf Abnahmebegriffe liefern jeweils den richtigen Katalogtag:

| Eingabe | Katalogcode | getaggte Foods |
|---|---|---:|
| Brot | `nutrition:contains_gluten` | 622 |
| Weizen | `nutrition:contains_gluten` | 622 |
| Milch | `nutrition:contains_lactose` | 1.021 |
| Nuss | `nutrition:contains_nuts` | 120 |
| Soja | `nutrition:contains_soy` | 60 |

`glutenfrei` liefert bewusst keinen Allergietag: Es beschreibt die Abwesenheit
von Gluten und würde die Nutzerabsicht umkehren. `qzvwxjplk` liefert ebenfalls
0. Jede Datenzeile referenziert die gemessene BLS-Vokabel und die EU-
Allergenklasse (VO 1169/2011, Anhang II).

Erdnuss bleibt außerhalb von `contains_nuts`: Die EU führt Erdnüsse getrennt
von den definierten Baumnüssen. Ohne eigenen Erdnuss-Tag wäre eine Zuordnung
zu Baumnüssen fachlich falsch.

## Rechte und Nachweise

- `authenticated` darf den Suchwortschatz lesen; `anon` hat weder Tabellen-
  SELECT noch RPC-Execute.
- Die Vertragsprobe war vor dem Schema rot und danach grün; der zweite
  Datenlauf schreibt `INSERT 0 0`.
- Die frische Vollkette führte beide C-525-Schritte grün aus. Ihr Abschluss
  bleibt ausschließlich am bestehenden C-327-Grant-Sollstand rot.

## Abnahme

**2026-09-21. Gebaut und in der frischen Vollkette geprüft; nicht live
eingespielt und nicht committet.**
