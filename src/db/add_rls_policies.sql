-- =====================================================
-- RLS POLICIES TO ADD - Execute in Supabase SQL Editor
-- =====================================================
-- Run these policies ONE BY ONE or all at once in the SQL Editor

-- =====================================================
-- CREDIT SIMULATIONS POLICIES
-- =====================================================
CREATE POLICY "Approved users can read credit simulations"
    ON credit_simulations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Approved users can create credit simulations"
    ON credit_simulations FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Users can update own credit simulations"
    ON credit_simulations FOR UPDATE
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic')
    ));

CREATE POLICY "Users can delete own credit simulations"
    ON credit_simulations FOR DELETE
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic')
    ));

-- Credit Copros
CREATE POLICY "Approved users can read credit copros"
    ON credit_copros FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Approved users can manage credit copros"
    ON credit_copros FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

-- =====================================================
-- VOTE SESSIONS POLICIES
-- =====================================================
CREATE POLICY "Approved users can read vote sessions"
    ON vote_sessions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Approved users can create vote sessions"
    ON vote_sessions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Users can update own vote sessions"
    ON vote_sessions FOR UPDATE
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic')
    ));

CREATE POLICY "Users can delete own vote sessions"
    ON vote_sessions FOR DELETE
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic')
    ));

-- Vote Copros, Points, Participations
CREATE POLICY "Approved users can manage vote copros"
    ON vote_copros FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Approved users can manage vote points"
    ON vote_points FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Approved users can manage vote participations"
    ON vote_participations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

-- =====================================================
-- ACCOUNTS & FINANCE POLICIES
-- =====================================================
CREATE POLICY "Approved users can read accounts"
    ON accounts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Syndic can manage accounts"
    ON accounts FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic') AND is_approved = TRUE
    ));

CREATE POLICY "Approved users can read finance operations"
    ON finance_operations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
    ));

CREATE POLICY "Syndic can manage finance operations"
    ON finance_operations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'syndic') AND is_approved = TRUE
    ));
