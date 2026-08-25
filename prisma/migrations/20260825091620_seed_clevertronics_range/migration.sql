-- Replace the generic Clevertronics placeholder entries with the real
-- product ranges listed on clevertronics.com.au (exit-lights and
-- emergency-lights sections). Placeholders are only removed when no
-- fitting references them, so nothing already recorded loses its model.
-- Still no photoPath: real reference photos attach as businesses
-- photograph the actual devices (see 20260825090300 for rationale).

DELETE FROM "FittingModel"
WHERE "id" IN (
  'seed-clevertronics-exit-single',
  'seed-clevertronics-exit-double',
  'seed-clevertronics-batten',
  'seed-clevertronics-downlight',
  'seed-clevertronics-combined'
)
AND "id" NOT IN (SELECT "modelId" FROM "Fitting" WHERE "modelId" IS NOT NULL);

-- Exit lights
INSERT INTO "FittingModel" ("id", "businessId", "brand", "model", "fittingType") VALUES
  ('seed-clev-spirit', NULL, 'Clevertronics', 'Spirit Exit', 'EXIT_SIGN'),
  ('seed-clev-cleverfit', NULL, 'Clevertronics', 'Cleverfit Exit', 'EXIT_SIGN'),
  ('seed-clev-cleverfit-pro', NULL, 'Clevertronics', 'Cleverfit PRO Exit', 'EXIT_SIGN'),
  ('seed-clev-glider-blade', NULL, 'Clevertronics', 'Glider Blade Exit', 'EXIT_SIGN'),
  ('seed-clev-swingblade', NULL, 'Clevertronics', 'Swingblade Exit', 'EXIT_SIGN'),
  ('seed-clev-ultrablade-pro-sm', NULL, 'Clevertronics', 'Ultrablade PRO Surface Mount Exit', 'EXIT_SIGN'),
  ('seed-clev-ultrablade-pro-rec', NULL, 'Clevertronics', 'Ultrablade PRO Recessed Exit', 'EXIT_SIGN'),
  ('seed-clev-form', NULL, 'Clevertronics', 'Form Exit', 'EXIT_SIGN'),
  ('seed-clev-boxlite', NULL, 'Clevertronics', 'Boxlite Exit', 'EXIT_SIGN'),
  ('seed-clev-jumbo', NULL, 'Clevertronics', 'Jumbo Exit (50m viewing)', 'EXIT_SIGN'),
  ('seed-clev-gigantor', NULL, 'Clevertronics', 'Gigantor Exit', 'EXIT_SIGN'),
  ('seed-clev-wp-exit-24', NULL, 'Clevertronics', 'Weatherproof Exit (24m)', 'EXIT_SIGN'),
  ('seed-clev-wp-exit-40', NULL, 'Clevertronics', 'Weatherproof Exit (40m)', 'EXIT_SIGN'),
  ('seed-clev-lt-exit-24', NULL, 'Clevertronics', 'Low Temperature Exit (24m)', 'EXIT_SIGN'),
  ('seed-clev-lt-exit-40', NULL, 'Clevertronics', 'Low Temperature Exit (40m)', 'EXIT_SIGN'),
  ('seed-clev-vandal-exit', NULL, 'Clevertronics', 'Vandal Resistant Exit', 'EXIT_SIGN'),
  ('seed-clev-theatre-exit', NULL, 'Clevertronics', 'Theatre Exit', 'EXIT_SIGN');

-- Emergency lights
INSERT INTO "FittingModel" ("id", "businessId", "brand", "model", "fittingType") VALUES
  ('seed-clev-lifelight-rec', NULL, 'Clevertronics', 'Lifelight Recessed', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-corridor', NULL, 'Clevertronics', 'Lifelight Corridor Lens', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-sm', NULL, 'Clevertronics', 'Lifelight Surface Mount', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-wp-sm', NULL, 'Clevertronics', 'Lifelight Weatherproof Surface Mount', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-warehouse', NULL, 'Clevertronics', 'Lifelight Surface Mount Warehouse Lens', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-track', NULL, 'Clevertronics', 'Lifelight Track Mount', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-pro-rec', NULL, 'Clevertronics', 'Lifelight PRO Recessed', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-pro-sm', NULL, 'Clevertronics', 'Lifelight PRO Surface Mount', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-pro-cyl', NULL, 'Clevertronics', 'Lifelight PRO Cylinder Surface Mount', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-pro-wp', NULL, 'Clevertronics', 'Lifelight PRO Weatherproof Surface Mount', 'EMERGENCY_LIGHT'),
  ('seed-clev-lifelight-pro-lt', NULL, 'Clevertronics', 'Lifelight PRO Low Temperature', 'EMERGENCY_LIGHT'),
  ('seed-clev-bare-emerg-batten', NULL, 'Clevertronics', 'Bare Emergency Batten', 'EMERGENCY_LIGHT'),
  ('seed-clev-lp-wp-batten', NULL, 'Clevertronics', 'LP Premium Weatherproof Batten', 'EMERGENCY_LIGHT');
