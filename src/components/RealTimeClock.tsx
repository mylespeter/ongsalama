'use client';

import { useState, useEffect } from 'react';

export function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Mettre à jour immédiatement
    setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
    
    // Mettre à jour toutes les secondes
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span>{currentTime}</span>;
}