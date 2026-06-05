'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUpload, FaTrash } from 'react-icons/fa';
import { createMedicament } from '@/app/medicaments/action';
import type { Medicament } from '@/types';

interface CreateMedicamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UniteType = 'boite' | 'carton' | 'palette';

export default function CreateMedicamentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMedicamentModalProps) {
  const [formData, setFormData] = useState<{
    code_cis: string;
    nom: string;
    dosage: string;
    forme: string;
    type_unite: UniteType;
    description: string;
    image_base64: string;
  }>({
    code_cis: '',
    nom: '',
    dosage: '',
    forme: '',
    type_unite: 'boite',
    description: '',
    image_base64: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Empêcher le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset du formulaire
  const resetForm = () => {
    setFormData({
      code_cis: '',
      nom: '',
      dosage: '',
      forme: '',
      type_unite: 'boite',
      description: '',
      image_base64: '',
    });
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.nom.trim()) {
      setError('Le nom du médicament est requis');
      return;
    }

    setLoading(true);

    try {
      const payload: Partial<Medicament> = {
        code_cis: formData.code_cis || null,
        nom: formData.nom,
        dosage: formData.dosage || null,
        forme: formData.forme || null,
        type_unite: formData.type_unite,
        description: formData.description || null,
        image_base64: formData.image_base64 || null,
      };
      await createMedicament(payload);
      resetForm();
      onSuccess();
    } catch (err: any) {
      const message =
        err?.message || 'Erreur lors de la création du médicament';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification taille max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image_base64: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image_base64: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Nouveau médicament
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Code CIS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code CIS
            </label>
            <input
              type="text"
              value={formData.code_cis}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code_cis: e.target.value }))
              }
              placeholder="Ex: 61234567"
              className="w-full p-2.5 text-sm border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors placeholder:text-gray-400"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du médicament <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nom: e.target.value }))
              }
              placeholder="Ex: Doliprane"
              className="w-full p-2.5 text-sm border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors placeholder:text-gray-400"
            />
          </div>

          {/* Dosage & Forme */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dosage: e.target.value }))
                }
                placeholder="Ex: 500mg"
                className="w-full p-2.5 text-sm border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forme
              </label>
              <select
                value={formData.forme}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, forme: e.target.value }))
                }
                className="w-full p-2.5 text-sm border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors bg-white"
              >
                <option value="">Sélectionner...</option>
                <option value="comprimé">Comprimé</option>
                <option value="gélule">Gélule</option>
                <option value="sirop">Sirop</option>
                <option value="injectable">Injectable</option>
                <option value="pommade">Pommade</option>
                <option value="crème">Crème</option>
                <option value="suppositoire">Suppositoire</option>
                <option value="sachet">Sachet</option>
                <option value="ampoule">Ampoule</option>
              </select>
            </div>
          </div>

          {/* Type d'unité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'unité <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              {(['boite', 'carton', 'palette'] as UniteType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type_unite: type }))
                  }
                  className={`flex-1 px-3 py-2.5 text-sm font-medium border transition-colors ${
                    formData.type_unite === type
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description optionnelle..."
              className="w-full p-2.5 text-sm border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors resize-none placeholder:text-gray-400"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors">
                <FaUpload className="mr-2 h-4 w-4" />
                Choisir une image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {formData.image_base64 && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent transition-colors"
                  title="Supprimer l'image"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
            </div>
            {formData.image_base64 && (
              <div className="mt-3">
                <img
                  src={formData.image_base64}
                  alt="Aperçu"
                  className="h-24 w-24 object-cover border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}