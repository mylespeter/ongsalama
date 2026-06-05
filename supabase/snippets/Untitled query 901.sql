-- =============================================
-- CRÉATION DE LA TABLE DES SINISTRES
-- =============================================

-- Table des sinistres
CREATE TABLE sinistres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_dossier VARCHAR(20) UNIQUE NOT NULL,
  assure_id UUID NOT NULL REFERENCES users(id),
  type_sinistre VARCHAR(50) NOT NULL CHECK (
    type_sinistre IN (
      'accident_auto',
      'vol',
      'incendie',
      'degats_eau',
      'catastrophe_naturelle',
      'bris_glace',
      'responsabilite_civile',
      'autre'
    )
  ),
  description TEXT NOT NULL,
  date_sinistre TIMESTAMP WITH TIME ZONE NOT NULL,
  lieu VARCHAR(255) NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (
    statut IN ('en_attente', 'en_cours', 'expertise', 'accepte', 'refuse', 'cloture')
  ),
  montant_estime DECIMAL(12, 2),
  montant_indemnisation DECIMAL(12, 2),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  notes_internes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- =============================================
-- MISE À JOUR DE LA CONTRAINTE CHECK
-- =============================================

-- 1. Supprimer l'ancienne contrainte CHECK
ALTER TABLE sinistres DROP CONSTRAINT IF EXISTS sinistres_statut_check;

-- 2. Recréer la contrainte avec tous les statuts nécessaires
ALTER TABLE sinistres 
ADD CONSTRAINT sinistres_statut_check 
CHECK (
  statut IN (
    'en_attente', 
    'en_cours', 
    'expertise', 
    'accepte', 
    'refuse', 
    'cloture',
    'en_indemnisation'  -- ✅ Ajout du statut manquant
  )
);
-- Index sur sinistres
CREATE INDEX idx_sinistres_numero_dossier ON sinistres(numero_dossier);
CREATE INDEX idx_sinistres_assure_id ON sinistres(assure_id);
CREATE INDEX idx_sinistres_statut ON sinistres(statut);
CREATE INDEX idx_sinistres_date_sinistre ON sinistres(date_sinistre);
CREATE INDEX idx_sinistres_created_by ON sinistres(created_by);

-- Table des documents de sinistre
CREATE TABLE sinistre_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sinistre_id UUID NOT NULL REFERENCES sinistres(id) ON DELETE CASCADE,
  type_document VARCHAR(50) NOT NULL CHECK (
    type_document IN (
      'police_assurance',
      'rapport_police',
      'photo_dommage',
      'facture',
      'devis',
      'expertise',
      'constat_amiable',
      'autre_document'
    )
  ),
  nom_fichier VARCHAR(255) NOT NULL,
  url_fichier TEXT NOT NULL,
  taille_fichier INTEGER,
  type_mime VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur documents
CREATE INDEX idx_sinistre_documents_sinistre_id ON sinistre_documents(sinistre_id);
CREATE INDEX idx_sinistre_documents_type ON sinistre_documents(type_document);

-- Table de suivi des statuts
CREATE TABLE sinistre_historique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sinistre_id UUID NOT NULL REFERENCES sinistres(id) ON DELETE CASCADE,
  ancien_statut VARCHAR(20),
  nouveau_statut VARCHAR(20) NOT NULL,
  commentaire TEXT,
  modifie_par UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur historique
CREATE INDEX idx_sinistre_historique_sinistre_id ON sinistre_historique(sinistre_id);

-- Fonction pour générer le numéro de dossier automatiquement
CREATE OR REPLACE FUNCTION generate_numero_dossier()
RETURNS TRIGGER AS $$
DECLARE
  annee VARCHAR(4);
  compteur INTEGER;
  nouveau_numero VARCHAR(20);
BEGIN
  annee := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) + 1 INTO compteur
  FROM sinistres
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  nouveau_numero := 'SIN-' || annee || '-' || LPAD(compteur::VARCHAR, 6, '0');
  
  NEW.numero_dossier := nouveau_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le numéro de dossier
CREATE TRIGGER trigger_generate_numero_dossier
  BEFORE INSERT ON sinistres
  FOR EACH ROW
  EXECUTE FUNCTION generate_numero_dossier();

-- Fonction pour enregistrer l'historique des statuts
CREATE OR REPLACE FUNCTION log_sinistre_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.statut IS DISTINCT FROM NEW.statut) THEN
    INSERT INTO sinistre_historique (
      sinistre_id,
      ancien_statut,
      nouveau_statut,
      commentaire,
      modifie_par
    ) VALUES (
      NEW.id,
      OLD.statut,
      NEW.statut,
      'Statut modifié automatiquement',
      COALESCE(NEW.updated_by, NEW.created_by)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour l'historique des statuts
CREATE TRIGGER trigger_log_sinistre_status
  AFTER UPDATE ON sinistres
  FOR EACH ROW
  EXECUTE FUNCTION log_sinistre_status_change();









  -- =============================================
-- CRÉATION DU BUCKET + POLITIQUE PUBLIQUE
-- =============================================

-- 1. Créer le bucket 'sinistres' avec accès public
INSERT INTO storage.buckets (id, name, public)
VALUES ('sinistres', 'sinistres', true);

-- 2. Une seule politique publique pour TOUT (lecture, upload, modification, suppression)
CREATE POLICY "Public access to sinistres"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'sinistres')
  WITH CHECK (bucket_id = 'sinistres');



ALTER TABLE sinistres 
ADD COLUMN souscription_id UUID REFERENCES souscriptions(id) ON DELETE SET NULL;