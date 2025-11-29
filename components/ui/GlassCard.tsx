import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, elevation } from '@/constants/theme';

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
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  // Use theme colors for glass effect
  const isDark = tint === 'dark' || (tint === 'default');

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
      <View style={[styles.content, isDark ? styles.darkContent : styles.lightContent]}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation.md,
  },
  lightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: colors.shadow,
  },
  darkContainer: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
  },
  content: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  lightContent: {
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  darkContent: {
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
