---
nr: G-204
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["tools/server.py"]
zahlen: null
---

# G-204 - Admin und Coach laufen mit sichtbarer Konsole

## Befund

(neu
  2026-08-27). Aus Toms Meldung *„es kommen wieder next-server
  terminalfenster."*

  `[cmd]` **Gemessen ueber `Win32_Process`, drei Dev-Server laufen:**

      3200  web    node .../next dev -p 3200   fensterlos, 27.08. 07:35
      3210  admin  cmd.exe /d /s /c next dev   FENSTER,    14.08. 08:32
      3220  coach  bash -c ... pnpm dev        FENSTER,    20.08. 17:02

  `[cmd]` **Der Web-Server ist sauber:** Elternprozess verschwunden,
  Startform identisch mit `tools/server.py start`
  (`DETACHED_PROCESS | CREATE_NO_WINDOW`). **Von ihm kommt kein
  Fenster.**

  `[read]` **Die Luecke ist die Zustaendigkeit:** `server.py` nennt
  3210 und 3220 `GESCHUETZT` und fasst sie **nie** an. Damit gilt die
  Fensterfreiheit nur fuer `apps/web` — **Admin und Coach wurden nie
  umgestellt** und laufen seit dem 14. bzw. 20.08. mit einer offenen
  Konsole je Server.

  `[cmd]` **Beide Fenster tragen den Titel `next-server (v14.2.35)`**,
  weil Next den Konsolentitel setzt. **Das ist der Titel aus Toms
  Bildschirmfoto.**

  `[read]` **Der Anlass steht schon einmal in `server.py`:** fuenf
  parallele `next dev` am 2026-08-22. **Die Loesung wurde damals nur
  fuer einen der drei Server gebaut.**

  **Zu tun:** `server.py` auf `apps/admin` und `apps/coach`
  erweitern — eigener Befehl je App oder ein Schalter, aber
  **dieselbe fensterlose Startform**. `[read]` **Die beiden laufenden
  Prozesse dabei nicht blind abschiessen** — es koennen fremde
  Sitzungen daranhaengen.
