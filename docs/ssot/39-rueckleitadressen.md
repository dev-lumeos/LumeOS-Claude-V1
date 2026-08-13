# Rückleitadressen und `site_url` (B-13)

`[cmd]` Stand 2026-08-13. Vorlage aus Block 23, **Entscheidung und lokale
Umsetzung in Block 24.** An der **Cloud** wurde nichts geändert — es gibt
für den Neubau keine Cloud-Instanz (das ist E-08, nicht B-13).

> ## Entschieden: die Domains
>
> **Tom, 2026-08-13.** Endausbau:
>
> | Domain | Was |
> |---|---|
> | `www.lumeos.app` | Landingpage — **keine App**, keine Anmeldung |
> | `web.lumeos.app` | die Webversion (`apps/web`) |
> | `admin.lumeos.app` | Verwaltung (`apps/admin`) |
> | `coach.lumeos.app` | `apps/coach` |
> | `marketplace.lumeos.app` | `apps/marketplace` |
> | `buddy.lumeos.app` | `apps/buddy` |
> | `gym.lumeos.app` | *(kommt später, Verzeichnis existiert noch nicht)* |
> | `supplier.lumeos.app` | *(kommt später, Verzeichnis existiert noch nicht)* |
>
> **Damit ist die Altfrage „`lumeos.app` oder `app.lumeos.app`" beantwortet:
> weder noch.** Die Webversion ist `web.lumeos.app`; `www.lumeos.app` ist
> die Landingpage und nicht die App.
>
> **Branches:** `dev` ist die Entwicklung. `main` entsteht erst mit Vercel.
> Getrennte Listen für `dev` und `main` sind heute gegenstandslos — es gibt
> kein `main`. Die Ableitung nimmt eine Umgebung als Parameter, trägt aber
> nur ein, was existiert.
>
> **Vercel-Vorschauadressen: heute nicht eintragen.** `[cmd]` Es gibt kein
> Vercel-Projekt. Die Warnung dazu steht in §6 — sie gehört festgehalten,
> damit es niemand später aus Bequemlichkeit tut.

---

## 1. Was heute eingetragen ist

`[cmd]` `supabase/config.toml` §`[auth]` — **ergänzt am 2026-08-13**:

```toml
site_url = "http://localhost:3200"
additional_redirect_urls = [
  "http://localhost:3200/auth/callback",
  "http://localhost:3210/auth/callback",
]
```

**Die Lücke ist geschlossen.** Bis zum 2026-08-13 stand dort nur Port
3200, obwohl `apps/admin` seit Block 19 eine eigene Callback-Route hat
(`apps/admin/src/app/auth/callback/route.ts`, Port 3210). `[cmd]` Das
Erzeugungsskript hatte sie selbst gefunden und mit Exit 1 gemeldet;
nach der Ergänzung liefert es **Exit 0**.

> **Noch nicht in Kraft.** `[cmd]` Der laufende Auth-Container trägt
> weiterhin nur `http://localhost:3200/auth/callback`
> (`GOTRUE_URI_ALLOW_LIST`). `config.toml` wird beim **Start** gelesen —
> die Ergänzung wirkt erst nach `supabase stop && supabase start`.
> Das ist ein Eingriff in die laufende Instanz und wurde **nicht**
> ausgeführt. Folgenlos, solange nur `signInWithPassword` benutzt wird
> (§2); vor der ersten Registrierung oder OAuth in `apps/admin` ist der
> Neustart nötig.

## 2. Warum die Lücke bisher nicht auffiel

`[cmd]` Gemessen: eine Passwort-Anmeldung des Testkontos liefert
`HTTP 200`, obwohl Port 3210 nirgends eingetragen ist.

Der Grund ist die Aufteilung der Auth-Verfahren:

| Verfahren | benutzt die Redirect-Liste? | wo im Repo |
|---|---|---|
| `signInWithPassword` | **nein** | `apps/web`, `apps/admin` |
| `signUp` mit `emailRedirectTo` | **ja** | `apps/web` (Registrierung) |
| OAuth (Apple, Google) | ja | noch nicht gebaut |

`[cmd]` `apps/admin` benutzt **nur** `signInWithPassword` — bewusst: die
Admin-Rolle wird vergeben, nicht beantragt, deshalb gibt es dort keine
Registrierung. Damit ist die Lücke heute **folgenlos**.

**Sie wird nicht folgenlos bleiben.** Sobald `admin` eine
Passwort-Zurücksetzung, eine Einladung per E-Mail oder OAuth bekommt,
läuft der Rückweg über die Liste — und scheitert an einem Eintrag, den
niemand vermisst hat. Deshalb gehört sie jetzt korrigiert, nicht dann.

## 3. Verhältnis zu `safe-redirect.ts` — beides, nicht eines

`[cmd]` Der offene Redirect aus Block 12 (`?redirect=//evil.com` führte
auf einen fremden Host) ist über
`packages/shared/src/auth/safe-redirect.ts` geschlossen. Naheliegende
Frage: macht das die Supabase-Liste überflüssig?

**Nein — die beiden schützen verschiedene Sprünge:**

| | schützt | greift wann |
|---|---|---|
| `safe-redirect.ts` | den **App-internen** Sprung nach der Anmeldung (`?redirect=`) | in unserem Code, bei jedem Aufruf |
| Supabase-Redirect-Liste | den Sprung **von Supabase zurück** in die App (E-Mail-Link, OAuth) | im Auth-Dienst, bevor unser Code läuft |

Ein Angreifer, der einen Bestätigungslink mit fremdem Ziel erzeugt,
erreicht `safe-redirect.ts` gar nicht — die Umleitung passiert bei
Supabase. Umgekehrt schützt die Liste nicht gegen `?redirect=`, weil
dieser Parameter unsere eigene Route betrifft.

*Zwei Schichten, die verschiedene Wege abdecken.* Eine davon zu streichen
hiesse, einen Weg offen zu lassen, weil der andere zu ist.

## 4. Der Pflegeort: abgeleitet, nicht geführt

Eine handgepflegte Liste veraltet — das ist der B-22-Befund in anderer
Gestalt. Dort zog eine Prüfung ihre Objektliste aus dem Prüfling und
meldete Erfolg, weil sie nichts mehr fand; hier bekäme eine neue App
keinen Eintrag, und es fiele erst auf, wenn eine Anmeldung scheitert.

**Deshalb erzeugt:** `scripts/redirect-urls-erzeugen.mjs`.

**Was aus dem Dateibaum kommt** — beides ohnehin gepflegt:
* **Port je App** — `apps/<name>/package.json`, Skript `dev`
* **Callback-Pfad** — Existenz von `apps/<name>/src/app/auth/callback/route.ts`
* **Existenz einer App** — das Verzeichnis selbst

**Was NICHT ableitbar ist: die Domain.** Aus einem Verzeichnisnamen folgt
keine Subdomain. Sie steht deshalb als `DOMAINS`-Tabelle im Skript, mit
dem Vermerk „Entscheidung Tom, 2026-08-13 — keine Ableitung". *Das ist
die einzige gepflegte Stelle, und sie ist als solche markiert, damit sie
nicht für einen Fund gehalten wird.*

**Vier Zustände, damit das Skript nicht rot wird für Apps, die es nicht
gibt** `[cmd]` 2026-08-13:

| Zustand | Bedingung | Eintrag? |
|---|---|---|
| **gebaut** | `package.json` + Port + Callback-Route | **ja** |
| **Gerüst** | Verzeichnis, aber kein `package.json`/Port | nein |
| **geplant** | Domain vergeben, kein Verzeichnis | nein |
| **Landingpage** | Domain ohne App (`www`) | nein |

Heute erzeugen nur `web` und `admin` einen Eintrag. `buddy`, `coach`,
`marketplace` erscheinen als „noch kein Eintrag — geplant, aber nicht
gebaut" und wandern von selbst in die Liste, sobald sie Port und
Callback-Route bekommen.

Das Skript **ändert nichts**, es schreibt nach stdout und **vergleicht
mit dem Ist-Zustand** (`site_url` und Liste):

```
# eingetragen  : http://localhost:3200/auth/callback, http://localhost:3210/auth/callback
# fehlt        : (nichts)
# ueberzaehlig : (nichts)
```

`[cmd]` Exit 1 bei Abweichung, Exit 0 bei Deckung — am 2026-08-13 beides
belegt: vor der Ergänzung 1, danach 0.

**Umgebung als Parameter:** `--umgebung lokal` (Vorgabe) oder
`--umgebung produktion`. Letztere ist als **noch nicht existent**
gekennzeichnet und gibt eine Vorschau aus, keinen Auftrag.

## 5. Lokal — eingetragen

**Erledigt 2026-08-13.** Die Werte oben stehen in `supabase/config.toml`;
`[cmd]` das Skript meldet Exit 0.

**Was noch aussteht: der Neustart.** `[cmd]` `config.toml` wird beim Start
gelesen — der laufende Auth-Container trägt weiterhin nur Port 3200
(`GOTRUE_URI_ALLOW_LIST`). `supabase stop && supabase start` ist ein
Eingriff in die laufende Instanz und wurde **nicht** ausgeführt.

Das ist heute folgenlos: `[cmd]` beide Apps melden sich über
`signInWithPassword` an, und das benutzt die Liste nicht (§2). Vor der
ersten E-Mail-Bestätigung, Passwort-Zurücksetzung oder OAuth in
`apps/admin` muss der Neustart erfolgt sein.

## 6. Was in der Cloud einzutragen wäre

Dashboard → **Authentication → URL Configuration**. Zwei Felder:
**Site URL** (eines) und **Redirect URLs** (Liste, exakte Treffer, ein
`*` je Pfadsegment erlaubt).

`[cmd]` `node scripts/redirect-urls-erzeugen.mjs --umgebung produktion`
erzeugt den Vorschlag. **Die Domains sind seit 2026-08-13 entschieden**,
nicht mehr angenommen:

```
Site URL:
  https://web.lumeos.app
Redirect URLs:
  https://web.lumeos.app/auth/callback
  https://admin.lumeos.app/auth/callback
```

Nur `web` und `admin` — die übrigen Apps sind nicht gebaut und bekommen
ihren Eintrag, wenn sie es sind. **Site URL ist `web.lumeos.app`, nicht
`www.lumeos.app`:** die Landingpage nimmt keine Anmeldung entgegen.

### Warnung: keine Vercel-Vorschauadressen

Vorschau-Deployments bekommen je eine eigene URL
(`<projekt>-<hash>.vercel.app`). Ein Platzhalter `*.vercel.app` wäre
bequem — und **öffnet die Liste für jedes fremde Vercel-Projekt**. Wer
dort ein Projekt anlegt, bekommt eine Adresse, die unsere Auth-Instanz
als gültiges Rückleitziel akzeptiert, und fängt damit den Rückweg samt
Auth-Code ab.

`[cmd]` Heute gegenstandslos: es gibt kein Vercel-Projekt. Die Warnung
steht hier und im Skript, damit sie niemand später aus Bequemlichkeit
übergeht. **Wenn Vorschauen sich anmelden können müssen: jede Adresse
einzeln eintragen, nie mit Platzhalter.**

### Umgebungen

`dev` ist die Entwicklung, `main` entsteht erst mit Vercel. `[cmd]` Es
gibt heute **kein `main`** — getrennte Listen für zwei Cloud-Umgebungen
sind damit gegenstandslos. Das Skript nimmt die Umgebung als Parameter,
damit später nichts umgebaut werden muss; eingetragen wird nur, was
existiert.

## 7. Offen

- **Die Cloud-Einträge selbst.** Sie können erst gesetzt werden, wenn es
  eine Cloud-Instanz für den Neubau gibt — das ist **E-08 (Deployment
  nach `main`)**, nicht B-13. Was einzutragen ist, steht in §6.
- **Der Supabase-Neustart** für die lokale Ergänzung (§5) — heute
  folgenlos, vor der ersten E-Mail- oder OAuth-Anmeldung in `apps/admin`
  nötig.
- `[cmd]` `apps/mobile` und `apps/staff` sind Gerüste **ohne Domain und
  ohne Port** — sie kamen in der Entscheidung vom 2026-08-13 nicht vor.
  Wer sie baut, vergibt beides.
- **Was unter `web.lumeos.app/` steht**, wenn die Landingpage nach
  `www.lumeos.app` wandert — Produktentscheidung, siehe `20-apps/web` §2.
