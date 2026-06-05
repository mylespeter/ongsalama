'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'

interface InputLineProps {
  onCommand: (command: string) => void;
  onClear: () => void;
  onKeyUp: (e: KeyboardEvent) => string | null;
  currentPath: string;
}

const COMMANDS = ['cd', 'dir', 'mkdir', 'touch', 'type', 'del', 'rename', 'move', 'copy', 'cls', 'help', 'ver'];

export default function InputLine({ onCommand, onClear, onKeyUp, currentPath }: InputLineProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showMobileKeyboard, setShowMobileKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus initial
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setInput('');
      setSuggestions([]);
      setShowMobileKeyboard(false);
      
      // Re-focus après soumission
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.trim()) {
      const firstWord = value.toLowerCase().split(' ')[0];
      const filtered = COMMANDS.filter(cmd => 
        cmd.startsWith(firstWord)
      );
      setSuggestions(filtered.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Empêcher le zoom sur iOS avec metaKey (Cmd)
    if (e.metaKey && (e.key === '+' || e.key === '-' || e.key === '=')) {
      e.preventDefault();
    }
    
    const historyCommand = onKeyUp(e);
    if (historyCommand !== null) {
      setInput(historyCommand);
      setSuggestions([]);
      e.preventDefault();
    }
    
    // Auto-complétion avec Tab
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[0]);
      setSuggestions([]);
    }
    
    // Ctrl+L pour effacer
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      onClear();
      setInput('');
    }
    
    // Échap pour effacer la ligne
    if (e.key === 'Escape') {
      e.preventDefault();
      setInput('');
      setSuggestions([]);
    }
    
    // Ctrl+U pour effacer jusqu'au début
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleMobileKeyboardToggle = () => {
    setShowMobileKeyboard(!showMobileKeyboard);
    inputRef.current?.focus();
  };

  return (
    <div className="mt-2 relative">
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-dos-green text-white mr-1 md:mr-2 flex-shrink-0 text-xs md:text-sm">
          {currentPath}&gt;
        </span>
        
        <div className="flex-1 relative min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="terminal-input text-white w-full bg-transparent text-dos-green outline-none caret-dos-green min-w-0 text-xs md:text-sm"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="go"
            inputMode="text"
            aria-label="DOS command input"
          />
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 top-6 bg-dos-dark border border-dos-green rounded shadow-lg z-10 min-w-[120px] md:min-w-[150px]">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-2 md:px-3 py-1 text-dos-green hover:bg-green-900/30 text-xs md:text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Bouton d'exécution mobile-friendly */}
        <button
          type="submit"
          className="ml-1 md:ml-2 px-2 md:px-3 py-0.5 md:py-1 bg-dos-green/20 text-dos-green border border-dos-green/50 rounded text-xs md:text-sm hover:bg-dos-green/30 active:bg-dos-green/40 transition-colors touch-manipulation"
          aria-label="Execute command"
        >
          ↵
        </button>
        
        {/* Bouton clavier mobile */}
        <button
          type="button"
          onClick={handleMobileKeyboardToggle}
          className="ml-1 md:hidden px-2 py-0.5 bg-dos-green/10 text-dos-green/70 border border-dos-green/30 rounded text-xs"
          aria-label="Toggle keyboard"
        >
          ⌨️
        </button>
      </form>
      
      {/* Instructions rapides */}
      <div className="mt-1 md:mt-2">
        <div className="flex flex-wrap gap-0.5 md:gap-1">
          {['Enter:Execute', 'Esc:Clear', 'Tab:Complete', '↑↓:History'].map((item) => (
            <span
              key={item}
              className="inline-block bg-dos-dark/40 text-dos-green/60 font-mono text-[8px] md:text-xs px-1.5 py-0.5 rounded"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      
      {/* Clavier virtuel mobile (simplifié) */}
      {showMobileKeyboard && (
        <div className="mt-2 p-2 bg-dos-dark/80 border border-dos-green/30 rounded">
          <div className="grid grid-cols-6 gap-1 mb-1">
            {['cd', 'dir', 'mkdir', 'touch', 'type', 'del'].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  setInput(cmd + ' ');
                  inputRef.current?.focus();
                }}
                className="bg-dos-green/10 text-dos-green text-xs py-1 rounded active:bg-dos-green/20"
              >
                {cmd}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowMobileKeyboard(false)}
              className="text-dos-green/70 text-xs"
            >
              Close keyboard
            </button>
            <button
              type="button"
              onClick={() => {
                setInput('');
                inputRef.current?.focus();
              }}
              className="text-red-400 text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}