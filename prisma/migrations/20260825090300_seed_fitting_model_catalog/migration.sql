-- Starter set of common AS/NZS-market emergency lighting brands, shared
-- across every business (businessId NULL). Model names are deliberately
-- generic descriptors rather than specific product-line names or SKUs,
-- since those can't be reliably sourced/verified here — brand recognition
-- is what actually helps a technician pick the right entry from a list.
-- No photoPath: a real reference photo is added by whichever business
-- first actually uses a given entry, since that's the only way to
-- guarantee the photo matches the real device.
INSERT INTO "FittingModel" ("id", "businessId", "brand", "model", "fittingType") VALUES
  ('seed-clevertronics-exit-single', NULL, 'Clevertronics', 'LED Exit Sign (Single Face)', 'EXIT_SIGN'),
  ('seed-clevertronics-exit-double', NULL, 'Clevertronics', 'LED Exit Sign (Double Face)', 'EXIT_SIGN'),
  ('seed-clevertronics-batten', NULL, 'Clevertronics', 'LED Emergency Batten', 'EMERGENCY_LIGHT'),
  ('seed-clevertronics-downlight', NULL, 'Clevertronics', 'LED Emergency Downlight', 'EMERGENCY_LIGHT'),
  ('seed-clevertronics-combined', NULL, 'Clevertronics', 'Combined Exit/Emergency Light', 'COMBINED'),
  ('seed-advance-exit', NULL, 'Advance', 'LED Exit Sign', 'EXIT_SIGN'),
  ('seed-advance-downlight', NULL, 'Advance', 'LED Emergency Downlight', 'EMERGENCY_LIGHT'),
  ('seed-advance-combined', NULL, 'Advance', 'Combined Exit/Emergency Light', 'COMBINED'),
  ('seed-legrand-exit', NULL, 'Legrand', 'LED Exit Sign', 'EXIT_SIGN'),
  ('seed-legrand-downlight', NULL, 'Legrand', 'LED Emergency Downlight', 'EMERGENCY_LIGHT'),
  ('seed-emergilite-exit', NULL, 'Emergi-Lite', 'LED Exit Sign', 'EXIT_SIGN'),
  ('seed-emergilite-batten', NULL, 'Emergi-Lite', 'LED Emergency Batten', 'EMERGENCY_LIGHT'),
  ('seed-eaton-exit', NULL, 'Eaton', 'LED Exit Sign', 'EXIT_SIGN'),
  ('seed-eaton-downlight', NULL, 'Eaton', 'LED Emergency Downlight', 'EMERGENCY_LIGHT'),
  ('seed-thorn-exit', NULL, 'Thorn', 'LED Exit Sign', 'EXIT_SIGN'),
  ('seed-thorn-batten', NULL, 'Thorn', 'LED Emergency Batten', 'EMERGENCY_LIGHT'),
  ('seed-weilbach-exit', NULL, 'Weilbach', 'LED Exit Sign', 'EXIT_SIGN'),
  ('seed-weilbach-combined', NULL, 'Weilbach', 'Combined Exit/Emergency Light', 'COMBINED');
