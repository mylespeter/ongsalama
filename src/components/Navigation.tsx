
// components/Navigation.tsx
'use client';

import { LogOut, User as UserIcon, Menu, X, Home, Users, Stethoscope, FlaskConical, Pill, BarChart3, ClipboardList, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

// Définition des menus par rôle pour ONG Salama
const menuConfig = {
  accueil: [
    { href: '/dashboard/accueil', label: 'Accueil', icon: Home, tooltip: 'Tableau de bord' },
    // { href: '/dashboard/accueil/patients', label: 'Patients', icon: Users, tooltip: 'Gérer les patients' },
    // { href: '/dashboard/accueil/enregistrement', label: 'Enregistrement', icon: ClipboardList, tooltip: 'Nouveau patient' },
  ],
  consultation: [
    { href: '/dashboard/consultation', label: 'Consultation', icon: Stethoscope, tooltip: 'Tableau de bord' },
    // { href: '/dashboard/consultation/patients', label: 'Patients', icon: Users, tooltip: 'Liste des patients' },
    // { href: '/dashboard/consultation/diagnostics', label: 'Diagnostics', icon: ClipboardList, tooltip: 'Mes diagnostics' },
  ],
  laboratoire: [
    { href: '/dashboard/laboratoire', label: 'Laboratoire', icon: FlaskConical, tooltip: 'Tableau de bord' },
    // { href: '/dashboard/laboratoire/examens', label: 'Examens', icon: ClipboardList, tooltip: 'Liste des examens' },
    // { href: '/dashboard/laboratoire/resultats', label: 'Résultats', icon: BarChart3, tooltip: 'Saisir résultats' },
  ],
  pharmacie: [
    { href: '/dashboard/pharmacie', label: 'Pharmacie', icon: Pill, tooltip: 'Tableau de bord' },
    // { href: '/dashboard/pharmacie/prescriptions', label: 'Prescriptions', icon: ClipboardList, tooltip: 'Liste des prescriptions' },
    // { href: '/dashboard/pharmacie/medicaments', label: 'Médicaments', icon: Pill, tooltip: 'Gérer les stocks' },
  ],
  administration: [
    { href: '/dashboard/administration', label: 'Dashboard', icon: Home, tooltip: 'Tableau de bord' },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, tooltip: 'Gérer les utilisateurs' },
    { href: '/dashboard/administration/stats', label: 'Statistiques', icon: BarChart3, tooltip: 'Voir les stats' },
  ],
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [pathname]);

  const getNavItems = () => {
    if (!user) return [];
    return menuConfig[user.role as keyof typeof menuConfig] || [];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'accueil': 'Agent d\'accueil',
      'consultation': 'Médecin consultant',
      'laboratoire': 'Laborantin',
      'pharmacie': 'Pharmacien',
      'administration': 'Administrateur'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'accueil': 'bg-teal-50 text-teal-700 border-teal-200',
      'consultation': 'bg-blue-50 text-blue-700 border-blue-200',
      'laboratoire': 'bg-purple-50 text-purple-700 border-purple-200',
      'pharmacie': 'bg-green-50 text-green-700 border-green-200',
      'administration': 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return colors[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getRoleBgColor = (role: string) => {
    const colors: Record<string, string> = {
      'accueil': 'bg-gradient-to-br from-teal-500 to-teal-600',
      'consultation': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'laboratoire': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'pharmacie': 'bg-gradient-to-br from-green-500 to-green-600',
      'administration': 'bg-gradient-to-br from-amber-500 to-amber-600'
    };
    return colors[role] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <nav className="bg-white border- border-gray-200 shadow-s sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Partie gauche : Logo et Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href={`/dashboard/${user.role}`} className="flex items-center space-x-3 group">
                 <img src='/logo.png' className='w-auto h-12'/>
                  <div className="hidden sm:block">
                    <span className="font-bold text-gray-900 text-lg">ONG Salama</span>
                    <p className="text-xs text-gray-500 -mt-0.5">Système de gestion médicale</p>
                  </div>
                </Link>
              </div>
              
              {/* Navigation desktop - Indicateur simplifié */}
              <div className="hidden sm:ml-8 lg:ml-10 sm:flex sm:items-center sm:space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.tooltip}
                      className={`relative inline-flex items-center px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-secondary bg-secondary/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`mr-2 h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-secondary' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      <span className="hidden lg:inline">{item.label}</span>
                      
                      {/* Indicateur simple - juste un point */}
                      {isActive && (
                        <span className="absolute bottom-0  left-1/2 transform -translate-x-1/2 w-1/2  h-1 bg-secondary rounded-"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Partie droite : Utilisateur */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Bouton mobile */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Menu utilisateur */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  {/* Avatar avec photo de profil ronde */}
                  <div className="relative">
                    {user.photo_profil ? (
                      <img 
                        src={user.photo_profil} 
                        alt={user.username} 
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 ${getRoleBgColor(user.role)} rounded-full shadow-sm`}>
                        <UserIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                  
                  <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Menu déroulant */}
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      {/* En-tête du menu avec photo de profil */}
                      <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          {user.photo_profil ? (
                            <img 
                              src={user.photo_profil} 
                              alt={user.username} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className={`flex items-center justify-center w-12 h-12 ${getRoleBgColor(user.role)} rounded-full shadow-sm`}>
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.matricule}</p>
                            {user.telephone && <p className="text-xs text-gray-400 mt-0.5">{user.telephone}</p>}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${getRoleColor(user.role)}`}>
                            <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5"></span>
                            {getRoleLabel(user.role)}
                          </span>
                          <span className="inline-flex items-center text-xs text-green-600">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                            En ligne
                          </span>
                        </div>
                      </div>
                      
                      {/* Liens du menu */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center group transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">Mon profil</p>
                            <p className="text-xs text-gray-400">Gérer mes informations</p>
                          </div>
                        </Link>
                        
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center group transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">Déconnexion</p>
                              <p className="text-xs text-red-400">Se déconnecter du système</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {showMobileMenu && (
          <div className="sm:hidden fixed inset-0 z-30">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto animate-in slide-in-from-left duration-300">
              <div className="p-6">
                {/* En-tête mobile */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold">OS</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">ONG Salama</p>
                      <p className="text-xs text-gray-500">Menu de navigation</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMobileMenu(false)} 
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation mobile */}
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-primary/5 text-primary' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-200 ${
                          isActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.tooltip}</p>
                        </div>
                        
                        {/* Simple flèche pour la navigation */}
                        <ChevronDown className={`w-4 h-4 text-gray-300 -rotate-90 transition-transform ${isActive ? 'text-primary' : ''}`} />
                      </Link>
                    );
                  })}
                </div>

                {/* Profil utilisateur mobile avec photo de profil */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4 px-3">
                    {user.photo_profil ? (
                      <img 
                        src={user.photo_profil} 
                        alt={user.username} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className={`flex items-center justify-center w-12 h-12 ${getRoleBgColor(user.role)} rounded-full shadow-sm`}>
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.matricule}</p>
                    </div>
                  </div>
                  
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors" 
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-3">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    Mon profil
                  </Link>
                  
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-3">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}