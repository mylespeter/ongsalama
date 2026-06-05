// hooks/useNotifications.ts
'use client';

import { useCallback } from 'react';

export function useNotifications() {
  
  const notifierAssure = useCallback(async (
    sinistreId: string,
    typeNotification: string,
    extraData: any = {}
  ) => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sinistreId, typeNotification, extraData }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('❌ Erreur notification:', error);
      return false;
    }
  }, []);

  const notifierExpert = useCallback(async (expertiseId: string) => {
    try {
      const response = await fetch('/api/send-notification-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expertiseId }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('❌ Erreur notification expert:', error);
      return false;
    }
  }, []);

  return { notifierAssure, notifierExpert };
}