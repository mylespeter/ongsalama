-- Supprimer la table si elle existe
DROP TABLE IF EXISTS users CASCADE;

-- Recréer la table users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (
    role IN ('admin', 'agent', 'expert', 'assure')
  ),
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur email
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Index sur role
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Ajouter la colonne photo_profil à la table users
ALTER TABLE users 
ADD COLUMN photo_profil TEXT;

-- Commentaire sur la colonne
COMMENT ON COLUMN users.photo_profil IS 'Photo de profil en base64';

-- Insérer l'administrateur par défaut
INSERT INTO users (email, nom, telephone, mot_de_passe, role, first_login)
VALUES (
  'admin@sonas.cd',
  'Administrateur Système',
  '+243990664406',
  'Admin123!',
  'admin',
  false  -- L'admin ne sera pas en mode "première connexion"
);