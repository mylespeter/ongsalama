// app/dashboard/laboratoire/patients/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FaUsers, 
  FaUser, 
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaVenusMars,
  FaPhone,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserMd,
  FaCalendarCheck,
  FaStethoscope,
  FaClipboardList,
  FaArrowRight,
  FaInfoCircle,
  FaBaby,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaFlask,
  FaPills,
  FaNotesMedical,
  FaClipboardCheck,
  FaVial,
  FaMicroscope,
  FaHeartbeat,
  FaSyringe
} from 'react-icons/fa';
import { Eye, Send, FileText, Beaker, TestTube } from 'lucide-react';

// Type Patient
type Patient = {
  id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  age: number;
  sexe: 'M' | 'F';
  telephone: string;
  adresse: string;
  motif_visite: 'rendez-vous' | 'consultation';
  statut: 'accueil' | 'consultation' | 'laboratoire' | 'pharmacie' | 'termine';
  envoye_a: string | null;
  cree_par: string;
  created_at: string;
  updated_at: string;
  agent?: {
    id: string;
    username: string;
    matricule: string;
  } | null;
  medecin?: {
    id: string;
    username: string;
    matricule: string;
    telephone: string | null;
    photo_profil: string | null;
  } | null;
  consultation?: Consultation | null;
};

// Type Consultation
type Consultation = {
  id: string;
  patient_id: string;
  diagnostic: string;
  questions_reponses: string;
  envoye_a: string | null;
  cree_par: string;
  created_at: string;
};

// Type Laboratoire
type Laboratoire = {
  id: string;
  patient_id: string;
  resultats_examens: string;
  envoye_a: string | null;
  cree_par: string;
  created_at: string;
};

// Configuration des statuts
const STATUTS = {
  accueil: {
    label: 'En attente', 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FaClipboardList
  },
  consultation: { 
    label: 'En consultation', 
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: FaStethoscope
  },
  laboratoire: { 
    label: 'Au laboratoire', 
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: FaFlask
  },
  pharmacie: { 
    label: 'À la pharmacie', 
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: FaPills
  },
  termine: { 
    label: 'Terminé', 
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: FaCheckCircle
  },
} as const;

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatAge = (age: number) => {
  if (age < 1) {
    const mois = Math.round(age * 12);
    return `${mois} mois`;
  } else if (age < 2) {
    return `${age} an`;
  }
  return `${age} ans`;
};

export default function LaboratoirePage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtreDate, setFiltreDate] = useState<string>('tous');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedPatients, setPaginatedPatients] = useState<Patient[]>([]);

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLaboratoireModal, setShowLaboratoireModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Formulaire de laboratoire
  const [laboratoireForm, setLaboratoireForm] = useState({
    resultats_examens: '',
    action: '' as '' | 'pharmacie' | 'terminer',
  });
  
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    enCours: 0,
    termine: 0,
  });

  useEffect(() => {
    if (user?.role === 'laboratoire') {
      chargerPatients();
    }
  }, [user]);

  useEffect(() => {
    filtrerPatients();
  }, [patients, searchTerm, filtreStatut, filtreDate]);

  useEffect(() => {
    setCurrentPage(1);
    paginerPatients(1);
  }, [filteredPatients]);

  const chargerPatients = async () => {
    try {
      setLoading(true);
      
      // Charger les patients avec statut 'laboratoire' et leurs consultations
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          *,
          agent:cree_par(id, username, matricule),
          medecin:envoye_a(id, username, matricule, telephone, photo_profil)
        `)
        .in('statut', ['laboratoire', 'pharmacie', 'termine'])
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Charger les consultations pour ces patients
      if (patientsData && patientsData.length > 0) {
        const patientIds = patientsData.map(p => p.id);
        
        const { data: consultationsData, error: consultationsError } = await supabase
          .from('consultations')
          .select('*')
          .in('patient_id', patientIds);

        if (consultationsError) throw consultationsError;

        // Associer les consultations aux patients
        const patientsWithConsultations = patientsData.map(patient => ({
          ...patient,
          consultation: consultationsData?.find(c => c.patient_id === patient.id) || null
        }));

        setPatients(patientsWithConsultations);
        calculerStats(patientsWithConsultations);
      } else {
        setPatients([]);
        calculerStats([]);
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  const calculerStats = (patientsData: Patient[]) => {
    const aujourdhui = new Date().toDateString();
    const patientsAujourdhui = patientsData.filter(p => 
      new Date(p.created_at).toDateString() === aujourdhui
    );
    
    setStats({
      total: patientsAujourdhui.length,
      enAttente: patientsAujourdhui.filter(p => p.statut === 'laboratoire').length,
      enCours: patientsAujourdhui.filter(p => p.statut === 'pharmacie').length,
      termine: patientsAujourdhui.filter(p => p.statut === 'termine').length,
    });
  };

  const filtrerPatients = () => {
    let filtered = [...patients];

    // Filtre par date
    const aujourdhui = new Date().toDateString();
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const hierDateString = hier.toDateString();

    if (filtreDate === 'aujourdhui') {
      filtered = filtered.filter(p => 
        new Date(p.created_at).toDateString() === aujourdhui
      );
    } else if (filtreDate === 'hier') {
      filtered = filtered.filter(p => 
        new Date(p.created_at).toDateString() === hierDateString
      );
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.nom?.toLowerCase().includes(term) ||
        p.post_nom?.toLowerCase().includes(term) ||
        p.prenom?.toLowerCase().includes(term) ||
        p.telephone?.includes(term) ||
        `${p.nom} ${p.post_nom} ${p.prenom}`.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (filtreStatut !== 'tous') {
      filtered = filtered.filter(p => p.statut === filtreStatut);
    }

    setFilteredPatients(filtered);
  };

  const paginerPatients = (page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedPatients(filteredPatients.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredPatients.length / ITEMS_PER_PAGE));
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    paginerPatients(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleViewDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handleOpenLaboratoire = (patient: Patient) => {
    setSelectedPatient(patient);
    setLaboratoireForm({
      resultats_examens: '',
      action: '',
    });
    setShowLaboratoireModal(true);
  };

  const handleSaveLaboratoire = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!laboratoireForm.resultats_examens) {
      setError('Veuillez saisir les résultats d\'examens');
      return;
    }

    if (!laboratoireForm.action) {
      setError('Veuillez choisir une action (pharmacie ou terminer)');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Enregistrer les résultats de laboratoire
      const { error: laboError } = await supabase
        .from('laboratoires')
        .insert([{
          patient_id: parseInt(selectedPatient!.id),
          resultats_examens: laboratoireForm.resultats_examens.trim(),
          envoye_a: null,
          cree_par: user?.id,
        }]);

      if (laboError) throw laboError;

      // 2. Mettre à jour le statut du patient
      let nouveauStatut: string;
      if (laboratoireForm.action === 'pharmacie') {
        nouveauStatut = 'pharmacie';
      } else {
        nouveauStatut = 'termine';
      }

      const { error: updateError } = await supabase
        .from('patients')
        .update({ 
          statut: nouveauStatut,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPatient!.id);

      if (updateError) throw updateError;

      setShowLaboratoireModal(false);
      await chargerPatients();
      
      let message = 'Résultats d\'examens enregistrés avec succès';
      if (laboratoireForm.action === 'pharmacie') {
        message += ' - Patient envoyé à la pharmacie';
      } else {
        message += ' - Analyses terminées';
      }
      
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement des résultats');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
  };

  if (user?.role !== 'laboratoire') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-warning" />
          <h3 className="mt-2 text-lg font-medium text-text-dark">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette page est réservée aux techniciens de laboratoire.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark flex items-center">
            <FaFlask className="mr-3 h-6 w-6 text-teal-600" />
            Analyses de laboratoire
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Saisissez les résultats d'examens et orientez les patients
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-teal-100 bg-gradient-to-br from-teal-50 to-teal-100/50">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-teal-100">
              <FaUsers className="h-5 w-5 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total aujourd'hui</p>
              <p className="text-xl font-semibold text-text-dark">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-teal-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-teal-50">
              <FaVial className="h-5 w-5 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">En attente d'analyse</p>
              <p className="text-xl font-semibold text-text-dark">{stats.enAttente}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-green-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-green-50">
              <FaPills className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">À la pharmacie</p>
              <p className="text-xl font-semibold text-text-dark">{stats.enCours}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-emerald-100">
              <FaCheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Terminés</p>
              <p className="text-xl font-semibold text-text-dark">{stats.termine}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-error">
          <div className="flex">
            <FaTimesCircle className="h-5 w-5 text-error flex-shrink-0" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 border-l-4 border-success">
          <div className="flex">
            <FaCheckCircle className="h-5 w-5 text-success flex-shrink-0" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-green-500" />
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-border p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Période</label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setFiltreDate('aujourdhui')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  filtreDate === 'aujourdhui'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setFiltreDate('hier')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-l border-border transition-colors ${
                  filtreDate === 'hier'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Hier
              </button>
              <button
                onClick={() => setFiltreDate('tous')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-l border-border transition-colors ${
                  filtreDate === 'tous'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Tous
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-border pl-10 pr-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="laboratoire">En attente d'analyse</option>
              <option value="pharmacie">À la pharmacie</option>
              <option value="termine">Terminé</option>
            </select>
          </div>

          <div className="flex items-end justify-end">
            {(searchTerm || filtreStatut !== 'tous' || filtreDate !== 'tous') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltreStatut('tous');
                  setFiltreDate('tous');
                }}
                className="text-teal-600 hover:text-teal-800 flex items-center text-sm mb-1"
              >
                <FaTimes className="mr-1 h-3 w-3" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-500 flex items-center">
          <FaClock className="mr-1 h-3 w-3" />
          {filtreDate === 'aujourdhui' && "Patients d'aujourd'hui"}
          {filtreDate === 'hier' && "Patients d'hier"}
          {filtreDate === 'tous' && 'Tous les patients'}
          <span className="mx-2">•</span>
          {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} trouvé{filteredPatients.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau des patients */}
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <FaFlask className="mx-auto h-12 w-12 text-teal-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Chargement des patients...</p>
          </div>
        ) : paginatedPatients.length === 0 ? (
          <div className="text-center py-12">
            <FaFlask className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">
              {filtreDate === 'aujourdhui' 
                ? "Aucun patient à analyser aujourd'hui" 
                : "Aucun patient trouvé"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Âge/Sexe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médecin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnostic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {paginatedPatients.map((patient) => {
                    const StatutIcon = STATUTS[patient.statut]?.icon || FaClipboardList;
                    return (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              patient.statut === 'termine' 
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                : patient.statut === 'pharmacie'
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : 'bg-gradient-to-br from-teal-500 to-teal-600'
                            }`}>
                              <span className="text-white font-medium text-sm">
                                {getInitials(patient.nom, patient.prenom)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-text-dark">
                                {patient.nom} {patient.post_nom} {patient.prenom}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <FaMapMarkerAlt className="mr-1 h-3 w-3" />
                                {patient.adresse.substring(0, 30)}{patient.adresse.length > 30 ? '...' : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaBaby className="mr-2 h-3 w-3 text-gray-400" />
                            {formatAge(patient.age)}
                            <span className="mx-2 text-gray-300">|</span>
                            <span className={`inline-flex items-center ${
                              patient.sexe === 'M' ? 'text-blue-600' : 'text-pink-600'
                            }`}>
                              <FaVenusMars className="mr-1 h-3 w-3" />
                              {patient.sexe === 'M' ? 'M' : 'F'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.medecin ? (
                            <div className="flex items-center text-sm">
                              <div className="flex-shrink-0 mr-2">
                                {patient.medecin.photo_profil ? (
                                  <img 
                                    src={patient.medecin.photo_profil} 
                                    alt={patient.medecin.username}
                                    className="h-7 w-7 rounded-full object-cover ring-1 ring-gray-200"
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center ring-1 ring-gray-200">
                                    <span className="text-white text-xs font-medium">
                                      {patient.medecin.username.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-700">{patient.medecin.username}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs">
                            {patient.consultation ? (
                              <div className="truncate" title={patient.consultation.diagnostic}>
                                <FaStethoscope className="inline mr-1 h-3 w-3 text-purple-500" />
                                {patient.consultation.diagnostic.substring(0, 50)}
                                {patient.consultation.diagnostic.length > 50 ? '...' : ''}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Pas de diagnostic</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            STATUTS[patient.statut]?.color || 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            <StatutIcon className="mr-1 h-3 w-3" />
                            {STATUTS[patient.statut]?.label || patient.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                            {formatDateShort(patient.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetail(patient)}
                              className="text-gray-600 hover:text-teal-600 p-1 hover:bg-teal-50 rounded transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {patient.statut === 'laboratoire' && (
                              <button
                                onClick={() => handleOpenLaboratoire(patient)}
                                className="text-teal-600 hover:text-teal-800 p-1 hover:bg-teal-50 rounded transition-colors flex items-center"
                                title="Saisir les résultats"
                              >
                                <TestTube className="h-4 w-4 mr-1" />
                                <span className="text-xs">Analyser</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredPatients.length > ITEMS_PER_PAGE && (
              <div className="px-6 py-4 border-t border-border bg-gray-50 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredPatients.length}</span> patients
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`dots-${index}`} className="relative inline-flex items-center px-4 py-2 border border-border bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-teal-600 border-teal-600 text-white'
                                : 'bg-white border-border text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Détails Patient */}
      {showDetailModal && selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-center">
                  <div className={`mx-auto mb-4 h-20 w-20 rounded-full flex items-center justify-center ${
                    selectedPatient.statut === 'termine'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-br from-teal-500 to-teal-600'
                  }`}>
                    <span className="text-white font-bold text-2xl">
                      {getInitials(selectedPatient.nom, selectedPatient.prenom)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-text-dark">
                    {selectedPatient.nom} {selectedPatient.post_nom} {selectedPatient.prenom}
                  </h3>
                  
                  <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    STATUTS[selectedPatient.statut]?.color || 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {(() => {
                      const StatutIcon = STATUTS[selectedPatient.statut]?.icon || FaClipboardList;
                      return <StatutIcon className="mr-1 h-4 w-4" />;
                    })()}
                    {STATUTS[selectedPatient.statut]?.label || selectedPatient.statut}
                  </span>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FaBaby className="mr-2 h-4 w-4" />
                        Âge
                      </dt>
                      <dd className="text-sm text-text-dark">{formatAge(selectedPatient.age)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FaVenusMars className="mr-2 h-4 w-4" />
                        Sexe
                      </dt>
                      <dd className="text-sm text-text-dark">
                        {selectedPatient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FaPhone className="mr-2 h-4 w-4" />
                        Téléphone
                      </dt>
                      <dd className="text-sm text-text-dark">{selectedPatient.telephone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FaMapMarkerAlt className="mr-2 h-4 w-4" />
                        Adresse
                      </dt>
                      <dd className="text-sm text-text-dark text-right max-w-[60%]">{selectedPatient.adresse}</dd>
                    </div>
                    {selectedPatient.medecin && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaUserMd className="mr-2 h-4 w-4" />
                          Médecin
                        </dt>
                        <dd className="text-sm text-text-dark">{selectedPatient.medecin.username}</dd>
                      </div>
                    )}
                    
                    {/* Diagnostic */}
                    {selectedPatient.consultation && (
                      <>
                        <div className="border-t border-border pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <FaStethoscope className="mr-2 h-4 w-4 text-purple-600" />
                            Informations de consultation
                          </h4>
                          <div className="bg-purple-50 rounded-lg p-3 mb-3">
                            <p className="text-xs font-medium text-purple-700 mb-1">Diagnostic</p>
                            <p className="text-sm text-gray-700">{selectedPatient.consultation.diagnostic}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 mb-1">Questions / Réponses</p>
                            <p className="text-sm text-gray-700">{selectedPatient.consultation.questions_reponses}</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FaCalendarAlt className="mr-2 h-4 w-4" />
                        Enregistré le
                      </dt>
                      <dd className="text-sm text-text-dark">{formatDate(selectedPatient.created_at)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 inline-flex justify-center items-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  {selectedPatient.statut === 'laboratoire' && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenLaboratoire(selectedPatient);
                      }}
                      className="flex-1 inline-flex justify-center items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
                    >
                      <TestTube className="mr-2 h-4 w-4" />
                      Analyser
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Saisie Résultats Laboratoire */}
      {showLaboratoireModal && selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowLaboratoireModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-dark flex items-center">
                    <FaFlask className="mr-2 h-5 w-5 text-teal-600" />
                    Résultats d'analyses de laboratoire
                  </h3>
                  <button
                    onClick={() => setShowLaboratoireModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Info patient */}
                <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {getInitials(selectedPatient.nom, selectedPatient.prenom)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-teal-900">
                        {selectedPatient.nom} {selectedPatient.post_nom} {selectedPatient.prenom}
                      </h4>
                      <div className="flex items-center text-xs text-teal-600 space-x-3 mt-0.5">
                        <span className="flex items-center">
                          <FaBaby className="mr-1 h-3 w-3" />
                          {formatAge(selectedPatient.age)}
                        </span>
                        <span className="flex items-center">
                          <FaVenusMars className="mr-1 h-3 w-3" />
                          {selectedPatient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                        </span>
                        <span className="flex items-center">
                          <FaPhone className="mr-1 h-3 w-3" />
                          {selectedPatient.telephone}
                        </span>
                      </div>
                    </div>
                    {selectedPatient.medecin && (
                      <div className="text-right">
                        <p className="text-xs text-teal-600">Médecin</p>
                        <p className="text-sm font-medium text-teal-900">{selectedPatient.medecin.username}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Diagnostic du médecin */}
                {selectedPatient.consultation && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                      <FaStethoscope className="mr-2 h-4 w-4" />
                      Diagnostic du médecin
                    </h4>
                    <p className="text-sm text-gray-700">{selectedPatient.consultation.diagnostic}</p>
                    {selectedPatient.consultation.questions_reponses && (
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-purple-600 mb-1">Questions/Réponses</h5>
                        <p className="text-xs text-gray-600">{selectedPatient.consultation.questions_reponses}</p>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSaveLaboratoire} className="space-y-6">
                  {/* Résultats d'examens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMicroscope className="inline mr-2 h-4 w-4 text-teal-600" />
                      Résultats d'examens *
                    </label>
                    <textarea
                      value={laboratoireForm.resultats_examens}
                      onChange={(e) => setLaboratoireForm({ ...laboratoireForm, resultats_examens: e.target.value })}
                      rows={6}
                      className="block w-full rounded-lg border border-border shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-3"
                      placeholder="Saisissez les résultats détaillés des examens de laboratoire..."
                      required
                    />
                    <p className="mt-1 text-xs text-gray-400 flex items-center">
                      <FaInfoCircle className="mr-1 h-3 w-3" />
                      Décrivez tous les résultats d'analyses effectuées
                    </p>
                  </div>

                  {/* Action à prendre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <FaArrowRight className="inline mr-2 h-4 w-4 text-teal-600" />
                      Orientation après analyses *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLaboratoireForm({ ...laboratoireForm, action: 'pharmacie' })}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          laboratoireForm.action === 'pharmacie'
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50'
                        }`}
                      >
                        <FaPills className={`mx-auto h-10 w-10 mb-2 ${
                          laboratoireForm.action === 'pharmacie' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          laboratoireForm.action === 'pharmacie' ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          Envoyer à la pharmacie
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Pour les médicaments</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLaboratoireForm({ ...laboratoireForm, action: 'terminer' })}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          laboratoireForm.action === 'terminer'
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                      >
                        <FaCheckCircle className={`mx-auto h-10 w-10 mb-2 ${
                          laboratoireForm.action === 'terminer' ? 'text-emerald-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          laboratoireForm.action === 'terminer' ? 'text-emerald-700' : 'text-gray-600'
                        }`}>
                          Terminer les analyses
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Analyses terminées</p>
                      </button>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex space-x-3 pt-4 border-t border-border">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex justify-center items-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2 h-4 w-4" />
                          Enregistrer les résultats
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLaboratoireModal(false)}
                      className="flex-1 inline-flex justify-center items-center rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}