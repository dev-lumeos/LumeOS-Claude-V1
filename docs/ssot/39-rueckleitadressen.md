# Rückleitadressen und `site_url` (B-13) — Vorlage

`[cmd]` Stand 2026-08-13 (Block 23). **An der laufenden Instanz und an der
Cloud wurde nichts geändert.** Diese Datei stellt fest, was gilt, zeigt
eine Lücke und legt vor, was Tom entscheiden muss.

---

## 1. Was heute eingetragen ist

`[cmd]` `supabase/config.toml` §`[auth]`:

```toml
site_url = "http://localhost:3200"
additional_redirect_urls = ["http://localhost:3200/auth/callback"]
```

**Das ist unvollständig.** `[cmd]` Seit Block 19 gibt es eine zweite App
mit eigener Anmeldung und eigener Callback-Route
(`apps/admin/src/app/auth/callback/route.ts`, Port 3210). Sie steht in
keiner der beiden Zeilen.

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

Zwei Quellen, beide im Repo und beide ohnehin gepflegt:
* **Port je App** — `apps/<name>/package.json`, Skript `dev`
* **Callback-Pfad** — Existenz von `apps/<name>/src/app/auth/callback/route.ts`

Eine neue App bringt beides mit; die Liste wächst von selbst. Das Skript
**ändert nichts**, es schreibt nach stdout und **vergleicht mit dem
Ist-Zustand**:

```
# in config.toml eingetragen : http://localhost:3200/auth/callback
# fehlt dort                 : http://localhost:3210/auth/callback
# ueberzaehlig dort          : (nichts)
```

`[cmd]` Exit 1 bei Abweichung, Exit 0 bei Deckung. Damit lässt sich die
Lücke jederzeit nachprüfen, statt sie zu erinnern.

## 5. Was lokal einzutragen wäre

```toml
site_url = "http://localhost:3200"
additional_redirect_urls = [
  "http://localhost:3200/auth/callback",
  "http://localhost:3210/auth/callback",
]
```

**Nicht ausgeführt** — eine Änderung an `config.toml` wirkt auf die
laufende Instanz (`supabase stop/start`) und ist damit ein Eingriff, der
Freigabe braucht. Das Kommando liefert das Skript.

## 6. Was in der Cloud einzutragen wäre

Dashboard → **Authentication → URL Configuration**. Zwei Felder:
**Site URL** (eines) und **Redirect URLs** (Liste, exakte Treffer, ein
`*` je Pfadsegment erlaubt).

`[cmd]` `node scripts/redirect-urls-erzeugen.mjs --basis https://<domain>`
erzeugt den Vorschlag. **Die Domain-Zuordnung ist dort als Annahme
markiert** (`web` = Wurzeldomain, sonst `<app>.<domain>`) und stammt aus
`[read]` `10-plattform/auth-sso` §4.

**Was Tom entscheiden muss — die Werte selbst:**

1. **Domain von `web`:** `lumeos.app` oder `app.lumeos.app`? `[read]` Der
   Altbestand nennt beides für dieselbe App; die Frage steht seit
   2026-08-02 offen (`auth-sso` §8, Frage 1) und blockiert diesen Punkt
   als einzige.
2. **Vercel-Vorschau-Adressen:** Vorschau-Deployments bekommen je eine
   eigene URL (`<projekt>-<hash>.vercel.app`). Sie müssten entweder mit
   Platzhalter aufgenommen oder Vorschau-Anmeldungen bewusst
   ausgeschlossen werden. *Ein Platzhalter über `*.vercel.app` öffnet die
   Liste für jedes fremde Vercel-Projekt — das ist keine Kleinigkeit.*
3. **Getrennte Umgebungen:** `dev` und `main` sind verschiedene
   Supabase-Instanzen mit je eigener Liste. Die Werte aus §5 gelten nur
   lokal.

## 7. Offen

- **Die Produktions-URLs** (Punkt 1–3 oben) — Toms Entscheidung.
- **Der lokale Eintrag** aus §5 — vorbereitet, nicht angewandt.
- `[cmd]` Solange `apps/admin` nur Passwort-Anmeldung kennt, ist die
  Lücke ohne Wirkung. Sie ist trotzdem als Lücke geführt, damit sie nicht
  als Absicht gelesen wird.
