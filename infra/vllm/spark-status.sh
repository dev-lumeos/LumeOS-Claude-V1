#!/bin/bash
# LumeOS — Status Check beider Sparks
# Aufruf: bash spark-status.sh [spark-a-ip] [spark-b-ip]
# Default IPs aus LumeOS Routing Profile

SPARK_A_IP=${1:-192.168.0.128}
SPARK_B_IP=${2:-192.168.0.129}

echo "=== LumeOS DGX Spark Status ==="
echo ""

check_endpoint() {
  local name=$1
  local url=$2
  local result=$(curl -s --connect-timeout 3 $url 2>/dev/null)
  if [ $? -eq 0 ] && [ -n "$result" ]; then
    local model=$(echo $result | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])" 2>/dev/null)
    echo "  ✅ $name → $model"
  else
    echo "  ❌ $name → nicht erreichbar"
  fi
}

echo "Spark A ($SPARK_A_IP):"
check_endpoint "Port 8001 (fp8_bulk)" "http://$SPARK_A_IP:8001/v1/models"
check_endpoint "Port 8011 (fp4_light Gemma)" "http://$SPARK_A_IP:8011/v1/models"
check_endpoint "Port 8012 (fp4_light Phi)" "http://$SPARK_A_IP:8012/v1/models"

echo ""
echo "Spark B ($SPARK_B_IP):"
check_endpoint "Port 8002 (quality/orchestrator)" "http://$SPARK_B_IP:8002/v1/models"
check_endpoint "Port 8013 (review)" "http://$SPARK_B_IP:8013/v1/models"
echo ""
