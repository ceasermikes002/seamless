import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import { colors, spacing, typography, radius, elevation } from '@/constants/theme';
import { IconSymbol, type IconSymbolName } from './icon-symbol';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onHide,
  duration = type === 'error' ? 2000 : 1500,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        translateY.value = withSpring(-100, { damping: 15, stiffness: 300 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success + '20',
          borderColor: colors.success,
          icon: 'checkmark.circle.fill' as IconSymbolName,
          iconColor: colors.success,
        };
      case 'error':
        return {
          backgroundColor: colors.error + '20',
          borderColor: colors.error,
          icon: 'exclamationmark.triangle.fill' as IconSymbolName,
          iconColor: colors.error,
        };
      case 'info':
        return {
          backgroundColor: colors.info + '20',
          borderColor: colors.info,
          icon: 'info.circle.fill' as IconSymbolName,
          iconColor: colors.info,
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      entering={FadeInDown.springify()}
      exiting={FadeOutUp.springify()}
    >
      <View style={[styles.toast, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
        <IconSymbol name={config.icon} size={20} color={config.iconColor} />
        <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 80 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    minWidth: 200,
    maxWidth: '90%',
    ...elevation.lg,
    shadowColor: colors.shadow,
  },
  message: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

