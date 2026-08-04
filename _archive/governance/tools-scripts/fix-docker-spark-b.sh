ssh admin@192.168.0.188 "sudo usermod -aG docker admin && newgrp docker && docker ps"
