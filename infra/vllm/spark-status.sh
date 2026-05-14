#!/bin/bash
# LumeOS read-only Spark runtime status helper.
# Use only when live endpoint checks are explicitly authorized.

SPARK1_IP=${1:-192.168.0.128}
SPARK2_IP=${2:-192.168.0.188}
SPARK3_IP=${3:-192.168.0.99}

echo "=== LumeOS DGX Spark Status ==="
echo ""

check_endpoint() {
  local name=$1
  local url=$2
  local result
  result=$(curl -s --connect-timeout 3 "$url" 2>/dev/null)
  if [ $? -eq 0 ] && [ -n "$result" ]; then
    local model
    model=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])" 2>/dev/null)
    echo "  OK $name -> $model"
  else
    echo "  DOWN $name"
  fi
}

check_endpoint "DGX1 / Spark1 orchestrator" "http://$SPARK1_IP:8001/v1/models"
check_endpoint "DGX2 / Spark2 coding-docs worker" "http://$SPARK2_IP:8001/v1/models"
check_endpoint "DGX3 / Spark3 Nemotron reviewer candidate" "http://$SPARK3_IP:8001/v1/models"

echo ""
echo "DGX4/5 MiniMax lab state is UNKLAR in this repository; do not probe or route it without explicit authorization."
