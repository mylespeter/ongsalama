// app/agent/sinistres/[id]/designer-expert/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft, FaUserCheck, FaCalendarAlt, FaSearch,
  FaSpinner, FaCheckCircle, FaTimesCircle, FaTimes,
  FaEnvelope, FaPhone, FaStar, FaClipboardList
} from 'react-icons/fa';

type Expert = {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  expertises_en_cours?: number;
  expertises_terminees?: number;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function DesignerExpertPage({ params }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [dateExpertise, setDateExpertise] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sinistre, setSinistre] = useState<any>(null);

  useEffect(() => {
    if (user && (user.role === 'agent' || user.role === 'admin')) {
      chargerDonnees();
    }
  }, [user, id]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredExperts(experts.filter(e =>
        e.nom?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term)
      ));
    } else {
      setFilteredExperts(experts);
    }
  }, [searchTerm, experts]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);

      // Charger le sinistre
      const { data: sinistreData } = await supabase
        .from('sinistres')
        .select('*, assure:users!sinistres_assure_id_fkey(nom, email)')
        .eq('id', id)
        .single();
      setSinistre(sinistreData);

      // Charger les experts avec leurs statistiques
      const { data: expertsData } = await supabase
        .from('users')
        .select('id, nom, email, telephone')
        .eq('role', 'expert')
        .order('nom');

      if (expertsData) {
        // Pour chaque expert, compter ses missions
        const expertsWithStats = await Promise.all(
          expertsData.map(async (expert) => {
            const { count: enCours } = await supabase
              .from('expertises')
              .select('id', { count: 'exact', head: true })
              .eq('expert_id', expert.id)
              .in('statut', ['en_attente', 'planifiee', 'en_cours']);

            const { count: terminees } = await supabase
              .from('expertises')
              .select('id', { count: 'exact', head: true })
              .eq('expert_id', expert.id)
              .eq('statut', 'terminee');

            return {
              ...expert,
              expertises_en_cours: enCours || 0,
              expertises_terminees: terminees || 0,
            };
          })
        );

        // Trier par nombre de missions en cours (le moins occupé d'abord)
        expertsWithStats.sort((a, b) => (a.expertises_en_cours || 0) - (b.expertises_en_cours || 0));
        
        setExperts(expertsWithStats);
        setFilteredExperts(expertsWithStats);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDesigner = async () => {
    if (!selectedExpert) {
      setError('Veuillez sélectionner un expert');
      return;
    }
    if (!dateExpertise) {
      setError('Veuillez choisir une date d\'expertise');
      return;
    }

    try {
      setSaving(true);

      // Créer l'expertise
      const { error: expertiseError } = await supabase
        .from('expertises')
        .insert({
          sinistre_id: id,
          expert_id: selectedExpert,
          date_designation: new Date().toISOString(),
          date_expertise: dateExpertise,
          statut: 'planifiee',
        });

      if (expertiseError) throw expertiseError;

      // Mettre à jour le statut du sinistre
      await supabase
        .from('sinistres')
        .update({ statut: 'expertise', updated_by: user?.id })
        .eq('id', id);

      // Ajouter à l'historique
      await supabase.from('sinistre_historique').insert({
        sinistre_id: id,
        ancien_statut: sinistre?.statut || 'en_cours',
        nouveau_statut: 'expertise',
        commentaire: commentaire || 'Expert désigné pour évaluation',
        modifie_par: user?.id,
      });

      // Ajouter une communication
      await supabase.from('sinistre_communications').insert({
        sinistre_id: id,
        type: 'notification',
        contenu: `Expert désigné. Date d'expertise prévue : ${new Date(dateExpertise).toLocaleDateString('fr-FR')}. ${commentaire}`,
        expediteur_id: user?.id,
      });

      setSuccess('Expert désigné avec succès ! Redirection...');
      setTimeout(() => {
        router.push(`/sinistres/${id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la désignation');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'agent' && user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Accès non autorisé</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <Link href={`/sinistres/${id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <FaArrowLeft className="mr-2 h-4 w-4" /> Retour au dossier
        </Link>
        <h1 className="text-2xl font-semibold flex items-center">
          <FaUserCheck className="mr-3 h-6 w-6 text-purple-600" />
          Désigner un expert
        </h1>
        {sinistre && (
          <p className="mt-1 text-sm text-gray-500">
            Dossier {sinistre.numero_dossier} - {sinistre.assure?.nom}
          </p>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-sm text-red-700">
          <FaTimesCircle className="mr-2" />{error}
          <button onClick={() => setError(null)} className="ml-auto"><FaTimes className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center text-sm text-green-700">
          <FaCheckCircle className="mr-2" />{success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des experts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un expert..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin mx-auto h-8 w-8 text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExperts.map(expert => (
                  <div
                    key={expert.id}
                    onClick={() => setSelectedExpert(expert.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedExpert === expert.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <FaUserCheck className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{expert.nom}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <FaEnvelope className="mr-1 h-3 w-3" />{expert.email}
                            </span>
                            {expert.telephone && (
                              <span className="flex items-center">
                                <FaPhone className="mr-1 h-3 w-3" />{expert.telephone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                            {expert.expertises_en_cours} en cours
                          </span>
                          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {expert.expertises_terminees} terminées
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de désignation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="font-semibold text-lg mb-4">Désignation</h3>
            
            {selectedExpert && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">
                  Expert sélectionné : {experts.find(e => e.id === selectedExpert)?.nom}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="inline mr-1 h-3 w-3" />
                  Date de l'expertise *
                </label>
                <input
                  type="datetime-local"
                  value={dateExpertise}
                  onChange={(e) => setDateExpertise(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Instructions pour l'expert..."
                />
              </div>

              <button
                onClick={handleDesigner}
                disabled={!selectedExpert || !dateExpertise || saving}
                className="w-full bg-purple-600 text-white rounded-md py-2.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><FaSpinner className="animate-spin inline mr-2 h-3 w-3" />Désignation...</>
                ) : (
                  <><FaUserCheck className="inline mr-2 h-4 w-4" />Désigner l'expert</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}