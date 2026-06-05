
// app/dashboard/accueil/patients/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaPrint } from 'react-icons/fa'; 
import { generatePatientPDF } from './PatientPDF';
import { 
  FaUsers, 
  FaUser, 
  FaUserPlus,
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
  FaIdCard,
  FaBaby,
  FaCalendarAlt,
  FaClock,
  FaCheck
} from 'react-icons/fa';
import { Eye } from 'lucide-react';

// Type Patient pour ONG Salama
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
  // Jointure avec le médecin assigné
  medecin?: {
    id: string;
    username: string;
    matricule: string;
    telephone: string | null;
    photo_profil: string | null;
  } | null;
  // Jointure avec l'agent d'accueil
  agent?: {
    id: string;
    username: string;
    matricule: string;
  } | null;
};

// Type User pour les médecins
type Medecin = {
  id: string;
  matricule: string;
  username: string;
  telephone: string | null;
  photo_profil: string | null;
  genre: 'M' | 'F' | null;
};

// Configuration des statuts
const STATUTS = {
  accueil: {  // ← AJOUTER CECI
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
    icon: FaClipboardList
  },
  pharmacie: { 
    label: 'À la pharmacie', 
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: FaClipboardList
  },
  termine: { 
    label: 'Terminé', 
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: FaCheckCircle
  },
} as const; // ← Ajouter "as const" pour le typage strict

// Nombre d'éléments par page
const ITEMS_PER_PAGE = 10;

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction pour formater la date courte
const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Fonction pour calculer l'âge formaté
const formatAge = (age: number) => {
  if (age < 1) {
    const mois = Math.round(age * 12);
    return `${mois} mois`;
  } else if (age < 2) {
    return `${age} an`;
  }
  return `${age} ans`;
};

// Composant Avatar pour médecin
function MedecinAvatar({ medecin, size = 'md' }: { medecin: Medecin; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg'
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm`}>
      {medecin.photo_profil ? (
        <img 
          src={medecin.photo_profil} 
          alt={medecin.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <span className="text-white font-medium">
            {getInitials(medecin.username)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtreMotif, setFiltreMotif] = useState<string>('tous');
  const [filtreDate, setFiltreDate] = useState<string>('aujourdhui'); // 'aujourdhui', 'hier', 'tous'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedPatients, setPaginatedPatients] = useState<Patient[]>([]);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Recherche médecin dans le modal d'ajout
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [searchMedecinTerm, setSearchMedecinTerm] = useState('');
  const [filteredMedecins, setFilteredMedecins] = useState<Medecin[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null);
  const [showMedecinDropdown, setShowMedecinDropdown] = useState(false);
  const medecinDropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    post_nom: '',
    prenom: '',
    age: '',
    sexe: '' as 'M' | 'F' | '',
    telephone: '',
    adresse: '',
    motif_visite: '' as 'rendez-vous' | 'consultation' | '',
  });
  
  const [saving, setSaving] = useState(false);
  
  // Stats (uniquement pour aujourd'hui)
  const [stats, setStats] = useState({
    aujourdhui: 0,
    consultation: 0,
    laboratoire: 0,
    pharmacie: 0,
    termine: 0,
  });

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (medecinDropdownRef.current && !medecinDropdownRef.current.contains(event.target as Node)) {
        setShowMedecinDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.role === 'accueil') {
      chargerPatients();
      chargerMedecins();
    }
  }, [user]);

  useEffect(() => {
    filtrerPatients();
  }, [patients, searchTerm, filtreStatut, filtreMotif, filtreDate]);

  useEffect(() => {
    setCurrentPage(1);
    paginerPatients(1);
  }, [filteredPatients]);

  // Filtrer les médecins lors de la recherche
  useEffect(() => {
    if (searchMedecinTerm.trim() === '') {
      setFilteredMedecins(medecins.slice(0, 5)); // Afficher les 5 premiers par défaut
    } else {
      const term = searchMedecinTerm.toLowerCase();
      const filtered = medecins.filter(m => 
        m.username.toLowerCase().includes(term) ||
        m.matricule.toLowerCase().includes(term) ||
        (m.telephone && m.telephone.includes(term))
      );
      setFilteredMedecins(filtered);
    }
  }, [searchMedecinTerm, medecins]);

  const chargerPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          medecin:envoye_a(id, username, matricule, telephone, photo_profil),
          agent:cree_par(id, username, matricule)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPatients(data || []);
      calculerStats(data || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  const chargerMedecins = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, matricule, telephone, photo_profil, genre')
        .eq('role', 'consultation')
        .order('username', { ascending: true });

      if (error) throw error;
      setMedecins(data || []);
      setFilteredMedecins(data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Erreur chargement médecins:', err);
    }
  };
const handlePrintPDF = async (patient: Patient) => {
  try {
    await generatePatientPDF(patient);
    setSuccess('PDF généré avec succès');
    setTimeout(() => setSuccess(null), 3000);
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    setError('Erreur lors de la génération du PDF');
    setTimeout(() => setError(null), 5000);
  }
};
  const calculerStats = (patientsData: Patient[]) => {
    const aujourdhui = new Date().toDateString();
    const patientsAujourdhui = patientsData.filter(p => 
      new Date(p.created_at).toDateString() === aujourdhui
    );
    
    setStats({
      aujourdhui: patientsAujourdhui.length,
      consultation: patientsAujourdhui.filter(p => p.statut === 'consultation').length,
      laboratoire: patientsAujourdhui.filter(p => p.statut === 'laboratoire').length,
      pharmacie: patientsAujourdhui.filter(p => p.statut === 'pharmacie').length,
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

    // Filtre par motif
    if (filtreMotif !== 'tous') {
      filtered = filtered.filter(p => p.motif_visite === filtreMotif);
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

  const handleAdd = () => {
    setFormData({
      nom: '',
      post_nom: '',
      prenom: '',
      age: '',
      sexe: '',
      telephone: '',
      adresse: '',
      motif_visite: '',
    });
    setSelectedMedecin(null);
    setSearchMedecinTerm('');
    setFilteredMedecins(medecins.slice(0, 5));
    setShowMedecinDropdown(false);
    setShowAddModal(true);
  };

  const handleSelectMedecin = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setSearchMedecinTerm(medecin.username);
    setShowMedecinDropdown(false);
  };

  const handleRemoveMedecin = () => {
    setSelectedMedecin(null);
    setSearchMedecinTerm('');
    setFilteredMedecins(medecins.slice(0, 5));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nom || !formData.post_nom || !formData.prenom || !formData.age || !formData.sexe || !formData.telephone || !formData.adresse || !formData.motif_visite) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!selectedMedecin) {
      setError('Veuillez sélectionner un médecin');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 120) {
      setError('Veuillez entrer un âge valide (0-120)');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('patients')
        .insert([{
          nom: formData.nom.trim(),
          post_nom: formData.post_nom.trim(),
          prenom: formData.prenom.trim(),
          age: age,
          sexe: formData.sexe,
          telephone: formData.telephone.trim(),
          adresse: formData.adresse.trim(),
          motif_visite: formData.motif_visite,
          statut: 'consultation',
          envoye_a: parseInt(selectedMedecin.id),
          cree_par: user?.id,
        }]);

      if (error) throw error;

      setShowAddModal(false);
      await chargerPatients();
      setSuccess('Patient enregistré et envoyé en consultation avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement du patient');
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
  };

  if (user?.role !== 'accueil') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-warning" />
          <h3 className="mt-2 text-lg font-medium text-text-dark">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette page est réservée aux agents d'accueil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4  bg-">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark flex items-center">
            <FaUsers className="mr-3 h-6 w-6 text-primary" />
            Gestion des patients
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enregistrez et gérez les patients du centre médical
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
        >
          <FaUserPlus className="mr-2 h-4 w-4" />
          Nouveau patient
        </button>
      </div>

      {/* Stats du jour */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-primary/10">
              <FaCalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Aujourd'hui</p>
              <p className="text-xl font-semibold text-text-dark">{stats.aujourdhui}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-purple-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-purple-50">
              <FaStethoscope className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">En consultation</p>
              <p className="text-xl font-semibold text-text-dark">{stats.consultation}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-teal-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-teal-50">
              <FaClipboardList className="h-5 w-5 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Au laboratoire</p>
              <p className="text-xl font-semibold text-text-dark">{stats.laboratoire}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-green-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-green-50">
              <FaClipboardList className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">À la pharmacie</p>
              <p className="text-xl font-semibold text-text-dark">{stats.pharmacie}</p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Filtre par date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Période</label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setFiltreDate('aujourdhui')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  filtreDate === 'aujourdhui'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setFiltreDate('hier')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-l border-border transition-colors ${
                  filtreDate === 'hier'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Hier
              </button>
              <button
                onClick={() => setFiltreDate('tous')}
                className={`flex-1 px-3 py-2 text-xs font-medium border-l border-border transition-colors ${
                  filtreDate === 'tous'
                    ? 'bg-primary text-white'
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
                className="block w-full rounded-lg border border-border pl-10 pr-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="tous">Tous les statuts</option>
              <option value="consultation">En consultation</option>
              <option value="laboratoire">Au laboratoire</option>
              <option value="pharmacie">À la pharmacie</option>
              <option value="termine">Terminé</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Motif</label>
            <select
              value={filtreMotif}
              onChange={(e) => setFiltreMotif(e.target.value)}
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="tous">Tous les motifs</option>
              <option value="consultation">Consultation</option>
              <option value="rendez-vous">Rendez-vous</option>
            </select>
          </div>

          <div className="flex items-end justify-end">
            {(searchTerm || filtreStatut !== 'tous' || filtreMotif !== 'tous' || filtreDate !== 'aujourdhui') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltreStatut('tous');
                  setFiltreMotif('tous');
                  setFiltreDate('aujourdhui');
                }}
                className="text-primary hover:text-primary/80 flex items-center text-sm mb-1"
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
          {filteredPatients.length > ITEMS_PER_PAGE && (
            <span className="ml-2">
              - Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)}
            </span>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Chargement des patients...</p>
          </div>
        ) : paginatedPatients.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">
              {filtreDate === 'aujourdhui' 
                ? "Aucun patient enregistré aujourd'hui" 
                : filtreDate === 'hier'
                ? "Aucun patient enregistré hier"
                : "Aucun patient trouvé"}
            </p>
            <button
              onClick={handleAdd}
              className="mt-4 inline-flex items-center text-primary hover:text-primary/80 text-sm"
            >
              <FaUserPlus className="mr-2 h-4 w-4" />
              Enregistrer un nouveau patient
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full overflow-y-auto divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Âge/Sexe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médecin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enregistré par
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
                                : 'bg-gradient-to-br from-primary to-primary/80'
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
                          <div className="flex items-center text-sm text-gray-500">
                            <FaPhone className="mr-2 h-3 w-3 text-gray-400" />
                            {patient.telephone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            patient.motif_visite === 'consultation' 
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {patient.motif_visite === 'consultation' ? 'Consultation' : 'Rendez-vous'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            STATUTS[patient.statut]?.color || 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            <StatutIcon className="mr-1 h-3 w-3" />
                            {STATUTS[patient.statut]?.label || patient.statut}
                          </span>
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
                            <span className="text-xs text-gray-400">Non assigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.agent ? (
                            <div className="flex items-center text-sm">
                              <FaUser className="mr-2 h-3 w-3 text-blue-500" />
                              <span className="text-gray-700">{patient.agent.username}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                            {formatDateShort(patient.created_at)}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(patient.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetail(patient)}
                              className="text-gray-600 hover:text-primary p-1 hover:bg-primary/10 rounded transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
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
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Précédent</span>
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span
                            key={`dots-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-border bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-primary border-primary text-white'
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
                        <span className="sr-only">Suivant</span>
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
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
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
                      : 'bg-gradient-to-br from-primary to-primary/80'
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
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FaInfoCircle className="mr-2 h-4 w-4" />
                        Motif
                      </dt>
                      <dd className="text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          selectedPatient.motif_visite === 'consultation' 
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {selectedPatient.motif_visite === 'consultation' ? 'Consultation' : 'Rendez-vous'}
                        </span>
                      </dd>
                    </div>
                    {selectedPatient.medecin && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaUserMd className="mr-2 h-4 w-4" />
                          Médecin assigné
                        </dt>
                        <dd className="text-sm text-text-dark flex items-center">
                          {selectedPatient.medecin.photo_profil && (
                            <img 
                              src={selectedPatient.medecin.photo_profil} 
                              alt={selectedPatient.medecin.username}
                              className="h-6 w-6 rounded-full object-cover mr-2"
                            />
                          )}
                          {selectedPatient.medecin.username}
                        </dd>
                      </div>
                    )}
                    {selectedPatient.agent && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaUser className="mr-2 h-4 w-4" />
                          Enregistré par
                        </dt>
                        <dd className="text-sm text-text-dark">{selectedPatient.agent.username}</dd>
                      </div>
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
                    <button
    onClick={() => {
      if (selectedPatient) {
        handlePrintPDF(selectedPatient);
      }
    }}
    className="flex-1 inline-flex justify-center items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
  >
    <FaPrint className="mr-2 h-4 w-4" />
    Imprimer la fiche
  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Patient */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark flex items-center">
                    <FaUserPlus className="mr-2 h-5 w-5 text-success" />
                    Nouveau patient
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700 flex items-center">
                    <FaInfoCircle className="mr-2 h-3 w-3 flex-shrink-0" />
                    Le patient sera automatiquement envoyé en consultation. Veuillez sélectionner un médecin.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                        placeholder="Kabila"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post-nom *
                      </label>
                      <input
                        type="text"
                        value={formData.post_nom}
                        onChange={(e) => setFormData({ ...formData, post_nom: e.target.value })}
                        className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                        placeholder="Mwanza"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                        placeholder="Jean"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Âge *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                        placeholder="35"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sexe *
                      </label>
                      <select
                        value={formData.sexe}
                        onChange={(e) => setFormData({ ...formData, sexe: e.target.value as 'M' | 'F' | '' })}
                        className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                      placeholder="+243 XXX XXX XXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                      placeholder="123, Avenue de la Liberté, Lubumbashi"
                      required
                    />
                  </div>
                   {/* Sélection du médecin avec recherche */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Médecin consultant *
                    </label>
                    
                    {selectedMedecin ? (
                      // Médecin sélectionné
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MedecinAvatar medecin={selectedMedecin} size="md" />
                            <div>
                              <p className="text-sm font-medium text-purple-900">
                                Dr. {selectedMedecin.username}
                              </p>
                              <p className="text-xs text-purple-600">
                                {selectedMedecin.matricule}
                                {selectedMedecin.telephone && ` • ${selectedMedecin.telephone}`}
                              </p>
                              {selectedMedecin.genre && (
                                <p className="text-xs text-purple-500">
                                  {selectedMedecin.genre === 'M' ? 'Masculin' : 'Féminin'}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveMedecin}
                            className="text-purple-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Changer de médecin"
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Recherche de médecin
                      <div className="relative" ref={medecinDropdownRef}>
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher un médecin par nom, matricule ou téléphone..."
                            value={searchMedecinTerm}
                            onChange={(e) => {
                              setSearchMedecinTerm(e.target.value);
                              setShowMedecinDropdown(true);
                            }}
                            onFocus={() => setShowMedecinDropdown(true)}
                            className="block w-full rounded-lg border-2 border-purple-200 pl-10 pr-3 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 bg-purple-50/30"
                          />
                        </div>
                     
                        {showMedecinDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-border max-h-60 overflow-y-auto">
                            {filteredMedecins.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                <FaUserMd className="mx-auto h-6 w-6 text-gray-300 mb-1" />
                                Aucun médecin trouvé
                              </div>
                            ) : (
                              filteredMedecins.map((medecin) => (
                                <button
                                  key={medecin.id}
                                  type="button"
                                  onClick={() => handleSelectMedecin(medecin)}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-b-0 text-left"
                                >
                                  <MedecinAvatar medecin={medecin} size="md" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      Dr. {medecin.username}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {medecin.matricule}
                                      {medecin.telephone && ` • ${medecin.telephone}`}
                                    </p>
                                    {medecin.genre && (
                                      <span className={`inline-flex items-center text-xs mt-0.5 ${
                                        medecin.genre === 'M' ? 'text-blue-600' : 'text-pink-600'
                                      }`}>
                                        <FaVenusMars className="mr-1 h-2.5 w-2.5" />
                                        {medecin.genre === 'M' ? 'Masculin' : 'Féminin'}
                                      </span>
                                    )}
                                  </div>
                                  <FaChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        
                        {!showMedecinDropdown && medecins.length > 0 && (
                          <p className="mt-1 text-xs text-gray-400 flex items-center">
                            <FaInfoCircle className="mr-1 h-3 w-3" />
                            Cliquez sur le champ pour voir les {medecins.length} médecin{medecins.length > 1 ? 's' : ''} disponible{medecins.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div> */}
{/* Sélection du médecin avec recherche */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Médecin consultant *
  </label>
  
  {selectedMedecin ? (
    // Médecin sélectionné
    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MedecinAvatar medecin={selectedMedecin} size="md" />
          <div>
            <p className="text-sm font-medium text-purple-900">
              Dr. {selectedMedecin.username}
            </p>
            <p className="text-xs text-purple-600">
              {selectedMedecin.matricule}
              {selectedMedecin.telephone && ` • ${selectedMedecin.telephone}`}
            </p>
            {selectedMedecin.genre && (
              <p className="text-xs text-purple-500">
                {selectedMedecin.genre === 'M' ? 'Masculin' : 'Féminin'}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemoveMedecin}
          className="text-purple-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
          title="Changer de médecin"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      </div>
    </div>
  ) : (
    // Recherche de médecin - AFFICHAGE EN FLUX (pas de dropdown absolu)
    <div className="space-y-2">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un médecin par nom, matricule ou téléphone..."
          value={searchMedecinTerm}
          onChange={(e) => {
            setSearchMedecinTerm(e.target.value);
          }}
          className="block w-full rounded-lg border-2 border-purple-200 pl-10 pr-3 py-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 bg-purple-50/30"
        />
      </div>

      {/* Liste des médecins filtrés - dans le flux normal */}
      <div className="border border-border rounded-lg overflow-hidden">
        {filteredMedecins.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <FaUserMd className="mx-auto h-6 w-6 text-gray-300 mb-1" />
            {searchMedecinTerm.trim() !== '' ? 'Aucun médecin trouvé' : 'Chargement...'}
          </div>
        ) : (
          <div className="max-h-32 overflow-y-auto">
            {filteredMedecins.map((medecin) => (
              <button
                key={medecin.id}
                type="button"
                onClick={() => handleSelectMedecin(medecin)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-b-0 text-left"
              >
                <MedecinAvatar medecin={medecin} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {medecin.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {medecin.matricule}
                    {medecin.telephone && ` • ${medecin.telephone}`}
                  </p>
                  {medecin.genre && (
                    <span className={`inline-flex items-center text-xs mt-0.5 ${
                      medecin.genre === 'M' ? 'text-blue-600' : 'text-pink-600'
                    }`}>
                      <FaVenusMars className="mr-1 h-2.5 w-2.5" />
                      {medecin.genre === 'M' ? 'Masculin' : 'Féminin'}
                    </span>
                  )}
                </div>
                <FaChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )}
</div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motif de visite *
                    </label>
                    <select
                      value={formData.motif_visite}
                      onChange={(e) => setFormData({ ...formData, motif_visite: e.target.value as 'rendez-vous' | 'consultation' | '' })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="consultation">Consultation</option>
                      <option value="rendez-vous">Rendez-vous</option>
                    </select>
                  </div>

               
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex justify-center items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="mr-2 h-4 w-4" />
                          Enregistrer et envoyer
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
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