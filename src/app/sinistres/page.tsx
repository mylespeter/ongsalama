// app/sinistres/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FaFileAlt, 
  FaPlus, 
  FaSearch, 
  FaTimes, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaClipboardList,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter
} from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

type Sinistre = {
  id: string;
  numero_dossier: string;
  assure_id: string;
  assure_nom?: string;
  assure_email?: string;
  type_sinistre: string;
  description: string;
  date_sinistre: string;
  lieu: string;
  statut: string;
  montant_estime?: number;
  montant_indemnisation?: number;
  created_at: string;
  updated_at: string;
  documents_count?: number;
};

const TYPES_SINISTRE = {
  accident_auto: { label: 'Accident auto', icon: '🚗', color: 'bg-red-100 text-red-800' },
  vol: { label: 'Vol', icon: '🔫', color: 'bg-gray-100 text-gray-800' },
  incendie: { label: 'Incendie', icon: '🔥', color: 'bg-orange-100 text-orange-800' },
  degats_eau: { label: 'Dégâts des eaux', icon: '💧', color: 'bg-blue-100 text-blue-800' },
  catastrophe_naturelle: { label: 'Catastrophe naturelle', icon: '🌪️', color: 'bg-purple-100 text-purple-800' },
  bris_glace: { label: 'Bris de glace', icon: '🪟', color: 'bg-cyan-100 text-cyan-800' },
  responsabilite_civile: { label: 'Responsabilité civile', icon: '⚖️', color: 'bg-indigo-100 text-indigo-800' },
  autre: { label: 'Autre', icon: '📋', color: 'bg-slate-100 text-slate-800' },
};

const STATUTS = {
  en_attente: { label: 'En attente', icon: FaClock, color: 'bg-yellow-100 text-yellow-800' },
  en_cours: { label: 'En cours', icon: FaSpinner, color: 'bg-blue-100 text-blue-800' },
  expertise: { label: 'Expertise', icon: FaClipboardList, color: 'bg-purple-100 text-purple-800' },
  accepte: { label: 'Accepté', icon: FaCheckCircle, color: 'bg-green-100 text-green-800' },
  refuse: { label: 'Refusé', icon: FaTimesCircle, color: 'bg-red-100 text-red-800' },
  cloture: { label: 'Clôturé', icon: FaCheckCircle, color: 'bg-gray-100 text-gray-800' },
};

export default function SinistresPage() {
  const { user } = useAuth();
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [filteredSinistres, setFilteredSinistres] = useState<Sinistre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtreType, setFiltreType] = useState<string>('tous');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    en_attente: 0,
    en_cours: 0,
    accepte: 0,
    refuse: 0,
  });

  useEffect(() => {
    if (user) {
      chargerSinistres();
    }
  }, [user]);

  useEffect(() => {
    filtrerSinistres();
  }, [sinistres, searchTerm, filtreStatut, filtreType]);

  const chargerSinistres = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sinistres')
        .select(`
          *,
          assure:users!sinistres_assure_id_fkey(nom, email),
          documents:sinistre_documents(count)
        `)
        .order('created_at', { ascending: false });

      // Si l'utilisateur est un assuré, ne voir que ses sinistres
      if (user?.role === 'assure') {
        query = query.eq('assure_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sinistresFormatted = data?.map(s => ({
        ...s,
        assure_nom: s.assure?.nom,
        assure_email: s.assure?.email,
        documents_count: s.documents?.[0]?.count || 0,
      })) || [];

      setSinistres(sinistresFormatted);
      calculerStats(sinistresFormatted);
    } catch (err) {
      console.error('Erreur chargement sinistres:', err);
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
      accepte: data.filter(s => s.statut === 'accepte').length,
      refuse: data.filter(s => s.statut === 'refuse').length,
    });
  };

  const filtrerSinistres = () => {
    let filtered = [...sinistres];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.numero_dossier?.toLowerCase().includes(term) ||
        s.assure_nom?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.lieu?.toLowerCase().includes(term)
      );
    }

    if (filtreStatut !== 'tous') {
      filtered = filtered.filter(s => s.statut === filtreStatut);
    }

    if (filtreType !== 'tous') {
      filtered = filtered.filter(s => s.type_sinistre === filtreType);
    }

    setFilteredSinistres(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const formatMontant = (montant?: number) => {
    if (!montant) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'CDF' }).format(montant);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <FaFileAlt className="mr-3 h-6 w-6 text-blue-600" />
            Gestion des Sinistres
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Déclarez et suivez les dossiers de sinistre
          </p>
        </div>
        <Link
          href="/sinistres/declaration"
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Déclarer un sinistre
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 shadow-sm border border-yellow-200">
          <p className="text-sm font-medium text-yellow-700">En attente</p>
          <p className="text-2xl font-semibold text-yellow-800">{stats.en_attente}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm border border-blue-200">
          <p className="text-sm font-medium text-blue-700">En cours</p>
          <p className="text-2xl font-semibold text-blue-800">{stats.en_cours}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow-sm border border-green-200">
          <p className="text-sm font-medium text-green-700">Acceptés</p>
          <p className="text-2xl font-semibold text-green-800">{stats.accepte}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4 shadow-sm border border-red-200">
          <p className="text-sm font-medium text-red-700">Refusés</p>
          <p className="text-2xl font-semibold text-red-800">{stats.refuse}</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <FaTimesCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <FaCheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-green-500" />
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              {Object.entries(STATUTS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous les types</option>
              {Object.entries(TYPES_SINISTRE).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              {filteredSinistres.length} résultat{filteredSinistres.length > 1 ? 's' : ''}
            </span>
            {(searchTerm || filtreStatut !== 'tous' || filtreType !== 'tous') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltreStatut('tous');
                  setFiltreType('tous');
                }}
                className="ml-auto text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <FaTimes className="mr-1 h-3 w-3" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des sinistres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <p className="mt-2 text-gray-500">Chargement des sinistres...</p>
          </div>
        ) : filteredSinistres.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun sinistre trouvé</p>
            <Link
              href="/sinistres/declaration"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Déclarer un nouveau sinistre
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Dossier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assuré
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date sinistre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSinistres.map((sinistre) => {
                  const typeInfo = TYPES_SINISTRE[sinistre.type_sinistre as keyof typeof TYPES_SINISTRE];
                  const statutInfo = STATUTS[sinistre.statut as keyof typeof STATUTS];
                  const StatutIcon = statutInfo?.icon || FaClock;

                  return (
                    <tr key={sinistre.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-blue-600">
                          {sinistre.numero_dossier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sinistre.assure_nom}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sinistre.assure_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeInfo?.color}`}>
                          {typeInfo?.icon} {typeInfo?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(sinistre.date_sinistre)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutInfo?.color}`}>
                          <StatutIcon className="mr-1 h-3 w-3" />
                          {statutInfo?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center">
                          <FaFileAlt className="mr-1 h-3 w-3" />
                          {sinistre.documents_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/sinistres/${sinistre.id}`}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded inline-flex items-center"
                        >
                          <FaEye className="h-4 w-4 mr-1" />
                          Détails
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}