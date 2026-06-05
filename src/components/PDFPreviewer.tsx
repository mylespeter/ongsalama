
// // components/PDFPreviewer.tsx
// 'use client'

// import { useState } from 'react'

// interface PDFPreviewerProps {
//   fileUrl: string
//   fileName: string
//   onClose: () => void
// }

// export default function PDFPreviewer({ fileUrl, fileName, onClose }: PDFPreviewerProps) {
//   const [isLoaded, setIsLoaded] = useState(false)

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
//               <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-gray-800">
//                 {fileName}
//               </h2>
//               <p className="text-sm text-gray-500">
//                 Prévisualisation du document
//               </p>
//             </div>
//           </div>
          
//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
//             title="Fermer la prévisualisation"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Content - Utilisation simple d'un iframe */}
//         <div className="flex-1 overflow-hidden">
//           <iframe
//             src={fileUrl}
//             className="w-full h-full border-0"
//             onLoad={() => setIsLoaded(true)}
//             title={`Prévisualisation de ${fileName}`}
//           />
          
//           {!isLoaded && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <div className="text-center">
//                 <p className="text-gray-700 font-medium">Chargement du document</p>
//                 <p className="text-gray-500 text-sm">Veuillez patienter...</p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer avec informations */}
//         <div className="p-3 border-t border-gray-200 bg-gray-50">
//           <div className="flex justify-between items-center text-sm text-gray-600">
//             <span>
//               Le document s'ouvre dans une visionneuse PDF intégrée
//             </span>
//             {isLoaded && (
//               <span className="flex items-center space-x-1">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <span>Document chargé</span>
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// components/PDFPreviewer.tsx
'use client'

import { useState } from 'react'

interface PDFPreviewerProps {
  fileUrl: string
  fileName: string
  onClose: () => void
}

export default function PDFPreviewer({ fileUrl, fileName, onClose }: PDFPreviewerProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {fileName}
              </h2>
              <p className="text-sm text-gray-500">
                Prévisualisation du document
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
            title="Fermer la prévisualisation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Utilisation simple d'un iframe */}
        <div className="flex-1 overflow-hidden relative">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoaded(true)}
            title={`Prévisualisation de ${fileName}`}
          />
          
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <p className="text-gray-700 font-medium">Chargement du document</p>
                <p className="text-gray-500 text-sm">Veuillez patienter...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec informations */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-sm text-gray-600">
            <p>Le document s'ouvre dans la visionneuse PDF de votre navigateur</p>
          </div>
        </div>
      </div>
    </div>
  )
}