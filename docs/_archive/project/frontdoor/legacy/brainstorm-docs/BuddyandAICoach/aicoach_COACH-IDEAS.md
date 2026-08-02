# AI Coach — Feature-Ideen & Brainstorming

> Gesammelt mit Tom, 2026-02-24

---

## 🎯 VISION: Der AI Coach ist der App Butler

**Kernidee:** Alles was der User manuell in der App machen kann, kann er auch über den Coach machen — per Text oder Sprache. Der Coach ist die **primäre Schnittstelle**, die App-UI ist die sekundäre.

**Prinzip:** User redet mit dem Coach wie mit einem Personal Assistant. Der Coach versteht den Intent, führt die Action aus, bestätigt das Ergebnis.

### Was der Butler können muss:

| Modul | Beispiel-Befehle |
|-------|-----------------|
| **Nutrition** | "Log 200g Hähnchen mit Reis" · "Was hab ich heute gegessen?" · "Kopiere gestern" · "Wie viel Protein fehlt?" |
| **Supplements** | "Hab meine Supps genommen" · "Kreatin gecheckt" · "Wann ist nächster Pin Day?" · "Zeig meinen Stack" |
| **Recovery** | "Morning Check-in: Schlaf 7h, fühle mich gut" · "Wie ist mein Recovery Score?" |
| **Training** | "Leg Workout loggen: Squats 5x5 100kg" · "Was trainiere ich heute?" |
| **Wasser** | "500ml Wasser" · "Wie viel fehlt noch?" |
| **Gewicht** | "Wiege heute 86kg" |
| **Settings** | "Ändere mein Protein-Ziel auf 160g" · "Wechsle Sprache auf Englisch" |
| **Überblick** | "Wie war meine Woche?" · "Gib mir mein Briefing" · "Was steht heute an?" |

### Architektur: Action Layer

```
User Input (Text/Voice)
    ↓
Speech-to-Text (wenn Voice)
    ↓
Intent Recognition (GLM)
    → intent: "log_meal" | "log_water" | "checkin" | "query" | ...
    → entities: {food: "Hähnchen", amount: 200, unit: "g"}
    ↓
Action Router
    → ruft die richtige API auf (Nutrition/Supplements/Recovery/...)
    ↓
Confirmation + Response
    → "✅ Geloggt: 487 kcal, 52g Protein"
```

### UX-Konzept
- 🎤 **Mikrofon-Button** im Chat (immer sichtbar)
- ⚡ **Quick Confirm**: Coach schlägt vor, User tippt nur "ja" oder ✓
- 🔄 **Undo**: "Mach das rückgängig" → letzter Log wird gelöscht
- 📊 **Inline Cards**: Coach zeigt Mini-Dashboard im Chat (nicht nur Text)

---

## Feature-Liste (Detail)

### 1. 🎤 Voice Input
- Web Speech API (gratis, Browser-nativ) als Default
- Whisper API als Premium-Option (genauer, multilingual)
- Auto-Spracherkennung DE/EN/TH
- Push-to-talk oder Auto-Detect

### 2. 🧠 Intent Recognition + Action Execution
- GLM erkennt Intent aus natürlicher Sprache
- Structured Output: `{intent, entities, confidence}`
- Bei confidence < 0.8: Rückfrage statt falsch buchen
- Action-Registry: jeder Intent mapped auf eine API-Funktion

### 3. ✅ Smart Confirmation
- Einfache Actions (Wasser, Check-in): direkt ausführen
- Komplexe Actions (Meal mit mehreren Foods): Vorschau → Confirm
- "Meinst du Hähnchenbrust (165 kcal/100g) oder Hähnchenschenkel (185 kcal/100g)?"

### 4. 📊 Inline Rich Cards
- Mini Macro-Ring im Chat
- Supplement-Checklist als interaktive Checkboxen
- Recovery Score Gauge
- Nicht nur Text-Antworten — echte UI-Elemente im Chat

### 5. 🔄 Undo / Korrektur
- "Das war falsch, waren nur 150g"
- "Lösch die letzte Mahlzeit"
- Coach kennt letzten Action-Kontext

---

### 6. 🏋️ Gym-Finder (Location-Based)

**User:** "Finde Gyms in meiner Nähe"

**Coach macht:**
- Browser Geolocation API → Standort holen
- Google Places API / Maps: Gyms im Umkreis suchen
- Pro Gym liefern:
  - 📍 Name, Adresse, Entfernung
  - ⭐ Google Rating + Anzahl Reviews
  - 💬 Review-Zusammenfassung (Top 3 Pros/Cons per AI)
  - 💰 Preise (falls auf Google/Website auffindbar)
  - 🕐 Öffnungszeiten
  - 📸 Fotos
  - 🔗 Google Maps Link
- **AI Review Analysis**: "78% loben die Geräteauswahl, 15% bemängeln Klimaanlage"
- Sortierung: Rating / Entfernung / Preis
- Filter: 24h, Pool, Sauna, Personal Trainer, Kampfsport, CrossFit

**Monetarisierung:**
- Gyms können Lumeos-Partner werden → Premium-Listing
- Direkt-Buchung Tageskarte über Wallet
- Gym-Empfehlung basierend auf User-Profil (Bodybuilder → Freihantelbereich wichtig)

**APIs:** Google Places API (oder Foursquare als Alternative), Web Scraping für Preise

---

### 7. 💓 Coach Heartbeat — Personalisierte Journey

**Konzept:** Der Coach hat einen konfigurierbaren Heartbeat — wie ein persönlicher Assistent der sich zu den richtigen Zeiten meldet, mit genau den Infos die der User will.

**Journey Builder (Settings):**
Der User definiert seine tägliche Journey:

| Zeitpunkt | Default | Konfigurierbar |
|-----------|---------|----------------|
| 🌅 **Morgen-Briefing** (z.B. 7:00) | Recovery Score, Schlaf, was steht heute an | ✅ |
| 🍽️ **Pre-Meal Reminder** (z.B. 12:00, 18:00) | Makros-Stand, Vorschlag was essen | ✅ |
| 💊 **Supplement-Reminder** | Welche Supps jetzt fällig | ✅ |
| 💉 **Pin Day Alert** | Heute ist Injektionstag, Site Rotation | ✅ |
| 🏋️ **Pre-Workout** (z.B. 16:00) | Recovery Check, Muskelgruppen-Empfehlung | ✅ |
| 🌙 **Abend-Summary** (z.B. 21:00) | Tages-Review, was fehlt noch, Streak | ✅ |
| 📊 **Wochen-Report** (So 20:00) | Woche vs. Ziele, Trends, Highlights | ✅ |

**Was der User konfiguriert:**
- ⏰ Uhrzeiten pro Checkpoint
- 📋 Welche Module/Infos pro Checkpoint (Checklist)
- 🔕 Welche Tage (z.B. Wochenende anders)
- 🎭 Persona pro Checkpoint (Morgens = Drill Sergeant, Abends = Best Friend)
- 📱 Push Notification vs. nur in-App Badge

**Beispiel Morgen-Briefing (konfiguriert):**
```
☀️ Guten Morgen Tom!

💤 Recovery: 72/100 (Schlaf 6.5h — unter Ziel)
⚖️ Gewicht: 85.2kg (Trend: -0.3kg/Woche ✅)
📅 Heute: Pin Day — Testosterone E. | Glute links
💊 Supps fällig: Kreatin, Omega-3, Vitamin D
🎯 Ziel heute: 2500 kcal, 160g Protein
💡 Tipp: Schlaf war kurz — heute eher moderate Intensität
```

**Architektur:**
- `coach_journey` DB-Tabelle: user_id, checkpoints (JSONB)
- Cron-Job oder Client-Side Timer prüft Checkpoints
- Push via Web Push API / Service Worker
- Jeder Checkpoint = Context Builder + Template + optionales LLM

**Unterschied zu normalen Notifications:**
- Nicht einfach "Trink Wasser!" — sondern **kontextbewusst**
- Morgens nach schlechtem Schlaf: anderer Ton als nach 8h
- Kennt den Trainingsplan, Cycle, Supplement-Timing
- **Fühlt sich an wie ein Mensch der dich kennt**, nicht wie eine dumme Erinnerung

---

### 8. 🚨 Proaktiver Wächter — Coach meldet sich VON SICH AUS

**Kernidee:** Der Coach wartet nicht auf den User. Er überwacht im Hintergrund ALLE Module und meldet sich aktiv wenn etwas kritisch wird. Der User muss nie selbst Dashboards checken oder Warnings suchen.

**Prioritäts-Levels:**

| Level | Trigger | Beispiel | Verhalten |
|-------|---------|----------|-----------|
| 🔴 **CRITICAL** | Sofort-Push | Gefährliche Supplement-Interaktion, Übertraining + Pin Day | Push Notification + Coach öffnet sich |
| 🟠 **WARNING** | Nächster Check-in | Protein seit 3 Tagen unter 50%, Dehydration-Trend | Badge + Erwähnung im Briefing |
| 🟡 **INFO** | Passiv im Feed | Streak-Rekord, Ziel fast erreicht | Insight Card, kein Push |

**Was der Wächter überwacht:**

**Ernährung:**
- 🔴 Seit 24h nichts geloggt (Vergessen? Krank?)
- 🔴 Kalorienzufuhr <800 kcal bis 18:00 (Crash-Diät-Alarm)
- 🟠 Protein 3+ Tage unter Ziel (Muskelabbau-Risiko)
- 🟠 Mikronährstoff-Defizit 7+ Tage (z.B. Vitamin D, Magnesium)

**Supplements:**
- 🔴 Neue Interaktion erkannt (User fügt Supp hinzu das mit bestehendem kollidiert)
- 🔴 Pin Day vergessen (Abends noch nicht injiziert)
- 🟠 Supplement-Compliance <50% über 7 Tage
- 🟠 Cycle endet in 3 Tagen (PCT vorbereiten?)

**Recovery:**
- 🔴 Recovery Score <30 + Training geplant (Übertraining-Warnung)
- 🔴 Schlaf 3+ Nächte unter 5h
- 🟠 Recovery-Trend fallend seit 7 Tagen

**Übergreifend:**
- 🔴 Widersprüche: Defizit-Diät + Masse-Cycle aktiv
- 🟠 Plateau erkannt: Gewicht/Kraft stagniert 14+ Tage
- 🟡 Meilenstein: 30-Tage-Streak, Gewichtsziel erreicht, neuer PR

**Architektur:**
```
Background Worker (alle 15-30 min)
    ↓
Context Builder → alle Module abfragen
    ↓
Rule Engine (deterministische Checks, $0)
    ↓
Priorität zuweisen (CRITICAL / WARNING / INFO)
    ↓
┌─ CRITICAL → Push Notification sofort
├─ WARNING  → Badge + nächstes Briefing
└─ INFO     → Insight Feed (passiv)
```

**Unterschied zu Dashboard-Warnings:**
- Dashboard = User muss hinschauen
- Wächter = kommt zum User, nicht umgekehrt
- **Kontext-bewusst:** "Dein Recovery ist bei 28 UND du hast heute Beintraining geplant → SKIP oder leichter trainieren?"
- **Nicht nervig:** Lernfähig — wenn User Warning 3x dismisst, wird sie heruntergestuft

**Smart Mute:**
- Nachtmodus (23:00–07:00): nur CRITICAL
- Fokus-Modus: nur CRITICAL
- User kann pro Kategorie einstellen

---

### 9. 💰 Modulares Pricing — Coach als Upsell-Engine

**Kernidee:** Der Coach wird modular gebaut, damit Features einzeln oder als Tier verkauft werden können. Jedes Feature hat ein internes `tier`-Tag.

**Tier-Struktur (Beispiel):**

| Tier | Name | Enthält | Preis |
|------|------|---------|-------|
| 🆓 **Free** | Basic Coach | Text-Chat, Insights Feed, 5 Fragen/Tag | 0 THB |
| ⭐ **Plus** | Smart Coach | Unbegrenzt Chat, Journey/Heartbeat, Briefings, alle Personas | +X THB/Mo |
| 🔥 **Pro** | 24/7 Butler | Voice Input, Action Execution (Meals/Supps loggen), Proaktiver Wächter, Push Alerts, Gym Finder | +Y THB/Mo |
| 👑 **Elite** | AI Personal Trainer | Personalisierte Trainingspläne, Cycle-Beratung, Wochen-Reports mit Deep Analysis, Priority Support | +Z THB/Mo |

**Technische Umsetzung:**
```typescript
// Jedes Feature hat ein Tier-Tag
const FEATURE_TIERS = {
  'chat_basic':        'free',
  'insights_feed':     'free',
  'daily_limit_5':     'free',
  
  'chat_unlimited':    'plus',
  'journey_heartbeat': 'plus',
  'briefings':         'plus',
  'all_personas':      'plus',
  
  'voice_input':       'pro',
  'action_execution':  'pro',
  'proactive_watcher': 'pro',
  'push_alerts':       'pro',
  'gym_finder':        'pro',
  
  'training_plans':    'elite',
  'cycle_consulting':  'elite',
  'weekly_deep_report':'elite',
} as const;

// Middleware checkt Tier vor Feature-Zugriff
function requireTier(feature: string) { ... }
```

**Wallet-Integration:**
- Coach-Tiers = Wallet-Voucher (nicht klassisches Abo)
- Upgrade/Downgrade jederzeit
- Verbrauchsbasiert möglich: z.B. Voice = 1 Token pro Minute

**Upsell im Coach selbst:**
- User fragt per Voice → "🎤 Voice Input ist ein Pro-Feature. Upgrade für +X THB/Monat?"
- User will Proaktive Alerts → Teaser mit einem gratis Alert pro Woche, Rest = Pro
- **Der Coach verkauft sich selbst** — zeigt den Mehrwert im Moment wo der User ihn braucht

**Wichtig für Architektur:**
- Jede Coach-Funktion MUSS ein `tier`-Tag haben
- Feature-Gate als Middleware, nicht hardcoded in Components
- Tiers + Preise konfigurierbar (nicht im Code, sondern in DB/Config)
- A/B-Testing fähig: verschiedene Tier-Schnitte testen

---

---

## 🚀 Jarvis' Ideen — Innovationen

### 10. 📸 Visual Check-In
User schickt Foto (Spiegel-Selfie) → Coach analysiert:
- Fortschritts-Vergleich mit letztem Foto (selbe Pose)
- "Dein Lat sieht breiter aus als vor 4 Wochen"
- Body Composition Schätzung (visuell, kein DEXA aber Trend)
- Automatisch in Fortschritts-Timeline gespeichert
- **Motivation:** Veränderungen die man selbst nicht sieht, sieht die AI

### 11. 🧬 Pattern Detective
Coach erkennt Muster die der User nie bemerken würde:
- "Immer wenn du Montags trainierst, ist dein Dienstag-Recovery 20% besser als nach Mittwochs-Training"
- "Dein Schlaf ist 40min länger wenn du nach 18:00 kein Koffein nimmst"
- "Deine beste Protein-Compliance ist an Tagen wo du Meal Prep machst"
- Korrelations-Engine über alle Module, Zeitreihen-Analyse
- **Wert:** Personalisierte Erkenntnisse die kein Coach der Welt liefern kann — zu viele Datenpunkte

### 12. 🎯 Adaptive Ziele
Coach passt Ziele dynamisch an statt starre Targets:
- Schlecht geschlafen → "Heute 200 kcal weniger, dafür mehr Rest"
- Recovery 90+ → "Heute ist der Tag für einen PR-Versuch"
- 3 Tage Protein über Ziel → "Saubere Woche, am Wochenende 10% Puffer"
- Nicht der User passt sich den Zielen an — **die Ziele passen sich dem User an**

### 13. 🤝 Coach-zu-Coach (B2B)
Echte Personal Trainer können den AI Coach als Tool nutzen:
- Trainer sieht Dashboard aller Clients
- Trainer kann Coach-Regeln pro Client definieren ("Bei Tom nie unter 2000 kcal")
- Coach eskaliert an echten Trainer bei CRITICAL
- Trainer antwortet über Coach-Interface → User merkt keinen Unterschied
- **Revenue:** Trainer zahlt Pro-Lizenz, Clients bekommen Premium-Coach "inklusive"

### 14. 🏆 Challenges & Social
Coach erstellt personalisierte Challenges:
- "7 Tage Protein-Challenge: Jeden Tag über 150g"
- "Hydration Week: 3L täglich"
- Fortschritts-Tracking im Chat
- Optional: Challenges mit Freunden teilen (Social Layer)
- Wallet-Rewards für abgeschlossene Challenges (Gamification + Monetarisierung)

### 15. 🌡️ Biomarker-Integration (Zukunft)
Wenn User Bluttest-Ergebnisse eingibt/hochlädt:
- Coach interpretiert Werte im Kontext (Testosteron, Leberwerte, Lipide)
- Supplement-Stack automatisch anpassen
- "Dein Ferritin ist grenzwertig — ich hab Eisen zu deinem Stack hinzugefügt"
- Trend über mehrere Bluttests
- **Enhanced Mode:** Leberwerte + Cycle → "Cycle Support anpassen?"

### 16. 🗺️ Reise-Modus
User reist → Coach passt alles an:
- Timezone-Shift → Supplement-Timing anpassen
- Lokale Food-DB aktivieren (Thailand → Thai Foods)
- Gym Finder am neuen Standort
- Jet-Lag Recovery Protokoll
- "Du bist in Bangkok — hier sind 3 Gyms mit Freihantel-Bereich in deiner Nähe"

### 17. 🔮 Predictive Coach
Basierend auf historischen Daten vorhersagen:
- "Bei deinem aktuellen Trend erreichst du 83kg in ~6 Wochen"
- "Dein Recovery-Trend zeigt: in 3 Tagen brauchst du einen Deload"
- "Supplement-Vorrat reicht noch 12 Tage — bestellen?"
- ML-Modelle auf User-Daten trainiert (lokal, privacy-first)

### 18. 💬 Kontext-Gedächtnis
Coach merkt sich vergangene Gespräche:
- "Letzte Woche hast du gesagt dein Knie macht Probleme — wie ist es heute?"
- "Du wolltest mehr Schlaf priorisieren — in den letzten 5 Tagen warst du bei Ø 6.2h"
- Nicht nur Daten sondern **Absichten** und **Commitments** tracken
- Follow-up auf eigene Empfehlungen: "Ich hab dir Magnesium vor dem Schlafen empfohlen — hat es geholfen?"

---

## Offene Fragen
- Voice: globaler FAB oder nur im Chat?
- Bestätigung: immer oder nur bei Unsicherheit?
- Navigation: "Zeig mir Supplements" → Tab öffnen?
- Rate Limiting für Free Tier?
- Biomarker: Manual Entry oder OCR von Lab-Reports?
- Predictive Models: on-device oder server-side?

---

## Priorisierung (Vorschlag)
**Phase 1 — Butler Basics:**
1. Intent Recognition + Action Execution (Text-first)
2. Voice Input (Web Speech API)
3. Smart Confirmation
4. Proaktiver Wächter (Rule Engine)

**Phase 2 — Intelligence:**
5. Journey/Heartbeat (konfigurierbar)
6. Pattern Detective
7. Adaptive Ziele
8. Kontext-Gedächtnis

**Phase 3 — Premium:**
9. Inline Rich Cards
10. Visual Check-In
11. Predictive Coach
12. Gym Finder

**Phase 4 — Platform:**
13. Coach-zu-Coach (B2B)
14. Challenges & Social
15. Biomarker-Integration
16. Reise-Modus
17. Modulares Pricing aktivieren
