// lib/types/blockchain.ts
export interface BlockchainLot {
  id: string;
  numeroLot: string;
  codeUnique: string;
  medicamentCode: string;
  hashLot: string;
  quantiteTotale: string;
  dateFabrication: string;
  dateExpiration: string;
  exists: boolean;
}



export interface BlockchainMouvement {
  id: number;
  type_mouvement: string;
  quantite: number;
  hash_mouvement: string;
  commentaire: string;
  timestamp: number;
  emetteur: string;
  source_id?: string | null;
  destination_id?: string | null;
  raison?: string | null;
}

export interface BlockchainData {
  lot: BlockchainLot;
  mouvements: BlockchainMouvement[];
  mouvementCount: number;
}

export interface ChangeDetail {
  champ: string;
  valeur_blockchain: any;
  valeur_db: any;
  description: string;
}

export interface MouvementComparison {
  index: number;
  type: string;
  date: string;
  quantite: number | null;
  commentaire: string | null;
  db_hash: string;
  db_hash_recalculated: string;
  blockchain_hash: string | null;
  hash_db_intact: boolean;
  match: boolean | null;
  exists_on_blockchain: boolean;
  changes: ChangeDetail[];
  blockchain_data: {
    type: string;
    quantite: string;
    date: string;
    commentaire: string;
    emetteur: string;
    raison?: string;
  } | null;
}

export interface HashComparison {
  lot: {
    db_hash: string;
    db_hash_recalculated: string;
    blockchain_hash: string;
    match: boolean;
    db_hash_intact: boolean;
    changes: ChangeDetail[];
    blockchain_data: {
      numero_lot: string;
      code_unique: string;
      medicament_code: string;
      quantite: string;
      date_fabrication: string;
      date_expiration: string;
    };
  };
  mouvements: MouvementComparison[];
  missing_movements: BlockchainMouvement[];
  extra_movements: any[];
}

export interface VerificationResult {
  found: boolean;
  verified: boolean;
  integrity: boolean | null;
  modifications: string[];
  error: string | null;
  lot: {
    numero_lot: string;
    medicament_nom: string;
    medicament_code: string | null;
    date_fabrication: string;
    date_expiration: string;
    fabricant: string;
    blockchain_lot_id: number | null;
    quantite: number;
  } | null;
  hashComparison: HashComparison | null;
  detailsComparaison: {
    lot_changes: ChangeDetail[];
    mouvements_comparison: MouvementComparison[];
    missing_in_db: BlockchainMouvement[];
    extra_in_db: any[];
  } | null;
}
