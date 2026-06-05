// app/expert/missions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaClipboardList, FaSpinner, FaCheckCircle, FaCalendarAlt,
  FaFileAlt, FaUser, FaMapMarkerAlt, FaExclamationTriangle,
  FaEye, FaUpload, FaTimes, FaSearch
} from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Mission = {
  id: string;
  sinistre_id: string;
  sinistre_numero: string;
  sinistre_type: string;
  sinistre_lieu: string;
  sinistre_description: string;
  assure_nom: string;
  assure_email: string;
  assure_telephone: string;
  date_designation: string;
  date_expertise: string;
  rapport: string;
  conclusion: string;
  montant_evalue: number;
  statut: 'planifiee' | 'en_cours' | 'terminee';
  created_at: string;
};

const STATUT_MISSION = {
  planifiee: { label: 'Planifiée', color: 'bg-yellow-100 text-yellow-800', icon: FaCalendarAlt },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: FaSpinner },
  terminee: { label: 'Terminée', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
};

export default function ExpertMissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    planifiees: 0,
    en_cours: 0,
    terminees: 0,
  });

  useEffect(() => {
    if (user && user.role === 'expert') {
      chargerMissions();
    }
  }, [user]);

  useEffect(() => {
    filtrerMissions();
  }, [missions, filtreStatut, searchTerm]);

  const chargerMissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expertises')
        .select(`
          *,
          sinistre:sinistres(
            numero_dossier, type_sinistre, lieu, description,
            assure:users!sinistres_assure_id_fkey(nom, email, telephone)
          )
        `)
        .eq('expert_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map(e => ({
        ...e,
        sinistre_numero: e.sinistre?.numero_dossier,
        sinistre_type: e.sinistre?.type_sinistre,
        sinistre_lieu: e.sinistre?.lieu,
        sinistre_description: e.sinistre?.description,
        assure_nom: e.sinistre?.assure?.nom,
        assure_email: e.sinistre?.assure?.email,
        assure_telephone: e.sinistre?.assure?.telephone,
      }));

      setMissions(formatted);
      calculerStats(formatted);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  };

  const calculerStats = (data: Mission[]) => {
    setStats({
      total: data.length,
      planifiees: data.filter(m => m.statut === 'planifiee').length,
      en_cours: data.filter(m => m.statut === 'en_cours').length,
      terminees: data.filter(m => m.statut === 'terminee').length,
    });
  };

  const filtrerMissions = () => {
    let filtered = [...missions];

    if (filtreStatut !== 'tous') {
      filtered = filtered.filter(m => m.statut === filtreStatut);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.sinistre_numero?.toLowerCase().includes(term) ||
        m.assure_nom?.toLowerCase().includes(term) ||
        m.sinistre_lieu?.toLowerCase().includes(term)
      );
    }

    setFilteredMissions(filtered);
  };

  const handleCommencerExpertise = async (missionId: string) => {
    try {
      await supabase
        .from('expertises')
        .update({ statut: 'en_cours' })
        .eq('id', missionId);
      
      chargerMissions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (user?.role !== 'expert') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
        <h3 className="mt-2 text-lg font-medium">Accès non autorisé</h3>
        <p className="text-sm text-gray-500">Cette page est réservée aux experts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FaClipboardList className="mr-3 h-6 w-6 text-purple-600" />
          Mes missions d'expertise
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Consultez et gérez vos missions d'évaluation de sinistres
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-sm text-red-700">
          <FaTimes className="mr-2" />{error}
          <button onClick={() => setError(null)} className="ml-auto"><FaTimes className="h-4 w-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={`rounded-lg p-4 border cursor-pointer ${filtreStatut === 'tous' ? 'ring-2 ring-purple-500' : ''}`}
          onClick={() => setFiltreStatut('tous')}>
          <p className="text-sm text-gray-500">Total missions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className={`rounded-lg p-4 border cursor-pointer ${filtreStatut === 'planifiee' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setFiltreStatut('planifiee')}>
          <p className="text-sm text-yellow-700">Planifiées</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.planifiees}</p>
        </div>
        <div className={`rounded-lg p-4 border cursor-pointer ${filtreStatut === 'en_cours' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFiltreStatut('en_cours')}>
          <p className="text-sm text-blue-700">En cours</p>
          <p className="text-2xl font-bold text-blue-800">{stats.en_cours}</p>
        </div>
        <div className={`rounded-lg p-4 border cursor-pointer ${filtreStatut === 'terminee' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setFiltreStatut('terminee')}>
          <p className="text-sm text-green-700">Terminées</p>
          <p className="text-2xl font-bold text-green-800">{stats.terminees}</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par n° dossier, assuré..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>

      {/* Liste des missions */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Chargement de vos missions...</p>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FaClipboardList className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Aucune mission trouvée</p>
          </div>
        ) : (
          filteredMissions.map(mission => {
            const StatutIcon = STATUT_MISSION[mission.statut]?.icon || FaCalendarAlt;
            const statutColor = STATUT_MISSION[mission.statut]?.color || 'bg-gray-100';

            return (
              <div key={mission.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* En-tête mission */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="font-mono font-semibold text-purple-600">
                        {mission.sinistre_numero}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColor}`}>
                        <StatutIcon className="mr-1 h-3 w-3" />
                        {STATUT_MISSION[mission.statut]?.label}
                      </span>
                    </div>

                    {/* Infos sinistre */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Type de sinistre</p>
                        <p className="text-sm font-medium">{mission.sinistre_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Lieu</p>
                        <p className="text-sm font-medium flex items-center">
                          <FaMapMarkerAlt className="mr-1 h-3 w-3 text-gray-400" />
                          {mission.sinistre_lieu}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Assuré</p>
                        <p className="text-sm font-medium flex items-center">
                          <FaUser className="mr-1 h-3 w-3 text-gray-400" />
                          {mission.assure_nom}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1 h-3 w-3" />
                        Expertise : {formatDate(mission.date_expertise)}
                      </span>
                    </div>

                    {/* Résumé rapport si terminé */}
                    {mission.statut === 'terminee' && mission.rapport && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-green-900 mb-1">Rapport soumis</p>
                        <p className="text-sm text-green-700 line-clamp-2">{mission.rapport}</p>
                        {mission.montant_evalue > 0 && (
                          <p className="text-sm font-semibold text-green-800 mt-1">
                            Montant évalué : {mission.montant_evalue.toLocaleString()} CDF
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      href={`/sinistres/${mission.sinistre_id}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                    >
                      <FaEye className="mr-2 h-3 w-3" />
                      Voir dossier
                    </Link>
                    
                    {mission.statut === 'planifiee' && (
                      <button
                        onClick={() => handleCommencerExpertise(mission.id)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        <FaSpinner className="mr-2 h-3 w-3" />
                        Commencer
                      </button>
                    )}

                    {(mission.statut === 'planifiee' || mission.statut === 'en_cours') && (
                      <Link
                        href={`/sinistres/${mission.sinistre_id}?action=rapport`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        <FaUpload className="mr-2 h-3 w-3" />
                        Rapport
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}