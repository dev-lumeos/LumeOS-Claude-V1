"""C-532 — stream raw DSLD Label Statements into the local build database."""
from __future__ import annotations

import argparse
import csv
import re
import subprocess
import sys
from pathlib import Path

import openpyxl


CONTAINER = 'supabase_db_LumeOS-Claude-V1'


def text(value: object) -> str:
    return '' if value is None else str(value).strip()


def raw(value: object) -> str:
    return '' if value is None else str(value)


def workbooks(source: Path):
    return sorted(source.glob('xlsx-batch*.xlsx'), key=lambda item: int(re.search(r'(\d+)', item.stem).group(1)))


def rows(book: openpyxl.Workbook, sheet_name: str):
    sheet = book[sheet_name]
    iterator = sheet.iter_rows(values_only=True)
    headers = [text(value) for value in next(iterator)]
    for values in iterator:
        yield dict(zip(headers, values))


def statement_rows(files):
    for file in files:
        book = openpyxl.load_workbook(file, read_only=True, data_only=True)
        for row in rows(book, 'Label Statements'):
            dsld_id = text(row['DSLD ID'])
            statement_type = raw(row['Statement Type'])
            statement_text = raw(row['Statement'])
            if not dsld_id or not statement_type.strip() or not statement_text.strip():
                continue
            yield (dsld_id, statement_type, statement_text, 'dsld')
        book.close()


def copy(database: str, files) -> None:
    process = subprocess.Popen(
        ['docker', 'exec', '-i', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database, '-f', '-'],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, encoding='utf-8', errors='strict',
    )
    assert process.stdin is not None
    process.stdin.write("""
      BEGIN;
      DELETE FROM supplements.supplier_product_label_statements WHERE source = 'dsld';
      CREATE TEMP TABLE tmp_c532 (
        dsld_id bigint,
        statement_type text,
        statement_text text,
        source text
      ) ON COMMIT DROP;
    """)
    process.stdin.write('COPY tmp_c532 (dsld_id,statement_type,statement_text,source) FROM STDIN WITH (FORMAT csv);\n')
    writer = csv.writer(process.stdin, lineterminator='\n')
    writer.writerows(statement_rows(files))
    process.stdin.write("""\\.
      INSERT INTO supplements.supplier_product_label_statements (product_id, statement_type, statement_text, source)
      SELECT p.id, t.statement_type, t.statement_text, t.source
      FROM tmp_c532 t
      JOIN supplements.supplier_products p ON p.dsld_id = t.dsld_id;
      COMMIT;
    """)
    process.stdin.close()
    stdout = process.stdout.read() if process.stdout else ''
    stderr = process.stderr.read() if process.stderr else ''
    status = process.wait()
    if stdout:
        print(stdout, end='')
    if status:
        raise RuntimeError(stderr.strip() or f'C-532 COPY schlug fehl ({status})')
    if stderr:
        print(stderr, file=sys.stderr, end='')


def run(database: str, source: Path) -> None:
    files = workbooks(source)
    if len(files) != 11:
        raise RuntimeError(f'C-532: erwartete 11 XLSX-Dateien, gefunden: {len(files)}')
    copy(database, files)
    result = subprocess.run(
        ['docker', 'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database, '-t', '-A', '-c', """
          SELECT json_build_object(
            'products', count(DISTINCT product_id),
            'statements', count(*),
            'types', count(DISTINCT statement_type)
          )::text
          FROM supplements.supplier_product_label_statements
          WHERE source = 'dsld';
        """],
        check=True, capture_output=True, text=True,
    )
    print('C-532 DSLD Label Statements ' + result.stdout.strip())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--database', required=True)
    parser.add_argument('--source', required=True)
    args = parser.parse_args()
    run(args.database, Path(args.source))
