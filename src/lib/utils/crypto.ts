

// lib/utils/crypto.ts
import crypto from 'crypto';

// ===============================
// NUMÉRO DE LOT
// ===============================
export function generateLotNumber(): string {
  const date = new Date();

  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const random = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `LOT-${year}${month}-${random}`;
}

// ===============================
// HASH GÉNÉRIQUE
// ===============================
export function generateHash(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

// ===============================
// HASH LOT
// ===============================
export function generateLotHash(data: {
  medicament_id: number;
  numero_lot: string;
  code_unique: string;
  date_fabrication: string;
  date_expiration: string;
  quantite_totale: number;
}): string {

  const content = JSON.stringify({
    medicament_id: data.medicament_id,
    numero_lot: data.numero_lot,
    code_unique: data.code_unique,
    date_fabrication: data.date_fabrication,
    date_expiration: data.date_expiration,
    quantite_totale: data.quantite_totale,
  });

  return generateHash(content);
}

// ===============================
// HASH MOUVEMENT (FONCTION DE BASE)
// ===============================
export function generateMouvementHash(data: {
  lot_id: number;
  type: string;
  quantite?: number | null;
  source_id?: string | number | null;
  destination_id?: string | number | null;
  transfert_id?: number | null;
  user_id?: string | number | null;
  entite?: string | null;
  raison?: string | null;
  commentaire?: string | null;
  blockchain_tx?: string | null;
  created_by?: string | null;
  timestamp: string;
}): string {
  
  // ✅ Normaliser les données : convertir undefined en null
  // pour garantir que JSON.stringify produit toujours le même résultat
  const normalized = {
    lot_id: data.lot_id,
    type: data.type,
    quantite: data.quantite ?? null,
    source_id: data.source_id ?? null,
    destination_id: data.destination_id ?? null,
    transfert_id: data.transfert_id ?? null,
    user_id: data.user_id ?? null,
    entite: data.entite ?? null,
    raison: data.raison ?? null,
    commentaire: data.commentaire ?? null,
    blockchain_tx: data.blockchain_tx || null,  // string vide aussi → null
    created_by: data.created_by ?? null,
    timestamp: data.timestamp,
  };

  const content = JSON.stringify(normalized);
  
  return generateHash(content);
}



// ===============================
// VÉRIFIER HASH BLOCKCHAIN
// ===============================
export function verifyBlockchainHash(data: string, hash: string): boolean {
  const computedHash = generateHash(data);
  return computedHash === hash;
}

// ===============================
// GÉNÉRER CODE UNIQUE
// ===============================
export function generateUniqueCode(): string {
  return `UNIQUE-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ===============================
// GÉNÉRER QR CODE DATA
// ===============================
export function generateQRData(lotData: {
  numero_lot: string;
  code_unique: string;
  hash_lot: string;
  medicament_id: number;
  medicament_nom?: string;
  code_cis?: string;
  date_fabrication: string;
  date_expiration: string;
  quantite: number;
  created_by: string;
}): string {
  const qrData = {
    v: '1.0',  // version
    type: 'lot_pharmaceutique',
    numero_lot: lotData.numero_lot,
    code_unique: lotData.code_unique,
    hash_lot: lotData.hash_lot,
    medicament_id: lotData.medicament_id,
    medicament_nom: lotData.medicament_nom || null,
    code_cis: lotData.code_cis || null,
    date_fabrication: lotData.date_fabrication,
    date_expiration: lotData.date_expiration,
    quantite: lotData.quantite,
    created_by: lotData.created_by,
    created_at: new Date().toISOString(),
  };

  return JSON.stringify(qrData);
}

// ===============================
// VÉRIFIER INTÉGRITÉ QR CODE
// ===============================
export function verifyQRIntegrity(qrContent: string, expectedHash: string): boolean {
  try {
    const qrData = JSON.parse(qrContent);
    const hashToCheck = qrData.hash_lot;
    return hashToCheck === expectedHash;
  } catch {
    return false;
  }
}

// ===============================
// FONCTIONS DE DÉBOGAGE
// ===============================

export function debugHashComparison(label: string, hash1: string, hash2: string, data?: any): void {
  console.log(`\n🔍 DEBUG HASH: ${label}`);
  console.log(`   Hash 1: ${hash1.substring(0, 40)}...`);
  console.log(`   Hash 2: ${hash2.substring(0, 40)}...`);
  console.log(`   Match: ${hash1 === hash2 ? '✅ OUI' : '❌ NON'}`);
  
  if (!(hash1 === hash2) && data) {
    console.log('   Données utilisées pour Hash 2:', JSON.stringify(data, null, 2));
  }
}

export function debugMouvementData(label: string, data: any): void {
  console.log(`\n📋 DONNÉES MOUVEMENT: ${label}`);
  console.log(JSON.stringify(data, (key, value) => {
    if (value === undefined) return '❌ UNDEFINED';
    if (value === null) return 'null';
    return value;
  }, 2));
}

export function createMouvementHash(data: any): string {
  let content;

  switch (data.type) {

    case 'creation_lot':
      content = {
        type: data.type,
        lot_id: Number(data.lot_id),
        quantite: Number(data.quantite),
        source_id: String(data.source_id),
        commentaire: data.commentaire ?? null,
      };
      break;
      
    case 'reception':
      content = {
        type: data.type,
        lot_id: Number(data.lot_id),
        quantite: Number(data.quantite ?? 0),
        source_id: String(data.source_id ?? ''),
        destination_id: String(data.destination_id ?? ''),
      };
      break;

    case 'reception_rejet':
      content = {
        type: data.type,
        lot_id: Number(data.lot_id),
        quantite: Number(data.quantite ?? 0),
        source_id: String(data.source_id ?? ''),
        destination_id: String(data.destination_id ?? ''),
        raison: data.raison ?? null,
      };
      break;
case 'distribution':
  content = {
    type: data.type,
    lot_id: Number(data.lot_id),
    quantite: Number(data.quantite ?? 0),
    source_id: String(data.source_id ?? ''),
    destination_id: String(data.destination_id ?? ''),
  };
  break;
    case 'transfert':
      content = {
        type: data.type,
        lot_id: Number(data.lot_id),
        quantite: Number(data.quantite),
        source_id: String(data.source_id),
        destination_id: String(data.destination_id),
        transfert_id: data.transfert_id ?? null,
      };
      break;


case 'anomalie':
  content = {
    type: data.type,
    lot_id: Number(data.lot_id),
    quantite: Number(data.quantite ?? 0),
    source_id: String(data.source_id ?? ''),
    raison: data.raison ?? null,
    commentaire: data.commentaire ?? null,
  };
  break;

    case 'retrait_defectueux':
      content = {
        type: data.type,
        lot_id: Number(data.lot_id),
        quantite: Number(data.quantite),
        raison: data.raison ?? null,
        commentaire: data.commentaire ?? null,
      };
      break;

    default:
      content = {
        type: data.type,
        lot_id: Number(data.lot_id),
      };
  }

  return generateHash(JSON.stringify(content));
}