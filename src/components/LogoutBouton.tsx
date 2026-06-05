// 'use client';

// import { LogOut } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// export function LogoutButton() {
//   const router = useRouter();

//   const handleLogout = async () => {
//     try {
//       const response = await fetch('/api/auth', {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         router.push('/auth/login');
//         router.refresh(); // Rafraîchir les données de session
//       }
//     } catch (error) {
//       console.error('Erreur de déconnexion:', error);
//     }
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="flex items-center gap-2 w-full text-left text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
//     >
//       <LogOut size={14} />
//       <span>Déconnexion</span>
//     </button>
//   );
// }
'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return; // Empêcher les clics multiples
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth', {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/auth/login');
        router.refresh(); // Rafraîchir les données de session
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 w-full text-left text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="loader-small"></div>
          <span>Déconnexion...</span>
        </>
      ) : (
        <>
          <LogOut size={14} />
          <span>Déconnexion</span>
        </>
      )}
      
      <style jsx>{`
        .loader-small {
          width: 14px;
          height: 14px;
          display: grid;
          border-radius: 50%;
          background:
            linear-gradient(0deg, rgb(220 38 38 / 50%) 30%, #0000 0 70%, rgb(220 38 38 / 100%) 0) 50% / 8% 100%,
            linear-gradient(90deg, rgb(220 38 38 / 25%) 30%, #0000 0 70%, rgb(220 38 38 / 75%) 0) 50% / 100% 8%;
          background-repeat: no-repeat;
          animation: l23 1s infinite steps(12);
        }
        
        .loader-small::before,
        .loader-small::after {
          content: "";
          grid-area: 1/1;
          border-radius: 50%;
          background: inherit;
          opacity: 0.915;
          transform: rotate(30deg);
        }
        
        .loader-small::after {
          opacity: 0.83;
          transform: rotate(60deg);
        }
        
        @keyframes l23 {
          100% {
            transform: rotate(1turn);
          }
        }
      `}</style>
    </button>
  );
}