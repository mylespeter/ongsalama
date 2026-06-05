// app/agent/sinistres/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaFileAlt, FaSearch, FaSpinner, FaClock, FaClipboardList, 
  FaUserCheck, FaEye, FaCheckCircle, FaTimesCircle,
  FaMoneyBillWave, FaUser, FaCalendarAlt, FaExclamationTriangle,
  FaTimes, FaChevronDown, FaChevronRight
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types stricts
type StatutSinistre = 'en_attente' | 'en_cours' | 'expertise' | 'en_indemnisation' | 'cloture' | 'refuse';
type StatutKey = StatutSinistre | 'total';
type FiltreStatut = 'tous' | StatutSinistre;

type Sinistre = {
  id: string;
  numero_dossier: string;
  assure_nom: string;
  assure_email: string;
  type_sinistre: string;
  description: string;
  date_sinistre: string;
  lieu: string;
  statut: StatutSinistre;
  montant_estime: number;
  montant_indemnisation: number;
  created_at: string;
  expertises: Expertise[];
};

type Expertise = {
  id: string;
  expert_nom: string;
  statut: string;
  date_expertise: string;
};

type StatutInfo = {
  label: string;
  color: string;
  icon: IconType;
};

// Objet STATUTS avec type index explicite
const STATUTS: Record<StatutSinistre, StatutInfo> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: FaSpinner },
  expertise: { label: 'Expertise', color: 'bg-purple-100 text-purple-800', icon: FaClipboardList },
  en_indemnisation: { label: 'Indemnisation', color: 'bg-indigo-100 text-indigo-800', icon: FaMoneyBillWave },
  cloture: { label: 'Clôturé', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
  refuse: { label: 'Refusé', color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
};

// Type pour les stats
type StatsType = {
  total: number;
  en_attente: number;
  en_cours: number;
  expertise: number;
  en_indemnisation: number;
  cloture: number;
};

export default function AgentSinistresPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [filteredSinistres, setFilteredSinistres] = useState<Sinistre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    en_attente: 0,
    en_cours: 0,
    expertise: 0,
    en_indemnisation: 0,
    cloture: 0,
  });

  // Helper pour obtenir les infos d'un statut de manière sûre
  const getStatutInfo = (statut: string): StatutInfo => {
    if (statut in STATUTS) {
      return STATUTS[statut as StatutSinistre];
    }
    return { label: statut, color: 'bg-gray-100 text-gray-800', icon: FaClock };
  };

  // Helper pour obtenir les stats de manière sûre
  const getStatValue = (key: string): number => {
    if (key === 'total') return stats.total;
    if (key in stats) return stats[key as keyof StatsType];
    return 0;
  };

  useEffect(() => {
    if (user && (user.role === 'agent' || user.role === 'admin')) {
      chargerSinistres();
    }
  }, [user]);

  useEffect(() => {
    filtrerSinistres();
  }, [sinistres, searchTerm, filtreStatut]);

  const chargerSinistres = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sinistres')
        .select(`
          *,
          assure:users!sinistres_assure_id_fkey(nom, email),
          expertises (
            id, statut, date_expertise,
            expert:users!expertises_expert_id_fkey(nom)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: Sinistre[] = (data || []).map((s: any) => ({
        ...s,
        statut: s.statut as StatutSinistre,
        assure_nom: s.assure?.nom || 'Inconnu',
        assure_email: s.assure?.email || '',
        expertises: (s.expertises || []).map((e: any) => ({
          ...e,
          expert_nom: e.expert?.nom || 'Non assigné',
        })),
      }));

      setSinistres(formatted);
      calculerStats(formatted);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des sinistres');
    } finally {
      setLoading(false);
    }
  };

  const calculerStats = (data: Sinistre[]) => {
    setStats({
      total: data.length,
      en_attente: data.filter(s => s.statut === 'en_attente').length,
      en_cours: data.filter(s => s.statut === 'en_cours').length,
      expertise: data.filter(s => s.statut === 'expertise').length,
      en_indemnisation: data.filter(s => s.statut === 'en_indemnisation').length,
      cloture: data.filter(s => s.statut === 'cloture').length,
    });
  };

  const filtrerSinistres = () => {
    let filtered = [...sinistres];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.numero_dossier?.toLowerCase().includes(term) ||
        s.assure_nom?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }

    if (filtreStatut !== 'tous') {
      filtered = filtered.filter(s => s.statut === filtreStatut);
    }

    setFilteredSinistres(filtered);
  };

  const handleQuickAction = async (sinistreId: string, action: string) => {
    try {
      if (action === 'prendre_en_charge') {
        await supabase
          .from('sinistres')
          .update({ statut: 'en_cours', updated_by: user?.id })
          .eq('id', sinistreId);
        
        await supabase.from('sinistre_historique').insert({
          sinistre_id: sinistreId,
          ancien_statut: 'en_attente',
          nouveau_statut: 'en_cours',
          commentaire: 'Dossier pris en charge par l\'agent',
          modifie_par: user?.id,
        });

        setSuccess('Dossier pris en charge');
        chargerSinistres();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Vérification du rôle
  if (user?.role !== 'agent' && user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
        <h3 className="mt-2 text-lg font-medium">Accès non autorisé</h3>
        <p className="text-sm text-gray-500">Cette page est réservée aux agents d'assurance.</p>
      </div>
    );
  }

  // Liste des clés de stats pour l'affichage
  const statKeys: StatutKey[] = ['total', 'en_attente', 'en_cours', 'expertise', 'en_indemnisation', 'cloture'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FaFileAlt className="mr-3 h-6 w-6 text-blue-600" />
          Gestion des sinistres
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Gérez les dossiers de sinistre, désignez des experts et suivez l'indemnisation
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-sm text-red-700">
          <FaTimesCircle className="mr-2 flex-shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto"><FaTimes className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center text-sm text-green-700">
          <FaCheckCircle className="mr-2 flex-shrink-0" />{success}
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {statKeys.map((key) => {
          const isTotal = key === 'total';
          const statutInfo = isTotal 
            ? { label: 'Tous', color: 'text-gray-500', icon: FaFileAlt }
            : { ...STATUTS[key as StatutSinistre], label: STATUTS[key as StatutSinistre].label };
          
          const StatutIcon = statutInfo.icon;
          const value = getStatValue(key);
          const colorClasses = isTotal ? 'bg-gray-100 text-gray-800' : STATUTS[key as StatutSinistre].color;
          const [bgClass, textClass] = colorClasses.split(' ');
          
          const isActive = filtreStatut === key || (isTotal && filtreStatut === 'tous');
          
          return (
            <button
              key={key}
              onClick={() => setFiltreStatut(isTotal ? 'tous' : key as FiltreStatut)}
              className={`rounded-lg p-3 text-left transition-all hover:shadow-md ${
                isActive
                  ? 'ring-2 ring-blue-500 bg-white shadow-md'
                  : 'bg-white border'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <StatutIcon className={`h-4 w-4 ${textClass || 'text-gray-500'}`} />
                <span className="text-xs text-gray-400">
                  {isTotal ? 'Tous' : key.replace('_', ' ')}
                </span>
              </div>
              <p className={`text-xl font-bold ${textClass || 'text-gray-900'}`}>{value}</p>
            </button>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par n° dossier, assuré..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <span className="text-sm text-gray-500">
            {filteredSinistres.length} dossier(s)
          </span>
          {(searchTerm || filtreStatut !== 'tous') && (
            <button
              onClick={() => { setSearchTerm(''); setFiltreStatut('tous'); }}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FaTimes className="mr-1 h-3 w-3" />Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FaSpinner className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <p className="mt-2 text-gray-500">Chargement des dossiers...</p>
          </div>
        ) : filteredSinistres.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun dossier trouvé</p>
          </div>
        ) : (
          filteredSinistres.map(sinistre => {
            const statutInfo = getStatutInfo(sinistre.statut);
            const StatutIcon = statutInfo.icon;
            const isExpanded = expandedId === sinistre.id;
            const hasExpert = sinistre.expertises?.length > 0;

            return (
              <div key={sinistre.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* En-tête du dossier */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : sinistre.id)}
                >
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-400">
                      {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
                    </button>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold text-blue-600 text-sm">
                          {sinistre.numero_dossier}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statutInfo.color}`}>
                          <StatutIcon className="mr-1 h-3 w-3" />
                          {statutInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                        <span><FaUser className="inline mr-1 h-3 w-3" />{sinistre.assure_nom}</span>
                        <span><FaCalendarAlt className="inline mr-1 h-3 w-3" />{formatDate(sinistre.date_sinistre)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {sinistre.statut === 'expertise' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        hasExpert ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {hasExpert ? 'Expert assigné' : 'En attente expert'}
                      </span>
                    )}

                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      {sinistre.statut === 'en_attente' && (
                        <button
                          onClick={() => handleQuickAction(sinistre.id, 'prendre_en_charge')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Prendre en charge
                        </button>
                      )}
                      {sinistre.statut === 'en_cours' && !hasExpert && (
                        <Link
                          href={`/agent/sinistres/${sinistre.id}/designer-expert`}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                        >
                          Désigner expert
                        </Link>
                      )}
                      <Link
                        href={`/sinistres/${sinistre.id}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 flex items-center"
                      >
                        <FaEye className="mr-1 h-3 w-3" /> Détails
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Détails expandés */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Informations</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-500">Type :</span> {sinistre.type_sinistre}</p>
                          <p><span className="text-gray-500">Lieu :</span> {sinistre.lieu}</p>
                          <p><span className="text-gray-500">Montant estimé :</span> {sinistre.montant_estime?.toLocaleString() || '-'} CDF</p>
                          {sinistre.montant_indemnisation > 0 && (
                            <p className="text-green-600 font-medium">
                              Indemnisation : {sinistre.montant_indemnisation?.toLocaleString()} CDF
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Expertises</h4>
                        {!hasExpert ? (
                          <p className="text-sm text-gray-400">Aucun expert désigné</p>
                        ) : (
                          <div className="space-y-2">
                            {sinistre.expertises.map(exp => (
                              <div key={exp.id} className="flex items-center text-sm">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                                  <FaUserCheck className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{exp.expert_nom}</p>
                                  <p className="text-xs text-gray-500">
                                    {exp.statut === 'terminee' ? '✅ Rapport soumis' : '⏳ En cours'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Actions rapides</h4>
                        <div className="space-y-2">
                          {sinistre.statut === 'en_cours' && !hasExpert && (
                            <Link
                              href={`/agent/sinistres/${sinistre.id}/designer-expert`}
                              className="block w-full text-center px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                            >
                              <FaUserCheck className="inline mr-1 h-3 w-3" /> Désigner un expert
                            </Link>
                          )}
                          {sinistre.statut === 'expertise' && hasExpert && (
                            <button className="block w-full text-center px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                              <FaClipboardList className="inline mr-1 h-3 w-3" /> Voir rapport expertise
                            </button>
                          )}
                          {sinistre.statut === 'expertise' && sinistre.expertises?.some(e => e.statut === 'terminee') && (
                            <Link
                              href={`/agent/sinistres/${sinistre.id}/indemnisation`}
                              className="block w-full text-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              <FaMoneyBillWave className="inline mr-1 h-3 w-3" /> Procéder à l'indemnisation
                            </Link>
                          )}
                          <Link
                            href={`/sinistres/${sinistre.id}`}
                            className="block w-full text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100"
                          >
                            <FaEye className="inline mr-1 h-3 w-3" /> Voir dossier complet
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}