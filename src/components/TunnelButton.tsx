// // // components/TunnelButton.tsx
// // 'use client';

// // import { useState } from 'react';
// // import { Globe, Loader2, ExternalLink, Copy, Check } from 'lucide-react';

// // export default function TunnelButton() {
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
// //   const [error, setError] = useState<string | null>(null);
// //   const [copied, setCopied] = useState(false);
// //   const [showModal, setShowModal] = useState(false);

// //   const createTunnel = async () => {
// //     setIsLoading(true);
// //     setError(null);
// //     setTunnelUrl(null);

// //     try {
// //       // Appel à l'API route Next.js qui va lancer cloudflared
// //       const response = await fetch('/api/tunnel', {
// //         method: 'POST',
// //       });

// //       if (!response.ok) {
// //         const data = await response.json();
// //         throw new Error(data.error || 'Erreur lors de la création du tunnel');
// //       }

// //       const data = await response.json();
// //       setTunnelUrl(data.url);
// //       setShowModal(true);
// //     } catch (err: any) {
// //       setError(err.message || 'Erreur inconnue');
// //       setShowModal(true);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const copyToClipboard = async () => {
// //     if (tunnelUrl) {
// //       await navigator.clipboard.writeText(tunnelUrl);
// //       setCopied(true);
// //       setTimeout(() => setCopied(false), 2000);
// //     }
// //   };

// //   return (
// //     <>
// //       {/* Bouton Globe */}
// //       <button
// //         onClick={createTunnel}
// //         disabled={isLoading}
// //         title="Créer un tunnel Cloudflare"
// //         className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //       >
// //         {isLoading ? (
// //           <Loader2 className="h-5 w-5 animate-spin" />
// //         ) : (
// //           <Globe className="h-5 w-5" />
// //         )}
// //         {tunnelUrl && (
// //           <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full" />
// //         )}
// //       </button>

// //       {/* Modal pour afficher l'URL du tunnel */}
// //       {showModal && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center">
// //           {/* Overlay */}
// //           <div 
// //             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
// //             onClick={() => setShowModal(false)}
// //           />
          
// //           {/* Modal */}
// //           <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-10 animate-in fade-in zoom-in">
// //             <div className="text-center">
// //               {isLoading ? (
// //                 <>
// //                   <Loader2 className="mx-auto h-12 w-12 text-green-600 animate-spin" />
// //                   <h3 className="mt-4 text-lg font-semibold text-gray-900">
// //                     Création du tunnel...
// //                   </h3>
// //                   <p className="mt-2 text-sm text-gray-500">
// //                     Cette opération peut prendre quelques secondes
// //                   </p>
// //                 </>
// //               ) : error ? (
// //                 <>
// //                   <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
// //                     <Globe className="h-6 w-6 text-red-600" />
// //                   </div>
// //                   <h3 className="mt-4 text-lg font-semibold text-gray-900">
// //                     Erreur
// //                   </h3>
// //                   <p className="mt-2 text-sm text-red-600">{error}</p>
// //                 </>
// //               ) : tunnelUrl ? (
// //                 <>
// //                   <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
// //                     <Globe className="h-6 w-6 text-green-600" />
// //                   </div>
// //                   <h3 className="mt-4 text-lg font-semibold text-gray-900">
// //                     Tunnel créé avec succès !
// //                   </h3>
                  
// //                   {/* URL du tunnel */}
// //                   <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
// //                     <p className="text-sm font-mono text-gray-700 break-all">
// //                       {tunnelUrl}
// //                     </p>
// //                   </div>

// //                   {/* Actions */}
// //                   <div className="mt-4 flex gap-2 justify-center">
// //                     <button
// //                       onClick={copyToClipboard}
// //                       className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
// //                     >
// //                       {copied ? (
// //                         <>
// //                           <Check className="h-4 w-4 mr-2 text-green-600" />
// //                           Copié !
// //                         </>
// //                       ) : (
// //                         <>
// //                           <Copy className="h-4 w-4 mr-2" />
// //                           Copier
// //                         </>
// //                       )}
// //                     </button>
                    
// //                     <a
// //                       href={tunnelUrl}
// //                       target="_blank"
// //                       rel="noopener noreferrer"
// //                       className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
// //                     >
// //                       <ExternalLink className="h-4 w-4 mr-2" />
// //                       Ouvrir
// //                     </a>
// //                   </div>
// //                 </>
// //               ) : null}
// //             </div>

// //             {/* Bouton fermer */}
// //             <button
// //               onClick={() => setShowModal(false)}
// //               className="mt-6 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
// //             >
// //               Fermer
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }


// // components/TunnelButton.tsx
// 'use client';

// import { useState } from 'react';
// import { Globe, Loader2, ExternalLink, Copy, Check, AlertCircle, Wrench, Download } from 'lucide-react';

// export default function TunnelButton() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [errorInstructions, setErrorInstructions] = useState<any>(null);
//   const [copied, setCopied] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [statusMessage, setStatusMessage] = useState<string>('');

//   const createTunnel = async () => {
//     setIsLoading(true);
//     setError(null);
//     setErrorInstructions(null);
//     setTunnelUrl(null);
//     setStatusMessage('Vérification de cloudflared...');

//     try {
//       // Petit délai pour montrer les messages de statut
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       setStatusMessage('Création du tunnel...');
      
//       const response = await fetch('/api/tunnel', {
//         method: 'POST',
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Vérifier si des instructions d'installation sont fournies
//         if (data.instructions) {
//           setErrorInstructions(data.instructions);
//           throw new Error(data.error);
//         }
//         throw new Error(data.error || 'Erreur lors de la création du tunnel');
//       }

//       setTunnelUrl(data.url);
//       setStatusMessage('');
//       setShowModal(true);
//     } catch (err: any) {
//       setError(err.message || 'Erreur inconnue');
//       setShowModal(true);
//     } finally {
//       setIsLoading(false);
//       setStatusMessage('');
//     }
//   };

//   const copyToClipboard = async () => {
//     if (tunnelUrl) {
//       await navigator.clipboard.writeText(tunnelUrl);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   return (
//     <>
//       {/* Bouton Globe */}
//       <button
//         onClick={createTunnel}
//         disabled={isLoading}
//         title="Créer un tunnel Cloudflare"
//         className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
//       >
//         {isLoading ? (
//           <Loader2 className="h-5 w-5 animate-spin" />
//         ) : (
//           <Globe className="h-5 w-5" />
//         )}
//         {tunnelUrl && !isLoading && (
//           <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
//         )}
//         {/* Tooltip de statut pendant le chargement */}
//         {isLoading && statusMessage && (
//           <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
//             {statusMessage}
//           </span>
//         )}
//       </button>

//       {/* Modal pour afficher l'URL du tunnel */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           {/* Overlay */}
//           <div 
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
//             onClick={() => setShowModal(false)}
//           />
          
//           {/* Modal */}
//           <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-10 animate-in fade-in zoom-in duration-200">
//             <div className="text-center">
//               {isLoading ? (
//                 <>
//                   <div className="relative mx-auto h-12 w-12">
//                     <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <div className="h-4 w-4 bg-green-600 rounded-full animate-ping" />
//                     </div>
//                   </div>
//                   <h3 className="mt-4 text-lg font-semibold text-gray-900">
//                     Configuration du tunnel
//                   </h3>
//                   <p className="mt-2 text-sm text-gray-500">
//                     {statusMessage || 'Cette opération peut prendre quelques secondes...'}
//                   </p>
//                   {/* Barre de progression animée */}
//                   <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
//                     <div className="h-full bg-green-600 rounded-full animate-progress" />
//                   </div>
//                 </>
//               ) : error ? (
//                 <>
//                   <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
//                     {errorInstructions ? (
//                       <Wrench className="h-6 w-6 text-orange-600" />
//                     ) : (
//                       <AlertCircle className="h-6 w-6 text-red-600" />
//                     )}
//                   </div>
//                   <h3 className="mt-4 text-lg font-semibold text-gray-900">
//                     {errorInstructions ? 'Installation requise' : 'Erreur'}
//                   </h3>
//                   <p className="mt-2 text-sm text-red-600">{error}</p>
                  
//                   {/* Instructions d'installation */}
//                   {errorInstructions && (
//                     <div className="mt-4 text-left">
//                       <h4 className="text-sm font-medium text-gray-900 mb-2">
//                         {errorInstructions.title}
//                       </h4>
//                       <ol className="list-decimal list-inside space-y-2">
//                         {errorInstructions.steps.map((step: string, index: number) => (
//                           <li key={index} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
//                             {step.includes('winget') || step.includes('choco') ? (
//                               <code className="text-green-700 bg-gray-100 px-1 py-0.5 rounded text-xs">
//                                 {step}
//                               </code>
//                             ) : step.includes('http') ? (
//                               <a 
//                                 href={step} 
//                                 target="_blank" 
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 hover:text-blue-800 underline"
//                               >
//                                 {step}
//                               </a>
//                             ) : (
//                               step
//                             )}
//                           </li>
//                         ))}
//                       </ol>
                      
//                       {/* Bouton pour réessayer après installation */}
//                       <button
//                         onClick={() => {
//                           setShowModal(false);
//                           // Petit délai avant de réessayer
//                           setTimeout(() => createTunnel(), 500);
//                         }}
//                         className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
//                       >
//                         <Download className="h-4 w-4 mr-2" />
//                         Réessayer après installation
//                       </button>
//                     </div>
//                   )}
//                 </>
//               ) : tunnelUrl ? (
//                 <>
//                   <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
//                     <Globe className="h-6 w-6 text-green-600" />
//                   </div>
//                   <h3 className="mt-4 text-lg font-semibold text-gray-900">
//                     Tunnel créé avec succès !
//                   </h3>
                  
//                   {/* Message de succès */}
//                   <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
//                     Connecté
//                   </div>
                  
//                   {/* URL du tunnel */}
//                   <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-xs font-medium text-gray-500">URL publique</span>
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
//                     <p className="text-sm font-mono text-gray-700 break-all bg-white p-2 rounded border border-gray-100">
//                       {tunnelUrl}
//                     </p>
//                   </div>

//                   {/* Actions */}
//                   <div className="mt-4 flex gap-2 justify-center">
//                     <button
//                       onClick={copyToClipboard}
//                       className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//                     >
//                       {copied ? (
//                         <>
//                           <Check className="h-4 w-4 mr-2 text-green-600" />
//                           Copié !
//                         </>
//                       ) : (
//                         <>
//                           <Copy className="h-4 w-4 mr-2" />
//                           Copier
//                         </>
//                       )}
//                     </button>
                    
//                     <a
//                       href={tunnelUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
//                     >
//                       <ExternalLink className="h-4 w-4 mr-2" />
//                       Ouvrir
//                     </a>
//                   </div>
//                 </>
//               ) : null}
//             </div>

//             {/* Bouton fermer */}
//             <button
//               onClick={() => {
//                 setShowModal(false);
//                 setError(null);
//                 setErrorInstructions(null);
//               }}
//               className="mt-6 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               Fermer
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
// components/TunnelButton.tsx - Mise à jour
'use client';

import { useState, useEffect } from 'react';
import { Globe, Loader2, ExternalLink, Copy, Check, AlertCircle, Wrench, RefreshCw } from 'lucide-react';

export default function TunnelButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorInstructions, setErrorInstructions] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [tunnelStatus, setTunnelStatus] = useState<any>(null);

  // Vérifier l'état du tunnel au chargement
  useEffect(() => {
    checkTunnelStatus();
  }, []);

  const checkTunnelStatus = async () => {
    try {
      const response = await fetch('/api/tunnel');
      const data = await response.json();
      if (data.active) {
        setTunnelUrl(data.url);
        setTunnelStatus(data);
      }
    } catch (error) {
      // Ignorer les erreurs silencieusement
    }
  };

  const createTunnel = async () => {
    setIsLoading(true);
    setError(null);
    setErrorInstructions(null);
    setTunnelUrl(null);
    setStatusMessage('Vérification de cloudflared...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatusMessage('Création du tunnel...');
      
      const response = await fetch('/api/tunnel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.instructions) {
          setErrorInstructions(data.instructions);
          throw new Error(data.error);
        }
        throw new Error(data.error || 'Erreur lors de la création du tunnel');
      }

      setTunnelUrl(data.url);
      setTunnelStatus(data);
      setStatusMessage('');
      
      // Message de succès
      if (data.status === 'active') {
        console.log('✅ Tunnel actif:', data.url);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
      setShowModal(true);
    }
  };

  const stopTunnel = async () => {
    try {
      const response = await fetch('/api/tunnel', { method: 'DELETE' });
      const data = await response.json();
      setTunnelUrl(null);
      setTunnelStatus(null);
      setError(null);
    } catch (err: any) {
      setError('Erreur lors de l\'arrêt du tunnel');
    }
  };

  const copyToClipboard = async () => {
    if (tunnelUrl) {
      await navigator.clipboard.writeText(tunnelUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <>
      <div className="flex items-center space-x-1">
        {/* Bouton principal */}
        <button
          onClick={() => tunnelUrl ? setShowModal(true) : createTunnel()}
          disabled={isLoading}
          title={tunnelUrl ? 'Tunnel actif' : 'Créer un tunnel Cloudflare'}
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
            tunnelUrl
              ? 'text-green-600 bg-green-50 hover:bg-green-100'
              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Globe className="h-5 w-5" />
          )}
          {tunnelUrl && (
            <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Bouton arrêter si tunnel actif */}
        {tunnelUrl && (
          <button
            onClick={stopTunnel}
            title="Arrêter le tunnel"
            className="inline-flex items-center px-2 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <AlertCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-10 animate-in fade-in zoom-in">
            <div className="text-center">
              {isLoading ? (
                <>
                  <Loader2 className="mx-auto h-12 w-12 text-green-600 animate-spin" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Configuration du tunnel
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{statusMessage}</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full animate-progress" />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Première connexion : le DNS peut prendre quelques secondes à se propager
                  </p>
                </>
              ) : error ? (
                <>
                  <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    {errorInstructions ? (
                      <Wrench className="h-6 w-6 text-orange-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {errorInstructions ? 'Installation requise' : 'Erreur'}
                  </h3>
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                  
                  {errorInstructions && (
                    <div className="mt-4 text-left">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {errorInstructions.title}
                      </h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {errorInstructions.steps.map((step: string, index: number) => (
                          <li key={index} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                            {step.includes('winget') || step.includes('choco') ? (
                              <code className="text-green-700 bg-gray-100 px-1 py-0.5 rounded text-xs">{step}</code>
                            ) : step.includes('http') ? (
                              <a href={step} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{step}</a>
                            ) : step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setTimeout(() => createTunnel(), 500);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 inline mr-2" />
                      Réessayer
                    </button>
                  </div>
                </>
              ) : tunnelUrl ? (
                <>
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Tunnel actif
                  </h3>
                  
                  {tunnelStatus?.uptime && (
                    <p className="text-xs text-gray-500 mt-1">
                      En ligne depuis {formatUptime(tunnelStatus.uptime)}
                    </p>
                  )}
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">URL publique</span>
                      <button onClick={copyToClipboard} className="text-gray-400 hover:text-gray-600">
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-sm font-mono text-gray-700 break-all bg-white p-2 rounded border">
                      {tunnelUrl}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                    
                    <a
                      href={tunnelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir
                    </a>
                  </div>

                  <button
                    onClick={stopTunnel}
                    className="mt-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Arrêter le tunnel
                  </button>
                </>
              ) : null}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}