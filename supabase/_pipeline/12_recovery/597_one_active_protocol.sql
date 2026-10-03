-- G-597: Die Datenbank, nicht ein einzelner Schreibweg, garantiert hoechstens
-- ein laufendes Recovery-Protokoll je Nutzer. Historische Zeilen bleiben frei.
CREATE UNIQUE INDEX IF NOT EXISTS uq_recovery_protocols_one_active
  ON recovery.recovery_protocols (user_id)
  WHERE status = 'active';
