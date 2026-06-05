// app/dashboard/page.tsx
'use client'

import { useAuth, useRole } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader } from '@/components/ui/Loader'

export default function DashboardIndexPage() {
  const { user, loading } = useAuth()
  const { role } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Rediriger vers le dashboard du rôle
      switch (role) {
        case 'accueil':
          router.push('/dashboard/accueil')
          break
        case 'consultation':
          router.push('/dashboard/consultation')
          break
        case 'laboratoire':
          router.push('/dashboard/laboratoire')
          break
        case 'pharmacie':
          router.push('/dashboard/pharmacie')
          break
        case 'administration':
          router.push('/dashboard/administration')
          break
        default:
          router.push('/dashboard/accueil')
      }
    }
  }, [loading, user, role, router])

  if (loading) {
    return <Loader fullScreen text="Redirection..." />
  }

  return null
}