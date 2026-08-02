---
status:     entwurf
version:    0.1
stand:      2026-08-02
ankerhash:  8402980
quellen:    docs/ssot/ (Ist-Zustand); docs/specs/ (Altbestand); Gespräch Tom 2026-08-02
abhaengig:  10-plattform/auth-sso, berechtigungen, datenzugriff
---

# Plattform: Architektur

## 1. Zwei Achsen

**Apps** sind Auslieferungseinheiten mit eigener Domain und Zielgruppe.
**Module** sind Funktionsbereiche innerhalb einer App.

Ein Modul kann in mehreren Apps vorkommen, eine App bündelt mehrere Module.
Der Altbestand vermischt beides, woraus vier unversöhnte Modulzählungen
entstanden sind (10, 11, 7, 13).

### Apps

| App | Zielgruppe |
|---|---|
| `web` | Endnutzer; unangemeldet zusätzlich Landingpage |
| `buddy` | Endnutzer, AI-Companion |
| `coach` | Human Coaches |
| `marketplace` | Anbieter und Käufer |
| `admin` | Betrieb, intern |
| `gym` | Gym-Verwaltung |
| `supplier` | Supplier-Verwaltung |

Erweiterbar. Genannte Kandidaten: Arzt, Versicherung.

### Module

**Core:** Dashboard · Goals · Nutrition · Training · Recovery · Supplements ·
Medical · Settings · Login

**Addon:** HumanCoach · AICoach

„Core" heisst zum Kernprodukt gehörend, nicht immer aktiv. Jedes Modul ist
unabhängig; die Aktivierung löst `10-plattform/berechtigungen` auf.

## 2. Schichten

```
   Apps            web · buddy · coach · marketplace · admin · gym · supplier
     |
   Module          Core und Addon, je App eine Auswahl
     |
   Plattform       Identität · Berechtigungen · Datenzugriff · Design · Konventionen
     |
   Daten           Postgres, ein Schema je Fachbereich
```

**Abhängigkeit läuft nur nach unten.** Ein Modul kennt die Plattform, nicht
die App, in der es läuft. Eine App kennt ihre Module. Kein Modul kennt ein
anderes Modul direkt — Querbezüge laufen über die Plattform oder über
ausdrückliche Verträge.

## 3. Wo Fachlogik lebt

| Ort | Was dorthin gehört | Warum |
|---|---|---|
| Datenbank | Zugriffsregeln, Ableitungen aus Rohdaten, Aggregate | Muss auch dann gelten, wenn eine Anwendung sie umgeht |
| Anwendung | Darstellung, Abläufe, Eingabeprüfung | Ändert sich häufig, ist je App verschieden |

**Die Grenze verläuft an der Frage, ob eine Regel umgehbar sein darf.**
Wer Nutrition-Daten nicht sehen darf, muss sie auch bei direktem
Datenbankzugriff nicht sehen. Wie eine Trefferliste sortiert wird, ist dagegen
Darstellung.

`[cmd]` Beispiel aus dem Bestand: Die vier Tag-Regeln
(`PROT625 >= 20` und drei weitere) sind Ableitung und leben im Kettenschritt.
Sie erzeugen 9.265 Zeilen einmalig statt bei jeder Abfrage.

## 4. Die offene Grundsatzentscheidung: Servicelayer

Hier stehen zwei Architekturen nebeneinander, und nur eine kann gelten.

**Was der Altbestand vorsieht:** Je Modul ein eigener Hono-Service mit eigenem
Port — Nutrition 5100, Training 5200, Supplements 5300, Recovery 5400,
Buddy 5500, HumanCoach 5600, Marketplace 5700, Medical 5800, Goals 5900 —
jeweils mit JWT-Middleware. Die Apps sprechen mit den Services, die Services
mit der Datenbank.

**Was gebaut ist:** `[cmd]` `apps/web` spricht direkt mit der Datenbank.
`services/` enthält 18 Verzeichnisse, davon 17 leer; das einzige mit Code,
`nutrition-api` mit vier Dateien, wird von niemandem importiert.

**Was das unterscheidet:**

| | Direkt gegen die Datenbank | Über Services |
|---|---|---|
| Zugriffsschutz | RLS, in der Datenbank | Middleware, je Service |
| Aufwand je Modul | Schema und Policies | zusätzlich Service, Deployment, Verträge |
| Fachlogik | Datenbankfunktionen | frei wählbar |
| Betrieb | ein Dienst | neun Dienste |
| Fremdsysteme | umständlich | dafür gemacht |

**Empfehlung:** Direkter Zugriff als Regel, Services als begründete Ausnahme.

Der Grund ist nicht Bequemlichkeit, sondern Konsistenz. RLS gilt immer —
für die Web-App, für Buddy, für einen künftigen Client, für ein Skript.
Eine Middleware gilt nur für den, der durch sie hindurchgeht. Bei sieben Apps
auf denselben Daten ist eine Regel an einer Stelle mehr wert als neun
Regelwerke.

Services entstehen dort, wo etwas nicht in die Datenbank gehört: lange
Verarbeitungen, Fremdsystem-Anbindung (Wearables, Zahlungen), Modellaufrufe
für Buddy, Importe.

**Diese Entscheidung ist noch nicht getroffen.** Sie gehört als ADR nach
`90-entscheidungen/`, bevor ein zweites Modul gebaut wird. Solange sie offen
ist, bleiben die 17 leeren Service-Verzeichnisse stehen — sie kosten nichts
und halten die Option offen.

## 5. Datenhaltung

Ein Postgres-Schema je Fachbereich. Ein Modul besitzt seine Tabellen und
gibt sie nicht direkt an andere Module weiter — Querbezüge laufen über
ausdrückliche Verträge, nicht über Fremdschlüssel quer durch Schemas.

`[cmd]` Der Bestand hält sich daran: `nutrition` mit 11 Tabellen.
`public` enthält nur noch Altlast und wird frei.

**Rohdaten und Ableitungen sind getrennt.** Der BLS-Bestand ist unveränderlich;
was daraus berechnet wird — Tags, Aliase, Kategoriezuweisungen — entsteht in
einem eigenen Kettenschritt und ist jederzeit neu erzeugbar.

## 6. Mediendateien

Grosse Dateien gehören in den Objektspeicher, nicht in die Datenbank.
Die Datenbank hält Bucket und relativen Pfad, nie eine vollständige URL —
sonst steckt die Adresse einer bestimmten Instanz in jeder Zeile.

`[read]` Die Training-Spec nennt Cloudflare R2 als Medienort, der Bestand
liegt in Supabase Storage. Auch das ist eine offene Entscheidung.

## 7. Umgebungen

| Umgebung | Zweck | Stand |
|---|---|---|
| lokal | Entwicklung, Docker | `[cmd]` läuft, aus der Kette reproduzierbar |
| Wegwerf | jeder Test gegen die Datenbank | Verfahren etabliert |
| Cloud | Produktion | vorhanden als `LumeOS-V2`, ungenutzt |

**Regel:** Nie gegen eine laufende Datenbank testen. Die Kette erzeugt in
Sekunden eine frische — `[cmd]` zehn Sekunden für 727.000 Zeilen.

## 8. Gemeinsamer Code

| Paket | Inhalt | Stand |
|---|---|---|
| `packages/shared` | Supabase-Clients | `[cmd]` gebaut, unverdrahtet |
| `packages/types` | Domänentypen | `[cmd]` gebaut, unverdrahtet |
| `packages/ui` | Design-System | Gerüst |
| `packages/contracts` | Verträge zwischen Modulen | Gerüst |

**Regel:** Was zwei Apps brauchen, gehört in ein Paket. Was eine App braucht,
bleibt in der App. Kopieren ist keine Option — die zweite Kopie läuft weg.

`[cmd]` Der Altbestand referenziert `packages/scoring` aus zehn Modulen;
ein solches Paket existiert nicht. Solche Referenzen sind in der neuen
Spezifikation unzulässig.

## 9. Abnahmekriterien

- **AK-1:** Gegeben ein Modul, dann lässt sich benennen, zu welchen Apps es
  gehört, welche Schemas es besitzt und von welchen Plattformbausteinen es
  abhängt.
- **AK-2:** Gegeben zwei Module, dann greift keines direkt auf Tabellen des
  anderen zu.
- **AK-3:** Gegeben eine Regel, die nicht umgehbar sein darf, dann ist sie in
  der Datenbank umgesetzt und nicht nur in der Anwendung.
- **AK-4:** Gegeben eine neue App, dann erfordert ihre Aufnahme keine Änderung
  an bestehenden Modulen.
- **AK-5:** Gegeben eine Mediendatei, dann speichert die Datenbank Bucket und
  relativen Pfad, nie eine vollständige URL.
- **AK-6:** Gegeben eine Spezifikation, dann referenziert sie kein Paket und
  keine App, die weder existiert noch in derselben Lieferung entsteht.

## 10. Offene Fragen

1. **Servicelayer** — direkter Datenbankzugriff oder Services je Modul?
   Blockiert ab dem zweiten Modul. Gehört als ADR nach `90-entscheidungen/`.
2. **Medienort** — Supabase Storage oder Cloudflare R2. Kostenfolge, und die
   15 GB liegen bereits in Supabase.
3. **Cloud-Instanz** — `LumeOS-V2` als Produktion übernehmen oder neu
   aufsetzen. Siehe `docs/todo/TODO.md`, Sektion E.
4. **`apps/mobile` und `apps/staff`** — beide als Gerüst vorhanden, in Toms
   App-Liste nicht enthalten. Ist `staff` das heutige `gym`? Wird `mobile`
   eine eigene App oder eine PWA von `web`?
5. **Übersetzungen** — Sprachspalten skalieren nicht über drei Sprachen
   hinaus. Ab wann eine eigene Übersetzungstabelle?
