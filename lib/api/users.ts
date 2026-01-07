import { pb } from '../pocketbase';
import type { User } from '../types';

export const usersAPI = {
  /**
   * Aktualizuj jméno uživatele
   */
  async updateName(userId: string, name: string): Promise<User> {
    const user = await pb.collection('users').update<User>(userId, {
      name,
    });

    // Update authStore model so the UI reflects the change immediately
    if (pb.authStore.model?.id === userId) {
      pb.authStore.save(pb.authStore.token, { ...pb.authStore.model, name });
    }

    return user;
  },

  /**
   * Změň heslo (vyžaduje staré heslo pro ověření)
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    const email = pb.authStore.model?.email;

    if (!userId || !email) {
      throw new Error('Not authenticated');
    }

    // First verify old password by trying to authenticate
    try {
      await pb.collection('users').authWithPassword(email, oldPassword);
    } catch (error) {
      throw new Error('Staré heslo je nesprávné');
    }

    // If verification succeeded, update the password
    await pb.collection('users').update(userId, {
      password: newPassword,
      passwordConfirm: newPassword,
    });
  },
};
