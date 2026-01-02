-- FIX: DÉBLOQUER L'ACCÈS AUX DONNÉES CARNET (RLS)
-- Les tables créées via import CSV ont souvent la "Row Level Security" activée par défaut sans politique d'accès.
-- Cela empêche l'application de lire les données (rendu vide).

-- Option 1 : Désactiver la sécurité (Plus simple pour le développement)
ALTER TABLE carnet_general DISABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_admin DISABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_technique DISABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_prestataires DISABLE ROW LEVEL SECURITY;
ALTER TABLE carnet_travaux DISABLE ROW LEVEL SECURITY;
ALTER TABLE owners DISABLE ROW LEVEL SECURITY;

-- Option 2 (Alternative) : Si vous préférez garder la sécurité activée, ajoutez des politiques "Lecture pour tous" :
-- CREATE POLICY "Public Read" ON carnet_general FOR SELECT USING (true);
-- CREATE POLICY "Public Update" ON carnet_general FOR UPDATE USING (true);
-- (A répéter pour chaque table)
