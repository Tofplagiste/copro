-- ACTIVER LA SÉCURITÉ (RLS) POUR LE MODULE EAU
-- Accessibilité : UNIQUEMENT les utilisateurs connectés (Admins)
-- Tables : water_settings, water_readings, water_meters

-- 1. Activer RLS
ALTER TABLE water_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_meters ENABLE ROW LEVEL SECURITY;

-- 2. Créer les Policies (Restreintes aux utilisateurs authentifiés)

-- TABLE: water_settings
DROP POLICY IF EXISTS "Lecture Admin WaterSettings" ON water_settings;
DROP POLICY IF EXISTS "Modif Admin WaterSettings" ON water_settings;
-- Lecture : Tout le monde authentifié
CREATE POLICY "Lecture Admin WaterSettings" ON water_settings FOR SELECT USING (auth.role() = 'authenticated');
-- Modification : Tout le monde authentifié (ou restreint aux admins si rôle existe)
CREATE POLICY "Modif Admin WaterSettings" ON water_settings FOR ALL USING (auth.role() = 'authenticated');


-- TABLE: water_readings
DROP POLICY IF EXISTS "Lecture Admin WaterReadings" ON water_readings;
DROP POLICY IF EXISTS "Modif Admin WaterReadings" ON water_readings;
CREATE POLICY "Lecture Admin WaterReadings" ON water_readings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Modif Admin WaterReadings" ON water_readings FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: water_meters
DROP POLICY IF EXISTS "Lecture Admin WaterMeters" ON water_meters;
DROP POLICY IF EXISTS "Modif Admin WaterMeters" ON water_meters;
CREATE POLICY "Lecture Admin WaterMeters" ON water_meters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Modif Admin WaterMeters" ON water_meters FOR ALL USING (auth.role() = 'authenticated');
