// types/anomalie.ts
export interface Anomalie {
  id: number;
  lot_id: number;
  type_anomalie: string;
  description: string;
  gravite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'en_attente' | 'en_cours' | 'resolu' | 'rejete';
  created_by: string;
  created_at: string;
  updated_at: string;
  hash_anomalie?: string;
  lot?: {
    id: number;
    numero_lot: string;
    medicament?: {
      id: number;
      nom: string;
    };
  };
}