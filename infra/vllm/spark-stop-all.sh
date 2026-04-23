#!/bin/bash
# LumeOS — Alle Container stoppen
# Aufruf: bash spark-stop-all.sh

echo "=== LumeOS — Stopping all Spark containers ==="

docker stop spark-a-bulk spark-a-light-gemma spark-a-light-phi \
             spark-b-quality spark-b-review 2>/dev/null || true

docker rm spark-a-bulk spark-a-light-gemma spark-a-light-phi \
          spark-b-quality spark-b-review 2>/dev/null || true

echo "Done. All containers stopped."
