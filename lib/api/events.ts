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
      console.error('Error fetching team events:', error);
      console.error('Error details:', { status: error?.status, message: error?.message, data: error?.data });
      // Pokud je to 404 nebo prázdný výsledek, vrať prázdné pole
      if (error?.status === 404 || error?.status === 0) {
        return [];
      }
      // Vrať prázdné pole i pro jiné chyby, aby to nezrušilo celý detail týmu
      return [];
    }
  },

  /**
   * Detail akce
   */
  async getEvent(eventId: string): Promise<Event> {
    const event = await pb.collection('events').getOne<Event>(eventId, {
      expand: 'created_by,team',
    });
    return event;
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