import { pb } from '../pocketbase';
import type { EventResponse } from '../types';

export const responsesAPI = {
  /**
   * Přidej/změň svoji odpověď
   */
  async setMyResponse(eventId: string, response: string): Promise<EventResponse> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    // Zkontroluj jestli už má odpověď
    const existing = await pb.collection('event_responses').getFullList<EventResponse>({
      filter: pb.filter('event = {:eventId} && user = {:userId}', { eventId, userId }),
    });

    let result: EventResponse;

    if (existing.length > 0) {
      // Update existující
      result = await pb.collection('event_responses').update<EventResponse>(existing[0].id, {
        response,
      });
    } else {
      // Vytvoř novou
      result = await pb.collection('event_responses').create<EventResponse>({
        event: eventId,
        user: userId,
        response,
        added_by: userId,
      });
    }

    return result;
  },

  /**
   * Přidej hosta
   */
  async addGuest(
    eventId: string,
    guestName: string,
    response: string
  ): Promise<EventResponse> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    const guest = await pb.collection('event_responses').create<EventResponse>({
      event: eventId,
      guest_name: guestName,
      response,
      added_by: userId,
    });

    return guest;
  },

  /**
   * Smaž odpověď (svoji nebo hosta)
   */
  async deleteResponse(responseId: string): Promise<void> {
    await pb.collection('event_responses').delete(responseId);
  },

  /**
   * Načti odpovědi akce
   */
  async getEventResponses(eventId: string): Promise<EventResponse[]> {
    const responses = await pb.collection('event_responses').getFullList<EventResponse>({
      filter: pb.filter('event = {:eventId}', { eventId }),
      expand: 'user,added_by',
      sort: 'created',
    });

    return responses;
  },

  /**
   * Subscribe na změny odpovědí (realtime)
   */
  subscribeToResponses(eventId: string, callback: (response: EventResponse) => void) {
    return pb.collection('event_responses').subscribe<EventResponse>('*', (e) => {
      if (e.record.event === eventId) {
        callback(e.record);
      }
    });
  },

  /**
   * Unsubscribe
   */
  unsubscribe() {
    pb.collection('event_responses').unsubscribe();
  },
};