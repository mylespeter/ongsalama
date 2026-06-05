// lib/userBlockchain.ts
import { blockchainService } from './blockchain';
import { supabase } from './supabase';

export class UserBlockchainService {
  
  // Assigner automatiquement un compte Ganache à un utilisateur
  async assignEthereumAccount(userId: number): Promise<{
    ethereum_address: string;
    ethereum_address_hash: string;
    ganache_account_index: number;
  } | null> {
    try {
      // Récupérer tous les utilisateurs qui ont déjà un compte
      const { data: existingUsers } = await supabase
        .from('users')
        .select('ganache_account_index')
        .not('ganache_account_index', 'is', null)
        .order('ganache_account_index', { ascending: true });

      // Trouver le prochain index disponible
      const usedIndices = new Set(
        existingUsers?.map(u => u.ganache_account_index) || []
      );

      let nextIndex = 0;
      while (usedIndices.has(nextIndex) && nextIndex < 10) {
        nextIndex++;
      }

      if (nextIndex >= 10) {
        throw new Error('Tous les comptes Ganache sont déjà assignés');
      }

      // Récupérer l'adresse Ethereum correspondante
      const accounts = await blockchainService.init();
      const ethereumAddress = accounts[nextIndex];

      if (!ethereumAddress) {
        throw new Error(`Compte Ganache #${nextIndex} non trouvé`);
      }

      // Hasher l'adresse
      const addressHash = blockchainService.hashAddress(ethereumAddress);

      // Mettre à jour l'utilisateur dans Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          ethereum_address: ethereumAddress,
          ethereum_address_hash: addressHash,
          ganache_account_index: nextIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Compte Ganache #${nextIndex} assigné à l'utilisateur #${userId}`);
      console.log(`   Adresse: ${ethereumAddress}`);
      console.log(`   Hash: ${addressHash}`);

      return {
        ethereum_address: ethereumAddress,
        ethereum_address_hash: addressHash,
        ganache_account_index: nextIndex
      };

    } catch (error) {
      console.error('❌ Erreur assignation compte Ethereum:', error);
      throw error;
    }
  }

  // Vérifier l'intégrité d'une adresse
  async verifyAddressIntegrity(userId: number): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('ethereum_address, ethereum_address_hash')
        .eq('id', userId)
        .single();

      if (!user?.ethereum_address || !user?.ethereum_address_hash) {
        return false;
      }

      return blockchainService.verifyHash(
        user.ethereum_address,
        user.ethereum_address_hash
      );
    } catch (error) {
      console.error('❌ Erreur vérification intégrité:', error);
      return false;
    }
  }

  // Obtenir les informations blockchain d'un utilisateur
  async getUserBlockchainInfo(userId: number) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select(`
          id,
          username,
          matricule,
          role,
          ethereum_address,
          ethereum_address_hash,
          ganache_account_index
        `)
        .eq('id', userId)
        .single();

      if (!user) return null;

      let balance = null;
      if (user.ethereum_address) {
        balance = await blockchainService.getBalance(user.ethereum_address);
      }

      return {
        ...user,
        balance
      };
    } catch (error) {
      console.error('❌ Erreur récupération info blockchain:', error);
      return null;
    }
  }
}

export const userBlockchainService = new UserBlockchainService();