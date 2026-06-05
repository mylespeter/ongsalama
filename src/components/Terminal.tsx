
// 'use client'

// import { useState, useEffect, useRef, useCallback } from 'react'
// import { executeCommand } from '@/utils/commands'
// import { fileSystem } from '@/utils/fileSystem'

// export default function Terminal() {
//   const [fontSize, setFontSize] = useState(16)
//   const [output, setOutput] = useState<string[]>([
//     'Microsoft(R) MS-DOS(R) Version 6.22',
//     '(C)Copyright Microsoft Corp 1981-1993.',
//     'Tapez "aide" pour la liste des commandes.',
//     'C:\\>'
//   ])
//   const [inputValue, setInputValue] = useState('')
//   const [commandHistory, setCommandHistory] = useState<string[]>([])
//   const [historyIndex, setHistoryIndex] = useState(-1)
//   const terminalRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     inputRef.current?.focus()
    
//     const handleClick = () => {
//       inputRef.current?.focus()
//     }

//     window.addEventListener('click', handleClick)
//     return () => window.removeEventListener('click', handleClick)
//   }, [])

//   useEffect(() => {
//     if (terminalRef.current) {
//       terminalRef.current.scrollTop = terminalRef.current.scrollHeight
//     }
//   }, [output])

//   const handleKeyDown = useCallback((e: KeyboardEvent) => {
//     if (e.key === 'ArrowUp' && commandHistory.length > 0) {
//       e.preventDefault()
//       const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0
//       setHistoryIndex(newIndex)
//       setInputValue(commandHistory[commandHistory.length - 1 - newIndex])
//     } else if (e.key === 'ArrowDown' && commandHistory.length > 0) {
//       e.preventDefault()
//       const newIndex = historyIndex > 0 ? historyIndex - 1 : -1
//       setHistoryIndex(newIndex)
//       const value = newIndex >= 0 ? commandHistory[commandHistory.length - 1 - newIndex] : ''
//       setInputValue(value)
//     } else if (e.key === 'Tab' && inputValue) {
//       e.preventDefault()
//       const commands = ['cd', 'dir', 'mkdir', 'md', 'touch', 'type', 'del', 'effacer', 'ren', 'renommer', 'move', 'deplacer', 'copy', 'copier', 'cls', 'nettoyer', 'aide', 'help', 'ver', 'version']
//       const current = inputValue.split(' ')[0]
//       const match = commands.find(cmd => cmd.startsWith(current.toLowerCase()))
//       if (match) {
//         setInputValue(match + (inputValue.includes(' ') ? inputValue.slice(current.length) : ' '))
//       }
//     }
//   }, [commandHistory, historyIndex, inputValue])

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown)
//     return () => window.removeEventListener('keydown', handleKeyDown)
//   }, [handleKeyDown])

//   const handleSubmit = useCallback((e: React.FormEvent) => {
//     e.preventDefault()
    
//     const command = inputValue.trim()
//     if (!command) {
//       setOutput(prev => [...prev, `${fileSystem.getCurrentPath()}>`])
//       setInputValue('')
//       return
//     }

//     setCommandHistory(prev => [...prev, command])
//     setHistoryIndex(-1)

//     const newOutput = [...output, `${fileSystem.getCurrentPath()}> ${command}`]

//     const result = executeCommand(command)

//     if (result[0] === '_CLEAR_') {
//       setOutput([`${fileSystem.getCurrentPath()}>`])
//     } else {
//       setOutput([...newOutput, ...result])
//     }

//     setInputValue('')
    
//     setTimeout(() => {
//       inputRef.current?.focus()
//     }, 0)
//   }, [inputValue, output])

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(e.target.value)
//   }

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.ctrlKey && e.key === 'l') {
//       e.preventDefault()
//       setOutput([`${fileSystem.getCurrentPath()}>`])
//       setInputValue('')
//     }
//   }

//   const increaseFontSize = () => {
//     setFontSize(prev => Math.min(prev + 1, 24))
//   }

//   const decreaseFontSize = () => {
//     setFontSize(prev => Math.max(prev - 1, 12))
//   }

//   // Fonctions pour naviguer dans l'historique via boutons
//   const handleHistoryUp = () => {
//     if (commandHistory.length > 0) {
//       const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0
//       setHistoryIndex(newIndex)
//       setInputValue(commandHistory[commandHistory.length - 1 - newIndex])
//       inputRef.current?.focus()
//     }
//   }

//   const handleHistoryDown = () => {
//     if (commandHistory.length > 0) {
//       const newIndex = historyIndex > 0 ? historyIndex - 1 : -1
//       setHistoryIndex(newIndex)
//       const value = newIndex >= 0 ? commandHistory[commandHistory.length - 1 - newIndex] : ''
//       setInputValue(value)
//       inputRef.current?.focus()
//     }
//   }

//   return (
//     <div className="w-full h-full flex flex-col bg-black overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
//       {/* Barre de titre fixe avec contrôles */}
//       <div className="flex-none fixed top-0 left-0 right-0 z-10 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white px-4 py-3 flex justify-between items-center border-b border-white/10">
//         <div className="flex items-center space-x-2">
//           <div className="w-3 h-3 rounded-full bg-white/30"></div>
//           <div className="w-3 h-3 rounded-full bg-white/20"></div>
//           <div className="w-3 h-3 rounded-full bg-white/10"></div>
//         </div>
//         <div className="text-lg font-semibold tracking-wider cypher hidden ">DOS</div>
//         <div className="flex items-center space-x-4">
//           <div className="text-sm opacity-60 cypher"> unde-v0</div>
//           <div className="flex items-center space-x-2">
//             {/* Boutons historique UP/DOWN pour mobile */}
//             <div className="sm:hidden flex items-center bg-white/10 rounded overflow-hidden mr-2">
//               <button
//                 onClick={handleHistoryUp}
//                 className="px-3 py-1 hover:bg-white/20 active:bg-white/30 transition-colors flex items-center"
//                 aria-label="Commande précédente"
//                 disabled={commandHistory.length === 0}
//               >
//                 <span className="text-white text-xs">↑</span>
//               </button>
//               <button
//                 onClick={handleHistoryDown}
//                 className="px-3 py-1 hover:bg-white/20 active:bg-white/30 transition-colors flex items-center border-l border-white/20"
//                 aria-label="Commande suivante"
//                 disabled={commandHistory.length === 0}
//               >
//                 <span className="text-white text-xs">↓</span>
//               </button>
//             </div>
            
//             {/* Contrôles de taille de police */}
//             <div className="flex items-center bg-white/10 rounded overflow-hidden">
//               <button
//                 onClick={decreaseFontSize}
//                 className="px-4 py-1 hover:bg-white/20 active:bg-white/30 transition-colors"
//                 aria-label="Decrease font size"
//               >
//                 <span className="text-white font-bold">-</span>
//               </button>
//               <span className="px-3 py-1 text-sm text-white/90 min-w-[30px] text-center cypher">{fontSize}</span>
//               <button
//                 onClick={increaseFontSize}
//                 className="px-4 py-1 hover:bg-white/20 active:bg-white/30 transition-colors"
//                 aria-label="Increase font size"
//               >
//                 <span className="text-white font-bold">+</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Zone de terminal avec padding pour la barre fixe */}
//       <div className="flex-1 overflow-hidden bg-black relative pt-16">
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
        
//         <div 
//           ref={terminalRef}
//           className="p-4 h-full overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 font-mono"
//         >
//           {output.map((line, index) => (
//             <div 
//               key={index} 
//               className="whitespace-pre-wrap break-all font-mono"
//               style={{ 
//                 lineHeight: '1.2',
//                 color: '#F5F5F5',
//                 wordBreak: 'break-all'
//               }}
//             >
//               {line.startsWith('C:\\') && line.includes('>') ? (
//                 <span className="text-whitesmoke">{line}</span>
//               ) : line.includes('non trouvé') || line.includes('Erreur') || line.includes('invalide') || line.includes('syntaxe') || line.includes('impossible') ? (
//                 <span className="text-red-400 font-medium">{line}</span>
//               ) : line.includes('Répertoire de') ? (
//                 <span className="text-gray-300 font-medium">{line}</span>
//               ) : line.includes('fichier(s)') || line.includes('répertoire(s)') ? (
//                 <span className="text-yellow-300/90">{line}</span>
//               ) : line.includes('<DIR>') ? (
//                 <span className="text-whitesmoke">{line}</span>
//               ) : line.includes('.') && line.includes(' ') ? (
//                 <span className="text">{line}</span>
//               ) : line === '' ? (
//                 <br />
//               ) : (
//                 <span className="text-whitesmoke">{line}</span>
//               )}
//             </div>
//           ))}
          
//           {/* Ligne d'input */}
//           <div className="flex items-center mt-2 font-mono">
//             <span className="text-whitesmoke mr-1 tracking-wider">{fileSystem.getCurrentPath()}&gt;</span>
//             <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={inputValue}
//                 onChange={handleInputChange}
//                 onKeyDown={handleInputKeyDown}
//                 className="flex-1 bg-transparent text-whitesmoke outline-none border-none font-mono w-full caret-whitesmoke placeholder-gray-500"
//                 autoComplete="off"
//                 autoCapitalize="off"
//                 autoCorrect="off"
//                 spellCheck="false"
//                 placeholder=""
//                 style={{ fontSize: 'inherit' }}
//                 autoFocus
//               />
//               <div className="absolute right-0 w-2 h-5 bg-whitesmoke animate-pulse"></div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Barre de statut */}
//       <div className="flex-none hidden sm:flex bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white/80 px-4 py-2.5  justify-between items-center border-t border-white/10 text-xs font-mono">
//         <div className="flex items-center space-x-2">
//           <div className="flex items-center space-x-1.5">
//             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
//             <span className="font-medium text-whitesmoke">PRÊT</span>
//           </div>
//           <span className="text-white/60 ml-2">|</span>
//           <span className="text-white/60">Commande: {commandHistory.length}</span>
//         </div>
        
//         <div className="flex space-x-6">
//           <div className="flex items-center space-x-1">
//             <span className="text-white/60">↑↓</span>
//             <span className="text-whitesmoke">Historique</span>
//           </div>
//           <div className="flex items-center space-x-1">
//             <span className="text-white/60">Tab</span>
//             <span className="text-whitesmoke">Auto-complétion</span>
//           </div>
//           <div className="flex items-center space-x-1">
//             <span className="text-white/60">Ctrl+L</span>
//             <span className="text-whitesmoke">Effacer</span>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           <div className="w-2 h-2 rounded bg-white/30"></div>
//           <span className="text-whitesmoke">FR</span>
//         </div>
//       </div>

//       <style jsx>{`
//         .scrollbar-thin::-webkit-scrollbar {
//           width: 8px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.05);
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb {
//           background: rgba(245, 245, 245, 0.2);
//           border-radius: 4px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb:hover {
//           background: rgba(245, 245, 245, 0.3);
//         }
//         .text-whitesmoke {
//           color: #F5F5F5;
//         }
//       `}</style>
//     </div>
//   )
// }
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { executeCommand } from '@/utils/commands'
import { fileSystem } from '@/utils/fileSystem'
import Link from 'next/link'

export default function Terminal() {
  const [fontSize, setFontSize] = useState(16)
  const [output, setOutput] = useState<string[]>([
    'Microsoft(R) MS-DOS(R) Version 6.22',
    '(C)Copyright Microsoft Corp 1981-1993.',
    'Tapez "aide" pour la liste des commandes.',
    'C:\\>'
  ])
  const [inputValue, setInputValue] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    
    const handleClick = () => {
      inputRef.current?.focus()
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' && commandHistory.length > 0) {
      e.preventDefault()
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0
      setHistoryIndex(newIndex)
      setInputValue(commandHistory[commandHistory.length - 1 - newIndex])
    } else if (e.key === 'ArrowDown' && commandHistory.length > 0) {
      e.preventDefault()
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1
      setHistoryIndex(newIndex)
      const value = newIndex >= 0 ? commandHistory[commandHistory.length - 1 - newIndex] : ''
      setInputValue(value)
    } else if (e.key === 'Tab' && inputValue) {
      e.preventDefault()
      const commands = ['cd', 'dir', 'mkdir', 'md', 'touch', 'type', 'del', 'effacer', 'ren', 'renommer', 'move', 'deplacer', 'copy', 'copier', 'cls', 'nettoyer', 'aide', 'help', 'ver', 'version']
      const current = inputValue.split(' ')[0]
      const match = commands.find(cmd => cmd.startsWith(current.toLowerCase()))
      if (match) {
        setInputValue(match + (inputValue.includes(' ') ? inputValue.slice(current.length) : ' '))
      }
    }
  }, [commandHistory, historyIndex, inputValue])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const command = inputValue.trim()
    if (!command) {
      setOutput(prev => [...prev, `${fileSystem.getCurrentPath()}>`])
      setInputValue('')
      return
    }

    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    const newOutput = [...output, `${fileSystem.getCurrentPath()}> ${command}`]

    const result = executeCommand(command)

    if (result[0] === '_CLEAR_') {
      setOutput([`${fileSystem.getCurrentPath()}>`])
    } else {
      setOutput([...newOutput, ...result])
    }

    setInputValue('')
    
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [inputValue, output])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setOutput([`${fileSystem.getCurrentPath()}>`])
      setInputValue('')
    }
  }

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12))
  }

  const handleHistoryUp = () => {
    if (commandHistory.length > 0) {
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0
      setHistoryIndex(newIndex)
      setInputValue(commandHistory[commandHistory.length - 1 - newIndex])
      inputRef.current?.focus()
    }
  }

  const handleHistoryDown = () => {
    if (commandHistory.length > 0) {
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1
      setHistoryIndex(newIndex)
      const value = newIndex >= 0 ? commandHistory[commandHistory.length - 1 - newIndex] : ''
      setInputValue(value)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
      {/* Barre de titre fixe avec contrôles */}
      <div className="flex-none fixed top-0 left-0 right-0 z-10 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white px-4 py-3 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Link href="/student" className="flex items-center space-x-2">
          
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/10"></div>
          </Link>
        </div>
        <div className="text-lg font-semibold tracking-wider cypher hidden ">DOS</div>
        <div className="flex items-center space-x-4">
          <div className="text-sm opacity-60 cypher"> unde-v0</div>
          <div className="flex items-center space-x-2">
            {/* Boutons historique UP/DOWN pour mobile */}
            <div className="sm:hidden flex items-center bg-white/10 rounded overflow-hidden mr-2">
              <button
                onClick={handleHistoryUp}
                className="px-3 py-1 hover:bg-white/20 active:bg-white/30 transition-colors flex items-center"
                aria-label="Commande précédente"
                disabled={commandHistory.length === 0}
              >
                <span className="text-white text-xs">↑</span>
              </button>
              <button
                onClick={handleHistoryDown}
                className="px-3 py-1 hover:bg-white/20 active:bg-white/30 transition-colors flex items-center border-l border-white/20"
                aria-label="Commande suivante"
                disabled={commandHistory.length === 0}
              >
                <span className="text-white text-xs">↓</span>
              </button>
            </div>
            
            {/* Contrôles de taille de police */}
            <div className="flex items-center bg-white/10 rounded overflow-hidden">
              <button
                onClick={decreaseFontSize}
                className="px-4 py-1 hover:bg-white/20 active:bg-white/30 transition-colors"
                aria-label="Decrease font size"
              >
                <span className="text-white font-bold">-</span>
              </button>
              <span className="px-3 py-1 text-sm text-white/90 min-w-[30px] text-center cypher">{fontSize}</span>
              <button
                onClick={increaseFontSize}
                className="px-4 py-1 hover:bg-white/20 active:bg-white/30 transition-colors"
                aria-label="Increase font size"
              >
                <span className="text-white font-bold">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de terminal avec padding pour la barre fixe */}
      <div className="flex-1 overflow-hidden bg-black relative pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
        
        <div 
          ref={terminalRef}
          className="p-4 h-full overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 font-mono"
        >
          {output.map((line, index) => (
            <div 
              key={index} 
              className="whitespace-pre-wrap break-all font-mono"
              style={{ 
                lineHeight: '1.2',
                color: '#F5F5F5',
                wordBreak: 'break-all'
              }}
            >
              {line.startsWith('C:\\') && line.includes('>') ? (
                <span className="text-whitesmoke">{line}</span>
              ) : line.includes('non trouvé') || line.includes('Erreur') || line.includes('invalide') || line.includes('syntaxe') || line.includes('impossible') ? (
                <span className="text-red-400 font-medium">{line}</span>
              ) : line.includes('Répertoire de') ? (
                <span className="text-gray-300 font-medium">{line}</span>
              ) : line.includes('fichier(s)') || line.includes('répertoire(s)') ? (
                <span className="text-yellow-300/90">{line}</span>
              ) : line.includes('<DIR>') ? (
                <span className="text-whitesmoke">{line}</span>
              ) : line.includes('.') && line.includes(' ') ? (
                <span className="text">{line}</span>
              ) : line === '' ? (
                <br />
              ) : (
                <span className="text-whitesmoke">{line}</span>
              )}
            </div>
          ))}
          
          {/* Ligne d'input */}
          <div className="flex items-center mt-2 font-mono">
            <span className="text-whitesmoke mr-1 tracking-wider">{fileSystem.getCurrentPath()}&gt;</span>
            <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                className="flex-1 bg-transparent text-whitesmoke outline-none border-none font-mono w-full caret-whitesmoke placeholder-gray-500"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                placeholder=""
                style={{ fontSize: 'inherit' }}
                autoFocus
              />
              <div className="absolute right-0 w-2 h-5 bg-whitesmoke animate-pulse"></div>
            </form>
          </div>
        </div>
      </div>

      {/* Barre de statut */}
      <div className="flex-none hidden sm:flex bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white/80 px-4 py-2.5  justify-between items-center border-t border-white/10 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium text-whitesmoke">PRÊT</span>
          </div>
          <span className="text-white/60 ml-2">|</span>
          <span className="text-white/60">Commande: {commandHistory.length}</span>
        </div>
        
        <div className="flex space-x-6">
          <div className="flex items-center space-x-1">
            <span className="text-white/60">↑↓</span>
            <span className="text-whitesmoke">Historique</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/60">Tab</span>
            <span className="text-whitesmoke">Auto-complétion</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/60">Ctrl+L</span>
            <span className="text-whitesmoke">Effacer</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded bg-white/30"></div>
          <span className="text-whitesmoke">FR</span>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(245, 245, 245, 0.2);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 245, 245, 0.3);
        }
        .text-whitesmoke {
          color: #F5F5F5;
        }
      `}</style>
    </div>
  )
}