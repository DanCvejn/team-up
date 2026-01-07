import { pb } from '../pocketbase';
import type { Event, ResponseOption } from '../types';

export const eventsAPI = {
  /**
   * Načti akce týmu
   */
  async getTeamEvents(teamId: string): Promise<Event[]> {
    try {
      const events = await pb.collection('events').getFullList<Event>({
        filter: pb.filter('team = {:teamId}', { teamId }),
        expand: 'team', // Odstranil event_responses_via_event - může způsobovat error
        sort: '-date',
      });

      return events;
    } catch (error: any) {
      // Pouze varování pro status 0 (hot reload), error pro ostatní
      if (error?.status === 0) {
        console.warn('Hot reload error fetching team events:', error);
      } else {
        console.warn('Error fetching team events:', error);
      }
      // Vrať prázdné pole pro všechny chyby
      return [];
    }
  },

  /**
   * Detail akce
   */
  async getEvent(eventId: string): Promise<Event> {
    try {
      const event = await pb.collection('events').getOne<Event>(eventId, {
        expand: 'created_by,team',
      });
      return event;
    } catch (error: any) {
      // Pouze varování místo error
      if (error?.status === 0) {
        console.warn('Hot reload error in getEvent');
      } else {
        console.warn('Error fetching event detail:', error);
      }
      throw error; // Přehoď chybu dál, aby ji mohl zpracovat hook
    }
  },

  /**
   * Vytvoř akci
   */
  async createEvent(data: {
    team: string;
    title: string;
    date: string;
    location: string;
    capacity: number;
    description?: string;
    response_options: ResponseOption[];
  }): Promise<Event> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    const event = await pb.collection('events').create<Event>({
      ...data,
      created_by: userId,
    });

    return event;
  },

  /**
   * Aktualizuj akci
   */
  async updateEvent(eventId: string, data: Partial<Event>): Promise<Event> {
    const event = await pb.collection('events').update<Event>(eventId, data);
    return event;
  },

  /**
   * Smaž akci
   */
  async deleteEvent(eventId: string): Promise<void> {
    await pb.collection('events').delete(eventId);
  },

  /**
   * Subscribe na změny akce (realtime)
   */
  async subscribeToEvent(eventId: string, callback: (event: Event) => void) {
    if (typeof (global as any).EventSource === 'undefined') {
      console.warn('EventSource not available: realtime subscriptions are disabled. Install a polyfill (react-native-event-source or eventsource).');
      return null;
    }

    try {
      const unsubscribe = await pb.collection('events').subscribe<Event>(eventId, (e) => {
        callback(e.record);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to event:', error);
      return null;
    }
  },

  /**
   * Unsubscribe
   */
  unsubscribe(eventId?: string) {
    if (eventId) {
      pb.collection('events').unsubscribe(eventId);
    } else {
      pb.collection('events').unsubscribe();
    }
  },
};