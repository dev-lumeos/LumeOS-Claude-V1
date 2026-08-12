# Cookie-Bereich über Apps hinweg (B-12)

`[cmd]` Stand 2026-08-12. Vorlage aus Block 21, **Entscheidung und
Umsetzung in Block 22.**

> ## Entschieden: Weg B — getrennte Sitzung für die Verwaltung
>
> **Tom, 2026-08-12.** `apps/admin` führt ein eigenes Sitzungscookie.
> Kein geteiltes Cookie über `.lumeos.app`, `domain` bleibt an keiner
> Stelle gesetzt.
>
> **Der Grund, der den Ausschlag gab:** Weg A hätte `domain`
> umgebungsabhängig gesetzt — auf `localhost` nicht setzbar, in
> Produktion zwingend. *Ein Weg, der lokal anders funktioniert als in
> Produktion, ist ein Weg, den niemand wirklich testet.* Weg B verhält
> sich überall gleich.
>
> **Zweiter Grund:** Ein Cookie aus dem Produktbereich öffnet die
> Verwaltung damit nicht. Das ist strenger als A, nicht nur einfacher.
>
> Ergebnis und Nachweis in §6. Die Vorlage für Weg A (§4) **bleibt
> stehen** — sie ist die Begründung dafür, warum B gewählt wurde, und
> fiele sonst beim nächsten Mal wieder als Frage an.

---

## 1. Ist-Zustand

`[cmd]` **`domain` wird an keiner Stelle gesetzt.** Es gibt genau vier
Orte, an denen ein Supabase-Client mit Cookie-Anbindung entsteht:

| Ort | Zweck | `cookieOptions` |
|---|---|---|
| `packages/shared/src/supabase/client.ts` | Browser (`createBrowserClient`) | keine |
| `packages/shared/src/supabase/session.ts` | Server, Session (`createServerClient`) | keine, mit Begründung im Kopf |
| `apps/web/src/middleware.ts` | Session-Erneuerung web | keine, mit Begründung im Kopf |
| `apps/admin/src/middleware.ts` | Session-Erneuerung admin | keine |

Damit gilt die Voreinstellung von `@supabase/ssr`: Cookie auf dem
aktuellen Host, `path=/`, `sameSite=lax`, `httpOnly=false`
(`[read]` `10-plattform/auth-sso` §2 — `httpOnly: true` würde den
Browser-Client aussperren).

`[cmd]` Der Cookiename ist `sb-<erstes Hostlabel der Supabase-URL>-auth-token`,
lokal also `sb-127-auth-token` — abgeleitet im
`SupabaseClient`-Konstruktor von supabase-js, nicht konfiguriert.
Details in `37-testkonten.md`.

**Lokal teilen sich 3200 und 3210 dieselbe Sitzung** — nicht weil etwas
richtig konfiguriert wäre, sondern weil **Cookies nach Host getrennt
werden und nicht nach Port**. Beide laufen auf `localhost`.

> **Das ist der Kern des Problems:** Lokal sieht es aus wie
> funktionierendes SSO. Es prüft aber genau das nicht, was in Produktion
> zählt — dort sind `lumeos.app` und `admin.lumeos.app` **verschiedene
> Hosts**, und ohne `domain` bekäme jede App ihr eigenes Cookie.
> `[cmd]` Beide Apps haben denselben Cookienamen; lokal überschreibt
> also eine Anmeldung in der einen die Sitzung der anderen — was bei
> gleicher Identität nicht auffällt.

---

## 2. Was zu setzen wäre (Frage 1)

`domain: '.lumeos.app'` — der führende Punkt lässt das Cookie für alle
Subdomains gelten. `[read]` So sieht es `10-plattform/auth-sso` §2 vor:
*„Die einzige Option, die je gesetzt wird, ist `domain` auf
`.lumeos.app` — und erst, wenn die zweite App entsteht (TODO B-12)."*

**An welcher Stelle:** an allen vier Orten aus §1, sonst schreibt ein
Pfad das Cookie ohne `domain` und ein anderer mit — zwei Cookies
gleichen Namens in verschiedenen Geltungsbereichen, und welches gewinnt,
hängt vom Browser ab. Sinnvoll ist **eine gemeinsame Konstante in
`packages/shared`**, die alle vier lesen.

**Was mit localhost passiert:** `[cmd]` `localhost` hat keine
Subdomains, und ein `domain`-Attribut, das nicht zum aktuellen Host
passt, wird vom Browser **verworfen** — das Cookie würde gar nicht
gesetzt und die Anmeldung schlüge lokal fehl. Die Einstellung muss
deshalb **umgebungsabhängig** sein: in Produktion gesetzt, lokal
weggelassen. Etwa über eine Umgebungsvariable
`NEXT_PUBLIC_COOKIE_DOMAIN`, die lokal leer bleibt.

*Eine Konfiguration, die lokal anders ist als in Produktion, ist genau
die Sorte Unterschied, die erst beim Deployment auffällt.* Deshalb §3.

---

## 3. Lässt sich das lokal prüfen? (Frage 2)

**Nicht ohne Eingriff in Toms System — und der wird hier nicht gemacht.**

Nötig wäre eine `hosts`-Datei mit erfundenen Subdomains, damit der
Browser echte verschiedene Hosts sieht:

```
# C:\Windows\System32\drivers\etc\hosts   — NICHT ausgeführt
127.0.0.1   web.lumeos.local
127.0.0.1   admin.lumeos.local
```

Dazu `NEXT_PUBLIC_COOKIE_DOMAIN=.lumeos.local`, beide Dev-Server
weiterhin auf 3200/3210, Aufruf über `http://web.lumeos.local:3200`
und `http://admin.lumeos.local:3210`.

**Warum das trotzdem nicht die Produktionslage prüft:**

- `[cmd]` Die Datei braucht Administratorrechte und ist eine Änderung an
  Toms System, nicht am Repo.
- Ohne HTTPS lässt sich `secure: true` nicht mitprüfen — in Produktion
  wird es gesetzt sein.
- Die Ports bleiben verschieden. Cookies ignorieren Ports zwar, aber
  jede Abweichung vom Zielaufbau schwächt die Aussage.

**Ehrliche Einschätzung:** Ein lokaler Test brächte die Erkenntnis
„`domain` wird akzeptiert und geteilt" — die ist aus der Spezifikation
des Browsers ohnehin bekannt. Was er **nicht** prüft, ist das
Zusammenspiel mit der echten Domain, HTTPS und dem Reverse Proxy. Der
belastbare Test ist die erste Umgebung mit echten Subdomains.

---

## 4. Die beiden Wege, mit Preis (Frage 3)

### Weg A — geteilte Sitzung über `.lumeos.app`

Eine Anmeldung gilt für alle Apps. `[read]` Entspricht
`10-plattform/auth-sso` §2 und §5 („Ziel-App liest die Session aus dem
geteilten Cookie").

**Preis:**
- Ein gestohlenes Cookie öffnet **alle** Apps, auch die Verwaltung.
- Die Verwaltung ist damit nur so sicher wie die schwächste App.
- Jede künftige Subdomain unter `.lumeos.app` sieht das Cookie
  automatisch mit — auch eine, die es nicht bräuchte.
- Umgebungsabhängige Konfiguration (§2), die lokal nicht greift.

**Nutzen:** kein zweites Anmelden beim Wechsel nach `admin`; ein
Konto, ein Zustand.

### Weg B — getrennte Anmeldung für die Verwaltung

`admin.lumeos.app` bekommt ein eigenes Cookie (kein `domain`, oder ein
eigener `cookieOptions.name`). Wer verwaltet, meldet sich dort erneut an.

**Preis:**
- Zweite Anmeldung bei jedem Wechsel.
- `[read]` Weicht von `auth-sso` §2 ab — die Datei wäre zu ändern, nicht
  stillschweigend zu unterlaufen.

**Nutzen:**
- Ein Cookie aus dem Produktbereich öffnet die Verwaltung **nicht**.
- Passt zur bereits getroffenen Linie: `[read]` `20-apps/web` §6 —
  `admin` wird bewusst **nicht** aus `web` verlinkt, *„ein Link aus web
  würde nahelegen, dass sie zum Produkt gehören"*. Getrennte Anmeldung
  ist dieselbe Haltung, eine Ebene tiefer.
- Lokal kein Unterschied zwischen Entwicklung und Produktion nötig —
  es gibt nichts umgebungsabhängig zu setzen.

---

## 5. Empfehlung

**Weg B für `admin`, Weg A für den Produktbereich.**

`buddy`, `coach`, `marketplace` sind aus Nutzersicht dieselbe Anwendung —
dort ist eine geteilte Sitzung erwartbar und der Bruch wäre lästig.
`admin` ist es nicht: `[cmd]` es hat keinen öffentlichen Teil, wird nicht
verlinkt und trägt Schreibrechte auf gemeinsame Stammdaten (Kuration,
seit Block 21 dort). Der Preis „einmal mehr anmelden" trifft eine
Handvoll Konten; der Preis „ein Cookie öffnet auch die Verwaltung"
trifft den gesamten Bestand.

**Wenn Tom Weg A für alles will**, ist das vertretbar — dann gehört
`domain` als eine Konstante in `packages/shared`, umgebungsabhängig, und
`auth-sso` §2 bleibt wie es ist.
**Wenn Weg B**, ist `auth-sso` §2 zu ergänzen: die Tabelle dort führt
`admin` bereits mit eigener Zugehörigkeitsart, der Cookie-Satz wäre die
zweite Spalte dazu.

**Offen bleibt in beiden Fällen** `[read]` die Frage aus `auth-sso` §2:
*„Der Altbestand nennt an einer Stelle `app.lumeos.app`, an anderer
`lumeos.app` für dieselbe App. Die Domain von `web` ist festzulegen."*
Ohne diese Festlegung lässt sich `domain` nicht abschliessend setzen —
`.lumeos.app` deckt beide, aber die Entscheidung gehört getroffen.

---

## 6. Umsetzung von Weg B (Block 22, 2026-08-12)

### Wie der Name an die vier Stellen kommt

Über **eine Umgebungsvariable**, gelesen an einer Stelle in
`packages/shared`:

```
packages/shared/src/supabase/cookie-name.ts
  authCookieName()     -> sb-<projekt-ref>-<scope>-auth-token | undefined
  authCookieOptions()  -> { name } | undefined
```

Alle vier Client-Stellen lesen diese eine Funktion.

**Warum kein Parameter:** `packages/shared` wird von beiden Apps benutzt,
und `[cmd]` 14 Dateien rufen `createClient`/`createSessionClient`. Ein
Parameter müsste durch jede einzelne durchgereicht werden — eine
vergessene Stelle fiele still auf den geteilten Namen zurück und wäre
wieder verbunden, ohne dass es auffiele.
**Warum kein fester Wert in `shared`:** dann trügen ihn beide Apps.
**Warum `NEXT_PUBLIC_*`:** dieselbe Mechanik wie bei URL und
anon-Schlüssel; Next.js inlined den Wert in den Browser-Bundle, damit
gilt er in `client.ts` (Browser) und in den Server-Pfaden gleichermassen.

### Wie er heisst — und warum der Umgebungsteil bleibt

`[cmd]` Der bisher abgeleitete Name trägt die Projekt-Referenz
(`sb-127-auth-token` lokal, `sb-<ref>-auth-token` in der Cloud). Damit
kollidieren die Sitzungen verschiedener **Umgebungen** nie. Ein flacher
Name wie `sb-admin-auth-token` hätte genau das aufgegeben.

Deshalb wird **nicht ersetzt, sondern ergänzt**:

| App | `NEXT_PUBLIC_AUTH_COOKIE_SCOPE` | Cookiename |
|---|---|---|
| `web` | *nicht gesetzt* | `sb-<ref>-auth-token` |
| `admin` | `admin` | `sb-<ref>-admin-auth-token` |

`web` bleibt bewusst unverändert: getrennt sind die beiden, sobald
**eine** von ihnen einen eigenen Namen trägt. Ein neuer Name in `web`
würde jede bestehende Nutzersitzung entwerten, ohne dem Zweck zu dienen.

### Bestehende Sitzungen

**Wer in `apps/admin` angemeldet war, muss sich einmal neu anmelden.**
Der Browser trägt dort noch ein Cookie unter dem alten Namen
`sb-<ref>-auth-token`, das die App nicht mehr liest. Das ist harmlos —
es läuft ab und wird nicht ausgewertet — aber es sieht aus wie ein
Fehler, wenn man es nicht weiss. `apps/web` ist nicht betroffen.

### Nachweis

`[cmd]` Gemessen aus den `set-cookie`-Kopfzeilen der laufenden Apps,
nicht aus dem Code geschlossen:

```
apps/web    setzt: sb-127-auth-token
apps/admin  setzt: sb-127-admin-auth-token   -> disjunkt
```

`[cmd]` Wirkung in beide Richtungen geprüft: eine Sitzung unter dem
web-Namen führt in `admin` zu `307 -> /login`, eine unter dem
admin-Namen in `web` zu `307 -> /login`. Gegenprobe: unter dem jeweils
eigenen Namen wird sie erkannt (`200`).

Wiederholbar: `supabase/_pipeline/_validierung/cookie-trennung-pruefen.mjs`.
Die beiden Skripte `admin-sperre-pruefen.mjs` und
`admin-sperre-rolle-c.mjs` lesen den Namen aus **derselben Quelle wie die
App** (Ableitung + `NEXT_PUBLIC_AUTH_COOKIE_SCOPE` aus
`apps/admin/.env.local`) statt ihn nachzubauen — ändert jemand das
Kürzel, ziehen sie mit. Ein Literal dort wäre der Fehler, den diese
Skripte aufdecken sollen: eine Prüfung, die ihre Erwartung selbst
erfindet.

### Spezifikation nachgezogen

`[read]` `auth-sso` §4 (früher als „§2" zitiert) beschrieb geteilte
Sitzungen für **alle** Apps. Das widersprach der Entscheidung. Die Datei
ist `status: entwurf`, Version 0.1, und verwies für genau diese Frage
selbst auf TODO B-12 — die Änderung folgt also dem vorgesehenen Weg und
überschreibt nichts Verbindliches. Nachgezogen auf Version 0.2:
Grundsatz, §4 (Tabellenspalte „Sitzung"), neues §4a, §5 (Zusatz für
`admin`), AK-5 eingeschränkt, **AK-6 neu**, offene Frage 3 berichtigt.
