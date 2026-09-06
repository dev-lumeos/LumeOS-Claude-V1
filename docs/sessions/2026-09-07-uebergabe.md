# Uebergabe 2026-09-07

**Wer das liest, faengt hier an.** `[read]` **Die Uebergabe vom
02.09. ist ueberholt.**

---

## Das Wichtigste zuerst: wie Auftraege zu schreiben sind

`[read]` **Der 07.09. ist an einer Sache gescheitert:** **der
Orchestrator hat Auftraege in Prosa geschrieben statt in pruefbaren
Bedingungen.**

Tom, 2026-09-07: *,,seit 2 stunden sage ich immer und immer wieder
dasselbe was ich will und wie es aussehen soll."*

`[cmd]` **Die Loesung steht in Anthropics eigener Dokumentation:**
*,,Gib Claude eine Pruefung, die es selbst ausfuehren kann. Ohne sie
ist *sieht fertig aus* das einzige Signal, und der Mensch wird zur
Pruefschleife."*

### Jeder Auftrag traegt Abnahmebedingungen mit Zahlen

**Nicht:** *,,setz die Referenz darunter."*

**Sondern:**

    A1  Anzahl oben == Anzahl unten. Beide Zahlen nennen.
        Sind sie ungleich, ist es NICHT fertig.

`[read]` **Eine Bedingung, die man zaehlen kann.** `[read]` **Sonst
macht der Agent, was ihm auffaellt, und meldet *fertig*.**

`[cmd]` **Und der Orchestrator misst die Zahlen selbst nach, bevor
er abnimmt.**

### Zwei-Strikes-Regel

`[read]` **Wer denselben Punkt zweimal korrigieren musste, faengt
eine neue Sitzung an** — **nicht die dritte Korrektur.**

---

## Stand

    todos                216
    laufend_codex        2    C-419, C-420
    laufend_claudecode   6    G-365 laeuft ueber acht Module
    erledigt             299
    Gate                 gruen
    ungepusht            43

---

## Die neun Entscheidungen vom 07.09.

    E-64  Einkaufsliste aus der Planwoche, nicht aus dem Rezept
    E-65  der Vorrat ist ein Anhaltspunkt, kein Lager
          eigene Tabelle in nutrition, keine Modulkopplung
    E-66  MealCam erkennt nicht nur Lebensmittel
          kein Posten ohne Naehrwerte, Rezepte als Sammelpunkt
    E-67  das Onboarding setzt Grundeinstellungen, nicht Ziele
    E-68  eine Attrappe bleibt sichtbar und sagt, worauf sie wartet
    E-69  Tom entscheidet, wann eine Attrappe faellt
    E-70  drei Zustaende: angebunden, Attrappe, verworfen
    E-71  die Regeln gelten je App
    E-72  anbinden heisst mit Daten

`[read]` **E-68 bis E-72 gehoeren zusammen** — **sie regeln, wie
Mockup und Code nebeneinander stehen.**

### Die Anordnung, von Tom abgenommen

    OBEN     das Angebundene
             + Attrappen dessen, was noch nicht angebunden ist
    ------   Trennlinie
    UNTEN    die Mockup-Fassung JEDER angebundenen Kachel

`[cmd]` **Je Kachel eine Referenz, kein Block** — **sonst laesst es
sich nicht zaehlen.**

`[read]` **Eine Attrappe braucht keine Referenz auf sich selbst.**

---

## Der grosse offene Strang: G-365

`[cmd]` **139 angebundene Kacheln ueber acht Module.**

    Modul          Reiter   Stand
    recovery            9   angefangen, Referenzen unvollstaendig
    supplements        11   Linie da, Referenzen fehlen
    training           10   dito
    goals              10   dito
    nutrition           9   offen
    medical             6   offen
    dashboard           -   offen
    settings            -   offen

### Die fuenf Schritte je Kachel

    1  Ist die Mockup-Kachel oben vorhanden?
    2  Wenn angebunden: setz die Mockup-Kachel UNTEN als Soll
    3  Wenn Attrappe: war sie schon mal angebunden?
    4  Wenn Attrappe: was fehlt zum Anbinden?
    5  Wenn angebunden: liegen Daten vor?

`[read]` **Schritt 3 ist der wichtige** — **eine Marke kann
luegen.**

---

## Das Muster, das den Tag bestimmt hat: A-71

`[cmd]` **Viermal am 07.09., in vier Modulen:**

    G-364   <RecMuscleMap /> ohne Prop gerufen        3 Kacheln
    G-365   Today-Sitzung aus festem Objekt           1
    G-365   Modalitaeten, modality_log ungenutzt      4
    G-365   Rechenweg las TDEE_STATE statt tdee-Prop  1

`[read]` **Eine Kachel wird aus Entwurfskonstanten gebaut, der
Leseweg entsteht spaeter, und niemand verbindet sie.**

`[read]` **Und die Kachel traegt weiter den Vermerk *,,noch nicht
angebunden"*** — **er luegt und verhindert, dass jemand
nachsieht.**

Tom, 2026-09-07: *,,DIE WAREN ANGEBUNDEN UND HABEN VOLLUMFAENGLICH
FUNKTIONIERT."* — **er hatte recht, viermal.**

`[cmd]` **Bilanz: 67 markierte Kacheln geprueft, 9 Marken falsch.**

---

## Was heute gebaut wurde

### Wallet (C-419)

`[cmd]` **13 Tabellen, RLS, `book_wallet_purchase`, Voucher vor
Revenue, 4/4 gruen.** `[cmd]` **Der Vollkettennachweis steht noch
aus.**

`[read]` **Fuenf Einnahmequellen laufen darueber**
(`00_MASTER_VISION.md`).

### Vier Schreibwege (G-357, G-356, C-379)

    goals.goal_phase_start / _end     mit Pflichtgrund
    goals.body_circumference_write    13 Punkte, links/rechts
    nutrition.meal_plan_set_next_plan
    meal_items_inventory_deduct_trg   der Vorratsabzug

### Einkaufslisten und Vorrat (C-407, C-408, G-345)

`[cmd]` **Wochenlisten, `nutrition.user_inventory`, Oberflaeche an
drei Orten.**

### SPEC_11 MealCam, 916 Zeilen

`[cmd]` **`docs/specs/Nutrition/01_current_specs/SPEC_11_MEALCAM.md`**

`[read]` **Die BLS-Codestruktur traegt die Facetten** — **Stelle 1
Warengruppe, 2-4 Lebensmittel, 5-7 Zubereitung, 59 Codes.**

`[read]` **`gekocht` ist kein Elternteil von `gegrillt`** — **Toms
Korrektur am Blueprint.**

### Fuenf neue Waechter

    tools/quellen-pruefen.mjs      00-QUELLEN.md vollstaendig
    tools/mockup-deckung.mjs       Elemente aus der UI verschwunden
    tools/backup-wachstum.mjs      backup/ waechst
    taeglicher Kettenlauf          04:00, Status im Gate
    punkte-pruefen                 next/ gefuellt, Agent leer

---

## Was der Orchestrator heute falsch gemacht hat

`[read]` **Steht hier, weil es sich wiederholen wird.**

**1 · `00-QUELLEN.md` nicht geoeffnet, zweimal.** `[cmd]` **Behauptet,
es gebe keine Marketplace-Spec** (12 Dateien) **und die HumanCoach-
Spec uebersehen** (12 Dateien, 3.291 Zeilen). `[read]` **Beide Male
mit `git grep` nach Dateinamen gesucht statt das Verzeichnis
geoeffnet.**

**2 · Toms Aussage in eine Messung verwandelt.** `[read]` **Er sagte
*,,das war angebunden"*** — **statt zu messen, wann es kaputtging,
wurde gemessen, ob er recht hat.** **Viermal.**

**3 · Eine Sache in drei Auftraege zerlegt.** `[cmd]` **C-418 war
der Bauauftrag, G-365 der Pruefauftrag** — **ab `supplements` lief
nur noch einer.**

**4 · Auftraege in Fragen formuliert.** *,,Steht die Mockup-Kachel
unten?"* **liest sich als Messung, nicht als Bauauftrag.**

**5 · Waechter gebaut, ohne die Mehrsprachigkeit zu bedenken.**
`[cmd]` **170 gemeldet, 11 wirklich weg** — `Muscle readiness` gegen
`Muskelbereitschaft`.

---

## Wo die Vorgaben liegen

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, 428 Zeilen** — **sagt
je Modul, was zu lesen ist.** **Zuerst oeffnen, nicht suchen.**

`[cmd]` **`docs/specs/<Modul>/`** — **13 Modulordner, rund 50.500
Zeilen.**

`[cmd]` **`docs/specs/00_MASTER_VISION.md`, 176 Zeilen** — **Buddy
ist das Produkt, Rule-first AI-second, keine direkten
DB-Schreibvorgaenge aus der UI.**

`[cmd]` **`theme-v1/`, 49 Mockups.** `[cmd]` **`referenz/lumeos-
2026/`** — Struktur ja, Code nie.

---

## Offen bei Tom

    G-352   welche Zielskala gilt -- vier Achsen gemessen
    G-363   wer schlaegt die naechste Phase vor
    E-46    die Erfahrungsskala, drei unvereinbare Fassungen
    C-419   Vollkettennachweis fuer das Wallet
    G-360   coach, market, admin als eigene Apps
