# -*- coding: utf-8 -*-
"""Der eine Weg zum Dev-Server (A-36).

Der Dauerdefekt, den diese Datei beendet (gemessen 2026-08-22):
FUENF `next dev`-Instanzen liefen parallel gegen dieses Repo
(3200, 3201, 3205, 3207, 3310). Der Mechanismus: ein Agent startet
`pnpm dev`, Port 3200 ist besetzt, **Next weicht stumm auf den
naechsten Port aus** — niemand merkt es, und ab dann haelt jede
Instanz eigene Datei-Watcher auf demselben Quellbaum. Jeder Edit
kompiliert fuenffach, der 3200er verhungert (1,5 GB RSS), und nach
jedem Messlauf "haengt Next".

Deshalb:
  python tools/server.py status      Wer laeuft wo, RAM, Antwortzeit
  python tools/server.py aufraeumen  Duplikate + Headless-Leichen weg,
                                     der gesunde 3200er bleibt
  python tools/server.py start       Startet NUR, wenn 3200 frei ist —
                                     weicht nie auf einen anderen Port aus
  python tools/server.py neustart    aufraeumen (inkl. 3200) + start

Regeln: kein `pnpm dev`/`npx next dev` von Hand; Admin (3210) und
Coach (3220) werden nie angefasst; kein Fenster (shell=False,
CREATE_NO_WINDOW); `.next` wird nie geloescht (B-18/G-109).
"""
import io
import subprocess
import sys
import time
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

REPO = r"D:\GitHub\LumeOS-Claude-V1"
WEB = REPO + r"\apps\web"
PORT = 3200
GESCHUETZT = {3210, 3220}  # Admin, Coach — fremde Sitzungen
LOG = REPO + r"\backup\dev-server.log"

SI = subprocess.STARTUPINFO()
SI.dwFlags |= subprocess.STARTF_USESHOWWINDOW
SI.wShowWindow = 0
STILL = dict(startupinfo=SI, creationflags=subprocess.CREATE_NO_WINDOW,
             capture_output=True, text=True)


def ps(befehl: str) -> str:
    return subprocess.run(["powershell", "-NoProfile", "-Command", befehl],
                          **STILL).stdout.strip()


def horcher(port: int) -> int | None:
    raus = ps(f"(Get-NetTCPConnection -LocalPort {port} -State Listen "
              f"-ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess")
    return int(raus) if raus.isdigit() else None


def kommandozeile(pid: int) -> str:
    return ps(f"(Get-CimInstance Win32_Process -Filter \"ProcessId={pid}\").CommandLine") or ""


def ram_mb(pid: int) -> int:
    raus = ps(f"[math]::Round((Get-Process -Id {pid} -ErrorAction SilentlyContinue).WorkingSet64/1MB)")
    return int(raus) if raus.isdigit() else 0


def antwortzeit(port: int, timeout: float = 8.0) -> float | None:
    t0 = time.time()
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/login", timeout=timeout):
            return round(time.time() - t0, 1)
    except Exception:
        return None


def repo_web_server() -> list[tuple[int, int]]:
    """Alle (Port, PID), die auf irgendeinem Port lauschen und ein
    next-Prozess DIESES Repos sind — ausser Admin und Coach."""
    zeilen = ps(
        "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | "
        "Where-Object { $_.LocalAddress -in @('0.0.0.0','127.0.0.1','::') } | "
        "Select-Object LocalPort,OwningProcess | Sort-Object LocalPort -Unique | "
        "ForEach-Object { \"$($_.LocalPort) $($_.OwningProcess)\" }")
    treffer = []
    gesehen = set()
    for z in zeilen.splitlines():
        teile = z.split()
        if len(teile) != 2 or not teile[0].isdigit() or not teile[1].isdigit():
            continue
        port, pid = int(teile[0]), int(teile[1])
        if port in GESCHUETZT or pid in gesehen or not (3000 <= port <= 4000):
            continue
        cmd = kommandozeile(pid)
        if "LumeOS-Claude-V1" in cmd and "next" in cmd:
            treffer.append((port, pid))
            gesehen.add(pid)
    return treffer


def headless_leichen(min_alter_min: int = 15) -> list[int]:
    """Nur ALTE Headless-Chromes — ein gerade laufender Messlauf
    (schuss/Probe) hat aktive Headless-Prozesse, die niemand
    abschiessen darf."""
    raus = ps(
        "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | "
        "Where-Object { $_.CommandLine -match '--headless' -and "
        f"$_.CreationDate -lt (Get-Date).AddMinutes(-{min_alter_min}) }} | "
        "ForEach-Object { $_.ProcessId }")
    return [int(x) for x in raus.split() if x.isdigit()]


def beende(pid: int) -> None:
    subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], **STILL)


def status() -> None:
    print(f"== LumeOS-Web-Server (Repo-Prozesse, ohne Admin/Coach) ==")
    server = repo_web_server()
    if not server:
        print("  keiner laeuft.")
    for port, pid in server:
        t = antwortzeit(port)
        marke = "OK" if t is not None else "HAENGT/stumm"
        extra = " <- der richtige" if port == PORT else "  <- DUPLIKAT"
        print(f"  Port {port}: PID {pid}, {ram_mb(pid)} MB, "
              f"{'antwortet in ' + str(t) + ' s' if t is not None else marke}{extra}")
    leichen = headless_leichen()
    print(f"== Headless-Chrome-Leichen: {len(leichen)} ==")
    for port in sorted(GESCHUETZT):
        pid = horcher(port)
        print(f"== Port {port} (geschuetzt): {'PID ' + str(pid) if pid else 'frei'} ==")


def aufraeumen(auch_3200: bool = False) -> None:
    server = repo_web_server()
    for port, pid in server:
        ist_haupt = port == PORT
        if ist_haupt and not auch_3200 and antwortzeit(port) is not None:
            print(f"  Port {port} (PID {pid}) antwortet — bleibt.")
            continue
        grund = "Duplikat" if not ist_haupt else ("erzwungen" if auch_3200 else "haengt")
        beende(pid)
        print(f"  Port {port} (PID {pid}) beendet — {grund}.")
    leichen = headless_leichen()
    for pid in leichen:
        beende(pid)
    if leichen:
        print(f"  {len(leichen)} Headless-Chrome-Leichen beendet.")
    # Verwaiste pnpm-Wrapper des Web-Servers (halten sonst den Neustart auf)
    raus = ps(
        "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | "
        "Where-Object { $_.CommandLine -match 'lumeos/web' -and $_.CommandLine -match 'pnpm' } | "
        "ForEach-Object { $_.ProcessId }")
    for x in raus.split():
        if x.isdigit():
            beende(int(x))
            print(f"  pnpm-Wrapper PID {x} beendet.")


def start() -> None:
    halter = horcher(PORT)
    if halter is not None:
        if antwortzeit(PORT) is not None:
            print(f"Port {PORT} laeuft bereits (PID {halter}) und antwortet — nichts zu tun.")
            return
        print(f"Port {PORT} ist belegt (PID {halter}), antwortet aber nicht. "
              f"-> python tools/server.py neustart")
        sys.exit(1)
    log = open(LOG, "ab")
    log.write(f"\n===== Start {time.strftime('%Y-%m-%d %H:%M:%S')} =====\n".encode())
    # Direkt das next-Binary des Pakets — kein pnpm-Wrapper, kein
    # Fenster, fester Port. Weicht der Port aus, ist das ein Fehler,
    # kein Feature: die Pruefung oben hat ihn eben frei gesehen.
    kind = subprocess.Popen(
        ["node", WEB + r"\node_modules\next\dist\bin\next", "dev", "-p", str(PORT)],
        cwd=WEB, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
        startupinfo=SI,
        creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS
        | subprocess.CREATE_NEW_PROCESS_GROUP)
    print(f"Gestartet: PID {kind.pid}, Log {LOG}")
    for _ in range(120):
        time.sleep(2)
        t = antwortzeit(PORT, timeout=6)
        if t is not None:
            print(f"/login antwortet in {t} s — Server steht.")
            return
    print("Nach 4 Minuten keine Antwort — Log ansehen.")
    sys.exit(1)


def main() -> None:
    aktion = sys.argv[1] if len(sys.argv) > 1 else "status"
    if aktion == "status":
        status()
    elif aktion == "aufraeumen":
        aufraeumen(auch_3200=False)
    elif aktion == "start":
        start()
    elif aktion == "neustart":
        aufraeumen(auch_3200=True)
        time.sleep(2)
        start()
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
