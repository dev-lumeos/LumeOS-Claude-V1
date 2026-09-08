"""Fensterfreie Befehlsausfuehrung fuer Orchestrator- und Pruefskripte.

Anlass (Tom, 2026-08-19): ,Diese scheiss Terminalfenster poppen immer
noch ueberall auf.

Ursache: Skripte riefen `subprocess.run(..., shell=True)` ohne
CREATE_NO_WINDOW. Die Regel in CLAUDE.md sagt das Gegenteil, sie wurde
nur nicht befolgt.

Benutzung:
    import sys; sys.path.insert(0, r"D:\\GitHub\\LumeOS-Claude-V1\\tools")
    from lauf import lauf, git, psql

    print(git("status", "--short"))
    print(psql("select count(*) from nutrition.foods;"))
    print(lauf(["node", "--version"]))
"""
import subprocess
import shlex
import io
import os
import time

REPO = r"D:\GitHub\LumeOS-Claude-V1"
DB = "supabase_db_LumeOS-Claude-V1"

_SI = subprocess.STARTUPINFO()
_SI.dwFlags |= subprocess.STARTF_USESHOWWINDOW
_SI.wShowWindow = 0
_FLAGS = subprocess.CREATE_NO_WINDOW


def _aufloesen(name):
    """Windows: npm/pnpm/npx sind .cmd-Skripte, keine .exe.

    subprocess mit shell=False findet sie nur ueber den vollen Pfad.
    Das war der Grund, warum `pnpm dev` und `npx tsx` mit WinError 2
    scheiterten (2026-08-20).
    """
    import shutil
    return shutil.which(name + ".cmd") or shutil.which(name) or name


def lauf(befehl, cwd=REPO):
    """Fuehrt einen Befehl ohne Konsolenfenster aus.

    `befehl` als Liste (bevorzugt) oder als Zeichenkette, die mit
    shlex zerlegt wird. Niemals shell=True.
    """
    argv = list(befehl if isinstance(befehl, (list, tuple)) else shlex.split(befehl))
    if argv and argv[0] in ("npm", "npx", "pnpm", "yarn", "tsx"):
        argv[0] = _aufloesen(argv[0])
    r = subprocess.run(argv, cwd=cwd, capture_output=True,
                       startupinfo=_SI, creationflags=_FLAGS, shell=False)
    return (r.stdout + r.stderr).decode("utf-8", "replace").strip()


def git(*args, cwd=REPO):
    """git ohne Fenster. git('status', '--short')"""
    return lauf(["git", *args], cwd=cwd)


def psql(sql):
    """SQL gegen die laufende Datenbank, ohne Fenster."""
    return lauf(["docker", "exec", DB, "psql", "-U", "postgres",
                 "-d", "postgres", "-t", "-c", sql])


def _wo(name):
    """Vollen Pfad eines Programms finden, auch als .cmd/.exe-Shim.

    shutil.which loest `npx` nach `npx.cmd` auf. Ohne das scheitert
    shell=False mit WinError 2 — und wer dann auf shell=True ausweicht,
    hat wieder ein Fenster. Deshalb steht es hier statt danebengebaut
    (Tom, 2026-08-20).
    """
    import shutil
    p = shutil.which(name)
    if not p:
        raise FileNotFoundError(f"{name} nicht im PATH gefunden")
    return p


def npx(*args, cwd=REPO):
    """npx ohne Fenster. npx('tsc', '--noEmit')

    `.cmd`-Shims laufen ueber cmd.exe; CREATE_NO_WINDOW haelt das
    Fenster trotzdem zu, weil der Prozess direkt und nicht ueber die
    Shell gestartet wird.
    """
    return lauf([_wo("npx"), *args], cwd=cwd)


def pnpm(*args, cwd=REPO):
    """pnpm ohne Fenster. pnpm('gate')"""
    return lauf([_wo("pnpm"), *args], cwd=cwd)


def node(*args, cwd=REPO):
    """node ohne Fenster. node('tools/schuss.mjs', '/v2/nutrition', 'x.png')"""
    return lauf([_wo("node"), *args], cwd=cwd)


def hole(url, cookies=None):
    """Eine Seite oder Route lesen, ohne Fenster und ohne Browser.

    `[read]` Der Nachweis kommt aus dem DOM oder der HTTP-Antwort,
    nicht aus einem Bildschirmfoto (Tom, 2026-08-20). Gibt
    (status, text) zurueck; ein HTTP-Fehler ist ein Ergebnis, kein
    Absturz.
    """
    import urllib.request
    import urllib.error
    req = urllib.request.Request(url)
    if cookies:
        req.add_header("Cookie", cookies)
    try:
        with urllib.request.urlopen(req) as f:
            return f.status, f.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def schreib(pfad, text, versuche=12, pause=0.8):
    """Eine Datei atomar schreiben, ohne Nebendatei zu hinterlassen.

    `[cmd]` **G-380 gemessen:** die bisherige Fassung, in jedem
    Skript neu abgeschrieben, legte `pfad + ".neu"` INNERHALB der
    Wiederholschleife an und raeumte sie nicht weg. `[read]`
    **Scheitert `os.replace` -- genau der Fall, fuer den die
    Schleife da ist -- ueberlebt die Nebendatei.** So kam
    `recovery/ansicht.tsx.neu` in den Baum (84bb575f, G-375): das
    Skript meldete Fehlschlag, das Ziel wurde von Hand berichtigt,
    und niemand sah nach der Nebendatei.

    `[read]` **Zwei Aenderungen:** die Nebendatei liegt im selben
    Verzeichnis mit eindeutigem Namen (nie `.neu`, damit ein Rest
    nicht wie eine Zweitfassung aussieht), und `finally` raeumt sie
    in JEDEM Ausgang weg -- auch beim Absturz.

    `[read]` **Gibt True/False zurueck, wirft nicht.** Der Aufrufer
    prueft den Rueckgabewert -- eine Erfolgsmeldung ohne Pruefung
    ist keine Messung.
    """
    import tempfile
    pfad = os.path.abspath(pfad)
    ordner = os.path.dirname(pfad) or "."
    for _ in range(versuche):
        tmp = None
        try:
            fd, tmp = tempfile.mkstemp(dir=ordner, prefix=".schreib-")
            with io.open(fd, "w", encoding="utf-8", newline="\n") as f:
                f.write(text)
            os.replace(tmp, pfad)
            tmp = None          # uebernommen, nichts mehr wegzuraeumen
            return True
        except PermissionError:
            time.sleep(pause)
        finally:
            if tmp and os.path.exists(tmp):
                os.unlink(tmp)
    return False
