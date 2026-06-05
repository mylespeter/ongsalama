// hooks/useRouteProtection.ts
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type UseRouteProtectionProps = {
  requiredRoles?: string[]
  redirectTo?: string
  showLoading?: boolean
}

export function useRouteProtection({
  requiredRoles,
  redirectTo = '/login',
  showLoading = true
}: UseRouteProtectionProps = {}) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [protectionState, setProtectionState] = useState<'loading' | 'redirecting' | 'authorized'>('loading')

  useEffect(() => {
    if (loading) return

    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
      setProtectionState('redirecting')
      sessionStorage.setItem('redirectAfterLogin', pathname)
      router.push(redirectTo)
      return
    }

    // Vérifier les rôles
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      setProtectionState('redirecting')
      router.push('/login')
      return
    }

    // Accès autorisé
    setProtectionState('authorized')
    setIsAuthorized(true)
  }, [isAuthenticated, user, loading, requiredRoles, pathname, router, redirectTo])

  return {
    isLoading: loading && showLoading,
    protectionState,
    isAuthorized,
    user
  }
}