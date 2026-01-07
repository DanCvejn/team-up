import { pb } from '../pocketbase';
import type { EventResponse } from '../types';

export const responsesAPI = {
  /**
   * Přidej/změň svoji odpověď
   */
  async setMyResponse(eventId: string, response: string): Promise<EventResponse> {
    const userId = pb.authStore.record?.id;
    if (!userId) throw new Error('Not authenticated');

    // Zkontroluj jestli už má odpověď
    const existing = await pb.collection('event_responses').getFullList<EventResponse>({
      filter: pb.filter('event = {:eventId} && user = {:userId}', { eventId, userId }),
    });

    let result: EventResponse;
    if (existing.length > 0) {
      result = await pb.collection('event_responses').update<EventResponse>(existing[0].id, {
        response,
      });
    } else {
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
      sort: '-updated',
    });

    return responses;
  },

  /**
   * Subscribe na změny odpovědí (realtime)
   */
  async subscribeToResponses(eventId: string, callback: (response: EventResponse) => void) {
    if (typeof (global as any).EventSource === 'undefined') {
      console.warn('EventSource not available: realtime responses subscriptions are disabled. Install a polyfill (react-native-event-source or eventsource).');
      return null;
    }

    try {
      const unsubscribe = await pb.collection('event_responses').subscribe<EventResponse>('*', (e) => {
        if (e.record.event === eventId) {
          callback(e.record);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to responses:', error);
      return null;
    }
  },

  /**
   * Unsubscribe
   */
  unsubscribe() {
    pb.collection('event_responses').unsubscribe();
  },
};