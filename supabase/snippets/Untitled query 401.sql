-- Table des types d'assurance
CREATE TABLE types_assurance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion des types d'assurance
INSERT INTO types_assurance (code, nom, description) VALUES
('automobile', 'Assurance Automobile', 'Assurance obligatoire pour véhicules terrestres à moteur'),
('incendie', 'Assurance Incendie', 'Assurance obligatoire contre les risques d''incendie'),
('transport', 'Assurance Transport', 'Assurance maritime, terrestre et aérien'),
('rc', 'Assurance Responsabilité Civile', 'Responsabilité civile professionnelle ou exploitation'),
('vie', 'Assurance Vie et Accidents', 'Assurance vie et accidents corporels');

-- Table des souscriptions
CREATE TABLE souscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_assure VARCHAR(20) UNIQUE NOT NULL,
  assure_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type_assurance_id UUID REFERENCES types_assurance(id) ON DELETE RESTRICT,
  date_souscription DATE NOT NULL DEFAULT CURRENT_DATE,
  statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active', 'suspendue', 'resiliee', 'expiree')),
  date_expiration DATE,
  montant_prime DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Table des documents de souscription
CREATE TABLE souscription_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  souscription_id UUID REFERENCES souscriptions(id) ON DELETE CASCADE,
  type_document VARCHAR(100) NOT NULL,
  nom_fichier VARCHAR(255) NOT NULL,
  url_fichier TEXT NOT NULL,
  taille_fichier BIGINT,
  type_mime VARCHAR(100),
  est_obligatoire BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_souscriptions_assure ON souscriptions(assure_id);
CREATE INDEX idx_souscriptions_type ON souscriptions(type_assurance_id);
CREATE INDEX idx_souscriptions_numero ON souscriptions(numero_assure);
CREATE INDEX idx_souscription_documents_souscription ON souscription_documents(souscription_id);


CREATE POLICY "Allow all operations" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'souscriptions')
WITH CHECK (bucket_id = 'souscriptions');