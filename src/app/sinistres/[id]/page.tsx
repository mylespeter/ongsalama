

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
  FaUserCheck, FaSearch, FaPaperPlane,
  FaComments, FaPhone, FaClipboardCheck, FaFileContract,
  FaExchangeAlt, FaCheck
} from 'react-icons/fa';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// AJOUTER cet import avec les autres imports
import { useNotifications } from '@/hooks/useNotifications';

// ==================== TYPES ====================

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
  photo_profil?: string;
  expertises_en_cours?: number;
  expertises_terminees?: number;
};

type Expertise = {
  id: string;
  expert_id: string;
  expert_nom: string;
  expert_email: string;
  expert_photo?: string;
  date_designation: string;
  date_expertise: string | null;
  rapport: string | null;
  conclusion: string | null;
  montant_evalue: number | null;
  statut: 'planifiee' | 'en_cours' | 'terminee';
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

// ==================== CONSTANTES ====================

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

// ==================== COMPOSANTS ====================

function UserAvatar({ 
  user, 
  size = 'md', 
  role = 'assure' 
}: { 
  user: { nom?: string; email?: string; photo_profil?: string; role?: string }; 
  size?: 'sm' | 'md' | 'lg';
  role?: 'assure' | 'expert' | 'agent' | 'admin';
}) {
  const sizeClasses = { 
    sm: 'h-8 w-8 text-xs', 
    md: 'h-12 w-12 text-sm', 
    lg: 'h-16 w-16 text-lg' 
  };
  
  const getInitials = (nom?: string) => {
    if (!nom) return '??';
    return nom.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
  };

  const getBgColor = () => {
    const colors: Record<string, string> = {
      assure: 'bg-orange-600',
      expert: 'bg-purple-600',
      agent: 'bg-green-600',
      admin: 'bg-blue-600',
    };
    return colors[role] || 'bg-gray-600';
  };

  const getRoleIcon = () => {
    const icons: Record<string, string> = {
      expert: '🔍',
      agent: '💼',
      admin: '🛡️',
      assure: '👤',
    };
    return icons[role] || '';
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 relative`}>
      {user.photo_profil ? (
        <img 
          src={user.photo_profil} 
          alt={user.nom || 'Utilisateur'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.classList.add(getBgColor(), 'flex', 'items-center', 'justify-center');
            target.parentElement!.innerHTML = `<span class="text-white font-medium">${getInitials(user.nom)}</span>`;
          }}
        />
      ) : (
        <div className={`w-full h-full ${getBgColor()} flex items-center justify-center`}>
          <span className="text-white font-medium">{getInitials(user.nom)}</span>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon: Icon, color }: { 
  label: string; 
  value: string; 
  icon?: React.ComponentType<any>; 
  color?: string 
}) {
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

function Modal({ children, onClose, title }: { 
  children: React.ReactNode; 
  onClose: () => void; 
  title: string 
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ==================== PAGE PRINCIPALE ====================

type Props = { params: Promise<{ id: string }> };

export default function SinistreDetailPage({ params }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = use(params);
const { notifierAssure, notifierExpert } = useNotifications();
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
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [showDesignateExpert, setShowDesignateExpert] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [searchExpertTerm, setSearchExpertTerm] = useState('');
  const [dateExpertise, setDateExpertise] = useState('');
  const [designationComment, setDesignationComment] = useState('');

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

  useEffect(() => {
    if (searchExpertTerm.trim() === '') {
      setFilteredExperts(experts);
    } else {
      const term = searchExpertTerm.toLowerCase();
      setFilteredExperts(
        experts.filter(e => 
          e.nom?.toLowerCase().includes(term) ||
          e.email?.toLowerCase().includes(term) ||
          e.telephone?.includes(term)
        )
      );
    }
  }, [searchExpertTerm, experts]);

  // ==================== CHARGEMENT DONNÉES ====================

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
      .select(`*, expert:users!expertises_expert_id_fkey(nom, email, photo_profil), documents:expertise_documents(*)`)
      .eq('sinistre_id', id)
      .order('created_at', { ascending: false });
    if (!error) {
      setExpertises((data || []).map(e => ({
        ...e,
        expert_nom: e.expert?.nom,
        expert_email: e.expert?.email,
        expert_photo: e.expert?.photo_profil,
      })));
    }
  };

  const chargerCommunications = async () => {
    const { data } = await supabase
      .from('sinistre_communications')
      .select(`*, expediteur:users(nom, role, photo_profil)`)
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
    const { data } = await supabase
      .from('users')
      .select('id, nom, email, telephone, photo_profil')
      .eq('role', 'expert')
      .order('nom');
    
    if (data) {
      const expertsWithStats = await Promise.all(
        data.map(async (expert) => {
          const { count: enCours } = await supabase
            .from('expertises')
            .select('id', { count: 'exact', head: true })
            .eq('expert_id', expert.id)
            .in('statut', ['planifiee', 'en_cours']);

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
      
      expertsWithStats.sort((a, b) => (a.expertises_en_cours || 0) - (b.expertises_en_cours || 0));
      
      setExperts(expertsWithStats);
      setFilteredExperts(expertsWithStats);
    }
  };



  const handleDesignateExpert = async () => {
  if (!selectedExpert || !dateExpertise) {
    setError('Veuillez sélectionner un expert et une date');
    return;
  }
  try {
    const expertiseExistante = expertises.find(e => e.statut !== 'terminee');
    
    if (expertiseExistante) {
      const { error } = await supabase
        .from('expertises')
        .update({
          expert_id: selectedExpert.id,
          date_expertise: dateExpertise,
          date_designation: new Date().toISOString(),
        })
        .eq('id', expertiseExistante.id);
      
      if (error) throw error;
      
      await ajouterHistorique('expertise', `Changement d'expert : ${selectedExpert.nom}`);
      await ajouterCommunication('notification', 
        `Changement d'expert. Nouvel expert : ${selectedExpert.nom}. Date prévue : ${formatDate(dateExpertise)}`
      );
      
      // ✅ AJOUTER NOTIFICATION
      await notifierAssure(id, 'expertDesigne', {
        expertName: selectedExpert.nom,
        dateExpertise: formatDate(dateExpertise),
      });
      
      setSuccess('Expert changé avec succès');
    } else {
      const { data: newExpertise, error } = await supabase.from('expertises').insert({
        sinistre_id: id,
        expert_id: selectedExpert.id,
        date_designation: new Date().toISOString(),
        date_expertise: dateExpertise,
        statut: 'planifiee',
      }).select().single();
      
      if (error) throw error;

      if (sinistre.statut === 'en_cours') {
        await supabase.from('sinistres')
          .update({ statut: 'expertise', updated_by: user?.id })
          .eq('id', id);
      }

      await ajouterHistorique(sinistre.statut, `Expert désigné : ${selectedExpert.nom}`);
      await ajouterCommunication('notification', 
        `Expert désigné : ${selectedExpert.nom}. Date d'expertise prévue : ${formatDate(dateExpertise)}`
      );
      
      // ✅ AJOUTER NOTIFICATIONS
      await notifierAssure(id, 'expertDesigne', {
        expertName: selectedExpert.nom,
        dateExpertise: formatDate(dateExpertise),
      });
      
      if (newExpertise) {
        await notifierExpert(newExpertise.id);
      }
      
      setSuccess('Expert désigné avec succès');
    }

    setShowDesignateExpert(false);
    setSelectedExpert(null);
    setSearchExpertTerm('');
    setDateExpertise('');
    setDesignationComment('');
    
    await chargerTout();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err: any) {
    setError(err.message);
  }
};




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
    
    // ✅ AJOUTER NOTIFICATION
    await notifierAssure(id, 'rapportExpertise', {
      montantEvalue: formatMontant(rapportForm.montant_evalue),
    });
    
    setSuccess('Rapport d\'expertise soumis avec succès');
    setShowRapportModal(false);
    setRapportFiles([]);
    await chargerTout();
    setTimeout(() => setSuccess(null), 3000);
  } catch (err: any) {
    setError(err.message);
  }
};










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
    
    // ✅ AJOUTER NOTIFICATIONS SELON LE STATUT
    if (newStatus === 'en_cours') {
      await notifierAssure(id, 'dossierPrisEnCharge', {
        agentName: user?.nom || 'Notre agent',
      });
    } else if (newStatus === 'en_indemnisation') {
      await notifierAssure(id, 'indemnisation', {
        montantIndemnisation: formatMontant(sinistre.montant_indemnisation || sinistre.montant_estime || 0),
      });
    } else if (newStatus === 'cloture') {
      await notifierAssure(id, 'dossierCloture', {});
    }
    
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

 
  const handleUploadDocuments = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const fileName = `${id}/${Date.now()}-${file.name}`;
      await supabase.storage.from('sinistres').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('sinistres').getPublicUrl(fileName);
      await supabase.from('sinistre_documents').insert({
        sinistre_id: id,
        nom_fichier: file.name,
        url_fichier: publicUrl,
        type_document: 'autre_document',
        taille_fichier: file.size,
        type_mime: file.type,
        uploaded_by: user?.id,
      });
    }
    await chargerSinistre();
  };

  // ==================== HELPERS ====================

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

  const formatDateShort = (dateString: string) => {
    try { return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr }); }
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

  const openDesignateExpert = () => {
    const expertiseActive = expertises.find(e => e.statut !== 'terminee');
    if (expertiseActive) {
      const expertActuel = experts.find(e => e.id === expertiseActive.expert_id);
      if (expertActuel) {
        setSelectedExpert(expertActuel);
        setSearchExpertTerm(expertActuel.nom || '');
      }
      setDateExpertise(expertiseActive.date_expertise || '');
    } else {
      setSelectedExpert(null);
      setSearchExpertTerm('');
      setDateExpertise('');
    }
    setDesignationComment('');
    setShowDesignateExpert(true);
  };

  // ==================== RENDU ====================

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
  const expertiseActive = expertises.find(e => e.statut !== 'terminee');
  const hasActiveExpertise = !!expertiseActive;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <Link href={isAgent ? "/agent/sinistres" : isExpert ? "/expert/missions" : "/sinistres"} 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
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
                <button onClick={openDesignateExpert}
                  className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                  {hasActiveExpertise ? (
                    <><FaExchangeAlt className="mr-2 h-4 w-4" /> Changer d'expert</>
                  ) : (
                    <><FaUserCheck className="mr-2 h-4 w-4" /> Désigner expert</>
                  )}
                </button>
                <button onClick={() => setShowStatusModal(true)}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  <FaEdit className="mr-2 h-4 w-4" /> Changer statut
                </button>
              </>
            )}
            {isExpert && monExpertise && monExpertise.statut !== 'terminee' && (
              <button onClick={() => { 
                setEditingExpertise(monExpertise); 
                setRapportForm({
                  rapport: monExpertise.rapport || '',
                  conclusion: monExpertise.conclusion || '',
                  montant_evalue: monExpertise.montant_evalue || sinistre.montant_estime || 0,
                }); 
                setShowRapportModal(true); 
              }}
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
                <FaClipboardCheck className="mr-2 h-4 w-4" /> Soumettre rapport
              </button>
            )}
          </div>
        </div>
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
              <InfoItem label="Type" value={`${TYPES_SINISTRE[sinistre.type_sinistre]?.icon || ''} ${TYPES_SINISTRE[sinistre.type_sinistre]?.label || sinistre.type_sinistre}`} />
              <InfoItem label="Date sinistre" value={formatDate(sinistre.date_sinistre)} icon={FaCalendarAlt} />
              <InfoItem label="Lieu" value={sinistre.lieu} icon={FaMapMarkerAlt} />
              <InfoItem label="Montant estimé" value={sinistre.montant_estime ? formatMontant(sinistre.montant_estime) : '-'} icon={FaMoneyBillWave} />
              {sinistre.montant_indemnisation > 0 && (
                <InfoItem label="Indemnisation" value={formatMontant(sinistre.montant_indemnisation)} icon={FaMoneyBillWave} color="text-green-600" />
              )}
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
                      <div className="flex items-center space-x-3">
                        <UserAvatar 
                          user={{
                            nom: expertise.expert_nom,
                            email: expertise.expert_email,
                            photo_profil: expertise.expert_photo,
                            role: 'expert'
                          }} 
                          size="md" 
                          role="expert" 
                        />
                        <div>
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
                        <span className="text-gray-500">Désignation :</span>
                        <span className="ml-1">{formatDateShort(expertise.date_designation)}</span>
                      </div>
                      {expertise.date_expertise && (
                        <div>
                          <span className="text-gray-500">Expertise :</span>
                          <span className="ml-1">{formatDateShort(expertise.date_expertise)}</span>
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
                        {expertise.montant_evalue != null && expertise.montant_evalue > 0 && (
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
              <label className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer transition-colors">
                <FaUpload className="mr-2 h-3 w-3" /> Ajouter
                <input type="file" multiple className="hidden" 
                  onChange={(e) => e.target.files && handleUploadDocuments(e.target.files)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
            </div>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucun document</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                    <div className="flex items-center">
                      <FaFileAlt className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.nom_fichier}</p>
                        <p className="text-xs text-gray-500">
                          {doc.taille_fichier ? `${(doc.taille_fichier / 1024 / 1024).toFixed(2)} MB` : ''}
                        </p>
                      </div>
                    </div>
                    <a href={doc.url_fichier} target="_blank" rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 flex-shrink-0 ml-2">
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
              <UserAvatar 
                user={sinistre.assure || {}} 
                size="lg" 
                role="assure" 
              />
              <div className="ml-3">
                <p className="text-sm font-medium">{sinistre.assure?.nom || 'Inconnu'}</p>
                <p className="text-xs text-gray-500">{sinistre.assure?.email || ''}</p>
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

          {/* Expert assigné */}
          {expertiseActive && (
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaUserCheck className="mr-2 h-4 w-4 text-purple-600" /> Expert assigné
              </h2>
              <div className="flex items-center mb-3">
                <UserAvatar 
                  user={{
                    nom: expertiseActive.expert_nom,
                    email: expertiseActive.expert_email,
                    photo_profil: expertiseActive.expert_photo,
                    role: 'expert'
                  }} 
                  size="lg" 
                  role="expert" 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">{expertiseActive.expert_nom}</p>
                  <p className="text-xs text-purple-600">{expertiseActive.expert_email}</p>
                </div>
              </div>
              {expertiseActive.date_expertise && (
                <div className="flex items-center text-sm text-purple-700 border-t pt-3">
                  <FaCalendarAlt className="mr-2 h-3 w-3" />
                  Expertise prévue le {formatDateShort(expertiseActive.date_expertise)}
                </div>
              )}
              <div className="mt-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  expertiseActive.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {expertiseActive.statut === 'en_cours' ? 'En cours d\'évaluation' : 'En attente'}
                </span>
              </div>
            </div>
          )}

          {/* Communication rapide */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FaComments className="mr-2 h-4 w-4 text-blue-500" /> Communication
            </h2>
            <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
              {communications.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Aucune communication</p>
              ) : (
                communications.slice(0, 10).map(comm => (
                  <div key={comm.id} className={`p-2 rounded text-sm ${
                    comm.type === 'notification' ? 'bg-blue-50 border border-blue-100' :
                    comm.type === 'note' ? 'bg-yellow-50 border border-yellow-100' : 
                    'bg-gray-50 border border-gray-100'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium flex items-center">
                        <UserAvatar 
                          user={{ nom: comm.expediteur_nom, role: comm.expediteur_role }} 
                          size="sm" 
                          role={comm.expediteur_role as any} 
                        />
                        <span className="ml-1.5">{comm.expediteur_nom}</span>
                      </span>
                      <span className="text-xs text-gray-400">{formatDateShort(comm.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-700 ml-7">{comm.contenu}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isAgent ? "Ajouter une note interne..." : "Écrire un message..."}
                className="flex-1 text-sm border rounded px-2 py-1.5 focus:border-blue-500 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
              />
              <button 
                onClick={handleSendMessage}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
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
              <p className="text-sm text-gray-500 text-center py-4">Aucun historique</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {historique.map(entry => (
                  <div key={entry.id} className="border-l-2 border-blue-200 pl-3">
                    <p className="text-xs text-gray-400">{formatDateShort(entry.created_at)}</p>
                    <p className="text-sm">
                      {entry.ancien_statut && (
                        <span className="text-gray-500">
                          {STATUTS[entry.ancien_statut]?.label || entry.ancien_statut} →{' '}
                        </span>
                      )}
                      <span className="font-medium">
                        {STATUTS[entry.nouveau_statut]?.label || entry.nouveau_statut}
                      </span>
                    </p>
                    {entry.commentaire && (
                      <p className="text-xs text-gray-600 mt-0.5">{entry.commentaire}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Par {entry.modifie_par?.nom || 'Système'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Modal Désignation/Changement Expert */}
      {showDesignateExpert && (
        <Modal 
          onClose={() => {
            setShowDesignateExpert(false);
            setSelectedExpert(null);
            setSearchExpertTerm('');
          }} 
          title={hasActiveExpertise ? "Changer d'expert" : "Désigner un expert"}
        >
          <div className="space-y-4">
            {/* Info expertise existante */}
            {hasActiveExpertise && expertiseActive && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 mb-2">Expertise en cours</p>
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    user={{
                      nom: expertiseActive.expert_nom,
                      email: expertiseActive.expert_email,
                      photo_profil: expertiseActive.expert_photo,
                      role: 'expert'
                    }} 
                    size="md" 
                    role="expert" 
                  />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">{expertiseActive.expert_nom}</p>
                    <p className="text-xs text-yellow-700">{expertiseActive.expert_email}</p>
                    <p className="text-xs text-yellow-600 mt-0.5">
                      Désigné le {formatDateShort(expertiseActive.date_designation)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recherche expert */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-1 h-3 w-3" />
                Rechercher un expert *
              </label>
              
              {selectedExpert ? (
                <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserAvatar 
                        user={selectedExpert} 
                        size="md" 
                        role="expert" 
                      />
                      <div>
                        <p className="font-medium text-purple-900">{selectedExpert.nom}</p>
                        <p className="text-xs text-purple-700">{selectedExpert.email}</p>
                        {selectedExpert.telephone && (
                          <p className="text-xs text-purple-600 flex items-center mt-0.5">
                            <FaPhone className="mr-1 h-2 w-2" />
                            {selectedExpert.telephone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedExpert.expertises_en_cours !== undefined && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          {selectedExpert.expertises_en_cours} en cours
                        </span>
                      )}
                      {selectedExpert.expertises_terminees !== undefined && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {selectedExpert.expertises_terminees} faites
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedExpert(null);
                          setSearchExpertTerm('');
                        }}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-purple-600">
                    <FaCheck className="mr-1 h-3 w-3" />
                    Expert sélectionné
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchExpertTerm}
                    onChange={(e) => setSearchExpertTerm(e.target.value)}
                    placeholder="Rechercher par nom, email, téléphone..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:border-purple-500 focus:ring-purple-500"
                    autoFocus
                  />
                  
                  {searchExpertTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredExperts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Aucun expert trouvé
                        </div>
                      ) : (
                        filteredExperts.map(expert => (
                          <button
                            key={expert.id}
                            type="button"
                            onClick={() => {
                              setSelectedExpert(expert);
                              setSearchExpertTerm(expert.nom || '');
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 text-left border-b last:border-b-0 transition-colors"
                          >
                            <UserAvatar 
                              user={expert} 
                              size="sm" 
                              role="expert" 
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {expert.nom}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {expert.email}
                              </p>
                              {expert.telephone && (
                                <p className="text-xs text-gray-400 flex items-center mt-0.5">
                                  <FaPhone className="mr-1 h-2 w-2" />
                                  {expert.telephone}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-xs flex-shrink-0">
                              <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full">
                                {expert.expertises_en_cours || 0} en cours
                              </span>
                              <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                                {expert.expertises_terminees || 0} faites
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-1 h-3 w-3" />
                Date de l'expertise *
              </label>
              <input
                type="datetime-local"
                value={dateExpertise}
                onChange={(e) => setDateExpertise(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire (optionnel)
              </label>
              <textarea
                value={designationComment}
                onChange={(e) => setDesignationComment(e.target.value)}
                rows={2}
                className="w-full border rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Instructions pour l'expert..."
              />
            </div>

            {/* Boutons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleDesignateExpert}
                disabled={!selectedExpert || !dateExpertise}
                className="flex-1 bg-purple-600 text-white rounded-md py-2.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {hasActiveExpertise ? (
                  <><FaExchangeAlt className="inline mr-2 h-4 w-4" /> Changer d'expert</>
                ) : (
                  <><FaUserCheck className="inline mr-2 h-4 w-4" /> Désigner l'expert</>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDesignateExpert(false);
                  setSelectedExpert(null);
                  setSearchExpertTerm('');
                }}
                className="flex-1 border border-gray-300 rounded-md py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
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
              <textarea 
                value={rapportForm.rapport} 
                onChange={(e) => setRapportForm({...rapportForm, rapport: e.target.value})}
                rows={5} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Décrivez les dommages constatés..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Conclusion</label>
              <textarea 
                value={rapportForm.conclusion} 
                onChange={(e) => setRapportForm({...rapportForm, conclusion: e.target.value})}
                rows={2} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Votre conclusion..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant évalué (CDF)</label>
              <input 
                type="number" 
                value={rapportForm.montant_evalue}
                onChange={(e) => setRapportForm({...rapportForm, montant_evalue: Number(e.target.value)})}
                className="w-full border rounded-md px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photos / Documents</label>
              <input 
                type="file" 
                multiple 
                onChange={(e) => setRapportFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="w-full text-sm" 
                accept=".jpg,.jpeg,.png,.pdf" 
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button 
                onClick={handleSubmitRapport}
                className="flex-1 bg-green-600 text-white rounded-md py-2.5 text-sm font-medium hover:bg-green-700 transition-colors">
                <FaPaperPlane className="inline mr-2 h-3 w-3" /> Soumettre le rapport
              </button>
              <button 
                onClick={() => setShowRapportModal(false)}
                className="flex-1 border rounded-md py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                Annuler
              </button>
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
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Sélectionner</option>
                {Object.entries(STATUTS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commentaire</label>
              <textarea 
                value={statusComment} 
                onChange={(e) => setStatusComment(e.target.value)}
                rows={2} 
                className="w-full border rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button 
                onClick={handleChangeStatus} 
                disabled={!newStatus}
                className="flex-1 bg-blue-600 text-white rounded-md py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <FaCheck className="inline mr-2 h-3 w-3" /> Confirmer
              </button>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="flex-1 border rounded-md py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}