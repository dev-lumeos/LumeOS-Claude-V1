---
status:     entwurf
version:    0.1
stand:      2026-08-02
ankerhash:  b0441a9
quellen:    Gespräch Tom 2026-08-02; docs/specs/WebPlatform/SPEC_10 (Altbestand)
abhaengig:  10-plattform/auth-sso, 10-plattform/datenzugriff
---

# Plattform: Berechtigungen und Modulaktivierung

**Grundsatz:** Jedes Modul ist unabhängig. Ob es für eine Identität in einer
App aktiv ist, wird zur Laufzeit aufgelöst — nicht im Code festverdrahtet.

## 1. Warum diese Schicht existiert

Die Aktivierung eines Moduls hängt an Umständen, die sich unterscheiden und
über die Zeit ändern:

- ein Abonnement oder eine Stufe (**noch nicht definiert**)
- eine Beziehung — HumanCoach wird aktiv, sobald ein Coach engagiert ist
- eine Buchung — AICoach in der App `buddy`
- eine Zugehörigkeit — Gym-Verwaltung nur für Angestellte des Gyms
- eine manuelle Freigabe — Betatest, Kulanz, Support
- die Entwicklungsphase — derzeit ist für Toms Nutzer alles aktiv

Diese Liste wird länger. Würde jede Bedingung im Anwendungscode geprüft,
entstünde die Logik an vielen Stellen unterschiedlich. Deshalb: **eine
Auflösung, viele Quellen.**

## 2. Die zentrale Frage

Jede Prüfung im System reduziert sich auf eine Frage:

> Ist Modul **M** für Identität **I** in App **A** zum Zeitpunkt **T** aktiv —
> und wenn nein, warum nicht?

Die Antwort ist nicht nur ja oder nein. Der **Grund** wird mitgeliefert, weil
die Oberfläche unterscheiden muss zwischen „gibt es nicht", „nicht gebucht",
„Coach fehlt" und „keine Berechtigung". Ein einzelnes Nein erzeugt Sackgassen.

## 3. Die Auflösung gehört in die Datenbank

Die Auflösung wird als SQL-Funktion umgesetzt, nicht im Anwendungscode.

**Begründung:** RLS-Policies müssen dieselbe Frage beantworten wie die
Navigation. Läge die Logik in der App, gäbe es zwei Umsetzungen derselben
Regel — und die Datenbank wäre die schwächere von beiden. Der Zugriff auf
Nutrition-Daten muss scheitern, wenn Nutrition nicht aktiv ist, unabhängig
davon, ob die Oberfläche den Menüpunkt anzeigt.

Die App liest dieselbe Funktion für die Navigation. Eine Quelle, zwei Nutzer.

## 4. Quellen

Jede Quelle liefert ein Urteil. Die Auflösung fasst sie zusammen.

| Quelle | Liefert | Status |
|---|---|---|
| Modulregister | existiert das Modul, in welchen Apps ist es zulässig | zu bauen |
| Entwicklungsmodus | schaltet alles frei | zu bauen, jetzt gebraucht |
| Manuelle Freigabe | je Identität und Modul, mit Ablaufdatum | zu bauen |
| Beziehung | HumanCoach bei bestehender Coach-Beziehung | offen |
| Zugehörigkeit | Organisationsrolle für gym, supplier, admin | offen |
| Abonnement | Stufe oder Paket | **noch nicht definiert** |

**Reihenfolge der Auswertung:** Ein ausdrückliches Verbot schlägt jede
Freigabe. Danach gilt: eine einzige positive Quelle genügt. Das hält den
Entwicklungsmodus einfach und macht Sperren durchsetzbar.

Neue Quellen kommen hinzu, ohne dass Module oder Apps geändert werden.

## 5. Zugehörigkeiten und Beziehungen

**Zugehörigkeit** verbindet eine Identität mit einer Organisation und trägt
eine Rolle innerhalb dieser Organisation. Organisationen sind Gyms, Supplier,
der Betreiber selbst (für `admin`) und künftige Typen wie Praxis oder
Versicherung.

Eine Identität kann mehreren Organisationen angehören, auch unterschiedlichen
Typs. Die Rolle gilt innerhalb der Organisation, nicht global — wer bei Gym A
verwaltet, verwaltet nicht Gym B.

**Beziehung** verbindet zwei Identitäten. Der Fall heute: Coach betreut
Klientin. Eine Beziehung trägt einen Zustand — angefragt, aktiv, beendet —
und ist die Grundlage für Datenzugriff über Identitätsgrenzen hinweg.

**Datenzugriff aus einer Beziehung ist nie automatisch.** Ein Coach sieht
Daten seiner Klientin nur, soweit sie zugestimmt hat, und die Zustimmung ist
je Modul erteilbar und widerrufbar. Sie gehört zur Beziehung, nicht zur Rolle.

## 6. Entwicklungsmodus

Solange keine Abonnements definiert sind, ist für Toms Identität jedes Modul
aktiv. Das ist eine **Quelle**, kein Sonderfall im Code — sie wird später
abgeschaltet, ohne dass etwas anderes sich ändert.

Zwei Anforderungen: der Modus ist an einer Stelle sichtbar, und er ist
umgebungsabhängig. In einer produktiven Umgebung darf er nicht greifen.

## 7. Was das für Module bedeutet

Eine Modulspezifikation beschreibt **nicht**, wer das Modul bekommt. Sie
beschreibt, was es tut, und benennt die Bedingung, unter der es fachlich
sinnvoll ist — etwa „setzt eine aktive Coach-Beziehung voraus". Ob diese
Bedingung erfüllt ist, beantwortet die Auflösung.

Damit bleiben Module unabhängig und die Tarifgestaltung frei.

## 8. Abnahmekriterien

- **AK-1:** Gegeben eine Identität ohne jede Freigabe, wenn die Auflösung für
  ein beliebiges Modul aufgerufen wird, dann lautet die Antwort „nicht aktiv"
  mit nachvollziehbarem Grund.
- **AK-2:** Gegeben eine Identität mit aktiver Coach-Beziehung, dann ist das
  Modul HumanCoach aktiv, ohne dass eine manuelle Freigabe nötig war.
- **AK-3:** Gegeben der Entwicklungsmodus ist an, dann sind für die betroffene
  Identität alle registrierten Module aktiv; ist er aus, ändert sich das
  Ergebnis ohne weitere Änderung.
- **AK-4:** Gegeben ein Modul ist für eine Identität nicht aktiv, wenn direkt
  auf Daten dieses Moduls zugegriffen wird, dann verweigert die Datenbank den
  Zugriff — unabhängig davon, was die Oberfläche anzeigt.
- **AK-5:** Gegeben ein ausdrückliches Verbot und gleichzeitig eine positive
  Quelle, dann ist das Modul nicht aktiv.
- **AK-6:** Gegeben eine Identität mit Zugehörigkeit zu Gym A, dann hat sie
  keinen Verwaltungszugriff auf Gym B.
- **AK-7:** Gegeben eine Klientin widerruft die Zustimmung für ein Modul,
  dann verliert der Coach den Zugriff auf dessen Daten, während die Beziehung
  bestehen bleibt.

## 9. Offene Fragen

1. **Abonnements** — Stufen, Umfang, Abrechnung. Blockiert nichts, solange
   der Entwicklungsmodus greift, aber jede Antwort hier ändert die Quellen.
2. **Organisationstypen** — Gym und Supplier sind gesetzt; Praxis und
   Versicherung genannt. Ein gemeinsames Modell oder je Typ eigene Tabellen?
3. **Zustimmung je Modul oder feiner** — genügt „Coach darf Nutrition sehen",
   oder braucht es Abstufungen bis auf Feldebene? Für Medical vermutlich ja.
4. **Onboarding** — der Altbestand lässt Nutzer Module auswählen. Passt das
   zum Modell, oder ist Auswahl nur eine Voreinstellung der Sichtbarkeit bei
   ohnehin aktiven Modulen?
5. **Modulregister** — als Tabelle in der Datenbank oder als Konfiguration im
   Repo? Tabelle erlaubt Änderung ohne Deployment, Konfiguration ist
   versioniert und überprüfbar.
