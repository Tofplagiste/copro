-- MIGRATION: Supprimer la colonne lot_id de owners
-- (Après avoir migré vers la table junction owner_lots)

-- Attention: Exécuter APRÈS create_owner_lots.sql

ALTER TABLE owners DROP COLUMN IF EXISTS lot_id;
