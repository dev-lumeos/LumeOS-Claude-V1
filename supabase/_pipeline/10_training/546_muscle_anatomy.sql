BEGIN;

INSERT INTO training.anatomy_sources (
  id,
  name,
  url,
  source_kind,
  citation,
  published_year
)
VALUES
  (
    'fipat_ta2_2019_part2',
    'FIPAT Terminologia Anatomica, second edition, part 2',
    'https://fipat.library.dal.ca/wp-content/uploads/2020/09/FIPAT-TA2-Part-2.pdf',
    'terminology',
    'FIPAT. Terminologia Anatomica. 2nd ed. Part 2: Systemata musculoskeletalia.',
    2019
  ),
  (
    'ncbi_nbk482410_upper_limb_muscles',
    'NCBI Bookshelf: Anatomy, Shoulder and Upper Limb, Muscles',
    'https://www.ncbi.nlm.nih.gov/books/NBK482410/',
    'anatomy_reference',
    'Javed O, Maldonado KA, Ashmyan R. Anatomy, Shoulder and Upper Limb, Muscles. StatPearls.',
    2023
  ),
  (
    'ncbi_nbk537216_extrinsic_back',
    'NCBI Bookshelf: Anatomy, Back, Extrinsic Muscles',
    'https://www.ncbi.nlm.nih.gov/books/NBK537216/',
    'anatomy_reference',
    'Mitchell B, Imonugo O, Tripp JE. Anatomy, Back, Extrinsic Muscles. StatPearls.',
    2024
  ),
  (
    'ncbi_nbk537074_back_muscles',
    'NCBI Bookshelf: Anatomy, Back, Muscles',
    'https://www.ncbi.nlm.nih.gov/books/NBK537074/',
    'anatomy_reference',
    'Henson B, Kadiyala B, Edens MA. Anatomy, Back, Muscles. StatPearls.',
    2023
  ),
  (
    'ncbi_nbk532982_femur',
    'NCBI Bookshelf: Anatomy, Bony Pelvis and Lower Limb, Femur',
    'https://www.ncbi.nlm.nih.gov/books/NBK532982/',
    'anatomy_reference',
    'Anatomy, Bony Pelvis and Lower Limb, Femur. StatPearls.',
    2023
  )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    url = EXCLUDED.url,
    source_kind = EXCLUDED.source_kind,
    citation = EXCLUDED.citation,
    published_year = EXCLUDED.published_year;

WITH curated (muscle_name, attachment_site, source_id) AS (
  VALUES
    ('Pectoralis Major', 'Medial clavicle anteriorly; anterior sternum; costal cartilages of ribs 1-6; external oblique aponeurosis', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Pectoralis Minor', 'Ribs 3-5 near their costal cartilages', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Serratus Anterior', 'Lateral surfaces of ribs 1-8', 'ncbi_nbk482410_upper_limb_muscles'),
    ('latissimus dorsi', 'Spinous processes T7-T12; iliac crest; thoracolumbar fascia; inferior ribs', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Trapezius', 'Superior nuchal line; nuchal ligament; external occipital protuberance; spinous processes C7-T12', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Teres Major', 'Posterior surface of scapula at the inferior angle', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Supraspinatus', 'Supraspinous fossa of the posterior scapula', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Infraspinatus', 'Infraspinous fossa of the posterior scapula', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Teres Minor', 'Posterior surface of scapula near the inferior angle', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Subscapularis', 'Anterior surface of scapula', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Palmaris Longus', 'Medial epicondyle of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Flexor Digitorum Profundus', 'Medial and anterior proximal ulna; interosseous membrane', 'ncbi_nbk482410_upper_limb_muscles'),
    ('splenius capitis', 'Spinous processes C7 and T1-T3 or T4; supraspinous ligaments', 'ncbi_nbk537074_back_muscles'),
    ('Rectus Femoris', 'Anterior inferior iliac spine', 'ncbi_nbk532982_femur'),
    ('Vastus Medialis', 'Medial lip of linea aspera', 'ncbi_nbk532982_femur'),
    ('Vastus Lateralis', 'Greater trochanter; lateral lip of linea aspera', 'ncbi_nbk532982_femur'),
    ('Vastus Intermedius', 'Anterolateral femur', 'ncbi_nbk532982_femur'),
    ('Gluteus Medius', 'Posterior ilium between anterior and posterior gluteal lines', 'ncbi_nbk532982_femur'),
    ('Tensor Fasciae Latae', 'Anterior superior iliac spine', 'ncbi_nbk532982_femur'),
    ('piriformis', 'Anterior sacrum; sacrotuberous ligament', 'ncbi_nbk532982_femur')
)
INSERT INTO training.muscle_origins AS target (
  muscle_group_id,
  attachment_site,
  source_id
)
SELECT muscle.id, curated.attachment_site, curated.source_id
FROM curated
JOIN training.muscle_groups AS muscle ON muscle.name = curated.muscle_name
ON CONFLICT (muscle_group_id, attachment_site, source_id) DO NOTHING;

WITH curated (muscle_name, attachment_site, source_id) AS (
  VALUES
    ('Pectoralis Major', 'Lateral lip of intertubercular groove of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Pectoralis Minor', 'Coracoid process of scapula', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Serratus Anterior', 'Anterior surface of medial scapular border', 'ncbi_nbk482410_upper_limb_muscles'),
    ('latissimus dorsi', 'Intertubercular groove of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Trapezius', 'Spine of scapula; acromion; lateral clavicle', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Teres Major', 'Medial lip of intertubercular groove of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Supraspinatus', 'Superior facet of greater tubercle of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Infraspinatus', 'Middle facet of greater tubercle of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Teres Minor', 'Inferior facet of greater tubercle of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Subscapularis', 'Lesser tubercle of humerus', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Palmaris Longus', 'Flexor retinaculum', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Flexor Digitorum Profundus', 'Distal phalanges of fingers 2-5', 'ncbi_nbk482410_upper_limb_muscles'),
    ('splenius capitis', 'Mastoid process; lateral third of superior nuchal line', 'ncbi_nbk537074_back_muscles'),
    ('Rectus Femoris', 'Patella and tibial tuberosity via patellar tendon', 'ncbi_nbk532982_femur'),
    ('Vastus Medialis', 'Patella and tibial tuberosity via patellar tendon', 'ncbi_nbk532982_femur'),
    ('Vastus Lateralis', 'Patella and tibial tuberosity via patellar tendon', 'ncbi_nbk532982_femur'),
    ('Vastus Intermedius', 'Patella and tibial tuberosity via patellar tendon', 'ncbi_nbk532982_femur'),
    ('Gluteus Medius', 'Lateral aspect of greater trochanter of femur', 'ncbi_nbk532982_femur'),
    ('Gluteus Minimus', 'Lateral aspect of femur near greater trochanter', 'ncbi_nbk532982_femur'),
    ('Tensor Fasciae Latae', 'Gerdy tubercle of tibia through iliotibial tract', 'ncbi_nbk532982_femur'),
    ('piriformis', 'Superior border of greater trochanter of femur', 'ncbi_nbk532982_femur')
)
INSERT INTO training.muscle_insertions AS target (
  muscle_group_id,
  attachment_site,
  source_id
)
SELECT muscle.id, curated.attachment_site, curated.source_id
FROM curated
JOIN training.muscle_groups AS muscle ON muscle.name = curated.muscle_name
ON CONFLICT (muscle_group_id, attachment_site, source_id) DO NOTHING;

WITH curated (muscle_name, nerve_name, nerve_roots, source_id) AS (
  VALUES
    ('Pectoralis Major', 'Medial and lateral pectoral nerves', 'C5-T1', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Pectoralis Minor', 'Medial pectoral nerve', 'C8-T1', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Serratus Anterior', 'Long thoracic nerve', 'C5-C7', 'ncbi_nbk482410_upper_limb_muscles'),
    ('latissimus dorsi', 'Thoracodorsal nerve', 'C5-C7', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Trapezius', 'Spinal accessory nerve', 'CN XI', 'ncbi_nbk537216_extrinsic_back'),
    ('levator scapulae', 'Dorsal scapular nerve and cervical spinal nerve branches', 'C3-C5', 'ncbi_nbk537216_extrinsic_back'),
    ('Teres Major', 'Lower subscapular nerve', 'C5-C6', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Supraspinatus', 'Suprascapular nerve', 'C5-C6', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Infraspinatus', 'Suprascapular nerve', 'C5-C6', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Teres Minor', 'Axillary nerve', 'C5-C6', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Subscapularis', 'Upper and lower subscapular nerves', 'C5-C7', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Palmaris Longus', 'Median nerve', 'C7-C8', 'ncbi_nbk482410_upper_limb_muscles'),
    ('Flexor Digitorum Profundus', 'Ulnar and anterior interosseous nerves', 'C8-T1', 'ncbi_nbk482410_upper_limb_muscles'),
    ('splenius capitis', 'Lateral branches of dorsal rami', 'C2-C3', 'ncbi_nbk537074_back_muscles'),
    ('erector spinae', 'Dorsal rami of spinal nerves', NULL, 'ncbi_nbk537074_back_muscles'),
    ('Rectus Femoris', 'Femoral nerve', 'L2-L4', 'ncbi_nbk532982_femur'),
    ('Vastus Medialis', 'Femoral nerve', 'L2-L4', 'ncbi_nbk532982_femur'),
    ('Vastus Lateralis', 'Femoral nerve', 'L2-L4', 'ncbi_nbk532982_femur'),
    ('Vastus Intermedius', 'Femoral nerve', 'L2-L4', 'ncbi_nbk532982_femur'),
    ('Gluteus Medius', 'Superior gluteal nerve', 'L5-S1', 'ncbi_nbk532982_femur'),
    ('Gluteus Minimus', 'Superior gluteal nerve', 'L5-S1', 'ncbi_nbk532982_femur'),
    ('Tensor Fasciae Latae', 'Superior gluteal nerve', 'L5-S1', 'ncbi_nbk532982_femur'),
    ('piriformis', 'Ventral rami of spinal nerves', 'S1-S2', 'ncbi_nbk532982_femur')
)
INSERT INTO training.muscle_innervations AS target (
  muscle_group_id,
  nerve_name,
  nerve_roots,
  source_id
)
SELECT muscle.id, curated.nerve_name, curated.nerve_roots, curated.source_id
FROM curated
JOIN training.muscle_groups AS muscle ON muscle.name = curated.muscle_name
ON CONFLICT (muscle_group_id, nerve_name, source_id) DO UPDATE
SET nerve_roots = EXCLUDED.nerve_roots;

DO $$
DECLARE
  v_origins integer;
  v_insertions integer;
  v_innervations integer;
  v_referrals integer;
  v_covered integer;
  v_alias_facts integer;
BEGIN
  SELECT count(*) INTO v_origins FROM training.muscle_origins;
  SELECT count(*) INTO v_insertions FROM training.muscle_insertions;
  SELECT count(*) INTO v_innervations FROM training.muscle_innervations;
  SELECT count(*) INTO v_referrals FROM training.muscle_pain_referrals;

  SELECT count(DISTINCT muscle_group_id)
  INTO v_covered
  FROM (
    SELECT muscle_group_id FROM training.muscle_origins
    UNION ALL
    SELECT muscle_group_id FROM training.muscle_insertions
    UNION ALL
    SELECT muscle_group_id FROM training.muscle_innervations
    UNION ALL
    SELECT muscle_group_id FROM training.muscle_pain_referrals
  ) AS facts;

  SELECT count(*)
  INTO v_alias_facts
  FROM (
    SELECT muscle_group_id FROM training.muscle_origins
    UNION ALL
    SELECT muscle_group_id FROM training.muscle_insertions
    UNION ALL
    SELECT muscle_group_id FROM training.muscle_innervations
    UNION ALL
    SELECT muscle_group_id FROM training.muscle_pain_referrals
  ) AS facts
  JOIN training.muscle_groups AS muscle ON muscle.id = facts.muscle_group_id
  WHERE muscle.canonical_muscle_group_id IS NOT NULL;

  IF v_origins <> 20
     OR v_insertions <> 21
     OR v_innervations <> 23
     OR v_referrals <> 0
     OR v_covered <> 23
     OR v_alias_facts <> 0 THEN
    RAISE EXCEPTION
      'C-546: origins %, insertions %, innervations %, referrals %, covered %, alias facts %',
      v_origins,
      v_insertions,
      v_innervations,
      v_referrals,
      v_covered,
      v_alias_facts;
  END IF;
END $$;

COMMIT;
