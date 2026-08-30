# G-163 — Rueckfallfassungen entfernt (recovery + coach) — Fable, 2026-08-23

Auftrag: `docs/auftraege/g-163-fable.md`. Tom, 2026-08-23: „sie fliegen."

## Was entfernt ist — und was an die Stelle trat

Unterscheidung wie beauftragt: entfernt wurde NUR, was im `else` eines
Ausdrucks stand, dessen `then` echte Daten liest. An jeder Stelle steht
jetzt eine Hinweis-Flaeche (`Empty`: „Nicht geladen" + Grund, inklusive
durchgereichter Fehlermeldung des Lesepfads) — **kein Strich, keine
Null** (G-161: ein Strich hiesse „leer" statt „nicht gelesen").

| Datei | Entfernt | Zeilen |
|---|---|---|
| recovery/ansicht.tsx | Score-Entwurfskachel (samt Readiness-Urteil „Good" und der Kopf-Entwurfspille), Modalitaeten-Entwurf (`TODAY_MODALITIES`), Check-in-Zeit-Rueckfall auf `CHECKIN.logged_at`, Modalities-Tab-Zaehler aus der Entwurfsliste (jetzt `modalitaeten.gesamt`) | 118 |
| recovery/tab-messwerte.tsx | `HrvEntwurf` (HRV score, Measurement log, 30-day trend) und `SleepEntwurf` (Last night, 14 nights, Sleep hygiene) samt `HRV_BASELINE`/`HRV_LOG`/`calcHRVScore` | 206 |
| coach/tab-rechte.tsx | `PermissionsEntwurf`, `ProposalsEntwurf` und die dadurch toten `ProposalCard`/`ProposalModal` samt Entwurfsdaten-Importen | 384 |
| coach/tab-autonomie.tsx | `AutonomyEntwurf` (Leiter, History, Assessment scores) | 202 |
| coach/ansicht.tsx | Your-coaches-Entwurfskarte (+ tote `CoachCardMini`), Threads-Entwurfsliste | 86 |

**Ueber die Messliste des Auftrags hinaus** (sie nannte 4 Dateien) sind
coach/ansicht.tsx und coach/tab-autonomie.tsx mitgenommen — dieselbe
Klasse (else-Zweig neben echtem Lesepfad, G-158), derselbe Beschluss.

## Was BLEIBT — echte Attrappen ohne echten Zweig daneben

recovery: Muscle map (2 Marken, Muscle readiness auf Today, Pending
actions, Overtraining watch, „Phone camera HRV" (Geraetefunktion fehlt
ganz), „Score paths" (braucht sleep_data, C-219), tab-checkin 3,
**tab-protokolle komplett** — dort gibt es keinen einzigen echten
Zweig, also nichts zu entfernen (gemeldet: die 19 des Auftrags sind
Wortvorkommen, `attrappe={ATTRAPPE}`-Stellen sind 17 nach Testmuster).
coach: tab-onboarding (6), AthleteCheckins, Coaches-Tab, Notes,
Invites, Balance, Trust circle, Activity — und der Kopf („4 active ·
1 unread" aus COACHES, seit G-158 gemeldet).

## Nachweis — Erwartung vor dem Lauf, dann gemessen

**Code-Marken je Datei (erwartet → gemessen):** ansicht 5→**3** ✓,
tab-messwerte 10→**4** ✓, tab-rechte 5→**0** ✓, tab-autonomie
11→**3** ✓, coach/ansicht 11→**9** ✓, tab-protokolle unveraendert.

**Gerendert** (schuss, angemeldet als `test-user@lumeos.local` — dank
C-236 laedt dort jeder echte Pfad; je inkl. der Buddy-Kontextkachel):

| Tab | vorher | nachher |
|---|---|---|
| recovery today | 5 | **4** (der Modalitaeten-Rueckfall — test-user hat keine modality_log-Zeilen — zeigt jetzt den Hinweis statt der erfundenen Tagesliste) |
| recovery hrv / sleep | 2 / 2 | 2 / 2 (echt + je eine bleibende echte Attrappe) |
| coach permissions | 0 | 1 (nur Buddy-Kontext; Modulinhalt komplett echt mit Leerzustaenden) |
| coach autonomy | 1 | 1 |

Bilder: `backup/g163-vorher-*.png`, `backup/g163-nachher-*.png`.

**Gegenprobe** (`backup/g163-gegenprobe-sleep.png`): Sleep-Lesepfad
temporaer gekappt (`stand={undefined}`) — die Seite zeigt „Nicht
geladen · recovery.checkins kam fuer dieses Konto leer zurueck", NICHT
die alten erfundenen Zahlen. Zurueckgebaut.

**Negativprobe** (gleiches Bild): eine Rueckfall-Karte absichtlich
wieder eingebaut — die gerenderte Markenzaehlung steigt (Marke
sichtbar), und ZWEI Waechter werden rot (G-160-Weiche,
Recovery-Markenzaehler). Zurueckgebaut, 520/520 gruen.

**Waechter dauerhaft:** neuer Test „G-163: die Rueckfallfassungen
bleiben geloescht" (Code-Formen, Kommentare duerfen die Namen
historisch nennen — dieselbe Praezisierung wie beim C-181-Waechter)
plus Hinweis-Pflicht („Nicht geladen" muss existieren). Die
Zaehl-Erwartungen in v2-attrappen.test.ts sind auf die neuen Zahlen
gesenkt; der Karten==Marken-Test gilt nur noch fuer tab-onboarding.

## Meldungen

1. `test-user`-Anmeldung fuer schuss brauchte erneut den
   Passwort-Hash-Kopierschritt (gesichert → gesetzt → zurueckgesetzt →
   Sicherung geloescht, je 1 Zeile). Dauerloesung waere ein bekanntes
   test-user-Passwort fuer `LUMEOS_WORT`.
2. Nebenbefund am Bild: test-user zeigt jetzt echten Score 65.7 aus
   recovery.scores und „30 Tage erfasst" — die C-236-Daten tragen.
3. Nutrition/supplements wie verlangt nicht angefasst; die dortigen
   Rueckfaelle (tab-prefs, tab-planner, supplements RUECKFALL-Marken)
   laufen beim anderen Agenten.
