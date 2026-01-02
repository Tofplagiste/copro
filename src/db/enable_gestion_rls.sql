-- ACTIVER LA SÉCURITÉ (RLS) POUR LE MODULE GESTION (STRICT ADMIN)
-- Accessibilité : UNIQUEMENT les utilisateurs connectés (Admins)
-- Tables : budget_items, accounts, finance_operations, expense_categories

-- 1. Activer RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- 2. Créer les Policies (Restreintes aux utilisateurs authentifiés)

-- TABLE: budget_items
DROP POLICY IF EXISTS "Lecture Publique Budget" ON budget_items; -- Suppression ancienne regle publique
DROP POLICY IF EXISTS "Acces Admin Budget" ON budget_items;
CREATE POLICY "Acces Admin Budget" ON budget_items FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: accounts
DROP POLICY IF EXISTS "Lecture Publique Accounts" ON accounts;
DROP POLICY IF EXISTS "Acces Admin Accounts" ON accounts;
CREATE POLICY "Acces Admin Accounts" ON accounts FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: finance_operations
DROP POLICY IF EXISTS "Lecture Publique Operations" ON finance_operations;
DROP POLICY IF EXISTS "Acces Admin Operations" ON finance_operations;
CREATE POLICY "Acces Admin Operations" ON finance_operations FOR ALL USING (auth.role() = 'authenticated');

-- TABLE: expense_categories
DROP POLICY IF EXISTS "Lecture Publique CatDepenses" ON expense_categories;
DROP POLICY IF EXISTS "Acces Admin CatDepenses" ON expense_categories;
CREATE POLICY "Acces Admin CatDepenses" ON expense_categories FOR ALL USING (auth.role() = 'authenticated');
