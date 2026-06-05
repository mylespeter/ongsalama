
// // app/api/verify/[code]/route.ts - VERSION FINALE CORRIGÉE
// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
// import { parseTraceabilityCode, generateTraceabilityCode } from '@/lib/utils/traceability';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ code: string }> }
// ) {
//   try {
//     const { code } = await params;
//     const upperCode = code.toUpperCase().trim();
    
//     console.log('═══════════════════════════════════════');
//     console.log('🔍 DÉBUT VÉRIFICATION');
//     console.log('   Code reçu:', upperCode);
//     console.log('═══════════════════════════════════════');
    
//     const parsed = parseTraceabilityCode(upperCode);
    
//     if (!parsed) {
//       console.log('❌ Format invalide');
//       return NextResponse.json(
//         { error: 'Format de code invalide. Format attendu: TRC-XXXX-XXXXXX-XXXXXX' },
//         { status: 400 }
//       );
//     }

//     console.log('📋 Composants parsés:', parsed);

//     const supabase = await createClient();

//     // ============================================
//     // STRATÉGIE 1: Recherche par hash
//     // ============================================
//     console.log('\n📦 STRATÉGIE 1: Recherche par hash...');
    
//     const { data: lotsByHash } = await supabase
//       .from('lots')
//       .select(`
//         *,
//         medicament:medicament_id (nom, code_cis, dosage, forme)
//       `)
//       .ilike('hash_lot', `${parsed.hashCourt}%`)
//       .limit(100);

//     console.log(`   Résultat: ${lotsByHash?.length || 0} lots trouvés`);

//     if (lotsByHash && lotsByHash.length > 0) {
//       for (const lot of lotsByHash) {
//         const generatedCode = generateTraceabilityCode(lot);
//         // ✅ COMPARAISON INSENSIBLE À LA CASSE
//         if (generatedCode.toUpperCase() === upperCode) {
//           console.log('   ✅ MATCH TROUVÉ!');
//           return buildSuccessResponse(supabase, lot, upperCode);
//         }
//       }
//     }

//     // ============================================
//     // STRATÉGIE 2: Recherche par code_unique
//     // ============================================
//     console.log('\n📦 STRATÉGIE 2: Recherche par code_unique...');
    
//     const { data: lotsByCode } = await supabase
//       .from('lots')
//       .select(`
//         *,
//         medicament:medicament_id (nom, code_cis, dosage, forme)
//       `)
//       .ilike('code_unique', `%${parsed.codeUniqueCourt}%`)
//       .limit(100);

//     console.log(`   Résultat: ${lotsByCode?.length || 0} lots trouvés`);

//     if (lotsByCode && lotsByCode.length > 0) {
//       for (const lot of lotsByCode) {
//         const generatedCode = generateTraceabilityCode(lot);
//         // ✅ COMPARAISON INSENSIBLE À LA CASSE
//         if (generatedCode.toUpperCase() === upperCode) {
//           console.log('   ✅ MATCH TROUVÉ!');
//           return buildSuccessResponse(supabase, lot, upperCode);
//         }
//       }
//     }

//     // ============================================
//     // STRATÉGIE 3: Recherche par numéro de lot
//     // ============================================
//     console.log('\n📦 STRATÉGIE 3: Recherche par numéro de lot...');
    
//     const { data: lotsByNum } = await supabase
//       .from('lots')
//       .select(`
//         *,
//         medicament:medicament_id (nom, code_cis, dosage, forme)
//       `)
//       .ilike('numero_lot', `%${parsed.numeroCourt}%`)
//       .limit(100);

//     console.log(`   Résultat: ${lotsByNum?.length || 0} lots trouvés`);

//     if (lotsByNum && lotsByNum.length > 0) {
//       for (const lot of lotsByNum) {
//         const generatedCode = generateTraceabilityCode(lot);
//         // ✅ COMPARAISON INSENSIBLE À LA CASSE
//         if (generatedCode.toUpperCase() === upperCode) {
//           console.log('   ✅ MATCH TROUVÉ!');
//           return buildSuccessResponse(supabase, lot, upperCode);
//         }
//       }
//     }

//     // ============================================
//     // AUCUN MATCH TROUVÉ
//     // ============================================
//     console.log('\n❌ AUCUN LOT TROUVÉ POUR CE CODE');
    
//     // Afficher tous les lots trouvés pour debug
//     if (lotsByHash && lotsByHash.length > 0) {
//       console.log('   Lots trouvés par hash:');
//       lotsByHash.forEach(lot => {
//         const code = generateTraceabilityCode(lot);
//         console.log(`     ${code} (match: ${code.toUpperCase() === upperCode})`);
//       });
//     }
    
//     console.log('═══════════════════════════════════════');
    
//     return NextResponse.json(
//       { 
//         error: 'Code de traçabilité ne correspond à aucun lot',
//         debug: {
//           code_recherche: upperCode,
//           composants: parsed,
//           lots_verifies: (lotsByHash?.length || 0) + (lotsByCode?.length || 0) + (lotsByNum?.length || 0)
//         }
//       },
//       { status: 404 }
//     );

//   } catch (error: any) {
//     console.error('❌ Erreur:', error);
//     return NextResponse.json(
//       { error: error.message || 'Erreur interne du serveur' },
//       { status: 500 }
//     );
//   }
// }

// // Fonction helper pour construire la réponse de succès
// async function buildSuccessResponse(supabase: any, lot: any, code: string) {
//   console.log('📊 Construction réponse pour lot:', lot.numero_lot);
  
//   const { data: movements } = await supabase
//     .from('mouvements')
//     .select('*')
//     .eq('lot_id', lot.id)
//     .order('created_at', { ascending: true });

//   console.log(`   ${movements?.length || 0} mouvements trouvés`);
//   console.log('═══════════════════════════════════════');

//   return NextResponse.json({
//     verified: true,
//     code,
//     lot: {
//       id: lot.id,
//       numero_lot: lot.numero_lot,
//       code_unique: lot.code_unique,
//       medicament_nom: lot.medicament?.nom || 'N/A',
//       code_cis: lot.medicament?.code_cis || 'N/A',
//       dosage: lot.medicament?.dosage || 'N/A',
//       forme: lot.medicament?.forme || 'N/A',
//       fabricant: lot.created_by || 'N/A',
//       date_fabrication: lot.date_fabrication,
//       date_expiration: lot.date_expiration,
//       quantite: lot.quantite_totale,
//       hash_lot: lot.hash_lot,
//       blockchain_lot_id: lot.blockchain_lot_id,
//     },
//     movements: movements || [],
//     timestamp: new Date().toISOString(),
//   });
// }

// app/api/verify/[code]/route.ts - VERSION AVEC VÉRIFICATION BLOCKCHAIN
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseTraceabilityCode, generateTraceabilityCode } from '@/lib/utils/traceability';
import { blockchainService } from '@/lib/blockchain';
import { initBlockchainContract } from '@/lib/blockchain-init';
import { generateLotHash, createMouvementHash } from '@/lib/utils/crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const upperCode = code.toUpperCase().trim();
    
    console.log('═══════════════════════════════════════');
    console.log('🔍 DÉBUT VÉRIFICATION PAR CODE');
    console.log('   Code reçu:', upperCode);
    console.log('═══════════════════════════════════════');
    
    const parsed = parseTraceabilityCode(upperCode);
    
    if (!parsed) {
      console.log('❌ Format invalide');
      return NextResponse.json(
        { error: 'Format de code invalide. Format attendu: TRC-XXXX-XXXXXX-XXXXXX' },
        { status: 400 }
      );
    }

    console.log('📋 Composants parsés:', parsed);

    const supabase = await createClient();

    // ============================================
    // STRATÉGIE: Recherche par hash
    // ============================================
    console.log('\n📦 Recherche par hash...');
    
    const { data: lotsByHash } = await supabase
      .from('lots')
      .select(`
        *,
        medicament:medicament_id (nom, code_cis, dosage, forme)
      `)
      .ilike('hash_lot', `${parsed.hashCourt}%`)
      .limit(100);

    console.log(`   Résultat: ${lotsByHash?.length || 0} lots trouvés`);

    let matchedLot = null;

    if (lotsByHash && lotsByHash.length > 0) {
      for (const lot of lotsByHash) {
        const generatedCode = generateTraceabilityCode(lot);
        if (generatedCode.toUpperCase() === upperCode) {
          console.log('   ✅ MATCH TROUVÉ!');
          matchedLot = lot;
          break;
        }
      }
    }

    // Si pas trouvé par hash, chercher par code_unique
    if (!matchedLot) {
      console.log('\n📦 Recherche par code_unique...');
      
      const { data: lotsByCode } = await supabase
        .from('lots')
        .select(`
          *,
          medicament:medicament_id (nom, code_cis, dosage, forme)
        `)
        .ilike('code_unique', `%${parsed.codeUniqueCourt}%`)
        .limit(100);

      console.log(`   Résultat: ${lotsByCode?.length || 0} lots trouvés`);

      if (lotsByCode && lotsByCode.length > 0) {
        for (const lot of lotsByCode) {
          const generatedCode = generateTraceabilityCode(lot);
          if (generatedCode.toUpperCase() === upperCode) {
            console.log('   ✅ MATCH TROUVÉ!');
            matchedLot = lot;
            break;
          }
        }
      }
    }

    // Si pas trouvé, chercher par numéro de lot
    if (!matchedLot) {
      console.log('\n📦 Recherche par numéro de lot...');
      
      const { data: lotsByNum } = await supabase
        .from('lots')
        .select(`
          *,
          medicament:medicament_id (nom, code_cis, dosage, forme)
        `)
        .ilike('numero_lot', `%${parsed.numeroCourt}%`)
        .limit(100);

      console.log(`   Résultat: ${lotsByNum?.length || 0} lots trouvés`);

      if (lotsByNum && lotsByNum.length > 0) {
        for (const lot of lotsByNum) {
          const generatedCode = generateTraceabilityCode(lot);
          if (generatedCode.toUpperCase() === upperCode) {
            console.log('   ✅ MATCH TROUVÉ!');
            matchedLot = lot;
            break;
          }
        }
      }
    }

    // ============================================
    // AUCUN MATCH TROUVÉ
    // ============================================
    if (!matchedLot) {
      console.log('\n❌ AUCUN LOT TROUVÉ POUR CE CODE');
      console.log('═══════════════════════════════════════');
      
      return NextResponse.json(
        { 
          error: 'Code de traçabilité ne correspond à aucun lot',
          code_recherche: upperCode,
          composants: parsed
        },
        { status: 404 }
      );
    }

    // ============================================
    // LOT TROUVÉ - VÉRIFICATION BLOCKCHAIN
    // ============================================
    const lot = matchedLot;
    const generatedCode = generateTraceabilityCode(lot);

    console.log('\n🔐 DÉBUT VÉRIFICATION BLOCKCHAIN');
    console.log('   Lot:', lot.numero_lot);
    console.log('   Code généré:', generatedCode);
    console.log('   Blockchain ID:', lot.blockchain_lot_id);

    // Récupérer le fabricant
    const { data: premierMouvement } = await supabase
      .from('mouvements')
      .select('source_id')
      .eq('lot_id', lot.id)
      .eq('type_mouvement', 'creation_lot')
      .single();

    let fabricantNom = 'Inconnu';
    if (premierMouvement?.source_id) {
      const { data: fabricant } = await supabase
        .from('users')
        .select('nom_entite, username')
        .eq('id', premierMouvement.source_id)
        .single();
      
      if (fabricant) {
        fabricantNom = fabricant.nom_entite || fabricant.username;
      }
    }

    // Recalculer le hash du lot
    const recalculatedHash = generateLotHash({
      medicament_id: lot.medicament_id,
      numero_lot: lot.numero_lot,
      code_unique: lot.code_unique,
      date_fabrication: lot.date_fabrication,
      date_expiration: lot.date_expiration,
      quantite_totale: lot.quantite_totale,
    });

    const dbHashIntegrity = recalculatedHash === lot.hash_lot;
    console.log('   Hash DB intact:', dbHashIntegrity ? '✅' : '❌');

    let blockchainLotData: any = null;
    let lotHashMatch = false;
    let blockchainAvailable = false;

    // Vérifier si le lot est sur la blockchain
    if (lot.blockchain_lot_id) {
      const isContractReady = await initBlockchainContract();
      
      if (isContractReady) {
        blockchainAvailable = true;
        
        try {
          blockchainLotData = await blockchainService.getLotFromBlockchain(lot.blockchain_lot_id);
          
          if (blockchainLotData && blockchainLotData.exists) {
            lotHashMatch = recalculatedHash === blockchainLotData.hashLot;
            console.log('   Hash blockchain:', blockchainLotData.hashLot?.substring(0, 40) + '...');
            console.log('   Match blockchain:', lotHashMatch ? '✅' : '❌');
          } else {
            console.log('   ❌ Lot introuvable sur la blockchain');
          }
        } catch (error) {
          console.error('   ❌ Erreur lecture blockchain:', error);
        }
      } else {
        console.log('   ⚠️ Blockchain non disponible');
      }
    } else {
      console.log('   ⚠️ Lot non enregistré sur la blockchain');
    }

    // Récupérer les mouvements de la DB
    const { data: dbMouvements } = await supabase
      .from('mouvements')
      .select('*')
      .eq('lot_id', lot.id)
      .order('created_at', { ascending: true });

    console.log(`\n📋 ${dbMouvements?.length || 0} mouvements trouvés en DB`);

    // Récupérer les mouvements de la blockchain
    let blockchainMouvementHashes: string[] = [];
    let blockchainMouvementsData: any[] = [];
    
    if (blockchainAvailable && lot.blockchain_lot_id) {
      try {
        blockchainMouvementHashes = await blockchainService.getMouvementHashes(lot.blockchain_lot_id);
        console.log(`🔗 ${blockchainMouvementHashes.length} hashes de mouvements sur la blockchain`);
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer les hashes des mouvements on-chain');
      }

      try {
        blockchainMouvementsData = await blockchainService.getMouvementsFromBlockchain(
          lot.blockchain_lot_id
        );
        console.log(`📦 ${blockchainMouvementsData.length} mouvements complets récupérés de la blockchain`);
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer les données complètes des mouvements de la blockchain');
      }
    }

    // Comparer chaque mouvement
    const mouvementsComparison = (dbMouvements || []).map((dbMvt: any, index: number) => {
      const blockchainMvt = index < blockchainMouvementsData.length 
        ? blockchainMouvementsData[index] 
        : null;

      let hashType = dbMvt.type_mouvement;
      let raison: string | null = null;

      if (dbMvt.type_mouvement === 'reception' && dbMvt.commentaire?.includes('REJETÉ')) {
        hashType = 'reception_rejet';
        const match = dbMvt.commentaire.match(/REJETÉ:\s*(.+?)\s*\(Transfert/);
        if (match) raison = match[1];
      }

      if (dbMvt.type_mouvement === 'retrait_defectueux' && dbMvt.commentaire) {
        const match = dbMvt.commentaire.match(/Retrait lot défectueux - (.+?)\. Lot #/);
        if (match) raison = match[1];
      }

      const recalculatedHash = createMouvementHash({
        lot_id: dbMvt.lot_id,
        type: hashType,
        quantite: dbMvt.quantite,
        source_id: dbMvt.source_id,
        destination_id: dbMvt.destination_id,
        raison: raison,
        commentaire: dbMvt.commentaire,
        transfert_id: null,
      });

      const hashDbIntact = dbMvt.hash_mouvement === recalculatedHash;
      
      let match: boolean | null = null;
      let existsOnBlockchain = false;
      
      if (blockchainMvt) {
        existsOnBlockchain = true;
        const blockchainHash = String(blockchainMvt.hash_mouvement).trim().toLowerCase();
        const recalculatedHashNormalized = recalculatedHash.trim().toLowerCase();
        match = hashDbIntact && (blockchainHash === recalculatedHashNormalized);
      } else if (blockchainMouvementHashes.length > 0) {
        existsOnBlockchain = blockchainMouvementHashes.includes(recalculatedHash);
        match = hashDbIntact && existsOnBlockchain;
      }

      return {
        type: dbMvt.type_mouvement,
        date: dbMvt.created_at,
        quantite: dbMvt.quantite,
        commentaire: dbMvt.commentaire,
        source_id: dbMvt.source_id,
        destination_id: dbMvt.destination_id,
        raison: raison,
        db_hash: dbMvt.hash_mouvement,
        db_hash_recalculated: recalculatedHash,
        blockchain_hash: blockchainMvt?.hash_mouvement || null,
        hash_db_intact: hashDbIntact,
        match: match,
        exists_on_blockchain: existsOnBlockchain,
        blockchain_data: blockchainMvt
      };
    });

    // Détecter les mouvements manquants
    const dbHashes = new Set(mouvementsComparison.map((m: any) => m.db_hash_recalculated));
    const dbStoredHashes = new Set(mouvementsComparison.map((m: any) => m.db_hash));
    const missingMovements = blockchainMouvementHashes.filter((hash: string) => 
      !dbHashes.has(hash) && !dbStoredHashes.has(hash)
    );

    // Déterminer l'intégrité globale
    const allMouvementsMatch = mouvementsComparison
      .filter((m: any) => m.match !== null)
      .every((m: any) => m.match === true);
    
    const noMissingMovements = missingMovements.length === 0;
    
    let integrity: boolean | null = null;
    
    if (blockchainAvailable && lot.blockchain_lot_id && blockchainLotData?.exists) {
      integrity = lotHashMatch && dbHashIntegrity && allMouvementsMatch && noMissingMovements;
    } else if (!lot.blockchain_lot_id) {
      integrity = null; // Pas sur blockchain, impossible de vérifier
    }

    // Détecter les modifications
    const modifications: string[] = [];
    
    if (!dbHashIntegrity) {
      modifications.push('Hash du lot modifié dans la base de données');
    }
    
    if (blockchainLotData && !lotHashMatch) {
      if (blockchainLotData.numeroLot && lot.numero_lot !== blockchainLotData.numeroLot) {
        modifications.push(`Numéro de lot modifié`);
      }
      if (blockchainLotData.quantiteTotale !== undefined && lot.quantite_totale !== Number(blockchainLotData.quantiteTotale)) {
        modifications.push(`Quantité modifiée: ${blockchainLotData.quantiteTotale} → ${lot.quantite_totale}`);
      }
    }

    mouvementsComparison.forEach((m: any, index: number) => {
      if (m.match === false) {
        if (!m.hash_db_intact) {
          modifications.push(`Mouvement #${index + 1} (${m.type}): données modifiées`);
        }
        if (!m.exists_on_blockchain && m.blockchain_data) {
          modifications.push(`Mouvement #${index + 1} (${m.type}): absent de la blockchain`);
        }
      }
    });

    if (missingMovements.length > 0) {
      modifications.push(`${missingMovements.length} mouvement(s) supprimé(s) de la base de données`);
    }

    console.log('\n📊 RÉSULTAT FINAL:');
    console.log(`   Intégrité: ${integrity === true ? '✅ AUTHENTIQUE' : integrity === false ? '❌ ALTÉRÉ' : '⚠️ NON VÉRIFIABLE'}`);
    console.log('═══════════════════════════════════════');

    // Construire la réponse
    return NextResponse.json({
      verified: true,
      code: generatedCode,
      integrity: integrity,
      blockchain_available: blockchainAvailable,
      lot: {
        id: lot.id,
        numero_lot: lot.numero_lot,
        code_unique: lot.code_unique,
        medicament_nom: lot.medicament?.nom || 'N/A',
        code_cis: lot.medicament?.code_cis || 'N/A',
        dosage: lot.medicament?.dosage || 'N/A',
        forme: lot.medicament?.forme || 'N/A',
        fabricant: fabricantNom,
        date_fabrication: lot.date_fabrication,
        date_expiration: lot.date_expiration,
        quantite: lot.quantite_totale,
        hash_lot: lot.hash_lot,
        blockchain_lot_id: lot.blockchain_lot_id,
      },
      hashComparison: {
        lot: {
          db_hash: lot.hash_lot,
          db_hash_recalculated: recalculatedHash,
          blockchain_hash: blockchainLotData?.hashLot || null,
          match: lotHashMatch,
          db_hash_intact: dbHashIntegrity,
        },
        mouvements: mouvementsComparison,
        missing_movements: missingMovements,
      },
      modifications: modifications,
      movements: dbMouvements || [],
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}