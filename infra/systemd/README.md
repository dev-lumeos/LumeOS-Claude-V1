# LUMEOS Spark systemd Services

Persistent autostart für alle 4 Sparks via systemd. Nach Reboot, SSH-Disconnect
oder Crash starten die Services automatisch wieder.

**Service-User: `root`** — robust, kein sudoers-Setup nötig. Wenn du lieber
`User=admin` willst, ändere die `User=root` Zeile in jedem `*.service` File und
stelle sicher dass `admin` per NOPASSWD sudo darf (oder in der `docker`-Gruppe ist).

## Hardware-Map

| Service     | IP             | Modell                       | Mode                      |
|-------------|----------------|------------------------------|---------------------------|
| spark-a     | 192.168.0.128  | Qwen3.6-35B-A3B-FP8          | docker run (NGC nightly)  |
| spark-b     | 192.168.0.188  | Qwen3-Coder-Next-FP8         | docker run (NGC stable)   |
| spark-c     | 192.168.0.99   | google/gemma-4-26B-A4B-it    | launch-cluster.sh (eugr)  |
| spark-d     | 192.168.0.101  | openai/gpt-oss-120b          | launch-cluster.sh (eugr)  |

## Per-Spark Install Steps

Mache das **auf jedem Spark einzeln** via SSH. Beispiel für Spark 3:

```bash
# 1. Files von Threadripper auf den Spark kopieren
#    (von Threadripper/Dev-Machine aus)
scp infra/systemd/spark-c/start-spark-c.sh    admin@192.168.0.99:/home/admin/
scp infra/systemd/spark-c/spark-c.service     admin@192.168.0.99:/tmp/

# 2. Auf dem Spark einloggen
ssh admin@192.168.0.99

# 3. Wrapper ausführbar machen
chmod +x /home/admin/start-spark-c.sh

# 4. Service-File installieren
sudo mv /tmp/spark-c.service /etc/systemd/system/
sudo systemctl daemon-reload

# 5. Bestehenden Container stoppen (falls da)
docker stop vllm_node 2>/dev/null || true
docker rm   vllm_node 2>/dev/null || true

# 6. Service aktivieren + starten
sudo systemctl enable spark-c
sudo systemctl start  spark-c

# 7. Status prüfen
systemctl status spark-c
journalctl -u spark-c -f --no-pager
```

Healthcheck nach ~60s (vLLM braucht Modell-Load-Zeit):

```bash
curl http://localhost:8001/v1/models
```

## Verify nach Setup auf allen 4 Sparks

```bash
# Vom Threadripper aus — ruft alle 4 Healthchecks
for IP in 192.168.0.128 192.168.0.188 192.168.0.99 192.168.0.101; do
  echo -n "$IP: "
  curl -s --max-time 5 http://$IP:8001/v1/models \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])" \
    2>/dev/null || echo "DOWN"
done
```

Erwartung:
```
192.168.0.128: qwen3.6-35b-fp8
192.168.0.188: qwen3-coder-next-fp8
192.168.0.99:  google/gemma-4-26B-A4B-it
192.168.0.101: openai/gpt-oss-120b
```

## Reboot-Test (optional, aber empfohlen)

Nach Setup einmalig pro Spark:

```bash
ssh admin@<spark-ip>
sudo reboot
```

Warten ~2 Min, dann healthcheck. Wenn Modell wieder antwortet → systemd-Setup
funktioniert.

## Operations

```bash
systemctl status spark-c
journalctl -u spark-c -f
journalctl -u spark-c -n 100 --no-pager
sudo systemctl restart spark-c
sudo systemctl disable spark-c
```

## Wenn Modell-Config geändert werden muss

1. Wrapper-Script auf dem Spark editieren: `/home/admin/start-spark-X.sh`
2. `sudo systemctl restart spark-X`
3. `journalctl -u spark-X -n 50` prüfen

Service-File selbst ändert sich praktisch nie — nur wenn du `Restart=` oder
`User=` umstellen willst.

## Was systemd hier NICHT macht

- **Healthcheck**: systemd merkt nur ob der Prozess lebt, nicht ob `/v1/models`
  antwortet. Wenn vLLM hängt aber Prozess noch da, kein Restart. Falls du das
  brauchst: separater systemd timer + check-script. Nicht V1.
- **Multi-Spark Orchestration**: jeder Service ist isoliert. Spark 4 startet auch
  wenn Spark 3 down ist.
- **Image-Updates**: Service zieht kein neues Docker-Image. Pull manuell + restart.

## Troubleshooting

**Service startet nicht** (`systemctl status` zeigt failed):
- `journalctl -u spark-X -n 50` zeigt den Stack-Trace
- Häufig: Docker-Daemon noch nicht ready bei Boot — systemd wartet via `After=docker.service`

**Container "Already in use"**:
- Alter Container blockiert: `docker rm -f <name>` dann `systemctl restart spark-X`

**launch-cluster.sh timeout (Spark 3 / Spark 4)**:
- Erste Starts können 60–90s brauchen (Modell-Download + JIT)
- Service hat `TimeoutStartSec=600` — sollte reichen
- Bei wirklich großen Modellen ggf. erhöhen
