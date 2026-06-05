-- Ajouter les colonnes manquantes à la table souscriptions
ALTER TABLE souscriptions 
ADD COLUMN IF NOT EXISTS date_expiration DATE,
ADD COLUMN IF NOT EXISTS prime DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS mode_paiement VARCHAR(20) DEFAULT 'annuel' CHECK (mode_paiement IN ('mensuel', 'trimestriel', 'semestriel', 'annuel')),
ADD COLUMN IF NOT EXISTS numero_assure_precedent VARCHAR(20);







-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS generer_numero_assure(UUID, UUID);

-- Nouvelle fonction avec vérification d'unicité
CREATE OR REPLACE FUNCTION generer_numero_assure(
  p_assure_id UUID,
  p_type_assurance_id UUID
) RETURNS VARCHAR(20) AS $$
DECLARE
  v_nombre_assurances INTEGER;
  v_prefix VARCHAR(2);
  v_code_agence VARCHAR(2) := '60';
  v_annee VARCHAR(4);
  v_increment VARCHAR(5);
  v_suffixe VARCHAR(1);
  v_type_code VARCHAR(50);
  v_numero_final VARCHAR(20);
  v_count_total INTEGER;
  v_anciennes_souscriptions RECORD;
  v_numero_existe BOOLEAN;
  v_tentatives INTEGER := 0;
BEGIN
  -- Récupérer le code du type d'assurance
  SELECT code INTO v_type_code FROM types_assurance WHERE id = p_type_assurance_id;
  
  -- Compter le nombre d'assurances EXISTANTES pour cet assuré
  SELECT COUNT(*) INTO v_nombre_assurances 
  FROM souscriptions 
  WHERE assure_id = p_assure_id AND statut != 'resiliee';
  
  -- Compter le nombre total de souscriptions
  SELECT COUNT(*) INTO v_count_total FROM souscriptions;
  
  -- Déterminer le préfixe
  IF v_type_code = 'rc' OR v_type_code = 'vie' THEN
    v_prefix := '13';
  ELSIF v_nombre_assurances >= 1 THEN
    v_prefix := '12';
  ELSE
    v_prefix := '10';
  END IF;
  
  -- Année en cours
  v_annee := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  
  -- Boucle pour garantir l'unicité du numéro
  LOOP
    v_tentatives := v_tentatives + 1;
    
    -- Incrément avec tentative
    v_increment := LPAD((v_count_total + v_tentatives)::VARCHAR, 5, '0');
    
    -- Suffixe conventionnel
    v_suffixe := CASE 
      WHEN MOD(v_count_total + v_tentatives, 4) = 1 THEN 'A'
      WHEN MOD(v_count_total + v_tentatives, 4) = 2 THEN 'B'
      WHEN MOD(v_count_total + v_tentatives, 4) = 3 THEN 'C'
      ELSE 'M'
    END;
    
    -- Assemblage du numéro
    v_numero_final := v_prefix || v_code_agence || v_annee || v_increment || v_suffixe;
    
    -- Vérifier si ce numéro existe déjà
    SELECT EXISTS(
      SELECT 1 FROM souscriptions WHERE numero_assure = v_numero_final
    ) INTO v_numero_existe;
    
    -- Sortir de la boucle si le numéro est unique
    EXIT WHEN NOT v_numero_existe OR v_tentatives > 100;
  END LOOP;
  
  -- Si après 100 tentatives on n'a pas trouvé, utiliser timestamp
  IF v_numero_existe THEN
    v_numero_final := v_prefix || v_code_agence || v_annee || 
                      LPAD(FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::VARCHAR, 5, '0') || 'X';
  END IF;
  
  -- Mise à jour des anciens numéros si nécessaire
  IF v_nombre_assurances = 1 THEN
    FOR v_anciennes_souscriptions IN 
      SELECT id, numero_assure FROM souscriptions 
      WHERE assure_id = p_assure_id AND statut != 'resiliee'
    LOOP
      UPDATE souscriptions 
      SET numero_assure = '12' || SUBSTRING(v_anciennes_souscriptions.numero_assure FROM 3),
          updated_at = NOW()
      WHERE id = v_anciennes_souscriptions.id;
    END LOOP;
  END IF;
  
  RETURN v_numero_final;
END;
$$ LANGUAGE plpgsql;