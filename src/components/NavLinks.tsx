
// components/NavLinks.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DocumentIcon } from '@heroicons/react/24/solid'
import { 
  Home, 
  Upload, 
  Search, 
  Users,File, 
  Folder,
  Calendar, 
  Briefcase, 
  Headset,
  Network, 
  BotIcon,
  Activity,
  BookmarkCheck
} from 'lucide-react'
import { FaThumbtack } from 'react-icons/fa'
import { head } from 'lodash'

const iconMap = {
  home: Home,
  thumbtack: BookmarkCheck,
  upload: Upload,
  search: Search,
  folder: Folder,
  headset: Headset,
  file: File,
  users: Users,
  calendar: Calendar,
  briefcase: Briefcase,
  network: Network,
  activity:Activity,
  bot: BotIcon
} as const

interface NavLink {
  href: string
  iconName: keyof typeof iconMap
  label: string
}

interface NavLinksProps {
  links: NavLink[]
  styles: { text: string; bg: string }
}

export function NavLinks({ links, styles }: NavLinksProps) {
  const pathname = usePathname()
  
  return (
    <>
      {links.map((link) => {
        const IconComponent = iconMap[link.iconName]
        const isActive = pathname === link.href || 
                       (link.href !== '/' && pathname.startsWith(link.href))
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
              isActive 
                ? `${styles.text} font-semibold` 
                : 'text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 hover:text-gray-900'
            }`}
          >
            <IconComponent 
              size={18} 
              className={`mr-2 transition-transform ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} 
            />
            {link.label}
            {isActive && (
              <div className={`absolute bottom-0 translate-y-[-90%] left-1/2 w-1/2 h-0.5  ${styles.bg} -translate-x-1/2`} />
            )}
          </Link>
        )
      })}
    </>
  )
}