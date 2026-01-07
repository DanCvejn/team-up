import { eventsAPI, responsesAPI } from '@/lib/api';
import type { Event, EventResponse } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [responses, setResponses] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [eventData, responsesData] = await Promise.all([
        eventsAPI.getEvent(eventId),
        responsesAPI.getEventResponses(eventId),
      ]);
      setEvent(eventData);
      setResponses(responsesData);
    } catch (err: any) {
      setError(err?.message || 'Nepodařilo se načíst akci');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Realtime subscription
  useEffect(() => {
    if (!eventId) return;

    let unsubEvent: (() => void) | null = null;
    let unsubResponses: (() => void) | null = null;

    // Subscribe na změny akce
    eventsAPI.subscribeToEvent(eventId, (updated) => {
      setEvent(updated);
    }).then((unsub) => {
      unsubEvent = unsub;
    });

    // Subscribe na změny odpovědí
    responsesAPI.subscribeToResponses(eventId, () => {
      // Re-fetch responses když se něco změní
      responsesAPI.getEventResponses(eventId).then(setResponses);
    }).then((unsub) => {
      unsubResponses = unsub;
    });

    return () => {
      if (unsubEvent && typeof unsubEvent === 'function') {
        unsubEvent();
      }
      if (unsubResponses && typeof unsubResponses === 'function') {
        unsubResponses();
      }
    };
  }, [eventId]);

  const setMyResponse = useCallback(async (response: string) => {
    if (!eventId) return;

    setError(null);
    try {
      await responsesAPI.setMyResponse(eventId, response);
    } catch (err: any) {
      console.log(err);
      const errorMsg = err?.message || 'Nepodařilo se přidat odpověď';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [eventId]);

  const addGuest = useCallback(async (guestName: string, response: string) => {
    if (!eventId) return;

    setError(null);
    try {
      await responsesAPI.addGuest(eventId, guestName, response);
      // Realtime subscription zajistí update
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se přidat hosta';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [eventId]);

  const deleteResponse = useCallback(async (responseId: string) => {
    setError(null);
    try {
      await responsesAPI.deleteResponse(responseId);
      // Realtime subscription zajistí update
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se smazat odpověď';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, data: Partial<Event>) => {
    setError(null);
    try {
      const updated = await eventsAPI.updateEvent(eventId, data);
      setEvent(updated);
      return updated;
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se aktualizovat událost';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Helper: spočítej potvrzené
  const getConfirmedCount = useCallback(() => {
    if (!event) return 0;
    const responseOptions = event.response_options || [];
    const capacityLabels = responseOptions
      .filter((opt) => opt.countsToCapacity)
      .map((opt) => opt.label);
    return responses.filter(r => capacityLabels.includes(r.response)).length;
  }, [event, responses]);

  // Helper: rozděl na confirmed/waitlist
  const getSortedResponses = useCallback(() => {
    if (!event) return { confirmed: [], waitlist: [] };

    const responseOptions = event.response_options || [];
    const capacityLabels = responseOptions
      .filter((opt) => opt.countsToCapacity)
      .map((opt) => opt.label);

    const sorted = responses
      .filter(r => capacityLabels.includes(r.response))
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

    // capacity === 0 means unlimited — treat all counted responses as confirmed
    const capacity = event.capacity ?? 0;
    if (capacity === 0) {
      return { confirmed: sorted, waitlist: [] };
    }

    return {
      confirmed: sorted.slice(0, capacity),
      waitlist: sorted.slice(capacity),
    };
  }, [event, responses]);

  return {
    event,
    responses,
    isLoading,
    error,
    fetchEvent,
    setMyResponse,
    addGuest,
    deleteResponse,
    updateEvent,
    getConfirmedCount,
    getSortedResponses,
  };
}