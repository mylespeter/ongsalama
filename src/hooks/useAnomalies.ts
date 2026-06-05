// hooks/useAnomalies.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getAnomalies, 
  getLotsReceptionnesPourSignalement,
  signalerAnomalie as signaler 
} from '@/app/anomalies/actions';
import { useAuth } from '@/context/AuthContext';

export function useAnomalies() {
  const { user } = useAuth();
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [lotsReceptionnes, setLotsReceptionnes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chargerDonnees = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const [anomaliesData, lotsData] = await Promise.all([
        getAnomalies(parseInt(user.id), user.role),
        user.role === 'distributeur' 
          ? getLotsReceptionnesPourSignalement(parseInt(user.id))
          : Promise.resolve([])
      ]);
      setAnomalies(anomaliesData);
      setLotsReceptionnes(lotsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      console.error('Erreur useAnomalies:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  const signalerAnomalie = async (data: {
    lot_id: number;
    type_anomalie: string;
    description: string;
    gravite?: string;
  }) => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    if (user.role !== 'distributeur') {
      throw new Error('Seuls les distributeurs peuvent signaler des anomalies');
    }

    // Vérifier que le lot fait partie des lots réceptionnés
    const lotReceptionne = lotsReceptionnes.find(r => r.lot?.id === data.lot_id);
    if (!lotReceptionne) {
      throw new Error('Vous ne pouvez signaler une anomalie que sur un lot réceptionné');
    }

    if (lotReceptionne.a_anomalie_en_cours) {
      throw new Error('Ce lot a déjà une anomalie en cours de traitement');
    }

    const result = await signaler({
      ...data,
      signale_par: parseInt(user.id),
    });
    
    await chargerDonnees();
    return result;
  };

  return {
    anomalies,
    lotsReceptionnes,
    loading,
    error,
    signalerAnomalie,
    recharger: chargerDonnees,
    lotsDisponibles: lotsReceptionnes.filter(l => !l.a_anomalie_en_cours),
    lotsAvecAnomalies: lotsReceptionnes.filter(l => l.a_anomalie_en_cours),
  };
}