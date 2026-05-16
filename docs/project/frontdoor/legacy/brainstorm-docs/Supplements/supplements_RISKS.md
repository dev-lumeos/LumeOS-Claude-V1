# Supplements Module  Risks

## Zweck

Dieses Dokument definiert Risiken und No-Go-Kombinationen für:

- Supplements  
- Enhanced Substances (PEDs)  

Es liefert die fachliche Basis für:

- Interaction Checker  
- Warnings  
- Blocks (harte Verbote)  

---

## Risikokategorien

### 1. Interaktionen (Supplement  Supplement)

Beispiele:

- Zink + Eisen gleichzeitig  
- Calcium + Eisen gleichzeitig  
- Magnesium + Antibiotika  
- Fettlösliche Vitamine (A, D, E, K) in extremer Überdosierung  

Regel:
- Diese Kombinationen erzeugen mindestens eine **Warnung**.
- Severity wird durch `supplement_interactions` bestimmt.

---

### 2. Interaktionen (Supplement  Enhanced)

Beispiele:

- Stimulants + Clenbuterol  
- Koffein + Ephedrin  
- Blutdrucksenker + Stimulants  
- Lebertoxische Supplements + orale Steroide  

Regel:
- Diese Kombinationen erzeugen **Warnung oder Block**.
- Severity ist regelbasiert, nicht subjektiv.

---

### 3. Interaktionen (Enhanced  Enhanced)

Beispiele:

- Mehrere 17aa Steroide gleichzeitig  
- Mehrere Stimulants gleichzeitig  
- Mehrere stark prolaktinerhöhende Substanzen  
- Mehrere stark hepatotoxische Substanzen  

Regel:
- Kombinationen können als **Block** markiert werden.

---

## Dosisbezogene Risiken

### Supplements

- Überschreitung von UL (Upper Limit) erzeugt Warnung  
- Dauerhafte Hochdosis erzeugt Risiko-Flag  
- Kombination mehrerer Quellen desselben Wirkstoffs wird addiert  

Beispiel:
- Zink aus Multi + Zink einzeln  
- Vitamin D aus Kapsel + angereicherte Nahrung  

---

### Enhanced

- Dosis über Referenzbereich erzeugt Warnung  
- Kombination mehrerer Substanzen mit gleicher Achse erzeugt Warnung oder Block  

Beispiele:
- Testosteron + Trenbolon  
- Trenbolon + Winstrol  
- Anadrol + Dianabol  

---

## Organbezogene Risiken

### Leber

Trigger:

- 17aa orale Steroide  
- Alkohol + orale Steroide  
- Lebertoxische Supplements  

Severity:
- Warnung oder Block

---

### Herz-Kreislauf

Trigger:

- Stimulants  
- Clenbuterol  
- Ephedrin  
- Hohe Hämatokrit-Werte (Medical Layer)  

Severity:
- Warnung oder Block

---

### Hormonachsen

Trigger:

- Mehrere HPTA-suppressive Substanzen  
- Mehrere prolaktinerhöhende Substanzen  

Severity:
- Warnung oder Block

---

## Medical Cross-Checks

Wenn Medical Layer aktiv ist:

- Blutwerte können Risiko verstärken  
- Medikamente können Risiko verstärken  

Beispiele:

- Erhöhte Leberwerte + orale Steroide  
- Bluthochdruck + Stimulants  
- Statine + Lebertoxika  

---

## Regeltypen

Jede Risiko-Regel hat:

- rule_id  
- scope (supplement | enhanced | cross)  
- trigger (Substanzen oder Klassen)  
- severity (info | warn | block)  
- message  

Keine freie Textlogik.  
Keine KI-Interpretation.

---

## UX-Regeln

- Info = Hinweis  
- Warn = gelb  
- Block = rot  

Block bedeutet:
- Stack kann gespeichert werden  
- Einnahme darf nicht bestätigt werden  

---

## Non-Scope

Dieses Modul:

- gibt keine medizinischen Therapieanweisungen  
- ersetzt keinen Arzt  
- berechnet keine Blutwerte  

Es zeigt nur Risiken basierend auf Regeln.
