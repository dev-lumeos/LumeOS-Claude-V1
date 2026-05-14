#!/bin/bash
#
# ARCHIVED / DO NOT USE
#
# Spark A / DGX1 is now managed by systemd using container `vllm-qwen` and the
# corrected Qwen3.6 service flags documented in:
# - docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md
# - infra/systemd/spark-a/start-spark-a.sh
#
# This old multi-port fp8/fp4 startup script is retained only as historical
# evidence and must not be used for active runtime recovery.

set -e

echo "spark-a legacy multi-port startup is archived."
echo "Use infra/systemd/spark-a/start-spark-a.sh after verifying the runtime task allows service changes."
exit 2
