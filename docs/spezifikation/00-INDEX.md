# LumeOS — Spezifikation

**Stand:** 2026-08-02 · **Ankerhash:** b38770b
**Zweck:** Die verbindliche Spezifikation von LumeOS. Was hier freigegeben ist,
kann gebaut werden.

---

## Verhältnis zu den anderen Ordnern

| Ordner | Rolle |
|---|---|
| `docs/spezifikation/` | **Soll-Zustand.** Verbindlich, versioniert, freigabefähig |
| `docs/ssot/` | **Ist-Zustand.** Was gebaut ist, mit Herkunftsmarkern |
| `docs/specs/` | **Datenquelle.** Altbestand aus der Vorgängerphase, 13 Ordner, ~1,5 MB. Wird ausgewertet, nicht fortgeschrieben |
| `docs/todo/TODO.md` | Was als Nächstes ansteht |

**Regel:** In `docs/specs/` wird nicht mehr geschrieben. Inhalte wandern hierher,
geprüft und mit Statuskopf. Zwei Wahrheitsquellen sind schlimmer als eine ungenaue.

---

## Zwei Achsen

Apps und Module sind getrennt. Die Altbestand-Specs vermischen sie — daher die
vier unversöhnten Modulzählungen (10 / 11 / 7 / 13) im Spec-Audit.

**Apps** sind Auslieferungseinheiten mit eigener Domain und Zielgruppe.
**Module** sind Funktionsbereiche innerhalb einer App.
Ein Modul kann in mehreren Apps vorkommen; eine App bündelt mehrere Module.

---

## Aufbau

```
docs/spezifikation/
  10-plattform/      Ebene 0 — Fundament, muss zuerst stehen
    architektur/     Systemüberblick, Grenzen, Datenflüsse
    auth-sso/        Anmeldung, Session, Handoff zwischen den Apps
    datenzugriff/    Schemas, Grants, RLS, Client-Schicht
    design-system/   Tokens, Komponenten, Layoutregeln
    ci-cd/           Build, Test, Deployment, Umgebungen
    konventionen/    Fehler, Status, Namen, Versionierung
  20-apps/           Ebene 1 — je App: Zielgruppe, Domain, Module, Rollen
  30-module/         Ebene 2 — je Modul: Verträge
    core/            in jeder Installation vorhanden
    addon/           pro Nutzer zuschaltbar
  40-lieferungen/    Ebene 3 — abgegrenzte Bauaufträge mit Abnahmekriterien
  90-entscheidungen/ ADRs
  _vorlagen/         Vorlagen für alle Dokumenttypen
```

**Reihenfolge ist Abhängigkeit, nicht Wichtigkeit.** Module zeigen auf Plattform.
Ohne Ebene 0 ist kein Modul baubar.

---

## Apps

Domains entschieden `[read]` 2026-08-13 (Tom, B-13). Status `[cmd]`
2026-08-13 am Dateibaum erhoben, nicht fortgeschrieben.

| App | Domain | Zielgruppe | Status |
|---|---|---|---|
| — | www.lumeos.app | Landingpage, keine Anmeldung | nicht gebaut |
| `web` | web.lumeos.app | Endnutzer | **gebaut** (Port 3200) |
| `admin` | admin.lumeos.app | Betrieb, intern | **gebaut** (Port 3210) |
| `buddy` | buddy.lumeos.app | Endnutzer, AI-Companion | Gerüst (`src/.gitkeep`) |
| `coach` | coach.lumeos.app | Human Coaches | Gerüst (`src/.gitkeep`) |
| `marketplace` | marketplace.lumeos.app | Anbieter und Käufer | kein Verzeichnis |
| `gym` | – | Gym-Verwaltung | kein Verzeichnis |
| `supplier` | – | Supplier-Verwaltung | kein Verzeichnis |
| `mobile` | – *(offen)* | – *(offen)* | Gerüst (`src/.gitkeep`) |
| `staff` | – *(offen)* | – *(offen)* | Gerüst (`src/.gitkeep`) |

**`mobile` und `staff` sind Gerüste ohne Zuordnung.** `[cmd]` Beide
liegen unter `apps/` mit je einer `src/.gitkeep`, kommen aber in der
Domain-Entscheidung vom 2026-08-13 **nicht vor** und tragen auch keinen
Port in der Konvention (§8). Weder Domain noch Zielgruppe sind
festgelegt — hier bewusst offen gelassen statt geraten.

Erweiterbar. Genannte Kandidaten: Arzt, Versicherung.

## Module

**Core** — Dashboard · Goals · Nutrition · Training · Recovery · Supplements ·
Medical · Settings · Login

**Addon**, pro Nutzer aktiviert — HumanCoach (aktiv, sobald ein Coach engagiert
ist) · AICoach (in der App `buddy`, aktiv bei Buchung)

Alle Status: leer.

---

## Statuskopf — Pflicht in jeder Datei

```
---
status:     entwurf | in_pruefung | freigegeben | gebaut | ueberholt
version:    1.0
stand:      JJJJ-MM-TT
ankerhash:  <commit>
quellen:    docs/specs/<Modul>/<Datei>.md   (Altbestand, ausgewertet)
abhaengig:  10-plattform/auth-sso, 30-module/core/nutrition
---
```

Nur `freigegeben` darf gebaut werden. `gebaut` verweist auf die Lieferung
in `40-lieferungen/`.

---

## Vier Regeln, aus dem Spec-Audit abgeleitet

Der Altbestand ist nicht an fehlender Tiefe gescheitert — 1,5 MB, Nutrition
mit 46 Dateien, ADRs und Reviews. Er ist an diesen vier Punkten gescheitert:

**1. Nur existierende Abhängigkeiten.** Eine Spezifikation darf nur auf Dinge
zeigen, die im Repo vorhanden sind oder in derselben Lieferung entstehen.
`[cmd]` Der Altbestand referenziert `packages/scoring` in 10 Modulen und
`apps/app` in 14 Dateien — beides existiert nicht.

**2. Ist und Soll getrennt.** Bestandsbehauptungen gehören nach `docs/ssot/`
mit Herkunftsmarker. Hier steht ausschliesslich Soll. Sätze wie „bereits mit
Tests gebaut" haben hier nichts verloren.

**3. Abnahmekriterien statt Beschreibung.** Nicht „der Nutzer kann Favoriten
setzen", sondern: gegeben welcher Zustand, bei welcher Aktion, welches
beobachtbare Ergebnis. Das ist die Grenze zwischen Beschreibung und Auftrag.

**4. Verträge statt Prosa.** Anwendbares DB-Schema, API-Signaturen mit Typen,
Zustandsübergänge. Geprüft gegen die Realität — `[cmd]` Medical deklariert
10 Entities und definiert 8 Tabellen.

---

## Vorgehen

1. **Ebene 0 vollständig**, bevor ein Modul beginnt. Ohne Auth-Spezifikation
   ist kein Modul baubar; `Login` und `Settings` haben im Altbestand keinen
   Ordner.
2. **Ein Modul vollständig durchziehen**, bis es tatsächlich gebaut ist.
   Kandidat: Nutrition — Gate ist offen, Datenbank steht, Vergleichscode
   existiert.
3. **Erst danach die übrigen.** Ein Format, das nie ausgeführt wurde, ist
   ungeprüft. Neun Module in einem untauglichen Format sind neun Module,
   die neu geschrieben werden.
