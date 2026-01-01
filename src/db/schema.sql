-- =====================================================
-- PHASE 3: SUPABASE SCHEMA - COPRO APP
-- =====================================================
-- 1. PROFILES (Linked to Supabase Auth)
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'syndic', 'user')),
    is_approved BOOLEAN DEFAULT FALSE,  -- Validation manuelle par admin
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 2. OWNERS (Copropriétaires)
-- =====================================================
CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- Optional link to a logged user
    name TEXT NOT NULL,
    apt TEXT,
    lot TEXT,
    tantiemes INTEGER NOT NULL DEFAULT 0,
    has_meter BOOLEAN DEFAULT TRUE,
    exo_gest BOOLEAN DEFAULT FALSE,  -- Exonération gestion
    exo_men BOOLEAN DEFAULT FALSE,   -- Exonération ménage
    email TEXT,
    phone TEXT,
    address TEXT,
    is_common BOOLEAN DEFAULT FALSE, -- Services communs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. ACCOUNTS (Comptes bancaires)
-- =====================================================
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,  -- e.g., "512-CIC"
    name TEXT NOT NULL,
    initial_balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. BUDGET ITEMS
-- =====================================================
CREATE TABLE budget_items (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('general', 'special', 'menage', 'travaux')),
    name TEXT NOT NULL,
    reel NUMERIC(12,2) DEFAULT 0,
    previ NUMERIC(12,2) DEFAULT 0,
    previ_n1 NUMERIC(12,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 5. WATER SETTINGS & READINGS
-- =====================================================
CREATE TABLE water_settings (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    active_quarter TEXT DEFAULT 'T1' CHECK (active_quarter IN ('T1', 'T2', 'T3', 'T4')),
    price_mode TEXT DEFAULT 'annual' CHECK (price_mode IN ('annual', 'manual', 'invoice')),
    invoice_total NUMERIC(12,2) DEFAULT 0,
    annual_total NUMERIC(12,2) DEFAULT 0,
    annual_sub NUMERIC(12,2) DEFAULT 0,  -- Subscription portion
    annual_vol NUMERIC(12,2) DEFAULT 0,  -- Annual volume
    manual_price NUMERIC(8,4) DEFAULT 0,
    sub_amount NUMERIC(12,2) DEFAULT 0,
    proj_price NUMERIC(8,4) DEFAULT 5.08,
    proj_sub NUMERIC(12,2) DEFAULT 92.21,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year)
);
CREATE TABLE water_readings (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter TEXT NOT NULL CHECK (quarter IN ('T1', 'T2', 'T3', 'T4')),
    old_value NUMERIC(12,2) DEFAULT 0,
    new_value NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, year, quarter)
);
CREATE TABLE water_meters (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE UNIQUE,
    meter_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE water_projections (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    projected_volume NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, year)
);
-- 6. FINANCE OPERATIONS
-- =====================================================
CREATE TABLE finance_operations (
    id SERIAL PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    due_date DATE,               -- Date échéance
    accounting_date DATE,        -- Date compta
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category_code TEXT,
    owner_id INTEGER REFERENCES owners(id) ON DELETE SET NULL,
    is_reconciled BOOLEAN DEFAULT FALSE,  -- Pointage
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 7. VOTE SESSIONS (AG)
-- =====================================================
CREATE TABLE vote_sessions (
    id SERIAL PRIMARY KEY,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Assemblée Générale',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    total_tantiemes INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE vote_copros (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES vote_sessions(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES owners(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    tantiemes INTEGER NOT NULL,
    presence TEXT CHECK (presence IN ('present', 'procuration', 'correspondance', 'absent')),
    procuration_to INTEGER REFERENCES vote_copros(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE vote_points (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES vote_sessions(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    article TEXT DEFAULT '24' CHECK (article IN ('24', '25', '26', 'unanimite')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE vote_participations (
    id SERIAL PRIMARY KEY,
    point_id INTEGER REFERENCES vote_points(id) ON DELETE CASCADE,
    copro_id INTEGER REFERENCES vote_copros(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('pour', 'contre', 'abstention')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(point_id, copro_id)
);
-- 8. CREDIT SIMULATIONS
-- =====================================================
CREATE TABLE credit_simulations (
    id SERIAL PRIMARY KEY,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT DEFAULT 'Simulation Crédit',
    duree INTEGER DEFAULT 120,  -- Months
    taux_nominal NUMERIC(6,3) DEFAULT 3.5,
    taux_assurance NUMERIC(6,3) DEFAULT 0.36,
    fonds_travaux NUMERIC(12,2) DEFAULT 0,
    parties_communes NUMERIC(12,2) DEFAULT 0,
    grand_balcon NUMERIC(12,2) DEFAULT 0,
    petits_balcons NUMERIC(12,2) DEFAULT 0,
    celliers NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE credit_copros (
    id SERIAL PRIMARY KEY,
    simulation_id INTEGER REFERENCES credit_simulations(id) ON DELETE CASCADE,
    copro_name TEXT NOT NULL,
    commune TEXT,
    lot TEXT,
    tantiemes INTEGER DEFAULT 0,
    a_cellier BOOLEAN DEFAULT FALSE,
    a_balcon BOOLEAN DEFAULT FALSE,
    grand_balcon BOOLEAN DEFAULT FALSE,
    tant_cellier INTEGER DEFAULT 0,
    apport_personnel NUMERIC(12,2) DEFAULT 0,
    paiement_comptant BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 9. CARNET SECTIONS
-- =====================================================
CREATE TABLE carnet_general (
    id SERIAL PRIMARY KEY,
    address TEXT,
    lots_description TEXT,
    reglement TEXT,
    modifications TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE carnet_admin (
    id SERIAL PRIMARY KEY,
    syndic_name TEXT,
    syndic_address TEXT,
    syndic_phone TEXT,
    ag_nomination DATE,
    fin_mandat DATE,
    conseil_syndical JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE carnet_technique (
    id SERIAL PRIMARY KEY,
    construction TEXT,
    surface TEXT,
    toiture TEXT,
    facade TEXT,
    code_peinture TEXT,
    chauffage TEXT,
    eau_chaude TEXT,
    diagnostics JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE carnet_prestataires (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contrat TEXT,
    contact TEXT,
    phones JSONB DEFAULT '[]'::jsonb,
    emails JSONB DEFAULT '[]'::jsonb,
    address TEXT,
    codes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE carnet_travaux (
    id SERIAL PRIMARY KEY,
    annee TEXT NOT NULL,
    nature TEXT NOT NULL,
    entreprise TEXT,
    cout TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 10. EXPENSE CATEGORIES
-- =====================================================
CREATE TABLE expense_categories (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL
);
-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_copros ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_copros ENABLE ROW LEVEL SECURITY;

-- Fonction Helper pour éviter la boucle infinie
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy Profiles : Chacun voit le sien, l'admin voit tout
CREATE POLICY "Users and Admins Access" ON profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR public.is_admin() = true
    );

-- Policy Owners : Lecture pour les approuvés
CREATE POLICY "Approved users can read owners"
    ON owners FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));
    
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
-- Approved users can read all data
CREATE POLICY "Approved users can read owners"
    ON owners FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));
CREATE POLICY "Approved users can read budget"
    ON budget_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));
-- Syndic/Admin can modify data
CREATE POLICY "Syndic can manage owners"
    ON owners FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic') AND is_approved = TRUE
    ));
CREATE POLICY "Syndic can manage budget"
    ON budget_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic') AND is_approved = TRUE
    ));
-- Similar policies for other tables...
-- (Add remaining policies as needed in production)
-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_owners_profile ON owners(profile_id);
CREATE INDEX idx_water_readings_owner ON water_readings(owner_id, year);
CREATE INDEX idx_finance_operations_date ON finance_operations(date);
CREATE INDEX idx_vote_copros_session ON vote_copros(session_id);
CREATE INDEX idx_vote_points_session ON vote_points(session_id);
CREATE INDEX idx_credit_copros_simulation ON credit_copros(simulation_id);