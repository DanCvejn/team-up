import React from 'react';
import {
  KeyboardAvoidingView,
  Modal as ModalComponent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  scroll?: boolean;
}

const Modal = ({ visible, onClose, children, title, subtitle, scroll }: ModalProps) => {
  return (
    <ModalComponent
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        {
          scroll ?
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{ title }</Text>
                { subtitle &&
                  <Text style={styles.subtitle}>{ subtitle }</Text>
                }
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
              { children }
              </ScrollView>
            </View>:
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{ title }</Text>
                <Text style={styles.subtitle}>{ subtitle }</Text>
              </View>
              { children }
            </View>
          }
      </KeyboardAvoidingView>
    </ModalComponent>
  )
}

export default Modal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    maxHeight: '70%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  }
})