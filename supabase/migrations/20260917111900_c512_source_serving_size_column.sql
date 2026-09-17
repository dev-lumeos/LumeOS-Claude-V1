BEGIN;

ALTER TABLE supplements.product_contents
  ADD COLUMN IF NOT EXISTS source_serving_size text;

COMMENT ON COLUMN supplements.product_contents.source_serving_size IS
  'C-512: wortgetreue DSLD-Facts-Spalte Serving Size. Sie ordnet eine Mengenzeile ihrer Etikettportion zu; amount_qualifier beschreibt nur die Genauigkeit der Menge.';

COMMIT;
