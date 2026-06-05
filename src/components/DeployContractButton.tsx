// // // components/DeployContractButton.tsx
// // 'use client';

// // import { useState, useEffect } from 'react';
// // import { 
// //   Box, 
// //   Loader2, 
// //   CheckCircle2, 
// //   XCircle, 
// //   AlertTriangle,
// //   ExternalLink,
// //   RefreshCw,
// //   Copy,
// //   Check,
// //   Power,
// //   Activity
// // } from 'lucide-react';

// // export default function DeployContractButton() {
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [contractAddress, setContractAddress] = useState<string | null>(null);
// //   const [error, setError] = useState<string | null>(null);
// //   const [showModal, setShowModal] = useState(false);
// //   const [deploymentOutput, setDeploymentOutput] = useState<string>('');
// //   const [copied, setCopied] = useState(false);
// //   const [isCheckingStatus, setIsCheckingStatus] = useState(false);

// //   // Vérifier l'état au chargement
// //   useEffect(() => {
// //     checkContractStatus();
// //   }, []);

// //   const checkContractStatus = async () => {
// //     setIsCheckingStatus(true);
// //     try {
// //       const response = await fetch('/api/blockchain/deploy');
// //       const data = await response.json();
      
// //       if (data.isDeployed) {
// //         setContractAddress(data.contractAddress);
// //       }
// //     } catch (error) {
// //       console.error('Erreur vérification contrat:', error);
// //     } finally {
// //       setIsCheckingStatus(false);
// //     }
// //   };

// //   const deployContract = async () => {
// //     setIsLoading(true);
// //     setError(null);
// //     setDeploymentOutput('');
// //     setShowModal(true);

// //     try {
// //       const response = await fetch('/api/blockchain/deploy', {
// //         method: 'POST',
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.error || 'Erreur lors du déploiement');
// //       }

// //       setContractAddress(data.contractAddress);
// //       setDeploymentOutput(data.output || 'Déploiement réussi');
// //     } catch (err: any) {
// //       setError(err.message || 'Erreur inconnue');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const copyToClipboard = async () => {
// //     if (contractAddress) {
// //       await navigator.clipboard.writeText(contractAddress);
// //       setCopied(true);
// //       setTimeout(() => setCopied(false), 2000);
// //     }
// //   };

// //   const truncateAddress = (address: string) => {
// //     return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
// //   };

// //   return (
// //     <>
// //       {/* Bouton de déploiement */}
// //       <button
// //         onClick={deployContract}
// //         disabled={isLoading}
// //         title={contractAddress ? 'Contrat déployé' : 'Déployer le contrat'}
// //         className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
// //           contractAddress
// //             ? 'text-green-600 bg-green-50 hover:bg-green-100'
// //             : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
// //         } disabled:opacity-50 disabled:cursor-not-allowed`}
// //       >
// //         {isLoading ? (
// //           <Loader2 className="h-5 w-5 animate-spin" />
// //         ) : isCheckingStatus ? (
// //           <Activity className="h-5 w-5 animate-pulse" />
// //         ) : contractAddress ? (
// //           <CheckCircle2 className="h-5 w-5" />
// //         ) : (
// //           <Box className="h-5 w-5" />
// //         )}
// //         {contractAddress && (
// //           <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
// //         )}
// //       </button>

// //       {/* Modal de déploiement */}
// //       {showModal && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center">
// //           {/* Overlay */}
// //           <div 
// //             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
// //             onClick={() => setShowModal(false)}
// //           />
          
// //           {/* Modal */}
// //           <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 z-10 animate-in fade-in zoom-in">
// //             <div className="text-center">
// //               {/* Icône de statut */}
// //               <div className="mx-auto">
// //                 {isLoading ? (
// //                   <div className="relative h-16 w-16 mx-auto">
// //                     <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
// //                     <div className="absolute inset-0 flex items-center justify-center">
// //                       <div className="h-6 w-6 bg-purple-600 rounded-full animate-ping" />
// //                     </div>
// //                   </div>
// //                 ) : error ? (
// //                   <div className="h-16 w-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
// //                     <XCircle className="h-8 w-8 text-red-600" />
// //                   </div>
// //                 ) : contractAddress ? (
// //                   <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
// //                     <CheckCircle2 className="h-8 w-8 text-green-600" />
// //                   </div>
// //                 ) : null}
// //               </div>

// //               {/* Titre */}
// //               <h3 className="mt-4 text-lg font-semibold text-gray-900">
// //                 {isLoading ? 'Déploiement en cours...' :
// //                  error ? 'Erreur de déploiement' :
// //                  contractAddress ? 'Contrat déployé !' :
// //                  'Déployer le contrat'}
// //               </h3>

// //               {/* Message de statut */}
// //               {isLoading && (
// //                 <>
// //                   <p className="mt-2 text-sm text-gray-500">
// //                     Compilation et déploiement sur Ganache...
// //                   </p>
// //                   <div className="mt-4 space-y-2">
// //                     <div className="flex items-center justify-center space-x-2 text-sm text-purple-600">
// //                       <RefreshCw className="h-4 w-4 animate-spin" />
// //                       <span>Connexion à Ganache...</span>
// //                     </div>
// //                     <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
// //                       <Box className="h-4 w-4" />
// //                       <span>Compilation du contrat...</span>
// //                     </div>
// //                     <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
// //                       <Activity className="h-4 w-4" />
// //                       <span>Mise à jour de la configuration...</span>
// //                     </div>
// //                   </div>
// //                 </>
// //               )}

// //               {/* Erreur */}
// //               {error && (
// //                 <div className="mt-4 p-4 bg-red-50 rounded-lg">
// //                   <div className="flex items-start">
// //                     <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
// //                     <div className="text-left">
// //                       <p className="text-sm text-red-800">{error}</p>
// //                       {error.includes('Ganache') && (
// //                         <div className="mt-2 flex items-center text-xs text-red-600">
// //                           <Power className="h-3 w-3 mr-1" />
// //                           Vérifiez que Ganache est lancé sur le port 7545
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Succès */}
// //               {contractAddress && (
// //                 <div className="mt-4 space-y-4">
// //                   {/* Adresse du contrat */}
// //                   <div className="bg-gray-50 rounded-lg p-4">
// //                     <div className="flex items-center justify-between mb-2">
// //                       <span className="text-xs font-medium text-gray-500">
// //                         Adresse du contrat
// //                       </span>
// //                       <button
// //                         onClick={copyToClipboard}
// //                         className="text-gray-400 hover:text-gray-600 transition-colors"
// //                       >
// //                         {copied ? (
// //                           <Check className="h-4 w-4 text-green-600" />
// //                         ) : (
// //                           <Copy className="h-4 w-4" />
// //                         )}
// //                       </button>
// //                     </div>
// //                     <code className="text-sm font-mono text-gray-900 break-all bg-white p-2 rounded border border-gray-200 block">
// //                       {contractAddress}
// //                     </code>
// //                     <p className="text-xs text-gray-500 mt-1">
// //                       {truncateAddress(contractAddress)}
// //                     </p>
// //                   </div>

// //                   {/* Configuration */}
// //                   <div className="bg-blue-50 rounded-lg p-3">
// //                     <p className="text-xs text-blue-800 font-medium mb-1">
// //                       Configuration mise à jour
// //                     </p>
// //                     <p className="text-xs text-blue-600 font-mono">
// //                       NEXT_PUBLIC_CONTRACT_ADDRESS={contractAddress}
// //                     </p>
// //                   </div>

// //                   {/* Sortie de déploiement */}
// //                   {deploymentOutput && (
// //                     <details className="text-left">
// //                       <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
// //                         Voir les détails du déploiement
// //                       </summary>
// //                       <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto max-h-40">
// //                         {deploymentOutput}
// //                       </pre>
// //                     </details>
// //                   )}
// //                 </div>
// //               )}
// //             </div>

// //             {/* Actions */}
// //             <div className="mt-6 flex gap-2">
// //               {error ? (
// //                 <button
// //                   onClick={() => {
// //                     setShowModal(false);
// //                     setError(null);
// //                   }}
// //                   className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
// //                 >
// //                   Fermer
// //                 </button>
// //               ) : contractAddress ? (
// //                 <>
// //                   <button
// //                     onClick={() => setShowModal(false)}
// //                     className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
// //                   >
// //                     Fermer
// //                   </button>
// //                   <button
// //                     onClick={checkContractStatus}
// //                     className="flex items-center justify-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
// //                   >
// //                     <RefreshCw className="h-4 w-4 mr-2" />
// //                     Vérifier
// //                   </button>
// //                 </>
// //               ) : (
// //                 <button
// //                   onClick={() => setShowModal(false)}
// //                   className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
// //                 >
// //                   Annuler
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
// // components/DeployContractButton.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   Box, 
//   Loader2, 
//   CheckCircle2, 
//   XCircle, 
//   AlertTriangle,
//   ExternalLink,
//   RefreshCw,
//   Copy,
//   Check,
//   Power,
//   Activity,
//   RotateCcw,
//   Trash2,
//   ShieldAlert
// } from 'lucide-react';

// export default function DeployContractButton() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [contractAddress, setContractAddress] = useState<string | null>(null);
//   const [previousAddress, setPreviousAddress] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [deploymentOutput, setDeploymentOutput] = useState<string>('');
//   const [copied, setCopied] = useState(false);
//   const [isCheckingStatus, setIsCheckingStatus] = useState(false);
//   const [showRedeployConfirm, setShowRedeployConfirm] = useState(false);
//   const [isRedeploying, setIsRedeploying] = useState(false);

//   // Vérifier l'état au chargement
//   useEffect(() => {
//     checkContractStatus();
//   }, []);

//   const checkContractStatus = async () => {
//     setIsCheckingStatus(true);
//     try {
//       const response = await fetch('/api/blockchain/deploy');
//       const data = await response.json();
      
//       if (data.isDeployed) {
//         setContractAddress(data.contractAddress);
//       }
//     } catch (error) {
//       console.error('Erreur vérification contrat:', error);
//     } finally {
//       setIsCheckingStatus(false);
//     }
//   };

//   const deployContract = async (isRedeploy: boolean = false) => {
//     setIsLoading(true);
//     if (isRedeploy) {
//       setIsRedeploying(true);
//       // Sauvegarder l'ancienne adresse
//       setPreviousAddress(contractAddress);
//     }
//     setError(null);
//     setDeploymentOutput('');
//     setShowModal(true);
//     setShowRedeployConfirm(false);

//     try {
//       const response = await fetch('/api/blockchain/deploy', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ redeploy: isRedeploy }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Erreur lors du déploiement');
//       }

//       setContractAddress(data.contractAddress);
//       setDeploymentOutput(data.output || 'Déploiement réussi');
//     } catch (err: any) {
//       setError(err.message || 'Erreur inconnue');
//       // Restaurer l'ancienne adresse en cas d'échec
//       if (isRedeploy) {
//         setContractAddress(previousAddress);
//       }
//     } finally {
//       setIsLoading(false);
//       setIsRedeploying(false);
//     }
//   };

//   const handleRedeploy = () => {
//     if (contractAddress) {
//       setShowRedeployConfirm(true);
//     }
//   };

//   const copyToClipboard = async () => {
//     if (contractAddress) {
//       await navigator.clipboard.writeText(contractAddress);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const truncateAddress = (address: string) => {
//     return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
//   };

//   return (
//     <>
//       <div className="flex items-center space-x-1">
//         {/* Bouton principal de déploiement */}
//         <button
//           onClick={() => contractAddress ? handleRedeploy() : deployContract(false)}
//           disabled={isLoading}
//           title={contractAddress ? 'Redéployer le contrat' : 'Déployer le contrat'}
//           className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
//             contractAddress
//               ? 'text-green-600 bg-green-50 hover:bg-green-100'
//               : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
//           } disabled:opacity-50 disabled:cursor-not-allowed`}
//         >
//           {isLoading ? (
//             <Loader2 className="h-5 w-5 animate-spin" />
//           ) : isCheckingStatus ? (
//             <Activity className="h-5 w-5 animate-pulse" />
//           ) : contractAddress ? (
//             <CheckCircle2 className="h-5 w-5" />
//           ) : (
//             <Box className="h-5 w-5" />
//           )}
//           {contractAddress && (
//             <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
//           )}
//         </button>

//         {/* Bouton de redéploiement (visible seulement si contrat déployé) */}
//         {contractAddress && (
//           <button
//             onClick={handleRedeploy}
//             disabled={isLoading}
//             title="Redéployer le contrat"
//             className="inline-flex items-center px-2 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RotateCcw className="h-4 w-4" />
//           </button>
//         )}
//       </div>

//       {/* Modal de confirmation de redéploiement */}
//       {showRedeployConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div 
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={() => setShowRedeployConfirm(false)}
//           />
          
//           <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-10 animate-in fade-in zoom-in">
//             <div className="text-center">
//               <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
//                 <ShieldAlert className="h-8 w-8 text-orange-600" />
//               </div>
              
//               <h3 className="mt-4 text-lg font-semibold text-gray-900">
//                 Redéployer le contrat ?
//               </h3>
              
//               <div className="mt-4 space-y-3 text-left">
//                 <div className="bg-orange-50 rounded-lg p-3">
//                   <p className="text-sm text-orange-800 font-medium flex items-center">
//                     <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
//                     Attention
//                   </p>
//                   <p className="text-xs text-orange-600 mt-1">
//                     Le redéploiement créera un nouveau contrat avec une nouvelle adresse. 
//                     L'ancien contrat ne sera plus utilisé.
//                   </p>
//                 </div>

//                 {contractAddress && (
//                   <div className="bg-gray-50 rounded-lg p-3">
//                     <p className="text-xs text-gray-500 font-medium mb-1">
//                       Contrat actuel
//                     </p>
//                     <code className="text-xs font-mono text-gray-700 break-all">
//                       {contractAddress}
//                     </code>
//                     <p className="text-xs text-gray-400 mt-1">
//                       {truncateAddress(contractAddress)}
//                     </p>
//                   </div>
//                 )}

//                 <div className="bg-blue-50 rounded-lg p-3">
//                   <p className="text-xs text-blue-800">
//                     Un nouveau contrat sera déployé et l'adresse sera mise à jour 
//                     automatiquement dans le fichier .env.local
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-6 flex gap-3">
//                 <button
//                   onClick={() => setShowRedeployConfirm(false)}
//                   className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   onClick={() => deployContract(true)}
//                   className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
//                 >
//                   <RotateCcw className="h-4 w-4 mr-2" />
//                   Redéployer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal de déploiement */}
//       {showModal && !showRedeployConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           {/* Overlay */}
//           <div 
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={() => setShowModal(false)}
//           />
          
//           {/* Modal */}
//           <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 z-10 animate-in fade-in zoom-in">
//             <div className="text-center">
//               {/* Icône de statut */}
//               <div className="mx-auto">
//                 {isLoading ? (
//                   <div className="relative h-16 w-16 mx-auto">
//                     <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <div className={`h-6 w-6 rounded-full animate-ping ${
//                         isRedeploying ? 'bg-orange-600' : 'bg-purple-600'
//                       }`} />
//                     </div>
//                   </div>
//                 ) : error ? (
//                   <div className="h-16 w-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
//                     <XCircle className="h-8 w-8 text-red-600" />
//                   </div>
//                 ) : contractAddress ? (
//                   <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
//                     <CheckCircle2 className="h-8 w-8 text-green-600" />
//                   </div>
//                 ) : null}
//               </div>

//               {/* Titre */}
//               <h3 className="mt-4 text-lg font-semibold text-gray-900">
//                 {isLoading ? (
//                   isRedeploying ? 'Redéploiement en cours...' : 'Déploiement en cours...'
//                 ) : error ? 'Erreur de déploiement' :
//                  contractAddress ? (
//                    isRedeploying ? 'Contrat redéployé !' : 'Contrat déployé !'
//                  ) : 'Déployer le contrat'}
//               </h3>

//               {/* Message de statut */}
//               {isLoading && (
//                 <>
//                   <p className="mt-2 text-sm text-gray-500">
//                     {isRedeploying 
//                       ? 'Création d\'un nouveau contrat sur Ganache...'
//                       : 'Compilation et déploiement sur Ganache...'
//                     }
//                   </p>
//                   <div className="mt-4 space-y-2">
//                     <div className={`flex items-center justify-center space-x-2 text-sm ${
//                       isRedeploying ? 'text-orange-600' : 'text-purple-600'
//                     }`}>
//                       <RefreshCw className="h-4 w-4 animate-spin" />
//                       <span>Connexion à Ganache...</span>
//                     </div>
//                     <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
//                       <Box className="h-4 w-4" />
//                       <span>Compilation du contrat...</span>
//                     </div>
//                     <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
//                       <Activity className="h-4 w-4" />
//                       <span>Mise à jour de la configuration...</span>
//                     </div>
//                     {isRedeploying && (
//                       <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
//                         <Trash2 className="h-4 w-4" />
//                         <span>Remplacement de l'ancien contrat...</span>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}

//               {/* Erreur */}
//               {error && (
//                 <div className="mt-4 p-4 bg-red-50 rounded-lg">
//                   <div className="flex items-start">
//                     <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
//                     <div className="text-left">
//                       <p className="text-sm text-red-800">{error}</p>
//                       {error.includes('Ganache') && (
//                         <div className="mt-2 flex items-center text-xs text-red-600">
//                           <Power className="h-3 w-3 mr-1" />
//                           Vérifiez que Ganache est lancé sur le port 7545
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Succès */}
//               {contractAddress && !isLoading && (
//                 <div className="mt-4 space-y-4">
//                   {/* Comparaison des adresses si redéploiement */}
//                   {previousAddress && previousAddress !== contractAddress && (
//                     <div className="bg-yellow-50 rounded-lg p-3">
//                       <p className="text-xs text-yellow-800 font-medium mb-2">
//                         Adresse mise à jour
//                       </p>
//                       <div className="space-y-1">
//                         <div className="flex items-center text-xs">
//                           <span className="text-gray-500 w-16">Ancien:</span>
//                           <code className="text-gray-400 line-through font-mono">
//                             {truncateAddress(previousAddress)}
//                           </code>
//                         </div>
//                         <div className="flex items-center text-xs">
//                           <span className="text-green-600 w-16 font-medium">Nouveau:</span>
//                           <code className="text-green-600 font-mono font-medium">
//                             {truncateAddress(contractAddress)}
//                           </code>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Adresse du contrat */}
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-xs font-medium text-gray-500">
//                         {isRedeploying ? 'Nouvelle adresse du contrat' : 'Adresse du contrat'}
//                       </span>
//                       <button
//                         onClick={copyToClipboard}
//                         className="text-gray-400 hover:text-gray-600 transition-colors"
//                       >
//                         {copied ? (
//                           <Check className="h-4 w-4 text-green-600" />
//                         ) : (
//                           <Copy className="h-4 w-4" />
//                         )}
//                       </button>
//                     </div>
//                     <code className="text-sm font-mono text-gray-900 break-all bg-white p-2 rounded border border-gray-200 block">
//                       {contractAddress}
//                     </code>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {truncateAddress(contractAddress)}
//                     </p>
//                   </div>

//                   {/* Configuration */}
//                   <div className="bg-blue-50 rounded-lg p-3">
//                     <p className="text-xs text-blue-800 font-medium mb-1">
//                       Configuration mise à jour
//                     </p>
//                     <p className="text-xs text-blue-600 font-mono">
//                       NEXT_PUBLIC_CONTRACT_ADDRESS={contractAddress}
//                     </p>
//                   </div>

//                   {/* Sortie de déploiement */}
//                   {deploymentOutput && (
//                     <details className="text-left">
//                       <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
//                         Voir les détails du déploiement
//                       </summary>
//                       <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto max-h-40">
//                         {deploymentOutput}
//                       </pre>
//                     </details>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Actions */}
//             <div className="mt-6 flex gap-2">
//               {error && !contractAddress ? (
//                 <button
//                   onClick={() => {
//                     setShowModal(false);
//                     setError(null);
//                   }}
//                   className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                 >
//                   Fermer
//                 </button>
//               ) : contractAddress && !isLoading ? (
//                 <>
//                   <button
//                     onClick={() => setShowModal(false)}
//                     className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                   >
//                     Fermer
//                   </button>
//                   <button
//                     onClick={checkContractStatus}
//                     className="flex items-center justify-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
//                   >
//                     <RefreshCw className="h-4 w-4 mr-2" />
//                     Vérifier
//                   </button>
//                   <button
//                     onClick={handleRedeploy}
//                     className="flex items-center justify-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
//                   >
//                     <RotateCcw className="h-4 w-4 mr-2" />
//                     Redéployer
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                 >
//                   Annuler
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// components/DeployContractButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Power,
  Activity,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export default function DeployContractButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [previousAddress, setPreviousAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deploymentOutput, setDeploymentOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isRedeploying, setIsRedeploying] = useState(false);

  // Vérifier l'état au chargement
  useEffect(() => {
    checkContractStatus();
  }, []);

  const checkContractStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch('/api/blockchain/deploy');
      const data = await response.json();
      
      if (data.isDeployed) {
        setContractAddress(data.contractAddress);
      }
    } catch (error) {
      console.error('Erreur vérification contrat:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const deployContract = async (isRedeploy: boolean = false) => {
    setIsLoading(true);
    if (isRedeploy) {
      setIsRedeploying(true);
      setPreviousAddress(contractAddress);
    }
    setError(null);
    setDeploymentOutput('');

    try {
      const response = await fetch('/api/blockchain/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ redeploy: isRedeploy }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du déploiement');
      }

      setContractAddress(data.contractAddress);
      setDeploymentOutput(data.output || 'Déploiement réussi');
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      if (isRedeploy) {
        setContractAddress(previousAddress);
      }
    } finally {
      setIsLoading(false);
      setIsRedeploying(false);
    }
  };

  const copyToClipboard = async () => {
    if (contractAddress) {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {/* Bouton principal */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        title={contractAddress ? 'Contrat déployé' : 'Déployer le contrat'}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
          contractAddress
            ? 'text-green-600 bg-green-50 hover:bg-green-100'
            : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isCheckingStatus ? (
          <Activity className="h-5 w-5 animate-pulse" />
        ) : contractAddress ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Box className="h-5 w-5" />
        )}
        {contractAddress && (
          <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Modal principal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative overflow-auto bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 z-10 animate-in fade-in zoom-in">
            <div className="text-center">
              {/* Icône de statut */}
              <div className="mx-auto">
                {isLoading ? (
                  <div className="relative h-16 w-16 mx-auto">
                    <Loader2 className={`h-16 w-16 animate-spin ${
                      isRedeploying ? 'text-orange-600' : 'text-purple-600'
                    }`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`h-6 w-6 rounded-full animate-ping ${
                        isRedeploying ? 'bg-orange-600' : 'bg-purple-600'
                      }`} />
                    </div>
                  </div>
                ) : error ? (
                  <div className="h-16 w-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                ) : contractAddress && !isLoading ? (
                  <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                ) : (
                  <div className="h-16 w-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <Box className="h-8 w-8 text-purple-600" />
                  </div>
                )}
              </div>

              {/* Titre */}
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {isLoading ? (
                  isRedeploying ? 'Redéploiement en cours...' : 'Déploiement en cours...'
                ) : error ? 'Erreur de déploiement' :
                 contractAddress && !isLoading ? (
                   isRedeploying ? 'Contrat redéployé !' : 'Contrat déployé !'
                 ) : 'Gestion du contrat'}
              </h3>

              {/* Statut actuel si pas en chargement */}
              {!isLoading && !error && (
                <p className="mt-2 text-sm text-gray-500">
                  {contractAddress 
                    ? 'Le contrat est déployé et opérationnel'
                    : 'Aucun contrat déployé pour le moment'}
                </p>
              )}

              {/* Message de chargement */}
              {isLoading && (
                <>
                  <p className="mt-2 text-sm text-gray-500">
                    {isRedeploying 
                      ? 'Création d\'un nouveau contrat sur Ganache...'
                      : 'Compilation et déploiement sur Ganache...'
                    }
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className={`flex items-center justify-center space-x-2 text-sm ${
                      isRedeploying ? 'text-orange-600' : 'text-purple-600'
                    }`}>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Connexion à Ganache...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <Box className="h-4 w-4" />
                      <span>Compilation du contrat...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <Activity className="h-4 w-4" />
                      <span>Mise à jour de la configuration...</span>
                    </div>
                  </div>
                </>
              )}

              {/* Erreur */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm text-red-800">{error}</p>
                      {error.includes('Ganache') && (
                        <div className="mt-2 flex items-center text-xs text-red-600">
                          <Power className="h-3 w-3 mr-1" />
                          Vérifiez que Ganache est lancé sur le port 7545
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Succès - Informations du contrat */}
              {contractAddress && !isLoading && (
                <div className="mt-4 space-y-4">
                  {/* Comparaison des adresses si redéploiement */}
                  {previousAddress && previousAddress !== contractAddress && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <RotateCcw className="h-4 w-4 text-yellow-600 mr-2" />
                        <p className="text-xs text-yellow-800 font-medium">
                          Contrat redéployé
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <span className="text-gray-500 w-16">Ancien:</span>
                          <code className="text-gray-400 line-through font-mono">
                            {truncateAddress(previousAddress)}
                          </code>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className="text-green-600 w-16 font-medium">Nouveau:</span>
                          <code className="text-green-600 font-mono font-medium">
                            {truncateAddress(contractAddress)}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Adresse du contrat */}
                  {/* <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        Adresse du contrat
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copier l'adresse"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <code className="text-sm font-mono text-gray-900 break-all bg-white p-2 rounded border border-gray-200 block">
                      {contractAddress}
                    </code>
                  </div> */}

                  {/* Configuration */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium mb-1">
                      Variable d'environnement
                    </p>
                    <p className="text-xs text-blue-600 font-mono">
                      NEXT_PUBLIC_CONTRACT_ADDRESS={contractAddress}
                    </p>
                  </div>

                  {/* Sortie de déploiement */}
                  {deploymentOutput && (
                    <details className="text-left">
                      <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                        Voir les détails du déploiement
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto max-h-40">
                        {deploymentOutput}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Actions dans le modal */}
            <div className="mt-6 space-y-3">
              {/* Boutons d'action selon l'état */}
              {error && !contractAddress ? (
                <>
                  <button
                    onClick={() => deployContract(false)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <Box className="h-4 w-4 mr-2" />
                    Réessayer le déploiement
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </>
              ) : contractAddress && !isLoading ? (
                <>
                  {/* Bouton Redéployer */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-start mb-2">
                      <ShieldAlert className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-orange-800">
                        Le redéploiement créera un nouveau contrat avec une nouvelle adresse
                      </p>
                    </div>
                    <button
                      onClick={() => deployContract(true)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-orange-700 bg-white border border-orange-300 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Redéployer le contrat
                    </button>
                  </div>

                  {/* Bouton Vérifier */}
                  <button
                    onClick={checkContractStatus}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vérifier le statut
                  </button>

                  {/* Bouton Fermer */}
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </>
              ) : !contractAddress && !isLoading && !error ? (
                <>
                  <button
                    onClick={() => deployContract(false)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-lg shadow-purple-600/20"
                  >
                    <Box className="h-4 w-4 mr-2" />
                    Déployer le contrat
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}