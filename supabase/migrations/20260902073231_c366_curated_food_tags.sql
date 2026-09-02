-- C-366 / E-55: Import und menschliche Tag-Entscheidung bleiben getrennt.
BEGIN;

CREATE TABLE nutrition.food_tags_kuriert (
  food_id UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  tag_code TEXT NOT NULL REFERENCES nutrition.tag_definitions(code) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('set', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (food_id, tag_code)
);

CREATE OR REPLACE VIEW nutrition.food_tags_effective
WITH (security_invoker = true)
AS
  SELECT ft.food_id, ft.tag_code, ft.confidence, 'import'::TEXT AS source
  FROM nutrition.food_tags ft
  WHERE NOT EXISTS (
    SELECT 1
    FROM nutrition.food_tags_kuriert k
    WHERE k.food_id = ft.food_id
      AND k.tag_code = ft.tag_code
      AND k.action = 'removed'
  )
  UNION ALL
  SELECT k.food_id, k.tag_code, NULL::NUMERIC AS confidence, 'curated'::TEXT AS source
  FROM nutrition.food_tags_kuriert k
  WHERE k.action = 'set'
    AND NOT EXISTS (
      SELECT 1
      FROM nutrition.food_tags ft
      WHERE ft.food_id = k.food_id
        AND ft.tag_code = k.tag_code
    );

CREATE TRIGGER food_tags_kuriert_touch_updated_at
  BEFORE UPDATE ON nutrition.food_tags_kuriert
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

ALTER TABLE nutrition.food_tags_kuriert ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE nutrition.food_tags_kuriert FROM anon, authenticated;
GRANT SELECT ON TABLE nutrition.food_tags_kuriert TO authenticated;
GRANT ALL ON TABLE nutrition.food_tags_kuriert TO service_role;

CREATE POLICY food_tags_kuriert_select ON nutrition.food_tags_kuriert
  FOR SELECT TO authenticated USING (true);

REVOKE ALL ON TABLE nutrition.food_tags_effective FROM anon, authenticated;
GRANT SELECT ON TABLE nutrition.food_tags_effective TO authenticated;
GRANT ALL ON TABLE nutrition.food_tags_effective TO service_role;

COMMENT ON TABLE nutrition.food_tags_kuriert IS
  'C-366/E-55: gesetzte oder entfernte menschliche Tag-Entscheidung ohne confidence.';
COMMENT ON VIEW nutrition.food_tags_effective IS
  'C-366/E-55: Leseweg; removed ueberdeckt Import auch nach einem Kettenlauf.';

COMMIT;
