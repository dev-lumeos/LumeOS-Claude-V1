# Buddy / AI Coach Module — Offene Punkte

## Status: MVP implementiert (Text-Chat, 5 Personas, Context Builder)

---

## 🔴 Hoch — aktiv zu bauen

### Feature: Voice Input vollständig
- STT on-device (Whisper.cpp) + TTS Streaming (OpenAI TTS)
- Gym-Command Recognition (<200ms, kein LLM-Roundtrip)
- Background Audio Session (EarPods, App im Hintergrund)
- Noise Cancellation Preprocessing

### Feature: Action Execution (App Butler)
- Intent Recognition für alle Module
- Smart Confirmation bei Confidence < 0.8
- Undo-Funktion ("Das war falsch, waren nur 150g")
- Vollständige Action-Test-Suite (AC1–AC12)

### Feature: Proaktiver Wächter (Background Worker)
- Background Worker alle 15–30 Minuten
- Web Push API Integration
- Smart Mute Logic (3× dismisst → heruntergestuft)
- Nachtmodus nur CRITICAL

---

## 🟡 Mittlere Priorität

### Feature: Journey Heartbeat vollständig konfigurierbar
- Pro-Checkpoint Persona-Auswahl
- A/B-Testing verschiedener Briefing-Formate
- "Kontextbewusstes" Briefing (Schlaf 5h → anderer Ton)

### Feature: Feature Gate Middleware
- Tier-Check als Middleware (nicht hardcoded)
- Tiers + Preise in DB/Config konfigurierbar
- A/B-Testing verschiedener Tier-Schnitte
- Upsell im Moment des Bedarfs

### Feature: AI Clone (Coach B2B)
- Coach-Methodik Upload Interface
- Clone Training Loop
- Escalation Rules konfigurierbar
- Client-seitige Clone-Chat-Oberfläche

### Feature: Gym Finder
- Google Places API Integration
- AI Review Summary (Claude)
- Filter: 24h, Pool, Sauna, Freihantelbereich
- Wallet-Integration für Tageskarten

### Feature: Visual Check-In
- Spiegel-Selfie → Claude Vision Analyse
- Fortschritts-Vergleich mit letztem Foto (gleiche Pose)
- Automatisch in Progress-Timeline speichern

### Feature: Inline Rich Cards
- Mini Macro-Ring direkt im Chat
- Supplement-Checklist als interaktive Checkboxen
- Recovery Gauge in Chat

---

## 🟢 Niedrige Priorität

### Feature: Pattern Detective
- Korrelations-Engine über alle Module
- "Dein Schlaf ist 40min länger ohne Koffein nach 18:00"
- Minimum: 8 Wochen Daten

### Feature: Predictive Coach
- "Bei deinem Trend erreichst du 83kg in 6 Wochen"
- "Supplement-Vorrat reicht noch 12 Tage"
- ML-Modelle on-device (Privacy-First)

### Feature: Challenges & Social
- Personalisierte Challenges (7-Tage Protein-Challenge)
- Wallet-Rewards für abgeschlossene Challenges
- Optional: mit Freunden teilen

### Feature: Reise-Modus
- Timezone-Shift → Supplement-Timing anpassen
- Lokale Food-DB (Thailand → Thai Foods)
- Gym Finder am neuen Standort

### Feature: Form Check via Camera
- Kemtai API Integration (White-Label, medical-validated)
- ~$0.05/Check Kosten
- Nur Premium-Tier

### Feature: Adaptive Ziele
- Ziele passen sich dem User an, nicht umgekehrt
- Schlechter Schlaf → weniger Volumen heute

---

## Offene Design-Fragen

| Frage | Stand |
|---|---|
| AI Micro-Transaction Preise (MealCam, AI Coach, OCR) | TBD |
| Free Tier: 5 Messages/Tag oder anders? | TBD — aktuell 5 |
| Voice: globaler FAB oder nur im Chat? | Empfehlung: globaler FAB |
| Mobile IAP (Apple 30%) für Tier-Upgrades? | Strategie: Web-Kauf empfehlen |
| LLM Provider: Z.AI vs Claude Haiku vs lokales Modell? | Entscheidung pro Tier |
| Behavioral Signature: Opt-in oder default? | Empfehlung: default mit Transparenz |
| AI Clone: im Elite-Tier oder separates Add-on? | TBD |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| Policy Gate | Aktuell Pattern-basiert — sollte robusteres ML-Modell werden |
| Memory Decay | Automatischer Decay-Algorithmus noch nicht implementiert |
| Context Window | 20 Nachrichten Sliding Window — bei langen Gesprächen evtl. zu wenig |
| Rule Engine | Aktuell TypeScript in-memory — sollte in DB persistiert werden |
| Embedding Model | Noch kein embedding_vector in knowledge_base befüllt |
| BSS Berechnung | Cron-Job fehlt noch — muss täglich laufen |
