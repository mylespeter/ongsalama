
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasswordError('');
    setPasswordSuccess('');

    try {
      // 1. Chercher l'utilisateur par matricule
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('matricule', matricule.toUpperCase())
        .single();

      if (userError || !user) {
        throw new Error('Matricule ou mot de passe incorrect');
      }

      // 2. Vérifier si le mot de passe correspond
      if (user.password !== password) {
        throw new Error('Matricule ou mot de passe incorrect');
      }

      console.log('User found:', {
        matricule: user.matricule,
        first_login: user.first_login,
        passwordMatch: user.password === password
      });

      // 3. Vérifier si c'est la première connexion
      if (user.first_login === true) {
        // Première connexion - forcer le changement de mot de passe
        setUserToUpdate(user);
        setShowPasswordChange(true);
        setPasswordSuccess('Première connexion. Vous devez changer votre mot de passe.');
        setLoading(false);
        return;
      }

      // 4. Connexion normale
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirection selon le rôle
      if (user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/student');
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Matricule ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation du nouveau mot de passe
    if (newPassword.length < 4) {
      setPasswordError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (newPassword === password) {
      setPasswordError('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setLoading(true);

    try {
      // Mettre à jour le mot de passe et first_login dans la base de données
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          first_login: false, // Passer à false après changement
          updated_at: new Date().toISOString()
        })
        .eq('id', userToUpdate.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error details:', updateError);
        
        // Vérifier le type d'erreur
        if (updateError.code === '23505') {
          setPasswordError('Ce mot de passe est déjà utilisé. Veuillez en choisir un autre.');
        } else if (updateError.code === '42501') {
          setPasswordError('Permission refusée. Vérifiez vos droits de modification.');
        } else {
          setPasswordError(`Erreur lors de la mise à jour: ${updateError.message || 'Erreur inconnue'}`);
        }
        
        setLoading(false);
        return;
      }

      // Récupérer l'utilisateur mis à jour
      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userToUpdate.id)
        .single();

      if (fetchError || !updatedUser) {
        throw new Error('Erreur lors de la récupération des données utilisateur');
      }

      console.log('User updated successfully:', {
        id: updatedUser.id,
        first_login: updatedUser.first_login,
        password_changed: updatedUser.password !== userToUpdate.password
      });

      // Stocker l'utilisateur mis à jour
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setPasswordSuccess('Mot de passe mis à jour avec succès ! Redirection en cours...');
      
      // Redirection après un délai
      setTimeout(() => {
        if (updatedUser.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/student');
        }
      }, 1500);

    } catch (err: any) {
      console.error('Password change error:', err);
      setPasswordError(err.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (m: string, p: string) => {
    setMatricule(m);
    setPassword(p);
    setShowPasswordChange(false);
    setPasswordError('');
    setPasswordSuccess('');
  };

  const backToLogin = () => {
    setShowPasswordChange(false);
    setUserToUpdate(null);
    setNewPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setPassword('');
    setMatricule('');
  };

  // Fonction pour réinitialiser first_login (pour tests)
  const resetFirstLogin = async (matricule: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ first_login: true })
        .eq('matricule', matricule);
      
      if (error) {
        console.error('Reset error:', error);
        alert('Erreur lors de la réinitialisation');
      } else {
        alert(`First_login réinitialisé pour ${matricule}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <div>
                        <div className='text-red-500 text-center flex items-center cypher text-700 '>
                         System indisponible pour le moment
                        </div>
                      </div>
        </div>
        <div className="cypher mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded shadow">
  <h2 className="text-lg font-semibold text-yellow-700 mb-2">📌 Informations sur la moyenne</h2>
  <p className="text-gray-800 leading-relaxed">
    La moyenne vous sera envoyée par la coordination. 
    <br />
    <span className="font-bold">Moyenne finale :</span> sur 10 
    <br />
    <span className="font-bold">Totalité des cotes de TD :</span> sur 3 
    <br />
    <span className="font-bold">Exposé :</span> sur 3 
    <br />
    <span className="font-bold">Interrogation :</span> sur 4 
    <br />
    <span className="text-red-600 font-semibold"></span>
  </p>
</div>

        <div className="bg-white border rounded-lg p-6">
          {!showPasswordChange ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="relative">
                    <div className="text-xs text-gray-600 mb-1">Matricule</div>
                    <input
                      type="text"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                      placeholder="ADM001, ETU001"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="text-xs text-gray-600 mb-1">Mot de passe</div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                <p className=' text-sm text-center cypher  text-gray-500'> 
  Powered By Peternz/co LoginSystem V01
</p>
              </form>

             

            
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="font-medium mb-1">Changement de mot de passe requis</div>
                <div className="text-sm text-gray-600">
                  C'est votre première connexion. Pour des raisons de sécurité, veuillez choisir un nouveau mot de passe.
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded mb-4">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{userToUpdate?.username || userToUpdate?.matricule}</div>
                  <div className="text-gray-600">{userToUpdate?.matricule}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Rôle: {userToUpdate?.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">Nouveau mot de passe</div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-black"
                    placeholder="Minimum 4 caractères"
                    required
                    autoFocus
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Votre ancien mot de passe était <span className="font-mono">{password}</span>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={backToLogin}
                    disabled={loading}
                    className="flex-1 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mise à jour...
                      </span>
                    ) : 'Changer le mot de passe'}
                  </button>
                </div>

              </form>
            
            </>
          )}
        </div>

      
      </div>
    </div>
  );
}