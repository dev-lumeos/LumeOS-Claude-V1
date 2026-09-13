# Uebergabe 2026-09-08

**Der Tag in einem Satz:** das Coach-Portal wurde von einer
Kartenliste zu einer Kopie des Mockups, und die Datenbank bekam
die Grundlagen, auf die drei Module gewartet haben.

`[cmd]` **94 Commits, ungepusht.**

---

## Entscheidungen

    E-77  tote Migrationen nach backup/
    E-78  Coach-Rolle vorerst von Hand
    E-79  die Muskelkarte ist die Auswahl,
          die 16 Orte sind Fachwissen
    E-80  vier Erfahrungsstufen, vier Faktoren
          beginner 0.75 / advanced 0.90
          pro 1.00 / elite 1.10

---

## Was live ging

### Supplements

`[cmd]` **C-453:** **93 Peptide auf `injection_subq`, CHECK
validiert.** `[read]` **Und acht Kommasequenzen gemessen ? BPC-157
`SubQ/Oral`, Selank `Nasal/SubQ` ? ohne eine zweite Spalte zu
bauen.**

`[cmd]` **C-456:** **Zyklen und Protokolle.** `weeks_start` **und**
`weeks_end` **ergaenzt, drei PCT-Vorlagen aus dem Altrepo, eine
Tagesliste aus Stack UND Protokoll.**

`[cmd]` **C-455:** **der Injektionsplaner ? zehn Spalten an
`injection_sites`, sieben an `injection_logs`,
`injection_site_overrides`.**

`[cmd]` **C-454:** **`user_injection_site_selections` mit
`body_area_code`** ? **E-79 in der Datenbank: die Flaeche ist die
Auswahl, nicht der Katalogort.**

### Training

`[cmd]` **C-461:** **sieben Tabellen** ? `programs`,
`program_blocks`, `program_days`, `program_assignments`,
`routines`, `routine_exercises`, `routine_schedule_days`.

`[read]` **Drei Module hatten darauf gewartet.**

### Marketplace

`[cmd]` **C-465:** **Kauf, Auslieferung, Widerruf ? drei getrennte
Funktionen.**

`[cmd]` **`delivery_results` ist jetzt eine TABELLE mit
Fremdschluesseln** ? **die Antwort auf C-452.**

### Medical, Goals, Coach

`[cmd]` **C-457:** **fuenf OCR-Felder in `lab_reports`,
`review_required`** ? **OCR schlaegt vor, ein Mensch bestaetigt
(E-74).**

`[cmd]` **C-463:** **`progress_photos` mit privatem Bucket.**
`[read]` **Und ZWEI Tabellen NICHT gebaut, beide zu Recht.**

`[cmd]` **C-459:** **`raise_alert` mit 24-h-Sperre,
`alert_settings`, fuenf Schweregrade.** `[read]` **Ohne die drei
Pruefungen, deren Eingaenge fehlen.**

`[cmd]` **C-464:** **`fiber_g` mit 30 g, fuenf Nutzer.**

---

## Die Oberflaeche

### Das Coach-Portal

`[cmd]` **G-405 bis G-410:** **aus 44 Karten wurde eine Kopie des
Mockups ? 11 Bereiche, 35 Unterpunkte, 164 Klickziele, dreizehn
Modale, der Kalender als Monatsraster.**

`[read]` **Drei Anlaeufe, bis es eine Kopie war und keine
Neuentwicklung.**

Tom: *,,es gibt eine vorlage und man erfindet irgendeinen scheiss
selber."*

`[cmd]` **Der ganze Draft liegt jetzt im Repo:**
`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`

### Nutrition

`[cmd]` **G-412, G-416, G-417, G-419:** **der Score rechnet 86,
E-80 liegt in `packages/scoring`, zwei unabhaengige Spalten, die
Heatmaps mit Zellhoehe 16 und wertabhaengiger Deckkraft.**

`[cmd]` **Diary und Insights sind ABGENOMMEN** ? **die
Referenzbloecke entfernt, sechs bleiben.**

### Quer

`[cmd]` **G-411:** **LumeOS hatte keinen Abmeldeknopf.**
`[read]` **Und dabei gefunden: `apps/admin` konnte sich seit F-07
gar nicht anmelden.**

`[cmd]` **`apps/coach/.env.local` mit
`NEXT_PUBLIC_AUTH_COOKIE_SCOPE=coach`** ? **beide Anwendungen
teilten sich einen Cookie.**

---

## Was ich heute falsch gemacht habe

**1** ? **Vier Tabellen als *,,fehlend"* gemeldet, die unter
anderem Namen da waren.**

    recovery_scores    -> scores
    lab_values         -> lab_result_values
    modality_logs      -> modality_log
    content            -> body

`[read]` **Codex hat es zweimal aufgefangen** ? **C-462 als
ueberholt geschlossen, ohne eine Zeile zu bauen.**

**2** ? **G-391 an die falsche Anwendung gerichtet.**

`[read]` **`/v2/coach/human` ist die Klientensicht, `apps/coach`
der Arbeitsplatz.** `[cmd]` **Der Commit wurde zurueckgebaut.**

**3** ? **Karten gezaehlt statt Faehigkeiten gemessen.**

`[cmd]` **G-391: *,,62 Karten, 23 haben ein Gegenstueck"*** ?
**eine Karte namens *Rules* neben einem 30-KB-Regelbauer.**

`[cmd]` **Die Lehre steht in `docs/lehren/messen.md`.**

**4** ? **Die Flaeche unter der Kurve als *,,fehlt ganz"*
gemeldet.**

`[cmd]` **Sie war da ? 26 RGB-Stufen ueber dem Grund.**

---

## Neue Lehren

    docs/lehren/coach-plattform-altrepo.md
      277 Dateien, 2,8 MB ? Faktor 37 gegen heute

    docs/lehren/coach-spec-gegen-live.md
      alle zwoelf HumanCoach-Specs, Feld fuer Feld

    docs/lehren/coach-portal-draft.md
      sechzehn Coach-Dateien, nicht acht

    docs/lehren/coach-letzter-stand.md
      worktrees/ sind API-Extraktionen, keine Vorlage

    docs/lehren/werkzeuge.md
      ein Auftrag, ein Bericht ? keine Ketten
      nichts laeuft losgeloest

---

## Der Stand

    181 Tabellen, 2.528 Spalten
    188 Funktionen, 438 Policies, 652 CHECKs
    622 Punkte, 25 Befunde (Sollstand)
    apps/web 1570, apps/coach 65, apps/admin 7

`[cmd]` **Und der Plan fuer die fuenf Module steht in
`docs/sessions/2026-09-08-plan-fuenf-module.md`.**

---

# Zweiter Teil des Tages

**In einem Satz:** die Muskelkarte wurde von 23 Buendeln auf 43
einzelne Muskeln aufgeloest, DSLD mit 214.780 Produkten
eingelesen ? und dabei kam heraus, dass die Erholungskachel ihre
Zahlen aus einer Mockup-Tabelle nahm und `echte Daten` daran
schrieb.

`[cmd]` **103 Commits, ungepusht.**

## Neue Entscheidungen

    E-81  parent_id fuer die Tiefe, KEINE Ebenenzahl
          Seite als SPALTE am Messwert, nicht als Zeile
    E-82  die tiefste sinnvolle Ebene
          Faktor an der ZUORDNUNG, nicht an der Rolle

## Die Muskelkarte, in sieben Schritten

`[cmd]` **G-425:** **jeden Ruecken-Pfad einzeln fotografiert** ?
`upper-back` **waren DREI Muskelpaare, nicht eine Gruppe.**

`[cmd]` **C-468:** **`public.koerperflaechen`, 59 Zeilen, drei
Ebenen** ? **und ein Sicherheitsbefund: `pg_default_acl` vergibt
in `public` bei JEDER neuen Tabelle alles.**

`[cmd]` **C-471:** **Struktur nach `migrations/`, Daten in den
Kettenschritt** ? **D-17, Weg B.**

`[cmd]` **G-430, G-431, G-434:** **23 -> 26 -> 28 -> 43
Flaechen.** `[read]` **Der letzte Schritt lief direkt zwischen
Tom und Claude Code, ohne Orchestrator.**

`[cmd]` **C-484:** **`ebene` und `seite` raus, 68 -> 51 Zeilen,
`art` erlaubt `kopf`.**

`[cmd]` **G-436, G-438:** **die Hierarchie als EINE Liste,
immer offen, mit Schnitt und Engpass je Gruppe** ? **und
geliehene Werte mit Herkunft (*,,Wert von Triceps"*).**

## Der Befund, der den Tag traegt

`[cmd]` **G-440: `MUSCLE_STATE` in `motor.ts` war eine
ATTRAPPE** ? **achtzehn feste Zeilen, aus dem Mockup
abgeschrieben, und die Kachel trug `echte Daten`.**

Tom: *,,das ist alles dreck was hier geliefert wird und
verarschend gegenueber mich."*

`[read]` **Der Orchestrator hat G-433, G-435, G-436 und G-438
abgenommen, OHNE zu fragen, woher die Zahlen kommen.**

`[cmd]` **Behoben: die Werte kommen jetzt aus `workout_sets` x
`workout_exercises` x `exercise_muscles`.**

`[cmd]` **Und der eigentliche Befund: SECHS verschiedene
Uebungen im Seed, 1.416 im Katalog.**

## Die Recherche

`[cmd]` **`docs/ssot/180, 181, 182`** ? **drei Dateien, auf
Toms Ansage:** *,,vielleicht mal online recherchieren, ob es
irgendwelche wissenschaftlichen formeln gibt."*

**Geprueft und ABGELEHNT:**

    wger              845 Uebungen, 16 Muskeln
                      kleiner als unsere 1.416 auf 105
    MuscleWiki        kommerziell, dieselben zwei Stufen
    Alpha Progression Zahlen ohne Beleg
    OpenSim           braucht Motion Capture

**Geprueft und BRAUCHBAR:**

    Pelland et al. 2026   direkt 1,0 / indirekt 0,5
      Sports Med 56(2)    67 Studien, 2.058 Teilnehmer
                          Bayes-Faktor 9,48

    ACE-Studienreihe      je Muskelgruppe 8-9 Uebungen,
                          auf die BESTE normalisiert
      Bankdruecken        Brust 0,95, Front-Delt 0,79,
                          Trizeps 0,67

    Beardsley             das PRINZIP (neuromechanisches
                          Matching), keine Tabelle
                          Versagen = +37 % Erholungszeit

## Supplements: DSLD

`[cmd]` **C-485:** **214.780 Produkte, 6.419 Firmen, 3,0 Mio
Inhaltszeilen, 1,7 Mio Kandidaten.**

`[read]` **Die Kandidaten sind die sichtbare Luecke** ? **nicht
erfundene Zuordnungen.**

`[cmd]` **Und die `blend`-Loesung von DSLD selbst:** **die
Mischung traegt die Gesamtmenge, die Zutaten folgen OHNE Menge,
in Etikettreihenfolge.**

## Sprachspalten

`[cmd]` **C-488: `_de` 123 -> 126, `_en` 101 -> 125, `_th`
91 -> 123** ? **keine Uebersetzung erfunden, drei begruendete
Ausnahmen.**

`[cmd]` **C-489: `supplier_products.name` -> `name_en`,
`name_de` und `name_th` leer angelegt.**

`[read]` **Die Regel stand seit langem in den Konventionen** ?
**der Orchestrator hat sie in vier Auftraegen nicht genannt.**

## Fehler des Orchestrators, zweiter Teil

**1** ? **Eine Regel erfunden und dreimal weitergereicht:**
*,,triceps hat drei Koepfe und bleibt EIN Muskel"* ?
**anatomisch falsch.**

**2** ? **`training.muscle_groups` nicht gelesen** ? **die
Hierarchie stand die ganze Zeit da, 105 Namen, vier Ebenen.**

**3** ? **Zwei Agenten aufeinander warten lassen** ? **C-484
und G-435 verlangten beide, dass der andere zuerst meldet.**

**4** ? **Einen Bericht geglaubt statt gemessen** ? **die
C-484-Konfliktloesung, die `tabs.tsx` beschaedigte.**

**5** ? **Bei Schritt 4 angefangen statt bei Schritt 1** ?
**Tom musste die sechs Schritte selbst aufschreiben.**

## Was laeuft

    Codex        C-490, C-491, C-492
                 (Faktor, Zuordnung, Basiszeit)
    Claude Code  G-437 (tabs.tsx wiederherstellen)

## Was offen ist und zaehlt

`[cmd]` **C-472:** **der Datenlogik-Waechter ist seit C-428 rot
? fuenfzehn Migrationen.**

`[cmd]` **C-486:** **UTF-8 kippt beim Einspielen, Hex zeigt
`3f3f`.**

`[cmd]` **G-439:** **`fiber_g` fehlt im Sollstand** ? **`pnpm
gate` stoppt daran, dreimal gemeldet.**

`[cmd]` **G-441:** **die Today-Kachel rechnet weiter aus
`MUSCLE_STATE`.**

`[cmd]` **C-476:** **hat LumeOS dieselben Katalogfehler wie
openGym? 1.416 Uebungen, ungeprueft.**
