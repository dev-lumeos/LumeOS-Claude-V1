# Sicherheit — was vor Produktiv zu tun ist

**Stand: 2026-08-27.** Diese Liste ist kein Wunschzettel, sondern die
Gegenbuchung zu einer bewussten Entscheidung.

---

## Die Entscheidung

`[cmd]` **Alles laeuft lokal auf einem Rechner. In der Datenbank
stehen 7 Konten, davon 2 mit echten Daten** (`tom.seed@example.com`
und `dev@lumeos.app` mit je 360 Einnahmen), der Rest sind Seed- und
Testkonten. **Kein Fremdzugriff, kein Netz, kein Kunde.**

**In dieser Phase wird nicht verschluesselt.** Die Sicherheitsvorgaben
gelten weiter — sie werden **verschoben, nicht gestrichen**, und diese
Datei ist der Ort, an dem sie verwahrt sind.

`[read]` **Die Begruendung, die traegt:** ein Schemawechsel kostet bei
zwei Zeilen nichts und bei tausend Nutzern eine Migration mit
Ausfallzeit. **Solange keine echten Daten drin sind, ist Verschieben
billiger als Bauen.**

`[read]` **Die Begruendung, die NICHT traegt** — und die deshalb hier
steht, damit sie niemand spaeter zitiert: *,,wen interessieren solche
Daten schon"*. `[cmd]` **`auth.users` traegt zu jedem Konto eine
E-Mail.** Ein Datenabzug enthaelt `auth.users` und
`medical.user_medications`, verbunden ueber `user_id` — **der
Angreifer muss niemanden kennen, er hat die Adresse und daneben die
Medikamente.** Das Argument gilt fuer eine anonymisierte
Forschungstabelle, nicht fuer diese Datenbank.

## Wann diese Entscheidung kippt

**Jede einzelne Bedingung genuegt:**

1. **Der erste Nutzer, der nicht wir ist.** Auch ein Freund, auch
   unbezahlt, auch ,,nur zum Ausprobieren".
2. **Die Datenbank verlaesst diesen Rechner** — Hosting, Cloud,
   zweiter Arbeitsplatz, Sicherung ausserhalb.
3. **Echte Medikamente statt Seed-Daten**, auch von uns selbst.
4. **Der Coach-Zugriff wird gegen einen echten Coach benutzt.**

`[read]` **Punkt 1 und 3 kommen frueher, als es sich anfuehlt.** Der
Tag, an dem jemand seine echten Medikamente eintraegt, um zu sehen ob
die Regeln stimmen, ist der Tag, an dem diese Liste faellig wird.

---

## Was dann zu tun ist

### 1 · Ablage der Nutzerdaten

`[cmd]` **Vier Tabellen tragen personenbezogene Gesundheitsdaten:**

    medical.user_medications      9 Textspalten
    medical.user_conditions       5
    medical.lab_result_values    15
    medical.lab_reports           6

`[cmd]` **Bei `user_medications` sind genau drei Spalten Freitext:**
`name`, `indication`, `notes`. `[read]` **Der Rest ist strukturiert**
— `active_substance_id`, `drug_class`, `dose_amount`, `route` — **und
muss lesbar bleiben, damit `rule_assessment` weiter funktioniert.**
Der Wirkstoff ist ein Fremdschluessel auf den Katalog, kein Geheimnis
fuer sich.

`[read]` **Daraus folgt der Zuschnitt:** die drei Freitextspalten
verschluesseln, die strukturierten klar lassen. **Damit bleibt die
Regel-Engine funktionsfaehig und der schuetzenswerte Teil ist
geschuetzt** — *,,Sertralin wegen Depression seit der Trennung"* steht
in `indication`, nicht in `active_substance_id`.

`[cmd]` **`pgcrypto` und `supabase_vault` sind installiert.** Nichts
muss nachgeruestet werden.

`[read]` **Die Frage, die zuerst zu beantworten ist: vor wem schuetzt
es?** Schluessel im Vault schuetzt gegen einen gestohlenen
Tabellenabzug — **nicht** gegen einen kompromittierten
Anwendungsserver, einen geleakten Service-Role-Key oder einen
Angreifer mit `postgres`-Rechten. Schluessel beim Nutzer schuetzt
gegen alles davon **und macht Coach-Freigabe und Passwort-
wiederherstellung zu einem anderen Bauwerk.**

`[read]` **Keine halbe Loesung.** Verschluesselte Spalten mit dem
Schluessel im selben System sehen nach Schutz aus und sind kaum einer
— **das ist schlechter als bewusster Klartext, weil es falsche
Sicherheit erzeugt.**

### 2 · Sicherungen

`[cmd]` **`backup/c292/20260827_074611_vor_live.dump`, 23,8 MB,
Vollabzug im Klartext.** Korrekt per `.gitignore:272` vom Repo
ausgeschlossen.

`[read]` **Das ist heute der groesste Bestand an Klartext-
Gesundheitsdaten ausserhalb der Datenbank, und er waechst mit jedem
Live-Eingriff** — die Regel *,,Vollsicherung vor jedem Live-Eingriff"*
erzeugt ihn planmaessig. `[read]` **Und er entsteht vor der
Anwendungsschicht: was in der Datenbank verschluesselt ist, ist es
hier auch, was klar ist, bleibt klar.**

**Zu tun:** Aufbewahrungsfrist festlegen und durchsetzen, Ablage
verschluesseln, und pruefen ob `--schema-only` fuer den Zweck reicht.

### 3 · Zugaenge

`[cmd]` **Der `SUPABASE_SERVICE_ROLE_KEY` liegt in `.env`-Dateien im
Repo-Verzeichnis** — er umgeht RLS vollstaendig. `[cmd]` `.env` und
`.env.*` sind in `.gitignore`. **Vor Produktiv: Rotation, getrennte
Schluessel je Umgebung, und kein Service-Role-Key in irgendeinem
Anwendungspfad.**

`[cmd]` **Admin (Port 3210) und Coach (3220) laufen seit dem 14. und
20.08. dauerhaft mit offener Konsole.** Lokal unbedenklich, produktiv
nicht.

### 3b · Cam-Bilder

`[read]` **Beschlossen am 2026-08-27** (E-19, E-20): Objektspeicher,
Bild und Analyse getrennt, zwei Zwecke mit zwei Einwilligungen.
**Gebaut wird davon jetzt nur das Schema, nicht der Ablauf.**

`[read]` **Ein Foto einer Mahlzeit traegt mehr als Essen** — Kueche,
Wohnung, Gesichter im Hintergrund, Medikamentenpackungen auf dem
Tisch. **Das ist nicht dieselbe Datenklasse wie ein
Gewichtseintrag.**

**Vor Produktiv faellig:**

    Einwilligungsdialog und Textfassung je Zweck
    Loeschfristen je Rechtsraum (Thai PDPA gegen DSGVO)
    Widerruf von Zweck 2 muss Bilder aus dem Trainingsbestand
      entfernen - Filter auf der Einwilligung, kein Trainingsordner
    Bucket-Policies pruefen: privat, kein oeffentlicher Lesezugriff

### 3c · Kein Waechter sucht nach Schluesselmustern

`[read]` **Berichtigung, 2026-08-28.** Ich hatte hier gemeldet, ein
Anthropic-Schluessel stehe im Klartext in einer getrackten und
gepushten Datei. `[cmd]` **Das war falsch** — es ist ein
Platzhalter in einem Beispiel-`.env`-Block
(`ANTHROPIC_API_KEY=sk-ant-api03-...`, abgeschnitten). **Ich hatte
den Treffer gefunden und den Kontext nicht gelesen.**

`[cmd]` **Ein vollstaendiger Schluessel liegt in
`referenz/lumeos-2026/src/api/shared/claude-vision.ts`** — per
`.gitignore:175` ausgeschlossen, nie im Repo. **Nicht oeffentlich,
aber im Klartext auf der Platte.**

`[cmd]` **Der eigentliche Befund:** `pnpm gate` prueft zehn Dinge und
**sucht nichts davon nach Schluesselmustern.** `[read]` Ein Waechter
haette beide Faelle sofort unterschieden — der eine endet auf
`...`, der andere ist 108 Zeichen lang. **Als A-56 angelegt.**

### 5 · Export und Loeschung

`[read]` **Aus E-18:** ein Nutzer muss seine Daten vollstaendig
mitnehmen koennen, und wir muessen sie vollstaendig loeschen koennen.

`[cmd]` **39 Tabellen tragen `user_id`, verteilt auf sieben
Schemas.** `[cmd]` **Und zwei davon haben keinen Fremdschluessel auf
`auth.users`** — `recovery.checkins` und `recovery.modality_log`
(gefunden in G-122). **Damit fehlt auch `ON DELETE CASCADE`: ein
geloeschter Nutzer hinterlaesst dort Waisen.**

### 4 · Nachvollziehbarkeit des Coach-Zugriffs

`[cmd]` **`coach.hat_sicht` regelt, wer was sehen darf** — ueber
`coach.client_permissions`, 5 Zeilen, mit `expires_at` und
Sichtbarkeitsstufe je Modul.

`[read]` **Was fehlt, ist die Aufzeichnung:** wer hat wann welche
Medikamente eines Klienten gesehen? **Eine Berechtigung ohne Protokoll
laesst sich weder pruefen noch widerrufen mit Wirkung nach hinten.**

`[cmd]` **Dazu offen: C-269** — eine Einladung laesst sich nicht
zuruecknehmen.

### 5 · Rechtlicher Rahmen

`[read]` **Nicht von mir zu entscheiden, aber vor dem ersten Nutzer zu
klaeren.** Gesundheitsdaten sind nach DSGVO eine besondere Kategorie;
Thailands PDPA kennt eine vergleichbare. Bei einer Panne gilt eine
Meldefrist von 72 Stunden. **LumeOS zielt auf DE/EN/TH — das sind
zwei Rechtsraeume, nicht einer.**

---

## Wie diese Liste benutzt wird

`[read]` **Sie wird bei jeder der vier Kippbedingungen gelesen, nicht
bei Gelegenheit.** Wer eine davon ausloest, arbeitet diese Liste ab
oder schreibt auf, warum nicht — **mit Datum und Begruendung, wie
diese Entscheidung selbst.**

Verwandte Punkte in `docs/todo/TODO.md`: **C-285** (Ablage),
**C-269** (Einladung), **C-302** (Schreibweg).
