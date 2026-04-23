# Scope Rules

## Harte Grenzen für alle Agents

### scope_files ist absolut
- Nur Files in scope_files dürfen geändert werden
- Jede andere File-Änderung = guardrail_violation
- Kein "während ich schon dabei bin"

### Max 3 Files pro Micro WO
- Mehr als 3 Files = Macro WO oder WO split
- Discovery WOs sind ausgenommen (read-only)

### Layer-Trennung
- Ein WO = ein Layer
- Kein Mix: types + service in einem WO verboten
- Kein Mix: service + ui in einem WO verboten

### Infra gesperrt
- infra/ Files nur mit infra_override_approved: true
- Ohne Override: sofortiger Abbruch
