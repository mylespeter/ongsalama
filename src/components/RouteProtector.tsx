// // components/RouteProtector.tsx
// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { useAuth } from '@/context/AuthContext'
// import { ShieldAlert, Loader, ArrowLeft, Home } from 'lucide-react'

// type UserRole = 'admin' | 'pharmacie' | 'fabricant' | 'distributeur'

// type RouteProtectorProps = {
//   children: React.ReactNode
//   roles?: UserRole[]
//   redirectIfNotAuth?: string
//   redirectIfNotAllowed?: string
//   showUnauthorized?: boolean
// }

// export default function RouteProtector({ 
//   children, 
//   roles,
//   redirectIfNotAuth = '/login',
//   redirectIfNotAllowed = '/login',
//   showUnauthorized = false
// }: RouteProtectorProps) {
//   const { user, isAuthenticated, loading } = useAuth()
//   const router = useRouter()
//   const pathname = usePathname()
//   const [state, setState] = useState<'loading' | 'unauthenticated' | 'unauthorized' | 'authorized'>('loading')

//   // Fonction pour obtenir la route du dashboard selon le rôle
//   const getDashboardRoute = (role: UserRole) => {
//     const dashboardRoutes: Record<UserRole, string> = {
//       'admin': '/dashboard/admin',
//       'pharmacie': '/dashboard/pharmacie',
//       'fabricant': '/dashboard/fabricant',
//       'distributeur': '/dashboard/distributeur'
//     }
//     return dashboardRoutes[role] || '/login'
//   }

//   // Fonction pour obtenir le libellé du rôle
//   const getRoleLabel = (role: UserRole) => {
//     const roleLabels: Record<UserRole, string> = {
//       'admin': 'Administrateur',
//       'pharmacie': 'Pharmacie',
//       'fabricant': 'Fabricant',
//       'distributeur': 'Distributeur'
//     }
//     return roleLabels[role] || role
//   }

//   useEffect(() => {
//     if (loading) return

//     // Étape 1 : Vérifier l'authentification
//     if (!isAuthenticated || !user) {
//       setState('unauthenticated')
      
//       // Sauvegarder la page demandée
//       if (pathname !== '/login') {
//         sessionStorage.setItem('redirectAfterLogin', pathname)
//       }
      
//       // Délai pour éviter les redirections flash
//       const timer = setTimeout(() => {
//         router.push(redirectIfNotAuth)
//       }, 100)
      
//       return () => clearTimeout(timer)
//     }

//     // Étape 2 : Vérifier les rôles
//     if (roles && roles.length > 0 && !roles.includes(user.role)) {
//       setState('unauthorized')
      
//       // Si showUnauthorized est false, on redirige
//       if (!showUnauthorized) {
//         const timer = setTimeout(() => {
//           router.push(redirectIfNotAllowed)
//         }, 100)
        
//         return () => clearTimeout(timer)
//       }
      
//       return
//     }

//     // Accès autorisé
//     setState('authorized')
//   }, [isAuthenticated, user, loading, roles, pathname, router, redirectIfNotAuth, redirectIfNotAllowed, showUnauthorized])

//   // Loading
//   if (state === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="flex flex-col items-center gap-4">
//           <div className="relative">
//             <div className="w-10 h-10 border-2 border-gray-200 rounded-full"></div>
//             <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-black animate-spin" />
//           </div>
//           <p className="text-sm text-gray-500 font-light">Vérification de l'accès...</p>
//         </div>
//       </div>
//     )
//   }

//   // Non authentifié → redirection vers login (ne s'affiche pas)
//   if (state === 'unauthenticated') {
//     return null
//   }

//   // Non autorisé → Afficher la page d'erreur
//   if (state === 'unauthorized') {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           {/* Carte d'erreur */}
//           <div className="bg-white border border-red-200 rounded-lg overflow-hidden shadow-sm">
//             {/* Header avec icône */}
//             <div className="bg-red-50 border-b border-red-100 px-6 py-8 text-center">
//               <div className="flex justify-center mb-4">
//                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
//                   <ShieldAlert className="w-8 h-8 text-red-600" />
//                 </div>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-1">
//                 Accès refusé
//               </h2>
//               <p className="text-sm text-gray-600">
//                 Vous n'avez pas les permissions nécessaires
//               </p>
//             </div>

//             {/* Corps */}
//             <div className="px-6 py-6 space-y-5">
//               {/* Détails */}
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-500">Votre rôle</span>
//                   <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-xs capitalize">
//                     {getRoleLabel(user?.role as UserRole)}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-500">Rôle(s) requis</span>
//                   <div className="flex gap-1">
//                     {roles?.map(role => (
//                       <span 
//                         key={role}
//                         className="font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs capitalize"
//                       >
//                         {getRoleLabel(role)}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-500">Utilisateur</span>
//                   <span className="font-medium text-gray-900 text-xs">
//                     {user?.username}
//                   </span>
//                 </div>
//               </div>

//               {/* Message */}
//               <div className="bg-red-50 border border-red-100 rounded-lg p-4">
//                 <p className="text-xs text-red-800">
//                   Cette page est réservée aux utilisateurs ayant les rôles spécifiés.
//                   Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
//                 </p>
//               </div>

//               {/* Boutons d'action */}
//               <div className="space-y-2 pt-2">
//                 <button
//                   onClick={() => router.push(getDashboardRoute(user?.role as UserRole))}
//                   className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
//                 >
//                   <Home className="w-4 h-4" />
//                   RETOURNER AU DASHBOARD
//                 </button>
                
//                 <button
//                   onClick={() => router.push('/login')}
//                   className="w-full flex items-center justify-center gap-2 text-gray-600 py-2.5 px-4 text-sm hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   Retour à la connexion
//                 </button>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center">
//               <p className="text-xs text-gray-400">
//                 Code erreur: 403 - Forbidden
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Autorisé - Afficher le contenu
//   return <>{children}</>
// }

// components/RouteProtector.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ShieldAlert, Loader, ArrowLeft, Home } from 'lucide-react'

type UserRole = 'admin' | 'pharmacie' | 'fabricant' | 'distributeur'

type RouteProtectorProps = {
  children: React.ReactNode
  roles?: UserRole[]
  redirectIfNotAuth?: string
  redirectIfNotAllowed?: string
  showUnauthorized?: boolean
}

export default function RouteProtector({ 
  children, 
  roles,
  redirectIfNotAuth = '/login',
  redirectIfNotAllowed = '/login',
  showUnauthorized = false
}: RouteProtectorProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<'loading' | 'unauthenticated' | 'unauthorized' | 'authorized'>('loading')
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Fonction pour obtenir la route du dashboard selon le rôle
  const getDashboardRoute = (role: UserRole) => {
    const dashboardRoutes: Record<UserRole, string> = {
      'admin': '/dashboard',
      'pharmacie': '/dashboard',
      'fabricant': '/dashboard',
      'distributeur': '/dashboard'
    }
    return dashboardRoutes[role] || '/login'
  }

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      'admin': 'Administrateur',
      'pharmacie': 'Pharmacie',
      'fabricant': 'Fabricant',
      'distributeur': 'Distributeur'
    }
    return roleLabels[role] || role
  }

  useEffect(() => {
    if (loading) return

    // Étape 1 : Vérifier l'authentification
    if (!isAuthenticated || !user) {
      setState('unauthenticated')
      
      // Sauvegarder la page demandée
      if (pathname !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', pathname)
      }
      
      // Redirection immédiate
      setIsRedirecting(true)
      router.push(redirectIfNotAuth)
      return
    }

    // Étape 2 : Vérifier les rôles
    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      setState('unauthorized')
      
      // Si showUnauthorized est false, on redirige immédiatement
      if (!showUnauthorized) {
        setIsRedirecting(true)
        router.push(redirectIfNotAllowed)
      }
      
      return
    }

    // Accès autorisé
    setState('authorized')
  }, [isAuthenticated, user, loading, roles, pathname, router, redirectIfNotAuth, redirectIfNotAllowed, showUnauthorized])

  // Loading state - affiché pendant la vérification initiale
  if (loading || state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
        
          <p className="text-sm text-gray-500 font-light">Vérification de l'accès...</p>
        </div>
      </div>
    )
  }

  // Redirection en cours - afficher un loader pour éviter le flash
  if (isRedirecting || state === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-black animate-spin" />
          </div>
          <p className="text-sm text-gray-500 font-light">Redirection...</p>
        </div>
      </div>
    )
  }

  // Non autorisé → Afficher la page d'erreur
  if (state === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Carte d'erreur */}
          <div className="bg-white border border-red-200 rounded-lg overflow-hidden shadow-sm">
            {/* Header avec icône */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Accès refusé
              </h2>
              <p className="text-sm text-gray-600">
                Vous n'avez pas les permissions nécessaires
              </p>
            </div>

            {/* Corps */}
            <div className="px-6 py-6 space-y-5">
              {/* Détails */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Votre rôle</span>
                  <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-xs capitalize">
                    {getRoleLabel(user?.role as UserRole)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rôle(s) requis</span>
                  <div className="flex gap-1">
                    {roles?.map(role => (
                      <span 
                        key={role}
                        className="font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs capitalize"
                      >
                        {getRoleLabel(role)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Utilisateur</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {user?.username}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-xs text-red-800">
                  Cette page est réservée aux utilisateurs ayant les rôles spécifiés.
                  Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => router.push(getDashboardRoute(user?.role as UserRole))}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  RETOURNER AU DASHBOARD
                </button>
                
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 py-2.5 px-4 text-sm hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center">
              <p className="text-xs text-gray-400">
                Code erreur: 403 - Forbidden
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Autorisé - Afficher le contenu
  return <>{children}</>
}