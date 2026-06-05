

// lib/blockchain.ts
import Web3 from 'web3';
import crypto from 'crypto';
import { BlockchainMouvement } from '@/types/blockchain';
class BlockchainService {
  private web3: Web3;
  private accounts: string[] = [];
  private contract: any = null;
  private contractAddress: string = '';

  constructor() {
    this.web3 = new Web3(process.env.NEXT_PUBLIC_GANACHE_URL || 'http://127.0.0.1:7545');
  }

  async init() {
    try {
      this.accounts = await this.web3.eth.getAccounts();
      console.log(`✅ Connecté à Ganache - ${this.accounts.length} comptes disponibles`);
      
      this.accounts.forEach((acc, i) => {
        console.log(`   [${i}] ${acc}`);
      });
      
      return this.accounts;
    } catch (error) {
      console.error('❌ Erreur connexion Ganache:', error);
      throw error;
    }
  }

  async initContract(contractABI: any, contractAddress: string) {
    try {
      this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
      this.contractAddress = contractAddress;
      console.log(`✅ Contrat initialisé à: ${contractAddress}`);
      return this.contract;
    } catch (error) {
      console.error('❌ Erreur initialisation contrat:', error);
      throw error;
    }
  }

  hashAddress(address: string): string {
    return crypto
      .createHash('sha256')
      .update(address.toLowerCase())
      .digest('hex');
  }

  hashData(data: any): string {
    const dataString = JSON.stringify(data);
    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex');
  }

  verifyHash(address: string, hash: string): boolean {
    const computedHash = this.hashAddress(address);
    return computedHash === hash;
  }

  getAccount(index: number): string | null {
    if (index >= 0 && index < this.accounts.length) {
      return this.accounts[index];
    }
    return null;
  }

  getAccountByIndex(index: number): string {
    if (index >= 0 && index < this.accounts.length) {
      return this.accounts[index];
    }
    throw new Error(`Index de compte invalide: ${index}`);
  }

  getAllAccounts(): string[] {
    return this.accounts;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  isValidAddress(address: string): boolean {
    return this.web3.utils.isAddress(address);
  }

  // =============================================
  // FONCTIONS BLOCKCHAIN POUR LES LOTS
  // =============================================

  async createLotOnBlockchain(
    fromAccountIndex: number,
    lotData: {
      numero_lot: string;
      code_unique: string;
      medicament_code: string;
      quantite_totale: number;
      date_fabrication: string;
      date_expiration: string;
       hash_lot: string; 
    }
  ): Promise<{
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    blockchainLotId: string;
  }> {
    if (!this.contract) {
      throw new Error('Contrat non initialisé. Appelez initContract() d\'abord.');
    }

    const fromAddress = this.getAccountByIndex(fromAccountIndex);
    
    // Générer le hash du lot
    // const hashLot = this.hashData(lotData);
    const hashLot = lotData.hash_lot;
    
    // Convertir les dates en timestamp Unix
    const dateFabricationTimestamp = Math.floor(new Date(lotData.date_fabrication).getTime() / 1000);
    const dateExpirationTimestamp = Math.floor(new Date(lotData.date_expiration).getTime() / 1000);

    try {
      console.log(`🔗 Création du lot sur blockchain...`);
      console.log(`   Compte: [${fromAccountIndex}] ${fromAddress}`);
      console.log(`   Lot: ${lotData.numero_lot}`);
      console.log(`   Hash calculé: ${hashLot}`);

      const receipt = await this.contract.methods.createLot(
        lotData.numero_lot,
        lotData.code_unique,
        lotData.medicament_code,
        hashLot,
        lotData.quantite_totale,
        dateFabricationTimestamp,
        dateExpirationTimestamp
      ).send({
        from: fromAddress,
        gas: 3000000
      });

      const lotCreatedEvent = receipt.events?.LotCreated;
      const blockchainLotId = lotCreatedEvent?.returnValues?.lotId || '0';

      // ✅ Vérifier immédiatement que le hash est enregistré
      const hashExists = await this.contract.methods.verifyHash(hashLot).call();
      console.log(`   Hash lot enregistré: ${hashExists ? '✅ OUI' : '❌ NON - PROBLÈME!'}`);

      console.log(`✅ Lot créé sur blockchain !`);
      console.log(`   Transaction: ${receipt.transactionHash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas utilisé: ${receipt.gasUsed}`);
      console.log(`   Blockchain Lot ID: ${blockchainLotId}`);

      return {
        transactionHash: receipt.transactionHash as string,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        blockchainLotId: String(blockchainLotId)
      };
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du lot sur blockchain:', error);
      throw new Error(`Erreur blockchain: ${error.message}`);
    }
  }

  // ✅ MODIFIÉ : Accepte un hash_mouvement optionnel
  async addMouvementOnBlockchain(
    fromAccountIndex: number,
    mouvementData: {
      blockchainLotId: string;
      type_mouvement: string;
      quantite: number;
      commentaire: string;
      hash_mouvement?: string;  // ✅ Hash pré-calculé (optionnel)
    }
  ): Promise<{
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
  }> {
    if (!this.contract) {
      throw new Error('Contrat non initialisé. Appelez initContract() d\'abord.');
    }

    const fromAddress = this.getAccountByIndex(fromAccountIndex);
    
    // ✅ Utiliser le hash fourni, ou en calculer un
    let hashMouvement: string;
    
    if (mouvementData.hash_mouvement) {
      // Utiliser le hash passé depuis l'extérieur (généré par generateMouvementHash)
      hashMouvement = mouvementData.hash_mouvement;
      console.log(`🔗 Utilisation du hash fourni: ${hashMouvement}`);
    } else {
      // Calculer le hash localement (fallback)
      hashMouvement = this.hashData({
        blockchainLotId: mouvementData.blockchainLotId,
        type_mouvement: mouvementData.type_mouvement,
        quantite: mouvementData.quantite,
        commentaire: mouvementData.commentaire,
      });
      console.log(`🔗 Hash calculé localement: ${hashMouvement}`);
    }

    try {
      console.log(`🔗 Ajout mouvement sur blockchain...`);
      console.log(`   Compte: [${fromAccountIndex}] ${fromAddress}`);
      console.log(`   Type: ${mouvementData.type_mouvement}`);
      console.log(`   Quantité: ${mouvementData.quantite}`);
      console.log(`   Hash envoyé au contrat: ${hashMouvement}`);

      const receipt = await this.contract.methods.addMouvement(
        mouvementData.blockchainLotId,
        mouvementData.type_mouvement,
        mouvementData.quantite,
        hashMouvement,
        mouvementData.commentaire || ''
      ).send({
        from: fromAddress,
        gas: 3000000
      });

      // ✅ Vérifier immédiatement que le hash est enregistré
      const hashExists = await this.contract.methods.verifyHash(hashMouvement).call();
      console.log(`   Hash enregistré on-chain: ${hashExists ? '✅ OUI' : '❌ NON - PROBLÈME CRITIQUE!'}`);

      console.log(`✅ Mouvement ajouté sur blockchain !`);
      console.log(`   Transaction: ${receipt.transactionHash}`);

      return {
        transactionHash: receipt.transactionHash as string,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed)
      };
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'ajout du mouvement sur blockchain:', error);
      throw new Error(`Erreur blockchain: ${error.message}`);
    }
  }

 // lib/blockchain.ts - Correction de verifyHashOnBlockchain

// async verifyHashOnBlockchain(hash: string): Promise<boolean> {
//   try {
//     if (!this.contract) {
//       console.warn('⚠️ Contrat non initialisé');
//       return false;
//     }
    
//     console.log('🔐 Vérification hash sur blockchain:', hash);
    
//     // Appeler la méthode verifyHash du contrat
//     const result = await this.contract.methods.verifyHash(hash).call();
    
//     console.log('   Résultat contrat verifyHash:', result);
//     return result === true;
//   } catch (error) {
//     console.error('❌ Erreur lors de la vérification du hash:', error);
//     return false;
//   }
// }

// // Ajoutez aussi cette méthode si elle n'existe pas
// async verifyLotOnBlockchain(lotId: number): Promise<boolean> {
//   try {
//     if (!this.contract) {
//       console.warn('⚠️ Contrat non initialisé');
//       return false;
//     }
    
//     console.log('🔐 Vérification lot #' + lotId + ' sur blockchain');
    
//     const lot = await this.contract.methods.getLot(lotId).call();
//     console.log('   Lot trouvé:', lot.numeroLot, '| Existe:', lot.exists);
    
//     return lot.exists === true;
//   } catch (error) {
//     console.error('❌ Erreur lors de la vérification du lot:', error);
//     return false;
//   }
// }

//   async getLotFromBlockchain(blockchainLotId: string): Promise<any> {
//     if (!this.contract) {
//       throw new Error('Contrat non initialisé.');
//     }

//     try {
//       const lot = await this.contract.methods.getLot(blockchainLotId).call();
//       return {
//         numeroLot: lot.numeroLot,
//         codeUnique: lot.codeUnique,
//         medicamentCode: lot.medicamentCode,
//         hashLot: lot.hashLot,
//         quantiteTotale: Number(lot.quantiteTotale),
//         dateFabrication: new Date(Number(lot.dateFabrication) * 1000).toISOString(),
//         dateExpiration: new Date(Number(lot.dateExpiration) * 1000).toISOString(),
//         exists: lot.exists
//       };
//     } catch (error: any) {
//       console.error('❌ Erreur récupération lot:', error);
//       throw error;
//     }
//   }


//   // lib/blockchain.ts - Ajoutez cette méthode dans la classe BlockchainService

// async getMouvementHashes(blockchainLotId: string): Promise<string[]> {
//   if (!this.contract) {
//     console.warn('⚠️ Contrat non initialisé');
//     return [];
//   }

//   try {
//     console.log('🔍 Récupération des hashes des mouvements pour le lot #' + blockchainLotId);
    
//     // Récupérer les mouvements du lot
//     const mouvements = await this.contract.methods.getMouvements(blockchainLotId).call();
    
//     const hashes = mouvements.map((m: any) => m.hashMouvement);
    
//     console.log('   Hashes on-chain:', hashes);
    
//     return hashes;
//   } catch (error) {
//     console.error('❌ Erreur récupération hashes mouvements:', error);
//     return [];
//   }
// }





















// lib/blockchain.ts - Mets à jour ces méthodes

// ✅ CORRIGÉ : Utilise getLot(id) comme dans ton script de lecture
async getLotFromBlockchain(blockchainLotId: string): Promise<any> {
  if (!this.contract) {
    throw new Error('Contrat non initialisé.');
  }

  try {
    const lotId = parseInt(blockchainLotId);
    console.log(`🔍 Lecture lot #${lotId} sur blockchain...`);
    
    const lot = await this.contract.methods.getLot(lotId).call();
    
    console.log(`   Lot trouvé: ${lot.numeroLot} | Existe: ${lot.exists} | Hash: ${lot.hashLot.substring(0, 20)}...`);
    
    return {
      id: lot.id,
      numeroLot: lot.numeroLot,
      codeUnique: lot.codeUnique,
      medicamentCode: lot.medicamentCode,
      hashLot: lot.hashLot,
      quantiteTotale: Number(lot.quantiteTotale),
      dateFabrication: Number(lot.dateFabrication),
      dateExpiration: Number(lot.dateExpiration),
      exists: lot.exists
    };
  } catch (error: any) {
    console.error('❌ Erreur getLotFromBlockchain:', error.message);
    throw error;
  }
}

// ✅ CORRIGÉ : Récupérer TOUS les hashes des mouvements d'un lot
async getMouvementHashes(blockchainLotId: string): Promise<string[]> {
  if (!this.contract) {
    console.warn('⚠️ Contrat non initialisé');
    return [];
  }

  try {
    const lotId = parseInt(blockchainLotId);
    const mouvementCount = await this.contract.methods.getMouvementCount(lotId).call();
    const count = Number(mouvementCount);
    
    console.log(`🔍 Récupération de ${count} mouvements pour le lot #${lotId}`);
    
    const hashes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const mvt = await this.contract.methods.getMouvement(lotId, i).call();
      hashes.push(mvt.hashMouvement);
      console.log(`   Mouvement #${mvt.id}: ${mvt.typeMouvement} | Hash: ${mvt.hashMouvement.substring(0, 20)}...`);
    }
    
    return hashes;
  } catch (error: any) {
    console.error('❌ Erreur getMouvementHashes:', error.message);
    return [];
  }
}

// ✅ Vérifier si un hash existe sur la blockchain
async verifyHashOnBlockchain(hash: string): Promise<boolean> {
  if (!this.contract) {
    console.warn('⚠️ Contrat non initialisé');
    return false;
  }

  try {
    const exists = await this.contract.methods.verifyHash(hash).call();
    console.log(`   verifyHash(${hash.substring(0, 15)}...): ${exists ? '✅ TROUVÉ' : '❌ NON TROUVÉ'}`);
    return exists === true;
  } catch (error: any) {
    console.error('❌ Erreur verifyHashOnBlockchain:', error.message);
    return false;
  }
}

// ✅ Vérifier si un lot existe
async verifyLotOnBlockchain(lotId: number): Promise<boolean> {
  try {
    if (!this.contract) {
      console.warn('⚠️ Contrat non initialisé');
      return false;
    }
    
    console.log(`🔐 Vérification lot #${lotId}`);
    
    const lot = await this.contract.methods.getLot(lotId).call();
    console.log(`   Lot: ${lot.numeroLot} | Existe: ${lot.exists}`);
    
    return lot.exists === true;
  } catch (error: any) {
    console.error('❌ Erreur verifyLotOnBlockchain:', error.message);
    return false;
  }
}





// lib/blockchain.ts

async getMouvementsFromBlockchain(lotId: number): Promise<BlockchainMouvement[]> {
  try {
    console.log(`🔍 Récupération des mouvements blockchain pour le lot #${lotId}`);
    
    // Récupérer d'abord le nombre de mouvements
    const count = await (this.contract as any).methods.getMouvementCount(lotId).call();
    console.log(`   ${count} mouvements trouvés sur la blockchain`);
    
    const mouvements: BlockchainMouvement[] = [];
    
    // Récupérer chaque mouvement
    for (let i = 0; i < Number(count); i++) {
      const mvt = await (this.contract as any).methods.getMouvement(lotId, i).call();
      
      mouvements.push({
        id: Number(mvt.id),
        type_mouvement: mvt.typeMouvement,
        quantite: Number(mvt.quantite),
        hash_mouvement: mvt.hashMouvement,
        commentaire: mvt.commentaire || '',
        timestamp: Number(mvt.timestamp),
        emetteur: mvt.emetteur,
        // Ajoutez d'autres champs si disponibles dans votre contrat
        source_id: mvt.source_id || null,
        destination_id: mvt.destination_id || null,
        raison: mvt.raison || null
      });
      
      console.log(`   Mouvement #${i}: ${mvt.typeMouvement} - ${mvt.quantite} unités`);
    }
    
    return mouvements;
  } catch (error) {
    console.error('❌ Erreur récupération mouvements blockchain:', error);
    return [];
  }
}

}

export const blockchainService = new BlockchainService();

