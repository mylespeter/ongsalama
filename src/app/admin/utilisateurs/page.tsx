
// // app/admin/utilisateurs/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { supabase } from '@/lib/supabase';
// import { 
//   FaUsers, 
//   FaUser, 
//   FaUserMd, 
//   FaFlask, 
//   FaPills, 
//   FaUserShield,
//   FaEdit,
//   FaTrash,
//   FaPlus,
//   FaSearch,
//   FaTimes,
//   FaExclamationTriangle,
//   FaCalendarAlt,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaHospitalUser,
//   FaVenusMars,
//   FaIdCard,
//   FaPhone
// } from 'react-icons/fa';
// import { Edit, Trash2, Camera } from 'lucide-react';

// // Type User pour ONG Salama
// type User = {
//   id: string;
//   matricule: string;
//   username: string;
//   telephone: string | null;
//   photo_profil: string | null;
//   role: 'accueil' | 'consultation' | 'laboratoire' | 'pharmacie' | 'administration';
//   genre: 'M' | 'F' | null;
//   first_login: boolean;
//   created_at: string;
//   updated_at: string;
// };

// // Configuration des rôles pour ONG Salama
// const ROLES = {
//   accueil: { 
//     label: 'Agent d\'accueil', 
//     icon: FaHospitalUser, 
//     color: 'bg-teal-100 text-teal-800',
//     badge: 'bg-teal-50 text-teal-700 border-teal-200',
//     bgColor: 'bg-teal-600'
//   },
//   consultation: { 
//     label: 'Médecin consultant', 
//     icon: FaUserMd, 
//     color: 'bg-blue-100 text-blue-800',
//     badge: 'bg-blue-50 text-blue-700 border-blue-200',
//     bgColor: 'bg-blue-600'
//   },
//   laboratoire: { 
//     label: 'Laborantin', 
//     icon: FaFlask, 
//     color: 'bg-purple-100 text-purple-800',
//     badge: 'bg-purple-50 text-purple-700 border-purple-200',
//     bgColor: 'bg-purple-600'
//   },
//   pharmacie: { 
//     label: 'Pharmacien', 
//     icon: FaPills, 
//     color: 'bg-green-100 text-green-800',
//     badge: 'bg-green-50 text-green-700 border-green-200',
//     bgColor: 'bg-green-600'
//   },
//   administration: { 
//     label: 'Administrateur', 
//     icon: FaUserShield, 
//     color: 'bg-primary/10 text-primary',
//     badge: 'bg-primary/5 text-primary border-primary/20',
//     bgColor: 'bg-primary'
//   },
// };

// // Composant Avatar réutilisable avec upload
// function UserAvatar({ user, size = 'md', onEdit }: { user: User; size?: 'sm' | 'md' | 'lg'; onEdit?: () => void }) {
//   const sizeClasses = {
//     sm: 'h-8 w-8 text-xs',
//     md: 'h-10 w-10 text-sm',
//     lg: 'h-20 w-20 text-lg'
//   };

//   const getInitials = (username: string) => {
//     return username
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .substring(0, 2);
//   };

//   const getBgColor = (role: string) => {
//     const colors: Record<string, string> = {
//       accueil: 'bg-teal-600',
//       consultation: 'bg-blue-600',
//       laboratoire: 'bg-purple-600',
//       pharmacie: 'bg-green-600',
//       administration: 'bg-primary'
//     };
//     return colors[role] || 'bg-gray-600';
//   };

//   return (
//     <div className="relative group">
//       <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm`}>
//         {user.photo_profil ? (
//           <img 
//             src={user.photo_profil} 
//             alt={user.username}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className={`w-full h-full ${getBgColor(user.role)} flex items-center justify-center`}>
//             <span className="text-white font-medium">
//               {getInitials(user.username)}
//             </span>
//           </div>
//         )}
//       </div>
//       {onEdit && (
//         <button
//           onClick={onEdit}
//           className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 shadow-md hover:bg-primary/80 transition-colors"
//         >
//           <Camera className="h-3 w-3 text-white" />
//         </button>
//       )}
//     </div>
//   );
// }

// export default function ActeursPage() {
//   const { user } = useAuth();
//   const [users, setUsers] = useState<User[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
  
//   // Filtres
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filtreRole, setFiltreRole] = useState<string>('tous');
//   const [filtreFirstLogin, setFiltreFirstLogin] = useState<string>('tous');

//   // Modal
//   const [showModal, setShowModal] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
//   const [formData, setFormData] = useState({
//     matricule: '',
//     username: '',
//     telephone: '',
//     password: '',
//     role: 'accueil' as User['role'],
//     genre: '' as 'M' | 'F' | '',
//   });
  
//   const [saving, setSaving] = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     accueil: 0,
//     consultation: 0,
//     laboratoire: 0,
//     pharmacie: 0,
//     administration: 0,
//     firstLogin: 0,
//   });

//   useEffect(() => {
//     if (user?.role === 'administration') {
//       chargerUtilisateurs();
//     }
//   }, [user]);

//   useEffect(() => {
//     filtrerUtilisateurs();
//   }, [users, searchTerm, filtreRole, filtreFirstLogin]);

//   const chargerUtilisateurs = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('users')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       setUsers(data || []);
//       calculerStats(data || []);
//     } catch (err) {
//       console.error('Erreur chargement:', err);
//       setError('Erreur lors du chargement des utilisateurs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculerStats = (usersData: User[]) => {
//     setStats({
//       total: usersData.length,
//       accueil: usersData.filter(u => u.role === 'accueil').length,
//       consultation: usersData.filter(u => u.role === 'consultation').length,
//       laboratoire: usersData.filter(u => u.role === 'laboratoire').length,
//       pharmacie: usersData.filter(u => u.role === 'pharmacie').length,
//       administration: usersData.filter(u => u.role === 'administration').length,
//       firstLogin: usersData.filter(u => u.first_login).length,
//     });
//   };

//   const filtrerUtilisateurs = () => {
//     let filtered = [...users];

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(u => 
//         u.matricule?.toLowerCase().includes(term) ||
//         u.username?.toLowerCase().includes(term) ||
//         u.telephone?.includes(term)
//       );
//     }

//     if (filtreRole !== 'tous') {
//       filtered = filtered.filter(u => u.role === filtreRole);
//     }

//     if (filtreFirstLogin === 'oui') {
//       filtered = filtered.filter(u => u.first_login);
//     } else if (filtreFirstLogin === 'non') {
//       filtered = filtered.filter(u => !u.first_login);
//     }

//     setFilteredUsers(filtered);
//   };

//   const handleUploadPhoto = async (file: File, userId: string) => {
//     setUploadingPhoto(true);
//     try {
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${userId}-${Date.now()}.${fileExt}`;
//       const filePath = `avatars/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from('profiles')
//         .upload(filePath, file);

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('profiles')
//         .getPublicUrl(filePath);

//       const { error: updateError } = await supabase
//         .from('users')
//         .update({ photo_profil: publicUrl })
//         .eq('id', userId);

//       if (updateError) throw updateError;

//       await chargerUtilisateurs();
//       setSuccess('Photo de profil mise à jour');
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err) {
//       console.error('Erreur upload:', err);
//       setError('Erreur lors de l\'upload de la photo');
//     } finally {
//       setUploadingPhoto(false);
//     }
//   };

//   const handleViewProfile = (user: User) => {
//     setSelectedUser(user);
//     setShowProfileModal(true);
//   };

//   const handleAdd = () => {
//     setEditingUser(null);
//     setFormData({
//       matricule: '',
//       username: '',
//       telephone: '',
//       password: '',
//       role: 'accueil',
//       genre: '',
//     });
//     setShowModal(true);
//   };

//   const handleEdit = (user: User) => {
//     setEditingUser(user);
//     setFormData({
//       matricule: user.matricule,
//       username: user.username,
//       telephone: user.telephone || '',
//       password: '',
//       role: user.role,
//       genre: user.genre || '',
//     });
//     setShowModal(true);
//   };

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.matricule || !formData.username || !formData.role) {
//       setError('Veuillez remplir tous les champs obligatoires');
//       return;
//     }

//     if (!editingUser && !formData.password) {
//       setError('Le mot de passe est obligatoire pour un nouvel utilisateur');
//       return;
//     }

//     setSaving(true);
//     setError(null);

//     try {
//       if (editingUser) {
//         const updateData: any = {
//           matricule: formData.matricule.toUpperCase().trim(),
//           username: formData.username,
//           telephone: formData.telephone || null,
//           role: formData.role,
//           genre: formData.genre || null,
//           updated_at: new Date().toISOString(),
//         };

//         if (formData.password) {
//           updateData.password = formData.password;
//         }

//         const { error } = await supabase
//           .from('users')
//           .update(updateData)
//           .eq('id', editingUser.id);

//         if (error) throw error;
//         setSuccess('Utilisateur mis à jour avec succès');
//       } else {
//         const { error } = await supabase
//           .from('users')
//           .insert([{
//             matricule: formData.matricule.toUpperCase().trim(),
//             username: formData.username,
//             telephone: formData.telephone || null,
//             password: formData.password,
//             role: formData.role,
//             genre: formData.genre || null,
//             first_login: true,
//           }]);

//         if (error) throw error;
//         setSuccess('Utilisateur créé avec succès');
//       }

//       setShowModal(false);
//       await chargerUtilisateurs();
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err: any) {
//       console.error('Erreur sauvegarde:', err);
//       setError(err.message || 'Erreur lors de la sauvegarde');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (userId: string) => {
//     try {
//       const { error } = await supabase
//         .from('users')
//         .delete()
//         .eq('id', userId);

//       if (error) throw error;

//       setDeleteConfirm(null);
//       setSuccess('Utilisateur supprimé avec succès');
//       await chargerUtilisateurs();
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err: any) {
//       console.error('Erreur suppression:', err);
//       setError(err.message || 'Erreur lors de la suppression');
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('fr-FR', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (user?.role !== 'administration') {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
//           <FaExclamationTriangle className="mx-auto h-12 w-12 text-warning" />
//           <h3 className="mt-2 text-lg font-medium text-text-dark">Accès non autorisé</h3>
//           <p className="mt-1 text-sm text-gray-500">
//             Cette page est réservée aux administrateurs.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* En-tête */}
//       <div className="sm:flex sm:items-center sm:justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-semibold text-text-dark flex items-center">
//             <FaUsers className="mr-3 h-6 w-6 text-primary" />
//             Gestion des utilisateurs
//           </h1>
//           <p className="mt-2 text-sm text-gray-500">
//             Gérez les utilisateurs du système ONG Salama
//           </p>
//         </div>
//         <button
//           onClick={handleAdd}
//           className="mt-4 sm:mt-0 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
//         >
//           <FaPlus className="mr-2 h-4 w-4" />
//           Ajouter un utilisateur
//         </button>
//       </div>

//       {/* Stats rapides */}
//       <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
//         {Object.entries(ROLES).map(([key, role]) => {
//           const Icon = role.icon;
//           const count = stats[key as keyof typeof stats] || 0;
//           return (
//             <div key={key} className="rounded-lg bg-white p-4 shadow-sm border border-border">
//               <div className="flex items-center">
//                 <div className={`flex-shrink-0 rounded-full p-2 ${role.color}`}>
//                   <Icon className="h-5 w-5" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-xs font-medium text-gray-500">{role.label}</p>
//                   <p className="text-xl font-semibold text-text-dark">{count}</p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
        
//         <div className="rounded-lg bg-white p-4 shadow-sm border border-warning/20">
//           <div className="flex items-center">
//             <div className="flex-shrink-0 rounded-full p-2 bg-warning/10">
//               <FaExclamationTriangle className="h-5 w-5 text-warning" />
//             </div>
//             <div className="ml-3">
//               <p className="text-xs font-medium text-gray-500">1ère connexion</p>
//               <p className="text-xl font-semibold text-text-dark">{stats.firstLogin}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-error">
//           <div className="flex">
//             <FaTimesCircle className="h-5 w-5 text-error flex-shrink-0" />
//             <p className="ml-3 text-sm text-red-700">{error}</p>
//             <button onClick={() => setError(null)} className="ml-auto">
//               <FaTimes className="h-4 w-4 text-red-500" />
//             </button>
//           </div>
//         </div>
//       )}

//       {success && (
//         <div className="mb-6 rounded-lg bg-green-50 p-4 border-l-4 border-success">
//           <div className="flex">
//             <FaCheckCircle className="h-5 w-5 text-success flex-shrink-0" />
//             <p className="ml-3 text-sm text-green-700">{success}</p>
//             <button onClick={() => setSuccess(null)} className="ml-auto">
//               <FaTimes className="h-4 w-4 text-green-500" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Filtres */}
//       <div className="mb-6 bg-white rounded-lg shadow-sm border border-border p-4">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
//           <div className="relative">
//             <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Rechercher (matricule, nom, téléphone)..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="block w-full rounded-lg border border-border pl-10 pr-3 py-2 text-sm focus:border-primary focus:ring-primary"
//             />
//           </div>

//           <div>
//             <select
//               value={filtreRole}
//               onChange={(e) => setFiltreRole(e.target.value)}
//               className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
//             >
//               <option value="tous">Tous les rôles</option>
//               <option value="accueil">Agents d'accueil</option>
//               <option value="consultation">Médecins</option>
//               <option value="laboratoire">Laborantins</option>
//               <option value="pharmacie">Pharmaciens</option>
//               <option value="administration">Administrateurs</option>
//             </select>
//           </div>

//           <div>
//             <select
//               value={filtreFirstLogin}
//               onChange={(e) => setFiltreFirstLogin(e.target.value)}
//               className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
//             >
//               <option value="tous">Tous les statuts</option>
//               <option value="oui">Première connexion</option>
//               <option value="non">Déjà connecté</option>
//             </select>
//           </div>

//           <div className="flex items-center justify-end">
//             {(searchTerm || filtreRole !== 'tous' || filtreFirstLogin !== 'tous') && (
//               <button
//                 onClick={() => {
//                   setSearchTerm('');
//                   setFiltreRole('tous');
//                   setFiltreFirstLogin('tous');
//                 }}
//                 className="text-primary hover:text-primary/80 flex items-center text-sm"
//               >
//                 <FaTimes className="mr-1 h-3 w-3" />
//                 Réinitialiser
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="mt-3 text-sm text-gray-500">
//           {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
//         </div>
//       </div>

//       {/* Tableau */}
//       <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
//         {loading ? (
//           <div className="text-center py-12">
//             <FaUsers className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
//             <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
//           </div>
//         ) : filteredUsers.length === 0 ? (
//           <div className="text-center py-12">
//             <FaUsers className="mx-auto h-12 w-12 text-gray-300" />
//             <p className="mt-2 text-gray-500">Aucun utilisateur trouvé</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-border">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Utilisateur
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Matricule
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Téléphone
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Rôle
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Genre
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Statut
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-border">
//                 {filteredUsers.map((utilisateur) => {
//                   const RoleIcon = ROLES[utilisateur.role]?.icon || FaUser;
//                   return (
//                     <tr key={utilisateur.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <button
//                             onClick={() => handleViewProfile(utilisateur)}
//                             className="relative group cursor-pointer"
//                           >
//                             <UserAvatar user={utilisateur} size="md" />
//                           </button>
//                           <div className="ml-4">
//                             <button
//                               onClick={() => handleViewProfile(utilisateur)}
//                               className="text-sm font-medium text-text-dark hover:text-primary transition-colors"
//                             >
//                               {utilisateur.username}
//                             </button>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-900">
//                           <FaIdCard className="mr-2 h-3 w-3 text-gray-400" />
//                           {utilisateur.matricule}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {utilisateur.telephone && (
//                           <div className="flex items-center text-sm text-gray-500">
//                             <FaPhone className="mr-2 h-3 w-3 text-gray-400" />
//                             {utilisateur.telephone}
//                           </div>
//                         )}
//                        </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
//                           ROLES[utilisateur.role]?.badge
//                         }`}>
//                           <RoleIcon className="mr-1 h-3 w-3" />
//                           {ROLES[utilisateur.role]?.label}
//                         </span>
//                        </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {utilisateur.genre && (
//                           <div className="flex items-center text-sm text-gray-500">
//                             <FaVenusMars className="mr-2 h-3 w-3 text-gray-400" />
//                             {utilisateur.genre === 'M' ? 'Masculin' : 'Féminin'}
//                           </div>
//                         )}
//                        </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {utilisateur.first_login ? (
//                           <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
//                             1ère connexion
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
//                             Actif
//                           </span>
//                         )}
//                        </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <div className="flex items-center justify-end space-x-2">
//                           <button
//                             onClick={() => handleViewProfile(utilisateur)}
//                             className="text-gray-600 hover:text-primary p-1 hover:bg-primary/10 rounded transition-colors"
//                             title="Voir le profil"
//                           >
//                             <FaUser className="h-4 w-4" />
//                           </button>
//                           <button
//                             onClick={() => handleEdit(utilisateur)}
//                             className="text-gray-600 hover:text-primary p-1 hover:bg-primary/10 rounded transition-colors"
//                             title="Modifier"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </button>
//                           {utilisateur.role !== 'administration' && (
//                             <button
//                               onClick={() => setDeleteConfirm(utilisateur.id)}
//                               className="text-gray-600 hover:text-error p-1 hover:bg-error/10 rounded transition-colors"
//                               title="Supprimer"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </button>
//                           )}
//                         </div>
//                        </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modal Profil utilisateur */}
//       {showProfileModal && selectedUser && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//             <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowProfileModal(false)} />
            
//             <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
//               <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
//                 <div className="absolute top-4 right-4">
//                   <button
//                     onClick={() => setShowProfileModal(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <FaTimes className="h-5 w-5" />
//                   </button>
//                 </div>

//                 <div className="text-center">
//                   <div className="mx-auto mb-4 relative">
//                     <UserAvatar user={selectedUser} size="lg" />
//                     <label className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-md cursor-pointer hover:bg-primary/80 transition-colors">
//                       <Camera className="h-3 w-3 text-white" />
//                       <input
//                         type="file"
//                         accept="image/*"
//                         className="hidden"
//                         onChange={(e) => {
//                           const file = e.target.files?.[0];
//                           if (file) handleUploadPhoto(file, selectedUser.id);
//                         }}
//                       />
//                     </label>
//                     {uploadingPhoto && (
//                       <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//                       </div>
//                     )}
//                   </div>
                  
//                   <h3 className="text-xl font-semibold text-text-dark">
//                     {selectedUser.username}
//                   </h3>
                  
//                   <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium border ${
//                     ROLES[selectedUser.role]?.badge
//                   }`}>
//                     {(() => {
//                       const RoleIcon = ROLES[selectedUser.role]?.icon || FaUser;
//                       return <RoleIcon className="mr-1 h-4 w-4" />;
//                     })()}
//                     {ROLES[selectedUser.role]?.label}
//                   </span>
//                 </div>

//                 <div className="mt-6 border-t border-border pt-4">
//                   <dl className="space-y-4">
//                     <div className="flex justify-between">
//                       <dt className="text-sm font-medium text-gray-500">Matricule</dt>
//                       <dd className="text-sm text-text-dark font-mono">{selectedUser.matricule}</dd>
//                     </div>
//                     {selectedUser.telephone && (
//                       <div className="flex justify-between">
//                         <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
//                         <dd className="text-sm text-text-dark">{selectedUser.telephone}</dd>
//                       </div>
//                     )}
//                     {selectedUser.genre && (
//                       <div className="flex justify-between">
//                         <dt className="text-sm font-medium text-gray-500">Genre</dt>
//                         <dd className="text-sm text-text-dark">
//                           {selectedUser.genre === 'M' ? 'Masculin' : 'Féminin'}
//                         </dd>
//                       </div>
//                     )}
//                     <div className="flex justify-between">
//                       <dt className="text-sm font-medium text-gray-500">Statut</dt>
//                       <dd className="text-sm">
//                         {selectedUser.first_login ? (
//                           <span className="text-warning font-medium">Première connexion</span>
//                         ) : (
//                           <span className="text-success font-medium">Actif</span>
//                         )}
//                       </dd>
//                     </div>
//                     <div className="flex justify-between">
//                       <dt className="text-sm font-medium text-gray-500">Inscrit le</dt>
//                       <dd className="text-sm text-text-dark">{formatDate(selectedUser.created_at)}</dd>
//                     </div>
//                   </dl>
//                 </div>

//                 <div className="mt-6 flex space-x-3">
//                   <button
//                     onClick={() => {
//                       setShowProfileModal(false);
//                       handleEdit(selectedUser);
//                     }}
//                     className="flex-1 inline-flex justify-center items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
//                   >
//                     <Edit className="mr-2 h-4 w-4" />
//                     Modifier
//                   </button>
//                   <button
//                     onClick={() => setShowProfileModal(false)}
//                     className="flex-1 inline-flex justify-center items-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
//                   >
//                     Fermer
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal Ajout/Modification */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//             <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
//             <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
//               <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-text-dark flex items-center">
//                     {editingUser ? (
//                       <>
//                         <FaEdit className="mr-2 h-5 w-5 text-primary" />
//                         Modifier l'utilisateur
//                       </>
//                     ) : (
//                       <>
//                         <FaPlus className="mr-2 h-5 w-5 text-success" />
//                         Ajouter un utilisateur
//                       </>
//                     )}
//                   </h3>
//                   <button
//                     onClick={() => setShowModal(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <FaTimes className="h-5 w-5" />
//                   </button>
//                 </div>

//                 {error && (
//                   <div className="mb-4 rounded-lg bg-red-50 p-3">
//                     <p className="text-sm text-red-700">{error}</p>
//                   </div>
//                 )}

//                 <form onSubmit={handleSave} className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Matricule *
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.matricule}
//                         onChange={(e) => setFormData({ ...formData, matricule: e.target.value.toUpperCase() })}
//                         className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
//                         placeholder="SALAMA001"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Genre
//                       </label>
//                       <select
//                         value={formData.genre}
//                         onChange={(e) => setFormData({ ...formData, genre: e.target.value as 'M' | 'F' | '' })}
//                         className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
//                       >
//                         <option value="">Non spécifié</option>
//                         <option value="M">Masculin</option>
//                         <option value="F">Féminin</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Nom complet *
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.username}
//                       onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                       className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
//                       placeholder="Jean Dupont"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Téléphone
//                     </label>
//                     <input
//                       type="tel"
//                       value={formData.telephone}
//                       onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
//                       className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
//                       placeholder="+243 XXX XXX XXX"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Mot de passe {!editingUser && '*'}
//                     </label>
//                     <input
//                       type="password"
//                       value={formData.password}
//                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                       className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
//                       placeholder={editingUser ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
//                       required={!editingUser}
//                     />
//                     {editingUser && (
//                       <p className="mt-1 text-xs text-gray-500">
//                         Laissez vide pour conserver le mot de passe actuel
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Rôle *
//                     </label>
//                     <select
//                       value={formData.role}
//                       onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
//                       className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
//                       required
//                     >
//                       <option value="accueil">Agent d'accueil</option>
//                       <option value="consultation">Médecin consultant</option>
//                       <option value="laboratoire">Laborantin</option>
//                       <option value="pharmacie">Pharmacien</option>
//                       <option value="administration">Administrateur</option>
//                     </select>
//                   </div>

//                   <div className="flex space-x-3 pt-4">
//                     <button
//                       type="submit"
//                       disabled={saving}
//                       className="flex-1 inline-flex justify-center items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
//                     >
//                       {saving ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                           Enregistrement...
//                         </>
//                       ) : editingUser ? 'Mettre à jour' : 'Ajouter'}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setShowModal(false)}
//                       className="flex-1 inline-flex justify-center items-center rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
//                     >
//                       Annuler
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal confirmation suppression */}
//       {deleteConfirm && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//             <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setDeleteConfirm(null)} />
            
//             <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
//               <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//                     <FaExclamationTriangle className="h-6 w-6 text-error" />
//                   </div>
//                   <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
//                     <h3 className="text-lg font-semibold text-text-dark">
//                       Confirmer la suppression
//                     </h3>
//                     <p className="mt-2 text-sm text-gray-500">
//                       Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
//                 <button
//                   onClick={() => handleDelete(deleteConfirm)}
//                   className="inline-flex w-full justify-center rounded-lg bg-error px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-error/90 sm:ml-3 sm:w-auto"
//                 >
//                   <FaTrash className="mr-2 h-4 w-4" />
//                   Supprimer
//                 </button>
//                 <button
//                   onClick={() => setDeleteConfirm(null)}
//                   className="mt-3 inline-flex w-full justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto"
//                 >
//                   Annuler
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// app/admin/utilisateurs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FaUsers, 
  FaUser, 
  FaUserMd, 
  FaFlask, 
  FaPills, 
  FaUserShield,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHospitalUser,
  FaVenusMars,
  FaIdCard,
  FaPhone,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { Edit, Trash2, Camera } from 'lucide-react';

// Type User pour ONG Salama
type User = {
  id: string;
  matricule: string;
  username: string;
  telephone: string | null;
  photo_profil: string | null;
  role: 'accueil' | 'consultation' | 'laboratoire' | 'pharmacie' | 'administration';
  genre: 'M' | 'F' | null;
  first_login: boolean;
  created_at: string;
  updated_at: string;
};

// Configuration des rôles pour ONG Salama
const ROLES = {
  accueil: { 
    label: 'Agent d\'accueil', 
    icon: FaHospitalUser, 
    color: 'bg-teal-10 text-teal-800',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    bgColor: 'bg-teal-600'
  },
  consultation: { 
    label: 'Médecin consultant', 
    icon: FaUserMd, 
    color: 'bg- text-blue-800',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    bgColor: 'bg-blue-600'
  },
  laboratoire: { 
    label: 'Laborantin', 
    icon: FaFlask, 
    color: 'bg-pu text-purple-800',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    bgColor: 'bg-purple-600'
  },
  pharmacie: { 
    label: 'Pharmacien', 
    icon: FaPills, 
    color: 'bg-g text-green-800',
    badge: 'bg-green-50 text-green-700 border-green-200',
    bgColor: 'bg-green-600'
  },
  administration: { 
    label: 'Administrateur', 
    icon: FaUserShield, 
    color: 'bg-prim0 text-primary',
    badge: 'bg-primary/5 text-primary border-primary/20',
    bgColor: 'bg-primary'
  },
};

// Nombre d'éléments par page
const ITEMS_PER_PAGE = 5;

// Composant Avatar réutilisable avec upload
function UserAvatar({ user, size = 'md', onEdit }: { user: User; size?: 'sm' | 'md' | 'lg'; onEdit?: () => void }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-20 w-20 text-lg'
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getBgColor = (role: string) => {
    const colors: Record<string, string> = {
      accueil: 'bg-teal-600',
      consultation: 'bg-blue-600',
      laboratoire: 'bg-purple-600',
      pharmacie: 'bg-green-600',
      administration: 'bg-primary'
    };
    return colors[role] || 'bg-gray-600';
  };

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm`}>
        {user.photo_profil ? (
          <img 
            src={user.photo_profil} 
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${getBgColor(user.role)} flex items-center justify-center`}>
            <span className="text-white font-medium">
              {getInitials(user.username)}
            </span>
          </div>
        )}
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 shadow-md hover:bg-primary/80 transition-colors"
        >
          <Camera className="h-3 w-3 text-white" />
        </button>
      )}
    </div>
  );
}

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    matricule: '',
    username: '',
    telephone: '',
    password: '',
    role: 'accueil' as User['role'],
    genre: '' as 'M' | 'F' | '',
  });
  
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    accueil: 0,
    consultation: 0,
    laboratoire: 0,
    pharmacie: 0,
    administration: 0,
    firstLogin: 0,
  });

  useEffect(() => {
    if (user?.role === 'administration') {
      chargerUtilisateurs();
    }
  }, [user]);

  useEffect(() => {
    filtrerUtilisateurs();
  }, [users, searchTerm, filtreRole, filtreFirstLogin]);

  useEffect(() => {
    // Réinitialiser la page à 1 quand les filtres changent
    setCurrentPage(1);
    paginerUtilisateurs(1);
  }, [filteredUsers]);

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
      accueil: usersData.filter(u => u.role === 'accueil').length,
      consultation: usersData.filter(u => u.role === 'consultation').length,
      laboratoire: usersData.filter(u => u.role === 'laboratoire').length,
      pharmacie: usersData.filter(u => u.role === 'pharmacie').length,
      administration: usersData.filter(u => u.role === 'administration').length,
      firstLogin: usersData.filter(u => u.first_login).length,
    });
  };

  const filtrerUtilisateurs = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.matricule?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
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

  const paginerUtilisateurs = (page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    paginerUtilisateurs(page);
  };

  // Générer les numéros de page à afficher
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

  const handleUploadPhoto = async (file: File, userId: string) => {
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_profil: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      await chargerUtilisateurs();
      setSuccess('Photo de profil mise à jour');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur upload:', err);
      setError('Erreur lors de l\'upload de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      matricule: '',
      username: '',
      telephone: '',
      password: '',
      role: 'accueil',
      genre: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      matricule: user.matricule,
      username: user.username,
      telephone: user.telephone || '',
      password: '',
      role: user.role,
      genre: user.genre || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matricule || !formData.username || !formData.role) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        const updateData: any = {
          matricule: formData.matricule.toUpperCase().trim(),
          username: formData.username,
          telephone: formData.telephone || null,
          role: formData.role,
          genre: formData.genre || null,
          updated_at: new Date().toISOString(),
        };

        if (formData.password) {
          updateData.password = formData.password;
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
            matricule: formData.matricule.toUpperCase().trim(),
            username: formData.username,
            telephone: formData.telephone || null,
            password: formData.password,
            role: formData.role,
            genre: formData.genre || null,
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

  if (user?.role !== 'administration') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-warning" />
          <h3 className="mt-2 text-lg font-medium text-text-dark">Accès non autorisé</h3>
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
          <h1 className="text-2xl font-semibold text-text-dark flex items-center">
            <FaUsers className="mr-3 h-6 w-6 text-primary" />
            Gestion des utilisateurs
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Gérez les utilisateurs du système ONG Salama
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Stats rapides */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(ROLES).map(([key, role]) => {
          const Icon = role.icon;
          const count = stats[key as keyof typeof stats] || 0;
          return (
            <div key={key} className="rounded-lg bg-white p-4 shadow-sm border border-border">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-full p-2 ${role.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">{role.label}</p>
                  <p className="text-xl font-semibold text-text-dark">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="rounded-lg bg-white p-4 shadow-sm border border-warning/20">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-warning/10">
              <FaExclamationTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">1ère connexion</p>
              <p className="text-xl font-semibold text-text-dark">{stats.firstLogin}</p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (matricule, nom, téléphone)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-border pl-10 pr-3 py-2 text-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <select
              value={filtreRole}
              onChange={(e) => setFiltreRole(e.target.value)}
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="tous">Tous les rôles</option>
              <option value="accueil">Agents d'accueil</option>
              <option value="consultation">Médecins</option>
              <option value="laboratoire">Laborantins</option>
              <option value="pharmacie">Pharmaciens</option>
              <option value="administration">Administrateurs</option>
            </select>
          </div>

          <div>
            <select
              value={filtreFirstLogin}
              onChange={(e) => setFiltreFirstLogin(e.target.value)}
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="tous">Tous les statuts</option>
              <option value="oui">Première connexion</option>
              <option value="non">Déjà connecté</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            {(searchTerm || filtreRole !== 'tous' || filtreFirstLogin !== 'tous') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltreRole('tous');
                  setFiltreFirstLogin('tous');
                }}
                className="text-primary hover:text-primary/80 flex items-center text-sm"
              >
                <FaTimes className="mr-1 h-3 w-3" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-500">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
          {filteredUsers.length > ITEMS_PER_PAGE && (
            <span className="ml-2">
              - Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
            </span>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {paginatedUsers.map((utilisateur) => {
                    const RoleIcon = ROLES[utilisateur.role]?.icon || FaUser;
                    return (
                      <tr key={utilisateur.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleViewProfile(utilisateur)}
                              className="relative group cursor-pointer"
                            >
                              <UserAvatar user={utilisateur} size="md" />
                            </button>
                            <div className="ml-4">
                              <button
                                onClick={() => handleViewProfile(utilisateur)}
                                className="text-sm font-medium text-text-dark hover:text-primary transition-colors"
                              >
                                {utilisateur.username}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaIdCard className="mr-2 h-3 w-3 text-gray-400" />
                            {utilisateur.matricule}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {utilisateur.telephone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FaPhone className="mr-2 h-3 w-3 text-gray-400" />
                              {utilisateur.telephone}
                            </div>
                          )}
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
                          {utilisateur.genre && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FaVenusMars className="mr-2 h-3 w-3 text-gray-400" />
                              {utilisateur.genre === 'M' ? 'Masculin' : 'Féminin'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {utilisateur.first_login ? (
                            <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                              1ère connexion
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                              Actif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewProfile(utilisateur)}
                              className="text-gray-600 hover:text-primary p-1 hover:bg-primary/10 rounded transition-colors"
                              title="Voir le profil"
                            >
                              <FaUser className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(utilisateur)}
                              className="text-gray-600 hover:text-primary p-1 hover:bg-primary/10 rounded transition-colors"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {utilisateur.role !== 'administration' && (
                              <button
                                onClick={() => setDeleteConfirm(utilisateur.id)}
                                className="text-gray-600 hover:text-error p-1 hover:bg-error/10 rounded transition-colors"
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

            {/* Pagination */}
            {filteredUsers.length > ITEMS_PER_PAGE && (
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
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredUsers.length}</span> utilisateurs
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

      {/* Modal Profil utilisateur */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowProfileModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 relative  w-max">
                    <UserAvatar user={selectedUser} size="lg" />
                    <label className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-md cursor-pointer hover:bg-primary/80 transition-colors">
                      <Camera className="h-3 w-3 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadPhoto(file, selectedUser.id);
                        }}
                      />
                    </label>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-text-dark">
                    {selectedUser.username}
                  </h3>
                  
                  <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    ROLES[selectedUser.role]?.badge
                  }`}>
                    {(() => {
                      const RoleIcon = ROLES[selectedUser.role]?.icon || FaUser;
                      return <RoleIcon className="mr-1 h-4 w-4" />;
                    })()}
                    {ROLES[selectedUser.role]?.label}
                  </span>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Matricule</dt>
                      <dd className="text-sm text-text-dark font-mono">{selectedUser.matricule}</dd>
                    </div>
                    {selectedUser.telephone && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                        <dd className="text-sm text-text-dark">{selectedUser.telephone}</dd>
                      </div>
                    )}
                    {selectedUser.genre && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Genre</dt>
                        <dd className="text-sm text-text-dark">
                          {selectedUser.genre === 'M' ? 'Masculin' : 'Féminin'}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Statut</dt>
                      <dd className="text-sm">
                        {selectedUser.first_login ? (
                          <span className="text-warning font-medium">Première connexion</span>
                        ) : (
                          <span className="text-success font-medium">Actif</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Inscrit le</dt>
                      <dd className="text-sm text-text-dark">{formatDate(selectedUser.created_at)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      handleEdit(selectedUser);
                    }}
                    className="flex-1 inline-flex justify-center items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 inline-flex justify-center items-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark flex items-center">
                    {editingUser ? (
                      <>
                        <FaEdit className="mr-2 h-5 w-5 text-primary" />
                        Modifier l'utilisateur
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-2 h-5 w-5 text-success" />
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
                  <div className="mb-4 rounded-lg bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Matricule *
                      </label>
                      <input
                        type="text"
                        value={formData.matricule}
                        onChange={(e) => setFormData({ ...formData, matricule: e.target.value.toUpperCase() })}
                        className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                        placeholder="SALAMA001"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value as 'M' | 'F' | '' })}
                        className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                      >
                        <option value="">Non spécifié</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
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
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                      placeholder="+243 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe {!editingUser && '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
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
                      className="block w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border"
                      required
                    >
                      <option value="accueil">Agent d'accueil</option>
                      <option value="consultation">Médecin consultant</option>
                      <option value="laboratoire">Laborantin</option>
                      <option value="pharmacie">Pharmacien</option>
                      <option value="administration">Administrateur</option>
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
                      ) : editingUser ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
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

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setDeleteConfirm(null)} />
            
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationTriangle className="h-6 w-6 text-error" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold text-text-dark">
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
                  className="inline-flex w-full justify-center rounded-lg bg-error px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-error/90 sm:ml-3 sm:w-auto"
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  Supprimer
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto"
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