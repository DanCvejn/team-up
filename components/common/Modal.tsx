import React, { useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal as ModalComponent,
  PanResponder,
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

const DISMISS_THRESHOLD = 120;
const MIN_DRAG_FOR_VELOCITY_DISMISS = 40; // px
const VELOCITY_THRESHOLD = 0.8; // approximated vy (RN Animated velocity units)
const MODAL_HEIGHT = 1000;

const Modal = ({ visible, onClose, children, title, subtitle, scroll }: ModalProps) => {
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const lastTranslate = useRef(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      lastTranslate.current = 0;
    } else {
      translateY.setValue(MODAL_HEIGHT);
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, { toValue: MODAL_HEIGHT, duration: 250, useNativeDriver: true }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 2,
      onPanResponderGrant: () => {
        translateY.setOffset(lastTranslate.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const dy = gestureState.dy;
        if (dy > 0) {
          translateY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const { dy, vy } = gestureState;
        lastTranslate.current = 0;

        const shouldCloseByDistance = dy > DISMISS_THRESHOLD;
        const shouldCloseByVelocity = dy > MIN_DRAG_FOR_VELOCITY_DISMISS && vy > VELOCITY_THRESHOLD;

        if (shouldCloseByDistance || shouldCloseByVelocity) {
          Animated.timing(translateY, { toValue: MODAL_HEIGHT, duration: 200, useNativeDriver: true }).start(() => onClose());
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        }
      },
    })
  ).current;

  const animatedStyle = {
    transform: [{ translateY }],
  };

  const Content = scroll ? ScrollView : View;

  return (
    <ModalComponent visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <Animated.View style={[styles.content, animatedStyle as any]}>
          <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {scroll ? (
            <Content showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {children}
            </Content>
          ) : (
            children
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </ModalComponent>
  );
};

export default Modal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    maxHeight: '90%',
  },
  dragHandleArea: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
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
  },
});