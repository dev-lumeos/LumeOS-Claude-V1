#!/bin/bash
#
# DEPRECATED â€” Spark B startet jetzt den Coder-Next-FP8 Stack via systemd.
#
# Dieses Script startete frueher den alten Stack:
#   - Qwen3.5-122B-A10B-NVFP4 (Port 8002)
#   - DeepSeek-R1-Distill-Qwen-8B (Port 8013)
#
# Der aktuelle Stack ist:
#   - Qwen3-Coder-Next-FP8 (Port 8001), Container 'spark-b-coder'
#
# Production-Setup (autostart, restart-on-crash):
#   sudo systemctl start spark-b
#   journalctl -u spark-b -f
#
# Manueller Fallback und vollstaendige Doku:
#   infra/systemd/spark-b/start-spark-b.sh
#   infra/vllm/spark-b/setup.md
#
# Falls dieses Script trotzdem aufgerufen wird, bricht es ab.

echo "ERROR: spark-b-start.sh ist deprecated."
echo "  Production:  sudo systemctl start spark-b"
echo "  Manuell:     infra/systemd/spark-b/start-spark-b.sh"
echo "  Doku:        infra/vllm/spark-b/setup.md"
exit 1
