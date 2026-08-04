---
status:     entwurf
version:    0.1
stand:      2026-08-03
ankerhash:  828b52a
quellen:    Ist-Zustand aus supabase/config.toml und packages/shared
abhaengig:  10-plattform/auth-sso, berechtigungen, datenzugriff
---

# Modul: Login

**App:** web (und in gleicher Form alle weiteren Apps) · **Typ:** core
**Aktivierung:** immer, auch ohne Session

## 1. Zweck

Stellt fest, wer eine Nutzerin ist, und hält diese Feststellung über
Domaingrenzen hinweg. Ohne dieses Modul gibt es keine `auth.uid()` — und
damit keine Nutzerdaten, keinen Zeilenschutz im Anwendungspfad und keine
Modulaktivierung je Person.

**Nicht hier:** was jemand darf. Das steht in `10-plattform/berechtigungen`.
Login beantwortet nur die Frage *wer*, nicht *was*.

## 2. Abgrenzung

Login ist kein Bildschirm, sondern eine Schicht. Es umfasst:

- Anmelden, Abmelden, Konto anlegen
- die Session lesen, erneuern, prüfen
- die Weiterleitung unangemeldeter Aufrufe
- die Übergabe der Session an die anderen Apps

**Nicht hier:** Profildaten, Spracheinstellung, Einheiten. Das ist Settings.
Das Onboarding ist ein eigener Ablauf, der nach der ersten Anmeldung greift.

## 3. Ist-Zustand

`[cmd]` Stand 2026-08-03: **Es gibt keine Anmeldung.**

| Baustein | Stand |
|---|---|
| `@supabase/ssr` | als Abhängigkeit vorhanden |
| Browser-Client in `packages/shared` | vorhanden, ungenutzt |
| Server-Client **mit Session** | **fehlt** |
| Service-Client (`service_role`) | vorhanden, in Benutzung |
| Login-Route, Middleware, Callback | fehlen |

`[read]` `packages/shared/src/supabase/server.ts` enthält ausschliesslich
`createServiceClient()` mit `SUPABASE_SERVICE_ROLE_KEY`. Damit umgeht
`apps/web` den Zeilenschutz vollständig — als Übergangslösung dokumentiert
(TODO C-11), aber es ist genau das Stück, das dieses Modul ablöst.

## 4. Zwei Befunde, die vor dem Bau zu klären sind

**`site_url` zeigt auf den falschen Port.**
`[cmd]` `supabase/config.toml`: `site_url = "http://127.0.0.1:3000"`,
`additional_redirect_urls = ["https://127.0.0.1:3000"]`.
Die App läuft auf **3200**. Nach einer Anmeldung würde Supabase auf einen
Port zurückleiten, auf dem nichts antwortet. Beide Werte sind zu korrigieren,
und bei jeder weiteren App kommt eine Rückleitadresse hinzu.

**Der Session-Server-Client fehlt.**
Er gehört nach `packages/shared` neben die beiden bestehenden, nutzt
`createServerClient` aus `@supabase/ssr` und liest das Cookie. Erst damit
kann `apps/web` mit der Identität der Nutzerin arbeiten statt mit
`service_role`.

## 5. Entitäten

| Entität | Zweck | Speicherung |
|---|---|---|
| Identität | ein Mensch, ein Konto | `auth.users`, von Supabase verwaltet |
| Session | eine gültige Anmeldung | Cookie, kein eigener Tabelleneintrag |
| Profil | Stammdaten zur Identität | eigene Tabelle, gehört zu Settings |

`[cmd]` `jwt_expiry = 3600` — eine Stunde, danach greift die Erneuerung über
den Refresh-Token. `enable_refresh_token_rotation = true`.

**Das Profil ist nicht Teil dieses Moduls**, aber es entsteht durch es: Bei
der ersten Anmeldung muss ein Profileintrag angelegt werden, sonst hat die
Identität keinen Namen und keine Voreinstellungen. Wo dieser Schritt liegt —
Datenbank-Trigger auf `auth.users` oder Anwendungslogik — ist offen.

## 6. Verfahren

`[cmd]` `enable_signup = true`, `enable_anonymous_sign_ins = false`.

Aus dem Altbestand übernommen: Apple, Google, Passkey, E-Mail mit Passwort.
Ein Verfahren je Identität genügt, mehrere sind möglich.

**Anonyme Anmeldung bleibt aus.** Sie würde eine `auth.uid()` ohne Person
erzeugen — Nutzerdaten ohne Eigentümer, die niemand wiederfindet.

## 7. Abläufe

**Anmelden.** Formular oder Anbieterknopf → Supabase Auth → Rückleitung auf
`/auth/callback` → Session im Cookie → Weiterleitung auf das ursprüngliche
Ziel aus `?redirect=`, ersatzweise `/dashboard`.

**Geschützter Aufruf ohne Session.** Middleware prüft, leitet nach
`/login?redirect=<ziel>`. Kein stiller Sprung auf die Startseite — das
verschleiert die Ursache.

**Erneuern.** Die Middleware erneuert die Session bei jedem Aufruf, damit sie
während der Benutzung nicht abläuft.

**Abmelden.** Session verwerfen, Cookie löschen — für alle Apps gleichzeitig,
weil das Cookie auf `.lumeos.app` liegt.

## 8. Zusammenspiel mit dem Zeilenschutz

Sobald eine Session existiert, arbeitet `apps/web` mit dem Session-Client
statt mit `service_role`. Damit greifen die 15 Policies aus Kettenschritt 060
zum ersten Mal im Anwendungspfad:

- Stammdaten liest jede angemeldete Identität
- Nutzerdaten nur die eigenen, über `auth.uid() = user_id`
- Betriebsdaten bleiben dicht

`[cmd]` Ohne Session ist die Rolle `anon`, und die hat kein `USAGE` auf
`nutrition` — ein unangemeldeter Zugriff scheitert bereits am Schema.

## 9. Abnahmekriterien

- **AK-1:** Gegeben keine Session, wenn eine geschützte Route aufgerufen wird,
  dann Weiterleitung nach `/login?redirect=<ziel>`.
- **AK-2:** Gegeben eine erfolgreiche Anmeldung mit `?redirect=`, dann landet
  die Nutzerin auf dem ursprünglichen Ziel, nicht auf einer Standardseite.
- **AK-3:** Gegeben eine gültige Session, wenn `apps/web` Nutzerdaten liest,
  dann verwendet es den Session-Client, nicht `service_role`.
- **AK-4:** Gegeben zwei angemeldete Identitäten mit je eigenen Daten, dann
  sieht keine die Zeilen der anderen — geprüft für alle vier Operationen.
- **AK-5:** Gegeben eine Session in `web`, wenn `buddy` geöffnet wird, dann
  ist die Nutzerin dort ohne erneute Anmeldung angemeldet.
- **AK-6:** Gegeben eine Abmeldung in einer beliebigen App, dann ist die
  Session in allen Apps beendet.
- **AK-7:** Gegeben eine Session läuft während der Benutzung ab, dann wird
  sie erneuert, ohne dass die Nutzerin es bemerkt.
- **AK-8:** Gegeben eine erste Anmeldung, dann existiert danach ein
  Profileintrag zu dieser Identität.

## 10. Entschieden am 2026-08-03

**Nichts an der Cookie-Konfiguration selbst bauen.**
`[read]` `@supabase/ssr` nutzt standardmässig den PKCE-Flow und richtet die
Speicherung und das Auslesen der Session in Cookies selbsttätig ein. Es gibt
keinen Grund, `cookieOptions` anzufassen.

*Korrektur einer früheren Fassung dieses Dokuments:* Dort stand `httpOnly:
true` als Vorgabe. `[read]` Die beobachtete Voreinstellung ist `httpOnly:
false` neben `sameSite: lax` und `path: /`. Auf `true` gesetzt, könnte der
Browser-Client die Session nicht mehr lesen. Zudem gibt es einen offenen
Fehlerbericht, wonach `cookieOptions` teilweise ignoriert wird — eine
Einstellung, die stillschweigend wirkungslos bleibt, ist schlimmer als keine.

**Die einzige Cookie-Option, die je gesetzt wird, ist `domain`** — auf
`.lumeos.app`, damit die Session über die Apps hinweg gilt. Und erst dann,
wenn die zweite App entsteht. Siehe TODO B-12.

**Lokal keine Sonderbehandlung.**
`[read]` MDN: die https-Anforderung entfällt, wenn `Secure` von localhost
gesetzt wird; lokale Adressen gelten als potenziell vertrauenswürdig. Was
`@supabase/ssr` vorgibt, funktioniert lokal wie produktiv.

**Profilanlage per Trigger auf `auth.users`.**
Ein Trigger greift bei jeder Anmeldung, auch bei einer Erstanmeldung über
`buddy` oder `coach`. Anwendungslogik in `web` würde dort Identitäten ohne
Profil hinterlassen. Dies ist ein von Supabase dokumentiertes Muster.

*Bedingung:* Der Trigger bleibt minimal — `id` und `created_at`, keine
Pflichtfelder, keine Fremdschlüssel auf Fehlbares. **Ein fehlschlagender
Trigger auf `auth.users` blockiert die Registrierung vollständig**, Supabase
antwortet dann mit 500. Was dort steht, muss unter allen Umständen gelingen.

**Lokale Anmeldung zuerst einfach.**
Alle Apps auf `localhost` mit eigenen Ports. Das app-übergreifende
Weiterreichen der Session ist lokal nicht testbar; solange nur `web` läuft,
testet der aufwendige Weg etwas, das niemand nutzt. Siehe TODO B-12.

---

## 11. Offene Fragen

1. **`site_url` und Rückleitadressen** — `[cmd]` `supabase/config.toml` zeigt
   auf Port 3000, die App läuft auf 3200. Zu korrigieren. Für Produktion:
   Vercel-Adresse, später die eigene Domain, beide über https.
2. **Verfahren zum Start** — alle vier gleichzeitig, oder mit E-Mail und
   Passwort beginnen und Apple, Google, Passkey nachziehen?
3. **Rückleitadressen je App** — sieben Apps brauchen sieben Einträge in
   `additional_redirect_urls`. Wo wird diese Liste gepflegt?

