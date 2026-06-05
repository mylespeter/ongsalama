// // app/context/AuthContext.tsx
// 'use client'

// import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'

// type UserRole = 'admin' | 'agent' | 'expert' | 'assure'

// type User = {
//   id: string
//   email: string
//   nom: string
//   telephone?: string
//   role: UserRole
//    photo_profil?: string
//   first_login: boolean
//   created_at?: string
//   updated_at?: string
//   [key: string]: any
// }

// type AuthContextType = {
//   user: User | null
//   isAuthenticated: boolean
//   login: (email: string, password: string) => Promise<{ 
//     success: boolean
//     error?: string
//     requiresPasswordChange?: boolean 
//   }>
//   logout: () => void
//   updateUser: (user: User) => void
//   loading: boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)
// const USER_STORAGE_KEY = 'assurance-user'
// const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null)
//   const router = useRouter()

//   const cleanup = () => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current)
//       timeoutRef.current = null
//     }
//   }

//   const setSessionTimeout = () => {
//     cleanup()
//     timeoutRef.current = setTimeout(() => {
//       console.log('Session expirée, déconnexion...')
//       logout()
//       router.push('/login')
//     }, SESSION_DURATION)
//   }

//   const logout = () => {
//     localStorage.removeItem(USER_STORAGE_KEY)
//     setUser(null)
//     cleanup()
//   }

//   const updateUser = (updatedUser: User) => {
//     setUser(updatedUser)
//     localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
//     setSessionTimeout()
//   }

//   const login = async (email: string, password: string) => {
//     try {
//       // 1. Chercher l'utilisateur par email
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('*')
//         .eq('email', email.toLowerCase().trim())
//         .single()

//       if (userError || !userData) {
//         console.error('User not found:', userError)
//         return { 
//           success: false, 
//           error: 'Email ou mot de passe incorrect' 
//         }
//       }

//       // 2. Vérifier le mot de passe
//       if (userData.mot_de_passe !== password) {
//         console.error('Password mismatch')
//         return { 
//           success: false, 
//           error: 'Email ou mot de passe incorrect' 
//         }
//       }

//       // 3. Vérifier le rôle valide
//       const validRoles: UserRole[] = ['admin', 'agent', 'expert', 'assure']
//       if (!validRoles.includes(userData.role as UserRole)) {
//         console.error('Invalid role:', userData.role)
//         return { 
//           success: false, 
//           error: 'Rôle utilisateur invalide' 
//         }
//       }

//       // 4. Vérifier si première connexion
//       if (userData.first_login === true) {
//         const tempUser = { ...userData } as User
//         setUser(tempUser)
//         localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tempUser))
        
//         console.log('First login detected for:', userData.email)
//         return { 
//           success: true, 
//           requiresPasswordChange: true 
//         }
//       }

//       // 5. Connexion normale réussie
//       const loggedUser = { ...userData } as User
//       setUser(loggedUser)
//       localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser))
//       setSessionTimeout()

//       console.log('Login successful:', {
//         email: loggedUser.email,
//         role: loggedUser.role,
//         nom: loggedUser.nom
//       })

//       return { 
//         success: true, 
//         requiresPasswordChange: false 
//       }

//     } catch (error) {
//       console.error('Login error:', error)
//       return { 
//         success: false, 
//         error: 'Erreur de connexion au serveur' 
//       }
//     }
//   }

//   // Vérifier la session au chargement
//   useEffect(() => {
//     const checkAuth = () => {
//       const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      
//       if (storedUser) {
//         try {
//           const userData = JSON.parse(storedUser) as User
          
//           const validRoles: UserRole[] = ['admin', 'agent', 'expert', 'assure']
//           if (!validRoles.includes(userData.role)) {
//             console.error('Invalid role in stored user:', userData.role)
//             logout()
//             setLoading(false)
//             return
//           }
          
//           setUser(userData)
//           setSessionTimeout()
//           console.log('Session restored for:', userData.email, 'Role:', userData.role)
//         } catch (error) {
//           console.error('Error parsing stored user:', error)
//           logout()
//         }
//       }
      
//       setLoading(false)
//     }

//     checkAuth()

//     return () => {
//       cleanup()
//     }
//   }, [])

//   // Rafraîchir le timeout sur activité utilisateur
//   useEffect(() => {
//     if (!user) return

//     const resetTimer = () => {
//       cleanup()
//       timeoutRef.current = setTimeout(() => {
//         console.log('Session timeout - logging out')
//         logout()
//         router.push('/login')
//       }, SESSION_DURATION)
//     }

//     const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
//     events.forEach(event => window.addEventListener(event, resetTimer))

//     return () => {
//       events.forEach(event => window.removeEventListener(event, resetTimer))
//     }
//   }, [user, router])

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       isAuthenticated: !!user, 
//       login, 
//       logout, 
//       updateUser,
//       loading 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }

// // Hook personnalisé pour vérifier les rôles
// export function useRole() {
//   const { user } = useAuth()
  
//   return {
//     isAdmin: user?.role === 'admin',
//     isAgent: user?.role === 'agent',
//     isExpert: user?.role === 'expert',
//     isAssure: user?.role === 'assure',
//     role: user?.role,
//     hasRole: (roles: UserRole | UserRole[]) => {
//       if (!user) return false
//       if (Array.isArray(roles)) {
//         return roles.includes(user.role)
//       }
//       return user.role === roles
//     }
//   }
// }

// app/context/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export type UserRole = 'accueil' | 'consultation' | 'laboratoire' | 'pharmacie' | 'administration'

export type User = {
  id: string
  matricule: string
  username: string
  password?: string
  role: UserRole
  genre: 'M' | 'F' | null
  telephone: string | null  // ← AJOUTÉ
  photo_profil: string | null 
  first_login: boolean
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (matricule: string, password: string) => Promise<{ 
    success: boolean
    error?: string
    requiresPasswordChange?: boolean 
  }>
  logout: () => void
  updateUser: (user: User) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const USER_STORAGE_KEY = 'sonas-user'
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const setSessionTimeout = () => {
    cleanup()
    timeoutRef.current = setTimeout(() => {
      logout()
      router.push('/login')
    }, SESSION_DURATION)
  }

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    cleanup()
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
    setSessionTimeout()
  }

  const login = async (matricule: string, password: string) => {
    try {
      // Chercher l'utilisateur par matricule
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('matricule', matricule.toUpperCase().trim())
        .single()

      if (userError || !userData) {
        return { success: false, error: 'Matricule ou mot de passe incorrect' }
      }

      // Vérifier le mot de passe
      if (userData.password !== password) {
        return { success: false, error: 'Matricule ou mot de passe incorrect' }
      }

      // Rôles valides
      const validRoles: UserRole[] = ['accueil', 'consultation', 'laboratoire', 'pharmacie', 'administration']
      if (!validRoles.includes(userData.role as UserRole)) {
        return { success: false, error: 'Rôle utilisateur invalide' }
      }

      const loggedUser: User = {
        id: userData.id,
        matricule: userData.matricule,
        username: userData.username,
        role: userData.role,
        telephone: userData.telephone,
        genre: userData.genre,
        photo_profil: userData.photo_profil,
        first_login: userData.first_login,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      }

      // Si première connexion
      if (userData.first_login === true) {
        setUser(loggedUser)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser))
        return { success: true, requiresPasswordChange: true }
      }

      // Connexion normale
      setUser(loggedUser)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser))
      setSessionTimeout()

      return { success: true, requiresPasswordChange: false }

    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Erreur de connexion au serveur' }
    }
  }

  // Vérifier la session au chargement
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User
          setUser(userData)
          setSessionTimeout()
        } catch (error) {
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
    return () => cleanup()
  }, [])

  // Rafraîchir le timeout sur activité
  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      cleanup()
      timeoutRef.current = setTimeout(() => {
        logout()
        router.push('/login')
      }, SESSION_DURATION)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, resetTimer))

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [user, router])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      updateUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook pour les rôles
export function useRole() {
  const { user } = useAuth()
  
  return {
    isAccueil: user?.role === 'accueil',
    isConsultation: user?.role === 'consultation',
    isLaboratoire: user?.role === 'laboratoire',
    isPharmacie: user?.role === 'pharmacie',
    isAdministration: user?.role === 'administration',
    role: user?.role,
    hasRole: (roles: UserRole | UserRole[]) => {
      if (!user) return false
      if (Array.isArray(roles)) {
        return roles.includes(user.role)
      }
      return user.role === roles
    }
  }
}