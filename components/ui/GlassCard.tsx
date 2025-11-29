import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  pressable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  intensity = 80,
  tint = 'default',
  pressable = false,
  ...props 
}) => {
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <Animated.View 
      style={[
        styles.container, 
        isDark ? styles.darkContainer : styles.lightContainer,
        animatedStyle,
        style
      ]} 
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      {...props}
    >
      <View style={[styles.blurView, isDark ? styles.darkBlur : styles.lightBlur]}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  lightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#8B5CF6',
  },
  darkContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
  },
  blurView: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  lightBlur: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  darkBlur: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

