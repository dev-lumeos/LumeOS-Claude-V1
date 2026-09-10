---
nr: G-411
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-411 — LumeOS hat keinen Abmeldeknopf

## Befund

Tom, 2026-09-08: *,,ich bin als coach angemeldet, weil ich dieses
login auf 3220 verwendet habe. wie log ich mich aus und wie ein?"*

`[cmd]` **`apps/web/src/app/v2/shell.tsx` uebergibt an `AppShell`:**

    version, userName, userStatus,
    mode, onModeChange, topbarActions, context

`[cmd]` **`userMenu` FEHLT.**

`[cmd]` **Und `packages/ui/src/shell/sidebar.tsx:87` sagt, was das
bedeutet:**

> *,,Menue rechts unten, z. B. Abmelden. Ohne Angabe fehlt der
> Knopf."*

`[cmd]` **In `apps/web/src/app` gibt es KEINE Abmelde-Route** ?
**nur `/auth/callback`.**

`[cmd]` **`apps/coach` hat sie** ? `/auth/abmelden`, **POST,
gebaut in G-402.**

`[read]` **Die Nutzerzeile zeigt den Namen und den Zustand
*angemeldet*** ? **aber es gibt keinen Weg hinaus.**

## Warum es jetzt auffaellt

`[cmd]` **Beide Anwendungen laufen auf `localhost`** ? **derselbe
Supabase-Cookie.**

`[read]` **Wer sich auf 3220 als Coach anmeldet, ist auf 3200
ebenfalls der Coach** ? **und sieht dort seine eigenen Daten
nicht.**

`[read]` **Toms Befund *,,LumeOS hat Daten verloren"* war das** ?
`[cmd]` **`user_goals` hat 11 Zeilen, davon 5 bei `dev`.**

`[read]` **Nichts verloren** ? **falsches Konto, und kein Weg
zurueck ausser ueber das Portal oder die Entwicklerwerkzeuge.**

## Was zu bauen ist

**1** ? **eine Abmelde-Route in `apps/web`.**

`[cmd]` **Vorlage:** `apps/coach/src/app/auth/abmelden/route.ts`
? **POST, nicht GET.**

`[read]` **GET waere von einem Bild oder einem Vorschau-Abruf
ausloesbar.**

**2** ? `userMenu` **an `AppShell` uebergeben.**

`[cmd]` **`sidebar.tsx:293` rendert es** ? **die Stelle ist da.**

**3** ? **Und der Weg hinein.**

`[cmd]` **`apps/web` hat `/login`** ? **pruefen, ob der Redirect
nach der Abmeldung dorthin fuehrt.**

## Und die Cookie-Frage

`[read]` **Zwei Anwendungen auf `localhost` teilen sich alles.**

`[read]` **In der Produktion sind es `app.lumeos.app` und
`coach.lumeos.app`** ? **dann greift `domain=.lumeos.app`, und
das ist gewollt** (SPEC_11:322: *,,Cross-domain Auth"*).

`[read]` **Lokal ist es ein Stolperstein** ? **messen, ob ein
eigener Cookie-Name je Anwendung moeglich ist.**

`[cmd]` **Claude Code hat die Frage in G-402 schon gestellt** ?
**`domain=.lumeos.app` fuer den Modus-Cookie.**
