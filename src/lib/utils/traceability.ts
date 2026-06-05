// // lib/utils/traceability.ts

/**
 * Génère un code de traçabilité unique et sécurisé
 * Format: TRC-{NUMERO_COURT}-{CODE_UNIQUE_COURT}-{HASH_COURT}
 */
export function generateTraceabilityCode(lot: any): string {
  // Extraire les 4 derniers caractères du numéro de lot
  const numeroCourt = lot.numero_lot?.replace(/[^A-Z0-9]/g, '').slice(-4) || 'XXXX';
  
  // Prendre une portion du code unique
  const codeUniqueCourt = lot.code_unique?.slice(-6) || '000000';
  
  // Prendre les 6 premiers caractères du hash
  const hashCourt = lot.hash_lot?.substring(0, 6).toUpperCase() || '000000';
  
  return `TRC-${numeroCourt}-${codeUniqueCourt}-${hashCourt}`;
}

/**
 * Génère l'URL de vérification complète
 */
export function generateVerificationUrl(lot: any, baseUrl?: string): string {
  const code = generateTraceabilityCode(lot);
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${url}/verify/${code}`;
}

/**
 * Génère les données complètes pour le QR code
 */
export function generateQRData(lot: any): any {
  const traceabilityCode = generateTraceabilityCode(lot);
  const verificationUrl = generateVerificationUrl(lot);
  
  return {
    type: "MEDICAMENT_TRACEABILITY",
    version: "2.0",
    traceability_code: traceabilityCode,
    verification_url: verificationUrl,
    lot: {
      id: lot.id,
      numero_lot: lot.numero_lot,
      code_unique: lot.code_unique,
      medicament: lot.medicament?.nom || 'N/A',
      code_cis: lot.medicament?.code_cis || 'N/A',
      dosage: lot.medicament?.dosage || 'N/A',
      forme: lot.medicament?.forme || 'N/A',
      fabricant: lot.created_by || 'N/A',
      date_fabrication: lot.date_fabrication,
      date_expiration: lot.date_expiration,
      quantite_totale: lot.quantite_totale,
      hash_lot: lot.hash_lot,
      blockchain_lot_id: lot.blockchain_lot_id || null,
    },
    verification: {
      method: "blockchain",
      hash_algorithm: "SHA-256",
      timestamp: new Date().toISOString(),
    },
    signature: generateDataSignature(lot),
  };
}

/**
 * Génère une signature numérique simple pour l'intégrité des données
 */
function generateDataSignature(lot: any): string {
  const data = `${lot.id}-${lot.numero_lot}-${lot.hash_lot}-${lot.date_fabrication}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Parse un code de traçabilité pour extraire les informations
 */
export function parseTraceabilityCode(code: string): {
  numeroCourt: string;
  codeUniqueCourt: string;
  hashCourt: string;
} | null {
  const parts = code.split('-');
  if (parts.length !== 4 || parts[0] !== 'TRC') {
    return null;
  }
  
  return {
    numeroCourt: parts[1],
    codeUniqueCourt: parts[2],
    hashCourt: parts[3],
  };
}