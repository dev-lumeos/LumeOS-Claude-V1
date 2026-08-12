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
| `dev@lumeos.app` | (Toms eigenes) | `admin` | Toms Arbeitskonto |
| `test-user@lumeos.local` | `LumeosTestUser2026` | *keine* | Nicht-Admin für Zugriffstests |

`test-user@lumeos.local` — Nutzer-ID `61e9f10a-4e40-4162-8a92-a19479b40615`,
angelegt 2026-08-12 über `POST /auth/v1/signup`.

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
Sitzungs-Cookie von Hand nachzubauen funktioniert nicht zuverlässig —
`@supabase/ssr` leitet den Cookienamen aus der Supabase-URL ab, und ein
geratener Name führt dazu, dass die Sitzung gar nicht erkannt wird. Der
Aufruf landet dann beim Login, was wie eine wirksame Sperre aussieht, aber
nur die Middleware prüft. Für Prüfungen gegen die laufende App: über das
echte Anmeldeformular gehen und das Cookie von der App setzen lassen.

## Rolle vergeben

Nur über die Admin-API mit dem Service-Schlüssel — die Nutzer-API lehnt
`app_metadata` mit `403 not_admin` ab. Das ist Absicht: `[cmd]` `user_metadata`
ist vom Nutzer selbst setzbar und darf deshalb nie für Rechte gelesen
werden. `public.is_admin()` liest ausschliesslich `app_metadata`.
