

export interface Medicament {
  id: number;
  code_cis: string | null;
  nom: string;
  dosage: string | null;
  forme: string | null;
  type_unite: 'boite' | 'carton' | 'palette';
  description: string | null;
  image_base64: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Distributeur {
  id: number;
  type_acteur: 'fabricant' | 'grossiste' | 'pharmacie' | 'depot';
  nom: string;
  adresse: string | null;
  licence: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lot {
  id: number;
  medicament_id: number;
  numero_lot: string;
  created_by: string;
  fabricant_id: number;
  code_unique: string;
  hash_lot: string;
  qr_content: string | null;
  date_fabrication: string;
  date_expiration: string;
  quantite_totale: number;
  quantite_transferee?: number;  // Make optional
  quantite_restante?: number;    // Make optional
  created_at: string;
  updated_at: string;
  
  // Relations
  medicament?: Medicament;
  
  // Statut
  statut?: 'disponible' | 'partiel' | 'epuise' | 'expire';
  hasMovements?: boolean;
  isDeletable?: boolean;
  
  // ✅ Blockchain
  blockchain_lot_id?: string | null;
  transaction_hash?: string | null;
}

export interface Stock {
  id: number;
  lot_id: number;
  distributeur_id: number;
  quantite: number;
  type_unite: 'boite' | 'carton' | 'palette';
  coefficient: number;
  statut: 'disponible' | 'reserve' | 'vendu' | 'detruit';
  created_at: string;
  updated_at: string;
  lot?: Lot;
  distributeur?: Distributeur;
  
  // ✅ Blockchain
  blockchain_lot_id?: string | null;
  transaction_hash?: string | null;
}

export interface Mouvement {
  id: number;
  lot_id: number;
  type_mouvement: string;
  source_id?: number;
  destination_id?: number;
  quantite?: number;
  type_unite?: string;
  statut_avant?: string;
  statut_apres?: string;
  commentaire?: string;
  hash_mouvement: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  lot?: Lot;
  source?: {
    id: string;
    matricule: string;
    username: string;
    nom_entite: string;
    role: string;
  };
  destination?: {
    id: string;
    matricule: string;
    username: string;
    nom_entite: string;
    role: string;
  };
  
  // ✅ Blockchain
  transaction_hash?: string | null;
  
  // ✅ Métadonnées blockchain ajoutées par le serveur
  _blockchain?: {
    has_blockchain_lot: boolean;
    blockchain_lot_id: string | null;
    has_transaction: boolean;
    transaction_hash: string | null;
    verified_on_blockchain: boolean;
    block_number?: number | null;
  };
}

export interface Candidate {
  id: string;
  name: string;
  voteCount: string;
}

export interface Winner {
  name: string;
  voteCount: string;
}

export interface Account {
  address: string;
  balance: string;
  hasVoted: boolean;
}

// ✅ Nouveau type pour les résultats de vérification blockchain
export interface BlockchainVerificationResult {
  mouvement_id: number;
  hash: string;
  verified: boolean;
  blockchain_lot_id?: string | null;
  transaction_hash?: string | null;
  error?: string;
}

// ✅ Type pour les données de création de lot sur blockchain
export interface BlockchainLotData {
  numero_lot: string;
  code_unique: string;
  medicament_code: string;
  quantite_totale: number;
  date_fabrication: string;
  date_expiration: string;
}

// ✅ Type pour le résultat de création blockchain
export interface BlockchainTransactionResult {
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  blockchainLotId?: string;
}

// ✅ Type pour les données de mouvement sur blockchain
export interface BlockchainMouvementData {
  blockchainLotId: string;
  type_mouvement: string;
  quantite: number;
  commentaire: string;
}


// types/index.ts - Ajoutez ces types

// Type étendu pour les lots du distributeur (NE PAS étendre Lot pour éviter les conflits)
export interface DistributeurLot {
  // Infos de base du lot
  id: number;
  medicament_id: number;
  numero_lot: string;
  code_unique: string;
  hash_lot: string;
  qr_content: string | null;
  date_fabrication: string;
  date_expiration: string;
  quantite_totale: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  fabricant_id: number;
  blockchain_lot_id?: string | null;
  transaction_hash?: string | null;
  
  // Relation médicament
  medicament?: Medicament;
  
  // Infos de réception
  date_reception?: string;
  quantite_recue?: number;
  type_unite_recue?: string;
  fabriquant_nom?: string;
  fabriquant_id?: string;
  
  // Statistiques d'utilisation
  quantite_distribuee?: number;
  quantite_retiree?: number;
  quantite_restante?: number;
  quantite_transferee?: number;
  
  // Statut personnalisé pour le distributeur (inclut 'en_attente')
  statut_distributeur?: 'disponible' | 'partiel' | 'epuise' | 'expire' | 'en_attente';
  
  // Mouvements détaillés
  mouvementsDetail?: {
    total: number;
    distributions: number;
    retraits: number;
    transferts: number;
    receptions: number;
  };
  
  // Dernière activité
  derniere_activite?: {
    type: string;
    date: string;
    quantite: number;
  } | null;
  
  // Statut de réception
  statut_reception?: 'receptionne' | 'en_attente' | 'rejete';
}

// Type pour les transferts en attente
export interface TransfertEnAttente {
  id: number;
  lot_id: number;
  quantite: number;
  type_unite: string;
  created_at: string;
  statut: 'en_attente' | 'receptionne' | 'rejete';
  lot: Lot;
  source: {
    id: string;
    nom_entite: string;
    username: string;
    role: string;
  };
  destination: {
    id: string;
    nom_entite: string;
    username: string;
    role: string;
  };
}