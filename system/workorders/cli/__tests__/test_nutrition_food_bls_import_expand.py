import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

from openpyxl import Workbook

# SSOT_SYNC_CHECK: N/A (domain=workflow_governance; reason=test-only fixture isolation for deterministic BLS import report output; no workflow behavior or SSOT policy change)

MODULE_PATH = Path(__file__).resolve().parents[1] / "nutrition_food_bls_import_expand.py"

spec = importlib.util.spec_from_file_location("nutrition_food_bls_import_expand", MODULE_PATH)
nutrition_food_bls_import_expand = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules["nutrition_food_bls_import_expand"] = nutrition_food_bls_import_expand
spec.loader.exec_module(nutrition_food_bls_import_expand)


class NutritionFoodBlsImportExpandTests(unittest.TestCase):
    def test_writes_utf8_csvs_without_committing_bulk_values_to_sql(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            workbook_path = tmp / "sample.xlsx"
            nutrient_defs_path = tmp / "nutrient-defs.md"
            output_dir = tmp / "out"
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
                "FAT Fett [g/100g]",
                "FAT Datenherkunft",
                "FAT Referenz",
                "UNKNOWN Unsupported [g/100g]",
                "UNKNOWN Datenherkunft",
                "UNKNOWN Referenz",
            ])
            sheet.append(["C100000", "Äpfel roh", "Apple raw", 250, "BLS", "BLS 4.0", "0,4", "BLS", "BLS 4.0", 99, "BLS", "BLS 4.0"])
            sheet.append(["C200000", "Öl süß", "Sweet oil", "-", "BLS", "BLS 4.0", 99.9, "BLS", "BLS 4.0", 88, "BLS", "BLS 4.0"])
            workbook.save(workbook_path)

            nutrient_defs_path.write_text(
                "| code | name_de |\n"
                "|---|---|\n"
                "| ENERCJ | Energie |\n"
                "| FAT | Fett |\n",
                encoding="utf-8",
            )

            result = nutrition_food_bls_import_expand.extract_bls_import(
                workbook_path=workbook_path,
                nutrient_defs_path=nutrient_defs_path,
                output_dir=output_dir,
                limit=None,
            )
            nutrition_food_bls_import_expand.write_import_artifacts(result, report_path=report_path)

            foods_csv = (output_dir / "foods.csv").read_text(encoding="utf-8")
            nutrients_csv = (output_dir / "food_nutrients.csv").read_text(encoding="utf-8")
            sql = (output_dir / "apply-local.sql").read_text(encoding="utf-8")

            self.assertIn("C100000,Äpfel roh,Apple raw", foods_csv)
            self.assertIn("C200000,Öl süß,Sweet oil", foods_csv)
            self.assertIn("C100000,ENERCJ,250.00000", nutrients_csv)
            self.assertIn("C100000,FAT,0.40000", nutrients_csv)
            self.assertIn("C200000,FAT,99.90000", nutrients_csv)
            self.assertNotIn("UNKNOWN", nutrients_csv)
            self.assertIn("copy stage_foods", sql.lower())
            self.assertIn("copy stage_food_nutrients", sql.lower())
            self.assertNotIn("Äpfel roh", sql)
            self.assertEqual(result.food_count, 2)
            self.assertEqual(result.food_nutrient_count, 3)
            self.assertEqual(result.missing_value_count, 1)
            self.assertEqual(result.unsupported_nutrient_codes, {"UNKNOWN"})


if __name__ == "__main__":
    unittest.main()
