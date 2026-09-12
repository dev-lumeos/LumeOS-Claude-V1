---
nr: C-479
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-430
entscheidung: null
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  fehlend_flaechen: 5
  unverbunden: 78
---

# C-479 — fuenf Flaechen und achtundsiebzig Muskeln

## Befund

Aus G-430, Claude Code, 2026-09-08.

`[cmd]` **Die Karte hat seit G-430 26 Flaechen:**

    latissimus, teres-major, teres-minor,
    erector-spinae, flanke        -- NEU
    upper-back, lower-back        -- weg

`[cmd]` **`public.koerperflaechen` traegt weiter:**

    upper-back, upper-back-l, upper-back-r
    lower-back, lower-back-l, lower-back-r

`[read]` **Die fuenf neuen fehlen** ? **die Karte zeigt sie mit
dem Vermerk *,,geerbt ? diese Flaeche steht noch nicht in
public.koerperflaechen"*.**

`[cmd]` **`AUS_AUFTEILUNG` in `apps/web` ueberbrueckt es** ?
**die einzige doppelte Stelle, faellt weg, sobald die Zeilen
stehen.**

## Was zu bauen ist

**1** ? **Fuenf Flaechen unter `wurzel-ruecken`, je mit Ebene 3
fuer links und rechts.**

    latissimus       + latissimus-l, latissimus-r
    teres-major      + -l, -r
    teres-minor      + -l, -r
    erector-spinae   + -l, -r
    flanke           + -l, -r

`[read]` **Und `upper-back`/`lower-back` fallen weg** ? **oder
bleiben als Elternteil?**

`[cmd]` **Messen, ob etwas sie liest.**

**2** ? **Die 78 unverbundenen Muskelnamen.**

`[cmd]` **Selbst gemessen:**

    training.muscle_groups                95
    davon mit koerperflaechen verbunden   17

`[cmd]` **Nicht verbunden, unter anderem:** `Abductors`, `Arms`,
`Back`, `Core`, `Gluteus Maximus`, `Forearm Extensors`,
`Brachialis`, `Hip Flexors`.

`[read]` **Nicht alle GEHOEREN verbunden** ? `Arms` **und**
`Core` **sind Wurzeln, keine Flaechen.**

`[read]` **Aber `Gluteus Maximus` und `Brachialis` sind Muskeln,
die die Karte zeigt.**

`[cmd]` **G-430 hat deshalb `MUSKEL_ZU_FLAECHE` BEHALTEN** ?
**die Handliste traegt die Abdeckung, die Tabelle die
Hierarchie.**

`[read]` **Ziel: die Handliste faellt weg.**

## Was zu messen ist

**1** ? **Welche der 78 zeigt die Karte ueberhaupt?**

`[read]` **Ein Muskelname ohne Flaeche ist kein Fehler** ?
`Grip Muscles` **zeichnet niemand.**

## Bericht

Stand 2026-09-12, Codex. Die Punktdatei wurde aus `todos/` nach
`laufend_codex/` verschoben.

### Flaechen und Eltern

Vorher standen **59** Zeilen in `public.koerperflaechen` (23 Ebene 2,
28 Ebene 3). Nachher sind es **68** (26 Ebene 2, 34 Ebene 3): die fuenf
Ebene-2-Flaechen `latissimus`, `teres-major`, `teres-minor`,
`erector-spinae`, `flanke` und ihre zehn Seitenzeilen sind vorhanden;
die sechs alten `upper-back`/`lower-back`-Zeilen sind weg.

`upper-back` und `lower-back` bleiben nicht als Eltern: ausser
`AUS_AUFTEILUNG` (G-430-Uebergangsbruecke) liest kein Produktionsleser
sie. Der einzige Tabellenleser ist Recovery
(`lib/koerper/hierarchie-read.ts`); die neuen Flaechen haengen direkt
unter `wurzel-ruecken`. Apps und `packages/ui` blieben unveraendert.

### Die 78 vorher unverbundenen Gruppen

`muscle_group_id` ist eine kanonische Eins-zu-eins-Bruecke, kein
Alias-Speicher. Nachher sind 19 kanonische Gruppen verbunden.

| Namen | Kartenbefund | Ergebnis |
|---|---|---|
| latissimus dorsi; Teres Major; Teres Minor; erector spinae | eigene Rueckenflaechen | verbunden |
| Pectoralis Major; Rectus Abdominis; Brachialis; Anterior Tibialis; Gluteus Maximus | gezeichnete Blattmuskeln | verbunden |
| Arms; Back; Core; Legs; Shoulders; Hips; Thighs; Upper Legs; Lower Legs; Upper Back; Mid Back; Lower Back | Hierarchie-/Regionsgruppen | keine eigene Flaeche |
| Abductors; Hip Abductors; Outer Thigh; Tensor Fasciae Latae; Hip Flexors; Iliopsoas; Hip Rotators; piriformis | nur Ersatz-/Nachbarflaeche | nicht verbunden |
| adductor brevis; Adductor Longus; adductor magnus; Hip Adductors; Inner Thigh | Adduktoren-Buendel | nicht verbunden |
| Biceps Femoris; Semimembranosus; Semitendinosus | Hamstring-Buendel | nicht verbunden |
| Gluteus Medius; Gluteus Minimus; Buttocks | Gluteal-Buendel | nicht verbunden |
| Front Shoulders; Rear Deltoids; Rotator Cuff; Infraspinatus; Subscapularis; levator scapulae | Schulter-/Trapez-Buendel | nicht verbunden |
| Forearm Extensors; Forearm Flexors; Brachioradialis; Extensor Carpi Radialis; Extensor Carpi Radialis Brevis; Extensor Carpi Radialis Longus; Extensor Carpi Ulnaris; Flexor Carpi Radialis; Flexor Carpi Ulnaris; Flexor Digitorum Profundus; Palmaris Longus; Pronator Teres; Wrist Extensors; Wrist Flexors; Grip Muscles; Fingers Flexors | Unterarm-Buendel, keine Einzelpfade | nicht verbunden |
| Fibularis Muscles; Peroneals; Peroneus Brevis; Tibialis Posterior; Flexor Digitorum Longus; Foot Muscles | Unterschenkel-/Fuss-Buendel | nicht verbunden |
| Clavicular Head; Sternal Head; Upper Chest; Lower Abs; Transverse Abdominis | Teilbereich ohne eigenen Pfad | nicht verbunden |
| Neck Muscles; Scalenes; Sternocleidomastoid; splenius capitis | Hals-Buendel | nicht verbunden |
| Quadriceps; Rectus Femoris; Hamstrings; Calves; Adductors; Obliques; Triceps; Forearms; Deltoids; Biceps; Glutes; Chest; Abdominals; Tibialis | bestehende Karten-Buendel bzw. durch Blattmuskel ersetzt | nicht zusaetzlich verbunden |
| Rhomboids; Internal Oblique; Soleus | nicht gezeichnet | bewusst unverbunden |

Die vier Luecken bleiben: Rhomboids, Internal Oblique und Soleus haben
keinen eigenen Kartenpfad; `flanke` hat keinen eigenen
`training.muscle_groups`-Namen. `Obliques` faerbt die Flanke mit, ohne
einen Namen zu erfinden.

### Struktur, Rechte und Pruefungen

Struktur: `migrations/20260912001600_c479_koerperflaechen_aufteilung.sql`;
Daten: `_pipeline/00_querschnitt/479_koerperflaechen_aufteilung.sql`.
Die Migration erzwingt Seiteneindeutigkeit und reassertiert RLS sowie
REVOKE-then-GRANT. Nach Frischaufbau und live: `authenticated` hat nur
SELECT, `anon` keine Rechte, `service_role` ALL; die Policy ist SELECT
fuer authenticated.

Sicherungen: `backup/schema/202609120210_c479_vor_live.dump`
(SHA-256 `D4B7364425FCDF2848FF92B5C5F9FA2AC35CA5B874C4020402234F6240AA2CC5`)
und `backup/schema/202609120235_c479_vor_seitenkorrektur.dump`.

Gegenprobe: vor dem Bau brach die 15-Zeilen-Probe mit `division by zero`
ab; nach dem Bau 15/15 vorhanden, Legacy 0, 68/26/34 und 19 Gruppen.
Vollkette: erster Lauf gruen (901,5 s); der Wiederholungslauf fuehrte
C-479 inklusive Seitenvererbung aus, sein anschliessender Waechterprozess
endete ohne Befund frueh mit Windows-Exit 4294967295.

**2** ? **Und welche fehlen der Karte?**

`[cmd]` **G-425 und G-430 haben vier Luecken gefunden:**
**Rhomboiden, Obliquus internus, Soleus, und die Flanke ohne
eigenen Muskelnamen.**

`[read]` **Die bleiben Luecken** ? **sie werden nicht erfunden.**
