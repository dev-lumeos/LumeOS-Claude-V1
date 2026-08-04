---
status:     teilweise angenommen
stand:      2026-08-03
ankerhash:  8cdb3ac
betrifft:   10-plattform/architektur, alle Module
---

# ADR-0001: Datenzugriff der Apps — direkt oder über Services

## Kontext

Zwei Architekturen lagen nebeneinander.

`[read]` Der Altbestand sieht je Modul einen eigenen Hono-Service mit festem
Port und JWT-Middleware vor: Nutrition 5100, Training 5200, Supplements 5300,
Recovery 5400, Buddy 5500, HumanCoach 5600, Marketplace 5700, Medical 5800,
Goals 5900. Die Apps sprechen mit den Services, die Services mit der Datenbank.

`[cmd]` Gebaut ist der direkte Weg: `apps/web` liest seit dem 2026-08-02 über
supabase-js und PostgREST, abgesichert durch Rechte und Zeilenschutz in der
Datenbank. `services/` enthielt 18 Verzeichnisse, davon 17 leer; das einzige
mit Code, `nutrition-api` mit vier Dateien, wurde von niemandem importiert.

Die Frage wurde dringend, weil ab dem zweiten Modul jede Umstellung teurer wird.

## Optionen

**A — Direkter Zugriff aus den Apps**
Apps sprechen über PostgREST mit der Datenbank. Zugriffsschutz durch Rechte
und Zeilenschutz.
*Dafür:* Eine Regel gilt für jeden Zugriffsweg — für `web`, für `buddy`, für
ein Skript, für einen künftigen Client. Ein Dienst im Betrieb. Je Modul nur
Schema und Policies.
*Dagegen:* Fachlogik, die nicht in die Datenbank gehört, braucht Umwege.
Modulgrenzen sind weniger sichtbar.

**B — Ein Service je Modul**
Jedes Modul bringt einen eigenen Dienst mit.
*Dafür:* Modul läuft unabhängig, ist ersetzbar und als Einheit aktivierbar.
Klare Grenze. Fremdsysteme lassen sich sauber anbinden.
*Dagegen:* Neun Dienste im Betrieb. Zugriffsschutz je Dienst statt an einer
Stelle — eine Middleware gilt nur für den, der durch sie hindurchgeht.

## Entscheidung

Gewählt: **A für jetzt, B als Zielbild.** Von: Tom. Am: 2026-08-03.

Apps lesen vorerst direkt. Module bekommen später eigene APIs — dann, wenn
das jeweilige Modul steht, nicht vorher.

**Der Governance-Cluster wurde am selben Tag archiviert** (Commit 59cb41e),
`services/nutrition-api` bleibt als einziger Dienst bestehen.

## Begründung

Toms Grund für B ist **Modulunabhängigkeit**: ersetzbar, aktivierbar,
eigenständig lauffähig. Das ist eine Produktanforderung, keine technische
Vorliebe, und sie wiegt schwerer als der Betriebsaufwand.

Der Grund für A im Übergang ist Tempo: Nutrition ist das einzige teilgebaute
Modul, der direkte Weg funktioniert und ist verifiziert. Einen Dienst zu
bauen, bevor das Modul steht, hiesse eine Grenze zu ziehen, deren Verlauf
noch niemand kennt.

**Beides schliesst sich nicht aus.** Zeilenschutz in der Datenbank und ein
Dienst je Modul können gleichzeitig gelten: das eine regelt, wer was sehen
darf, das andere, wo die Modulgrenze verläuft. Ein Dienst mit
`service_role`-Rechten hebt den Zeilenschutz allerdings auf — deshalb muss
beim Bau des ersten Dienstes entschieden werden, mit welcher Identität er
arbeitet.

## Folgen

- Neue Module beginnen ohne eigenen Dienst. Schema, Policies, Lesefunktionen.
- Was nicht in die Datenbank gehört — Wearables, Zahlungen, Modellaufrufe für
  Buddy, lange Importe — begründet einen Dienst, auch heute schon.
- Der Zuschnitt der Dienste wird je Modul entschieden, nicht vorab für neun.
- `services/nutrition-api` ist damit kein Vorbild, sondern ein unverdrahteter
  Vorgriff. Sein Verbleib ist offen.

## Was diese Entscheidung umstossen würde

- Ein Modul braucht Fachlogik, die sich weder in der Datenbank noch in der App
  sinnvoll unterbringen lässt.
- Ein Fremdsystem verlangt eine dauerhafte serverseitige Anbindung.
- Die Modulaktivierung lässt sich mit reinem Datenbankzugriff nicht
  durchsetzen.
- Der Zeilenschutz erweist sich unter Last als zu teuer.

## Offen

Die vollständige Fassung von B — Zuschnitt, Verträge zwischen Modulen,
Aktivierung eines Moduls als Einheit, Identität der Dienste gegenüber der
Datenbank — ist **noch nicht besprochen**. Tom hat dafür eine eigene Sitzung
vorgesehen. Bis dahin bleibt diese Entscheidung teilweise angenommen.
