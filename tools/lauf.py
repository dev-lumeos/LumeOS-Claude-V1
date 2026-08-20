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

REPO = r"D:\GitHub\LumeOS-Claude-V1"
DB = "supabase_db_LumeOS-Claude-V1"

_SI = subprocess.STARTUPINFO()
_SI.dwFlags |= subprocess.STARTF_USESHOWWINDOW
_SI.wShowWindow = 0
_FLAGS = subprocess.CREATE_NO_WINDOW


def lauf(befehl, cwd=REPO):
    """Fuehrt einen Befehl ohne Konsolenfenster aus.

    `befehl` als Liste (bevorzugt) oder als Zeichenkette, die mit
    shlex zerlegt wird. Niemals shell=True.
    """
    argv = befehl if isinstance(befehl, (list, tuple)) else shlex.split(befehl)
    r = subprocess.run(list(argv), cwd=cwd, capture_output=True,
                       startupinfo=_SI, creationflags=_FLAGS, shell=False)
    return (r.stdout + r.stderr).decode("utf-8", "replace").strip()


def git(*args, cwd=REPO):
    """git ohne Fenster. git('status', '--short')"""
    return lauf(["git", *args], cwd=cwd)


def psql(sql):
    """SQL gegen die laufende Datenbank, ohne Fenster."""
    return lauf(["docker", "exec", DB, "psql", "-U", "postgres",
                 "-d", "postgres", "-t", "-c", sql])
