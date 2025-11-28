import { pb } from '../pocketbase';
import type { User } from '../types';

export const authAPI = {
  /**
   * Registrace nového uživatele
   */
  async register(email: string, password: string, name: string): Promise<User> {
    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
    });

    await pb.collection('users').authWithPassword(email, password);

    return user as unknown as User;
  },

  /**
   * Přihlášení
   */
  async login(email: string, password: string): Promise<User> {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData.record as unknown as User;
  },

  /**
   * Odhlášení
   */
  logout() {
    pb.authStore.clear();
  },

  /**
   * Aktuální uživatel
   */
  getCurrentUser(): User | null {
    return pb.authStore.record as User | null;
  },

  /**
   * Je uživatel přihlášen?
   */
  isAuthenticated(): boolean {
    return pb.authStore.isValid;
  },

  /**
   * Refresh token
   */
  async refresh(): Promise<User | null> {
    await pb.collection('users').authRefresh();
    return pb.authStore.record as User | null;
  },
};