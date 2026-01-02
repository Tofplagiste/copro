-- ACTIVER LA SÉCURITÉ (RLS) ET DÉFINIR LES RÈGLES D'ACCÈS
-- Objectif : Lecture publique (tout le monde), Modification réservée aux utilisateurs connectés (Admins)

-- 1. Activer RLS sur toutes les tables Carnet
ALTER TABLE carnet_general ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_technique ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_prestataires ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_travaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;

-- 2. Créer les Policies (Si elles existent déjà, ignorez les erreurs ou supprimez-les avant)

-- TABLE: carnet_general
DROP POLICY IF EXISTS "Lecture Publique General" ON carnet_general;
CREATE POLICY "Lecture Publique General" ON carnet_general FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ecriture Admin General" ON carnet_general;
CREATE POLICY "Ecriture Admin General" ON carnet_general FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: carnet_admin
DROP POLICY IF EXISTS "Lecture Publique Admin" ON carnet_admin;
CREATE POLICY "Lecture Publique Admin" ON carnet_admin FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ecriture Admin Admin" ON carnet_admin;
CREATE POLICY "Ecriture Admin Admin" ON carnet_admin FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: carnet_technique
DROP POLICY IF EXISTS "Lecture Publique Technique" ON carnet_technique;
CREATE POLICY "Lecture Publique Technique" ON carnet_technique FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ecriture Admin Technique" ON carnet_technique;
CREATE POLICY "Ecriture Admin Technique" ON carnet_technique FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: carnet_prestataires
DROP POLICY IF EXISTS "Lecture Publique Prestataires" ON carnet_prestataires;
CREATE POLICY "Lecture Publique Prestataires" ON carnet_prestataires FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ecriture Admin Prestataires" ON carnet_prestataires;
CREATE POLICY "Ecriture Admin Prestataires" ON carnet_prestataires FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: carnet_travaux
DROP POLICY IF EXISTS "Lecture Publique Travaux" ON carnet_travaux;
CREATE POLICY "Lecture Publique Travaux" ON carnet_travaux FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ecriture Admin Travaux" ON carnet_travaux;
CREATE POLICY "Ecriture Admin Travaux" ON carnet_travaux FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: owners
DROP POLICY IF EXISTS "Lecture Publique Owners" ON owners;
CREATE POLICY "Lecture Publique Owners" ON owners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ecriture Admin Owners" ON owners;
CREATE POLICY "Ecriture Admin Owners" ON owners FOR ALL USING (auth.role() = 'authenticated');
