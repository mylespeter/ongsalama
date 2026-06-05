

// // app/login/page.tsx
// 'use client'

// import { useState } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { Shield, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const { login } = useAuth()
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       const result = await login(email, password)
      
//       if (result.success) {
//         if (result.requiresPasswordChange) {
//           router.push('/')
//         } else {
//           router.push('/dashboard')
//         }
//       } else {
//         setError(result.error || 'Email ou mot de passe incorrect')
//       }
//     } catch (err) {
//       setError('Une erreur est survenue lors de la connexion')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex">
//       {/* Partie gauche - Image/Design */}
//       <div className="hidden  lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
//         <div className="absolute inset-0 bg-black opacity-20"></div>
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
   
//       </div>

//       {/* Partie droite - Formulaire */}
//       <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
//         <div className="max-w-md w-full">
//           {/* Logo mobile */}
//           <div className="lg:hidden text-center mb-8">
//             <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
//             <h1 className="text-2xl font-bold text-gray-900">AssurManage</h1>
//           </div>

//           <div className="bg-white rounded-2xl my-3 shadow-xl p-8">
//             <div className="text-center mb-8">
// <img src='/sonas.png' className='w-[120px] mx-auto mb-4'/>

//               <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
//               <p className="mt-2 text-sm text-gray-600">
//                 Accédez à votre espace personnel
//               </p>
//             </div>

//             {error && (
//               <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm text-red-700">{error}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Adresse email
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
//                     placeholder="exemple@email.com"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mot de passe
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
//                     placeholder="••••••••"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                     ) : (
//                       <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="remember-me"
//                     name="remember-me"
//                     type="checkbox"
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
//                     Se souvenir de moi
//                   </label>
//                 </div>
//                 <div className="text-sm">
//                   <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
//                     Mot de passe oublié ?
//                   </a>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Connexion en cours...
//                   </>
//                 ) : (
//                   <>
//                     Se connecter
//                     <ArrowRight className="ml-2 h-5 w-5" />
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="mt-8 text-center">
//               <p className="text-xs text-gray-500">
//                 Besoin d'aide ? {' '}
//                 <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
//                   Contactez le support
//                 </a>
//               </p>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="mt-8 text-center">
//             <p className="text-xs text-gray-500">
//               © {new Date().getFullYear()} Sonas L'shi. Tous droits réservés.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react'
import { Loader } from '@/components/ui/Loader'

export default function LoginPage() {
  const [matricule, setMatricule] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(matricule, password)
      
      if (result.success) {
        if (result.requiresPasswordChange) {
          router.push('/change-password')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(result.error || 'Matricule ou mot de passe incorrect')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-content-center  bg-background">
      {/* Partie gauche - Branding */}
      {/* <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNjAgMTAgTSAxMCAwIEwgMTAgNjAgTSAwIDIwIEwgNjAgMjAgTSAyMCAwIEwgMjAgNjAgTSAwIDMwIEwgNjAgMzAgTSAzMCAwIEwgMzAgNjAgTSAwIDQwIEwgNjAgNDAgTSA0MCAwIEwgNDAgNjAgTSAwIDUwIEwgNjAgNTAgTSA1MCAwIEwgNTAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
            <Building2 className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">SONAS L'shi</h1>
            <p className="text-accent text-lg mb-4">Système de Gestion Hospitalière</p>
            <div className="h-px bg-white/20 my-6"></div>
            <p className="text-white/80 text-sm">
            </p>
          </div>
        </div>
      </div> */}

      {/* Partie droite - Formulaire */}
      <div className="flex- flex items-center  justify-center ">
        <div className="max-w-md w-full">
          {/* Logo mobile */}
         

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
            <div className="text-center mb-8">
             <img src='./logo1.png' className='w-20 h-auto mx-auto my-3'/>
              <h2 className="text-2xl font-bold text-text-dark">Connexion</h2>
              <p className="mt-2 text-sm text-gray-500">
                Accédez à votre espace de travail
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-error p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Matricule
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="AC0012"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} ONG SALAMA kisanga. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}