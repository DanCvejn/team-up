import { pb } from '../pocketbase';
import type { Event, ResponseOption } from '../types';

export const eventsAPI = {
  /**
   * Načti akce týmu
   */
  async getTeamEvents(teamId: string): Promise<Event[]> {
    const events = await pb.collection('events').getFullList<Event>({
      filter: pb.filter('team = {:teamId}', { teamId }),
      expand: 'created_by,event_responses_via_event.user,event_responses_via_event.added_by',
      sort: '-date',
    });

    return events;
  },

  /**
   * Detail akce
   */
  async getEvent(eventId: string): Promise<Event> {
    const event = await pb.collection('events').getOne<Event>(eventId, {
      expand: 'created_by,event_responses_via_event.user,event_responses_via_event.added_by',
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
  subscribeToEvent(eventId: string, callback: (event: Event) => void) {
    return pb.collection('events').subscribe<Event>(eventId, (e) => {
      callback(e.record);
    });
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