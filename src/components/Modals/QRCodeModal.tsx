

// // components/Modals/QRCodeModal.tsx - MODIFICATIONS
// 'use client';

// import { useState, useEffect } from 'react';
// import { FaTimes, FaDownload, FaCopy, FaCheck, FaPrint } from 'react-icons/fa';
// import { QrCode } from 'lucide-react';
// import QRCodeGenerator from '@/components/QRCodeGenerator';
// import { generateTraceabilityCode, generateQRData } from '@/lib/utils/traceability';
// import type { Lot } from '@/types';

// interface QRCodeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   lot: Lot;
// }

// export default function QRCodeModal({ isOpen, onClose, lot }: QRCodeModalProps) {
//   const [copied, setCopied] = useState(false);
//   const [copiedHash, setCopiedHash] = useState(false);
//   const [copiedCode, setCopiedCode] = useState(false);
//   const [qrValue, setQrValue] = useState('');
//   const [traceabilityCode, setTraceabilityCode] = useState('');

//   useEffect(() => {
//     if (isOpen && lot) {
//       document.body.style.overflow = 'hidden';
      
//       // ✅ Générer le code de traçabilité
//       const code = generateTraceabilityCode(lot);
//       setTraceabilityCode(code);
      
//       console.log('🔧 QRCodeModal - Code traçabilité généré:', code);
//       console.log('   Lot ID:', lot.id);
//       console.log('   Numero lot:', lot.numero_lot);
//       console.log('   Code unique:', lot.code_unique);
//       console.log('   Hash début:', lot.hash_lot?.substring(0, 10));
      
//       // ✅ Générer les données QR avec le code de traçabilité
//       const qrData = generateQRData(lot);
      
//       // ✅ Ajouter l'URL de vérification AVEC le code de traçabilité
//       qrData.verification_url = `${window.location.origin}/verify/${code}`;
//       qrData.traceability_code = code;
      
//       console.log('   QR Data:', qrData);
      
//       setQrValue(JSON.stringify(qrData));
//     } else {
//       document.body.style.overflow = 'unset';
//     }
    
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, lot]);

//   if (!isOpen) return null;

//   const handleCopy = async (text: string, type: 'code' | 'hash' | 'traceability') => {
//     try {
//       await navigator.clipboard.writeText(text);
//       if (type === 'code') {
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//       } else if (type === 'hash') {
//         setCopiedHash(true);
//         setTimeout(() => setCopiedHash(false), 2000);
//       } else {
//         setCopiedCode(true);
//         setTimeout(() => setCopiedCode(false), 2000);
//       }
//     } catch (err) {
//       console.error('Erreur copie:', err);
//     }
//   };

//   const handleDownloadQR = () => {
//     const qrImage = document.querySelector('#qr-code-image img') as HTMLImageElement;
    
//     if (qrImage && qrImage.src) {
//       const link = document.createElement('a');
//       link.download = `QR_${lot.numero_lot.replace(/\s+/g, '_')}.png`;
//       link.href = qrImage.src;
//       link.click();
//     }
//   };

//   const handlePrintQR = () => {
//     const qrImage = document.querySelector('#qr-code-image img') as HTMLImageElement;
    
//     if (qrImage && qrImage.src) {
//       const printWindow = window.open('', '_blank');
//       if (printWindow) {
//         printWindow.document.write(`
//           <!DOCTYPE html>
//           <html>
//             <head>
//               <title>QR Code - ${lot.numero_lot}</title>
//               <style>
//                 * { margin: 0; padding: 0; box-sizing: border-box; }
//                 body {
//                   display: flex;
//                   flex-direction: column;
//                   align-items: center;
//                   justify-content: center;
//                   min-height: 100vh;
//                   font-family: 'Courier New', monospace;
//                   background: white;
//                 }
//                 .qr-container {
//                   text-align: center;
//                   padding: 40px;
//                   border: 2px solid #000;
//                   background: white;
//                 }
//                 h2 {
//                   margin-bottom: 20px;
//                   font-size: 24px;
//                   font-weight: bold;
//                   text-transform: uppercase;
//                   color: #000;
//                 }
//                 .traceability-code {
//                   font-size: 18px;
//                   font-weight: bold;
//                   color: #166534;
//                   margin-bottom: 20px;
//                   letter-spacing: 2px;
//                 }
//                 .qr-code {
//                   padding: 20px;
//                   border: 1px solid #ccc;
//                   display: inline-block;
//                   margin-bottom: 20px;
//                 }
//                 .lot-info {
//                   margin-top: 20px;
//                   font-size: 14px;
//                   color: #333;
//                   text-align: left;
//                 }
//                 .lot-info p {
//                   margin: 5px 0;
//                 }
//                 .hash {
//                   font-size: 10px;
//                   color: #666;
//                   max-width: 350px;
//                   word-break: break-all;
//                   font-family: 'Courier New', monospace;
//                 }
//                 .verified {
//                   margin-top: 15px;
//                   padding: 10px;
//                   background: #f0fdf4;
//                   border: 1px solid #22c55e;
//                   color: #166534;
//                   font-weight: bold;
//                   text-transform: uppercase;
//                 }
//                 @media print {
//                   body { margin: 0; }
//                   .qr-container { border: 2px solid #000; }
//                 }
//               </style>
//             </head>
//             <body>
//               <div class="qr-container">
//                 <h2>${lot.medicament?.nom || 'Médicament'}</h2>
//                 <div class="traceability-code">${traceabilityCode}</div>
//                 <div class="qr-code">
//                   <img src="${qrImage.src}" alt="QR Code" width="300" height="300" />
//                 </div>
//                 <div class="lot-info">
//                   <p><strong>Lot N°:</strong> ${lot.numero_lot}</p>
//                   <p><strong>Code unique:</strong> ${lot.code_unique}</p>
//                   <p><strong>Fabrication:</strong> ${new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}</p>
//                   <p><strong>Expiration:</strong> ${new Date(lot.date_expiration).toLocaleDateString('fr-FR')}</p>
//                   <p><strong>Quantité:</strong> ${lot.quantite_totale} unités</p>
//                   <p class="hash"><strong>Hash:</strong><br/>${lot.hash_lot}</p>
//                 </div>
//                 <div class="verified">
//                   ✓ LOT VÉRIFIÉ ET AUTHENTIQUE
//                 </div>
//               </div>
//             </body>
//           </html>
//         `);
//         printWindow.document.close();
//         setTimeout(() => printWindow.print(), 100);
//       }
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       {/* Overlay */}
//       <div 
//         className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
//         onClick={onClose}
//       />
      
//       {/* Modal Content */}
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div 
//           className="relative w-full max-w-2xl bg-white shadow-2xl border"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between border-b bg-green-600 px-6 py-4">
//             <div className="flex items-center space-x-3">
//               <QrCode className="h-6 w-6 text-white" />
//               <div>
//                 <h3 className="text-xl font-bold text-white uppercase tracking-wider">
//                   QR Code du lot
//                 </h3>
//                 <p className="text-sm text-green-100">
//                   {lot.medicament?.nom}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:text-gray-200 transition-colors"
//             >
//               <FaTimes className="h-6 w-6" />
//             </button>
//           </div>

//           {/* Body */}
//           <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            
//             {/* ✅ CODE DE TRAÇABILITÉ EN ÉVIDENCE */}
//             <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
//               <div className="text-center">
//                 <p className="text-xs font-bold text-green-700 uppercase mb-1">
//                   Code de Traçabilité
//                 </p>
//                 <div className="flex items-center justify-center space-x-2">
//                   <span className="font-mono text-2xl font-bold text-green-800 tracking-widest">
//                     {traceabilityCode}
//                   </span>
//                   <button
//                     onClick={() => handleCopy(traceabilityCode, 'traceability')}
//                     className="p-2 text-green-600 hover:text-green-800 transition-colors"
//                     title="Copier le code de traçabilité"
//                   >
//                     {copiedCode ? (
//                       <FaCheck className="h-4 w-4 text-green-600" />
//                     ) : (
//                       <FaCopy className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//                 <p className="text-xs text-green-600 mt-2">
//                   URL: {window.location.origin}/verify/{traceabilityCode}
//                 </p>
//               </div>
//             </div>

//             {/* QR Code */}
//             <div className="flex justify-center mb-6">
//               <div className="p-4 bg-white border">
//                 <div id="qr-code-image">
//                   {qrValue && <QRCodeGenerator value={qrValue} size={250} />}
//                 </div>
//               </div>
//             </div>

//             {/* Informations du lot */}
//             <div className="space-y-3">
//               {/* Numéro de lot */}
//               <div className="border p-3">
//                 <div className="text-xs font-bold text-gray-600 uppercase mb-1">
//                   Numéro de lot
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="font-mono text-lg font-bold text-gray-900">
//                     {lot.numero_lot}
//                   </div>
//                   <button
//                     onClick={() => handleCopy(lot.numero_lot, 'code')}
//                     className="p-2 text-gray-600 hover:text-green-600 transition-colors"
//                     title="Copier le numéro de lot"
//                   >
//                     {copied ? (
//                       <FaCheck className="h-4 w-4 text-green-600" />
//                     ) : (
//                       <FaCopy className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Code unique */}
//               <div className="border p-3">
//                 <div className="text-xs font-bold text-gray-600 uppercase mb-1">
//                   Code unique
//                 </div>
//                 <div className="font-mono text-sm text-gray-700 break-all">
//                   {lot.code_unique}
//                 </div>
//               </div>

//               {/* Hash blockchain */}
//               <div className="border p-3">
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-xs font-bold text-gray-600 uppercase">
//                     Hash Blockchain
//                   </span>
//                   <button
//                     onClick={() => handleCopy(lot.hash_lot, 'hash')}
//                     className="text-gray-600 hover:text-green-600 transition-colors"
//                     title="Copier le hash"
//                   >
//                     {copiedHash ? (
//                       <FaCheck className="h-3 w-3 text-green-600" />
//                     ) : (
//                       <FaCopy className="h-3 w-3" />
//                     )}
//                   </button>
//                 </div>
//                 <div className="font-mono text-xs text-gray-700 break-all bg-gray-50 p-2 border">
//                   {lot.hash_lot}
//                 </div>
//               </div>

//               {/* Détails supplémentaires */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="border p-3">
//                   <div className="text-xs font-bold text-gray-600 uppercase mb-1">
//                     Date de fabrication
//                   </div>
//                   <div className="text-sm font-medium text-gray-900">
//                     {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
//                   </div>
//                 </div>
//                 <div className="border p-3">
//                   <div className="text-xs font-bold text-gray-600 uppercase mb-1">
//                     Date d'expiration
//                   </div>
//                   <div className={`text-sm font-medium ${
//                     new Date(lot.date_expiration) < new Date() 
//                       ? 'text-red-600' 
//                       : 'text-gray-900'
//                   }`}>
//                     {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
//                   </div>
//                 </div>
//               </div>

//               {/* Quantité */}
//               <div className="border p-3">
//                 <div className="text-xs font-bold text-gray-600 uppercase mb-1">
//                   Quantité totale
//                 </div>
//                 <div className="text-sm font-medium text-gray-900">
//                   {lot.quantite_totale.toLocaleString()} unités
//                 </div>
//               </div>

//               {/* Statut de vérification */}
//               <div className="border border-green-600 bg-green-50 p-3">
//                 <div className="flex items-center space-x-2">
//                   <FaCheck className="h-4 w-4 text-green-600" />
//                   <span className="text-sm font-bold text-green-900 uppercase">
//                     Lot vérifié et authentique
//                   </span>
//                 </div>
//                 <p className="text-xs text-green-700 mt-1">
//                   Scannez le QR code ou utilisez le code {traceabilityCode} pour vérifier
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50">
//             <button
//               type="button"
//               onClick={handlePrintQR}
//               className="px-6 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider bg-white border hover:bg-gray-100 transition-colors"
//             >
//               <FaPrint className="inline mr-2 h-4 w-4" />
//               Imprimer
//             </button>
//             <button
//               type="button"
//               onClick={handleDownloadQR}
//               className="px-6 py-3 text-sm font-bold text-white uppercase tracking-wider bg-green-600 border border-green-800 hover:bg-green-700 transition-colors"
//             >
//               <FaDownload className="inline mr-2 h-4 w-4" />
//               Télécharger QR Code
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// components/Modals/QRCodeModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaCopy, FaCheck, FaPrint } from 'react-icons/fa';
import { QrCode } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { generateTraceabilityCode } from '@/lib/utils/traceability';
import type { Lot } from '@/types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: Lot;
}

export default function QRCodeModal({ isOpen, onClose, lot }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [traceabilityCode, setTraceabilityCode] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  useEffect(() => {
    if (isOpen && lot) {
      document.body.style.overflow = 'hidden';
      
      // ✅ Générer le code de traçabilité
      const code = generateTraceabilityCode(lot);
      setTraceabilityCode(code);
      
      // ✅ Construire l'URL de vérification
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000';
      const url = `${baseUrl}/verify/${code}`;
      setVerificationUrl(url);
      
      // ✅ LE QR CODE CONTIENT DIRECTEMENT L'URL
      setQrValue(url);
      
      console.log('🔧 QR Code généré avec URL:', url);
      
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, lot]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(traceabilityCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const handleDownloadQR = () => {
    const qrImage = document.querySelector('#qr-code-image img') as HTMLImageElement;
    
    if (qrImage && qrImage.src) {
      const link = document.createElement('a');
      link.download = `QR_${lot.numero_lot.replace(/\s+/g, '_')}.png`;
      link.href = qrImage.src;
      link.click();
    }
  };

  const handlePrintQR = () => {
    const qrImage = document.querySelector('#qr-code-image img') as HTMLImageElement;
    
    if (qrImage && qrImage.src) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Code - ${lot.numero_lot}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  font-family: 'Courier New', monospace;
                  background: white;
                }
                .qr-container {
                  text-align: center;
                  padding: 40px;
                  border: 2px solid #000;
                  background: white;
                }
                h2 {
                  margin-bottom: 10px;
                  font-size: 24px;
                  font-weight: bold;
                  text-transform: uppercase;
                  color: #000;
                }
                .medicament {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 20px;
                }
                .qr-code {
                  padding: 20px;
                  border: 1px solid #ccc;
                  display: inline-block;
                  margin-bottom: 20px;
                }
                .info {
                  margin-top: 20px;
                  font-size: 14px;
                  color: #333;
                  text-align: left;
                }
                .info p {
                  margin: 5px 0;
                }
                .url {
                  font-size: 12px;
                  color: #166534;
                  margin-top: 15px;
                  word-break: break-all;
                }
                .verified {
                  margin-top: 15px;
                  padding: 10px;
                  background: #166534;
                  color: white;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                @media print {
                  body { margin: 0; }
                  .qr-container { border: 2px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>${lot.medicament?.nom || 'Médicament'}</h2>
                <div class="medicament">Lot: ${lot.numero_lot}</div>
                <div class="qr-code">
                  <img src="${qrImage.src}" alt="QR Code" width="300" height="300" />
                </div>
                <div class="info">
                  <p><strong>Code traçabilité:</strong> ${traceabilityCode}</p>
                  <p><strong>Fabrication:</strong> ${new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Expiration:</strong> ${new Date(lot.date_expiration).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Quantité:</strong> ${lot.quantite_totale} unités</p>
                </div>
                <div class="url">${verificationUrl}</div>
                <div class="verified">
                  ✓ SCANNEZ POUR VÉRIFIER
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 100);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-white shadow-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-green-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <QrCode className="h-6 w-6 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                  QR Code du lot
                </h3>
                <p className="text-sm text-green-100">
                  {lot.medicament?.nom}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            
            {/* ✅ MESSAGE EXPLICATIF */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-800">
                📱 Scannez ce QR code pour vérifier l'authenticité du lot
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
                <div id="qr-code-image">
                  {/* ✅ LE QR CONTIENT L'URL DIRECTE */}
                  {qrValue && <QRCodeGenerator value={qrValue} size={250} />}
                </div>
              </div>
            </div>

            {/* ✅ URL DE VÉRIFICATION */}
            <div className="mb-4 bg-gray-50 border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">URL de vérification :</p>
                  <p className="text-sm font-mono text-blue-600 truncate">
                    {verificationUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="ml-2 p-2 text-gray-500 hover:text-blue-600 flex-shrink-0"
                  title="Copier l'URL"
                >
                  {copiedUrl ? (
                    <FaCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <FaCopy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Code de traçabilité */}
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700 mb-1">Code de traçabilité :</p>
                  <p className="text-lg font-mono font-bold text-green-800">
                    {traceabilityCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2 text-green-600 hover:text-green-800"
                  title="Copier le code"
                >
                  {copied ? (
                    <FaCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <FaCopy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Informations du lot */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="border p-3">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                    Numéro de lot
                  </div>
                  <div className="font-mono text-sm font-bold text-gray-900">
                    {lot.numero_lot}
                  </div>
                </div>
                <div className="border p-3">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                    Quantité
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {lot.quantite_totale} unités
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border p-3">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                    Fabrication
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="border p-3">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                    Expiration
                  </div>
                  <div className={`text-sm font-medium ${
                    new Date(lot.date_expiration) < new Date() 
                      ? 'text-red-600' 
                      : 'text-gray-900'
                  }`}>
                    {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50">
            <button
              type="button"
              onClick={handlePrintQR}
              className="px-6 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider bg-white border hover:bg-gray-100 transition-colors"
            >
              <FaPrint className="inline mr-2 h-4 w-4" />
              Imprimer
            </button>
            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-6 py-3 text-sm font-bold text-white uppercase tracking-wider bg-green-600 border border-green-800 hover:bg-green-700 transition-colors"
            >
              <FaDownload className="inline mr-2 h-4 w-4" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}