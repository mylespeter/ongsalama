// app/sinistres/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, FaEdit, FaUpload, FaDownload, FaFileAlt,
  FaCheckCircle, FaTimesCircle, FaClock, FaSpinner,
  FaUser, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave,
  FaHistory, FaTimes, FaExclamationTriangle, FaClipboardList,
  FaUserCheck, FaUserTie, FaSearch, FaPaperPlane,
  FaComments, FaPhone, FaEnvelope, FaBuilding, FaChevronRight,
  FaClipboardCheck, FaFileContract, FaHandshake
} from 'react-icons/fa';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types enrichis
type Assure = {
  nom: string;
  email: string;
  telephone?: string;
  photo_profil?: string;
};

type Expert = {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  specialite?: string;
};

type Expertise = {
  id: string;
  expert_id: string;
  expert_nom: string;
  expert_email: string;
  date_designation: string;
  date_expertise: string | null;
  rapport: string | null;
  conclusion: string | null;
  montant_evalue: number | null;
  statut: 'en_attente' | 'planifiee' | 'en_cours' | 'terminee';
  documents: ExpertiseDocument[];
  created_at: string;
};

type ExpertiseDocument = {
  id: string;
  nom_fichier: string;
  url_fichier: string;
  type_document: string;
  created_at: string;
};

type Communication = {
  id: string;
  type: 'note' | 'notification' | 'message';
  contenu: string;
  expediteur_nom: string;
  expediteur_role: string;
  created_at: string;
};

// Statuts enrichis avec progression
const STATUTS: Record<string, { 
  label: string; 
  icon: React.ComponentType<any>; 
  color: string;
  progress: number;
  description: string;
}> = {
  en_attente: { 
    label: 'En attente', 
    icon: FaClock, 
    color: 'bg-yellow-100 text-yellow-800',
    progress: 10,
    description: 'Dossier reçu, en attente de traitement'
  },
  en_cours: { 
    label: 'En cours de traitement', 
    icon: FaSpinner, 
    color: 'bg-blue-100 text-blue-800',
    progress: 30,
    description: 'Dossier pris en charge par un agent'
  },
  expertise: { 
    label: 'En expertise', 
    icon: FaClipboardList, 
    color: 'bg-purple-100 text-purple-800',
    progress: 50,
    description: 'Expert désigné, évaluation en cours'
  },
  en_indemnisation: { 
    label: 'En indemnisation', 
    icon: FaMoneyBillWave, 
    color: 'bg-indigo-100 text-indigo-800',
    progress: 75,
    description: 'Indemnisation en cours de versement'
  },
  cloture: { 
    label: 'Clôturé', 
    icon: FaCheckCircle, 
    color: 'bg-green-100 text-green-800',
    progress: 100,
    description: 'Dossier clôturé'
  },
  refuse: { 
    label: 'Refusé', 
    icon: FaTimesCircle, 
    color: 'bg-red-100 text-red-800',
    progress: 0,
    description: 'Dossier refusé'
  },
};

// Composant Avatar
function AssureAvatar({ assure, size = 'md' }: { assure: Assure; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-16 w-16 text-lg' };
  const getInitials = (nom: string) => nom?.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) || '??';
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
      {assure.photo_profil ? (
        <img src={assure.photo_profil} alt={assure.nom} className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.classList.add('bg-orange-600', 'flex', 'items-center', 'justify-center');
            target.parentElement!.innerHTML = `<span class="text-white font-medium">${getInitials(assure.nom || '')}</span>`;
          }}
        />
      ) : (
        <div className="w-full h-full bg-orange-600 flex items-center justify-center">
          <span className="text-white font-medium">{getInitials(assure.nom || '')}</span>
        </div>
      )}
    </div>
  );
}

type Props = { params: Promise<{ id: string }> };

export default function SinistreDetailPage({ params }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  const [sinistre, setSinistre] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Experts disponibles
  const [experts, setExperts] = useState<Expert[]>([]);
  const [showDesignateExpert, setShowDesignateExpert] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState('');
  const [dateExpertise, setDateExpertise] = useState('');

  // Rapport expertise
  const [showRapportModal, setShowRapportModal] = useState(false);
  const [editingExpertise, setEditingExpertise] = useState<Expertise | null>(null);
  const [rapportForm, setRapportForm] = useState({
    rapport: '',
    conclusion: '',
    montant_evalue: 0,
  });
  const [rapportFiles, setRapportFiles] = useState<File[]>([]);

  // Communication
  const [newMessage, setNewMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  useEffect(() => {
    if (user && id) {
      chargerTout();
      if (['admin', 'agent'].includes(user.role || '')) {
        chargerExperts();
      }
    }
  }, [user, id]);

  const chargerTout = async () => {
    try {
      setLoading(true);
      await Promise.all([
        chargerSinistre(),
        chargerExpertises(),
        chargerCommunications(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chargerSinistre = async () => {
    const { data, error } = await supabase
      .from('sinistres')
      .select(`*, assure:users!sinistres_assure_id_fkey(nom, email, telephone, photo_profil), creator:users!sinistres_created_by_fkey(nom)`)
      .eq('id', id).single();
    if (error) throw error;
    setSinistre(data);

    const { data: docs } = await supabase.from('sinistre_documents').select('*').eq('sinistre_id', id).order('created_at', { ascending: false });
    setDocuments(docs || []);

    const { data: hist } = await supabase.from('sinistre_historique').select('*, modifie_par:users(nom)').eq('sinistre_id', id).order('created_at', { ascending: false });
    setHistorique(hist || []);
  };

  const chargerExpertises = async () => {
    const { data, error } = await supabase
      .from('expertises')
      .select(`*, expert:users!expertises_expert_id_fkey(nom, email), documents:expertise_documents(*)`)
      .eq('sinistre_id', id)
      .order('created_at', { ascending: false });
    if (!error) {
      setExpertises((data || []).map(e => ({
        ...e,
        expert_nom: e.expert?.nom,
        expert_email: e.expert?.email,
      })));
    }
  };

  const chargerCommunications = async () => {
    const { data } = await supabase
      .from('sinistre_communications')
      .select(`*, expediteur:users(nom, role)`)
      .eq('sinistre_id', id)
      .order('created_at', { ascending: false })
      .limit(50);
    setCommunications((data || []).map(c => ({
      ...c,
      expediteur_nom: c.expediteur?.nom,
      expediteur_role: c.expediteur?.role,
    })));
  };

  const chargerExperts = async () => {
    const { data } = await supabase.from('users').select('id, nom, email, telephone').eq('role', 'expert').order('nom');
    setExperts(data || []);
  };

  // ============ ACTIONS AGENT ============
  
  // Désigner un expert
  const handleDesignateExpert = async () => {
    if (!selectedExpert || !dateExpertise) {
      setError('Veuillez sélectionner un expert et une date');
      return;
    }
    try {
      const { error } = await supabase.from('expertises').insert({
        sinistre_id: id,
        expert_id: selectedExpert,
        date_designation: new Date().toISOString(),
        date_expertise: dateExpertise,
        statut: 'planifiee',
      });
      if (error) throw error;

      // Mettre à jour le statut du sinistre si nécessaire
      if (sinistre.statut === 'en_cours') {
        await supabase.from('sinistres').update({ statut: 'expertise', updated_by: user?.id }).eq('id', id);
      }

      await ajouterHistorique('expertise', 'Expert désigné pour expertise');
      await ajouterCommunication('notification', `Expert désigné. Date d'expertise prévue : ${formatDate(dateExpertise)}`);
      
      setSuccess('Expert désigné avec succès');
      setShowDesignateExpert(false);
      setSelectedExpert('');
      setDateExpertise('');
      await chargerTout();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ============ ACTIONS EXPERT ============
  
  // Soumettre rapport d'expertise
  const handleSubmitRapport = async () => {
    if (!editingExpertise) return;
    try {
      const { error } = await supabase.from('expertises').update({
        rapport: rapportForm.rapport,
        conclusion: rapportForm.conclusion,
        montant_evalue: rapportForm.montant_evalue,
        statut: 'terminee',
        date_expertise: new Date().toISOString(),
      }).eq('id', editingExpertise.id);
      if (error) throw error;

      // Upload documents expertise
      for (const file of rapportFiles) {
        const fileName = `expertises/${id}/${Date.now()}-${file.name}`;
        await supabase.storage.from('expertises').upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from('expertises').getPublicUrl(fileName);
        await supabase.from('expertise_documents').insert({
          expertise_id: editingExpertise.id,
          nom_fichier: file.name,
          url_fichier: publicUrl,
          type_document: 'rapport',
          taille_fichier: file.size,
          type_mime: file.type,
        });
      }

      await ajouterHistorique('expertise', 'Rapport d\'expertise soumis');
      await ajouterCommunication('notification', `Rapport d'expertise déposé. Montant évalué : ${formatMontant(rapportForm.montant_evalue)}`);
      
      setSuccess('Rapport d\'expertise soumis avec succès');
      setShowRapportModal(false);
      setRapportFiles([]);
      await chargerTout();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ============ COMMUNICATIONS ============
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const { error } = await supabase.from('sinistre_communications').insert({
        sinistre_id: id,
        type: user?.role === 'assure' ? 'message' : 'note',
        contenu: newMessage,
        expediteur_id: user?.id,
      });
      if (error) throw error;
      setNewMessage('');
      await chargerCommunications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ============ CHANGEMENT STATUT ============
  
  const handleChangeStatus = async () => {
    if (!newStatus) return;
    try {
      const updateData: any = { statut: newStatus, updated_by: user?.id };
      if (newStatus === 'en_indemnisation' && sinistre.montant_indemnisation) {
        updateData.montant_indemnisation = sinistre.montant_indemnisation;
      }
      const { error } = await supabase.from('sinistres').update(updateData).eq('id', id);
      if (error) throw error;

      await ajouterHistorique(sinistre.statut, statusComment || `Statut changé en "${STATUTS[newStatus]?.label}"`);
      await ajouterCommunication('notification', `Statut mis à jour : ${STATUTS[newStatus]?.label}. ${statusComment}`);
      
      setSuccess('Statut mis à jour');
      setShowStatusModal(false);
      setNewStatus('');
      setStatusComment('');
      await chargerSinistre();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ============ HELPERS ============
  
  const ajouterHistorique = async (ancienStatut: string, commentaire: string) => {
    await supabase.from('sinistre_historique').insert({
      sinistre_id: id,
      ancien_statut: ancienStatut,
      nouveau_statut: sinistre.statut,
      commentaire,
      modifie_par: user?.id,
    });
  };

  const ajouterCommunication = async (type: string, contenu: string) => {
    await supabase.from('sinistre_communications').insert({
      sinistre_id: id, type, contenu, expediteur_id: user?.id,
    });
  };

  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr }); }
    catch { return dateString; }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'CDF' }).format(montant);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-indigo-500';
    if (progress >= 50) return 'bg-purple-500';
    if (progress >= 30) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <FaSpinner className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
        <p className="mt-2 text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!sinistre) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
        <p className="mt-2 text-gray-500">Sinistre non trouvé</p>
        <Link href="/sinistres" className="mt-4 text-blue-600">Retour</Link>
      </div>
    );
  }

  const statutInfo = STATUTS[sinistre.statut] || STATUTS.en_attente;
  const StatutIcon = statutInfo.icon;
  const isAgent = ['admin', 'agent'].includes(user?.role || '');
  const isExpert = user?.role === 'expert';
  const isAssure = user?.role === 'assure';
  const monExpertise = isExpert ? expertises.find(e => e.expert_id === user?.id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <Link href="/sinistres" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <FaArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaFileContract className="mr-3 h-6 w-6 text-blue-600" />
              Dossier {sinistre.numero_dossier}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Créé le {formatDate(sinistre.created_at)}</p>
          </div>
          <div className="flex space-x-2">
            {isAgent && (
              <>
                <button onClick={() => setShowDesignateExpert(true)}
                  className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700">
                  <FaUserCheck className="mr-2 h-4 w-4" /> Désigner expert
                </button>
                <button onClick={() => setShowStatusModal(true)}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <FaEdit className="mr-2 h-4 w-4" /> Changer statut
                </button>
              </>
            )}
            {isExpert && monExpertise && monExpertise.statut !== 'terminee' && (
              <button onClick={() => { setEditingExpertise(monExpertise); setRapportForm({
                rapport: monExpertise.rapport || '',
                conclusion: monExpertise.conclusion || '',
                montant_evalue: monExpertise.montant_evalue || sinistre.montant_estime || 0,
              }); setShowRapportModal(true); }}
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
                <FaClipboardCheck className="mr-2 h-4 w-4" /> Soumettre rapport
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-sm text-red-700">
        <FaTimesCircle className="mr-2 flex-shrink-0" />{error}
        <button onClick={() => setError(null)} className="ml-auto"><FaTimes className="h-4 w-4" /></button>
      </div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center text-sm text-green-700">
        <FaCheckCircle className="mr-2 flex-shrink-0" />{success}
      </div>}

      {/* Barre de progression */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression du dossier</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutInfo.color}`}>
            <StatutIcon className="mr-1 h-3 w-3" />
            {statutInfo.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(statutInfo.progress)}`}
            style={{ width: `${statutInfo.progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {Object.entries(STATUTS).filter(([k]) => !['refuse'].includes(k)).map(([key, val]) => (
            <span key={key} className={sinistre.statut === key ? 'font-semibold text-gray-900' : ''}>
              {val.label.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos sinistre */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Informations du sinistre</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Type" value={`${TYPES_SINISTRE[sinistre.type_sinistre]?.icon} ${TYPES_SINISTRE[sinistre.type_sinistre]?.label}`} />
              <InfoItem label="Date sinistre" value={formatDate(sinistre.date_sinistre)} icon={FaCalendarAlt} />
              <InfoItem label="Lieu" value={sinistre.lieu} icon={FaMapMarkerAlt} />
              <InfoItem label="Montant estimé" value={sinistre.montant_estime ? formatMontant(sinistre.montant_estime) : '-'} icon={FaMoneyBillWave} />
              {sinistre.montant_indemnisation && <InfoItem label="Indemnisation" value={formatMontant(sinistre.montant_indemnisation)} icon={FaMoneyBillWave} color="text-green-600" />}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{sinistre.description}</p>
            </div>
          </div>

          {/* Expertises */}
          {expertises.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaClipboardList className="mr-2 h-5 w-5 text-purple-600" />
                Expertises
              </h2>
              <div className="space-y-4">
                {expertises.map(expertise => (
                  <div key={expertise.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <FaUserCheck className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{expertise.expert_nom}</p>
                          <p className="text-xs text-gray-500">{expertise.expert_email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        expertise.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                        expertise.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expertise.statut === 'terminee' ? 'Terminée' :
                         expertise.statut === 'en_cours' ? 'En cours' : 'Planifiée'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Date désignation :</span>
                        <span className="ml-1">{formatDate(expertise.date_designation)}</span>
                      </div>
                      {expertise.date_expertise && (
                        <div>
                          <span className="text-gray-500">Date expertise :</span>
                          <span className="ml-1">{formatDate(expertise.date_expertise)}</span>
                        </div>
                      )}
                    </div>

                    {expertise.rapport && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-1">Rapport d'expertise</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{expertise.rapport}</p>
                        {expertise.conclusion && (
                          <p className="text-sm mt-2"><span className="font-medium">Conclusion :</span> {expertise.conclusion}</p>
                        )}
                        {expertise.montant_evalue && (
                          <p className="text-sm font-semibold text-purple-600 mt-1">
                            Montant évalué : {formatMontant(expertise.montant_evalue)}
                          </p>
                        )}
                      </div>
                    )}

                    {expertise.documents?.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">Documents d'expertise</p>
                        <div className="space-y-1">
                          {expertise.documents.map((doc: ExpertiseDocument) => (
                            <a key={doc.id} href={doc.url_fichier} target="_blank" rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                              <FaDownload className="mr-2 h-3 w-3" /> {doc.nom_fichier}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Documents</h2>
              <label className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">
                <FaUpload className="mr-2 h-3 w-3" /> Ajouter
                <input type="file" multiple className="hidden" onChange={async (e) => {
                  if (e.target.files) {
                    for (const file of Array.from(e.target.files)) {
                      const fileName = `${id}/${Date.now()}-${file.name}`;
                      await supabase.storage.from('sinistres').upload(fileName, file);
                      const { data: { publicUrl } } = supabase.storage.from('sinistres').getPublicUrl(fileName);
                      await supabase.from('sinistre_documents').insert({
                        sinistre_id: id, nom_fichier: file.name, url_fichier: publicUrl,
                        type_document: 'autre_document', taille_fichier: file.size,
                        type_mime: file.type, uploaded_by: user?.id,
                      });
                    }
                    await chargerSinistre();
                  }
                }} />
              </label>
            </div>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucun document</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FaFileAlt className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{doc.nom_fichier}</p>
                        <p className="text-xs text-gray-500">{doc.taille_fichier ? `${(doc.taille_fichier / 1024 / 1024).toFixed(2)} MB` : ''}</p>
                      </div>
                    </div>
                    <a href={doc.url_fichier} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      <FaDownload className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Carte Assuré */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaUser className="mr-2 h-4 w-4 text-gray-400" /> Assuré
            </h2>
            <div className="flex items-center mb-3">
              <AssureAvatar assure={sinistre.assure || {}} size="lg" />
              <div className="ml-3">
                <p className="text-sm font-medium">{sinistre.assure?.nom || 'Inconnu'}</p>
                <p className="text-xs text-gray-500">{sinistre.assure?.email}</p>
              </div>
            </div>
            {sinistre.assure?.telephone && (
              <div className="flex items-center text-sm text-gray-600 border-t pt-3">
                <FaPhone className="mr-2 h-3 w-3 text-gray-400" /> {sinistre.assure.telephone}
              </div>
            )}
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              <p>Créé par : {sinistre.creator?.nom || 'Système'}</p>
            </div>
          </div>

          {/* Communication rapide */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FaComments className="mr-2 h-4 w-4 text-blue-500" /> Communication
            </h2>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {communications.slice(0, 5).map(comm => (
                <div key={comm.id} className={`p-2 rounded text-sm ${
                  comm.type === 'notification' ? 'bg-blue-50' :
                  comm.type === 'note' ? 'bg-yellow-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium">{comm.expediteur_nom}</span>
                    <span className="text-xs text-gray-400">{formatDate(comm.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-700">{comm.contenu}</p>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ajouter une note..." className="flex-1 text-sm border rounded px-2 py-1.5"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                <FaPaperPlane className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Historique */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaHistory className="mr-2 h-4 w-4 text-gray-400" /> Historique
            </h2>
            {historique.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun historique</p>
            ) : (
              <div className="space-y-3">
                {historique.map(entry => (
                  <div key={entry.id} className="border-l-2 border-blue-200 pl-3">
                    <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
                    <p className="text-sm">
                      {entry.ancien_statut && (
                        <span className="text-gray-500">{STATUTS[entry.ancien_statut]?.label} → </span>
                      )}
                      <span className="font-medium">{STATUTS[entry.nouveau_statut]?.label}</span>
                    </p>
                    {entry.commentaire && <p className="text-xs text-gray-600">{entry.commentaire}</p>}
                    <p className="text-xs text-gray-400">Par {entry.modifie_par?.nom || 'Système'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Désignation Expert */}
      {showDesignateExpert && (
        <Modal onClose={() => setShowDesignateExpert(false)} title="Désigner un expert">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expert *</label>
              <select value={selectedExpert} onChange={(e) => setSelectedExpert(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">Sélectionner un expert</option>
                {experts.map(expert => (
                  <option key={expert.id} value={expert.id}>{expert.nom} ({expert.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date d'expertise *</label>
              <input type="datetime-local" value={dateExpertise} onChange={(e) => setDateExpertise(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={handleDesignateExpert}
                className="flex-1 bg-purple-600 text-white rounded-md py-2 text-sm hover:bg-purple-700">
                <FaUserCheck className="inline mr-2 h-3 w-3" /> Désigner
              </button>
              <button onClick={() => setShowDesignateExpert(false)}
                className="flex-1 border rounded-md py-2 text-sm hover:bg-gray-50">Annuler</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Rapport Expertise */}
      {showRapportModal && (
        <Modal onClose={() => setShowRapportModal(false)} title="Rapport d'expertise">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rapport détaillé *</label>
              <textarea value={rapportForm.rapport} onChange={(e) => setRapportForm({...rapportForm, rapport: e.target.value})}
                rows={5} className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Décrivez les dommages constatés..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Conclusion</label>
              <textarea value={rapportForm.conclusion} onChange={(e) => setRapportForm({...rapportForm, conclusion: e.target.value})}
                rows={2} className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Votre conclusion..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant évalué (CDF)</label>
              <input type="number" value={rapportForm.montant_evalue}
                onChange={(e) => setRapportForm({...rapportForm, montant_evalue: Number(e.target.value)})}
                className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photos/ Documents</label>
              <input type="file" multiple onChange={(e) => setRapportFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="w-full text-sm" accept=".jpg,.jpeg,.png,.pdf" />
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={handleSubmitRapport}
                className="flex-1 bg-green-600 text-white rounded-md py-2 text-sm hover:bg-green-700">
                <FaPaperPlane className="inline mr-2 h-3 w-3" /> Soumettre
              </button>
              <button onClick={() => setShowRapportModal(false)}
                className="flex-1 border rounded-md py-2 text-sm hover:bg-gray-50">Annuler</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Changement Statut */}
      {showStatusModal && (
        <Modal onClose={() => setShowStatusModal(false)} title="Changer le statut">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nouveau statut</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">Sélectionner</option>
                {Object.entries(STATUTS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commentaire</label>
              <textarea value={statusComment} onChange={(e) => setStatusComment(e.target.value)}
                rows={2} className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={handleChangeStatus} disabled={!newStatus}
                className="flex-1 bg-blue-600 text-white rounded-md py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                Confirmer
              </button>
              <button onClick={() => setShowStatusModal(false)}
                className="flex-1 border rounded-md py-2 text-sm hover:bg-gray-50">Annuler</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Composant InfoItem
function InfoItem({ label, value, icon: Icon, color }: { label: string; value: string; icon?: any; color?: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className={`mt-1 text-sm ${color || 'text-gray-900'}`}>
        {Icon && <Icon className="inline mr-1 h-3 w-3 text-gray-400" />}
        {value}
      </dd>
    </div>
  );
}

// Composant Modal
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose}><FaTimes className="h-5 w-5 text-gray-400" /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Types sinistre (pour référence)
const TYPES_SINISTRE: Record<string, { label: string; icon: string }> = {
  accident_auto: { label: 'Accident auto', icon: '🚗' },
  vol: { label: 'Vol', icon: '🔫' },
  incendie: { label: 'Incendie', icon: '🔥' },
  degats_eau: { label: 'Dégâts des eaux', icon: '💧' },
  catastrophe_naturelle: { label: 'Catastrophe naturelle', icon: '🌪️' },
  bris_glace: { label: 'Bris de glace', icon: '🪟' },
  responsabilite_civile: { label: 'Responsabilité civile', icon: '⚖️' },
  autre: { label: 'Autre', icon: '📋' },
};