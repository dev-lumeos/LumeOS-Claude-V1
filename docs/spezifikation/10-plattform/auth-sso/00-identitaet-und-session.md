---
status:     entwurf
version:    0.2
stand:      2026-08-12
ankerhash:  ce27ead
quellen:    docs/specs/WebPlatform/SPEC_10_WORKSPACE_LINKS.md (Altbestand)
abhaengig:  10-plattform/berechtigungen
---

# Plattform: Identität, Anmeldung, Session

**Grundsatz:** Eine Anmeldung, gültig für alle Apps des Produktbereichs,
für die die Identität berechtigt ist. Welche das sind, entscheidet die
Berechtigungsschicht — nicht dieses Dokument.
**Ausnahme seit 2026-08-12: `admin` führt eine eigene Sitzung** (§4a).
Ein Konto bleibt es trotzdem — getrennt ist die Sitzung, nicht die
Identität (§3).

## 1. Zweck

Regelt, wer sich anmeldet, wie die Session zwischen den Apps geteilt wird und
wie eine App entscheidet, ob sie jemanden hereinlässt.

**Nicht hier:** welche Module jemand sieht, Tarife, Organisationsrollen.
Das steht in `10-plattform/berechtigungen`.

## 2. Eine Identität, mehrere Zugehörigkeiten

Der Altbestand liest eine einzelne Rolle aus `app_metadata` und vergleicht sie
gegen `'admin'`. Das trägt nicht: Eine Person ist gleichzeitig Endnutzerin und
möglicherweise Coach, Gym-Angestellte oder Supplier. Ein Coach trainiert selbst
und ist damit zwangsläufig auch Endnutzer.

**Deshalb:** genau ein Eintrag in `auth.users` je Person. Alles Weitere sind
Zugehörigkeiten, die daran hängen — nicht Eigenschaften der Identität.

| Begriff | Bedeutung | Beispiel |
|---|---|---|
| Identität | Ein Mensch, ein Konto | `auth.users.id` |
| Profil | Stammdaten zur Identität | Name, Sprache, Einheiten, Zeitzone |
| Zugehörigkeit | Verbindung zu einer Organisation, mit Rolle darin | Trainerin bei Gym X |
| Beziehung | Verbindung zwischen zwei Identitäten | Coach betreut Klientin |

Eine Identität kann beliebig viele Zugehörigkeiten und Beziehungen haben.
Keine davon ist exklusiv.

## 3. Zweitkonten sind kein Lösungsweg

Wer für Coach und Endnutzer zwei Konten anlegt, verdoppelt Trainingsdaten,
zerreisst die Historie und macht die Coach-Beziehung zur Fiktion. Falls ein
Anwendungsfall auftaucht, der getrennte Konten zu brauchen scheint, ist das
ein Hinweis auf eine fehlende Zugehörigkeitsart — kein Grund für ein zweites Konto.

## 4. Session über Domaingrenzen

Die Apps des **Produktbereichs** nutzen dieselbe Supabase-Auth-Session.
Das Cookie ist auf `.lumeos.app` gesetzt und gilt damit für alle
Subdomains. **`admin` ist davon ausgenommen** und führt eine eigene
Sitzung (§4a).

**Domains entschieden `[read]` 2026-08-13 (Tom, B-13).** Die Landingpage
ist eine **eigene Domain** und nicht Teil von `web`:

| App | Domain | Zugang | Sitzung |
|---|---|---|---|
| — (Landingpage) | `www.lumeos.app` | offen, keine Anmeldung | keine |
| web | `web.lumeos.app` | angemeldet | geteilt |
| buddy | `buddy.lumeos.app` | angemeldet | geteilt |
| coach | `coach.lumeos.app` | angemeldet + Coach-Zugehörigkeit | geteilt |
| marketplace | `marketplace.lumeos.app` | offen (Katalog), angemeldet für Kauf | geteilt |
| admin | `admin.lumeos.app` | angemeldet + Admin-Zugehörigkeit | **eigen** |
| gym | `gym.lumeos.app` | angemeldet + Gym-Zugehörigkeit | geteilt |
| supplier | `supplier.lumeos.app` | angemeldet + Supplier-Zugehörigkeit | geteilt |

**Was sich damit geändert hat:** Diese Tabelle führte `web` bis zum
2026-08-13 unter `lumeos.app` mit dem Zusatz „offen (Landingpage)" — App
und Landingpage waren dieselbe Adresse. Sie sind es nicht mehr:
`www.lumeos.app` trägt die Landingpage und **keine Anmeldung**,
`web.lumeos.app` trägt die App. Der öffentliche Teil von `web`
(`20-apps/web` §2) ist damit neu zu bewerten — als eigener Punkt geführt,
nicht hier nebenbei entschieden.

`gym` und `supplier` stehen weiterhin in dieser Tabelle, waren aber
**nicht Teil der Entscheidung** vom 2026-08-13; sie behalten das Muster
`<app>.lumeos.app`. `[cmd]` Für beide existiert kein Verzeichnis unter
`apps/`.

Erweiterbar ohne Änderung dieses Dokuments: eine neue App bringt eine neue
Zeile und eine Zugehörigkeitsart mit.

## 4a. Eigene Sitzung für die Verwaltung

**Entscheidung Tom, 2026-08-12 (TODO B-12, „Weg B").** `admin` teilt das
Sitzungscookie **nicht** mit dem Produktbereich. Eine Anmeldung in `web`
wirkt dort nicht und umgekehrt; wer verwaltet, meldet sich in `admin`
gesondert an.

**Erster Grund — Testbarkeit.** Der geteilte Weg hätte `domain` auf
`.lumeos.app` gesetzt. `[cmd]` Auf `localhost` ist das nicht setzbar: ein
`domain`, das nicht zum Host passt, verwirft der Browser, und die
Anmeldung schlüge lokal fehl. Die Einstellung müsste also
umgebungsabhängig sein — in Produktion zwingend, lokal weggelassen.
*Ein Weg, der lokal anders funktioniert als in Produktion, ist ein Weg,
den niemand wirklich testet.* Ein eigener **Cookiename** verhält sich
überall gleich.

**Zweiter Grund — Trennung.** Ein Cookie aus dem Produktbereich öffnet
die Verwaltung damit nicht. Das ist strenger als der geteilte Weg, nicht
nur einfacher, und passt zu `20-apps/web` §6: `admin` wird bewusst nicht
aus `web` verlinkt.

**Umsetzung:** über den **Namen**, nicht über `domain`.
`packages/shared/src/supabase/cookie-name.ts` bildet ihn als
`sb-<projekt-ref>-<scope>-auth-token`; das Kürzel kommt aus
`NEXT_PUBLIC_AUTH_COOKIE_SCOPE` je App. `[cmd]` Gemessen aus den
`set-cookie`-Kopfzeilen beider laufenden Apps:

| App | Cookiename |
|---|---|
| `web` | `sb-<ref>-auth-token` (unverändert, kein Kürzel gesetzt) |
| `admin` | `sb-<ref>-admin-auth-token` |

Der **Umgebungsteil bleibt abgeleitet**, damit lokale und Cloud-Sitzung
derselben App nicht kollidieren. `domain` wird weiterhin **nirgends**
gesetzt.

Wiederholbarer Nachweis:
`supabase/_pipeline/_validierung/cookie-trennung-pruefen.mjs`.

**Geklärt `[read]` 2026-08-03:** Die Cookie-Handhabung wird nicht selbst
konfiguriert. `@supabase/ssr` nutzt standardmässig den PKCE-Flow und richtet
Speicherung und Auslesen der Session selbsttätig ein. Die beobachtete
Voreinstellung ist `httpOnly: false`, `sameSite: lax`, `path: /` — auf
`httpOnly: true` gesetzt, könnte der Browser-Client die Session nicht mehr
lesen. Zudem ist ein Fehlerbericht offen, wonach `cookieOptions` teilweise
ignoriert wird.

**Überholt durch §4a (2026-08-12):** Der Satz lautete hier, die einzige
je gesetzte Option sei `domain` auf `.lumeos.app`, sobald die zweite App
entsteht (TODO B-12). Die zweite App ist da, und die Entscheidung fiel
gegen `domain`: gesetzt wird stattdessen der **Name** — für `admin`
`[cmd]` `sb-<ref>-admin-auth-token`, für den Produktbereich gar nichts.
`domain` bleibt damit weiterhin an keiner Stelle gesetzt.

**Erledigt `[read]` 2026-08-13:** Hier stand, der Altbestand nenne
`app.lumeos.app` und `lumeos.app` für dieselbe App und die Domain von
`web` sei festzulegen. Tom hat entschieden: **weder noch** — `web` liegt
unter `web.lumeos.app`, `www.lumeos.app` trägt die Landingpage. Siehe die
Tabelle in §4.

## 5. Ablauf beim Wechsel zwischen Apps

Gilt für den **Produktbereich**. Für `admin` siehe den Zusatz darunter.

1. Nutzerin klickt einen App-Link in `web`, Ziel öffnet in neuem Tab
2. Ziel-App liest die Session aus dem geteilten Cookie
3. Session vorhanden und berechtigt → direkt drin
4. Session vorhanden, aber nicht berechtigt → Hinweisseite, kein stiller Redirect
5. Keine Session → `/login?redirect=<ursprüngliches Ziel>`

**Zusatz `admin` (§4a):** Schritt 1 entfällt — `admin` wird nicht aus
`web` verlinkt (`20-apps/web` §6) und direkt aufgerufen. Schritt 2 findet
kein geteiltes Cookie, weil die App einen eigenen Namen liest; der Ablauf
beginnt deshalb regelmässig bei Schritt 5. Schritt 4 gilt unverändert:
`[cmd]` ein angemeldeter Nicht-Admin bekommt eine **Absage**, keine leere
Liste und keinen stillen Redirect — belegt in
`supabase/_pipeline/_validierung/admin-sperre-pruefen.mjs`.

**Zu Schritt 4:** Ein stiller Redirect zurück verschleiert die Ursache. Wer
das Coach-Portal öffnet und keine Coach-Zugehörigkeit hat, soll das erfahren.

## 6. Anmeldeverfahren

Aus dem Altbestand übernommen, unverändert gültig: Apple, Google, Passkey,
E-Mail mit Passwort. Ein Verfahren je Identität genügt; mehrere sind möglich.

## 7. Abnahmekriterien

- **AK-1:** Gegeben eine angemeldete Identität in `web`, wenn sie `buddy`
  öffnet, dann ist sie ohne erneute Anmeldung eingeloggt.
- **AK-2:** Gegeben eine Identität ohne Coach-Zugehörigkeit, wenn sie
  `coach.lumeos.app` öffnet, dann erscheint eine Hinweisseite mit Begründung
  und kein Redirect.
- **AK-3:** Gegeben keine Session, wenn eine geschützte Seite geöffnet wird,
  dann Redirect auf `/login?redirect=` mit dem ursprünglichen Ziel; nach
  erfolgreicher Anmeldung landet die Nutzerin dort.
- **AK-4:** Gegeben eine Identität mit Coach- **und** Endnutzer-Rolle, wenn
  sie sich anmeldet, dann sind beide Apps zugänglich, ohne dass ein Konto
  gewechselt oder ein zweites angelegt werden muss.
- **AK-5:** Gegeben eine Abmeldung in einer beliebigen App **des
  Produktbereichs**, dann ist die Session in allen Apps des
  Produktbereichs beendet. `admin` ist ausgenommen (§4a) — dort wird
  gesondert an- und abgemeldet.
- **AK-6:** Gegeben eine angemeldete Identität in `web`, wenn sie
  `admin.lumeos.app` öffnet, dann ist sie **nicht** angemeldet und landet
  bei `/login`. `[cmd]` Belegt am 2026-08-12 in beide Richtungen
  (`cookie-trennung-pruefen.mjs`).

## 8. Offene Fragen

1. ~~**Domain von `web`**~~ — **entschieden 2026-08-13 (Tom, B-13):**
   weder `lumeos.app` noch `app.lumeos.app`, sondern **`web.lumeos.app`**;
   `www.lumeos.app` ist die Landingpage und nicht die App. Tabelle in §4.
   *Folgefrage, neu:* der öffentliche Teil von `web` (`20-apps/web` §2)
   ist damit gegenstandslos geworden — was unter `web.lumeos.app/` steht,
   wenn dort keine Landingpage mehr liegt, ist offen.
2. **Onboarding** — der Altbestand beschreibt zehn Schritte, darunter
   Modulauswahl und Tarifwahl. Beides gehört fachlich in
   `10-plattform/berechtigungen` und ist dort nicht entschieden. Der Ablauf
   wird erst spezifiziert, wenn das geklärt ist.
3. **Abmeldung über Domaingrenzen** — AK-5 ist mit einem geteilten Cookie
   naheliegend, aber **weiterhin ungeprüft**. Der frühere Zusatz „lokal
   nicht testbar, siehe TODO B-12" ist überholt: B-12 ist entschieden
   (§4a), betrifft aber nur die Trennung von `admin`. Innerhalb des
   Produktbereichs bleibt die Frage offen und lokal nicht prüfbar,
   solange es dort nur eine App gibt: `[cmd]` `apps/buddy` und
   `apps/coach` tragen je genau eine Datei (`src/.gitkeep`),
   `apps/marketplace` existiert gar nicht.

