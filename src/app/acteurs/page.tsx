// app/admin/acteurs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FaUsers, 
  FaUser, 
  FaUserTie, 
  FaUserCheck, 
  FaUserShield,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { Edit, Trash2 } from 'lucide-react';

type User = {
  id: string;
  email: string;
  nom: string;
  telephone?: string;
  role: 'admin' | 'agent' | 'expert' | 'assure';
  first_login: boolean;
  created_at: string;
  updated_at: string;
};

const ROLES = {
  admin: { 
    label: 'Administrateur', 
    icon: FaUserShield, 
    color: 'bg-purple-100 text-purple-800',
    badge: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  agent: { 
    label: 'Agent assurance', 
    icon: FaUserTie, 
    color: 'bg-green-100 text-green-800',
    badge: 'bg-green-50 text-green-700 border-green-200'
  },
  expert: { 
    label: 'Expert', 
    icon: FaUserCheck, 
    color: 'bg-blue-100 text-blue-800',
    badge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  assure: { 
    label: 'Assuré', 
    icon: FaUser, 
    color: 'bg-orange-100 text-orange-800',
    badge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
};

export default function ActeursPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreRole, setFiltreRole] = useState<string>('tous');
  const [filtreFirstLogin, setFiltreFirstLogin] = useState<string>('tous');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    telephone: '',
    mot_de_passe: '',
    role: 'assure' as User['role'],
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    agent: 0,
    expert: 0,
    assure: 0,
    firstLogin: 0,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      chargerUtilisateurs();
    }
  }, [user]);

  useEffect(() => {
    filtrerUtilisateurs();
  }, [users, searchTerm, filtreRole, filtreFirstLogin]);

  const chargerUtilisateurs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      calculerStats(data || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const calculerStats = (usersData: User[]) => {
    setStats({
      total: usersData.length,
      admin: usersData.filter(u => u.role === 'admin').length,
      agent: usersData.filter(u => u.role === 'agent').length,
      expert: usersData.filter(u => u.role === 'expert').length,
      assure: usersData.filter(u => u.role === 'assure').length,
      firstLogin: usersData.filter(u => u.first_login).length,
    });
  };

  const filtrerUtilisateurs = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.email?.toLowerCase().includes(term) ||
        u.nom?.toLowerCase().includes(term) ||
        u.telephone?.includes(term)
      );
    }

    if (filtreRole !== 'tous') {
      filtered = filtered.filter(u => u.role === filtreRole);
    }

    if (filtreFirstLogin === 'oui') {
      filtered = filtered.filter(u => u.first_login);
    } else if (filtreFirstLogin === 'non') {
      filtered = filtered.filter(u => !u.first_login);
    }

    setFilteredUsers(filtered);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      nom: '',
      telephone: '',
      mot_de_passe: '',
      role: 'assure',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nom: user.nom,
      telephone: user.telephone || '',
      mot_de_passe: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.nom || !formData.role) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!editingUser && !formData.mot_de_passe) {
      setError('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        const updateData: any = {
          email: formData.email.toLowerCase().trim(),
          nom: formData.nom,
          telephone: formData.telephone || null,
          role: formData.role,
          updated_at: new Date().toISOString(),
        };

        if (formData.mot_de_passe) {
          updateData.mot_de_passe = formData.mot_de_passe;
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) throw error;
        setSuccess('Utilisateur mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('users')
          .insert([{
            email: formData.email.toLowerCase().trim(),
            nom: formData.nom,
            telephone: formData.telephone || null,
            mot_de_passe: formData.mot_de_passe,
            role: formData.role,
            first_login: true,
          }]);

        if (error) throw error;
        setSuccess('Utilisateur créé avec succès');
      }

      setShowModal(false);
      await chargerUtilisateurs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setDeleteConfirm(null);
      setSuccess('Utilisateur supprimé avec succès');
      await chargerUtilisateurs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <FaUsers className="mr-3 h-6 w-6 text-blue-600" />
            Gestion des utilisateurs
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les utilisateurs du système d'assurance
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Stats rapides */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Object.entries(ROLES).map(([key, role]) => {
          const Icon = role.icon;
          const count = stats[key as keyof typeof stats] || 0;
          return (
            <div key={key} className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-full p-2 ${role.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{role.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-yellow-100">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">1ère connexion</p>
              <p className="text-xl font-semibold text-gray-900">{stats.firstLogin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <FaTimesCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <FaCheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <FaTimes className="h-4 w-4 text-green-500" />
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par email, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={filtreRole}
              onChange={(e) => setFiltreRole(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="agent">Agents assurance</option>
              <option value="expert">Experts</option>
              <option value="assure">Assurés</option>
            </select>
          </div>

          <div>
            <select
              value={filtreFirstLogin}
              onChange={(e) => setFiltreFirstLogin(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="oui">Première connexion</option>
              <option value="non">Déjà connecté</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
          </span>
          {(searchTerm || filtreRole !== 'tous' || filtreFirstLogin !== 'tous') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFiltreRole('tous');
                setFiltreFirstLogin('tous');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaTimes className="mr-1 h-3 w-3" />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun utilisateur trouvé</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filtreRole !== 'tous' ? 'Essayez de modifier vos filtres' : 'Ajoutez un nouvel acteur'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((utilisateur) => {
                  const RoleIcon = ROLES[utilisateur.role]?.icon || FaUser;
                  return (
                    <tr key={utilisateur.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            utilisateur.role === 'admin' ? 'bg-purple-100' :
                            utilisateur.role === 'agent' ? 'bg-green-100' :
                            utilisateur.role === 'expert' ? 'bg-blue-100' :
                            'bg-orange-100'
                          }`}>
                            <RoleIcon className={`h-5 w-5 ${
                              utilisateur.role === 'admin' ? 'text-purple-600' :
                              utilisateur.role === 'agent' ? 'text-green-600' :
                              utilisateur.role === 'expert' ? 'text-blue-600' :
                              'text-orange-600'
                            }`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {utilisateur.nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {utilisateur.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {utilisateur.telephone || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          ROLES[utilisateur.role]?.badge
                        }`}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {ROLES[utilisateur.role]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {utilisateur.first_login ? (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            1ère connexion
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
                          {formatDate(utilisateur.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(utilisateur)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {utilisateur.role !== 'admin' && (
                            <button
                              onClick={() => setDeleteConfirm(utilisateur.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
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
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    {editingUser ? (
                      <>
                        <FaEdit className="mr-2 h-5 w-5 text-blue-600" />
                        Modifier l'utilisateur
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-2 h-5 w-5 text-green-600" />
                        Ajouter un utilisateur
                      </>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder="exemple@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe {!editingUser && '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.mot_de_passe}
                      onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      placeholder={editingUser ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                      required={!editingUser}
                    />
                    {editingUser && (
                      <p className="mt-1 text-xs text-gray-500">
                        Laissez vide pour conserver le mot de passe actuel
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      required
                    >
                      <option value="admin">Administrateur</option>
                      <option value="agent">Agent assurance</option>
                      <option value="expert">Expert</option>
                      <option value="assure">Assuré</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Enregistrement...' : editingUser ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
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

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setDeleteConfirm(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirmer la suppression
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto"
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  Supprimer
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}