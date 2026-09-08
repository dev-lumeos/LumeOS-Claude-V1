# Daten und Schema

Belege zu den Regeln in `CLAUDE.md`. **Wer eine Regel anwendet,
liest hier den Grund** ? die Regel allein sagt nicht, warum sie
entstanden ist.

## `.limit()` hebt den PostgREST-Deckel nicht auf

`[cmd]` **G-249, 2026-08-28:** eine Sparkline zeigte 8 Punkte statt
90, kerzengerade. **Ursache: PostgREST deckelt serverseitig bei 1.000
Zeilen; `.limit(20000)` aendert daran nichts.** Bei 12.420
angefragten Zeilen kamen die ersten acht Tage fuer alle 138
Naehrstoffe.

`[read]` **Kein Fehler, keine Warnung — nur weniger Zeilen.**
**Behoben durch seitenweises Laden.**

`[read]` **Und der Kommentar an der Stelle zitierte bereits G-64,
waehrend der Code in dieselbe Falle lief.** **Eine Warnung im
Kommentar ist kein Waechter.**

## In `backup/` loescht niemand ausser Tom

**Tom, 2026-09-02:** *,,alles was aelter ist wird in einen /temp
ordner gelegt den ich entsorge. ich traue niemandem mehr von euch
betreffs loeschbefehlen."*

`[read]` **Kein Agent, kein Orchestrator.** **Was seine Frist
ueberschreitet, wird nach `backup/_temp/` verschoben.**

`[read]` **Ein Verschieben ist umkehrbar, ein Loeschen nicht** —
**und das Manifest haelt fest, was wohin ging** (C-216).

### Zwei Ordner sind Quellen, keine Sicherungen

`[cmd]` **Sechs Kettenschritte und `apps/web/.../evidenz/registry.ts`
lesen aus `backup/kimi-research/` und `backup/legacy-v2/`.**

`[read]` **Ein Raeumplan haette sie mitgenommen** — **der naechste
Kettenlauf waere gescheitert.**

`[cmd]` **`backup/quellen-NICHT-RAEUMEN.md` fuehrt die sieben
Fundstellen.**

### Und der Waechter erinnert

`[cmd]` **`tools/backup-wachstum.mjs` laeuft im Gate** — **er meldet
bei ueber 2,5 GiB oder sieben Tagen ohne Inventur.**

`[cmd]` **Am 02.09.: 5,97 auf 2,31 GiB** — **56 von 57
Vollsicherungen, von denen nie eine zurueckgespielt wurde.**

`[read]` **A-39 gilt weiter: nicht raeumen, solange Agenten
laufen.**

## Sprachen: Datenbank oder i18n, nicht zur Wahl

**Tom, 2026-09-08:** *,,ist es eine datenbankabfrage? dann in der db
loesen. ist es eine bezeichnung oder sonst was das im code als
variable steht, dann i18n."*

`[cmd]` **`00-konventionen.md`, Abschnitt 1:** *,,Das Datenmodell
fuehrt Sprachvarianten als Spalten (`name_de`, `name_en`,
`name_th`)."*

`[read]` **Die Regel ist entschieden** — **wer sie zur Wahl stellt,
hat die Konvention nicht gelesen.**

## Anbinden heisst mit Daten

**Tom, 2026-09-07:** *,,wenn wir was anbinden sollen auch daten
dafuer da sein um es anzuzeigen und nicht einfach verschwinden und
jeder vergisst es."*

`[cmd]` **Beispiel: Supplements-Heute zeigt `TODAY'S ADHERENCE
0 / 9`** — **die Anbindung steht, der Bestand fehlt.**

`[read]` **Eine Attrappe sagt *,,noch nicht angebunden"*.** **Eine
leere Kachel sagt nichts** — **sie sieht aus wie ein Ergebnis.**

    angebunden mit Daten     zeigt Werte
    angebunden ohne Daten    zeigt einen Leerhinweis, benannt
    Attrappe                 zeigt Entwurfswerte, gekennzeichnet

`[read]` **Zu jedem Anbindeauftrag gehoert die Frage: liegen Daten
vor?** `[read]` **Wenn nein, ist der Seed Teil des Auftrags** —
**oder die Kachel bleibt Attrappe** (E-72).

## Die Kette gewinnt gegen die Live-Aenderung

**C-410, gemessen 2026-09-07.**

`[cmd]` **C-366 stellte drei Lesefunktionen live auf
`food_tags_effective` um.** `[cmd]` **C-405 liess die Kette neu
laufen** — **und `075_preference_search_application.sql` erzeugte
zwei davon aus dem alten Quelltext neu.**

`[read]` **Kein Mensch hat etwas zurueckgenommen.** **Ein
Kettenschritt hat eine spaetere Aenderung ueberschrieben.**

`[read]` **Wer eine Funktion aendert, aendert sie an der Quelle** —
**`supabase/_pipeline/`, nicht nur live.**

`[cmd]` **Und der Test, der es haette melden koennen, war rot und
nicht im Gate** — **ein Test, der niemanden erreicht, ist eine
Notiz.**

## Seeds gehoeren auf `dev@lumeos.app`

**Tom, 2026-08-18:** *,Wegwerf-DB ist mir scheissegal, wie und wo er
anlegt. Danach muessen Seeds in meinen Dev-Account, sonst sehe ich
nichts."*

`[cmd]` **Der Zustand, der dazu fuehrte:** Saemtliche Testdaten hingen
an `tom.seed@example.com` — 43 Koerpermessungen, 7 Umfaenge, 2
Laborbefunde, 6 Messwerte. **Toms Konto hatte davon nichts**, und
`tom.seed` hat kein Passwort (`encrypted_password IS NULL`), ist also
nicht anmeldbar.

**Damit war nichts im Browser sichtbar** — weder fuer Tom noch fuer
einen Agenten, der einen Nachweis fuehren sollte.

**Die Regel, in jedem Datenauftrag:**

> Testdaten laufen in der Wegwerf-Datenbank, wie und wo ist gleich.
> **Was danach live eingespielt wird, gehoert auf `dev@lumeos.app`.**

`[read]` Muster: `eigenes-konto-fuellen.sql` tut das fuer Nutrition
bereits. **Was fuer Mahlzeiten gilt, gilt fuer Messungen, Befunde,
Sitzungen und Check-ins genauso.**

`[cmd]` **Und der Zeilenschutz-Nachweis braucht zwei anmeldbare
Konten** — einen, der die Daten sieht, und einen, der sie nicht sieht.
Ein Konto ohne Passwort taugt fuer keines von beidem.
