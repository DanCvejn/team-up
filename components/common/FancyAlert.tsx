import React from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type AlertType = 'success' | 'error' | 'info' | 'confirm';

interface FancyAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  type?: AlertType;
  primaryText?: string;
  secondaryText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ICONS: Record<AlertType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
  confirm: '?',
};

const FancyAlert = ({
  visible,
  title,
  message,
  type = 'info',
  primaryText = 'OK',
  secondaryText = 'Cancel',
  onConfirm,
  onCancel,
}: FancyAlertProps) => {
  const scale = React.useRef(new Animated.Value(0.9)).current;
  React.useEffect(() => {
    if (visible) {
      scale.setValue(0.9);
      Animated.timing(scale, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'fade' : 'none'}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{ICONS[type]}</Text>
          </View>

          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {type === 'confirm' ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.secondaryText}>{secondaryText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={onConfirm}
                >
                  <Text style={styles.primaryText}>{primaryText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onConfirm}
              >
                <Text style={styles.primaryText}>{primaryText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default FancyAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F2F6FF',
  },
  icon: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    minWidth: 110,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F4',
  },
  secondaryText: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
});
