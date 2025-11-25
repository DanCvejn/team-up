import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase from 'pocketbase';

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