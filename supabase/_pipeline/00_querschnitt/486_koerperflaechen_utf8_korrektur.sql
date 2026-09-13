-- C-486: Die Quelle war korrekt UTF-8; eine PowerShell-Textpipeline hatte
-- beim frueheren Live-Einspielen vier Umlaute zu `??` zerstoert. Dieser
-- Kettenschritt schreibt die kanonischen UTF-8-Werte wiederherstellbar aus.
BEGIN;

UPDATE public.koerperflaechen
SET name_de = CASE code
  WHEN 'external-oblique' THEN 'Aeussere schräge Bauchmuskeln'
  WHEN 'biceps-femoris' THEN 'Zweiköpfiger Oberschenkelmuskel'
  WHEN 'gluteus-maximus' THEN 'Grosser Gesässmuskel'
  WHEN 'gluteus-medius' THEN 'Mittlerer Gesässmuskel'
END
WHERE code IN ('external-oblique', 'biceps-femoris', 'gluteus-maximus', 'gluteus-medius');

DO $$
DECLARE
  v_bad integer;
BEGIN
  SELECT count(*) INTO v_bad
  FROM public.koerperflaechen
  WHERE art = 'muskel' AND name_de LIKE '%?%';
  IF v_bad <> 0 THEN
    RAISE EXCEPTION 'C-486: % deutscher Muskelkartenname(n) enthalten Fragezeichen', v_bad;
  END IF;
END $$;

COMMIT;
