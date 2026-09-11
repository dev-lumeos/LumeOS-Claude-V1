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
