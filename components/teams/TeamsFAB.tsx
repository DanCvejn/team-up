import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TeamsFABProps {
  onCreatePress: () => void;
  onJoinPress: () => void;
}

export function TeamsFAB({ onCreatePress, onJoinPress }: TeamsFABProps) {
  const [fabOpen, setFabOpen] = useState(false);
  const fabRotation = useState(new Animated.Value(0))[0];
  const fabScale = useState(new Animated.Value(0))[0];

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(fabRotation, {
        toValue,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.spring(fabScale, {
        toValue,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();

    setFabOpen(!fabOpen);
  };

  const handleCreatePress = () => {
    toggleFab();
    setTimeout(onCreatePress, 200);
  };

  const handleJoinPress = () => {
    toggleFab();
    setTimeout(onJoinPress, 200);
  };

  const rotate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {fabOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleFab}
        />
      )}

      <View style={styles.container}>
        {/* Join Button */}
        <Animated.View
          style={[
            styles.secondary,
            {
              transform: [
                { scale: fabScale },
                { translateY: fabScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0],
                })},
              ],
              opacity: fabScale,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.fab, styles.fabSecondary]}
            onPress={handleJoinPress}
            activeOpacity={0.8}
          >
            <Ionicons name="enter" size={24} color="#007AFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Create Button */}
        <Animated.View
          style={[
            styles.secondary,
            {
              transform: [
                { scale: fabScale },
                { translateY: fabScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0],
                })},
              ],
              opacity: fabScale,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.fab, styles.fabSecondary]}
            onPress={handleCreatePress}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={24} color="#007AFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={toggleFab}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  secondary: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});