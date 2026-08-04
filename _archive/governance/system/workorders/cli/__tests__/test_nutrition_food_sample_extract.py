import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

from openpyxl import Workbook


MODULE_PATH = Path(__file__).resolve().parents[1] / "nutrition_food_sample_extract.py"

spec = importlib.util.spec_from_file_location("nutrition_food_sample_extract", MODULE_PATH)
nutrition_food_sample_extract = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules["nutrition_food_sample_extract"] = nutrition_food_sample_extract
spec.loader.exec_module(nutrition_food_sample_extract)


class NutritionFoodSampleExtractTests(unittest.TestCase):
    def test_parse_bls_value_matches_import_spec(self):
        parse_bls_value = nutrition_food_sample_extract.parse_bls_value

        self.assertEqual(parse_bls_value(12), 12.0)
        self.assertEqual(parse_bls_value(12.5), 12.5)
        self.assertEqual(parse_bls_value("12,5"), 12.5)
        self.assertEqual(parse_bls_value(" 0 "), 0.0)
        self.assertIsNone(parse_bls_value(""))
        self.assertIsNone(parse_bls_value("-"))
        self.assertIsNone(parse_bls_value("TR"))
        self.assertIsNone(parse_bls_value("<LOQ"))
        self.assertIsNone(parse_bls_value("<LOD"))

    def test_extracts_only_source_backed_foods_and_supported_nutrients(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            workbook_path = tmp / "sample.xlsx"
            nutrient_defs_path = tmp / "nutrient-defs.md"
            sql_path = tmp / "sample.sql"
            report_path = tmp / "report.md"

            workbook = Workbook()
            sheet = workbook.active
            sheet.title = "BLS_4_0_Daten_2025_DE"
            sheet.append([
                "BLS Code",
                "Lebensmittelbezeichnung",
                "Food name",
                "ENERCJ Energie (Kilojoule) [kJ/100g]",
                "ENERCJ Datenherkunft",
                "ENERCJ Referenz",
                "WATER Wasser [g/100g]",
                "WATER Datenherkunft",
                "WATER Referenz",
                "UNKNOWN Unsupported [g/100g]",
                "UNKNOWN Datenherkunft",
                "UNKNOWN Referenz",
            ])
            sheet.append(["C131000", "Hafer ganzes Korn, roh", "Oat whole grain, raw", 1443, "BLS", "BLS 4.0", 11.45, "BLS", "BLS 4.0", 99, "BLS", "BLS 4.0"])
            sheet.append(["C133000", "Hafer Flocken", "Oat flakes", "1465", "BLS", "BLS 4.0", "-", "BLS", "BLS 4.0", 88, "BLS", "BLS 4.0"])
            workbook.save(workbook_path)

            nutrient_defs_path.write_text(
                "| code | name_de |\n"
                "|---|---|\n"
                "| ENERCJ | Energie (Kilojoule) |\n"
                "| WATER | Wasser |\n",
                encoding="utf-8",
            )

            result = nutrition_food_sample_extract.extract_food_sample(
                workbook_path=workbook_path,
                nutrient_defs_path=nutrient_defs_path,
                limit=2,
            )

            self.assertEqual(len(result.foods), 2)
            self.assertEqual(result.foods[0].bls_code, "C131000")
            self.assertEqual(result.foods[0].name_de, "Hafer ganzes Korn, roh")
            self.assertEqual(result.foods[0].name_en, "Oat whole grain, raw")
            self.assertEqual(len(result.nutrients), 3)
            self.assertEqual({row.nutrient_code for row in result.nutrients}, {"ENERCJ", "WATER"})

            sql = nutrition_food_sample_extract.build_local_staging_sql(result)
            report = nutrition_food_sample_extract.build_report(result)
            sql_path.write_text(sql, encoding="utf-8")
            report_path.write_text(report, encoding="utf-8")

            self.assertIn("insert into nutrition.foods", sql)
            self.assertIn("insert into nutrition.food_nutrients", sql)
            self.assertIn("'C131000', 'Hafer ganzes Korn, roh', 'Oat whole grain, raw'", sql)
            self.assertIn("'C131000', 'WATER', 11.45000", sql)
            self.assertNotIn("UNKNOWN", sql)
            self.assertNotRegex(sql.lower(), r"\bdelete\b|\btruncate\b|\bdrop\b")
            self.assertIn("Expected food rows: 2", report)
            self.assertIn("Expected food_nutrients rows: 3", report)
            self.assertIn("Source-backed deterministic sample", report)


if __name__ == "__main__":
    unittest.main()
