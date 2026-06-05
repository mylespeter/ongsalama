// app/change-password/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lock, KeyRound, ArrowRight, Shield } from 'lucide-react'
import { Loader } from '@/components/ui/Loader'

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, updateUser } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      // Mettre à jour le mot de passe et désactiver first_login
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          first_login: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (updateError) throw updateError

      // Mettre à jour l'utilisateur dans le contexte
      if (user) {
        updateUser({ ...user, first_login: false })
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-2xl font-bold text-text-dark">Première connexion</h2>
            <p className="mt-2 text-sm text-gray-500">
              Veuillez définir votre nouveau mot de passe
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-error p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">Enregistrement...</span>
                </>
              ) : (
                <>
                  Enregistrer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}