

// app/admin/souscriptions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  FaFileContract, FaPlus, FaSearch, FaTimes, FaExclamationTriangle,
  FaCheckCircle, FaUser, FaCalendarAlt, FaUpload, FaTrash, FaEye,
  FaSpinner, FaCar, FaFire, FaShip, FaBuilding, FaHeart, FaShieldAlt,
  FaBan, FaRedo, FaVenusMars, FaBriefcase, FaMapMarkerAlt, FaBirthdayCake,
  FaUserPlus, FaList, FaChevronDown, FaChevronRight, FaIdCard, FaLayerGroup
} from 'react-icons/fa';

// Types
type TypeAssurance = {
  id: string;
  code: string;
  nom: string;
  description: string;
};

type Souscription = {
  id: string;
  numero_assure: string;
  assure_id: string;
  type_assurance_id: string;
  type_assurance_nom?: string;
  type_assurance_code?: string;
  date_souscription: string;
  date_expiration: string;
  statut: string;
  prime: number;
  mode_paiement: string;
  documents_count?: number;
  created_at: string;
};

type Assure = {
  id: string;
  email: string;
  nom: string;
  telephone?: string;
  date_naissance?: string;
  sexe?: string;
  profession?: string;
  adresse?: string;
  nombre_assurances: number;
  souscriptions: Souscription[];
};

// Icônes et couleurs
const TYPES_ASSURANCE_ICONS: Record<string, any> = {
  automobile: FaCar,
  incendie: FaFire,
  transport: FaShip,
  rc: FaBuilding,
  vie: FaHeart,
};

const TYPES_COLORS: Record<string, string> = {
  automobile: 'bg-blue-100 text-blue-800 border-blue-200',
  incendie: 'bg-red-100 text-red-800 border-red-200',
  transport: 'bg-teal-100 text-teal-800 border-teal-200',
  rc: 'bg-purple-100 text-purple-800 border-purple-200',
  vie: 'bg-pink-100 text-pink-800 border-pink-200',
};

const DOCUMENTS_REQUIS: Record<string, { nom: string; obligatoire: boolean }[]> = {
  automobile: [
    { nom: 'Carte rose', obligatoire: true },
    { nom: 'Permis de conduire', obligatoire: true },
    { nom: "Pièce d'identité", obligatoire: true },
    { nom: "Facture d'achat", obligatoire: false },
  ],
  incendie: [
    { nom: 'Titre de propriété', obligatoire: true },
    { nom: 'Plan de construction', obligatoire: false },
    { nom: "Rapport d'évaluation", obligatoire: true },
    { nom: 'Inventaire valorisé', obligatoire: false },
  ],
  transport: [
    { nom: 'Facture commerciale', obligatoire: true },
    { nom: 'Titre de transport', obligatoire: true },
    { nom: 'Liste de colisage', obligatoire: true },
    { nom: "Certificat d'immatriculation", obligatoire: false },
  ],
  rc: [
    { nom: 'RCCM', obligatoire: true },
    { nom: 'ID Nat', obligatoire: true },
    { nom: "Statuts de l'entreprise", obligatoire: true },
    { nom: 'Description des activités', obligatoire: true },
  ],
  vie: [
    { nom: "Pièce d'identité", obligatoire: true },
    { nom: 'Questionnaire médical', obligatoire: true },
    { nom: 'Contrat de travail', obligatoire: false },
  ],
};

const MODES_PAIEMENT = [
  { value: 'mensuel', label: 'Mensuel', multiplicateur: 1.1 },
  { value: 'trimestriel', label: 'Trimestriel', multiplicateur: 1.05 },
  { value: 'semestriel', label: 'Semestriel', multiplicateur: 1.02 },
  { value: 'annuel', label: 'Annuel', multiplicateur: 1 },
];

const PRIMES_BASE: Record<string, number> = {
  automobile: 50000,
  incendie: 75000,
  transport: 100000,
  rc: 150000,
  vie: 200000,
};

const calculerAge = (dateNaissance: string): number | null => {
  if (!dateNaissance) return null;
  const aujourdhui = new Date();
  const naissance = new Date(dateNaissance);
  let age = aujourdhui.getFullYear() - naissance.getFullYear();
  const mois = aujourdhui.getMonth() - naissance.getMonth();
  if (mois < 0 || (mois === 0 && aujourdhui.getDate() < naissance.getDate())) age--;
  return age;
};

export default function SouscriptionsPage() {
  const { user } = useAuth();
  const [assures, setAssures] = useState<Assure[]>([]);
  const [filteredAssures, setFilteredAssures] = useState<Assure[]>([]);
  const [typesAssurance, setTypesAssurance] = useState<TypeAssurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreType, setFiltreType] = useState<string>('tous');

  // Expansion des lignes
  const [expandedAssures, setExpandedAssures] = useState<Set<string>>(new Set());
// Modal détail assuré
const [showDetailModal, setShowDetailModal] = useState(false);
const [detailAssure, setDetailAssure] = useState<Assure | null>(null);
  // Modal nouvelle souscription
  const [showModal, setShowModal] = useState(false);
  const [modeAjout, setModeAjout] = useState<'nouveau' | 'existant'>('nouveau');
  const [selectedAssure, setSelectedAssure] = useState<Assure | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeAssurance | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    telephone: '',
    mot_de_passe: '',
    date_naissance: '',
    sexe: '',
    profession: '',
    adresse: '',
    type_assurance_id: '',
    prime: 0,
    mode_paiement: 'annuel',
  });

  // Stats
  const [stats, setStats] = useState({
    totalAssures: 0,
    totalSouscriptions: 0,
    actives: 0,
    multiAssures: 0,
    automobile: 0,
    incendie: 0,
    transport: 0,
    rc: 0,
    vie: 0,
  });

  useEffect(() => {
    if (user) {
      chargerTypesAssurance();
      chargerAssures();
    }
  }, [user]);

  useEffect(() => {
    filtrerAssures();
  }, [assures, searchTerm, filtreType]);

  const chargerTypesAssurance = async () => {
    const { data } = await supabase.from('types_assurance').select('*').order('nom');
    if (data) setTypesAssurance(data);
  };

 // app/admin/souscriptions/page.tsx

const chargerAssures = async () => {
  try {
    setLoading(true);
    
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, email, nom, telephone, date_naissance, sexe, profession, adresse,
        souscriptions!souscriptions_assure_id_fkey(
          id, numero_assure, type_assurance_id, date_souscription, date_expiration,
          statut, prime, mode_paiement, created_at,
          type_assurance:types_assurance(id, code, nom),
          documents:souscription_documents(count)
        )
      `)
      .eq('role', 'assure')
      .order('nom');

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }

    const formatted = (users || []).map((u: any) => {
      // Utiliser la clé étrangère explicite
      const souscriptionsData = u.souscriptions || [];
      
      const souscriptions = souscriptionsData.map((s: any) => {
        let typeAssurance = s.type_assurance;
        if (Array.isArray(typeAssurance)) {
          typeAssurance = typeAssurance[0];
        }

        return {
          id: s.id,
          numero_assure: s.numero_assure,
          assure_id: s.assure_id || u.id,
          type_assurance_id: s.type_assurance_id,
          type_assurance_nom: typeAssurance?.nom || 'Inconnu',
          type_assurance_code: typeAssurance?.code || 'inconnu',
          date_souscription: s.date_souscription,
          date_expiration: s.date_expiration,
          statut: s.statut,
          prime: s.prime || 0,
          mode_paiement: s.mode_paiement || 'annuel',
          documents_count: s.documents?.[0]?.count || 0,
          created_at: s.created_at,
        };
      });

      souscriptions.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        id: u.id,
        email: u.email,
        nom: u.nom,
        telephone: u.telephone || '',
        date_naissance: u.date_naissance || '',
        sexe: u.sexe || '',
        profession: u.profession || '',
        adresse: u.adresse || '',
        nombre_assurances: souscriptions.filter((s: any) => s.statut !== 'resiliee').length,
        souscriptions: souscriptions,
      };
    });

    setAssures(formatted);
    calculerStats(formatted);
  } catch (err: any) {
    console.error('Erreur:', err);
    setError('Erreur lors du chargement : ' + (err.message || 'Erreur inconnue'));
  } finally {
    setLoading(false);
  }
};

  const calculerStats = (data: Assure[]) => {
    let totalSouscriptions = 0;
    let actives = 0;
    let auto = 0, incendie = 0, transport = 0, rc = 0, vie = 0;

    data.forEach(a => {
      a.souscriptions.forEach(s => {
        totalSouscriptions++;
        if (s.statut === 'active') actives++;
        if (s.type_assurance_code === 'automobile') auto++;
        if (s.type_assurance_code === 'incendie') incendie++;
        if (s.type_assurance_code === 'transport') transport++;
        if (s.type_assurance_code === 'rc') rc++;
        if (s.type_assurance_code === 'vie') vie++;
      });
    });

    setStats({
      totalAssures: data.length,
      totalSouscriptions,
      actives,
      multiAssures: data.filter(a => a.nombre_assurances >= 2).length,
      automobile: auto,
      incendie,
      transport,
      rc,
      vie,
    });
  };

  const filtrerAssures = () => {
    let filtered = [...assures];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.nom?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term) ||
        a.souscriptions.some(s => s.numero_assure?.toLowerCase().includes(term))
      );
    }

    if (filtreType !== 'tous') {
      filtered = filtered.filter(a =>
        a.souscriptions.some(s => s.type_assurance_code === filtreType && s.statut !== 'resiliee')
      );
    }

    setFilteredAssures(filtered);
  };

  const toggleExpand = (assureId: string) => {
    setExpandedAssures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assureId)) {
        newSet.delete(assureId);
      } else {
        newSet.add(assureId);
      }
      return newSet;
    });
  };

  const handleNouvelAssure = () => {
    setModeAjout('nouveau');
    setSelectedAssure(null);
    setFormData({
      email: '', nom: '', telephone: '', mot_de_passe: '',
      date_naissance: '', sexe: '', profession: '', adresse: '',
      type_assurance_id: '', prime: 0, mode_paiement: 'annuel',
    });
    setSelectedType(null);
    setUploadedFiles({});
    setShowModal(true);
  };

  const handleAjoutAssurance = (assure: Assure) => {
    setModeAjout('existant');
    setSelectedAssure(assure);
    setFormData({
      email: assure.email,
      nom: assure.nom,
      telephone: assure.telephone || '',
      mot_de_passe: '',
      date_naissance: assure.date_naissance || '',
      sexe: assure.sexe || '',
      profession: assure.profession || '',
      adresse: assure.adresse || '',
      type_assurance_id: '',
      prime: 0,
      mode_paiement: 'annuel',
    });
    setSelectedType(null);
    setUploadedFiles({});
    setShowModal(true);
  };

  const handleTypeChange = (typeId: string) => {
    const type = typesAssurance.find(t => t.id === typeId);
    setSelectedType(type || null);
    const primeBase = type ? PRIMES_BASE[type.code] || 50000 : 0;
    setFormData({ ...formData, type_assurance_id: typeId, prime: primeBase });
    setUploadedFiles({});
  };

  const handleModePaiementChange = (mode: string) => {
    const modeInfo = MODES_PAIEMENT.find(m => m.value === mode);
    if (selectedType && modeInfo) {
      const primeBase = PRIMES_BASE[selectedType.code] || 50000;
      setFormData({ ...formData, mode_paiement: mode, prime: Math.round(primeBase * modeInfo.multiplicateur) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type_assurance_id) {
      setError('Veuillez sélectionner un type d\'assurance');
      return;
    }

    if (modeAjout === 'nouveau' && !formData.mot_de_passe) {
      setError('Le mot de passe est obligatoire pour un nouvel assuré');
      return;
    }

    const documents = selectedType ? DOCUMENTS_REQUIS[selectedType.code] || [] : [];
    const obligatoires = documents.filter(d => d.obligatoire);
    const auMoinsUn = obligatoires.some(d => uploadedFiles[d.nom]);
    if (!auMoinsUn) {
      setError('Veuillez uploader au moins un document obligatoire');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Vérifier si l'assuré a déjà ce type d'assurance
      if (modeAjout === 'existant' && selectedAssure) {
        const dejaSouscrit = selectedAssure.souscriptions.some(
          s => s.type_assurance_id === formData.type_assurance_id && s.statut !== 'resiliee'
        );
        if (dejaSouscrit) {
          throw new Error('Cet assuré a déjà une souscription active pour ce type d\'assurance');
        }
      }

      // Créer/Mettre à jour l'utilisateur
      let userId: string;
      if (modeAjout === 'existant' && selectedAssure) {
        userId = selectedAssure.id;
        // Mettre à jour les infos
        await supabase.from('users').update({
          telephone: formData.telephone || null,
          date_naissance: formData.date_naissance || null,
          sexe: formData.sexe || null,
          profession: formData.profession || null,
          adresse: formData.adresse || null,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            email: formData.email.toLowerCase().trim(),
            nom: formData.nom,
            telephone: formData.telephone || null,
            mot_de_passe: formData.mot_de_passe,
            role: 'assure',
            first_login: true,
            date_naissance: formData.date_naissance || null,
            sexe: formData.sexe || null,
            profession: formData.profession || null,
            adresse: formData.adresse || null,
          })
          .select()
          .single();
        if (userError) throw userError;
        userId = newUser.id;
      }

      // Générer le numéro (avec mise à jour des anciens)
      const { data: numeroAssure, error: numeroError } = await supabase
        .rpc('generer_numero_assure', {
          p_assure_id: userId,
          p_type_assurance_id: formData.type_assurance_id
        });
      if (numeroError) throw numeroError;

      // Date expiration
      const dateExpiration = new Date();
      dateExpiration.setFullYear(dateExpiration.getFullYear() + 1);

      // Créer la souscription
      const { data: souscription, error: souscrError } = await supabase
        .from('souscriptions')
        .insert({
          numero_assure: numeroAssure,
          assure_id: userId,
          type_assurance_id: formData.type_assurance_id,
          date_souscription: new Date().toISOString().split('T')[0],
          date_expiration: dateExpiration.toISOString().split('T')[0],
          statut: 'active',
          prime: formData.prime,
          mode_paiement: formData.mode_paiement,
          created_by: user?.id,
        })
        .select()
        .single();
      if (souscrError) throw souscrError;

      // Upload documents
      for (const [docNom, file] of Object.entries(uploadedFiles)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${souscription.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: upErr } = await supabase.storage.from('souscriptions').upload(fileName, file);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('souscriptions').getPublicUrl(fileName);
          await supabase.from('souscription_documents').insert({
            souscription_id: souscription.id,
            type_document: docNom,
            nom_fichier: file.name,
            url_fichier: publicUrl,
            taille_fichier: file.size,
            type_mime: file.type,
            est_obligatoire: obligatoires.some(d => d.nom === docNom),
          });
        }
      }

      setSuccess(modeAjout === 'existant' ? 'Nouvelle assurance ajoutée !' : 'Souscription créée !');
      setShowModal(false);
      await chargerAssures();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await supabase.from('souscriptions').update({ statut: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
      await chargerAssures();
      setSuccess(`Statut mis à jour : ${newStatus}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

 const handleDelete = async (souscriptionId: string) => {
  try {
    // Récupérer les infos avant de demander confirmation
    const { data: souscr } = await supabase
      .from('souscriptions')
      .select('id, assure_id, numero_assure')
      .eq('id', souscriptionId)
      .single();

    if (!souscr) {
      setError('Souscription introuvable');
      return;
    }

    // Compter les autres souscriptions
    const { data: autres } = await supabase
      .from('souscriptions')
      .select('id')
      .eq('assure_id', souscr.assure_id)
      .neq('id', souscriptionId);

    const estDerniere = !autres || autres.length === 0;
    
    // Message de confirmation adapté
    const message = estDerniere 
      ? '⚠️ C\'est la dernière souscription de cet assuré.\n\nLa suppression entraînera aussi la suppression du compte utilisateur.\n\nConfirmer ?'
      : 'Supprimer cette souscription ?';

    if (!confirm(message)) return;

    // Supprimer la souscription
    const { error: deleteError } = await supabase
      .from('souscriptions')
      .delete()
      .eq('id', souscriptionId);

    if (deleteError) throw deleteError;

    if (estDerniere) {
      // Supprimer l'utilisateur
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', souscr.assure_id);

      if (userError) {
        setError('Souscription supprimée mais erreur suppression compte : ' + userError.message);
      } else {
        setSuccess('✅ Souscription et compte utilisateur supprimés définitivement');
      }
    } else {
      // Mettre à jour les numéros si une seule assurance restante
      if (autres.length === 1) {
        const { data: derniere } = await supabase
          .from('souscriptions')
          .select('id, numero_assure')
          .eq('id', autres[0].id)
          .single();

        if (derniere) {
          const nouveauNumero = '10' + derniere.numero_assure.substring(2);
          await supabase
            .from('souscriptions')
            .update({ 
              numero_assure: nouveauNumero,
              updated_at: new Date().toISOString()
            })
            .eq('id', derniere.id);
        }
        setSuccess('Souscription supprimée. Numéro repassé en assurance simple (10).');
      } else {
        setSuccess('Souscription supprimée avec succès.');
      }
    }

    await chargerAssures();
    setTimeout(() => setSuccess(null), 3000);

  } catch (err: any) {
    console.error('Erreur:', err);
    setError(err.message || 'Erreur lors de la suppression');
  }
};

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'CDF' }).format(montant);
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspendue: 'bg-yellow-100 text-yellow-800',
      resiliee: 'bg-red-100 text-red-800',
      expiree: 'bg-gray-100 text-gray-800',
    };
    return badges[statut] || 'bg-gray-100';
  };

  const getSexeLabel = (sexe?: string) => {
    const labels: Record<string, string> = { M: 'M', F: 'F', autre: 'Autre' };
    return sexe ? labels[sexe] || sexe : '-';
  };

  const getTypeIcon = (code: string) => {
    const Icon = TYPES_ASSURANCE_ICONS[code] || FaShieldAlt;
    return <Icon className="h-4 w-4" />;
  };

  const getNumeroPrefix = (numero: string) => {
    const prefix = numero.substring(0, 2);
    if (prefix === '10') return { label: 'Simple', color: 'text-blue-600 bg-blue-50' };
    if (prefix === '12') return { label: 'Multiple', color: 'text-orange-600 bg-orange-50' };
    if (prefix === '13') return { label: 'Spéciale', color: 'text-purple-600 bg-purple-50' };
    return { label: prefix, color: 'text-gray-600 bg-gray-50' };
  };

  const getAssurancesRestantes = (assure: Assure, typeCode: string): TypeAssurance[] => {
    const codesSouscrits = assure.souscriptions
      .filter(s => s.statut !== 'resiliee')
      .map(s => s.type_assurance_code);
    return typesAssurance.filter(t => !codesSouscrits.includes(t.code));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
        <h3 className="mt-2 text-lg font-medium">Accès non autorisé</h3>
        <p className="text-sm text-gray-500">Page réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <FaFileContract className="mr-3 h-6 w-6 text-blue-600" />
            Gestion des Souscriptions
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les assurés et leurs contrats (assurances multiples)
          </p>
        </div>
        <button onClick={handleNouvelAssure}
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <FaPlus className="mr-2 h-4 w-4" />
          Nouvelle souscription
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Assurés</p>
          <p className="text-2xl font-semibold">{stats.totalAssures}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm border border-blue-200">
          <p className="text-sm text-blue-700">Souscriptions</p>
          <p className="text-2xl font-semibold text-blue-800">{stats.totalSouscriptions}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow-sm border border-green-200">
          <p className="text-sm text-green-700">Actives</p>
          <p className="text-2xl font-semibold text-green-800">{stats.actives}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-4 shadow-sm border border-orange-200">
          <p className="text-sm text-orange-700">Multi-assurances</p>
          <p className="text-2xl font-semibold text-orange-800">{stats.multiAssures}</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 shadow-sm border border-purple-200">
          <p className="text-sm text-purple-700">Spéciales</p>
          <p className="text-2xl font-semibold text-purple-800">{stats.rc + stats.vie}</p>
        </div>
        {Object.entries(TYPES_ASSURANCE_ICONS).map(([code, Icon]) => (
          <div key={code} className="rounded-lg bg-white p-4 shadow-sm border">
            <p className="text-sm text-gray-500 flex items-center">
              <Icon className="mr-1 h-3 w-3" />
              {code === 'rc' ? 'RC' : code.charAt(0).toUpperCase() + code.slice(1)}
            </p>
            <p className="text-xl font-semibold">{stats[code as keyof typeof stats] || 0}</p>
          </div>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 flex">
          <FaTimes className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><FaTimes className="h-4 w-4 text-red-500" /></button>
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4 flex">
          <FaCheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="ml-3 text-sm text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto"><FaTimes className="h-4 w-4 text-green-500" /></button>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher assuré, email, n°..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm" />
          </div>
          <select value={filtreType} onChange={(e) => setFiltreType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="tous">Tous les types</option>
            {typesAssurance.map(t => <option key={t.id} value={t.code}>{t.nom}</option>)}
          </select>
          <div className="flex items-center text-sm text-gray-500">
            {filteredAssures.length} assuré(s)
            {(searchTerm || filtreType !== 'tous') && (
              <button onClick={() => { setSearchTerm(''); setFiltreType('tous'); }}
                className="ml-auto text-blue-600"><FaTimes className="inline mr-1 h-3 w-3" />Réinitialiser</button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des assurés avec leurs souscriptions */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FaSpinner className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : filteredAssures.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FaUser className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun assuré trouvé</p>
          </div>
        ) : (
          filteredAssures.map(assure => {
            const isExpanded = expandedAssures.has(assure.id);
            const assurancesRestantes = getAssurancesRestantes(assure, '');

            return (
              <div key={assure.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* En-tête assuré */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleExpand(assure.id)}>
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-400">
                      {isExpanded ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
                    </button>
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <FaUser className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{assure.nom}</p>
                      <p className="text-xs text-gray-500">{assure.email}</p>
                    </div>
                    {/* Badge multi-assurances */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      assure.nombre_assurances >= 3 ? 'bg-orange-100 text-orange-800' :
                      assure.nombre_assurances >= 2 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <FaLayerGroup className="mr-1 h-3 w-3" />
                      {assure.nombre_assurances} contrat{assure.nombre_assurances > 1 ? 's' : ''}
                    </span>
                  </div>
               <div className="flex items-center space-x-2">
  {/* Bouton Voir détail */}
  <button 
    onClick={(e) => { 
      e.stopPropagation(); 
      setDetailAssure(assure); 
      setShowDetailModal(true); 
    }}
    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
    title="Voir le détail de l'assuré"
  >
    <FaEye className="mr-1 h-3 w-3" />
    Détail
  </button>
  
  {/* Bouton Ajouter assurance */}
  <button 
    onClick={(e) => { 
      e.stopPropagation(); 
      handleAjoutAssurance(assure); 
    }}
    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
    title="Ajouter une assurance"
  >
    <FaPlus className="mr-1 h-3 w-3" />
    Ajouter
  </button>
</div>
                </div>

                {/* Souscriptions (expandable) */}
                {isExpanded && (
                  <div className="border-t">
                    {assure.souscriptions.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">Aucune souscription</p>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">N° Assuré</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Prime</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Expiration</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {assure.souscriptions.map(souscr => {
                            const isExpired = new Date(souscr.date_expiration) < new Date();
                            const prefixInfo = getNumeroPrefix(souscr.numero_assure);
                            return (
                              <tr key={souscr.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center space-x-1">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${prefixInfo.color}`}>
                                      {prefixInfo.label}
                                    </span>
                                    <span className="text-sm font-mono font-semibold text-blue-600">
                                      {souscr.numero_assure}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${TYPES_COLORS[souscr.type_assurance_code || ''] || ''}`}>
                                    {getTypeIcon(souscr.type_assurance_code || '')}
                                    <span className="ml-1">{souscr.type_assurance_nom}</span>
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span className="font-medium">{formatMontant(souscr.prime)}</span>
                                  <span className="text-xs text-gray-500 block">{souscr.mode_paiement}</span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <FaCalendarAlt className={`inline mr-1 h-3 w-3 ${isExpired ? 'text-red-500' : 'text-gray-400'}`} />
                                  <span className={isExpired ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                    {formatDate(souscr.date_expiration)}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(souscr.statut)}`}>
                                    {souscr.statut}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end space-x-1">
                                    {souscr.statut === 'active' && (
                                      <button onClick={() => handleStatusChange(souscr.id, 'suspendue')}
                                        className="text-yellow-600 hover:bg-yellow-50 p-1 rounded" title="Suspendre">
                                        <FaBan className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    {souscr.statut === 'suspendue' && (
                                      <button onClick={() => handleStatusChange(souscr.id, 'active')}
                                        className="text-green-600 hover:bg-green-50 p-1 rounded" title="Réactiver">
                                        <FaRedo className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    <button onClick={() => handleDelete(souscr.id)}
                                      className="text-red-600 hover:bg-red-50 p-1 rounded" title="Supprimer">
                                      <FaTrash className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  {modeAjout === 'existant' ? (
                    <><FaLayerGroup className="mr-2 h-5 w-5 text-green-600" />
                      Ajouter une assurance - {selectedAssure?.nom}</>
                  ) : (
                    <><FaUserPlus className="mr-2 h-5 w-5 text-blue-600" />
                      Nouvelle souscription</>
                  )}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Badge info multi-assurances */}
              {modeAjout === 'existant' && selectedAssure && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <FaLayerGroup className="inline mr-2 h-4 w-4" />
                  {selectedAssure.nom} a déjà <strong>{selectedAssure.nombre_assurances}</strong> contrat(s).
                  Le numéro passera en <strong>12</strong> (assurances multiples).
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Profil (seulement pour nouveau) */}
                {modeAjout === 'nouveau' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3"><FaUser className="inline mr-1 h-4 w-4" /> Profil de l'assuré</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nom complet *</label>
                        <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Téléphone</label>
                        <input type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                        <input type="password" value={formData.mot_de_passe} onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1"><FaBirthdayCake className="inline mr-1 h-3 w-3" />Date naissance</label>
                        <input type="date" value={formData.date_naissance} onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1"><FaVenusMars className="inline mr-1 h-3 w-3" />Sexe</label>
                        <select value={formData.sexe} onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm">
                          <option value="">Sélectionner</option>
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1"><FaBriefcase className="inline mr-1 h-3 w-3" />Profession</label>
                        <input type="text" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1"><FaMapMarkerAlt className="inline mr-1 h-3 w-3" />Adresse</label>
                        <input type="text" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Type d'assurance */}
                <div>
                  <label className="block text-sm font-medium mb-2">Type d'assurance *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {typesAssurance.map(type => {
                      const Icon = TYPES_ASSURANCE_ICONS[type.code] || FaShieldAlt;
                      const isSpecial = type.code === 'rc' || type.code === 'vie';
                      // Vérifier si déjà souscrit (en mode existant)
                      const dejaSouscrit = modeAjout === 'existant' && selectedAssure?.souscriptions
                        .some(s => s.type_assurance_id === type.id && s.statut !== 'resiliee');
                      
                      return (
                        <button key={type.id} type="button"
                          onClick={() => !dejaSouscrit && handleTypeChange(type.id)}
                          disabled={dejaSouscrit}
                          className={`p-3 text-left rounded-lg border-2 transition-all ${
                            dejaSouscrit ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' :
                            formData.type_assurance_id === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <div className="flex items-center">
                            <Icon className={`h-5 w-5 ${formData.type_assurance_id === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="ml-2 font-medium text-sm">{type.nom}</span>
                            {isSpecial && <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Spéciale</span>}
                            {dejaSouscrit && <span className="ml-auto text-xs text-red-500">Déjà souscrit</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prime */}
                {selectedType && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Prime (CDF)</label>
                        <input type="number" value={formData.prime} onChange={(e) => setFormData({ ...formData, prime: Number(e.target.value) })}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm font-semibold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Paiement</label>
                        <select value={formData.mode_paiement} onChange={(e) => handleModePaiementChange(e.target.value)}
                          className="block w-full rounded-md border-gray-300 p-2 border text-sm">
                          {MODES_PAIEMENT.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Expire le {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                {/* Documents */}
                {selectedType && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-medium mb-2"><FaUpload className="inline mr-1 h-4 w-4 text-yellow-600" />Documents (* obligatoire)</h4>
                    <div className="space-y-2">
                      {DOCUMENTS_REQUIS[selectedType.code]?.map(doc => (
                        <div key={doc.nom} className="flex items-center justify-between bg-white rounded-md p-2 border">
                          <span className="text-sm">{doc.nom}{doc.obligatoire && <span className="text-red-500 ml-1">*</span>}</span>
                          <div>
                            {uploadedFiles[doc.nom] ? (
                              <div className="flex items-center">
                                <span className="text-xs text-green-600 mr-2">{uploadedFiles[doc.nom].name.substring(0, 15)}...</span>
                                <button type="button" onClick={() => {
                                  setUploadedFiles(prev => { const n = {...prev}; delete n[doc.nom]; return n; });
                                }} className="text-red-500"><FaTrash className="h-3 w-3" /></button>
                              </div>
                            ) : (
                              <label className="cursor-pointer inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">
                                <FaUpload className="mr-1 h-3 w-3" />Upload
                                <input type="file" className="sr-only" onChange={(e) => {
                                  if (e.target.files?.[0]) setUploadedFiles(prev => ({ ...prev, [doc.nom]: e.target.files![0] }));
                                }} />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex space-x-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {saving ? <><FaSpinner className="animate-spin mr-2 h-4 w-4" />En cours...</> :
                      <><FaPlus className="mr-2 h-4 w-4" />{modeAjout === 'existant' ? 'Ajouter l\'assurance' : 'Créer la souscription'}</>}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Modal Détail Assuré */}
{showDetailModal && detailAssure && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <FaIdCard className="mr-2 h-5 w-5 text-blue-600" />
            Détail de l'assuré
          </h3>
          <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Infos personnelles */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FaUser className="mr-2 h-4 w-4 text-gray-600" />
            Informations personnelles
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Nom complet</p>
              <p className="font-medium">{detailAssure.nom}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-blue-600">{detailAssure.email}</p>
            </div>
            {detailAssure.telephone && (
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="font-medium">{detailAssure.telephone}</p>
              </div>
            )}
            {detailAssure.date_naissance && (
              <div>
                <p className="text-xs text-gray-500 flex items-center">
                  <FaBirthdayCake className="mr-1 h-3 w-3" />
                  Date de naissance
                </p>
                <p className="font-medium">
                  {formatDate(detailAssure.date_naissance)}
                  {calculerAge(detailAssure.date_naissance) !== null && (
                    <span className="text-gray-500 text-sm ml-1">
                      ({calculerAge(detailAssure.date_naissance)} ans)
                    </span>
                  )}
                </p>
              </div>
            )}
            {detailAssure.sexe && (
              <div>
                <p className="text-xs text-gray-500 flex items-center">
                  <FaVenusMars className="mr-1 h-3 w-3" />
                  Sexe
                </p>
                <p className="font-medium">{getSexeLabel(detailAssure.sexe)}</p>
              </div>
            )}
            {detailAssure.profession && (
              <div>
                <p className="text-xs text-gray-500 flex items-center">
                  <FaBriefcase className="mr-1 h-3 w-3" />
                  Profession
                </p>
                <p className="font-medium">{detailAssure.profession}</p>
              </div>
            )}
            {detailAssure.adresse && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 flex items-center">
                  <FaMapMarkerAlt className="mr-1 h-3 w-3" />
                  Adresse
                </p>
                <p className="font-medium">{detailAssure.adresse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-600">Contrats actifs</p>
            <p className="text-2xl font-bold text-blue-700">
              {detailAssure.souscriptions.filter(s => s.statut === 'active').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-600">Total primes</p>
            <p className="text-2xl font-bold text-green-700">
              {formatMontant(detailAssure.souscriptions.reduce((sum, s) => sum + (s.prime || 0), 0))}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-orange-600">Total contrats</p>
            <p className="text-2xl font-bold text-orange-700">
              {detailAssure.souscriptions.length}
            </p>
          </div>
        </div>

        {/* Liste des souscriptions */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FaList className="mr-2 h-4 w-4 text-gray-600" />
            Contrats d'assurance
          </h4>
          {detailAssure.souscriptions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Aucune souscription</p>
          ) : (
            <div className="space-y-2">
              {detailAssure.souscriptions.map(souscr => {
                const isExpired = new Date(souscr.date_expiration) < new Date();
                return (
                  <div key={souscr.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${TYPES_COLORS[souscr.type_assurance_code || ''] || ''}`}>
                          {getTypeIcon(souscr.type_assurance_code || '')}
                          <span className="ml-1">{souscr.type_assurance_nom}</span>
                        </span>
                        <span className="text-xs font-mono font-semibold text-blue-600">
                          {souscr.numero_assure}
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(souscr.statut)}`}>
                        {souscr.statut}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400">Prime:</span>
                        <span className="ml-1 font-medium">{formatMontant(souscr.prime)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Paiement:</span>
                        <span className="ml-1">{souscr.mode_paiement}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Expire:</span>
                        <span className={`ml-1 ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                          {formatDate(souscr.date_expiration)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton fermer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowDetailModal(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>

    
  );

  
}