// components/ui/Loader.tsx
'use client'

import { Loader2 } from 'lucide-react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  text?: string
}

export function Loader({ size = 'md', fullScreen = false, text }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    )
  }

  return loader
}

// Spinner simple pour les boutons
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} />
}