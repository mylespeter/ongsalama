
// components/ui/UserAvatar.tsx
'use client'

import { User } from '@/context/AuthContext'
import { Camera } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showEdit?: boolean
  onPhotoUpdate?: (newPhotoUrl: string) => void
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl'
}

const roleColors: Record<string, string> = {
  accueil: 'bg-primary',
  consultation: 'bg-secondary',
  laboratoire: 'bg-accent',
  pharmacie: 'bg-success',
  administration: 'bg-warning'
}

export function UserAvatar({ user, size = 'md', showEdit = false, onPhotoUpdate }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const [uploading, setUploading] = useState(false)

  const getInitials = () => {
    return user.username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const bgColor = roleColors[user.role] || 'bg-gray-500'

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_profil: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      onPhotoUpdate?.(publicUrl)

    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  if (user.photo_profil && !imgError) {
    return (
      <div className="relative group">
        <img
          src={user.photo_profil}
          alt={user.username}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
          onError={() => setImgError(true)}
        />
        {showEdit && (
          <label className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 shadow-md cursor-pointer hover:bg-primary/80 transition-colors">
            {uploading ? (
              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Camera className="h-3 w-3 text-white" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        )}
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center ring-2 ring-white shadow-sm`}>
        <span className="text-white font-medium">{getInitials()}</span>
      </div>
      {showEdit && (
        <label className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 shadow-md cursor-pointer hover:bg-primary/80 transition-colors">
          {uploading ? (
            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Camera className="h-3 w-3 text-white" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}
    </div>
  )
}