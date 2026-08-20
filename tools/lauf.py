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
