# Testkonten (nur lokale Entwicklung)

`[cmd]` Stand 2026-08-12. Gilt **ausschliesslich** für die lokale
Supabase-Instanz auf `127.0.0.1:54321`.

Diese Zugangsdaten stehen bewusst im Klartext im Repo. Das ist vertretbar,
weil die lokale Instanz mit dem öffentlich bekannten Supabase-Demo-Schlüssel
läuft und von aussen nicht erreichbar ist. **In der Cloud darf keines dieser
Konten existieren** — vor jedem Deployment prüfen.

## Konten

| E-Mail | Passwort | Rolle | Zweck |
|---|---|---|---|
| `dev@lumeos.app` | `LumeosDev2026` | `admin` | Toms Arbeitskonto, traegt den vollen Demo-Bestand |
| `test-user@lumeos.local` | `LumeosTestUser2026` | *keine* | Nicht-Admin für Zugriffstests |

`test-user@lumeos.local` — Nutzer-ID `61e9f10a-4e40-4162-8a92-a19479b40615`,
angelegt 2026-08-12 über `POST /auth/v1/signup`.

`[cmd]` **`dev@lumeos.app` traegt seit 2026-08-18 den vollen
Demo-Bestand** — 173 Mahlzeiten, 43 Koerpermessungen, 36
Recovery-Check-ins, 9 Trainingssitzungen, 1 Supplement-Stack, 2 Ziele
mit 3 Meilensteinen, 2 Laborbefunde. Eingespielt ueber
`_testdaten/eigenes-konto-fuellen.sql`.

`[read]` **Warum das Passwort hier steht:** Es wurde am 2026-08-16 von
einem Agenten gesetzt, **ohne dass es im Auftrag stand**, und war
danach zwei Tage lang nirgends dokumentiert. Ein Agent, der einen
Browser-Nachweis fuehren sollte, scheiterte daran — und probierte einen
falschen Kandidaten (`LumeOS2026!`).

**Ein Konto ohne dokumentiertes Passwort ist kein Konto, sondern eine
Sackgasse.**

`[cmd]` **Die uebrigen drei Konten haben kein Passwort**
(`encrypted_password IS NULL`): `tom.seed@example.com`,
`max.seed@example.com`, `sarah.seed@example.com`. Sie tragen Daten,
sind aber **nicht anmeldbar** — ein Zeilenschutz-Nachweis im Browser
laeuft deshalb ueber `dev@lumeos.app` und `test-user@lumeos.local`.

## Wofür der Testnutzer da ist

Jede Zugangsprüfung braucht zwei Sessions: eine, die darf, und eine, die
nicht darf. Ohne die zweite ist eine Sperre unbelegt — sie sieht richtig
aus, solange niemand sie von der anderen Seite versucht.

Konkret geprüft wird damit:

- **Zeilenschutz:** Sieht ein zweiter Nutzer die Daten des ersten? Bei
  Diary, Preferences, Water und den Tagessummen ist die Antwort belegt nein.
- **Admin-Sperre:** Bekommt ein Nicht-Admin in `apps/admin` und auf der
  Kurationsseite eine Absage — und nicht stillschweigend leere Listen?
  `[cmd]` Seit 061 filtert RLS, statt zu sperren; eine Seite, die
  Vollständigkeit vortäuscht, wäre schlechter als ein Fehler.
- **Rechteprüfung B-22:** `supabase/_pipeline/_validierung/zugriffsrechte-pruefen.mjs`
  legt sich eigene Wegwerfkonten an und räumt sie ab. Der hier
  dokumentierte Nutzer ist der dauerhafte Gegenpart für Prüfungen von Hand.

## Anmeldung im Skript

Über die Auth-API, nicht über nachgebaute Cookies:

```
POST http://127.0.0.1:54321/auth/v1/token?grant_type=password
apikey: <lokaler Demo-Anon-Schlüssel aus `supabase status -o env`>
{"email":"test-user@lumeos.local","password":"LumeosTestUser2026"}
```

**Fallstrick, an dem ich am 2026-08-12 gescheitert bin:** Das
Sitzungs-Cookie von Hand nachzubauen schlug fehl — der Aufruf landete mit
`307` beim Login, was wie eine wirksame Sperre aussieht, aber nur die
Middleware prüft.

**Aufgelöst am 2026-08-12 (Block 20). Der Name war richtig, das Format
war falsch** — die erste Diagnose („geratener Name") war es also nicht:

- **Name** `[cmd]` supabase-js 2.104.0 leitet ihn im
  `SupabaseClient`-Konstruktor ab:
  `` `sb-${url.hostname.split('.')[0]}-auth-token` `` → lokal
  **`sb-127-auth-token`**. `@supabase/ssr` 0.1.0 übernimmt diesen
  `storageKey` unverändert und setzt nur dann einen eigenen, wenn
  `cookieOptions.name` angegeben ist — `[cmd]` wir setzen bewusst keine
  `cookieOptions`.
- **Wert** `[cmd]` `@supabase/ssr` 0.1.0 reicht den Cookiewert in
  `getItem` unverändert an auth-js weiter, das ihn `JSON.parse`t. Daraus
  folgt: **kein `encodeURIComponent`** (die Kodierung lässt `JSON.parse`
  werfen, die Sitzung gilt als nicht vorhanden), **kein `base64-`-Präfix**
  (kam erst in späteren Fassungen), und **das volle Sitzungsobjekt**, kein
  Array aus Tokens. Lange Werte teilt die Bibliothek in `.0`/`.1`-Stücke.

Wer das nachbaut, prüft **zuerst**, ob die App die Sitzung überhaupt
erkennt (kein `307` auf `/login`) — sonst misst er die Middleware und
hält das Ergebnis für eine Zugangssperre. Beide Prüfskripte tun das und
brechen sonst ab.

## Rolle vergeben

Nur über die Admin-API mit dem Service-Schlüssel — die Nutzer-API lehnt
`app_metadata` mit `403 not_admin` ab. Das ist Absicht: `[cmd]` `user_metadata`
ist vom Nutzer selbst setzbar und darf deshalb nie für Rechte gelesen
werden. `public.is_admin()` liest ausschliesslich `app_metadata`.

**Die Admin-API merged `app_metadata`, sie ersetzt es nicht.** `[cmd]`
2026-08-12 belegt: ein `PUT` mit `{"provider":"email","providers":["email"]}`
liess ein vorhandenes `"role":"admin"` **stehen** — die Rücknahme sah
erfolgreich aus und war keine. Zum Entfernen ausdrücklich
`{"app_metadata":{"role":null}}` senden; beim Merge entfernt `null` den
Schlüssel. Danach **nachsehen**, nicht annehmen:

```
SELECT email, raw_app_meta_data FROM auth.users;
```

## Prüfskripte

| Datei | Prüft | Ändert `auth.users`? |
|---|---|---|
| `supabase/_pipeline/_validierung/admin-sperre-pruefen.mjs` | A (nicht angemeldet) und B (angemeldet ohne Rolle) | **nein** |
| `supabase/_pipeline/_validierung/admin-sperre-rolle-c.mjs` | C (angemeldet als Admin) | ja — vergibt dem Testkonto vorübergehend `role=admin` und nimmt sie zurück, mit Nachkontrolle |

Beide brauchen laufende Dev-Server (`3200`, `3210`) und die lokale
Supabase-Instanz; sie gehören deshalb **nicht** ins `pnpm gate` —
dieselbe Begründung wie bei `zugriffsrechte-pruefen.mjs` (B-22).
