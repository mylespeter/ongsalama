// 'use client'

// import { useTheme } from '@/context/ThemeContext'
// import { useState } from 'react'
// import { FiSun, FiMoon } from 'react-icons/fi'

// export default function ThemeSwitch() {
//   const { theme, toggleTheme } = useTheme()
//   const [isAnimating, setIsAnimating] = useState(false)

//   const handleClick = () => {
//     if (isAnimating) return
    
//     setIsAnimating(true)
//     toggleTheme()
    
//     setTimeout(() => {
//       setIsAnimating(false)
//     }, 400)
//   }

//   return (
//     <button
//       onClick={handleClick}
//       className={`
//         relative w-12 h-6 rounded-full 
//         bg-gray-300 dark:bg-gray-600
//         transition-all duration-300 ease-in-out
//         border border-gray-400/30 dark:border-gray-500/30
//         overflow-hidden
//         group hover:shadow-md
//         ${isAnimating ? 'scale-110' : 'scale-100'}
//       `}
//       aria-label={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
//     >
//       {/* Fond dégradé qui apparaît au hover */}
//       <div className={`
//         absolute inset-0 bg-gradient-to-r 
//         from-blue-400 to-purple-500
//         opacity-0 group-hover:opacity-100
//         transition-opacity duration-300
//       `} />
      
//       {/* Curseur avec icône */}
//       <div className={`
//         absolute top-0.5 w-5 h-5 rounded-full
//         bg-white dark:bg-gray-800
//         shadow-md transform transition-all duration-300 ease-in-out
//         flex items-center justify-center
//         border border-gray-200 dark:border-gray-600 
//         ${theme === 'light' ? 'left-0 transition-all duration-75' : 'right-0'}
//         ${isAnimating ? 'scale-110' : 'scale-100'}
//       `}>
//         {/* Transition fluide entre les icônes */}
//         <div className="relative w-3 h-3">
//           <FiSun 
//             className={`
//               absolute w-3 h-3 transition-all duration-300 ease-in-out
//               text-yellow-500
//               ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
//             `} 
//           />
//           <FiMoon 
//             className={`
//               absolute w-3 h-3 transition-all duration-300 ease-in-out
//               text-gray-600 dark:text-blue-400
//               ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
//             `} 
//           />
//         </div>
//       </div>

//       {/* Points d'arrière-plan subtils */}
//       {/* <div className="absolute inset-0 flex items-center justify-between px-1.5 opacity-40">
//         <div className="w-1 h-1 bg-current rounded-full" />
//         <div className="w-1 h-1 bg-current rounded-full" />
//       </div> */}
//     </button>
//   )
// }
'use client'

import { useTheme } from '@/context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-12 h-7 rounded-full 
        bg-gray-200 dark:bg-gray-700
        transition-all duration-500 ease-in-out
        border-2 border-gray-300 dark:border-gray-600
        group hover:shadow-lg
      `}
      aria-label={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {/* Curseur élégant */}
      <div className={`
        absolute top-[50%] left-[50%]  translate-y-[-50%] w-6 h-6 rounded-full
        bg-white dark:bg-gray-900
        shadow-lg transform transition-all duration-500 ease-in-out
        flex items-center justify-center
        group-hover:scale-90
        ${theme === 'light' ? 'translate-x-[-90%]' : 'translate-x-[-10%]'}
      `}>
        <div className="relative w-4 h-4">
          <FiSun 
            className={`
              absolute w-4 h-4 transition-all duration-500
              text-amber-500
              ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}
            `} 
          />
          <FiMoon 
            className={`
              absolute w-4 h-4 transition-all duration-500
              text-indigo-400
              ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'}
            `} 
          />
        </div>
      </div>

      {/* Éléments décoratifs subtils */}
      <div className={`
        absolute inset-0 rounded-full transition-all duration-500
        bg-gradient-to-r from-amber-200/0 to-amber-200/30
        dark:from-indigo-500/0 dark:to-indigo-500/20
        ${theme === 'light' ? 'opacity-100' : 'opacity-0'}
      `} />
    </button>
  )
}