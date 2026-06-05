-- =============================================
-- AJOUT DES COLONNES MANQUANTES À sinistre_communications
-- =============================================

-- 1. Ajouter la colonne priorite
ALTER TABLE sinistre_communications 
ADD COLUMN IF NOT EXISTS priorite VARCHAR(20) DEFAULT 'normal' 
CHECK (priorite IN ('normal', 'urgent', 'critique'));

-- 2. Ajouter la colonne statut_reclamation
ALTER TABLE sinistre_communications 
ADD COLUMN IF NOT EXISTS statut_reclamation VARCHAR(20) DEFAULT 'ouverte' 
CHECK (statut_reclamation IN ('ouverte', 'en_cours', 'resolue', 'fermee'));

-- 3. Ajouter la colonne sinistre_id si elle n'existe pas déjà
-- ALTER TABLE sinistre_communications 
-- ADD COLUMN IF NOT EXISTS sinistre_id UUID REFERENCES sinistres(id) ON DELETE CASCADE;

-- 4. Ajouter la colonne expediteur_id si elle n'existe pas déjà
-- ALTER TABLE sinistre_communications 
-- ADD COLUMN IF NOT EXISTS expediteur_id UUID REFERENCES users(id);

-- 5. Créer des index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_communications_priorite 
ON sinistre_communications(priorite);

CREATE INDEX IF NOT EXISTS idx_communications_statut_reclamation 
ON sinistre_communications(statut_reclamation);

-- 6. Mettre à jour la contrainte CHECK du type si nécessaire
ALTER TABLE sinistre_communications 
DROP CONSTRAINT IF EXISTS sinistre_communications_type_check;

ALTER TABLE sinistre_communications 
ADD CONSTRAINT sinistre_communications_type_check 
CHECK (type IN ('note', 'notification', 'message', 'reclamation'));