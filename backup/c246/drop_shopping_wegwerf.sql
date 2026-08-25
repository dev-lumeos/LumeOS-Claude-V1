
BEGIN;
DROP TABLE IF EXISTS nutrition.shopping_list_items CASCADE;
DROP TABLE IF EXISTS nutrition.shopping_lists CASCADE;
DROP FUNCTION IF EXISTS nutrition.shopping_list_items_owner_guard();
DROP FUNCTION IF EXISTS nutrition.shopping_lists_owner_guard();
COMMIT;
