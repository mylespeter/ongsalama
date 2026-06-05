
// // // components/SemanticSearch.tsx
// // 'use client'

// // import { useState, useCallback, useRef, useEffect } from 'react'
// // import { Search, Filter, X, Loader2, Star, Download, Calendar, User, Building } from 'lucide-react'
// // import { supabase } from '@/lib/supabase'

// // interface SearchResult {
// //   id: number
// //   titre: string
// //   resume: string
// //   mots_cles: string[]
// //   auteur: string
// //   promoteur: string
// //   fichier_nom: string
// //   fichier_chemin: string
// //   date_soutenance: string
// //   note: number
// //   statut: string
// //   cas_application: string
// //   similarity: number
// //   faculte?: {
// //     id: number
// //     nom: string
// //     code: string
// //   }
// //   departement?: {
// //     id: number
// //     nom: string
// //     code: string
// //     faculte_id: number
// //   }
// //   filiere?: {
// //     id: number
// //     nom: string
// //     code: string
// //     departement_id: number
// //   }
// //   annee_academique?: {
// //     id: number
// //     annee: string
// //   }
// // }

// // interface Filters {
// //   faculte_id?: number
// //   departement_id?: number
// //   filiere_id?: number
// //   annee_academique_id?: number
// //   auteur?: string
// //   promoteur?: string
// //   mots_cles?: string[]
// //   date_debut?: string
// //   date_fin?: string
// // }

// // interface Faculte {
// //   id: number
// //   nom: string
// //   code: string
// // }

// // interface Departement {
// //   id: number
// //   nom: string
// //   code: string
// //   faculte_id: number
// // }

// // interface Filiere {
// //   id: number
// //   nom: string
// //   code: string
// //   departement_id: number
// // }

// // interface AnneeAcademique {
// //   id: number
// //   annee: string
// // }

// // export default function SemanticSearch() {
// //   const [query, setQuery] = useState('')
// //   const [results, setResults] = useState<SearchResult[]>([])
// //   const [isLoading, setIsLoading] = useState(false)
// //   const [showFilters, setShowFilters] = useState(false)
// //   const [filters, setFilters] = useState<Filters>({})
// //   const [totalResults, setTotalResults] = useState(0)
// //   const [searchExecuted, setSearchExecuted] = useState(false)

// //   // Données pour les filtres
// //   const [facultes, setFacultes] = useState<Faculte[]>([])
// //   const [departements, setDepartements] = useState<Departement[]>([])
// //   const [filieres, setFilieres] = useState<Filiere[]>([])
// //   const [annees, setAnnees] = useState<AnneeAcademique[]>([])

// //   // Correction : initialiser useRef avec null
// //   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

// //   // Charger les données pour les filtres au montage
// //   useEffect(() => {
// //     loadFilterData()
// //   }, [])

// //   // Nettoyer le timeout à la destruction du composant
// //   useEffect(() => {
// //     return () => {
// //       if (searchTimeoutRef.current) {
// //         clearTimeout(searchTimeoutRef.current)
// //       }
// //     }
// //   }, [])

// //   // Charger les données pour les filtres
// //   const loadFilterData = useCallback(async () => {
// //     try {
// //       const [facultesRes, anneesRes] = await Promise.all([
// //         supabase.from('facultes').select('*').order('nom'),
// //         supabase.from('annees_academiques').select('*').order('annee', { ascending: false })
// //       ])

// //       setFacultes(facultesRes.data || [])
// //       setAnnees(anneesRes.data || [])
// //     } catch (error) {
// //       console.error('Erreur chargement données filtres:', error)
// //     }
// //   }, [])

// //   // Charger les départements selon la faculté sélectionnée
// //   const loadDepartements = useCallback(async (faculteId: number) => {
// //     if (!faculteId) {
// //       setDepartements([])
// //       setFilieres([])
// //       return
// //     }

// //     try {
// //       const { data } = await supabase
// //         .from('departements')
// //         .select('*')
// //         .eq('faculte_id', faculteId)
// //         .order('nom')

// //       setDepartements(data || [])
// //       setFilieres([])
// //     } catch (error) {
// //       console.error('Erreur chargement départements:', error)
// //     }
// //   }, [])

// //   // Charger les filières selon le département sélectionné
// //   const loadFilieres = useCallback(async (departementId: number) => {
// //     if (!departementId) {
// //       setFilieres([])
// //       return
// //     }

// //     try {
// //       const { data } = await supabase
// //         .from('filieres')
// //         .select('*')
// //         .eq('departement_id', departementId)
// //         .order('nom')

// //       setFilieres(data || [])
// //     } catch (error) {
// //       console.error('Erreur chargement filières:', error)
// //     }
// //   }, [])

// //   // Recherche sémantique
// //   const performSearch = useCallback(async (searchQuery: string, searchFilters: Filters) => {
// //     if (!searchQuery.trim()) {
// //       setResults([])
// //       setTotalResults(0)
// //       setSearchExecuted(false)
// //       return
// //     }

// //     setIsLoading(true)
// //     setSearchExecuted(true)

// //     try {
// //       const response = await fetch('/api/semantic-search', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           query: searchQuery,
// //           filters: searchFilters,
// //           limit: 20,
// //           similarityThreshold: 0.3
// //         }),
// //       })

// //       if (!response.ok) {
// //         throw new Error('Erreur lors de la recherche')
// //       }

// //       const data = await response.json()
// //       setResults(data.results || [])
// //       setTotalResults(data.total || 0)
// //     } catch (error) {
// //       console.error('Erreur recherche:', error)
// //       setResults([])
// //       setTotalResults(0)
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }, [])

// //   // Recherche avec debounce
// //   const handleSearch = useCallback((searchQuery: string, searchFilters: Filters = filters) => {
// //     if (searchTimeoutRef.current) {
// //       clearTimeout(searchTimeoutRef.current)
// //     }

// //     searchTimeoutRef.current = setTimeout(() => {
// //       performSearch(searchQuery, searchFilters)
// //     }, 500)
// //   }, [filters, performSearch])

// //   const handleQueryChange = (value: string) => {
// //     setQuery(value)
// //     handleSearch(value)
// //   }

// //   const handleFilterChange = (newFilters: Filters) => {
// //     const updatedFilters = { ...newFilters }
// //     setFilters(updatedFilters)
// //     handleSearch(query, updatedFilters)
// //   }

// //   const clearFilters = () => {
// //     setFilters({})
// //     setDepartements([])
// //     setFilieres([])
// //     handleSearch(query, {})
// //   }

// //   const downloadFile = async (filePath: string, fileName: string) => {
// //     try {
// //       const { data, error } = await supabase.storage
// //         .from('tfc-bucket')
// //         .download(filePath)

// //       if (error) throw error

// //       const url = URL.createObjectURL(data)
// //       const a = document.createElement('a')
// //       a.href = url
// //       a.download = fileName
// //       document.body.appendChild(a)
// //       a.click()
// //       document.body.removeChild(a)
// //       URL.revokeObjectURL(url)
// //     } catch (error) {
// //       console.error('Erreur téléchargement:', error)
// //       alert('Erreur lors du téléchargement du fichier')
// //     }
// //   }

// //   const getSimilarityColor = (similarity: number) => {
// //     if (similarity >= 80) return 'text-green-600 bg-green-50'
// //     if (similarity >= 60) return 'text-blue-600 bg-blue-50'
// //     if (similarity >= 40) return 'text-yellow-600 bg-yellow-50'
// //     return 'text-gray-600 bg-gray-50'
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 py-8">
// //       <div className="container mx-auto px-4 max-w-7xl">
// //         {/* En-tête */}
// //         <div className="text-center mb-8">
// //           <h1 className="text-4xl font-bold text-gray-900 mb-4">
// //             Recherche Sémantique de TFC
// //           </h1>
// //           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
// //             Recherchez intelligemment parmi les travaux de fin de cycle en utilisant l'IA. 
// //             La recherche comprend le titre, le résumé, les mots-clés et le contexte.
// //           </p>
// //         </div>

// //         {/* Barre de recherche */}
// //         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
// //           <div className="relative">
// //             <div className="flex items-center space-x-4">
// //               <div className="flex-1 relative">
// //                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
// //                 <input
// //                   type="text"
// //                   value={query}
// //                   onChange={(e) => handleQueryChange(e.target.value)}
// //                   placeholder="Rechercher par thème, sujet, technologie, méthodologie..."
// //                   className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
// //                 />
// //               </div>
              
// //               <button
// //                 onClick={() => setShowFilters(!showFilters)}
// //                 className={`px-6 py-4 rounded-xl border flex items-center space-x-2 transition-all ${
// //                   showFilters 
// //                     ? 'bg-blue-500 text-white border-blue-500' 
// //                     : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
// //                 }`}
// //               >
// //                 <Filter className="h-5 w-5" />
// //                 <span>Filtres</span>
// //                 {Object.keys(filters).length > 0 && (
// //                   <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
// //                     {Object.keys(filters).length}
// //                   </span>
// //                 )}
// //               </button>
// //             </div>

// //             {/* Filtres */}
// //             {showFilters && (
// //               <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //                   {/* Faculté */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Faculté
// //                     </label>
// //                     <select
// //                       value={filters.faculte_id || ''}
// //                       onChange={async (e) => {
// //                         const faculteId = e.target.value ? parseInt(e.target.value) : undefined
// //                         if (faculteId) {
// //                           await loadDepartements(faculteId)
// //                         }
// //                         handleFilterChange({ ...filters, faculte_id: faculteId, departement_id: undefined, filiere_id: undefined })
// //                       }}
// //                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                     >
// //                       <option value="">Toutes les facultés</option>
// //                       {facultes.map((faculte) => (
// //                         <option key={faculte.id} value={faculte.id}>
// //                           {faculte.nom}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   {/* Département */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Département
// //                     </label>
// //                     <select
// //                       value={filters.departement_id || ''}
// //                       onChange={async (e) => {
// //                         const departementId = e.target.value ? parseInt(e.target.value) : undefined
// //                         if (departementId) {
// //                           await loadFilieres(departementId)
// //                         }
// //                         handleFilterChange({ ...filters, departement_id: departementId, filiere_id: undefined })
// //                       }}
// //                       disabled={!filters.faculte_id}
// //                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
// //                     >
// //                       <option value="">Tous les départements</option>
// //                       {departements.map((departement) => (
// //                         <option key={departement.id} value={departement.id}>
// //                           {departement.nom}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   {/* Filière */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Filière
// //                     </label>
// //                     <select
// //                       value={filters.filiere_id || ''}
// //                       onChange={(e) => handleFilterChange({ 
// //                         ...filters, 
// //                         filiere_id: e.target.value ? parseInt(e.target.value) : undefined 
// //                       })}
// //                       disabled={!filters.departement_id}
// //                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
// //                     >
// //                       <option value="">Toutes les filières</option>
// //                       {filieres.map((filiere) => (
// //                         <option key={filiere.id} value={filiere.id}>
// //                           {filiere.nom}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   {/* Année académique */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Année académique
// //                     </label>
// //                     <select
// //                       value={filters.annee_academique_id || ''}
// //                       onChange={(e) => handleFilterChange({ 
// //                         ...filters, 
// //                         annee_academique_id: e.target.value ? parseInt(e.target.value) : undefined 
// //                       })}
// //                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                     >
// //                       <option value="">Toutes les années</option>
// //                       {annees.map((annee) => (
// //                         <option key={annee.id} value={annee.id}>
// //                           {annee.annee}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   {/* Auteur */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Auteur
// //                     </label>
// //                     <input
// //                       type="text"
// //                       value={filters.auteur || ''}
// //                       onChange={(e) => handleFilterChange({ ...filters, auteur: e.target.value })}
// //                       placeholder="Nom de l'auteur"
// //                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                     />
// //                   </div>

// //                   {/* Promoteur */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Promoteur
// //                     </label>
// //                     <input
// //                       type="text"
// //                       value={filters.promoteur || ''}
// //                       onChange={(e) => handleFilterChange({ ...filters, promoteur: e.target.value })}
// //                       placeholder="Nom du promoteur"
// //                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                     />
// //                   </div>

// //                   {/* Date de soutenance */}
// //                   <div className="lg:col-span-2">
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Date de soutenance
// //                     </label>
// //                     <div className="grid grid-cols-2 gap-4">
// //                       <input
// //                         type="date"
// //                         value={filters.date_debut || ''}
// //                         onChange={(e) => handleFilterChange({ ...filters, date_debut: e.target.value })}
// //                         className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                         placeholder="Date début"
// //                       />
// //                       <input
// //                         type="date"
// //                         value={filters.date_fin || ''}
// //                         onChange={(e) => handleFilterChange({ ...filters, date_fin: e.target.value })}
// //                         className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //                         placeholder="Date fin"
// //                       />
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Boutons filtres */}
// //                 <div className="flex justify-between items-center mt-6">
// //                   <button
// //                     onClick={clearFilters}
// //                     className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
// //                   >
// //                     <X className="h-4 w-4" />
// //                     <span>Effacer tous les filtres</span>
// //                   </button>

// //                   <div className="text-sm text-gray-500">
// //                     {Object.keys(filters).length} filtre(s) actif(s)
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Résultats */}
// //         <div className="bg-white rounded-2xl shadow-lg p-6">
// //           {/* En-tête résultats */}
// //           <div className="flex justify-between items-center mb-6">
// //             <div>
// //               <h2 className="text-2xl font-bold text-gray-900">
// //                 Résultats de la recherche
// //               </h2>
// //               {searchExecuted && (
// //                 <p className="text-gray-600 mt-1">
// //                   {isLoading ? 'Recherche en cours...' : `${totalResults} résultat(s) trouvé(s)`}
// //                 </p>
// //               )}
// //             </div>

// //             {totalResults > 0 && (
// //               <div className="text-sm text-gray-500">
// //                 Trié par pertinence
// //               </div>
// //             )}
// //           </div>

// //           {/* Loading */}
// //           {isLoading && (
// //             <div className="flex justify-center items-center py-12">
// //               <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
// //               <span className="ml-3 text-gray-600">Recherche en cours...</span>
// //             </div>
// //           )}

// //           {/* Aucun résultat */}
// //           {!isLoading && searchExecuted && totalResults === 0 && (
// //             <div className="text-center py-12">
// //               <div className="text-gray-400 mb-4">
// //                 <Search className="h-16 w-16 mx-auto" />
// //               </div>
// //               <h3 className="text-lg font-medium text-gray-900 mb-2">
// //                 Aucun résultat trouvé
// //               </h3>
// //               <p className="text-gray-600">
// //                 Essayez de modifier vos termes de recherche ou vos filtres
// //               </p>
// //             </div>
// //           )}

// //           {/* Liste des résultats */}
// //           {!isLoading && results.length > 0 && (
// //             <div className="space-y-6">
// //               {results.map((result) => (
// //                 <div key={result.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
// //                   <div className="flex justify-between items-start mb-4">
// //                     <div className="flex-1">
// //                       <h3 className="text-xl font-semibold text-gray-900 mb-2">
// //                         {result.titre}
// //                       </h3>
                      
// //                       <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
// //                         <div className="flex items-center space-x-1">
// //                           <User className="h-4 w-4" />
// //                           <span>{result.auteur}</span>
// //                         </div>
// //                         {result.promoteur && (
// //                           <div className="flex items-center space-x-1">
// //                             <Building className="h-4 w-4" />
// //                             <span>{result.promoteur}</span>
// //                           </div>
// //                         )}
// //                         {result.date_soutenance && (
// //                           <div className="flex items-center space-x-1">
// //                             <Calendar className="h-4 w-4" />
// //                             <span>{new Date(result.date_soutenance).toLocaleDateString()}</span>
// //                           </div>
// //                         )}
// //                         {result.note && (
// //                           <div className="flex items-center space-x-1">
// //                             <Star className="h-4 w-4 text-yellow-500" />
// //                             <span>Note: {result.note}/20</span>
// //                           </div>
// //                         )}
// //                       </div>

// //                       {/* Métadonnées */}
// //                       <div className="flex flex-wrap gap-2 mb-3">
// //                         {result.faculte && (
// //                           <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
// //                             {result.faculte.nom}
// //                           </span>
// //                         )}
// //                         {result.departement && (
// //                           <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
// //                             {result.departement.nom}
// //                           </span>
// //                         )}
// //                         {result.filiere && (
// //                           <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
// //                             {result.filiere.nom}
// //                           </span>
// //                         )}
// //                         {result.annee_academique && (
// //                           <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
// //                             {result.annee_academique.annee}
// //                           </span>
// //                         )}
// //                         {result.cas_application && result.cas_application !== 'anonymes' && (
// //                           <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
// //                             {result.cas_application}
// //                           </span>
// //                         )}
// //                       </div>

// //                       {/* Mots-clés */}
// //                       {result.mots_cles && result.mots_cles.length > 0 && (
// //                         <div className="mb-3">
// //                           <div className="flex flex-wrap gap-1">
// //                             {result.mots_cles.slice(0, 8).map((mot, index) => (
// //                               <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
// //                                 {mot}
// //                               </span>
// //                             ))}
// //                             {result.mots_cles.length > 8 && (
// //                               <span className="text-gray-500 text-xs">
// //                                 +{result.mots_cles.length - 8} autres
// //                               </span>
// //                             )}
// //                           </div>
// //                         </div>
// //                       )}
// //                     </div>

// //                     {/* Score de similarité */}
// //                     <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSimilarityColor(result.similarity)}`}>
// //                       {result.similarity}% de pertinence
// //                     </div>
// //                   </div>

// //                   {/* Résumé */}
// //                   {result.resume && (
// //                     <p className="text-gray-700 mb-4 line-clamp-3">
// //                       {result.resume}
// //                     </p>
// //                   )}

// //                   {/* Actions */}
// //                   <div className="flex justify-between items-center">
// //                     <div className="text-sm text-gray-500">
// //                       {result.fichier_nom}
// //                     </div>
                    
// //                     <button
// //                       onClick={() => downloadFile(result.fichier_chemin, result.fichier_nom)}
// //                       className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
// //                     >
// //                       <Download className="h-4 w-4" />
// //                       <span>Télécharger</span>
// //                     </button>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }



// 'use client'

// import { useState, useCallback, useRef, useEffect } from 'react'
// import { Search, Download, Calendar, User, Building, Star, Loader2 } from 'lucide-react'
// import { supabase } from '@/lib/supabase'

// interface SearchResult {
//   id: number
//   titre: string
//   resume: string
//   mots_cles: string[]
//   auteur: string
//   promoteur: string
//   fichier_nom: string
//   fichier_chemin: string
//   date_soutenance: string
//   note: number
//   statut: string
//   cas_application: string
//   similarity: number
//   faculte?: {
//     id: number
//     nom: string
//     code: string
//   }
//   departement?: {
//     id: number
//     nom: string
//     code: string
//     faculte_id: number
//   }
//   filiere?: {
//     id: number
//     nom: string
//     code: string
//     departement_id: number
//   }
//   annee_academique?: {
//     id: number
//     annee: string
//   }
// }

// export default function SemanticSearch() {
//   const [query, setQuery] = useState('')
//   const [results, setResults] = useState<SearchResult[]>([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [totalResults, setTotalResults] = useState(0)
//   const [searchExecuted, setSearchExecuted] = useState(false)

//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

//   // Nettoyer le timeout à la destruction du composant
//   useEffect(() => {
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current)
//       }
//     }
//   }, [])

//   // Recherche sémantique
//   const performSearch = useCallback(async (searchQuery: string) => {
//     if (!searchQuery.trim()) {
//       setResults([])
//       setTotalResults(0)
//       setSearchExecuted(false)
//       return
//     }

//     setIsLoading(true)
//     setSearchExecuted(true)

//     try {
//       const response = await fetch('/api/semantic-search', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           query: searchQuery,
//           limit: 20,
//           similarityThreshold: 0.3
//         }),
//       })

//       if (!response.ok) {
//         throw new Error('Erreur lors de la recherche')
//       }

//       const data = await response.json()
//       setResults(data.results || [])
//       setTotalResults(data.total || 0)
//     } catch (error) {
//       console.error('Erreur recherche:', error)
//       setResults([])
//       setTotalResults(0)
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   // Recherche avec debounce
//   const handleSearch = useCallback((searchQuery: string) => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current)
//     }

//     searchTimeoutRef.current = setTimeout(() => {
//       performSearch(searchQuery)
//     }, 500)
//   }, [performSearch])

//   const handleQueryChange = (value: string) => {
//     setQuery(value)
//     handleSearch(value)
//   }

//   const downloadFile = async (filePath: string, fileName: string) => {
//     try {
//       const { data, error } = await supabase.storage
//         .from('tfc-bucket')
//         .download(filePath)

//       if (error) throw error

//       const url = URL.createObjectURL(data)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = fileName
//       document.body.appendChild(a)
//       a.click()
//       document.body.removeChild(a)
//       URL.revokeObjectURL(url)
//     } catch (error) {
//       console.error('Erreur téléchargement:', error)
//       alert('Erreur lors du téléchargement du fichier')
//     }
//   }

//   const getSimilarityColor = (similarity: number) => {
//     if (similarity >= 80) return 'text-green-600 bg-green-50'
//     if (similarity >= 60) return 'text-blue-600 bg-blue-50'
//     if (similarity >= 40) return 'text-yellow-600 bg-yellow-50'
//     return 'text-gray-600 bg-gray-50'
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-7xl">
//         {/* En-tête */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Recherche Sémantique de TFC
//           </h1>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Recherchez intelligemment parmi les travaux de fin de cycle en utilisant l'IA. 
//             La recherche comprend le titre, le résumé, les mots-clés et le contexte.
//           </p>
//         </div>

//         {/* Barre de recherche */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
//           <div className="relative">
//             <div className="flex items-center space-x-4">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   type="text"
//                   value={query}
//                   onChange={(e) => handleQueryChange(e.target.value)}
//                   placeholder="Rechercher par thème, sujet, technologie, méthodologie..."
//                   className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Résultats */}
//         <div className="bg-white rounded-2xl shadow-lg p-6">
//           {/* En-tête résultats */}
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Résultats de la recherche
//               </h2>
//               {searchExecuted && (
//                 <p className="text-gray-600 mt-1">
//                   {isLoading ? 'Recherche en cours...' : `${totalResults} résultat(s) trouvé(s)`}
//                 </p>
//               )}
//             </div>

//             {totalResults > 0 && (
//               <div className="text-sm text-gray-500">
//                 Trié par pertinence
//               </div>
//             )}
//           </div>

//           {/* Loading */}
//           {isLoading && (
//             <div className="flex justify-center items-center py-12">
//               <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
//               <span className="ml-3 text-gray-600">Recherche en cours...</span>
//             </div>
//           )}

//           {/* Aucun résultat */}
//           {!isLoading && searchExecuted && totalResults === 0 && (
//             <div className="text-center py-12">
//               <div className="text-gray-400 mb-4">
//                 <Search className="h-16 w-16 mx-auto" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 Aucun résultat trouvé
//               </h3>
//               <p className="text-gray-600">
//                 Essayez de modifier vos termes de recherche
//               </p>
//             </div>
//           )}

//           {/* Liste des résultats */}
//           {!isLoading && results.length > 0 && (
//             <div className="space-y-6">
//               {results.map((result) => (
//                 <div key={result.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex-1">
//                       <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                         {result.titre}
//                       </h3>
                      
//                       <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
//                         <div className="flex items-center space-x-1">
//                           <User className="h-4 w-4" />
//                           <span>{result.auteur}</span>
//                         </div>
//                         {result.promoteur && (
//                           <div className="flex items-center space-x-1">
//                             <Building className="h-4 w-4" />
//                             <span>{result.promoteur}</span>
//                           </div>
//                         )}
//                         {result.date_soutenance && (
//                           <div className="flex items-center space-x-1">
//                             <Calendar className="h-4 w-4" />
//                             <span>{new Date(result.date_soutenance).toLocaleDateString()}</span>
//                           </div>
//                         )}
//                         {result.note && (
//                           <div className="flex items-center space-x-1">
//                             <Star className="h-4 w-4 text-yellow-500" />
//                             <span>Note: {result.note}/20</span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Métadonnées */}
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {result.faculte && (
//                           <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
//                             {result.faculte.nom}
//                           </span>
//                         )}
//                         {result.departement && (
//                           <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
//                             {result.departement.nom}
//                           </span>
//                         )}
//                         {result.filiere && (
//                           <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
//                             {result.filiere.nom}
//                           </span>
//                         )}
//                         {result.annee_academique && (
//                           <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
//                             {result.annee_academique.annee}
//                           </span>
//                         )}
//                         {result.cas_application && result.cas_application !== 'anonymes' && (
//                           <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
//                             {result.cas_application}
//                           </span>
//                         )}
//                       </div>

//                       {/* Mots-clés */}
//                       {result.mots_cles && result.mots_cles.length > 0 && (
//                         <div className="mb-3">
//                           <div className="flex flex-wrap gap-1">
//                             {result.mots_cles.slice(0, 8).map((mot, index) => (
//                               <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
//                                 {mot}
//                               </span>
//                             ))}
//                             {result.mots_cles.length > 8 && (
//                               <span className="text-gray-500 text-xs">
//                                 +{result.mots_cles.length - 8} autres
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Score de similarité */}
//                     <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSimilarityColor(result.similarity)}`}>
//                       {result.similarity}% de pertinence
//                     </div>
//                   </div>

//                   {/* Résumé */}
//                   {result.resume && (
//                     <p className="text-gray-700 mb-4 line-clamp-3">
//                       {result.resume}
//                     </p>
//                   )}

//                   {/* Actions */}
//                   <div className="flex justify-between items-center">
//                     <div className="text-sm text-gray-500">
//                       {result.fichier_nom}
//                     </div>
                    
//                     <button
//                       onClick={() => downloadFile(result.fichier_chemin, result.fichier_nom)}
//                       className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//                     >
//                       <Download className="h-4 w-4" />
//                       <span>Télécharger</span>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Download, Calendar, User, Building, Star, Loader2, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SearchResult {
  id: number
  titre: string
  resume: string
  mots_cles: string[]
  auteur: string
  promoteur: string
  fichier_nom: string
  fichier_chemin: string
  date_soutenance: string
  note: number
  statut: string
  cas_application: string
  similarity: number
  faculte?: {
    id: number
    nom: string
    code: string
  }
  departement?: {
    id: number
    nom: string
    code: string
    faculte_id: number
  }
  filiere?: {
    id: number
    nom: string
    code: string
    departement_id: number
  }
  annee_academique?: {
    id: number
    annee: string
  }
}

export default function SemanticSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [searchExecuted, setSearchExecuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus sur l'input au chargement
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Recherche sémantique
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotalResults(0)
      setSearchExecuted(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setSearchExecuted(true)
    setError(null)

    try {
      console.log('🔍 Lancement recherche sémantique:', searchQuery)
      
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 20,
          similarityThreshold: 0.1 // 🔥 Augmenté le seuil pour plus de pertinence
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }))
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Résultats reçus:', data.total)
      
      // 🔥 FILTRER les résultats avec une similarité trop faible
      const filteredResults = (data.results || []).filter((result: SearchResult) => result.similarity >= 20)
      console.log('📊 Résultats avant filtrage:', data.results?.length)
console.log('📊 Résultats après filtrage:', filteredResults.length)
console.log('📊 Détail des similarités:', data.results?.map((r: any) => r.similarity))
      setResults(filteredResults)
      setTotalResults(filteredResults.length)
      
    } catch (error) {
      console.error('❌ Erreur recherche:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche')
      setResults([])
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Recherche manuelle avec le bouton ou Enter
  const handleSearch = () => {
    if (query.trim()) {
      performSearch(query.trim())
    }
  }

  // Gestion de la touche Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault()
      handleSearch()
    }
  }

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('tfc-bucket')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      alert('Erreur lors du téléchargement du fichier')
    }
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 70) return 'text-green-600 bg-green-50 border-green-200'
    if (similarity >= 50) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (similarity >= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  // 🔥 Fonction pour formater le pourcentage de similarité
  const formatSimilarity = (similarity: number) => {
    return Math.round(similarity * 100) / 100; // Arrondir à 2 décimales
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recherche Sémantique de TFC
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Recherchez intelligemment parmi les travaux de fin de cycle en utilisant l'IA. 
            La recherche comprend le titre, le résumé, les mots-clés et le contexte.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Rechercher par thème, sujet, technologie, méthodologie... (Appuyez sur Entrée)"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  disabled={isLoading}
                />
              </div>
              
              {/* Bouton de recherche */}
              <button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium min-w-[140px] justify-center"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>{isLoading ? 'Recherche...' : 'Rechercher'}</span>
              </button>
            </div>
            
            {/* Conseils de recherche */}
            <div className="mt-3 text-sm text-gray-500">
              <p>• Appuyez sur Entrée ou cliquez sur Rechercher pour lancer la recherche</p>
              <p>• Seuls les résultats avec une similarité ≥ 30% sont affichés</p>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center text-red-800">
              <span className="font-medium">Erreur:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        {/* Résultats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* En-tête résultats */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Résultats de la recherche
              </h2>
              {searchExecuted && (
                <p className="text-gray-600 mt-1">
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Recherche sémantique en cours...
                    </span>
                  ) : error ? (
                    'Erreur lors de la recherche'
                  ) : (
                    `${totalResults} résultat(s) trouvé(s)`
                  )}
                </p>
              )}
            </div>

            {!isLoading && totalResults > 0 && (
              <div className="text-sm text-gray-500">
                Trié par pertinence décroissante
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-gray-600">Analyse sémantique en cours...</span>
            </div>
          )}

          {/* Aucun résultat */}
          {!isLoading && searchExecuted && totalResults === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun résultat pertinent trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez d'utiliser d'autres termes ou d'être plus spécifique
              </p>
              <div className="text-sm text-gray-500">
                <p>Conseils : Utilisez des termes techniques spécifiques ou des synonymes</p>
              </div>
            </div>
          )}

          {/* Liste des résultats */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-6">
              {results.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                     
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      <a 
                        href={`/tfc/${result.id}`}
                        className="hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {result.titre}
                        <ArrowRight className="inline-block ml-2 h-4 w-4" />
                      </a>
                    </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{result.auteur}</span>
                        </div>
                        {result.promoteur && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{result.promoteur}</span>
                          </div>
                        )}
                        {result.date_soutenance && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(result.date_soutenance).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                        {result.note && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>Note: {result.note}/20</span>
                          </div>
                        )}
                      </div>

                      {/* Métadonnées */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.faculte && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {result.faculte.nom}
                          </span>
                        )}
                        {/* {result.departement && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {result.departement.nom}
                          </span>
                        )}
                        {result.filiere && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {result.filiere.nom}
                          </span>
                        )} */}
                        {result.annee_academique && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                            {result.annee_academique.annee}
                          </span>
                        )}
                        {result.cas_application && result.cas_application !== 'anonymes' && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                            {result.cas_application}
                          </span>
                        )}
                      </div>

                      {/* Mots-clés */}
                      {result.mots_cles && result.mots_cles.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {result.mots_cles.slice(0, 8).map((mot, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {mot}
                              </span>
                            ))}
                            {result.mots_cles.length > 8 && (
                              <span className="bg-blue-200 px-2 rounded-full grid place-content-center text-blue-600 text-xs">
                                +{result.mots_cles.length - 8} autres
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Score de similarité */}
                    <div className={`px-3 py-2 rounded-full text-sm font-medium border ${getSimilarityColor(result.similarity)}`}>
                      {formatSimilarity(result.similarity)}% de pertinence
                    </div>
                  </div>

                  {/* Résumé */}
                  {/* {result.resume && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {result.resume}
                    </p>
                  )} */}

                  {/* Actions */}
                  {/* <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {result.fichier_nom}
                    </div>
                    
                    <button
                      onClick={() => downloadFile(result.fichier_chemin, result.fichier_nom)}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger</span>
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}