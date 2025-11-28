import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase from 'pocketbase';

// Ensure EventSource exists in React Native (PocketBase SDK uses EventSource for realtime).
// If you're running on React Native and get "Property 'EventSource' doesn't exist" errors,
// install a polyfill like `react-native-sse` and restart the app.
if (typeof (global as any).EventSource === 'undefined') {
    try {
      // prefer react-native-sse if available
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RNEventSource = require('react-native-sse');
      // react-native-sse exports EventSource directly
      const EventSourceClass = RNEventSource.default || RNEventSource;
      if (typeof EventSourceClass === 'function' || typeof EventSourceClass === 'object') {
        (global as any).EventSource = EventSourceClass;
        // eslint-disable-next-line no-console
        console.info('✓ Using react-native-sse polyfill for EventSource');
      } else {
        console.warn('react-native-sse loaded but EventSource is not a function/object:', typeof EventSourceClass);
      }
  } catch (e1) {
      console.warn('Failed to load react-native-sse:', e1);
      try {
      // fallback to react-native-event-source if available
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-native-event-source');
      // module might export default or a named EventSource
      let candidate: any = mod?.default ?? mod;
      if (candidate && candidate.EventSource) candidate = candidate.EventSource;
      if (typeof candidate === 'function') {
        (global as any).EventSource = candidate;
        // eslint-disable-next-line no-console
        console.info('✓ Using react-native-event-source polyfill for EventSource');
      }
    } catch (e2) {
      try {
        // fallback to node/eventsource package (works in some RN setups)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod2 = require('eventsource');
        let candidate2: any = mod2?.default ?? mod2;
        if (candidate2 && candidate2.EventSource) candidate2 = candidate2.EventSource;
        if (typeof candidate2 === 'function') {
          (global as any).EventSource = candidate2;
          // eslint-disable-next-line no-console
          console.info('✓ Using eventsource (node) polyfill for EventSource');
        }
      } catch (e3) {
        // leave it undefined and let callers handle the missing feature
        console.warn("✗ EventSource isn't available in this environment — realtime subscriptions may fail. Install 'react-native-sse' to enable realtime.");
      }
    }
  }
}

// Změň na svou adresu
const PB_URL = "https://tul.dcreative.cz";

class PocketBaseClient {
  private static instance: PocketBase;

  static getInstance(): PocketBase {
    if (!PocketBaseClient.instance) {
      PocketBaseClient.instance = new PocketBase(PB_URL);

      PocketBaseClient.instance.authStore.onChange(async (token, model) => {
        if (token && model) {
          await AsyncStorage.setItem('pb_auth', JSON.stringify({
            token,
            model
          }));
        } else {
          await AsyncStorage.removeItem('pb_auth');
        }
      });

      PocketBaseClient.loadSavedAuth();
    }
    return PocketBaseClient.instance;
  }

  private static async loadSavedAuth() {
    try {
      const saved = await AsyncStorage.getItem('pb_auth');
      if (saved) {
        const { token, model } = JSON.parse(saved);
        PocketBaseClient.instance.authStore.save(token, model);
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    }
  }
}

export const pb = PocketBaseClient.getInstance();