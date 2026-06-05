

'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { createLot } from '@/app/lots/actions';
import { getMedicaments } from '@/app/medicaments/action';
import type { Medicament } from '@/types';
import { Box } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CreateLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLotModal({ isOpen, onClose, onSuccess }: CreateLotModalProps) {
  const { user } = useAuth();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [formData, setFormData] = useState({
    date_fabrication: new Date().toISOString().split('T')[0],
    date_expiration: '',
    quantite_totale: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedicaments();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadMedicaments = async () => {
    const data = await getMedicaments();
    setMedicaments(data);
  };

  const filteredMedicaments = medicaments.filter(m =>
    m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code_cis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedMedicament) {
    alert('Veuillez sélectionner un médicament');
    return;
  }

  if (!user) {
    alert('Utilisateur non authentifié');
    return;
  }

  setLoading(true);
  
  try {
    await createLot({
      medicament_id: selectedMedicament.id,
      date_fabrication: formData.date_fabrication,
      date_expiration: formData.date_expiration,
      quantite_totale: parseInt(formData.quantite_totale),
      currentUser: user, // Passer l'utilisateur connecté
    });
    onSuccess();
    onClose();
    resetForm();
  } catch (error) {
    console.error('Erreur création lot:', error);
    alert('Erreur lors de la création du lot');
  } finally {
    setLoading(false);
  }
};
  const resetForm = () => {
    setSelectedMedicament(null);
    setSearchTerm('');
    setFormData({
      date_fabrication: new Date().toISOString().split('T')[0],
      date_expiration: '',
      quantite_totale: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-3xl bg-white shadow-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 bg-green-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Box className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                Créer un nouveau lot
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fabricant connecté - Affichage */}
              {user && (
                <div className="bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">Fabricant :</span> {user.nom_entite || user.username}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Le lot sera automatiquement associé à votre entité
                  </p>
                </div>
              )}

              {/* Recherche de médicament */}
              <div>
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Médicament <span className="text-red-600">*</span>
                </label>
                
                {!selectedMedicament ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou code CIS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border bg-white text-sm focus:border-green-600 focus:ring-0"
                      />
                    </div>
                    
                    {searchTerm && (
                      <div className="mt-2 border max-h-64 overflow-y-auto">
                        {filteredMedicaments.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
                            Aucun médicament trouvé
                          </div>
                        ) : (
                          filteredMedicaments.map((med) => (
                            <button
                              key={med.id}
                              type="button"
                              onClick={() => {
                                setSelectedMedicament(med);
                                setSearchTerm('');
                              }}
                              className="w-full text-left px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-green-50 transition-colors"
                            >
                              <div className="font-bold text-gray-900">
                                {med.nom}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {med.code_cis && `Code CIS: ${med.code_cis} • `}
                                {med.dosage} {med.forme}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="border border-green-600 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {selectedMedicament.nom}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          {selectedMedicament.code_cis && `Code CIS: ${selectedMedicament.code_cis} • `}
                          {selectedMedicament.dosage} {selectedMedicament.forme}
                        </div>
                        {selectedMedicament.description && (
                          <div className="text-xs text-gray-600 mt-2">
                            {selectedMedicament.description}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMedicament(null)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedMedicament && (
                <>
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                        Date de fabrication <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date_fabrication}
                        onChange={(e) => setFormData({ ...formData, date_fabrication: e.target.value })}
                        className="block w-full px-3 py-3 border text-sm focus:border-green-600 focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                        Date d'expiration <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={formData.date_fabrication}
                        value={formData.date_expiration}
                        onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                        className="block w-full px-3 py-3 border text-sm focus:border-green-600 focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Quantité */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Quantité totale (en boîtes) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantite_totale}
                      onChange={(e) => setFormData({ ...formData, quantite_totale: e.target.value })}
                      className="block w-full px-3 py-3 border text-sm focus:border-green-600 focus:ring-0"
                      placeholder="Ex: 1000"
                    />
                  </div>

                  {/* Résumé */}
                  <div className="border bg-gray-50 p-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Récapitulatif du lot
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Médicament:</span>
                        <div className="font-bold text-gray-900">{selectedMedicament.nom}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantité:</span>
                        <div className="font-bold text-gray-900">
                          {formData.quantite_totale ? `${formData.quantite_totale} boîtes` : '-'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Fabrication:</span>
                        <div className="font-bold text-gray-900">
                          {formData.date_fabrication ? new Date(formData.date_fabrication).toLocaleDateString('fr-FR') : '-'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Expiration:</span>
                        <div className="font-bold text-gray-900">
                          {formData.date_expiration ? new Date(formData.date_expiration).toLocaleDateString('fr-FR') : '-'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Fabricant:</span>
                        <div className="font-bold text-gray-900">
                          {user?.nom_entite || user?.username}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="border-t-2 px-6 py-4 flex justify-end space-x-3 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider bg-white border hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !selectedMedicament}
              className="px-6 py-3 text-sm font-bold text-white uppercase tracking-wider bg-green-600 border border-green-800 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création...
                </span>
              ) : (
                'Créer le lot'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}