ssh admin@192.168.0.128 "nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader; echo '---'; free -h"
