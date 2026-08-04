---
status:     entwurf
version:    0.1
stand:      2026-08-03
ankerhash:  8cdb3ac
quellen:    Gespräch Tom 2026-08-02/03; Ist-Zustand aus apps/web
abhaengig:  10-plattform/auth-sso, berechtigungen, datenzugriff, architektur
---

# App: web

**Domain:** `lumeos.app` · **Port lokal:** 3200
**Zielgruppe:** Endnutzerinnen und Endnutzer von LumeOS

## 1. Zweck und Abgrenzung

Die Hauptanwendung. Hier verwaltet eine Nutzerin ihre Gesundheits- und
Leistungsdaten: Ernährung, Training, Erholung, Supplemente, medizinische
Werte, Ziele.

`web` ist eine App unter mehreren, keine Dachanwendung. Sie **verlinkt** zu
`buddy`, `coach` und `marketplace`, sie **enthält** sie nicht.

**Nicht hier:** der AI-Companion (App `buddy`), die Coach-Seite der Betreuung
(App `coach`), Handel (App `marketplace`), Betrieb (App `admin`),
Organisationsverwaltung (Apps `gym`, `supplier`).

## 2. Unangemeldeter Zugang

`web` ist die einzige App mit öffentlichem Teil: die Landingpage unter
`lumeos.app`. Sie beschreibt das Produkt und führt zur Anmeldung.

Alles Weitere setzt eine Session voraus. Ein unangemeldeter Aufruf einer
Modulseite führt nach `/login?redirect=<ziel>`, siehe
`10-plattform/auth-sso`.

**Offen:** Umfang der Landingpage — reine Produktseite, oder mit öffentlich
lesbarem Lebensmittelkatalog? Zweites hätte Folgen für den Zeilenschutz:
`[cmd]` heute hat die Rolle `anon` kein Zugriffsrecht auf `nutrition`.

## 3. Module

| Modul | Typ | Aktivierung |
|---|---|---|
| Dashboard | core | siehe `10-plattform/berechtigungen` |
| Goals | core | dito |
| Nutrition | core | dito |
| Training | core | dito |
| Recovery | core | dito |
| Supplements | core | dito |
| Medical | core | dito |
| Settings | core | dito |
| Login | core | immer, auch unangemeldet |
| HumanCoach | addon | bei aktiver Coach-Beziehung |

**AICoach gehört nicht hierher**, sondern in die App `buddy`.

„Core" heisst zum Kernprodukt gehörend, nicht dauerhaft aktiv. Welche Module
eine Nutzerin tatsächlich sieht, löst die Berechtigungsschicht auf. Die
Navigation liest dieselbe Auflösung wie die Datenbank — eine Regel, eine
Umsetzung.

## 4. Rollen

`web` kennt genau eine Rolle: die angemeldete Nutzerin, die ihre eigenen
Daten sieht.

Es gibt hier keine Rollenabstufung. Wer Coach ist, arbeitet in `coach`; wer
verwaltet, in `admin`. Dieselbe Identität kann beides sein — sie wechselt
dafür die App, nicht das Konto. Siehe `10-plattform/auth-sso`, Abschnitt 2.

**Ausnahme HumanCoach:** Ist das Addon aktiv, sieht die Nutzerin ihre
Coach-Beziehung und steuert, welche Module der Coach einsehen darf. Die
Zustimmung liegt bei ihr, ist je Modul erteilbar und widerrufbar.

## 5. Navigation

Die Hauptnavigation zeigt die aktiven Module. Nicht aktive Module erscheinen
nicht als Sackgasse, sondern gar nicht — mit einer Ausnahme: Wo ein Modul
sichtbar sein soll, damit die Nutzerin es freischalten kann, erscheint es mit
Grund und Handlungsangebot.

Was von beidem gilt, entscheidet die Berechtigungsschicht über den
mitgelieferten Grund. Die Navigation entscheidet nicht selbst.

Settings und Login sind nicht Teil der Modulnavigation, sondern der
Rahmenbedienung.

## 6. Übergaben an andere Apps

`[read]` Der Wechsel erfolgt über Links, die in einem neuen Tab öffnen. Die
Session wird über das geteilte Cookie auf `.lumeos.app` übernommen.

| Ziel | Anlass |
|---|---|
| `buddy` | AI-Companion aufrufen |
| `coach` | nur für Identitäten mit Coach-Zugehörigkeit |
| `marketplace` | Angebote und Käufe |

Keine Rückübergabe nötig — die Apps stehen nebeneinander, nicht übereinander.

**Nicht verlinkt** werden `admin`, `gym`, `supplier`. Diese Apps erreicht man
direkt; ein Link aus `web` würde nahelegen, dass sie zum Produkt gehören.

## 7. Ist-Zustand

`[cmd]` Stand 2026-08-03, nach Archivierung der Governance-Konsole:
**14 Seiten, 6 API-Routen.**

| Route | Stand |
|---|---|
| `/nutrition/foods` | echt, liest aus der Datenbank |
| `/nutrition/curation` | echt |
| `/nutrition/local-schema` | echt, Diagnose |
| `/`, `/dashboard`, `/nutrition`, `/goals`, `/medical`, `/training`, `/recovery`, `/supplements`, `/coach`, `/settings` | Attrappen mit hartkodierten Werten |
| `/nutrition/preferences` | Weiterleitung |

Sechs API-Routen, alle unter `/api/nutrition/`.

**Abstand zur Spezifikation:** Es gibt keine Anmeldung, keine
Berechtigungsauflösung, keine Landingpage. `[cmd]` Der Datenzugriff läuft
serverseitig mit `service_role` und umgeht damit den Zeilenschutz —
Übergangslösung, siehe TODO C-11.

## 8. Abnahmekriterien

- **AK-1:** Gegeben keine Session, wenn `lumeos.app` aufgerufen wird, dann
  erscheint die Landingpage ohne Fehler und ohne Modulnavigation.
- **AK-2:** Gegeben keine Session, wenn eine Modulseite aufgerufen wird, dann
  Weiterleitung nach `/login?redirect=` mit dem ursprünglichen Ziel.
- **AK-3:** Gegeben eine Session, dann zeigt die Navigation genau die Module,
  die die Berechtigungsauflösung als aktiv meldet.
- **AK-4:** Gegeben ein Modul ist nicht aktiv, wenn seine Route direkt
  aufgerufen wird, dann erscheint kein Modulinhalt — und der Datenzugriff
  scheitert auch dann, wenn die Oberfläche versagt.
- **AK-5:** Gegeben zwei angemeldete Identitäten, dann sieht keine Daten der
  anderen.
- **AK-6:** Gegeben eine Nutzerin klickt einen App-Link, dann ist sie im Ziel
  ohne erneute Anmeldung angemeldet.
- **AK-7:** Gegeben eine Nutzerin ohne Coach-Zugehörigkeit klickt den
  Coach-Link, dann erscheint eine Hinweisseite mit Begründung, kein Redirect.

## 9. Offene Fragen

1. **Landingpage** — Umfang, siehe Abschnitt 2. Mit öffentlichem Katalog
   bräuchte `anon` Leserechte auf die Stammdaten.
2. **Modulsichtbarkeit** — verbergen oder mit Freischaltangebot zeigen?
   Vermutlich je Grund verschieden; die Regel fehlt.
3. **Mobil** — `[cmd]` `apps/mobile` existiert als Gerüst, steht aber nicht in
   Toms App-Liste. Eigene App oder PWA von `web`?
4. **Dashboard** — hat `[cmd]` eine 1-KB-Spec im Altbestand, sein Inhalt steht
   in `WebPlatform/SPEC_03`. Eigenes Modul mit Aggregation über alle Module,
   oder Ansicht?
