---
status:     entwurf
version:    0.1
stand:      2026-08-02
ankerhash:  b0441a9
quellen:    docs/specs/WebPlatform/SPEC_10_WORKSPACE_LINKS.md (Altbestand)
abhaengig:  10-plattform/berechtigungen
---

# Plattform: Identität, Anmeldung, Session

**Grundsatz:** Eine Anmeldung, gültig für alle Apps, für die die Identität
berechtigt ist. Welche das sind, entscheidet die Berechtigungsschicht —
nicht dieses Dokument.

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

Alle Apps nutzen dieselbe Supabase-Auth-Session. Das Cookie ist auf
`.lumeos.app` gesetzt und gilt damit für alle Subdomains.

| App | Domain | Zugang |
|---|---|---|
| web | `lumeos.app` | offen (Landingpage), angemeldet für Module |
| buddy | `buddy.lumeos.app` | angemeldet |
| coach | `coach.lumeos.app` | angemeldet + Coach-Zugehörigkeit |
| marketplace | `marketplace.lumeos.app` | offen (Katalog), angemeldet für Kauf |
| admin | `admin.lumeos.app` | angemeldet + Admin-Zugehörigkeit |
| gym | `gym.lumeos.app` | angemeldet + Gym-Zugehörigkeit |
| supplier | `supplier.lumeos.app` | angemeldet + Supplier-Zugehörigkeit |

Erweiterbar ohne Änderung dieses Dokuments: eine neue App bringt eine neue
Zeile und eine Zugehörigkeitsart mit.

**Offen `[annahme]`:** Der Altbestand setzt `httpOnly: true`. Für serverseitige
Prüfung ist das richtig, ein Browser-Client kann das Cookie dann aber nicht
lesen. Welche Teile serverseitig laufen und welche nicht, ist gegen
`@supabase/ssr` zu verifizieren, bevor dieses Dokument freigegeben wird.

**Offen:** Der Altbestand nennt an einer Stelle `app.lumeos.app`, an anderer
`lumeos.app` für dieselbe App. Die Domain von `web` ist festzulegen.

## 5. Ablauf beim Wechsel zwischen Apps

1. Nutzerin klickt einen App-Link in `web`, Ziel öffnet in neuem Tab
2. Ziel-App liest die Session aus dem geteilten Cookie
3. Session vorhanden und berechtigt → direkt drin
4. Session vorhanden, aber nicht berechtigt → Hinweisseite, kein stiller Redirect
5. Keine Session → `/login?redirect=<ursprüngliches Ziel>`

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
- **AK-5:** Gegeben eine Abmeldung in einer beliebigen App, dann ist die
  Session in allen Apps beendet.

## 8. Offene Fragen

1. `httpOnly` und Browser-Client — siehe Abschnitt 4.
2. Domain von `web`: `lumeos.app` oder `app.lumeos.app`.
3. Onboarding: Der Altbestand beschreibt zehn Schritte, darunter Modulauswahl
   und Tarifwahl. Beides gehört fachlich in `10-plattform/berechtigungen`
   und ist dort noch nicht entschieden. Der Onboarding-Ablauf wird erst
   spezifiziert, wenn das geklärt ist.
4. Abmeldung über Domaingrenzen: AK-5 ist mit einem geteilten Cookie
   naheliegend, aber ungeprüft.
