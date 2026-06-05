// lib/blockchain-init.ts
import { blockchainService } from './blockchain';
import contractData from '../../Danseur/DrugTraceability.json';

let isContractInitialized = false;

export async function initBlockchainContract(): Promise<boolean> {
  if (isContractInitialized) {
    console.log('✅ Contrat déjà initialisé');
    return true;
  }

  try {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      console.error('❌ NEXT_PUBLIC_CONTRACT_ADDRESS non définie');
      return false;
    }

    // Initialiser la connexion à Ganache
    await blockchainService.init();
    
    // Initialiser le contrat avec l'ABI et l'adresse
    await blockchainService.initContract(
      contractData.abi,
      contractAddress
    );
    
    isContractInitialized = true;
    console.log('✅ Contrat blockchain initialisé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation contrat blockchain:', error);
    return false;
  }
}

export function resetContractInit() {
  isContractInitialized = false;
}