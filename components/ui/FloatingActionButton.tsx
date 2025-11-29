
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { IconSymbol, type IconSymbolName } from './icon-symbol';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: IconSymbolName;
  size?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'plus',
  size = 56
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );
    rotation.value = withSequence(
      withTiming(15, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[
        styles.fab,
        { width: size, height: size, borderRadius: size / 2 },
        animatedStyle
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <IconSymbol name={icon} size={24} color="#FFFFFF" />
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});

