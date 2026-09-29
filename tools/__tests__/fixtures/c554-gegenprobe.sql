-- C-554 Gegenprobe: dieselbe Datei muss beide Messrichtungen zeigen.
CREATE TABLE goals.c554_nachweis_da (
  id integer PRIMARY KEY
);

CREATE VIEW goals.c554_erfundene_sicht AS
SELECT 1 AS wert;
