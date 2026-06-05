-- Ajouter les colonnes à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_naissance DATE,
ADD COLUMN IF NOT EXISTS sexe VARCHAR(10) CHECK (sexe IN ('M', 'F', 'autre')),
ADD COLUMN IF NOT EXISTS profession VARCHAR(255),
ADD COLUMN IF NOT EXISTS adresse TEXT;