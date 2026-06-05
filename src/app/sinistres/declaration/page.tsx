
// app/sinistres/declaration/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  FaFileAlt, FaArrowLeft, FaSave, FaUpload, FaTimes,
  FaCheckCircle, FaTimesCircle, FaUser, FaSpinner,
  FaCalendarAlt, FaMapMarkerAlt, FaExclamationTriangle,
  FaSearch, FaChevronDown, FaShieldAlt, FaIdCard, FaTrash
} from 'react-icons/fa';
import Link from 'next/link';

type User = {
  id: string;
  email: string;
  nom: string;
  role: string;
  telephone?: string;
  photo_profil?: string;
};

type Souscription = {
  id: string;
  numero_assure: string;
  type_assurance_code: string;
  type_assurance_nom: string;
  date_expiration: string;
  statut: string;
};

type TypeSinistreInfo = {
  value: string;
  label: string;
  icon: string;
  codes_assurance: string[];
};

const TYPES_SINISTRE: TypeSinistreInfo[] = [
  { value: 'accident_auto', label: 'Accident auto', icon: '🚗', codes_assurance: ['automobile'] },
  { value: 'vol', label: 'Vol', icon: '🔫', codes_assurance: ['automobile', 'incendie', 'rc'] },
  { value: 'incendie', label: 'Incendie', icon: '🔥', codes_assurance: ['incendie', 'rc'] },
  { value: 'degats_eau', label: 'Dégâts des eaux', icon: '💧', codes_assurance: ['incendie', 'rc'] },
  { value: 'catastrophe_naturelle', label: 'Catastrophe naturelle', icon: '🌪️', codes_assurance: ['automobile', 'incendie', 'transport'] },
  { value: 'bris_glace', label: 'Bris de glace', icon: '🪟', codes_assurance: ['automobile'] },
  { value: 'responsabilite_civile', label: 'Responsabilité civile', icon: '⚖️', codes_assurance: ['rc'] },
  { value: 'autre', label: 'Autre', icon: '📋', codes_assurance: [] },
];

function UserAvatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-16 w-16 text-lg' };

  const getInitials = (nom: string) => {
    return nom.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
      {user.photo_profil ? (
        <img src={user.photo_profil} alt={user.nom} className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.classList.add('bg-orange-600', 'flex', 'items-center', 'justify-center');
            target.parentElement!.innerHTML = `<span class="text-white font-medium">${getInitials(user.nom)}</span>`;
          }}
        />
      ) : (
        <div className="w-full h-full bg-orange-600 flex items-center justify-center">
          <span className="text-white font-medium">{getInitials(user.nom)}</span>
        </div>
      )}
    </div>
  );
}

export default function DeclarationSinistrePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [assures, setAssures] = useState<User[]>([]);
  const [filteredAssures, setFilteredAssures] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Recherche assuré
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAssure, setSelectedAssure] = useState<User | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Souscriptions de l'assuré sélectionné
  const [souscriptions, setSouscriptions] = useState<Souscription[]>([]);
  const [souscriptionsLoading, setSouscriptionsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    contrat_valide: boolean;
    message: string;
    type_couvert: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    assure_id: user?.role === 'assure' ? user.id : '',
    souscription_id: '',
    type_sinistre: '',
    description: '',
    date_sinistre: new Date().toISOString().split('T')[0],
    lieu: '',
    montant_estime: '',
  });

  useEffect(() => {
    if (user?.role === 'assure') {
      setFormData(prev => ({ ...prev, assure_id: user.id }));
      const currentUser: User = {
        id: user.id, email: user.email || '', nom: user.nom || user.email || '',
        role: 'assure', telephone: user.telephone, photo_profil: user.photo_profil,
      };
      setSelectedAssure(currentUser);
      chargerSouscriptions(user.id);
    } else {
      chargerAssures();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAssures(assures);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredAssures(assures.filter(a => 
        a.nom?.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term) || a.telephone?.includes(term)
      ));
    }
  }, [searchTerm, assures]);

  // Vérifier la couverture quand souscription ou type changent
  useEffect(() => {
    if (formData.souscription_id && formData.type_sinistre) {
      verifierCouverture();
    } else {
      setVerificationResult(null);
    }
  }, [formData.souscription_id, formData.type_sinistre]);

  const chargerAssures = async () => {
    try {
      const { data } = await supabase.from('users')
        .select('id, email, nom, role, telephone, photo_profil')
        .eq('role', 'assure').order('nom');
      const users = (data || []).map(u => ({ ...u, role: u.role as string }));
      setAssures(users);
      setFilteredAssures(users);
    } catch (err) {
      console.error('Erreur chargement assurés:', err);
    }
  };

  const chargerSouscriptions = async (assureId: string) => {
    setSouscriptionsLoading(true);
    setSouscriptions([]);
    setFormData(prev => ({ ...prev, souscription_id: '' }));
    setVerificationResult(null);

    try {
      const { data, error } = await supabase
        .from('souscriptions')
        .select(`
          id, numero_assure, type_assurance_id, date_expiration, statut,
          type_assurance:types_assurance(code, nom)
        `)
        .eq('assure_id', assureId)
        .eq('statut', 'active');

      if (error) throw error;

      const formatted: Souscription[] = (data || []).map((s: any) => ({
        id: s.id,
        numero_assure: s.numero_assure,
        type_assurance_code: s.type_assurance?.code || '',
        type_assurance_nom: s.type_assurance?.nom || 'Inconnu',
        date_expiration: s.date_expiration,
        statut: s.statut,
      }));

      setSouscriptions(formatted);
    } catch (err) {
      console.error('Erreur chargement souscriptions:', err);
    } finally {
      setSouscriptionsLoading(false);
    }
  };
const verifierCouverture = () => {
  const souscription = souscriptions.find(s => s.id === formData.souscription_id);
  const typeSinistre = TYPES_SINISTRE.find(t => t.value === formData.type_sinistre);
  if (!souscription || !typeSinistre) return;

  const dateExpiration = new Date(souscription.date_expiration);
  const aujourdhui = new Date();
  
  if (dateExpiration < aujourdhui) {
    setVerificationResult({
      contrat_valide: false,
      message: '❌ Ce contrat a expiré. Le sinistre ne sera pas couvert.',
      type_couvert: false,
    });
    return;
  }

  // Type "autre" toujours accepté, ou vérifier la correspondance
  const typeCouvert = typeSinistre.codes_assurance.length === 0 || 
    typeSinistre.codes_assurance.includes(souscription.type_assurance_code);

  setVerificationResult({
    contrat_valide: true,
    message: typeCouvert 
      ? '✅ Votre contrat couvre ce type de sinistre.' 
      : '⚠️ Ce sinistre n\'est pas couvert par ce contrat. Déclaration possible mais sans garantie de prise en charge.',
    type_couvert: typeCouvert, // Correction : utiliser la variable définie
  });
};

  const getSouscriptionsCompatibles = () => {
    if (!formData.type_sinistre) return souscriptions;
    const type = TYPES_SINISTRE.find(t => t.value === formData.type_sinistre);
    if (!type || type.codes_assurance.length === 0) return souscriptions;
    return souscriptions.filter(s => type.codes_assurance.includes(s.type_assurance_code));
  };

  const souscriptionsCompatibles = getSouscriptionsCompatibles();

  const handleSelectAssure = (assure: User) => {
    setSelectedAssure(assure);
    setFormData({ ...formData, assure_id: assure.id, souscription_id: '', type_sinistre: '' });
    setSearchTerm('');
    setShowDropdown(false);
    chargerSouscriptions(assure.id);
  };

  const handleRemoveAssure = () => {
    setSelectedAssure(null);
    setFormData({ ...formData, assure_id: '', souscription_id: '', type_sinistre: '' });
    setSouscriptions([]);
    setVerificationResult(null);
    setSearchTerm('');
  };
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const newFiles = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }
};

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateNumeroDossier = async (): Promise<string> => {
    const now = new Date();
    const prefix = `SIN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const { data } = await supabase
      .from('sinistres')
      .select('numero_dossier')
      .like('numero_dossier', `${prefix}%`)
      .order('numero_dossier', { ascending: false })
      .limit(1);

    let sequence = 1;
    if (data && data.length > 0) {
      const parts = data[0].numero_dossier.split('-');
      sequence = (parseInt(parts[parts.length - 1]) || 0) + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  };

  const uploadDocuments = async (sinistreId: string) => {
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${sinistreId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      setUploadProgress(Math.round(((i + 1) / uploadedFiles.length) * 100));

      const { error: uploadError } = await supabase.storage
        .from('sinistres').upload(fileName, file);
      if (uploadError) continue;

      const { data: { publicUrl } } = supabase.storage
        .from('sinistres').getPublicUrl(fileName);

      let typeDocument = 'autre';
      const name = file.name.toLowerCase();
      if (name.includes('police') || name.includes('assurance')) typeDocument = 'police_assurance';
      else if (name.includes('rapport')) typeDocument = 'rapport_police';
      else if (file.type.startsWith('image/')) typeDocument = 'photo_dommage';
      else if (name.includes('facture')) typeDocument = 'facture';
      else if (name.includes('devis')) typeDocument = 'devis';

      await supabase.from('sinistre_documents').insert({
        sinistre_id: sinistreId,
        type_document: typeDocument,
        nom_fichier: file.name,
        url_fichier: publicUrl,
        taille_fichier: file.size,
        type_mime: file.type,
        uploaded_by: user?.id,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assure_id || !formData.souscription_id || !formData.type_sinistre || 
        !formData.description || !formData.date_sinistre || !formData.lieu) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const numeroDossier = await generateNumeroDossier();

      const { data: sinistre, error: sinistreError } = await supabase
        .from('sinistres')
        .insert({
          assure_id: formData.assure_id,
          souscription_id: formData.souscription_id,
          numero_dossier: numeroDossier,
          type_sinistre: formData.type_sinistre,
          description: formData.description,
          date_sinistre: formData.date_sinistre,
          lieu: formData.lieu,
          montant_estime: formData.montant_estime ? parseFloat(formData.montant_estime) : null,
          statut: 'en_attente',
          created_by: user?.id,
        })
        .select()
        .single();

      if (sinistreError) throw sinistreError;

      if (uploadedFiles.length > 0) {
        await uploadDocuments(sinistre.id);
      }

      setSuccess(`Sinistre déclaré avec succès ! N° ${numeroDossier}`);
      setTimeout(() => router.push(`/sinistres/${sinistre.id}`), 2000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déclaration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/sinistres" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <FaArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FaFileAlt className="mr-3 h-6 w-6 text-blue-600" />
          Déclaration de Sinistre
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Remplissez ce formulaire pour déclarer un nouveau sinistre
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 flex">
          <FaTimesCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><FaTimes className="h-4 w-4 text-red-500" /></button>
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4 flex">
          <FaCheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="ml-3 text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection de l'assuré (admin/agent) */}
          {user?.role !== 'assure' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2 h-4 w-4 text-gray-400" /> Assuré *
              </label>
              {selectedAssure ? (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={selectedAssure} size="md" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedAssure.nom}</p>
                      <p className="text-xs text-gray-500">{selectedAssure.email}</p>
                      {selectedAssure.telephone && <p className="text-xs text-gray-400">{selectedAssure.telephone}</p>}
                    </div>
                  </div>
                  <button type="button" onClick={handleRemoveAssure} className="text-gray-400 hover:text-red-500">
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div ref={searchRef} className="relative">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Rechercher un assuré par nom, email..."
                      className="block w-full rounded-md border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredAssures.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">Aucun assuré trouvé</div>
                      ) : (
                        filteredAssures.map((assure) => (
                          <button key={assure.id} type="button" onClick={() => handleSelectAssure(assure)}
                            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-left border-b last:border-b-0">
                            <UserAvatar user={assure} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{assure.nom}</p>
                              <p className="text-xs text-gray-500 truncate">{assure.email}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assuré connecté */}
          {user?.role === 'assure' && selectedAssure && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <UserAvatar user={selectedAssure} size="md" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedAssure.nom}</p>
                  <p className="text-xs text-gray-500">{selectedAssure.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sélection du contrat */}
          {selectedAssure && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaIdCard className="inline mr-2 h-4 w-4 text-gray-400" /> Contrat d'assurance *
              </label>
              {souscriptionsLoading ? (
                <div className="flex items-center text-sm text-gray-500 py-2">
                  <FaSpinner className="animate-spin mr-2" /> Chargement des contrats...
                </div>
              ) : souscriptions.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                  <FaExclamationTriangle className="inline mr-2" />
                  Aucun contrat actif trouvé pour cet assuré.
                </div>
              ) : (
                <select
                  value={formData.souscription_id}
                  onChange={(e) => setFormData({ ...formData, souscription_id: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Sélectionnez un contrat --</option>
                  {souscriptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.type_assurance_nom} - N° {s.numero_assure} (Expire: {new Date(s.date_expiration).toLocaleDateString('fr-FR')})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

        {/* Type de sinistre */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <FaExclamationTriangle className="inline mr-2 h-4 w-4 text-gray-400" /> Type de sinistre *
  </label>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {TYPES_SINISTRE.map(type => {
      // Si aucun contrat sélectionné, tout est disponible
      // Si contrat sélectionné, vérifier la compatibilité
      const compatible = !formData.souscription_id || 
        type.codes_assurance.length === 0 || 
        souscriptions.some(s => 
          s.id === formData.souscription_id && 
          type.codes_assurance.includes(s.type_assurance_code)
        );
      
      const disabled = !!formData.souscription_id && !compatible;

      return (
        <button key={type.value} type="button"
          onClick={() => !disabled && setFormData({ ...formData, type_sinistre: type.value })}
          disabled={disabled}
          className={`p-3 text-sm rounded-md border-2 transition-all ${
            formData.type_sinistre === type.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : disabled
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}>
          <span className="text-xl block mb-1">{type.icon}</span>
          {type.label}
        </button>
      );
    })}
  </div>
  {/* Indication si des types sont grisés */}
  {formData.souscription_id && (
    <p className="mt-2 text-xs text-gray-500">
      Les types de sinistre grisés ne sont pas couverts par le contrat sélectionné.
    </p>
  )}
</div>

          {/* Vérification contrat */}
          {verificationResult && (
            <div className={`rounded-lg p-4 text-sm flex items-start ${
              verificationResult.type_couvert 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : verificationResult.contrat_valide 
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {verificationResult.type_couvert ? <FaCheckCircle className="mr-2 mt-0.5 flex-shrink-0" /> : 
               verificationResult.contrat_valide ? <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0" /> :
               <FaTimesCircle className="mr-2 mt-0.5 flex-shrink-0" />}
              {verificationResult.message}
            </div>
          )}

          {/* Date et lieu */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2 h-4 w-4 text-gray-400" /> Date du sinistre *
              </label>
              <input type="date" value={formData.date_sinistre}
                onChange={(e) => setFormData({ ...formData, date_sinistre: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2 h-4 w-4 text-gray-400" /> Lieu du sinistre *
              </label>
              <input type="text" value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Adresse ou lieu du sinistre" required />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée *</label>
            <textarea value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Décrivez les circonstances du sinistre en détail..." required />
          </div>

          {/* Montant estimé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant estimé des dommages (optionnel)
            </label>
            <div className="relative">
              <input type="number" value={formData.montant_estime}
                onChange={(e) => setFormData({ ...formData, montant_estime: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0" min="0" step="0.01" />
              <span className="absolute right-3 top-2.5 text-sm text-gray-500">CDF</span>
            </div>
          </div>

          {/* Upload documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUpload className="inline mr-2 h-4 w-4 text-gray-400" /> Documents justificatifs
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Télécharger des fichiers</span>
                    <input type="file" multiple onChange={handleFileChange} className="sr-only"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">PDF, Word, JPG, PNG jusqu'à 10MB</p>
              </div>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                    <div className="flex items-center">
                      <FaFileAlt className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progression upload */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-4 pt-4">
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><FaSpinner className="animate-spin mr-2 h-4 w-4" /> Déclaration en cours...</> :
                <><FaSave className="mr-2 h-4 w-4" /> Déclarer le sinistre</>}
            </button>
            <Link href="/sinistres"
              className="flex-1 inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}