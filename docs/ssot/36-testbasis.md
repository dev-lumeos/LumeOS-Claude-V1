# Testbasis: was womit geprüft wird

**Stand:** 2026-08-06 (erste Fassung, aus D-04)
**Rang:** Ist-Zustand, `[cmd]`-belegt. Rangfolge gilt: Code > ssot > Rest.

---

## Die drei Ebenen

| Ebene | Womit | Was sie prüft | Braucht Datenbank? | Im `pnpm gate`? |
|---|---|---|---|---|
| Reine Funktionen | `node:test` + `node:assert/strict` | Rechenregeln, Validierung, Payloadaufbau, Fehlerzuordnung | nein | **ja** |
| Datenbankrechte | `_validierung/zugriffsrechte-pruefen.mjs` (B-22) | Kommt `authenticated` an jedes Objekt, das es erreichen muss — und an fremde Daten nicht? | **ja** | nein |
| Weg durch Next.js | *bewusst offen*, siehe unten | Middleware, Cookies, Server Components, Anmeldefluss | ja + Server | nein |

`[cmd]` Stand 2026-08-06: **97 Tests / 13 Suites / 0 Fehlschläge**;
B-22 gegen live **18 grün / 3 begründet übersprungen / 0 rot**, Exit 0.

---

## Warum das Gate die Datenbank nicht berührt

`pnpm gate` = `turbo run typecheck test build`. Keiner der drei Schritte
spricht mit einer Datenbank, und das ist Absicht: das Gate muss nach einem
frischen Klon laufen, ohne Docker, ohne laufende Instanz.

**Der Preis dafür ist benannt:** Der Curation-Bug
(`permission denied for table food_curation_candidates`) war für das Gate
unsichtbar und fiel erst im Browser auf. Genau diese Lücke schliesst B-22 —
nicht durch Erweiterung des Gates, sondern als eigener Lauf.

---

## D-04: Entscheidung zu End-to-End-Tests

`[cmd]` Ausgangslage 2026-08-06: `@playwright/test@1.41.2` steht in den
Root-devDependencies, Browser sind installiert
(`ms-playwright/chromium-1208` u. a.), **`apps/web/e2e/` existiert nicht**
(nicht nur leer — der Ordner ist weg), keine Konfiguration. Die einzigen
Playwright-Verweise im Repo liegen in `_archive/governance/` und in
Skill-Dokumentation, also in totem Bestand.

### Was E2E leisten würde, das die anderen Ebenen nicht leisten

Der Weg **durch Next.js selbst**. B-22 spricht direkt mit PostgREST und
überspringt damit alles, was dazwischen liegt:

- die Middleware (`apps/web/src/middleware.ts`) samt Umleitung
  Unangemeldeter und dem `?redirect=`-Parameter
- die Cookie-Handhabung von `@supabase/ssr` (Setzen, Erneuern, Lesen in
  Server Components gegen Route Handler)
- die Admin-Prüfung in `/nutrition/curation` (C.3)
- das Anmeldeformular und den Austausch Code gegen Session

**Ein kaputter Redirect nach dem Anmelden wäre kein Rechteproblem und
bliebe von B-22 unentdeckt.** Die Antwort auf „was leistet E2E zusätzlich"
ist also nicht dünn — sie ist konkret.

### Trotzdem: kein Playwright-Gerüst, sondern ein Fund und ein Vermerk

Die Prüfung dieser Frage hat **sofort einen echten Fehler gefunden** —
ohne dass ein einziger E2E-Test geschrieben wurde:

`[cmd]` 2026-08-06 gegen den laufenden Dev-Server:
```
GET /auth/callback?redirect=%2F%2Fevil.com
-> Location: http://evil.com/
```

Die Prüfung war an zwei Stellen inline `raw.startsWith('/')`
(`login/page.tsx:15`, `auth/callback/route.ts:12`), beide mit dem
Kommentar „Nur interne Ziele — sonst wäre `?redirect=` ein offener
Redirect". `//evil.com` beginnt mit `/`, ist aber protokollrelativ: der
Browser liest es als fremden Host. Der Kommentar behauptete, was der Code
nicht tat.

**Behoben als reine Funktion mit Tests**, nicht als E2E-Fall:
`apps/web/src/lib/auth/safe-redirect.ts` (eine Stelle statt zwei),
6 Tests in `__tests__/safe-redirect.test.ts`.
`[cmd]` Gegenprobe am laufenden Server nach der Korrektur:
`//evil.com` → `/dashboard`, `/nutrition/foods` → `/nutrition/foods`.

**Daraus die Entscheidung:** Der wertvollste Teil dieser Fehlerklasse ist
als reine Funktion billiger, schneller und im Gate prüfbar. Ein
Playwright-Gerüst hätte denselben Fehler gefunden — aber erst nach Aufbau
von Konfiguration, Testnutzerverwaltung, Serverstart und CI-Anbindung, und
es hätte danach dauerhaft gepflegt werden müssen.

### Was das NICHT heisst

Es heisst nicht „E2E ist unnötig". Es heisst: **jetzt** ist der Nutzen
kleiner als der Aufwand, weil

- `[cmd]` 23 Seiten/Routen existieren, davon die Mehrzahl Attrappen
  (`docs/spezifikation/20-apps/web/00-app-web.md`),
- der einzige vollständige Nutzerweg (Anmelden → Lebensmittelsuche →
  Präferenz setzen) bereits mehrfach von Hand mit echten Sessions belegt
  wurde (C-02, C-11, C-03, C-04),
- und die Oberfläche mit A-06 und C-14 noch bewegt wird. E2E-Tests gegen
  eine Oberfläche, die umzieht, sind Wegwerfarbeit.

**Der Wiedervorlagepunkt ist benannt, nicht offengelassen:** sobald der
erste Modul-Schreibpfad eine Oberfläche bekommt, die bleiben soll (C-04-UI
oder C-06), lohnt der Aufbau. Dann ist auch klar, welcher Weg der
wichtigste ist.

### Was mit Playwright geschieht

`@playwright/test` bleibt in den Root-devDependencies. Begründung: es ist
`[cmd]` installiert, kostet nichts im Betrieb, und der Wiedervorlagepunkt
ist absehbar. Ein Rückbau und späterer Wiederaufbau wäre Arbeit ohne
Gewinn.

**Aber:** Es steht hier, damit niemand aus der blossen Anwesenheit von
Playwright schliesst, es gäbe E2E-Abdeckung. `[cmd]` Es gibt keine —
0 Spec-Dateien, keine Konfiguration. Genau diese falsche Sicherheit ist
der Grund, warum dieser Abschnitt existiert.

---

## Was die drei Ebenen zusammen NICHT abdecken

Ehrlich benannt, damit niemand mehr hineinliest, als geprüft ist:

- **Kein Browser läuft.** Rendering, Hydration, Client-Zustand,
  Tastaturbedienung, Barrierefreiheit: ungeprüft.
- **Der Anmeldefluss ist nicht automatisiert geprüft.** Er wurde mehrfach
  von Hand mit echten Sessions belegt, aber keine Prüfung fängt eine
  Regression darin auf.
- **Die Middleware ist nicht automatisiert geprüft.** `[cmd]` Ihre
  Umleitung wurde am 2026-08-06 von Hand belegt
  (`/nutrition/foods?q=test` → `/login?redirect=%2Fnutrition%2Ffoods%3Fq%3Dtest`),
  aber nichts hält das fest.
- **Kein Lasttest, keine Messung.** Aussagen über Laufzeit der
  Tagessummen-Sicht sind `[annahme]`, nicht gemessen.
