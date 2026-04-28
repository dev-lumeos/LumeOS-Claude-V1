# Marketplace Module — User Flows
> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Produkt entdecken + kaufen

```
1. User öffnet Marketplace → Personalisierte Startseite
2. Sektion: "Für dein Lean Bulk Goal"
   → 3 Bundle-Empfehlungen, scoring nach Goal-Match + Rating

3. User klickt "12-Week Lean Bulk Bundle" (€49.00)
4. Produkt-Detail:
   ┌───────────────────────────────────────────────────────┐
   │ 12-Week Lean Bulk Bundle      ⭐ 4.8 (234 Bewertungen) │
   │ von Coach Alex ✓ Verified                              │
   │                                                        │
   │ Enthält:                                               │
   │ ✅ Training: PPL Hypertrophy (4×/Woche, 12 Wochen)    │
   │ ✅ Nutrition: Lean Bulk Meal Plan (2800 kcal)          │
   │ ✅ Supplements: Beginner Bulk Stack (Creatine, Whey)   │
   │                                                        │
   │ Einzelpreis: €77 | Bundle-Preis: €49 | Spare: €28     │
   │                                                        │
   │ Dein Wallet: 52.50 €  ✅ ausreichend                   │
   │                                                        │
   │ [Jetzt kaufen für €49.00]                             │
   └───────────────────────────────────────────────────────┘

5. Kaufbestätigung:
   "Wallet: €52.50 → €3.50 nach Kauf"
   [Bestätigen]

6. Delivery:
   "Inhalte werden geladen..."
   ✅ Training Routine hinzugefügt → Training Modul
   ✅ Meal Plan aktiviert → Nutrition Modul
   ✅ Supplement Stack vorgeschlagen → Supplements Modul
   
7. User sieht sofort im Training Tab: "12-Week Lean Bulk"
```

---

## Flow 2: Wallet aufladen

```
1. User hat Wallet: €3.50
2. Checkout zeigt: "Wallet zu niedrig — €45.50 fehlen"
3. [Wallet aufladen] Button
4. Top-up Modal:
   [€10]  [€25]  [€50]  [€100]  [Eigener Betrag]
   
5. User wählt €50
6. Stripe-Checkout öffnet (Web/App)
7. Zahlung → Stripe Webhook
8. Voucher-Credit: €50 ins Wallet
9. Wallet: €53.50 → Kauf jetzt möglich
```

---

## Flow 3: Creator Onboarding

```
1. Coach navigiert zu: Marketplace → "Als Creator verkaufen"
2. Multi-Step Wizard:

   Schritt 1: Profil
   Typ: [Coach] [Influencer] [Brand] [Nutritionist]
   Name, Bio, Avatar, Zertifikate, Spezialisierungen
   
   Schritt 2: Identitäts-Verifikation
   (BASIC: E-Mail + Social Media Link)
   (VERIFIED: ID Upload + Credential Nachweis)
   
   Schritt 3: Stripe Connect
   Bank-Verbindung für spätere Auszahlungen
   
   Schritt 4: Erstes Produkt erstellen (optional)

3. Status: "Verifizierung ausstehend (24–48h)"
4. Nach Approval: Creator Dashboard freigeschaltet
5. Produkt kann veröffentlicht werden
```

---

## Flow 4: Creator — Produkt erstellen

```
1. Creator Dashboard → "Neues Produkt"
2. Typ wählen: [Training Program] [Meal Plan] [Bundle] [...]
3. Für Training Program:
   Option A: "Aus meinen Routinen wählen"
     → Wählt aus seinen Training-Routinen
   Option B: "Neue Routine erstellen"
     → Training Module Editor
4. Titel, Beschreibung, Preis setzen
5. Goal Alignments: [muscle_gain] [strength] [performance]
6. Schwierigkeit, Dauer, Equipment
7. Preview-Bilder/Videos hochladen
8. [Vorschau] → Wie Käufer es sehen
9. [Veröffentlichen]
10. Produkt wird reviewed (auto oder manuell je nach Creator-Level)
```

---

## Flow 5: Buddy empfiehlt + kauft

```
1. Buddy-Konversation:
   User: "Ich brauche ein strukturiertes Training für Lean Bulk"
   
2. Buddy:
   "Basierend auf deinem aktuellen Lean Bulk Plan empfehle ich:
   
   1. 12-Week Lean Bulk Bundle (Coach Alex ⭐4.8)
      Enthält: Training + Meal Plan + Supplement Stack
      Preis: 49,00 € → Dein Wallet: 52,50 €
      [Jetzt kaufen]
   
   2. PPL Hypertrophy Pro (Coach Maria ⭐4.6)
      Training-only, 12 Wochen
      Preis: 29,00 €
      [Jetzt kaufen]"

3. User tippt: "Kauf Bundle 1"
4. Buddy: "Soll ich das 12-Week Lean Bulk Bundle für 49,00 € kaufen?"
5. User: "Ja"
6. Buddy führt Checkout durch → Delivery
7. Buddy: "✅ Bundle wurde hinzugefügt! Training startet in deinem Training Tab."
```

---

## Flow 6: Supplement Brand Placement

```
Automatischer Flow — kein direkter User-Trigger:

1. User trackt: Ferritin 28 ng/mL (niedrig) in Medical
2. Supplements Modul: Gap Analysis → Iron fehlt im Stack
3. Buddy-Kontext + Marketplace Integration:
   
   Buddy: "Dein Eisenspiegel ist niedrig.
   In-App Empfehlung: [Brand] Eisen Bisglycinate 25mg
   ⭐ 4.7 | 1.240 Käufer | 12,99 €
   [Jetzt kaufen] [Mehr Info]"
   
4. Brand zahlt CPA für diese Conversion (B2B)
```

---

## Flow 7: Refund

```
1. User: "Das Training-Programm ist nicht das was beschrieben wurde"
2. Order History → Bestellung → [Rückerstattung beantragen]
3. Auswahl: Grund angeben
4. System prüft:
   - Kauf < 14 Tage: automatische Genehmigung
   - Kauf > 14 Tage: manuelle Prüfung (3–5 Werktage)
5. Refund:
   - Wallet-Credit (nicht Cash) über Voucher-Betrag
   - License wird deaktiviert
   - Content bleibt (bis nächster App-Launch) oder sofort gesperrt
```

---

## Flow 8: Creator Auszahlung

```
1. Creator: Revenue Wallet: €840.50
2. Dashboard → "Auszahlen"
3. Betrag eingeben: €500
4. Bestätigung: "€500 werden auf dein Bankkonto überwiesen (1–3 Werktage)"
5. Stripe Connect Transfer
6. Revenue Wallet: €840.50 → €340.50
7. WalletTransaction: payout, €500, to_wallet=null
```

---

## Flow 9: Paid Boost (Creator)

```
1. Creator hat Produkt mit wenig Sichtbarkeit (Position ~45)
2. Dashboard → "Boost kaufen"
3. Optionen:
   [Tages-Boost] €9.99 → Top-10 Platzierung für 24h
   [Wochen-Boost] €49.99 → Top-10 für 7 Tage
   [Kategorie-Feature] €99/Woche → Exklusiver Category-Banner
   
4. Creator wählt Wochen-Boost
5. Bezahlt aus Revenue Wallet: €49.99
6. Promotion Slot wird aktiviert
7. Produkt erscheint in "Promoted" Sektion
8. Nach 7 Tagen: Analytics → 245 Views, 18 Käufe → ROI positiv
```

---

## Flow 10: Content Discovery mit Filter

```
1. User: Suche "hypertrophy 12 weeks"
2. Filter:
   Goal: [muscle_gain ✓]
   Typ: [Training Program] [Bundle ✓]
   Schwierigkeit: [Intermediate ✓]
   Max. Preis: [€60]
   
3. Ergebnis: 7 Produkte (2 promoted, 5 organisch)
4. User klickt "Rating" → höchste Bewertung zuerst
5. User klickt Produkt → Detail → Reviews lesen → Kauf
```

---

## Flow 11: Wallet Integration mit Abo

```
1. User zahlt €9.99/mo Lumeos Plus
2. Stripe-Charge erfolgreich
3. Cron (täglich): Abo-Renewal überprüfen
4. Voucher-Credit: +€9.99 ins Wallet
5. AI Credits: Reset auf 50 MealCam Scans
6. User sieht in Wallet: "+€9.99 (Monatliches Membership Goodwill)"
7. User kann sofort im Marketplace kaufen
```
