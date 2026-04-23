ssh admin@192.168.0.188 "hostname && nvidia-smi --query-gpu=name,memory.total --format=csv,noheader && df -h / && docker --version"
