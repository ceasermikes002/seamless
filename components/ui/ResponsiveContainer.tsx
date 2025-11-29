import React from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { maxContentWidth, spacing } from '@/constants/theme';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  maxWidth?: number;
}

/**
 * Responsive container that centers content on web with max-width
 * and provides proper padding for mobile and desktop
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  maxWidth = maxContentWidth,
  ...props
}) => {
  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'web' && {
          maxWidth,
          width: '100%',
          alignSelf: 'center',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      paddingHorizontal: spacing.lg,
    }),
  },
});

