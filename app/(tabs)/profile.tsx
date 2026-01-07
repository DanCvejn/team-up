import { EditNameModal } from '@/components/profile/EditNameModal';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { useAuth, useAlert } from '@/hooks';
import { usersAPI } from '@/lib/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const { success, error: showError } = useAlert();
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const handleUpdateName = async (newName: string) => {
    if (!user?.id) return;

    try {
      await usersAPI.updateName(user.id, newName);
      await refreshUser();
      success('Hotovo', 'Jméno bylo změněno');
    } catch (error: any) {
      throw error;
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await usersAPI.changePassword(oldPassword, newPassword);
      success('Hotovo', 'Heslo bylo změněno');
    } catch (error: any) {
      showError('Chyba', error.message || 'Nepodařilo se změnit heslo');
      throw error;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setEditNameVisible(true)}
        >
          <Text style={styles.buttonText}>Změnit jméno</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setChangePasswordVisible(true)}
        >
          <Text style={styles.buttonText}>Změnit heslo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout();
          router.replace('/(auth)/login');
        }}
      >
        <Text style={styles.logoutButtonText}>Odhlásit se</Text>
      </TouchableOpacity>

      <EditNameModal
        visible={editNameVisible}
        onClose={() => setEditNameVisible(false)}
        currentName={user?.name || ''}
        onUpdate={handleUpdateName}
      />

      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
        onUpdate={handleChangePassword}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#007AFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  button: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
