-- Tables à créer dans Supabase

-- Table expertises
CREATE TABLE expertises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sinistre_id UUID REFERENCES sinistres(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES users(id),
  date_designation TIMESTAMPTZ DEFAULT NOW(),
  date_expertise TIMESTAMPTZ,
  rapport TEXT,
  conclusion TEXT,
  montant_evalue DECIMAL(12,2),
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'planifiee', 'en_cours', 'terminee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table expertise_documents
CREATE TABLE expertise_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expertise_id UUID REFERENCES expertises(id) ON DELETE CASCADE,
  nom_fichier VARCHAR(255),
  url_fichier TEXT,
  type_document VARCHAR(50),
  taille_fichier BIGINT,
  type_mime VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table sinistre_communications
CREATE TABLE sinistre_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sinistre_id UUID REFERENCES sinistres(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'note' CHECK (type IN ('note', 'notification', 'message')),
  contenu TEXT,
  expediteur_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_expertises_sinistre ON expertises(sinistre_id);
CREATE INDEX idx_expertises_expert ON expertises(expert_id);
CREATE INDEX idx_communications_sinistre ON sinistre_communications(sinistre_id);