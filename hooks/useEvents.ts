import { eventsAPI } from '@/lib/api';
import type { Event } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export function useEvents(teamId: string | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await eventsAPI.getTeamEvents(teamId);
      setEvents(data);
    } catch (err: any) {
      console.warn('useEvents fetchEvents error:', err);
      // Tiše ignoruj error a nastav prázdné pole - API už má error handling
      setEvents([]);
      setError(null); // Nezobrazuj error uživateli
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (data: {
    team: string;
    title: string;
    date: string;
    location: string;
    capacity: number;
    description?: string;
    response_options: any[];
  }) => {
    setError(null);
    try {
      const newEvent = await eventsAPI.createEvent(data);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se vytvořit akci';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, data: Partial<Event>) => {
    setError(null);
    try {
      const updated = await eventsAPI.updateEvent(eventId, data);
      setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
      return updated;
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se aktualizovat akci';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    setError(null);
    try {
      await eventsAPI.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se smazat akci';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}