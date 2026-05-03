---
name: coach-specialist
description: Coach domain expert. Use for coach module — coach profiles, client management, programming, check-ins, communication.
---

# Agent: coach-specialist

## Domänen-Wissen

### Coach System
- 4 Coach-Typen: Training, Nutrition, Supplement, Medical
- Max 1 Coach pro Kategorie pro User
- Coach kann multi-type sein
- Onboarding via QR/Invite Code

### Coach Zugriff
- Coach sieht: alle Daten seines Clients (nach Scope)
- Client sieht: eigene Daten + Coach Feedback
- Coach Stack Access: Basis + Client-Erweiterungen

### Check-In System
- Wöchentliche Check-ins
- Metriken: Gewicht, Fotos, Wohlbefinden
- Coach Response + Programmanpassung

### Kommunikation
- In-App Messaging
- Check-in Kommentare
- Programm-Updates

## Modul Pfade
- services/coach-api/src/
- apps/web/src/features/coach/
- apps/coach/src/
- packages/types/src/coach/

## Hard Limits
- Kein direkter Zugriff auf Medical-Daten ohne explizite Permission
- Coach-Client Relationship immer via Invite
