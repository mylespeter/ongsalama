import React from 'react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
  numero: string; // Numéro au format international sans le +
  message?: string; // Message pré-rempli optionnel
  className?: string;
  children?: React.ReactNode;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  numero, 
  message = "", 
  className = "", 
  children 
}) => {
  // Nettoyer le numéro (enlever les espaces, tirets, etc.)
  const numeroPropre = numero.replace(/\D/g, '');
  
  // Construire l'URL WhatsApp
  const messageEncoded = message ? `?text=${encodeURIComponent(message)}` : '';
  const urlWhatsApp = `https://wa.me/${numeroPropre}${messageEncoded}`;

  return (
    <Link 
      href={urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center px-4 py-2 mt-3 bg-green-500 text-white w-max  mx-auto g hovr:bg-green-600 transition-colors duration-300 ${className}`}
    >
      {children || (
        <>
     <FaWhatsapp className="mr-2"/>
          <span>Deposer une reclamation via  Whatsapp</span>
        </>
      )}
    </Link>
  );
};

export default WhatsAppButton;