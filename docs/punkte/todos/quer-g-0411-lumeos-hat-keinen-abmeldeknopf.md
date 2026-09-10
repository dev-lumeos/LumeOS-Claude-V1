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

## Nachtrag 2026-09-08 — die Anmeldung laeuft ueber v1

Tom: *,,und das login muss auf v2 normal laufen. jetzt geht es den
umweg ueber v1."*

`[cmd]` **`apps/web/src/components/auth/login-form.tsx`, 146
Zeilen.**

`[cmd]` **Die Klassen sind Tailwind, nicht `v2-`:**

    mx-auto mt-16 w-full max-w-sm rounded-token
    rounded-token border border-border bg-bg-e
    text-[12px] text-fg-muted
    rounded-token bg-[var(--acc)] px-3 py-2

`[cmd]` **Kein `v2-card`, kein `v2-btn`, kein `v2-input`.**

`[read]` **Wer sich anmeldet, sieht die alte Bauform** ? **und
landet danach in v2.**

`[cmd]` **Und `apps/coach` hat mit `coach-login-form.tsx` eine
DRITTE Fassung.**

`[read]` **Drei Anmeldeformulare im Haus** ? **dieselbe Lehre wie
Tokens, Trenner und Seitenleiste.**

### Was zu tun ist

**1** ? **die Anmeldung auf `v2-` umstellen.**

`[cmd]` **Miss, welche Bausteine es braucht:** `v2-card`,
`v2-input`, `v2-btn`, `v2-btn-primary`.

`[read]` **Und ob sie im Paket stehen** ? **`apps/coach` nutzt
sie, also vermutlich ja.**

**2** ? **die dritte Fassung aufloesen.**

`[read]` **Ein Formular in `packages/ui`, beide Anwendungen
darauf** ? **mit eigenem Titel und eigenem Ziel.**

`[read]` **Oder begruenden, warum es zwei bleiben muessen.**

**3** ? **Und der Weg nach dem Anmelden.**

`[cmd]` **`login-form.tsx:27`: `router.push(redirect)`** ?
**pruefen, wohin `redirect` ohne Parameter zeigt.**

## Nachtrag 2026-09-08 — die Ursache ist EINE ZEILE

Tom: *,,ich vermute da ist ein autologin. ich hab mich im neuen
fenster neu als coach angemeldet, und der ist jetzt auch wieder in
lumeos angemeldet."*

`[read]` **Kein Autologin** ? **derselbe Cookie.**

### Der Mechanismus ist gebaut

`[cmd]` **`packages/shared/src/supabase/cookie-name.ts:58-74`:**

    authCookieName()
      scope = NEXT_PUBLIC_AUTH_COOKIE_SCOPE
      ohne scope -> undefined (Standardname)
      mit scope  -> `sb-${ref}-${scope}-auth-token`

`[cmd]` **Zeile 29-30 nennt die Belegung:**

    web    sb-127-auth-token          (kein Suffix)
    admin  sb-127-admin-auth-token

`[cmd]` **Und `middleware.ts:21` in `apps/coach` erwaehnt es
sogar:** *,,`NEXT_PUBLIC_AUTH_COOKIE_SCOPE=coach` ->
`sb-<ref>-coach-auth-token`."*

### Nur gesetzt ist es nicht

`[cmd]` **Gemessen:**

    apps/admin/.env.local   NEXT_PUBLIC_AUTH_COOKIE_SCOPE=admin
    apps/coach/.env.local   DIE DATEI GIBT ES NICHT
    apps/coach/.env         gibt es nicht
    next.config.js          kein SCOPE

`[read]` **`apps/coach` laeuft mit dem Standardnamen** ?
**demselben wie `apps/web`.**

`[cmd]` **Deshalb hat mein losgeloester Serverstart heute die
Umgebung von `apps/web` mitgegeben** ? **und das war richtig,
aber es hat den Scope nicht gesetzt, weil er nirgends steht.**

### Und der Kommentar sagt, warum der Weg richtig ist

`[cmd]` **Zeile 79-84:**

> *,,Bewusst NUR `name` ? kein `domain`. Weg A haette `domain` auf
> `.lumeos.app` gesetzt, was lokal nicht setzbar ist. Ein Weg, der
> lokal anders funktioniert als in Produktion, ist ein Weg, den
> niemand wirklich testet. Ein eigener NAME verhaelt sich ueberall
> gleich."*

`[read]` **Die Entscheidung ist getroffen und begruendet** ?
**sie wurde bei `apps/coach` nur nicht angewandt.**

### Was zu tun ist

    1  apps/coach/.env.local anlegen
       NEXT_PUBLIC_AUTH_COOKIE_SCOPE=coach
       plus die Supabase-Schluessel

    2  Gegenprobe: auf 3200 und 3220 gleichzeitig
       verschiedene Konten, beide bleiben angemeldet

    3  pruefen, ob apps/buddy und apps/marketplace
       denselben Mangel haben

`[read]` **Und dann greift auch der Abmeldeknopf richtig** ?
**heute wuerde er beide Anwendungen abmelden.**
