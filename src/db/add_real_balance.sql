-- AJOUT DE LA COLONNE real_balance POUR LE POINTAGE BANCAIRE
-- Cette colonne stocke le "Solde Réel" saisi par l'utilisateur pour le rapprochement.

ALTER TABLE accounts
ADD COLUMN real_balance numeric DEFAULT 0;
