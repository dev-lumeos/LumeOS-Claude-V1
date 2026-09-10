---
nr: G-411
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 40018063
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

## Auftrag

**Beauftragt am 2026-09-08.**

`[cmd]` **Teil 3 (der Cookie) ist ERLEDIGT** ?
`apps/coach/.env.local` **angelegt mit
`NEXT_PUBLIC_AUTH_COOKIE_SCOPE=coach`, Server neu gestartet,
HTTP 200.**

`[read]` **Es bleiben zwei: der Abmeldeknopf und die Anmeldung.**

### 1 - Der Abmeldeknopf in `apps/web`

`[cmd]` **`v2/shell.tsx` uebergibt `userName` und `userStatus`,
aber NICHT `userMenu`.**

`[cmd]` **`sidebar.tsx:87`:** *,,Menue rechts unten, z. B.
Abmelden. Ohne Angabe fehlt der Knopf."*

`[cmd]` **Vorlage:**
`apps/coach/src/app/auth/abmelden/route.ts` ? **POST, nicht
GET.**

`[read]` **GET waere von einem Bild oder Vorschau-Abruf
ausloesbar.**

### 2 - Die Anmeldung auf v2

`[cmd]` **`login-form.tsx` nutzt Tailwind:**
`rounded-token`, `text-fg-muted`, `bg-bg-e`,
`bg-[var(--acc)]`.

`[cmd]` **Kein `v2-card`, kein `v2-btn`, kein `v2-input`.**

`[cmd]` **Und `apps/coach` hat mit `coach-login-form.tsx` eine
DRITTE Fassung.**

`[read]` **Drei Anmeldeformulare** ? **dieselbe Lehre wie Tokens,
Trenner und Seitenleiste.**

`[read]` **Miss, ob eine Fassung in `packages/ui` traegt** ? **mit
eigenem Titel und eigenem Ziel je Anwendung.**

`[read]` **Oder begruende, warum zwei bleiben muessen.**

### 3 - Und die anderen Anwendungen

`[cmd]` **`apps/admin` setzt den Scope, `apps/coach` jetzt
auch.**

`[cmd]` **Miss `apps/buddy` und `apps/marketplace`** ? **haben sie
denselben Mangel?**

## Abnahmebedingungen

    A1  Abmelde-Route in apps/web, POST. Gegenprobe:
        GET wird abgewiesen.
    A2  userMenu an AppShell. Bildschirmfoto der
        Nutzerzeile mit Knopf.
    A3  abgemeldet -> /login, und der Cookie ist weg.
        Gemessen, nicht behauptet.
    A4  die Anmeldung auf v2-Bausteine. Foto vorher/nachher.
    A5  drei Formulare -> wie viele? Begruendet.
    A6  apps/buddy und apps/marketplace: Scope gesetzt?
        Gemessen.
    A7  apps/web 1545, apps/coach 65/65.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-461.**
**`?bereich=` und `?draft=` NICHT anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — die Abmelde-Route, POST

`[cmd]` **`apps/web/src/app/auth/abmelden/route.ts`**, gebaut nach
`apps/coach` — `signOut()`, dann 303 auf `/login`.

**Die Gegenprobe im Fall, der zaehlt** (`tools/_g411-get.mjs`):

    angemeldet, Cookie sb-127-auth-token
    GET /auth/abmelden  ->  405 Method Not Allowed · Allow: POST
    Cookie danach       ->  sb-127-auth-token  (unveraendert)

`[read]` **Ein `<img src="/auth/abmelden">` meldet niemanden ab.**

`[cmd]` **ABGEMELDET liefert GET eine 307** — die Middleware faengt
vorher ab, weil `/auth/abmelden` nicht in `isPublicPath` steht.
`[read]` **Beides ist richtig**, aber nur der angemeldete Fall misst
die Entscheidung; **der erste Messversuch mass die Middleware und
sah wie ein Fehlschlag aus.**

### A2 — userMenu an AppShell

`[cmd]` **`sidebar.tsx:87`:** *„Menue rechts unten, z. B. Abmelden.
Ohne Angabe fehlt der Knopf."* `[cmd]` **`shell.tsx` uebergab es
nicht** — die Zeile zeigte „angemeldet" ohne Ausgang.

**Am Schirm gemessen:**

    Nutzerzeile: {"zeile":true,
                  "name":"test-user@lumeos.local",
                  "status":"angemeldet",
                  "knopf":true, "methode":"post"}

**Bild:** `docs/bilder/g411/nutzerzeile.png`

`[read]` **Nur bei bestehender Sitzung** — ein Abmeldeknopf ohne
Sitzung waere ein Knopf ohne Wirkung (C-426).

### A3 — abgemeldet, Cookie weg

`[cmd]` **Per KLICK gemessen, nicht per Aufruf**
(`tools/_g411-abmelden.mjs`):

    vorher   Adresse /v2/dashboard · Cookies sb-127-auth-token
    Klick    auf den Knopf der Nutzerzeile
    nachher  Adresse /login       · Cookies (keine)
    danach   /v2/dashboard -> /login?redirect=%2Fv2%2Fdashboard

### A4 — die Anmeldung auf v2

**Am Schirm gemessen, vorher gegen nachher:**

    web      vorher  0 v2-Klassen · 8 Tailwind-Marken
             nachher 12 v2-Klassen · 0 Tailwind-Marken
                     1 v2-card · 2 v2-btn

**Bilder:** `docs/bilder/g411/login-vorher/web.png` gegen
`login-nachher/web.png`.

**Zwei Befunde dabei:**

`[cmd]` **1 — `v2-input` gibt es NICHT.** `[cmd]` **Gemessen in
`v2.css`:** `v2-card` 12 Regeln, `v2-btn` 15, `v2-btn-primary` 3,
**`v2-input` 0.** `[read]` **Das Feld heisst `v2-feld`** (`:1434`).
**Der Auftrag nannte den Namen, den es nicht gibt** — gebaut ist
der, den es gibt.

`[cmd]` **2 — Die Klassen allein reichten nicht.** `[cmd]`
**`@lumeos/ui/styles.css` wird nur in `app/v2/layout.tsx` geladen,
und `/login` liegt ausserhalb von `/v2/`.** `[cmd]` **Erste
Messung nach dem Umbau: 12 v2-Klassen, aber am Schirm ein
unformatiertes Formular** — kein Kasten, Felder als nackte Rahmen.

`[read]` **Nicht ins Wurzel-Layout geholt** — dort wuerde v2 auf
jede v1-Seite wirken, und `app/v2/layout.tsx` sagt ausdruecklich:
*„Das Wurzel-Layout bleibt unangetastet."* `[cmd]` **Also in
`app/login/page.tsx`**, wo die Seite es braucht.

`[read]` **Die LOGIK ist unangetastet** — react-hook-form, zod und
`signUp` bleiben; dieser Auftrag baut die Form um, nicht das
Verhalten. `[cmd]` **Anmelden und Abmelden danach durchgemessen.**

### A5 — drei Formulare: es bleiben DREI, aber ein Client

`[cmd]` **Gemessen ueber `difflib`, Kommentare entfernt:**

    admin gegen coach   65 % gleich
    admin gegen web     15 %
    coach gegen web     16 %

**Warum web nicht zusammengelegt wird — es ist eine Entscheidung,
die schon dokumentiert war** (`admin-login-form.tsx:5-13`):

    * apps/web kann sich REGISTRIEREN (signUp). Admin nicht — eine
      Admin-Rolle vergibt 061 ueber app_metadata.
      Ein Registrierknopf hier waere irrefuehrend.
    * Das web-Formular haengt an react-hook-form und zod. Fuer zwei
      Felder waeren das zwei Abhaengigkeiten ohne Gegenwert.

`[read]` **15 % Aehnlichkeit sind keine Doppelung** — es sind zwei
verschiedene Sachen mit demselben Namen.

**Warum admin und coach trotz 65 % getrennt bleiben:** `[read]`
**der Unterschied ist der Titel und der Hinweistext, sonst nichts.**
`[read]` **Ein gemeinsames Formular waere machbar** — aber es
braeuchte eine Entscheidung ueber `packages/ui` und einen eigenen
Auftrag. **Hier waere es eine Abweichung ohne Auftrag.**

**Was STATTDESSEN zusammengelegt wurde — und das war der eigentliche
Fund:**

`[cmd]` **Die drei Formulare teilten sich nicht den Bauplan,
sondern ein KAPUTTES Stueck.** `[cmd]` **Am Schirm gemessen:**

    apps/admin, Anmeldung, VORHER:
      Adresse danach: /login   (unveraendert)
      Cookies       : (keine)
      Seitenfehler  : TypeError: Cannot read properties of
                      undefined (reading 'get')

`[read]` **Niemand konnte sich in apps/admin anmelden.**

`[cmd]` **Ursache F-07:** `createClient()` aus `packages/shared`
uebergab `cookieOptions` OHNE `cookies`; in `@supabase/ssr` 0.1.0
ueberschreibt die Destrukturierung den Vorgabewert mit `undefined`.
`[read]` **Betroffen ist jede App MIT Scope** — ohne Scope entfaellt
das Options-Objekt, **darum lief apps/web immer.**

`[cmd]` **`apps/coach` hatte die Umgehung seit F-07 in einer eigenen
Datei — mit dem Vermerk *„apps/admin nutzt denselben Pfad und waere
zu pruefen"*.** `[cmd]` **Geprueft: der Befund traf zu.**

`[cmd]` **Die Umgehung steht jetzt in `packages/shared`.
Danach gemessen:**

    apps/admin  NACHHER:  Adresse /  ·  sb-127-admin-auth-token
                          Seitenfehler: (keine)
    apps/web              sb-127-auth-token        unveraendert
    apps/coach            sb-127-coach-auth-token  unveraendert

`[cmd]` **Die Kopie in `apps/coach/src/lib/browser-client.ts`
verweist nur noch** — sie hat keinen eigenen Aufbau mehr.

### A6 — die anderen Anwendungen

`[cmd]` **Gemessen, welche Anwendungen es gibt:**

    apps/admin        package.json  ·  SCOPE=admin
    apps/coach        package.json  ·  SCOPE=coach
    apps/web          package.json  ·  bewusst OHNE Scope
    apps/buddy        NUR src/.gitkeep   (1 Datei)
    apps/mobile       NUR src/.gitkeep   (1 Datei)
    apps/staff        NUR src/.gitkeep   (1 Datei)
    apps/marketplace  GIBT ES NICHT

`[read]` **Der Auftrag nennt `apps/marketplace`** — **es existiert
nicht.** `[read]` **Und `buddy` besteht aus einer leeren Datei**,
wie `mobile` und `staff`, die der Auftrag nicht nennt.

`[read]` **Es gibt dort keinen Mangel, weil es dort keine Anwendung
gibt** — kein `package.json`, kein Quelltext, kein Cookie.

`[cmd]` **`apps/web` bleibt bewusst ohne Scope** —
`cookie-name.ts:32`: *„Ein neuer Name dort wuerde jede bestehende
Sitzung ungueltig machen … getrennt sind die beiden schon, sobald
EINE von beiden einen eigenen Namen traegt."*

**Live gemessen:**

    web   :3200  ->  sb-127-auth-token
    coach :3220  ->  sb-127-coach-auth-token
    admin :3210  ->  sb-127-admin-auth-token

`[read]` **Drei Anwendungen, drei Cookies** — Toms Befund *„LumeOS
hat Daten verloren"* kann so nicht mehr entstehen.

### A7 — die Proben

    apps/web    1551 / 1551 gruen   (1545 + 6 neue)
    apps/coach    65 / 65 gruen
    apps/admin     7 / 7 gruen

`[cmd]` **Sechs neue Waechter, zehn Gegenproben** — jede einzeln
verifiziert, dass die Sabotage ankam UND zurueckgesetzt wurde:

    GET meldet wieder ab              -> ROT
    die Route verliert GET ganz       -> ROT
    das userMenu faellt weg           -> ROT
    der Knopf wird ein onClick        -> ROT
    Anmeldung faellt auf Tailwind     -> ROT
    das Feld verliert v2-feld         -> ROT
    Seite laedt die Regeln nicht mehr -> ROT
    Client verliert cookies           -> ROT
    Client verliert storageKey        -> ROT
    Kopie baut den Client selbst      -> ROT

## Was NICHT getan ist

**1 — Die drei Anmeldeformulare bleiben drei.** `[read]`
**Begruendet in A5** — web ist eine andere Sache (15 %), admin und
coach unterscheiden sich nur in Titel und Hinweis. `[read]` **Eine
gemeinsame Fassung in `packages/ui` waere machbar und braeuchte
einen eigenen Auftrag.**

**2 — `apps/admin` und `apps/coach` tragen weiter Tailwind bzw.
eigene Klassen in der Anmeldung.** `[cmd]` **Gemessen: beide 0
v2-Klassen.** `[read]` **Der Auftrag nennt nur die Anmeldung in
`apps/web`** — die anderen zwei umzubauen waere eine Abweichung
ohne Auftrag.

**3 — `/auth/abmelden` steht nicht in `isPublicPath`.** `[read]`
**Das ist kein Mangel**: ein abgemeldeter GET wird umgeleitet, ein
angemeldeter bekommt 405. **Beide Wege enden ohne Abmeldung.**

## Neustart

`[cmd]` **NOETIG** — `packages/shared` wurde geaendert
(`supabase/client.ts`). `[read]` **Alle drei Anwendungen laden das
Paket einmal.** `[cmd]` **Die Messungen dieses Berichts liefen nach
der Aenderung** — aber Toms Fenster womoeglich nicht.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  /auth/abmelden, nur POST exportiert
    A2  userMenu in v2/shell.tsx gesetzt
    A3  Klick -> /login, Cookies weg
    A4  25 v2-Klassen im Login, 1 rounded-token
    A5  drei Formulare, mit Zahlen begruendet
    A6  apps/marketplace existiert NICHT
    A7  web 1551, coach 65, admin 7 -- alle gruen

`[cmd]` **Selbst gemessen: alle sieben.**

### A1 — die Gegenprobe im richtigen Fall

> *,,Angemeldet: GET /auth/abmelden -> 405, Allow: POST, Cookie
> bleibt. Ein `<img src>` meldet niemanden ab. Abgemeldet liefert
> GET 307, weil die Middleware vorher abfaengt; mein erster
> Messversuch mass genau das und sah wie ein Fehlschlag aus."*

`[read]` **Er hat gemerkt, dass seine Probe eine Schicht VOR dem
Gegenstand traf** ? **und die Messung berichtigt statt den Code.**

### A4 — zwei Praemissen meines Auftrags waren falsch

**1** ? `[cmd]` **`v2-input` gibt es nicht.**

    v2-card   12 Regeln
    v2-btn    15
    v2-input   0

`[cmd]` **Das Feld heisst `v2-feld`.**

`[read]` **Ich habe einen Namen in den Auftrag geschrieben, den es
nicht gibt.**

**2** ? `[cmd]` **`@lumeos/ui/styles.css` wird nur in
`app/v2/layout.tsx` geladen, `/login` liegt ausserhalb.**

> *,,Erste Messung: 12 v2-Klassen, am Schirm ein unformatiertes
> Formular."*

`[read]` **Die Klassen allein reichten nicht** ? **und er hat es
NICHT ins Wurzel-Layout geholt, weil v2 dann auf jede v1-Seite
gewirkt haette.**

### A5 ist der eigentliche Fund

> *,,`apps/admin` liess sich nicht anmelden ? *Cannot read
> properties of undefined (reading 'get')*, kein Cookie."*

`[cmd]` **`packages/shared/src/supabase/client.ts` geaendert** ?
**eine Datei.**

`[read]` **Und wie er darauf kam:** **`apps/coach`s eigener
Kommentar sagte *,,apps/admin nutzt denselben Pfad und waere zu
pruefen"*.**

`[read]` **Eine Notiz in fremdem Code, die niemand nachgegangen
war** ? **und dahinter ein Fehler, der die ganze
Verwaltungsanwendung unbenutzbar machte.**

`[cmd]` **Danach: `sb-127-admin-auth-token` wird gesetzt, `web`
und `coach` unveraendert.**

### A6 — die Praemisse stimmte nicht

`[cmd]` **`apps/marketplace` existiert nicht.**
`[cmd]` **`apps/buddy` hat EINE Datei** ? **eine `.gitkeep`.**

> *,,Kein Mangel, weil dort keine Anwendung ist. Live: drei
> Anwendungen, drei Cookies."*

`[read]` **Ich hatte nach einem Mangel in zwei Anwendungen
gefragt, die es nicht gibt.**

### Was offen bleibt

`[read]` **`admin` und `coach` teilen 65 Prozent, der Unterschied
ist Titel und Hinweistext.**

`[read]` **`web` teilt 15 Prozent** ? `signUp`,
`react-hook-form/zod` ? **eine dokumentierte Entscheidung.**

`[read]` **Eine gemeinsame Fassung braucht einen eigenen
Auftrag.**

**Abgenommen.**

