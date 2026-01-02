-- ACTIVER LA SÉCURITÉ (RLS) POUR LA TABLE LOTS
-- Accessibilité : Lecture publique, Écriture authentifiée

ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

-- Policy Lecture Publique
DROP POLICY IF EXISTS "Lecture Publique Lots" ON lots;
CREATE POLICY "Lecture Publique Lots" ON lots FOR SELECT USING (true);

-- Policy Écriture Admin
DROP POLICY IF EXISTS "Ecriture Admin Lots" ON lots;
CREATE POLICY "Ecriture Admin Lots" ON lots FOR ALL USING (auth.role() = 'authenticated');
