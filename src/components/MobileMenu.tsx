
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, BotIcon, Activity, Headset, BookmarkCheck } from 'lucide-react'

import { 
  Home, 
  Upload,
  File,
  Search, 
Folder,
  Users, 
  Calendar, 
  Briefcase, 
  Network 
} from 'lucide-react'
import { FaThumbtack } from 'react-icons/fa'

import { RoleIcon } from './RoleIcon'
import ThemeSwitch from './ThemeSwitch'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { LogoutButton } from './LogoutBouton'
import Loader from './Loader'
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'
import { head } from 'lodash'

const iconMap = {
  home: Home,
  thumbtack: BookmarkCheck,
  upload: Upload,
  file: File,
  folder: Folder,
  search: Search,
  headset: Headset,
  users: Users,
  activity: Activity,
  calendar: Calendar,
  briefcase: Briefcase,
  network: Network,
  bot: BotIcon
} as const

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

interface MobileMenuProps {
  navigationLinks: Array<{
    href: string
    iconName: keyof typeof iconMap
    label: string
  }>
  user: {
    name: string
    email: string
    profil_url?: string | null
    role: string
  }
  styles: {
    bg: string
    text: string
    border: string
    dark: {
      bg: string
      text: string
      border: string
    }
  }
  currentRole: {
    label: string
    color: string
  }
}

export function MobileMenu({ 
  navigationLinks, 
  user, 
  styles, 
  currentRole
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // S'assurer que le composant est monté avant les animations
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
    }
  }, [isOpen])

  const menuVariants: Variants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        duration: 0.3
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    closed: {
      x: 30,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    }
  }

  const overlayVariants: Variants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  }

  // Ne pas render l'animation avant que le composant soit monté
  if (!isMounted) {
    return (
      <>
        <div>
          <Link href="/chat">
            <img src='/generative.png' className='dark:invert w-6' alt="Chat"/>
          </Link>
        </div>
        {/* <div>
          <Link href="/recherche">
            <img src='/search2.png' className='dark:invert w-4' alt="Recherche"/>
          </Link>
        </div> */}
        <div>
        </div>
        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-300 dark:hover:bg-gray-800">
          <div className="hidden md:flex items-start flex-col text-right">
            <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
              {user.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
              {user.email}
            </span>
          </div>
          <div className="relative">
            
            {user.profil_url ? (
              <img 
                src={user.profil_url} 
                alt="Photo de profil"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 transition-colors duration-300"
              />
            ) : (
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                ${styles.bg} dark:${styles.dark.bg}
              `}>
                <span className="text-white font-semibold text-sm">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
            <div className={`
              absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800
              flex items-center justify-center transition-colors duration-300
              ${styles.bg} dark:${styles.dark.bg}
            `}>
              <RoleIcon role={user.role} className="h-2 w-2 text-white" />
            </div>
          </div>
        </button>
      </>
    )
  }

  return (
    <>
     
  
    </>
  )
}