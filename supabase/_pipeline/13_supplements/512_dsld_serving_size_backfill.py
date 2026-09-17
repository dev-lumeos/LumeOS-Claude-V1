"""C-512: backfill the DSLD Facts Serving Size without inventing a portion."""
from __future__ import annotations

import argparse
import csv
import subprocess
import time
from collections import defaultdict
from pathlib import Path

import openpyxl


CONTAINER = 'supabase_db_LumeOS-Claude-V1'


def text(value: object) -> str:
    return '' if value is None else str(value).strip()


def workbooks(source: Path):
    return sorted(source.glob('xlsx-batch*.xlsx'), key=lambda item: int(item.stem.removeprefix('xlsx-batch')))


def fact_serving_sizes(files):
    counts: dict[str, int] = defaultdict(int)
    for file in files:
        book = openpyxl.load_workbook(file, read_only=True, data_only=True)
        sheet = book['Dietary Supplement Facts']
        iterator = sheet.iter_rows(values_only=True)
        headers = [text(value) for value in next(iterator)]
        for values in iterator:
            row = dict(zip(headers, values))
            dsld_id = text(row['DSLD ID'])
            ingredient = text(row['Ingredient'])
            if not dsld_id or not ingredient:
                continue
            counts[dsld_id] += 1
            yield (dsld_id, str(counts[dsld_id]), text(row['Serving Size']))
        book.close()


def copy(database: str, rows) -> None:
    process = subprocess.Popen(
        ['docker', 'exec', '-i', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database, '-f', '-'],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='strict',
    )
    assert process.stdin is not None
    process.stdin.write('''
      BEGIN;
      CREATE TEMP TABLE tmp_c512 (
        dsld_id bigint NOT NULL,
        reihenfolge integer NOT NULL,
        source_serving_size text NOT NULL
      ) ON COMMIT DROP;
      UPDATE supplements.product_contents SET source_serving_size = NULL WHERE source = 'dsld';
      COPY tmp_c512 (dsld_id, reihenfolge, source_serving_size) FROM STDIN WITH (FORMAT csv);
    ''')
    writer = csv.writer(process.stdin, lineterminator='\n')
    for row in rows:
        writer.writerow(row)
    process.stdin.write('''\\.
      UPDATE supplements.product_contents c
      SET source_serving_size = NULLIF(t.source_serving_size, '')
      FROM tmp_c512 t
      JOIN supplements.supplier_products p ON p.dsld_id = t.dsld_id
      WHERE c.product_id = p.id
        AND c.reihenfolge = t.reihenfolge
        AND c.source = 'dsld';
      DO $$
      DECLARE missing integer;
      BEGIN
        SELECT count(*) INTO missing
        FROM supplements.product_contents c
        WHERE c.source = 'dsld'
          AND c.amount_per_serving IS NOT NULL
          AND c.source_serving_size IS NULL;
        IF missing <> 0 THEN
          RAISE EXCEPTION 'C-512: % DSLD-Facts-Mengen ohne Serving-Size', missing;
        END IF;
      END $$;
      COMMIT;
    ''')
    process.stdin.close()
    stdout = process.stdout.read() if process.stdout else ''
    stderr = process.stderr.read() if process.stderr else ''
    status = process.wait()
    if stdout:
        print(stdout, end='')
    if status:
        raise RuntimeError(stderr.strip() or f'C-512 COPY fehlgeschlagen ({status})')
    if stderr:
        print(stderr, end='')


def query(database: str, sql: str) -> str:
    return subprocess.run(
        ['docker', 'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database, '-t', '-A', '-c', sql],
        check=True, capture_output=True, text=True,
    ).stdout.strip()


def run(database: str, source: Path) -> None:
    files = workbooks(source)
    if len(files) != 11:
        raise RuntimeError(f'C-512: erwartete 11 XLSX-Dateien, gefunden: {len(files)}')
    started = time.perf_counter()
    missing = int(query(database, """
      SELECT count(*) FROM supplements.product_contents
      WHERE source = 'dsld' AND amount_per_serving IS NOT NULL AND source_serving_size IS NULL;
    """))
    if missing:
        copy(database, fact_serving_sizes(files))
    print(query(database, '''
      SELECT 'C-512 DSLD ' || json_build_object(
        'facts_with_serving_size', (SELECT count(*) FROM supplements.product_contents WHERE source = 'dsld' AND amount_per_serving IS NOT NULL AND source_serving_size IS NOT NULL),
        'products_with_multiple_serving_sizes', (SELECT count(*) FROM (
          SELECT product_id FROM supplements.product_contents
          WHERE source = 'dsld' AND source_serving_size IS NOT NULL
          GROUP BY product_id HAVING count(DISTINCT source_serving_size) > 1
        ) x),
        'seconds', round(extract(epoch FROM clock_timestamp() - clock_timestamp()) + %s, 3)
      )::text;
    ''' % (time.perf_counter() - started)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--database', required=True)
    parser.add_argument('--source', required=True)
    args = parser.parse_args()
    run(args.database, Path(args.source))
