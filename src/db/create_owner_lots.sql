-- CRÉATION DE LA TABLE JUNCTION OWNER_LOTS
-- Permet à un propriétaire de posséder plusieurs lots

CREATE TABLE IF NOT EXISTS owner_lots (
  owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  lot_id INTEGER NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (owner_id, lot_id)
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_owner_lots_owner ON owner_lots(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_lots_lot ON owner_lots(lot_id);

-- RLS
ALTER TABLE owner_lots ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "Lecture Publique Owner Lots" ON owner_lots;
CREATE POLICY "Lecture Publique Owner Lots" ON owner_lots FOR SELECT USING (true);

-- Écriture admin
DROP POLICY IF EXISTS "Ecriture Admin Owner Lots" ON owner_lots;
CREATE POLICY "Ecriture Admin Owner Lots" ON owner_lots FOR ALL USING (auth.role() = 'authenticated');

-- MIGRATION: Copier les relations existantes depuis owners.lot_id
INSERT INTO owner_lots (owner_id, lot_id)
SELECT id, lot_id FROM owners WHERE lot_id IS NOT NULL
ON CONFLICT DO NOTHING;
