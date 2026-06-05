// components/RoleIcon.tsx
'use client'

import { 
  FaShieldAlt, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUniversity,
  FaUserTie
} from 'react-icons/fa'

const roleIcons = {
  admin: FaShieldAlt,
  check_in_admin: FaUserTie,
  teacher: FaChalkboardTeacher,
  student: FaGraduationCap,
  alumni: FaUniversity
} as const

interface RoleIconProps {
  role: string
  className?: string
}

export function RoleIcon({ role, className }: RoleIconProps) {
  const IconComponent = roleIcons[role as keyof typeof roleIcons] || FaShieldAlt
  return <IconComponent className={className} />
}