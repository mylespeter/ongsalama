// app/profile/page.tsx
'use client';

import { useState } from 'react';
import { useAuth, useRole } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FaUser, 
  FaIdCard, 
  FaPhone, 
  FaEnvelope, 
  FaVenusMars, 
  FaCalendarAlt,
  FaSave,
  FaEdit,
  FaCamera,
  FaLock,
  FaCheckCircle
} from 'react-icons/fa';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Loader } from '@/components/ui/Loader';

// Configuration des rôles
const ROLE_LABELS: Record<string, string> = {
  accueil: 'Agent d\'accueil',
  consultation: 'Médecin consultant',
  laboratoire: 'Laborantin',
  pharmacie: 'Pharmacien',
  administration: 'Administrateur'
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { role } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    telephone: user?.telephone || '',
    genre: user?.genre || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user) {
    return <Loader fullScreen />;
  }

  const roleLabel = ROLE_LABELS[user.role] || user.role;

  const handleSave = async () => {
    if (!formData.username) {
      setError('Le nom est requis');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        username: formData.username,
        telephone: formData.telephone || null,
        genre: formData.genre || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mettre à jour le contexte
      updateUser({ ...user, ...updateData });
      
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Vérifier l'ancien mot de passe
      const { data: userData, error: checkError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single();

      if (checkError) throw checkError;

      if (userData.password !== passwordData.currentPassword) {
        setError('Mot de passe actuel incorrect');
        setSaving(false);
        return;
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: passwordData.newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-dark flex items-center">
          <FaUser className="mr-3 h-6 w-6 text-primary" />
          Mon profil
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-error">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 border-l-4 border-success">
          <div className="flex items-center">
            <FaCheckCircle className="h-5 w-5 text-success mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Section Avatar */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-8 border-b border-border">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <UserAvatar 
  user={user} 
  size="lg" 
  showEdit={true}
  onPhotoUpdate={(newPhotoUrl) => {
    updateUser({ ...user, photo_profil: newPhotoUrl })
  }}
/>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-text-dark">{user.username}</h2>
              <p className="text-primary font-medium mt-1">{roleLabel}</p>
              <p className="text-sm text-gray-500 mt-2">Matricule: {user.matricule}</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary p-2.5 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary p-2.5 border"
                  >
                    <option value="">Non spécifié</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary p-2.5 border"
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: user.username,
                      telephone: user.telephone || '',
                      genre: user.genre || '',
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaUser className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Nom complet</p>
                    <p className="text-sm font-medium text-text-dark">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaVenusMars className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Genre</p>
                    <p className="text-sm font-medium text-text-dark">
                      {user.genre === 'M' ? 'Masculin' : user.genre === 'F' ? 'Féminin' : 'Non spécifié'}
                    </p>
                  </div>
                </div>

               

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium text-text-dark">
                      {user.telephone || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Matricule</p>
                    <p className="text-sm font-mono font-medium text-text-dark">{user.matricule}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Inscrit le</p>
                    <p className="text-sm font-medium text-text-dark">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <FaLock className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <FaEdit className="mr-2 h-4 w-4" />
                  Modifier le profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowPasswordModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark flex items-center">
                    <FaLock className="mr-2 h-5 w-5 text-primary" />
                    Changer le mot de passe
                  </h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary p-2.5 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary p-2.5 border"
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 4 caractères</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary p-2.5 border"
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="flex-1 inline-flex justify-center items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Modification...
                      </>
                    ) : (
                      'Modifier'
                    )}
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 inline-flex justify-center items-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}